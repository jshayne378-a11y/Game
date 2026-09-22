/* ===========================================================
   DRIFT Menu Prep — persistent state (localStorage)
   =========================================================== */

var STORAGE_KEY = 'drift-menu-prep-v1';

function loadState() {
  var fallback = {
    known: {},          // itemId -> true (flashcards "known" marks)
    bestScores: {},      // gameId -> best score number
    playCounts: {},       // gameId -> times played
    lastPlayed: {}         // gameId -> ISO date string
  };
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    var parsed = JSON.parse(raw);
    return Object.assign({}, fallback, parsed);
  } catch (e) {
    return fallback;
  }
}

var APP_STATE = loadState();

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(APP_STATE));
  } catch (e) { /* storage unavailable, ignore */ }
}

function markKnown(itemId, known) {
  if (known) {
    APP_STATE.known[itemId] = true;
  } else {
    delete APP_STATE.known[itemId];
  }
  saveState();
}

function recordScore(gameId, score) {
  var best = APP_STATE.bestScores[gameId] || 0;
  if (score > best) APP_STATE.bestScores[gameId] = score;
  APP_STATE.playCounts[gameId] = (APP_STATE.playCounts[gameId] || 0) + 1;
  APP_STATE.lastPlayed[gameId] = new Date().toISOString();
  saveState();
}

function knownCount() {
  return Object.keys(APP_STATE.known).length;
}
