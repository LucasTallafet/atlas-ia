// Modo "iteracion-valores" del motor rejilla: barridas de la copia de seguridad de Bellman, una a una.
(function () {
  'use strict';
  const key = (x, y) => x + ',' + y;
  Rejilla.modo('iteracion-valores', function (el, p, api) {
    const H = api.html, num = api.num;
    const grid = Rejilla.analizarMapa(p.mapa);
    const gamma = p.gamma != null ? p.gamma : 0.9;
    const estocastico = p.estocastico || 0;
    const recompensaPaso = p.recompensa_paso != null ? p.recompensa_paso : 0;
    let V, sweep, delta, historial;
    function iniciar() { V = {}; grid.estados.forEach(([x, y]) => { V[key(x, y)] = 0; }); sweep = 0; delta = Infinity; historial = []; }
    iniciar();

    function unaBarrida() {
      const Vn = {}; let d = 0;
      grid.estados.forEach(([x, y]) => {
        if (Rejilla.esTerminal(grid, x, y)) { Vn[key(x, y)] = 0; return; }
        let mejor = -Infinity;
        for (let a = 0; a < 4; a++) {
          let val = 0;
          Rejilla.transiciones(grid, x, y, a, estocastico).forEach(t => { val += t.prob * (Rejilla.recompensa(grid, t.x, t.y, recompensaPaso) + gamma * V[key(t.x, t.y)]); });
          if (val > mejor) mejor = val;
        }
        Vn[key(x, y)] = mejor;
        d = Math.max(d, Math.abs(mejor - V[key(x, y)]));
      });
      V = Vn; sweep++; delta = d; historial.push(d);
      if (historial.length > 500) historial.shift();
    }
    function hastaConverger() { let n = 0; while (delta > 1e-3 && n < 500) { unaBarrida(); n++; } }

    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, lectura, controles);
    controles.append(
      api.boton('Barrida →', () => { unaBarrida(); dibujar(); }, { class: 'boton boton-principal' }),
      api.boton('Hasta converger', () => { hastaConverger(); dibujar(); }),
      api.boton('Reiniciar', () => { iniciar(); dibujar(); }),
    );

    function dibujar() {
      const c = api.colores();
      const med = Rejilla.medidas(el, grid);
      const vs = grid.estados.map(([x, y]) => V[key(x, y)]);
      const mn = Math.min(...vs), mx = Math.max(0.001, ...vs), span = (mx - mn) || 1;
      const politica = sweep > 0 ? Rejilla.politicaGreedy(grid, V, gamma, estocastico, recompensaPaso) : null;
      Rejilla.dibujarMundo(api, grafica, c, grid, med, (x, y, tipo) => {
        const base = Rejilla.estiloBase(c, tipo);
        if (tipo === '#') return base;
        const v = V[key(x, y)], t = (v - mn) / span, terminal = Rejilla.esTerminal(grid, x, y);
        const out = Object.assign({}, base, {
          fill: Rejilla.mezcla(c.superficie, c.acento, 0.1 + 0.7 * Math.max(0, t)),
          valorTexto: num(v, 2), aria: `casilla (${x}, ${y}): V = ${num(v, 2)}`,
        });
        if (politica && !terminal) out.flecha = politica[key(x, y)];
        return out;
      });
      lectura.innerHTML = sweep === 0
        ? '<p>V(s) empieza en 0 en todas las casillas. Cada barrida aplica la copia de seguridad de Bellman a la vez en todas ellas, usando los valores de la barrida anterior.</p>'
        : `<p>Barrida <strong>${sweep}</strong>: el mayor cambio en V(s) fue de <strong>${num(delta, 4)}</strong>. ${delta < 1e-3 ? 'Los valores ya han convergido: seguir barriendo no los cambiaría.' : 'Sigue barriendo para que el valor de la meta termine de propagarse hacia atrás.'}</p>`;
    }
    dibujar();
    return { redibujar: dibujar };
  });
})();
