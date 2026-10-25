window.G = window.G || {};
(function () {
  var FONT = '"Trebuchet MS", "Comic Sans MS", sans-serif';
  var canvas = null;
  var t = 0, modZaman = 0, sonMod = null, sonOnay = -9;
  var konfeti = [], konfetiBirikim = 0;
  var dokunmatik = false;
  var joy = { id: null, bx: 0, by: 0, kx: 0, ky: 0, R: 62 };
  var dokunlar = {};          // id -> {tip:'joy'|'btn'|'hud', ad}
  var basili = { kos: false, egil: false, etkilesim: false, firlat: false };
  var hudAlan = {};
  var menuAlan = {};          // menü düğmeleri (css px)
  var ustOfs = 0;             // üst uyarı bandı varken diğer üst panellerin kayması           // tıklanabilir HUD alanları (css px)
  var ADLAR = { scooter: 'Scooter', anahtar_mavi: 'M. Anahtar', anahtar_kirmizi: 'K. Anahtar', top_hazine: 'Top', elma: 'Elma', teneke: 'Teneke', oyuncak_ordek: 'Ördek', kurabiye: 'Kurabiye' };
  var ATILABILIR = { elma: 1, teneke: 1, oyuncak_ordek: 1, kurabiye: 1 };
  var RENK = { anahtar_mavi: '#3d8bff', anahtar_kirmizi: '#ff4040', top_hazine: '#ffcc33', elma: '#e53935', teneke: '#9aa5ad', oyuncak_ordek: '#ffd93b', kurabiye: '#c98a4b' };
  var mini = { key: '', cv: null };

  // ---------- çizim yardımcıları ----------
  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function panel(c, x, y, w, h, r, fill, stroke, lw) {
    c.save();
    c.fillStyle = 'rgba(0,0,0,0.25)'; rr(c, x + 3, y + 5, w, h, r); c.fill();
    c.fillStyle = fill; rr(c, x, y, w, h, r); c.fill();
    if (stroke) { c.lineWidth = lw || 3; c.strokeStyle = stroke; c.stroke(); }
    c.restore();
  }
  function yazi(c, s, x, y, boyut, renk, hiza, golge) {
    c.save();
    c.font = 'bold ' + boyut + 'px ' + FONT; c.textAlign = hiza || 'left'; c.textBaseline = 'middle';
    if (golge !== false) { c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillText(s, x + Math.max(1, boyut * 0.06), y + Math.max(2, boyut * 0.08)); }
    c.fillStyle = renk || '#fff'; c.fillText(s, x, y);
    c.restore();
  }
  function konturYazi(c, s, x, y, boyut, renk, kontur, hiza) {
    c.save();
    c.font = '900 ' + boyut + 'px ' + FONT; c.textAlign = hiza || 'center'; c.textBaseline = 'middle';
    c.lineJoin = 'round'; c.lineWidth = boyut * 0.16; c.strokeStyle = kontur || '#2b1b4a';
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillText(s, x + boyut * 0.05, y + boyut * 0.09);
    c.strokeText(s, x, y); c.fillStyle = renk; c.fillText(s, x, y);
    c.restore();
  }
  function sar(c, s, fs, maxW, maxSatir) {   // sözcük sarma; sığmazsa yazıyı küçült
    for (var f = fs; f >= 10; f--) {
      var kel = String(s).split(' '), sat = [], cur = '';
      for (var i = 0; i < kel.length; i++) {
        var dn = cur ? cur + ' ' + kel[i] : kel[i];
        if (olc(c, dn, f) > maxW && cur) { sat.push(cur); cur = kel[i]; } else cur = dn;
      }
      if (cur) sat.push(cur);
      var ok = sat.length <= maxSatir;
      for (i = 0; i < sat.length && ok; i++) if (olc(c, sat[i], f) > maxW) ok = false;
      if (ok || f === 10) return { lines: sat, size: f };
    }
  }
  function tamIkon(c, x, y, r, acik) {   // dört köşe: dışa açılan (tam ekran) / içe kapanan (çıkış)
    c.save(); c.translate(x, y); c.strokeStyle = '#fff'; c.lineWidth = 3.2; c.lineCap = 'round'; c.lineJoin = 'round';
    var L = r * 0.34, e = acik ? r * 0.16 : r * 0.5;
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (q) {
      var k = acik ? 1 : -1;   // çıkışta bacaklar dışa, tam ekranda içe uzanır
      c.beginPath();
      c.moveTo(q[0] * (e + k * L), q[1] * e); c.lineTo(q[0] * e, q[1] * e); c.lineTo(q[0] * e, q[1] * (e + k * L));
      c.stroke();
    });
    c.restore();
  }
  function sigdir(c, s, maxW, boyut) { var w = olc(c, s, boyut); return w > maxW ? Math.max(10, boyut * maxW / w) : boyut; }
  function olc(c, s, boyut) { c.save(); c.font = 'bold ' + boyut + 'px ' + FONT; var w = c.measureText(s).width; c.restore(); return w; }
  function tus(c, s, x, y, boyut) {   // klavye tuşu kutusu; genişlik döner
    c.save();
    c.font = 'bold ' + boyut + 'px ' + FONT;
    var w = Math.max(boyut * 1.6, c.measureText(s).width + boyut * 0.9), h = boyut * 1.6;
    c.fillStyle = '#b9c2d6'; rr(c, x, y - h / 2 + 3, w, h, 7); c.fill();
    c.fillStyle = '#fff'; rr(c, x, y - h / 2, w, h, 7); c.fill();
    c.lineWidth = 2; c.strokeStyle = '#4a5578'; c.stroke();
    c.fillStyle = '#2b3355'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, x + w / 2, y);
    c.restore();
    return w;
  }
  function ikon(c, tur, x, y, b) {
    if (G.cizim && G.cizim.ikon) { try { G.cizim.ikon(c, tur, x, y, b); return; } catch (h) { /* yedek */ } }
    c.save();
    c.fillStyle = RENK[tur] || '#888'; c.strokeStyle = '#222'; c.lineWidth = 2;
    c.beginPath(); c.arc(x, y, b * 0.4, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#fff'; c.font = 'bold ' + (b * 0.4) + 'px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText((ADLAR[tur] || tur || '?').charAt(0).toUpperCase(), x, y + 1);
    c.restore();
  }
  function esyaAdi(tur) {
    try { if (G.oyuncu && G.oyuncu.esyaAdi) { var a = G.oyuncu.esyaAdi(tur); if (a) return a; } } catch (h) { }
    return ADLAR[tur] || tur;
  }
  function gozIkon(c, x, y, r, uyari, renk) {
    c.save();
    c.fillStyle = renk; c.strokeStyle = '#1d2233'; c.lineWidth = 3;
    c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x, y, r * 0.78, r * 0.5, 0, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#222'; c.beginPath(); c.arc(x, y, r * (0.2 + 0.14 * uyari), 0, 7); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(x - r * 0.08, y - r * 0.08, r * 0.07, 0, 7); c.fill();
    c.restore();
  }
  // ---------- nöbetçi portresi (G.cizim.ikon varsa o, yoksa yedek çizim) ----------
  var portreVar = {};
  function portreDestekli(kim) {
    if (portreVar[kim] !== undefined) return portreVar[kim];
    var ok = false;
    try {
      if (G.cizim && G.cizim.ikon) {
        var cv = document.createElement('canvas'); cv.width = cv.height = 40;
        var cc = cv.getContext('2d'); G.cizim.ikon(cc, kim, 20, 20, 30);
        var px = cc.getImageData(0, 0, 40, 40).data;
        for (var i = 3; i < px.length; i += 4) if (px[i] > 20) { ok = true; break; }
      }
    } catch (h) { ok = false; }
    portreVar[kim] = ok; return ok;
  }
  var YEREL_PORTRE = { bekci: 1, bekci2: 1, kedi: 1, ogretmen: 1, mudur: 1 };
  function portre(c, kim, x, y, b) {
    if (!YEREL_PORTRE[kim] && portreDestekli(kim)) { try { G.cizim.ikon(c, kim, x, y, b); return; } catch (h) { } }
    var r = b * 0.46;
    c.save(); c.translate(x, y);
    c.fillStyle = '#f5c9a0'; c.strokeStyle = '#3b2410'; c.lineWidth = Math.max(2, b * 0.05);
    if (kim === 'anne') {
      c.fillStyle = '#6b3f1f'; c.beginPath(); c.arc(0, -r * 0.95, r * 0.4, 0, 7); c.fill(); c.stroke();
      c.fillStyle = '#6b3f1f'; c.beginPath(); c.arc(0, -r * 0.1, r * 1.05, Math.PI, 0); c.fill();
    }
    c.fillStyle = '#f5c9a0'; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); c.stroke();
    if (kim === 'ebe') {
      c.fillStyle = '#c9c9d2'; c.beginPath(); c.arc(0, -r * 0.95, r * 0.38, 0, 7); c.fill(); c.stroke();
      c.fillStyle = '#d6407a'; c.beginPath(); c.arc(0, -r * 0.15, r * 1.02, Math.PI * 1.05, Math.PI * 1.95); c.lineTo(0, -r * 0.35); c.fill();
      c.strokeStyle = '#222'; c.lineWidth = 1.5; c.beginPath(); c.arc(-r * 0.35, -r * 0.1, r * 0.2, 0, 7); c.arc(r * 0.35, -r * 0.1, r * 0.2, 0, 7); c.stroke();
    } else if (kim === 'dede') {
      c.fillStyle = '#5b6b7a'; c.beginPath(); c.arc(0, -r * 0.3, r * 1.0, Math.PI * 1.05, Math.PI * 1.95); c.lineTo(r * 1.1, -r * 0.3); c.lineTo(-r * 1.1, -r * 0.3); c.fill();
      c.strokeStyle = '#222'; c.lineWidth = 1.5; c.beginPath(); c.arc(-r * 0.35, -r * 0.05, r * 0.2, 0, 7); c.arc(r * 0.35, -r * 0.05, r * 0.2, 0, 7); c.stroke();
    } else if (kim === 'bekci' || kim === 'bekci2') {
      // Park bekçisi: lacivert kep + yüzaltı bıyık.
      c.fillStyle = '#7a6547'; c.beginPath(); c.arc(0, -r * 0.3, r * 1.0, Math.PI * 1.05, Math.PI * 1.95); c.lineTo(r * 1.1, -r * 0.3); c.lineTo(-r * 1.1, -r * 0.3); c.fill();
      c.fillStyle = kim === 'bekci' ? '#31507e' : '#3a5a8c';
      c.beginPath(); c.arc(0, -r * 0.72, r * 0.78, Math.PI, 0); c.fill();
      rr(c, -r * 0.85, -r * 0.78, r * 1.7, r * 0.16, r * 0.08); c.fill();
      c.strokeStyle = '#1c2438'; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = '#e0b64e'; c.beginPath(); c.arc(0, -r * 0.95, r * 0.12, 0, 7); c.fill();
      c.fillStyle = kim === 'bekci' ? '#8a7766' : '#33302c';
      rr(c, -r * 0.5, r * 0.08, r, r * 0.2, r * 0.1); c.fill();
      c.fillStyle = '#ff7a1a'; c.beginPath(); c.arc(-r * 0.62, r * 0.05, r * 0.14, 0, 7); c.fill();
      c.strokeStyle = '#222'; c.lineWidth = 1.5; c.beginPath(); c.arc(-r * 0.35, -r * 0.1, r * 0.2, 0, 7); c.arc(r * 0.35, -r * 0.1, r * 0.2, 0, 7); c.stroke();
    } else if (kim === 'ogretmen') {
      // Ayşe Hanım: kahverengi topuz, gözlük, çiçekli yaka
      c.fillStyle = '#5a3a24'; c.beginPath(); c.arc(0, -r * 1.0, r * 0.4, 0, 7); c.fill(); c.stroke();
      c.fillStyle = '#5a3a24'; c.beginPath(); c.arc(0, -r * 0.1, r * 1.05, Math.PI * 1.02, Math.PI * 1.98); c.lineTo(0, -r * 0.45); c.fill();
      c.fillStyle = '#ffffff'; c.strokeStyle = '#1c2438'; c.lineWidth = 1.5;
      c.beginPath(); c.arc(-r * 0.37, -r * 0.1, r * 0.22, 0, 7); c.moveTo(r * 0.59, -r * 0.1); c.arc(r * 0.37, -r * 0.1, r * 0.22, 0, 7); c.stroke();
      c.beginPath(); c.moveTo(-r * 0.15, -r * 0.1); c.lineTo(r * 0.15, -r * 0.1); c.stroke();
      c.fillStyle = '#ff8ab8'; c.beginPath(); c.arc(r * 0.55, r * 0.95, r * 0.16, 0, 7); c.fill();
      c.fillStyle = '#e08a8a'; c.beginPath(); c.arc(-r * 0.55, r * 0.25, r * 0.12, 0, 7); c.arc(r * 0.55, r * 0.25, r * 0.12, 0, 7); c.fill();
    } else if (kim === 'mudur') {
      // Kemal Bey: gri saç, gri bıyık, kare gözlük, kırmızı kravat
      c.fillStyle = '#b5b8bf'; c.beginPath(); c.arc(0, -r * 0.3, r * 1.0, Math.PI * 1.05, Math.PI * 1.95); c.lineTo(r * 1.1, -r * 0.3); c.lineTo(-r * 1.1, -r * 0.3); c.fill();
      c.strokeStyle = '#1c2438'; c.lineWidth = 1.8;
      c.strokeRect(-r * 0.6, -r * 0.28, r * 0.5, r * 0.36); c.strokeRect(r * 0.1, -r * 0.28, r * 0.5, r * 0.36);
      c.beginPath(); c.moveTo(-r * 0.1, -r * 0.12); c.lineTo(r * 0.1, -r * 0.12); c.stroke();
      c.fillStyle = '#9aa0a8'; rr(c, -r * 0.5, r * 0.18, r, r * 0.2, r * 0.1); c.fill();
      c.fillStyle = '#d9372b'; c.beginPath(); c.moveTo(-r * 0.12, r * 0.95); c.lineTo(r * 0.12, r * 0.95); c.lineTo(r * 0.08, r * 1.25); c.lineTo(-r * 0.08, r * 1.25); c.closePath(); c.fill();
      c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(-r * 0.5, r * 0.9); c.lineTo(0, r * 1.05); c.lineTo(r * 0.5, r * 0.9); c.lineTo(r * 0.5, r * 1.1); c.lineTo(-r * 0.5, r * 1.1); c.closePath(); c.fill();
    } else if (kim === 'kedi') {
      // Sokak kedisi Duman: gri yüz, üçgen kulaklar.
      rr(c, -r * 1.0, -r * 0.1, r * 2.0, r * 1.2, r * 0.4); c.fillStyle = '#565860'; c.fill(); c.stroke();
      c.fillStyle = '#565860';
      c.beginPath(); c.moveTo(-r * 0.75, -r * 0.2); c.lineTo(-r * 0.95, -r * 1.1); c.lineTo(-r * 0.2, -r * 0.55); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(r * 0.75, -r * 0.2); c.lineTo(r * 0.95, -r * 1.1); c.lineTo(r * 0.2, -r * 0.55); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#c7e05a';
      c.beginPath(); c.arc(-r * 0.4, r * 0.25, r * 0.24, 0, 7); c.fill(); c.beginPath(); c.arc(r * 0.4, r * 0.25, r * 0.24, 0, 7); c.fill();
      c.fillStyle = '#142013';
      c.beginPath(); c.arc(-r * 0.4, r * 0.25, r * 0.09, 0, 7); c.fill(); c.beginPath(); c.arc(r * 0.4, r * 0.25, r * 0.09, 0, 7); c.fill();
      c.fillStyle = '#e0857f'; c.beginPath(); c.moveTo(-r * 0.14, r * 0.55); c.lineTo(r * 0.14, r * 0.55); c.lineTo(0, r * 0.78); c.closePath(); c.fill();
    }
    if (kim === 'anne') {
      c.fillStyle = '#6b3f1f'; c.beginPath(); c.arc(0, -r * 0.2, r * 1.0, Math.PI * 1.08, Math.PI * 1.92); c.lineTo(0, -r * 0.4); c.fill();
      c.fillStyle = '#ff8ab8'; for (var i = -1; i <= 1; i++) { c.beginPath(); c.arc(i * r * 0.5, -r * 0.8, r * 0.14, 0, 7); c.fill(); }
    }
    c.fillStyle = '#222';
    c.beginPath(); c.arc(-r * 0.35, -r * 0.1, r * 0.1, 0, 7); c.fill(); c.beginPath(); c.arc(r * 0.35, -r * 0.1, r * 0.1, 0, 7); c.fill();
    if (kim === 'baba' || kim === 'dede') {
      c.fillStyle = kim === 'dede' ? '#f2f2f2' : '#4a2f12'; rr(c, -r * 0.55, r * 0.2, r * 1.1, r * 0.2, r * 0.1); c.fill();
      if (kim === 'dede') { c.lineWidth = 1.5; c.strokeStyle = '#999'; c.stroke(); }
    } else {
      c.strokeStyle = '#c0392b'; c.lineWidth = Math.max(2, b * 0.06); c.beginPath(); c.arc(0, r * 0.25, r * 0.28, 0.2, Math.PI - 0.2); c.stroke();
    }
    c.restore();
  }
  function hoparlor(c, x, y, s, kapali) {
    c.save();
    c.fillStyle = '#fff'; c.strokeStyle = '#fff'; c.lineWidth = 2.5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x - s * 0.35, y - s * 0.15); c.lineTo(x - s * 0.15, y - s * 0.15); c.lineTo(x + s * 0.1, y - s * 0.38);
    c.lineTo(x + s * 0.1, y + s * 0.38); c.lineTo(x - s * 0.15, y + s * 0.15); c.lineTo(x - s * 0.35, y + s * 0.15); c.closePath(); c.fill();
    if (kapali) {
      c.strokeStyle = '#ff6a6a'; c.lineWidth = 4;
      c.beginPath(); c.moveTo(x + s * 0.22, y - s * 0.2); c.lineTo(x + s * 0.5, y + s * 0.2); c.moveTo(x + s * 0.5, y - s * 0.2); c.lineTo(x + s * 0.22, y + s * 0.2); c.stroke();
    } else {
      c.beginPath(); c.arc(x + s * 0.1, y, s * 0.28, -0.9, 0.9); c.stroke();
      c.beginPath(); c.arc(x + s * 0.1, y, s * 0.46, -0.9, 0.9); c.stroke();
    }
    c.restore();
  }
  function elIkon(c, x, y, s) {
    c.save();
    c.fillStyle = '#fff'; c.strokeStyle = '#2b3355'; c.lineWidth = 2;
    rr(c, x - s * 0.28, y - s * 0.05, s * 0.56, s * 0.42, s * 0.14); c.fill(); c.stroke();
    for (var i = 0; i < 4; i++) { rr(c, x - s * 0.28 + i * s * 0.14, y - s * 0.4 + (i === 0 || i === 3 ? s * 0.08 : 0), s * 0.13, s * 0.5, s * 0.06); c.fill(); c.stroke(); }
    c.restore();
  }
  function dugme(c, s, cx, cy, w, h, renk, golge, nabiz) {
    var k = nabiz ? 1 + Math.sin(t * 5) * 0.04 : 1;
    c.save(); c.translate(cx, cy); c.scale(k, k);
    c.fillStyle = golge; rr(c, -w / 2, -h / 2 + 7, w, h, h / 2); c.fill();
    c.fillStyle = renk; rr(c, -w / 2, -h / 2, w, h, h / 2); c.fill();
    c.lineWidth = 4; c.strokeStyle = '#fff'; c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.28)'; rr(c, -w / 2 + 12, -h / 2 + 7, w - 24, h * 0.3, h * 0.15); c.fill();
    c.restore();
    konturYazi(c, s, cx, cy + 1, h * 0.5, '#fff', 'rgba(60,20,0,0.8)');
  }
  function sureYazi(s) { s = Math.floor(s || 0); var m = Math.floor(s / 60), sn = s % 60; return (m < 10 ? '0' : '') + m + ':' + (sn < 10 ? '0' : '') + sn; }

  // ---------- görev ----------
  function gorev(d) {
    var env = (d.oyuncu && d.oyuncu.envanter) || [];
    var var_ = function (x) { return env.indexOf(x) >= 0; };
    var g = G.bolumBilgi().gorev;
    if (var_('top_hazine')) return 'Topunu aldın! Hadi kaç!';
    if (var_('anahtar_kirmizi')) return g.kirmiziVar;
    var mavikilit = false, kapilar = G.harita && G.harita.kapilar;
    if (kapilar) for (var i = 0; i < kapilar.length; i++) if (kapilar[i].kilit === 'anahtar_mavi') mavikilit = true;
    if (var_('anahtar_mavi') && (mavikilit || !kapilar)) return g.maviVar;
    if (!var_('anahtar_mavi') && (mavikilit || !kapilar)) return g.maviYok;
    return g.kirmiziYok;
  }

  // ---------- dokunmatik ----------
  function btnler(d) {
    var w = d.ekran.w, h = d.ekran.h, u = Math.max(0.7, Math.min(1.15, Math.min(w, h) / 420));
    var l = [
      { ad: 'etkilesim', yazi: 'E', x: w - 78 * u, y: h - 92 * u, r: 44 * u, renk: '#34c26a', tek: true },
      { ad: 'firlat', yazi: 'AT', x: w - 168 * u, y: h - 62 * u, r: 36 * u, renk: '#ff9f2e', tek: true },
      { ad: 'kos', yazi: 'KOŞ', x: w - 60 * u, y: h - 190 * u, r: 33 * u, renk: '#3d8bff' },
      { ad: 'egil', yazi: 'EĞİL', x: w - 152 * u, y: h - 158 * u, r: 33 * u, renk: '#a15cff' }
    ];
    if (G.ucBoyut) l.push({ ad: 'kamera', yazi: 'DÖN', x: w - 140 * u, y: h - 250 * u, r: 27 * u, renk: '#3fae4a', tek: true });
    return l;
  }
  function dokunBirak() {
    if (joy.id !== null) { joy.id = null; }
    if (G.girdi) { G.girdi.dokun = { x: 0, y: 0, aktif: false }; G.girdi.dokunKos = false; G.girdi.dokunEgil = false; G.girdi.dokunEtki = false; }
    basili.kos = basili.egil = basili.etkilesim = false; dokunlar = {};
  }
  function konum(e) {
    // G.donuk: sahne 90° döndürülmüş çiziliyor (oyun.js boyutla) → ekran noktasını oyun koordinatına çevir
    if (G.donuk) return { x: e.clientY, y: window.innerWidth - e.clientX };
    var r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  var tamBekle = null;   // dokunuşta tam ekran isteği touchend'e ertelenir (touchstart kullanıcı hareketi sayılmaz)
  function tamIsle() {
    var b = tamBekle; tamBekle = null;
    if (!b || !G.tamEkran) return;
    if (b === 'gir') G.tamEkran.gir(); else if (b === 'yatay') G.tamEkran.yatay(); else if (b === 'oto') G.tamEkran.otoGir(); else if (b === 'degistir') G.tamEkran.degistir();
  }
  function hudTikla(p) {
    for (var ad in hudAlan) {
      var a = hudAlan[ad];
      if (p.x >= a.x && p.x <= a.x + a.w && p.y >= a.y && p.y <= a.y + a.h) {
        if (ad === 'duraklat') G.olay('duraklat');
        else if (ad === 'tam') tamBekle = 'degistir';
        else if (ad === 'gokce') { if (G.kardesler && G.kardesler.gokceCagir) G.kardesler.gokceCagir(G.d); }
        else if (ad === 'ses' && G.ses && G.ses.sustur) { G.ses.sustur(!G.ses.kapali); G.mesaj(G.ses.kapali ? 'Ses kapalı' : 'Ses açık', 1.5); }
        return true;
      }
    }
    return false;
  }
  function onayVer(p) {
    var d = G.d, now = t;
    if (!d || now - sonOnay < 0.25 || G.dikey) return false;
    if (G.ayarlar && G.ayarlar.acik) return false;
    function icinde(a) { return p && a && p.x >= a.x && p.x <= a.x + a.w && p.y >= a.y && p.y <= a.y + a.h; }
    if (d.mod === 'menu') {
      sonOnay = now; if (G.ses && G.ses.ac) G.ses.ac();
      if (icinde(menuAlan.ayarlar)) { if (G.ayarlar) G.ayarlar.ac(); return true; }
      tamBekle = 'gir';
      G.olay('baslat');   // oyun her zaman Bölüm 1'den başlar
      return true;
    }
    if (d.mod === 'bolumBitti' && modZaman > 0.8) { sonOnay = now; if (G.ses && G.ses.ac) G.ses.ac(); G.olay('sonrakiBolum'); return true; }
    if ((d.mod === 'yakalandi' || d.mod === 'kazandi') && modZaman > 0.8) {
      sonOnay = now; if (G.ses && G.ses.ac) G.ses.ac();
      if (d.mod === 'yakalandi') tamBekle = 'oto';
      G.olay(d.mod === 'yakalandi' ? 'devam' : 'yeniden'); return true;
    }
    if (d.mod === 'duraklat') {
      sonOnay = now;
      if (icinde(menuAlan.pAyar)) { if (G.ayarlar) G.ayarlar.ac(); return true; }
      G.olay('duraklat'); return true;
    }
    return false;
  }
  function dokunBasla(e) {
    var d = G.d; if (!d) return;
    e.preventDefault();
    if (G.ses && G.ses.ac) G.ses.ac();
    // Dikey ekranda dokunuş: tam ekran + yatay yön kilidi iste. Telefonun döndürme kilidi açıkken
    // tarayıcı yan çevirmeyi hiç görmez; Android Chrome tam ekranda lock('landscape') ile ekranı kendisi çevirir.
    if (G.dikey) { tamBekle = 'yatay'; return; }
    for (var i = 0; i < e.changedTouches.length; i++) {
      var tc = e.changedTouches[i], p = konum(tc);
      if (G.ayarlar && G.ayarlar.acik) { if (ayarId === null) { ayarId = tc.identifier; G.ayarlar.dokun(p.x, p.y, 'bas'); } continue; }
      if (d.mod !== 'oyun') { onayVer(p); continue; }
      if (hudTikla(p)) { dokunlar[tc.identifier] = { tip: 'hud' }; continue; }
      var bl = btnler(d), bulundu = false;
      for (var j = 0; j < bl.length; j++) {
        var b = bl[j];
        if (Math.hypot(p.x - b.x, p.y - b.y) <= b.r * 1.25) {
          bulundu = true; dokunlar[tc.identifier] = { tip: 'btn', ad: b.ad };
          if (b.tek) {
            if (b.ad === 'kamera') { if (G.kameraDondur) G.kameraDondur(1); basili[b.ad] = true; setTimeout(function () { basili.kamera = false; }, 160); }
            else { if (G.girdi) { G.girdi.bas(b.ad); if (b.ad === 'etkilesim') G.girdi.dokunEtki = true; } basili[b.ad] = true; }
          }
          else { basili[b.ad] = true; if (G.girdi) { if (b.ad === 'kos') G.girdi.dokunKos = true; else G.girdi.dokunEgil = true; } }
          break;
        }
      }
      if (bulundu) continue;
      if (joy.id === null && p.x < d.ekran.w * 0.55) {
        joy.id = tc.identifier; joy.bx = p.x; joy.by = p.y; joy.kx = p.x; joy.ky = p.y;
        dokunlar[tc.identifier] = { tip: 'joy' };
        if (G.girdi) G.girdi.dokun = { x: 0, y: 0, aktif: true };
      }
    }
  }
  var ayarId = null;
  function dokunHareket(e) {
    e.preventDefault();
    for (var i = 0; i < e.changedTouches.length; i++) {
      var tc = e.changedTouches[i];
      if (tc.identifier === ayarId && G.ayarlar && G.ayarlar.acik) { var pa = konum(tc); G.ayarlar.dokun(pa.x, pa.y, 'surukle'); continue; }
      if (tc.identifier !== joy.id) continue;
      var p = konum(tc), dx = p.x - joy.bx, dy = p.y - joy.by, m = Math.hypot(dx, dy);
      if (m > joy.R) { dx = dx / m * joy.R; dy = dy / m * joy.R; m = joy.R; }
      joy.kx = joy.bx + dx; joy.ky = joy.by + dy;
      var o = m / joy.R, ox = 0, oy = 0;
      if (o > 0.15) { ox = dx / joy.R; oy = dy / joy.R; }
      if (G.girdi) G.girdi.dokun = { x: ox, y: oy, aktif: true };
    }
  }
  function dokunBitti(e) {
    e.preventDefault();
    tamIsle();   // touchend gerçek kullanıcı hareketidir: requestFullscreen burada çalışır
    for (var i = 0; i < e.changedTouches.length; i++) {
      var id = e.changedTouches[i].identifier, k = dokunlar[id];
      if (id === ayarId) { ayarId = null; if (G.ayarlar) G.ayarlar.dokun(0, 0, 'birak'); continue; }
      if (!k) continue;
      if (k.tip === 'joy') { joy.id = null; if (G.girdi) G.girdi.dokun = { x: 0, y: 0, aktif: false }; }
      else if (k.tip === 'btn') {
        basili[k.ad] = false;
        if (G.girdi && k.ad === 'etkilesim') G.girdi.dokunEtki = false;
        if (G.girdi) { if (k.ad === 'kos') G.girdi.dokunKos = false; else if (k.ad === 'egil') G.girdi.dokunEgil = false; }
      }
      delete dokunlar[id];
    }
  }

  function dokunCiz(c, d) {
    var w = d.ekran.w, h = d.ekran.h, u = Math.max(0.7, Math.min(1.15, Math.min(w, h) / 420));
    c.save();
    // joystick
    var aktif = joy.id !== null;
    var bx = aktif ? joy.bx : 105 * u, by = aktif ? joy.by : h - 105 * u, kx = aktif ? joy.kx : bx, ky = aktif ? joy.ky : by;
    c.globalAlpha = aktif ? 0.75 : 0.4;
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.strokeStyle = '#fff'; c.lineWidth = 4;
    c.beginPath(); c.arc(bx, by, joy.R * u, 0, 7); c.fill(); c.stroke();
    c.fillStyle = aktif ? '#ffd93b' : '#fff'; c.strokeStyle = '#2b3355'; c.lineWidth = 3;
    c.beginPath(); c.arc(kx, ky, 28 * u, 0, 7); c.fill(); c.stroke();
    // butonlar
    var bl = btnler(d);
    for (var i = 0; i < bl.length; i++) {
      var b = bl[i], bas = basili[b.ad];
      c.globalAlpha = bas ? 0.95 : 0.6;
      c.fillStyle = bas ? '#fff' : b.renk; c.strokeStyle = '#fff'; c.lineWidth = 4;
      c.beginPath(); c.arc(b.x, b.y, b.r * (bas ? 0.92 : 1), 0, 7); c.fill(); c.stroke();
      c.globalAlpha = 1;
      if (b.ad === 'etkilesim') elIkon(c, b.x, b.y + b.r * 0.05, b.r * 1.15);
      else yazi(c, b.yazi, b.x, b.y + 1, b.r * (b.yazi.length > 2 ? 0.46 : 0.8), bas ? b.renk : '#fff', 'center');
    }
    c.restore();
  }

  // ---------- ekranlar ----------
  function perde(c, d, renk) { c.fillStyle = renk; c.fillRect(0, 0, d.ekran.w, d.ekran.h); }

  function ekranAlani(w, h, s, CY, cx, cy, bw, bh) {   // tasarım koordinatı (merkez cx,cy) -> ekran dikdörtgeni
    return { x: w / 2 + (cx - bw / 2) * s, y: h / 2 + (cy - bh / 2 - CY) * s, w: bw * s, h: bh * s };
  }
  function dokunMetin(m) {   // dokunmatikte tuş adı geçmesin
    return dokunmatik ? String(m).replace(/ \(E tuşunu basılı tut\)/, ' (basılı tut)').replace(/ \(E basılı tut\)/, ' (basılı tut)') : m;
  }
  // Menü köşesinde sürüm + son yenilikler (uzaktan takip için; yayinla.sh doldurur)
  function surumEtiket(c, d) {
    var S = G.SURUM; if (!S) return;
    var h = d.ekran.h, satir = ['Sürüm ' + S.surum].concat((S.notlar || []).slice(0, 3).map(function (n) { return '• ' + n; }));
    c.save(); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    for (var i = 0; i < satir.length; i++) {
      var y = h - 10 - (satir.length - 1 - i) * 15;
      c.font = (i ? '' : 'bold ') + '12px "Trebuchet MS", sans-serif';
      c.lineWidth = 3; c.strokeStyle = 'rgba(14,22,45,0.85)'; c.strokeText(satir[i], 10, y);
      c.fillStyle = i ? 'rgba(255,255,255,0.85)' : '#ffd93b'; c.fillText(satir[i], 10, y);
    }
    c.restore();
  }
  function menuCiz(c, d) {
    perde(c, d, 'rgba(14,22,45,0.74)');
    var w = d.ekran.w, h = d.ekran.h, bb = G.bolumBilgi(), kompakt = h < 560;
    var yan = (Math.sin(t * 6) > -0.2) ? '#ff7a1a' : '#ffb02e';
    menuAlan = {};
    var hik = bb.hikaye || [], i;
    if (kompakt) {
      // yatay telefon / alçak pencere: sol sütun logo + düğmeler, sağ sütun hikâye + ipucu
      var s1 = Math.min(w / 800, h / 400, 1.25);
      c.save(); c.translate(w / 2, h / 2); c.scale(s1, s1);
      if (G.logo) G.logo.ciz(c, -205, -92, 370, t);
      konturYazi(c, 'Ogeday, Atılay ve Giray', -205, 28, 20, '#ffffff', '#2b1b4a');
      dugme(c, dokunmatik ? 'DOKUN: BAŞLA' : 'BAŞLA', -205, 84, 330, 62, yan, '#a8430b', true);
      dugme(c, 'AYARLAR', -205, 154, 190, 50, '#7a5cff', '#41309a', false);
      menuAlan.basla = ekranAlani(w, h, s1, 0, -205, 84, 330, 62);
      menuAlan.ayarlar = ekranAlani(w, h, s1, 0, -205, 154, 190, 50);
      var etw = olc(c, bb.ad, 15) + 30;
      panel(c, 205 - etw / 2, -178, etw, 26, 13, 'rgba(61,139,255,0.95)', '#fff', 2);
      yazi(c, bb.ad, 205, -165, 15, '#fff', 'center', false);
      panel(c, 15, -140, 380, 150, 18, 'rgba(255,248,225,0.96)', '#ffb02e', 4);
      for (i = 0; i < hik.length; i++) yazi(c, dokunMetin(hik[i]), 205, -116 + i * 31, sigdir(c, dokunMetin(hik[i]), 350, 15), '#4a2f12', 'center', false);
      panel(c, 15, 20, 380, 150, 18, 'rgba(30,40,80,0.92)', '#7da2ff', 3);
      var ip = dokunmatik ? ['Sol joystick: yürü · KOŞ gürültülü, EĞİL sessiz', 'El düğmesi: al, aç, saklan · basılı tut: ara', 'AT: eşya fırlat · mor düğme: Gökçe\'yi çağır', 'DÖN: kamerayı döndür · II: duraklat']
        : ['WASD / Oklar: yürü · Shift koş · C eğil', 'E / Boşluk: al, aç, saklan · basılı tut: ara', 'F: fırlat · G: Gökçe · Z/X: kamera döndür', 'P: duraklat · M: ses · Tekerlek: yakınlaş'];
      yazi(c, 'NASIL OYNANIR', 205, 38, 14, '#9fc0ff', 'center', false);
      for (i = 0; i < ip.length; i++) yazi(c, ip[i], 205, 66 + i * 26, sigdir(c, ip[i], 355, 14), '#fff', 'center', false);
      c.restore();
      surumEtiket(c, d);
      return;
    }
    var s = Math.min(w / 800, h / 900, 1.25), CY = 450;
    c.save(); c.translate(w / 2, h / 2); c.scale(s, s); c.translate(0, -CY);
    if (G.logo) G.logo.ciz(c, 0, 150, 520, t);
    var etw2 = olc(c, bb.ad, 17) + 36;
    panel(c, -etw2 / 2, 312, etw2, 28, 14, 'rgba(61,139,255,0.95)', '#fff', 2);
    yazi(c, bb.ad, 0, 327, 17, '#fff', 'center', false);
    panel(c, -350, 350, 700, 126, 22, 'rgba(255,248,225,0.96)', '#ffb02e', 4);
    for (var k = 0; k < hik.length; k++) yazi(c, dokunMetin(hik[k]), 0, 375 + k * 28, sigdir(c, dokunMetin(hik[k]), 650, 20), '#4a2f12', 'center', false);
    var satirlar = dokunmatik ? [
      ['Sol alt', 'Joystick: yürü'], ['KOŞ', 'Basılı tut: koş (gürültülü!)'], ['EĞİL', 'Basılı tut: sessizce eğil'],
      ['El düğmesi', 'Al, aç, saklan · basılı tut: ara'], ['AT', 'Eşya fırlat (kovalayanı kandır)'], ['Mor düğme', "Gökçe'yi çağır (1 kez)"], ['Zor anda', "Atılay/Giray sihri kendiliğinden (1'er kez)"], ['DÖN', 'Kamerayı 90° döndür'], ['II', 'Duraklat'], ['Hoparlör', 'Sesi aç/kapa']
    ] : [
      ['WASD / Oklar', 'Yürü'], ['Shift', 'Koş (gürültülü!)'], ['C / Ctrl', 'Eğil (sessiz)'], ['E / Boşluk', 'Al, aç, saklan · basılı tut: ara'],
      ['F / Q', 'Eşya fırlat (kovalayanı kandır)'], ['G', "Gökçe'yi çağır (1 kez)"], ['Zor anda', "Atılay/Giray sihri kendiliğinden (1'er kez)"], ['Z / X', 'Kamerayı döndür · tekerlek: yakınlaş'], ['P', 'Duraklat'], ['M', 'Ses aç/kapa']
    ];
    var rg = 24;
    panel(c, -350, 488, 700, 290, 22, 'rgba(30,40,80,0.92)', '#7da2ff', 4);
    yazi(c, 'NASIL OYNANIR', 0, 506, 17, '#9fc0ff', 'center', false);
    for (var r = 0; r < satirlar.length; r++) {
      var yy = 530 + r * rg;
      c.save(); c.textAlign = 'left';
      var tw = tus(c, satirlar[r][0], -310, yy, 14);
      c.restore();
      yazi(c, satirlar[r][1], -310 + Math.max(tw, 140) + 18, yy, 17, '#fff', 'left', false);
    }
    var ms = (bb.anons && bb.anons.tur === 'anons') ? 'Atılay ara sıra anons sistemine koşup uyuyanı uyandırır!' : 'Atılay ara sıra mikrofona bağırıp uyuyanı uyandırır!';
    yazi(c, ms, 0, 530 + satirlar.length * rg + 2, sigdir(c, ms, 650, 15), '#ffd93b', 'center', false);
    dugme(c, dokunmatik ? 'DOKUN: BAŞLA' : 'BAŞLA', -120, 818, 340, 66, yan, '#a8430b', true);
    dugme(c, 'AYARLAR', 205, 818, 200, 56, '#7a5cff', '#41309a', false);
    menuAlan.basla = ekranAlani(w, h, s, CY, -120, 818, 340, 66);
    menuAlan.ayarlar = ekranAlani(w, h, s, CY, 205, 818, 200, 56);
    if (!dokunmatik) yazi(c, 'Tıkla ya da Enter / Boşluk', 0, 866, 14, 'rgba(255,255,255,0.8)', 'center', false);
    c.restore();
    surumEtiket(c, d);
  }

  function gokceDugme(c, d, w, h, envSag, envY, ss, kucuk) {
    var Rn = kucuk ? 28 : 34, hak = d.gokceHakki || 0, aktif = G.kardesler && G.kardesler.gokceAktif ? G.kardesler.gokceAktif(d) : !!d.gokce, kullanildi = hak <= 0 || aktif;
    var u = Math.max(0.7, Math.min(1.15, Math.min(w, h) / 420));
    var cx, cy;
    if (dokunmatik) { cx = w - 236 * u; cy = h - 96 * u; }
    else { cx = Math.min(w - Rn - 14, envSag + Rn + 10); cy = envY - Rn - 28; }
    var kov = d.komsu && d.komsu.durum === 'kovalama' && hak > 0 && !aktif;
    var nb = kov ? (0.5 + 0.5 * Math.sin(t * 8)) : 0;
    c.save();
    if (kov) {
      c.globalAlpha = 0.35 + 0.4 * nb; c.fillStyle = '#ffe14d';
      c.beginPath(); c.arc(cx, cy, Rn + 6 + nb * 9, 0, 7); c.fill(); c.globalAlpha = 1;
    }
    var k = kov ? 1 + nb * 0.07 : 1;
    c.translate(cx, cy); c.scale(k, k);
    c.fillStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.arc(3, 5, Rn, 0, 7); c.fill();
    c.fillStyle = kullanildi ? '#8a8f9c' : '#9b4fd6'; c.beginPath(); c.arc(0, 0, Rn, 0, 7); c.fill();
    c.lineWidth = 4; c.strokeStyle = kullanildi ? '#cfd3dc' : '#fff'; c.stroke();
    if (!kullanildi) {
      c.save(); c.beginPath(); c.arc(0, 0, Rn - 3, 0, 7); c.clip();
      if (G.cizim && G.cizim.ikon) { try { G.cizim.ikon(c, 'gokce', 0, -3, Rn * 1.5); } catch (h2) { gokceYedek(c, Rn); } }
      else gokceYedek(c, Rn);
      c.restore();
      c.fillStyle = 'rgba(255,255,255,0.22)'; c.beginPath(); c.arc(-Rn * 0.3, -Rn * 0.35, Rn * 0.32, 0, 7); c.fill();
    } else if (hak > 0) yazi(c, 'yolda', 0, 0, 13, '#fff', 'center', false);
    else yazi(c, 'bitti', 0, 0, kucuk ? 10 : 11, '#fff', 'center', false);
    c.restore();
    var et = dokunmatik ? ((kucuk || h < 500) ? 'GÖKÇE' : "GÖKÇE'Yİ ÇAĞIR") : "GÖKÇE'Yİ ÇAĞIR (G)";
    var fs = kucuk ? 10 : 12, ew = olc(c, et, fs) + 16;
    var ex = Math.max(ew / 2 + 4, Math.min(w - ew / 2 - 4, cx)), ey = cy - Rn - 14;
    panel(c, ex - ew / 2, ey - 11, ew, 22, 11, kullanildi ? 'rgba(80,84,96,0.9)' : 'rgba(90,30,140,0.92)', '#fff', 2);
    yazi(c, et, ex, ey + 1, fs, '#fff', 'center', false);
    if (!kullanildi) {
      c.fillStyle = '#ffd93b'; c.strokeStyle = '#4a2f12'; c.lineWidth = 2;
      c.beginPath(); c.arc(cx + Rn * 0.75, cy + Rn * 0.75, 11, 0, 7); c.fill(); c.stroke();
      yazi(c, String(hak), cx + Rn * 0.75, cy + Rn * 0.75 + 1, 14, '#4a2f12', 'center', false);
    }
    sihirRozet(c, d, cx, cy, Rn, kucuk);
    hudAlan.gokce = { x: Math.min(cx - Rn, ex - ew / 2), y: Math.min(cy - Rn, ey - 11), w: 0, h: 0 };
    hudAlan.gokce.w = Math.max(cx + Rn, ex + ew / 2) - hudAlan.gokce.x;
    hudAlan.gokce.h = Math.max(cy + Rn, ey + 11) - hudAlan.gokce.y;
  }
  function sihirRozet(c, d, gx, gy, R, kucuk) {
    var sh = d.sihirler || {}, r = kucuk ? 15 : 18, w = d.ekran.w;
    var L = [{ k: 'atilay', ik: 'sihir_atilay', ad: 'Atılay', renk: '#3d8bff' }, { k: 'giray', ik: 'sihir_giray', ad: 'Giray', renk: '#3fae4a' }];
    var x0 = gx - R - 12 - r, y0 = gy + 2;
    var dikey = (x0 - (2 * r + 9) - r) < 4;
    for (var i = 0; i < 2; i++) {
      var kul = sh[L[i].k] !== false, x, y;
      if (!dikey) { x = x0 - i * (2 * r + 9); y = y0; }
      else { x = x0; y = y0 - i * (2 * r + 13); }
      c.save();
      c.fillStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.arc(x + 2, y + 3, r, 0, 7); c.fill();
      c.fillStyle = kul ? L[i].renk : '#8a8f9c'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
      c.lineWidth = 3; c.strokeStyle = kul ? '#fff' : '#cfd3dc'; c.stroke();
      c.globalAlpha = kul ? 1 : 0.45;
      var oz = false;
      if (G.cizim && G.cizim.ikon) { try { G.cizim.ikon(c, L[i].ik, x, y, r * 1.5); oz = true; } catch (h) { } }
      if (!oz) yazi(c, kul ? '✨' : '', x, y + 1, r, '#fff', 'center', false);
      c.restore();
      yazi(c, L[i].ad, x, y + r + (kucuk ? 7 : 9), kucuk ? 9 : 10, kul ? '#fff' : '#aab', 'center');
    }
    // görünmezlik: kenar parıltısı + süre çubuğu
    var g = d.oyuncu && d.oyuncu.gorunmez;
    if (g > 0) {
      var h = d.ekran.h, pa = 0.25 + 0.1 * Math.sin(t * 5);
      var gr = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.38, w / 2, h / 2, Math.hypot(w, h) * 0.55);
      gr.addColorStop(0, 'rgba(120,140,255,0)'); gr.addColorStop(1, 'rgba(150,120,255,' + pa.toFixed(3) + ')');
      c.fillStyle = gr; c.fillRect(0, 0, w, h);
      var bw = Math.min(260, w * 0.5), bx = w / 2 - bw / 2, by = (kucuk ? 150 : 74) + ustOfs;
      panel(c, bx - 6, by - 14, bw + 12, 30, 15, 'rgba(40,40,110,0.85)', '#9fb4ff', 2);
      c.fillStyle = 'rgba(255,255,255,0.18)'; rr(c, bx, by - 4, bw, 10, 5); c.fill();
      c.fillStyle = '#9fb4ff'; rr(c, bx, by - 4, Math.max(8, bw * g / 7), 10, 5); c.fill();
      yazi(c, 'GÖRÜNMEZSİN ' + g.toFixed(1) + ' sn', w / 2, by - 12, 11, '#fff', 'center', false);
    }
  }
  function gokceYedek(c, R) {
    c.fillStyle = '#fff'; c.font = 'bold ' + (R * 1.1) + 'px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('G', 0, 2);
  }


  // ---------- scooter kazası paneli ----------
  function kardesYuz(c, ad, x, y, r) {
    var renk = ad === 'Atılay' ? '#2f7de1' : '#3fae4a';
    c.save(); c.translate(x, y);
    c.fillStyle = renk; c.strokeStyle = '#1d2233'; c.lineWidth = 2.5;
    c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#f5c9a0'; c.beginPath(); c.arc(0, r * 0.1, r * 0.68, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#222'; c.beginPath(); c.arc(-r * 0.25, 0, r * 0.1, 0, 7); c.fill(); c.beginPath(); c.arc(r * 0.25, 0, r * 0.1, 0, 7); c.fill();
    c.strokeStyle = '#c0392b'; c.lineWidth = 2; c.beginPath(); c.arc(0, r * 0.55, r * 0.22, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
    c.restore();
  }
  function okCiz(c, x, y, ang, s, renk) {
    c.save(); c.translate(x, y); c.rotate(ang);
    c.fillStyle = renk; c.strokeStyle = '#5a1000'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(s, 0); c.lineTo(-s * 0.2, -s * 0.8); c.lineTo(-s * 0.2, -s * 0.3); c.lineTo(-s * 0.9, -s * 0.3);
    c.lineTo(-s * 0.9, s * 0.3); c.lineTo(-s * 0.2, s * 0.3); c.lineTo(-s * 0.2, s * 0.8); c.closePath(); c.fill(); c.stroke();
    c.restore();
  }
  function kazaIkon(c, tur, x, y, s) {
    if (tur !== 'salincak' && tur !== 'pota') { ikon(c, 'scooter', x, y, s); return; }
    c.save(); c.translate(x, y); c.lineCap = 'round'; c.lineJoin = 'round';
    var k = s / 40;
    if (tur === 'salincak') {
      c.strokeStyle = '#7a5230'; c.lineWidth = 4 * k;
      c.beginPath(); c.moveTo(-14 * k, 14 * k); c.lineTo(-6 * k, -14 * k); c.lineTo(6 * k, -14 * k); c.lineTo(14 * k, 14 * k); c.stroke();
      c.strokeStyle = '#555'; c.lineWidth = 1.6 * k; c.beginPath(); c.moveTo(-4 * k, -14 * k); c.lineTo(-4 * k, 6 * k); c.moveTo(4 * k, -14 * k); c.lineTo(4 * k, 6 * k); c.stroke();
      c.fillStyle = '#f2b632'; c.fillRect(-7 * k, 6 * k, 14 * k, 4 * k);
    } else {
      c.strokeStyle = '#6d7480'; c.lineWidth = 4 * k; c.beginPath(); c.moveTo(-9 * k, 16 * k); c.lineTo(-9 * k, -14 * k); c.stroke();
      c.fillStyle = '#fff'; c.strokeStyle = '#333'; c.lineWidth = 1.6 * k; c.fillRect(-7 * k, -16 * k, 16 * k, 12 * k); c.strokeRect(-7 * k, -16 * k, 16 * k, 12 * k);
      c.strokeStyle = '#ff7a1a'; c.lineWidth = 2.4 * k; c.beginPath(); c.arc(4 * k, 1 * k, 4 * k, 0, 7); c.stroke();
    }
    c.restore();
  }
  function kazaHud(c, d, w, h, kucuk) {
    var K = d.kaza, o = d.oyuncu, k = d.kamera;
    if (!K || !o) return;
    if (K.asama === 'kosuyor' || K.asama === 'suruyor') {
      var KT = K.tur || 'scooter';
      var m1 = K.kardes + ' ' + ({ scooter: ['scootera koşuyor!', 'scootera bindi!'], salincak: ['salıncağa koşuyor!', 'salıncakta uçuyor!'], pota: ['potaya koşuyor!', 'potaya tırmanıyor!'] }[KT] || ['koşuyor!', 'bindi!'])[K.asama === 'kosuyor' ? 0 : 1], s1 = kucuk ? 13 : 15, w1 = olc(c, m1, s1) + 56;
      var y1 = (kucuk ? 160 : 74) + ustOfs;
      panel(c, w / 2 - w1 / 2, y1, w1, 34, 17, 'rgba(255,248,225,0.95)', '#ff9f1a', 3);
      kazaIkon(c, KT, w / 2 - w1 / 2 + 22, y1 + 17, 26);
      yazi(c, m1, w / 2 - w1 / 2 + 40, y1 + 18, s1, '#3b2410', 'left', false);
      return;
    }
    if (K.asama === 'iyilesti') return;
    if (K.asama !== 'dustu') return;
    var sn = Math.max(0, Math.ceil(K.kalan)), pw = Math.min(w - 24, kucuk ? 330 : 440), ph = 64;
    var px = w / 2 - pw / 2, py = (kucuk ? 156 : 72) + ustOfs, nb = 0.5 + 0.5 * Math.sin(t * (K.kalan < 8 ? 12 : 6));
    c.save();
    var gs = 1 + 0.015 * nb; c.translate(w / 2, py + ph / 2); c.scale(gs, gs); c.translate(-w / 2, -(py + ph / 2));
    panel(c, px, py, pw, ph, 20, 'rgba(' + Math.round(210 + 45 * nb) + ',' + Math.round(60 + 40 * nb) + ',30,0.96)', '#fff3c4', 4);
    kazaIkon(c, K.tur, px + 34, py + 32, 40);
    var ad = K.kardes.toLocaleUpperCase('tr-TR');
    yazi(c, ad + ' DÜŞTÜ!', px + 64, py + 20, kucuk ? 17 : 21, '#fff', 'left');
    yazi(c, 'Yanına git!', px + 64, py + 46, kucuk ? 14 : 16, '#ffe9b0', 'left', false);
    yazi(c, String(sn), px + pw - 36, py + 33, 42, sn <= 8 ? '#ffff7a' : '#fff', 'center');
    c.restore();
    // ok (3D'de gerçek ekran izdüşümü kullanılır)
    var ek = G.ekranNoktasi ? G.ekranNoktasi(K.x, K.y, 0.6) : null;
    var kx, ky;
    if (ek) { kx = ek.x; ky = ek.y; } else { kx = (K.x - k.x) * k.olcek; ky = (K.y - k.y) * k.olcek; }
    var ol = G.ucBoyut ? 1 : k.olcek, m = Math.round(Math.hypot(K.x - o.x, K.y - o.y) / 48);
    var kenar = 70, ekranda = kx > 20 && kx < w - 20 && ky > 20 && ky < h - 20;
    if (ekranda) {
      var zp = Math.abs(Math.sin(t * 6)) * 14;
      okCiz(c, kx, ky - 52 * ol - zp, Math.PI / 2, 20, '#ff5a1f');
    } else {
      var cx = w / 2, cy = h / 2, dx = kx - cx, dy = ky - cy, ang = Math.atan2(dy, dx);
      var sx = Math.abs(dx) > 1e-6 ? (w / 2 - kenar) / Math.abs(dx) : 1e9, sy = Math.abs(dy) > 1e-6 ? (h / 2 - kenar) / Math.abs(dy) : 1e9;
      var sc = Math.min(sx, sy), ex = cx + dx * sc, ey = cy + dy * sc, nab = 1 + 0.12 * Math.sin(t * 8);
      c.save(); c.translate(ex, ey); c.scale(nab, nab); c.translate(-ex, -ey);
      okCiz(c, ex + Math.cos(ang) * 30, ey + Math.sin(ang) * 30, ang, 24, '#ff5a1f');
      c.fillStyle = 'rgba(255,248,225,0.97)'; c.strokeStyle = '#ff5a1f'; c.lineWidth = 4;
      c.beginPath(); c.arc(ex, ey, 26, 0, 7); c.fill(); c.stroke();
      kardesYuz(c, K.kardes, ex, ey, 21);
      c.restore();
      var my = ey + (ey > h / 2 ? -42 : 42);
      yazi(c, m + ' m', ex, my, 15, '#fff', 'center');
    }
  }

  function kacamakPanel(c, d, kd, x, y, pw, kucuk) {
    var ph = 50, ph2 = kd.kacamak === 'bagiriyor' ? 'Atılay mikrofonda!' : (kd.kacamak === 'donuyor' ? 'Atılay geri dönüyor...' : 'Atılay görünmez kaçamakta!');
    var nb = 0.5 + 0.5 * Math.sin(t * 5);
    panel(c, x, y, pw, ph, 16, 'rgba(70,50,140,0.9)', kd.kacamak === 'bagiriyor' ? '#ffe14d' : '#b9a8ff', 3);
    c.save(); c.globalAlpha = 0.55 + 0.25 * nb; kardesYuz(c, 'Atılay', x + 26, y + 25, 17); c.restore();
    yazi(c, ph2, x + 52, y + 16, sigdir(c, ph2, pw - 62, kucuk ? 12 : 13), '#fff', 'left', false);
    var oran = Math.max(0, Math.min(1, (kd.gorunmez || 0) / (kd.kacamakToplam || 1)));
    c.fillStyle = 'rgba(255,255,255,0.2)'; rr(c, x + 52, y + 30, pw - 66, 10, 5); c.fill();
    if (oran > 0.02) { c.fillStyle = oran > 0.25 ? '#b9a8ff' : '#ffb02e'; rr(c, x + 52, y + 30, Math.max(8, (pw - 66) * oran), 10, 5); c.fill(); }
    c.lineWidth = 1.5; c.strokeStyle = 'rgba(255,255,255,0.8)'; rr(c, x + 52, y + 30, pw - 66, 10, 5); c.stroke();
  }
  function uyariBandi(c, d, uyn, w, kucuk) {
    var m = G.kisiAdi(uyn.kim) + ' uyandı! Evde iki kişi var!', fs = kucuk ? 14 : 18, tw = olc(c, m, fs) + 70, bh = 36;
    var y = kucuk ? 150 : 64, nb = 0.5 + 0.5 * Math.sin(t * 7);
    panel(c, w / 2 - tw / 2, y, tw, bh, 18, 'rgba(' + Math.round(200 + 55 * nb) + ',50,30,0.96)', '#ffe14d', 3);
    c.save(); c.translate(w / 2 - tw / 2 + 24, y + bh / 2 + 1);
    c.fillStyle = '#ffe14d'; c.strokeStyle = '#5a1000'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(0, -11); c.lineTo(12, 10); c.lineTo(-12, 10); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#5a1000'; c.fillRect(-1.5, -4, 3, 8); c.fillRect(-1.5, 6, 3, 3);
    c.restore();
    yazi(c, m, w / 2 + 12, y + bh / 2 + 1, fs, '#fff', 'center', true);
  }

  // ---------- anahtar / top bulundu logosu (2D overlay; oyunu durdurmaz) ----------
  var logo = null;
  var LOGO = {
    anahtar_mavi: { yazi: 'MAVİ ANAHTAR!', renk: '#3d8bff', koyu: '#10306e', isik: '255,255,200' },
    anahtar_kirmizi: { yazi: 'KIRMIZI ANAHTAR!', renk: '#ff4545', koyu: '#6e1010', isik: '255,225,190' },
    top_hazine: { yazi: 'TOPUN BULUNDU!', renk: '#ffcc33', koyu: '#5a3a00', isik: '255,240,170' }
  };
  function logoCiz(c, d) {
    var L = logo && LOGO[logo.tur];
    if (!L) return;
    var w = d.ekran.w, h = d.ekran.h, tt = logo.t, s = Math.max(0.55, Math.min(1.3, Math.min(w, h) / 620));
    var p = tt < 0.4 ? (function (x) { var k = 1.70158; x -= 1; return 1 + (k + 1) * x * x * x + k * x * x; })(tt / 0.4) : 1;
    var a = tt > 1.45 ? Math.max(0, 1 - (tt - 1.45) / 0.45) : 1;
    var puls = 1 + 0.04 * Math.sin(tt * 9);
    c.save(); c.globalAlpha = a; c.translate(w / 2, h * 0.42); c.scale(s * p * puls, s * p * puls);
    var gr = c.createRadialGradient(0, 0, 10, 0, 0, 230);
    gr.addColorStop(0, 'rgba(' + L.isik + ',0.85)'); gr.addColorStop(0.5, 'rgba(' + L.isik + ',0.28)'); gr.addColorStop(1, 'rgba(' + L.isik + ',0)');
    c.fillStyle = gr; c.beginPath(); c.arc(0, 0, 230, 0, 7); c.fill();
    c.save(); c.rotate(tt * 0.8); c.fillStyle = 'rgba(' + L.isik + ',0.22)';
    for (var i = 0; i < 10; i++) { c.rotate(Math.PI / 5); c.beginPath(); c.moveTo(0, 0); c.lineTo(-18, -210); c.lineTo(18, -210); c.closePath(); c.fill(); }
    c.restore();
    if (logo.tur === 'top_hazine') { ikon(c, 'top_hazine', 0, -6, 190); }
    else {
      c.save(); c.rotate(-0.6); c.lineJoin = 'round'; c.lineCap = 'round';
      function govde() {
        c.beginPath(); c.arc(-62, 0, 40, 0, 7); c.moveTo(-8, -9); c.lineTo(88, -9); c.lineTo(88, 40); c.lineTo(66, 40); c.lineTo(66, 12); c.lineTo(48, 12); c.lineTo(48, 32); c.lineTo(28, 32); c.lineTo(28, 12); c.lineTo(-8, 12); c.closePath();
      }
      govde(); c.lineWidth = 16; c.strokeStyle = L.koyu; c.stroke();
      govde(); c.fillStyle = L.renk; c.fill();
      c.beginPath(); c.arc(-62, 0, 16, 0, 7); c.fillStyle = L.koyu; c.fill();
      c.beginPath(); c.arc(-62, -2, 14, 0, 7); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fill();
      c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(-10, -6, 90, 5);
      c.restore();
    }
    konturYazi(c, L.yazi, 0, 140, 52, '#ffffff', L.koyu);
    c.restore();
  }

  // ---------- anons / zil / arama ----------
  function ustBanner(c, d, w, kucuk) {
    var ko = d.komsu, m = null, ren = null, y = (kucuk ? 150 : 64) + (d.uyanan ? 40 : 0);
    if (d.anons) { m = '📢 ANONS: ' + (d.anons.metin || ''); ren = ['rgba(60,40,140,0.95)', '#ffe14d']; }
    else if (ko && ko.zil) { m = '🔔 ZİL ÇALDI! ' + G.kisiAdi(ko.kim) + ' bayrak direğine gidiyor: FIRSAT!'; ren = ['rgba(30,110,150,0.95)', '#9fe0ff']; }
    if (!m) return;
    var fs = kucuk ? 13 : 17, tw = Math.min(w - 20, olc(c, m, fs) + 44), nb = 0.5 + 0.5 * Math.sin(t * 7);
    panel(c, w / 2 - tw / 2, y, tw, 34, 17, ren[0], ren[1], 3);
    yazi(c, m, w / 2, y + 18, sigdir(c, m, tw - 28, fs), '#fff', 'center', false);
  }
  function aramaHalka(c, d, o, k) {
    if (!o || !(o.aramaIl > 0.01) || !o.aramaN) return;
    var sp = G.ekranNoktasi ? G.ekranNoktasi(o.x, o.y, 2.1) : null;
    var x = sp ? sp.x : (o.x - k.x) * k.olcek, y = sp ? sp.y - 20 : (o.y - k.y) * k.olcek - 70;
    var R = dokunmatik ? 30 : 26, il = Math.min(1, o.aramaIl);
    c.save();
    c.fillStyle = 'rgba(255,255,255,0.92)'; c.beginPath(); c.arc(x, y, R + 6, 0, 7); c.fill();
    c.lineWidth = 8; c.strokeStyle = 'rgba(0,0,0,0.12)'; c.beginPath(); c.arc(x, y, R - 2, 0, 7); c.stroke();
    c.strokeStyle = '#ffb02e'; c.lineCap = 'round'; c.beginPath(); c.arc(x, y, R - 2, -Math.PI / 2, -Math.PI / 2 + il * Math.PI * 2); c.stroke();
    elIkon(c, x, y + 1, R * 0.9);
    c.restore();
  }

  // ---------- mini harita ----------
  function miniBase() {
    var h = G.harita;
    if (!h || !h.W || !h.H || !h.zemin) return null;
    var key = (G.bolum || 1) + '|' + h.W + 'x' + h.H;
    if (mini.key === key && mini.cv) return mini.cv;
    var cv = document.createElement('canvas'); cv.width = h.W; cv.height = h.H;
    var c = cv.getContext('2d'), x, y, z, col;
    for (y = 0; y < h.H; y++) for (x = 0; x < h.W; x++) {
      z = h.zemin(x, y);
      col = z === 'duvar' ? '#56564d' : z === 'cit' ? '#7f9862' : z === 'dis' ? '#5e7b4d' : z === 'cim' ? '#82a761' :
        z === 'yol' ? '#78848a' : z === 'kaldirim' ? '#b7b4a4' : (z === 'parke' || z === 'eski_parke') ? '#caa77b' :
        z === 'fayans' ? '#c6d8d1' : (z === 'hali' || z === 'kilim') ? '#c78f7d' : z === 'bodrum' ? '#7d7671' :
        z === 'kiler' ? '#a89273' : z === 'cakil' ? '#c8bca2' : z === 'toprak' ? '#b59a71' : '#b0a58f';
      c.fillStyle = col; c.fillRect(x, y, 1, 1);
    }
    mini = { key: key, cv: cv }; return cv;
  }
  function miniCiz(c, d) {
    var h = G.harita, base = miniBase();
    if (!base) return;
    var w = d.ekran.w, mw = (w < 700 || dokunmatik) ? 84 : 108, mh = Math.round(mw * h.H / h.W);
    mh = Math.min(mh, dokunmatik ? 62 : (d.ekran.h < 620 ? 76 : 112));
    var x = w - mw - 12, y = 112, kov = (d.komsu && d.komsu.durum === 'kovalama') || (d.uyanan && d.uyanan.durum === 'kovalama');
    panel(c, x - 4, y - 4, mw + 8, mh + 8, 12, 'rgba(22,34,52,0.8)', kov ? '#ff7a5c' : 'rgba(190,210,235,0.55)', 2);
    c.save(); rr(c, x, y, mw, mh, 8); c.clip();
    c.drawImage(base, x, y, mw, mh);
    c.globalAlpha = 0.95;
    function px(v) { return x + (v / 48) / h.W * mw; }
    function py(v) { return y + (v / 48) / h.H * mh; }
    (h.kapilar || []).forEach(function (k) {
      if (!k.kilit) return;
      c.fillStyle = k.kilit === 'anahtar_mavi' ? '#3d8bff' : '#ff4040';
      c.fillRect(px(k.tx * 48 + 24) - 1.5, py(k.ty * 48 + 24) - 1.5, 3, 3);
    });
    (h.toplanabilir || []).forEach(function (it) {
      if (it.alindi || it.gizli) return;
      c.fillStyle = it.tur === 'top_hazine' ? '#ffcc33' : it.tur.indexOf('anahtar') === 0 ? '#8fc2ff' : '#fff1b8';
      c.beginPath(); c.arc(px(it.x), py(it.y), 1.6, 0, 7); c.fill();
    });
    (d.kardesler || []).forEach(function (k, i) {
      if (!k || k.gizli) return;
      c.fillStyle = i ? '#66c46d' : '#64a8e8'; c.strokeStyle = '#20301f'; c.lineWidth = 0.8;
      c.beginPath(); c.arc(px(k.x), py(k.y), i ? 2.5 : 2.2, 0, 7); c.fill(); c.stroke();
    });
    if (d.gokce) { c.fillStyle = '#c084e6'; c.beginPath(); c.arc(px(d.gokce.x), py(d.gokce.y), 2.4, 0, 7); c.fill(); }
    if (d.uyuyan) { c.fillStyle = '#9fb2c6'; c.beginPath(); c.arc(px(d.uyuyan.x), py(d.uyuyan.y), 2.2, 0, 7); c.fill(); }
    if (d.komsu) {
      var dr = { devriye: '#5ed36b', yorgun: '#8fd3ff', suphe: '#ffb02e', kovalama: '#ff4545', arama: '#ffd84a', yakaladi: '#ff4545' }[d.komsu.durum] || '#5ed36b';
      c.fillStyle = dr; c.strokeStyle = '#3a1c17'; c.lineWidth = 1; c.beginPath(); c.arc(px(d.komsu.x), py(d.komsu.y), 3.2, 0, 7); c.fill(); c.stroke();
    }
    if (d.uyanan) {
      c.fillStyle = d.uyanan.durum === 'kovalama' ? '#ff5a4a' : '#ff9f4a'; c.beginPath(); c.arc(px(d.uyanan.x), py(d.uyanan.y), 3.2, 0, 7); c.fill();
    }
    if (d.kaza) {
      var kr = 5 + 2.5 * (0.5 + 0.5 * Math.sin(t * 9));
      c.strokeStyle = 'rgba(255,120,50,0.95)'; c.lineWidth = 2; c.beginPath(); c.arc(px(d.kaza.x), py(d.kaza.y), kr, 0, 7); c.stroke();
    }
    if (d.oyuncu) {
      c.save(); c.translate(px(d.oyuncu.x), py(d.oyuncu.y)); c.rotate(d.oyuncu.yon || 0);
      c.fillStyle = '#fffbe8'; c.strokeStyle = '#24301f'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(5.5, 0); c.lineTo(-3, -3.4); c.lineTo(-1.4, 0); c.lineTo(-3, 3.4); c.closePath(); c.fill(); c.stroke();
      c.restore();
    }
    c.restore();
    // kuzey işareti
    c.fillStyle = 'rgba(18,28,42,0.7)'; rr(c, x + mw - 27, y + 3, 24, 14, 6); c.fill();
    yazi(c, 'K ▲', x + mw - 15, y + 10, 8, '#fff', 'center', false);
  }

  function oyunHud(c, d) {
    var w = d.ekran.w, h = d.ekran.h, o = d.oyuncu, ko = d.komsu, k = d.kamera;
    var kucuk = w < 700;
    hudAlan = {};
    // vinyet
    var uyn = d.uyanan || null;
    ustOfs = uyn ? 40 : 0;
    var uy = ko ? ko.uyari || 0 : 0, kov = (ko && ko.durum === 'kovalama') || (uyn && uyn.durum === 'kovalama');
    var vA = kov ? 0.3 + 0.2 * Math.sin(t * 7) : Math.max(0, (uy - 0.4) * 0.35);
    if (vA > 0.01) {
      var gr = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.hypot(w, h) * 0.55);
      gr.addColorStop(0, 'rgba(255,0,0,0)'); gr.addColorStop(1, 'rgba(255,20,20,' + vA.toFixed(3) + ')');
      c.fillStyle = gr; c.fillRect(0, 0, w, h);
    }
    // sağ üst ölçüler: görev paneli göz göstergesiyle çakışmayacak şekilde daraltılır.
    var pb = 42, px = w - pb - 12;
    var tamVar = !!(G.tamEkran && G.tamEkran.destek()), tamX = px - pb - 8;
    var uw = kucuk ? 130 : 180, ux = (tamVar ? tamX : px) - 10 - uw;
    // görev + oda (uzun metin sarılır / küçültülür; panel taşmaz)
    var gm = dokunMetin(gorev(d)), gs = kucuk ? 14 : 18;
    var gMax = Math.max(150, Math.min(ux - 24, w - 24));
    var gSar = sar(c, gm, gs, gMax - 32, 2), gLines = gSar.lines, gFs = gSar.size, gTw = 0;
    for (var gi = 0; gi < gLines.length; gi++) gTw = Math.max(gTw, olc(c, gLines[gi], gFs));
    var gw = Math.max(Math.min(210, gMax), Math.min(gMax, gTw + 40)), gph = gLines.length > 1 ? 70 : 54;
    panel(c, 12, 12, gw, gph, 16, 'rgba(255,248,225,0.94)', '#ffb02e', 3);
    var bbi = G.bolumBilgi();
    yazi(c, 'GÖREV · BÖLÜM ' + bbi.no + ' · ' + String(bbi.kisaAd).toLocaleUpperCase('tr-TR'), 26, 27, 10, '#d9791a', 'left', false);
    for (gi = 0; gi < gLines.length; gi++) yazi(c, gLines[gi], 26, (gLines.length > 1 ? 43 : 46) + gi * (gFs + 3), gFs, '#3b2410', 'left', false);
    var sat2 = 12 + gph + 8, solX = 12;
    var oda = (G.harita && G.harita.odaAdi && o) ? G.harita.odaAdi(o.x, o.y) : '';
    if (oda) {
      var ow = olc(c, oda, kucuk ? 14 : 16) + 30;
      panel(c, 12, sat2, ow, 30, 15, 'rgba(30,40,80,0.85)', '#7da2ff', 2);
      yazi(c, oda, 27, sat2 + 16, kucuk ? 14 : 16, '#fff', 'left', false);
      solX = 12 + ow + 8;
    }
    // sağ üst: duraklat, ses, uyarı
    panel(c, px, 12, pb, pb, 12, 'rgba(30,40,80,0.85)', '#7da2ff', 2);
    c.fillStyle = '#fff'; rr(c, px + 12, 22, 6, 22, 2); c.fill(); rr(c, px + 24, 22, 6, 22, 2); c.fill();
    hudAlan.duraklat = { x: px, y: 12, w: pb, h: pb };
    if (tamVar) {
      var tamAcik = G.tamEkran.acikMi();
      panel(c, tamX, 12, pb, pb, 12, 'rgba(30,40,80,0.85)', '#7da2ff', 2);
      tamIkon(c, tamX + pb / 2, 12 + pb / 2, 22, tamAcik);
      hudAlan.tam = { x: tamX, y: 12, w: pb, h: pb };
    }
    panel(c, px, 62, pb, pb, 12, 'rgba(30,40,80,0.85)', '#7da2ff', 2);
    hoparlor(c, px + pb / 2 - 2, 62 + pb / 2, 26, G.ses && G.ses.kapali);
    hudAlan.ses = { x: px, y: 62, w: pb, h: pb };
    // bölüm sayacı: sağ üstte, ses düğmesinin altında
    var kalan = Math.max(0, Math.ceil((d.sureLimiti || 180) + (d.ekSure || 0) - d.zaman));
    var kdk = Math.floor(kalan / 60), ksn = kalan % 60, kritik = kalan <= 10;
    var tpw = kucuk ? 100 : 114, tpx = solX, tpy = sat2 - 2;
    panel(c, tpx, tpy, tpw, 34, 17, kritik ? 'rgba(120,20,20,0.92)' : 'rgba(30,40,80,0.85)', kritik ? '#ff4545' : '#7da2ff', 2);
    var kYazi = 'SÜRE ' + kdk + ':' + (ksn < 10 ? '0' : '') + ksn;
    yazi(c, kYazi, tpx + tpw / 2, tpy + 22, kucuk ? 13 : 15, kritik ? '#ffd0d0' : '#fff', 'center', false);
    var durumRenk = { devriye: '#5ed36b', yorgun: '#8fd3ff', suphe: '#ffb02e', kovalama: '#ff4545', arama: '#ffd84a', yakaladi: '#ff4545' };
    var dr = ko ? (durumRenk[ko.durum] || '#5ed36b') : '#5ed36b';
    panel(c, ux, 12, uw, 42, 21, 'rgba(30,40,80,0.85)', dr, 3);
    gozIkon(c, ux + 22, 33, 15, uy, dr);
    c.fillStyle = 'rgba(255,255,255,0.18)'; rr(c, ux + 46, 25, uw - 58, 16, 8); c.fill();
    if (uy > 0.02) { c.fillStyle = dr; rr(c, ux + 46, 25, Math.max(16, (uw - 58) * Math.min(1, uy)), 16, 8); c.fill(); }
    c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,0.8)'; rr(c, ux + 46, 25, uw - 58, 16, 8); c.stroke();
    // nöbetçi: portre + ad + nöbet çubuğu + ipucu
    if (ko && ko.kim) {
      var adK = G.kisiAdi(ko.kim), yorgun = ko.durum === 'yorgun';
      var nw = kucuk ? 178 : 222, nx = 12, ny = h - (kucuk ? 46 : 56) - 14 - 54 - 8;
      if (dokunmatik) ny = sat2 + 38;
      panel(c, nx, ny, nw, 54, 16, 'rgba(30,40,80,0.88)', yorgun ? '#8fd3ff' : '#7da2ff', 3);
      c.save(); c.beginPath(); c.arc(nx + 28, ny + 27, 22, 0, 7); c.fillStyle = 'rgba(255,255,255,0.18)'; c.fill(); c.clip();
      portre(c, ko.kim, nx + 28, ny + 28, 44); c.restore();
      yazi(c, 'Nöbette: ' + adK, nx + 58, ny + 17, sigdir(c, 'Nöbette: ' + adK, nw - 72, kucuk ? 12 : 14), '#fff', 'left', false);
      var oran = Math.max(0, Math.min(1, (ko.nobet == null ? 65 : ko.nobet) / (ko.nobetMax || 65)));
      c.fillStyle = 'rgba(255,255,255,0.2)'; rr(c, nx + 58, ny + 32, nw - 70, 11, 5); c.fill();
      if (oran > 0.02) { c.fillStyle = oran > 0.3 ? '#5ed36b' : '#ffb02e'; rr(c, nx + 58, ny + 32, Math.max(8, (nw - 70) * oran), 11, 5); c.fill(); }
      c.lineWidth = 1.5; c.strokeStyle = 'rgba(255,255,255,0.8)'; rr(c, nx + 58, ny + 32, nw - 70, 11, 5); c.stroke();
      var yy2 = dokunmatik ? ny + 62 : ny - 62;
      if (uyn) {
        var uw2 = nw, uadi = G.kisiAdi(uyn.kim), udur = uyn.durum === 'kovalama' ? 'Kovalıyor!' : (uyn.durum === 'suphe' ? 'Bakınıyor...' : (uyn.durum === 'uyaniyor' ? 'Uyanıyor...' : (uyn.durum === 'yorgun' ? 'Yatmaya gidiyor' : 'Dolaşıyor')));
        var ub = 0.5 + 0.5 * Math.sin(t * 6);
        panel(c, nx, yy2, uw2, 54, 16, 'rgba(110,35,30,0.9)', uyn.durum === 'kovalama' ? '#ff4545' : '#ffb02e', 3);
        c.save(); c.beginPath(); c.arc(nx + 28, yy2 + 27, 22, 0, 7); c.fillStyle = 'rgba(255,255,255,0.18)'; c.fill(); c.clip();
        portre(c, uyn.kim, nx + 28, yy2 + 28, 44); c.restore();
        yazi(c, 'Uyanık: ' + uadi, nx + 58, yy2 + 18, sigdir(c, 'Uyanık: ' + uadi, uw2 - 72, kucuk ? 12 : 14), '#fff', 'left', false);
        yazi(c, udur, nx + 58, yy2 + 38, kucuk ? 11 : 13, uyn.durum === 'kovalama' ? '#ffd0d0' : '#ffe0a0', 'left', false);
        yy2 += dokunmatik ? 62 : -62;
      }
      var kdA = d.kardesler && d.kardesler[0];
      if (kdA && kdA.kacamak) kacamakPanel(c, d, kdA, nx, yy2, nw + 40, kucuk);
      if (yorgun) {
        var ipM = adK + ' uyumaya gidiyor! Fırsat!', ipS = kucuk ? 14 : 17, ipW = olc(c, ipM, ipS) + 36;
        var pul = 0.85 + 0.15 * Math.sin(t * 6);
        panel(c, w / 2 - ipW / 2, 84 + ustOfs + (d.kaza && d.kaza.asama === 'dustu' && !kucuk ? 76 : 0), ipW, 36, 18, 'rgba(255,255,255,0.96)', '#8fd3ff', 3);
        c.save(); c.globalAlpha = pul; yazi(c, ipM, w / 2, 103 + ustOfs + (d.kaza && d.kaza.asama === 'dustu' && !kucuk ? 76 : 0), ipS, '#1f4f7a', 'center', false); c.restore();
      }
    }
    if (uyn) uyariBandi(c, d, uyn, w, kucuk);
    ustBanner(c, d, w, kucuk);
    miniCiz(c, d);
    // envanter
    var env = o && o.envanter || [], n = 6, ss = kucuk ? 46 : 56, gap = 8, tw = n * ss + (n - 1) * gap;
    var sx = (w - tw) / 2, sy = h - ss - 14, sonAt = -1;
    for (var q = 0; q < env.length; q++) if (ATILABILIR[env[q]]) sonAt = q;
    for (var i = 0; i < n; i++) {
      var X = sx + i * (ss + gap), dolu = i < env.length;
      panel(c, X, sy, ss, ss, 12, dolu ? 'rgba(255,248,225,0.95)' : 'rgba(20,30,60,0.55)', i === sonAt ? '#ffcc00' : (dolu ? '#ffb02e' : 'rgba(255,255,255,0.35)'), i === sonAt ? 4 : 2);
      if (dolu) {
        ikon(c, env[i], X + ss / 2, sy + ss / 2 - 4, ss * 0.62);
        yazi(c, esyaAdi(env[i]), X + ss / 2, sy + ss - 8, kucuk ? 8 : 9, '#4a2f12', 'center', false);
      }
    }
    gokceDugme(c, d, w, h, sx + tw, sy, ss, kucuk);
    if (sonAt >= 0 && !dokunmatik) yazi(c, 'F', sx + sonAt * (ss + gap) + ss - 8, sy - 8, 13, '#ffd93b', 'center');
    // kontrol ipuçları menüde ve duraklat ekranında gösterilir; oyun HUD'u temiz kalır.
    // yakındaki ipucu
    if (o && o.yakindaki && o.yakindaki.metin && !o.saklandi || (o && o.saklandi && o.yakindaki)) {
      var sp = G.ekranNoktasi ? G.ekranNoktasi(o.x, o.y, 1.7) : null;
      var bx = sp ? sp.x : (o.x - k.x) * k.olcek, by = sp ? sp.y - 14 : (o.y - k.y) * k.olcek - 46 * k.olcek - 14;
      var mt = o.yakindaki.metin, fs = 16, kw = dokunmatik ? 30 : 30, bw = olc(c, mt, fs) + kw + 36, bh = 38;
      bx = Math.max(bw / 2 + 8, Math.min(w - bw / 2 - 8, bx)); by = Math.max(bh + 8, Math.min(h - 90, by));
      var zip = Math.sin(t * 6) * 2;
      c.save(); c.translate(0, zip);
      c.fillStyle = 'rgba(0,0,0,0.25)'; rr(c, bx - bw / 2 + 2, by - bh + 5, bw, bh, 19); c.fill();
      c.fillStyle = '#fff'; rr(c, bx - bw / 2, by - bh, bw, bh, 19); c.fill();
      c.beginPath(); c.moveTo(bx - 8, by - 2); c.lineTo(bx + 8, by - 2); c.lineTo(bx, by + 9); c.closePath(); c.fill();
      c.lineWidth = 3; c.strokeStyle = '#ffb02e'; rr(c, bx - bw / 2, by - bh, bw, bh, 19); c.stroke();
      if (dokunmatik) elIkon(c, bx - bw / 2 + 24, by - bh / 2, 22);
      else tus(c, 'E', bx - bw / 2 + 10, by - bh / 2, 14);
      yazi(c, mt, bx - bw / 2 + 12 + kw + 8, by - bh / 2 + 1, fs, '#3b2410', 'left', false);
      c.restore();
    }
    // mesaj (üst şeridin altında; kaza sırasında kazaHud zaten yönlendirir)
    if (d.mesaj && d.mesaj.metin && !d.kaza) {
      var a = Math.max(0, Math.min(1, d.mesaj.sure / 0.7)), ms = kucuk ? 17 : 22, mw = olc(c, d.mesaj.metin, ms) + 44;
      var my = 124;
      c.save(); c.globalAlpha = a;
      panel(c, w / 2 - mw / 2, my - 20, mw, 42, 21, 'rgba(255,255,255,0.96)', '#ff7a1a', 3);
      yazi(c, d.mesaj.metin, w / 2, my + 1, ms, '#3b2410', 'center', false);
      c.restore();
    }
    aramaHalka(c, d, o, k);
    kazaHud(c, d, w, h, kucuk);
    if (dokunmatik) dokunCiz(c, d);
  }

  function yakalandiCiz(c, d) {
    var w = d.ekran.w, h = d.ekran.h, s = Math.min(w / 760, h / 520, 1.2);
    perde(c, d, 'rgba(120,10,20,0.55)');
    c.save(); c.translate(w / 2, h / 2); c.scale(s, s);
    var gir = Math.min(1, modZaman / 0.35), pk = 1 + (1 - gir) * 0.5 + Math.sin(modZaman * 8) * 0.02 * gir;
    panel(c, -330, -200, 660, 400, 30, 'rgba(255,248,225,0.97)', '#ff5252', 6);
    c.save(); c.translate(0, -125); c.scale(pk, pk); c.rotate(Math.sin(t * 5) * 0.03);
    var sy = d.sonYakalanma, kaza = sy && sy.sebep === 'kaza', sure = sy && sy.sebep === 'sure';
    var kim = sy && sy.kim ? sy.kim : ((d.komsu && d.komsu.kim) || G.bolumBilgi().ilkNobetci);
    var kisi = G.kisiAdi(kim).toLocaleUpperCase('tr-TR');
    var bsl = sure ? 'SÜRE DOLDU!' : (kaza ? (sy.kardes ? sy.kardes.toLocaleUpperCase('tr-TR') : 'KARDEŞİN') + ' AĞLADI, ' + kisi + ' DUYDU!' : kisi + ' YAKALADI!');
    var bsz = bsl.length > 16 ? Math.min(56, 560 / (bsl.length * 0.62)) : 56;
    konturYazi(c, bsl, 0, 0, bsz, '#ff5252', '#5a0c18'); c.restore();
    if (!sure) for (var sg = -1; sg <= 1; sg += 2) { c.save(); c.translate(sg * 300, -125); c.rotate(Math.sin(t * 4) * 0.1 * sg); portre(c, kim, 0, 0, 56); c.restore(); }
    if (sure) yazi(c, 'Bölüm süresi bitti; ek süre de kullanıldı.', 0, -50, 22, '#4a2f12', 'center', false);
    else if (kaza) yazi(c, 'Kardeşine zamanında yetişemedin.', 0, -50, 24, '#4a2f12', 'center', false);
    else yazi(c, G.kisiYakalama(kim), 0, -50, sigdir(c, G.kisiYakalama(kim), 560, 24), '#4a2f12', 'center', false);
    yazi(c, sure ? 'Bölümü baştan dene!' : 'Eşyaların sende, tekrar dene!', 0, -18, 24, '#4a2f12', 'center', false);
    yazi(c, 'Yakalanma sayısı: ' + d.yakalanma, 0, 28, 20, '#a8430b', 'center', false);
    if (modZaman > 0.8) dugme(c, dokunmatik ? 'DOKUN: DEVAM' : 'DEVAM ET', 0, 118, 330, 74, '#34c26a', '#1c7a40', true);
    else dugme(c, '...', 0, 118, 330, 74, '#9aa5ad', '#6a747b', false);
    if (modZaman > 0.8 && !dokunmatik) yazi(c, 'Tıkla ya da Enter / Boşluk', 0, 172, 15, '#6b5a40', 'center', false);
    c.restore();
  }

  function kazandiCiz(c, d) {
    var w = d.ekran.w, h = d.ekran.h, s = Math.min(w / 760, h / 560, 1.2);
    perde(c, d, 'rgba(255,190,30,0.35)');
    var cl = c.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, Math.max(w, h) * 0.6);
    cl.addColorStop(0, 'rgba(255,240,150,0.35)'); cl.addColorStop(1, 'rgba(30,60,160,0.35)'); c.fillStyle = cl; c.fillRect(0, 0, w, h);
    // konfeti (panelin arkasında)
    for (var i = 0; i < konfeti.length; i++) {
      var p = konfeti[i];
      c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.scale(1, Math.abs(Math.cos(p.rot * 1.5)) * 0.8 + 0.2);
      c.fillStyle = p.renk; c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); c.restore();
    }
    c.save(); c.translate(w / 2, h / 2); c.scale(s, s);
    panel(c, -340, -230, 680, 460, 30, 'rgba(255,250,230,0.97)', '#ffb02e', 6);
    var gir = Math.min(1, modZaman / 0.4), pk = 1 + (1 - gir) * 0.6 + Math.sin(t * 4) * 0.02;
    c.save(); c.translate(0, -165); c.scale(pk, pk);
    var kb = G.bolumBilgi().kazandiBaslik; konturYazi(c, kb, 0, 0, sigdir(c, kb, 600, 56), '#ffcc33', '#4a2200'); c.restore();
    c.save(); c.translate(0, -40 + Math.abs(Math.sin(t * 3.5)) * -26);
    ikon(c, 'top_hazine', 0, 0, 100); c.restore();
    c.fillStyle = 'rgba(0,0,0,0.12)'; c.beginPath(); c.ellipse(0, 40, 36 - Math.abs(Math.sin(t * 3.5)) * 8, 8, 0, 0, 7); c.fill();
    yazi(c, G.bolumBilgi().kazandiAlt, 0, 62, 21, '#4a2f12', 'center', false);
    yazi(c, 'Süre: ' + sureYazi(d.istatistik && d.istatistik.sure), -100, 100, 24, '#2b3355', 'center', false);
    yazi(c, 'Yakalanma: ' + d.yakalanma, 120, 100, 24, '#2b3355', 'center', false);
    if (modZaman > 0.8) dugme(c, dokunmatik ? 'DOKUN: TEKRAR' : 'TEKRAR OYNA', 0, 168, 340, 74, '#ff7a1a', '#a8430b', true);
    else dugme(c, '...', 0, 168, 340, 74, '#9aa5ad', '#6a747b', false);
    c.restore();
  }

  function bolumBittiCiz(c, d) {
    var w = d.ekran.w, h = d.ekran.h, s = Math.min(w / 760, h / 560, 1.2);
    perde(c, d, 'rgba(255,190,30,0.35)');
    var cl = c.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, Math.max(w, h) * 0.6);
    cl.addColorStop(0, 'rgba(255,240,150,0.35)'); cl.addColorStop(1, 'rgba(30,60,160,0.35)'); c.fillStyle = cl; c.fillRect(0, 0, w, h);
    for (var i = 0; i < konfeti.length; i++) {
      var p = konfeti[i];
      c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.scale(1, Math.abs(Math.cos(p.rot * 1.5)) * 0.8 + 0.2);
      c.fillStyle = p.renk; c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); c.restore();
    }
    c.save(); c.translate(w / 2, h / 2); c.scale(s, s);
    panel(c, -340, -230, 680, 460, 30, 'rgba(255,250,230,0.97)', '#3d8bff', 6);
    var gir = Math.min(1, modZaman / 0.4), pk = 1 + (1 - gir) * 0.6 + Math.sin(t * 4) * 0.02;
    c.save(); c.translate(0, -170); c.scale(pk, pk);
    var bt = 'BÖLÜM ' + G.bolum + ' TAMAM!';
    konturYazi(c, bt, 0, 0, sigdir(c, bt, 600, 56), '#4cd964', '#0b3a1a'); c.restore();
    c.save(); c.translate(0, -100 + Math.abs(Math.sin(t * 3.5)) * -22);
    ikon(c, 'top_hazine', 0, 0, 70); c.restore();
    c.fillStyle = 'rgba(0,0,0,0.12)'; c.beginPath(); c.ellipse(0, -62, 28 - Math.abs(Math.sin(t * 3.5)) * 6, 6, 0, 0, 7); c.fill();
    var gec = G.bolumBilgi().gecis || [];
    for (var k = 0; k < gec.length; k++) yazi(c, gec[k], 0, -30 + k * 30, sigdir(c, gec[k], 630, 20), '#4a2f12', 'center', false);
    yazi(c, 'Süre: ' + sureYazi(d.istatistik && d.istatistik.sure) + '   Yakalanma: ' + d.yakalanma, 0, 112, 20, '#2b3355', 'center', false);
    var sn = G.bolumler[G.bolum + 1];
    if (modZaman > 0.8) dugme(c, dokunmatik ? 'DOKUN: BÖLÜM ' + (G.bolum + 1) : 'DEVAM: BÖLÜM ' + (G.bolum + 1), 0, 170, 380, 70, '#3d8bff', '#1c4ea0', true);
    else dugme(c, '...', 0, 170, 380, 70, '#9aa5ad', '#6a747b', false);
    c.restore();
  }

  function dikeyCiz(c, d) {
    var w = d.ekran.w, h = d.ekran.h, u = Math.min(w, h) / 390;
    c.fillStyle = 'rgba(16,14,40,0.97)'; c.fillRect(0, 0, w, h);
    c.save(); c.translate(w / 2, h * 0.4); c.scale(u, u);
    var ph = (Math.sin(t * 1.6) * 0.5 + 0.5), ang = -Math.PI / 2 * Math.min(1, Math.max(0, (ph - 0.2) / 0.6));
    c.rotate(ang);
    c.fillStyle = '#2b3355'; rr(c, -45, -80, 90, 160, 16); c.fill();
    c.lineWidth = 6; c.strokeStyle = '#ffe14d'; c.stroke();
    c.fillStyle = '#7da2ff'; rr(c, -36, -66, 72, 126, 6); c.fill();
    c.fillStyle = '#ffe14d'; c.beginPath(); c.arc(0, 69, 5, 0, 7); c.fill();
    c.restore();
    c.save(); c.translate(w / 2, h * 0.4); c.scale(u, u);
    c.strokeStyle = '#ffe14d'; c.lineWidth = 7; c.lineCap = 'round';
    c.beginPath(); c.arc(0, 0, 118, -2.3, -0.6); c.stroke();
    c.fillStyle = '#ffe14d'; c.beginPath(); var ex = Math.cos(-0.6) * 118, ey = Math.sin(-0.6) * 118;
    c.moveTo(ex + 16, ey - 2); c.lineTo(ex - 6, ey - 16); c.lineTo(ex - 8, ey + 12); c.closePath(); c.fill();
    c.restore();
    var fs = Math.max(22, Math.min(40, w / 11));
    konturYazi(c, 'Ekrana dokun', w / 2, h * 0.4 + 150 * u, fs, '#ffe14d', '#2b1b4a');
    yazi(c, 'Oyun yatay açılır, telefonu yan çevir.', w / 2, h * 0.4 + 150 * u + fs * 1.3, Math.max(12, Math.min(18, w / 24)), '#cfd8ff', 'center', false);
    if (G.yatayHata) yazi(c, 'Olmadıysa: telefonda otomatik döndürmeyi aç.', w / 2, h * 0.4 + 150 * u + fs * 2.3, Math.max(11, Math.min(15, w / 28)), '#ffb3a8', 'center', false);
  }

  function duraklatCiz(c, d) {
    var w = d.ekran.w, h = d.ekran.h, s = Math.min(w / 700, h / 440, 1.2);
    perde(c, d, 'rgba(14,22,45,0.68)');
    c.save(); c.translate(w / 2, h / 2); c.scale(s, s);
    panel(c, -300, -215, 600, 430, 28, 'rgba(30,40,80,0.95)', '#7da2ff', 5);
    konturYazi(c, 'DURAKLATILDI', 0, -165, 56, '#ffe14d', '#2b1b4a');
    yazi(c, G.bolumBilgi().duraklatAlt, 0, -112, 18, '#9fc0ff', 'center', false);
    yazi(c, 'Ses: ' + (G.ses && G.ses.kapali ? 'kapalı' : 'açık') + (dokunmatik ? '' : '  (M ile değiştir)'), 0, -84, 17, '#fff', 'center', false);
    yazi(c, 'Yakalanma: ' + d.yakalanma + '   Toplam: ' + sureYazi((d.oncekiSure || 0) + d.zaman) + '   Bölüm limiti: ' + sureYazi(d.sureLimiti || 180) + ' (+' + (d.ekSureHakki || 60) + ' sn)', 0, -58, 16, '#ffd93b', 'center', false);
    yazi(c, G.bolumBilgi().kisiler || 'Sümeyye · Enes · Hanife · Mahmut', 0, -34, 13, '#ffd9a0', 'center', false);
    if (G.ucBoyut) yazi(c, dokunmatik ? 'DÖN: kamerayı 90° döndür' : 'Z / X: kamerayı döndür · Tekerlek: yakınlaştır', 0, -10, 14, '#bfe0ff', 'center', false);
    yazi(c, 'Giray scooterda, salıncakta ya da potada şansını dener; düşerse yanına koş!', 0, 14, 13, '#c8e6c0', 'center', false);
    yazi(c, dokunmatik ? 'Devam etmek için DEVAM düğmesine ya da boş yere dokun' : 'Devam etmek için P ya da Esc, ya da tıkla', 0, 52, 16, '#fff', 'center', false);
    dugme(c, 'DEVAM', -125, 125, 220, 62, '#34c26a', '#1c7a40', false);
    dugme(c, 'AYARLAR', 125, 125, 220, 62, '#7a5cff', '#41309a', false);
    menuAlan.pAyar = ekranAlani(w, h, s, 0, 125, 125, 220, 62);
    c.restore();
  }

  G.arayuz = {
    init: function (d) {
      canvas = document.getElementById('oyun');
      dokunmatik = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || /[?&]dokunmatik=1/.test(location.search);
      G.dokunmatik = dokunmatik;
      if (!canvas) return;
      var fareAyar = false;
      canvas.addEventListener('pointerdown', function (e) {
        var dd = G.d; if (!dd) return;
        if (G.ses && G.ses.ac) G.ses.ac();
        if (e.pointerType === 'touch') return;   // dokunuşları touch olayları yönetir
        if (G.dikey) return;
        if (G.ayarlar && G.ayarlar.acik) {
          var pa = konum(e); fareAyar = true;
          try { canvas.setPointerCapture(e.pointerId); } catch (h) { }
          G.ayarlar.dokun(pa.x, pa.y, 'bas'); return;
        }
        if (dd.mod === 'oyun') hudTikla(konum(e)); else onayVer(konum(e));
        tamIsle();   // fare/kalem: pointerdown kullanıcı hareketidir, doğrudan işleyici içinde
      });
      canvas.addEventListener('pointermove', function (e) {
        if (!fareAyar || e.pointerType === 'touch') return;
        var pa = konum(e); G.ayarlar.dokun(pa.x, pa.y, 'surukle');
      });
      canvas.addEventListener('pointerup', function (e) {
        if (!fareAyar || e.pointerType === 'touch') return;
        fareAyar = false; G.ayarlar.dokun(0, 0, 'birak');
      });
      if (dokunmatik) {
        canvas.addEventListener('touchstart', dokunBasla, { passive: false });
        canvas.addEventListener('touchmove', dokunHareket, { passive: false });
        canvas.addEventListener('touchend', dokunBitti, { passive: false });
        canvas.addEventListener('touchcancel', dokunBitti, { passive: false });
      }
      if (G.girdi) { G.girdi.dokunKos = false; G.girdi.dokunEgil = false; }
      if (G.dinle && !G.arayuz._logoDinle) {
        G.arayuz._logoDinle = true;
        G.dinle('esya_al', function (v) { if (v && LOGO[v.tur]) logo = { tur: v.tur, t: 0 }; });
      }
    },
    logoDurum: function () { return logo; },
    _menuAlan: function () { return menuAlan; },
    guncelle: function (dt, d) {
      t += dt;
      if (logo) { logo.t += dt; if (logo.t > 1.9) logo = null; }
      if (d.mod !== sonMod) { sonMod = d.mod; modZaman = 0; konfeti = []; konfetiBirikim = 0; if (d.mod !== 'oyun') dokunBirak(); }
      modZaman += dt;
      if (d.mod === 'kazandi' || d.mod === 'bolumBitti') {
        var renkler = ['#ff5252', '#ffb02e', '#ffe14d', '#4cd964', '#3d9bff', '#b565ff', '#ff7ac8'];
        konfetiBirikim += dt * (modZaman < 3 ? 110 : 55);
        while (konfetiBirikim >= 1 && konfeti.length < 260) {
          konfetiBirikim -= 1;
          konfeti.push({ x: Math.random() * d.ekran.w, y: -10, vx: (Math.random() - 0.5) * 120, vy: 80 + Math.random() * 140,
            rot: Math.random() * 6, vr: (Math.random() - 0.5) * 12, renk: renkler[(Math.random() * renkler.length) | 0], w: 7 + Math.random() * 7, h: 4 + Math.random() * 5 });
        }
        konfetiBirikim = Math.min(konfetiBirikim, 1);
      }
      for (var i = konfeti.length - 1; i >= 0; i--) {
        var p = konfeti[i];
        p.x += (p.vx + Math.sin(t * 2 + i) * 40) * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        if (p.y > d.ekran.h + 20) konfeti.splice(i, 1);
      }
      if (G.girdi && G.girdi.al('onay')) onayVer();
    },
    ciz: function (c, d) {
      var dpr = d.ekran.dpr || 1;
      c.save();
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.lineJoin = 'round'; c.lineCap = 'round';
      hudAlan = d.mod === 'oyun' ? hudAlan : {};
      if (d.mod === 'menu') menuCiz(c, d);
      else if (d.mod === 'oyun') oyunHud(c, d);
      else if (d.mod === 'yakalandi') yakalandiCiz(c, d);
      else if (d.mod === 'kazandi') kazandiCiz(c, d);
      else if (d.mod === 'bolumBitti') bolumBittiCiz(c, d);
      else if (d.mod === 'duraklat') duraklatCiz(c, d);
      if (logo) logoCiz(c, d);
      if (G.ayarlar && G.ayarlar.acik) G.ayarlar.ciz(c, d);
      if (G.dikey) dikeyCiz(c, d);
      c.restore();
    }
  };
})();
