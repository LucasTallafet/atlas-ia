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

  // ───────────────────────── pi: Monte Carlo ─────────────────────────
  function modoPi(el, p, api) {
    const H = api.html, num = api.num;
    const cfg = p.config || {};
    const r = api.aleatorio(p.semilla != null ? p.semilla : 7);
    const lote = cfg.n || 200;
    const E = { n: 0, dentro: 0, historial: [], ultimos: [] };

    const grafica = H('div', { class: 'motor-grafica' });
    const grafica2 = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, grafica2, lectura, controles);
    const canvas = H('canvas'); canvas.style.cssText = 'display:block;max-width:100%;margin:0 auto;'; grafica.append(canvas);

    function lanzar(cuantos) {
      for (let k = 0; k < cuantos; k++) {
        const x = r() * 2 - 1, y = r() * 2 - 1;
        E.n++; if (x * x + y * y <= 1) E.dentro++;
        E.ultimos.push([x, y]);
        if (E.ultimos.length > 2000) E.ultimos.shift();
      }
      E.historial.push({ n: E.n, estim: 4 * E.dentro / E.n });
    }
    lanzar(lote);

    controles.append(
      api.boton(`Lanzar ${lote} puntos`, () => { lanzar(lote); dibujar(); }, { class: 'boton boton-principal' }),
      api.boton(`Lanzar ${lote * 10} puntos`, () => { lanzar(lote * 10); dibujar(); }),
      api.boton('Reiniciar', () => { Motores.desmontar(el); Motores.montar(el, 'simulacion', JSON.parse(JSON.stringify(p))); }),
    );

    function dibujar() {
      const c = api.colores();
      const W = Math.max(240, Math.min(el.clientWidth || 420, 420)), Wc = W;
      canvas.width = Math.round(W * 2); canvas.height = Math.round(Wc * 2);
      canvas.style.width = W + 'px'; canvas.style.height = Wc + 'px';
      const ctx = canvas.getContext('2d');
      ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.clearRect(0, 0, W, Wc);
      const cx = W / 2, cy = Wc / 2, rad = W / 2 - 4;
      ctx.strokeStyle = c.linea; ctx.strokeRect(4, 4, W - 8, Wc - 8);
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 2 * Math.PI); ctx.strokeStyle = c.acento; ctx.stroke();
      E.ultimos.forEach(([x, y]) => {
        ctx.fillStyle = x * x + y * y <= 1 ? c.series[0] : c.suave;
        ctx.beginPath(); ctx.arc(cx + x * rad, cy - y * rad, 1.6, 0, 2 * Math.PI); ctx.fill();
      });
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', 'Puntos al azar en un cuadrado; los que caen dentro del círculo cuentan para estimar π.');

      grafica2.innerHTML = '';
      const W2 = Math.max(260, Math.min(el.clientWidth || 500, 640)), H2 = 140;
      const s = api.svg(W2, H2); s.setAttribute('role', 'img'); grafica2.append(s);
      const caja = { l: 42, r: W2 - 10, t: 10, b: H2 - 24 };
      const X = api.escala(0, Math.max(10, E.n), caja.l, caja.r);
      const estims = E.historial.map(hh => hh.estim);
      const yMin = Math.min(2.6, ...estims), yMax = Math.max(3.6, ...estims);
      const Y = api.escala(yMin, yMax, caja.b, caja.t);
      api.marcas(yMin, yMax, 4).forEach(v => {
        api.el('line', { x1: caja.l, x2: caja.r, y1: Y(v), y2: Y(v), stroke: c.rejilla }, s);
        api.el('text', { x: caja.l - 4, y: Y(v) + 4, 'text-anchor': 'end', 'font-size': 11, fill: c.suave, text: num(v, 2) }, s);
      });
      api.el('line', { x1: caja.l, x2: caja.r, y1: Y(Math.PI), y2: Y(Math.PI), stroke: c.mal, 'stroke-dasharray': '4 3' }, s);
      api.el('text', { x: caja.r, y: Y(Math.PI) - 4, 'text-anchor': 'end', 'font-size': 11, fill: c.mal, text: 'π' }, s);
      api.el('polyline', { points: E.historial.map(hh => X(hh.n) + ',' + Y(hh.estim)).join(' '), fill: 'none', stroke: c.acento, 'stroke-width': 2 }, s);

      const estim = 4 * E.dentro / E.n;
      lectura.innerHTML = `<p>Con <strong>${num(E.n, 0)}</strong> puntos, ${num(E.dentro, 0)} cayeron dentro del círculo → 4 × ${E.dentro}/${E.n} = <strong>${num(estim, 4)}</strong> (error ${num(Math.abs(estim - Math.PI), 4)} frente a π ≈ ${num(Math.PI, 4)}).</p>` +
        `<p>Cuantos más puntos lanzas, más se acerca la estimación a π, pero cada vez cuesta más reducir el error.</p>`;
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
      semilla: p.semilla != null ? p.semilla : 3,
    };

    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, lectura, controles);

    controles.append(api.slider({ etiqueta: 'tamaño de muestra n', min: 5, max: 100, paso: 5, valor: E.n, alCambiar: v => { E.n = v; generar(); dibujar(); } }));
    const grupo = H('div', { class: 'motor-selector', role: 'group', 'aria-label': 'Nivel de confianza' });
    [0.90, 0.95, 0.99].forEach(cVal => {
      const b = api.boton(num(cVal * 100, 0) + ' %', () => { E.confianza = cVal; marcar(); dibujar(); });
      b.dataset.c = cVal;
      grupo.append(b);
    });
    function marcar() { grupo.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.c === E.confianza))); }
    controles.append(grupo, api.boton(`Sacar otras ${E.m} muestras`, () => { E.semilla++; generar(); dibujar(); }));
    marcar();

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
      const W = Math.max(300, Math.min(el.clientWidth || 640, 760));
      const filaAlto = 4, alto = E.m * filaAlto + 30;
      grafica.innerHTML = '';
      const s = api.svg(W, alto); s.setAttribute('role', 'img'); grafica.append(s);
      const caja = { l: 10, r: W - 10, t: 6, b: alto - 16 };
      const margenes = muestras.map(ms => [ms.media - z * ms.de / Math.sqrt(E.n), ms.media + z * ms.de / Math.sqrt(E.n)]);
      const lo = Math.min(E.mu - 3 * E.sigma / Math.sqrt(E.n), ...margenes.map(mm => mm[0]));
      const hi = Math.max(E.mu + 3 * E.sigma / Math.sqrt(E.n), ...margenes.map(mm => mm[1]));
      const X = api.escala(lo, hi, caja.l, caja.r);
      api.el('line', { x1: X(E.mu), x2: X(E.mu), y1: caja.t, y2: caja.b, stroke: c.texto, 'stroke-width': 1.4, 'stroke-dasharray': '3 3' }, s);
      let cubre = 0;
      margenes.forEach(([a, b], i) => {
        const contieneMu = a <= E.mu && E.mu <= b;
        if (contieneMu) cubre++;
        const y = caja.t + i * filaAlto + filaAlto / 2;
        api.el('line', { x1: X(a), x2: X(b), y1: y, y2: y, stroke: contieneMu ? c.bien : c.mal, 'stroke-width': 2 }, s);
      });
      lectura.innerHTML = `<p>De las <strong>${E.m}</strong> muestras de tamaño n = ${E.n}, <strong>${cubre}</strong> (${num(100 * cubre / E.m, 1)} %) de los intervalos del ${num(E.confianza * 100, 0)} % contienen la media real μ = ${num(E.mu, 1)} (línea vertical).</p>` +
        `<p>El ${num(E.confianza * 100, 0)} % de confianza no dice que "hay un ${num(E.confianza * 100, 0)} % de probabilidad de que μ esté en este intervalo": significa que, repitiendo el muestreo muchas veces, ese porcentaje de los intervalos contendría μ.</p>`;
    }
    dibujar();
    return { redibujar: dibujar };
  }

  // ───────────────────────── bandido multibrazo ─────────────────────────
  function modoBandido(el, p, api) {
    const H = api.html, num = api.num;
    const cfg = p.config || {};
    const brazos = cfg.brazos && cfg.brazos.length ? cfg.brazos : [0.2, 0.5, 0.7];
    const r = api.aleatorio(p.semilla != null ? p.semilla : 11);
    const E = { epsilon: cfg.epsilon != null ? cfg.epsilon : 0.1, Q: brazos.map(() => 0), N: brazos.map(() => 0), paso: 0, recompensaTotal: 0, historial: [] };

    const grafica = H('div', { class: 'motor-grafica' });
    const grafica2 = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, grafica2, lectura, controles);

    controles.append(
      api.slider({ etiqueta: 'ε (exploración)', min: 0, max: 1, paso: 0.02, valor: E.epsilon, alCambiar: v => { E.epsilon = v; } }),
      api.boton('Jugar 1 vez', () => { jugar(1); dibujar(); }, { class: 'boton boton-principal' }),
      api.boton('Jugar 50 veces', () => { jugar(50); dibujar(); }),
      api.boton('Reiniciar', () => { Motores.desmontar(el); Motores.montar(el, 'simulacion', JSON.parse(JSON.stringify(p))); }),
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
      const W = Math.max(280, Math.min(el.clientWidth || 520, 640));
      const filaAlto = 28, alto = brazos.length * filaAlto + 12;
      grafica.innerHTML = '';
      const s = api.svg(W, alto); s.setAttribute('role', 'img'); grafica.append(s);
      const L = 80, R = W - 70, X = api.escala(0, 1, L, R);
      const mejorReal = Math.max(...brazos), mejorEstim = E.Q.indexOf(Math.max(...E.Q));
      brazos.forEach((pr, i) => {
        const y = 6 + i * filaAlto;
        api.el('text', { x: L - 8, y: y + filaAlto - 11, 'text-anchor': 'end', 'font-size': 12, fill: c.texto, text: 'brazo ' + (i + 1) }, s);
        api.el('rect', { x: L, y, width: Math.max(1, X(E.Q[i]) - L), height: filaAlto - 9, fill: i === mejorEstim ? c.acento : c.series[1], 'fill-opacity': 0.8 }, s);
        api.el('line', { x1: X(pr), x2: X(pr), y1: y, y2: y + filaAlto - 9, stroke: c.mal, 'stroke-dasharray': '2 2' }, s);
        api.el('text', { x: X(E.Q[i]) + 4, y: y + filaAlto - 11, 'font-size': 10, fill: c.suave, text: `Q=${num(E.Q[i], 2)} (n=${E.N[i]})` }, s);
      });

      grafica2.innerHTML = '';
      const W2 = Math.max(280, Math.min(el.clientWidth || 520, 640)), H2 = 120;
      const s2 = api.svg(W2, H2); s2.setAttribute('role', 'img'); grafica2.append(s2);
      const caja = { l: 40, r: W2 - 10, t: 8, b: H2 - 20 };
      const X2 = api.escala(0, Math.max(10, E.paso), caja.l, caja.r), Y2 = api.escala(0, 1, caja.b, caja.t);
      api.marcas(0, 1, 4).forEach(v => api.el('text', { x: caja.l - 4, y: Y2(v) + 4, 'text-anchor': 'end', 'font-size': 10, fill: c.suave, text: num(v, 2) }, s2));
      api.el('line', { x1: caja.l, x2: caja.r, y1: Y2(mejorReal), y2: Y2(mejorReal), stroke: c.mal, 'stroke-dasharray': '3 3' }, s2);
      api.el('text', { x: caja.r, y: Y2(mejorReal) - 4, 'text-anchor': 'end', 'font-size': 10, fill: c.mal, text: 'óptimo' }, s2);
      api.el('polyline', { points: E.historial.map((v, i) => X2(i + 1) + ',' + Y2(v)).join(' '), fill: 'none', stroke: c.acento, 'stroke-width': 2 }, s2);

      lectura.innerHTML = `<p>Tras <strong>${E.paso}</strong> tiradas: recompensa media = <strong>${num(E.recompensaTotal / E.paso, 3)}</strong> (el brazo óptimo daría de media ${num(mejorReal, 2)}).</p>` +
        `<p>Con ε = ${num(E.epsilon, 2)}, en cada tirada exploras (brazo al azar) con probabilidad ${num(E.epsilon, 2)} y el resto de veces juegas el mejor brazo estimado hasta ahora.</p>`;
    }
    dibujar();
    return { redibujar: dibujar };
  }

  // ───────────────────────── policy-gradient (REINFORCE sobre un bandido) ─────────────────────────
  function modoPolicy(el, p, api) {
    const H = api.html, num = api.num;
    const cfg = p.config || {};
    const acciones = cfg.acciones && cfg.acciones.length ? cfg.acciones : ['izquierda', 'centro', 'derecha'];
    const recompensas = cfg.recompensas && cfg.recompensas.length === acciones.length ? cfg.recompensas : acciones.map((_, i) => i === acciones.length - 1 ? 0.8 : 0.2);
    const r = api.aleatorio(p.semilla != null ? p.semilla : 5);
    const reducido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const E = { theta: acciones.map(() => 0), lr: cfg.lr != null ? cfg.lr : 0.3, baseline: 0, episodio: 0, historial: [] };

    const grafica = H('div', { class: 'motor-grafica' });
    const grafica2 = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, grafica2, lectura, controles);

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
    let temporizador = null;
    const bPaso = api.boton('Episodio →', () => { parar(); episodio(); dibujar(); }, { class: 'boton boton-principal' });
    const bAuto = api.boton('Auto', () => {
      if (temporizador) return parar();
      if (reducido) { for (let i = 0; i < 300; i++) episodio(); return dibujar(); }
      bAuto.textContent = 'Pausa';
      temporizador = setInterval(() => { if (!document.body.contains(el)) return parar(); episodio(); dibujar(); }, 150);
    });
    function parar() { if (temporizador) { clearInterval(temporizador); temporizador = null; } bAuto.textContent = 'Auto'; }
    controles.append(bPaso, bAuto, api.boton('Reiniciar', () => { parar(); Motores.desmontar(el); Motores.montar(el, 'simulacion', JSON.parse(JSON.stringify(p))); }));

    function dibujar() {
      const c = api.colores();
      const probs = softmax(E.theta), iMejor = recompensas.indexOf(Math.max(...recompensas));
      const W = Math.max(280, Math.min(el.clientWidth || 560, 680));
      const filaAlto = 28, alto = acciones.length * filaAlto + 12;
      grafica.innerHTML = '';
      const s = api.svg(W, alto); s.setAttribute('role', 'img'); grafica.append(s);
      const L = 110, R = W - 16, X = api.escala(0, 1, L, R);
      acciones.forEach((nombre, i) => {
        const y = 6 + i * filaAlto, destacado = i === iMejor;
        api.el('text', { x: L - 8, y: y + filaAlto - 11, 'text-anchor': 'end', 'font-size': 12, 'font-weight': destacado ? 700 : 400, fill: c.texto, text: nombre }, s);
        api.el('rect', { x: L, y, width: Math.max(1, X(probs[i]) - L), height: filaAlto - 9, fill: destacado ? c.acento : c.series[1], 'fill-opacity': 0.8 }, s);
        api.el('text', { x: X(probs[i]) + 4, y: y + filaAlto - 11, 'font-size': 11, fill: c.suave, text: num(100 * probs[i], 1) + ' % (r=' + num(recompensas[i], 2) + ')' }, s);
      });

      grafica2.innerHTML = '';
      const W2 = Math.max(280, Math.min(el.clientWidth || 560, 680)), H2 = 120;
      const s2 = api.svg(W2, H2); s2.setAttribute('role', 'img'); grafica2.append(s2);
      const caja = { l: 36, r: W2 - 10, t: 8, b: H2 - 20 };
      const X2 = api.escala(0, Math.max(10, E.episodio), caja.l, caja.r), Y2 = api.escala(0, 1, caja.b, caja.t);
      api.marcas(0, 1, 4).forEach(v => api.el('text', { x: caja.l - 4, y: Y2(v) + 4, 'text-anchor': 'end', 'font-size': 10, fill: c.suave, text: num(v, 2) }, s2));
      api.el('polyline', { points: E.historial.map((v, i) => X2(i + 1) + ',' + Y2(v)).join(' '), fill: 'none', stroke: c.acento, 'stroke-width': 2 }, s2);

      lectura.innerHTML = `<p>Tras <strong>${E.episodio}</strong> episodios: P(«${acciones[iMejor]}») = <strong>${num(100 * probs[iMejor], 1)} %</strong> (la acción con más recompensa esperada).</p>` +
        `<p>Cada episodio empuja las probabilidades hacia las acciones que dieron más recompensa de lo esperado; la curva de abajo muestra cómo crece la probabilidad de la mejor acción episodio a episodio.</p>`;
    }
    dibujar();
    return { redibujar: dibujar, destruir: parar };
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
