window.G = window.G || {};
(function () {
  var FONT = '"Trebuchet MS", "Comic Sans MS", sans-serif';
  var ANAHTAR = 'abk_ayarlar';
  var MUZIK_CARPAN = 0.26;      // sürgü 0.7 (varsayılan) -> G.muzik.ses(0.18)
  var telefon = !!((window.G && G.tamEkran && G.tamEkran.mobil) || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || /[?&]dokunmatik=1/.test(location.search));
  // grafik: 'yuksek' | 'dusuk' (telefonda varsayılan düşük); otoKamera: sakin anda yakın, tehdit yaklaşınca geniş plan
  var deger = { minik: false, muzik: 0.7, efekt: 1, muzikAcik: true, efektAcik: true, otoKamera: true, grafik: telefon ? 'dusuk' : 'yuksek' };
  var surukle = null;            // 'muzik' | 'efekt'
  var alan = null;               // son çizimin ekran (css px) vuruş alanları
  var t0 = 0, rehberZaman = -99;

  function yukle() {
    try {
      var s = localStorage.getItem(ANAHTAR);
      if (s) {
        var o = JSON.parse(s);
        if (typeof o.muzik === 'number') deger.muzik = Math.max(0, Math.min(1, o.muzik));
        if (typeof o.efekt === 'number') deger.efekt = Math.max(0, Math.min(1, o.efekt));
        if (typeof o.muzikAcik === 'boolean') deger.muzikAcik = o.muzikAcik;
        if (typeof o.efektAcik === 'boolean') deger.efektAcik = o.efektAcik;
        if (typeof o.minik === 'boolean') deger.minik = o.minik;
        if (typeof o.otoKamera === 'boolean') deger.otoKamera = o.otoKamera;
        if (o.grafik === 'yuksek' || o.grafik === 'dusuk') deger.grafik = o.grafik;
      }
    } catch (h) { }
  }
  function kaydet() { try { localStorage.setItem(ANAHTAR, JSON.stringify(deger)); } catch (h) { } }
  function muzikSeviye() { return deger.muzikAcik ? deger.muzik * MUZIK_CARPAN : 0; }
  function efektCarpan() { return deger.efektAcik ? deger.efekt : 0; }
  function uygula() { try { if (G.muzik && G.muzik.ses) G.muzik.ses(muzikSeviye()); } catch (h) { } }
  function degisti() {
    uygula(); kaydet();
    try { if (G.olay) G.olay('ayar_degisti', deger); } catch (h) { }
  }

  // ---- çizim yardımcıları (arayuz.js stili) ----
  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function panel(c, x, y, w, h, r, fill, stroke, lw) {
    c.save(); c.fillStyle = 'rgba(0,0,0,0.25)'; rr(c, x + 3, y + 5, w, h, r); c.fill();
    c.fillStyle = fill; rr(c, x, y, w, h, r); c.fill();
    if (stroke) { c.lineWidth = lw || 3; c.strokeStyle = stroke; c.stroke(); }
    c.restore();
  }
  function yazi(c, s, x, y, b, renk, hiza) {
    c.save(); c.font = 'bold ' + b + 'px ' + FONT; c.textAlign = hiza || 'left'; c.textBaseline = 'middle';
    c.fillStyle = renk; c.fillText(s, x, y); c.restore();
  }
  function konturYazi(c, s, x, y, b, renk, kontur) {
    c.save(); c.font = '900 ' + b + 'px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineJoin = 'round'; c.lineWidth = b * 0.16; c.strokeStyle = kontur; c.strokeText(s, x, y);
    c.fillStyle = renk; c.fillText(s, x, y); c.restore();
  }
  function ikonNota(c, x, y, r, renk) {
    c.save(); c.translate(x, y); c.fillStyle = renk; c.strokeStyle = renk; c.lineWidth = r * 0.16; c.lineCap = 'round';
    c.beginPath(); c.ellipse(-r * 0.3, r * 0.5, r * 0.3, r * 0.22, -0.4, 0, 7); c.fill();
    c.beginPath(); c.ellipse(r * 0.45, r * 0.3, r * 0.3, r * 0.22, -0.4, 0, 7); c.fill();
    c.beginPath(); c.moveTo(-r * 0.05, r * 0.45); c.lineTo(-r * 0.05, -r * 0.55); c.lineTo(r * 0.7, -r * 0.7); c.lineTo(r * 0.7, r * 0.25); c.stroke();
    c.restore();
  }
  function ikonHoparlor(c, x, y, r, renk, kapali) {
    c.save(); c.translate(x, y); c.fillStyle = renk; c.strokeStyle = renk; c.lineWidth = r * 0.14; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-r * 0.7, -r * 0.25); c.lineTo(-r * 0.3, -r * 0.25); c.lineTo(r * 0.1, -r * 0.6); c.lineTo(r * 0.1, r * 0.6); c.lineTo(-r * 0.3, r * 0.25); c.lineTo(-r * 0.7, r * 0.25); c.closePath(); c.fill();
    if (!kapali) { c.beginPath(); c.arc(r * 0.1, 0, r * 0.4, -0.9, 0.9); c.stroke(); c.beginPath(); c.arc(r * 0.1, 0, r * 0.7, -0.9, 0.9); c.stroke(); }
    else { c.strokeStyle = '#ff5a5a'; c.lineWidth = r * 0.18; c.beginPath(); c.moveTo(r * 0.35, -r * 0.35); c.lineTo(r * 0.85, r * 0.35); c.moveTo(r * 0.85, -r * 0.35); c.lineTo(r * 0.35, r * 0.35); c.stroke(); }
    c.restore();
  }

  // Düzen tasarım birimlerinde (panel merkezi 0,0); ekrana ölçek s ile
  var SATIR = [
    { ad: 'muzik', yazi: 'Müzik', y: -125, renk: '#ffb02e', ikon: 'nota' },
    { ad: 'efekt', yazi: 'Oyun Sesleri', y: -5, renk: '#34c26a', ikon: 'hop' }
  ];
  var TX0 = -250, TX1 = 80, KAPAT = { x: 90, y: 240, w: 220, h: 58 }, REHBER = { x: -330, y: 240, w: 400, h: 58 }, TOG = { x: 200, w: 115, h: 54 }, HR = 36;
  function olcek(w, h) { return Math.max(0.3, Math.min(w / 760, h / 620, 1.3)); }

  function ciz(c, d) {
    t0 += 1 / 60;
    var w = d && d.ekran ? d.ekran.w : c.canvas.clientWidth, h = d && d.ekran ? d.ekran.h : c.canvas.clientHeight;
    var s = olcek(w, h), cx = w / 2, cy = h / 2 - 33*s;
    c.fillStyle = 'rgba(14,22,45,0.78)'; c.fillRect(0, 0, w, h);
    c.save(); c.translate(cx, cy); c.scale(s, s);
    panel(c, -350, -252, 700, 570, 28, 'rgba(30,40,80,0.95)', '#7da2ff', 4);
    konturYazi(c, 'AYARLAR', 0, -208, 40, '#ffe14d', '#2b1b4a');
    alan = { s: s, cx: cx, cy: cy, satir: [], kapat: null, ikili: [] };
    for (var i = 0; i < SATIR.length; i++) {
      var r = SATIR[i], ac = deger[r.ad + 'Acik'], v = deger[r.ad], y = r.y;
      panel(c, -330, y - 52, 660, 118, 20, 'rgba(255,255,255,0.07)', null);
      c.fillStyle = ac ? r.renk : '#6b7390'; c.beginPath(); c.arc(-290, y - 4, 26, 0, 7); c.fill();
      if (r.ikon === 'nota') ikonNota(c, -290, y - 4, 20, '#2b1b4a'); else ikonHoparlor(c, -290, y - 4, 20, '#2b1b4a', !ac);
      yazi(c, r.yazi, TX0, y - 34, 26, '#fff');
      // sürgü
      var ty = y + 22, tw = TX1 - TX0;
      c.fillStyle = 'rgba(0,0,0,0.4)'; rr(c, TX0, ty - 11, tw, 22, 11); c.fill();
      if (v > 0) { c.fillStyle = ac ? r.renk : '#6b7390'; rr(c, TX0, ty - 11, Math.max(22, tw * v), 22, 11); c.fill(); }
      c.lineWidth = 3; c.strokeStyle = '#1d2233'; rr(c, TX0, ty - 11, tw, 22, 11); c.stroke();
      var hx = TX0 + tw * v, akt = surukle === r.ad;
      c.fillStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.arc(hx + 2, ty + 4, HR * 0.8, 0, 7); c.fill();
      c.fillStyle = akt ? '#ffe14d' : '#ffffff'; c.strokeStyle = '#2b3355'; c.lineWidth = 4;
      c.beginPath(); c.arc(hx, ty, HR * 0.8 * (akt ? 1.1 : 1), 0, 7); c.fill(); c.stroke();
      c.fillStyle = ac ? r.renk : '#9aa3bd'; c.beginPath(); c.arc(hx, ty, HR * 0.3, 0, 7); c.fill();
      yazi(c, Math.round(v * 100) + '%', 163, ty, 28, ac ? '#fff' : '#9aa3bd', 'center');
      // aç/kapa düğmesi
      panel(c, TOG.x, ty - TOG.h / 2, TOG.w, TOG.h, 16, ac ? '#34c26a' : '#ff6a6a', '#fff', 3);
      yazi(c, ac ? 'AÇIK' : 'KAPALI', TOG.x + TOG.w / 2, ty, 24, '#fff', 'center');
      alan.satir.push({
        ad: r.ad, ty: ty,
        tx0: cx + TX0 * s, tx1: cx + TX1 * s, ty: cy + ty * s,
        hit: HR * s, // dokunma yarıçapı (css px)
        tog: { x: cx + TOG.x * s, y: cy + (ty - TOG.h / 2) * s, w: TOG.w * s, h: TOG.h * s },
        satir: { x: cx - 330 * s, y: cy + (y - 52) * s, w: 660 * s, h: 118 * s }
      });
    }
    // alt satır: iki düğme (Otomatik kamera, Grafik)
    var OPT = [
      { ad: 'otoKamera', x: -330, yazi: 'Otomatik kamera', deg: deger.otoKamera ? 'AÇIK' : 'KAPALI', acik: deger.otoKamera },
      { ad: 'grafik', x: 5, yazi: 'Grafik', deg: deger.grafik === 'dusuk' ? 'DÜŞÜK' : 'YÜKSEK', acik: deger.grafik !== 'dusuk' }
    ];
    for (var oi = 0; oi < OPT.length; oi++) {
      var op = OPT[oi], oy = 72, ow = 325, oh = 74;
      panel(c, op.x, oy, ow, oh, 20, 'rgba(255,255,255,0.07)', null);
      yazi(c, op.yazi, op.x + 16, oy + oh / 2, 19, '#fff');
      panel(c, op.x + ow - 124, oy + 13, 110, 48, 15, op.acik ? '#34c26a' : '#ff9f2e', '#fff', 3);
      yazi(c, op.deg, op.x + ow - 69, oy + 37, 20, '#fff', 'center');
      alan.ikili.push({ ad: op.ad, x: cx + (op.x + ow - 130) * s, y: cy + (oy + 6) * s, w: 122 * s, h: 62 * s });
    }
    panel(c, -330, 158, 660, 66, 18, deger.minik ? '#258559' : '#596383', '#fff', 2);
    yazi(c, 'Giroş-Atoş modu · ' + (deger.minik ? 'AÇIK' : 'KAPALI'), 0, 180, 24, '#fff', 'center');
    yazi(c, 'Süre yok · Tek dokunuş · Yakalanma yok', 0, 207, 17, '#fff', 'center');
    alan.minik = { x: cx - 330*s, y: cy + 158*s, w: 660*s, h: 66*s };
    panel(c, KAPAT.x, KAPAT.y, KAPAT.w, KAPAT.h, 20, '#3d8bff', '#fff', 3);
    yazi(c, 'Kapat', KAPAT.x + KAPAT.w / 2, KAPAT.y + KAPAT.h / 2, 30, '#fff', 'center');
    var rok = t0 - rehberZaman < 2.2;
    panel(c, REHBER.x, REHBER.y, REHBER.w, REHBER.h, 20, rok ? '#34c26a' : '#f0a020', '#fff', 3);
    yazi(c, rok ? 'Rehber tekrar gösterilecek' : 'Rehberi tekrar göster', REHBER.x + REHBER.w / 2, REHBER.y + REHBER.h / 2, 26, '#fff', 'center');
    alan.rehber = { x: cx + REHBER.x * s, y: cy + REHBER.y * s, w: REHBER.w * s, h: REHBER.h * s };
    alan.kapat = { x: cx + KAPAT.x * s, y: cy + KAPAT.y * s, w: KAPAT.w * s, h: KAPAT.h * s };
    c.restore();
  }

  function icinde(r, x, y, pay) { pay = pay || 0; return x >= r.x - pay && x <= r.x + r.w + pay && y >= r.y - pay && y <= r.y + r.h + pay; }
  function surguAyarla(sr, x) {
    var v = Math.max(0, Math.min(1, (x - sr.tx0) / (sr.tx1 - sr.tx0)));
    v = Math.round(v * 100) / 100;
    if (deger[sr.ad] !== v) { deger[sr.ad] = v; degisti(); }
  }
  function dokun(x, y, tip) {
    if (!G.ayarlar.acik) return false;
    if (!alan) return true;
    if (tip === 'bas') {
      if (alan.minik && icinde(alan.minik, x, y, 0)) { G.ayarlar.minikDegistir(); return true; }
      if (icinde(alan.kapat, x, y, 4)) { G.ayarlar.kapat(); return true; }
      if (alan.rehber && icinde(alan.rehber, x, y, 4)) { try { if (G.arayuz && G.arayuz.rehberTekrar) G.arayuz.rehberTekrar(); } catch (h) { } rehberZaman = t0; return true; }
      for (var oi = 0; oi < alan.ikili.length; oi++) {
        if (icinde(alan.ikili[oi], x, y, 6)) {
          if (alan.ikili[oi].ad === 'otoKamera') deger.otoKamera = !deger.otoKamera; else deger.grafik = deger.grafik === 'dusuk' ? 'yuksek' : 'dusuk';
          degisti(); return true;
        }
      }
      for (var i = 0; i < alan.satir.length; i++) {
        var sr = alan.satir[i];
        if (icinde(sr.tog, x, y, 4)) { deger[sr.ad + 'Acik'] = !deger[sr.ad + 'Acik']; degisti(); return true; }
        // sürgü: tutamak ya da çubuk çevresi (geniş, parmağa uygun)
        if (x >= sr.tx0 - sr.hit && x <= sr.tx1 + sr.hit && Math.abs(y - sr.ty) <= Math.max(sr.hit * 1.2, 24)) {
          surukle = sr.ad; if (!deger[sr.ad + 'Acik']) { deger[sr.ad + 'Acik'] = true; }
          surguAyarla(sr, x); degisti(); return true;
        }
      }
      return true;
    }
    if (tip === 'surukle') {
      if (surukle) for (var j = 0; j < alan.satir.length; j++) if (alan.satir[j].ad === surukle) surguAyarla(alan.satir[j], x);
      return true;
    }
    if (tip === 'birak') { surukle = null; kaydet(); return true; }
    return true;
  }

  yukle();
  G.ayarlar = {
    acik: false, deger: deger,
    minikDegistir: function () { deger.minik = !deger.minik;
      if (!deger.minik && G.harita) (G.harita.aramaNoktalari || []).forEach(function (n) { if (n.minikIpucu) { n.ipucu = false; n.minikIpucu = false; } });
      degisti(); if (G.girdi) G.girdi.temizle(); },
    ac: function () { this.acik = true; surukle = null; },
    kapat: function () { this.acik = false; surukle = null; kaydet(); },
    ciz: ciz, dokun: dokun, uygula: uygula, yukle: yukle, kaydet: kaydet,
    muzikSeviye: muzikSeviye, efektCarpan: efektCarpan,
    _alan: function () { return alan; }
  };
})();
