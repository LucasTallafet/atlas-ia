// @modos: operaciones, similitud, base, etiquetas
// Motor "vectores2d": plano con vectores o puntos arrastrables y cálculos en vivo.
(function () {
  'use strict';

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function bbox(puntos, incluirOrigen) {
    const xs = puntos.map(p => p[0]), ys = puntos.map(p => p[1]);
    if (incluirOrigen) { xs.push(0); ys.push(0); }
    let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    if (x1 - x0 < 1e-6) { x0 -= 1; x1 += 1; }
    if (y1 - y0 < 1e-6) { y0 -= 1; y1 += 1; }
    const mx = (x1 - x0) * 0.22, my = (y1 - y0) * 0.22;
    return { x0: x0 - mx, x1: x1 + mx, y0: y0 - my, y1: y1 + my };
  }

  Motores.registrar('vectores2d', function (el, p, api) {
    const H = api.html, num = api.num;
    const modo = p.modo;

    const NOMBRES = ['u', 'v', 'w', 't'];
    const vecs = (p.vectores || []).map((v, i) => ({ nombre: v.nombre || NOMBRES[i] || ('v' + i), xy: (v.xy || [0, 0]).slice() }));
    const puntos = (p.puntos || []).map(q => ({ etiqueta: q.etiqueta, xy: (q.xy || [0, 0]).slice() }));
    const analogias = p.analogias || [];
    const porEtiqueta = (t) => puntos.find(q => q.etiqueta === t);

    if ((modo === 'operaciones' || modo === 'similitud') && vecs.length < 2) throw new Error('El modo ' + modo + ' necesita 2 vectores');
    if (modo === 'base' && vecs.length < 2) throw new Error('El modo base necesita al menos 2 vectores (base + opcionalmente un objetivo)');
    if (modo === 'etiquetas' && !puntos.length) throw new Error('El modo etiquetas necesita "puntos"');

    const MOSTRAR_DEF = { operaciones: ['suma', 'resta', 'escalar'], similitud: ['coseno', 'producto', 'euclidea', 'manhattan', 'proyeccion'] };
    const mostrar = p.mostrar && p.mostrar.length ? p.mostrar.slice() : (MOSTRAR_DEF[modo] || []);

    // ───── Dominio fijo: no se recalcula al arrastrar, para que los ejes no salten ─────
    let dom;
    if (modo === 'etiquetas') {
      dom = bbox(puntos.map(q => q.xy), false);
    } else if (modo === 'base') {
      dom = bbox(vecs.map(v => v.xy), true);
    } else {
      const u = vecs[0].xy, v = vecs[1].xy;
      const extra = [[u[0] + v[0], u[1] + v[1]], [u[0] - v[0], u[1] - v[1]], [2 * u[0], 2 * u[1]], [-2 * u[0], -2 * u[1]], [2 * v[0], 2 * v[1]], [-2 * v[0], -2 * v[1]]];
      dom = bbox([u, v].concat(extra), true);
    }

    // ───── Estado propio ─────
    const E = { k: 2, activo: mostrar[0] || null };

    // ───── DOM ─────
    const controles = H('div', { class: 'motor-controles' });
    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const leyenda = H('div', { class: 'motor-leyenda' });
    el.append(grafica, leyenda, lectura, controles);

    const NOMBRE_OP = { suma: 'u + v', resta: 'u − v', escalar: 'k·u', producto: 'producto escalar', coseno: 'coseno', euclidea: 'distancia euclídea', manhattan: 'distancia manhattan', proyeccion: 'proyección' };
    if ((modo === 'operaciones' || modo === 'similitud') && mostrar.length > 1) {
      const grupo = H('div', { class: 'motor-selector', role: 'group', 'aria-label': 'Elegir relación' });
      mostrar.forEach(m => {
        const b = api.boton(NOMBRE_OP[m] || m, () => { E.activo = m; marcar(); dibujar(); });
        b.dataset.m = m;
        grupo.append(b);
      });
      const marcar = () => grupo.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === E.activo)));
      marcar();
      controles.append(grupo);
    }
    if (mostrar.includes('escalar')) {
      controles.append(api.slider({ etiqueta: 'k', min: -2, max: 2, paso: 0.1, valor: E.k, alCambiar: v => { E.k = v; dibujar(); } }));
    }
    controles.append(api.boton('Reiniciar', reiniciar));
    function reiniciar() { Motores.desmontar(el); Motores.montar(el, 'vectores2d', JSON.parse(JSON.stringify(p))); }

    // ───── Plano y arrastre (los eventos van al contenedor, que sobrevive a cada redibujado) ─────
    let L = null;
    let arrastre = null;
    grafica.addEventListener('pointermove', (e) => {
      if (!arrastre) return;
      const s = grafica.querySelector('svg');
      if (!s) return;
      const r = s.getBoundingClientRect(), f = s.viewBox.baseVal.width / r.width;
      arrastre(L.X.inversa((e.clientX - r.left) * f), L.Y.inversa((e.clientY - r.top) * f));
    });
    const soltar = () => { arrastre = null; };
    grafica.addEventListener('pointerup', soltar);
    grafica.addEventListener('pointercancel', soltar);

    function plano(s, c, caja) {
      const k = Math.min((caja.r - caja.l) / (dom.x1 - dom.x0), (caja.b - caja.t) / (dom.y1 - dom.y0));
      const cx = (caja.l + caja.r) / 2, cy = (caja.t + caja.b) / 2, mx = (dom.x0 + dom.x1) / 2, my = (dom.y0 + dom.y1) / 2;
      const X = (v) => cx + (v - mx) * k; X.inversa = (px) => mx + (px - cx) / k;
      const Y = (v) => cy - (v - my) * k; Y.inversa = (py) => my - (py - cy) / k;
      const g = api.el('g', {}, s);
      const gg = api.el('g', { stroke: c.rejilla }, g);
      api.marcas(dom.x0, dom.x1, 7).forEach(v => api.el('line', { x1: X(v), x2: X(v), y1: caja.t, y2: caja.b }, gg));
      api.marcas(dom.y0, dom.y1, 6).forEach(v => api.el('line', { x1: caja.l, x2: caja.r, y1: Y(v), y2: Y(v) }, gg));
      if (dom.y0 < 0 && dom.y1 > 0) api.el('line', { x1: caja.l, x2: caja.r, y1: Y(0), y2: Y(0), stroke: c.suave, 'stroke-width': 1.2 }, g);
      if (dom.x0 < 0 && dom.x1 > 0) api.el('line', { x1: X(0), x2: X(0), y1: caja.t, y2: caja.b, stroke: c.suave, 'stroke-width': 1.2 }, g);
      api.el('rect', { x: caja.l, y: caja.t, width: caja.r - caja.l, height: caja.b - caja.t, fill: 'none', stroke: c.linea }, g);
      return { X, Y, g, pt: (x, y) => [X(x), Y(y)] };
    }

    function puntaFlecha(g, p0, p1, color) {
      const ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]), largo = 10, anch = 5.5;
      const bx = p1[0] - largo * Math.cos(ang), by = p1[1] - largo * Math.sin(ang);
      const l = [bx - anch * Math.sin(ang), by + anch * Math.cos(ang)], r = [bx + anch * Math.sin(ang), by - anch * Math.cos(ang)];
      api.el('polygon', { points: `${p1[0]},${p1[1]} ${l[0]},${l[1]} ${r[0]},${r[1]}`, fill: color }, g);
    }
    function flecha(g, p0, p1, color, disc) {
      api.el('line', { x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1], stroke: color, 'stroke-width': 2.4, 'stroke-dasharray': disc ? '6 4' : null }, g);
      if (!disc) puntaFlecha(g, p0, p1, color);
    }
    function etiquetaTxt(g, p, texto, color, c) {
      api.el('text', { x: p[0] + 6, y: p[1] - 6, fill: color, 'font-size': 13, 'font-weight': 700, 'paint-order': 'stroke', stroke: c.superficie, 'stroke-width': 3, text: texto }, g);
    }
    function arcoAngulo(L2, a0, a1, radio) {
      let diff = a1 - a0;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      const n = 16;
      let d = '';
      for (let i = 0; i <= n; i++) {
        const t = a0 + diff * i / n, pt = L2.pt(radio * Math.cos(t), radio * Math.sin(t));
        d += (i ? 'L' : 'M') + pt[0].toFixed(1) + ',' + pt[1].toFixed(1);
      }
      return d;
    }
    function asa(g, x, y, color, texto, mover) {
      const pt = L.pt(x, y);
      const c1 = api.el('circle', { cx: pt[0], cy: pt[1], r: 10, fill: color, stroke: api.colores().superficie, 'stroke-width': 1.6, tabindex: 0, role: 'button', 'aria-label': texto + ' (arrastra o usa las flechas)' }, g);
      c1.style.cursor = 'grab';
      c1.addEventListener('pointerdown', (e) => { e.stopPropagation(); arrastre = mover; grafica.setPointerCapture(e.pointerId); });
      c1.addEventListener('keydown', (e) => {
        const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
        if (!d) return;
        e.preventDefault();
        const paso = (dom.x1 - dom.x0) / 40;
        mover(x + d[0] * paso, y + d[1] * paso);
      });
      return c1;
    }

    // ───── Modo operaciones / similitud: dos vectores u, v desde el origen ─────
    function dibujarPar(c, L2, col, ley, pon) {
      const u = vecs[0].xy, v = vecs[1].xy;
      const normU = Math.hypot(u[0], u[1]), normV = Math.hypot(v[0], v[1]);
      const dot = u[0] * v[0] + u[1] * v[1];
      const cos = normU && normV ? dot / (normU * normV) : NaN;
      const eucl = Math.hypot(u[0] - v[0], u[1] - v[1]);
      const manh = Math.abs(u[0] - v[0]) + Math.abs(u[1] - v[1]);
      const proyEsc = normV ? dot / normV : NaN;
      const proyVec = normV ? [dot / (normV * normV) * v[0], dot / (normV * normV) * v[1]] : [0, 0];
      const act = E.activo;

      if (act === 'suma') {
        const su = [u[0] + v[0], u[1] + v[1]];
        flecha(L2.g, L2.pt(u[0], u[1]), L2.pt(su[0], su[1]), col(1), true);
        flecha(L2.g, L2.pt(0, 0), L2.pt(su[0], su[1]), col(2));
        etiquetaTxt(L2.g, L2.pt(su[0], su[1]), vecs[0].nombre + '+' + vecs[1].nombre, col(2), c);
      }
      if (act === 'resta') {
        const re = [u[0] - v[0], u[1] - v[1]];
        flecha(L2.g, L2.pt(v[0], v[1]), L2.pt(u[0], u[1]), col(2), true);
        flecha(L2.g, L2.pt(0, 0), L2.pt(re[0], re[1]), col(2));
        etiquetaTxt(L2.g, L2.pt(re[0], re[1]), vecs[0].nombre + '−' + vecs[1].nombre, col(2), c);
      }
      if (act === 'escalar') {
        const e2 = [E.k * u[0], E.k * u[1]];
        flecha(L2.g, L2.pt(0, 0), L2.pt(e2[0], e2[1]), col(2));
        etiquetaTxt(L2.g, L2.pt(e2[0], e2[1]), num(E.k, 1) + '·' + vecs[0].nombre, col(2), c);
      }
      if (act === 'coseno' || act === 'producto') {
        const radio = Math.max(0.3, Math.min(normU, normV) * 0.32);
        api.el('path', { d: arcoAngulo(L2, Math.atan2(u[1], u[0]), Math.atan2(v[1], v[0]), radio), fill: 'none', stroke: c.suave, 'stroke-width': 1.6 }, L2.g);
      }
      if (act === 'proyeccion') {
        flecha(L2.g, L2.pt(0, 0), L2.pt(proyVec[0], proyVec[1]), col(2));
        flecha(L2.g, L2.pt(u[0], u[1]), L2.pt(proyVec[0], proyVec[1]), c.suave, true);
        etiquetaTxt(L2.g, L2.pt(proyVec[0], proyVec[1]), 'proy', col(2), c);
      }
      if (act === 'euclidea' || act === 'manhattan') flecha(L2.g, L2.pt(u[0], u[1]), L2.pt(v[0], v[1]), c.mal, true);

      flecha(L2.g, L2.pt(0, 0), L2.pt(u[0], u[1]), col(0));
      etiquetaTxt(L2.g, L2.pt(u[0], u[1]), vecs[0].nombre, col(0), c);
      flecha(L2.g, L2.pt(0, 0), L2.pt(v[0], v[1]), col(1));
      etiquetaTxt(L2.g, L2.pt(v[0], v[1]), vecs[1].nombre, col(1), c);
      ley([[vecs[0].nombre, col(0)], [vecs[1].nombre, col(1)]]);
      asa(L2.g, u[0], u[1], col(0), vecs[0].nombre, (x, y) => { u[0] = clamp(x, dom.x0, dom.x1); u[1] = clamp(y, dom.y0, dom.y1); dibujar(); });
      asa(L2.g, v[0], v[1], col(1), vecs[1].nombre, (x, y) => { v[0] = clamp(x, dom.x0, dom.x1); v[1] = clamp(y, dom.y0, dom.y1); dibujar(); });

      pon(`${vecs[0].nombre} = (${num(u[0], 2)}, ${num(u[1], 2)}) · |${vecs[0].nombre}| = ${num(normU, 3)}`);
      pon(`${vecs[1].nombre} = (${num(v[0], 2)}, ${num(v[1], 2)}) · |${vecs[1].nombre}| = ${num(normV, 3)}`);
      if (mostrar.includes('suma')) pon(`${vecs[0].nombre} + ${vecs[1].nombre} = (${num(u[0] + v[0], 2)}, ${num(u[1] + v[1], 2)})`);
      if (mostrar.includes('resta')) pon(`${vecs[0].nombre} − ${vecs[1].nombre} = (${num(u[0] - v[0], 2)}, ${num(u[1] - v[1], 2)})`);
      if (mostrar.includes('escalar')) pon(`${num(E.k, 1)}·${vecs[0].nombre} = (${num(E.k * u[0], 2)}, ${num(E.k * u[1], 2)})`);
      if (mostrar.includes('producto')) pon(`${vecs[0].nombre} · ${vecs[1].nombre} (producto escalar) = <strong>${num(dot, 3)}</strong>`);
      if (mostrar.includes('coseno')) pon(`coseno del ángulo = <strong>${num(cos, 3)}</strong> (ángulo ≈ ${num(Math.acos(clamp(cos, -1, 1)) * 180 / Math.PI, 1)}°)`);
      if (mostrar.includes('euclidea')) pon(`distancia euclídea = <strong>${num(eucl, 3)}</strong>`);
      if (mostrar.includes('manhattan')) pon(`distancia manhattan = <strong>${num(manh, 3)}</strong>`);
      if (mostrar.includes('proyeccion')) pon(`proyección escalar de ${vecs[0].nombre} sobre ${vecs[1].nombre} = <strong>${num(proyEsc, 3)}</strong>`);
    }

    // ───── Modo base: descomposición v = a·b1 + b·b2 ─────
    function dibujarBase(c, L2, col, ley, pon) {
      const b1 = vecs[0].xy, b2 = vecs[1].xy, obj = vecs[2] ? vecs[2].xy : null;
      const det = b1[0] * b2[1] - b2[0] * b1[1];
      if (obj && Math.abs(det) > 1e-6) {
        const a = (obj[0] * b2[1] - obj[1] * b2[0]) / det, b = (b1[0] * obj[1] - b1[1] * obj[0]) / det;
        const p1 = [a * b1[0], a * b1[1]];
        flecha(L2.g, L2.pt(0, 0), L2.pt(p1[0], p1[1]), col(0), true);
        flecha(L2.g, L2.pt(p1[0], p1[1]), L2.pt(obj[0], obj[1]), col(1), true);
        pon(`${vecs[2].nombre} = ${num(a, 3)}·${vecs[0].nombre} + ${num(b, 3)}·${vecs[1].nombre}`);
        pon(`Determinante de la base = ${num(det, 3)} (el área que estira el paralelogramo unidad).`);
      }
      flecha(L2.g, L2.pt(0, 0), L2.pt(b1[0], b1[1]), col(0));
      etiquetaTxt(L2.g, L2.pt(b1[0], b1[1]), vecs[0].nombre, col(0), c);
      flecha(L2.g, L2.pt(0, 0), L2.pt(b2[0], b2[1]), col(1));
      etiquetaTxt(L2.g, L2.pt(b2[0], b2[1]), vecs[1].nombre, col(1), c);
      ley([[vecs[0].nombre, col(0)], [vecs[1].nombre, col(1)]].concat(obj ? [[vecs[2].nombre, col(2)]] : []));
      asa(L2.g, b1[0], b1[1], col(0), vecs[0].nombre, (x, y) => { b1[0] = clamp(x, dom.x0, dom.x1); b1[1] = clamp(y, dom.y0, dom.y1); dibujar(); });
      asa(L2.g, b2[0], b2[1], col(1), vecs[1].nombre, (x, y) => { b2[0] = clamp(x, dom.x0, dom.x1); b2[1] = clamp(y, dom.y0, dom.y1); dibujar(); });
      pon(`${vecs[0].nombre} = (${num(b1[0], 2)}, ${num(b1[1], 2)}) · ${vecs[1].nombre} = (${num(b2[0], 2)}, ${num(b2[1], 2)})`);
      if (!obj) { pon(Math.abs(det) < 1e-6 ? 'Estos dos vectores son paralelos: no forman una base del plano.' : `Determinante = ${num(det, 3)}: los dos vectores forman una base (no son paralelos).`); return; }
      flecha(L2.g, L2.pt(0, 0), L2.pt(obj[0], obj[1]), col(2));
      etiquetaTxt(L2.g, L2.pt(obj[0], obj[1]), vecs[2].nombre, col(2), c);
      asa(L2.g, obj[0], obj[1], col(2), vecs[2].nombre, (x, y) => { obj[0] = clamp(x, dom.x0, dom.x1); obj[1] = clamp(y, dom.y0, dom.y1); dibujar(); });
      if (Math.abs(det) < 1e-6) pon(`${vecs[0].nombre} y ${vecs[1].nombre} son paralelos: no forman una base y ${vecs[2].nombre} no se puede descomponer.`);
    }

    // ───── Modo etiquetas: puntos con nombre y analogías vectoriales ─────
    function dibujarEtiquetas(c, L2, col, ley, pon) {
      analogias.forEach((tup, i) => {
        const [na, nb, nc, nd] = tup;
        const A = porEtiqueta(na), B = porEtiqueta(nb), Cc = porEtiqueta(nc), D = porEtiqueta(nd);
        if (!A || !B || !Cc || !D) return;
        const color = col(2 + i);
        flecha(L2.g, L2.pt(B.xy[0], B.xy[1]), L2.pt(A.xy[0], A.xy[1]), color);
        flecha(L2.g, L2.pt(Cc.xy[0], Cc.xy[1]), L2.pt(D.xy[0], D.xy[1]), color, true);
        const pred = [Cc.xy[0] + (A.xy[0] - B.xy[0]), Cc.xy[1] + (A.xy[1] - B.xy[1])];
        const pp = L2.pt(pred[0], pred[1]);
        api.el('circle', { cx: pp[0], cy: pp[1], r: 6, fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-dasharray': '3 3' }, L2.g);
        const dist = Math.hypot(pred[0] - D.xy[0], pred[1] - D.xy[1]);
        ley([[`${nb} → ${na}`, color], [`${nc} → ${nd} (predicho)`, color, true]]);
        pon(`${na} − ${nb} + ${nc} ≈ (${num(pred[0], 2)}, ${num(pred[1], 2)}) → el más próximo debería ser <strong>${nd}</strong> (a ${num(dist, 3)} de distancia)`);
      });
      puntos.forEach((q, i) => {
        etiquetaTxt(L2.g, L2.pt(q.xy[0], q.xy[1]), q.etiqueta, col(i % 8), c);
        asa(L2.g, q.xy[0], q.xy[1], col(i % 8), q.etiqueta, (x, y) => { q.xy[0] = clamp(x, dom.x0, dom.x1); q.xy[1] = clamp(y, dom.y0, dom.y1); dibujar(); });
      });
      pon(analogias.length ? 'Arrastra cualquier punto (por ejemplo, la respuesta de la analogía) para ver cómo cambia la predicción.' : 'Arrastra los puntos para explorar sus posiciones.');
    }

    // ───── Dibujo principal ─────
    function dibujar() {
      const c = api.colores();
      const W = Math.max(300, Math.min(el.clientWidth || 640, 760));
      const alto = Math.max(260, Math.min(W * 0.82, 460));
      grafica.innerHTML = ''; lectura.innerHTML = ''; leyenda.innerHTML = '';
      const s = api.svg(W, alto);
      s.setAttribute('role', 'img');
      grafica.append(s);
      const caja = { l: 16, r: W - 16, t: 16, b: alto - 16 };
      L = plano(s, c, caja);
      const col = (k) => c.series[((k % 8) + 8) % 8];
      const lineas = [];
      const pon = (t) => lineas.push(t);
      const ley = (items) => items.forEach(([t, color, disc]) => leyenda.append(H('span', { class: 'leyenda-item' }, H('span', { class: 'leyenda-muestra' + (disc ? ' disc' : ''), style: `--c:${color}` }), t)));

      if (modo === 'operaciones' || modo === 'similitud') dibujarPar(c, L, col, ley, pon);
      else if (modo === 'base') dibujarBase(c, L, col, ley, pon);
      else if (modo === 'etiquetas') dibujarEtiquetas(c, L, col, ley, pon);

      lectura.innerHTML = lineas.map(t => `<p>${t}</p>`).join('');
      s.setAttribute('aria-label', 'Plano de vectores interactivo. ' + lectura.textContent);
    }

    dibujar();
    return { redibujar: dibujar };
  }, {
    ejemplos: {
      operaciones: { modo: 'operaciones', vectores: [{ nombre: 'u', xy: [3, 1] }, { nombre: 'v', xy: [1, 2] }], mostrar: ['suma', 'resta', 'escalar'] },
      similitud: { modo: 'similitud', vectores: [{ nombre: 'u', xy: [3, 1] }, { nombre: 'v', xy: [-1, 2] }], mostrar: ['coseno', 'producto', 'euclidea', 'manhattan', 'proyeccion'] },
      base: { modo: 'base', vectores: [{ nombre: 'b1', xy: [2, 0.5] }, { nombre: 'b2', xy: [0.5, 1.5] }, { nombre: 'v', xy: [3, 3] }] },
      etiquetas: {
        modo: 'etiquetas',
        puntos: [{ etiqueta: 'rey', xy: [0.8, 0.9] }, { etiqueta: 'hombre', xy: [0.75, 0.2] }, { etiqueta: 'mujer', xy: [0.15, 0.25] }, { etiqueta: 'reina', xy: [0.28, 0.88] }],
        analogias: [['rey', 'hombre', 'mujer', 'reina']],
      },
    },
  });
})();
