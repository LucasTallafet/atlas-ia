// Motor "dispersion2d", modo "arbol": árbol de decisión (cortes por eje que minimizan la impureza
// de Gini) sobre una nube de puntos, con las regiones resultantes coloreadas por clase.
(function () {
  'use strict';
  if (window.Dispersion2d) registrar(); else Motores.cargar('dispersion2d').then(registrar);
  function registrar() {
  const D = window.Dispersion2d;
  function contarHojas(nodo) { return nodo.hoja ? 1 : contarHojas(nodo.izq) + contarHojas(nodo.der); }

  D.modo('arbol', {
    controles: [{ nombre: 'profundidad', min: 1, max: 5, paso: 1, valor: 2, etiqueta: 'profundidad máxima' }],
    fondo(ctx, g) {
      const nodo = D.construirArbol(ctx.datos, Math.round(ctx.K.profundidad));
      ctx.estado.nodo = nodo;
      const regiones = D.regionesArbol(nodo, ctx.dom);
      regiones.forEach(r => {
        const xA = ctx.X(r.x0), xB = ctx.X(r.x1), yA = ctx.Y(r.y0), yB = ctx.Y(r.y1);
        const x = Math.min(xA, xB), w = Math.abs(xB - xA), y = Math.min(yA, yB), h = Math.abs(yB - yA);
        ctx.api.el('rect', { x, y, width: w, height: h, fill: ctx.colorClase(r.clase), 'fill-opacity': 0.16, stroke: ctx.c.linea, 'stroke-width': 1 }, g);
      });
    },
    leyenda(ctx) { return [['región = predicción de la hoja que la contiene', ctx.c.suave]]; },
    lectura(ctx) {
      const nodo = ctx.estado.nodo, num = ctx.num;
      const aciertos = ctx.datos.filter(d => D.evaluarArbol(nodo, d.x, d.y) === d.c).length;
      return [
        `Profundidad máxima: ${Math.round(ctx.K.profundidad)} · hojas: ${contarHojas(nodo)} · aciertos en los datos: ${aciertos}/${ctx.datos.length}.`,
        'Cada corte parte el plano en dos por el eje x o el eje y donde más baja la impureza de Gini. Sube la profundidad y el árbol memoriza puntos sueltos (sobreajuste); bájala y agrupa demasiado (infraajuste).',
      ];
    },
  });
  }
})();
