// Motor "dispersion2d", modo "svm": SVM lineal de margen blando entrenada por descenso de
// subgradiente sobre la pérdida bisagra (hinge), con la frontera, el margen y los vectores de soporte.
(function () {
  'use strict';
  if (window.Dispersion2d) registrar(); else Motores.cargar('dispersion2d').then(registrar);
  function registrar() {
  const D = window.Dispersion2d;
  const ETA = 0.05;
  const inicio = () => ({ w1: 0, w2: 0, b: 0, iter: 0, perdida: null, vectores: 0, terminado: false });
  function paso(ctx) {
    const E = ctx.estado, C = ctx.K.C, lam = 1 / Math.max(C, 1e-6), n = ctx.datos.length;
    let gw1 = 0, gw2 = 0, gb = 0, perdida = 0, vectores = 0;
    ctx.datos.forEach(d => {
      const y = d.c ? 1 : -1, margen = y * (E.w1 * d.x + E.w2 * d.y + E.b);
      if (margen < 1) { gw1 += -y * d.x; gw2 += -y * d.y; gb += -y; perdida += (1 - margen); vectores++; }
    });
    gw1 = gw1 / n + lam * E.w1; gw2 = gw2 / n + lam * E.w2; gb = gb / n;
    E.w1 -= ETA * gw1; E.w2 -= ETA * gw2; E.b -= ETA * gb;
    E.perdida = perdida / n + (lam / 2) * (E.w1 ** 2 + E.w2 ** 2);
    E.vectores = vectores;
    E.iter++;
    E.terminado = E.iter >= 300 || Math.hypot(gw1, gw2, gb) < 1e-4;
  }

  D.modo('svm', {
    controles: [{ nombre: 'C', min: 0.1, max: 10, paso: 0.1, valor: 1, etiqueta: 'C (rigidez frente al margen)' }],
    // Da un primer paso ya en el arranque, para que el estado inicial muestre una frontera (ESPEC-WEB.md §8).
    iniciar(ctx) { Object.assign(ctx.estado, inicio()); paso(ctx); },
    alCambiarControl(ctx) { Object.assign(ctx.estado, inicio()); paso(ctx); },
    alCambiarDatos(ctx) { Object.assign(ctx.estado, inicio()); paso(ctx); },
    paso,
    fondo(ctx, g) {
      const { w1, w2, b } = ctx.estado, c = ctx.c, x0 = ctx.vista.x0, x1 = ctx.vista.x1;
      const linea = (nivel, color, ancho, guiones) => {
        const attrs = { stroke: color, 'stroke-width': ancho };
        if (guiones) attrs['stroke-dasharray'] = guiones;
        if (Math.abs(w2) > 1e-9) {
          ctx.api.el('line', Object.assign({ x1: ctx.X(x0), y1: ctx.Y((nivel - b - w1 * x0) / w2), x2: ctx.X(x1), y2: ctx.Y((nivel - b - w1 * x1) / w2) }, attrs), g);
        } else if (Math.abs(w1) > 1e-9) {
          const xv = (nivel - b) / w1;
          ctx.api.el('line', Object.assign({ x1: ctx.X(xv), y1: ctx.Y(ctx.vista.y0), x2: ctx.X(xv), y2: ctx.Y(ctx.vista.y1) }, attrs), g);
        }
      };
      linea(-1, c.suave, 1.5, '4 3');
      linea(1, c.suave, 1.5, '4 3');
      linea(0, c.acento, 2.5);
    },
    frente(ctx, s) {
      const E = ctx.estado, api = ctx.api, c = ctx.c;
      ctx.datos.forEach(d => {
        const y = d.c ? 1 : -1, margen = y * (E.w1 * d.x + E.w2 * d.y + E.b);
        if (margen < 1 + 1e-6) api.el('circle', { cx: ctx.X(d.x), cy: ctx.Y(d.y), r: 8, fill: 'none', stroke: c.texto, 'stroke-width': 1.5 }, s);
      });
    },
    leyenda(ctx) {
      return [['frontera (margen = 0)', ctx.c.acento], ['bordes del margen (±1)', ctx.c.suave], ['○ vector de soporte', ctx.c.texto]];
    },
    lectura(ctx) {
      const E = ctx.estado, num = ctx.num;
      const aciertos = ctx.datos.filter(d => { const y = d.c ? 1 : -1; return y * (E.w1 * d.x + E.w2 * d.y + E.b) > 0; }).length;
      const l = [`Iteración ${E.iter}: pérdida bisagra = ${num(E.perdida, 4)} · vectores de soporte: ${E.vectores} · aciertos: ${aciertos}/${ctx.datos.length}.`];
      l.push(E.terminado
        ? 'El gradiente ya es casi nulo: el margen apenas se mueve, ha convergido.'
        : 'Pulsa «Paso →» o «Hasta el final». Sube C y el margen se estrecha para ajustarse más a los datos; bájalo y el margen se ensancha aunque tolere más errores.');
      return l;
    },
  });
  }
})();
