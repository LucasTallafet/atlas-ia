// Motor "dispersion2d", modo "gmm": mezcla de gaussianas ajustada por EM. Cada "Paso →" alterna un
// ciclo E (reparte la responsabilidad de cada punto entre las k gaussianas) y M (reajusta cada elipse).
(function () {
  'use strict';
  if (window.Dispersion2d) registrar(); else Motores.cargar('dispersion2d').then(registrar);
  function registrar() {
  const D = window.Dispersion2d;

  function densidadNormal(x, y, comp) {
    const { mx, my, sxx, syy, sxy } = comp, det = sxx * syy - sxy * sxy || 1e-6;
    const dx = x - mx, dy = y - my, invA = syy / det, invB = -sxy / det, invD = sxx / det;
    const expo = -0.5 * (dx * dx * invA + 2 * dx * dy * invB + dy * dy * invD);
    return Math.exp(expo) / (2 * Math.PI * Math.sqrt(Math.max(det, 1e-9)));
  }
  function pasoE(ctx) {
    const E = ctx.estado;
    E.resp = ctx.datos.map(d => {
      const pesos = E.comp.map(c => c.peso * densidadNormal(d.x, d.y, c)), s = pesos.reduce((a, b) => a + b, 0) || 1e-12;
      return pesos.map(p => p / s);
    });
  }
  function pasoM(ctx) {
    const E = ctx.estado, P = ctx.datos, n = P.length, k = E.comp.length;
    for (let j = 0; j < k; j++) {
      let sw = 0, sx = 0, sy = 0;
      P.forEach((d, i) => { const w = E.resp[i][j]; sw += w; sx += w * d.x; sy += w * d.y; });
      const mx = sw ? sx / sw : E.comp[j].mx, my = sw ? sy / sw : E.comp[j].my;
      let sxx = 0, syy = 0, sxy = 0;
      P.forEach((d, i) => { const w = E.resp[i][j], dx = d.x - mx, dy = d.y - my; sxx += w * dx * dx; syy += w * dy * dy; sxy += w * dx * dy; });
      E.comp[j] = { mx, my, sxx: (sw ? sxx / sw : 0.05) + 0.01, syy: (sw ? syy / sw : 0.05) + 0.01, sxy: sw ? sxy / sw : 0, peso: Math.max(sw / n, 1e-6) };
    }
    const suma = E.comp.reduce((a, c) => a + c.peso, 0);
    E.comp.forEach(c => { c.peso /= suma; });
  }
  function elipse(comp) {
    const { sxx, syy, sxy } = comp, tr = sxx + syy, det = sxx * syy - sxy * sxy;
    const disc = Math.sqrt(Math.max(0, (tr * tr) / 4 - det)), l1 = tr / 2 + disc, l2 = tr / 2 - disc;
    let v1;
    if (Math.abs(sxy) < 1e-9) v1 = sxx >= syy ? [1, 0] : [0, 1];
    else { const vx = l1 - syy, vy = sxy, m = Math.hypot(vx, vy) || 1; v1 = [vx / m, vy / m]; }
    return { l1, l2, v1, v2: [-v1[1], v1[0]] }; // v2 siempre perpendicular a v1 (evita elipses degeneradas cuando sxx ≈ syy)
  }
  function inicializar(ctx) {
    const P = ctx.datos.map(d => [d.x, d.y]), k = Math.round(ctx.K.k), r = ctx.api.aleatorio(41);
    const idx = P.map((_, i) => i);
    for (let i = 0; i < k; i++) { const j = i + Math.floor(r() * (idx.length - i)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    const xs = P.map(p => p[0]), ys = P.map(p => p[1]);
    // Covarianza inicial isótropa (círculo): una elipse ya orientada por eje sería engañosa antes del primer M.
    const v0 = (D.estadisticos(xs).sd ** 2 + D.estadisticos(ys).sd ** 2) / 2 * 0.3 + 0.02;
    ctx.estado.comp = idx.slice(0, k).map(i => ({ mx: P[i][0], my: P[i][1], sxx: v0, syy: v0, sxy: 0, peso: 1 / k }));
    ctx.estado.iter = 0;
    ctx.estado.terminado = false;
    pasoE(ctx);
  }
  function paso(ctx) { pasoM(ctx); pasoE(ctx); ctx.estado.iter++; ctx.estado.terminado = ctx.estado.iter >= 30; }

  D.modo('gmm', {
    controles: [{ nombre: 'k', min: 1, max: 6, paso: 1, valor: 3, etiqueta: 'número de componentes' }],
    iniciar: inicializar,
    alCambiarControl: inicializar,
    alCambiarDatos: inicializar,
    paso,
    fondo(ctx, g) {
      ctx.estado.comp.forEach((comp, j) => {
        const { l1, l2, v1, v2 } = elipse(comp), N = 40, pts = [];
        for (let t = 0; t <= N; t++) {
          const th = 2 * Math.PI * t / N, sx = Math.sqrt(Math.max(l1, 0)), sy = Math.sqrt(Math.max(l2, 0));
          const x = comp.mx + v1[0] * sx * Math.cos(th) + v2[0] * sy * Math.sin(th);
          const y = comp.my + v1[1] * sx * Math.cos(th) + v2[1] * sy * Math.sin(th);
          pts.push(ctx.X(x).toFixed(1) + ',' + ctx.Y(y).toFixed(1));
        }
        ctx.api.el('polygon', { points: pts.join(' '), fill: ctx.colorClase(j), 'fill-opacity': 0.12, stroke: ctx.colorClase(j), 'stroke-width': 2 }, g);
        ctx.api.el('circle', { cx: ctx.X(comp.mx), cy: ctx.Y(comp.my), r: 3, fill: ctx.colorClase(j) }, g);
      });
    },
    colorPunto(ctx, i) { let mj = 0, mp = -1; ctx.estado.resp[i].forEach((p, j) => { if (p > mp) { mp = p; mj = j; } }); return ctx.colorClase(mj); },
    leyenda(ctx) { return [['elipse = 1 desviación típica de cada gaussiana', ctx.c.suave]]; },
    lectura(ctx) {
      const E = ctx.estado, num = ctx.num;
      const logL = ctx.datos.reduce((s, d) => s + Math.log(E.comp.reduce((a, c) => a + c.peso * densidadNormal(d.x, d.y, c), 0) || 1e-12), 0);
      return [
        `Iteración ${E.iter}: verosimilitud logarítmica = ${num(logL, 2)}.`,
        E.terminado ? 'EM ha alternado el reparto de responsabilidades (E) y el reajuste de medias/covarianzas (M) hasta el límite de iteraciones.' : 'Pulsa «Paso →» para dar un ciclo E + M. Cada punto se colorea según la gaussiana más probable, aunque en realidad pertenece un poco a todas.',
      ];
    },
  });
  }
})();
