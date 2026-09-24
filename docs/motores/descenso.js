// @modos: gradiente, lr, optimizadores
// Motor "descenso": superficie de pérdida f(x, y) en curvas de nivel (canvas) con el recorrido de un optimizador.
(function () {
  'use strict';

  // ───────────── Utilidades de color y muestreo ─────────────
  function hexRGB(hex) {
    const h = String(hex).replace('#', '').trim();
    const n = h.length === 3 ? h.split('').map(ch => ch + ch).join('') : h;
    const v = parseInt(n, 16) || 0;
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }
  function mezclar(a, b, t) { return [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * t)); }

  function gradienteNumerico(f, x, y) {
    const h = 1e-3;
    return [(f({ x: x + h, y }) - f({ x: x - h, y })) / (2 * h), (f({ x, y: y + h }) - f({ x, y: y - h })) / (2 * h)];
  }

  function dominioPorDefecto(p) {
    if (p.rango && p.rango.length === 4) return { x0: p.rango[0], x1: p.rango[1], y0: p.rango[2], y1: p.rango[3] };
    const [x0, y0] = p.inicio;
    const r = Math.max(5, Math.abs(x0) * 1.6 + 1, Math.abs(y0) * 1.6 + 1);
    return { x0: -r, x1: r, y0: -r, y1: r };
  }
  // Misma escala en los dos ejes: la superficie no se ve deformada aunque el lienzo no sea cuadrado.
  function ejesIguales(dom, W, H) {
    const k = Math.min(W / (dom.x1 - dom.x0), H / (dom.y1 - dom.y0));
    const cx = (dom.x0 + dom.x1) / 2, cy = (dom.y0 + dom.y1) / 2;
    const hx = W / k / 2, hy = H / k / 2;
    return { x0: cx - hx, x1: cx + hx, y0: cy - hy, y1: cy + hy };
  }

  // Marching squares simplificado: para cada nivel, segmentos en coordenadas de rejilla (i, j fraccionarios).
  function contornoNivel(g, nx, ny, nivel) {
    const segmentos = [];
    const cruza = (v0, v1) => (v0 - nivel) * (v1 - nivel) < 0;
    const interp = (v0, v1) => (nivel - v0) / (v1 - v0);
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const v00 = g[j * nx + i], v10 = g[j * nx + i + 1], v01 = g[(j + 1) * nx + i], v11 = g[(j + 1) * nx + i + 1];
        if (![v00, v10, v01, v11].every(Number.isFinite)) continue;
        const pts = [];
        if (cruza(v00, v10)) pts.push([i + interp(v00, v10), j]);
        if (cruza(v10, v11)) pts.push([i + 1, j + interp(v10, v11)]);
        if (cruza(v01, v11)) pts.push([i + interp(v01, v11), j + 1]);
        if (cruza(v00, v01)) pts.push([i, j + interp(v00, v01)]);
        if (pts.length === 2) segmentos.push([pts[0], pts[1]]);
        else if (pts.length === 4) { segmentos.push([pts[0], pts[1]]); segmentos.push([pts[2], pts[3]]); }
      }
    }
    return segmentos;
  }

  // Dibuja el mapa de calor (canvas de baja resolución escalado) y las curvas de nivel sobre ctx.
  function dibujarSuperficie(ctx, c, f, dom, W, H) {
    const nx = 80, ny = Math.max(20, Math.round(nx * (H / W)));
    const g = new Float64Array(nx * ny); // g[j*nx+i]; j=0 → y0 (mínima), j=ny-1 → y1 (máxima)
    for (let j = 0; j < ny; j++) {
      const y = dom.y0 + (dom.y1 - dom.y0) * j / (ny - 1);
      for (let i = 0; i < nx; i++) {
        const x = dom.x0 + (dom.x1 - dom.x0) * i / (nx - 1);
        const v = f({ x, y });
        g[j * nx + i] = Number.isFinite(v) ? v : NaN;
      }
    }
    let mn = Infinity, mx = -Infinity;
    for (const v of g) if (Number.isFinite(v)) { if (v < mn) mn = v; if (v > mx) mx = v; }
    if (!(mx > mn)) mx = mn + 1;
    const off = document.createElement('canvas'); off.width = nx; off.height = ny;
    const octx = off.getContext('2d'), img = octx.createImageData(nx, ny);
    const bajo = hexRGB(c.fondo), alto = hexRGB(c.suave);
    for (let j = 0; j < ny; j++) {
      const fila = ny - 1 - j; // j=0 (y mínima) debe pintarse abajo del lienzo: fila de imagen invertida
      for (let i = 0; i < nx; i++) {
        const v = g[j * nx + i];
        const t = Number.isFinite(v) ? Math.min(1, Math.max(0, (v - mn) / (mx - mn))) : 0;
        const col = mezclar(bajo, alto, t), k = (fila * nx + i) * 4;
        img.data[k] = col[0]; img.data[k + 1] = col[1]; img.data[k + 2] = col[2]; img.data[k + 3] = 255;
      }
    }
    octx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, 0, 0, nx, ny, 0, 0, W, H);
    ctx.strokeStyle = c.linea; ctx.lineWidth = 1;
    const px = (i) => W * i / (nx - 1), py = (j) => H * (1 - j / (ny - 1));
    for (let n = 1; n < 7; n++) {
      const nivel = mn + (mx - mn) * n / 7;
      ctx.beginPath();
      contornoNivel(g, nx, ny, nivel).forEach(([p0, p1]) => { ctx.moveTo(px(p0[0]), py(p0[1])); ctx.lineTo(px(p1[0]), py(p1[1])); });
      ctx.stroke();
    }
  }

  function flecha(ctx, x0, y0, x1, y1, color) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    const ang = Math.atan2(y1 - y0, x1 - x0), tam = 8;
    ctx.beginPath(); ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - tam * Math.cos(ang - Math.PI / 6), y1 - tam * Math.sin(ang - Math.PI / 6));
    ctx.lineTo(x1 - tam * Math.cos(ang + Math.PI / 6), y1 - tam * Math.sin(ang + Math.PI / 6));
    ctx.closePath(); ctx.fill();
  }

  // Dos lienzos superpuestos: fondo (mapa de calor + curvas de nivel, caro, se recalcula poco) y
  // frente (punto/trayectorias, barato, se redibuja en cada arrastre o paso).
  function crearEscena(el, api, f, dom) {
    const H = api.html;
    const grafica = H('div', { class: 'motor-grafica' });
    grafica.style.position = 'relative';
    const fondoCanvas = H('canvas'); fondoCanvas.style.cssText = 'display:block;max-width:100%;';
    const frenteCanvas = H('canvas'); frenteCanvas.style.cssText = 'display:block;max-width:100%;position:absolute;left:0;top:0;touch-action:none;';
    grafica.append(fondoCanvas, frenteCanvas);
    const esc = { grafica, fondoCanvas, frenteCanvas, W: 0, Ht: 0, vista: null, X: null, Y: null };
    esc.medir = function () {
      esc.W = Math.max(280, Math.min(el.clientWidth || 520, 620));
      esc.Ht = Math.round(esc.W * 0.78);
      [fondoCanvas, frenteCanvas].forEach(cv => {
        cv.width = Math.round(esc.W * 2); cv.height = Math.round(esc.Ht * 2);
        cv.style.width = esc.W + 'px'; cv.style.height = esc.Ht + 'px';
      });
      esc.vista = ejesIguales(dom, esc.W, esc.Ht);
      esc.X = api.escala(esc.vista.x0, esc.vista.x1, 0, esc.W);
      esc.Y = api.escala(esc.vista.y0, esc.vista.y1, esc.Ht, 0);
    };
    esc.dibujarFondo = function (c) {
      const ctx = fondoCanvas.getContext('2d');
      ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.clearRect(0, 0, esc.W, esc.Ht);
      dibujarSuperficie(ctx, c, f, esc.vista, esc.W, esc.Ht);
    };
    esc.ctxFrente = function () {
      const ctx = frenteCanvas.getContext('2d');
      ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.clearRect(0, 0, esc.W, esc.Ht);
      return ctx;
    };
    return esc;
  }

  // ───────────────────────── gradiente ─────────────────────────
  function modoGradiente(el, p, api) {
    const H = api.html, num = api.num;
    const f = api.expr(p.superficie, ['x', 'y']);
    const dom = dominioPorDefecto(p);
    const punto = { x: p.inicio[0], y: p.inicio[1] };
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    const esc = crearEscena(el, api, f, dom);
    el.append(esc.grafica, lectura, controles);
    controles.append(api.boton('Reiniciar', () => { Motores.desmontar(el); Motores.montar(el, 'descenso', JSON.parse(JSON.stringify(p))); }));

    esc.frenteCanvas.tabIndex = 0;
    esc.frenteCanvas.style.cursor = 'crosshair';
    esc.frenteCanvas.setAttribute('role', 'application');
    let arrastrando = false;
    function fijar(cx, cy) {
      const r = esc.frenteCanvas.getBoundingClientRect();
      punto.x = Math.min(esc.vista.x1, Math.max(esc.vista.x0, esc.X.inversa(cx - r.left)));
      punto.y = Math.min(esc.vista.y1, Math.max(esc.vista.y0, esc.Y.inversa(cy - r.top)));
      frente();
    }
    esc.frenteCanvas.addEventListener('pointerdown', e => { arrastrando = true; esc.frenteCanvas.setPointerCapture(e.pointerId); fijar(e.clientX, e.clientY); });
    esc.frenteCanvas.addEventListener('pointermove', e => { if (arrastrando) fijar(e.clientX, e.clientY); });
    esc.frenteCanvas.addEventListener('pointerup', () => { arrastrando = false; });
    esc.frenteCanvas.addEventListener('pointercancel', () => { arrastrando = false; });
    esc.frenteCanvas.addEventListener('keydown', e => {
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
      if (!d) return;
      e.preventDefault();
      const paso = (dom.x1 - dom.x0) / 40;
      punto.x = Math.min(dom.x1, Math.max(dom.x0, punto.x + d[0] * paso));
      punto.y = Math.min(dom.y1, Math.max(dom.y0, punto.y + d[1] * paso));
      frente();
    });

    function frente() {
      const c = api.colores();
      const ctx = esc.ctxFrente();
      const [gx, gy] = gradienteNumerico(f, punto.x, punto.y);
      const mag = Math.hypot(gx, gy) || 1e-9;
      const paso = (esc.vista.x1 - esc.vista.x0) * 0.12;
      const x1d = punto.x + (gx / mag) * paso, y1d = punto.y + (gy / mag) * paso;
      flecha(ctx, esc.X(punto.x), esc.Y(punto.y), esc.X(x1d), esc.Y(y1d), c.texto);
      ctx.beginPath(); ctx.arc(esc.X(punto.x), esc.Y(punto.y), 6, 0, 2 * Math.PI);
      ctx.fillStyle = c.acento; ctx.strokeStyle = c.superficie; ctx.lineWidth = 1.5; ctx.fill(); ctx.stroke();
      esc.frenteCanvas.setAttribute('aria-label', `Punto en (${num(punto.x, 2)}, ${num(punto.y, 2)}). Arrástralo o usa las flechas del teclado.`);
      lectura.innerHTML = `<p>En (x, y) = (${num(punto.x, 3)}, ${num(punto.y, 3)}): f = ${num(f(punto), 4)} · ∇f = (${num(gx, 3)}, ${num(gy, 3)}).</p>` +
        `<p>El gradiente (la flecha) apunta hacia donde <em>f</em> crece más deprisa. Para minimizar, hay que avanzar en la dirección opuesta, −∇f.</p>`;
    }
    function dibujar() { esc.medir(); esc.dibujarFondo(api.colores()); frente(); }
    dibujar();
    return { redibujar: dibujar };
  }

  // ───────────────────────── lr (descenso paso a paso) ─────────────────────────
  function modoLR(el, p, api) {
    const H = api.html, num = api.num;
    const f = api.expr(p.superficie, ['x', 'y']);
    const dom = dominioPorDefecto(p);
    const reducido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const E = { lr: p.lr != null ? p.lr : 0.1, camino: [[p.inicio[0], p.inicio[1]]], iter: 0, estado: 'inicio' };
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    const esc = crearEscena(el, api, f, dom);
    el.append(esc.grafica, lectura, controles);

    function reiniciarCamino() { E.camino = [[p.inicio[0], p.inicio[1]]]; E.iter = 0; E.estado = 'inicio'; }
    function paso() {
      if (E.estado === 'divergido' || E.estado === 'convergido') return;
      const [x, y] = E.camino[E.camino.length - 1];
      const [gx, gy] = gradienteNumerico(f, x, y);
      const nx = x - E.lr * gx, ny = y - E.lr * gy;
      E.camino.push([nx, ny]); E.iter++;
      if (!Number.isFinite(nx) || !Number.isFinite(ny) || Math.abs(nx) > 1e4 || Math.abs(ny) > 1e4) { E.estado = 'divergido'; return; }
      if (Math.hypot(gx, gy) < 1e-4) { E.estado = 'convergido'; return; }
      if (E.camino.length > 3) {
        const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]), n1 = E.camino.length - 1;
        E.estado = d(E.camino[n1], E.camino[n1 - 1]) > d(E.camino[n1 - 1], E.camino[n1 - 2]) * 1.05 ? 'oscila' : 'avanzando';
      } else E.estado = 'avanzando';
    }

    controles.append(api.slider({ etiqueta: 'tasa de aprendizaje η', min: 0.01, max: 1.2, paso: 0.01, valor: E.lr, alCambiar: v => { E.lr = v; parar(); reiniciarCamino(); actualizar(); } }));
    let temporizador = null;
    const bPaso = api.boton('Paso →', () => { parar(); paso(); actualizar(); }, { class: 'boton boton-principal' });
    const bAuto = api.boton('Hasta el final', () => {
      if (temporizador) return parar();
      if (reducido) { for (let i = 0; i < 300 && E.estado !== 'convergido' && E.estado !== 'divergido'; i++) paso(); return actualizar(); }
      bAuto.textContent = 'Pausa';
      temporizador = setInterval(() => { if (!document.body.contains(el) || E.estado === 'convergido' || E.estado === 'divergido') return parar(); paso(); actualizar(); }, 350);
    });
    function parar() { if (temporizador) { clearInterval(temporizador); temporizador = null; } bAuto.textContent = 'Hasta el final'; }
    controles.append(bPaso, bAuto, api.boton('Reiniciar', () => { parar(); reiniciarCamino(); actualizar(); }));

    function frente(c) {
      const ctx = esc.ctxFrente();
      ctx.strokeStyle = c.texto; ctx.lineWidth = 1.6; ctx.beginPath();
      E.camino.forEach(([x, y], i) => { const px = esc.X(x), py = esc.Y(y); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); });
      ctx.stroke();
      E.camino.forEach(([x, y], i) => {
        const ultimo = i === E.camino.length - 1;
        ctx.beginPath(); ctx.arc(esc.X(x), esc.Y(y), ultimo ? 6 : 2.6, 0, 2 * Math.PI);
        ctx.fillStyle = ultimo ? c.acento : c.superficie; ctx.fill();
        if (!ultimo) { ctx.strokeStyle = c.texto; ctx.lineWidth = 1; ctx.stroke(); }
      });
      const [x, y] = E.camino[E.camino.length - 1];
      esc.frenteCanvas.setAttribute('role', 'img');
      esc.frenteCanvas.setAttribute('aria-label', `Descenso de gradiente: iteración ${E.iter}, en (${num(x, 2)}, ${num(y, 2)}).`);
      const msgs = {
        inicio: 'Punto de partida.', avanzando: 'Bajando por la superficie hacia el mínimo.',
        convergido: '<strong>Convergido</strong>: el gradiente ya es casi cero.',
        divergido: '<strong>Diverge</strong>: la tasa de aprendizaje es demasiado alta y el punto se dispara fuera de la superficie.',
        oscila: '<strong>Oscila</strong>: da saltos de un lado a otro del valle sin asentarse.',
      };
      lectura.innerHTML = `<p>Iteración ${E.iter}: (x, y) = (${num(x, 3)}, ${num(y, 3)}) · f(x, y) = ${num(f({ x, y }), 4)}.</p><p>${msgs[E.estado] || ''}</p>`;
      bPaso.disabled = E.estado === 'convergido' || E.estado === 'divergido';
      bAuto.disabled = bPaso.disabled;
    }
    function actualizar() { frente(api.colores()); }
    function dibujar() { esc.medir(); esc.dibujarFondo(api.colores()); actualizar(); }
    dibujar();
    return { redibujar: dibujar, destruir: parar };
  }

  // ───────────────────────── optimizadores ─────────────────────────
  function modoOptimizadores(el, p, api) {
    const H = api.html, num = api.num;
    const f = api.expr(p.superficie, ['x', 'y']);
    const dom = dominioPorDefecto(p);
    const lr = p.lr != null ? p.lr : 0.1;
    const nombres = p.optimizadores && p.optimizadores.length ? p.optimizadores : ['sgd', 'momentum', 'adam'];
    const reducido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function crear(nombre) { return { nombre, camino: [[p.inicio[0], p.inicio[1]]], v: [0, 0], m: [0, 0], vv: [0, 0], t: 0, terminado: false }; }
    let opts = nombres.map(crear);

    function pasoOptimizador(o) {
      if (o.terminado) return;
      const [x, y] = o.camino[o.camino.length - 1];
      const [gx, gy] = gradienteNumerico(f, x, y);
      let nx, ny;
      if (o.nombre === 'momentum') {
        const beta = 0.9; o.v = [beta * o.v[0] + gx, beta * o.v[1] + gy];
        nx = x - lr * o.v[0]; ny = y - lr * o.v[1];
      } else if (o.nombre === 'adam') {
        const b1 = 0.9, b2 = 0.999, eps = 1e-8; o.t++;
        o.m = [b1 * o.m[0] + (1 - b1) * gx, b1 * o.m[1] + (1 - b1) * gy];
        o.vv = [b2 * o.vv[0] + (1 - b2) * gx * gx, b2 * o.vv[1] + (1 - b2) * gy * gy];
        const mh0 = o.m[0] / (1 - Math.pow(b1, o.t)), mh1 = o.m[1] / (1 - Math.pow(b1, o.t));
        const vh0 = o.vv[0] / (1 - Math.pow(b2, o.t)), vh1 = o.vv[1] / (1 - Math.pow(b2, o.t));
        nx = x - lr * mh0 / (Math.sqrt(vh0) + eps); ny = y - lr * mh1 / (Math.sqrt(vh1) + eps);
      } else { nx = x - lr * gx; ny = y - lr * gy; }
      o.camino.push([nx, ny]);
      if (!Number.isFinite(nx) || !Number.isFinite(ny) || Math.abs(nx) > 1e4 || Math.abs(ny) > 1e4) o.terminado = true;
      else if (Math.hypot(gx, gy) < 1e-4) o.terminado = true;
    }

    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const leyenda = H('div', { class: 'motor-leyenda' });
    const controles = H('div', { class: 'motor-controles' });
    const esc = crearEscena(el, api, f, dom);
    el.append(esc.grafica, leyenda, lectura, controles);

    let temporizador = null;
    const bPaso = api.boton('Paso →', () => { parar(); opts.forEach(pasoOptimizador); actualizar(); }, { class: 'boton boton-principal' });
    const bAuto = api.boton('Hasta el final', () => {
      if (temporizador) return parar();
      if (reducido) { for (let i = 0; i < 300 && opts.some(o => !o.terminado); i++) opts.forEach(pasoOptimizador); return actualizar(); }
      bAuto.textContent = 'Pausa';
      temporizador = setInterval(() => { if (!document.body.contains(el) || opts.every(o => o.terminado)) return parar(); opts.forEach(pasoOptimizador); actualizar(); }, 350);
    });
    function parar() { if (temporizador) { clearInterval(temporizador); temporizador = null; } bAuto.textContent = 'Hasta el final'; }
    controles.append(bPaso, bAuto, api.boton('Reiniciar', () => { parar(); opts = nombres.map(crear); actualizar(); }));

    function frente(c) {
      const ctx = esc.ctxFrente();
      opts.forEach((o, i) => {
        const color = c.series[i % 8];
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
        o.camino.forEach(([x, y], k) => { const px = esc.X(x), py = esc.Y(y); if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); });
        ctx.stroke();
        const [lx, ly] = o.camino[o.camino.length - 1];
        ctx.beginPath(); ctx.arc(esc.X(lx), esc.Y(ly), 5, 0, 2 * Math.PI); ctx.fillStyle = color; ctx.fill();
      });
      esc.frenteCanvas.setAttribute('role', 'img');
      esc.frenteCanvas.setAttribute('aria-label', 'Trayectorias de varios optimizadores sobre la misma superficie de pérdida.');
      leyenda.innerHTML = '';
      opts.forEach((o, i) => leyenda.append(H('span', { class: 'leyenda-item' }, H('span', { class: 'leyenda-muestra', style: `--c:${c.series[i % 8]}` }), o.nombre)));
      const lineas = opts.map(o => { const [x, y] = o.camino[o.camino.length - 1]; return `${o.nombre}: ${o.camino.length - 1} pasos, f = ${num(f({ x, y }), 4)}${o.terminado ? ' (parado)' : ''}`; });
      lectura.innerHTML = `<p>${lineas.join(' · ')}</p><p>Con la misma tasa de aprendizaje (η = ${num(lr, 3)}) y el mismo punto de partida, cada optimizador sigue un camino distinto: SGD sigue el gradiente tal cual, momentum acumula velocidad y Adam adapta el paso a cada dirección.</p>`;
      bPaso.disabled = opts.every(o => o.terminado);
      bAuto.disabled = bPaso.disabled;
    }
    function actualizar() { frente(api.colores()); }
    function dibujar() { esc.medir(); esc.dibujarFondo(api.colores()); actualizar(); }
    dibujar();
    return { redibujar: dibujar, destruir: parar };
  }

  Motores.registrar('descenso', function (el, p, api) {
    const modo = p.modo;
    if (modo === 'gradiente') return modoGradiente(el, p, api);
    if (modo === 'lr') return modoLR(el, p, api);
    if (modo === 'optimizadores') return modoOptimizadores(el, p, api);
    throw new Error('Modo desconocido: ' + modo);
  }, {
    ejemplos: {
      gradiente: { modo: 'gradiente', superficie: 'x^2 + 3*y^2', inicio: [2, 1] },
      lr: { modo: 'lr', superficie: 'x^2 + 3*y^2', inicio: [-3, 2], lr: 0.1 },
      optimizadores: { modo: 'optimizadores', superficie: 'x^2 + 3*y^2', inicio: [-3, 2], lr: 0.15, optimizadores: ['sgd', 'momentum', 'adam'] },
    },
  });
})();
