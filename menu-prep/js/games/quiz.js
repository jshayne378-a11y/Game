/* ===========================================================
   Game: Menu Quiz — multiple choice
   =========================================================== */

GAMES.quiz = {
  title: 'Menu Quiz',
  icon: '❓',
  blurb: 'Timed multiple-choice questions on prices, sections, and descriptions.',
  render: function (container) {
    var QUESTION_COUNT = 10;
    var state = { sectionId: 'all', questions: [], qIndex: 0, score: 0, missed: [], answered: false };

    function buildQuestions(sectionId) {
      var pool = getItemsBySection(sectionId);
      var allSections = MENU_SECTIONS.map(function (s) { return s.title; });
      var multiSection = sectionId === 'all';
      var picks = sampleN(pool, Math.min(QUESTION_COUNT, pool.length));

      return picks.map(function (item) {
        var types = ['price', 'desc'];
        if (multiSection) types.push('section');
        var type = types[randInt(0, types.length - 1)];

        if (type === 'price') {
          var distractorPool = pool.filter(function (i) { return i.id !== item.id; });
          var wrongPrices = sampleN(distractorPool, 3).map(function (i) { return i.price; });
          var options = shuffle(['$' + item.price].concat(wrongPrices.map(function (p) { return '$' + p; })));
          return {
            prompt: 'What is the price of "' + item.name + '"?',
            options: options,
            correct: '$' + item.price,
            item: item
          };
        }

        if (type === 'section') {
          var wrongSections = shuffle(allSections.filter(function (s) { return s !== item.sectionTitle; })).slice(0, 3);
          var opts = shuffle([item.sectionTitle].concat(wrongSections));
          return {
            prompt: 'Which menu section is "' + item.name + '" on?',
            options: opts,
            correct: item.sectionTitle,
            item: item
          };
        }

        // desc
        var distractors = sampleN(pool.filter(function (i) { return i.id !== item.id && i.desc; }), 3);
        var descOptions = shuffle([item].concat(distractors)).map(function (i) { return i.desc || '(no description)'; });
        return {
          prompt: 'Which description matches "' + item.name + '"?',
          options: descOptions,
          correct: item.desc || '(no description)',
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
        el('p', {}, ['10 questions drawn from the chosen section. Mix of price, section, and description questions.']),
        el('button', { class: 'btn btn-primary', onclick: function () { start(state.sectionId); } }, ['Start Quiz'])
      ]));
    }

    function drawQuestion() {
      container.innerHTML = '';
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
          }, 900);
        });
        optsWrap.appendChild(btn);
      });

      container.appendChild(progress);
      container.appendChild(promptEl);
      container.appendChild(optsWrap);
    }

    function drawResults() {
      container.innerHTML = '';
      recordScore('quiz', state.score);
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
