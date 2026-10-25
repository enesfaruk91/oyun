/* OGEDAY 3D — Three.js sahnesi. Oynanışın x/y düzlemi dünya X/Z düzlemine taşınır.
   WebGL yoksa veya bağlam kaybolursa cizim.js'teki 2D oyuna düşer. */
(function () {
  'use strict';
  var eski = G.cizim, T = window.THREE, U = 48, PI = Math.PI, TAU = PI * 2;
  if (!T) { console.error('Three.js yüklenemedi'); return; }

  var R = {
    renderer: null, scene: null, camera: null, world: null, actors: null, dirty: true, level: 0,
    yaw: 0.46, wantYaw: 0.46, zoom: 17, wantZoom: 17, target: new T.Vector3(), look: new T.Vector3(),
    autoF: 0, autoBekle: 0, dusuk: null, zoomVarsayilan: 17, ready: false, doors: [], items: new Map(), rigs: {}, walls: [], wallMesh: null, wallTrim: null, wallBase: null,
    cones: [], thrownItems: new Map(), textures: [], width: 0, height: 0, last: 0, frame: 0, missing: [], morBallar: [],
    testCamera: null, scooter: null, scooterSpin: 0, scooterPx: null, scooterPy: null,
    shake: 0, flash: 0, parts: [], prevKaza: null, lost: false, sun: null, prevPX: null, prevPZ: null
  };
  var geometries = {}, materials = {}, v3 = new T.Vector3(), dummy = new T.Object3D();
  var glowTex = null, skyTex = null;

  // ---------------------------------------------------------------- yardımcılar
  function material(color, opts) {
    opts = opts || {};
    var key = color + '|' + (opts.roughness == null ? 0.86 : opts.roughness) + '|' +
      (opts.metalness == null ? 0.02 : opts.metalness) + '|' + (opts.emissive || '') + '|' + (opts.emissiveIntensity || '');
    if (materials[key]) return materials[key];
    var m = new T.MeshStandardMaterial({
      color: color, roughness: opts.roughness == null ? 0.86 : opts.roughness,
      metalness: opts.metalness == null ? 0.02 : opts.metalness
    });
    if (opts.emissive) { m.emissive = new T.Color(opts.emissive); m.emissiveIntensity = opts.emissiveIntensity || 0.7; }
    materials[key] = m; return m;
  }
  function geometry(shape, size) {
    var key = shape, g;
    if (shape === 'cylinder') key += ':' + Math.round(size[0] / size[1] * 1000) / 1000;
    if (shape === 'cone') key += ':' + size[2];
    if (geometries[key]) return geometries[key];
    if (shape === 'box') g = new T.BoxGeometry(1, 1, 1);
    else if (shape === 'sphere') g = new T.SphereGeometry(0.5, 14, 10);
    else if (shape === 'cylinder') g = new T.CylinderGeometry(size[0] / size[1], 1, 1, 14);
    else if (shape === 'cone') g = new T.ConeGeometry(1, 1, size[2]);
    else if (shape === 'ring') g = new T.TorusGeometry(0.32, 0.075, 6, 18);
    else if (shape === 'circle') g = new T.CircleGeometry(0.5, 24);
    else if (shape === 'plane') g = new T.PlaneGeometry(1, 1);
    return (geometries[key] = g);
  }
  function part(parent, shape, size, pos, color, rot) {
    var m = new T.Mesh(geometry(shape, size), material(color));
    if (shape === 'cylinder') m.scale.set(size[1], size[2], size[1]);
    else if (shape === 'cone') m.scale.set(size[0], size[1], size[0]);
    else if (shape === 'ring') m.scale.set(size[0], size[0], size[0]);
    else m.scale.set(size[0], size[1], size[2]);
    m.position.set(pos[0], pos[1], pos[2]);
    // DeepSeek modelleri: önce X, sonra Y, sonra Z; extrinsic XYZ = Euler ZYX.
    if (rot) m.rotation.set(rot[0], rot[1], rot[2], 'ZYX');
    m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  }
  function box(g, w, h, d, x, y, z, c, r) { return part(g, 'box', [w, h, d], [x, y, z], c, r); }
  function ball(g, w, h, d, x, y, z, c) { return part(g, 'sphere', [w, h, d], [x, y, z], c); }
  function cyl(g, rt, rb, h, x, y, z, c, r) { return part(g, 'cylinder', [rt, rb, h], [x, y, z], c, r); }
  function hs(x, y, k) { var n = Math.sin(x * 127.1 + y * 311.7 + (k || 0) * 74.7) * 43758.5453; return n - Math.floor(n); }

  function model(id, w, h) {
    var data = (window.OGEDAY_MODELLER || {})[id], g = new T.Group();
    if (data) {
      data.parts.forEach(function (p) { part(g, p.shape, p.size, p.position, p.color, p.rotation); });
      g.scale.set(w / data.footprint[0], 1, h / data.footprint[1]);
    } else {
      if (R.missing.indexOf(id) < 0) R.missing.push(id);
      box(g, w * 0.8, 0.7, h * 0.8, 0, 0.35, 0, '#b98a5d');
      box(g, w * 0.84, 0.08, h * 0.84, 0, 0.75, 0, '#e1bd84');
    }
    return g;
  }
  function batch(root, target) {
    var groups = {}; root.updateMatrixWorld(true);
    root.traverse(function (m) {
      if (!m.isMesh) return; var key = m.geometry.uuid + '/' + m.material.uuid;
      var b = groups[key] || (groups[key] = { geo: m.geometry, mat: m.material, matrices: [] });
      b.matrices.push(m.matrixWorld.clone());
    });
    Object.keys(groups).forEach(function (k) {
      var b = groups[k], mesh = new T.InstancedMesh(b.geo, b.mat, b.matrices.length);
      b.matrices.forEach(function (m, i) { mesh.setMatrixAt(i, m); });
      mesh.castShadow = true; mesh.receiveShadow = true; mesh.computeBoundingSphere(); target.add(mesh);
    });
  }

  // ---------------------------------------------------------------- dokular
  function glowTexture() {
    if (glowTex) return glowTex;
    var cv = document.createElement('canvas'); cv.width = cv.height = 64;
    var c = cv.getContext('2d'), gr = c.createRadialGradient(32, 32, 1, 32, 32, 31);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = gr; c.fillRect(0, 0, 64, 64);
    glowTex = new T.CanvasTexture(cv); glowTex.colorSpace = T.SRGBColorSpace; return glowTex;
  }
  function skyTexture() {
    if (skyTex) return skyTex;
    var cv = document.createElement('canvas'); cv.width = 16; cv.height = 256;
    var c = cv.getContext('2d'), gr = c.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#79c2ee'); gr.addColorStop(0.42, '#bfe3f3'); gr.addColorStop(0.75, '#f6efd2'); gr.addColorStop(1, '#f1e8c0');
    c.fillStyle = gr; c.fillRect(0, 0, 16, 256);
    var sun = c.createRadialGradient(12, 62, 1, 12, 62, 48);
    sun.addColorStop(0, 'rgba(255,244,205,0.95)'); sun.addColorStop(1, 'rgba(255,250,220,0)');
    c.fillStyle = sun; c.fillRect(0, 0, 16, 256);
    skyTex = new T.CanvasTexture(cv); skyTex.colorSpace = T.SRGBColorSpace; return skyTex;
  }
  function shade(hex, d) {
    var n = parseInt(hex.slice(1), 16), r = (n >> 16) + d, g = ((n >> 8) & 255) + d, b = (n & 255) + d;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  function floorTexture(h) {
    var cv = document.createElement('canvas'); cv.width = h.W * 48; cv.height = h.H * 48;
    var c = cv.getContext('2d'), x, y, px, py, z, a;
    var PL = R.plan, LV = R.level, stripeA = LV === 3 ? 1 : (LV === 4 ? 0.8 : 0.45);
    var colors = { cim: '#8fad66', yol: '#6c7880', kaldirim: '#c7c5b4', parke: '#c39a6d', eski_parke: '#aa825c',
      hali: '#d69a82', kilim: '#a6675b', fayans: '#c8d9d2', bodrum: '#817b76', kiler: '#a89273', toprak: '#b59a71',
      cakil: '#c8bca2', saha: '#4a82b4', duvar: '#d7c5a6', cit: '#91aa6d', dis: '#76965e', bosluk: '#241f2d', oyun: '#9fd8c0' };
    for (y = 0; y < h.H; y++) for (x = 0; x < h.W; x++) {
      z = h.zemin(x, y); px = x * 48; py = y * 48;
      var base = colors[z] || colors.parke;
      if (z === 'bosluk' && h.katSayisi > 1 && y < h.katSinirY / 48 + 3) base = colors.dis;   // zemin katın altındaki boşluk çimen gibi görünür
      if (PL && PL.plaza[y * h.W + x]) base = '#e3d4b1';
      else if (PL && PL.kaucuk[y * h.W + x]) base = '#c65f4b';
      c.fillStyle = shade(base, Math.round((hs(x, y, 3) - 0.5) * 10));
      c.fillRect(px, py, 48, 48);
      if (z === 'parke' || z === 'eski_parke') {
        c.strokeStyle = 'rgba(92,61,38,.26)'; c.lineWidth = 1;
        for (a = 0; a < 4; a++) {
          c.strokeRect(px, py + a * 12, 48, 12);
          var cut = (x * 19 + y * 13 + a * 17) % 45;
          c.beginPath(); c.moveTo(px + cut, py + a * 12); c.lineTo(px + cut, py + a * 12 + 12); c.stroke();
          c.strokeStyle = 'rgba(255,232,196,.10)';
          c.beginPath(); c.moveTo(px + 2, py + a * 12 + 9); c.lineTo(px + 46, py + a * 12 + 9); c.stroke();
          c.strokeStyle = 'rgba(92,61,38,.26)';
        }
      } else if (z === 'fayans' || z === 'kiler' || z === 'bodrum' || z === 'kaldirim') {
        c.strokeStyle = 'rgba(65,76,71,.18)'; c.lineWidth = 1.3; c.strokeRect(px + 1, py + 1, 46, 46);
        if (z === 'fayans') {
          c.fillStyle = 'rgba(255,255,255,.30)'; c.fillRect(px + 3, py + 3, 20, 20); c.fillRect(px + 25, py + 25, 20, 20);
          c.fillStyle = 'rgba(80,110,104,.07)'; c.fillRect(px + 25, py + 3, 20, 20); c.fillRect(px + 3, py + 25, 20, 20);
        } else {
          c.fillStyle = 'rgba(255,255,255,.10)'; c.fillRect(px + 2, py + 2, 44, 2); c.fillRect(px + 2, py + 2, 2, 44);
        }
      } else if (z === 'hali' || z === 'kilim') {
        c.strokeStyle = z === 'kilim' ? '#dabd8d' : '#e9c3a3'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(px + 24, py + 5); c.lineTo(px + 42, py + 24); c.lineTo(px + 24, py + 43); c.lineTo(px + 6, py + 24); c.closePath(); c.stroke();
        c.fillStyle = z === 'kilim' ? '#4f7d72' : '#70948a'; c.fillRect(px + 21, py + 21, 6, 6);
        c.strokeStyle = 'rgba(255,255,255,.10)'; c.lineWidth = 1;
        c.strokeRect(px + 4, py + 4, 40, 40);
      } else if (z === 'oyun') {   // bebek oyun halısı: pastel renkli köpük kareler
        var oc = ['#ff9eb7', '#ffd66b', '#7fd0f0', '#9be08a'];
        c.fillStyle = oc[(x + y) % 4]; c.fillRect(px + 2, py + 2, 44, 44);
        c.fillStyle = oc[(x + y + 2) % 4]; c.fillRect(px + 14, py + 14, 20, 20);
        c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; c.strokeRect(px + 2, py + 2, 44, 44);
      } else if (z === 'cim' || z === 'dis' || z === 'cit') {
        c.fillStyle = (x + y) % 2 ? 'rgba(255,251,185,.04)' : 'rgba(47,88,37,.035)'; c.fillRect(px, py, 48, 48);
        // biçilmiş çim şeritleri (2 karo genişliğinde)
        c.fillStyle = (Math.floor(y / 2) % 2) ? 'rgba(255,252,170,' + (0.13 * stripeA) + ')' : 'rgba(30,80,35,' + (0.11 * stripeA) + ')'; c.fillRect(px, py, 48, 48);
        for (a = 0; a < 5; a++) {
          var gx = px + (x * 17 + y * 11 + a * 19) % 44, gy = py + (y * 13 + a * 23) % 42;
          c.strokeStyle = a % 2 ? 'rgba(60,104,42,.34)' : 'rgba(112,150,72,.38)'; c.lineWidth = 1.2;
          c.beginPath(); c.moveTo(gx, gy + 4); c.lineTo(gx + (a % 3 - 1), gy); c.stroke();
        }
        if (hs(x, y, 9) > 0.82) {
          c.fillStyle = hs(x, y, 10) > 0.5 ? '#ffe28a' : '#fff6ef';
          c.beginPath(); c.arc(px + 14 + hs(x, y, 11) * 20, py + 16 + hs(x, y, 12) * 18, 1.7, 0, 7); c.fill();
        }
      } else if (z === 'cakil') {
        for (a = 0; a < 11; a++) {
          c.fillStyle = a % 2 ? '#e1d3b5' : '#aa9d84';
          c.beginPath(); c.ellipse(px + (x * 7 + a * 19) % 46, py + (y * 13 + a * 11) % 46, 2.6, 1.8, 0, 0, 7); c.fill();
        }
      } else if (z === 'yol') {
        if (h.zemin(x, y - 1) === 'yol' && x % 3 === 0) { c.fillStyle = 'rgba(239,225,177,.85)'; c.fillRect(px + 2, py, 35, 4); }
        c.fillStyle = 'rgba(255,255,255,.035)'; c.fillRect(px, py + 20 + (x % 2) * 10, 48, 1);
      } else if (z === 'toprak' && PL && PL.plaza[y * h.W + x]) {
        c.strokeStyle = 'rgba(150,120,80,.30)'; c.lineWidth = 1.4;
        c.strokeRect(px + 0.5, py + 0.5, 47, 47); c.beginPath(); c.moveTo(px + 24, py); c.lineTo(px + 24, py + 24); c.moveTo(px, py + 24); c.lineTo(px + 48, py + 24); c.moveTo(px + 24, py + 24); c.lineTo(px + 24, py + 48); c.stroke();
        c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(px + 2, py + 2, 20, 2);
      } else if (z === 'toprak' && PL && PL.kaucuk[y * h.W + x]) {
        var rc = ['#4aa37a', '#e8b04a', '#5b92c4'][Math.floor(hs(Math.floor(x / 2), Math.floor(y / 2), 5) * 3)];
        c.fillStyle = (x + y) % 2 ? rc : 'rgba(0,0,0,0)'; c.globalAlpha = 0.26; c.fillRect(px + 3, py + 3, 42, 42); c.globalAlpha = 1;
        c.strokeStyle = 'rgba(110,35,25,.30)'; c.lineWidth = 1.5; c.strokeRect(px + 0.5, py + 0.5, 47, 47);
        for (a = 0; a < 7; a++) { c.fillStyle = 'rgba(255,255,255,.10)'; c.fillRect(px + (a * 13 + x * 7) % 44, py + (a * 17 + y * 5) % 44, 2, 2); }
      } else if (z === 'toprak') {
        for (a = 0; a < 4; a++) { c.fillStyle = 'rgba(96,74,48,' + (0.05 + hs(x + a, y, 4) * 0.07) + ')'; c.fillRect(px + (a * 13 + x * 5) % 40, py + (a * 17 + y * 3) % 40, 8, 5); }
      }
      // Karo kenarına çok hafif ışık: yüzeylere derinlik verir.
      c.fillStyle = 'rgba(255,255,255,.035)'; c.fillRect(px, py, 48, 1);
      c.fillStyle = 'rgba(30,42,30,.035)'; c.fillRect(px, py + 47, 48, 1);
    }
    // Yol kenar taşları (cakil ile çim arası)
    if (PL && LV >= 3) {
      for (y = 0; y < h.H; y++) for (x = 0; x < h.W; x++) {
        if (h.zemin(x, y) !== 'cakil' || !PL.dis[y * h.W + x]) continue;
        [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (d) {
          var nz = h.zemin(x + d[0], y + d[1]);
          if (nz !== 'cim' && nz !== 'dis' && nz !== 'cit') return;
          var k, px2 = x * 48, py2 = y * 48, sx = d[0] < 0 ? px2 : d[0] > 0 ? px2 + 41 : px2, sy = d[1] < 0 ? py2 : d[1] > 0 ? py2 + 41 : py2;
          c.fillStyle = 'rgba(30,40,25,.16)'; // gölge çizgisi
          if (d[0]) c.fillRect(d[0] < 0 ? px2 + 7 : px2 + 34, py2, 2, 48); else c.fillRect(px2, d[1] < 0 ? py2 + 7 : py2 + 34, 48, 2);
          for (k = 0; k < 3; k++) {
            var bx = d[0] ? sx : px2 + k * 16, by = d[0] ? py2 + k * 16 : sy, bw = d[0] ? 7 : 15, bh = d[0] ? 15 : 7;
            c.fillStyle = (x + y + k) % 2 ? '#cfc9bb' : '#b9b3a4'; c.fillRect(bx + 0.5, by + 0.5, bw, bh);
            c.strokeStyle = 'rgba(90,84,70,.55)'; c.lineWidth = 1; c.strokeRect(bx + 0.5, by + 0.5, bw, bh);
            c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(bx + 1.5, by + 1.5, d[0] ? 2 : bw - 2, d[0] ? bh - 2 : 2);
          }
        });
      }
    }
    if (PL && PL.havuz) {   // meydan: havuz çevresinde halkalı taş döşeme
      var hv0 = PL.havuz, hx0 = (hv0.tx + hv0.w / 2) * 48, hz0 = (hv0.ty + hv0.h / 2) * 48;
      [[96, '#c8b48a', 4], [128, '#f0e3c4', 10], [160, '#c8b48a', 3]].forEach(function (rg) {
        c.strokeStyle = rg[1]; c.lineWidth = rg[2]; c.beginPath(); c.arc(hx0, hz0, rg[0], 0, 7); c.stroke();
      });
      for (a = 0; a < 16; a++) { c.strokeStyle = 'rgba(160,130,90,.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(hx0 + Math.cos(a / 16 * TAU) * 100, hz0 + Math.sin(a / 16 * TAU) * 100); c.lineTo(hx0 + Math.cos(a / 16 * TAU) * 128, hz0 + Math.sin(a / 16 * TAU) * 128); c.stroke(); }
    }
    if (PL && PL.bisiklet) {   // bisiklet park yeri
      var bk0 = PL.bisiklet, bpx = bk0.x * 48, bpy = bk0.y * 48, bw0 = bk0.w * 48, bh0 = bk0.h * 48;
      c.fillStyle = '#c6c3bb'; c.fillRect(bpx, bpy, bw0, bh0);
      c.fillStyle = 'rgba(0,0,0,.05)'; for (a = 0; a < bk0.w; a++) c.fillRect(bpx + a * 48 + 2, bpy + 2, 44, bh0 - 4);
      c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.strokeRect(bpx + 2, bpy + 2, bw0 - 4, bh0 - 4);
      for (a = 1; a < bk0.w; a++) { c.beginPath(); c.moveTo(bpx + a * 48, bpy + 6); c.lineTo(bpx + a * 48, bpy + 80); c.stroke(); }
      c.fillStyle = '#3f6fb5'; c.font = 'bold 15px sans-serif'; c.textAlign = 'center'; c.fillText('BİSİKLET PARKI', bpx + bw0 / 2, bpy + bh0 - 12);
    }
    // Büyük yumuşak lekeler (tek seferlik, sahneyi canlandırır).
    for (a = 0; a < 26; a++) {
      var lx = hs(a, 1, 21) * h.W * 48, ly = hs(a, 2, 22) * h.H * 48, rr = 40 + hs(a, 3, 23) * 130;
      var lg = c.createRadialGradient(lx, ly, 1, lx, ly, rr);
      lg.addColorStop(0, a % 3 ? 'rgba(255,248,210,.045)' : 'rgba(40,66,40,.05)'); lg.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = lg; c.beginPath(); c.arc(lx, ly, rr, 0, 7); c.fill();
    }
    // Basketbol sahası çizgileri (EK-8)
    (function () {
      var x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      for (var yy = 0; yy < h.H; yy++) for (var xx = 0; xx < h.W; xx++) if (h.zemin(xx, yy) === 'saha') { x0 = Math.min(x0, xx); x1 = Math.max(x1, xx); y0 = Math.min(y0, yy); y1 = Math.max(y1, yy); }
      if (x1 < 0) return;
      var L = x0 * 48 + 6, Tp = y0 * 48 + 6, Wd = (x1 - x0 + 1) * 48 - 12, Ht = (y1 - y0 + 1) * 48 - 12, cx = L + Wd / 2, cy = Tp + Ht / 2;
      c.fillStyle = '#e0884f'; c.fillRect(L, Tp, Wd, Ht);
      c.fillStyle = '#c5563f'; c.fillRect(L, cy - 62, 118, 124); c.fillRect(L + Wd - 118, cy - 62, 118, 124);
      c.fillStyle = 'rgba(255,255,255,.07)'; for (var st = 0; st < Wd; st += 48) c.fillRect(L + st, Tp, 24, Ht);
      c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 4;
      c.strokeRect(L, Tp, Wd, Ht);
      c.beginPath(); c.moveTo(cx, Tp); c.lineTo(cx, Tp + Ht); c.stroke();
      c.beginPath(); c.arc(cx, cy, 52, 0, 7); c.stroke();
      c.strokeRect(L, cy - 62, 118, 124); c.strokeRect(L + Wd - 118, cy - 62, 118, 124);
      c.beginPath(); c.arc(L + 118, cy, 40, -PI / 2, PI / 2); c.stroke();
      c.beginPath(); c.arc(L + Wd - 118, cy, 40, PI / 2, PI * 1.5); c.stroke();
    })();
    (h.odalar || []).forEach(function (o) {
      if (/Bahçe|Sokak|Ev$/.test(o.ad)) return;
      c.strokeStyle = 'rgba(77,56,41,.18)'; c.lineWidth = 3;
      c.strokeRect(o.x * 48 + 5, o.y * 48 + 5, o.w * 48 - 10, o.h * 48 - 10);
    });
    var tx = new T.CanvasTexture(cv); tx.colorSpace = T.SRGBColorSpace;
    tx.anisotropy = Math.min(4, R.renderer.capabilities.getMaxAnisotropy()); R.textures.push(tx); return tx;
  }
  function sign(parent, text, x, y, z, w) {
    var cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; var c = cv.getContext('2d');
    c.fillStyle = '#fff0cf'; c.fillRect(0, 0, 512, 96);
    c.fillStyle = '#77553f'; c.font = 'bold 30px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(text, 256, 48, 480);
    var tx = new T.CanvasTexture(cv); tx.colorSpace = T.SRGBColorSpace; R.textures.push(tx);
    var m = new T.Mesh(new T.PlaneGeometry(w, w * 96 / 512), new T.MeshBasicMaterial({ map: tx, side: T.DoubleSide }));
    m.position.set(x, y, z); parent.add(m);
  }

  // ---------------------------------------------------------------- dekor
  function tree(x, z, s, seed, pembe) {
    var g = new T.Group();
    cyl(g, 0.09, 0.12, 1.1, 0, 0.55, 0, '#7b5a3c');
    if (seed > 0.45) {
      // yapraklı ağaç
      ball(g, 1.5, 1.15, 1.4, 0, 1.5, 0, pembe ? '#f2a9bd' : seed > 0.75 ? '#568747' : '#4d7c41');
      ball(g, 1.05, 0.95, 1.0, -0.42, 1.26, 0.16, pembe ? '#f7bfcd' : '#609149');
      ball(g, 0.9, 0.8, 0.9, 0.42, 1.3, -0.12, pembe ? '#ec96ae' : '#4a753e');
      ball(g, 0.7, 0.6, 0.65, 0.05, 1.9, 0.06, pembe ? '#fad0da' : '#6a9a4f');
    } else {
      // çam
      part(g, 'cone', [0.95, 1.1, 8], [0, 1.15, 0], '#3f7040');
      part(g, 'cone', [0.8, 1.0, 8], [0, 1.65, 0], '#477b45');
      part(g, 'cone', [0.62, 0.9, 8], [0, 2.1, 0], '#528a4b');
    }
    g.position.set(x, 0, z); g.scale.setScalar(s); g.rotation.y = seed * TAU;
    return g;
  }
  function flower(x, z, seed) {
    var g = new T.Group();
    var cols = ['#f2778d', '#ffd85e', '#f7f1e4', '#c490e4', '#ff9f5e'];
    for (var i = 0; i < 3; i++) {
      var hgt = 0.18 + hs(seed, i, 4) * 0.16, ox = (hs(seed, i, 5) - 0.5) * 0.7, oz = (hs(seed, i, 6) - 0.5) * 0.7;
      cyl(g, 0.012, 0.015, hgt, ox, hgt / 2, oz, '#4d7a3c');
      ball(g, 0.13, 0.09, 0.13, ox, hgt + 0.02, oz, cols[(seed * 10 + i) % cols.length | 0]);
      ball(g, 0.05, 0.04, 0.05, ox, hgt + 0.055, oz, '#fff7cf');
    }
    g.position.set(x, 0, z); g.scale.setScalar(0.9 + hs(seed, 9, 8) * 0.5);
    return g;
  }
  function shrub(x, z, s, seed) {
    var g = new T.Group();
    ball(g, 1.1, 0.8, 1.0, 0, 0.38, 0, '#4b7b41');
    ball(g, 0.75, 0.6, 0.7, -0.35, 0.28, 0.15, '#5a8c49');
    ball(g, 0.62, 0.5, 0.62, 0.36, 0.24, -0.12, '#3f6e39');
    if (seed > 0.6) { ball(g, 0.1, 0.1, 0.1, -0.3, 0.62, 0.2, '#e56a7c'); ball(g, 0.08, 0.08, 0.08, 0.18, 0.55, -0.25, '#f0d35a'); }
    g.position.set(x, 0, z); g.scale.setScalar(s); return g;
  }
  function facade(temp, h) {
    var e = h.dekorCephe; if (!e) return;
    var g = new T.Group(), w = e.w, d = e.h, i;
    // Gövde, kırma çatı ve saçak.
    box(g, w, 2.25, d, w / 2, 1.13, d / 2, '#e6ca9f');
    box(g, w + 0.55, 0.18, d + 0.55, w / 2, 2.3, d / 2, '#a05d4c');
    for (i = 0; i < w; i += 0.72) box(g, 0.6, 0.07, d + 0.62, i + 0.36, 2.42, d / 2, i % 2 ? '#b76a55' : '#a75f4b');
    box(g, w + 0.5, 0.12, 0.16, w / 2, 2.2, -0.08, '#8d4c3e');
    box(g, w + 0.5, 0.12, 0.16, w / 2, 2.2, d + 0.08, '#8d4c3e');
    // Bacalar.
    box(g, 0.62, 1.1, 0.62, w * 0.22, 2.8, d * 0.32, '#a46852');
    box(g, 0.78, 0.13, 0.78, w * 0.22, 3.35, d * 0.32, '#7c4a3c');
    box(g, 0.46, 0.8, 0.46, w * 0.8, 2.65, d * 0.66, '#9e604b');
    // Pencereler: çerçeve, cam, denizlik ve çiçek kutusu.
    for (i = 1; i < w; i += 3) {
      if (Math.abs(i - w / 2) < 2) continue;
      [-1, 1].forEach(function (side) {
        var zz = side < 0 ? -0.06 : d + 0.06, o = side < 0 ? -0.02 : 0.02;
        box(g, 1.12, 1.06, 0.07, i, 1.18, zz, '#6d9188');
        box(g, 0.9, 0.84, 0.07, i, 1.19, zz + o, '#b6d9d0');
        box(g, 0.055, 0.86, 0.09, i, 1.19, zz + o * 1.7, '#f8e9c8');
        box(g, 0.92, 0.055, 0.09, i, 1.19, zz + o * 1.7, '#f8e9c8');
        box(g, 1.34, 0.1, 0.24, i, 0.6, zz + 0.09, '#b98d70');
        box(g, 1.0, 0.2, 0.24, i, 0.49, zz + 0.17, '#8d5c3c');
        ball(g, 0.22, 0.16, 0.2, i - 0.28, 0.65, zz + 0.2, '#5c8b45');
        ball(g, 0.2, 0.14, 0.18, i + 0.24, 0.63, zz + 0.2, '#6e9c50');
        ball(g, 0.08, 0.08, 0.08, i - 0.1, 0.68, zz + 0.22, '#e9748e');
      });
    }
    // Giriş: kapı, basamak, saçak ve fener.
    box(g, 1.28, 1.9, 0.1, w / 2, 0.95, -0.08, '#6a4a36');
    box(g, 1.08, 1.64, 0.12, w / 2, 0.88, -0.1, '#8b5f43');
    ball(g, 0.08, 0.08, 0.08, w / 2 + 0.38, 0.92, -0.18, '#e7c573');
    box(g, 1.6, 0.12, 0.7, w / 2, 0.06, -0.35, '#c2a782');
    box(g, 1.45, 0.1, 0.54, w / 2, 0.16, -0.26, '#d4bb92');
    box(g, 1.7, 0.14, 0.9, w / 2, 2.02, -0.4, '#8c4c3f');
    cyl(g, 0.05, 0.05, 0.4, w / 2 - 0.78, 1.85, -0.5, '#3f3a35');
    ball(g, 0.24, 0.3, 0.24, w / 2 - 0.78, 1.65, -0.5, '#f7d58a');
    box(g, 1.35, 1.9, 0.1, w / 2, 0.95, d + 0.08, '#6a4a36');
    box(g, 1.15, 1.64, 0.12, w / 2, 0.88, d + 0.1, '#8b5f43');
    g.position.set(e.tx, 0, e.ty); temp.add(g);
    sign(R.world, e.ad, e.tx + w / 2, 1.8, e.ty + d + 0.14, 4);
    sign(R.world, e.ad, e.tx + w / 2, 1.8, e.ty - 0.14, 4);
  }

  // ---------------------------------------------------------------- EK-10: çevre dekoru (çarpışmasız, birleşik)
  // Statik süsler: şekil başına tek InstancedMesh (instanceColor ile renk). Hareketliler: ayrı küçük havuz, her karede
  // yalnız birkaç düzine instance matrisi yazılır. Hiçbiri harita verisine/çarpışmaya dokunmaz.
  var DKG = {}, DKM = {}, mA = new T.Matrix4(), mB = new T.Matrix4(), mC = new T.Matrix4(), eE = new T.Euler(), qQ = new T.Quaternion(), pP = new T.Vector3(), sS = new T.Vector3();
  function dkGeo(k) {
    if (DKG[k]) return DKG[k];
    var g;
    if (k === 'box') g = new T.BoxGeometry(1, 1, 1);
    else if (k === 'ball') g = new T.SphereGeometry(0.5, 8, 6);
    else if (k === 'cyl') g = new T.CylinderGeometry(0.5, 0.5, 1, 10);
    else if (k === 'cone') g = new T.ConeGeometry(0.5, 1, 8);
    else if (k === 'tor') g = new T.TorusGeometry(0.5, 0.09, 5, 18);
    else g = new T.PlaneGeometry(1, 1);
    return (DKG[k] = g);
  }
  function dkMat(k) {
    if (DKM[k]) return DKM[k];
    return (DKM[k] = k === 'plane' ? new T.MeshBasicMaterial({ color: 0xffffff, side: T.DoubleSide })
      : new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.88, metalness: 0 }));
  }
  function kompoze(out, x, y, z, sx, sy, sz, rx, ry, rz) {
    eE.set(rx || 0, ry || 0, rz || 0, 'YXZ'); qQ.setFromEuler(eE); pP.set(x, y, z); sS.set(sx, sy, sz);
    return out.compose(pP, qQ, sS);
  }
  function dkToplayici() {
    var L = {};
    return {
      ekle: function (k, x, y, z, sx, sy, sz, renk, ry, rx, rz) {
        var l = L[k] || (L[k] = { m: [], c: [] });
        l.m.push(kompoze(new T.Matrix4(), x, y, z, sx, sy, sz, rx, ry, rz)); l.c.push(new T.Color(renk));
      },
      bitir: function (parent) {
        Object.keys(L).forEach(function (k) {
          var l = L[k], im = new T.InstancedMesh(dkGeo(k), dkMat(k), l.m.length);
          for (var i = 0; i < l.m.length; i++) { im.setMatrixAt(i, l.m[i]); im.setColorAt(i, l.c[i]); }
          im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true;
          im.frustumCulled = false; im.receiveShadow = true; im.castShadow = k !== 'plane' && k !== 'tor';
          parent.add(im);
        });
      }
    };
  }
  function dkDinamik() {
    var S = {};
    return {
      yuva: function (k, renk) { var s = S[k] || (S[k] = { n: 0, c: [], im: null }); s.c.push(new T.Color(renk)); return { k: k, i: s.n++ }; },
      bitir: function (parent) {
        Object.keys(S).forEach(function (k) {
          var s = S[k], im = new T.InstancedMesh(dkGeo(k), dkMat(k), s.n);
          im.instanceMatrix.setUsage(T.DynamicDrawUsage);
          var z = new T.Matrix4().makeScale(0, 0, 0);
          for (var i = 0; i < s.n; i++) { im.setMatrixAt(i, z); im.setColorAt(i, s.c[i]); }
          im.instanceColor.needsUpdate = true; im.frustumCulled = false; im.receiveShadow = false; im.castShadow = false;
          s.im = im; parent.add(im);
        });
      },
      yaz: function (sl, x, y, z, sx, sy, sz, rx, ry, rz) { S[sl.k].im.setMatrixAt(sl.i, kompoze(mC, x, y, z, sx, sy, sz, rx, ry, rz)); },
      yazM: function (sl, m) { S[sl.k].im.setMatrixAt(sl.i, m); },
      gizle: function (sl) { S[sl.k].im.setMatrixAt(sl.i, mC.makeScale(0, 0, 0)); },
      guncelle: function () { Object.keys(S).forEach(function (k) { if (S[k].im) S[k].im.instanceMatrix.needsUpdate = true; }); }
    };
  }
  // Çok parçalı hareketli nesne: yerel matrisler önceden hesaplanır, her karede ebeveyn matrisiyle çarpılır.
  function dkAktor(ds, defs) {
    var parts = defs.map(function (p) {
      return { sl: ds.yuva(p.k, p.c), m: kompoze(new T.Matrix4(), p.x, p.y, p.z, p.sx, p.sy, p.sz, p.rx, p.ry, p.rz) };
    });
    return {
      ciz: function (M) { for (var i = 0; i < parts.length; i++) ds.yazM(parts[i].sl, mB.multiplyMatrices(M, parts[i].m)); },
      parcalar: parts
    };
  }
  function ebeveyn(out, x, y, z, ry, pitch, pivY, s) {
    // T(x,y,z) * Ry * T(0,pivY,0) * Rx(pitch) * T(0,-pivY,0) * S
    kompoze(out, x, y, z, s || 1, s || 1, s || 1, 0, ry, 0);
    mA.makeTranslation(0, pivY || 0, 0); out.multiply(mA);
    mA.makeRotationX(pitch || 0); out.multiply(mA);
    mA.makeTranslation(0, -(pivY || 0), 0); out.multiply(mA);
    return out;
  }

  // ---- plan: dış mekân, doluluk, yasaklı karolar
  function dekorPlan(h) {
    var W = h.W, H = h.H, x, y, P = { W: W, H: H }, i;
    P.dusuk = !!(G.ayarlar && G.ayarlar.deger && G.ayarlar.deger.grafik === 'dusuk');
    P.dis = new Uint8Array(W * H); P.occ = new Uint8Array(W * H); P.ban = new Uint8Array(W * H); P.kul = new Uint8Array(W * H);
    function acik(a, b) { return a >= 0 && b >= 0 && a < W && b < H && h.zemin(a, b) !== 'duvar' && h.zemin(a, b) !== 'bosluk' && !h.kapiAt(a, b); }
    var st = [];
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) if ((x === 0 || y === 0 || x === W - 1 || y === H - 1) && acik(x, y)) { P.dis[y * W + x] = 1; st.push(x, y); }
    while (st.length) {
      var yy = st.pop(), xx = st.pop();
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        var a = xx + d[0], b = yy + d[1];
        if (acik(a, b) && !P.dis[b * W + a]) { P.dis[b * W + a] = 1; st.push(a, b); }
      });
    }
    h.esyalar.forEach(function (e) {
      var odd = (e.yon || 0) % 2, ew = odd ? e.h : e.w, eh = odd ? e.w : e.h;
      for (var b = Math.floor(e.ty); b < Math.ceil(e.ty + eh); b++) for (var a = Math.floor(e.tx); a < Math.ceil(e.tx + ew); a++) if (a >= 0 && b >= 0 && a < W && b < H) P.occ[b * W + a] = 1;
    });
    if (h.dekorCephe) { var cp = h.dekorCephe; for (y = cp.ty - 1; y < cp.ty + cp.h + 1; y++) for (x = cp.tx - 1; x < cp.tx + cp.w + 1; x++) if (x >= 0 && y >= 0 && x < W && y < H) P.occ[y * W + x] = 1; }
    function yasak(cx, cy, r) {
      for (var b = Math.floor(cy - r) - 1; b <= Math.ceil(cy + r) + 1; b++) for (var a = Math.floor(cx - r) - 1; a <= Math.ceil(cx + r) + 1; a++)
        if (a >= 0 && b >= 0 && a < W && b < H && Math.hypot(a + 0.5 - cx, b + 0.5 - cy) <= r + 0.5) P.ban[b * W + a] = 1;
    }
    h.kapilar.forEach(function (k) { yasak(k.tx + 0.5, k.ty + 0.5, 2.2); });
    (h.aramaNoktalari || []).forEach(function (a) { yasak(a.tx + (a.w || 1) / 2, a.ty + (a.h || 1) / 2, 1.8 + Math.max(a.w || 1, a.h || 1) / 2); });
    (h.devriye || []).forEach(function (p) { yasak(p.x / U, p.y / U, 2.2); });
    [h.oyuncuBaslangic, h.komsuBaslangic, h.kediBaslangic, h.mikrofonYeri, h.gokceMasa, h.zilYeri, h.kazaYeri, h.scooterYeri].forEach(function (p) {
      if (p && isFinite(p.x) && isFinite(p.y)) yasak(p.x / U, p.y / U, 2.3);
    });
    (h.toplanabilir || []).forEach(function (p) { if (isFinite(p.x) && isFinite(p.y)) yasak(p.x / U, p.y / U, 1.8); });
    P.zemin = function (a, b) { return h.zemin(a, b); };
    P.serbest = function (a, b) {
      if (a < 1 || b < 1 || a >= W - 1 || b >= H - 1) return false;
      var k = b * W + a;
      return !!P.dis[k] && !P.occ[k] && !P.ban[k] && !P.kul[k] && h.zemin(a, b) === 'cim' && !h.kati(a, b);
    };
    P.komsu = function (a, b, zn) { return h.zemin(a + 1, b) === zn || h.zemin(a - 1, b) === zn || h.zemin(a, b + 1) === zn || h.zemin(a, b - 1) === zn; };
    P.duvarKomsu = function (a, b) { return h.zemin(a + 1, b) === 'duvar' || h.zemin(a - 1, b) === 'duvar' || h.zemin(a, b + 1) === 'duvar' || h.zemin(a, b - 1) === 'duvar'; };
    P.duvarArka = function (a, b) { return (h.zemin(a - 1, b) === 'duvar' || h.zemin(a, b - 1) === 'duvar') && h.zemin(a + 1, b) !== 'duvar' && h.zemin(a, b + 1) !== 'duvar'; };   // duvar kameradan bakınca tarafın arkasında
    P.sec = function (n, filtre, ayrim, k) {
      var ad = [], out = [], a, b, j;
      for (b = 0; b < H; b++) for (a = 0; a < W; a++) if (P.serbest(a, b) && (!filtre || filtre(a, b))) ad.push([a, b, hs(a, b, k || 1)]);
      ad.sort(function (p, q) { return p[2] - q[2]; });
      for (i = 0; i < ad.length && out.length < n; i++) {
        var okk = true;
        for (j = 0; j < out.length; j++) if (Math.hypot(out[j].x - ad[i][0], out[j].y - ad[i][1]) < ayrim) { okk = false; break; }
        if (okk) { out.push({ x: ad[i][0], y: ad[i][1] }); P.kul[ad[i][1] * W + ad[i][0]] = 1; }
      }
      return out;
    };
    P.blok = function (bw, bh, px, py) {
      var best = null, bd = 1e9, a, b, c, d2;
      for (b = 1; b < H - bh; b++) for (a = 1; a < W - bw; a++) {
        var fine = true;
        for (d2 = 0; d2 < bh && fine; d2++) for (c = 0; c < bw; c++) if (!P.serbest(a + c, b + d2)) { fine = false; break; }
        if (!fine) continue;
        var dd = Math.hypot(a + bw / 2 - px, b + bh / 2 - py);
        if (dd < bd) { bd = dd; best = { x: a, y: b, w: bw, h: bh }; }
      }
      if (best) for (d2 = 0; d2 < bh; d2++) for (c = 0; c < bw; c++) P.kul[(best.y + d2) * W + best.x + c] = 1;
      return best;
    };
    // B3: meydan (havuzlu toprak alan) ve oyun alanı (kauçuk) ayrımı
    P.plaza = new Uint8Array(W * H); P.kaucuk = new Uint8Array(W * H);
    if ((h.bolum || G.bolum) === 3) {
      var hv = h.esyalar.filter(function (e) { return e.tur === 'havuz'; })[0], seen = new Uint8Array(W * H);
      for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
        if (h.zemin(x, y) !== 'toprak' || seen[y * W + x]) continue;
        var comp = [], q2 = [x, y], hasPool = false; seen[y * W + x] = 1;
        while (q2.length) {
          var cy2 = q2.pop(), cx2 = q2.pop(); comp.push(cx2, cy2);
          if (hv && cx2 >= hv.tx - 1 && cx2 <= hv.tx + hv.w && cy2 >= hv.ty - 1 && cy2 <= hv.ty + hv.h) hasPool = true;
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
            var a = cx2 + d[0], b = cy2 + d[1];
            if (a >= 0 && b >= 0 && a < W && b < H && h.zemin(a, b) === 'toprak' && !seen[b * W + a]) { seen[b * W + a] = 1; q2.push(a, b); }
          });
        }
        for (i = 0; i < comp.length; i += 2) (hasPool ? P.plaza : P.kaucuk)[comp[i + 1] * W + comp[i]] = 1;
      }
      P.havuz = hv;
    }
    if ((h.bolum || G.bolum) === 4) P.bisiklet = P.blok(5, 3, 7, 9) || P.blok(4, 3, 7, 9) || P.blok(4, 2, 7, 9) || P.blok(3, 2, 7, 9);
    return P;
  }

  // ---- doku/levha yardımcıları
  function suDoku() {
    var cv = document.createElement('canvas'); cv.width = cv.height = 128; var c = cv.getContext('2d');
    var gr = c.createLinearGradient(0, 0, 128, 128); gr.addColorStop(0, '#62cbe6'); gr.addColorStop(1, '#3fa8d4');
    c.fillStyle = gr; c.fillRect(0, 0, 128, 128);
    var i, j;
    for (i = 0; i < 9; i++) {
      c.strokeStyle = 'rgba(255,255,255,' + (0.16 + (i % 3) * 0.07) + ')'; c.lineWidth = 2.2; c.beginPath();
      for (j = 0; j <= 128; j += 4) { var yy = (i * 15 + 6) + Math.sin(j / 128 * TAU * 2 + i) * 4; if (j) c.lineTo(j, yy); else c.moveTo(j, yy); }
      c.stroke();
    }
    for (i = 0; i < 18; i++) { c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(hs(i, 1, 5) * 124, hs(i, 2, 6) * 124, 3, 2); }
    var tx = new T.CanvasTexture(cv); tx.colorSpace = T.SRGBColorSpace; tx.wrapS = tx.wrapT = T.RepeatWrapping; R.textures.push(tx); return tx;
  }
  function levha(text, w, hgt, bg, fg, kenar, alt) {
    var cv = document.createElement('canvas'); cv.width = 512; cv.height = Math.round(512 * hgt / w); var c = cv.getContext('2d');
    c.fillStyle = kenar; c.fillRect(0, 0, cv.width, cv.height);
    c.fillStyle = bg; c.fillRect(8, 8, cv.width - 16, cv.height - 16);
    c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle';
    var fs = Math.round(cv.height * (alt ? 0.46 : 0.56)); c.font = 'bold ' + fs + 'px sans-serif';
    c.fillText(text, 256, cv.height * (alt ? 0.38 : 0.52), 470);
    if (alt) { c.font = 'bold ' + Math.round(cv.height * 0.2) + 'px sans-serif'; c.fillText(alt, 256, cv.height * 0.78, 470); }
    var tx = new T.CanvasTexture(cv); tx.colorSpace = T.SRGBColorSpace; tx.anisotropy = 4; R.textures.push(tx);
    var m = new T.Mesh(new T.PlaneGeometry(w, hgt), new T.MeshBasicMaterial({ map: tx, side: T.DoubleSide }));
    m.userData.dynamicGeometry = true; return m;
  }
  function bayrakDoku() {
    var cv = document.createElement('canvas'); cv.width = 192; cv.height = 128; var c = cv.getContext('2d');
    c.fillStyle = '#e0302b'; c.fillRect(0, 0, 192, 128);
    c.fillStyle = '#fff'; c.beginPath(); c.arc(76, 64, 32, 0, 7); c.fill();
    c.fillStyle = '#e0302b'; c.beginPath(); c.arc(86, 64, 26, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.beginPath();
    for (var i = 0; i < 10; i++) { var r = i % 2 ? 6 : 14, a = -PI / 2 + i * PI / 5; c.lineTo(112 + Math.cos(a) * r, 64 + Math.sin(a) * r); }
    c.closePath(); c.fill();
    var tx = new T.CanvasTexture(cv); tx.colorSpace = T.SRGBColorSpace; R.textures.push(tx); return tx;
  }
  function muralDoku(w, hh) {
    var cv = document.createElement('canvas'); cv.width = w; cv.height = hh; var c = cv.getContext('2d'), i;
    var sky = c.createLinearGradient(0, 0, 0, hh); sky.addColorStop(0, '#7fd0f2'); sky.addColorStop(1, '#d6f2fb');
    c.fillStyle = sky; c.fillRect(0, 0, w, hh);
    c.fillStyle = '#ffd84d'; c.beginPath(); c.arc(w * 0.9, hh * 0.28, hh * 0.17, 0, 7); c.fill();
    for (i = 0; i < 12; i++) { c.strokeStyle = 'rgba(255,216,77,.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(w * 0.9 + Math.cos(i / 12 * TAU) * hh * 0.21, hh * 0.28 + Math.sin(i / 12 * TAU) * hh * 0.21); c.lineTo(w * 0.9 + Math.cos(i / 12 * TAU) * hh * 0.29, hh * 0.28 + Math.sin(i / 12 * TAU) * hh * 0.29); c.stroke(); }
    ['#ff5a5f', '#ffa43a', '#ffe14d', '#59c36a', '#4da3ff', '#a874e8'].forEach(function (col, k) {
      c.strokeStyle = col; c.lineWidth = hh * 0.045; c.beginPath(); c.arc(w * 0.3, hh * 1.05, hh * (0.62 - k * 0.05), PI, TAU); c.stroke();
    });
    c.fillStyle = '#fff'; [[0.08, 0.22], [0.5, 0.18], [0.68, 0.3]].forEach(function (p) {
      c.beginPath(); c.arc(w * p[0], hh * p[1], hh * 0.09, 0, 7); c.arc(w * p[0] + hh * 0.12, hh * p[1] + 4, hh * 0.07, 0, 7); c.arc(w * p[0] - hh * 0.1, hh * p[1] + 6, hh * 0.06, 0, 7); c.fill();
    });
    c.fillStyle = '#6cc36b'; c.beginPath(); c.moveTo(0, hh); for (i = 0; i <= w; i += 16) c.lineTo(i, hh * 0.78 + Math.sin(i / 70) * hh * 0.07); c.lineTo(w, hh); c.fill();
    c.fillStyle = '#4fae5e'; c.beginPath(); c.moveTo(0, hh); for (i = 0; i <= w; i += 16) c.lineTo(i, hh * 0.88 + Math.sin(i / 55 + 2) * hh * 0.05); c.lineTo(w, hh); c.fill();
    var cols = ['#ff5a5f', '#ffa43a', '#4da3ff', '#a874e8', '#59c36a'];
    for (i = 0; i < 7; i++) {   // çocuk silüetleri
      var kx = w * (0.1 + i * 0.13), ky = hh * 0.78, col = cols[i % 5];
      c.fillStyle = col; c.fillRect(kx - 8, ky, 16, hh * 0.13);
      c.fillStyle = '#ffd7b0'; c.beginPath(); c.arc(kx, ky - 7, 9, 0, 7); c.fill();
      c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); c.moveTo(kx - 8, ky + 6); c.lineTo(kx - 20, ky - 10); c.moveTo(kx + 8, ky + 6); c.lineTo(kx + 20, ky - 10); c.stroke();
      if (i % 2) { c.strokeStyle = '#555'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(kx + 20, ky - 10); c.lineTo(kx + 24, ky - hh * 0.2); c.stroke(); c.fillStyle = cols[(i + 2) % 5]; c.beginPath(); c.ellipse(kx + 24, ky - hh * 0.25, 9, 11, 0, 0, 7); c.fill(); }
    }
    for (i = 0; i < 14; i++) { c.fillStyle = cols[i % 5]; c.beginPath(); c.arc(w * (0.04 + i * 0.07), hh * 0.95, 5, 0, 7); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,.9)'; c.font = 'bold ' + Math.round(hh * (w > hh * 9 ? 0.26 : 0.17)) + 'px sans-serif'; c.textAlign = 'center';
    c.fillText('BİRLİKTE OYNUYORUZ!', w * 0.5, hh * 0.3);
    var tx = new T.CanvasTexture(cv); tx.colorSpace = T.SRGBColorSpace; tx.anisotropy = 4; R.textures.push(tx); return tx;
  }

  // ---- ana kurulum
  function dekorKur(h, P) {
    var lvl = R.level, D = dkToplayici(), ds = dkDinamik(), K = { ds: ds, anims: [], cephe: [], su: null, bayrak: null }, dus = P.dusuk;
    var W = h.W, H = h.H, i, j, x, y;
    R.dk = K;
    function sus(n) { return dus && (n & 1); }   // düşük grafik: süs dekorun yarısı atlanır
    var cicekRenk = ['#ff6f91', '#ffd84d', '#fff4e2', '#c58cf0', '#ff9a4d', '#ff4f5e'];

    // --- çiçek tarhı (alçak)
    function tarha(cx, cz, r, seed) {
      D.ekle('cyl', cx, 0.02, cz, r * 2.7, 0.04, r * 2.7, '#7d6a52');
      D.ekle('tor', cx, 0.07, cz, r * 2.5, r * 2.5, r * 2.5 * 1.5, '#cfc7b8', 0, PI / 2, 0);
      D.ekle('cyl', cx, 0.06, cz, r * 2.0, 0.1, r * 2.0, '#6b4f36');
      D.ekle('ball', cx, 0.1, cz, r * 1.8, 0.22, r * 1.8, '#5f9a4a');
      var n = 9;
      for (var k = 0; k < n; k++) {
        var a = k / n * TAU + seed, rr = (k % 3 === 0 ? 0 : 0.5 + (k % 2) * 0.25) * r;
        var col = cicekRenk[(k + (seed * 7 | 0)) % cicekRenk.length];
        D.ekle('ball', cx + Math.cos(a) * rr, 0.2 + (k % 3 === 0 ? 0.07 : 0), cz + Math.sin(a) * rr, 0.14, 0.11, 0.14, col);
        if (k % 3 === 0) D.ekle('ball', cx + Math.cos(a) * rr, 0.29, cz + Math.sin(a) * rr, 0.06, 0.05, 0.06, '#fff3a8');
      }
    }
    function lamba(cx, cz) {
      D.ekle('cyl', cx, 0.05, cz, 0.22, 0.1, 0.22, '#4b5159');
      D.ekle('cyl', cx, 0.85, cz, 0.07, 1.65, 0.07, '#434a52');
      D.ekle('cyl', cx, 1.72, cz, 0.18, 0.06, 0.18, '#434a52');
      D.ekle('ball', cx, 1.9, cz, 0.3, 0.34, 0.3, '#fff2b8');
      D.ekle('cyl', cx, 2.1, cz, 0.34, 0.1, 0.34, '#3b4148'); D.ekle('ball', cx, 2.17, cz, 0.24, 0.12, 0.24, '#3b4148');
    }
    function cop(cx, cz, renk) {
      D.ekle('cyl', cx, 0.27, cz, 0.38, 0.54, 0.38, renk);
      D.ekle('cyl', cx, 0.56, cz, 0.43, 0.07, 0.43, '#3d4a52');
      D.ekle('box', cx, 0.33, cz, 0.2, 0.05, 0.4, '#f4f1e6');
    }
    function calikum(cx, cz, s, seed) {
      D.ekle('ball', cx + 0.03, 0.02, cz + 0.03, s * 1.3, 0.04, s * 1.15, '#5b7f4b');   // temas gölgesi
      D.ekle('ball', cx, 0.3 * s, cz, s * 1.05, s * 0.75, s * 0.95, '#4b7b41');
      D.ekle('ball', cx - s * 0.32, 0.22 * s, cz + s * 0.12, s * 0.7, s * 0.55, s * 0.65, '#5a8c49');
      D.ekle('ball', cx + s * 0.34, 0.2 * s, cz - s * 0.1, s * 0.6, s * 0.5, s * 0.6, '#3f6e39');
      if (seed > 0.55) { D.ekle('ball', cx - 0.12, 0.52 * s, cz + 0.1, 0.1, 0.1, 0.1, '#ff6f91'); D.ekle('ball', cx + 0.14, 0.46 * s, cz - 0.12, 0.09, 0.09, 0.09, '#ffd84d'); }
    }

    // --- kelebekler ve kuşlar (hareketli)
    function kelebek(idx, cx, cz) {
      var cols = ['#ff8fb1', '#ffd84d', '#8fd0ff', '#ffa94d', '#c9a0ff'], c1 = cols[idx % cols.length];
      var g = ds.yuva('ball', '#4a3b30'), w1 = ds.yuva('plane', c1), w2 = ds.yuva('plane', c1);
      var rad = 1.2 + hs(idx, 3, 41) * 1.8, ph = idx * 1.9, spd = 0.35 + hs(idx, 4, 42) * 0.25, M = new T.Matrix4(), ws = 0.2;
      function pos(t, o) {
        var a = t * spd + ph;
        o[0] = cx + Math.cos(a) * rad + Math.sin(a * 2.3) * 0.5; o[1] = cz + Math.sin(a * 1.3) * rad * 0.8; return o;
      }
      var p0 = [0, 0], p1 = [0, 0];
      K.anims.push(function (t) {
        pos(t, p0); pos(t + 0.1, p1);
        var y0 = 0.75 + Math.sin(t * 1.7 + ph) * 0.25 + Math.abs(Math.sin(t * 9 + ph)) * 0.04, hd = Math.atan2(p1[0] - p0[0], p1[1] - p0[1]);
        var fl = 0.15 + 0.95 * Math.abs(Math.sin(t * 13 + ph));
        kompoze(M, p0[0], y0, p0[1], 1, 1, 1, 0, hd, 0);
        ds.yazM(g, mB.multiplyMatrices(M, kompoze(mC, 0, 0, 0, 0.05, 0.05, 0.17)));
        [w1, w2].forEach(function (wg, k) {
          var side = k ? -1 : 1;
          kompoze(mA, 0, 0, 0, 1, 1, 1, 0, 0, side * fl);
          mC.multiplyMatrices(M, mA);
          kompoze(mA, side * ws / 2, 0, 0, ws, ws * 0.85, 1, -PI / 2, 0, 0);
          ds.yazM(wg, mB.multiplyMatrices(mC, mA));
        });
      });
    }
    function serce(idx, cx, cz) {   // yerde zıplayan serçe
      var br = idx % 2 ? '#a98258' : '#8c6a47';
      var A = dkAktor(ds, [
        { k: 'ball', c: br, x: 0, y: 0.13, z: 0, sx: 0.2, sy: 0.16, sz: 0.27 },
        { k: 'ball', c: '#d9c3a0', x: 0, y: 0.09, z: 0.03, sx: 0.15, sy: 0.1, sz: 0.2 },
        { k: 'ball', c: '#7d5f40', x: 0, y: 0.22, z: 0.12, sx: 0.13, sy: 0.12, sz: 0.13 },
        { k: 'ball', c: '#f2b13a', x: 0, y: 0.21, z: 0.215, sx: 0.04, sy: 0.04, sz: 0.08 },
        { k: 'ball', c: '#6e5238', x: 0, y: 0.15, z: -0.17, sx: 0.07, sy: 0.03, sz: 0.15, rx: 0.3 },
        { k: 'ball', c: '#6f5338', x: -0.1, y: 0.15, z: -0.01, sx: 0.04, sy: 0.1, sz: 0.2 },
        { k: 'ball', c: '#6f5338', x: 0.1, y: 0.15, z: -0.01, sx: 0.04, sy: 0.1, sz: 0.2 },
        { k: 'ball', c: '#222', x: -0.045, y: 0.235, z: 0.17, sx: 0.025, sy: 0.025, sz: 0.025 },
        { k: 'ball', c: '#222', x: 0.045, y: 0.235, z: 0.17, sx: 0.025, sy: 0.025, sz: 0.025 }
      ]), M = new T.Matrix4(), ph = idx * 2.3, rad = 0.9 + hs(idx, 5, 43) * 0.8;
      K.anims.push(function (t) {
        var a = t * 0.18 + ph, x0 = cx + Math.cos(a) * rad, z0 = cz + Math.sin(a * 1.4) * rad * 0.8;
        var dx = -Math.sin(a) * rad, dz = Math.cos(a * 1.4) * 1.4 * rad * 0.8, hd = Math.atan2(dx, dz);
        var cyc = (t * 1.3 + ph) % 4, peck = cyc > 2.6 ? Math.sin((cyc - 2.6) / 1.4 * PI * 3) : 0, hop = cyc < 2.6 ? Math.abs(Math.sin(t * 8 + ph)) * 0.045 : 0;
        ebeveyn(M, x0, hop, z0, hd, Math.max(0, peck) * 0.55, 0.12, 1);
        A.ciz(M);
      });
    }
    function ucanKus(idx) {
      var A = dkAktor(ds, [
        { k: 'ball', c: '#fbf6ec', x: 0, y: 0, z: 0, sx: 0.22, sy: 0.18, sz: 0.46 },
        { k: 'ball', c: '#fbf6ec', x: 0, y: 0.03, z: 0.2, sx: 0.14, sy: 0.14, sz: 0.16 },
        { k: 'ball', c: '#ffb13a', x: 0, y: 0.02, z: 0.3, sx: 0.05, sy: 0.05, sz: 0.1 }
      ]), wl = ds.yuva('ball', '#e8edf4'), wr = ds.yuva('ball', '#e1e8f0'), M = new T.Matrix4(), ph = idx * 2.1;
      var cx = W / 2 + (idx - 1) * 3, cz = H / 2 + (idx % 2 ? 2 : -2), rad = 9 + idx * 3, sp = 0.13 + idx * 0.02;
      K.anims.push(function (t) {
        var a = t * sp + ph, x0 = cx + Math.cos(a) * rad, z0 = cz + Math.sin(a) * rad * 0.7, y0 = 5.4 + Math.sin(t * 0.8 + ph) * 0.5;
        var hd = Math.atan2(-Math.sin(a) * rad, Math.cos(a) * rad * 0.7);
        kompoze(M, x0, y0, z0, 1.2, 1.2, 1.2, 0, hd, 0);
        A.ciz(M);
        var fl = Math.sin(t * 7 + ph) * 0.65;
        [wl, wr].forEach(function (wg, k) {
          var side = k ? -1 : 1;
          kompoze(mA, 0, 0, 0, 1, 1, 1, 0, 0, side * fl);
          mC.multiplyMatrices(M, mA);
          kompoze(mA, side * 0.3, 0.02, -0.02, 0.62, 0.05, 0.3, 0, 0, 0);
          ds.yazM(wg, mB.multiplyMatrices(mC, mA));
        });
      });
    }
    // Rastgele çimenlik merkezli kelebek odakları (yürüme yollarını kapatmaz: yalnız görüntü, havada).
    var kelebekSay = { 1: 3, 2: 4, 3: 7, 4: 4 }[lvl] || 3;
    if (dus) kelebekSay = Math.ceil(kelebekSay / 2);
    var kmerk = P.sec(Math.max(3, Math.ceil(kelebekSay / 2)), null, 5, 51);
    kmerk.forEach(function (q) { P.kul[q.y * W + q.x] = 0; });   // yalnız odak seçimi içindi
    for (i = 0; i < kelebekSay && kmerk.length; i++) { var kp = kmerk[i % kmerk.length]; kelebek(i, kp.x + 0.5, kp.y + 0.5); }

    // ================= BÖLÜM 3: BELEDİYE PARKI =================
    if (lvl === 3) {
      var hv = P.havuz;
      if (hv) {
        var fx = hv.tx + hv.w / 2, fz = hv.ty + hv.h / 2;
        D.ekle('cyl', fx, 0.035, fz, 3.55, 0.07, 3.55, '#ece2cc');
        D.ekle('cyl', fx, 0.09, fz, 2.95, 0.05, 2.95, '#b4a893');
        D.ekle('tor', fx, 0.2, fz, 2.9, 2.9, 2.9 * 0.85, '#e8dcc3', 0, PI / 2, 0);
        D.ekle('cyl', fx, 0.2, fz, 2.5, 0.2, 2.5, '#8fc9da');
        D.ekle('cyl', fx, 0.55, fz, 1.2, 0.18, 1.2, '#e8decb');
        D.ekle('cyl', fx, 0.65, fz, 1.0, 0.04, 1.0, '#73c7e6');
        D.ekle('cyl', fx, 0.9, fz, 0.3, 0.55, 0.3, '#ddd1ba');
        D.ekle('cyl', fx, 1.2, fz, 0.62, 0.1, 0.62, '#e8decb');
        D.ekle('cyl', fx, 1.26, fz, 0.5, 0.03, 0.5, '#73c7e6');
        D.ekle('ball', fx, 1.42, fz, 0.2, 0.2, 0.2, '#f4cc52');
        // dalgalı su yüzeyi
        var stx = suDoku(), su = new T.Mesh(new T.CircleGeometry(1.27, 30), new T.MeshStandardMaterial({ map: stx, roughness: 0.2, metalness: 0.05, emissive: '#1d5f86', emissiveIntensity: 0.35 }));
        su.userData.dynamicGeometry = true; su.rotation.x = -PI / 2; su.position.set(fx, 0.31, fz); su.receiveShadow = true; stx.repeat.set(1.4, 1.4); R.world.add(su); K.su = stx;
        K.anims.push(function (t) { stx.offset.set(t * 0.035, Math.sin(t * 0.4) * 0.05 + t * 0.02); su.position.y = 0.31 + Math.sin(t * 1.6) * 0.004; });
        // çeşme damlaları
        var nd = dus ? 12 : 20, dr = [];
        for (i = 0; i < nd; i++) dr.push({ s: ds.yuva('ball', i % 3 ? '#c7efff' : '#ffffff'), a: i * 2.4 + hs(i, 1, 7), rr: 0.7 + hs(i, 2, 8) * 0.45, ph: i / nd });
        for (i = 0; i < 6; i++) dr.push({ s: ds.yuva('ball', '#d9f5ff'), a: 0, rr: 0, ph: i / 6, dik: true });
        K.anims.push(function (t) {
          for (var q = 0; q < dr.length; q++) {
            var e = dr[q], u = (t * (e.dik ? 0.9 : 1.15) + e.ph) % 1, tau = u * 0.9, yy2, xx2 = fx, zz2 = fz, sz = 0.075;
            if (e.dik) { yy2 = 1.45 + 1.1 * 4 * u * (1 - u); sz = 0.085; xx2 += Math.cos(q) * 0.04; zz2 += Math.sin(q) * 0.04; }
            else { yy2 = 1.5 + 2.9 * tau - 4.5 * tau * tau; xx2 += Math.cos(e.a) * e.rr * u; zz2 += Math.sin(e.a) * e.rr * u; if (yy2 < 0.34) sz = 0; }
            ds.yaz(e.s, xx2, yy2, zz2, sz, sz * 1.25, sz);
          }
        });
        // halka dalgalar + parıltı
        var halka = [], pr = [];
        for (i = 0; i < 3; i++) halka.push(ds.yuva('tor', '#f0fbff'));
        for (i = 0; i < (dus ? 4 : 8); i++) pr.push({ s: ds.yuva('plane', '#ffffff'), x: fx + (hs(i, 3, 9) - 0.5) * 2.0, z: fz + (hs(i, 4, 9) - 0.5) * 2.0, ph: hs(i, 5, 9) * 6 });
        K.anims.push(function (t) {
          for (var q = 0; q < halka.length; q++) {
            var u = (t * 0.45 + q / 3) % 1, r = 0.25 + u * 0.9, th = Math.max(0.02, (1 - u) * 0.9);
            ds.yaz(halka[q], fx + 0.0, 0.325, fz + 0.0, r * 2, r * 2, r * 2 * th, PI / 2, 0, 0);
          }
          for (q = 0; q < pr.length; q++) {
            var s2 = Math.max(0, Math.sin(t * 2.6 + pr[q].ph)); s2 *= s2;
            if (Math.hypot(pr[q].x - fx, pr[q].z - fz) > 1.1) { ds.gizle(pr[q].s); continue; }
            ds.yaz(pr[q].s, pr[q].x, 0.33, pr[q].z, 0.2 * s2, 0.2 * s2, 1, -PI / 2);
          }
        });
        // meydan çevresine çeşme etrafı çiçekliği (alçak)
        [[-2.5, -2.4], [2.5, -2.4], [-2.5, 2.4], [2.5, 2.4]].forEach(function (o, k) {
          var tx0 = Math.floor(fx + o[0]), ty0 = Math.floor(fz + o[1]);
          if (!sus(k) && h.zemin(tx0, ty0) === 'toprak' && !h.kati(tx0, ty0) && !P.occ[ty0 * W + tx0] && !P.ban[ty0 * W + tx0]) tarha(tx0 + 0.5, ty0 + 0.5, 0.36, k);
        });
        // meydanda ve yakınında serçeler
        for (i = 0; i < (dus ? 2 : 3); i++) serce(i, fx + (i - 1) * 0.6, fz + 2.6);
      }
      // çiçek tarhları
      var tr = P.sec(dus ? 6 : 12, function (a, b) { return P.komsu(a, b, 'cakil'); }, 4.2, 61);
      tr.forEach(function (p, k) { tarha(p.x + 0.5, p.y + 0.5, 0.4, k * 1.7); });
      // lamba direkleri
      P.sec(9, function (a, b) { return P.komsu(a, b, 'cakil'); }, 7, 62).forEach(function (p) { lamba(p.x + 0.5, p.y + 0.5); });
      // çöp kutuları
      P.sec(dus ? 2 : 4, function (a, b) { return P.komsu(a, b, 'cakil'); }, 9, 63).forEach(function (p, k) { cop(p.x + 0.5, p.y + 0.5, ['#4f93c9', '#e0734f', '#59ad68', '#e8c14a'][k % 4]); });
      // çit dibinde çalılar
      var cn = 0;
      for (y = 1; y < H - 1; y++) for (x = 1; x < W - 1; x++) {
        if (h.zemin(x, y) !== 'cit' || hs(x, y, 71) > 0.62) continue;
        var dxy = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        for (j = 0; j < 4; j++) {
          var ax = x + dxy[j][0], ay = y + dxy[j][1];
          if (P.serbest(ax, ay)) { if (!sus(cn++)) calikum(ax + 0.5 - dxy[j][0] * 0.22, ay + 0.5 - dxy[j][1] * 0.22, 0.55 + hs(x, y, 72) * 0.3, hs(x, y, 73)); break; }
        }
      }
      // park tabelası (sokak tarafı, çit karoları üstünde; yürünebilir alan değil)
      var tbx = Math.round(W / 2) - 0.5, tby = 5;
      var okFence = true; for (x = Math.floor(tbx - 1.7); x <= Math.ceil(tbx + 1.7); x++) if (h.zemin(x, tby) !== 'cit') okFence = false;
      if (okFence) {
        [-1.7, 1.7].forEach(function (o) { D.ekle('box', tbx + o, 1.0, tby + 0.5, 0.14, 2.0, 0.14, '#7a5230'); D.ekle('ball', tbx + o, 2.02, tby + 0.5, 0.2, 0.2, 0.2, '#f1c14a'); });
        var lv1 = levha('BELEDİYE PARKI', 3.3, 0.85, '#2f8a57', '#fffbe6', '#f4e3b5', 'Hoş geldiniz!');
        D.ekle('box', tbx, 1.55, tby + 0.5, 3.4, 0.92, 0.07, '#7a5230');
        lv1.position.set(tbx, 1.55, tby + 0.5 + 0.045); R.world.add(lv1);
      }
      for (i = 0; i < (dus ? 1 : 2); i++) ucanKus(i);
    }

    // ================= BÖLÜM 4: OKUL BAHÇESİ =================
    if (lvl === 4) {
      var bd = h.esyalar.filter(function (e) { return e.tur === 'bayrak_diregi'; })[0];
      if (bd) {
        var bx = bd.tx + bd.w / 2, bz = bd.ty + bd.h / 2;
        D.ekle('cyl', bx, 0.07, bz, 0.4, 0.14, 0.4, '#9aa0a8'); D.ekle('cyl', bx, 0.2, bz, 0.28, 0.12, 0.28, '#c9ced4');
        D.ekle('cyl', bx, 1.8, bz, 0.075, 3.4, 0.075, '#eeeeef'); D.ekle('ball', bx, 3.55, bz, 0.17, 0.17, 0.17, '#f1c53f');
        var ftx = bayrakDoku(), fg = new T.PlaneGeometry(1.25, 0.83, 12, 4);
        fg.translate(0.625, 0, 0);
        var fm = new T.Mesh(fg, new T.MeshBasicMaterial({ map: ftx, side: T.DoubleSide }));
        fm.position.set(bx + 0.06, 3.0, bz); R.world.add(fm); fm.frustumCulled = false;
        var fp = fg.attributes.position, base = new Float32Array(fp.array);
        fm.userData.dynamicGeometry = true;
        K.anims.push(function (t) {
          for (var q = 0; q < fp.count; q++) {
            var bxx = base[q * 3], byy = base[q * 3 + 1], u = bxx / 1.25;
            fp.setXYZ(q, bxx * (1 - u * 0.05), byy - u * u * 0.05 + Math.sin(t * 3.2 + u * 6) * 0.03 * u, Math.sin(t * 4.4 - u * 7) * 0.11 * u);
          }
          fp.needsUpdate = true;
        });
      }
      // renkli boyalı duvar resimleri: kuzey çit (yürünemez karolar) ve batı çit
      function muralKoy(x0, z0, uzun, yuk, yon, w, hh) {
        var tx = muralDoku(w, hh), m = new T.Mesh(new T.PlaneGeometry(uzun, yuk), new T.MeshBasicMaterial({ map: tx, side: T.DoubleSide }));
        m.userData.dynamicGeometry = true; m.position.set(x0, 0.12 + yuk / 2, z0); m.rotation.y = yon; R.world.add(m);
        D.ekle('box', x0, 0.06, z0, yon ? 0.16 : uzun + 0.1, 0.12, yon ? uzun + 0.1 : 0.16, '#c9a57a');
      }
      var fence = true;
      for (x = 23; x <= 35; x++) if (h.zemin(x, 5) !== 'cit') fence = false;
      if (fence) muralKoy(29.5, 5.93, 12.6, 1.0, 0, 1280, 100);
      var fenceW = true;
      for (y = 8; y <= 14; y++) if (h.zemin(2, y) !== 'cit') fenceW = false;
      if (fenceW) muralKoy(2.93, 11.5, 7, 0.95, PI / 2, 768, 100);
      // okul kapısı levhaları (çit karoları üstünde direkler)
      var gi = 0;
      h.kapilar.forEach(function (k) {
        if (k.ty !== 5) return;
        var okk = h.zemin(k.tx - 1, 5) === 'cit' && h.zemin(k.tx + 1, 5) === 'cit'; if (!okk) return;
        var cx = k.tx + 0.5;
        [-1.0, 1.0].forEach(function (o) { D.ekle('box', cx + o, 1.05, 5.5, 0.15, 2.1, 0.15, '#2f6fb5'); D.ekle('ball', cx + o, 2.14, 5.5, 0.22, 0.22, 0.22, '#f1c53f'); });
        var a1 = levha(gi ? 'OKUL BAHÇESİ' : 'İLKOKUL', 2.0, 0.55, '#2f6fb5', '#fff7d6', '#f1c53f');
        D.ekle('box', cx, 1.85, 5.5, 2.1, 0.62, 0.07, '#244f86');
        a1.position.set(cx, 1.85, 5.5 + 0.045); R.world.add(a1); gi++;
      });
      // bisiklet park yeri (zemine boyanmış alan: floorTexture, burada raf ve bisikletler)
      var bk = P.bisiklet;
      if (bk) {
        var bcols = ['#e6483d', '#3f8fd9', '#59b86b', '#ffb02e', '#a874e8'], nb = dus ? 2 : 4;
        for (i = 0; i < bk.w; i++) {   // U raflar
          var rx2 = bk.x + 0.5 + i;
          D.ekle('box', rx2, 0.22, bk.y + 1.5, 0.05, 0.44, 0.05, '#6b7078'); D.ekle('box', rx2 + 0.28, 0.22, bk.y + 1.5, 0.05, 0.44, 0.05, '#6b7078');
          D.ekle('box', rx2 + 0.14, 0.44, bk.y + 1.5, 0.33, 0.05, 0.05, '#6b7078');
        }
        for (i = 0; i < nb; i++) {
          var bxx2 = bk.x + 0.6 + i * (bk.w - 1) / Math.max(1, nb - 1) * 0.95, bzz = bk.y + 0.7 + (i % 2) * 0.12, col = bcols[i % 5];
          D.ekle('tor', bxx2, 0.26, bzz - 0.35, 0.5, 0.5, 0.5, '#2c2f33', PI / 2, 0, PI / 2 * 0);
          D.ekle('tor', bxx2, 0.26, bzz + 0.35, 0.5, 0.5, 0.5, '#2c2f33', PI / 2, 0, PI / 2 * 0);
          D.ekle('box', bxx2, 0.42, bzz, 0.05, 0.05, 0.75, col);
          D.ekle('box', bxx2, 0.55, bzz - 0.08, 0.05, 0.3, 0.05, col, 0, 0.3);
          D.ekle('box', bxx2, 0.6, bzz + 0.3, 0.05, 0.3, 0.05, col, 0, -0.2);
          D.ekle('box', bxx2, 0.74, bzz + 0.34, 0.3, 0.04, 0.04, '#333');
          D.ekle('box', bxx2, 0.7, bzz - 0.14, 0.09, 0.04, 0.16, '#2b2b2b');
        }
      }
      // çiçek tarhları ve lambalar (bina önü kaldırımı ve bahçe)
      P.sec(dus ? 4 : 8, function (a, b) { return P.komsu(a, b, 'kaldirim') || P.komsu(a, b, 'cakil'); }, 5, 64).forEach(function (p, k) { tarha(p.x + 0.5, p.y + 0.5, 0.4, k * 1.3); });
      P.sec(5, function (a, b) { return P.komsu(a, b, 'cakil') || P.komsu(a, b, 'kaldirim'); }, 8, 65).forEach(function (p) { lamba(p.x + 0.5, p.y + 0.5); });
      P.sec(dus ? 1 : 3, function (a, b) { return P.komsu(a, b, 'kaldirim'); }, 10, 66).forEach(function (p, k) { cop(p.x + 0.5, p.y + 0.5, ['#4f93c9', '#e0734f', '#59ad68'][k % 3]); });
      var cn2 = 0;
      for (y = 6; y < 19; y++) for (x = 3; x < W - 2; x++) {   // çit dibinde çalılar
        if (h.zemin(x, y) !== 'cim' || !(x === 3 || x === 41 || (y === 6 && x > 3 && x < 41)) || hs(x, y, 74) > 0.45 || !P.serbest(x, y)) continue;
        if (!sus(cn2++)) calikum(x + 0.5, y + 0.5, 0.5 + hs(x, y, 75) * 0.25, hs(x, y, 76));
      }
      for (i = 0; i < (dus ? 1 : 2); i++) ucanKus(i);
      for (i = 0; i < (dus ? 1 : 2); i++) serce(i, bk ? bk.x + 2 : 20, bk ? bk.y + 2.6 : 15);
    }

    // ================= BÖLÜM 1 ve 2: bahçe dokunuşları =================
    if (lvl === 1 || lvl === 2) {
      // sulama hortumu: duvara bitişik serbest bir karoda musluk + sarılı hortum + kova
      var hp = P.sec(1, function (a, b) { return P.duvarArka(a, b); }, 5, 81); K.dbg = { hose: hp.length, at: hp[0] };
      if (hp.length) {
        var hx = hp[0].x + 0.5, hz = hp[0].y + 0.5, ox = 0, oz = 0;
        if (h.zemin(hp[0].x - 1, hp[0].y) === 'duvar') ox = -1; else oz = -1;
        D.ekle('box', hx + ox * 0.46, 0.34, hz + oz * 0.46, 0.1, 0.1, 0.1, '#b9a15a');
        D.ekle('box', hx + ox * 0.46, 0.42, hz + oz * 0.46, 0.06, 0.06, 0.06, '#d94f3f');
        for (i = 0; i < 3; i++) D.ekle('tor', hx - ox * 0.12 - oz * 0.0, 0.05 + i * 0.045, hz - oz * 0.12, 0.38 - i * 0.04, 0.38 - i * 0.04, 0.38 - i * 0.04, '#3fae5f', 0, PI / 2, 0);
        D.ekle('box', hx + oz * 0.38, 0.03, hz - ox * 0.38, oz ? 0.5 : 0.05, 0.04, ox ? 0.5 : 0.05, '#3fae5f');
        // sulama kovası
        var kx = hx + oz * 0.34, kz = hz + ox * 0.34;
        D.ekle('cyl', kx, 0.14, kz, 0.2, 0.28, 0.2, '#4aa3d9');
        D.ekle('box', kx + 0.15, 0.2, kz, 0.14, 0.035, 0.035, '#3b86b8', 0, 0, 0.6);
        D.ekle('tor', kx, 0.3, kz, 0.2, 0.2, 0.2, '#3b86b8', 0, 0, 0);
      }
      // çiçek saksıları (duvar kenarında)
      P.sec(dus ? 2 : 4, function (a, b) { return P.duvarArka(a, b); }, 7, 82).forEach(function (p, k) {
        var cx = p.x + 0.5, cz = p.y + 0.5;
        D.ekle('cyl', cx, 0.12, cz, 0.3, 0.24, 0.3, k % 2 ? '#d9703f' : '#c25a3a'); D.ekle('cyl', cx, 0.25, cz, 0.34, 0.05, 0.34, '#e07f4c');
        D.ekle('ball', cx, 0.34, cz, 0.32, 0.2, 0.32, '#5ca04c');
        for (var q = 0; q < 3; q++) D.ekle('ball', cx + (q - 1) * 0.09, 0.42 + (q % 2) * 0.05, cz + (q === 1 ? 0.05 : -0.04), 0.11, 0.1, 0.11, cicekRenk[(k * 2 + q) % cicekRenk.length]);
      });
      P.sec(dus ? 3 : 6, function (a, b) { return P.komsu(a, b, 'cit'); }, 4, 83).forEach(function (p, k) { tarha(p.x + 0.5, p.y + 0.5, 0.36, k * 1.1); });
      if (lvl === 2) {
        // kümes tavukları: hafif dolaşır, yem yer
        var tv = h.esyalar.filter(function (e) { return e.tur === 'tavuk'; });
        tv.forEach(function (e, k) {
          var brn = k % 3 === 1, cx = e.tx + e.w / 2, cz = e.ty + e.h / 2, bc = brn ? '#d6a56b' : '#fbf8f0', wc = brn ? '#b57d44' : '#f3e5c6';
          var A = dkAktor(ds, [
            { k: 'ball', c: bc, x: 0, y: 0.44, z: -0.02, sx: 0.4, sy: 0.36, sz: 0.52 },
            { k: 'ball', c: brn ? '#a56a35' : '#f0e2c2', x: 0, y: 0.6, z: -0.31, sx: 0.14, sy: 0.32, sz: 0.2, rx: -0.5 },
            { k: 'ball', c: bc, x: 0, y: 0.76, z: 0.19, sx: 0.22, sy: 0.22, sz: 0.22 },
            { k: 'ball', c: '#d9453d', x: 0, y: 0.91, z: 0.18, sx: 0.07, sy: 0.1, sz: 0.1 },
            { k: 'ball', c: '#f2c14e', x: 0, y: 0.77, z: 0.33, sx: 0.07, sy: 0.06, sz: 0.12 },
            { k: 'ball', c: '#d9453d', x: 0, y: 0.7, z: 0.275, sx: 0.045, sy: 0.07, sz: 0.04 },
            { k: 'ball', c: wc, x: -0.205, y: 0.46, z: -0.02, sx: 0.08, sy: 0.22, sz: 0.3 },
            { k: 'ball', c: wc, x: 0.205, y: 0.46, z: -0.02, sx: 0.08, sy: 0.22, sz: 0.3 },
            { k: 'ball', c: '#2f343a', x: -0.075, y: 0.81, z: 0.29, sx: 0.035, sy: 0.035, sz: 0.03 },
            { k: 'ball', c: '#2f343a', x: 0.075, y: 0.81, z: 0.29, sx: 0.035, sy: 0.035, sz: 0.03 },
            { k: 'cyl', c: '#e08a3c', x: -0.09, y: 0.14, z: 0.05, sx: 0.036, sy: 0.28, sz: 0.036 },
            { k: 'cyl', c: '#e08a3c', x: 0.09, y: 0.14, z: 0.05, sx: 0.036, sy: 0.28, sz: 0.036 }
          ]), M = new T.Matrix4(), ph = k * 1.7 + 0.4, hy0 = (e.yon || 0) * PI / 2;
          K.anims.push(function (t) {
            var a = t * 0.22 + ph, mv = Math.sin(a * 0.9) > 0.35;   // arada durup yem yer
            var x0 = cx + Math.cos(a) * 0.22, z0 = cz + Math.sin(a * 1.3) * 0.2;
            var hd = mv ? Math.atan2(-Math.sin(a) * 0.22, Math.cos(a * 1.3) * 0.26) : hy0 + Math.sin(a) * 0.4;
            var cyc = (t * 1.1 + ph) % 3, peck = (!mv && cyc < 1.8) ? Math.max(0, Math.sin(cyc / 1.8 * PI * 4)) * 0.6 : 0;
            var bob = mv ? Math.abs(Math.sin(t * 7 + ph)) * 0.02 : 0;
            ebeveyn(M, x0, bob, z0, hd, peck, 0.3, 1);
            A.ciz(M);
          });
        });
      }
    }

    // ================= bina cepheleri (B3, B4): pencere, kapı saçağı, tabela; duvar yüksekliğine uyar =================
    if (lvl === 3 || lvl === 4) {
      var wIdx = {}, outd = function (a, b) { return a >= 0 && b >= 0 && a < W && b < H && !!P.dis[b * W + a]; };
      R.walls.forEach(function (w, wi) { wIdx[w.ty * W + w.tx] = wi; });
      var dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      var nwin = 0;
      R.walls.forEach(function (w, wi) {
        var outs = [], k;
        for (k = 0; k < 4; k++) if (outd(w.tx + dirs[k][0], w.ty + dirs[k][1])) outs.push(dirs[k]);
        if (outs.length !== 1) return;
        var n = outs[0], horiz = n[1] !== 0, al = horiz ? w.tx : w.ty;
        if (al % 3 !== 1) return;
        var a1 = horiz ? [w.tx - 1, w.ty] : [w.tx, w.ty - 1], a2 = horiz ? [w.tx + 1, w.ty] : [w.tx, w.ty + 1];
        if (!h.duvarMi(a1[0], a1[1]) || !h.duvarMi(a2[0], a2[1]) || h.kapiAt(a1[0], a1[1]) || h.kapiAt(a2[0], a2[1])) return;
        if (sus(nwin++)) return;
        K.cephe.push({ t: 'p', wi: wi, x: w.x + n[0] * 0.5, z: w.z + n[1] * 0.5, nx: n[0], nz: n[1], ry: horiz ? 0 : PI / 2,
          f: ds.yuva('box', '#fff6dc'), g: ds.yuva('box', '#8fd0ee'), s: ds.yuva('box', '#c99c70'), m: ds.yuva('box', '#fff6dc') });
      });
      if (lvl === 4) {   // güney cephede büyük İLKOKUL levhası (kamera bu yüzü görür)
        var sx0 = Math.round(W / 2), sy0 = 0;
        for (y = H - 1; y >= 0; y--) if (wIdx[y * W + sx0] != null && outd(sx0, y + 1)) { sy0 = y; break; }
        if (sy0) {
          var sm0 = levha('İLKOKUL', 3.4, 0.62, '#2f6fb5', '#fff7d6', '#f1c53f');
          R.world.add(sm0); K.cephe.push({ t: 's', wi: wIdx[sy0 * W + sx0], x: sx0 + 0.5, z: sy0 + 1, nx: 0, nz: 1, sg: sm0 });
        }
      }
      var sgn = 0;
      h.kapilar.forEach(function (k) {
        var nb = null, d2;
        for (d2 = 0; d2 < 4; d2++) if (outd(k.tx + dirs[d2][0], k.ty + dirs[d2][1])) nb = dirs[d2];
        if (!nb) return;
        var horiz = nb[1] !== 0, a1 = horiz ? [k.tx - 1, k.ty] : [k.tx, k.ty - 1], wi2 = wIdx[a1[1] * W + a1[0]];
        if (wi2 == null) return;
        var cx = k.tx + 0.5 + nb[0] * 0.5, cz = k.ty + 0.5 + nb[1] * 0.5;
        var it = { t: 'k', wi: wi2, x: cx, z: cz, nx: nb[0], nz: nb[1], ry: horiz ? 0 : PI / 2, a: ds.yuva('box', lvl === 4 ? '#e24b3b' : '#3f8fd9'), v: ds.yuva('box', '#fff6dc'), sg: null };
        var inner = h.odaAdi((k.tx + 0.5 - nb[0]) * U, (k.ty + 0.5 - nb[1]) * U);
        var txt = lvl === 4 ? 'İLKOKUL' : (inner && !/Park|Sokak/.test(inner) ? inner : null);
        if (txt) {
          var sm = levha(String(txt).toLocaleUpperCase('tr'), 1.9, 0.34, lvl === 4 ? '#2f6fb5' : '#2f8a57', '#fff7d6', '#fff0c0');
          sm.rotation.y = horiz ? (nb[1] > 0 ? 0 : PI) : (nb[0] > 0 ? PI / 2 : -PI / 2); R.world.add(sm); it.sg = sm;
        }
        K.cephe.push(it); sgn++;
      });
    }

    D.bitir(R.world); ds.bitir(R.world);
  }
  function dekorGuncelle(d, dt) {
    var K = R.dk; if (!K) return; var t = d.zaman, i, c, w, ht, f;
    for (i = 0; i < K.anims.length; i++) K.anims[i](t, dt);
    var ds = K.ds;
    for (i = 0; i < K.cephe.length; i++) {
      c = K.cephe[i]; w = R.walls[c.wi]; ht = w ? w.h : 1.35;
      if (c.son === ht) continue; c.son = ht;
      var vis = ht > 0.92, ry = c.ry;
      if (c.t === 'p') {
        f = Math.max(0, Math.min(1, (ht - 0.5) / 0.85));
        if (f < 0.04) { ds.gizle(c.f); ds.gizle(c.g); ds.gizle(c.s); ds.gizle(c.m); continue; }
        var cy = 0.1 + ht * 0.7, ox = c.nx * 0.03, oz = c.nz * 0.03;
        ds.yaz(c.f, c.x + ox, cy, c.z + oz, c.nz ? 0.78 : 0.08, 0.58 * f, c.nz ? 0.08 : 0.78, 0, 0, 0);
        ds.yaz(c.g, c.x + c.nx * 0.045, cy, c.z + c.nz * 0.045, c.nz ? 0.62 : 0.08, 0.44 * f, c.nz ? 0.08 : 0.62, 0, 0, 0);
        ds.yaz(c.m, c.x + c.nx * 0.06, cy, c.z + c.nz * 0.06, c.nz ? 0.05 : 0.07, 0.46 * f, c.nz ? 0.07 : 0.05, 0, 0, 0);
        ds.yaz(c.s, c.x + c.nx * 0.1, cy - 0.31 * f, c.z + c.nz * 0.1, c.nz ? 0.92 : 0.2, 0.07 * f, c.nz ? 0.2 : 0.92, 0, 0, 0);
      } else if (c.t === 's') {
        var fs2 = Math.max(0, Math.min(1, (ht - 0.9) / 0.4));
        c.sg.visible = fs2 > 0.3; c.sg.position.set(c.x, 0.1 + ht * 0.86, c.z + 0.04); c.sg.scale.set(1, Math.max(0.05, fs2), 1);
      } else {
        if (!vis) { ds.gizle(c.a); ds.gizle(c.v); if (c.sg) c.sg.visible = false; continue; }
        var ff = Math.max(0, Math.min(1, (ht - 0.92) / 0.4));
        var ay = 0.1 + ht * 0.8;
        ds.yaz(c.a, c.x + c.nx * 0.3, ay, c.z + c.nz * 0.3, c.nz ? 1.55 : 0.62, 0.07 * ff, c.nz ? 0.62 : 1.55, c.nz ? c.nz * 0.22 : 0, 0, c.nx ? -c.nx * 0.22 : 0);
        ds.yaz(c.v, c.x + c.nx * 0.58, ay - 0.06 * ff, c.z + c.nz * 0.58, c.nz ? 1.55 : 0.05, 0.1 * ff, c.nz ? 0.05 : 1.55, 0, 0, 0);
        if (c.sg) { c.sg.visible = ff > 0.3; c.sg.position.set(c.x + c.nx * 0.04, ht + 0.2, c.z + c.nz * 0.04); c.sg.scale.set(1, Math.max(0.05, ff), 1); }
      }
    }
    ds.guncelle();
  }

  // ---------------------------------------------------------------- scooter
  function scooterModel() {
    var g = new T.Group(), wheels = [];
    function wheel(x, r) {
      var wg = new T.Group(); wg.position.set(x, r, 0);
      var tire = new T.Mesh(geometry('cylinder', [1, 1]), material('#303a40', { roughness: 0.94 }));
      tire.rotation.x = PI / 2; tire.scale.set(r, 0.085, r); tire.castShadow = true; wg.add(tire);
      var hub = new T.Mesh(geometry('cylinder', [1, 1]), material('#c7d0cf', { metalness: 0.5, roughness: 0.4 }));
      hub.rotation.x = PI / 2; hub.scale.set(r * 0.42, 0.095, r * 0.42); wg.add(hub);
      wg.userData.tire = tire; g.add(wg); wheels.push(wg); return wg;
    }
    wheel(-0.38, 0.15); wheel(0.44, 0.16);
    // Güverte ve kaymaz bant.
    box(g, 0.82, 0.075, 0.27, 0.01, 0.245, 0, '#d97f55');
    box(g, 0.74, 0.018, 0.21, 0.01, 0.29, 0, '#3e4548');
    box(g, 0.6, 0.022, 0.17, 0.01, 0.302, 0, '#596164');
    // Arka çamurluk ve ayaklık.
    box(g, 0.3, 0.035, 0.22, -0.39, 0.24, 0, '#c26f4e', [0, 0, 0.12]);
    box(g, 0.05, 0.26, 0.05, -0.18, 0.13, 0.12, '#7e8d8a', [0, 0, 0.35]);
    // Direksiyon borusu ve gidon.
    box(g, 0.055, 0.62, 0.055, 0.4, 0.57, 0, '#a9b8ad', [0, 0, 0.1]);
    box(g, 0.07, 0.07, 0.5, 0.426, 0.88, 0, '#435c5e');
    cyl(g, 0.036, 0.036, 0.13, 0.426, 0.88, -0.23, '#252d30', [PI / 2, 0, 0]);
    cyl(g, 0.036, 0.036, 0.13, 0.426, 0.88, 0.23, '#252d30', [PI / 2, 0, 0]);
    // Ön çamurluk, far ve zil.
    box(g, 0.3, 0.04, 0.2, 0.44, 0.34, 0, '#c26f4e', [0, 0, -0.15]);
    ball(g, 0.13, 0.13, 0.09, 0.46, 0.82, 0, '#ffe6a1');
    ball(g, 0.09, 0.1, 0.1, 0.39, 0.76, 0.14, '#e7c95a');
    g.userData.wheels = wheels;
    return g;
  }

  // ---------------------------------------------------------------- karakter
  // Yumuşak "oyuncak figür" stili: kapsül/küre gövde, büyük yuvarlak kafa, parlak gözler.
  var capGeo = {}, torGeo = {}, starGeo = null;
  function caps(g, r, len, x, y, z, c, rot, sc) {
    var key = r + '|' + len;
    var geo = capGeo[key] || (capGeo[key] = new T.CapsuleGeometry(r, len, 4, 10));
    var m = new T.Mesh(geo, material(c));
    m.position.set(x, y, z);
    if (rot) m.rotation.set(rot[0], rot[1], rot[2], 'ZYX');
    if (sc) m.scale.set(sc[0], sc[1], sc[2]);
    m.castShadow = true; m.receiveShadow = true; g.add(m); return m;
  }
  function tor(g, r, tube, arc, x, y, z, c, rot, sc) {
    var key = r + '|' + tube + '|' + arc;
    var geo = torGeo[key] || (torGeo[key] = new T.TorusGeometry(r, tube, 6, 18, arc));
    var m = new T.Mesh(geo, material(c));
    m.position.set(x, y, z);
    if (rot) m.rotation.set(rot[0], rot[1], rot[2], 'ZYX');
    if (sc) m.scale.set(sc[0], sc[1], sc[2]);
    m.castShadow = true; g.add(m); return m;
  }
  function star(g, s, x, y, z, c, rot) {
    if (!starGeo) {
      var sh = new T.Shape(), n;
      for (n = 0; n < 10; n++) {
        var rr0 = n % 2 ? 0.2 : 0.5, an = n / 10 * TAU + PI / 2;
        if (n) sh.lineTo(Math.cos(an) * rr0, Math.sin(an) * rr0); else sh.moveTo(Math.cos(an) * rr0, Math.sin(an) * rr0);
      }
      starGeo = new T.ExtrudeGeometry(sh, { depth: 0.2, bevelEnabled: false });
      starGeo.translate(0, 0, -0.1);
    }
    var m = new T.Mesh(starGeo, material(c, { roughness: 0.5 }));
    m.scale.set(s, s, s * 0.25); m.position.set(x, y, z);
    if (rot) m.rotation.set(rot[0], rot[1], rot[2], 'ZYX');
    g.add(m); return m;
  }
  var HX = 0.35, HY = 0.33, HZ = 0.33;
  // Kafa yüzeyindeki bir noktaya, yüzeye dik duran bir grup yerleştirir.
  function anchor(g, x, y, off) {
    var q = 1 - (x / HX) * (x / HX) - (y / HY) * (y / HY), z = HZ * Math.sqrt(Math.max(0.02, q));
    var nx = x / (HX * HX), ny = y / (HY * HY), nz = z / (HZ * HZ), l = Math.sqrt(nx * nx + ny * ny + nz * nz);
    nx /= l; ny /= l; nz /= l;
    var a = new T.Group();
    a.position.set(x + nx * (off || 0), y + ny * (off || 0), z + nz * (off || 0));
    a.rotation.set(-Math.asin(ny), Math.atan2(nx, nz), 0, 'ZYX');
    g.add(a); return a;
  }
  var LOOK = {
    ogeday: { skin: '#ffd2b0', hair: '#5b3822', iris: '#5a3a22', es: 1.3, open: 1 },
    atilay: { skin: '#f6c9a6', hair: '#2c2a3c', iris: '#2f6fb0', es: 1.28, open: 1 },
    giray:  { skin: '#ffd8bc', hair: '#cf7430', iris: '#4c8a4a', es: 1.32, open: 1 },
    gokce:  { skin: '#ffd6b8', hair: '#6a4030', iris: '#7a4a8a', es: 1.32, open: 1, lash: 1 },
    baba:   { skin: '#eebb92', hair: '#3a281d', iris: '#4a2f1d', es: 1.1 },
    anne:   { skin: '#f8cfae', hair: '#7c4a2c', iris: '#5b3a25', es: 1.22, lash: 1, lip: '#d4607a' },
    dede:   { skin: '#efc29c', hair: '#d3d6db', iris: '#3d5a6b', es: 1.05, glasses: 1 },
    ebe:    { skin: '#f1c9a6', hair: '#e6e6ea', iris: '#5b4a3d', es: 1.05, glasses: 1, lash: 1, lip: '#cf7a86' },
    bekci:  { skin: '#e8b58c', hair: '#8f9096', iris: '#3b2a1f', es: 1.08 },
    bekci2: { skin: '#efbf98', hair: '#2a2522', iris: '#3b2a1f', es: 1.12 },
    ogretmen: { skin: '#f3c8a4', hair: '#6b4328', iris: '#5a3a22', es: 1.2, lash: 1, lip: '#d4607a', glasses: 1 },
    mudur:  { skin: '#efc29c', hair: '#b9bcc2', iris: '#3d4f66', es: 1.08 },
    // Aile ve misafirler.
    anneanne: { skin: '#f3c9a7', hair: '#e9e9ee', brow: '#c4c4cc', iris: '#6a4a30', es: 1.12, glasses: 1, gcol: '#c9803a', lash: 1, lip: '#d4707a' },
    dedehassi: { skin: '#eebd96', hair: '#c9ccd2', brow: '#b4b7be', iris: '#3d5a6b', es: 1.08, mustache: '#c9ccd2' },
    abariebe: { skin: '#f2c8a6', hair: '#8c4fd0', brow: '#9a9aa2', iris: '#4a3a2a', es: 1.12, lash: 1, lip: '#cf6a86' },
    recepdede: { skin: '#e9b78f', hair: '#d9dce1', brow: '#d9dce1', iris: '#3a3f4a', es: 1.05, glasses: 1, gcol: '#2c2c34' },
    teyze:  { skin: '#f6cba8', hair: '#4a2a22', iris: '#4a2f1d', es: 1.26, lash: 1, lip: '#d63a5e' },
    enistee: { skin: '#e8b48a', hair: '#2b211c', iris: '#3b2a1f', es: 1.14, stubble: '#c0916c' },
    avmgorevli: { skin: '#f3c6a0', hair: '#4a3022', iris: '#4a3a22', es: 1.22, lash: 1, lip: '#d4607a' },
    beren:  { skin: '#ffdcc4', hair: '#7a4e34', iris: '#5a3a22', es: 1.5, open: 1, lash: 1 },
    cocuk_kirmizi: { skin: '#ffd2b0', hair: '#5b3822', iris: '#4d6380', es: 1.22, open: 1 },
    cocuk_mavi: { skin: '#f6c9a6', hair: '#3b2a26', iris: '#4b7190', es: 1.2, open: 1 },
    cocuk_yesil: { skin: '#ffd8bc', hair: '#b65e2c', iris: '#4c8a4a', es: 1.24, open: 1 },
    ziyaretci_kadin: { skin: '#f4c7a7', hair: '#75422f', iris: '#54706e', es: 1.12, lash: 1, lip: '#c65c78' },
    ziyaretci_erkek: { skin: '#e8b48a', hair: '#282a32', iris: '#465b75', es: 1.08 }
  };
  function face(g, kind) {
    var L = LOOK[kind] || LOOK.baba, sk = L.skin, es = L.es, eyes = [];
    ball(g, HX * 2, HY * 2, HZ * 2, 0, 0, 0, sk);
    ball(g, 0.09, 0.13, 0.08, -0.34, -0.03, 0, sk); ball(g, 0.09, 0.13, 0.08, 0.34, -0.03, 0, sk);
    [-1, 1].forEach(function (s) {
      var an = anchor(g, s * 0.128, -0.025, -0.02), eg = new T.Group();
      an.add(eg);
      ball(eg, 0.125 * es, 0.16 * es, 0.07, 0, 0, 0, '#ffffff');
      ball(eg, 0.098 * es, 0.128 * es, 0.06, 0, -0.004, 0.016, L.iris);
      ball(eg, 0.056 * es, 0.076 * es, 0.06, 0, -0.004, 0.03, '#1a1a24');
      ball(eg, 0.036 * es, 0.036 * es, 0.03, -0.022 * es, 0.036 * es, 0.056, '#ffffff');
      ball(eg, 0.018 * es, 0.018 * es, 0.02, 0.026 * es, -0.03 * es, 0.056, '#ffffff');
      eyes.push(eg);
      if (L.lash) caps(an, 0.009, 0.03, s * 0.068 * es, 0.062 * es, 0.03, '#3a2a2a', [0, 0, s * -0.6]);
      // Kaş: hafif kavisli, iç uç yukarıda (asla çatık değil).
      var ba = anchor(g, s * 0.128, 0.115, 0.0);
      var bk = L.brow || (/dede|ebe/.test(kind) ? L.hair : (L.hair === '#e6e6ea' ? '#bbb' : L.hair));
      var thick = /dede|bekci$/.test(kind) ? 0.017 : (kind === 'beren' ? 0.008 : 0.0115);
      caps(ba, thick, 0.06, 0, 0.005, 0.005, bk, [0, 0, PI / 2 - s * 0.14]);
      // Yanak.
      var ca = anchor(g, s * 0.205, -0.1, -0.006);
      ball(ca, 0.1, 0.06, 0.04, 0, 0, 0, '#ff9ea6');
      if (L.glasses) {
        var ga = anchor(g, s * 0.128, -0.025, 0.045);
        tor(ga, 0.082, kind === 'recepdede' ? 0.0135 : 0.0095, TAU, 0, 0, 0, L.gcol || '#6b5a4c');
      }
    });
    if (L.glasses) { var gb = anchor(g, 0, -0.01, 0.05); caps(gb, 0.007, 0.05, 0, 0.0, 0, L.gcol || '#6b5a4c', [0, 0, PI / 2]); }
    // Burun.
    var na = anchor(g, 0, -0.07, 0.0); ball(na, 0.06, 0.05, 0.05, 0, 0, 0.003, sk).material = material(L.nose || shade(sk, -14));
    // Ağız: kavisli gülümseme (+ çocuklarda açık, neşeli ağız).
    var ma = anchor(g, 0, -0.148, 0.0);
    if (L.open) {
      ball(ma, 0.105, 0.06, 0.03, 0, 0.0, 0.0, '#8e2f3c');
      ball(ma, 0.06, 0.028, 0.032, 0, -0.016, 0.004, '#f08a96');
      ball(ma, 0.07, 0.022, 0.032, 0, 0.022, 0.004, '#ffffff');
    } else {
      tor(ma, 0.085, 0.0125, 2.1, 0, 0.055, 0.0, L.lip || '#a85a52', [0, 0, -PI / 2 - 1.05]);
    }
    g.userData.eyes = eyes;
    hair(g, kind, L);
    if (kind === 'giray') {
      [-1, 1].forEach(function (s) {
        [[-0.03, 0.0], [0.03, 0.01], [0, -0.03]].forEach(function (f) {
          var fa = anchor(g, s * 0.16 + f[0] * s, -0.065 + f[1], 0.0);
          ball(fa, 0.022, 0.02, 0.015, 0, 0, 0, '#c47a4a');
        });
      });
    }
    if (L.mustache) {   // gür, hafif sarkık bıyık
      var mu2 = anchor(g, 0, -0.103, 0.012);
      [-1, 1].forEach(function (s) {
        caps(mu2, 0.026, 0.07, s * 0.062, 0.0, 0.0, L.mustache, [0, 0, PI / 2 + s * 0.38]);
        ball(mu2, 0.05, 0.04, 0.04, s * 0.115, -0.022, -0.004, L.mustache);
      });
    }
    if (L.stubble) {    // kısa sakal: çene-yanak hattında tek, yumuşak, deriden biraz koyu gölge
      var sb = L.stubble;
      [[0, -0.24, 0.36, 0.1], [-0.19, -0.19, 0.13, 0.19], [0.19, -0.19, 0.13, 0.19], [-0.1, -0.225, 0.2, 0.11], [0.1, -0.225, 0.2, 0.11]].forEach(function (b) {
        var ba2 = anchor(g, b[0], b[1], -0.002); ball(ba2, b[2], b[3], 0.04, 0, 0, 0, sb);
      });
    }
    if (kind === 'baba' || kind === 'dede' || kind === 'mudur' || /bekci/.test(kind)) {
      var mc = kind === 'mudur' ? '#aeb1b8' : kind === 'dede' ? '#f0f0f2' : (kind === 'bekci' ? '#9a9a9f' : L.hair), big = kind === 'bekci' ? 1.25 : 1;
      var mu = anchor(g, 0, -0.1, 0.012);
      [-1, 1].forEach(function (s) { caps(mu, 0.022 * big, 0.06 * big, s * 0.05 * big, 0, 0.0, mc, [0, 0, PI / 2 + s * 0.28]); });
    }
  }
  function hair(g, kind, L) {
    var c = L.hair, o;
    // Ortak: kafanın üstünü ve arkasını saran hacimli taban.
    if (kind !== 'mudur' && kind !== 'beren') ball(g, 0.76, 0.7, 0.72, 0, 0.065, -0.05, c);
    function fr(w, h, d, x, y, z, col) { return ball(g, w, h, d, x, y, z, col || c); }
    if (/^cocuk_/.test(kind)) {
      fr(0.42, 0.14, 0.15, 0, 0.245, 0.19);
      fr(0.15, 0.2, 0.13, -0.19, 0.32, 0.13); fr(0.15, 0.19, 0.13, 0.08, 0.36, 0.1);
      if (kind === 'cocuk_yesil') fr(0.12, 0.22, 0.12, 0.23, 0.25, 0.12);
    } else if (kind === 'ziyaretci_kadin') {
      fr(0.84, 0.88, 0.5, 0, -0.2, -0.22);
      [-1, 1].forEach(function (s) { fr(0.15, 0.36, 0.2, s * 0.34, -0.07, 0.0); fr(0.14, 0.24, 0.18, s * 0.36, -0.34, -0.03); });
      fr(0.42, 0.16, 0.17, 0, 0.22, 0.2); fr(0.16, 0.22, 0.13, -0.27, 0.12, 0.18); fr(0.17, 0.18, 0.12, 0.27, 0.14, 0.16);
    } else if (kind === 'ziyaretci_erkek') {
      fr(0.38, 0.13, 0.2, 0, 0.3, 0.13); fr(0.12, 0.12, 0.13, -0.2, 0.26, 0.14); fr(0.12, 0.12, 0.13, 0.2, 0.27, 0.14);
      fr(0.1, 0.16, 0.1, -0.325, 0.0, 0.05); fr(0.1, 0.16, 0.1, 0.325, 0.0, 0.05);
    } else if (kind === 'ogeday') {
      fr(0.24, 0.14, 0.13, -0.12, 0.255, 0.2); fr(0.22, 0.13, 0.13, 0.1, 0.265, 0.19); fr(0.16, 0.11, 0.11, 0.26, 0.2, 0.14);
      fr(0.14, 0.22, 0.14, -0.04, 0.4, 0.0); fr(0.12, 0.2, 0.12, 0.1, 0.38, -0.05); fr(0.11, 0.18, 0.11, -0.16, 0.36, -0.04);
      fr(0.08, 0.14, 0.09, -0.33, 0.08, 0.05);
    } else if (kind === 'atilay') {
      fr(0.44, 0.15, 0.16, -0.04, 0.23, 0.2); fr(0.2, 0.2, 0.14, -0.24, 0.16, 0.2); fr(0.14, 0.18, 0.12, 0.26, 0.2, 0.14);
      fr(0.2, 0.2, 0.2, 0.0, 0.4, -0.08);
    } else if (kind === 'giray') {
      for (var k = 0; k < 12; k++) {
        var an = k / 12 * TAU, rx = 0.3, rz = 0.3;
        fr(0.2, 0.2, 0.2, Math.cos(an) * rx, 0.22 + Math.sin(an * 2) * 0.03, Math.sin(an) * rz - 0.04);
      }
      fr(0.2, 0.2, 0.2, 0, 0.38, 0); fr(0.18, 0.18, 0.18, 0.15, 0.34, 0.1); fr(0.18, 0.18, 0.18, -0.15, 0.34, 0.1); fr(0.17, 0.17, 0.17, 0.0, 0.3, 0.2);
    } else if (kind === 'gokce') {
      fr(0.44, 0.12, 0.14, 0, 0.225, 0.21); fr(0.14, 0.16, 0.12, -0.27, 0.15, 0.17); fr(0.14, 0.16, 0.12, 0.27, 0.15, 0.17);
      [-1, 1].forEach(function (s) {
        fr(0.27, 0.27, 0.27, s * 0.25, 0.37, -0.06);
        fr(0.1, 0.075, 0.07, s * 0.35, 0.26, 0.04, '#ff7aa8'); fr(0.1, 0.075, 0.07, s * 0.2, 0.3, 0.04, '#ff7aa8'); fr(0.05, 0.05, 0.05, s * 0.28, 0.28, 0.05, '#ffd0e0');
      });
    } else if (kind === 'baba') {
      fr(0.34, 0.15, 0.22, 0.02, 0.31, 0.12); fr(0.08, 0.16, 0.1, -0.325, 0.0, 0.05); fr(0.08, 0.16, 0.1, 0.325, 0.0, 0.05);
      fr(0.4, 0.1, 0.12, 0, 0.23, 0.2);
    } else if (kind === 'anne') {
      fr(0.84, 1.0, 0.5, 0, -0.2, -0.22);
      [-1, 1].forEach(function (s) {
        fr(0.17, 0.4, 0.22, s * 0.345, -0.08, 0.0); fr(0.17, 0.2, 0.2, s * 0.385, -0.34, -0.02); fr(0.16, 0.16, 0.18, s * 0.34, -0.5, -0.03);
      });
      fr(0.38, 0.16, 0.17, 0.07, 0.235, 0.2); fr(0.16, 0.26, 0.13, -0.26, 0.13, 0.19); fr(0.18, 0.13, 0.12, 0.28, 0.2, 0.15);
      // Çiçek toka.
      for (var p = 0; p < 5; p++) { var pa = p / 5 * TAU; fr(0.07, 0.07, 0.04, 0.26 + Math.cos(pa) * 0.05, 0.2 + Math.sin(pa) * 0.05, 0.215, '#ffffff'); }
      fr(0.055, 0.055, 0.05, 0.26, 0.2, 0.225, '#ffc83d');
    } else if (kind === 'dede') {
      fr(0.2, 0.34, 0.5, -0.31, 0.02, -0.02); fr(0.2, 0.34, 0.5, 0.31, 0.02, -0.02); fr(0.4, 0.2, 0.24, 0, 0.3, 0.02);
      fr(0.3, 0.1, 0.1, 0, 0.27, 0.19);
    } else if (kind === 'ebe') {
      fr(0.3, 0.3, 0.28, 0, 0.42, -0.1); tor(g, 0.1, 0.03, TAU, 0, 0.3, -0.06, '#c97a96', [0.9, 0, 0]);
      fr(0.44, 0.12, 0.14, 0, 0.225, 0.21); fr(0.12, 0.22, 0.22, -0.32, 0.02, 0.04); fr(0.12, 0.22, 0.22, 0.32, 0.02, 0.04);
    } else if (kind === 'ogretmen') {
      // Omuz hizası küt saç.
      fr(0.84, 0.62, 0.5, 0, -0.1, -0.16);
      [-1, 1].forEach(function (s) { fr(0.17, 0.42, 0.26, s * 0.345, -0.08, 0.0); fr(0.19, 0.16, 0.24, s * 0.35, -0.3, -0.02); });
      fr(0.44, 0.14, 0.16, 0.03, 0.235, 0.2); fr(0.16, 0.24, 0.13, -0.27, 0.12, 0.19); fr(0.18, 0.2, 0.13, 0.28, 0.14, 0.17);
    } else if (kind === 'mudur') {
      [-1, 1].forEach(function (s) { fr(0.06, 0.2, 0.3, s * 0.332, 0.04, -0.17); });
      fr(0.66, 0.34, 0.26, 0, 0.02, -0.24); fr(0.5, 0.1, 0.26, 0, 0.17, -0.2);
    } else if (kind === 'bekci') {
      fr(0.1, 0.16, 0.3, -0.33, 0.0, -0.02); fr(0.1, 0.16, 0.3, 0.33, 0.0, -0.02);
    } else if (kind === 'bekci2') {
      fr(0.1, 0.18, 0.3, -0.33, 0.0, -0.02); fr(0.1, 0.18, 0.3, 0.33, 0.0, -0.02); fr(0.36, 0.14, 0.14, 0.03, 0.26, 0.16);
    } else if (kind === 'anneanne') {
      // Gri-beyaz kısa kıvırcık saç: kafayı saran küçük bukleler.
      var q, qa;
      for (q = 0; q < 14; q++) { qa = q / 14 * TAU; fr(0.17, 0.16, 0.17, Math.cos(qa) * 0.31, 0.15 + hs(q, 1, 5) * 0.12, Math.sin(qa) * 0.29 - 0.04); }
      for (q = 0; q < 7; q++) { qa = q / 7 * TAU; fr(0.16, 0.16, 0.16, Math.cos(qa) * 0.17, 0.37, Math.sin(qa) * 0.15 - 0.03); }
      fr(0.16, 0.15, 0.15, 0, 0.43, -0.02);
      fr(0.17, 0.14, 0.14, -0.15, 0.27, 0.19); fr(0.18, 0.14, 0.14, 0.0, 0.29, 0.21); fr(0.17, 0.14, 0.14, 0.15, 0.27, 0.19);
      fr(0.15, 0.15, 0.15, -0.29, 0.17, 0.15); fr(0.15, 0.15, 0.15, 0.29, 0.17, 0.15);
      [-1, 1].forEach(function (s) { fr(0.15, 0.16, 0.17, s * 0.33, -0.04, 0.0); fr(0.14, 0.14, 0.15, s * 0.31, -0.15, -0.02); });
      fr(0.2, 0.2, 0.2, 0, 0.28, -0.3);
    } else if (kind === 'abariebe') {
      // Mor desenli başörtüsü: alında bant, yanlardan çeneye iniş, çene altı düğüm.
      var bnd = '#5f2fa8', nokta = ['#ffffff', '#ffd36a'], q2, tt, pp;
      fr(0.5, 0.11, 0.17, 0, 0.215, 0.185, bnd);
      [-1, 1].forEach(function (s) { fr(0.15, 0.46, 0.27, s * 0.335, -0.09, 0.02); fr(0.15, 0.1, 0.25, s * 0.32, -0.3, 0.0, bnd); });
      fr(0.66, 0.26, 0.46, 0, -0.29, -0.06);
      fr(0.18, 0.15, 0.14, 0.2, -0.29, 0.15, bnd);
      for (q2 = 0; q2 < 22; q2++) {
        pp = 0.2 + hs(q2, 3, 7) * 0.85; tt = hs(q2, 5, 7) * TAU;
        var dx = 0.4 * Math.sin(pp) * Math.cos(tt), dy = 0.065 + 0.37 * Math.cos(pp), dz = -0.05 + 0.38 * Math.sin(pp) * Math.sin(tt);
        if (dz > 0.05 && dy < 0.24) continue;
        fr(0.05, 0.05, 0.05, dx, dy, dz, nokta[q2 % 2]);
      }
      for (q2 = -2; q2 <= 2; q2++) fr(0.045, 0.045, 0.04, q2 * 0.085, 0.215 - Math.abs(q2) * 0.012, 0.268 - Math.abs(q2) * 0.03, nokta[q2 & 1 ? 1 : 0]);
      // Alnın kenarından görünen gri saç telleri.
      fr(0.2, 0.05, 0.05, 0, 0.17, 0.27, '#d0d0d6');
    } else if (kind === 'dedehassi') {
      [-1, 1].forEach(function (s) { fr(0.06, 0.2, 0.3, s * 0.332, 0.04, -0.17); });   // kafaya yapışık ince kır şerit, kulaklar açıkta
      // Kasket: yassı tweed kubbe + öne uzanan siperlik + düğme.
      var kc = '#9a7752';
      fr(0.8, 0.3, 0.76, 0, 0.27, -0.02, kc); fr(0.5, 0.15, 0.5, 0.0, 0.37, 0.0, '#ab8a62');
      var sp = fr(0.46, 0.05, 0.32, 0, 0.2, 0.31, '#6b4f33'); sp.rotation.x = 0.22;
      fr(0.78, 0.07, 0.72, 0, 0.2, -0.02, '#6b4f33'); fr(0.06, 0.05, 0.06, 0, 0.48, 0.0, '#6b4f33');
    } else if (kind === 'recepdede') {
      fr(0.12, 0.26, 0.4, -0.33, 0.0, -0.03); fr(0.12, 0.26, 0.4, 0.33, 0.0, -0.03);
      // Bordo yün bere: kıvrık krem kenar, çizgiler, ponpon.
      var bb = '#a82f3d', bc = '#f1e6d2';
      fr(0.8, 0.5, 0.78, 0, 0.3, -0.02, bb);
      tor(g, 0.3, 0.055, TAU, 0, 0.19, -0.015, bc, [PI / 2, 0, 0], [1.02, 0.97, 1.3]);
      tor(g, 0.28, 0.02, TAU, 0, 0.34, -0.02, bc, [PI / 2, 0, 0], [1.0, 0.96, 1.0]);
      tor(g, 0.2, 0.02, TAU, 0, 0.46, -0.02, bc, [PI / 2, 0, 0], [1.0, 0.96, 1.0]);
      fr(0.17, 0.16, 0.17, 0.02, 0.57, -0.02, bc);
    } else if (kind === 'teyze') {
      // Uzun, dalgalı saç + yanda büyük çiçek toka.
      fr(0.8, 1.0, 0.4, 0, -0.22, -0.24); fr(0.6, 0.5, 0.32, 0, -0.7, -0.24); fr(0.4, 0.3, 0.24, 0, -0.93, -0.22);
      [-1, 1].forEach(function (s) {
        fr(0.15, 0.46, 0.2, s * 0.345, -0.1, 0.0); fr(0.14, 0.3, 0.17, s * 0.36, -0.42, -0.04); fr(0.12, 0.2, 0.14, s * 0.33, -0.62, -0.08);
      });
      fr(0.4, 0.17, 0.17, -0.07, 0.235, 0.2); fr(0.16, 0.28, 0.13, 0.27, 0.12, 0.19); fr(0.18, 0.15, 0.12, -0.28, 0.2, 0.15);
      for (var fp = 0; fp < 6; fp++) { var fa = fp / 6 * TAU; fr(0.08, 0.08, 0.04, -0.26 + Math.cos(fa) * 0.06, 0.2 + Math.sin(fa) * 0.06, 0.225, '#ffb23d'); }
      fr(0.06, 0.06, 0.05, -0.26, 0.2, 0.235, '#d63a5e');
    } else if (kind === 'enistee') {
      // Kısa, dağınık koyu saç.
      fr(0.4, 0.14, 0.2, 0.0, 0.31, 0.12); fr(0.2, 0.13, 0.18, -0.2, 0.27, 0.14); fr(0.18, 0.14, 0.17, 0.2, 0.29, 0.12);
      fr(0.1, 0.16, 0.1, -0.325, 0.0, 0.05); fr(0.1, 0.16, 0.1, 0.325, 0.0, 0.05);
      fr(0.4, 0.1, 0.12, 0.04, 0.23, 0.2); fr(0.26, 0.12, 0.2, 0.04, 0.4, 0.02);
    } else if (kind === 'avmgorevli') {
      // Kurumsal şapka + arkadan çıkan kısa at kuyruğu.
      fr(0.1, 0.18, 0.28, -0.335, 0.03, -0.03); fr(0.1, 0.18, 0.28, 0.335, 0.03, -0.03);
      fr(0.78, 0.46, 0.72, 0, 0.27, -0.03, '#6a45c9'); fr(0.5, 0.14, 0.46, 0, 0.45, -0.03, '#7a56d8');
      var sp2 = fr(0.46, 0.06, 0.34, 0, 0.17, 0.32, '#4b2fa0'); sp2.rotation.x = 0.2;
      fr(0.76, 0.06, 0.7, 0, 0.19, -0.03, '#4b2fa0');
      fr(0.13, 0.13, 0.04, 0, 0.3, 0.335, '#ffc531'); fr(0.07, 0.07, 0.03, 0, 0.3, 0.355, '#6a45c9');
      fr(0.1, 0.08, 0.08, 0, 0.1, -0.38, '#ffc531'); fr(0.17, 0.18, 0.16, 0, 0.02, -0.43); fr(0.14, 0.2, 0.13, 0.0, -0.14, -0.43);
    } else if (kind === 'beren') {
      // Tek tutam saç + pembe toka (fiyonk).
      fr(0.13, 0.15, 0.12, 0.0, 0.35, 0.1); fr(0.11, 0.12, 0.1, 0.035, 0.42, 0.1); fr(0.09, 0.09, 0.08, 0.075, 0.46, 0.09);
      fr(0.46, 0.1, 0.1, 0, 0.29, 0.0);
      var tk = '#ff7fb0';
      fr(0.12, 0.09, 0.06, -0.075, 0.37, 0.2, tk); fr(0.12, 0.09, 0.06, 0.085, 0.37, 0.2, tk); fr(0.06, 0.06, 0.06, 0.005, 0.37, 0.215, '#ffd0e2');
    }
  }
  var OUT = {
    ogeday: { top: '#f47c3c', pant: '#3d6fb0', shoe: '#d6453a', sole: '#ffffff', sock: '#ffffff', leg: 'short', tw: 1, tz: 1 },
    atilay: { top: '#4a82dc', pant: '#2f3f6e', shoe: '#e9edf5', sole: '#6b7aa8', sock: '#ffffff', leg: 'short', tw: 1, tz: 1 },
    giray:  { top: '#86c96a', pant: '#b89a62', shoe: '#8a5a3a', sole: '#ffffff', sock: '#ffffff', leg: 'short', tw: 1.05, tz: 1.05 },
    gokce:  { top: '#b48ae8', pant: '#b48ae8', shoe: '#ff8fb5', sole: '#ffffff', sock: '#ffffff', leg: 'dress', tw: 1, tz: 1 },
    baba:   { top: '#5e8f86', pant: '#4b5b72', shoe: '#3b2c24', sole: '#e9e3d6', sock: '#4b5b72', leg: 'long', tw: 1.22, tz: 1.1 },
    anne:   { top: '#ea7a92', pant: '#ea7a92', shoe: '#9c3f5b', sole: '#6b2a40', sock: '#f8cfae', leg: 'dress', tw: 1.04, tz: 1 },
    dede:   { top: '#f3ead6', pant: '#8b7a5e', shoe: '#5a4332', sole: '#d9ceb8', sock: '#8b7a5e', leg: 'long', tw: 1.25, tz: 1.15 },
    ebe:    { top: '#f3e8d4', pant: '#7d82ad', shoe: '#6d4a64', sole: '#d8c6d2', sock: '#7d82ad', leg: 'dress', tw: 1.18, tz: 1.1 },
    bekci:  { top: '#2f4a7a', pant: '#233658', shoe: '#1d1610', sole: '#0f0b08', sock: '#233658', leg: 'long', tw: 1.28, tz: 1.12 },
    bekci2: { top: '#355483', pant: '#27395f', shoe: '#1d1610', sole: '#0f0b08', sock: '#27395f', leg: 'long', tw: 1.15, tz: 1.05 },
    ogretmen: { top: '#e9a23b', pant: '#5f6f8f', shoe: '#7a4a38', sole: '#e9ddc8', sock: '#5f6f8f', leg: 'dress', tw: 1.06, tz: 1 },
    mudur:  { top: '#27355a', pant: '#222c48', shoe: '#17141a', sole: '#0c0a0d', sock: '#222c48', leg: 'long', tw: 1.26, tz: 1.12 },
    anneanne: { top: '#e8864f', pant: '#a85a46', shoe: '#7a4a38', sole: '#e9ddc8', sock: '#f3c9a7', leg: 'dress', tw: 1.12, tz: 1.06 },
    dedehassi: { top: '#c4473a', pant: '#3a4f73', shoe: '#4a3426', sole: '#d9ceb8', sock: '#3a4f73', leg: 'long', tw: 1.2, tz: 1.1 },
    abariebe: { top: '#6dbf9a', pant: '#2f4f7f', shoe: '#3b2c34', sole: '#d8c6d2', sock: '#2f4f7f', leg: 'dress', tw: 1.14, tz: 1.08 },
    recepdede: { top: '#5b6f86', pant: '#3f4552', shoe: '#2c2622', sole: '#d9ceb8', sock: '#3f4552', leg: 'long', tw: 1.24, tz: 1.14 },
    teyze:  { top: '#ffb23d', pant: '#8a5ad0', shoe: '#ff7aa8', sole: '#ffffff', sock: '#8a5ad0', leg: 'long', tw: 1.0, tz: 1 },
    enistee: { top: '#2f7bd0', pant: '#383d4a', shoe: '#f2f4f8', sole: '#ff6a3d', sock: '#383d4a', leg: 'long', tw: 1.2, tz: 1.08 },
    avmgorevli: { top: '#f4f6fa', pant: '#34384a', shoe: '#f2f4f8', sole: '#6a45c9', sock: '#34384a', leg: 'long', tw: 1.06, tz: 1.02 },
    cocuk_kirmizi: { top: '#e9564e', pant: '#315e9b', shoe: '#49364a', sole: '#fff4e8', sock: '#ffffff', leg: 'short', tw: 1, tz: 1 },
    cocuk_mavi: { top: '#4b92dc', pant: '#435071', shoe: '#e9edf5', sole: '#ffffff', sock: '#ffffff', leg: 'short', tw: 1, tz: 1 },
    cocuk_yesil: { top: '#70bd65', pant: '#756044', shoe: '#8a5a3a', sole: '#ffffff', sock: '#ffffff', leg: 'short', tw: 1.03, tz: 1 },
    ziyaretci_kadin: { top: '#e788a1', pant: '#7d5994', shoe: '#644157', sole: '#f4dbe8', sock: '#ffffff', leg: 'dress', tw: 1.04, tz: 1 },
    ziyaretci_erkek: { top: '#e7a841', pant: '#46546c', shoe: '#3b302d', sole: '#e9e3d6', sock: '#46546c', leg: 'long', tw: 1.16, tz: 1.08 }
  };
  // Telefon performansı: bir animasyon grubunun statik mesh'lerini tek BufferGeometry'de (vertex color) birleştirir.
  // animSet içindeki gruplar (kol, bacak, kafa, göz...) ayrı kalır; göz grupları kafaya taşınır (blink ölçeği korunur).
  var mM = new T.Matrix4(), mN = new T.Matrix3();
  function birlestirGrup(g, animSet) {
    var kayit = {}, tasinan = [];
    (function gez(node, rel) {
      node.children.slice().forEach(function (c) {
        if (animSet.has(c)) { if (node !== g) tasinan.push([c, rel.clone()]); return; }
        c.updateMatrix();
        var m = new T.Matrix4().multiplyMatrices(rel, c.matrix);
        if (c.isMesh) {
          var mt = c.material, k = mt.roughness + '|' + mt.metalness + '|' + (mt.emissive ? mt.emissive.getHex() : 0) + '|' + (mt.emissiveIntensity || 0);
          (kayit[k] = kayit[k] || { mt: mt, list: [] }).list.push([c, m]);
        } else gez(c, m);
      });
    })(g, new T.Matrix4());
    var yeni = [];
    Object.keys(kayit).forEach(function (k) {
      var L = kayit[k].list, nv = 0, ni = 0;
      L.forEach(function (e) { nv += e[0].geometry.attributes.position.count; ni += e[0].geometry.index ? e[0].geometry.index.count : e[0].geometry.attributes.position.count; });
      var pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3), idx = new Uint32Array(ni), vo = 0, io = 0;
      L.forEach(function (e) {
        var ge = e[0].geometry, pa = ge.attributes.position, na = ge.attributes.normal, c = e[0].material.color, m = e[1], i;
        mN.getNormalMatrix(m);
        var flip = m.determinant() < 0;
        for (i = 0; i < pa.count; i++) {
          v3.set(pa.getX(i), pa.getY(i), pa.getZ(i)).applyMatrix4(m); pos[(vo + i) * 3] = v3.x; pos[(vo + i) * 3 + 1] = v3.y; pos[(vo + i) * 3 + 2] = v3.z;
          v3.set(na.getX(i), na.getY(i), na.getZ(i)).applyMatrix3(mN).normalize(); nor[(vo + i) * 3] = v3.x; nor[(vo + i) * 3 + 1] = v3.y; nor[(vo + i) * 3 + 2] = v3.z;
          col[(vo + i) * 3] = c.r; col[(vo + i) * 3 + 1] = c.g; col[(vo + i) * 3 + 2] = c.b;
        }
        var n = ge.index ? ge.index.count : pa.count;
        for (i = 0; i < n; i += 3) {
          var a = ge.index ? ge.index.getX(i) : i, b = ge.index ? ge.index.getX(i + 1) : i + 1, d2 = ge.index ? ge.index.getX(i + 2) : i + 2;
          idx[io++] = vo + a; idx[io++] = vo + (flip ? d2 : b); idx[io++] = vo + (flip ? b : d2);
        }
        vo += pa.count;
      });
      var bg = new T.BufferGeometry();
      bg.setAttribute('position', new T.BufferAttribute(pos, 3)); bg.setAttribute('normal', new T.BufferAttribute(nor, 3));
      bg.setAttribute('color', new T.BufferAttribute(col, 3)); bg.setIndex(new T.BufferAttribute(idx, 1));
      var o = kayit[k].mt, vm = new T.MeshStandardMaterial({ vertexColors: true, roughness: o.roughness, metalness: o.metalness });
      if (o.emissive && o.emissive.getHex()) { vm.emissive = o.emissive.clone(); vm.emissiveIntensity = o.emissiveIntensity; }
      var mesh = new T.Mesh(bg, vm); mesh.castShadow = true; mesh.receiveShadow = true; yeni.push(mesh);
    });
    g.children.slice().forEach(function (c) { if (!animSet.has(c)) g.remove(c); });
    yeni.forEach(function (m) { g.add(m); });
    tasinan.forEach(function (e) {   // göz gibi iç içe animasyon grupları doğrudan g'nin altına
      e[0].parent.remove(e[0]); e[0].updateMatrix(); e[0].matrix.premultiply(e[1]);
      e[0].matrix.decompose(e[0].position, e[0].quaternion, e[0].scale); g.add(e[0]);
    });
  }
  function rigBirlestir(gruplar) {
    var set = new Set(gruplar);
    gruplar.forEach(function (g) { birlestirGrup(g, set); });
  }
  // Beren: emekleyen bebek. Gövde kalça eksenli (body pivotu kalçada), kafa büyük; arayüz diğer rig'lerle aynı.
  function rigBeren() {
    var kind = 'beren', root = new T.Group(), body = new T.Group(), head = new T.Group();
    root.add(body); head.position.set(0, 0.4, 0); body.add(head); head.scale.setScalar(0.72);
    var L = LOOK.beren, skin = L.skin, TU = '#8fdcc0', TU2 = '#ffffff', PK = '#ff8fb8';
    var arms = [], legs = [], knees = [], elbows = [];
    [-1, 1].forEach(function (s) {
      var leg = new T.Group(); leg.position.set(s * 0.068, 0, 0); body.add(leg);
      caps(leg, 0.056, 0.05, 0, -0.085, 0, TU);
      var knee = new T.Group(); knee.position.set(0, -0.17, 0); leg.add(knee);
      ball(knee, 0.11, 0.11, 0.11, 0, 0, 0, TU);
      caps(knee, 0.05, 0.04, 0, -0.06, 0, TU);
      ball(knee, 0.12, 0.09, 0.15, 0, -0.125, 0.03, TU2); ball(knee, 0.08, 0.06, 0.06, 0, -0.135, 0.09, PK);
      legs.push(leg); knees.push(knee);
    });
    ball(body, 0.3, 0.24, 0.29, 0, 0.02, -0.02, TU);   // bez/tulum kalçası
    caps(body, 0.118, 0.08, 0, 0.16, 0, TU, null, [1.05, 1, 0.98]);
    tor(body, 0.1, 0.022, TAU, 0, 0.3, 0, TU2, [PI / 2, 0, 0]);
    [[-0.055, 0.2], [0.06, 0.12], [-0.02, 0.08], [0.07, 0.25], [-0.07, 0.11]].forEach(function (p2) { ball(body, 0.03, 0.03, 0.02, p2[0], p2[1], 0.118, TU2); });
    ball(body, 0.05, 0.04, 0.02, -0.02, 0.255, 0.121, PK); ball(body, 0.05, 0.04, 0.02, 0.02, 0.255, 0.121, PK);
    [-1, 1].forEach(function (s) {
      var arm = new T.Group(); arm.position.set(s * 0.15, 0.26, 0); body.add(arm);
      ball(arm, 0.11, 0.11, 0.11, 0, 0, 0, TU);
      caps(arm, 0.042, 0.04, 0, -0.055, 0, TU);
      var elbow = new T.Group(); elbow.position.set(0, -0.1, 0); arm.add(elbow);
      caps(elbow, 0.04, 0.025, 0, -0.04, 0, TU);
      tor(elbow, 0.04, 0.014, TAU, 0, -0.07, 0, PK, [PI / 2, 0, 0]);
      ball(elbow, 0.1, 0.095, 0.1, 0, -0.105, 0, skin);
      arms.push(arm); elbows.push(elbow);
    });
    face(head, kind);
    var cap = new T.Group(); head.add(cap); cap.visible = false;
    rigBirlestir([body, head, cap].concat(arms, elbows, legs, knees, head.userData.eyes));
    var mats = []; root.traverse(function (o) { if (o.isMesh) { o.material = o.material.clone(); mats.push(o.material); } });
    var shadow = new T.Mesh(new T.CircleGeometry(0.3, 18), new T.MeshBasicMaterial({ color: '#152015', transparent: true, opacity: 0.16, depthWrite: false }));
    shadow.rotation.x = -PI / 2; shadow.position.y = 0.015; shadow.renderOrder = 1;
    R.actors.add(root); R.actors.add(shadow);
    return { root: root, body: body, head: head, arms: arms, legs: legs, knees: knees, elbows: elbows,
      cap: cap, mats: mats, kind: kind, rotY: null, px: null, pz: null, hiz: 0, seed: hs(kind.length, kind.charCodeAt(0), 3) * 9, shadow: shadow };
  }
  // Beren pozları: emekleme (gövde yatay, çapraz el-diz), oturma (ent.oturuyor), kucakta (ent.kucakta).
  function berenPoz(a, ent, d, sc) {
    var t = d.zaman, i, s, b = a.body, h = a.head;
    var sit = !!ent.oturuyor, tut = !!ent.kucakta && !sit;
    var em = (ent.hareket && !sit && !tut) ? Math.max(0.75, Math.min(1.2, a.hiz / 1.3)) : 0;
    var ph = (ent.adimFaz != null ? ent.adimFaz : t * 10) * 0.8;
    a.root.rotation.z = 0;
    if (sit) {
      var c = 0.5 + 0.5 * Math.sin(t * 5 + a.seed);
      a.root.position.y = 0.04 + (ent.oturY != null ? ent.oturY * sc : 0);   // pusette biraz yukarıda oturur
      b.position.y = 0.11; b.rotation.set(0.1 + Math.sin(t * 1.6) * 0.02, 0, Math.sin(t * 1.1) * 0.03);
      h.position.set(0, 0.4, 0); h.rotation.set(-0.06 + Math.sin(t * 1.3) * 0.04, Math.sin(t * 0.8 + a.seed) * 0.3, Math.sin(t * 1.2) * 0.06);
      for (i = 0; i < 2; i++) {
        s = i ? 1 : -1;
        a.legs[i].rotation.set(-1.42, 0, s * 0.34); a.knees[i].rotation.x = 0.3 + (i ? 0.1 : 0);
        a.arms[i].rotation.set(-1.0 - c * 0.15, 0, s * (0.55 - 0.85 * c)); a.elbows[i].rotation.x = -0.95;
      }
    } else if (tut) {
      a.root.position.y = 0.04 + (ent.kucakY != null ? ent.kucakY : 0.5) * sc;
      b.position.y = 0.1; b.rotation.set(-0.14, 0, Math.sin(t * 1.4) * 0.03);
      h.position.set(0, 0.4, 0); h.rotation.set(0.05, Math.sin(t * 0.9 + a.seed) * 0.35, Math.sin(t * 1.2) * 0.06);
      for (i = 0; i < 2; i++) {
        s = i ? 1 : -1;
        a.legs[i].rotation.set(-0.55 + Math.sin(t * 3 + i * 2) * 0.12, 0, s * 0.36); a.knees[i].rotation.x = 0.55;
        a.arms[i].rotation.set(-2.25, 0, s * 0.32 + (i ? Math.sin(t * 6) * 0.22 : 0)); a.elbows[i].rotation.x = -0.45;
      }
    } else {
      var th = 1.5, sa, sl;
      a.root.position.y = 0.04;
      b.position.y = 0.23 + Math.abs(Math.sin(ph)) * 0.012 * em + Math.sin(t * 1.9) * 0.004;
      b.rotation.set(th + Math.sin(ph * 2) * 0.03 * em, Math.sin(ph) * 0.05 * em, Math.sin(ph) * 0.07 * em);
      h.position.set(0, 0.38, -0.2);
      h.rotation.set(-th - 0.1 + Math.sin(t * 1.3) * 0.05, Math.sin(t * 0.8 + a.seed) * 0.2 * (1 - em * 0.8), -Math.sin(ph) * 0.05 * em);
      for (i = 0; i < 2; i++) {
        s = i ? 1 : -1;
        sa = Math.sin(ph + i * PI); sl = Math.sin(ph + (1 - i) * PI);
        a.arms[i].rotation.set(-th - 0.5 * sa * em, 0, s * 0.1);
        a.elbows[i].rotation.x = -0.08 - Math.max(0, sa) * 0.6 * em;
        a.legs[i].rotation.set(-th - 0.35 * sl * em, 0, s * 0.1);
        a.knees[i].rotation.x = 1.57 + 0.35 * sl * em + Math.max(0, sl) * 0.5 * em;
      }
    }
    a.head.scale.setScalar(0.72);
  }
  function kaplumbagaRig() {
    var root = new T.Group(), body = new T.Group(), head = new T.Group(), shell = new T.Group();
    root.add(body); body.add(shell); head.position.set(0, 0.43, 0.34); body.add(head);
    // Alçak poligonlu sevimli kaplumbağa: kubbeli kabuk, karın plakası, baş ve dört ayrı ayak.
    ball(body, 0.42, 0.16, 0.58, 0, 0.26, -0.02, '#77a85b');
    ball(shell, 0.51, 0.49, 0.61, 0, 0.43, -0.03, '#60934e');
    ball(shell, 0.39, 0.35, 0.48, 0, 0.51, -0.01, '#a7bd62');
    // Kabuk plakalarının ince koyu sınırları; birkaç kavisli hat düşük poligon dilimleri oluşturur.
    for (var si = 0; si < 6; si++) {
      var an = si / 6 * TAU;
      caps(shell, 0.013, 0.34, Math.cos(an) * 0.25, 0.55, Math.sin(an) * 0.29, '#6c8548', [0, -an, 0]);
    }
    ball(head, 0.29, 0.24, 0.3, 0, 0, 0.04, '#8fbd63');
    [-1, 1].forEach(function (s) {
      ball(head, 0.09, 0.12, 0.055, s * 0.105, 0.035, 0.296, '#fffdf4');
      ball(head, 0.045, 0.07, 0.035, s * 0.105, 0.03, 0.335, '#342f2a');
      ball(head, 0.018, 0.02, 0.015, s * 0.09, 0.058, 0.356, '#ffffff');
    });
    tor(head, 0.055, 0.009, 2.0, 0, -0.08, 0.316, '#5f713e', [0, 0, -PI / 2 - 1.05]);
    var legs = [];
    [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(function (p) {
      var leg = new T.Group(); leg.position.set(p[0] * 0.32, 0.2, p[1] * 0.32); body.add(leg);
      ball(leg, 0.18, 0.14, 0.22, 0, -0.045, 0.02, '#83ae59');
      [0, 1, 2].forEach(function (cl) { ball(leg, 0.035, 0.025, 0.045, (cl - 1) * 0.065, -0.075, 0.12, '#e6d8a7'); });
      legs.push(leg);
    });
    rigBirlestir([body, head, shell].concat(legs));
    var mats = []; root.traverse(function (o) { if (o.isMesh) { o.material = o.material.clone(); mats.push(o.material); } });
    var shadow = new T.Mesh(new T.CircleGeometry(0.42, 20), new T.MeshBasicMaterial({ color: '#152015', transparent: true, opacity: 0.16, depthWrite: false }));
    shadow.rotation.x = -PI / 2; shadow.position.y = 0.015; shadow.renderOrder = 1;
    R.actors.add(root); R.actors.add(shadow);
    return { root: root, body: body, head: head, legs: legs, mats: mats, kind: 'kaplumbaga', rotY: null, px: null, pz: null, hiz: 0, seed: 2.7, shadow: shadow };
  }
  function rig(kind) {
    if (kind === 'beren') return rigBeren();
    if (AYI[kind]) return ayiRig(kind);
    if (kind === 'kaplumbaga') return kaplumbagaRig();
    var root = new T.Group(), body = new T.Group(), head = new T.Group();
    root.add(body); head.position.y = 1.11; body.add(head);
    var L = LOOK[kind] || LOOK.baba, O = OUT[kind] || OUT.baba, skin = L.skin, col = O.top;
    var arms = [], legs = [], knees = [], elbows = [];
    var isDress = O.leg === 'dress', big = O.tw > 1.1, longS = kind === 'ebe' || kind === 'ogretmen' || kind === 'abariebe' || kind === 'ziyaretci_kadin';
    // Bacaklar: kısa tombul uyluk + incik + yuvarlak burunlu ayakkabı.
    [-1, 1].forEach(function (s) {
      var leg = new T.Group(); leg.position.set(s * 0.1, 0.42, 0); body.add(leg);
      var thighCol = O.leg === 'short' ? O.pant : (isDress ? (longS ? O.pant : skin) : O.pant);
      if (kind === 'gokce') thighCol = '#ffffff';
      caps(leg, 0.077, 0.1, 0, -0.11, 0, thighCol);
      var knee = new T.Group(); knee.position.set(0, -0.22, 0); leg.add(knee);
      var shinCol = (O.leg === 'short' || (isDress && !longS)) ? skin : O.pant;
      caps(knee, 0.066, 0.06, 0, -0.065, 0, shinCol);
      if (O.leg === 'short' || kind === 'gokce') cyl(knee, 0.07, 0.07, 0.07, 0, -0.1, 0, O.sock);
      ball(knee, 0.175, 0.115, 0.27, 0, -0.145, 0.04, O.shoe);
      ball(knee, 0.18, 0.05, 0.28, 0, -0.185, 0.04, O.sole);
      legs.push(leg); knees.push(knee);
    });
    // Gövde: yumuşak kapsül.
    caps(body, 0.185, 0.12, 0, 0.62, 0, col, null, [O.tw, 1, 0.9 * O.tz]);
    // Kollar: omuz topu + üst kol + ön kol + yuvarlak el.
    var sleeve = (kind === 'dede') ? '#f3ead6' : (kind === 'ebe' ? '#f3e8d4' : (kind === 'dedehassi' ? '#b53f34' : col));
    if (kind === 'ogeday' || kind === 'atilay' || kind === 'giray' || kind === 'gokce' || /^cocuk_/.test(kind)) sleeve = col;
    [-1, 1].forEach(function (s) {
      var arm = new T.Group(); arm.position.set(s * (0.2 * O.tw + 0.045), 0.8, 0); body.add(arm);
      ball(arm, 0.125, 0.125, 0.125, 0, 0, 0, sleeve);
      caps(arm, 0.057, 0.07, 0, -0.1, 0, sleeve);
      var elbow = new T.Group(); elbow.position.set(0, -0.19, 0); arm.add(elbow);
      var kisa = (kind === 'ogeday' || kind === 'atilay' || kind === 'giray' || kind === 'gokce' || /^cocuk_/.test(kind) || kind === 'anne' || kind === 'teyze' || kind === 'enistee' || kind === 'avmgorevli' || kind === 'ziyaretci_kadin');
      caps(elbow, 0.052, 0.06, 0, -0.075, 0, kisa ? skin : sleeve);
      ball(elbow, 0.13, 0.125, 0.125, 0, -0.17, 0, skin);
      arms.push(arm); elbows.push(elbow);
    });
    face(head, kind);
    // Yaka (çene altında).
    var yaka = ({ ogeday: '#ffffff', atilay: '#ffffff', giray: '#ffffff', gokce: '#ffffff', baba: '#f6f1e4', anne: '#fff4ec', dede: '#f3ead6', ebe: '#9b4f6d', ogretmen: '#fff4e6', mudur: '#f6f6fa', bekci: '#e8ecf4', bekci2: '#e8ecf4',
      anneanne: '#fff1da', dedehassi: '#a53a30', abariebe: '#f5eefc', recepdede: '#cfe4f2', teyze: '#27b5a4', enistee: '#1e62b0', avmgorevli: '#e8ecf4' })[kind];
    tor(body, 0.15 * O.tw, 0.032, TAU, 0, 0.79, 0.0, yaka, [PI / 2, 0, 0], [1, 1, 1.0]);
    // Etek / elbise.
    if (kind === 'anne') {
      cyl(body, 0.2, 0.31, 0.3, 0, 0.45, 0, col); tor(body, 0.305, 0.028, TAU, 0, 0.3, 0, '#c94f6b', [PI / 2, 0, 0]);
      tor(body, 0.215, 0.025, TAU, 0, 0.56, 0, '#c94f6b', [PI / 2, 0, 0]);
    } else if (kind === 'gokce' || kind === 'ziyaretci_kadin') {
      cyl(body, 0.2, 0.31, 0.26, 0, 0.45, 0, col); tor(body, 0.305, 0.03, TAU, 0, 0.32, 0, '#ffffff', [PI / 2, 0, 0]);
      ball(body, 0.1, 0.07, 0.04, 0, 0.62, 0.17, '#ff7aa8');
    } else if (kind === 'ebe') {
      cyl(body, 0.21, 0.34, 0.34, 0, 0.42, 0, O.pant); tor(body, 0.335, 0.03, TAU, 0, 0.26, 0, '#5d628f', [PI / 2, 0, 0]);
      // Önlük.
      ball(body, 0.3, 0.34, 0.1, 0, 0.45, 0.2, '#fbf3e4'); ball(body, 0.26, 0.16, 0.1, 0, 0.67, 0.19, '#fbf3e4');
      // Şal.
      caps(body, 0.2, 0.1, 0, 0.77, 0, '#9b4f6d', null, [1.35, 0.5, 1.15]);
      [-1, 1].forEach(function (s) { ball(body, 0.14, 0.2, 0.2, s * 0.28, 0.72, 0.02, '#9b4f6d'); });
      ball(body, 0.05, 0.05, 0.04, 0, 0.74, 0.21, '#f2c14e');
    }
    if (kind === 'ogretmen') {
      cyl(body, 0.2, 0.33, 0.34, 0, 0.42, 0, O.pant); tor(body, 0.33, 0.028, TAU, 0, 0.26, 0, '#4a5878', [PI / 2, 0, 0]);
      // Açık bluz + hırkanın iki ön paneli, ortada net açıklık.
      ball(body, 0.15, 0.34, 0.05, 0, 0.68, 0.162, '#fff4e6');
      [-1, 1].forEach(function (s) {
        caps(body, 0.058, 0.2, s * 0.128, 0.66, 0.14, '#d9902a', [0, 0, s * 0.04]);
        caps(body, 0.011, 0.13, s * 0.06, 0.7, 0.2, '#d84a4a', [0, 0, s * -0.5]);
      });
      cyl(body, 0.02, 0.02, 0.06, 0, 0.605, 0.208, '#d8dce6', [PI / 2, 0, 0]);
      var df = ball(elbows[1], 0.095, 0.17, 0.035, 0.0, -0.1, 0.08, '#3d78d8'); df.rotation.x = -0.25;
    }
    if (kind === 'mudur') {
      ball(body, 0.13, 0.32, 0.06, 0, 0.68, 0.18, '#f6f6fa');
      [-1, 1].forEach(function (s) { caps(body, 0.028, 0.16, s * 0.08, 0.7, 0.19, '#1c2747', [0, 0, s * 0.35]); });
      caps(body, 0.026, 0.14, 0, 0.66, 0.21, '#d03b3b'); ball(body, 0.06, 0.05, 0.04, 0, 0.78, 0.2, '#d03b3b');
      ball(body, 0.1, 0.07, 0.03, -0.14, 0.65, 0.2, '#1c2747'); caps(body, 0.008, 0.05, -0.14, 0.7, 0.21, '#e8c24a');
      star(body, 0.06, 0.13, 0.72, 0.2, '#f2c14e');
      caps(body, 0.2, 0.0, 0, 0.42, 0, '#141d30', [0, 0, 0], [O.tw, 0.3, 1.1]);
    }
    if (kind === 'anneanne') {
      // Sıcak mercan hırka (önü açık, içinde krem bluz), çiçek desenleri, uzun etek, inci kolye.
      cyl(body, 0.2, 0.34, 0.34, 0, 0.42, 0, O.pant); tor(body, 0.335, 0.03, TAU, 0, 0.26, 0, '#d98a62', [PI / 2, 0, 0]);
      ball(body, 0.15, 0.36, 0.05, 0, 0.66, 0.172, '#fff1da');
      [-1, 1].forEach(function (s) { caps(body, 0.02, 0.3, s * 0.085, 0.64, 0.19, '#c96a3a', [0, 0, s * 0.06]); });
      [[-0.1, 0.7], [0.12, 0.62], [-0.13, 0.54], [0.08, 0.76], [-0.02, 0.5]].forEach(function (f, i) {
        for (var pt = 0; pt < 5; pt++) { var pa2 = pt / 5 * TAU; ball(body, 0.032, 0.032, 0.02, f[0] + Math.cos(pa2) * 0.026, f[1] + Math.sin(pa2) * 0.026, 0.186 + (i & 1) * 0.002, i % 2 ? '#fff4c8' : '#ffd0de'); }
        ball(body, 0.026, 0.026, 0.025, f[0], f[1], 0.192, i % 2 ? '#e0903a' : '#ffc83d');
      });
      for (var pr = 0; pr < 9; pr++) { var pra = (pr / 8 - 0.5) * 2.2; ball(body, 0.03, 0.03, 0.03, Math.sin(pra) * 0.13, 0.775 - Math.cos(pra) * 0.05 + 0.03, 0.12 + Math.cos(pra) * 0.06, '#fffaf0'); }
      for (var cb = 0; cb < 2; cb++) tor(elbows[cb], 0.07, 0.014, TAU, 0, -0.04, 0, '#fff1da', [PI / 2, 0, 0]);
    }
    if (kind === 'abariebe') {
      // Nane yeşili hırka, yer süpüren uzun etek, kemer, kol askılı el çantası.
      cyl(body, 0.21, 0.37, 0.58, 0, 0.3, 0, O.pant); tor(body, 0.37, 0.03, TAU, 0, 0.03, 0, '#8fa9d6', [PI / 2, 0, 0]);
      tor(body, 0.3, 0.018, TAU, 0, 0.2, 0, '#223a63', [PI / 2, 0, 0]);
      ball(body, 0.16, 0.34, 0.05, 0, 0.67, 0.172, '#f5eefc');
      [-1, 1].forEach(function (s) { caps(body, 0.022, 0.28, s * 0.09, 0.64, 0.19, '#3f9a77', [0, 0, s * 0.06]); });
      for (var ab = 0; ab < 3; ab++) ball(body, 0.032, 0.032, 0.03, 0.1, 0.72 - ab * 0.1, 0.192, '#f2c14e');
      ball(body, 0.05, 0.05, 0.04, 0, 0.455, 0.21, '#f2c14e');
      var bag = new T.Group(); bag.position.set(0.0, -0.3, 0.02); elbows[1].add(bag);
      ball(bag, 0.19, 0.15, 0.09, 0, 0, 0, '#a8432f'); ball(bag, 0.2, 0.05, 0.095, 0, 0.055, 0, '#8a3424');
      tor(bag, 0.06, 0.011, PI, 0, 0.06, 0, '#5a2417'); ball(bag, 0.035, 0.035, 0.03, 0, 0.02, 0.05, '#f2c14e');
    }
    if (kind === 'dedehassi') {
      // Ekose gömlek (kırmızı-koyu kırmızı-krem çizgiler) + kahverengi triko yelek.
      var ek = '#7a1f1f', ek2 = '#f1e2c4';
      [0.46, 0.56, 0.66, 0.76].forEach(function (yy, i) { tor(body, 0.19 * O.tw + 0.004, 0.011, TAU, 0, yy, 0, i & 1 ? ek2 : ek, [PI / 2, 0, 0], [1, 0.9 * O.tz / O.tw * 1.0, 1]); });
      [-0.14, 0.0, 0.14].forEach(function (xx) { caps(body, 0.01, 0.28, xx * O.tw, 0.62, 0.17 + 0.03 * (1 - Math.abs(xx) * 3), ek, null); });
      [-1, 1].forEach(function (s) {
        caps(body, 0.06, 0.18, s * 0.19 * O.tw, 0.6, 0.07, '#6b5440', [0, 0, 0], [1.1, 1, 1.5]);
        [0.0, -0.1].forEach(function (yy, i) { tor(arms[s > 0 ? 1 : 0], 0.058, 0.01, TAU, 0, -0.1 + yy * 0.7, 0, i ? ek2 : ek, [PI / 2, 0, 0]); });
      });
      caps(body, 0.2, 0.1, 0, 0.62, -0.06, '#6b5440', null, [1.3, 1.1, 0.9]);
      for (var dh = 0; dh < 3; dh++) ball(body, 0.035, 0.035, 0.03, 0.06, 0.74 - dh * 0.1, 0.225, '#2c2118');
      caps(body, 0.2, 0.0, 0, 0.42, 0, '#2c2118', [0, 0, 0], [1.24, 0.3, 1.12]); ball(body, 0.07, 0.045, 0.03, 0, 0.42, 0.235, '#d9ceb8');
    }
    if (kind === 'recepdede') {
      // Gri-mavi ceket (yaka, düğme, cep) + açık mavi gömlek + kravat.
      ball(body, 0.13, 0.34, 0.05, 0, 0.68, 0.172, '#cfe4f2'); caps(body, 0.022, 0.2, 0, 0.66, 0.2, '#7a2f3a', null);
      [-1, 1].forEach(function (s) {
        box(body, 0.045, 0.24, 0.02, s * 0.075 * O.tw, 0.69, 0.19, '#7a8ea6', [0, 0, s * -0.16]);
        box(body, 0.1, 0.012, 0.02, s * 0.13 * O.tw, 0.47, 0.205, '#46566a');
      });
      caps(body, 0.008, 0.3, 0, 0.58, 0.196, '#3a4658', null);
      for (var rb = 0; rb < 2; rb++) ball(body, 0.035, 0.035, 0.03, 0.025, 0.58 - rb * 0.1, 0.2, '#d9ceb8');
      caps(body, 0.2, 0.0, 0, 0.4, 0, '#5b6f86', [0, 0, 0], [1.24, 0.6, 1.1]);
      for (var rc = 0; rc < 2; rc++) tor(elbows[rc], 0.055, 0.012, TAU, 0, -0.1, 0, '#cfe4f2', [PI / 2, 0, 0]);
    }
    if (kind === 'teyze') {
      // Canlı sarı üst, mor pantolon, turkuaz eşarp, kemer, bilezik.
      tor(body, 0.15, 0.04, TAU, 0, 0.78, 0.0, '#27b5a4', [PI / 2, 0, 0]);
      caps(body, 0.034, 0.16, 0.1, 0.66, 0.15, '#27b5a4', [0, 0, 0.1]); ball(body, 0.09, 0.07, 0.06, 0.1, 0.72, 0.15, '#27b5a4');
      for (var ty = 0; ty < 4; ty++) ball(body, 0.05, 0.05, 0.02, -0.1 + (ty % 2) * 0.1 + ty * 0.025, 0.55 + ty * 0.04, 0.178, '#ffffff');
      for (var tb = 0; tb < 2; tb++) tor(elbows[tb], 0.056, 0.012, TAU, 0, -0.1, 0, tb ? '#e24a78' : '#27b5a4', [PI / 2, 0, 0]);
    }
    if (kind === 'enistee') {
      // Spor tişört: beyaz şerit, yaka bandı, numara; eşofman şeritleri.
      tor(body, 0.19 * O.tw + 0.004, 0.02, TAU, 0, 0.62, 0, '#ffffff', [PI / 2, 0, 0], [1, 0.88 * O.tz / O.tw * 1.0, 1]);
      tor(body, 0.19 * O.tw + 0.004, 0.012, TAU, 0, 0.55, 0, '#ff6a3d', [PI / 2, 0, 0], [1, 0.88 * O.tz / O.tw * 1.0, 1]);
      ball(body, 0.1, 0.1, 0.03, -0.11, 0.7, 0.19, '#ffffff'); star(body, 0.065, -0.11, 0.7, 0.2, '#ff6a3d');
      for (var es = 0; es < 2; es++) { tor(arms[es], 0.058, 0.014, TAU, 0, -0.14, 0, '#ffffff', [PI / 2, 0, 0]); }
      [-1, 1].forEach(function (s) {
        caps(legs[s > 0 ? 1 : 0], 0.014, 0.18, s * 0.071, -0.11, 0.0, '#ffffff', null);
        caps(knees[s > 0 ? 1 : 0], 0.013, 0.07, s * 0.062, -0.065, 0.0, '#ffffff', null);
      });
    }
    if (kind === 'avmgorevli') {
      // Mor kurumsal yelek (sarı şeritli), yaka kartı + boyun ipi, khaki belden kemer.
      [-1, 1].forEach(function (s) {
        caps(body, 0.09, 0.22, s * 0.125 * O.tw, 0.6, 0.075, '#6a45c9', [0, 0, 0], [1.1, 1, 1.4]);
        caps(body, 0.016, 0.3, s * 0.045 * O.tw, 0.66, 0.2, '#ffc531', [0, 0, s * -0.04]);
      });
      caps(body, 0.2, 0.1, 0, 0.62, -0.06, '#6a45c9', null, [1.2, 1.1, 0.9]);
      [-1, 1].forEach(function (s) { caps(body, 0.009, 0.16, s * 0.07, 0.72, 0.19, '#ffc531', [0, 0, s * -0.3]); });
      box(body, 0.1, 0.13, 0.02, 0.0, 0.58, 0.215, '#ffffff'); box(body, 0.1, 0.035, 0.022, 0.0, 0.631, 0.216, '#6a45c9'); ball(body, 0.032, 0.032, 0.02, -0.025, 0.575, 0.228, '#f3c6a0');
      box(body, 0.045, 0.012, 0.022, 0.02, 0.56, 0.228, '#9a9fb0'); box(body, 0.045, 0.012, 0.022, 0.02, 0.535, 0.228, '#9a9fb0');
      caps(body, 0.2, 0.0, 0, 0.42, 0, '#1f2233', [0, 0, 0], [1.1, 0.3, 1.04]); ball(body, 0.06, 0.04, 0.03, 0, 0.42, 0.2, '#c0c4d0');
    }
    if (kind === 'ogeday') {
      // Sırt çantası + askılar.
      caps(body, 0.1, 0.12, 0, 0.64, -0.2, '#2fa59c', null, [1.1, 1, 0.8]);
      ball(body, 0.14, 0.12, 0.06, 0, 0.58, -0.28, '#ffcf4a');
      [-1, 1].forEach(function (s) { caps(body, 0.02, 0.28, s * 0.11, 0.7, 0.05, '#1f7f78', [0.2, 0, 0]); });
      star(body, 0.11, 0, 0.66, 0.17, '#ffffff');
    }
    if (kind === 'atilay') {
      // Sihirbaz pelerini + yıldız.
      caps(body, 0.2, 0.2, 0, 0.58, -0.17, '#5d4fb0', [0, 0, 0], [1.4, 1, 0.3]);
      tor(body, 0.14, 0.03, TAU, 0, 0.82, -0.04, '#4a3d92', [PI / 2, 0, 0], [1.2, 1, 1]);
      star(body, 0.14, 0, 0.68, 0.18, '#ffd24a');
    }
    if (kind === 'giray') {
      caps(body, 0.19, 0.05, 0, 0.5, 0.0, '#6fb356', null, [1.05 * O.tw, 0.9, 0.98 * O.tz]);
      ball(body, 0.14, 0.1, 0.05, 0, 0.58, 0.18, '#6fb356');
    }
    if (kind === 'baba') {
      // Gömlek düğmeleri + kemer.
      for (var bu = 0; bu < 3; bu++) ball(body, 0.032, 0.032, 0.03, 0, 0.74 - bu * 0.1, 0.18, '#f6f1e4');
      caps(body, 0.2, 0.0, 0, 0.42, 0, '#3b2c24', [0, 0, 0], [1.24, 0.34, 1.1]);
      ball(body, 0.08, 0.05, 0.03, 0, 0.42, 0.23, '#f2c14e');
    }
    if (kind === 'dede') {
      // Triko yelek: iki yan panel, önde V açıklık.
      [-1, 1].forEach(function (s) { caps(body, 0.1, 0.18, s * 0.17, 0.61, 0.05, '#6b8a5e', [0, 0, 0], [1.1, 1, 1.4]); });
      caps(body, 0.2, 0.1, 0, 0.62, -0.06, '#6b8a5e', null, [1.35, 1.1, 0.9]);
      for (var db = 0; db < 3; db++) ball(body, 0.035, 0.035, 0.03, 0.06, 0.74 - db * 0.1, 0.23, '#3e5238');
      caps(body, 0.2, 0.0, 0, 0.42, 0, '#5a4332', [0, 0, 0], [1.28, 0.3, 1.15]);
    }
    if (kind === 'anne') {
      ball(body, 0.05, 0.05, 0.03, 0, 0.58, 0.17, '#ffd36a');
    }
    if (/bekci/.test(kind)) {
      caps(body, 0.2, 0.0, 0, 0.42, 0, '#141d30', [0, 0, 0], [O.tw + 0.06, 0.36, 1.1]);
      ball(body, 0.08, 0.05, 0.03, 0, 0.42, 0.24, '#f2c14e');
      star(body, 0.09, 0.14, 0.7, 0.19, '#f2c14e');
      [-1, 1].forEach(function (s) { ball(body, 0.1, 0.05, 0.14, s * 0.24, 0.84, 0.0, '#f2c14e'); });
      caps(body, 0.014, 0.1, -0.12, 0.62, 0.2, '#d8dce6', [0, 0, 0.0]);
    }
    var cap = new T.Group();
    if (/bekci/.test(kind)) {
      var capCol = kind === 'bekci' ? '#26396a' : '#2a3f70';
      cyl(cap, 0.34, 0.37, 0.19, 0, 0.27, 0, capCol);
      ball(cap, 0.7, 0.2, 0.68, 0, 0.35, -0.02, capCol);
      cyl(cap, 0.372, 0.372, 0.045, 0, 0.19, 0, '#e8e4d8');
      ball(cap, 0.4, 0.05, 0.26, 0, 0.17, 0.3, '#10172a');
      ball(cap, 0.1, 0.1, 0.03, 0, 0.3, 0.36, '#f2c14e');
    } else {
      part(cap, 'cone', [0.3, 0.42, 10], [0, 0.46, -0.02], '#f08fb0', [0, 0, -0.35]);
      cyl(cap, 0.36, 0.36, 0.08, 0, 0.23, 0, '#fff4ea'); ball(cap, 0.13, 0.13, 0.13, 0.1, 0.68, 0, '#fff4ea');
    }
    head.add(cap); cap.visible = false;
    rigBirlestir([body, head, cap].concat(arms, elbows, legs, knees, head.userData.eyes));
    var oyunTop = null, morHalo = null;
    if (kind === 'gokce') {
      oyunTop = new T.Group();
      ball(oyunTop, 0.17, 0.17, 0.17, 0, 0, 0, '#f3d35c');
      ball(oyunTop, 0.07, 0.07, 0.025, 0, 0.025, 0.15, '#e87863');
      ball(oyunTop, 0.07, 0.07, 0.025, 0, -0.025, -0.15, '#75a6ca');
      oyunTop.visible = false; root.add(oyunTop);
      morHalo = tor(root, 0.56, 0.035, TAU, 0, 0.08, 0, '#bb67ff', [PI / 2, 0, 0]);
      morHalo.material = new T.MeshStandardMaterial({ color: '#bb67ff', emissive: '#8b35df', emissiveIntensity: 1.15, transparent: true, opacity: 0.76, roughness: 0.32, depthWrite: false });
      morHalo.visible = false;
    }
    var mats = []; root.traverse(function (o) { if (o.isMesh) { o.material = o.material.clone(); mats.push(o.material); } });
    var shadow = new T.Mesh(new T.CircleGeometry(0.42, 20), new T.MeshBasicMaterial({ color: '#152015', transparent: true, opacity: 0.16, depthWrite: false }));
    shadow.rotation.x = -PI / 2; shadow.position.y = 0.015; shadow.renderOrder = 1;
    R.actors.add(root); R.actors.add(shadow);
    return { root: root, body: body, head: head, arms: arms, legs: legs, knees: knees, elbows: elbows,
      cap: cap, oyunTop: oyunTop, morHalo: morHalo, mats: mats, kind: kind, rotY: null, px: null, pz: null, hiz: 0, seed: hs(kind.length, kind.charCodeAt(0), 3) * 9, shadow: shadow };
  }
  function blink(head, t, seed) {
    var e = head.userData.eyes; if (!e) return;
    var ph = (t * 0.28 + seed * 0.37) % 1, k = ph > 0.93 ? Math.max(0.12, Math.abs(ph - 0.965) / 0.035) : 1;
    for (var i = 0; i < e.length; i++) e[i].scale.y = k;
  }
  // Çatal: eldeki yemek aleti (yalnız yemek yenirken görünür; tek mesh).
  function catalKur(a) {
    var u = new T.Group();
    caps(u, 0.011, 0.09, 0, -0.23, 0, '#d9dde4'); box(u, 0.055, 0.03, 0.012, 0, -0.31, 0, '#d9dde4');
    for (var k = -1; k <= 1; k++) box(u, 0.009, 0.045, 0.012, k * 0.02, -0.345, 0, '#d9dde4');
    ball(u, 0.07, 0.06, 0.06, 0, -0.35, 0.02, '#e8a24a');
    birlestirGrup(u, new Set());
    u.traverse(function (o) { if (o.isMesh) a.mats.push(o.material); });
    a.elbows[1].add(u); return u;
  }
  // Yetişkin oturma pozu; ent.yemek ise sağ elde çatalla yemek yeme (ele alma, ağza götürme, çiğneme).
  function oturYe(a, ent, d, sc) {
    var t = d.zaman, i, s;
    a.root.position.y = 0.04 - (ent.oturY != null ? ent.oturY : 0.2 * sc);   // varsayılan: ayaklar zeminde, kalça ~0,22 birim yüksekte (oturak üstü ~0,14*ölçek)
    a.body.position.y = 0; a.body.rotation.x = 0.07;
    for (i = 0; i < 2; i++) {
      s = i ? 1 : -1;
      a.legs[i].rotation.set(-1.5, 0, s * 0.07); a.knees[i].rotation.x = 1.5;
      a.arms[i].rotation.set(-0.85, 0, s * 0.06); a.elbows[i].rotation.x = -0.55;
    }
    a.head.rotation.x = 0.04;
    var f = a.catal;
    if (ent.yemek) {
      if (!f) f = a.catal = catalKur(a);
      f.visible = true;
      var u = (t * 0.42 + a.seed * 0.13) % 1, lift;
      function yum(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
      lift = u < 0.3 ? 0 : (u < 0.55 ? yum((u - 0.3) / 0.25) : (u < 0.8 ? 1 : 1 - yum((u - 0.8) / 0.2)));
      a.arms[1].rotation.set(-0.95 - 0.35 * lift, 0, -0.04); a.elbows[1].rotation.x = -0.42 - 1.4 * lift;
      a.arms[0].rotation.set(-0.8, 0, -0.1 * 0); a.elbows[0].rotation.x = -0.75;
      var chew = lift >= 1 ? Math.sin(t * 15) * 0.035 : 0;
      a.head.rotation.x = 0.16 * (1 - lift) + chew; a.head.position.y = 1.11 - (1 - lift) * 0.012;
      a.body.rotation.x = 0.07 + 0.08 * (1 - lift);
    } else if (f) f.visible = false;
  }
  function updateRig(id, ent, kind, d, opts) {
    opts = opts || {};
    var a = R.rigs[id];
    if (!a || a.kind !== kind) {
      if (a) { R.actors.remove(a.root); R.actors.remove(a.shadow); a.mats.forEach(function (m) { m.dispose(); }); if (a.shadow) a.shadow.material.dispose(); }
      a = R.rigs[id] = rig(kind);
    }
    if (!ent || ent.gizli) { a.root.visible = false; a.shadow.visible = false; return; }
    var sc = (opts.scale || 1) * (AYI_OLCEK[kind] || 1), hidden = !!ent.saklandi;
    a.root.visible = !hidden; a.shadow.visible = !hidden;
    a.root.scale.setScalar(sc);
    a.root.position.set(ent.x / U, 0.04, ent.y / U);
    a.shadow.position.set(ent.x / U, 0.018, ent.y / U); a.shadow.scale.setScalar(sc * 0.95);
    // Yumuşak dönüş.
    var targetRot = PI / 2 - (ent.yon || 0);
    if (a.rotY == null) a.rotY = targetRot;
    var diff = ((targetRot - a.rotY + PI) % TAU + TAU) % TAU - PI;
    a.rotY += diff * Math.min(1, (opts.dt || 0.016) * 14);
    a.root.rotation.y = a.rotY;
    // Hızı ölç: yürüme animasyonunun genliği gerçek hızdan gelsin.
    var dt = Math.max(0.001, opts.dt || 0.016), dx = a.px == null ? 0 : ent.x - a.px, dz = a.pz == null ? 0 : ent.y - a.pz;
    a.px = ent.x; a.pz = ent.y;
    var spd = Math.min(6, Math.hypot(dx, dz) / U / dt);
    a.hiz += (spd - a.hiz) * Math.min(1, dt * 9);
    var amp = ent.hareket ? Math.max(0.22, Math.min(1.15, a.hiz / 2.6)) : 0;
    var walk = amp ? Math.sin((ent.adimFaz || d.zaman * 10)) : 0;
    var breathe = 1 + Math.sin(d.zaman * 1.9 + a.seed) * 0.012;
    a.body.scale.y = (ent.egik ? 0.7 : 1) * breathe;
    a.body.position.y = Math.abs(walk) * 0.035 * amp;
    a.head.rotation.z = Math.sin(d.zaman * 0.9 + a.seed) * 0.025;
    a.head.rotation.x = 0;
    a.head.position.y = 1.11 + Math.abs(walk) * 0.012 * amp;
    blink(a.head, d.zaman, a.seed);
    a.body.rotation.set(0, 0, 0);
    if (a.kind === 'kaplumbaga') {
      a.head.position.y = 0.43;
      for (var tl = 0; tl < 4; tl++) a.legs[tl].rotation.x = ent.hareket ? Math.sin((ent.adimFaz || d.zaman * 7) + (tl < 2 ? 0 : PI) + (tl % 2 ? PI : 0)) * 0.38 : 0;
      a.body.position.y = ent.hareket ? Math.abs(Math.sin(d.zaman * 7)) * 0.012 : 0;
      a.head.rotation.y = Math.sin(d.zaman * 0.8 + a.seed) * 0.08;
      opaklikUygula(a, ent, opts, d); return;
    }
    if (a.kind === 'beren') {
      a.body.scale.y = breathe; berenPoz(a, ent, d, sc);
      if (a.cap) a.cap.visible = false;
      a.root.rotation.x = 0;
      opaklikUygula(a, ent, opts, d); return;
    }
    // Varsayılan yürüyüş (dede-tipi dinç yürüyüşte kollar biraz daha geniş sallanır).
    var dinc = a.kind === 'dedehassi' ? 1.25 : 1;
    for (var i = 0; i < 2; i++) {
      var s = i ? 1 : -1;
      a.legs[i].rotation.set(walk * s * 0.62 * amp, 0, 0);
      a.knees[i].rotation.x = Math.max(0, -walk * s * 0.9) * amp;
      a.arms[i].rotation.set(-walk * s * 0.55 * amp * dinc, 0, 0);
      a.elbows[i].rotation.x = -0.08 - Math.max(0, walk * s) * 0.35 * amp * dinc;
    }
    if (a.kind === 'abariebe') {   // sağ elde el çantası: kol sabit, hafif sallanır
      a.arms[1].rotation.set(0.04 + walk * 0.1 * amp, 0, 0.06); a.elbows[1].rotation.x = -0.14;
    }
    if (ent.oturuyor && ent.kaza !== 'dustu') oturYe(a, ent, d, sc);
    // Scooter üstünde sürüş duruşu: ayaklar güverteye basar, eller gidona uzanır.
    // Kaza türü: scooter (varsayılan), salincak, pota. 'dustu' ve 'iyilesti' tüm türlerde aynı.
    var tur = ent.kazaTur || 'scooter', suruyor = opts.ride || (ent.kaza === 'suruyor' && tur !== 'scooter');
    if (suruyor && tur === 'salincak') {
      var sa = ent.salincakAci != null ? ent.salincakAci : Math.sin(d.zaman * 2.2 + a.seed) * 0.5;
      a.root.position.y = 0.5 * sc + 0.04;
      a.body.rotation.x = -0.08 - sa * 0.22;
      a.body.position.y = 0;
      for (i = 0; i < 2; i++) {
        var sw = i ? 1 : -1;
        a.legs[i].rotation.set(-1.38 + sa * 0.25, 0, sw * 0.06);
        a.knees[i].rotation.x = 0.45 + Math.max(0, sa) * 0.5;
        a.arms[i].rotation.set(-2.7, 0, sw * 0.14);
        a.elbows[i].rotation.x = -0.12;
      }
      a.head.rotation.x = 0.06 + sa * 0.1;
    } else if (suruyor && tur === 'trabzan') {
      // Merdiven trabzanına ata biner gibi: bacaklar iki yana sarkar, gövde hafif önde, eller önde trabzanda.
      var tz = Math.sin(d.zaman * 3.1 + a.seed);
      a.root.position.y = (ent.trabzanY != null ? ent.trabzanY : 0.55 * sc) + 0.04;
      a.body.rotation.x = 0.2; a.body.position.y = 0;
      for (i = 0; i < 2; i++) {
        var st = i ? 1 : -1;
        a.legs[i].rotation.set(-0.62 + tz * 0.06 * st, 0, st * 0.52);
        a.knees[i].rotation.x = 0.95 + tz * 0.08;
        a.arms[i].rotation.set(-1.18, 0, st * 0.1);
        a.elbows[i].rotation.x = -0.32 - Math.max(0, tz) * 0.1;
      }
      a.head.rotation.x = 0.1; a.head.rotation.z = tz * 0.04;
    } else if (suruyor && tur === 'trambolin') {
      a.root.position.y = 0.04 + (ent.ziplaY || 0.52);
      var zip = Math.sin(d.zaman * 5);
      for (i=0;i<2;i++) { a.legs[i].rotation.x = -0.2; a.knees[i].rotation.x = 0.3 + Math.max(0,-zip)*0.5; a.arms[i].rotation.set(-0.7,0,(i ? 1 : -1)*0.9); }
    } else if (suruyor && (tur === 'pota' || tur === 'oyunparki' || tur === 'tirmanma_agi' || tur === 'kovan_agaci')) {
      var ph = d.zaman * 5 + a.seed;
      a.root.position.y = 0.04 + (ent.tirmanY || 0);
      a.body.rotation.x = 0.06; a.body.position.y = Math.abs(Math.sin(ph)) * 0.015;
      for (i = 0; i < 2; i++) {
        var sp = Math.sin(ph + i * PI);
        a.arms[i].rotation.set(-2.55 + sp * 0.4, 0, (i ? 1 : -1) * 0.1);
        a.elbows[i].rotation.x = -0.25 - Math.max(0, -sp) * 0.7;
        a.legs[i].rotation.set(-0.45 - Math.max(0, -sp) * 0.8, 0, (i ? 1 : -1) * 0.06);
        a.knees[i].rotation.x = 0.5 + Math.max(0, -sp) * 0.9;
      }
      a.head.rotation.x = -0.18;
    } else if (opts.ride) {
      a.root.position.y = 0.283 + 0.05 * sc;
      a.body.rotation.x = 0.1;
      for (i = 0; i < 2; i++) {
        var sd = i ? 1 : -1;
        a.legs[i].rotation.set(i ? -0.34 : 0.34, 0, sd * 0.03);
        a.knees[i].rotation.x = i ? 0.3 : 0.2;
        a.arms[i].rotation.set(-1.02, 0, sd * 0.05);
        a.elbows[i].rotation.x = -0.12;
      }
      a.head.rotation.x = 0.02;
      a.body.position.y = Math.sin(d.zaman * 9) * 0.012;
    }
    if (ent.kaza === 'dustu') {
      // Yere oturmuş, ağlayan çocuk.
      a.root.position.y = 0.03;
      a.body.rotation.z = Math.sin(d.zaman * 11) * 0.035;
      for (i = 0; i < 2; i++) {
        var sd2 = i ? 1 : -1;
        a.legs[i].rotation.set(-1.15, 0, sd2 * 0.48);
        a.knees[i].rotation.x = 1.1;
        a.arms[i].rotation.set(-1.75, 0, sd2 * 0.5);
        a.elbows[i].rotation.x = -0.7;
      }
      a.head.rotation.x = -0.16;
    } else if (ent.kaza === 'iyilesti') {
      for (i = 0; i < 2; i++) {
        var sd3 = i ? 1 : -1;
        a.arms[i].rotation.set(-0.2, 0, sd3 * (2.35 + Math.sin(d.zaman * 8) * 0.12));
        a.elbows[i].rotation.x = -0.15;
      }
    }
    a.cap.visible = !!opts.awake || /bekci/.test(a.kind);
    if (a.kind === 'gokce') {
      var oyun = ent.oyunPoz || '';
      var zipla = oyun === 'zipla';
      var topOyna = oyun === 'top';
      var balYiyor = !!ent.balYiyor || oyun === 'bal';
      var mor = !!ent.morBal;
      a.morHalo.visible = mor;
      if (mor) { a.morHalo.material.opacity = 0.58 + 0.22 * (0.5 + 0.5 * Math.sin(d.zaman * 5)); a.morHalo.rotation.y = d.zaman * 0.7; }
      a.oyunTop.visible = topOyna;
      if (topOyna) {
        a.oyunTop.position.set(0.28, 1.42 + Math.sin(d.zaman * 7) * 0.15, 0.12);
        a.oyunTop.rotation.set(d.zaman * 1.8, d.zaman * 2.5, d.zaman * 0.8);
        a.arms[0].rotation.set(-1.85, 0, -0.22); a.elbows[0].rotation.x = -0.35;
        a.arms[1].rotation.set(-1.45, 0, 0.24); a.elbows[1].rotation.x = -0.55;
        a.root.position.y = 0.04 + Math.max(0, Math.sin(d.zaman * 6)) * 0.07;
      } else if (zipla) {
        var jp = Math.sin(d.zaman * 7.5);
        a.root.position.y = 0.04 + Math.max(0, jp) * 0.5;
        a.body.rotation.z = jp * 0.045;
        for (i = 0; i < 2; i++) { a.arms[i].rotation.set(-2.65, 0, (i ? 1 : -1) * 0.18); a.elbows[i].rotation.x = -0.28; a.legs[i].rotation.x = jp > 0 ? -0.35 : 0.2; }
      } else if (balYiyor) {
        var bite = 0.5 + 0.5 * Math.sin(d.zaman * 8.5);
        a.arms[1].rotation.set(-1.05 - bite * 0.48, 0, -0.08); a.elbows[1].rotation.x = -0.7 - bite * 0.55;
        a.arms[0].rotation.set(-0.45, 0, 0.08); a.elbows[0].rotation.x = -0.25;
        a.head.rotation.x = -0.15 - bite * 0.08; a.body.rotation.x = 0.035;
      }
    }
    if (AYI[a.kind]) ayiEk(a, ent, d, amp, walk);
    if (opts.sleep) {
      a.root.rotation.set(-PI / 2, 0, 0); a.root.position.y = 0.46; a.root.rotation.z = 0; a.body.position.y = 0;
      a.body.rotation.set(0, 0, 0); a.shadow.visible = false;
    } else {
      a.root.rotation.x = 0; a.root.rotation.z = 0;
    }
    opaklikUygula(a, ent, opts, d);
  }
  function opaklikUygula(a, ent, opts, d) {
    var opacity = (ent.gorunmez > 0 || (opts.child && d.oyuncu && d.oyuncu.gorunmez > 0)) ? 0.28 : 1;
    a.mats.forEach(function (m) {
      var trans = opacity < 1;
      if (m.transparent !== trans) { m.transparent = trans; m.needsUpdate = true; }
      m.opacity = opacity; m.depthWrite = !trans;
    });
  }

  function morBalModel() {
    var g = new T.Group();
    var balMat = new T.MeshStandardMaterial({ color: '#a33de8', emissive: '#6715bd', emissiveIntensity: 0.8, roughness: 0.24, metalness: 0.06 });
    var balA = new T.Mesh(new T.SphereGeometry(0.25, 12, 8), balMat); balA.scale.set(1.55, 0.34, 1.18); balA.position.set(0, 0.12, 0); balA.castShadow = true; g.add(balA);
    var balB = new T.Mesh(new T.SphereGeometry(0.19, 12, 8), balMat); balB.position.set(-0.2, 0.16, 0.04); balB.castShadow = true; g.add(balB);
    var balC = new T.Mesh(new T.SphereGeometry(0.16, 12, 8), balMat); balC.position.set(0.2, 0.15, -0.04); balC.castShadow = true; g.add(balC);
    var halo = new T.Mesh(new T.TorusGeometry(0.45, 0.022, 6, 24), new T.MeshBasicMaterial({ color: '#d794ff', transparent: true, opacity: 0.78, depthWrite: false }));
    halo.rotation.x = -PI / 2; halo.position.y = 0.035; g.add(halo); g.userData.halo = halo;
    var shine = new T.Mesh(new T.SphereGeometry(0.035, 8, 6), new T.MeshBasicMaterial({ color: '#fff4ff' })); shine.position.set(-0.14, 0.24, 0.1); g.add(shine);
    return g;
  }

  // ---------------------------------------------------------------- kedi (Duman)
  function kediRig() {
    var root = new T.Group(), body = new T.Group();
    root.add(body);
    var KUR = '#6f727c', PAZ = '#c9ccd3', KOY = '#585b64';
    // Gövde: yatay yumuşak kapsül + açık renk göğüs.
    caps(body, 0.15, 0.2, 0, 0.27, 0, KUR, [PI / 2, 0, 0], [1, 1, 1]);
    caps(body, 0.1, 0.1, 0, 0.2, 0.1, PAZ, [PI / 2, 0, 0], [1, 1, 0.9]);
    caps(body, 0.15, 0.1, 0, 0.3, -0.02, KOY, [PI / 2, 0, 0], [1.02, 1, 0.45]);
    // Baş grubu: +z ileri bakar. Büyük yuvarlak baş.
    var head = new T.Group(); head.position.set(0, 0.36, 0.2); body.add(head);
    ball(head, 0.4, 0.34, 0.34, 0, 0.1, 0.02, KUR);
    ball(head, 0.2, 0.13, 0.12, 0, 0.0, 0.15, PAZ);
    ball(head, 0.045, 0.034, 0.03, 0, 0.065, 0.19, '#ff9fb2'); // burun
    ball(head, 0.07, 0.05, 0.02, 0, 0.03, 0.2, PAZ);
    tor(head, 0.025, 0.005, PI, -0.025, 0.04, 0.2, '#6b4a52', [0, 0, PI]); tor(head, 0.025, 0.005, PI, 0.025, 0.04, 0.2, '#6b4a52', [0, 0, PI]);
    var eyes = [];
    [-1, 1].forEach(function (s) {
      // Kulak: üçgen, içi pembe.
      part(head, 'cone', [0.1, 0.17, 3], [s * 0.14, 0.31, -0.02], KUR, [0, 0, -s * 0.25]);
      part(head, 'cone', [0.058, 0.11, 3], [s * 0.14, 0.3, 0.02], '#f4a9b8', [0, 0, -s * 0.25]);
      // Gözler: büyük, parlak.
      var eg = new T.Group(); eg.position.set(s * 0.1, 0.12, 0.155); eg.rotation.y = s * 0.45; head.add(eg);
      ball(eg, 0.1, 0.12, 0.05, 0, 0, 0, '#d8f08a');
      ball(eg, 0.075, 0.1, 0.05, 0, 0, 0.012, '#4e9a52');
      ball(eg, 0.036, 0.09, 0.05, 0, 0, 0.022, '#142013');
      ball(eg, 0.03, 0.03, 0.03, -0.014, 0.03, 0.046, '#ffffff'); ball(eg, 0.015, 0.015, 0.02, 0.016, -0.025, 0.046, '#ffffff');
      eyes.push(eg);
      ball(head, 0.07, 0.04, 0.03, s * 0.17, 0.04, 0.12, '#ffa5b5');
      // Bıyıklar.
      for (var wi = -1; wi <= 1; wi++) caps(head, 0.004, 0.14, s * 0.18, 0.04 + wi * 0.02, 0.16, '#f4f1ea', [0.0, 0.0, PI / 2 + s * wi * 0.22], null);
    });
    head.userData.eyes = eyes;
    // Patiler: 4 bacak (tek eklem), açık renk patiler.
    var legList = [];
    [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(function (p) {
      var leg = new T.Group(); leg.position.set(p[0] * 0.12, 0.22, p[1] * 0.1 + (p[1] > 0 ? 0.05 : -0.02)); body.add(leg);
      caps(leg, 0.052, 0.06, 0, -0.07, 0, KUR);
      ball(leg, 0.12, 0.08, 0.15, 0, -0.18, 0.015, PAZ);
      legList.push(leg);
    });
    // Kuyruk: arkadan yukarı kıvrılan yumuşak parçalar.
    var tail = new T.Group(); tail.position.set(0, 0.3, -0.26); body.add(tail);
    var tailSegs = [], tp = tail;
    for (var ti = 0; ti < 3; ti++) {
      var nx = new T.Group(); nx.position.set(0, ti === 0 ? 0.02 : 0.12, ti === 0 ? 0 : -0.01); tp.add(nx);
      caps(nx, 0.042 - ti * 0.005, 0.08, 0, 0.06, 0, ti === 2 ? PAZ : KUR);
      tailSegs.push(nx); tp = nx;
    }
    rigBirlestir([body, head, tail].concat(legList, tailSegs, eyes));
    var mats = []; root.traverse(function (o2) { if (o2.isMesh) { o2.material = o2.material.clone(); mats.push(o2.material); } });
    var shadow = new T.Mesh(new T.CircleGeometry(0.3, 16), new T.MeshBasicMaterial({ color: '#152015', transparent: true, opacity: 0.16, depthWrite: false }));
    shadow.rotation.x = -PI / 2; shadow.position.y = 0.015; shadow.renderOrder = 1;
    R.actors.add(root); R.actors.add(shadow);
    return { root: root, body: body, head: head, legs: legList, tail: tail, tailSegs: tailSegs,
      mats: mats, kind: 'kedi', rotY: null, px: null, pz: null, hiz: 0, seed: Math.random() * 9, shadow: shadow, tailUp: 0 };
  }
  function updateKedi(id, ent, d, dt) {
    var a = R.rigs[id];
    if (!a || a.kind !== 'kedi') {
      if (a) { R.actors.remove(a.root); R.actors.remove(a.shadow); a.mats.forEach(function (m) { m.dispose(); }); if (a.shadow) a.shadow.material.dispose(); }
      a = R.rigs[id] = kediRig();
    }
    if (!ent || ent.gizli) { a.root.visible = false; a.shadow.visible = false; return; }
    a.root.visible = true; a.shadow.visible = true;
    a.root.position.set(ent.x / U, 0.04, ent.y / U);
    a.shadow.position.set(ent.x / U, 0.018, ent.y / U);
    // Yumuşak dönüş (model +z ileri).
    var targetRot = PI / 2 - (ent.yon || 0);
    if (a.rotY == null) a.rotY = targetRot;
    var diff = ((targetRot - a.rotY + PI) % TAU + TAU) % TAU - PI;
    a.rotY += diff * Math.min(1, dt * 12);
    a.root.rotation.y = a.rotY;
    var dx = a.px == null ? 0 : ent.x - a.px, dz = a.pz == null ? 0 : ent.y - a.pz;
    a.px = ent.x; a.pz = ent.y;
    var spd = Math.min(6, Math.hypot(dx, dz) / U / Math.max(0.001, dt));
    a.hiz += (spd - a.hiz) * Math.min(1, dt * 9);
    var kovaliyor = ent.durum === 'takip';
    var amp = ent.hareket ? Math.max(0.3, Math.min(1.3, a.hiz / 2.2)) : 0;
    var walk = Math.sin((ent.adimFaz || d.zaman * 12));
    var segs = a.legs.length;
    for (var i = 0; i < segs; i++) {
      // çapraz dördayapılı yürüyüş
      a.legs[i].rotation.x = walk * (i < 2 ? 1 : -1) * (i % 2 ? 1 : -1) * 0.5 * amp;
    }
    a.body.position.y = Math.abs(walk) * 0.02 * amp;
    a.body.rotation.z = Math.sin(d.zaman * 2 + a.seed) * 0.02;
    // Kafa: kovalarken öne, merakta yukarı.
    a.head.rotation.x = kovaliyor ? 0.14 : Math.sin(d.zaman * 0.8 + a.seed) * 0.06;
    a.head.rotation.y = Math.sin(d.zaman * 0.7 + a.seed * 2) * (kovaliyor ? 0 : 0.18);
    blink(a.head, d.zaman, a.seed);
    // Kuyruk: takipte dik ve hızlı, gezinirken salınan.
    var hedefKuy = kovaliyor ? 1.15 : (ent.durum === 'merak' ? 0.75 : 0.35);
    a.tailUp += (hedefKuy - a.tailUp) * Math.min(1, dt * 4);
    a.tail.rotation.x = -a.tailUp;
    for (i = 0; i < 3; i++) a.tailSegs[i].rotation.y = Math.sin(d.zaman * (kovaliyor ? 9 : 5) + i * 0.8 + a.seed) * (0.35 - i * 0.08);
    var opacity = 1;
    a.mats.forEach(function (m) {
      var trans = opacity < 1;
      if (m.transparent !== trans) { m.transparent = trans; m.needsUpdate = true; }
      m.opacity = opacity; m.depthWrite = !trans;
    });
  }

  // ---------------------------------------------------------------- Ayı Köyü (özgün chibi ayılar + arı kraliçe)
  // superbear / morayi: iki ayak üstünde yürüyen ayılar; rig() ile aynı arayüz (updateRig yürüme/uyku/cap/opaklık mantığı).
  // Kol/bacak tek eklem (dirsek/diz boş gruplar) -> karakter başı ~10-11 draw call.
  var AYI_OLCEK = { superbear: 0.86, morayi: 1.1, koyayisi: 0.92, koyayisi_acik: 0.98 };
  var AYI = {
    superbear: { fur: '#8e5a30', dark: '#6e4322', belly: '#ecce98', ear: '#f0b896', iris: '#4a2a14', tw: 1.04, tz: 1.0 },
    morayi:    { fur: '#8d5ec8', dark: '#6b43a3', belly: '#e0cdf7', ear: '#f4b4e4', iris: '#2e1d52', tw: 1.5, tz: 1.3 },
    koyayisi: { fur: '#98643d', dark: '#6d482d', belly: '#ead0a7', ear: '#efb99a', iris: '#4a2a14', tw: 1.08, tz: 1.02 },
    koyayisi_acik: { fur: '#d1a66c', dark: '#987044', belly: '#f3dfba', ear: '#f2c9a6', iris: '#4a3524', tw: 1.02, tz: 0.98 }
  };
  function ayiRig(kind) {
    var P = AYI[kind], root = new T.Group(), body = new T.Group(), head = new T.Group(), tw = P.tw, tz = P.tz, mor = kind === 'morayi';
    root.add(body); head.position.y = 1.11; body.add(head);
    var arms = [], legs = [], knees = [], elbows = [], GOLD = '#ffcf3a', RED = '#d8343c';
    [-1, 1].forEach(function (s) {
      var leg = new T.Group(); leg.position.set(s * 0.1 * tw, 0.42, 0); body.add(leg);
      caps(leg, 0.095 * (mor ? 1.1 : 1), 0.12, 0, -0.14, 0, P.fur);
      ball(leg, 0.22 * (mor ? 1.1 : 1), 0.14, 0.3, 0, -0.355, 0.045, P.dark);
      ball(leg, 0.12, 0.05, 0.12, 0, -0.395, 0.14, P.belly);   // ayak tabanı yastığı
      var knee = new T.Group(); knee.position.set(0, -0.22, 0); leg.add(knee);
      legs.push(leg); knees.push(knee);
    });
    caps(body, 0.2, 0.14, 0, 0.6, 0, P.fur, null, [tw, 1, 0.92 * tz]);
    ball(body, 0.34 * tw, 0.42, 0.24 * tz, 0, 0.57, 0.1 * tz, P.belly);
    [-1, 1].forEach(function (s) {
      var arm = new T.Group(); arm.position.set(s * (0.2 * tw + 0.05), 0.8, 0); body.add(arm);
      ball(arm, 0.17, 0.17, 0.17, 0, 0, 0, P.fur);
      caps(arm, 0.075, 0.12, 0, -0.14, 0, P.fur);
      ball(arm, 0.19, 0.19, 0.19, 0, -0.3, 0.01, P.dark);
      ball(arm, 0.09, 0.07, 0.04, 0, -0.3, 0.095, P.belly);
      var elbow = new T.Group(); elbow.position.set(0, -0.19, 0); arm.add(elbow);
      arms.push(arm); elbows.push(elbow);
    });
    // Baş.
    var hw = mor ? 0.82 : 0.78;
    ball(head, hw, 0.68, 0.7, 0, 0, 0, P.fur);
    ball(head, 0.36, 0.27, 0.26, 0, -0.105, 0.265, P.belly);              // ağız çevresi
    caps(head, 0.03, 0.07, 0, -0.03, 0.385, '#1c1412', [0, 0, PI / 2], [1, 1, 0.8]);   // yassı dikdörtgenimsi siyah burun
    ball(head, 0.04, 0.02, 0.02, -0.025, -0.012, 0.418, '#ffffff');
    tor(head, 0.075, 0.0105, 2.1, 0, -0.1 + 0.047, 0.372, '#6b3a2a', [0, 0, -PI / 2 - 1.05]);   // gülümseme
    caps(head, 0.01, 0.045, 0, -0.065, 0.385, '#6b3a2a', [0, 0, 0]);
    var eyes = [];
    [-1, 1].forEach(function (s) {
      ball(head, hw * 0.3, 0.3 * 0.7, 0.14, s * hw * 0.34, 0.29, -0.02, P.fur);   // yuvarlak kulak
      ball(head, hw * 0.19, 0.19 * 0.7, 0.07, s * hw * 0.34, 0.29, 0.04, P.ear);
      var eg = new T.Group(); eg.position.set(s * 0.15, 0.07, 0.3); eg.rotation.y = s * 0.3; head.add(eg);
      ball(eg, 0.17, 0.215, 0.08, 0, 0, 0, '#ffffff');
      ball(eg, 0.135, 0.18, 0.07, 0, -0.004, 0.02, P.iris);
      ball(eg, 0.082, 0.115, 0.07, 0, -0.004, 0.035, '#140c12');
      ball(eg, 0.05, 0.05, 0.03, -0.028, 0.045, 0.066, '#ffffff'); ball(eg, 0.024, 0.024, 0.02, 0.03, -0.04, 0.066, '#ffffff');
      eyes.push(eg);
      ball(head, 0.11, 0.065, 0.05, s * 0.27, -0.09, 0.225, '#ff9ea6');   // yanak
      // Kaş: kahramanda kararlı-yumuşak, morda yüksek ve şaşkın (iç uçlar yukarı, asimetrik).
      var by = mor ? (s < 0 ? 0.255 : 0.225) : 0.2, br = mor ? 0.26 : 0.1;
      caps(head, 0.017, 0.07, s * 0.15, by, mor ? 0.255 : 0.265, mor ? '#4a2c70' : '#5a3418', [0, 0, PI / 2 - s * br]);
    });
    head.userData.eyes = eyes;
    if (kind === 'superbear') {
      // Aslına yakın: omuzlardan inen açık mavi askılar + sırtta sarı sırt çantası (turuncu gaga, mavi karın).
      [-1, 1].forEach(function (s) { caps(body, 0.04, 0.3, s * 0.115, 0.66, 0.17, '#7fcbf2', [0.12, 0, s * -0.08]); });
      box(body, 0.34, 0.36, 0.14, 0, 0.62, -0.25, '#ffd23c');
      ball(body, 0.26, 0.2, 0.06, 0, 0.56, -0.33, '#6fb4e8');
      part(body, 'cone', [0.07, 0.12, 4], [0, 0.7, -0.35], '#ff9a3c', [-PI / 2, 0, 0]);
      [-1, 1].forEach(function (s) { ball(body, 0.05, 0.05, 0.03, s * 0.06, 0.78, -0.32, '#1c1412'); });
    }
    var capeA = null, capeB = null;
    // Gece şapkası (uyku/uyanık mantığı yetişkinlerle aynı).
    var cap = new T.Group();
    var cc = mor ? '#6f8be0' : '#e8749a';
    part(cap, 'cone', [0.3, 0.44, 10], [0.0, 0.45, -0.04], cc, [0, 0, -0.3]);
    cyl(cap, 0.35, 0.35, 0.09, 0, 0.23, 0, '#fff4ea'); ball(cap, 0.13, 0.13, 0.13, 0.1, 0.68, 0, '#fff4ea');
    cap.position.y = -0.05; head.add(cap); cap.visible = false;
    var grp = [body, head].concat(arms, legs, eyes); 
    rigBirlestir(grp.concat([cap]));
    var mats = []; root.traverse(function (o) { if (o.isMesh) { o.material = o.material.clone(); mats.push(o.material); } });
    var shadow = new T.Mesh(new T.CircleGeometry(0.42, 20), new T.MeshBasicMaterial({ color: '#152015', transparent: true, opacity: 0.16, depthWrite: false }));
    shadow.rotation.x = -PI / 2; shadow.position.y = 0.015; shadow.renderOrder = 1;
    R.actors.add(root); R.actors.add(shadow);
    return { root: root, body: body, head: head, arms: arms, legs: legs, knees: knees, elbows: elbows, 
      cap: cap, mats: mats, kind: kind, rotY: null, px: null, pz: null, hiz: 0, seed: hs(kind.length, kind.charCodeAt(0), 3) * 9, shadow: shadow };
  }
  // updateRig içinden çağrılır: kahraman eğimi, Mor Ayı'nın tombul sallanışı.
  function ayiEk(a, ent, d, amp, walk) {
    var t = d.zaman, f = Math.min(1, amp);
    if (a.kind === 'superbear') {
      a.body.rotation.x += 0.05 + 0.1 * f;   // koşarken öne eğilir
    } else if (a.kind === 'morayi') {
      a.body.rotation.z += Math.sin(walk * 1.0) * 0.07 * f;   // tombul ördek yürüyüşü
      a.body.rotation.x += 0.04 * f;
      a.head.rotation.z += Math.sin(t * 2.4 + a.seed) * 0.05;   // meraklı baş eğme
    }
  }

  // ---------------------------------------------------------------- arı (Kraliçe Beatrice + küçük işçi arılar)
  var ARI_SARI = '#ffd23c', ARI_SIYAH = '#2b2230', ARI_KANAT = '#dff4ff';
  function ariRig(tip) {
    tip = tip === 'ari' ? 'ari' : 'beatrice';
    var root = new T.Group(), body = new T.Group(), head = null, eyes = [], wings = [], wandArm = null, gruplar;
    root.add(body);
    var wingMats = [];
    if (tip === 'ari') {
      // Küçük işçi: tek birleşik gövde meshi + tek kanat çifti (ölçekle çırpılır) -> 2-3 draw call.
      ball(body, 0.34, 0.3, 0.4, 0, 0, 0, ARI_SARI);
      [-0.1, 0.02, 0.14].forEach(function (z) { tor(body, 0.135 * Math.sqrt(1 - Math.pow(z / 0.2, 2)) + 0.004, 0.026, TAU, 0, 0, -z, ARI_SIYAH); });
      part(body, 'cone', [0.06, 0.12, 5], [0, 0, -0.23], ARI_SIYAH, [-PI / 2, 0, 0]);
      ball(body, 0.27, 0.25, 0.25, 0, 0.03, 0.2, '#ffe47a');
      [-1, 1].forEach(function (s) {
        ball(body, 0.085, 0.1, 0.05, s * 0.065, 0.06, 0.31, '#ffffff'); ball(body, 0.06, 0.075, 0.05, s * 0.065, 0.055, 0.325, '#1a1420');
        ball(body, 0.022, 0.022, 0.02, s * 0.06 - 0.01, 0.085, 0.35, '#ffffff');
        caps(body, 0.008, 0.07, s * 0.05, 0.19, 0.24, ARI_SIYAH, [0.3, 0, -s * 0.35]);
        ball(body, 0.05, 0.05, 0.05, s * 0.065, 0.015, 0.27, '#ff9ea6');
      });
      var w = new T.Group(); w.position.set(0, 0.17, -0.02); body.add(w);
      [-1, 1].forEach(function (s) { ball(w, 0.26, 0.018, 0.14, s * 0.15, 0.015, -0.01, ARI_KANAT).rotation.set(0, s * -0.25, s * 0.12); });
      wings.push(w);
      gruplar = [body, w];
    } else {
      // Kraliçe: tombul, büyük kafalı. Gövde +z ileri bakar.
      ball(body, 0.5, 0.48, 0.46, 0, 0.0, 0.0, ARI_SARI);                      // göğüs
      tor(body, 0.215, 0.05, TAU, 0, 0.0, 0.08, ARI_SIYAH, [0, 0, 0], [1, 1, 1]);
      ball(body, 0.5, 0.46, 0.62, 0, -0.09, -0.36, ARI_SARI);                  // karın
      [-0.17, 0.0, 0.17].forEach(function (z) {
        var r = 0.25 * Math.sqrt(1 - Math.pow(z / 0.31, 2)) + 0.006;
        tor(body, r, 0.036, TAU, 0, -0.09, -0.36 - z, ARI_SIYAH, null, [0.98, 0.93, 1]);
      });
      part(body, 'cone', [0.1, 0.2, 6], [0, -0.1, -0.74], ARI_SIYAH, [-PI / 2, 0, 0]);
      [-1, 1].forEach(function (s) {
        caps(body, 0.032, 0.07, s * 0.09, -0.3, 0.02, ARI_SIYAH, [0.2, 0, s * 0.18]);
        ball(body, 0.08, 0.05, 0.1, s * 0.09, -0.4, 0.05, ARI_SIYAH);
      });
      wandArm = new T.Group(); wandArm.position.set(0.26, -0.02, 0.1); body.add(wandArm);
      ball(wandArm, 0.12, 0.12, 0.12, 0, 0, 0, ARI_SARI);
      ball(wandArm, 0.1, 0.1, 0.1, 0.02, -0.07, 0.03, ARI_SIYAH);
      ball(body, 0.12, 0.12, 0.12, -0.25, -0.02, 0.1, ARI_SARI);                // sol el
      head = new T.Group(); head.position.set(0, 0.5, 0.1); body.add(head);
      ball(head, 0.68, 0.6, 0.6, 0, 0, 0, '#ffe27a');
      ball(head, 0.2, 0.13, 0.1, 0, -0.17, 0.26, '#fff0b0');
      tor(head, 0.062, 0.011, 2.1, 0, -0.205 + 0.04, 0.3, '#8a3a3a', [0, 0, -PI / 2 - 1.05]);
      ball(head, 0.07, 0.05, 0.04, 0, -0.085, 0.3, '#e08a5a');
      [-1, 1].forEach(function (s) {
        var eg = new T.Group(); eg.position.set(s * 0.16, 0.01, 0.25); eg.rotation.y = s * 0.3; head.add(eg);
        ball(eg, 0.21, 0.26, 0.09, 0, 0, 0, '#ffffff');
        ball(eg, 0.17, 0.22, 0.08, 0, -0.004, 0.02, '#4a2a60');
        ball(eg, 0.105, 0.145, 0.08, 0, -0.004, 0.04, '#140c18');
        ball(eg, 0.065, 0.065, 0.04, -0.034, 0.055, 0.078, '#ffffff'); ball(eg, 0.03, 0.03, 0.03, 0.037, -0.05, 0.078, '#ffffff');
        eyes.push(eg);
        ball(head, 0.13, 0.075, 0.05, s * 0.28, -0.1, 0.19, '#ff9ea6');
        caps(head, 0.011, 0.06, s * 0.16, 0.21, 0.22, '#7a5a2a', [0, 0, PI / 2 - s * 0.12]);
        caps(head, 0.011, 0.16, s * 0.1, 0.38, 0.05, ARI_SIYAH, [0.35, 0, -s * 0.35]);   // anten
        ball(head, 0.07, 0.07, 0.07, s * 0.15, 0.47, 0.1, '#ffcf3a');
      });
      // Altın taç.
      cyl(head, 0.2, 0.22, 0.09, 0, 0.3, -0.02, '#ffc72c');
      for (var ti = 0; ti < 5; ti++) {
        var an = (ti - 2) * 0.55, tx = Math.sin(an) * 0.2, tzz = -0.02 + Math.cos(an) * 0.2 - 0.2;
        part(head, 'cone', [0.085, 0.16, 4], [tx, 0.4, tzz], '#ffc72c', [0, 0, 0]);
        ball(head, 0.045, 0.045, 0.045, tx, 0.495, tzz, ti % 2 ? '#ff5a7a' : '#6ad8ff');
      }
      ball(head, 0.07, 0.07, 0.05, 0, 0.31, 0.2, '#ff5a7a');
      [-1, 1].forEach(function (s) {
        var w2 = new T.Group(); w2.position.set(s * 0.1, 0.2, -0.12); body.add(w2);
        ball(w2, 0.66, 0.03, 0.4, s * 0.34, 0.06, -0.06, ARI_KANAT).rotation.set(0, s * -0.3, 0);
        ball(w2, 0.42, 0.025, 0.26, s * 0.22, 0.03, -0.38, ARI_KANAT).rotation.set(0, s * -0.55, 0);
        wings.push(w2);
      });
      gruplar = [body, head, wandArm].concat(eyes, wings);
    }
    rigBirlestir(gruplar);
    wings.forEach(function (w) {   // saydamımsı kanat
      w.traverse(function (o) { if (o.isMesh) { o.material.transparent = true; o.material.opacity = 0.55; o.material.depthWrite = false; o.material.side = T.DoubleSide; o.castShadow = false; } });
    });
    var mats = []; root.traverse(function (o) { if (o.isMesh) { o.material = o.material.clone(); mats.push(o.material); } });
    var shadow = new T.Mesh(new T.CircleGeometry(tip === 'ari' ? 0.18 : 0.36, 16), new T.MeshBasicMaterial({ color: '#152015', transparent: true, opacity: 0.16, depthWrite: false }));
    shadow.rotation.x = -PI / 2; shadow.position.y = 0.015; shadow.renderOrder = 1;
    R.actors.add(root); R.actors.add(shadow);
    return { root: root, body: body, head: head, eyes: eyes, wings: wings, wandArm: wandArm, mats: mats, kind: tip, rotY: null, px: null, pz: null, hiz: 0,
      seed: Math.random() * 9, shadow: shadow, shadowBase: tip === 'ari' ? 0.16 : 0.18 };
  }
  // ent: { x, y, yon, hareket, yukseklik (dünya birimi, irtifa), olcek }. tip: 'beatrice' (varsayılan) | 'ari'.
  function updateAri(id, ent, d, dt, tip) {
    tip = tip === 'ari' ? 'ari' : 'beatrice';
    dt = Math.max(0.001, dt || 0.016);
    var a = R.rigs[id];
    if (!a || a.kind !== tip) {
      if (a) { R.actors.remove(a.root); R.actors.remove(a.shadow); a.mats.forEach(function (m) { m.dispose(); }); if (a.shadow) a.shadow.material.dispose(); }
      a = R.rigs[id] = ariRig(tip);
    }
    if (!ent || ent.gizli) { a.root.visible = false; a.shadow.visible = false; return; }
    a.root.visible = true; a.shadow.visible = true;
    var sc = ent.olcek || (tip === 'ari' ? 1 : 1.25), t = d.zaman, ph = t + a.seed;
    var irt = ent.yukseklik != null ? ent.yukseklik : (tip === 'ari' ? 0.9 : 1.35);
    var bob = Math.sin(ph * (tip === 'ari' ? 3.1 : 2.2)) * (tip === 'ari' ? 0.05 : 0.09) * sc;
    a.root.scale.setScalar(sc);
    a.root.position.set(ent.x / U, 0.04 + irt + bob, ent.y / U);
    a.shadow.position.set(ent.x / U, 0.018, ent.y / U);
    a.shadow.scale.setScalar(sc * Math.max(0.5, 1 - irt * 0.12));
    a.shadow.material.opacity = Math.max(0.07, 0.17 - irt * 0.03);
    var targetRot = PI / 2 - (ent.yon || 0);
    if (a.rotY == null) a.rotY = targetRot;
    var diff = ((targetRot - a.rotY + PI) % TAU + TAU) % TAU - PI;
    a.rotY += diff * Math.min(1, dt * 9);
    a.root.rotation.y = a.rotY;
    var dx = a.px == null ? 0 : ent.x - a.px, dz = a.pz == null ? 0 : ent.y - a.pz;
    a.px = ent.x; a.pz = ent.y;
    a.hiz += (Math.min(8, Math.hypot(dx, dz) / U / dt) - a.hiz) * Math.min(1, dt * 7);
    var amp = Math.min(1, a.hiz / 2.5);
    a.body.rotation.set(0.12 + 0.28 * amp + Math.sin(ph * 1.7) * 0.04, 0, Math.sin(ph * 1.3) * 0.07);   // uçarken öne eğilir
    // Hızlı kanat çırpma.
    var fl = Math.sin(t * (tip === 'ari' ? 52 : 44) + a.seed);
    if (tip === 'ari') {
      a.wings[0].scale.set(0.45 + 0.55 * Math.abs(fl), 1, 1);
    } else {
      a.wings[0].rotation.z = -(0.55 + fl * 0.5); a.wings[1].rotation.z = (0.55 + fl * 0.5);
      a.wandArm.rotation.set(0.1 + Math.sin(ph * 2.6) * 0.18, 0, Math.sin(ph * 3.2) * 0.25);
      a.head.rotation.set(-0.1 + Math.sin(ph * 1.2) * 0.04, Math.sin(ph * 0.8) * 0.2, Math.sin(ph * 1.5) * 0.05);
      blink(a.head, t, a.seed);
    }
  }

  // ---------------------------------------------------------------- toplanabilirler
  // Çıkartma rozeti: arayuz.js'in 2D rozet çizimi dokuya basılır, kameraya dönük sprite olarak durur.
  var rozetDoku = {};
  function rozetSprite(ad) {
    if (!rozetDoku[ad]) {
      var cv = document.createElement('canvas'); cv.width = cv.height = 128;
      var c = cv.getContext('2d');
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(64, 64, 60, 0, TAU); c.fill();
      if (G.arayuz && G.arayuz.rozet) { try { G.arayuz.rozet(c, ad, 64, 64, 50, true); } catch (h) { } }
      var tx = new T.CanvasTexture(cv); tx.colorSpace = T.SRGBColorSpace; rozetDoku[ad] = tx;
    }
    var sp = new T.Sprite(new T.SpriteMaterial({ map: rozetDoku[ad], transparent: true, depthWrite: false }));
    sp.scale.set(0.62, 0.62, 1); return sp;
  }
  function collectible(tur, it) {
    var g = new T.Group(), col = tur === 'anahtar_kirmizi' ? '#ed745d' : '#6cabed';
    if (tur === 'cikartma') {
      col = '#ffe14d';
      var bb = G.bolumler && G.bolumler[G.bolum], ck = bb && bb.cikartma && it ? bb.cikartma[it.no] : null;
      g.add(rozetSprite(ck ? ck.r : 'yildiz'));
    } else if (tur.indexOf('anahtar') === 0) {
      part(g, 'ring', [0.6], [-0.12, 0, 0], col); box(g, 0.5, 0.08, 0.08, 0.17, 0, 0, col);
      box(g, 0.07, 0.17, 0.08, 0.32, -0.06, 0, col); box(g, 0.07, 0.15, 0.08, 0.17, -0.05, 0, col);
      var rng = part(g, 'ring', [0.86], [-0.12, -0.48, 0], col, [PI / 2, 0, 0]); rng.castShadow = false;
    } else if (tur === 'top_hazine') {
      col = '#f2d481';
      ball(g, 0.6, 0.6, 0.6, 0, 0, 0, '#f2d481'); ball(g, 0.24, 0.24, 0.06, 0, 0.05, 0.28, '#e87863'); ball(g, 0.24, 0.24, 0.06, 0, -0.1, -0.26, '#75a6ca');
    } else if (tur === 'elma') {
      col = '#e2694d'; ball(g, 0.3, 0.28, 0.3, 0, 0, 0, '#da7153'); box(g, 0.025, 0.1, 0.025, 0, 0.16, 0, '#6c6348');
    } else if (tur === 'teneke') {
      col = '#b9c9c9'; cyl(g, 0.12, 0.12, 0.28, 0, 0, 0, '#9fb4b5'); cyl(g, 0.124, 0.124, 0.1, 0, 0, 0, '#d98166');
    } else if (tur === 'cingirak') {
      col = '#ff9eb7'; ball(g, 0.22, 0.22, 0.22, 0, 0.1, 0, '#ff6b8f'); cyl(g, 0.03, 0.03, 0.26, 0, -0.08, 0, '#ffd66b'); ball(g, 0.1, 0.1, 0.1, 0, -0.22, 0, '#7fd0f0'); ball(g, 0.07, 0.07, 0.07, 0.1, 0.12, 0.06, '#fff3b0');
    } else if (tur === 'pelus') {
      col = '#e0b477'; ball(g, 0.3, 0.3, 0.26, 0, 0, 0, '#d9a066'); ball(g, 0.22, 0.2, 0.2, 0, 0.2, 0.02, '#d9a066'); ball(g, 0.09, 0.09, 0.06, -0.09, 0.3, 0, '#d9a066'); ball(g, 0.09, 0.09, 0.06, 0.09, 0.3, 0, '#d9a066'); ball(g, 0.07, 0.05, 0.04, 0, 0.17, 0.12, '#4a2f22'); ball(g, 0.18, 0.12, 0.05, 0, -0.02, 0.13, '#f3d6a8');
    } else if (tur === 'oyuncak_top') {
      col = '#ff9eb7'; ball(g, 0.34, 0.34, 0.34, 0, 0, 0, '#ff6b6b'); box(g, 0.36, 0.08, 0.36, 0, 0, 0, '#ffd66b'); box(g, 0.08, 0.36, 0.36, 0, 0, 0, '#4dc3ff');
    } else if (tur === 'oyuncak_ordek') {
      col = '#f0cb5d'; ball(g, 0.29, 0.22, 0.23, 0, 0, 0, '#e8c76d'); ball(g, 0.17, 0.17, 0.17, 0.1, 0.14, 0, '#e8c76d'); ball(g, 0.12, 0.045, 0.07, 0.2, 0.12, 0, '#cc8d50');
    } else {
      col = '#e0b477'; cyl(g, 0.16, 0.16, 0.07, 0, 0, 0, '#cba16b');
      for (var i = 0; i < 4; i++) ball(g, 0.04, 0.025, 0.04, Math.sin(i * 2) * 0.1, 0.04, Math.cos(i * 2) * 0.1, '#6e503d');
    }
    var glow = new T.Sprite(new T.SpriteMaterial({ map: glowTexture(), color: col, transparent: true, opacity: 0.5, blending: T.AdditiveBlending, depthWrite: false }));
    glow.scale.set(1.35, 1.35, 1); glow.position.y = -0.05; g.add(glow);
    var halo = new T.Mesh(new T.RingGeometry(0.3, 0.35, 24), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.35, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
    halo.rotation.x = -PI / 2; halo.position.y = -0.46; g.add(halo);
    g.userData.glow = glow; g.userData.halo = halo;
    return g;
  }
  function sparkle(x, y, z, color, n, speed) {
    for (var i = 0; i < n; i++) {
      var sp = new T.Sprite(new T.SpriteMaterial({ map: glowTexture(), color: color || '#ffe8a0', transparent: true, opacity: 0.95, blending: T.AdditiveBlending, depthWrite: false }));
      sp.position.set(x, y, z);
      sp.scale.setScalar(0.35 + Math.random() * 0.35);
      R.scene.add(sp);
      R.parts.push({ sp: sp, vx: (Math.random() - 0.5) * (speed || 1.6), vy: 0.7 + Math.random() * 1.5, vz: (Math.random() - 0.5) * (speed || 1.6), life: 0.55 + Math.random() * 0.4, max: 1 });
    }
  }

  // ---------------------------------------------------------------- görüş konisi
  function cone(index, n) {
    var mesh = R.cones[index];
    if (!mesh) {
      var g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array(36 * 9), 3));
      var m = new T.MeshBasicMaterial({ color: '#a97a12', transparent: true, opacity: 0.38, side: T.DoubleSide, depthWrite: false });
      mesh = new T.Mesh(g, m); mesh.frustumCulled = false; R.scene.add(mesh); R.cones[index] = mesh;
    }
    mesh.visible = !!n && !n.gizli && !n.pasif && !n.kucakta && !/yorgun|yakaladi|selam|oyalan/.test(n.durum); if (!mesh.visible) return;
    var ispk = n.kim === 'teyze' || n.kim === 'enistee' || n.kim === 'beatrice';   // ispiyoncu: soluk koni (tehlike değil)
    mesh.material.opacity = ispk ? (n.durum === 'ispiyon' ? 0.3 : 0.17) : (n.durum === 'kovalama' ? 0.46 : (n.durum === 'suphe' ? 0.42 : 0.38));
    var buf = mesh.geometry.attributes.position.array, a = n.gorusAci || 1.2, dist = (n.gorusMesafe || 300) / U, px = n.x / U, pz = n.y / U, pts = [];
    for (var i = 0; i <= 36; i++) {
      var angle = (n.yon || 0) - a / 2 + a * i / 36, dx = Math.cos(angle), dz = Math.sin(angle), r = 0.3;
      for (; r < dist; r += 0.13) if (G.harita.kati(Math.floor(px + dx * r), Math.floor(pz + dz * r))) break;
      pts.push([px + dx * r, pz + dz * r]);
    }
    for (i = 0; i < 36; i++) {
      var j = i * 9; buf[j] = px; buf[j + 1] = 0.075; buf[j + 2] = pz;
      buf[j + 3] = pts[i][0]; buf[j + 4] = 0.075; buf[j + 5] = pts[i][1];
      buf[j + 6] = pts[i + 1][0]; buf[j + 7] = 0.075; buf[j + 8] = pts[i + 1][1];
    }
    mesh.geometry.attributes.position.needsUpdate = true;
    mesh.material.color.set(n.durum === 'kovalama' ? '#c23a2a' : n.durum === 'suphe' ? '#b06a10' : n.kim === 'ebe' ? '#6f4a95' : n.kim === 'ogretmen' ? '#a8467a' : n.kim === 'mudur' ? '#3f6e52' : /bekci/.test(n.kim) ? '#2f4f8a' : n.kim === 'dede' ? '#2f6b8f' : n.kim === 'recepdede' ? '#4f6f86' : n.kim === 'dedehassi' ? '#a8452f' : n.kim === 'teyze' ? '#e58fc4' : n.kim === 'enistee' ? '#7fb2ee' : n.kim === 'beren' ? '#d98a9e' : '#b07f16');
  }

  // ---------------------------------------------------------------- ekran yazıları
  function project(x, y, height) {
    v3.set(x / U, height || 0, y / U); v3.project(R.camera);
    return { x: (v3.x + 1) * R.width / 2, y: (1 - v3.y) * R.height / 2, visible: v3.z > -1.1 && v3.z < 1.1 };
  }
  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function intersects(a, b) {
    var x = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
    var y = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    return x * y > Math.min(a.w * a.h, b.w * b.h) * 0.22;
  }
  function wrap(c, text, maxW) {
    var words = String(text).split(' '), lines = [], cur = '';
    for (var i = 0; i < words.length; i++) {
      var tst = cur ? cur + ' ' + words[i] : words[i];
      if (c.measureText(tst).width > maxW && cur) { lines.push(cur); cur = words[i]; } else cur = tst;
    }
    if (cur) lines.push(cur);
    return lines.slice(0, 3);
  }
  var etGor = new Map();   // varlık -> ekrana ilk girdiği an (telefonda isim etiketi 2 sn)
  function hmapKat1() { return G.harita && G.harita.katSayisi > 1; }
  function ayniKat(e) { var hm = G.harita; return !(hm && hm.katSayisi > 1 && e && typeof e.y === 'number' && hm.katOf(e.y) !== R.kat); }
  function labels(ctx, d) {
    var tel = !!G.dokunmatik, simdi = performance.now(), gorulen = new Set();
    ctx.save(); ctx.setTransform(d.ekran.dpr, 0, 0, d.ekran.dpr, 0, 0);
    // Sinematik vinyet.
    var vg = ctx.createRadialGradient(R.width / 2, R.height * 0.45, Math.min(R.width, R.height) * 0.36, R.width / 2, R.height * 0.5, Math.hypot(R.width, R.height) * 0.62);
    vg.addColorStop(0, 'rgba(10,24,14,0)'); vg.addColorStop(1, 'rgba(10,22,14,0.22)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, R.width, R.height);
    if (d.mod === 'menu') { ctx.restore(); return; }
    var list = [], boxes = [];
    function ekle(e, ad, height, prio, renk) {
      if (!e || e.gizli || e.saklandi || e.pasif || !ayniKat(e)) return;
      var p = project(e.x, e.y, height);
      if (!p.visible || p.x < -90 || p.x > R.width + 90 || p.y < -40 || p.y > R.height + 90) return;
      gorulen.add(e);
      if (!etGor.has(e)) etGor.set(e, simdi);
      if (tel) {
        var kov = (e === d.komsu || e === d.uyanan) && e.durum === 'kovalama';
        if (!kov && simdi - etGor.get(e) > 2000) return;
        if (e === d.oyuncu && simdi - etGor.get(e) > 2000) return;
      }
      list.push({ e: e, ad: ad, p: p, prio: prio, renk: renk || '#fff8e4' });
    }
    ekle(d.oyuncu, 'Ogeday', 1.62, 100, '#ffe9a8');
    (d.kardesler || []).forEach(function (e, i) { ekle(e, e.ad, i === 0 ? 1.15 : 1.35, e.kaza ? 96 : 84, i === 0 ? '#bcdcff' : '#c8e9c0'); });
    (d.oturanlar || []).forEach(function (e) { ekle(e, G.kisiAdi(e.kim), 1.5, 50, '#fff1da'); });
    if (d.superbear) ekle(d.superbear, 'Super Bear', 1.75, 65, '#ffe6b4');
    if (d.beatrice) ekle(d.beatrice, 'Beatrice', d.beatrice.yukseklik + 1.6, 73, '#fff3a3');
    if (d.gokce) ekle(d.gokce, 'Gökçe', 1.55, 80, '#e6c8f2');
    if (d.komsu) ekle(d.komsu, G.kisiAdi(d.komsu.kim), d.komsu.kim === 'beren' ? 1.0 : 1.98, 70, '#ffe2bb');
    if (d.teyze) ekle(d.teyze, 'Nefise Teyze', 1.9, 63, '#ffc9e6');
    if (d.eniste) ekle(d.eniste, 'Uğurcan Enişte', 2.0, 63, '#c9defa');
    if (d.uyanan) ekle(d.uyanan, G.kisiAdi(d.uyanan.kim), 2.05, 72, '#ffd0c0');
    if (d.kedi) ekle(d.kedi, 'Duman', 0.62, 66, '#d7dde2');
    if (d.recep) ekle(d.recep, 'Recep Dede', 2.02, 71, '#cfe4f2');
    if (d.anneanne) ekle(d.anneanne, 'Anneanne', 1.9, 62, '#ffd9b8');
    if (d.abari) ekle(d.abari, 'Abari Ebe', 1.9, 62, '#e3d2f7');
    if (d.uyuyan && !tel) ekle(d.uyuyan, G.kisiAdi(d.uyuyan.kim) + ' (uyuyor)', 1.2, 40, '#c8d8e8');
    etGor.forEach(function (v, k) { if (!gorulen.has(k)) etGor.delete(k); });
    list.sort(function (a, b) { return b.prio - a.prio; });
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    list.forEach(function (it) {
      var txt = it.ad, fs = tel ? 10 : 10;
      ctx.font = 'bold ' + fs + 'px "Trebuchet MS", sans-serif';
      var w = Math.max(30, ctx.measureText(txt).width + 10), h = 15;
      var x = it.p.x - w / 2, y = it.p.y - h - 2, ok = false;
      for (var k = 0; k < 3; k++) {
        var yy = y - k * (h + 3);
        var r = { x: x, y: yy, w: w, h: h };
        if (r.x < 4) r.x = 4; if (r.x + r.w > R.width - 4) r.x = R.width - 4 - r.w;
        var bad = false;
        for (var b = 0; b < boxes.length; b++) if (intersects(r, boxes[b])) { bad = true; break; }
        if (!bad) { r.y = yy; boxes.push(r); ok = r; break; }
      }
      if (!ok) return;
      ctx.save(); ctx.globalAlpha = tel ? 0.8 : 0.55;
      ctx.fillStyle = 'rgba(20,32,24,0.6)'; rr(ctx, ok.x, ok.y, ok.w, ok.h, 8); ctx.fill();
      ctx.fillStyle = it.renk; ctx.fillText(txt, ok.x + ok.w / 2, ok.y + ok.h / 2 + 0.5);
      ctx.restore();
    });
    // Konuşma balonları; isim etiketleriyle çakışmayacak şekilde yukarı kaydırılır.
    var bubbles = [];
    function balonEkle(e, ad, height, prio) {
      if (!e || e.gizli || e.saklandi || e.pasif || !ayniKat(e) || !e.konusma || !e.konusma.metin) return;
      var p = project(e.x, e.y, height); if (!p.visible) return;
      bubbles.push({ e: e, p: p, prio: prio });
    }
    var kovK = function (e) { return (e === d.komsu || e === d.uyanan || e === d.recep) && e.durum === 'kovalama'; };
    balonEkle(d.oyuncu, null, 1.62, 100);
    if (d.komsu) balonEkle(d.komsu, null, d.komsu.kim === 'beren' ? 1.0 : 1.98, kovK(d.komsu) ? 98 : 70);
    if (d.superbear) balonEkle(d.superbear, null, 1.9, 85);
    if (d.beatrice) balonEkle(d.beatrice, null, d.beatrice.yukseklik + 1.75, 90);
    if (d.teyze) balonEkle(d.teyze, null, 1.9, d.teyze.durum === 'ispiyon' ? 90 : 66);
    if (d.eniste) balonEkle(d.eniste, null, 2.0, d.eniste.durum === 'ispiyon' ? 90 : 66);
    if (d.uyanan) balonEkle(d.uyanan, null, 2.05, kovK(d.uyanan) ? 98 : 72);
    (d.kardesler || []).forEach(function (e, i) { balonEkle(e, null, i === 0 ? 1.15 : 1.35, e.kaza ? 96 : 84); });
    if (d.gokce) balonEkle(d.gokce, null, 1.55, 80);
    if (d.kedi) balonEkle(d.kedi, null, 0.62, 68);
    if (d.recep) balonEkle(d.recep, null, 2.02, d.recep.durum === 'kovalama' ? 97 : 71);
    if (d.anneanne) balonEkle(d.anneanne, null, 1.9, 76);
    if (d.abari) balonEkle(d.abari, null, 1.9, 74);
    bubbles.sort(function (a, b) { return b.prio - a.prio; });
    var balonBox = [], balonSay = 0, balonMax = tel ? 2 : 3;
    bubbles.forEach(function (b) {
      var k = b.e.konusma; if (!k || !k.metin) return;
      if (balonSay >= balonMax) return;
      var fs = tel ? 11 : 12; ctx.font = 'bold ' + fs + 'px "Trebuchet MS", sans-serif';
      var lines = wrap(ctx, k.metin, tel ? 150 : Math.min(210, R.width - 40));
      var tw = 0; lines.forEach(function (l) { tw = Math.max(tw, ctx.measureText(l).width); });
      var lh = fs + 3, bw = tw + 16, bh = lines.length * lh + 9;
      var bx = Math.max(8, Math.min(R.width - bw - 8, b.p.x - bw / 2));
      var by = Math.max(tel ? 34 : 50, b.p.y - bh - 20);
      var rect = { x: bx, y: by, w: bw, h: bh };
      for (var j = 0; j < balonBox.length; j++) if (intersects(rect, balonBox[j]) || (rect.x < balonBox[j].x + balonBox[j].w && rect.x + rect.w > balonBox[j].x && rect.y < balonBox[j].y + balonBox[j].h && rect.y + rect.h > balonBox[j].y)) return;
      balonSay++;
      balonBox.push(rect);
      ctx.save(); ctx.globalAlpha = (k.sure == null || k.sure > 0.3) ? 1 : Math.max(0, k.sure / 0.3);
      ctx.fillStyle = 'rgba(255,250,232,0.97)'; ctx.strokeStyle = 'rgba(90,62,38,0.85)'; ctx.lineWidth = 2;
      rr(ctx, bx, by, bw, bh, 11); ctx.fill(); ctx.stroke();
      // Kuyruk konuşana uzanır: balon çakışma yüzünden yukarı itildiyse bile kimin konuştuğu belli olsun.
      var tx = Math.max(bx + 14, Math.min(bx + bw - 14, b.p.x)), ty = by + bh - 1;
      var uzak = b.p.y - 6 - (ty + 9) > 4;
      if (uzak) {
        ctx.strokeStyle = 'rgba(255,250,232,0.9)'; ctx.lineWidth = 2.5; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(tx, ty + 6); ctx.lineTo(b.p.x, b.p.y - 6); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255,250,232,0.97)'; ctx.beginPath(); ctx.arc(b.p.x, b.p.y - 6, 3.5, 0, TAU); ctx.fill();
      }
      ctx.beginPath(); ctx.moveTo(tx - 8, ty); ctx.lineTo(uzak ? tx : b.p.x - 4, ty + 9); ctx.lineTo(tx + 8, ty); ctx.closePath();
      ctx.fillStyle = 'rgba(255,250,232,0.97)'; ctx.fill();
      ctx.fillStyle = '#554d40'; ctx.textAlign = 'center';
      for (var l = 0; l < lines.length; l++) ctx.fillText(lines[l], bx + bw / 2, by + 5 + lh / 2 + l * lh);
      ctx.restore();
    });
    if (d.uyuyan && ayniKat(d.uyuyan)) {
      var p = project(d.uyuyan.x, d.uyuyan.y, 1.1);
      ctx.font = 'bold ' + (tel ? 13 : 15) + 'px sans-serif'; ctx.fillStyle = '#f8f3db';
      ctx.fillText('z Z', p.x + 12, p.y - Math.sin(d.zaman * 2) * 5);
    }
    if (d.oyuncu && d.oyuncu.saklandi) {
      var ps = project(d.oyuncu.x, d.oyuncu.y, 1.45);
      ctx.font = 'bold ' + (tel ? 10 : 11) + 'px "Trebuchet MS", sans-serif';
      ctx.fillStyle = 'rgba(25,38,28,0.6)'; rr(ctx, ps.x - 34, ps.y - 9, 68, 18, 8); ctx.fill();
      ctx.fillStyle = '#fff4cd'; ctx.fillText('Saklandın', ps.x, ps.y);
    }
    // Dünya koordinatlı ses halkaları.
    (d.sesler || []).forEach(function (s) {
      if (hmapKat1() && s.kat != null && s.kat !== R.kat) return;
      var p = project(s.x, s.y, 0.1), rad = (1 - s.omur / 0.6) * 38 + 8;
      ctx.strokeStyle = 'rgba(255,239,182,' + Math.max(0, s.omur / 0.8) + ')'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, rad, rad * 0.45, 0, 0, 7); ctx.stroke();
    });
    if (R.flash > 0.01) {
      ctx.fillStyle = 'rgba(255,238,190,' + (R.flash * 0.35).toFixed(3) + ')'; ctx.fillRect(0, 0, R.width, R.height);
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- dünya kurulumu
  function disposeWorld() {
    if (R.world) {
      R.scene.remove(R.world);
      var disposedGeo = new Set(), disposedMat = new Set();
      R.morBallar.forEach(function (g) {
        if (!g) return;
        g.traverse(function (o) {
          if (o.geometry && !disposedGeo.has(o.geometry)) { disposedGeo.add(o.geometry); o.geometry.dispose(); }
          var ms = Array.isArray(o.material) ? o.material : [o.material];
          ms.forEach(function (m) { if (m && !disposedMat.has(m)) { disposedMat.add(m); m.dispose(); } });
        });
      });
      R.world.traverse(function (o) {
        if (o.isInstancedMesh) o.dispose();
        if (o.geometry && o.userData.dynamicGeometry) o.geometry.dispose();
        if (o.material && o.material.map) { o.material.map.dispose(); o.material.dispose(); }
      });
    }
    R.textures.forEach(function (t) { t.dispose(); }); R.textures = [];
    R.items.clear(); R.morBallar = []; R.doors = []; R.walls = []; R.wallMesh = null; R.wallTrim = null; R.wallBase = null;
    R.scooter = null; R.scooterPx = null; R.scooterPy = null; R.dk = null; R.plan = null;
  }
  function buildWorld() {
    disposeWorld();
    var h = G.harita, temp = new T.Group();
    R.world = new T.Group(); R.scene.add(R.world); R.level = G.bolum; R.missing = [];
    R.plan = dekorPlan(h);
    // Haritanın dışında kalan çayır: kamera kenara yaklaşınca boşluk görünmez.
    var outer = new T.Mesh(new T.PlaneGeometry(h.W + 90, h.H + 90), material('#7d9a60', { roughness: 1 }));
    R.outer = outer; R.hills = []; R.katOnce = -1;
    outer.rotation.x = -PI / 2; outer.position.set(h.W / 2, -0.42, h.H / 2); outer.receiveShadow = true; R.world.add(outer);
    box(temp, h.W + 0.5, 0.7, h.H + 0.5, h.W / 2, -0.4, h.H / 2, '#617b51');
    var plane = new T.Mesh(new T.PlaneGeometry(h.W, h.H), new T.MeshStandardMaterial({ map: floorTexture(h), roughness: 1 }));
    plane.rotation.x = -PI / 2; plane.position.set(h.W / 2, 0, h.H / 2); plane.receiveShadow = true; R.world.add(plane);
    var wallList = [], cp = h.dekorCephe, x, y;
    for (y = 0; y < h.H; y++) for (x = 0; x < h.W; x++) {
      var z = h.zemin(x, y); if (h.kapiAt(x, y)) continue;
      if (cp && x >= cp.tx && x < cp.tx + cp.w && y >= cp.ty && y < cp.ty + cp.h) continue;
      if (z === 'duvar') { wallList.push({ x: x + 0.5, z: y + 0.5, h: 1.35, tx: x, ty: y }); box(temp, 1, 0.12, 1, x + 0.5, 0.06, y + 0.5, '#90775f'); }
      if (z === 'cit') {
        var horizontal = h.zemin(x + 1, y) === 'cit' || h.zemin(x - 1, y) === 'cit';
        box(temp, horizontal ? 1 : 0.09, 0.1, horizontal ? 0.09 : 1, x + 0.5, 0.34, y + 0.5, '#b79b70');
        box(temp, horizontal ? 1 : 0.09, 0.1, horizontal ? 0.09 : 1, x + 0.5, 0.65, y + 0.5, '#b79b70');
        for (var j = 0; j < 3; j++) box(temp, 0.12, 0.8, 0.12, x + (horizontal ? 0.16 + j * 0.34 : 0.5), 0.4, y + (horizontal ? 0.5 : 0.16 + j * 0.34), '#e0c899');
      }
    }
    R.walls = wallList;
    function instanced(mat) {
      if (!wallList.length) return null;
      var im = new T.InstancedMesh(geometry('box', [1, 1, 1]), material('#ffffff'), wallList.length);
      im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; R.world.add(im); return im;
    }
    R.wallMesh = instanced('#ead9b9'); R.wallTrim = instanced('#b48c63'); R.wallBase = instanced('#8e7050');
    // Duvar renkleri (instanceColor): B3/B4 binalarının dış yüzü canlı boyalı, iç duvarlar eskisi gibi.
    (function () {
      var pal4 = ['#f7dc84', '#9ad3e8', '#f5ab9c', '#aadba0'], dd = [[0, -1], [0, 1], [-1, 0], [1, 0]], PL = R.plan;
      wallList.forEach(function (w, i) {
        var ext = null, k;
        for (k = 0; k < 4; k++) { var ax = w.tx + dd[k][0], ay = w.ty + dd[k][1]; if (ax >= 0 && ay >= 0 && ax < h.W && ay < h.H && PL.dis[ay * h.W + ax]) ext = dd[k]; }
        var cM = '#ead9b9', cT = '#b48c63', cB = '#8e7050';
        if (ext && R.level === 4) { cM = pal4[Math.floor((ext[1] ? w.tx : w.ty) / 2) % 4]; cT = '#d6503c'; cB = '#6b7d92'; }
        else if (ext && R.level === 3) { cM = '#f3e2bc'; cT = '#d6845c'; cB = '#a07f5b'; }
        else if (ext && R.level === 5) { cM = '#f1dcc0'; cT = '#b4533f'; cB = '#8a6d55'; }
        else if (ext && R.level === 6) { cM = '#ffe3ee'; cT = '#e58fb0'; cB = '#a8788a'; }
        else if (R.level === 6) { cM = '#fff0dd'; cT = '#f2a9c4'; cB = '#c79a86'; }
        else if (R.level === 5 && w.ty >= 37) { cM = '#e3d4ee'; cT = '#8a62b0'; cB = '#6b5380'; }
        if (R.wallMesh) R.wallMesh.setColorAt(i, new T.Color(cM));
        if (R.wallTrim) R.wallTrim.setColorAt(i, new T.Color(cT));
        if (R.wallBase) R.wallBase.setColorAt(i, new T.Color(cB));
      });
      [R.wallMesh, R.wallTrim, R.wallBase].forEach(function (m) { if (m) m.instanceColor.needsUpdate = true; });
    })();
    // Ağaçlar, çalılar ve çiçekler (yalnız dekor; çarpışma haritası değişmez).
    for (y = 0; y < h.H; y++) for (x = 0; x < h.W; x++) {
      var zz = h.zemin(x, y), seed = hs(x, y, 31);
      if (R.level === 4 && zz === 'dis' && y >= h.H - 2 && x >= 6 && x <= 38 && (seed < 0.9 || hs(x, y, 35) < 0.7)) continue;   // okulun güney cephesi ağaç arkasında kalmasın
      if ((zz === 'dis') && seed > 0.62) temp.add(tree(x + 0.2 + hs(x, y, 32) * 0.6, y + 0.2 + hs(x, y, 33) * 0.6, 0.85 + seed * 0.8, seed, R.level === 3 && hs(x, y, 34) > 0.78));
      else if (zz === 'cim' && seed > 0.83 && !h.kati(x, y)) temp.add(flower(x + 0.5, y + 0.5, seed * 10));
      else if (zz === 'cim' && seed > 0.76 && !h.kati(x, y)) {
        var yakinCit = h.zemin(x + 1, y) === 'cit' || h.zemin(x - 1, y) === 'cit' || h.zemin(x, y + 1) === 'cit' || h.zemin(x, y - 1) === 'cit';
        var yakinDuvar = h.duvarMi(x + 1, y) || h.duvarMi(x - 1, y) || h.duvarMi(x, y + 1) || h.duvarMi(x, y - 1);
        if (yakinCit || yakinDuvar) temp.add(shrub(x + 0.5, y + 0.5, 0.5 + seed * 0.35, seed));
      }
    }
    h.esyalar.forEach(function (e) {
      if ((e.tur === 'havuz' && R.plan.havuz) || (e.tur === 'bayrak_diregi' && R.level === 4) || (e.tur === 'tavuk' && R.level === 2)) return;   // dekorKur bunları canlı çizer
      var odd = (e.yon || 0) % 2, g = model(e.tur, odd ? e.h : e.w, odd ? e.w : e.h);
      g.position.set(e.tx + e.w / 2, 0.03, e.ty + e.h / 2); g.rotation.y = -(e.yon || 0) * PI / 2; temp.add(g);
    });
    facade(temp, h); batch(temp, R.world);
    h.kapilar.forEach(function (k) {
      var hinge = new T.Group(), cross = k.yatay;
      hinge.position.set(k.tx + (cross ? 0.08 : 0.5), 0, k.ty + (cross ? 0.5 : 0.08)); hinge.rotation.y = cross ? 0 : -PI / 2;
      box(hinge, 0.84, 1.12, 0.13, 0.42, 0.56, 0, '#b98b58');
      box(hinge, 0.67, 0.76, 0.025, 0.42, 0.59, 0.08, '#d5af78');
      box(hinge, 0.54, 0.5, 0.02, 0.42, 0.44, 0.092, k.kilit === 'anahtar_mavi' ? '#9fc9ee' : k.kilit ? '#efb7a8' : '#e2cfa4');
      var lock = box(hinge, 0.18, 0.18, 0.06, 0.7, 0.59, 0.13, k.kilit === 'anahtar_mavi' ? '#458ed9' : k.kilit ? '#dc6556' : '#e5c47e');
      R.world.add(hinge); R.doors.push({ data: k, hinge: hinge, base: cross ? 0 : -PI / 2, lock: lock, angle: 0 });
    });
    if (h.scooterYeri) {
      R.scooter = scooterModel();
      R.scooter.position.set(h.scooterYeri.x / U, 0.02, h.scooterYeri.y / U);
      R.scooter.rotation.y = h.scooterYolu ? -Math.atan2(h.scooterYolu.dy, h.scooterYolu.dx) : 0;
      R.world.add(R.scooter);
    }
    // Uzaktaki tepeler: ufku doldurur, sis içinde yumuşak görünür.
    for (var hi = 0; hi < 6; hi++) {
      var ang = hi / 6 * TAU + 0.4, hr = 34 + hs(hi, 4, 7) * 16;
      var hill = new T.Mesh(geometry('sphere'), material('#7a9a62', { roughness: 1 }));
      hill.position.set(h.W / 2 + Math.cos(ang) * hr, -2.5, h.H / 2 + Math.sin(ang) * hr);
      hill.scale.set(16 + hs(hi, 5, 8) * 14, 4 + hs(hi, 6, 9) * 3, 16 + hs(hi, 7, 10) * 12);
      hill.receiveShadow = true; R.world.add(hill); R.hills.push(hill);
    }
    dekorKur(h, R.plan);
    R.dirty = false; R.ready = true; R.renderer.shadowMap.needsUpdate = true;
  }

  // ---------------------------------------------------------------- başlat
  // Grafik ayarı: düşükte gölge yok + pixelRatio 1 (antialias yalnız açılışta seçilir).
  function grafikUygula() {
    if (!R.renderer) return;
    var dusuk = !!(G.ayarlar && G.ayarlar.deger && G.ayarlar.deger.grafik === 'dusuk');
    if (R.dusuk === dusuk) return;
    R.dusuk = dusuk; if (R.ready) R.dirty = true;   // süs dekor yoğunluğu değişir
    R.renderer.setPixelRatio(dusuk ? 1 : Math.min(window.devicePixelRatio || 1, 1.6));
    if (R.sun) R.sun.castShadow = !dusuk;
    R.width = 0;   // boyutu yeniden uygula
    R.renderer.shadowMap.needsUpdate = true;
  }
  function init(canvas) {
    eski.init(canvas);
    try {
      var cv = document.createElement('canvas'); cv.id = 'dunya3d';
      canvas.parentNode.insertBefore(cv, canvas);
      var dusukGrafik = !!(G.ayarlar && G.ayarlar.deger && G.ayarlar.deger.grafik === 'dusuk');
      R.renderer = new T.WebGLRenderer({ canvas: cv, antialias: !dusukGrafik, powerPreference: 'high-performance' });
      R.renderer.setPixelRatio(dusukGrafik ? 1 : Math.min(window.devicePixelRatio || 1, 1.6));
      R.renderer.outputColorSpace = T.SRGBColorSpace;
      R.renderer.toneMapping = T.ACESFilmicToneMapping; R.renderer.toneMappingExposure = 1.12;
      R.renderer.shadowMap.enabled = true; R.renderer.shadowMap.type = T.PCFSoftShadowMap;
      R.renderer.setClearColor('#c9d9c1');
      R.scene = new T.Scene(); R.scene.background = skyTexture();
      R.scene.fog = new T.Fog('#e8eccb', 28, 76);
      R.camera = new T.OrthographicCamera(-12, 12, 7, -7, 0.1, 120);
      R.scene.add(new T.HemisphereLight('#fff3d6', '#7d9a72', 1.85));
      R.scene.add(new T.AmbientLight('#e8eeff', 0.38));
      var sun = new T.DirectionalLight('#ffe2b0', 2.4);
      sun.position.set(-10, 28, 14); sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.left = -26; sun.shadow.camera.right = 26; sun.shadow.camera.top = 26; sun.shadow.camera.bottom = -26;
      sun.shadow.camera.near = 1; sun.shadow.camera.far = 80; sun.shadow.normalBias = 0.035; sun.shadow.bias = -0.00018; sun.shadow.radius = 3; sun.shadow.blurSamples = 12;
      R.scene.add(sun); R.sun = sun; R.scene.add(sun.target);
      var fill = new T.DirectionalLight('#ffe9d2', 0.6); fill.position.set(12, 16, -18); R.scene.add(fill);
      R.actors = new T.Group(); R.scene.add(R.actors); G.ucBoyut = true; R.dirty = true;
      // Dokunmatik/telefonda temel yakınlık biraz daha yakın (ortografik yükseklik daha küçük = daha yakın).
      R.zoomVarsayilan = (G.dokunmatik || (G.tamEkran && G.tamEkran.mobil)) ? 14.5 : 17;
      R.zoom = R.wantZoom = R.zoomVarsayilan;
      grafikUygula();
      if (G.dinle) G.dinle('ayar_degisti', grafikUygula);
      G.ekranNoktasi = project;
      G.hareket3d = function (x, y) { return { x: x * Math.cos(R.yaw) + y * Math.sin(R.yaw), y: -x * Math.sin(R.yaw) + y * Math.cos(R.yaw) }; };
      G.kameraDondur = function (yon) { R.wantYaw += (yon || 1) * PI / 2; return R.wantYaw; };
      addEventListener('keydown', function (e) {
        if (e.repeat) return;
        if (e.code === 'KeyZ') R.wantYaw -= PI / 2;
        if (e.code === 'KeyX') R.wantYaw += PI / 2;
        if (e.code === 'KeyR' && e.shiftKey) { R.zoom = R.wantZoom = R.zoomVarsayilan || 17; R.wantYaw = 0.46; }
      });
      canvas.addEventListener('wheel', function (e) { e.preventDefault(); R.wantZoom = Math.max(10.5, Math.min(26, R.wantZoom + e.deltaY * 0.012)); }, { passive: false });
      cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); R.lost = true; G.mesaj('Görüntü bağlantısı kesildi. Sayfayı yenile.', 10); });
      if (G.dinle) {
        G.dinle('kaza', function () { R.shake = Math.max(R.shake, 0.85); R.flash = 0.8; });
        G.dinle('kaza_bitti', function (v) { R.shake = Math.max(R.shake, v && v.basari ? 0.18 : 0.5); });
        G.dinle('yakalandi', function () { R.shake = Math.max(R.shake, 0.9); });
        G.dinle('esya_al', function () { R.shake = Math.max(R.shake, 0.08); });
      }
    } catch (e) {
      console.error('3D başlatılamadı', e); G.ucBoyut = false;
      var failed = document.getElementById('dunya3d'); if (failed) failed.remove();
    }
  }

  // ---------------------------------------------------------------- çizim
  function draw(ctx, d) {
    if (!G.ucBoyut || R.lost) { eski.ciz(ctx, d); return; }
    if (R.dirty || R.level !== G.bolum) buildWorld();
    var dt = Math.min(0.05, Math.max(0.001, d.zaman - R.last)); R.last = d.zaman; R.frame++;
    var w = d.ekran.w, h = d.ekran.h;
    if (!w || !h) return;
    if (w !== R.width || h !== R.height) { R.width = w; R.height = h; R.renderer.setSize(w, h, false); }
    R.yaw += (R.wantYaw - R.yaw) * Math.min(1, dt * 10);
    var o = d.oyuncu, hmap = G.harita;
    var ox = o ? o.x / U : hmap.W / 2, oz = o ? o.y / U : hmap.H / 2;
    // Katlar: oyuncunun katı görünür, öbür kat kesme düzlemiyle gizlenir (arayıcı başka kattayken görünmez)
    R.kat = (hmap.katSayisi > 1 && o) ? hmap.katOf(o.y) : 0;
    if (hmap.katSayisi > 1) {
      var sy = hmap.katSinirY / U, kz0 = sy + 3;   // zemin kat çimeni 3 satır daha görünür (dünya kenarı kameraya girmesin)
      if (!R.clipP) R.clipP = new T.Plane(new T.Vector3(0, 0, -1), sy);
      R.clipP.normal.set(0, 0, R.kat ? 1 : -1); R.clipP.constant = R.kat ? -sy : kz0;
      R.renderer.clippingPlanes = [R.clipP];
      if (R.katOnce !== R.kat) {
        R.katOnce = R.kat;
        if (!R.ustArka) R.ustArka = new T.Color('#2b2438');
        R.scene.background = R.kat ? R.ustArka : skyTexture();
        R.scene.fog.color.set(R.kat ? '#2b2438' : '#e8eccb');
        if (R.outer) R.outer.visible = !R.kat;
        (R.hills || []).forEach(function (hl) { hl.visible = !R.kat; });
        R.renderer.shadowMap.needsUpdate = true;
      }
    } else if (R.renderer.clippingPlanes && R.renderer.clippingPlanes.length) { R.renderer.clippingPlanes = []; R.katOnce = -1; }
    if (!R.readyTarget || d.mod === 'menu' || Math.hypot(R.target.x - ox, R.target.z - oz) > 15) { R.target.set(ox, 0, oz); R.readyTarget = true; }
    else R.target.lerp(v3.set(ox, 0, oz), Math.min(1, dt * 7));
    // Bakış yönüne hafif önceden bakış (kamera takibi daha akıcı hissettirir).
    if (o && R.prevPX != null && !R.testCamera) {
      var mdx = (o.x - R.prevPX) / U, mdz = (o.y - R.prevPZ) / U;
      var ml = Math.hypot(mdx, mdz);
      if (ml > 0.001 && ml < 2) { R.look.x += (mdx / ml * Math.min(1.15, ml * 5) - R.look.x) * Math.min(1, dt * 4); R.look.z += (mdz / ml * Math.min(1.15, ml * 5) - R.look.z) * Math.min(1, dt * 4); }
      else R.look.multiplyScalar(1 - Math.min(1, dt * 2));
    }
    if (o) { R.prevPX = o.x; R.prevPZ = o.y; }
    var kov = (d.komsu && d.komsu.durum === 'kovalama') || (d.uyanan && d.uyanan.durum === 'kovalama') || (d.recep && d.recep.durum === 'kovalama');
    if (R.testCamera) R.zoom = R.testCamera.zoom;
    else {
      var oto = !G.ayarlar || !G.ayarlar.deger || G.ayarlar.deger.otoKamera !== false;
      if (oto && d.mod !== 'menu') {
        // Dinamik kamera: sakinken yakın plan, tehdit yaklaşınca / kovalamada geniş plan.
        var enYakin = 99, ths = [d.komsu, d.uyanan, d.kedi, d.recep];
        for (var ti = 0; ti < ths.length; ti++) {
          var th = ths[ti];
          if (!th || th.gizli || th.uyuyor || th.pasif || !o) continue;
          if (hmap.katSayisi > 1 && hmap.katOf(th.y) !== R.kat) continue;
          var dd2 = Math.hypot(th.x - o.x, th.y - o.y) / U; if (dd2 < enYakin) enYakin = dd2;
        }
        var hedefF = kov ? 1 : Math.max(0, Math.min(1, (14 - enYakin) / 6));   // 14 kare ve ötesi: yakın, 8 kare ve içi: geniş
        if (hedefF >= R.autoF) {
          R.autoF += (hedefF - R.autoF) * (1 - Math.exp(-dt / 0.13));      // genişleme hızlı ama yumuşak (~0,4 sn)
          if (hedefF > R.autoF - 0.02 || kov) R.autoBekle = 2.5;           // tehdit sürüyor: yakına dönme bekletilir
        } else {
          R.autoBekle -= dt;
          if (R.autoBekle <= 0) R.autoF += (hedefF - R.autoF) * (1 - Math.exp(-dt / 0.5));   // yakına dönüş yavaş (~1,5 sn)
        }
        var zhedef = R.wantZoom * (0.78 + 0.34 * R.autoF);
        R.zoom += (zhedef - R.zoom) * Math.min(1, dt * 9);
      } else {
        R.zoom += (R.wantZoom + (kov ? -1.4 : 0) - R.zoom) * Math.min(1, dt * 3);
      }
    }
    var tar = R.testCamera ? new T.Vector3(R.testCamera.x, 0, R.testCamera.z) : new T.Vector3(R.target.x + R.look.x, 0, R.target.z + R.look.z);
    var zoom = R.zoom;
    if (!R.testCamera) {
      var halfH = zoom / 2, halfW = zoom * w / h / 2;
      if (halfW < hmap.W / 2) tar.x = Math.max(halfW - 0.6, Math.min(hmap.W - halfW + 0.6, tar.x)); else tar.x = hmap.W / 2;
      var zLo = 0, zHi = hmap.H;
      if (hmap.katSayisi > 1) { var sz = hmap.katSinirY / U; if (R.kat) zLo = sz; else zHi = sz; }
      if (halfH < (zHi - zLo) / 2) tar.z = Math.max(zLo + halfH - 0.6, Math.min(zHi - halfH + 0.6, tar.z)); else tar.z = (zLo + zHi) / 2;
    }
    R.camera.left = -zoom * w / h / 2; R.camera.right = zoom * w / h / 2; R.camera.top = zoom / 2; R.camera.bottom = -zoom / 2; R.camera.updateProjectionMatrix();
    var sh = R.shake;
    R.camera.position.set(tar.x + Math.sin(R.yaw) * 18 + (Math.random() - 0.5) * sh, 22 + (Math.random() - 0.5) * sh * 0.4, tar.z + Math.cos(R.yaw) * 18 + (Math.random() - 0.5) * sh);
    R.camera.lookAt(tar.x, 0, tar.z); R.camera.updateMatrixWorld();
    R.shake *= Math.exp(-dt * 5.5); R.flash *= Math.exp(-dt * 4.5);
    R.sun.position.set(tar.x - 10, 28, tar.z + 14); R.sun.target.position.set(tar.x, 0, tar.z); R.sun.target.updateMatrixWorld();
    // Duvarlar: kameraya bakanlar yumuşakça alçalır; ani zıplama olmaz.
    var wi, wall, dx, dz, front, ht, hedef;
    for (wi = 0; wi < R.walls.length; wi++) {
      wall = R.walls[wi]; dx = wall.x - ox; dz = wall.z - oz;
      front = dx * Math.sin(R.yaw) + dz * Math.cos(R.yaw) > -0.2;
      hedef = front && Math.hypot(dx, dz) < 11 ? 0.36 : 1.35;
      if (wall.h == null || wall.hedef == null) { wall.h = wall.hedef = hedef; }
      if (hedef !== wall.hedef) {
        wall.bekle = (wall.bekle || 0) + dt;
        if (wall.bekle > 0.28) { wall.hedef = hedef; wall.bekle = 0; }
      } else wall.bekle = 0;
      wall.h += (wall.hedef - wall.h) * Math.min(1, dt * 4.5);
      ht = wall.h;
      if (R.wallMesh) {
        dummy.position.set(wall.x, ht / 2 + 0.1, wall.z); dummy.scale.set(1, ht, 1); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); R.wallMesh.setMatrixAt(wi, dummy.matrix);
      }
      if (R.wallTrim) {
        dummy.position.set(wall.x, ht + 0.1, wall.z); dummy.scale.set(1.03, 0.09, 1.03); dummy.updateMatrix(); R.wallTrim.setMatrixAt(wi, dummy.matrix);
      }
      if (R.wallBase) {
        dummy.position.set(wall.x, 0.19, wall.z); dummy.scale.set(1.025, 0.18, 1.025); dummy.updateMatrix(); R.wallBase.setMatrixAt(wi, dummy.matrix);
      }
    }
    if (R.wallMesh) R.wallMesh.instanceMatrix.needsUpdate = true;
    if (R.wallTrim) R.wallTrim.instanceMatrix.needsUpdate = true;
    if (R.wallBase) R.wallBase.instanceMatrix.needsUpdate = true;
    dekorGuncelle(d, dt);
    R.doors.forEach(function (v) {
      v.angle += ((v.data.acik ? -PI / 2 : 0) - v.angle) * Math.min(1, dt * 12);
      v.hinge.rotation.y = v.base + v.angle;
      v.lock.material = material(v.data.kilit === 'anahtar_mavi' ? '#458ed9' : v.data.kilit ? '#dc6556' : '#e5c47e');
    });
    Object.keys(R.rigs).forEach(function (k) { R.rigs[k].root.visible = false; R.rigs[k].shadow.visible = false; });
    if (d.oyuncu) updateRig('o', d.oyuncu, 'ogeday', d, { scale: 0.94, dt: dt });
    (d.kardesler || []).forEach(function (k, i) {
      updateRig('k' + i, k, i ? 'giray' : 'atilay', d, { scale: i ? 0.8 : 0.65, child: true, ride: k.kaza === 'suruyor', dt: dt });
    });
    if (d.komsu && !d.komsu.pasif) updateRig('n', d.komsu, d.komsu.kim, d, { scale: d.komsu.kim === 'beren' ? 1.3 : 1.12, dt: dt });
    (d.oturanlar || []).forEach(function (e, i) { updateRig('oturan'+i, e, e.kim, d, { scale: 1.08, dt: dt }); });
    if (d.superbear) updateRig('superbear', d.superbear, 'superbear', d, { scale: 1, dt: dt });
    if (d.beatrice) updateAri('beatrice', d.beatrice, d, dt);
    (d.arilar || []).forEach(function (e,i) { updateAri('ari'+i, e, d, dt, 'ari'); });
    if (d.teyze) updateRig('te', d.teyze, 'teyze', d, { scale: 1.08, dt: dt });
    if (d.eniste) updateRig('en', d.eniste, 'enistee', d, { scale: 1.12, dt: dt });
    if (d.recep) updateRig('r', d.recep, 'recepdede', d, { scale: 1.12, dt: dt });
    if (d.anneanne) updateRig('an', d.anneanne, 'anneanne', d, { scale: 1.06, dt: dt });
    if (d.abari) updateRig('ab', d.abari, 'abariebe', d, { scale: 1.06, dt: dt });
    if (d.uyanan) updateRig('u', d.uyanan, d.uyanan.kim, d, { scale: 1.12, awake: true, dt: dt });
    if (d.uyuyan) updateRig('s', d.uyuyan, d.uyuyan.kim, d, { scale: d.uyuyan.kim === 'beren' ? 1.3 : 1.02, sleep: true, dt: dt });
    if (d.gokce) updateRig('g', d.gokce, 'gokce', d, { scale: 0.96, dt: dt });
    // Bölüm 7 kalabalığı ve bölüm 8 köy canlıları: aynı rig'ler dizin bazlı havuzda kalır.
    (d.kalabalik || []).forEach(function (e, i) {
      var sc = e.olcek || (/^cocuk_/.test(e.kim) ? 0.72 : 0.96);
      updateRig('kalabalik' + i, e, e.kim, d, { scale: sc, dt: dt });
    });
    (d.koyluler || []).forEach(function (e, i) {
      var sc = e.olcek || (e.kim === 'kaplumbaga' ? 0.78 : 0.9);
      updateRig('koylu' + i, e, e.kim, d, { scale: sc, dt: dt });
    });
    // B8 mor balı, havuzlanan parlak damla kümeleriyle çizer; yenenler ve boş kuyruk saklanır.
    var ballar = d.morBallar || [];
    for (var mb = 0; mb < ballar.length; mb++) {
      if (!R.morBallar[mb]) { R.morBallar[mb] = morBalModel(); R.world.add(R.morBallar[mb]); }
      var bmesh = R.morBallar[mb], bd = ballar[mb];
      bmesh.visible = !bd.yendi;
      bmesh.position.set(bd.x / U, 0, bd.y / U);
      bmesh.scale.setScalar(bd.olcek || 0.82);
      bmesh.userData.halo.material.opacity = 0.58 + 0.2 * (0.5 + 0.5 * Math.sin(d.zaman * 4 + mb));
    }
    for (mb = ballar.length; mb < R.morBallar.length; mb++) R.morBallar[mb].visible = false;
    if (d.kedi) updateKedi('kedi', d.kedi, d, dt);
    // Toplanabilirler.
    var keep = new Set();
    (hmap.toplanabilir || []).forEach(function (it, i) {
      if (it.alindi || it.gizli) return;
      var id = it.id || ('item' + i); keep.add(id);
      var mk = R.items.get(id);
      if (!mk) { mk = collectible(it.tur, it); mk.userData.lastX = it.x; mk.userData.lastY = it.y; R.world.add(mk); R.items.set(id, mk); }
      var bob = Math.sin(d.zaman * 2.2 + i * 1.7) * 0.07;
      mk.position.set(it.x / U, 0.46 + bob, it.y / U);
      mk.rotation.y = d.zaman * 0.9;
      if (mk.userData.glow) mk.userData.glow.material.opacity = 0.38 + 0.18 * (0.5 + 0.5 * Math.sin(d.zaman * 3 + i));
      if (mk.userData.halo) { mk.userData.halo.rotation.z = d.zaman * 0.6; mk.userData.halo.material.opacity = 0.25 + 0.12 * (0.5 + 0.5 * Math.sin(d.zaman * 2.4)); }
      mk.visible = true;
    });
    R.items.forEach(function (mk, id) {
      if (!keep.has(id)) {
        if (mk.userData.lastX != null) sparkle(mk.position.x, 0.5, mk.position.z, '#ffe8a0', 7, 1.4);
        R.world.remove(mk); R.items.delete(id);
      }
    });
    // Fırlatılan eşyalar.
    var flying = new Set(d.firlatilanlar || []);
    R.thrownItems.forEach(function (mk, f) { if (!flying.has(f)) { R.scene.remove(mk); R.thrownItems.delete(f); } });
    flying.forEach(function (f) {
      var mk = R.thrownItems.get(f);
      if (!mk) { mk = collectible(f.tur); R.scene.add(mk); R.thrownItems.set(f, mk); }
      mk.position.set(f.x / U, (f.z || 0) / U + 0.25, f.y / U); mk.rotation.z = d.zaman * 8;
    });
    // Scooter: yalnız Giray sürerken hareket eder.
    if (R.scooter) {
      var sc = d.scooter && isFinite(d.scooter.x) ? d.scooter : null;
      if (sc) {
        var px = sc.x / U, pz = sc.y / U;
        R.scooter.position.set(px, 0.02, pz);
        R.scooter.rotation.y = -(sc.yon || 0);
        R.scooter.rotation.z = sc.devrik ? 1.05 : Math.sin(d.zaman * 7) * 0.025;
        if (R.scooterPx != null) R.scooterSpin += Math.hypot(px - R.scooterPx, pz - R.scooterPy) * 7;
        R.scooterPx = px; R.scooterPy = pz;
        var wheels = R.scooter.userData.wheels || [];
        for (var ww = 0; ww < wheels.length; ww++) wheels[ww].rotation.z = -R.scooterSpin;
        R.scooter.visible = true;
      } else if (hmap.scooterYeri) {
        R.scooter.position.set(hmap.scooterYeri.x / U, 0.02, hmap.scooterYeri.y / U);
        R.scooter.rotation.z = 0; R.scooter.visible = true;
      } else R.scooter.visible = false;
    }
    // EK-8: arama ipucu parıltısı, anons dalgaları, salıncak oturağı
    R.hints = R.hints || {};
    (hmap.aramaNoktalari || []).forEach(function (an) {
      var key = R.level + ':' + an.id, sp = R.hints[key], on = !!an.ipucu && !an.bakildi;
      if (!sp && on) {
        sp = new T.Sprite(new T.SpriteMaterial({ map: glowTexture(), color: '#ffe14d', transparent: true, opacity: 0.8, blending: T.AdditiveBlending, depthWrite: false }));
        sp.scale.set(1.8, 1.8, 1); R.scene.add(sp); R.hints[key] = sp; sp.userData.level = R.level;
      }
      if (sp) {
        sp.visible = on;
        if (on) {
          sp.position.set(an.x / U, 0.9 + Math.sin(d.zaman * 4) * 0.12, an.y / U);
          sp.material.opacity = 0.55 + 0.35 * Math.sin(d.zaman * 5);
          if (R.frame % 18 === 0) sparkle(an.x / U, 0.8, an.y / U, '#fff2a8', 1, 0.8);
        }
      }
    });
    // Yazısız ipucu: aday arama noktalarında zemin halkası (en çok 4 ucuz düz halka; aranmışlar gri ve küçük)
    (function () {
      var ip = (G.oyuncu && G.oyuncu.ipucuDurum && d.mod !== 'menu') ? G.oyuncu.ipucuDurum(d) : null;
      if (!R.halka) {
        R.halka = [];
        var geo = new T.RingGeometry(0.82, 1.0, 32); geo.rotateX(-PI / 2);
        for (var q = 0; q < 5; q++) {
          var m = new T.Mesh(geo, new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.8, depthWrite: false }));
          m.visible = false; m.renderOrder = 3; R.scene.add(m); R.halka.push(m);
        }
      }
      var liste = [];
      if (ip && ip.mod === 'ara') {
        ip.noktalar.forEach(function (n) { liste.push({ n: n, bos: false }); });
        ip.bosOlanlar.forEach(function (n) { liste.push({ n: n, bos: true }); });
      }
      var renk = ip && ip.renk === 'kirmizi' ? '#ff5a4a' : '#4aa3ff', t = d.zaman || 0, asama = ip ? ip.asama : 0;
      for (var hi = 0; hi < R.halka.length; hi++) {
        var m = R.halka[hi], e = liste[hi];
        if (!e) { m.visible = false; continue; }
        var n = e.n, yar = Math.max(n.w || 1, n.h || 1) / 2 + 0.3;
        var hedefMi = !e.bos && ip.hedef && ip.hedef.nokta === n && asama >= 2;
        m.visible = true;
        m.position.set(n.x / U, 0.2, n.y / U);
        if (e.bos) { m.material.color.set('#9aa0a6'); m.scale.setScalar(yar * 0.85); m.material.opacity = 0.4; continue; }
        var gen = asama >= 1 ? 0.2 : 0.08, hiz = asama >= 1 ? 4.2 : 2.6;
        var nb = 0.5 + 0.5 * Math.sin(t * hiz + hi);
        m.material.color.set(hedefMi ? '#ffe14d' : renk);
        m.scale.setScalar(yar * (1 + gen * nb) * (hedefMi ? 1.15 : 1));
        m.material.opacity = (asama >= 1 ? 0.65 : 0.45) + 0.35 * nb;
      }
    })();
    if (d.anons && d.anons.noktalar && R.frame % 20 === 0) d.anons.noktalar.forEach(function (q) { sparkle(q.x / U, 2.3, q.y / U, '#ffe14d', 2, 1.4); });
    var kz = d.kaza, sal = hmap.esyalar.filter(function (e) { return e.tur === 'salincak'; })[0];
    if (!R.swing) {
      R.swing = new T.Group();
      box(R.swing, 1.2, 0.06, 0.45, 0, -1.0, 0, '#D9A25F'); box(R.swing, 0.03, 1.0, 0.03, -0.55, -0.5, 0, '#9AA0A6'); box(R.swing, 0.03, 1.0, 0.03, 0.55, -0.5, 0, '#9AA0A6');
      R.swing.visible = false; R.scene.add(R.swing);
    }
    var swOn = !!(kz && kz.tur === 'salincak' && kz.asama === 'suruyor' && sal && d.kardesler[kz.idx]);
    R.swing.visible = swOn;
    if (swOn) { R.swing.position.set(sal.tx + sal.w / 2, 1.6, sal.ty + sal.h / 2); R.swing.rotation.x = -(d.kardesler[kz.idx].salincakAci || 0) * 0.7; }
    cone(0, d.komsu); cone(1, d.uyanan); cone(2, d.recep); cone(3, d.teyze); cone(4, d.eniste); cone(5, d.beatrice);
    // Parçacıklar.
    for (var pi = R.parts.length - 1; pi >= 0; pi--) {
      var pp = R.parts[pi]; pp.life -= dt;
      if (pp.life <= 0) { R.scene.remove(pp.sp); pp.sp.material.dispose(); R.parts.splice(pi, 1); continue; }
      pp.vy -= dt * 3.2; pp.sp.position.x += pp.vx * dt; pp.sp.position.y += pp.vy * dt; pp.sp.position.z += pp.vz * dt;
      pp.sp.material.opacity = Math.min(1, pp.life * 2.2);
    }
    // Giray düştüğünde toz bulutu.
    var kza = d.kaza && d.kaza.asama;
    if (kza === 'dustu' && R.prevKaza !== 'dustu' && d.kaza) sparkle(d.kaza.x / U, 0.25, d.kaza.y / U, '#d8c39a', 8, 1.9);
    R.prevKaza = kza;
    R.renderer.render(R.scene, R.camera);
    labels(ctx, d);
  }

  G.cizim = {
    init: init,
    yenile: function () { eski.yenile(); R.dirty = true; R.readyTarget = false; },
    ikon: eski.ikon,
    desteklenenEsyalar: eski.desteklenenEsyalar,
    ciz: draw
  };
  G.gorunum3d = {
    durum: R,
    // Test amaçlı: karakter iskeletini dışarıdan üretmeye yarar (galeri testleri).
    karakterRig: rig,
    kediRig: kediRig,
    ariRig: ariRig,
    updateAri: updateAri,   // oyun: d.beatrice -> updateAri('beatrice', ent, d, dt); işçi arılar -> updateAri('ari1', ent, d, dt, 'ari')
    modelKur: model,   // test: dünya modeli (örn. 'puset') üretir
    updateRig: updateRig,
    rapor: function () {
      return {
        aktif: !!G.ucBoyut, bolum: R.level,
        esyaModelleri: Object.keys(window.OGEDAY_MODELLER || {}).length,
        eksikModeller: R.missing,
        drawCalls: R.renderer ? R.renderer.info.render.calls : 0,
        triangles: R.renderer ? R.renderer.info.render.triangles : 0
      };
    }
  };
})();
