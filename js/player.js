// =====================================================
//  player.js  – Player character class
// =====================================================

class Player {
  constructor() {
    this.name      = 'Commander';
    this.level     = 1;
    this.xp        = 0;
    this.credits   = 100;

    // Base stats
    const base = { ...CFG.PLAYER_BASE };
    this.maxHp   = base.maxHp;
    this.hp      = base.hp;
    this.maxEn   = base.maxEn;
    this.en      = base.en;
    this._baseAtk  = base.atk;
    this._baseDef  = base.def;
    this._baseSpd  = base.spd;
    this._baseCrit = base.crit;

    // Equipment and inventory
    this.inventory = new Inventory(30);
    this.equipment = new Equipment();

    // Abilities unlocked
    this.abilities = [];  // will be populated as player levels up
    this._checkAbilityUnlocks();

    // Combat state (reset each battle)
    this.defending    = false;
    this.stunned      = false;
    this.atkBuff      = 0; this.atkBuffTurns  = 0;
    this.defBuff      = 0; this.defBuffTurns = 0;
    this.defMult      = 1;
    this.defMultTurns = 0;

    // Tracked stats
    this.totalKills    = 0;
    this.totalDamage   = 0;
    this.sectorsCleared = 0;
    this.escapes       = 0;
    this.abilitiesUsed = 0;
    this.itemsCollected = 0;
  }

  // =====================================================
  //  DERIVED STATS (base + equipment bonuses)
  // =====================================================
  get atk() {
    const eq = itemSystem.getEquipStats(this.equipment);
    return this._baseAtk + eq.atk + this.atkBuff;
  }
  get def() {
    const eq = itemSystem.getEquipStats(this.equipment);
    const base = this._baseDef + eq.def + this.defBuff;
    return Math.round(base * this.defMult);
  }
  get spd() {
    const eq = itemSystem.getEquipStats(this.equipment);
    return this._baseSpd + eq.spd;
  }
  get crit() {
    const eq = itemSystem.getEquipStats(this.equipment);
    return Math.min(0.75, this._baseCrit + eq.crit);
  }
  get effectiveMaxHp() {
    const eq = itemSystem.getEquipStats(this.equipment);
    return this.maxHp + eq.maxHp;
  }
  get effectiveMaxEn() {
    const eq = itemSystem.getEquipStats(this.equipment);
    return this.maxEn + eq.maxEn;
  }

  // =====================================================
  //  XP & LEVELING
  // =====================================================
  addXP(amount) {
    if (this.level >= CFG.MAX_LEVEL) return false;
    this.xp += amount;
    // Loop in case XP gain crosses multiple level thresholds
    let lastLevel = null;
    while (this.level < CFG.MAX_LEVEL && this.xp >= this.xpToNext()) {
      lastLevel = this._levelUp();
    }
    return lastLevel;
  }

  xpToNext() {
    if (this.level >= CFG.MAX_LEVEL) return Infinity;
    return CFG.XP_TABLE[this.level + 1];
  }

  xpProgress() {
    const prev = CFG.XP_TABLE[this.level];
    const next = this.xpToNext();
    if (next === Infinity) return 1;
    return (this.xp - prev) / (next - prev);
  }

  _levelUp() {
    this.level++;
    const gains = CFG.LEVEL_GAINS;
    this.maxHp      += gains.maxHp;
    this.hp          = Math.min(this.hp + gains.maxHp, this.effectiveMaxHp);
    this.maxEn      += gains.maxEn;
    this.en          = Math.min(this.en + gains.maxEn, this.effectiveMaxEn);
    this._baseAtk   += gains.atk;
    this._baseDef   += gains.def;
    this._baseSpd   += gains.spd;
    this._baseCrit  += gains.crit;
    this._checkAbilityUnlocks();
    return {
      level: this.level,
      gains: { ...gains },
      newAbility: this._lastUnlocked,
    };
  }

  _checkAbilityUnlocks() {
    this._lastUnlocked = null;
    for (const ab of ABILITIES) {
      if (ab.unlocksAt <= this.level && !this.abilities.find(a => a.id === ab.id)) {
        this.abilities.push({ ...ab });
        this._lastUnlocked = ab;
      }
    }
  }

  // =====================================================
  //  COMBAT ACTIONS
  // =====================================================
  computeAttack(heavy = false) {
    const base = this.atk;
    let dmg = heavy ? Math.floor(base * 1.8) : base;
    // Heavy attack has 15% miss chance
    if (heavy && Math.random() < 0.15) return { dmg: 0, miss: true };
    const isCrit = Math.random() < this.crit;
    if (isCrit) dmg = Math.floor(dmg * 1.65);
    // Small random variance ±15%
    dmg = Math.max(1, Math.floor(dmg * (0.85 + Math.random() * 0.30)));
    return { dmg, crit: isCrit, miss: false };
  }

  computeAbilityDamage(ability) {
    const base = this.atk;
    let dmg = Math.floor(base * ability.dmgMult);
    const isCrit = ability.alwaysCrit || Math.random() < this.crit;
    if (isCrit) dmg = Math.floor(dmg * 1.5);
    return { dmg, crit: isCrit };
  }

  takeDamage(amount) {
    // Defence reduces damage
    const dmg = Math.max(1, amount - this.def);
    this.hp = Math.max(0, this.hp - dmg);
    return dmg;
  }

  heal(amount) {
    const prev = this.hp;
    this.hp = Math.min(this.effectiveMaxHp, this.hp + amount);
    return this.hp - prev;
  }

  restoreEnergy(amount) {
    const prev = this.en;
    this.en = Math.min(this.effectiveMaxEn, this.en + amount);
    return this.en - prev;
  }

  isAlive() { return this.hp > 0; }

  // =====================================================
  //  COMBAT STATE  (buffs / turn ticks)
  // =====================================================
  startCombat() {
    this.defending    = false;
    this.stunned      = false;
    this.atkBuff      = 0;
    this.atkBuffTurns = 0;
    this.defBuff      = 0;
    this.defBuffTurns = 0;
    this.defMult      = 1;
    this.defMultTurns = 0;
  }

  tickTurn() {
    this.defending = false;
    this.stunned   = false;
    if (this.atkBuffTurns > 0) { this.atkBuffTurns--; if (!this.atkBuffTurns) this.atkBuff = 0; }
    if (this.defBuffTurns > 0) { this.defBuffTurns--; if (!this.defBuffTurns) this.defBuff = 0; }
    if (this.defMultTurns > 0) { this.defMultTurns--; if (!this.defMultTurns) this.defMult = 1; }
  }

  applyDefend() {
    this.defending = true;
    this.defMult   = 2.0;
    this.defMultTurns = 1;
  }

  applyItemBuff(item) {
    if (item.hpRestore) this.heal(Math.min(item.hpRestore, this.effectiveMaxHp));
    if (item.enRestore) this.restoreEnergy(item.enRestore);
    if (item.atkBuff)   { this.atkBuff += item.atkBuff; this.atkBuffTurns = item.buffDur || 3; }
    if (item.defBuff)   { this.defBuff += item.defBuff; this.defBuffTurns = item.buffDur || 3; }
  }

  // =====================================================
  //  SERIALIZATION
  // =====================================================
  toJSON() {
    return {
      name: this.name, level: this.level, xp: this.xp, credits: this.credits,
      maxHp: this.maxHp, hp: this.hp, maxEn: this.maxEn, en: this.en,
      _baseAtk: this._baseAtk, _baseDef: this._baseDef,
      _baseSpd: this._baseSpd, _baseCrit: this._baseCrit,
      inventory: this.inventory.toJSON(),
      equipment: this.equipment.toJSON(),
      abilities: this.abilities,
      totalKills: this.totalKills, totalDamage: this.totalDamage,
      sectorsCleared: this.sectorsCleared, escapes: this.escapes,
      abilitiesUsed: this.abilitiesUsed, itemsCollected: this.itemsCollected,
    };
  }

  fromJSON(data) {
    Object.assign(this, data);
    this.inventory = new Inventory();
    this.inventory.fromJSON(data.inventory || { items: [] });
    this.equipment = new Equipment();
    this.equipment.fromJSON(data.equipment || {});
    this.abilities = data.abilities || [];
    this.startCombat();
  }

  // Quick status summary for UI
  statusObject() {
    return {
      name: this.name, level: this.level, xp: this.xp,
      hp: this.hp, maxHp: this.effectiveMaxHp,
      en: this.en, maxEn: this.effectiveMaxEn,
      atk: this.atk, def: this.def, spd: this.spd,
      crit: this.crit, credits: this.credits,
      xpProgress: this.xpProgress(),
      defending: this.defending, stunned: this.stunned,
      atkBuff: this.atkBuff, defBuff: this.defBuff,
    };
  }
}
