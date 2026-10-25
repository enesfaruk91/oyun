window.G = window.G || {};
(function () {
  var T = 48;
  var k = null, s = null;

  var HIZ = { suphe: 105, arama: 95, yorgun: 70 };
  // Zorluk (EK-8): bölüm verisinden gelir (G.bolumler[n].zorluk); yoksa kişinin kendi değerleri.
  function zor() { try { return (G.bolumBilgi && G.bolumBilgi().zorluk) || null; } catch (e) { return null; } }
  function hizD() { var c = KISI[k && k.kim] || KISI.baba, z = zor(); return c.devriye * ((z && z.devriye) || 1); }
  function hizK() { var c = KISI[k && k.kim] || KISI.baba, z = zor(); return z && z.kovalama ? z.kovalama + (c.ek || 0) : c.kovalama; }
  function supheCarpan() { var z = zor(); return (z && z.suphe) || 1; }
  var KISI = {
    baba: { devriye: 85, kovalama: 170, gorus: 330, ek: 0 },
    anne: { devriye: 95, kovalama: 175, gorus: 350, ek: 5 },
    dede: { devriye: 80, kovalama: 160, gorus: 300, ek: -5 },
    ebe: { devriye: 85, kovalama: 165, gorus: 310, ek: 0 },
    bekci: { devriye: 85, kovalama: 165, gorus: 320, ek: 0 },
    bekci2: { devriye: 90, kovalama: 170, gorus: 320, ek: 5 },
    ogretmen: { devriye: 90, kovalama: 170, gorus: 330, ek: 5 },
    mudur: { devriye: 75, kovalama: 160, gorus: 320, ek: -5 },
    dedehassi: { devriye: 80, kovalama: 160, gorus: 310, ek: -5 },
    beren: { devriye: 62, kovalama: 150, gorus: 330, ek: 0 }   // bebek: emekler (oyuncu koşusu 215'in çok altında)
  };
  function NOBET_SURE_F() { var z = zor(); return (z && z.nobet) || 65; }
  var SOZK = {
    baba: {
      mirilti: ['Hmm hmm hmm♪', 'La la laa... ne güzel evim!', 'Çimler yine uzamış...', 'Bugün ev ne kadar sessiz, ne güzel!', 'Of, belim... hmm hmm♪'],
      suphe: ['Kim var orada?', 'Bir ses duydum...', 'Hıh? Kim o?'],
      esya: ['Bu ses de ne?', 'Biri bir şey mi düşürdü?', 'Ne düştü orada?'],
      gordu: ['Ogeday! Hemen buraya gel!'],
      kovala: ['Ogeday! Hemen buraya gel!', 'Yakalarsam gıdıklarım!', 'Dur bakalım, kaçamazsın!'],
      arama: ['Nereye saklandı bu yaramaz?', 'Buralarda olmalı...', 'Çık ortaya, gıdıklamayacağım! Belki...'],
      yakala: ['Yakaladım! Gıdı gıdı gıdı!'],
      gokce: ['Gökçe, yine sen!', 'Top falan yok burada!', 'Hadi bakalım Gökçe!', 'Gökçe, ayakkabılarınla halıya basma!', 'Annen seni arıyordur!', 'Gel buraya, küçük hanım!'],
      hayalet: ['Nereye gitti bu?!', 'Hayalet mi gördüm?', 'Yok oldu! Nasıl yani?!'],
      vazgec: ['Rüzgârdır herhalde...', 'Neyse, kim varsa gitmiş.', 'Hıh! Hayal görüyorum galiba.']
    },
    anne: {
      mirilti: ['La la laa♪ ne güzel bir akşam...', 'Hmm, çay demlesem mi?', 'Bu bigudiler bir türlü tutmadı...', 'Çocuklar ne kadar sessiz... şüpheli!', 'Tralala♪ terlik, terlik...'],
      suphe: ['Ogeday? Atılay? Giray? Ne yapıyorsunuz?', 'Bir şey duydum... kim o?', 'Çocuklar? Orada mısınız?'],
      esya: ['Bu ses de neydi?', 'Biri bir şey mi düşürdü?', 'Mutfakta mı bir şey düştü?'],
      gordu: ['Durun bakalım! Yatma vakti geçti!'],
      kovala: ['Durun bakalım! Yatma vakti geçti!', 'Ogeday! Gel buraya!', 'Terlikle yetişirim size!'],
      arama: ['Ogeday? Atılay? Giray?', 'Nereye saklandınız bakalım?', 'Çıkın çıkın, yatma vakti!'],
      yakala: ['Yakaladım! Hadi bakalım, öpücük cezası!'],
      gokce: ['Gökçe! Yine mi sen!', 'Gökçe, hadi eve!', 'Bu kız da amma yaramaz!', 'Dur bakalım küçük hanım!', 'Yemek hazır Gökçe, gel!', 'Terliği fırlatırım ha!'],
      hayalet: ['Nereye gitti bu?!', 'Hayalet mi gördüm?', 'Yok oldu! Nasıl yani?!'],
      vazgec: ['Rüzgârdır herhalde...', 'Neyse, hayal görmüşüm.', 'Hımm, çocuklar uyumuştur herhalde.']
    }
  };
  SOZK.dede = {
    mirilti: ['Hmm hmm... eski şarkılar...', 'Gözlüğüm nerede? Burnumda zaten!', 'Bastonum, bastonum... şurada!', 'Ah, bu bel... hmm hmm♪', 'Bahçe ne güzel olmuş, tavuklar mutlu...'],
    suphe: ['Kim var orada? Gözlüğüm nerede?', 'Bir ses duydum... kim o kuzum?', 'Hıh? Kim o?'],
    esya: ['Bu ses de neydi?', 'Tavuklar mı devirdi yine?', 'Ne düştü orada kuzum?'],
    gordu: ['Gel kuzum gel!'],
    kovala: ['Gel kuzum gel!', 'Yanaklarını sıkacağım!', 'Dur bakalım evladım, bastonum yetişir!'],
    arama: ['Nereye saklandı bu kuzu?', 'Buralarda olmalı... gözlüğüm!', 'Çık ortaya, sadece yanak sıkacağım!'],
    yakala: ['Gel bakalım kuzum! Yanaklarını sıkayım!'],
    gokce: ['Gökçe, yine sen mi kuzum!', 'Top falan yok burada!', 'Hadi bakalım Gökçe, ders yok mu?', 'Gel buraya, küçük hanım!', 'Annen seni arıyordur!', 'Bastonumu getirin, yetişemiyorum!'],
    hayalet: ['Nereye gitti bu?! Gözlüğüm!', 'Hayalet mi gördüm?', 'Yok oldu! Nasıl yani?!'],
    vazgec: ['Rüzgârdır herhalde...', 'Neyse, gözlerimiz yanılmış galiba.', 'Hıh! Tavuk olmalı.']
  };
  SOZK.ebe = {
    mirilti: ['Kurabiyeler fırında...', 'Bir ilmek, iki ilmek... hmm hmm♪', 'Yazmam nerede? Başımda zaten!', 'Torunlar ne kadar sessiz... şüpheli!', 'Tralala♪ örgü, örgü...'],
    suphe: ['Kurabiyeler fırında, kim o?', 'Bir şey duydum... kim o yavrum?', 'Çocuklar? Orada mısınız?'],
    esya: ['Bu ses de neydi?', 'Aman, tepsi mi düştü?', 'Mutfakta mı bir şey düştü?'],
    gordu: ['Aman yavrum düşeceksin!'],
    kovala: ['Aman yavrum düşeceksin!', 'Dur yavrum, kurabiye var!', 'Yetişirim ben sana, örgü şişimle!'],
    arama: ['Nereye saklandınız yavrularım?', 'Çıkın çıkın, kurabiye soğuyor!', 'Gözlüğüm... nerede bu çocuk?'],
    yakala: ['Yakaladım! Hadi kurabiye ye bakalım!'],
    gokce: ['Gökçe! Yine mi sen yavrum!', 'Gökçe, hadi eve, yemek hazır!', 'Bu kız da amma yaramaz!', 'Dur bakalım küçük hanım!', 'Aman düşeceksin Gökçe!', 'Kurabiye var Gökçe, gel!'],
    hayalet: ['Nereye gitti bu?!', 'Hayalet mi gördüm?', 'Yok oldu! Nasıl yani?!'],
    vazgec: ['Rüzgârdır herhalde...', 'Neyse, hayal görmüşüm.', 'Hımm, çocuklar uyumuştur herhalde.']
  };

  SOZK.bekci = {
    mirilti: ['Park ne güzel, sessiz sakin...', 'Düdüğüm nerede? Boynumda zaten!', 'Hmm hmm, devriye vakti♪', 'Duman yine nerede acaba?'],
    suphe: ['Kim var orada?', 'Bir ses duydum...', 'Park kapanmadı mı daha?'],
    esya: ['Bu ses de ne?', 'Biri bir şey mi düşürdü?', 'Ne düştü orada?'],
    gordu: ['Dur bakalım! Parkta koşmak yok!'],
    kovala: ['Dur bakalım küçük kaşif!', 'Düdüğü öttüreceğim ha!', 'Parkta koşmak yok!'],
    arama: ['Nereye saklandı bu küçük kaşif?', 'Buralarda olmalı...', 'Çık ortaya, kızmayacağım!'],
    yakala: ['Yakaladım! Hadi seni kapıya götüreyim.'],
    gokce: ['Gökçe, parkta koşmak yok!', 'Dur bakalım küçük hanım!', 'Annen seni arıyordur!'],
    hayalet: ['Nereye gitti bu?!', 'Hayalet mi gördüm?', 'Yok oldu! Nasıl yani?!'],
    vazgec: ['Rüzgârdır herhalde...', 'Neyse, kimse yok.', 'Hıh! Hayal görüyorum galiba.']
  };
  SOZK.bekci2 = {
    mirilti: ['Hmm hmm, kahve içsem...', 'Rıza abi uyuyor, ben bakarım♪', 'Park bu gece benim!', 'Duman, nerdesin?'],
    suphe: ['Kim var orada?', 'Bir şey kıpırdadı...', 'Hıh? Kim o?'],
    esya: ['Bu ses de ne?', 'Ne düştü orada?', 'Biri mi geldi?'],
    gordu: ['Dur orada, küçük kaşif!'],
    kovala: ['Dur bakalım kuzu!', 'Kaçamazsın!', 'Düdüğüm var ha!'],
    arama: ['Nereye saklandın kuzu?', 'Buralarda olmalı...', 'Çık ortaya, sadece konuşacağız!'],
    yakala: ['Yakaladım! Hadi seni kapıya götüreyim.'],
    gokce: ['Gökçe, dur bakalım!', 'Hadi eve Gökçe!', 'Küçük hanım, park kapanıyor!'],
    hayalet: ['Nereye gitti bu?!', 'Hayalet mi gördüm?', 'Yok oldu! Nasıl yani?!'],
    vazgec: ['Rüzgârdır herhalde...', 'Neyse, kedidir.', 'Hıh! Hayal görüyorum galiba.']
  };
  SOZK.ogretmen = {
    mirilti: ['Nöbet yeri burası... hmm hmm♪', 'Teneffüs zili ne zaman çalacak?', 'Koşmak yok çocuklar!', 'Bayrak ne güzel dalgalanıyor...', 'Kum havuzu yine dağınık!'],
    suphe: ['Kim var orada?', 'Bir ses duydum... çocuklar?', 'Okul tatil, kimse olmamalı!'],
    esya: ['Bu ses de ne?', 'Biri bir şey mi düşürdü?', 'Basket topu mu düştü?'],
    gordu: ['Dur bakalım! Koşmak yok!'],
    kovala: ['Koşmak yok, tatlım!', 'Dur bakalım, sıraya gir!', 'Ödevini yaptın mı?'],
    arama: ['Nereye saklandın tatlım?', 'Sınıfa girme vakti!', 'Çık ortaya, ceza yok!'],
    yakala: ["Yakaladım! Koşmak yok, tatlım!"],
    gokce: ['Gökçe, sen de mi?', 'Gökçe, koşmak yok!', 'Dersin yok muydu Gökçe?', 'Gel buraya, küçük hanım!'],
    hayalet: ['Nereye gitti bu?!', 'Hayalet mi gördüm?', 'Yok oldu! Nasıl yani?!'],
    vazgec: ['Rüzgârdır herhalde...', 'Neyse, kimse yok.', 'Hıh! Hayal görmüşüm.']
  };
  SOZK.mudur = {
    mirilti: ['Evraklar, evraklar... hmm♪', 'Gözlüğüm nerede? Burnumda zaten!', 'Okul tatilken en güzel okul!', 'Çay demlesem mi?', 'Bir kestirsem mi acaba...'],
    suphe: ['Kim var orada?', 'Okulda biri mi var?', 'Hıh? Kim o?'],
    esya: ['Bu ses de ne?', 'Kupa vitrini mi devrildi?', 'Ne düştü orada?'],
    gordu: ['Hop! Okulda ne işin var?'],
    kovala: ['Gel bakalım evladım!', 'Hikâye okuyacağız!', 'Dur bakalım, kaçma!'],
    arama: ['Nereye saklandın evladım?', 'Çık ortaya, ceza yok!', 'Buralarda olmalı...'],
    yakala: ['Gel bakalım evladım, birlikte hikâye okuyalım!'],
    gokce: ['Gökçe, sen de mi?', 'Gökçe, derse dön!', 'Gel buraya, küçük hanım!'],
    hayalet: ['Nereye gitti bu?! Gözlüğüm!', 'Hayalet mi gördüm?', 'Yok oldu! Nasıl yani?!'],
    vazgec: ['Rüzgârdır herhalde...', 'Neyse, hayal görüyorum galiba.', 'Hıh! Öğrenci olmalı.']
  };
  SOZK.dedehassi = {
    mirilti: ['Hmm hmm... eski türküler...', 'Çay demlendi mi acaba?', 'Bastonum, bastonum... şurada!', 'Bu merdivenler de bir gün beni yoracak...', 'Evim iki katlı, torunlar kaybolur!'],
    suphe: ['Kim var orada? Gözlüğüm nerede?', 'Bir ses duydum... kim o kuzum?', 'Hıh? Kim o?'],
    esya: ['Bu ses de neydi?', 'Merdivenden bir şey mi yuvarlandı?', 'Ne düştü orada kuzum?'],
    gordu: ['Gel kuzum gel!'],
    kovala: ['Gel kuzum gel!', 'Sana sarılıp gıdıklayacağım!', 'Dur bakalım evladım, merdivenler benim!'],
    arama: ['Nereye saklandı bu kuzu?', 'Buralarda olmalı... gözlüğüm!', 'Çık ortaya, sadece sarılacağım!'],
    yakala: ['Yakaladım seni! Gel bakalım, gıdı gıdı gıdı!'],
    gokce: ['Gökçe, yine sen mi kuzum!', 'Hadi bakalım Gökçe, ne gösterecektin?', 'Gel buraya, küçük hanım!'],
    hayalet: ['Nereye gitti bu?! Gözlüğüm!', 'Hayalet mi gördüm?', 'Yok oldu! Nasıl yani?!'],
    vazgec: ['Rüzgârdır herhalde...', 'Neyse, gözlerim yanılmış galiba.', 'Hıh! Kedi olmalı.'],
    cay: ['Hanım, çay demlemişsin, geliyorum!', 'Bir bardak çay kimseye zarar vermez!', 'Aaa çay kokusu! Hemen geliyorum!'],
    misafir: ['Hoş geldiniz, hoş geldiniz!', 'Aaa kimler gelmiş!', 'Buyurun buyurun, çay hazır!'],
    gokcekat: ['Yukarıda ne var Gökçe? Geliyorum kuzum!', 'Bir şey mi göstereceksin? Dur, merdiven çıkıyorum!']
  };
  SOZK.beren = {
    mirilti: ['Ba-ba-ba!', 'Gugu gaga!', 'Agu agu!', 'Ma-ma-ma! Maaa!', 'Hihihi!', 'Bıdı bıdı bıdı...', 'Da-da-da!'],
    suphe: ['Ba?', 'Aaa? Ba-ba?', 'Gugu? Kim?'],
    esya: ['Aaa! Bu ne?', 'Ba-ba? Ses!', 'Oooo? Ne düştü?'],
    gordu: ['Aaaa! Abiii! Ba-ba!', 'Hihi! Buldum! Ba!', 'Agu! Gel gel gel!'],
    kovala: ['Ba-ba-ba-ba!', 'Gel gel gel!', 'Hihihi! Agu!', 'Abi! Abi! Abiii!'],
    arama: ['Ba? Ba?', 'Nerede? Gugu?', 'Aaa? Abi?'],
    yakala: ['Ba-ba! Sarıldım!'],
    gokce: ['Gökçe! Ba!', 'Aaa Gökçe! Agu!', 'Hihi! Gökçe!'],
    hayalet: ['Ba? Yok oldu!', 'Gugu? Nerede?'],
    vazgec: ['Ba... Gitti.', 'Gugu... Yok.', 'Ağlamaya mı başlasam...'],
    oyuncak: ['Ba-ba-ba!', 'Gıcır gıcır!', 'Hihihi! Agu!', 'Çıngır çıngır!', 'Ba! Ba! Ba!'],
    firlat: ['Ooo! Oyuncak! Ba-ba!', 'Agu! Benim! Benim!', 'Hihihi! Atttı!', 'Ba-ba-ba! Oyuncak!'],
    gokcekat: ['Ba!'],
    yorgun: ['Aguuu... uykum geldi...', 'Maaa... uyku...'],
    telsiz: ['Aaa? Ses var!', 'Ba? Telsiz?'],
    ispiyon: ['Aaa! Abi! Ba-ba!', 'Abi! Nerede? Agu!', 'Hihi! Geliyorum!']
  };
  var nobetci = 'baba', uyuyanKim = 'anne';
  function bz() { return k && k.kim === 'beren' ? 0.82 : 1; }   // bebek: süphe/arama/yorgun yürüyüşü daha yavaş (emekleme)
  function bebekSes(tur) { if (k && k.kim === 'beren') olay('bebek_ses', { tur: tur, x: k.x, y: k.y }); }
  function Z(ad) { return (SOZK[(k && k.kim) || nobetci] || SOZK.baba)[ad]; }
  function Ad(kim) {
    if (G.kisiAdi) { try { var a = G.kisiAdi(kim); if (a) return a; } catch (e) { } }
    return { baba: 'Baba', anne: 'Anne', dede: 'Dede', ebe: 'Ebe' }[kim] || 'Baba';
  }
  function Ek(kim) { return Ad(kim) + ({ baba: "'da", anne: "'de", dede: "'de", ebe: "'de", bekci: "'da", bekci2: "'de", ogretmen: "'da", mudur: "'de", dedehassi: "'de" }[kim] || "'da"); }
  // geçerli bölümün kişileri [ilk, ikinci]; G.bolumBilgi yoksa eski davranış
  function cift() {
    var b = null;
    try { b = G.bolumBilgi ? G.bolumBilgi() : null; } catch (e) { b = null; }
    if (b && b.kimler && b.kimler.length >= 2) return [b.kimler[0], b.kimler[1]];
    if (b && b.kimler && b.kimler.length === 1) return [b.kimler[0], b.kimler[0]];   // tek arayıcı (kestirme modu)
    return ['baba', 'anne'];
  }
  function tekKisi() { try { return !!(G.bolumBilgi && G.bolumBilgi().tekKisi); } catch (e) { return false; } }
  function ilkNobetci() {
    var b = null;
    try { b = G.bolumBilgi ? G.bolumBilgi() : null; } catch (e) { b = null; }
    var c = cift();
    return (b && b.ilkNobetci && c.indexOf(b.ilkNobetci) >= 0) ? b.ilkNobetci : c[0];
  }
  function diger(kim) { var c = cift(); return c[0] === kim ? c[1] : c[0]; }
  var UYANIS = {
    baba: 'Hıı? Uyandım uyandım!', anne: 'Kim gürültü yapıyor bakalım?',
    dede: 'Hıı? Ne oldu? Gözlüğüm nerede?', ebe: 'Of, kurabiyeler yanmasın...',
    dedehassi: 'Hıı? Kestirmişim! Çay var mıydı?', beren: 'Aguuu... Ba-ba! Uyandım!', bekci: 'Hıı? Nöbet mi? Ben hazırım!', bekci2: 'Tamam tamam, kalktım!',
    ogretmen: 'Zil mi çaldı? Ben hazırım!', mudur: 'Hıı? Evraklar nerede?'
  };

  function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function aciNorm(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }
  function H() { return G.harita || {}; }
  function olay(ad, v) { if (G.olay) G.olay(ad, v || {}); }
  function say(m, sure, zorla) {
    if (!k) return;
    if (!zorla && k.konusma && k.konusma.sure > 0) return;
    k.konusma = { metin: m, sure: sure || 2 };
  }
  function engel(x1, y1, x2, y2) {
    var h = H();
    if (!h.gorusEngeli) return false;
    try { return !!h.gorusEngeli(x1, y1, x2, y2); } catch (e) { return false; }
  }
  // yanlara kaydırılmış 3 ışın: dairesel gövde için doğrudan yürüme güvenli mi
  function dogrudanTemiz(x, y) {
    var dx = x - k.x, dy = y - k.y, L = Math.hypot(dx, dy) || 1;
    var nx = -dy / L * 12, ny = dx / L * 12;
    return !engel(k.x, k.y, x, y) && !engel(k.x + nx, k.y + ny, x + nx, y + ny) && !engel(k.x - nx, k.y - ny, x - nx, y - ny);
  }

  function devriyeListe() {
    var h = H();
    if (h.devriye && h.devriye.length) return h.devriye;
    var b = h.komsuBaslangic || { x: k.x, y: k.y };
    return [{ x: b.x, y: b.y, bekle: 2 }];
  }

  function yeniDurum() {
    return {
      isinma: 3, idx: 0, faz: 'git', zaman: 0, yol: null, yolI: 0, yolHedef: null, birak: false,
      adimT: 0, bakinFaz: Math.random() * 6, bakinTemel: 0,
      miriltiT: 6 + Math.random() * 6,
      stuckT: 0, stuckX: 0, stuckY: 0, takilma: 0,
      kapiIc: null, acanlar: [],
      gurultuTur: null, sHedef: null, sGorme: false, sonGurultu: null,
      sonGorulen: null, sonYon: { x: 0, y: 0 }, oPrev: null, kayipT: 0, rpT: 0, kayipHedefVar: false,
      saklanHedef: null, oncekiGordu: false, oncekiSaklandi: null,
      aramaT: 0, aramaSure: 5.5,
      uyariTutma: false,
      oy: null
    };
  }

  // ---------- yol ----------
  function yolSet(p) {
    s.yol = p; s.yolI = 0; s.takilma = 0; s.stuckT = 0; s.birak = false;
    if (p && p.length && !p[0].portal && Math.hypot(p[0].x - k.x, p[0].y - k.y) < 10) s.yolI = 1;
  }
  function yolHesapla(x, y) {
    var h = H(), p = null;
    s.yolHedef = { x: x, y: y };
    if (h.yolBul) {
      try { p = h.yolBul(k.x, k.y, x, y, true, !!k.altGec); } catch (e) { p = null; }
    } else if (dogrudanTemiz(x, y)) p = [{ x: x, y: y }];
    if (p && p.length) { yolSet(p); return true; }
    return false;
  }
  // hedef ulaşılamazsa çevresindeki noktaları dene (katı mobilya vb.)
  function yolKur(x, y) {
    if (yolHesapla(x, y)) return true;
    var rs = [T * 1.0, T * 2.0];
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
    var f = aciNorm(hedef - k.yon), m = hiz * dt;
    k.yon = aciNorm(k.yon + clamp(f, -m, m));
  }

  function kapiKontrol(x, y) {
    var h = H();
    if (!h.kapiAt) return;
    var kp = h.kapiAt(Math.floor(x / T), Math.floor(y / T));
    if (kp && !kp.acik) {
      kp.acik = true;
      s.acanlar.push(kp);
      olay('kapi_ac', { kapi: kp });
    }
  }

  function kapiKapatKontrol() {
    var h = H();
    if (!h.kapiAt) return;
    var cur = h.kapiAt(Math.floor(k.x / T), Math.floor(k.y / T)) || null;
    if (s.kapiIc && cur !== s.kapiIc) {
      var kd = s.kapiIc, i = s.acanlar.indexOf(kd);
      var benAcmis = i >= 0;
      if (benAcmis) s.acanlar.splice(i, 1);
      var o = G.d && G.d.oyuncu;
      var oyuncuUstunde = o && Math.floor(o.x / T) === kd.tx && Math.floor(o.y / T) === kd.ty;
      if (kd.acik && !oyuncuUstunde && k.durum !== 'kovalama') {
        // kilitli kapıyı açık bırakma (oyuncu anahtarsız geçmesin); diğerlerini %40
        if ((kd.kilit && benAcmis) || (k.durum === 'devriye' && benAcmis && Math.random() < 0.4)) {
          kd.acik = false;
          olay('kapi_kapa', { kapi: kd });
        }
      }
    }
    s.kapiIc = cur;
  }

  // (hx,hy) yönüne hız*dt kadar ilerle
  function adimAt(dt, hiz, hx, hy, donHizi) {
    if (s.portalBekle > 0) { s.portalBekle -= dt; k.hareket = false; return; }   // merdivende kısa bekleme
    var dx = hx - k.x, dy = hy - k.y, L = Math.hypot(dx, dy);
    if (L < 0.001) return;
    var ux = dx / L, uy = dy / L, st = Math.min(hiz * dt, L);
    don(Math.atan2(uy, ux), donHizi || 6, dt);
    kapiKontrol(k.x + ux * (k.r + 8), k.y + uy * (k.r + 8));
    kapiKontrol(k.x, k.y);
    var h = H(), ox = k.x, oy = k.y;
    if (h.hareketEt) {
      try { h.hareketEt(k, ux * st, uy * st, true); } catch (e) { k.x += ux * st; k.y += uy * st; }
    } else { k.x += ux * st; k.y += uy * st; }
    k.hareket = true;
    var gercek = Math.hypot(k.x - ox, k.y - oy);
    k.adimFaz += gercek / 16;
    s.adimT += dt;
    if (s.adimT >= 0.45) {
      s.adimT = 0;
      olay('adim', { x: k.x, y: k.y, kosu: k.durum === 'kovalama', egik: false, kim: 'komsu' });
    }
    // takılma
    s.stuckT += dt;
    if (s.stuckT >= 1.5) {
      var ilerleme = Math.hypot(k.x - s.stuckX, k.y - s.stuckY);
      s.stuckT = 0; s.stuckX = k.x; s.stuckY = k.y;
      if (ilerleme < 22) takildi(); else s.takilma = 0;
    }
  }

  function takildi() {
    s.takilma++;
    if (s.takilma === 1 && s.yolHedef) {
      yolHesapla(s.yolHedef.x, s.yolHedef.y);
      s.takilma = 1;
    } else {
      s.takilma = 0; s.yol = null; s.birak = true;
    }
  }

  function yolTakip(dt, hiz, donHizi) {
    if (yolBitti()) return true;
    var guard = 0;
    while (s.yolI < s.yol.length && guard++ < 4) {
      var p = s.yol[s.yolI];
      var son = s.yolI === s.yol.length - 1;
      if (Math.hypot(p.x - k.x, p.y - k.y) < (son ? 8 : 12)) {
        if (p.portal && H().portalGec) { H().portalGec(k, p); s.portalBekle = 0.4; s.stuckX = k.x; s.stuckY = k.y; s.stuckT = 0; }
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
    k.hareket = false;
    s.stuckT = 0;
  }

  // ---------- durumlar ----------
  function durumDegis(yeni) {
    if (k.durum === yeni) return;
    k.durum = yeni;
    s.faz = 'git'; s.yol = null; s.yolI = 0; s.birak = false; s.takilma = 0; s.stuckT = 0;
    s.stuckX = k.x; s.stuckY = k.y; s.zaman = 0; s.uyariTutma = false;
  }

  function devriyeyeDon() {
    durumDegis('devriye');
    k.uyari = 0;
    s.saklanHedef = null;
    s.faz = 'git';
    var P = devriyeListe();
    // en yakın noktadan devam
    var bi = 0, bd = 1e9;
    for (var i = 0; i < P.length; i++) {
      var dd = Math.hypot(P[i].x - k.x, P[i].y - k.y);
      if (dd < bd) { bd = dd; bi = i; }
    }
    s.idx = bi;
  }

  function supheBasla(x, y, gorme, esya) {
    var onceki = k.durum;
    durumDegis('suphe');
    s.sHedef = { x: x, y: y }; s.sGorme = gorme; s.faz = 'git'; s.yol = null;
    s.bakinTemel = k.yon;
    s.uyariTutma = !gorme;
    if (!gorme && k.uyari < 0.36) k.uyari = 0.36;
    if (onceki !== 'suphe') olay('komsu_suphe', {});
    say(esya ? rnd(Z('esya')) : rnd(Z('suphe')), 2.2, true);
  }

  function aramaBasla(sure) {
    durumDegis('arama');
    s.aramaT = sure; s.aramaSure = sure;
    s.faz = 'bak'; s.zaman = 1.2; s.bakinTemel = k.yon;
    if (k.uyari < 0.5) k.uyari = 0.5;
    say(rnd(Z('arama')), 2.2, true);
  }

  function kovalamaBasla(duyuruVar) {
    var onceki = k.durum;
    durumDegis('kovalama');
    k.uyari = 1;
    s.kayipT = 0; s.rpT = 0; s.kayipHedefVar = false; s.saklanHedef = null;
    // çocuğa kaçma fırsatı: "HEY!" deyip bir an şaşırır
    if (onceki !== 'kovalama') s.sasirT = 0.8;
    if (duyuruVar !== false && onceki !== 'kovalama') {
      olay('komsu_gordu', {});
      say(rnd(Z('gordu')), 2.2, true);
      bebekSes('gordu');
    }
  }

  function yakala() {
    durumDegis('yakaladi');
    k.hareket = false;
    k.uyari = 1;
    say(rnd(Z('yakala')), 3, true);
    bebekSes('kikir');
    olay('yakalandi', { kim: k.kim });
  }

  // ---------- algı ----------
  function oyuncuGoruyor(o, konili, ekMesafe) {
    if (!o || o.saklandi || o.korunan || s.isinma > 0) return false;
    var dist = Math.hypot(o.x - k.x, o.y - k.y);
    if (dist > k.gorusMesafe) return false;
    if (konili) {
      var a = Math.atan2(o.y - k.y, o.x - k.x);
      if (Math.abs(aciNorm(a - k.yon)) > k.gorusAci / 2 && dist > (ekMesafe || 0)) return false;
    }
    return !engel(k.x, k.y, o.x, o.y);
  }
  function oyuncuHissediyor(o, mes) {
    if (!o || o.saklandi || o.korunan || s.isinma > 0) return false;
    if ((o.gorunurluk == null ? 1 : o.gorunurluk) <= 0) return false;
    var dist = Math.hypot(o.x - k.x, o.y - k.y);
    return dist <= (mes || 70) && !engel(k.x, k.y, o.x, o.y);
  }

  function gurultuIsle(d, o, gor, his) {
    var ses = d.sesler;
    if (!ses) return;
    for (var i = 0; i < ses.length; i++) {
      var g = ses[i];
      if (!g || g._komsuIsledi) continue;
      g._komsuIsledi = true;
      if (k.durum === 'kovalama' || k.durum === 'yakaladi') continue;
      if (s.isinma > 0 && g.kaynak !== 'esya') continue;
      var mes = Math.hypot(g.x - k.x, g.y - k.y), gucE = g.guc, hh = H();
      if (g.kat != null && hh.katOf && g.kat !== hh.katOf(k.y)) {   // başka kat: adım/kapı/arama sesi duyulmaz, güçlü sesler çok azalır
        if (g.kaynak === 'oyuncu' || g.kaynak === 'kapi' || g.kaynak === 'arama') continue;
        mes = hh.katMesafe(g.x, g.y, k.x, k.y); gucE = g.guc * 0.35;
      }
      if (!(mes < gucE)) continue;
      if (g.kaynak === 'arama') {   // arama hışırtısı: yalnız şüpheyi biraz artırır (görüş koşulu yok, ama duvar arkasını duymaz)
        if (!engel(k.x, k.y, g.x, g.y) || mes < 90) k.uyari = clamp(k.uyari + 0.07 * supheCarpan(), 0, 0.97);
        continue;
      }
      if (g.kaynak === 'oyuncu' && o && (o.saklandi || o.gorunmez > 0)) continue;
      var esya = g.kaynak === 'esya' || g.kaynak === 'anons';
      // oyuncuyu zaten görüp ona yürüyorsa başka gürültüye aldırma
      if (k.durum === 'suphe' && s.sGorme && (gor || his) && !esya) continue;
      if (k.durum === 'suphe' && !s.sGorme && !esya && s.sonGurultu === 'esya') continue;
      s.sonGurultu = g.kaynak;
      supheBasla(g.x, g.y, false, esya);
    }
  }

  // ---------- ana ----------
  function yatakMerkez() {
    var h = H(), e = h.esyalar || [];
    for (var i = 0; i < e.length; i++) if (e[i] && (e[i].tur === 'yatak' || e[i].tur === 'mudur_divani' || e[i].tur === 'puset')) {
      var y = e[i];
      return { x: (y.tx + (y.w || 1) / 2) * T, y: (y.ty + (y.h || 1) / 2) * T, e: y };
    }
    var b = h.komsuBaslangic || { x: 5 * T, y: 5 * T };
    return { x: b.x, y: b.y, e: null };
  }
  // yatağın yanındaki boş karoların merkezleri (yakından uzağa)
  function yatakYanlari() {
    var m = yatakMerkez(), y = m.e, out = [];
    if (!y) return [{ x: m.x, y: m.y }];
    var w = y.w || 1, hh = y.h || 1, i;
    for (i = 0; i < hh; i++) { out.push({ x: (y.tx - 0.5) * T, y: (y.ty + i + 0.5) * T }); out.push({ x: (y.tx + w + 0.5) * T, y: (y.ty + i + 0.5) * T }); }
    for (i = 0; i < w; i++) { out.push({ x: (y.tx + i + 0.5) * T, y: (y.ty + hh + 0.5) * T }); out.push({ x: (y.tx + i + 0.5) * T, y: (y.ty - 0.5) * T }); }
    out.sort(function (a, b) { return Math.hypot(a.x - m.x, a.y - m.y) - Math.hypot(b.x - m.x, b.y - m.y); });
    return out;
  }
  function uyuyanKur(d, kim) {
    var m = yatakMerkez();
    uyuyanKim = kim;
    d.uyuyan = { kim: kim, x: m.x, y: m.y, yon: Math.PI / 2 };
    if (kim === 'beren') { d.uyuyan.oturuyor = true; d.uyuyan.oturY = 0.43; }   // pusette oturur gibi uyur
  }
  function kisiUygula() {
    var c = KISI[k.kim] || KISI.baba, z = zor();
    k.gorusMesafe = (z && z.gorus) ? z.gorus : c.gorus;
    k.gorusAci = (z && z.gorusAci) || 1.2;
    k.nobetMax = NOBET_SURE_F();
    if (k.kim === 'beren') { k.r = 12; k.altGec = true; }   // bebek boyu: masa/sandalye altından geçer
  }

  // Yakalanma sonrası güvenli başlangıç: varsayılan başlangıç oyuncuya görüş/yakınlık bakımından riskliyse, oyuncudan en uzak (görüş hattı kapalı)
  // devriye noktasını seç. Güvenliyse varsayılan korunur.
  function guvenliBaslangic(d, b) {
    var h = H(), o = d.oyuncu, z = null;
    try { z = G.bolumBilgi().zorluk; } catch (e) { z = null; }
    var gor = (z && z.gorus) || 330;
    function skor(c) {
      var m = Math.hypot(c.x - o.x, c.y - o.y), los = !!(h.gorusEngeli && h.gorusEngeli(c.x, c.y, o.x, o.y));
      return { m: m, los: los, guvenli: los ? m > 300 : m > gor + 150 };
    }
    if (skor(b).guvenli) return b;
    var en = b, es = -1;
    var adaylar = (h.devriye || []).concat([b]);
    for (var i = 0; i < adaylar.length; i++) {
      var c = adaylar[i], sk = skor(c);
      if (!sk.guvenli) continue;
      var puan = sk.m + (sk.los ? 1500 : 0);
      if (puan > es) { es = puan; en = { x: c.x, y: c.y }; }
    }
    return en;
  }

  function init(d, korunsun) {
    var h = H();
    var cf = cift();
    if (korunsun && d.komsu && cf.indexOf(d.komsu.kim) >= 0) {
      nobetci = d.komsu.kim;
      if (d.uyuyan && cf.indexOf(d.uyuyan.kim) >= 0) uyuyanKim = d.uyuyan.kim;
      else uyuyanKim = diger(nobetci);
      if (uyuyanKim === nobetci) uyuyanKim = diger(nobetci);
    } else { nobetci = ilkNobetci(); uyuyanKim = diger(nobetci); }
    var b = h.komsuBaslangic || { x: 5 * T, y: 5 * T };
    if (korunsun && d.oyuncu) b = guvenliBaslangic(d, b);   // yakalandıktan sonra çocuk nöbetçinin dibinde/görüşünde doğmasın
    k = d.komsu = {
      x: b.x, y: b.y, r: 17, yon: Math.PI / 2, hareket: false,
      durum: 'devriye', uyari: 0, gorusAci: 1.2, gorusMesafe: 330,
      adimFaz: 0, konusma: null, oyalaniyor: false, kim: nobetci, nobet: NOBET_SURE_F(), pasif: false
    };
    kisiUygula();
    if (tekKisi()) d.uyuyan = null; else uyuyanKur(d, uyuyanKim);
    s = yeniDurum();
    s.stuckX = k.x; s.stuckY = k.y;
    dinleKur();
    var P = devriyeListe(), bi = 0, bd = 1e9;
    for (var i = 0; i < P.length; i++) {
      var dd = Math.hypot(P[i].x - k.x, P[i].y - k.y);
      if (dd < bd) { bd = dd; bi = i; }
    }
    s.idx = bi;
    s.bakinTemel = k.yon;
    // başlangıçtan önce yakın noktaya değil, bir sonrakine git
    if (P.length > 1 && bd < 40) s.idx = (bi + 1) % P.length;
  }

  function guncelle(dt, d) {
    if (!d || !d.komsu) { if (d) init(d); else return; }
    if (k !== d.komsu) { k = d.komsu; if (!s) s = yeniDurum(); }
    if (!s) s = yeniDurum();
    var o = d.oyuncu;
    k.hareket = false;
    if (k.konusma) { k.konusma.sure -= dt; if (k.konusma.sure <= 0) k.konusma = null; }
    if (k.durum === 'yakaladi') return;
    if (s.isinma > 0) s.isinma -= dt;

    if (k.nobet == null) k.nobet = NOBET_SURE_F();
    if (!k.kim) { k.kim = nobetci; kisiUygula(); }
    if (!tekKisi() && !d.uyuyan && !d.uyanan) uyuyanKur(d, uyuyanKim);
    if (k.pasif) { sesleriYut(d); if (o) s.oPrev = { x: o.x, y: o.y }; kestirGuncelle(dt, d); return; }

    // Gökçe kucağında (Bölüm 6): görme/duyma yok, Gökçe'nin önünde taşınır
    if (s.tasi) {
      sesleriYut(d);
      if (o) s.oPrev = { x: o.x, y: o.y };
      var tg = s.tasi.g;
      if (!tg || d.gokce !== tg) { tasiBirak(); } else {
        k.x = tg.x + Math.cos(tg.yon || 0) * 15; k.y = tg.y + Math.sin(tg.yon || 0) * 15; k.yon = tg.yon || 0;
        k.hareket = false; k.kucakta = true; k.oturuyor = false; k.uyari = 0; return;
      }
    }

    // Gökçe peşinde: görme/hissetme/gürültü yok
    if (s.pg) {
      sesleriYut(d);
      if (o) s.oPrev = { x: o.x, y: o.y };
      pesDavran(dt);
      kapiKapatKontrol();
      return;
    }

    // Gökçe oyalaması: görme/hissetme/gürültü yok
    if (s.oy) {
      if (d.sesler) for (var si = 0; si < d.sesler.length; si++) if (d.sesler[si]) d.sesler[si]._komsuIsledi = true;
      if (o) s.oPrev = { x: o.x, y: o.y };
      oyalanDavran(dt);
      kapiKapatKontrol();
      return;
    }

    zilGuncelle(dt, d);

    // nöbet süresi (kovalamada 2 kat hızlı)
    if (k.durum !== 'yorgun') {
      k.nobet -= dt * (k.durum === 'kovalama' ? 2 : 1);
      if (k.nobet < 0) k.nobet = 0;
      // biri uyanıksa (d.uyuyan yok) devir bekler: nöbet 0'da kalır, devriye sürer
      if (k.nobet <= 0 && k.durum !== 'kovalama' && (tekKisi() ? !d.uyanan : d.uyuyan)) yorgunBasla();
    }
    if (k.durum === 'yorgun') {
      sesleriYut(d);
      if (o) s.oPrev = { x: o.x, y: o.y };
      k.uyari = 0;
      yorgunDavran(dt, d);
      kapiKapatKontrol();
      return;
    }

    // oyuncu hız yönü
    if (o) {
      if (s.oPrev && dt > 0) {
        var vx = o.x - s.oPrev.x, vy = o.y - s.oPrev.y, vl = Math.hypot(vx, vy);
        if (vl > 0.3) s.sonYon = { x: vx / vl, y: vy / vl };
      }
      s.oPrev = { x: o.x, y: o.y };
    }

    // --- algı ---
    var kov = k.durum === 'kovalama';
    var gizli = !!(o && o.gorunmez > 0);
    if (gizli && !s.gizliOnce && kov) say(rnd(Z('hayalet')), 2.4, true);
    s.gizliOnce = gizli;
    var gor = !gizli && oyuncuGoruyor(o, true, kov ? 110 : 0);
    var his = !gizli && !gor && oyuncuHissediyor(o, kov ? 110 : 70);
    var dist = o ? Math.hypot(o.x - k.x, o.y - k.y) : 1e9;

    if (!kov) {
      var gz = o && o.gorunurluk != null ? o.gorunurluk : 1;
      if (gor) {
        var f = clamp(1 - dist / k.gorusMesafe, 0, 1);
        var aFark = Math.abs(aciNorm(Math.atan2(o.y - k.y, o.x - k.x) - k.yon)) / (k.gorusAci / 2);
        var hiz = 0.67 + 1.0 * f * f;          // 1.5 sn ... ~0.6 sn
        hiz *= (1 - 0.35 * clamp(aFark, 0, 1));  // eğik bakış biraz yavaş
        hiz *= gz;                              // eğilince / saklanınca yavaş
        hiz *= supheCarpan();                   // bölüm zorluğu
        k.uyari += hiz * dt;
        s.sonGorulen = { x: o.x, y: o.y };
        if (k.durum === 'suphe' && s.sGorme) s.sHedef = { x: o.x, y: o.y };
      } else if (his) {
        k.uyari += 0.28 * gz * supheCarpan() * dt;
        s.sonGorulen = { x: o.x, y: o.y };
      } else if (!s.uyariTutma) {
        k.uyari -= (k.durum === 'arama' ? 0.06 : 0.14) * dt;
      }
      k.uyari = clamp(k.uyari, 0, 1);
    }

    gurultuIsle(d, o, gor, his);

    // durum geçişleri (algı kaynaklı)
    if (k.durum !== 'kovalama' && k.durum !== 'yakaladi') {
      if (k.uyari >= 1 && (gor || his) && (!G.kovalamaIzni || G.kovalamaIzni(d, 'komsu'))) { kovalamaBasla(); }
      else if (k.uyari >= 1) { k.uyari = 0.99; }
      else if (k.durum === 'devriye' && k.uyari > 0.35) {
        var tx = s.sonGorulen ? s.sonGorulen.x : (o ? o.x : k.x), ty = s.sonGorulen ? s.sonGorulen.y : (o ? o.y : k.y);
        supheBasla(tx, ty, true, false);
      }
    }

    // --- durum davranışı ---
    switch (k.durum) {
      case 'devriye': devriyeDavran(dt); break;
      case 'suphe': supheDavran(dt, o, gor || his); break;
      case 'arama': aramaDavran(dt); break;
      case 'kovalama': kovalamaDavran(dt, d, o, gor, dist); break;
    }

    // mırıldanma
    if (k.durum === 'devriye') {
      s.miriltiT -= dt;
      if (s.miriltiT <= 0) { s.miriltiT = (k.kim === 'beren' ? 5 : 8) + Math.random() * 7; say(rnd(Z('mirilti')), 2.4); bebekSes(Math.random() < 0.35 ? 'kikir' : 'babble'); }
    }
    kapiKapatKontrol();
    if (o) s.oncekiSaklandi = o.saklandi || null;
  }

  function sesleriYut(d) {
    if (d.sesler) for (var si = 0; si < d.sesler.length; si++) if (d.sesler[si]) d.sesler[si]._komsuIsledi = true;
  }

  // ---------- nöbet değişimi ----------
  function yorgunBasla() {
    durumDegis('yorgun');
    k.uyari = 0; k.oyalaniyor = false;
    s.oy = null; s.pg = null; s.saklanHedef = null; s.sasirT = 0;
    s.yorgunT = 0; s.yorgunDene = 0;
    var yl = yatakYanlari();
    s.yatakYan = yl;
    s.yatakHedef = null;
    for (var i = 0; i < yl.length; i++) {
      if (yolHesapla(yl[i].x, yl[i].y) && s.yol && s.yol.length) {
        var son = s.yol[s.yol.length - 1];
        if (Math.hypot(son.x - yl[i].x, son.y - yl[i].y) < 30) { s.yatakHedef = yl[i]; break; }
      }
    }
    if (!s.yatakHedef) s.yatakHedef = yl[0];
    say((Z('yorgun') && rnd(Z('yorgun'))) || 'Ahhh... çok yoruldum...', 3, true);
  }

  function yorgunDavran(dt, d) {
    var hd = s.yatakHedef;
    s.yorgunT += dt;
    if (!tekKisi() && !d.uyuyan) { nobetDegis(d); return; }
    if (!hd || s.yorgunT > 90) { nobetDegis(d); return; }
    if (Math.hypot(hd.x - k.x, hd.y - k.y) < 22) { nobetDegis(d); return; }
    if (s.birak || !s.yol) {
      s.birak = false;
      s.yorgunDene++;
      if (s.yorgunDene > 4 || !yolKur(hd.x, hd.y)) { nobetDegis(d); return; }
    }
    if (yolTakip(dt, HIZ.yorgun * bz(), 4)) {
      s.yol = null;
      if (Math.hypot(hd.x - k.x, hd.y - k.y) < 110) { nobetDegis(d); return; }
      s.yorgunDene++;
      if (s.yorgunDene > 4) nobetDegis(d);
    }
    if (Math.random() < dt * 0.25) say((Z('yorgun') && rnd(Z('yorgun'))) || 'Ahhh... çok yoruldum...', 2.4);
  }

  // ---------- tek arayıcı: kısa kestirme (EK-11) ----------
  function kestirBasla(d, sureOverride, sessiz) {
    var hd = s.yatakHedef || { x: k.x, y: k.y }, kz = null, ar;
    try { kz = G.bolumBilgi().kestirme; } catch (e) { kz = null; }
    ar = (kz && kz.sure) || [16, 24];
    uyuyanKur(d, k.kim);
    k.pasif = true; k.x = hd.x; k.y = hd.y; k.durum = 'devriye'; k.uyari = 0; k.hareket = false; k.oyalaniyor = false; k.konusma = null;
    s.yol = null; s.oy = null; s.pg = null; s.tasi = null; k.oturuyor = false; k.kucakta = false; s.kestirT = sureOverride > 0 ? sureOverride : ar[0] + Math.random() * (ar[1] - ar[0]);
    olay('kestirme_basladi', { kim: k.kim });
    if (G.mesaj && !sessiz) G.mesaj(k.kim === 'beren' ? 'Beren pusette uyuyor! Şimdi fırsat!' : Ad(k.kim) + ' kestiriyor! Şimdi fırsat!', 3);
  }
  function kestirGuncelle(dt, d) {
    k.hareket = false; k.uyari = 0;
    if (d.uyanan) return;   // diafonla uyandı: uyanan.js yönetir, yatağa dönünce kestirme sürer
    if (d.uyuyan) { s.kestirT -= dt; if (s.kestirT > 0) return; }
    kestirBitir(d);
  }
  function kestirBitir(d) {
    var yl = yatakYanlari(), p = yl[0] || { x: k.x, y: k.y }, h = H();
    for (var i = 0; i < yl.length; i++) if (!(h.kati && h.kati(Math.floor(yl[i].x / T), Math.floor(yl[i].y / T)))) { p = yl[i]; break; }
    d.uyuyan = null; k.pasif = false; k.x = p.x; k.y = p.y;
    devriyeyeDon();
    k.durum = 'devriye'; k.uyari = 0; k.nobet = NOBET_SURE_F(); k.oyalaniyor = false;
    s.yol = null; s.birak = false; s.sonGorulen = null; s.kayipT = 0; s.kayipHedefVar = false;
    s.isinma = 2.5; s.stuckX = k.x; s.stuckY = k.y; s.stuckT = 0; s.miriltiT = 8 + Math.random() * 6;
    say(UYANIS[k.kim] || 'Hıı? Uyandım!', 3, true);
    olay('nobet_degisti', { kim: k.kim });
    if (k.kim === 'beren') bebekSes('kikir');
    if (G.mesaj) G.mesaj(k.kim === 'beren' ? 'Beren uyandı, emekliyor!' : Ad(k.kim) + ' uyandı, nöbette!', 3);
  }
  var dinleKuruldu = false;
  function dinleKur() {
    if (dinleKuruldu || !G.dinle) return;
    dinleKuruldu = true;
    G.dinle('yeniden_uyudu', function () { if (k && s && k.pasif) s.kestirT = Math.max(s.kestirT || 0, 6); });
    G.dinle('kat_gecti', function (v) {   // kovalarken çocuğun merdivene bindiğini gördüyse peşinden gider
      if (!k || !s || !G.d || G.d.komsu !== k || k.pasif || k.durum !== 'kovalama') return;
      if (Math.hypot(v.x0 - k.x, v.y0 - k.y) < k.gorusMesafe && !engel(k.x, k.y, v.x0, v.y0)) {
        s.sonGorulen = { x: v.x1, y: v.y1 }; s.sonYon = { x: 0, y: 0 }; s.kayipT = 0; s.kayipHedefVar = false;
      }
    });
  }

  function nobetDegis(d) {
    if (tekKisi()) { kestirBasla(d); return; }
    var eski = k.kim, yeni = diger(eski);
    if (!d.uyuyan) {
      // yürürken biri uyandı: devir iptal, devriyeye dön; uyuyan gelince tekrar yorulur
      devriyeyeDon(); k.oyalaniyor = false; k.nobet = 0;
      return;
    }
    var hd = s.yatakHedef || { x: k.x, y: k.y };
    nobetci = yeni;
    k.kim = yeni;
    kisiUygula();
    uyuyanKur(d, eski);
    k.x = hd.x; k.y = hd.y;
    devriyeyeDon();
    k.durum = 'devriye'; k.uyari = 0; k.nobet = NOBET_SURE_F(); k.oyalaniyor = false;
    s.yol = null; s.birak = false; s.sonGorulen = null; s.kayipT = 0; s.kayipHedefVar = false;
    s.isinma = 2.5; s.stuckX = k.x; s.stuckY = k.y; s.stuckT = 0;
    s.miriltiT = 8 + Math.random() * 6;
    say(UYANIS[yeni] || 'Hıı? Uyandım!', 3, true);
    olay('nobet_degisti', { kim: yeni });
    if (G.mesaj) G.mesaj(Ad(eski) + ' uyudu, nöbet ' + Ek(yeni) + '!', 3);
  }

  // ---------- Gökçe peşinde ----------
  function pesindenGit(hedef, sure, kat) {
    if (!k || !s) { if (G.d && G.d.komsu) { k = G.d.komsu; if (!s) s = yeniDurum(); } else return; }
    if (k.durum === 'yakaladi' || k.pasif || !hedef) return;
    k.durum = 'suphe';
    s.yol = null; s.yolI = 0; s.birak = false; s.takilma = 0; s.stuckT = 0;
    s.stuckX = k.x; s.stuckY = k.y; s.zaman = 0; s.uyariTutma = false;
    s.saklanHedef = null; s.sasirT = 0; s.kayipT = 0; s.kayipHedefVar = false; s.sGorme = false;
    s.oy = null;
    k.uyari = 0;
    k.oyalaniyor = true;
    s.pg = { h: hedef, kalan: sure > 0 ? sure : 10, rpT: 0, sozT: 0, hep: 0, kat: kat === 'kat' };
    olay('komsu_suphe', {});
    say(kat === 'kat' ? rnd(Z('gokcekat') || Z('gokce')) : 'Gökçe! Gel buraya!', 2.4, true);
  }

  function pesBitir() {
    s.pg = null;
    k.oyalaniyor = false;
    olay('komsu_vazgecti', {});
    devriyeyeDon();
    k.oyalaniyor = false;
    say('Of bu çocuklar beni yoracak...', 2.8, true);
  }

  function pesDavran(dt) {
    var pg = s.pg, h = pg.h;
    k.uyari = 0; k.durum = 'suphe'; k.oyalaniyor = true;
    pg.kalan -= dt;
    if (pg.kalan <= 0 || h.bitti === true) { pesBitir(); return; }
    pg.sozT -= dt;
    if (pg.sozT <= 0) { pg.sozT = 2.2; say(pg.kat ? rnd(Z('gokcekat') || Z('gokce')) : (pg.hep++ % 2 ? 'Dur bakalım küçük hanım!' : 'Gökçe! Gel buraya!'), 2, true); }
    var HZ = hizK(), dist = Math.hypot(h.x - k.x, h.y - k.y);
    if (dist < 30) { k.hareket = false; s.stuckT = 0; don(Math.atan2(h.y - k.y, h.x - k.x), 8, dt); return; }
    if (dogrudanTemiz(h.x, h.y)) {
      s.yol = null; s.birak = false;
      adimAt(dt, HZ, h.x, h.y, 12);
    } else {
      pg.rpT -= dt;
      if (pg.rpT <= 0 || !s.yol || s.birak) {
        pg.rpT = 0.3; s.birak = false;
        yolKur(h.x, h.y);
      }
      if (s.yol && yolTakip(dt, HZ, 12)) s.yol = null;
    }
  }

  // ---------- Gökçe dikkat dağıtma ----------
  function dikkatDagit(x, y, sure, konu) {
    if (!k || !s) { if (G.d && G.d.komsu) { k = G.d.komsu; if (!s) s = yeniDurum(); } else return false; }
    if (k.durum === 'yakaladi' || k.pasif) return false;
    sure = sure > 0 ? sure : 9;
    k.durum = 'suphe';
    s.yol = null; s.yolI = 0; s.birak = false; s.takilma = 0; s.stuckT = 0;
    s.stuckX = k.x; s.stuckY = k.y; s.zaman = 0; s.uyariTutma = false;
    s.saklanHedef = null; s.sasirT = 0; s.kayipT = 0; s.kayipHedefVar = false; s.sGorme = false;
    s.sHedef = { x: x, y: y }; s.faz = 'git';
    k.uyari = 0;
    k.oyalaniyor = true;
    s.pg = null;
    s.oy = { x: x, y: y, kalan: sure, faz: 'git', sozT: 0, yolT: 0, konu: konu || 'gokce' };
    k.oturuyor = false; k.kucakta = false;
    olay('komsu_suphe', {});
    var bsoz = (k.kim === 'beren' && Z(konu || '')) ? rnd(Z(konu)) : null;
    say(bsoz || (konu === 'cay' ? rnd(Z('cay')) : (konu === 'misafir' ? rnd(Z('misafir')) : 'Hıh? Kim bağırıyor orada?')), 2.4, true);
    if (bsoz) bebekSes('gordu');
    return true;
  }

  function oyalanBitir() {
    var konu = s.oy && s.oy.konu;
    s.oy = null;
    k.oyalaniyor = false; k.oturuyor = false;
    olay('komsu_vazgecti', {});
    devriyeyeDon();
    k.oyalaniyor = false;
    if (k.kim === 'beren' && (konu === 'oyuncak' || konu === 'firlat')) { say(rnd(['Hihi! Oyun bitti!', 'Ba-ba-ba! Bitti bitti!', 'Agu! Başka oyuncak?']), 2.5, true); bebekSes('kikir'); }
    else say(rnd(Z('vazgec')), 2.5, true);
  }

  function oyalanDavran(dt) {
    var oy = s.oy;
    k.uyari = 0; k.durum = 'suphe'; k.oyalaniyor = true;
    oy.kalan -= dt;
    if (oy.kalan <= 0) { oyalanBitir(); return; }
    var hedefYon = Math.atan2(oy.y - k.y, oy.x - k.x);
    if (oy.konu === 'gokce' && k.kim === 'beren' && G.d && G.d.gokce) hedefYon = Math.atan2(G.d.gokce.y - k.y, G.d.gokce.x - k.x);   // bebek: Gökçe'ye bakar
    if (oy.faz === 'git') {
      if (Math.hypot(oy.x - k.x, oy.y - k.y) <= 55) { oy.faz = 'soylen'; return; }
      if (!s.yol && !s.birak) {
        if (!yolKur(oy.x, oy.y)) { oy.faz = 'soylen'; return; }
      }
      if (s.birak) {
        s.birak = false; oy.yolT++;
        if (oy.yolT > 2 || !yolKur(oy.x, oy.y)) { oy.faz = 'soylen'; return; }
      }
      if (yolTakip(dt, 150 * bz(), 8)) { oy.faz = 'soylen'; s.yol = null; }
    } else {
      k.hareket = false; s.stuckT = 0;
      don(hedefYon, 6, dt);
      if (k.kim === 'beren') {   // oyuncağın başına oturur; yanına basan çocuğa sarılır
        k.oturuyor = true;
        var od = G.d && G.d.oyuncu;
        if (od && !od.saklandi && !od.korunan && !(od.gorunmez > 0) && Math.hypot(od.x - k.x, od.y - k.y) < 42 && !engel(k.x, k.y, od.x, od.y)) { k.oturuyor = false; yakala(); return; }
      }
      oy.sozT -= dt;
      if (oy.sozT <= 0) { oy.sozT = 2.4; say(rnd(Z(oy.konu && Z(oy.konu) ? oy.konu : 'gokce')), 2.2, true); if (k.kim === 'beren') bebekSes(Math.random() < 0.4 ? 'kikir' : 'babble'); }
    }
  }

  // ---------- okul zili (EK-8, yalnız zil süresi tanımlı bölümlerde) ----------
  function zilGuncelle(dt, d) {
    var b = null, h = H();
    try { b = G.bolumBilgi ? G.bolumBilgi() : null; } catch (e) { b = null; }
    if (!b || !b.zil || !h.zilYeri) { s.zil = null; k.zil = false; return; }
    if (d.zilT == null) d.zilT = b.zil * 0.7;
    d.zilT -= dt;
    if (s.zil) {
      s.zil.kalan -= dt;
      if (s.zil.kalan <= 0) { s.zil = null; s.faz = 'git'; s.yol = null; k.zil = false; }
    }
    if (d.zilT <= 0) {
      d.zilT = b.zil;
      olay('zil', {});
      if (k.durum !== 'yorgun' && k.durum !== 'yakaladi' && k.durum !== 'kovalama') {
        // Zil şüpheyi de bastırır: önceden şüphedeki nöbetçi zili duymazdan geliyordu ama "fırsat" mesajı çıkıyordu.
        if (k.durum !== 'devriye') devriyeyeDon();
        if (G.mesaj) G.mesaj('Teneffüs zili çaldı! ' + Ad(k.kim) + ' sıraya gidiyor: fırsat!', 3.2);
        s.zil = { kalan: 9.5, hedef: { x: h.zilYeri.x, y: h.zilYeri.y }, vardi: false };
        s.faz = 'git'; s.yol = null; k.zil = true;
        say('Zil çaldı, sıraya!', 3, true);
      }
    }
    k.zil = !!s.zil;
  }

  function devriyeDavran(dt) {
    if (s.zil && s.zil.kalan > 0) {
      var zh = s.zil.hedef;
      if (!s.zil.vardi) {
        if (!s.yol && !yolKur(zh.x, zh.y)) s.zil.vardi = true;
        else if (s.yol && yolTakip(dt, hizD() * 1.35, 5)) { s.zil.vardi = true; s.yol = null; s.bakinTemel = k.yon; }
        if (s.birak) { s.birak = false; s.zil.vardi = true; }
      } else bakin(dt, 3);
      return;
    }
    var P = devriyeListe();
    if (s.idx >= P.length) s.idx = 0;
    var nk = P[s.idx];
    if (s.faz === 'git') {
      if (s.birak) { s.idx = (s.idx + 1) % P.length; s.birak = false; s.yol = null; return; }
      if (!s.yol) {
        if (!yolKur(nk.x, nk.y)) { s.idx = (s.idx + 1) % P.length; return; }
      }
      if (yolTakip(dt, hizD(), 4)) {
        s.faz = 'bak'; s.zaman = nk.bekle != null ? nk.bekle : 1.5; s.bakinTemel = k.yon;
        if (s.zaman < 0.6) s.zaman = 0.6;
      }
    } else {
      bakin(dt, 3);
      s.zaman -= dt;
      if (s.zaman <= 0) { s.idx = (s.idx + 1) % P.length; s.faz = 'git'; s.yol = null; }
    }
  }

  function supheDavran(dt, o, gorunuyor) {
    if (s.faz === 'git') {
      if (s.birak) { s.faz = 'bak'; s.zaman = 2.5; s.bakinTemel = k.yon; s.birak = false; return; }
      if (s.sGorme && gorunuyor && o) {
        s.rpT -= dt;
        if (s.rpT <= 0 || !s.yol) { s.rpT = 0.3; if (!yolKur(o.x, o.y)) { /* görüyorsa doğrudan yürü */ } }
      } else if (!s.yol && s.sHedef) {
        if (!yolKur(s.sHedef.x, s.sHedef.y)) { s.faz = 'bak'; s.zaman = 2.5; s.bakinTemel = k.yon; return; }
      }
      if (!s.yol && s.sGorme && gorunuyor && o && !engel(k.x, k.y, o.x, o.y)) {
        adimAt(dt, HIZ.suphe * bz(), o.x, o.y, 6);
      } else if (yolTakip(dt, HIZ.suphe * bz(), 6)) {
        s.faz = 'bak'; s.zaman = 2.0 + Math.random() * 1.0; s.bakinTemel = k.yon;
      }
    } else {
      bakin(dt, 4);
      s.zaman -= dt;
      if (s.zaman <= 0) {
        if (k.uyari < 0.2 && s.sGorme) devriyeyeDon();
        else aramaBasla(s.sGorme ? 4.5 : 3.5);
      }
    }
  }

  function aramaDavran(dt) {
    s.aramaT -= dt;
    if (s.aramaT <= 0) {
      olay('komsu_vazgecti', {});
      devriyeyeDon();
      say(rnd(Z('vazgec')), 2.5, true);
      return;
    }
    if (s.faz === 'bak') {
      bakin(dt, 3.5);
      s.zaman -= dt;
      if (s.zaman <= 0) {
        var ok = false;
        for (var t = 0; t < 6 && !ok; t++) {
          var a = Math.random() * Math.PI * 2, r = 90 + Math.random() * 140;
          ok = yolKur(k.x + Math.cos(a) * r, k.y + Math.sin(a) * r) && s.yol && s.yol.length <= 10;
        }
        if (ok) s.faz = 'git'; else { s.zaman = 1.0; s.yol = null; }
      }
    } else {
      if (s.birak || yolTakip(dt, HIZ.arama * bz(), 5)) {
        s.birak = false; s.yol = null;
        s.faz = 'bak'; s.zaman = 1.2 + Math.random() * 0.8; s.bakinTemel = k.yon;
      }
    }
  }

  function mobilyaMerkez(e) {
    if (!e) return null;
    if (e.x != null && e.tx == null) return { x: e.x, y: e.y, yar: 24 };
    return { x: (e.tx + (e.w || 1) / 2) * T, y: (e.ty + (e.h || 1) / 2) * T, yar: Math.max(e.w || 1, e.h || 1) * T / 2 };
  }

  function kovalamaDavran(dt, d, o, gor, dist) {
    k.uyari = 1;
    var HZ = hizK();
    // oyuncu gözümün önünde saklandı mı
    if (o && o.saklandi && !s.oncekiSaklandi && s.oncekiGordu && !s.saklanHedef) {
      s.saklanHedef = o.saklandi; s.yol = null; s.rpT = 0;
    }
    if (s.saklanHedef) {
      if (o && !o.saklandi) { s.saklanHedef = null; }
      else {
        var m = mobilyaMerkez(s.saklanHedef);
        if (m) {
          var dm = Math.hypot(m.x - k.x, m.y - k.y);
          if (dm < m.yar + 36) { yakala(); return; }
          s.rpT -= dt;
          if (!s.yol || s.rpT <= 0) { s.rpT = 0.5; if (!yolKur(m.x, m.y) && dogrudanTemiz(m.x, m.y)) yolSet([{ x: m.x, y: m.y }]); }
          if (s.birak) { s.birak = false; yolSet([{ x: m.x, y: m.y }]); }
          if (yolTakip(dt, HZ, 10)) { yakala(); return; }
          s.oncekiGordu = false;
          return;
        }
        s.saklanHedef = null;
      }
    }

    if (s.sasirT > 0) {
      s.sasirT -= dt;
      k.hareket = false;
      if (o && !(o.gorunmez > 0)) {
        don(Math.atan2(o.y - k.y, o.x - k.x), 8, dt);
        s.sonGorulen = { x: o.x, y: o.y };
      }
      return;
    }

    var temas = o && !o.saklandi && !o.korunan && !(o.gorunmez > 0) && dist < 34 && !engel(k.x, k.y, o.x, o.y);
    if (temas) { yakala(); return; }

    var goruyor = gor && o;
    s.oncekiGordu = !!goruyor;
    if (goruyor) {
      s.kayipT = 0; s.kayipHedefVar = false;
      s.sonGorulen = { x: o.x, y: o.y };
      if (Math.random() < dt * 0.15) say(rnd(Z('kovala')), 1.6);
      if (dist < 120 && dogrudanTemiz(o.x, o.y)) {
        s.yol = null;
        adimAt(dt, HZ, o.x, o.y, 12);
      } else if (dogrudanTemiz(o.x, o.y)) {
        s.yol = null;
        adimAt(dt, HZ, o.x, o.y, 12);
      } else {
        s.rpT -= dt;
        if (s.rpT <= 0 || !s.yol || s.birak) {
          s.rpT = 0.3; s.birak = false;
          if (!yolHesapla(o.x, o.y)) yolKur(o.x, o.y);
        }
        if (yolTakip(dt, HZ, 12)) s.yol = null;
      }
      return;
    }

    // görüş kaybı
    s.kayipT += dt;
    if (!s.kayipHedefVar) {
      if (s.kayipT < 0.25 && s.sonGorulen) {
        adimAt(dt, HZ, s.sonGorulen.x, s.sonGorulen.y, 12);
        return;
      }
      var sg = s.sonGorulen || { x: k.x, y: k.y };
      var hx = sg.x + s.sonYon.x * 70, hy = sg.y + s.sonYon.y * 70;
      if (engel(sg.x, sg.y, hx, hy)) { hx = sg.x; hy = sg.y; }
      s.kayipHedefVar = true;
      s.kayipHedef = { x: hx, y: hy };
      if (!yolKur(hx, hy)) {
        if (!yolKur(sg.x, sg.y)) { aramaBasla(5.5); return; }
      }
    }
    if (s.birak) { s.birak = false; aramaBasla(5.5); return; }
    if (yolTakip(dt, HZ, 10)) {
      aramaBasla(5.5);
    }
  }

  // ---------- Bölüm 6 (bebek) uçları: bebek.js çağırır ----------
  function ispiyon(x, y) {   // Teyze/Enişte çocuğu gördü: Beren o yöne yönelir
    var d = G.d;
    if (!k || !s || !d || d.komsu !== k || k.kim !== 'beren') return false;
    if (k.pasif || s.tasi || s.pg || k.durum === 'yakaladi' || k.durum === 'kovalama' || k.durum === 'yorgun') return false;
    s.oy = null; k.oyalaniyor = false; k.oturuyor = false;
    supheBasla(x, y, false, false);
    k.uyari = Math.max(k.uyari, 0.42);
    say(rnd(Z('ispiyon')), 2.2, true); bebekSes('gordu');
    return true;
  }
  function tasiBasla(g) {   // Gökçe Beren'i kucağına aldı
    if (!k || !s || k.durum === 'yakaladi' || k.pasif || !g) return false;
    s.oy = null; s.pg = null; s.yol = null; k.oyalaniyor = false; k.oturuyor = false;
    k.durum = 'suphe'; k.uyari = 0; s.tasi = { g: g }; k.kucakta = true; k.kucakY = 0.55;
    return true;
  }
  function tasiBirak() { if (s) s.tasi = null; if (k) { k.kucakta = false; k.oturuyor = false; } }
  function uyut(d, sure, sessiz) {   // pusete yatır: kestirme sure sn
    if (!k || !s || k.durum === 'yakaladi') return false;
    var yl = yatakYanlari(), hd = yl[0], h = H();
    for (var i = 0; i < yl.length; i++) if (!(h.kati && h.kati(Math.floor(yl[i].x / T), Math.floor(yl[i].y / T)))) { hd = yl[i]; break; }
    s.yatakHedef = hd || { x: k.x, y: k.y };
    tasiBirak();
    kestirBasla(d, sure, sessiz);
    return true;
  }
  function oyalaIptal(konu) { if (s && s.oy && (!konu || s.oy.konu === konu)) oyalanBitir(); }
  function uyandir(d) {   // telsiz/ses: pusette uyuyan Beren uyanır
    if (!k || !s || !k.pasif || !d.uyuyan || d.uyanan) return false;
    kestirBitir(d);
    return true;
  }
  G.komsu = { init: init, guncelle: guncelle, dikkatDagit: dikkatDagit, pesindenGit: pesindenGit, tekKisi: tekKisi, ispiyon: ispiyon, tasiBasla: tasiBasla, tasiBirak: tasiBirak, uyut: uyut, uyandir: uyandir, oyalaIptal: oyalaIptal, _durum: function () { return s; } }; // _durum: yalnız test için
})();
