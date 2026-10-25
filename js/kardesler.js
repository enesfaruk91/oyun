window.G = window.G || {};
G.kardesler = (function () {
  var T = 48;
  var GECIKME = [42, 80];     // Atılay, Giray ne kadar iz geride (px)
  var KAC_HIZ = 205;
  var hist = [];              // Ogeday'ın konum izi
  var sonSaklandi = false, durduSure = 0;
  var kovSihir = false, kovZar = false, kovGecen = false;
  var gokceT = 0, gokceKonT = 8, gokceSusT = 0, donusT = 0, donusYol = null, donusYolT = 0, gokceKonSira = 0, kacYol = null, kacHedefIdx = 0, kacYolT = 0, donT = 0;

  var KAC = ['Kaçççç!', 'Hihihi, kaçtım!', 'Beni tutamazsın!', 'Hadi hadi hadi!'];
  var DON = ['Yakalayamazsııın!', 'Dilim de var, bak!', 'Beeee! Yakalayamazsııın!'];

  function H() { return G.harita || {}; }
  function ayrik(k) { return !!(k.kaza || k.kacamak); }   // zincirden ayrılmış kardeş

  function sifirlaIz(o) {
    hist = [];
    var yon = o.yon || 0;
    for (var i = 12; i >= 0; i--) hist.push({ x: o.x - Math.cos(yon) * i * 8, y: o.y - Math.sin(yon) * i * 8 });
  }
  function kardesYerles(d) {
    var o = d.oyuncu;
    d.kardesler.forEach(function (k, i) {
      if (ayrik(k)) return;
      var p = izdeNokta(GECIKME[i]);
      k.x = p.x; k.y = p.y; k.yon = o.yon || 0; k.hareket = false;
    });
  }
  // izin sonundan itibaren 'mesafe' px geride bir nokta
  function izdeNokta(mesafe) {
    var kalan = mesafe;
    for (var i = hist.length - 1; i > 0; i--) {
      var a = hist[i], b = hist[i - 1], s = Math.hypot(a.x - b.x, a.y - b.y);
      if (s >= kalan && s > 0) { var f = kalan / s; return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }; }
      kalan -= s;
    }
    return { x: hist[0].x, y: hist[0].y };
  }

  function init(d, korunsun) {
    var onceki = d.gokceHakki;
    d.gokceHakki = (korunsun && typeof onceki === 'number') ? onceki : (zorluk().gokceHakki || 1);
    d.gokce = masadaGokce(d);
    gokceKonT = 6 + Math.random() * 6; gokceSusT = 0; donusYol = null;
    var os = d.sihirler;
    d.sihirler = (korunsun && os) ? os : { atilay: true, giray: true };
    d.efektler = []; d.anons = null;
    kovZar = false; kovSihir = false;
    if (d.oyuncu) d.oyuncu.gorunmez = 0;
    d.kardesler = [
      { ad: 'Atılay', x: 0, y: 0, yon: 0, hareket: false, adimFaz: 0, gizli: false, renk: '#2f7de1', boy: 0.7 },
      { ad: 'Giray', x: 0, y: 0, yon: 0, hareket: false, adimFaz: 0, gizli: false, renk: '#3fae4a', boy: 0.95 }
    ];
    if (d.oyuncu) { sifirlaIz(d.oyuncu); kardesYerles(d); }
    sonSaklandi = false; durduSure = 0; kacYol = null;
    kazaKur(d, korunsun);
    kacamakKur(d, korunsun);
  }

  function zorluk() { try { return (G.bolumBilgi && G.bolumBilgi().zorluk) || {}; } catch (e) { return {}; } }
  function anonsB() { try { return (G.bolumBilgi && G.bolumBilgi().anons) || {}; } catch (e) { return {}; } }
  function masa() { var m = H().gokceMasa; return (m && typeof m.x === 'number') ? m : null; }
  function masadaGokce(d) {
    var m = masa();
    if (!m) return null;
    return { ad: 'Gökçe', x: m.x, y: m.y, yon: m.yon || 0, hareket: false, adimFaz: 0, durum: 'calisiyor', konusma: null, renk: '#9b4fd6', hedef: { x: m.x, y: m.y } };
  }
  function gokceAktif(d) { d = d || G.d; return !!(d && d.gokce && (d.gokce.durum === 'geliyor' || d.gokce.durum === 'bagiriyor' || d.gokce.durum === 'kaciyor' || d.gokce.durum === 'bebek')); }

  // Yol noktalarını kırp; portal noktasına varılınca öbür kata geç (Gökçe/Giray/Atılay de merdiven kullanır)
  function yolKirp(ent, yol) {
    while (yol.length > 1 && Math.hypot(yol[0].x - ent.x, yol[0].y - ent.y) < 10) {
      var w = yol.shift();
      if (w.portal && H().portalGec) H().portalGec(ent, w);
    }
  }
  function katiMi(x, y) { var h = H(); return h.kati ? !!h.kati(Math.floor(x / T), Math.floor(y / T)) : false; }

  function takipEt(dt, d) {
    var o = d.oyuncu;
    if (!o) return;
    var saklanmis = !!o.saklandi;
    if (saklanmis) { d.kardesler.forEach(function (k) { if (ayrik(k)) return; k.gizli = true; k.hareket = false; }); sonSaklandi = true; return; }
    if (sonSaklandi) { sonSaklandi = false; sifirlaIz(o); kardesYerles(d); d.kardesler.forEach(function (k) { if (!ayrik(k)) k.gizli = false; }); }
    var son = hist[hist.length - 1];
    if (!son) { sifirlaIz(o); son = hist[hist.length - 1]; }
    var ds = Math.hypot(o.x - son.x, o.y - son.y);
    if (ds > 300) { sifirlaIz(o); kardesYerles(d); ds = 0; }   // ışınlanma
    if (ds > 4) { hist.push({ x: o.x, y: o.y }); if (hist.length > 160) hist.shift(); durduSure = 0; }
    else durduSure += dt;
    d.kardesler.forEach(function (k, i) {
      if (ayrik(k)) return;
      k.gizli = false;
      var hedef = izdeNokta(GECIKME[i]);
      if (durduSure > 0.6) { // yanında dur, hafif kıpırdan
        var ac = (o.yon || 0) + Math.PI / 2 * (i === 0 ? 1 : -1);
        var bx = o.x + Math.cos(ac) * 30 + Math.sin(d.zaman * 1.7 + i * 2) * 3;
        var by = o.y + Math.sin(ac) * 30 + Math.cos(d.zaman * 1.3 + i) * 3;
        if (!katiMi(bx, by)) { hedef = { x: bx, y: by }; }
      }
      var dx = hedef.x - k.x, dy = hedef.y - k.y, m = Math.hypot(dx, dy);
      var maks = 260 * dt;
      if (m > 160) { k.x = hedef.x; k.y = hedef.y; k.hareket = false; return; }
      if (m > 2) {
        var adim = Math.min(m, Math.max(maks * Math.min(1, m / 30), 0));
        k.x += dx / m * adim; k.y += dy / m * adim;
        if (m > 5) { k.yon = Math.atan2(dy, dx); k.hareket = true; } else k.hareket = false;
      } else k.hareket = false;
      if (k.hareket) k.adimFaz += dt * 9;
    });
  }

  function yurunur(x, y) {
    var h = H(), tx = Math.floor(x / T), ty = Math.floor(y / T);
    if (tx < 1 || ty < 1 || tx >= (h.W || 44) - 1 || ty >= (h.H || 32) - 1) return false;
    if (h.kati && h.kati(tx, ty)) return false;
    if (h.zemin) { var z = h.zemin(tx, ty); if (z === 'duvar' || z === 'cit' || z === 'dis' || z === 'bosluk') return false; }
    return true;
  }
  function nobetci(d) { return (d.komsu && d.komsu.kim) || 'baba'; }

  // Ogeday'ın yakınında, nöbetçiyle arasında olmayan boş bir nokta
  function belirmeNoktasi(d) {
    var o = d.oyuncu, k = d.komsu, en = null, enP = -1e9;
    for (var n = 0; n < 60; n++) {
      var a = Math.random() * Math.PI * 2, m = 120 + Math.random() * 80;
      var x = o.x + Math.cos(a) * m, y = o.y + Math.sin(a) * m;
      if (!yurunur(x, y)) continue;
      var p = Math.random();
      if (k) {
        // nöbetçi yönüne ters / yan olsun
        var ka = Math.atan2(k.y - o.y, k.x - o.x), fark = Math.abs(Math.atan2(Math.sin(a - ka), Math.cos(a - ka)));
        p += fark;
        if (Math.hypot(k.x - x, k.y - y) < 160) p -= 5;
      }
      if (p > enP) { enP = p; en = { x: x, y: y }; }
    }
    return en || { x: o.x + 130, y: o.y };
  }

  // Ogeday'dan ve nöbetçiden uzak, erişilebilir bir hedef
  function uzakHedef(d, g) {
    var h = H(), o = d.oyuncu, k = d.komsu, W = h.W || 44, Hh = h.H || 32, aday = [];
    for (var n = 0; n < 70; n++) {
      var x = (1 + Math.random() * (W - 2)) * T, y = (1 + Math.random() * (Hh - 2)) * T;
      if (!yurunur(x, y)) continue;
      if (h.katOf && h.katOf(y) !== h.katOf(g.y)) continue;   // kendi katında kaç
      var sk = Math.hypot(x - o.x, y - o.y) * 1.0 + (k ? Math.hypot(x - k.x, y - k.y) * 0.5 : 0) - Math.hypot(x - g.x, y - g.y) * 0.1;
      if (Math.hypot(x - g.x, y - g.y) < 250) continue;
      aday.push({ x: x, y: y, sk: sk });
    }
    aday.sort(function (a, b) { return b.sk - a.sk; });
    for (var i = 0; i < Math.min(5, aday.length); i++) {
      var yl = null;
      try { yl = h.yolBul ? h.yolBul(g.x, g.y, aday[i].x, aday[i].y, true) : null; } catch (e) { yl = null; }
      if (yl && yl.length) return { x: aday[i].x, y: aday[i].y, yol: yl };
    }
    return aday.length ? { x: aday[0].x, y: aday[0].y, yol: null } : null;
  }

  function gokceCagir(d) {
    d = d || G.d;
    if (!d || d.mod !== 'oyun') return false;
    if (gokceAktif(d)) return false;
    if (d.gokce && d.gokce.durum === 'eveDonuyor') return false;
    if ((d.gokceHakki || 0) <= 0) { G.mesaj('Gökçe bu oyunda zaten yardım etti!', 2.5); return false; }
    if (!d.oyuncu) return false;
    // Gökçe'nin yardım türü bölüm verisinden: 'oyala' (varsayılan) | 'kat' (arayıcıyı öbür kata çeker) | ileride 'bebek'
    if (G.gokceYardim && G.gokceYardim() === 'kat' && H().katSayisi > 1) return gokceKatCagir(d);
    if (G.gokceYardim && G.gokceYardim() === 'bebek' && G.bebek) return G.bebek.gokceCagir(d, { efektEkle: efektEkle, yurunur: yurunur });
    d.gokceHakki--;
    var bas = belirmeNoktasi(d), o = d.oyuncu, kim = nobetci(d);
    var eski = d.gokce;
    if (!d.efektler) d.efektler = [];
    if (eski) efektEkle(d, 'parilti', eski.x, eski.y, 1.0);
    d.gokce = { ad: 'Gökçe', x: bas.x, y: bas.y, yon: Math.atan2(o.y - bas.y, o.x - bas.x), hareket: false, adimFaz: 0, durum: 'bagiriyor', konusma: null, renk: '#9b4fd6', hedef: { x: bas.x, y: bas.y } };
    gokceMod = 'oyala'; gokceT = 0; kacYol = null; kacYolT = 0; donT = 2.5;
    var seslen = { baba: 'Babaaa', anne: 'Anneee', dede: 'Dedeee', ebe: 'Ebeee', ogretmen: 'Ayşe Öğretmenim', mudur: 'Müdür Beyyy' };
    var kisiAd = G.kisiAdi ? G.kisiAdi(kim) : (kim === 'anne' ? 'Anne' : 'Baba');
    d.gokce.konusma = { metin: (seslen[kim] || kisiAd) + '! Burdayım, yakala beni!', sure: 1.1 };
    efektEkle(d, 'parilti', bas.x, bas.y, 1.0);
    G.mesaj('Gökçe dikkat dağıtıyor! ' + kisiAd + ' onun peşinde!', 3);
    if (G.komsu && G.komsu.pesindenGit) G.komsu.pesindenGit(d.gokce, 10);
    else if (G.komsu && G.komsu.dikkatDagit) G.komsu.dikkatDagit(bas.x, bas.y, 9);
    G.olay('gokce_cagrildi', { x: bas.x, y: bas.y });
    return true;
  }

  // ---- Gökçe 'kat' yardımı (EK-11): arayıcıyı merdivenle öbür kata çeker, ~20 sn orada tutar ----
  function katHedefSec(g, hedefKat) {
    var h = H(), en = null, ed = -1, dp = h.devriye || [], i, yl;
    var pk = h.portallar && h.portallar[0] ? (hedefKat === 0 ? h.portallar[0].a : h.portallar[0].b) : null;
    for (i = 0; i < dp.length; i++) {
      if (h.katOf(dp[i].y) !== hedefKat) continue;
      var dd = pk ? Math.hypot(dp[i].x - pk.x, dp[i].y - pk.y) : 0;
      if (dd < 120) continue;
      yl = null; try { yl = h.yolBul(g.x, g.y, dp[i].x, dp[i].y, true); } catch (e) { yl = null; }
      if (!yl || !yl.length) continue;
      if (dd > ed) { ed = dd; en = { x: dp[i].x, y: dp[i].y, yol: yl }; }
    }
    return en;
  }
  function gokceKatCagir(d) {
    var h = H(), k = d.komsu, o = d.oyuncu;
    var av = (k && !k.pasif && k.durum !== 'yakaladi') ? k : null;
    if (!av) { G.mesaj('Arayıcı şu an uyuyor, Gökçe\'yi şimdi çağırma!', 2.6); return false; }
    var kat = h.katOf(av.y), hk = 1 - kat, bas = null, n, b = (G.bolumBilgi && G.bolumBilgi()) || {};
    for (n = 0; n < 60 && !bas; n++) {
      var a = Math.random() * Math.PI * 2, m = 110 + Math.random() * 70, x = av.x + Math.cos(a) * m, y = av.y + Math.sin(a) * m;
      if (yurunur(x, y) && h.katOf(y) === kat) bas = { x: x, y: y };
    }
    if (!bas) bas = { x: av.x + 100, y: av.y };
    var tg = katHedefSec({ x: bas.x, y: bas.y }, hk);
    if (!tg) { G.mesaj('Gökçe şimdi yardım edemiyor!', 2); return false; }
    d.gokceHakki--;
    if (!d.efektler) d.efektler = [];
    if (d.gokce) efektEkle(d, 'parilti', d.gokce.x, d.gokce.y, 1.0);
    d.gokce = { ad: 'Gökçe', x: bas.x, y: bas.y, yon: Math.atan2(av.y - bas.y, av.x - bas.x), hareket: false, adimFaz: 0, durum: 'bagiriyor', konusma: null, renk: '#9b4fd6', hedef: { x: bas.x, y: bas.y }, katHedef: tg, katVardi: false };
    gokceMod = 'kat'; gokceT = 0; kacYol = null; kacYolT = 0; donT = 2.5;
    d.gokce.konusma = { metin: hk === 1 ? 'Dede, yukarı gel, sana bir şey göstereceğim!' : 'Dede, aşağı gel, sana bir şey göstereceğim!', sure: 2.6 };
    efektEkle(d, 'parilti', bas.x, bas.y, 1.0);
    G.mesaj('Gökçe dikkat dağıtıyor! ' + (G.kisiAdi ? G.kisiAdi(av.kim) : 'Arayıcı') + ' öbür kata gidiyor!', 3);
    if (G.komsu && G.komsu.pesindenGit) G.komsu.pesindenGit(d.gokce, (b.gokceKatSure || 20) + 4, 'kat');
    G.olay('gokce_cagrildi', { x: bas.x, y: bas.y, tur: 'kat' });
    return true;
  }
  var gokceMod = 'oyala';

  function git(g, hx, hy, hiz, dt) {
    var dx = hx - g.x, dy = hy - g.y, m = Math.hypot(dx, dy);
    if (m < 4) { g.hareket = false; return true; }
    var a = Math.min(m, hiz * dt);
    g.x += dx / m * a; g.y += dy / m * a; g.yon = Math.atan2(dy, dx); g.hareket = true; g.adimFaz += dt * 12;
    return false;
  }

  function gokceBitir(d) {
    var g = d.gokce;
    kacYol = null;
    if (!g) return;
    g.bitti = true; efektEkle(d, 'parilti', g.x, g.y, 1.0);
    var m = masa();
    if (!m) { d.gokce = null; return; }
    g.durum = 'eveDonuyor'; g.hareket = false; donusT = 0; donusYol = null; donusYolT = 0;
    g.konusma = { metin: 'Ben derse dönüyorum!', sure: 2 };
    G.olay('gokce_doniyor', {});
  }

  function gokceGuncelle(dt, d) {
    var g = d.gokce;
    if (!g) return;
    gokceT += dt;
    if (g.konusma) { g.konusma.sure -= dt; if (g.konusma.sure <= 0) g.konusma = null; }
    var o = d.oyuncu;
    if (g.durum === 'bebek') { if (G.bebek) G.bebek.gokceGuncelle(dt, d, g); return; }
    if (g.durum === 'eveDonuyor') {
      var m = masa();
      if (!m) { d.gokce = null; return; }
      donusT += dt; donusYolT -= dt;
      if (donusT >= 8) { efektEkle(d, 'parilti', g.x, g.y, 1.0); g.x = m.x; g.y = m.y; efektEkle(d, 'parilti', m.x, m.y, 1.0); }
      if (Math.hypot(m.x - g.x, m.y - g.y) < 6) { g.x = m.x; g.y = m.y; g.yon = m.yon || 0; g.hareket = false; g.durum = 'calisiyor'; gokceKonT = 5 + Math.random() * 4; return; }
      if (!donusYol || !donusYol.length) {
        if (donusYolT <= 0) {
          donusYolT = 1;
          var yl = null;
          try { yl = H().yolBul ? H().yolBul(g.x, g.y, m.x, m.y, true) : null; } catch (e) { yl = null; }
          donusYol = (yl && yl.length) ? yl.slice() : [{ x: m.x, y: m.y }];
        }
      }
      if (donusYol && donusYol.length) {
        yolKirp(g, donusYol);
        var sn = donusYol.length === 1;
        if (git(g, donusYol[0].x, donusYol[0].y, KAC_HIZ, dt) && sn) donusYol = null;
      }
    } else if (g.durum === 'calisiyor') {
      var mm = masa();
      if (mm) { g.x = mm.x; g.y = mm.y; g.yon = mm.yon || 0; }
      g.hareket = false;
      gokceSusT -= dt; gokceKonT -= dt;
      if (o && !o.saklandi && Math.hypot(o.x - g.x, o.y - g.y) <= 120 && gokceSusT <= 0 && !g.konusma) {
        gokceSusT = 10; g.konusma = { metin: 'Şşş! Yakalanacaksın, git hadi!', sure: 2.2 };
      } else if (gokceKonT <= 0 && !g.konusma) {
        gokceKonT = 8 + Math.random() * 6;
        var ls = ['7 çarpı 8... 56!', 'Of, kesirler zor...', 'Şşş, ders çalışıyorum!', 'Türkçe ödevi bitti, sıra matematikte.'];
        gokceKonSira = (gokceKonSira + 1 + ((Math.random() * 3) | 0)) % ls.length;
        g.konusma = { metin: ls[gokceKonSira], sure: 2.5 };
      }
    } else if (g.durum === 'bagiriyor') {
      g.adimFaz += dt * 10; g.hareket = false;
      if (o) g.yon = Math.atan2(o.y - g.y, o.x - g.x);
      if (gokceT >= 1) {
        g.durum = 'kaciyor'; gokceT = 0; donT = 2.5; kacYol = null; kacYolT = 0;
        g.konusma = { metin: KAC[(Math.random() * KAC.length) | 0], sure: 1.6 };
      }
    } else if (g.durum === 'kaciyor') {
      if (gokceT >= (gokceMod === 'kat' ? 24 : 10)) { gokceBitir(d); return; }
      kacYolT -= dt;
      if (gokceMod === 'kat' && g.katVardi) { g.hareket = false; if (o) g.yon = Math.atan2(o.y - g.y, o.x - g.x); }
      else if (!kacYol || !kacYol.length) {
        if (kacYolT <= 0) {
          kacYolT = 0.4;
          if (gokceMod === 'kat') {
            var ky = null; try { ky = H().yolBul(g.x, g.y, g.katHedef.x, g.katHedef.y, true); } catch (e0) { ky = null; }
            kacYol = ky && ky.length ? ky.slice() : [{ x: g.katHedef.x, y: g.katHedef.y }];
          } else {
            var uh = uzakHedef(d, g);
            if (uh) kacYol = uh.yol ? uh.yol.slice() : [{ x: uh.x, y: uh.y }];
          }
        }
      }
      if (kacYol && kacYol.length) {
        yolKirp(g, kacYol);
        var son = kacYol.length === 1;
        if (git(g, kacYol[0].x, kacYol[0].y, KAC_HIZ, dt) && son) { kacYol = null; if (gokceMod === 'kat') g.katVardi = true; }
      } else g.hareket = false;
      donT -= dt;
      if (donT <= 0 && !g.konusma) {
        donT = 3 + Math.random() * 1.5;
        g.konusma = { metin: DON[(Math.random() * DON.length) | 0], sure: 1.5 };
      }
      if (g.konusma && DON.indexOf(g.konusma.metin) >= 0 && o) g.yon = Math.atan2(o.y - g.y, o.x - g.x);   // geriye dönüp dil çıkarır
    }
  }

  // ---- sihirler (EK-2) ----
  function izinliOda(ad) {
    var b = (G.bolumBilgi && G.bolumBilgi()) || {};
    if ((b.izinliOdalar || []).indexOf(ad) >= 0) return true;
    // kilitli odalar sırayla: bir oda, kendi ve öncesindeki anahtar kapıları açıldıysa izinli
    var h = H(), kp = h.kapilar || [], kl = b.kilitliOdalar || {}, anahtarlar = Object.keys(kl);
    for (var i = 0; i < anahtarlar.length; i++) {
      if (kl[anahtarlar[i]] !== ad) continue;
      for (var j = 0; j <= i; j++) {
        var an = anahtarlar[j];
        if (kp.some(function (k) { return k.kilit === an; })) return false;
      }
      return true;
    }
    return false;
  }
  function isinlanmaHedef(d) {
    var h = H(), o = d.oyuncu, k = d.komsu;
    if (!h.zemin || !h.odaAdi) return null;
    for (var n = 0; n < 80; n++) {
      var tx = 1 + ((Math.random() * ((h.W || 44) - 2)) | 0), ty = 1 + ((Math.random() * ((h.H || 32) - 2)) | 0);
      var z = h.zemin(tx, ty);
      if (z === 'duvar' || z === 'cit' || z === 'dis' || z === 'bosluk') continue;
      if (h.kati && h.kati(tx, ty)) continue;
      var x = (tx + 0.5) * T, y = (ty + 0.5) * T;
      if (h.katOf && h.katOf(y) !== h.katOf(o.y)) continue;   // ışınlanma aynı kat içinde
      if (k && Math.hypot(k.x - x, k.y - y) < 500) continue;
      if (Math.hypot(o.x - x, o.y - y) < 300) continue;
      if (!izinliOda(h.odaAdi(x, y))) continue;
      if (h.yolBul) { var yl = null; try { yl = h.yolBul(o.x, o.y, x, y, true); } catch (e) { } if (!yl) continue; }
      return { x: x, y: y };
    }
    return null;
  }
  function efektEkle(d, tur, x, y, omur) { d.efektler.push({ tur: tur, x: x, y: y, omur: omur, omurMax: omur }); }
  function sihirYap(d, kim) {
    var o = d.oyuncu;
    if (kim === 'atilay') {
      d.sihirler.atilay = false; o.gorunmez = 7;
      d.kardesler[0].konusma = { metin: 'Abrakadabra!', sure: 2 };
      efektEkle(d, 'parilti', o.x, o.y, 1.2);
      G.mesaj("✨ Atılay'ın sihri: GÖRÜNMEZLİK! Annem babam seni göremiyor!", 3);
      G.olay('sihir', { kim: 'Atılay', tur: 'gorunmezlik', x: o.x, y: o.y });
    } else {
      var hd = isinlanmaHedef(d);
      if (!hd) return false;
      d.sihirler.giray = false;
      var x0 = o.x, y0 = o.y;
      efektEkle(d, 'isinlanma', x0, y0, 1.0);
      o.x = hd.x; o.y = hd.y;
      sifirlaIz(o); kardesYerles(d);
      d.kardesler[1].konusma = { metin: 'Hop! Işınlan!', sure: 2 };
      efektEkle(d, 'isinlanma', hd.x, hd.y, 1.0);
      G.mesaj('✨ Giray\'ın sihri: IŞINLANMA!', 3);
      G.olay('sihir', { kim: 'Giray', tur: 'isinlanma', x: x0, y: y0, x2: hd.x, y2: hd.y });
    }
    return true;
  }
  function sihirGuncelle(dt, d) {
    var o = d.oyuncu, k = d.komsu;
    if (!d.sihirler) d.sihirler = { atilay: true, giray: true };
    if (!d.efektler) d.efektler = [];
    if (o.gorunmez > 0) o.gorunmez = Math.max(0, o.gorunmez - dt);
    for (var i = d.efektler.length - 1; i >= 0; i--) { d.efektler[i].omur -= dt; if (d.efektler[i].omur <= 0) d.efektler.splice(i, 1); }
    d.kardesler.forEach(function (kd) { if (kd.konusma) { kd.konusma.sure -= dt; if (kd.konusma.sure <= 0) kd.konusma = null; } });
    var kov = k && k.durum === 'kovalama' && !k.oyalaniyor;
    if (!kov) { kovZar = false; kovSihir = false; return; }
    // bir kovalamada tek sihir; görünmezken ya da Gökçe sahnedeyken yenisi çıkmaz
    if (kovSihir || o.gorunmez > 0 || gokceAktif(d)) return;
    var kalan = [];
    if (d.sihirler.atilay && !(o.gorunmez > 0)) kalan.push('atilay');
    if (d.sihirler.giray) kalan.push('giray');
    if (!kalan.length || o.saklandi) return;
    var m = Math.hypot(k.x - o.x, k.y - o.y), tetik = false;
    if (m < 48 && !kovZar) { kovZar = true; tetik = Math.random() < 0.55; }
    else if (m < 160 && Math.random() < 0.45 * dt) tetik = true;
    if (tetik) {
      var sec = kalan[(Math.random() * kalan.length) | 0];
      kovSihir = true;
      if (!sihirYap(d, sec) && kalan.length > 1) sihirYap(d, sec === 'giray' ? 'atilay' : 'giray');
    }
  }


  // ---- kaza (EK-4, EK-8): Giray scooter (B1/B2), salıncak (B3) ya da pota (B4) ile kaçar, düşer; Ogeday süresinde yanına gider ----
  var kazaAt = 70, kazaGurT = 0, kazaYol = null, kazaZorla = false, kazaSurT = 0, kazaKonT = 0, kazaDinle = false, kazaBekT = 0;
  var AGLA = ['Ühüüü! Ogedaaay!', 'Dizim acıyor... ühüü!', 'Gel bana, Ogedaaay!', 'Ühüüü... Yalnız kaldım!'];
  var KAZA = {
    scooter: { bin: 'Scootera binicem!', sur: 'Vınnnn!', surMsg: 'bindi!', kosMsg: ' scootera koştu!', dus: ' scooterdan düştü!', sureS: 1.0 },
    salincak: { bin: 'Salıncağa binicem!', sur: 'Uçuyorummm!', surMsg: 'salıncakta uçuyor!', kosMsg: ' salıncağa koştu!', dus: ' salıncaktan düştü!', sureS: 2.8 },
    trabzan: { bin: 'Trabzandan kayacağım!', sur: 'Vııııt! Kayıyorum!', surMsg: 'trabzandan kayıyor!', kosMsg: ' trabzana koştu!', dus: ' trabzandan düştü!', sureS: 2.4 },
    pota: { bin: 'Smaç yapacağım!', sur: 'Tırmanıyorum, smaç!', surMsg: 'potaya tırmanıyor!', kosMsg: ' potaya koştu!', dus: ' potadan düştü!', sureS: 2.8 },
    oyunparki: { bin: "Beren'in oyun parkına tırmanıcam!", sur: 'Hop hop, tırmanıyorum!', surMsg: 'oyun parkına tırmanıyor!', kosMsg: " Beren'in oyun parkına koştu!", dus: ' oyun parkından düştü!', sureS: 2.8 }
  };
  function kazaTur() { var y = H().kazaYeri; return (y && y.tur) || 'scooter'; }
  function sureOlcek(d) { return Math.max(0.6, ((d && d.sureLimiti) || 180) / 180); }
  function kazaVar() { var h = H(); return !!(h.kazaYeri && typeof h.kazaYeri.x === 'number'); }
  // salıncağın oturağı / potanın direği (modelde sabit yerler)
  function kazaNokta(tur) {
    var h = H(), es = h.esyalar || [], i, e;
    for (i = 0; i < es.length; i++) {
      e = es[i];
      if (tur === 'salincak' && e.tur === 'salincak') return { x: (e.tx + e.w / 2) * T, y: (e.ty + e.h / 2) * T, yon: Math.PI / 2 };
      if (tur === 'trabzan' && e.tur === 'trabzan' && Math.abs((e.tx + 0.5) * T - h.kazaYeri.x) < T * 3 && Math.abs((e.ty + 0.5) * T - h.kazaYeri.y) < T * 3 && h.katOf(e.ty * T) === h.katOf(h.kazaYeri.y)) return { x: (e.tx + 0.5) * T, y: (e.ty + 0.25) * T, ex: (e.tx + 0.5) * T, ey: (e.ty + e.h - 0.25) * T, yon: Math.PI / 2 };
      if (tur === 'oyunparki' && e.tur === 'oyun_parki') return { x: (e.tx + 0.18) * T, y: (e.ty + e.h / 2) * T, yon: 0 };
      if (tur === 'pota' && e.tur === 'pota' && Math.abs((e.tx + 0.5) * T - h.kazaYeri.x) < T * 2.2 && Math.abs((e.ty + 0.5) * T - h.kazaYeri.y) < T * 2.2) return { x: (e.tx + 0.5 - 0.42) * T, y: (e.ty + 0.5) * T, yon: 0 };
    }
    return { x: h.kazaYeri.x, y: h.kazaYeri.y, yon: 0 };
  }
  function kazaKur(d, korunsun) {
    d.kaza = null; d.sonYakalanma = null;
    var h = H();
    d.scooter = (kazaTur() === 'scooter' && h.scooterYeri) ? { x: h.scooterYeri.x, y: h.scooterYeri.y, yon: h.scooterYolu ? Math.atan2(h.scooterYolu.dy, h.scooterYolu.dx) : 0, devrik: false } : null;
    // İlk yaramazlık ~15-25 sn: çift bölümlerde Giray önce, tek bölümlerde Atılay önce (diğeri 30-40 sn sonra)
    var girayIlk = (G.bolum || 1) % 2 === 0;
    kazaAt = korunsun ? (d.zaman || 0) + 25 + Math.random() * 20 : (girayIlk ? 15 + Math.random() * 10 : 45 + Math.random() * 20);
    kazaYol = null; kazaZorla = false; kazaGurT = 0;
    if (!kazaDinle && G.dinle) {
      kazaDinle = true;
      G.dinle('yakalandi', function (v) {
        var dd = G.d;
        if (!dd || dd.sonYakalanma) return;
        dd.sonYakalanma = { kim: (v && v.kim) || nobetci(dd), sebep: 'yakalandi' };
      });
    }
  }
  function kazaKosul(d) {
    if (G.minikMi()) return false;
    var o = d.oyuncu, k = d.komsu;
    if (!o || o.saklandi || gokceAktif(d) || d.kaza || d.mod !== 'oyun' || kacamakAktif(d)) return false;
    if (k && k.durum === 'kovalama') return false;
    if (d.uyanan && d.uyanan.durum === 'kovalama') return false;
    return true;
  }
  function kazaBaslat(d) {
    var h = H(), tur = kazaTur();
    if (!kazaVar()) return false;
    if (tur === 'scooter' && !d.scooter) return false;
    // Tek "kazazede" Giray'dır (kardeşler[1]). Atılay mikrofonda kalır.
    var i = 1, kd = d.kardesler && d.kardesler[i];
    if (!kd) return false;
    var yol = null;
    try { yol = h.yolBul ? h.yolBul(kd.x, kd.y, h.kazaYeri.x, h.kazaYeri.y, true) : null; } catch (e) { yol = null; }
    if (!yol || !yol.length) { kazaAt = (d.zaman || 0) + 15; return false; }
    if (d.scooter) {
      d.scooter.x = h.kazaYeri.x; d.scooter.y = h.kazaYeri.y; d.scooter.devrik = false;
      d.scooter.yon = h.scooterYolu ? Math.atan2(h.scooterYolu.dy, h.scooterYolu.dx) : 0;
    }
    kazaYol = yol.slice(); kazaSurT = 0; kazaKonT = 0;
    kd.kaza = 'kosuyor'; kd.kazaTur = tur; kd.gizli = false; kd.hareket = true; kd.salincakAci = 0; kd.tirmanY = 0;
    kd.konusma = { metin: KAZA[tur].bin, sure: 2 };
    d.kaza = { kardes: kd.ad, asama: 'kosuyor', kalan: 25, x: kd.x, y: kd.y, idx: i, t: 0, tur: tur };
    G.mesaj(kd.ad + KAZA[tur].kosMsg, 2.2);
    return true;
  }
  function kazaDustu(d, kd) {
    var K = d.kaza, tur = K.tur || 'scooter', h = H();
    K.asama = 'dustu'; kd.kaza = 'dustu'; kd.hareket = false; K.kalan = 25; kd.salincakAci = 0; kd.tirmanY = 0;
    if (tur === 'salincak') { kd.x = h.kazaYeri.x + 20; kd.y = h.kazaYeri.y + 6; }
    else if (tur === 'pota' || tur === 'oyunparki') { kd.x = h.kazaYeri.x + 6; kd.y = h.kazaYeri.y + 10; }
    else if (tur === 'trabzan') { kd.x = (K.ex != null ? K.ex : h.kazaYeri.x) - 26; kd.y = (K.ey != null ? K.ey : h.kazaYeri.y) + 30; kd.trabzanY = null; kd.kayma = 0; }
    K.x = kd.x; K.y = kd.y;
    if (d.scooter) { d.scooter.devrik = true; d.scooter.x = kd.x + 20; d.scooter.y = kd.y; }
    kazaGurT = 0; kazaKonT = 0; kazaDinleSira = 0;
    kd.konusma = { metin: AGLA[0], sure: 2.8 };
    G.gurultuYap(kd.x, kd.y, 320, 'esya');
    G.mesaj(kd.ad + KAZA[tur].dus + ' ' + K.kalan + ' saniye içinde yanına git!', 4);
    G.olay('kaza', { kardes: kd.ad, tur: tur });
  }
  var kazaDinleSira = 0;
  function kazaGuncelle(dt, d) {
    var o = d.oyuncu, K = d.kaza;
    if (!K) {
      if (!kazaVar()) return;
      var ist = kazaZorla || (d.zaman >= kazaAt);
      if (!ist) return;
      if (kazaZorla ? (d.kaza || !o) : !kazaKosul(d)) return;
      kazaZorla = false;
      kazaBaslat(d);
      return;
    }
    var kd = d.kardesler[K.idx];
    if (!kd) { d.kaza = null; return; }
    K.t += dt;
    var tur = K.tur || 'scooter';
    if (kd.konusma) { kd.konusma.sure -= dt; if (kd.konusma.sure <= 0) kd.konusma = null; }
    if (K.asama === 'kosuyor') {
      var h = H();
      if (kazaYol && kazaYol.length) {
        yolKirp(kd, kazaYol);
        var son = kazaYol.length === 1;
        if (git(kd, kazaYol[0].x, kazaYol[0].y, 170, dt) && son) kazaYol = null;
      }
      if (!kazaYol || K.t > 25) {
        if (K.t > 25 || !kazaYol) { kd.x = h.kazaYeri.x; kd.y = h.kazaYeri.y; }
        K.asama = 'suruyor'; kd.kaza = 'suruyor'; kazaSurT = 0;
        if (tur !== 'scooter') { var kn = kazaNokta(tur); kd.yon = kn.yon; kd.x = kn.x; kd.y = kn.y; K.bx = kn.x; K.by = kn.y; K.ex = kn.ex; K.ey = kn.ey; }
        kd.konusma = { metin: KAZA[tur].sur, sure: 2 };
      }
    } else if (K.asama === 'suruyor') {
      kazaSurT += dt;
      if (tur === 'scooter') {
        var hh = H(), yol = hh.scooterYolu || { dx: 1, dy: 0 };
        var baz = Math.atan2(yol.dy, yol.dx), a = baz + Math.sin(kazaSurT * 7) * 0.4, sp = 200 * dt;
        var nx = kd.x + Math.cos(a) * sp, ny = kd.y + Math.sin(a) * sp, bitti = false;
        if (!yurunur(nx, ny)) {
          nx = kd.x + Math.cos(baz) * sp; ny = kd.y + Math.sin(baz) * sp;
          if (!yurunur(nx, ny)) { nx = kd.x; ny = kd.y; bitti = true; }
        }
        kd.x = nx; kd.y = ny; kd.yon = a; kd.hareket = true; kd.adimFaz += dt * 14;
        d.scooter.x = kd.x; d.scooter.y = kd.y; d.scooter.yon = a;
        if (kazaSurT >= KAZA.scooter.sureS || bitti) kazaDustu(d, kd);
      } else if (tur === 'salincak') {
        var ge = Math.min(1, kazaSurT / 2.4), amp = 0.25 + 1.0 * ge * ge;
        kd.salincakAci = Math.sin(kazaSurT * 4.2) * amp;
        kd.x = K.bx; kd.y = K.by + kd.salincakAci * 34;
        kd.hareket = false; K.x = kd.x; K.y = kd.y;
        if (kazaSurT > 1.3 && !kd.konusma) kd.konusma = { metin: 'Daha yüksee, daha yüksee!', sure: 1.4 };
        if (kazaSurT >= KAZA.salincak.sureS) kazaDustu(d, kd);
      } else if (tur === 'trabzan') {
        var kf = Math.min(1, kazaSurT / KAZA.trabzan.sureS), ke = kf * kf * (3 - 2 * kf);
        kd.kayma = ke; kd.trabzanY = 0.55 + 1.8 * (1 - ke);
        kd.x = K.bx; kd.y = K.by + (K.ey - K.by) * ke; kd.hareket = false; K.x = kd.x; K.y = kd.y;
        if (kazaSurT > 0.6 && !kd.konusma) kd.konusma = { metin: 'Wiiiiii!', sure: 1.3 };
        if (kazaSurT >= KAZA.trabzan.sureS) kazaDustu(d, kd);
      } else {
        kd.tirmanY = Math.min(tur === 'oyunparki' ? 0.9 : 1.5, kazaSurT * (tur === 'oyunparki' ? 0.4 : 0.62));
        kd.x = K.bx; kd.y = K.by; kd.hareket = false; K.x = kd.x; K.y = kd.y;
        if (kazaSurT > 1.2 && !kd.konusma) kd.konusma = { metin: tur === 'oyunparki' ? 'Ben de Beren gibi tırmanıyorum!' : 'Şimdi smaç!', sure: 1.3 };
        if (kazaSurT >= KAZA[tur].sureS) kazaDustu(d, kd);
      }
    } else if (K.asama === 'dustu') {
      K.x = kd.x; K.y = kd.y;
      if (!G.minikMi()) K.kalan -= dt;
      kazaGurT += dt; kazaKonT += dt;
      if (kazaGurT >= 3) { kazaGurT -= 3; G.gurultuYap(kd.x, kd.y, 320, 'esya'); }
      if (kazaKonT >= 3 && !kd.konusma) { kazaKonT = 0; kazaDinleSira = (kazaDinleSira + 1) % AGLA.length; kd.konusma = { metin: AGLA[kazaDinleSira], sure: 2.8 }; }
      if (o && !o.saklandi && Math.hypot(o.x - kd.x, o.y - kd.y) <= 60) {
        K.asama = 'iyilesti'; kd.kaza = 'iyilesti'; K.t = 0;
        kd.konusma = { metin: 'Tamam... artık iyiyim!', sure: 1.8 };
        G.mesaj('Geçti geçti, ben buradayım!', 2.5);
        G.olay('kaza_bitti', { basari: true, kardes: kd.ad });
      } else if (K.kalan <= 0) {
        K.kalan = 0;
        var kim = nobetci(d);
        d.sonYakalanma = { kim: kim, sebep: 'kaza', kardes: kd.ad };
        G.olay('kaza_bitti', { basari: false, kardes: kd.ad });
        d.kaza = null; kd.kaza = null; kd.kazaTur = null;
        G.olay('yakalandi', { kim: kim, sebep: 'kaza' });
      }
    } else if (K.asama === 'iyilesti') {
      if (K.t >= 1.5) {
        kd.kaza = null; kd.kazaTur = null; kd.konusma = null; d.kaza = null;
        kazaAt = (d.zaman || 0) + 60 + Math.random() * 30;
        if (o) { sifirlaIz(o); }
      }
    }
  }

  // ---- Atılay'ın mikrofon kaçamağı (EK-6) ----
  var kacAt = 60, kacZorla = false, mikYol = null, mikYolT = 0, kacT = 0, kacBekle = 0, kacDonYol = null;
  function mikYeri() { var m = H().mikrofonYeri; return (m && typeof m.x === 'number') ? m : null; }
  function kacamakAktif(d) { d = d || G.d; return !!(d && d.kardesler && d.kardesler[0] && d.kardesler[0].kacamak); }
  function kacamakKur(d, korunsun) {
    var atilayIlk = (G.bolum || 1) % 2 === 1;
    kacAt = korunsun ? (d.zaman || 0) + 30 + Math.random() * 20 : (atilayIlk ? 15 + Math.random() * 10 : 45 + Math.random() * 20);
    kacZorla = false; mikYol = null; kacDonYol = null; kacT = 0; kacBekle = 0;
    d.kardesler.forEach(function (k) { k.gorunmez = 0; k.kacamak = null; k.mikrofonda = false; });
  }
  function yolUzunluk(yl, bx, by) {
    var u = 0, px = bx, py = by;
    for (var i = 0; i < yl.length; i++) { u += Math.hypot(yl[i].x - px, yl[i].y - py); px = yl[i].x; py = yl[i].y; }
    return u;
  }
  function kacamakKosul(d) {
    var o = d.oyuncu, k = d.komsu;
    if (!o || o.saklandi || d.mod !== 'oyun') return false;
    var bebekB = false; try { bebekB = !!G.bolumBilgi().bebek; } catch (e) { }
    if ((!d.uyuyan && !bebekB) || d.uyanan || !mikYeri()) return false;   // bebek bölümünde telsiz uyuyan olmadan da çalışır
    if (d.kaza || gokceAktif(d)) return false;
    if (k && k.durum === 'kovalama') return false;
    return true;
  }
  function kacamakBaslat(d) {
    var m = mikYeri(), kd = d.kardesler[0], yl = null;
    try { yl = H().yolBul ? H().yolBul(kd.x, kd.y, m.x, m.y, true) : null; } catch (e) { yl = null; }
    if (!yl || !yl.length) { kacAt = (d.zaman || 0) + 15; return false; }
    var S = (yolUzunluk(yl, kd.x, kd.y) * 2) / 200 + 1.5 + 4;
    G.mesaj('Atılay yine bir şeyler çeviriyor!', 2.6);
    kd.gorunmez = S; kd.kacamakToplam = S; kd.kacamak = 'gidiyor'; kd.mikrofonda = false; kd.gizli = false;
    kd.konusma = { metin: 'Hihi, görünmez oldum!', sure: 2 };
    mikYol = yl.slice(); kacT = 0; mikYolT = 0; kacDonYol = null;
    efektEkle(d, 'parilti', kd.x, kd.y, 1.0);
    G.olay('kacamak', { asama: 'basladi', sure: S });
    return true;
  }
  function kacPuf(d, kd, x, y) {
    efektEkle(d, 'parilti', kd.x, kd.y, 1.0);
    kd.x = x; kd.y = y;
    efektEkle(d, 'parilti', x, y, 1.0);
  }
  function kacamakBitir(d, kd, ozel) {
    kd.gorunmez = 0; kd.kacamak = null; kd.mikrofonda = false; kd.hareket = false; mikYol = null; kacDonYol = null;
    kd.konusma = { metin: ozel || 'Döndüm! Kimse görmedi!', sure: 2 };
    kacAt = (d.zaman || 0) + 60 + Math.random() * 30;
    if (d.oyuncu) { sifirlaIz(d.oyuncu); }
    G.olay('kacamak', { asama: 'bitti' });
  }
  function yolBoyunca(kd, yol, hiz, dt) {
    yolKirp(kd, yol);
    return git(kd, yol[0].x, yol[0].y, hiz, dt) && yol.length === 1;
  }
  // Park / okul anons sistemi: hoparlörler parkta / okulda yankılanır (kedi sese koşar, nöbetçiler merak eder)
  function anonsYayinla(d, m) {
    var hp = H().hoparlorler || [];
    if (!hp.length) return;
    d.anons = { t: 0, omur: 3.6, metin: anonsB().soz || '', noktalar: hp.map(function (q) { return { x: q.x, y: q.y }; }) };
    hp.forEach(function (q) { G.gurultuYap(q.x, q.y, 520, 'anons'); });
    G.olay('anons', { x: m.x, y: m.y, hoparlor: hp.length });
  }
  function kacamakGuncelle(dt, d) {
    if (d.anons) { d.anons.t += dt; if (d.anons.t >= d.anons.omur) d.anons = null; }
    var kd = d.kardesler && d.kardesler[0], o = d.oyuncu;
    if (!kd || !o) return;
    if (!kd.kacamak) {
      if (!(kacZorla || d.zaman >= kacAt)) return;
      if (!kacamakKosul(d)) return;
      kacZorla = false;
      kacamakBaslat(d);
      return;
    }
    var m = mikYeri();
    kd.gorunmez = Math.max(0, kd.gorunmez - dt);
    kacT += dt;
    if (!m) { kacamakBitir(d, kd, 'Vazgeçtim...'); return; }
    if (kd.kacamak === 'gidiyor') {
      if (mikYol && mikYol.length) { if (yolBoyunca(kd, mikYol, 200, dt)) mikYol = null; }
      var varis = !mikYol || Math.hypot(m.x - kd.x, m.y - kd.y) < 14;
      if (varis || kacT > 30) {
        if (!varis) kacPuf(d, kd, m.x, m.y);
        kd.x = m.x; kd.y = m.y; kd.yon = m.yon != null ? m.yon : kd.yon;
        kd.mikrofonda = true; kd.hareket = false; kd.kacamak = 'bagiriyor'; kacBekle = 1.5;
        kd.konusma = { metin: anonsB().soz || 'ALOOOO! GÜNAYDIIIN!', sure: 2.4 };
        G.olay('mikrofon', { x: m.x, y: m.y });
        G.gurultuYap(m.x, m.y, 700, 'esya');
        anonsYayinla(d, m);
        G.olay('kacamak', { asama: 'bagiriyor' });
      }
    } else if (kd.kacamak === 'bagiriyor') {
      kacBekle -= dt; kd.hareket = false; kd.adimFaz += dt * 10;
      if (kacBekle <= 0) {
        kd.mikrofonda = false; kd.kacamak = 'donuyor'; kacDonYol = null; mikYolT = 0; kacT = 0;
        kd.konusma = { metin: 'Hihi, kaçıyorum!', sure: 1.5 };
        G.olay('kacamak', { asama: 'donuyor' });
      }
    } else if (kd.kacamak === 'donuyor') {
      var mo = Math.hypot(o.x - kd.x, o.y - kd.y);
      if (mo <= 50) { kacamakBitir(d, kd); return; }
      if (kd.gorunmez <= 1) {   // yedek: puf ile Ogeday'ın yanına
        var ac = (o.yon || 0) + Math.PI;
        kacPuf(d, kd, o.x + Math.cos(ac) * 30, o.y + Math.sin(ac) * 30);
        kacamakBitir(d, kd, 'Puf! Döndüm!');
        return;
      }
      mikYolT -= dt;
      if (!kacDonYol || mikYolT <= 0) {
        mikYolT = 0.5;
        var yl = null;
        try { yl = H().yolBul ? H().yolBul(kd.x, kd.y, o.x, o.y, true) : null; } catch (e) { yl = null; }
        kacDonYol = (yl && yl.length) ? yl : [{ x: o.x, y: o.y }];
      }
      yolBoyunca(kd, kacDonYol, 220, dt);
    }
  }

  function guncelle(dt, d) {
    if (!d || d.mod !== 'oyun') return;
    if (!d.kardesler) init(d, true);
    if (G.girdi && G.girdi.al('gokce')) gokceCagir(d);
    if (d.oyuncu) sihirGuncelle(dt, d);
    takipEt(dt, d);
    gokceGuncelle(dt, d);
    kazaGuncelle(dt, d);
    kacamakGuncelle(dt, d);
  }

  return {
    init: init, guncelle: guncelle, gokceCagir: gokceCagir, gokceAktif: gokceAktif, gokceBitir: gokceBitir,
    kacamakAktif: kacamakAktif,
    _kacamakHemen: function () { if (!G.d) return false; kacZorla = true; return true; },
    _kazaHemen: function () { if (!G.d || G.d.kaza || !kazaVar()) return false; kazaZorla = true; return true; }
  };
})();
