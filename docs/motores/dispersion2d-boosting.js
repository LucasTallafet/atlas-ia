// Motor "dispersion2d", modo "boosting": AdaBoost con tocones de decisión (árboles de profundidad
// 1). Cada ronda entrena un tocón sobre los datos ponderados, sube el peso de lo que falla y suma
// su voto (con peso α) al conjunto.
(function () {
  'use strict';
  if (window.Dispersion2d) registrar(); else Motores.cargar('dispersion2d').then(registrar);
  function registrar() {
  const D = window.Dispersion2d;

  function inicio(ctx) {
    const n = ctx.datos.length;
    return { pesos: new Array(n).fill(1 / n), ensemble: [], iter: 0, terminado: false };
  }
  function paso(ctx) {
    const E = ctx.estado, datos = ctx.datos;
    const nodo = D.construirArbol(datos, 1, E.pesos);
    const pred = datos.map(d => D.evaluarArbol(nodo, d.x, d.y));
    let err = 0;
    pred.forEach((p, i) => { if (p !== datos[i].c) err += E.pesos[i]; });
    err = Math.min(Math.max(err, 1e-6), 1 - 1e-6);
    const alpha = 0.5 * Math.log((1 - err) / err);
    E.ensemble.push({ nodo, alpha });
    let suma = 0;
    const nuevos = E.pesos.map((w, i) => { const y = datos[i].c === pred[i] ? 1 : -1; const wv = w * Math.exp(-alpha * y); suma += wv; return wv; });
    E.pesos = nuevos.map(w => w / suma);
    E.iter++;
    E.ultimoErr = err; E.ultimoAlpha = alpha; E.ultimoNodo = nodo;
    E.terminado = E.iter >= 15 || err < 1e-4;
  }
  function predecirEnsemble(ensemble, x, y) {
    let suma = 0;
    ensemble.forEach(({ nodo, alpha }) => { suma += alpha * (D.evaluarArbol(nodo, x, y) === 1 ? 1 : -1); });
    return suma >= 0 ? 1 : 0;
  }

  D.modo('boosting', {
    // Da una primera ronda ya en el arranque, para que el estado inicial muestre un tocón (ESPEC-WEB.md §8).
    iniciar(ctx) { Object.assign(ctx.estado, inicio(ctx)); paso(ctx); },
    alCambiarDatos(ctx) { Object.assign(ctx.estado, inicio(ctx)); paso(ctx); },
    paso,
    fondo(ctx, g) {
      const E = ctx.estado;
      D.grilla(ctx, g, 14, 20, (x, y) => predecirEnsemble(E.ensemble, x, y));
      const maxW = Math.max(...E.pesos);
      ctx.datos.forEach((d, i) => {
        const rr = 4.5 + 14 * (E.pesos[i] / maxW);
        ctx.api.el('circle', { cx: ctx.X(d.x), cy: ctx.Y(d.y), r: rr, fill: ctx.colorClase(d.c), 'fill-opacity': 0.18 }, g);
      });
    },
    leyenda(ctx) { return [['color de fondo = predicción combinada (voto ponderado por α)', ctx.c.suave], ['halo = peso actual del punto', ctx.c.suave]]; },
    lectura(ctx) {
      const E = ctx.estado, num = ctx.num;
      const aciertos = ctx.datos.filter(d => predecirEnsemble(E.ensemble, d.x, d.y) === d.c).length;
      const l = [`Ronda ${E.iter}: tocón en ${E.ultimoNodo.eje} ≤ ${num(E.ultimoNodo.umbral, 2)} · error ponderado = ${num(E.ultimoErr, 3)} · peso del voto α = ${num(E.ultimoAlpha, 3)}.`];
      l.push(`Conjunto combinado: ${aciertos}/${ctx.datos.length} aciertos. Los puntos con halo más grande pesan más porque el conjunto fallaba en ellos.`);
      if (E.terminado) l.push('Se ha llegado al límite de rondas (o el error ya es casi nulo).');
      return l;
    },
  });
  }
})();
