// Motor "dispersion2d", modo "comparar-clustering": la misma nube de puntos agrupada por
// k-means, jerárquico (enlace promedio) o DBSCAN, para comparar cómo cada uno reparte los datos.
(function () {
  'use strict';
  if (window.Dispersion2d) registrar(); else Motores.cargar('dispersion2d').then(registrar);
  function registrar() {
  const D = window.Dispersion2d;
  const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

  function kmeansAsignar(P, k, r) {
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
    return asig;
  }
  function jerarquicoAsignar(P, k) {
    let clusters = P.map((_, i) => [i]);
    const dist = (a, b) => { let s = 0, n = 0; a.forEach(i => b.forEach(j => { s += Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]); n++; })); return s / n; };
    while (clusters.length > k) {
      let mi = 0, mj = 1, md = Infinity;
      for (let i = 0; i < clusters.length; i++) for (let j = i + 1; j < clusters.length; j++) { const d = dist(clusters[i], clusters[j]); if (d < md) { md = d; mi = i; mj = j; } }
      clusters[mi] = clusters[mi].concat(clusters[mj]);
      clusters.splice(mj, 1);
    }
    const asig = new Array(P.length);
    clusters.forEach((c, ci) => c.forEach(i => asig[i] = ci));
    return asig;
  }
  function dbscanAsignar(P, eps, minPts) {
    const n = P.length, etiqueta = new Array(n).fill(null);
    const vecinosDe = i => { const v = []; for (let j = 0; j < n; j++) if (Math.hypot(P[j][0] - P[i][0], P[j][1] - P[i][1]) <= eps) v.push(j); return v; };
    let cid = 0;
    for (let i = 0; i < n; i++) {
      if (etiqueta[i] !== null) continue;
      const vec = vecinosDe(i);
      if (vec.length < minPts) { etiqueta[i] = -1; continue; }
      etiqueta[i] = cid;
      const cola = vec.filter(j => j !== i);
      while (cola.length) {
        const j = cola.shift();
        if (etiqueta[j] === -1) etiqueta[j] = cid;
        if (etiqueta[j] !== null) continue;
        etiqueta[j] = cid;
        const vecJ = vecinosDe(j);
        if (vecJ.length >= minPts) cola.push(...vecJ);
      }
      cid++;
    }
    return etiqueta;
  }
  function siluetaMedia(P, asig) {
    const clusters = {};
    asig.forEach((c, i) => { if (c < 0) return; (clusters[c] = clusters[c] || []).push(i); });
    const ids = Object.keys(clusters);
    if (ids.length < 2) return null;
    let suma = 0, cuenta = 0;
    for (let i = 0; i < P.length; i++) {
      if (asig[i] < 0) continue;
      const propio = clusters[asig[i]];
      const a = propio.length > 1 ? propio.filter(j => j !== i).reduce((s, j) => s + Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]), 0) / (propio.length - 1) : 0;
      let b = Infinity;
      ids.forEach(cid => { if (+cid === asig[i]) return; const otros = clusters[cid]; const d = otros.reduce((s, j) => s + Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]), 0) / otros.length; if (d < b) b = d; });
      suma += Math.max(a, b) ? (b - a) / Math.max(a, b) : 0;
      cuenta++;
    }
    return cuenta ? suma / cuenta : null;
  }
  function recalcular(ctx) {
    const E = ctx.estado, P = ctx.datos.map(d => [d.x, d.y]), k = Math.round(ctx.K.k);
    let asig;
    if (E.algoritmo === 'kmeans') asig = kmeansAsignar(P, k, ctx.api.aleatorio(500 + E.semilla));
    else if (E.algoritmo === 'jerarquico') asig = jerarquicoAsignar(P, k);
    else { const ext = v => Math.max(...v) - Math.min(...v); const escala = Math.max(ext(P.map(p => p[0])), ext(P.map(p => p[1]))); asig = dbscanAsignar(P, escala * 0.12, 4); }
    E.asig = asig;
    E.silueta = siluetaMedia(P, asig);
  }

  D.modo('comparar-clustering', {
    controles: [{ nombre: 'k', min: 2, max: 6, paso: 1, valor: 2, etiqueta: 'k (k-means y jerárquico)' }],
    iniciar(ctx) { ctx.estado.algoritmo = 'kmeans'; ctx.estado.semilla = 1; recalcular(ctx); },
    alCambiarControl(ctx) { recalcular(ctx); },
    alCambiarDatos(ctx) { recalcular(ctx); },
    botones(ctx) {
      const grupo = ctx.H('div', { class: 'motor-selector', role: 'group', 'aria-label': 'Algoritmo de agrupamiento' });
      const marcar = () => grupo.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === ctx.estado.algoritmo)));
      [['kmeans', 'k-means'], ['jerarquico', 'jerárquico'], ['dbscan', 'DBSCAN']].forEach(([m, etq]) => {
        const b = ctx.api.boton(etq, () => { ctx.estado.algoritmo = m; marcar(); recalcular(ctx); ctx.redibujar(); });
        b.dataset.m = m;
        grupo.append(b);
      });
      marcar();
      const otro = ctx.api.boton('Otra inicialización', () => { ctx.estado.semilla++; recalcular(ctx); ctx.redibujar(); });
      return [grupo, otro];
    },
    colorPunto(ctx, i) { const a = ctx.estado.asig[i]; return a < 0 ? ctx.c.mal : ctx.colorClase(a); },
    leyenda(ctx) { return [['× ruido (solo DBSCAN)', ctx.c.mal]]; },
    lectura(ctx) {
      const E = ctx.estado, num = ctx.num;
      const ruido = E.asig.filter(a => a < 0).length;
      const nombres = { kmeans: 'k-means', jerarquico: 'jerárquico (enlace promedio)', dbscan: 'DBSCAN' };
      const nClusters = new Set(E.asig.filter(a => a >= 0)).size;
      return [
        `${nombres[E.algoritmo]}: ${nClusters} clústeres` + (ruido ? ` · ${ruido} puntos de ruido` : '') + (E.silueta === null ? '' : ` · silueta media = ${num(E.silueta, 3)}`) + '.',
        'Cambia de algoritmo con los mismos datos: k-means y jerárquico buscan grupos convexos de tamaño parecido; DBSCAN encuentra formas irregulares y separa el ruido.',
      ];
    },
  });
  }
})();
