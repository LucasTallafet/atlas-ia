// Motor "dispersion2d", modo "silueta": agrupa con k-means y dibuja el gráfico de silueta clásico
// (una barra por punto, agrupadas por clúster) para juzgar si el número de clústeres k es razonable.
(function () {
  'use strict';
  if (window.Dispersion2d) registrar(); else Motores.cargar('dispersion2d').then(registrar);
  function registrar() {
  const D = window.Dispersion2d;
  const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

  function kmeans(P, k, r) {
    const C = [P[Math.floor(r() * P.length)]];
    while (C.length < k) {
      const Dd = P.map(q => Math.min(...C.map(c => d2(q, c)))), tot = Dd.reduce((a, b) => a + b, 0);
      let u = r() * tot, i = 0;
      while (i < P.length - 1 && u > Dd[i]) { u -= Dd[i]; i++; }
      C.push(P[i]);
    }
    let cent = C.map(c => c.slice()), asig = P.map(() => 0);
    for (let it = 0; it < 50; it++) {
      const nuevo = P.map(q => { let mj = 0, md = Infinity; cent.forEach((c, j) => { const dd = d2(q, c); if (dd < md) { md = dd; mj = j; } }); return mj; });
      const cambio = nuevo.some((v, i) => v !== asig[i]);
      asig = nuevo;
      cent = cent.map((c, j) => { let sx = 0, sy = 0, n = 0; P.forEach((q, i) => { if (asig[i] === j) { sx += q[0]; sy += q[1]; n++; } }); return n ? [sx / n, sy / n] : c; });
      if (!cambio) break;
    }
    return { cent, asig };
  }
  function siluetas(P, asig, k) {
    const grupos = Array.from({ length: k }, (_, j) => asig.map((a, i) => a === j ? i : -1).filter(i => i >= 0));
    return P.map((p, i) => {
      const propio = grupos[asig[i]];
      const a = propio.length > 1 ? propio.filter(j => j !== i).reduce((s, j) => s + Math.hypot(p[0] - P[j][0], p[1] - P[j][1]), 0) / (propio.length - 1) : 0;
      let b = Infinity;
      grupos.forEach((grp, gj) => { if (gj === asig[i] || !grp.length) return; const d = grp.reduce((s, j) => s + Math.hypot(p[0] - P[j][0], p[1] - P[j][1]), 0) / grp.length; if (d < b) b = d; });
      if (!isFinite(b)) b = 0;
      return Math.max(a, b) ? (b - a) / Math.max(a, b) : 0;
    });
  }
  function recalcular(ctx) {
    const P = ctx.datos.map(d => [d.x, d.y]), k = Math.round(ctx.K.k);
    const { cent, asig } = kmeans(P, k, ctx.api.aleatorio(500 + ctx.estado.semilla));
    ctx.estado.cent = cent;
    ctx.estado.asig = asig;
    ctx.estado.sil = siluetas(P, asig, k);
  }

  D.modo('silueta', {
    controles: [{ nombre: 'k', min: 2, max: 8, paso: 1, valor: 4, etiqueta: 'número de clústeres k' }],
    iniciar(ctx) { ctx.estado.semilla = 1; recalcular(ctx); },
    alCambiarControl(ctx) { recalcular(ctx); },
    alCambiarDatos(ctx) { recalcular(ctx); },
    botones(ctx) { return [ctx.api.boton('Otro inicio al azar', () => { ctx.estado.semilla++; recalcular(ctx); ctx.redibujar(); })]; },
    fondo(ctx, g) {
      ctx.estado.cent.forEach((c, j) => {
        const poli = ctx.celda(ctx.estado.cent, j, ctx.vista);
        if (poli.length > 2) ctx.api.el('polygon', { points: poli.map(q => ctx.pt(q[0], q[1]).map(v => v.toFixed(1)).join(',')).join(' '), fill: ctx.colorClase(j), 'fill-opacity': 0.08, stroke: ctx.colorClase(j), 'stroke-opacity': 0.3, 'stroke-dasharray': '4 4' }, g);
      });
    },
    colorPunto(ctx, i) { return ctx.colorClase(ctx.estado.asig[i]); },
    lectura(ctx) {
      const E = ctx.estado, num = ctx.num, media = D.mediaDe(E.sil), negativos = E.sil.filter(v => v < 0).length;
      return [
        `k = ${E.cent.length} clústeres → silueta media = ${num(media, 3)} (cerca de 1: bien separados · cerca de 0: solapados · negativo: mal clasificado).`,
        negativos ? `${negativos} puntos tienen silueta negativa: están más cerca de otro clúster que del suyo.` : 'Ningún punto tiene silueta negativa con este k. Prueba a subir o bajar k y compara la media.',
      ];
    },
    panel(ctx, cont) {
      const E = ctx.estado, api = ctx.api, c = ctx.c, num = ctx.num, k = E.cent.length;
      const orden = [];
      for (let j = 0; j < k; j++) orden.push(...E.asig.map((a, i) => a === j ? i : -1).filter(i => i >= 0).sort((a, b) => E.sil[b] - E.sil[a]));
      const n = orden.length, W = Math.max(280, Math.min(cont.clientWidth || 600, 600)), alturaBarra = Math.max(2, Math.min(6, 260 / n)), alto = Math.round(34 + n * alturaBarra);
      const m = { l: 26, r: 26, t: 10, b: 24 };
      const X = api.escala(-1, 1, m.l, W - m.r);
      const s = api.svg(W, alto);
      s.setAttribute('role', 'img');
      const g = api.el('g', {}, s);
      api.el('line', { x1: X(0), x2: X(0), y1: m.t, y2: alto - m.b, stroke: c.linea }, g);
      const media = D.mediaDe(E.sil);
      api.el('line', { x1: X(media), x2: X(media), y1: m.t, y2: alto - m.b, stroke: c.series[1], 'stroke-dasharray': '4 4' }, g);
      orden.forEach((i, pos) => {
        const v = E.sil[i], y = m.t + pos * alturaBarra;
        api.el('rect', { x: Math.min(X(0), X(v)), y, width: Math.abs(X(v) - X(0)) || 0.5, height: alturaBarra * 0.85, fill: ctx.colorClase(E.asig[i]) }, g);
      });
      api.el('text', { x: m.l, y: alto - 8, 'text-anchor': 'start', 'font-size': 11, fill: c.suave, text: '−1' }, g);
      api.el('text', { x: (X(0)), y: alto - 8, 'text-anchor': 'middle', 'font-size': 11, fill: c.suave, text: '0' }, g);
      api.el('text', { x: W - m.r, y: alto - 8, 'text-anchor': 'end', 'font-size': 11, fill: c.suave, text: '+1' }, g);
      s.setAttribute('aria-label', `Gráfico de silueta, media ${num(media, 3)}`);
      cont.append(api.html('h3', { text: `Gráfico de silueta — media = ${num(media, 3)}` }), s);
      cont.className = 'disp-panel disp-codo';
    },
  });
  }
})();
