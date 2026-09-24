// Motor "dispersion2d", modo "ols": regresión lineal simple por mínimos cuadrados ordinarios,
// con la recta ajustada y los residuos (segmentos verticales) que la fórmula minimiza al cuadrado.
(function () {
  'use strict';
  if (window.Dispersion2d) registrar(); else Motores.cargar('dispersion2d').then(registrar);
  function registrar() {
  const D = window.Dispersion2d;

  D.modo('ols', {
    fondo(ctx, g) {
      const xs = ctx.datos.map(d => d.x), ys = ctx.datos.map(d => d.y);
      const { b0, b1 } = D.regresionSimple(xs, ys), c = ctx.c;
      ctx.estado.b0 = b0; ctx.estado.b1 = b1;
      const x0 = ctx.vista.x0, x1 = ctx.vista.x1;
      ctx.api.el('line', { x1: ctx.X(x0), y1: ctx.Y(b0 + b1 * x0), x2: ctx.X(x1), y2: ctx.Y(b0 + b1 * x1), stroke: c.acento, 'stroke-width': 2.5 }, g);
      ctx.datos.forEach(d => {
        const yhat = b0 + b1 * d.x;
        ctx.api.el('line', { x1: ctx.X(d.x), y1: ctx.Y(d.y), x2: ctx.X(d.x), y2: ctx.Y(yhat), stroke: c.mal, 'stroke-opacity': 0.55, 'stroke-dasharray': '2 2' }, g);
      });
    },
    colorPunto(ctx) { return ctx.c.series[0]; },
    leyenda(ctx) {
      return [['recta ajustada (mínimos cuadrados)', ctx.c.acento], ['residuo (error de cada punto)', ctx.c.mal]];
    },
    lectura(ctx) {
      const { b0, b1 } = ctx.estado, num = ctx.num;
      const ssr = ctx.datos.reduce((a, d) => a + (d.y - (b0 + b1 * d.x)) ** 2, 0);
      return [
        `Recta ajustada: ŷ = ${num(b0, 3)} + ${num(b1, 3)}·x — es la única que hace mínima la suma de residuos al cuadrado.`,
        `Suma de residuos al cuadrado = <strong>${num(ssr, 3)}</strong>. Mueve un punto lejos de la nube y observa cómo la recta se inclina hacia él.`,
      ];
    },
  });
  }
})();
