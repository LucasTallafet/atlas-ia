// Motor "dispersion2d", modo "pca": componentes principales de una nube de puntos 2D — los dos ejes
// de máxima varianza (autovectores de la matriz de covarianza) y la proyección sobre el primero.
(function () {
  'use strict';
  if (window.Dispersion2d) registrar(); else Motores.cargar('dispersion2d').then(registrar);
  function registrar() {
  const D = window.Dispersion2d;

  function pca(datos) {
    const xs = datos.map(d => d.x), ys = datos.map(d => d.y), n = xs.length;
    const mx = D.mediaDe(xs), my = D.mediaDe(ys);
    let sxx = 0, syy = 0, sxy = 0;
    for (let i = 0; i < n; i++) { const dx = xs[i] - mx, dy = ys[i] - my; sxx += dx * dx; syy += dy * dy; sxy += dx * dy; }
    sxx /= n; syy /= n; sxy /= n;
    const tr = sxx + syy, det = sxx * syy - sxy * sxy;
    const disc = Math.sqrt(Math.max(0, (tr * tr) / 4 - det));
    const l1 = tr / 2 + disc, l2 = tr / 2 - disc;
    const vec = (l) => {
      if (Math.abs(sxy) < 1e-9) return sxx >= syy ? [1, 0] : [0, 1];
      const vx = l - syy, vy = sxy, m = Math.hypot(vx, vy) || 1;
      return [vx / m, vy / m];
    };
    return { mx, my, l1, l2, v1: vec(l1), v2: vec(l2) };
  }

  D.modo('pca', {
    botones(ctx) {
      const E = ctx.estado;
      if (E.proyectar === undefined) E.proyectar = false;
      const b = ctx.api.boton('Proyectar sobre la 1ª componente', () => { E.proyectar = !E.proyectar; b.setAttribute('aria-pressed', String(E.proyectar)); ctx.redibujar(); });
      b.setAttribute('aria-pressed', String(E.proyectar));
      return [b];
    },
    fondo(ctx, g) {
      const r = pca(ctx.datos), c = ctx.c, escala = 1.6;
      ctx.estado.r = r;
      const eje = (v, l, color, ancho) => {
        const len = Math.sqrt(Math.max(l, 0)) * escala;
        const ax = r.mx - v[0] * len, ay = r.my - v[1] * len, bx = r.mx + v[0] * len, by = r.my + v[1] * len;
        ctx.api.el('line', { x1: ctx.X(ax), y1: ctx.Y(ay), x2: ctx.X(bx), y2: ctx.Y(by), stroke: color, 'stroke-width': ancho }, g);
      };
      eje(r.v2, r.l2, c.suave, 1.5);
      eje(r.v1, r.l1, c.acento, 2.5);
    },
    colorPunto(ctx) { return ctx.c.series[0]; },
    frente(ctx, s) {
      const E = ctx.estado;
      if (!E.proyectar) return;
      const r = E.r, c = ctx.c;
      ctx.datos.forEach(d => {
        const t = (d.x - r.mx) * r.v1[0] + (d.y - r.my) * r.v1[1];
        const px = r.mx + t * r.v1[0], py = r.my + t * r.v1[1];
        ctx.api.el('line', { x1: ctx.X(d.x), y1: ctx.Y(d.y), x2: ctx.X(px), y2: ctx.Y(py), stroke: c.mal, 'stroke-opacity': 0.5, 'stroke-dasharray': '2 2' }, s);
        ctx.api.el('circle', { cx: ctx.X(px), cy: ctx.Y(py), r: 3.5, fill: c.mal }, s);
      });
    },
    leyenda(ctx) {
      const base = [['1ª componente principal (máxima varianza)', ctx.c.acento], ['2ª componente (perpendicular)', ctx.c.suave]];
      return ctx.estado.proyectar ? base.concat([['proyección sobre la 1ª componente', ctx.c.mal]]) : base;
    },
    lectura(ctx) {
      const r = ctx.estado.r, num = ctx.num, tot = r.l1 + r.l2 || 1;
      return [
        `Varianza explicada: 1ª componente ${num(100 * r.l1 / tot, 1)} % · 2ª componente ${num(100 * r.l2 / tot, 1)} %.`,
        ctx.estado.proyectar
          ? 'Cada punto se ha aplastado sobre la 1ª componente: así se reduce de 2 a 1 dimensión perdiendo la menor varianza posible.'
          : 'Arrastra puntos hasta alinearlos: la 1ª componente girará para seguir la nueva dirección de máxima varianza.',
      ];
    },
  });
  }
})();
