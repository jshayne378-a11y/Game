// =====================================================
//  game.js  – Main Game Controller
//  Orchestrates all systems; handles state machine
// =====================================================

const GAME_STATE = {
  MENU:       'menu',
  MAP:        'map',
  EXPLORE:    'explore',
  COMBAT:     'combat',
  LOOT:       'loot',
  LEVELUP:    'levelup',
  INVENTORY:  'inventory',
  EQUIPMENT:  'equipment',
  CHARSHEET:  'charsheet',
  SECTOR_WIN: 'sector_win',
  GAME_COMPLETE: 'game_complete',
  GAME_OVER:  'game_over',
};

class Game {
  constructor() {
    this.state    = GAME_STATE.MENU;
    this.player   = null;
    this.dungeon  = null;
    this.combat   = null;
    this.ui       = new UIManager();
    this.renderer = null;   // BattleRenderer, created on first combat
    this.bgStars  = null;   // StarField for main background

    // Current loot (buffered between combat and loot screen)
    this._pendingLoot  = null;
    this._pendingLevel = null;
    this._prevState    = null;

    // Selected sector on map
    this._selectedSector = 1;

    this._init();
  }

  // =====================================================
  //  INIT
  // =====================================================
  _init() {
    // Background star canvas
    const bgCanvas = document.getElementById('bg-canvas');
    bgCanvas.width  = 900;
    bgCanvas.height = 620;
    this.bgStars = new StarField(bgCanvas);

    // Animate background
    const bgLoop = () => {
      this.bgStars.update(this.dungeon?.currentSectorId || 1);
      this.bgStars.draw(this.dungeon?.currentSectorId || 1);
      requestAnimationFrame(bgLoop);
    };
    bgLoop();

    // Menu ship animation
    this._animMenuShip();

    // Check for existing save
    if (SaveSystem.hasSave()) {
      const btn = document.getElementById('btn-continue');
      if (btn) btn.disabled = false;
    }

    // Wire up all UI events
    this._bindMenuEvents();
    this._bindHUDEvents();
    this._bindCombatEvents();
    this._bindScreenCloseEvents();
    this._bindKeyboard();

    this.ui.showScreen('menu');
  }

  // =====================================================
  //  MENU SHIP ANIMATION
  // =====================================================
  _animMenuShip() {
    const canvas = document.getElementById('menu-ship-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;
    const SHIP = {
      palette: {
        'W': '#aabbcc', 'L': '#ccddee', 'B': '#334466',
        'G': '#44ffee', 'R': '#ff4444', 'Y': '#ffcc00',
        'E': '#4488ff', '.': null,
      },
      pixels: [
        '......W......',
        '....WWWWW....',
        '...WWLLLWW...',
        '..WWLLGLLWW..',
        '.BWWWWWWWWWB.',
        'BBWWWWRWWWWBB',
        'BBWWWYWYWWWBB',
        '.BBWWWWWWWBB.',
        '..BBBWWWBBB..',
        '....EEEEE....',
      ],
    };
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bob = Math.sin(t * 0.04) * 4;
      const scale = 5;
      const rows = SHIP.pixels.length, cols = SHIP.pixels[0].length;
      const x = (canvas.width  - cols * scale) / 2;
      const y = (canvas.height - rows * scale) / 2 + bob;
      drawSprite(ctx, SHIP, x, y, scale);

      // Engine glow
      ctx.fillStyle = `rgba(68,136,255,${0.3 + Math.sin(t * 0.08) * 0.2})`;
      ctx.shadowBlur = 10 + Math.sin(t * 0.08) * 5;
      ctx.shadowColor = '#4488ff';
      ctx.fillRect(x + 5 * scale, y + rows * scale, 3 * scale, 4);
      ctx.shadowBlur = 0;

      t++;
      requestAnimationFrame(loop);
    };
    loop();
  }

  // =====================================================
  //  EVENT BINDING
  // =====================================================
  _bindMenuEvents() {
    const on = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
    on('btn-new-game', () => { audio.confirm(); this.newGame(); });
    on('btn-continue', () => { audio.confirm(); this.loadGame(); });
    on('btn-achievements', () => { audio.click(); this._showAchievements(); });
    on('btn-about', () => { audio.click(); this.ui.showScreen('about'); });
    on('btn-about-close', () => { audio.cancel(); this.ui.showScreen('menu'); });
    on('btn-ach-close', () => { audio.cancel(); this.ui.showScreen('menu'); });
  }

  _bindHUDEvents() {
    const on = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
    on('btn-inv',   () => { audio.click(); this._openInventory(); });
    on('btn-equip', () => { audio.click(); this._openEquipment(); });
    on('btn-chars', () => { audio.click(); this._openCharSheet(); });
    on('btn-save',  () => { audio.save();  this._saveGame(); });
  }

  _bindCombatEvents() {
    const on = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
    on('cb-attack',  () => { audio.click(); this._combatAction('attack'); });
    on('cb-heavy',   () => { audio.click(); this._combatAction('heavy'); });
    on('cb-defend',  () => { audio.click(); this._combatAction('defend'); });
    on('cb-item',    () => { audio.click(); this._combatPickItem(); });
    on('cb-ability', () => { audio.click(); this._combatPickAbility(); });
    on('cb-escape',  () => { audio.click(); this._combatAction('escape'); });
  }

  _bindScreenCloseEvents() {
    const on = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };

    // Inventory
    on('btn-inv-close',   () => { audio.cancel(); this._closeOverlay(); });
    on('btn-equip-close', () => { audio.cancel(); this._closeOverlay(); });
    on('btn-char-close',  () => { audio.cancel(); this._closeOverlay(); });

    // Level up
    on('btn-levelup-ok', () => { audio.confirm(); this._onLevelUpOk(); });

    // Loot
    on('btn-loot-ok', () => { audio.confirm(); this._onLootOk(); });

    // Sector win
    on('btn-next-sector', () => { audio.confirm(); this._goToNextSector(); });
    on('btn-swin-map',    () => { audio.click();   this._goToMap(); });

    // Game complete
    on('btn-gcomplete-menu', () => { audio.confirm(); this._returnToMenu(); });

    // Game over
    on('btn-retry',   () => { audio.confirm(); this._retrySector(); });
    on('btn-go-menu', () => { audio.cancel();  this._returnToMenu(); });

    // Map
    on('btn-enter-sector', () => { audio.confirm(); this._enterSelectedSector(); });
  }

  _bindKeyboard() {
    document.addEventListener('keydown', e => {
      if (this.state === GAME_STATE.COMBAT) {
        const map = { '1':'attack','2':'heavy','3':'defend','4':'item','5':'ability','6':'escape' };
        if (map[e.key]) {
          if (e.key === '4') this._combatPickItem();
          else if (e.key === '5') this._combatPickAbility();
          else this._combatAction(map[e.key]);
        }
      }
      if (e.key === 'i' || e.key === 'I') this._openInventory();
      if (e.key === 'e' || e.key === 'E') this._openEquipment();
      if (e.key === 's' || e.key === 'S') this._saveGame();
      if (e.key === 'Escape') this._closeOverlay();
    });
  }

  // =====================================================
  //  NEW GAME
  // =====================================================
  newGame() {
    this.player  = new Player();
    this.dungeon = new DungeonSystem();

    // Give starter items
    this.player.inventory.add(itemSystem.createItem('med_pack_s', 2));
    this.player.inventory.add(itemSystem.createItem('energy_cell', 1));
    this.player.inventory.add(itemSystem.createItem('laser_pistol'));

    // Auto-equip starter weapon
    const weapon = this.player.inventory.items.find(i => i.type === 'weapon');
    if (weapon) this.player.equipment.equip(weapon, this.player.inventory);

    this._saveGame();
    this._goToMap();
  }

  // =====================================================
  //  LOAD GAME
  // =====================================================
  loadGame() {
    const data = SaveSystem.load();
    if (!data) { this.ui.toast('No save found.'); return; }

    this.player  = new Player();
    this.player.fromJSON(data.player);
    this.dungeon = new DungeonSystem();
    this.dungeon.fromJSON(data.dungeon);

    this._goToMap();
  }

  // =====================================================
  //  SAVE GAME
  // =====================================================
  _saveGame() {
    if (!this.player || !this.dungeon) return;
    const ok = SaveSystem.save({
      player:  this.player.toJSON(),
      dungeon: this.dungeon.toJSON(),
    });
    this.ui.toast(ok ? 'Game saved.' : 'Save failed!');
    if (ok) {
      const btn = document.getElementById('btn-continue');
      if (btn) btn.disabled = false;
    }
  }

  // =====================================================
  //  MAP
  // =====================================================
  _goToMap() {
    this.state = GAME_STATE.MAP;
    this.ui.showHUD(true);
    this.ui.showScreen('map');

    // Select first unlocked uncleared sector by default
    const next = this.dungeon.nextUnlockedSector() || 1;
    this._selectedSector = next;

    this.ui.renderSectorMap(this.dungeon, (id) => {
      this._selectedSector = id;
      const def = SECTOR_DEFS.find(s => s.id === id);
      this.ui.updateMapSidePanel(def, this.dungeon);
    });

    // Show info for default selection
    const def = SECTOR_DEFS.find(s => s.id === this._selectedSector);
    this.ui.updateMapSidePanel(def, this.dungeon);
    this.ui.refreshHUD(this.player, this.dungeon);
  }

  _enterSelectedSector() {
    const id = this._selectedSector;
    if (!this.dungeon.isSectorUnlocked(id)) {
      this.ui.toast('Sector locked!');
      return;
    }
    this.dungeon.enterSector(id);
    this.ui.refreshHUD(this.player, this.dungeon);
    this._enterCurrentRoom();
  }

  // =====================================================
  //  EXPLORATION
  // =====================================================
  _enterCurrentRoom() {
    const room    = this.dungeon.currentRoom;
    const sector  = this.dungeon.sectorDef;
    this.state    = GAME_STATE.EXPLORE;
    this.ui.showHUD(true);
    this.ui.showScreen('explore');
    this.ui.refreshHUD(this.player, this.dungeon);

    const canvas = document.getElementById('room-canvas');
    const actions = this._buildExploreActions(room);
    this.ui.showRoom(room, canvas, sector, actions);
  }

  _buildExploreActions(room) {
    if (room.type === 'combat' || room.type === 'ambush' || room.type === 'elite' || room.type === 'boss') {
      return [
        { label: '⚔️ ENGAGE', primary: true, handler: () => this._startCombat(room) },
        { label: '📊 REVIEW STATS',       handler: () => this._openCharSheet() },
        { label: '🎒 OPEN INVENTORY',     handler: () => this._openInventory() },
      ];
    }
    if (room.type === 'treasure') {
      return [
        { label: '💰 SEARCH AREA', primary: true, handler: () => this._doTreasure(room) },
        { label: '⏭ SKIP AHEAD',           handler: () => this._advanceRoom() },
      ];
    }
    if (room.type === 'healing') {
      return [
        { label: '💊 USE AID STATION', primary: true, handler: () => this._doHealing(room) },
        { label: '⏭ SKIP AHEAD',              handler: () => this._advanceRoom() },
      ];
    }
    return [
      { label: '▶ PROCEED', primary: true, handler: () => this._advanceRoom() },
    ];
  }

  _doTreasure(room) {
    if (room.cleared) { this.ui.addRoomLog('Already searched.'); return; }
    room.cleared = true;
    const items   = itemSystem.generateTreasureLoot(this.dungeon.currentSectorId);
    const credits = itemSystem.rollCredits([20, 50], this.dungeon.currentSectorId);
    this.player.credits += credits;
    items.forEach(item => {
      const added = this.player.inventory.add(item);
      if (added) this.player.itemsCollected++;
    });
    this.ui.addRoomLog(`Found ${credits} credits!`);
    items.forEach(item => this.ui.addRoomLog(`Found: ${item.icon} ${item.name} (${item.rarity})`));
    AchievementSystem.checkAll(this.player, this.dungeon, d => this.ui.showAchievement(d));
    audio.itemPickup();
    this.ui.refreshHUD(this.player, this.dungeon);
    // Replace actions with 'proceed'
    this.ui._renderExploreActions([
      { label: '▶ PROCEED', primary: true, handler: () => this._advanceRoom() },
    ]);
  }

  _doHealing(room) {
    if (room.cleared) { this.ui.addRoomLog('Already used.'); return; }
    room.cleared = true;
    const healAmt = Math.floor(this.player.effectiveMaxHp * 0.50);
    const enAmt   = Math.floor(this.player.effectiveMaxEn * 0.50);
    const hpGained = this.player.heal(healAmt);
    const enGained = this.player.restoreEnergy(enAmt);
    this.ui.addRoomLog(`Restored ${hpGained} HP and ${enGained} Energy.`);
    audio.heal();
    this.ui.refreshHUD(this.player, this.dungeon);
    this.ui._renderExploreActions([
      { label: '▶ PROCEED', primary: true, handler: () => this._advanceRoom() },
    ]);
  }

  _advanceRoom() {
    this.dungeon.markRoomCleared();
    const more = this.dungeon.advance();
    if (more) {
      this._enterCurrentRoom();
    } else {
      // Sector fully cleared
      this._sectorComplete();
    }
  }

  // =====================================================
  //  COMBAT START
  // =====================================================
  _startCombat(room) {
    const sector = this.dungeon.sectorDef;
    const enemy  = room.type === 'boss'
      ? EnemyFactory.boss(sector)
      : EnemyFactory.randomForSector(sector, room.type === 'elite');

    // Create battle canvas renderer
    const battleCanvas = document.getElementById('battle-canvas');
    if (!this.renderer) {
      this.renderer = new BattleRenderer(battleCanvas);
    }

    this.state = GAME_STATE.COMBAT;
    this.ui.showScreen('combat');
    this.ui.showHUD(true);
    this.ui.setupCombatScreen(enemy);
    this.ui.refreshHUD(this.player, this.dungeon);

    // Build combat engine
    this.combat = new CombatEngine(this.player, enemy, this.renderer, this.ui);
    this.ui._combatRef = this.combat;

    // Handle ambush: enemy goes first (handled inside engine)
    if (room.isAmbush()) {
      this.ui.appendCombatLog('AMBUSH! Enemy strikes first!', 'warn');
    }

    this.combat.start(this.dungeon.currentSectorId, (result) => {
      this._onCombatEnd(result, room);
    });

    if (enemy.boss) audio.bossDefeated;  // will play on boss enter
  }

  _combatAction(type) {
    if (!this.combat || this.state !== GAME_STATE.COMBAT) return;
    this.combat.playerAction({ type });
  }

  _combatPickItem() {
    if (!this.combat || this.state !== GAME_STATE.COMBAT) return;
    const items = this.player.inventory.getUsable();
    this.ui.showItemPicker(items, (item) => {
      this.combat.playerAction({ type: 'item', item });
    });
  }

  _combatPickAbility() {
    if (!this.combat || this.state !== GAME_STATE.COMBAT) return;
    if (!this.player.abilities.length) {
      this.ui.toast('No abilities unlocked yet!');
      return;
    }
    this.ui.showAbilityPicker(this.player.abilities, this.player.en, (ab) => {
      this.combat.playerAction({ type: 'ability', ability: ab });
    });
  }

  // =====================================================
  //  COMBAT RESULT
  // =====================================================
  _onCombatEnd(result, room) {
    if (result.result === 'escaped') {
      // Return to exploration
      this._enterCurrentRoom();
      return;
    }

    if (result.result === 'lose') {
      this.state = GAME_STATE.GAME_OVER;
      this.ui.showScreen('gameover');
      this.ui.showGameOver(this.player);
      return;
    }

    // WIN
    room.cleared = true;
    const loot = result.loot;

    // Apply credits
    this.player.credits += loot.credits;

    // Add items to inventory
    loot.items.forEach(item => {
      const added = this.player.inventory.add(item);
      if (added) {
        this.player.itemsCollected++;
        if (item.rarity === 'legendary') audio.legendaryPickup();
      }
    });

    // Check crit achievement
    if (this.combat.log.some(l => l.type === 'crit' && l.text.includes('CRITICAL'))) {
      AchievementSystem.unlockCritAchievement(d => this.ui.showAchievement(d));
    }

    // XP gain (may level up)
    const xpGain   = loot.xp;
    const levelled = this.player.addXP(xpGain);

    // Check achievements
    AchievementSystem.checkAll(this.player, this.dungeon, d => this.ui.showAchievement(d));

    this._pendingLoot  = loot;
    this._pendingLevel = levelled;

    this.ui.showScreen('loot');
    this.ui.showLoot({ ...loot, xp: xpGain });
  }

  _onLootOk() {
    if (this._pendingLevel) {
      this._showLevelUp(this._pendingLevel);
      this._pendingLevel = null;
    } else {
      this._pendingLoot = null;
      this._afterCombatWin();
    }
  }

  _showLevelUp(levelData) {
    this.state = GAME_STATE.LEVELUP;
    audio.levelUp();
    this.ui.showScreen('levelup');
    this.ui.showLevelUp(levelData);
  }

  _onLevelUpOk() {
    this._pendingLoot = null;
    this._afterCombatWin();
  }

  _afterCombatWin() {
    this._saveGame();
    // Was this the boss room?
    if (this.dungeon.isBossRoom) {
      this._sectorComplete();
    } else {
      this._advanceRoom();
    }
  }

  // =====================================================
  //  SECTOR COMPLETE
  // =====================================================
  _sectorComplete() {
    this.dungeon.markSectorCleared();
    this.player.sectorsCleared++;

    AchievementSystem.checkAll(this.player, this.dungeon, d => this.ui.showAchievement(d));
    audio.bossDefeated();
    this._saveGame();

    if (this.dungeon.allSectorsCleared()) {
      this._gameComplete();
      return;
    }

    this.state = GAME_STATE.SECTOR_WIN;
    this.ui.showScreen('sectorwin');
    this.ui.showSectorWin(this.dungeon.sectorDef, this.player, false);
  }

  _goToNextSector() {
    const next = this.dungeon.nextUnlockedSector();
    if (next) {
      this._goToMap();
    } else {
      this._goToMap();
    }
  }

  // =====================================================
  //  GAME COMPLETE
  // =====================================================
  _gameComplete() {
    this.state = GAME_STATE.GAME_COMPLETE;
    this.ui.showScreen('gamecomplete');
    const el = document.getElementById('gcomplete-msg');
    if (el) el.innerHTML = `
      <div style="margin-bottom:16px;">Congratulations, Commander!</div>
      <div style="color:#88aaff">You have cleared all 5 sectors and defeated</div>
      <div style="color:#88aaff">the Void Sovereign. The galaxy is safe.</div>
      <div style="margin-top:16px;color:#666688">
        Final Level: ${this.player.level}<br>
        Total Kills: ${this.player.totalKills}<br>
        Credits Earned: ${this.player.credits}
      </div>
    `;
  }

  // =====================================================
  //  OVERLAYS (inventory / equipment / charsheet)
  // =====================================================
  _openInventory() {
    this._prevState = this.state;
    this.state = GAME_STATE.INVENTORY;
    this.ui.showScreen('inventory');
    this.ui.renderInventory(this.player, action => {
      if (action.action === 'use') {
        if (!action.item.usable) return;
        this.player.applyItemBuff(action.item);
        this.player.inventory.remove(action.item.uid);
        audio.heal();
        this.ui.toast(`Used ${action.item.name}`);
        this.ui.renderInventory(this.player, () => {});
        this.ui.refreshHUD(this.player, this.dungeon);
      } else if (action.action === 'equip') {
        this.player.equipment.equip(action.item, this.player.inventory);
        audio.itemPickup();
        this.ui.toast(`Equipped ${action.item.name}`);
        this.ui.renderInventory(this.player, () => {});
        this.ui.refreshHUD(this.player, this.dungeon);
      } else if (action.action === 'unequip') {
        this.player.equipment.unequip(action.slot, this.player.inventory);
        audio.cancel();
        this.ui.toast(`Unequipped`);
        this.ui.renderInventory(this.player, () => {});
        this.ui.refreshHUD(this.player, this.dungeon);
      }
    });
    this.ui.refreshHUD(this.player, this.dungeon);
  }

  _openEquipment() {
    this._prevState = this.state;
    this.state = GAME_STATE.EQUIPMENT;
    this.ui.showScreen('equipment');
    this.ui.renderEquipment(this.player, action => {
      if (action.action === 'unequip') {
        this.player.equipment.unequip(action.slot, this.player.inventory);
        audio.cancel();
        this.ui.renderEquipment(this.player, () => {});
        this.ui.refreshHUD(this.player, this.dungeon);
      }
    });
  }

  _openCharSheet() {
    this._prevState = this.state;
    this.state = GAME_STATE.CHARSHEET;
    this.ui.showScreen('charsheet');
    const canvas = document.getElementById('char-canvas');
    this.ui.renderCharSheet(this.player, canvas);
  }

  _closeOverlay() {
    const prev = this._prevState || GAME_STATE.MAP;
    if (prev === GAME_STATE.EXPLORE) {
      this.ui.showScreen('explore');
    } else if (prev === GAME_STATE.COMBAT) {
      this.ui.showScreen('combat');
    } else {
      this._goToMap();
    }
    this.state = prev;
  }

  // =====================================================
  //  GAME OVER / RETRY
  // =====================================================
  _retrySector() {
    // Restart current sector, player keeps XP/levels but not sector progress
    const sectorId = this.dungeon.currentSectorId;
    this.player.hp = Math.floor(this.player.effectiveMaxHp * 0.6);
    this.player.en = this.player.effectiveMaxEn;
    this.player.startCombat();
    this.dungeon.enterSector(sectorId);
    this._goToMap();
  }

  _returnToMenu() {
    this.player  = null;
    this.dungeon = null;
    this.combat  = null;
    this.renderer = null;
    this.ui.showHUD(false);
    this.ui.showScreen('menu');
    this.state = GAME_STATE.MENU;
  }

  _showAchievements() {
    this.ui.showScreen('achievements');
    this.ui.renderAchievements();
  }
}

// =====================================================
//  RESPONSIVE SCALING
//  Scales the fixed 900×620 game container to fill the
//  available viewport while preserving the aspect ratio.
// =====================================================
const GAME_W = 900, GAME_H = 620;

function scaleGame() {
  const container = document.getElementById('game-container');
  const wrap      = document.getElementById('game-wrap');
  if (!container || !wrap) return;

  const vw    = wrap.clientWidth  || window.innerWidth;
  const vh    = wrap.clientHeight || window.innerHeight;
  const scale = Math.min(vw / GAME_W, vh / GAME_H);

  // Centre the scaled container inside the wrapper
  const left = Math.floor((vw - GAME_W * scale) / 2);
  const top  = Math.floor((vh - GAME_H * scale) / 2);

  container.style.transform      = `scale(${scale})`;
  container.style.transformOrigin = 'top left';
  container.style.position        = 'absolute';
  container.style.left            = left + 'px';
  container.style.top             = top  + 'px';
}

// =====================================================
//  BOOT
// =====================================================
window.addEventListener('DOMContentLoaded', () => {
  scaleGame();
  window.addEventListener('resize',              scaleGame);
  window.addEventListener('orientationchange',   () => setTimeout(scaleGame, 120));
  window.game = new Game();
});
