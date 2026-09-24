// Motor "dispersion2d", modo "correlacion": coeficiente de correlación de Pearson r, visualizado como
// el acuerdo de signo entre (x-x̄) e (y-ȳ) en cada punto (a favor o en contra de la tendencia lineal).
(function () {
  'use strict';
  if (window.Dispersion2d) registrar(); else Motores.cargar('dispersion2d').then(registrar);
  function registrar() {
  const D = window.Dispersion2d;

  D.modo('correlacion', {
    fondo(ctx, g) {
      const xs = ctx.datos.map(d => d.x), ys = ctx.datos.map(d => d.y);
      const { mx, my } = D.regresionSimple(xs, ys), c = ctx.c;
      ctx.estado.mx = mx; ctx.estado.my = my;
      const px = ctx.X(mx), py = ctx.Y(my);
      ctx.api.el('line', { x1: px, x2: px, y1: ctx.caja.t, y2: ctx.caja.b, stroke: c.suave, 'stroke-dasharray': '3 3' }, g);
      ctx.api.el('line', { x1: ctx.caja.l, x2: ctx.caja.r, y1: py, y2: py, stroke: c.suave, 'stroke-dasharray': '3 3' }, g);
    },
    colorPunto(ctx, i) {
      const d = ctx.datos[i], acuerdo = (d.x - ctx.estado.mx) * (d.y - ctx.estado.my) >= 0;
      return acuerdo ? ctx.c.bien : ctx.c.mal;
    },
    leyenda(ctx) {
      return [['a favor de la tendencia (mismo signo)', ctx.c.bien], ['en contra (signo opuesto)', ctx.c.mal], ['medias de x e y', ctx.c.suave]];
    },
    lectura(ctx) {
      const xs = ctx.datos.map(d => d.x), ys = ctx.datos.map(d => d.y);
      const { r } = D.regresionSimple(xs, ys), num = ctx.num;
      const fuerza = Math.abs(r) >= 0.7 ? 'fuerte' : Math.abs(r) >= 0.3 ? 'moderada' : 'débil';
      const signo = r > 0.02 ? 'positiva' : r < -0.02 ? 'negativa' : 'casi nula';
      return [
        `r = <strong>${num(r, 3)}</strong> (r² = ${num(r * r, 3)}): correlación ${fuerza} y ${signo}.`,
        'Arrastra un punto lejos de la nube: al ser un valor atípico, cambia r mucho más que cualquier punto normal.',
      ];
    },
  });
  }
})();
