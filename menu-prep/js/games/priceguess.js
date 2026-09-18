/* ===========================================================
   Game: Price Check — guess the price, closer is better
   =========================================================== */

GAMES.priceguess = {
  title: 'Price Check',
  icon: '💲',
  blurb: 'See the dish or drink, guess the price. Closer guesses score more points.',
  render: function (container) {
    var ROUNDS = 10;
    var state = { sectionId: 'all', items: [], round: 0, total: 0, awaitingNext: false };

    function start(sectionId) {
      state.sectionId = sectionId;
      var pool = getItemsBySection(sectionId).filter(function (i) { return !isNaN(i.value); });
      state.items = sampleN(pool, Math.min(ROUNDS, pool.length));
      state.round = 0;
      state.total = 0;
      state.awaitingNext = false;
      drawRound();
    }

    function drawRound() {
      container.innerHTML = '';
      if (state.round >= state.items.length) { drawResults(); return; }
      var item = state.items[state.round];

      var header = el('div', { class: 'quiz-progress' }, [
        'Round ' + (state.round + 1) + ' / ' + state.items.length + '   ·   Total: ' + state.total
      ]);
      var card = el('div', { class: 'priceguess-card' }, [
        el('div', { class: 'priceguess-tags' }, tagChips(item.tags)),
        el('h3', {}, [item.name]),
        el('p', {}, [item.desc || '']),
        el('p', { class: 'priceguess-cat' }, [item.sectionTitle + ' · ' + item.categoryTitle])
      ]);

      var input = el('input', { type: 'number', min: '0', step: '0.5', class: 'priceguess-input', placeholder: '$' });
      var feedback = el('div', { class: 'priceguess-feedback' });
      var submitBtn = el('button', { class: 'btn btn-primary' }, ['Submit Guess']);

      submitBtn.addEventListener('click', function () {
        if (state.awaitingNext) { state.round++; drawRound(); return; }
        var guess = parseFloat(input.value);
        if (isNaN(guess)) { input.focus(); return; }
        var actual = item.value;
        var errPct = Math.abs(guess - actual) / actual * 100;
        var points = Math.max(0, Math.round(100 - errPct));
        state.total += points;
        state.awaitingNext = true;
        input.disabled = true;
        feedback.className = 'priceguess-feedback shown';
        feedback.textContent = 'Actual price: $' + item.price + '  ·  You scored ' + points + ' points';
        submitBtn.textContent = state.round + 1 >= state.items.length ? 'See Results' : 'Next Round →';
        header.textContent = 'Round ' + (state.round + 1) + ' / ' + state.items.length + '   ·   Total: ' + state.total;
      });

      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') submitBtn.click();
      });

      container.appendChild(header);
      container.appendChild(card);
      container.appendChild(input);
      container.appendChild(submitBtn);
      container.appendChild(feedback);
      input.focus();
    }

    function drawResults() {
      container.innerHTML = '';
      recordScore('priceguess', state.total);
      var avg = Math.round(state.total / state.items.length);
      container.appendChild(el('div', { class: 'quiz-results' }, [
        el('h2', {}, ['Total Score: ' + state.total]),
        el('p', {}, ['Average ' + avg + ' / 100 per round across ' + state.items.length + ' items.']),
        el('button', { class: 'btn btn-primary', onclick: function () { drawIntro(); } }, ['Play Again'])
      ]));
    }

    function drawIntro() {
      container.innerHTML = '';
      container.appendChild(sectionPicker(function (id) { state.sectionId = id; }, state.sectionId));
      container.appendChild(el('div', { class: 'quiz-intro' }, [
        el('p', {}, ['10 rounds. Scoring is based on percentage error, so it is fair across cheap apps and pricey bottles alike.']),
        el('button', { class: 'btn btn-primary', onclick: function () { start(state.sectionId); } }, ['Start'])
      ]));
    }

    drawIntro();
  }
};
