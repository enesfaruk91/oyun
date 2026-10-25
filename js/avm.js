window.G = window.G || {};
G.avm = (function () {
  var T = 48;
  var rota = [];

  function merkez(tx, ty) { return { x: (tx + 0.5) * T, y: (ty + 0.5) * T }; }
  function nokta(tx, ty) { var p = merkez(tx, ty); return p; }
  function oyuncularKur(d) {
    var giris = [
      ['cocuk_kirmizi', 8, 6, 1.1, [[8,6],[10,6],[10,8],[8,8]]],
      ['cocuk_mavi', 11, 7, 1.0, [[11,7],[10,8],[8,8],[9,6]]],
      ['cocuk_yesil', 7, 8, 0.95, [[7,8],[8,6],[10,7],[9,8]]],
      ['cocuk_kirmizi', 9, 8, 1.0, [[9,8],[10,6],[8,6],[7,8]]],
      ['cocuk_mavi', 10, 9, 0.9, [[10,9],[8,8],[9,6],[11,7]]],
      ['ziyaretci_kadin', 18, 14, 1.05, [[18,14],[22,14],[25,14],[22,15]]],
      ['ziyaretci_erkek', 30, 14, 1.0, [[30,14],[26,14],[22,15],[18,14]]]
    ];
    d.kalabalik = [];
    rota = [];
    giris.forEach(function (v, i) {
      var p = nokta(v[1], v[2]);
      d.kalabalik.push({ kim: v[0], x: p.x, y: p.y, r: 9, yon: (i % 2) ? Math.PI : 0,
        hareket: false, adimFaz: i * 0.7, olcek: v[3], oyunPoz: i < 5 ? (i % 2 ? 'top' : 'zipla') : null });
      rota.push({ adim: 0, bekle: 0.25 + (i % 4) * 0.25, hiz: i < 5 ? 38 + (i % 3) * 5 : 27 + (i % 2) * 4,
        duraklar: v[4].map(function (q) { return nokta(q[0], q[1]); }) });
    });
  }
  function init(d) {
    d.oturanlar = (G.harita.oturanlar || []).map(function (e) { return Object.assign({}, e); });
    if (G.harita.bolum === 7) {
      var p = nokta(8, 7);
      G.harita.gokceMasa = { x: p.x, y: p.y, yon: -Math.PI / 2 };
      if (d.gokce) { d.gokce.x = p.x; d.gokce.y = p.y; d.gokce.hedef = { x: p.x, y: p.y }; d.gokce.durum = 'oynuyor'; d.gokce.oyunPoz = 'zipla'; }
      oyuncularKur(d);
    } else {
      d.kalabalik = [];
      rota = [];
    }
  }
  function acik(x, y) {
    var h = G.harita, tx = Math.floor(x / T), ty = Math.floor(y / T);
    return tx >= 1 && ty >= 1 && tx < h.W - 1 && ty < h.H - 1 && !(h.kati && h.kati(tx, ty));
  }
  function guncelle(dt, d) {
    (d.oturanlar || []).forEach(function (e) { e.hareket = false; e.oturuyor = true; e.yemek = true; });
    if (G.harita.bolum !== 7 || !d.kalabalik) return;
    d.kalabalik.forEach(function (e, i) {
      var r = rota[i]; if (!r || !r.duraklar.length) return;
      if (r.bekle > 0) { r.bekle -= dt; e.hareket = false; return; }
      var hedef = r.duraklar[r.adim % r.duraklar.length], dx = hedef.x - e.x, dy = hedef.y - e.y, m = Math.hypot(dx, dy);
      if (m < 3) { r.adim++; r.bekle = 0.25 + ((i + r.adim) % 4) * 0.22; e.hareket = false; return; }
      var step = Math.min(m, r.hiz * dt), nx = e.x + dx / m * step, ny = e.y + dy / m * step;
      if (!acik(nx, ny)) { r.adim++; e.hareket = false; r.bekle = 0.3; return; }
      e.x = nx; e.y = ny; e.yon = Math.atan2(dy, dx); e.hareket = true; e.adimFaz += dt * 9;
    });
  }
  return { init: init, guncelle: guncelle };
})();
