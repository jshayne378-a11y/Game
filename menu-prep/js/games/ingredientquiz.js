/* ===========================================================
   Game: Ingredient IQ — pick the matching ingredient sentence
   =========================================================== */

GAMES.ingredientquiz = {
  title: 'Ingredient IQ',
  icon: '🧾',
  blurb: 'See the dish name, pick the matching ingredient list from three choices.',
  render: function (container) {
    var QUESTION_COUNT = 10;
    var OPTION_COUNT = 3;
    var state = { sectionId: 'all-day', questions: [], qIndex: 0, score: 0, missed: [], answered: false };

    function buildQuestions(sectionId) {
      var pool = getItemsBySection(sectionId).filter(function (i) { return i.desc; });
      var picks = sampleN(pool, Math.min(QUESTION_COUNT, pool.length));

      return picks.map(function (item) {
        var distractorPool = pool.filter(function (i) { return i.id !== item.id; });
        var distractors = sampleN(distractorPool, Math.min(OPTION_COUNT - 1, distractorPool.length));
        var options = shuffle([item].concat(distractors)).map(function (i) { return i.desc; });
        return {
          prompt: 'Which ingredient list belongs to "' + item.name + '"?',
          options: options,
          correct: item.desc,
          item: item
        };
      });
    }

    function start(sectionId) {
      state.sectionId = sectionId;
      state.questions = buildQuestions(sectionId);
      state.qIndex = 0;
      state.score = 0;
      state.missed = [];
      state.answered = false;
      drawQuestion();
    }

    function drawIntro() {
      container.innerHTML = '';
      container.appendChild(sectionPicker(function (id) { state.sectionId = id; }, state.sectionId));
      container.appendChild(el('div', { class: 'quiz-intro' }, [
        el('p', {}, ['10 questions. See the dish, pick which of three ingredient lists is the real one.']),
        el('button', { class: 'btn btn-primary', onclick: function () { start(state.sectionId); } }, ['Start'])
      ]));
    }

    function drawQuestion() {
      container.innerHTML = '';
      if (!state.questions.length) { drawEmpty(); return; }
      if (state.qIndex >= state.questions.length) { drawResults(); return; }
      var q = state.questions[state.qIndex];
      state.answered = false;

      var progress = el('div', { class: 'quiz-progress' }, [
        'Question ' + (state.qIndex + 1) + ' / ' + state.questions.length + '   ·   Score: ' + state.score
      ]);
      var promptEl = el('h3', { class: 'quiz-prompt' }, [q.prompt]);
      var optsWrap = el('div', { class: 'quiz-options' });

      q.options.forEach(function (opt) {
        var btn = el('button', { class: 'quiz-opt' }, [opt]);
        btn.addEventListener('click', function () {
          if (state.answered) return;
          state.answered = true;
          var correct = opt === q.correct;
          if (correct) { state.score += 10; btn.classList.add('correct'); }
          else {
            btn.classList.add('wrong');
            state.missed.push(q.item);
            Array.prototype.forEach.call(optsWrap.children, function (b) {
              if (b.textContent === q.correct) b.classList.add('correct');
            });
          }
          setTimeout(function () {
            state.qIndex++;
            drawQuestion();
          }, 1100);
        });
        optsWrap.appendChild(btn);
      });

      container.appendChild(progress);
      container.appendChild(promptEl);
      container.appendChild(optsWrap);
    }

    function drawEmpty() {
      container.innerHTML = '';
      container.appendChild(sectionPicker(function (id) { state.sectionId = id; }, state.sectionId));
      container.appendChild(el('div', { class: 'quiz-intro' }, [
        el('p', {}, ['Not enough items with ingredient descriptions in this section. Try another section.'])
      ]));
    }

    function drawResults() {
      container.innerHTML = '';
      recordScore('ingredientquiz', state.score);
      var total = state.questions.length * 10;
      container.appendChild(el('div', { class: 'quiz-results' }, [
        el('h2', {}, ['Score: ' + state.score + ' / ' + total]),
        el('p', {}, [state.missed.length ? 'Review these before your next attempt:' : 'Perfect round!'])
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
