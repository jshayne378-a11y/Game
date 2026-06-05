// =====================================================
//  sprites.js  – Canvas pixel-art sprite renderer
//  Each sprite is defined as a pixel grid (char array)
//  with a palette map, drawn at configurable scale.
// =====================================================

const SPRITE_SCALE = 4;  // each "pixel" = 4×4 canvas pixels

// ---- helper ----
function drawSprite(ctx, def, x, y, scale = SPRITE_SCALE, flipX = false, tint = null) {
  const { palette, pixels } = def;
  const rows = pixels.length;
  const cols = pixels[0].length;
  ctx.save();
  if (flipX) {
    ctx.translate(x + cols * scale, y);
    ctx.scale(-1, 1);
    x = 0;
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ch = pixels[r][c];
      if (ch === '.' || ch === ' ') continue;
      let color = palette[ch] || '#ff00ff';
      if (tint) color = blendColor(color, tint, 0.35);
      ctx.fillStyle = color;
      ctx.fillRect((flipX ? 0 : x) + c * scale, y + r * scale, scale, scale);
    }
  }
  ctx.restore();
}

function blendColor(hex, tintHex, amount) {
  const a = hexToRgb(hex), b = hexToRgb(tintHex);
  if (!a || !b) return hex;
  const r = Math.round(a.r + (b.r - a.r) * amount);
  const g = Math.round(a.g + (b.g - a.g) * amount);
  const bl = Math.round(a.b + (b.b - a.b) * amount);
  return `rgb(${r},${g},${bl})`;
}
function hexToRgb(h) {
  const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
  return res ? { r: parseInt(res[1],16), g: parseInt(res[2],16), b: parseInt(res[3],16) } : null;
}

// =====================================================
//  SPRITE DEFINITIONS  (16-wide unless noted)
//  '.' = transparent
// =====================================================

const SPRITES = {};

// ---- Player: Space Commander ----
SPRITES.player = {
  palette: {
    'H': '#c8d8ff',   // helmet white
    'V': '#5588ff',   // visor blue
    'S': '#8899bb',   // suit grey-blue
    'D': '#6677aa',   // suit dark
    'G': '#446688',   // glove
    'B': '#334466',   // boot
    'Y': '#ffcc44',   // shoulder badge
    'W': '#88aacc',   // weapon
    'T': '#ccddff',   // suit trim
    'E': '#44ffee',   // visor glow
  },
  pixels: [
    '......HHHH......',
    '....HHHHHHHH....',
    '...HVVVVVVVVH...',
    '...HEEVVVVVEH...',
    '....HHHHHHHH....',
    '..YSSSSSSSSY....',
    '.TSSDDDDDDDSST..',
    '.TSSDDDDDDDST...',
    'GGSDDDDDDDDDSgG.',
    'GGWDDDDDDDDDSGGG',
    '.TSSDDDDDDDST...',
    '..TSSSSSSSSST...',
    '...BBBBBBBBB....',
    '..BBB.....BBB...',
    '..BB.......BB...',
  ],
};

// ---- Mining Drone ----
SPRITES.drone = {
  palette: {
    'R': '#aa6633',  // rust body
    'D': '#884422',  // dark rust
    'L': '#ffcc44',  // light sensor
    'G': '#556677',  // grey joint
    'B': '#333333',  // black
    'A': '#cc8844',  // arm
    'S': '#aabb99',  // sensor
  },
  pixels: [
    '....RRRRRRR.....',
    '...RRDDDDDRRR...',
    '..RRDLLLLLDRR...',
    '..RRDSSSSDDRR...',
    '...RRDDDDDRRR...',
    'AAAAARRRRRAAAAAA',
    'AADAAGGGGGAAADA.',
    '...RRGGGGGRRR...',
    '..RRRGGGGGRRRR..',
    '..RRRGGGGGRRR...',
    '....RRRRRRR.....',
    '...GGGGGGGGG....',
    '..GGG.....GGG...',
  ],
};

// ---- Generic humanoid (corrupted worker, smuggler) ----
SPRITES.humanoid = {
  palette: {
    'H': '#886655',  // skin
    'C': '#558866',  // clothes
    'D': '#336644',  // clothes dark
    'B': '#222222',  // boots
    'G': '#886633',  // gloves
    'E': '#ff4444',  // eyes (corrupted)
    'W': '#ccaa77',  // weapon
  },
  pixels: [
    '.....HHHH.......',
    '....HEHHEHH.....',
    '....HHHHHH......',
    '...CCCCCCCC.....',
    '..CCDDDDDDCC....',
    '.CCDDDDDDDDC....',
    'GCCDDWDDDDCCG...',
    'GCDDWWWWDDCCG...',
    '..CDDDDDDDC.....',
    '..CDDDDDDDC.....',
    '..BBBB.BBBB.....',
    '..BBB...BBB.....',
  ],
};

// ---- Ore Golem ----
SPRITES.golem = {
  palette: {
    'R': '#998855',  // rock
    'D': '#776633',  // dark rock
    'L': '#ccaa66',  // light rock
    'G': '#ff8822',  // lava crack
    'E': '#ffcc44',  // eyes
  },
  pixels: [
    '.....RRRRR.......',
    '....RRRRRRRR.....',
    '...RRDRRRRDRR....',
    '...RRERRRERRR....',
    '....RRRGRRRRR....',
    '..RRRRRRRRRRRRR..',
    '.RRRDDGGGDDRRRRR.',
    'RRRRDGGGGGGDRRRRR',
    'RRRRDGDLLDGDRRRRR',
    '.RRRDDDDDDDRRRR..',
    '..RRRRRRRRRRRR...',
    '..RRRRR.RRRRR....',
    '.RRRR...RRRR.....',
    '.RRR.....RRR.....',
  ],
};

// ---- Security Robot ----
SPRITES.robot = {
  palette: {
    'B': '#6688aa',  // blue-grey body
    'D': '#445566',  // dark
    'L': '#88aacc',  // light panel
    'R': '#ff4444',  // red eye
    'G': '#44aa88',  // green indicator
    'W': '#ccddee',  // white sensor
    'Y': '#ffcc00',  // yellow detail
  },
  pixels: [
    '.....BBBBB.......',
    '....BBDDBBB......',
    '...BBRWWRWBB.....',
    '...BBRRRRRBB.....',
    '....BBDDBBB......',
    '..LLLBBBBBLL.....',
    '.LLLLBGYGBLLLL...',
    'WLLLBBDDDBBLLLL..',
    'WLLLBBDDDBBLLLL..',
    '.LLLLBBBBBLLLL...',
    '...LLLLL.LLLLL...',
    '...LLLL...LLLLL..',
    '...DDD.....DDD...',
  ],
};

// ---- Plasma Worm ----
SPRITES.worm = {
  palette: {
    'R': '#cc3322',  // red body
    'D': '#882211',  // dark
    'L': '#ff5544',  // light
    'Y': '#ffaa22',  // plasma
    'E': '#ffff44',  // eyes
    'T': '#ff7700',  // tip
  },
  pixels: [
    '.....TTTT........',
    '....TYYYYT.......',
    '..RRRYRRRRYYY....',
    '.RRDDRRRRRRDRRR..',
    'RRDDDREERRERDDR..',
    'RRDDDRRRRRRRDDR..',
    '.RRRRRRLLRRRRR...',
    '..RRRRRRRRRR.....',
    '....RRRRRR.......',
    '.....RRRR........',
  ],
};

// ---- Space Pirate ----
SPRITES.pirate = {
  palette: {
    'H': '#aa8855',  // skin
    'B': '#664422',  // brown clothes
    'D': '#443311',  // dark brown
    'R': '#cc3322',  // red bandana
    'G': '#885533',  // boots/gloves
    'W': '#aabbcc',  // weapon
    'S': '#ccaa88',  // skull
  },
  pixels: [
    '...RRRRRRRR......',
    '...RRSSRRRR......',
    '....HHHHHH.......',
    '...HHHSHHH.......',
    '....HHHHHH.......',
    '...BBBBBBBBB.....',
    '..BDDDDDDDDDB....',
    '.BDDDWWWWDDDDDB..',
    'GBDDDWDDDDDDDBG..',
    'GBDDDDDDDDDDBGG..',
    '..BDDDDDDDDDB....',
    '...GGGGG.GGGGG...',
    '..GGG.....GGG....',
  ],
};

// ---- Turret Drone ----
SPRITES.turret = {
  palette: {
    'B': '#334488',  // blue body
    'D': '#223366',  // dark blue
    'L': '#4455aa',  // light blue
    'R': '#ff3322',  // red eye
    'G': '#33cc44',  // green light
    'W': '#888899',  // weapon barrel
    'Y': '#ffcc00',  // warning stripe
  },
  pixels: [
    '......BBBB.......',
    '.....BBDDBBB.....',
    '....BBRRRRRBB....',
    '....BBRYRYRBB....',
    '.....BBBBBBB.....',
    '..YYYBBBBBBYYYY..',
    '.WWWWBBBBBBBWWWW.',
    'WWWWWBBBGBBBWWWWW',
    '.WWWWBBBBBBBWWWW.',
    '..BBBBBBBBBBB....',
    '....BBBBBBB......',
    '....BBB.BBB......',
  ],
};

// ---- Pirate Captain ----
SPRITES.captain = {
  palette: {
    'H': '#cc9966',  // skin
    'C': '#882200',  // red coat
    'D': '#661100',  // dark red
    'G': '#886644',  // gold trim
    'B': '#222222',  // black
    'W': '#ccbbaa',  // weapon
    'E': '#000000',  // eyepatch
    'K': '#ffcc00',  // gold buttons
  },
  pixels: [
    '....GGGGGGG......',
    '....GHHHHHGH.....',
    '...HHHHEHHHH.....',
    '...HHHHHHHHH.....',
    '....GGGGGGG......',
    '..GCCCCCCCCGGG...',
    '.GCDDDDDDDDDCGG..',
    'GCDDDKWWKDDDCGG..',
    'GCDDDWWWWWDDCGGG.',
    '.GCDDDDDDDDCGG...',
    '..GCCCCCCCGG.....',
    '..BBBBG.BBBB.....',
    '..BBB.....BBB....',
  ],
};

// ---- Cyber Assassin ----
SPRITES.assassin = {
  palette: {
    'B': '#443355',  // dark purple suit
    'D': '#221133',  // darker
    'C': '#aa33cc',  // cybernetic purple
    'L': '#dd55ee',  // light cyber
    'E': '#ff00ff',  // cyber eye
    'W': '#ccccdd',  // blade
    'G': '#887799',  // grey suit
  },
  pixels: [
    '......BBBB.......',
    '.....BBEEBB......',
    '....BBBBBBBB.....',
    '....BBBBBBBB.....',
    '.....CCCCCC......',
    '..BBBCCLLCCBBB...',
    '.BBDDDCLLCDDDBB..',
    'BBDDDDDDDDDDDDBB.',
    'WBDDDDDDDDDDDDWB.',
    '.BBDDDDDDDDDBB...',
    '..BBBDDDDDBBBB...',
    '..BBBBB.BBBBB....',
    '..BBB.....BBB....',
  ],
};

// ---- Alien Grub ----
SPRITES.grub = {
  palette: {
    'G': '#33aa44',  // green body
    'D': '#226633',  // dark green
    'L': '#55cc66',  // light green
    'Y': '#aaff22',  // bio-luminescent
    'E': '#ff4422',  // eyes
    'S': '#99dd55',  // slime
  },
  pixels: [
    '....GGGGGGG......',
    '...GGDEDDEG......',
    '..GGGDDDDGGG.....',
    '.GGGDDYYDDGGGG...',
    'GGGGDDDDDDDGGGG..',
    'GSLLLLLLLLLLLGGG.',
    'GSLLLLLLLLLLLLG..',
    '.GGLLLLLLLLLGG...',
    '..GGGGGGGGGG.....',
    '...GGGG.GGGG.....',
  ],
};

// ---- Alien Stalker ----
SPRITES.stalker = {
  palette: {
    'G': '#228855',  // dark green
    'L': '#33aa77',  // lighter
    'D': '#114433',  // darkest
    'E': '#ff2200',  // eyes
    'C': '#99ff55',  // claws
    'T': '#44dd88',  // tail
  },
  pixels: [
    '....G..G.G.......',
    '...GGGGGGG.......',
    '..GGDEEGDGG......',
    '..GGGGGGGGG......',
    '.GGGDGGDGGG......',
    'CGGGGGGGGGGGC....',
    'CCGGGGGGGGGCC....',
    '.CGGGGGGGGGC.....',
    '..GGGLLLGGG......',
    '..GGGTT.GGGTT....',
    '...GG.T..GG.T....',
  ],
};

// ---- Hive Warrior ----
SPRITES.warrior_alien = {
  palette: {
    'C': '#115533',  // chitin dark
    'L': '#227755',  // chitin light
    'G': '#33aa66',  // green
    'E': '#ff4400',  // eye
    'M': '#44ff88',  // bio-glow
    'A': '#88ffaa',  // acid
    'S': '#550022',  // red mandible
  },
  pixels: [
    '....CCCC.CCCC....',
    '...CCEECCEEC.....',
    '...CCCCCCCC......',
    '..CCCMMMMMCCC....',
    '.CCCMMMMMMMMCC...',
    'SCCCMMMMMMMMMCS..',
    'SCCCMMMMMMMMCCS..',
    '.CCCMMAMMMMCC....',
    '..CCCCCCCCCC.....',
    '..AAACCCCAA......',
    '...AA.CCC.AA.....',
    '....A.....A......',
  ],
};

// ---- Acid Spitter ----
SPRITES.spitter = {
  palette: {
    'Y': '#99cc22',  // yellow-green
    'G': '#66aa11',  // green
    'D': '#448800',  // dark
    'A': '#ccff44',  // acid
    'E': '#ff6600',  // eyes
    'S': '#aaffaa',  // sac
  },
  pixels: [
    '......YYYY.......',
    '.....YYGYYG......',
    '....YYEYYEYY.....',
    '...YYYYYYYYYY....',
    '..YYGDDDDDYY.....',
    '.YYGDSSSSDDYY....',
    'AAGDSSSSSSSDYY...',
    'AAGDSSSSSSSDYAA..',
    '.YYGDDDDDDDYY....',
    '..YYYYYYYYYYY....',
    '...AAAA.AAAA.....',
  ],
};

// ---- Void Beast ----
SPRITES.beast = {
  palette: {
    'P': '#443366',  // purple body
    'D': '#221144',  // dark purple
    'L': '#6655aa',  // lighter
    'E': '#ff00ff',  // eyes (magenta)
    'C': '#aa00ff',  // energy cracks
    'V': '#ffffff',  // void white
  },
  pixels: [
    '...PPPP..PPPP....',
    '..PPDPPPPPPDPP...',
    '.PPPPEPPPEPPPPP..',
    'PPPPPPPPPPPPPPP..',
    'PPPDDDCCCDDDPPP..',
    'PPPDVCCCCCVDPPP..',
    'PPPDDCCCCCDDDPP..',
    '.PPPPPPPPPPPPP...',
    '..PPPPPPPPPPPP...',
    '...PPPPP.PPPP....',
    '....PPP...PPP....',
  ],
};

// ---- Ancient Guardian ----
SPRITES.guardian = {
  palette: {
    'S': '#aaaa55',  // stone-gold
    'D': '#888833',  // darker
    'L': '#cccc88',  // lighter
    'R': '#dd4400',  // rune glow
    'G': '#ffaa00',  // gem
    'E': '#ffff44',  // eye glow
    'B': '#554433',  // base
  },
  pixels: [
    '.....SSSSS.......',
    '....SSDDSSS......',
    '...SSEEEESSS.....',
    '...SSRRRSSS......',
    '....SSSSSSS......',
    '..RRSSSSSSSRR....',
    '.RRSDDGDDDSRR....',
    'RRSDDDGDDDDSR....',
    'RRSDDDDDDDDSRR...',
    '.RRSDDDDDDSR.....',
    '..SSSSSSSSSS.....',
    '..SBBBBBBBB......',
    '..BBB.....BBB....',
  ],
};

// ---- Rune Sentinel ----
SPRITES.sentinel = {
  palette: {
    'B': '#7777cc',  // blue-purple
    'D': '#4444aa',  // dark
    'L': '#9999ee',  // light
    'R': '#ff4488',  // rune pink
    'E': '#ff88ff',  // eye
    'G': '#aaaaff',  // glow
  },
  pixels: [
    '....BBBBB........',
    '...BBRRRBB.......',
    '..BBREREBBB......',
    '..BBBBBBBB.......',
    '..BGGGGGGGBB.....',
    '.BBDDRRRRDDBBB...',
    'BBDDDRRRRRDDDBBB.',
    'BBDDDGGGGDDDDBB..',
    '.BBDDDDDDDDDBB...',
    '..BBBBBBBBBBB....',
    '..BBBBB.BBBBB....',
    '..BBB.....BBB....',
  ],
};

// ---- Phase Wraith ----
SPRITES.wraith = {
  palette: {
    'W': '#aaaaff',  // white-blue
    'D': '#7777cc',  // dimmer
    'L': '#ddddff',  // bright
    'E': '#ff00ff',  // eyes
    'G': '#ffffff',  // pure white
    'V': '#ccccff',  // veil
  },
  pixels: [
    '......VVVV.......',
    '....VVWWWVVV.....',
    '...VWWWLWWWVV....',
    '..VWWWELEEWWV....',
    '..VWWWWWWWWWV....',
    '.VVWWWWWWWWWVV...',
    'VVWWWWDDDDWWWVV..',
    '.VWWWWDDDDWWWV...',
    '..VWWWWWWWWWV....',
    '...VVWWWWWVV.....',
    '....VVVV.VVV.....',
    '.....V.....V.....',
  ],
};

// ---- Temporal Clone (looks like player but distorted) ----
SPRITES.clone = {
  palette: {
    'H': '#88aacc',
    'V': '#4466dd',
    'S': '#557799',
    'D': '#335577',
    'G': '#224466',
    'B': '#112244',
    'Y': '#aaccff',
    'E': '#00ffff',
    'T': '#6688aa',
  },
  pixels: [
    '......HHHH.......',
    '....HHHHHHHH.....',
    '...HVVVVVVVVH....',
    '...HEEVVVVVEH....',
    '....HHHHHHHH.....',
    '..YSSSSSSSY......',
    '.TSSDDDDDDSST....',
    '.TSSDDDDDDDST....',
    'GGSDDDDDDDDDSG...',
    'GGSDDDDDDDDDSG...',
    '.TSSDDDDDDDST....',
    '..TSSSSSSSST.....',
    '...BBBBBBBBB.....',
    '..BBB.....BBB....',
  ],
};

// ---- Void Shade ----
SPRITES.shade = {
  palette: {
    'V': '#552288',  // void purple
    'D': '#331155',  // dark
    'L': '#8844bb',  // lighter
    'E': '#ffffff',  // white eyes
    'G': '#cc44ff',  // glow
    'T': '#441166',  // tail/wisp
  },
  pixels: [
    '........T........',
    '......TTTTT......',
    '.....TVVVVVTT....',
    '....TVVDEDVVT....',
    '...TTVVDEDDVVT...',
    '..TTTVVVGGVVVTT..',
    '.TTVVVVVVVVVVTTT.',
    'TTVVVVDDDDVVVVTT.',
    'TVVVVDDDDDDDVVTT.',
    '.TVVVVDDDDVVVTT..',
    '..TTVVVVVVVTTT...',
    '...TTTTTTTTT.....',
    '....T.....T......',
  ],
};

// ---- Dark Matter Fiend ----
SPRITES.fiend = {
  palette: {
    'B': '#220044',  // near-black purple
    'D': '#110022',  // darkest
    'L': '#440088',  // lighter
    'E': '#ff00cc',  // pink eyes
    'G': '#8800ff',  // glow
    'W': '#ffffff',  // white fleck
  },
  pixels: [
    '....BBBBB........',
    '...BBDDDBB.......',
    '..BBDEEDEDBB.....',
    '..BBBDDDDBBB.....',
    '.BBBBBBBBBBB.....',
    'BBBBBGGGGGBBB....',
    'BBBBBGWWWGBBBB...',
    'BBBBBGWWWGBBBB...',
    '.BBBBBGGGBBBB....',
    '..BBBBBBBBBBB....',
    '...BBB..BBB......',
    '...BB....BB......',
  ],
};

// ---- Entropy Beast ----
SPRITES.entropy = {
  palette: {
    'O': '#884400',  // orange-brown
    'D': '#552200',  // dark
    'L': '#bb6622',  // lighter
    'R': '#ff4400',  // fire red
    'Y': '#ffaa00',  // yellow
    'C': '#ff7700',  // orange cracks
  },
  pixels: [
    '....OOOO.OOOOO...',
    '...OOOOOOOOOOO...',
    '..OORDDRRDDROO...',
    '..OORRYRYRRROO...',
    '.OOOCCCCCCCOOO...',
    'OOOOCCYYYCCOOOO..',
    'OOOOCYYYYYCOOOO..',
    'OOOOOCCCCCOOOOO..',
    '.OOOOOOOOOOOOO...',
    '..OOOOO.OOOOO....',
    '...OOO...OOO.....',
  ],
};

// ---- Null Entity ----
SPRITES.null = {
  palette: {
    'W': '#dddddd',  // white
    'L': '#ffffff',  // bright
    'D': '#aaaaaa',  // dim
    'G': '#888888',  // grey
    'B': '#000000',  // void black holes
    'E': '#000000',  // eyes
  },
  pixels: [
    '...WWWWWWWWW.....',
    '..WWWDDDDDWWW....',
    '.WWWWDBBBDWWWW...',
    '.WWWDBBBBBBDWWW..',
    'LWWWWBBEBEBBWWWL.',
    'LWWWWBBBBBBBWWWL.',
    'LWWWWBBDDDBBWWWL.',
    '.WWWWBBBBBBBWWW..',
    '.WWWDDDDDDDDWWW..',
    '..WWWWWWWWWWWW...',
    '...WWWWWWWWWW....',
    '....WWWW.WWWW....',
  ],
};

// ============================
//  BOSS SPRITES
// ============================

// ---- Boss: Foreman Rex (mining mech) ----
SPRITES.boss_mech = {
  palette: {
    'R': '#aa5522',  // rust
    'D': '#662200',  // dark rust
    'L': '#cc7744',  // lighter
    'G': '#ffaa00',  // glowing core
    'E': '#ff4400',  // red eye
    'Y': '#ffcc00',  // yellow stripe
    'B': '#333333',  // black
    'S': '#888866',  // metal
    'W': '#ccccaa',  // weapon
  },
  pixels: [
    '.....RRRRRRR.....',
    '....RRDDDRRR.....',
    '...RRREEEERRRR...',
    '...RRREEERRRRR...',
    '....RRRRRRR......',
    '..YYRRRRRRRRRYY..',
    '.YYRRDDDDDDRRYY..',
    'WRRRDGGGGGGRRRW..',
    'WRRRDGGGGGGRRRW..',
    'WRRRDDGGGDDDRRW..',
    '.YYRRRRRRRRRYY...',
    '..SSSRRRRRSSS....',
    '..SSSRRRRRSSS....',
    '..SSSS...SSSS....',
    '..SSS.....SSS....',
  ],
};

// ---- Boss: Captain Bloodstar ----
SPRITES.boss_pirate = {
  palette: {
    'H': '#cc9966',
    'C': '#990000',
    'D': '#660000',
    'G': '#ffaa00',
    'B': '#222222',
    'W': '#ccbbaa',
    'E': '#000000',
    'K': '#ffcc00',
    'R': '#ff2200',
    'S': '#884400',
  },
  pixels: [
    '...GGGGGGGGGG....',
    '...GHHHHHHHGG....',
    '..HHHHEHHHHHH....',
    '..HHHHHHHHHH.....',
    '..HHHRHHHRHH.....',
    '.GCCCCCCCCCCG....',
    'GCDDDDKKDDDDCG...',
    'GCDDDWWWWWDDCG...',
    'GKDDWWWWWWWDKG...',
    'GKDDDDDDDDDDKG...',
    '.GCCCCCCCCCCG....',
    '..GBBBBBBBG......',
    '..BBB.....BBB....',
    '..BB.......BB....',
  ],
};

// ---- Boss: Hive Queen Xara ----
SPRITES.boss_queen = {
  palette: {
    'G': '#116633',
    'L': '#33aa66',
    'D': '#0a3322',
    'E': '#ff0000',
    'A': '#88ff22',
    'C': '#22ff88',
    'M': '#ff8800',
    'S': '#66ff99',
  },
  pixels: [
    '..GGGG.GGGG.GGGG.',
    '.GGGGGGGGGGGGGG..',
    'GGLDLEEDLEEDLGGG.',
    'GGGGGGGGGGGGGGG..',
    '.GGAAACCCAAAGGG..',
    'MMGGACCCCCAGGMM..',
    'MMGGGCSSSCGGMM...',
    'MMGGGGSSSGGGMM...',
    '.MGGGGGGGGGGM....',
    '..GGGGGGGGGG.....',
    '..GGGGG.GGGGG....',
    '..GGG.....GGG....',
    '..GG.......GG....',
    '..G.........G....',
  ],
};

// ---- Boss: The Archivist ----
SPRITES.boss_ancient = {
  palette: {
    'S': '#aaaa44',
    'D': '#777722',
    'L': '#dddd88',
    'R': '#ff4400',
    'G': '#ffcc00',
    'E': '#ffffff',
    'B': '#554400',
    'H': '#cccc66',
  },
  pixels: [
    '....SSSSSSSS.....',
    '...SSRRRRRSS.....',
    '..SSREEERESSS....',
    '..SSSRRRRSSS.....',
    '...SSSSSSS.......',
    '.HHSSSSSSSSSH....',
    'HHSDDDGGGDDDSH...',
    'HHSDDDGGGDDDSHHH.',
    'HHSDDDGGGDDDSH...',
    '.HHSSSSSSSSH.....',
    '...SSSSSSS.......',
    '..SBBBBB.BBBBS...',
    '..BBB.......BBB..',
    '..BB.........BB..',
  ],
};

// ---- Boss: Void Sovereign ----
SPRITES.boss_sovereign = {
  palette: {
    'V': '#5511aa',
    'D': '#330077',
    'L': '#8833dd',
    'E': '#ffffff',
    'G': '#ff00ff',
    'S': '#cc00ff',
    'C': '#ffccff',
    'T': '#770099',
    'W': '#ff88ff',
  },
  pixels: [
    '...T.....T.T.....',
    '..TTVVVVVVVTTT...',
    '.TTVVDDDDDVVTT...',
    'TTVVVDGGEDDVVTT..',
    'TVVVDDGEGEDDDVT..',
    'TVVVDGGGGGDDDVT..',
    'TVVVDDGGGDDDDVT..',
    'SVVVVDDDDDDVVVS..',
    'SVVVVVVVVVVVVVS..',
    '.SVVVVVVVVVVSS...',
    '..SSVVVVVVSS.....',
    '..TSSSSSSST......',
    '...T.....T.......',
    '....T...T........',
  ],
};

// =====================================================
//  PARTICLE EFFECTS
// =====================================================

class ParticleSystem {
  constructor() { this.particles = []; }

  spawn(x, y, type) {
    const configs = {
      laser:     { count: 12, speed: 3, life: 25, colors: ['#44aaff','#88ccff','#ffffff'], size: 3 },
      explosion: { count: 25, speed: 5, life: 35, colors: ['#ff8800','#ff4400','#ffcc00','#ffffff'], size: 5 },
      hit:       { count: 8,  speed: 2, life: 20, colors: ['#ff4444','#ffaa44','#ffffff'], size: 3 },
      heal:      { count: 10, speed: 1.5, life: 30, colors: ['#44ff88','#88ffaa','#ffffff'], size: 3 },
      shield:    { count: 15, speed: 2.5, life: 25, colors: ['#4488ff','#88aaff','#aaccff'], size: 4 },
      ability:   { count: 20, speed: 4, life: 30, colors: ['#bb44ff','#ff44ff','#ffffff'], size: 4 },
      energy:    { count: 10, speed: 2, life: 22, colors: ['#4488ff','#44ffee','#ffffff'], size: 3 },
    };
    const cfg = configs[type] || configs.hit;
    for (let i = 0; i < cfg.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd   = (Math.random() * 0.8 + 0.2) * cfg.speed;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd * 0.7,
        life: cfg.life + Math.random() * 10,
        maxLife: cfg.life + 10,
        color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
        size: cfg.size * (0.5 + Math.random() * 0.8),
        type,
      });
    }
  }

  update() {
    this.particles = this.particles.filter(p => {
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.08;  // gravity
      p.life--;
      return p.life > 0;
    });
  }

  draw(ctx) {
    this.particles.forEach(p => {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
    });
    ctx.globalAlpha = 1;
  }
}

// =====================================================
//  STAR FIELD
// =====================================================

class StarField {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.stars  = [];
    this.init();
  }

  init() {
    this.stars = [];
    for (let i = 0; i < 180; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 1.8 + 0.3,
        speed: Math.random() * 0.25 + 0.03,
        bright: Math.random() * 0.7 + 0.3,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.04 + 0.01,
        layer: Math.floor(Math.random() * 3),  // 0=far, 1=mid, 2=near
      });
    }
    // Add a few "special" big stars
    for (let i = 0; i < 6; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2.5 + 2,
        speed: Math.random() * 0.1 + 0.02,
        bright: 1,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        layer: 0, special: true,
      });
    }
  }

  update(sectorId = 1) {
    const baseSpeed = 1 + (sectorId - 1) * 0.1;
    this.stars.forEach(s => {
      s.x -= s.speed * baseSpeed;
      if (s.x < -5) s.x = this.canvas.width + 5;
      s.twinklePhase += s.twinkleSpeed;
    });
  }

  draw(sectorId = 1) {
    const w = this.canvas.width, h = this.canvas.height;

    // Background gradient based on sector
    const gradients = {
      1: ['#0a0805', '#05040a'],
      2: ['#08080a', '#0a0805'],
      3: ['#050a05', '#08080a'],
      4: ['#080808', '#0a0a05'],
      5: ['#04000a', '#080005'],
    };
    const [c1, c2] = gradients[sectorId] || gradients[1];
    const grad = this.ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, w, h);

    // Nebula clouds
    this._drawNebula(sectorId);

    // Stars
    this.stars.forEach(s => {
      const twinkle = (Math.sin(s.twinklePhase) + 1) / 2;
      const alpha   = s.bright * (0.5 + twinkle * 0.5);
      this.ctx.globalAlpha = alpha;
      if (s.special) {
        // Draw cross-shaped flare
        const clr = sectorId === 5 ? '#cc88ff' : '#ffffff';
        this.ctx.fillStyle = clr;
        this.ctx.fillRect(s.x - s.size/2, s.y - s.size/2, s.size, s.size);
        this.ctx.globalAlpha = alpha * 0.4;
        this.ctx.fillRect(s.x - s.size*1.5, s.y - s.size*0.2, s.size*3, s.size*0.4);
        this.ctx.fillRect(s.x - s.size*0.2, s.y - s.size*1.5, s.size*0.4, s.size*3);
      } else {
        const starColors = {
          1: ['#ffffff','#ffffcc','#ccddff'],
          2: ['#ffffff','#ffcccc','#ccddff'],
          3: ['#ccffcc','#ffffff','#88ffaa'],
          4: ['#ffffaa','#ffffff','#ccddff'],
          5: ['#ccaaff','#ffffff','#ffaaff'],
        }[sectorId] || ['#ffffff','#ccddff','#ffffcc'];
        this.ctx.fillStyle = starColors[s.layer];
        this.ctx.fillRect(s.x, s.y, s.size, s.size);
      }
    });
    this.ctx.globalAlpha = 1;
  }

  _drawNebula(sectorId) {
    const nebulaConfigs = {
      1: { x: 0.7, y: 0.3, r: 150, color: 'rgba(100,60,30,' },
      2: { x: 0.2, y: 0.7, r: 130, color: 'rgba(80,40,20,' },
      3: { x: 0.5, y: 0.5, r: 160, color: 'rgba(20,80,20,' },
      4: { x: 0.8, y: 0.2, r: 140, color: 'rgba(80,80,20,' },
      5: { x: 0.4, y: 0.6, r: 180, color: 'rgba(60,10,100,' },
    };
    const cfg = nebulaConfigs[sectorId] || nebulaConfigs[1];
    const cx  = this.canvas.width  * cfg.x;
    const cy  = this.canvas.height * cfg.y;
    const grad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, cfg.r);
    grad.addColorStop(0,   cfg.color + '0.18)');
    grad.addColorStop(0.5, cfg.color + '0.06)');
    grad.addColorStop(1,   cfg.color + '0)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

// =====================================================
//  BATTLE SCENE RENDERER
// =====================================================

class BattleRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.W      = canvas.width;
    this.H      = canvas.height;
    this.particles = new ParticleSystem();
    this.animations = [];  // queued animation steps
    this.playerBob  = 0;
    this.enemyBob   = 0;
    this.playerShakeX = 0;
    this.enemyShakeX  = 0;
    this._raf       = null;
    this._running   = false;
  }

  start() {
    if (this._running) return;
    this._running = true;
    const loop = () => {
      if (!this._running) return;
      this._update();
      this._draw();
      this._raf = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    this._running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
  }

  setScene(sectorId, playerData, enemyData) {
    this.sectorId   = sectorId;
    this.playerData = playerData;
    this.enemyData  = enemyData;
    this.playerBobT = 0;
    this.enemyBobT  = 0;
  }

  // Queue an animation event
  queueAnim(type, onComplete) {
    this.animations.push({ type, onComplete, frame: 0 });
  }

  _update() {
    this.playerBobT = (this.playerBobT || 0) + 0.06;
    this.enemyBobT  = (this.enemyBobT  || 0) + 0.05;
    this.playerBob  = Math.sin(this.playerBobT) * 2;
    this.enemyBob   = Math.sin(this.enemyBobT)  * 2;
    if (this.playerShakeX > 0) this.playerShakeX = Math.max(0, this.playerShakeX - 1);
    if (this.enemyShakeX  > 0) this.enemyShakeX  = Math.max(0, this.enemyShakeX  - 1);
    this.particles.update();
  }

  _draw() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;
    ctx.clearRect(0, 0, W, H);

    // Sector-themed floor/bg
    this._drawBackground();

    // Ground line
    ctx.strokeStyle = 'rgba(100,100,150,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H - 30);
    ctx.lineTo(W, H - 30);
    ctx.stroke();

    // Draw enemy
    if (this.enemyData) {
      const ex = W * 0.72, ey = H - 80 + this.enemyBob
        + (this.enemyShakeX ? (Math.random() - 0.5) * 6 : 0);
      this._drawCharacter(this.enemyData, ex, ey, false);
    }

    // Draw player
    if (this.playerData) {
      const px = W * 0.22, py = H - 80 + this.playerBob
        + (this.playerShakeX ? (Math.random() - 0.5) * 6 : 0);
      this._drawCharacter(this.playerData, px, py, true);
    }

    // Particles on top
    this.particles.draw(ctx);
  }

  _drawBackground() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;
    const colors = {
      1: ['#120808', '#1a1008'],
      2: ['#080808', '#100a08'],
      3: ['#080c08', '#060a06'],
      4: ['#080808', '#0a0a06'],
      5: ['#060008', '#0a0016'],
    };
    const [c1, c2] = (colors[this.sectorId] || colors[1]);
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle environment detail lines
    ctx.strokeStyle = 'rgba(80,80,100,0.1)';
    ctx.lineWidth = 1;
    for (let y = 20; y < H - 30; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(W, y);
      ctx.stroke();
    }
  }

  _drawCharacter(data, cx, cy, isPlayer) {
    const ctx = this.ctx;
    const spriteDef = SPRITES[data.spriteKey] || SPRITES.humanoid;
    const scale = data.boss ? 6 : 5;
    const rows  = spriteDef.pixels.length;
    const cols  = spriteDef.pixels[0].length;
    const sw = cols * scale;
    const sh = rows * scale;
    const x  = cx - sw / 2;
    const y  = cy - sh;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, sw * 0.45, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tint for status effects
    let tint = null;
    if (data.defending) tint = '#4488ff';
    if (data.stunned)   tint = '#ffaa00';

    drawSprite(ctx, spriteDef, x, y, scale, isPlayer, tint);

    // HP bar above character
    if (data.hp !== undefined && data.maxHp) {
      const barW = sw, barH = 4;
      const bx = x, by = y - 10;
      const pct = Math.max(0, data.hp / data.maxHp);
      const hpClr = pct > 0.5 ? '#44ff88' : pct > 0.25 ? '#ffaa00' : '#ff4444';
      ctx.fillStyle = '#111';
      ctx.fillRect(bx, by, barW, barH);
      ctx.fillStyle = hpClr;
      ctx.fillRect(bx, by, barW * pct, barH);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, barW, barH);
    }
  }

  flashPlayer() {
    this.playerShakeX = 8;
    this.particles.spawn(
      this.W * 0.22 + (Math.random() - 0.5) * 20,
      this.H - 80, 'hit'
    );
  }

  flashEnemy() {
    this.enemyShakeX = 8;
  }

  spawnEffect(type, side) {
    const x = side === 'enemy' ? this.W * 0.72 : this.W * 0.22;
    const y = this.H - 60;
    this.particles.spawn(x, y, type);
  }

  drawProjectile(fromSide, type, progress, color) {
    // progress: 0→1
    const ctx = this.ctx;
    const sx = fromSide === 'player' ? this.W * 0.28 : this.W * 0.66;
    const ex = fromSide === 'player' ? this.W * 0.66 : this.W * 0.28;
    const y  = this.H - 55;
    const x  = sx + (ex - sx) * progress;

    ctx.save();
    // Glow
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    if (type === 'laser') {
      // trailing beam
      ctx.globalAlpha = 0.7;
      ctx.fillRect(Math.min(sx, x), y - 2, Math.abs(x - sx), 4);
      ctx.globalAlpha = 1;
      ctx.fillRect(x - 3, y - 3, 8, 6);
    } else if (type === 'energy') {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(x - 4, y - 4, 8, 8);
    }
    ctx.restore();
  }
}
