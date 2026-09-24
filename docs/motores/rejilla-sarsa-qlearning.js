// Modo "sarsa-qlearning" del motor rejilla: compara el control on-policy (SARSA) con el off-policy
// (Q-learning) sobre el mismo mundo, típicamente un "paseo por el acantilado".
// Si se carga suelto (p. ej. el banco de pruebas de motores) antes que rejilla.js, esperamos a que
// registre window.Rejilla en vez de asumir que ya existe.
(function () {
  'use strict';
  if (window.Rejilla) registrar(); else Motores.cargar('rejilla').then(registrar);
  function registrar() {
  const key = (x, y) => x + ',' + y;
  Rejilla.modo('sarsa-qlearning', function (el, p, api) {
    const H = api.html, num = api.num;
    const grid = Rejilla.analizarMapa(p.mapa);
    const gamma = p.gamma != null ? p.gamma : 0.95;
    const estocastico = p.estocastico || 0;
    const recompensaPaso = p.recompensa_paso != null ? p.recompensa_paso : -1;
    const reducido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const E = { algoritmo: 'qlearning', alpha: p.alpha != null ? p.alpha : 0.5, epsilon: p.epsilon != null ? p.epsilon : 0.15 };
    let r, Q, x, y, aAct, episodios, pasos, traza;

    function greedy(k) { const q = Q[k]; let mejor = 0; for (let a = 1; a < 4; a++) if (q[a] > q[mejor]) mejor = a; return mejor; }
    function elegir(k) { return r() < E.epsilon ? Math.floor(r() * 4) : greedy(k); }
    function iniciar() {
      r = api.aleatorio(p.semilla != null ? p.semilla : 9);
      Q = {}; grid.estados.forEach(([xx, yy]) => { Q[key(xx, yy)] = [0, 0, 0, 0]; });
      x = grid.inicio[0]; y = grid.inicio[1]; aAct = elegir(key(x, y)); episodios = 0; pasos = 0; traza = [[x, y]];
    }
    iniciar();

    function paso() {
      const k = key(x, y);
      const [nx, ny] = Rejilla.muestrearSiguiente(r, grid, x, y, aAct, estocastico);
      const rec = Rejilla.recompensa(grid, nx, ny, recompensaPaso), kn = key(nx, ny), terminal = Rejilla.esTerminal(grid, nx, ny);
      let objetivo, aSig = null;
      if (terminal) objetivo = rec;
      else if (E.algoritmo === 'sarsa') { aSig = elegir(kn); objetivo = rec + gamma * Q[kn][aSig]; }
      else objetivo = rec + gamma * Math.max(...Q[kn]);
      Q[k][aAct] += E.alpha * (objetivo - Q[k][aAct]);
      x = nx; y = ny; pasos++; traza.push([x, y]);
      if (terminal) {
        episodios++; x = grid.inicio[0]; y = grid.inicio[1]; aAct = elegir(key(x, y)); traza = [[x, y]];
      } else {
        aAct = E.algoritmo === 'sarsa' ? aSig : elegir(kn);
      }
    }

    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, lectura, controles);
    const grupo = H('div', { class: 'motor-selector', role: 'group', 'aria-label': 'Algoritmo' });
    const bS = api.boton('SARSA (on-policy)', () => { E.algoritmo = 'sarsa'; marcar(); parar(); iniciar(); dibujar(); });
    const bQ = api.boton('Q-learning (off-policy)', () => { E.algoritmo = 'qlearning'; marcar(); parar(); iniciar(); dibujar(); });
    grupo.append(bS, bQ); controles.append(grupo);
    function marcar() { bS.setAttribute('aria-pressed', String(E.algoritmo === 'sarsa')); bQ.setAttribute('aria-pressed', String(E.algoritmo === 'qlearning')); }
    marcar();
    controles.append(
      api.slider({ etiqueta: 'ε (exploración)', min: 0, max: 0.5, paso: 0.01, valor: E.epsilon, alCambiar: v => { E.epsilon = v; } }),
      api.slider({ etiqueta: 'α (paso de aprendizaje)', min: 0.05, max: 1, paso: 0.05, valor: E.alpha, alCambiar: v => { E.alpha = v; } }),
    );
    let temporizador = null;
    const bPaso = api.boton('Paso →', () => { parar(); paso(); dibujar(); }, { class: 'boton boton-principal' });
    const bEpi = api.boton('Episodio →', () => { parar(); const e0 = episodios; let n = 0; while (episodios === e0 && n < 500) { paso(); n++; } dibujar(); });
    const bAuto = api.boton('Auto', () => {
      if (temporizador) return parar();
      if (reducido) { for (let i = 0; i < 1500; i++) paso(); return dibujar(); }
      bAuto.textContent = 'Pausa';
      temporizador = setInterval(() => { if (!document.body.contains(el)) return parar(); for (let i = 0; i < 5; i++) paso(); dibujar(); }, 90);
    });
    function parar() { if (temporizador) { clearInterval(temporizador); temporizador = null; } bAuto.textContent = 'Auto'; }
    controles.append(bPaso, bEpi, bAuto, api.boton('Reiniciar', () => { parar(); iniciar(); dibujar(); }));

    function dibujar() {
      const c = api.colores();
      const med = Rejilla.medidas(el, grid);
      const V = {}; grid.estados.forEach(([xx, yy]) => { V[key(xx, yy)] = Math.max(...Q[key(xx, yy)]); });
      const vs = Object.values(V), mn = Math.min(...vs), mx = Math.max(0.001, ...vs), span = (mx - mn) || 1;
      const s = Rejilla.dibujarMundo(api, grafica, c, grid, med, (xx, yy, tipo) => {
        const base = Rejilla.estiloBase(c, tipo);
        if (tipo === '#') return base;
        const terminal = Rejilla.esTerminal(grid, xx, yy), v = V[key(xx, yy)], t = (v - mn) / span;
        const out = Object.assign({}, base, { fill: Rejilla.mezcla(c.superficie, c.acento, 0.08 + 0.6 * Math.max(0, t)), aria: `casilla (${xx}, ${yy}): V ≈ ${num(v, 1)}` });
        if (!terminal) out.flecha = greedy(key(xx, yy));
        if (xx === x && yy === y) { out.agente = true; out.colorAgente = c.series[2]; }
        return out;
      });
      const g = api.el('g', {}, s);
      if (traza.length > 1) {
        const pts = traza.map(([xx, yy]) => { const q = Rejilla.centro(med, xx, yy); return q.cx + ',' + q.cy; }).join(' ');
        api.el('polyline', { points: pts, fill: 'none', stroke: c.series[2], 'stroke-width': 2, opacity: 0.6 }, g);
      }
      lectura.innerHTML = `<p><strong>${E.algoritmo === 'sarsa' ? 'SARSA' : 'Q-learning'}</strong>: ${episodios} episodios, ${pasos} pasos en total.</p>` +
        `<p>${E.algoritmo === 'sarsa'
          ? 'SARSA actualiza Q con la acción que de verdad va a tomar (on-policy): si su exploración le hace caer del acantilado alguna vez, aprende a mantenerse lejos del borde.'
          : 'Q-learning actualiza Q con la mejor acción posible del siguiente estado (off-policy), aunque luego explore otra cosa: aprende la ruta óptima justo al borde del acantilado, aunque al explorar caiga alguna vez.'}</p>`;
    }
    dibujar();
    return { redibujar: dibujar, destruir: parar };
  });
  }
})();
