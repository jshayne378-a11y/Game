// =====================================================
//  audio.js  – Web Audio API retro sound system
// =====================================================

class AudioSystem {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.masterVol = 0.4;
    this._init();
  }

  _init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) {
      this.enabled = false;
    }
  }

  _resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  // ---- core tone generator ----
  _tone(freq, type, duration, vol, delay = 0, detune = 0) {
    if (!this.enabled || !this.ctx) return;
    this._resume();
    const now = this.ctx.currentTime + delay;
    const osc  = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    osc.detune.setValueAtTime(detune, now);
    gain.gain.setValueAtTime(vol * this.masterVol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  _noise(duration, vol, delay = 0) {
    if (!this.enabled || !this.ctx) return;
    this._resume();
    const now   = this.ctx.currentTime + delay;
    const buf   = this.ctx.createBuffer(1, this.ctx.sampleRate * duration, this.ctx.sampleRate);
    const data  = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src   = this.ctx.createBufferSource();
    const gain  = this.ctx.createGain();
    const filt  = this.ctx.createBiquadFilter();
    src.buffer  = buf;
    filt.type   = 'bandpass';
    filt.frequency.value = 200;
    src.connect(filt); filt.connect(gain); gain.connect(this.ctx.destination);
    gain.gain.setValueAtTime(vol * this.masterVol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    src.start(now); src.stop(now + duration + 0.05);
  }

  // ---- public sound effects ----
  click() {
    this._tone(880, 'square', 0.06, 0.3);
    this._tone(660, 'square', 0.06, 0.15, 0.03);
  }

  menuMove() {
    this._tone(440, 'square', 0.08, 0.2);
  }

  confirm() {
    this._tone(523, 'square', 0.1, 0.3);
    this._tone(659, 'square', 0.1, 0.3, 0.1);
    this._tone(784, 'square', 0.15, 0.35, 0.2);
  }

  cancel() {
    this._tone(330, 'square', 0.1, 0.25);
    this._tone(220, 'square', 0.12, 0.2, 0.1);
  }

  // Player attacks
  laserShot() {
    this._tone(880, 'sawtooth', 0.15, 0.4);
    this._tone(440, 'sawtooth', 0.12, 0.25, 0.08);
  }

  heavyShot() {
    this._tone(200, 'sawtooth', 0.3, 0.5);
    this._tone(150, 'square',   0.25, 0.4, 0.05);
    this._noise(0.2, 0.3, 0.05);
  }

  criticalHit() {
    this._tone(1320, 'sawtooth', 0.08, 0.5);
    this._tone(1760, 'sawtooth', 0.1,  0.5, 0.06);
    this._tone(2200, 'square',   0.12, 0.4, 0.12);
    this._noise(0.15, 0.3, 0.1);
  }

  enemyHit() {
    this._noise(0.12, 0.4);
    this._tone(150, 'square', 0.1, 0.3, 0.05);
  }

  playerHit() {
    this._noise(0.15, 0.5);
    this._tone(120, 'sawtooth', 0.15, 0.4, 0.05);
    this._tone(80,  'square',   0.18, 0.35, 0.1);
  }

  // Explosion
  explosion() {
    this._noise(0.4, 0.6);
    this._tone(80,  'square',   0.4, 0.4, 0.05);
    this._tone(60,  'sawtooth', 0.35, 0.3, 0.1);
  }

  // Defend
  defend() {
    this._tone(220, 'sine', 0.2, 0.3);
    this._tone(330, 'sine', 0.15, 0.25, 0.12);
  }

  // Shield hit (when defending)
  shieldBlock() {
    this._tone(660, 'triangle', 0.12, 0.3);
    this._tone(880, 'triangle', 0.1,  0.25, 0.06);
  }

  // Ability used
  ability() {
    this._tone(440, 'sine', 0.1, 0.3);
    this._tone(660, 'sine', 0.1, 0.3, 0.08);
    this._tone(880, 'sine', 0.12, 0.35, 0.16);
    this._tone(1100,'sine', 0.1, 0.3, 0.24);
  }

  // Heal
  heal() {
    this._tone(523, 'sine', 0.15, 0.3);
    this._tone(659, 'sine', 0.15, 0.3, 0.1);
    this._tone(784, 'sine', 0.18, 0.35, 0.2);
    this._tone(1046,'sine', 0.15, 0.3, 0.32);
  }

  // Level up fanfare
  levelUp() {
    const notes = [523, 659, 784, 1046, 1319];
    notes.forEach((n, i) => this._tone(n, 'square', 0.2, 0.4, i * 0.12));
    this._tone(1046, 'sine', 0.5, 0.5, notes.length * 0.12);
  }

  // Victory
  victory() {
    const melody = [523, 659, 784, 1046, 784, 1046, 1319, 1568];
    melody.forEach((n, i) => this._tone(n, 'square', 0.15, 0.35, i * 0.14));
  }

  // Boss defeated extra fanfare
  bossDefeated() {
    const melody = [523, 659, 784, 1046, 784, 1046, 1319, 1568, 2093];
    melody.forEach((n, i) => {
      this._tone(n,   'square', 0.18, 0.4, i * 0.13);
      this._tone(n/2, 'sine',   0.15, 0.25, i * 0.13);
    });
  }

  // Defeat / game over
  defeat() {
    this._tone(440, 'sawtooth', 0.4, 0.4);
    this._tone(330, 'sawtooth', 0.4, 0.35, 0.35);
    this._tone(220, 'sawtooth', 0.5, 0.3, 0.7);
    this._tone(110, 'square',   0.6, 0.3, 1.05);
  }

  // Enemy dies
  enemyDie() {
    this._noise(0.3, 0.5);
    this._tone(100, 'sawtooth', 0.3, 0.35, 0.05);
    this._tone(60,  'square',   0.4, 0.3, 0.15);
  }

  // Loot / item get
  itemPickup() {
    this._tone(784, 'sine', 0.1, 0.3);
    this._tone(1046,'sine', 0.12, 0.3, 0.1);
  }

  // Legendary item
  legendaryPickup() {
    const n = [523, 784, 1046, 1319, 1568, 2093];
    n.forEach((freq, i) => {
      this._tone(freq,   'sine',  0.2, 0.4, i*0.1);
      this._tone(freq*2, 'triangle', 0.1, 0.25, i*0.1 + 0.05);
    });
  }

  // Save
  save() {
    this._tone(660, 'sine', 0.08, 0.2);
    this._tone(880, 'sine', 0.1,  0.2, 0.1);
  }

  // Escape
  escape() {
    this._tone(440, 'square', 0.12, 0.3);
    this._tone(550, 'square', 0.1,  0.25, 0.1);
    this._tone(660, 'sine',   0.1,  0.2,  0.2);
  }

  // Miss
  miss() {
    this._tone(220, 'sine', 0.08, 0.15);
  }

  // Stun
  stun() {
    this._noise(0.2, 0.3);
    this._tone(440, 'square', 0.15, 0.25, 0.05);
    this._tone(220, 'square', 0.1,  0.2,  0.15);
  }

  // EMP effect
  emp() {
    this._noise(0.4, 0.4);
    for (let i = 0; i < 5; i++) {
      this._tone(880 - i*100, 'square', 0.1, 0.3, i * 0.07);
    }
  }
}

const audio = new AudioSystem();
