// @modos: clasificacion, desbalanceo, grupos
// Motor "umbral": puntuaciones de un clasificador binario, umbral arrastrable, matriz de confusión, métricas y curva ROC / PR.
(function () {
  'use strict';

  const METRICAS = {
    accuracy: ['Exactitud', m => (m.tp + m.tn) / (m.tp + m.tn + m.fp + m.fn)],
    precision: ['Precisión', m => m.tp / (m.tp + m.fp)],
    recall: ['Recall (TPR)', m => m.tp / (m.tp + m.fn)],
    especificidad: ['Especificidad', m => m.tn / (m.tn + m.fp)],
    f1: ['F1', m => 2 * m.tp / (2 * m.tp + m.fp + m.fn)],
    fpr: ['FPR', m => m.fp / (m.fp + m.tn)],
  };
  const PASO = 0.02; // anchura de las barras del histograma = paso del umbral (así ninguna barra queda partida)

  // Puntuaciones normales recortadas a (0, 1), reproducibles
  function puntuaciones(d, n, semilla, api) {
    const r = api.aleatorio(semilla), out = [];
    for (let i = 0; i < n; i++) out.push(Math.min(0.9995, Math.max(0.0005, r.normal(d.media, d.desv))));
    return out;
  }
  function confusion(pos, neg, t) {
    let tp = 0, fp = 0;
    pos.forEach(s => { if (s >= t) tp++; });
    neg.forEach(s => { if (s >= t) fp++; });
    return { tp, fn: pos.length - tp, fp, tn: neg.length - fp };
  }
  // Curvas ROC y PR recorriendo todos los umbrales posibles
  function curvas(pos, neg) {
    const todos = pos.map(s => [s, 1]).concat(neg.map(s => [s, 0])).sort((a, b) => b[0] - a[0]);
    const P = pos.length || 1, N = neg.length || 1;
    const roc = [[0, 0]], pr = [];
    let tp = 0, fp = 0, auc = 0;
    for (let i = 0; i < todos.length; i++) {
      if (todos[i][1]) tp++; else fp++;
      if (i < todos.length - 1 && todos[i + 1][0] === todos[i][0]) continue;
      const x = fp / N, y = tp / P, prev = roc[roc.length - 1];
      auc += (x - prev[0]) * (y + prev[1]) / 2;
      roc.push([x, y]);
      pr.push([tp / P, tp / (tp + fp)]);
    }
    return { roc, pr, auc };
  }

  Motores.registrar('umbral', function (el, p, api) {
    const H = api.html, num = api.num, modo = p.modo;
    const metricas = (p.metricas && p.metricas.length ? p.metricas : Object.keys(METRICAS)).filter(k => METRICAS[k]);
    const original = JSON.parse(JSON.stringify(p));
    const defGrupos = modo === 'grupos'
      ? (p.grupos || []).map(g => ({ nombre: g.nombre, positivos: g.positivos || p.positivos, negativos: g.negativos || p.negativos }))
      : [{ nombre: '', positivos: p.positivos, negativos: p.negativos }];
    if (!defGrupos.length) throw new Error('El modo grupos necesita "grupos"');
    const N0 = p.positivos.n + p.negativos.n;
    const E = { t: 0.5, prev: p.positivos.n / N0, curva: modo === 'desbalanceo' ? 'pr' : 'roc', porGrupo: false, tg: defGrupos.map(() => 0.5) };

    function datos() {
      return defGrupos.map((g, k) => {
        let np = g.positivos.n, nn = g.negativos.n;
        if (modo === 'desbalanceo') { np = Math.max(1, Math.round(E.prev * N0)); nn = N0 - np; }
        const pos = puntuaciones(g.positivos, modo === 'desbalanceo' ? N0 : np, 101 + 17 * k, api).slice(0, np);
        const neg = puntuaciones(g.negativos, modo === 'desbalanceo' ? N0 : nn, 202 + 17 * k, api).slice(0, nn);
        return { nombre: g.nombre, pos, neg, cur: curvas(pos, neg) };
      });
    }
    let G = datos();
    const umbralDe = (k) => (modo === 'grupos' && E.porGrupo ? E.tg[k] : E.t);

    // ───── Estructura ─────
    const grafica = H('div', { class: 'motor-grafica' });
    const leyenda = H('div', { class: 'motor-leyenda' });
    const paneles = H('div', { class: 'umbral-paneles' });
    const izq = H('div', { class: 'umbral-izq' }), der = H('div', { class: 'umbral-der' });
    paneles.append(izq, der);
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, leyenda, paneles, lectura, controles);

    const redondeo = (v) => Math.min(1, Math.max(0, Math.round(v / PASO) * PASO));
    const sUmbral = api.slider({ etiqueta: 'umbral t', min: 0, max: 1, paso: PASO, valor: E.t, alCambiar: v => { E.t = v; dibujar(); } });
    controles.append(sUmbral);
    const sGrupos = defGrupos.map((g, k) => api.slider({ etiqueta: 'umbral de ' + g.nombre, min: 0, max: 1, paso: PASO, valor: E.tg[k], alCambiar: v => { E.tg[k] = v; dibujar(); } }));
    if (modo === 'grupos') {
      sGrupos.forEach(s => { s.style.display = 'none'; controles.append(s); });
      const b = api.boton('Un umbral por grupo', () => {
        E.porGrupo = !E.porGrupo;
        b.setAttribute('aria-pressed', String(E.porGrupo));
        sUmbral.style.display = E.porGrupo ? 'none' : '';
        sGrupos.forEach((s, k) => { s.style.display = E.porGrupo ? '' : 'none'; if (E.porGrupo) { E.tg[k] = E.t; s.valor = E.t; } });
        dibujar();
      }, { 'aria-pressed': 'false' });
      controles.append(b);
    }
    if (modo === 'desbalanceo') {
      controles.append(api.slider({ etiqueta: 'proporción de positivos', min: 0.01, max: 0.5, paso: 0.01, valor: E.prev, formato: v => num(100 * v, 0) + ' %', alCambiar: v => { E.prev = v; G = datos(); dibujar(); } }));
    }
    const bCurva = api.boton('', () => { E.curva = E.curva === 'roc' ? 'pr' : 'roc'; dibujar(); });
    controles.append(bCurva, api.boton('Reiniciar', () => { Motores.desmontar(el); Motores.montar(el, 'umbral', JSON.parse(JSON.stringify(original))); }));

    // ───── Histograma espejo: positivos arriba, negativos abajo ─────
    function histograma(s, c, caja, g, t, k, maxCuenta) {
      const X = api.escala(0, 1, caja.l, caja.r), medio = (caja.t + caja.b) / 2, alto = (caja.b - caja.t) / 2 - 14;
      const Y = (n) => n / maxCuenta * alto;
      const nb = Math.round(1 / PASO), cp = new Array(nb).fill(0), cn = new Array(nb).fill(0);
      const bin = (v) => Math.min(nb - 1, Math.floor(v / PASO + 1e-9));
      g.pos.forEach(v => cp[bin(v)]++); g.neg.forEach(v => cn[bin(v)]++);
      const cPos = c.series[0], cNeg = c.series[1];
      const gr = api.el('g', {}, s);
      api.el('rect', { x: X(t), y: caja.t, width: Math.max(0, caja.r - X(t)), height: caja.b - caja.t, fill: c.acento, 'fill-opacity': 0.07 }, gr);
      for (let b = 0; b < nb; b++) {
        const x = X(b * PASO) + 0.5, w = Math.max(1, X(PASO) - X(0) - 1), dentro = b * PASO >= t - 1e-9;
        if (cp[b]) api.el('rect', { x, y: medio - Y(cp[b]), width: w, height: Y(cp[b]), fill: cPos, 'fill-opacity': dentro ? 0.95 : 0.3 }, gr);
        if (cn[b]) api.el('rect', { x, y: medio, width: w, height: Y(cn[b]), fill: cNeg, 'fill-opacity': dentro ? 0.95 : 0.3 }, gr);
      }
      api.el('line', { x1: caja.l, x2: caja.r, y1: medio, y2: medio, stroke: c.suave }, gr);
      const m = confusion(g.pos, g.neg, t);
      const et = (x, y, txt, ancla, color) => api.el('text', { x, y, 'text-anchor': ancla, 'font-size': 12, 'font-weight': 600, fill: color, text: txt, 'paint-order': 'stroke', stroke: c.superficie, 'stroke-width': 3 }, gr);
      et(caja.l + 4, caja.t + 12, `FN ${m.fn}`, 'start', c.mal);
      et(caja.r - 4, caja.t + 12, `TP ${m.tp}`, 'end', c.bien);
      et(caja.l + 4, caja.b - 4, `TN ${m.tn}`, 'start', c.bien);
      et(caja.r - 4, caja.b - 4, `FP ${m.fp}`, 'end', c.mal);
      if (g.nombre) et(caja.l + 4, caja.t + 28, 'Grupo ' + g.nombre, 'start', c.texto);
      api.el('line', { x1: X(t), x2: X(t), y1: caja.t, y2: caja.b, stroke: c.texto, 'stroke-width': 2 }, gr);
      api.el('path', { d: `M${X(t) - 6},${caja.t} L${X(t) + 6},${caja.t} L${X(t)},${caja.t + 8}Z`, fill: c.texto }, gr);
      return { X, k, t0: caja.t, t1: caja.b };
    }

    function tablaConfusion(m) {
      const celda = (v, cls, nombre) => `<td class="${cls}"><span>${nombre}</span><b>${v}</b></td>`;
      return `<div class="tabla-scroll"><table class="motor-tabla umbral-confusion"><thead><tr><th></th><th scope="col">Predicha: positiva</th><th scope="col">Predicha: negativa</th></tr></thead><tbody>` +
        `<tr><th scope="row">Real: positiva</th>${celda(m.tp, 'ok', 'TP ✓')}${celda(m.fn, 'ko', 'FN ✗')}</tr>` +
        `<tr><th scope="row">Real: negativa</th>${celda(m.fp, 'ko', 'FP ✗')}${celda(m.tn, 'ok', 'TN ✓')}</tr></tbody></table></div>`;
    }
    function barrasMetricas(m) {
      return '<div class="umbral-metricas">' + metricas.map(k => {
        const v = METRICAS[k][1](m);
        return `<div class="umbral-metrica"><span>${METRICAS[k][0]}</span><span class="umbral-barra"><i style="width:${Number.isFinite(v) ? (100 * v).toFixed(1) : 0}%"></i></span><b>${num(v, 3)}</b></div>`;
      }).join('') + '</div>';
    }

    function curva(c) {
      const L = 300, m = { l: 40, r: 10, t: 10, b: 36 };
      const s = api.svg(L, L);
      s.classList.add('umbral-curva');
      s.setAttribute('role', 'img');
      const X = api.escala(0, 1, m.l, L - m.r), Y = api.escala(0, 1, L - m.b, m.t);
      const g = api.el('g', { 'font-size': 11, fill: c.suave }, s);
      [0, 0.25, 0.5, 0.75, 1].forEach(v => {
        api.el('line', { x1: X(v), x2: X(v), y1: Y(0), y2: Y(1), stroke: c.rejilla }, g);
        api.el('line', { x1: X(0), x2: X(1), y1: Y(v), y2: Y(v), stroke: c.rejilla }, g);
        api.el('text', { x: X(v), y: Y(0) + 14, 'text-anchor': 'middle', text: num(v, 2) }, g);
        api.el('text', { x: X(0) - 4, y: Y(v) + 4, 'text-anchor': 'end', text: num(v, 2) }, g);
      });
      api.el('rect', { x: X(0), y: Y(1), width: X(1) - X(0), height: Y(0) - Y(1), fill: 'none', stroke: c.linea }, g);
      const roc = E.curva === 'roc';
      api.el('text', { x: (X(0) + X(1)) / 2, y: L - 4, 'text-anchor': 'middle', fill: c.texto, text: roc ? 'FPR (falsos positivos)' : 'Recall' }, g);
      api.el('text', { x: 11, y: (Y(0) + Y(1)) / 2, 'text-anchor': 'middle', fill: c.texto, transform: `rotate(-90 11 ${(Y(0) + Y(1)) / 2})`, text: roc ? 'TPR (recall)' : 'Precisión' }, g);
      G.forEach((gr, k) => {
        const color = modo === 'grupos' ? c.series[(k + 2) % 8] : c.acento;
        if (roc && k === 0) api.el('line', { x1: X(0), y1: Y(0), x2: X(1), y2: Y(1), stroke: c.suave, 'stroke-dasharray': '5 4' }, g);
        if (!roc) { const base = gr.pos.length / (gr.pos.length + gr.neg.length); api.el('line', { x1: X(0), x2: X(1), y1: Y(base), y2: Y(base), stroke: color, 'stroke-dasharray': '5 4', 'stroke-opacity': 0.7 }, g); }
        const pts = roc ? gr.cur.roc : gr.cur.pr;
        api.el('path', { d: pts.map((q, i) => (i ? 'L' : 'M') + X(q[0]).toFixed(1) + ',' + Y(q[1]).toFixed(1)).join(''), fill: 'none', stroke: color, 'stroke-width': 2.2 }, g);
        const mm = confusion(gr.pos, gr.neg, umbralDe(k));
        const px = roc ? METRICAS.fpr[1](mm) : METRICAS.recall[1](mm), py = roc ? METRICAS.recall[1](mm) : METRICAS.precision[1](mm);
        if (Number.isFinite(px) && Number.isFinite(py)) api.el('circle', { cx: X(px), cy: Y(py), r: 6, fill: color, stroke: c.superficie, 'stroke-width': 2 }, g);
      });
      s.setAttribute('aria-label', roc ? 'Curva ROC con el punto del umbral actual' : 'Curva precisión-recall con el punto del umbral actual');
      return s;
    }

    // ───── Dibujo ─────
    function dibujar() {
      const c = api.colores();
      const W = Math.max(300, Math.min(el.clientWidth || 640, 900));
      const altoG = modo === 'grupos' ? 150 : 210, eje = 22;
      const alto = G.length * altoG + eje;
      grafica.innerHTML = ''; izq.innerHTML = ''; der.innerHTML = ''; leyenda.innerHTML = '';
      const s = api.svg(W, alto);
      s.setAttribute('role', 'img');
      grafica.append(s);
      let maxCuenta = 1;
      G.forEach(g => {
        const cu = (arr) => { const h = {}; arr.forEach(v => { const b = Math.floor(v / PASO + 1e-9); h[b] = (h[b] || 0) + 1; }); return Math.max(0, ...Object.values(h)); };
        maxCuenta = Math.max(maxCuenta, cu(g.pos), cu(g.neg));
      });
      const zonas = G.map((g, k) => histograma(s, c, { l: 12, r: W - 12, t: k * altoG + 4, b: (k + 1) * altoG - 4 }, g, umbralDe(k), k, maxCuenta));
      const X = zonas[0].X;
      const ge = api.el('g', { 'font-size': 11, fill: c.suave }, s);
      for (let v = 0; v <= 1.0001; v += 0.1) api.el('text', { x: X(v), y: alto - 6, 'text-anchor': 'middle', text: num(v, 1) }, ge);

      s.style.touchAction = 'pan-y'; s.style.cursor = 'ew-resize';
      actual = { s, X, altoG };

      leyenda.append(
        H('span', { class: 'leyenda-item' }, H('span', { class: 'leyenda-muestra', style: `--c:${c.series[0]}` }), 'clase positiva (arriba)'),
        H('span', { class: 'leyenda-item' }, H('span', { class: 'leyenda-muestra', style: `--c:${c.series[1]}` }), 'clase negativa (abajo)'),
        H('span', { class: 'leyenda-item', text: 'eje horizontal: puntuación del modelo · zona sombreada = se predice «positivo» (puntuación ≥ t)' }));

      const lineas = [];
      if (modo === 'grupos') {
        const filas = G.map((g, k) => {
          const m = confusion(g.pos, g.neg, umbralDe(k)), n = g.pos.length + g.neg.length;
          return { g, m, tpr: METRICAS.recall[1](m), fpr: METRICAS.fpr[1](m), prec: METRICAS.precision[1](m), pp: (m.tp + m.fp) / n, k };
        });
        izq.innerHTML = `<div class="tabla-scroll"><table class="motor-tabla"><thead><tr><th>Grupo</th><th>umbral</th><th>pred. positivos</th><th>TPR</th><th>FPR</th><th>precisión</th></tr></thead><tbody>` +
          filas.map(f => `<tr><th scope="row"><span class="leyenda-muestra" style="--c:${c.series[(f.k + 2) % 8]}"></span>${f.g.nombre}</th><td>${num(umbralDe(f.k), 2)}</td><td>${num(100 * f.pp, 1)} %</td><td>${num(f.tpr, 3)}</td><td>${num(f.fpr, 3)}</td><td>${num(f.prec, 3)}</td></tr>`).join('') + '</tbody></table></div>';
        const rango = (clave) => { const v = filas.map(f => f[clave]).filter(Number.isFinite); return v.length ? Math.max(...v) - Math.min(...v) : NaN; };
        lineas.push(`Diferencia entre grupos · TPR: <strong>${num(rango('tpr'), 3)}</strong> · FPR: <strong>${num(rango('fpr'), 3)}</strong> · tasa de predichos positivos: <strong>${num(100 * rango('pp'), 1)} puntos</strong>`);
        lineas.push('AUC por grupo: ' + G.map(g => `${g.nombre} ${num(g.cur.auc, 3)}`).join(' · '));
      } else {
        const g = G[0], m = confusion(g.pos, g.neg, E.t);
        izq.innerHTML = tablaConfusion(m) + barrasMetricas(m);
        lineas.push(`Umbral t = <strong>${num(E.t, 2)}</strong>: se predice «positivo» si la puntuación es ≥ t · ${g.pos.length} positivos y ${g.neg.length} negativos reales.`);
        lineas.push(`AUC = <strong>${num(g.cur.auc, 3)}</strong> (resume todos los umbrales: no cambia al mover t).`);
        if (modo === 'desbalanceo') {
          const n = g.pos.length + g.neg.length;
          lineas.push(`Un modelo que dijera siempre «negativo» tendría exactitud <strong>${num(g.neg.length / n, 3)}</strong> y recall <strong>0</strong>.`);
        }
      }
      bCurva.textContent = E.curva === 'roc' ? 'Ver curva precisión-recall' : 'Ver curva ROC';
      der.append(curva(c));
      if (modo === 'grupos') der.append(H('div', { class: 'motor-leyenda' }, G.map((g, k) => H('span', { class: 'leyenda-item' }, H('span', { class: 'leyenda-muestra', style: `--c:${c.series[(k + 2) % 8]}` }), g.nombre))));
      der.append(H('p', { class: 'umbral-pie', text: E.curva === 'roc' ? 'Curva ROC: un punto por umbral; el círculo es el umbral actual; la diagonal, el azar.' : 'Curva PR: la línea discontinua es la precisión de predecir todo positivo (la proporción de positivos).' }));
      lectura.innerHTML = lineas.map(t => `<p>${t}</p>`).join('');
      s.setAttribute('aria-label', 'Histograma de puntuaciones con el umbral. ' + lectura.textContent);
    }

    // Arrastre del umbral: los eventos van al contenedor, que sobrevive a cada redibujado del SVG
    let actual = null, grupoArrastre = 0;
    const mover = (e, inicio) => {
      const { s, X, altoG } = actual, r = s.getBoundingClientRect(), f = s.viewBox.baseVal.width / r.width;
      const v = redondeo(X.inversa((e.clientX - r.left) * f));
      if (modo === 'grupos' && E.porGrupo) {
        if (inicio) grupoArrastre = Math.min(G.length - 1, Math.max(0, Math.floor((e.clientY - r.top) * f / altoG)));
        E.tg[grupoArrastre] = v; sGrupos[grupoArrastre].valor = v;
      } else { E.t = v; sUmbral.valor = v; }
      dibujar();
    };
    grafica.addEventListener('pointerdown', (e) => { if (!actual) return; grafica.setPointerCapture(e.pointerId); mover(e, true); });
    grafica.addEventListener('pointermove', (e) => { if (grafica.hasPointerCapture(e.pointerId)) mover(e, false); });

    dibujar();
    return { redibujar: dibujar };
  }, {
    ejemplos: {
      clasificacion: { modo: 'clasificacion', positivos: { n: 100, media: 0.65, desv: 0.15 }, negativos: { n: 100, media: 0.35, desv: 0.15 } },
      desbalanceo: { modo: 'desbalanceo', positivos: { n: 20, media: 0.62, desv: 0.15 }, negativos: { n: 380, media: 0.38, desv: 0.15 }, metricas: ['accuracy', 'precision', 'recall', 'f1'] },
      grupos: { modo: 'grupos', positivos: { n: 100, media: 0.65, desv: 0.15 }, negativos: { n: 100, media: 0.35, desv: 0.15 }, grupos: [{ nombre: 'A', positivos: { n: 80, media: 0.68, desv: 0.13 }, negativos: { n: 120, media: 0.35, desv: 0.13 } }, { nombre: 'B', positivos: { n: 40, media: 0.56, desv: 0.17 }, negativos: { n: 160, media: 0.4, desv: 0.17 } }] },
    },
  });
})();
