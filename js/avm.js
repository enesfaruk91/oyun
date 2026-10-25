window.G = window.G || {};
G.avm = (function () {
  function init(d) { d.oturanlar = (G.harita.oturanlar || []).map(function (e) { return Object.assign({}, e); }); }
  function guncelle(dt, d) {
    (d.oturanlar || []).forEach(function (e) { e.hareket = false; e.oturuyor = true; e.yemek = true; });
  }
  return { init: init, guncelle: guncelle };
})();
