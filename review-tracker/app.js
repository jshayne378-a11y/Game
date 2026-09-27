'use strict';

/* ================================================================
   Drift · Opal Sol — Review Tracker
   All data lives in this browser (localStorage). Optional sync data
   is read from data/synced.json, produced by sync/sync.mjs.
   ================================================================ */

const STORAGE_KEY = 'drift-review-tracker-v1';

const DEFAULT_PLATFORMS = [
  { id: 'google', name: 'Google', color: '#4285f4', enabled: true,
    url: 'https://www.google.com/maps/search/?api=1&query=Drift+Opal+Sol+400+Coronado+Dr+Clearwater+FL',
    why: 'Most-read reviews for local restaurants; shows in Maps and Search.' },
  { id: 'yelp', name: 'Yelp', color: '#d32323', enabled: true,
    url: 'https://www.yelp.com/biz/drift-clearwater',
    why: 'Strong with locals and US diners.' },
  { id: 'tripadvisor', name: 'Tripadvisor', color: '#00aa6c', enabled: true,
    url: 'https://www.tripadvisor.com/Restaurant_Review-g34141-d32976337-Reviews-Drift_Opal_Sol-Clearwater_Florida.html',
    why: 'Key for a beach-resort restaurant: travelers plan meals here. Track your city ranking too.' },
  { id: 'opentable', name: 'OpenTable', color: '#c2185b', enabled: true,
    url: 'https://www.opentable.com/s?term=Drift%20Opal%20Sol%20Clearwater',
    why: 'Recommended: reviews come only from verified diners who booked, so they are a clean signal on service.' },
  { id: 'facebook', name: 'Facebook', color: '#6b4fd8', enabled: true,
    url: 'https://www.facebook.com/opalsolclearwater/reviews',
    why: 'Recommended: recommendations on the Opal Sol page, plus local group chatter (e.g. Clearwater dining groups).' },
  { id: 'wanderlog', name: 'Wanderlog', color: '#8a6f3a', enabled: false,
    url: 'https://wanderlog.com/place/details/14840167/drift-opal-sol-resort',
    why: 'Optional: trip-planning site that surfaces Drift to visitors; mostly re-summarizes Google reviews.' },
  { id: 'mindtrip', name: 'Mindtrip', color: '#e8883a', enabled: false,
    url: 'https://mindtrip.ai/restaurant/clearwater-florida/drift-opal-sol-resort/re-8VuT6g9p',
    why: 'Optional: AI travel planner that summarizes reviews — worth checking how Drift is described.' },
];

/* ---------------- State ---------------- */

function freshState() {
  return {
    platforms: DEFAULT_PLATFORMS.map(p => ({ ...p })),
    reviews: [],
    snapshots: [],
    keywords: [],
    lastSyncedAt: null,
  };
}

function loadState() {
  let s;
  try { s = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { s = null; }
  if (!s || !Array.isArray(s.platforms)) return freshState();
  // Add any default platforms introduced after the user first saved.
  for (const def of DEFAULT_PLATFORMS) {
    const existing = s.platforms.find(p => p.id === def.id);
    if (!existing) s.platforms.push({ ...def });
    else if (!existing.why) existing.why = def.why;
  }
  s.reviews ||= [];
  s.snapshots ||= [];
  s.keywords ||= [];
  return s;
}

let state = loadState();

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* cloud copy may still save */ }
  syncRemote();
}

/* ---------------- Cloud storage (when hosted on claude.ai) ----------------
   Each review, snapshot and keyword is one document; site settings are one
   more. Writes are diffed against the last saved copy so only changes go out. */

const remote = { db: null, shadow: new Map(), queue: Promise.resolve(), readOnly: false };

function stateDocs() {
  const m = new Map();
  for (const r of state.reviews) m.set(`reviews/${r.id}`, r);
  for (const x of state.snapshots) m.set(`snapshots/${x.id}`, x);
  for (const k of state.keywords) m.set(`keywords/${k.id}`, k);
  m.set('meta/settings', { platforms: state.platforms, lastSyncedAt: state.lastSyncedAt });
  return m;
}

function syncRemote() {
  if (!remote.db || remote.readOnly) return;
  const next = stateDocs();
  const writes = [];
  for (const [path, val] of next) {
    const json = JSON.stringify(val);
    if (remote.shadow.get(path) !== json) { writes.push([path, json]); remote.shadow.set(path, json); }
  }
  for (const path of [...remote.shadow.keys()]) {
    if (!next.has(path)) { writes.push([path, null]); remote.shadow.delete(path); }
  }
  if (!writes.length) return;
  setSaveStatus('saving');
  remote.queue = remote.queue.then(async () => {
    for (const [path, json] of writes) {
      try {
        const ref = remote.db.doc(path);
        await (json == null ? ref.delete() : ref.set(JSON.parse(json)));
      } catch (e) {
        if (e?.code === 'invalid_argument') { remote.readOnly = true; toast('You can view this tracker but not change it.'); }
        else if (e?.code === 'quota_exceeded') toast('Storage is full. Delete old reviews or snapshots to add more.');
        else toast('A change could not be saved. Check your connection and try again.');
        setSaveStatus('error');
        return;
      }
    }
    setSaveStatus('saved');
  });
}

function setSaveStatus(kind) {
  const el = $('#save-status');
  if (!el) return;
  el.dataset.kind = kind;
  el.textContent = {
    local: 'Saved in this browser',
    saving: 'Saving…',
    saved: 'Saved to your claude.ai account',
    error: 'Some changes are not saved',
  }[kind];
}

async function readAll(db, coll) {
  const out = [];
  let q = db.collection(coll).orderBy('id').limit(1000);
  for (;;) {
    const snap = await q.get();
    snap.docs.forEach(d => out.push({ ...d.data(), id: d.id }));
    if (snap.size < 1000) return out;
    q = db.collection(coll).where('id', '>', out[out.length - 1].id).orderBy('id').limit(1000);
  }
}

async function connectRemote() {
  const db = await window.claude?.use?.('db');
  if (!db) return;
  try {
    const [reviews, snapshots, keywords, meta] = await Promise.all([
      readAll(db, 'reviews'), readAll(db, 'snapshots'), readAll(db, 'keywords'), db.doc('meta/settings').get(),
    ]);
    remote.db = db;
    const cloudEmpty = !meta.exists && !reviews.length && !snapshots.length && !keywords.length;
    if (cloudEmpty) {
      // First visit: move whatever this browser already has into the cloud.
      syncRemote();
    } else {
      const m = meta.exists ? meta.data() : {};
      const localCopy = state;
      state = {
        platforms: Array.isArray(m.platforms) && m.platforms.length ? structuredClone(m.platforms) : localCopy.platforms,
        reviews, snapshots, keywords,
        lastSyncedAt: m.lastSyncedAt ?? null,
      };
      for (const def of DEFAULT_PLATFORMS) if (!platformById(def.id)) state.platforms.push({ ...def });
      for (const r of state.reviews) { r.tags ||= []; r.rating = Number(r.rating); r.date ||= today(); }
      for (const k of state.keywords) k.aliases ||= [];
      for (const [path, val] of stateDocs()) remote.shadow.set(path, JSON.stringify(val));
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
      setSaveStatus('saved');
      renderAll();
    }
  } catch (e) {
    remote.db = null;
    toast('Could not load your saved reviews. Showing the copy in this browser.');
  }
}

/* ---------------- Helpers ---------------- */

const $ = sel => document.querySelector(sel);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const today = () => new Date().toISOString().slice(0, 10);
const platformById = id => state.platforms.find(p => p.id === id);
const enabledPlatforms = () => state.platforms.filter(p => p.enabled);

function stars(n) {
  const r = Math.round(n);
  return `<span class="stars" aria-label="${n} out of 5">${'★'.repeat(r)}<span class="off">${'★'.repeat(5 - r)}</span></span>`;
}

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d + (d.length === 10 ? 'T12:00:00' : ''));
  return isNaN(dt) ? d : dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function safeUrl(u) {
  try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : ''; } catch { return ''; }
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2600);
}

function snapshotsFor(pid) {
  return state.snapshots.filter(s => s.platform === pid).sort((a, b) => a.date.localeCompare(b.date));
}
function latestSnapshot(pid) {
  const s = snapshotsFor(pid);
  return s[s.length - 1] || null;
}

function reviewKey(r) {
  if (r.externalId) return `${r.platform}|ext|${r.externalId}`;
  return `${r.platform}|${(r.author || '').toLowerCase()}|${r.date}|${(r.text || '').slice(0, 80).toLowerCase()}`;
}

/* ---------------- Rendering ---------------- */

function renderAll() {
  renderOverall();
  renderPlatformCards();
  renderNeedsResponse();
  renderStarBreakdown();
  renderPlatformFilters();
  renderReviews();
  renderMentions();
  renderTrends();
  renderSettings();
}

function renderOverall() {
  let weighted = 0, weight = 0, plain = [], sites = 0;
  for (const p of enabledPlatforms()) {
    const s = latestSnapshot(p.id);
    if (!s) continue;
    sites++;
    plain.push(s.rating);
    if (s.count) { weighted += s.rating * s.count; weight += s.count; }
  }
  const el = $('#overall');
  if (!sites) {
    const rs = state.reviews;
    if (!rs.length) { el.innerHTML = `<span class="lbl">Log each site's rating on the dashboard to see a combined score.</span>`; return; }
    const avg = rs.reduce((a, r) => a + r.rating, 0) / rs.length;
    el.innerHTML = `<span class="big">${avg.toFixed(2)}</span><span class="lbl">avg of ${rs.length} tracked reviews</span>`;
    return;
  }
  const score = weight ? weighted / weight : plain.reduce((a, b) => a + b, 0) / plain.length;
  const detail = weight ? `${weight.toLocaleString()} reviews across ${sites} site${sites > 1 ? 's' : ''}` : `average across ${sites} sites`;
  el.innerHTML = `<span class="big">${score.toFixed(2)}</span><span class="lbl">${stars(score)}<br>${detail}</span>`;
}

function renderPlatformCards() {
  const grid = $('#platform-grid');
  grid.innerHTML = enabledPlatforms().map(p => {
    const snaps = snapshotsFor(p.id);
    const last = snaps[snaps.length - 1];
    const prev = snaps[snaps.length - 2];
    const tracked = state.reviews.filter(r => r.platform === p.id);
    const open = tracked.filter(r => !r.responded).length;
    let delta = '';
    if (last && prev) {
      const d = last.rating - prev.rating;
      if (Math.abs(d) >= 0.01) delta = `<span class="delta ${d > 0 ? 'up' : 'down'}">${d > 0 ? '▲' : '▼'} ${Math.abs(d).toFixed(2)}</span>`;
    }
    const newCount = last && prev && last.count != null && prev.count != null ? last.count - prev.count : null;
    const url = safeUrl(p.url);
    return `
      <div class="card pcard" style="--pc:${esc(p.color)}">
        <div class="name">${esc(p.name)} ${open ? `<span class="pill warn">${open} to answer</span>` : ''}</div>
        ${last
          ? `<div class="rating">${Number(last.rating).toFixed(1)} <small>/ 5</small> ${delta}</div>
             <div>${stars(last.rating)}</div>
             <div class="meta">${last.count != null ? `${Number(last.count).toLocaleString()} reviews` : ''}${newCount > 0 ? ` · +${newCount} since last` : ''}${last.rank ? ` · ${esc(last.rank)}` : ''}<br>as of ${fmtDate(last.date)}</div>`
          : `<div class="rating muted">—</div><div class="meta">No rating logged yet</div>`}
        <div class="meta">${tracked.length} review${tracked.length === 1 ? '' : 's'} tracked</div>
        <div class="actions">
          ${url ? `<a class="btn sm" href="${esc(url)}" target="_blank" rel="noopener">Open ↗</a>` : ''}
          <button class="btn sm" data-snap="${esc(p.id)}">Log rating</button>
          <button class="btn sm" data-add-for="${esc(p.id)}">+ Review</button>
        </div>
      </div>`;
  }).join('') || `<div class="card empty">No sites turned on. Enable some under “Sites &amp; Data”.</div>`;
}

function renderNeedsResponse() {
  const list = state.reviews
    .filter(r => !r.responded && platformById(r.platform)?.enabled)
    .sort((a, b) => a.rating - b.rating || b.date.localeCompare(a.date))
    .slice(0, 8);
  $('#needs-response').innerHTML = list.length
    ? list.map(r => miniReview(r)).join('')
    : `<div class="empty">All caught up — every tracked review has a response.</div>`;
}

function miniReview(r) {
  const p = platformById(r.platform);
  return `<div class="mini">
    <div class="line1">${stars(r.rating)} <strong>${esc(r.author || 'Anonymous')}</strong>
      <span class="pill" style="border-color:${esc(p?.color)}">${esc(p?.name || r.platform)}</span>
      <span class="muted small">${fmtDate(r.date)}</span>
      <button class="btn sm" data-respond="${esc(r.id)}" style="margin-left:auto">Mark responded</button></div>
    <div class="excerpt">${esc(r.title ? `${r.title} — ` : '')}${esc(r.text)}</div>
  </div>`;
}

function renderStarBreakdown() {
  const rs = state.reviews.filter(r => platformById(r.platform)?.enabled);
  if (!rs.length) {
    $('#star-breakdown').innerHTML = `<div class="empty">No reviews tracked yet.<br><button class="btn primary" data-add-for="">+ Add your first review</button></div>`;
    return;
  }
  const counts = [5, 4, 3, 2, 1].map(n => rs.filter(r => r.rating === n).length);
  const max = Math.max(...counts, 1);
  const avg = rs.reduce((a, r) => a + r.rating, 0) / rs.length;
  const pctResponded = Math.round(100 * rs.filter(r => r.responded).length / rs.length);
  $('#star-breakdown').innerHTML = [5, 4, 3, 2, 1].map((n, i) => `
    <div class="bar-row"><span>${n} ★</span><div class="bar"><span style="width:${(counts[i] / max) * 100}%"></span></div><span class="muted">${counts[i]}</span></div>
  `).join('') + `<p class="small muted">Average ${avg.toFixed(2)} across ${rs.length} tracked · ${pctResponded}% responded</p>`;
}

function renderPlatformFilters() {
  const opts = state.platforms.map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
  const f = $('#f-platform');
  const cur = f.value;
  f.innerHTML = `<option value="">All sites</option>${opts}`;
  f.value = cur;
  const dlg = document.querySelector('#review-form [name=platform]');
  const cur2 = dlg.value;
  dlg.innerHTML = state.platforms.filter(p => p.enabled).map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
  if (cur2) dlg.value = cur2;
}

function filteredReviews() {
  const q = $('#f-search').value.trim().toLowerCase();
  const plat = $('#f-platform').value;
  const st = $('#f-stars').value;
  const status = $('#f-status').value;
  const sort = $('#f-sort').value;
  let rs = state.reviews.filter(r => {
    if (plat && r.platform !== plat) return false;
    if (st === 'low' && r.rating > 3) return false;
    if (st && st !== 'low' && r.rating !== Number(st)) return false;
    if (status === 'open' && r.responded) return false;
    if (status === 'done' && !r.responded) return false;
    if (q) {
      const hay = [r.author, r.title, r.text, r.note, ...(r.tags || [])].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const cmp = {
    'date-desc': (a, b) => b.date.localeCompare(a.date),
    'date-asc': (a, b) => a.date.localeCompare(b.date),
    'rating-asc': (a, b) => a.rating - b.rating || b.date.localeCompare(a.date),
    'rating-desc': (a, b) => b.rating - a.rating || b.date.localeCompare(a.date),
  }[sort];
  return rs.sort(cmp);
}

function renderReviews() {
  const rs = filteredReviews();
  const q = $('#f-search').value.trim();
  const re = q ? new RegExp(escRe(q), 'i') : null;
  let summary = `${rs.length} of ${state.reviews.length} reviews`;
  if (q && rs.length) {
    const s = { total: rs.length, pos: 0, neu: 0, neg: 0 };
    rs.forEach(r => s[sentimentOf(r)]++);
    summary = `<strong>${rs.length}</strong> of ${state.reviews.length} reviews match “${esc(q)}” · avg ${(rs.reduce((a, r) => a + r.rating, 0) / rs.length).toFixed(1)}★ <span class="scounts inline">${sentimentCounts(s)}</span>`;
  }
  $('#review-count').innerHTML = summary;
  $('#review-list').innerHTML = rs.length ? rs.map(r => {
    const p = platformById(r.platform);
    const url = safeUrl(r.url);
    return `<article class="review" style="--pc:${esc(p?.color)}">
      <div class="review-head">
        ${stars(r.rating)}
        <span class="author">${esc(r.author || 'Anonymous')}</span>
        <span class="pill">${esc(p?.name || r.platform)}</span>
        <span class="muted small">${fmtDate(r.date)}</span>
        <span class="spacer"></span>
        ${r.responded ? `<span class="pill">✓ Responded${r.respondedDate ? ` ${fmtDate(r.respondedDate)}` : ''}</span>` : `<span class="pill warn">Needs response</span>`}
      </div>
      ${r.title ? `<h3>${highlight(r.title, re)}</h3>` : ''}
      ${r.text ? `<p>${highlight(r.text, re)}</p>` : ''}
      ${r.note ? `<p class="note">Note: ${esc(r.note)}</p>` : ''}
      <div class="review-foot">
        ${(r.tags || []).map(t => `<span class="tag">#${esc(t)}</span>`).join('')}
        <span class="spacer" style="flex:1"></span>
        ${url ? `<a class="btn sm" href="${esc(url)}" target="_blank" rel="noopener">View ↗</a>` : ''}
        <button class="btn sm" data-respond="${esc(r.id)}">${r.responded ? 'Mark unanswered' : 'Mark responded'}</button>
        <button class="btn sm" data-edit="${esc(r.id)}">Edit</button>
        <button class="btn sm danger" data-del="${esc(r.id)}">Delete</button>
      </div>
    </article>`;
  }).join('') : `<div class="card empty">${state.reviews.length ? 'No reviews match these filters.' : 'No reviews tracked yet. Add one, import a CSV, or run the sync script.'}</div>`;
}

/* ---------------- Staff & keyword mentions ---------------- */

const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Case-insensitive whole-word matcher for any of the given terms. */
function termRegex(terms, flags = 'iu') {
  const list = terms.map(t => t.trim()).filter(Boolean).sort((a, b) => b.length - a.length);
  if (!list.length) return null;
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${list.map(escRe).join('|')})(?![\\p{L}\\p{N}])`, flags);
}

const reviewBody = r => `${r.title || ''}\n${r.text || ''}`;

const sentimentOf = r => r.rating >= 4 ? 'pos' : r.rating === 3 ? 'neu' : 'neg';

function mentionScope() {
  const days = Number($('#m-period').value);
  const plat = $('#m-platform').value;
  const cutoff = days ? new Date(Date.now() - days * 864e5).toISOString().slice(0, 10) : '';
  return state.reviews.filter(r =>
    (!plat || r.platform === plat) && (!cutoff || r.date >= cutoff) && platformById(r.platform)?.enabled);
}

function mentionStats(terms, reviews) {
  const re = termRegex(terms);
  const hits = re ? reviews.filter(r => re.test(reviewBody(r))) : [];
  const s = { hits, total: hits.length, pos: 0, neu: 0, neg: 0, avg: 0, last: '' };
  for (const r of hits) {
    s[sentimentOf(r)]++;
    s.avg += r.rating;
    if (r.date > s.last) s.last = r.date;
  }
  if (s.total) s.avg /= s.total;
  return s;
}

function sentimentBar(s) {
  if (!s.total) return '';
  const w = n => (100 * n / s.total).toFixed(1);
  return `<div class="sbar" role="img" aria-label="${s.pos} positive, ${s.neu} neutral, ${s.neg} negative">
    <span class="pos" style="width:${w(s.pos)}%"></span><span class="neu" style="width:${w(s.neu)}%"></span><span class="neg" style="width:${w(s.neg)}%"></span></div>`;
}

function sentimentCounts(s) {
  return `<span class="sc pos">▲ ${s.pos} positive</span><span class="sc neu">● ${s.neu} neutral</span><span class="sc neg">▼ ${s.neg} negative</span>`;
}

/** Escape text and wrap matches of `re` in <mark>. */
function highlight(text, re) {
  if (!re || !text) return esc(text);
  const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  let out = '', i = 0;
  for (const m of text.matchAll(g)) {
    out += esc(text.slice(i, m.index)) + `<mark>${esc(m[0])}</mark>`;
    i = m.index + m[0].length;
  }
  return out + esc(text.slice(i));
}

/** Short excerpt around the first match, with the match highlighted. */
function excerptAround(text, re, radius = 110) {
  const m = re && text.match(re);
  if (!m) return esc(text.slice(0, radius * 2));
  const start = Math.max(0, m.index - radius);
  const end = Math.min(text.length, m.index + m[0].length + radius);
  return (start ? '…' : '') + highlight(text.slice(start, end), re) + (end < text.length ? '…' : '');
}

function mentionReviewList(hits, re) {
  return hits.sort((a, b) => b.date.localeCompare(a.date)).map(r => {
    const p = platformById(r.platform);
    return `<div class="mini">
      <div class="line1">${stars(r.rating)} <strong>${esc(r.author || 'Anonymous')}</strong>
        <span class="pill">${esc(p?.name || r.platform)}</span>
        <span class="muted small">${fmtDate(r.date)}</span>
        <button class="btn sm" data-edit="${esc(r.id)}" style="margin-left:auto">Open</button></div>
      <div class="excerpt full">${r.title ? `<strong>${highlight(r.title, re)}</strong> — ` : ''}${excerptAround(r.text || '', re)}</div>
    </div>`;
  }).join('');
}

const openMentions = new Set();

function renderMentions() {
  // Site filter options
  const mp = $('#m-platform'), cur = mp.value;
  mp.innerHTML = `<option value="">All sites</option>` + enabledPlatforms().map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
  mp.value = cur;

  const scope = mentionScope();

  // Quick check
  const q = $('#m-quick').value.trim();
  const qr = $('#m-quick-result');
  if (!q) qr.innerHTML = '';
  else {
    const s = mentionStats([q], scope);
    const tracked = state.keywords.some(k => [k.term, ...k.aliases].some(t => t.toLowerCase() === q.toLowerCase()));
    qr.innerHTML = s.total ? `
      <div class="mstat">
        <div class="mstat-head"><strong>“${esc(q)}”</strong> in ${s.total} review${s.total === 1 ? '' : 's'} · avg ${s.avg.toFixed(1)}★
          ${tracked ? '' : `<button class="btn sm" data-track-quick>+ Track this</button>`}</div>
        ${sentimentBar(s)}<div class="scounts">${sentimentCounts(s)}</div>
        <div class="mlist">${mentionReviewList(s.hits, termRegex([q]))}</div>
      </div>` : `<p class="muted">No reviews mention “${esc(q)}”${scope.length < state.reviews.length ? ' in this period/site' : ''}.</p>`;
  }

  // Role filter
  const rf = $('#m-role-filter'), rcur = rf.value;
  const roles = [...new Set(state.keywords.map(k => k.role))].sort();
  rf.innerHTML = `<option value="">All roles</option>` + roles.map(r => `<option>${esc(r)}</option>`).join('');
  rf.value = roles.includes(rcur) ? rcur : '';

  // Tracked keywords
  const kws = state.keywords
    .filter(k => !rf.value || k.role === rf.value)
    .map(k => ({ k, s: mentionStats([k.term, ...k.aliases], scope) }))
    .sort((a, b) => b.s.total - a.s.total || a.k.term.localeCompare(b.k.term));
  $('#keyword-list').innerHTML = kws.length ? `<div class="klist">${kws.map(({ k, s }) => {
    const open = openMentions.has(k.id) && s.total;
    const pct = s.total ? Math.round(100 * s.pos / s.total) : null;
    return `<div class="kitem">
      <div class="krow">
        <div class="kname"><strong>${esc(k.term)}</strong> <span class="pill">${esc(k.role)}</span>
          ${k.aliases.length ? `<div class="small muted">also: ${k.aliases.map(esc).join(', ')}</div>` : ''}</div>
        <div class="kbar">${s.total ? sentimentBar(s) + `<div class="scounts">${sentimentCounts(s)}</div>` : '<span class="muted small">No mentions yet</span>'}</div>
        <div class="knums">${s.total ? `<strong>${s.total}</strong> mention${s.total === 1 ? '' : 's'}<br><span class="small muted">${pct}% positive · avg ${s.avg.toFixed(1)}★<br>last ${fmtDate(s.last)}</span>` : ''}</div>
        <div class="kact">
          ${s.total ? `<button class="btn sm" data-toggle-mention="${esc(k.id)}">${open ? 'Hide' : 'Show'} reviews</button>` : ''}
          <button class="btn sm" data-edit-kw="${esc(k.id)}">Edit</button>
          <button class="btn sm danger" data-del-kw="${esc(k.id)}">Remove</button>
        </div>
      </div>
      ${open ? `<div class="mlist">${mentionReviewList(s.hits, termRegex([k.term, ...k.aliases]))}</div>` : ''}
    </div>`;
  }).join('')}</div>` : `<div class="empty">${state.keywords.length ? 'No keywords with this role.' : 'Add a server, bartender or any keyword above to track how reviews mention them.'}</div>`;

  renderSuggestions();
}

/** Find likely staff names in review text, e.g. "our server Kayla" or "Marco the bartender". */
const ROLE_WORDS = {
  server: 'Server', waiter: 'Server', waitress: 'Server', bartender: 'Bartender', bartenders: 'Bartender',
  mixologist: 'Bartender', host: 'Host', hostess: 'Host', manager: 'Manager', gm: 'Manager', chef: 'Chef',
};
const NOT_NAMES = new Set(['The', 'She', 'He', 'They', 'Our', 'We', 'It', 'This', 'That', 'Was', 'Is', 'And', 'But', 'Very', 'So', 'Also', 'Drift', 'Opal', 'Sol', 'Clearwater', 'Great', 'Amazing', 'Excellent', 'Thank', 'Thanks', 'Everyone', 'Everything', 'Service', 'Food', 'I']);

function suggestStaff() {
  const found = new Map();
  const roleAlt = Object.keys(ROLE_WORDS).join('|');
  const pats = [
    // "server Kayla", "bartender, Marco", "server named Kayla", "server was Kayla"
    new RegExp(`\\b(${roleAlt})\\b,?\\s+(?:named\\s+|was\\s+|is\\s+)?([A-Z][a-z]{1,14})\\b`, 'gi'),
    // "Kayla, our server" / "Kayla was our bartender" / "Kayla the bartender"
    new RegExp(`\\b([A-Z][a-z]{1,14}),?\\s+(?:was\\s+|is\\s+)?(?:our|the|my)\\s+(${roleAlt})\\b`, 'g'),
  ];
  for (const r of state.reviews) {
    const text = reviewBody(r);
    for (const [i, re] of pats.entries()) {
      for (const m of text.matchAll(re)) {
        const [roleWord, name] = i === 0 ? [m[1], m[2]] : [m[2], m[1]];
        if (!/^[A-Z]/.test(name) || NOT_NAMES.has(name)) continue;
        const key = name.toLowerCase();
        const e = found.get(key) || { name, role: ROLE_WORDS[roleWord.toLowerCase()], ids: new Set() };
        e.ids.add(r.id);
        found.set(key, e);
      }
    }
  }
  const trackedTerms = new Set(state.keywords.flatMap(k => [k.term, ...k.aliases]).map(t => t.toLowerCase()));
  return [...found.values()].filter(e => !trackedTerms.has(e.name.toLowerCase()))
    .sort((a, b) => b.ids.size - a.ids.size).slice(0, 12);
}

function renderSuggestions() {
  const sug = suggestStaff();
  $('#suggestions').innerHTML = sug.length ? `<div class="suggest"><span class="small muted">Names spotted in reviews:</span>
    ${sug.map(e => `<button class="btn sm" data-suggest="${esc(e.name)}" data-role="${esc(e.role)}">+ ${esc(e.name)} <span class="muted">(${esc(e.role.toLowerCase())}, ${e.ids.size})</span></button>`).join('')}</div>` : '';
}

function addKeyword(term, role, aliases = []) {
  term = term.trim();
  if (!term) return;
  const existing = state.keywords.find(k => k.term.toLowerCase() === term.toLowerCase());
  if (existing) { existing.role = role; existing.aliases = [...new Set([...existing.aliases, ...aliases])]; }
  else state.keywords.push({ id: uid(), term, role, aliases, addedAt: today() });
  save(); renderAll();
  toast(`Tracking “${term}”`);
}

/* ---------------- Charts (inline SVG) ---------------- */

function renderTrends() {
  renderTrendChart();
  renderVolumeChart();
  renderSnapshotTable();
}

function renderTrendChart() {
  const series = enabledPlatforms().map(p => ({ p, pts: snapshotsFor(p.id) })).filter(s => s.pts.length);
  $('#trend-legend').innerHTML = series.map(s => `<span><i style="background:${esc(s.p.color)}"></i>${esc(s.p.name)}</span>`).join('');
  if (!series.length) { $('#trend-chart').innerHTML = `<div class="empty">Log a rating for any site to start the trend line.</div>`; return; }

  const W = 800, H = 280, L = 36, R = 16, T = 12, B = 28;
  const all = series.flatMap(s => s.pts);
  const times = all.map(s => new Date(s.date).getTime());
  let t0 = Math.min(...times), t1 = Math.max(...times);
  if (t0 === t1) { t0 -= 15 * 864e5; t1 += 15 * 864e5; }
  const rMin = Math.max(1, Math.floor(Math.min(...all.map(s => s.rating)) * 2) / 2 - 0.5);
  const rMax = 5;
  const x = t => L + (W - L - R) * (t - t0) / (t1 - t0);
  const y = r => T + (H - T - B) * (1 - (r - rMin) / (rMax - rMin));

  let g = '';
  for (let r = rMin; r <= rMax + 1e-9; r += 0.5) {
    g += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(r)}" y2="${y(r)}"/><text x="${L - 6}" y="${y(r) + 4}" text-anchor="end">${r.toFixed(1)}</text>`;
  }
  const ticks = 5;
  const short = t1 - t0 < 200 * 864e5;
  for (let i = 0; i <= ticks; i++) {
    const t = t0 + (t1 - t0) * i / ticks;
    const lbl = new Date(t).toLocaleDateString(undefined, short ? { month: 'short', day: 'numeric' } : { month: 'short', year: '2-digit' });
    const anchor = i === 0 ? 'start' : i === ticks ? 'end' : 'middle';
    g += `<text x="${x(t)}" y="${H - 8}" text-anchor="${anchor}">${lbl}</text>`;
  }
  for (const s of series) {
    const pts = s.pts.map(pt => [x(new Date(pt.date).getTime()), y(pt.rating), pt]);
    g += `<polyline fill="none" stroke="${esc(s.p.color)}" stroke-width="2.5" stroke-linejoin="round" points="${pts.map(p => p[0] + ',' + p[1]).join(' ')}"/>`;
    g += pts.map(([px, py, pt]) => `<circle cx="${px}" cy="${py}" r="4" fill="${esc(s.p.color)}"><title>${esc(s.p.name)} · ${fmtDate(pt.date)} · ${pt.rating}${pt.count != null ? ` (${pt.count} reviews)` : ''}</title></circle>`).join('');
  }
  $('#trend-chart').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Rating over time by site">${g}</svg>`;
}

function renderVolumeChart() {
  const rs = state.reviews.filter(r => platformById(r.platform)?.enabled && r.date);
  if (!rs.length) { $('#volume-chart').innerHTML = `<div class="empty">No tracked reviews yet.</div>`; return; }
  const months = [...new Set(rs.map(r => r.date.slice(0, 7)))].sort();
  // Fill gaps so the timeline is continuous (cap at 24 most recent months).
  const full = [];
  let [yy, mm] = months[0].split('-').map(Number);
  const [ey, em] = months[months.length - 1].split('-').map(Number);
  while (yy < ey || (yy === ey && mm <= em)) {
    full.push(`${yy}-${String(mm).padStart(2, '0')}`);
    if (++mm > 12) { mm = 1; yy++; }
  }
  const ms = full.slice(-24);
  const plats = enabledPlatforms();
  const data = ms.map(m => plats.map(p => rs.filter(r => r.platform === p.id && r.date.startsWith(m)).length));
  const max = Math.max(...data.map(d => d.reduce((a, b) => a + b, 0)), 1);

  const W = 800, H = 220, L = 30, R = 10, T = 10, B = 28;
  const bw = (W - L - R) / ms.length;
  const y = v => T + (H - T - B) * (1 - v / max);
  let g = `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(0)}" y2="${y(0)}"/><text x="${L - 6}" y="${y(max) + 4}" text-anchor="end">${max}</text><text x="${L - 6}" y="${y(0) + 4}" text-anchor="end">0</text>`;
  ms.forEach((m, i) => {
    let acc = 0;
    plats.forEach((p, j) => {
      const v = data[i][j];
      if (!v) return;
      const top = y(acc + v), bot = y(acc);
      g += `<rect x="${L + i * bw + bw * 0.15}" y="${top + 1}" width="${bw * 0.7}" height="${Math.max(bot - top - 1, 1)}" rx="2" fill="${esc(p.color)}"><title>${esc(p.name)} · ${m}: ${v}</title></rect>`;
      acc += v;
    });
    if (ms.length <= 12 || i % Math.ceil(ms.length / 12) === 0) {
      const lbl = new Date(m + '-15').toLocaleDateString(undefined, { month: 'short' });
      g += `<text x="${L + i * bw + bw / 2}" y="${H - 8}" text-anchor="middle">${lbl}</text>`;
    }
  });
  $('#volume-chart').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Reviews per month">${g}</svg>`;
}

function renderSnapshotTable() {
  const snaps = [...state.snapshots].sort((a, b) => b.date.localeCompare(a.date));
  $('#snapshot-table').innerHTML = snaps.length ? `<div class="table-wrap"><table>
    <thead><tr><th>Date</th><th>Site</th><th>Rating</th><th>Reviews</th><th>Ranking</th><th></th></tr></thead>
    <tbody>${snaps.map(s => `<tr>
      <td>${fmtDate(s.date)}</td><td>${esc(platformById(s.platform)?.name || s.platform)}</td>
      <td class="num">${Number(s.rating).toFixed(1)}</td><td class="num">${s.count ?? ''}</td><td>${esc(s.rank || '')}</td>
      <td><button class="btn sm danger" data-del-snap="${esc(s.id)}">Delete</button></td></tr>`).join('')}</tbody>
  </table></div>` : `<div class="empty">No snapshots yet.</div>`;
}

/* ---------------- Settings ---------------- */

function renderSettings() {
  $('#platform-settings').innerHTML = state.platforms.map(p => `
    <div class="prow" style="--pc:${esc(p.color)}">
      <label class="pname"><input type="checkbox" data-toggle="${esc(p.id)}" ${p.enabled ? 'checked' : ''}><i></i>${esc(p.name)}</label>
      <input type="url" value="${esc(p.url)}" data-url="${esc(p.id)}" aria-label="${esc(p.name)} URL">
      ${p.custom ? `<button class="btn sm danger" data-remove-platform="${esc(p.id)}">Remove</button>` : ''}
      ${p.why ? `<div class="why">${esc(p.why)}</div>` : ''}
    </div>`).join('');
}

/* ---------------- Dialogs ---------------- */

function openReviewDialog(review, platformId) {
  const f = $('#review-form');
  f.reset();
  renderPlatformFilters();
  $('#review-dialog-title').textContent = review ? 'Edit review' : 'Add review';
  f.dataset.id = review?.id || '';
  const r = review || { platform: platformId || enabledPlatforms()[0]?.id, rating: 5, date: today() };
  f.platform.value = r.platform || '';
  f.rating.value = String(r.rating || 5);
  f.author.value = r.author || '';
  f.date.value = r.date || today();
  f.elements.title.value = r.title || '';
  f.text.value = r.text || '';
  f.url.value = r.url || '';
  f.tags.value = (r.tags || []).join(', ');
  f.responded.checked = !!r.responded;
  f.note.value = r.note || '';
  $('#review-dialog').returnValue = '';
  $('#review-dialog').showModal();
}

$('#review-dialog').addEventListener('close', () => {
  if ($('#review-dialog').returnValue !== 'save') return;
  const f = $('#review-form');
  const data = {
    platform: f.platform.value,
    rating: Number(f.rating.value),
    author: f.author.value.trim(),
    date: f.date.value,
    title: f.elements.title.value.trim(),
    text: f.text.value.trim(),
    url: f.url.value.trim(),
    tags: f.tags.value.split(',').map(t => t.trim()).filter(Boolean),
    responded: f.responded.checked,
    note: f.note.value.trim(),
  };
  const id = f.dataset.id;
  if (id) {
    const r = state.reviews.find(x => x.id === id);
    if (data.responded && !r.responded) data.respondedDate = today();
    Object.assign(r, data);
  } else {
    state.reviews.push({ id: uid(), ...data, respondedDate: data.responded ? today() : null, addedAt: today() });
  }
  save(); renderAll();
  toast(id ? 'Review updated' : 'Review added');
});

function openSnapshotDialog(pid) {
  const p = platformById(pid);
  const f = $('#snapshot-form');
  f.reset();
  f.platform.value = pid;
  const last = latestSnapshot(pid);
  f.rating.value = last?.rating ?? '';
  f.count.value = last?.count ?? '';
  f.rank.value = last?.rank ?? '';
  f.date.value = today();
  $('#snapshot-hint').innerHTML = `Open <a href="${esc(safeUrl(p.url))}" target="_blank" rel="noopener">${esc(p.name)} ↗</a> and copy the overall star rating and review count shown there.`;
  $('#snapshot-dialog').returnValue = '';
  $('#snapshot-dialog').showModal();
}

$('#snapshot-dialog').addEventListener('close', () => {
  if ($('#snapshot-dialog').returnValue !== 'save') return;
  const f = $('#snapshot-form');
  upsertSnapshot({
    platform: f.platform.value,
    date: f.date.value,
    rating: Number(f.rating.value),
    count: f.count.value === '' ? null : Number(f.count.value),
    rank: f.rank.value.trim() || null,
  });
  save(); renderAll();
  toast('Rating logged');
});

function upsertSnapshot(s) {
  const i = state.snapshots.findIndex(x => x.platform === s.platform && x.date === s.date);
  if (i >= 0) state.snapshots[i] = { ...state.snapshots[i], ...s };
  else state.snapshots.push({ id: uid(), ...s });
}

/* ---------------- Import / export ---------------- */

function resolvePlatform(val) {
  const v = String(val || '').trim();
  if (!v) return null;
  const lower = v.toLowerCase().replace(/\s+/g, '');
  let p = state.platforms.find(x => x.id === lower || x.name.toLowerCase().replace(/\s+/g, '') === lower);
  if (!p) {
    p = { id: lower.replace(/[^a-z0-9]/g, '') || uid(), name: v, url: '', color: randomColor(), enabled: true, custom: true };
    state.platforms.push(p);
  }
  return p.id;
}

function randomColor() {
  const palette = ['#8e6c3a', '#5b7f95', '#b0567c', '#4f8a6b', '#8a6fb3', '#c07b2a'];
  return palette[state.platforms.length % palette.length];
}

function normalizeDate(d) {
  if (!d) return today();
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
  const dt = new Date(d);
  return isNaN(dt) ? today() : dt.toISOString().slice(0, 10);
}

/** Merge reviews/snapshots from an import or sync file. Returns counts. */
function mergeData(data) {
  let added = 0, updated = 0, snaps = 0;
  const index = new Map(state.reviews.map(r => [reviewKey(r), r]));
  for (const raw of data.reviews || []) {
    const platform = resolvePlatform(raw.platform);
    const rating = Math.round(Number(raw.rating));
    if (!platform || !(rating >= 1 && rating <= 5)) continue;
    const r = {
      platform, rating,
      author: String(raw.author || '').trim(),
      date: normalizeDate(raw.date),
      title: String(raw.title || '').trim(),
      text: String(raw.text || '').trim(),
      url: String(raw.url || '').trim(),
      externalId: raw.externalId ? String(raw.externalId) : undefined,
      tags: Array.isArray(raw.tags) ? raw.tags : String(raw.tags || '').split(/[,;]/).map(t => t.trim()).filter(Boolean),
    };
    const existing = index.get(reviewKey(r));
    if (existing) {
      // Refresh content from source but keep the user's own tracking fields.
      for (const k of ['rating', 'title', 'text', 'url']) if (r[k]) existing[k] = r[k];
      updated++;
    } else {
      const full = {
        id: uid(), ...r,
        responded: raw.responded === true || /^(true|yes|1)$/i.test(String(raw.responded || '')),
        respondedDate: raw.respondedDate || null,
        note: String(raw.note || ''),
        addedAt: today(),
      };
      state.reviews.push(full);
      index.set(reviewKey(full), full);
      added++;
    }
  }
  for (const s of data.snapshots || []) {
    const platform = resolvePlatform(s.platform);
    const rating = Number(s.rating);
    if (!platform || !(rating >= 1 && rating <= 5)) continue;
    upsertSnapshot({ platform, date: normalizeDate(s.date), rating, count: s.count == null || s.count === '' ? null : Number(s.count), rank: s.rank || null });
    snaps++;
  }
  if (Array.isArray(data.platforms) && data.platforms.length && data.platforms[0].id) {
    // Full app export: carry over platform settings.
    for (const p of data.platforms) {
      const mine = platformById(p.id);
      if (mine) Object.assign(mine, { enabled: p.enabled, url: p.url || mine.url });
      else state.platforms.push(p);
    }
  }
  for (const k of Array.isArray(data.keywords) ? data.keywords : []) {
    if (k?.term && !state.keywords.some(x => x.term.toLowerCase() === String(k.term).toLowerCase())) {
      state.keywords.push({ id: uid(), term: String(k.term), role: k.role || 'Topic', aliases: Array.isArray(k.aliases) ? k.aliases : [], addedAt: k.addedAt || today() });
    }
  }
  return { added, updated, snaps };
}

function parseCSV(text) {
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const nonEmpty = rows.filter(r => r.some(v => v.trim()));
  if (!nonEmpty.length) return [];
  const head = nonEmpty[0].map(h => h.trim().toLowerCase());
  return nonEmpty.slice(1).map(r => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}

function toCSV(rows, cols) {
  const cell = v => {
    const s = Array.isArray(v) ? v.join('; ') : String(v ?? '');
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(','), ...rows.map(r => cols.map(c => cell(r[c])).join(','))].join('\n');
}

/** In-page confirmation (the hosted viewer blocks window.confirm). */
function askConfirm(message, okLabel = 'Delete') {
  const dlg = $('#confirm-dialog');
  $('#confirm-message').textContent = message;
  $('#confirm-ok').textContent = okLabel;
  dlg.returnValue = '';
  dlg.showModal();
  return new Promise(resolve => dlg.addEventListener('close', () => resolve(dlg.returnValue === 'ok'), { once: true }));
}

async function download(name, content, type) {
  const dl = await window.claude?.use?.('downloads');
  if (dl) {
    try { await dl.save({ filename: name, data: content }); toast(`Saved ${name}`); }
    catch (e) { if (e?.code !== 'declined') toast('This file could not be saved here.'); }
    return;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function reportMerge(res, source) {
  const msg = `${source}: ${res.added} new review${res.added === 1 ? '' : 's'}, ${res.updated} updated, ${res.snaps} rating snapshot${res.snaps === 1 ? '' : 's'}.`;
  $('#import-status').textContent = msg;
  toast(msg);
}

async function loadSynced({ silent } = {}) {
  try {
    const res = await fetch('data/synced.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (silent && data.generatedAt && data.generatedAt === state.lastSyncedAt) return;
    const r = mergeData(data);
    state.lastSyncedAt = data.generatedAt || new Date().toISOString();
    save(); renderAll();
    if (!silent || r.added || r.snaps) reportMerge(r, 'Sync');
  } catch (e) {
    if (!silent) toast(`No synced data found (${e.message}). Run sync/sync.mjs and serve this folder over http.`);
  }
}

/* ---------------- Events ---------------- */

document.querySelectorAll('.tab').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b === btn));
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === `tab-${btn.dataset.tab}`));
  try { sessionStorage.setItem('drift-tab', btn.dataset.tab); } catch { /* ignore */ }
}));

document.addEventListener('click', async e => {
  const t = e.target.closest('button');
  if (!t) return;
  const d = t.dataset;
  if (d.snap) openSnapshotDialog(d.snap);
  else if (d.addFor !== undefined) openReviewDialog(null, d.addFor);
  else if (d.edit) openReviewDialog(state.reviews.find(r => r.id === d.edit));
  else if (d.respond) {
    const r = state.reviews.find(x => x.id === d.respond);
    r.responded = !r.responded;
    r.respondedDate = r.responded ? today() : null;
    save(); renderAll();
  } else if (d.del) {
    if (await askConfirm('Delete this review from the tracker?')) {
      state.reviews = state.reviews.filter(r => r.id !== d.del);
      save(); renderAll();
    }
  } else if (d.toggleMention) {
    openMentions.has(d.toggleMention) ? openMentions.delete(d.toggleMention) : openMentions.add(d.toggleMention);
    renderMentions();
  } else if (d.delKw) {
    state.keywords = state.keywords.filter(k => k.id !== d.delKw);
    save(); renderAll();
  } else if (d.editKw) {
    const k = state.keywords.find(x => x.id === d.editKw);
    const f = $('#keyword-form');
    f.elements.term.value = k.term;
    f.elements.role.value = k.role;
    f.elements.aliases.value = k.aliases.join(', ');
    f.dataset.editId = k.id;
    f.querySelector('button').textContent = 'Save';
    f.elements.term.focus();
  } else if (d.suggest) {
    addKeyword(d.suggest, d.role || 'Server');
  } else if (d.trackQuick !== undefined) {
    addKeyword($('#m-quick').value, 'Topic');
  } else if (d.delSnap) {
    state.snapshots = state.snapshots.filter(s => s.id !== d.delSnap);
    save(); renderAll();
  } else if (d.removePlatform) {
    const n = state.reviews.filter(r => r.platform === d.removePlatform).length;
    if (await askConfirm(`Remove this site${n ? ` and its ${n} tracked reviews` : ''}?`, 'Remove')) {
      state.platforms = state.platforms.filter(p => p.id !== d.removePlatform);
      state.reviews = state.reviews.filter(r => r.platform !== d.removePlatform);
      state.snapshots = state.snapshots.filter(s => s.platform !== d.removePlatform);
      save(); renderAll();
    }
  }
});

$('#platform-settings').addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.toggle) platformById(el.dataset.toggle).enabled = el.checked;
  if (el.dataset.url) platformById(el.dataset.url).url = el.value.trim();
  save(); renderAll();
});

$('#custom-platform').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  const name = f.elements.name.value.trim();
  const id = resolvePlatform(name);
  platformById(id).url = f.url.value.trim();
  f.reset();
  save(); renderAll();
  toast(`${name} added`);
});

$('#keyword-form').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  const term = f.elements.term.value.trim();
  const role = f.elements.role.value;
  const aliases = f.elements.aliases.value.split(',').map(a => a.trim()).filter(Boolean);
  if (f.dataset.editId) {
    const k = state.keywords.find(x => x.id === f.dataset.editId);
    if (k) Object.assign(k, { term, role, aliases });
    delete f.dataset.editId;
    f.querySelector('button').textContent = 'Track';
    save(); renderAll();
  } else addKeyword(term, role, aliases);
  f.reset();
});
['#m-quick', '#m-period', '#m-platform', '#m-role-filter'].forEach(s =>
  $(s).addEventListener('input', renderMentions));

$('#btn-add').addEventListener('click', () => openReviewDialog(null, $('#f-platform').value));
['#f-search', '#f-platform', '#f-stars', '#f-status', '#f-sort'].forEach(s =>
  $(s).addEventListener('input', renderReviews));

$('#import-file').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  try {
    const data = file.name.toLowerCase().endsWith('.csv') ? { reviews: parseCSV(text) } : JSON.parse(text);
    const res = mergeData(data);
    save(); renderAll();
    reportMerge(res, file.name);
  } catch (err) {
    toast(`Import failed: ${err.message}`);
  }
  e.target.value = '';
});

$('#btn-load-synced').addEventListener('click', () => loadSynced());
$('#btn-export-json').addEventListener('click', () =>
  download(`drift-reviews-${today()}.json`, JSON.stringify(state, null, 2), 'application/json'));
$('#btn-export-csv').addEventListener('click', () => {
  const rows = state.reviews.map(r => ({ ...r, platform: platformById(r.platform)?.name || r.platform }));
  download(`drift-reviews-${today()}.csv`,
    toCSV(rows, ['platform', 'author', 'rating', 'date', 'title', 'text', 'url', 'tags', 'responded', 'respondedDate', 'note']),
    'text/csv');
});
$('#btn-reset').addEventListener('click', async () => {
  if (await askConfirm('Delete all tracked reviews, ratings, staff and site settings? Export first if you want a backup.', 'Delete everything')) {
    state = freshState();
    save(); renderAll();
  }
});

/* ---------------- Boot ---------------- */

try {
  const tab = sessionStorage.getItem('drift-tab');
  if (tab) document.querySelector(`.tab[data-tab="${tab}"]`)?.click();
} catch { /* ignore */ }

renderAll();
setSaveStatus('local');
if (window.claude?.use) connectRemote();
else if (location.protocol.startsWith('http')) loadSynced({ silent: true });
