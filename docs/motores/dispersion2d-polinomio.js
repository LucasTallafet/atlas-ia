// Motor "dispersion2d", modo "polinomio": regresión polinómica de grado ajustable por mínimos
// cuadrados (matriz de Vandermonde + ecuaciones normales), para ver cómo un grado alto se pega a
// cada punto (sobreajuste) en vez de capturar el patrón general.
(function () {
  'use strict';
  if (window.Dispersion2d) registrar(); else Motores.cargar('dispersion2d').then(registrar);
  function registrar() {
  const D = window.Dispersion2d;

  function ajustar(xs, ys, grado) {
    const n = xs.length, d = Math.max(0, Math.min(grado, n - 1));
    const F = xs.map(x => Array.from({ length: d + 1 }, (_, j) => x ** j));
    const A = Array.from({ length: d + 1 }, (_, i) => Array.from({ length: d + 1 }, (_, j) => F.reduce((s, fila) => s + fila[i] * fila[j], 0)));
    const b = Array.from({ length: d + 1 }, (_, i) => F.reduce((s, fila, k) => s + fila[i] * ys[k], 0));
    const w = D.resolver(A, b);
    return (x) => w.reduce((s, wj, j) => s + wj * x ** j, 0);
  }

  D.modo('polinomio', {
    controles: [{ nombre: 'grado', min: 1, max: 9, paso: 1, valor: 2, etiqueta: 'grado del polinomio' }],
    fondo(ctx, g) {
      const xs = ctx.datos.map(d => d.x), ys = ctx.datos.map(d => d.y);
      const f = ajustar(xs, ys, Math.round(ctx.K.grado));
      ctx.estado.f = f;
      const N = 60, x0 = ctx.vista.x0, x1 = ctx.vista.x1, c = ctx.c;
      const pts = Array.from({ length: N + 1 }, (_, i) => { const x = x0 + (x1 - x0) * i / N; return `${ctx.X(x).toFixed(1)},${ctx.Y(f(x)).toFixed(1)}`; });
      ctx.api.el('polyline', { points: pts.join(' '), fill: 'none', stroke: c.acento, 'stroke-width': 2.5 }, g);
    },
    colorPunto(ctx) { return ctx.c.series[0]; },
    leyenda(ctx) { return [[`curva ajustada (grado ${Math.round(ctx.K.grado)})`, ctx.c.acento]]; },
    lectura(ctx) {
      const grado = Math.round(ctx.K.grado), n = ctx.datos.length, num = ctx.num;
      const ecm = ctx.datos.reduce((a, d) => a + (d.y - ctx.estado.f(d.x)) ** 2, 0) / n;
      const aviso = grado >= n - 2
        ? ' Con este grado la curva puede pasar por (casi) todos los puntos: es <strong>sobreajuste</strong>, no un patrón que generalice.'
        : '';
      return [
        `Error cuadrático medio sobre estos mismos puntos: <strong>${num(ecm, 4)}</strong>.${aviso}`,
        'Sube el grado: el error en estos puntos baja, pero la curva empieza a serpentear entre ellos en vez de seguir la tendencia.',
      ];
    },
  });
  }
})();
