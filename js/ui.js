// =====================================================
//  ui.js  – UI Manager: screens, HUD, panels, modals
// =====================================================

class UIManager {
  constructor() {
    this.activeScreen = 'menu';
    this._combatRef   = null;

    // Cache DOM elements
    this.$ = id => document.getElementById(id);

    // Screens
    this.screens = {
      menu:          this.$('screen-menu'),
      map:           this.$('screen-map'),
      explore:       this.$('screen-explore'),
      combat:        this.$('screen-combat'),
      inventory:     this.$('screen-inventory'),
      equipment:     this.$('screen-equipment'),
      charsheet:     this.$('screen-charsheet'),
      levelup:       this.$('screen-levelup'),
      loot:          this.$('screen-loot'),
      sectorwin:     this.$('screen-sector-win'),
      gamecomplete:  this.$('screen-game-complete'),
      gameover:      this.$('screen-gameover'),
      achievements:  this.$('screen-achievements'),
      about:         this.$('screen-about'),
    };
  }

  // =====================================================
  //  SCREEN MANAGEMENT
  // =====================================================
  showScreen(name) {
    for (const [k, el] of Object.entries(this.screens)) {
      if (el) el.style.display = 'none';
    }
    const el = this.screens[name];
    if (el) {
      el.style.display = 'flex';
      el.style.animation = 'slide-in-left 0.2s ease';
    }
    this.activeScreen = name;
  }

  showHUD(show) {
    const hud = this.$('hud');
    if (hud) hud.classList.toggle('hidden', !show);
  }

  // =====================================================
  //  HUD UPDATE
  // =====================================================
  refreshHUD(player, dungeon) {
    const p  = player.statusObject();
    const sd = dungeon.sectorDef;

    const pct = v => Math.max(0, Math.min(100, v)) + '%';

    this._setBar('hud-hp-bar',  pct(100 * p.hp  / p.maxHp));
    this._setBar('hud-en-bar',  pct(100 * p.en  / p.maxEn));
    this._setBar('hud-xp-bar',  pct(100 * p.xpProgress));
    this._setText('hud-name',   p.name.toUpperCase());
    this._setText('hud-hp-num', `${p.hp}/${p.maxHp}`);
    this._setText('hud-en-num', `${p.en}/${p.maxEn}`);
    this._setText('hud-lv-num', `LV.${p.level}`);

    // Change HP bar colour at low health
    const hpBar = this.$('hud-hp-bar');
    if (hpBar) {
      hpBar.style.background = p.hp / p.maxHp < 0.25 ? '#ff4444'
                             : p.hp / p.maxHp < 0.5  ? '#ffaa00'
                             : '#44ff88';
    }

    if (sd) {
      this._setText('hud-sector', sd.shortName);
      const room = dungeon.currentRoom;
      this._setText('hud-room', room ? `${room.icon} ${room.title}` : '');
    }
  }

  _setBar(id, pct)  { const el = this.$(id); if (el) el.style.width = pct; }
  _setText(id, txt) { const el = this.$(id); if (el) el.textContent = txt; }

  // =====================================================
  //  SECTOR MAP
  // =====================================================
  renderSectorMap(dungeon, onSelect) {
    const canvas = this.$('map-canvas');
    if (!canvas) return;
    const ctx  = canvas.getContext('2d');
    const W    = canvas.width, H = canvas.height;
    const nodes = dungeon.mapLayout();

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#05050f';
    ctx.fillRect(0, 0, W, H);

    // Grid dots
    ctx.fillStyle = 'rgba(60,60,120,0.3)';
    for (let x = 0; x < W; x += 20) for (let y = 0; y < H; y += 20)
      ctx.fillRect(x, y, 1, 1);

    // Connections (draw lines between sectors in order)
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i], b = nodes[i + 1];
      const ax = a.x * W, ay = a.y * H, bx = b.x * W, by = b.y * H;
      ctx.strokeStyle = b.unlocked ? 'rgba(68,136,255,0.5)' : 'rgba(40,40,80,0.4)';
      ctx.lineWidth   = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Nodes
    nodes.forEach(node => {
      const nx = node.x * W, ny = node.y * H;
      const r = 18;

      if (!node.unlocked) {
        // Locked
        ctx.fillStyle   = '#0a0a20';
        ctx.strokeStyle = '#222244';
        ctx.lineWidth   = 2;
        ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#333355'; ctx.font = '10px monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('?', nx, ny);
      } else {
        const clr = node.cleared ? '#226622' : '#223366';
        const bdr = node.cleared ? '#44ff88' : node.current ? '#44aaff' : '#4455cc';
        // Glow
        if (node.current || node.cleared) {
          ctx.shadowBlur = 12; ctx.shadowColor = bdr;
        }
        ctx.fillStyle   = clr;
        ctx.strokeStyle = bdr;
        ctx.lineWidth   = node.current ? 3 : 2;
        ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = node.cleared ? '#88ffaa' : '#88aaff';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(node.def.id, nx, ny - 2);
        ctx.font = '6px monospace';
        ctx.fillText(node.cleared ? '✓' : '', nx, ny + 7);
      }

      // Sector name below node
      ctx.font      = '6px monospace';
      ctx.fillStyle = node.unlocked ? '#8899bb' : '#333355';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(node.def.shortName, nx, ny + r + 4);
    });

    // Click handler (stored on canvas)
    canvas.onclick = null;
    canvas.onclick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx   = (e.clientX - rect.left) * (W / rect.width);
      const my   = (e.clientY - rect.top)  * (H / rect.height);
      nodes.forEach(node => {
        if (!node.unlocked) return;
        const nx = node.x * W, ny = node.y * H;
        if (Math.hypot(mx - nx, my - ny) < 22) {
          audio.click();
          onSelect(node.def.id);
        }
      });
    };
  }

  updateMapSidePanel(sectorDef, dungeon) {
    const unlocked = dungeon.isSectorUnlocked(sectorDef.id);
    const cleared  = dungeon.isSectorCleared(sectorDef.id);
    this._setText('map-sector-title', sectorDef.name);
    this._setText('map-sector-desc',  unlocked ? sectorDef.desc : '??? LOCKED ???');
    const boss = ENEMY_DEFS[sectorDef.boss];
    this._setText('map-sector-boss',  unlocked ? `BOSS: ${boss ? boss.name : '???'}` : '');
    const btn = this.$('btn-enter-sector');
    if (btn) {
      btn.disabled = !unlocked;
      btn.textContent = cleared ? 'WARP IN (REVISIT)' : 'WARP IN';
    }
  }

  // =====================================================
  //  EXPLORATION
  // =====================================================
  showRoom(room, roomCanvas, sectorDef, actions) {
    this._setText('room-title-bar', `${room.icon} ${room.title.toUpperCase()}`);

    const log = this.$('room-log');
    if (log) log.innerHTML = `<div class="room-log-entry">${room.desc}</div>`;

    this._renderRoomCanvas(roomCanvas, room, sectorDef);
    this._renderExploreActions(actions);
  }

  _renderRoomCanvas(canvas, room, sectorDef) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    // Sector-themed background
    const bgColors = {
      mine:   { top: '#0a0605', bot: '#150e08' },
      pirate: { top: '#080808', bot: '#0f0a0a' },
      hive:   { top: '#050a05', bot: '#080e08' },
      ruins:  { top: '#080808', bot: '#0a0a06' },
      void:   { top: '#04000a', bot: '#080012' },
    };
    const theme = bgColors[sectorDef.theme] || bgColors.mine;
    const grad  = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, theme.top); grad.addColorStop(1, theme.bot);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Draw floor
    const floorY = H * 0.7;
    ctx.fillStyle = 'rgba(60,50,40,0.3)';
    ctx.fillRect(0, floorY, W, H - floorY);

    // Grid texture on floor
    ctx.strokeStyle = 'rgba(80,70,60,0.2)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 24) {
      ctx.beginPath(); ctx.moveTo(x, floorY); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = floorY; y < H; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Room type visual centrepiece
    const cx = W / 2, cy = floorY - 20;
    const roomVisuals = {
      combat:   () => this._drawSword(ctx, cx, cy),
      elite:    () => this._drawSkull(ctx, cx, cy),
      treasure: () => this._drawChest(ctx, cx, cy),
      healing:  () => this._drawCross(ctx, cx, cy),
      ambush:   () => this._drawWarning(ctx, cx, cy),
      boss:     () => this._drawCrown(ctx, cx, cy),
    };
    (roomVisuals[room.type] || roomVisuals.combat)();
  }

  _drawSword(ctx, cx, cy) {
    ctx.fillStyle = '#aabbcc';
    ctx.fillRect(cx - 4, cy - 30, 8, 40);
    ctx.fillStyle = '#ccddee';
    ctx.fillRect(cx - 12, cy - 5, 24, 8);
    ctx.fillStyle = '#886644';
    ctx.fillRect(cx - 4, cy + 10, 8, 15);
  }

  _drawSkull(ctx, cx, cy) {
    ctx.fillStyle = '#cccccc';
    ctx.beginPath(); ctx.arc(cx, cy - 12, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.ellipse(cx - 6, cy - 12, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 6, cy - 12, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(cx - 12, cy + 4, 24, 10);
    ctx.fillStyle = '#333';
    for (let i = 0; i < 3; i++) ctx.fillRect(cx - 9 + i * 8, cy + 6, 6, 6);
  }

  _drawChest(ctx, cx, cy) {
    ctx.fillStyle = '#885522';
    ctx.fillRect(cx - 22, cy - 14, 44, 28);
    ctx.fillStyle = '#aa7733';
    ctx.fillRect(cx - 22, cy - 14, 44, 16);
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(cx - 3,  cy - 3, 6, 6);
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 22, cy - 14, 44, 28);
  }

  _drawCross(ctx, cx, cy) {
    ctx.fillStyle = '#44ff88';
    ctx.shadowBlur = 10; ctx.shadowColor = '#44ff88';
    ctx.fillRect(cx - 5, cy - 24, 10, 40);
    ctx.fillRect(cx - 20, cy - 8, 40, 10);
    ctx.shadowBlur = 0;
  }

  _drawWarning(ctx, cx, cy) {
    ctx.fillStyle = '#ff4400';
    ctx.shadowBlur = 8; ctx.shadowColor = '#ff4400';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 28); ctx.lineTo(cx + 24, cy + 14); ctx.lineTo(cx - 24, cy + 14);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 20px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('!', cx, cy);
    ctx.shadowBlur = 0;
  }

  _drawCrown(ctx, cx, cy) {
    ctx.fillStyle = '#ffcc00';
    ctx.shadowBlur = 15; ctx.shadowColor = '#ffcc00';
    ctx.beginPath();
    ctx.moveTo(cx - 24, cy + 12);
    ctx.lineTo(cx - 24, cy - 10);
    ctx.lineTo(cx - 8,  cy + 0);
    ctx.lineTo(cx,      cy - 18);
    ctx.lineTo(cx + 8,  cy + 0);
    ctx.lineTo(cx + 24, cy - 10);
    ctx.lineTo(cx + 24, cy + 12);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
  }

  _renderExploreActions(actions) {
    const container = this.$('explore-actions');
    if (!container) return;
    container.innerHTML = '';
    actions.forEach(a => {
      const btn = document.createElement('button');
      btn.className = 'action-btn';
      if (a.primary) btn.className += ' green-btn';
      btn.textContent = a.label;
      btn.addEventListener('click', () => { audio.click(); a.handler(); });
      container.appendChild(btn);
    });
  }

  addRoomLog(text) {
    const log = this.$('room-log');
    if (!log) return;
    const div = document.createElement('div');
    div.style.cssText = 'font-size:7px; color:#8899bb; line-height:1.9; margin-top:4px;';
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  // =====================================================
  //  COMBAT UI
  // =====================================================
  setupCombatScreen(enemy) {
    this._setText('enemy-name-tag', enemy.boss ? `★ ${enemy.name} ★` : enemy.name);
    this._setBar('enemy-hp-bar', '100%');
    this._setText('enemy-hp-num', `${enemy.hp}/${enemy.maxHp}`);
    const log = this.$('combat-log-inner');
    if (log) log.innerHTML = '';
    this._clearStatusIcons('enemy-status-icons');
    this._clearStatusIcons('player-status-icons');
  }

  refreshCombatUI(engine) {
    const p = engine.player, e = engine.enemy;

    // Player bars (in HUD)
    const pst = p.statusObject();
    this._setBar('hud-hp-bar',  (100 * pst.hp / pst.maxHp) + '%');
    this._setBar('hud-en-bar',  (100 * pst.en / pst.maxEn) + '%');
    this._setText('hud-hp-num', `${pst.hp}/${pst.maxHp}`);
    this._setText('hud-en-num', `${pst.en}/${pst.maxEn}`);

    // Enemy bar
    const ePct = Math.max(0, e.hp / e.maxHp);
    this._setBar('enemy-hp-bar',  (ePct * 100) + '%');
    this._setText('enemy-hp-num', `${e.hp}/${e.maxHp}`);

    // Status icons
    this._renderStatusIcons('player-status-icons', p);
    this._renderStatusIcons('enemy-status-icons',  e);

    // Enable/disable ability button based on energy
    const ablBtn = this.$('cb-ability');
    if (ablBtn) ablBtn.disabled = p.abilities.length === 0;

    // Disable item button if no usable items
    const itmBtn = this.$('cb-item');
    if (itmBtn) itmBtn.disabled = p.inventory.getUsable().length === 0;

    // Lock all buttons during animation
    const locked = engine.locked;
    ['cb-attack','cb-heavy','cb-defend','cb-item','cb-ability','cb-escape'].forEach(id => {
      const btn = this.$(id);
      if (btn && engine.state !== 'player_turn') btn.disabled = true;
      else if (btn) btn.disabled = false;
    });

    // Update renderer data
    engine.renderer.playerData = engine._playerRenderData();
    engine.renderer.enemyData  = engine.enemy.renderData();
  }

  _renderStatusIcons(containerId, entity) {
    const el = this.$(containerId);
    if (!el) return;
    el.innerHTML = '';
    const add = (label, cls) => {
      const span = document.createElement('span');
      span.className = `status-icon ${cls}`;
      span.textContent = label;
      el.appendChild(span);
    };
    if (entity.defending) add('SHIELD', 'status-defend');
    if (entity.stunned)   add('STUN',   'status-stun');
    if (entity.atkBuff > 0) add(`ATK+${entity.atkBuff}`, 'status-defend');
    if (entity.defBuff > 0) add(`DEF+${entity.defBuff}`, 'status-defend');
    if (entity.defDebuff > 0) add(`DEF-${entity.defDebuff}`, 'status-stun');
  }

  _clearStatusIcons(id) { const el = this.$(id); if (el) el.innerHTML = ''; }

  appendCombatLog(text, type) {
    const log = this.$('combat-log-inner');
    if (!log) return;
    const colors = {
      player: '#88aaff', enemy: '#ff8888', crit: '#ffcc00',
      heal: '#44ff88', info: '#7799bb', warn: '#ffaa44',
      boss: '#ff44ff', miss: '#666688',
    };
    const div = document.createElement('div');
    div.style.cssText = `color:${colors[type] || '#7799bb'};`;
    div.textContent = `[T${this._combatRef?.turn || ''}] ${text}`;
    log.appendChild(div);
    log.parentElement.scrollTop = log.scrollHeight;
  }

  // =====================================================
  //  ABILITY PICKER MODAL
  // =====================================================
  showAbilityPicker(abilities, energyCurrent, onPick) {
    const lines = abilities.map((ab, i) => {
      const canUse = energyCurrent >= ab.cost;
      return `<button class="action-btn${canUse ? '' : ''}" style="width:100%;text-align:left;font-size:6px;opacity:${canUse?1:0.4};margin-bottom:4px;"
        data-idx="${i}" ${canUse?'':'disabled'}>
        ${ab.icon} ${ab.name} [${ab.cost}EN] – ${ab.desc}
      </button>`;
    }).join('');
    this.showModal('CHOOSE ABILITY', lines, [], () => {});
    // Attach click handlers
    setTimeout(() => {
      document.querySelectorAll('#modal-body button[data-idx]').forEach(btn => {
        btn.addEventListener('click', () => {
          const ab = abilities[parseInt(btn.dataset.idx)];
          this.closeModal();
          onPick(ab);
        });
      });
    }, 50);
  }

  // =====================================================
  //  ITEM PICKER MODAL
  // =====================================================
  showItemPicker(items, onPick) {
    if (!items.length) {
      this.showModal('NO ITEMS', '<div>No usable items in inventory.</div>',
        [{ label:'OK', action: () => this.closeModal() }]);
      return;
    }
    const lines = items.map((item, i) => {
      const color = itemSystem.rarityColor(item.rarity);
      return `<button class="action-btn" style="width:100%;text-align:left;font-size:6px;margin-bottom:4px;color:${color};" data-idx="${i}">
        ${item.icon} ${item.name} ×${item.qty} – ${item.desc}
      </button>`;
    }).join('');
    this.showModal('USE ITEM', lines, [], () => {});
    setTimeout(() => {
      document.querySelectorAll('#modal-body button[data-idx]').forEach(btn => {
        btn.addEventListener('click', () => {
          const it = items[parseInt(btn.dataset.idx)];
          this.closeModal();
          onPick(it);
        });
      });
    }, 50);
  }

  // =====================================================
  //  INVENTORY SCREEN
  // =====================================================
  renderInventory(player, onItemSelect) {
    const grid   = this.$('inv-grid');
    const detail = this.$('inv-detail-inner');
    const count  = this.$('inv-count');
    if (!grid) return;

    const items  = player.inventory.getAll();
    if (count) count.textContent = `${items.length}/${player.inventory.maxSlots}`;

    grid.innerHTML = '';
    items.forEach(item => {
      const slot = document.createElement('div');
      slot.className = `inv-slot rarity-${item.rarity}`;
      slot.innerHTML = `<span class="slot-icon">${item.icon}</span>
        <span class="slot-name">${item.name}</span>
        ${item.type === 'consumable' ? `<span class="slot-qty">×${item.qty}</span>` : ''}`;
      slot.addEventListener('click', () => {
        audio.click();
        grid.querySelectorAll('.inv-slot').forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');
        this._renderItemDetail(item, player, detail, onItemSelect);
      });
      grid.appendChild(slot);
    });
    if (!items.length) {
      grid.innerHTML = '<div style="color:#334466;font-size:7px;padding:8px;">EMPTY</div>';
    }
  }

  _renderItemDetail(item, player, detailEl, onItemSelect) {
    const color  = itemSystem.rarityColor(item.rarity);
    const stats  = itemSystem.formatStats(item);
    const equipped = (player.equipment[item.type] || null)?.id === item.id;
    detailEl.innerHTML = `
      <div style="color:${color};font-size:8px;margin-bottom:8px;">${item.icon} ${item.name}</div>
      <div style="color:#ff9900;font-size:6px;" class="rarity-tag rarity-${item.rarity}">${item.rarity.toUpperCase()}</div>
      <div style="color:#8899bb;font-size:6px;margin:6px 0;">${item.desc}</div>
      ${stats.map(s => `<div style="color:#44ff88;font-size:6px;">+ ${s}</div>`).join('')}
      <div style="color:#666688;font-size:5px;margin-top:8px;">VALUE: ${item.value} credits</div>
      ${equipped ? '<div style="color:#4488ff;font-size:6px;">★ EQUIPPED</div>' : ''}
    `;

    const actionEl = this.$('inv-action-btns');
    if (!actionEl) return;
    actionEl.innerHTML = '';
    if (item.usable) {
      const btn = this._mkBtn('USE', 'action-btn green-btn', () => {
        onItemSelect({ action: 'use', item });
      });
      actionEl.appendChild(btn);
    }
    if (['weapon','armor','artifact'].includes(item.type) && !equipped) {
      const btn = this._mkBtn('EQUIP', 'action-btn', () => {
        onItemSelect({ action: 'equip', item });
      });
      actionEl.appendChild(btn);
    }
    if (equipped) {
      const btn = this._mkBtn('UNEQUIP', 'action-btn', () => {
        onItemSelect({ action: 'unequip', slot: item.type });
      });
      actionEl.appendChild(btn);
    }
  }

  // =====================================================
  //  EQUIPMENT SCREEN
  // =====================================================
  renderEquipment(player, onAction) {
    const slotsEl = this.$('equip-slots');
    const statsEl = this.$('equip-stats');
    if (!slotsEl) return;

    const slots = ['weapon','armor','artifact'];
    const labels = { weapon: '⚔️ WEAPON', armor: '🦺 ARMOR', artifact: '🔮 ARTIFACT' };

    slotsEl.innerHTML = '';
    slots.forEach(slot => {
      const item  = player.equipment[slot];
      const row   = document.createElement('div');
      row.className = 'equip-slot-row';
      const color = item ? itemSystem.rarityColor(item.rarity) : '#334466';
      row.innerHTML = `
        <span class="equip-slot-label">${labels[slot]}</span>
        <span class="equip-slot-item" style="color:${color}">
          ${item ? `${item.icon} ${item.name}` : '<span class="equip-slot-empty">— empty —</span>'}
        </span>
      `;
      if (item) {
        const unequipBtn = this._mkBtn('−', 'hud-btn', () => {
          audio.click(); onAction({ action: 'unequip', slot });
        });
        row.appendChild(unequipBtn);
      }
      slotsEl.appendChild(row);
    });

    // Total stats panel
    const eq = itemSystem.getEquipStats(player.equipment);
    const p  = player.statusObject();
    statsEl.innerHTML = `
      <div style="color:#44ffee;font-size:8px;margin-bottom:8px;">TOTAL STATS</div>
      <div>ATK ${p.atk} <span style="color:#44ff88">(+${eq.atk})</span></div>
      <div>DEF ${p.def} <span style="color:#44ff88">(+${eq.def})</span></div>
      <div>SPD ${p.spd} <span style="color:#44ff88">(+${eq.spd})</span></div>
      <div>CRIT ${(p.crit*100).toFixed(0)}% <span style="color:#44ff88">(+${(eq.crit*100).toFixed(0)}%)</span></div>
      <div>MAX HP ${p.maxHp} <span style="color:#44ff88">(+${eq.maxHp})</span></div>
      <div>MAX EN ${p.maxEn} <span style="color:#44ff88">(+${eq.maxEn})</span></div>
    `;
  }

  // =====================================================
  //  CHARACTER SHEET
  // =====================================================
  renderCharSheet(player, canvas) {
    const p = player.statusObject();
    const statsEl = this.$('char-stats');
    const ablEl   = this.$('char-abilities');

    if (statsEl) statsEl.innerHTML = `
      <div style="color:#44ffee;font-size:8px;margin-bottom:10px;">
        ${player.name.toUpperCase()} — LV.${p.level}
      </div>
      <div>HP  ${p.hp} / ${p.maxHp}</div>
      <div>EN  ${p.en} / ${p.maxEn}</div>
      <div>XP  ${player.xp} / ${player.xpToNext()}</div>
      <hr style="border-color:#222244;margin:8px 0">
      <div>ATK  ${p.atk}</div>
      <div>DEF  ${p.def}</div>
      <div>SPD  ${p.spd}</div>
      <div>CRIT ${(p.crit*100).toFixed(0)}%</div>
      <hr style="border-color:#222244;margin:8px 0">
      <div>CREDITS  ${p.credits}</div>
      <div style="color:#888">KILLS    ${player.totalKills}</div>
      <div style="color:#888">SECTORS  ${player.sectorsCleared}</div>
    `;

    if (ablEl) {
      ablEl.innerHTML = '<div style="color:#bb44ff;font-size:7px;margin-bottom:6px;">ABILITIES</div>';
      player.abilities.forEach(ab => {
        ablEl.innerHTML += `<div style="margin-bottom:4px;">
          <span style="color:#ffcc00">${ab.icon} ${ab.name}</span>
          <span style="color:#446688;font-size:5px"> [${ab.cost}EN]</span>
          <div style="color:#556677;font-size:5px">${ab.desc}</div>
        </div>`;
      });
      if (!player.abilities.length) ablEl.innerHTML += '<div style="color:#334466">No abilities yet. Level up!</div>';
    }

    // Draw player sprite on canvas
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#060612';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawSprite(ctx, SPRITES.player, 20, 20, 5);
    }
  }

  // =====================================================
  //  LEVEL UP SCREEN
  // =====================================================
  showLevelUp(levelData) {
    const g = levelData.gains;
    this._setText('levelup-new-level', `LEVEL ${levelData.level}`);
    this.$('levelup-gains').innerHTML = `
      <div style="color:#44ff88">+ ${g.maxHp} Max HP</div>
      <div style="color:#4488ff">+ ${g.maxEn} Max Energy</div>
      <div style="color:#ffcc00">+ ${g.atk} Attack</div>
      <div style="color:#aaffcc">+ ${g.def} Defense</div>
      <div style="color:#aaccff">+ ${g.spd} Speed</div>
      <div style="color:#ff88ff">+ ${(g.crit*100).toFixed(0)}% Crit Chance</div>
    `;
    const ablEl = this.$('levelup-ability');
    if (levelData.newAbility) {
      ablEl.innerHTML = `<div style="color:#bb44ff">NEW ABILITY UNLOCKED:</div>
        <div style="color:#ffcc00;margin-top:6px;">${levelData.newAbility.icon} ${levelData.newAbility.name}</div>
        <div style="color:#8877aa;font-size:6px;margin-top:4px;">${levelData.newAbility.desc}</div>`;
    } else {
      ablEl.innerHTML = '';
    }
  }

  // =====================================================
  //  LOOT SCREEN
  // =====================================================
  showLoot(lootData) {
    this._setText('loot-xp',      `+ ${lootData.xp} XP`);
    this._setText('loot-credits', `+ ${lootData.credits} CREDITS`);
    const itemsEl = this.$('loot-items');
    if (!itemsEl) return;
    itemsEl.innerHTML = '';
    if (!lootData.items.length) {
      itemsEl.innerHTML = '<div style="color:#334466;font-size:7px;">No items dropped.</div>';
      return;
    }
    lootData.items.forEach(item => {
      const color = itemSystem.rarityColor(item.rarity);
      const card  = document.createElement('div');
      card.className = `loot-item-card rarity-${item.rarity}`;
      card.style.borderColor = color;
      card.style.color       = color;
      card.innerHTML = `${item.icon}<br>${item.name}`;
      itemsEl.appendChild(card);
    });
  }

  // =====================================================
  //  SECTOR WIN SCREEN
  // =====================================================
  showSectorWin(sectorDef, player, isLastSector) {
    this.$('swin-msg').innerHTML = `
      <div style="color:#ffcc00;font-size:10px;margin-bottom:12px;">${sectorDef.name}</div>
      <div>Sector cleared! Well done, Commander.</div>
    `;
    const p = player.statusObject();
    this.$('swin-stats').innerHTML = `
      LV.${p.level}  ·  HP ${p.hp}/${p.maxHp}  ·  ${player.totalKills} KILLS
    `;
    const nextBtn = this.$('btn-next-sector');
    if (nextBtn) {
      if (isLastSector) {
        nextBtn.style.display = 'none';
      } else {
        nextBtn.style.display = '';
        nextBtn.textContent = 'NEXT SECTOR ▶';
      }
    }
  }

  // =====================================================
  //  GAME OVER
  // =====================================================
  showGameOver(player) {
    const p = player.statusObject();
    this.$('gameover-stats').innerHTML = `
      LV.${p.level}  ·  ${player.totalKills} KILLS  ·  ${player.sectorsCleared} SECTORS
    `;
  }

  // =====================================================
  //  ACHIEVEMENTS SCREEN
  // =====================================================
  renderAchievements() {
    const grid = this.$('ach-grid');
    if (!grid) return;
    grid.innerHTML = '';
    ACHIEVEMENT_DEFS.forEach(def => {
      const unlocked = AchievementSystem.isUnlocked(def.id);
      const card = document.createElement('div');
      card.className = `ach-card ${unlocked ? 'unlocked' : 'locked'}`;
      card.innerHTML = `<div class="ach-icon">${def.icon}</div>
        <div class="ach-name">${def.name}</div>
        <div class="ach-desc">${unlocked ? def.desc : '???'}</div>`;
      grid.appendChild(card);
    });
  }

  // =====================================================
  //  FLOATING DAMAGE NUMBERS
  // =====================================================
  showDamageNumber(amount, side, type) {
    const layer = this.$('dmg-layer');
    if (!layer) return;

    const el = document.createElement('div');
    el.className = `dmg-num ${type}-dmg`;

    // Approximate positions based on side
    const baseX = side === 'enemy' ? 65 : 22;
    const x = baseX + (Math.random() - 0.5) * 8;
    const y = 60 + (Math.random() - 0.5) * 6;
    el.style.left = `${x}%`;
    el.style.top  = `${y}%`;

    if (type === 'miss') {
      el.textContent = 'MISS';
    } else if (type === 'crit') {
      el.textContent = `${amount}!`;
    } else if (type === 'heal') {
      el.textContent = `+${amount}`;
    } else {
      el.textContent = amount;
    }

    layer.appendChild(el);
    setTimeout(() => el.remove(), 950);
  }

  // =====================================================
  //  MODAL
  // =====================================================
  showModal(title, bodyHTML, buttons = [], onClose = null) {
    const overlay = this.$('modal-overlay');
    this._setText('modal-title', title);
    const bodyEl = this.$('modal-body');
    if (bodyEl) bodyEl.innerHTML = bodyHTML;
    const btnsEl = this.$('modal-btns');
    if (btnsEl) {
      btnsEl.innerHTML = '';
      buttons.forEach(b => {
        const btn = this._mkBtn(b.label, 'action-btn ' + (b.cls || ''), () => {
          audio.click(); b.action(); if (onClose) onClose();
        });
        btnsEl.appendChild(btn);
      });
    }
    overlay.classList.remove('hidden');
  }

  closeModal() {
    const overlay = this.$('modal-overlay');
    if (overlay) overlay.classList.add('hidden');
  }

  // =====================================================
  //  TOAST NOTIFICATIONS
  // =====================================================
  toast(text, duration = 2500) {
    const area = this.$('toast-area');
    if (!area) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = text;
    area.appendChild(el);
    setTimeout(() => el.remove(), duration);
  }

  // =====================================================
  //  ACHIEVEMENT NOTIFICATION
  // =====================================================
  showAchievement(def) {
    this.toast(`🏆 Achievement: ${def.name}`, 3500);
    audio.levelUp();
  }

  // =====================================================
  //  HELPERS
  // =====================================================
  _mkBtn(label, cls, handler) {
    const btn = document.createElement('button');
    btn.className = cls;
    btn.textContent = label;
    btn.addEventListener('click', handler);
    return btn;
  }
}
