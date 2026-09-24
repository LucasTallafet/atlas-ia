// Modo "monte-carlo" del motor rejilla: control de Monte Carlo cada-visita con política ε-greedy.
(function () {
  'use strict';
  const key = (x, y) => x + ',' + y;
  Rejilla.modo('monte-carlo', function (el, p, api) {
    const H = api.html, num = api.num;
    const grid = Rejilla.analizarMapa(p.mapa);
    const gamma = p.gamma != null ? p.gamma : 0.9;
    const estocastico = p.estocastico || 0;
    const recompensaPaso = p.recompensa_paso != null ? p.recompensa_paso : -0.02;
    const reducido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const E = { epsilon: p.epsilon != null ? p.epsilon : 0.2 };
    let r, Q, N, episodios, traza;
    function iniciar() {
      r = api.aleatorio(p.semilla != null ? p.semilla : 7);
      Q = {}; N = {};
      grid.estados.forEach(([x, y]) => { Q[key(x, y)] = [0, 0, 0, 0]; N[key(x, y)] = [0, 0, 0, 0]; });
      episodios = 0; traza = [grid.inicio];
    }
    iniciar();

    function elegir(x, y) {
      if (r() < E.epsilon) return Math.floor(r() * 4);
      const q = Q[key(x, y)]; let mejor = 0;
      for (let a = 1; a < 4; a++) if (q[a] > q[mejor]) mejor = a;
      return mejor;
    }
    function episodio() {
      let x = grid.inicio[0], y = grid.inicio[1];
      const pasos = [], t = [[x, y]];
      let n = 0;
      while (!Rejilla.esTerminal(grid, x, y) && n < 200) {
        const a = elegir(x, y);
        const [nx, ny] = Rejilla.muestrearSiguiente(r, grid, x, y, a, estocastico);
        pasos.push({ x, y, a, r: Rejilla.recompensa(grid, nx, ny, recompensaPaso) });
        x = nx; y = ny; n++; t.push([x, y]);
      }
      let G = 0;
      for (let i = pasos.length - 1; i >= 0; i--) {
        G = pasos[i].r + gamma * G;
        const k = key(pasos[i].x, pasos[i].y), a = pasos[i].a;
        N[k][a]++; Q[k][a] += (G - Q[k][a]) / N[k][a];
      }
      episodios++; traza = t;
    }

    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, lectura, controles);
    controles.append(api.slider({ etiqueta: 'ε (exploración)', min: 0, max: 1, paso: 0.02, valor: E.epsilon, alCambiar: v => { E.epsilon = v; } }));
    let temporizador = null;
    const bPaso = api.boton('Episodio →', () => { parar(); episodio(); dibujar(); }, { class: 'boton boton-principal' });
    const bAuto = api.boton('Auto', () => {
      if (temporizador) return parar();
      if (reducido) { for (let i = 0; i < 200; i++) episodio(); return dibujar(); }
      bAuto.textContent = 'Pausa';
      temporizador = setInterval(() => { if (!document.body.contains(el)) return parar(); episodio(); dibujar(); }, 140);
    });
    function parar() { if (temporizador) { clearInterval(temporizador); temporizador = null; } bAuto.textContent = 'Auto'; }
    controles.append(bPaso, bAuto, api.boton('Reiniciar', () => { parar(); iniciar(); dibujar(); }));

    function dibujar() {
      const c = api.colores();
      const med = Rejilla.medidas(el, grid);
      const V = {}; grid.estados.forEach(([x, y]) => { V[key(x, y)] = Math.max(...Q[key(x, y)]); });
      const vs = Object.values(V), mn = Math.min(...vs), mx = Math.max(0.001, ...vs), span = (mx - mn) || 1;
      const s = Rejilla.dibujarMundo(api, grafica, c, grid, med, (x, y, tipo) => {
        const base = Rejilla.estiloBase(c, tipo);
        if (tipo === '#') return base;
        const terminal = Rejilla.esTerminal(grid, x, y), v = V[key(x, y)], t = (v - mn) / span;
        const q = Q[key(x, y)]; let mejor = 0; for (let a = 1; a < 4; a++) if (q[a] > q[mejor]) mejor = a;
        const out = Object.assign({}, base, { fill: Rejilla.mezcla(c.superficie, c.acento, 0.08 + 0.6 * Math.max(0, t)), aria: `casilla (${x}, ${y}): V ≈ ${num(v, 2)}` });
        if (!terminal) out.flecha = mejor;
        return out;
      });
      const g = api.el('g', {}, s);
      if (traza.length > 1) {
        const pts = traza.map(([x, y]) => { const q = Rejilla.centro(med, x, y); return q.cx + ',' + q.cy; }).join(' ');
        api.el('polyline', { points: pts, fill: 'none', stroke: c.series[2], 'stroke-width': 2.4, 'stroke-linejoin': 'round', opacity: 0.85 }, g);
      }
      const [ax, ay] = traza[traza.length - 1], ctr = Rejilla.centro(med, ax, ay);
      api.el('circle', { cx: ctr.cx, cy: ctr.cy, r: med.cell * 0.16, fill: c.series[2] }, g);
      lectura.innerHTML = `<p>Tras <strong>${episodios}</strong> episodios (ε = ${num(E.epsilon, 2)}): el último terminó en ${traza.length - 1} pasos.</p>` +
        `<p>Cada episodio completo actualiza Q(s, a) con el retorno real observado desde esa visita (línea de color = último recorrido); no hace falta conocer las probabilidades de transición del mundo.</p>`;
    }
    dibujar();
    return { redibujar: dibujar, destruir: parar };
  });
})();
