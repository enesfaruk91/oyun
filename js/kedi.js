window.G = window.G || {};
G.kedi = (function () {
  'use strict';
  var T = G.TILE || 48;
  var k = null, s = null;

  // Oyuncu koşar hız 215 — kedi hızlı ama yakalanabilir.
  var HIZ_GEZ = 62, HIZ_MERAK = 110, HIZ_TAKIP = 185;
  var TASKIN_MESAFE = 260;   // koşan oyuncu uzaktan dikkatini çeker
  var TAYSI_MESAFE = 56;     // yürüyen oyuncuya yakınken dikat
  var YAKALA_MESAFE = 30;    // bu mesafede yakalar!
  var CAN_SIKILIGI = 2.6;    // oyuncu sessiz kalınca ne kadar sürede sıkılır

  var GEZ = ['Mırrr...', 'Miyav!', 'Mır mıır♪', 'Miyav miyav!', 'Prrr...'];

  function H() { return G.harita; }
  function rnd(a) { return a[(Math.random() * a.length) | 0]; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function aciNorm(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }
  function say(m, sure, mucib) {
    if (!k) return;
    k.konusma = { metin: m, sure: sure || 2 };
    if (mucib && G.ses && G.ses.miyav) { try { G.ses.miyav(); } catch (e) { } }
  }
  function olay(ad, v) { G.olay(ad, v || {}); }

  function yeniDurum() {
    return {
      isinma: 2.5, idx: 0, faz: 'git', zaman: 0, yol: null, yolI: 0, yolHedef: null, birak: false,
      gezintiAralik: 3, saikT: 0, sikT: 0, stuckT: 0, stuckX: 0, stuckY: 0, takilma: 0
    };
  }

  function engel(x1, y1, x2, y2) {
    var h = H();
    if (!h.gorusEngeli) return false;
    try { return !!h.gorusEngeli(x1, y1, x2, y2); } catch (e) { return false; }
  }

  // park içinde rastgele gezinti noktası
  function gezintiNokta() {
    var h = H(), den = 0;
    while (den++ < 30) {
      var tx = 3 + ((Math.random() * 39) | 0), ty = 6 + ((Math.random() * 26) | 0);
      if (h.kati && h.kati(tx, ty)) continue;
      if (h.duvarMi && h.duvarMi(tx, ty)) continue;
      if (h.yolBul) {
        try { var p = h.yolBul(k.x, k.y, (tx + 0.5) * T, (ty + 0.5) * T, false); if (p && p.length) return { x: (tx + 0.5) * T, y: (ty + 0.5) * T }; } catch (e) { }
      }
      return { x: (tx + 0.5) * T, y: (ty + 0.5) * T };
    }
    return { x: k.x, y: k.y };
  }

  function yolSet(p) {
    s.yol = p; s.yolI = 0; s.takilma = 0; s.stuckT = 0; s.birak = false;
    if (p && p.length && Math.hypot(p[0].x - k.x, p[0].y - k.y) < 10) s.yolI = 1;
  }
  function yolKur(x, y, kapiGec) {
    var h = H(), p = null;
    s.yolHedef = { x: x, y: y };
    if (h.yolBul) { try { p = h.yolBul(k.x, k.y, x, y, kapiGec !== false); } catch (e) { p = null; } }
    if (p && p.length) { yolSet(p); return true; }
    s.yol = null;
    return false;
  }
  function yolBitti() { return !s.yol || s.yolI >= s.yol.length; }

  function adimAt(dt, hiz, hx, hy, donHizi) {
    var dx = hx - k.x, dy = hy - k.y, L = Math.hypot(dx, dy);
    if (L < 0.001) return;
    var ux = dx / L, uy = dy / L, st = Math.min(hiz * dt, L);
    don(Math.atan2(uy, ux), donHizi || 8, dt);
    var h = H(), ox = k.x, oy = k.y;
    if (h.hareketEt) {
      try { h.hareketEt(k, ux * st, uy * st, true); } catch (e) { k.x += ux * st; k.y += uy * st; }
    } else { k.x += ux * st; k.y += uy * st; }
    k.hareket = true;
    var gercek = Math.hypot(k.x - ox, k.y - oy);
    k.adimFaz += gercek / 10; // kediler çabuk adım atar
    kuyrukEs(dt);
    s.stuckT += dt;
    if (s.stuckT >= 1.2) {
      var ilerleme = Math.hypot(k.x - s.stuckX, k.y - s.stuckY);
      s.stuckT = 0; s.stuckX = k.x; s.stuckY = k.y;
      if (ilerleme < 14) { s.takilma++; s.yol = null; s.birak = true; } else s.takilma = 0;
    }
  }
  function yolTakip(dt, hiz, donHizi) {
    if (yolBitti()) return true;
    var guard = 0;
    while (s.yolI < s.yol.length && guard++ < 4) {
      var p = s.yol[s.yolI];
      var son = s.yolI === s.yol.length - 1;
      if (Math.hypot(p.x - k.x, p.y - k.y) < (son ? 8 : 10)) s.yolI++; else break;
    }
    if (yolBitti()) return true;
    var q = s.yol[s.yolI];
    adimAt(dt, hiz, q.x, q.y, donHizi);
    return false;
  }
  function don(hedef, hiz, dt) {
    var f = aciNorm(hedef - k.yon), m = hiz * dt;
    k.yon = aciNorm(k.yon + clamp(f, -m, m));
  }
  function kuyrukEs(dt) {
    if (!k) return;
    k.kuyrukFaz = (k.kuyrukFaz || 0) + dt * (k.durum === 'takip' ? 10 : 4);
  }

  function durumDegis(yeni) {
    if (k.durum === yeni) return;
    k.durum = yeni;
    s.faz = 'git'; s.yol = null; s.yolI = 0; s.birak = false; s.takilma = 0; s.stuckT = 0;
    s.stuckX = k.x; s.stuckY = k.y; s.zaman = 0; s.sikT = 0;
  }

  function merakBasla(x, y, hizli) {
    durumDegis('merak');
    s.merakHedef = { x: x, y: y };
    s.hizT = hizli ? HIZ_MERAK : HIZ_MERAK * 0.8;
    say(Math.random() < 0.5 ? 'Hışşş?' : 'Mıy?', 1.6, true);
  }

  function tasiBasla() {
    durumDegis('takip');
    s.sikT = 0;
    k.uyari = 1;
    olay('kedi_takip');
    say(rnd(['Miyav miyav!', 'Mır! Dur bakalım!', 'Hışşşş!']), 2.2, true);
  }

  function yakala() {
    durumDegis('yakaladi');
    k.hareket = false;
    k.uyari = 1;
    say(rnd(['Mıır! Yakaladım!', 'Pıtı pıtı! Koluna sarıldım!']), 3, true);
    olay('yakalandi', { kim: 'kedi' });
  }

  // ---------- algı ----------
  function oyuncuGoruyor(o) {
    if (!o || o.saklandi || (o.gorunmez > 0) || s.isinma > 0) return false;
    var dist = Math.hypot(o.x - k.x, o.y - k.y);
    if (dist > 340) return false;
    return !engel(k.x, k.y, o.x, o.y);
  }

  function tapisKesen(o) {
    // eğilmiş / saklanmış oyuncuyu kaybeder
    return o.saklandi || (o.gorunmez > 0) || (o.egik && Math.hypot(o.x - k.x, o.y - k.y) > YAKALA_MESAFE + 20);
  }

  function gurultuIsle(d) {
    var ses = d.sesler;
    if (!ses) return;
    for (var i = 0; i < ses.length; i++) {
      var g = ses[i];
      if (!g || g._kediIsledi) continue;
      g._kediIsledi = true;
      if (k.durum === 'takip' || k.durum === 'yakaladi') continue;
      if (s.isinma > 0) { if (g.kaynak !== 'oyuncu') continue; }
      var mes = Math.hypot(g.x - k.x, g.y - k.y);
      if (mes < g.guc * 0.55 && g.kaynak === 'oyuncu') {
        if (Math.random() < 0.75) { s.hizT = HIZ_MERAK; merakBasla(g.x, g.y, true); }
      }
    }
  }

  function kurabiyeAra() {
    var h = H(), best = null, bd = 34 * 34;
    if (!h.toplanabilir) return null;
    for (var i = 0; i < h.toplanabilir.length; i++) {
      var t = h.toplanabilir[i];
      if (t.alindi || t.tur !== 'kurabiye') continue;
      var dd = (t.x - k.x) * (t.x - k.x) + (t.y - k.y) * (t.y - k.y);
      if (dd < bd) { bd = dd; best = t; }
    }
    return best;
  }

  function kurabiyeYaz() {
    var t = kurabiyeAra();
    if (t) {
      t.alindi = true;
      say('Mıır! Nam nam!', 2.5, true);
      olay('kedi_yedi', { tur: 'kurabiye' });
      durumDegis('gezinti');
    }
  }

  function init(d, korunsun) {
    dinleKaydet();
    var h = H();
    if (!(h.kediBaslangic && h.kediBaslangic.x)) { d.kedi = null; k = null; s = null; return; }   // bu bölümde kedi yok
    var b = h.kediBaslangic;
    if (korunsun && d.kedi) {
      // yakalanıp devam edilince: 'yakaladi' durumunda kalırsa kedi sonsuza dek donuk kalıyordu
      k = d.kedi; s = yeniDurum();
      k.x = b.x; k.y = b.y; k.durum = 'gezinti'; k.uyari = 0; k.hareket = false; k.konusma = null;
      s.isinma = 4;
    }
    else {
      k = d.kedi = {
        x: b.x, y: b.y, r: 11, yon: Math.PI, hareket: false, kim: 'kedi',
        durum: 'gezinti', uyari: 0, adimFaz: 0, kuyrukFaz: 0, konusma: null
      };
      s = yeniDurum();
    }
    s.stuckX = k.x; s.stuckY = k.y;
    // yeşilde yakın bir gezinti hedefi
    s.gezHedef = gezintiNokta();
  }

  function guncelle(dt, d) {
    if (!d) return;
    if (!d.kedi) { if (H().kediBaslangic && H().kediBaslangic.x) init(d, false); if (!d.kedi) return; }
    if (k !== d.kedi) { k = d.kedi; if (!s) s = yeniDurum(); }
    k.hareket = false;
    kuyrukEs(dt);
    if (k.konusma) { k.konusma.sure -= dt; if (k.konusma.sure <= 0) k.konusma = null; }
    if (k.durum === 'yakaladi') return;
    if (s.isinma > 0) s.isinma -= dt;
    var o = d.oyuncu;

    gurultuIsle(d);

    // --- algı: koşan/merak uyandıran oyuncu
    var gor = oyuncuGoruyor(o);
    var dist = o ? Math.hypot(o.x - k.x, o.y - k.y) : 1e9;
    if (k.durum !== 'takip' && k.durum !== 'yakaladi') {
      var kosis = o && o.kosuyor && o.hareket;
      var yakin = o && !o.egik && !o.saklandi && dist < (o.kosuyor ? TASKIN_MESAFE : TAYSI_MESAFE) && (o.gorunmez > 0 || 1) && dist < TAYSI_MESAFE * (o.egik ? 0.4 : 1);
      if (gor && ((kosis && dist < TASKIN_MESAFE && !o.saklandi) || yakin)) {
        tasiBasla();
      } else if (Math.random() < dt * 0.35) {
        say(rnd(GEZ), 2.2);
      }
    }

    switch (k.durum) {
      case 'gezinti': gezintiDavran(dt); break;
      case 'merak': merakDavran(dt, d, o, dist); break;
      case 'takip': takipDavran(dt, d, o, dist); break;
    }
  }

  function gezintiDavran(dt) {
    if (s.birak) s.birak = false;
    if (!s.gezHedef || yolBitti()) {
      s.gezHedef = gezintiNokta();
      if (!yolKur(s.gezHedef.x, s.gezHedef.y, false)) s.gezHedef = null;
    }
    if (s.yol && yolTakip(dt, HIZ_GEZ, 6)) s.yol = null;
    if (Math.random() < dt * 0.06) say(rnd(GEZ), 2);
  }

  function merakDavran(dt, d, o, dist) {
    kurabiyeYaz();
    if (k.durum !== 'merak') return; // kurabiye yedi
    var mh = s.merakHedef;
    if (!mh) { durumDegis('gezinti'); return; }
    // oyuncunu gördü → takip
    if (o && !tapisKesen(o) && dist < TASKIN_MESAFE && (o.kosuyor || dist < TAYSI_MESAFE) && !engel(k.x, k.y, o.x, o.y)) {
      tasiBasla(); return;
    }
    if (s.birak) { s.birak = false; if (!yolKur(mh.x, mh.y, false)) { durumDegis('gezinti'); return; } }
    if (!yolBitti()) yolTakip(dt, s.hizT || HIZ_MERAK, 7);
    else {
      s.zaman += dt;
      // varınca kurabiye var mı bak
      if (kurabiyeAra()) { kurabiyeYaz(); return; }
      if (s.zaman > 2.2) { durumDegis('gezinti'); return; }
      don(k.yon + Math.sin(s.zaman * 3) * 0.4, 4, dt);
    }
  }

  function takipDavran(dt, d, o, dist) {
    if (!o) { durumDegis('gezinti'); return; }
    // kurabiye bağımlısı: yerde kurabiye varsa takibi bırakır!
    var kb = kurabiyeAra();
    if (kb) {
      merakBasla(kb.x, kb.y, true);
      return;
    }
    if (tapisKesen(o)) {
      s.sikT += dt;
      s.walkT = (s.walkT || 0) + dt;
      if (s.walkT > 0.8 && Math.random() < dt * 2) say('Mıy? Nereye kaçtın?', 2, true);
      if (s.sikT > CAN_SIKILIGI) {
        s.merakHedef = { x: o.x, y: o.y };
        durumDegis('merak');
        s.hizT = HIZ_MERAK;
        yolKur(o.x, o.y, false);
        return;
      }
    } else {
      s.sikT = 0;
      s.walkT = 0;
    }
    if (dist <= YAKALA_MESAFE) { yakala(); return; }
    var hedefX = o.x, hedefY = o.y;
    if (!engel(k.x, k.y, hedefX, hedefY)) {
      s.yol = null; s.birak = false;
      adimAt(dt, HIZ_TAKIP, hedefX, hedefY, 12);
    } else {
      if (s.birak || !s.yol) {
        s.birak = false;
        if (!yolKur(hedefX, hedefY, true)) { s.birak = true; return; }
      }
      if (yolTakip(dt, HIZ_TAKIP, 12)) s.yol = null;
    }
  }

  var dinleKayitli = false;
  function dinleKaydet() {
    if (dinleKayitli || !G.dinle) return;
    dinleKayitli = true;
    G.dinle('esya_dustu', function (v) {
      if (!k || !s) return;
      if (!v || v.tur !== 'kurabiye') return;
      if (k.durum === 'yakaladi') return;
      s.merakHedef = { x: v.x, y: v.y };
      s.hizT = HIZ_MERAK;
      durumDegis('merak');
      say('Mııır! Kurabiye?', 2.4, true);
      yolKur(v.x, v.y, false);
    });
  }

  return { init: init, guncelle: guncelle };
})();
