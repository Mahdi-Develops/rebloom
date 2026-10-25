/* ReBloom audio engine: everything is synthesized live. A small step sequencer plays one track per stage,
   a theme, and a boss track whose layers grow with the fight. A generated reverb gives it space. */
(function () {
  const S = window.SANC;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const N = (name) => { const map = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }; const m = name.match(/^([A-G])(#|b)?(\d)$/); return 12 * (+m[3] + 1) + map[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); };
  const chord = (root, q) => { const r = N(root); const Q = { maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], m9: [0, 3, 7, 10, 14], maj9: [0, 4, 7, 11, 14], six: [0, 4, 7, 9], dom7: [0, 4, 7, 10], m: [0, 3, 7], M: [0, 4, 7], sus: [0, 5, 7, 10] }[q]; return Q.map(i => r + i); };

  /* Each track: bpm, stepsPerBar, bars (chords), and a step(fn) that schedules notes. */
  const TRACKS = {
    theme: {
      bpm: 84, spb: 8,
      chords: [chord('F3', 'maj9'), chord('G3', 'six'), chord('E3', 'm7'), chord('A3', 'm9')],
      mel: [[69, 0, 72, 0, 67, 0, 64, 0], [62, 0, 67, 0, 69, 0, 0, 0], [67, 0, 64, 0, 62, 0, 59, 0], [60, 0, 62, 64, 0, 0, 0, 0],
        [69, 0, 72, 0, 74, 0, 72, 0], [71, 0, 67, 0, 69, 0, 0, 0], [67, 0, 64, 0, 67, 69, 67, 0], [64, 0, 0, 0, 62, 0, 60, 0]],
      step(A, bar, s, t, d) {
        const c = this.chords[bar % 4];
        if (s === 0) { A.pad(c.map(m => m), t, d * 8.2, 0.012); A.bass(c[0] - 12, t, d * 7, 0.05); }
        if (s === 4) A.bass(c[0] - 12 + (bar % 2 ? 7 : 0), t, d * 3, 0.035);
        const m = this.mel[bar % 8][s]; if (m) A.bell(m + 12, t, 0.035);
        if (s % 2 === 1) A.epiano(c[(s >> 1) % c.length] + 12, t, d * 1.5, 0.014);
        if (s === 0 || s === 4) A.kick(t, 0.05); if (s === 2 || s === 6) A.hat(t, 0.012); if (s === 4) A.snare(t, 0.018);
      }
    },
    gloom: {
      bpm: 64, spb: 8,
      chords: [chord('A2', 'm9'), chord('F2', 'maj7'), chord('D3', 'm9'), chord('E2', 'sus')],
      mel: [[76, 0, 0, 74, 0, 72, 0, 0], [72, 0, 0, 0, 69, 0, 0, 0], [74, 0, 72, 0, 69, 0, 67, 0], [64, 0, 0, 0, 0, 0, 0, 0]],
      step(A, bar, s, t, d) {
        const c = this.chords[bar % 4];
        if (s === 0) { A.pad(c, t, d * 8.5, 0.014, 600); A.bass(c[0] - 12, t, d * 8, 0.05); }
        if (s % 2 === 0) A.epiano(c[(s >> 1) % c.length] + 12, t, d * 2.5, 0.016);
        const m = this.mel[bar % 4][s]; if (m && bar % 8 >= 4) A.epiano(m, t, d * 3, 0.03);
        if (s === 6 && bar % 2) A.bell(c[2] + 24, t, 0.012);
      },
      ambience: 'rain'
    },
    deadline: {
      bpm: 112, spb: 8,
      chords: [chord('D3', 'm7'), chord('Bb2', 'maj7'), chord('F3', 'M'), chord('C3', 'six')],
      step(A, bar, s, t, d) {
        const c = this.chords[bar % 4];
        A.tick(t, s % 2 ? 0.02 : 0.03, s % 2 ? 2400 : 1800);
        if (s === 0) A.pad(c, t, d * 8, 0.01, 900);
        A.bass((s % 4 === 3 ? c[2] : c[0]) - 12, t, d * 0.8, 0.045);
        if (bar % 4 !== 3 || s < 4) A.pluck(c[[0, 1, 2, 3, 2, 1, 2, 3][s] % c.length] + 12, t, 0.022);
        if (s === 2 || s === 6) A.snare(t, 0.022); if (s === 0 || s === 4) A.kick(t, 0.05);
      }
    },
    crowd: {
      bpm: 96, spb: 6,
      chords: [chord('E3', 'm'), chord('C3', 'maj7'), chord('A2', 'm7'), chord('B2', 'dom7')],
      mel: [[71, 0, 74, 0, 76, 0], [79, 0, 76, 0, 72, 0], [72, 0, 74, 72, 69, 0], [71, 0, 0, 0, 66, 0]],
      step(A, bar, s, t, d) {
        const c = this.chords[bar % 4];
        if (s === 0) { A.bass(c[0] - 12, t, d * 2, 0.06); A.pad(c, t, d * 6, 0.008, 800); }
        if (s === 2 || s === 4) c.slice(1, 3).forEach(m => A.pluck(m + 12, t, 0.016));
        const m = this.mel[bar % 4][s]; if (m) A.bell(m + 12, t, 0.03);
      }
    },
    ocd: {
      bpm: 100, spb: 8,
      chords: [chord('A2', 'm7'), chord('A2', 'm7'), chord('G2', 'M'), chord('D3', 'M')],
      osti: [69, 72, 76, 72, 69, 72, 76, 79],
      step(A, bar, s, t, d) {
        const c = this.chords[bar % 4];
        const shift = Math.floor(bar / 4) % 3 === 2 && s === 7 ? 2 : 0;
        A.pluck(this.osti[s] + shift + (bar % 4 === 2 ? -2 : bar % 4 === 3 ? -3 : 0), t, 0.02);
        if (s === 0) { A.pad(c, t, d * 8, 0.01, 700); A.bass(c[0] - 12, t, d * 7, 0.05); }
        A.tick(t, 0.012, 3000); if (s % 4 === 0) A.kick(t, 0.04);
        if (s === 7 && bar % 2) A.bell(88, t, 0.012);
      }
    },
    boss: {
      bpm: 132, spb: 8,
      chords: [chord('C3', 'm'), chord('Ab2', 'M'), chord('Eb3', 'M'), chord('Bb2', 'M')],
      lead: [[72, 0, 75, 0, 79, 0, 77, 75], [72, 0, 0, 68, 0, 72, 75, 0], [70, 0, 74, 0, 75, 0, 79, 77], [74, 0, 0, 70, 0, 74, 77, 0]],
      step(A, bar, s, t, d) {
        const c = this.chords[bar % 4], I = A.intensity || 0;
        if (s === 0) A.pad(c, t, d * 8, 0.012, 1200);
        if (s % 2 === 0) A.kick(t, 0.07); if (s === 2 || s === 6) A.snare(t, 0.035);
        A.hat(t, s % 2 ? 0.014 : 0.008);
        A.bass((s % 4 === 3 ? c[2] : c[0]) - 12, t, d * 0.7, 0.06);
        if (I >= 1) { const m = this.lead[bar % 4][s]; if (m) A.pluck(m, t, 0.03, 2600); }
        if (I >= 2) { A.pluck(c[s % c.length] + 24, t + d / 2, 0.012, 3000); if (s % 4 === 1) A.snare(t + d / 2, 0.012); }
      }
    }
  };

  class Audio {
    constructor() { this.ctx = null; this.track = null; this.timer = null; this.charge = null; this.intensity = 0; }
    init() {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      try { this.ctx = new AC(); } catch (e) { return; }
      const c = this.ctx;
      this.master = c.createGain(); this.master.connect(c.destination);
      this.comp = c.createDynamicsCompressor(); this.comp.threshold.value = -18; this.comp.ratio.value = 3; this.comp.connect(this.master);
      this.musicG = c.createGain(); this.musicG.connect(this.comp);
      this.sfxG = c.createGain(); this.sfxG.connect(this.comp);
      this.ambG = c.createGain(); this.ambG.gain.value = 0; this.ambG.connect(this.musicG);
      // generated reverb
      this.verb = c.createConvolver(); const len = c.sampleRate * 2.4, ir = c.createBuffer(2, len, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const dd = ir.getChannelData(ch); for (let i = 0; i < len; i++) dd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
      this.verb.buffer = ir; this.verbG = c.createGain(); this.verbG.gain.value = 0.32; this.verb.connect(this.verbG); this.verbG.connect(this.comp);
      this.musicSend = c.createGain(); this.musicSend.gain.value = 0.55; this.musicG.connect(this.musicSend); this.musicSend.connect(this.verb);
      this.sfxSend = c.createGain(); this.sfxSend.gain.value = 0.18; this.sfxG.connect(this.sfxSend); this.sfxSend.connect(this.verb);
      const nl = c.sampleRate * 2; this.noiseBuf = c.createBuffer(1, nl, c.sampleRate); const nd = this.noiseBuf.getChannelData(0); for (let i = 0; i < nl; i++) nd[i] = Math.random() * 2 - 1;
      this.apply();
      if (this.pending) { const t = this.pending; this.pending = null; this.music(t); }
    }
    apply() {
      if (!this.ctx) return; const st = S.save.settings, t = this.ctx.currentTime;
      this.master.gain.setTargetAtTime(st.muted ? 0 : 1, t, 0.05);
      this.musicG.gain.setTargetAtTime(st.music * 0.75, t, 0.1);
      this.sfxG.gain.setTargetAtTime(st.sfx * 0.9, t, 0.05);
    }
    mtof(m) { return mtof(m); }
    env(g, t, a, peak, dur) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
    osc(type, f, t, dur, peak, o = {}) {
      const c = this.ctx, os = c.createOscillator(), g = c.createGain(); os.type = type; os.frequency.setValueAtTime(f, t);
      if (o.slide) os.frequency.exponentialRampToValueAtTime(Math.max(20, o.slide), t + (o.slideT || dur));
      if (o.detune) os.detune.value = o.detune;
      this.env(g, t, o.a || 0.005, peak, dur);
      let node = os; if (o.lp) { const f2 = c.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.setValueAtTime(o.lp, t); if (o.lpTo) f2.frequency.exponentialRampToValueAtTime(o.lpTo, t + dur); os.connect(f2); node = f2; }
      node.connect(g); g.connect(o.dest || this.sfxG); os.start(t); os.stop(t + dur + 0.05);
    }
    noise(t, dur, peak, o = {}) {
      const c = this.ctx, src = c.createBufferSource(); src.buffer = this.noiseBuf; src.playbackRate.value = o.rate || 1;
      const f = c.createBiquadFilter(); f.type = o.type || 'bandpass'; f.frequency.setValueAtTime(o.f || 1000, t); f.Q.value = o.q || 1; if (o.fTo) f.frequency.exponentialRampToValueAtTime(o.fTo, t + dur);
      const g = c.createGain(); this.env(g, t, o.a || 0.005, peak, dur); src.connect(f); f.connect(g); g.connect(o.dest || this.sfxG); src.start(t, Math.random()); src.stop(t + dur + 0.05);
    }
    /* instruments (music bus) */
    pad(notes, t, dur, v, lp) { notes.forEach((m, i) => { [-7, 7].forEach(dt => this.osc('sawtooth', mtof(m), t, dur, v, { a: Math.min(1.2, dur * 0.3), lp: lp || 900, detune: dt, dest: this.musicG })); }); }
    epiano(m, t, dur, v) { this.osc('sine', mtof(m), t, dur, v, { a: 0.004, dest: this.musicG }); this.osc('triangle', mtof(m) * 2, t, dur * 0.5, v * 0.25, { a: 0.003, dest: this.musicG }); }
    bell(m, t, v) { this.osc('sine', mtof(m), t, 1.6, v, { a: 0.002, dest: this.musicG }); this.osc('sine', mtof(m) * 2.76, t, 0.5, v * 0.3, { a: 0.002, dest: this.musicG }); }
    pluck(m, t, v, lp) { this.osc('triangle', mtof(m), t, 0.32, v, { a: 0.002, lp: lp || 2200, lpTo: 500, dest: this.musicG }); }
    bass(m, t, dur, v) { this.osc('triangle', mtof(m), t, dur, v, { a: 0.01, lp: 500, dest: this.musicG }); }
    kick(t, v) { this.osc('sine', 120, t, 0.28, v * 1.6, { slide: 42, slideT: 0.12, dest: this.musicG }); }
    snare(t, v) { this.noise(t, 0.16, v * 1.4, { f: 1800, q: 0.7, dest: this.musicG }); this.osc('triangle', 190, t, 0.08, v, { dest: this.musicG }); }
    hat(t, v) { this.noise(t, 0.04, v * 1.3, { type: 'highpass', f: 7000, dest: this.musicG }); }
    tick(t, v, f) { this.osc('square', f || 1800, t, 0.025, v, { lp: 4000, dest: this.musicG }); }
    ambience(kind) {
      if (!this.ctx) return; const c = this.ctx, t = c.currentTime;
      if (this.ambSrc) { try { this.ambSrc.stop(t + 0.6); } catch (e) { } this.ambSrc = null; }
      this.ambG.gain.setTargetAtTime(0, t, 0.2);
      if (!kind) return;
      const src = c.createBufferSource(); src.buffer = this.noiseBuf; src.loop = true;
      const f = c.createBiquadFilter(); f.type = kind === 'rain' ? 'bandpass' : 'lowpass'; f.frequency.value = kind === 'rain' ? 2600 : 500; f.Q.value = 0.4;
      src.connect(f); f.connect(this.ambG); src.start(); this.ambSrc = src;
      this.ambG.gain.setTargetAtTime(kind === 'rain' ? 0.05 : 0.03, t, 0.8);
    }
    music(track) {
      if (track === 'hub' || track === 'title') track = 'theme';
      if (!this.ctx) { this.pending = track; return; }
      if (this.track === track) return;
      this.track = track; clearInterval(this.timer); this.timer = null;
      const def = TRACKS[track]; this.ambience(def && def.ambience);
      if (!def) return;
      const c = this.ctx; let step = 0; let next = c.currentTime + 0.12; const d = 60 / def.bpm / (def.spb === 6 ? 2 : 2);
      const sched = () => {
        if (this.track !== track) return;
        while (next < c.currentTime + 0.35) {
          const bar = Math.floor(step / def.spb), s = step % def.spb;
          try { def.step(this, bar, s, next, d); } catch (e) { }
          step++; next += d;
        }
      };
      sched(); this.timer = setInterval(sched, 80);
    }
    /* sound effects */
    sfx(name, arg) {
      if (!this.ctx) return; const t = this.ctx.currentTime, O = (ty, f, dur, v, o) => this.osc(ty, f, t + ((o && o.delay) || 0), dur, v, o), Nz = (dur, v, o) => this.noise(t + ((o && o.delay) || 0), dur, v, o);
      switch (name) {
        case 'orb': { const b = 84 + [0, 2, 4, 7, 9][Math.floor(Math.random() * 5)]; O('sine', mtof(b), 0.25, 0.05, { a: 0.002 }); O('sine', mtof(b + 12), 0.18, 0.025, { a: 0.002, delay: 0.04 }); break; }
        case 'pop': Nz(0.07, 0.06, { f: 2200, q: 2 }); O('triangle', 700, 0.1, 0.06, { slide: 300 }); break;
        case 'dispel': O('triangle', 520, 0.2, 0.04, { slide: 1000 }); break;
        case 'hit': Nz(0.18, 0.11, { type: 'lowpass', f: 600, fTo: 150 }); O('sine', 200, 0.22, 0.1, { slide: 70 }); break;
        case 'shield': O('triangle', 660, 0.25, 0.05); O('sine', 990, 0.3, 0.04, { delay: 0.06 }); break;
        case 'chargeStart': this.chargeStart(arg || 1.2); break;
        case 'chargeStop': this.chargeStop(); break;
        case 'breathe': this.chargeStop(); Nz(1.0, 0.08, { type: 'lowpass', f: 2600, fTo: 160, a: 0.06 }); [57, 64, 69, 76].forEach((m, i) => O('sine', mtof(m), 1.4, 0.035, { a: 0.08, delay: i * 0.05 })); break;
        case 'pulse': O('sine', 330, 0.25, 0.025, { slide: 440 }); break;
        case 'upgrade': [72, 76, 79, 84, 88].forEach((m, i) => O('triangle', mtof(m), 0.35, 0.045, { delay: i * 0.06 })); break;
        case 'click': O('triangle', 1400, 0.05, 0.035, { slide: 900 }); Nz(0.02, 0.02, { f: 4000 }); break;
        case 'hover': O('sine', 1800, 0.04, 0.012); break;
        case 'blip': O('square', arg || 600, 0.035, 0.016, { lp: 1800 }); break;
        case 'bossIntro': [36, 43, 48].forEach((m, i) => O('sawtooth', mtof(m), 2.2, 0.04, { a: 0.4, delay: i * 0.12, lp: 600 })); Nz(2, 0.05, { type: 'lowpass', f: 300, a: 0.5 }); break;
        case 'bossClear': [72, 76, 79, 84, 88, 91].forEach((m, i) => O('sine', mtof(m), 0.9, 0.045, { delay: i * 0.09 })); Nz(1.2, 0.04, { type: 'highpass', f: 5000, fTo: 9000, a: 0.3 }); break;
        case 'unlock': O('sine', mtof(79), 0.5, 0.05); O('sine', mtof(86), 0.8, 0.05, { delay: 0.12 }); O('sine', mtof(91), 0.9, 0.03, { delay: 0.24 }); break;
        case 'letter': Nz(0.3, 0.03, { f: 3000, q: 0.6 }); O('sine', mtof(84), 0.6, 0.04, { delay: 0.1 }); break;
        case 'bloom': [65, 69, 72, 76, 79, 84].forEach((m, i) => { O('sine', mtof(m), 0.9, 0.04, { delay: i * 0.06 }); O('triangle', mtof(m + 12), 0.4, 0.012, { delay: i * 0.06 + 0.02 }); }); Nz(0.5, 0.02, { f: 6000, q: 0.5 }); break;
        case 'chime': [79, 76, 72, 67].forEach((m, i) => O('sine', mtof(m), 1.1, 0.04, { delay: i * 0.18 })); break;
        case 'miss': O('triangle', 300, 0.22, 0.04, { slide: 200 }); break;
        case 'buy': [76, 83, 88].forEach((m, i) => O('square', mtof(m), 0.18, 0.03, { lp: 3500, delay: i * 0.07 })); Nz(0.5, 0.03, { type: 'highpass', f: 6000, delay: 0.1 }); break;
        case 'place': O('sine', 140, 0.2, 0.09, { slide: 70 }); Nz(0.08, 0.05, { type: 'lowpass', f: 800 }); [84, 88, 91].forEach((m, i) => O('sine', mtof(m), 0.6, 0.03, { delay: 0.12 + i * 0.07 })); break;
        case 'shootPulse': O('square', 900 + Math.random() * 200, 0.08, 0.025, { slide: 380, lp: 3000 }); O('sine', 1800, 0.04, 0.015, { slide: 900 }); break;
        case 'shootInk': Nz(0.16, 0.09, { type: 'lowpass', f: 1100, fTo: 200 }); O('sine', 150, 0.14, 0.08, { slide: 60 }); break;
        case 'shootNote': [76, 79, 83].forEach((m, i) => O('triangle', mtof(m), 0.22, 0.03, { delay: i * 0.02 })); break;
        case 'shootNet': Nz(0.2, 0.04, { f: 1200, fTo: 3000, q: 0.6 }); O('sine', 600, 0.2, 0.03, { slide: 900 }); break;
        case 'netBurst': [72, 79, 84].forEach((m, i) => O('sine', mtof(m), 0.5, 0.03, { delay: i * 0.03 })); Nz(0.25, 0.04, { type: 'highpass', f: 3000 }); break;
        case 'hitE': Nz(0.05, 0.05, { f: 1800, q: 1.5 }); O('square', 320, 0.05, 0.035, { slide: 170, lp: 1500 }); break;
        case 'kill': Nz(0.2, 0.08, { type: 'lowpass', f: 1400, fTo: 160 }); O('triangle', 520, 0.16, 0.04, { slide: 1100 }); O('sine', mtof(96), 0.3, 0.015, { delay: 0.05 }); break;
        case 'staff': Nz(0.18, 0.07, { f: 600, fTo: 2600, q: 0.7 }); break;
        case 'parry': O('triangle', 1568, 0.3, 0.06); O('sine', 2093, 0.4, 0.04, { delay: 0.05 }); O('sine', 3136, 0.4, 0.02, { delay: 0.1 }); break;
        case 'dash': Nz(0.15, 0.05, { f: 1600, fTo: 400, q: 0.7 }); break;
        case 'bossHit': Nz(0.07, 0.06, { type: 'lowpass', f: 800 }); O('sine', 110, 0.08, 0.04); break;
        case 'phase': [36, 43, 48, 52].forEach((m, i) => O('sawtooth', mtof(m), 1.4, 0.035, { delay: i * 0.05, lp: 1400, lpTo: 300 })); Nz(0.9, 0.09, { type: 'lowpass', f: 900, fTo: 80 }); break;
        case 'warn': O('square', 880, 0.12, 0.028, { lp: 2000 }); O('square', 880, 0.12, 0.028, { lp: 2000, delay: 0.18 }); break;
        case 'boom': Nz(0.5, 0.11, { type: 'lowpass', f: 600, fTo: 60 }); O('sine', 90, 0.4, 0.09, { slide: 35 }); break;
        case 'heal': [72, 79, 84].forEach((m, i) => O('sine', mtof(m), 0.4, 0.04, { delay: i * 0.07 })); break;
        case 'correct': [72, 76, 79, 84].forEach((m, i) => O('triangle', mtof(m), 0.3, 0.05, { delay: i * 0.06 })); break;
        case 'tempt': O('sine', mtof(88), 0.2, 0.04); O('sine', mtof(76), 0.6, 0.03, { delay: 0.25, slide: mtof(70) }); break;
        case 'resist': [79, 83, 86].forEach((m, i) => O('sine', mtof(m), 0.4, 0.03, { delay: i * 0.05 })); break;
        case 'whoosh': Nz(0.9, 0.06, { f: 400, fTo: 3000, q: 0.5, a: 0.3 }); break;
        case 'beamOn': this.beamStart(); break;
        case 'beamOff': this.beamStop(); break;
      }
    }
    beamStart() {
      const c = this.ctx; if (!c || this.beam) return;
      const o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.value = 110; o2.type = 'sine'; o2.frequency.value = 220; f.type = 'lowpass'; f.frequency.value = 900;
      g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(0.022, c.currentTime + 0.05);
      o.connect(f); o2.connect(f); f.connect(g); g.connect(this.sfxG); o.start(); o2.start(); this.beam = { o, o2, g };
    }
    beamStop() { if (!this.beam || !this.ctx) return; const { o, o2, g } = this.beam, t = this.ctx.currentTime; g.gain.setTargetAtTime(0.0001, t, 0.03); o.stop(t + 0.2); o2.stop(t + 0.2); this.beam = null; }
    chargeStart(dur) {
      const c = this.ctx; if (!c) return; this.chargeStop();
      const t = c.currentTime, osc = c.createOscillator(), g = c.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(220, t); osc.frequency.linearRampToValueAtTime(440, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.03, t + dur);
      osc.connect(g); g.connect(this.sfxG); osc.start(t); this.charge = { osc, g };
    }
    chargeStop() { if (!this.charge || !this.ctx) return; const { osc, g } = this.charge; const t = this.ctx.currentTime; g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(0.0001, t, 0.03); osc.stop(t + 0.2); this.charge = null; }
  }
  S.audio = new Audio();
})();
