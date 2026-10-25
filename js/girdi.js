window.G = window.G || {};
(function () {
  var basili = {};
  var bekleyen = {};
  var girdi = {
    x: 0, y: 0, kos: false, egil: false, etkiBasili: false, dokunEtki: false,
    dokun: { x: 0, y: 0, aktif: false }, dokunDunya: false,
    bas: function (ad) { bekleyen[ad] = true; },
    al: function (ad) { if (bekleyen[ad]) { bekleyen[ad] = false; return true; } return false; },
    temizle: function () { bekleyen = {}; },
    guncelle: function () {
      var kx = (basili.ArrowRight || basili.KeyD ? 1 : 0) - (basili.ArrowLeft || basili.KeyA ? 1 : 0);
      var ky = (basili.ArrowDown || basili.KeyS ? 1 : 0) - (basili.ArrowUp || basili.KeyW ? 1 : 0);
      if (kx && ky) { kx *= 0.7071; ky *= 0.7071; }
      if (girdi.dokun.aktif) { kx = girdi.dokun.x; ky = girdi.dokun.y; }
      // Joystick de kameraya göre çevrilir; yalnız bot/test dünya yönü yazarsa (dokunDunya) çevrilmez.
      if (G.hareket3d && !(girdi.dokun.aktif && girdi.dokunDunya)) { var v = G.hareket3d(kx, ky); kx = v.x; ky = v.y; }
      girdi.x = kx; girdi.y = ky;
      girdi.etkiBasili = !!(basili.KeyE || basili.Space || girdi.dokunEtki);
      girdi.kos = !!(basili.ShiftLeft || basili.ShiftRight || girdi.dokunKos);
      girdi.egil = !!(basili.ControlLeft || basili.ControlRight || basili.KeyC || girdi.dokunEgil);
    }
  };
  var tekSefer = {
    KeyE: 'etkilesim', Space: 'etkilesim', KeyF: 'firlat', KeyQ: 'firlat', KeyG: 'gokce',
    KeyM: 'sustur', KeyP: 'duraklat', Escape: 'duraklat', Enter: 'onay', NumpadEnter: 'onay'
  };
  window.addEventListener('keydown', function (e) {
    if (e.code.indexOf('Arrow') === 0 || e.code === 'Space') e.preventDefault();
    if (!basili[e.code] && tekSefer[e.code]) {
      girdi.bas(tekSefer[e.code]);
      if (e.code === 'Space') girdi.bas('onay');
    }
    basili[e.code] = true;
    if (G.ses && G.ses.ac) G.ses.ac();
    // Tam ekran yalnız olay işleyicisinin İÇİNDE istenebilir (kullanıcı hareketi).
    if ((e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space') && G.tamEkran && G.d) {
      if (G.d.mod === 'menu' && !(G.ayarlar && G.ayarlar.acik)) G.tamEkran.gir();
      else if (G.d.mod === 'yakalandi') G.tamEkran.otoGir();
    }
  });
  window.addEventListener('keyup', function (e) { basili[e.code] = false; });
  window.addEventListener('blur', function () { basili = {}; });
  G.girdi = girdi;
})();
