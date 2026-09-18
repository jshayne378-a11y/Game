/* ===========================================================
   Game: Memory Match — pair dish/drink names with prices
   =========================================================== */

GAMES.memory = {
  title: 'Memory Match',
  icon: '🧠',
  blurb: 'Flip cards to match each item with its price. Fewer moves, better score.',
  render: function (container) {
    var PAIR_COUNT = 6;
    var state = { sectionId: 'all', cards: [], flipped: [], matched: 0, moves: 0, seconds: 0, timer: null, locked: false };

    function stopTimer() {
      if (state.timer) { clearInterval(state.timer); state.timer = null; }
    }

    function start(sectionId) {
      stopTimer();
      state.sectionId = sectionId;
      var pool = getItemsBySection(sectionId).filter(function (i) { return i.name && i.price; });
      var picks = sampleN(pool, Math.min(PAIR_COUNT, pool.length));
      var cards = [];
      picks.forEach(function (item) {
        cards.push({ key: item.id, kind: 'name', label: item.name });
        cards.push({ key: item.id, kind: 'price', label: '$' + item.price });
      });
      state.cards = shuffle(cards);
      state.flipped = [];
      state.matched = 0;
      state.moves = 0;
      state.seconds = 0;
      state.locked = false;
      state.timer = setInterval(function () { state.seconds++; updateStatus(); }, 1000);
      window.addEventListener('hashchange', stopTimer, { once: true });
      drawBoard(picks.length);
    }

    var statusEl, boardEl;

    function updateStatus() {
      if (statusEl) statusEl.textContent = 'Moves: ' + state.moves + '   ·   Time: ' + state.seconds + 's   ·   Matched: ' + state.matched + '/' + (state.cards.length / 2);
    }

    function drawBoard(pairCount) {
      container.innerHTML = '';
      container.appendChild(sectionPicker(start, state.sectionId));
      statusEl = el('div', { class: 'memory-status' });
      updateStatus();
      container.appendChild(statusEl);

      boardEl = el('div', { class: 'memory-grid' });
      state.cards.forEach(function (card, idx) {
        var cardEl = el('button', { class: 'memory-card' }, [
          el('span', { class: 'memory-card-face memory-card-back' }, ['?']),
          el('span', { class: 'memory-card-face memory-card-front' }, [card.label])
        ]);
        cardEl.dataset.idx = idx;
        cardEl.addEventListener('click', function () { flipCard(idx, cardEl); });
        boardEl.appendChild(cardEl);
      });
      container.appendChild(boardEl);
    }

    function flipCard(idx, cardEl) {
      if (state.locked) return;
      if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;
      if (state.flipped.length === 2) return;

      cardEl.classList.add('flipped');
      state.flipped.push({ idx: idx, el: cardEl });

      if (state.flipped.length === 2) {
        state.moves++;
        updateStatus();
        var a = state.flipped[0], b = state.flipped[1];
        var cardA = state.cards[a.idx], cardB = state.cards[b.idx];
        if (cardA.key === cardB.key && cardA.kind !== cardB.kind) {
          a.el.classList.add('matched');
          b.el.classList.add('matched');
          state.matched++;
          state.flipped = [];
          updateStatus();
          if (state.matched === state.cards.length / 2) finish();
        } else {
          state.locked = true;
          setTimeout(function () {
            a.el.classList.remove('flipped');
            b.el.classList.remove('flipped');
            state.flipped = [];
            state.locked = false;
          }, 700);
        }
      }
    }

    function finish() {
      stopTimer();
      var score = Math.max(50, 1000 - state.moves * 20 - state.seconds * 2);
      recordScore('memory', score);
      var summary = el('div', { class: 'memory-finish' }, [
        el('h2', {}, ['All Matched! 🎉']),
        el('p', {}, ['Moves: ' + state.moves + '   ·   Time: ' + state.seconds + 's   ·   Score: ' + score]),
        el('button', { class: 'btn btn-primary', onclick: function () { start(state.sectionId); } }, ['Play Again'])
      ]);
      container.appendChild(summary);
    }

    start('all');
  }
};
