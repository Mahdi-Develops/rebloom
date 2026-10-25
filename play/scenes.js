/* ReBloom, menu scenes. */
(function () {
  const S = window.SANC, CONTENT = window.SANCTUARY_CONTENT, COL = S.COL;
  const BOSSES = ['gloom', 'deadline', 'crowd', 'ocd'];
  S.BOSS_INFO = {
    gloom: { boss: 'The Gloom', lib: 'Depression', room: 'The Rainy Room', sprite: 'boss_gloom', sil: 'boss_gloom_sil', card: 'boss_gloom_card', hint: 'A heavy raincloud. Lives in the Rainy Room.' },
    deadline: { boss: 'The Deadline', lib: 'Stress and Burnout', room: 'The Overflowing Desk', sprite: 'boss_deadline', sil: 'boss_deadline_sil', card: 'boss_deadline_card', hint: 'A clock that never stops. Lives at the Desk.' },
    crowd: { boss: 'The Crowd', lib: 'Anxiety', room: 'The Empty Theatre', sprite: 'boss_crowd', sil: 'boss_crowd_sil', card: 'boss_crowd_card', hint: 'A ring of watching masks. Lives in the Theatre.' },
    ocd: { boss: 'The Loop', lib: 'OCD', room: 'The Perfect Room', sprite: 'boss_ocd', sil: 'boss_ocd_sil', card: 'boss_ocd_card', hint: 'A padlock that checks everything twice.' }
  };

  /* Shared dreamy backdrop: parallax sky, hills, flowers, fireflies. Used by loading + title. */
  S.dreamBackdrop = (scene, opts = {}) => {
    const rm = S.save.settings.reduceMotion;
    scene.add.image(160, 90, 'ld_sky');
    const layers = [['ld_hills1', 0.05], ['ld_hills2', 0.12], ['ld_hills3', 0.22]].map(([k, sp]) => ({ t: scene.add.tileSprite(160, 90, 320, 180, k), sp }));
    const flowers = scene.add.tileSprite(160, 180 - 23, 320, 46, 'ld_flowers'); layers.push({ t: flowers, sp: 0.35 });
    const flies = [];
    for (let i = 0; i < 18; i++) {
      const f = scene.add.image(Math.random() * 320, 70 + Math.random() * 100, 'p_mote').setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.2 + Math.random() * 0.8);
      f.vx = (Math.random() - 0.5) * 6; f.vy = -2 - Math.random() * 5; f.ph = Math.random() * 6; flies.push(f);
    }
    const petals = [];
    if (opts.petals) for (let i = 0; i < 10; i++) { const p = scene.add.sprite(Math.random() * 340, Math.random() * 180, 'p_petal', i % 4).setAlpha(0.85); p.vx = -8 - Math.random() * 8; p.vy = 4 + Math.random() * 6; p.ph = Math.random() * 6; petals.push(p); }
    scene.events.on('update', (t, dt) => {
      if (rm) return; const k = dt / 1000;
      layers.forEach(L => { L.t.tilePositionX += L.sp * dt * 0.06; });
      flies.forEach(f => { f.ph += k * 2; f.x += (f.vx + Math.sin(f.ph) * 4) * k; f.y += f.vy * k; f.alpha = 0.35 + 0.6 * Math.abs(Math.sin(f.ph * 0.7)); if (f.y < 30) { f.y = 178; f.x = Math.random() * 320; } if (f.x < -4) f.x = 324; if (f.x > 324) f.x = -4; });
      petals.forEach(p => { p.ph += k * 3; p.x += p.vx * k; p.y += (p.vy + Math.sin(p.ph) * 6) * k; p.rotation += k * 1.5; if (p.y > 186 || p.x < -10) { p.x = 330; p.y = Math.random() * 120 - 10; } });
    });
    return { layers, flies };
  };

  S.randomNote = (room) => {
    const N = CONTENT.NOTES, ids = room ? N[room] : Object.values(N).flat();
    const id = ids[Math.floor(Math.random() * ids.length)], c = CONTENT.CLAIMS[id];
    if (!c) return null; const src = CONTENT.SOURCES[c.src];
    return { id, text: c.claim, src: src ? (src.short || src.publisher || src.title) : '' };
  };

  class Boot extends Phaser.Scene {
    constructor() { super('Boot'); }
    preload() {
      const L = { ld_sky: 'ui2/ld_sky.png', ld_hills1: 'ui2/ld_hills1.png', ld_hills2: 'ui2/ld_hills2.png', ld_hills3: 'ui2/ld_hills3.png', ld_flowers: 'ui2/ld_flowers.png', logo_rebloom: 'ui2/logo_rebloom.png', p_mote: 'fx/p_mote.png', glow_pink: 'fx/glow_pink.png' };
      Object.entries(L).forEach(([k, p]) => this.load.image(k, 'assets/' + p));
      this.load.spritesheet('bloom', 'assets/ui2/bloom.png', { frameWidth: 48, frameHeight: 48 });
      this.load.spritesheet('p_petal', 'assets/fx/p_petal.png', { frameWidth: 5, frameHeight: 4 });
    }
    create() { this.scene.start('Preload'); }
  }

  class Preload extends Phaser.Scene {
    constructor() { super('Preload'); }
    preload() {
      S.cam(this); this.t0 = Date.now();
      S.dreamBackdrop(this, { petals: false });
      const logo = this.add.image(160, 30, 'logo_rebloom').setScale(0.75);
      if (!S.save.settings.reduceMotion) this.tweens.add({ targets: logo, y: 27, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      const glow = this.add.image(160, 92, 'glow_pink').setScale(1.1).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.35);
      this.tweens.add({ targets: glow, scale: 1.35, alpha: 0.6, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.bloom = this.add.sprite(160, 96, 'bloom', 0).setScale(1.3);
      this.word = S.txt(this, 160, 124, 'Breathe in', { size: 7, ox: 0.5, color: '#f6e7c1', title: true });
      this.time.addEvent({ delay: 2200, loop: true, callback: () => { this.tweens.add({ targets: this.word, alpha: 0, duration: 250, yoyo: true, onYoyo: () => this.word.setText(this.word.text === 'Breathe in' ? 'Breathe out' : 'Breathe in') }); } });
      /* vine progress bar */
      this.vine = this.add.graphics(); this.prog = 0; this.shown = 0; this.leaves = [];
      const tipBox = this.add.rectangle(160, 162, 268, 26, 0x120c24, 0.72).setStrokeStyle(1, 0x4c3a74);
      S.txt(this, 30, 151, 'DID YOU KNOW?', { size: 6, color: '#f7a8c4', title: true });
      this.tip = S.txt(this, 30, 158, '', { size: 6, color: '#e9e2ff', wrap: 262, lineSpacing: 0 });
      const showTip = () => { const n = S.randomNote(); if (!n) return; this.tip.setAlpha(0).setText(n.text.length > 120 ? n.text.slice(0, n.text.lastIndexOf(' ', 117)) + '...' : n.text); this.tweens.add({ targets: this.tip, alpha: 1, duration: 400 }); };
      showTip(); this.time.addEvent({ delay: 3800, loop: true, callback: showTip });
      this.load.on('progress', v => { this.prog = v; });
      (window.SANCTUARY_ASSETS || []).forEach(a => { if (this.textures.exists(a.key)) return; if (a.fw) this.load.spritesheet(a.key, 'assets/' + a.path, { frameWidth: a.fw, frameHeight: a.fh }); else this.load.image(a.key, 'assets/' + a.path); });
      this.events.on('update', (t, dt) => this.drawVine(dt));
    }
    drawVine(dt) {
      const tgt = this.loaded ? 1 : this.prog * 0.92;
      this.shown += (tgt - this.shown) * Math.min(1, dt / 160);
      const g = this.vine, x0 = 80, w = 160, y = 138, len = w * this.shown;
      g.clear();
      g.fillStyle(0x1a1233, 0.8).fillRoundedRect(x0 - 4, y - 5, w + 8, 10, 4);
      g.lineStyle(1, 0x3d2f60, 1).strokeRoundedRect(x0 - 4, y - 5, w + 8, 10, 4);
      for (let i = 0; i <= len; i += 1) { const yy = y + Math.sin(i * 0.18) * 1.6; g.fillStyle(0x6fcf8f, 1).fillRect(x0 + i, yy - 0.5, 1, 2); }
      for (let i = 10; i < len; i += 14) { const up = (i / 14) % 2 < 1, yy = y + Math.sin(i * 0.18) * 1.6; g.fillStyle(0x9be3a6, 1).fillEllipse(x0 + i, yy + (up ? -2.5 : 2.5), 4, 2.4); }
      for (let i = 34; i < len; i += 40) { const yy = y + Math.sin(i * 0.18) * 1.6; g.fillStyle(0xf7a8c4, 1).fillCircle(x0 + i, yy, 1.8); g.fillStyle(0xfff1a8, 1).fillRect(x0 + i, yy, 1, 1); }
      if (len > 1) { const yy = y + Math.sin(len * 0.18) * 1.6; g.fillStyle(0xfff6d8, 0.9).fillCircle(x0 + len, yy, 1.6); }
      this.bloom.setFrame(Math.min(7, Math.floor(this.shown * 7.99)));
    }
    create() {
      const A = (key, end, rate, repeat) => { if (!this.anims.exists(key + '_a') && this.textures.exists(key)) this.anims.create({ key: key + '_a', frames: this.anims.generateFrameNumbers(key, { start: 0, end }), frameRate: rate, repeat }); };
      ['en_drifter', 'en_weight', 'en_sticky_note', 'en_alarm_clock', 'en_mail_stack', 'en_watcher_eye', 'en_whisper', 'en_padlock', 'en_switch', 'en_tally'].forEach(k => A(k, this.textures.get(k).frameTotal - 2, 7, -1));
      A('fx_muzzle', 2, 30, 0); A('fx_impact', 3, 28, 0); A('fx_poof', 4, 18, 0); A('fx_swing', 3, 26, 0); A('fx_portal', 3, 10, -1); A('orb', 3, 6, -1);
      A('urge_tile', 3, 6, -1); A('shot_net', 1, 10, -1);
      A('decor_lights', 1, 2, -1); A('decor_cat', 1, 1.2, -1); A('decor_record', 3, 8, -1); A('decor_fish', 2, 4, -1); A('decor_candles', 2, 6, -1);
      this.loaded = true;
      const wait = S.fastBoot ? 0 : Math.max(500, 1900 - (Date.now() - this.t0));
      this.time.delayedCall(wait, () => { this.cameras.main.fadeOut(350, 15, 12, 30); this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Title')); });
    }
  }

  class Title extends Phaser.Scene {
    constructor() { super('Title'); }
    create() {
      S.cam(this); S.fadeIn(this); S.audio.music('theme');
      const rm = S.save.settings.reduceMotion;
      S.dreamBackdrop(this, { petals: true });
      const glow = this.add.image(160, 108, 'glow_pink').setScale(1.5).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.35);
      const bl = this.add.sprite(160, 112, 'bloom', 7).setScale(1.2);
      const logo = this.add.image(160, 44, 'logo_rebloom').setScale(rm ? 1 : 0.2).setAlpha(rm ? 1 : 0);
      if (!rm) {
        this.tweens.add({ targets: logo, scale: 1, alpha: 1, duration: 900, ease: 'Back.easeOut' });
        this.tweens.add({ targets: logo, y: 41, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 900 });
        this.tweens.add({ targets: bl, scale: 1.28, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: glow, alpha: 0.6, scale: 1.75, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
      S.txt(this, 160, 72, 'a little game about minds that grow back', { size: 6, ox: 0.5, color: '#d9c8ff' });
      const p = S.txt(this, 160, 146, 'Press Space or tap to begin', { size: 7, ox: 0.5, color: '#fff6d8', bg: '#1a1233cc' });
      if (!rm) this.tweens.add({ targets: p, alpha: 0.45, duration: 900, yoyo: true, repeat: -1 });
      S.txt(this, 160, 176, 'For awareness only. Not a diagnosis or medical advice.', { size: 6, ox: 0.5, oy: 1, color: '#9b8fbf' });
      const go = () => {
        if (this._went || S.overlayOpen) return; this._went = true;
        S.audio.init(); S.audio.sfx('bloom'); S.audio.music('theme');
        if (!rm) { this.tweens.add({ targets: [logo, bl], scale: '+=0.15', duration: 250, yoyo: true }); this.cameras.main.flash(250, 255, 220, 240); }
        this.time.delayedCall(rm ? 0 : 260, () => S.fadeTo(this, S.save.player ? 'Hub' : 'Creator', { first: !S.save.player }));
      };
      this.input.keyboard.on('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') go(); });
      this.input.on('pointerup', go);
    }
  }

  /* ---------------- Character creator ---------------- */
  class Creator extends Phaser.Scene {
    constructor() { super('Creator'); }
    init(d) { this.first = !!(d && d.first); }
    create() {
      S.cam(this); S.fadeIn(this); S.audio.music('hub'); this.walkEv = null;
      this.nav = new S.Nav(this); this.dialogue = new S.Dialogue(this);
      this.look = Object.assign(S.defaultLook(), S.save.player || {});
      this.add.image(160, 90, 'screen_creator');
      S.txt(this, 160, 4, this.first ? 'Create your character' : 'Edit your character', { size: 8, ox: 0.5, title: true, color: COL.cream });
      this.preview = null; this.drawPreview();
      const rows = [
        ['Skin', 'skin', () => S.SKIN], ['Hair style', 'hair', () => [0, 1]], ['Hair colour', 'hairCol', () => S.hairColors()],
        ['Outfit', 'outfit', () => [0, 1]], ['Outfit colour', 'outfitCol', () => S.outfitColors()], ['Accessory', 'acc', () => S.ACC]
      ];
      this.valueTexts = {};
      rows.forEach(([label, key, list], i) => {
        const left = i < 3, x = left ? 8 : 222, y = 26 + (i % 3) * 32;
        S.panel(this, x, y, 90, 28).setAlpha(0.95);
        S.txt(this, x + 45, y + 3, label, { size: 7, ox: 0.5, color: COL.ink, shadow: false });
        const val = S.txt(this, x + 45, y + 14, '', { size: 7, ox: 0.5, color: COL.blue, shadow: false });
        this.valueTexts[key] = { val, list };
        const step = (d) => { const L = list(); let idx = L.indexOf(this.look[key]); idx = (idx + d + L.length) % L.length; if (idx < 0) idx = 0; this.look[key] = L[idx]; this.refresh(); };
        S.button(this, x + 2, y + 10, 16, 16, null, () => step(-1), { icon: 'ui_arrow_left', label: false });
        S.button(this, x + 72, y + 10, 16, 16, null, () => step(1), { icon: 'ui_arrow_right', label: false });
      });
      this.nameBtn = S.button(this, 110, 146, 100, 16, '', () => S.askName(this.look.name, (n) => { this.look.name = n; this.refresh(); }), { size: 7 });
      S.button(this, 238, 150, 74, 20, this.first ? 'Begin' : 'Save', () => this.done(), { size: 8 });
      if (!this.first) S.button(this, 8, 150, 60, 20, 'Back', () => S.fadeTo(this, 'Hub'), { size: 8 });
      this.refresh();
      if (this.first) this.time.delayedCall(250, () => this.dialogue.play(CONTENT.DIALOGUE.firstLaunch));
    }
    drawPreview() {
      if (this.preview) this.preview.destroy();
      this.preview = S.buildPlayer2(this, 160, 136, this.look, 4);
      if (!this.walkEv) { this.pf = 0; this.walkEv = this.time.addEvent({ delay: 170, loop: true, callback: () => { this.pf++; const dir = Math.floor(this.pf / 12) % 4; const d = [0, 2, 1, 2][dir]; if (this.preview) { this.preview.setPlayerFrame(d * 4 + (this.pf % 4)); this.preview.scaleX = dir === 3 ? -4 : 4; } } }); }
    }
    refresh() {
      const names = { hair: ['Short', 'Long'], outfit: ['Tee', 'Hoodie'], acc: { none: 'None', glasses: 'Glasses', scarf: 'Scarf' } };
      Object.entries(this.valueTexts).forEach(([k, { val, list }]) => {
        const L = list(); const i = Math.max(0, L.indexOf(this.look[k]));
        let s = (k === 'acc') ? names.acc[this.look.acc] : (k === 'hair' || k === 'outfit') ? names[k][this.look[k]] : `${i + 1} of ${L.length}`;
        val.setText(s);
        if (typeof this.look[k] === 'number' && k !== 'hair' && k !== 'outfit') val.setColor('#' + this.look[k].toString(16).padStart(6, '0')).setShadow(1, 1, '#1b1a2e', 0, false, true);
      });
      this.nameBtn.setLabel('Name: ' + this.look.name + '  (edit)');
      this.drawPreview();
    }
    done() { S.save.player = this.look; S.persist(); S.audio.sfx('upgrade'); S.fadeTo(this, 'Hub', { welcome: this.first }); }
  }

  /* ---------------- Hub ---------------- */
  class Hub extends Phaser.Scene {
    constructor() { super('Hub'); }
    init(d) { this.welcome = d && d.welcome; }
    create() {
      S.cam(this); S.fadeIn(this); S.audio.music('theme');
      const rm = S.save.settings.reduceMotion;
      this.nav = new S.Nav(this); this.dialogue = new S.Dialogue(this);
      this.add.image(160, 90, 'hub3');
      /* moonlight shaft through the window */
      const shaft = this.add.image(214, 132, 'glow_cool').setScale(2.2, 1.4).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.25);
      if (!rm) this.tweens.add({ targets: shaft, alpha: 0.4, duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      const legacy = { prop_lamp: 'decor_lamp', prop_mirror: 'decor_mirror', prop_coffee_cup: 'decor_drink' };
      S.save.equipped.decor = (S.save.equipped.decor || []).map(k => legacy[k] || k);
      const spots = {
        decor_painting: [62, 80], decor_mirror: [276, 74], decor_candles: [266, 87], decor_fish: [294, 87],
        decor_lamp: [128, 113], decor_drink: [146, 113], decor_cat: [70, 124],
        decor_beanbag: [112, 152], decor_record: [262, 150], decor_plant: [304, 152]
      };
      const glows = { decor_lamp: ['glow_warm', 128, 102, 0.9], decor_candles: ['glow_warm', 266, 80, 0.55], decor_fish: ['glow_mint', 294, 80, 0.35], decor_lights: null };
      const dec = S.save.equipped.decor, fresh = S.save.decorNew; this.decor = {};
      if (dec.includes('decor_lights')) {
        const L = this.add.sprite(160, 1, 'decor_lights', 0).setOrigin(0.5, 0); if (!rm) L.play('decor_lights_a');
        const lg = this.add.rectangle(160, 10, 320, 22, 0xffd27a, 0.06).setBlendMode(Phaser.BlendModes.ADD);
        if (!rm) this.tweens.add({ targets: lg, alpha: 0.12, duration: 1000, yoyo: true, repeat: -1 });
        this.decor.decor_lights = L;
      }
      dec.forEach(k => {
        const p = spots[k]; if (!p) return;
        const g = glows[k]; if (g) { const gl = this.add.image(g[1], g[2], g[0]).setBlendMode(Phaser.BlendModes.ADD).setAlpha(g[3] * 0.7); if (!rm) this.tweens.add({ targets: gl, alpha: g[3], scale: 1.08, duration: 1400 + Math.random() * 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); }
        const spr = this.add.sprite(p[0], p[1], k, 0).setOrigin(0.5, 1).setDepth(p[1]);
        if (this.anims.exists(k + '_a') && !rm) spr.play(k + '_a');
        spr.setInteractive({ useHandCursor: true }).on('pointerup', () => this.pokeDecor(k, spr));
        this.decor[k] = spr;
      });
      if (dec.includes('decor_record') && !rm) this.time.addEvent({ delay: 1400, loop: true, callback: () => this.floatNote(262, 132) });
      const look = S.save.player || S.defaultLook();
      const pl = S.buildPlayer2(this, 200, 152, look, 2).setDepth(152);
      const lumi = this.add.image(226, 108, 'companion_orb').setScale(2).setTint(S.lumiTint()).setDepth(200);
      const lglow = this.add.image(226, 108, 'glow_pink').setScale(0.4).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.5).setDepth(199);
      if (!rm) { this.tweens.add({ targets: [lumi, lglow], y: 101, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); this.tweens.add({ targets: pl, scaleY: 2.04, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); }
      lumi.setInteractive({ useHandCursor: true }).on('pointerup', () => this.lumiNote());
      this.hint = S.txt(this, 226, 90, 'tap me!', { size: 6, ox: 0.5, color: '#fff6d8', bg: '#1a1233cc' }).setDepth(201);
      if (!rm) this.tweens.add({ targets: this.hint, y: 86, duration: 700, yoyo: true, repeat: -1 });
      /* fresh decor placement */
      if (fresh && this.decor[fresh]) { this.time.delayedCall(350, () => this.placeAnim(this.decor[fresh])); S.save.decorNew = null; S.persist(); }
      /* header */
      this.add.nineslice(3, 3, 'ui2_panel_dark', null, 132, 46, 8, 8, 8, 8).setOrigin(0).setAlpha(0.92).setDepth(300);
      this.add.image(8, 5, 'logo_rebloom_small').setOrigin(0).setScale(0.55).setDepth(301);
      S.txt(this, 9, 29, `${look.name}  ·  Best: room ${S.save.bestRoom || 0}, wave ${S.save.bestWave || 0}`, { size: 6, color: '#bfe3ff' }).setDepth(301);
      const tool = CONTENT.TOOLS[S.save.equippedTool];
      this.add.image(13, 42, tool.icon).setScale(0.6).setDepth(301);
      S.txt(this, 20, 38, tool.name, { size: 6, color: '#fff6d8' }).setDepth(301);
      this.add.nineslice(226, 3, 'ui2_panel_dark', null, 52, 16, 8, 8, 8, 8).setOrigin(0).setDepth(300);
      this.add.image(236, 11, 'ui_coin').setDepth(301);
      this.goldText = S.txt(this, 244, 6, String(S.save.gold), { size: 8, color: COL.gold }).setDepth(301);
      S.button(this, 281, 3, 16, 16, null, () => this.toggleMute(), { icon: S.save.settings.muted ? 'ui_sound_off' : 'ui_sound_on', label: false });
      this.muteBtn = this.nav.items[this.nav.items.length - 1];
      S.button(this, 300, 3, 16, 16, null, () => S.openSettings(() => this.scene.restart(), { onEdit: () => S.fadeTo(this, 'Creator'), onReset: () => this.scene.start('Title') }), { icon: 'ui_settings', label: false });
      const lettersDone = BOSSES.filter(b => S.save.bosses[b].state === 'cleared').length;
      const play = S.button(this, 6, 158, 96, 20, 'Play', () => S.fadeTo(this, 'Run', {}), { icon: 'hub_play', size: 8, title: true, color: 'rose' });
      S.button(this, 106, 158, 72, 20, `Library ${lettersDone}/${BOSSES.length}`, () => S.fadeTo(this, 'Library'), { icon: 'hub_library', size: 7 });
      S.button(this, 182, 158, 66, 20, 'Wardrobe', () => S.fadeTo(this, 'Shop'), { icon: 'hub_wardrobe', size: 7 });
      S.button(this, 252, 158, 62, 20, 'Tools', () => S.fadeTo(this, 'Tools'), { icon: 'hub_tools', size: 7 });
      this.nav.focus(play);
      this.input.keyboard.on('keydown', (e) => { if (e.key === 'F2' && e.shiftKey) { S.addGold(500); S.persist(); this.goldText.setText(String(S.save.gold)); } if (e.key === 'l' || e.key === 'L') this.lumiNote(); });
      if (this.welcome) this.time.delayedCall(300, () => this.dialogue.play([['Lumi', `Nice to meet you, ${look.name}. Welcome to ReBloom.`], ['Lumi', 'This little room is yours. Decorate it with gold you earn in runs.'], ['Lumi', 'Tap me any time for a fact about the mind, with its source. Press Play when you are ready.']]));
    }
    lumiNote() {
      if (this.dialogue.active) return; if (this.hint) { this.hint.destroy(); this.hint = null; }
      const n = S.randomNote(); if (!n) return; S.audio.sfx('chime');
      this.time.delayedCall(40, () => this.dialogue.play([['Lumi', 'Did you know? ' + n.text], ['Lumi', 'Source: ' + n.src + '. You can read every source in Settings.']]));
    }
    pokeDecor(k, spr) {
      if (this.dialogue.active) return;
      const sfx = { decor_cat: 'blip', decor_fish: 'pop', decor_record: 'chime', decor_candles: 'breathe' }[k] || 'place';
      S.audio.sfx(sfx);
      this.tweens.add({ targets: spr, scaleX: 1.15, scaleY: 0.88, duration: 90, yoyo: true, ease: 'Quad.easeOut' });
      this.sparkle(spr.x, spr.y - spr.displayHeight / 2, 5);
    }
    placeAnim(spr) {
      const ty = spr.y; spr.y = ty - 60; spr.setAlpha(0);
      this.tweens.add({ targets: spr, y: ty, alpha: 1, duration: 520, ease: 'Bounce.easeOut', onComplete: () => { S.audio.sfx('place'); this.sparkle(spr.x, ty - 4, 14); this.cameras.main.shake(90, 0.003); } });
      const ring = this.add.circle(spr.x, ty - 4, 4).setStrokeStyle(1, 0xfff1a8).setDepth(400);
      this.tweens.add({ targets: ring, radius: 26, alpha: 0, delay: 500, duration: 500, onComplete: () => ring.destroy() });
    }
    sparkle(x, y, n) {
      for (let i = 0; i < n; i++) {
        const p = this.add.image(x, y, 'p_mote').setBlendMode(Phaser.BlendModes.ADD).setTint([0xfff1a8, 0xf7a8c4, 0xbfe3ff][i % 3]).setDepth(400);
        const a = Math.random() * Math.PI * 2, d = 8 + Math.random() * 16;
        this.tweens.add({ targets: p, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d - 6, alpha: 0, scale: 0.4, duration: 500 + Math.random() * 300, ease: 'Quad.easeOut', onComplete: () => p.destroy() });
      }
    }
    floatNote(x, y) {
      const n = S.txt(this, x + (Math.random() * 8 - 4), y, Math.random() < 0.5 ? '♪' : '♫', { size: 7, ox: 0.5, color: '#f7a8c4' }).setDepth(400);
      this.tweens.add({ targets: n, y: y - 22, x: n.x + (Math.random() * 12 - 6), alpha: 0, duration: 1800, onComplete: () => n.destroy() });
    }
    toggleMute() { S.save.settings.muted = !S.save.settings.muted; S.persist(); S.audio.apply(); this.muteBtn.icon.setTexture(S.save.settings.muted ? 'ui_sound_off' : 'ui_sound_on'); }
  }

  /* ---------------- Library ---------------- */
  class Library extends Phaser.Scene {
    constructor() { super('Library'); }
    create() {
      S.cam(this); S.fadeIn(this); S.audio.music('hub');
      this.nav = new S.Nav(this); this.dialogue = new S.Dialogue(this);
      this.add.image(160, 90, 'screen_library');
      const done = BOSSES.filter(b => S.save.bosses[b].state === 'cleared').length;
      S.txt(this, 160, 4, 'Library', { size: 8, title: true, ox: 0.5, color: COL.cream });
      S.txt(this, 160, 15, `${done} of ${BOSSES.length} letters found`, { size: 7, ox: 0.5, color: COL.sky });
      S.button(this, 4, 2, 40, 16, 'Back', () => S.fadeTo(this, 'Hub'), { size: 7, icon: 'ui_back' });
      BOSSES.concat(['soon']).forEach((id, i) => this.card(id, 6 + i * 62, 26));
      if (!S.save.seenLibrary) { S.save.seenLibrary = true; S.persist(); this.time.delayedCall(250, () => this.dialogue.play(CONTENT.DIALOGUE.libraryFirst)); }
    }
    card(id, x, y) {
      const w = 56;
      if (id === 'soon') {
        this.add.nineslice(x, y, 'ui_card_frame_locked', null, w, 76, 6, 6, 6, 6).setOrigin(0);
        this.add.image(x + w / 2, y + 24, 'ui_lock').setScale(2);
        S.txt(this, x + w / 2, y + 52, 'Coming soon', { size: 7, ox: 0.5, color: COL.cream });
        S.txt(this, x + w / 2, y + 82, 'More topics:\nsleep,\nloneliness,\ngrief', { size: 6, ox: 0.5, align: 'center', color: COL.grey });
        return;
      }
      const st = S.save.bosses[id], info = S.BOSS_INFO[id];
      const known = st.state !== 'unknown';
      this.add.nineslice(x, y, known ? 'ui_card_frame' : 'ui_card_frame_locked', null, w, 76, 6, 6, 6, 6).setOrigin(0);
      this.add.rectangle(x + 5, y + 5, w - 10, 42, 0x3d4560).setOrigin(0);
      this.add.image(x + w / 2, y + 27, known ? info.card : info.sil).setScale(known ? 0.56 : 0.5);
      S.txt(this, x + w / 2, y + 50, known ? info.lib : '???', { size: 7, ox: 0.5, align: 'center', color: known ? COL.ink : COL.cream, shadow: false, wrap: w - 8 });
      for (let s = 0; s < 3; s++) this.add.image(x + w / 2 - 12 + s * 12, y + 69, s < st.stars ? 'ui_star_full' : 'ui_star_empty').setScale(0.6);
      const by = y + 80;
      if (st.state === 'unknown') {
        S.txt(this, x + w / 2, by + 2, 'Keep playing\nto meet it', { size: 6, ox: 0.5, align: 'center', color: COL.grey });
      } else if (st.state === 'encountered') {
        S.txt(this, x + w / 2, by, info.hint, { size: 6, ox: 0.5, align: 'center', color: COL.grey, wrap: w + 4 });
        S.button(this, x, by + 26, w, 16, 'Challenge', () => S.fadeTo(this, 'Run', { challenge: id }), { size: 7 });
      } else {
        S.button(this, x, by, w, 16, 'Read letter', () => S.openLetter(id), { size: 7, icon: 'ui_letter' });
        S.button(this, x, by + 19, w, 16, 'Mastery', () => S.fadeTo(this, 'Run', { challenge: id }), { size: 7 });
        S.txt(this, x + w / 2, by + 38, 'Pop myths,\nearn stars', { size: 6, ox: 0.5, color: COL.grey });
      }
    }
  }

  /* ---------------- Wardrobe / shop ---------------- */
  class Shop extends Phaser.Scene {
    constructor() { super('Shop'); }
    init(d) { this.cat = (d && d.cat) || 'Style'; this.page = (d && d.page) || 0; }
    create() {
      S.cam(this); S.fadeIn(this); S.audio.music('hub');
      this.nav = new S.Nav(this); this.dialogue = new S.Dialogue(this);
      this.add.image(160, 90, 'screen_creator');
      this.add.rectangle(160, 90, 320, 180, 0x1b1a2e, 0.55);
      S.txt(this, 160, 4, 'Wardrobe', { size: 8, title: true, ox: 0.5, color: COL.cream });
      S.button(this, 4, 2, 40, 16, 'Back', () => S.fadeTo(this, 'Hub'), { size: 7, icon: 'ui_back' });
      this.add.image(270, 9, 'ui_coin'); this.goldText = S.txt(this, 278, 4, String(S.save.gold), { size: 8, color: COL.gold });
      ['Style', 'Skins', 'Decor'].forEach((c, i) => {
        const b = S.button(this, 90 + i * 48, 18, 46, 14, c, () => this.scene.restart({ cat: c, page: 0 }), { size: 7 });
        if (c === this.cat) b.bg.setTint(0xf2c14e);
      });
      S.txt(this, 160, 34, 'Cosmetic only. Fixed prices, earned in play. Nothing changes difficulty.', { size: 6, ox: 0.5, color: COL.grey });
      const items = S.SHOP.filter(i => i.cat === this.cat), pages = Math.max(1, Math.ceil(items.length / 4));
      this.page = Math.min(this.page, pages - 1);
      items.slice(this.page * 4, this.page * 4 + 4).forEach((it, i) => this.itemCard(it, 10 + i * 76, 46));
      if (pages > 1) {
        S.button(this, 230, 154, 18, 18, null, () => this.scene.restart({ cat: this.cat, page: (this.page + pages - 1) % pages }), { icon: 'ui_arrow_left', label: false });
        S.txt(this, 264, 158, `${this.page + 1} / ${pages}`, { size: 7, ox: 0.5, color: COL.cream });
        S.button(this, 280, 154, 18, 18, null, () => this.scene.restart({ cat: this.cat, page: (this.page + 1) % pages }), { icon: 'ui_arrow_right', label: false });
      }
      if (this.cat === 'Style') S.button(this, 110, 154, 100, 18, 'Edit character', () => S.fadeTo(this, 'Creator'), { size: 7 });
    }
    itemCard(it, x, y) {
      const w = 72, h = 98;
      S.panel(this, x, y, w, h);
      this.add.rectangle(x + 6, y + 6, w - 12, 40, 0x3d4560).setOrigin(0);
      const cx = x + w / 2, cy = y + 26;
      if (it.kind === 'hairCol' || it.kind === 'outfitCol') {
        const look = Object.assign({}, S.save.player || S.defaultLook()); look[it.kind] = it.value;
        S.buildPlayer2(this, cx, cy + 18, look, 1.5);
      } else if (it.kind === 'pulseSkin') {
        const g = this.add.graphics(); g.lineStyle(2, it.value, 1).strokeCircle(cx, cy, 14); g.lineStyle(1, it.value, 0.5).strokeCircle(cx, cy, 9);
      } else if (it.kind === 'lumiSkin') {
        this.add.image(cx, cy, 'companion_orb').setScale(3).setTint(it.value);
      } else {
        const im = this.add.sprite(cx, cy + 18, it.value, 0).setOrigin(0.5, 1); const sc = Math.min(1, 30 / im.height, 56 / im.width); im.setScale(sc); if (this.anims.exists(it.value + '_a') && !S.save.settings.reduceMotion) im.play(it.value + '_a');
      }
      S.txt(this, cx, y + 50, it.name, { size: 7, ox: 0.5, color: COL.ink, shadow: false, wrap: w - 6, align: 'center' });
      const owned = S.save.owned.includes(it.id);
      const eq = this.isEquipped(it);
      let label, act;
      if (!owned) { label = `Buy ${it.price}`; act = () => this.buy(it); }
      else if (it.kind === 'hairCol' || it.kind === 'outfitCol') { label = eq ? 'Wearing' : 'Wear'; act = () => this.equip(it); }
      else { label = eq ? 'Remove' : (it.kind === 'decor' ? 'Place' : 'Use'); act = () => this.equip(it); }
      const b = S.button(this, x + 6, y + h - 22, w - 12, 16, label, act, { size: 7 });
      if (!owned && S.save.gold < it.price) { b.setDisabled(true); S.txt(this, cx, y + 66, `Need ${it.price - S.save.gold} more`, { size: 6, ox: 0.5, color: COL.red, shadow: false }); }
      if (!owned && S.save.gold >= it.price) b.setDisabled(false);
    }
    toast(msg) {
      const t = S.txt(this, 160, 140, msg, { size: 7, ox: 0.5, color: '#fff6d8', bg: '#1a1233ee' }).setDepth(500).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, y: 134, duration: 200 });
    }
    isEquipped(it) {
      const p = S.save.player || {}, e = S.save.equipped;
      if (it.kind === 'hairCol') return p.hairCol === it.value;
      if (it.kind === 'outfitCol') return p.outfitCol === it.value;
      if (it.kind === 'pulseSkin') return e.pulseSkin === it.id;
      if (it.kind === 'lumiSkin') return e.lumiSkin === it.id;
      if (it.kind === 'decor') return (e.decor || []).includes(it.value);
      return false;
    }
    buy(it) {
      if (S.save.gold < it.price) return;
      S.addGold(-it.price); S.save.owned.push(it.id); S.audio.sfx('buy');
      this.equip(it, true);
    }
    equip(it, fromBuy) {
      const e = S.save.equipped; S.save.player = S.save.player || S.defaultLook();
      if (it.kind === 'hairCol') S.save.player.hairCol = it.value;
      else if (it.kind === 'outfitCol') S.save.player.outfitCol = it.value;
      else if (it.kind === 'pulseSkin') e.pulseSkin = e.pulseSkin === it.id && !fromBuy ? null : it.id;
      else if (it.kind === 'lumiSkin') e.lumiSkin = e.lumiSkin === it.id && !fromBuy ? null : it.id;
      else if (it.kind === 'decor') { e.decor = e.decor || []; const i = e.decor.indexOf(it.value); if (i >= 0 && !fromBuy) e.decor.splice(i, 1); else if (i < 0) { e.decor.push(it.value); S.save.decorNew = it.value; S.persist(); S.audio.sfx('place'); this.toast(it.name + ' placed in your room!'); this.time.delayedCall(700, () => S.fadeTo(this, 'Hub')); return; } }
      S.persist(); this.scene.restart({ cat: this.cat, page: this.page });
    }
  }

  /* ---------------- Tools ---------------- */
  class Tools extends Phaser.Scene {
    constructor() { super('Tools'); }
    create() {
      S.cam(this); S.fadeIn(this); S.audio.music('hub');
      this.nav = new S.Nav(this); this.dialogue = new S.Dialogue(this);
      this.add.image(160, 90, 'hub3'); this.add.rectangle(160, 90, 320, 180, 0x1b1a2e, 0.7);
      S.txt(this, 160, 4, 'Coping Tools', { size: 8, title: true, ox: 0.5, color: COL.cream });
      S.button(this, 4, 2, 40, 16, 'Back', () => S.fadeTo(this, 'Hub'), { size: 7, icon: 'ui_back' });
      this.add.image(270, 9, 'ui_coin'); S.txt(this, 278, 4, String(S.save.gold), { size: 8, color: COL.gold });
      S.txt(this, 160, 16, 'Equip one. Each plays differently; none is stronger.', { size: 7, ox: 0.5, color: COL.grey });
      Object.entries(CONTENT.TOOLS).forEach(([id, t], i) => {
        const x = 6 + i * 62, y = 28, w = 58, h = 148;
        S.panel(this, x, y, w, h);
        this.add.image(x + w / 2, y + 16, t.icon).setScale(1.5);
        S.txt(this, x + w / 2, y + 28, t.name, { size: 7, ox: 0.5, color: COL.ink, shadow: false, align: 'center', wrap: w - 6 });
        S.txt(this, x + 5, y + 40, t.desc, { size: 6, color: COL.slate, shadow: false, wrap: w - 9, lineSpacing: 0 });
        S.txt(this, x + 5, y + 90, 'In-run upgrades:\n' + t.ups.map((u, k) => `${k + 1}. ${u}`).join('\n'), { size: 6, color: COL.blue, shadow: false, wrap: w - 10 });
        const owned = S.save.owned.includes(id), eq = S.save.equippedTool === id;
        let b;
        if (eq) { b = S.button(this, x + 5, y + h - 21, w - 10, 16, 'Equipped', () => { }, { size: 7 }); b.bg.setTint(0x6aa84f); }
        else if (owned) b = S.button(this, x + 5, y + h - 21, w - 10, 16, 'Equip', () => { S.save.equippedTool = id; S.persist(); S.audio.sfx('upgrade'); this.scene.restart(); }, { size: 7 });
        else { b = S.button(this, x + 5, y + h - 21, w - 10, 16, `Buy ${t.price}`, () => { if (S.save.gold < t.price) return; S.addGold(-t.price); S.save.owned.push(id); S.save.equippedTool = id; S.persist(); S.audio.sfx('buy'); this.scene.restart(); }, { size: 7 }); if (S.save.gold < t.price) b.setDisabled(true); }
      });
    }
  }

  /* ---------------- Results ---------------- */
  class Results extends Phaser.Scene {
    constructor() { super('Results'); }
    init(d) { this.d = d || {}; }
    create() {
      const d = this.d; S.cam(this); S.fadeIn(this); S.audio.music('hub');
      this.nav = new S.Nav(this); this.dialogue = new S.Dialogue(this);
      this.add.image(160, 90, 'screen_results');
      S.panel(this, 60, 14, 200, 130);
      const title = d.challengeDone ? 'Room cleared' : 'Time to rest';
      S.txt(this, 160, 22, title, { size: 8, title: true, ox: 0.5, color: COL.blue, shadow: false });
      S.txt(this, 160, 36, d.challengeDone ? 'You cleared the challenge. Nice work.' : 'Stress reached its limit. That is okay.', { size: 7, ox: 0.5, color: COL.slate, shadow: false });
      const rows = [['Rooms reached', d.room || 1], ['Waves survived', d.wave || 0], ['Gold earned', d.gold || 0], ['Best', `room ${S.save.bestRoom}, wave ${S.save.bestWave}`]];
      rows.forEach(([k, v], i) => { S.txt(this, 76, 52 + i * 11, k, { size: 7, color: COL.ink, shadow: false }); S.txt(this, 244, 52 + i * 11, String(v), { size: 7, color: COL.blue, shadow: false, ox: 1 }); });
      const pool = d.better ? CONTENT.DIALOGUE.resultsBetter : CONTENT.DIALOGUE.resultsSame;
      const line = S.rng.pick(pool)[1];
      this.add.image(76, 108, 'companion_orb').setScale(2).setTint(S.lumiTint());
      S.txt(this, 88, 102, line, { size: 7, color: COL.ink, shadow: false, wrap: 160 });
      const again = S.button(this, 70, 150, 100, 22, 'Try again', () => S.fadeTo(this, 'Run', d.challenge ? { challenge: d.challenge } : {}), { size: 8, icon: 'hub_play' });
      S.button(this, 176, 150, 74, 22, 'My room', () => S.fadeTo(this, 'Hub'), { size: 8 });
      this.nav.focus(again);
      S.audio.sfx('chime');
    }
  }

  S.MenuScenes = [Boot, Preload, Title, Creator, Hub, Library, Shop, Tools, Results];
})();
