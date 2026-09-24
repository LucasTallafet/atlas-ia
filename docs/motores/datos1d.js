// @modos: centralidad, graficos, outliers, imputacion
// Motor "datos1d": puntos en una recta, arrastrables: centralidad, histograma/boxplot, atípicos e imputación.
(function () {
  'use strict';

  // Reparte puntos casi coincidentes en "carriles" verticales (beeswarm simple) para que no se solapen.
  function carriles(pares, minDist) {
    const ocupados = [], lane = [];
    pares.slice().sort((a, b) => a.x - b.x).forEach(({ i, x }) => {
      let l = ocupados.findIndex(ux => x - ux >= minDist);
      if (l === -1) { l = ocupados.length; ocupados.push(x); } else ocupados[l] = x;
      lane[i] = l;
    });
    return lane;
  }
  function percentil(ord, p) {
    const n = ord.length, idx = p * (n - 1), lo = Math.floor(idx), hi = Math.ceil(idx);
    return ord[lo] + (ord[hi] - ord[lo]) * (idx - lo);
  }

  // ───────────────────────── centralidad ─────────────────────────
  function centralidad(el, p, api) {
    const H = api.html, num = api.num;
    const unidad = p.unidad ? ' ' + p.unidad : '';
    const valores = (p.valores || []).slice();
    if (valores.length < 2) throw new Error('El modo centralidad necesita al menos 2 valores');
    let lo = Math.min(...valores), hi = Math.max(...valores);
    if (hi - lo < 1e-6) { lo -= 1; hi += 1; }
    const margen = (hi - lo) * 0.18;
    const dom = [lo - margen, hi + margen];

    const grafica = H('div', { class: 'motor-grafica' });
    const leyenda = H('div', { class: 'motor-leyenda' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, leyenda, lectura, controles);
    controles.append(api.boton('Reiniciar', () => { Motores.desmontar(el); Motores.montar(el, 'datos1d', JSON.parse(JSON.stringify(p))); }));

    let X, arrastre = null;
    grafica.addEventListener('pointermove', e => {
      if (!arrastre) return;
      const s = grafica.querySelector('svg'); if (!s) return;
      const r = s.getBoundingClientRect(), f = s.viewBox.baseVal.width / r.width;
      arrastre(Math.min(dom[1], Math.max(dom[0], X.inversa((e.clientX - r.left) * f))));
    });
    const soltar = () => { arrastre = null; };
    grafica.addEventListener('pointerup', soltar);
    grafica.addEventListener('pointercancel', soltar);

    function asa(g, x, y, color, etiqueta, mover, c) {
      const c1 = api.el('circle', { cx: X(x), cy: y, r: 8, fill: color, stroke: c.superficie, 'stroke-width': 1.6, tabindex: 0, role: 'button', 'aria-label': etiqueta + ' (arrastra o usa las flechas)' }, g);
      c1.style.cursor = 'grab';
      c1.addEventListener('pointerdown', e => { e.stopPropagation(); arrastre = mover; grafica.setPointerCapture(e.pointerId); });
      c1.addEventListener('keydown', e => {
        const d = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
        if (!d) return;
        e.preventDefault();
        mover(Math.min(dom[1], Math.max(dom[0], x + d * (dom[1] - dom[0]) / 60)));
      });
      return c1;
    }

    function estadisticas() {
      const ord = valores.slice().sort((a, b) => a - b), n = ord.length;
      const media = ord.reduce((a, b) => a + b, 0) / n;
      const mediana = n % 2 ? ord[(n - 1) / 2] : (ord[n / 2 - 1] + ord[n / 2]) / 2;
      const grupos = {};
      valores.forEach(v => { const k = Math.round(v * 20) / 20; grupos[k] = (grupos[k] || 0) + 1; });
      let modaVal = null, modaN = 1;
      Object.entries(grupos).forEach(([k, cnt]) => { if (cnt > modaN) { modaN = cnt; modaVal = parseFloat(k); } });
      return { media, mediana, moda: modaVal, modaN };
    }

    function dibujar() {
      const c = api.colores();
      const W = Math.max(300, Math.min(el.clientWidth || 640, 760)), alto = 130;
      grafica.innerHTML = ''; lectura.innerHTML = ''; leyenda.innerHTML = '';
      const s = api.svg(W, alto);
      s.setAttribute('role', 'img');
      grafica.append(s);
      const caja = { l: 20, r: W - 20, t: 14, b: alto - 30 };
      X = api.escala(dom[0], dom[1], caja.l, caja.r);
      const g = api.el('g', {}, s);
      api.marcas(dom[0], dom[1], 7).forEach(v => {
        api.el('line', { x1: X(v), x2: X(v), y1: caja.t, y2: caja.b, stroke: c.rejilla }, g);
        api.el('text', { x: X(v), y: alto - 8, 'text-anchor': 'middle', 'font-size': 11, fill: c.suave, text: num(v, 2) }, g);
      });
      api.el('line', { x1: caja.l, x2: caja.r, y1: caja.b, y2: caja.b, stroke: c.suave }, g);

      const est = estadisticas();
      const lane = carriles(valores.map((v, i) => ({ i, x: X(v) })), 15);
      const puntos = api.el('g', {}, s);
      valores.forEach((v, i) => {
        const y = caja.b - 10 - lane[i] * 14;
        asa(puntos, v, y, c.series[0], `punto ${i + 1} (${num(v, 2)}${unidad})`, nv => { valores[i] = nv; dibujar(); }, c);
      });

      function marcador(valor, color, forma) {
        if (valor == null) return;
        const x = X(valor);
        if (forma === 'triangulo') api.el('path', { d: `M${x - 6},${caja.t - 2} L${x + 6},${caja.t - 2} L${x},${caja.t + 9}Z`, fill: color }, g);
        else api.el('path', { d: `M${x},${caja.t - 8} L${x + 6},${caja.t} L${x},${caja.t + 8} L${x - 6},${caja.t}Z`, fill: color }, g);
        api.el('line', { x1: x, x2: x, y1: caja.t, y2: caja.b, stroke: color, 'stroke-width': 1.4, 'stroke-dasharray': '4 3' }, g);
      }
      marcador(est.media, c.acento, 'triangulo');
      marcador(est.mediana, c.series[2], 'rombo');
      if (est.modaN > 1) marcador(est.moda, c.series[3], 'triangulo');

      leyenda.append(
        H('span', { class: 'leyenda-item' }, H('span', { class: 'leyenda-muestra', style: `--c:${c.acento}` }), 'media'),
        H('span', { class: 'leyenda-item' }, H('span', { class: 'leyenda-muestra', style: `--c:${c.series[2]}` }), 'mediana'),
      );
      if (est.modaN > 1) leyenda.append(H('span', { class: 'leyenda-item' }, H('span', { class: 'leyenda-muestra', style: `--c:${c.series[3]}` }), 'moda'));

      const lineas = [];
      lineas.push(`Media = <strong>${num(est.media, 3)}${unidad}</strong> · mediana = <strong>${num(est.mediana, 3)}${unidad}</strong>` +
        (est.modaN > 1 ? ` · moda = <strong>${num(est.moda, 3)}${unidad}</strong> (se repite ${est.modaN} veces).` : ' · no hay ningún valor repetido: no hay moda.'));
      lineas.push('Arrastra un punto muy alejado (un atípico) para ver que la media se mueve mucho más que la mediana.');
      lectura.innerHTML = lineas.map(t => `<p>${t}</p>`).join('');
      s.setAttribute('aria-label', 'Puntos en una recta con media, mediana y moda. ' + lectura.textContent);
    }
    dibujar();
    return { redibujar: dibujar };
  }

  // ───────────────────────── gráficos (histograma + boxplot) ─────────────────────────
  function graficos(el, p, api) {
    const H = api.html, num = api.num;
    const unidad = p.unidad ? ' ' + p.unidad : '';
    const valores = (p.valores || []).slice().sort((a, b) => a - b);
    if (valores.length < 4) throw new Error('El modo graficos necesita al menos 4 valores');
    const n = valores.length, lo = valores[0], hi = valores[n - 1];
    const margen = (hi - lo) * 0.08 || 1;
    const dom = [lo - margen, hi + margen];
    const E = { bins: Math.max(4, Math.min(12, Math.round(Math.sqrt(n)))) };

    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, lectura, controles);
    controles.append(api.slider({ etiqueta: 'nº de intervalos', min: 3, max: 20, paso: 1, valor: E.bins, alCambiar: v => { E.bins = v; dibujar(); } }));

    function dibujar() {
      const c = api.colores();
      const W = Math.max(300, Math.min(el.clientWidth || 640, 760));
      const altoHist = 150, altoCaja = 70, alto = altoHist + altoCaja + 20;
      grafica.innerHTML = ''; lectura.innerHTML = '';
      const s = api.svg(W, alto);
      s.setAttribute('role', 'img');
      grafica.append(s);
      const cajaH = { l: 20, r: W - 20, t: 10, b: altoHist - 24 };
      const X = api.escala(dom[0], dom[1], cajaH.l, cajaH.r);

      const anchoBin = (dom[1] - dom[0]) / E.bins;
      const cuentas = new Array(E.bins).fill(0);
      valores.forEach(v => { const b = Math.min(E.bins - 1, Math.max(0, Math.floor((v - dom[0]) / anchoBin))); cuentas[b]++; });
      const maxCuenta = Math.max(...cuentas, 1);
      const Y = api.escala(0, maxCuenta, cajaH.b, cajaH.t);
      for (let b = 0; b < E.bins; b++) {
        const x0v = X(dom[0] + b * anchoBin), x1v = X(dom[0] + (b + 1) * anchoBin);
        api.el('rect', { x: x0v + 1, y: Y(cuentas[b]), width: Math.max(0, x1v - x0v - 2), height: cajaH.b - Y(cuentas[b]), fill: c.series[0], 'fill-opacity': 0.75 }, s);
      }
      api.marcas(dom[0], dom[1], 6).forEach(v => api.el('text', { x: X(v), y: cajaH.b + 16, 'text-anchor': 'middle', 'font-size': 11, fill: c.suave, text: num(v, 2) }, s));
      api.el('line', { x1: cajaH.l, x2: cajaH.r, y1: cajaH.b, y2: cajaH.b, stroke: c.suave }, s);

      const q1 = percentil(valores, 0.25), q2 = percentil(valores, 0.5), q3 = percentil(valores, 0.75), iqr = q3 - q1;
      const limInf = q1 - 1.5 * iqr, limSup = q3 + 1.5 * iqr;
      const dentro = valores.filter(v => v >= limInf && v <= limSup);
      const whiskLo = Math.min(...dentro), whiskHi = Math.max(...dentro);
      const atipicos = valores.filter(v => v < limInf || v > limSup);
      const cy = altoHist + altoCaja / 2, hCaja = 24;
      const gB = api.el('g', {}, s);
      api.el('line', { x1: X(whiskLo), x2: X(q1), y1: cy, y2: cy, stroke: c.suave }, gB);
      api.el('line', { x1: X(q3), x2: X(whiskHi), y1: cy, y2: cy, stroke: c.suave }, gB);
      [whiskLo, whiskHi].forEach(v => api.el('line', { x1: X(v), x2: X(v), y1: cy - hCaja / 4, y2: cy + hCaja / 4, stroke: c.suave }, gB));
      api.el('rect', { x: X(q1), y: cy - hCaja / 2, width: Math.max(1, X(q3) - X(q1)), height: hCaja, fill: c.series[1], 'fill-opacity': 0.5, stroke: c.series[1] }, gB);
      api.el('line', { x1: X(q2), x2: X(q2), y1: cy - hCaja / 2, y2: cy + hCaja / 2, stroke: c.series[1], 'stroke-width': 2 }, gB);
      atipicos.forEach(v => api.el('circle', { cx: X(v), cy, r: 4, fill: c.mal }, gB));

      const lineas = [];
      lineas.push(`Q1 = ${num(q1, 3)}${unidad} · mediana = ${num(q2, 3)}${unidad} · Q3 = ${num(q3, 3)}${unidad} · RIC = ${num(iqr, 3)}${unidad}.`);
      lineas.push(`Bigotes hasta ${num(whiskLo, 3)}${unidad} y ${num(whiskHi, 3)}${unidad} (1,5×RIC) · atípicos: ${atipicos.length ? atipicos.map(v => num(v, 2)).join(', ') : 'ninguno'}.`);
      lineas.push(`Histograma con ${E.bins} intervalos de anchura ${num(anchoBin, 3)}${unidad}.`);
      lectura.innerHTML = lineas.map(t => `<p>${t}</p>`).join('');
      s.setAttribute('aria-label', 'Histograma y diagrama de caja de los mismos datos. ' + lectura.textContent);
    }
    dibujar();
    return { redibujar: dibujar };
  }

  // ───────────────────────── outliers ─────────────────────────
  function outliers(el, p, api) {
    const H = api.html, num = api.num;
    const unidad = p.unidad ? ' ' + p.unidad : '';
    const valores = (p.valores || []).slice();
    if (valores.length < 4) throw new Error('El modo outliers necesita al menos 4 valores');
    let lo = Math.min(...valores), hi = Math.max(...valores);
    if (hi - lo < 1e-6) { lo -= 1; hi += 1; }
    const margen = (hi - lo) * 0.25;
    const dom = [lo - margen, hi + margen];
    const E = { metodo: 'iqr', k: 1.5, zUmbral: 3 };

    const grafica = H('div', { class: 'motor-grafica' });
    const leyenda = H('div', { class: 'motor-leyenda' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, leyenda, lectura, controles);

    const grupo = H('div', { class: 'motor-selector', role: 'group', 'aria-label': 'Método de detección' });
    const bIQR = api.boton('Regla RIC', () => { E.metodo = 'iqr'; marcar(); dibujar(); });
    const bZ = api.boton('Puntuación z', () => { E.metodo = 'z'; marcar(); dibujar(); });
    grupo.append(bIQR, bZ);
    controles.append(grupo);
    const sK = api.slider({ etiqueta: 'k (× RIC)', min: 0.5, max: 3, paso: 0.1, valor: E.k, alCambiar: v => { E.k = v; dibujar(); } });
    const sZ = api.slider({ etiqueta: 'umbral |z|', min: 1, max: 4, paso: 0.1, valor: E.zUmbral, alCambiar: v => { E.zUmbral = v; dibujar(); } });
    controles.append(sK, sZ, api.boton('Reiniciar', () => { Motores.desmontar(el); Motores.montar(el, 'datos1d', JSON.parse(JSON.stringify(p))); }));
    function marcar() {
      bIQR.setAttribute('aria-pressed', String(E.metodo === 'iqr'));
      bZ.setAttribute('aria-pressed', String(E.metodo === 'z'));
      sK.style.display = E.metodo === 'iqr' ? '' : 'none';
      sZ.style.display = E.metodo === 'z' ? '' : 'none';
    }
    marcar();

    let X, arrastre = null;
    grafica.addEventListener('pointermove', e => {
      if (!arrastre) return;
      const s = grafica.querySelector('svg'); if (!s) return;
      const r = s.getBoundingClientRect(), f = s.viewBox.baseVal.width / r.width;
      arrastre(Math.min(dom[1], Math.max(dom[0], X.inversa((e.clientX - r.left) * f))));
    });
    const soltar = () => { arrastre = null; };
    grafica.addEventListener('pointerup', soltar);
    grafica.addEventListener('pointercancel', soltar);

    function asa(g, x, y, color, etiqueta, mover, c) {
      const c1 = api.el('circle', { cx: X(x), cy: y, r: 8, fill: color, stroke: c.superficie, 'stroke-width': 1.6, tabindex: 0, role: 'button', 'aria-label': etiqueta + ' (arrastra o usa las flechas)' }, g);
      c1.style.cursor = 'grab';
      c1.addEventListener('pointerdown', e => { e.stopPropagation(); arrastre = mover; grafica.setPointerCapture(e.pointerId); });
      c1.addEventListener('keydown', e => {
        const d = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
        if (!d) return;
        e.preventDefault();
        mover(Math.min(dom[1], Math.max(dom[0], x + d * (dom[1] - dom[0]) / 60)));
      });
      return c1;
    }

    function limites() {
      const ord = valores.slice().sort((a, b) => a - b);
      if (E.metodo === 'iqr') {
        const q1 = percentil(ord, 0.25), q3 = percentil(ord, 0.75), iqr = q3 - q1;
        return { inf: q1 - E.k * iqr, sup: q3 + E.k * iqr };
      }
      const media = valores.reduce((a, b) => a + b, 0) / valores.length;
      const de = Math.sqrt(valores.reduce((a, v) => a + (v - media) ** 2, 0) / valores.length) || 1e-9;
      return { inf: media - E.zUmbral * de, sup: media + E.zUmbral * de, media, de };
    }

    function dibujar() {
      const c = api.colores();
      const W = Math.max(300, Math.min(el.clientWidth || 640, 760)), alto = 140;
      grafica.innerHTML = ''; lectura.innerHTML = ''; leyenda.innerHTML = '';
      const s = api.svg(W, alto);
      s.setAttribute('role', 'img');
      grafica.append(s);
      const caja = { l: 20, r: W - 20, t: 14, b: alto - 30 };
      X = api.escala(dom[0], dom[1], caja.l, caja.r);
      const g = api.el('g', {}, s);
      api.marcas(dom[0], dom[1], 7).forEach(v => {
        api.el('line', { x1: X(v), x2: X(v), y1: caja.t, y2: caja.b, stroke: c.rejilla }, g);
        api.el('text', { x: X(v), y: alto - 8, 'text-anchor': 'middle', 'font-size': 11, fill: c.suave, text: num(v, 2) }, g);
      });
      api.el('line', { x1: caja.l, x2: caja.r, y1: caja.b, y2: caja.b, stroke: c.suave }, g);

      const lim = limites();
      const xInf = Math.max(caja.l, X(Math.max(dom[0], lim.inf))), xSup = Math.min(caja.r, X(Math.min(dom[1], lim.sup)));
      api.el('rect', { x: xInf, y: caja.t, width: Math.max(0, xSup - xInf), height: caja.b - caja.t, fill: c.acento, 'fill-opacity': 0.07 }, g);
      [lim.inf, lim.sup].forEach(v => { if (v >= dom[0] && v <= dom[1]) api.el('line', { x1: X(v), x2: X(v), y1: caja.t, y2: caja.b, stroke: c.acento, 'stroke-width': 1.4, 'stroke-dasharray': '5 4' }, g); });

      const lane = carriles(valores.map((v, i) => ({ i, x: X(v) })), 15);
      const puntos = api.el('g', {}, s);
      let nAtip = 0;
      valores.forEach((v, i) => {
        const y = caja.b - 10 - lane[i] * 14;
        const esAtipico = v < lim.inf || v > lim.sup;
        if (esAtipico) nAtip++;
        asa(puntos, v, y, esAtipico ? c.mal : c.series[0], `punto ${i + 1} (${num(v, 2)}${unidad})`, nv => { valores[i] = nv; dibujar(); }, c);
      });

      leyenda.append(
        H('span', { class: 'leyenda-item' }, H('span', { class: 'leyenda-muestra', style: `--c:${c.series[0]}` }), 'normal'),
        H('span', { class: 'leyenda-item' }, H('span', { class: 'leyenda-muestra', style: `--c:${c.mal}` }), 'atípico'),
      );
      const lineas = [];
      lineas.push(E.metodo === 'iqr'
        ? `Regla RIC: atípico si está fuera de [${num(lim.inf, 3)}${unidad}, ${num(lim.sup, 3)}${unidad}] (Q1 − ${num(E.k, 1)}·RIC, Q3 + ${num(E.k, 1)}·RIC).`
        : `Puntuación z: atípico si |z| > ${num(E.zUmbral, 1)} (media = ${num(lim.media, 3)}${unidad}, desviación = ${num(lim.de, 3)}${unidad}).`);
      lineas.push(`Atípicos detectados: <strong>${nAtip}</strong> de ${valores.length}. Arrastra un punto para ver cuándo entra o sale de la zona sombreada.`);
      lectura.innerHTML = lineas.map(t => `<p>${t}</p>`).join('');
      s.setAttribute('aria-label', 'Puntos en una recta con la zona de valores normales sombreada. ' + lectura.textContent);
    }
    dibujar();
    return { redibujar: dibujar };
  }

  // ───────────────────────── imputación ─────────────────────────
  function imputacion(el, p, api) {
    const H = api.html, num = api.num;
    const unidad = p.unidad ? ' ' + p.unidad : '';
    const brutos = p.valores || [];
    const conocidos = brutos.filter(v => v != null);
    if (brutos.length < 4 || !conocidos.length) throw new Error('El modo imputacion necesita al menos 4 valores, con alguno conocido');
    let lo = Math.min(...conocidos), hi = Math.max(...conocidos);
    if (hi - lo < 1e-6) { lo -= 1; hi += 1; }
    const margen = (hi - lo) * 0.18;
    const dom = [lo - margen, hi + margen];
    const E = { metodo: null };

    const grafica = H('div', { class: 'motor-grafica' });
    const leyenda = H('div', { class: 'motor-leyenda' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, leyenda, lectura, controles);

    const grupo = H('div', { class: 'motor-selector', role: 'group', 'aria-label': 'Estrategia de imputación' });
    const metodos = [['media', 'media'], ['mediana', 'mediana'], ['aleatorio', 'valor al azar de los conocidos']];
    const botones = metodos.map(([k, etq]) => api.boton(etq, () => { E.metodo = k; marcar(); dibujar(); }));
    botones.forEach(b => grupo.append(b));
    controles.append(grupo, api.boton('Reiniciar', () => { E.metodo = null; marcar(); dibujar(); }));
    function marcar() { botones.forEach((b, i) => b.setAttribute('aria-pressed', String(metodos[i][0] === E.metodo))); }
    marcar();

    function estadisticasConocidos() {
      const ord = conocidos.slice().sort((a, b) => a - b), n = ord.length;
      const media = ord.reduce((a, b) => a + b, 0) / n;
      const mediana = n % 2 ? ord[(n - 1) / 2] : (ord[n / 2 - 1] + ord[n / 2]) / 2;
      return { media, mediana };
    }
    function valorImputado(indice, est) {
      if (E.metodo === 'media') return est.media;
      if (E.metodo === 'mediana') return est.mediana;
      const r = api.aleatorio(100 + indice);
      return conocidos[Math.floor(r() * conocidos.length)];
    }
    function desviacion(arr) {
      const m = arr.reduce((a, b) => a + b, 0) / arr.length;
      return Math.sqrt(arr.reduce((a, v) => a + (v - m) ** 2, 0) / arr.length);
    }

    function dibujar() {
      const c = api.colores();
      const W = Math.max(300, Math.min(el.clientWidth || 640, 760)), alto = 130;
      grafica.innerHTML = ''; lectura.innerHTML = ''; leyenda.innerHTML = '';
      const s = api.svg(W, alto);
      s.setAttribute('role', 'img');
      grafica.append(s);
      const caja = { l: 20, r: W - 20, t: 20, b: alto - 30 };
      const X = api.escala(dom[0], dom[1], caja.l, caja.r);
      const g = api.el('g', {}, s);
      api.marcas(dom[0], dom[1], 7).forEach(v => {
        api.el('line', { x1: X(v), x2: X(v), y1: caja.t, y2: caja.b, stroke: c.rejilla }, g);
        api.el('text', { x: X(v), y: alto - 8, 'text-anchor': 'middle', 'font-size': 11, fill: c.suave, text: num(v, 2) }, g);
      });
      api.el('line', { x1: caja.l, x2: caja.r, y1: caja.b, y2: caja.b, stroke: c.suave }, g);

      const est = estadisticasConocidos();
      const y0 = caja.b - 14;
      let kHueco = 0;
      brutos.forEach((v, i) => {
        if (v != null) { api.el('circle', { cx: X(v), cy: y0, r: 6, fill: c.series[0] }, g); return; }
        if (E.metodo) {
          const iv = valorImputado(i, est);
          api.el('circle', { cx: X(iv), cy: y0, r: 6, fill: c.series[3], stroke: c.superficie, 'stroke-width': 1.4 }, g);
        } else {
          api.el('text', { x: caja.l + 8 + kHueco * 20, y: caja.t + 4, 'font-size': 13, 'font-weight': 700, fill: c.mal, text: '?' }, g);
        }
        kHueco++;
      });

      leyenda.append(H('span', { class: 'leyenda-item' }, H('span', { class: 'leyenda-muestra', style: `--c:${c.series[0]}` }), 'valor conocido'));
      if (E.metodo) leyenda.append(H('span', { class: 'leyenda-item' }, H('span', { class: 'leyenda-muestra', style: `--c:${c.series[3]}` }), 'valor imputado'));

      const faltan = brutos.length - conocidos.length;
      const completos = brutos.map((v, i) => v != null ? v : (E.metodo ? valorImputado(i, est) : null)).filter(v => v != null);
      const lineas = [];
      lineas.push(`${conocidos.length} valores conocidos y <strong>${faltan}</strong> huecos, de ${brutos.length} en total.`);
      lineas.push(`Media de los conocidos = ${num(est.media, 3)}${unidad} · mediana = ${num(est.mediana, 3)}${unidad}.`);
      if (!E.metodo) {
        lineas.push('Elige una estrategia para rellenar los huecos (marcados con «?») y ver dónde caen.');
      } else {
        lineas.push(`Con «${metodos.find(m => m[0] === E.metodo)[1]}»: media tras imputar = ${num(completos.reduce((a, b) => a + b, 0) / completos.length, 3)}${unidad} ` +
          `(desviación típica = ${num(desviacion(completos), 3)}${unidad} frente a ${num(desviacion(conocidos), 3)}${unidad} con solo los conocidos).`);
        if (E.metodo === 'media') lineas.push('Imputar con la media no cambia la media, pero reduce artificialmente la varianza de los datos.');
      }
      lectura.innerHTML = lineas.map(t => `<p>${t}</p>`).join('');
      s.setAttribute('aria-label', 'Puntos conocidos y huecos con imputación. ' + lectura.textContent);
    }
    dibujar();
    return { redibujar: dibujar };
  }

  Motores.registrar('datos1d', function (el, p, api) {
    const modo = p.modo;
    if (!p.valores || !p.valores.length) throw new Error('datos1d necesita "valores"');
    if (modo === 'centralidad') return centralidad(el, p, api);
    if (modo === 'graficos') return graficos(el, p, api);
    if (modo === 'outliers') return outliers(el, p, api);
    if (modo === 'imputacion') return imputacion(el, p, api);
    throw new Error('Modo desconocido: ' + modo);
  }, {
    ejemplos: {
      centralidad: { modo: 'centralidad', valores: [3, 4, 4, 5, 7, 20], unidad: 'años' },
      graficos: { modo: 'graficos', valores: [2, 3, 3, 4, 5, 5, 5, 6, 7, 8, 9, 9, 10, 12, 15, 21], unidad: 'kg' },
      outliers: { modo: 'outliers', valores: [10, 11, 12, 12, 13, 14, 11, 10, 35, 13], unidad: 'ms' },
      imputacion: { modo: 'imputacion', valores: [12, 15, null, 18, 14, null, 16, 13], unidad: '°C' },
    },
  });
})();
