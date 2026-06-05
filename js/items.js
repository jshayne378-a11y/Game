// =====================================================
//  items.js  – Item system, inventory, loot generation
// =====================================================

class ItemSystem {
  constructor() {
    this.rarityWeights = {
      common: 50, uncommon: 28, rare: 14, epic: 6, legendary: 2
    };
  }

  // ---- Get item definition ----
  getDef(id) { return ITEM_DEFS[id] || null; }

  // ---- Create a fresh item instance ----
  createItem(id, qty = 1) {
    const def = this.getDef(id);
    if (!def) return null;
    return { ...def, qty: def.type === 'consumable' ? qty : 1, uid: Date.now() + Math.random() };
  }

  // ---- Generate loot from enemy loot table ----
  generateLoot(lootTable, sectorId = 1) {
    const drops = [];
    for (const [itemId, chance] of Object.entries(lootTable)) {
      if (Math.random() < chance) {
        const item = this.createItem(itemId);
        if (item) drops.push(item);
      }
    }
    // Small chance for bonus random item based on sector
    if (Math.random() < 0.12 + sectorId * 0.02) {
      const bonus = this.randomItemForSector(sectorId);
      if (bonus) drops.push(bonus);
    }
    return drops;
  }

  // ---- Generate a random item appropriate for a sector ----
  randomItemForSector(sectorId) {
    // Determine rarity bias by sector
    const rarityPool = [];
    const weights = {
      1: { common: 60, uncommon: 28, rare: 10, epic: 2, legendary: 0 },
      2: { common: 50, uncommon: 30, rare: 15, epic: 4, legendary: 1 },
      3: { common: 40, uncommon: 30, rare: 20, epic: 8, legendary: 2 },
      4: { common: 28, uncommon: 30, rare: 25, epic: 13, legendary: 4 },
      5: { common: 15, uncommon: 25, rare: 30, epic: 20, legendary: 10 },
    };
    const w = weights[sectorId] || weights[1];
    for (const [rarity, weight] of Object.entries(w)) {
      for (let i = 0; i < weight; i++) rarityPool.push(rarity);
    }
    const rarity = rarityPool[Math.floor(Math.random() * rarityPool.length)];
    const itemsOfRarity = Object.values(ITEM_DEFS).filter(d => d.rarity === rarity);
    if (!itemsOfRarity.length) return null;
    const def = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];
    return this.createItem(def.id);
  }

  // ---- Treasure room loot ----
  generateTreasureLoot(sectorId) {
    const items = [];
    // 1–3 items, higher tier in later sectors
    const count = Math.floor(Math.random() * 2) + 1 + (sectorId >= 3 ? 1 : 0);
    for (let i = 0; i < count; i++) {
      const item = this.randomItemForSector(sectorId);
      if (item) items.push(item);
    }
    return items;
  }

  // ---- Credits drop ----
  rollCredits(range, sectorId = 1) {
    const [min, max] = range;
    const bonus = Math.floor((sectorId - 1) * 5);
    return Math.floor(Math.random() * (max - min + 1)) + min + bonus;
  }

  // ---- Stat bonus from equipment ----
  getEquipStats(equipment) {
    const bonus = { atk: 0, def: 0, spd: 0, crit: 0, maxHp: 0, maxEn: 0 };
    for (const item of Object.values(equipment)) {
      if (!item) continue;
      for (const stat of ['atk','def','spd','crit','maxHp','maxEn']) {
        if (item[stat]) bonus[stat] += item[stat];
      }
    }
    return bonus;
  }

  // ---- Rarity color ----
  rarityColor(rarity) {
    const colors = {
      common: '#aaaaaa', uncommon: '#44ff88',
      rare: '#4488ff', epic: '#bb44ff', legendary: '#ffcc00',
    };
    return colors[rarity] || '#aaaaaa';
  }

  // ---- Format item stat line ----
  formatStats(item) {
    const lines = [];
    if (item.atk)    lines.push(`ATK +${item.atk}`);
    if (item.def)    lines.push(`DEF +${item.def}`);
    if (item.spd)    lines.push(`SPD ${item.spd > 0 ? '+' : ''}${item.spd}`);
    if (item.crit)   lines.push(`CRIT +${(item.crit * 100).toFixed(0)}%`);
    if (item.maxHp)  lines.push(`MAX HP +${item.maxHp}`);
    if (item.maxEn)  lines.push(`MAX EN +${item.maxEn}`);
    if (item.hpRestore)   lines.push(`Restore ${item.hpRestore} HP`);
    if (item.enRestore)   lines.push(`Restore ${item.enRestore} EN`);
    if (item.atkBuff)     lines.push(`ATK +${item.atkBuff} for ${item.buffDur} turns`);
    if (item.defBuff)     lines.push(`DEF +${item.defBuff} for ${item.buffDur} turns`);
    if (item.directDmg)   lines.push(`Deal ${item.directDmg} damage`);
    return lines;
  }
}

// =====================================================
//  INVENTORY  (manages player's item collection)
// =====================================================

class Inventory {
  constructor(maxSlots = 30) {
    this.items    = [];
    this.maxSlots = maxSlots;
  }

  // ---- Add item; stack consumables ----
  add(item) {
    if (!item) return false;
    if (item.type === 'consumable') {
      const existing = this.items.find(i => i.id === item.id);
      if (existing) { existing.qty += (item.qty || 1); return true; }
    }
    if (this.items.length >= this.maxSlots) return false;  // full
    this.items.push({ ...item, qty: item.qty || 1 });
    return true;
  }

  remove(uid, qty = 1) {
    const idx = this.items.findIndex(i => i.uid === uid);
    if (idx === -1) return false;
    if (this.items[idx].type === 'consumable' && this.items[idx].qty > qty) {
      this.items[idx].qty -= qty;
    } else {
      this.items.splice(idx, 1);
    }
    return true;
  }

  removeById(id, qty = 1) {
    const item = this.items.find(i => i.id === id);
    if (!item) return false;
    return this.remove(item.uid, qty);
  }

  get(uid) { return this.items.find(i => i.uid === uid) || null; }

  getAll() { return [...this.items]; }

  getUsable() { return this.items.filter(i => i.usable); }

  count() { return this.items.length; }

  // ---- Serialize ----
  toJSON() { return { items: this.items, maxSlots: this.maxSlots }; }

  fromJSON(data) {
    this.items    = data.items || [];
    this.maxSlots = data.maxSlots || 30;
  }
}

// =====================================================
//  EQUIPMENT  (manages equipped items per slot)
// =====================================================

class Equipment {
  constructor() {
    this.weapon   = null;
    this.armor    = null;
    this.artifact = null;
  }

  equip(item, inventory) {
    const slot = this._slotFor(item.type);
    if (!slot) return false;
    // Unequip current and put back in inventory
    if (this[slot]) {
      inventory.add({ ...this[slot] });
    }
    this[slot] = { ...item };
    inventory.remove(item.uid);
    return true;
  }

  unequip(slot, inventory) {
    if (!this[slot]) return false;
    inventory.add({ ...this[slot] });
    this[slot] = null;
    return true;
  }

  _slotFor(type) {
    if (type === 'weapon')   return 'weapon';
    if (type === 'armor')    return 'armor';
    if (type === 'artifact') return 'artifact';
    return null;
  }

  toJSON() { return { weapon: this.weapon, armor: this.armor, artifact: this.artifact }; }

  fromJSON(data) {
    this.weapon   = data.weapon   || null;
    this.armor    = data.armor    || null;
    this.artifact = data.artifact || null;
  }
}

const itemSystem = new ItemSystem();
