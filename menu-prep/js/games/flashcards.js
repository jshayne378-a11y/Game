/* ===========================================================
   Game: Flashcards — study mode
   =========================================================== */

GAMES.flashcards = {
  title: 'Flashcards',
  icon: '🗂️',
  blurb: 'Flip through every dish and drink — name on the front, price & description on the back.',
  render: function (container) {
    var state = { sectionId: 'all', pool: [], index: 0, flipped: false };

    function setPool(sectionId) {
      state.sectionId = sectionId;
      state.pool = shuffle(getItemsBySection(sectionId));
      state.index = 0;
      state.flipped = false;
      draw();
    }

    function next() {
      state.flipped = false;
      state.index = (state.index + 1) % state.pool.length;
      draw();
    }
    function prev() {
      state.flipped = false;
      state.index = (state.index - 1 + state.pool.length) % state.pool.length;
      draw();
    }

    function draw() {
      container.innerHTML = '';
      container.appendChild(sectionPicker(setPool, state.sectionId));

      if (!state.pool.length) {
        container.appendChild(el('p', {}, ['No items in this section.']));
        return;
      }

      var item = state.pool[state.index];
      var isKnown = !!APP_STATE.known[item.id];

      var meta = el('div', { class: 'flash-meta' }, [
        (state.index + 1) + ' / ' + state.pool.length + '  ·  ' + item.sectionTitle
      ]);

      var card = el('div', { class: 'flash-card' + (state.flipped ? ' flipped' : '') });
      var front = el('div', { class: 'flash-face flash-front' }, [
        el('div', { class: 'flash-tags' }, tagChips(item.tags)),
        el('div', { class: 'flash-name' }, [item.name]),
        el('div', { class: 'flash-hint' }, ['Tap to reveal price & description'])
      ]);
      var back = el('div', { class: 'flash-face flash-back' }, [
        el('div', { class: 'flash-price' }, ['$' + item.price]),
        el('div', { class: 'flash-desc' }, [item.desc || '(no description)']),
        el('div', { class: 'flash-cat' }, [item.categoryTitle])
      ]);
      card.appendChild(front);
      card.appendChild(back);
      card.addEventListener('click', function () {
        state.flipped = !state.flipped;
        draw();
      });

      var controls = el('div', { class: 'flash-controls' }, [
        el('button', { class: 'btn btn-ghost', onclick: prev }, ['← Prev']),
        el('button', {
          class: 'btn ' + (isKnown ? 'btn-primary' : 'btn-ghost'),
          onclick: function () {
            markKnown(item.id, !isKnown);
            draw();
          }
        }, [isKnown ? '✓ Known' : 'Mark as Known']),
        el('button', { class: 'btn btn-ghost', onclick: next }, ['Next →'])
      ]);

      container.appendChild(meta);
      container.appendChild(card);
      container.appendChild(controls);
    }

    setPool('all');
  }
};
