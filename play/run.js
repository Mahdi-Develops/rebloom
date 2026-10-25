/* ReBloom, Run scene v3: tile rooms with ambience, aimed weapons incl. Dream Net, staff, dash,
   Health + Stress, animated enemies, four multi-phase bosses (incl. OCD urge tiles), Myth/Fact quiz, journey travel. */
(function () {
  const S = window.SANC, CONTENT = window.SANCTUARY_CONTENT, COL = S.COL, DLG = CONTENT.DIALOGUE, RD = window.SANCTUARY_ROOMS;
  const TILE = 16, HUDX = 320, HUDY = 180;
  const ROOMS = {
    gloom: { name: 'The Rainy Room', bg: 'room2_gloom', thumb: 'thumb_gloom', pool: ['en_drifter', 'en_weight', 'en_whisper'], hazard: 'puddle' },
    deadline: { name: 'The Overflowing Desk', bg: 'room2_deadline', thumb: 'thumb_deadline', pool: ['en_sticky_note', 'en_alarm_clock', 'en_mail_stack'], hazard: 'coffee_spill' },
    crowd: { name: 'The Empty Theatre', bg: 'room2_crowd', thumb: 'thumb_crowd', pool: ['en_whisper', 'en_watcher_eye', 'en_sticky_note'], hazard: 'spotlight' },
    ocd: { name: 'The Perfect Room', bg: 'room2_ocd', thumb: 'thumb_ocd', pool: ['en_tally', 'en_padlock', 'en_switch'], hazard: 'urge' }
  };
  const ALL_ROOMS = ['gloom', 'deadline', 'crowd', 'ocd'];
  const ENEMY = {
    en_drifter: { hp: 3, speed: 24, cost: 1, dmg: 12, r: 6 },
    en_weight: { hp: 5, speed: 16, cost: 2, dmg: 14, r: 7, slows: true },
    en_sticky_note: { hp: 2, speed: 40, cost: 1, dmg: 8, r: 4 },
    en_alarm_clock: { hp: 3, speed: 30, cost: 2, dmg: 12, r: 6, ring: true },
    en_mail_stack: { hp: 7, speed: 14, cost: 3, dmg: 16, r: 7 },
    en_watcher_eye: { hp: 4, speed: 22, cost: 2, dmg: 10, r: 6, shooter: true },
    en_whisper: { hp: 2, speed: 36, cost: 1, dmg: 8, r: 4, zig: true },
    en_padlock: { hp: 6, speed: 15, cost: 2, dmg: 12, r: 6 },
    en_switch: { hp: 3, speed: 18, cost: 2, dmg: 10, r: 5, ring: true, ringKey: 'b_check', ringOff: 0 },
    en_tally: { hp: 2, speed: 38, cost: 1, dmg: 8, r: 4 }
  };
  const MODS = [
    { name: 'Deadline Rush', note: 'Everything moves faster. Orbs are worth double gold.', speed: 1.25, interval: 1, budget: 1, gold: 2 },
    { name: 'Notification Storm', note: 'Lots of small pings.', speed: 1.05, interval: 0.6, budget: 1.2, gold: 1, cheap: true },
    { name: 'Slow Monday', note: 'Fewer, heavier stressors.', speed: 0.8, interval: 1.4, budget: 1, gold: 1, heavy: true, hp: 1.5 },
    { name: 'Quiet Day', note: 'A calmer wave. Stress eases faster.', speed: 0.9, interval: 1.3, budget: 0.6, gold: 1, quiet: true }
  ];
  const NO_MOD = { name: 'A regular day', note: 'Aim and fire. Breathe when it gets loud.', speed: 1, interval: 1, budget: 1, gold: 1 };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const d2 = (a, b) => { const x = a.x - b.x, y = a.y - b.y; return x * x + y * y; };
  const angDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

  class Run extends Phaser.Scene {
    constructor() { super('Run'); }
    init(d) { this.challenge = d && d.challenge || null; }

    /* ====================================================== setup */
    create() {
      S.cam(this); S.audio.intensity = 0; this.anims.resumeAll(); this.tweens.resumeAll();
      this.events.once('shutdown', () => { this.anims.resumeAll(); S.audio.sfx('beamOff'); S.audio.sfx('chargeStop'); });
      const cam = this.cameras.main;
      this.rng = new S.RNG(Date.now() ^ Math.floor(Math.random() * 1e9));
      const firstEver = S.save.runs === 0;
      this.order = this.challenge ? [this.challenge] : (firstEver ? ALL_ROOMS.slice() : this.rng.shuffle(ALL_ROOMS.slice()));
      S.save.runs++; S.persist();
      this.startBest = { room: S.save.bestRoom, wave: S.save.bestWave };
      Object.assign(this, { roomIdx: 0, roomsReached: 1, waveInRoom: 0, globalWave: 0, bossCount: 0, goldEarned: 0, state: 'idle', paused: false, t: 0, hitstop: 0, boss: null, mastery: false, modal: null, masks: null, rings: [], warnings: [], beamOn: false, charging: false, kickT: 0 });
      this.lv = {}; this.toolLv = 0; this.tool = S.save.equippedTool;
      this.enemies = []; this.urges = []; this.webs = []; this.amb = []; this.ambObjs = []; this.introSeen = {}; this.orbs = []; this.teas = []; this.shots = []; this.eb = []; this.hazards = []; this.props = []; this.pending = []; this.fxList = [];
      this.timers = { fire: 0, staff: 0, dash: 0, breatheCd: 0, inv: 0, pause: 0, boundary: 0, friend: 0, noHit: 0, stressToast: 0, overToast: 0, orbStreakT: 0, beamTick: 0, urge: 0, temptToast: 0, resistToast: 0 };
      this.maxHp = 100; this.hp = 100; this.stress = 0; this.friendReady = false; this.orbStreak = 0;
      this.mod = NO_MOD;

      this.bg = this.add.image(0, 0, 'room2_gloom').setOrigin(0, 0).setDepth(-1000);
      this.worldG = this.add.graphics().setDepth(-400);
      this.fxG = this.add.graphics().setDepth(8000);
      this.player = { x: 240, y: 220, face: 0, moving: false, slowT: 0, dashT: 0, dvx: 0, dvy: 0, anim: 0 };
      this.pShadow = this.add.image(0, 0, 'shadow');
      this.pc = S.buildPlayer2(this, 240, 220, S.save.player || S.defaultLook(), 1);
      this.weapon = this.add.image(0, 0, 'wpn_' + this.tool).setOrigin(0.2, 0.5);
      this.lumi = this.add.image(240, 190, 'companion_orb').setTint(S.lumiTint());
      this.camTarget = this.add.zone(240, 210, 1, 1);
      try { if (this.renderer.type === Phaser.WEBGL) this.colorFx = cam.postFX.addColorMatrix(); } catch (e) { this.colorFx = null; }

      this.hud = this.add.container(HUDX, HUDY).setDepth(10000);
      this.dialogue = new S.Dialogue(this, this.hud);
      this.buildRoom(this.order[0]);
      cam.setBounds(0, 0, RD.gloom.w, RD.gloom.h); cam.startFollow(this.camTarget, true, 0.12, 0.12);
      this.setupInput(); this.buildHud();
      S.fadeIn(this);
      this.dialogue.toast([S.rng.pickNoRepeat(DLG.runStart, 'runStart')]);
      if (this.challenge) this.time.delayedCall(350, () => this.startBoss()); else this.time.delayedCall(300, () => this.startWave());
      S.debugRun = this;
    }
    H(obj) { S.fixSF(obj); this.hud.add(obj); return obj; }
    playerScreenY() { return this.player.y - 12 - this.cameras.main.worldView.y; }

    buildRoom(id) {
      const data = RD[id]; this.grid = data.grid; this.roomW = data.w; this.roomH = data.h;
      this.bg.setTexture(ROOMS[id].bg);
      this.props.forEach(p => p.destroy()); this.props = [];
      data.props.forEach(p => { this.props.push(this.add.image(p.x, p.y, p.key).setOrigin(0.5, 1).setDepth(p.y)); });
      this.clearHazards(); this.clearUrges();
      this.player.x = 240; this.player.y = 220; this.camTarget.setPosition(240, 200);
      this.buildAmbience(id, data);
      S.audio.intensity = 0; S.audio.music(id);
    }
    buildAmbience(id, data) {
      this.ambObjs.forEach(o => o.destroy()); this.ambObjs = []; this.amb = [];
      const rm = S.save.settings.reduceMotion;
      (data.glows || []).forEach(([x, y, key], i) => {
        const g = this.add.image(x, y, key).setBlendMode(Phaser.BlendModes.ADD).setDepth(-900).setAlpha(0.55);
        if (!rm) this.tweens.add({ targets: g, alpha: 0.85, scale: 1.08, duration: 1500 + i * 230, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.ambObjs.push(g);
      });
      const kind = data.ambient, W = data.w, Hh = data.h;
      if (kind === 'rain') (data.windows || []).forEach(([wx, wy, ww, wh]) => { for (let k = 0; k < 7; k++) { const sp = this.add.image(wx + Math.random() * ww, wy + Math.random() * wh, 'p_rain').setDepth(-950).setAlpha(0.7); this.ambObjs.push(sp); this.amb.push({ sp, kind, x0: wx, y0: wy, w: ww, h: wh, vy: 90 + Math.random() * 40, vx: -12 }); } });
      const spec = { paper: ['p_paper', 14, 0x000000], confetti: ['p_confetti', 26], mote: ['p_mote', 22], rain: ['p_mote', 10] }[kind];
      if (spec) for (let k = 0; k < spec[1]; k++) {
        const sp = this.add.sprite(Math.random() * W, Math.random() * Hh, spec[0], spec[0] === 'p_confetti' ? k % 4 : 0).setDepth(9050);
        if (spec[0] === 'p_mote') sp.setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.5).setTint(kind === 'rain' ? 0x8fc1e3 : 0xfff1c8);
        this.ambObjs.push(sp);
        this.amb.push({ sp, kind: kind === 'rain' ? 'mote' : kind, W, H: Hh, vx: (Math.random() - 0.5) * 8, vy: kind === 'mote' || kind === 'rain' ? -4 - Math.random() * 6 : 10 + Math.random() * 12, ph: Math.random() * 6 });
      }
    }
    updateAmbience(dt) {
      if (S.save.settings.reduceMotion) return;
      for (const a of this.amb) {
        const sp = a.sp;
        if (a.kind === 'rain' && a.x0 !== undefined) { sp.y += a.vy * dt; sp.x += a.vx * dt; if (sp.y > a.y0 + a.h || sp.x < a.x0) { sp.y = a.y0; sp.x = a.x0 + Math.random() * a.w; } continue; }
        a.ph += dt * 2; sp.x += (a.vx + Math.sin(a.ph) * 6) * dt; sp.y += a.vy * dt;
        if (a.kind === 'mote') sp.alpha = 0.25 + 0.45 * Math.abs(Math.sin(a.ph * 0.6));
        else sp.rotation += dt * (a.kind === 'paper' ? 1.2 : 4);
        if (sp.y > a.H + 4) { sp.y = -4; sp.x = Math.random() * a.W; } if (sp.y < -4) { sp.y = a.H + 4; sp.x = Math.random() * a.W; }
        if (sp.x < -4) sp.x = a.W + 4; if (sp.x > a.W + 4) sp.x = -4;
      }
    }
    solidAt(x, y) {
      const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
      if (ty < 0 || ty >= this.grid.length || tx < 0 || tx >= this.grid[0].length) return true;
      return this.grid[ty][tx] === '#';
    }
    boxFree(x, y, hw, hh) { return !(this.solidAt(x - hw, y - hh) || this.solidAt(x + hw, y - hh) || this.solidAt(x - hw, y) || this.solidAt(x + hw, y)); }
    moveBody(o, dx, dy, hw, hh) {
      if (dx) { if (this.boxFree(o.x + dx, o.y, hw, hh)) o.x += dx; else { const s = Math.sign(dx); for (let i = 0; i < Math.ceil(Math.abs(dx)) && this.boxFree(o.x + s * 0.5, o.y, hw, hh); i++) o.x += s * 0.5; } }
      if (dy) { if (this.boxFree(o.x, o.y + dy, hw, hh)) o.y += dy; else { const s = Math.sign(dy); for (let i = 0; i < Math.ceil(Math.abs(dy)) && this.boxFree(o.x, o.y + s * 0.5, hw, hh); i++) o.y += s * 0.5; } }
    }
    randomFloor(minDist, maxDist) {
      for (let k = 0; k < 80; k++) {
        const tx = this.rng.int(1, this.grid[0].length - 2), ty = this.rng.int(4, this.grid.length - 2);
        if (this.grid[ty][tx] === '#') continue;
        const p = { x: tx * TILE + 8, y: ty * TILE + 12 }; const dd = Math.sqrt(d2(p, this.player));
        if (dd >= minDist && dd <= maxDist) return p;
      }
      return { x: 240, y: 140 };
    }

    /* ====================================================== HUD */
    buildHud() {
      const H = (o) => this.H(o);
      H(this.add.nineslice(-4, -6, 'ui2_panel_dark', null, 328, 32, 8, 8, 8, 8).setOrigin(0).setAlpha(0.9));
      this.hudG = H(this.add.graphics());
      H(this.add.image(8, 7, 'ui2_heart')); H(this.add.image(8, 18, 'ui2_stress'));
      this.hpTxt = H(S.txt(this, 88, 2, '', { size: 6, color: '#ffb3c6' }));
      this.stTxt = H(S.txt(this, 88, 13, '', { size: 6, color: COL.sky }));
      this.roomTxt = H(S.txt(this, 172, 2, '', { size: 7, ox: 0.5, color: '#fff6d8' }));
      this.waveTxt = H(S.txt(this, 172, 13, '', { size: 6, ox: 0.5, color: '#bfe3ff' }));
      this.bossPort = H(this.add.image(126, 18, 'boss_gloom_card').setScale(0.19).setVisible(false));
      this.bossGems = [0, 1, 2].map(k => H(this.add.image(226 + k * 9, 18, 'ui2_bossgem').setScale(0.6).setVisible(false)));
      H(this.add.image(268, 9, 'ui_coin'));
      this.goldTxt = H(S.txt(this, 275, 4, '', { size: 7, color: COL.gold }));
      this.pauseBtn = H(this.add.image(310, 10, 'ui_pause').setInteractive({ useHandCursor: true }));
      this.pauseBtn.on('pointerup', (p, x, y, ev) => { ev && ev.stopPropagation(); this.togglePause(); });
      this.vignette = H(this.add.rectangle(160, 90, 320, 180, 0x8a1030, 0));
      this.hintTxt = H(S.txt(this, 160, 150, '', { size: 6, ox: 0.5, oy: 1, color: COL.cream, bg: '#14102acc' }));
      this.buildAbilityBar();
      this.updateHud();
    }
    buildAbilityBar() {
      if (this.abBar) this.abBar.destroy();
      const U = CONTENT.UPGRADES, t = this.touch;
      const slots = [
        { id: 'tool', icon: CONTENT.TOOLS[this.tool].icon, lv: this.toolLv, key: t ? 'Auto' : 'Click' },
        { id: 'staff', icon: 'wpn_staff', key: t ? 'Staff' : 'RMB/K', scale: 0.7 },
        { id: 'dash', icon: 'up_walk', key: 'Shift' },
        { id: 'breathe', icon: 'touch_breathe', scale: 0.5, key: t ? 'Btn' : 'Space' }
      ];
      if (t) slots[2].key = 'Dash';
      ['pause', 'boundary', 'friend', 'breath', 'rest', 'sleep', 'walk', 'clear'].forEach(id => { if (this.lv[id]) slots.push({ id, icon: U[id].icon, lv: this.lv[id] }); });
      const w = 23, n = slots.length, x0 = t ? 6 : 160 - (n * w - 1) / 2;
      const c = this.abBar = this.add.container(0, 0);
      slots.forEach((s, i) => {
        const x = x0 + i * w + 11, y = 167;
        c.add(this.add.image(x, y, 'ui2_slot'));
        s.img = this.add.image(x, y, s.icon).setScale(s.scale || 1);
        s.cover = this.add.rectangle(x - 8, y + 8, 16, 16, 0x0f0e1c, 0.72).setOrigin(0, 1).setScale(1, 0);
        c.add([s.img, s.cover]);
        for (let k = 0; k < (s.lv || 0); k++) c.add(this.add.rectangle(x - 4 + k * 4, y + 9, 3, 2, 0xf2c14e));
        if (s.key) c.add(S.txt(this, x, y - 11, s.key, { size: 5, ox: 0.5, oy: 1, color: '#c9bfe8' }));
      });
      this.abSlots = slots; this.H(c);
    }
    abilityFrac(id) {
      const t = this.timers, L = this.lv[id] || 0;
      switch (id) {
        case 'breathe': return this.charging ? 1 - this.chargeT / this.chargeDur : t.breatheCd / 6;
        case 'tool': return this.tool === 'lantern' ? 0 : t.fire / Math.max(0.01, this.fireRate());
        case 'staff': return t.staff / 0.45;
        case 'dash': return t.dash / this.dashCd();
        case 'pause': return t.pause / (11 - L);
        case 'boundary': return t.boundary / (4 - 0.5 * (L - 1));
        case 'friend': return this.friendReady ? 0 : t.friend / [15, 12, 9][L - 1];
        default: return 0;
      }
    }
    updateHud() {
      const g = this.hudG; g.clear();
      const hf = clamp(this.hp / this.maxHp, 0, 1), sf = this.stress / 100;
      this.hpShow = this.hpShow === undefined ? hf : this.hpShow + (hf - this.hpShow) * 0.08; if (this.hpShow < hf) this.hpShow = hf;
      const bar = (x, y, w, h, f, ghost, c1, c2, bgc) => {
        g.fillStyle(0x0b0818, 1).fillRect(x - 1, y - 1, w + 2, h + 2); g.fillStyle(bgc, 1).fillRect(x, y, w, h);
        if (ghost > f) g.fillStyle(0xfff1c8, 0.8).fillRect(x, y, Math.round(w * ghost), h);
        g.fillStyle(c1, 1).fillRect(x, y, Math.round(w * f), h); g.fillStyle(c2, 1).fillRect(x, y, Math.round(w * f), 1);
        for (let k = 1; k < 10; k++) g.fillStyle(0x0b0818, 0.35).fillRect(x + Math.round(w * k / 10), y + h - 1, 1, 1);
      };
      bar(15, 4, 70, 6, hf, this.hpShow, hf > 0.35 ? 0xe85a7a : 0xff3355, 0xffb3c6, 0x4a1630);
      bar(15, 16, 70, 4, sf, 0, sf < 0.5 ? 0x8fc1e3 : sf < 0.75 ? 0xf2c14e : 0xe8833a, 0xffffff, 0x22284a);
      this.hpTxt.setText(`${Math.ceil(this.hp)}`);
      this.stTxt.setText(this.stress >= 100 ? '100%!' : `${Math.round(this.stress)}%`).setColor(this.stress >= 75 ? COL.orange : COL.sky);
      this.goldTxt.setText(String(S.save.gold));
      if (this.boss && (this.state === 'boss' || this.state === 'bossTalk')) {
        const b = this.boss, f = clamp(b.hp / b.hpMax, 0, 1);
        b.show = b.show === undefined ? f : Math.max(f, b.show + (f - b.show) * 0.06);
        bar(136, 15, 84, 6, f, b.show, b.inv ? 0xffffff : [0xe89bb0, 0xe8833a, 0xc8553d][b.phase], 0xffe0ea, 0x3a2040);
        if (this.bossPort.texture.key !== S.BOSS_INFO[b.id].card) this.bossPort.setTexture(S.BOSS_INFO[b.id].card);
        this.bossPort.setVisible(true); this.bossGems.forEach((gm, k) => gm.setVisible(true).setAlpha(k >= b.phase ? 1 : 0.25));
        this.waveTxt.setVisible(false);
      } else { this.waveTxt.setVisible(true); this.bossPort.setVisible(false); this.bossGems.forEach(gm => gm.setVisible(false)); }
      const pulse = this.stress >= 85 ? (0.06 + 0.05 * Math.sin(this.t * 6)) * (this.stress >= 100 ? 2 : 1) : 0;
      this.vignette.fillAlpha = S.save.settings.reduceMotion ? Math.min(pulse, 0.08) : pulse;
      if (this.abSlots) this.abSlots.forEach(s => { const f = clamp(this.abilityFrac(s.id) || 0, 0, 1); s.cover.setScale(1, f); s.img.setAlpha(f > 0.01 ? 0.65 : 1); if (s.id === 'breathe') s.cover.fillColor = this.charging ? 0x4f7cac : 0x0f0e1c; });
      const hint = this.charging ? 'Breathing... stay still' : (this.globalWave <= 1 && this.state === 'wave' && this.t < 14 ? (this.touch ? 'Drag on the left to move. Fire is automatic.' : 'WASD move · aim with mouse · hold click to fire · RMB staff · Shift dash · Space breathe') : '');
      this.hintTxt.setText(hint).setVisible(!!hint && !this.dialogue.active);
      if (this.abBar) this.abBar.setVisible(!this.dialogue.active);
      if (this.touchBtns) this.touchBtns.forEach(b => b.setVisible(!this.dialogue.active));
    }

    /* ====================================================== input */
    setupInput() {
      this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,SHIFT,J,K,P,ESC');
      if (this.input.mouse) this.input.mouse.disableContextMenu();
      this.input.addPointer(3);
      this.touch = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
      this.lastMouseMove = -9999;
      this.input.keyboard.on('keydown', (e) => {
        if (S.overlayOpen) return;
        if (e.key === 'F2') { e.preventDefault && e.preventDefault(); this.debugSkip(); }
        if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && !this.dialogue.active && !this.modal) this.togglePause();
        if (e.key === ' ' && this.canAct()) this.startBreathe();
        if (e.key === 'Shift' && this.canAct()) this.dash();
        if ((e.key === 'k' || e.key === 'K') && this.canAct()) this.swingStaff();
        if (this.modal && this.modal.keys && this.modal.keys[e.key]) this.modal.keys[e.key]();
      });
      this.stick = { active: false, id: -1, ox: 0, oy: 0, dx: 0, dy: 0 };
      this.stickBase = this.H(this.add.image(0, 0, 'touch_stick_base').setVisible(false));
      this.stickKnob = this.H(this.add.image(0, 0, 'touch_stick_knob').setVisible(false));
      this.input.on('pointermove', (p) => {
        if (p.pointerType === 'mouse') this.lastMouseMove = this.time.now;
        if (!this.stick.active || p.id !== this.stick.id) return;
        let dx = p.x / S.ZOOM - this.stick.ox, dy = p.y / S.ZOOM - this.stick.oy; const m = Math.hypot(dx, dy);
        if (m > 14) { dx *= 14 / m; dy *= 14 / m; }
        this.stick.dx = dx / 14; this.stick.dy = dy / 14; this.stickKnob.setPosition(this.stick.ox + dx, this.stick.oy + dy);
      });
      this.input.on('pointerdown', (p) => {
        if (p.pointerType === 'touch' && !this.touch) { this.touch = true; this.buildTouchButtons(); this.buildAbilityBar(); }
        if (p.pointerType === 'mouse') { this.lastMouseMove = this.time.now; if (p.rightButtonDown() && this.canAct()) this.swingStaff(); }
        if (!this.touch || !this.canAct() || this.stick.active) return;
        const hx = p.x / S.ZOOM, hy = p.y / S.ZOOM;
        if (hx > 200 || hy < 28) return;
        Object.assign(this.stick, { active: true, id: p.id, ox: hx, oy: hy, dx: 0, dy: 0 });
        this.stickBase.setPosition(hx, hy).setVisible(true); this.stickKnob.setPosition(hx, hy).setVisible(true);
      });
      const end = (p) => { if (p.id !== this.stick.id) return; this.stick.active = false; this.stick.dx = this.stick.dy = 0; this.stickBase.setVisible(false); this.stickKnob.setVisible(false); };
      this.input.on('pointerup', end); this.input.on('pointerupoutside', end);
      if (this.touch) this.buildTouchButtons();
    }
    buildTouchButtons() {
      if (this.touchBtns) return;
      const mk = (x, y, key, scale, fn) => { const b = this.H(this.add.image(x, y, key).setScale(scale).setInteractive()); b.on('pointerdown', (p, lx, ly, ev) => { ev && ev.stopPropagation(); if (this.canAct()) fn(); }); return b; };
      this.touchBtns = [
        mk(290, 146, 'touch_breathe', 1, () => this.startBreathe()),
        mk(256, 160, 'touch_stick_base', 0.7, () => this.swingStaff()),
        mk(298, 112, 'touch_stick_base', 0.6, () => this.dash())
      ];
      this.H(this.add.image(256, 160, 'wpn_staff').setAngle(-45)); this.H(this.add.image(298, 112, 'up_walk').setScale(0.7));
    }
    canAct() { return !this.paused && !this.dialogue.active && !this.modal && !S.overlayOpen && (this.state === 'wave' || this.state === 'boss'); }

    togglePause() {
      if (this.state === 'ended' || this.state === 'travel') return;
      this.paused = !this.paused;
      if (this.paused) {
        this.tweens.pauseAll(); this.anims.pauseAll(); S.audio.sfx('chargeStop'); if (this.beamOn) { this.beamOn = false; S.audio.sfx('beamOff'); }
        const c = this.pauseUI = this.add.container(0, 0);
        c.add(this.add.rectangle(160, 90, 320, 180, 0x0f0e1c, 0.72)); c.add(S.panel(this, 100, 40, 120, 100));
        c.add(S.txt(this, 160, 48, 'Paused', { size: 8, title: true, ox: 0.5, color: COL.blue, shadow: false }));
        this.nav = new S.Nav(this); this.nav.ring.setScrollFactor(0);
        const b1 = S.button(this, 112, 64, 96, 18, 'Resume', () => this.togglePause(), { size: 8 });
        const b2 = S.button(this, 112, 86, 96, 18, 'Settings', () => S.openSettings(() => { }, { hideEdit: true }), { size: 8 });
        const b3 = S.button(this, 112, 108, 96, 18, 'Back to my room', () => this.quitToHub(), { size: 7 });
        c.add([b1, b2, b3]); this.H(c); this.nav.focus(b1);
      } else {
        this.tweens.resumeAll(); this.anims.resumeAll();
        if (this.pauseUI) { this.pauseUI.destroy(); this.pauseUI = null; }
        this.killNav();
      }
    }
    killNav() { if (this.nav) { this.nav.enabled = false; this.nav.ring.destroy(); this.nav = null; } }
    quitToHub() { this.state = 'ended'; this.recordBest(); S.persist(); S.audio.sfx('chargeStop'); S.audio.sfx('beamOff'); this.tweens.resumeAll(); S.fadeTo(this, 'Hub'); }

    /* ====================================================== waves */
    get roomId() { return this.order[this.roomIdx]; }
    get room() { return ROOMS[this.roomId]; }
    startWave() {
      this.globalWave++; this.waveInRoom++;
      this.mod = this.globalWave === 1 ? NO_MOD : this.rng.pick(MODS);
      this.budget = Math.round((8 + 3 * this.globalWave) * this.mod.budget);
      this.spawnInterval = Math.max(0.35, 1.2 * Math.pow(0.93, this.globalWave)) * this.mod.interval;
      this.spawnClock = 0.6; this.waveT = 0;
      this.roomTxt.setText(this.room.name); this.waveTxt.setText(`Wave ${this.waveInRoom} of 3  ·  ${this.mod.name}`);
      this.clearHazards(); this.placeHazards();
      for (let i = 0; i < 2; i++) { const p = this.randomFloor(40, 200); for (let k = 0; k < 4; k++) this.spawnOrb(p.x + this.rng.range(-12, 12), p.y + this.rng.range(-8, 8)); }
      this.banner(`Wave ${this.waveInRoom}: ${this.mod.name}`, this.mod.note);
      this.state = 'wave'; this.timers.urge = 3;
      if (this.waveInRoom === 1) this.roomIntro();
      else if (this.waveInRoom === 2) { const n = S.randomNote(this.roomId); if (n) this.time.delayedCall(1800, () => this.dialogue.toast([['Lumi', n.text + ' [' + n.src + ']']])); }
    }
    roomIntro() {
      const id = this.roomId; S.save.introSeen = S.save.introSeen || {};
      const seen = S.save.introSeen[id] || 0;
      if (seen < 2) { S.save.introSeen[id] = seen + 1; S.persist(); this.time.delayedCall(1700, () => { if (this.state === 'wave') this.dialogue.play(DLG.roomIntro[id]); }); }
      else { const n = S.randomNote(id); if (n) this.time.delayedCall(1700, () => this.dialogue.toast([['Lumi', n.text + ' [' + n.src + ']']])); }
    }
    /* ---------------- OCD urge tiles: stepping gives brief relief then a bigger rebound; letting one fade weakens the loop. */
    spawnUrge(near) {
      if (this.urges.length >= 6) return;
      let p = null;
      for (let k = 0; k < 20 && !p; k++) { const q = near ? { x: this.player.x + this.rng.range(-70, 70), y: this.player.y + this.rng.range(-50, 50) } : this.randomFloor(30, 170); const tx = Math.floor(q.x / TILE), ty = Math.floor(q.y / TILE); if (ty >= 4 && ty < this.grid.length - 1 && tx > 0 && tx < this.grid[0].length - 1 && this.grid[ty][tx] !== '#' && d2(q, this.player) > 400) p = q; }
      if (!p) return;
      const sp = this.add.sprite(p.x, p.y, 'urge_tile').setDepth(-450).setScale(0).play('urge_tile_a');
      const gl = this.add.image(p.x, p.y, 'glow_pink').setBlendMode(Phaser.BlendModes.ADD).setDepth(-451).setScale(0.45).setAlpha(0.6);
      this.tweens.add({ targets: sp, scale: 1, duration: 300, ease: 'Back.easeOut' });
      this.urges.push({ x: p.x, y: p.y, t: 7, life: 7, sp, gl });
      S.audio.sfx('blip', 1800);
    }
    clearUrges() { (this.urges || []).forEach(u => { u.sp.destroy(); u.gl.destroy(); }); this.urges = []; }
    updateUrges(dt) {
      if (this.room.hazard === 'urge' && this.state === 'wave') { this.timers.urge -= dt; if (this.timers.urge <= 0) { this.timers.urge = 4.2; this.spawnUrge(this.rng.next() < 0.5); } }
      this.timers.temptToast = Math.max(0, this.timers.temptToast - dt); this.timers.resistToast = Math.max(0, this.timers.resistToast - dt);
      const p = this.player;
      for (const u of this.urges.slice()) {
        u.t -= dt; const k = u.t / u.life;
        u.gl.setAlpha((0.35 + 0.35 * Math.sin(this.t * 8)) * Math.min(1, k * 2)); u.sp.setAlpha(Math.min(1, 0.3 + k));
        if ((p.x - u.x) ** 2 + (p.y - u.y) ** 2 < 80) { this.takeUrge(u); continue; }
        if (u.t <= 0) this.resistUrge(u);
      }
    }
    takeUrge(u) {
      this.urges.splice(this.urges.indexOf(u), 1); u.sp.destroy(); u.gl.destroy();
      this.stress = Math.max(0, this.stress - 12); S.audio.sfx('tempt');
      this.floatText(u.x, u.y - 14, 'Relief...', '#f7a8c4'); this.ring(u.x, u.y, 14, 0xf7a8c4, 300, 1);
      this.time.delayedCall(2500, () => { if (this.state === 'wave' || this.state === 'boss') { this.addStress(16); this.floatText(this.player.x, this.player.y - 32, 'The worry came back', COL.orange); S.audio.sfx('warn'); } });
      const b = this.boss;
      if (b && b.id === 'ocd' && this.state === 'boss') { b.hp = Math.min(b.hpMax, b.hp + b.hpMax * 0.12); this.floatText(b.x, b.y - 46, 'The loop grows', '#f7a8c4'); this.spawnUrge(true); this.spawnUrge(false); }
      if (this.timers.temptToast <= 0) { this.timers.temptToast = 20; this.dialogue.toast(DLG.tileTempt); }
    }
    resistUrge(u) {
      this.urges.splice(this.urges.indexOf(u), 1);
      this.tweens.add({ targets: [u.sp, u.gl], alpha: 0, scale: 0.2, duration: 300, onComplete: () => { u.sp.destroy(); u.gl.destroy(); } });
      S.audio.sfx('resist'); this.floatText(u.x, u.y - 12, 'Urge passed', '#9be3a6');
      const b = this.boss;
      if (b && b.id === 'ocd' && this.state === 'boss' && !b.inv) { this.damageBoss(b.hpMax * 0.07, true); this.floatText(b.x, b.y - 46, 'The loop weakens!', '#9be3a6'); this.ring(b.x, b.y, 30, 0x9be3a6, 400, 2); }
      else { for (let k = 0; k < 3; k++) this.spawnOrb(u.x + this.rng.range(-8, 8), u.y + this.rng.range(-6, 6)); }
      if (this.timers.resistToast <= 0) { this.timers.resistToast = 25; this.dialogue.toast(DLG.tileResist); }
    }
    poolNow() { const n = this.globalWave >= 5 ? 3 : this.globalWave >= 3 ? 2 : 1; return this.room.pool.slice(0, n).filter((v, i, a) => a.indexOf(v) === i); }
    spawning(dt) {
      if (this.budget <= 0) return;
      this.spawnClock -= dt; if (this.spawnClock > 0) return;
      this.spawnClock = this.spawnInterval;
      if (this.enemies.length + this.pending.length > 40) return;
      const afford = this.poolNow().filter(t => ENEMY[t].cost <= this.budget);
      if (!afford.length) { this.budget = 0; return; }
      const type = this.mod.cheap ? afford.reduce((a, b) => ENEMY[a].cost <= ENEMY[b].cost ? a : b) : this.mod.heavy ? afford.reduce((a, b) => ENEMY[a].cost >= ENEMY[b].cost ? a : b) : this.rng.pick(afford);
      if (this.state === 'wave') this.budget -= ENEMY[type].cost;
      this.telegraphSpawn(type);
    }
    telegraphSpawn(type, at) {
      const p = at || this.randomFloor(70, 190);
      const portal = this.add.sprite(p.x, p.y, 'fx_portal').setDepth(p.y - 1).play('fx_portal_a').setScale(0.4);
      this.tweens.add({ targets: portal, scale: 1, duration: 300 });
      this.pending.push({ portal, type, x: p.x, y: p.y, t: 0.75 });
    }
    updatePending(dt) {
      for (const p of this.pending.slice()) {
        p.t -= dt; if (p.t > 0) continue;
        this.pending.splice(this.pending.indexOf(p), 1);
        this.tweens.add({ targets: p.portal, scale: 0, duration: 200, onComplete: () => p.portal.destroy() });
        this.spawnEnemy(p.type, p.x, p.y);
      }
    }
    spawnEnemy(type, x, y) {
      const def = ENEMY[type]; const hp = Math.ceil(def.hp * (1 + 0.08 * (this.globalWave - 1)) * (this.mod && this.mod.hp || 1));
      const e = { type, def, x, y, hp, hpMax: hp, kx: 0, ky: 0, frozen: 0, slowed: 0, phase: Math.random() * 6, shootT: 1.5 + Math.random() * 2, showBar: 0 };
      e.sh = this.add.image(x, y, 'shadow').setScale(def.r / 7);
      e.sp = this.add.sprite(x, y, type).setOrigin(0.5, 1).play(type + '_a');
      this.enemies.push(e); return e;
    }
    waveDone() {
      this.state = 'between';
      this.enemies.slice().forEach(e => this.killEnemy(e, false)); this.clearUrges(); this.clearWebs();
      this.eb.slice().forEach(b => this.removeEB(b));
      this.earn(5 + this.globalWave); this.heal(10);
      if (this.rng.next() < 0.5) this.spawnTea(this.player.x + 20, this.player.y);
      S.audio.sfx('unlock'); this.recordBest();
      this.time.delayedCall(600, () => this.openUpgrade(() => { if (this.waveInRoom >= 3) this.startBoss(); else this.startWave(); }));
    }
    banner(title, sub) {
      const c = this.add.container(0, 0);
      const t1 = S.txt(this, 160, 64, title, { size: 8, title: true, ox: 0.5, color: '#fff1a8' });
      const t2 = S.txt(this, 160, 78, sub || '', { size: 7, ox: 0.5, color: '#d9c8ff' });
      const w = Math.max(t1.width, t2.width) + 28;
      const bg = this.add.nineslice(160, 74, 'ui2_panel_dark', null, w, 34, 8, 8, 8, 8);
      const f1 = this.add.image(160 - w / 2 + 2, 74, 'p_petal', 0).setScale(2), f2 = this.add.image(160 + w / 2 - 2, 74, 'p_petal', 2).setScale(2);
      c.add([bg, f1, f2, t1, t2]); c.setAlpha(0); c.y = 6; this.H(c);
      this.tweens.add({ targets: c, alpha: 1, y: 0, duration: 260, ease: 'Back.easeOut' });
      this.tweens.add({ targets: c, alpha: 0, y: -6, duration: 300, delay: 1800, onComplete: () => c.destroy() });
    }
    clearHazards() { this.hazards.forEach(h => h.sp && h.sp.destroy()); this.hazards = []; this.spot = null; }
    placeHazards() {
      const hz = this.room.hazard;
      if (hz === 'spotlight') { this.spot = { phase: this.rng.range(0, 6), speed: 0.4, half: 24, off: 0, rate: 2.5 }; return; }
      if (hz === 'urge') { this.spawnUrge(false); this.spawnUrge(false); return; }
      for (let i = 0; i < 3; i++) { const p = this.randomFloor(50, 260); this.hazards.push({ x: p.x, y: p.y - 4, r: 13, sp: this.add.image(p.x, p.y - 4, hz).setScale(2).setDepth(-500).setAlpha(0.9) }); }
    }
    recordBest() { S.save.bestRoom = Math.max(S.save.bestRoom, this.roomsReached); S.save.bestWave = Math.max(S.save.bestWave, this.globalWave); }
    earn(n) { this.goldEarned += n; S.addGold(n); }

    /* ====================================================== player */
    fireRate() {
      const L = this.toolLv, tool = this.tool; let r;
      if (tool === 'pulse') r = L >= 1 ? 0.12 : 0.16; else if (tool === 'journal') r = L >= 2 ? 0.42 : 0.55; else if (tool === 'headphones') r = L >= 1 ? 0.55 : 0.75; else if (tool === 'net') r = L >= 2 ? 0.65 : 0.9; else r = 0.1;
      return r * (this.stress >= 70 ? 1.35 : 1);
    }
    dashCd() { return Math.max(0.45, 0.9 - 0.15 * (this.lv.walk || 0)); }
    aimAngle() {
      const p = this.player, ox = p.x, oy = p.y - 10;
      const ptr = this.input.activePointer;
      const useMouse = !this.touch && this.time.now - this.lastMouseMove < 4000;
      if (useMouse) { ptr.updateWorldPoint(this.cameras.main); return Math.atan2(ptr.worldY - oy, ptr.worldX - ox); }
      const tgt = this.nearestTarget(170);
      if (tgt) return Math.atan2(tgt.y - oy, tgt.x - ox);
      return p.moveAng !== undefined ? p.moveAng : -Math.PI / 2;
    }
    nearestTarget(range) {
      const p = { x: this.player.x, y: this.player.y - 10 }; let best = null, bd = range * range;
      this.enemies.forEach(e => { const q = { x: e.x, y: e.y - 6 }; const dd = d2(q, p); if (dd < bd) { bd = dd; best = q; } });
      if (this.boss && this.state === 'boss' && !best) { const q = { x: this.boss.x, y: this.boss.y }; if (d2(q, p) < 260 * 260) best = q; }
      return best;
    }
    wantsFire() {
      if (this.touch) return !!this.nearestTarget(170);
      const ptr = this.input.activePointer;
      return (ptr.leftButtonDown() && ptr.y / S.ZOOM > 26) || this.keys.J.isDown;
    }
    movePlayer(dt) {
      const k = this.keys, p = this.player;
      if (p.dashT > 0) { p.dashT -= dt; this.moveBody(p, p.dvx * dt, p.dvy * dt, 4, 4); if (Math.random() < 0.6) this.ghost(); p.moving = true; return; }
      let mx = 0, my = 0;
      if (k.A.isDown || k.LEFT.isDown) mx -= 1; if (k.D.isDown || k.RIGHT.isDown) mx += 1;
      if (k.W.isDown || k.UP.isDown) my -= 1; if (k.S.isDown || k.DOWN.isDown) my += 1;
      if (this.stick.active) { mx += this.stick.dx; my += this.stick.dy; }
      const m = Math.hypot(mx, my); p.moving = m > 0.15;
      if (p.moving) {
        if (m > 1) { mx /= m; my /= m; }
        let sp = 78 * (1 + 0.1 * (this.lv.walk || 0));
        if (this.hazards.some(h => d2(h, p) < h.r * h.r)) sp *= 0.6;
        if (p.slowT > 0) sp *= 0.55;
        if (this.beamOn) sp *= 0.7;
        this.moveBody(p, mx * sp * dt, my * sp * dt, 4, 4);
        p.moveAng = Math.atan2(my, mx);
      }
      p.slowT = Math.max(0, p.slowT - dt);
    }
    animatePlayer(dt) {
      const p = this.player, a = this.aimAngle(); p.face = a;
      const deg = Phaser.Math.RadToDeg(a);
      const dir = (deg > 45 && deg < 135) ? 0 : (deg < -45 && deg > -135) ? 1 : 2;
      p.anim += dt * (p.moving ? 10 : 0); const f = p.moving ? Math.floor(p.anim) % 4 : 0;
      this.pc.setPlayerFrame(dir * 4 + f); this.pc.scaleX = (dir === 2 && Math.cos(a) < 0) ? -1 : 1;
      this.pc.setPosition(Math.round(p.x), Math.round(p.y)).setDepth(p.y);
      this.pShadow.setPosition(Math.round(p.x), Math.round(p.y)).setDepth(p.y - 1);
      const hx = p.x + Math.cos(a) * 5, hy = p.y - 9 + Math.sin(a) * 3;
      const kick = this.kickT > 0 ? this.kickT * 6 : 0; this.kickT = Math.max(0, this.kickT - dt);
      this.weapon.setPosition(Math.round(hx - Math.cos(a) * kick), Math.round(hy - Math.sin(a) * kick)).setRotation(a).setFlipY(Math.cos(a) < 0).setDepth(dir === 1 ? p.y - 0.5 : p.y + 0.5);
      const side = this.pc.scaleX < 0 ? 1 : -1;
      const tx = p.x + side * 12, ty = p.y - 26 + Math.sin(this.t * 3) * 2;
      this.lumi.x += (tx - this.lumi.x) * Math.min(1, dt * 5); this.lumi.y += (ty - this.lumi.y) * Math.min(1, dt * 5);
      this.lumi.setDepth(p.y + 1).setAlpha(this.lv.friend ? (this.friendReady ? 1 : 0.5) : 0.9);
      const flick = this.timers.inv > 0 && Math.floor(this.timers.inv * 12) % 2 === 0; this.pc.setAlpha(flick ? 0.45 : 1);
      const lead = this.touch ? 0 : 18; let tx2 = p.x + Math.cos(a) * lead, ty2 = p.y - 12 + Math.sin(a) * lead * 0.6;
      if (this.boss && this.boss.sp && this.boss.sp.active) { tx2 = tx2 * 0.6 + this.boss.x * 0.4; ty2 = ty2 * 0.55 + (this.boss.y - 10) * 0.45; }
      this.camTarget.setPosition(tx2, ty2);
    }
    ghost() {
      const p = this.player;
      [0, 1, 2].forEach(i => {
        const src = this.pc.parts[i]; const g = this.add.sprite(p.x, p.y, src.texture.key, src.frame.name).setOrigin(0.5, 1).setTintFill(0x8fc1e3).setAlpha(0.45).setDepth(p.y - 2);
        g.scaleX = this.pc.scaleX; this.tweens.add({ targets: g, alpha: 0, duration: 220, onComplete: () => g.destroy() });
      });
    }
    dash() {
      if (this.timers.dash > 0 || this.charging) return;
      const p = this.player; const a = p.moving && p.moveAng !== undefined ? p.moveAng : this.aimAngle();
      p.dashT = 0.16; p.dvx = Math.cos(a) * 290; p.dvy = Math.sin(a) * 290; this.timers.dash = this.dashCd();
      this.timers.inv = Math.max(this.timers.inv, 0.22); S.audio.sfx('dash');
    }

    /* ---------------- weapons */
    shoot(o) {
      const sp = this.add.image(o.x, o.y, o.key).setRotation(o.ang).setDepth(9000);
      const s = Object.assign({ vx: Math.cos(o.ang) * o.speed, vy: Math.sin(o.ang) * o.speed, hit: new Set(), sp, decel: 0, bounce: 0 }, o);
      this.shots.push(s); return s;
    }
    muzzle(x, y, a) { const m = this.add.sprite(x, y, 'fx_muzzle').setRotation(a).setDepth(9001).play('fx_muzzle_a'); m.once('animationcomplete', () => m.destroy()); }
    updateFire(dt) {
      this.timers.fire = Math.max(0, this.timers.fire - dt);
      const want = this.wantsFire() && this.canAct();
      const p = this.player, a = p.face, L = this.toolLv;
      const mx = p.x + Math.cos(a) * 12, my = p.y - 9 + Math.sin(a) * 6;
      const wob = this.stress >= 70 ? 0.08 : 0;
      if (this.tool === 'lantern') {
        if (want && !this.beamOn) { this.beamOn = true; S.audio.sfx('beamOn'); }
        if (!want && this.beamOn) { this.beamOn = false; S.audio.sfx('beamOff'); }
        if (this.beamOn) this.updateBeam(dt, mx, my, a);
        return;
      }
      if (!want || this.timers.fire > 0) return;
      this.timers.fire = this.fireRate();
      if (this.tool === 'pulse') {
        const n = L >= 2 ? 2 : 1;
        for (let i = 0; i < n; i++) {
          const off = n === 2 ? (i ? 3 : -3) : 0, ox = -Math.sin(a) * off, oy = Math.cos(a) * off;
          this.shoot({ key: 'shot_bolt', x: mx + ox, y: my + oy, ang: a + this.rng.range(-0.04 - wob, 0.04 + wob), speed: 280, dmg: 1, pierce: L >= 3 ? 2 : 1, life: 0.85, r: 3, kb: 45 });
        }
        S.audio.sfx('shootPulse'); this.kickT = 0.06;
      } else if (this.tool === 'journal') {
        const n = L >= 1 ? 7 : 5;
        for (let i = 0; i < n; i++) this.shoot({ key: 'shot_ink', x: mx, y: my, ang: a + (i / (n - 1) - 0.5) * 0.65 + this.rng.range(-0.05, 0.05), speed: this.rng.range(200, 260), dmg: 0.9, pierce: L >= 3 ? 2 : 1, life: 0.34, r: 3, kb: 120, decel: 300 });
        S.audio.sfx('shootInk'); this.kickT = 0.14; this.shake(70, 0.0035);
      } else if (this.tool === 'headphones') {
        const n = L >= 2 ? 5 : 3;
        for (let i = 0; i < n; i++) this.shoot({ key: 'shot_note', x: mx, y: my, ang: a + (i / (n - 1) - 0.5) * 0.5, speed: 150, dmg: 1.3, pierce: 99, life: 1.6, r: 4, kb: L >= 3 ? 70 : 25, bounce: L >= 3 ? 2 : 1 });
        S.audio.sfx('shootNote'); this.kickT = 0.08;
      } else if (this.tool === 'net') {
        const s = this.shoot({ key: 'shot_net', x: mx, y: my, ang: a, speed: 190, dmg: 1, pierce: 1, life: 0.5, r: 5, kb: 20, decel: 220, net: true });
        s.sp.destroy(); s.sp = this.add.sprite(mx, my, 'shot_net').setDepth(9000).play('shot_net_a');
        S.audio.sfx('shootNet'); this.kickT = 0.12;
      }
      this.muzzle(mx, my, a);
    }
    updateBeam(dt, mx, my, a) {
      const L = this.toolLv, len = L >= 2 ? 130 : 95, width = L >= 1 ? 6 : 3.5;
      let ex = mx, ey = my, dist = 0;
      while (dist < len) { ex += Math.cos(a) * 3; ey += Math.sin(a) * 3; dist += 3; if (this.solidAt(ex, ey + 6)) break; }
      this.beam = { mx, my, ex, ey, width };
      this.timers.beamTick -= dt; if (this.timers.beamTick > 0) return;
      this.timers.beamTick = 0.1;
      const segHit = (px, py, r) => { const vx = ex - mx, vy = ey - my, l2 = vx * vx + vy * vy || 1; const t = clamp(((px - mx) * vx + (py - my) * vy) / l2, 0, 1); const cx = mx + vx * t, cy = my + vy * t; return (px - cx) ** 2 + (py - cy) ** 2 < (r + width) ** 2; };
      let lit = false;
      this.enemies.slice().forEach(e => { if (segHit(e.x, e.y - 6, e.def.r)) { lit = true; this.damageEnemy(e, 0.6, a, 15, true); } });
      if (this.boss && this.state === 'boss' && segHit(this.boss.x, this.boss.y, this.boss.r)) { lit = true; this.damageBoss(0.6, true); }
      if (L >= 3 && lit) this.stress = Math.max(0, this.stress - 0.1);
    }
    updateShots(dt) {
      for (const s of this.shots.slice()) {
        if (s.decel) { const sp = Math.hypot(s.vx, s.vy), ns = Math.max(40, sp - s.decel * dt); s.vx *= ns / sp; s.vy *= ns / sp; }
        let nx = s.x + s.vx * dt, ny = s.y + s.vy * dt; s.life -= dt;
        let dead = s.life <= 0;
        if (!dead && this.solidAt(nx, ny + 8)) {
          if (s.bounce > 0) { s.bounce--; if (this.solidAt(nx, s.y + 8)) s.vx = -s.vx; else s.vy = -s.vy; nx = s.x; ny = s.y; s.hit.clear(); }
          else { dead = true; if (!s.net) this.impact(s.x, s.y, 0.7); }
        }
        s.x = nx; s.y = ny; s.sp.setPosition(s.x, s.y); if (s.net) s.sp.rotation += dt * 12; else s.sp.setRotation(Math.atan2(s.vy, s.vx));
        if (!dead) for (const e of this.enemies.slice()) {
          if (s.hit.has(e)) continue;
          if ((e.x - s.x) ** 2 + (e.y - 6 - s.y) ** 2 < (e.def.r + s.r) ** 2) { s.hit.add(e); this.damageEnemy(e, s.dmg, Math.atan2(s.vy, s.vx), s.kb); this.impact(s.x, s.y, 1); if (--s.pierce <= 0) { dead = true; break; } }
        }
        const b = this.boss;
        if (!dead && b && this.state === 'boss' && !s.hit.has(b) && (b.x - s.x) ** 2 + (b.y - s.y) ** 2 < (b.r + s.r) ** 2) { s.hit.add(b); this.damageBoss(s.dmg); this.impact(s.x, s.y, 1); if (--s.pierce <= 0) dead = true; }
        if (dead) { if (s.net) this.netBurst(s.x, s.y); s.sp.destroy(); this.shots.splice(this.shots.indexOf(s), 1); }
      }
    }
    /* ---------------- Dream Net webs */
    netBurst(x, y) {
      const L = this.toolLv, r = L >= 1 ? 34 : 26;
      const sp = this.add.image(x, y, 'net_web').setDepth(-420).setScale(0.2).setAlpha(0.95);
      const gl = this.add.image(x, y, 'glow_cool').setBlendMode(Phaser.BlendModes.ADD).setDepth(-421).setScale(r / 32).setAlpha(0.35);
      this.tweens.add({ targets: sp, scale: r / 28, duration: 220, ease: 'Back.easeOut' });
      if (!S.save.settings.reduceMotion) this.tweens.add({ targets: sp, angle: 360, duration: 9000, repeat: -1 });
      this.webs.push({ x, y, r, t: 2.6, tick: 0, sp, gl });
      if (this.webs.length > 5) this.killWeb(this.webs[0]);
      S.audio.sfx('netBurst'); this.ring(x, y, r, 0xbfe3ff, 300, 1);
    }
    killWeb(w) { const i = this.webs.indexOf(w); if (i < 0) return; this.webs.splice(i, 1); this.tweens.killTweensOf(w.sp); this.tweens.add({ targets: [w.sp, w.gl], alpha: 0, duration: 250, onComplete: () => { w.sp.destroy(); w.gl.destroy(); } }); }
    clearWebs() { (this.webs || []).slice().forEach(w => this.killWeb(w)); }
    updateWebs(dt) {
      const p = this.player;
      for (const w of this.webs.slice()) {
        w.t -= dt; w.tick -= dt; const tick = w.tick <= 0; if (tick) w.tick = 0.4;
        if (w.t < 0.5) { w.sp.setAlpha(Math.max(0, w.t * 2)); w.gl.setAlpha(Math.max(0, w.t * 0.7)); }
        const r2 = w.r * w.r;
        this.enemies.slice().forEach(e => { if ((e.x - w.x) ** 2 + (e.y - 4 - w.y) ** 2 < r2) { e.slowed = Math.max(e.slowed, 0.25); e.kx *= 0.8; e.ky *= 0.8; if (tick) this.damageEnemy(e, 0.6, 0, 0, true); } });
        const b = this.boss; if (tick && b && this.state === 'boss' && (b.x - w.x) ** 2 + (b.y - w.y) ** 2 < (w.r + b.r) ** 2) this.damageBoss(0.6, true);
        if ((p.x - w.x) ** 2 + (p.y - w.y) ** 2 < r2) this.stress = Math.max(0, this.stress - 3 * dt);
        if (this.toolLv >= 3) this.eb.slice().forEach(q => { if (!q.parry && (q.x - w.x) ** 2 + (q.y - w.y) ** 2 < r2) { this.impact(q.x, q.y, 0.5); this.removeEB(q); } });
        if (w.t <= 0) this.killWeb(w);
      }
    }
    impact(x, y, sc) { const f = this.add.sprite(x, y, 'fx_impact').setDepth(9002).setScale(sc || 1).play('fx_impact_a'); f.once('animationcomplete', () => f.destroy()); }
    swingStaff() {
      if (this.timers.staff > 0) return;
      this.timers.staff = 0.45; const p = this.player, a = this.aimAngle(), cx = p.x, cy = p.y - 10;
      const sw = this.add.sprite(cx, cy, 'fx_swing').setRotation(a).setDepth(9003).play('fx_swing_a'); sw.once('animationcomplete', () => sw.destroy());
      S.audio.sfx('staff');
      let hitAny = false;
      const inArc = (x, y, r) => Math.hypot(x - cx, y - cy) < 30 + r && Math.abs(angDiff(Math.atan2(y - cy, x - cx), a)) < 1.1;
      this.enemies.slice().forEach(e => { if (inArc(e.x, e.y - 6, e.def.r)) { hitAny = true; this.damageEnemy(e, 3, a, 170); this.impact(e.x, e.y - 6, 1.2); } });
      this.eb.slice().forEach(b => {
        if (!inArc(b.x, b.y, b.r)) return;
        if (b.parry) { this.stress = Math.max(0, this.stress - 12); this.heal(3); this.floatText(b.x, b.y - 8, 'Parry!', COL.pink); S.audio.sfx('parry'); this.hitstop = 0.06; }
        this.impact(b.x, b.y, 0.8); this.removeEB(b); hitAny = true;
      });
      if (this.boss && this.state === 'boss' && inArc(this.boss.x, this.boss.y, this.boss.r)) { this.damageBoss(4); hitAny = true; }
      (this.masks || []).forEach(m => { if (inArc(m.x, m.y, 6)) { m.stun = 1.2; if (m.state !== 'orbit') m.state = 'orbit'; hitAny = true; } });
      if (hitAny) { this.hitstop = Math.max(this.hitstop, 0.045); this.shake(80, 0.004); }
    }

    /* ---------------- breathe */
    startBreathe() {
      if (this.charging || this.timers.breatheCd > 0) return;
      this.charging = true; this.chargeT = 0; this.chargeDur = Math.max(0.5, 1.2 - 0.25 * (this.lv.breath || 0));
      S.audio.sfx('chargeStart', this.chargeDur);
    }
    updateBreathe(dt) {
      if (!this.charging) return;
      if (this.player.moving) { this.charging = false; S.audio.sfx('chargeStop'); this.floatText(this.player.x, this.player.y - 30, 'Stay still to breathe', COL.grey); return; }
      this.chargeT += dt; if (this.chargeT >= this.chargeDur) this.releaseBreathe();
    }
    releaseBreathe() {
      this.charging = false; this.timers.breatheCd = 6;
      const p = this.player, R = 64, lv = this.lv.breath || 0, cy = p.y - 10;
      S.audio.sfx('breathe');
      this.stress = Math.max(0, this.stress - (30 + 10 * lv)); this.heal(6);
      this.enemies.slice().forEach(e => { if ((e.x - p.x) ** 2 + (e.y - cy) ** 2 < R * R) { this.knock(e, 120); this.damageEnemy(e, 2, Math.atan2(e.y - cy, e.x - p.x), 0); } });
      this.eb.slice().forEach(b => { if ((b.x - p.x) ** 2 + (b.y - cy) ** 2 < R * R) this.removeEB(b); });
      if (this.spot) this.spot.off = 4;
      this.ring(p.x, cy, R, 0x8fc1e3, 600, 2); this.ring(p.x, cy, R * 0.6, 0xf2f4fa, 450, 1);
      if (!S.save.settings.reduceMotion) { this.shake(140, 0.004); this.cameras.main.flash(220, 143, 193, 227, false); }
    }

    /* ---------------- health / stress */
    heal(n) { const before = this.hp; this.hp = Math.min(this.maxHp, this.hp + n); if (this.hp > before + 0.5) this.floatText(this.player.x, this.player.y - 30, '+' + Math.round(this.hp - before), '#ff9fb8'); }
    hurt(dmg, stressAdd, sx, sy, slows) {
      if (this.timers.inv > 0 || this.player.dashT > 0 || this.state === 'ended') return;
      const p = this.player;
      this.timers.inv = 0.8; this.timers.noHit = 0;
      if (this.lv.friend && this.friendReady) {
        this.friendReady = false; this.timers.friend = [15, 12, 9][this.lv.friend - 1];
        S.audio.sfx('shield'); this.ring(this.lumi.x, this.lumi.y, 14, 0xe89bb0, 350, 1); this.floatText(p.x, p.y - 30, 'Lumi caught that one', COL.pink); return;
      }
      this.hp -= dmg; this.addStress(stressAdd);
      if (slows) p.slowT = 2;
      if (sx !== undefined) { const a = Math.atan2(p.y - sy, p.x - sx); this.moveBody(p, Math.cos(a) * 6, Math.sin(a) * 6, 4, 4); }
      S.audio.sfx('hit'); this.pc.parts.forEach(pt => pt.setTintFill(0xffffff)); this.time.delayedCall(80, () => this.pc.restoreTints());
      this.shake(110, 0.005); this.hitstop = Math.max(this.hitstop, 0.05);
      this.floatText(p.x, p.y - 30, '-' + Math.round(dmg), '#ff6680');
      if (this.hp <= 0) { this.hp = 0; this.endRun(false); }
    }
    addStress(n) {
      this.stress = clamp(this.stress + n, 0, 100);
      if (this.stress >= 70 && this.timers.stressToast <= 0) { this.timers.stressToast = 25; this.dialogue.toast(DLG.stress70); }
    }
    updateStress(dt) {
      let rate = this.mod && this.mod.quiet ? 0.3 : 0.6;
      if (this.lv.rest && this.timers.noHit >= 3) rate = -(1 + 0.75 * (this.lv.rest - 1));
      if (this.hazards.some(h => d2(h, this.player) < h.r * h.r)) rate += 2;
      if (this.spot && this.inSpot(this.player)) rate += this.spot.rate;
      if (rate > 0) this.addStress(rate * dt); else this.stress = Math.max(0, this.stress + rate * dt);
      if (this.stress >= 100) {
        this.hp -= 4 * dt;
        if (this.timers.overToast <= 0) { this.timers.overToast = 12; this.dialogue.toast(DLG.overwhelmed); }
        if (this.hp <= 0) { this.hp = 0; this.endRun(false); }
      }
    }

    /* ====================================================== enemies */
    updateEnemies(dt) {
      const p = this.player, sc = (1 + 0.035 * this.globalWave) * (this.mod.speed || 1);
      for (const e of this.enemies.slice()) {
        e.frozen = Math.max(0, e.frozen - dt); e.slowed = Math.max(0, e.slowed - dt); e.showBar = Math.max(0, e.showBar - dt);
        let vx = 0, vy = 0;
        const dx = p.x - e.x, dy = p.y - e.y, dist = Math.hypot(dx, dy) || 1;
        if (e.frozen <= 0) {
          let sp = e.def.speed * sc * (e.slowed > 0 ? 0.5 : 1);
          if (e.def.shooter && dist < 80) sp = -sp * 0.6;
          vx = dx / dist * sp; vy = dy / dist * sp;
          if (e.def.zig) { const z = Math.sin(this.t * 6 + e.phase) * 30; vx += -dy / dist * z; vy += dx / dist * z; }
          e.shootT -= dt;
          if (e.def.shooter && e.shootT <= 0 && dist < 200) { e.shootT = 2.6; this.fireEB('b_glance', e.x, e.y - 6, Math.atan2(p.y - 10 - (e.y - 6), dx), 90, { dmg: 8 }); }
          if (e.def.ring && e.shootT <= 0 && dist < 160) { e.shootT = 3.6; const off = e.def.ringOff !== undefined ? e.def.ringOff : 0.785; for (let k = 0; k < 4; k++) this.fireEB(e.def.ringKey || 'b_spark', e.x, e.y - 6, k * Math.PI / 2 + off, 70, { dmg: 8 }); S.audio.sfx('blip', 1400); }
        }
        for (const o of this.enemies) { if (o === e) continue; const ox = e.x - o.x, oy = e.y - o.y, dd = ox * ox + oy * oy; if (dd < 100 && dd > 0.01) { const l = Math.sqrt(dd), f = (10 - l) * 4; vx += ox / l * f; vy += oy / l * f; } }
        this.moveBody(e, (vx + e.kx) * dt, (vy + e.ky) * dt, 3, 3);
        const decay = Math.pow(0.02, dt); e.kx *= decay; e.ky *= decay;
        e.sp.setPosition(Math.round(e.x), Math.round(e.y)).setDepth(e.y); e.sh.setPosition(Math.round(e.x), Math.round(e.y)).setDepth(e.y - 1);
        e.sp.flipX = p.x < e.x;
        if (e.frozen > 0) e.sp.setTint(0x9fd8ff); else if (!e.flash) e.sp.clearTint();
        if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 < (e.def.r + 5) ** 2) { this.hurt(e.def.dmg, 6, e.x, e.y, e.def.slows); this.knock(e, 60); }
      }
    }
    knock(e, f) { const a = Math.atan2(e.y - this.player.y, e.x - this.player.x); e.kx += Math.cos(a) * f; e.ky += Math.sin(a) * f; }
    damageEnemy(e, dmg, ang, kb, quiet) {
      if (this.enemies.indexOf(e) < 0) return;
      e.hp -= dmg; e.showBar = 2; e.flash = true; e.sp.setTintFill(0xffffff);
      this.time.delayedCall(60, () => { e.flash = false; if (e.sp.active) e.sp.clearTint(); });
      if (kb) { e.kx += Math.cos(ang) * kb; e.ky += Math.sin(ang) * kb; }
      if (!quiet) { S.audio.sfx('hitE'); this.dmgNum(e.x, e.y - 16, dmg); }
      if (e.hp <= 0) this.killEnemy(e, true);
    }
    killEnemy(e, reward) {
      const i = this.enemies.indexOf(e); if (i < 0) return; this.enemies.splice(i, 1);
      const sp = e.sp; e.sh.destroy();
      const poof = this.add.sprite(e.x, e.y - 6, 'fx_poof').setDepth(e.y + 1).play('fx_poof_a'); poof.once('animationcomplete', () => poof.destroy());
      this.tweens.add({ targets: sp, alpha: 0, scaleX: 1.4, scaleY: 0.6, duration: 160, onComplete: () => sp.destroy() });
      if (reward) {
        S.audio.sfx('kill'); this.hitstop = Math.max(this.hitstop, 0.035); this.shake(60, 0.002);
        if (this.rng.next() < 0.5) this.spawnOrb(e.x, e.y - 2); if (this.rng.next() < 0.06) this.spawnTea(e.x, e.y);
      }
    }
    spawnOrb(x, y) { this.orbs.push({ x, y, sp: this.add.sprite(x, y, 'orb').play('orb_a').setDepth(y), ph: Math.random() * 6 }); }
    spawnTea(x, y) { this.teas.push({ x, y, sp: this.add.image(x, y, 'tea').setOrigin(0.5, 1).setDepth(y) }); }
    updatePickups(dt) {
      const p = this.player, mag = 18 + 10 * (this.lv.clear || 0);
      for (const o of this.orbs.slice()) {
        const dd = d2(o, p);
        if (dd < mag * mag) { const d = Math.sqrt(dd) || 1; o.x += (p.x - o.x) / d * 150 * dt; o.y += (p.y - 6 - o.y) / d * 150 * dt; }
        o.sp.setPosition(o.x, o.y + Math.sin(this.t * 4 + o.ph));
        if (dd < 60) {
          this.orbs.splice(this.orbs.indexOf(o), 1); o.sp.destroy();
          this.stress = Math.max(0, this.stress - 4); this.earn(this.mod.gold || 1); S.audio.sfx('orb');
          this.orbStreak = this.timers.orbStreakT > 0 ? this.orbStreak + 1 : 1; this.timers.orbStreakT = 3;
          if (this.orbStreak === 8) this.dialogue.toast(DLG.orbStreak);
        }
      }
      for (const o of this.teas.slice()) if (d2(o, p) < 120) { this.teas.splice(this.teas.indexOf(o), 1); o.sp.destroy(); this.heal(15); S.audio.sfx('heal'); }
    }

    /* ---------------- enemy bullets */
    fireEB(key, x, y, ang, speed, o = {}) {
      const sp = this.add.image(x, y, key).setDepth(9100);
      const b = Object.assign({ key, x, y, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, r: 3, dmg: 10, life: 6, parry: key === 'b_pink', spin: 0, ignoreWalls: 0, sp }, o);
      if (b.parry && !S.save.settings.reduceMotion) this.tweens.add({ targets: sp, scale: 1.25, duration: 220, yoyo: true, repeat: -1 });
      this.eb.push(b); return b;
    }
    removeEB(b) { const i = this.eb.indexOf(b); if (i >= 0) this.eb.splice(i, 1); this.tweens.killTweensOf(b.sp); b.sp.destroy(); }
    updateEB(dt) {
      const p = this.player, py = p.y - 10;
      for (const b of this.eb.slice()) {
        b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; b.ignoreWalls -= dt;
        if (b.spin) b.sp.rotation += b.spin * dt;
        b.sp.setPosition(b.x, b.y);
        if (b.life <= 0 || b.y > this.roomH - 12 || (b.ignoreWalls <= 0 && this.solidAt(b.x, b.y + 6))) { if (b.life > 0) this.impact(b.x, b.y, 0.6); this.removeEB(b); continue; }
        if ((b.x - p.x) ** 2 + (b.y - py) ** 2 < (b.r + 4) ** 2) { this.hurt(b.dmg, 5, b.x, b.y); this.removeEB(b); }
      }
    }

    /* ====================================================== upgrades */
    upgradeOptions() {
      const opts = [];
      Object.entries(CONTENT.UPGRADES).forEach(([id, u]) => { if ((this.lv[id] || 0) < u.max) opts.push({ id, u }); });
      if (this.toolLv < 3) { opts.push({ id: 'tool', tool: true }); opts.push({ id: 'tool', tool: true }); }
      const pick = []; this.rng.shuffle(opts).forEach(o => { if (pick.length < 3 && !pick.some(q => q.id === o.id)) pick.push(o); });
      while (pick.length < 3) pick.push({ id: 'breather' });
      return pick;
    }
    openUpgrade(done) {
      this.state = 'upgrade'; S.audio.sfx('chargeStop'); this.charging = false; if (this.beamOn) { this.beamOn = false; S.audio.sfx('beamOff'); }
      const opts = this.upgradeOptions();
      const c = this.add.container(0, 0);
      c.add(this.add.rectangle(160, 90, 320, 180, 0x0b0818, 0.8));
      c.add(this.add.image(98, 15, 'companion_orb').setScale(2).setTint(S.lumiTint()));
      c.add(S.txt(this, 108, 10, DLG.upgrade[0][1], { size: 8, color: '#fff6d8' }));
      const note = S.randomNote(this.roomId);
      if (note) {
        const np = this.add.nineslice(10, 150, 'ui2_panel_dark', null, 300, 28, 8, 8, 8, 8).setOrigin(0);
        const nt = S.txt(this, 16, 152, "LUMI'S NOTE", { size: 5, color: '#f7a8c4', title: true });
        const nb = S.txt(this, 16, 159, note.text.length > 150 ? note.text.slice(0, note.text.lastIndexOf(' ', 146)) + '...' : note.text, { size: 6, color: '#e9e2ff', wrap: 252, lineSpacing: 0 });
        const ns = S.txt(this, 304, 152, note.src, { size: 5, color: '#9b8fbf', ox: 1 });
        c.add([np, nt, nb, ns]);
      }
      this.nav = new S.Nav(this); this.nav.ring.setScrollFactor(0);
      this.upgradeDone = done; this.upgradeOpts = opts;
      const cards = [];
      opts.forEach((o, i) => {
        const x = 10 + i * 102, y = 26, w = 96, h = 120;
        const card = S.button(this, x, y, w, h, null, () => this.pickUpgrade(i), { style: 'panel' });
        let icon, name, lvTxt, fx, tip, src;
        if (o.id === 'breather') { icon = 'tea'; name = 'A Breather'; lvTxt = 'Instant'; fx = 'Heal 30 and lower Stress by 20'; tip = 'Rest is part of the routine.'; src = ''; }
        else if (o.tool) { const t = CONTENT.TOOLS[this.tool]; icon = t.icon; name = t.name + '+'; lvTxt = `Level ${this.toolLv} → ${this.toolLv + 1}`; fx = t.ups[this.toolLv]; tip = 'Your coping tool gets stronger.'; src = ''; }
        else { const u = o.u, l = this.lv[o.id] || 0; icon = u.icon; name = u.name; lvTxt = `Level ${l} → ${l + 1}`; fx = u.fx[l]; tip = u.tip; src = 'Source: ' + [...new Set(u.c.map(cid => CONTENT.SOURCES[CONTENT.CLAIMS[cid].src].short))].join(', '); }
        card.addAt([
          this.add.image(w / 2, 15, icon).setScale(1.5),
          S.txt(this, w / 2, 27, name, { size: 8, ox: 0.5, color: COL.ink, shadow: false }),
          this.add.nineslice(w / 2, 41, 'ui2_ribbon', null, 64, 11, 5, 5, 3, 3),
          S.txt(this, w / 2, 41, lvTxt, { size: 6, ox: 0.5, oy: 0.5, color: '#fff6d8', shadow: false }),
          S.txt(this, 6, 50, fx, { size: 7, color: COL.ink, shadow: false, wrap: w - 12 }),
          S.txt(this, 6, 74, tip, { size: 6, color: '#3c6288', shadow: false, wrap: w - 12, lineSpacing: 0 }),
          S.txt(this, 6, h - 18, src, { size: 6, color: COL.slate, shadow: false, wrap: w - 22 }),
          S.txt(this, w - 5, h - 4, `[${i + 1}]`, { size: 6, color: COL.slate, shadow: false, ox: 1, oy: 1 })
        ], 1);
        c.add(card); cards.push(card);
        if (!S.save.settings.reduceMotion) { const y0 = card.y; card.y = y0 + 40; card.setAlpha(0); this.tweens.add({ targets: card, y: y0, alpha: 1, duration: 320, delay: 80 + i * 90, ease: 'Back.easeOut', onStart: () => S.audio.sfx('blip', 900 + i * 200) }); }
      });
      this.H(c); this.upgradeUI = c; this.modal = { keys: { '1': () => this.pickUpgrade(0), '2': () => this.pickUpgrade(1), '3': () => this.pickUpgrade(2) } };
      this.nav.focus(cards[0]); S.audio.sfx('upgrade');
    }
    pickUpgrade(i) {
      if (!this.upgradeUI || !this.upgradeOpts[i]) return;
      const o = this.upgradeOpts[i];
      if (o.id === 'breather') { this.stress = Math.max(0, this.stress - 20); this.heal(30); }
      else if (o.tool) this.toolLv++;
      else { this.lv[o.id] = (this.lv[o.id] || 0) + 1; if (o.id === 'sleep') { this.maxHp += 20; this.hp += 20; } if (o.id === 'friend' && this.lv.friend === 1) this.friendReady = true; }
      S.audio.sfx('upgrade');
      this.upgradeUI.destroy(); this.upgradeUI = null; this.modal = null; this.killNav();
      const d = this.upgradeDone; this.upgradeDone = null; this.state = 'between';
      this.buildAbilityBar(); this.updateHud(); d && d();
    }
    updateHabits(dt) {
      const p = this.player, cy = p.y - 8;
      for (const k of ['pause', 'boundary', 'friend']) this.timers[k] = Math.max(0, this.timers[k] - dt);
      if (this.lv.pause && this.timers.pause <= 0) {
        this.timers.pause = 11 - this.lv.pause; this.ring(p.x, cy, 70, 0x9fd8ff, 500, 1);
        this.enemies.forEach(e => { if ((e.x - p.x) ** 2 + (e.y - cy) ** 2 < 4900) e.frozen = 2; });
      }
      if (this.lv.boundary && this.timers.boundary <= 0) {
        const lv = this.lv.boundary; this.timers.boundary = 4 - 0.5 * (lv - 1); const R = 38 + 6 * (lv - 1);
        this.ring(p.x, cy, R, 0xf2f4fa, 300, 2);
        this.enemies.slice().forEach(e => { if ((e.x - p.x) ** 2 + (e.y - cy) ** 2 < R * R) { this.knock(e, 140); if (this.lv.pause) e.frozen = Math.max(e.frozen, 1); this.damageEnemy(e, 1, 0, 0, true); } });
        this.eb.slice().forEach(b => { if ((b.x - p.x) ** 2 + (b.y - cy) ** 2 < R * R && !b.parry) this.removeEB(b); });
      }
      if (this.lv.friend && !this.friendReady && this.timers.friend <= 0) { this.friendReady = true; this.ring(this.lumi.x, this.lumi.y, 10, 0xe89bb0, 300, 1); }
    }

    /* ====================================================== boss */
    startBoss() {
      this.state = 'bossIntro';
      const id = this.roomId, st = S.save.bosses[id];
      this.mastery = st.state === 'cleared';
      if (st.state === 'unknown') { st.state = 'encountered'; S.persist(); }
      this.bossCount++; this.clearHazards(); this.clearUrges(); this.clearWebs(); this.mod = NO_MOD;
      this.enemies.slice().forEach(e => this.killEnemy(e, false)); this.pending.forEach(p => p.portal.destroy()); this.pending = [];
      this.eb.slice().forEach(b => this.removeEB(b));
      const hpMax = 60 + 8 * (this.bossCount - 1);
      const b = this.boss = { id, phase: 0, hpMax, hp: hpMax, x: 240, y: 116, r: 22, t: 0, atk: {}, inv: true, quizT: 3, correct: 0, asked: 0, qPool: [], tauntT: 4 };
      b.sh = this.add.image(b.x, b.y + 34, 'shadow_big').setDepth(-300);
      b.sp = this.add.sprite(b.x, b.y, 'boss_' + id, 0).setDepth(b.y + 30).setAlpha(0);
      this.tweens.add({ targets: b.sp, alpha: 1, duration: 600 });
      if (id === 'crowd') this.makeMasks(4);
      this.roomTxt.setText(S.BOSS_INFO[id].boss);
      S.audio.sfx('bossIntro'); S.audio.intensity = 0; S.audio.music('boss');
      const cam = this.cameras.main; cam.stopFollow(); cam.pan(b.x, b.y + 20, 600, 'Sine.easeInOut');
      const lines = this.mastery ? DLG[id].mastery : DLG[id].intro;
      this.time.delayedCall(700, () => this.dialogue.play(lines, () => { cam.startFollow(this.camTarget, true, 0.12, 0.12); this.beginPhase(0); }));
    }
    beginPhase(i) {
      const b = this.boss; b.phase = i; b.hp = b.hpMax; b.show = 1; b.inv = false; b.atk = {}; b.t = 0; S.audio.intensity = i;
      if (b.id === 'ocd') { this.timers.urge = 1; }
      b.sp.setFrame(i * 2); this.state = 'boss';
      if (b.id === 'crowd' && i > 0) this.makeMasks(4 + i);
      if (b.id === 'crowd' && i >= 1) this.spot = { phase: 0, speed: 0.55 + 0.15 * i, half: 26, off: 0, rate: 6 };
      if (this.mastery) b.quizT = 3;
      this.spawnClock = 3; this.budget = 0;
    }
    makeMasks(n) { (this.masks || []).forEach(m => m.sp.destroy()); this.masks = []; for (let i = 0; i < n; i++) this.masks.push({ x: this.boss.x, y: this.boss.y, a: i * Math.PI * 2 / n, sp: this.add.image(this.boss.x, this.boss.y, 'crowd_minimask'), state: 'orbit', t: 0, stun: 0 }); }
    damageBoss(dmg, quiet) {
      const b = this.boss; if (!b || b.inv || this.state !== 'boss') return;
      b.hp -= dmg; b.sp.setTintFill(0xffffff); this.time.delayedCall(50, () => b.sp && b.sp.active && b.sp.clearTint());
      if (!quiet) { S.audio.sfx('bossHit'); this.dmgNum(b.x + this.rng.range(-10, 10), b.y - 30, dmg); }
      if (b.hp <= 0) this.phaseBreak();
    }
    phaseBreak() {
      const b = this.boss; b.hp = 0; b.inv = true;
      this.eb.slice().forEach(x => this.removeEB(x)); this.rings = []; this.warnings = []; this.clearUrges();
      if (this.beamOn) { this.beamOn = false; S.audio.sfx('beamOff'); }
      S.audio.sfx('phase'); this.shake(400, 0.008); this.hitstop = 0.15;
      if (!S.save.settings.reduceMotion) this.cameras.main.flash(300, 255, 255, 255, false);
      if (b.phase >= 2) { this.state = 'bossTalk'; this.time.delayedCall(400, () => this.bossCleared()); return; }
      this.state = 'bossTalk';
      this.tweens.add({ targets: b.sp, scaleX: 1.15, scaleY: 0.9, duration: 120, yoyo: true, repeat: 2 });
      const lines = this.mastery ? [[S.BOSS_INFO[b.id].boss, this.rng.pick(DLG[b.id].thoughts) + '!']] : DLG[b.id]['phase' + (b.phase + 2)];
      this.time.delayedCall(500, () => { b.sp.setFrame((b.phase + 1) * 2); this.dialogue.play(lines, () => this.beginPhase(b.phase + 1)); });
    }
    taunt() {
      const b = this.boss; const line = this.rng.pickNoRepeat(DLG[b.id].thoughts, 'taunt');
      const t = S.txt(this, clamp(b.x, 70, 410), b.y - 46, line, { size: 7, ox: 0.5, oy: 1, color: COL.ink, bg: '#f4e9cdee', depth: 9500 });
      this.tweens.add({ targets: t, y: t.y - 6, duration: 2400, onComplete: () => t.destroy() });
      this.time.delayedCall(1800, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 500 }); });
    }
    every(name, cd, fn) { const b = this.boss; if (b.atk[name] === undefined) b.atk[name] = cd * 0.5; b.atk[name] -= this.dtNow; if (b.atk[name] <= 0) { b.atk[name] = cd; fn(); } }
    aimAt(x, y) { return Math.atan2(this.player.y - 10 - y, this.player.x - x); }
    updateBoss(dt) {
      const b = this.boss, ph = b.phase, p = this.player; this.dtNow = dt; b.t += dt;
      const sp = 1 + 0.18 * ph;
      if (b.id === 'gloom') {
        b.x = 240 + Math.sin(b.t * 0.45) * 130; b.y = 116 + Math.sin(b.t * 1.3) * 6;
        this.every('rain', 4.6 / sp, () => this.rainCurtain(80 + 15 * ph));
        this.every('tears', 2.4 / sp, () => { const n = ph === 0 ? 3 : 5, a0 = this.aimAt(b.x, b.y + 10), pk = ph >= 1 ? this.rng.int(0, n - 1) : -1; for (let i = 0; i < n; i++) this.fireEB(i === pk ? 'b_pink' : 'b_tear', b.x, b.y + 10, a0 + (i / (n - 1) - 0.5) * 0.5, 85 + 10 * ph, { r: 4, dmg: 10 }); });
        if (ph >= 2) {
          this.every('spiral', 6.5, () => { let a = 0; this.time.addEvent({ delay: 200, repeat: 11, callback: () => { if (this.state !== 'boss') return; for (let k = 0; k < 6; k++) this.fireEB('b_drop', b.x, b.y, a + k * Math.PI / 3, 68, { r: 3, dmg: 8 }); a += 0.33; } }); });
          this.every('bolt', 5, () => this.lightning(p.x, p.y));
        }
      } else if (b.id === 'deadline') {
        if (ph < 2) { b.x = 240 + Math.sin(b.t * 0.7) * 100; b.y = 116; }
        else this.every('hop', 4.2, () => this.hop());
        this.every('hands', 2.3 / sp, () => { const a0 = this.aimAt(b.x, b.y); [-0.18, 0.18].forEach(o => this.fireEB('b_hand', b.x, b.y, a0 + o, 120 + 10 * ph, { r: 4, dmg: 12, spin: 10 })); });
        this.every('tick', 4.2 / sp, () => { const gap = this.rng.int(0, 11); for (let k = 0; k < 12; k++) if (k !== gap && k !== (gap + 1) % 12) this.fireEB(k % 4 === 0 && ph >= 1 ? 'b_pink' : 'b_spark', b.x, b.y, k * Math.PI / 6 + b.t * 0.3, 70, { r: 3, dmg: 9 }); S.audio.sfx('blip', 1200); });
        if (ph >= 1) {
          this.every('minions', 7.5, () => { for (let k = 0; k < 3; k++) this.telegraphSpawn('en_sticky_note', this.randomFloor(60, 160)); });
          this.every('paper', 5.2, () => { for (let k = 0; k < 8; k++) { const x = this.rng.range(30, 450); this.time.delayedCall(k * 90, () => { if (this.state === 'boss') this.fireEB('b_note', x, 44, Math.PI / 2, 70 + this.rng.range(0, 20), { r: 3, dmg: 8, ignoreWalls: 0.5, spin: 3 }); }); } });
        }
        if (ph >= 2) this.every('alarm', 5.5, () => this.alarmRing());
      } else if (b.id === 'crowd') {
        b.x = 240 + Math.sin(b.t * 0.35) * 40; b.y = 112 + Math.sin(b.t * 1.1) * 4;
        this.updateMasks(dt);
        this.every('glance', 1.0 / sp, () => { const m = this.rng.pick(this.masks.filter(q => q.state === 'orbit' && q.stun <= 0)); if (m) this.fireEB('b_glance', m.x, m.y, this.aimAt(m.x, m.y), 95 + 10 * ph, { r: 3, dmg: 9 }); });
        if (ph >= 1) this.every('fan', 2.7 / sp, () => { const a0 = this.aimAt(b.x, b.y + 10); for (let i = 0; i < 5; i++) this.fireEB(i === 2 ? 'b_pink' : 'b_glance', b.x, b.y + 10, a0 + (i / 4 - 0.5) * 0.7, 90, { r: 3, dmg: 9 }); });
        if (ph >= 2) this.every('maskDash', 3.4, () => { const m = this.rng.pick(this.masks.filter(q => q.state === 'orbit')); if (m) { m.state = 'aim'; m.t = 0.7; m.tx = p.x; m.ty = p.y - 10; S.audio.sfx('warn'); } });
      } else if (b.id === 'ocd') {
        /* The Loop: snaps between fixed points; every attack repeats ("check again"). */
        const pts = [[150, 110], [330, 110], [330, 150], [150, 150]];
        b.slot = Math.floor(b.t / (2.8 - 0.4 * ph)) % 4; const tg = pts[b.slot];
        b.x += (tg[0] - b.x) * Math.min(1, dt * 5); b.y += (tg[1] - b.y) * Math.min(1, dt * 5);
        this.every('ring', 3.8 / sp, () => {
          const n = ph === 0 ? 8 : 10, pk = ph >= 1 ? this.rng.int(0, n - 1) : -1;
          const burst = () => { if (this.state !== 'boss') return; for (let k = 0; k < n; k++) this.fireEB(k === pk ? 'b_pink' : 'b_check', b.x, b.y, k * Math.PI * 2 / n, 72 + 8 * ph, { r: 3, dmg: 9, life: 4 }); S.audio.sfx('blip', 1000); };
          burst(); this.time.delayedCall(420, burst);
        });
        this.every('keys', 2.6 / sp, () => {
          const a0 = this.aimAt(b.x, b.y), fire = () => { if (this.state !== 'boss') return; [-0.22, 0, 0.22].forEach(o => this.fireEB('b_key', b.x, b.y, a0 + o, 125 + 10 * ph, { r: 3, dmg: 10, spin: 0 })); };
          fire(); this.time.delayedCall(350, fire);
        });
        this.every('urge', 5.5 - ph, () => this.spawnUrge(true));
        if (ph >= 1) this.every('count', 7, () => {
          [3, 6, 9].forEach((n, i) => this.time.delayedCall(i * 650, () => {
            if (this.state !== 'boss') return;
            this.floatText(b.x, b.y - 44, String(n), '#fff1a8');
            for (let k = 0; k < n; k++) this.fireEB('b_check', b.x, b.y, k * Math.PI * 2 / n + i * 0.2, 64, { r: 3, dmg: 8, life: 4 });
            S.audio.sfx('blip', 700 + i * 300);
          }));
        });
        if (ph >= 2) this.every('lines', 4.6, () => this.keyLines());
      }
      b.tauntT -= dt; if (b.tauntT <= 0) { b.tauntT = 6.5; this.taunt(); }
      if (this.mastery) { b.quizT -= dt; if (b.quizT <= 0) this.openQuiz(); }
      if (!this.boss) return;
      const bob = Math.floor(b.t * 3) % 2;
      b.sp.setFrame(b.phase * 2 + bob).setPosition(Math.round(b.x), Math.round(b.y)).setDepth(b.y + 30);
      b.sh.setPosition(b.x, b.y + 34);
      if ((p.x - b.x) ** 2 + (p.y - 10 - b.y) ** 2 < (b.r + 4) ** 2) this.hurt(15, 6, b.x, b.y);
    }
    keyLines() {
      const p = this.player, vertical = this.rng.next() < 0.5, pos = vertical ? p.x : p.y - 8;
      const w = { line: true, vertical, pos }; this.warnings.push(w); S.audio.sfx('warn');
      this.time.delayedCall(950, () => {
        const i = this.warnings.indexOf(w); if (i < 0 || this.state !== 'boss') return; this.warnings.splice(i, 1);
        S.audio.sfx('boom'); this.shake(100, 0.004);
        for (let k = 0; k < 10; k++) this.time.delayedCall(k * 45, () => {
          if (this.state !== 'boss') return;
          if (vertical) this.fireEB('b_key', pos + this.rng.range(-3, 3), 40, Math.PI / 2, 240, { r: 3, dmg: 10, ignoreWalls: 0.5, life: 2 });
          else this.fireEB('b_key', 20, pos + this.rng.range(-3, 3), 0, 260, { r: 3, dmg: 10, ignoreWalls: 0.5, life: 2 });
        });
      });
    }
    rainCurtain(speed) {
      const gapX = this.rng.range(60, 420), gapW = 46;
      for (let x = 24; x < 460; x += 17) {
        if (Math.abs(x - gapX) < gapW / 2) continue;
        const dl = this.rng.range(0, 350);
        this.time.delayedCall(dl, () => { if (this.state === 'boss') this.fireEB('b_drop', x, 40, Math.PI / 2, speed, { r: 3, dmg: 8, ignoreWalls: 0.6, life: 4 }); });
      }
      this.telegraph(gapX, 150, 'Gap here', 0.9);
    }
    telegraph(x, y, label, dur) {
      const t = S.txt(this, x, y, label, { size: 6, ox: 0.5, color: COL.sky, bg: '#14102aaa', depth: 9400 });
      this.tweens.add({ targets: t, alpha: 0, duration: dur * 1000, delay: 300, onComplete: () => t.destroy() });
    }
    lightning(x, y) {
      const w = { x, y: y - 4 }; this.warnings.push(w); S.audio.sfx('warn');
      this.time.delayedCall(900, () => {
        const i = this.warnings.indexOf(w); if (i < 0 || this.state !== 'boss') return; this.warnings.splice(i, 1);
        S.audio.sfx('boom'); this.shake(120, 0.006);
        const f = this.add.rectangle(w.x, w.y - 80, 6, 160, 0xffe594, 0.9).setDepth(9200); this.tweens.add({ targets: f, alpha: 0, scaleX: 3, duration: 250, onComplete: () => f.destroy() });
        this.impact(w.x, w.y, 2);
        if ((this.player.x - w.x) ** 2 + (this.player.y - w.y) ** 2 < 18 * 18) this.hurt(14, 8, w.x, w.y);
      });
    }
    hop() {
      const b = this.boss, tgt = this.randomFloor(40, 150); tgt.y = clamp(tgt.y - 30, 80, 230);
      const w = { x: tgt.x, y: tgt.y + 34, big: true }; this.warnings.push(w); S.audio.sfx('warn');
      this.tweens.add({ targets: b, x: tgt.x, y: tgt.y, duration: 750, ease: 'Sine.easeInOut' });
      this.tweens.add({ targets: b.sp, scaleY: 1.2, duration: 375, yoyo: true });
      this.time.delayedCall(760, () => {
        const i = this.warnings.indexOf(w); if (i < 0 || this.state !== 'boss') return; this.warnings.splice(i, 1);
        S.audio.sfx('boom'); this.shake(160, 0.007); this.ring(b.x, b.y + 30, 40, 0xf2c14e, 400, 3);
        if ((this.player.x - b.x) ** 2 + (this.player.y - b.y - 30) ** 2 < 40 * 40) this.hurt(14, 8, b.x, b.y);
        for (let k = 0; k < 8; k++) this.fireEB('b_spark', b.x, b.y + 20, k * Math.PI / 4, 75, { r: 3, dmg: 8 });
      });
    }
    alarmRing() {
      const b = this.boss; S.audio.sfx('warn');
      this.tweens.add({ targets: b.sp, angle: { from: -8, to: 8 }, duration: 60, yoyo: true, repeat: 4, onComplete: () => b.sp.setAngle(0) });
      this.time.delayedCall(500, () => { if (this.state !== 'boss') return; this.rings.push({ x: b.x, y: b.y, r: 10, gap: this.aimAt(b.x, b.y) + this.rng.pick([-1, 1]) * this.rng.range(0.6, 1.4), gw: 0.8, hit: false }); S.audio.sfx('boom'); });
    }
    updateRings(dt) {
      const p = this.player, py = p.y - 10;
      for (const r of this.rings.slice()) {
        r.r += 105 * dt; if (r.r > 380) { this.rings.splice(this.rings.indexOf(r), 1); continue; }
        const dist = Math.hypot(p.x - r.x, py - r.y), a = Math.atan2(py - r.y, p.x - r.x);
        if (!r.hit && Math.abs(dist - r.r) < 5 && Math.abs(angDiff(a, r.gap)) > r.gw / 2) { r.hit = true; this.hurt(12, 8, r.x, r.y); }
      }
    }
    updateMasks(dt) {
      const b = this.boss, p = this.player;
      this.masks.forEach(m => {
        m.stun = Math.max(0, m.stun - dt);
        if (m.state === 'orbit') { m.a += (0.9 + 0.2 * b.phase) * dt; const tx = b.x + Math.cos(m.a) * 44, ty = b.y + Math.sin(m.a) * 30; m.x += (tx - m.x) * Math.min(1, dt * 6); m.y += (ty - m.y) * Math.min(1, dt * 6); }
        else if (m.state === 'aim') { m.t -= dt; if (m.t <= 0) { m.state = 'dash'; m.t = 0.85; const a = Math.atan2(m.ty - m.y, m.tx - m.x); m.vx = Math.cos(a) * 250; m.vy = Math.sin(a) * 250; S.audio.sfx('dash'); } }
        else if (m.state === 'dash') { m.x += m.vx * dt; m.y += m.vy * dt; m.t -= dt; if (m.t <= 0) m.state = 'orbit'; }
        m.sp.setPosition(Math.round(m.x), Math.round(m.y)).setDepth(m.y + 20).setAlpha(m.stun > 0 ? 0.5 : 1).setAngle(m.state === 'dash' ? this.t * 900 : 0);
        if (m.stun <= 0 && (p.x - m.x) ** 2 + (p.y - 10 - m.y) ** 2 < 100) this.hurt(m.state === 'dash' ? 12 : 9, 6, m.x, m.y);
      });
    }
    bossCleared() {
      if (this.state === 'bossDone') return;
      this.state = 'bossDone';
      const b = this.boss, id = b.id, st = S.save.bosses[id];
      S.audio.sfx('bossClear'); S.audio.sfx('chargeStop'); this.charging = false; this.clearUrges(); this.clearWebs(); S.audio.intensity = 0; S.audio.music(this.roomId);
      this.eb.slice().forEach(x => this.removeEB(x)); this.rings = []; this.warnings = [];
      this.enemies.slice().forEach(e => this.killEnemy(e, false)); this.pending.forEach(p => p.portal.destroy()); this.pending = [];
      (this.masks || []).forEach(m => this.tweens.add({ targets: m.sp, alpha: 0, scale: 1.6, duration: 600, onComplete: () => m.sp.destroy() })); this.masks = null;
      for (let k = 0; k < 14; k++) this.time.delayedCall(k * 60, () => this.impact(b.x + this.rng.range(-26, 26), b.y + this.rng.range(-26, 26), 1.6));
      this.tweens.add({ targets: [b.sp, b.sh], alpha: 0, duration: 1100, delay: 500 });
      this.tweens.add({ targets: b.sp, scale: 1.3, duration: 1100, delay: 500 });
      this.spot = null;
      const firstClear = st.state !== 'cleared'; let lines;
      if (this.mastery) {
        const stars = b.correct >= 6 ? 3 : b.correct >= 4 ? 2 : b.correct >= 2 ? 1 : 0;
        const before = st.stars; st.stars = Math.max(st.stars, stars); this.earn(20 + 3 * b.correct);
        lines = [['Lumi', `You answered ${b.correct} of ${b.asked} right. ${stars} star${stars === 1 ? '' : 's'}${st.stars > before ? ', a new best' : ''}.`], ['Lumi', b.correct >= 4 ? 'You know the difference between a myth and a fact. That matters.' : 'Every Letter is in the Library if you want another look.']];
      } else { this.earn(30); lines = DLG[id].cleared.slice(); if (firstClear) st.state = 'cleared'; }
      this.heal(40); S.persist(); this.recordBest();
      this.time.delayedCall(1700, () => this.dialogue.play(lines, () => {
        b.sp.destroy(); b.sh.destroy();
        if (!this.mastery && firstClear) this.letterPrompt(id, () => this.afterBoss()); else this.afterBoss();
      }));
    }
    letterPrompt(id, next) {
      S.audio.sfx('unlock');
      const c = this.add.container(0, 0);
      c.add(this.add.rectangle(160, 90, 320, 180, 0x0f0e1c, 0.65)); c.add(S.panel(this, 80, 46, 160, 86));
      c.add(this.add.image(160, 64, 'ui_letter').setScale(2));
      c.add(S.txt(this, 160, 80, 'Letter unlocked', { size: 8, title: true, ox: 0.5, color: COL.blue, shadow: false }));
      c.add(S.txt(this, 160, 92, `${S.BOSS_INFO[id].lib}: now in your Library`, { size: 7, ox: 0.5, color: COL.slate, shadow: false }));
      this.nav = new S.Nav(this); this.nav.ring.setScrollFactor(0);
      const close = () => { this.killNav(); c.destroy(); this.modal = null; next(); };
      const b1 = S.button(this, 90, 108, 70, 18, 'Read now', () => S.openLetter(id, close), { size: 7, icon: 'ui_letter' });
      const b2 = S.button(this, 164, 108, 66, 18, 'Later', close, { size: 7 });
      c.add([b1, b2]); this.H(c); this.modal = { keys: {} }; this.nav.focus(b1);
    }
    afterBoss() {
      this.boss = null; this.mastery = false;
      if (this.challenge) { this.endRun(true); return; }
      this.openUpgrade(() => this.travel());
    }

    /* ---------------- mastery quiz */
    openQuiz() {
      const b = this.boss; if (!b || this.modal || this.dialogue.active) { if (b) b.quizT = 1; return; }
      if (!b.qPool.length) { const L = CONTENT.LETTERS[b.id].blocks[1]; b.qPool = this.rng.shuffle(L.myths.map(m => ({ text: m.m, myth: true, explain: m.f, c: m.c })).concat(L.facts.map(f => ({ text: f.t, myth: false, explain: f.t, c: f.c })))); }
      const q = b.qPool.pop(); b.asked++; b.quizT = 13;
      if (this.beamOn) { this.beamOn = false; S.audio.sfx('beamOff'); }
      S.audio.sfx('letter');
      const c = this.add.container(0, 0);
      c.add(this.add.rectangle(160, 90, 320, 180, 0x0f0e1c, 0.7)); c.add(S.panel(this, 50, 40, 220, 104));
      c.add(S.txt(this, 160, 47, 'Myth or Fact?', { size: 8, title: true, ox: 0.5, color: COL.blue, shadow: false }));
      c.add(S.txt(this, 160, 62, `"${q.text}"`, { size: 8, ox: 0.5, color: COL.ink, shadow: false, wrap: 200, align: 'center' }));
      this.nav = new S.Nav(this); this.nav.ring.setScrollFactor(0);
      let done = false;
      const answer = (saidMyth) => {
        if (done) return; done = true;
        const right = saidMyth === q.myth, m = S.letterModel(b.id);
        const srcName = [...new Set(q.c.map(cid => CONTENT.SOURCES[CONTENT.CLAIMS[cid].src].short))].join(', ');
        bm.destroy(); bf.destroy(); this.killNav();
        const body = q.myth ? `That one is a myth. ${q.explain}` : `That one is a fact. ${q.explain}`;
        const add = [
          S.txt(this, 160, 88, right ? 'Correct!' : 'Not quite.', { size: 8, title: true, ox: 0.5, color: right ? '#3f8f4a' : COL.red, shadow: false }),
          S.txt(this, 160, 101, body, { size: 7, ox: 0.5, color: COL.ink, shadow: false, wrap: 200, align: 'center' }),
          S.txt(this, 160, 140, `Source: ${srcName} · from your ${m.L.title} Letter`, { size: 6, ox: 0.5, oy: 1, color: COL.slate, shadow: false })
        ];
        add.forEach(o => { S.fixSF(o); c.add(o); });
        if (right) { b.correct++; S.audio.sfx('correct'); } else S.audio.sfx('miss');
        this.time.delayedCall(right ? 1800 : 2800, () => {
          c.destroy(); this.modal = null;
          if (right && this.boss === b && this.state === 'boss') { this.damageBoss(b.hpMax * 0.35); this.shake(200, 0.006); this.floatText(b.x, b.y - 50, 'Truth hits hard!', COL.gold); }
        });
      };
      const bm = S.button(this, 70, 116, 84, 20, 'Myth  [1]', () => answer(true), { size: 8 });
      const bf = S.button(this, 166, 116, 84, 20, 'Fact  [2]', () => answer(false), { size: 8 });
      bm.bg.setTint(0xf0a0c0); bf.bg.setTint(0xa8d4f2);
      c.add([bm, bf]); this.H(c);
      this.modal = { keys: { '1': () => answer(true), '2': () => answer(false) } }; this.nav.focus(bm);
    }

    /* ---------------- travel between rooms: iris close, journey map with blooming nodes, iris open */
    iris(close, ms, done) {
      const g = this.H(this.add.graphics()), o = { r: close ? 200 : 0 };
      const draw = () => { g.clear(); g.lineStyle(640, 0x0b0916, 1).strokeCircle(160, 90, o.r + 320); g.lineStyle(2, 0xf7a8c4, o.r > 2 && o.r < 190 ? 0.8 : 0).strokeCircle(160, 90, o.r); };
      draw();
      this.tweens.add({ targets: o, r: close ? 0 : 200, duration: ms, ease: close ? 'Cubic.easeIn' : 'Cubic.easeOut', onUpdate: draw, onComplete: () => { if (close) done && done(g); else { g.destroy(); done && done(); } } });
      return g;
    }
    travel() {
      this.state = 'travel';
      let next = this.roomIdx + 1, order = this.order, wrap = false;
      if (next >= order.length) { order = this.rng.shuffle(ALL_ROOMS.slice()); next = 0; wrap = true; }
      const toId = order[next], rm = S.save.settings.reduceMotion;
      S.audio.sfx('whoosh');
      this.iris(true, rm ? 10 : 550, (cover) => {
        const c = this.add.container(0, 0);
        c.add(this.add.image(160, 90, 'journey_bg'));
        const P = [[28, 152], [50, 138], [66, 134], [100, 133], [122, 135], [140, 141], [160, 150], [175, 143], [195, 133], [225, 129], [255, 129], [270, 133], [290, 146]];
        const segL = []; let tot = 0; for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); segL.push(l); tot += l; }
        const at = (f) => { let d = clamp(f, 0, 1) * tot; for (let i = 0; i < segL.length; i++) { if (d <= segL[i]) { const k = d / segL[i]; return [P[i][0] + (P[i + 1][0] - P[i][0]) * k, P[i][1] + (P[i + 1][1] - P[i][1]) * k]; } d -= segL[i]; } return P[P.length - 1]; };
        const n = Math.max(2, order.length), fOf = (i) => 0.06 + 0.88 * i / (n - 1);
        order.forEach((id, i) => {
          const [x, y] = at(fOf(i)), done = wrap ? false : i <= this.roomIdx;
          const nd = this.add.image(x, y, done ? 'node_bloom' : 'node_bud').setOrigin(0.5, 1); c.add(nd);
          c.add(S.txt(this, x, y + 2, ROOMS[id].name.replace('The ', ''), { size: 5, ox: 0.5, color: i === next ? '#fff1a8' : '#9b8fbf' }));
          if (i === next) { nd.setData('dest', true); this.destNode = nd; const gl = this.add.image(x, y - 8, 'glow_pink').setBlendMode(Phaser.BlendModes.ADD).setScale(0.5).setAlpha(0.5); c.addAt(gl, 1); if (!rm) this.tweens.add({ targets: gl, alpha: 0.9, scale: 0.65, duration: 600, yoyo: true, repeat: -1 }); }
        });
        const f0 = wrap ? 0 : fOf(this.roomIdx), f1 = fOf(next);
        const walker = S.buildPlayer2(this, at(f0)[0], at(f0)[1] - 2, S.save.player || S.defaultLook(), 1); c.add(walker);
        const lumi = this.add.image(at(f0)[0] - 8, at(f0)[1] - 18, 'companion_orb').setTint(S.lumiTint()); c.add(lumi);
        /* next-room card */
        const card = this.add.container(400, 40); c.add(card);
        card.add(this.add.nineslice(0, 0, 'ui2_panel_dark', null, 128, 72, 8, 8, 8, 8));
        card.add(this.add.image(0, -6, ROOMS[toId].thumb).setDisplaySize(112, 48));
        card.add(S.txt(this, 0, 22, (wrap ? 'A new loop: ' : 'Next: ') + ROOMS[toId].name, { size: 6, ox: 0.5, oy: 0.5, color: '#fff6d8' }));
        const tip = S.randomNote(toId);
        const tipT = S.txt(this, 160, 176, tip ? tip.text.slice(0, 110) + (tip.text.length > 110 ? '...' : '') : '', { size: 5, ox: 0.5, oy: 1, color: '#d9c8ff', wrap: 300, align: 'center' }); c.add(tipT);
        this.H(c); cover.setDepth(1); this.hud.bringToTop(cover); cover.destroy();
        this.iris(false, rm ? 10 : 450);
        this.tweens.add({ targets: card, x: 236, duration: 600, delay: 250, ease: 'Back.easeOut' });
        const o = { f: f0 }; let wf = 0, lastPetal = 0;
        this.tweens.add({ targets: o, f: f1, duration: rm ? 300 : 1900, delay: 350, ease: 'Sine.easeInOut',
          onUpdate: () => {
            const [x, y] = at(o.f), [x2] = at(o.f + 0.01); walker.setPosition(x, y - 2); walker.scaleX = x2 < x ? -1 : 1;
            wf += 0.25; walker.setPlayerFrame(8 + (Math.floor(wf) % 4));
            lumi.setPosition(x - 8 * walker.scaleX, y - 18 + Math.sin(wf) * 2);
            if (wf - lastPetal > 1.5) { lastPetal = wf; const pt = this.add.image(x, y - 4, 'p_petal', Math.floor(wf) % 4); c.add(pt); this.tweens.add({ targets: pt, y: y + 6, x: x - 8, alpha: 0, angle: 180, duration: 700, onComplete: () => pt.destroy() }); }
          },
          onComplete: () => {
            walker.setPlayerFrame(0);
            if (this.destNode) { const d = this.destNode; this.tweens.add({ targets: d, scale: 1.5, duration: 160, yoyo: true, onYoyo: () => d.setTexture('node_bloom') }); S.audio.sfx('bloom'); for (let k = 0; k < 10; k++) { const pt = this.add.image(d.x, d.y - 10, 'p_mote').setBlendMode(Phaser.BlendModes.ADD).setTint(0xf7a8c4); c.add(pt); const a = Math.random() * 6.28; this.tweens.add({ targets: pt, x: d.x + Math.cos(a) * 16, y: d.y - 10 + Math.sin(a) * 12, alpha: 0, duration: 600, onComplete: () => pt.destroy() }); } }
          } });
        this.time.delayedCall(rm ? 400 : 1200, () => { this.order = order; this.roomIdx = next; this.roomsReached++; this.waveInRoom = 0; this.buildRoom(toId); this.recordBest(); });
        this.time.delayedCall(rm ? 900 : 3100, () => this.iris(true, rm ? 10 : 450, (cv) => {
          c.destroy(); this.destNode = null;
          this.iris(false, rm ? 10 : 500, () => { this.banner(`Room ${this.roomsReached}: ${this.room.name}`, 'New room, new stressors.'); this.time.delayedCall(900, () => this.startWave()); });
          cv.destroy();
        }));
      });
    }

    /* ====================================================== fx helpers */
    shake(ms, k) { if (!S.save.settings.reduceMotion) this.cameras.main.shake(ms, k); }
    setDesat(a) { if (!this.colorFx) return; this.colorFx.reset(); if (a > 0.01) this.colorFx.saturate(-a); }
    ring(x, y, r, color, ms, w) {
      const o = { r: 2, a: 1 }; const g = this.add.graphics().setDepth(8500);
      this.tweens.add({ targets: o, r, a: 0, duration: ms, ease: 'Sine.easeOut', onUpdate: () => { g.clear(); g.lineStyle(w || 1, color, o.a).strokeCircle(x, y, o.r); }, onComplete: () => g.destroy() });
    }
    floatText(x, y, str, color) {
      const t = S.txt(this, x, y, str, { size: 6, ox: 0.5, color: color || COL.cream, depth: 9600 });
      this.tweens.add({ targets: t, y: y - 12, alpha: 0, duration: 1000, onComplete: () => t.destroy() });
    }
    dmgNum(x, y, n) {
      if (this.fxList.length > 24) return;
      const t = S.txt(this, x + this.rng.range(-4, 4), y, String(Math.round(n * 10) / 10), { size: 6, ox: 0.5, color: COL.white, depth: 9600 });
      this.fxList.push(t);
      this.tweens.add({ targets: t, y: y - 10, alpha: 0, duration: 520, onComplete: () => { t.destroy(); this.fxList.splice(this.fxList.indexOf(t), 1); } });
    }
    spotGeom() { const s = this.spot; return { sx: 240 + 60 * Math.sin(this.t * s.speed * 0.5 + s.phase), sy: 40, gx: 240 + 190 * Math.sin(this.t * s.speed + s.phase), gy: 280, half: s.half }; }
    inSpot(p) {
      if (!this.spot || this.spot.off > 0) return false;
      const g = this.spotGeom(), f = (p.y - g.sy) / (g.gy - g.sy); if (f < 0) return false;
      return Math.abs(p.x - (g.sx + (g.gx - g.sx) * f)) < g.half * 1.3 * f + 2;
    }
    drawWorld(dt) {
      const g = this.worldG, f = this.fxG, p = this.player; g.clear(); f.clear();
      if (this.spot) {
        this.spot.off = Math.max(0, this.spot.off - dt);
        if (this.spot.off <= 0) { const s = this.spotGeom(); g.fillStyle(0xfff0b4, this.inSpot(p) ? 0.3 : 0.16); g.fillTriangle(s.sx, s.sy, s.gx - s.half * 1.3, s.gy, s.gx + s.half * 1.3, s.gy); }
      }
      this.warnings.forEach(w => { const k = 0.5 + 0.5 * Math.sin(this.t * 20); if (w.line) { g.fillStyle(0xff6680, 0.12 + 0.12 * k); if (w.vertical) g.fillRect(w.pos - 5, 30, 10, this.roomH - 40); else g.fillRect(16, w.pos - 5, this.roomW - 32, 10); return; } const W = w.big ? 80 : 36, Hh = w.big ? 30 : 14; g.lineStyle(1, 0xff6680, 0.6 + 0.4 * k).strokeEllipse(w.x, w.y, W, Hh); g.fillStyle(0xff6680, 0.15).fillEllipse(w.x, w.y, W, Hh); });
      (this.masks || []).forEach(m => { if (m.state === 'aim') f.lineStyle(1, 0xff6680, 0.7).lineBetween(m.x, m.y, m.tx, m.ty); });
      this.rings.forEach(r => {
        f.lineStyle(3, 0xf2c14e, 0.85); const steps = 48;
        for (let i = 0; i < steps; i++) { const a0 = i / steps * Math.PI * 2, a1 = (i + 1) / steps * Math.PI * 2; if (Math.abs(angDiff((a0 + a1) / 2, r.gap)) < r.gw / 2) continue; f.beginPath(); f.arc(r.x, r.y, r.r, a0, a1); f.strokePath(); }
      });
      if (this.beamOn && this.beam) {
        const bm = this.beam, w = bm.width;
        f.lineStyle(w * 2 + 2, 0xf2c14e, 0.25).lineBetween(bm.mx, bm.my, bm.ex, bm.ey);
        f.lineStyle(w, 0xffe594, 0.8).lineBetween(bm.mx, bm.my, bm.ex, bm.ey);
        f.lineStyle(Math.max(1, w / 3), 0xffffff, 1).lineBetween(bm.mx, bm.my, bm.ex, bm.ey);
        f.fillStyle(0xffffff, 0.8).fillCircle(bm.ex, bm.ey, w * 0.8 + Math.sin(this.t * 40));
      }
      if (this.charging) { const k = this.chargeT / this.chargeDur; f.lineStyle(1, 0x8fc1e3, 0.9).strokeCircle(p.x, p.y - 10, 30 - 20 * k); f.lineStyle(2, 0xf2f4fa, 0.6).beginPath(); f.arc(p.x, p.y - 10, 15, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); f.strokePath(); }
      this.enemies.forEach(e => { if (e.showBar <= 0 || e.hp >= e.hpMax) return; const w = 14, x = e.x - w / 2, y = e.y - e.sp.height - 3; f.fillStyle(0x0f0e1c, 0.9).fillRect(x - 1, y - 1, w + 2, 4); f.fillStyle(0x5a1a2e, 1).fillRect(x, y, w, 2); f.fillStyle(0xe85a7a, 1).fillRect(x, y, Math.max(1, Math.round(w * e.hp / e.hpMax)), 2); });
    }

    /* ====================================================== loop */
    update(time, deltaMs) {
      const dt = Math.min(0.05, deltaMs / 1000);
      if (this.paused || S.overlayOpen || this.state === 'ended') return;
      this.t += dt;
      if (this.hitstop > 0) { this.hitstop -= dt; this.updateHud(); return; }
      const active = this.state === 'wave' || this.state === 'boss';
      const frozen = this.dialogue.active || !!this.modal || !active;
      this.animatePlayer(dt);
      if (!frozen) {
        for (const k of ['fire', 'staff', 'dash', 'breatheCd', 'inv', 'stressToast', 'overToast', 'orbStreakT']) this.timers[k] = Math.max(0, this.timers[k] - dt);
        this.timers.noHit += dt;
        this.movePlayer(dt); this.updateBreathe(dt); this.updateFire(dt);
        this.updateShots(dt); this.updatePending(dt); this.spawning(dt); this.updateEnemies(dt); this.updateEB(dt); this.updateRings(dt);
        this.updateHabits(dt); this.updatePickups(dt); this.updateUrges(dt); this.updateWebs(dt);
        if (this.state === 'boss' && this.boss) this.updateBoss(dt);
        if (this.state !== 'ended') this.updateStress(dt);
        if (this.state === 'wave') { this.waveT += dt; if ((this.budget <= 0 && this.enemies.length === 0 && this.pending.length === 0) || this.waveT > 45) this.waveDone(); }
      } else if (this.beamOn) { this.beamOn = false; S.audio.sfx('beamOff'); }
      this.updateAmbience(dt); this.drawWorld(dt); this.updateHud();
    }

    endRun(challengeDone) {
      if (this.state === 'ended') return; S.audio.intensity = 0;
      this.state = 'ended'; S.audio.sfx('chargeStop'); S.audio.sfx('beamOff'); this.charging = false;
      this.recordBest(); S.persist();
      const better = this.globalWave > this.startBest.wave || this.roomsReached > this.startBest.room;
      const data = { wave: this.globalWave, room: this.roomsReached, gold: this.goldEarned, better, challenge: this.challenge, challengeDone };
      if (!challengeDone) {
        this.setDesat(0);
        const veil = this.H(this.add.rectangle(160, 90, 320, 180, 0xf4e9cd, 0)); this.tweens.add({ targets: veil, fillAlpha: 0.55, duration: 600 });
        this.H(S.txt(this, 160, 84, 'Time to rest. Take a breath.', { size: 8, title: true, ox: 0.5, color: COL.ink, shadow: false }));
        this.time.delayedCall(1300, () => S.fadeTo(this, 'Results', data));
      } else S.fadeTo(this, 'Results', data);
    }
    debugSkip() {
      if (this.state === 'wave') { this.enemies.slice().forEach(e => this.killEnemy(e, false)); this.pending.forEach(p => p.portal.destroy()); this.pending = []; this.waveInRoom = 3; this.state = 'between'; this.startBoss(); }
      else if (this.state === 'boss' && this.boss) this.damageBoss(this.boss.hp + 1, true);
    }
  }
  S.RunScene = Run;
})();
