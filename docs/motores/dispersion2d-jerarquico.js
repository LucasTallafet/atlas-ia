// Motor "dispersion2d", modo "jerarquico": clustering jerárquico aglomerativo (enlace promedio).
// "Paso →" fusiona los dos clústeres más cercanos; el panel muestra la distancia de cada fusión
// (el equivalente, en una lista, al dendrograma) para elegir dónde cortar.
(function () {
  'use strict';
  if (window.Dispersion2d) registrar(); else Motores.cargar('dispersion2d').then(registrar);
  function registrar() {
  const D = window.Dispersion2d;

  function construirDendrograma(P) {
    let clusters = P.map((_, i) => ({ miembros: [i] }));
    const historial = [];
    const distProm = (a, b) => { let s = 0, n = 0; a.miembros.forEach(i => b.miembros.forEach(j => { s += Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]); n++; })); return s / n; };
    while (clusters.length > 1) {
      let mi = 0, mj = 1, md = Infinity;
      for (let i = 0; i < clusters.length; i++) for (let j = i + 1; j < clusters.length; j++) { const d = distProm(clusters[i], clusters[j]); if (d < md) { md = d; mi = i; mj = j; } }
      const miembros = clusters[mi].miembros.concat(clusters[mj].miembros);
      historial.push({ dist: md, miembros });
      clusters[mi] = { miembros };
      clusters.splice(mj, 1);
    }
    return historial;
  }
  function particionEn(historial, n, revelados) {
    const id = Array.from({ length: n }, (_, i) => i);
    for (let s = 0; s < revelados; s++) { const nuevoId = n + s; historial[s].miembros.forEach(i => { id[i] = nuevoId; }); }
    return id;
  }
  function refrescar(ctx) { ctx.estado.asig = particionEn(ctx.estado.historial, ctx.datos.length, ctx.estado.revelados); }
  function reconstruir(ctx) {
    ctx.estado.historial = construirDendrograma(ctx.datos.map(d => [d.x, d.y]));
    ctx.estado.revelados = Math.min(ctx.estado.revelados || 0, ctx.estado.historial.length);
    refrescar(ctx);
    ctx.estado.terminado = ctx.estado.revelados >= ctx.estado.historial.length;
  }

  D.modo('jerarquico', {
    controles: [{ nombre: 'k', min: 1, max: 10, paso: 1, valor: 3, etiqueta: 'clústeres objetivo' }],
    iniciar(ctx) { ctx.estado.revelados = 0; reconstruir(ctx); },
    alCambiarDatos(ctx) { reconstruir(ctx); },
    paso(ctx) {
      const E = ctx.estado;
      if (E.revelados < E.historial.length) { E.revelados++; refrescar(ctx); }
      E.terminado = E.revelados >= E.historial.length;
    },
    botones(ctx) {
      return [ctx.api.boton('Ir al corte en k clústeres', () => {
        const E = ctx.estado, n = ctx.datos.length, k = Math.max(1, Math.min(n, Math.round(ctx.K.k)));
        E.revelados = Math.max(0, Math.min(E.historial.length, n - k));
        refrescar(ctx);
        E.terminado = E.revelados >= E.historial.length;
        ctx.redibujar();
      })];
    },
    colorPunto(ctx, i) { return ctx.colorClase(ctx.estado.asig[i]); },
    lectura(ctx) {
      const E = ctx.estado, num = ctx.num;
      const nClusters = ctx.datos.length - E.revelados;
      const l = [`${E.revelados} fusiones hechas → ${nClusters} clústeres.` + (E.revelados ? ` Última distancia de fusión: ${num(E.historial[E.revelados - 1].dist, 3)}.` : ' Cada punto es aún su propio clúster.')];
      l.push(E.terminado ? 'Todo se ha fusionado en un único clúster: fin del proceso.' : 'Pulsa «Paso →» para fusionar los dos clústeres más cercanos (enlace promedio), o usa el botón para saltar directamente al corte en k.');
      return l;
    },
    panel(ctx, cont) {
      const E = ctx.estado, api = ctx.api, c = ctx.c, num = ctx.num, hist = E.historial;
      const W = Math.max(280, Math.min(cont.clientWidth || 600, 600)), alto = 170;
      const m = { l: 44, r: 12, t: 12, b: 28 };
      const maxD = Math.max(...hist.map(h => h.dist), 0.1);
      const X = api.escala(1, hist.length, m.l, W - m.r), Y = api.escala(0, maxD * 1.05, alto - m.b, m.t);
      const s = api.svg(W, alto);
      s.setAttribute('role', 'img');
      const g = api.el('g', { 'font-size': 11, fill: c.suave }, s);
      api.marcas(0, maxD, 4).forEach(v => { api.el('line', { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), stroke: c.rejilla }, g); api.el('text', { x: m.l - 4, y: Y(v) + 4, 'text-anchor': 'end', text: num(v, 2) }, g); });
      api.el('polyline', { points: hist.map((h, i) => X(i + 1).toFixed(1) + ',' + Y(h.dist).toFixed(1)).join(' '), fill: 'none', stroke: c.acento, 'stroke-width': 2 }, s);
      hist.forEach((h, i) => api.el('circle', { cx: X(i + 1), cy: Y(h.dist), r: i < E.revelados ? 3.5 : 2.5, fill: i < E.revelados ? c.acento : c.superficie, stroke: c.acento, 'stroke-width': 1.5 }, s));
      const pasoObjetivo = hist.length - Math.round(ctx.K.k);
      if (pasoObjetivo >= 1 && pasoObjetivo <= hist.length) api.el('line', { x1: X(pasoObjetivo), x2: X(pasoObjetivo), y1: m.t, y2: alto - m.b, stroke: c.series[1], 'stroke-dasharray': '4 4' }, s);
      s.setAttribute('aria-label', 'Distancia de cada fusión, en orden');
      cont.append(api.html('h3', { text: 'Distancia de fusión en cada paso (línea discontinua: corte en k objetivo)' }), s);
      cont.className = 'disp-panel disp-codo';
    },
  });
  }
})();
