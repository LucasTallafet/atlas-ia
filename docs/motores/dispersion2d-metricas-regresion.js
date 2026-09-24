// Motor "dispersion2d", modo "metricas-regresion": ajusta una recta por mínimos cuadrados y muestra
// a la vez MAE, MSE, RMSE y R², para comparar cómo reacciona cada métrica ante un punto atípico.
(function () {
  'use strict';
  if (window.Dispersion2d) registrar(); else Motores.cargar('dispersion2d').then(registrar);
  function registrar() {
  const D = window.Dispersion2d;

  D.modo('metricas-regresion', {
    fondo(ctx, g) {
      const xs = ctx.datos.map(d => d.x), ys = ctx.datos.map(d => d.y);
      const { b0, b1 } = D.regresionSimple(xs, ys), c = ctx.c, ymed = D.mediaDe(ys);
      ctx.estado.b0 = b0; ctx.estado.b1 = b1;
      const x0 = ctx.vista.x0, x1 = ctx.vista.x1;
      ctx.api.el('line', { x1: ctx.X(x0), y1: ctx.Y(ymed), x2: ctx.X(x1), y2: ctx.Y(ymed), stroke: c.suave, 'stroke-dasharray': '4 4' }, g);
      ctx.api.el('line', { x1: ctx.X(x0), y1: ctx.Y(b0 + b1 * x0), x2: ctx.X(x1), y2: ctx.Y(b0 + b1 * x1), stroke: c.acento, 'stroke-width': 2.5 }, g);
      ctx.datos.forEach(d => {
        const yhat = b0 + b1 * d.x;
        ctx.api.el('line', { x1: ctx.X(d.x), y1: ctx.Y(d.y), x2: ctx.X(d.x), y2: ctx.Y(yhat), stroke: c.mal, 'stroke-opacity': 0.5, 'stroke-dasharray': '2 2' }, g);
      });
    },
    colorPunto(ctx) { return ctx.c.series[0]; },
    leyenda(ctx) { return [['recta ajustada', ctx.c.acento], ['media de y (referencia de R²)', ctx.c.suave], ['residuo', ctx.c.mal]]; },
    lectura(ctx) {
      const { b0, b1 } = ctx.estado, num = ctx.num, n = ctx.datos.length;
      const ys = ctx.datos.map(d => d.y), ymed = D.mediaDe(ys);
      let sae = 0, sse = 0, sst = 0;
      ctx.datos.forEach(d => { const r = d.y - (b0 + b1 * d.x); sae += Math.abs(r); sse += r * r; sst += (d.y - ymed) ** 2; });
      const mae = sae / n, mse = sse / n, rmse = Math.sqrt(mse), r2 = sst ? 1 - sse / sst : 1;
      ctx.estado.metricas = { mae, mse, rmse, r2 };
      return [
        `MAE = ${num(mae, 3)} · MSE = ${num(mse, 3)} · RMSE = ${num(rmse, 3)} · R² = ${num(r2, 3)}.`,
        'Arrastra un punto lejos de la recta: MSE y RMSE (elevan el error al cuadrado) suben mucho más deprisa que MAE, y R² puede llegar a ser negativo.',
      ];
    },
    panel(ctx, cont) {
      const M = ctx.estado.metricas, num = ctx.num;
      const filas = [
        ['MAE', num(M.mae, 3), 'media de |error|: misma unidad que y, poco sensible a atípicos'],
        ['MSE', num(M.mse, 3), 'media de error al cuadrado: penaliza fuerte los errores grandes'],
        ['RMSE', num(M.rmse, 3), 'raíz de MSE: vuelve a la unidad de y'],
        ['R²', num(M.r2, 3), '1 − (error del modelo / error de predecir siempre la media); 1 es perfecto'],
      ];
      cont.innerHTML = `<div class="tabla-scroll"><table class="motor-tabla"><thead><tr><th scope="col">métrica</th><th scope="col">valor</th><th scope="col">qué mide</th></tr></thead><tbody>${
        filas.map(f => `<tr><th scope="row">${f[0]}</th><td>${f[1]}</td><td>${f[2]}</td></tr>`).join('')
      }</tbody></table></div>`;
      cont.className = 'disp-panel';
    },
  });
  }
})();
