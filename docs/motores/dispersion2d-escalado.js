// Motor "dispersion2d", modo "escalado": estandarización (z-score), mín-máx y escalado robusto
// (mediana/RIC) sobre las dos coordenadas, para comparar cómo reacciona cada uno a un valor atípico.
(function () {
  'use strict';
  if (window.Dispersion2d) registrar(); else Motores.cargar('dispersion2d').then(registrar);
  function registrar() {
  const D = window.Dispersion2d;

  function transformar(vals, metodo) {
    const e = D.estadisticos(vals);
    if (metodo === 'minmax') { const r = (e.max - e.min) || 1; return { y: vals.map(v => (v - e.min) / r), formula: '(x − mín) / (máx − mín)' }; }
    if (metodo === 'robusto') { const r = (e.q3 - e.q1) || 1; return { y: vals.map(v => (v - e.mediana) / r), formula: '(x − mediana) / (Q3 − Q1)' }; }
    const r = e.sd || 1; return { y: vals.map(v => (v - e.media) / r), formula: '(x − media) / desviación típica' };
  }

  D.modo('escalado', {
    botones(ctx) {
      const E = ctx.estado;
      if (!E.metodo) E.metodo = 'estandar';
      const grupo = ctx.H('div', { class: 'motor-selector', role: 'group', 'aria-label': 'Método de escalado' });
      const marcar = () => grupo.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === E.metodo)));
      [['estandar', 'estandarización (z-score)'], ['minmax', 'mín-máx [0, 1]'], ['robusto', 'robusto (mediana/RIC)']].forEach(([m, etiqueta]) => {
        const b = ctx.api.boton(etiqueta, () => { E.metodo = m; marcar(); ctx.redibujar(); });
        b.dataset.m = m;
        grupo.append(b);
      });
      marcar();
      return [grupo];
    },
    colorPunto(ctx) { return ctx.c.series[0]; },
    lectura(ctx) {
      const tx = transformar(ctx.datos.map(d => d.x), ctx.estado.metodo);
      return [
        `Fórmula aplicada a cada eje: ${tx.formula}.`,
        'Arrastra un punto lejos de la nube (valor atípico) y compara: mín-máx aplasta el resto de puntos hacia un extremo, mientras que el escalado robusto apenas cambia, porque no usa el mínimo, el máximo ni la media.',
      ];
    },
    panel(ctx, cont) {
      const E = ctx.estado, api = ctx.api, c = ctx.c, num = ctx.num;
      const xs = ctx.datos.map(d => d.x), ys = ctx.datos.map(d => d.y);
      const tx = transformar(xs, E.metodo), ty = transformar(ys, E.metodo);
      const W = Math.max(280, Math.min(cont.clientWidth || 600, 600)), alto = 220;
      const m = { l: 40, r: 12, t: 10, b: 26 };
      const ext = (v) => { const a = Math.min(...v), b = Math.max(...v), pad = (b - a || 1) * 0.1; return [a - pad, b + pad]; };
      const [x0, x1] = ext(tx.y), [y0, y1] = ext(ty.y);
      const X = api.escala(x0, x1, m.l, W - m.r), Y = api.escala(y0, y1, alto - m.b, m.t);
      const s = api.svg(W, alto);
      s.setAttribute('role', 'img');
      const g = api.el('g', { 'font-size': 11, fill: c.suave }, s);
      api.marcas(x0, x1, 5).forEach(v => { api.el('line', { x1: X(v), x2: X(v), y1: m.t, y2: alto - m.b, stroke: c.rejilla }, g); api.el('text', { x: X(v), y: alto - m.b + 15, 'text-anchor': 'middle', text: num(v, 2) }, g); });
      api.marcas(y0, y1, 4).forEach(v => { api.el('line', { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), stroke: c.rejilla }, g); api.el('text', { x: m.l - 4, y: Y(v) + 4, 'text-anchor': 'end', text: num(v, 2) }, g); });
      tx.y.forEach((xv, i) => api.el('circle', { cx: X(xv), cy: Y(ty.y[i]), r: 4, fill: c.series[0], stroke: c.superficie }, s));
      s.setAttribute('aria-label', 'Puntos tras escalar cada eje con el método elegido');
      cont.append(
        api.html('h3', { text: 'Después de escalar — ' + tx.formula }),
        s,
        api.html('p', { class: 'motor-lectura', text: `Antes: x ∈ [${num(Math.min(...xs), 2)}, ${num(Math.max(...xs), 2)}] · y ∈ [${num(Math.min(...ys), 2)}, ${num(Math.max(...ys), 2)}]` }),
      );
      cont.className = 'disp-panel disp-codo';
    },
  });
  }
})();
