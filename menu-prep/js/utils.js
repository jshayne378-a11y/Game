/* ===========================================================
   DRIFT Menu Prep — small shared helpers for games
   =========================================================== */

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function sampleN(arr, n) {
  return shuffle(arr).slice(0, Math.min(n, arr.length));
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fmtMoney(v) {
  return '$' + (Math.round(v * 100) / 100).toString();
}

function sectionColorFor(sectionId) {
  var s = MENU_SECTIONS.filter(function (x) { return x.id === sectionId; })[0];
  return s ? s.color : '#c98a3d';
}

function sectionPicker(onChange, currentValue) {
  var options = [{ id: 'all', title: 'All Sections' }].concat(
    MENU_SECTIONS.map(function (s) { return { id: s.id, title: s.title }; })
  );
  var wrap = document.createElement('div');
  wrap.className = 'section-picker';
  options.forEach(function (opt) {
    var btn = document.createElement('button');
    btn.className = 'picker-btn' + (opt.id === (currentValue || 'all') ? ' active' : '');
    btn.textContent = opt.title;
    btn.addEventListener('click', function () {
      Array.prototype.forEach.call(wrap.children, function (c) { c.classList.remove('active'); });
      btn.classList.add('active');
      onChange(opt.id);
    });
    wrap.appendChild(btn);
  });
  return wrap;
}
