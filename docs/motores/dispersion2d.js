// @modos: kmeans, correlacion, ols, polinomio, ridge-lasso, metricas-regresion, escalado, pca, logistica, knn, svm, arbol, bosque, boosting, comparar-clustering, jerarquico, dbscan, gmm, silueta
// Motor "dispersion2d": nube de puntos 2D sobre la que corre un algoritmo de ML.
// Infraestructura común: generadores con semilla, ejes con la misma escala en x e y, asas arrastrables
// (ratón, táctil y teclado), deslizadores a partir de "controles" y botones de paso a paso.
// Cada modo es un objeto {controles, iniciar, fondo, colorPunto, frente, paso, lectura, leyenda, botones, panel,
// alCambiarDatos, alCambiarControl}. Los modos que no estén en este archivo se cargan de
// motores/dispersion2d-<modo>.js, que debe llamar a Dispersion2d.modo('<modo>', {...}).
(function () {
  'use strict';
  const MODOS = {};
  const BASE = document.currentScript ? document.currentScript.src.replace(/dispersion2d\.js(\?.*)?$/, '') : 'motores/';

  // ───────────── Ayudas numéricas compartidas por los modos de regresión/estadística ─────────────
  function mediaDe(v) { return v.reduce((a, b) => a + b, 0) / v.length; }
  function regresionSimple(xs, ys) {
    const n = xs.length, mx = mediaDe(xs), my = mediaDe(ys);
    let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < n; i++) { const dx = xs[i] - mx, dy = ys[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
    const b1 = sxx ? sxy / sxx : 0, b0 = my - b1 * mx;
    const r = (sxx && syy) ? sxy / Math.sqrt(sxx * syy) : 0;
    return { b0, b1, r, mx, my, sxx, syy, sxy, n };
  }
  function estadisticos(v) {
    const n = v.length, media = mediaDe(v);
    const sd = Math.sqrt(v.reduce((a, b) => a + (b - media) ** 2, 0) / n);
    const s = v.slice().sort((a, b) => a - b);
    const pct = (q) => { const i = (s.length - 1) * q, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); };
    return { media, sd, min: s[0], max: s[n - 1], mediana: pct(0.5), q1: pct(0.25), q3: pct(0.75) };
  }
  // Resuelve A·w = b (A cuadrada) por eliminación de Gauss con pivoteo parcial.
  function resolver(A, b) {
    const n = A.length, M = A.map((f, i) => f.concat([b[i]]));
    for (let c = 0; c < n; c++) {
      let piv = c;
      for (let f = c + 1; f < n; f++) if (Math.abs(M[f][c]) > Math.abs(M[piv][c])) piv = f;
      [M[c], M[piv]] = [M[piv], M[c]];
      const d = Math.abs(M[c][c]) > 1e-12 ? M[c][c] : 1e-12;
      for (let k = c; k <= n; k++) M[c][k] /= d;
      for (let f = 0; f < n; f++) {
        if (f === c) continue;
        const factor = M[f][c];
        for (let k = c; k <= n; k++) M[f][k] -= factor * M[c][k];
      }
    }
    return M.map(f => f[n]);
  }

  // Rejilla coloreada por clase: aproxima una región de decisión evaluando `evaluar(x, y)` en el
  // centro de cada celda (usada por knn, bosque y boosting). `evaluar` puede devolver null para no pintar.
  function grilla(ctx, g, filas, columnas, evaluar) {
    const { x0, x1, y0, y1 } = ctx.vista;
    const anchoC = (x1 - x0) / columnas, altoF = (y1 - y0) / filas;
    for (let i = 0; i < filas; i++) {
      for (let j = 0; j < columnas; j++) {
        const cx = x0 + (j + 0.5) * anchoC, cy = y0 + (i + 0.5) * altoF;
        const k = evaluar(cx, cy);
        if (k === null || k === undefined) continue;
        const xA = ctx.X(cx - anchoC / 2), xB = ctx.X(cx + anchoC / 2);
        const yA = ctx.Y(cy - altoF / 2), yB = ctx.Y(cy + altoF / 2);
        ctx.api.el('rect', { x: Math.min(xA, xB), y: Math.min(yA, yB), width: Math.abs(xB - xA), height: Math.abs(yB - yA), fill: ctx.colorClase(k), 'fill-opacity': 0.14 }, g);
      }
    }
  }

  // Árbol de decisión sencillo por particiones de eje (impureza de Gini, admite muestras con peso),
  // usado por arbol, bosque (bagging) y boosting (tocones ponderados, profundidad 1).
  function giniDe(conteo, total) { let g = 1; for (const c in conteo) g -= (conteo[c] / total) ** 2; return g; }
  function construirArbol(P, profundidad, pesos) {
    const W = pesos || P.map(() => 1);
    function nodo(idx, prof) {
      const conteo = {};
      let total = 0;
      idx.forEach(i => { conteo[P[i].c] = (conteo[P[i].c] || 0) + W[i]; total += W[i]; });
      let clase = 0, mejor = -1;
      for (const c in conteo) if (conteo[c] > mejor) { mejor = conteo[c]; clase = +c; }
      const hoja = { hoja: true, clase, n: idx.length };
      if (prof >= profundidad || idx.length < 2 || Object.keys(conteo).length < 2) return hoja;
      let mejorGan = 0, mejorEje = null, mejorUmbral = null;
      const giniTotal = giniDe(conteo, total);
      ['x', 'y'].forEach(eje => {
        const vals = [...new Set(idx.map(i => P[i][eje]))].sort((a, b) => a - b);
        for (let k = 0; k < vals.length - 1; k++) {
          const umbral = (vals[k] + vals[k + 1]) / 2, iz = [], de = [];
          idx.forEach(i => (P[i][eje] <= umbral ? iz : de).push(i));
          if (!iz.length || !de.length) continue;
          const cIz = {}, cDe = {};
          let tIz = 0, tDe = 0;
          iz.forEach(i => { cIz[P[i].c] = (cIz[P[i].c] || 0) + W[i]; tIz += W[i]; });
          de.forEach(i => { cDe[P[i].c] = (cDe[P[i].c] || 0) + W[i]; tDe += W[i]; });
          const ganancia = giniTotal - (tIz * giniDe(cIz, tIz) + tDe * giniDe(cDe, tDe)) / total;
          if (ganancia > mejorGan) { mejorGan = ganancia; mejorEje = eje; mejorUmbral = umbral; }
        }
      });
      if (!mejorEje || mejorGan < 1e-9) return hoja;
      const iz = [], de = [];
      idx.forEach(i => (P[i][mejorEje] <= mejorUmbral ? iz : de).push(i));
      return { hoja: false, eje: mejorEje, umbral: mejorUmbral, izq: nodo(iz, prof + 1), der: nodo(de, prof + 1), n: idx.length };
    }
    return nodo(P.map((_, i) => i), 0);
  }
  function evaluarArbol(nodo, x, y) {
    while (!nodo.hoja) nodo = (nodo.eje === 'x' ? x : y) <= nodo.umbral ? nodo.izq : nodo.der;
    return nodo.clase;
  }
  function regionesArbol(nodo, caja) {
    if (nodo.hoja) return [Object.assign({ clase: nodo.clase }, caja)];
    if (nodo.eje === 'x') return regionesArbol(nodo.izq, Object.assign({}, caja, { x1: nodo.umbral })).concat(regionesArbol(nodo.der, Object.assign({}, caja, { x0: nodo.umbral })));
    return regionesArbol(nodo.izq, Object.assign({}, caja, { y1: nodo.umbral })).concat(regionesArbol(nodo.der, Object.assign({}, caja, { y0: nodo.umbral })));
  }

  window.Dispersion2d = {
    modo: (nombre, def) => { MODOS[nombre] = def; }, MODOS, generar, mediaDe, regresionSimple, estadisticos, resolver,
    grilla, construirArbol, evaluarArbol, regionesArbol,
  };

  // ───────────── Generadores de datos (reproducibles) ─────────────
  function generar(d, api) {
    if (Array.isArray(d.puntos)) return d.puntos.map(q => ({ x: +q[0], y: +q[1], c: q.length > 2 ? +q[2] : 0 }));
    const r = api.aleatorio(d.semilla === undefined ? 7 : d.semilla);
    const n = d.n || 120, ruido = d.ruido === undefined ? 0.2 : d.ruido, k = Math.max(1, d.clases || 2);
    const N = (s) => r.normal(0, s), out = [];
    const gen = d.generador || 'blobs';
    if (gen === 'blobs') {
      const giro = r() * 2 * Math.PI;
      const centros = Array.from({ length: k }, (_, i) => (k === 1 ? [0, 0] : [Math.cos(giro + 2 * Math.PI * i / k), Math.sin(giro + 2 * Math.PI * i / k)]));
      for (let i = 0; i < n; i++) { const c = i % k; out.push({ x: centros[c][0] + N(ruido), y: centros[c][1] + N(ruido), c }); }
    } else if (gen === 'lunas') {
      for (let i = 0; i < n; i++) {
        const c = i % 2, t = r() * Math.PI;
        const x = c ? 1 - Math.cos(t) : Math.cos(t), y = c ? 0.5 - Math.sin(t) : Math.sin(t);
        out.push({ x: x - 0.5 + N(ruido), y: y - 0.25 + N(ruido), c });
      }
    } else if (gen === 'circulos') {
      for (let i = 0; i < n; i++) { const c = i % 2, t = r() * 2 * Math.PI, rad = c ? 0.5 : 1; out.push({ x: rad * Math.cos(t) + N(ruido), y: rad * Math.sin(t) + N(ruido), c }); }
    } else if (gen === 'lineal') {
      for (let i = 0; i < n; i++) { const c = k > 1 ? i % 2 : 0, x = -1.5 + 3 * r(); out.push({ x, y: 0.7 * x + 0.2 + (k > 1 ? (c ? 0.45 : -0.45) : 0) + N(ruido), c }); }
    } else if (gen === 'xor') {
      for (let i = 0; i < n; i++) { const x = -1 + 2 * r(), y = -1 + 2 * r(); out.push({ x: x + N(ruido / 2), y: y + N(ruido / 2), c: x * y > 0 ? 1 : 0 }); }
    } else if (gen === 'curva') {
      for (let i = 0; i < n; i++) { const x = -1.5 + 3 * r(); out.push({ x, y: Math.sin(1.5 * x) + N(ruido), c: 0 }); }
    } else throw new Error(`Generador desconocido "${gen}"`);
    return out;
  }

  // Recorte de un polígono convexo por el semiplano a·x + b·y ≤ c (Sutherland-Hodgman)
  function recortar(poli, a, b, c) {
    const out = [], dentro = (q) => a * q[0] + b * q[1] <= c + 1e-12;
    for (let i = 0; i < poli.length; i++) {
      const P = poli[i], Q = poli[(i + 1) % poli.length], dp = dentro(P), dq = dentro(Q);
      if (dp) out.push(P);
      if (dp !== dq) {
        const fp = a * P[0] + b * P[1] - c, fq = a * Q[0] + b * Q[1] - c, t = fp / (fp - fq);
        out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]);
      }
    }
    return out;
  }
  // Celda de Voronoi del centro j dentro del rectángulo visible
  function celda(centros, j, v) {
    let poli = [[v.x0, v.y0], [v.x1, v.y0], [v.x1, v.y1], [v.x0, v.y1]];
    const [xj, yj] = centros[j];
    centros.forEach(([xi, yi], i) => {
      if (i === j || poli.length < 3) return;
      poli = recortar(poli, 2 * (xi - xj), 2 * (yi - yj), xi * xi + yi * yi - xj * xj - yj * yj);
    });
    return poli;
  }

  // ───────────── Núcleo común a todos los modos ─────────────
  function montarModo(el, p, api, def) {
    const H = api.html, num = api.num;
    const original = JSON.parse(JSON.stringify(p));
    const reducido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = { api, p, num, H, datos: generar(p.dataset, api), K: {}, estado: {}, version: 0, celda };
    const listaControles = p.controles && p.controles.length ? p.controles : (def.controles || []);
    listaControles.forEach(q => { ctx.K[q.nombre] = q.valor; });

    // Dominio fijo (no salta al arrastrar puntos)
    const xs = ctx.datos.map(d => d.x), ys = ctx.datos.map(d => d.y);
    const ext = (v) => { const a = Math.min(...v), b = Math.max(...v), m = (b - a || 1) * 0.1; return [a - m, b + m]; };
    const [dx0, dx1] = ext(xs), [dy0, dy1] = ext(ys);
    ctx.dom = def.dominio ? def.dominio(ctx) : { x0: dx0, x1: dx1, y0: dy0, y1: dy1 };

    const grafica = H('div', { class: 'motor-grafica' });
    const leyenda = H('div', { class: 'motor-leyenda' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    const panel = H('div', { class: 'disp-panel' });
    el.append(grafica, leyenda, lectura, controles, panel);

    listaControles.forEach(q => controles.append(api.slider({
      etiqueta: q.etiqueta || q.nombre, min: q.min, max: q.max, paso: q.paso, valor: q.valor,
      alCambiar: v => { ctx.K[q.nombre] = v; parar(); if (def.alCambiarControl) def.alCambiarControl(ctx, q.nombre); dibujar(); },
    })));
    if (def.botones) controles.append(...def.botones(ctx));
    let bPaso = null, bAuto = null, temporizador = null;
    function parar() { if (temporizador) { clearInterval(temporizador); temporizador = null; } if (bAuto) bAuto.textContent = 'Hasta el final'; }
    if (p.paso_a_paso && def.paso) {
      bPaso = api.boton('Paso →', () => { parar(); def.paso(ctx); dibujar(); }, { class: 'boton boton-principal' });
      bAuto = api.boton('Hasta el final', () => {
        if (temporizador) return parar();
        if (reducido) { for (let i = 0; i < 200 && !ctx.estado.terminado; i++) def.paso(ctx); return dibujar(); }
        bAuto.textContent = 'Pausa';
        temporizador = setInterval(() => { if (ctx.estado.terminado || !document.body.contains(el)) return parar(); def.paso(ctx); dibujar(); }, 450);
      });
      controles.append(bPaso, bAuto);
    }
    controles.append(api.boton('Reiniciar', () => { parar(); Motores.desmontar(el); Motores.montar(el, 'dispersion2d', JSON.parse(JSON.stringify(original))); }));

    // Asas arrastrables: puntero (eventos en el contenedor, que sobrevive al redibujado) y teclado (flechas)
    let arrastre = null, foco = null;
    ctx.asa = function (elemento, clave, etiqueta, mover) {
      elemento.setAttribute('tabindex', '0');
      elemento.setAttribute('role', 'button');
      elemento.setAttribute('aria-label', etiqueta + ' (arrastra o usa las flechas)');
      elemento.dataset.asa = clave;
      elemento.style.cursor = 'grab';
      elemento.addEventListener('pointerdown', (e) => { e.stopPropagation(); arrastre = mover; grafica.setPointerCapture(e.pointerId); });
      elemento.addEventListener('keydown', (e) => {
        const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
        if (!d) return;
        e.preventDefault();
        const x = ctx.X.inversa(+elemento.dataset.px), y = ctx.Y.inversa(+elemento.dataset.py), paso = (ctx.vista.x1 - ctx.vista.x0) / 40;
        foco = clave;
        mover(x + d[0] * paso, y + d[1] * paso);
        cambio();
      });
    };
    grafica.addEventListener('pointermove', (e) => {
      if (!arrastre || !grafica.hasPointerCapture(e.pointerId)) return;
      const s = grafica.querySelector('svg'), r = s.getBoundingClientRect(), f = s.viewBox.baseVal.width / r.width;
      const x = Math.min(ctx.vista.x1, Math.max(ctx.vista.x0, ctx.X.inversa((e.clientX - r.left) * f)));
      const y = Math.min(ctx.vista.y1, Math.max(ctx.vista.y0, ctx.Y.inversa((e.clientY - r.top) * f)));
      arrastre(x, y);
      cambio();
    });
    const soltar = () => { arrastre = null; };
    grafica.addEventListener('pointerup', soltar);
    grafica.addEventListener('pointercancel', soltar);
    function cambio() { parar(); ctx.version++; if (def.alCambiarDatos) def.alCambiarDatos(ctx); dibujar(); }
    ctx.cambio = cambio;
    ctx.redibujar = () => dibujar();

    ctx.colorClase = (k) => ctx.c.series[((k % 8) + 8) % 8];
    ctx.pt = (x, y) => [ctx.X(x), ctx.Y(y)];

    function dibujar() {
      const c = api.colores();
      ctx.c = c;
      const W = Math.max(300, Math.min(el.clientWidth || 640, 900));
      const alto = Math.round(Math.max(250, Math.min(W * 0.62, 430)));
      const caja = { l: 36, r: W - 10, t: 10, b: alto - 24 };
      // Misma escala en los dos ejes: las distancias se ven como son
      const { x0, x1, y0, y1 } = ctx.dom, k = Math.min((caja.r - caja.l) / (x1 - x0), (caja.b - caja.t) / (y1 - y0));
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, hx = (caja.r - caja.l) / k / 2, hy = (caja.b - caja.t) / k / 2;
      ctx.vista = { x0: cx - hx, x1: cx + hx, y0: cy - hy, y1: cy + hy };
      ctx.X = api.escala(cx - hx, cx + hx, caja.l, caja.r);
      ctx.Y = api.escala(cy - hy, cy + hy, caja.b, caja.t);
      ctx.caja = caja;
      grafica.innerHTML = ''; leyenda.innerHTML = '';
      const s = api.svg(W, alto);
      s.setAttribute('role', 'group');
      s.style.touchAction = 'pan-y';
      grafica.append(s);
      const g = api.el('g', { 'font-size': 11, fill: c.suave }, s);
      api.marcas(ctx.vista.x0, ctx.vista.x1, Math.max(3, Math.floor(W / 90))).forEach(v => {
        api.el('line', { x1: ctx.X(v), x2: ctx.X(v), y1: caja.t, y2: caja.b, stroke: c.rejilla }, g);
        api.el('text', { x: ctx.X(v), y: caja.b + 15, 'text-anchor': 'middle', text: num(v, 2) }, g);
      });
      api.marcas(ctx.vista.y0, ctx.vista.y1, Math.max(3, Math.floor(alto / 70))).forEach(v => {
        api.el('line', { x1: caja.l, x2: caja.r, y1: ctx.Y(v), y2: ctx.Y(v), stroke: c.rejilla }, g);
        api.el('text', { x: caja.l - 4, y: ctx.Y(v) + 4, 'text-anchor': 'end', text: num(v, 2) }, g);
      });
      api.el('rect', { x: caja.l, y: caja.t, width: caja.r - caja.l, height: caja.b - caja.t, fill: 'none', stroke: c.linea }, g);
      const id = 'clip-d2-' + Math.random().toString(36).slice(2);
      api.el('rect', { x: caja.l, y: caja.t, width: caja.r - caja.l, height: caja.b - caja.t }, api.el('clipPath', { id }, api.el('defs', {}, s)));
      const capa = api.el('g', { 'clip-path': `url(#${id})` }, s);

      if (def.fondo) def.fondo(ctx, capa);
      const gp = api.el('g', {}, capa);
      ctx.datos.forEach((d, i) => {
        const color = def.colorPunto ? def.colorPunto(ctx, i) : ctx.colorClase(d.c);
        const pc = api.el('circle', { cx: ctx.X(d.x), cy: ctx.Y(d.y), r: 4.5, fill: color, stroke: c.superficie, 'stroke-width': 1, class: 'disp-punto', 'data-px': ctx.X(d.x), 'data-py': ctx.Y(d.y) }, gp);
        if (p.arrastrables) ctx.asa(pc, 'p' + i, `Punto ${i + 1}`, (x, y) => { d.x = x; d.y = y; });
      });
      if (def.frente) def.frente(ctx, s);

      if (def.leyenda) def.leyenda(ctx).forEach(([t, color]) => leyenda.append(H('span', { class: 'leyenda-item' }, H('span', { class: 'leyenda-muestra', style: `--c:${color}` }), t)));
      lectura.innerHTML = (def.lectura ? def.lectura(ctx) : []).map(t => `<p>${t}</p>`).join('');
      s.setAttribute('aria-label', 'Nube de puntos. ' + lectura.textContent);
      if (bPaso) bPaso.disabled = !!ctx.estado.terminado;
      if (bAuto) bAuto.disabled = !!ctx.estado.terminado;
      if (def.panel) { panel.innerHTML = ''; def.panel(ctx, panel); }
      if (foco) { const f = s.querySelector(`[data-asa="${foco}"]`); foco = null; if (f) f.focus(); }
    }

    if (def.iniciar) def.iniciar(ctx);
    dibujar();
    return { redibujar: dibujar, destruir: parar };
  }

  // ───────────── Modo kmeans ─────────────
  const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
  function kmInicio(P, k, metodo, r) {
    if (metodo === 'k-means++') {
      const C = [P[Math.floor(r() * P.length)]];
      while (C.length < k) {
        const D = P.map(q => Math.min(...C.map(c => d2(q, c)))), tot = D.reduce((a, b) => a + b, 0);
        let u = r() * tot, i = 0;
        while (i < P.length - 1 && u > D[i]) { u -= D[i]; i++; }
        C.push(P[i]);
      }
      return C.map(c => c.slice());
    }
    const idx = P.map((_, i) => i);
    for (let i = 0; i < k; i++) { const j = i + Math.floor(r() * (idx.length - i)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    return idx.slice(0, k).map(i => P[i].slice());
  }
  function kmAsignar(P, C, antes) {
    let J = 0, cambios = 0;
    const asig = P.map((q, i) => {
      let mj = 0, md = Infinity;
      C.forEach((c, j) => { const d = d2(q, c); if (d < md) { md = d; mj = j; } });
      J += md;
      if (!antes || antes[i] !== mj) cambios++;
      return mj;
    });
    return { asig, J, cambios };
  }
  function kmMover(P, asig, C) {
    return C.map((c, j) => {
      let sx = 0, sy = 0, n = 0;
      P.forEach((q, i) => { if (asig[i] === j) { sx += q[0]; sy += q[1]; n++; } });
      return n ? [sx / n, sy / n] : c.slice();
    });
  }
  const kmJ = (P, asig, C) => P.reduce((a, q, i) => a + d2(q, C[asig[i]]), 0);
  function kmCompleto(P, k, r) {
    let C = kmInicio(P, k, 'k-means++', r), a = kmAsignar(P, C, null);
    for (let it = 0; it < 100; it++) { C = kmMover(P, a.asig, C); const b = kmAsignar(P, C, a.asig); a = b; if (!b.cambios) break; }
    return kmJ(P, a.asig, C);
  }

  function kmReiniciar(ctx) {
    const E = ctx.estado, P = ctx.datos.map(d => [d.x, d.y]);
    E.cent = kmInicio(P, Math.round(ctx.K.k), E.metodo, ctx.api.aleatorio(1000 + E.semilla));
    const a = kmAsignar(P, E.cent, null);
    Object.assign(E, { asig: a.asig, J: a.J, cambios: a.cambios, iter: 0, fase: 'mover', ultimo: 'inicio', terminado: false, rastro: E.cent.map(c => [c.slice()]) });
  }

  MODOS.kmeans = {
    controles: [{ nombre: 'k', min: 1, max: 8, paso: 1, valor: 3, etiqueta: 'número de clústeres k' }],
    iniciar(ctx) {
      Object.assign(ctx.estado, { metodo: 'aleatoria', semilla: 1 });
      if (ctx.K.k === undefined) ctx.K.k = 3;
      kmReiniciar(ctx);
    },
    alCambiarControl(ctx) { kmReiniciar(ctx); },
    alCambiarDatos(ctx) {
      const E = ctx.estado, P = ctx.datos.map(d => [d.x, d.y]), a = kmAsignar(P, E.cent, E.asig);
      Object.assign(E, { asig: a.asig, J: a.J, cambios: a.cambios, fase: 'mover', ultimo: 'arrastre', terminado: false });
    },
    botones(ctx) {
      const H = ctx.H, E = ctx.estado;
      if (E.metodo === undefined) E.metodo = 'aleatoria';
      if (E.semilla === undefined) E.semilla = 1;
      const grupo = H('div', { class: 'motor-selector', role: 'group', 'aria-label': 'Inicialización de los centroides' });
      const marcar = () => grupo.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m !== undefined && b.dataset.m === E.metodo)));
      ['aleatoria', 'k-means++'].forEach(m => {
        const b = ctx.api.boton('Inicio: ' + m, () => { E.metodo = m; marcar(); kmReiniciar(ctx); ctx.redibujar(); });
        b.dataset.m = m;
        grupo.append(b);
      });
      grupo.append(ctx.api.boton('Otro inicio al azar', () => { E.semilla++; kmReiniciar(ctx); ctx.redibujar(); }));
      marcar();
      return [grupo];
    },
    paso(ctx) {
      const E = ctx.estado, P = ctx.datos.map(d => [d.x, d.y]);
      if (E.terminado) return;
      if (E.fase === 'mover') {
        E.cent = kmMover(P, E.asig, E.cent);
        E.cent.forEach((c, j) => E.rastro[j].push(c.slice()));
        E.J = kmJ(P, E.asig, E.cent);
        E.iter++;
        Object.assign(E, { fase: 'asignar', ultimo: 'mover' });
      } else {
        const a = kmAsignar(P, E.cent, E.asig);
        Object.assign(E, { asig: a.asig, J: a.J, cambios: a.cambios, fase: 'mover', ultimo: 'asignar', terminado: a.cambios === 0 });
      }
    },
    fondo(ctx, g) {
      const E = ctx.estado;
      E.cent.forEach((c, j) => {
        const poli = celda(E.cent, j, ctx.vista);
        if (poli.length > 2) ctx.api.el('polygon', { points: poli.map(q => ctx.pt(q[0], q[1]).map(v => v.toFixed(1)).join(',')).join(' '), fill: ctx.colorClase(j), 'fill-opacity': 0.09, stroke: ctx.colorClase(j), 'stroke-opacity': 0.35, 'stroke-dasharray': '4 4' }, g);
      });
      if (E.ultimo === 'asignar' || E.ultimo === 'inicio') {
        ctx.datos.forEach((d, i) => {
          const [a, b] = ctx.pt(d.x, d.y), [u, v] = ctx.pt(...E.cent[E.asig[i]]);
          ctx.api.el('line', { x1: a, y1: b, x2: u, y2: v, stroke: ctx.colorClase(E.asig[i]), 'stroke-opacity': 0.22 }, g);
        });
      }
    },
    colorPunto(ctx, i) { return ctx.colorClase(ctx.estado.asig[i]); },
    frente(ctx, s) {
      const E = ctx.estado, api = ctx.api, c = ctx.c;
      E.rastro.forEach((r, j) => {
        if (r.length > 1) api.el('polyline', { points: r.map(q => ctx.pt(q[0], q[1]).join(',')).join(' '), fill: 'none', stroke: c.texto, 'stroke-width': 1.5, 'stroke-dasharray': '3 3', 'stroke-opacity': 0.7 }, s);
      });
      E.cent.forEach((q, j) => {
        const [x, y] = ctx.pt(q[0], q[1]);
        const g = api.el('g', { class: 'disp-centroide', 'data-px': x, 'data-py': y }, s);
        api.el('circle', { cx: x, cy: y, r: 16, fill: 'transparent' }, g);
        api.el('path', { d: `M${x - 9},${y} L${x},${y - 9} L${x + 9},${y} L${x},${y + 9}Z`, fill: ctx.colorClase(j), stroke: c.texto, 'stroke-width': 2 }, g);
        ctx.asa(g, 'c' + j, `Centroide ${j + 1}`, (nx, ny) => { E.cent[j] = [nx, ny]; E.rastro[j] = [[nx, ny]]; });
      });
    },
    leyenda(ctx) { return [['◆ centroide (arrástralo)', ctx.c.texto], ['recorrido de los centroides', ctx.c.suave]]; },
    lectura(ctx) {
      const E = ctx.estado, num = ctx.num, k = E.cent.length;
      const tam = E.cent.map((_, j) => E.asig.filter(a => a === j).length);
      const l = [];
      if (E.terminado) l.push(`<strong>Convergido</strong> tras ${E.iter} iteraciones: ningún punto cambia de clúster.`);
      else if (E.ultimo === 'inicio') l.push(`Inicio ${E.metodo}: ${k} centroides colocados y cada punto asignado al más cercano. Siguiente paso: <strong>mover</strong> cada centroide a la media de sus puntos.`);
      else if (E.ultimo === 'arrastre') l.push('Has movido un centroide o un punto: los puntos se reasignan al centroide más cercano. Siguiente paso: <strong>mover</strong> centroides.');
      else if (E.ultimo === 'mover') l.push(`Iteración ${E.iter}: cada centroide saltó a la media de sus puntos. Siguiente paso: <strong>asignar</strong> puntos.`);
      else l.push(`Iteración ${E.iter}: ${E.cambios} ${E.cambios === 1 ? 'punto cambia' : 'puntos cambian'} de clúster. Siguiente paso: <strong>mover</strong> centroides.`);
      l.push(`J (suma de distancias al cuadrado a su centroide) = <strong>${num(E.J, 3)}</strong> · puntos por clúster: ${tam.join(' · ')}`);
      return l;
    },
    panel(ctx, cont) {
      const E = ctx.estado, api = ctx.api, c = ctx.c, num = ctx.num;
      const kmax = Math.min(10, (ctx.p.controles || []).reduce((m, q) => (q.nombre === 'k' ? q.max : m), 8));
      if (!E.codo || E.codo.version !== ctx.version || E.codo.kmax !== kmax) {
        const P = ctx.datos.map(d => [d.x, d.y]), js = [];
        for (let kk = 1; kk <= kmax; kk++) {
          let mejor = Infinity;
          for (let t = 0; t < 5; t++) mejor = Math.min(mejor, kmCompleto(P, kk, api.aleatorio(77 + 31 * kk + t)));
          js.push(mejor);
        }
        E.codo = { version: ctx.version, kmax, js };
      }
      const js = E.codo.js, W = Math.max(280, Math.min(cont.clientWidth || 600, 600)), alto = 170;
      const m = { l: 44, r: 12, t: 12, b: 30 };
      const X = api.escala(1, kmax, m.l, W - m.r), Y = api.escala(0, Math.max(js[0], E.J) * 1.05, alto - m.b, m.t);
      const s = api.svg(W, alto);
      s.setAttribute('role', 'img');
      const g = api.el('g', { 'font-size': 11, fill: c.suave }, s);
      api.marcas(0, Math.max(js[0], E.J), 4).forEach(v => {
        api.el('line', { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), stroke: c.rejilla }, g);
        api.el('text', { x: m.l - 4, y: Y(v) + 4, 'text-anchor': 'end', text: num(v, 1) }, g);
      });
      for (let kk = 1; kk <= kmax; kk++) api.el('text', { x: X(kk), y: alto - 12, 'text-anchor': 'middle', text: kk }, g);
      api.el('text', { x: W - m.r, y: alto - 1, 'text-anchor': 'end', text: 'k →' }, g);
      api.el('polyline', { points: js.map((v, i) => X(i + 1).toFixed(1) + ',' + Y(v).toFixed(1)).join(' '), fill: 'none', stroke: c.acento, 'stroke-width': 2 }, s);
      const kAct = E.cent.length;
      js.forEach((v, i) => api.el('circle', { cx: X(i + 1), cy: Y(v), r: i + 1 === kAct ? 6 : 3.5, fill: i + 1 === kAct ? c.acento : c.superficie, stroke: c.acento, 'stroke-width': 2 }, s));
      if (kAct <= kmax) api.el('path', { d: `M${X(kAct) - 6},${Y(E.J)} L${X(kAct)},${Y(E.J) - 6} L${X(kAct) + 6},${Y(E.J)} L${X(kAct)},${Y(E.J) + 6}Z`, fill: c.series[1], stroke: c.superficie }, s);
      s.setAttribute('aria-label', 'Método del codo: J mínima para cada k. ' + js.map((v, i) => `k=${i + 1}: ${num(v, 1)}`).join('; '));
      cont.append(H2(api, 'Método del codo: J tras converger (mejor de 5 inicios k-means++) para cada k'), s,
        api.html('div', { class: 'motor-leyenda' },
          api.html('span', { class: 'leyenda-item' }, api.html('span', { class: 'leyenda-muestra', style: `--c:${c.acento}` }), 'J mínima encontrada'),
          api.html('span', { class: 'leyenda-item' }, api.html('span', { class: 'leyenda-muestra', style: `--c:${c.series[1]}` }), `◆ J de tu ejecución ahora (k = ${kAct})`)));
      cont.className = 'disp-panel disp-codo';
    },
  };
  const H2 = (api, t) => api.html('h3', { text: t });

  // ───────────── Registro ─────────────
  Motores.registrar('dispersion2d', function (el, p, api) {
    if (MODOS[p.modo]) return montarModo(el, p, api, MODOS[p.modo]);
    // Modo en archivo aparte: se carga y se monta cuando llegue
    let inst = null;
    const s = document.createElement('script');
    s.src = BASE + 'dispersion2d-' + encodeURIComponent(p.modo) + '.js';
    const fallo = (e) => { console.error('[motor dispersion2d]', e); el.innerHTML = ''; el.append(api.html('p', { class: 'motor-error', role: 'alert', text: 'El interactivo no se pudo cargar.' })); };
    s.onload = () => { try { if (!MODOS[p.modo]) throw new Error(`Modo "${p.modo}" no registrado`); inst = montarModo(el, p, api, MODOS[p.modo]); } catch (e) { fallo(e); } };
    s.onerror = () => fallo(new Error(`No se pudo cargar dispersion2d-${p.modo}.js`));
    document.head.appendChild(s);
    return { redibujar: () => inst && inst.redibujar(), destruir: () => inst && inst.destruir() };
  }, {
    ejemplos: {
      kmeans: { modo: 'kmeans', dataset: { generador: 'blobs', n: 150, ruido: 0.28, clases: 4, semilla: 5 }, controles: [{ nombre: 'k', min: 1, max: 8, paso: 1, valor: 4 }], paso_a_paso: true },
      correlacion: { modo: 'correlacion', dataset: { generador: 'lineal', n: 25, ruido: 0.5, clases: 1, semilla: 8 }, arrastrables: true },
      ols: { modo: 'ols', dataset: { generador: 'lineal', n: 16, ruido: 0.35, clases: 1, semilla: 9 }, arrastrables: true },
      polinomio: { modo: 'polinomio', dataset: { generador: 'curva', n: 14, ruido: 0.25, semilla: 3 }, controles: [{ nombre: 'grado', min: 1, max: 9, paso: 1, valor: 2 }], arrastrables: true },
      'ridge-lasso': { modo: 'ridge-lasso', dataset: { generador: 'curva', n: 40, ruido: 0.35, semilla: 4 }, controles: [{ nombre: 'lambda', min: 0, max: 3, paso: 0.05, valor: 0 }], arrastrables: true },
      'metricas-regresion': { modo: 'metricas-regresion', dataset: { generador: 'lineal', n: 16, ruido: 0.3, clases: 1, semilla: 9 }, arrastrables: true },
      escalado: { modo: 'escalado', dataset: { generador: 'blobs', n: 30, ruido: 0.25, clases: 1, semilla: 6 }, arrastrables: true },
      pca: { modo: 'pca', dataset: { generador: 'lineal', n: 60, ruido: 0.3, clases: 1, semilla: 2 }, arrastrables: true },
      logistica: { modo: 'logistica', dataset: { generador: 'blobs', n: 60, ruido: 0.35, clases: 2, semilla: 11 }, controles: [{ nombre: 'eta', min: 0.05, max: 2, paso: 0.05, valor: 0.5 }], paso_a_paso: true },
      knn: { modo: 'knn', dataset: { generador: 'blobs', n: 70, ruido: 0.3, clases: 2, semilla: 6 }, controles: [{ nombre: 'k', min: 1, max: 15, paso: 1, valor: 5, etiqueta: 'k vecinos más cercanos' }], arrastrables: true },
      svm: { modo: 'svm', dataset: { generador: 'blobs', n: 50, ruido: 0.3, clases: 2, semilla: 3 }, controles: [{ nombre: 'C', min: 0.1, max: 10, paso: 0.1, valor: 1, etiqueta: 'C (rigidez frente al margen)' }], paso_a_paso: true },
      arbol: { modo: 'arbol', dataset: { generador: 'blobs', n: 70, ruido: 0.3, clases: 3, semilla: 4 }, controles: [{ nombre: 'profundidad', min: 1, max: 5, paso: 1, valor: 2, etiqueta: 'profundidad máxima' }], arrastrables: true },
      bosque: { modo: 'bosque', dataset: { generador: 'lunas', n: 80, ruido: 0.22, semilla: 2 }, controles: [{ nombre: 'n_arboles', min: 1, max: 20, paso: 1, valor: 7, etiqueta: 'número de árboles' }] },
      boosting: { modo: 'boosting', dataset: { generador: 'xor', n: 70, ruido: 0.15, semilla: 5 }, paso_a_paso: true },
      'comparar-clustering': { modo: 'comparar-clustering', dataset: { generador: 'lunas', n: 70, ruido: 0.12, semilla: 1 }, controles: [{ nombre: 'k', min: 2, max: 6, paso: 1, valor: 2, etiqueta: 'k (k-means y jerárquico)' }] },
      jerarquico: { modo: 'jerarquico', dataset: { generador: 'blobs', n: 30, ruido: 0.28, clases: 3, semilla: 8 }, controles: [{ nombre: 'k', min: 1, max: 10, paso: 1, valor: 3, etiqueta: 'clústeres objetivo' }], arrastrables: true, paso_a_paso: true },
      dbscan: { modo: 'dbscan', dataset: { generador: 'lunas', n: 90, ruido: 0.12, semilla: 9 }, controles: [{ nombre: 'eps', min: 0.05, max: 1.2, paso: 0.05, valor: 0.3, etiqueta: 'ε (radio de vecindad)' }, { nombre: 'minPts', min: 1, max: 10, paso: 1, valor: 4, etiqueta: 'mínimo de vecinos' }], arrastrables: true },
      gmm: { modo: 'gmm', dataset: { generador: 'blobs', n: 90, ruido: 0.3, clases: 3, semilla: 7 }, controles: [{ nombre: 'k', min: 1, max: 6, paso: 1, valor: 3, etiqueta: 'número de componentes' }], paso_a_paso: true },
      silueta: { modo: 'silueta', dataset: { generador: 'blobs', n: 90, ruido: 0.3, clases: 4, semilla: 10 }, controles: [{ nombre: 'k', min: 2, max: 8, paso: 1, valor: 4, etiqueta: 'número de clústeres k' }] },
    },
  });
})();
