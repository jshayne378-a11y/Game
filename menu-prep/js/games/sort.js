/* ===========================================================
   Game: Category Sort — where does this item belong?
   =========================================================== */

GAMES.sort = {
  title: 'Category Sort',
  icon: '🗃️',
  blurb: 'Sort dishes and drinks into the right menu section or category, fast, before you run out of rounds.',
  render: function (container) {
    var ROUNDS = 15;
    var state = { mode: 'section', sectionId: MENU_SECTIONS[0].id, round: 0, score: 0, streak: 0, bestStreak: 0, pool: [], locked: false };

    function modeToggle() {
      var wrap = el('div', { class: 'section-picker' });
      ['section', 'category'].forEach(function (m) {
        var label = m === 'section' ? 'Sort by Section' : 'Sort by Category';
        var btn = el('button', { class: 'picker-btn' + (state.mode === m ? ' active' : '') }, [label]);
        btn.addEventListener('click', function () { state.mode = m; drawIntro(); });
        wrap.appendChild(btn);
      });
      return wrap;
    }

    function drawIntro() {
      container.innerHTML = '';
      container.appendChild(modeToggle());
      if (state.mode === 'category') {
        container.appendChild(sectionPicker(function (id) {
          if (id !== 'all') { state.sectionId = id; }
        }, state.sectionId));
      }
      container.appendChild(el('div', { class: 'quiz-intro' }, [
        el('p', {}, [state.mode === 'section'
          ? 'You will see an item and four possible menu sections. Pick the right one before the streak breaks.'
          : 'You will see an item from "' + (MENU_SECTIONS.filter(function (s) { return s.id === state.sectionId; })[0] || {}).title + '" and its categories. Pick the right category.']),
        el('button', { class: 'btn btn-primary', onclick: start }, ['Start'])
      ]));
    }

    function start() {
      state.round = 0;
      state.score = 0;
      state.streak = 0;
      state.bestStreak = 0;
      state.locked = false;
      state.pool = state.mode === 'section' ? MENU_ITEMS.slice() : getItemsBySection(state.sectionId);
      drawRound();
    }

    function drawRound() {
      container.innerHTML = '';
      if (state.round >= ROUNDS || !state.pool.length) { drawResults(); return; }
      var item = state.pool[randInt(0, state.pool.length - 1)];
      state.locked = false;

      var correct, options;
      if (state.mode === 'section') {
        correct = item.sectionTitle;
        var otherSections = shuffle(MENU_SECTIONS.map(function (s) { return s.title; }).filter(function (t) { return t !== correct; })).slice(0, 3);
        options = shuffle([correct].concat(otherSections));
      } else {
        correct = item.categoryTitle;
        var section = MENU_SECTIONS.filter(function (s) { return s.id === state.sectionId; })[0];
        var cats = section.categories.map(function (c) { return c.title; });
        var otherCats = shuffle(cats.filter(function (t) { return t !== correct; })).slice(0, 3);
        options = shuffle([correct].concat(otherCats));
      }

      var header = el('div', { class: 'quiz-progress' }, [
        'Round ' + (state.round + 1) + ' / ' + ROUNDS + '   ·   Score: ' + state.score + '   ·   Streak: ' + state.streak
      ]);
      var promptEl = el('h3', { class: 'quiz-prompt' }, ['Where does "' + item.name + '" ' + (item.price ? '($' + item.price + ') ' : '') + 'belong?']);
      var optsWrap = el('div', { class: 'quiz-options' });

      options.forEach(function (opt) {
        var btn = el('button', { class: 'quiz-opt' }, [opt]);
        btn.addEventListener('click', function () {
          if (state.locked) return;
          state.locked = true;
          var isCorrect = opt === correct;
          if (isCorrect) {
            btn.classList.add('correct');
            state.streak++;
            state.bestStreak = Math.max(state.bestStreak, state.streak);
            state.score += 10 + Math.min(state.streak * 2, 20);
          } else {
            btn.classList.add('wrong');
            state.streak = 0;
            Array.prototype.forEach.call(optsWrap.children, function (b) {
              if (b.textContent === correct) b.classList.add('correct');
            });
          }
          setTimeout(function () {
            state.round++;
            drawRound();
          }, 700);
        });
        optsWrap.appendChild(btn);
      });

      container.appendChild(header);
      container.appendChild(promptEl);
      container.appendChild(optsWrap);
    }

    function drawResults() {
      container.innerHTML = '';
      recordScore('sort', state.score);
      container.appendChild(el('div', { class: 'quiz-results' }, [
        el('h2', {}, ['Final Score: ' + state.score]),
        el('p', {}, ['Best streak: ' + state.bestStreak]),
        el('button', { class: 'btn btn-primary', onclick: drawIntro }, ['Play Again'])
      ]));
    }

    drawIntro();
  }
};
