window.G = window.G || {};
(function () {
  G.TILE = 48;
  var dinleyiciler = {};
  G.dinle = function (ad, fn) { (dinleyiciler[ad] = dinleyiciler[ad] || []).push(fn); };
  G.olay = function (ad, veri) {
    if (ad === 'yakalandi' && G.minikMi && G.minikMi()) return;
    (dinleyiciler[ad] || []).forEach(function (fn) {
      try { fn(veri || {}); } catch (h) { console.error('olay ' + ad, h); }
    });
  };
  G.mesafe = function (a, b) { return Math.hypot(a.x - b.x, a.y - b.y); };
  G.gurultuYap = function (x, y, guc, kaynak) {
    if (G.d) G.d.sesler.push({ x: x, y: y, guc: guc, omur: 0.6, kaynak: kaynak || 'oyuncu', kat: (G.harita && G.harita.katOf) ? G.harita.katOf(y) : 0 });
  };
  G.mesaj = function (metin, sure) { if (G.d) G.d.mesaj = { metin: metin, sure: sure || 2.5 }; };

  var canvas = document.getElementById('oyun');
  var ctx = canvas.getContext('2d');
  var testModu = /[?&]test=1/.test(location.search);

  function guvenli(ad, fn) {
    try { fn(); } catch (h) { console.error(ad, h); }
  }

  var cizimHazir = false;
  function cizimYenile() {
    if (cizimHazir && G.cizim && G.cizim.yenile) guvenli('cizim.yenile', function () { G.cizim.yenile(); });
  }
  // koru: bölüm geçişinde korunacak sayaçlar {yakalanma, oncekiSure}
  function yeniDurum(koru) {
    koru = koru || {};
    G.d = {
      mod: 'menu', zaman: 0, oncekiSure: koru.oncekiSure || 0,
      sureLimiti: (G.bolumBilgi && G.bolumBilgi().sure) || 180, ekSureHakki: (G.bolumBilgi && G.bolumBilgi().ekSure) || 60, ekSure: 0, sureBitti: false, aramaSon: 0,
      ekran: { w: 0, h: 0, dpr: 1 },
      kamera: { x: 0, y: 0, olcek: 1 },
      oyuncu: null, komsu: null,
      sesler: [], firlatilanlar: [], mesaj: null,
      yakalanma: koru.yakalanma || 0, bolumYak0: koru.yakalanma || 0, ekKullandi: false, yildiz: 0, istatistik: { sure: 0 }
    };
    boyutla();
    guvenli('harita.init', function () { G.harita.init(G.bolum); });
    cizimYenile();
    guvenli('oyuncu.init', function () { G.oyuncu.init(G.d, false); });
    guvenli('kardesler.init', function () { G.kardesler.init(G.d, false); });
    guvenli('komsu.init', function () { G.komsu.init(G.d, false); });
    guvenli('kedi.init', function () { if (G.kedi) G.kedi.init(G.d, false); });
    uyananInit();
    guvenli('misafir.init', function () { if (G.misafir) G.misafir.init(G.d, false); });
    guvenli('avm.init', function () { if (G.avm) G.avm.init(G.d); });
    guvenli('bebek.init', function () { if (G.bebek) G.bebek.init(G.d, false); });
    kameraTakip(1);
  }
  // Bölüm başında hikâyenin ilk satırı TEK kısa tost olarak gösterilir (menüden hikâye kalktı)
  function hikayeTost() { try { var b = G.bolumBilgi(); if (b && b.hikaye && b.hikaye[0]) G.mesaj(b.hikaye[0], 4.8); } catch (h) { } }
  function uyananInit() {
    if (G.uyanan && G.uyanan.init) guvenli('uyanan.init', function () { G.uyanan.init(G.d); });
  }

  function boyutla() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth, h = window.innerHeight;
    // Telefon dikey görünüyorsa (çoğu zaman döndürme kilidi açık, tarayıcı yan çevirmeyi algılamıyor):
    // beklemeden oyunu 90° döndürülmüş çiz; telefon yan çevrilince görüntü düz olur. Dokunuşlar arayuz.js konum()'da çevrilir.
    var donuk = !!(G.tamEkran && G.tamEkran.mobil && h > w);
    if (donuk !== !!G.donuk && donuk && G.tamEkran && G.tamEkran.donIpucu) G.tamEkran.donIpucu();
    G.donuk = donuk;
    var kok = document.documentElement;
    kok.classList.toggle('donuk', donuk);
    kok.style.setProperty('--ekW', w + 'px'); kok.style.setProperty('--ekH', h + 'px');
    if (donuk) { var tmp = w; w = h; h = tmp; }
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    if (G.d) {
      G.d.ekran = { w: w, h: h, dpr: dpr };
      // ~ 20 x 13 karo görünsün
      G.d.kamera.olcek = Math.max(0.55, Math.min(w / (G.TILE * 20), h / (G.TILE * 13)));
    }
  }
  window.addEventListener('resize', boyutla);

  function kameraTakip(oran) {
    var d = G.d, o = d.oyuncu;
    if (!o) return;
    var k = d.kamera, gw = d.ekran.w / k.olcek, gh = d.ekran.h / k.olcek;
    var hx = o.x - gw / 2, hy = o.y - gh / 2;
    var dw = (G.harita.W || 40) * G.TILE, dh = (G.harita.H || 30) * G.TILE;
    hx = gw >= dw ? (dw - gw) / 2 : Math.max(0, Math.min(dw - gw, hx));
    hy = gh >= dh ? (dh - gh) / 2 : Math.max(0, Math.min(dh - gh, hy));
    k.x += (hx - k.x) * oran; k.y += (hy - k.y) * oran;
  }

  G.dinle('baslat', function (v) {
    if (G.d.mod !== 'menu') return;
    if (v && v.bolum && v.bolum !== G.bolum && G.bolumler[v.bolum]) { G.bolum = v.bolum; yeniDurum(); }
    G.d.mod = 'oyun'; G.girdi.temizle();
    hikayeTost();
  });
  G.dinle('duraklat', function () {
    if (G.d.mod === 'oyun') G.d.mod = 'duraklat';
    else if (G.d.mod === 'duraklat') G.d.mod = 'oyun';
  });
  G.dinle('yakalandi', function () {
    if (G.d.mod !== 'oyun') return;
    G.d.mod = 'yakalandi'; G.d.yakalanma++;
  });
  G.dinle('devam', function () {
    if (G.d.mod !== 'yakalandi') return;
    var sureYeni = !!(G.d.sonYakalanma && G.d.sonYakalanma.sebep === 'sure');
    if (sureYeni) {
      // SÜRE DOLDU: bölüm baştan, anahtarlar sıradaki aday noktaya geçer, envanter temizlenir
      G.d.zaman = 0; G.d.ekSure = 0; G.d.sureBitti = false; G.d.aramaSon = 0; G.d.zilT = null;
      guvenli('harita.yeniDeneme', function () { G.harita.yeniDeneme(); });
    }
    G.d.sonYakalanma = null;
    guvenli('oyuncu.init', function () { G.oyuncu.init(G.d, !sureYeni); });
    guvenli('kardesler.init', function () { G.kardesler.init(G.d, true); });
    guvenli('komsu.init', function () { G.komsu.init(G.d, true); });
    guvenli('kedi.init', function () { if (G.kedi) G.kedi.init(G.d, true); });
    uyananInit();
    guvenli('misafir.init', function () { if (G.misafir) G.misafir.init(G.d, true); });
    guvenli('avm.init', function () { if (G.avm) G.avm.init(G.d); });
    guvenli('bebek.init', function () { if (G.bebek) G.bebek.init(G.d, true); });
    G.d.sesler = []; G.d.firlatilanlar = [];
    kameraTakip(1);
    G.d.mod = 'oyun'; G.girdi.temizle();
  });
  // Yıldız: 1 = bitirdin; 2 = bu bölümde 2'den az yakalanma; 3 = hiç yakalanmadan ve ek süreye kalmadan, ya da 3 çıkartmanın hepsi.
  function yildizHesapla(d) {
    var yak = d.yakalanma - (d.bolumYak0 || 0), tl = (G.harita && G.harita.toplanabilir) || [], say = 0, top = 0;
    for (var i = 0; i < tl.length; i++) if (tl[i].cikartma) { top++; if (tl[i].alindi) say++; }
    var y = 1;
    if (yak < 2) y = 2;
    if ((yak === 0 && !d.ekKullandi) || (top > 0 && say >= top)) y = 3;
    d.yildiz = y; d.bolumYakalanma = yak; d.cikartmaSay = say; d.cikartmaToplam = top;
    d.yildizEski = G.kayit ? G.kayit.yildiz(G.bolum) : 0;
    if (G.kayit) G.kayit.yildizYaz(G.bolum, y);
    G.olay('yildiz_hesaplandi', { bolum: G.bolum, yildiz: y, yakalanma: yak, cikartma: say });
  }
  G.dinle('kazandi', function () {
    if (G.d.mod !== 'oyun') return;
    G.d.istatistik.sure = G.d.oncekiSure + G.d.zaman;
    guvenli('yildiz', function () { yildizHesapla(G.d); });
    if (G.bolum < G.SON_BOLUM) {
      G.d.mod = 'bolumBitti';
      if (G.ilerleme) G.ilerleme.kaydet();
    } else G.d.mod = 'kazandi';
  });
  G.dinle('sonrakiBolum', function () {
    var d = G.d;
    if (d.mod !== 'bolumBitti' || G.bolum >= G.SON_BOLUM) return;
    var koru = { yakalanma: d.yakalanma, oncekiSure: d.oncekiSure + d.zaman };
    G.bolum++;
    yeniDurum(koru);
    G.d.mod = 'oyun'; G.girdi.temizle();
    hikayeTost();
  });
  G.dinle('yeniden', function () {
    if (G.d.mod !== 'kazandi') return;
    G.bolum = 1;
    yeniDurum();
    G.d.mod = 'oyun'; G.girdi.temizle();
    hikayeTost();
  });

  // Titreşim (varsa): anahtar/top bulununca kısa, yakalanınca üç vuruş. Ses ayarından bağımsız.
  G.titret = function (desen) { try { if (navigator.vibrate) navigator.vibrate(desen); } catch (h) { } };
  G.dinle('esya_al', function (v) { if (v && (v.tur === 'anahtar_mavi' || v.tur === 'anahtar_kirmizi' || v.tur === 'top_hazine')) G.titret(40); });
  G.dinle('yakalandi', function () { G.titret([60, 40, 60]); });
  try { if (G.logo && G.logo.favicon) G.logo.favicon(); } catch (h) { }

  var onceki = 0;
  function dongu(t) {
    var dt = Math.min(0.05, (t - onceki) / 1000 || 0);
    onceki = t;
    G.adim(dt, true);
    requestAnimationFrame(dongu);
  }

  G.adim = function (dt, cizilsin) {
    var d = G.d;
    G.girdi.guncelle();
    // Dikey telefon: oyun duraklar, yataya dönünce kaldığı yerden sürer (yalnız mobil cihazda).
    var dk = false;   // dikeyde artık durmuyoruz: G.donuk ile döndürülmüş çizilir (boyutla)
    G.dikey = dk;
    if (dk && d.mod === 'oyun') { d.mod = 'duraklat'; d.dikeyDur = true; }
    else if (!dk && d.dikeyDur) { if (d.mod === 'duraklat') d.mod = 'oyun'; d.dikeyDur = false; G.girdi.temizle(); }
    if (G.girdi.al('duraklat')) { if (G.ayarlar && G.ayarlar.acik) G.ayarlar.kapat(); else if (!dk) G.olay('duraklat'); }

    if (d.mod === 'oyun') {
      d.zaman += dt;
      // Bölüm süresi (bolum.js sure) + ilk aşımda ek süre (nazik uyarı); ikinci aşımda 'SÜRE DOLDU'.
      var limit = (d.sureLimiti || 180) + (d.ekSure || 0);
      if (!G.minikMi() && !d.sureBitti && d.zaman >= limit) {
        if (!d.ekSure) {
          d.ekSure = d.ekSureHakki || 60; d.ekKullandi = true;
          d.mesaj = { metin: 'Biraz daha süre verdim, acele et!', sure: 3.6 };
          if (G.ses && G.ses.cal) guvenli('ses', function () { G.ses.cal('uyari'); });
        } else {
          d.sureBitti = true;
          d.sonYakalanma = { sebep: 'sure' };
          d.mod = 'yakalandi';
        }
      }
      guvenli('oyuncu', function () { G.oyuncu.guncelle(dt, d); });
      if (d.mod === 'oyun') guvenli('kardesler', function () { G.kardesler.guncelle(dt, d); });
      if (d.mod === 'oyun') guvenli('komsu', function () { G.komsu.guncelle(dt, d); });
      if (d.mod === 'oyun' && G.kedi) guvenli('kedi', function () { G.kedi.guncelle(dt, d); });
      if (d.mod === 'oyun' && G.uyanan && G.uyanan.guncelle) guvenli('uyanan', function () { G.uyanan.guncelle(dt, d); });
      if (d.mod === 'oyun' && G.misafir) guvenli('misafir', function () { G.misafir.guncelle(dt, d); });
      if (d.mod === 'oyun' && G.avm) guvenli('avm', function () { G.avm.guncelle(dt, d); });
      if (d.mod === 'oyun' && G.bebek) guvenli('bebek', function () { G.bebek.guncelle(dt, d); });
      for (var i = d.sesler.length - 1; i >= 0; i--) {
        d.sesler[i].omur -= dt;
        if (d.sesler[i].omur <= 0) d.sesler.splice(i, 1);
      }
      if (d.mesaj) { d.mesaj.sure -= dt; if (d.mesaj.sure <= 0) d.mesaj = null; }
      kameraTakip(Math.min(1, dt * 8));
    } else {
      G.girdi.al('etkilesim'); G.girdi.al('firlat'); G.girdi.al('gokce');
    }
    guvenli('ses', function () { G.ses.guncelle(dt, d); });
    guvenli('arayuz.guncelle', function () { G.arayuz.guncelle(dt, d); });

    if (!cizilsin) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#1b2a1e';
    if (G.ucBoyut) ctx.clearRect(0, 0, canvas.width, canvas.height);
    else ctx.fillRect(0, 0, canvas.width, canvas.height);
    guvenli('cizim', function () { G.cizim.ciz(ctx, d); });
    guvenli('arayuz.ciz', function () { G.arayuz.ciz(ctx, d); });
  };

  var bm = location.search.match(/[?&]bolum=(\d+)/);
  if (bm && G.bolumler[+bm[1]]) G.bolum = +bm[1];
  yeniDurum();
  guvenli('cizim.init', function () { G.cizim.init(canvas); });
  cizimHazir = true; cizimYenile();
  guvenli('ses.init', function () { G.ses.init(); });
  guvenli('arayuz.init', function () { G.arayuz.init(G.d); });
  if (testModu) G.d.mod = 'oyun';
  if (!/[?&]elle=1/.test(location.search)) requestAnimationFrame(function (t) { onceki = t; dongu(t); });
})();
