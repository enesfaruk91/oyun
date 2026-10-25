window.G = window.G || {};
(function () {
  G.bolum = 1;
  G.SON_BOLUM = 6;   // bölüm sayısı: ilerleme/menü/final akışı bu değerden okur (kaç olursa olsun çalışır)
  G.bolumler = {
    1: {
      no: 1, ad: 'Bölüm 1: Annemle Babamın Evi', kisaAd: 'Annemle Babamın Evi',
      kimler: ['baba', 'anne'], ilkNobetci: 'baba', hedefOda: 'Bodrum',
      kilitliOdalar: { anahtar_mavi: 'Yatak Odası', anahtar_kirmizi: 'Bodrum' },
      sure: 180, ekSure: 60, kazaTur: 'scooter', gokceYardim: 'oyala',
      // zorluk: kovalama = kovalayan koşu hızı (px/sn; oyuncu koşusu 215), gorus = görüş mesafesi (px), gorusAci = koni açısı (rad),
      // suphe = şüphe dolma çarpanı, nobet = nöbet süresi (sn), gokceHakki = Gökçe çağırma hakkı
      zorluk: { kovalama: 150, gorus: 280, gorusAci: 1.05, suphe: 0.8, nobet: 60, gokceHakki: 3, devriye: 0.95 },
      anons: { tur: 'mikrofon', gidis: 'Hihi, görünmez oldum!', soz: 'ALOOOO! GÜNAYDIIIN!', uyandi: 'mikrofona bağırdı', suphe: 'Bu mikrofon kendi kendine mi çalıştı?', ad: 'Mikrofon' },
      gorev: { maviYok: 'Mavi anahtarı ara: mutfak, garaj ya da salon? (E basılı tut)', maviVar: 'Yatak odasının kilidini aç', kirmiziYok: 'Kırmızı anahtarı yatak odasında ara (E basılı tut)', kirmiziVar: 'Bodruma in, topunu al!' },
      izinliOdalar: ['Bahçe', 'Sokak', 'Mutfak', 'Salon', 'Koridor', 'Giriş Holü', 'Garaj', 'Banyo', "Gökçe'nin Odası"],
      hikaye: ['Annemle babam topumu bodruma kilitledi!', 'Anahtarlar saklı: çekmeceleri ve rafları ara (E tuşunu basılı tut).', 'Enes Baba yorulunca uyur, nöbeti Sümeyye Anne devralır.', 'Yakalarlarsa sadece gıdıklarlar, korkma :)'],
      gecis: ['Topu kurtardın! Ama sevinçle öyle bir şut çektin ki', "top sokağın karşısına, Ebe ile Dede'nin bahçesine uçtu!", 'Dede topu kilere kaldırdı. Ebe ile Dede nöbetleşe uyukluyor...', 'Hadi, topunu geri al!'],
      kazandiBaslik: 'TOPUNU KURTARDIN!', kazandiAlt: 'Annenle baban hiçbir şey anlamadı!',
      duraklatAlt: 'Annen babam seni beklemiyor, rahat ol!',
      kisiler: 'Sümeyye · Enes · Hanife · Mahmut'
    },
    2: {
      no: 2, ad: 'Bölüm 2: Ebe-Dede Evi', kisaAd: 'Ebe-Dede Evi',
      kimler: ['dede', 'ebe'], ilkNobetci: 'dede', hedefOda: 'Kiler',
      kilitliOdalar: { anahtar_mavi: 'Yatak Odası', anahtar_kirmizi: 'Kiler' },
      sure: 210, ekSure: 60, kazaTur: 'scooter', gokceYardim: 'oyala',
      zorluk: { kovalama: 155, gorus: 300, gorusAci: 1.1, suphe: 0.9, nobet: 60, gokceHakki: 2, devriye: 1 },
      anons: { tur: 'mikrofon', gidis: 'Hihi, görünmez oldum!', soz: 'ALOOOO! GÜNAYDIIIN!', uyandi: 'karaokeye bağırdı', suphe: 'Bu karaoke kendi kendine mi çalıştı?', ad: 'Karaoke' },
      gorev: { maviYok: 'Mavi anahtarı ara: mutfak, oturma odası ya da kuyu başı? (E basılı tut)', maviVar: 'Ebe-Dede yatak odasının kilidini aç', kirmiziYok: 'Kırmızı anahtarı yatak odasında ara (E basılı tut)', kirmiziVar: 'Kilere in, topunu al!' },
      izinliOdalar: ['Bahçe', 'Sokak', 'Mutfak', 'Oturma Odası', 'Koridor', 'Giriş', 'Banyo', 'Kümes', "Gökçe'nin Köşesi"],
      hikaye: ["Top, Ebe ile Dede'nin bahçesine uçtu!", 'Mahmut Dede topu kilere kaldırdı. Anahtarlar evin içinde saklı: ara!', 'Mahmut Dede yorulunca uyur, nöbeti Hanife Ebe devralır.', 'Yakalarlarsa yanağını sıkar, kurabiye yedirirler :)'],
      gecis: ['Topu ikinci kez kurtardın! Bahçede şut çekerken', 'top havalara uçtu ve parkın ortasındaki havuza düştü!', 'Bekçi Rıza topu büfe dolabına kilitledi. Anahtarları parka dağıttı!', 'Ve parkta bir sokak kedisi, Duman, geziyor... gürültüsüz dolaş!'],
      kazandiBaslik: 'TOPUNU İKİ KEZ KURTARDIN!', kazandiAlt: 'Ebe ile Dede de hiçbir şey anlamadı!',
      duraklatAlt: 'Ebe ile Dede uyukluyor, rahat ol!',
      kisiler: 'Sümeyye · Enes · Hanife · Mahmut'
    },
    3: {
      no: 3, ad: 'Bölüm 3: Belediye Parkı', kisaAd: 'Belediye Parkı',
      kimler: ['bekci', 'bekci2'], ilkNobetci: 'bekci', hedefOda: 'Büfe',
      kilitliOdalar: { anahtar_mavi: 'Depo', anahtar_kirmizi: 'Büfe' },
      sure: 240, ekSure: 60, kazaTur: 'salincak', gokceYardim: 'oyala',
      zorluk: { kovalama: 165, gorus: 320, gorusAci: 1.15, suphe: 1.0, nobet: 55, gokceHakki: 2, devriye: 1.05 },
      anons: { tur: 'anons', gidis: 'Hihi, görünmez oldum!', soz: "DİKKAT DİKKAT! DUMAN'A MAMA LAZIM!", uyandi: 'park hoparlöründen anons yaptı', suphe: 'Park hoparlöründen kim konuştu?', ad: 'Park Anons Sistemi' },
      gorev: { maviYok: 'Mavi anahtarı ara: havuz kenarı, bank ya da piknik masası? (E basılı tut)', maviVar: 'Depoyu aç, içindeki anahtarı bul', kirmiziYok: 'Kırmızı anahtarı Depoda ara (E basılı tut)', kirmiziVar: 'Büfenin kilidini aç, topunu al!' },
      izinliOdalar: ['Sokak', 'Park', 'Havuz Meydanı', 'Kontrol Kabini', 'Depo', 'Büfe', 'Oyun Alanı'],
      hikaye: ['Top, parkın ortasındaki havuza düştü!', 'Bekçi Rıza topu büfe dolabına kilitledi; anahtarlar saklı, ara!', 'Rıza yorulunca uyur, nöbeti Bekçi Şahin devralır.', 'Sokak kedisi Duman gürültü peşinde; sessiz ol!'],
      gecis: ['Topu parktan kurtardın! Ama sevinçle öyle bir şut çektin ki', 'top parkın çitlerini aşıp yandaki okul bahçesine düştü!', 'Hafta sonu okul kapalı, ama Nöbetçi Öğretmen Ayşe Hanım bahçede...', "Topu Spor Deposu'na kilitledi. Hadi, topunu geri al!"],
      kazandiBaslik: 'TOPU PARKTAN KURTARDIN!', kazandiAlt: 'Bekçiler hiçbir şey fark etmedi, Duman ise arkandan mırladı!',
      duraklatAlt: 'Bekçiler kestiriyor olabilir, Duman ise yakınlarda dolaşıyor!',
      kisiler: 'Bekçi Rıza · Bekçi Şahin · Duman (kedi)'
    },
    4: {
      no: 4, ad: 'Bölüm 4: Okul Bahçesi', kisaAd: 'Okul Bahçesi',
      kimler: ['ogretmen', 'mudur'], ilkNobetci: 'ogretmen', hedefOda: 'Spor Deposu',
      kilitliOdalar: { anahtar_mavi: 'Öğretmenler Odası', anahtar_kirmizi: 'Spor Deposu' },
      sure: 270, ekSure: 60, kazaTur: 'pota', zil: 80, gokceYardim: 'oyala',
      zorluk: { kovalama: 170, gorus: 340, gorusAci: 1.2, suphe: 1.1, nobet: 55, gokceHakki: 1, devriye: 1.1 },
      anons: { tur: 'anons', gidis: 'Hihi, görünmez oldum!', soz: 'SAYIN ÖĞRENCİLER, BUGÜN DERS YOK!', uyandi: 'okul hoparlöründen anons yaptı', suphe: 'Okul anonsunu kim yaptı?', ad: 'Okul Anons Sistemi' },
      gorev: { maviYok: 'Mavi anahtarı ara: bahçe, koridor ya da kantin? (E basılı tut)', maviVar: 'Öğretmenler Odası kapısını aç', kirmiziYok: 'Kırmızı anahtarı Öğretmenler Odasında ara (E basılı tut)', kirmiziVar: 'Spor Deposunu aç, topunu al!' },
      izinliOdalar: ['Okul Bahçesi', 'Sokak', 'Koridor', 'Öğretmenler Odası', 'Müdür Odası', 'Kantin', 'Spor Deposu', 'Sınıf Köşesi'],
      hikaye: ['Top okul bahçesine düştü!', 'Ayşe Hanım topu Spor Deposuna kilitledi; anahtarlar saklı, ara!', 'Kemal Bey odasında kestirir; yorulunca Ayşe Hanım nöbeti devralır.', 'Teneffüs zili çalınca nöbetçi bayrak direğine gider: fırsat!'],
      gecis: ['Topu okuldan kurtardın! Ama sevinçle öyle bir şut çektin ki', "top okulun çitini aşıp Dede Hassi'nin bahçesine uçtu!", 'Dede Hassi topu iki katlı evinin kilerine kaldırdı. Anneanne çay demliyor...', 'Merdivenleri dikkatli çık, hadi topunu geri al!'],
      kazandiBaslik: 'TOPUNU DÖRT KEZ KURTARDIN!', kazandiAlt: 'Ayşe Hanım zili sandı, Kemal Bey rüya gördüğünü sandı!',
      duraklatAlt: 'Okul tatil, Kemal Bey kestiriyor olabilir!',
      kisiler: 'Ayşe Hanım · Kemal Bey'
    },
    5: {
      no: 5, ad: "Bölüm 5: Dede Hassi'nin Evi", kisaAd: "Dede Hassi'nin Evi",
      // Tek arayıcı: Dede Hassi (yorulunca kısa kestirir ve uyanır). Anneanne yardımcı; sürpriz misafir: Abari Ebe (yardımcı, öbür katta) + Recep Dede (ikinci arayıcı).
      kimler: ['dedehassi'], tekKisi: true, ilkNobetci: 'dedehassi', hedefOda: 'Kiler',
      kilitliOdalar: { anahtar_mavi: 'Çalışma Odası', anahtar_kirmizi: 'Kiler' },
      sure: 300, ekSure: 60, kazaTur: 'trabzan',
      // Gökçe'nin yardım türü: 'oyala' (arayıcıyı oyalar) | 'kat' (arayıcıyı öbür kata çeker, ~20 sn) | 'bebek' (ileride) ...
      gokceYardim: 'kat', gokceKatSure: 20,
      zorluk: { kovalama: 172, gorus: 345, gorusAci: 1.2, suphe: 1.15, nobet: 55, gokceHakki: 2, devriye: 1.12 },
      kestirme: { sure: [16, 24] },
      yardimci: { kim: 'anneanne', bekleme: 40, oyalaSure: 9 },
      misafir: { oran: 0.4, yardimci: 'abariebe', arayici: 'recepdede', yardimciKat: 1, bekleme: 40 },
      anons: { tur: 'mikrofon', gidis: 'Hihi, görünmez oldum!', soz: 'ALOOOO! DEDEEE, MİSAFİR GELDİ!', uyandi: 'diafona bağırdı', suphe: 'Diafondan kim bağırdı?', ad: 'Diafon' },
      gorev: { maviYok: 'Mavi anahtarı ara: mutfak, salon ya da üst kat? (E basılı tut)', maviVar: 'Üst kattaki Çalışma Odasının kilidini aç', kirmiziYok: 'Kırmızı anahtarı Çalışma Odasında ara (E basılı tut)', kirmiziVar: 'Aşağı in, Kilerin kilidini aç, topunu al!' },
      izinliOdalar: ['Bahçe', 'Sokak', 'Mutfak', 'Salon', 'Giriş Holü', 'Koridor', 'Banyo', 'Çay Odası', "Gökçe'nin Köşesi", 'Yatak Odası', 'Üst Hol', 'Üst Koridor', 'Misafir Odası', 'Üst Banyo', 'Okuma Odası'],
      hikaye: ["Top, Dede Hassi'nin iki katlı evine uçtu!", 'Dede Hassi topu kilere kilitledi. Anahtarlar iki katta saklı: ara!', 'Dede Hassi yorulunca kısa bir kestirir. Anneanne yardım eder, kapı zilini dinle!', 'Merdivende E tuşuna basınca öbür kata geçersin :)'],
      gecis: ['Topu Dede Hassi\'nin evinden kurtardın! Ama sevinçle öyle bir şut çektin ki', "top Nefise Teyze'nin evinin balkonuna uçtu!", 'Evde bebek Beren var: emekleyerek seni arayacak! Teyze ile Enişte', "kovalamaz ama seni Beren'e ispiyonlar. Çıngırak at, oyalansın!"],
      kazandiBaslik: 'TOPUNU BEŞ KEZ KURTARDIN!', kazandiAlt: 'Dede Hassi çay içti, misafirler şeker dağıttı, kimse bir şey anlamadı!',
      duraklatAlt: 'Dede Hassi çay içiyor olabilir, merdivenleri unutma!',
      kisiler: 'Dede Hassi · Anneanne · Abari Ebe · Recep Dede'
    },
    6: {
      no: 6, ad: 'Bölüm 6: Teyze Evi — Beren\'den Kaçmacılık', kisaAd: 'Teyze Evi',
      // Tek arayıcı: bebek Beren (emekler, oyuncaklara dalar, pusette uyur). Nefise Teyze + Uğurcan Enişte KOVALAMAZ; seni görünce Beren'e seslenir (ispiyon).
      kimler: ['beren'], tekKisi: true, ilkNobetci: 'beren', hedefOda: 'Balkon', uyananYok: true, bebek: true,
      kilitliOdalar: { anahtar_mavi: 'Yatak Odası', anahtar_kirmizi: 'Balkon' },
      sure: 330, ekSure: 60, kazaTur: 'oyunparki',
      gokceYardim: 'bebek', gokceBebekSure: [20, 25],
      zorluk: { kovalama: 158, gorus: 360, gorusAci: 1.3, suphe: 1.25, nobet: 48, gokceHakki: 2, devriye: 1.2 },
      kestirme: { sure: [14, 20] },
      ispiyon: { gorus: 270, aci: 1.15, bekleme: 8, sure: 0.55 },
      anons: { tur: 'mikrofon', gidis: 'Hihi, görünmez oldum!', soz: 'BEREN! UYAN! BUU!', uyandi: 'bebek telsizine bağırdı', suphe: 'Bebek telsizi kendi kendine mi konuştu?', ad: 'Bebek Telsizi' },
      gorev: { maviYok: 'Mavi anahtarı ara: mutfak, salon ya da bahçe? (E basılı tut)', maviVar: 'Yatak Odasının kilidini aç', kirmiziYok: 'Kırmızı anahtarı Yatak Odasında ara (E basılı tut)', kirmiziVar: 'Balkonun kilidini aç, topunu al!' },
      izinliOdalar: ['Bahçe', 'Sokak', 'Mutfak', 'Salon', 'Giriş Holü', 'Koridor', 'Bebek Odası', 'Banyo'],
      hikaye: ["Top, Nefise Teyze'nin balkonuna uçtu! Bebek Beren seni arıyor.", 'Anahtarlar evde saklı: çekmeceleri ve minderleri ara (E basılı tut).', 'Teyze ile Enişte kovalamaz ama seni görünce Beren\'e seslenir!', 'Beren sana sarılırsa yakalanırsın: oyuncak at, oyalansın :)'],
      gecis: [],
      kazandiBaslik: 'TOPUNU ALTI KEZ KURTARDIN!', kazandiAlt: 'Beren peluşuyla uyudu, Teyze ile Enişte kimseyi görmedi!',
      duraklatAlt: 'Beren oyuncaklarla oynuyor olabilir, Teyze ile Enişte dikkat!',
      kisiler: 'Beren · Nefise Teyze · Uğurcan Enişte'
    }
  };

  // Gizli çıkartmalar (rozet): konumlar harita.js CIKARTMA_YER'de (aynı sırayla). r = arayuz.js rozet çizim adı.
  G.bolumler[1].cikartma = [{ r: 'dino', ad: 'Dinozor' }, { r: 'top', ad: 'Top' }, { r: 'roket', ad: 'Roket' }];
  G.bolumler[2].cikartma = [{ r: 'tavuk', ad: 'Tavuk' }, { r: 'kurabiye', ad: 'Kurabiye' }, { r: 'yumak', ad: 'Yumak' }];
  G.bolumler[3].cikartma = [{ r: 'kedi', ad: 'Patili' }, { r: 'agac', ad: 'Ağaç' }, { r: 'ordek', ad: 'Ördek' }];
  G.bolumler[4].cikartma = [{ r: 'kalem', ad: 'Kalem' }, { r: 'basket', ad: 'Basketbol topu' }, { r: 'yildiz', ad: 'Yıldız' }];
  G.bolumler[5].cikartma = [{ r: 'cay', ad: 'Çay' }, { r: 'merdiven', ad: 'Merdiven' }, { r: 'saksi', ad: 'Saksı' }];
  G.bolumler[6].cikartma = [{ r: 'cingirak', ad: 'Çıngırak' }, { r: 'biberon', ad: 'Biberon' }, { r: 'pelus', ad: 'Peluş' }];

  // Kalıcı kayıt: yıldızlar (abk_yildiz_b{n}), çıkartmalar (abk_cikartma), rehber (abk_rehber). localStorage yoksa bellek.
  var bellek = {};
  function oku(k) { try { var v = localStorage.getItem(k); if (v !== null && v !== undefined) return v; } catch (h) { } return bellek[k] === undefined ? null : bellek[k]; }
  function yaz(k, v) { bellek[k] = String(v); try { localStorage.setItem(k, String(v)); } catch (h) { } }
  function cikartmaTum() { try { var o = JSON.parse(oku('abk_cikartma') || '{}'); return o && typeof o === 'object' ? o : {}; } catch (h) { return {}; } }
  G.kayit = {
    yildiz: function (n) { var v = parseInt(oku('abk_yildiz_b' + n), 10); return v >= 1 && v <= 3 ? v : 0; },
    yildizYaz: function (n, y) { var e = this.yildiz(n); if (y > e) { yaz('abk_yildiz_b' + n, y); e = y; } return e; },
    yildizToplam: function () { var t = 0; for (var n = 1; n <= G.SON_BOLUM; n++) t += this.yildiz(n); return t; },
    yildizEnYuksek: function () { return 3 * G.SON_BOLUM; },
    ilkOyunBitti: function () { return this.yildizToplam() > 0; },
    cikartma: function (n) { var l = cikartmaTum()[n]; return Array.isArray(l) ? l : []; },
    cikartmaVar: function (n, i) { return this.cikartma(n).indexOf(i) >= 0; },
    cikartmaYaz: function (n, i) { var o = cikartmaTum(); var l = Array.isArray(o[n]) ? o[n] : []; if (l.indexOf(i) < 0) l.push(i); o[n] = l; yaz('abk_cikartma', JSON.stringify(o)); },
    rehber: function () { return oku('abk_rehber') || ''; },
    rehberYaz: function (v) { yaz('abk_rehber', v); }
  };
  // Aynı anda en fazla 2 aktif kovalayan (nöbetçi, uyanan ebeveyn, kedi, misafir arayıcı): çocuk sıkışmasın. haric = sayıma katılmayan ('komsu'|'uyanan'|'kedi'|'recep').
  G.KOVALAYAN_MAX = 2;
  G.kovalayanSayisi = function (d, haric) {
    d = d || G.d; var n = 0;
    if (!d) return 0;
    if (haric !== 'komsu' && d.komsu && d.komsu.durum === 'kovalama') n++;
    if (haric !== 'uyanan' && d.uyanan && d.uyanan.durum === 'kovalama') n++;
    if (haric !== 'kedi' && d.kedi && d.kedi.durum === 'takip') n++;
    if (haric !== 'recep' && d.recep && d.recep.durum === 'kovalama') n++;
    return n;
  };
  // Yeni bir kovalama başlayabilir mi? Kedi en düşük öncelikli: nöbetçi/uyanan başlayacaksa ve yer yoksa kedi bırakır.
  G.kovalamaIzni = function (d, kim) {
    d = d || G.d;
    if (G.kovalayanSayisi(d, kim) < G.KOVALAYAN_MAX) return true;
    if (kim !== 'kedi' && d && d.kedi && d.kedi.durum === 'takip' && G.kedi && G.kedi.birak) { G.kedi.birak(d); return G.kovalayanSayisi(d, kim) < G.KOVALAYAN_MAX; }
    return false;
  };
  G.bolumBilgi = function () { return G.bolumler[G.bolum] || G.bolumler[1]; };
  // Gökçe'nin yardım türü (bölüm verisinden): 'oyala' (varsayılan) | 'kat' | 'bebek' (Beren'i kucaklayıp pusetine götürür)
  G.gokceYardim = function () { var b = G.bolumBilgi(); return (b && b.gokceYardim) || 'oyala'; };

  var KISI = {
    baba: { ad: 'Enes Baba', yakala: 'Gıdıklanıp bahçeye gönderildin!', soz: 'Yakaladım! Gıdı gıdı gıdı!' },
    anne: { ad: 'Sümeyye Anne', yakala: 'Gıdıklanıp bahçeye gönderildin!', soz: 'Yakaladım! Hadi bakalım, öpücük cezası!' },
    dede: { ad: 'Mahmut Dede', yakala: 'Yanakların sıkılıp bahçeye gönderildin!', soz: 'Gel bakalım kuzum! Yanaklarını sıkayım!' },
    ebe: { ad: 'Hanife Ebe', yakala: 'Kurabiye yedirilip bahçeye gönderildin!', soz: 'Yakaladım! Hadi kurabiye ye bakalım!' },
    bekci: { ad: 'Bekçi Rıza', yakala: 'Düdük sesi! Rıza Bey seni nazikçe parkın dışına çıkardı.', soz: 'Dur bakalım! Parkta koşmak yok, küçük kaşif!' },
    bekci2: { ad: 'Bekçi Şahin', yakala: 'Şahin Abi seni yakaladı ve parkın kapısına kadar geçirdi!', soz: 'Yine mi sen, küçük kaşif? Dur bakalım!' },
    kedi: { ad: 'Duman', yakala: 'Duman paçana sarılıp sevgiyle mırladı: yakalandın!', soz: 'Miyav! Hızlı dolaş, yaramaz!' },
    ogretmen: { ad: 'Ayşe Hanım', yakala: "Ayşe Hanım seni nazikçe bahçe kapısına götürdü: 'Koşmak yok, tatlım!'", soz: 'Koşmak yok tatlım! Gel bakalım, sıraya!' },
    mudur: { ad: 'Kemal Bey', yakala: 'Kemal Bey sana kütüphanede bir hikâye okuttu!', soz: 'Gel bakalım evladım, birlikte hikâye okuyalım!' },
    dedehassi: { ad: 'Dede Hassi', yakala: 'Dede Hassi sana sımsıkı sarılıp gıdıkladı, sonra seni bahçeye çıkardı!', soz: 'Yakaladım seni! Gel bakalım, gıdı gıdı gıdı!' },
    anneanne: { ad: 'Anneanne', yakala: 'Anneanne seni sarıp sarmaladı!', soz: 'Gel yavrum, çayını iç!' },
    abariebe: { ad: 'Abari Ebe', yakala: 'Abari Ebe seni kucakladı!', soz: 'Gel kuzum gel!' },
    recepdede: { ad: 'Recep Dede', yakala: 'Recep Dede seni yakaladı ve cebinden bir şeker verdi!', soz: 'Yakaladım seni! Al bakalım, bir şeker!' },
    beren: { ad: 'Beren', yakala: 'Beren sana sarıldı! Bebek öpücüğü!', soz: 'Ba-ba! Gugu gaga! (Sarıldı!)' },
    teyze: { ad: 'Nefise Teyze', yakala: 'Nefise Teyze seni sevgiyle kucakladı!', soz: 'Aaa kuzum, hoş geldin!' },
    enistee: { ad: 'Uğurcan Enişte', yakala: 'Uğurcan Enişte seni havaya kaldırdı!', soz: 'Hoppala, yakaladım!' }
  };
  G.kisiAdi = function (kim) {
    if (kim === 'kedi') return 'Duman';
    return (KISI[kim] || KISI.baba).ad;
  };

  G.kisiYakalama = function (kim) { return (KISI[kim] || KISI.baba).yakala; };
  G.kisiSoz = function (kim) { return (KISI[kim] || KISI.baba).soz; };

  // Yazısız ipucu kademesi (sn): [arama noktası nabzı belirginleşir, yön oku gerçek noktaya öncelik verir, parıltı + Gökçe]
  var IPUCU = { 1: [15, 30, 45], 2: [20, 38, 52], 3: [25, 45, 60], 4: [30, 52, 68], 5: [32, 56, 74], 6: [36, 60, 80] };
  Object.keys(IPUCU).forEach(function (n) { if (G.bolumler[n]) G.bolumler[n].ipucu = IPUCU[n]; });

  // ilerleme kaydı (file:// altında localStorage kapalı olabilir)
  G.ilerleme = {
    bolumAcik: function (n) { n = n || 2; try { return localStorage.getItem('abk_bolum' + n) === '1'; } catch (h) { return false; } },
    bolum2Acik: function () { return this.bolumAcik(2); },
    kaydet: function () { try { localStorage.setItem('abk_bolum' + Math.min(G.SON_BOLUM || 2, (G.bolum || 1) + 1), '1'); } catch (h) { } }
  };
})();
