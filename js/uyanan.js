window.G = window.G || {};
// Uyanan ebeveyn (EK-6/EK-7): mikrofon olayıyla yataktan kalkar, mikrofona bakar, dolaşır, yatağa döner.
// Kendi kodu; komsu.js'e bağımlı değil. d.uyanan, d.komsu ile aynı alanlara sahiptir.
(function () {
  var T = 48;
  var u = null, s = null, kuruldu = false;
  var HIZ = { suphe: 90, devriye: 90, kovalama: 160, yorgun: 70 };
  var GENEL_SURE = 70; // güvenlik: bu kadar sn'den uzun sürerse yatağa ışınlan

  var SOZ = {
    kovala: { ogretmen: 'Koşmak yok, tatlım!', mudur: 'Gel bakalım evladım!', baba: 'Ogeday! Hemen buraya gel!', anne: 'Durun bakalım! Yatma vakti geçti!', dede: 'Gel kuzum gel!', ebe: 'Aman yavrum düşeceksin!', bekci: 'Dur orada! Park kuralları!', bekci2: 'Dur bakalım kuzu kuşum!' },
    yakala: { ogretmen: 'Yakaladım! Koşmak yok, tatlım!', mudur: 'Gel bakalım, hikâye okuyalım!', baba: 'Yakaladım! Gıdı gıdı gıdı!', anne: 'Yakaladım! Hadi bakalım, öpücük cezası!', dede: 'Gel bakalım kuzum! Yanaklarını sıkayım!', ebe: 'Yakaladım! Hadi kurabiye ye bakalım!', bekci: 'Yakaladım! Parkın dışına çıkarıyorum seni!', bekci2: 'Yakaladım! Hadi seni kapıya götüreyim!' },
    bakin: { ogretmen: 'Zil mi çaldı? Kim var orada?', mudur: 'Anons da kimdi? Kim var orada?', baba: 'Kim var burada?', anne: 'Çocuklar? Orada mısınız?', dede: 'Gözlüğüm nerede... kim var?', ebe: 'Kurabiye mi çalındı yoksa?', bekci: 'Kim var orada? Park kapanıyor!', bekci2: 'Hıh? Kim o?' },
    kayip: { ogretmen: 'Nereye saklandı bu tatlı yaramaz?', mudur: 'Nereye gitti bu evlat?', baba: 'Nereye kayboldu bu yaramaz?', anne: 'Nereye saklandınız bakalım?', dede: 'Nereye gitti bu kuzu?', ebe: 'Nereye saklandı bu yavru?', bekci: 'Nereye saklandı bu yaramaz çocuk?', bekci2: 'Nereden çıktı bu kuzu kuş?' }
  };

  SOZ.kovala.dedehassi = 'Gel kuzum gel, sarılacağım!'; SOZ.yakala.dedehassi = 'Yakaladım seni! Gıdı gıdı gıdı!';
  SOZ.bakin.dedehassi = 'Diafondan kim bağırdı? Gözlüğüm nerede?'; SOZ.kayip.dedehassi = 'Nereye gitti bu kuzu?';
  SOZ.kovala.morayi = 'Ayı sarılması geliyor!'; SOZ.yakala.morayi = 'Buldum! Kocaman sarılma!'; SOZ.bakin.morayi = 'Köy çanı mı çaldı?'; SOZ.kayip.morayi = 'Nereye saklandın minik dost?';
  SOZ.kovala.avmgorevli = 'Çak bir beşlik!'; SOZ.yakala.avmgorevli = 'Buldum! Al sana bir çıkartma!';
  function tekKisi() { try { return !!(G.bolumBilgi && G.bolumBilgi().tekKisi); } catch (e) { return false; } }
  function zor() { try { return (G.bolumBilgi && G.bolumBilgi().zorluk) || null; } catch (e) { return null; } }
  function anonsB() { try { return (G.bolumBilgi && G.bolumBilgi().anons) || {}; } catch (e) { return {}; } }
  function hizK() { var z = zor(); return z && z.kovalama ? z.kovalama - 5 : HIZ.kovalama; }
  function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function aciNorm(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }
  function H() { return G.harita || {}; }
  function olay(ad, v) { if (G.olay) G.olay(ad, v || {}); }
  function Ad(kim) {
    if (G.kisiAdi) { try { var a = G.kisiAdi(kim); if (a) return a; } catch (e) { } }
    return { baba: 'Baba', anne: 'Anne', dede: 'Dede', ebe: 'Ebe' }[kim] || 'Baba';
  }
  function say(m, sure, zorla) {
    if (!u) return;
    if (!zorla && u.konusma && u.konusma.sure > 0) return;
    u.konusma = { metin: m, sure: sure || 2 };
  }
  function engel(x1, y1, x2, y2) {
    var h = H();
    if (!h.gorusEngeli) return false;
    try { return !!h.gorusEngeli(x1, y1, x2, y2); } catch (e) { return false; }
  }
  function dogrudanTemiz(x, y) {
    var dx = x - u.x, dy = y - u.y, L = Math.hypot(dx, dy) || 1;
    var nx = -dy / L * 12, ny = dx / L * 12;
    return !engel(u.x, u.y, x, y) && !engel(u.x + nx, u.y + ny, x + nx, y + ny) && !engel(u.x - nx, u.y - ny, x - nx, y - ny);
  }

  // ---------- yatak ----------
  function yatakMerkez() {
    var h = H(), e = h.esyalar || [];
    for (var i = 0; i < e.length; i++) if (e[i] && (e[i].tur === 'yatak' || e[i].tur === 'mudur_divani')) {
      var y = e[i];
      return { x: (y.tx + (y.w || 1) / 2) * T, y: (y.ty + (y.h || 1) / 2) * T, e: y };
    }
    var b = h.komsuBaslangic || { x: 5 * T, y: 5 * T };
    return { x: b.x, y: b.y, e: null };
  }
  function yatakYanlari() {
    var m = yatakMerkez(), y = m.e, out = [], i;
    if (!y) return [{ x: m.x, y: m.y }];
    var w = y.w || 1, hh = y.h || 1;
    for (i = 0; i < hh; i++) { out.push({ x: (y.tx - 0.5) * T, y: (y.ty + i + 0.5) * T }); out.push({ x: (y.tx + w + 0.5) * T, y: (y.ty + i + 0.5) * T }); }
    for (i = 0; i < w; i++) { out.push({ x: (y.tx + i + 0.5) * T, y: (y.ty + hh + 0.5) * T }); out.push({ x: (y.tx + i + 0.5) * T, y: (y.ty - 0.5) * T }); }
    var h = H();
    out = out.filter(function (p) { return !(h.kati && h.kati(Math.floor(p.x / T), Math.floor(p.y / T))); });
    out.sort(function (a, b) { return Math.hypot(a.x - m.x, a.y - m.y) - Math.hypot(b.x - m.x, b.y - m.y); });
    return out.length ? out : [{ x: m.x, y: m.y }];
  }
  function uyuyanKur(d, kim) {
    var m = yatakMerkez();
    d.uyuyan = { kim: kim, x: m.x, y: m.y, yon: Math.PI / 2 };
  }

  function yeniDurum() {
    return {
      faz: 'bak', zaman: 0, yol: null, yolI: 0, yolHedef: null, birak: false, takilma: 0,
      stuckT: 0, stuckX: 0, stuckY: 0, adimT: 0, bakinFaz: 0, bakinTemel: 0,
      acanlar: [], kapiIc: null,
      nokta: [], noktaI: 0, mic: null, yatakHedef: null,
      kayipT: 0, sasirT: 0, rpT: 0, sonGorulen: null, toplam: 0, yorgunDene: 0
    };
  }

  // ---------- yol ----------
  function yolSet(p) {
    s.yol = p; s.yolI = 0; s.takilma = 0; s.stuckT = 0; s.birak = false;
    if (p && p.length && !p[0].portal && Math.hypot(p[0].x - u.x, p[0].y - u.y) < 10) s.yolI = 1;
  }
  function yolHesapla(x, y) {
    var h = H(), p = null;
    s.yolHedef = { x: x, y: y };
    if (h.yolBul) { try { p = h.yolBul(u.x, u.y, x, y, true); } catch (e) { p = null; } }
    else if (dogrudanTemiz(x, y)) p = [{ x: x, y: y }];
    if (p && p.length) { yolSet(p); return true; }
    return false;
  }
  function yolKur(x, y) {
    if (yolHesapla(x, y)) return true;
    var rs = [T, T * 2];
    for (var ri = 0; ri < rs.length; ri++)
      for (var i = 0; i < 8; i++) {
        var a = i * Math.PI / 4;
        if (yolHesapla(x + Math.cos(a) * rs[ri], y + Math.sin(a) * rs[ri])) return true;
      }
    s.yol = null; s.yolHedef = null;
    return false;
  }
  function yolBitti() { return !s.yol || s.yolI >= s.yol.length; }

  function don(hedef, hiz, dt) {
    var f = aciNorm(hedef - u.yon), m = hiz * dt;
    u.yon = aciNorm(u.yon + clamp(f, -m, m));
  }

  // ---------- kapılar ----------
  function kapiKontrol(x, y) {
    var h = H();
    if (!h.kapiAt) return;
    var kp = h.kapiAt(Math.floor(x / T), Math.floor(y / T));
    if (kp && !kp.acik) {
      kp.acik = true; // kilitliyse de açıp geçer; kp.kilit değiştirilmez
      s.acanlar.push(kp);
      olay('kapi_ac', { kapi: kp });
    }
  }
  function kapiKapatKontrol() {
    var h = H();
    if (!h.kapiAt) return;
    var cur = h.kapiAt(Math.floor(u.x / T), Math.floor(u.y / T)) || null;
    if (s.kapiIc && cur !== s.kapiIc) {
      var kd = s.kapiIc, i = s.acanlar.indexOf(kd), benAcmis = i >= 0;
      if (benAcmis) s.acanlar.splice(i, 1);
      var o = G.d && G.d.oyuncu;
      var ustunde = o && Math.floor(o.x / T) === kd.tx && Math.floor(o.y / T) === kd.ty;
      // kilitli kapıyı açık bırakma (oyuncu anahtarsız geçmesin)
      if (kd.acik && !ustunde && u.durum !== 'kovalama' && kd.kilit && benAcmis) {
        kd.acik = false;
        olay('kapi_kapa', { kapi: kd });
      }
    }
    s.kapiIc = cur;
  }

  function adimAt(dt, hiz, hx, hy, donHizi) {
    if (s.portalBekle > 0) { s.portalBekle -= dt; u.hareket = false; return; }
    var dx = hx - u.x, dy = hy - u.y, L = Math.hypot(dx, dy);
    if (L < 0.001) return;
    var ux = dx / L, uy = dy / L, st = Math.min(hiz * dt, L);
    don(Math.atan2(uy, ux), donHizi || 6, dt);
    kapiKontrol(u.x + ux * (u.r + 8), u.y + uy * (u.r + 8));
    kapiKontrol(u.x, u.y);
    var h = H(), ox = u.x, oy = u.y;
    if (h.hareketEt) { try { h.hareketEt(u, ux * st, uy * st, true); } catch (e) { u.x += ux * st; u.y += uy * st; } }
    else { u.x += ux * st; u.y += uy * st; }
    u.hareket = true;
    u.adimFaz += Math.hypot(u.x - ox, u.y - oy) / 16;
    s.adimT += dt;
    if (s.adimT >= 0.45) {
      s.adimT = 0;
      olay('adim', { x: u.x, y: u.y, kosu: u.durum === 'kovalama', egik: false, kim: 'komsu' });
    }
    s.stuckT += dt;
    if (s.stuckT >= 1.5) {
      var ilerleme = Math.hypot(u.x - s.stuckX, u.y - s.stuckY);
      s.stuckT = 0; s.stuckX = u.x; s.stuckY = u.y;
      if (ilerleme < 22) takildi(); else s.takilma = 0;
    }
  }
  function takildi() {
    s.takilma++;
    if (s.takilma === 1 && s.yolHedef) { yolHesapla(s.yolHedef.x, s.yolHedef.y); s.takilma = 1; }
    else { s.takilma = 0; s.yol = null; s.birak = true; }
  }
  function yolTakip(dt, hiz, donHizi) {
    if (yolBitti()) return true;
    var guard = 0;
    while (s.yolI < s.yol.length && guard++ < 4) {
      var p = s.yol[s.yolI], son = s.yolI === s.yol.length - 1;
      if (Math.hypot(p.x - u.x, p.y - u.y) < (son ? 8 : 12)) {
        if (p.portal && H().portalGec) { H().portalGec(u, p); s.portalBekle = 0.4; s.stuckX = u.x; s.stuckY = u.y; s.stuckT = 0; }
        s.yolI++;
      } else break;
    }
    if (yolBitti()) return true;
    var q = s.yol[s.yolI];
    adimAt(dt, hiz, q.x, q.y, donHizi);
    return false;
  }
  function bakin(dt, hiz) {
    s.bakinFaz += dt;
    don(s.bakinTemel + Math.sin(s.bakinFaz * 1.5) * 1.1, hiz || 3, dt);
    u.hareket = false;
    s.stuckT = 0;
  }

  function durumDegis(yeni) {
    u.durum = yeni;
    s.faz = 'git'; s.yol = null; s.yolI = 0; s.birak = false; s.takilma = 0; s.stuckT = 0;
    s.stuckX = u.x; s.stuckY = u.y; s.zaman = 0;
  }

  // ---------- dolaşma noktaları ----------
  function noktaSec() {
    var h = H(), m = yatakMerkez(), out = [], tries = 0;
    var adaylar = [];
    // 1) devriye noktalarından yakın olanlar
    (h.devriye || []).forEach(function (p) {
      if (Math.hypot(p.x - m.x, p.y - m.y) < 520) adaylar.push({ x: p.x, y: p.y });
    });
    // 2) yatak çevresinde rastgele boş noktalar
    while (adaylar.length < 24 && tries++ < 120) {
      var a = Math.random() * Math.PI * 2, r = 60 + Math.random() * 440;
      var x = m.x + Math.cos(a) * r, y = m.y + Math.sin(a) * r;
      if (h.kati && h.kati(Math.floor(x / T), Math.floor(y / T))) continue;
      if (h.duvarMi && h.duvarMi(Math.floor(x / T), Math.floor(y / T))) continue;
      adaylar.push({ x: x, y: y });
    }
    // karıştır
    for (var i = adaylar.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = adaylar[i]; adaylar[i] = adaylar[j]; adaylar[j] = t; }
    // toplam süre ~25-35 sn kalsın: kısa bacaklar, yatağa yakın noktalar
    // Sözleşme: toplam ~25-35 sn → her zaman 3 durak. Önce sıkı, sonra gevşeyen kurallarla doldur.
    var yb = yatakYanlari()[0] || m;
    var kurallar = [[130, 380, 18, 520, 560], [90, 460, 26, 600, 760], [60, 700, 40, 800, 1100]];
    var prev = { x: u.x, y: u.y };
    for (var kr = 0; kr < kurallar.length && out.length < 3; kr++) {
      var K = kurallar[kr];
      for (i = 0; i < adaylar.length && out.length < 3; i++) {
        var c = adaylar[i];
        if (out.indexOf(c) >= 0) continue;
        var dd = Math.hypot(c.x - prev.x, c.y - prev.y);
        if (dd < K[0] || dd > K[1] || Math.hypot(c.x - m.x, c.y - m.y) > K[3]) continue;
        var yol = null;
        if (h.yolBul) { try { yol = h.yolBul(prev.x, prev.y, c.x, c.y, true); } catch (e) { yol = null; } }
        else yol = [c];
        if (!yol || !yol.length || yol.length > K[2]) continue;
        // yatağa dönüş yolu da kısa olsun (düz mesafe kısa ama dolambaçlı oda düzeni dönüşü 20 sn uzatıyordu)
        var geri = null, gu = 0;
        if (h.yolBul) { try { geri = h.yolBul(c.x, c.y, yb.x, yb.y, true); } catch (e2) { geri = null; } }
        if (geri) for (var gi = 0, gp = c; gi < geri.length; gi++) { gu += Math.hypot(geri[gi].x - gp.x, geri[gi].y - gp.y); gp = geri[gi]; }
        if (!geri || gu > K[4]) continue;
        out.push(c); prev = c;
      }
    }
    return out;
  }

  // ---------- görme ----------
  function goruyor(o) {
    if (G.minikSelam && G.minikSelam(u, o)) return false;
    if (!o || o.saklandi || o.korunan || (o.gorunmez > 0)) return false;
    if ((o.gorunurluk == null ? 1 : o.gorunurluk) <= 0) return false;
    var dist = Math.hypot(o.x - u.x, o.y - u.y);
    if (dist > u.gorusMesafe) return false;
    var a = Math.atan2(o.y - u.y, o.x - u.x);
    if (Math.abs(aciNorm(a - u.yon)) > u.gorusAci / 2 && dist > (u.durum === 'kovalama' ? 110 : 0)) return false;
    return !engel(u.x, u.y, o.x, o.y);
  }

  // ---------- aşamalar ----------
  function micHedef() {
    var h = H();
    if (h.mikrofonYeri) return { x: h.mikrofonYeri.x, y: h.mikrofonYeri.y };
    var m = yatakMerkez();
    return { x: m.x + T * 3, y: m.y };
  }
  function supheBasla() {
    durumDegis('suphe');
    s.mic = micHedef();
    s.bakinTemel = u.yon;
    olay('komsu_suphe', {});
  }
  function devriyeBasla() {
    durumDegis('devriye');
    u.uyari = 0;
    s.nokta = noktaSec(); s.noktaI = 0;
    s.faz = s.nokta.length ? 'git' : 'bitti';
  }
  function yorgunBasla() {
    durumDegis('yorgun');
    u.uyari = 0;
    s.yorgunDene = 0;
    var yl = yatakYanlari(), hd = null;
    for (var i = 0; i < yl.length; i++) {
      if (yolHesapla(yl[i].x, yl[i].y) && s.yol && s.yol.length) {
        var son = s.yol[s.yol.length - 1];
        if (Math.hypot(son.x - yl[i].x, son.y - yl[i].y) < 30) { hd = yl[i]; break; }
      }
    }
    s.yatakHedef = hd || yl[0];
    s.yorgunT = 0;
    say('Ben yatıyorum, yine bağıran olursa...', 3.5, true);
  }
  function kovalamaBasla() {
    var onceki = u.durum;
    durumDegis('kovalama');
    u.uyari = 1;
    s.kayipT = 0; s.rpT = 0; s.sasirT = 0.8;
    if (onceki !== 'kovalama') {
      olay('komsu_gordu', {});
      say(SOZ.kovala[u.kim] || 'HEY!', 2.2, true);
      u.konusma = { metin: 'HEY!', sure: 0.9 };
    }
  }
  function yakala(d) {
    if (G.minikSelam && G.minikSelam(u, G.d.oyuncu)) return;
    durumDegis('yakaladi');
    u.hareket = false; u.uyari = 1;
    say(SOZ.yakala[u.kim] || 'Yakaladım!', 3, true);
    d.sonYakalanma = { kim: u.kim, sebep: 'yakalandi' };
    olay('yakalandi', { kim: u.kim });
  }
  function yatagaYat(d) {
    var kim = u.kim, ad = Ad(kim);
    uyuyanKur(d, kim);
    d.uyanan = null; u = null; s = null;
    if (G.mesaj) G.mesaj(ad + ' yine uyudu.', 3);
    olay('yeniden_uyudu', { kim: kim });
  }

  // ---------- davranışlar ----------
  function supheDavran(dt) {
    if (s.faz === 'git') {
      if (s.birak) { s.faz = 'bak'; s.zaman = 3; s.bakinTemel = u.yon; s.birak = false; return; }
      if (!s.yol && !yolKur(s.mic.x, s.mic.y)) { s.faz = 'bak'; s.zaman = 3; s.bakinTemel = u.yon; return; }
      if (yolTakip(dt, HIZ.suphe, 6) || Math.hypot(s.mic.x - u.x, s.mic.y - u.y) < 45) {
        s.faz = 'bak'; s.zaman = 3; s.bakinTemel = Math.atan2(s.mic.y - u.y, s.mic.x - u.x); s.yol = null;
        say(anonsB().suphe || 'Bu mikrofon kendi kendine mi çalıştı?', 3, true);
      }
    } else {
      bakin(dt, 4);
      s.zaman -= dt;
      if (s.zaman <= 0) devriyeBasla();
    }
  }

  function devriyeDavran(dt) {
    // Sözleşme: toplam ~25-35 sn. Duraklar erken bittiyse (yakın noktalar) bakınarak bekle; geç kaldıysa kalan durakları atla.
    if (s.faz === 'bitti' || s.noktaI >= s.nokta.length) {
      if (s.toplam < 20 + (s.bekHedef = s.bekHedef || Math.random() * 4)) { u.hareket = false; bakin(dt, 3); return; }
      yorgunBasla(); return;
    }
    if (s.faz === 'git' && !s.yol && s.toplam > 21) { yorgunBasla(); return; }
    var nk = s.nokta[s.noktaI];
    if (s.faz === 'git') {
      if (s.birak) { s.noktaI++; s.birak = false; s.yol = null; return; }
      if (!s.yol && !yolKur(nk.x, nk.y)) { s.noktaI++; return; }
      if (yolTakip(dt, HIZ.devriye, 5)) {
        s.faz = 'bak'; s.zaman = 2; s.bakinTemel = u.yon; s.yol = null;
        say(SOZ.bakin[u.kim] || 'Kim var burada?', 2, false);
      }
    } else {
      bakin(dt, 3);
      s.zaman -= dt;
      if (s.zaman <= 0) { s.noktaI++; s.faz = 'git'; s.yol = null; }
    }
  }

  // Sözleşme ~25-35 sn: yatağa erken varırsa esneyip biraz bekler (ani kaybolmasın)
  function yatBekle(dt, d) { if (s.toplam < 24) { u.hareket = false; s.yol = null; bakin(dt, 2); s.yorgunDene = 0; return; } yatagaYat(d); }

  function yorgunDavran(dt, d) {
    var hd = s.yatakHedef;
    s.yorgunT += dt;
    if (!hd || s.yorgunT > 45) { yatagaYat(d); return; }
    if (Math.hypot(hd.x - u.x, hd.y - u.y) < 22) { yatBekle(dt, d); return; }
    if (s.birak || !s.yol) {
      s.birak = false; s.yorgunDene++;
      if (s.yorgunDene > 4 || !yolKur(hd.x, hd.y)) { yatagaYat(d); return; }
    }
    if (yolTakip(dt, HIZ.yorgun, 4)) {
      s.yol = null;
      if (Math.hypot(hd.x - u.x, hd.y - u.y) < 110) { yatBekle(dt, d); return; }
      s.yorgunDene++;
      if (s.yorgunDene > 4) yatagaYat(d);
    }
  }

  function kovalamaDavran(dt, d, o, gor, dist) {
    u.uyari = 1;
    if (s.sasirT > 0) {
      s.sasirT -= dt; u.hareket = false;
      if (o && !o.saklandi && !(o.gorunmez > 0)) { don(Math.atan2(o.y - u.y, o.x - u.x), 8, dt); s.sonGorulen = { x: o.x, y: o.y }; }
      return;
    }
    var temas = o && !o.saklandi && !o.korunan && !(o.gorunmez > 0) && dist < 34 && !engel(u.x, u.y, o.x, o.y);
    if (temas) { yakala(d); return; }
    if (gor) {
      s.kayipT = 0;
      s.sonGorulen = { x: o.x, y: o.y };
      if (dogrudanTemiz(o.x, o.y)) { s.yol = null; adimAt(dt, hizK(), o.x, o.y, 12); }
      else {
        s.rpT -= dt;
        if (s.rpT <= 0 || !s.yol || s.birak) { s.rpT = 0.4; s.birak = false; if (!yolHesapla(o.x, o.y)) yolKur(o.x, o.y); }
        if (s.yol && yolTakip(dt, hizK(), 12)) s.yol = null;
      }
      return;
    }
    // görüş kaybı: son görülen yere git, 3 sn sonra bırak
    s.kayipT += dt;
    if (s.kayipT >= 3) {
      say(SOZ.kayip[u.kim] || 'Nereye gitti?', 2.5, true);
      devriyeBasla();
      return;
    }
    if (s.sonGorulen) {
      if (Math.hypot(s.sonGorulen.x - u.x, s.sonGorulen.y - u.y) > 20) {
        if (dogrudanTemiz(s.sonGorulen.x, s.sonGorulen.y)) adimAt(dt, hizK(), s.sonGorulen.x, s.sonGorulen.y, 10);
        else {
          if (!s.yol || s.birak) { s.birak = false; yolKur(s.sonGorulen.x, s.sonGorulen.y); }
          if (s.yol && yolTakip(dt, hizK(), 10)) s.yol = null;
        }
      } else { u.hareket = false; s.bakinTemel = u.yon; bakin(dt, 4); }
    }
  }

  // ---------- genel ----------
  function uyandir(d, e) {
    if (!d || !d.uyuyan || d.uyanan) return;
    try { if (G.bolumBilgi().uyananYok) return; } catch (e0) { }   // bebek bölümü: uyanmayı bebek.js yönetir
    var kim = d.uyuyan.kim, yl = yatakYanlari(), p = yl[0];
    u = d.uyanan = {
      x: p.x, y: p.y, r: 17, yon: Math.PI / 2, hareket: false,
      durum: 'uyaniyor', kim: kim, uyari: 0, gorusAci: ((zor() && zor().gorusAci) || 1.2) - 0.1, gorusMesafe: ((zor() && zor().gorus) || 320) - 20,
      adimFaz: 0, konusma: null
    };
    d.uyuyan = null;
    s = yeniDurum();
    s.stuckX = u.x; s.stuckY = u.y; s.faz = 'uyan'; s.zaman = 1.5;
    var mh = micHedef();
    u.yon = Math.atan2(mh.y - u.y, mh.x - u.x);
    say('Hıı?! Kim bağırdı?!', 2, true);
    if (G.mesaj) G.mesaj('Atılay ' + (anonsB().uyandi || 'mikrofona bağırdı') + '! ' + Ad(kim) + ' uyandı!', 3.5);
    olay('uyandi', { kim: kim });
  }

  function init(d) {
    if (d && d.uyanan) {
      // yakalanma / yeni oyun: uyanan yatağa geri konur
      var kim = d.uyanan.kim;
      d.uyanan = null;
      if (!tekKisi()) uyuyanKur(d, kim);
    }
    if (d) d.uyanan = null;
    u = null; s = null;
    if (!kuruldu && G.dinle) {
      kuruldu = true;
      G.dinle('mikrofon', function (e) { if (G.d) uyandir(G.d, e); });
      G.dinle('kat_gecti', function (v) {   // kovalarken çocuğun merdivene bindiğini gördüyse peşinden gider
        if (!u || !s || !G.d || G.d.uyanan !== u || u.durum !== 'kovalama') return;
        if (Math.hypot(v.x0 - u.x, v.y0 - u.y) < u.gorusMesafe && !engel(u.x, u.y, v.x0, v.y0)) { s.sonGorulen = { x: v.x1, y: v.y1 }; s.kayipT = 0; }
      });
    }
  }

  function guncelle(dt, d) {
    if (!d || !d.uyanan) return;
    if (u !== d.uyanan) { u = d.uyanan; if (!s) { s = yeniDurum(); s.stuckX = u.x; s.stuckY = u.y; } }
    var o = d.oyuncu;
    u.hareket = false;
    if (u.konusma) { u.konusma.sure -= dt; if (u.konusma.sure <= 0) u.konusma = null; }
    if (u.durum === 'yakaladi') return;
    s.toplam += dt;
    if (s.toplam > GENEL_SURE && u.durum !== 'kovalama') { yatagaYat(d); return; }

    // Dost ayının çağrısında oyuncuyu kovalamak yerine ayıyı takip et.
    if (s.yardim) {
      var yd = s.yardim; yd.sure -= dt; yd.yolT -= dt;
      if (yd.sure <= 0 || yd.hedef.bitti) { s.yardim = null; u.oyalaniyor = false; devriyeBasla(); return; }
      u.uyari = 0; u.oyalaniyor = true;
      if (Math.hypot(u.x-yd.hedef.x,u.y-yd.hedef.y)>40) {
        if (yd.yolT<=0) { yd.yolT=.5; s.birak=false; yolKur(yd.hedef.x,yd.hedef.y); }
        if (s.yol) yolTakip(dt, HIZ.kovalama, 6);
      }
      kapiKapatKontrol(); return;
    }
    if (u.durum === 'uyaniyor') {
      s.zaman -= dt;
      u.hareket = false;
      if (s.zaman <= 0) supheBasla();
      return;
    }

    if (u.durum === 'yorgun') {
      u.uyari = 0;
      yorgunDavran(dt, d);
      if (u) kapiKapatKontrol();
      return;
    }

    var gor = goruyor(o);
    var dist = o ? Math.hypot(o.x - u.x, o.y - u.y) : 1e9;
    if (u.durum !== 'kovalama') {
      if (gor) {
        var gz = o.gorunurluk == null ? 1 : o.gorunurluk;
        u.uyari += 1.25 * gz * dt; // ~0.8 sn
        s.sonGorulen = { x: o.x, y: o.y };
      } else u.uyari -= 0.3 * dt;
      u.uyari = clamp(u.uyari, 0, 1);
      if (u.uyari >= 1) { if (!G.kovalamaIzni || G.kovalamaIzni(d, 'uyanan')) kovalamaBasla(); else u.uyari = 0.99; }
    }

    switch (u.durum) {
      case 'suphe': supheDavran(dt); break;
      case 'devriye': devriyeDavran(dt); break;
      case 'kovalama': kovalamaDavran(dt, d, o, gor, dist); break;
    }
    if (u && d.uyanan === u) kapiKapatKontrol();
  }

  function oyala(hedef, sure) {
    if (!u || !s || u.kim !== 'morayi' || u.durum === 'yakaladi') return false;
    durumDegis('suphe'); s.yardim={hedef:hedef,sure:sure||14,yolT:0}; u.oyalaniyor=true; u.uyari=0;
    say('Super Bear! Birlikte oynayalım!',2.5,true); return true;
  }
  function ihbar(x, y) {
    if (!u || !s || s.yardim || u.kim !== 'morayi' || /yorgun|yakaladi|kovalama/.test(u.durum)) return false;
    supheBasla(); s.mic = { x: x, y: y }; say('Beatrice gördü mü? Bir bakayım!', 2, true); return true;
  }
  G.uyanan = { oyala: oyala, ihbar: ihbar, init: init, guncelle: guncelle, uyandir: function (d) { uyandir(d || G.d); }, _durum: function () { return s; } };
})();
