// =====================================================
//  enemy.js  – Enemy class and AI
// =====================================================

class Enemy {
  constructor(defId, sectorId = 1) {
    const def = ENEMY_DEFS[defId];
    if (!def) throw new Error(`Unknown enemy: ${defId}`);
    this.defId    = defId;
    this.def      = def;
    this.name     = def.name;
    this.spriteKey = def.sprite;
    this.color    = def.color;
    this.boss     = !!def.boss;
    this.elite    = !!def.elite;
    this.sectorId = sectorId;

    // Scale HP and stats by sector / elite modifier
    const sectorMult  = 1 + (sectorId - 1) * 0.12;
    const eliteMult   = def.elite ? 1.5 : 1;
    this.maxHp   = Math.floor(def.hp   * sectorMult * eliteMult);
    this.hp      = this.maxHp;
    this.atk     = Math.floor(def.atk  * sectorMult);
    this.def     = Math.floor(def.def  * sectorMult);
    this.spd     = def.spd;
    this.crit    = def.crit;

    this.attacks = [...def.attacks];
    this.xp      = Math.floor(def.xp   * sectorMult);
    this.credits = def.credits;
    this.loot    = def.loot;
    this.dropGuaranteed = def.dropGuaranteed || [];

    // AI state
    this.defending    = false;
    this.stunned      = false;
    this.defMult      = 1;
    this.defMultTurns = 0;
    this.atkBuff      = 0;
    this.atkBuffTurns = 0;
    this.defDebuff    = 0;
    this.defDebuffTurns = 0;
    this.phaseThreshold = 0.5;  // bosses change phase at 50% HP
    this.phase = 1;
    this.turnCount = 0;
  }

  // =====================================================
  //  COMBAT STATS
  // =====================================================
  get effectiveAtk() { return this.atk + this.atkBuff; }
  get effectiveDef() {
    const base = Math.max(0, this.def - this.defDebuff);
    return Math.round(base * this.defMult);
  }

  takeDamage(amount) {
    const dmg = Math.max(1, amount - this.effectiveDef);
    this.hp   = Math.max(0, this.hp - dmg);
    // Boss phase 2
    if (this.boss && this.phase === 1 && this.hp / this.maxHp < this.phaseThreshold) {
      this.phase = 2;
      this.atk = Math.floor(this.atk * 1.25);
    }
    return dmg;
  }

  heal(amount) {
    const prev = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    return this.hp - prev;
  }

  isAlive() { return this.hp > 0; }

  tickTurn() {
    this.defending = false;
    this.stunned   = false;
    if (this.defMultTurns  > 0) { this.defMultTurns--;  if (!this.defMultTurns)  this.defMult = 1; }
    if (this.atkBuffTurns  > 0) { this.atkBuffTurns--;  if (!this.atkBuffTurns)  this.atkBuff = 0; }
    if (this.defDebuffTurns> 0) { this.defDebuffTurns--; if (!this.defDebuffTurns) this.defDebuff = 0; }
  }

  // =====================================================
  //  AI: choose an action
  // =====================================================
  chooseAction(player) {
    this.turnCount++;
    const hpPct  = this.hp / this.maxHp;
    const roll   = Math.random();

    // Boss special patterns
    if (this.boss) return this._bossAction(player, hpPct, roll);

    // Elite enemies are more aggressive
    if (this.elite) return this._eliteAction(player, hpPct, roll);

    // Standard AI
    // Low HP: sometimes defend or heal
    if (hpPct < 0.25 && roll < 0.25) return { type: 'defend' };
    // Occasionally use heavy attack
    if (roll < 0.15) return { type: 'heavy', attack: this._pickAttack() };
    // Standard attack
    return { type: 'attack', attack: this._pickAttack() };
  }

  _bossAction(player, hpPct, roll) {
    const phase = this.phase;
    // Phase 2: more special attacks
    if (phase === 2) {
      if (roll < 0.10) return { type: 'defend' };
      if (roll < 0.25) return { type: 'special_attack', attack: this._pickBossSpecial() };
      if (roll < 0.35 && hpPct < 0.3) return { type: 'heal' };
      return { type: 'attack', attack: this._pickAttack() };
    }
    // Phase 1
    if (roll < 0.08) return { type: 'defend' };
    if (roll < 0.20) return { type: 'special_attack', attack: this._pickBossSpecial() };
    if (roll < 0.28 && hpPct < 0.5) return { type: 'heal' };
    return { type: 'attack', attack: this._pickAttack() };
  }

  _eliteAction(player, hpPct, roll) {
    if (roll < 0.20) return { type: 'heavy', attack: this._pickAttack() };
    if (roll < 0.30 && hpPct < 0.3) return { type: 'defend' };
    return { type: 'attack', attack: this._pickAttack() };
  }

  _pickAttack() {
    return this.attacks[Math.floor(Math.random() * this.attacks.length)];
  }

  _pickBossSpecial() {
    // Bosses have special attacks in later positions of the array
    const specials = this.attacks.slice(Math.min(2, this.attacks.length - 1));
    return specials[Math.floor(Math.random() * specials.length)];
  }

  // =====================================================
  //  COMPUTE ENEMY DAMAGE OUTPUT
  // =====================================================
  computeAttack(heavy = false) {
    const base = this.effectiveAtk;
    let dmg    = heavy ? Math.floor(base * 1.6) : base;
    const isCrit = Math.random() < this.crit;
    if (isCrit) dmg = Math.floor(dmg * 1.5);
    dmg = Math.max(1, Math.floor(dmg * (0.85 + Math.random() * 0.30)));
    return { dmg, crit: isCrit };
  }

  computeHealAmount() {
    return Math.floor(this.maxHp * 0.20);
  }

  // =====================================================
  //  LOOT ROLL
  // =====================================================
  rollLoot(sectorId) {
    const drops = itemSystem.generateLoot(this.loot, sectorId);
    // Guaranteed drops for bosses
    for (const id of this.dropGuaranteed) {
      if (!drops.find(d => d.id === id)) {
        const item = itemSystem.createItem(id);
        if (item) drops.push(item);
      }
    }
    const credits = itemSystem.rollCredits(this.credits, sectorId);
    return { items: drops, xp: this.xp, credits };
  }

  // =====================================================
  //  DATA FOR RENDERER
  // =====================================================
  renderData() {
    return {
      spriteKey: this.spriteKey,
      hp: this.hp, maxHp: this.maxHp,
      defending: this.defending,
      stunned: this.stunned,
      boss: this.boss,
    };
  }

  // =====================================================
  //  SERIALIZATION
  // =====================================================
  toJSON() {
    return {
      defId: this.defId, sectorId: this.sectorId,
      hp: this.hp, maxHp: this.maxHp,
      atk: this.atk, def: this.def, spd: this.spd,
      phase: this.phase, turnCount: this.turnCount,
    };
  }

  static fromJSON(data) {
    const e = new Enemy(data.defId, data.sectorId);
    e.hp = data.hp; e.maxHp = data.maxHp;
    e.atk = data.atk; e.def = data.def; e.spd = data.spd;
    e.phase = data.phase; e.turnCount = data.turnCount;
    return e;
  }
}

// =====================================================
//  ENEMY FACTORY
// =====================================================
const EnemyFactory = {
  // Create a random combat encounter enemy for a sector
  randomForSector(sectorDef, elite = false) {
    const pool = elite ? sectorDef.eliteEnemies : sectorDef.enemies;
    const id   = pool[Math.floor(Math.random() * pool.length)];
    return new Enemy(id, sectorDef.id);
  },

  // Create the sector boss
  boss(sectorDef) {
    return new Enemy(sectorDef.boss, sectorDef.id);
  },

  fromJSON(data) { return Enemy.fromJSON(data); },
};
