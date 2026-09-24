// Motor "dispersion2d", modo "ridge-lasso": regresión polinómica (grado fijo, variables
// estandarizadas) con regularización L2 (ridge, forma cerrada) o L1 (lasso, descenso por
// coordenadas con umbral suave), para comparar cómo cada una encoge los coeficientes.
(function () {
  'use strict';
  if (window.Dispersion2d) registrar(); else Motores.cargar('dispersion2d').then(registrar);
  function registrar() {
  const D = window.Dispersion2d;
  const GRADO = 5;

  function preparar(xs, ys) {
    const n = xs.length;
    const mx = D.mediaDe(xs), sx = Math.sqrt(xs.reduce((a, x) => a + (x - mx) ** 2, 0) / n) || 1;
    const my = D.mediaDe(ys);
    const z = xs.map(x => (x - mx) / sx);
    const F = z.map(zx => Array.from({ length: GRADO }, (_, j) => zx ** (j + 1)));
    const colMedia = [], colSd = [];
    for (let j = 0; j < GRADO; j++) {
      const col = F.map(f => f[j]), m = D.mediaDe(col), s = Math.sqrt(col.reduce((a, v) => a + (v - m) ** 2, 0) / n) || 1;
      colMedia.push(m); colSd.push(s);
    }
    const Fs = F.map(f => f.map((v, j) => (v - colMedia[j]) / colSd[j]));
    const yc = ys.map(y => y - my);
    return { Fs, yc, mx, sx, my, colMedia, colSd };
  }

  function ridge(Fs, yc, lam) {
    const d = Fs[0].length;
    const A = Array.from({ length: d }, (_, i) => Array.from({ length: d }, (_, j) => Fs.reduce((s, f) => s + f[i] * f[j], 0) + (i === j ? lam * Fs.length : 0)));
    const b = Array.from({ length: d }, (_, i) => Fs.reduce((s, f, k) => s + f[i] * yc[k], 0));
    return D.resolver(A, b);
  }
  function lasso(Fs, yc, lam) {
    const n = Fs.length, d = Fs[0].length, w = new Array(d).fill(0);
    const zj = Array.from({ length: d }, (_, j) => Fs.reduce((s, f) => s + f[j] * f[j], 0));
    const umbral = (v, t) => Math.sign(v) * Math.max(Math.abs(v) - t, 0);
    for (let it = 0; it < 150; it++) {
      for (let j = 0; j < d; j++) {
        let rho = 0;
        for (let i = 0; i < n; i++) {
          let pred = 0;
          for (let k = 0; k < d; k++) if (k !== j) pred += Fs[i][k] * w[k];
          rho += Fs[i][j] * (yc[i] - pred);
        }
        w[j] = zj[j] > 1e-9 ? umbral(rho, lam * n) / zj[j] : 0;
      }
    }
    return w;
  }
  function predecir(prep, w, x) {
    const z = (x - prep.mx) / prep.sx;
    let y = prep.my;
    for (let j = 0; j < w.length; j++) y += w[j] * ((z ** (j + 1) - prep.colMedia[j]) / prep.colSd[j]);
    return y;
  }

  D.modo('ridge-lasso', {
    controles: [{ nombre: 'lambda', min: 0, max: 3, paso: 0.05, valor: 0, etiqueta: 'λ (fuerza de regularización)' }],
    botones(ctx) {
      const E = ctx.estado;
      if (!E.tipo) E.tipo = 'ridge';
      const grupo = ctx.H('div', { class: 'motor-selector', role: 'group', 'aria-label': 'Tipo de regularización' });
      const marcar = () => grupo.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === E.tipo)));
      [['ridge', 'ridge (L2)'], ['lasso', 'lasso (L1)']].forEach(([m, etiqueta]) => {
        const b = ctx.api.boton(etiqueta, () => { E.tipo = m; marcar(); ctx.redibujar(); });
        b.dataset.m = m;
        grupo.append(b);
      });
      marcar();
      return [grupo];
    },
    fondo(ctx, g) {
      const E = ctx.estado;
      if (!E.tipo) E.tipo = 'ridge';
      const xs = ctx.datos.map(d => d.x), ys = ctx.datos.map(d => d.y);
      const prep = preparar(xs, ys);
      const w0 = ridge(prep.Fs, prep.yc, 0);
      const w = E.tipo === 'ridge' ? ridge(prep.Fs, prep.yc, ctx.K.lambda) : lasso(prep.Fs, prep.yc, ctx.K.lambda);
      E.prep = prep; E.w0 = w0; E.w = w;
      const N = 60, x0 = ctx.vista.x0, x1 = ctx.vista.x1, c = ctx.c;
      const linea = (ws, color, ancho) => {
        const pts = Array.from({ length: N + 1 }, (_, i) => { const x = x0 + (x1 - x0) * i / N; return `${ctx.X(x).toFixed(1)},${ctx.Y(predecir(prep, ws, x)).toFixed(1)}`; });
        ctx.api.el('polyline', { points: pts.join(' '), fill: 'none', stroke: color, 'stroke-width': ancho }, g);
      };
      linea(w0, c.suave, 1.5);
      linea(w, c.acento, 2.5);
    },
    colorPunto(ctx) { return ctx.c.series[0]; },
    leyenda(ctx) {
      const E = ctx.estado, num = ctx.num;
      return [[`sin regularizar (λ = 0), grado ${GRADO}`, ctx.c.suave], [`${E.tipo} con λ = ${num(ctx.K.lambda, 2)}`, ctx.c.acento]];
    },
    lectura(ctx) {
      const E = ctx.estado, num = ctx.num;
      const norma1 = v => v.reduce((a, x) => a + Math.abs(x), 0), ceros = v => v.filter(x => Math.abs(x) < 1e-6).length;
      if (E.tipo === 'lasso') {
        return [
          `Lasso (L1): ${ceros(E.w)} de ${E.w.length} coeficientes son exactamente cero con λ = ${num(ctx.K.lambda, 2)}.`,
          'Sube λ y compara con ridge: lasso elimina coeficientes por completo (selección de variables); ridge solo los encoge.',
        ];
      }
      return [
        `Ridge (L2): suma de |coeficientes| = ${num(norma1(E.w), 3)} (sin regularizar: ${num(norma1(E.w0), 3)}).`,
        'Sube λ: los coeficientes se encogen hacia cero de forma suave, pero casi nunca llegan a valer exactamente cero.',
      ];
    },
    panel(ctx, cont) {
      const E = ctx.estado, api = ctx.api, c = ctx.c;
      const d = E.w.length, W = Math.max(280, Math.min(cont.clientWidth || 600, 600)), alto = 170;
      const m = { l: 34, r: 12, t: 10, b: 26 };
      const maxAbs = Math.max(0.3, ...E.w0.map(Math.abs), ...E.w.map(Math.abs));
      const Y = api.escala(-maxAbs, maxAbs, alto - m.b, m.t);
      const anchoBarra = (W - m.l - m.r) / d;
      const s = api.svg(W, alto);
      s.setAttribute('role', 'img');
      const gg = api.el('g', {}, s);
      api.el('line', { x1: m.l, x2: W - m.r, y1: Y(0), y2: Y(0), stroke: c.linea }, gg);
      for (let j = 0; j < d; j++) {
        const cx0 = m.l + j * anchoBarra, y0 = Y(0);
        api.el('rect', { x: cx0 + anchoBarra * 0.15, y: Math.min(y0, Y(E.w0[j])), width: anchoBarra * 0.3, height: Math.abs(Y(E.w0[j]) - y0) || 0.5, fill: c.suave }, gg);
        api.el('rect', { x: cx0 + anchoBarra * 0.55, y: Math.min(y0, Y(E.w[j])), width: anchoBarra * 0.3, height: Math.abs(Y(E.w[j]) - y0) || 0.5, fill: c.acento }, gg);
        api.el('text', { x: cx0 + anchoBarra / 2, y: alto - 8, 'text-anchor': 'middle', 'font-size': 11, fill: c.suave, text: 'x' + (j + 1) }, gg);
      }
      s.setAttribute('aria-label', 'Coeficientes de cada potencia de x, sin regularizar y regularizados');
      cont.append(api.html('h3', { text: 'Coeficientes por potencia de x (variables estandarizadas)' }), s);
      cont.className = 'disp-panel disp-codo';
    },
  });
  }
})();
