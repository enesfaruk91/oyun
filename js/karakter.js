/* Ana karakter seçimi: Ogeday (varsayılan), Gökçe, Giray. Tek eşleme katmanı.
   Oyundaki ROLLER sabit kalır (oyuncu, yardimci = eski "Gökçe" rolü, takipci = eski "Giray" rolü);
   seçim yalnız görünümü ve görünen adları değiş-tokuş eder. Mantık kopyalanmaz. */
window.G = window.G || {};
(function () {
  var ANAHTAR = 'abk_karakter', KIMLER = ['ogeday', 'gokce', 'giray'];
  var AD = { ogeday: 'Ogeday', gokce: 'Gökçe', giray: 'Giray', atilay: 'Atılay' };
  var secili = 'ogeday', onbellek = {};
  var EK = { acc: ['ı', 'yi'], dat: ['a', 'ye'], gen: ['ın', 'nin'], loc: ['da', 'de'], abl: ['dan', 'den'] };
  function ekTur(e) {
    if (/^(yi|yı|ı|i)$/.test(e)) return 'acc'; if (/^(ye|ya|a|e)$/.test(e)) return 'dat';
    if (/^(nin|nın|ın|in)$/.test(e)) return 'gen'; if (/^(de|da)$/.test(e)) return 'loc'; return 'abl';
  }
  function ekle(kim, ek) { return AD[kim] + (ek ? "'" + EK[ekTur(ek)][kim === 'gokce' ? 1 : 0] : ''); }
  // rol -> görünen karakter
  function karakterOf(rol) {
    if (rol === 'oyuncu') return secili;
    if (rol === 'yardimci') return secili === 'gokce' ? 'ogeday' : 'gokce';
    if (rol === 'takipci') return secili === 'giray' ? 'ogeday' : 'giray';
    return rol;
  }
  // Metindeki kanonik adları (Ogeday=oyuncu, Gökçe=yardımcı, Giray=takipçi) seçime göre değiştirir.
  function metin(s) {
    if (secili === 'ogeday' || typeof s !== 'string' || !s) return s;
    var o = onbellek[s]; if (o !== undefined) return o;
    var yeni = s.replace(/(Ogeday|Gökçe|Giray)(?:'(yi|yı|ı|i|ye|ya|a|e|nin|nın|ın|in|de|da|den|dan))?/g, function (m, ad, ek) {
      var kim = ad === 'Ogeday' ? 'oyuncu' : ad === 'Gökçe' ? 'yardimci' : 'takipci';
      return ekle(karakterOf(kim), ek);
    });
    if (secili === 'gokce') yeni = yeni.replace(/küçük hanım/g, 'küçük bey').replace(/Küçük hanım/g, 'Küçük bey').replace(/Bu kız da/g, 'Bu çocuk da');
    if (Object.keys(onbellek).length > 600) onbellek = {};
    onbellek[s] = yeni; return yeni;
  }
  function kaydet() { try { localStorage.setItem(ANAHTAR, secili); } catch (e) { } }
  function yukle() { try { var v = localStorage.getItem(ANAHTAR); if (KIMLER.indexOf(v) >= 0) secili = v; } catch (e) { }
    try { var q = /[?&]karakter=(\w+)/.exec(location.search); if (q && KIMLER.indexOf(q[1]) >= 0) secili = q[1]; } catch (e2) { }   // test/ekran görüntüsü için
    onbellek = {};
  }
  function sec(k) { if (KIMLER.indexOf(k) < 0) return; secili = k; onbellek = {}; kaydet(); }

  // Menü için yuvarlak kafa portresi (prosedürel)
  var BOYA = {
    ogeday: { bg: '#2fa59c', skin: '#ffd2b0', hair: '#5b3822', iris: '#3a2616' },
    gokce: { bg: '#b48ae8', skin: '#ffd6b8', hair: '#6a4030', iris: '#5a2f6a' },
    giray: { bg: '#86c96a', skin: '#ffd8bc', hair: '#cf7430', iris: '#2f6a2f' }
  };
  function portre(c, kim, x, y, R) {
    var P = BOYA[kim] || BOYA.ogeday, k = R / 30;
    c.save(); c.translate(x, y); c.scale(k, k);
    c.beginPath(); c.arc(0, 0, 30, 0, 7); c.clip();
    c.fillStyle = P.bg; c.fillRect(-30, -30, 60, 60);
    function el(px, py, rx, ry, col) { c.fillStyle = col; c.beginPath(); c.ellipse(px, py, rx, ry, 0, 0, 7); c.fill(); }
    if (kim === 'gokce') { el(-19, 2, 8, 13, P.hair); el(19, 2, 8, 13, P.hair); }
    el(0, 34, 22, 14, kim === 'ogeday' ? '#f47c3c' : kim === 'giray' ? '#86c96a' : '#9b6fe0');   // omuz
    if (kim === 'giray') { for (var i = 0; i < 9; i++) { var a = Math.PI + i / 8 * Math.PI; el(Math.cos(a) * 15, -4 + Math.sin(a) * 15, 7.5, 7.5, P.hair); } el(0, -16, 9, 7, P.hair); }
    el(0, 3, 17, 19, P.skin);
    if (kim === 'ogeday') { c.fillStyle = P.hair; c.beginPath(); c.ellipse(0, -9, 18, 12, 0, Math.PI, 0); c.fill(); el(-8, -12, 9, 6, P.hair); el(9, -13, 9, 6, P.hair); }
    if (kim === 'gokce') { c.fillStyle = P.hair; c.beginPath(); c.ellipse(0, -9, 18.5, 12, 0, Math.PI, 0); c.fill(); el(-17, -4, 4, 6, P.hair); el(17, -4, 4, 6, P.hair); el(-20, -7, 5, 4, '#ff7aa8'); el(20, -7, 5, 4, '#ff7aa8'); }
    if (kim === 'giray') { c.fillStyle = P.hair; c.beginPath(); c.ellipse(0, -8, 17, 9, 0, Math.PI, 0); c.fill(); }
    [-7, 7].forEach(function (ex) { el(ex, 2, 3.6, 4.2, '#fff'); el(ex, 3, 2.4, 3, P.iris); el(ex + 0.8, 1.8, 0.9, 0.9, '#fff'); });
    if (kim === 'gokce') { c.strokeStyle = '#3a2418'; c.lineWidth = 1.2; [-1, 1].forEach(function (s) { c.beginPath(); c.moveTo(s * 7 + s * 3, 0); c.lineTo(s * 7 + s * 5.5, -1.8); c.stroke(); }); }
    el(-11, 9, 3.4, 2.2, 'rgba(255,120,130,0.45)'); el(11, 9, 3.4, 2.2, 'rgba(255,120,130,0.45)');
    c.strokeStyle = '#a0504a'; c.lineWidth = 1.6; c.lineCap = 'round'; c.beginPath(); c.arc(0, 8, 5, 0.25, Math.PI - 0.25); c.stroke();
    c.restore();
  }

  G.karakter = {
    kimler: KIMLER, ad: function (k) { return AD[k]; },
    get secili() { return secili; },
    sec: sec, yukle: yukle, metin: metin, portre: portre,
    gorunum: karakterOf,                  // 'oyuncu'|'yardimci'|'takipci' -> rig türü
    adRol: function (rol) { return AD[karakterOf(rol)]; }
  };
  yukle();
})();
