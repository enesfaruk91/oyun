window.G = window.G || {};
(function () {
  'use strict';
  var T = 48;

  // ---- ASCII HARITALAR (44 genis) ----------------------------------------
  // D dis(kati)  c cit  . cim  - kaldirim  = yol  # duvar  t toprak  g cakil
  // p parke  f fayans  h hali  b bodrum  k kilim  e eski_parke  r kiler
  // s saha (basketbol sahasi)
  // d kapi  M kapi(kilit mavi)  K kapi(kilit kirmizi)

  // BOLUM 1: Annemle Babamin Evi (44 x 38). Guney seridi (satir 31+) Ebe-Dede evinin on cephesi (dekor, girilmez).
  var ASCII1 = [
    'DDcccccccccccccccccccccccccccccccccccccccccD',
    'DDc.......................................cD',
    'DDc........#######################........cD',
    'DDc........#fffffff#ffff#hhhhhhhh#........cD',
    'DDc........#fffffff#ffff#hhhhhhhh#........cD',
    'DDc........#fffffff#ffff#hhhhhhhh#........cD',
    'DDc........dfffffff#ffff#hhhhhhhh#........cD',
    'DDc........#fffffff#ffff#hhhhhhhh########.cD',
    'DDc........#fffffff#ffff#hhhhhhhh#tttttt#.cD',
    'DDc........#####d####d######M#####tttttt#.cD',
    'DDc........#ppppppppppppppppppppp#tttttt#.cD',
    'DDc........#pppppppppppppppppppppdtttttt#.cD',
    'DDc........#ppppppppppppppppppppp#tttttt#.cD',
    'DDc........#####d###pppp##########tttttt#.cD',
    'DDc........#hhhhhhh#pppp#bbbbbbbb####d###.cD',
    'DDc........#hhhhhhh#pppp#bbbbbbbb#........cD',
    'DDc........#hhhhhhh#pppp#bbbbbbbb#........cD',
    'DDc........#####hhhdppppKbbbbbbbb#........cD',
    'DDc........#hhhdhhh#pppp#bbbbbbbb#........cD',
    'DDc........#hhh#hhh#pppp#bbbbbbbb#........cD',
    'DDc........#hhh#hhh#pppp#bbbbbbbb#........cD',
    'DDc........###########d###########........cD',
    'DDc..................---..................cD',
    'DDc..................---..................cD',
    'DDc..................---..................cD',
    'DDccccccccccccccccccc---cccccccccccccccccccD',
    '--------------------------------------------',
    '============================================',
    '============================================',
    '--------------------------------------------',
    '....cccc...cccc.............................',
    'DDcccccccccccccccccccccccccccccccccccccccccD',
    'DDc.......................................cD',
    'DDc.......................................cD',
    'DDc.....############################......cD',
    'DDc.....############################......cD',
    'DDc.....############################......cD',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD'
  ];

  // BOLUM 2: Ebe-Dede Evi (44 x 36). Kuzey: sokak + aile evi cephesi (dekor); guney: bahce + ev.
  var ASCII2 = [
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    '......################################......',
    '......################################......',
    '......################################......',
    'DDcccccccccccccccccccccccccccccccccccccccccD',
    '--------------------------------------------',
    '============================================',
    '============================================',
    '--------------------------------------------',
    'DDcccccccccccccccccccgggcccccccccccccccccccD',
    'DDc..................ggg..................cD',
    'DDc..................gggggggggggggg.......cD',
    'DDc..................ggg..........g.......cD',
    'DDc........###########d###########g.......cD',
    'DDc........#fffffff#eeeee#kkkkkkk#g.......cD',
    'DDc........#fffffff#eeeee#kkkkkkk#g######.cD',
    'DDc........#fffffff#eeeee#kkkkkkk#g#tttt#.cD',
    'DDc........#fffffffdeeeeedkkkkkkk#g#tttt#.cD',
    'DDc........#fffffff#eeeee#kkkkkkk#g#tttt#.cD',
    'DDc........#fffffff#eeeee#kkkkkkk#g##d###.cD',
    'DDc........####d######d######d####gggg....cD',
    'DDc........#eeeeeeeeeeeeeeeeeeeee#........cD',
    'DDc........deeeeeeeeeeeeeeeeeeeee#........cD',
    'DDc........#eeeeeeeeeeeeeeeeeeeee#........cD',
    'DDc........##d####d#####M#####K###........cD',
    'DDc........#ffff#pppp#eeeeee#rrrr#........cD',
    'DDc........#ffff#pppp#eeeeee#rrrr#........cD',
    'DDc........#ffff#pppp#eeeeee#rrrr#........cD',
    'DDc........#ffff#pppp#eeeeee#rrrr#........cD',
    'DDc........#######################........cD',
    'DDc.......................................cD',
    'DDc.......................................cD',
    'DDc.......................................cD',
    'DDc.......................................cD',
    'DDcccccccccccccccccccccccccccccccccccccccccD',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD'
  ];

  // BOLUM 4: Okul Bahcesi (44 x 34). Kuzey: sokak + iki bahce kapisi; ortada bahce; guneyde okul binasi (Koridor, 5 oda).
  var ASCII4 = [
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    '--------------------------------------------',
    '============================================',
    '============================================',
    '--------------------------------------------',
    'DDccccccccdcccccccccdccccccccccccccccccccccD',
    'DDc.......g.........g.....................cD',
    'DDc.......g.........g......sssssssssssss..cD',
    'DDc.......g.........g......sssssssssssss..cD',
    'DDc.......g.........g......sssssssssssss..cD',
    'DDc.......g.........g......sssssssssssss..cD',
    'DDc.......g.........g......sssssssssssss..cD',
    'DDc.......g.........g......sssssssssssss..cD',
    'DDc.......g.........g......sssssssssssss..cD',
    'DDc.......g.........g......sssssssssssss..cD',
    'DDc.......g.........g......sssssssssssss..cD',
    'DDc.......g.........g......sssssssssssss..cD',
    'DDc.......ggggggggggg.....................cD',
    'DDc.......g.........g.....................cD',
    'DDc....---g---------g----------------.....cD',
    'DDc...####d#########d#################....cD',
    'DDc...#ffffffffffffffffffffffffffffff#....cD',
    'DDc...#ffffffffffffffffffffffffffffff#....cD',
    'DDc...#ffffffffffffffffffffffffffffff#....cD',
    'DDc...####M#####d#######d###d#####K###....cD',
    'DDc...#pppppp#hhhhhh#pppp#ffffff#bbbb#....cD',
    'DDc...#pppppp#hhhhhh#pppp#ffffff#bbbb#....cD',
    'DDc...#pppppp#hhhhhh#pppp#ffffff#bbbb#....cD',
    'DDc...#pppppp#hhhhhh#pppp#ffffff#bbbb#....cD',
    'DDc...#pppppp#hhhhhh#pppp#ffffff#bbbb#....cD',
    'DDc...#pppppp#hhhhhh#pppp#ffffff#bbbb#....cD',
    'DDc...################################....cD',
    'DDcccccccccccccccccccccccccccccccccccccccccD',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD'
  ];

  var ZEMIN = { 'D': 'dis', 'c': 'cit', '.': 'cim', '-': 'kaldirim', '=': 'yol', '#': 'duvar', 't': 'toprak',
    'p': 'parke', 'f': 'fayans', 'h': 'hali', 'b': 'bodrum', 'd': 'parke', 'M': 'parke', 'K': 'parke',
    'k': 'kilim', 'e': 'eski_parke', 'r': 'kiler', 'g': 'cakil', 's': 'saha', 'V': 'bosluk', 'o': 'oyun' };
  var KAPI_ZEMIN2 = 'eski_parke';

  // ---- BOLUM 1 verisi --------------------------------------------------
  // [tur, tx, ty, w, h, katı, saklanma, ad, yon]
  var ESYA1 = [
    // Mutfak
    ['buzdolabi', 12, 3, 1, 2, 1, 0, 'Buzdolabı'], ['tezgah', 13, 3, 3, 1, 1, 0, 'Tezgâh'], ['ocak', 16, 3, 1, 1, 1, 0, 'Ocak'],
    ['lavabo', 17, 3, 1, 1, 1, 0, 'Evye'], ['tezgah', 18, 3, 1, 1, 1, 0, 'Tezgâh'],
    ['masa', 14, 5, 3, 2, 1, 0, 'Yemek Masası'], ['sandalye', 13, 5, 1, 1, 1, 0, 'Sandalye'], ['sandalye', 17, 5, 1, 1, 1, 0, 'Sandalye'],
    ['sandalye', 15, 7, 1, 1, 1, 0, 'Sandalye'], ['dolap', 12, 8, 1, 1, 1, 1, 'Dolap'], ['cop_kutusu', 18, 8, 1, 1, 1, 1, 'Çöp Kutusu'],
    // Banyo
    ['lavabo', 20, 3, 1, 1, 1, 0, 'Lavabo'], ['kuvet', 22, 3, 2, 2, 1, 0, 'Küvet'], ['klozet', 23, 6, 1, 1, 1, 0, 'Klozet'],
    ['camasir_makinesi', 20, 6, 1, 1, 1, 0, 'Çamaşır Makinesi'], ['saksi', 23, 8, 1, 1, 1, 0, 'Saksı'],
    // Yatak odası (ilk 'yatak' = ebeveyn yatağı)
    ['gardirop', 25, 3, 2, 1, 1, 1, 'Gardırop'], ['yatak', 30, 3, 2, 3, 1, 1, 'Yatak'], ['kitaplik', 32, 6, 1, 2, 1, 0, 'Kitaplık'],
    ['sandalye', 26, 7, 1, 1, 1, 0, 'Sandalye'],
    // EK-6: home studio (Yatak Odası)
    ['studyo_masasi', 25, 4, 2, 1, 1, 0, 'Stüdyo Masası'], ['mikrofon', 27, 3, 1, 1, 1, 0, 'Mikrofon'], ['hoparlor', 29, 3, 1, 1, 1, 0, 'Hoparlör'],
    // Koridor
    ['saksi', 12, 10, 1, 1, 1, 0, 'Saksı'], ['saksi', 30, 10, 1, 1, 1, 0, 'Saksı'], ['saksi', 12, 12, 1, 1, 1, 0, 'Saksı'],
    ['kutu', 30, 12, 1, 1, 1, 1, 'Kutu'],
    // Salon
    ['tv', 13, 14, 2, 1, 1, 0, 'Televizyon'], ['kitaplik', 18, 14, 1, 2, 1, 0, 'Kitaplık'], ['koltuk', 12, 15, 1, 2, 1, 0, 'Koltuk'],
    ['masa', 14, 16, 2, 1, 1, 0, 'Sehpa'], ['kanepe', 16, 20, 3, 1, 1, 0, 'Kanepe'], ['dolap', 18, 19, 1, 1, 1, 1, 'Dolap'],
    // Hol
    ['dolap', 20, 14, 1, 2, 1, 1, 'Dolap'], ['saksi', 20, 20, 1, 1, 1, 0, 'Saksı'], ['saksi', 23, 19, 1, 1, 1, 0, 'Saksı'],
    // Bodrum
    ['merdiven', 25, 14, 1, 2, 1, 0, 'Merdiven'], ['tezgah_atolye', 29, 14, 3, 1, 1, 0, 'Atölye Tezgâhı'], ['varil', 27, 15, 1, 1, 1, 1, 'Varil'],
    ['varil', 30, 17, 1, 1, 1, 1, 'Varil'], ['kutu', 26, 19, 1, 1, 1, 1, 'Kutu'], ['kutu', 31, 18, 1, 1, 1, 1, 'Kutu'],
    // Gökçe'nin Odası (EK-5) — ebeveyn yatağından SONRA
    ['calisma_masasi', 12, 18, 2, 1, 1, 0, 'Çalışma Masası'], ['sandalye', 12, 19, 1, 1, 0, 0, 'Sandalye', 2],
    ['yatak', 13, 20, 2, 1, 1, 1, 'Gökçe\'nin Yatağı', 1], ['kitaplik', 12, 20, 1, 1, 1, 0, 'Kitaplık'], ['saksi', 17, 15, 1, 1, 1, 0, 'Saksı'],
    // Garaj
    ['araba', 35, 8, 3, 2, 1, 0, 'Araba'], ['tezgah_atolye', 39, 8, 1, 3, 1, 0, 'Alet Tezgâhı'], ['kutu', 39, 12, 1, 1, 1, 1, 'Kutu'],
    ['varil', 34, 13, 1, 1, 1, 1, 'Varil'],
    // Bahçe
    ['agac', 4, 1, 2, 2, 1, 0, 'Ağaç'], ['salincak', 4, 7, 3, 2, 1, 0, 'Salıncak'], ['kopek_kulubesi', 5, 12, 2, 2, 1, 0, 'Köpek Kulübesi'],
    ['agac', 7, 19, 2, 2, 1, 0, 'Ağaç'], ['agac', 37, 2, 2, 2, 1, 0, 'Ağaç'], ['agac', 39, 19, 2, 2, 1, 0, 'Ağaç'],
    ['agac', 12, 22, 2, 2, 1, 0, 'Ağaç'], ['agac', 28, 22, 2, 2, 1, 0, 'Ağaç'],
    ['cali', 3, 10, 1, 1, 0, 1, 'Çalı'], ['cali', 9, 15, 1, 1, 0, 1, 'Çalı'], ['cali', 3, 17, 1, 1, 0, 1, 'Çalı'],
    ['cali', 16, 23, 1, 1, 0, 1, 'Çalı'], ['cali', 31, 23, 1, 1, 0, 1, 'Çalı'], ['cali', 9, 23, 1, 1, 0, 1, 'Çalı'],
    ['cali', 20, 1, 1, 1, 0, 1, 'Çalı'], ['cali', 28, 1, 1, 1, 0, 1, 'Çalı'], ['cali', 36, 16, 1, 1, 0, 1, 'Çalı'],
    ['cali', 41, 10, 1, 1, 0, 1, 'Çalı'], ['cali', 34, 23, 1, 1, 0, 1, 'Çalı'],
    ['bisiklet', 36, 21, 2, 1, 1, 0, 'Bisiklet'], ['posta_kutusu', 19, 24, 1, 1, 1, 0, 'Posta Kutusu'],
    // Ogeday'ın sokağı
    ['posta_kutusu', 5, 29, 1, 1, 1, 0, 'Posta Kutusu'], ['araba', 30, 30, 3, 1, 1, 0, 'Araba'],
    // Sokağın karşısı: Ebe-Dede evinin ön cephesi (dekor, girilmez; çit satırı 31, ev duvarı 34-36)
    ['posta_kutusu', 21, 32, 1, 1, 1, 0, 'Ebe & Dede'],
    ['cicek', 8, 32, 1, 1, 1, 0, 'Çiçek'], ['cicek', 10, 33, 1, 1, 1, 0, 'Çiçek'], ['cicek', 13, 32, 1, 1, 1, 0, 'Çiçek'],
    ['cicek', 17, 33, 1, 1, 1, 0, 'Çiçek'], ['cicek', 25, 32, 1, 1, 1, 0, 'Çiçek'], ['cicek', 29, 33, 1, 1, 1, 0, 'Çiçek'],
    ['cicek', 33, 32, 1, 1, 1, 0, 'Çiçek'], ['cicek', 37, 33, 1, 1, 1, 0, 'Çiçek'], ['cicek', 41, 32, 1, 1, 1, 0, 'Çiçek'],
    ['agac', 3, 32, 2, 2, 1, 0, 'Ağaç'], ['bank', 15, 32, 2, 1, 1, 0, 'Bank']
  ];

  // [id, tur, tx, ty]
  var TOPLA1 = [
    ['mavi_anahtar', 'anahtar_mavi', 13, 7], ['kirmizi_anahtar', 'anahtar_kirmizi', 30, 7], ['top', 'top_hazine', 32, 20],
    ['elma1', 'elma', 6, 5], ['elma2', 'elma', 10, 19], ['elma3', 'elma', 21, 18],
    ['teneke1', 'teneke', 38, 11], ['teneke2', 'teneke', 26, 23],
    ['ordek1', 'oyuncak_ordek', 8, 10], ['ordek2', 'oyuncak_ordek', 22, 11], ['ordek3', 'oyuncak_ordek', 40, 22],
    ['kurabiye1', 'kurabiye', 13, 16], ['kurabiye2', 'kurabiye', 18, 5]
  ];

  // Gizli çıkartmalar [tx, ty] (bolum.js G.bolumler[n].cikartma ile aynı sıra). Yan yollar; yalnız B4 3. çıkartma mavi kapı (Öğretmenler Odası) arkasında.
  var CIKARTMA_YER = {
    1: [[4, 15], [36, 12], [40, 17]],
    2: [[36, 17], [28, 19], [6, 33]],
    3: [[14, 28], [40, 14], [7, 10]],
    4: [[23, 26], [34, 17], [11, 26]],
    5: [[32, 27], [13, 50], [4, 30]],
    6: [[37, 29], [15, 9], [20, 28]]
  };

  var ODALAR1 = [
    { ad: 'Gökçe\'nin Odası', x: 12, y: 18, w: 3, h: 3 }, { ad: 'Mutfak', x: 12, y: 3, w: 7, h: 6 }, { ad: 'Banyo', x: 20, y: 3, w: 4, h: 6 },
    { ad: 'Yatak Odası', x: 25, y: 3, w: 8, h: 6 }, { ad: 'Koridor', x: 12, y: 10, w: 21, h: 3 },
    { ad: 'Giriş Holü', x: 20, y: 13, w: 4, h: 8 }, { ad: 'Salon', x: 12, y: 14, w: 7, h: 7 },
    { ad: 'Bodrum', x: 25, y: 14, w: 8, h: 7 }, { ad: 'Garaj', x: 34, y: 8, w: 6, h: 6 }
  ];

  // devriye: [tx, ty, bekle]
  var DEVRIYE1 = [
    [16, 7, 2], [16, 11, 1], [21, 6, 1.5], [22, 11, 1], [28, 7, 2], [30, 11, 1], [36, 12, 2.5], [26, 11, 1],
    [22, 16, 1], [28, 18, 2], [22, 15, 1], [16, 18, 2], [22, 19, 1], [22, 23, 2], [10, 23, 1.5], [9, 12, 2], [7, 5, 2], [10, 6, 1]
  ];

  var KAPI1 = { '16,9': 'mutfak', '21,9': 'banyo', '28,9': 'yatak', '16,13': 'salon', '19,17': 'salon_hol', '24,17': 'bodrum',
    '22,21': 'on', '15,18': 'gokce', '33,11': 'garaj_ic', '37,14': 'garaj_dis', '11,6': 'arka' };

  // ---- BOLUM 2 verisi: Ebe-Dede Evi ------------------------------------
  var ESYA2 = [
    // Yatak Odası (ilk 'yatak' = Ebe-Dede yatağı)
    ['yatak', 22, 26, 2, 3, 1, 1, 'Ebe-Dede Yatağı'], ['gardirop', 26, 25, 2, 1, 1, 1, 'Gardırop'],
    ['sandik', 26, 28, 1, 1, 1, 0, 'Sandık'], ['orgu_sepeti', 27, 28, 1, 1, 1, 0, 'Örgü Sepeti'], ['saksi', 25, 28, 1, 1, 1, 0, 'Saksı'],
    // Mutfak
    ['buzdolabi', 12, 14, 1, 2, 1, 0, 'Buzdolabı'], ['tezgah', 13, 14, 3, 1, 1, 0, 'Tezgâh'], ['ocak', 16, 14, 1, 1, 1, 0, 'Ocak'],
    ['lavabo', 17, 14, 1, 1, 1, 0, 'Evye'], ['firin', 18, 14, 1, 1, 1, 0, 'Fırın'], ['kurabiye_tepsisi', 18, 15, 1, 1, 1, 0, 'Kurabiye Tepsisi'],
    ['masa', 13, 16, 3, 2, 1, 0, 'Yemek Masası'], ['sandalye', 12, 16, 1, 1, 1, 0, 'Sandalye'], ['sandalye', 16, 16, 1, 1, 1, 0, 'Sandalye'],
    ['dolap', 12, 19, 1, 1, 1, 1, 'Dolap'], ['cop_kutusu', 18, 19, 1, 1, 1, 1, 'Çöp Kutusu'],
    // Giriş
    ['duvar_saati', 20, 14, 1, 1, 1, 0, 'Duvar Saati'], ['saksi', 24, 14, 1, 1, 1, 0, 'Saksı'], ['bank', 21, 15, 2, 1, 1, 0, 'Bank'],
    ['saksi', 20, 19, 1, 1, 1, 0, 'Saksı'], ['dolap', 24, 19, 1, 1, 1, 1, 'Palto Dolabı'],
    // Oturma Odası
    ['eski_tv', 27, 14, 2, 1, 1, 0, 'Eski Televizyon'], ['karaoke', 31, 14, 2, 1, 1, 0, 'Karaoke'],
    ['kanepe', 27, 16, 3, 1, 1, 0, 'Kanepe'], ['masa', 27, 18, 2, 1, 1, 0, 'Sehpa'], ['sallanan_koltuk', 30, 17, 1, 1, 1, 0, 'Sallanan Koltuk'],
    // Koridor
    ['saksi', 17, 21, 1, 1, 1, 0, 'Saksı'], ['saksi', 32, 21, 1, 1, 1, 0, 'Saksı'], ['kutu', 32, 23, 1, 1, 1, 1, 'Kutu'], ['saksi', 15, 23, 1, 1, 1, 0, 'Saksı'],
    // Banyo
    ['lavabo', 12, 26, 1, 1, 1, 0, 'Lavabo'], ['klozet', 15, 25, 1, 1, 1, 0, 'Klozet'], ['kuvet', 14, 27, 2, 2, 1, 0, 'Küvet'],
    ['camasir_makinesi', 12, 28, 1, 1, 1, 0, 'Çamaşır Makinesi'],
    // Gökçe'nin Köşesi
    ['calisma_masasi', 19, 26, 2, 1, 1, 0, 'Çalışma Masası'], ['sandalye', 19, 27, 1, 1, 0, 0, 'Sandalye', 2],
    ['kitaplik', 17, 27, 1, 2, 1, 0, 'Kitaplık'], ['saksi', 20, 28, 1, 1, 1, 0, 'Saksı'],
    // Kiler
    ['raf_kavanoz', 29, 26, 1, 1, 1, 0, 'Kavanoz Rafı'], ['raf_kavanoz', 32, 25, 1, 2, 1, 0, 'Kavanoz Rafı'],
    ['cuval', 29, 27, 1, 1, 1, 1, 'Çuval'], ['cuval', 29, 28, 1, 1, 1, 0, 'Çuval'],
    ['tursu_bidonu', 32, 27, 1, 1, 1, 1, 'Turşu Bidonu'], ['tursu_bidonu', 32, 28, 1, 1, 1, 0, 'Turşu Bidonu'],
    // Kümes
    ['kumes', 38, 16, 2, 2, 1, 1, 'Kümes'], ['tavuk', 39, 18, 1, 1, 1, 0, 'Tavuk'],
    // Bahçe
    ['agac', 4, 11, 2, 2, 1, 0, 'Elma Ağacı'], ['agac', 4, 26, 2, 2, 1, 0, 'Armut Ağacı'], ['agac', 37, 24, 2, 2, 1, 0, 'Kiraz Ağacı'],
    ['agac', 38, 28, 2, 2, 1, 0, 'Elma Ağacı'], ['agac', 14, 31, 2, 2, 1, 0, 'Erik Ağacı'], ['agac', 27, 31, 2, 2, 1, 0, 'Ayva Ağacı'],
    ['su_kuyusu', 7, 14, 2, 2, 1, 0, 'Su Kuyusu'], ['bank', 16, 11, 2, 1, 1, 0, 'Bank'], ['posta_kutusu', 20, 10, 1, 1, 1, 0, 'Posta Kutusu'],
    ['cicek', 13, 12, 1, 1, 0, 0, 'Çiçek'], ['cicek', 15, 12, 1, 1, 0, 0, 'Çiçek'], ['cicek', 17, 12, 1, 1, 0, 0, 'Çiçek'],
    ['cicek', 19, 12, 1, 1, 0, 0, 'Çiçek'], ['cicek', 25, 12, 1, 1, 0, 0, 'Çiçek'], ['cicek', 27, 12, 1, 1, 0, 0, 'Çiçek'],
    ['cicek', 29, 12, 1, 1, 0, 0, 'Çiçek'], ['cicek', 31, 12, 1, 1, 0, 0, 'Çiçek'], ['cicek', 5, 21, 1, 1, 0, 0, 'Çiçek'],
    ['cicek', 7, 30, 1, 1, 0, 0, 'Çiçek'], ['cicek', 40, 12, 1, 1, 0, 0, 'Çiçek'],
    ['cali', 3, 13, 1, 1, 0, 1, 'Çalı'], ['cali', 9, 12, 1, 1, 0, 1, 'Çalı'], ['cali', 3, 22, 1, 1, 0, 1, 'Çalı'],
    ['cali', 9, 28, 1, 1, 0, 1, 'Çalı'], ['cali', 3, 32, 1, 1, 0, 1, 'Çalı'], ['cali', 20, 32, 1, 1, 0, 1, 'Çalı'],
    ['cali', 32, 32, 1, 1, 0, 1, 'Çalı'], ['cali', 41, 24, 1, 1, 0, 1, 'Çalı'], ['cali', 34, 26, 1, 1, 0, 1, 'Çalı'],
    ['cali', 41, 31, 1, 1, 0, 1, 'Çalı'],
    ['tavuk', 34, 23, 1, 1, 1, 0, 'Tavuk'], ['tavuk', 36, 22, 1, 1, 1, 0, 'Tavuk'], ['tavuk', 40, 22, 1, 1, 1, 0, 'Tavuk'],
    ['tavuk', 31, 31, 1, 1, 1, 0, 'Tavuk'], ['tavuk', 10, 30, 1, 1, 1, 0, 'Tavuk'], ['tavuk', 24, 32, 1, 1, 1, 0, 'Tavuk'],
    // Kuzey: Annemle Babamın evinin ön cephesi (dekor)
    ['posta_kutusu', 5, 5, 1, 1, 1, 0, 'Posta Kutusu']
  ];

  var TOPLA2 = [
    ['mavi_anahtar', 'anahtar_mavi', 36, 16], ['kirmizi_anahtar', 'anahtar_kirmizi', 26, 27], ['top', 'top_hazine', 31, 28],
    ['elma1', 'elma', 6, 13], ['elma2', 'elma', 16, 33], ['elma3', 'elma', 37, 26],
    ['teneke1', 'teneke', 30, 12], ['teneke2', 'teneke', 8, 27],
    ['ordek1', 'oyuncak_ordek', 20, 22], ['ordek2', 'oyuncak_ordek', 40, 14],
    ['kurabiye1', 'kurabiye', 17, 16], ['kurabiye2', 'kurabiye', 30, 19], ['kurabiye3', 'kurabiye', 13, 18]
  ];

  var ODALAR2 = [
    { ad: 'Mutfak', x: 12, y: 14, w: 7, h: 6 }, { ad: 'Giriş', x: 20, y: 14, w: 5, h: 6 }, { ad: 'Oturma Odası', x: 26, y: 14, w: 7, h: 6 },
    { ad: 'Koridor', x: 12, y: 21, w: 21, h: 3 }, { ad: 'Banyo', x: 12, y: 25, w: 4, h: 4 }, { ad: 'Gökçe\'nin Köşesi', x: 17, y: 25, w: 4, h: 4 },
    { ad: 'Yatak Odası', x: 22, y: 25, w: 6, h: 4 }, { ad: 'Kiler', x: 29, y: 25, w: 4, h: 4 }, { ad: 'Kümes', x: 36, y: 16, w: 4, h: 3 }
  ];

  var DEVRIYE2 = [
    [14, 18, 2], [22, 16, 1.5], [29, 18, 2], [28, 22, 1], [30, 27, 1.5], [24, 27, 2], [18, 26, 1.5], [13, 27, 1.5], [16, 22, 1],
    [8, 22, 1.5], [7, 12, 2], [22, 11, 1], [34, 12, 1.5], [37, 17, 2], [37, 21, 1.5], [34, 31, 1.5], [22, 31, 1.5], [9, 31, 1.5]
  ];

  var KAPI2 = { '22,13': 'on', '19,17': 'mutfak_giris', '25,17': 'oturma', '15,20': 'mutfak', '22,20': 'giris_koridor', '29,20': 'oturma_koridor',
    '13,24': 'banyo', '18,24': 'gokce', '24,24': 'yatak', '30,24': 'kiler', '11,22': 'arka', '37,19': 'kumes' };

  // BOLUM 3: Belediye Parki (44 x 34). Kuzey: sokak (kaldırım + yol); çit satırı 5'te iki park kapısı.
  var ASCII3 = [
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    '--------------------------------------------',
    '============================================',
    '============================================',
    '--------------------------------------------',
    'DDccccccccdccccccccccccccccccccccdcccccccccD',
    'DD........g......................g........cD',
    'DD.#######g.............#########g........cD',
    'DD.#ggggg#g.............#ggggggg#g........cD',
    'DD.#ggggg#g.............#ggggggg#g........cD',
    'DD.#ggggg#g.............#ggggggg#g........cD',
    'DD.#ggggg#g.............#ggggggg#g........cD',
    'DD.###d###g.............######M##g........cD',
    'DD........g......................g........cD',
    'DD........g......................g........cD',
    'DD........g......................g........cD',
    'DD........gggggggggggggggggggggggg........cD',
    'DD........g......................g........cD',
    'DD........g......................g........cD',
    'DD........g.....tttttttttttt.....g........cD',
    'DD........g.....tttttttttttt.....g........cD',
    'DD........g.....tttttttttttt.....g........cD',
    'DD........g.....tttttttttttt.....g........cD',
    'DD........g.....tttttttttttt.....g........cD',
    'DD........g.....tttttttttttt.....g........cD',
    'DD........ggggggggggggggggggggggggg.......cD',
    'DD..tttttttttttt..........................cD',
    'DD..tttttttttttt.............#####K#####..cD',
    'DD..tttttttttttt.............#ppppppppp#..cD',
    'DD..tttttttttttt.............#ppppppppp#..cD',
    'DD..tttttttttttt.............#ppppppppp#..cD',
    'DD..tttttttttttt.............###########..cD',
    'DD........................................cD',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD'
  ];

  // ---- BOLUM 3 verisi: Belediye Parki -----------------------------------
  var ESYA3 = [
    // Kontrol Kabini (bekçinin yatağı — ilk 'yatak')
    ['masa', 4, 8, 2, 1, 1, 0, 'Kontrol Masası'], ['yatak', 5, 9, 2, 1, 1, 0, 'Bekçi Yatağı'],
    ['anons_mikrofonu', 7, 8, 2, 1, 1, 0, 'Park Anons Mikrofonu'],
    // Depo
    ['kutu', 25, 8, 1, 1, 1, 0, 'Kutu'], ['varil', 25, 10, 1, 1, 1, 1, 'Varil'],
    ['kutu', 31, 8, 1, 1, 1, 1, 'Kutu'], ['cop_kutusu', 28, 11, 1, 1, 1, 0, 'Çöp Kutusu'],
    ['raf_kavanoz', 31, 10, 1, 1, 1, 0, 'Kavanoz Rafı'],
    // Büfe
    ['tezgah', 30, 28, 3, 1, 1, 0, 'Büfe Tezgâhı'], ['sandik', 37, 28, 1, 1, 1, 1, 'Sandık'], ['kutu', 30, 30, 1, 1, 1, 1, 'Kutu'],
    // Havuz Meydanı + Oyun Alanı
    ['havuz', 19, 20, 3, 3, 1, 0, 'Havuz'],
    ['salincak', 5, 26, 3, 2, 1, 0, 'Salıncak'], ['kaydirak', 12, 26, 1, 3, 1, 0, 'Kaydırak'], ['masa', 8, 28, 2, 1, 1, 0, 'Piknik Masası'],
    // Ağaçlar
    ['agac', 16, 7, 2, 2, 1, 0, 'Ağaç'], ['agac', 19, 7, 2, 2, 1, 0, 'Ağaç'], ['agac', 36, 7, 2, 2, 1, 0, 'Ağaç'],
    ['agac', 5, 16, 2, 2, 1, 0, 'Ağaç'], ['agac', 5, 20, 2, 2, 1, 0, 'Ağaç'], ['agac', 36, 20, 2, 2, 1, 0, 'Ağaç'],
    ['agac', 17, 29, 2, 2, 1, 0, 'Ağaç'], ['agac', 25, 29, 2, 2, 1, 0, 'Ağaç'], ['agac', 5, 30, 2, 2, 1, 0, 'Ağaç'],
    // Banklar ve dolaplar
    ['bank', 12, 21, 2, 1, 1, 0, 'Bank'], ['bank', 30, 21, 2, 1, 1, 0, 'Bank'],
    ['cop_kutusu', 41, 15, 1, 1, 1, 0, 'Çöp Kutusu'], ['cop_kutusu', 4, 25, 1, 1, 1, 0, 'Çöp Kutusu'],
    ['posta_kutusu', 3, 6, 1, 1, 1, 0, 'Park Tabelası'],
    // Park anons hoparlörleri (direk)
    ['hoparlor_direk', 14, 14, 1, 1, 1, 0, 'Park Hoparlörü'], ['hoparlor_direk', 30, 14, 1, 1, 1, 0, 'Park Hoparlörü'],
    ['hoparlor_direk', 14, 24, 1, 1, 1, 0, 'Park Hoparlörü'], ['hoparlor_direk', 36, 24, 1, 1, 1, 0, 'Park Hoparlörü'],
    // Çalılar (saklanma) + çiçekler
    ['cali', 13, 13, 1, 1, 0, 1, 'Çalı'], ['cali', 25, 15, 1, 1, 0, 1, 'Çalı'], ['cali', 30, 17, 1, 1, 0, 1, 'Çalı'],
    ['cali', 16, 6, 1, 1, 0, 1, 'Çalı'], ['cali', 37, 6, 1, 1, 0, 1, 'Çalı'], ['cali', 23, 26, 1, 1, 0, 1, 'Çalı'],
    ['cali', 26, 31, 1, 1, 0, 1, 'Çalı'], ['cali', 16, 31, 1, 1, 0, 1, 'Çalı'], ['cali', 37, 31, 1, 1, 0, 1, 'Çalı'],
    ['cicek', 14, 18, 1, 1, 0, 0, 'Çiçek'], ['cicek', 29, 18, 1, 1, 0, 0, 'Çiçek'], ['cicek', 12, 24, 1, 1, 0, 0, 'Çiçek'],
    ['cicek', 31, 24, 1, 1, 0, 0, 'Çiçek'], ['cicek', 22, 15, 1, 1, 0, 0, 'Çiçek'], ['cicek', 38, 26, 1, 1, 0, 0, 'Çiçek']
  ];

  var TOPLA3 = [
    ['mavi_anahtar', 'anahtar_mavi', 25, 20], ['kirmizi_anahtar', 'anahtar_kirmizi', 27, 10], ['top', 'top_hazine', 33, 29],
    ['elma1', 'elma', 3, 15], ['elma2', 'elma', 38, 19], ['elma3', 'elma', 14, 7],
    ['teneke1', 'teneke', 4, 17], ['teneke2', 'teneke', 40, 25],
    ['ordek1', 'oyuncak_ordek', 12, 20], ['ordek2', 'oyuncak_ordek', 40, 10], ['ordek3', 'oyuncak_ordek', 7, 31],
    ['kurabiye1', 'kurabiye', 17, 26], ['kurabiye2', 'kurabiye', 36, 13], ['kurabiye3', 'kurabiye', 9, 20]
  ];

  var ODALAR3 = [
    { ad: 'Kontrol Kabini', x: 4, y: 8, w: 5, h: 4 }, { ad: 'Depo', x: 25, y: 8, w: 7, h: 4 },
    { ad: 'Havuz Meydanı', x: 16, y: 19, w: 12, h: 6 }, { ad: 'Oyun Alanı', x: 4, y: 26, w: 12, h: 6 },
    { ad: 'Büfe', x: 30, y: 28, w: 9, h: 3 }
  ];

  var DEVRIYE3 = [
    [10, 17, 2], [10, 25, 1.5], [16, 25, 1], [34, 25, 2], [33, 15, 1], [33, 6, 2], [12, 6, 1.5], [10, 14, 1],
    [14, 18, 2], [24, 18, 1], [30, 16, 1.5], [20, 17, 1], [38, 20, 1.5], [38, 26, 2], [28, 26, 1.5], [10, 20, 1]
  ];

  var KAPI3 = { '10,5': 'park_kapi_bati', '33,5': 'park_kapi_dogu', '6,12': 'kabin', '30,12': 'depo', '34,27': 'bufe' };


  // ---- BOLUM 4 verisi: Okul Bahcesi --------------------------------------
  var ESYA4 = [
    // Müdür Odası (müdür divanı = nöbet değişiminde uyunan yer; anons mikrofonu)
    ['mudur_divani', 14, 28, 2, 3, 1, 0, 'Müdür Divanı'], ['masa', 17, 27, 3, 1, 1, 0, 'Müdür Masası'],
    ['anons_mikrofonu', 18, 29, 2, 1, 1, 0, 'Okul Anons Mikrofonu'], ['kupa_vitrini', 14, 25, 1, 1, 1, 0, 'Kupa Vitrini'],
    ['kitaplik', 19, 25, 1, 2, 1, 0, 'Kitaplık'], ['saksi', 19, 30, 1, 1, 1, 0, 'Saksı'],
    // Öğretmenler Odası (kırmızı anahtar adayları)
    ['okul_dolabi', 7, 25, 1, 1, 1, 0, 'Evrak Dolabı'], ['okul_dolabi', 12, 25, 1, 1, 1, 0, 'Dosya Dolabı'],
    ['masa', 8, 27, 3, 1, 1, 0, 'Öğretmen Masası'], ['sandalye', 9, 28, 1, 1, 1, 0, 'Sandalye'],
    ['kitaplik', 7, 28, 1, 2, 1, 0, 'Kitaplık'], ['tezgah', 11, 30, 2, 1, 1, 0, 'Çay Tezgâhı'], ['saksi', 12, 28, 1, 1, 1, 0, 'Saksı'],
    // Sınıf Köşesi (Gökçe)
    ['kara_tahta', 21, 25, 2, 1, 1, 0, 'Kara Tahta'], ['okul_sirasi', 22, 28, 2, 1, 1, 0, 'Okul Sırası'],
    ['sandalye', 22, 29, 1, 1, 0, 0, 'Sandalye', 2], ['okul_sirasi', 21, 26, 2, 1, 1, 0, 'Okul Sırası'],
    ['kitaplik', 24, 27, 1, 2, 1, 0, 'Kitaplık'], ['saksi', 21, 30, 1, 1, 1, 0, 'Saksı'],
    // Kantin
    ['tezgah', 30, 26, 2, 1, 1, 0, 'Kantin Tezgâhı'], ['buzdolabi', 31, 25, 1, 1, 1, 0, 'Buzdolabı'], ['ocak', 26, 25, 1, 1, 1, 0, 'Ocak'],
    ['masa', 27, 28, 2, 1, 1, 0, 'Kantin Masası'], ['bank', 29, 28, 2, 1, 1, 0, 'Kantin Bankı'], ['cop_kutusu', 31, 30, 1, 1, 1, 1, 'Çöp Kutusu'], ['kutu', 26, 30, 1, 1, 1, 1, 'Kutu'],
    // Spor Deposu (hedef oda)
    ['kutu', 33, 26, 1, 1, 1, 1, 'Spor Kutusu'], ['varil', 36, 26, 1, 1, 1, 1, 'Varil'], ['kutu', 33, 29, 1, 1, 1, 1, 'Kutu'],
    // Koridor
    ['okul_hoparlor', 12, 21, 1, 1, 1, 0, 'Okul Hoparlörü'], ['okul_hoparlor', 22, 21, 1, 1, 1, 0, 'Okul Hoparlörü'], ['okul_hoparlor', 33, 21, 1, 1, 1, 0, 'Okul Hoparlörü'],
    ['kupa_vitrini', 14, 21, 1, 1, 1, 0, 'Kupa Vitrini'], ['kupa_vitrini', 28, 21, 1, 1, 1, 0, 'Kupa Vitrini'],
    ['saksi', 7, 21, 1, 1, 1, 0, 'Saksı'], ['saksi', 36, 21, 1, 1, 1, 0, 'Saksı'], ['saksi', 7, 23, 1, 1, 1, 0, 'Saksı'], ['saksi', 36, 23, 1, 1, 1, 0, 'Saksı'],
    ['bank', 24, 21, 2, 1, 1, 0, 'Koridor Bankı'],
    // Bahçe: basketbol sahası, bayrak, seksek, kum havuzu, çeşme
    ['pota', 26, 11, 1, 1, 1, 0, 'Basket Potası', 0], ['pota', 40, 11, 1, 1, 1, 0, 'Basket Potası', 2],
    ['bayrak_diregi', 15, 10, 1, 1, 1, 0, 'Bayrak Direği'], ['seksek', 12, 12, 2, 4, 0, 0, 'Seksek'],
    ['kum_havuzu', 4, 14, 3, 3, 0, 0, 'Kum Havuzu'], ['cesme', 22, 8, 1, 1, 1, 0, 'Çeşme'],
    ['bank', 12, 8, 2, 1, 1, 0, 'Bahçe Bankı'], ['bank', 22, 14, 2, 1, 1, 0, 'Bahçe Bankı'], ['bank', 29, 18, 2, 1, 1, 0, 'Saha Bankı'],
    ['saksi', 13, 18, 1, 1, 1, 0, 'Çiçek Saksısı'], ['saksi', 17, 18, 1, 1, 1, 0, 'Çiçek Saksısı'], ['cop_kutusu', 23, 18, 1, 1, 1, 0, 'Çöp Kovası'], ['cop_kutusu', 8, 11, 1, 1, 1, 0, 'Çöp Kovası'],
    ['hoparlor_direk', 6, 9, 1, 1, 1, 0, 'Okul Hoparlörü'], ['hoparlor_direk', 24, 11, 1, 1, 1, 0, 'Okul Hoparlörü'], ['hoparlor_direk', 38, 18, 1, 1, 1, 0, 'Okul Hoparlörü'],
    ['posta_kutusu', 12, 6, 1, 1, 1, 0, 'Okul Tabelası'],
    ['agac', 4, 7, 2, 2, 1, 0, 'Ağaç'], ['agac', 16, 15, 2, 2, 1, 0, 'Ağaç'], ['agac', 24, 6, 2, 2, 1, 0, 'Ağaç'], ['agac', 40, 6, 2, 2, 1, 0, 'Ağaç'],
    ['agac', 4, 18, 2, 2, 1, 0, 'Ağaç'], ['agac', 38, 21, 2, 2, 1, 0, 'Ağaç'], ['agac', 38, 27, 2, 2, 1, 0, 'Ağaç'], ['agac', 25, 16, 2, 2, 1, 0, 'Ağaç'],
    ['cali', 8, 7, 1, 1, 0, 1, 'Çalı'], ['cali', 18, 7, 1, 1, 0, 1, 'Çalı'], ['cali', 3, 12, 1, 1, 0, 1, 'Çalı'], ['cali', 18, 13, 1, 1, 0, 1, 'Çalı'],
    ['cali', 41, 14, 1, 1, 0, 1, 'Çalı'], ['cali', 27, 18, 1, 1, 0, 1, 'Çalı'], ['cali', 40, 24, 1, 1, 0, 1, 'Çalı'], ['cali', 3, 22, 1, 1, 0, 1, 'Çalı'],
    ['cali', 41, 30, 1, 1, 0, 1, 'Çalı'], ['cali', 4, 28, 1, 1, 0, 1, 'Çalı'], ['cali', 9, 18, 1, 1, 0, 1, 'Çalı'],
    ['cicek', 8, 13, 1, 1, 0, 0, 'Çiçek'], ['cicek', 18, 9, 1, 1, 0, 0, 'Çiçek'], ['cicek', 31, 18, 1, 1, 0, 0, 'Çiçek'], ['cicek', 40, 17, 1, 1, 0, 0, 'Çiçek'], ['cicek', 5, 24, 1, 1, 0, 0, 'Çiçek']
  ];

  var TOPLA4 = [
    ['mavi_anahtar', 'anahtar_mavi', 4, 14], ['kirmizi_anahtar', 'anahtar_kirmizi', 7, 25], ['top', 'top_hazine', 36, 29],
    ['elma1', 'elma', 9, 9], ['elma2', 'elma', 20, 12], ['elma3', 'elma', 33, 19],
    ['teneke1', 'teneke', 36, 8], ['teneke2', 'teneke', 5, 22],
    ['ordek1', 'oyuncak_ordek', 14, 19], ['ordek2', 'oyuncak_ordek', 31, 23], ['ordek3', 'oyuncak_ordek', 11, 23],
    ['kurabiye1', 'kurabiye', 17, 8], ['kurabiye2', 'kurabiye', 29, 22], ['kurabiye3', 'kurabiye', 24, 12]
  ];

  var ODALAR4 = [
    { ad: 'Öğretmenler Odası', x: 7, y: 25, w: 6, h: 6 }, { ad: 'Müdür Odası', x: 14, y: 25, w: 6, h: 6 },
    { ad: 'Sınıf Köşesi', x: 21, y: 25, w: 4, h: 6 }, { ad: 'Kantin', x: 26, y: 25, w: 6, h: 6 },
    { ad: 'Spor Deposu', x: 33, y: 25, w: 4, h: 6 }, { ad: 'Koridor', x: 7, y: 21, w: 30, h: 3 }
  ];

  var DEVRIYE4 = [
    [10, 8, 2], [10, 17, 1.5], [15, 13, 2], [20, 17, 1], [22, 10, 1.5], [31, 18, 1.5], [38, 12, 2], [34, 18, 1],
    [20, 19, 1], [20, 22, 1.5], [12, 22, 1.5], [11, 27, 2], [10, 22, 1], [16, 26, 1.5], [24, 22, 1], [28, 27, 1.5], [32, 22, 1.5], [34, 27, 2], [30, 22, 1]
  ];

  var KAPI4 = { '10,5': 'bahce_kapi_bati', '20,5': 'bahce_kapi_orta', '10,20': 'bina_bati', '20,20': 'bina_orta',
    '10,24': 'ogretmenler', '16,24': 'mudur', '24,24': 'sinif', '28,24': 'kantin', '34,24': 'spor_deposu' };

  // ---- Arama noktalari: [anahtar, tx, ty, mesaj(bos nokta)] — esyanin sol-ust karosu; yalniz biri gercek.
  var ARAMA1 = [
    ['anahtar_mavi', 13, 3, 'Çekmecede sadece çatal bıçak var!'], ['anahtar_mavi', 39, 8, 'Alet tezgâhında sadece paslı bir somun!'], ['anahtar_mavi', 16, 20, 'Kanepe minderinin altında sadece bozuk paralar!'],
    ['anahtar_kirmizi', 32, 6, 'Kitapların arasında sadece bir bakkal listesi!'], ['anahtar_kirmizi', 25, 4, 'Stüdyo çekmecesinde sadece kulaklık sargısı!']
  ];
  var ARAMA2 = [
    ['anahtar_mavi', 13, 14, 'Çekmecede sadece kaşıklar var!'], ['anahtar_mavi', 27, 16, 'Kanepenin minderinde sadece bir yün yumağı!'], ['anahtar_mavi', 7, 14, 'Kuyunun kenarında sadece bir kurbağa!'],
    ['anahtar_kirmizi', 26, 28, 'Sandıkta sadece Ebe\'nin eski şalı!'], ['anahtar_kirmizi', 27, 28, 'Sepette sadece yün yumağı!'], ['anahtar_kirmizi', 25, 28, 'Saksıda sadece toprak ve bir solucan!']
  ];
  var ARAMA3 = [
    ['anahtar_mavi', 19, 20, 'Havuz kenarında sadece bir ördek tüyü!'], ['anahtar_mavi', 30, 21, 'Bankın altında sadece bir sakız!'], ['anahtar_mavi', 8, 28, 'Piknik masasının altında sadece bir çorap var!'],
    ['anahtar_kirmizi', 31, 10, 'Rafta sadece boş kavanozlar!'], ['anahtar_kirmizi', 25, 8, 'Kutuda sadece eski bir top pompası!'], ['anahtar_kirmizi', 28, 11, 'Çöp kovasında sadece muz kabuğu!']
  ];
  var ARAMA4 = [
    ['anahtar_mavi', 4, 14, 'Kumda sadece bir plastik kova!'], ['anahtar_mavi', 23, 18, 'Çöp kovasında sadece bir elma çöpü!'], ['anahtar_mavi', 14, 21, 'Vitrinde sadece kupalar var, anahtar yok!'], ['anahtar_mavi', 30, 26, 'Kantin tezgâhında sadece bir simit kırıntısı!'],
    ['anahtar_kirmizi', 7, 25, 'Dolapta sadece boş dosyalar var!'], ['anahtar_kirmizi', 12, 25, 'Dosya dolabında sadece karne zarfları!'], ['anahtar_kirmizi', 7, 28, 'Kitapların arasında sadece bir ödev kâğıdı!'], ['anahtar_kirmizi', 11, 30, 'Çekmecede sadece çay şekeri!']
  ];

  // ---- BOLUM 5 verisi: Dede Hassi'nin Evi (DUBLEKS) ----------------------------------------
  // Iki kat ayni izgarada USTUSTE: zemin kat satir 0-32, 'V' (bosluk) satirlari 33-40, ust kat satir 41-59.
  // Kat siniri satir 37 (px: 37*48). Merdiven karolari "portal" cifti: A (zemin) <-> B (ust). 3B'de oyuncunun kati gorunur.
  function ascii5() {
    var GEN = 44, TOP = 63, rows = [], i, yy, xx;
    for (yy = 0; yy < TOP; yy++) { var r = []; for (xx = 0; xx < GEN; xx++) r.push('V'); rows.push(r); }
    function boya(x0, y0, x1, y1, ch) { for (var b = y0; b <= y1; b++) for (var a = x0; a <= x1; a++) rows[b][a] = ch; }
    function koy(a, b, ch) { rows[b][a] = ch; }
    // zemin kat: sokak, cit, bahce
    boya(0, 0, 43, 32, 'D'); boya(0, 1, 43, 1, '-'); boya(0, 2, 43, 3, '='); boya(0, 4, 43, 4, '-');
    boya(2, 5, 42, 31, 'c'); boya(3, 6, 41, 30, '.');
    koy(10, 5, 'd'); koy(33, 5, 'd');
    boya(10, 6, 10, 9, 'g'); boya(33, 6, 33, 9, 'g'); boya(10, 9, 33, 9, 'g');
    // zemin kat evi (duvar dikdortgeni, sonra odalar)
    boya(12, 10, 34, 28, '#');
    boya(13, 11, 19, 16, 'f');            // Mutfak
    boya(21, 11, 26, 20, 'p');            // Giris Holu
    boya(28, 11, 33, 16, 'h');            // Salon
    boya(13, 18, 33, 20, 'p');            // Koridor
    boya(13, 22, 17, 27, 'r');            // Kiler
    boya(19, 22, 22, 27, 'f');            // Banyo
    boya(24, 22, 27, 27, 'e');            // Gokce'nin Kosesi
    boya(29, 22, 33, 27, 'k');            // Cay Odasi
    koy(23, 10, 'd'); koy(20, 15, 'd'); koy(27, 16, 'd'); koy(16, 17, 'd'); koy(30, 17, 'd');
    koy(15, 21, 'K'); koy(20, 21, 'd'); koy(25, 21, 'd'); koy(31, 21, 'd'); koy(12, 19, 'd'); koy(34, 19, 'd');
    // ust kat
    boya(12, 41, 34, 59, '#');
    boya(13, 42, 19, 47, 'k');            // Yatak Odasi
    boya(21, 42, 26, 51, 'p');            // Ust Hol
    boya(28, 42, 33, 47, 'e');            // Calisma Odasi
    boya(13, 49, 33, 51, 'p');            // Ust Koridor
    boya(13, 53, 18, 58, 'h');            // Misafir Odasi
    boya(20, 53, 23, 58, 'f');            // Ust Banyo
    boya(25, 53, 33, 58, 'k');            // Okuma Odasi
    koy(20, 44, 'd'); koy(27, 47, 'M'); koy(16, 48, 'd'); koy(15, 52, 'd'); koy(21, 52, 'd'); koy(29, 52, 'd');
    var out = []; for (i = 0; i < TOP; i++) out.push(rows[i].join(''));
    return out;
  }
  var ASCII5 = ascii5();

  // [tur, tx, ty, w, h, kati, saklanma, ad, yon]  (ilk 'yatak'/'mudur_divani' = Dede Hassi'nin kestirme yeri: divan EN ÜSTTE)
  var ESYA5 = [
    ['mudur_divani', 32, 12, 2, 3, 1, 0, "Dede Hassi'nin Divanı"],
    // Salon
    ['tv', 29, 11, 2, 1, 1, 0, 'Televizyon'], ['masa', 29, 13, 2, 1, 1, 0, 'Sehpa'], ['kanepe', 30, 15, 3, 1, 1, 0, 'Kanepe'],
    ['sallanan_koltuk', 28, 12, 1, 1, 1, 0, 'Sallanan Koltuk'], ['saksi', 33, 16, 1, 1, 1, 0, 'Saksı'], ['duvar_saati', 28, 11, 1, 1, 1, 0, 'Duvar Saati'],
    // Mutfak + arka merdiven
    ['merdiven_kat', 13, 11, 2, 3, 1, 0, 'Arka Merdiven', 0], ['trabzan', 15, 11, 1, 3, 1, 0, 'Trabzan', 0],
    ['tezgah', 16, 11, 3, 1, 1, 0, 'Tezgâh'], ['caydanlik', 17, 11, 1, 1, 0, 0, 'Çaydanlık'], ['ocak', 19, 11, 1, 1, 1, 0, 'Ocak'],
    ['buzdolabi', 19, 12, 1, 2, 1, 0, 'Buzdolabı'], ['masa', 17, 14, 2, 2, 1, 0, 'Yemek Masası'],
    ['sandalye', 17, 13, 1, 1, 1, 0, 'Sandalye'],
    ['dolap', 13, 16, 1, 1, 1, 1, 'Dolap'], ['cop_kutusu', 18, 16, 1, 1, 1, 1, 'Çöp Kutusu'],
    // Giriş Holü + ana merdiven + diafon
    ['diafon', 21, 11, 1, 1, 1, 0, 'Kapı Diafonu'], ['duvar_saati', 21, 13, 1, 1, 1, 0, 'Duvar Saati'],
    ['merdiven_kat', 25, 11, 2, 3, 1, 0, 'Merdiven', 0], ['trabzan', 24, 12, 1, 2, 1, 0, 'Trabzan', 0],
    ['saksi', 22, 18, 1, 1, 1, 0, 'Saksı'], ['dolap', 21, 17, 1, 1, 1, 1, 'Palto Dolabı'],
    // Koridor
    ['saksi', 14, 18, 1, 1, 1, 0, 'Saksı'], ['saksi', 32, 18, 1, 1, 1, 0, 'Saksı'], ['kutu', 33, 23, 1, 1, 1, 1, 'Kutu'], ['dolap', 17, 20, 1, 1, 1, 1, 'Dolap'],
    // Kiler (hedef oda)
    ['raf_kavanoz', 13, 23, 1, 2, 1, 0, 'Kavanoz Rafı'], ['cuval', 17, 22, 1, 1, 1, 1, 'Çuval'], ['tursu_bidonu', 17, 26, 1, 1, 1, 1, 'Turşu Bidonu'], ['cuval', 13, 27, 1, 1, 1, 0, 'Çuval'],
    // Banyo
    ['lavabo', 19, 23, 1, 1, 1, 0, 'Lavabo'], ['klozet', 22, 23, 1, 1, 1, 0, 'Klozet'], ['kuvet', 21, 26, 2, 2, 1, 0, 'Küvet'], ['camasir_makinesi', 19, 26, 1, 1, 1, 0, 'Çamaşır Makinesi'],
    // Gökçe'nin Köşesi
    ['calisma_masasi', 25, 24, 2, 1, 1, 0, 'Çalışma Masası'], ['sandalye', 25, 25, 1, 1, 0, 0, 'Sandalye', 2],
    ['kitaplik', 27, 26, 1, 1, 1, 0, 'Kitaplık'], ['saksi', 24, 23, 1, 1, 1, 0, 'Saksı'],
    // Çay Odası (Anneanne)
    ['masa', 30, 24, 3, 2, 1, 0, 'Çay Masası'], ['caydanlik', 31, 24, 1, 1, 0, 0, 'Çaydanlık'],
    ['sandalye', 33, 24, 1, 1, 1, 0, 'Sandalye'], ['sandalye', 31, 26, 1, 1, 1, 0, 'Sandalye'],
    ['sandik', 33, 27, 1, 1, 1, 1, 'Sandık'], ['dolap', 29, 27, 1, 1, 1, 1, 'Dolap'], ['firin', 33, 22, 1, 1, 1, 0, 'Fırın'],
    // Üst kat: Yatak Odası + arka merdiven (aşağı)
    ['merdiven_asagi', 13, 42, 2, 3, 1, 0, 'Arka Merdiven', 0], ['trabzan', 15, 42, 1, 3, 1, 0, 'Trabzan', 0],
    ['gardirop', 17, 42, 2, 1, 1, 1, 'Gardırop'], ['yatak', 17, 43, 2, 3, 1, 1, 'Yatak'], ['saksi', 19, 42, 1, 1, 1, 0, 'Saksı'], ['sandalye', 16, 46, 1, 1, 1, 0, 'Sandalye'],
    // Üst Hol + ana merdiven (aşağı)
    ['merdiven_asagi', 25, 42, 2, 3, 1, 0, 'Merdiven', 0], ['trabzan', 24, 43, 1, 2, 1, 0, 'Trabzan', 0],
    ['saksi', 21, 42, 1, 1, 1, 0, 'Saksı'], ['duvar_saati', 22, 42, 1, 1, 1, 0, 'Duvar Saati'], ['sandik', 21, 46, 1, 1, 1, 1, 'Sandık'],
    // Çalışma Odası (kırmızı anahtar adayları)
    ['calisma_masasi', 30, 42, 2, 1, 1, 0, 'Çalışma Masası'], ['sandalye', 30, 43, 1, 1, 0, 0, 'Sandalye', 2],
    ['kitaplik', 33, 44, 1, 1, 1, 0, 'Kitaplık'], ['orgu_sepeti', 29, 46, 1, 1, 1, 0, 'Örgü Sepeti'], ['saksi', 28, 42, 1, 1, 1, 0, 'Saksı'],
    // Üst Koridor
    ['saksi', 13, 49, 1, 1, 1, 0, 'Saksı'], ['saksi', 33, 49, 1, 1, 1, 0, 'Saksı'], ['kutu', 33, 51, 1, 1, 1, 1, 'Kutu'],
    // Misafir Odası
    ['yatak', 13, 54, 2, 3, 1, 1, 'Misafir Yatağı'], ['dolap', 18, 53, 1, 1, 1, 1, 'Dolap'], ['sandalye', 17, 57, 1, 1, 1, 0, 'Sandalye'],
    // Üst Banyo
    ['lavabo', 20, 54, 1, 1, 1, 0, 'Lavabo'], ['klozet', 23, 54, 1, 1, 1, 0, 'Klozet'], ['kuvet', 22, 57, 2, 2, 1, 0, 'Küvet'],
    // Okuma Odası
    ['koltuk', 26, 54, 1, 2, 1, 0, 'Koltuk'], ['kitaplik', 32, 53, 1, 1, 1, 0, 'Kitaplık'], ['sallanan_koltuk', 31, 56, 1, 1, 1, 0, 'Sallanan Koltuk'],
    ['masa', 28, 56, 2, 1, 1, 0, 'Okuma Masası'], ['saksi', 33, 58, 1, 1, 1, 0, 'Saksı'], ['sandik', 25, 58, 1, 1, 1, 1, 'Sandık'],
    // Bahçe
    ['agac', 4, 7, 2, 2, 1, 0, 'Ağaç'], ['agac', 4, 15, 2, 2, 1, 0, 'Ağaç'], ['agac', 5, 24, 2, 2, 1, 0, 'Ağaç'], ['agac', 38, 8, 2, 2, 1, 0, 'Ağaç'],
    ['agac', 38, 24, 2, 2, 1, 0, 'Ağaç'], ['agac', 9, 29, 2, 2, 1, 0, 'Ağaç'], ['agac', 36, 29, 2, 2, 1, 0, 'Ağaç'],
    ['su_kuyusu', 7, 21, 2, 2, 1, 0, 'Su Kuyusu'], ['bank', 37, 19, 2, 1, 1, 0, 'Bahçe Bankı'], ['bank', 6, 11, 2, 1, 1, 0, 'Bahçe Bankı'],
    ['cali', 3, 10, 1, 1, 0, 1, 'Çalı'], ['cali', 9, 13, 1, 1, 0, 1, 'Çalı'], ['cali', 3, 20, 1, 1, 0, 1, 'Çalı'], ['cali', 10, 26, 1, 1, 0, 1, 'Çalı'],
    ['cali', 36, 12, 1, 1, 0, 1, 'Çalı'], ['cali', 40, 17, 1, 1, 0, 1, 'Çalı'], ['cali', 36, 22, 1, 1, 0, 1, 'Çalı'], ['cali', 41, 28, 1, 1, 0, 1, 'Çalı'],
    ['cali', 20, 30, 1, 1, 0, 1, 'Çalı'], ['cali', 27, 29, 1, 1, 0, 1, 'Çalı'], ['cali', 15, 8, 1, 1, 0, 1, 'Çalı'],
    ['posta_kutusu', 11, 7, 1, 1, 1, 0, 'Posta Kutusu'], ['saksi', 21, 8, 1, 1, 1, 0, 'Saksı'], ['saksi', 25, 8, 1, 1, 1, 0, 'Saksı'],
    ['cicek', 14, 8, 1, 1, 0, 0, 'Çiçek'], ['cicek', 17, 8, 1, 1, 0, 0, 'Çiçek'], ['cicek', 29, 8, 1, 1, 0, 0, 'Çiçek'], ['cicek', 31, 7, 1, 1, 0, 0, 'Çiçek'],
    ['cicek', 8, 17, 1, 1, 0, 0, 'Çiçek'], ['cicek', 39, 13, 1, 1, 0, 0, 'Çiçek'], ['cicek', 14, 30, 1, 1, 0, 0, 'Çiçek'], ['cicek', 31, 30, 1, 1, 0, 0, 'Çiçek']
  ];

  var TOPLA5 = [
    ['mavi_anahtar', 'anahtar_mavi', 16, 12], ['kirmizi_anahtar', 'anahtar_kirmizi', 31, 43], ['top', 'top_hazine', 15, 26],
    ['elma1', 'elma', 6, 12], ['elma2', 'elma', 22, 19], ['elma3', 'elma', 38, 15],
    ['teneke1', 'teneke', 8, 27], ['teneke2', 'teneke', 24, 50],
    ['ordek1', 'oyuncak_ordek', 40, 20], ['ordek2', 'oyuncak_ordek', 15, 19], ['ordek3', 'oyuncak_ordek', 22, 55],
    ['kurabiye1', 'kurabiye', 32, 23], ['kurabiye2', 'kurabiye', 31, 16], ['kurabiye3', 'kurabiye', 21, 49]
  ];

  var ODALAR5 = [
    { ad: 'Mutfak', x: 13, y: 11, w: 7, h: 6 }, { ad: 'Giriş Holü', x: 21, y: 11, w: 6, h: 10 }, { ad: 'Salon', x: 28, y: 11, w: 6, h: 6 },
    { ad: 'Koridor', x: 13, y: 18, w: 21, h: 3 }, { ad: 'Kiler', x: 13, y: 22, w: 5, h: 6 }, { ad: 'Banyo', x: 19, y: 22, w: 4, h: 6 },
    { ad: "Gökçe'nin Köşesi", x: 24, y: 22, w: 4, h: 6 }, { ad: 'Çay Odası', x: 29, y: 22, w: 5, h: 6 },
    { ad: 'Yatak Odası', x: 13, y: 42, w: 7, h: 6 }, { ad: 'Üst Hol', x: 21, y: 42, w: 6, h: 10 }, { ad: 'Çalışma Odası', x: 28, y: 42, w: 6, h: 6 },
    { ad: 'Üst Koridor', x: 13, y: 49, w: 21, h: 3 }, { ad: 'Misafir Odası', x: 13, y: 53, w: 6, h: 6 }, { ad: 'Üst Banyo', x: 20, y: 53, w: 4, h: 6 },
    { ad: 'Okuma Odası', x: 25, y: 53, w: 9, h: 6 }
  ];

  var DEVRIYE5 = [
    [23, 13, 2], [30, 14, 2], [30, 19, 1], [30, 23, 1.5], [26, 23, 1.5], [20, 24, 1.5], [15, 19, 1], [16, 13, 2],
    [23, 8, 2], [37, 20, 1.5], [23, 30, 1.5], [10, 22, 1.5], [10, 7, 1.5],
    [23, 45, 2], [16, 45, 1.5], [22, 50, 1], [16, 55, 1.5], [30, 55, 1.5]
  ];

  var KAPI5 = { '10,5': 'bahce_kapi_bati', '33,5': 'bahce_kapi_dogu', '23,10': 'on', '20,15': 'mutfak', '27,16': 'salon', '16,17': 'mutfak_koridor',
    '30,17': 'salon_koridor', '15,21': 'kiler', '20,21': 'banyo', '25,21': 'gokce', '31,21': 'cay_odasi', '12,19': 'arka_bati', '34,19': 'arka_dogu',
    '20,44': 'yatak_ust', '27,47': 'calisma', '16,48': 'yatak_koridor', '15,52': 'misafir', '21,52': 'ust_banyo', '29,52': 'okuma' };

  var ARAMA5 = [
    ['anahtar_mavi', 16, 11, 'Çekmecede sadece kaşıklar var!'], ['anahtar_mavi', 30, 15, 'Kanepe minderinin altında sadece bozuk paralar!'],
    ['anahtar_mavi', 26, 54, 'Koltukta sadece bir yün yumağı!'], ['anahtar_mavi', 37, 19, 'Bankın altında sadece bir sakız!'],
    ['anahtar_kirmizi', 30, 42, 'Masada sadece boş kâğıtlar var!'], ['anahtar_kirmizi', 33, 44, 'Kitapların arasında sadece bir kuru yaprak!'],
    ['anahtar_kirmizi', 29, 46, 'Sepette sadece yün yumakları!'], ['anahtar_kirmizi', 28, 42, 'Saksıda sadece toprak ve bir solucan!']
  ];

  // ---- BOLUM 6 verisi: Teyze Evi (tek kat; Beren emekler, Nefise Teyze ve Uğurcan Enişte ispiyonlar) ----------------------------------------
  function ascii6() {
    var GEN = 44, TOP = 35, rows = [], yy, xx, i;
    for (yy = 0; yy < TOP; yy++) { var r = []; for (xx = 0; xx < GEN; xx++) r.push('D'); rows.push(r); }
    function boya(x0, y0, x1, y1, ch) { for (var b = y0; b <= y1; b++) for (var a = x0; a <= x1; a++) rows[b][a] = ch; }
    function koy(a, b, ch) { rows[b][a] = ch; }
    boya(0, 1, 43, 1, '-'); boya(0, 2, 43, 3, '='); boya(0, 4, 43, 4, '-');
    boya(2, 5, 42, 33, 'c'); boya(3, 6, 41, 32, '.');
    koy(10, 5, 'd'); koy(33, 5, 'd');
    boya(10, 6, 10, 9, 'g'); boya(33, 6, 33, 9, 'g'); boya(10, 9, 33, 9, 'g');
    boya(10, 10, 36, 30, '#');
    boya(11, 11, 17, 17, 'f');            // Mutfak
    boya(19, 11, 22, 21, 'p');            // Giris Holu
    boya(24, 11, 35, 17, 'h');            // Salon
    boya(26, 13, 31, 16, 'o');            // Oyun halisi
    boya(11, 19, 35, 21, 'p');            // Koridor
    boya(11, 23, 17, 29, 'k');            // Bebek Odasi
    boya(19, 23, 22, 29, 'f');            // Banyo
    boya(24, 23, 29, 29, 'e');            // Yatak Odasi (mavi kilit)
    boya(31, 23, 35, 29, 'f');            // Balkon (kirmizi kilit, hedef)
    koy(21, 10, 'd'); koy(18, 14, 'd'); koy(23, 14, 'd'); koy(14, 18, 'd'); koy(30, 18, 'd'); koy(10, 20, 'd'); koy(36, 20, 'd');
    koy(14, 22, 'd'); koy(20, 22, 'd'); koy(26, 22, 'M'); koy(33, 22, 'K');
    var out = []; for (i = 0; i < TOP; i++) out.push(rows[i].join(''));
    return out;
  }
  var ASCII6 = ascii6();

  // [tur, tx, ty, w, h, kati, saklanma, ad, yon]  (ilk 'puset' = Beren'in uyku yeri: EN ÜSTTE)
  var ESYA6 = [
    ['puset', 12, 25, 1, 1, 1, 0, "Beren'in Pusesi"],
    // Mutfak
    ['buzdolabi', 11, 11, 1, 2, 1, 0, 'Buzdolabı'], ['tezgah', 12, 11, 3, 1, 1, 0, 'Tezgâh'], ['ocak', 15, 11, 1, 1, 1, 0, 'Ocak'], ['lavabo', 16, 11, 1, 1, 1, 0, 'Evye'],
    ['mama_sandalyesi', 17, 12, 1, 1, 1, 0, 'Mama Sandalyesi'],
    ['masa', 12, 14, 3, 2, 1, 0, 'Yemek Masası'], ['sandalye', 11, 14, 1, 1, 1, 0, 'Sandalye'], ['sandalye', 15, 16, 1, 1, 1, 0, 'Sandalye'], ['sandalye', 14, 16, 1, 1, 1, 0, 'Sandalye'],
    ['dolap', 11, 17, 1, 1, 1, 1, 'Dolap'], ['cop_kutusu', 17, 16, 1, 1, 1, 1, 'Çöp Kutusu'],
    // Giris Holu
    ['saksi', 19, 11, 1, 1, 1, 0, 'Saksı'], ['duvar_saati', 22, 12, 1, 1, 1, 0, 'Duvar Saati'], ['dolap', 19, 17, 1, 1, 1, 1, 'Ayakkabılık'], ['saksi', 22, 17, 1, 1, 1, 0, 'Saksı'],
    // Salon: oyun halisi, oyuncaklar, oyun parki
    ['tv', 28, 11, 2, 1, 1, 0, 'Televizyon'], ['masa', 30, 11, 2, 1, 1, 0, 'Sehpa'], ['koltuk', 25, 11, 1, 2, 1, 0, 'Koltuk'], ['sallanan_koltuk', 24, 16, 1, 1, 1, 0, 'Sallanan Koltuk'],
    ['kanepe', 25, 17, 3, 1, 1, 0, 'Kanepe'], ['bebek_telsizi', 25, 15, 1, 1, 1, 0, 'Bebek Telsizi'],
    ['oyun_parki', 33, 12, 2, 2, 1, 0, 'Oyun Parkı'], ['oyuncak_sandigi', 34, 16, 2, 1, 1, 1, 'Oyuncak Sandığı'], ['kitaplik', 35, 14, 1, 2, 1, 0, 'Kitaplık'], ['saksi', 35, 11, 1, 1, 1, 0, 'Saksı'],
    // Koridor + Gokce'nin kosesi
    ['calisma_masasi', 16, 19, 2, 1, 1, 0, 'Çalışma Masası'], ['sandalye', 16, 20, 1, 1, 0, 0, 'Sandalye', 2],
    ['kutu', 12, 19, 1, 1, 1, 1, 'Kutu'], ['dolap', 18, 21, 1, 1, 1, 1, 'Dolap'], ['saksi', 34, 19, 1, 1, 1, 0, 'Saksı'], ['saksi', 31, 21, 1, 1, 1, 0, 'Saksı'],
    // Bebek Odasi
    ['besik', 16, 23, 2, 1, 1, 0, 'Beşik'], ['telsiz_bebek', 17, 27, 1, 1, 1, 0, 'Bebek Telsizi'], ['oyuncak_sandigi', 11, 28, 2, 1, 1, 1, 'Oyuncak Sandığı'],
    ['kitaplik', 11, 23, 1, 2, 1, 0, 'Kitaplık'], ['sallanan_koltuk', 16, 28, 1, 1, 1, 0, 'Sallanan Koltuk'], ['saksi', 17, 29, 1, 1, 1, 0, 'Saksı'],
    // Banyo
    ['lavabo', 19, 24, 1, 1, 1, 0, 'Lavabo'], ['klozet', 22, 23, 1, 1, 1, 0, 'Klozet'], ['kuvet', 21, 28, 2, 2, 1, 0, 'Küvet'], ['camasir_makinesi', 19, 28, 1, 1, 1, 0, 'Çamaşır Makinesi'], ['saksi', 19, 26, 1, 1, 1, 0, 'Saksı'],
    // Yatak Odasi (kirmizi anahtar adaylari)
    ['gardirop', 24, 24, 2, 1, 1, 0, 'Gardırop'], ['yatak', 27, 26, 2, 3, 1, 0, 'Yatak'], ['kutu', 24, 26, 1, 1, 1, 0, 'Komodin'], ['orgu_sepeti', 29, 23, 1, 1, 1, 0, 'Örgü Sepeti'],
    ['sandalye', 25, 28, 1, 1, 1, 0, 'Sandalye'], ['saksi', 29, 29, 1, 1, 1, 0, 'Saksı'],
    // Balkon (hedef)
    ['saksi', 31, 23, 1, 1, 1, 0, 'Saksı'], ['saksi', 35, 23, 1, 1, 1, 0, 'Saksı'], ['bank', 32, 28, 2, 1, 1, 0, 'Balkon Bankı'], ['cicek', 35, 28, 1, 1, 0, 0, 'Çiçek'], ['saksi', 31, 26, 1, 1, 1, 0, 'Saksı'],
    // Bahce
    ['agac', 4, 7, 2, 2, 1, 0, 'Ağaç'], ['agac', 38, 8, 2, 2, 1, 0, 'Ağaç'], ['agac', 4, 26, 2, 2, 1, 0, 'Ağaç'], ['agac', 38, 26, 2, 2, 1, 0, 'Ağaç'], ['agac', 5, 31, 2, 2, 1, 0, 'Ağaç'], ['agac', 30, 31, 2, 2, 1, 0, 'Ağaç'],
    ['kum_havuzu', 4, 15, 3, 3, 1, 0, 'Kum Havuzu'], ['bank', 38, 19, 2, 1, 1, 0, 'Bahçe Bankı'], ['cesme', 39, 13, 1, 1, 1, 0, 'Çeşme'], ['posta_kutusu', 11, 7, 1, 1, 1, 0, 'Posta Kutusu'],
    ['cali', 3, 11, 1, 1, 0, 1, 'Çalı'], ['cali', 8, 13, 1, 1, 0, 1, 'Çalı'], ['cali', 3, 22, 1, 1, 0, 1, 'Çalı'], ['cali', 9, 27, 1, 1, 0, 1, 'Çalı'],
    ['cali', 37, 12, 1, 1, 0, 1, 'Çalı'], ['cali', 40, 22, 1, 1, 0, 1, 'Çalı'], ['cali', 24, 31, 1, 1, 0, 1, 'Çalı'], ['cali', 17, 31, 1, 1, 0, 1, 'Çalı'],
    ['cicek', 14, 8, 1, 1, 0, 0, 'Çiçek'], ['cicek', 17, 8, 1, 1, 0, 0, 'Çiçek'], ['cicek', 26, 8, 1, 1, 0, 0, 'Çiçek'], ['cicek', 29, 8, 1, 1, 0, 0, 'Çiçek'],
    ['cicek', 8, 18, 1, 1, 0, 0, 'Çiçek'], ['cicek', 39, 16, 1, 1, 0, 0, 'Çiçek'], ['cicek', 13, 32, 1, 1, 0, 0, 'Çiçek'], ['cicek', 35, 32, 1, 1, 0, 0, 'Çiçek']
  ];

  var TOPLA6 = [
    ['mavi_anahtar', 'anahtar_mavi', 12, 12], ['kirmizi_anahtar', 'anahtar_kirmizi', 27, 25], ['top', 'top_hazine', 34, 26],
    ['elma1', 'elma', 6, 12], ['elma2', 'elma', 22, 19], ['elma3', 'elma', 38, 15],
    ['teneke1', 'teneke', 8, 27], ['teneke2', 'teneke', 36, 31],
    ['ordek1', 'oyuncak_ordek', 40, 20],
    ['kurabiye1', 'kurabiye', 16, 16], ['kurabiye2', 'kurabiye', 20, 15],
    ['cingirak1', 'cingirak', 27, 14], ['cingirak2', 'cingirak', 15, 20], ['cingirak3', 'cingirak', 39, 11],
    ['pelus1', 'pelus', 29, 16], ['pelus2', 'pelus', 21, 19], ['pelus3', 'pelus', 7, 24],
    ['oyuncak_top1', 'oyuncak_top', 31, 14], ['oyuncak_top2', 'oyuncak_top', 21, 13], ['oyuncak_top3', 'oyuncak_top', 20, 31]
  ];

  var ODALAR6 = [
    { ad: 'Mutfak', x: 11, y: 11, w: 7, h: 7 }, { ad: 'Giriş Holü', x: 19, y: 11, w: 4, h: 11 }, { ad: 'Salon', x: 24, y: 11, w: 12, h: 7 },
    { ad: 'Koridor', x: 11, y: 19, w: 25, h: 3 }, { ad: 'Bebek Odası', x: 11, y: 23, w: 7, h: 7 }, { ad: 'Banyo', x: 19, y: 23, w: 4, h: 7 },
    { ad: 'Yatak Odası', x: 24, y: 23, w: 6, h: 7 }, { ad: 'Balkon', x: 31, y: 23, w: 5, h: 7 }
  ];

  // Beren'in emekleme turu (kilitli odalar yok)
  var DEVRIYE6 = [
    [14, 25, 2], [14, 20, 1], [14, 13, 2], [20, 13, 1.5], [28, 15, 2.5], [33, 15, 1.5], [30, 20, 1], [38, 20, 1.5],
    [36, 8, 1], [21, 8, 1.5], [20, 20, 1], [20, 26, 1.5], [7, 20, 1.5], [12, 20, 1]
  ];
  // Beren'in oyuncaklara dalıp oturacağı yedek noktalar (oyun halısı, oyun parkı, oyuncak sandıkları, bahçe)
  var OYUN6 = [[28, 14], [30, 15], [32, 14], [33, 15], [13, 27], [15, 26], [33, 17], [38, 22], [6, 19]];

  var KAPI6 = { '10,5': 'bahce_kapi_bati', '33,5': 'bahce_kapi_dogu', '21,10': 'on', '18,14': 'mutfak_hol', '23,14': 'salon_hol', '14,18': 'mutfak_koridor',
    '30,18': 'salon_koridor', '10,20': 'arka_bati', '36,20': 'arka_dogu', '14,22': 'bebek_odasi', '20,22': 'banyo', '26,22': 'yatak_odasi', '33,22': 'balkon' };

  var ARAMA6 = [
    ['anahtar_mavi', 12, 11, 'Çekmecede sadece kaşıklar var!'], ['anahtar_mavi', 25, 17, 'Kanepe minderinin altında sadece bozuk paralar!'],
    ['anahtar_mavi', 4, 15, 'Kumun içinde sadece bir plastik kova!'], ['anahtar_mavi', 38, 19, 'Bankın altında sadece bir sakız!'],
    ['anahtar_kirmizi', 24, 24, 'Gardırobun dibinde sadece tek bir çorap!'], ['anahtar_kirmizi', 27, 26, 'Yatağın altında sadece bir terlik!'],
    ['anahtar_kirmizi', 29, 23, 'Sepette sadece yün yumakları!'], ['anahtar_kirmizi', 24, 26, 'Komodinde sadece bir tarak!']
  ];

  // ---- Bölüm tanımları ------------------------------------------------
  var BOLUMLER = {
    1: {
      ascii: ASCII1, esya: ESYA1, topla: TOPLA1, odalar: ODALAR1, devriye: DEVRIYE1, kapi: KAPI1, kapiZemin: 'parke',
      oyuncu: [9, 29], komsu: [16, 18], scooter: [35, 18], gokce: [12, 19],
      mikrofon: [27, 4], sokakSon: 31, ev: [11, 33, 2, 21], arama: ARAMA1
    },
    2: {
      ascii: ASCII2, esya: ESYA2, topla: TOPLA2, odalar: ODALAR2, devriye: DEVRIYE2, kapi: KAPI2, kapiZemin: KAPI_ZEMIN2,
      oyuncu: [9, 5], komsu: [28, 17], scooter: [4, 19], gokce: [19, 27],
      mikrofon: [31, 15], sokakSon: 8, ev: [11, 33, 13, 29], arama: ARAMA2
    },
    3: {
      ascii: ASCII3, esya: ESYA3, topla: TOPLA3, odalar: ODALAR3, devriye: DEVRIYE3, kapi: KAPI3, kapiZemin: 'cakil',
      oyuncu: [10, 6], komsu: [6, 10], kaza: [6, 28], gokce: [10, 28],
      mikrofon: [7, 9], sokakSon: 5, kedi: [37, 17], arama: ARAMA3
    },
    4: {
      ascii: ASCII4, esya: ESYA4, topla: TOPLA4, odalar: ODALAR4, devriye: DEVRIYE4, kapi: KAPI4, kapiZemin: 'parke',
      oyuncu: [10, 7], komsu: [14, 14], kaza: [25, 11], gokce: [22, 29],
      mikrofon: [18, 30], sokakSon: 5, zil: [15, 12], arama: ARAMA4
    },
    5: {
      ascii: ASCII5, esya: ESYA5, topla: TOPLA5, odalar: ODALAR5, devriye: DEVRIYE5, kapi: KAPI5, kapiZemin: 'parke',
      oyuncu: [10, 3], komsu: [22, 14], kaza: [23, 12], gokce: [25, 25],
      mikrofon: [21, 12], sokakSon: 5, arama: ARAMA5,
      // Katlar: iki kat aynı ızgarada üst üste. sinir = kat sınırı satırı, dy = üst katın zemin kata göre satır kayması.
      kat: { sinir: 37, dy: 31, ad: ['Zemin Kat', 'Üst Kat'] },
      // Portal çiftleri [zemin tx, ty, üst tx, ty]: merdiven ayak karoları (E ile geçilir; yapay zekâ kendiliğinden geçer)
      portal: [[25, 14, 25, 45], [26, 14, 26, 45], [13, 14, 13, 45], [14, 14, 14, 45]],
      yardimci: [31, 23], misafirKapi: [23, 9]
    },
    6: {
      ascii: ASCII6, esya: ESYA6, topla: TOPLA6, odalar: ODALAR6, devriye: DEVRIYE6, kapi: KAPI6, kapiZemin: 'parke', oyun: OYUN6,
      teyzeYol: [[14, 13, 2.5], [16, 12, 2], [20, 14, 1.5], [27, 14, 2.5], [31, 15, 2], [22, 19, 1.5], [15, 17, 2]],
      enisteYol: [[29, 15, 3], [33, 16, 2], [26, 12, 2], [25, 16, 2], [22, 15, 1.5], [14, 19, 2], [14, 13, 2]],
      oyuncu: [10, 3], komsu: [13, 25], kaza: [32, 13], gokce: [16, 20],
      mikrofon: [26, 15], sokakSon: 5, arama: ARAMA6
    }
  };

  // Şemadaki rol alanlarını motorun ortak alanlarına dönüştür.
  Object.keys(G.yeniHaritalar || {}).forEach(function (id) {
    var m = G.yeniHaritalar[id];
    BOLUMLER[id] = Object.assign({}, m, { komsu: m.arayici, gokce: m.abla, kapiZemin: 'parke', sokakSon: 1 });
    CIKARTMA_YER[id] = m.cikartma;
  });
  var YUKSEK = { ahsap_ev: 1, bal_kovanli_agac: 1, magara_girisi: 1, vitrin: 1, buzdolabi: 1, kitaplik: 1, gardirop: 1, raf_kavanoz: 1 };
  // Bebek (ent.altGec) boyu: masa/sandalye gibi alçak bacaklı eşyaların ALTINDAN geçebilir (EK-12)
  var ALT_GEC = { masa: 1, sandalye: 1, calisma_masasi: 1, mama_sandalyesi: 1 };

  // ---- Durum -----------------------------------------------------------
  var cur = BOLUMLER[1];
  var ASCII = cur.ascii, ODALAR = cur.odalar, TOPLA_VERI = cur.topla;
  var W = ASCII[0].length, H = ASCII.length;
  var grid = [];
  var solidGrid = [];
  var yuksekGrid = [];
  var altGrid = [];
  var kapiGrid = [];
  var yakinGrid = [];
  var kapiOrijinal = [];
  var zeminKapi = 'parke';

  function merkez(t) { return t * T + T / 2; }

  // Kapının kanadı duvar/çit boyunca uzanır; geçiş bu eksene diktir.
  function kapiYatay(x, y) {
    function duvar(a, b) { return /[#cDV]/.test((ASCII[b] || '').charAt(a) || 'D'); }
    var yatay = duvar(x - 1, y) && duvar(x + 1, y);
    var dikey = duvar(x, y - 1) && duvar(x, y + 1);
    if (yatay !== dikey) return yatay;
    return !duvar(x, y - 1) && !duvar(x, y + 1);
  }

  var harita = {
    TILE: T, W: W, H: H, bolum: 1,
    kapilar: [], esyalar: [], toplanabilir: [], odalar: ODALAR,
    oyuncuBaslangic: { x: 0, y: 0 }, komsuBaslangic: { x: 0, y: 0 },
    devriye: [], ascii: ASCII,
    scooterYeri: { x: 0, y: 0 }, scooterYolu: { dx: 1, dy: 0 },
    gokceMasa: { x: 0, y: 0, yon: -Math.PI / 2 },
    mikrofonYeri: { x: 0, y: 0, yon: -Math.PI / 2 },
    kediBaslangic: { x: 0, y: 0 },
    kazaYeri: null, zilYeri: null, hoparlorler: [], aramaNoktalari: [], aramaGruplari: {},
    katSayisi: 1, katSinirY: 0, katDy: 0, katAdlari: [], portallar: []
  };

  harita.init = function (bolum, bakSadece) {
    var i, x, y;
    if (bolum === undefined || bolum === null) bolum = (G.bolum || 1);
    if (!BOLUMLER[bolum]) bolum = 1;
    cur = BOLUMLER[bolum];
    harita.kediBaslangic = cur.kedi
      ? { x: merkez(cur.kedi[0]), y: merkez(cur.kedi[1]) }
      : { x: 0, y: 0 };
    harita.bolum = bolum;
    ASCII = cur.ascii; ODALAR = cur.odalar; TOPLA_VERI = cur.topla; zeminKapi = cur.kapiZemin;
    harita.ascii = ASCII; harita.odalar = ODALAR;
    grid = []; solidGrid = []; yuksekGrid = []; altGrid = []; kapiGrid = []; yakinGrid = [];
    harita.W = W = ASCII[0].length; harita.H = H = ASCII.length;
    harita.kapilar.length = 0; harita.esyalar.length = 0; kapiOrijinal = [];
    for (y = 0; y < H; y++) {
      grid.push([]); solidGrid.push(new Uint8Array(W)); yuksekGrid.push(new Uint8Array(W)); altGrid.push(new Uint8Array(W));
      kapiGrid.push([]); yakinGrid.push(new Uint8Array(W));
      for (x = 0; x < W; x++) {
        var ch = ASCII[y].charAt(x);
        grid[y].push(ch);
        kapiGrid[y].push(null);
        if (ch === 'D' || ch === '#' || ch === 'c' || ch === 'V') solidGrid[y][x] = 1;
      }
    }
    var kid = cur.kapi;
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
      var c = ASCII[y].charAt(x);
      if (c === 'd' || c === 'M' || c === 'K') {
        var yatay = kapiYatay(x, y);
        var k = { id: 'kapi_' + (kid[x + ',' + y] || (x + '_' + y)), tx: x, ty: y, yatay: yatay, acik: false,
          kilit: c === 'M' ? 'anahtar_mavi' : (c === 'K' ? 'anahtar_kirmizi' : null) };
        harita.kapilar.push(k);
        kapiGrid[y][x] = k;
        kapiOrijinal.push({ acik: false, kilit: k.kilit });
      }
    }
    var ESYA_VERI = cur.esya;
    for (i = 0; i < ESYA_VERI.length; i++) {
      var e = ESYA_VERI[i];
      var es = { id: 'esya' + i, tur: e[0], tx: e[1], ty: e[2], w: e[3], h: e[4], kati: !!e[5], saklanma: !!e[6], ad: e[7], yon: e[8] | 0 };
      harita.esyalar.push(es);
      for (var yy = es.ty; yy < es.ty + es.h; yy++) for (var xx = es.tx; xx < es.tx + es.w; xx++) {
        if (yy < 0 || xx < 0 || yy >= H || xx >= W) continue;
        if (es.kati) solidGrid[yy][xx] = 1;
        if (YUKSEK[es.tur]) yuksekGrid[yy][xx] = 1;
        if (es.kati && ALT_GEC[es.tur]) altGrid[yy][xx] = 1;
      }
    }
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
      if (solidGrid[y][x]) continue;
      var yak = 0;
      for (var oy = -1; oy <= 1 && !yak; oy++) for (var ox = -1; ox <= 1; ox++) {
        if (ssol(x + ox, y + oy)) { yak = 1; break; }
      }
      yakinGrid[y][x] = yak;
    }
    harita.devriye = cur.devriye.map(function (p) { return { x: merkez(p[0]), y: merkez(p[1]), bekle: p[2] }; });
    harita.oyuncuBaslangic = { x: merkez(cur.oyuncu[0]), y: merkez(cur.oyuncu[1]) };
    harita.komsuBaslangic = { x: merkez(cur.komsu[0]), y: merkez(cur.komsu[1]) };
    harita.scooterYeri = cur.scooter ? { x: merkez(cur.scooter[0]), y: merkez(cur.scooter[1]) } : null;
    harita.scooterYolu = { dx: 1, dy: 0 };
    // kaza yeri: B1/B2 scooter, B3 salıncak, B4 pota (bolum.js kazaTur)
    var kz = cur.kaza || cur.scooter;
    harita.kazaYeri = kz ? { x: merkez(kz[0]), y: merkez(kz[1]), tur: (G.bolumler && G.bolumler[bolum] && G.bolumler[bolum].kazaTur) || 'scooter' } : null;
    harita.teyzeYol = (cur.teyzeYol || []).map(function (p) { return { x: merkez(p[0]), y: merkez(p[1]), bekle: p[2] }; });
    harita.enisteYol = (cur.enisteYol || []).map(function (p) { return { x: merkez(p[0]), y: merkez(p[1]), bekle: p[2] }; });
    harita.oturanlar = (cur.oturan || []).map(function (p) { return { kim: p.kim, x: merkez(p.tx), y: merkez(p.ty), yon: [Math.PI/2,Math.PI,-Math.PI/2,0][p.yon], oturuyor: true, yemek: p.yemek, oturY: p.oturY, adimFaz: 0 }; });
    harita.bebekOyun = (cur.oyun || []).map(function (p) { return { x: merkez(p[0]), y: merkez(p[1]) }; });
    harita.yardimciYeri = cur.yardimci ? { x: merkez(cur.yardimci[0]), y: merkez(cur.yardimci[1]) } : null;
    harita.misafirKapi = cur.misafirKapi ? { x: merkez(cur.misafirKapi[0]), y: merkez(cur.misafirKapi[1]) } : null;
    harita.zilYeri = cur.zil ? { x: merkez(cur.zil[0]), y: merkez(cur.zil[1]) } : null;
    harita.hoparlorler = harita.esyalar.filter(function (e) { return e.tur === 'hoparlor_direk' || e.tur === 'okul_hoparlor' || e.tur === 'telsiz_bebek' || e.tur === 'megafon_direk' || e.tur === 'koy_cani'; })
      .map(function (e) { return { x: (e.tx + e.w / 2) * T, y: (e.ty + e.h / 2) * T, tur: e.tur }; });
    harita.gokceMasa = { x: merkez(cur.gokce[0]), y: merkez(cur.gokce[1]), yon: -Math.PI / 2 };
    harita.mikrofonYeri = { x: merkez(cur.mikrofon[0]), y: merkez(cur.mikrofon[1]), yon: -Math.PI / 2 };
    // Yalnız dekor: bu alanın çit ve duvar çarpışmaları ASCII haritada kalır.
    harita.dekorCephe = harita.bolum === 1
      ? { tx: 8, ty: 34, w: 28, h: 3, ad: 'Ebe & Dede', kapiTx: 22, kapiTy: 31 }
      : (harita.bolum === 2
        ? { tx: 6, ty: 1, w: 32, h: 3, ad: 'Annemle Babamın Evi', kapiTx: 22, kapiTy: 4 }
        : null);
    kurKatlar();
    harita.anahtarDeneme = siraAl(bolum, bakSadece);   // sayfa yüklenirken yapılan ilk init sayacı ilerletmez
    harita.sifirla();
  };

  // ---- Katlar ve portallar (GENEL: AVM gibi çok katlı bölümler de bolum verisindeki kat/portal alanlarını doldurur) ----
  // cur.kat = {sinir: kat sınırı satırı, dy: üst katın satır kayması, ad: [kat adları]}; cur.portal = [[ax,ay,bx,by], ...]
  // Kat, konumdan türetilir (katOf): sınırın üstü 0, altı 1; durum tutulmaz, ışınlanınca kendiliğinden değişir.
  var portalGrid = null, portalKenar = [];
  function kurKatlar() {
    var kt = cur.kat, i;
    harita.portallar = []; portalKenar = []; portalGrid = new Int32Array(W * H);
    for (i = 0; i < portalGrid.length; i++) portalGrid[i] = -1;
    if (!kt) { harita.katSayisi = 1; harita.katSinirY = 0; harita.katDy = 0; harita.katAdlari = ['']; return; }
    harita.katSayisi = 2; harita.katSinirY = kt.sinir * T; harita.katDy = (kt.dy || 0); harita.katAdlari = (kt.ad || ['Zemin Kat', 'Üst Kat']).slice();
    (cur.portal || []).forEach(function (q, n) {
      var a = { tx: q[0], ty: q[1], x: merkez(q[0]), y: merkez(q[1]) }, b = { tx: q[2], ty: q[3], x: merkez(q[2]), y: merkez(q[3]) };
      a.kat = harita.katOf(a.y); b.kat = harita.katOf(b.y);
      harita.portallar.push({ id: 'portal' + n, a: a, b: b });
      var ai = a.ty * W + a.tx, bi = b.ty * W + b.tx;
      portalGrid[ai] = bi; portalGrid[bi] = ai;
      portalKenar.push({ from: ai, to: bi, fk: a.kat, tk: b.kat }, { from: bi, to: ai, fk: b.kat, tk: a.kat });
    });
  }
  // px y -> kat (0 zemin, 1 üst); tek katlı bölümde hep 0
  harita.katOf = function (y) { return (harita.katSayisi > 1 && y >= harita.katSinirY) ? 1 : 0; };
  harita.katAdi = function (k) { return (harita.katAdlari && harita.katAdlari[k]) || ''; };
  // iki nokta aynı kattaysa düz mesafe; farklı kattaysa katlar üst üste bindirilmiş (kat dışı ses vb. için)
  harita.katMesafe = function (x1, y1, x2, y2) {
    var k1 = harita.katOf(y1), k2 = harita.katOf(y2);
    if (k1 !== k2) { if (k2 > k1) y2 -= harita.katDy * T; else y2 += harita.katDy * T; }
    return Math.hypot(x2 - x1, y2 - y1);
  };
  // (x,y) konumuna r px içindeki portal karosu: {x,y (karo merkezi), hedef:{x,y,kat}, kat} | null  (E ile merdiven için)
  harita.portalYakin = function (x, y, r) {
    var en = null, em = (r || 52) + 0.01, k = harita.katOf(y);
    for (var i = 0; i < harita.portallar.length; i++) {
      var p = harita.portallar[i], dir = [[p.a, p.b], [p.b, p.a]];
      for (var j = 0; j < 2; j++) {
        var f = dir[j][0], t = dir[j][1];
        if (f.kat !== k) continue;
        var m = Math.hypot(f.x - x, f.y - y);
        if (m < em) { em = m; en = { x: f.x, y: f.y, kat: f.kat, hedef: { x: t.x, y: t.y, kat: t.kat }, mesafe: m, id: p.id }; }
      }
    }
    return en;
  };
  // yapay zekâ geçişi: yolBul noktasındaki portal alanı ya da {x,y} hedefe ışınlar
  harita.portalGec = function (ent, p) {
    var dst = p && p.portal ? p.portal : p;
    if (!ent || !dst || typeof dst.x !== 'number') return false;
    var x0 = ent.x, y0 = ent.y;
    ent.x = dst.x; ent.y = dst.y; ent.portalT = 0.45;
    if (G.olay) G.olay('portal_gecti', { x0: x0, y0: y0, x: ent.x, y: ent.y, kim: ent.kim || ent.ad || '' });
    return true;
  };

  harita.sifirla = function () {
    for (var i = 0; i < harita.kapilar.length; i++) {
      harita.kapilar[i].acik = kapiOrijinal[i].acik;
      harita.kapilar[i].kilit = kapiOrijinal[i].kilit;
    }
    harita.toplanabilir.length = 0;
    for (var j = 0; j < TOPLA_VERI.length; j++) {
      var t = TOPLA_VERI[j];
      harita.toplanabilir.push({ id: t[0], tur: t[1], x: merkez(t[2]), y: merkez(t[3]), alindi: false });
    }
    var cy = CIKARTMA_YER[harita.bolum] || [];
    for (var ci = 0; ci < cy.length; ci++) {
      harita.toplanabilir.push({ id: 'cikartma' + ci, tur: 'cikartma', cikartma: true, no: ci, x: merkez(cy[ci][0]), y: merkez(cy[ci][1]), alindi: false });
    }
    aramaKur();
  };

  // Arama noktalari: anahtarlar yerde durmaz; her anahtar icin aday noktalardan biri (rastgele) gercektir.
  // Gercek noktanin konumu anahtarin toplanabilir kaydina yazilir ve kayit 'gizli' olur (oyuncu yalniz aramayla bulur).
  // Gerçek nokta rastgele değil, döngüsel sırayla değişir: deneme sayacı localStorage 'abk_anahtarSira_b{n}' (yoksa bellek içi).
  var siraBellek = {};
  function siraAl(b, bakSadece) {
    var v = null;
    try { v = localStorage.getItem('abk_anahtarSira_b' + b); } catch (e) { v = null; }
    var n = v !== null && v !== undefined ? (parseInt(v, 10) || 0) : (siraBellek[b] || 0);
    if (bakSadece) return n;
    siraBellek[b] = n + 1;
    try { localStorage.setItem('abk_anahtarSira_b' + b, String(n + 1)); } catch (e) { }
    return n;
  }
  harita.yeniDeneme = function () { harita.anahtarDeneme = siraAl(harita.bolum); harita.sifirla(); };
  function aramaKur() {
    var liste = (cur && cur.arama) || [], gruplar = {}, i;
    harita.aramaNoktalari = [];
    for (i = 0; i < liste.length; i++) {
      var a = liste[i], e = null;
      for (var q = 0; q < harita.esyalar.length; q++) if (harita.esyalar[q].tx === a[1] && harita.esyalar[q].ty === a[2]) { e = harita.esyalar[q]; break; }
      var n = { id: 'ara' + i, anahtar: a[0], tx: a[1], ty: a[2], w: e ? e.w : 1, h: e ? e.h : 1, ad: e ? e.ad : 'Eşya', tur: e ? e.tur : '',
        x: (a[1] + (e ? e.w : 1) / 2) * T, y: (a[2] + (e ? e.h : 1) / 2) * T, mesaj: a[3] || 'Burada sadece çorap var!', gercek: false, bakildi: false, ipucu: false };
      (gruplar[a[0]] = gruplar[a[0]] || []).push(n);
      harita.aramaNoktalari.push(n);
    }
    Object.keys(gruplar).forEach(function (an) {
      var g = gruplar[an], sec = g[(harita.anahtarDeneme || 0) % g.length];
      sec.gercek = true;
      for (var k = 0; k < harita.toplanabilir.length; k++) {
        var tp = harita.toplanabilir[k];
        if (tp.tur === an) { tp.x = sec.x; tp.y = sec.y; tp.gizli = true; }
      }
    });
    harita.aramaGruplari = gruplar;
  }

  function ssol(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= W || ty >= H) return true;
    return solidGrid[ty][tx] === 1;
  }

  harita.zemin = function (tx, ty) {
    if (tx < 0 || ty < 0 || tx >= W || ty >= H) return 'dis';
    var ch = grid[ty][tx];
    if (ch === 'd' || ch === 'M' || ch === 'K') return zeminKapi;
    return ZEMIN[ch] || 'cim';
  };
  harita.duvarMi = function (tx, ty) { return ssol(tx, ty); };
  harita.kapiAt = function (tx, ty) {
    if (tx < 0 || ty < 0 || tx >= W || ty >= H) return null;
    return kapiGrid[ty][tx];
  };
  harita.kati = function (tx, ty) {
    if (ssol(tx, ty)) return true;
    var k = kapiGrid[ty][tx];
    return !!(k && !k.acik);
  };

  harita.odaAdi = function (x, y) {
    var tx = Math.floor(x / T), ty = Math.floor(y / T);
    function ara(a, b) {
      for (var i = 0; i < ODALAR.length; i++) {
        var o = ODALAR[i];
        if (a >= o.x && a < o.x + o.w && b >= o.y && b < o.y + o.h) return o.ad;
      }
      return null;
    }
    var r = ara(tx, ty);
    if (r) return r;
    if (harita.kapiAt(tx, ty)) {
      var n = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (var i = 0; i < 4; i++) { r = ara(tx + n[i][0], ty + n[i][1]); if (r) return r; }
    }
    if (harita.bolum === 6) return ty <= cur.sokakSon ? 'Sokak' : 'Bahçe';
    if (harita.bolum === 5) return ty <= cur.sokakSon ? 'Sokak' : 'Bahçe';
    if (harita.bolum === 4) return ty <= cur.sokakSon ? 'Sokak' : 'Okul Bahçesi';
    if (harita.bolum === 3) return ty <= cur.sokakSon ? 'Sokak' : 'Park';
    if (harita.bolum === 2) return ty <= cur.sokakSon ? 'Sokak' : 'Bahçe';
    if (ty >= 26) return 'Sokak';
    if (tx >= 11 && tx <= 33 && ty >= 2 && ty <= 21) return 'Ev';
    return 'Bahçe';
  };

  // ---- Görüş -----------------------------------------------------------
  harita.gorusEngeli = function (x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy);
    var n = Math.max(1, Math.ceil(d / 8));
    for (var i = 0; i <= n; i++) {
      var px = x1 + dx * i / n, py = y1 + dy * i / n;
      var tx = Math.floor(px / T), ty = Math.floor(py / T);
      if (tx < 0 || ty < 0 || tx >= W || ty >= H) return true;
      var ch = grid[ty][tx];
      if (ch === '#' || ch === 'D' || ch === 'V') return true;
      if (yuksekGrid[ty][tx]) return true;
      var k = kapiGrid[ty][tx];
      if (k && !k.acik) return true;
    }
    return false;
  };

  // ---- Hareket ---------------------------------------------------------
  function katiH(tx, ty, kapiGec, alt) {
    if (ssol(tx, ty)) { if (!(alt && altGrid[ty] && altGrid[ty][tx])) return true; }
    if (!kapiGec) { var k = kapiGrid[ty][tx]; if (k && !k.acik) return true; }
    return false;
  }

  function adimX(ent, dx, kapiGec) {
    var r = ent.r || 14, alt = !!ent.altGec;
    ent.x += dx;
    var y = ent.y;
    var x0 = Math.floor((ent.x - r) / T), x1 = Math.floor((ent.x + r) / T);
    var y0 = Math.floor((y - r) / T), y1 = Math.floor((y + r) / T);
    for (var ty = y0; ty <= y1; ty++) for (var tx = x0; tx <= x1; tx++) {
      if (!katiH(tx, ty, kapiGec, alt)) continue;
      var cy = Math.max(ty * T, Math.min(ty * T + T, y));
      var ddy = cy - y;
      if (Math.abs(ddy) >= r) continue;
      var h = Math.sqrt(r * r - ddy * ddy);
      var cx = tx * T + T / 2;
      if (ent.x < cx) { var lim = tx * T - h - 0.01; if (ent.x > lim) ent.x = lim; }
      else { var lim2 = tx * T + T + h + 0.01; if (ent.x < lim2) ent.x = lim2; }
    }
  }
  function adimY(ent, dy, kapiGec) {
    var r = ent.r || 14, alt = !!ent.altGec;
    ent.y += dy;
    var x = ent.x;
    var x0 = Math.floor((x - r) / T), x1 = Math.floor((x + r) / T);
    var y0 = Math.floor((ent.y - r) / T), y1 = Math.floor((ent.y + r) / T);
    for (var ty = y0; ty <= y1; ty++) for (var tx = x0; tx <= x1; tx++) {
      if (!katiH(tx, ty, kapiGec, alt)) continue;
      var cx = Math.max(tx * T, Math.min(tx * T + T, x));
      var ddx = cx - x;
      if (Math.abs(ddx) >= r) continue;
      var h = Math.sqrt(r * r - ddx * ddx);
      var cy = ty * T + T / 2;
      if (ent.y < cy) { var lim = ty * T - h - 0.01; if (ent.y > lim) ent.y = lim; }
      else { var lim2 = ty * T + T + h + 0.01; if (ent.y < lim2) ent.y = lim2; }
    }
  }

  harita.hareketEt = function (ent, dx, dy, kapiGec) {
    kapiGec = !!kapiGec;
    var n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 8));
    var sx = dx / n, sy = dy / n;
    for (var i = 0; i < n; i++) {
      if (sx) adimX(ent, sx, kapiGec);
      if (sy) adimY(ent, sy, kapiGec);
    }
  };

  // ---- Yol bulma (A*) --------------------------------------------------
  function gecilebilir(tx, ty, kapiGec, alt) {
    if (ssol(tx, ty) && !(alt && altGrid[ty] && altGrid[ty][tx])) return false;
    if (!kapiGec) { var k = kapiGrid[ty][tx]; if (k && !k.acik) return false; }
    return true;
  }

  function enYakinBos(tx, ty, kapiGec, alt) {
    tx = Math.max(0, Math.min(W - 1, tx)); ty = Math.max(0, Math.min(H - 1, ty));
    if (gecilebilir(tx, ty, kapiGec, alt)) return [tx, ty];
    for (var r = 1; r < 12; r++) {
      var best = null, bd = 1e9;
      for (var oy = -r; oy <= r; oy++) for (var ox = -r; ox <= r; ox++) {
        if (Math.max(Math.abs(ox), Math.abs(oy)) !== r) continue;
        var a = tx + ox, b = ty + oy;
        if (a < 0 || b < 0 || a >= W || b >= H) continue;
        if (!gecilebilir(a, b, kapiGec, alt)) continue;
        var dd = ox * ox + oy * oy;
        if (dd < bd) { bd = dd; best = [a, b]; }
      }
      if (best) return best;
    }
    return null;
  }

  harita.yolBul = function (x1, y1, x2, y2, kapiGec, alt) {
    if (kapiGec === undefined) kapiGec = true;
    alt = !!alt;
    var s = enYakinBos(Math.floor(x1 / T), Math.floor(y1 / T), kapiGec, alt);
    var g = enYakinBos(Math.floor(x2 / T), Math.floor(y2 / T), kapiGec, alt);
    if (!s || !g) return null;
    if (s[0] === g[0] && s[1] === g[1]) return [{ x: merkez(g[0]), y: merkez(g[1]) }];
    var N = W * H, si = s[1] * W + s[0], gi = g[1] * W + g[0];
    var gS = new Float32Array(N); for (var q = 0; q < N; q++) gS[q] = 1e9;
    var ata = new Int32Array(N); for (q = 0; q < N; q++) ata[q] = -1;
    var kapali = new Uint8Array(N);
    // ikili yığın
    var hp = [], hf = [];
    function it(i, f) {
      hp.push(i); hf.push(f);
      var c = hp.length - 1;
      while (c > 0) {
        var p = (c - 1) >> 1;
        if (hf[p] <= hf[c]) break;
        var ti = hp[p]; hp[p] = hp[c]; hp[c] = ti; var tf = hf[p]; hf[p] = hf[c]; hf[c] = tf; c = p;
      }
    }
    function cek() {
      var top = hp[0], li = hp.pop(), lf = hf.pop();
      if (hp.length) {
        hp[0] = li; hf[0] = lf;
        var c = 0, L = hp.length;
        for (;;) {
          var a = 2 * c + 1, b = a + 1, m = c;
          if (a < L && hf[a] < hf[m]) m = a;
          if (b < L && hf[b] < hf[m]) m = b;
          if (m === c) break;
          var ti = hp[m]; hp[m] = hp[c]; hp[c] = ti; var tf = hf[m]; hf[m] = hf[c]; hf[c] = tf; c = m;
        }
      }
      return top;
    }
    var gk = harita.katOf(merkez(g[1])), kenarVar = portalKenar.length > 0;
    function oct(ax, ay, bx, by) { var ddx = Math.abs(ax - bx), ddy = Math.abs(ay - by); return Math.max(ddx, ddy) + 0.4142 * Math.min(ddx, ddy); }
    function hh(i) {
      var cx0 = i % W, cy0 = (i / W) | 0;
      if (kenarVar && harita.katOf(merkez(cy0)) !== gk) {
        var best = 1e9, ck = harita.katOf(merkez(cy0));
        for (var e = 0; e < portalKenar.length; e++) {
          var pe = portalKenar[e]; if (pe.fk !== ck || pe.tk !== gk) continue;
          var v = oct(cx0, cy0, pe.from % W, (pe.from / W) | 0) + 7 + oct(pe.to % W, (pe.to / W) | 0, g[0], g[1]);
          if (v < best) best = v;
        }
        return best < 1e9 ? best : oct(cx0, cy0, g[0], g[1]);
      }
      return oct(cx0, cy0, g[0], g[1]);
    }
    gS[si] = 0; it(si, hh(si));
    var DX = [1, -1, 0, 0, 1, 1, -1, -1], DY = [0, 0, 1, -1, 1, -1, 1, -1];
    var bulundu = false;
    while (hp.length) {
      var cur = cek();
      if (kapali[cur]) continue;
      kapali[cur] = 1;
      if (cur === gi) { bulundu = true; break; }
      var cx = cur % W, cy = (cur / W) | 0;
      for (var d = 0; d < 8; d++) {
        var nx = cx + DX[d], ny = cy + DY[d];
        if (!gecilebilir(nx, ny, kapiGec, alt)) continue;
        if (d >= 4 && (!gecilebilir(cx + DX[d], cy, kapiGec, alt) || !gecilebilir(cx, cy + DY[d], kapiGec, alt))) continue;
        var ni = ny * W + nx;
        if (kapali[ni]) continue;
        var ng = gS[cur] + (d >= 4 ? 1.4142 : 1) + yakinGrid[ny][nx] * 0.35;
        if (ng < gS[ni]) { gS[ni] = ng; ata[ni] = cur; it(ni, ng + hh(ni)); }
      }
      if (kenarVar && portalGrid[cur] >= 0) {   // merdiven: karo -> öbür kattaki karo (maliyet 7 karo)
        var pi2 = portalGrid[cur];
        if (!kapali[pi2]) { var pg2 = gS[cur] + 7; if (pg2 < gS[pi2]) { gS[pi2] = pg2; ata[pi2] = cur; it(pi2, pg2 + hh(pi2)); } }
      }
    }
    if (!bulundu) return null;
    var hucre = [], c2 = gi;
    while (c2 !== -1) { hucre.push(c2); if (c2 === si) break; c2 = ata[c2]; }
    hucre.reverse();   // si ... gi
    var yol = [];
    for (var hi = 0; hi < hucre.length; hi++) {
      var cc = hucre[hi], nokta = { x: merkez(cc % W), y: merkez((cc / W) | 0) };
      if (hi + 1 < hucre.length && portalGrid[cc] === hucre[hi + 1]) { var nx2 = hucre[hi + 1]; nokta.portal = { x: merkez(nx2 % W), y: merkez((nx2 / W) | 0) }; }
      if (hi === 0 && !nokta.portal) continue;   // başlangıç karosu yola girmez (portal karosunda duruyorsa girer)
      yol.push(nokta);
    }
    return yol;
  };

  G.harita = harita;
  harita.init(G.bolum || 1, true);
})();
