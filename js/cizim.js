window.G = window.G || {};
(function () {
  'use strict';
  var T = 48;
  var OUT = '#3a2a22';          // genel koyu dış hat
  var PI = Math.PI;

  // ---------- yardımcılar ----------
  function hs(x, y, k) {
    var n = Math.sin(x * 127.1 + y * 311.7 + (k || 0) * 74.7) * 43758.5453;
    return n - Math.floor(n);
  }
  function rr(c, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
  }
  function fs(c, fill, stroke, lw) {
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.lineWidth = lw || 2; c.strokeStyle = stroke; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
  }
  function box(c, x, y, w, h, fill, stroke, lw, r) { rr(c, x, y, w, h, r == null ? 3 : r); fs(c, fill, stroke === undefined ? OUT : stroke, lw || 2); }
  function ell(c, x, y, rx, ry, fill, stroke, lw, rot) {
    c.beginPath(); c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot || 0, 0, PI * 2);
    fs(c, fill, stroke, lw);
  }
  function line(c, x1, y1, x2, y2, col, lw) {
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2);
    c.strokeStyle = col; c.lineWidth = lw || 1; c.lineCap = 'round'; c.stroke();
  }
  function mk(w, h) {
    var c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c;
  }
  function metin(c, s, x, y, font, fill, stroke, lw) {
    c.font = font; c.textAlign = 'center'; c.textBaseline = 'middle';
    if (stroke) { c.lineWidth = lw || 4; c.strokeStyle = stroke; c.lineJoin = 'round'; c.strokeText(s, x, y); }
    c.fillStyle = fill; c.fillText(s, x, y);
  }

  // ---------- durum ----------
  var S = {
    canvas: null, stat: null, mask: null, hazir: false, hW: 0, hH: 0,
    bx0: 0, by0: 0, bx1: -1, by1: -1, karanlik: null, t: 0,
    kapiAnahtar: {}
  };

  function H() { return G.harita || null; }
  function zemin(tx, ty) {
    var h = H(); if (!h || !h.zemin) return 'cim';
    try { return h.zemin(tx, ty) || 'dis'; } catch (e) { return 'dis'; }
  }
  function katiMi(tx, ty) {
    var h = H(); if (!h) return false;
    try {
      if (h.kati) return !!h.kati(tx, ty);
      if (h.duvarMi) return !!h.duvarMi(tx, ty);
    } catch (e) {}
    return false;
  }
  function duvarZ(z) { return z === 'duvar'; }

  // ---------- ZEMİN DOKULARI ----------
  function zeminCiz(c, z, tx, ty) {
    var x = tx * T, y = ty * T, i, r;
    switch (z) {
      case 'cim':
        c.fillStyle = ((tx + ty) & 1) ? '#76c957' : '#6cc04d'; c.fillRect(x, y, T, T);
        c.fillStyle = 'rgba(40,120,40,0.12)';
        for (i = 0; i < 5; i++) { c.fillRect(x + hs(tx, ty, i) * 44, y + hs(ty, tx, i + 9) * 44, 4, 3); }
        c.lineCap = 'round';
        for (i = 0; i < 5; i++) {
          var gx = x + 4 + hs(tx, ty, i + 20) * 40, gy = y + 8 + hs(tx, ty, i + 30) * 36;
          line(c, gx, gy, gx - 3, gy - 6, '#4aa13a', 2); line(c, gx, gy, gx + 1, gy - 7, '#3f8f33', 2); line(c, gx, gy, gx + 4, gy - 5, '#4aa13a', 2);
        }
        r = hs(tx, ty, 77);
        if (r > 0.86) {
          var fx = x + 8 + hs(tx, ty, 5) * 32, fy = y + 8 + hs(tx, ty, 6) * 32;
          var fc = r > 0.95 ? '#ffe14d' : (r > 0.9 ? '#ffffff' : '#ff9ed0');
          for (i = 0; i < 5; i++) ell(c, fx + Math.cos(i * 1.256) * 2.6, fy + Math.sin(i * 1.256) * 2.6, 2.2, 2.2, fc, null);
          ell(c, fx, fy, 1.8, 1.8, '#f3a31c', null);
        }
        break;
      case 'yol':
        c.fillStyle = '#6a6e78'; c.fillRect(x, y, T, T);
        c.fillStyle = 'rgba(255,255,255,0.05)';
        for (i = 0; i < 9; i++) c.fillRect(x + hs(tx, ty, i) * 46, y + hs(ty, tx, i + 3) * 46, 2, 2);
        c.fillStyle = 'rgba(0,0,0,0.08)';
        for (i = 0; i < 6; i++) c.fillRect(x + hs(tx, ty, i + 40) * 44, y + hs(ty, tx, i + 50) * 44, 3, 2);
        if (zemin(tx, ty - 1) === 'yol' && zemin(tx, ty + 1) === 'yol' && (tx & 1) === 0) {
          box(c, x + 6, y + 21, 36, 6, '#ffe45c', null, 0, 3);
        }
        break;
      case 'kaldirim':
        c.fillStyle = '#c9c7c0'; c.fillRect(x, y, T, T);
        for (var a = 0; a < 2; a++) for (var b = 0; b < 2; b++) {
          var sh = hs(tx * 2 + a, ty * 2 + b, 3);
          c.fillStyle = sh > 0.5 ? '#d8d6cf' : '#cfcdc5'; c.fillRect(x + a * 24 + 1, y + b * 24 + 1, 22, 22);
        }
        c.strokeStyle = '#a3a199'; c.lineWidth = 2;
        c.strokeRect(x + 1, y + 1, 23, 23); c.strokeRect(x + 24, y + 1, 23, 23); c.strokeRect(x + 1, y + 24, 23, 23); c.strokeRect(x + 24, y + 24, 23, 23);
        break;
      case 'eski_parke':
      case 'parke':
        for (i = 0; i < 4; i++) {
          var tone = hs(tx, ty * 4 + i, 1);
          c.fillStyle = tone > 0.66 ? '#c58b52' : (tone > 0.33 ? '#cd9560' : '#bd8049');
          c.fillRect(x, y + i * 12, T, 12);
          var j = Math.floor(hs(tx, ty * 4 + i, 8) * 36) + 6;
          c.fillStyle = '#8c5a30'; c.fillRect(x + j, y + i * 12 + 1, 2, 11);
          c.fillStyle = 'rgba(255,230,180,0.18)'; c.fillRect(x, y + i * 12 + 1, T, 2);
          c.fillStyle = 'rgba(80,40,10,0.14)'; c.fillRect(x + hs(tx, ty, i) * 30, y + i * 12 + 6, 14, 1);
        }
        c.fillStyle = '#8c5a30';
        for (i = 0; i < 4; i++) c.fillRect(x, y + i * 12, T, 1.5);
        if (z === 'eski_parke') {
          c.fillStyle = 'rgba(76,45,25,0.23)'; c.fillRect(x, y, T, T);
          line(c, x + 6, y + 28, x + 32, y + 28, 'rgba(244,212,164,0.25)', 1);
        }
        break;
      case 'fayans':
        for (a = 0; a < 2; a++) for (b = 0; b < 2; b++) {
          c.fillStyle = ((a + b + tx + ty) & 1) ? '#e6f4f8' : '#cfe9f1';
          c.fillRect(x + a * 24, y + b * 24, 24, 24);
          c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(x + a * 24 + 2, y + b * 24 + 2, 8, 3);
        }
        c.strokeStyle = '#97bccb'; c.lineWidth = 1.5;
        c.strokeRect(x + 0.5, y + 0.5, 24, 24); c.strokeRect(x + 24.5, y + 0.5, 23, 24); c.strokeRect(x + 0.5, y + 24.5, 24, 23); c.strokeRect(x + 24.5, y + 24.5, 23, 23);
        break;
      case 'kilim':
      case 'hali':
        c.fillStyle = '#b8434a'; c.fillRect(x, y, T, T);
        c.fillStyle = '#a53840'; c.fillRect(x + 3, y + 3, T - 6, T - 6);
        c.strokeStyle = '#f2c14e'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(x + 24, y + 5); c.lineTo(x + 43, y + 24); c.lineTo(x + 24, y + 43); c.lineTo(x + 5, y + 24); c.closePath(); c.stroke();
        ell(c, x + 24, y + 24, 4, 4, '#f2c14e', null);
        c.fillStyle = '#f7dfa0';
        c.fillRect(x + 2, y + 2, 4, 4); c.fillRect(x + 42, y + 2, 4, 4); c.fillRect(x + 2, y + 42, 4, 4); c.fillRect(x + 42, y + 42, 4, 4);
        if (z === 'kilim') {
          c.fillStyle = 'rgba(68,30,20,0.16)'; c.fillRect(x, y, T, T);
          line(c, x + 4, y + 24, x + 24, y + 4, '#e4c799', 1.5);
          line(c, x + 24, y + 44, x + 44, y + 24, '#e4c799', 1.5);
          for (i = 0; i < 6; i++) line(c, x, y + 3 + i * 8, x + T, y + 3 + i * 8, 'rgba(247,220,177,0.12)', 1);
          ell(c, x + 24, y + 24, 6, 6, '#427e80', OUT, 1);
        }
        break;
      case 'kiler':
        c.fillStyle = '#8d715e'; c.fillRect(x, y, T, T);
        box(c, x + 1, y + 1, T - 2, T - 2, (tx + ty) % 2 ? '#a68b70' : '#997e65', '#6a5143', 1.5, 3);
        line(c, x + 5, y + 5, x + 35, y + 5, '#bfa487', 2);
        for (i = 0; i < 4; i++) ell(c, x + 5 + hs(tx, ty, i) * 38, y + 6 + hs(ty, tx, i) * 36, 1.5, 1, '#78604f', null);
        break;
      case 'saha':
        c.fillStyle = (tx + ty) % 2 ? '#c9744a' : '#c06c44'; c.fillRect(x, y, T, T);
        c.strokeStyle = 'rgba(70,30,15,0.18)'; c.lineWidth = 1.5; c.strokeRect(x + 1, y + 1, T - 2, T - 2);
        c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(x + 3, y + 3, 16, 3);
        break;
      case 'cakil':
        c.fillStyle = '#bcad91'; c.fillRect(x, y, T, T);
        for (i = 0; i < 15; i++) ell(c, x + 3 + hs(tx, ty, i) * 42, y + 3 + hs(ty, tx, i + 21) * 42, 2 + hs(tx, ty, i + 4) * 3, 2, i % 3 ? '#d8cbb3' : '#958775', '#a79981', 0.8, hs(tx, ty, i) * PI);
        break;
      case 'bodrum':
        c.fillStyle = '#5b5a63'; c.fillRect(x, y, T, T);
        var off = (ty & 1) ? 12 : 0;
        c.strokeStyle = '#3a3942'; c.lineWidth = 2;
        for (i = 0; i < 2; i++) {
          var by = y + i * 24;
          c.fillStyle = hs(tx, ty, i) > 0.5 ? '#66656f' : '#585760'; c.fillRect(x, by, T, 24);
          c.beginPath(); c.moveTo(x, by); c.lineTo(x + T, by); c.stroke();
          var vx = x + ((off + i * 20) % 48); c.beginPath(); c.moveTo(vx, by); c.lineTo(vx, by + 24); c.stroke();
        }
        c.fillStyle = 'rgba(255,255,255,0.07)'; c.fillRect(x + 3, y + 3, 14, 3);
        if (hs(tx, ty, 9) > 0.8) { c.strokeStyle = '#33323a'; c.beginPath(); c.moveTo(x + 8, y + 10); c.lineTo(x + 16, y + 18); c.lineTo(x + 14, y + 26); c.stroke(); }
        break;
      case 'toprak':
        c.fillStyle = '#9b7248'; c.fillRect(x, y, T, T);
        for (i = 0; i < 7; i++) ell(c, x + hs(tx, ty, i) * 44 + 2, y + hs(ty, tx, i + 5) * 44 + 2, 3, 2, i & 1 ? '#7d5a36' : '#b58c5c', null);
        break;
      default:
        c.fillStyle = '#5a4a3a'; c.fillRect(x, y, T, T);
    }
  }

  function duvarCiz(c, tx, ty) {
    var x = tx * T, y = ty * T;
    var N = duvarZ(zemin(tx, ty - 1)) || zemin(tx, ty - 1) === 'dis';
    var Sd = duvarZ(zemin(tx, ty + 1)), E = duvarZ(zemin(tx + 1, ty)), W = duvarZ(zemin(tx - 1, ty));
    var Sdis = zemin(tx, ty + 1) === 'dis';
    var strip = !Sd && !Sdis;
    var topH = strip ? 36 : T;
    c.fillStyle = '#e4d3ae'; c.fillRect(x, y, T, topH);
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x, y, T, 4);
    if (strip) {
      c.fillStyle = '#9a7f62'; c.fillRect(x, y + topH, T, T - topH);
      c.fillStyle = '#7d6449'; c.fillRect(x, y + topH, T, 4);
      c.strokeStyle = 'rgba(60,40,25,0.5)'; c.lineWidth = 1;
      c.beginPath();
      c.moveTo(x, y + topH + 6); c.lineTo(x + T, y + topH + 6);
      c.moveTo(x + ((tx & 1) ? 12 : 30), y + topH + 4); c.lineTo(x + ((tx & 1) ? 12 : 30), y + T);
      c.stroke();
      // zemine düşen gölge
      var g = c.createLinearGradient(0, y + T, 0, y + T + 10);
      g.addColorStop(0, 'rgba(30,20,10,0.32)'); g.addColorStop(1, 'rgba(30,20,10,0)');
      c.fillStyle = g; c.fillRect(x, y + T, T, 10);
    }
    c.strokeStyle = OUT; c.lineWidth = 4; c.lineCap = 'butt';
    c.beginPath();
    if (!N) { c.moveTo(x, y + 1.5); c.lineTo(x + T, y + 1.5); }
    if (!W) { c.moveTo(x + 1.5, y); c.lineTo(x + 1.5, y + T); }
    if (!E) { c.moveTo(x + T - 1.5, y); c.lineTo(x + T - 1.5, y + T); }
    if (strip) { c.moveTo(x, y + T - 1.5); c.lineTo(x + T, y + T - 1.5); c.moveTo(x, y + topH); c.lineTo(x + T, y + topH); }
    c.stroke();
  }

  function citCiz(c, tx, ty) {
    var x = tx * T, y = ty * T;
    var n = zemin(tx, ty - 1) === 'cit', s = zemin(tx, ty + 1) === 'cit', e = zemin(tx + 1, ty) === 'cit', w = zemin(tx - 1, ty) === 'cit';
    var yat = e || w, dik = n || s;
    var i, wood = '#e8c07a', woodD = '#b98a46';
    // gölge
    c.fillStyle = 'rgba(20,50,20,0.25)';
    if (yat || !dik) c.fillRect(x + (w ? 0 : 6), y + 30, T - (w ? 0 : 6) - (e ? 0 : 6), 9);
    if (dik) c.fillRect(x + 28, y + (n ? 0 : 6), 8, T - (n ? 0 : 6) - (s ? 0 : 6));
    if (dik && !yat) {
      // yukarıdan bakış: uzun tahta + direkler
      box(c, x + 17, y + (n ? -1 : 4), 14, T + (n ? 1 : -4) + (s ? 1 : -4), wood, OUT, 2.5, 3);
      c.strokeStyle = woodD; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(x + 24, y + 4); c.lineTo(x + 24, y + 44); c.stroke();
      box(c, x + 15, y + 14, 18, 8, '#d1a25a', OUT, 2, 2);
      box(c, x + 15, y + 32, 18, 8, '#d1a25a', OUT, 2, 2);
    } else {
      var x0 = w ? x - 1 : x + 6, x1 = e ? x + T + 1 : x + T - 6;
      // raylar
      box(c, x0, y + 14, x1 - x0, 6, woodD, OUT, 2, 1);
      box(c, x0, y + 25, x1 - x0, 6, woodD, OUT, 2, 1);
      var pk = [8, 24, 40];
      for (i = 0; i < 3; i++) {
        var px = x + pk[i] - 5;
        if (px < x0 - 4 || px + 10 > x1 + 4) continue;
        c.beginPath(); c.moveTo(px, y + 33); c.lineTo(px, y + 12); c.lineTo(px + 5, y + 6); c.lineTo(px + 10, y + 12); c.lineTo(px + 10, y + 33); c.closePath();
        fs(c, wood, OUT, 2.2);
        c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(px + 2, y + 13, 2, 17);
      }
    }
    // sivri direk başı
    if (!yat || !dik) { /* düz çit */ }
  }

  // ---------- STATİK KATMAN ----------
  function statikKur() {
    var h = H(); if (!h || !h.zemin) return false;
    var W = h.W || 44, Hh = h.H || 32;
    S.hW = W; S.hH = Hh;
    S.stat = mk(W * T, Hh * T);
    S.mask = mk(W * T, Hh * T);
    var c = S.stat.getContext('2d'), m = S.mask.getContext('2d');
    var kapiSet = {}, i, tx, ty;
    (h.kapilar || []).forEach(function (k) { kapiSet[k.tx + ',' + k.ty] = k; });
    S.bx0 = 1e9; S.by0 = 1e9; S.bx1 = -1; S.by1 = -1;
    var zz = [];
    for (ty = 0; ty < Hh; ty++) { zz[ty] = []; for (tx = 0; tx < W; tx++) zz[ty][tx] = zemin(tx, ty); }
    function zg(tx, ty) { return (zz[ty] && zz[ty][tx]) || 'dis'; }
    function zeminSec(tx, ty) {
      var z = zg(tx, ty);
      if (kapiSet[tx + ',' + ty] && (z === 'duvar' || z === 'dis' || z === 'cit')) {
        var k = kapiSet[tx + ',' + ty];
        var ns = k.yatay ? [[0, 1], [0, -1]] : [[-1, 0], [1, 0]];
        for (var q = 0; q < ns.length; q++) {
          var zn = zg(tx + ns[q][0], ty + ns[q][1]);
          if (zn !== 'duvar' && zn !== 'dis' && zn !== 'cit') return zn;
        }
        return 'parke';
      }
      return z;
    }
    var floorOf = [];
    for (ty = 0; ty < Hh; ty++) {
      floorOf[ty] = [];
      for (tx = 0; tx < W; tx++) {
        var z = zeminSec(tx, ty); floorOf[ty][tx] = z;
        if (z === 'duvar') { c.fillStyle = '#d9cdb5'; c.fillRect(tx * T, ty * T, T, T); }
        else if (z === 'cit') zeminCiz(c, 'cim', tx, ty);
        else if (z === 'dis') { c.fillStyle = '#2d4a2b'; c.fillRect(tx * T, ty * T, T, T); zeminCiz(c, 'cim', tx, ty); c.fillStyle = 'rgba(10,30,20,0.45)'; c.fillRect(tx * T, ty * T, T, T); }
        else zeminCiz(c, z, tx, ty);
        if (z === 'bodrum' || z === 'kiler') {
          if (tx < S.bx0) S.bx0 = tx; if (tx > S.bx1) S.bx1 = tx; if (ty < S.by0) S.by0 = ty; if (ty > S.by1) S.by1 = ty;
        }
      }
    }
    // zemin kenar gölgeleri: oda geçişleri (halı, fayans kenarı)
    for (ty = 0; ty < Hh; ty++) for (tx = 0; tx < W; tx++) {
      var f = floorOf[ty][tx];
      if (f === 'hali' || f === 'kilim' || f === 'fayans') {
        c.strokeStyle = 'rgba(40,20,10,0.35)'; c.lineWidth = 2;
        if (floorOf[ty - 1] && floorOf[ty - 1][tx] !== f && floorOf[ty - 1][tx] !== 'duvar') { c.beginPath(); c.moveTo(tx * T, ty * T + 1); c.lineTo(tx * T + T, ty * T + 1); c.stroke(); }
        if (floorOf[ty + 1] && floorOf[ty + 1][tx] !== f && floorOf[ty + 1][tx] !== 'duvar') { c.beginPath(); c.moveTo(tx * T, ty * T + T - 1); c.lineTo(tx * T + T, ty * T + T - 1); c.stroke(); }
        if (floorOf[ty][tx - 1] !== f && floorOf[ty][tx - 1] !== 'duvar') { c.beginPath(); c.moveTo(tx * T + 1, ty * T); c.lineTo(tx * T + 1, ty * T + T); c.stroke(); }
        if (floorOf[ty][tx + 1] !== f && floorOf[ty][tx + 1] !== 'duvar') { c.beginPath(); c.moveTo(tx * T + T - 1, ty * T); c.lineTo(tx * T + T, ty * T + T); c.stroke(); }
      }
    }
    // kaldırım-yol kenarı
    for (ty = 0; ty < Hh; ty++) for (tx = 0; tx < W; tx++) {
      if (floorOf[ty][tx] === 'kaldirim' && floorOf[ty + 1] && floorOf[ty + 1][tx] === 'yol') {
        c.fillStyle = '#8f8d86'; c.fillRect(tx * T, ty * T + T - 5, T, 5);
        c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(tx * T, ty * T + T, T, 4);
      }
    }
    // duvar & çit (duvar gölgeleri zemin üstüne taşar, o yüzden ayrı geçiş)
    for (ty = 0; ty < Hh; ty++) for (tx = 0; tx < W; tx++) {
      var zt = zg(tx, ty);
      if (kapiSet[tx + ',' + ty]) continue;
      if (zt === 'duvar') duvarCiz(c, tx, ty);
    }
    for (ty = 0; ty < Hh; ty++) for (tx = 0; tx < W; tx++) {
      if (zg(tx, ty) === 'cit' && !kapiSet[tx + ',' + ty]) citCiz(c, tx, ty);
    }
    // bodrum maskesi (bodrum + bitişik duvarlar)
    m.fillStyle = '#000';
    for (ty = 0; ty < Hh; ty++) for (tx = 0; tx < W; tx++) {
      var zb = zg(tx, ty), yes = zb === 'bodrum' || zb === 'kiler';
      if (!yes && (zb === 'duvar' || kapiSet[tx + ',' + ty])) {
        for (var dy = -1; dy <= 1 && !yes; dy++) for (var dx = -1; dx <= 1; dx++) if (zg(tx + dx, ty + dy) === 'bodrum' || zg(tx + dx, ty + dy) === 'kiler') { yes = true; break; }
      }
      if (yes) m.fillRect(tx * T, ty * T, T, T + (zb === 'duvar' ? 10 : 0));
    }
    if (h.dekorCephe) cepheCiz(c, h.dekorCephe);
    S.hazir = true;
    return true;
  }

  // ---------- MOBİLYALAR (yerel çerçeve: merkez 0,0; arka = üst) ----------
  var P = {};
  function tahta(c, x, y, w, h, base, hi) {
    box(c, x, y, w, h, base, OUT, 2.5, 4);
    c.fillStyle = hi || 'rgba(255,255,255,0.22)'; c.fillRect(x + 3, y + 3, w - 6, 3);
  }
  P.yatak = function (c, w, h) {
    var x = -w / 2, y = -h / 2;
    box(c, x, y, w, h, '#a9743f', OUT, 3, 6);                       // çerçeve
    box(c, x + 2, y - 2, w - 4, 10, '#8a5a2c', OUT, 2.5, 4);        // baş ucu
    box(c, x + 4, y + 8, w - 8, h - 12, '#f4efe6', OUT, 2, 5);      // şilte
    var py = y + 12, np = w > 72 ? 2 : 1, pw = np === 2 ? (w - 22) / 2 : w - 18;
    for (var i = 0; i < np; i++) box(c, x + 9 + i * (pw + 4), py, pw, 18, '#ffffff', OUT, 2, 8);
    var by = y + 34; if (h < 80) by = y + 28;
    box(c, x + 4, by, w - 8, y + h - by - 3, '#4f8fe0', OUT, 2.5, 5);   // battaniye
    c.fillStyle = 'rgba(255,255,255,0.28)';
    for (i = 0; i < 4; i++) c.fillRect(x + 8, by + 8 + i * 14, w - 16, 5);
    box(c, x + 4, by, w - 8, 9, '#fafafa', OUT, 2, 3);              // katlanmış kenar
  };
  P.dolap = function (c, w, h) {
    var x = -w / 2, y = -h / 2;
    box(c, x, y, w, h, '#8d5c30', OUT, 3, 4);
    box(c, x + 4, y + 4, w - 8, h * 0.55, '#b07a45', 'rgba(60,30,10,0.5)', 1.5, 3);
    var fy = y + h * 0.62;
    box(c, x + 3, fy, w - 6, y + h - fy - 3, '#a06a38', OUT, 2, 3);
    line(c, 0, fy, 0, y + h - 3, OUT, 2);
    ell(c, -5, fy + (y + h - fy) / 2 - 1, 2.4, 2.4, '#f2d36b', OUT, 1.2);
    ell(c, 5, fy + (y + h - fy) / 2 - 1, 2.4, 2.4, '#f2d36b', OUT, 1.2);
  };
  P.gardirop = function (c, w, h) {
    var x = -w / 2, y = -h / 2;
    box(c, x, y, w, h, '#7a4b2a', OUT, 3, 4);
    box(c, x + 4, y + 4, w - 8, h * 0.5, '#9a6538', 'rgba(60,30,10,0.5)', 1.5, 3);
    var fy = y + h * 0.58, n = w > 90 ? 3 : 2, dw = (w - 6) / n;
    for (var i = 0; i < n; i++) {
      box(c, x + 3 + i * dw, fy, dw, y + h - fy - 3, i % 2 ? '#b27a44' : '#a86f3b', OUT, 2, 3);
      ell(c, x + 3 + i * dw + dw * (i % 2 ? 0.25 : 0.75), fy + (y + h - fy) / 2, 2.4, 2.4, '#f2d36b', OUT, 1.2);
    }
  };
  P.masa = function (c, w, h) {
    var x = -w / 2, y = -h / 2;
    box(c, x, y, w, h, '#c68b4e', OUT, 3, 7);
    c.strokeStyle = 'rgba(100,55,20,0.35)'; c.lineWidth = 1.5;
    for (var i = 1; i < 4; i++) { c.beginPath(); c.moveTo(x + 6, y + i * h / 4); c.lineTo(x + w - 6, y + i * h / 4); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(x + 5, y + 4, w - 10, 3);
    // örtü şeridi + vazo
    box(c, -w * 0.2, y + 4, w * 0.4, h - 8, 'rgba(255,255,255,0.0)', null);
    ell(c, 0, 0, Math.min(w, h) * 0.2, Math.min(w, h) * 0.2, '#fff4d6', OUT, 2);
    ell(c, 0, 0, Math.min(w, h) * 0.09, Math.min(w, h) * 0.09, '#e8506a', OUT, 1.5);
  };
  // Gökçe'nin çalışma masası (EK-5): ahşap tabla, masa lambası + ışık halkası, açık defter, kalemlik
  P.calisma_masasi = function (c, w, h) {
    var x = -w / 2, y = -h / 2, t = S.t || 0;
    box(c, x, y, w, h, '#b9814a', OUT, 3, 6);
    c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(x + 5, y + 4, w - 10, 3);
    c.strokeStyle = 'rgba(100,55,20,0.3)'; c.lineWidth = 1.3;
    c.beginPath(); c.moveTo(x + 8, y + 14); c.lineTo(x + w - 8, y + 14); c.stroke();
    // lamba ışık halkası (sol köşe)
    var lx = x + 10, ly = y + 14;
    var g = c.createRadialGradient(lx, ly + 6, 2, lx, ly + 6, 54);
    g.addColorStop(0, 'rgba(255,240,150,0.55)'); g.addColorStop(1, 'rgba(255,240,150,0)');
    c.fillStyle = g; c.beginPath(); c.arc(lx, ly + 6, 54, 0, PI * 2); c.fill();
    // açık defter (ortada, hafif eğik)
    c.save(); c.translate(x + w * 0.6, y + h * 0.5 + 2); c.rotate(-0.06);
    box(c, -22, -13, 44, 28, '#3f7fd0', OUT, 2.2, 3);
    box(c, -20, -15, 19, 28, '#fffdf3', OUT, 1.8, 2); box(c, 1, -15, 19, 28, '#fffdf3', OUT, 1.8, 2);
    c.strokeStyle = 'rgba(70,110,200,0.65)'; c.lineWidth = 1;
    for (var i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-17, -10 + i * 5); c.lineTo(-4, -10 + i * 5); c.moveTo(4, -10 + i * 5); c.lineTo(17, -10 + i * 5); c.stroke(); }
    c.fillStyle = '#d33'; c.font = 'bold 7px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('7×8', -10, 1); c.fillText('=56', 11, 6);
    line(c, 0, -15, 0, 13, 'rgba(0,0,0,0.35)', 1.2);
    c.restore();
    // kalemlik (sağ köşe)
    var kx = x + w - 11, ky = y + 17;
    var cols = ['#e5483d', '#f2b632', '#3fa7d6'];
    for (i = 0; i < 3; i++) line(c, kx - 3 + i * 3, ky - 3, kx - 4 + i * 4.5, ky - 14, cols[i], 2.6);
    box(c, kx - 7, ky - 3, 14, 12, '#58b368', OUT, 2, 3);
    // lamba
    ell(c, lx, ly + 5, 7, 4.5, '#444c58', OUT, 2);
    line(c, lx, ly + 3, lx + 4, ly - 7, OUT, 4); line(c, lx, ly + 3, lx + 4, ly - 7, '#8a94a3', 2);
    c.beginPath(); c.moveTo(lx + 1, ly - 10); c.lineTo(lx + 13, ly - 8); c.lineTo(lx + 9, ly - 1); c.closePath(); fs(c, '#ff8a3d', OUT, 1.8);
    ell(c, lx + 9, ly - 2, 2.4, 1.6, '#fff6b0', null);
  };
  P.sandalye = function (c, w, h) {
    var s = Math.min(w, h) - 8;
    box(c, -s / 2, -s / 2 + 3, s, s - 3, '#d9a566', OUT, 2.5, 5);
    box(c, -s / 2, -s / 2 - 4, s, 9, '#9a6532', OUT, 2.5, 3);
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(-s / 2 + 3, -s / 2 + 8, s - 6, 3);
  };
  function koltukCiz(c, w, h, renk, koyu, adet) {
    var x = -w / 2, y = -h / 2;
    box(c, x, y, w, h, koyu, OUT, 3, 8);
    box(c, x + 3, y + 2, w - 6, 14, renk, OUT, 2.2, 6);              // sırtlık
    var aw = Math.min(14, w * 0.14);
    box(c, x, y + 8, aw, h - 8, koyu, OUT, 2.5, 6);                  // kollar
    box(c, x + w - aw, y + 8, aw, h - 8, koyu, OUT, 2.5, 6);
    var iw = w - aw * 2 - 6, cw = iw / adet;
    for (var i = 0; i < adet; i++) {
      box(c, x + aw + 3 + i * cw + 1, y + 18, cw - 2, h - 24, renk, OUT, 2.2, 6);
      c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(x + aw + 8 + i * cw, y + 22, cw - 12, 3);
    }
  }
  P.koltuk = function (c, w, h) { koltukCiz(c, w, h, '#d96b5a', '#a94a3c', 1); };
  P.kanepe = function (c, w, h) { koltukCiz(c, w, h, '#4d9ab5', '#2f6f87', Math.max(2, Math.round(w / 48))); };
  P.tv = function (c, w, h) {
    var x = -w / 2, y = -h / 2;
    box(c, x, y, w, h, '#5a3b25', OUT, 3, 4);
    var sw = w - 14, sh = Math.min(h - 8, 12);
    box(c, -sw / 2, y + h - sh - 4, sw, sh, '#10151c', OUT, 2.5, 2);
    var g = c.createLinearGradient(0, y + h - sh - 4, 0, y + h - 4);
    g.addColorStop(0, '#7de0ff'); g.addColorStop(1, '#2a7bd1');
    c.fillStyle = g; c.fillRect(-sw / 2 + 3, y + h - sh - 1, sw - 6, sh - 6);
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(-sw / 2 + 5, y + h - sh, 10, 2);
    ell(c, 0, y + 6, 3, 2, '#2a2a2a', null);
  };
  P.buzdolabi = function (c, w, h) {
    var x = -w / 2, y = -h / 2;
    box(c, x, y, w, h, '#e8f2f6', OUT, 3, 7);
    box(c, x + 4, y + 4, w - 8, h * 0.55, '#f7fcfe', 'rgba(60,90,110,0.5)', 1.5, 5);
    line(c, x + 3, y + h * 0.62, x + w - 3, y + h * 0.62, OUT, 2);
    box(c, x + w - 13, y + h * 0.66, 5, h * 0.22, '#9aa9b3', OUT, 1.5, 2);
    box(c, x + w - 13, y + h * 0.4, 5, h * 0.16, '#9aa9b3', OUT, 1.5, 2);
    box(c, x + 8, y + h * 0.7, 9, 9, '#ff7a8a', null, 0, 2);
    c.fillStyle = 'rgba(120,170,190,0.25)'; c.fillRect(x + 4, y + h - 10, w - 8, 5);
  };
  P.ocak = function (c, w, h) {
    var x = -w / 2, y = -h / 2;
    box(c, x, y, w, h, '#d7dde0', OUT, 3, 5);
    box(c, x + 3, y + 3, w - 6, h * 0.7, '#3a3f45', OUT, 2, 4);
    var bw = (w - 10) / 2, bh = (h * 0.7 - 4) / 2;
    for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++) {
      var cx = x + 5 + bw * (i + 0.5), cy = y + 5 + bh * (j + 0.5), rr2 = Math.min(bw, bh) * 0.38;
      ell(c, cx, cy, rr2, rr2, '#22262b', '#8a9096', 2);
      ell(c, cx, cy, rr2 * 0.45, rr2 * 0.45, (i + j === 1) ? '#ff7a2a' : '#3d4249', null);
    }
    for (i = 0; i < 4; i++) ell(c, x + 8 + i * (w - 16) / 3, y + h - 7, 2.6, 2.6, '#2a2a2a', null);
  };
  P.tezgah = function (c, w, h) {
    var x = -w / 2, y = -h / 2;
    box(c, x, y, w, h, '#bda77e', OUT, 3, 4);
    box(c, x + 3, y + 3, w - 6, h - 9, '#efe3c4', 'rgba(90,70,40,0.45)', 1.5, 3);
    if (w > 40) {
      box(c, x + 8, y + 8, 16, 10, '#c78b4d', OUT, 1.8, 3);
      ell(c, x + w - 18, y + h / 2 - 2, 7, 5, '#7fc4e0', OUT, 1.8);
    }
  };
  P.lavabo = function (c, w, h) {
    var x = -w / 2, y = -h / 2;
    box(c, x, y, w, h, '#9fb4c0', OUT, 3, 4);
    box(c, x + 3, y + 3, w - 6, h - 6, '#e3eef3', 'rgba(60,90,110,0.5)', 1.5, 3);
    ell(c, 0, 4, Math.min(w, h) * 0.32, Math.min(w, h) * 0.26, '#fff', OUT, 2);
    ell(c, 0, 5, Math.min(w, h) * 0.18, Math.min(w, h) * 0.14, '#9ad7f0', null);
    box(c, -2, y + 5, 4, 8, '#b8c4cc', OUT, 1.5, 2);
    ell(c, -8, y + 8, 2.5, 2.5, '#e8506a', null); ell(c, 8, y + 8, 2.5, 2.5, '#3b82f6', null);
  };
  P.kuvet = function (c, w, h) {
    var x = -w / 2, y = -h / 2;
    box(c, x, y, w, h, '#f4f9fb', OUT, 3, 12);
    box(c, x + 5, y + 5, w - 10, h - 10, '#8fd3ec', 'rgba(40,100,130,0.6)', 2, 10);
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 2;
    c.beginPath(); c.arc(0, 0, h * 0.2, 3.6, 5.2); c.stroke();
    ell(c, x + w - 12, 0, 3, 3, '#6a7a84', OUT, 1.5);
    box(c, x + 4, -4, 8, 8, '#c9d6dc', OUT, 1.5, 3);
  };
  P.klozet = function (c, w, h) {
    var x = -w / 2, y = -h / 2;
    box(c, x + 6, y, w - 12, h * 0.32, '#f4f9fb', OUT, 2.5, 4);
    ell(c, 0, y + h * 0.35 + (h * 0.62) / 2 - 2, (w - 14) / 2, h * 0.31, '#ffffff', OUT, 2.5);
    ell(c, 0, y + h * 0.35 + (h * 0.62) / 2 - 1, (w - 26) / 2, h * 0.2, '#bfe6f5', 'rgba(60,110,140,0.5)', 1.5);
    ell(c, 0, y + 3, 3, 2, '#9aa9b3', OUT, 1.2);
  };
  P.kitaplik = function (c, w, h) {
    var x = -w / 2, y = -h / 2;
    box(c, x, y, w, h, '#74451f', OUT, 3, 3);
    box(c, x + 3, y + 3, w - 6, h - 6, '#4a2a12', null, 0, 2);
    var cols = ['#e5483d', '#f2b632', '#3fa7d6', '#58b368', '#a15fd0', '#f08a3b', '#e868a2'];
    var rows = h > 30 ? 2 : 1, rh = (h - 8) / rows;
    for (var r = 0; r < rows; r++) {
      var bx = x + 5, i = 0;
      while (bx < x + w - 8) {
        var bw = 4 + hs(i, r, 3) * 4, bhh = rh - 4 - hs(i, r, 5) * 5;
        c.fillStyle = cols[(i + r * 3) % cols.length];
        c.fillRect(bx, y + 4 + r * rh + (rh - 2 - bhh), bw, bhh);
        c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 1; c.strokeRect(bx, y + 4 + r * rh + (rh - 2 - bhh), bw, bhh);
        bx += bw + 0.5; i++;
      }
      c.fillStyle = '#74451f'; c.fillRect(x + 3, y + 4 + (r + 1) * rh - 2, w - 6, 3);
    }
  };
  P.saksi = function (c, w, h) {
    var r = Math.min(w, h) / 2 - 3;
    for (var i = 0; i < 7; i++) {
      var a = i * 0.9;
      ell(c, Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5, r * 0.55, r * 0.28, i % 2 ? '#3fae4d' : '#2f9a44', OUT, 2, a);
    }
    ell(c, 0, 0, r * 0.4, r * 0.4, '#c0603a', OUT, 2);
    ell(c, 0, 0, r * 0.2, r * 0.2, '#ff8fb0', OUT, 1.5);
  };
  P.cali = function (c, w, h) {
    var rx = w / 2 - 1, ry = h / 2 - 1;
    var bl = [[-.45, -.3, .6], [.4, -.35, .6], [-.4, .35, .62], [.42, .35, .6], [0, 0, .7]];
    var i;
    for (i = 0; i < bl.length; i++) ell(c, bl[i][0] * rx, bl[i][1] * ry, rx * bl[i][2], ry * bl[i][2], '#2e8f3e', OUT, 2.5);
    for (i = 0; i < bl.length; i++) ell(c, bl[i][0] * rx - 2, bl[i][1] * ry - 3, rx * bl[i][2] * 0.6, ry * bl[i][2] * 0.55, i % 2 ? '#47b653' : '#3da84b', null);
    for (i = 0; i < 6; i++) ell(c, (hs(i, 1, 2) - 0.5) * rx * 1.4, (hs(i, 2, 3) - 0.5) * ry * 1.4, 2.4, 2.4, '#ff5a6a', OUT, 1);
  };
  P.kutu = function (c, w, h) {
    var x = -w / 2 + 2, y = -h / 2 + 2, ww = w - 4, hh = h - 4;
    box(c, x, y, ww, hh, '#d9a45e', OUT, 2.8, 3);
    c.fillStyle = 'rgba(255,255,255,0.28)'; c.fillRect(x + 3, y + 3, ww - 6, 4);
    c.fillStyle = '#efd9a5'; c.fillRect(-4, y + 1, 8, hh - 2);
    c.strokeStyle = 'rgba(70,40,10,0.5)'; c.lineWidth = 1.2; c.strokeRect(-4, y + 1, 8, hh - 2);
    line(c, x + 3, y + hh * 0.5, x + ww - 3, y + hh * 0.5, 'rgba(70,40,10,0.35)', 1.2);
  };
  P.varil = function (c, w, h) {
    var r = Math.min(w, h) / 2 - 2;
    ell(c, 0, 0, r, r, '#3c7bbd', OUT, 3);
    ell(c, 0, 0, r * 0.82, r * 0.82, '#5b9ad6', 'rgba(20,50,90,0.7)', 2);
    ell(c, 0, 0, r * 0.56, r * 0.56, null, 'rgba(20,50,90,0.6)', 1.5);
    c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 2.5;
    c.beginPath(); c.arc(0, 0, r * 0.68, 3.4, 4.5); c.stroke();
    ell(c, r * 0.25, r * 0.15, 3.5, 3.5, '#2b4f7c', OUT, 1.2);
  };
  P.tezgah_atolye = function (c, w, h) {
    var x = -w / 2, y = -h / 2;
    box(c, x, y, w, h, '#6d6f75', OUT, 3, 3);
    box(c, x + 3, y + 3, w - 6, h - 8, '#b88a55', 'rgba(60,35,10,0.6)', 1.5, 2);
    box(c, x + w - 18, y + 7, 11, 12, '#c33a3a', OUT, 2, 2);                  // mengene
    box(c, x + 8, y + 12, 22, 5, '#9aa0a8', OUT, 1.8, 2);                      // anahtar
    ell(c, x + 8, y + 14.5, 4, 4, '#9aa0a8', OUT, 1.5);
    box(c, x + 14, y + h - 17, 14, 5, '#6b4a24', OUT, 1.8, 1); box(c, x + 28, y + h - 19, 6, 9, '#9aa0a8', OUT, 1.8, 2); // çekiç
    for (var i = 0; i < 3; i++) ell(c, x + 8 + i * 5, y + h - 9, 1.5, 1.5, '#444', null);
  };
  P.merdiven = function (c, w, h) {
    var x = -w / 2, y = -h / 2;
    box(c, x, y, w, h, '#a98355', OUT, 3, 3);
    var n = Math.max(4, Math.round(h / 8));
    for (var i = 0; i < n; i++) {
      var yy = y + 2 + i * (h - 4) / n;
      c.fillStyle = 'rgba(0,0,0,' + (0.04 + i * 0.5 / n * 0.4) + ')'; c.fillRect(x + 3, yy, w - 6, (h - 4) / n);
      line(c, x + 3, yy, x + w - 3, yy, 'rgba(60,35,10,0.8)', 2);
    }
    box(c, x - 1, y, 5, h, '#7a5632', OUT, 2, 1); box(c, x + w - 4, y, 5, h, '#7a5632', OUT, 2, 1);
    c.fillStyle = 'rgba(255,255,255,0.8)';
    c.beginPath(); c.moveTo(0, y + h - 6); c.lineTo(-7, y + h - 15); c.lineTo(7, y + h - 15); c.closePath(); c.fill();
  };
  P.camasir_makinesi = function (c, w, h) {
    var x = -w / 2, y = -h / 2;
    box(c, x, y, w, h, '#f1f4f6', OUT, 3, 6);
    box(c, x + 4, y + 4, w - 8, 9, '#cfd8de', OUT, 1.8, 3);
    ell(c, x + 12, y + 8.5, 2.5, 2.5, '#e8506a', null); box(c, x + 20, y + 6, 14, 5, '#7bd3ea', null, 0, 2);
    var r = Math.min(w, h) * 0.28;
    ell(c, 0, y + h * 0.6, r, r, '#c0c9cf', OUT, 2.5);
    ell(c, 0, y + h * 0.6, r * 0.75, r * 0.75, '#5aa9d6', OUT, 1.8);
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 2; c.beginPath(); c.arc(0, y + h * 0.6, r * 0.5, 3.6, 4.7); c.stroke();
  };
  P.cop_kutusu = function (c, w, h) {
    var r = Math.min(w, h) / 2 - 2;
    ell(c, 0, 0, r, r, '#3f8d4a', OUT, 3);
    ell(c, 0, 0, r * 0.82, r * 0.82, '#56ad62', 'rgba(20,70,30,0.6)', 1.8);
    box(c, -r * 0.4, -3, r * 0.8, 6, '#2d6b37', OUT, 1.8, 3);
    c.strokeStyle = 'rgba(20,70,30,0.5)'; c.lineWidth = 1.5;
    for (var i = 0; i < 4; i++) { var a = i * PI / 2 + 0.8; c.beginPath(); c.moveTo(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5); c.lineTo(Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78); c.stroke(); }
  };
  P.posta_kutusu = function (c, w, h) {
    var s = Math.min(w, h);
    ell(c, 0, s * 0.05, s * 0.34, s * 0.34, '#d93b3b', OUT, 2.5);
    box(c, -s * 0.28, -s * 0.34, s * 0.56, s * 0.38, '#e84a4a', OUT, 2.5, 6);
    box(c, -s * 0.17, -s * 0.2, s * 0.34, 5, '#2b1a14', null, 0, 2);
    box(c, s * 0.28, -s * 0.34, 4, 11, '#ffd23f', OUT, 1.5, 1);
    c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(-s * 0.2, -s * 0.3, s * 0.2, 3);
  };
  P.kopek_kulubesi = function (c, w, h) {
    var x = -w / 2, y = -h / 2;
    box(c, x, y, w, h, '#8c4a2b', OUT, 3, 5);
    box(c, x + 2, y + 2, w / 2 - 2, h - 4, '#c25a3a', OUT, 2.2, 4);
    box(c, 0, y + 2, w / 2 - 2, h - 4, '#a84a2d', OUT, 2.2, 4);
    for (var i = 1; i < 4; i++) { line(c, x + 4, y + 2 + i * (h - 4) / 4, x + w / 2 - 2, y + 2 + i * (h - 4) / 4, 'rgba(60,20,10,0.45)', 1.2); line(c, 3, y + 2 + i * (h - 4) / 4, w / 2 - 4, y + 2 + i * (h - 4) / 4, 'rgba(60,20,10,0.45)', 1.2); }
    box(c, -9, y + h - 12, 18, 14, '#241512', OUT, 2.2, 7);
    ell(c, w / 2 - 6, y + h - 4, 5, 3, '#f2c14e', OUT, 1.5);
  };
  P.salincak = function (c, w, h) {
    var x = -w / 2, y = -h / 2;
    var cs = 'rgba(0,0,0,0.0)';
    box(c, x, y + 2, w, 6, '#c24a3a', OUT, 2.5, 3);
    box(c, x + 2, y + h - 8, 8, 8, '#8a3328', OUT, 2, 2); box(c, x + w - 10, y + h - 8, 8, 8, '#8a3328', OUT, 2, 2);
    var n = w > 90 ? 2 : 1;
    for (var i = 0; i < n; i++) {
      var sx = x + w * (i + 1) / (n + 1);
      line(c, sx - 8, y + 6, sx - 8, y + h * 0.62, '#555', 1.8); line(c, sx + 8, y + 6, sx + 8, y + h * 0.62, '#555', 1.8);
      box(c, sx - 12, y + h * 0.6, 24, 9, i % 2 ? '#3b82f6' : '#f2b632', OUT, 2, 3);
    }
  };
  P.bisiklet = function (c, w, h) { /* uzun eksen yatay, ön = +x */
    var L = Math.max(w, h);
    var wr = Math.min(8, L * 0.2);
    ell(c, -L * 0.28, 0, wr * 1.1, wr * 0.55, '#2a2a2a', OUT, 2); ell(c, L * 0.28, 0, wr * 1.1, wr * 0.55, '#2a2a2a', OUT, 2);
    ell(c, -L * 0.28, 0, wr * 0.8, wr * 0.3, '#ddd', null); ell(c, L * 0.28, 0, wr * 0.8, wr * 0.3, '#ddd', null);
    line(c, -L * 0.28, 0, L * 0.28, 0, OUT, 6); line(c, -L * 0.28, 0, L * 0.28, 0, '#3b82f6', 3.5);
    box(c, -L * 0.2, -3.5, 9, 7, '#222', OUT, 1.5, 3);
    line(c, L * 0.2, -9, L * 0.2, 9, OUT, 5); line(c, L * 0.2, -9, L * 0.2, 9, '#9aa0a8', 2.5);
    ell(c, L * 0.2, -9, 2, 2, '#e5483d', OUT, 1); ell(c, L * 0.2, 9, 2, 2, '#e5483d', OUT, 1);
  };
  P.araba = function (c, w, h) { /* uzun eksen yatay, ön = +x */
    var L = Math.max(w, h), Wd = Math.min(w, h), x = -L / 2, y = -Wd / 2;
    var i, sx;
    for (i = 0; i < 2; i++) for (sx = 0; sx < 2; sx++) box(c, x + L * (sx ? 0.68 : 0.12), y - 2 + i * (Wd - 6 + 2), L * 0.2, 8, '#222', OUT, 2, 3);
    box(c, x, y + 3, L, Wd - 6, '#ffcf2e', OUT, 3.2, 14);
    box(c, x + L * 0.62, y + 6, L * 0.3, Wd - 12, '#f4b81c', null, 0, 8);
    box(c, x + L * 0.22, y + 7, L * 0.4, Wd - 14, '#e8a912', OUT, 2.2, 7);          // tavan
    box(c, x + L * 0.62, y + 8, L * 0.1, Wd - 16, '#9ee0f6', OUT, 2, 3);            // ön cam
    box(c, x + L * 0.14, y + 8, L * 0.08, Wd - 16, '#9ee0f6', OUT, 2, 3);            // arka cam
    ell(c, x + L - 4, y + 10, 4, 5, '#fff7c0', OUT, 1.8); ell(c, x + L - 4, y + Wd - 10, 4, 5, '#fff7c0', OUT, 1.8);
    ell(c, x + 4, y + 10, 3, 4, '#e5483d', OUT, 1.5); ell(c, x + 4, y + Wd - 10, 3, 4, '#e5483d', OUT, 1.5);
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x + L * 0.25, y + 9, L * 0.3, 3);
  };

  // EK-6/7: stüdyo ve Ebe-Dede evinin tanınabilir eşyaları.
  P.hoparlor = function (c, w, h) {
    box(c, -w/2+3, -h/2+2, w-6, h-4, '#33404d', OUT, 2.5, 5);
    box(c, -w/2+7, -h/2+6, w-14, h-12, '#202a35', '#63717a', 1, 4);
    ell(c, 0, h*0.13, w*0.24, h*0.22, '#53636d', '#111b25', 2);
    ell(c, 0, h*0.13, w*0.1, h*0.09, '#1c2733', '#7c8f96', 1.5);
    ell(c, 0, -h*0.27, w*0.09, h*0.08, '#111b25', '#889c9e', 1.5);
    ell(c, w*0.27, h*0.36, 1.5, 1.5, '#93e2bc', null);
  };
  P.mikrofon = function (c, w, h) {
    ell(c, 0, h*0.3, w*0.24, h*0.12, '#344250', OUT, 2);
    line(c, 0, h*0.27, 0, -h*0.17, OUT, 5);
    line(c, -1, h*0.24, -1, -h*0.18, '#c5d5d7', 2);
    c.save(); c.translate(0, -h*0.22); c.rotate(-0.25);
    box(c, -5, -3, 10, 17, '#344250', OUT, 2, 3);
    box(c, -8, -16, 16, 19, '#a6bcc3', OUT, 2, 7);
    for (var i=0;i<4;i++) line(c, -5, -12+i*3.5, 5, -12+i*3.5, '#526b78', 1);
    c.restore();
    c.beginPath(); c.moveTo(0,h*0.35); c.bezierCurveTo(w*0.4,h*0.45,w*0.4,0,w*0.3,-h*0.15); c.strokeStyle='#293843'; c.lineWidth=1.8; c.stroke();
  };
  P.studyo_masasi = function (c, w, h) {
    tahta(c, -w/2, -h/2, w, h, '#9a6c4d', '#d3ad7e');
    box(c, -w*0.34, -h*0.44, w*0.53, h*0.42, '#263b4c', OUT, 2, 4);
    box(c, -w*0.3, -h*0.4, w*0.45, h*0.29, '#6ac4c9', null, 0, 2);
    for(var i=0;i<12;i++) line(c, -w*0.27+i*w*0.034,-h*0.26, -w*0.27+i*w*0.034,-h*0.26-Math.sin(i*2)*h*0.09, '#d8fff1', 1.4);
    box(c, -w*0.33, h*0.05, w*0.5, h*0.28, '#ede7d8', OUT, 1.5, 2);
    for(i=0;i<9;i++) line(c,-w*0.28+i*w*0.05,h*0.08,-w*0.28+i*w*0.05,h*0.27,'#8d9696',1);
    box(c,w*0.25,-h*0.32,w*0.17,h*0.6,'#304251',OUT,1.5,2);
    for(i=0;i<3;i++){ line(c,w*0.28,-h*0.19+i*8,w*0.39,-h*0.19+i*8,'#91a4ac',1.3); ell(c,w*0.3+(i%2)*5,-h*0.19+i*8,2,2,i%2?'#eea766':'#76d5bf',null); }
  };
  P.karaoke = function(c,w,h) {
    tahta(c,-w/2,-h/2,w,h,'#795748');
    c.save();c.translate(-w*0.32,0);P.hoparlor(c,w*0.29,h*0.88);c.restore();
    box(c,-w*0.12,-h*0.36,w*0.35,h*0.44,'#344250',OUT,2,3);
    box(c,-w*0.08,-h*0.31,w*0.27,h*0.3,'#ce92c7',null,0,2);
    metin(c,'♪',w*0.06,-h*0.16,'bold 16px sans-serif','#fff6c7');
    c.save();c.translate(w*0.34,h*0.05);P.mikrofon(c,w*0.25,h*0.78);c.restore();
    for(var i=0;i<5;i++) box(c,-w*0.1+i*6,h*0.17,4,4,i%2?'#e9bc69':'#86c4b8',null,0,1);
  };
  P.bank = function(c,w,h) {
    var x=-w/2,y=-h/2;
    box(c,x+6,y+7,7,h-7,'#435a50',OUT,2,2);box(c,w/2-13,y+7,7,h-7,'#435a50',OUT,2,2);
    for(var i=0;i<3;i++) tahta(c,x+1,y+5+i*(h-10)/3,w-2,(h-12)/3,'#be925e','#e7be87');
    line(c,x+8,y+4,x+8,h/2-3,'#5d4c3c',2);line(c,w/2-8,y+4,w/2-8,h/2-3,'#5d4c3c',2);
  };
  P.sallanan_koltuk = function(c,w,h) {
    c.save();c.rotate(Math.sin(S.t*1.3)*0.035);
    for(var sg=-1;sg<=1;sg+=2){c.beginPath();c.moveTo(sg*w*0.43,-h*0.45);c.quadraticCurveTo(sg*w*0.54,h*0.15,sg*w*0.38,h*0.48);c.strokeStyle='#654733';c.lineWidth=5;c.stroke();}
    koltukCiz(c,w*0.77,h*0.84,'#8ea288','#667b63',1);
    for(var i=0;i<4;i++) line(c,-w*0.22+i*w*0.15,-h*0.36,-w*0.22+i*w*0.15,-h*0.15,'#d1bd8f',1.5);
    c.restore();
  };
  P.eski_tv = function(c,w,h) {
    box(c,-w/2,-h/2,w,h,'#805940',OUT,3,7);
    box(c,-w*0.43,-h*0.4,w*0.67,h*0.75,'#303b41',OUT,2,8);
    box(c,-w*0.39,-h*0.34,w*0.59,h*0.61,'#86a6a2',null,0,9);
    for(var i=0;i<5;i++) line(c,-w*0.34,-h*0.23+i*5,w*0.15,-h*0.23+i*5,'rgba(230,242,214,0.25)',1);
    ell(c,w*0.36,-h*0.21,5,5,'#e0bf86',OUT,1.5);ell(c,w*0.36,h*0.05,4,4,'#e0bf86',OUT,1.5);
    line(c,-6,-h/2,-18,-h/2-12,'#6b6f6b',2);line(c,-6,-h/2,10,-h/2-12,'#6b6f6b',2);
  };
  P.firin = function(c,w,h) {
    box(c,-w/2,-h/2,w,h,'#eee6cf',OUT,3,5);
    box(c,-w*0.39,-h*0.16,w*0.78,h*0.54,'#394c50',OUT,2,4);
    box(c,-w*0.3,-h*0.05,w*0.6,h*0.3,'#c4824b',null,0,2);
    line(c,-w*0.27,-h*0.1,w*0.27,-h*0.1,'#dad8cd',3);
    for(var i=0;i<3;i++) ell(c,-w*0.25+i*w*0.25,-h*0.32,3,3,'#647d75',OUT,1);
    for(i=0;i<3;i++) ell(c,-w*0.2+i*w*0.2,h*0.14,4,3,'#f4cd7e','#8c5734',1);
  };
  P.kurabiye_tepsisi = function(c,w,h) {
    box(c,-w*0.46,-h*0.38,w*0.92,h*0.76,'#9baba9',OUT,2,5);
    box(c,-w*0.38,-h*0.3,w*0.76,h*0.6,'#d0d8cb','#667976',1,4);
    for(var i=0;i<6;i++){var x=(i%3-1)*w*0.24,y=(Math.floor(i/3)-0.5)*h*0.27;ell(c,x,y,5.5,5,'#e4b16a','#9b693d',1);ell(c,x-1,y-2,1,1,'#624431',null);ell(c,x+2,y+1,1,1,'#624431',null);}
  };
  P.sandik = function(c,w,h) {
    tahta(c,-w/2+2,-h/2+2,w-4,h-4,'#986541','#c69360');
    box(c,-w/2+3,-h/2+2,w-6,h*0.55,'#b98452',OUT,2,6);
    for(var sg=-1;sg<=1;sg+=2){box(c,sg*w*0.29-3,-h/2+2,6,h-4,'#547776',OUT,1,2);ell(c,sg*w*0.29,h*0.31,1.2,1.2,'#efcf8b',null);}
    box(c,-5,h*0.04,10,12,'#dfb75e',OUT,1.5,2);ell(c,0,h*0.14,1.7,2,'#453e30',null);
  };
  P.orgu_sepeti = function(c,w,h) {
    ell(c,0,2,w*0.42,h*0.36,'#b47d4f',OUT,2.5);ell(c,0,-3,w*0.4,h*0.28,'#694a34',OUT,2);
    ['#db8ca1','#8db3a1','#e6bc6d'].forEach(function(col,i){var x=(i-1)*w*0.22,y=i%2?-8:0;ell(c,x,y,9,8,col,OUT,1.2);for(var j=0;j<3;j++) line(c,x-5+j*3,y-5,x-2+j*3,y+5,'rgba(255,255,255,0.42)',1);});
    for(var i=0;i<6;i++) line(c,-w*0.3+i*w*0.12,h*0.17,-w*0.27+i*w*0.11,h*0.3,'#e2b478',1.5);
    line(c,1,4,w*0.32,-h*0.4,'#d3d9cc',2);line(c,7,6,-w*0.08,-h*0.42,'#d3d9cc',2);
  };
  P.raf_kavanoz = function(c,w,h) {
    tahta(c,-w/2,-h/2,w,h,'#8d6043');
    var nr=Math.max(2,Math.floor(h/25));
    for(var r=0;r<nr;r++){var y=-h/2+7+r*(h-7)/nr;for(var i=0;i<3;i++){var x=-w*0.3+i*w*0.3;box(c,x-5,y,10,(h-12)/nr-4,['#b4c18c','#d5a066','#b8c99f'][(i+r)%3],OUT,1,3);box(c,x-5,y-2,10,4,['#9e5248','#548981','#d3b16e'][i],OUT,1,1);ell(c,x-2,y+5,1,3,'#fff6',null);}line(c,-w/2+2,y+(h-7)/nr-3,w/2-2,y+(h-7)/nr-3,'#dbb57c',3);}
  };
  P.cuval = function(c,w,h) {
    ell(c,0,3,w*0.37,h*0.4,'#c7ae76',OUT,2.5);
    box(c,-w*0.19,-h*0.37,w*0.38,h*0.13,'#d5c18d',OUT,1.5,4);
    line(c,-w*0.2,-h*0.23,w*0.2,-h*0.23,'#75553c',3);
    for(var i=0;i<3;i++)line(c,-10+i*10,2,-9+i*9,12,'#a58c5c',1);
    line(c,0,3,0,17,'#8d754d',1.5);for(i=0;i<3;i++){ell(c,-3,5+i*4,3,1.5,'#997b40',null,0,0.6);ell(c,3,5+i*4,3,1.5,'#997b40',null,0,-0.6);}
  };
  P.tursu_bidonu = function(c,w,h) {
    box(c,-w*0.32,-h*0.35,w*0.64,h*0.75,'#a6bb78',OUT,2.5,8);
    for(var i=0;i<5;i++) ell(c,(i%2?1:-1)*w*0.12,-h*0.14+i*5,4,7,i%2?'#739550':'#5c8046','#486537',1, i*0.5);
    box(c,-w*0.33,-h*0.42,w*0.66,h*0.17,'#c1784c',OUT,2,3);
    box(c,-w*0.13,h*0.04,w*0.34,h*0.2,'#f0e1ba','#b2a27a',1,2);
    line(c,-w*0.22,-h*0.18,-w*0.22,h*0.27,'rgba(255,255,230,0.65)',3);
  };
  P.kumes = function(c,w,h) {
    tahta(c,-w*0.44,-h*0.36,w*0.88,h*0.8,'#bd965e');
    box(c,-w*0.29,-h*0.03,w*0.35,h*0.4,'#4f4b36',OUT,2,5);
    for(var i=0;i<3;i++)line(c,-w*0.23+i*w*0.12,-h*0.01,-w*0.23+i*w*0.12,h*0.34,'#9da78b',1);
    for(i=0;i<3;i++)line(c,-w*0.27,h*0.05+i*h*0.1,w*0.04,h*0.05+i*h*0.1,'#9da78b',1);
    box(c,w*0.15,-h*0.08,w*0.2,h*0.23,'#3b3b2c',OUT,2,4);
    tahta(c,w*0.12,h*0.17,w*0.26,h*0.29,'#d7b47e');
    c.beginPath();c.moveTo(-w/2,-h*0.09);c.lineTo(-w*0.35,-h*0.46);c.lineTo(w*0.35,-h*0.46);c.lineTo(w/2,-h*0.09);c.closePath();fs(c,'#a85c44',OUT,3);
    for(i=0;i<6;i++)line(c,-w*0.32+i*w*0.13,-h*0.4,-w*0.4+i*w*0.16,-h*0.12,'#d28763',2);
  };
  P.tavuk = function(c,w,h,e) {
    var t=S.t+(e?e.tx*1.7+e.ty:0), pik=Math.max(0,Math.sin(t*2.3))*5;
    c.save();c.translate(Math.sin(t)*2,Math.cos(t*0.8));
    line(c,-5,8,-7,15,'#b47732',2);line(c,5,8,8,15,'#b47732',2);
    ell(c,-2,0,13,10,'#fff3d9',OUT,2);ell(c,-5,1,7,5,'#e3d6b7','#af9b7b',1.3,0.3);
    ell(c,10, -5+pik,7,7,'#fff9e8',OUT,1.8);ell(c,10,-13+pik,4,3,'#d85c4a',OUT,1);
    c.beginPath();c.moveTo(15,-6+pik);c.lineTo(22,-3+pik);c.lineTo(15,pik);c.closePath();fs(c,'#e9ad4e',OUT,1);
    ell(c,12,-6+pik,1.4,1.8,'#242b2b',null);ell(c,13,2+pik,2,3,'#d85c4a',null);
    c.restore();
  };
  P.su_kuyusu = function(c,w,h) {
    ell(c,0,h*0.18,w*0.39,h*0.3,'#98958a',OUT,3);ell(c,0,h*0.1,w*0.34,h*0.24,'#c5c1ad',OUT,2);
    ell(c,0,h*0.1,w*0.25,h*0.16,'#355b62',OUT,2);
    for(var sg=-1;sg<=1;sg+=2)box(c,sg*w*0.34-4,-h*0.29,8,h*0.52,'#926844',OUT,2,2);
    line(c,-w*0.34,-h*0.14,w*0.34,-h*0.14,'#b28c5b',6);line(c,0,-h*0.14,0,h*0.17,'#d9cda3',2);
    box(c,-7,h*0.06,14,15,'#96a9a6',OUT,1.5,3);
    c.beginPath();c.moveTo(-w*0.48,-h*0.22);c.lineTo(0,-h*0.5);c.lineTo(w*0.48,-h*0.22);c.closePath();fs(c,'#b56c4f',OUT,2.5);
    line(c,-w*0.32,-h*0.27,w*0.32,-h*0.27,'#da9872',2);
  };
  P.cicek = function(c,w,h) {
    box(c,-w*0.27,h*0.08,w*0.54,h*0.32,'#bd7054',OUT,2,5);
    box(c,-w*0.31,h*0.05,w*0.62,h*0.1,'#d49469',OUT,1.5,3);
    for(var i=0;i<3;i++){var x=(i-1)*w*0.21,y=-h*(i===1?0.3:0.14);line(c,x,y,0,h*0.1,'#477f52',2);ell(c,x-4,y+9,6,3,'#75a466',null,0,-0.5);for(var a=0;a<5;a++)ell(c,x+Math.cos(a*PI*0.4)*4,y+Math.sin(a*PI*0.4)*4,3.5,3.5,['#e598a6','#f1d17b','#e4bbdb'][i],null);ell(c,x,y,2.5,2.5,'#9a6d3e',null);}
  };
  P.duvar_saati = function(c,w,h) {
    box(c,-w*0.22,-h*0.44,w*0.44,h*0.85,'#966647',OUT,2,6);
    ell(c,0,-h*0.15,w*0.29,w*0.29,'#d2aa6a',OUT,2);ell(c,0,-h*0.15,w*0.24,w*0.24,'#fff1cc',OUT,1);
    for(var i=0;i<12;i++){var a=i*PI/6;ell(c,Math.sin(a)*w*0.19,-h*0.15-Math.cos(a)*w*0.19,1,1,'#604732',null);}
    line(c,0,-h*0.15,-5,-h*0.15-6,'#4a4635',2);line(c,0,-h*0.15,7,-h*0.15,'#4a4635',1.5);
    var sw=Math.sin(S.t*3)*5;line(c,0,h*0.09,sw,h*0.29,'#e4c178',2);ell(c,sw,h*0.3,4,4,'#e4c178',OUT,1);
  };

  function cepheCiz(c, e) {
    var x=e.tx*T,y=e.ty*T,w=e.w*T,h=e.h*T;
    box(c,x,y,w,h,'#e1c49a',OUT,3,2);
    var roof=c.createLinearGradient(0,y,0,y+48);roof.addColorStop(0,'#b76449');roof.addColorStop(1,'#8d4939');
    box(c,x-4,y-3,w+8,48,roof,OUT,3,3);
    for(var i=0;i<w/24;i++)line(c,x+i*24,y+3,x+i*24,y+42,'#d58a64',1.5);
    for(i=1;i<=2;i++)line(c,x,y+i*15,x+w,y+i*15,'#783f32',2);
    for(i=0;i<8;i++){var wx=x+65+i*(w-130)/7;if(Math.abs(wx-(x+w/2))<110)continue;
      box(c,wx-24,y+66,48,47,'#6e9188',OUT,2.5,3);box(c,wx-18,y+71,36,34,'#b7d8cf','#edf0cb',2,2);
      line(c,wx,y+71,wx,y+106,'#fff0cd',3);line(c,wx-18,y+88,wx+18,y+88,'#fff0cd',3);
      box(c,wx-28,y+114,56,9,'#b17c57',OUT,1.5,2);
    }
    box(c,x+w/2-23,y+69,46,h-69,'#66877b',OUT,2.5,5);ell(c,x+w/2+12,y+111,3,3,'#e9c67d',OUT,1);
    box(c,x+w/2-118,y+47,236,24,'#fcf1d5',OUT,2,6);metin(c,e.ad,x+w/2,y+59,'bold 16px "Trebuchet MS", sans-serif','#6d503d');
    var gx=e.kapiTx*T,gy=e.kapiTy*T;
    box(c,gx-24,gy+6,96,32,'#698e7e',OUT,2.5,4);
    for(i=0;i<6;i++)line(c,gx-15+i*15,gy+10,gx-15+i*15,gy+34,'#a6bda0',3);
    line(c,gx+24,gy+7,gx+24,gy+37,OUT,2);asmaKilit(c,gx+24,gy+23,14,'#e3b866');
    metin(c,e.ad,gx+24,gy-3,'bold 13px "Trebuchet MS", sans-serif','#fff9de',OUT,3);
  }

  var UZUN = { bisiklet: 1, araba: 1 };
  var DAIRE = { saksi: 1, varil: 1, cop_kutusu: 1 };

  function agacCiz(c, e, x, y, w, h) {
    var cx = x + w / 2, cy = y + h / 2, r = Math.max(w, h) * 0.5 + 22;
    // gövde
    box(c, cx - 6, cy - 4, 12, 16, '#8b5a2b', OUT, 2.5, 3);
    // taç
    var blobs = [[0, 0, 1], [-.5, -.2, .7], [.5, -.25, .72], [-.3, .45, .7], [.42, .42, .68], [0, -.55, .65]];
    var i;
    for (i = 0; i < blobs.length; i++) ell(c, cx + blobs[i][0] * r * 0.62, cy - 10 + blobs[i][1] * r * 0.62, r * 0.46 * blobs[i][2] + 6, r * 0.46 * blobs[i][2] + 6, '#2f8f3a', OUT, 3);
    for (i = 0; i < blobs.length; i++) ell(c, cx + blobs[i][0] * r * 0.62, cy - 10 + blobs[i][1] * r * 0.62, r * 0.46 * blobs[i][2] + 2, r * 0.46 * blobs[i][2] + 2, i % 2 ? '#43b04b' : '#3aa244', null);
    for (i = 0; i < blobs.length; i++) ell(c, cx + blobs[i][0] * r * 0.62 - 6, cy - 16 + blobs[i][1] * r * 0.62, r * 0.2, r * 0.14, 'rgba(190,255,150,0.45)', null);
    for (i = 0; i < 5; i++) ell(c, cx + (hs(i, 4, 1) - .5) * r * 1.0, cy - 10 + (hs(i, 7, 2) - .5) * r * 1.0, 3, 3, '#ff5a4d', OUT, 1.2);
  }


  // EK-8: okul bahçesi / anons / arama noktası eşyaları (2D yedek çizim)
  P.havuz = function (c, w, h) {
    var x = -w/2, y = -h/2;
    box(c, x+1, y+1, w-2, h-2, '#b8b4a8', OUT, 3, 14);
    box(c, x+8, y+8, w-16, h-16, '#5cc2e8', '#3a8fb0', 2, 10);
    ell(c, 0, 0, w*0.12, h*0.12, '#bfe9f7', '#7cc7e0', 2);
    ell(c, -w*0.22, h*0.18, w*0.07, h*0.04, 'rgba(255,255,255,0.45)', null); ell(c, w*0.2, -h*0.18, w*0.06, h*0.035, 'rgba(255,255,255,0.45)', null);
  };
  P.kaydirak = function (c, w, h) {
    var uz = Math.max(w, h);
    box(c, -w/2+4, -h/2+2, w-8, h*0.2, '#c24a3a', OUT, 2.5, 4);
    box(c, -w*0.2, -h/2+h*0.18, w*0.4, h*0.62, '#4fb3b0', OUT, 2.5, 5);
    line(c, -w*0.1, -h/2+h*0.25, -w*0.1, h/2-h*0.08, 'rgba(255,255,255,0.5)', 3);
    box(c, -w*0.3, h/2-h*0.12, w*0.6, h*0.1, '#4fb3b0', OUT, 2, 3);
    for (var i = 0; i < 3; i++) line(c, -w*0.3, -h/2+h*0.12+i*6, w*0.3, -h/2+h*0.12+i*6, '#8a3328', 2);
  };
  P.okul_dolabi = function (c, w, h) {
    box(c, -w/2+6, -h/2+3, w-12, h-6, '#8aa3b8', OUT, 2.5, 4);
    line(c, 0, -h/2+6, 0, h/2-5, '#5e7487', 2);
    box(c, -w*0.16, -2, 3, 9, '#d8dde3', null, 0, 1); box(c, w*0.13, -2, 3, 9, '#d8dde3', null, 0, 1);
    for (var i = 0; i < 3; i++) line(c, -w*0.3, -h*0.3 + i*3.5, w*0.3, -h*0.3 + i*3.5, '#5e7487', 1.5);
  };
  P.kupa_vitrini = function (c, w, h) {
    box(c, -w/2+4, -h/2+3, w-8, h-6, '#7a5230', OUT, 2.5, 4);
    box(c, -w/2+8, -h/2+7, w-16, h*0.5, '#bfe3f2', '#5d7f8b', 1.5, 3);
    ell(c, -w*0.17, -h*0.08, 5, 4, '#f2c94c', OUT, 1.5); ell(c, w*0.17, -h*0.08, 5, 4, '#dfe3e8', OUT, 1.5);
    ell(c, 0, h*0.22, 4, 4, '#e4b83a', OUT, 1.2);
  };
  P.mudur_divani = function (c, w, h) {
    var x = -w/2, y = -h/2;
    box(c, x, y, w, h, '#5a3b2a', OUT, 3, 8);
    box(c, x+8, y+10, w-16, h-20, '#8b5a3c', OUT, 2, 6);
    box(c, x+8, y+16, w-16, 14, '#f4efe6', OUT, 2, 6);
    box(c, x+10, y+h*0.38, w-20, h*0.5, '#4a7fb5', OUT, 2, 5);
    metin(c, 'z z z', 0, y+h*0.35, 'bold 12px sans-serif', '#fff', '#2b3355', 3);
  };
  P.anons_mikrofonu = function (c, w, h) {
    box(c, -w/2+2, -h/2+4, w-4, h-8, '#3b3f47', OUT, 2.5, 4);
    box(c, -w*0.4, -4, w*0.45, 14, '#1f2329', OUT, 1.5, 3);
    ['#3fae4a', '#ffd93b', '#d9372b', '#3d8bff'].forEach(function (cl, i) { ell(c, -w*0.34 + i*7, 3, 2.2, 2.2, cl, null); });
    line(c, w*0.22, 4, w*0.22, -8, '#9aa0a8', 2.5); ell(c, w*0.22, -12, 4, 6, '#8a8f9a', OUT, 1.5);
    box(c, -w*0.1, -h/2+6, w*0.4, 6, '#d9372b', OUT, 1.2, 2);
  };
  P.kara_tahta = function (c, w, h) {
    box(c, -w/2+2, -h/2+6, w-4, h-14, '#8a5a2c', OUT, 2.5, 3);
    box(c, -w/2+7, -h/2+10, w-14, h-22, '#2f5b49', null, 0, 2);
    line(c, -w*0.35, -2, -w*0.05, -2, '#f2f2f2', 2); line(c, -w*0.35, 4, w*0.1, 4, '#ffd24a', 2);
    ell(c, w*0.3, 0, 6, 6, null, '#f2f2f2', 1.8);
  };
  P.okul_sirasi = function (c, w, h) {
    box(c, -w/2+3, -h/2+6, w-6, h-12, '#d9b27a', OUT, 2.5, 3);
    box(c, -w*0.34, -6, 14, 10, '#d9372b', OUT, 1.5, 2); box(c, w*0.06, -4, 12, 9, '#fff4cf', OUT, 1.5, 2);
    line(c, w*0.22, 6, w*0.38, 3, '#ffd24a', 2);
  };
  P.pota = function (c, w, h) {
    box(c, -w/2+8, -h/2+6, 8, h-12, '#6d7480', OUT, 2, 2);
    box(c, -w/2+14, -14, 6, 28, '#f2f2f2', OUT, 2, 1);
    box(c, -w/2+14, -6, 5, 12, '#d9372b', null, 0, 1);
    ell(c, w*0.2, 0, 5, 9, null, '#ff7a1a', 2.5);
  };
  P.bayrak_diregi = function (c, w, h) {
    ell(c, 0, h*0.28, w*0.26, h*0.16, '#9aa0a8', OUT, 2);
    line(c, 0, h*0.28, 0, -h*0.36, '#e8e8ea', 3.5);
    box(c, 1, -h*0.36, w*0.4, h*0.26, '#d9372b', OUT, 1.5, 1);
    ell(c, w*0.15, -h*0.23, 3.5, 3.5, '#fff', null);
  };
  P.seksek = function (c, w, h) {
    var x = -w/2, y = -h/2, sq = Math.min(w * 0.42, h * 0.2);
    var cl = ['#ffd24a', '#ff7aa8', '#6fd0ff', '#ffd24a', '#6fd0ff', '#ff7aa8', '#8fe08a'], i;
    var pos = [[0, 1.5], [-0.5, 0.75], [0.5, 0.75], [0, 0], [-0.5, -0.75], [0.5, -0.75], [0, -1.5]];
    for (i = 0; i < 7; i++) box(c, pos[i][0] * sq * 1.0 - sq * 0.5, pos[i][1] * sq * 1.0 - sq * 0.5, sq, sq, cl[i], '#ffffff', 2, 2);
  };
  P.kum_havuzu = function (c, w, h) {
    var x = -w/2, y = -h/2;
    box(c, x+2, y+2, w-4, h-4, '#b5793f', OUT, 3, 6);
    box(c, x+10, y+10, w-20, h-20, '#e8cf8e', '#c9ab62', 1.5, 4);
    ell(c, w*0.15, h*0.05, w*0.1, h*0.07, '#e6c987', '#c9ab62', 1.2);
    ell(c, -w*0.2, -h*0.12, 6, 5, '#d9372b', OUT, 1.5);
  };
  P.cesme = function (c, w, h) {
    ell(c, 0, 2, w*0.3, h*0.3, '#c8ccd2', OUT, 2.5); ell(c, 0, 2, w*0.2, h*0.2, '#7fd0ff', '#4aa7cf', 1.5);
    box(c, -2, -h*0.3, 4, h*0.22, '#7d868f', OUT, 1.5, 1);
  };
  P.hoparlor_direk = function (c, w, h) {
    ell(c, 0, 0, w*0.14, h*0.14, '#5b616b', OUT, 2);
    box(c, -w*0.34, -h*0.1, w*0.68, h*0.2, '#c9ced6', OUT, 2, 6);
    ell(c, -w*0.22, 0, 5, 6, '#2e3238', null); ell(c, w*0.22, 0, 5, 6, '#2e3238', null);
    ell(c, 0, 0, 3, 3, '#d9372b', OUT, 1);
  };
  P.okul_hoparlor = function (c, w, h) {
    box(c, -w*0.3, -h*0.36, w*0.6, h*0.62, '#ece9df', OUT, 2.5, 4);
    ell(c, 0, h*0.02, w*0.16, w*0.16, '#2e3238', OUT, 1.5); ell(c, 0, -h*0.2, w*0.08, w*0.08, '#2e3238', OUT, 1.2);
  };

  var golgeTur = { agac: 1 };
  function mobilyaCiz(c, e) {
    var tur = e.tur, x = e.tx * T, y = e.ty * T, w = (e.w || 1) * T, h = (e.h || 1) * T;
    // gölge
    c.fillStyle = 'rgba(20,30,20,0.28)';
    if (tur === 'agac') { ell(c, x + w / 2 + 8, y + h / 2 + 14, Math.max(w, h) * 0.5 + 24, Math.max(w, h) * 0.4 + 14, 'rgba(15,40,15,0.3)', null); }
    else if (DAIRE[tur] || tur === 'cali' || tur === 'saksi') ell(c, x + w / 2 + 3, y + h / 2 + 5, w / 2, h / 2 - 1, 'rgba(20,30,20,0.28)', null);
    else if (tur === 'bisiklet') ell(c, x + w / 2 + 3, y + h / 2 + 5, Math.max(w, h) * 0.45, 5, 'rgba(20,30,20,0.28)', null);
    else { rr(c, x + 3, y + 5, w, h, 6); c.fillStyle = 'rgba(20,30,20,0.26)'; c.fill(); }
    if (tur === 'agac') { agacCiz(c, e, x, y, w, h); return; }
    var fn = P[tur];
    c.save();
    c.translate(x + w / 2, y + h / 2);
    var lw = w, lh = h;
    if (UZUN[tur]) {
      if (h > w) c.rotate(PI / 2);
      if (e.yon === 2 || e.yon === 3) c.scale(-1, 1);
      lw = Math.max(w, h); lh = Math.min(w, h);
    } else if (!DAIRE[tur] && tur !== 'saksi' && tur !== 'cali' && tur !== 'varil') {
      var yon = ((e.yon | 0) % 4 + 4) % 4;
      if (yon & 1) { lw = h; lh = w; }
      c.rotate(yon * PI / 2);
    }
    if (!fn) fn = P.kutu;
    fn(c, lw, lh, e);
    if (tur === 'posta_kutusu' && e.ad === 'Ebe & Dede') {
      box(c,-42,h/2-5,84,18,'#fff1cf',OUT,1.5,4);
      metin(c,e.ad,0,h/2+4,'bold 11px sans-serif','#654c39');
    }
    c.restore();
  }

  // ---------- KAPILAR ----------
  var KILIT = { anahtar_mavi: '#2f7bff', anahtar_kirmizi: '#ee3b3b' };
  function asmaKilit(c, x, y, s, renk) {
    c.save(); c.translate(x, y);
    c.lineWidth = s * 0.18; c.strokeStyle = OUT; c.beginPath(); c.arc(0, -s * 0.12, s * 0.28, PI, 0); c.stroke();
    c.lineWidth = s * 0.1; c.strokeStyle = '#d9dde3'; c.beginPath(); c.arc(0, -s * 0.12, s * 0.28, PI, 0); c.stroke();
    box(c, -s * 0.4, -s * 0.12, s * 0.8, s * 0.62, renk, OUT, 2, 3);
    ell(c, 0, s * 0.14, s * 0.08, s * 0.08, OUT, null);
    c.fillStyle = OUT; c.fillRect(-s * 0.03, s * 0.14, s * 0.06, s * 0.18);
    c.restore();
  }
  function kapiCiz(c, k) {
    var x = k.tx * T, y = k.ty * T, kl = k.kilit ? KILIT[k.kilit] || '#ffb300' : null;
    var ahsap = '#a8672f', ahsapA = '#c98446';
    function pano(px, py, pw, ph, yat) {
      box(c, px, py, pw, ph, ahsap, OUT, 2.8, 3);
      c.strokeStyle = 'rgba(70,35,10,0.5)'; c.lineWidth = 1.5;
      c.beginPath();
      if (yat) { c.moveTo(px + pw * 0.33, py + 2); c.lineTo(px + pw * 0.33, py + ph - 2); c.moveTo(px + pw * 0.66, py + 2); c.lineTo(px + pw * 0.66, py + ph - 2); }
      else { c.moveTo(px + 2, py + ph * 0.33); c.lineTo(px + pw - 2, py + ph * 0.33); c.moveTo(px + 2, py + ph * 0.66); c.lineTo(px + pw - 2, py + ph * 0.66); }
      c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.22)'; if (yat) c.fillRect(px + 2, py + 2, pw - 4, 2); else c.fillRect(px + 2, py + 2, 2, ph - 4);
    }
    // pervaz (kasa)
    function kasa(yat) {
      c.fillStyle = '#5f4631';
      if (yat) { c.fillRect(x, y + 16, 5, 16); c.fillRect(x + T - 5, y + 16, 5, 16); c.strokeStyle = OUT; c.lineWidth = 2; c.strokeRect(x + 1, y + 17, 3, 14); c.strokeRect(x + T - 4, y + 17, 3, 14); }
      else { c.fillRect(x + 16, y, 16, 5); c.fillRect(x + 16, y + T - 5, 16, 5); c.strokeStyle = OUT; c.lineWidth = 2; c.strokeRect(x + 17, y + 1, 14, 3); c.strokeRect(x + 17, y + T - 4, 14, 3); }
    }
    if (k.yatay) {
      kasa(true);
      if (k.acik) {
        c.fillStyle = 'rgba(0,0,0,0.12)'; c.beginPath(); c.moveTo(x + 5, y + 24); c.arc(x + 5, y + 24, 38, -PI / 2, 0); c.closePath(); c.fill();
        pano(x + 2, y - 14, 8, 40, false);
        ell(c, x + 6, y - 8, 1.8, 1.8, '#f2d36b', OUT, 1);
      } else {
        pano(x + 5, y + 17, T - 10, 14, true);
        if (kl) { box(c, x + 15, y + 18, 18, 12, kl, null, 0, 3); asmaKilit(c, x + 24, y + 24, 15, kl); }
        else ell(c, x + T - 11, y + 24, 2.4, 2.4, '#f2d36b', OUT, 1.2);
      }
    } else {
      kasa(false);
      if (k.acik) {
        c.fillStyle = 'rgba(0,0,0,0.12)'; c.beginPath(); c.moveTo(x + 24, y + 5); c.arc(x + 24, y + 5, 38, 0, PI / 2); c.closePath(); c.fill();
        pano(x + 24 - 2, y + 2, 40, 8, true);
        ell(c, x + 24 + 34, y + 6, 1.8, 1.8, '#f2d36b', OUT, 1);
      } else {
        pano(x + 17, y + 5, 14, T - 10, false);
        if (kl) { box(c, x + 18, y + 15, 12, 18, kl, null, 0, 3); asmaKilit(c, x + 24, y + 24, 15, kl); }
        else ell(c, x + 24, y + T - 11, 2.4, 2.4, '#f2d36b', OUT, 1.2);
      }
    }
  }

  // ---------- İKONLAR ----------
  function ikon(c, tur, x, y, b) {
    b = b || 32;
    var lw = Math.max(1.5, b * 0.07), s = b / 32;
    c.save(); c.translate(x, y);
    c.lineJoin = 'round'; c.lineCap = 'round';
    if (tur === 'anahtar_mavi' || tur === 'anahtar_kirmizi' || tur === 'anahtar') {
      var col = tur === 'anahtar_kirmizi' ? '#ee3b3b' : (tur === 'anahtar' ? '#f2b632' : '#2f7bff');
      var dk = tur === 'anahtar_kirmizi' ? '#a31616' : (tur === 'anahtar' ? '#b07a10' : '#154db3');
      c.rotate(-0.6);
      // gövde
      c.lineWidth = lw * 3.6; c.strokeStyle = OUT; c.beginPath(); c.moveTo(-1 * s, 0); c.lineTo(14 * s, 0); c.stroke();
      c.lineWidth = lw * 1.8; c.strokeStyle = col; c.beginPath(); c.moveTo(-1 * s, 0); c.lineTo(14 * s, 0); c.stroke();
      // dişler
      c.fillStyle = col; c.strokeStyle = OUT; c.lineWidth = lw;
      [[8, 4], [13, 5]].forEach(function (d) { c.beginPath(); c.rect((d[0] - 1.8) * s, 0, 3.6 * s, d[1] * s); c.fill(); c.stroke(); });
      // halka
      ell(c, -8 * s, 0, 8 * s, 8 * s, col, OUT, lw * 1.2);
      ell(c, -8 * s, 0, 3.6 * s, 3.6 * s, '#fff6', OUT, lw);
      ell(c, -10 * s, -3 * s, 2.2 * s, 1.6 * s, 'rgba(255,255,255,0.7)', null);
    } else if (tur === 'top_hazine') {
      var r = 14 * s, cols = ['#ee3b3b', '#ffd23f', '#2f7bff', '#ffffff', '#58c05a', '#ff8a2b'];
      for (var i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, r, i * PI / 3 - PI / 2, (i + 1) * PI / 3 - PI / 2); c.closePath(); c.fillStyle = cols[i]; c.fill(); }
      c.lineWidth = lw * 0.7; c.strokeStyle = 'rgba(40,20,20,0.55)';
      for (i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(i * PI / 3 - PI / 2) * r, Math.sin(i * PI / 3 - PI / 2) * r); c.stroke(); }
      ell(c, 0, 0, r, r, null, OUT, lw * 1.4);
      ell(c, -r * 0.4, -r * 0.45, r * 0.28, r * 0.16, 'rgba(255,255,255,0.75)', null, 0, -0.7);
    } else if (tur === 'elma') {
      ell(c, -3.5 * s, 1.5 * s, 8.5 * s, 9.5 * s, '#e8352e', OUT, lw * 1.2); ell(c, 3.5 * s, 1.5 * s, 8.5 * s, 9.5 * s, '#e8352e', OUT, lw * 1.2);
      ell(c, 0, 1.5 * s, 10 * s, 9 * s, '#e8352e', null);
      ell(c, -5 * s, -2 * s, 2.6 * s, 3.8 * s, 'rgba(255,255,255,0.55)', null, 0, 0.5);
      line(c, 0, -6 * s, 1.5 * s, -12 * s, '#5a3a1a', lw * 1.6);
      c.beginPath(); c.ellipse(5 * s, -10 * s, 5 * s, 2.6 * s, -0.5, 0, PI * 2); fs(c, '#4dbb4a', OUT, lw);
    } else if (tur === 'teneke') {
      c.beginPath(); c.rect(-8 * s, -9 * s, 16 * s, 18 * s); fs(c, '#c7cdd4', OUT, lw * 1.2);
      c.fillStyle = '#e8503f'; c.fillRect(-8 * s, -3 * s, 16 * s, 8 * s); c.strokeStyle = OUT; c.lineWidth = lw; c.strokeRect(-8 * s, -3 * s, 16 * s, 8 * s);
      ell(c, 0, -9 * s, 8 * s, 3 * s, '#e3e8ed', OUT, lw);
      ell(c, 0, 9 * s, 8 * s, 3 * s, '#9aa2ab', OUT, lw);
      ell(c, 0, 1 * s, 2.5 * s, 2.5 * s, '#ffe14d', null);
      c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(-6 * s, -8 * s, 2 * s, 16 * s);
    } else if (tur === 'sihir_atilay') {
      ell(c, 0, 0, 14.5 * s, 14.5 * s, '#2f7de1', OUT, lw * 1.3);
      ell(c, -3 * s, -5 * s, 7 * s, 3.5 * s, 'rgba(255,255,255,0.25)', null, 0, -0.4);
      c.beginPath(); c.ellipse(0, 1 * s, 9 * s, 5.5 * s, 0, 0, PI * 2); fs(c, 'rgba(255,255,255,0.9)', OUT, lw * 0.9);
      ell(c, 0, 1 * s, 3.2 * s, 3.2 * s, '#3a2a8a', null); ell(c, 1 * s, 0, 1 * s, 1 * s, '#fff', null);
      c.strokeStyle = '#ffffff'; c.lineWidth = lw * 1.1; c.setLineDash([2.5 * s, 2.5 * s]); c.beginPath(); c.arc(0, 0, 11.5 * s, 0, PI * 2); c.stroke(); c.setLineDash([]);
      yildiz(c, 8 * s, -9 * s, 4.6 * s, '#ffe35a', OUT, lw * 0.7);
    } else if (tur === 'sihir_giray') {
      ell(c, 0, 0, 14.5 * s, 14.5 * s, '#5b3bc4', OUT, lw * 1.3);
      c.strokeStyle = '#8fd8ff'; c.lineWidth = lw * 1.4; c.beginPath(); c.arc(0, 0, 11 * s, 0, PI * 2); c.stroke();
      c.beginPath(); c.moveTo(2.5 * s, -10 * s); c.lineTo(-5 * s, 1.5 * s); c.lineTo(-0.5 * s, 1.5 * s); c.lineTo(-3 * s, 10 * s); c.lineTo(6 * s, -2.5 * s); c.lineTo(1 * s, -2.5 * s); c.closePath();
      fs(c, '#ffe35a', OUT, lw * 0.8);
    } else if (tur === 'gokce') {
      var gr = '#9b4fd6';
      ell(c, 0, 1 * s, 14.5 * s, 14 * s, gr, OUT, lw * 1.3);
      ell(c, 0, 3 * s, 10.5 * s, 9.5 * s, '#ffd2a8', OUT, lw);
      ell(c, -4 * s, 2 * s, 1.5 * s, 2 * s, '#222', null); ell(c, 4 * s, 2 * s, 1.5 * s, 2 * s, '#222', null);
      c.strokeStyle = '#8a3a2a'; c.lineWidth = lw * 0.8; c.beginPath(); c.arc(0, 5.5 * s, 3 * s, 0.25, PI - 0.25); c.stroke();
      ell(c, -7 * s, 6 * s, 2 * s, 1.3 * s, 'rgba(255,110,110,0.55)', null); ell(c, 7 * s, 6 * s, 2 * s, 1.3 * s, 'rgba(255,110,110,0.55)', null);
      c.beginPath(); c.ellipse(0, -4 * s, 14 * s, 10 * s, 0, PI, PI * 2); c.closePath(); fs(c, '#ffd23a', OUT, lw * 1.2);
      box(c, -14.5 * s, -6 * s, 29 * s, 5.5 * s, '#f5b81c', OUT, lw, 2 * s);
      ell(c, 0, -15 * s, 3.6 * s, 3.6 * s, '#fff6c8', OUT, lw);
      yildiz(c, 0, -9.5 * s, 4 * s, '#fff', '#c98a10', lw * 0.6);
    } else if (tur === 'dede' || tur === 'ebe') {
      ell(c, 0, 0, 15*s, 15*s, tur === 'dede' ? '#d6e8df' : '#eee0ef', OUT, lw);
      yasliBas(c, tur, 0, 2*s, s*0.82, false, false, false);
    } else if (tur === 'baba') {
      ell(c, 0, 1 * s, 14.5 * s, 14.5 * s, '#e6f1ec', OUT, lw * 1.3);
      ell(c, -12 * s, 1 * s, 3.4 * s, 5.4 * s, '#4b3627', OUT, lw); ell(c, 12 * s, 1 * s, 3.4 * s, 5.4 * s, '#4b3627', OUT, lw);
      ell(c, 0, 0, 11.6 * s, 11.8 * s, '#f5bb92', OUT, lw * 1.2);
      c.beginPath(); c.moveTo(-9.8 * s, -6.4 * s); c.quadraticCurveTo(-6 * s, -14 * s, 0, -13.2 * s); c.quadraticCurveTo(7 * s, -14 * s, 9.8 * s, -6.4 * s); c.quadraticCurveTo(5 * s, -9.6 * s, 0, -8.6 * s); c.quadraticCurveTo(-5 * s, -9.6 * s, -9.8 * s, -6.4 * s); c.closePath(); fs(c, '#4b3627', OUT, lw * 0.8);
      ell(c, -4.2 * s, -1 * s, 2.6 * s, 3 * s, '#fff', OUT, lw * 0.8); ell(c, 4.2 * s, -1 * s, 2.6 * s, 3 * s, '#fff', OUT, lw * 0.8);
      ell(c, -4 * s, -0.5 * s, 1.2 * s, 1.4 * s, '#222', null); ell(c, 4.4 * s, -0.5 * s, 1.2 * s, 1.4 * s, '#222', null);
      line(c, -7.5 * s, -5 * s, -1.8 * s, -4.2 * s, '#3a2618', lw * 1.2); line(c, 1.8 * s, -4.2 * s, 7.5 * s, -5 * s, '#3a2618', lw * 1.2);
      ell(c, 0, 3 * s, 3 * s, 2.5 * s, '#f08f7a', OUT, lw * 0.8);
      ell(c, -4.6 * s, 7 * s, 5.4 * s, 2.5 * s, '#3a2a1e', OUT, lw * 0.9, 0.3); ell(c, 4.6 * s, 7 * s, 5.4 * s, 2.5 * s, '#3a2a1e', OUT, lw * 0.9, -0.3);
      c.strokeStyle = '#9a5147'; c.lineWidth = lw * 0.8; c.beginPath(); c.arc(0, 9.4 * s, 2.6 * s, 0.2, PI - 0.2); c.stroke();
      c.beginPath(); c.moveTo(-9 * s, 11.5 * s); c.lineTo(0, 15 * s); c.lineTo(9 * s, 11.5 * s); c.lineTo(9 * s, 14.4 * s); c.lineTo(-9 * s, 14.4 * s); c.closePath(); fs(c, '#3fa34d', OUT, lw);
    } else if (tur === 'anne') {
      ell(c, 0, 1 * s, 14.5 * s, 14.5 * s, '#ffe3ef', OUT, lw * 1.3);
      ell(c, 0, -10.5 * s, 6 * s, 5.2 * s, '#6b422c', OUT, lw);
      ell(c, 0, 0, 13 * s, 12.6 * s, '#6b422c', OUT, lw);
      ell(c, 0, 2 * s, 10.6 * s, 10.4 * s, '#f7c3a0', OUT, lw * 1.1);
      c.beginPath(); c.moveTo(-10.6 * s, -1 * s); c.quadraticCurveTo(-6 * s, -10 * s, 0, -8.5 * s); c.quadraticCurveTo(6 * s, -10 * s, 10.6 * s, -1 * s); c.quadraticCurveTo(4 * s, -4.5 * s, 0, -3.5 * s); c.quadraticCurveTo(-5 * s, -5 * s, -10.6 * s, -1 * s); c.closePath(); fs(c, '#6b422c', OUT, lw * 0.8);
      ell(c, -4 * s, 2 * s, 2.4 * s, 3 * s, '#fff', OUT, lw * 0.7); ell(c, 4 * s, 2 * s, 2.4 * s, 3 * s, '#fff', OUT, lw * 0.7);
      ell(c, -3.8 * s, 2.4 * s, 1.2 * s, 1.5 * s, '#3a2418', null); ell(c, 4.2 * s, 2.4 * s, 1.2 * s, 1.5 * s, '#3a2418', null);
      line(c, -6.8 * s, 0.6 * s, -8.2 * s, -1 * s, OUT, lw * 0.8); line(c, 6.8 * s, 0.6 * s, 8.2 * s, -1 * s, OUT, lw * 0.8);
      ell(c, -7 * s, 6.5 * s, 2 * s, 1.3 * s, 'rgba(255,100,120,0.55)', null); ell(c, 7 * s, 6.5 * s, 2 * s, 1.3 * s, 'rgba(255,100,120,0.55)', null);
      c.strokeStyle = '#a8344a'; c.lineWidth = lw * 0.9; c.beginPath(); c.arc(0, 7 * s, 3 * s, 0.3, PI - 0.3); c.stroke();
      ell(c, 10 * s, -9 * s, 3 * s, 3 * s, '#ff7aa8', OUT, lw * 0.7); ell(c, 10 * s, -9 * s, 1.1 * s, 1.1 * s, '#ffe14d', null);
      ell(c, -12.8 * s, 6 * s, 1.6 * s, 1.6 * s, '#ffd84a', OUT, lw * 0.6); ell(c, 12.8 * s, 6 * s, 1.6 * s, 1.6 * s, '#ffd84a', OUT, lw * 0.6);
      c.beginPath(); c.moveTo(-8 * s, 12 * s); c.lineTo(0, 15.4 * s); c.lineTo(8 * s, 12 * s); c.lineTo(9 * s, 14.4 * s); c.lineTo(-9 * s, 14.4 * s); c.closePath(); fs(c, '#d6639a', OUT, lw);
    } else if (tur === 'cingirak') {
      line(c, 0, 4 * s, 0, 13 * s, '#ffb02e', lw * 2.2); ell(c, 0, 14 * s, 3 * s, 3 * s, '#00000000', '#4a90e2', lw);
      ell(c, 0, -3 * s, 9 * s, 9 * s, '#ff6b8f', OUT, lw * 1.2);
      c.fillStyle = '#ffd93b'; c.fillRect(-8 * s, -6 * s, 16 * s, 3 * s); c.fillStyle = '#4a90e2'; c.fillRect(-8 * s, -1 * s, 16 * s, 3 * s);
      ell(c, -3 * s, -6 * s, 1.6 * s, 1.6 * s, 'rgba(255,255,255,0.8)', null);
    } else if (tur === 'pelus') {
      ell(c, -7 * s, -7 * s, 4 * s, 4 * s, '#d9a066', OUT, lw); ell(c, 7 * s, -7 * s, 4 * s, 4 * s, '#d9a066', OUT, lw);
      ell(c, 0, 0, 11 * s, 10.5 * s, '#d9a066', OUT, lw * 1.2); ell(c, 0, 3.5 * s, 5 * s, 4 * s, '#f3d6a8', OUT, lw * 0.8);
      ell(c, 0, 1.6 * s, 1.8 * s, 1.3 * s, '#4a2f22', null); ell(c, -4 * s, -2.5 * s, 1.3 * s, 1.5 * s, '#4a2f22', null); ell(c, 4 * s, -2.5 * s, 1.3 * s, 1.5 * s, '#4a2f22', null);
    } else if (tur === 'oyuncak_top') {
      ell(c, 0, 0, 11 * s, 11 * s, '#ff6b6b', OUT, lw * 1.2);
      c.fillStyle = '#ffd66b'; c.fillRect(-10 * s, -2 * s, 20 * s, 4 * s); c.fillStyle = '#4dc3ff'; c.fillRect(-2 * s, -10 * s, 4 * s, 20 * s);
      ell(c, -4 * s, -5 * s, 2.4 * s, 2 * s, 'rgba(255,255,255,0.6)', null);
    } else if (tur === 'oyuncak_ordek') {
      ell(c, -1 * s, 4 * s, 11 * s, 8 * s, '#ffd926', OUT, lw * 1.2);
      ell(c, -8 * s, 5 * s, 4 * s, 4 * s, '#ffd926', OUT, lw);   // kuyruk
      ell(c, 5 * s, -5 * s, 6.5 * s, 6.5 * s, '#ffd926', OUT, lw * 1.2);
      c.beginPath(); c.ellipse(12 * s, -3 * s, 4.5 * s, 2.5 * s, 0.2, 0, PI * 2); fs(c, '#ff8a1c', OUT, lw);
      ell(c, 5 * s, -7 * s, 1.5 * s, 1.5 * s, OUT, null);
      ell(c, -2 * s, 5 * s, 5 * s, 3.2 * s, '#f2bf12', OUT, lw * 0.8, -0.3);
    } else if (tur === 'scooter') {
      c.scale(s * 0.62, s * 0.62); c.translate(0, 10);
      scooterGovde(c, (S.t || 0));
    } else if (tur === 'kurabiye') {
      ell(c, 0, 0, 12 * s, 12 * s, '#d9a15a', OUT, lw * 1.3);
      c.fillStyle = '#e8b878'; c.beginPath(); c.arc(-2 * s, -2 * s, 8 * s, 3.4, 5.6); c.lineWidth = 3 * s; c.strokeStyle = '#e8b878'; c.stroke();
      [[-4, -3], [4, -4], [-1, 3], [5, 4], [-7, 4]].forEach(function (p) { ell(c, p[0] * s, p[1] * s, 2.1 * s, 1.8 * s, '#4a2a18', null); });
      ell(c, 10 * s, -6 * s, 4 * s, 4 * s, '#00000000', null);
    } else {
      c.beginPath(); c.rect(-10 * s, -10 * s, 20 * s, 20 * s); fs(c, '#d9a45e', OUT, lw * 1.3);
      c.fillStyle = '#efd9a5'; c.fillRect(-3 * s, -10 * s, 6 * s, 20 * s);
      ell(c, 0, 0, 2 * s, 2 * s, '#a97a3c', null);
    }
    c.restore();
  }


  // ---------- SCOOTER ----------
  // yerel koordinat: zemin y=0, sağa bakıyor; teker merkezleri y=-6
  function scooterGovde(c, t) {
    var i;
    // arka çamurluk + deck
    box(c, -24, -15, 42, 7, '#e8392d', OUT, 2.2, 3);
    box(c, -22, -12.6, 36, 2.4, '#ffd23a', null, 0, 1);
    box(c, -26, -14, 7, 5, '#c92d22', OUT, 1.8, 2);
    // tekerlekler
    [-20, 21].forEach(function (wx) {
      ell(c, wx, -6, 6.4, 6.4, '#2b2b34', OUT, 2);
      ell(c, wx, -6, 2.8, 2.8, '#ffd23a', OUT, 1.2);
      var a = t * 9 + wx;
      line(c, wx + Math.cos(a) * 3.8, -6 + Math.sin(a) * 3.8, wx - Math.cos(a) * 3.8, -6 - Math.sin(a) * 3.8, 'rgba(255,255,255,0.45)', 1);
    });
    // gidon borusu
    line(c, 18, -12, 14, -44, OUT, 6); line(c, 18, -12, 14, -44, '#cfd6e0', 3.2);
    box(c, 15, -15, 7, 5, '#c92d22', OUT, 1.6, 2);
    // T gidon
    line(c, 8, -45, 21, -45, OUT, 6.5); line(c, 8, -45, 21, -45, '#e8392d', 3.6);
    ell(c, 7, -45, 3.6, 3.2, '#ffd23a', OUT, 1.6); ell(c, 22, -45, 3.6, 3.2, '#ffd23a', OUT, 1.6);
    ell(c, 14.5, -42, 2.2, 2.2, '#ffd23a', OUT, 1.2);
    for (i = 0; i < 3; i++) line(c, -10 + i * 8, -14.4, -7 + i * 8, -14.4, 'rgba(255,255,255,0.5)', 1.2);
  }
  function scooterDevrik(c, t) {
    var i;
    c.rotate(0.28);
    // deck (yukarıdan)
    box(c, -24, -5, 44, 10, '#e8392d', OUT, 2.2, 4);
    box(c, -21, -1.5, 38, 3, '#ffd23a', null, 0, 1);
    // tekerler (kenardan görünür)
    box(c, -33, -5, 9, 10, '#2b2b34', OUT, 2, 3); ell(c, -28.5, 0, 2, 2, '#ffd23a', null);
    box(c, 20, -5, 9, 10, '#2b2b34', OUT, 2, 3); ell(c, 24.5, 0, 2, 2, '#ffd23a', null);
    // yana yatmış gidon borusu + T
    line(c, 17, 0, 31, -17, OUT, 6.5); line(c, 17, 0, 31, -17, '#cfd6e0', 3.4);
    line(c, 23, -23, 40, -13, OUT, 6.5); line(c, 23, -23, 40, -13, '#e8392d', 3.6);
    ell(c, 22, -24, 3.4, 3.2, '#ffd23a', OUT, 1.5); ell(c, 41, -12.5, 3.4, 3.2, '#ffd23a', OUT, 1.5);
    // tekerde dönen küçük yıldızlar
    for (i = 0; i < 3; i++) {
      var a = t * 4 + i * 2.1, wx = i === 2 ? -28 : 24;
      yildiz(c, wx + Math.cos(a) * 11, Math.sin(a) * 7 - 8, 3 + (i % 2), i % 2 ? '#fff' : '#ffe35a', '#d19a12', 0.9);
    }
  }
  function scooterCiz(c, x, y, yon, devrik, t) {
    if (!isFinite(x) || !isFinite(y)) return;
    var b = bak(yon), sg = b.fx < -0.05 ? -1 : 1;
    c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
    ell(c, x, y + (devrik ? 3 : 2), devrik ? 36 : 29, devrik ? 9 : 6.5, 'rgba(10,20,10,0.3)', null);
    c.translate(x, y + (devrik ? -3 : 0)); c.scale(sg, 1);
    if (devrik) scooterDevrik(c, t); else scooterGovde(c, t);
    c.restore();
  }
  function scooterlar(c, d, h, t, v) {
    var sc = d && d.scooter;
    try {
      if (sc && isFinite(sc.x) && isFinite(sc.y)) {
        if (gorunur(sc.x, sc.y, 70, v)) scooterCiz(c, sc.x, sc.y, sc.yon == null ? 0 : sc.yon, !!sc.devrik, t);
      } else if (!d || !d.scooter) {
        var sy = h && h.scooterYeri;
        if (sy && isFinite(sy.x) && gorunur(sy.x, sy.y, 70, v)) scooterCiz(c, sy.x, sy.y, h.scooterYolu ? Math.atan2(h.scooterYolu.dy, h.scooterYolu.dx) : 0, false, t);
      }
    } catch (e) { console.error('scooter', e); }
  }
  function kalp(c, x, y, r, fill) {
    c.beginPath(); c.moveTo(x, y + r * 0.9);
    c.bezierCurveTo(x - r * 1.5, y - r * 0.2, x - r * 0.7, y - r * 1.3, x, y - r * 0.35);
    c.bezierCurveTo(x + r * 0.7, y - r * 1.3, x + r * 1.5, y - r * 0.2, x, y + r * 0.9);
    c.closePath(); fs(c, fill, '#8f1233', 1.4);
  }

  // ---------- KARAKTERLER ----------
  function bak(yon) {
    if (!isFinite(yon)) yon = PI / 2;
    return { fx: Math.cos(yon), fy: Math.sin(yon) };
  }
  function yildiz(c, x, y, R, fill, stroke, lw) {
    c.beginPath();
    for (var i = 0; i < 10; i++) { var a = -PI / 2 + i * PI / 5, rr_ = i % 2 ? R * 0.45 : R; c[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr_, y + Math.sin(a) * rr_); }
    c.closePath(); fs(c, fill, stroke, lw);
  }
  // yıldızlı sarı bere (ogeday() içinde, kafa merkezi hx,-33 koordinatında)
  function bere(c, hx, arka) {
    var t = S.t || 0;
    c.beginPath(); c.ellipse(hx, -38, 14.2, 10.5, 0, PI, PI * 2); c.closePath(); fs(c, '#ffd23a', OUT, 2.6);
    box(c, hx - 14.4, -40, 28.8, 6, '#f5b81c', OUT, 2.2, 3);
    c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(hx - 9, -46, 6, 2.4);
    ell(c, hx, -50, 4, 4, '#fff6c8', OUT, 1.8);
    if (!arka) yildiz(c, hx, -43.5, 4.4, '#fff', '#c98a10', 1.2);
    var ph = Math.sin(t * 6 + hx) ;
    yildiz(c, hx + 11, -52 + ph, 2.6, '#fff7a8', null); yildiz(c, hx - 12, -49 - ph, 1.9, '#fff', null);
  }
  function etiket(c, ad, x, y) {
    metin(c, String(ad), x, y, 'bold 12px "Trebuchet MS", Arial, sans-serif', '#fff', 'rgba(20,12,10,0.95)', 3.5);
  }
  function kardesCiz(c, k, d) {
    if (!k || k.gizli || !isFinite(k.x) || !isFinite(k.y)) return;
    var rn = k.renk || '#2f7de1';
    var t = (d && d.zaman) || S.t, al = Math.min(gorunmezAlfa(d && d.oyuncu, t), gorunmezAlfa(k, t));
    var kz = k.kaza, boy = (k.boy > 0 ? k.boy : 1);
    var op = { renk: rn, koyu: koyult(rn, 0.78), boy: boy, ad: k.ad }, hareket = !!k.hareket, yon = k.yon, ky = k.y, kx = k.x;
    c.save(); c.globalAlpha = al;
    if (kz === 'suruyor') {
      var b = bak(yon), sg = b.fx < -0.05 ? -1 : 1;
      if (!(d && d.scooter)) scooterCiz(c, k.x, k.y, yon, false, t);
      for (var i = 0; i < 5; i++) {
        var yy = k.y - 6 - i * 9, ln = 20 + (i % 2) * 10 + Math.sin(t * 30 + i * 2) * 4, st = -sg * (30 + ((t * 90 + i * 17) % 20));
        line(c, k.x + st, yy, k.x + st - sg * ln, yy, 'rgba(255,255,255,0.8)', 2.4);
      }
      op.scooterda = true; op.ruzgar = sg; op.agiz = true; hareket = false; yon = sg > 0 ? 0 : PI; ky = k.y - 11; kx = k.x - sg * 9;
    } else if (kz === 'dustu') {
      op.otur = true; op.agla = true; op.boy = boy * 0.92; hareket = false; yon = PI / 2;
    } else if (kz === 'iyilesti') {
      op.gulumse = true; op.kalp = true; hareket = false;
    }
    if (k.mikrofonda) { op.agiz = true; ky -= Math.abs(Math.sin(t*12))*2; }
    ogeday(c, { x: kx, y: ky, r: 14, yon: yon, hareket: hareket, adimFaz: k.adimFaz || 0, kosuyor: false }, d, op);
    c.restore();
    if (k.gorunmez > 0) parildar(c,k.x,k.y,t,3);
    if (k.mikrofonda) {
      c.save(); c.strokeStyle='#fff0a0'; c.lineWidth=2.5;
      for(var mi=0;mi<3;mi++){c.beginPath();c.arc(k.x+8,k.y-25,10+mi*8,-0.65,0.65);c.stroke();}
      c.restore();
    }
    if (k.konusma && k.konusma.metin) balon(c, { x: k.x, y: k.y - 4, durum: '', konusma: k.konusma }, d);
  }
  function kucukKitap(c, x, y, s, acik) {
    c.save(); c.translate(x, y); c.scale(s, s);
    box(c, -9, -6, 18, 12, '#3f7fd0', OUT, 1.8, 2);
    if (acik) { box(c, -8, -7, 8, 12, '#fffdf3', OUT, 1.3, 1.5); box(c, 0, -7, 8, 12, '#fffdf3', OUT, 1.3, 1.5); line(c, -6, -3, -2, -3, '#5b83d6', 1); line(c, 2, -3, 6, -3, '#5b83d6', 1); line(c, -6, 0, -2, 0, '#5b83d6', 1); line(c, 2, 0, 6, 0, '#5b83d6', 1); }
    else { box(c, -7, -4, 14, 8, '#fffdf3', OUT, 1.2, 1); line(c, -4, 0, 4, 0, '#d33', 1.2); }
    c.restore();
  }
  function gokceCiz(c, g, d) {
    if (!g || !isFinite(g.x) || !isFinite(g.y)) return;
    var t = (d && d.zaman) || S.t, dur = g.durum, rn = g.renk || '#9b4fd6';
    var zip = dur === 'bagiriyor' ? Math.abs(Math.sin(t * 7)) * 9 : 0;
    var calis = dur === 'calisiyor', kos = dur === 'kaciyor' || dur === 'eveDonuyor';
    if (kos) {
      var bb = bak(g.yon);
      for (var i = 0; i < 4; i++) {
        var yy = g.y - 8 - i * 9, ln = 16 + (i % 2) * 8 + Math.sin(t * 30 + i) * 3;
        line(c, g.x - bb.fx * 22, yy, g.x - bb.fx * (22 + ln), yy, 'rgba(255,255,255,0.75)', 2.4);
      }
    }
    var dil = dur === 'kaciyor' && Math.sin(t * 2.6) > 0.35;
    var yon = dil ? PI / 2 : g.yon;
    if (calis) yon = isFinite(g.yon) ? g.yon : -PI / 2;
    ogeday(c, { x: g.x, y: g.y, r: 14, yon: yon, hareket: !calis && (!!g.hareket || kos || dur === 'geliyor'), adimFaz: g.adimFaz || 0, kosuyor: kos || dur === 'geliyor' },
      d, { renk: rn, koyu: koyult(rn, 0.78), boy: 0.95, ad: calis ? null : (g.ad || 'Gökçe'), bere: true, zipla: zip, agiz: dur === 'bagiriyor' || (dur === 'kaciyor' && !dil), dil: dil, el: dur === 'bagiriyor' || dil, calis: calis });
    if (calis) {
      // başın üstünde küçük kitap simgesi (ara sıra sayfa çevirir) + uçuşan matematik işaretleri
      var sy = g.y - 64 - Math.sin(t * 2) * 1.5, acik = (t % 6) < 5.2;
      kucukKitap(c, g.x - 36, sy - 8, 0.9 + (acik ? 0 : 0.05), acik);
      if ((t % 6) > 5.2) { c.save(); c.globalAlpha = 0.9; line(c, g.x - 36, sy - 12, g.x - 24, sy - 24 - (t % 6 - 5.2) * 10, '#fffdf3', 3); c.restore(); }
      var ops = ['+', '−', '×', '÷', '=', '7'], rk = ['#e5483d', '#2f9a44', '#3f7fd0', '#a15fd0', '#f08a3b', '#e868a2'];
      for (var k = 0; k < 4; k++) {
        var ph = ((t * 0.45 + k * 0.25) % 1), fx2 = g.x + 14 + Math.sin(k * 2.1 + ph * 5) * 12 + k * 9, fy2 = g.y - 72 - ph * 34;
        c.save(); c.globalAlpha = Math.sin(ph * PI);
        metin(c, ops[(k + Math.floor(t * 0.45 + k * 0.25)) % ops.length], fx2, fy2, 'bold 15px "Trebuchet MS", Arial, sans-serif', rk[(k * 2 + Math.floor(t * 0.45 + k * 0.25)) % rk.length], 'rgba(20,12,10,0.9)', 3);
        c.restore();
      }
    }
    if (g.konusma && g.konusma.metin) balon(c, { x: g.x, y: g.y - (calis ? 30 : 6), durum: dur, konusma: g.konusma }, d);
  }
  function gorunmezAlfa(o, t) {
    var g = o && o.gorunmez;
    if (!(g > 0)) return 1;
    return g < 1.5 ? (Math.sin(t * 20) > 0 ? 0.55 : 0.12) : 0.3;
  }
  function parildar(c, x, y, t, n) {
    for (var i = 0; i < (n || 5); i++) {
      var a = t * 3 + i * PI * 2 / (n || 5), rx = 25, ry = 10;
      var px = x + Math.cos(a) * rx, py = y - 22 + Math.sin(a) * ry - Math.sin(t * 4 + i) * 5;
      yildiz(c, px, py, 3.2 + (i % 2) * 1.6, i % 2 ? '#fff' : '#bfe6ff', 'rgba(120,90,220,0.8)', 1);
    }
  }
  function efektCiz(c, e, t) {
    if (!e || !isFinite(e.x) || !isFinite(e.y)) return;
    var mx = e.omurMax > 0 ? e.omurMax : 1, p = 1 - Math.max(0, Math.min(mx, e.omur == null ? 0 : e.omur)) / mx, al = 1 - p, i;
    c.save(); c.globalAlpha = Math.max(0, Math.min(1, al * 1.2));
    if (e.tur === 'isinlanma') {
      var R = 12 + 62 * p;
      c.lineWidth = 6 * (1 - p) + 1.5; c.strokeStyle = '#8a5cff'; c.beginPath(); c.ellipse(e.x, e.y, R, R * 0.55, 0, 0, PI * 2); c.stroke();
      c.lineWidth = 2.5; c.strokeStyle = '#7fd4ff'; c.beginPath(); c.ellipse(e.x, e.y, R * 0.7, R * 0.4, 0, 0, PI * 2); c.stroke();
      var g = c.createLinearGradient(0, e.y - 90, 0, e.y);
      g.addColorStop(0, 'rgba(140,110,255,0)'); g.addColorStop(1, 'rgba(160,200,255,' + (0.5 * al) + ')');
      c.fillStyle = g; c.fillRect(e.x - 16 * (1 - p) - 3, e.y - 90, 32 * (1 - p) + 6, 90);
      for (i = 0; i < 10; i++) {
        var a = i * PI / 5 + p, rd = 14 + 58 * p;
        yildiz(c, e.x + Math.cos(a) * rd, e.y - 20 + Math.sin(a) * rd * 0.6 - p * 20, 4.5 * (1 - p * 0.5), i % 2 ? '#fff' : '#d9c4ff', '#6a48d8', 1);
      }
    } else {
      for (i = 0; i < 8; i++) {
        var b = i * PI / 4 + 0.4, d2 = 8 + 40 * p;
        yildiz(c, e.x + Math.cos(b) * d2, e.y - 18 + Math.sin(b) * d2 * 0.8 - p * 14, 4.2 * (1 - p * 0.6), i % 2 ? '#fff' : '#ffe35a', '#d19a12', 1);
      }
    }
    c.restore();
  }
  function koyult(hex, k) {
    var m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || '');
    if (!m) return '#333';
    return 'rgb(' + [1, 2, 3].map(function (i) { return Math.round(parseInt(m[i], 16) * k); }).join(',') + ')';
  }

  function ogeday(c, o, d, op) {
    op = op || {};
    var RC = op.renk || '#e63b2e', RD = op.koyu || '#c92d22', zip = op.zipla || 0;
    var r = o.r || 14, s = r / 14 * (op.boy || 1), f = o.adimFaz || 0, mv = !!o.hareket, kos = !!o.kosuyor, egik = !!o.egik;
    var sal = mv ? Math.sin(f) : 0, amp = kos ? 7 : 5;
    var b = bak(o.yon), fx = b.fx, fy = b.fy, arka = fy < -0.55;
    var bounce = (mv ? Math.abs(Math.sin(f)) * (kos ? 3 : 2) : 0) + zip;
    var tt = (d && d.zaman) || S.t || 0, otur = !!op.otur, scd = !!op.scooterda;
    if (scd) bounce = Math.abs(Math.sin(tt * 18)) * 1.2;
    ell(c, o.x, o.y + 5, 15 * s * (egik ? 1.05 : 1) * (1 - zip * 0.012), 7.5 * s, 'rgba(10,20,10,0.32)', null);
    c.save();
    c.translate(o.x, o.y + 7 * s);
    c.scale(s, s * (egik ? 0.74 : 1));
    if (kos) { c.rotate(fx * 0.16); for (var i = 0; i < 3; i++) line(c, -fx * 16 - 6, -10 - i * 9, -fx * 16 - 6 - fx * 10 - 2, -10 - i * 9, 'rgba(255,255,255,0.6)', 2); }
    c.translate(0, -bounce);
    if (scd) c.rotate(fx * 0.14);
    if (otur) c.translate(0, 5);
    if (op.calis) c.translate(0, 4);
    // bacaklar / ayakkabılar
    var lL = Math.max(0, sal) * 4, lR = Math.max(0, -sal) * 4;
    if (otur) {
      line(c, -6, -9, -17, -3, OUT, 9); line(c, -6, -9, -17, -3, '#2f4aa0', 6);
      line(c, 6, -9, 17, -3, OUT, 9); line(c, 6, -9, 17, -3, '#2f4aa0', 6);
      ell(c, -20, -2, 5.2, 3.6, '#ffffff', OUT, 1.8, -0.3); ell(c, 20, -2, 5.2, 3.6, '#ffffff', OUT, 1.8, 0.3);
      // dizde yara bandı
      c.save(); c.translate(-12, -6); c.rotate(-0.5);
      box(c, -4.5, -2.4, 9, 4.8, '#f3c9a0', '#9a6a40', 1, 1.5); box(c, -1.6, -2.4, 3.2, 4.8, '#e8a97a', null, 0, 0);
      c.restore();
    } else if (scd) {
      box(c, -12, -9, 7, 8, '#2f4aa0', OUT, 2, 2); box(c, 7, -9, 7, 8, '#2f4aa0', OUT, 2, 2);
      box(c, -14, -3, 9, 5.5, '#ffffff', OUT, 2, 3); box(c, 6, -3, 9, 5.5, '#ffffff', OUT, 2, 3);
    } else {
    box(c, -9, -9 - lL, 7, 8, '#2f4aa0', OUT, 2, 2);  box(c, 2, -9 - lR, 7, 8, '#2f4aa0', OUT, 2, 2);
    box(c, -10 + fx * 2, -3 - lL, 9, 5.5, '#ffffff', OUT, 2, 3); box(c, 1 + fx * 2, -3 - lR, 9, 5.5, '#ffffff', OUT, 2, 3);
    }
    // kollar
    var hy = sal * amp;
    c.lineCap = 'round';
    var lx = -13, ly1 = -13 + hy, ly2 = -11 + hy, rx = 13, ry1 = -13 - hy, ry2 = -11 - hy;
    if (op.el) { var w = Math.sin((d && d.zaman || S.t) * 14) * 5; lx = -17 - w * 0.4; ly1 = -34 + w; ly2 = -37 + w; rx = 17 + w * 0.4; ry1 = -34 - w; ry2 = -37 - w; }
    if (scd) { lx = fx * 22 - 3; ly1 = -30; ly2 = -31; rx = fx * 22 + 3; ry1 = -30; ry2 = -31; }
    if (op.calis) { var cw = Math.sin(tt * 9) * 2.2; lx = -11; ly1 = -38; ly2 = -50; rx = 11 + cw * 0.5; ry1 = -38; ry2 = -51 + cw * 0.6; }
    if (otur) { lx = -6; ly1 = -30; ly2 = -33; rx = 7; ry1 = -29; ry2 = -32; }
    line(c, -10, -21, lx, ly1, OUT, 8.5); line(c, -10, -21, lx, ly1, RC, 5.5);
    line(c, 10, -21, rx, ry1, OUT, 8.5); line(c, 10, -21, rx, ry1, RC, 5.5);
    ell(c, lx, ly2, 3.3, 3.3, '#ffd2a8', OUT, 1.8); ell(c, rx, ry2, 3.3, 3.3, '#ffd2a8', OUT, 1.8);
    if (op.calis) { line(c, rx + 1, ry2 - 1, rx - 1.5 + cw * 0.5, ry2 - 12, OUT, 4.4); line(c, rx + 1, ry2 - 1, rx - 1.5 + cw * 0.5, ry2 - 12, '#f2b632', 2.4); ell(c, rx - 1.5 + cw * 0.5, ry2 - 12.5, 1.6, 1.6, '#ff8fa6', OUT, 1); }
    // gövde
    box(c, -11, -25, 22, 18, RC, OUT, 2.6, 8);
    c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(-7, -23, 8, 3);
    if (!arka) { box(c, -6, -15, 12, 6, RD, 'rgba(70,10,10,0.7)', 1.3, 3); line(c, -2, -24, -2, -19, '#fff', 1.6); line(c, 2, -24, 2, -19, '#fff', 1.6); }
    // kafa (kapüşon)
    var hx = fx * 2.5;
    ell(c, hx, -33, 13.5, 12.8, RC, OUT, 2.8);
    ell(c, hx - 4, -39, 6, 3, 'rgba(255,255,255,0.28)', null, 0, -0.3);
    if (!arka) {
      var fcx = fx * 5.2, fcy = -31 + fy * 1.6;
      ell(c, fcx, fcy, 9.4, 8.6, '#ffd2a8', OUT, 1.9);
      var ec = 3.9 - Math.abs(fx) * 1.4, ey = fcy - 1;
      if (op.agla) {
        c.strokeStyle = '#222'; c.lineWidth = 1.7;
        c.beginPath(); c.moveTo(fcx - ec - 2.2, ey - 1.4); c.lineTo(fcx - ec + 1.6, ey + 0.2); c.lineTo(fcx - ec - 2.2, ey + 1.8); c.stroke();
        c.beginPath(); c.moveTo(fcx + ec + 2.2, ey - 1.4); c.lineTo(fcx + ec - 1.6, ey + 0.2); c.lineTo(fcx + ec + 2.2, ey + 1.8); c.stroke();
      } else if (op.gulumse) {
        c.strokeStyle = '#222'; c.lineWidth = 1.7;
        c.beginPath(); c.arc(fcx - ec, ey + 1.2, 2.1, PI + 0.3, PI * 2 - 0.3); c.stroke();
        c.beginPath(); c.arc(fcx + ec, ey + 1.2, 2.1, PI + 0.3, PI * 2 - 0.3); c.stroke();
      } else {
      ell(c, fcx - ec + fx * 1.6, ey, 1.9, 2.5, '#222', null); ell(c, fcx + ec + fx * 1.6, ey, 1.9, 2.5, '#222', null);
      ell(c, fcx - ec + fx * 1.6 + 0.5, ey - 0.8, 0.7, 0.8, '#fff', null); ell(c, fcx + ec + fx * 1.6 + 0.5, ey - 0.8, 0.7, 0.8, '#fff', null);
      }
      if (op.gulumse) { c.fillStyle = '#7a1f2a'; c.strokeStyle = OUT; c.lineWidth = 1.2; c.beginPath(); c.arc(fcx + fx * 1.6, fcy + 2.2, 3.6, 0.05, PI - 0.05); c.closePath(); c.fill(); c.stroke(); }
      else if (!op.agla) { c.strokeStyle = '#8a3a2a'; c.lineWidth = 1.4; c.beginPath(); c.arc(fcx + fx * 1.6, fcy + 2.2, 2.6, 0.25, PI - 0.25); c.stroke(); }
      if (op.agla) {
        var wob = Math.sin(tt * 16) * 0.6;
        c.fillStyle = '#7a1f2a'; c.strokeStyle = OUT; c.lineWidth = 1.3;
        c.beginPath(); c.ellipse(fcx + fx * 1.6, fcy + 4.4, 3.6, 2.6 + Math.abs(Math.sin(tt * 9)) * 1.6, 0, 0, PI * 2); c.fill(); c.stroke();
        // gözyaşları: iki gözden akan damlalar
        for (var gi = 0; gi < 6; gi++) {
          var side = gi % 2 ? 1 : -1, ph = (tt * 1.3 + gi * 0.37) % 1, gx = fcx + side * (ec + 2.5 + ph * 9) + wob;
          var gy = ey + 1 + ph * 17;
          c.globalAlpha = (c.globalAlpha || 1) * 1;
          c.save(); c.globalAlpha *= (1 - ph * 0.6);
          c.beginPath(); c.moveTo(gx, gy - 4.4); c.quadraticCurveTo(gx + 3.6, gy + 1, gx, gy + 2.8); c.quadraticCurveTo(gx - 3.6, gy + 1, gx, gy - 4.4);
          c.fillStyle = '#4ab4ff'; c.fill(); c.strokeStyle = '#0d5fb0'; c.lineWidth = 1.1; c.stroke(); c.restore();
        }
        ell(c, fcx - ec, ey + 2.6, 2, 1.2, 'rgba(90,192,255,0.6)', null); ell(c, fcx + ec, ey + 2.6, 2, 1.2, 'rgba(90,192,255,0.6)', null);
      }
      if (op.dil) { c.beginPath(); c.moveTo(fcx + fx * 1.6 - 2.4, fcy + 3.4); c.lineTo(fcx + fx * 1.6 + 2.4, fcy + 3.4); c.lineTo(fcx + fx * 1.6 + 2.2, fcy + 8 + Math.sin(((d && d.zaman) || S.t) * 18) * 1.2); c.quadraticCurveTo(fcx + fx * 1.6, fcy + 10.5, fcx + fx * 1.6 - 2.2, fcy + 8); c.closePath(); fs(c, '#ff6b8a', OUT, 1.3); line(c, fcx + fx * 1.6, fcy + 4, fcx + fx * 1.6, fcy + 8, 'rgba(120,20,40,0.6)', 0.9); }
      if (op.agiz) ell(c, fcx + fx * 1.6, fcy + 3.6, 3.4, 3.2 + Math.abs(Math.sin((d && d.zaman || S.t) * 10)) * 1.2, '#7a1f2a', OUT, 1.4);
      ell(c, fcx - ec - 1.5 + fx * 1.4, fcy + 2.2, 1.7, 1.1, 'rgba(255,110,110,0.55)', null); ell(c, fcx + ec + 1.5 + fx * 1.4, fcy + 2.2, 1.7, 1.1, 'rgba(255,110,110,0.55)', null);
    } else {
      c.strokeStyle = 'rgba(80,10,10,0.6)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(hx, -44); c.lineTo(hx, -30); c.stroke();
    }
    if (op.bere) bere(c, hx, arka);
    if (op.ruzgar) {
      var rg = op.ruzgar;
      for (var ri = 0; ri < 3; ri++) {
        var wv = Math.sin(tt * 25 + ri * 1.7) * 3, ry0 = -37 + ri * 4;
        c.beginPath(); c.moveTo(hx - rg * 11, ry0); c.quadraticCurveTo(hx - rg * 20, ry0 + wv - 2, hx - rg * (28 + ri * 2), ry0 + wv * 1.4);
        c.lineWidth = 4.2; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 2.4; c.strokeStyle = RC; c.stroke();
      }
    }
    if (otur) {
      // başın çevresinde dönen yıldızlar
      for (var si = 0; si < 4; si++) {
        var sa = tt * 3.2 + si * PI / 2;
        yildiz(c, hx + Math.cos(sa) * 17, -50 + Math.sin(sa) * 4.5, 3.4 + (si % 2) * 1.2, si % 2 ? '#fff6a8' : '#ffd23a', '#c98a10', 1);
      }
    }
    if (op.kalp) {
      var kp = (tt * 0.8) % 1;
      kalp(c, hx + 13, -52 - Math.sin(tt * 4) * 2, 5.2, '#ff5a7a');
      c.save(); c.globalAlpha *= (1 - kp); kalp(c, hx - 12, -50 - kp * 14, 3.4, '#ff8fa6'); c.restore();
    }
    c.restore();
    if (op.ad) etiket(c, op.ad, o.x, o.y + 7 * s - bounce * s * (egik ? 0.74 : 1) - ((op.bere ? 64 : 53) + ((op.kalp || otur) ? 11 : 0)) * s * (egik ? 0.74 : 1));
  }
  function babaCiz(c, n, d) {
    var r = n.r || 17, s = r / 17, f = n.adimFaz || 0, mv = !!n.hareket;
    var dur = n.durum || 'devriye', yor = dur === 'yorgun', t0 = (d && d.zaman) || S.t;
    var sal = mv ? Math.sin(f) : 0, amp = dur === 'kovalama' ? 7 : 5;
    var b = bak(n.yon), fx = b.fx, fy = b.fy, arka = fy < -0.55;
    var bounce = mv ? Math.abs(Math.sin(f)) * (dur === 'kovalama' ? 3.5 : 2) : 0;
    ell(c, n.x, n.y + 6, 21 * s, 9 * s, 'rgba(10,20,10,0.34)', null);
    c.save();
    c.translate(n.x, n.y + 8 * s);
    c.scale(s, s);
    if (yor) c.rotate(Math.sin(t0 * 1.6) * 0.07);
    if (dur === 'kovalama') c.rotate(fx * 0.12);
    c.translate(0, -bounce);
    var lL = Math.max(0, sal) * 4, lR = Math.max(0, -sal) * 4;
    // bacak + ayakkabı
    box(c, -11, -11 - lL, 9, 9, '#4a4f66', OUT, 2.2, 2); box(c, 2, -11 - lR, 9, 9, '#4a4f66', OUT, 2.2, 2);
    box(c, -13 + fx * 2, -4 - lL, 12, 7, '#5a3b25', OUT, 2.2, 4); box(c, 1 + fx * 2, -4 - lR, 12, 7, '#5a3b25', OUT, 2.2, 4);
    // kollar
    var hy = sal * amp, kd = dur === 'kovalama' ? -5 : 0;
    line(c, -15, -28, -19, -17 + hy + kd, OUT, 11); line(c, -15, -28, -19, -17 + hy + kd, '#f4f1e6', 8);
    line(c, 15, -28, 19, -17 - hy + kd, OUT, 11); line(c, 15, -28, 19, -17 - hy + kd, '#f4f1e6', 8);
    ell(c, -19, -14 + hy + kd, 4.4, 4.4, '#f0b088', OUT, 1.9); ell(c, 19, -14 - hy + kd, 4.4, 4.4, '#f0b088', OUT, 1.9);
    // gövde: gömlek + yelek
    box(c, -16, -33, 32, 28, '#f4f1e6', OUT, 2.8, 11);
    box(c, -12.5, -33, 25, 28, '#3fa34d', OUT, 2.4, 9);
    if (!arka) {
      line(c, 0, -32, 0, -7, 'rgba(10,60,20,0.65)', 1.8);
      ell(c, -3.5, -22, 1.8, 1.8, '#f2d36b', OUT, 1); ell(c, -3.5, -14, 1.8, 1.8, '#f2d36b', OUT, 1);
      c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(-9, -31, 7, 4);
    } else { c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(-9, -31, 18, 4); }
    // kafa
    var hcx = fx * 1.5, hcy = -44;
    var sc = '#4b3627';
    // yan saçlar (kulak hizası)
    ell(c, hcx - 13.5, hcy + 1, 4.6, 7, sc, OUT, 1.8); ell(c, hcx + 13.5, hcy + 1, 4.6, 7, sc, OUT, 1.8);
    ell(c, hcx - 14.5, hcy + 5.5, 3.2, 2.8, sc, OUT, 1.4); ell(c, hcx + 14.5, hcy + 5.5, 3.2, 2.8, sc, OUT, 1.4);
    ell(c, hcx, hcy, 14.2, 13.6, '#f5bb92', OUT, 2.9);
    if (arka) {
      ell(c, hcx, hcy + 7, 11, 5.5, sc, OUT, 1.8);
      ell(c, hcx - 1, hcy - 4, 8, 4.6, 'rgba(255,255,255,0.45)', null, 0, -0.3);
    } else {
      ell(c, hcx, hcy - 10.2, 13.2, 4.8, sc, OUT, 2.2);
      ell(c, hcx + 3.5, hcy - 11.8, 7.5, 2.6, '#5f4531', null, 0, -0.25);
      ell(c, hcx - 6, hcy - 11, 4, 1.4, 'rgba(255,255,255,0.16)', null, 0, -0.3);
      var kizgin = dur === 'kovalama', supheli = dur === 'suphe' || dur === 'arama';
      var fcx = hcx + fx * 5, ec = 5.6 - Math.abs(fx) * 2, ey = hcy + 1 + fy * 1.2;
      var ew = kizgin ? 3.3 : 3.6, eh = kizgin ? 3 : 4.2;
      ell(c, fcx - ec, ey, ew, eh, '#fff', OUT, 1.6); ell(c, fcx + ec, ey, ew, eh, '#fff', OUT, 1.6);
      var pd = supheli ? Math.sin((d && d.zaman || S.t) * 3) * 1.1 : 0;
      ell(c, fcx - ec + fx * 1.3 + pd, ey + 0.4 + fy * 0.8, 1.7, 1.9, '#222', null); ell(c, fcx + ec + fx * 1.3 + pd, ey + 0.4 + fy * 0.8, 1.7, 1.9, '#222', null);
      if (yor) { kapak(c, fcx - ec, ey, ew, eh, '#f5bb92'); kapak(c, fcx + ec, ey, ew, eh, '#f5bb92'); }
      var bk = '#4a4038', by = ey - eh - 2;
      if (yor) { line(c, fcx - ec - 3.5, by + 2.6, fcx - ec + 3.5, by + 0.5, bk, 2.6); line(c, fcx + ec - 3.5, by + 0.5, fcx + ec + 3.5, by + 2.6, bk, 2.6); }
      else if (kizgin) { line(c, fcx - ec - 4, by - 2, fcx - ec + 4, by + 2.8, bk, 3); line(c, fcx + ec + 4, by - 2, fcx + ec - 4, by + 2.8, bk, 3); }
      else if (supheli) { line(c, fcx - ec - 3.5, by + 1.2, fcx - ec + 3.5, by - 1, bk, 2.8); line(c, fcx + ec - 3.5, by - 3.2, fcx + ec + 3.5, by - 1.4, bk, 2.8); }
      else if (dur === 'yakaladi') { line(c, fcx - ec - 3, by + 1.5, fcx - ec + 3, by - 0.5, bk, 2.6); line(c, fcx + ec - 3, by - 0.5, fcx + ec + 3, by + 1.5, bk, 2.6); }
      else { line(c, fcx - ec - 3.5, by + 1, fcx - ec + 3.5, by, bk, 2.6); line(c, fcx + ec - 3.5, by, fcx + ec + 3.5, by + 1, bk, 2.6); }
      // burun
      ell(c, fcx, hcy + 6, 4.3, 3.8, '#f08f7a', OUT, 1.8);
      // ağız
      if (kizgin) ell(c, fcx, hcy + 14.5, 4.6, 3.2, '#5a1a1a', OUT, 1.6);
      else if (yor) { var yw = Math.max(0.25, Math.sin(t0 * 1.3) * 0.5 + 0.6); ell(c, fcx, hcy + 15, 3.6 + yw * 1.8, 2 + yw * 4.2, '#5a1a1a', OUT, 1.6); ell(c, fcx, hcy + 15 + yw * 2.6, 2.4 + yw, 1.4 + yw * 1.4, '#e9707a', null); }
      // bıyık
      var bc = '#3a2a1e';
      ell(c, fcx - 6.2, hcy + 10.8, 7, 3.6, bc, OUT, 1.9, 0.35); ell(c, fcx + 6.2, hcy + 10.8, 7, 3.6, bc, OUT, 1.9, -0.35);
      ell(c, fcx - 11.5, hcy + 12.8, 2.6, 2.6, bc, OUT, 1.6); ell(c, fcx + 11.5, hcy + 12.8, 2.6, 2.6, bc, OUT, 1.6);
      c.strokeStyle = '#9a5147'; c.lineWidth = 1.5; c.beginPath(); c.arc(fcx, hcy + 13.2, 3.2, 0.2, PI - 0.2); c.stroke();
    }
    c.restore();
    etiket(c, 'Baba', n.x, n.y + 8 * s - bounce * s - 67 * s);
  }
  // ---------- ANNE ----------
  function bigudi(c, x, y, rot, renk) {
    c.save(); c.translate(x, y); c.rotate(rot);
    rr(c, -6, -3.6, 12, 7.2, 3.4); fs(c, renk, OUT, 1.8);
    c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(-4, -2.4, 6, 1.6);
    line(c, -2, -3, -2, 3, 'rgba(60,30,50,0.35)', 1); line(c, 2, -3, 2, 3, 'rgba(60,30,50,0.35)', 1);
    c.restore();
  }
  function anneCiz(c, n, d) {
    var r = n.r || 17, s = r / 17, f = n.adimFaz || 0, mv = !!n.hareket;
    var dur = n.durum || 'devriye', yor = dur === 'yorgun', t0 = (d && d.zaman) || S.t;
    var sal = mv ? Math.sin(f) : 0, amp = dur === 'kovalama' ? 7 : 5;
    var b = bak(n.yon), fx = b.fx, fy = b.fy, arka = fy < -0.55;
    var bounce = mv ? Math.abs(Math.sin(f)) * (dur === 'kovalama' ? 3.5 : 2) : 0;
    var SK = '#f7c3a0', HAIR = '#7a4a2c', HAIRD = '#5c3519', DR = '#d6639a', DRD = '#a8407a', AP = '#fff3e0';
    ell(c, n.x, n.y + 6, 21 * s, 9 * s, 'rgba(10,20,10,0.34)', null);
    c.save();
    c.translate(n.x, n.y + 8 * s);
    c.scale(s, s);
    if (dur === 'kovalama') c.rotate(fx * 0.12);
    if (yor) c.rotate(Math.sin(t0 * 1.6) * 0.07);
    c.translate(0, -bounce);
    var lL = Math.max(0, sal) * 4, lR = Math.max(0, -sal) * 4;
    // bacaklar + pofuduk terlikler
    box(c, -8, -12 - lL, 6, 9, SK, OUT, 2, 2); box(c, 2, -12 - lR, 6, 9, SK, OUT, 2, 2);
    ell(c, -6 + fx * 2, -2 - lL, 7.5, 5.2, '#ff9ec7', OUT, 2.2); ell(c, 6 + fx * 2, -2 - lR, 7.5, 5.2, '#ff9ec7', OUT, 2.2);
    ell(c, -8 + fx * 2, -4 - lL, 2.4, 1.6, '#ffd0e4', null); ell(c, 4 + fx * 2, -4 - lR, 2.4, 1.6, '#ffd0e4', null);
    // kollar (kısa kollu elbise)
    var hy = sal * amp, kd = dur === 'kovalama' ? -9 : (yor ? -4 : 0);
    line(c, -14, -28, -18, -17 + hy + kd, OUT, 10); line(c, -14, -28, -18, -17 + hy + kd, SK, 7);
    line(c, 14, -28, 18, -17 - hy + kd, OUT, 10); line(c, 14, -28, 18, -17 - hy + kd, SK, 7);
    ell(c, -18, -14 + hy + kd, 4.2, 4.2, SK, OUT, 1.9); ell(c, 18, -14 - hy + kd, 4.2, 4.2, SK, OUT, 1.9);
    // elbise (A kesim) + etek kıvrımı
    c.beginPath(); c.moveTo(-14, -34); c.lineTo(14, -34); c.quadraticCurveTo(17, -20, 20, -9); c.quadraticCurveTo(0, -4, -20, -9); c.quadraticCurveTo(-17, -20, -14, -34); c.closePath();
    fs(c, DR, OUT, 2.7);
    c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(-10, -32, 7, 4);
    // elbise puantiyeleri
    for (var q = 0; q < 6; q++) ell(c, -12 + hs(q, 3, 1) * 24, -30 + hs(q, 5, 2) * 20, 1.4, 1.4, 'rgba(255,255,255,0.55)', null);
    if (!arka) {
      // önlük
      c.beginPath(); c.moveTo(-8, -30); c.lineTo(8, -30); c.quadraticCurveTo(12, -19, 14, -8); c.quadraticCurveTo(0, -5, -14, -8); c.quadraticCurveTo(-12, -19, -8, -30); c.closePath();
      fs(c, AP, OUT, 2.2);
      line(c, -7, -30, -12, -34, 'rgba(120,60,90,0.8)', 1.6); line(c, 7, -30, 12, -34, 'rgba(120,60,90,0.8)', 1.6);
      box(c, -5, -17, 10, 7, '#ffd6e8', 'rgba(120,60,90,0.8)', 1.4, 2);
      ell(c, 0, -13.5, 1.8, 1.8, '#e8506a', null);
    } else { line(c, -8, -22, 8, -22, 'rgba(120,60,90,0.9)', 2); ell(c, 0, -21.5, 3, 3, '#fff3e0', OUT, 1.4); }
    // kafa
    var hcx = fx * 1.5, hcy = -44;
    // arka saç + topuz
    ell(c, hcx, hcy - 1, 15.2, 14.8, HAIR, OUT, 2.6);
    ell(c, hcx, hcy - 18, 8.2, 7.2, HAIR, OUT, 2.4);
    ell(c, hcx - 2, hcy - 20.5, 3.2, 1.8, 'rgba(255,220,180,0.4)', null, 0, -0.4);
    line(c, hcx - 7, hcy - 15.5, hcx + 7, hcy - 15.5, '#ff6fa8', 2.6);
    if (!arka) {
      ell(c, hcx, hcy + 1.5, 12.8, 12.2, SK, OUT, 2.5);
      // yüzü çerçeveleyen uzun tutamlar
      ell(c, hcx - 12.6, hcy + 5.5, 3.2, 8.6, HAIRD, OUT, 1.4, -0.08);
      ell(c, hcx + 12.6, hcy + 5.5, 3.2, 8.6, HAIRD, OUT, 1.4, 0.08);
      // kâkül
      c.beginPath(); c.moveTo(hcx - 13, hcy - 3); c.quadraticCurveTo(hcx - 8, hcy - 14, hcx, hcy - 12); c.quadraticCurveTo(hcx + 8, hcy - 14, hcx + 13, hcy - 3);
      c.quadraticCurveTo(hcx + 7, hcy - 7, hcx + 2, hcy - 5.5); c.quadraticCurveTo(hcx - 5, hcy - 8, hcx - 13, hcy - 3); c.closePath();
      fs(c, HAIR, OUT, 1.8);
      // yandan dalgalı tutamlar + çiçek toka + küpe
      ell(c, hcx - 13, hcy + 5, 3.4, 8.5, HAIRD, null, 0, -0.15);
      ell(c, hcx + 13, hcy + 5, 3.4, 8.5, HAIRD, null, 0, 0.15);
      ell(c, hcx - 8, hcy - 10, 4.4, 2, '#98613f', null, 0, -0.35);
      ell(c, hcx + 10, hcy - 9, 3.2, 3.2, '#ff7aa8', OUT, 1.1);
      ell(c, hcx + 10, hcy - 9, 1.2, 1.2, '#ffe14d', null);
      ell(c, hcx - 14.5, hcy + 7, 1.7, 1.7, '#ffd84a', OUT, 0.8);
      ell(c, hcx + 14.5, hcy + 7, 1.7, 1.7, '#ffd84a', OUT, 0.8);
      // yüz
      var fcx = hcx + fx * 4.6, ec = 4.9 - Math.abs(fx) * 1.6, ey = hcy + 1 + fy * 1.1;
      var kizgin = dur === 'kovalama', supheli = dur === 'suphe' || dur === 'arama', yak = dur === 'yakaladi';
      var ew = kizgin ? 3.1 : 3.4, eh = kizgin ? 3.2 : 4.2;
      ell(c, fcx - ec, ey, ew, eh, '#fff', OUT, 1.5); ell(c, fcx + ec, ey, ew, eh, '#fff', OUT, 1.5);
      var pd = supheli ? Math.sin(t0 * 3) * 1.1 : 0;
      ell(c, fcx - ec + fx * 1.2 + pd, ey + 0.4 + fy * 0.8, 1.7, 2, '#3a2418', null); ell(c, fcx + ec + fx * 1.2 + pd, ey + 0.4 + fy * 0.8, 1.7, 2, '#3a2418', null);
      ell(c, fcx - ec + fx * 1.2 + pd + 0.5, ey - 0.4, 0.6, 0.7, '#fff', null); ell(c, fcx + ec + fx * 1.2 + pd + 0.5, ey - 0.4, 0.6, 0.7, '#fff', null);
      // kirpikler
      line(c, fcx - ec - ew, ey - 1, fcx - ec - ew - 2.4, ey - 3, OUT, 1.4); line(c, fcx + ec + ew, ey - 1, fcx + ec + ew + 2.4, ey - 3, OUT, 1.4);
      if (yor) { kapak(c, fcx - ec, ey, ew, eh, SK); kapak(c, fcx + ec, ey, ew, eh, SK); }
      var bk = '#4a2a14', by = ey - eh - 2.4;
      if (yor) { line(c, fcx - ec - 3.5, by + 2.4, fcx - ec + 3.5, by + 0.4, bk, 2.2); line(c, fcx + ec - 3.5, by + 0.4, fcx + ec + 3.5, by + 2.4, bk, 2.2); }
      else if (kizgin) { line(c, fcx - ec - 4, by - 2, fcx - ec + 4, by + 2.8, bk, 2.8); line(c, fcx + ec + 4, by - 2, fcx + ec - 4, by + 2.8, bk, 2.8); }
      else if (supheli) { line(c, fcx - ec - 3.5, by + 1.2, fcx - ec + 3.5, by - 1, bk, 2.4); line(c, fcx + ec - 3.5, by - 3.2, fcx + ec + 3.5, by - 1.4, bk, 2.4); }
      else if (yak) { line(c, fcx - ec - 3, by + 1.5, fcx - ec + 3, by - 0.5, bk, 2.2); line(c, fcx + ec - 3, by - 0.5, fcx + ec + 3, by + 1.5, bk, 2.2); }
      else { line(c, fcx - ec - 3.5, by + 1, fcx - ec + 3.5, by, bk, 2.2); line(c, fcx + ec - 3.5, by, fcx + ec + 3.5, by + 1, bk, 2.2); }
      // burun, yanak
      ell(c, fcx, hcy + 5.2, 2.2, 1.7, '#f09a85', OUT, 1.2);
      ell(c, fcx - ec - 1.5, hcy + 6.2, 2.2, 1.4, 'rgba(255,100,120,0.5)', null); ell(c, fcx + ec + 1.5, hcy + 6.2, 2.2, 1.4, 'rgba(255,100,120,0.5)', null);
      // ağız
      if (kizgin) ell(c, fcx, hcy + 10, 4.2, 3, '#7a1f2a', OUT, 1.5);
      else if (yor) { var yw = Math.max(0.25, Math.sin(t0 * 1.3) * 0.5 + 0.6); ell(c, fcx, hcy + 10, 2.8 + yw * 1.8, 1.8 + yw * 3.6, '#7a1f2a', OUT, 1.5); ell(c, fcx, hcy + 10 + yw * 2.2, 2 + yw, 1.2 + yw * 1.2, '#f07a8a', null); }
      else if (yak) { c.strokeStyle = '#a8344a'; c.lineWidth = 1.8; c.beginPath(); c.arc(fcx, hcy + 8, 4.2, 0.2, PI - 0.2); c.stroke(); }
      else if (supheli) { line(c, fcx - 2.6, hcy + 10.4, fcx + 2.6, hcy + 9.2, '#a8344a', 1.8); }
      else { c.strokeStyle = '#a8344a'; c.lineWidth = 1.6; c.beginPath(); c.arc(fcx, hcy + 8.2, 3, 0.3, PI - 0.3); c.stroke(); }
    } else {
      // arkadan: uzun saç + topuz
      ell(c, hcx, hcy + 1, 12.6, 11.8, HAIR, null);
      ell(c, hcx, hcy + 10, 7.6, 8.6, HAIRD, null);
      ell(c, hcx - 2, hcy - 4, 6.5, 3, 'rgba(255,220,180,0.28)', null, 0, -0.4);
      ell(c, hcx + 10, hcy - 7, 3, 3, '#ff7aa8', OUT, 1);
    }
    c.restore();
    etiket(c, 'Anne', n.x, n.y + 8 * s - bounce * s - 74 * s);
  }

  // Ortak baş çizimi: portre, yürüyüş ve yatakta aynı kimlik korunur.
  function yasliBas(c, kim, x, y, s, arka, uyku, sasir) {
    var ebe=kim==='ebe';
    c.save();c.translate(x,y);c.scale(s,s);
    if(ebe){
      ell(c,0,-17,8,6,'#bbb9b1',OUT,1.8);
      ell(c,0,-1,16,16,'#9a7395',OUT,2.2);
      c.beginPath();c.moveTo(-14,6);c.lineTo(-18,20);c.lineTo(-6,13);c.lineTo(1,20);c.lineTo(10,11);c.closePath();fs(c,'#9a7395',OUT,1.5);
    }else{
      ell(c,-13,2,4,8,'#e7dfd1',OUT,1.5);ell(c,13,2,4,8,'#e7dfd1',OUT,1.5);
    }
    ell(c,0,1,13,14,ebe?'#f2c9ad':'#efc29c',OUT,2.2);
    if(arka){ell(c,0,1,12,13,ebe?'#9a7395':'#d5d4c9',null);}
    else{
      for(var sg=-1;sg<=1;sg+=2){
        if(uyku){c.beginPath();c.arc(sg*5,1,2.7,0.15,PI-0.15);c.strokeStyle=OUT;c.lineWidth=1.5;c.stroke();}
        else{ell(c,sg*5,0,3.5,4,'#fff8e8',null);ell(c,sg*5+0.4,0.6,1.5,2,'#3e3e35',null);}
        ell(c,sg*5,1,5,5,'rgba(187,220,216,0.12)','#626559',1.5);
        line(c,sg*2,-6,sg*8,-7,'#b4afa2',2);
      }
      line(c,-1,0,1,0,'#626559',1.5);line(c,-13,0,-10,0,'#626559',1.5);line(c,10,0,13,0,'#626559',1.5);
      ell(c,0,5,2.8,2.5,'#df9e84',OUT,1);
      ell(c,-9,6,2.5,1.7,'#e9a18d',null);ell(c,9,6,2.5,1.7,'#e9a18d',null);
      if(!ebe){ell(c,-4.5,9,5.5,2.7,'#f6f0df','#a8a594',1,0.18);ell(c,4.5,9,5.5,2.7,'#f6f0df','#a8a594',1,-0.18);}
      if(sasir||uyku)ell(c,0,ebe?10:13,2.5,2.5,'#875449',null);
      else{c.beginPath();c.arc(0,ebe?7:10,3.5,0.2,PI-0.2);c.strokeStyle='#995c50';c.lineWidth=1.4;c.stroke();}
    }
    if(ebe){
      c.beginPath();c.moveTo(-14,-2);c.quadraticCurveTo(-14,-18,0,-17);c.quadraticCurveTo(15,-17,14,-2);c.lineTo(8,-6);c.quadraticCurveTo(0,-13,-8,-6);c.closePath();fs(c,'#9a7395',OUT,1.5);
      [[-10,-10],[0,-14],[10,-10],[-14,9]].forEach(function(p){ell(c,p[0],p[1],2.5,2,'#f0d8b3',null);ell(c,p[0],p[1],0.9,0.9,'#c48b6d',null);});
    }else{
      c.beginPath();c.moveTo(-15,-8);c.quadraticCurveTo(-14,-22,4,-18);c.quadraticCurveTo(14,-17,14,-7);c.closePath();fs(c,'#6f8a7d',OUT,2);
      box(c,-16,-9,33,5,'#506b60',OUT,1.5,3);line(c,-4,-17,-5,-10,'#a5b3a0',1);
    }
    c.restore();
  }
  function yasliCiz(c,n,d) {
    var ebe=n.kim==='ebe',s=(n.r||17)/17,t=d.zaman||S.t;
    var sal=n.hareket?Math.sin(n.adimFaz||0):0,bounce=Math.abs(sal)*1.8,b=bak(n.yon),arka=b.fy<-.55;
    var col=ebe?'#a07791':'#7c9680', dark=ebe?'#765168':'#506b5c';
    ell(c,n.x,n.y+6,20*s,8*s,'rgba(30,24,20,0.3)',null);
    c.save();c.translate(n.x,n.y+6*s);c.scale(s,s);c.translate(0,-bounce);
    if(n.durum==='yorgun')c.rotate(Math.sin(t*1.4)*0.04);
    box(c,-12,-9-Math.max(0,sal)*4,10,11,'#655346',OUT,2,4);box(c,2,-9-Math.max(0,-sal)*4,10,11,'#655346',OUT,2,4);
    if(!ebe){
      // dede dinç: baston yerine kemer ve gözlük.
      box(c,-14,-19,28,5,'#43584c',OUT,1.6,2);
    }
    line(c,-13,-29,-20,-13+sal*4,OUT,10);line(c,-13,-29,-20,-13+sal*4,col,7);
    line(c,13,-29,20,-13-sal*4,OUT,10);line(c,13,-29,20,-13-sal*4,col,7);
    ell(c,-20,-10+sal*4,4,4,'#efc29c',OUT,1.5);ell(c,20,-10-sal*4,4,4,'#efc29c',OUT,1.5);
    box(c,-15,-35,30,30,col,OUT,2.5,9);
    if(ebe){box(c,-10,-22,20,17,'#e9d5af',OUT,1.5,5);line(c,-9,-29,-7,-21,'#f1e1c4',3);line(c,9,-29,7,-21,'#f1e1c4',3);box(c,-5,-15,10,6,'#d6ba91',null,0,2);}
    else{line(c,0,-32,0,-8,dark,1.5);for(var i=0;i<3;i++)ell(c,2,-27+i*8,1.5,1.5,'#e5cf9d',null);box(c,-11,-19,7,7,dark,null,0,2);}
    for(var j=0;j<3;j++)line(c,-11,-31+j*5,-5,-28+j*5,'rgba(255,240,208,0.22)',1);
    yasliBas(c,n.kim,b.fx*2,-47,1,arka,false,n.durum==='uyaniyor');
    c.restore();
    etiket(c,ebe?'Ebe':'Dede',n.x,n.y-71*s-bounce*s);
  }

  // ---------- UYUYAN EBEVEYN (yatakta) ----------
  function uyuyanCiz(c, u, d, t) {
    if (!u || !isFinite(u.x) || !isFinite(u.y)) return;
    var h = H(), yat = null, i;
    if (h && h.esyalar) for (i = 0; i < h.esyalar.length; i++) if (h.esyalar[i].tur === 'yatak' || h.esyalar[i].tur === 'mudur_divani') { yat = h.esyalar[i]; break; }
    var w = yat ? (yat.w || 1) * T : 2 * T, hh = yat ? (yat.h || 1) * T : 2 * T;
    var yon = yat ? (((yat.yon | 0) % 4) + 4) % 4 : 0;
    var lw = w, lh = hh;
    if (yon & 1) { lw = hh; lh = w; }
    var yasli = u.kim === 'dede' || u.kim === 'ebe';
    var anne = u.kim === 'anne' || u.kim === 'ebe';
    var nef = Math.sin(t * 2.2), SK = anne ? '#f7c3a0' : '#f5bb92';
    c.save();
    c.translate(u.x, u.y); c.rotate(yon * PI / 2);
    var hx = lw > 72 ? -lw * 0.2 : 0, hy = -lh / 2 + 24;     // baş yastıkta
    var bw = lw - 16, bt = hy + 8, bb = lh / 2 - 6, bcx = 0;
    if (yasli) { yasliBas(c,u.kim,hx,hy,0.85,false,true,false); } else {
    // baş
    if (anne) {
      ell(c, hx, hy - 12, 7.2, 6.4, '#7a4a2c', OUT, 2.2);              // topuz
      ell(c, hx, hy, 13.2, 12.6, '#7a4a2c', OUT, 2.4);
    }
    ell(c, hx, hy + 1, 11.4, 11, SK, OUT, 2.3);
    if (anne) {
      c.beginPath(); c.moveTo(hx - 11, hy - 2); c.quadraticCurveTo(hx - 6, hy - 12, hx, hy - 10); c.quadraticCurveTo(hx + 6, hy - 12, hx + 11, hy - 2); c.quadraticCurveTo(hx + 4, hy - 5, hx, hy - 4); c.quadraticCurveTo(hx - 5, hy - 6, hx - 11, hy - 2); c.closePath(); fs(c, '#7a4a2c', OUT, 1.6);
      bigudi(c, hx - 5, hy - 9, -0.5, '#6ec8ff'); bigudi(c, hx + 5, hy - 9, 0.5, '#ffd84a'); bigudi(c, hx - 12, hy, 1.3, '#9be26a'); bigudi(c, hx + 12, hy, -1.3, '#ff8fcf');
    } else {
      ell(c, hx - 3, hy - 6, 6, 2.8, 'rgba(255,255,255,0.6)', null, 0, -0.2);
      ell(c, hx - 11.5, hy + 1, 3.6, 5.6, '#8f8479', OUT, 1.6); ell(c, hx + 11.5, hy + 1, 3.6, 5.6, '#8f8479', OUT, 1.6);
    }
    // kapalı gözler + kirpik
    c.strokeStyle = OUT; c.lineWidth = 1.7; c.lineCap = 'round';
    c.beginPath(); c.arc(hx - 4.2, hy, 2.6, 0.2, PI - 0.2); c.stroke(); c.beginPath(); c.arc(hx + 4.2, hy, 2.6, 0.2, PI - 0.2); c.stroke();
    if (anne) { line(c, hx - 6.8, hy + 1.6, hx - 8.2, hy + 0.2, OUT, 1.3); line(c, hx + 6.8, hy + 1.6, hx + 8.2, hy + 0.2, OUT, 1.3); }
    else { line(c, hx - 7.6, hy - 3.8, hx - 1.8, hy - 3.2, '#4a4038', 2); line(c, hx + 1.8, hy - 3.2, hx + 7.6, hy - 3.8, '#4a4038', 2); }
    ell(c, hx, hy + 3.8, 2.2, 1.8, '#f09a85', OUT, 1.2);
    if (!anne) { ell(c, hx - 4.4, hy + 7.4, 5, 2.4, '#6a5a4c', OUT, 1.5, 0.3); ell(c, hx + 4.4, hy + 7.4, 5, 2.4, '#6a5a4c', OUT, 1.5, -0.3); }
    ell(c, hx, hy + 8.6 + (anne ? 0 : 1.6), 2 + Math.max(0, nef) * 0.8, 1.4 + Math.max(0, nef) * 1.0, '#7a1f2a', null);
    ell(c, hx - 7, hy + 5, 2, 1.2, 'rgba(255,100,120,0.45)', null); ell(c, hx + 7, hy + 5, 2, 1.2, 'rgba(255,100,120,0.45)', null);
    }
    // yorgan (nefesle kabarır)
    var br = 1 + nef * 0.035;
    c.save(); c.translate(bcx, (bt + bb) / 2); c.scale(1 + nef * 0.012, br);
    var yh = bb - bt;
    rr(c, -bw / 2, -yh / 2, bw, yh, 10);
    fs(c, anne ? '#ff9ec7' : '#58a6d9', OUT, 2.8);
    c.save(); c.clip();
    c.fillStyle = anne ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.3)';
    for (i = 0; i < 6; i++) { if (anne) { for (var j = 0; j < 4; j++) ell(c, -bw / 2 + 12 + j * (bw - 24) / 3 + (i % 2) * 8, -yh / 2 + 18 + i * 12, 3, 3, 'rgba(255,255,255,0.55)', null); } else c.fillRect(-bw / 2, -yh / 2 + 12 + i * 12, bw, 5); }
    c.restore();
    box(c, -bw / 2, -yh / 2, bw, 9, anne ? '#fff0f6' : '#f5f8fb', OUT, 2, 4);
    c.restore();
    // ayak ucu kabarıklığı
    ell(c, hx - 6, bb - 4, 5, 3.4, 'rgba(0,0,0,0.12)', null); ell(c, hx + 6, bb - 4, 5, 3.4, 'rgba(0,0,0,0.12)', null);
    c.restore();
    zler(c, u.x + 8, u.y - 14, t);
  }

  // yarı kapalı göz kapağı (üst yarı deri rengi)
  function kapak(c, x, y, w, h, deri) {
    c.beginPath(); c.ellipse(x, y, w + 0.9, h + 0.9, 0, PI, PI * 2); c.closePath();
    c.fillStyle = deri; c.fill();
    c.beginPath(); c.moveTo(x - w - 0.9, y); c.lineTo(x + w + 0.9, y);
    c.strokeStyle = OUT; c.lineWidth = 1.6; c.lineCap = 'round'; c.stroke();
  }
  function komsu(c, n, d) {
    if (n.kim === 'dede' || n.kim === 'ebe') yasliCiz(c,n,d);
    else if (n.kim === 'anne') anneCiz(c, n, d); else babaCiz(c, n, d);
    if (d.uyanan === n) {
      var s=(n.r||17)/17,bob=n.hareket?Math.abs(Math.sin(n.adimFaz||0))*2:0;
      c.save();c.translate(n.x,n.y-53*s-bob*s);c.scale(s,s);
      c.beginPath();c.moveTo(-13,0);c.quadraticCurveTo(-4,-26,13,-13);c.lineTo(20,-3);c.quadraticCurveTo(9,-11,11,0);c.closePath();fs(c,'#92bdc5',OUT,1.8);
      box(c,-14,-2,28,5,'#edf4df',OUT,1.5,2);ell(c,20,-3,4,4,'#fff2d4',OUT,1.2);
      c.restore();
    }
  }
  function zler(c, x, y, t) {
    for (var i = 0; i < 3; i++) {
      var p = ((t * 0.55 + i / 3) % 1), sz = 11 + p * 14;
      c.save(); c.globalAlpha = Math.min(1, (1 - p) * 1.6);
      c.translate(x + p * 18 + i * 2, y - p * 34); c.rotate(-0.2 + Math.sin(t * 2 + i) * 0.12);
      metin(c, i === 1 ? 'Z' : 'z', 0, 0, 'bold ' + Math.round(sz) + 'px "Trebuchet MS", Arial, sans-serif', '#fff', '#3a5bb0', 4);
      c.restore();
    }
  }

  function isaret(c, n, d) {
    var dur = n.durum, t = d.zaman || S.t;
    var tur = null;
    if (dur === 'yorgun' && !n.oyalaniyor) { zler(c, n.x + 12, n.y - 62, t); return; }
    if (n.oyalaniyor) { sinirli(c, n.x + 4, n.y - 96 - Math.abs(Math.sin(t * 9)) * 4, t); return; }
    if (dur === 'kovalama') tur = '!';
    else if (dur === 'suphe' || dur === 'arama' || (dur === 'devriye' && (n.uyari || 0) > 0.3)) tur = '?';
    if (!tur) return;
    var zb = Math.abs(Math.sin(t * 8)) * (tur === '!' ? 8 : 5);
    var x = n.x, y = n.y - 82 - zb;
    var col = tur === '!' ? '#ee2b2b' : '#ffb21e';
    c.save();
    if (tur === '!') { c.translate(x, y); c.scale(1 + Math.sin(t * 16) * 0.05, 1); c.translate(-x, -y); }
    metin(c, tur, x, y, 'bold 34px "Trebuchet MS", Arial, sans-serif', col, OUT, 6);
    c.restore();
    if (tur === '?' && dur === 'devriye') { // uyarı doluluk
      c.strokeStyle = 'rgba(255,178,30,0.9)'; c.lineWidth = 3; c.beginPath(); c.arc(x, y + 1, 21, -PI / 2, -PI / 2 + PI * 2 * Math.min(1, n.uyari)); c.stroke();
    }
  }

  // 💢 benzeri öfke işareti
  function sinirli(c, x, y, t) {
    var p = 1 + Math.sin(t * 14) * 0.08;
    c.save(); c.translate(x, y); c.scale(p, p);
    var R = 21;
    for (var i = 0; i < 4; i++) {
      var a = PI / 4 + i * PI / 2, ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca;
      c.beginPath();
      c.moveTo(ca * 3, sa * 3);
      c.quadraticCurveTo(ca * 9 + px * 8, sa * 9 + py * 8, ca * R + px * 1, sa * R + py * 1);
      c.quadraticCurveTo(ca * 9 - px * 2, sa * 9 - py * 2, ca * 3, sa * 3);
      c.closePath(); fs(c, '#ee2b2b', OUT, 2.6);
    }
    c.restore();
  }

  function balon(c, n, d) {
    var k = n.konusma;
    if (!k || !k.metin) return;
    var txt = String(k.metin), font = 'bold 14px "Trebuchet MS", Arial, sans-serif';
    c.font = font;
    var maxW = 210, words = txt.split(' '), lines = [], cur = '', i;
    for (i = 0; i < words.length; i++) {
      var tst = cur ? cur + ' ' + words[i] : words[i];
      if (c.measureText(tst).width > maxW && cur) { lines.push(cur); cur = words[i]; } else cur = tst;
    }
    lines.push(cur);
    var tw = 0; lines.forEach(function (l) { tw = Math.max(tw, c.measureText(l).width); });
    var bw = tw + 22, bh = lines.length * 18 + 14;
    var bx = n.x - bw / 2 + 18, by = n.y - 90 - bh - ((n.durum === 'kovalama' || n.durum === 'suphe' || n.durum === 'arama') ? 18 : 0);
    var kal = (k.sure == null || k.sure > 0.3) ? 1 : Math.max(0, k.sure / 0.3);
    c.save(); c.globalAlpha = kal;
    c.shadowColor = 'rgba(0,0,0,0.25)'; c.shadowBlur = 6; c.shadowOffsetY = 3;
    c.beginPath();
    rr(c, bx, by, bw, bh, 12);
    c.fillStyle = '#fff'; c.fill();
    c.shadowColor = 'transparent';
    c.beginPath(); c.moveTo(bx + 16, by + bh - 1); c.lineTo(n.x - 2, n.y - 74 - ((n.durum === 'kovalama' || n.durum === 'suphe' || n.durum === 'arama') ? 18 : 0) + 8); c.lineTo(bx + 34, by + bh - 1); c.closePath();
    c.fillStyle = '#fff'; c.fill();
    c.lineWidth = 2.6; c.strokeStyle = OUT; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(bx + 16, by + bh); c.lineTo(n.x - 2, n.y - 74 - ((n.durum === 'kovalama' || n.durum === 'suphe' || n.durum === 'arama') ? 18 : 0) + 8); c.lineTo(bx + 34, by + bh); c.stroke();
    rr(c, bx, by, bw, bh, 12);
    c.stroke();
    // kuyruğun birleşim çizgisini sil
    c.fillStyle = '#fff'; c.fillRect(bx + 18, by + bh - 2, 15, 3.5);
    c.fillStyle = '#222'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = font;
    for (i = 0; i < lines.length; i++) c.fillText(lines[i], bx + bw / 2, by + 7 + 9 + i * 18);
    c.restore();
  }

  // ---------- GÖRÜŞ KONİSİ ----------
  function koni(c, n, d) {
    if (n.durum === 'yaka' || n.durum === 'yakaladi' || n.durum === 'yorgun') return;
    var A = n.gorusAci || 1.2, D = n.gorusMesafe || 330, NR = 40, i, step = 6;
    var pts = [];
    var base = n.yon || 0;
    for (i = 0; i < NR; i++) {
      var a = base - A / 2 + A * i / (NR - 1), ca = Math.cos(a), sa = Math.sin(a), dd = 0, lx = n.x, ly = n.y;
      while (dd < D) {
        var nd = Math.min(D, dd + step), px = n.x + ca * nd, py = n.y + sa * nd;
        if (dd > 20 && katiMi(Math.floor(px / T), Math.floor(py / T))) break;
        dd = nd; lx = px; ly = py;
      }
      pts.push(lx, ly);
    }
    var dur = n.durum, rgb = ({anne:'206,110,150',dede:'42,110,150',ebe:'110,70,150'})[n.kim] || '176,122,20', al = 0.36;
    if (dur === 'kovalama') { rgb = '196,50,40'; al = 0.44; }
    else if (dur === 'suphe' || dur === 'arama') { rgb = '176,102,16'; al = 0.40; }
    if (n.oyalaniyor) { rgb = '120,170,255'; al = 0.09; }
    var g = c.createRadialGradient(n.x, n.y, 10, n.x, n.y, D);
    g.addColorStop(0, 'rgba(' + rgb + ',' + (al + 0.12) + ')');
    g.addColorStop(0.6, 'rgba(' + rgb + ',' + al * 0.7 + ')');
    g.addColorStop(1, 'rgba(' + rgb + ',0.03)');
    c.beginPath(); c.moveTo(n.x, n.y);
    for (i = 0; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
    c.closePath();
    c.fillStyle = g; c.fill();
    c.strokeStyle = 'rgba(' + rgb + ',0.6)'; c.lineWidth = 2; c.stroke();
  }

  // ---------- ANA ÇİZİM ----------
  function gorunur(x, y, m, v) { return x + m >= v.x && x - m <= v.x + v.w && y + m >= v.y && y - m <= v.y + v.h; }

  function sesHalka(c, s) {
    var p = 1 - Math.max(0, s.omur) / 0.6;
    p = Math.min(1, Math.max(0, p));
    var rad = (s.guc || 100) * (0.15 + 0.85 * p);
    var col = s.kaynak === 'esya' ? '255,214,80' : (s.kaynak === 'kapi' ? '255,170,100' : '255,255,255');
    c.beginPath(); c.arc(s.x, s.y, rad, 0, PI * 2);
    c.fillStyle = 'rgba(' + col + ',' + (0.07 * (1 - p)) + ')'; c.fill();
    c.lineWidth = 3; c.strokeStyle = 'rgba(' + col + ',' + (0.55 * (1 - p)) + ')'; c.stroke();
    c.lineWidth = 1.5; c.strokeStyle = 'rgba(' + col + ',' + (0.3 * (1 - p)) + ')';
    c.beginPath(); c.arc(s.x, s.y, rad * 0.7, 0, PI * 2); c.stroke();
  }

  function toplanabilirCiz(c, tp, t, v) {
    if (!tp || tp.alindi || tp.gizli || !gorunur(tp.x, tp.y, 40, v)) return;
    var onemli = tp.tur === 'anahtar_mavi' || tp.tur === 'anahtar_kirmizi' || tp.tur === 'top_hazine';
    var ph = (tp.id ? String(tp.id).length * 1.7 : 0) + tp.x * 0.01;
    var zp = Math.abs(Math.sin(t * 3 + ph)) * (onemli ? 7 : 3.5);
    var rad = onemli ? 30 : 20;
    // parıltı
    var glow = onemli ? (tp.tur === 'anahtar_kirmizi' ? '255,90,90' : (tp.tur === 'anahtar_mavi' ? '90,160,255' : '255,225,90')) : '255,245,200';
    var ga = (onemli ? 0.5 : 0.28) + Math.sin(t * 4 + ph) * 0.12;
    var g = c.createRadialGradient(tp.x, tp.y, 2, tp.x, tp.y, rad + 8);
    g.addColorStop(0, 'rgba(' + glow + ',' + ga + ')'); g.addColorStop(1, 'rgba(' + glow + ',0)');
    c.fillStyle = g; c.beginPath(); c.arc(tp.x, tp.y, rad + 8, 0, PI * 2); c.fill();
    ell(c, tp.x, tp.y + 8, 11 - zp * 0.4, 4.5 - zp * 0.2, 'rgba(0,0,0,0.3)', null);
    var sz = onemli ? 36 : 28;
    ikon(c, tp.tur, tp.x, tp.y - 2 - zp, sz);
    // yıldız parıltısı
    var sp = (t * 1.6 + ph) % 2;
    if (sp < 1) {
      var sx = tp.x + Math.cos(ph * 3) * 12, sy = tp.y - 12 - zp + Math.sin(ph * 5) * 5, ss = Math.sin(sp * PI) * (onemli ? 6 : 4);
      c.fillStyle = '#fff'; c.beginPath();
      c.moveTo(sx, sy - ss); c.lineTo(sx + ss * 0.3, sy - ss * 0.3); c.lineTo(sx + ss, sy); c.lineTo(sx + ss * 0.3, sy + ss * 0.3);
      c.lineTo(sx, sy + ss); c.lineTo(sx - ss * 0.3, sy + ss * 0.3); c.lineTo(sx - ss, sy); c.lineTo(sx - ss * 0.3, sy - ss * 0.3); c.closePath(); c.fill();
    }
  }

  function saklanGozler(c, o, d, t) {
    var e = o.saklandi, cx = o.x, cy = o.y;
    if (e && e.tx != null) { cx = (e.tx + (e.w || 1) / 2) * T; cy = (e.ty + (e.h || 1) / 2) * T; }
    var n = d.komsu, dx = 0, dy = 0;
    if (n) { var l = Math.hypot(n.x - cx, n.y - cy) || 1; dx = (n.x - cx) / l * 1.8; dy = (n.y - cy) / l * 1.8; }
    var blink = (t % 3.4) > 3.25 ? 0.15 : 1;
    box(c, cx - 15, cy - 6, 30, 12, '#140c0a', OUT, 2, 6);
    for (var i = -1; i <= 1; i += 2) {
      c.beginPath(); c.ellipse(cx + i * 6.5, cy, 4.2, 4.2 * blink, 0, 0, PI * 2); c.fillStyle = '#fff'; c.fill();
      if (blink > 0.5) ell(c, cx + i * 6.5 + dx, cy + dy, 2.1, 2.1, '#111', null);
    }
  }

  function karanlikCiz(ctx, d, k, dpr, ol, v) {
    if (S.bx1 < S.bx0 || !S.mask) return;
    var x0 = S.bx0 * T - 60, y0 = S.by0 * T - 60, x1 = (S.bx1 + 1) * T + 60, y1 = (S.by1 + 1) * T + 60;
    if (x1 < v.x || x0 > v.x + v.w || y1 < v.y || y0 > v.y + v.h) return;
    var cw = ctx.canvas.width, ch = ctx.canvas.height;
    if (!S.karanlik) S.karanlik = mk(cw, ch);
    var dc = S.karanlik;
    if (dc.width !== cw || dc.height !== ch) { dc.width = cw; dc.height = ch; }
    var c2 = dc.getContext('2d');
    c2.setTransform(1, 0, 0, 1, 0, 0);
    c2.globalCompositeOperation = 'source-over';
    c2.clearRect(0, 0, cw, ch);
    c2.fillStyle = 'rgba(4,6,20,0.93)'; c2.fillRect(0, 0, cw, ch);
    c2.setTransform(dpr * ol, 0, 0, dpr * ol, -k.x * dpr * ol, -k.y * dpr * ol);
    c2.globalCompositeOperation = 'destination-out';
    var o = d.oyuncu;
    function isik(x, y, r, a) {
      var g = c2.createRadialGradient(x, y, r * 0.15, x, y, r);
      g.addColorStop(0, 'rgba(0,0,0,' + a + ')'); g.addColorStop(0.55, 'rgba(0,0,0,' + a * 0.8 + ')'); g.addColorStop(1, 'rgba(0,0,0,0)');
      c2.fillStyle = g; c2.beginPath(); c2.arc(x, y, r, 0, PI * 2); c2.fill();
    }
    if (o && isFinite(o.x)) isik(o.x, o.y, 170, 1);
    var h = H();
    if (h && h.toplanabilir) h.toplanabilir.forEach(function (tp) {
      if (!tp.alindi && tp.tur === 'top_hazine') isik(tp.x, tp.y, 55, 0.55);
    });
    c2.globalCompositeOperation = 'destination-in';
    c2.drawImage(S.mask, 0, 0);
    c2.globalCompositeOperation = 'source-over';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(dc, 0, 0);
  }

  G.cizim = {
    init: function (canvas) { S.canvas = canvas; S.hazir = false; },
    yenile: function () { S.hazir = false; },
    desteklenenEsyalar: function () { return Object.keys(P).concat(['agac']); },
    ikon: function (c, tur, x, y, b) { try { ikon(c, tur, x, y, b); } catch (e) {} },
    ciz: function (ctx, d) {
      if (!d) return;
      var h = H();
      var dpr = (d.ekran && d.ekran.dpr) || 1;
      var k = d.kamera || { x: 0, y: 0, olcek: 1 };
      var ol = k.olcek || 1;
      var cw = ctx.canvas.width, ch = ctx.canvas.height;
      var t = d.zaman || 0;
      S.t = t;
      if (h && (!S.hazir || S.hW !== (h.W || 44) || S.hH !== (h.H || 32))) {
        try { statikKur(); } catch (e) { console.error('cizim statik', e); S.hazir = false; }
      }
      ctx.setTransform(dpr * ol, 0, 0, dpr * ol, -k.x * dpr * ol, -k.y * dpr * ol);
      var vw = cw / (dpr * ol), vh = ch / (dpr * ol);
      var v = { x: k.x, y: k.y, w: vw, h: vh };
      ctx.save();
      // statik
      if (S.hazir && S.stat) {
        var sx = Math.max(0, Math.floor(k.x) - 2), sy = Math.max(0, Math.floor(k.y) - 2);
        var ex = Math.min(S.stat.width, Math.ceil(k.x + vw) + 2), ey = Math.min(S.stat.height, Math.ceil(k.y + vh) + 2);
        if (ex > sx && ey > sy) ctx.drawImage(S.stat, sx, sy, ex - sx, ey - sy, sx, sy, ex - sx, ey - sy);
      }
      if (h) {
        var i, e, list;
        // kapılar
        (h.kapilar || []).forEach(function (kp) { if (gorunur(kp.tx * T + 24, kp.ty * T + 24, 70, v)) kapiCiz(ctx, kp); });
        // mobilyalar (ağaçlar sonra)
        list = (h.esyalar || []).filter(function (q) { return gorunur((q.tx + (q.w || 1) / 2) * T, (q.ty + (q.h || 1) / 2) * T, Math.max(q.w || 1, q.h || 1) * T / 2 + (q.tur === 'agac' ? 90 : 20), v); });
        list.sort(function (a, b) { return (a.tur === 'agac' ? 1 : 0) - (b.tur === 'agac' ? 1 : 0) || (a.ty + (a.h || 1)) - (b.ty + (b.h || 1)); });
        for (i = 0; i < list.length; i++) { try { mobilyaCiz(ctx, list[i]); } catch (er) { console.error('mobilya', list[i].tur, er); } }
        scooterlar(ctx, d, h, t, v);
        if (d.uyuyan) { try { if (gorunur(d.uyuyan.x, d.uyuyan.y, 90, v)) uyuyanCiz(ctx, d.uyuyan, d, t); } catch (eru) { console.error('uyuyan', eru); } }
        // toplanabilirler
        (h.toplanabilir || []).forEach(function (tp) { toplanabilirCiz(ctx, tp, t, v); });
        (h.aramaNoktalari || []).forEach(function (an) {
          if (!an.ipucu || an.bakildi) return;
          var pz = 0.5 + 0.5 * Math.sin(t * 5);
          ell(ctx, an.x, an.y, 34 + pz * 10, 34 + pz * 10, 'rgba(255,226,80,' + (0.25 + 0.2 * pz).toFixed(2) + ')', 'rgba(255,240,150,0.9)', 2.5);
        });
      }
      var n = d.komsu, o = d.oyuncu;
      // görüş konisi
      if (n && isFinite(n.x) && n.durum !== 'yakaladi') { try { koni(ctx, n, d); } catch (er2) { console.error('koni', er2); } }
      if (d.uyanan && isFinite(d.uyanan.x)) koni(ctx,d.uyanan,d);
      // sesler
      (d.sesler || []).forEach(function (s) { if (gorunur(s.x, s.y, s.guc || 100, v)) sesHalka(ctx, s); });
      // fırlatılanlar
      (d.firlatilanlar || []).forEach(function (f, idx) {
        var z = f.z || 0;
        ell(ctx, f.x, f.y + 4, Math.max(4, 11 - z * 0.05), Math.max(2, 5 - z * 0.025), 'rgba(0,0,0,' + Math.max(0.12, 0.34 - z * 0.002) + ')', null);
        ctx.save(); ctx.translate(f.x, f.y - z - 4); ctx.rotate((t * 12 + idx * 1.7)); ikon(ctx, f.tur, 0, 0, 30); ctx.restore();
      });
      // kardeşler (Ogeday'ın altında)
      if (d.kardesler && d.kardesler.length) {
        var kl = d.kardesler.filter(function (q) { return q && isFinite(q.x) && isFinite(q.y); }).sort(function (a, b) { return a.y - b.y; });
        kl.forEach(function (q) { try { if (gorunur(q.x, q.y, 50, v)) kardesCiz(ctx, q, d); } catch (erk) { console.error('kardes', erk); } });
      }
      // oyuncu
      if (o && isFinite(o.x)) {
        if (o.saklandi) { try { saklanGozler(ctx, o, d, t); } catch (er3) {} }
        else if (gorunur(o.x, o.y, 40, v)) {
          var ga = gorunmezAlfa(o, t);
          ctx.save(); ctx.globalAlpha = ga; ogeday(ctx, o, d, { ad: 'Ogeday', boy: 1.2 }); ctx.restore();
          if (o.gorunmez > 0) parildar(ctx, o.x, o.y, t, 6);
        }
      }
      // sihir efektleri
      (d.efektler || []).forEach(function (ef) { try { if (ef && gorunur(ef.x, ef.y, 140, v)) efektCiz(ctx, ef, t); } catch (ere) {} });
      // Gökçe
      if (d.gokce && isFinite(d.gokce.x)) { try { if (gorunur(d.gokce.x, d.gokce.y, 60, v)) gokceCiz(ctx, d.gokce, d); } catch (erg) { console.error('gokce', erg); } }
      // komşu
      if (n && isFinite(n.x) && gorunur(n.x, n.y, 50, v)) komsu(ctx, n, d);
      if (d.uyanan && isFinite(d.uyanan.x) && gorunur(d.uyanan.x,d.uyanan.y,100,v)) komsu(ctx,d.uyanan,d);
      // ağaç taçları üstte ama mobilya sırasında zaten çizildi
      if (n && isFinite(n.x)) { isaret(ctx, n, d); balon(ctx, n, d); }
      if (d.uyanan && isFinite(d.uyanan.x)) { isaret(ctx,d.uyanan,d); balon(ctx,d.uyanan,d); }
      ctx.restore();
      // bodrum karanlığı
      try { karanlikCiz(ctx, d, k, dpr, ol, v); } catch (er4) { console.error('karanlik', er4); }
      // gün ışığı
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      var gl = ctx.createLinearGradient(0, 0, cw, ch);
      gl.addColorStop(0, 'rgba(255,240,170,0.10)'); gl.addColorStop(0.5, 'rgba(255,255,255,0)'); gl.addColorStop(1, 'rgba(60,40,120,0.08)');
      ctx.fillStyle = gl; ctx.fillRect(0, 0, cw, ch);
      var vg = ctx.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * 0.55, cw / 2, ch / 2, Math.max(cw, ch) * 0.8);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(10,20,10,0.22)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, cw, ch);
    }
  };
})();
