/* ===========================================================
   DRIFT Menu Prep — app shell & router
   =========================================================== */

var GAMES = {}; // populated by js/games/*.js — { id: { title, icon, blurb, render(container) } }

var root = document.getElementById('app-root');

function el(tag, attrs, children) {
  var node = document.createElement(tag);
  attrs = attrs || {};
  Object.keys(attrs).forEach(function (k) {
    if (k === 'class') node.className = attrs[k];
    else if (k === 'html') node.innerHTML = attrs[k];
    else if (k.indexOf('on') === 0 && typeof attrs[k] === 'function') node.addEventListener(k.slice(2), attrs[k]);
    else node.setAttribute(k, attrs[k]);
  });
  (children || []).forEach(function (c) {
    if (c == null) return;
    var isNode = c && typeof c === 'object' && typeof c.nodeType === 'number';
    node.appendChild(isNode ? c : document.createTextNode(String(c)));
  });
  return node;
}

function tagChips(tags) {
  return (tags || []).map(function (t) {
    return el('span', { class: 'chip chip-' + t.toLowerCase() }, [t]);
  });
}

function clearRoot() {
  root.innerHTML = '';
}

function topNav(active) {
  var links = [
    { id: 'home', label: 'Home' },
    { id: 'study', label: 'Study Sections' },
    { id: 'games', label: 'Mini-Games' },
    { id: 'progress', label: 'Progress' }
  ];
  return el('nav', { class: 'top-nav' }, links.map(function (l) {
    return el('a', {
      href: '#/' + l.id,
      class: 'top-nav-link' + (active === l.id ? ' active' : '')
    }, [l.label]);
  }));
}

function header() {
  return el('header', { class: 'app-header' }, [
    el('div', { class: 'app-header-inner' }, [
      el('a', { href: '#/home', class: 'brand' }, [
        el('span', { class: 'brand-title' }, ['DRIFT']),
        el('span', { class: 'brand-sub' }, ['Menu Prep'])
      ]),
      topNav(currentRoute().view)
    ])
  ]);
}

/* ------------------ ROUTER ------------------ */

function currentRoute() {
  var hash = location.hash.replace(/^#\/?/, '');
  var parts = hash.split('/').filter(Boolean);
  return { view: parts[0] || 'home', param: parts[1] || null };
}

function navigate(path) {
  location.hash = path;
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', render);

function render() {
  var route = currentRoute();
  clearRoot();
  root.appendChild(header());

  var main = el('main', { class: 'app-main' });
  root.appendChild(main);

  switch (route.view) {
    case 'study':
      route.param ? renderSectionDetail(main, route.param) : renderStudyHub(main);
      break;
    case 'games':
      renderGamesHub(main);
      break;
    case 'game':
      renderGameScreen(main, route.param);
      break;
    case 'progress':
      renderProgress(main);
      break;
    default:
      renderHome(main);
  }
  window.scrollTo(0, 0);
}

/* ------------------ HOME ------------------ */

function renderHome(main) {
  main.appendChild(el('section', { class: 'hero' }, [
    el('h1', {}, ['Learn the DRIFT Menu']),
    el('p', { class: 'hero-sub' }, ['Opal Sol · Clearwater Beach — study every section, then test yourself with mini-games built to get new team members menu-ready fast.']),
    el('div', { class: 'hero-actions' }, [
      el('a', { href: '#/study', class: 'btn btn-primary' }, ['Start Studying']),
      el('a', { href: '#/games', class: 'btn btn-ghost' }, ['Jump to Games'])
    ])
  ]));

  main.appendChild(el('section', { class: 'section-grid' }, MENU_SECTIONS.map(function (s) {
    var itemCount = getItemsBySection(s.id).length;
    return el('a', { href: '#/study/' + s.id, class: 'section-card', style: 'border-top-color:' + s.color }, [
      el('h3', {}, [s.title]),
      el('p', {}, [s.blurb]),
      el('span', { class: 'section-count' }, [itemCount + ' items'])
    ]);
  })));

  main.appendChild(el('section', { class: 'panel' }, [
    el('h2', {}, ['Five Ways to Practice']),
    el('div', { class: 'game-preview-grid' }, Object.keys(GAMES).map(function (id) {
      var g = GAMES[id];
      return el('a', { href: '#/game/' + id, class: 'game-preview-card' }, [
        el('div', { class: 'game-icon' }, [g.icon]),
        el('h4', {}, [g.title]),
        el('p', {}, [g.blurb])
      ]);
    }))
  ]));
}

/* ------------------ STUDY HUB ------------------ */

function renderStudyHub(main) {
  main.appendChild(el('section', { class: 'page-head' }, [
    el('h1', {}, ['Study Sections']),
    el('p', {}, ['Browse each part of the menu before testing yourself in the games.'])
  ]));
  main.appendChild(el('section', { class: 'section-grid' }, MENU_SECTIONS.map(function (s) {
    var itemCount = getItemsBySection(s.id).length;
    return el('a', { href: '#/study/' + s.id, class: 'section-card', style: 'border-top-color:' + s.color }, [
      el('h3', {}, [s.title]),
      el('p', {}, [s.blurb]),
      el('span', { class: 'section-count' }, [itemCount + ' items'])
    ]);
  })));
}

function renderSectionDetail(main, sectionId) {
  var section = MENU_SECTIONS.filter(function (s) { return s.id === sectionId; })[0];
  if (!section) { renderStudyHub(main); return; }

  main.appendChild(el('section', { class: 'page-head' }, [
    el('a', { href: '#/study', class: 'back-link' }, ['← All Sections']),
    el('h1', { style: 'color:' + section.color }, [section.title]),
    el('p', {}, [section.blurb])
  ]));

  section.categories.forEach(function (cat) {
    var catBlock = el('div', { class: 'category-block' }, [
      el('h3', {}, [cat.title]),
      cat.note ? el('p', { class: 'category-note' }, [cat.note]) : null,
      el('div', { class: 'item-list' }, cat.items.map(function (item) {
        return el('div', { class: 'item-row' }, [
          el('div', { class: 'item-row-top' }, [
            el('span', { class: 'item-name' }, [item.name]),
            el('span', { class: 'item-price' }, ['$' + item.price]),
          ].concat(tagChips(item.tags))),
          item.desc ? el('div', { class: 'item-desc' }, [item.desc]) : null
        ]);
      }))
    ]);
    main.appendChild(catBlock);
  });
}

/* ------------------ GAMES HUB ------------------ */

function renderGamesHub(main) {
  main.appendChild(el('section', { class: 'page-head' }, [
    el('h1', {}, ['Mini-Games']),
    el('p', {}, ['Five ways to drill the DRIFT menu into memory.'])
  ]));
  main.appendChild(el('section', { class: 'game-preview-grid' }, Object.keys(GAMES).map(function (id) {
    var g = GAMES[id];
    var best = APP_STATE.bestScores[id];
    return el('a', { href: '#/game/' + id, class: 'game-preview-card' }, [
      el('div', { class: 'game-icon' }, [g.icon]),
      el('h4', {}, [g.title]),
      el('p', {}, [g.blurb]),
      best != null ? el('span', { class: 'best-score' }, ['Best: ' + best]) : null
    ]);
  })));
}

function renderGameScreen(main, gameId) {
  var g = GAMES[gameId];
  if (!g) { renderGamesHub(main); return; }
  main.appendChild(el('section', { class: 'page-head' }, [
    el('a', { href: '#/games', class: 'back-link' }, ['← All Games']),
    el('h1', {}, [g.icon + '  ' + g.title]),
    el('p', {}, [g.blurb])
  ]));
  var container = el('div', { class: 'game-container' });
  main.appendChild(container);
  g.render(container);
}

/* ------------------ PROGRESS ------------------ */

function renderProgress(main) {
  main.appendChild(el('section', { class: 'page-head' }, [
    el('h1', {}, ['Your Progress']),
    el('p', {}, ['Saved locally in this browser.'])
  ]));

  var total = MENU_ITEMS.length;
  var known = knownCount();
  main.appendChild(el('section', { class: 'panel' }, [
    el('h2', {}, ['Flashcards Known']),
    el('div', { class: 'progress-bar-outer' }, [
      el('div', { class: 'progress-bar-inner', style: 'width:' + Math.round(100 * known / total) + '%' })
    ]),
    el('p', {}, [known + ' of ' + total + ' items marked known'])
  ]));

  main.appendChild(el('section', { class: 'panel' }, [
    el('h2', {}, ['Best Scores']),
    el('div', { class: 'score-table' }, Object.keys(GAMES).map(function (id) {
      var g = GAMES[id];
      var best = APP_STATE.bestScores[id];
      var plays = APP_STATE.playCounts[id] || 0;
      return el('div', { class: 'score-row' }, [
        el('span', { class: 'score-game' }, [g.icon + ' ' + g.title]),
        el('span', {}, [best != null ? best : '—']),
        el('span', { class: 'score-plays' }, [plays + ' play' + (plays === 1 ? '' : 's')])
      ]);
    }))
  ]));

  main.appendChild(el('button', {
    class: 'btn btn-ghost danger', onclick: function () {
      if (confirm('Reset all saved progress on this device?')) {
        localStorage.removeItem(STORAGE_KEY);
        APP_STATE = loadState();
        render();
      }
    }
  }, ['Reset Progress']));
}
