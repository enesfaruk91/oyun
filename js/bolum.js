window.G = window.G || {};
(function () {
  G.bolum = 1;
  G.SON_BOLUM = 7;   // bölüm sayısı: ilerleme/menü/final akışı bu değerden okur (kaç olursa olsun çalışır)
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
    if (G.minikMi()) return false;
    d = d || G.d;
    if (G.kovalayanSayisi(d, kim) < G.KOVALAYAN_MAX) return true;
    if (kim !== 'kedi' && d && d.kedi && d.kedi.durum === 'takip' && G.kedi && G.kedi.birak) { G.kedi.birak(d); return G.kovalayanSayisi(d, kim) < G.KOVALAYAN_MAX; }
    return false;
  };
  G.bolumBilgi = function () { return G.bolumler[G.bolum] || G.bolumler[1]; };
  // Gökçe'nin yardım türü (bölüm verisinden): 'oyala' (varsayılan) | 'kat' | 'bebek' (Beren'i kucaklayıp pusetine götürür)
  G.gokceYardim = function () { var b = G.bolumBilgi(); return (b && b.gokceYardim) || 'oyala'; };

  var KISI = {
    avmgorevli: { ad: 'AVM Görevlisi', yakala: 'Görevli gülümseyerek sana bir çıkartma verdi. Yeniden deneyelim!', soz: 'Buldum seni! Çak bir beşlik!' },
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

// Minik mod bütün arayıcılar için aynı ayarı okur.
G.minikMi = function () { return !!(G.ayarlar && G.ayarlar.deger.minik); };
G.minikSelam = function (e, o) {
  if (!G.minikMi()) return false;
  if (!e || !o || e.pasif || o.saklandi) return true;
  var d = G.d, dx = o.x - e.x, dy = o.y - e.y, fark = Math.atan2(dy, dx) - (e.yon || 0);
  fark = Math.atan2(Math.sin(fark), Math.cos(fark));
  if (Math.hypot(dx, dy) < (e.gorusMesafe || 300) && Math.abs(fark) < 1.2 &&
      !G.harita.gorusEngeli(e.x, e.y, o.x, o.y) && (!e.minikSelamT || d.zaman >= e.minikSelamT)) {
    e.konusma = { metin: 'Seni gördüm! Hihihi!', sure: 2.8 }; e.minikSelamT = d.zaman + 6;
    G.olay('minik_selam', { kim: e.kim });
  }
  if (e.durum === 'kovalama' || e.durum === 'yakaladi' || e.durum === 'takip') e.durum = 'devriye';
  e.uyari = 0;
  return true;
};

// Bölüm 7: denetlenen harita verisi, düz script ile file:// altında da yüklenir.
G.yeniHaritalar = G.yeniHaritalar || {};
G.yeniHaritalar[7] = {"bolum":7,"ad":"Bölüm 7: AVM Oyun Alanı","kisaAd":"AVM Oyun Alanı","genislik":44,"yukseklik":64,"ascii":["DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD","DD#########################################D","DD#hhhhhhhhhhhh#hhhhhhhhhhhhh#hhhhhhhhhhhh#D","DD#hhhhhhhhhhhh#hhhhhhhhhhhhh#hhhhhhhhhhhh#D","DD#hhhhhhhhhhhh#hhhhhhhhhhhhh#hhhhhhhhhhhh#D","DD#hhhhhhhhhhhh#hhhhhhhhhhhhh#hhhhhhhhhhhh#D","DD#hhhhhhhhhhhh#hhhhhhhhhhhhh#hhhhhhhhhhhh#D","DD#hhhhhhhhhhhh#hhhhhhhhhhhhh#hhhhhhhhhhhh#D","DD#hhhhhhhhhhhh#hhhhhhhhhhhhh#hhhhhhhhhhhh#D","DD#hhhhhhhhhhhh#hhhhhhhhhhhhh#hhhhhhhhhhhh#D","DD#hhhhhhhhhhhh#hhhhhhhhhhhhh#hhhhhhhhhhhh#D","DD#hhhhhhhhhhhh#hhhhhhhhhhhhh#hhhhhhhhhhhh#D","DD#######d############d#############K######D","DD#ppppppppppppppppppppppppppppppppppppppp#D","DD#ppppppppppppppppppppppppppppppppppppppp#D","DD#ppppppppppppppppppppppppppppppppppppppp#D","DD#ppppppppppppppppppppppppppppppppppppppp#D","DD#######d############d#############d######D","DD#hhhhhhhhhhhh#hhhhhhhhhhhhh#hhhhhhhhhhhh#D","DD#hhhhhhhhhhhh#hhhhhhhhhhhhh#hhhhhhhhhhhh#D","DD#hhhhhhhhhhhh#hhhhhhhhhhhhh#hhhhhhhhhhhh#D","DD#hhhhhhhhhhhh#hhhhhhhhhhhhh#hhhhhhhhhhhh#D","DD#hhhhhhhhhhhh#hhhhhhhhhhhhh#hhhhhhhhhhhh#D","DD#hhhhhhhhhhhh#hhhhhhhhhhhhh#hhhhhhhhhhhh#D","DD#hhhhhhhhhhhh#hhhhhhhhhhhhh#hhhhhhhhhhhh#D","DD#hhhhhhhhhhhh#hhhhhhhhhhhhh#hhhhhhhhhhhh#D","DD#hhhhhhhhhhhh#hhhhhhhhhhhhh#hhhhhhhhhhhh#D","DD#hhhhhhhhhhhh#hhhhhhhhhhhhh#hhhhhhhhhhhh#D","DD#########################################D","DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD","VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV","VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV","VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV","VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV","VV#########################################V","VV#ffffffffffff#fffffffffffff#ffffffffffff#V","VV#ffffffffffff#fffffffffffff#ffffffffffff#V","VV#ffffffffffff#fffffffffffff#ffffffffffff#V","VV#ffffffffffff#fffffffffffff#ffffffffffff#V","VV#ffffffffffff#fffffffffffff#ffffffffffff#V","VV#ffffffffffff#fffffffffffff#ffffffffffff#V","VV#ffffffffffff#fffffffffffff#ffffffffffff#V","VV#ffffffffffff#fffffffffffff#ffffffffffff#V","VV#ffffffffffff#fffffffffffff#ffffffffffff#V","VV#ffffffffffff#fffffffffffff#ffffffffffff#V","VV#######d############M#############d######V","VV#ppppppppppppppppppppppppppppppppppppppp#V","VV#ppppppppppppppppppppppppppppppppppppppp#V","VV#ppppppppppppppppppppppppppppppppppppppp#V","VV#ppppppppppppppppppppppppppppppppppppppp#V","VV#######d############d#############d######V","VV#ffffffffffff#fffffffffffff#ffffffffffff#V","VV#ffffffffffff#fffffffffffff#ffffffffffff#V","VV#ffffffffffff#fffffffffffff#ffffffffffff#V","VV#ffffffffffff#fffffffffffff#ffffffffffff#V","VV#ffffffffffff#fffffffffffff#ffffffffffff#V","VV#ffffffffffff#fffffffffffff#ffffffffffff#V","VV#ffffffffffff#fffffffffffff#ffffffffffff#V","VV#ffffffffffff#fffffffffffff#ffffffffffff#V","VV#ffffffffffff#fffffffffffff#ffffffffffff#V","VV#ffffffffffff#fffffffffffff#ffffffffffff#V","VV#########################################V","VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV","VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"],"sure":360,"zorluk":{"kovalama":175,"gorus":350,"gorusAci":1.2,"suphe":1.2,"nobet":55,"gokceHakki":2,"devriye":1.15},"arayiciKind":"avmgorevli","kapi":{"9,12":"k0_0_0","9,17":"k0_0_1","22,12":"k0_1_0","22,17":"k0_1_1","36,12":"k0_2_0","36,17":"k0_2_1","9,45":"k1_0_0","9,50":"k1_0_1","22,45":"k1_1_0","22,50":"k1_1_1","36,45":"k1_2_0","36,50":"k1_2_1"},"odalar":[{"ad":"Oyun Alanı","x":3,"y":2,"w":12,"h":10},{"ad":"Merdiven Holü","x":3,"y":18,"w":12,"h":10},{"ad":"Danışma","x":16,"y":2,"w":13,"h":10},{"ad":"Kitap Köşesi","x":16,"y":18,"w":13,"h":10},{"ad":"Depo","x":30,"y":2,"w":12,"h":10},{"ad":"Zıplama Alanı","x":30,"y":18,"w":12,"h":10},{"ad":"Ana Koridor","x":3,"y":13,"w":39,"h":4},{"ad":"Yemek Alanı","x":3,"y":35,"w":12,"h":10},{"ad":"Dinlenme Salonu","x":3,"y":51,"w":12,"h":10},{"ad":"Personel Odası","x":16,"y":35,"w":13,"h":10},{"ad":"Üst Oyun Alanı","x":16,"y":51,"w":13,"h":10},{"ad":"Mutfak","x":30,"y":35,"w":12,"h":10},{"ad":"Vitrin Sokağı","x":30,"y":51,"w":12,"h":10},{"ad":"Üst Koridor","x":3,"y":46,"w":39,"h":4}],"izinliOdalar":["Oyun Alanı","Merdiven Holü","Danışma","Kitap Köşesi","Depo","Zıplama Alanı","Ana Koridor","Yemek Alanı","Dinlenme Salonu","Personel Odası","Üst Oyun Alanı","Mutfak","Vitrin Sokağı","Üst Koridor"],"esya":[["mudur_divani",16,35,2,3,1,0,"Personel Divanı",0],["top_havuzu",3,2,4,4,1,0,"Renkli Top Havuzu",0],["kaydirak_buyuk",12,2,2,4,1,0,"Büyük Kaydırak",0],["tirmanma_agi",30,18,3,3,1,0,"Tırmanma Ağı",0],["trambolin",39,18,2,2,1,0,"Trambolin",0],["yumusak_blok",3,9,1,1,1,0,"Yumusak blok",0],["yumusak_blok",4,9,1,1,1,0,"Yumusak blok",0],["yumusak_blok",13,9,1,1,1,0,"Yumusak blok",0],["yumusak_blok",14,9,1,1,1,0,"Yumusak blok",0],["yumusak_blok",30,26,1,1,1,0,"Yumusak blok",0],["yumusak_blok",31,26,1,1,1,0,"Yumusak blok",0],["danisma_bankosu",16,2,4,1,1,0,"Danışma Bankosu",0],["avm_anons_mikrofonu",16,3,2,1,1,0,"AVM Anons Mikrofonu",0],["calisma_masasi",16,18,2,1,1,0,"Kitap Masası",0],["sandalye_avm",16,19,1,1,0,0,"Sandalye avm",2],["kitaplik",27,18,1,2,1,0,"Kitaplik",0],["kitaplik",28,18,1,2,1,0,"Kitaplik",0],["yuruyen_merdiven",11,20,2,4,1,0,"Yürüyen Merdiven",0],["yuruyen_merdiven",11,53,2,4,1,0,"Yürüyen Merdiven",0],["yemek_masasi",7,37,2,1,1,0,"Aile Masası",0],["sandalye_avm",7,38,1,1,1,0,"Sandalye avm",2],["sandalye_avm",8,36,1,1,1,0,"Sandalye avm",0],["yemek_masasi",3,42,2,1,1,0,"Yemek masasi",0],["sandalye_avm",3,41,1,1,0,0,"Sandalye avm",0],["yemek_masasi",12,42,2,1,1,0,"Yemek masasi",0],["sandalye_avm",12,41,1,1,0,0,"Sandalye avm",0],["avm_saksi",3,35,1,1,1,0,"Avm saksi",0],["avm_saksi",14,35,1,1,1,0,"Avm saksi",0],["avm_saksi",3,51,1,1,1,0,"Avm saksi",0],["avm_saksi",14,51,1,1,1,0,"Avm saksi",0],["avm_saksi",41,51,1,1,1,0,"Avm saksi",0],["avm_saksi",28,2,1,1,1,0,"Avm saksi",0],["dolap",27,35,1,1,1,0,"Personel Dolabı",0],["dolap",16,43,1,1,1,0,"Personel Dolabı",0],["dolap",27,43,1,1,1,0,"Personel Dolabı",0],["tezgah",30,35,2,1,1,0,"Tezgah",0],["buzdolabi",40,35,1,1,1,0,"Buzdolabi",0],["ocak",39,35,1,1,1,0,"Ocak",0],["lavabo",30,43,1,1,1,0,"Lavabo",0],["vitrin",30,51,2,1,1,0,"Vitrin",0],["vitrin",39,59,2,1,1,0,"Vitrin",0],["kutu",3,18,1,1,1,1,"Renkli Saklanma Kutusu",0],["kutu",30,2,1,1,1,1,"Renkli Saklanma Kutusu",0],["kutu",40,2,1,1,1,1,"Renkli Saklanma Kutusu",0],["kutu",16,26,1,1,1,1,"Renkli Saklanma Kutusu",0],["kutu",27,26,1,1,1,1,"Renkli Saklanma Kutusu",0],["kutu",3,59,1,1,1,1,"Renkli Saklanma Kutusu",0],["kutu",16,51,1,1,1,1,"Renkli Saklanma Kutusu",0],["kutu",27,51,1,1,1,1,"Renkli Saklanma Kutusu",0],["kutu",30,59,1,1,1,1,"Renkli Saklanma Kutusu",0],["hoparlor_direk",3,7,1,1,1,0,"AVM Hoparlörü",0],["hoparlor_direk",28,10,1,1,1,0,"AVM Hoparlörü",0],["hoparlor_direk",41,24,1,1,1,0,"AVM Hoparlörü",0],["hoparlor_direk",3,40,1,1,1,0,"AVM Hoparlörü",0],["bank",3,26,2,1,1,0,"Bank",0],["saksi",13,26,1,1,1,0,"Saksi",0],["vitrin",16,10,2,1,1,0,"Vitrin",0],["vitrin",27,3,2,1,1,0,"Vitrin",0],["raf_kavanoz",30,9,1,1,1,0,"Raf kavanoz",0],["varil",41,9,1,1,1,0,"Varil",0],["saksi",16,20,1,1,1,0,"Saksi",0],["saksi",28,26,1,1,1,0,"Saksi",0],["bank",39,26,2,1,1,0,"Bank",0],["kanepe",3,53,3,1,1,0,"Kanepe",0],["bank",3,57,2,1,1,0,"Bank",0],["bank",16,59,2,1,1,0,"Bank",0],["bank",27,59,2,1,1,0,"Bank",0],["oyuncak_sandigi",18,51,2,1,1,0,"Oyuncak sandigi",0],["vitrin",30,53,2,1,1,0,"Vitrin",0],["saksi",40,53,1,1,1,0,"Saksi",0],["cop_kutusu",30,40,1,1,1,0,"Cop kutusu",0],["saksi",41,43,1,1,1,0,"Saksi",0],["masa",19,35,2,1,1,0,"Masa",0],["kutu",3,10,1,1,1,0,"Kutu",0],["saksi",14,10,1,1,1,0,"Saksi",0],["kutu",27,10,1,1,1,0,"Kutu",0],["kutu",40,10,1,1,1,0,"Kutu",0],["saksi",3,19,1,1,1,0,"Saksi",0]],"kat":{"sinir":31,"dy":33,"ad":["Oyun Katı","Yemek Katı"]},"portal":[[11,24,11,57],[12,24,12,57]],"dekorCephe":null,"oturan":[{"kim":"anne","tx":7,"ty":38,"yon":2,"oturY":0.25,"yemek":true},{"kim":"baba","tx":8,"ty":36,"yon":0,"oturY":0.25,"yemek":true}],"yardimci":null,"kazandiBaslik":"TOPUNU KURTARDIN!","kazandiAlt":"Hep birlikte kocaman bir alkış!","duraklatAlt":"Oyun seni burada bekliyor.","anons":{"tur":"anons","gidis":"Küçük bir sürprizim var!","soz":"DİKKAT! OYUN ŞENLİĞİ BAŞLIYOR!","uyandi":"şenlik anonsunu duydu","suphe":"Şenlik nerede acaba?","ad":"Şenlik Anonsu"},"oyuncu":[8,8],"arayici":[22,22],"kestirme":[16,35],"mikrofon":[17,4],"abla":[16,19],"kazaTur":"trambolin","kaza":[38,20],"hoparlorler":[[3,7],[28,10],[41,24],[3,40]],"hedefOda":"Depo","kilitliOdalar":{"anahtar_mavi":"Personel Odası","anahtar_kirmizi":"Depo"},"cikartma":[[13,7],[26,24],[13,39]],"cikartmaBilgi":[{"r":"balon","ad":"Balon"},{"r":"trambolin","ad":"Trambolin"},{"r":"dondurma","ad":"Dondurma"}],"hikaye":["Topumuz AVM deposuna yuvarlandı!","Anne ve baba yemek yerken oyun alanını keşfedelim.","Anahtarlar çekmecelerde; görevli yorulunca dinlenir.","Yürüyen merdivenle üst kata çık, ipuçlarını bul!"],"devriye":[[8,8,1],[22,7,1],[9,14,1],[22,14,1],[35,14,1],[8,24,1],[22,22,1],[36,23,1],[8,40,1],[22,40,1],[35,40,1],[9,47,1],[22,47,1],[35,47,1],[8,57,1],[22,55,1],[36,56,1]],"arama":[["anahtar_mavi",16,2,"Burada yalnız renkli kurdeleler var!"],["anahtar_mavi",16,18,"Burada yalnız renkli kurdeleler var!"],["anahtar_mavi",30,35,"Burada yalnız renkli kurdeleler var!"],["anahtar_kirmizi",27,35,"Burada yalnız renkli kurdeleler var!"],["anahtar_kirmizi",16,43,"Burada yalnız renkli kurdeleler var!"],["anahtar_kirmizi",27,43,"Burada yalnız renkli kurdeleler var!"]],"topla":[["mavi_anahtar","anahtar_mavi",16,2],["kirmizi_anahtar","anahtar_kirmizi",27,35],["top","top_hazine",36,6],["elma1","elma",10,8],["elma2","elma",21,7],["elma3","elma",34,23],["teneke1","teneke",8,25],["teneke2","teneke",22,24],["ordek1","oyuncak_ordek",36,25],["ordek2","oyuncak_ordek",10,40],["ordek3","oyuncak_ordek",22,41],["kurabiye1","kurabiye",34,40],["kurabiye2","kurabiye",22,56],["kurabiye3","kurabiye",36,57]],"gorev":{"maviYok":"Parlayan ipuçlarını izle, mavi anahtarı ara.","maviVar":"Personel Odası kapısını aç.","kirmiziYok":"Personel Odası içinde kırmızı anahtarı ara.","kirmiziVar":"Depo kapısını aç, topunu al!"}};
G.bolumler[7] = Object.assign({}, G.yeniHaritalar[7], {
 no: 7, kimler: ['avmgorevli'], ilkNobetci: 'avmgorevli', tekKisi: true,
 ekSure: 60, kestirme: { sure: [16,24] }, gokceYardim: 'oyala', ipucu: [25,45,60],
 avm: true, anonsSerbest: true, cikartma: G.yeniHaritalar[7].cikartmaBilgi,
 gecis: [], kisiler: 'AVM Görevlisi · Anne · Baba'
});
G.bolumler[6].gecis = ['Topu Beren ile birlikte kurtardın!', 'Şimdi ailece AVM oyun alanına gidiyoruz.', 'Top havuzu, trambolin ve yürüyen merdiven seni bekliyor!', 'Görevlinin ipuçlarını bul, depodaki topunu al!'];
