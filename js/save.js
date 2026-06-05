// =====================================================
//  save.js  – LocalStorage save / load system
// =====================================================

const SAVE_KEY = 'starfall_frontier_save_v1';

const SaveSystem = {
  hasSave() {
    return !!localStorage.getItem(SAVE_KEY);
  },

  save(gameState) {
    try {
      const data = JSON.stringify(gameState);
      localStorage.setItem(SAVE_KEY, data);
      return true;
    } catch (e) {
      console.warn('Save failed:', e);
      return false;
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Load failed:', e);
      return null;
    }
  },

  delete() {
    localStorage.removeItem(SAVE_KEY);
  },
};

// =====================================================
//  ACHIEVEMENTS (stored separately for persistence)
// =====================================================

const ACH_KEY = 'starfall_achievements_v1';

const AchievementSystem = {
  unlocked: new Set(),

  load() {
    try {
      const raw = localStorage.getItem(ACH_KEY);
      if (raw) this.unlocked = new Set(JSON.parse(raw));
    } catch (e) { /* ignore */ }
  },

  save() {
    try {
      localStorage.setItem(ACH_KEY, JSON.stringify([...this.unlocked]));
    } catch(e) { /* ignore */ }
  },

  unlock(id, uiCallback) {
    if (this.unlocked.has(id)) return false;
    const def = ACHIEVEMENT_DEFS.find(a => a.id === id);
    if (!def) return false;
    this.unlocked.add(id);
    this.save();
    if (uiCallback) uiCallback(def);
    return true;
  },

  isUnlocked(id) { return this.unlocked.has(id); },

  // Check all possible achievements based on game state
  checkAll(player, dungeon, uiCallback) {
    const p = player;

    if (p.totalKills >= 1)
      this.unlock('first_blood', uiCallback);

    if (p.hp > 0 && p.hp < 10)
      this.unlock('survivor', uiCallback);

    // crit achievement tracked via combat engine
    if (p.level >= 5)   this.unlock('level_5', uiCallback);
    if (p.level >= 10)  this.unlock('level_10', uiCallback);

    if (dungeon.isSectorCleared(1)) this.unlock('sector1_clear', uiCallback);
    if (dungeon.isSectorCleared(2)) this.unlock('sector2_clear', uiCallback);
    if (dungeon.isSectorCleared(3)) this.unlock('sector3_clear', uiCallback);
    if (dungeon.isSectorCleared(4)) this.unlock('sector4_clear', uiCallback);
    if (dungeon.isSectorCleared(5)) this.unlock('sector5_clear', uiCallback);

    if (p.itemsCollected >= 10) this.unlock('loot_master', uiCallback);

    // Check for legendary item in inventory or equipped
    const allItems = [...p.inventory.getAll(),
      p.equipment.weapon, p.equipment.armor, p.equipment.artifact].filter(Boolean);
    if (allItems.some(i => i.rarity === 'legendary'))
      this.unlock('legend_item', uiCallback);

    if (p.escapes >= 3)       this.unlock('escape_artist', uiCallback);
    if (p.abilitiesUsed >= 5) this.unlock('ability_user', uiCallback);

    if (dungeon.allSectorsCleared()) this.unlock('full_clear', uiCallback);
  },

  unlockCritAchievement(uiCallback) {
    this.unlock('critical_hit', uiCallback);
  },
};

// Initialise on load
AchievementSystem.load();
