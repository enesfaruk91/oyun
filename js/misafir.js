window.G = window.G || {};
// Yardımcılar ve sürpriz misafir (EK-11): Anneanne (yardımcı), Abari Ebe (öbür katta yardımcı), Recep Dede (ikinci arayıcı).
// Veri bolum.js: yardimci {kim, bekleme, oyalaSure}, misafir {oran, yardimci, arayici, yardimciKat, bekleme}. Verisi olmayan bölümde hiçbir şey yapmaz.
// Varlıklar: d.anneanne, d.abari, d.recep (konum/yon/hareket/adimFaz/konusma/kim alanları komsu ile aynı).
G.misafir = (function () {
  'use strict';
  var T = 48;
  var kuruldu = false;

  function H() { return G.harita || {}; }
  function bilgi() { try { return G.bolumBilgi ? G.bolumBilgi() : {}; } catch (e) { return {}; } }
  function zor() { return bilgi().zorluk || {}; }
  function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function aciNorm(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }
  function olay(ad, v) { if (G.olay) G.olay(ad, v || {}); }
  function katOf(y) { var h = H(); return h.katOf ? h.katOf(y) : 0; }
  function engel(x1, y1, x2, y2) { var h = H(); return h.gorusEngeli ? !!h.gorusEngeli(x1, y1, x2, y2) : false; }
  function say(e, m, sure, zorla) { if (!e) return; if (!zorla && e.konusma && e.konusma.sure > 0) return; e.konusma = { metin: m, sure: sure || 2.2 }; }
  function aktif() { var b = bilgi(); return !b.ayikoyu && !!(b.yardimci || b.misafir); }

  // ---------------- yürüyüş (portal ve kapı destekli) ----------------
  function yeniS() { return { yol: null, yolI: 0, hedef: null, birak: false, stuckT: 0, stuckX: 0, stuckY: 0, portalBekle: 0, acanlar: [], kapiIc: null, adimT: 0 }; }
  function yolKur(e, s, x, y) {
    var h = H(), p = null;
    s.hedef = { x: x, y: y };
    if (h.yolBul) { try { p = h.yolBul(e.x, e.y, x, y, true); } catch (er) { p = null; } }
    if (p && p.length) {
      s.yol = p; s.yolI = 0; s.birak = false; s.stuckT = 0; s.stuckX = e.x; s.stuckY = e.y;
      if (!p[0].portal && Math.hypot(p[0].x - e.x, p[0].y - e.y) < 10) s.yolI = 1;
      return true;
    }
    s.yol = null; return false;
  }
  function kapiAc(e, s, x, y) {
    var h = H(); if (!h.kapiAt) return;
    var kp = h.kapiAt(Math.floor(x / T), Math.floor(y / T));
    if (kp && !kp.acik) { kp.acik = true; s.acanlar.push(kp); olay('kapi_ac', { kapi: kp }); }
  }
  function kapiKapat(e, s) {
    var h = H(); if (!h.kapiAt) return;
    var cur = h.kapiAt(Math.floor(e.x / T), Math.floor(e.y / T)) || null;
    if (s.kapiIc && cur !== s.kapiIc) {
      var kd = s.kapiIc, i = s.acanlar.indexOf(kd), benAcmis = i >= 0;
      if (benAcmis) s.acanlar.splice(i, 1);
      var o = G.d && G.d.oyuncu;
      var ustunde = o && Math.floor(o.x / T) === kd.tx && Math.floor(o.y / T) === kd.ty;
      if (kd.acik && !ustunde && e.durum !== 'kovalama' && benAcmis && (kd.kilit || Math.random() < 0.4)) { kd.acik = false; olay('kapi_kapa', { kapi: kd }); }
    }
    s.kapiIc = cur;
  }
  function adim(e, s, dt, hiz, hx, hy, donHizi) {
    if (s.portalBekle > 0) { s.portalBekle -= dt; e.hareket = false; return; }
    var dx = hx - e.x, dy = hy - e.y, L = Math.hypot(dx, dy);
    if (L < 0.001) return;
    var ux = dx / L, uy = dy / L, st = Math.min(hiz * dt, L), h = H();
    var f = aciNorm(Math.atan2(uy, ux) - e.yon), m = (donHizi || 7) * dt;
    e.yon = aciNorm(e.yon + clamp(f, -m, m));
    kapiAc(e, s, e.x + ux * (e.r + 8), e.y + uy * (e.r + 8)); kapiAc(e, s, e.x, e.y);
    var ox = e.x, oy = e.y;
    if (h.hareketEt) h.hareketEt(e, ux * st, uy * st, true); else { e.x += ux * st; e.y += uy * st; }
    e.hareket = true; e.adimFaz += Math.hypot(e.x - ox, e.y - oy) / 16;
    s.adimT += dt;
    if (s.adimT >= 0.45) { s.adimT = 0; olay('adim', { x: e.x, y: e.y, kosu: e.durum === 'kovalama', egik: false, kim: 'komsu', kat: katOf(e.y) }); }
    s.stuckT += dt;
    if (s.stuckT >= 1.5) {
      var il = Math.hypot(e.x - s.stuckX, e.y - s.stuckY);
      s.stuckT = 0; s.stuckX = e.x; s.stuckY = e.y;
      if (il < 20) { if (s.hedef && !s.yeniden) { s.yeniden = true; yolKur(e, s, s.hedef.x, s.hedef.y); } else { s.yeniden = false; s.yol = null; s.birak = true; } } else s.yeniden = false;
    }
  }
  function yolBitti(s) { return !s.yol || s.yolI >= s.yol.length; }
  // true: yol bitti
  function takip(e, s, dt, hiz, donHizi) {
    if (yolBitti(s)) return true;
    var g = 0;
    while (s.yolI < s.yol.length && g++ < 4) {
      var p = s.yol[s.yolI], son = s.yolI === s.yol.length - 1;
      if (Math.hypot(p.x - e.x, p.y - e.y) < (son ? 8 : 12)) {
        if (p.portal && H().portalGec) { H().portalGec(e, p); s.portalBekle = 0.4; s.stuckX = e.x; s.stuckY = e.y; s.stuckT = 0; }
        s.yolI++;
      } else break;
    }
    if (yolBitti(s)) return true;
    var q = s.yol[s.yolI];
    adim(e, s, dt, hiz, q.x, q.y, donHizi);
    return false;
  }
  function bak(e, s, dt, hedefYon, hiz) {
    var f = aciNorm(hedefYon - e.yon), m = (hiz || 4) * dt;
    e.yon = aciNorm(e.yon + clamp(f, -m, m)); e.hareket = false; s.stuckT = 0;
  }

  // ---------------- başlatma ----------------
  function yeniVarlik(kim, ad, x, y) {
    return { kim: kim, ad: ad, x: x, y: y, r: 16, yon: Math.PI / 2, hareket: false, adimFaz: 0, konusma: null, durum: 'bekle' };
  }
  function init(d, korunsun) {
    kurDinle();
    var b = bilgi(), h = H();
    d.anneanne = null; d.abari = null; d.recep = null;
    if (d.oyuncu) d.oyuncu.korunan = false;
    if (!aktif()) { d.misafir = null; return; }
    var oncekiGeldi = !!(korunsun && d.misafir && d.misafir.geldi);
    var yk = b.yardimci, ms = b.misafir || {};
    d.misafir = { geldi: oncekiGeldi, zil: (ms.oran || 0.4) * (d.sureLimiti || 300) * (0.92 + Math.random() * 0.16), zorla: false };
    if (yk && h.yardimciYeri) {
      var a = d.anneanne = yeniVarlik(yk.kim || 'anneanne', 'Anneanne', h.yardimciYeri.x, h.yardimciYeri.y);
      a.s = yeniS(); a.cagirBekle = 4; a.ipucuBekle = 3; a.cfg = yk; a.ev = { x: a.x, y: a.y }; a.kat = katOf(a.y);
    }
    if (oncekiGeldi) gelisKur(d, false);
  }

  // ---------------- yardımcı davranışı (Anneanne, Abari Ebe) ----------------
  function aramaNoktasiBul(a, d) {
    var h = H(), o = d.oyuncu, gr = h.aramaGruplari || {}, env = (o && o.envanter) || [];
    var maviKapi = (h.kapilar || []).some(function (k) { return k.kilit === 'anahtar_mavi'; });
    var alinan = function (t) { var tl = h.toplanabilir || []; for (var i = 0; i < tl.length; i++) if (tl[i].tur === t) return !!tl[i].alindi; return true; };
    var gerekli = null;
    if (gr.anahtar_mavi && env.indexOf('anahtar_mavi') < 0 && !alinan('anahtar_mavi')) gerekli = 'anahtar_mavi';
    else if (gr.anahtar_kirmizi && !maviKapi && env.indexOf('anahtar_kirmizi') < 0 && !alinan('anahtar_kirmizi')) gerekli = 'anahtar_kirmizi';
    if (!gerekli) return null;
    var en = null, em = 560;
    gr[gerekli].forEach(function (n) {
      if (!n.gercek || n.bakildi || n.ipucu) return;
      if (katOf(n.y) !== katOf(a.y)) return;
      var m = Math.hypot(n.x - a.x, n.y - a.y);
      if (m < em) { em = m; en = n; }
    });
    return en;
  }
  function arayicilar(d) {
    var l = [];
    if (d.komsu && !d.komsu.pasif && d.komsu.durum !== 'yakaladi') l.push(d.komsu);
    if (d.recep && d.recep.durum !== 'yakaladi' && d.recep.durum !== 'selam') l.push(d.recep);
    return l;
  }
  function yardimciGuncelle(a, dt, d) {
    var o = d.oyuncu;
    a.hareket = false;
    if (a.konusma) { a.konusma.sure -= dt; if (a.konusma.sure <= 0) a.konusma = null; }
    a.cagirBekle = Math.max(0, a.cagirBekle - dt); a.ipucuBekle = Math.max(0, a.ipucuBekle - dt);
    a.hazir = a.cagirBekle <= 0;
    a.korur = false;
    if (!o) return;
    var ayniKat = katOf(o.y) === katOf(a.y), dist = ayniKat ? Math.hypot(o.x - a.x, o.y - a.y) : 1e9;
    if (dist < 250) { a.yon = aciNorm(a.yon + clamp(aciNorm(Math.atan2(o.y - a.y, o.x - a.x) - a.yon), -6 * dt, 6 * dt)); }
    var cfg = a.cfg || {};
    if (dist < 74 && !o.saklandi) {
      a.korur = true; o.korunan = true;
      // arayıcı pesindeyse: çay daveti ile oyalar
      if (a.cagirBekle <= 0) {
        var pes = arayicilar(d).filter(function (k) { return k.durum === 'kovalama' || k.durum === 'suphe' || k.durum === 'arama'; });
        if (pes.length) {
          a.cagirBekle = cfg.bekleme || 40;
          say(a, 'Hassi, gel bir çay iç!', 2.6, true);
          var sure = cfg.oyalaSure || 9;
          pes.forEach(function (k) {
            if (k === d.komsu && G.komsu && G.komsu.dikkatDagit) G.komsu.dikkatDagit(a.x, a.y + 30, sure, 'cay');
            else if (k === d.recep) recepOyala(d.recep, a.x, a.y + 30, sure);
          });
          if (G.mesaj) G.mesaj(a.ad + ' arayıcıyı çaya çağırdı!', 2.6);
          olay('yardimci_oyaladi', { kim: a.kim });
        }
      }
    }
    // yakındaki gerçek arama noktasını parlat
    if (dist < 120 && a.ipucuBekle <= 0 && !o.saklandi) {
      var n = aramaNoktasiBul(a, d);
      if (n) {
        n.ipucu = true; a.ipucuBekle = (cfg.bekleme || 40) + 10;
        say(a, rnd(['Aradığın şey şu parlayan yerde olmalı!', 'Şuraya bir bak yavrum, parlıyor!']), 3, true);
        if (G.mesaj) G.mesaj(a.ad + ' bir yeri gösterdi: parıltıya bak!', 3);
        olay('ipucu', { nokta: n, yardimci: a.kim });
      } else a.ipucuBekle = 8;
    }
  }
  function abariGuncelle(a, dt, d) {
    var s = a.s;
    yardimciGuncelle(a, dt, d);
    if (a.durum === 'git' || a.durum === 'dolas') {
      if (a.durum === 'git') {   // kapıdan eve girip hedef kata çık
        if (s.birak || (!s.yol && !yolKur(a, s, a.hedefNokta.x, a.hedefNokta.y))) { a.durum = 'dolas'; s.birak = false; a.bekleT = 2; return; }
        if (takip(a, s, dt, 70, 5)) { a.durum = 'dolas'; s.yol = null; a.bekleT = 2 + Math.random() * 3; }
        kapiKapat(a, s);
        return;
      }
    }
    // dolaş: aynı kattaki noktalar arasında yavaşça
    if (a.bekleT > 0) { a.bekleT -= dt; bak(a, s, dt, a.yon + Math.sin(d.zaman) * 0.4, 2); return; }
    if (!s.yol || s.birak) {
      s.birak = false;
      var pts = (H().devriye || []).filter(function (p) { return katOf(p.y) === (a.dolasKat || 1); });
      if (!pts.length) return;
      var p = rnd(pts);
      if (!yolKur(a, s, p.x, p.y)) { a.bekleT = 1.5; return; }
    }
    if (takip(a, s, dt, 58, 5)) { s.yol = null; a.bekleT = 2.5 + Math.random() * 3.5; if (Math.random() < 0.35) say(a, rnd(['Kuzum, dikkat et merdivenlere!', 'Ay bu dizlerim...', 'Çay demlesem mi?']), 2.4); }
    kapiKapat(a, s);
  }

  // ---------------- Recep Dede (ikinci arayıcı) ----------------
  function recepKur(d, x, y, selam) {
    var z = zor(), r = d.recep = yeniVarlik('recepdede', 'Recep Dede', x, y);
    r.r = 17; r.durum = selam ? 'selam' : 'devriye'; r.uyari = 0;
    r.gorusMesafe = Math.max(240, (z.gorus || 320) - 35); r.gorusAci = Math.max(0.9, (z.gorusAci || 1.2) - 0.1);
    r.s = yeniS(); r.s.zaman = selam ? 6 : 0; r.s.isinma = 2.5; r.s.idx = 0; r.s.faz = 'git'; r.s.kayipT = 0; r.s.sasirT = 0; r.s.sonGorulen = null;
    r.s.liste = devriyeListe();
    r.s.idx = enYakin(r.s.liste, x, y);
    return r;
  }
  function devriyeListe() {
    var l = (H().devriye || []).slice().reverse();
    return l.length ? l : [{ x: 200, y: 200, bekle: 1 }];
  }
  function enYakin(l, x, y) { var bi = 0, bd = 1e9; for (var i = 0; i < l.length; i++) { var m = Math.hypot(l[i].x - x, l[i].y - y); if (m < bd) { bd = m; bi = i; } } return bi; }
  function gelisKur(d, ilk) {
    var h = H(), b = bilgi(), ms = b.misafir || {}, kapi = h.misafirKapi || { x: 23.5 * T, y: 9.5 * T };
    d.misafir.geldi = true;
    // Abari Ebe: kapıdan girip yardımcı katına çıkar
    var ab = d.abari = yeniVarlik(ms.yardimci || 'abariebe', 'Abari Ebe', kapi.x + 40, kapi.y);
    ab.s = yeniS(); ab.cagirBekle = 8; ab.ipucuBekle = 6; ab.cfg = { bekleme: ms.bekleme || 40, oyalaSure: 9 }; ab.dolasKat = ms.yardimciKat != null ? ms.yardimciKat : 1;
    var hed = (h.devriye || []).filter(function (p) { return katOf(p.y) === ab.dolasKat; });
    ab.hedefNokta = hed.length ? hed[0] : { x: ab.x, y: ab.y };
    ab.durum = 'git'; ab.bekleT = 0;
    if (!ilk) {   // yakalanma/yeniden başlangıç: doğrudan yerine
      ab.x = ab.hedefNokta.x; ab.y = ab.hedefNokta.y; ab.durum = 'dolas'; ab.bekleT = 2;
    }
    // Recep Dede
    if (ilk) recepKur(d, kapi.x - 40, kapi.y, true);
    else {
      var o = d.oyuncu, l = devriyeListe(), best = l[0], bm = -1;
      l.forEach(function (p) { var m = o ? Math.hypot(p.x - o.x, p.y - o.y) + (katOf(p.y) !== katOf(o.y) ? 900 : 0) : 0; if (m > bm) { bm = m; best = p; } });
      recepKur(d, best.x, best.y, false);
    }
  }
  function misafirGelsin(d) {
    if (!d.misafir || d.misafir.geldi) return;
    gelisKur(d, true);
    var k = d.komsu;
    olay('misafir_zil', { x: (H().misafirKapi || {}).x, y: (H().misafirKapi || {}).y });
    if (G.mesaj) G.mesaj('Kapı zili! Abari Ebe ve Recep Dede geldi: Recep Dede de seni arayacak!', 5);
    say(d.recep, 'Selamünaleyküm! Hoş bulduk!', 3, true);
    say(d.abari, 'Maşallah, ev ne güzel olmuş!', 3, true);
    if (k && !k.pasif && k.durum !== 'kovalama' && G.komsu && G.komsu.dikkatDagit) {
      var kp = H().misafirKapi || { x: 23.5 * T, y: 9.5 * T };
      G.komsu.dikkatDagit(kp.x, kp.y + T, 7, 'misafir');
    }
  }
  function recepOyala(r, x, y, sure) {
    if (!r || r.durum === 'yakaladi') return;
    r.durum = 'oyalan'; r.s.oy = { x: x, y: y, kalan: sure, faz: 'git', sozT: 0 }; r.s.yol = null; r.uyari = 0;
    say(r, rnd(['Aaa çay mı var? Geliyorum!', 'Bir çay içerim, hemen!']), 2.4, true);
  }
  function recepSupheBasla(r, x, y, gorme) {
    var s = r.s;
    r.durum = 'suphe'; s.sHedef = { x: x, y: y }; s.sGorme = gorme; s.faz = 'git'; s.yol = null; s.zaman = 0;
    say(r, rnd(['Kim var orada?', 'Bir ses duydum...', 'Hıh? Kim o?']), 2.2, true);
    olay('komsu_suphe', {});
  }
  function recepKovalamaBasla(r) {
    var s = r.s, onceki = r.durum;
    r.durum = 'kovalama'; r.uyari = 1; s.kayipT = 0; s.sasirT = 0.8; s.yol = null; s.kayipHedefVar = false;
    if (onceki !== 'kovalama') { olay('komsu_gordu', {}); say(r, rnd(['Dur bakalım evladım!', 'Gel bakalım, şeker vereceğim!', 'Yakalayacağım seni!']), 2.2, true); }
  }
  function recepYakala(r, d) {
    if (G.minikSelam && G.minikSelam(r, G.d.oyuncu)) return;
    r.durum = 'yakaladi'; r.hareket = false; r.uyari = 1;
    say(r, 'Yakaladım seni!', 3, true);
    d.sonYakalanma = { kim: 'recepdede', sebep: 'yakalandi' };
    olay('yakalandi', { kim: 'recepdede' });
  }
  function recepGoruyor(r, o) {
    if (G.minikSelam && G.minikSelam(r, o)) return false;
    if (!o || o.saklandi || o.korunan || (o.gorunmez > 0) || r.s.isinma > 0) return false;
    if (katOf(o.y) !== katOf(r.y)) return false;
    var dist = Math.hypot(o.x - r.x, o.y - r.y);
    if (dist > r.gorusMesafe) return false;
    var a = Math.atan2(o.y - r.y, o.x - r.x);
    if (Math.abs(aciNorm(a - r.yon)) > r.gorusAci / 2 && dist > (r.durum === 'kovalama' ? 110 : 0)) return false;
    return !engel(r.x, r.y, o.x, o.y);
  }
  function recepGuncelle(r, dt, d) {
    var s = r.s, o = d.oyuncu, z = zor(), h = H();
    r.hareket = false;
    if (r.konusma) { r.konusma.sure -= dt; if (r.konusma.sure <= 0) r.konusma = null; }
    if (r.durum === 'yakaladi') return;
    if (s.isinma > 0) s.isinma -= dt;
    var kovHiz = (z.kovalama || 160) - 10, gezHiz = 78 * (z.devriye || 1);
    // karşılama: kapıda kısa süre durur (çocuğa nefes aldırır)
    if (r.durum === 'selam') {
      s.zaman -= dt; bak(r, s, dt, Math.PI / 2, 3);
      if (s.zaman <= 0) { r.durum = 'devriye'; s.faz = 'git'; s.yol = null; s.idx = enYakin(s.liste, r.x, r.y); say(r, 'Şöyle bir gezineyim bakalım...', 2.4, true); }
      return;
    }
    if (r.durum === 'oyalan') {
      var oy = s.oy; oy.kalan -= dt;
      if (oy.kalan <= 0) { r.durum = 'devriye'; s.oy = null; s.yol = null; s.faz = 'git'; s.idx = enYakin(s.liste, r.x, r.y); say(r, 'Çay güzelmiş, devam edelim!', 2.2, true); return; }
      if (oy.faz === 'git') {
        if (Math.hypot(oy.x - r.x, oy.y - r.y) <= 55) oy.faz = 'soylen';
        else { if (!s.yol && !s.birak && !yolKur(r, s, oy.x, oy.y)) oy.faz = 'soylen'; if (s.birak) { s.birak = false; oy.faz = 'soylen'; } else if (s.yol && takip(r, s, dt, 140, 7)) { oy.faz = 'soylen'; s.yol = null; } }
      } else { bak(r, s, dt, Math.atan2(oy.y - r.y, oy.x - r.x), 5); oy.sozT -= dt; if (oy.sozT <= 0) { oy.sozT = 2.6; say(r, rnd(['Çay tam kıvamında!', 'Bu çay bir başka güzel!', 'Bir de şeker atalım!']), 2.2, true); } }
      kapiKapat(r, s);
      return;
    }
    // algı
    var kov = r.durum === 'kovalama', gor = recepGoruyor(r, o), dist = o ? Math.hypot(o.x - r.x, o.y - r.y) : 1e9;
    if (!kov) {
      if (gor) {
        var f = clamp(1 - dist / r.gorusMesafe, 0, 1), gz = o.gorunurluk == null ? 1 : o.gorunurluk;
        r.uyari += (0.67 + f * f) * gz * (z.suphe || 1) * dt;
        s.sonGorulen = { x: o.x, y: o.y };
        if (r.durum === 'suphe' && s.sGorme) s.sHedef = { x: o.x, y: o.y };
      } else r.uyari -= 0.14 * dt;
      r.uyari = clamp(r.uyari, 0, 1);
      // duyma
      if (d.sesler) for (var i = 0; i < d.sesler.length; i++) {
        var g = d.sesler[i];
        if (!g || g._recepIsledi) continue;
        g._recepIsledi = true;
        if (s.isinma > 0 || r.durum === 'kovalama') continue;
        var mes = Math.hypot(g.x - r.x, g.y - r.y), guc = g.guc;
        if (g.kat != null && g.kat !== katOf(r.y)) { if (g.kaynak === 'oyuncu' || g.kaynak === 'kapi' || g.kaynak === 'arama') continue; mes = h.katMesafe(g.x, g.y, r.x, r.y); guc *= 0.35; }
        if (!(mes < guc)) continue;
        if (g.kaynak === 'arama') { if (!engel(r.x, r.y, g.x, g.y) || mes < 90) r.uyari = clamp(r.uyari + 0.07 * (z.suphe || 1), 0, 0.97); continue; }
        if (g.kaynak === 'oyuncu' && o && (o.saklandi || o.korunan || o.gorunmez > 0)) continue;
        if (r.durum === 'suphe' && s.sGorme && gor) continue;
        recepSupheBasla(r, g.x, g.y, false);
      }
      if (r.uyari >= 1 && gor) { if (!G.kovalamaIzni || G.kovalamaIzni(d, 'recep')) recepKovalamaBasla(r); else r.uyari = 0.99; }
      else if (r.uyari >= 1) r.uyari = 0.99;
      else if (r.durum === 'devriye' && r.uyari > 0.35) recepSupheBasla(r, s.sonGorulen ? s.sonGorulen.x : o.x, s.sonGorulen ? s.sonGorulen.y : o.y, true);
    }
    switch (r.durum) {
      case 'devriye': recepDevriye(r, dt, gezHiz); break;
      case 'suphe': recepSuphe(r, dt, gezHiz, o, gor); break;
      case 'arama': recepArama(r, dt, gezHiz); break;
      case 'kovalama': recepKovala(r, dt, d, o, gor, dist, kovHiz); break;
    }
    kapiKapat(r, s);
  }
  function recepDevriye(r, dt, hiz) {
    var s = r.s, P = s.liste;
    if (s.idx >= P.length) s.idx = 0;
    var nk = P[s.idx];
    if (s.faz === 'git') {
      if (s.birak) { s.idx = (s.idx + 1) % P.length; s.birak = false; s.yol = null; return; }
      if (!s.yol && !yolKur(r, s, nk.x, nk.y)) { s.idx = (s.idx + 1) % P.length; return; }
      if (takip(r, s, dt, hiz, 5)) { s.faz = 'bak'; s.zaman = Math.max(0.8, nk.bekle || 1.5); s.bakT = r.yon; s.yol = null; }
    } else {
      bak(r, s, dt, s.bakT + Math.sin(s.zaman * 1.5) * 0.9, 3);
      s.zaman -= dt;
      if (s.zaman <= 0) { s.idx = (s.idx + 1) % P.length; s.faz = 'git'; s.yol = null; }
    }
  }
  function recepSuphe(r, dt, hiz, o, gorunuyor) {
    var s = r.s;
    if (s.faz === 'git') {
      if (s.birak) { s.faz = 'bak'; s.zaman = 2.2; s.bakT = r.yon; s.birak = false; return; }
      if (s.sGorme && gorunuyor && o) { s.rpT = (s.rpT || 0) - dt; if (s.rpT <= 0 || !s.yol) { s.rpT = 0.3; yolKur(r, s, o.x, o.y); } }
      else if (!s.yol && !yolKur(r, s, s.sHedef.x, s.sHedef.y)) { s.faz = 'bak'; s.zaman = 2.2; s.bakT = r.yon; return; }
      if (takip(r, s, dt, hiz * 1.2, 6)) { s.faz = 'bak'; s.zaman = 2 + Math.random(); s.bakT = r.yon; s.yol = null; }
    } else {
      bak(r, s, dt, s.bakT + Math.sin(s.zaman * 1.5) * 0.9, 4);
      s.zaman -= dt;
      if (s.zaman <= 0) {
        if (r.uyari < 0.2 && s.sGorme) { r.durum = 'devriye'; s.faz = 'git'; s.yol = null; s.idx = enYakin(s.liste, r.x, r.y); }
        else { r.durum = 'arama'; s.aramaT = 4; s.faz = 'bak'; s.zaman = 1; s.yol = null; say(r, rnd(['Nereye saklandı bu yaramaz?', 'Buralarda olmalı...']), 2.2, true); }
      }
    }
  }
  function recepArama(r, dt, hiz) {
    var s = r.s;
    s.aramaT -= dt;
    if (s.aramaT <= 0) { r.durum = 'devriye'; r.uyari = 0; s.faz = 'git'; s.yol = null; s.idx = enYakin(s.liste, r.x, r.y); say(r, rnd(['Rüzgârdır herhalde...', 'Neyse, kimse yok.']), 2.2, true); return; }
    if (s.faz === 'bak') {
      bak(r, s, dt, r.yon + dt * 2, 3); s.zaman -= dt;
      if (s.zaman <= 0) {
        var ok = false;
        for (var t = 0; t < 6 && !ok; t++) { var a = Math.random() * 6.283, m = 90 + Math.random() * 140; ok = yolKur(r, s, r.x + Math.cos(a) * m, r.y + Math.sin(a) * m) && s.yol.length <= 10; }
        if (ok) s.faz = 'git'; else { s.zaman = 1; s.yol = null; }
      }
    } else if (s.birak || takip(r, s, dt, hiz, 5)) { s.birak = false; s.yol = null; s.faz = 'bak'; s.zaman = 1.2; }
  }
  function recepKovala(r, dt, d, o, gor, dist, hiz) {
    var s = r.s; r.uyari = 1;
    if (s.sasirT > 0) { s.sasirT -= dt; if (o && !(o.gorunmez > 0)) { bak(r, s, dt, Math.atan2(o.y - r.y, o.x - r.x), 8); s.sonGorulen = { x: o.x, y: o.y }; } return; }
    if (o && !o.saklandi && !o.korunan && !(o.gorunmez > 0) && dist < 34 && katOf(o.y) === katOf(r.y) && !engel(r.x, r.y, o.x, o.y)) { recepYakala(r, d); return; }
    if (gor) {
      s.kayipT = 0; s.sonGorulen = { x: o.x, y: o.y }; s.kayipHedefVar = false;
      if (!engel(r.x, r.y, o.x, o.y) && dist < 150) { s.yol = null; adim(r, s, dt, hiz, o.x, o.y, 12); }
      else {
        s.rpT = (s.rpT || 0) - dt;
        if (s.rpT <= 0 || !s.yol || s.birak) { s.rpT = 0.3; s.birak = false; yolKur(r, s, o.x, o.y); }
        if (s.yol && takip(r, s, dt, hiz, 12)) s.yol = null;
      }
      return;
    }
    s.kayipT += dt;
    if (s.kayipT >= 4) { say(r, 'Nereye gitti bu kuzu?', 2.4, true); r.durum = 'arama'; r.uyari = 0.4; s.aramaT = 4; s.faz = 'bak'; s.zaman = 1; s.yol = null; return; }
    if (s.sonGorulen) {
      if (Math.hypot(s.sonGorulen.x - r.x, s.sonGorulen.y - r.y) > 20) {
        if (!s.yol || s.birak) { s.birak = false; yolKur(r, s, s.sonGorulen.x, s.sonGorulen.y); }
        if (s.yol && takip(r, s, dt, hiz, 10)) s.yol = null;
      } else bak(r, s, dt, r.yon + dt * 3, 4);
    }
  }

  // ---------------- genel ----------------
  function kurDinle() {
    if (kuruldu || !G.dinle) return;
    kuruldu = true;
    G.dinle('kat_gecti', function (v) {   // kovalarken çocuğun merdivene bindiğini gördüyse pesinden gider
      var d = G.d, r = d && d.recep;
      if (!r || r.durum !== 'kovalama') return;
      if (Math.hypot(v.x0 - r.x, v.y0 - r.y) < r.gorusMesafe && !engel(r.x, r.y, v.x0, v.y0)) { r.s.sonGorulen = { x: v.x1, y: v.y1 }; r.s.kayipT = 0; r.s.yol = null; }
    });
  }
  function guncelle(dt, d) {
    if (!d || !d.misafir && !d.anneanne) return;
    var o = d.oyuncu;
    if (o) o.korunan = false;
    if (d.anneanne) yardimciGuncelle(d.anneanne, dt, d);
    if (d.misafir && !d.misafir.geldi && (d.zaman >= d.misafir.zil || d.misafir.zorla) && d.mod === 'oyun') misafirGelsin(d);
    if (d.abari) abariGuncelle(d.abari, dt, d);
    if (d.recep) recepGuncelle(d.recep, dt, d);
  }

  return {
    init: init, guncelle: guncelle, aktif: aktif,
    _zorla: function () { if (G.d && G.d.misafir) { G.d.misafir.zorla = true; return true; } return false; }   // test için
  };
})();
