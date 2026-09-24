// @modos: perceptron, xor, forward, backprop
// Motor "red": red neuronal pequeña dibujada con sus valores. Pesos por transición i: pesos[i] = {W, b},
// W de forma (capas[i+1] x capas[i]): W[j][k] = peso de la neurona k de la capa i a la neurona j de la capa i+1.
(function () {
  'use strict';

  const ACTIV = {
    sigmoide: { f: z => 1 / (1 + Math.exp(-z)), d: a => a * (1 - a), nombre: 'sigmoide' },
    tanh: { f: z => Math.tanh(z), d: a => 1 - a * a, nombre: 'tanh' },
    relu: { f: z => Math.max(0, z), d: a => (a > 0 ? 1 : 0), nombre: 'ReLU' },
    escalon: { f: z => (z >= 0 ? 1 : 0), d: () => 0, nombre: 'escalón' },
  };
  function activ(nombre) { return ACTIV[nombre] || ACTIV.sigmoide; }

  // Pesos reproducibles cuando la ficha no los da explícitamente.
  function pesosPorDefecto(capas, api) {
    const r = api.aleatorio(7);
    const pesos = [];
    for (let i = 0; i < capas.length - 1; i++) {
      const W = [], b = [];
      for (let j = 0; j < capas[i + 1]; j++) {
        const fila = [];
        for (let k = 0; k < capas[i]; k++) fila.push(Math.round((r() * 2.4 - 1.2) * 100) / 100);
        W.push(fila);
        b.push(Math.round((r() * 1.4 - 0.7) * 100) / 100);
      }
      pesos.push({ W, b });
    }
    return pesos;
  }

  function propagar(capas, pesos, act, entrada) {
    const acts = [entrada.slice()];
    const zs = [null];
    for (let i = 0; i < capas.length - 1; i++) {
      const { W, b } = pesos[i];
      const zcapa = [], acapa = [];
      for (let j = 0; j < capas[i + 1]; j++) {
        let z = b[j];
        for (let k = 0; k < capas[i]; k++) z += W[j][k] * acts[i][k];
        zcapa.push(z);
        acapa.push(act.f(z));
      }
      zs.push(zcapa);
      acts.push(acapa);
    }
    return { acts, zs };
  }

  // Retropropagación analítica con pérdida MSE ½Σ(a−y)². deltas[i] = dL/dz de la capa i (deltas[0] no se usa).
  function retropropagar(capas, pesos, act, acts, objetivo) {
    const L = capas.length - 1;
    const deltas = new Array(capas.length).fill(null);
    deltas[L] = acts[L].map((a, j) => (a - objetivo[j]) * act.d(a));
    for (let i = L - 1; i >= 1; i--) {
      const dCapa = new Array(capas[i]).fill(0);
      for (let k = 0; k < capas[i]; k++) {
        let suma = 0;
        for (let j = 0; j < capas[i + 1]; j++) suma += pesos[i].W[j][k] * deltas[i + 1][j];
        dCapa[k] = suma * act.d(acts[i][k]);
      }
      deltas[i] = dCapa;
    }
    const grad = [];
    for (let i = 0; i < capas.length - 1; i++) {
      grad.push({ dW: deltas[i + 1].map(dj => acts[i].map(ak => dj * ak)), db: deltas[i + 1].slice() });
    }
    return { deltas, grad };
  }

  function perdida(acts, capas, objetivo) {
    const L = capas.length - 1;
    let s = 0;
    for (let j = 0; j < capas[L]; j++) s += Math.pow(acts[L][j] - objetivo[j], 2);
    return 0.5 * s;
  }

  // ───────────── Dibujo de la red (compartido por los cuatro modos) ─────────────
  function tamaño(el, capas) {
    const ancho = Math.max(280, Math.min(el.clientWidth || 560, 600));
    const maxN = Math.max(...capas);
    const alto = Math.max(190, Math.min(58 * maxN + 40, 320));
    return { ancho, alto };
  }
  function layout(capas, ancho, alto) {
    const n = capas.length, mx = 44;
    const xs = capas.map((_, i) => (n === 1 ? ancho / 2 : mx + i * (ancho - 2 * mx) / (n - 1)));
    return capas.map((cnt, i) => {
      const ys = [];
      for (let j = 0; j < cnt; j++) ys.push(alto * (j + 1) / (cnt + 1));
      return ys.map(y => [xs[i], y]);
    });
  }
  // matriz(i) → matriz a visualizar como aristas de la transición i (pesos o gradientes). opts.valorNodo(i, j) → texto o null.
  function dibujarRed(api, s, c, capas, pos, matriz, opts) {
    const g = api.el('g', {}, s);
    for (let i = 0; i < capas.length - 1; i++) {
      const M = matriz(i);
      const maxAbs = Math.max(1e-6, ...M.flat().map(Math.abs));
      for (let j = 0; j < capas[i + 1]; j++) {
        for (let k = 0; k < capas[i]; k++) {
          const v = M[j][k], t = Math.min(1, Math.abs(v) / maxAbs);
          const [x0, y0] = pos[i][k], [x1, y1] = pos[i + 1][j];
          api.el('line', { x1: x0, y1: y0, x2: x1, y2: y1, stroke: v >= 0 ? c.acento : c.mal, 'stroke-width': 1 + 3 * t, opacity: 0.3 + 0.6 * t }, g);
        }
      }
    }
    const radio = opts.radio || 18;
    capas.forEach((n, i) => {
      pos[i].forEach(([x, y], j) => {
        const activo = opts.resaltado && opts.resaltado(i, j);
        api.el('circle', { cx: x, cy: y, r: radio, fill: c.superficie, stroke: activo ? c.acento : c.suave, 'stroke-width': activo ? 3 : 1.4 }, g);
        const val = opts.valorNodo ? opts.valorNodo(i, j) : null;
        api.el('text', { x, y: y + 4, 'text-anchor': 'middle', 'font-size': val !== null && val !== undefined ? 11 : 12, 'font-weight': 700, fill: val !== null && val !== undefined ? c.texto : c.suave, text: val !== null && val !== undefined ? val : '?' }, g);
        if (opts.etiquetaNodo) {
          const et = opts.etiquetaNodo(i, j);
          if (et) api.el('text', { x, y: y - radio - 6, 'text-anchor': 'middle', 'font-size': 10, fill: c.suave, text: et }, g);
        }
      });
    });
  }
  function radioDe(alto, capas) { return Math.min(20, Math.max(11, alto / (Math.max(...capas) * 2.6))); }
  function etiquetaCapa(capas) {
    return (i, j) => (i === 0 ? `x${j + 1}` : i === capas.length - 1 ? `y${capas[i] > 1 ? j + 1 : ''}` : `h${j + 1}`);
  }

  // ───────────────────────── perceptron ─────────────────────────
  function modoPerceptron(el, p, api) {
    const H = api.html, num = api.num;
    const capas = p.capas;
    if (capas.length !== 2 || capas[1] !== 1) throw new Error('El modo perceptron necesita capas [n, 1]');
    const nombreAct = p.activacion || 'escalon';
    const act = activ(nombreAct);
    const pesos = p.pesos ? JSON.parse(JSON.stringify(p.pesos)) : pesosPorDefecto(capas, api);
    const entrada = (p.entrada || new Array(capas[0]).fill(0.5)).slice();

    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, lectura, controles);

    entrada.forEach((v, k) => controles.append(api.slider({ etiqueta: `x${k + 1}`, min: -2, max: 2, paso: 0.1, valor: v, alCambiar: val => { entrada[k] = val; dibujar(); } })));
    for (let k = 0; k < capas[0]; k++) {
      controles.append(api.slider({ etiqueta: `w${k + 1}`, min: -3, max: 3, paso: 0.1, valor: pesos[0].W[0][k], alCambiar: val => { pesos[0].W[0][k] = val; dibujar(); } }));
    }
    controles.append(api.slider({ etiqueta: 'b', min: -3, max: 3, paso: 0.1, valor: pesos[0].b[0], alCambiar: val => { pesos[0].b[0] = val; dibujar(); } }));
    controles.append(api.boton('Reiniciar', () => { Motores.desmontar(el); Motores.montar(el, 'red', JSON.parse(JSON.stringify(p))); }));

    function dibujar() {
      const c = api.colores();
      grafica.innerHTML = '';
      const dim = tamaño(el, capas);
      const s = api.svg(dim.ancho, dim.alto);
      grafica.append(s);
      const pos = layout(capas, dim.ancho, dim.alto);
      const { acts, zs } = propagar(capas, pesos, act, entrada);
      dibujarRed(api, s, c, capas, pos, i => pesos[i].W, {
        radio: radioDe(dim.alto, capas),
        valorNodo: (i, j) => num(acts[i][j], 2),
        etiquetaNodo: etiquetaCapa(capas),
      });
      const terminos = entrada.map((x, k) => `${num(pesos[0].W[0][k], 2)}·${num(x, 2)}`).join(' + ');
      lectura.innerHTML = `<p>z = ${terminos} + ${num(pesos[0].b[0], 2)} = <strong>${num(zs[1][0], 3)}</strong></p>` +
        `<p>salida = ${act.nombre}(z) = <strong>${num(acts[1][0], 3)}</strong></p>`;
      s.setAttribute('role', 'img');
      s.setAttribute('aria-label', `Perceptrón: z = ${num(zs[1][0], 3)}, salida = ${num(acts[1][0], 3)}.`);
    }
    dibujar();
    return { redibujar: dibujar };
  }

  // ───────────────────────── xor ─────────────────────────
  function modoXOR(el, p, api) {
    const H = api.html, num = api.num;
    const capas = p.capas;
    if (capas[0] !== 2) throw new Error('El modo xor necesita capas con 2 entradas');
    const nombreAct = p.activacion || 'sigmoide';
    const act = activ(nombreAct);
    const pesos = p.pesos ? JSON.parse(JSON.stringify(p.pesos)) : pesosPorDefecto(capas, api);
    const E = { entrada: (p.entrada || [0, 0]).slice() };

    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const tablaEnv = H('div', {});
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, lectura, tablaEnv, controles);

    const combos = [[0, 0], [0, 1], [1, 0], [1, 1]];
    const grupo = H('div', { class: 'motor-selector', role: 'group', 'aria-label': 'Elegir entrada' });
    combos.forEach(([a, b]) => {
      const boton = api.boton(`(${a}, ${b})`, () => { E.entrada = [a, b]; marcar(); dibujar(); });
      boton.dataset.a = a; boton.dataset.b = b;
      grupo.append(boton);
    });
    function marcar() { grupo.querySelectorAll('button').forEach(bt => bt.setAttribute('aria-pressed', String(Number(bt.dataset.a) === E.entrada[0] && Number(bt.dataset.b) === E.entrada[1]))); }
    marcar();
    controles.append(grupo);

    function dibujar() {
      const c = api.colores();
      grafica.innerHTML = '';
      const dim = tamaño(el, capas);
      const s = api.svg(dim.ancho, dim.alto);
      grafica.append(s);
      const pos = layout(capas, dim.ancho, dim.alto);
      const { acts } = propagar(capas, pesos, act, E.entrada);
      dibujarRed(api, s, c, capas, pos, i => pesos[i].W, {
        radio: radioDe(dim.alto, capas),
        valorNodo: (i, j) => num(acts[i][j], 2),
        etiquetaNodo: etiquetaCapa(capas),
      });
      const salida = acts[capas.length - 1][0];
      const pred = salida >= 0.5 ? 1 : 0;
      const real = E.entrada[0] !== E.entrada[1] ? 1 : 0;
      const ok = pred === real;
      lectura.innerHTML = `<p>Entrada (${E.entrada[0]}, ${E.entrada[1]}) → salida = ${num(salida, 3)} → predicción <strong>${pred}</strong> ` +
        `(<span style="color:${ok ? c.bien : c.mal}">${ok ? 'correcto' : 'incorrecto'}</span>, XOR real = ${real}).</p>` +
        `<p>Ninguna neurona oculta por separado resuelve XOR; juntas, sí: la capa oculta traza dos fronteras lineales que la salida combina.</p>`;
      tablaEnv.innerHTML = '';
      const t = H('table', { class: 'motor-tabla' });
      t.append(H('thead', {}, H('tr', {}, H('th', { text: 'x1' }), H('th', { text: 'x2' }), H('th', { text: 'XOR' }), H('th', { text: 'red' }))));
      const tbody = H('tbody');
      combos.forEach(([a, b]) => {
        const { acts: ac } = propagar(capas, pesos, act, [a, b]);
        const s2 = ac[capas.length - 1][0], p2 = s2 >= 0.5 ? 1 : 0, r2 = a !== b ? 1 : 0;
        tbody.append(H('tr', {}, H('th', { scope: 'row', text: String(a) }), H('td', { text: String(b) }), H('td', { text: String(r2) }), H('td', { text: String(p2), style: `color:${p2 === r2 ? c.bien : c.mal}` })));
      });
      t.append(tbody);
      tablaEnv.append(t);
      s.setAttribute('role', 'img');
      s.setAttribute('aria-label', `Red para XOR con entrada (${E.entrada[0]}, ${E.entrada[1]}), salida ${num(salida, 3)}.`);
    }
    dibujar();
    return { redibujar: dibujar };
  }

  // ───────────────────────── forward ─────────────────────────
  function modoForward(el, p, api) {
    const H = api.html, num = api.num;
    const capas = p.capas;
    const nombreAct = p.activacion || 'relu';
    const act = activ(nombreAct);
    const pesos = p.pesos ? JSON.parse(JSON.stringify(p.pesos)) : pesosPorDefecto(capas, api);
    const entrada = (p.entrada || new Array(capas[0]).fill(0.5)).slice();
    const { acts, zs } = propagar(capas, pesos, act, entrada);
    const L = capas.length - 1;
    const E = { capa: 0 };

    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, lectura, controles);

    const bPaso = api.boton('Paso →', () => { if (E.capa < L) { E.capa++; dibujar(); } }, { class: 'boton boton-principal' });
    const bFinal = api.boton('Hasta el final', () => { E.capa = L; dibujar(); });
    controles.append(bPaso, bFinal, api.boton('Reiniciar', () => { E.capa = 0; dibujar(); }));

    function dibujar() {
      const c = api.colores();
      grafica.innerHTML = '';
      const dim = tamaño(el, capas);
      const s = api.svg(dim.ancho, dim.alto);
      grafica.append(s);
      const pos = layout(capas, dim.ancho, dim.alto);
      dibujarRed(api, s, c, capas, pos, i => pesos[i].W, {
        radio: radioDe(dim.alto, capas),
        resaltado: (i) => i === E.capa,
        valorNodo: (i, j) => (i <= E.capa ? num(acts[i][j], 2) : null),
        etiquetaNodo: etiquetaCapa(capas),
      });
      let texto;
      if (E.capa === 0) texto = `<p>Capa de entrada: ${entrada.map((x, k) => `x${k + 1} = ${num(x, 2)}`).join(', ')}.</p>`;
      else {
        const det = [];
        for (let j = 0; j < capas[E.capa]; j++) {
          const terminos = acts[E.capa - 1].map((a, k) => `${num(pesos[E.capa - 1].W[j][k], 2)}·${num(a, 2)}`).join(' + ');
          det.push(`z${j + 1} = ${terminos} + ${num(pesos[E.capa - 1].b[j], 2)} = ${num(zs[E.capa][j], 3)} → a${j + 1} = ${act.nombre}(z${j + 1}) = ${num(acts[E.capa][j], 3)}`);
        }
        texto = `<p>Capa ${E.capa}${E.capa === L ? ' (salida)' : ''}:</p>` + det.map(t2 => `<p>${t2}</p>`).join('');
      }
      lectura.innerHTML = texto;
      bPaso.disabled = E.capa >= L;
      bFinal.disabled = bPaso.disabled;
      s.setAttribute('role', 'img');
      s.setAttribute('aria-label', `Propagación hacia delante, capa ${E.capa} de ${L}.`);
    }
    dibujar();
    return { redibujar: dibujar };
  }

  // ───────────────────────── backprop ─────────────────────────
  function modoBackprop(el, p, api) {
    const H = api.html, num = api.num;
    const capas = p.capas;
    const nombreAct = p.activacion || 'sigmoide';
    const act = activ(nombreAct);
    if (!p.objetivo) throw new Error('El modo backprop necesita "objetivo"');
    const objetivo = p.objetivo.slice();
    const pesosIni = p.pesos ? JSON.parse(JSON.stringify(p.pesos)) : pesosPorDefecto(capas, api);
    const entrada = (p.entrada || new Array(capas[0]).fill(0.5)).slice();
    const L = capas.length - 1;
    const LR = 0.3;
    let pesos = JSON.parse(JSON.stringify(pesosIni));
    let E = { capa: 0, fase: 'adelante', deltaCapa: L + 1 };
    let ultimo = null;

    function calcular() {
      const { acts, zs } = propagar(capas, pesos, act, entrada);
      const { deltas, grad } = retropropagar(capas, pesos, act, acts, objetivo);
      ultimo = { acts, zs, deltas, grad };
    }
    calcular();

    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, lectura, controles);

    const bPaso = api.boton('Paso →', paso, { class: 'boton boton-principal' });
    const bAplicar = api.boton('Aplicar un paso de descenso', aplicar);
    controles.append(bPaso, bAplicar, api.boton('Reiniciar', reiniciar));

    function paso() {
      if (E.fase === 'adelante') {
        if (E.capa < L) E.capa++;
        else { E.fase = 'atras'; E.deltaCapa = L; }
      } else if (E.fase === 'atras') {
        if (E.deltaCapa > 1) E.deltaCapa--;
        else E.fase = 'listo';
      }
      dibujar();
    }
    function aplicar() {
      if (E.fase !== 'listo') return;
      for (let i = 0; i < pesos.length; i++) {
        for (let j = 0; j < pesos[i].W.length; j++) {
          for (let k = 0; k < pesos[i].W[j].length; k++) pesos[i].W[j][k] -= LR * ultimo.grad[i].dW[j][k];
          pesos[i].b[j] -= LR * ultimo.grad[i].db[j];
        }
      }
      calcular();
      E = { capa: L, fase: 'listo', deltaCapa: 1 };
      dibujar();
    }
    function reiniciar() { pesos = JSON.parse(JSON.stringify(pesosIni)); calcular(); E = { capa: 0, fase: 'adelante', deltaCapa: L + 1 }; dibujar(); }

    function dibujar() {
      const c = api.colores();
      grafica.innerHTML = '';
      const dim = tamaño(el, capas);
      const s = api.svg(dim.ancho, dim.alto);
      grafica.append(s);
      const pos = layout(capas, dim.ancho, dim.alto);
      const enBack = E.fase !== 'adelante';
      dibujarRed(api, s, c, capas, pos,
        i => (enBack && i + 1 >= E.deltaCapa ? ultimo.grad[i].dW : pesos[i].W),
        {
          radio: radioDe(dim.alto, capas),
          resaltado: (i) => (E.fase === 'adelante' ? i === E.capa : i === E.deltaCapa),
          valorNodo: (i, j) => (E.fase === 'adelante' && i > E.capa ? null : num(ultimo.acts[i][j], 2)),
          etiquetaNodo: etiquetaCapa(capas),
        });
      let texto = '';
      if (E.fase === 'adelante') {
        if (E.capa === 0) texto = `<p>Entrada: ${entrada.map((x, k) => `x${k + 1}=${num(x, 2)}`).join(', ')}. Objetivo: ${objetivo.map((y, k) => `y${k + 1}=${num(y, 2)}`).join(', ')}.</p>`;
        else {
          const det = [];
          for (let j = 0; j < capas[E.capa]; j++) det.push(`a${j + 1} = ${act.nombre}(z${j + 1}) = ${num(ultimo.acts[E.capa][j], 3)}`);
          texto = `<p>Propagación hacia delante, capa ${E.capa}: ${det.join(' · ')}</p>`;
          if (E.capa === L) texto += `<p>Pérdida (½Σ(a−y)²) = <strong>${num(perdida(ultimo.acts, capas, objetivo), 4)}</strong>. Pulsa «Paso →» para retropropagar.</p>`;
        }
      } else if (E.fase === 'atras') {
        const det = [];
        for (let j = 0; j < capas[E.deltaCapa]; j++) det.push(`δ${j + 1} = ${num(ultimo.deltas[E.deltaCapa][j], 4)}`);
        texto = `<p>Retropropagación, capa ${E.deltaCapa}: ${det.join(' · ')} (cuánto debe cambiar cada neurona para reducir la pérdida).</p>`;
      } else {
        texto = `<p>Gradientes listos: ∂L/∂w = δ de la capa siguiente · activación de la capa anterior. Pulsa «Aplicar un paso de descenso» (η = ${num(LR, 2)}).</p>` +
          `<p>Pérdida actual = <strong>${num(perdida(ultimo.acts, capas, objetivo), 4)}</strong>.</p>`;
      }
      lectura.innerHTML = texto;
      bPaso.disabled = E.fase === 'listo';
      bAplicar.disabled = E.fase !== 'listo';
      s.setAttribute('role', 'img');
      s.setAttribute('aria-label', 'Retropropagación paso a paso.');
    }
    dibujar();
    return { redibujar: dibujar };
  }

  Motores.registrar('red', function (el, p, api) {
    if (!Array.isArray(p.capas) || p.capas.length < 2) throw new Error('red necesita "capas" con al menos 2 valores');
    const modo = p.modo;
    if (modo === 'perceptron') return modoPerceptron(el, p, api);
    if (modo === 'xor') return modoXOR(el, p, api);
    if (modo === 'forward') return modoForward(el, p, api);
    if (modo === 'backprop') return modoBackprop(el, p, api);
    throw new Error('Modo desconocido: ' + modo);
  }, {
    ejemplos: {
      perceptron: { modo: 'perceptron', capas: [2, 1], activacion: 'escalon', pesos: [{ W: [[1, 1]], b: [-1.5] }], entrada: [1, 1] },
      xor: { modo: 'xor', capas: [2, 2, 1], activacion: 'sigmoide', pesos: [{ W: [[20, 20], [20, 20]], b: [-10, -30] }, { W: [[20, -20]], b: [-10] }], entrada: [0, 0] },
      forward: { modo: 'forward', capas: [3, 4, 2], activacion: 'relu', entrada: [0.5, -0.3, 0.8] },
      backprop: { modo: 'backprop', capas: [2, 2, 1], activacion: 'sigmoide', entrada: [1, 0], objetivo: [1] },
    },
  });
})();
