// Motor "dispersion2d", modo "dbscan": clustering por densidad. Un punto núcleo tiene al menos
// minPts vecinos a distancia ≤ ε; los clústeres crecen encadenando núcleos y sus vecinos, y lo que
// queda fuera es ruido.
(function () {
  'use strict';
  if (window.Dispersion2d) registrar(); else Motores.cargar('dispersion2d').then(registrar);
  function registrar() {
  const D = window.Dispersion2d;

  function ejecutar(ctx) {
    const P = ctx.datos.map(d => [d.x, d.y]);
    const eps = ctx.K.eps, minPts = Math.round(ctx.K.minPts), n = P.length;
    const vecinosDe = i => { const v = []; for (let j = 0; j < n; j++) if (Math.hypot(P[j][0] - P[i][0], P[j][1] - P[i][1]) <= eps) v.push(j); return v; };
    const etiqueta = new Array(n).fill(null), esNucleo = new Array(n).fill(false);
    let cid = 0;
    for (let i = 0; i < n; i++) {
      if (etiqueta[i] !== null) continue;
      const vec = vecinosDe(i);
      if (vec.length < minPts) { etiqueta[i] = -1; continue; }
      esNucleo[i] = true;
      etiqueta[i] = cid;
      const cola = vec.filter(j => j !== i);
      while (cola.length) {
        const j = cola.shift();
        if (etiqueta[j] === -1) etiqueta[j] = cid;
        if (etiqueta[j] !== null) continue;
        etiqueta[j] = cid;
        const vecJ = vecinosDe(j);
        if (vecJ.length >= minPts) { esNucleo[j] = true; cola.push(...vecJ); }
      }
      cid++;
    }
    ctx.estado.etiqueta = etiqueta;
    ctx.estado.esNucleo = esNucleo;
    ctx.estado.nClusters = cid;
  }

  D.modo('dbscan', {
    controles: [
      { nombre: 'eps', min: 0.05, max: 1.2, paso: 0.05, valor: 0.3, etiqueta: 'ε (radio de vecindad)' },
      { nombre: 'minPts', min: 1, max: 10, paso: 1, valor: 4, etiqueta: 'mínimo de vecinos' },
    ],
    iniciar: ejecutar,
    alCambiarControl: ejecutar,
    alCambiarDatos: ejecutar,
    fondo(ctx, g) {
      const E = ctx.estado, rPix = Math.abs(ctx.X(ctx.vista.x0 + ctx.K.eps) - ctx.X(ctx.vista.x0));
      ctx.datos.forEach((d, i) => {
        if (!E.esNucleo[i]) return;
        ctx.api.el('circle', { cx: ctx.X(d.x), cy: ctx.Y(d.y), r: rPix, fill: ctx.c.acento, 'fill-opacity': 0.05, stroke: ctx.c.acento, 'stroke-opacity': 0.15 }, g);
      });
    },
    colorPunto(ctx, i) { const et = ctx.estado.etiqueta[i]; return et === -1 ? ctx.c.mal : ctx.colorClase(et); },
    leyenda(ctx) { return [['halo = vecindad ε de un punto núcleo', ctx.c.acento], ['× ruido (menos de minPts vecinos)', ctx.c.mal]]; },
    lectura(ctx) {
      const E = ctx.estado, num = ctx.num, ruido = E.etiqueta.filter(e => e === -1).length;
      return [
        `ε = ${num(ctx.K.eps, 2)}, minPts = ${Math.round(ctx.K.minPts)} → ${E.nClusters} clústeres, ${ruido} puntos de ruido.`,
        'Sube ε y los clústeres acaban fusionándose; bájalo y aparece más ruido. A diferencia de k-means, DBSCAN no necesita fijar de antemano el número de clústeres.',
      ];
    },
  });
  }
})();
