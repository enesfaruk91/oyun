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
  function gorevAnahtar(d) {
    var env = (d.oyuncu && d.oyuncu.envanter) || [];
    var var_ = function (x) { return env.indexOf(x) >= 0; };
    if (var_('top_hazine')) return 'top';
    if (var_('anahtar_kirmizi')) return 'kirmiziVar';
    var mavikilit = false, kapilar = G.harita && G.harita.kapilar;
    if (kapilar) for (var i = 0; i < kapilar.length; i++) if (kapilar[i].kilit === 'anahtar_mavi') mavikilit = true;
    if (var_('anahtar_mavi') && (mavikilit || !kapilar)) return 'maviVar';
    if (!var_('anahtar_mavi') && (mavikilit || !kapilar)) return 'maviYok';
    return 'kirmiziYok';
  }
  function gorev(d) {
    var a = gorevAnahtar(d), g = G.bolumBilgi().gorev;
    return a === 'top' ? 'Topunu aldın! Hadi kaç!' : g[a];
  }
  // bolum.js'e dokunmadan kısa görev metni (en çok 26 karakter)
  function gorevKisa(tam, a) {
    if (a === 'maviYok') return 'Mavi anahtarı bul';
    if (a === 'kirmiziYok') return 'Kırmızı anahtarı bul';
    var m = String(tam).replace(/\s*\([^)]*\)/g, '').replace(/[!?.]+$/, '');
    if (m.length > 26) m = m.split(',')[0];
    if (m.length > 26) m = m.replace('Öğretmenler Odası', 'Öğr. Odası').replace('yatak odasının', 'yatak odası');
    if (m.length > 26) { var k = m.split(' '); k.shift(); m = k.join(' '); m = m.charAt(0).toLocaleUpperCase('tr-TR') + m.slice(1); }
    if (m.length > 26) m = m.slice(0, 25) + '…';
    return m;
  }
  function gorevIkon(a) { return a === 'top' ? 'top_hazine' : (a === 'kirmiziVar' || a === 'kirmiziYok') ? 'anahtar_kirmizi' : 'anahtar_mavi'; }

  // ---------- tost kuyruğu (bütün geçici yazılar buradan geçer) ----------
  var tGor = [], tBek = [], tIsaret = null, tAnons = '', tYorgun = false, tGorevSon = null, cipTam = '';
  var envPop = {};   // envanter kutusu parlaması: tur -> süre
  function tostEkle(m, sure, onem, uzun) {
    m = String(m || '').trim(); if (!m) return;
    if (/alındı\.?$/.test(m) || /^(Mavi|Kırmızı) anahtarı buldun/.test(m) || /^Ogeday'ın topu! Buldun/.test(m)) return;   // eşya alma yazıları kalktı
    onem = onem || (/yakalan|uyandı|düştü|DÜŞTÜ|süre verdim/.test(m) ? 2 : 1);
    sure = (uzun || m.length > 40) ? 3 : 2;
    var i;
    for (i = 0; i < tGor.length; i++) if (tGor[i].m === m) { tGor[i].kalan = tGor[i].toplam = sure; return; }
    for (i = 0; i < tBek.length; i++) if (tBek[i].m === m) { tBek[i].toplam = sure; return; }
    var yeni = { m: m, toplam: sure, kalan: sure, gecen: 0, onem: onem };
    if (onem >= 2) {
      tBek.unshift(yeni);
      for (i = 0; i < tGor.length; i++) if (tGor[i].onem < onem) tGor[i].kalan = Math.min(tGor[i].kalan, 0.25);
    } else tBek.push(yeni);
    while (tBek.length > 3) { var at = -1; for (i = 0; i < tBek.length; i++) if (tBek[i].onem < 2) { at = i; break; } tBek.splice(at < 0 ? tBek.length - 1 : at, 1); }
  }
  function tostGuncelle(dt) {
    var mx = dokunmatik ? 1 : 2, i;
    for (i = tGor.length - 1; i >= 0; i--) {
      var q = tGor[i]; q.kalan -= dt; q.gecen += dt;
      if (tBek.length && q.gecen > 1.0) q.kalan = Math.min(q.kalan, 0.3);
      if (q.kalan <= 0) tGor.splice(i, 1);
    }
    while (tGor.length < mx && tBek.length) {
      var b = 0; for (i = 1; i < tBek.length; i++) if (tBek[i].onem > tBek[b].onem) b = i;
      tGor.push(tBek.splice(b, 1)[0]);
    }
  }
  function tostCiz(c, d, w, y0) {
    var tel = dokunmatik || w < 700, fs = tel ? 13 : 15, y = y0, maxW = tel ? Math.max(200, w - 440) : Math.min(560, w - 440);
    for (var i = 0; i < tGor.length; i++) {
      var q = tGor[i], a = Math.min(1, q.gecen / 0.12, q.kalan / 0.25);
      var sr = sar(c, q.m, fs, maxW - 22, 2), ln = sr.lines, lh = sr.size + 3, bh = ln.length * lh + (tel ? 8 : 10), tw = 0;
      for (var k = 0; k < ln.length; k++) tw = Math.max(tw, olc(c, ln[k], sr.size));
      var bw = tw + 22, bx = w / 2 - bw / 2;
      c.save(); c.globalAlpha = Math.max(0, a) * 0.9; c.translate(0, (1 - Math.max(0, Math.min(1, a))) * -6);
      c.fillStyle = q.onem >= 2 ? 'rgba(170,38,30,0.9)' : 'rgba(28,24,48,0.8)'; rr(c, bx, y, bw, bh, Math.min(14, bh / 2)); c.fill();
      c.lineWidth = 1.5; c.strokeStyle = q.onem >= 2 ? 'rgba(255,225,120,0.9)' : 'rgba(255,255,255,0.35)'; c.stroke();
      for (k = 0; k < ln.length; k++) yazi(c, ln[k], w / 2, y + bh / 2 + (k - (ln.length - 1) / 2) * lh + 1, sr.size, '#fff', 'center', false);
      c.restore();
      y += bh + 4;
    }
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
        else if (ad === 'gorev') tostEkle(cipTam, 3, 1, true);
        else if (ad === 'gokce') { if (G.kardesler && G.kardesler.gokceCagir) G.kardesler.gokceCagir(G.d); }
        else if (ad === 'ses' && G.ses && G.ses.sustur) { G.ses.sustur(!G.ses.kapali); }
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
      if (icinde(menuAlan.pSes)) { if (G.ses && G.ses.sustur) G.ses.sustur(!G.ses.kapali); return true; }
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
    c.globalAlpha = aktif ? 0.6 : 0.28;
    c.fillStyle = 'rgba(255,255,255,0.2)'; c.strokeStyle = '#fff'; c.lineWidth = 2;
    c.beginPath(); c.arc(bx, by, joy.R * u, 0, 7); c.fill(); c.stroke();
    c.fillStyle = aktif ? '#ffd93b' : '#fff'; c.strokeStyle = '#2b3355'; c.lineWidth = 3;
    c.beginPath(); c.arc(kx, ky, 24 * u, 0, 7); c.fill(); c.stroke();
    // butonlar
    var bl = btnler(d);
    for (var i = 0; i < bl.length; i++) {
      var b = bl[i], bas = basili[b.ad];
      var br = b.r * 0.8;
      c.globalAlpha = bas ? 0.85 : 0.42;
      c.fillStyle = bas ? '#fff' : b.renk; c.strokeStyle = '#fff'; c.lineWidth = 2;
      c.beginPath(); c.arc(b.x, b.y, br * (bas ? 0.92 : 1), 0, 7); c.fill(); c.stroke();
      c.globalAlpha = bas ? 1 : 0.75;
      if (b.ad === 'etkilesim') elIkon(c, b.x, b.y + br * 0.05, br * 1.1);
      else yazi(c, b.yazi, b.x, b.y + 1, br * (b.yazi.length > 2 ? 0.46 : 0.8), bas ? b.renk : '#fff', 'center', false);
      c.globalAlpha = 1;
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
      yildizToplamPill(c, 10, 10);
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
    yildizToplamPill(c, 10, 10);
    surumEtiket(c, d);
  }

  function gokceDugme(c, d, w, h, envSag, envY, ss, kucuk) {
    var tel = dokunmatik;
    var Rn = tel ? 22 : 26, hak = d.gokceHakki || 0, aktif = G.kardesler && G.kardesler.gokceAktif ? G.kardesler.gokceAktif(d) : !!d.gokce, kullanildi = hak <= 0 || aktif;
    var u = Math.max(0.7, Math.min(1.15, Math.min(w, h) / 420));
    var cx, cy;
    if (tel) { cx = w - 226 * u; cy = h - 92 * u; }
    else { cx = Math.min(w - Rn - 14, envSag + Rn + 14); cy = envY + ss - Rn; }
    var kov = d.komsu && d.komsu.durum === 'kovalama' && hak > 0 && !aktif;
    var nb = kov ? (0.5 + 0.5 * Math.sin(t * 8)) : 0;
    c.save();
    if (!tel || true) c.globalAlpha = tel ? 0.8 : 0.95;
    if (kov) {
      c.globalAlpha = 0.35 + 0.4 * nb; c.fillStyle = '#ffe14d';
      c.beginPath(); c.arc(cx, cy, Rn + 5 + nb * 7, 0, 7); c.fill(); c.globalAlpha = tel ? 0.8 : 0.95;
    }
    var k = kov ? 1 + nb * 0.07 : 1;
    c.translate(cx, cy); c.scale(k, k);
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.arc(2, 3, Rn, 0, 7); c.fill();
    c.fillStyle = kullanildi ? '#8a8f9c' : '#9b4fd6'; c.beginPath(); c.arc(0, 0, Rn, 0, 7); c.fill();
    c.lineWidth = 2.5; c.strokeStyle = kullanildi ? '#cfd3dc' : '#fff'; c.stroke();
    if (!kullanildi) {
      c.save(); c.beginPath(); c.arc(0, 0, Rn - 2, 0, 7); c.clip();
      if (G.cizim && G.cizim.ikon) { try { G.cizim.ikon(c, 'gokce', 0, -2, Rn * 1.5); } catch (h2) { gokceYedek(c, Rn); } }
      else gokceYedek(c, Rn);
      c.restore();
    } else yazi(c, hak > 0 ? '...' : 'bitti', 0, 0, tel ? 9 : 10, '#fff', 'center', false);
    c.restore();
    if (!kullanildi) {
      c.fillStyle = '#ffd93b'; c.strokeStyle = '#4a2f12'; c.lineWidth = 1.5;
      c.beginPath(); c.arc(cx + Rn * 0.75, cy + Rn * 0.75, 8, 0, 7); c.fill(); c.stroke();
      yazi(c, String(hak), cx + Rn * 0.75, cy + Rn * 0.75 + 1, 10, '#4a2f12', 'center', false);
    }
    sihirRozet(c, d, cx, cy, Rn, kucuk);
    hudAlan.gokce = { x: cx - Rn - 4, y: cy - Rn - 4, w: 2 * Rn + 8, h: 2 * Rn + 8 };
  }
  function sihirRozet(c, d, gx, gy, R, kucuk) {
    var sh = d.sihirler || {}, r = dokunmatik ? 11 : 14, w = d.ekran.w;
    var L = [{ k: 'atilay', ik: 'sihir_atilay', ad: 'Atılay', renk: '#3d8bff' }, { k: 'giray', ik: 'sihir_giray', ad: 'Giray', renk: '#3fae4a' }];
    for (var i = 0; i < 2; i++) {
      var kul = sh[L[i].k] !== false, x, y;
      if (dokunmatik) { x = gx; y = gy - R - 4 - r - i * (2 * r + 4); }
      else { x = gx + (i ? 1 : -1) * (r + 3); y = gy - R - r - 4; }
      c.save(); c.globalAlpha = dokunmatik ? 0.85 : 0.95;
      c.fillStyle = kul ? L[i].renk : '#8a8f9c'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
      c.lineWidth = 2; c.strokeStyle = kul ? '#fff' : '#cfd3dc'; c.stroke();
      c.globalAlpha *= kul ? 1 : 0.45;
      var oz = false;
      if (G.cizim && G.cizim.ikon) { try { G.cizim.ikon(c, L[i].ik, x, y, r * 1.5); oz = true; } catch (h) { } }
      if (!oz) yazi(c, kul ? '✨' : '', x, y + 1, r, '#fff', 'center', false);
      c.restore();
      if (!dokunmatik) yazi(c, L[i].ad, x, y - r - 6, 9, kul ? '#fff' : '#aab', 'center');
    }
    // görünmezlik: kenar parıltısı + süre çubuğu (alt ortada, envanterin üstünde)
    var g = d.oyuncu && d.oyuncu.gorunmez;
    if (g > 0) {
      var h = d.ekran.h, pa = 0.25 + 0.1 * Math.sin(t * 5);
      var gr = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.38, w / 2, h / 2, Math.hypot(w, h) * 0.55);
      gr.addColorStop(0, 'rgba(120,140,255,0)'); gr.addColorStop(1, 'rgba(150,120,255,' + pa.toFixed(3) + ')');
      c.fillStyle = gr; c.fillRect(0, 0, w, h);
      var bw = Math.min(140, w * 0.25), bx = w / 2 - bw / 2, by = h - (dokunmatik ? 34 : 44) - 34;
      c.fillStyle = 'rgba(40,40,110,0.7)'; rr(c, bx - 4, by - 8, bw + 8, 16, 8); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.18)'; rr(c, bx, by - 3, bw, 6, 3); c.fill();
      c.fillStyle = '#9fb4ff'; rr(c, bx, by - 3, Math.max(5, bw * g / 7), 6, 3); c.fill();
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
    if (K.asama !== 'dustu') return;
    var sn = Math.max(0, Math.ceil(K.kalan)), nb = 0.5 + 0.5 * Math.sin(t * (K.kalan < 8 ? 12 : 6));
    var kt = K.kardes + ' düştü!', kf = kucuk ? 12 : 14, pw = olc(c, kt, kf) + 76, ph = kucuk ? 26 : 30, px = w / 2 - pw / 2, py = 8;
    c.save(); c.globalAlpha = 0.92;
    c.fillStyle = 'rgba(' + Math.round(190 + 50 * nb) + ',' + Math.round(55 + 30 * nb) + ',30,0.9)'; rr(c, px, py, pw, ph, ph / 2); c.fill();
    c.lineWidth = 1.5; c.strokeStyle = '#fff3c4'; c.stroke();
    kazaIkon(c, K.tur, px + 17, py + ph / 2, 20);
    yazi(c, kt, px + 32, py + ph / 2 + 1, kf, '#fff', 'left', false);
    yazi(c, String(sn), px + pw - 18, py + ph / 2 + 1, kf + 3, sn <= 8 ? '#ffff7a' : '#fff', 'center', false);
    c.restore();
    // ok (3D'de gerçek ekran izdüşümü kullanılır)
    var ek = G.ekranNoktasi ? G.ekranNoktasi(K.x, K.y, 0.6) : null;
    var kx, ky;
    if (ek) { kx = ek.x; ky = ek.y; } else { kx = (K.x - k.x) * k.olcek; ky = (K.y - k.y) * k.olcek; }
    var ol = G.ucBoyut ? 1 : k.olcek, m = Math.round(Math.hypot(K.x - o.x, K.y - o.y) / 48);
    var kenar = 70, ekranda = kx > 20 && kx < w - 20 && ky > 20 && ky < h - 20;
    if (ekranda) {
      var zp = Math.abs(Math.sin(t * 6)) * 14;
      okCiz(c, kx, ky - 52 * ol - zp, Math.PI / 2, kucuk ? 15 : 20, '#ff5a1f');
    } else {
      var cx = w / 2, cy = h / 2, dx = kx - cx, dy = ky - cy, ang = Math.atan2(dy, dx);
      var sx = Math.abs(dx) > 1e-6 ? (w / 2 - kenar) / Math.abs(dx) : 1e9, sy = Math.abs(dy) > 1e-6 ? (h / 2 - kenar) / Math.abs(dy) : 1e9;
      var sc = Math.min(sx, sy), ex = cx + dx * sc, ey = cy + dy * sc, nab = 1 + 0.12 * Math.sin(t * 8);
      c.save(); c.translate(ex, ey); c.scale(nab, nab); c.translate(-ex, -ey);
      okCiz(c, ex + Math.cos(ang) * 30, ey + Math.sin(ang) * 30, ang, 24, '#ff5a1f');
      c.fillStyle = 'rgba(255,248,225,0.97)'; c.strokeStyle = '#ff5a1f'; c.lineWidth = 4;
      c.beginPath(); c.arc(ex, ey, kucuk ? 20 : 26, 0, 7); c.fill(); c.stroke();
      kardesYuz(c, K.kardes, ex, ey, kucuk ? 16 : 21);
      c.restore();
      var my = ey + (ey > h / 2 ? -42 : 42);
      yazi(c, m + ' m', ex, my, 15, '#fff', 'center');
    }
  }

  // kompakt durum hapı: yuvarlak portre + ince bar; genişlik döner
  function durumHapi(c, x, y, kim, oran, renk, kenar, yuz, ad, nab) {
    var R = dokunmatik ? 15 : 17, bh = 2 * R + 4, bw = dokunmatik ? 46 : 58, W = 2 * R + 12 + bw;
    c.save(); c.globalAlpha = 0.88;
    c.fillStyle = 'rgba(24,32,66,0.78)'; rr(c, x, y, W, bh, bh / 2); c.fill();
    c.lineWidth = 2; c.strokeStyle = kenar; c.stroke();
    c.restore();
    c.save(); c.beginPath(); c.arc(x + R + 2, y + R + 2, R, 0, 7); c.fillStyle = 'rgba(255,255,255,0.18)'; c.fill(); c.clip();
    if (yuz) { c.globalAlpha = nab == null ? 1 : nab; kardesYuz(c, kim, x + R + 2, y + R + 2, R - 1); }
    else portre(c, kim, x + R + 2, y + R + 3, 2 * R);
    c.restore();
    var bx = x + 2 * R + 8, by = y + bh / 2 - 3;
    if (ad && !dokunmatik) { yazi(c, ad, bx, y + bh / 2 - 9, 9, 'rgba(255,255,255,0.85)', 'left', false); by = y + bh / 2 + 1; }
    c.fillStyle = 'rgba(255,255,255,0.2)'; rr(c, bx, by, bw, 6, 3); c.fill();
    if (oran > 0.02) { c.fillStyle = renk; rr(c, bx, by, Math.max(5, bw * Math.min(1, oran)), 6, 3); c.fill(); }
    return W;
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
    var w = d.ekran.w, h = d.ekran.h, tt = logo.t, s = dokunmatik ? Math.max(0.32, Math.min(0.5, Math.min(w, h) / 900)) : Math.max(0.45, Math.min(0.9, Math.min(w, h) / 900));
    var p = tt < 0.4 ? (function (x) { var k = 1.70158; x -= 1; return 1 + (k + 1) * x * x * x + k * x * x; })(tt / 0.4) : 1;
    var a = tt > 0.95 ? Math.max(0, 1 - (tt - 0.95) / 0.25) : 1;
    var puls = 1 + 0.04 * Math.sin(tt * 9);
    c.save(); c.globalAlpha = a; c.translate(w / 2, h * 0.4); c.scale(s * p * puls, s * p * puls);
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
    var w = d.ekran.w, tel = dokunmatik || w < 700, mw = tel ? 90 : 108, mh = Math.round(mw * h.H / h.W);
    mh = Math.min(mh, tel ? 64 : 84);
    var x = w - mw - 10, y = tel ? 46 : 54, kov = (d.komsu && d.komsu.durum === 'kovalama') || (d.uyanan && d.uyanan.durum === 'kovalama');
    c.save(); c.globalAlpha = 0.62;
    c.fillStyle = 'rgba(22,34,52,0.75)'; rr(c, x - 3, y - 3, mw + 6, mh + 6, 9); c.fill(); c.lineWidth = 1.5; c.strokeStyle = kov ? '#ff7a5c' : 'rgba(190,210,235,0.55)'; c.stroke();
    rr(c, x, y, mw, mh, 7); c.clip();
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
  }

  // ---------- rozet (çıkartma) çizimi: emoji yok, hepsi canvas ----------
  var ROZET_BG = { dino: '#c4efd0', top: '#d3e6ff', roket: '#ddd6ff', tavuk: '#ffeab9', kurabiye: '#ffe2c6', yumak: '#ffd6e6', kedi: '#ffe8cc', agac: '#d3f0ca', ordek: '#fff4b5', kalem: '#ffe2e2', basket: '#ffddbb', yildiz: '#fff1ad' };
  function rozetPal(renkli) {
    if (renkli) return { w: '#ffffff', y: '#ffcf3d', o: '#ff9a2e', r: '#e8483a', g: '#4cb35a', b: '#4a90e2', br: '#8a5a2b', p: '#ff7aa8', n: '#2a2230', sk: '#f2c9a0', l: '#dfe3e8', ck: '#d9a066' };
    return { w: '#8a91ab', y: '#7a82a0', o: '#6f7692', r: '#646b88', g: '#646b88', b: '#646b88', br: '#5a6180', p: '#6f7692', n: '#454c66', sk: '#7a82a0', l: '#8a91ab', ck: '#6f7692' };
  }
  function ro(c, x, y, rx, ry, f) { c.fillStyle = f; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 7); c.fill(); }
  function rc(c, x, y, r, f) { c.fillStyle = f; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
  function rp(c, pts, f) { c.fillStyle = f; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); c.fill(); }
  function rl(c, x1, y1, x2, y2, col, lw) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
  function yildizYol(c, R, ic) { c.beginPath(); for (var k = 0; k < 10; k++) { var a = -Math.PI / 2 + k * Math.PI / 5, rr_ = k % 2 ? R * ic : R; c[k ? 'lineTo' : 'moveTo'](Math.cos(a) * rr_, Math.sin(a) * rr_); } c.closePath(); }
  function rozetCiz(c, ad, x, y, R, renkli) {
    var P = rozetPal(renkli), i;
    c.save(); c.translate(x, y); c.scale(R / 10, R / 10); c.lineJoin = 'round'; c.lineCap = 'round';
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.arc(0.5, 1, 10, 0, 7); c.fill();
    rc(c, 0, 0, 10, renkli ? (ROZET_BG[ad] || '#fff') : '#2e3550');
    c.lineWidth = 1.4; c.strokeStyle = renkli ? '#ffffff' : '#59627f'; c.beginPath(); c.arc(0, 0, 9.3, 0, 7); c.stroke();
    if (ad === 'dino') {
      rp(c, [[-5, 1.5], [-9, 4.6], [-4.5, 4.9]], P.g); ro(c, -0.5, 2.2, 5.6, 3.6, P.g); rp(c, [[1.5, 0.5], [3.4, -2.2], [5.2, 2], [2, 3.2]], P.g);
      c.fillStyle = P.g; c.fillRect(-2.9, 4.6, 1.9, 2.8); c.fillRect(1.4, 4.6, 1.9, 2.8); ro(c, 4.6, -2.3, 3.3, 2.5, P.g);
      rp(c, [[-3.6, -0.5], [-2.4, -3.1], [-1.1, -0.9]], P.y); rp(c, [[-1, -0.8], [0.2, -3.5], [1.4, -0.4]], P.y);
      rc(c, 5.5, -2.9, 0.6, P.n); rl(c, 4.4, -1.3, 7, -1.3, P.n, 0.4);
    } else if (ad === 'top') {
      rc(c, 0, 0, 6.8, P.w); c.strokeStyle = P.n; c.lineWidth = 0.6; c.beginPath(); c.arc(0, 0, 6.8, 0, 7); c.stroke();
      var pt = []; for (i = 0; i < 5; i++) pt.push([Math.cos(-Math.PI / 2 + i * 1.2566) * 2.5, Math.sin(-Math.PI / 2 + i * 1.2566) * 2.5]); rp(c, pt, P.n);
      for (i = 0; i < 5; i++) { var a = -Math.PI / 2 + i * 1.2566; rl(c, Math.cos(a) * 2.5, Math.sin(a) * 2.5, Math.cos(a) * 6.5, Math.sin(a) * 6.5, P.n, 0.6); }
    } else if (ad === 'roket') {
      c.save(); c.rotate(0.7);
      rp(c, [[-3, 0.5], [-6.2, 5.6], [-3, 4]], P.r); rp(c, [[3, 0.5], [6.2, 5.6], [3, 4]], P.r);
      rp(c, [[-1.8, 4], [0, 9], [1.8, 4]], P.o); rp(c, [[-0.9, 4], [0, 6.6], [0.9, 4]], P.y);
      c.fillStyle = P.w; c.beginPath(); c.moveTo(0, -8.4); c.quadraticCurveTo(4.6, -3, 3.1, 4.2); c.lineTo(-3.1, 4.2); c.quadraticCurveTo(-4.6, -3, 0, -8.4); c.fill();
      rp(c, [[0, -8.4], [2.3, -5.6], [-2.3, -5.6]], P.r); rc(c, 0, -1.2, 1.7, P.b); c.strokeStyle = P.l; c.lineWidth = 0.6; c.beginPath(); c.arc(0, -1.2, 1.7, 0, 7); c.stroke();
      c.restore();
    } else if (ad === 'tavuk') {
      rl(c, -1.4, 5.8, -1.4, 8.4, P.o, 0.9); rl(c, 1.2, 5.8, 1.2, 8.4, P.o, 0.9);
      rp(c, [[-5, 0], [-8, -3.2], [-4.4, 2.4]], P.w); ro(c, -0.4, 2.2, 5.6, 4.2, P.w); ro(c, -1.4, 2.6, 3, 2, P.l);
      rc(c, 3.8, -3.2, 2.8, P.w); rc(c, 2.9, -6, 1.1, P.r); rc(c, 4.3, -6.3, 1.2, P.r); rc(c, 5.5, -5.5, 1, P.r);
      rp(c, [[6.2, -3.5], [8.8, -2.7], [6.2, -2]], P.o); rc(c, 5.9, -1.3, 0.8, P.r); rc(c, 4.6, -3.7, 0.55, P.n);
    } else if (ad === 'kurabiye') {
      rc(c, 0, 0, 6.9, P.ck); c.strokeStyle = P.br; c.lineWidth = 0.5; c.beginPath(); c.arc(0, 0, 6.9, 0, 7); c.stroke();
      [[-2.6, -2.4], [2.4, -3.2], [0.4, 0.6], [-3.2, 2.6], [3.1, 2.2], [0, 4.4]].forEach(function (q) { rc(c, q[0], q[1], 1, P.br); });
      rc(c, 5.3, -4.5, 1.9, renkli ? ROZET_BG.kurabiye : '#2e3550');
    } else if (ad === 'yumak') {
      c.strokeStyle = P.p; c.lineWidth = 1.3; c.beginPath(); c.moveTo(4.4, 4.2); c.bezierCurveTo(8, 5, 6, 8.4, 9, 8); c.stroke();
      rc(c, 0, 0, 6.3, P.p); c.strokeStyle = P.w; c.lineWidth = 0.8;
      c.beginPath(); c.arc(0, 0, 4.4, 0.2, 2.5); c.stroke(); c.beginPath(); c.arc(-1, 1, 3.2, 3.5, 5.7); c.stroke();
      c.beginPath(); c.ellipse(0, 0, 6, 2.6, 0.6, 0.4, 4.6); c.stroke(); c.beginPath(); c.ellipse(0, 0, 6, 2.6, -0.7, 3.6, 6.8); c.stroke();
    } else if (ad === 'kedi') {
      rp(c, [[-5.8, -0.5], [-4.8, -6.8], [-1, -3.6]], P.o); rp(c, [[5.8, -0.5], [4.8, -6.8], [1, -3.6]], P.o);
      rp(c, [[-4.8, -1.5], [-4.4, -4.8], [-2.4, -3.2]], P.p); rp(c, [[4.8, -1.5], [4.4, -4.8], [2.4, -3.2]], P.p);
      ro(c, 0, 1.2, 6.4, 5.6, P.o); rl(c, 0, -3.6, 0, -1.8, P.br, 0.6); rl(c, -1.8, -3.4, -1.4, -1.9, P.br, 0.6); rl(c, 1.8, -3.4, 1.4, -1.9, P.br, 0.6);
      ro(c, -2.5, 0.4, 0.8, 1.1, P.n); ro(c, 2.5, 0.4, 0.8, 1.1, P.n); rc(c, 0, 2.5, 0.8, P.p);
      rl(c, -3.6, 3, -8, 2.2, P.n, 0.35); rl(c, -3.6, 3.8, -8, 4.4, P.n, 0.35); rl(c, 3.6, 3, 8, 2.2, P.n, 0.35); rl(c, 3.6, 3.8, 8, 4.4, P.n, 0.35);
    } else if (ad === 'agac') {
      c.fillStyle = P.br; c.fillRect(-1.4, 2, 2.8, 6); rc(c, -3.4, 0, 3.5, P.g); rc(c, 3.4, 0, 3.5, P.g); rc(c, 0, -3.2, 4.3, P.g); rc(c, 0, 0.6, 3.9, P.g);
      rc(c, -1.6, -2, 0.75, P.r); rc(c, 2.2, 0, 0.75, P.r); rc(c, -3, 1.8, 0.75, P.r);
    } else if (ad === 'ordek') {
      rp(c, [[-6, 1.8], [-8.8, -0.6], [-5.6, 4.2]], P.y); ro(c, -0.8, 2.8, 5.9, 3.8, P.y); ro(c, -1.6, 3, 3, 2, P.o);
      rc(c, 3.6, -2.8, 3, P.y); rp(c, [[6, -2.8], [9.2, -1.8], [6, -0.8]], P.o); rc(c, 4.4, -3.5, 0.6, P.n);
    } else if (ad === 'kalem') {
      c.save(); c.rotate(0.78);
      c.fillStyle = P.y; c.fillRect(-1.8, -6, 3.6, 10); rl(c, -0.6, -6, -0.6, 4, P.o, 0.5); rl(c, 0.6, -6, 0.6, 4, P.o, 0.5);
      rp(c, [[-1.8, 4], [1.8, 4], [0, 7.4]], P.sk); rp(c, [[-0.7, 6], [0.7, 6], [0, 7.4]], P.n);
      c.fillStyle = P.l; c.fillRect(-1.8, -7, 3.6, 1.2); c.fillStyle = P.p; c.fillRect(-1.8, -8.8, 3.6, 1.9);
      c.restore();
    } else if (ad === 'basket') {
      rc(c, 0, 0, 6.9, P.o); c.strokeStyle = P.n; c.lineWidth = 0.6;
      c.beginPath(); c.arc(0, 0, 6.9, 0, 7); c.stroke(); rl(c, -6.9, 0, 6.9, 0, P.n, 0.6); rl(c, 0, -6.9, 0, 6.9, P.n, 0.6);
      c.beginPath(); c.arc(-8.6, 0, 6.3, -0.95, 0.95); c.stroke(); c.beginPath(); c.arc(8.6, 0, 6.3, Math.PI - 0.95, Math.PI + 0.95); c.stroke();
    } else if (ad === 'yildiz') {
      yildizYol(c, 7.8, 0.45); c.fillStyle = P.y; c.fill(); c.lineWidth = 0.8; c.strokeStyle = P.o; c.stroke();
      if (renkli) { rc(c, -1.4, -1.6, 1, 'rgba(255,255,255,0.7)'); }
    }
    c.restore();
  }
  function kartYildizSekil(c, x, y, R, dolu, pop, ang) {
    c.save(); c.translate(x, y); c.rotate(ang || 0);
    if (dolu) {
      c.scale(pop, pop);
      c.fillStyle = 'rgba(0,0,0,0.22)'; yildizYol(c, R, 0.46); c.save(); c.translate(3, 5); c.fill(); c.restore();
      yildizYol(c, R, 0.46); c.fillStyle = '#ffd93b'; c.fill(); c.lineWidth = Math.max(3, R * 0.12); c.strokeStyle = '#b8620a'; c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.arc(-R * 0.22, -R * 0.2, R * 0.13, 0, 7); c.fill();
    } else {
      yildizYol(c, R, 0.46); c.fillStyle = 'rgba(90,100,130,0.22)'; c.fill(); c.lineWidth = Math.max(3, R * 0.1); c.strokeStyle = 'rgba(120,130,160,0.7)'; c.stroke();
    }
    c.restore();
  }
  function geriYay(x) { var k = 2.2; x -= 1; return 1 + (k + 1) * x * x * x + k * x * x; }
  var YILDIZ_GEC = 0.55, YILDIZ_ARA = 0.5, yildizSes = [false, false, false];
  // Bölüm bitti / final kartında 1-3 yıldız sırayla "pop" ile gelir
  function kartYildiz(c, d, cx, cy, R) {
    var n = d.yildiz || 1;
    for (var i = 0; i < 3; i++) {
      var tt = modZaman - (YILDIZ_GEC + i * YILDIZ_ARA), dolu = i < n, X = cx + (i - 1) * R * 2.5, Y = cy + (i === 1 ? -R * 0.22 : 0), ang = (i - 1) * 0.12;
      if (!dolu) { kartYildizSekil(c, X, Y, R, false, 1, ang); continue; }
      if (tt < 0) { kartYildizSekil(c, X, Y, R, false, 1, ang); continue; }
      var p = Math.min(1, tt / 0.38), pop = p < 1 ? Math.max(0.01, geriYay(p)) : 1 + Math.sin(t * 3 + i) * 0.015;
      if (tt < 0.5) {   // pop sırasında parıltı halkası
        c.save(); c.globalAlpha = 0.55 * (1 - tt / 0.5); c.strokeStyle = '#fff6b0'; c.lineWidth = 5; c.beginPath(); c.arc(X, Y, R * (0.8 + tt * 2.2), 0, 7); c.stroke(); c.restore();
      }
      kartYildizSekil(c, X, Y, R, true, pop, ang * (2 - Math.min(1, p)));
    }
  }
  function cikartmaSatir(c, bolum, cx, cy, R, aralik) {   // bölümün 3 rozeti: alınan renkli, alınmayan gri siluet
    var tn = (G.bolumler[bolum] && G.bolumler[bolum].cikartma) || [];
    for (var i = 0; i < tn.length; i++) rozetCiz(c, tn[i].r, cx + (i - (tn.length - 1) / 2) * aralik, cy, R, !!(G.kayit && G.kayit.cikartmaVar(bolum, i)));
  }
  function yildizToplamPill(c, x, y) {   // menü: küçük "★ 7/12" (emoji yok)
    if (!G.kayit || !G.kayit.ilkOyunBitti()) return;
    var s = G.kayit.yildizToplam() + '/' + G.kayit.yildizEnYuksek(), w = olc(c, s, 16) + 44;
    panel(c, x, y, w, 30, 15, 'rgba(30,40,80,0.9)', '#ffd93b', 2);
    c.save(); c.translate(x + 18, y + 15); yildizYol(c, 10, 0.46); c.fillStyle = '#ffd93b'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#b8620a'; c.stroke(); c.restore();
    yazi(c, s, x + 34, y + 16, 16, '#fff', 'left', false);
  }
  // Çıkartma alınca: alınan yerde küçük rozet yükselip solar
  var cikPop = [];
  function cikPopCiz(c, d) {
    for (var i = cikPop.length - 1; i >= 0; i--) {
      var q = cikPop[i];
      if (q.t > 1.5) { cikPop.splice(i, 1); continue; }
      var sp = G.ekranNoktasi ? G.ekranNoktasi(q.x, q.y, 1.0) : { x: (q.x - d.kamera.x) * d.kamera.olcek, y: (q.y - d.kamera.y) * d.kamera.olcek };
      if (!sp) continue;
      var p = Math.min(1, q.t / 0.3), k = p < 1 ? geriYay(p) : 1, R = dokunmatik ? 18 : 22;
      c.save(); c.globalAlpha = Math.max(0, Math.min(1, (1.5 - q.t) / 0.4));
      var yy = sp.y - 20 - q.t * 38;
      c.strokeStyle = 'rgba(255,240,150,' + (0.7 * (1 - q.t / 1.5)).toFixed(2) + ')'; c.lineWidth = 3; c.beginPath(); c.arc(sp.x, yy, R * (1 + q.t * 1.2), 0, 7); c.stroke();
      rozetCiz(c, q.tur, sp.x, yy, R * k, true);
      c.restore();
    }
  }

  // ---------- ilk açılış rehberi (oyunu durdurmaz; tek adım, küçük balon + parlayan ok) ----------
  var REHBER_SIRA = ['gokce', 'kos', 'saklan', 'ara', 'yuru'];   // öncelik sırası
  var REHBER = {
    yuru: { tel: 'Joystick ile yürü', pc: 'WASD ya da oklarla yürü', hedef: 'joy', acil: false, enAz: 2 },
    ara: { tel: 'Çekmecede ara: el düğmesine BASILI TUT', pc: 'Çekmecede ara: E tuşunu BASILI TUT', hedef: 'e', acil: false, enAz: 3.5, enCok: 14 },
    kos: { tel: 'Kovalanırsan KOŞ düğmesine bas!', pc: 'Kovalanırsan SHIFT ile KOŞ!', hedef: 'kos', acil: true, enAz: 3, enCok: 8 },
    saklan: { tel: 'Saklanmak için dolaba gir: El düğmesi', pc: 'Saklanmak için dolaba gir: E tuşu', hedef: 'e', acil: false, enAz: 3, enCok: 9 },
    gokce: { tel: "Gökçe'yi çağır: seni kurtarır!", pc: "G tuşu: Gökçe seni kurtarır!", hedef: 'gokce', acil: true, enAz: 3, enCok: 9 }
  };
  var reh = { yapildi: {}, aktif: null, t: 0, yol: 0, sx: null, sy: null, bekle: 0, ara: false, gokce: false, yuklendi: false, sifirlandi: 0 };
  function rehberYukle() {
    reh.yuklendi = true; reh.yapildi = {};
    var s = (G.kayit && G.kayit.rehber()) || '';
    s.split(',').forEach(function (a) { if (a) reh.yapildi[a] = true; });
  }
  function rehberKaydet() { if (G.kayit) G.kayit.rehberYaz(Object.keys(reh.yapildi).join(',')); }
  function rehberBitir(hepsi) { if (hepsi) REHBER_SIRA.forEach(function (a) { reh.yapildi[a] = true; }); rehberKaydet(); }
  function rehberDurumKos(d) {
    var k = d.komsu, u = d.uyanan;
    return { suphe: !!((k && (k.durum === 'suphe' || k.durum === 'kovalama')) || (u && (u.durum === 'suphe' || u.durum === 'kovalama'))),
      kovalama: !!((k && k.durum === 'kovalama') || (u && u.durum === 'kovalama')) };
  }
  function rehberKosul(ad, d, o) {
    var dk = rehberDurumKos(d), y = o && o.yakindaki;
    if (ad === 'kos') return dk.suphe;
    if (ad === 'gokce') return dk.kovalama && (d.gokceHakki || 0) > 0;
    if (ad === 'saklan') return !!(y && y.tur === 'saklan') && !dk.suphe;
    if (ad === 'ara') return !!(y && y.tur === 'ara') && !dk.suphe;
    if (ad === 'yuru') return !dk.suphe;
    return false;
  }
  function rehberGuncelle(dt, d) {
    if (!reh.yuklendi) rehberYukle();
    var o = d.oyuncu, i, ad;
    if (!o || d.mod !== 'oyun' || (G.ayarlar && G.ayarlar.acik)) return;
    // yürüme yolu (yalnız "yuru" adımı için)
    if (reh.sx !== null) { var dx = o.x - reh.sx, dy = o.y - reh.sy, m = Math.hypot(dx, dy); if (m < 40) reh.yol += m; }
    reh.sx = o.x; reh.sy = o.y;
    reh.bekle = Math.max(0, reh.bekle - dt);
    var a = reh.aktif;
    if (a) {
      reh.t += dt;
      var S = REHBER[a], bitti = false, yk = o.yakindaki;
      if (reh.t >= S.enAz) {
        if (a === 'yuru') bitti = reh.yol >= G.TILE * 2;
        else if (a === 'ara') bitti = reh.ara || !!(o.aramaIl > 0.3) || !rehberKosul('ara', d, o) && reh.t > 5;
        else if (a === 'kos') bitti = !!o.kosuyor || !rehberDurumKos(d).suphe;
        else if (a === 'saklan') bitti = !!o.saklandi || !(yk && yk.tur === 'saklan');
        else if (a === 'gokce') bitti = reh.gokce || !rehberDurumKos(d).kovalama;
      }
      if (S.enCok && reh.t >= S.enCok) bitti = true;
      // daha acil bir adım varsa araya girer (bitirilmemiş sayılır)
      var araya = null;
      if (!bitti && !S.acil) for (i = 0; i < REHBER_SIRA.length; i++) { ad = REHBER_SIRA[i]; if (REHBER[ad].acil && !reh.yapildi[ad] && rehberKosul(ad, d, o)) { araya = ad; break; } }
      if (araya) { reh.aktif = araya; reh.t = 0; reh.ara = false; reh.gokce = false; return; }
      if (bitti) { reh.yapildi[a] = true; rehberKaydet(); reh.aktif = null; reh.bekle = 1.6; }
      return;
    }
    if (reh.bekle > 0) return;
    for (i = 0; i < REHBER_SIRA.length; i++) {
      ad = REHBER_SIRA[i];
      if (reh.yapildi[ad] || !rehberKosul(ad, d, o)) continue;
      reh.aktif = ad; reh.t = 0; reh.ara = false; reh.gokce = false; if (ad === 'yuru') reh.yol = 0;
      return;
    }
  }
  function rehberHedef(S, d, w, h) {   // parlayan halka + ok yönü: {x, y, r, ang}
    var o = d.oyuncu, u = Math.max(0.7, Math.min(1.15, Math.min(w, h) / 420));
    if (dokunmatik) {
      if (S.hedef === 'joy') return { x: joy.id !== null ? joy.bx : 105 * u, y: joy.id !== null ? joy.by : h - 105 * u, r: joy.R * u * 0.9, ang: 0 };
      var bl = btnler(d), ad = S.hedef === 'e' ? 'etkilesim' : 'kos';
      if (S.hedef === 'gokce') { var g = hudAlan.gokce; if (g) return { x: g.x + g.w / 2, y: g.y + g.h / 2, r: g.w / 2 + 6, ang: Math.PI }; }
      for (var i = 0; i < bl.length; i++) if (bl[i].ad === ad) return { x: bl[i].x, y: bl[i].y, r: bl[i].r * 0.8 + 6, ang: Math.PI };
      return null;
    }
    var sp = G.ekranNoktasi ? G.ekranNoktasi(o.x, o.y, 1.0) : { x: (o.x - d.kamera.x) * d.kamera.olcek, y: (o.y - d.kamera.y) * d.kamera.olcek };
    if (S.hedef === 'gokce') { var gg = hudAlan.gokce; if (gg) return { x: gg.x + gg.w / 2, y: gg.y + gg.h / 2, r: gg.w / 2 + 6, ang: Math.PI }; }
    return sp ? { x: sp.x, y: sp.y - 20, r: 30, ang: Math.PI / 2 } : null;
  }
  function rehberCiz(c, d, w, h) {
    var a = reh.aktif; if (!a) return;
    var S = REHBER[a], metin = dokunmatik ? S.tel : S.pc, T_ = reh.t;
    var hd = rehberHedef(S, d, w, h); if (!hd) return;
    var fs = dokunmatik ? 14 : 16, gir = Math.min(1, T_ / 0.25), nab = 0.5 + 0.5 * Math.sin(t * 6);
    // parlayan halka
    c.save(); c.globalAlpha = gir;
    c.lineWidth = 4; c.strokeStyle = 'rgba(255,225,70,' + (0.55 + 0.4 * nab).toFixed(2) + ')'; c.beginPath(); c.arc(hd.x, hd.y, hd.r + 3 + nab * 5, 0, 7); c.stroke();
    c.fillStyle = 'rgba(255,225,70,' + (0.12 + 0.1 * nab).toFixed(2) + ')'; c.beginPath(); c.arc(hd.x, hd.y, hd.r + 3, 0, 7); c.fill();
    // balon
    var sr = sar(c, metin, fs, Math.min(300, w * 0.42), 2), bw = 0, k;
    for (k = 0; k < sr.lines.length; k++) bw = Math.max(bw, olc(c, sr.lines[k], sr.size));
    bw += 26; var bh = sr.lines.length * (sr.size + 3) + 14;
    // balon konumu: halkanın ok yönünde, ekran içinde ve düğme kümesiyle çakışmayacak biçimde
    var zip = Math.sin(t * 5) * 4, ax = Math.cos(hd.ang), ay = Math.sin(hd.ang), uzak = hd.r + 34 + zip;
    var bx, by;
    if (hd.hedefPc || !dokunmatik) { bx = hd.x - bw / 2; by = hd.y + hd.r + 30 + zip; }   // masaüstü: oyuncunun altında
    else if (S.hedef === 'joy') { bx = hd.x + hd.r + 30 + zip; by = hd.y - bh / 2 - 6; }
    else if (S.hedef === 'e') { bx = Math.min(w * 0.5 - bw / 2 - 40, w - 255 - bw); by = h - bh - 78 - zip; }   // alt orta: oyuncuyu ve düğmeleri örtmez
    else { bx = Math.max(8, Math.min(w - bw - 8, hd.x - hd.r - 24 - bw - zip - (S.hedef === 'gokce' ? 0 : 60))); by = hd.y - hd.r - 8 - bh - 56 - (S.hedef === 'kos' ? 0 : 50); }
    by = Math.max(46, Math.min(h - bh - 60, by)); bx = Math.max(8, Math.min(w - bw - 8, bx));
    var bcx = bx + bw / 2, bcy = by + bh / 2;
    // ok: halkadan balona doğru, ucu hedefi gösterir
    var dx = bcx - hd.x, dy = bcy - hd.y, dl = Math.hypot(dx, dy) || 1, ux = dx / dl, uy = dy / dl;
    if (dokunmatik && (S.hedef === 'e' || S.hedef === 'kos' || S.hedef === 'gokce')) { ux = -0.707; uy = -0.707; dl = 200; }   // ok sol-üstten gelir (düğme kümesinin boşluğu)
    var tipx = hd.x + ux * (hd.r + 6 + nab * 3), tipy = hd.y + uy * (hd.r + 6 + nab * 3);
    var kuy = Math.min(dl - Math.max(bw, bh) * 0.0 - hd.r - 14, 46);
    var kl = dl === 200 ? 14 : Math.max(18, Math.min(kuy, 40)), tx0 = tipx + ux * kl, ty0 = tipy + uy * kl;
    c.strokeStyle = '#ffe14d'; c.fillStyle = '#ffe14d'; c.lineWidth = 6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(tx0, ty0); c.lineTo(tipx + ux * 10, tipy + uy * 10); c.stroke();
    var px = -uy, py = ux;
    c.beginPath(); c.moveTo(tipx, tipy); c.lineTo(tipx + ux * 16 + px * 9, tipy + uy * 16 + py * 9); c.lineTo(tipx + ux * 16 - px * 9, tipy + uy * 16 - py * 9); c.closePath(); c.fill();
    c.lineWidth = 1.5; c.strokeStyle = '#a8650a'; c.stroke();
    // balon gövdesi
    c.globalAlpha = gir * 0.96; c.fillStyle = '#fffbe8'; rr(c, bx, by, bw, bh, Math.min(16, bh / 2)); c.fill();
    c.lineWidth = 3; c.strokeStyle = '#ffb02e'; c.stroke();
    c.globalAlpha = gir;
    for (k = 0; k < sr.lines.length; k++) yazi(c, sr.lines[k], bcx, bcy + (k - (sr.lines.length - 1) / 2) * (sr.size + 3) + 1, sr.size, '#3b2410', 'center', false);
    c.restore();
  }
  function rehberTekrar() { reh.yapildi = {}; reh.aktif = null; reh.yol = 0; reh.sx = null; reh.bekle = 1; reh.yuklendi = true; rehberKaydet(); }

  function oyunHud(c, d) {
    var w = d.ekran.w, h = d.ekran.h, o = d.oyuncu, ko = d.komsu, k = d.kamera;
    var tel = dokunmatik || w < 700, kucuk = tel;
    hudAlan = {};
    var uyn = d.uyanan || null;
    ustOfs = 0;
    var uy = ko ? ko.uyari || 0 : 0, kov = (ko && ko.durum === 'kovalama') || (uyn && uyn.durum === 'kovalama');
    var vA = kov ? 0.22 + 0.12 * Math.sin(t * 7) : Math.max(0, (uy - 0.4) * 0.3);
    if (vA > 0.01) {
      var gr = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.4, w / 2, h / 2, Math.hypot(w, h) * 0.55);
      gr.addColorStop(0, 'rgba(255,0,0,0)'); gr.addColorStop(1, 'rgba(255,20,20,' + vA.toFixed(3) + ')');
      c.fillStyle = gr; c.fillRect(0, 0, w, h);
    }
    // ---- sağ üst: şüphe barı + tam ekran + duraklat (+ masaüstünde ses); altında mini harita
    var pb = tel ? 30 : 34, gap = 4, px = w - pb - 8, tamVar = !!(G.tamEkran && G.tamEkran.destek());
    var bx0 = px;
    function kare(x, ad) {
      c.save(); c.globalAlpha = 0.72; c.fillStyle = 'rgba(30,40,80,0.8)'; rr(c, x, 8, pb, pb, 9); c.fill(); c.lineWidth = 1.5; c.strokeStyle = 'rgba(125,162,255,0.8)'; c.stroke(); c.restore();
      hudAlan[ad] = { x: x, y: 8, w: pb, h: pb };
    }
    kare(px, 'duraklat');
    c.fillStyle = '#fff'; rr(c, px + pb * 0.32, 8 + pb * 0.26, pb * 0.14, pb * 0.48, 2); c.fill(); rr(c, px + pb * 0.54, 8 + pb * 0.26, pb * 0.14, pb * 0.48, 2); c.fill();
    if (tamVar) {
      bx0 -= pb + gap; kare(bx0, 'tam');
      tamIkon(c, bx0 + pb / 2, 8 + pb / 2, pb * 0.5, G.tamEkran.acikMi());
    }
    if (!tel) {
      bx0 -= pb + gap; kare(bx0, 'ses');
      hoparlor(c, bx0 + pb / 2 - 2, 8 + pb / 2, 22, G.ses && G.ses.kapali);
    }
    var durumRenk = { devriye: '#5ed36b', yorgun: '#8fd3ff', suphe: '#ffb02e', kovalama: '#ff4545', arama: '#ffd84a', yakaladi: '#ff4545' };
    var dr = ko ? (durumRenk[ko.durum] || '#5ed36b') : '#5ed36b';
    var uw = tel ? 78 : 120, uh = tel ? 24 : 28, ux = bx0 - gap - uw;
    c.save(); c.globalAlpha = 0.8; c.fillStyle = 'rgba(30,40,80,0.8)'; rr(c, ux, 8 + (pb - uh) / 2, uw, uh, uh / 2); c.fill(); c.lineWidth = 2; c.strokeStyle = dr; c.stroke(); c.restore();
    var ucy = 8 + pb / 2;
    gozIkon(c, ux + uh / 2 + 1, ucy, uh / 2 - 4, uy, dr);
    c.fillStyle = 'rgba(255,255,255,0.2)'; rr(c, ux + uh + 2, ucy - 3.5, uw - uh - 10, 7, 3.5); c.fill();
    if (uy > 0.02) { c.fillStyle = dr; rr(c, ux + uh + 2, ucy - 3.5, Math.max(7, (uw - uh - 10) * Math.min(1, uy)), 7, 3.5); c.fill(); }
    miniCiz(c, d);

    // ---- sol üst: görev çipi, oda · süre çipi, durum hapları
    var fsC = tel ? 11 : 12, ch = tel ? 22 : 24, sx = 8, sy = 8;
    var ga = gorevAnahtar(d), gTam = dokunMetin(gorev(d)), gKisa = gorevKisa(gTam, ga);
    cipTam = gTam;
    var gw = olc(c, gKisa, fsC) + ch + 10;
    c.save(); c.globalAlpha = 0.82; c.fillStyle = 'rgba(255,248,225,0.92)'; rr(c, sx, sy, gw, ch, ch / 2); c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#ffb02e'; c.stroke(); c.restore();
    ikon(c, gorevIkon(ga), sx + ch / 2 + 1, sy + ch / 2, ch - 6);
    yazi(c, gKisa, sx + ch, sy + ch / 2 + 1, fsC, '#3b2410', 'left', false);
    hudAlan.gorev = { x: sx, y: sy, w: gw, h: ch };
    var oda = (G.harita && G.harita.odaAdi && o) ? G.harita.odaAdi(o.x, o.y) : '';
    var kalan = Math.max(0, Math.ceil((d.sureLimiti || 180) + (d.ekSure || 0) - d.zaman)), kritik = kalan <= 10;
    var oy = sy + ch + 4, oYazi = (oda ? oda + ' · ' : '') + Math.floor(kalan / 60) + ':' + (kalan % 60 < 10 ? '0' : '') + (kalan % 60);
    var ow = olc(c, oYazi, fsC) + 18;
    c.save(); c.globalAlpha = 0.8; c.fillStyle = kritik ? 'rgba(130,20,20,0.9)' : 'rgba(30,40,80,0.8)'; rr(c, sx, oy, ow, ch - 2, (ch - 2) / 2); c.fill(); c.lineWidth = 1.5; c.strokeStyle = kritik ? '#ff4545' : 'rgba(125,162,255,0.8)'; c.stroke(); c.restore();
    yazi(c, oYazi, sx + 9, oy + ch / 2, fsC, kritik ? '#ffd0d0' : '#fff', 'left', false);
    var hy = oy + ch + 2, hx = sx;
    if (ko && ko.kim) {
      var yorgun = ko.durum === 'yorgun', adK = G.kisiAdi(ko.kim);
      var oran = Math.max(0, Math.min(1, (ko.nobet == null ? 65 : ko.nobet) / (ko.nobetMax || 65)));
      hx += durumHapi(c, hx, hy, ko.kim, oran, oran > 0.3 ? '#5ed36b' : '#ffb02e', yorgun ? '#8fd3ff' : '#7da2ff', false, adK, null) + 5;
    }
    if (uyn) {
      var ub = uyn.durum === 'kovalama';
      hx += durumHapi(c, hx, hy, uyn.kim, uyn.durum === 'kovalama' ? 1 : (uyn.durum === 'suphe' ? 0.6 : 0.35), ub ? '#ff4545' : '#ffb02e', ub ? '#ff4545' : '#ffb02e', false, G.kisiAdi(uyn.kim), null) + 5;
    }
    var kdA = d.kardesler && d.kardesler[0];
    if (kdA && kdA.kacamak) {
      var ko2 = Math.max(0, Math.min(1, (kdA.gorunmez || 0) / (kdA.kacamakToplam || 1))), nb2 = 0.55 + 0.25 * Math.sin(t * 5);
      durumHapi(c, hx, hy, 'Atılay', ko2, ko2 > 0.25 ? '#b9a8ff' : '#ffb02e', kdA.kacamak === 'bagiriyor' ? '#ffe14d' : '#b9a8ff', true, 'Atılay', nb2);
    }

    // ---- tost kuyruğu + kaza çipi
    kazaHud(c, d, w, h, kucuk);
    var ty = 8 + ((d.kaza && d.kaza.asama === 'dustu') ? (tel ? 32 : 36) : 0);
    tostCiz(c, d, w, ty);

    // ---- envanter (yalnız dolu kutular + 1 boş)
    var env = o && o.envanter || [], n = Math.min(6, Math.max(1, env.length + 1)), ss = tel ? 34 : 44, ig = tel ? 4 : 6, tw = n * ss + (n - 1) * ig;
    var ex = (w - tw) / 2, ey = h - ss - (tel ? 8 : 12), sonAt = -1;
    for (var q = 0; q < env.length; q++) if (ATILABILIR[env[q]]) sonAt = q;
    for (var i = 0; i < n; i++) {
      var X = ex + i * (ss + ig), dolu = i < env.length, pop = dolu ? (envPop[env[i]] || 0) : 0;
      c.save(); c.globalAlpha = dolu ? 0.92 : 0.5;
      var sc = 1 + pop * 0.5; c.translate(X + ss / 2, ey + ss / 2); c.scale(sc, sc); c.translate(-(X + ss / 2), -(ey + ss / 2));
      c.fillStyle = dolu ? (pop > 0 ? '#fff6b8' : 'rgba(255,248,225,0.95)') : 'rgba(20,30,60,0.5)'; rr(c, X, ey, ss, ss, 9); c.fill();
      c.lineWidth = i === sonAt ? 3 : 1.5; c.strokeStyle = i === sonAt ? '#ffcc00' : (dolu ? '#ffb02e' : 'rgba(255,255,255,0.35)'); c.stroke();
      c.restore();
      if (dolu) {
        ikon(c, env[i], X + ss / 2, ey + ss / 2 - (tel ? 0 : 3), ss * 0.66);
        if (!tel) yazi(c, esyaAdi(env[i]), X + ss / 2, ey + ss - 6, 8, '#4a2f12', 'center', false);
      }
    }
    gokceDugme(c, d, w, h, ex + tw, ey, ss, kucuk);
    if (sonAt >= 0 && !tel) yazi(c, 'F', ex + sonAt * (ss + ig) + ss - 6, ey - 6, 12, '#ffd93b', 'center');

    // ---- yakındaki ipucu (karakterin yanında, küçük)
    if (o && o.yakindaki && o.yakindaki.metin && !o.saklandi || (o && o.saklandi && o.yakindaki)) {
      var sp = G.ekranNoktasi ? G.ekranNoktasi(o.x, o.y, 1.7) : null;
      var bx = sp ? sp.x : (o.x - k.x) * k.olcek, by = sp ? sp.y - 14 : (o.y - k.y) * k.olcek - 46 * k.olcek - 14;
      var mt = o.yakindaki.metin, fs = tel ? 12 : 14, kw = tel ? 22 : 30, bw = olc(c, mt, fs) + kw + 22, bh = tel ? 28 : 34;
      bx = Math.max(bw / 2 + 8, Math.min(w - bw / 2 - 8, bx)); by = Math.max(bh + 8, Math.min(h - 70, by));
      var zip = Math.sin(t * 6) * 2;
      c.save(); c.translate(0, zip); c.globalAlpha = 0.93;
      c.fillStyle = '#fff'; rr(c, bx - bw / 2, by - bh, bw, bh, bh / 2); c.fill();
      c.beginPath(); c.moveTo(bx - 6, by - 2); c.lineTo(bx + 6, by - 2); c.lineTo(bx, by + 7); c.closePath(); c.fill();
      c.lineWidth = 2; c.strokeStyle = '#ffb02e'; rr(c, bx - bw / 2, by - bh, bw, bh, bh / 2); c.stroke();
      if (dokunmatik) elIkon(c, bx - bw / 2 + 18, by - bh / 2, 18);
      else tus(c, 'E', bx - bw / 2 + 10, by - bh / 2, 13);
      yazi(c, mt, bx - bw / 2 + 8 + kw, by - bh / 2 + 1, fs, '#3b2410', 'left', false);
      c.restore();
    }
    aramaHalka(c, d, o, k);
    if (dokunmatik) dokunCiz(c, d);
    cikPopCiz(c, d);
    rehberCiz(c, d, w, h);
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
    kartYildiz(c, d, 0, -108, 34);
    c.save(); c.translate(-250, -20 + Math.abs(Math.sin(t * 3.5)) * -18);
    ikon(c, 'top_hazine', 0, 0, 70); c.restore();
    c.save(); c.translate(250, -20 + Math.abs(Math.sin(t * 3.5 + 1)) * -18);
    ikon(c, 'top_hazine', 0, 0, 70); c.restore();
    yazi(c, G.bolumBilgi().kazandiAlt, 0, 62, sigdir(c, G.bolumBilgi().kazandiAlt, 600, 21), '#4a2f12', 'center', false);
    yazi(c, 'Süre: ' + sureYazi(d.istatistik && d.istatistik.sure) + '   Yakalanma: ' + d.yakalanma + '   Çıkartma: ' + (d.cikartmaSay || 0) + '/' + (d.cikartmaToplam || 3), 0, 100, 22, '#2b3355', 'center', false);
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
    kartYildiz(c, d, 0, -104, 37);
    var gec = G.bolumBilgi().gecis || [];
    for (var k = 0; k < gec.length; k++) yazi(c, gec[k], 0, -30 + k * 30, sigdir(c, gec[k], 630, 20), '#4a2f12', 'center', false);
    var ist = 'Süre: ' + sureYazi(d.istatistik && d.istatistik.sure) + '   Yakalanma: ' + d.yakalanma + '   Çıkartma: ' + (d.cikartmaSay || 0) + '/' + (d.cikartmaToplam || 3);
    yazi(c, ist, 0, 112, sigdir(c, ist, 640, 20), '#2b3355', 'center', false);
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
    dugme(c, 'SES: ' + (G.ses && G.ses.kapali ? 'KAPALI' : 'AÇIK'), 0, -84, 190, 34, G.ses && G.ses.kapali ? '#8a8f9c' : '#3d8bff', '#1c4ea0', false);
    menuAlan.pSes = ekranAlani(w, h, s, 0, 0, -84, 190, 34);
    yazi(c, 'Yakalanma: ' + d.yakalanma + '   Toplam: ' + sureYazi((d.oncekiSure || 0) + d.zaman) + '   Bölüm limiti: ' + sureYazi(d.sureLimiti || 180) + ' (+' + (d.ekSureHakki || 60) + ' sn)', 0, -58, 16, '#ffd93b', 'center', false);
    yazi(c, G.bolumBilgi().kisiler || 'Sümeyye · Enes · Hanife · Mahmut', 0, -34, 13, '#ffd9a0', 'center', false);
    if (G.ucBoyut) yazi(c, dokunmatik ? 'DÖN: kamerayı 90° döndür' : 'Z / X: kamerayı döndür · Tekerlek: yakınlaştır', 0, -10, 14, '#bfe0ff', 'center', false);
    yazi(c, 'Giray scooterda, salıncakta ya da potada şansını dener; düşerse yanına koş!', 0, 12, 13, '#c8e6c0', 'center', false);
    yazi(c, dokunmatik ? 'Devam etmek için DEVAM düğmesine ya da boş yere dokun' : 'Devam etmek için P ya da Esc, ya da tıkla', 0, 44, 15, '#fff', 'center', false);
    yazi(c, 'Çıkartmalar', -150, 84, 18, '#9fc0ff', 'left', false);
    cikartmaSatir(c, G.bolum, 60, 84, 20, 56);
    var ctn = 0, ctop = ((G.bolumBilgi().cikartma) || []).length; for (var ci = 0; ci < ctop; ci++) if (G.kayit && G.kayit.cikartmaVar(G.bolum, ci)) ctn++;
    yazi(c, ctn + '/' + ctop, 150, 84, 18, ctn >= ctop ? '#ffd93b' : '#fff', 'left', false);
    dugme(c, 'DEVAM', -125, 150, 220, 62, '#34c26a', '#1c7a40', false);
    dugme(c, 'AYARLAR', 125, 150, 220, 62, '#7a5cff', '#41309a', false);
    menuAlan.pAyar = ekranAlani(w, h, s, 0, 125, 150, 220, 62);
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
      if (!G._mesajSarildi) {   // bütün geçici yazılar tost kuyruğundan geçer
        G._mesajSarildi = true;
        var eskiMesaj = G.mesaj;
        G.mesaj = function (metin, sure) { if (eskiMesaj) eskiMesaj(metin, sure); tIsaret = G.d && G.d.mesaj; tostEkle(metin, sure); };
      }
      if (G.dinle && !G.arayuz._rehberDinle) {
        G.arayuz._rehberDinle = true;
        G.dinle('arama_bitti', function () { reh.ara = true; });
        G.dinle('gokce_cagrildi', function () { reh.gokce = true; });
        G.dinle('cikartma_al', function (v) { if (v) cikPop.push({ tur: v.tur, x: v.x, y: v.y, t: 0 }); });
        G.dinle('yildiz_hesaplandi', function () { if (reh.yuklendi || true) { if (!reh.yuklendi) rehberYukle(); rehberBitir(true); } });
      }
      if (G.dinle && !G.arayuz._logoDinle) {
        G.arayuz._logoDinle = true;
        G.dinle('esya_al', function (v) { if (!v) return; envPop[v.tur] = 0.6; if (LOGO[v.tur]) logo = { tur: v.tur, t: 0 }; });
      }
    },
    logoDurum: function () { return logo; },
    rehberTekrar: rehberTekrar,
    rehberDurum: function () { return { bekle: +reh.bekle.toFixed(2), t: +reh.t.toFixed(2), pop: cikPop.map(function (q) { var sp = G.ekranNoktasi ? G.ekranNoktasi(q.x, q.y, 1.0) : null; return [q.tur, +q.t.toFixed(2), sp && Math.round(sp.x), sp && Math.round(sp.y)]; }), aktif: reh.aktif, yapildi: Object.keys(reh.yapildi), metin: reh.aktif ? (dokunmatik ? REHBER[reh.aktif].tel : REHBER[reh.aktif].pc) : null }; },
    rozet: rozetCiz,
    rehberMetinleri: function () { var l = []; for (var k in REHBER) { l.push(REHBER[k].tel); l.push(REHBER[k].pc); } return l; },
    _menuAlan: function () { return menuAlan; },
    guncelle: function (dt, d) {
      t += dt;
      for (var cpi = cikPop.length - 1; cpi >= 0; cpi--) if (d.mod === 'oyun') cikPop[cpi].t += dt;
      for (var ep in envPop) { envPop[ep] -= dt; if (envPop[ep] <= 0) delete envPop[ep]; }
      if (d.mod === 'oyun') {
        rehberGuncelle(dt, d);
        if (d.mesaj && d.mesaj !== tIsaret) { tIsaret = d.mesaj; tostEkle(d.mesaj.metin, d.mesaj.sure); }
        var an = d.anons ? (d.anons.metin || '') : '';
        if (an !== tAnons) { tAnons = an; if (an) tostEkle('📢 ' + an, 3, 1, true); }
        var yg = !!(d.komsu && d.komsu.durum === 'yorgun');
        if (yg && !tYorgun) tostEkle(G.kisiAdi(d.komsu.kim) + ' uyumaya gidiyor! Fırsat!', 2, 1);
        tYorgun = yg;
        var gk = d.oyuncu ? dokunMetin(gorev(d)) : null;
        if (gk && gk !== tGorevSon) { if (tGorevSon !== null || true) tostEkle(gk, 3, 1, true); tGorevSon = gk; }
        tostGuncelle(dt);
      } else if (d.mod === 'menu') { tGor = []; tBek = []; tGorevSon = null; tAnons = ''; tYorgun = false; tIsaret = null; }
      if (logo) { logo.t += dt; if (logo.t > 1.2) logo = null; }
      if (d.mod !== sonMod) { sonMod = d.mod; modZaman = 0; konfeti = []; konfetiBirikim = 0; yildizSes = [false, false, false]; if (d.mod !== 'oyun') cikPop = []; if (d.mod !== 'oyun') dokunBirak(); }
      modZaman += dt;
      if (d.mod === 'kazandi' || d.mod === 'bolumBitti') {
        for (var yi = 0; yi < (d.yildiz || 1); yi++) if (!yildizSes[yi] && modZaman >= YILDIZ_GEC + yi * YILDIZ_ARA) { yildizSes[yi] = true; G.olay('yildiz_ses', { i: yi }); }
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
