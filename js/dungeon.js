// =====================================================
//  dungeon.js  – Sector & room progression system
// =====================================================

const ROOM_TYPE_WEIGHTS = [
  { type: 'combat',   w: 40 },
  { type: 'elite',    w: 15 },
  { type: 'treasure', w: 15 },
  { type: 'healing',  w: 15 },
  { type: 'ambush',   w: 15 },
];

class Room {
  constructor(index, type, sectorDef) {
    this.index    = index;
    this.type     = type;
    this.cleared  = false;
    this.sectorId = sectorDef.id;

    // Pick enemy
    if (type === 'combat' || type === 'ambush') {
      this.enemyId = sectorDef.enemies[Math.floor(Math.random() * sectorDef.enemies.length)];
    } else if (type === 'elite') {
      this.enemyId = sectorDef.eliteEnemies[Math.floor(Math.random() * sectorDef.eliteEnemies.length)];
    } else if (type === 'boss') {
      this.enemyId = sectorDef.boss;
    } else {
      this.enemyId = null;
    }

    // Pick description from sector pool
    const descs  = sectorDef.roomDescs;
    this.desc    = descs[index % descs.length];
    this.title   = ROOM_TYPES[type]?.label || type.toUpperCase();
    this.icon    = ROOM_TYPES[type]?.icon || '?';
  }

  // The ambush room: enemy goes first
  isAmbush() { return this.type === 'ambush'; }
}

class Sector {
  constructor(sectorId) {
    this.def     = SECTOR_DEFS.find(s => s.id === sectorId);
    if (!this.def) throw new Error(`Unknown sector: ${sectorId}`);
    this.id      = sectorId;
    this.rooms   = this._generateRooms();
    this.current = 0;   // index into rooms[]
    this.cleared = false;
  }

  _generateRooms() {
    const def    = this.def;
    const count  = def.roomCount || 5;
    const rooms  = [];

    // Build weighted pool for non-boss rooms
    const pool = [];
    for (const entry of ROOM_TYPE_WEIGHTS) {
      for (let i = 0; i < entry.w; i++) pool.push(entry.type);
    }

    for (let i = 0; i < count - 1; i++) {
      // First room is always a combat encounter
      let type;
      if (i === 0) {
        type = 'combat';
      } else {
        type = pool[Math.floor(Math.random() * pool.length)];
      }
      rooms.push(new Room(i, type, def));
    }
    // Last room is always the boss
    rooms.push(new Room(count - 1, 'boss', def));
    return rooms;
  }

  get currentRoom() { return this.rooms[this.current]; }

  advance() {
    if (this.current < this.rooms.length - 1) {
      this.current++;
      return true;
    }
    this.cleared = true;
    return false;
  }

  roomsCleared() { return this.rooms.filter(r => r.cleared).length; }
  totalRooms()   { return this.rooms.length; }

  toJSON() {
    return {
      id: this.id, current: this.current, cleared: this.cleared,
      rooms: this.rooms.map(r => ({
        index: r.index, type: r.type, cleared: r.cleared,
        enemyId: r.enemyId, desc: r.desc, title: r.title, icon: r.icon,
      })),
    };
  }

  fromJSON(data) {
    this.id      = data.id;
    this.current = data.current;
    this.cleared = data.cleared;
    this.rooms   = data.rooms.map(rd => {
      const room = new Room(rd.index, rd.type, this.def);
      room.cleared = rd.cleared;
      return room;
    });
  }
}

class DungeonSystem {
  constructor() {
    this.currentSectorId = 1;
    this.clearedSectors  = [];
    this.sector          = null;
  }

  // ---- Enter a sector ----
  enterSector(id) {
    this.currentSectorId = id;
    this.sector = new Sector(id);
    return this.sector;
  }

  // ---- Move to next room ----
  advance() { return this.sector && this.sector.advance(); }

  // ---- Current state ----
  get currentRoom()  { return this.sector ? this.sector.currentRoom : null; }
  get sectorDef()    { return this.sector ? this.sector.def : null; }
  get isLastRoom()   { return this.sector && this.sector.current === this.sector.rooms.length - 1; }
  get isBossRoom()   { return this.currentRoom && this.currentRoom.type === 'boss'; }

  markRoomCleared() {
    if (this.currentRoom) this.currentRoom.cleared = true;
  }

  markSectorCleared() {
    if (!this.clearedSectors.includes(this.currentSectorId)) {
      this.clearedSectors.push(this.currentSectorId);
    }
  }

  isSectorUnlocked(id) {
    if (id === 1) return true;
    return this.clearedSectors.includes(id - 1);
  }

  isSectorCleared(id) { return this.clearedSectors.includes(id); }

  nextUnlockedSector() {
    for (const def of SECTOR_DEFS) {
      if (!this.isSectorCleared(def.id) && this.isSectorUnlocked(def.id)) return def.id;
    }
    return null;
  }

  allSectorsCleared() {
    return SECTOR_DEFS.every(d => this.clearedSectors.includes(d.id));
  }

  // ---- Map node positions for the galaxy map canvas ----
  mapLayout() {
    // Returns array of { sectorDef, x, y } for drawing
    const positions = [
      { id: 1, x: 0.15, y: 0.55 },
      { id: 2, x: 0.35, y: 0.35 },
      { id: 3, x: 0.55, y: 0.62 },
      { id: 4, x: 0.70, y: 0.28 },
      { id: 5, x: 0.88, y: 0.50 },
    ];
    return positions.map(p => ({
      def:       SECTOR_DEFS.find(s => s.id === p.id),
      x: p.x, y: p.y,
      unlocked:  this.isSectorUnlocked(p.id),
      cleared:   this.isSectorCleared(p.id),
      current:   this.currentSectorId === p.id,
    }));
  }

  // ---- Serialization ----
  toJSON() {
    return {
      currentSectorId: this.currentSectorId,
      clearedSectors: this.clearedSectors,
      sector: this.sector ? this.sector.toJSON() : null,
    };
  }

  fromJSON(data) {
    this.currentSectorId = data.currentSectorId;
    this.clearedSectors  = data.clearedSectors || [];
    if (data.sector) {
      this.sector = new Sector(data.sector.id);
      this.sector.fromJSON(data.sector);
    }
  }
}
