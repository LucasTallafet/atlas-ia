// Motor "dispersion2d", modo "logistica": regresión logística binaria entrenada por descenso de
// gradiente por lotes, con la frontera de decisión (y sus curvas de nivel) actualizándose paso a paso.
(function () {
  'use strict';
  if (window.Dispersion2d) registrar(); else Motores.cargar('dispersion2d').then(registrar);
  function registrar() {
  const D = window.Dispersion2d;
  const sigmoide = (z) => 1 / (1 + Math.exp(-z));
  const inicio = () => ({ w1: 0, w2: 0, b: 0, iter: 0, perdida: null, terminado: false });
  function paso(ctx) {
    const E = ctx.estado, eta = ctx.K.eta, n = ctx.datos.length;
    let gw1 = 0, gw2 = 0, gb = 0, perdida = 0;
    ctx.datos.forEach((d) => {
      const p = sigmoide(E.w1 * d.x + E.w2 * d.y + E.b), err = p - d.c;
      gw1 += err * d.x; gw2 += err * d.y; gb += err;
      const pc = Math.min(Math.max(p, 1e-9), 1 - 1e-9);
      perdida += -(d.c * Math.log(pc) + (1 - d.c) * Math.log(1 - pc));
    });
    const gradiente = Math.hypot(gw1 / n, gw2 / n, gb / n);
    E.w1 -= eta * gw1 / n; E.w2 -= eta * gw2 / n; E.b -= eta * gb / n;
    E.iter++; E.perdida = perdida / n; E.terminado = gradiente < 0.001 || E.iter >= 300;
  }

  D.modo('logistica', {
    controles: [{ nombre: 'eta', min: 0.05, max: 2, paso: 0.05, valor: 0.5, etiqueta: 'tasa de aprendizaje η' }],
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
      linea(-2, c.suave, 1, '3 3');
      linea(2, c.suave, 1, '3 3');
      linea(0, c.acento, 2.5);
    },
    leyenda(ctx) {
      return [['frontera de decisión (p = 0,5)', ctx.c.acento], ['p ≈ 0,12 / p ≈ 0,88 (banda de transición)', ctx.c.suave]];
    },
    lectura(ctx) {
      const E = ctx.estado, num = ctx.num;
      const aciertos = ctx.datos.filter(d => (sigmoide(E.w1 * d.x + E.w2 * d.y + E.b) >= 0.5 ? 1 : 0) === d.c).length;
      const l = [`Iteración ${E.iter}: pérdida (log-loss) = ${E.perdida === null ? '—' : num(E.perdida, 4)} · aciertos: ${aciertos}/${ctx.datos.length}.`];
      l.push(E.terminado
        ? 'El gradiente ya es casi nulo: la frontera apenas se mueve, ha convergido.'
        : 'Pulsa «Paso →» para dar un paso de descenso de gradiente, o «Hasta el final» para converger.');
      return l;
    },
  });
  }
})();
