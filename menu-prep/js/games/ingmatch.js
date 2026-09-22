/* ===========================================================
   Game: Ingredient Match — see the dish, tap every ingredient
   bubble that belongs to it, then submit
   =========================================================== */

GAMES.ingmatch = {
  title: 'Ingredient Match',
  icon: '🥕',
  blurb: 'See the dish, tap every ingredient bubble that belongs to it, then submit. Look-alike ingredients from other dishes are mixed in.',
  render: function (container) {
    var ROUNDS = 8;
    var state = { sectionId: 'all-day', rounds: [], rIndex: 0, score: 0, missed: [], submitted: false };

    function buildRounds(sectionId) {
      var pool = getItemsBySection(sectionId).filter(function (i) { return splitIngredients(i.desc).length > 0; });
      var picks = sampleN(pool, Math.min(ROUNDS, pool.length));

      var allPhrases = [];
      var seenPhrase = {};
      pool.forEach(function (i) {
        splitIngredients(i.desc).forEach(function (p) {
          var key = p.toLowerCase();
          if (!seenPhrase[key]) { seenPhrase[key] = true; allPhrases.push(p); }
        });
      });

      return picks.map(function (item) {
        return { item: item, bubbles: shuffle(allPhrases) };
      });
    }

    function start(sectionId) {
      state.sectionId = sectionId;
      state.rounds = buildRounds(sectionId);
      state.rIndex = 0;
      state.score = 0;
      state.missed = [];
      drawRound();
    }

    function drawIntro() {
      container.innerHTML = '';
      container.appendChild(sectionPicker(function (id) { state.sectionId = id; }, state.sectionId));
      container.appendChild(el('div', { class: 'quiz-intro' }, [
        el('p', {}, [ROUNDS + ' rounds. See the dish, tap every ingredient bubble that actually belongs to it (there may be one, or several), then submit.']),
        el('button', { class: 'btn btn-primary', onclick: function () { start(state.sectionId); } }, ['Start'])
      ]));
    }

    function drawEmpty() {
      container.innerHTML = '';
      container.appendChild(sectionPicker(function (id) { state.sectionId = id; }, state.sectionId));
      container.appendChild(el('div', { class: 'quiz-intro' }, [
        el('p', {}, ['No items with ingredient descriptions in this section. Try another section.'])
      ]));
    }

    function drawRound() {
      container.innerHTML = '';
      if (!state.rounds.length) { drawEmpty(); return; }
      if (state.rIndex >= state.rounds.length) { drawResults(); return; }
      var round = state.rounds[state.rIndex];
      var item = round.item;
      state.submitted = false;
      var selected = {};

      var header = el('div', { class: 'quiz-progress' }, [
        'Round ' + (state.rIndex + 1) + ' / ' + state.rounds.length + '   ·   Score: ' + state.score
      ]);
      var card = el('div', { class: 'priceguess-card' }, [
        el('div', { class: 'priceguess-tags' }, tagChips(item.tags)),
        el('h3', {}, [item.name]),
        el('p', { class: 'priceguess-cat' }, [item.sectionTitle + ' · ' + item.categoryTitle])
      ]);
      var instruction = el('p', { class: 'ingmatch-instruction' }, ['Tap every ingredient that belongs to this dish.']);

      var bubbleWrap = el('div', { class: 'ingmatch-bubbles' });
      var bubbleEls = round.bubbles.map(function (text) {
        var btn = el('button', { class: 'ingmatch-bubble' }, [text]);
        btn.addEventListener('click', function () {
          if (state.submitted) return;
          if (selected[text]) { delete selected[text]; btn.classList.remove('selected'); }
          else { selected[text] = true; btn.classList.add('selected'); }
        });
        bubbleWrap.appendChild(btn);
        return { text: text, el: btn };
      });

      var feedback = el('div', { class: 'priceguess-feedback' });
      var actionBtn = el('button', { class: 'btn btn-primary' }, ['Submit']);

      actionBtn.addEventListener('click', function () {
        if (state.submitted) { state.rIndex++; drawRound(); return; }
        state.submitted = true;
        var descLower = item.desc.toLowerCase();
        var correctSelected = 0, wrongSelected = 0, missedCorrect = 0;

        bubbleEls.forEach(function (b) {
          var isCorrect = descLower.indexOf(b.text.toLowerCase()) !== -1;
          var isSelected = !!selected[b.text];
          if (isSelected && isCorrect) { b.el.classList.add('correct'); correctSelected++; }
          else if (isSelected && !isCorrect) { b.el.classList.add('wrong'); wrongSelected++; }
          else if (!isSelected && isCorrect) { b.el.classList.add('missed'); missedCorrect++; }
        });

        var roundScore = Math.max(0, correctSelected * 10 - wrongSelected * 5 - missedCorrect * 5);
        state.score += roundScore;
        var perfect = wrongSelected === 0 && missedCorrect === 0;
        if (!perfect) state.missed.push(item);

        feedback.className = 'priceguess-feedback shown';
        feedback.textContent = perfect
          ? 'All correct! +' + roundScore + ' points'
          : correctSelected + ' correct, ' + wrongSelected + ' wrong pick' + (wrongSelected === 1 ? '' : 's') + ', ' + missedCorrect + ' missed. +' + roundScore + ' points';
        header.textContent = 'Round ' + (state.rIndex + 1) + ' / ' + state.rounds.length + '   ·   Score: ' + state.score;
        actionBtn.textContent = state.rIndex + 1 >= state.rounds.length ? 'See Results' : 'Next Round →';
      });

      container.appendChild(header);
      container.appendChild(card);
      container.appendChild(instruction);
      container.appendChild(bubbleWrap);
      container.appendChild(actionBtn);
      container.appendChild(feedback);
    }

    function drawResults() {
      container.innerHTML = '';
      recordScore('ingmatch', state.score);
      container.appendChild(el('div', { class: 'quiz-results' }, [
        el('h2', {}, ['Total Score: ' + state.score]),
        el('p', {}, [state.missed.length ? 'Review these before your next attempt:' : 'Perfect run across all rounds!'])
      ]));
      if (state.missed.length) {
        container.appendChild(el('div', { class: 'item-list' }, state.missed.map(function (item) {
          return el('div', { class: 'item-row' }, [
            el('div', { class: 'item-row-top' }, [
              el('span', { class: 'item-name' }, [item.name]),
              el('span', { class: 'item-price' }, ['$' + item.price])
            ]),
            el('div', { class: 'item-desc' }, [item.desc])
          ]);
        })));
      }
      container.appendChild(el('button', { class: 'btn btn-primary', onclick: drawIntro }, ['Play Again']));
    }

    drawIntro();
  }
};
