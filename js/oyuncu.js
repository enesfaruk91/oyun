window.G = window.G || {};
G.oyuncu = (function () {
  var T = 48;
  var YURU = 140, KOS = 215, EGIL = 75;
  var ETKI_MESAFE = 56;
  var ENV_MAX = 6, ATILABILIR_MAX = 4;
  var YERCEKIMI = 900, FIRLAT_VZ = 260, FIRLAT_Z0 = 24, FIRLAT_MENZIL = 260;

  var AD = {
    elma: 'Elma', teneke: 'Teneke kutu', oyuncak_ordek: 'Oyuncak ördek', kurabiye: 'Kurabiye', cingirak: 'Çıngırak', pelus: 'Peluş ayı', oyuncak_top: 'Oyuncak top',
    anahtar_mavi: 'Mavi anahtar', anahtar_kirmizi: 'Kırmızı anahtar', top_hazine: "Ogeday'ın topu"
  };
  var ILGI = { // -i hâli (eşyayı al)
    elma: 'Elmayı', teneke: 'Teneke kutuyu', oyuncak_ordek: 'Oyuncak ördeği', kurabiye: 'Kurabiyeyi', cingirak: 'Çıngırağı', pelus: 'Peluş ayıyı', oyuncak_top: 'Oyuncak topu',
    anahtar_mavi: 'Mavi anahtarı', anahtar_kirmizi: 'Kırmızı anahtarı', top_hazine: "Ogeday'ın topunu"
  };
  var SAKLAN_METIN = {
    dolap: 'Dolaba saklan', gardirop: 'Gardıroba saklan', yatak: 'Yatağın altına saklan',
    cali: 'Çalıya saklan', kutu: 'Kutuya saklan', cop_kutusu: 'Çöp kutusuna saklan',
    varil: 'Varile saklan', kopek_kulubesi: 'Kulübeye saklan', kanepe: 'Kanepenin arkasına saklan',
    masa: 'Masanın altına saklan', agac: 'Ağacın arkasına saklan', oyuncak_sandigi: 'Oyuncak sandığına saklan'
  };
  var SAKLAN_MESAJ = {
    dolap: 'Şşş... dolabın içindesin', gardirop: 'Şşş... gardırobun içindesin',
    yatak: 'Şşş... yatağın altı biraz tozlu', cali: 'Şşş... çalı seni gıdıklıyor',
    kutu: 'Şşş... kutunun içi dar ama güvenli', cop_kutusu: 'Şşş... hıh, bu ne koku?',
    varil: 'Şşş... varil içi yankılı', oyuncak_sandigi: 'Şşş... sandık oyuncak dolu, ama sığdın'
  };

  var idSayac = 0;
  var vx = 0, vy = 0, adimT = 0;
  var kayitKonum = null;

  function esyaAdi(tur) {
    if (AD[tur]) return AD[tur];
    var s = String(tur || '').replace(/_/g, ' ');
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function kilitOda(anahtar, yedek) {
    var b = G.bolumBilgi ? G.bolumBilgi() : null;
    return (b && b.kilitliOdalar && b.kilitliOdalar[anahtar]) || yedek;
  }
  function ilgiAdi(tur) { return ILGI[tur] || esyaAdi(tur); }
  function atilabilirMi(tur) { return !(/^anahtar/.test(tur) || tur === 'top_hazine'); }
  function H() { return G.harita || {}; }

  function kati(tx, ty) {
    var h = H();
    return h.kati ? !!h.kati(tx, ty) : false;
  }

  function init(d, envanteriKoru) {
    var onceki = (d.oyuncu && d.oyuncu.envanter) || [];
    var b = (H().oyuncuBaslangic) || { x: 100, y: 100 };
    d.oyuncu = {
      x: b.x, y: b.y, r: 14, yon: Math.PI / 2,
      hareket: false, kosuyor: false, egik: false,
      saklandi: null,
      envanter: envanteriKoru ? onceki.slice() : [],
      adimFaz: 0, yakindaki: null, gorunurluk: 1, aramaIl: 0, aramaN: null, katGecis: null
    };
    d.katPerde = 0;
    d.firlatilanlar = [];
    vx = 0; vy = 0; adimT = 0; kayitKonum = null;
  }

  // ---- geometri ----
  function rectYakin(px, py, e) {
    var x0 = e.tx * T, y0 = e.ty * T, x1 = x0 + (e.w || 1) * T, y1 = y0 + (e.h || 1) * T;
    var cx = Math.max(x0, Math.min(x1, px)), cy = Math.max(y0, Math.min(y1, py));
    return Math.hypot(px - cx, py - cy);
  }
  function rectMerkez(e) {
    return { x: (e.tx + (e.w || 1) / 2) * T, y: (e.ty + (e.h || 1) / 2) * T };
  }
  function karoMesafe(px, py, tx, ty) { // noktanın karo dikdörtgenine uzaklığı
    var cx = Math.max(tx * T, Math.min(tx * T + T, px)), cy = Math.max(ty * T, Math.min(ty * T + T, py));
    return Math.hypot(px - cx, py - cy);
  }

  // ---- hedef bulma ----
  function kapatilabilir(kapi, o, d) {
    if (karoMesafe(o.x, o.y, kapi.tx, kapi.ty) < o.r + 2) return false;
    var k = d.komsu;
    if (k && typeof k.x === 'number') {
      if (karoMesafe(k.x, k.y, kapi.tx, kapi.ty) < (k.r || 17) + 4) return false;
    }
    return true;
  }

  function hedefBul(o, d) {
    var h = H(), i, enYakin, enMes, m;
    if (o.saklandi) {
      return { tur: 'cik', metin: 'Dışarı çık', x: o.x, y: o.y, esya: o.saklandi };
    }
    // 1) toplanabilir
    var tp = h.toplanabilir || [];
    enYakin = null; enMes = ETKI_MESAFE + 1;
    for (i = 0; i < tp.length; i++) {
      if (!tp[i] || tp[i].alindi || tp[i].gizli || tp[i].cikartma) continue;   // gizli anahtar yalnız aramayla bulunur (E basılı tut)
      m = Math.hypot(tp[i].x - o.x, tp[i].y - o.y);
      if (m <= ETKI_MESAFE && m < enMes) { enMes = m; enYakin = tp[i]; }
    }
    if (enYakin) {
      return { tur: 'esya', metin: ilgiAdi(enYakin.tur) + ' al', x: enYakin.x, y: enYakin.y, nesne: enYakin };
    }
    // 2) kapı
    var kp = h.kapilar || [];
    enYakin = null; enMes = ETKI_MESAFE + 1;
    for (i = 0; i < kp.length; i++) {
      var k = kp[i];
      if (!k) continue;
      m = Math.hypot((k.tx + 0.5) * T - o.x, (k.ty + 0.5) * T - o.y);
      if (m > ETKI_MESAFE || m >= enMes) continue;
      if (k.acik && !kapatilabilir(k, o, d)) continue;
      enMes = m; enYakin = k;
    }
    if (enYakin) {
      var metin;
      if (enYakin.acik) metin = 'Kapıyı kapat';
      else if (enYakin.kilit && o.envanter.indexOf(enYakin.kilit) < 0) {
        metin = 'Kilitli (' + esyaAdi(enYakin.kilit).toLowerCase() + ')';
      } else metin = 'Kapıyı aç';
      return { tur: 'kapi', metin: metin, x: (enYakin.tx + 0.5) * T, y: (enYakin.ty + 0.5) * T, nesne: enYakin };
    }
    // 2a) merdiven (portal karosu): E ile öbür kata geç
    if (h.portalYakin && h.katSayisi > 1) {
      var pt = h.portalYakin(o.x, o.y, ETKI_MESAFE + 6);
      if (pt) return { tur: 'merdiven', metin: pt.kat === 0 ? 'Merdivenden yukarı çık' : 'Merdivenden aşağı in', x: pt.x, y: pt.y, nesne: pt };
    }
    // 2b) arama noktası (anahtar saklı olabilir): E tuşunu basılı tut
    var an = h.aramaNoktalari || [];
    enYakin = null; enMes = ETKI_MESAFE + 1;
    for (i = 0; i < an.length; i++) {
      if (!an[i] || an[i].bakildi) continue;
      m = rectYakin(o.x, o.y, an[i]);
      if (m <= ETKI_MESAFE && m < enMes) { enMes = m; enYakin = an[i]; }
    }
    if (enYakin) {
      return { tur: 'ara', metin: (enYakin.ad || 'Burayı') + (G.minikMi() ? ' ara' : ' ara (basılı tut)'), x: enYakin.x, y: enYakin.y, nesne: enYakin };
    }
    // 3) saklanma yeri
    var es = h.esyalar || [];
    enYakin = null; enMes = ETKI_MESAFE + 1;
    for (i = 0; i < es.length; i++) {
      if (!es[i] || !es[i].saklanma) continue;
      m = rectYakin(o.x, o.y, es[i]);
      if (m <= ETKI_MESAFE && m < enMes) { enMes = m; enYakin = es[i]; }
    }
    if (enYakin) {
      m = rectMerkez(enYakin);
      return {
        tur: 'saklan', metin: SAKLAN_METIN[enYakin.tur] || ((enYakin.ad || 'Buraya') + ' saklan'),
        x: m.x, y: m.y, nesne: enYakin
      };
    }
    return null;
  }

  // ---- eylemler ----
  function esyaAl(o, tp) {
    var atilabilir = atilabilirMi(tp.tur);
    if (!G.minikMi() && o.envanter.length >= ENV_MAX) {
      G.mesaj('Çantan dolu! Önce bir şey at (F).');
      return;
    }
    if (atilabilir) {
      var say = 0;
      for (var i = 0; i < o.envanter.length; i++) if (atilabilirMi(o.envanter[i])) say++;
      if (!G.minikMi() && say >= ATILABILIR_MAX) {
        G.mesaj('Elin dolu! En fazla ' + ATILABILIR_MAX + ' şey taşıyabilirsin. Birini at (F).');
        return;
      }
    }
    tp.alindi = true;
    o.envanter.push(tp.tur);
    G.olay('esya_al', { tur: tp.tur });
    if (tp.tur === 'anahtar_mavi') G.mesaj('Mavi anahtarı buldun! ' + kilitOda(tp.tur, 'Yatak Odası') + ' kapısını açar.');
    else if (tp.tur === 'anahtar_kirmizi') G.mesaj('Kırmızı anahtarı buldun! ' + kilitOda(tp.tur, 'Bodrum') + ' kapısını açar.');
    else if (tp.tur === 'top_hazine') G.mesaj("Ogeday'ın topu! Buldun!", 3);
    else G.mesaj(esyaAdi(tp.tur) + ' alındı.');
    if (tp.tur === 'top_hazine') G.olay('kazandi', {});
  }

  function kapiEtkilesim(o, kapi) {
    if (kapi.acik) {
      kapi.acik = false;
      G.olay('kapi_kapa', { kapi: kapi });
      G.gurultuYap((kapi.tx + 0.5) * T, (kapi.ty + 0.5) * T, 160, 'kapi');
      return;
    }
    if (kapi.kilit) {
      if (o.envanter.indexOf(kapi.kilit) >= 0) {
        var anahtar = kapi.kilit;
        kapi.kilit = null;
        kapi.acik = true;
        G.olay('kilit_acildi', { kapi: kapi, anahtar: anahtar });
        G.olay('kapi_ac', { kapi: kapi });
        G.gurultuYap((kapi.tx + 0.5) * T, (kapi.ty + 0.5) * T, 160, 'kapi');
        G.mesaj('Klik! Kilit açıldı.');
      } else {
        G.olay('kapi_kilitli', { kapi: kapi });
        G.mesaj('Kilitli! ' + esyaAdi(kapi.kilit) + ' lazım' + (G.bolumBilgi && G.bolumBilgi().kilitliOdalar && G.bolumBilgi().kilitliOdalar[kapi.kilit] ? ' (' + G.bolumBilgi().kilitliOdalar[kapi.kilit] + ').' : '.'));
      }
      return;
    }
    kapi.acik = true;
    G.olay('kapi_ac', { kapi: kapi });
    G.gurultuYap((kapi.tx + 0.5) * T, (kapi.ty + 0.5) * T, 160, 'kapi');
  }

  function saklan(o, e) {
    var m = rectMerkez(e);
    kayitKonum = { x: o.x, y: o.y };
    o.saklandi = e;
    o.x = m.x; o.y = m.y;
    vx = 0; vy = 0;
    G.olay('saklan', { esya: e });
    G.mesaj(SAKLAN_MESAJ[e.tur] || 'Şşş... saklandın', 2.2);
  }

  function bosKaro(px, py) {
    return !kati(Math.floor(px / T), Math.floor(py / T));
  }

  function cik(o) {
    var e = o.saklandi;
    var px = o.x, py = o.y, bulundu = false;
    if (kayitKonum && bosKaro(kayitKonum.x, kayitKonum.y)) {
      px = kayitKonum.x; py = kayitKonum.y; bulundu = true;
    } else if (e) {
      // mobilyanın çevresinde boş karo ara
      var x0 = e.tx - 1, y0 = e.ty - 1, x1 = e.tx + (e.w || 1), y1 = e.ty + (e.h || 1);
      for (var ty = y0; ty <= y1 && !bulundu; ty++) {
        for (var tx = x0; tx <= x1; tx++) {
          if (tx >= e.tx && tx < e.tx + (e.w || 1) && ty >= e.ty && ty < e.ty + (e.h || 1)) continue;
          if (!kati(tx, ty)) { px = (tx + 0.5) * T; py = (ty + 0.5) * T; bulundu = true; break; }
        }
      }
    }
    o.x = px; o.y = py;
    o.saklandi = null;
    kayitKonum = null;
    vx = 0; vy = 0;
    G.olay('saklanmadan_cik', { esya: e });
  }

  function etkilesim(o, d) {
    var h = hedefBul(o, d);
    if (!h) return;
    if (h.tur === 'cik') cik(o);
    else if (h.tur === 'esya') esyaAl(o, h.nesne);
    else if (h.tur === 'kapi') kapiEtkilesim(o, h.nesne);
    else if (h.tur === 'saklan') saklan(o, h.nesne);
    else if (h.tur === 'merdiven') katBaslat(o, d, h.nesne);
    else if (h.tur === 'ara' && G.minikMi()) aramaBitir(o, d, h.nesne);
    else if (h.tur === 'ara') G.mesaj(G.dokunmatik ? 'Aramak için el düğmesini basılı tut!' : 'Aramak için E tuşunu basılı tut!', 1.6);
  }

  // ---- kat geçişi (GENEL: çok katlı bölümler): karartma 0,28 sn, ışınlanma, açılma 0,3 sn. Girdi kilitli ----
  function katBaslat(o, d, pt) {
    if (o.katGecis || !pt || !pt.hedef) return;
    o.katGecis = { t: 0, hedef: { x: pt.hedef.x, y: pt.hedef.y }, git: false };
    G.gurultuYap(pt.x, pt.y, 110, 'kapi');
    G.olay('kat_basladi', { x: pt.x, y: pt.y });
  }
  function katGuncelle(o, d, dt) {
    var g = o.katGecis;
    if (!g) { if (d.katPerde > 0) d.katPerde = Math.max(0, d.katPerde - dt * 4); return false; }
    g.t += dt;
    if (!g.git && g.t >= 0.28) {
      g.git = true;
      var x0 = o.x, y0 = o.y, h = H();
      o.x = g.hedef.x; o.y = g.hedef.y; vx = 0; vy = 0; o.yon = Math.PI / 2;
      var kat = h.katOf ? h.katOf(o.y) : 0;
      G.olay('kat_gecti', { x0: x0, y0: y0, x1: o.x, y1: o.y, kat: kat });
      if (G.mesaj && h.katAdi) G.mesaj(h.katAdi(kat), 1.6);
    }
    d.katPerde = g.git ? Math.max(0, 1 - (g.t - 0.28) / 0.3) : Math.min(1, g.t / 0.28);
    if (g.git && g.t >= 0.58) { o.katGecis = null; d.katPerde = 0; }
    return true;
  }

  // ---- arama (EK-8): E basılı tutulunca ilerleme halkası dolar ----
  var ARAMA_SURE = 1.2, aramaSesT = 0;
  function aramaTick(o, d, dt) {
    if (G.minikMi()) { o.aramaIl = 0; o.aramaN = null; return false; }
    var basili = !!(G.girdi && G.girdi.etkiBasili);
    var hd = (!o.saklandi && basili) ? hedefBul(o, d) : null;
    if (hd && hd.tur === 'ara') {
      if (o.aramaN !== hd.nesne) { o.aramaN = hd.nesne; o.aramaIl = 0; aramaSesT = 0; }
      o.aramaIl += dt / ARAMA_SURE;
      aramaSesT -= dt;
      if (aramaSesT <= 0) {
        aramaSesT = 0.35;
        G.gurultuYap(o.x, o.y, 170, 'arama');
        G.olay('arama_ses', { x: o.x, y: o.y });
      }
      if (o.aramaIl >= 1) { var n = o.aramaN; o.aramaN = null; o.aramaIl = 0; aramaBitir(o, d, n); }
      return true;
    }
    if (o.aramaIl > 0) { o.aramaIl = Math.max(0, o.aramaIl - dt * 3); if (o.aramaIl <= 0) o.aramaN = null; }
    else o.aramaN = null;
    return false;
  }
  function aramaBitir(o, d, n) {
    n.bakildi = true; n.ipucu = false;
    if (n.gercek) {
      var tp = null, tl = H().toplanabilir || [];
      for (var i = 0; i < tl.length; i++) if (tl[i].tur === n.anahtar && !tl[i].alindi) { tp = tl[i]; break; }
      if (tp) {
        tp.gizli = false;
        G.olay('arama_bitti', { nokta: n, bulundu: true, anahtar: n.anahtar });
        d.aramaSon = d.zaman;
        esyaAl(o, tp);
        return;
      }
    }
    G.olay('arama_bitti', { nokta: n, bulundu: false });
    G.mesaj(n.mesaj || 'Burada sadece çorap var!', 2.8);
  }

  // Uzun süre bulunamazsa doğru noktada parıltı ipucu (Gökçe fısıldar)
  // Süreler bolum.js'teki G.bolumBilgi().ipucu = [nabız belirginleşir, yön oku gerçek noktaya, parıltı] (sn)
  function ipucuSureleri() {
    if (G.minikMi()) return [0, 0, 0];
    var b = G.bolumBilgi && G.bolumBilgi();
    return (b && b.ipucu) || [25, 45, 60];
  }
  function ipucuKontrol(o, d) {
    var h = H(), gr = h.aramaGruplari || {};
    var env = o.envanter || [];
    var gerekli = null;
    var maviKapi = false, kp = h.kapilar || [];
    for (var i = 0; i < kp.length; i++) if (kp[i].kilit === 'anahtar_mavi') maviKapi = true;
    if (gr.anahtar_mavi && env.indexOf('anahtar_mavi') < 0 && !gizliAlindi('anahtar_mavi')) gerekli = 'anahtar_mavi';
    else if (gr.anahtar_kirmizi && !maviKapi && env.indexOf('anahtar_kirmizi') < 0 && !gizliAlindi('anahtar_kirmizi')) gerekli = 'anahtar_kirmizi';
    if (d.aramaSon == null) d.aramaSon = 0;
    if (d._maviKapi && !maviKapi) d.aramaSon = d.zaman;   // mavi kapı açıldı: yeni arama aşaması
    d._maviKapi = maviKapi;
    if (!gerekli) return;
    if (d.zaman - d.aramaSon < ipucuSureleri()[2]) return;
    var gercek = null, g = gr[gerekli];
    for (var j = 0; j < g.length; j++) if (g[j].gercek && !g[j].bakildi) gercek = g[j];
    if (!gercek || gercek.ipucu) return;
    gercek.ipucu = true; gercek.minikIpucu = G.minikMi();
    G.mesaj('Gökçe fısıldadı: "Parıldayan yere bak!"', 4);
    G.olay('ipucu', { nokta: gercek });
  }
  function gizliAlindi(tur) {
    var tl = H().toplanabilir || [];
    for (var i = 0; i < tl.length; i++) if (tl[i].tur === tur) return !!tl[i].alindi;
    return false;
  }

  // ---- fırlatma ----
  function firlat(o, d) {
    if (o.saklandi) return;
    var idx = -1;
    for (var i = o.envanter.length - 1; i >= 0; i--) {
      if (atilabilirMi(o.envanter[i])) { idx = i; break; }
    }
    if (idx < 0) { G.mesaj('Atacak bir şeyin yok! Elma ya da teneke bul.'); return; }
    var tur = o.envanter.splice(idx, 1)[0];
    // ilk hâl: uçuş süresi t, yatay hız = menzil / t
    var t = (FIRLAT_VZ + Math.sqrt(FIRLAT_VZ * FIRLAT_VZ + 2 * YERCEKIMI * FIRLAT_Z0)) / YERCEKIMI;
    var v = FIRLAT_MENZIL / t;
    var c = Math.cos(o.yon), s = Math.sin(o.yon);
    var bx = o.x, by = o.y;
    // başlangıç noktası duvarın içindeyse oyuncunun üstünden başlat
    if (!kati(Math.floor((o.x + c * 16) / T), Math.floor((o.y + s * 16) / T))) { bx = o.x + c * 16; by = o.y + s * 16; }
    d.firlatilanlar = d.firlatilanlar || [];
    d.firlatilanlar.push({ x: bx, y: by, vx: c * v, vy: s * v, z: FIRLAT_Z0, vz: FIRLAT_VZ, tur: tur, omur: 6 });
    G.olay('firlat', { tur: tur });
  }

  function dusur(f, d) {
    // yere in: toplanabilir listesine ekle
    var x = f.x, y = f.y;
    if (kati(Math.floor(x / T), Math.floor(y / T))) { x = f.sx; y = f.sy; }
    var h = H();
    if (h.toplanabilir) {
      h.toplanabilir.push({ id: 'at_' + (++idSayac) + '_' + f.tur, tur: f.tur, x: x, y: y, alindi: false });
    }
    G.gurultuYap(x, y, 420, 'esya');
    G.olay('esya_dustu', { x: x, y: y, tur: f.tur });
  }

  function firlatilanlariGuncelle(dt, d) {
    var L = d.firlatilanlar;
    if (!L) return;
    for (var i = L.length - 1; i >= 0; i--) {
      var f = L[i];
      f.omur -= dt;
      if (f.sx === undefined) { f.sx = f.x; f.sy = f.y; }
      // yatay hareket, küçük adımlarla
      var dx = f.vx * dt, dy = f.vy * dt;
      var n = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 8));
      for (var k = 0; k < n && (f.vx || f.vy); k++) {
        var nx = f.x + dx / n, ny = f.y + dy / n;
        if (kati(Math.floor(nx / T), Math.floor(ny / T))) { f.vx = 0; f.vy = 0; break; }
        f.x = nx; f.y = ny; f.sx = nx; f.sy = ny;
      }
      f.z += f.vz * dt;
      f.vz -= YERCEKIMI * dt;
      if ((f.z <= 0 && f.vz < 0) || f.omur <= 0) {
        f.z = 0;
        L.splice(i, 1);
        dusur(f, d);
      }
    }
  }

  // ---- ana güncelleme ----
  // Gizli çıkartma: yaklaşınca kendiliğinden alınır, envanterde yer kaplamaz.
  var CIKARTMA_MESAFE = 34;
  function cikartmaTopla(o, d) {
    var tl = H().toplanabilir || [];
    for (var i = 0; i < tl.length; i++) {
      var c = tl[i];
      if (!c || !c.cikartma || c.alindi) continue;
      if (Math.hypot(c.x - o.x, c.y - o.y) > CIKARTMA_MESAFE) continue;
      c.alindi = true;
      var say = 0; for (var j = 0; j < tl.length; j++) if (tl[j].cikartma && tl[j].alindi) say++;
      var tn = (G.bolumBilgi && G.bolumBilgi().cikartma) || [];
      var yeni = true;
      if (G.kayit) { yeni = !G.kayit.cikartmaVar(G.bolum, c.no); G.kayit.cikartmaYaz(G.bolum, c.no); }
      G.olay('cikartma_al', { no: c.no, tur: tn[c.no] && tn[c.no].r, ad: tn[c.no] && tn[c.no].ad, say: say, toplam: tn.length || 3, yeni: yeni, x: c.x, y: c.y });
      G.mesaj('Çıkartma ' + say + '/' + (tn.length || 3), 2);
    }
  }

  function guncelle(dt, d) {
    var o = d.oyuncu;
    if (!o) return;
    var gi = G.girdi || {};
    var h = H();

    if (katGuncelle(o, d, dt)) {
      if (G.girdi && G.girdi.al) { G.girdi.al('etkilesim'); G.girdi.al('firlat'); }
      o.hareket = false; o.kosuyor = false; o.yakindaki = null; vx = 0; vy = 0;
      firlatilanlariGuncelle(dt, d);
      return;
    }
    if (G.girdi && G.girdi.al && G.girdi.al('etkilesim')) etkilesim(o, d);
    if (G.girdi && G.girdi.al && G.girdi.al('firlat')) firlat(o, d);

    if (!o.saklandi) cikartmaTopla(o, d);
    if (o.saklandi) {
      var m = rectMerkez(o.saklandi);
      o.x = m.x; o.y = m.y;
      vx = 0; vy = 0;
      o.hareket = false; o.kosuyor = false; o.egik = false; o.gorunurluk = 0;
    } else {
      var aramada = aramaTick(o, d, dt);
      var ix = aramada ? 0 : (gi.x || 0), iy = aramada ? 0 : (gi.y || 0);
      var il = Math.hypot(ix, iy);
      if (il > 1) { ix /= il; iy /= il; il = 1; }
      var egik = !!gi.egil && !aramada;
      var kos = !!gi.kos && !egik && !aramada;
      var hiz = egik ? EGIL : (kos ? KOS : YURU);
      var hx = ix * hiz, hy = iy * hiz;
      // yumuşak ivmelenme / yavaşlama
      var a = Math.min(1, dt * (il > 0.05 ? 16 : 22));
      vx += (hx - vx) * a; vy += (hy - vy) * a;
      if (il <= 0.05 && Math.hypot(vx, vy) < 4) { vx = 0; vy = 0; }

      var ox = o.x, oy = o.y;
      if (h.hareketEt) {
        h.hareketEt(o, vx * dt, vy * dt, false);
      } else {
        o.x += vx * dt; o.y += vy * dt;
      }
      var gercek = Math.hypot(o.x - ox, o.y - oy);
      var hizGercek = dt > 0 ? gercek / dt : 0;
      o.hareket = il > 0.05 && hizGercek > 15;
      o.egik = egik;
      o.kosuyor = kos && o.hareket;
      o.adimFaz += gercek / 20;

      if (il > 0.05) {
        var hedef = Math.atan2(iy, ix);
        var fark = hedef - o.yon;
        while (fark > Math.PI) fark -= 2 * Math.PI;
        while (fark < -Math.PI) fark += 2 * Math.PI;
        o.yon += fark * Math.min(1, dt * 14);
        if (o.yon > Math.PI) o.yon -= 2 * Math.PI;
        else if (o.yon < -Math.PI) o.yon += 2 * Math.PI;
      }

      o.gorunurluk = o.egik ? 0.55 : (o.kosuyor ? 1.2 : 1);

      if (o.hareket) {
        adimT += dt;
        if (adimT >= 0.35) {
          adimT -= 0.35;
          var guc = o.egik ? 0 : (o.kosuyor ? 320 : 140);
          if (guc > 0) G.gurultuYap(o.x, o.y, guc, 'oyuncu');
          G.olay('adim', { x: o.x, y: o.y, kosu: o.kosuyor, egik: o.egik, kim: 'oyuncu' });
        }
      } else {
        adimT = Math.min(adimT, 0.2);
      }
    }

    if (o.saklandi) { o.aramaN = null; o.aramaIl = 0; }
    ipucuKontrol(o, d);
    firlatilanlariGuncelle(dt, d);
    o.yakindaki = (function () {
      var t = hedefBul(o, d);
      return t ? { tur: t.tur, metin: t.metin, x: t.x, y: t.y } : null;
    })();
  }

  // ---- yazısız ipucu durumu (arayuz.js oku/simgeleri, cizim3d.js halkaları buradan okur) ----
  // Dönüş: { mod:'ara'|'kapi'|'top', anahtar:'anahtar_mavi'|'anahtar_kirmizi', renk, noktalar:[aranmamış], bosOlanlar:[aranmış],
  //          hedef:{x,y,nokta?}, asama:0..3 } ya da null
  function kilitliKapi(h, tur, o) {
    var kp = h.kapilar || [], en = null, em = 1e12;
    for (var i = 0; i < kp.length; i++) {
      if (kp[i].kilit !== tur || kp[i].acik) continue;
      var x = (kp[i].tx + 0.5) * G.TILE, y = (kp[i].ty + 0.5) * G.TILE, m = Math.hypot(x - o.x, y - o.y);
      if (m < em) { em = m; en = { x: x, y: y, kapi: kp[i] }; }
    }
    return en;
  }
  function ipucuDurum0(d) {
    var o = d && d.oyuncu, h = H();
    if (!o) return null;
    var env = o.envanter || [], gr = h.aramaGruplari || {}, i;
    if (env.indexOf('top_hazine') >= 0) return null;
    var RENK = { anahtar_mavi: 'mavi', anahtar_kirmizi: 'kirmizi' };
    if (env.indexOf('anahtar_kirmizi') >= 0) {
      var kk = kilitliKapi(h, 'anahtar_kirmizi', o);
      if (kk) return { mod: 'kapi', anahtar: 'anahtar_kirmizi', renk: 'kirmizi', noktalar: [], bosOlanlar: [], hedef: kk, asama: 0 };
      var tl = h.toplanabilir || [];
      for (i = 0; i < tl.length; i++) if (tl[i].tur === 'top_hazine' && !tl[i].alindi) return { mod: 'top', anahtar: 'top_hazine', renk: 'sari', noktalar: [], bosOlanlar: [], hedef: { x: tl[i].x, y: tl[i].y }, asama: 0 };
      return null;
    }
    var mk = kilitliKapi(h, 'anahtar_mavi', o);
    if (env.indexOf('anahtar_mavi') >= 0) {
      if (mk) return { mod: 'kapi', anahtar: 'anahtar_mavi', renk: 'mavi', noktalar: [], bosOlanlar: [], hedef: mk, asama: 0 };
    }
    var tur = null;
    if (mk && gr.anahtar_mavi && env.indexOf('anahtar_mavi') < 0 && !gizliAlindi('anahtar_mavi')) tur = 'anahtar_mavi';
    else if (!mk && gr.anahtar_kirmizi && !gizliAlindi('anahtar_kirmizi')) tur = 'anahtar_kirmizi';
    if (!tur) return null;
    var g = gr[tur], nok = [], bos = [], gercek = null;
    for (i = 0; i < g.length; i++) { if (g[i].bakildi) bos.push(g[i]); else { nok.push(g[i]); if (g[i].gercek) gercek = g[i]; } }
    if (!nok.length) return null;
    var s = ipucuSureleri(), gec = d.zaman - (d.aramaSon || 0);
    var asama = (gec >= s[2] || (gercek && gercek.ipucu)) ? 3 : gec >= s[1] ? 2 : gec >= s[0] ? 1 : 0;
    var hedef = null, em = 1e12;
    if (asama >= 2 && gercek) hedef = gercek;
    else for (i = 0; i < nok.length; i++) { var m = Math.hypot(nok[i].x - o.x, nok[i].y - o.y); if (m < em) { em = m; hedef = nok[i]; } }
    return { mod: 'ara', anahtar: tur, renk: RENK[tur], noktalar: nok, bosOlanlar: bos, hedef: { x: hedef.x, y: hedef.y, nokta: hedef }, asama: asama };
  }

  // Hedef öbür kattaysa ok merdiveni gösterir: hedef = yoldaki ilk portal karosu, merdiven:true, asil = gerçek hedef.
  var ipC = { z: -1, x: 0, y: 0, v: null };
  function ipucuDurum(d) {
    var o = d && d.oyuncu, h = H();
    if (!o) return null;
    if (!G.minikMi() && ipC.z === d.zaman && ipC.x === o.x && ipC.y === o.y) return ipC.v;
    var r = ipucuDurum0(d);
    if (r && r.hedef && h.katSayisi > 1 && h.katOf(r.hedef.y) !== h.katOf(o.y) && h.yolBul) {
      var yl = null;
      try { yl = h.yolBul(o.x, o.y, r.hedef.x, r.hedef.y, true); } catch (e) { yl = null; }
      var wp = null;
      if (yl) for (var i = 0; i < yl.length; i++) if (yl[i].portal) { wp = yl[i]; break; }
      if (wp) { r.asil = r.hedef; r.hedef = { x: wp.x, y: wp.y, merdiven: true, asil: r.asil }; r.merdiven = true; }
    }
    ipC = { z: d.zaman, x: o.x, y: o.y, v: r };
    return r;
  }

  return { init: init, guncelle: guncelle, esyaAdi: esyaAdi, ipucuDurum: ipucuDurum };
})();
