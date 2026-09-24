// Motor "dispersion2d", modo "bosque": bosque aleatorio, un conjunto de árboles poco profundos
// entrenados cada uno sobre una muestra bootstrap distinta, combinados por voto mayoritario.
(function () {
  'use strict';
  if (window.Dispersion2d) registrar(); else Motores.cargar('dispersion2d').then(registrar);
  function registrar() {
  const D = window.Dispersion2d;
  const PROFUNDIDAD = 3;

  function construirBosque(ctx) {
    const nArb = Math.round(ctx.K.n_arboles), arboles = [];
    for (let t = 0; t < nArb; t++) {
      const r = ctx.api.aleatorio(1000 * ctx.estado.semilla + 37 * t + 7);
      const muestra = ctx.datos.map(() => ctx.datos[Math.floor(r() * ctx.datos.length)]);
      arboles.push(D.construirArbol(muestra, PROFUNDIDAD));
    }
    return arboles;
  }
  function votarBosque(arboles, x, y) {
    const conteo = {};
    arboles.forEach(a => { const c = D.evaluarArbol(a, x, y); conteo[c] = (conteo[c] || 0) + 1; });
    let clase = 0, mejor = -1;
    for (const c in conteo) if (conteo[c] > mejor) { mejor = conteo[c]; clase = +c; }
    return clase;
  }

  D.modo('bosque', {
    controles: [{ nombre: 'n_arboles', min: 1, max: 20, paso: 1, valor: 7, etiqueta: 'número de árboles' }],
    iniciar(ctx) { ctx.estado.semilla = 1; },
    botones(ctx) {
      return [ctx.api.boton('Otro bosque al azar', () => { ctx.estado.semilla++; ctx.redibujar(); })];
    },
    fondo(ctx, g) {
      const arboles = construirBosque(ctx);
      ctx.estado.arboles = arboles;
      D.grilla(ctx, g, 16, 22, (x, y) => votarBosque(arboles, x, y));
    },
    leyenda(ctx) { return [['color de fondo = voto mayoritario de los árboles del bosque', ctx.c.suave]]; },
    lectura(ctx) {
      const arboles = ctx.estado.arboles, num = ctx.num;
      const aciertos = ctx.datos.filter(d => votarBosque(arboles, d.x, d.y) === d.c).length;
      return [
        `${arboles.length} árboles (profundidad ${PROFUNDIDAD}), cada uno con una muestra bootstrap distinta → ${aciertos}/${ctx.datos.length} aciertos al votar.`,
        'Compara con «arbol»: un único árbol memoriza el ruido; al promediar muchos árboles entrenados con remuestreo (bagging), la frontera se suaviza y generaliza mejor.',
      ];
    },
  });
  }
})();
