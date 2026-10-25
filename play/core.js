/* ReBloom, core systems: save, rng, audio, ui helpers, dialogue, DOM overlays. */
(function () {
  const CONTENT = window.SANCTUARY_CONTENT;
  const S = {};
  window.SANC = S;

  S.W = 320; S.H = 180; S.ZOOM = 3;
  S.FONT = '"Pixelify Sans", "Trebuchet MS", sans-serif';
  S.TFONT = '"Press Start 2P", "Courier New", monospace';
  S.COL = { ink: '#1b1a2e', cream: '#f4e9cd', white: '#e8edf5', sky: '#8fc1e3', blue: '#4f7cac', gold: '#f2c14e', pink: '#e89bb0', red: '#c8553d', grey: '#a3aec7', violet: '#8e6bb5', green: '#6aa84f', slate: '#3d4560', orange: '#e8833a' };

  /* ---------------- palettes and shop ---------------- */
  S.SKIN = [0xf6d7b8, 0xe8b48a, 0xc68a5c, 0x9a6440, 0x6e4428, 0x4a2c1a];
  S.HAIR_BASE = [0x2a1a12, 0x5c3e2a, 0xc8902e, 0xb0503a, 0x4f7cac, 0xe8edf5];
  S.OUTFIT_BASE = [0x4f7cac, 0x6aa84f, 0xc8553d, 0x8e6bb5, 0xf2c14e, 0x3d4560];
  S.ACC = ['none', 'glasses', 'scarf'];
  S.SHOP = [
    { id: 'hair_rose', cat: 'Style', name: 'Rose hair dye', price: 30, kind: 'hairCol', value: 0xe89bb0 },
    { id: 'hair_silver', cat: 'Style', name: 'Silver hair dye', price: 30, kind: 'hairCol', value: 0xc9d3e6 },
    { id: 'fit_sunset', cat: 'Style', name: 'Sunset outfit', price: 40, kind: 'outfitCol', value: 0xe8833a },
    { id: 'fit_mint', cat: 'Style', name: 'Mint outfit', price: 40, kind: 'outfitCol', value: 0x8fd6b4 },
    { id: 'pulse_rose', cat: 'Skins', name: 'Rose ring colour', price: 40, kind: 'pulseSkin', value: 0xe89bb0 },
    { id: 'pulse_gold', cat: 'Skins', name: 'Gold ring colour', price: 40, kind: 'pulseSkin', value: 0xf2c14e },
    { id: 'lumi_ember', cat: 'Skins', name: 'Ember Lumi', price: 80, kind: 'lumiSkin', value: 0xffc070 },
    { id: 'lumi_dusk', cat: 'Skins', name: 'Dusk Lumi', price: 80, kind: 'lumiSkin', value: 0xb4a8ff },
    { id: 'decor_plant', cat: 'Decor', name: 'House plant', price: 50, kind: 'decor', value: 'decor_plant' },
    { id: 'decor_lamp', cat: 'Decor', name: 'Reading lamp', price: 60, kind: 'decor', value: 'decor_lamp' },
    { id: 'decor_mirror', cat: 'Decor', name: 'Wall mirror', price: 80, kind: 'decor', value: 'decor_mirror' },
    { id: 'decor_cup', cat: 'Decor', name: 'Warm drink', price: 50, kind: 'decor', value: 'decor_drink' },
    { id: 'decor_lights', cat: 'Decor', name: 'Fairy lights', price: 70, kind: 'decor', value: 'decor_lights' },
    { id: 'decor_cat', cat: 'Decor', name: 'Sleepy cat', price: 120, kind: 'decor', value: 'decor_cat' },
    { id: 'decor_record', cat: 'Decor', name: 'Record player', price: 100, kind: 'decor', value: 'decor_record' },
    { id: 'decor_fish', cat: 'Decor', name: 'Fish bowl', price: 90, kind: 'decor', value: 'decor_fish' },
    { id: 'decor_painting', cat: 'Decor', name: 'Dawn painting', price: 60, kind: 'decor', value: 'decor_painting' },
    { id: 'decor_beanbag', cat: 'Decor', name: 'Bean bag', price: 70, kind: 'decor', value: 'decor_beanbag' },
    { id: 'decor_candles', cat: 'Decor', name: 'Candles', price: 50, kind: 'decor', value: 'decor_candles' }
  ];
  S.hairColors = () => S.HAIR_BASE.concat(S.SHOP.filter(i => i.kind === 'hairCol' && S.save.owned.includes(i.id)).map(i => i.value));
  S.outfitColors = () => S.OUTFIT_BASE.concat(S.SHOP.filter(i => i.kind === 'outfitCol' && S.save.owned.includes(i.id)).map(i => i.value));

  /* ---------------- save ---------------- */
  const KEY = 'sanctuary_save_v1';
  let reduceDefault = false;
  try { reduceDefault = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { }
  S.defaultSave = () => ({
    player: null, gold: 0, owned: ['pulse'], equippedTool: 'pulse',
    equipped: { pulseSkin: null, lumiSkin: null, decor: [] },
    bosses: { gloom: { state: 'unknown', stars: 0 }, deadline: { state: 'unknown', stars: 0 }, crowd: { state: 'unknown', stars: 0 }, ocd: { state: 'unknown', stars: 0 } },
    bestRoom: 0, bestWave: 0, runs: 0, seenLibrary: false,
    settings: { music: 0.5, sfx: 0.7, muted: false, reduceMotion: reduceDefault, textSpeed: 'normal', typewriter: true }
  });
  function merge(base, over) {
    if (!over || typeof over !== 'object' || Array.isArray(over)) return over === undefined ? base : over;
    const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    for (const k of Object.keys(over)) {
      out[k] = (base && typeof base[k] === 'object' && base[k] !== null && !Array.isArray(base[k])) ? merge(base[k], over[k]) : over[k];
    }
    return out;
  }
  S.load = () => {
    try { const raw = localStorage.getItem(KEY); if (raw) return merge(S.defaultSave(), JSON.parse(raw)); } catch (e) { }
    return S.defaultSave();
  };
  S.persist = () => { try { localStorage.setItem(KEY, JSON.stringify(S.save)); } catch (e) { } };
  S.save = S.load();
  S.addGold = (n) => { S.save.gold = Math.max(0, S.save.gold + n); };

  /* ---------------- rng ---------------- */
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  S.RNG = class {
    constructor(seed) { this.seed = seed >>> 0; this.r = mulberry32(this.seed); this.last = {}; }
    next() { return this.r(); }
    range(a, b) { return a + (b - a) * this.r(); }
    int(a, b) { return Math.floor(this.range(a, b + 1)); }
    pick(arr) { return arr[Math.floor(this.r() * arr.length)]; }
    pickNoRepeat(arr, key) {
      if (arr.length < 2) return arr[0];
      let i; do { i = Math.floor(this.r() * arr.length); } while (i === this.last[key]);
      this.last[key] = i; return arr[i];
    }
    shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(this.r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  };
  S.rng = new S.RNG(Date.now());

  /* ---------------- audio (all synthesized) ---------------- */
  /* audio lives in audio.js */

  /* ---------------- scene helpers ---------------- */
  S.cam = (scene) => { scene._leaving = false; scene.cameras.main.setZoom(S.ZOOM).centerOn(S.W / 2, S.H / 2); return scene.cameras.main; };
  S.txt = (scene, x, y, str, o = {}) => {
    const t = scene.add.text(x, y, str, {
      fontFamily: o.title ? S.TFONT : S.FONT, fontSize: (o.size || 8) + 'px', color: o.color || S.COL.white,
      align: o.align || 'left', wordWrap: o.wrap ? { width: o.wrap, useAdvancedWrap: true } : undefined,
      resolution: S.ZOOM, lineSpacing: o.lineSpacing || 0,
      backgroundColor: o.bg, padding: o.bg ? { x: 2, y: 1 } : undefined
    });
    if (o.shadow !== false && !o.bg) t.setShadow(1, 1, o.shadowColor || S.COL.ink, 0, false, true);
    t.setOrigin(o.ox ?? 0, o.oy ?? 0);
    if (o.depth) t.setDepth(o.depth);
    return t;
  };
  S.panel = (scene, x, y, w, h, key = 'ui2_panel') => scene.add.nineslice(x, y, key, null, w, h, 8, 8, 8, 8).setOrigin(0, 0);

  /* Buttons with mouse, touch and keyboard focus. */
  S.Nav = class {
    constructor(scene) {
      this.scene = scene; this.items = []; this.index = -1; this.enabled = true;
      this.ring = scene.add.graphics().setDepth(5000);
      const kb = scene.input.keyboard;
      this.handler = (e) => {
        if (!this.enabled || S.overlayOpen || (scene.dialogue && scene.dialogue.active)) return;
        const k = e.key;
        if (k === 'ArrowRight' || k === 'ArrowDown' || (k === 'Tab' && !e.shiftKey)) { this.move(1); e.preventDefault && e.preventDefault(); }
        else if (k === 'ArrowLeft' || k === 'ArrowUp' || (k === 'Tab' && e.shiftKey)) { this.move(-1); }
        else if (k === 'Enter' || k === ' ') { const it = this.items[this.index]; if (it && it.visible && !it.disabled) it.activate(); }
      };
      kb.on('keydown', this.handler);
      kb.addCapture('TAB');
      scene.events.once('shutdown', () => kb.off('keydown', this.handler));
    }
    add(btn) { this.items.push(btn); return btn; }
    clear() { this.items.forEach(b => b.destroy()); this.items = []; this.index = -1; this.draw(); }
    visibleItems() { return this.items.filter(b => b.visible && !b.disabled); }
    move(d) {
      const vis = this.items.map((b, i) => [b, i]).filter(([b]) => b.visible && !b.disabled);
      if (!vis.length) return;
      let pos = vis.findIndex(([, i]) => i === this.index);
      pos = pos < 0 ? (d > 0 ? 0 : vis.length - 1) : (pos + d + vis.length) % vis.length;
      this.index = vis[pos][1]; this.draw(); S.audio.sfx('blip', 900);
    }
    focus(btn) { this.index = this.items.indexOf(btn); this.draw(); }
    draw() {
      this.ring.clear(); const b = this.items[this.index];
      if (!b || !b.visible) return;
      const r = b.getBounds();
      this.ring.lineStyle(1, 0xf2c14e, 1).strokeRect(r.x - 1.5, r.y - 1.5, r.width + 3, r.height + 3);
    }
  };
  S.button = (scene, x, y, w, h, label, onClick, o = {}) => {
    const c = scene.add.container(x, y).setDepth(o.depth || 10);
    const base = o.style === 'panel' ? 'ui2_panel' : o.color === 'rose' ? 'ui2_btn_rose' : o.color === 'gold' ? 'ui2_btn_gold' : 'ui2_btn';
    const bg = o.style === 'panel' ? scene.add.nineslice(0, 0, base, null, w, h, 8, 8, 8, 8).setOrigin(0, 0) : scene.add.nineslice(0, 0, base, null, w, h, 6, 6, 6, 6).setOrigin(0, 0);
    c.add(bg);
    let tx = w / 2;
    if (o.icon) { const ic = scene.add.image(o.label === false ? w / 2 : 3 + 8, h / 2, o.icon).setOrigin(0.5); c.add(ic); c.icon = ic; tx = o.label === false ? w / 2 : 12 + (w - 12) / 2; }
    let t = null;
    if (label !== null && label !== undefined) { t = S.txt(scene, tx, h / 2, label, { size: o.size || 8, ox: 0.5, oy: 0.5, color: o.style === 'panel' ? S.COL.ink : S.COL.white, shadow: o.style !== 'panel', title: o.title }); c.add(t); }
    c.label = t; c.bg = bg; c.disabled = false; c.w = w; c.h = h; c.baseY = y;
    c.setSize(w, h);
    const zone = scene.add.zone(w / 2, h / 2, w, h).setInteractive({ useHandCursor: true });
    c.add(zone); c.zone = zone;
    c.activate = () => { if (c.disabled) return; S.audio.sfx('click'); onClick && onClick(); };
    zone.on('pointerover', () => { if (c.disabled) return; if (o.style === 'panel') bg.setTint(0xfff6e0); else if (base === 'ui2_btn') bg.setTexture('ui2_btn_hover'); else bg.setTint(0xffffff); c.y = c.baseY - 1; S.audio.sfx('hover'); if (scene.nav) scene.nav.focus(c); });
    zone.on('pointerout', () => { bg.clearTint(); bg.setTexture(base); c.y = c.baseY; if (c.disabled) bg.setTint(0x777777); });
    zone.on('pointerdown', (p, lx, ly, ev) => { if (ev) ev.stopPropagation(); if (S.overlayOpen) return; if (o.style !== 'panel') bg.setTexture('ui2_btn_down'); });
    zone.on('pointerup', (p, lx, ly, ev) => { if (ev) ev.stopPropagation(); if (S.overlayOpen) return; if (o.style !== 'panel') bg.setTexture(base); c.y = c.baseY; c.activate(); });
    c.setDisabled = (v) => { c.disabled = v; bg.setTint(v ? 0x777777 : 0xffffff); if (!v) bg.clearTint(); if (t) t.setAlpha(v ? 0.6 : 1); return c; };
    c.setLabel = (s) => { if (t) t.setText(s); return c; };
    if (scene.nav && o.nav !== false) scene.nav.add(c);
    return c;
  };
  S.fadeTo = (scene, key, data) => {
    if (scene._leaving) return; scene._leaving = true;
    const go = () => scene.scene.start(key, data);
    if (S.save.settings.reduceMotion) return go();
    scene.cameras.main.fadeOut(180, 15, 14, 28);
    scene.cameras.main.once('camerafadeoutcomplete', go);
  };
  S.fadeIn = (scene) => { if (!S.save.settings.reduceMotion) scene.cameras.main.fadeIn(200, 15, 14, 28); };

  /* Layered, tinted character built from the greyscale player layers. */
  S.buildPlayer = (scene, x, y, look, scale = 1) => {
    const c = scene.add.container(x, y);
    const h = look.hair, o = look.outfit;
    const parts = [
      scene.add.image(0, 0, `player_outline_h${h}_o${o}`),
      scene.add.image(0, 0, 'player_skin').setTint(look.skin),
      scene.add.image(0, 0, `player_outfit_${o}`).setTint(look.outfitCol),
      scene.add.image(0, 0, `player_hair_${h}`).setTint(look.hairCol)
    ];
    if (look.acc === 'glasses') parts.push(scene.add.image(0, 0, 'player_acc_glasses'));
    if (look.acc === 'scarf') parts.push(scene.add.image(0, 0, 'player_acc_scarf').setTint(0xc8553d));
    parts.forEach(p => p.setOrigin(0.5, 1));
    c.add(parts); c.setScale(scale); c.parts = parts;
    return c;
  };
  S.fixSF = (o) => { if (o && o.setScrollFactor) o.setScrollFactor(0); if (o && o.list) o.list.forEach(S.fixSF); return o; };
  /* v2 player: layered spritesheets, 12 frames (down 0-3, up 4-7, side 8-11). */
  S.buildPlayer2 = (scene, x, y, look, scale = 1) => {
    const c = scene.add.container(x, y);
    const mk = (key, tint) => { const im = scene.add.sprite(0, 0, key, 0).setOrigin(0.5, 1); if (tint !== undefined) im.setTint(tint); return im; };
    const parts = [mk('pl_skin', look.skin), mk('pl_base'), mk('pl_outfit' + (look.outfit || 0), look.outfitCol), mk('pl_hair' + (look.hair || 0), look.hairCol)];
    if (look.acc === 'glasses') parts.push(mk('pl_glasses')); if (look.acc === 'scarf') parts.push(mk('pl_scarf', 0xc8553d));
    c.add(parts); c.parts = parts; c.look = look; c.setScale(scale);
    c.setPlayerFrame = (f) => { parts.forEach(p => p.setFrame(f)); return c; };
    c.restoreTints = () => { parts[0].setTint(look.skin); parts[1].clearTint(); parts[2].setTint(look.outfitCol); parts[3].setTint(look.hairCol); if (parts[4]) { if (look.acc === 'scarf') parts[4].setTint(0xc8553d); else parts[4].clearTint(); } };
    return c;
  };
  S.defaultLook = () => ({ name: 'Akira', skin: S.SKIN[1], hair: 1, hairCol: S.HAIR_BASE[1], outfit: 1, outfitCol: S.OUTFIT_BASE[0], acc: 'scarf' });
  S.lumiTint = () => S.save.equipped.lumiSkin ? (S.SHOP.find(i => i.id === S.save.equipped.lumiSkin) || {}).value || 0xffffff : 0xffffff;
  S.pulseColor = () => S.save.equipped.pulseSkin ? (S.SHOP.find(i => i.id === S.save.equipped.pulseSkin) || {}).value || 0x8fc1e3 : 0x8fc1e3;

  /* ---------------- Dialogue (blocking box + toasts) ---------------- */
  const PORTRAIT = { Lumi: ['companion_orb', 3], 'The Gloom': ['boss_gloom', 0.5], 'The Deadline': ['boss_deadline', 0.5], 'The Crowd': ['boss_crowd', 0.5], 'The Loop': ['boss_ocd', 0.5] };
  const PITCH = { Lumi: 880, 'The Gloom': 260, 'The Deadline': 420, 'The Crowd': 340, 'The Loop': 500, '': 600 };
  S.Dialogue = class {
    constructor(scene, parent) {
      this.scene = scene; this.parent = parent || null; this.active = false; this.toastQ = []; this.toastBusy = false;
      const c = this.box = scene.add.container(0, 0).setDepth(4000).setVisible(false);
      this.bg = S.panel(scene, 8, 124, 304, 50);
      this.pframe = S.panel(scene, 13, 129, 40, 40, 'ui2_panel_dark');
      this.plate = scene.add.nineslice(54, 118, 'ui2_nameplate', null, 80, 12, 4, 4, 4, 4).setOrigin(0, 0);
      this.portrait = scene.add.image(33, 149, 'companion_orb');
      this.name = S.txt(scene, 60, 120, '', { size: 7, color: S.COL.white, shadow: true, title: true });
      this.body = S.txt(scene, 58, 141, '', { size: 8, color: S.COL.ink, shadow: false, wrap: 246, lineSpacing: 1 });
      this.hint = S.txt(scene, 304, 167, 'Space / tap', { size: 6, color: S.COL.slate, shadow: false, ox: 1, oy: 1 });
      this.skip = S.txt(scene, 307, 125, 'Skip all', { size: 6, color: S.COL.blue, shadow: false, ox: 1 }).setInteractive({ useHandCursor: true });
      c.add([this.bg, this.pframe, this.plate, this.portrait, this.name, this.body, this.hint, this.skip]);
      if (this.parent) { S.fixSF(c); this.parent.add(c); }
      this.skip.on('pointerup', (p, x, y, ev) => { ev && ev.stopPropagation(); this.finish(); });
      this.onKey = (e) => { if (!this.active || S.overlayOpen) return; if (e.key === ' ' || e.key === 'Enter') this.advance(); if (e.key === 'Escape') this.finish(); };
      this.onPtr = () => { if (this.active && !S.overlayOpen) this.advance(); };
      scene.input.keyboard.on('keydown', this.onKey);
      scene.input.on('pointerup', this.onPtr);
      scene.events.once('shutdown', () => { scene.input.keyboard.off('keydown', this.onKey); scene.input.off('pointerup', this.onPtr); if (this.typer) this.typer.remove(); });
    }
    play(lines, done) {
      if (!lines || !lines.length) { done && done(); return; }
      this.lines = lines.slice(); this.done = done; this.active = true; this.box.setVisible(true);
      this.openedAt = this.scene.time.now; this.show(0);
    }
    show(i) {
      this.i = i; const [who, text] = this.lines[i];
      this.name.setText(who || ''); const p = PORTRAIT[who];
      this.pframe.setVisible(!!p); this.portrait.setVisible(!!p);
      const textX = p ? 58 : 16; this.name.x = textX + 4; this.plate.x = textX - 2; this.plate.setVisible(!!who); this.plate.width = Math.max(40, this.name.width + 12); this.body.x = textX; this.body.setWordWrapWidth(p ? 246 : 288);
      if (p) { this.portrait.setTexture(p[0]).setScale(p[1]); if (who === 'Lumi') this.portrait.setTint(S.lumiTint()); else { this.portrait.clearTint(); const bs = this.scene.boss; if (bs && bs.sp && bs.sp.active) this.portrait.setFrame(Math.min(bs.sp.frame.name, 5) - (bs.sp.frame.name % 2)); } }
      this.body.y = who ? 136 : 136;
      this.full = text; this.shown = 0; if (this.typer) this.typer.remove();
      const st = S.save.settings; const ms = { slow: 38, normal: 22, fast: 9 }[st.textSpeed] || 22;
      if (!st.typewriter) { this.body.setText(text); this.shown = text.length; return; }
      this.body.setText('');
      const ev = this.typer = this.scene.time.addEvent({
        delay: ms, loop: true, callback: () => {
          if (this.typer !== ev) { ev.remove(); return; }
          if (this.shown >= this.full.length) { ev.remove(); this.typer = null; return; }
          this.shown++; this.body.setText(this.full.slice(0, this.shown));
          if (this.shown % 3 === 1 && this.full[this.shown - 1] !== ' ') S.audio.sfx('blip', (PITCH[who] || 600) * (0.95 + Math.random() * 0.1));
          if (this.shown >= this.full.length) { ev.remove(); this.typer = null; }
        }
      });
    }
    advance() {
      if (this.scene.time.now - this.openedAt < 150) return;
      if (this.shown < this.full.length) { if (this.typer) this.typer.remove(); this.typer = null; this.shown = this.full.length; this.body.setText(this.full); return; }
      if (this.i + 1 < this.lines.length) this.show(this.i + 1); else this.finish();
    }
    finish() {
      if (!this.active) return;
      if (this.typer) { this.typer.remove(); this.typer = null; }
      this.active = false; this.box.setVisible(false);
      const d = this.done; this.done = null;
      if (d) this.scene.time.delayedCall(60, d);
    }
    toast(lines, topY) {
      lines.forEach(l => this.toastQ.push(l)); this.topPref = topY; if (!this.toastBusy) this.nextToast();
    }
    nextToast() {
      const l = this.toastQ.shift(); if (!l) { this.toastBusy = false; return; }
      this.toastBusy = true; const s = this.scene;
      const playerLow = s.playerScreenY ? s.playerScreenY() > 100 : (s.player ? s.player.y > 100 : true);
      const y = playerLow ? 26 : 150;
      const [who, text] = l;
      const c = s.add.container(0, 0).setDepth(3500);
      const label = (who ? who + ': ' : '') + text;
      const t = S.txt(s, 160, y + 6, label, { size: 7, color: S.COL.ink, shadow: false, ox: 0.5, wrap: 230, align: 'center' });
      const w = Math.min(250, t.width + 26), h = t.height + 8;
      const bg = S.panel(s, 160 - w / 2, y, w, h);
      const ic = who === 'Lumi' ? s.add.image(160 - w / 2 + 9, y + h / 2, 'companion_orb').setTint(S.lumiTint()) : null;
      t.x = 160 + (ic ? 5 : 0); t.y = y + 4;
      c.add([bg, t]); if (ic) c.add(ic);
      if (this.parent) { S.fixSF(c); this.parent.add(c); }
      c.setAlpha(0); s.tweens.add({ targets: c, alpha: 1, duration: 160 });
      s.time.delayedCall(2500, () => s.tweens.add({ targets: c, alpha: 0, duration: 220, onComplete: () => { c.destroy(); this.nextToast(); } }));
    }
  };

  /* ---------------- DOM overlays ---------------- */
  const ui = () => document.getElementById('ui');
  S.overlayOpen = false;
  function open(html, cls, onClose) {
    const root = ui(); root.innerHTML = ''; root.hidden = false;
    const back = document.createElement('div'); back.className = 'veil';
    const box = document.createElement('div'); box.className = 'sheet ' + (cls || ''); box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
    box.innerHTML = html; back.appendChild(box); root.appendChild(back);
    S.overlayOpen = true; if (S.game) S.game.input.keyboard.enabled = false;
    S.closeOverlay = () => { root.hidden = true; root.innerHTML = ''; S.overlayOpen = false; if (S.game) S.game.input.keyboard.enabled = true; document.removeEventListener('keydown', esc); S.audio.sfx('click'); onClose && onClose(); };
    const esc = (e) => { if (e.key === 'Escape') S.closeOverlay(); };
    document.addEventListener('keydown', esc);
    box.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => S.closeOverlay()));
    const f = box.querySelector('[autofocus]') || box.querySelector('button, input, select, a');
    if (f) setTimeout(() => f.focus(), 30);
    return box;
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function letterModel(id) {
    const L = CONTENT.LETTERS[id], order = [];
    const num = (claims) => claims.map(cid => { const src = CONTENT.CLAIMS[cid].src; let i = order.indexOf(src); if (i < 0) { order.push(src); i = order.length - 1; } return i + 1; }).filter((v, i, a) => a.indexOf(v) === i);
    const blocks = L.blocks.map(b => {
      if (b.lines) return { h: b.h, lines: b.lines.map(([t, c]) => ({ t, n: num(c) })) };
      return { h: b.h, myths: b.myths.map(m => ({ m: m.m, f: m.f, n: num(m.c) })), facts: b.facts.map(f => ({ t: f.t, n: num(f.c) })) };
    });
    return { L, blocks, sources: order.map(k => CONTENT.SOURCES[k]) };
  }
  S.letterModel = letterModel;
  S.statementSource = (id, claims) => { const m = letterModel(id); return m; };

  S.openLetter = (id, onClose) => {
    const { L, blocks, sources } = letterModel(id);
    const sup = (n) => n.map(k => `<a class="mk" href="#src-${id}-${k}">[${k}]</a>`).join('');
    let h = `<header class="lh"><p class="eyebrow">${esc(L.from)}</p><h2>${esc(L.title)}</h2></header>`;
    blocks.forEach(b => {
      h += `<section><h3>${esc(b.h)}</h3>`;
      if (b.lines) h += b.lines.map(l => `<p>${esc(l.t)} ${sup(l.n)}</p>`).join('');
      else {
        h += '<ul class="myths">' + b.myths.map(m => `<li><span class="tag myth">Myth</span> ${esc(m.m)}<br><span class="tag fact">Fact</span> ${esc(m.f)} ${sup(m.n)}</li>`).join('') + '</ul>';
        h += '<p class="sub">Also true:</p><ul class="facts">' + b.facts.map(f => `<li>${esc(f.t)} ${sup(f.n)}</li>`).join('') + '</ul>';
      }
      h += '</section>';
    });
    h += `<section class="srcs"><h3>Sources</h3><ol>` + sources.map((s, i) => `<li id="src-${id}-${i + 1}">${esc(s.publisher)}. <a href="${s.url}" target="_blank" rel="noopener">${esc(s.title)}</a>. Last verified ${CONTENT.ACCESSED}.</li>`).join('') + '</ol></section>';
    h += `<p class="disclaimer">For awareness only. Not a diagnosis or medical advice.</p>
      <div class="row"><button class="btn" id="copyLetter">Copy letter text</button><button class="btn primary" data-close autofocus>Close letter</button></div><p class="status" id="copyStatus" aria-live="polite"></p>`;
    const box = open(h, 'letter', onClose);
    S.audio.sfx('letter');
    box.querySelectorAll('a.mk').forEach(a => a.addEventListener('click', (e) => { e.preventDefault(); const t = box.querySelector(a.getAttribute('href')); if (t) { t.scrollIntoView({ behavior: 'smooth', block: 'center' }); t.classList.add('flash'); setTimeout(() => t.classList.remove('flash'), 900); } }));
    box.querySelector('#copyLetter').addEventListener('click', () => {
      let plain = `${L.title} (a Letter from ReBloom)\n\n`;
      blocks.forEach(b => { plain += b.h.toUpperCase() + '\n'; if (b.lines) b.lines.forEach(l => plain += `${l.t} [${l.n.join('][')}]\n`); else { b.myths.forEach(m => plain += `Myth: ${m.m} Fact: ${m.f} [${m.n.join('][')}]\n`); b.facts.forEach(f => plain += `True: ${f.t} [${f.n.join('][')}]\n`); } plain += '\n'; });
      plain += 'SOURCES\n' + sources.map((s, i) => `[${i + 1}] ${s.publisher}. ${s.title}. ${s.url}`).join('\n') + '\n\nFor awareness only. Not a diagnosis or medical advice.';
      const st = box.querySelector('#copyStatus');
      const fallback = () => { const ta = document.createElement('textarea'); ta.value = plain; ta.className = 'copyta'; box.appendChild(ta); ta.select(); st.textContent = 'Copy blocked here. The text is selected below: press Ctrl+C or Cmd+C.'; };
      try { navigator.clipboard.writeText(plain).then(() => { st.textContent = 'Letter copied. Paste it anywhere to share.'; }, fallback); } catch (e) { fallback(); }
    });
  };

  S.openSettings = (onClose, extra = {}) => {
    const st = S.save.settings;
    const h = `<h2>Settings</h2>
      <div class="form">
        <label for="setMusic">Music volume</label><input type="range" id="setMusic" min="0" max="1" step="0.05" value="${st.music}">
        <label for="setSfx">Sound effects volume</label><input type="range" id="setSfx" min="0" max="1" step="0.05" value="${st.sfx}">
        <label class="check"><input type="checkbox" id="setMute" ${st.muted ? 'checked' : ''}> Mute all sound</label>
        <label class="check"><input type="checkbox" id="setMotion" ${st.reduceMotion ? 'checked' : ''}> Reduce motion (no screen shake or flashes)</label>
        <label class="check"><input type="checkbox" id="setType" ${st.typewriter ? 'checked' : ''}> Typewriter text in dialogue</label>
        <label for="setSpeed">Dialogue speed</label>
        <select id="setSpeed"><option value="slow">Slow</option><option value="normal">Normal</option><option value="fast">Fast</option></select>
      </div>
      <div class="row wrap">
        ${extra.hideEdit ? '' : '<button class="btn" id="editLook">Edit character</button>'}
        <button class="btn" id="openSources">Sources</button>
        <button class="btn" id="openCredits">Credits</button>
        <button class="btn danger" id="resetSave">Reset progress</button>
        <button class="btn primary" data-close>Done</button>
      </div>
      <div id="confirmReset" class="confirm" hidden><p>Erase your character, gold, Library and best scores on this device?</p><div class="row"><button class="btn danger" id="resetYes">Erase progress</button><button class="btn" id="resetNo">Keep it</button></div></div>`;
    const box = open(h, 'settings', onClose);
    box.querySelector('#setSpeed').value = st.textSpeed;
    const upd = () => { st.music = +box.querySelector('#setMusic').value; st.sfx = +box.querySelector('#setSfx').value; st.muted = box.querySelector('#setMute').checked; st.reduceMotion = box.querySelector('#setMotion').checked; st.typewriter = box.querySelector('#setType').checked; st.textSpeed = box.querySelector('#setSpeed').value; S.persist(); S.audio.apply(); };
    box.querySelectorAll('input,select').forEach(i => i.addEventListener('input', upd));
    box.querySelectorAll('input,select').forEach(i => i.addEventListener('change', upd));
    const ed = box.querySelector('#editLook'); if (ed) ed.addEventListener('click', () => { const g = extra.onEdit; S.closeOverlay(); g && g(); });
    box.querySelector('#openSources').addEventListener('click', () => S.openSources(() => S.openSettings(onClose, extra)));
    box.querySelector('#openCredits').addEventListener('click', () => S.openCredits(() => S.openSettings(onClose, extra)));
    box.querySelector('#resetSave').addEventListener('click', () => { box.querySelector('#confirmReset').hidden = false; box.querySelector('#resetYes').focus(); });
    box.querySelector('#resetNo').addEventListener('click', () => { box.querySelector('#confirmReset').hidden = true; });
    box.querySelector('#resetYes').addEventListener('click', () => { const keep = S.save.settings; S.save = S.defaultSave(); S.save.settings = keep; S.persist(); S.closeOverlay(); if (extra.onReset) extra.onReset(); });
  };

  S.openSources = (onClose) => {
    const byS = {};
    Object.entries(CONTENT.CLAIMS).forEach(([id, c]) => { (byS[c.src] = byS[c.src] || []).push(c); });
    let h = `<h2>Sources</h2><p>Every health statement in the game comes from one of these pages. Each was read and last verified on ${CONTENT.ACCESSED}. Wording is paraphrased and kept no stronger than the source.</p>`;
    Object.entries(CONTENT.SOURCES).forEach(([k, s]) => {
      h += `<section class="srcblock"><h3>${esc(s.publisher)}</h3><p><a href="${s.url}" target="_blank" rel="noopener">${esc(s.title)}</a></p><ul>` + (byS[k] || []).map(c => `<li>${esc(c.claim)} <span class="kind">${c.strength}</span></li>`).join('') + '</ul></section>';
    });
    h += `<p class="disclaimer">For awareness only. Not a diagnosis or medical advice.</p><div class="row"><button class="btn primary" data-close autofocus>Back</button></div>`;
    open(h, 'sources', onClose);
  };

  S.openCredits = (onClose) => {
    const h = `<h2>Credits</h2>
      <p><strong>ReBloom</strong> was made for the CodeVerse Hackathon 2026, theme: Education in Health through Games.</p>
      <ul>
        <li>Art: original pixel art drawn in code for this game.</li>
        <li>Engine: Phaser 3.</li>
        <li>Fonts: Pixelify Sans, Press Start 2P and Atkinson Hyperlegible, from Google Fonts (SIL Open Font License).</li>
        <li>Music and sound: an original soundtrack composed in code, one theme per room.</li>
        <li>Health content: World Health Organization, MedlinePlus (U.S. National Library of Medicine), NHS and NIMH. See Sources.</li>
      </ul>
      <p class="disclaimer">This game raises awareness of stress, low mood, anxiety and OCD. It is not a diagnosis or treatment tool. If you are struggling, talk to someone you trust or a health worker. If you are in danger, contact local emergency services or a crisis line.</p>
      <div class="row"><button class="btn primary" data-close autofocus>Back</button></div>`;
    open(h, 'credits', onClose);
  };

  S.askName = (current, cb) => {
    const h = `<h2>Name your character</h2><form id="nameForm" class="form"><label for="nameInput">Name</label><input id="nameInput" maxlength="12" autocomplete="off" value="${esc(current)}" autofocus><p class="hint">Up to 12 letters.</p><div class="row"><button class="btn primary" type="submit">Save name</button><button class="btn" type="button" data-close>Cancel</button></div></form>`;
    const box = open(h, 'small');
    const inp = box.querySelector('#nameInput'); setTimeout(() => { inp.focus(); inp.select(); }, 40);
    box.querySelector('#nameForm').addEventListener('submit', (e) => { e.preventDefault(); const v = inp.value.trim().slice(0, 12) || 'Akira'; S.closeOverlay(); cb(v); });
  };
})();
