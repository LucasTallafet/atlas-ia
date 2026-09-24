// @modos: busqueda, mdp, valores, iteracion-valores, monte-carlo, td0, sarsa-qlearning
// Motor "rejilla": mundo en cuadrícula para búsqueda, procesos de decisión de Markov (MDP) y
// aprendizaje por refuerzo. Infraestructura común (parseo del mapa, transiciones con resbalón,
// recompensas, iteración de valores, dibujo de la cuadrícula) en window.Rejilla; busqueda, mdp y
// valores viven aquí. Los modos más pesados (iteracion-valores, monte-carlo, td0, sarsa-qlearning)
// se cargan bajo demanda de motores/rejilla-<modo>.js, que debe llamar a Rejilla.modo('<modo>', fn).
(function () {
  'use strict';
  const MODOS = {};
  const BASE = document.currentScript ? document.currentScript.src.replace(/rejilla\.js(\?.*)?$/, '') : 'motores/';

  // ───────────── Mapa: '.' libre, '#' muro, 'S' inicio, 'G' meta (+1), 'X' trampa (−1), 'C' acantilado (−100) ─────────────
  function analizarMapa(mapa) {
    if (!Array.isArray(mapa) || !mapa.length) throw new Error('rejilla necesita "mapa"');
    const filas = mapa.length, cols = Math.max(...mapa.map(f => f.length));
    const celdas = mapa.map(f => String(f).padEnd(cols, '#').split(''));
    let inicio = null; const metas = [], trampas = [], acantilados = [], estados = [];
    for (let y = 0; y < filas; y++) {
      for (let x = 0; x < cols; x++) {
        const t = celdas[y][x];
        if (t === '#') continue;
        estados.push([x, y]);
        if (t === 'S' && !inicio) inicio = [x, y];
        if (t === 'G') metas.push([x, y]);
        if (t === 'X') trampas.push([x, y]);
        if (t === 'C') acantilados.push([x, y]);
      }
    }
    if (!inicio) throw new Error('El mapa necesita una casilla "S" (inicio)');
    return { filas, cols, celdas, inicio, metas, trampas, acantilados, estados };
  }

  // orden arriba, derecha, abajo, izquierda: los perpendiculares de la acción i son (i±1) mod 4
  const ACCIONES = [
    { dx: 0, dy: -1, flecha: '↑', nombre: 'arriba' },
    { dx: 1, dy: 0, flecha: '→', nombre: 'derecha' },
    { dx: 0, dy: 1, flecha: '↓', nombre: 'abajo' },
    { dx: -1, dy: 0, flecha: '←', nombre: 'izquierda' },
  ];
  function destino(grid, x, y, accionIdx) {
    const a = ACCIONES[accionIdx], nx = x + a.dx, ny = y + a.dy;
    if (nx < 0 || ny < 0 || nx >= grid.cols || ny >= grid.filas || grid.celdas[ny][nx] === '#') return [x, y];
    return [nx, ny];
  }
  // Transiciones exactas (para planificación): con probabilidad `estocastico` la acción resbala
  // a uno de los dos perpendiculares (mitad y mitad) en vez de ir donde se pretendía.
  function transiciones(grid, x, y, accionIdx, estocastico) {
    const p = estocastico || 0;
    const principal = destino(grid, x, y, accionIdx);
    if (!p) return [{ prob: 1, x: principal[0], y: principal[1] }];
    const d1 = destino(grid, x, y, (accionIdx + 1) % 4), d2 = destino(grid, x, y, (accionIdx + 3) % 4);
    return [
      { prob: 1 - p, x: principal[0], y: principal[1] },
      { prob: p / 2, x: d1[0], y: d1[1] },
      { prob: p / 2, x: d2[0], y: d2[1] },
    ];
  }
  // Muestra una transición real (para aprendizaje por refuerzo) con el mismo generador r() del modo.
  function muestrearSiguiente(r, grid, x, y, accionIdx, estocastico) {
    const p = estocastico || 0;
    let real = accionIdx;
    if (p && r() < p) real = r() < 0.5 ? (accionIdx + 1) % 4 : (accionIdx + 3) % 4;
    return destino(grid, x, y, real);
  }
  function recompensa(grid, x, y, recompensaPaso) {
    const t = grid.celdas[y][x];
    if (t === 'G') return 1;
    if (t === 'X') return -1;
    if (t === 'C') return -100;
    return recompensaPaso || 0;
  }
  function esTerminal(grid, x, y) {
    const t = grid.celdas[y][x];
    return t === 'G' || t === 'X' || t === 'C';
  }
  // Iteración de valores (síncrona) hasta converger o agotar `nSweeps`.
  function valorIteracion(grid, gamma, estocastico, recompensaPaso, nSweeps) {
    const key = (x, y) => x + ',' + y;
    const V = {}; grid.estados.forEach(([x, y]) => { V[key(x, y)] = 0; });
    const historial = [];
    let delta = Infinity;
    for (let it = 0; it < nSweeps && delta > 1e-4; it++) {
      const Vn = {}; delta = 0;
      grid.estados.forEach(([x, y]) => {
        if (esTerminal(grid, x, y)) { Vn[key(x, y)] = 0; return; }
        let mejor = -Infinity;
        for (let a = 0; a < 4; a++) {
          let val = 0;
          transiciones(grid, x, y, a, estocastico).forEach(t => { val += t.prob * (recompensa(grid, t.x, t.y, recompensaPaso) + gamma * V[key(t.x, t.y)]); });
          if (val > mejor) mejor = val;
        }
        Vn[key(x, y)] = mejor;
        delta = Math.max(delta, Math.abs(Vn[key(x, y)] - V[key(x, y)]));
      });
      Object.assign(V, Vn);
      historial.push(delta);
    }
    return { V, iteraciones: historial.length, historial };
  }
  function politicaGreedy(grid, V, gamma, estocastico, recompensaPaso) {
    const key = (x, y) => x + ',' + y, pol = {};
    grid.estados.forEach(([x, y]) => {
      if (esTerminal(grid, x, y)) { pol[key(x, y)] = null; return; }
      let mejor = -Infinity, accion = 0;
      for (let a = 0; a < 4; a++) {
        let val = 0;
        transiciones(grid, x, y, a, estocastico).forEach(t => { val += t.prob * (recompensa(grid, t.x, t.y, recompensaPaso) + gamma * V[key(t.x, t.y)]); });
        if (val > mejor + 1e-9) { mejor = val; accion = a; }
      }
      pol[key(x, y)] = accion;
    });
    return pol;
  }

  // ───────────── Dibujo compartido ─────────────
  function mezcla(base, obj, t) {
    const pct = Math.max(0, Math.min(100, Math.round(t * 100)));
    return `color-mix(in srgb, ${obj} ${pct}%, ${base})`;
  }
  function medidas(el, grid) {
    const dispW = Math.max(220, Math.min(el.clientWidth || 480, 560));
    const cell = Math.max(26, Math.min(64, Math.floor((dispW - 4) / grid.cols)));
    return { cell, ancho: cell * grid.cols + 4, alto: cell * grid.filas + 4 };
  }
  function centro(med, x, y) { return { cx: 2 + x * med.cell + med.cell / 2, cy: 2 + y * med.cell + med.cell / 2 }; }
  function estiloBase(c, tipo) {
    if (tipo === '#') return { fill: c.suave, contorno: c.suave };
    if (tipo === 'S') return { icono: '◉', colorIcono: c.acento };
    if (tipo === 'G') return { fill: mezcla(c.superficie, c.bien, 0.32), icono: '★', colorIcono: c.bien };
    if (tipo === 'X') return { fill: mezcla(c.superficie, c.mal, 0.26), icono: '✕', colorIcono: c.mal };
    if (tipo === 'C') return { fill: mezcla(c.superficie, c.mal, 0.55), icono: '▲', colorIcono: c.mal };
    return {};
  }
  function puntosFlecha(accionIdx, cx, cy, r) {
    const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]], [dx, dy] = dirs[accionIdx], px = -dy, py = dx;
    const punta = [cx + dx * r, cy + dy * r];
    const b1 = [cx - dx * r * 0.5 + px * r * 0.55, cy - dy * r * 0.5 + py * r * 0.55];
    const b2 = [cx - dx * r * 0.5 - px * r * 0.55, cy - dy * r * 0.5 - py * r * 0.55];
    return `${punta[0]},${punta[1]} ${b1[0]},${b1[1]} ${b2[0]},${b2[1]}`;
  }
  function accesible(nodo, fn, aria) {
    nodo.setAttribute('tabindex', '0');
    nodo.setAttribute('role', 'button');
    if (aria) nodo.setAttribute('aria-label', aria);
    nodo.style.cursor = 'pointer';
    nodo.addEventListener('click', fn);
    nodo.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
  }
  // celda(x, y, tipo) → {fill, contorno, grosor, icono, colorIcono, valorTexto, colorValor, flecha (0-3), colorFlecha, agente, colorAgente, aria, onClick}
  function dibujarMundo(api, cont, c, grid, med, celda) {
    cont.innerHTML = '';
    const s = api.svg(med.ancho, med.alto);
    s.setAttribute('role', 'img');
    s.setAttribute('aria-label', `Cuadrícula de ${grid.filas} filas por ${grid.cols} columnas.`);
    cont.append(s);
    const g = api.el('g', {}, s);
    for (let y = 0; y < grid.filas; y++) {
      for (let x = 0; x < grid.cols; x++) {
        const tipo = grid.celdas[y][x];
        const d = celda(x, y, tipo) || {};
        const x0 = 2 + x * med.cell, y0 = 2 + y * med.cell, cx = x0 + med.cell / 2, cy = y0 + med.cell / 2;
        const rect = api.el('rect', { x: x0 + 1, y: y0 + 1, width: med.cell - 2, height: med.cell - 2, rx: 5, fill: d.fill || c.superficie, stroke: d.contorno || c.linea, 'stroke-width': d.grosor || 1 }, g);
        // pointer-events: none, para que estos adornos no tapen los clics dirigidos al rect (celda) de abajo
        if (d.valorTexto) api.el('text', { x: cx, y: y0 + 12, 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 600, fill: d.colorValor || c.suave, text: d.valorTexto, 'pointer-events': 'none' }, g);
        if (d.flecha != null) api.el('polygon', { points: puntosFlecha(d.flecha, cx, cy, med.cell * 0.27), fill: d.colorFlecha || c.acento, 'pointer-events': 'none' }, g);
        else if (d.icono) api.el('text', { x: cx, y: cy + Math.round(med.cell * 0.14), 'text-anchor': 'middle', 'font-size': Math.round(med.cell * 0.4), fill: d.colorIcono || c.texto, text: d.icono, 'pointer-events': 'none' }, g);
        if (d.agente) api.el('circle', { cx, cy, r: med.cell * 0.2, fill: d.colorAgente || c.acento, stroke: c.superficie, 'stroke-width': 2, 'pointer-events': 'none' }, g);
        if (d.onClick) accesible(rect, d.onClick, d.aria);
        else if (d.aria) rect.setAttribute('aria-label', d.aria);
      }
    }
    return s;
  }

  window.Rejilla = {
    modo: (nombre, fn) => { MODOS[nombre] = fn; }, MODOS,
    analizarMapa, ACCIONES, destino, transiciones, muestrearSiguiente, recompensa, esTerminal,
    valorIteracion, politicaGreedy, mezcla, medidas, centro, estiloBase, dibujarMundo,
  };

  // ───────────────────────── busqueda: BFS desde S hasta la G más cercana ─────────────────────────
  MODOS.busqueda = function (el, p, api) {
    const H = api.html;
    const grid = analizarMapa(p.mapa);
    if (!grid.metas.length) throw new Error('El mapa de "busqueda" necesita una casilla "G"');
    const key = (x, y) => x + ',' + y;
    const metaSet = new Set(grid.metas.map(([x, y]) => key(x, y)));
    let E;
    function iniciar() {
      const k0 = key(...grid.inicio);
      E = { visitados: new Set([k0]), frontera: [grid.inicio], padres: {}, oleadas: 0, meta: metaSet.has(k0) ? grid.inicio : null };
      E.camino = E.meta ? [E.meta] : null;
    }
    iniciar();
    function reconstruir(dest) {
      const camino = [dest]; let k = key(...dest);
      while (E.padres[k]) { const pr = E.padres[k]; camino.unshift(pr); k = key(...pr); }
      return camino;
    }
    function expandirOleada() {
      if (E.meta || !E.frontera.length) return false;
      const siguiente = [];
      for (const [x, y] of E.frontera) {
        for (let a = 0; a < 4; a++) {
          const [nx, ny] = destino(grid, x, y, a);
          if (nx === x && ny === y) continue;
          const k = key(nx, ny);
          if (E.visitados.has(k)) continue;
          E.visitados.add(k); E.padres[k] = [x, y]; siguiente.push([nx, ny]);
          if (metaSet.has(k) && !E.meta) E.meta = [nx, ny];
        }
      }
      E.frontera = siguiente; E.oleadas++;
      if (E.meta) E.camino = reconstruir(E.meta);
      return true;
    }
    function hastaElFinal() { let sigue = true; while (sigue && !E.meta) sigue = expandirOleada(); }

    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, lectura, controles);
    controles.append(
      api.boton('Oleada →', () => { expandirOleada(); dibujar(); }, { class: 'boton boton-principal' }),
      api.boton('Hasta el final', () => { hastaElFinal(); dibujar(); }),
      api.boton('Reiniciar', () => { iniciar(); dibujar(); }),
    );

    function dibujar() {
      const c = api.colores();
      const med = medidas(el, grid);
      const enCamino = new Set((E.camino || []).map(([x, y]) => key(x, y)));
      const enFrontera = new Set(E.frontera.map(([x, y]) => key(x, y)));
      dibujarMundo(api, grafica, c, grid, med, (x, y, tipo) => {
        const base = estiloBase(c, tipo);
        if (tipo === '#') return base;
        const k = key(x, y);
        if (enCamino.has(k)) return Object.assign(base, { fill: mezcla(c.superficie, c.bien, 0.4), contorno: c.bien, grosor: 2.4 });
        if (enFrontera.has(k)) return Object.assign(base, { contorno: c.acento, grosor: 2.2 });
        if (E.visitados.has(k)) return Object.assign({ fill: mezcla(c.superficie, c.acento, 0.14) }, base);
        return base;
      });
      lectura.innerHTML = E.meta
        ? `<p>Meta encontrada tras <strong>${E.oleadas}</strong> oleadas: se visitaron ${E.visitados.size} casillas y el camino más corto tiene <strong>${E.camino.length - 1}</strong> pasos.</p>`
        : `<p>Oleada ${E.oleadas}: ${E.visitados.size} casillas visitadas, ${E.frontera.length} en el frente de búsqueda.</p>`;
    }
    dibujar();
    return { redibujar: dibujar };
  };

  // ───────────────────────── mdp: explorar transiciones y recompensas de un estado ─────────────────────────
  MODOS.mdp = function (el, p, api) {
    const H = api.html, num = api.num;
    const grid = analizarMapa(p.mapa);
    const estocastico = p.estocastico || 0;
    const recompensaPaso = p.recompensa_paso != null ? p.recompensa_paso : 0;
    const E = { sel: grid.inicio, accion: 0 };

    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, lectura, controles);
    const grupo = H('div', { class: 'motor-selector', role: 'group', 'aria-label': 'Acción a inspeccionar' });
    ACCIONES.forEach((a, i) => { const b = api.boton(a.flecha + ' ' + a.nombre, () => { E.accion = i; marcar(); dibujar(); }); b.dataset.a = i; grupo.append(b); });
    function marcar() { grupo.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.a === E.accion))); }
    controles.append(grupo);
    marcar();

    function dibujar() {
      const c = api.colores();
      const med = medidas(el, grid);
      const [sx, sy] = E.sel;
      const terminal = esTerminal(grid, sx, sy);
      const trans = terminal ? [] : transiciones(grid, sx, sy, E.accion, estocastico);
      dibujarMundo(api, grafica, c, grid, med, (x, y, tipo) => {
        const base = estiloBase(c, tipo);
        if (tipo === '#') return base;
        const activo = x === sx && y === sy;
        const dest = trans.find(t => t.x === x && t.y === y);
        return Object.assign(base, {
          contorno: activo ? c.acento : (dest ? c.suave : base.contorno),
          grosor: activo ? 2.6 : (dest ? 2 : 1),
          valorTexto: dest ? num(dest.prob * 100, 0) + ' %' : null,
          aria: `casilla (${x}, ${y}): ${tipo === '.' ? 'libre' : tipo}. Pulsa para elegir este estado.`,
          onClick: () => { E.sel = [x, y]; dibujar(); },
        });
      });
      if (terminal) {
        lectura.innerHTML = `<p>La casilla (${sx}, ${sy}) es <strong>terminal</strong>: el episodio acaba al entrar en ella, así que no hay acciones que tomar desde aquí.</p>`;
      } else {
        const filas = trans.map(t => `<tr><td>(${t.x}, ${t.y})</td><td>${num(t.prob * 100, 0)} %</td><td>${num(recompensa(grid, t.x, t.y, recompensaPaso), 2)}</td></tr>`).join('');
        lectura.innerHTML = `<p>Desde (${sx}, ${sy}), la acción <strong>${ACCIONES[E.accion].nombre}</strong> puede llevar a:</p>` +
          `<div class="tabla-scroll"><table class="motor-tabla"><thead><tr><th>Estado siguiente</th><th>Probabilidad</th><th>Recompensa</th></tr></thead><tbody>${filas}</tbody></table></div>` +
          (estocastico ? `<p>Con probabilidad de resbalar del ${num(estocastico * 100, 0)} %, la acción no siempre lleva a la casilla prevista: la mitad de las veces que resbala va a un lado, la otra mitad al otro.</p>`
            : '<p>Este mundo es determinista: la acción siempre lleva a la casilla prevista (o te deja donde estabas si hay un muro o el borde).</p>');
      }
    }
    dibujar();
    return { redibujar: dibujar };
  };

  // ───────────────────────── valores: V(s) e iteración de valores ya convergida ─────────────────────────
  MODOS.valores = function (el, p, api) {
    const H = api.html, num = api.num;
    const grid = analizarMapa(p.mapa);
    const key = (x, y) => x + ',' + y;
    const estocastico = p.estocastico || 0;
    const recompensaPaso = p.recompensa_paso != null ? p.recompensa_paso : 0;
    const E = { gamma: p.gamma != null ? p.gamma : 0.9, vista: 'ambas' };
    let R;
    function calcular() { R = valorIteracion(grid, E.gamma, estocastico, recompensaPaso, 500); R.politica = politicaGreedy(grid, R.V, E.gamma, estocastico, recompensaPaso); }
    calcular();

    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, lectura, controles);
    controles.append(api.slider({ etiqueta: 'γ (factor de descuento)', min: 0.5, max: 0.99, paso: 0.01, valor: E.gamma, alCambiar: v => { E.gamma = v; calcular(); dibujar(); } }));
    const grupo = H('div', { class: 'motor-selector', role: 'group', 'aria-label': 'Qué mostrar' });
    [['valores', 'Solo V(s)'], ['politica', 'Solo política'], ['ambas', 'V(s) y política']].forEach(([v, etq]) => { const b = api.boton(etq, () => { E.vista = v; marcar(); dibujar(); }); b.dataset.v = v; grupo.append(b); });
    function marcar() { grupo.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === E.vista))); }
    controles.append(grupo);
    marcar();

    function dibujar() {
      const c = api.colores();
      const med = medidas(el, grid);
      const vs = grid.estados.map(([x, y]) => R.V[key(x, y)]);
      const mn = Math.min(...vs), mx = Math.max(0.001, ...vs), span = (mx - mn) || 1;
      dibujarMundo(api, grafica, c, grid, med, (x, y, tipo) => {
        const base = estiloBase(c, tipo);
        if (tipo === '#') return base;
        const v = R.V[key(x, y)], t = (v - mn) / span, terminal = esTerminal(grid, x, y);
        const out = Object.assign({}, base, { aria: `casilla (${x}, ${y}): V = ${num(v, 2)}` });
        if (E.vista !== 'politica') { out.fill = mezcla(c.superficie, c.acento, 0.1 + 0.7 * Math.max(0, t)); out.valorTexto = num(v, 2); }
        if (E.vista !== 'valores' && !terminal) out.flecha = R.politica[key(x, y)];
        return out;
      });
      lectura.innerHTML = `<p>Valores calculados con iteración de valores hasta converger (γ = ${num(E.gamma, 2)}, ${R.iteraciones} barridas). El color indica V(s): cuanto más intenso, más valor se espera obtener desde esa casilla siguiendo la mejor política; las flechas son esa política.</p>`;
    }
    dibujar();
    return { redibujar: dibujar };
  };

  // ───────────── Registro y carga de los modos en archivo aparte ─────────────
  Motores.registrar('rejilla', function (el, p, api) {
    analizarMapa(p.mapa); // valida pronto, con el mismo mensaje de error en todos los modos
    if (MODOS[p.modo]) return MODOS[p.modo](el, p, api);
    let inst = null;
    const s = document.createElement('script');
    s.src = BASE + 'rejilla-' + encodeURIComponent(p.modo) + '.js';
    const fallo = (e) => { console.error('[motor rejilla]', e); el.innerHTML = ''; el.append(api.html('p', { class: 'motor-error', role: 'alert', text: 'El interactivo no se pudo cargar.' })); };
    s.onload = () => { try { if (!MODOS[p.modo]) throw new Error(`Modo "${p.modo}" no registrado`); inst = MODOS[p.modo](el, p, api); } catch (e) { fallo(e); } };
    s.onerror = () => fallo(new Error(`No se pudo cargar rejilla-${p.modo}.js`));
    document.head.appendChild(s);
    return { redibujar: () => inst && inst.redibujar && inst.redibujar(), destruir: () => inst && inst.destruir && inst.destruir() };
  }, {
    ejemplos: {
      busqueda: { modo: 'busqueda', mapa: ['S....', '.###.', '.#X..', '.#.#.', '....G'] },
      mdp: { modo: 'mdp', mapa: ['S....', '.###.', '.#X..', '.#.#.', '....G'], gamma: 0.9, estocastico: 0.2, recompensa_paso: -0.02 },
      valores: { modo: 'valores', mapa: ['S....', '.###.', '.#X..', '.#.#.', '....G'], gamma: 0.9, estocastico: 0.2, recompensa_paso: -0.02 },
      'iteracion-valores': { modo: 'iteracion-valores', mapa: ['S....', '.###.', '.#X..', '.#.#.', '....G'], gamma: 0.9, estocastico: 0.2, recompensa_paso: -0.02 },
      'monte-carlo': { modo: 'monte-carlo', mapa: ['S....', '.###.', '.#X..', '.#.#.', '....G'], gamma: 0.9, epsilon: 0.2, recompensa_paso: -0.02, semilla: 7 },
      td0: { modo: 'td0', mapa: ['S....', '.###.', '.#X..', '.#.#.', '....G'], gamma: 0.9, alpha: 0.3, recompensa_paso: -0.02, semilla: 4 },
      'sarsa-qlearning': { modo: 'sarsa-qlearning', mapa: ['......', '......', '......', 'SCCCCG'], gamma: 0.95, alpha: 0.5, epsilon: 0.15, recompensa_paso: -1, semilla: 9 },
    },
  });
})();
