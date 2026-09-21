/* ===========================================================
   Game: Ingredient Match — tap an ingredient, tap its dish
   =========================================================== */

GAMES.ingmatch = {
  title: 'Ingredient Match',
  icon: '🥕',
  blurb: 'Tap an ingredient, then tap the dish it belongs to. Shared ingredients can match more than one dish — either counts.',
  render: function (container) {
    var PAIR_COUNT = 6;
    var state = {
      sectionId: 'all-day', ingredients: [], dishes: [], itemsById: {},
      matchedItemIds: {}, matchedIngredientIdx: {}, selectedIdx: null,
      mistakes: 0, seconds: 0, timer: null, locked: false
    };
    var statusEl, totalPairs;

    function stopTimer() {
      if (state.timer) { clearInterval(state.timer); state.timer = null; }
    }

    function start(sectionId) {
      stopTimer();
      state.sectionId = sectionId;
      var pool = getItemsBySection(sectionId).filter(function (i) { return splitIngredients(i.desc).length > 0; });
      var picks = sampleN(pool, Math.min(PAIR_COUNT, pool.length));

      state.itemsById = {};
      picks.forEach(function (item) { state.itemsById[item.id] = item; });

      state.dishes = shuffle(picks.map(function (item) { return { id: item.id, name: item.name, el: null }; }));
      state.ingredients = shuffle(picks.map(function (item) {
        var phrases = splitIngredients(item.desc);
        return { text: phrases[randInt(0, phrases.length - 1)], itemId: item.id, el: null };
      }));

      state.matchedItemIds = {};
      state.matchedIngredientIdx = {};
      state.selectedIdx = null;
      state.mistakes = 0;
      state.seconds = 0;
      state.locked = false;

      if (picks.length === 0) { drawEmpty(); return; }

      state.timer = setInterval(function () { state.seconds++; updateStatus(); }, 1000);
      window.addEventListener('hashchange', stopTimer, { once: true });
      drawBoard();
    }

    function updateStatus() {
      if (!statusEl) return;
      var matchedCount = Object.keys(state.matchedItemIds).length;
      statusEl.textContent = 'Matched: ' + matchedCount + '/' + totalPairs + '   ·   Mistakes: ' + state.mistakes + '   ·   Time: ' + state.seconds + 's';
    }

    function drawEmpty() {
      container.innerHTML = '';
      container.appendChild(sectionPicker(start, state.sectionId));
      container.appendChild(el('div', { class: 'quiz-intro' }, [
        el('p', {}, ['No items with ingredient descriptions in this section. Try another section.'])
      ]));
    }

    function drawBoard() {
      container.innerHTML = '';
      totalPairs = state.dishes.length;
      container.appendChild(sectionPicker(start, state.sectionId));
      statusEl = el('div', { class: 'memory-status' });
      updateStatus();
      container.appendChild(statusEl);

      var board = el('div', { class: 'ingmatch-board' });
      var ingCol = el('div', { class: 'ingmatch-col' }, [el('h4', { class: 'ingmatch-col-title' }, ['Ingredients'])]);
      var dishCol = el('div', { class: 'ingmatch-col' }, [el('h4', { class: 'ingmatch-col-title' }, ['Dishes'])]);

      state.ingredients.forEach(function (ing, idx) {
        var btn = el('button', { class: 'ingmatch-chip' }, [ing.text]);
        btn.addEventListener('click', function () { selectIngredient(idx); });
        ing.el = btn;
        ingCol.appendChild(btn);
      });

      state.dishes.forEach(function (dish) {
        var btn = el('button', { class: 'ingmatch-chip' }, [dish.name]);
        btn.addEventListener('click', function () { selectDish(dish.id); });
        dish.el = btn;
        dishCol.appendChild(btn);
      });

      board.appendChild(ingCol);
      board.appendChild(dishCol);
      container.appendChild(board);
    }

    function selectIngredient(idx) {
      if (state.locked || state.matchedIngredientIdx[idx]) return;
      var ing = state.ingredients[idx];
      if (state.selectedIdx === idx) {
        ing.el.classList.remove('selected');
        state.selectedIdx = null;
        return;
      }
      state.ingredients.forEach(function (i) { if (i.el) i.el.classList.remove('selected'); });
      ing.el.classList.add('selected');
      state.selectedIdx = idx;
    }

    function selectDish(itemId) {
      if (state.locked || state.matchedItemIds[itemId] || state.selectedIdx == null) return;
      var ing = state.ingredients[state.selectedIdx];
      var dish = state.dishes.filter(function (d) { return d.id === itemId; })[0];
      var item = state.itemsById[itemId];
      var correct = item.desc && item.desc.toLowerCase().indexOf(ing.text.toLowerCase()) !== -1;

      if (correct) {
        ing.el.classList.remove('selected');
        ing.el.classList.add('matched');
        dish.el.classList.add('matched');
        state.matchedIngredientIdx[state.selectedIdx] = true;
        state.matchedItemIds[itemId] = true;
        state.selectedIdx = null;
        updateStatus();
        if (Object.keys(state.matchedItemIds).length === totalPairs) finish();
        return;
      }

      state.locked = true;
      state.mistakes++;
      ing.el.classList.add('wrong');
      dish.el.classList.add('wrong');
      updateStatus();
      setTimeout(function () {
        ing.el.classList.remove('wrong', 'selected');
        dish.el.classList.remove('wrong');
        state.selectedIdx = null;
        state.locked = false;
      }, 600);
    }

    function finish() {
      stopTimer();
      var score = Math.max(50, 1000 - state.mistakes * 40 - state.seconds * 2);
      recordScore('ingmatch', score);
      container.appendChild(el('div', { class: 'memory-finish' }, [
        el('h2', {}, ['All Matched! 🎉']),
        el('p', {}, ['Mistakes: ' + state.mistakes + '   ·   Time: ' + state.seconds + 's   ·   Score: ' + score]),
        el('button', { class: 'btn btn-primary', onclick: function () { start(state.sectionId); } }, ['Play Again'])
      ]));
    }

    start(state.sectionId);
  }
};
