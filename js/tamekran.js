/* Tam ekran "uygulama" modu: aynı dosyalar hem bilgisayar tarayıcısında hem telefonda.
   Tarayıcılar tam ekranı yalnız kullanıcı dokunuşu/tıklamasıyla açar; bu yüzden gir()
   menüdeki "Başla" ve HUD'daki tam ekran düğmesinden çağrılır. cik() oyunu kapatmaz,
   yalnız tam ekrandan (F11 benzeri) çıkarır. */
window.G = window.G || {};
G.tamEkran = (function () {
  'use strict';
  var kok = document.documentElement;
  var istek = kok.requestFullscreen || kok.webkitRequestFullscreen || kok.msRequestFullscreen;
  var mobil = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent)) || /[?&]dokunmatik=1/.test(location.search);
  var cikti = false;      // kullanıcı tam ekrandan çıktıysa otomatik (Devam) girişler tekrar zorlamaz
  var kayit = [];         // test: gir() çağrıları {olay: window.event türü}
  // Ana ekrana eklenmiş uygulama olarak açıldıysa zaten tam ekrandır.
  function uygulamaModu() {
    try { return matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch (h) { return false; }
  }
  function acikMi() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) || uygulamaModu();
  }
  function destek() { return !!istek && !uygulamaModu(); }
  function yonKilitle() {
    if (!mobil) return;
    try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function () { }); } catch (h) { }
  }
  function gir() {
    cikti = false;
    try { kayit.push({ olay: window.event ? window.event.type : null, t: Date.now() }); if (kayit.length > 20) kayit.shift(); } catch (h) { }
    if (/[?&]tamlog=1/.test(location.search)) console.log('TAMEKRAN gir olay=' + (window.event ? window.event.type : 'YOK'));
    if (acikMi() || !istek) { yonKilitle(); return; }
    try {
      var p = istek.call(kok, { navigationUI: 'hide' });
      if (p && p.then) p.then(yonKilitle).catch(function () { });
      else yonKilitle();
    } catch (h) { }
  }
  function otoGir() { if (!cikti) gir(); }
  // Dikey ekranda dokununca: tam ekran + yatay kilit. Telefonun otomatik döndürmesi kapalı olsa da
  // Android Chrome tam ekranda kilidi uygular. Başarısızsa G.yatayHata ile ipucu gösterilir.
  function yatay() {
    cikti = false; G.yatayHata = false;
    function kilit() {
      try {
        if (!(screen.orientation && screen.orientation.lock)) { G.yatayHata = true; return; }
        screen.orientation.lock('landscape').catch(function () { G.yatayHata = true; });
      } catch (h) { G.yatayHata = true; }
    }
    var tam = !!(document.fullscreenElement || document.webkitFullscreenElement);
    if (tam || !istek || uygulamaModu()) { kilit(); return; }
    try {
      var p = istek.call(kok, { navigationUI: 'hide' });
      if (p && p.then) p.then(kilit).catch(function () { G.yatayHata = true; }); else kilit();
    } catch (h) { G.yatayHata = true; }
  }
  function cik() {
    cikti = true;
    if (!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement)) return;
    var f = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    try { var p = f.call(document); if (p && p.catch) p.catch(function () { }); } catch (h) { }
  }
  function degistir() { if (acikMi()) cik(); else gir(); }
  function bildir() { if (!acikMi()) cikti = true; if (G.olay) G.olay('tamekran', { acik: acikMi() }); }
  document.addEventListener('fullscreenchange', bildir);
  document.addEventListener('webkitfullscreenchange', bildir);
  // F11 tuşu tarayıcının kendi tam ekranıdır; F tuşunu oyunda kullanmıyoruz (F = fırlat), o yüzden kısayol yok.
  return { gir: gir, otoGir: otoGir, yatay: yatay, kayit: kayit, cik: cik, degistir: degistir, acikMi: acikMi, destek: destek, mobil: mobil, uygulamaModu: uygulamaModu };
})();
