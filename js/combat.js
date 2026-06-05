// =====================================================
//  combat.js  – Turn-based combat engine
// =====================================================

const COMBAT_STATE = {
  IDLE:        'idle',
  PLAYER_TURN: 'player_turn',
  ANIM_PLAYER: 'anim_player',
  ENEMY_TURN:  'enemy_turn',
  ANIM_ENEMY:  'anim_enemy',
  WIN:         'win',
  LOSE:        'lose',
  ESCAPED:     'escaped',
};

class CombatEngine {
  constructor(player, enemy, renderer, ui) {
    this.player   = player;
    this.enemy    = enemy;
    this.renderer = renderer;
    this.ui       = ui;
    this.state    = COMBAT_STATE.IDLE;
    this.turn     = 1;
    this.log      = [];
    this.locked   = false;  // prevents double-input
    this._animQ   = [];     // animation step queue
    this._onEnd   = null;   // callback(result)
  }

  // =====================================================
  //  START / END
  // =====================================================
  start(sectorId, onEnd) {
    this.sectorId  = sectorId;
    this._onEnd    = onEnd;
    this.turn      = 1;
    this.log       = [];
    this.locked    = false;

    this.player.startCombat();
    this.renderer.setScene(sectorId, this._playerRenderData(), this.enemy.renderData());
    this.renderer.start();

    // Determine who goes first based on speed
    if (this.enemy.spd > this.player.spd + 4) {
      this._addLog(`${this.enemy.name} acts first!`, 'warn');
      this.state = COMBAT_STATE.ENEMY_TURN;
      setTimeout(() => this._doEnemyTurn(), 600);
    } else {
      this.state = COMBAT_STATE.PLAYER_TURN;
    }
    this.ui.refreshCombatUI(this);
  }

  // =====================================================
  //  PLAYER ACTIONS
  // =====================================================
  playerAction(action) {
    if (this.locked || this.state !== COMBAT_STATE.PLAYER_TURN) return;
    this.locked = true;
    this.state  = COMBAT_STATE.ANIM_PLAYER;

    switch (action.type) {
      case 'attack':     this._playerAttack(false); break;
      case 'heavy':      this._playerAttack(true);  break;
      case 'defend':     this._playerDefend();      break;
      case 'item':       this._playerItem(action.item); break;
      case 'ability':    this._playerAbility(action.ability); break;
      case 'escape':     this._playerEscape();       break;
    }
  }

  _playerAttack(heavy) {
    const result = this.player.computeAttack(heavy);
    const label  = heavy ? 'Heavy Attack' : 'Attack';

    if (result.miss) {
      audio.miss();
      this._addLog(`${label} MISSED!`, 'miss');
      this.ui.showDamageNumber(0, 'enemy', 'miss');
      this.player.totalDamage += 0;
      this._afterPlayerAction();
      return;
    }

    // Animate projectile, then deal damage
    const projColor  = heavy ? '#ff8800' : '#44aaff';
    const projType   = heavy ? 'energy' : 'laser';
    const soundFn    = heavy ? () => audio.heavyShot() : () => audio.laserShot();

    soundFn();
    this._animProjectile(projType, projColor, 'player', () => {
      const actualDmg = this.enemy.takeDamage(result.dmg);
      this.player.totalDamage += actualDmg;

      if (result.crit) {
        audio.criticalHit();
        this._addLog(`${label} – CRITICAL! ${actualDmg} damage!`, 'crit');
        this.ui.showDamageNumber(actualDmg, 'enemy', 'crit');
        this.renderer.spawnEffect('explosion', 'enemy');
      } else {
        audio.enemyHit();
        this._addLog(`${label} – ${actualDmg} damage.`, 'player');
        this.ui.showDamageNumber(actualDmg, 'enemy', 'player');
        this.renderer.spawnEffect('hit', 'enemy');
      }
      this.renderer.flashEnemy();
      this.ui.refreshCombatUI(this);

      if (!this.enemy.isAlive()) { this._victory(); return; }
      this._afterPlayerAction();
    });
  }

  _playerDefend() {
    audio.defend();
    this.player.applyDefend();
    this._addLog(`You raise your shields. DEF doubled this turn.`, 'info');
    this.renderer.spawnEffect('shield', 'player');
    this.ui.refreshCombatUI(this);
    this._afterPlayerAction(200);
  }

  _playerItem(item) {
    if (!item) { this.locked = false; this.state = COMBAT_STATE.PLAYER_TURN; return; }

    // Damage item targeting enemy
    if (item.directDmg) {
      const actualDmg = this.enemy.takeDamage(item.directDmg);
      audio.heavyShot();
      this._addLog(`Used ${item.name} – ${actualDmg} damage to ${this.enemy.name}!`, 'player');
      this.ui.showDamageNumber(actualDmg, 'enemy', 'player');
      this.renderer.flashEnemy();
      this.renderer.spawnEffect('explosion', 'enemy');
      this.player.inventory.remove(item.uid);
      this.ui.refreshCombatUI(this);
      if (!this.enemy.isAlive()) { this._victory(); return; }
      this._afterPlayerAction();
      return;
    }

    // Self-use item
    this.player.applyItemBuff(item);
    audio.heal();
    this._addLog(`Used ${item.name}.`, 'info');
    this.renderer.spawnEffect('heal', 'player');
    this.player.inventory.remove(item.uid);
    this.ui.refreshCombatUI(this);
    this._afterPlayerAction(300);
  }

  _playerAbility(ability) {
    if (!ability) { this.locked = false; this.state = COMBAT_STATE.PLAYER_TURN; return; }
    if (this.player.en < ability.cost) {
      this._addLog(`Not enough Energy for ${ability.name}!`, 'warn');
      this.locked = false;
      this.state = COMBAT_STATE.PLAYER_TURN;
      return;
    }

    this.player.en -= ability.cost;
    this.player.abilitiesUsed++;
    audio.ability();

    if (ability.type === 'attack') {
      this._doAbilityAttack(ability);
    } else if (ability.type === 'defend') {
      this._doAbilityDefend(ability);
    } else if (ability.type === 'heal') {
      this._doAbilityHeal(ability);
    }
  }

  _doAbilityAttack(ability) {
    const result = this.player.computeAbilityDamage(ability);
    this.renderer.spawnEffect('ability', 'enemy');
    audio.criticalHit();

    let totalDmg = 0;
    if (ability.hitCount) {
      // Multi-hit
      for (let i = 0; i < ability.hitCount; i++) {
        const perHit = Math.floor(result.dmg * ability.hitMult);
        const actual = this.enemy.takeDamage(perHit);
        totalDmg += actual;
        this.player.totalDamage += actual;
      }
      this._addLog(`${ability.name} – ${ability.hitCount} hits for ${totalDmg} total!`, 'crit');
    } else {
      const actual = this.enemy.takeDamage(result.dmg);
      totalDmg = actual;
      this.player.totalDamage += actual;
      this._addLog(`${ability.name} – ${actual} damage${result.crit ? ' (CRITICAL!)' : ''}!`, 'crit');
    }
    this.ui.showDamageNumber(totalDmg, 'enemy', 'crit');

    // Apply debuffs
    if (ability.stunChance && Math.random() < ability.stunChance) {
      this.enemy.stunned = true;
      audio.stun();
      this._addLog(`${this.enemy.name} is STUNNED!`, 'warn');
    }
    if (ability.defDebuff) {
      this.enemy.defDebuff = ability.defDebuff;
      this.enemy.defDebuffTurns = ability.debuffDur;
      this._addLog(`${this.enemy.name}'s DEF reduced by ${ability.defDebuff}!`, 'warn');
    }

    this.renderer.flashEnemy();
    this.ui.refreshCombatUI(this);
    if (!this.enemy.isAlive()) { this._victory(); return; }
    this._afterPlayerAction(400);
  }

  _doAbilityDefend(ability) {
    this.player.defMult      = ability.defMult || 2;
    this.player.defMultTurns = ability.duration || 3;
    this.player.defending    = true;
    this.renderer.spawnEffect('shield', 'player');
    this._addLog(`${ability.name} – DEF ×${ability.defMult} for ${ability.duration} turns!`, 'info');
    this.ui.refreshCombatUI(this);
    this._afterPlayerAction(300);
  }

  _doAbilityHeal(ability) {
    const amount = Math.floor(this.player.effectiveMaxHp * ability.healPct);
    const actual = this.player.heal(amount);
    this.renderer.spawnEffect('heal', 'player');
    this.ui.showDamageNumber(actual, 'player', 'heal');
    this._addLog(`${ability.name} – Healed ${actual} HP!`, 'heal');
    this.ui.refreshCombatUI(this);
    this._afterPlayerAction(300);
  }

  _playerEscape() {
    const escapeChance = 0.5 + (this.player.spd - this.enemy.spd) * 0.03;
    if (Math.random() < Math.max(0.15, Math.min(0.85, escapeChance))) {
      audio.escape();
      this._addLog(`You escape from combat!`, 'info');
      this.player.escapes++;
      this.state = COMBAT_STATE.ESCAPED;
      setTimeout(() => { this.renderer.stop(); this._onEnd({ result: 'escaped' }); }, 600);
    } else {
      audio.cancel();
      this._addLog(`Escape failed!`, 'warn');
      this._afterPlayerAction(200);
    }
  }

  // =====================================================
  //  ENEMY TURN
  // =====================================================
  _doEnemyTurn() {
    if (!this.enemy.isAlive() || !this.player.isAlive()) return;

    // Snapshot stun state BEFORE tickTurn clears it, so it applies for this round.
    const wasStunned = this.enemy.stunned;
    // Tick enemy buffs at the START of the enemy's turn.
    // Player buffs tick at the END (after enemy attacks), preserving defend for this round.
    this.enemy.tickTurn();

    if (wasStunned) {
      this._addLog(`${this.enemy.name} is stunned and loses its turn!`, 'warn');
      this._afterEnemyAction(400);
      return;
    }

    const action = this.enemy.chooseAction(this.player);

    switch (action.type) {
      case 'attack':        this._enemyAttack(action.attack, false); break;
      case 'heavy':         this._enemyAttack(action.attack, true);  break;
      case 'defend':        this._enemyDefend(); break;
      case 'heal':          this._enemyHeal(); break;
      case 'special_attack':this._enemySpecial(action.attack); break;
      default:              this._enemyAttack(action.attack, false);
    }
  }

  _enemyAttack(attackName, heavy) {
    const result = this.enemy.computeAttack(heavy);
    const flavours = ATTACK_TEXTS[attackName] || ['attacks!'];
    const flavour  = flavours[Math.floor(Math.random() * flavours.length)];

    let logType = 'enemy';
    let actualDmg;

    if (this.player.defending) {
      // Halved by shield (defMult already applied in takeDamage)
      actualDmg = this.player.takeDamage(result.dmg);
      audio.shieldBlock();
      this._addLog(`${this.enemy.name} ${flavour} Blocked! ${actualDmg} damage.`, 'enemy');
      this.renderer.spawnEffect('shield', 'player');
    } else {
      actualDmg = this.player.takeDamage(result.dmg);
      audio.playerHit();
      if (result.crit) {
        this._addLog(`${this.enemy.name} ${flavour} CRITICAL! ${actualDmg} damage!`, 'crit');
        this.renderer.spawnEffect('explosion', 'player');
      } else {
        this._addLog(`${this.enemy.name} ${flavour} ${actualDmg} damage.`, 'enemy');
        this.renderer.spawnEffect('hit', 'player');
      }
    }

    this.ui.showDamageNumber(actualDmg, 'player', result.crit ? 'crit' : 'enemy');
    this.renderer.flashPlayer();
    this.ui.refreshCombatUI(this);

    if (!this.player.isAlive()) { this._defeat(); return; }
    this._afterEnemyAction();
  }

  _enemyDefend() {
    this.enemy.defending = true;
    this.enemy.defMult   = 1.8;
    this.enemy.defMultTurns = 1;
    audio.defend();
    this._addLog(`${this.enemy.name} takes a defensive stance.`, 'info');
    this.renderer.spawnEffect('shield', 'enemy');
    this.ui.refreshCombatUI(this);
    this._afterEnemyAction(300);
  }

  _enemyHeal() {
    const amount = this.enemy.computeHealAmount();
    const actual = this.enemy.heal(amount);
    audio.heal();
    this._addLog(`${this.enemy.name} recovers ${actual} HP!`, 'enemy');
    this.renderer.spawnEffect('heal', 'enemy');
    this.ui.showDamageNumber(actual, 'enemy', 'heal');
    this.ui.refreshCombatUI(this);
    this._afterEnemyAction(400);
  }

  _enemySpecial(attackName) {
    // Special boss attacks deal bonus damage and have side effects
    const baseDmg = Math.floor(this.enemy.effectiveAtk * 1.9);
    const result  = { dmg: baseDmg, crit: Math.random() < this.enemy.crit * 1.5 };
    if (result.crit) result.dmg = Math.floor(result.dmg * 1.4);
    const actualDmg = this.player.takeDamage(result.dmg);

    audio.explosion();
    const flavours = ATTACK_TEXTS[attackName] || ['uses a special ability!'];
    const flavour  = flavours[Math.floor(Math.random() * flavours.length)];
    this._addLog(`★ ${this.enemy.name} ${flavour} ${actualDmg} damage!`, 'boss');
    this.ui.showDamageNumber(actualDmg, 'player', result.crit ? 'crit' : 'enemy');
    this.renderer.flashPlayer();
    this.renderer.spawnEffect('explosion', 'player');
    this.ui.refreshCombatUI(this);

    if (!this.player.isAlive()) { this._defeat(); return; }
    this._afterEnemyAction(400);
  }

  // =====================================================
  //  OUTCOME
  // =====================================================
  _victory() {
    this.state = COMBAT_STATE.WIN;
    this.player.totalKills++;
    const loot = this.enemy.rollLoot(this.sectorId);
    audio.victory();
    this.renderer.spawnEffect('explosion', 'enemy');
    this.renderer.stop();
    setTimeout(() => {
      this._onEnd({ result: 'win', loot });
    }, 800);
  }

  _defeat() {
    this.state = COMBAT_STATE.LOSE;
    audio.defeat();
    this.renderer.stop();
    setTimeout(() => {
      this._onEnd({ result: 'lose' });
    }, 800);
  }

  // =====================================================
  //  FLOW HELPERS
  // =====================================================
  _afterPlayerAction(delay = 300) {
    this.ui.refreshCombatUI(this);
    setTimeout(() => {
      this.state  = COMBAT_STATE.ENEMY_TURN;
      this.locked = false;
      this._doEnemyTurn();
    }, delay);
  }

  _afterEnemyAction(delay = 200) {
    this.turn++;
    // Tick player buffs AFTER the enemy has finished attacking this round.
    this.player.tickTurn();
    // Regen small energy each round
    const enRegen = Math.floor(this.player.effectiveMaxEn * 0.06);
    this.player.restoreEnergy(enRegen);

    this.state  = COMBAT_STATE.PLAYER_TURN;
    this.locked = false;
    this.ui.refreshCombatUI(this);
  }

  _animProjectile(type, color, from, onDone) {
    // Animate using repeated redraws with progress
    const STEPS  = 12;
    let step = 0;
    const tick = () => {
      const progress = step / STEPS;
      // The battle renderer draws scene each frame, so we just spawn a particle here
      if (step === STEPS / 2) {
        this.renderer.spawnEffect('energy', from === 'player' ? 'enemy' : 'player');
      }
      step++;
      if (step <= STEPS) {
        requestAnimationFrame(tick);
      } else {
        onDone();
      }
    };
    // Quick laser sound + spawn effect
    if (from === 'player') this.renderer.spawnEffect('laser', 'player');
    requestAnimationFrame(tick);
  }

  // =====================================================
  //  LOGGING
  // =====================================================
  _addLog(text, type = 'info') {
    this.log.push({ text, type, turn: this.turn });
    this.ui.appendCombatLog(text, type);
  }

  // =====================================================
  //  DATA FOR RENDERER
  // =====================================================
  _playerRenderData() {
    return {
      spriteKey: 'player',
      hp: this.player.hp,
      maxHp: this.player.effectiveMaxHp,
      defending: this.player.defending,
      stunned: this.player.stunned,
      boss: false,
    };
  }
}
