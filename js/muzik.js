window.G = window.G || {};
(function () {
  var NOTA = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  function midi(s) {
    var m = /^([a-g])(#|b)?(\d)$/.exec(s); if (!m) return 0;
    return 12 * (+m[3] + 1) + NOTA[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  }
  function hz(n) { return 440 * Math.pow(2, (n - 69) / 12); }
  function pc(s) { return NOTA[s[0]] + (s[1] === '#' ? 1 : 0); }
  var TUR = { M: [0, 4, 7], m: [0, 3, 7], '7': [0, 4, 7, 10] };
  function m8(s) { return s.split(' '); }

  // ---------- parçalar ----------
  // prog: akor (kök+tür), mel: bar başına spb adet 8'lik (. = es, * = zil tınısı), bass: r kök,5 beşli,o oktav,. yok
  var P = {
    menu: { bpm: 116, spb: 8, swing: 0.1, lead: 'mar', len: 1, vol: 1,
      prog: ['c M', 'a m', 'f M', 'g M', 'c M', 'a m', 'f M', 'g 7'],
      mel: ['e5 . g5 e5 c5 . d5 e5', 'a4 . c5 e5 a5 . g5 e5', 'f5 . a5 f5 c5 . d5 f5', 'g5 . d5 . b4 . d5 g5',
        'e5 . g5 e5 c6 . b5 g5', 'a5 . g5 e5 c5 . e5 a4', 'f5 a5 . f5 d5 . c5 d5', 'd5 . b4 . g4 . . .'],
      bass: 'r.5.r.5.', stab: '........', k: '........', s: '........', h: '1.1.1.1.', w: '........', bassTip: 'pizz' },
    ev: { bpm: 104, spb: 8, swing: 0, lead: 'cel', len: 1, vol: 1,
      prog: ['a m', 'a m', 'd m', 'e 7', 'a m', 'f M', 'e 7', 'a m'],
      mel: ['a4 . c5 . e5 . . .', '. . e5 d5 c5 . b4 .', 'd5 . f5 . a5 . . .', 'g#4 . b4 . e5 . . .',
        'a4 . c5 . e5 . a5 .', 'f5 . e5 . d5 . c5 .', 'b4 . c5 . d5 . e5 .', 'a4 . . e4 a4 . . .'],
      bass: 'r...5...', stab: '........', k: '........', s: '........', h: '........', w: '.1.1.1.1', bassTip: 'stac' },
    ebe: { bpm: 96, spb: 6, swing: 0, lead: 'acc', len: 2, vol: 1,
      prog: ['d m', 'g m', 'a 7', 'd m', 'd m', 'a# M', 'a 7', 'd m'],
      mel: ['a4 . d5 . f5 .', 'g5 . f5 . e5 .', 'c#5 . e5 . g5 .', 'f5 . a5 . f5 .', 'a5 . g5 . f5 .', 'a#4 . d5 . f5 .', 'e5 . g5 . c#5 .', 'd5 . f5 . d5 .'],
      bass: 'r.....', stab: '..x.x.', k: '......', s: '......', h: '......', w: '......', bassTip: 'pizz' },
    park: { bpm: 112, spb: 8, swing: 0.28, lead: 'mar', len: 1, vol: 1, chirp: true,
      prog: ['g M', 'e m', 'c M', 'd M', 'g M', 'e m', 'c M', 'd 7'],
      mel: ['b4 d5 g5 . d5 . b4 .', 'e5 . g5 b5 g5 . e5 .', 'c5 e5 g5 . e5 . c5 .', 'd5 . f#5 a5 f#5 . d5 .',
        'g5 . b5 . d6 . b5 g5', 'e5 g5 b5 . g5 e5 . .', 'c5 . e5 g5 c6 . g5 e5', 'd5 . c5 . b4 . a4 .'],
      bass: 'r.5.o.5.', stab: '.x.x.x.x', k: '1...1...', s: '..1...1.', h: '11111111', w: '........', bassTip: 'pizz' },
    okul: { bpm: 128, spb: 8, swing: 0, lead: 'tru', len: 1, vol: 1,
      prog: ['f M', 'a# M', 'c M', 'f M', 'f M', 'a# M', 'c 7', 'f M'],
      mel: ['*c6 . *a5 . *c6 . *a5 .', 'd5 . f5 . a#5 . f5 .', 'e5 . g5 . c6 . g5 .', 'a5 . g5 . f5 . . .',
        'f5 f5 a5 . c6 . a5 .', 'd6 . c6 . a#5 . a5 .', 'g5 . a5 . a#5 . g5 .', 'f5 . c5 . f5 . . .'],
      bass: 'r.5.r.5.', stab: '.x.x.x.x', k: '1...1...', s: '..1...11', h: '........', w: '........', bassTip: 'stac' },
    kazandi: { bpm: 150, spb: 8, swing: 0, lead: 'tru', len: 1, vol: 1, once: true,
      prog: ['c M', 'c M'],
      mel: ['c5 e5 g5 c6 . g5 c6 .', 'g5 . c6 . e6 . . .'],
      bass: 'r.5.r.5.', stab: '.x.x.x.x', k: '1...1...', s: '..1...1.', h: '........', w: '........', bassTip: 'stac' }
  };
  Object.keys(P).forEach(function (n) { P[n].melP = P[n].mel.map(m8); });

  // ---------- durum ----------
  var S = { ac: null, out: null, mus: null, comp: null, noise: null, bus: null, tr: null, ad: null,
    slot: 0, next: 0, vol: 0.18, ger: 0, zam: null, elle: false, bitti: false, trem: null, kapali: false };

  function ok() { return S.ac && S.ac.state !== 'closed'; }
  function baslat(ac, hedef, secenek) {
    try {
      if (S.zam) { clearInterval(S.zam); S.zam = null; }
      S.ac = ac; S.elle = !!(secenek && secenek.elle); S.tr = null; S.ad = null; S.bus = null; S.trem = null; S.ger = 0;
      S.mus = ac.createGain(); S.mus.gain.value = S.kapali ? 0 : S.vol;
      S.comp = ac.createDynamicsCompressor();
      S.comp.threshold.value = -14; S.comp.knee.value = 12; S.comp.ratio.value = 6; S.comp.attack.value = 0.005; S.comp.release.value = 0.15;
      var cik = ac.createGain(); cik.gain.value = 0.3;
      var sh = ac.createWaveShaper(), cu = new Float32Array(1025);
      for (var q = 0; q < 1025; q++) cu[q] = Math.tanh((q - 512) / 256); // yumuşak sınırlayıcı: tepe asla 1'i geçmez
      sh.curve = cu;
      S.mus.connect(S.comp); S.comp.connect(cik); cik.connect(sh); sh.connect(hedef || ac.destination);
      var n = Math.floor(ac.sampleRate * 0.5), buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
      var seed = 12345; for (var i = 0; i < n; i++) { seed = (seed * 1664525 + 1013904223) >>> 0; d[i] = seed / 2147483648 - 1; }
      S.noise = buf;
      if (!S.elle) S.zam = setInterval(tick, 25);
    } catch (h) { S.ac = null; }
  }

  // ---------- sesler ----------
  function env(dest, t, atk, dur, vol, tip) {
    var g = S.ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + atk);
    if (tip === 'tut') { g.gain.setValueAtTime(vol, t + Math.max(atk, dur - 0.06)); g.gain.linearRampToValueAtTime(0.0001, t + dur); }
    else g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(dest); return g;
  }
  function osc(g, tip, f, t, dur, det) {
    var o = S.ac.createOscillator(); o.type = tip; o.frequency.setValueAtTime(f, t); if (det) o.detune.value = det;
    o.connect(g); o.start(t); o.stop(t + dur + 0.05); return o;
  }
  var ENS = {
    mar: function (d, f, t, du, v) {
      var g = env(d, t, 0.004, Math.max(0.25, du * 1.6), v * 0.55); osc(g, 'sine', f, t, du * 2);
      var g2 = env(d, t, 0.002, 0.09, v * 0.25); osc(g2, 'sine', f * 4, t, 0.1);
    },
    cel: function (d, f, t, du, v) {
      var g = env(d, t, 0.003, 0.55, v * 0.5); osc(g, 'sine', f, t, 0.6);
      var g2 = env(d, t, 0.002, 0.3, v * 0.2); osc(g2, 'sine', f * 2, t, 0.35);
      var g3 = env(d, t, 0.002, 0.12, v * 0.1); osc(g3, 'sine', f * 5.04, t, 0.15);
    },
    acc: function (d, f, t, du, v) {
      var fl = S.ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 1700; fl.connect(d);
      var g = env(fl, t, 0.05, du, v * 0.3, 'tut');
      osc(g, 'sawtooth', f, t, du, -7); osc(g, 'sawtooth', f, t, du, 7); osc(g, 'square', f * 2, t, du, 0);
    },
    tru: function (d, f, t, du, v) {
      var fl = S.ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(900, t); fl.frequency.linearRampToValueAtTime(2600, t + 0.06); fl.connect(d);
      var g = env(fl, t, 0.012, du * 0.95, v * 0.3, 'tut');
      osc(g, 'sawtooth', f, t, du, -4); osc(g, 'sawtooth', f, t, du, 4);
    },
    bel: function (d, f, t, du, v) {
      var g = env(d, t, 0.002, 0.9, v * 0.45); osc(g, 'sine', f, t, 1);
      var g2 = env(d, t, 0.002, 0.5, v * 0.2); osc(g2, 'sine', f * 2.76, t, 0.55);
      var g3 = env(d, t, 0.002, 0.25, v * 0.1); osc(g3, 'sine', f * 5.4, t, 0.3);
    },
    pizz: function (d, f, t, du, v) {
      var g = env(d, t, 0.004, 0.22, v * 0.9); osc(g, 'triangle', f, t, 0.25);
      var g2 = env(d, t, 0.002, 0.07, v * 0.3); osc(g2, 'sine', f * 3, t, 0.1);
    },
    stac: function (d, f, t, du, v) {
      var g = env(d, t, 0.004, 0.12, v * 0.9); osc(g, 'triangle', f, t, 0.15); osc(g, 'square', f, t, 0.15, 3);
    },
    stab: function (d, f, t, du, v) { var g = env(d, t, 0.003, 0.1, v * 0.22); osc(g, 'triangle', f, t, 0.12); }
  };
  function gur(d, t, dur, vol, tip, f, q) {
    var s = S.ac.createBufferSource(), fl = S.ac.createBiquadFilter(), g = S.ac.createGain();
    s.buffer = S.noise; s.loop = true; fl.type = tip; fl.frequency.value = f; fl.Q.value = q || 1;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(d); s.start(t, (t * 7.3) % 0.4); s.stop(t + dur + 0.03);
  }
  function kick(d, t, v) {
    var o = S.ac.createOscillator(), g = S.ac.createGain();
    o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g); g.connect(d); o.start(t); o.stop(t + 0.2);
  }
  function civil(d, t, v, k) {
    var f0 = 3300 + (k % 3) * 350, o = S.ac.createOscillator(), g = S.ac.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 1.5, t + 0.05); o.frequency.exponentialRampToValueAtTime(f0 * 1.1, t + 0.1);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v * 0.18, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(g); g.connect(d); o.start(t); o.stop(t + 0.15);
  }

  // ---------- zamanlayıcı ----------
  function slotSure(tr, slot) {
    var d = 30 / (tr.bpm * (1 + 0.2 * S.ger));
    return d * (slot % 2 === 0 ? 1 + tr.swing : 1 - tr.swing);
  }
  function calSlot(tr, s, t) {
    var bus = S.bus, spb = tr.spb, bars = tr.prog.length, bar = Math.floor(s / spb) % bars, k = s % spb,
      loop = Math.floor(s / (spb * bars)), v = loop % 4, sd = slotSure(tr, s), g = S.ger;
    var ch = tr.prog[bar].split(' '), prc = pc(ch[0]), tones = TUR[ch[1]];
    var bassM = 36 + prc, stabM = 60 + prc - (prc > 6 ? 12 : 0);
    // melodi
    var tok = tr.melP[bar][k];
    if (tok && tok !== '.') {
      var zil = tok[0] === '*'; if (zil) tok = tok.slice(1);
      var n = midi(tok);
      if ((v & 1) && bar >= 4 && n + 12 <= 88 && !zil) n += 12;
      var ins = zil ? ENS.bel : ENS[tr.lead], du = sd * tr.len * 0.92;
      ins(bus, hz(n), t, du, 1);
      if ((v & 2) && !zil && tr.len === 1 && tr.melP[bar][k + 1] === '.') ins(bus, hz(n), t + sd, du, 0.3);
    }
    // bas
    var bc = tr.bass[k], bt = ENS[tr.bassTip];
    if (bc && bc !== '.') {
      var bn = bc === 'r' ? bassM : bc === '5' ? bassM + 7 : bc === 'o' ? bassM + 12 : bassM + 4;
      bt(bus, hz(bn), t, sd, 0.8);
    }
    if (g > 0.5 && k % 2 === 1 && tr.spb % 2 === 0) bt(bus, hz(bassM + 12), t, sd, 0.5 * g); // gerilimde sekizlik bas
    // akor vuruşu
    if (tr.stab[k] === 'x') for (var i = 0; i < tones.length; i++) ENS.stab(bus, hz(stabM + tones[i]), t, sd, 1);
    // davul
    if (tr.k[k] === '1') kick(bus, t, 0.5);
    if (tr.s[k] === '1') gur(bus, t, 0.09, 0.22, 'bandpass', 1900, 0.8);
    if (tr.h[k] === '1') gur(bus, t, 0.035, 0.09, 'highpass', 7000);
    if (tr.w[k] === '1') { var o = S.ac.createOscillator(), gg = env(bus, t, 0.002, 0.05, 0.12); o.frequency.value = k % 4 === 1 ? 1500 : 1180; o.connect(gg); o.start(t); o.stop(t + 0.08); }
    if (g > 0.3 && tr.h[k] !== '1' && k % 2 === 0) gur(bus, t, 0.03, 0.05 + 0.06 * g, 'highpass', 8000);
    // kuş
    if (tr.chirp && ((loop + bar) % 3 === 1) && k === 5) { civil(bus, t, 1, bar); civil(bus, t + 0.13, 0.8, bar + 1); }
  }
  function planla(upto) {
    var tr = S.tr, guard = 0;
    while (tr && S.next < upto && guard++ < 64) {
      if (tr.once && S.slot >= tr.spb * tr.prog.length) { S.bitti = true; S.tr = null; break; }
      calSlot(tr, S.slot, S.next);
      S.next += slotSure(tr, S.slot); S.slot++;
    }
  }
  function tick() {
    try {
      if (!ok() || !S.tr) return;
      if (S.ac.state !== 'running') { S.next = 0; return; }
      var now = S.ac.currentTime;
      if (S.next < now - 0.25 || S.next === 0) S.next = now + 0.05; // sekme dondurulmuşsa yığılmasın
      planla(now + 0.1);
    } catch (h) { }
  }

  function parca(ad) {
    try {
      if (!ok() || !P[ad]) return;
      if (S.ad === ad && S.tr) return;
      var now = S.ac.currentTime, eski = S.bus;
      if (eski) {
        eski.gain.cancelScheduledValues(now); eski.gain.setValueAtTime(eski.gain.value, now); eski.gain.linearRampToValueAtTime(0, now + 0.6);
        if (!S.elle) setTimeout(function () { try { eski.disconnect(); } catch (h) { } }, 900);
      }
      var bus = S.ac.createGain(); bus.connect(S.mus);
      if (eski) { bus.gain.setValueAtTime(0, now); bus.gain.linearRampToValueAtTime(1, now + 0.6); } else bus.gain.value = 1;
      S.bus = bus; S.tr = P[ad]; S.ad = ad; S.slot = 0; S.bitti = false; S.next = now + 0.06;
      if (S.elle) S.next = Math.max(S.next, 0.06);
    } catch (h) { }
  }
  function durdur() {
    try {
      S.tr = null; S.ad = null;
      if (S.bus && ok()) { var b = S.bus, now = S.ac.currentTime; b.gain.cancelScheduledValues(now); b.gain.setValueAtTime(b.gain.value, now); b.gain.linearRampToValueAtTime(0, now + 0.3); S.bus = null; if (!S.elle) setTimeout(function () { try { b.disconnect(); } catch (h) { } }, 600); }
      tremolo(0);
    } catch (h) { }
  }
  function ses(v) {
    if (v == null) return S.vol;
    S.vol = Math.max(0, Math.min(1, +v || 0));
    try { if (ok() && S.mus) S.mus.gain.setTargetAtTime(S.kapali ? 0 : S.vol, S.ac.currentTime, 0.03); } catch (h) { }
    return S.vol;
  }
  function sustur(b) {
    S.kapali = !!b;
    try { if (ok() && S.mus) S.mus.gain.setTargetAtTime(S.kapali ? 0 : S.vol, S.ac.currentTime, 0.03); } catch (h) { }
  }
  function tremolo(g) {
    try {
      if (!ok() || !S.mus) return;
      if (!S.trem) {
        if (g <= 0.02) return;
        var o = S.ac.createOscillator(), l = S.ac.createOscillator(), og = S.ac.createGain(), lg = S.ac.createGain();
        o.type = 'triangle'; o.frequency.value = 1244; l.frequency.value = 9;
        og.gain.value = 0; lg.gain.value = 0;
        l.connect(lg); lg.connect(og.gain); o.connect(og); og.connect(S.mus);
        o.start(); l.start();
        S.trem = { og: og, lg: lg, o: o, l: l };
      }
      var a = 0.06 * g, now = S.ac.currentTime;
      S.trem.og.gain.setTargetAtTime(a, now, 0.15); S.trem.lg.gain.setTargetAtTime(a, now, 0.15);
      if (g <= 0.02) { var tr = S.trem; S.trem = null; setTimeout(function () { try { tr.o.stop(); tr.l.stop(); tr.og.disconnect(); } catch (h) { } }, 700); }
    } catch (h) { }
  }
  function gerilim(x) {
    x = Math.max(0, Math.min(1, +x || 0));
    if (Math.abs(x - S.ger) < 0.01 && !(x === 0 && S.ger !== 0)) return;
    S.ger = x; tremolo(x);
  }

  G.muzik = {
    baslat: baslat, parca: parca, durdur: durdur, ses: ses, gerilim: gerilim, sustur: sustur,
    bolumParcasi: function (n) { return { 1: 'ev', 2: 'ebe', 3: 'park', 4: 'okul', 5: 'ebe', 6: 'menu' }[n] || 'ev'; },
    parcalar: Object.keys(P),
    mevcut: function () { return S.ad; },
    // test: çevrimdışı bağlamda 'sn' saniyeye kadar notaları önceden yerleştirir
    doldur: function (sn) { planla(sn); }
  };
})();
