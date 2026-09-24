// @modos: rejilla, determinante, autovectores
// Motor "transformacion2d": matriz 2x2 editable que deforma una cuadrícula; determinante y autovectores.
(function () {
  'use strict';

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  Motores.registrar('transformacion2d', function (el, p, api) {
    const H = api.html, num = api.num;
    const modo = p.modo;
    if (!p.matriz || p.matriz.length !== 2) throw new Error('transformacion2d necesita "matriz" 2x2');
    const M = { a: p.matriz[0][0], b: p.matriz[0][1], c: p.matriz[1][0], d: p.matriz[1][1] };
    const presets = p.presets || [];

    const entradas = [M.a, M.b, M.c, M.d].concat(presets.flatMap(pr => [].concat(...pr.matriz)));
    const ext = Math.max(3, Math.max(1, ...entradas.map(Math.abs)) * 1.7);
    const dom = { x0: -ext, x1: ext, y0: -ext, y1: ext };

    // ───── DOM ─────
    const controles = H('div', { class: 'motor-controles' });
    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const leyenda = H('div', { class: 'motor-leyenda' });
    el.append(grafica, leyenda, lectura, controles);

    if (presets.length) {
      const grupo = H('div', { class: 'motor-selector', role: 'group', 'aria-label': 'Matrices predefinidas' });
      presets.forEach(pr => grupo.append(api.boton(pr.nombre, () => { M.a = pr.matriz[0][0]; M.b = pr.matriz[0][1]; M.c = pr.matriz[1][0]; M.d = pr.matriz[1][1]; dibujar(); })));
      controles.append(grupo);
    }
    controles.append(api.boton('Reiniciar', reiniciar));
    function reiniciar() { Motores.desmontar(el); Motores.montar(el, 'transformacion2d', JSON.parse(JSON.stringify(p))); }

    // ───── Plano y arrastre (eventos en el contenedor, que sobrevive a cada redibujado) ─────
    let L = null, arrastre = null;
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
      api.el('line', { x1: caja.l, x2: caja.r, y1: Y(0), y2: Y(0), stroke: c.suave, 'stroke-width': 1.2 }, g);
      api.el('line', { x1: X(0), x2: X(0), y1: caja.t, y2: caja.b, stroke: c.suave, 'stroke-width': 1.2 }, g);
      api.el('rect', { x: caja.l, y: caja.t, width: caja.r - caja.l, height: caja.b - caja.t, fill: 'none', stroke: c.linea }, g);
      return { X, Y, g, pt: (x, y) => [X(x), Y(y)] };
    }

    function puntaFlecha(g, p0, p1, color) {
      const ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]), largo = 10, anch = 5.5;
      const bx = p1[0] - largo * Math.cos(ang), by = p1[1] - largo * Math.sin(ang);
      const l = [bx - anch * Math.sin(ang), by + anch * Math.cos(ang)], r = [bx + anch * Math.sin(ang), by - anch * Math.cos(ang)];
      api.el('polygon', { points: `${p1[0]},${p1[1]} ${l[0]},${l[1]} ${r[0]},${r[1]}`, fill: color }, g);
    }
    function flecha(g, p0, p1, color, opacidad) {
      api.el('line', { x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1], stroke: color, 'stroke-width': 2.4, 'stroke-opacity': opacidad === undefined ? 1 : opacidad }, g);
      puntaFlecha(g, p0, p1, color);
    }
    function etiquetaTxt(g, pt, texto, color, c) {
      api.el('text', { x: pt[0] + 6, y: pt[1] - 6, fill: color, 'font-size': 13, 'font-weight': 700, 'paint-order': 'stroke', stroke: c.superficie, 'stroke-width': 3, text: texto }, g);
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
    // Malla: para un mapa lineal, cada línea recta se transforma en otra línea recta,
    // así que basta con transformar los dos extremos de cada segmento.
    function malla(g, color, opacidad, transformar) {
      const n = Math.ceil(dom.x1);
      for (let i = -n; i <= n; i++) {
        const v0 = transformar(i, -n), v1 = transformar(i, n);
        api.el('line', { x1: L.X(v0[0]), y1: L.Y(v0[1]), x2: L.X(v1[0]), y2: L.Y(v1[1]), stroke: color, 'stroke-width': 1, 'stroke-opacity': opacidad }, g);
        const h0 = transformar(-n, i), h1 = transformar(n, i);
        api.el('line', { x1: L.X(h0[0]), y1: L.Y(h0[1]), x2: L.X(h1[0]), y2: L.Y(h1[1]), stroke: color, 'stroke-width': 1, 'stroke-opacity': opacidad }, g);
      }
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

      const det = M.a * M.d - M.b * M.c;
      const aplicar = (x, y) => [M.a * x + M.b * y, M.c * x + M.d * y];

      malla(L.g, c.linea, 0.55, (x, y) => [x, y]);
      malla(L.g, col(2), 0.85, aplicar);

      if (modo === 'determinante') {
        const cuad = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([x, y]) => aplicar(x, y)).map(([x, y]) => L.pt(x, y));
        api.el('polygon', { points: cuad.map(pt => pt.join(',')).join(' '), fill: col(2), 'fill-opacity': 0.28, stroke: col(2), 'stroke-width': 1.6 }, L.g);
        pon(`El cuadrado unidad pasa a tener área <strong>${num(Math.abs(det), 3)}</strong> (el valor absoluto del determinante).`);
      }
      if (modo === 'autovectores') {
        const T = M.a + M.d, disc = T * T - 4 * det;
        if (disc >= -1e-9) {
          const raiz = Math.sqrt(Math.max(0, disc));
          const lams = [(T + raiz) / 2, (T - raiz) / 2];
          const vistos = new Set();
          lams.forEach((lam, i) => {
            let vx, vy;
            if (Math.abs(M.c) > 1e-9) { vx = lam - M.d; vy = M.c; }
            else if (Math.abs(M.b) > 1e-9) { vx = M.b; vy = lam - M.a; }
            else { vx = Math.abs(M.a - lam) < 1e-6 ? 1 : 0; vy = Math.abs(M.d - lam) < 1e-6 ? 1 : 0; }
            const norma = Math.hypot(vx, vy) || 1, ux = vx / norma, uy = vy / norma;
            const clave = num(Math.abs(ux), 2) + ',' + num(Math.abs(uy), 2);
            if (vistos.has(clave)) return;
            vistos.add(clave);
            const largo = ext * 1.3;
            flecha(L.g, L.pt(-ux * largo, -uy * largo), L.pt(ux * largo, uy * largo), col(4 + i), 0.85);
            pon(`Autovalor λ${i + 1} = ${num(lam, 3)} · dirección invariante ≈ (${num(ux, 2)}, ${num(uy, 2)})`);
          });
          ley(lams.map((lam, i) => [`λ${i + 1} = ${num(lam, 2)}`, col(4 + i)]));
        } else {
          pon('Esta matriz no tiene autovectores reales: gira el plano en vez de dejar direcciones fijas (autovalores complejos).');
        }
      }

      const p1 = [M.a, M.c], p2 = [M.b, M.d];
      flecha(L.g, L.pt(0, 0), L.pt(p1[0], p1[1]), col(0));
      etiquetaTxt(L.g, L.pt(p1[0], p1[1]), 'columna 1', col(0), c);
      flecha(L.g, L.pt(0, 0), L.pt(p2[0], p2[1]), col(1));
      etiquetaTxt(L.g, L.pt(p2[0], p2[1]), 'columna 2', col(1), c);
      ley([['imagen de e₁ (columna 1)', col(0)], ['imagen de e₂ (columna 2)', col(1)], ['cuadrícula original', c.linea], ['cuadrícula transformada', col(2)]]);
      asa(L.g, p1[0], p1[1], col(0), 'columna 1', (x, y) => { M.a = clamp(x, dom.x0, dom.x1); M.c = clamp(y, dom.y0, dom.y1); dibujar(); });
      asa(L.g, p2[0], p2[1], col(1), 'columna 2', (x, y) => { M.b = clamp(x, dom.x0, dom.x1); M.d = clamp(y, dom.y0, dom.y1); dibujar(); });

      pon(`M = [[${num(M.a, 2)}, ${num(M.b, 2)}], [${num(M.c, 2)}, ${num(M.d, 2)}]]`);
      pon(`determinante = <strong>${num(det, 3)}</strong> · ${Math.abs(det) < 1e-9 ? 'aplasta el plano en una línea (o un punto)' : det > 0 ? 'conserva la orientación' : 'invierte la orientación'} · el área de cada celda se multiplica por ${num(Math.abs(det), 3)}`);

      lectura.innerHTML = lineas.map(t => `<p>${t}</p>`).join('');
      s.setAttribute('aria-label', 'Transformación lineal interactiva. ' + lectura.textContent);
    }

    dibujar();
    return { redibujar: dibujar };
  }, {
    ejemplos: {
      rejilla: { modo: 'rejilla', matriz: [[1.4, 0.6], [0.2, 1.1]], presets: [{ nombre: 'identidad', matriz: [[1, 0], [0, 1]] }, { nombre: 'rotación 45°', matriz: [[0.7071, -0.7071], [0.7071, 0.7071]] }, { nombre: 'cizalla', matriz: [[1, 0.8], [0, 1]] }] },
      determinante: { modo: 'determinante', matriz: [[2, 0.5], [0.5, 1.2]], presets: [{ nombre: 'refleja (det < 0)', matriz: [[0, 1], [1, 0]] }, { nombre: 'anula (det = 0)', matriz: [[2, 1], [4, 2]] }] },
      autovectores: { modo: 'autovectores', matriz: [[2, 1], [1, 2]], presets: [{ nombre: 'rotación (sin autovectores reales)', matriz: [[0, -1], [1, 0]] }, { nombre: 'diagonal', matriz: [[2, 0], [0, 0.5]] }] },
    },
  });
})();
