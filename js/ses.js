window.G = window.G || {};
(function () {
  var ctx = null, master = null, sfx = null, duck = null, gurultu = null;
  var kapali = false, kuruldu = false;
  var sonHey = 0, sonFanfar = 0, sonMod = null;

  function hz(n) { return 440 * Math.pow(2, (n - 69) / 12); }

  function ac() {
    try {
      if (!ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        master = ctx.createGain(); master.gain.value = kapali ? 0 : 0.5; master.connect(ctx.destination);
        sfx = ctx.createGain(); sfx.gain.value = efektCarpan(); sfx.connect(master);
        duck = ctx.createGain(); duck.gain.value = 1; duck.connect(master);   // müzik yolu: duraklatmada kısılır
        var n = ctx.sampleRate, buf = ctx.createBuffer(1, n, ctx.sampleRate), dv = buf.getChannelData(0);
        for (var i = 0; i < n; i++) dv[i] = Math.random() * 2 - 1;
        gurultu = buf;
        try { if (G.muzik && G.muzik.baslat) { G.muzik.baslat(ctx, duck); if (G.muzik.sustur) G.muzik.sustur(kapali); } } catch (h2) { console.error('muzik.baslat', h2); }
        sonParca = null;
        try { if (G.ayarlar && G.ayarlar.uygula) G.ayarlar.uygula(); } catch (h3) { }
      }
      if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
    } catch (h) { ctx = null; return null; }
    return ctx;
  }
  function efektCarpan() { try { return G.ayarlar ? G.ayarlar.efektCarpan() : 1; } catch (h) { return 1; } }
  function hazir() { return ctx && ctx.state === 'running' && !kapali; }

  // --- sentez yardımcıları ---
  function ton(dest, f, t, sure, tip, vol, ata, f2) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tip || 'sine';
    o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + sure);
    ata = ata || 0.005;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + ata);
    g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + sure + 0.05);
    return o;
  }
  function vurus(dest, t, sure, vol, ftip, f1, f2, q) {
    var s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = gurultu; s.loop = true;
    fl.type = ftip || 'bandpass'; fl.Q.value = q || 1;
    fl.frequency.setValueAtTime(f1, t);
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + sure);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + Math.min(0.02, sure / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
    s.connect(fl); fl.connect(g); g.connect(dest);
    s.start(t, Math.random()); s.stop(t + sure + 0.05);
  }

  // --- efektler ---
  var E = {
    adimOyuncu: function (v) { var t = ctx.currentTime; vurus(sfx, t, 0.07, v, 'lowpass', 500, 200, 0.7); },
    adimKomsu: function (v) { var t = ctx.currentTime; ton(sfx, 90, t, 0.14, 'sine', v, 0.004, 45); vurus(sfx, t, 0.08, v * 0.5, 'lowpass', 600, 200, 0.7); },
    kapiAc: function () {
      var t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(180, t);
      o.frequency.linearRampToValueAtTime(420, t + 0.35); o.frequency.linearRampToValueAtTime(300, t + 0.5);
      fl.type = 'bandpass'; fl.frequency.value = 900; fl.Q.value = 4;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.12, t + 0.05); g.gain.linearRampToValueAtTime(0.0001, t + 0.55);
      o.connect(fl); fl.connect(g); g.connect(sfx); o.start(t); o.stop(t + 0.6);
    },
    kapiKapa: function () { var t = ctx.currentTime; ton(sfx, 120, t, 0.18, 'sine', 0.3, 0.003, 50); vurus(sfx, t, 0.1, 0.12, 'lowpass', 800, 200); },
    kilitli: function () {
      var t = ctx.currentTime;
      for (var i = 0; i < 3; i++) { ton(sfx, 900 - i * 80, t + i * 0.07, 0.04, 'square', 0.1, 0.001); vurus(sfx, t + i * 0.07, 0.03, 0.12, 'highpass', 2500); }
    },
    kilitAcildi: function () {
      var t = ctx.currentTime;
      ton(sfx, 1200, t, 0.08, 'square', 0.08, 0.001);
      [784, 988, 1175, 1568].forEach(function (f, i) { ton(sfx, f, t + 0.12 + i * 0.08, 0.5, 'triangle', 0.14, 0.005); ton(sfx, f * 2, t + 0.12 + i * 0.08, 0.3, 'sine', 0.04, 0.005); });
    },
    bling: function () {
      var t = ctx.currentTime;
      ton(sfx, 1318, t, 0.25, 'triangle', 0.18, 0.003); ton(sfx, 1760, t + 0.08, 0.4, 'triangle', 0.18, 0.003); ton(sfx, 3520, t + 0.08, 0.2, 'sine', 0.04, 0.003);
    },
    anahtarSevinc: function () {
      var t = ctx.currentTime;
      [523, 659, 784, 1047, 1319].forEach(function (f, i) { ton(sfx, f, t + i * 0.08, 0.35, 'triangle', 0.16, 0.005); ton(sfx, f * 2, t + i * 0.08, 0.2, 'sine', 0.04, 0.005); });
      vurus(sfx, t + 0.4, 0.3, 0.05, 'highpass', 6000);
    },
    cikartma: function () {
      var t = ctx.currentTime;
      ton(sfx, 988, t, 0.12, 'square', 0.07, 0.003); ton(sfx, 1319, t + 0.07, 0.12, 'square', 0.07, 0.003); ton(sfx, 1976, t + 0.14, 0.3, 'triangle', 0.13, 0.004);
    },
    yildiz: function (i) {
      var t = ctx.currentTime, f = [784, 988, 1319][Math.max(0, Math.min(2, i | 0))];
      ton(sfx, f, t, 0.35, 'triangle', 0.17, 0.004); ton(sfx, f * 2, t, 0.25, 'sine', 0.05, 0.004); ton(sfx, f * 3, t + 0.03, 0.12, 'sine', 0.025, 0.004);
    },
    aramaHis: function () { var t = ctx.currentTime; vurus(sfx, t, 0.22, 0.12, 'bandpass', 2200, 1400, 0.8); },
    bosArama: function () { var t = ctx.currentTime; ton(sfx, 392, t, 0.12, 'triangle', 0.1, 0.01); ton(sfx, 330, t + 0.12, 0.2, 'triangle', 0.1, 0.01); },
    ipucu: function () { var t = ctx.currentTime; [1568, 1976, 2349].forEach(function (f, i) { ton(sfx, f, t + i * 0.09, 0.3, 'sine', 0.08, 0.004); }); },
    zil: function () {
      var t = ctx.currentTime;
      for (var i = 0; i < 14; i++) { ton(sfx, 1760, t + i * 0.11, 0.1, 'square', 0.07, 0.002); ton(sfx, 2217, t + i * 0.11, 0.1, 'square', 0.05, 0.002); }
    },
    anonsGong: function () {
      var t = ctx.currentTime;
      ton(sfx, 784, t, 0.7, 'sine', 0.2, 0.01); ton(sfx, 659, t + 0.45, 0.9, 'sine', 0.2, 0.01); ton(sfx, 523, t + 0.9, 1.3, 'sine', 0.2, 0.01);
      vurus(sfx, t + 1.5, 0.9, 0.05, 'bandpass', 1500, 800, 1);
    },
    firlat: function () { var t = ctx.currentTime; vurus(sfx, t, 0.3, 0.3, 'bandpass', 500, 2500, 2); },
    tak: function () { var t = ctx.currentTime; ton(sfx, 320, t, 0.07, 'square', 0.1, 0.001, 150); vurus(sfx, t, 0.04, 0.2, 'bandpass', 1500, null, 1); },
    hisirti: function () { var t = ctx.currentTime; vurus(sfx, t, 0.4, 0.22, 'bandpass', 2500, 1200, 0.8); vurus(sfx, t + 0.15, 0.3, 0.15, 'bandpass', 3000, 1500, 0.8); },
    sting: function () {
      var t = ctx.currentTime;
      ton(sfx, 466, t, 0.35, 'sawtooth', 0.12, 0.003); ton(sfx, 659, t, 0.35, 'sawtooth', 0.12, 0.003); ton(sfx, 932, t + 0.05, 0.3, 'square', 0.08, 0.003);
    },
    heySentez: function () {
      var t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(220, t); o.frequency.linearRampToValueAtTime(330, t + 0.1); o.frequency.linearRampToValueAtTime(200, t + 0.4);
      fl.type = 'bandpass'; fl.Q.value = 5;
      fl.frequency.setValueAtTime(500, t); fl.frequency.linearRampToValueAtTime(1800, t + 0.12); fl.frequency.linearRampToValueAtTime(900, t + 0.4);
      g.gain.setValueAtTime(0.0001, t + 0.03); g.gain.linearRampToValueAtTime(0.35, t + 0.1); g.gain.linearRampToValueAtTime(0.0001, t + 0.45);
      o.connect(fl); fl.connect(g); g.connect(sfx); o.start(t); o.stop(t + 0.5);
      vurus(sfx, t, 0.08, 0.2, 'highpass', 3000);
    },
    suphe: function () { var t = ctx.currentTime; ton(sfx, 330, t, 0.12, 'triangle', 0.12, 0.01); ton(sfx, 392, t + 0.14, 0.18, 'triangle', 0.12, 0.01); },
    vazgecti: function () { var t = ctx.currentTime; [440, 392, 330].forEach(function (f, i) { ton(sfx, f, t + i * 0.12, 0.2, 'triangle', 0.1, 0.01); }); },
    womp: function () {
      var t = ctx.currentTime;
      [[311, 0], [293, 0.38], [277, 0.76]].forEach(function (a) { ton(sfx, a[0], t + a[1], 0.34, 'sawtooth', 0.14, 0.02, a[0] * 0.97); });
      ton(sfx, 233, t + 1.15, 1.0, 'sawtooth', 0.16, 0.03, 150);
    },
    fanfar: function () {
      var t = ctx.currentTime, n = [[60, 0, 0.14], [60, 0.16, 0.14], [60, 0.32, 0.14], [64, 0.48, 0.3], [60, 0.82, 0.14], [64, 0.98, 0.14], [67, 1.14, 0.8]];
      n.forEach(function (a) {
        ton(sfx, hz(a[0] + 12), t + a[1], a[2] + 0.15, 'square', 0.1, 0.005);
        ton(sfx, hz(a[0]), t + a[1], a[2] + 0.15, 'triangle', 0.16, 0.005);
        ton(sfx, hz(a[0] + 19), t + a[1], a[2] + 0.1, 'sine', 0.05, 0.005);
      });
      [72, 76, 79, 84].forEach(function (m, i) { ton(sfx, hz(m + 12), t + 1.2 + i * 0.07, 0.9, 'triangle', 0.08, 0.005); });
    },
    sihirG: function () {
      var t = ctx.currentTime;
      [84, 88, 91, 96, 100].forEach(function (m, i) { ton(sfx, hz(m), t + i * 0.07, 0.35, 'sine', 0.1, 0.01); });
      vurus(sfx, t, 0.5, 0.05, 'highpass', 5000);
    },
    sihirI: function () {
      var t = ctx.currentTime;
      ton(sfx, 200, t, 0.35, 'sawtooth', 0.08, 0.02, 1600);
      ton(sfx, 1568, t + 0.35, 0.8, 'sine', 0.14, 0.005); ton(sfx, 2093, t + 0.37, 0.7, 'sine', 0.07, 0.005);
    },
    gokce: function () {
      var t = ctx.currentTime;
      [[79, 0], [83, 0.1], [86, 0.2], [91, 0.3], [88, 0.45], [91, 0.55]].forEach(function (a) { ton(sfx, hz(a[0]), t + a[1], 0.16, 'sine', 0.12, 0.01, hz(a[0]) * 1.06); });
      ton(sfx, 520, t + 0.8, 0.16, 'triangle', 0.14, 0.01, 700); ton(sfx, 620, t + 1.0, 0.22, 'triangle', 0.14, 0.01, 860);
    },
    esneme: function () {
      var t = ctx.currentTime;
      ton(sfx, 330, t, 0.9, 'sine', 0.12, 0.25, 150);
      vurus(sfx, t + 0.05, 0.8, 0.07, 'bandpass', 700, 300, 1);
    },
    horlama: function (v) {
      var t = ctx.currentTime;
      ton(sfx, 110, t, 0.55, 'sawtooth', v || 0.09, 0.2, 70);
      vurus(sfx, t, 0.55, (v || 0.09) * 0.8, 'lowpass', 400, 200, 0.8);
    },
    vinn: function () {
      var t = ctx.currentTime;
      ton(sfx, 160, t, 1.6, 'sawtooth', 0.07, 0.15, 520);
      vurus(sfx, t, 1.6, 0.08, 'bandpass', 600, 1800, 1.5);
    },
    gum: function () {
      var t = ctx.currentTime;
      ton(sfx, 140, t, 0.25, 'sine', 0.35, 0.002, 45);
      vurus(sfx, t, 0.18, 0.25, 'lowpass', 900, 200, 0.8);
    },
    uhuu: function (v) {
      var t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(), vb = ctx.createOscillator(), vg = ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(520, t); o.frequency.linearRampToValueAtTime(700, t + 0.25); o.frequency.linearRampToValueAtTime(380, t + 1.1);
      vb.frequency.value = 9; vg.gain.value = 22; vb.connect(vg); vg.connect(o.frequency);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.12); g.gain.linearRampToValueAtTime(v * 0.7, t + 0.8); g.gain.linearRampToValueAtTime(0.0001, t + 1.2);
      o.connect(g); g.connect(sfx); o.start(t); o.stop(t + 1.25); vb.start(t); vb.stop(t + 1.25);
    },
    kazaBasari: function () {
      var t = ctx.currentTime;
      [[88, 0], [91, 0.1], [95, 0.2], [100, 0.32]].forEach(function (a) { ton(sfx, hz(a[0]), t + a[1], 0.35, 'sine', 0.12, 0.005); ton(sfx, hz(a[0] - 12), t + a[1], 0.3, 'triangle', 0.06, 0.005); });
    },
    // --- Bölüm 6: bebek sesleri (Beren), ninni, ispiyon, telsiz ---
    bebekBabble: function (v) {   // "ba-ba-ba!" üç kısa hece
      v = v == null ? 1 : v; var t = ctx.currentTime, n = 2 + Math.floor(Math.random() * 2), f0 = 520 + Math.random() * 120;
      for (var i = 0; i < n; i++) { ton(sfx, f0 + i * 25, t + i * 0.14, 0.11, 'triangle', 0.1 * v, 0.012, f0 * 1.3 + i * 20); ton(sfx, f0 * 2, t + i * 0.14, 0.09, 'sine', 0.035 * v, 0.012); }
    },
    bebekKikir: function (v) {    // kıkırdama: hızlı tiz ciyaklar
      v = v == null ? 1 : v; var t = ctx.currentTime;
      for (var i = 0; i < 6; i++) { var f = 780 + (i % 2) * 260 + Math.random() * 60; ton(sfx, f, t + i * 0.085, 0.07, 'sine', 0.085 * v, 0.006, f * 1.12); }
    },
    bebekGordu: function (v) {    // heyecanlı "aaaa!"
      v = v == null ? 1 : v; var t = ctx.currentTime;
      ton(sfx, 480, t, 0.32, 'triangle', 0.11 * v, 0.03, 900); ton(sfx, 960, t, 0.3, 'sine', 0.04 * v, 0.03, 1700);
    },
    bebekEsneme: function () { var t = ctx.currentTime; ton(sfx, 820, t, 0.45, 'triangle', 0.08, 0.05, 480); },
    bebekUyku: function (v) { var t = ctx.currentTime; vurus(sfx, t, 0.5, 0.025 * (v || 1), 'lowpass', 500, 300, 1); },
    ninni: function () {          // yumuşak ninni melodisi
      var t = ctx.currentTime, N = [[72, 0], [72, 0.5], [76, 1.0], [74, 1.5], [72, 2.0], [71, 2.5], [72, 3.0], [67, 3.8], [69, 4.3], [71, 4.8], [72, 5.3], [67, 6.2]];
      N.forEach(function (a) { ton(sfx, hz(a[0]), t + a[1], 0.55, 'triangle', 0.07, 0.03); ton(sfx, hz(a[0] - 12), t + a[1], 0.5, 'sine', 0.035, 0.03); });
    },
    ispiyon: function () {        // Teyze/Enişte'nin neşeli "yuhuu!" seslenişi
      var t = ctx.currentTime; ton(sfx, 600, t, 0.2, 'triangle', 0.1, 0.01, 820); ton(sfx, 880, t + 0.22, 0.32, 'triangle', 0.1, 0.01, 1040);
    },
    telsizCizirti: function (v) { // bebek telsizi: cızırtı + iki bip
      v = v == null ? 1 : v; var t = ctx.currentTime, i;
      for (i = 0; i < 5; i++) vurus(sfx, t + i * 0.07, 0.05, 0.12 * v, 'highpass', 3000 + i * 400);
      ton(sfx, 1200, t + 0.4, 0.1, 'square', 0.05 * v, 0.004); ton(sfx, 1200, t + 0.56, 0.1, 'square', 0.05 * v, 0.004);
    },
    // Atılay'ın mikrofonu: yankılı, hoparlör cızırtılı komik "ALOOOO!" + feedback ıslığı
    mikrofon: function (v) {
      v = v || 1;
      var t = ctx.currentTime, i;
      var bus = ctx.createGain(); bus.gain.value = 1;
      var kir = ctx.createWaveShaper(), egri = new Float32Array(256);
      for (i = 0; i < 256; i++) { var x = i / 128 - 1; egri[i] = Math.tanh(x * 5) * 0.8; }
      kir.curve = egri;
      var dly = ctx.createDelay(1), fb = ctx.createGain(), wet = ctx.createGain(), lp = ctx.createBiquadFilter();
      dly.delayTime.value = 0.19; fb.gain.value = 0.42; wet.gain.value = 0.6; lp.type = 'lowpass'; lp.frequency.value = 2600;
      bus.connect(kir); kir.connect(sfx);
      kir.connect(dly); dly.connect(lp); lp.connect(fb); fb.connect(dly); lp.connect(wet); wet.connect(sfx);
      // ses: "A-LO-OOO" — iki hece, ikincisi uzar
      var o = ctx.createOscillator(), g = ctx.createGain(), fl = ctx.createBiquadFilter(), vb = ctx.createOscillator(), vg = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(190, t); o.frequency.linearRampToValueAtTime(260, t + 0.18);
      o.frequency.setValueAtTime(230, t + 0.24); o.frequency.linearRampToValueAtTime(330, t + 0.5); o.frequency.linearRampToValueAtTime(250, t + 1.15);
      vb.frequency.value = 6; vg.gain.value = 9; vb.connect(vg); vg.connect(o.frequency);
      fl.type = 'bandpass'; fl.Q.value = 4;
      fl.frequency.setValueAtTime(900, t); fl.frequency.linearRampToValueAtTime(700, t + 0.2);
      fl.frequency.linearRampToValueAtTime(1500, t + 0.3); fl.frequency.linearRampToValueAtTime(600, t + 1.15);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.4 * v, t + 0.05); g.gain.linearRampToValueAtTime(0.2 * v, t + 0.2);
      g.gain.linearRampToValueAtTime(0.45 * v, t + 0.3); g.gain.linearRampToValueAtTime(0.3 * v, t + 0.9); g.gain.linearRampToValueAtTime(0.0001, t + 1.2);
      o.connect(fl); fl.connect(g); g.connect(bus);
      o.start(t); o.stop(t + 1.25); vb.start(t); vb.stop(t + 1.25);
      // hoparlör cızırtısı
      for (i = 0; i < 6; i++) vurus(bus, t + 0.03 + i * 0.19, 0.06, 0.16 * v, 'highpass', 2500 + i * 300);
      vurus(bus, t, 1.1, 0.07 * v, 'bandpass', 1800, 900, 1.5);
      // feedback ıslığı
      var w = ctx.createOscillator(), wg = ctx.createGain();
      w.type = 'sine'; w.frequency.setValueAtTime(2400, t + 0.85); w.frequency.exponentialRampToValueAtTime(3600, t + 1.7);
      wg.gain.setValueAtTime(0.0001, t + 0.85); wg.gain.linearRampToValueAtTime(0.1 * v, t + 1.3); wg.gain.linearRampToValueAtTime(0.0001, t + 1.75);
      w.connect(wg); wg.connect(sfx); w.start(t + 0.85); w.stop(t + 1.8);
    },
    // uyanan ebeveyn: şaşkın "hı?!"
    uyandi: function () {
      var t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(150, t); o.frequency.linearRampToValueAtTime(120, t + 0.12); o.frequency.linearRampToValueAtTime(260, t + 0.45);
      fl.type = 'bandpass'; fl.Q.value = 5; fl.frequency.setValueAtTime(600, t); fl.frequency.linearRampToValueAtTime(1300, t + 0.45);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.28, t + 0.08); g.gain.linearRampToValueAtTime(0.0001, t + 0.5);
      o.connect(fl); fl.connect(g); g.connect(sfx); o.start(t); o.stop(t + 0.55);
      ton(sfx, 1200, t + 0.4, 0.12, 'triangle', 0.08, 0.005, 1700);
    },
    // bölüm bitişi: kısa fanfar
    bolumFanfar: function () {
      var t = ctx.currentTime;
      [[67, 0, 0.12], [72, 0.14, 0.12], [76, 0.28, 0.12], [79, 0.42, 0.45]].forEach(function (a) {
        ton(sfx, hz(a[0]), t + a[1], a[2] + 0.15, 'triangle', 0.17, 0.005);
        ton(sfx, hz(a[0] + 12), t + a[1], a[2] + 0.1, 'square', 0.07, 0.005);
      });
      [84, 88, 91].forEach(function (m, i) { ton(sfx, hz(m), t + 0.55 + i * 0.06, 0.7, 'sine', 0.07, 0.005); });
    },
    baslat: function () { var t = ctx.currentTime; ton(sfx, 523, t, 0.1, 'square', 0.08, 0.003); ton(sfx, 784, t + 0.08, 0.2, 'square', 0.08, 0.003); },
    // EK-11: kapı zili (ding-dong), kısa selam sesi, merdiven basamakları
    kapiZili: function () {
      var t = ctx.currentTime;
      [[659, 0], [523, 0.38], [659, 1.0], [523, 1.38]].forEach(function (a) { ton(sfx, a[0], t + a[1], 0.5, 'sine', 0.2, 0.004); ton(sfx, a[0] * 2, t + a[1], 0.3, 'sine', 0.06, 0.004); });
    },
    selamSes: function () {
      var t = ctx.currentTime;
      [[190, 0], [230, 0.16], [200, 0.32], [260, 0.5]].forEach(function (a) { ton(sfx, a[0], t + a[1], 0.15, 'sawtooth', 0.07, 0.01, a[0] * 1.08); });
    },
    merdiven: function () {
      var t = ctx.currentTime;
      for (var i = 0; i < 6; i++) vurus(sfx, t + i * 0.07, 0.06, 0.11, 'lowpass', 520 + i * 40, 220, 0.7);
    }
  };

  var horT = 0, uhuT = 3, sonAsama = null;
  function kazaSes() {
    var d = G.d;
    if (!d || !d.kaza || !d.oyuncu) return 0.15;
    var m = Math.hypot(d.kaza.x - d.oyuncu.x, d.kaza.y - d.oyuncu.y);
    return 0.05 + 0.2 * Math.max(0, 1 - m / 900);
  }
  function efekt(ad, a, b) {
    if (!hazir() || !E[ad]) return;
    try { E[ad](a, b); } catch (h) { /* sessiz */ }
  }

  function hey() {
    var simdi = Date.now();
    if (simdi - sonHey < 1500) return;
    sonHey = simdi;
    efekt('sting');
    var konustu = false;
    try {
      if (!kapali && window.speechSynthesis && window.SpeechSynthesisUtterance) {
        var u = new SpeechSynthesisUtterance('Hey!');
        u.lang = 'tr-TR'; u.pitch = 0.5; u.rate = 1.1; u.volume = 0.9;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
        konustu = true;
      }
    } catch (h) { konustu = false; }
    if (!konustu) efekt('heySentez');
  }

  // --- müzik: js/muzik.js (G.muzik) çalar; burada yalnız parça seçimi, gerilim ve kısma yönetilir ---
  var sonParca = null, gerSm = 0, duckHedef = 1;
  function parcaSec(d, dt) {
    if (!d) return;
    var m = d.mod, ad = null;
    if (m === 'menu') ad = 'menu';
    else if (m === 'oyun' || m === 'duraklat') ad = G.muzik.bolumParcasi(G.bolum);
    else if (m === 'bolumBitti' || m === 'kazandi') ad = 'kazandi';
    // 'yakalandi': mevcut parça sürer
    if (ad && ad !== sonParca) { sonParca = ad; try { G.muzik.parca(ad); } catch (h) { } }
    var kov = m === 'oyun' && ((d.komsu && d.komsu.durum === 'kovalama') || (d.uyanan && d.uyanan.durum === 'kovalama'));
    gerSm += ((kov ? 1 : 0) - gerSm) * Math.min(1, dt * 1.6);
    if (gerSm < 0.02 && !kov) gerSm = 0;
    try { G.muzik.gerilim(gerSm); } catch (h) { }
    duckHedef = m === 'duraklat' ? 0.3 : 1;
    if (duck) duck.gain.setTargetAtTime(duckHedef, ctx.currentTime, 0.15);
  }

  function sustur(b) {
    kapali = !!b;
    if (master && ctx) master.gain.setTargetAtTime(kapali ? 0 : 0.5, ctx.currentTime, 0.02);
    try { if (G.muzik && G.muzik.sustur) G.muzik.sustur(kapali); } catch (h) { }
    G.ses.kapali = kapali;
    if (kapali) { try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (h) { } }
  }

  function dinleKur() {
    G.dinle('adim', function (e) {
      if (!hazir()) return;
      if (e.kim === 'komsu') {
        var d = G.d;
        if (e.kat != null && d && d.oyuncu && G.harita && G.harita.katOf && e.kat !== G.harita.katOf(d.oyuncu.y)) return;   // başka kattaki adım duyulmaz
        var dist = d && d.oyuncu ? Math.hypot(e.x - d.oyuncu.x, e.y - d.oyuncu.y) : 0;
        if (dist > 520) return;
        var v = 0.5 * Math.pow(1 - dist / 520, 1.6);
        if (v > 0.01) efekt('adimKomsu', v);
      } else {
        efekt('adimOyuncu', e.egik ? 0.0 : (e.kosu ? 0.09 : 0.06));
      }
    });
    G.dinle('kapi_ac', function () { efekt('kapiAc'); });
    G.dinle('misafir_zil', function () { efekt('kapiZili'); setTimeout(function () { efekt('selamSes'); }, 2300); });
    G.dinle('kat_gecti', function () { efekt('merdiven'); });
    G.dinle('kestirme_basladi', function (e) { if (e && e.kim === 'beren') { efekt('bebekEsneme'); return; } efekt('esneme'); setTimeout(function () { efekt('horlama', 0.12); }, 900); });
    G.dinle('bebek_ses', function (e) {
      var d = G.d, v = 0.7;
      if (d && d.oyuncu && e && e.x != null) v = Math.max(0, 1 - Math.hypot(e.x - d.oyuncu.x, e.y - d.oyuncu.y) / 560);
      if (v < 0.05) return;
      efekt(e && e.tur === 'kikir' ? 'bebekKikir' : (e && e.tur === 'gordu' ? 'bebekGordu' : 'bebekBabble'), v);
    });
    G.dinle('ninni', function () { efekt('ninni'); });
    G.dinle('ispiyon', function () { efekt('ispiyon'); });
    G.dinle('kapi_kapa', function () { efekt('kapiKapa'); });
    G.dinle('kapi_kilitli', function () { efekt('kilitli'); });
    G.dinle('kilit_acildi', function () { efekt('kilitAcildi'); });
    G.dinle('esya_al', function (e) { efekt('bling'); if (e && (e.tur === 'anahtar_mavi' || e.tur === 'anahtar_kirmizi' || e.tur === 'top_hazine')) efekt('anahtarSevinc'); });
    G.dinle('firlat', function () { efekt('firlat'); });
    G.dinle('cikartma_al', function () { efekt('cikartma'); });
    G.dinle('yildiz_ses', function (e) { efekt('yildiz', e && e.i); });
    G.dinle('esya_dustu', function () { efekt('tak'); });
    G.dinle('saklan', function () { efekt('hisirti'); });
    G.dinle('saklanmadan_cik', function () { efekt('hisirti'); });
    G.dinle('komsu_gordu', hey);
    G.dinle('komsu_suphe', function () { efekt('suphe'); });
    G.dinle('komsu_vazgecti', function () { efekt('vazgecti'); });
    G.dinle('yakalandi', function () { efekt('womp'); });
    G.dinle('kazandi', function () {
      var ara = !!(G.SON_BOLUM && G.bolum < G.SON_BOLUM);
      sonFanfar = Date.now();
      efekt(ara ? 'bolumFanfar' : 'fanfar');
    });
    G.dinle('sonrakiBolum', function () { efekt('baslat'); });
    G.dinle('mikrofon', function (e) {
      var d = G.d, v = 1;
      if (d && d.oyuncu && e && e.x != null) v = 0.35 + 0.65 * Math.max(0, 1 - Math.hypot(e.x - d.oyuncu.x, e.y - d.oyuncu.y) / 1100);
      efekt('mikrofon', v);
    });
    G.dinle('uyandi', function () { efekt('uyandi'); });
    G.dinle('arama_ses', function () { efekt('aramaHis'); });
    G.dinle('minik_selam', function () { efekt('bebekKikir', 0.45); });
    G.dinle('arama_bitti', function (e) { if (e && !e.bulundu) efekt('bosArama'); });
    G.dinle('ipucu', function () { efekt('ipucu'); });
    G.dinle('zil', function () { efekt('zil'); });
    G.dinle('anons', function () { var bb = false; try { bb = !!G.bolumBilgi().bebek; } catch (e) { } efekt(bb ? 'telsizCizirti' : 'anonsGong'); });
    G.dinle('baslat', function () { efekt('baslat'); });
    G.dinle('nobet_degisti', function (e) { if (e && e.kim === 'beren') { efekt('bebekKikir'); return; } efekt('esneme'); setTimeout(function () { efekt('horlama', 0.12); }, 900); setTimeout(function () { efekt('horlama', 0.09); }, 2100); });
    G.dinle('sihir', function (e) { efekt(e && e.tur === 'isinlanma' ? 'sihirI' : 'sihirG'); });
    G.dinle('gokce_cagrildi', function () { efekt('gokce'); });
    G.dinle('kaza', function () { efekt('gum'); setTimeout(function () { efekt('uhuu', kazaSes()); }, 250); uhuT = 3; });
    G.dinle('kaza_bitti', function (e) { if (e && e.basari) efekt('kazaBasari'); });
  }

  G.ses = {
    kapali: false,
    init: function () {
      if (kuruldu) return;
      kuruldu = true;
      dinleKur();
      G.dinle('ayar_degisti', function () { if (sfx && ctx) sfx.gain.setTargetAtTime(efektCarpan(), ctx.currentTime, 0.03); });
      var ilk = function () { ac(); };
      ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'keydown', 'click'].forEach(function (o) { window.addEventListener(o, ilk, { passive: true }); });
    },
    ac: ac,
    sustur: sustur,
    get ctx() { return ctx; }, get master() { return master; }, get sfx() { return sfx; },
    guncelle: function (dt, d) {
      if (G.girdi && G.girdi.al('sustur')) {
        sustur(!kapali);
        G.mesaj(kapali ? 'Ses kapalı' : 'Ses açık', 1.5);
      }
      if (ctx) parcaSec(d, dt);
      var md = d ? d.mod : null;
      if (md !== sonMod) {
        if (md === 'bolumBitti' && Date.now() - sonFanfar > 1500) { sonFanfar = Date.now(); efekt('bolumFanfar'); }
        sonMod = md;
      }
      var as = d && d.mod === 'oyun' && d.kaza ? d.kaza.asama : null;
      if (as !== sonAsama) { if (as === 'suruyor') efekt('vinn'); sonAsama = as; }
      if (as === 'dustu') { uhuT -= dt; if (uhuT <= 0) { uhuT = 3; efekt('uhuu', kazaSes()); } }
      if (d && d.mod === 'oyun' && d.uyuyan && d.oyuncu) {
        horT -= dt;
        if (horT <= 0 && Math.hypot(d.uyuyan.x - d.oyuncu.x, d.uyuyan.y - d.oyuncu.y) <= 250) { horT = 3.2; efekt(d.uyuyan.kim === 'beren' ? 'bebekUyku' : 'horlama', 0.06); }
      }
    }
  };
})();
