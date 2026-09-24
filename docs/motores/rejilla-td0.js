// Modo "td0" del motor rejilla: predicción TD(0) de V(s) bajo una política aleatoria uniforme,
// paso a paso (no espera a que acabe el episodio, a diferencia de Monte Carlo).
(function () {
  'use strict';
  const key = (x, y) => x + ',' + y;
  Rejilla.modo('td0', function (el, p, api) {
    const H = api.html, num = api.num;
    const grid = Rejilla.analizarMapa(p.mapa);
    const gamma = p.gamma != null ? p.gamma : 0.9;
    const estocastico = p.estocastico || 0;
    const recompensaPaso = p.recompensa_paso != null ? p.recompensa_paso : -0.02;
    const reducido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const E = { alpha: p.alpha != null ? p.alpha : 0.3 };
    let r, V, x, y, pasos, episodios, ultimoError;
    function iniciar() {
      r = api.aleatorio(p.semilla != null ? p.semilla : 4);
      V = {}; grid.estados.forEach(([xx, yy]) => { V[key(xx, yy)] = 0; });
      x = grid.inicio[0]; y = grid.inicio[1]; pasos = 0; episodios = 0; ultimoError = 0;
    }
    iniciar();

    function pasoTD() {
      const a = Math.floor(r() * 4);
      const [nx, ny] = Rejilla.muestrearSiguiente(r, grid, x, y, a, estocastico);
      const rec = Rejilla.recompensa(grid, nx, ny, recompensaPaso);
      const terminalSig = Rejilla.esTerminal(grid, nx, ny);
      const objetivo = terminalSig ? rec : rec + gamma * V[key(nx, ny)];
      const error = objetivo - V[key(x, y)];
      V[key(x, y)] += E.alpha * error;
      ultimoError = error; pasos++;
      x = nx; y = ny;
      if (terminalSig) { episodios++; x = grid.inicio[0]; y = grid.inicio[1]; }
    }

    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, lectura, controles);
    controles.append(api.slider({ etiqueta: 'α (paso de aprendizaje)', min: 0.05, max: 1, paso: 0.05, valor: E.alpha, alCambiar: v => { E.alpha = v; } }));
    let temporizador = null;
    const bPaso = api.boton('Paso →', () => { parar(); pasoTD(); dibujar(); }, { class: 'boton boton-principal' });
    const bAuto = api.boton('Auto', () => {
      if (temporizador) return parar();
      if (reducido) { for (let i = 0; i < 300; i++) pasoTD(); return dibujar(); }
      bAuto.textContent = 'Pausa';
      temporizador = setInterval(() => { if (!document.body.contains(el)) return parar(); pasoTD(); dibujar(); }, 90);
    });
    function parar() { if (temporizador) { clearInterval(temporizador); temporizador = null; } bAuto.textContent = 'Auto'; }
    controles.append(bPaso, bAuto, api.boton('Reiniciar', () => { parar(); iniciar(); dibujar(); }));

    function dibujar() {
      const c = api.colores();
      const med = Rejilla.medidas(el, grid);
      const vs = grid.estados.map(([xx, yy]) => V[key(xx, yy)]);
      const mn = Math.min(0, ...vs), mx = Math.max(0.001, ...vs), span = (mx - mn) || 1;
      Rejilla.dibujarMundo(api, grafica, c, grid, med, (xx, yy, tipo) => {
        const base = Rejilla.estiloBase(c, tipo);
        if (tipo === '#') return base;
        const v = V[key(xx, yy)], t = (v - mn) / span, agente = xx === x && yy === y;
        return Object.assign({}, base, {
          fill: Rejilla.mezcla(c.superficie, c.acento, 0.08 + 0.6 * Math.max(0, t)), valorTexto: num(v, 2),
          agente, colorAgente: c.series[2], aria: `casilla (${xx}, ${yy}): V = ${num(v, 2)}`,
        });
      });
      lectura.innerHTML = `<p>Paso <strong>${pasos}</strong> (episodio ${episodios}, α = ${num(E.alpha, 2)}): el agente sigue una política aleatoria uniforme; el punto marca dónde está ahora.</p>` +
        `<p>Cada paso corrige V(s) con el error TD = ${num(ultimoError, 3)} = recompensa + γ·V(s') − V(s), usando la propia estimación de V(s') sin esperar a que acabe el episodio.</p>`;
    }
    dibujar();
    return { redibujar: dibujar, destruir: parar };
  });
})();
