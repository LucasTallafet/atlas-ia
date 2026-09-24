// Motor "dispersion2d", modo "knn": clasificación por los k vecinos más cercanos. Un punto de
// consulta arrastrable muestra sus k vecinos, el voto de cada clase y la región de decisión resultante.
(function () {
  'use strict';
  if (window.Dispersion2d) registrar(); else Motores.cargar('dispersion2d').then(registrar);
  function registrar() {
  const D = window.Dispersion2d;

  function vecinos(datos, x, y, k) {
    const dist = datos.map((d, i) => ({ i, d2: (d.x - x) ** 2 + (d.y - y) ** 2 }));
    dist.sort((a, b) => a.d2 - b.d2);
    return dist.slice(0, Math.min(k, datos.length));
  }
  function votar(datos, vec) {
    const conteo = {};
    vec.forEach(v => { const c = datos[v.i].c; conteo[c] = (conteo[c] || 0) + 1; });
    let clase = 0, mejor = -1;
    for (const c in conteo) if (conteo[c] > mejor) { mejor = conteo[c]; clase = +c; }
    return { clase, conteo };
  }

  D.modo('knn', {
    controles: [{ nombre: 'k', min: 1, max: 15, paso: 1, valor: 5, etiqueta: 'k vecinos más cercanos' }],
    iniciar(ctx) {
      const mx = D.mediaDe(ctx.datos.map(d => d.x)), my = D.mediaDe(ctx.datos.map(d => d.y));
      ctx.estado.q = { x: mx + (ctx.dom.x1 - ctx.dom.x0) * 0.14, y: my - (ctx.dom.y1 - ctx.dom.y0) * 0.1 };
    },
    fondo(ctx, g) {
      const k = Math.round(ctx.K.k);
      D.grilla(ctx, g, 14, 20, (x, y) => votar(ctx.datos, vecinos(ctx.datos, x, y, k)).clase);
    },
    frente(ctx, s) {
      const E = ctx.estado, api = ctx.api, c = ctx.c, k = Math.round(ctx.K.k);
      const vec = vecinos(ctx.datos, E.q.x, E.q.y, k), voto = votar(ctx.datos, vec);
      E.ultimoVoto = voto;
      vec.forEach(nb => {
        const d = ctx.datos[nb.i];
        api.el('line', { x1: ctx.X(E.q.x), y1: ctx.Y(E.q.y), x2: ctx.X(d.x), y2: ctx.Y(d.y), stroke: c.suave, 'stroke-width': 1, 'stroke-opacity': 0.6 }, s);
      });
      const rMax = Math.sqrt(vec[vec.length - 1].d2), rPix = Math.abs(ctx.X(E.q.x + rMax) - ctx.X(E.q.x));
      api.el('circle', { cx: ctx.X(E.q.x), cy: ctx.Y(E.q.y), r: rPix, fill: 'none', stroke: c.suave, 'stroke-dasharray': '3 3' }, s);
      const [qx, qy] = ctx.pt(E.q.x, E.q.y);
      const grupo = api.el('g', { 'data-px': qx, 'data-py': qy }, s);
      api.el('circle', { cx: qx, cy: qy, r: 13, fill: 'none', stroke: c.texto, 'stroke-opacity': 0.5 }, grupo);
      api.el('circle', { cx: qx, cy: qy, r: 8, fill: ctx.colorClase(voto.clase), stroke: c.texto, 'stroke-width': 2 }, grupo);
      ctx.asa(grupo, 'q', 'Punto de consulta', (x, y) => { E.q = { x, y }; });
    },
    leyenda(ctx) {
      return [['líneas a los k vecinos', ctx.c.suave], ['círculo: distancia al k-ésimo vecino', ctx.c.suave], ['punto de consulta (arrástralo)', ctx.c.texto]];
    },
    lectura(ctx) {
      const E = ctx.estado, num = ctx.num;
      const partes = Object.keys(E.ultimoVoto.conteo).sort().map(c => `clase ${c}: ${E.ultimoVoto.conteo[c]}`);
      return [
        `k = ${Math.round(ctx.K.k)} → ${partes.join(' · ')} → predicción: clase ${E.ultimoVoto.clase}.`,
        'Arrastra el punto de consulta o los datos: la región de color muestra qué predeciría knn en cada zona del plano. Con k grande, la frontera se suaviza; con k = 1, se pega a cada punto.',
      ];
    },
  });
  }
})();
