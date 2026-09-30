// @modos: ventana, drift
// Motor "serie": serie temporal con ventana deslizante (pares X, y supervisados) o deriva
// de una distribución entre una ventana de entrenamiento fija y otra de producción móvil.
(function () {
  'use strict';

  function generarSerie(cfg, api) {
    if (cfg.valores && cfg.valores.length) return cfg.valores.map(Number);
    const n = cfg.n || 120, ruido = cfg.ruido != null ? cfg.ruido : 0.15;
    const r = api.aleatorio(cfg.semilla != null ? cfg.semilla : 3);
    const gen = cfg.generador || 'seno';
    const out = [];
    for (let i = 0; i < n; i++) {
      let base;
      if (gen === 'tendencia') base = 0.02 * i;
      else if (gen === 'estacional') base = 0.015 * i + Math.sin(i / 6) * 0.8;
      else base = Math.sin(i / 8) * 1.2;
      out.push(base + r.normal(0, ruido));
    }
    return out;
  }

  // Estructura común: gráfico(s) (+ leyenda) arriba; lectura y controles debajo (§8b).
  function armazon(el, api) {
    const H = api.html, Z = api.zonas(el);
    const grafica = H('div', { class: 'motor-grafica' }), grafica2 = H('div', { class: 'motor-grafica' }), leyenda = H('div', { class: 'motor-leyenda' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' }), controles = H('div', { class: 'motor-controles' });
    Z.grafico.append(grafica, grafica2, leyenda);
    Z.controles.append(lectura, controles);
    return { grafica, grafica2, leyenda, lectura, controles };
  }
  const reiniciar = (el, p, api) => api.boton('Reiniciar', () => { Motores.desmontar(el); Motores.montar(el, 'serie', JSON.parse(JSON.stringify(p))); });
  // Botones ‹ › (alternativa al arrastre): mover en el tiempo sin gesto.
  function pasoTiempo(api, nombre, _, atras, adelante) {
    return api.html('div', { class: 'motor-selector', role: 'group', 'aria-label': 'Mover ' + nombre },
      api.boton('‹', atras, { 'aria-label': 'Retroceder ' + nombre }), api.boton('›', adelante, { 'aria-label': 'Avanzar ' + nombre }));
  }

  // ───────────────────────── ventana ─────────────────────────
  function ventana(el, p, api) {
    const H = api.html, num = api.num;
    const valores = generarSerie(p.serie || {}, api);
    const n = valores.length;
    if (n < 8) throw new Error('El modo ventana necesita al menos 8 valores en la serie');
    const wMax = Math.max(2, Math.min(8, Math.floor(n / 3)));
    const E = { w: Math.max(2, Math.min(p.ventana || 3, wMax)) };
    E.t = Math.min(n - 1, E.w + Math.floor((n - E.w) * 0.55));

    const { grafica, leyenda, lectura, controles } = armazon(el, api);

    let sT;
    const sW = api.slider({
      etiqueta: 'tamaño de ventana w', min: 2, max: wMax, paso: 1, valor: E.w,
      alCambiar: v => { E.w = v; if (E.t < E.w) { E.t = E.w; } sT.input.min = E.w; if (sT.valor < E.w) sT.valor = E.w; dibujar(); },
    });
    sT = api.slider({ etiqueta: 'posición t', min: E.w, max: n - 1, paso: 1, valor: E.t, alCambiar: v => { E.t = v; dibujar(); } });
    const mueve = (t) => {
      const tc = Math.min(n - 1, Math.max(E.w, Math.round(t)));
      if (tc !== E.t) { E.t = tc; sT.valor = E.t; dibujar(); }
    };
    controles.append(sW, sT, pasoTiempo(api, 'posición', -1, () => mueve(E.t - 1), () => mueve(E.t + 1)), reiniciar(el, p, api));

    function dibujar() {
      const c = api.colores();
      const W = api.medida(grafica, { maxAncho: 780, minAncho: 300 }).ancho, alto = 230;
      grafica.innerHTML = ''; lectura.innerHTML = ''; leyenda.innerHTML = '';
      const s = api.svg(W, alto);
      s.setAttribute('role', 'group');
      grafica.append(s);
      const F = api.fuente(s, 12);
      const caja = { l: 48, r: W - 12, t: 14, b: alto - 28 };
      const X = api.escala(0, n - 1, caja.l, caja.r);
      const lo = Math.min(...valores), hi = Math.max(...valores), m = (hi - lo) * 0.12 || 1;
      const Y = api.escala(lo - m, hi + m, caja.b, caja.t);
      const g = api.el('g', {}, s);
      api.marcas(lo - m, hi + m, 5).forEach(v => {
        api.el('line', { x1: caja.l, x2: caja.r, y1: Y(v), y2: Y(v), stroke: c.rejilla }, g);
        api.el('text', { x: caja.l - 6, y: Y(v) + 4, 'text-anchor': 'end', 'font-size': F, fill: c.suave, text: num(v, 2) }, g);
      });
      api.el('text', { x: caja.r, y: alto - 6, 'text-anchor': 'end', 'font-size': F, fill: c.suave, text: 'tiempo →' }, g);
      const wi = E.t - E.w, wf = E.t - 1;
      api.el('rect', { x: X(wi) - 3, y: caja.t, width: X(wf) - X(wi) + 6, height: caja.b - caja.t, fill: c.acento, 'fill-opacity': 0.12 }, g);
      let d = '';
      valores.forEach((v, i) => { d += (i ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(v).toFixed(1); });
      api.el('path', { d, fill: 'none', stroke: c.suave, 'stroke-width': 1.6 }, g);
      for (let i = wi; i <= wf; i++) api.el('circle', { cx: X(i), cy: Y(valores[i]), r: 5, fill: c.acento }, g);
      api.el('line', { x1: caja.l, x2: caja.r, y1: caja.b, y2: caja.b, stroke: c.suave }, g);
      const asa = api.el('circle', { cx: X(E.t), cy: Y(valores[E.t]), r: 9, fill: c.bien, stroke: c.superficie, 'stroke-width': 2 }, s);
      asa.style.cursor = 'ew-resize';
      // Arrastrar en horizontal recorre la serie en el tiempo; el scroll vertical sigue vivo (pan-y).
      api.arrastrable(asa, {
        zona: grafica, clave: 'objetivo', radio: Infinity, tactil: 'pan-y', etiqueta: 'Posición t (objetivo)',
        valor: () => `t = ${E.t} · y = ${num(valores[E.t], 2)}`,
        alMover: (q) => mueve(X.inversa(api.aSvg(s, q).x)),
        alTecla: (dx) => mueve(E.t + dx),
      });

      leyenda.append(
        H('span', { class: 'leyenda-item' }, H('span', { class: 'leyenda-muestra', style: `--c:${c.acento}` }), 'ventana (X)'),
        H('span', { class: 'leyenda-item' }, H('span', { class: 'leyenda-muestra', style: `--c:${c.bien}` }), 'objetivo (y)'),
      );

      const xVentana = valores.slice(wi, wf + 1).map(v => num(v, 2)).join(', ');
      lectura.innerHTML =
        `<p>Ventana X = [${xVentana}] (posiciones ${wi}…${wf}) → objetivo y = <strong>${num(valores[E.t], 3)}</strong> (posición ${E.t}).</p>` +
        `<p>Con w = ${E.w}, cada posición t genera un ejemplo supervisado: las w observaciones anteriores predicen la siguiente. Arrastra sobre la gráfica, usa ‹ › o mueve t para recorrer la serie.</p>`;
      s.setAttribute('aria-label', 'Serie temporal con una ventana deslizante. ' + lectura.textContent);
    }
    dibujar();
    return { redibujar: dibujar };
  }

  // ───────────────────────── drift ─────────────────────────
  function drift(el, p, api) {
    const H = api.html, num = api.num;
    const valores = generarSerie(p.serie || {}, api);
    const n = valores.length;
    if (n < 24) throw new Error('El modo drift necesita al menos 24 valores en la serie');
    const wRef = Math.max(8, Math.floor(n * 0.35));
    const wProd = Math.max(8, Math.min(p.ventana || Math.floor(n * 0.3), n - wRef));
    const entrenamiento = valores.slice(0, wRef);
    const E = { pos: n - wProd };

    const { grafica, grafica2, leyenda, lectura, controles } = armazon(el, api);
    const sPos = api.slider({ etiqueta: 'inicio de la ventana de producción', min: wRef, max: n - wProd, paso: 1, valor: E.pos, alCambiar: v => { E.pos = v; dibujar(); } });
    const mueve = (pos) => {
      const pc = Math.min(n - wProd, Math.max(wRef, Math.round(pos)));
      if (pc !== E.pos) { E.pos = pc; sPos.valor = pc; dibujar(); }
    };
    controles.append(sPos, pasoTiempo(api, 'la ventana de producción', 0, () => mueve(E.pos - 1), () => mueve(E.pos + 1)), reiniciar(el, p, api));

    function estadisticas(arr) {
      const media = arr.reduce((a, b) => a + b, 0) / arr.length;
      const de = Math.sqrt(arr.reduce((a, v) => a + (v - media) ** 2, 0) / arr.length) || 1e-9;
      return { media, de };
    }
    function psi(train, prod, bins) {
      const lo = Math.min(...train), hi = Math.max(...train), w = (hi - lo) / bins || 1;
      const cuenta = arr => {
        const cu = new Array(bins).fill(0);
        arr.forEach(v => { const b = Math.max(0, Math.min(bins - 1, Math.floor((v - lo) / w))); cu[b]++; });
        return cu.map(x => Math.max(x / arr.length, 1e-4));
      };
      const pT = cuenta(train), pP = cuenta(prod);
      let s = 0;
      for (let i = 0; i < bins; i++) s += (pP[i] - pT[i]) * Math.log(pP[i] / pT[i]);
      return s;
    }

    function dibujar() {
      const c = api.colores();
      const produccion = valores.slice(E.pos, E.pos + wProd);
      const W = api.medida(grafica, { maxAncho: 780, minAncho: 300 }).ancho, alto = 190;
      grafica.innerHTML = ''; leyenda.innerHTML = ''; lectura.innerHTML = '';
      const s = api.svg(W, alto);
      s.setAttribute('role', 'group');
      grafica.append(s);
      const F = api.fuente(s, 12);
      const caja = { l: 48, r: W - 12, t: 12, b: alto - 28 };
      const X = api.escala(0, n - 1, caja.l, caja.r);
      const lo = Math.min(...valores), hi = Math.max(...valores), m = (hi - lo) * 0.12 || 1;
      const Y = api.escala(lo - m, hi + m, caja.b, caja.t);
      const g = api.el('g', {}, s);
      api.marcas(lo - m, hi + m, 4).forEach(v => {
        api.el('line', { x1: caja.l, x2: caja.r, y1: Y(v), y2: Y(v), stroke: c.rejilla }, g);
        api.el('text', { x: caja.l - 6, y: Y(v) + 4, 'text-anchor': 'end', 'font-size': F, fill: c.suave, text: num(v, 2) }, g);
      });
      api.el('rect', { x: X(0), y: caja.t, width: X(wRef - 1) - X(0), height: caja.b - caja.t, fill: c.series[0], 'fill-opacity': 0.14 }, g);
      const banda = api.el('rect', { x: X(E.pos), y: caja.t, width: X(E.pos + wProd - 1) - X(E.pos), height: caja.b - caja.t, fill: c.mal, 'fill-opacity': 0.14, stroke: c.mal, 'stroke-width': 2 }, s);
      banda.style.cursor = 'ew-resize';
      let d = '';
      valores.forEach((v, i) => { d += (i ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(v).toFixed(1); });
      api.el('path', { d, fill: 'none', stroke: c.suave, 'stroke-width': 1.6, 'pointer-events': 'none' }, s);
      api.el('line', { x1: caja.l, x2: caja.r, y1: caja.b, y2: caja.b, stroke: c.suave }, g);
      api.el('text', { x: caja.r, y: alto - 6, 'text-anchor': 'end', 'font-size': F, fill: c.suave, text: 'tiempo →' }, g);
      // Arrastrar en horizontal desliza la ventana de producción; el scroll vertical sigue vivo (pan-y).
      api.arrastrable(banda, {
        zona: grafica, clave: 'produccion', radio: Infinity, tactil: 'pan-y', etiqueta: 'Ventana de producción',
        valor: () => `posiciones ${E.pos}–${E.pos + wProd - 1}`,
        alMover: (q) => mueve(X.inversa(api.aSvg(s, q).x) - (wProd - 1) / 2),
        alTecla: (dx) => mueve(E.pos + dx),
      });

      grafica2.innerHTML = '';
      const W2 = W, alto2 = 160, bins = 8;
      const gLo = Math.min(...entrenamiento), gHi = Math.max(...entrenamiento, ...produccion), gm = (gHi - gLo) * 0.05 || 1;
      const dom = [gLo - gm, gHi + gm], anchoBin = (dom[1] - dom[0]) / bins;
      const caja2 = { l: 12, r: W2 - 12, t: 10, b: alto2 - 26 };
      const X2 = api.escala(dom[0], dom[1], caja2.l, caja2.r);
      const s2 = api.svg(W2, alto2);
      s2.setAttribute('role', 'group');
      grafica2.append(s2);
      const F2 = api.fuente(s2, 12);
      function hist(arr) {
        const cu = new Array(bins).fill(0);
        arr.forEach(v => { const b = Math.max(0, Math.min(bins - 1, Math.floor((v - dom[0]) / anchoBin))); cu[b]++; });
        return cu.map(k => k / arr.length);
      }
      const hT = hist(entrenamiento), hP = hist(produccion);
      const maxD = Math.max(...hT, ...hP, 0.05) * 1.15;
      const Y2 = api.escala(0, maxD, caja2.b, caja2.t);
      for (let b = 0; b < bins; b++) {
        const x0v = X2(dom[0] + b * anchoBin), x1v = X2(dom[0] + (b + 1) * anchoBin), wdt = x1v - x0v;
        const rT = api.el('rect', { x: x0v + 1, y: Y2(hT[b]), width: Math.max(0, wdt / 2 - 1.5), height: caja2.b - Y2(hT[b]), fill: c.series[0], 'fill-opacity': 0.75 }, s2);
        const rP = api.el('rect', { x: x0v + wdt / 2 + 0.5, y: Y2(hP[b]), width: Math.max(0, wdt / 2 - 1.5), height: caja2.b - Y2(hP[b]), fill: c.mal, 'fill-opacity': 0.75 }, s2);
        const rango = `${num(dom[0] + b * anchoBin, 2)} a ${num(dom[0] + (b + 1) * anchoBin, 2)}`;
        api.inspeccionable(rT, `Entrenamiento, ${rango}: ${num(100 * hT[b], 1)} %`);
        api.inspeccionable(rP, `Producción, ${rango}: ${num(100 * hP[b], 1)} %`);
      }
      api.el('line', { x1: caja2.l, x2: caja2.r, y1: caja2.b, y2: caja2.b, stroke: c.suave }, s2);
      api.marcas(dom[0], dom[1], Math.max(3, Math.round(W2 / 80))).forEach(v => api.el('text', { x: X2(v), y: alto2 - 8, 'text-anchor': 'middle', 'font-size': F2, fill: c.suave, text: num(v, 1) }, s2));

      leyenda.append(
        H('span', { class: 'leyenda-item' }, H('span', { class: 'leyenda-muestra', style: `--c:${c.series[0]}` }), 'entrenamiento'),
        H('span', { class: 'leyenda-item' }, H('span', { class: 'leyenda-muestra', style: `--c:${c.mal}` }), 'producción'),
      );

      const eT = estadisticas(entrenamiento), eP = estadisticas(produccion);
      const desplazamiento = (eP.media - eT.media) / eT.de;
      const val = psi(entrenamiento, produccion, bins);
      const etiquetaPsi = val < 0.1 ? 'sin deriva relevante' : val < 0.25 ? 'deriva moderada' : 'deriva importante';
      lectura.innerHTML =
        `<p>Entrenamiento (${wRef} valores, posiciones 0–${wRef - 1}): media = ${num(eT.media, 3)}, desviación = ${num(eT.de, 3)}.</p>` +
        `<p>Producción (${wProd} valores, posiciones ${E.pos}–${E.pos + wProd - 1}): media = ${num(eP.media, 3)}, desviación = ${num(eP.de, 3)}.</p>` +
        `<p>Desplazamiento de la media (en desviaciones de entrenamiento): <strong>${num(desplazamiento, 2)}</strong> · PSI = <strong>${num(val, 3)}</strong> (${etiquetaPsi}; se suele leer PSI &lt; 0,1 como estable y &gt; 0,25 como alerta seria).</p>`;
      s.setAttribute('aria-label', 'Serie con una ventana de entrenamiento fija y otra de producción móvil. ' + lectura.textContent);
    }
    dibujar();
    return { redibujar: dibujar };
  }

  Motores.registrar('serie', function (el, p, api) {
    if (!p.serie) throw new Error('serie necesita "serie"');
    const modo = p.modo;
    if (modo === 'ventana') return ventana(el, p, api);
    if (modo === 'drift') return drift(el, p, api);
    throw new Error('Modo desconocido: ' + modo);
  }, {
    ejemplos: {
      ventana: { modo: 'ventana', serie: { generador: 'seno', n: 60, ruido: 0.12, semilla: 4 }, ventana: 3 },
      drift: { modo: 'drift', serie: { generador: 'tendencia', n: 80, ruido: 0.25, semilla: 5 }, ventana: 20 },
    },
  });
})();
