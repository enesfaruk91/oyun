window.G = window.G || {};
(function () {
  var FONT = '"Trebuchet MS", "Arial Rounded MT Bold", "Comic Sans MS", sans-serif';
  var KOYU = '#4a2a12', KREM = '#fff3d6';
  // harf renk çiftleri (üst, alt) - sıcak palet
  var PAL = [['#fff07a', '#ffc21a'], ['#ffc04d', '#ff8a1f'], ['#fff3d6', '#ffd9a0'], ['#ff9a6b', '#ff6a3d']];
  var sprites = {}, olcCache = {};

  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function yaziGen(ch) {
    if (olcCache[ch] != null) return olcCache[ch];
    var cv = document.createElement('canvas').getContext('2d');
    cv.font = '900 100px ' + FONT;
    return (olcCache[ch] = cv.measureText(ch).width / 100);
  }
  // Harf sprite'ı: krem dış kenar + koyu kontur + degrade dolgu + parlak/gölge bantları. px = piksel cinsinden yazı boyu
  function sprite(ch, px, pi) {
    var key = ch + '|' + px + '|' + pi;
    if (sprites[key]) return sprites[key];
    var pad = Math.ceil(px * 0.3), w = Math.ceil(yaziGen(ch) * px + pad * 2), h = Math.ceil(px * 1.5 + pad * 2);
    var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    var c = cv.getContext('2d');
    c.font = '900 ' + px + 'px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    var cx = w / 2, cy = h / 2;
    c.strokeStyle = KREM; c.lineWidth = px * 0.3; c.strokeText(ch, cx, cy);
    c.strokeStyle = KOYU; c.lineWidth = px * 0.19; c.strokeText(ch, cx, cy);
    var f = document.createElement('canvas'); f.width = w; f.height = h;
    var fc = f.getContext('2d');
    fc.font = c.font; fc.textAlign = 'center'; fc.textBaseline = 'middle';
    var g = fc.createLinearGradient(0, cy - px * 0.5, 0, cy + px * 0.5);
    g.addColorStop(0, PAL[pi][0]); g.addColorStop(1, PAL[pi][1]);
    fc.fillStyle = g; fc.fillText(ch, cx, cy);
    fc.globalCompositeOperation = 'source-atop';
    fc.fillStyle = 'rgba(255,255,255,0.5)'; fc.fillRect(0, cy - px * 0.5, w, px * 0.22);
    fc.fillStyle = 'rgba(120,50,10,0.22)'; fc.fillRect(0, cy + px * 0.27, w, px * 0.3);
    c.drawImage(f, 0, 0);
    return (sprites[key] = { cv: cv, w: w, h: h, pad: pad });
  }

  function harfSatiri(c, metin, cy, hedefGen, ofs, t, pxScale, dpr) {
    var i, adv = [], top = 0, bosluk = 0.3;
    for (i = 0; i < metin.length; i++) { var a = metin[i] === ' ' ? bosluk : yaziGen(metin[i]) * 0.98; adv.push(a); top += a; }
    var fz = hedefGen / top;           // tasarım birimi cinsinden yazı boyu
    var px = Math.max(8, Math.round(fz * pxScale * dpr / 4) * 4) ; // sprite piksel boyu (4'e yuvarla)
    var k = fz / px;
    var x = -hedefGen / 2, n = 0;
    for (i = 0; i < metin.length; i++) {
      var w = adv[i] * fz, cx = x + w / 2; x += w;
      if (metin[i] === ' ') continue;
      var sp = sprite(metin[i], px, (n + ofs) % PAL.length);
      var ph = t * 3.4 + n * 0.62 + ofs;
      var zip = Math.sin(ph) * fz * 0.07, egim = Math.sin(t * 2.1 + n * 1.1) * 0.05;
      var sq = 1 + Math.cos(ph) * 0.025;
      c.save(); c.translate(cx, cy + zip); c.rotate(egim); c.scale(sq, 1 / sq);
      c.drawImage(sp.cv, -sp.w / 2 * k, -sp.h / 2 * k, sp.w * k, sp.h * k);
      c.restore(); n++;
    }
  }

  // ---------- simgeler ----------
  function top(c, r, t, donus) {
    var g = c.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.05);
    g.addColorStop(0, '#fff6a8'); g.addColorStop(0.45, '#ffcc33'); g.addColorStop(1, '#ff8a1f');
    c.save();
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
    c.save(); c.clip(); c.rotate(donus || 0);
    c.fillStyle = '#ff5a3c';
    c.beginPath(); c.ellipse(0, 0, r * 0.28, r * 1.1, 0, 0, 7); c.fill();
    c.fillStyle = '#3d8bff';
    c.beginPath(); c.ellipse(0, 0, r * 1.1, r * 0.2, 0, 0, 7); c.fill();
    c.restore();
    c.lineWidth = Math.max(2, r * 0.12); c.strokeStyle = KOYU; c.beginPath(); c.arc(0, 0, r, 0, 7); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.85)'; c.beginPath(); c.ellipse(-r * 0.38, -r * 0.42, r * 0.22, r * 0.13, -0.7, 0, 7); c.fill();
    c.restore();
  }
  function anahtar(c, s, t, goz) {
    // s: halka yarıçapı; anahtar yatay, halka solda
    c.save();
    c.lineJoin = 'round'; c.lineCap = 'round';
    var lw = Math.max(2, s * 0.16);
    var g = c.createLinearGradient(0, -s, 0, s); g.addColorStop(0, '#fff07a'); g.addColorStop(1, '#f0a418');
    // gövde
    c.fillStyle = g; c.strokeStyle = KOYU; c.lineWidth = lw;
    rr(c, s * 0.7, -s * 0.2, s * 2.1, s * 0.4, s * 0.2); c.fill(); c.stroke();
    c.fillRect && 0;
    rr(c, s * 2.0, s * 0.1, s * 0.4, s * 0.65, s * 0.1); c.fill(); c.stroke();
    rr(c, s * 2.5, s * 0.1, s * 0.35, s * 0.5, s * 0.1); c.fill(); c.stroke();
    // halka
    c.beginPath(); c.arc(0, 0, s, 0, 7); c.fill(); c.stroke();
    // yüz
    c.fillStyle = '#fff'; c.lineWidth = lw * 0.5;
    c.beginPath(); c.arc(-s * 0.32, -s * 0.15, s * 0.22, 0, 7); c.fill(); c.stroke();
    c.fillStyle = KOYU; c.beginPath(); c.arc(-s * 0.28, -s * 0.13, s * 0.1, 0, 7); c.fill();
    if (goz) { // göz kırpma
      c.strokeStyle = KOYU; c.lineWidth = lw * 0.55; c.beginPath(); c.moveTo(s * 0.12, -s * 0.15); c.lineTo(s * 0.52, -s * 0.15); c.stroke();
    } else {
      c.fillStyle = '#fff'; c.strokeStyle = KOYU; c.lineWidth = lw * 0.5;
      c.beginPath(); c.arc(s * 0.32, -s * 0.15, s * 0.22, 0, 7); c.fill(); c.stroke();
      c.fillStyle = KOYU; c.beginPath(); c.arc(s * 0.36, -s * 0.13, s * 0.1, 0, 7); c.fill();
    }
    c.strokeStyle = KOYU; c.lineWidth = lw * 0.5; c.beginPath(); c.arc(0, s * 0.18, s * 0.38, 0.25, Math.PI - 0.25); c.stroke();
    c.fillStyle = 'rgba(255,120,120,0.6)'; c.beginPath(); c.arc(-s * 0.6, s * 0.22, s * 0.12, 0, 7); c.arc(s * 0.6, s * 0.22, s * 0.12, 0, 7); c.fill();
    c.restore();
  }
  function cocuk(c, b, t) { // b: boy (yaklaşık yükseklik), sağa bakar, parmak ucunda yürür
    var ph = t * 5, a = Math.sin(ph), zip = Math.abs(Math.sin(ph)) * b * 0.04;
    c.save(); c.translate(0, -zip);
    c.lineJoin = 'round'; c.lineCap = 'round';
    var lw = Math.max(1.6, b * 0.05);
    c.strokeStyle = KOYU; c.lineWidth = lw;
    // bacaklar (parmak ucu: topuk havada, ayak ucu aşağı)
    c.fillStyle = '#3d4b8f';
    var ay = b * 0.5;
    [[-1, a], [1, -a]].forEach(function (l) {
      var kx = l[1] * b * 0.16;
      c.save(); c.translate(kx * 0.5, 0);
      c.beginPath(); c.moveTo(-b * 0.07, b * 0.06); c.lineTo(kx - b * 0.07, ay - b * 0.08); c.lineTo(kx + b * 0.07, ay - b * 0.08); c.lineTo(b * 0.07, b * 0.06); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#fff'; rr(c, kx - b * 0.06, ay - b * 0.1, b * 0.2, b * 0.1, b * 0.04); c.fill(); c.stroke(); c.fillStyle = '#3d4b8f';
      c.restore();
    });
    // gövde
    c.fillStyle = '#ff7a3d'; rr(c, -b * 0.2, -b * 0.28, b * 0.4, b * 0.42, b * 0.15); c.fill(); c.stroke();
    // geri kol + ön kol (parmak dudakta: ssst)
    c.strokeStyle = '#ff7a3d'; c.lineWidth = b * 0.11; c.beginPath(); c.moveTo(-b * 0.12, -b * 0.18); c.lineTo(-b * 0.3, b * 0.02 + a * b * 0.05); c.stroke();
    c.beginPath(); c.moveTo(b * 0.1, -b * 0.18); c.lineTo(b * 0.26, -b * 0.3); c.lineTo(b * 0.2, -b * 0.44); c.stroke();
    c.fillStyle = '#f5c9a0'; c.strokeStyle = KOYU; c.lineWidth = lw * 0.7;
    c.beginPath(); c.arc(b * 0.2, -b * 0.46, b * 0.055, 0, 7); c.fill(); c.stroke();
    // kafa
    c.lineWidth = lw; c.fillStyle = '#f5c9a0';
    c.beginPath(); c.arc(0, -b * 0.46, b * 0.24, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#6b3f1f'; c.beginPath(); c.arc(-b * 0.02, -b * 0.52, b * 0.245, Math.PI * 0.95, Math.PI * 2.05); c.lineTo(b * 0.12, -b * 0.5); c.lineTo(-b * 0.2, -b * 0.46); c.closePath(); c.fill(); c.stroke();
    // göz (topa bakıyor) + ağız
    c.fillStyle = '#fff'; c.beginPath(); c.arc(b * 0.1, -b * 0.44, b * 0.06, 0, 7); c.fill();
    c.fillStyle = KOYU; c.beginPath(); c.arc(b * 0.125, -b * 0.44, b * 0.032, 0, 7); c.fill();
    c.fillStyle = '#ff9a9a'; c.beginPath(); c.arc(-b * 0.04, -b * 0.34, b * 0.04, 0, 7); c.fill();
    c.restore();
  }
  function parilti(c, x, y, r, t, ph) {
    var s = (0.55 + 0.45 * Math.sin(t * 3 + ph)) * r;
    c.save(); c.translate(x, y); c.rotate(Math.sin(t + ph) * 0.3);
    c.fillStyle = '#fffbe0'; c.strokeStyle = '#ffb02e'; c.lineWidth = 1.5;
    c.beginPath();
    for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4, rr0 = i % 2 ? s * 0.28 : s; c.lineTo(Math.cos(a) * rr0, Math.sin(a) * rr0); }
    c.closePath(); c.fill(); c.stroke(); c.restore();
  }

  function ciz(c, x, y, genislik, t) {
    t = t || 0;
    var s = genislik / 640;
    var m = c.getTransform ? c.getTransform() : null;
    var pxScale = (m ? Math.sqrt(m.a * m.a + m.b * m.b) : 1) * s;
    c.save();
    c.translate(x, y); c.scale(s, s); c.translate(0, 25);
    // rozet: yumuşak ışık + koyu plaka + altın şerit
    var glow = c.createRadialGradient(0, -20, 40, 0, -20, 360);
    glow.addColorStop(0, 'rgba(255,200,80,0.55)'); glow.addColorStop(1, 'rgba(255,200,80,0)');
    c.fillStyle = glow; c.fillRect(-380, -280, 760, 600);
    c.fillStyle = 'rgba(0,0,0,0.3)'; rr(c, -312, -200 + 8, 624, 350, 54); c.fill();
    var pg = c.createLinearGradient(0, -200, 0, 150); pg.addColorStop(0, '#5b3a8e'); pg.addColorStop(1, '#2f2060');
    c.fillStyle = pg; rr(c, -316, -200, 632, 350, 54); c.fill();
    c.lineWidth = 7; c.strokeStyle = '#ffc21a'; c.stroke();
    c.lineWidth = 2.5; c.strokeStyle = 'rgba(255,255,255,0.35)'; rr(c, -304, -188, 608, 326, 44); c.stroke();
    // simge sırası
    var bounce = Math.abs(Math.sin(t * 3)), by = -142 - bounce * 14;
    c.fillStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.ellipse(0, -98, 34 - bounce * 8, 7, 0, 0, 7); c.fill();
    c.save(); c.translate(0, by); c.scale(1 + (1 - bounce) * 0.04, 1 - (1 - bounce) * 0.06); top(c, 38, t, t * 1.6); c.restore();
    c.save(); c.translate(-125, -100); cocuk(c, 78, t); c.restore();
    // ayak izi izleri
    c.fillStyle = 'rgba(255,255,255,0.28)';
    for (var i = 0; i < 3; i++) { c.beginPath(); c.ellipse(-205 - i * 26, -62 + (i % 2) * 5, 5, 3, 0, 0, 7); c.fill(); }
    var goz = (t % 3.2) > 2.9;
    c.save(); c.translate(118, -140 + Math.sin(t * 2.4) * 4); c.rotate(-0.35 + Math.sin(t * 1.8) * 0.08); c.scale(0.9, 0.9); anahtar(c, 22, t, goz); c.restore();
    parilti(c, 62, -178, 11, t, 0); parilti(c, -58, -184, 8, t, 2); parilti(c, 235, -170, 9, t, 4); parilti(c, -255, -165, 8, t, 1);
    // yazı
    harfSatiri(c, 'ANNE BABADAN', -16, 500, 0, t, pxScale, 1);
    harfSatiri(c, 'KAÇMACILIK', 62, 580, 2, t + 1, pxScale, 1);
    c.restore();
  }

  function ikon(c, x, y, b) {
    c.save(); c.translate(x, y); c.scale(b / 100, b / 100);
    var g = c.createLinearGradient(0, -50, 0, 50); g.addColorStop(0, '#6a45a8'); g.addColorStop(1, '#2f2060');
    c.fillStyle = g; rr(c, -50, -50, 100, 100, 24); c.fill();
    c.lineWidth = 4; c.strokeStyle = '#ffc21a'; rr(c, -48, -48, 96, 96, 22); c.stroke();
    c.save(); c.translate(-6, 32); c.rotate(-0.75); c.scale(0.95, 0.95); anahtar(c, 10, 0, false); c.restore();
    c.save(); c.translate(-8, -4); top(c, 29, 0, 0.5); c.restore();
    parilti(c, 28, -30, 9, 0.5, 0); parilti(c, -34, -36, 5, 0, 2);
    c.restore();
  }
  function dataURL(n) {
    n = n || 64;
    try {
      var cv = document.createElement('canvas'); cv.width = cv.height = n;
      ikon(cv.getContext('2d'), n / 2, n / 2, n);
      return cv.toDataURL('image/png');
    } catch (h) { return ''; }
  }
  function favicon() {
    var u = dataURL(64); if (!u) return;
    var l = document.querySelector('link[rel~="icon"]');
    if (!l) { l = document.createElement('link'); l.rel = 'icon'; document.head.appendChild(l); }
    l.href = u;
  }
  G.logo = { ciz: ciz, ikon: ikon, dataURL: dataURL, favicon: favicon };
})();
