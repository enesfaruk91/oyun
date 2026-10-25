window.G = window.G || {};
// Bebek bölümü (EK-12, Bölüm 6 "Teyze Evi"): Beren komsu.js'te tek arayıcıdır (emekler, masa altından geçer, oyuncaklara dalar, pusette uyur).
// Bu modül: (1) Nefise Teyze + Uğurcan Enişte (KOVALAMAZ; çocuğu görünce gülerek Beren'e seslenir = ispiyon),
// (2) Beren'in kendiliğinden oyuncaklara dalması ve fırlatılan oyuncağa yönelmesi, (3) telsizle uyanma,
// (4) Gökçe 'bebek' yardımı (Beren'i kucaklar, pusetine götürür, ninni söyler).
// Veri: bolum.js (bebek:true, ispiyon{gorus,aci,bekleme,sure}, gokceBebekSure), harita.js (teyzeYol, enisteYol, bebekOyun).
G.bebek = (function () {
  'use strict';
  var T = 48;
  var kuruldu = false;
  var oynaT = 14, misYol = null, misT = 0;

  function H() { return G.harita || {}; }
  function bilgi() { try { return G.bolumBilgi ? G.bolumBilgi() : {}; } catch (e) { return {}; } }
  function aktif() { return !!bilgi().bebek; }
  function cfg() { return bilgi().ispiyon || { gorus: 270, aci: 1.15, bekleme: 8, sure: 0.55 }; }
  function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function aciNorm(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }
  function olay(ad, v) { if (G.olay) G.olay(ad, v || {}); }
  function engel(x1, y1, x2, y2) { var h = H(); return h.gorusEngeli ? !!h.gorusEngeli(x1, y1, x2, y2) : false; }
  function say(e, m, sure, zorla) { if (!e) return; if (!zorla && e.konusma && e.konusma.sure > 0) return; e.konusma = { metin: m, sure: sure || 2.2 }; }
  function komsuS() { return (G.komsu && G.komsu._durum) ? G.komsu._durum() : null; }

  // ---------------- yürüyüş (misafir.js ile aynı kalıp, portalsız) ----------------
  function yeniS() { return { yol: null, yolI: 0, hedef: null, birak: false, stuckT: 0, stuckX: 0, stuckY: 0, acanlar: [], kapiIc: null, adimT: 0, yeniden: false }; }
  function yolKur(e, s, x, y) {
    var h = H(), p = null;
    s.hedef = { x: x, y: y };
    if (h.yolBul) { try { p = h.yolBul(e.x, e.y, x, y, true); } catch (er) { p = null; } }
    if (p && p.length) {
      s.yol = p; s.yolI = 0; s.birak = false; s.stuckT = 0; s.stuckX = e.x; s.stuckY = e.y;
      if (Math.hypot(p[0].x - e.x, p[0].y - e.y) < 10) s.yolI = 1;
      return true;
    }
    s.yol = null; return false;
  }
  function kapiAc(e, s, x, y) {
    var h = H(); if (!h.kapiAt) return;
    var kp = h.kapiAt(Math.floor(x / T), Math.floor(y / T));
    if (kp && !kp.acik && !kp.kilit) { kp.acik = true; s.acanlar.push(kp); olay('kapi_ac', { kapi: kp }); }
  }
  function kapiKapat(e, s) {
    var h = H(); if (!h.kapiAt) return;
    var cur = h.kapiAt(Math.floor(e.x / T), Math.floor(e.y / T)) || null;
    if (s.kapiIc && cur !== s.kapiIc) {
      var kd = s.kapiIc, i = s.acanlar.indexOf(kd), benAcmis = i >= 0;
      if (benAcmis) s.acanlar.splice(i, 1);
      var o = G.d && G.d.oyuncu;
      var ustunde = o && Math.floor(o.x / T) === kd.tx && Math.floor(o.y / T) === kd.ty;
      if (kd.acik && !ustunde && benAcmis && Math.random() < 0.4) { kd.acik = false; olay('kapi_kapa', { kapi: kd }); }
    }
    s.kapiIc = cur;
  }
  function adim(e, s, dt, hiz, hx, hy, donHizi) {
    var dx = hx - e.x, dy = hy - e.y, L = Math.hypot(dx, dy);
    if (L < 0.001) return;
    var ux = dx / L, uy = dy / L, st = Math.min(hiz * dt, L), h = H();
    var f = aciNorm(Math.atan2(uy, ux) - e.yon), m = (donHizi || 6) * dt;
    e.yon = aciNorm(e.yon + clamp(f, -m, m));
    kapiAc(e, s, e.x + ux * (e.r + 8), e.y + uy * (e.r + 8)); kapiAc(e, s, e.x, e.y);
    var ox = e.x, oy = e.y;
    if (h.hareketEt) h.hareketEt(e, ux * st, uy * st, true); else { e.x += ux * st; e.y += uy * st; }
    e.hareket = true; e.adimFaz += Math.hypot(e.x - ox, e.y - oy) / 16;
    s.adimT += dt;
    if (s.adimT >= 0.5) { s.adimT = 0; olay('adim', { x: e.x, y: e.y, kosu: false, egik: false, kim: 'komsu', kat: 0 }); }
    s.stuckT += dt;
    if (s.stuckT >= 1.5) {
      var il = Math.hypot(e.x - s.stuckX, e.y - s.stuckY);
      s.stuckT = 0; s.stuckX = e.x; s.stuckY = e.y;
      if (il < 18) { if (s.hedef && !s.yeniden) { s.yeniden = true; yolKur(e, s, s.hedef.x, s.hedef.y); } else { s.yeniden = false; s.yol = null; s.birak = true; } } else s.yeniden = false;
    }
  }
  function yolBitti(s) { return !s.yol || s.yolI >= s.yol.length; }
  function takip(e, s, dt, hiz, donHizi) {
    if (yolBitti(s)) return true;
    var g = 0;
    while (s.yolI < s.yol.length && g++ < 4) {
      var p = s.yol[s.yolI], son = s.yolI === s.yol.length - 1;
      if (Math.hypot(p.x - e.x, p.y - e.y) < (son ? 8 : 12)) s.yolI++; else break;
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

  // ---------------- Nefise Teyze + Uğurcan Enişte ----------------
  var SOZ = {
    teyze: {
      ispiyon: ['Hihi! Beren, bak abin burada!', 'Berenciğim, bak kimler gelmiş!', 'Beren, abin burada, bak bak!'],
      bos: ['Çay demledim, kim içer?', 'Beren nerede acaba?', 'Mis gibi börek kokusu!', 'Ay Beren yine oyuncakları dağıtmış!'],
      ters: ['Aaa merhaba kuzum! Beren uyuyor, şşş!', 'Hoş geldin kuzum, sessiz ol, Beren uyuyor!']
    },
    enistee: {
      ispiyon: ['Hoppala! Beren, abini buldum!', 'Beren! Bak bak, abin geldi!', 'Hihi! Beren, kuzenin burada!'],
      bos: ['Maç ne zaman başlıyor?', 'Beren bugün çok yaramaz!', 'Hmm hmm hmm♪', 'Bebek telsizi çalışıyor mu?'],
      ters: ['Aaa kimler gelmiş! Şşş, Beren uyuyor!', 'Hoş geldin! Sessiz ol, bebek uyuyor!']
    }
  };
  function kisiKur(d, kim, ad, yol, hiz) {
    var h = H(), p0 = yol[0] || { x: 14 * T, y: 13 * T };
    var e = yeniVarlik(kim, ad, p0.x, p0.y);
    e.s = yeniS(); e.yolListe = yol; e.idx = 0; e.hiz = hiz; e.faz = 'git'; e.bekleT = 0; e.gorT = 0; e.bekle = 3 + Math.random() * 3; e.sozT = 6 + Math.random() * 6;
    e.cfg = cfg(); e.gorusMesafe = e.cfg.gorus; e.gorusAci = e.cfg.aci;
    return e;
  }
  function yeniVarlik(kim, ad, x, y) {
    return { kim: kim, ad: ad, x: x, y: y, r: 16, yon: Math.PI / 2, hareket: false, adimFaz: 0, konusma: null, durum: 'gez' };
  }
  function goruyor(e, o) {
    if (!o || o.saklandi || o.korunan || (o.gorunmez > 0)) return false;
    var dist = Math.hypot(o.x - e.x, o.y - e.y);
    if (dist > e.gorusMesafe) return false;
    var a = Math.atan2(o.y - e.y, o.x - e.x);
    if (Math.abs(aciNorm(a - e.yon)) > e.gorusAci / 2 && dist > 56) return false;
    return !engel(e.x, e.y, o.x, o.y);
  }
  function kisiGuncelle(e, dt, d) {
    var s = e.s, o = d.oyuncu;
    e.hareket = false;
    if (e.konusma) { e.konusma.sure -= dt; if (e.konusma.sure <= 0) e.konusma = null; }
    e.bekle = Math.max(0, e.bekle - dt);
    var gor = goruyor(e, o), dist = o ? Math.hypot(o.x - e.x, o.y - e.y) : 1e9;
    // ispiyon: yeterince süre görür ya da çok yakınsa
    if (gor && e.durum !== 'ispiyon') e.gorT += dt * (dist < 90 ? 3 : 1); else if (!gor) e.gorT = Math.max(0, e.gorT - dt * 0.8);
    if (e.durum === 'ispiyon') {
      e.sureT -= dt; bak(e, s, dt, Math.atan2(o.y - e.y, o.x - e.x), 8);
      if (e.sureT <= 0) { e.durum = 'gez'; e.faz = 'git'; s.yol = null; }
      return;
    }
    if (gor && e.gorT >= e.cfg.sure && e.bekle <= 0) {
      var ok = G.komsu && G.komsu.ispiyon ? G.komsu.ispiyon(o.x, o.y) : false;
      e.durum = 'ispiyon'; e.sureT = 1.5; e.gorT = 0; e.uyari = 1;
      if (ok) {
        e.bekle = e.cfg.bekleme;
        say(e, rnd(SOZ[e.kim].ispiyon), 2.8, true);
        if (G.mesaj) G.mesaj(e.ad + ' seni gördü ve Beren\'e seslendi!', 2.6);
        olay('ispiyon', { kim: e.kim, x: e.x, y: e.y });
      } else {
        e.bekle = 4;
        say(e, rnd(SOZ[e.kim].ters), 2.6, true);
      }
      return;
    }
    // gezinti
    if (e.faz === 'bak') {
      bak(e, s, dt, e.bakT + Math.sin(e.bekleT * 1.5) * 0.7, 3);
      e.bekleT -= dt;
      if (e.bekleT <= 0) { e.idx = (e.idx + 1) % e.yolListe.length; e.faz = 'git'; s.yol = null; }
    } else {
      var nk = e.yolListe[e.idx % e.yolListe.length];
      if (s.birak) { e.idx = (e.idx + 1) % e.yolListe.length; s.birak = false; s.yol = null; return; }
      if (!s.yol && !yolKur(e, s, nk.x, nk.y)) { e.idx = (e.idx + 1) % e.yolListe.length; return; }
      if (takip(e, s, dt, e.hiz, 5)) { e.faz = 'bak'; e.bekleT = Math.max(1.2, nk.bekle || 2); e.bakT = e.yon; s.yol = null; }
    }
    e.sozT -= dt;
    if (e.sozT <= 0) { e.sozT = 9 + Math.random() * 8; say(e, rnd(SOZ[e.kim].bos), 2.6); }
    kapiKapat(e, s);
  }

  // ---------------- başlatma ----------------
  function init(d, korunsun) {
    kurDinle();
    d.teyze = null; d.eniste = null; misYol = null;
    if (!aktif()) return;
    var h = H();
    d.teyze = kisiKur(d, 'teyze', 'Nefise Teyze', h.teyzeYol && h.teyzeYol.length ? h.teyzeYol : [{ x: 14 * T, y: 13 * T, bekle: 2 }], 70);
    d.eniste = kisiKur(d, 'enistee', 'Uğurcan Enişte', h.enisteYol && h.enisteYol.length ? h.enisteYol : [{ x: 29 * T, y: 15 * T, bekle: 2 }], 64);
    oynaT = 12 + Math.random() * 8;
    // yeni bölümde Beren pusette uyur (bölüm başı); yakalanıp devam edilirse uyanık, güvenli noktada başlar
    if (!korunsun && G.komsu && G.komsu.uyut && d.komsu) {
      var b = bilgi().kestirme || { sure: [14, 20] };
      G.komsu.uyut(d, b.sure[0] + Math.random() * (b.sure[1] - b.sure[0]) - 2, true);
    }
  }

  // ---------------- Beren: oyuncağa dalma ve fırlatılan eşya ----------------
  function berenSerbest(d) {
    var k = d.komsu, s = komsuS();
    if (!k || !s || k.kim !== 'beren') return false;
    return !k.pasif && !s.tasi && !s.pg && !s.oy && k.durum === 'devriye' && !(d.gokce && d.gokce.durum === 'bebek');
  }
  var OYUNCAK = { cingirak: 1, pelus: 1, oyuncak_top: 1, oyuncak_ordek: 1 };
  function oyunNoktasi(d) {
    var h = H(), k = d.komsu, en = null, em = 620, i;
    (h.toplanabilir || []).forEach(function (t) {
      if (t.alindi || t.gizli || !OYUNCAK[t.tur]) return;
      var m = Math.hypot(t.x - k.x, t.y - k.y);
      if (m < em && m > 40) { em = m; en = { x: t.x, y: t.y }; }
    });
    if (en && Math.random() < 0.75) return en;
    var l = (h.bebekOyun || []).filter(function (p) { var m = Math.hypot(p.x - k.x, p.y - k.y); return m > 80 && m < 640; });
    return l.length ? rnd(l) : en;
  }
  function oynaGuncelle(dt, d) {
    oynaT -= dt;
    if (oynaT > 0) return;
    if (!berenSerbest(d)) { oynaT = 2; return; }
    var o = d.oyuncu, k = d.komsu;
    // çocuğu gözünün önünde görüyorsa oyuna dalmaz
    if (o && k.uyari > 0.3) { oynaT = 2; return; }
    var p = oyunNoktasi(d);
    oynaT = 14 + Math.random() * 10;
    if (!p) return;
    if (G.komsu.dikkatDagit(p.x, p.y, 6 + Math.random() * 5, 'oyuncak')) olay('bebek_oyun', { x: p.x, y: p.y });
  }
  function firlatDustu(v) {
    var d = G.d;
    if (!d || !aktif() || d.mod !== 'oyun' || !v) return;
    var k = d.komsu, s = komsuS();
    if (!k || !s || k.kim !== 'beren' || k.pasif || k.durum === 'yakaladi' || s.tasi || (d.gokce && d.gokce.durum === 'bebek')) return;
    if (Math.hypot(v.x - k.x, v.y - k.y) > 640) return;
    var sure = OYUNCAK[v.tur] ? 9 : 6;
    if (G.komsu.dikkatDagit(v.x, v.y, sure, 'firlat')) { oynaT = Math.max(oynaT, 8); olay('bebek_oyun', { x: v.x, y: v.y }); }
  }

  // ---------------- telsiz (Atılay) ----------------
  function telsizAnons(v) {
    var d = G.d;
    if (!d || !aktif()) return;
    var k = d.komsu;
    [d.teyze, d.eniste].forEach(function (e) { if (e && Math.random() < 0.7) say(e, e.kim === 'teyze' ? 'Bebek telsizi mi cızırdadı?' : 'Telsizden ses geldi!', 2.4); });
    if (k && k.pasif && d.uyuyan && d.uyuyan.kim === 'beren' && G.komsu.uyandir && G.komsu.uyandir(d)) {
      var hp = (H().hoparlorler || [])[0];
      if (hp) G.komsu.dikkatDagit(hp.x, hp.y + T * 0.8, 5, 'telsiz');
    }
  }

  // ---------------- Gökçe 'bebek' yardımı ----------------
  function pusetYan() {
    var es = H().esyalar || [], p = null, i;
    for (i = 0; i < es.length; i++) if (es[i].tur === 'puset') { p = es[i]; break; }
    if (!p) return null;
    var c = [{ x: (p.tx + 1.5) * T, y: (p.ty + 0.5) * T }, { x: (p.tx - 0.5) * T, y: (p.ty + 0.5) * T }, { x: (p.tx + 0.5) * T, y: (p.ty + 1.5) * T }, { x: (p.tx + 0.5) * T, y: (p.ty - 0.5) * T }];
    for (i = 0; i < c.length; i++) if (!(H().kati && H().kati(Math.floor(c[i].x / T), Math.floor(c[i].y / T)))) return { x: c[i].x, y: c[i].y, puset: { x: (p.tx + 0.5) * T, y: (p.ty + 0.5) * T } };
    return { x: c[0].x, y: c[0].y, puset: { x: (p.tx + 0.5) * T, y: (p.ty + 0.5) * T } };
  }
  function gokceCagir(d, y) {
    var k = d.komsu, s = komsuS(), o = d.oyuncu;
    if (!k || !s || k.kim !== 'beren' || k.pasif || k.durum === 'yakaladi' || s.tasi) { G.mesaj('Beren şu an uyuyor, Gökçe\'yi şimdi çağırma!', 2.6); return false; }
    var bas = null, n;
    for (n = 0; n < 60 && !bas; n++) {
      var a = Math.random() * Math.PI * 2, m = 110 + Math.random() * 60, x = k.x + Math.cos(a) * m, yy = k.y + Math.sin(a) * m;
      if (y.yurunur(x, yy) && !engel(x, yy, k.x, k.y)) bas = { x: x, y: yy };
    }
    if (!bas) bas = { x: k.x + 90, y: k.y };
    d.gokceHakki--;
    if (!d.efektler) d.efektler = [];
    if (d.gokce) y.efektEkle(d, 'parilti', d.gokce.x, d.gokce.y, 1.0);
    d.gokce = { ad: 'Gökçe', x: bas.x, y: bas.y, yon: Math.atan2(k.y - bas.y, k.x - bas.x), hareket: false, adimFaz: 0, durum: 'bebek', konusma: null, renk: '#9b4fd6', hedef: { x: bas.x, y: bas.y }, bebekAsama: 'git', bebekT: 0, bebekYol: null, bebekYolT: 0 };
    d.gokce.konusma = { metin: 'Beren, gel kuzum, ninni vakti!', sure: 2.6 };
    y.efektEkle(d, 'parilti', bas.x, bas.y, 1.0);
    G.komsu.dikkatDagit(k.x, k.y, 60, 'gokce');   // Beren durur, oturur, Gökçe'yi bekler
    G.mesaj('Gökçe Beren\'i kucaklayıp pusetine götürüyor!', 3);
    olay('gokce_cagrildi', { x: bas.x, y: bas.y, tur: 'bebek' });
    return true;
  }
  function gokceGit(g, yol, hiz, dt) {   // yol boyunca yürü; true: yol bitti
    while (yol.length > 1 && Math.hypot(yol[0].x - g.x, yol[0].y - g.y) < 10) yol.shift();
    var hx = yol[0].x, hy = yol[0].y, dx = hx - g.x, dy = hy - g.y, m = Math.hypot(dx, dy);
    if (m < 5) { g.hareket = false; if (yol.length === 1) return true; yol.shift(); return false; }
    var a = Math.min(m, hiz * dt);
    g.x += dx / m * a; g.y += dy / m * a; g.yon = Math.atan2(dy, dx); g.hareket = true; g.adimFaz += dt * 10;
    return false;
  }
  function yolHesapla(g, x, y) {
    var yl = null;
    try { yl = H().yolBul ? H().yolBul(g.x, g.y, x, y, true) : null; } catch (e) { yl = null; }
    return (yl && yl.length) ? yl.slice() : [{ x: x, y: y }];
  }
  var NINNI = ['Dandini dandini dastana...', 'Danalar girmiş bostana...', 'Uyu Beren, uyu güzelim...'];
  function gokceGuncelle(dt, d, g) {
    var k = d.komsu, s = komsuS(), bitir = G.kardesler && G.kardesler.gokceBitir;
    g.bebekT += dt; g.hareket = false;
    function iptal() { G.komsu.tasiBirak(); G.komsu.oyalaIptal('gokce'); if (bitir) bitir(d); }
    if (!k || !s || k.kim !== 'beren' || k.durum === 'yakaladi') { if (bitir) bitir(d); return; }
    if (g.bebekAsama === 'git') {
      if (k.pasif) { iptal(); return; }
      var m = Math.hypot(k.x - g.x, k.y - g.y);
      if (m < 30 || g.bebekT > 14) {
        if (m >= 30) { g.x = k.x - 22; g.y = k.y; }
        if (G.komsu.tasiBasla(g)) {
          g.bebekAsama = 'tasi'; g.bebekT = 0; g.bebekYol = null; g.bebekYolT = 0;
          g.konusma = { metin: 'Gel bakalım güzelim, kucağıma!', sure: 2.2 };
          olay('bebek_ses', { tur: 'kikir', x: k.x, y: k.y });
        } else iptal();
        return;
      }
      g.bebekYolT -= dt;
      if (!g.bebekYol || g.bebekYolT <= 0) { g.bebekYolT = 0.6; g.bebekYol = yolHesapla(g, k.x, k.y); }
      gokceGit(g, g.bebekYol, 205, dt);
      return;
    }
    if (g.bebekAsama === 'tasi') {
      var py = pusetYan();
      if (!py) { iptal(); return; }
      if (Math.hypot(py.x - g.x, py.y - g.y) < 22 || g.bebekT > 30) {
        if (Math.hypot(py.x - g.x, py.y - g.y) >= 22) { g.x = py.x; g.y = py.y; }
        g.bebekAsama = 'yatir'; g.bebekT = 0; g.yon = Math.atan2(py.puset.y - g.y, py.puset.x - g.x);
        var bs = bilgi().gokceBebekSure || [20, 25];
        G.komsu.uyut(d, bs[0] + Math.random() * (bs[1] - bs[0]));
        g.konusma = { metin: NINNI[0], sure: 2.6 }; g.ninniSira = 1;
        olay('ninni', { x: g.x, y: g.y });
        return;
      }
      g.bebekYolT -= dt;
      if (!g.bebekYol || g.bebekYolT <= 0) { g.bebekYolT = 0.8; g.bebekYol = yolHesapla(g, py.x, py.y); }
      gokceGit(g, g.bebekYol, 125, dt);
      if (g.bebekT > 3 && !g.konusma && Math.random() < dt * 0.6) g.konusma = { metin: rnd(['Şşş, tamam güzelim...', 'Pusetine gidiyoruz...', 'Birazdan uyuyacaksın...']), sure: 2 };
      return;
    }
    if (g.bebekAsama === 'yatir') {
      g.adimFaz += dt * 2;
      if (g.bebekT >= 2.8 * g.ninniSira && g.ninniSira < NINNI.length) { g.konusma = { metin: NINNI[g.ninniSira], sure: 2.6 }; g.ninniSira++; }
      if (g.bebekT >= 8) { if (bitir) bitir(d); }
    }
  }

  // ---------------- genel ----------------
  function kurDinle() {
    if (kuruldu || !G.dinle) return;
    kuruldu = true;
    G.dinle('esya_dustu', firlatDustu);
    G.dinle('anons', telsizAnons);
  }
  function guncelle(dt, d) {
    if (!d || !aktif()) return;
    if (d.teyze) kisiGuncelle(d.teyze, dt, d);
    if (d.eniste) kisiGuncelle(d.eniste, dt, d);
    if (d.mod === 'oyun') oynaGuncelle(dt, d);
  }

  return { init: init, guncelle: guncelle, aktif: aktif, gokceCagir: gokceCagir, gokceGuncelle: gokceGuncelle, pusetYan: pusetYan };
})();
