// @modos: pi, intervalos, bandido, policy-gradient
// Motor "simulacion": experimentos aleatorios con semilla fija (Monte Carlo, intervalos de confianza,
// bandido multibrazo y gradiente de la política).
(function () {
  'use strict';

  // Aproximación de Acklam para la inversa de la normal estándar (suficiente para z de confianza).
  function invNorm(p) {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    const plow = 0.02425, phigh = 1 - plow;
    let q, r;
    if (p < plow) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    if (p <= phigh) {
      q = p - 0.5; r = q * q;
      return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    }
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  // Estructura común: gráficos arriba; lectura y controles debajo (§8b).
  function armazon(el, api) {
    const H = api.html, Z = api.zonas(el);
    const grafica = H('div', { class: 'motor-grafica' }), grafica2 = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' }), controles = H('div', { class: 'motor-controles' });
    Z.grafico.append(grafica, grafica2);
    Z.controles.append(lectura, controles);
    return { grafica, grafica2, lectura, controles };
  }
  // Botones grandes «Ejecutar ×1 / ×10 / ×100»: ejecutan `unidad` repeticiones cada vez por el factor.
  function botonesEjecutar(api, unidad, palabra, ejecutar) {
    const grupo = api.html('div', { class: 'motor-selector', role: 'group', 'aria-label': 'Ejecutar el experimento' });
    [1, 10, 100].forEach((k, i) => grupo.append(api.boton('Ejecutar ×' + k, () => ejecutar(unidad * k),
      { class: 'boton' + (i === 0 ? ' boton-principal' : ''), 'aria-label': `Ejecutar ×${k}: ${api.num(unidad * k, 0)} ${palabra}` })));
    return grupo;
  }
  const reiniciar = (el, p, api, antes) => api.boton('Reiniciar', () => { if (antes) antes(); Motores.desmontar(el); Motores.montar(el, 'simulacion', JSON.parse(JSON.stringify(p))); });

  // Serie temporal pequeña (una polilínea) con eje y de 0 a 1 o del rango dado.
  function serie(api, cont, c, W, H2, ys, xMax, yMin, yMax, ref, refTxt) {
    cont.innerHTML = '';
    const s = api.svg(W, H2); s.setAttribute('role', 'img'); cont.append(s);
    const F = api.fuente(s, 12);
    const caja = { l: 44, r: W - 12, t: 12, b: H2 - 22 };
    const X = api.escala(0, Math.max(10, xMax), caja.l, caja.r), Y = api.escala(yMin, yMax, caja.b, caja.t);
    api.marcas(yMin, yMax, Math.max(2, Math.round((caja.b - caja.t) / 40))).forEach(v => {
      api.el('line', { x1: caja.l, x2: caja.r, y1: Y(v), y2: Y(v), stroke: c.rejilla }, s);
      api.el('text', { x: caja.l - 5, y: Y(v) + 4, 'text-anchor': 'end', 'font-size': F, fill: c.suave, text: api.num(v, 2) }, s);
    });
    if (ref != null) {
      api.el('line', { x1: caja.l, x2: caja.r, y1: Y(ref), y2: Y(ref), stroke: c.mal, 'stroke-dasharray': '4 3' }, s);
      api.el('text', { x: caja.r, y: Y(ref) - 5, 'text-anchor': 'end', 'font-size': F, fill: c.mal, text: refTxt }, s);
    }
    api.el('polyline', { points: ys.map((v, i) => X(i + 1) + ',' + Y(v)).join(' '), fill: 'none', stroke: c.acento, 'stroke-width': 2 }, s);
    api.el('text', { x: caja.r, y: H2 - 5, 'text-anchor': 'end', 'font-size': F, fill: c.suave, text: 'nº de repeticiones →' }, s);
    return s;
  }

  // ───────────────────────── pi: Monte Carlo ─────────────────────────
  function modoPi(el, p, api) {
    const num = api.num;
    const cfg = p.config || {};
    const r = api.aleatorio(p.semilla != null ? p.semilla : 7);
    const lote = cfg.n || 200;
    const E = { n: 0, dentro: 0, historial: [], ultimos: [] };

    const { grafica, grafica2, lectura, controles } = armazon(el, api);
    const canvas = api.html('canvas', { style: 'display:block;margin:0 auto' }); grafica.append(canvas);

    function lanzar(cuantos) {
      for (let k = 0; k < cuantos; k++) {
        const x = r() * 2 - 1, y = r() * 2 - 1;
        E.n++; if (x * x + y * y <= 1) E.dentro++;
        E.ultimos.push([x, y]);
        if (E.ultimos.length > 2000) E.ultimos.shift();
      }
      E.historial.push({ n: E.n, estim: 4 * E.dentro / E.n });
      if (E.historial.length > 400) E.historial.shift();
    }
    lanzar(lote);

    controles.append(botonesEjecutar(api, lote, 'puntos', (n) => { lanzar(n); dibujar(); }), reiniciar(el, p, api));

    function dibujar() {
      const c = api.colores();
      const W = api.medida(grafica, { maxAncho: 420, minAncho: 240 }).ancho;
      const ctx = api.lienzoNitido(canvas, W, W);
      ctx.clearRect(0, 0, W, W);
      const cx = W / 2, cy = W / 2, rad = W / 2 - 4;
      ctx.strokeStyle = c.linea; ctx.strokeRect(4, 4, W - 8, W - 8);
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 2 * Math.PI); ctx.strokeStyle = c.acento; ctx.stroke();
      E.ultimos.forEach(([x, y]) => {
        ctx.fillStyle = x * x + y * y <= 1 ? c.series[0] : c.suave;
        ctx.beginPath(); ctx.arc(cx + x * rad, cy - y * rad, 1.8, 0, 2 * Math.PI); ctx.fill();
      });
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', 'Puntos al azar en un cuadrado; los que caen dentro del círculo cuentan para estimar π.');

      const W2 = api.medida(grafica2, { maxAncho: 640 }).ancho;
      const yMin = Math.min(2.6, ...E.historial.map(h => h.estim)), yMax = Math.max(3.6, ...E.historial.map(h => h.estim));
      const s = serie(api, grafica2, c, W2, 150, E.historial.map(h => h.estim), E.historial.length, yMin, yMax, Math.PI, 'π');
      s.setAttribute('aria-label', 'Estimación de π tras cada tanda de puntos');

      const estim = 4 * E.dentro / E.n;
      lectura.innerHTML = `<p>Con <strong>${num(E.n, 0)}</strong> puntos, ${num(E.dentro, 0)} cayeron dentro del círculo → 4 × ${E.dentro}/${E.n} = <strong>${num(estim, 4)}</strong> (error ${num(Math.abs(estim - Math.PI), 4)} frente a π ≈ ${num(Math.PI, 4)}).</p>` +
        `<p>Cuantos más puntos lanzas, más se acerca la estimación a π, pero cada vez cuesta más reducir el error. Cada pulsación de «Ejecutar ×1» lanza ${num(lote, 0)} puntos.</p>`;
    }
    dibujar();
    return { redibujar: dibujar };
  }

  // ───────────────────────── intervalos de confianza ─────────────────────────
  function modoIntervalos(el, p, api) {
    const H = api.html, num = api.num;
    const cfg = p.config || {};
    const E = {
      mu: cfg.mu != null ? cfg.mu : 50, sigma: cfg.sigma != null ? cfg.sigma : 10,
      n: cfg.n || 30, confianza: cfg.confianza || 0.95, m: cfg.m || 100,
      semilla: p.semilla != null ? p.semilla : 3, sel: -1,
    };

    const { grafica, grafica2, lectura, controles } = armazon(el, api);
    grafica2.remove();
    const detalle = H('p', { class: 'motor-lectura', 'aria-live': 'polite', text: 'Toca una línea del gráfico para ver ese intervalo.' });

    controles.append(api.slider({ etiqueta: 'tamaño de muestra n', min: 5, max: 100, paso: 5, valor: E.n, alCambiar: v => { E.n = v; E.sel = -1; generar(); dibujar(); } }));
    const grupo = api.segmentado([0.90, 0.95, 0.99].map(v => ({ valor: v, texto: num(v * 100, 0) + ' %' })),
      { valor: E.confianza, titulo: 'Confianza', etiqueta: 'Nivel de confianza', alCambiar: v => { E.confianza = v; dibujar(); } });
    controles.append(grupo, api.boton(`Sacar otras ${E.m} muestras`, () => { E.semilla++; E.sel = -1; generar(); dibujar(); }, { class: 'boton boton-principal' }));

    let muestras = [];
    function generar() {
      const r = api.aleatorio(E.semilla);
      muestras = [];
      for (let s = 0; s < E.m; s++) {
        const vals = []; for (let i = 0; i < E.n; i++) vals.push(r.normal(E.mu, E.sigma));
        const media = vals.reduce((a, b) => a + b, 0) / E.n;
        const de = Math.sqrt(vals.reduce((a, v) => a + (v - media) ** 2, 0) / (E.n - 1));
        muestras.push({ media, de });
      }
    }
    generar();

    function dibujar() {
      const c = api.colores();
      const z = invNorm((1 + E.confianza) / 2);
      const W = api.medida(grafica, { maxAncho: 760 }).ancho;
      const filaAlto = 5, alto = E.m * filaAlto + 34;
      grafica.innerHTML = '';
      const s = api.svg(W, alto); s.setAttribute('role', 'group'); grafica.append(s);
      const F = api.fuente(s, 12);
      const caja = { l: 10, r: W - 10, t: 20, b: alto - 10 };
      const margenes = muestras.map(ms => [ms.media - z * ms.de / Math.sqrt(E.n), ms.media + z * ms.de / Math.sqrt(E.n)]);
      const lo = Math.min(E.mu - 3 * E.sigma / Math.sqrt(E.n), ...margenes.map(mm => mm[0]));
      const hi = Math.max(E.mu + 3 * E.sigma / Math.sqrt(E.n), ...margenes.map(mm => mm[1]));
      const X = api.escala(lo, hi, caja.l, caja.r);
      let cubre = 0;
      margenes.forEach(([a, b], i) => {
        const contieneMu = a <= E.mu && E.mu <= b;
        if (contieneMu) cubre++;
        const y = caja.t + i * filaAlto + filaAlto / 2;
        api.el('line', { x1: X(a), x2: X(b), y1: y, y2: y, stroke: contieneMu ? c.bien : c.mal, 'stroke-width': i === E.sel ? 4 : 2, 'stroke-opacity': E.sel >= 0 && i !== E.sel ? 0.45 : 1 }, s);
      });
      api.el('line', { x1: X(E.mu), x2: X(E.mu), y1: caja.t - 4, y2: caja.b, stroke: c.texto, 'stroke-width': 1.4, 'stroke-dasharray': '3 3' }, s);
      api.el('text', { x: X(E.mu) + 5, y: caja.t - 6, 'font-size': F, fill: c.texto, text: `μ = ${num(E.mu, 1)}` }, s);
      // Toque en el gráfico: elige el intervalo de esa fila (las filas son finas: se elige la más cercana).
      const capa = api.el('rect', { x: 0, y: 0, width: W, height: alto, fill: 'transparent' }, s);
      capa.style.cursor = 'pointer';
      capa.addEventListener('click', (e) => {
        const q = api.aSvg(s, { x: e.clientX, y: e.clientY });
        E.sel = Math.max(0, Math.min(E.m - 1, Math.floor((q.y - caja.t) / filaAlto)));
        dibujar();
      });
      lectura.innerHTML = `<p>De las <strong>${E.m}</strong> muestras de tamaño n = ${E.n}, <strong>${cubre}</strong> (${num(100 * cubre / E.m, 1)} %) de los intervalos del ${num(E.confianza * 100, 0)} % contienen la media real μ = ${num(E.mu, 1)} (línea vertical).</p>` +
        `<p>El ${num(E.confianza * 100, 0)} % de confianza no dice que "hay un ${num(E.confianza * 100, 0)} % de probabilidad de que μ esté en este intervalo": significa que, repitiendo el muestreo muchas veces, ese porcentaje de los intervalos contendría μ.</p>`;
      if (E.sel >= 0) {
        const [a, b] = margenes[E.sel], ok = a <= E.mu && E.mu <= b;
        detalle.textContent = `Muestra ${E.sel + 1}: media ${num(muestras[E.sel].media, 2)}, intervalo [${num(a, 2)}; ${num(b, 2)}] → ${ok ? 'contiene' : 'NO contiene'} μ.`;
      } else detalle.textContent = 'Toca una línea del gráfico para ver ese intervalo.';
      s.setAttribute('aria-label', 'Intervalos de confianza de muestras sucesivas, verdes los que contienen la media real.');
    }
    lectura.before(detalle);
    controles.append(reiniciar(el, p, api));
    dibujar();
    return { redibujar: dibujar };
  }

  // ───────────────────────── bandido multibrazo ─────────────────────────
  function modoBandido(el, p, api) {
    const num = api.num;
    const cfg = p.config || {};
    const brazos = cfg.brazos && cfg.brazos.length ? cfg.brazos : [0.2, 0.5, 0.7];
    const r = api.aleatorio(p.semilla != null ? p.semilla : 11);
    const E = { epsilon: cfg.epsilon != null ? cfg.epsilon : 0.1, Q: brazos.map(() => 0), N: brazos.map(() => 0), paso: 0, recompensaTotal: 0, historial: [] };

    const { grafica, grafica2, lectura, controles } = armazon(el, api);

    controles.append(
      api.slider({ etiqueta: 'ε (exploración)', min: 0, max: 1, paso: 0.02, valor: E.epsilon, alCambiar: v => { E.epsilon = v; } }),
      botonesEjecutar(api, 1, 'tiradas', (n) => { jugar(n); dibujar(); }),
      reiniciar(el, p, api),
    );

    function elegir() {
      if (r() < E.epsilon) return Math.floor(r() * brazos.length);
      let mejor = 0; for (let i = 1; i < brazos.length; i++) if (E.Q[i] > E.Q[mejor]) mejor = i;
      return mejor;
    }
    function jugar(veces) {
      for (let t = 0; t < veces; t++) {
        const a = elegir(), recompensa = r() < brazos[a] ? 1 : 0;
        E.N[a]++; E.Q[a] += (recompensa - E.Q[a]) / E.N[a];
        E.paso++; E.recompensaTotal += recompensa;
        E.historial.push(E.recompensaTotal / E.paso);
      }
    }
    jugar(1);

    function dibujar() {
      const c = api.colores();
      const W = api.medida(grafica, { maxAncho: 640 }).ancho;
      const filaAlto = 44, alto = brazos.length * filaAlto + 4;
      grafica.innerHTML = '';
      const s = api.svg(W, alto); s.setAttribute('role', 'group'); grafica.append(s);
      const F = api.fuente(s, 12);
      const L = 8, R = W - 12, X = api.escala(0, 1, L, R);
      const mejorReal = Math.max(...brazos), mejorEstim = E.Q.indexOf(Math.max(...E.Q));
      brazos.forEach((pr, i) => {
        const y = 2 + i * filaAlto;
        api.el('text', { x: L, y: y + 14, 'font-size': F, 'font-weight': i === mejorEstim ? 700 : 400, fill: c.texto, text: `brazo ${i + 1} · Q = ${num(E.Q[i], 2)} (${E.N[i]} tiradas)` }, s);
        const barra = api.el('rect', { x: L, y: y + 20, width: Math.max(1, X(E.Q[i]) - L), height: 16, fill: i === mejorEstim ? c.acento : c.series[1], 'fill-opacity': 0.8 }, s);
        api.inspeccionable(barra, `Brazo ${i + 1}: Q estimada ${num(E.Q[i], 2)}; probabilidad real ${num(pr, 2)}; ${E.N[i]} tiradas`);
        api.el('line', { x1: X(pr), x2: X(pr), y1: y + 17, y2: y + 39, stroke: c.mal, 'stroke-width': 2, 'stroke-dasharray': '3 2', 'pointer-events': 'none' }, s);
      });

      const W2 = api.medida(grafica2, { maxAncho: 640 }).ancho;
      serie(api, grafica2, c, W2, 140, E.historial.slice(-400), Math.min(E.historial.length, 400), 0, 1, mejorReal, 'óptimo');

      lectura.innerHTML = `<p>Tras <strong>${E.paso}</strong> tiradas: recompensa media = <strong>${num(E.recompensaTotal / E.paso, 3)}</strong> (el brazo óptimo daría de media ${num(mejorReal, 2)}). La marca roja de cada barra es la probabilidad real del brazo.</p>` +
        `<p>Con ε = ${num(E.epsilon, 2)}, en cada tirada exploras (brazo al azar) con probabilidad ${num(E.epsilon, 2)} y el resto de veces juegas el mejor brazo estimado hasta ahora.</p>`;
    }
    dibujar();
    return { redibujar: dibujar };
  }

  // ───────────────────────── policy-gradient (REINFORCE sobre un bandido) ─────────────────────────
  function modoPolicy(el, p, api) {
    const num = api.num;
    const cfg = p.config || {};
    const acciones = cfg.acciones && cfg.acciones.length ? cfg.acciones : ['izquierda', 'centro', 'derecha'];
    const recompensas = cfg.recompensas && cfg.recompensas.length === acciones.length ? cfg.recompensas : acciones.map((_, i) => i === acciones.length - 1 ? 0.8 : 0.2);
    const r = api.aleatorio(p.semilla != null ? p.semilla : 5);
    const E = { theta: acciones.map(() => 0), lr: cfg.lr != null ? cfg.lr : 0.3, baseline: 0, episodio: 0, historial: [] };

    const { grafica, grafica2, lectura, controles } = armazon(el, api);

    function softmax(theta) {
      const m = Math.max(...theta), exps = theta.map(t => Math.exp(t - m)), s = exps.reduce((a, b) => a + b, 0);
      return exps.map(e => e / s);
    }
    function episodio() {
      const probs = softmax(E.theta);
      let u = r(), a = 0; while (a < probs.length - 1 && u > probs[a]) { u -= probs[a]; a++; }
      const recompensa = recompensas[a], ventaja = recompensa - E.baseline;
      E.theta = E.theta.map((t, i) => t + E.lr * ventaja * ((i === a ? 1 : 0) - probs[i]));
      E.baseline += (recompensa - E.baseline) * 0.1;
      E.episodio++;
      const iMejor = recompensas.indexOf(Math.max(...recompensas));
      E.historial.push(softmax(E.theta)[iMejor]);
      if (E.historial.length > 500) E.historial.shift();
    }

    controles.append(api.slider({ etiqueta: 'tasa de aprendizaje η', min: 0.01, max: 1, paso: 0.01, valor: E.lr, alCambiar: v => { E.lr = v; } }));
    // Animación pausable: un episodio cada 150 ms mientras el widget está a la vista.
    let acumulado = 0;
    const anim = api.bucle(el, (dt) => {
      acumulado += dt;
      if (acumulado < 150) return true;
      acumulado = 0; episodio(); dibujar();
      return true;
    });
    function parar() { anim.parar(); bAuto.textContent = 'Auto'; bAuto.setAttribute('aria-pressed', 'false'); }
    const bAuto = api.boton('Auto', () => {
      if (anim.activo) return parar();
      if (api.reducido()) { for (let i = 0; i < 300; i++) episodio(); return dibujar(); }
      bAuto.textContent = 'Pausa'; bAuto.setAttribute('aria-pressed', 'true');
      anim.iniciar();
    }, { 'aria-pressed': 'false' });
    controles.append(botonesEjecutar(api, 1, 'episodios', (n) => { parar(); for (let i = 0; i < n; i++) episodio(); dibujar(); }), bAuto, reiniciar(el, p, api, parar));

    function dibujar() {
      const c = api.colores();
      const probs = softmax(E.theta), iMejor = recompensas.indexOf(Math.max(...recompensas));
      const W = api.medida(grafica, { maxAncho: 680 }).ancho;
      const filaAlto = 44, alto = acciones.length * filaAlto + 4;
      grafica.innerHTML = '';
      const s = api.svg(W, alto); s.setAttribute('role', 'group'); grafica.append(s);
      const F = api.fuente(s, 12);
      const L = 8, R = W - 12, X = api.escala(0, 1, L, R);
      acciones.forEach((nombre, i) => {
        const y = 2 + i * filaAlto, destacado = i === iMejor;
        api.el('text', { x: L, y: y + 14, 'font-size': F, 'font-weight': destacado ? 700 : 400, fill: c.texto, text: `${nombre} · ${num(100 * probs[i], 1)} % (recompensa ${num(recompensas[i], 2)})` }, s);
        const barra = api.el('rect', { x: L, y: y + 20, width: Math.max(1, X(probs[i]) - L), height: 16, fill: destacado ? c.acento : c.series[1], 'fill-opacity': 0.8 }, s);
        api.inspeccionable(barra, `${nombre}: probabilidad ${num(100 * probs[i], 1)} %, recompensa esperada ${num(recompensas[i], 2)}`);
      });

      const W2 = api.medida(grafica2, { maxAncho: 680 }).ancho;
      serie(api, grafica2, c, W2, 140, E.historial, E.historial.length, 0, 1, null);

      lectura.innerHTML = `<p>Tras <strong>${E.episodio}</strong> episodios: P(«${acciones[iMejor]}») = <strong>${num(100 * probs[iMejor], 1)} %</strong> (la acción con más recompensa esperada).</p>` +
        `<p>Cada episodio empuja las probabilidades hacia las acciones que dieron más recompensa de lo esperado; la curva de abajo muestra cómo crece la probabilidad de la mejor acción episodio a episodio.</p>`;
    }
    dibujar();
    return { redibujar: dibujar, destruir: parar, pausar: () => anim.parar(), reanudar: () => anim.seguir() };
  }

  Motores.registrar('simulacion', function (el, p, api) {
    const modo = p.modo;
    if (modo === 'pi') return modoPi(el, p, api);
    if (modo === 'intervalos') return modoIntervalos(el, p, api);
    if (modo === 'bandido') return modoBandido(el, p, api);
    if (modo === 'policy-gradient') return modoPolicy(el, p, api);
    throw new Error('Modo desconocido: ' + modo);
  }, {
    ejemplos: {
      pi: { modo: 'pi', semilla: 7, config: { n: 200 } },
      intervalos: { modo: 'intervalos', semilla: 3, config: { mu: 50, sigma: 10, n: 30, confianza: 0.95, m: 100 } },
      bandido: { modo: 'bandido', semilla: 11, config: { brazos: [0.2, 0.5, 0.7], epsilon: 0.1 } },
      'policy-gradient': { modo: 'policy-gradient', semilla: 5, config: { acciones: ['izquierda', 'centro', 'derecha'], recompensas: [0.2, 0.3, 0.8], lr: 0.3 } },
    },
  });
})();
