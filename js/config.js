// =====================================================
//  config.js  – Starfall Frontier
//  All static game data: sectors, enemies, items, abilities
// =====================================================

const CFG = {
  // ---- Layout ----
  BATTLE_W: 620,
  BATTLE_H: 260,

  // ---- Player base stats (level 1) ----
  PLAYER_BASE: {
    maxHp: 100, hp: 100,
    maxEn: 60,  en: 60,
    atk: 16, def: 6, spd: 12, crit: 0.10,
    credits: 0
  },

  // ---- Stat gains per level ----
  LEVEL_GAINS: { maxHp: 12, maxEn: 6, atk: 2, def: 1, spd: 1, crit: 0.01 },

  // XP needed to reach each level (index = level)
  XP_TABLE: [0, 0, 120, 300, 540, 840, 1210, 1660, 2200, 2840, 3600],
  MAX_LEVEL: 10,
};

// =====================================================
//  ABILITIES
// =====================================================
const ABILITIES = [
  {
    id: 'photon_barrage', name: 'Photon Barrage',
    icon: '⚡', desc: 'Unleash a volley of photon bolts. High damage.',
    cost: 22, unlocksAt: 2,
    type: 'attack',
    dmgMult: 2.0, hitCount: 3, hitMult: 0.67,
  },
  {
    id: 'shield_matrix', name: 'Shield Matrix',
    icon: '🛡', desc: 'Erect an energy barrier. Doubles defense for 3 turns.',
    cost: 18, unlocksAt: 3,
    type: 'defend',
    defMult: 2.5, duration: 3,
  },
  {
    id: 'emp_blast', name: 'EMP Blast',
    icon: '💫', desc: 'Electromagnetic pulse. Heavy damage + stuns enemy.',
    cost: 28, unlocksAt: 4,
    type: 'attack',
    dmgMult: 1.7, stunChance: 0.5,
  },
  {
    id: 'nano_repair', name: 'Nano Repair',
    icon: '💚', desc: 'Deploy nano-bots to heal 35% of max HP.',
    cost: 20, unlocksAt: 3,
    type: 'heal',
    healPct: 0.35,
  },
  {
    id: 'quantum_strike', name: 'Quantum Strike',
    icon: '✦', desc: 'Phase-shifted attack that always crits for massive damage.',
    cost: 30, unlocksAt: 5,
    type: 'attack',
    dmgMult: 2.5, alwaysCrit: true,
  },
  {
    id: 'gravity_pulse', name: 'Gravity Pulse',
    icon: '🌀', desc: 'Warp gravity around the foe. Huge damage + -3 DEF for 3 turns.',
    cost: 35, unlocksAt: 6,
    type: 'attack',
    dmgMult: 2.2, defDebuff: 3, debuffDur: 3,
  },
];

// =====================================================
//  ITEM DEFINITIONS
// =====================================================
const ITEM_DEFS = {

  // ---- Consumables ----
  med_pack_s: {
    id: 'med_pack_s', name: 'Med Pack', type: 'consumable',
    icon: '💊', rarity: 'common',
    desc: 'Restores 35 HP.', hpRestore: 35,
    value: 20, usable: true,
  },
  med_pack_l: {
    id: 'med_pack_l', name: 'Trauma Kit', type: 'consumable',
    icon: '🩺', rarity: 'uncommon',
    desc: 'Restores 80 HP.', hpRestore: 80,
    value: 60, usable: true,
  },
  energy_cell: {
    id: 'energy_cell', name: 'Energy Cell', type: 'consumable',
    icon: '🔋', rarity: 'common',
    desc: 'Restores 25 Energy.', enRestore: 25,
    value: 18, usable: true,
  },
  stim_pack: {
    id: 'stim_pack', name: 'Combat Stim', type: 'consumable',
    icon: '💉', rarity: 'uncommon',
    desc: 'Boosts ATK by +8 for 3 turns.', atkBuff: 8, buffDur: 3,
    value: 45, usable: true,
  },
  def_module: {
    id: 'def_module', name: 'Shield Module', type: 'consumable',
    icon: '🔷', rarity: 'uncommon',
    desc: 'Boosts DEF by +6 for 3 turns.', defBuff: 6, buffDur: 3,
    value: 40, usable: true,
  },
  repair_kit: {
    id: 'repair_kit', name: 'Repair Kit', type: 'consumable',
    icon: '🔧', rarity: 'rare',
    desc: 'Fully restores HP and Energy.',
    hpRestore: 999, enRestore: 999,
    value: 150, usable: true,
  },
  void_shard_c: {
    id: 'void_shard_c', name: 'Void Shard', type: 'consumable',
    icon: '💜', rarity: 'rare',
    desc: 'Deals 60 damage to enemy. Single use.',
    directDmg: 60,
    value: 80, usable: true,
  },

  // ---- Weapons ----
  laser_pistol: {
    id: 'laser_pistol', name: 'Laser Pistol', type: 'weapon',
    icon: '🔫', rarity: 'common',
    desc: 'Standard-issue energy sidearm.', atk: 4,
    value: 50,
  },
  plasma_blaster: {
    id: 'plasma_blaster', name: 'Plasma Blaster', type: 'weapon',
    icon: '🔫', rarity: 'uncommon',
    desc: 'Superheated plasma rounds.', atk: 8, crit: 0.03,
    value: 120,
  },
  quantum_rifle: {
    id: 'quantum_rifle', name: 'Quantum Rifle', type: 'weapon',
    icon: '🔫', rarity: 'rare',
    desc: 'Phase-shifted energy weapon.', atk: 14, crit: 0.06, spd: 1,
    value: 300,
  },
  nova_cannon: {
    id: 'nova_cannon', name: 'Nova Cannon', type: 'weapon',
    icon: '🔫', rarity: 'epic',
    desc: 'Fires micro-nova bursts.', atk: 22, crit: 0.10,
    value: 700,
  },
  singularity_blade: {
    id: 'singularity_blade', name: 'Singularity Blade', type: 'weapon',
    icon: '⚔️', rarity: 'legendary',
    desc: 'A blade carved from collapsed spacetime.', atk: 34, crit: 0.15, spd: 3,
    value: 2000,
  },
  ion_cutter: {
    id: 'ion_cutter', name: 'Ion Cutter', type: 'weapon',
    icon: '🔫', rarity: 'common',
    desc: 'Mining tool repurposed as a weapon.', atk: 5,
    value: 35,
  },
  void_lance: {
    id: 'void_lance', name: 'Void Lance', type: 'weapon',
    icon: '⚔️', rarity: 'epic',
    desc: 'Tears reality with each strike.', atk: 26, def: 2, crit: 0.08,
    value: 900,
  },

  // ---- Armor ----
  nano_suit: {
    id: 'nano_suit', name: 'Nano Suit', type: 'armor',
    icon: '🥻', rarity: 'common',
    desc: 'Woven nano-fiber bodysuit.', def: 3,
    value: 50,
  },
  blast_vest: {
    id: 'blast_vest', name: 'Blast Vest', type: 'armor',
    icon: '🦺', rarity: 'uncommon',
    desc: 'Reinforced blast-resistant plating.', def: 6, maxHp: 10,
    value: 120,
  },
  shield_harness: {
    id: 'shield_harness', name: 'Shield Harness', type: 'armor',
    icon: '🦺', rarity: 'rare',
    desc: 'Integrated energy shield emitters.', def: 10, maxHp: 20,
    value: 280,
  },
  void_plates: {
    id: 'void_plates', name: 'Void Plates', type: 'armor',
    icon: '🧥', rarity: 'epic',
    desc: 'Dark matter-infused combat plating.', def: 16, maxHp: 30, spd: -1,
    value: 680,
  },
  cosmic_aegis: {
    id: 'cosmic_aegis', name: 'Cosmic Aegis', type: 'armor',
    icon: '🧥', rarity: 'legendary',
    desc: 'The armor of a fallen cosmic guardian.', def: 24, maxHp: 50, crit: 0.05,
    value: 2000,
  },
  pressure_suit: {
    id: 'pressure_suit', name: 'Pressure Suit', type: 'armor',
    icon: '🥻', rarity: 'common',
    desc: 'Basic EVA suit with some protection.', def: 2, maxEn: 10,
    value: 40,
  },

  // ---- Artifacts ----
  targeting_matrix: {
    id: 'targeting_matrix', name: 'Targeting Matrix', type: 'artifact',
    icon: '🎯', rarity: 'uncommon',
    desc: 'Neural targeting overlay. +5% crit.', crit: 0.05,
    value: 100,
  },
  speed_booster: {
    id: 'speed_booster', name: 'Speed Booster', type: 'artifact',
    icon: '⚡', rarity: 'rare',
    desc: 'Cybernetic leg boosters. +4 SPD, +3 ATK.', spd: 4, atk: 3,
    value: 260,
  },
  gravity_lens: {
    id: 'gravity_lens', name: 'Gravity Lens', type: 'artifact',
    icon: '🔮', rarity: 'epic',
    desc: 'Bends attacks around you. +8 DEF, +5% crit.', def: 8, crit: 0.05,
    value: 650,
  },
  infinity_shard: {
    id: 'infinity_shard', name: 'Infinity Shard', type: 'artifact',
    icon: '💎', rarity: 'legendary',
    desc: 'Fragment of a collapsed universe.', atk: 10, def: 6, spd: 3, crit: 0.08, maxHp: 25,
    value: 3000,
  },
  neural_implant: {
    id: 'neural_implant', name: 'Neural Implant', type: 'artifact',
    icon: '🧠', rarity: 'uncommon',
    desc: 'Combat neural interface. +3 ATK, +2 SPD.', atk: 3, spd: 2,
    value: 130,
  },
  energy_core: {
    id: 'energy_core', name: 'Energy Core', type: 'artifact',
    icon: '🔋', rarity: 'rare',
    desc: 'Compact reactor. +20 Max Energy.', maxEn: 20,
    value: 200,
  },
};

// =====================================================
//  ENEMY DEFINITIONS
// =====================================================
const ENEMY_DEFS = {

  // ===== SECTOR 1: Abandoned Mining Colony =====
  mining_drone: {
    id: 'mining_drone', name: 'Mining Drone',
    sprite: 'drone', color: '#885533',
    sector: 1, xp: 30, credits: [8,18],
    hp: 52, atk: 12, def: 3, spd: 8, crit: 0.05,
    desc: 'A reprogrammed ore-extraction drone. Slow but sturdy.',
    attacks: ['drill_slam', 'laser_cutter'],
    loot: { med_pack_s: 0.3, laser_pistol: 0.08, energy_cell: 0.2 },
  },
  corrupted_worker: {
    id: 'corrupted_worker', name: 'Corrupted Worker',
    sprite: 'humanoid', color: '#557755',
    sector: 1, xp: 35, credits: [10,22],
    hp: 60, atk: 14, def: 2, spd: 10, crit: 0.08,
    desc: 'A colonist infected by unknown spores. Erratic and aggressive.',
    attacks: ['wild_strike', 'spore_cloud'],
    loot: { med_pack_s: 0.35, stim_pack: 0.1, nano_suit: 0.06 },
  },
  ore_golem: {
    id: 'ore_golem', name: 'Ore Golem',
    sprite: 'golem', color: '#886644',
    sector: 1, xp: 45, credits: [15,28],
    hp: 90, atk: 16, def: 8, spd: 5, crit: 0.04,
    desc: 'A massive construct of compressed ore. Extremely tough.',
    attacks: ['boulder_smash', 'rock_throw'],
    loot: { blast_vest: 0.08, ion_cutter: 0.12, med_pack_s: 0.2 },
  },
  security_bot: {
    id: 'security_bot', name: 'Security Bot',
    sprite: 'robot', color: '#667788',
    sector: 1, xp: 38, credits: [12,24],
    hp: 65, atk: 13, def: 5, spd: 9, crit: 0.07,
    desc: 'A patrol unit gone haywire. Prioritises lethal force.',
    attacks: ['shock_pulse', 'target_lock'],
    loot: { energy_cell: 0.25, laser_pistol: 0.1, neural_implant: 0.05 },
  },
  plasma_worm: {
    id: 'plasma_worm', name: 'Plasma Worm',
    sprite: 'worm', color: '#bb4422',
    sector: 1, xp: 28, credits: [6,14],
    hp: 45, atk: 15, def: 1, spd: 13, crit: 0.12,
    desc: 'A burrowing creature that absorbs plasma. Fast and venomous.',
    attacks: ['plasma_bite', 'burrow_strike'],
    loot: { med_pack_s: 0.4, energy_cell: 0.15 },
  },

  // ===== SECTOR 2: Pirate Outpost =====
  space_raider: {
    id: 'space_raider', name: 'Space Raider',
    sprite: 'pirate', color: '#aa7733',
    sector: 2, xp: 55, credits: [20,40],
    hp: 85, atk: 18, def: 5, spd: 11, crit: 0.10,
    desc: 'A hardened spacer turned pirate. Quick and ruthless.',
    attacks: ['blaster_shot', 'cheap_shot', 'gut_punch'],
    loot: { plasma_blaster: 0.1, med_pack_l: 0.15, stim_pack: 0.1 },
  },
  turret_drone: {
    id: 'turret_drone', name: 'Turret Drone',
    sprite: 'turret', color: '#446688',
    sector: 2, xp: 50, credits: [15,30],
    hp: 75, atk: 20, def: 7, spd: 7, crit: 0.06,
    desc: 'Automated defense platform. Fires salvos of laser bolts.',
    attacks: ['laser_salvo', 'overcharge'],
    loot: { energy_cell: 0.3, def_module: 0.1, targeting_matrix: 0.05 },
  },
  smuggler: {
    id: 'smuggler', name: 'Smuggler',
    sprite: 'humanoid', color: '#997744',
    sector: 2, xp: 58, credits: [25,45],
    hp: 80, atk: 17, def: 4, spd: 14, crit: 0.13,
    desc: 'A cunning trader turned pirate. Carries hidden gear.',
    attacks: ['blaster_shot', 'flashbang', 'knife_throw'],
    loot: { stim_pack: 0.2, energy_cell: 0.25, quantum_rifle: 0.04 },
  },
  pirate_captain: {
    id: 'pirate_captain', name: 'Pirate Lieutenant',
    sprite: 'captain', color: '#cc6622',
    sector: 2, xp: 75, credits: [30,55],
    hp: 110, atk: 22, def: 6, spd: 12, crit: 0.12,
    desc: 'A battle-scarred pirate officer. Commands with brutal efficiency.',
    attacks: ['heavy_blast', 'call_backup', 'precise_shot'],
    loot: { plasma_blaster: 0.15, blast_vest: 0.1, med_pack_l: 0.2 },
    elite: true,
  },
  cyber_assassin: {
    id: 'cyber_assassin', name: 'Cyber Assassin',
    sprite: 'assassin', color: '#554466',
    sector: 2, xp: 80, credits: [28,50],
    hp: 90, atk: 25, def: 4, spd: 18, crit: 0.18,
    desc: 'A cybernetically enhanced killer. Strikes before you react.',
    attacks: ['phantom_blade', 'overdrive', 'neurotoxin'],
    loot: { quantum_rifle: 0.06, speed_booster: 0.05, neural_implant: 0.12 },
    elite: true,
  },

  // ===== SECTOR 3: Alien Hive =====
  alien_grub: {
    id: 'alien_grub', name: 'Alien Grub',
    sprite: 'grub', color: '#44aa44',
    sector: 3, xp: 70, credits: [18,35],
    hp: 100, atk: 20, def: 6, spd: 9, crit: 0.06,
    desc: 'A larval stage creature. Not to be underestimated.',
    attacks: ['acid_spit', 'lunge'],
    loot: { med_pack_l: 0.2, energy_cell: 0.2 },
  },
  alien_stalker: {
    id: 'alien_stalker', name: 'Alien Stalker',
    sprite: 'stalker', color: '#33aa66',
    sector: 3, xp: 85, credits: [22,42],
    hp: 120, atk: 24, def: 7, spd: 16, crit: 0.14,
    desc: 'A stealthy ambush predator with razor-sharp claws.',
    attacks: ['claw_slash', 'pounce', 'camouflage'],
    loot: { stim_pack: 0.12, blast_vest: 0.08, quantum_rifle: 0.04 },
  },
  hive_warrior: {
    id: 'hive_warrior', name: 'Hive Warrior',
    sprite: 'warrior_alien', color: '#227744',
    sector: 3, xp: 95, credits: [28,50],
    hp: 150, atk: 26, def: 12, spd: 10, crit: 0.07,
    desc: 'An elite hive-breed soldier. Near-impenetrable chitin armor.',
    attacks: ['mandible_crush', 'pheromone_burst', 'carapace_slam'],
    loot: { shield_harness: 0.08, med_pack_l: 0.25, void_shard_c: 0.05 },
  },
  acid_spitter: {
    id: 'acid_spitter', name: 'Acid Spitter',
    sprite: 'spitter', color: '#99cc22',
    sector: 3, xp: 80, credits: [20,38],
    hp: 105, atk: 22, def: 5, spd: 13, crit: 0.10,
    desc: 'Projectile xenomorph that melts armor with concentrated acid.',
    attacks: ['acid_volley', 'corrosive_spray', 'toxic_pool'],
    loot: { def_module: 0.12, energy_cell: 0.2 },
  },
  void_beast: {
    id: 'void_beast', name: 'Void Beast',
    sprite: 'beast', color: '#554488',
    sector: 3, xp: 100, credits: [30,55],
    hp: 140, atk: 28, def: 8, spd: 14, crit: 0.12,
    desc: 'A creature that partially exists outside our dimension.',
    attacks: ['void_claw', 'dimension_shift', 'terror_aura'],
    loot: { void_lance: 0.05, gravity_lens: 0.04, med_pack_l: 0.15 },
    elite: true,
  },

  // ===== SECTOR 4: Ancient Space Ruins =====
  ancient_guardian: {
    id: 'ancient_guardian', name: 'Ancient Guardian',
    sprite: 'guardian', color: '#aaaa44',
    sector: 4, xp: 120, credits: [40,70],
    hp: 175, atk: 30, def: 14, spd: 8, crit: 0.08,
    desc: 'Construct sentinel of a forgotten civilisation. Still obeys its last order.',
    attacks: ['gravity_beam', 'stone_wall', 'temporal_crush'],
    loot: { void_plates: 0.08, targeting_matrix: 0.12, void_shard_c: 0.1 },
  },
  rune_sentinel: {
    id: 'rune_sentinel', name: 'Rune Sentinel',
    sprite: 'sentinel', color: '#8888cc',
    sector: 4, xp: 130, credits: [45,75],
    hp: 190, atk: 32, def: 16, spd: 9, crit: 0.09,
    desc: 'Inscribed with protective runes. Reflects a portion of all damage.',
    attacks: ['rune_burst', 'barrier_rune', 'reflect_field'],
    loot: { shield_harness: 0.10, neural_implant: 0.08, nova_cannon: 0.04 },
  },
  phase_wraith: {
    id: 'phase_wraith', name: 'Phase Wraith',
    sprite: 'wraith', color: '#aaaaff',
    sector: 4, xp: 140, credits: [48,80],
    hp: 160, atk: 35, def: 10, spd: 20, crit: 0.18,
    desc: 'A ghostly being that phases in and out of reality. Hard to hit.',
    attacks: ['spectral_slash', 'phase_strike', 'wail'],
    loot: { speed_booster: 0.08, quantum_rifle: 0.06, energy_core: 0.1 },
    elite: true,
  },
  temporal_clone: {
    id: 'temporal_clone', name: 'Temporal Clone',
    sprite: 'clone', color: '#44aacc',
    sector: 4, xp: 125, credits: [42,72],
    hp: 170, atk: 28, def: 12, spd: 15, crit: 0.12,
    desc: 'Your doppelganger from a parallel timeline. Knows your every move.',
    attacks: ['mirror_strike', 'future_sight', 'echo_blast'],
    loot: { stim_pack: 0.15, def_module: 0.12, gravity_lens: 0.05 },
  },

  // ===== SECTOR 5: Void Nexus =====
  void_shade: {
    id: 'void_shade', name: 'Void Shade',
    sprite: 'shade', color: '#6633aa',
    sector: 5, xp: 170, credits: [60,100],
    hp: 230, atk: 40, def: 15, spd: 18, crit: 0.14,
    desc: 'Pure void energy given malevolent form. Drains life.',
    attacks: ['void_drain', 'shadow_lash', 'null_field'],
    loot: { void_lance: 0.08, gravity_lens: 0.07, infinity_shard: 0.02 },
  },
  dark_matter_fiend: {
    id: 'dark_matter_fiend', name: 'Dark Matter Fiend',
    sprite: 'fiend', color: '#330066',
    sector: 5, xp: 190, credits: [70,120],
    hp: 260, atk: 44, def: 18, spd: 14, crit: 0.12,
    desc: 'Formed from collapsed dark matter. Absorbs energy attacks.',
    attacks: ['gravity_slam', 'mass_distortion', 'event_horizon'],
    loot: { cosmic_aegis: 0.05, infinity_shard: 0.02, repair_kit: 0.08 },
    elite: true,
  },
  entropy_beast: {
    id: 'entropy_beast', name: 'Entropy Beast',
    sprite: 'entropy', color: '#884400',
    sector: 5, xp: 180, credits: [65,110],
    hp: 240, atk: 42, def: 16, spd: 16, crit: 0.16,
    desc: 'A creature that feeds on order. Grows stronger as it takes damage.',
    attacks: ['entropy_claw', 'disorder_field', 'chaos_burst'],
    loot: { nova_cannon: 0.06, void_plates: 0.06, void_shard_c: 0.12 },
  },
  null_entity: {
    id: 'null_entity', name: 'Null Entity',
    sprite: 'null', color: '#ffffff',
    sector: 5, xp: 200, credits: [75,130],
    hp: 280, atk: 46, def: 20, spd: 12, crit: 0.10,
    desc: 'A being of absolute negation. Its mere presence erases matter.',
    attacks: ['null_strike', 'existence_erode', 'annihilation'],
    loot: { singularity_blade: 0.04, infinity_shard: 0.03, cosmic_aegis: 0.04 },
    elite: true,
  },

  // ===== BOSSES =====
  foreman_rex: {
    id: 'foreman_rex', name: 'Foreman Rex',
    sprite: 'boss_mech', color: '#aa5522',
    sector: 1, boss: true, xp: 220, credits: [60,100],
    hp: 280, atk: 20, def: 7, spd: 8, crit: 0.08,
    desc: 'The mining colony\'s overseer AI uploaded into a 3-ton mech frame.',
    attacks: ['drill_cannon', 'mine_field', 'emergency_repair', 'slam_wave'],
    loot: { blast_vest: 1.0, ion_cutter: 1.0, med_pack_l: 1.0 },
    dropGuaranteed: ['blast_vest'],
  },
  captain_bloodstar: {
    id: 'captain_bloodstar', name: 'Captain Bloodstar',
    sprite: 'boss_pirate', color: '#cc4400',
    sector: 2, boss: true, xp: 380, credits: [100,160],
    hp: 400, atk: 28, def: 10, spd: 14, crit: 0.14,
    desc: 'The most feared pirate in the Outer Reaches. No mercy, no survivors.',
    attacks: ['twin_blasters', 'grenade_volley', 'rally_crew', 'death_sentence'],
    loot: { quantum_rifle: 1.0, shield_harness: 1.0, med_pack_l: 1.0 },
    dropGuaranteed: ['quantum_rifle'],
  },
  hive_queen_xara: {
    id: 'hive_queen_xara', name: 'Hive Queen Xara',
    sprite: 'boss_queen', color: '#22aa44',
    sector: 3, boss: true, xp: 560, credits: [150,220],
    hp: 560, atk: 34, def: 14, spd: 12, crit: 0.10,
    desc: 'The psychic core of the Hive. If she falls, all her children die with her.',
    attacks: ['swarm_summon', 'psychic_scream', 'royal_acid', 'cocoon', 'fury_slam'],
    loot: { void_plates: 1.0, void_shard_c: 1.0, repair_kit: 0.5 },
    dropGuaranteed: ['void_plates'],
  },
  the_archivist: {
    id: 'the_archivist', name: 'The Archivist',
    sprite: 'boss_ancient', color: '#aaaa22',
    sector: 4, boss: true, xp: 760, credits: [200,300],
    hp: 720, atk: 40, def: 20, spd: 10, crit: 0.12,
    desc: 'The central AI of a dead civilisation. It preserves their legacy through annihilation.',
    attacks: ['knowledge_strike', 'temporal_loop', 'archive_beam', 'rewind', 'data_cascade'],
    loot: { nova_cannon: 1.0, gravity_lens: 1.0, repair_kit: 1.0 },
    dropGuaranteed: ['nova_cannon'],
  },
  void_sovereign: {
    id: 'void_sovereign', name: 'The Void Sovereign',
    sprite: 'boss_sovereign', color: '#7722cc',
    sector: 5, boss: true, xp: 1200, credits: [350,500],
    hp: 1000, atk: 50, def: 22, spd: 16, crit: 0.14,
    desc: 'The ancient ruler of the Void Nexus. Destroyer of galaxies. Final boss.',
    attacks: ['void_annihilation', 'singularity_pull', 'cosmic_decree', 'reality_rend', 'oblivion_wave', 'dark_ascension'],
    loot: { singularity_blade: 1.0, cosmic_aegis: 1.0, infinity_shard: 1.0 },
    dropGuaranteed: ['singularity_blade', 'cosmic_aegis', 'infinity_shard'],
  },
};

// =====================================================
//  SECTOR DEFINITIONS
// =====================================================
const SECTOR_DEFS = [
  {
    id: 1, name: 'Abandoned Mining Colony',
    shortName: 'MINING COLONY',
    desc: 'Deep in the asteroid belt, a once-thriving colony has gone dark. Rogue machines and infected workers now roam its tunnels.',
    theme: 'mine',
    bgColor: '#0a0805',
    accentColor: '#aa6633',
    enemies: ['mining_drone','corrupted_worker','ore_golem','security_bot','plasma_worm'],
    eliteEnemies: ['ore_golem','security_bot'],
    boss: 'foreman_rex',
    roomCount: 5,
    roomDescs: [
      'A collapsed mine shaft littered with broken equipment.',
      'The main processing hall — ore conveyors still run, unmanned.',
      'Emergency barricades line this corridor. Something breached them from inside.',
      'The foreman\'s office, ransacked and bloodstained.',
      'Deep Core Control — the air hums with dangerous energy.',
    ],
  },
  {
    id: 2, name: 'Pirate Outpost',
    shortName: 'PIRATE OUTPOST',
    desc: 'A lawless station run by the infamous Bloodstar Corsairs. Contraband, guns, and danger around every corner.',
    theme: 'pirate',
    bgColor: '#080a0a',
    accentColor: '#cc6622',
    enemies: ['space_raider','turret_drone','smuggler','pirate_captain','cyber_assassin'],
    eliteEnemies: ['pirate_captain','cyber_assassin'],
    boss: 'captain_bloodstar',
    roomCount: 5,
    roomDescs: [
      'The docking bay, thick with smoke and arguing pirates.',
      'A maze of storage crates — perfect for ambushes.',
      'The armory. Most weapons have already been claimed.',
      'Crew quarters — some inhabitants aren\'t happy to see you.',
      'The Captain\'s Bridge. Time to end this.',
    ],
  },
  {
    id: 3, name: 'Alien Hive',
    shortName: 'ALIEN HIVE',
    desc: 'An organic labyrinth pulsing with alien life. The colony\'s psychic heartbeat grows stronger the deeper you go.',
    theme: 'hive',
    bgColor: '#050a05',
    accentColor: '#44aa44',
    enemies: ['alien_grub','alien_stalker','hive_warrior','acid_spitter','void_beast'],
    eliteEnemies: ['hive_warrior','void_beast'],
    boss: 'hive_queen_xara',
    roomCount: 5,
    roomDescs: [
      'The outer membrane — slick walls covered in alien secretions.',
      'A nursery chamber full of pulsing egg sacs.',
      'The acid pools gleam with sickly green light.',
      'Warriors swarm this corridor, driven by hive-mind frenzy.',
      'The Queen\'s Chamber — massive, organic, terrifying.',
    ],
  },
  {
    id: 4, name: 'Ancient Space Ruins',
    shortName: 'SPACE RUINS',
    desc: 'The remains of a civilisation a billion years dead. Their constructs still guard secrets that were never meant to be found.',
    theme: 'ruins',
    bgColor: '#080808',
    accentColor: '#aaaa44',
    enemies: ['ancient_guardian','rune_sentinel','phase_wraith','temporal_clone'],
    eliteEnemies: ['rune_sentinel','phase_wraith'],
    boss: 'the_archivist',
    roomCount: 5,
    roomDescs: [
      'A grand entrance hall carved from asteroid rock. Holographic glyphs pulse weakly.',
      'The Observatory. Star maps of dead constellations line the walls.',
      'A temporal rift distorts space here — time flows strangely.',
      'The Hall of Records. Guardians activate as you approach.',
      'The Archive Core — a sphere of crystallised knowledge, and its keeper.',
    ],
  },
  {
    id: 5, name: 'Void Nexus',
    shortName: 'VOID NEXUS',
    desc: 'The centre of all void energy in the galaxy. Reality itself is failing here. Enter, and you may never leave.',
    theme: 'void',
    bgColor: '#04000a',
    accentColor: '#8822cc',
    enemies: ['void_shade','dark_matter_fiend','entropy_beast','null_entity'],
    eliteEnemies: ['dark_matter_fiend','null_entity'],
    boss: 'void_sovereign',
    roomCount: 5,
    roomDescs: [
      'A rift in spacetime serves as the entrance. Your instruments fail immediately.',
      'Floating debris from a dozen destroyed worlds drifts past.',
      'Void entities coalesce from nothingness around you.',
      'The fabric of reality tears and re-forms. Nothing is certain here.',
      'The Sovereign\'s Throne — a crystallised singularity at the edge of everything.',
    ],
  },
];

// =====================================================
//  ACHIEVEMENT DEFINITIONS
// =====================================================
const ACHIEVEMENT_DEFS = [
  { id: 'first_blood',   name: 'First Blood',   icon: '⚔️', desc: 'Win your first combat.' },
  { id: 'survivor',      name: 'Survivor',       icon: '❤️', desc: 'Survive with under 10 HP.' },
  { id: 'critical_hit',  name: 'Sharpshooter',   icon: '🎯', desc: 'Land a critical hit.' },
  { id: 'level_5',       name: 'Veteran',         icon: '⭐', desc: 'Reach level 5.' },
  { id: 'level_10',      name: 'Legend',          icon: '🌟', desc: 'Reach level 10.' },
  { id: 'sector1_clear', name: 'Miner\'s Bane',   icon: '⛏️', desc: 'Clear the Mining Colony.' },
  { id: 'sector2_clear', name: 'Corsair Crusher', icon: '🏴‍☠️', desc: 'Clear the Pirate Outpost.' },
  { id: 'sector3_clear', name: 'Hive Breaker',    icon: '🐛', desc: 'Clear the Alien Hive.' },
  { id: 'sector4_clear', name: 'Archaeologist',   icon: '🏛️', desc: 'Clear the Ancient Ruins.' },
  { id: 'sector5_clear', name: 'Void Walker',     icon: '🌌', desc: 'Clear the Void Nexus.' },
  { id: 'loot_master',   name: 'Loot Master',     icon: '💰', desc: 'Collect 10 items.' },
  { id: 'legend_item',   name: 'Legendary Find',  icon: '💎', desc: 'Obtain a Legendary item.' },
  { id: 'escape_artist', name: 'Escape Artist',   icon: '↩️', desc: 'Successfully escape 3 combats.' },
  { id: 'ability_user',  name: 'Specialist',      icon: '✦', desc: 'Use a special ability 5 times.' },
  { id: 'full_clear',    name: 'Galaxy Saviour',  icon: '🚀', desc: 'Complete all 5 sectors.' },
];

// =====================================================
//  ROOM TYPE DEFINITIONS
// =====================================================
const ROOM_TYPES = {
  combat:   { weight: 45, icon: '⚔️',  label: 'Hostile' },
  elite:    { weight: 15, icon: '💀',  label: 'Elite',    bgTint: 'rgba(200,50,50,0.1)' },
  treasure: { weight: 15, icon: '💰',  label: 'Treasure' },
  healing:  { weight: 15, icon: '💊',  label: 'Aid Post' },
  ambush:   { weight: 10, icon: '‼️',  label: 'Ambush' },
  boss:     { weight: 0,  icon: '👑',  label: 'BOSS',     bgTint: 'rgba(200,50,200,0.12)' },
};

// =====================================================
//  ATTACK FLAVOUR TEXTS  (used in combat log)
// =====================================================
const ATTACK_TEXTS = {
  // enemy attacks
  drill_slam:       ['slams you with a rotating drill!', 'drills into your armor!'],
  laser_cutter:     ['fires a laser cutter!', 'sweeps its cutting laser!'],
  wild_strike:      ['attacks wildly!', 'flails erratically!'],
  spore_cloud:      ['releases a toxic spore cloud!', 'blasts you with spores!'],
  boulder_smash:    ['smashes you with a massive boulder fist!', 'slams both fists down!'],
  rock_throw:       ['hurls a chunk of ore!', 'throws a boulder!'],
  shock_pulse:      ['fires an electric shock pulse!', 'discharges a stun burst!'],
  target_lock:      ['locks on and fires a precise burst!', 'acquires target—opens fire!'],
  blaster_shot:     ['fires a blaster shot!', 'squeezes off a shot!'],
  cheap_shot:       ['hits you while you\'re off guard!', 'delivers a cheap shot!'],
  gut_punch:        ['delivers a vicious gut punch!', 'swings hard!'],
  laser_salvo:      ['unloads a laser salvo!', 'fires all barrels!'],
  overcharge:       ['overcharges its weapons—critical shot!', 'fires an overcharged blast!'],
  flashbang:        ['throws a flashbang—your vision blurs!', 'blinds you with a flashbang!'],
  knife_throw:      ['hurls a vibro-knife!', 'flings a blade!'],
  heavy_blast:      ['fires a heavy blast!', 'lets loose a massive shot!'],
  call_backup:      ['calls for backup and attacks!', 'radios crew and charges!'],
  precise_shot:     ['takes precise aim and fires!', 'lands a precise shot!'],
  phantom_blade:    ['strikes with a phantom blade!', 'slashes with spectral steel!'],
  overdrive:        ['activates overdrive and attacks!', 'overdrives cybernetics—hits twice!'],
  neurotoxin:       ['injects neurotoxin!', 'delivers a neurotoxin dart!'],
  acid_spit:        ['spits a glob of acid!', 'spits caustic fluid!'],
  lunge:            ['lunges with massive jaws!', 'leaps forward and bites!'],
  claw_slash:       ['slashes with razor claws!', 'slices with curved talons!'],
  pounce:           ['pounces on you!', 'leaps from the shadows!'],
  camouflage:       ['vanishes and strikes from stealth!', 'blends in and attacks!'],
  mandible_crush:   ['crushes with armored mandibles!', 'clamps down hard!'],
  pheromone_burst:  ['releases aggression pheromones—enraged!', 'uses pheromones and attacks!'],
  carapace_slam:    ['slams you with its carapace!', 'rams its armored body!'],
  acid_volley:      ['fires an acid volley!', 'sprays acid in all directions!'],
  corrosive_spray:  ['coats you in corrosive spray!', 'sprays burning acid!'],
  toxic_pool:       ['creates a toxic pool beneath you!', 'vomits a toxic puddle!'],
  void_claw:        ['rakes you with void-infused claws!', 'strikes through reality!'],
  dimension_shift:  ['shifts dimension and attacks!', 'phases through your defenses!'],
  terror_aura:      ['projects terrifying void energy!', 'emits an aura of pure terror!'],
  gravity_beam:     ['fires a concentrated gravity beam!', 'crushes you with gravity!'],
  stone_wall:       ['summons stone barriers and counter-strikes!', 'erects a wall and attacks!'],
  temporal_crush:   ['crushes you with temporal force!', 'rewinds your armor to dust!'],
  rune_burst:       ['detonates a rune array!', 'triggers explosive runes!'],
  barrier_rune:     ['activates a defensive rune and retaliates!', 'uses a rune to shield and strike!'],
  reflect_field:    ['reflects your attack back at you!', 'turns your energy against you!'],
  spectral_slash:   ['slices with spectral blades!', 'cuts through matter and energy!'],
  phase_strike:     ['phases through your shield to strike!', 'attacks from inside your guard!'],
  wail:             ['lets out a reality-warping wail!', 'screams—space cracks!'],
  mirror_strike:    ['copies your last move and counters!', 'mirrors your attack!'],
  future_sight:     ['sees the future and exploits a weakness!', 'predicts your move!'],
  echo_blast:       ['fires an echo blast!', 'fires a past and present blast!'],
  void_drain:       ['drains your life force!', 'siphons your vital energy!'],
  shadow_lash:      ['whips with a shadow tendril!', 'lashes with pure darkness!'],
  null_field:       ['activates a null field—nullifies energy!', 'erases energy around you!'],
  gravity_slam:     ['slams you with gravitational force!', 'crushes you with artificial gravity!'],
  mass_distortion:  ['distorts your mass!', 'warps your body with dark matter!'],
  event_horizon:    ['pulls you toward a micro-singularity!', 'activates an event horizon!'],
  entropy_claw:     ['strikes with entropic claws!', 'claws of pure disorder!'],
  disorder_field:   ['fills the area with entropy!', 'activates a disorder field!'],
  chaos_burst:      ['explodes in chaotic energy!', 'releases a burst of raw chaos!'],
  null_strike:      ['erases part of your existence!', 'strikes with nullifying force!'],
  existence_erode:  ['erodes your physical form!', 'begins to erase you!'],
  annihilation:     ['channels pure annihilation energy!', 'fires annihilation beams!'],
  // boss attacks
  drill_cannon:     ['fires the drill cannon!', 'charges and fires a massive drill round!'],
  mine_field:       ['deploys proximity mines!', 'scatters explosive mines!'],
  emergency_repair: ['activates emergency repair systems!', 'reroutes power for self-repair!'],
  slam_wave:        ['creates a seismic slam wave!', 'pounds the ground—shockwave!'],
  twin_blasters:    ['fires both blasters simultaneously!', 'dual-wields energy blasters!'],
  grenade_volley:   ['lobs a volley of plasma grenades!', 'throws plasma grenades!'],
  rally_crew:       ['rallies crew members for a coordinated strike!', 'calls in crew support!'],
  death_sentence:   ['activates DEATH SENTENCE protocol!', 'declares a death sentence—attacks ferociously!'],
  swarm_summon:     ['summons a swarm of larvae!', 'calls the hive to action!'],
  psychic_scream:   ['unleashes a psychic scream!', 'transmits pain through the hive mind!'],
  royal_acid:       ['projects royal acid—incredibly corrosive!', 'spits concentrated royal acid!'],
  cocoon:           ['wraps you partially in cocoon silk—restricted!', 'fires a cocoon strand!'],
  fury_slam:        ['slams you with all four limbs!', 'attacks in a four-limb fury!'],
  knowledge_strike: ['strikes with the force of ages!', 'channels ancient knowledge into a blow!'],
  temporal_loop:    ['traps you in a temporal loop—acts twice!', 'creates a temporal loop!'],
  archive_beam:     ['fires the archive beam!', 'channels ancient energy into a beam!'],
  rewind:           ['rewinds time to restore health!', 'reverses its own timeline!'],
  data_cascade:     ['initiates a data cascade—overwhelming!', 'overloads your systems with data!'],
  void_annihilation:['channels the void to annihilate!', 'fires void annihilation!'],
  singularity_pull: ['creates a singularity—inescapable!', 'pulls you into a micro-singularity!'],
  cosmic_decree:    ['issues a cosmic decree—reality obeys!', 'commands reality itself to strike!'],
  reality_rend:     ['tears reality apart!', 'rips the fabric of space!'],
  oblivion_wave:    ['sends an oblivion wave crashing down!', 'releases an oblivion wave!'],
  dark_ascension:   ['ascends to dark form—all stats surge!', 'undergoes dark ascension!'],
};
