// @modos: venn, tabla, test, naive-bayes, softmax
// Motor "probabilidad": Venn, tabla de contingencia, test diagnóstico, Naive Bayes y softmax con temperatura.
(function () {
  'use strict';

  // ───────────────────────── venn ─────────────────────────
  function venn(el, p, api) {
    const H = api.html, num = api.num;
    const v = p.valores || {};
    const conj = (v.conjuntos && v.conjuntos.length >= 2) ? v.conjuntos.slice(0, 2) : [{ nombre: 'A', p: 0.4 }, { nombre: 'B', p: 0.3 }];
    const nA = conj[0].nombre || 'A', nB = conj[1].nombre || 'B';
    const clampInter = (pa, pb, pab) => Math.min(Math.min(pa, pb), Math.max(Math.max(0, pa + pb - 1), pab));
    const E = { pa: conj[0].p, pb: conj[1].p, pab: clampInter(conj[0].p, conj[1].p, v.interseccion != null ? v.interseccion : Math.min(conj[0].p, conj[1].p) * 0.3) };

    function areaInterseccion(r1, r2, d) {
      if (d >= r1 + r2) return 0;
      if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2;
      const d1 = (d * d - r2 * r2 + r1 * r1) / (2 * d), d2 = d - d1;
      return r1 * r1 * Math.acos(Math.min(1, Math.max(-1, d1 / r1))) - d1 * Math.sqrt(Math.max(0, r1 * r1 - d1 * d1)) +
        r2 * r2 * Math.acos(Math.min(1, Math.max(-1, d2 / r2))) - d2 * Math.sqrt(Math.max(0, r2 * r2 - d2 * d2));
    }
    function resolverD(r1, r2, area) {
      let lo = Math.abs(r1 - r2), hi = r1 + r2;
      const maxA = Math.PI * Math.min(r1, r2) ** 2;
      if (area <= 0) return hi;
      if (area >= maxA) return lo;
      for (let i = 0; i < 40; i++) {
        const mid = (lo + hi) / 2;
        if (areaInterseccion(r1, r2, mid) > area) lo = mid; else hi = mid;
      }
      return (lo + hi) / 2;
    }

    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, lectura, controles);

    let sInt;
    function ajustarInter() {
      const hi = Math.min(E.pa, E.pb);
      sInt.input.max = hi;
      E.pab = clampInter(E.pa, E.pb, E.pab);
      sInt.valor = E.pab;
    }
    const sA = api.slider({ etiqueta: `P(${nA})`, min: 0.05, max: 0.9, paso: 0.01, valor: E.pa, alCambiar: v2 => { E.pa = v2; ajustarInter(); dibujar(); } });
    const sB = api.slider({ etiqueta: `P(${nB})`, min: 0.05, max: 0.9, paso: 0.01, valor: E.pb, alCambiar: v2 => { E.pb = v2; ajustarInter(); dibujar(); } });
    sInt = api.slider({ etiqueta: `P(${nA}∩${nB})`, min: 0, max: Math.min(E.pa, E.pb), paso: 0.01, valor: E.pab, alCambiar: v2 => { E.pab = v2; dibujar(); } });
    controles.append(sA, sB, sInt, api.boton('Reiniciar', () => { Motores.desmontar(el); Motores.montar(el, 'probabilidad', JSON.parse(JSON.stringify(p))); }));

    function dibujar() {
      const c = api.colores();
      const areaUnit = 9000;
      const r1 = Math.sqrt(areaUnit * E.pa / Math.PI), r2 = Math.sqrt(areaUnit * E.pb / Math.PI);
      const d = resolverD(r1, r2, areaUnit * E.pab);
      const W = Math.max(280, Math.min(el.clientWidth || 480, 640));
      const alto = Math.round(Math.max(r1, r2) * 2 + 100);
      grafica.innerHTML = ''; lectura.innerHTML = '';
      const s = api.svg(W, alto);
      s.setAttribute('role', 'img');
      grafica.append(s);
      const cx = W / 2, cy = alto / 2 + 6, x1c = cx - d / 2, x2c = cx + d / 2;
      api.el('circle', { cx: x1c, cy, r: r1, fill: c.series[0], 'fill-opacity': 0.35, stroke: c.series[0], 'stroke-width': 2 }, s);
      api.el('circle', { cx: x2c, cy, r: r2, fill: c.series[1], 'fill-opacity': 0.35, stroke: c.series[1], 'stroke-width': 2 }, s);
      api.el('text', { x: x1c - r1 * 0.55, y: cy - r1 - 8, 'text-anchor': 'middle', 'font-weight': 700, fill: c.series[0], text: nA }, s);
      api.el('text', { x: x2c + r2 * 0.55, y: cy - r2 - 8, 'text-anchor': 'middle', 'font-weight': 700, fill: c.series[1], text: nB }, s);
      if (E.pab > 0.001) api.el('text', { x: cx, y: cy + 4, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: c.texto, 'paint-order': 'stroke', stroke: c.superficie, 'stroke-width': 3, text: num(E.pab, 3) }, s);

      const lineas = [];
      lineas.push(`P(${nA}) = ${num(E.pa, 3)} · P(${nB}) = ${num(E.pb, 3)} · P(${nA}∩${nB}) = ${num(E.pab, 3)}`);
      lineas.push(`P(${nA}∪${nB}) = P(${nA}) + P(${nB}) − P(${nA}∩${nB}) = <strong>${num(E.pa + E.pb - E.pab, 3)}</strong>`);
      lineas.push(`P(${nA}|${nB}) = ${num(E.pab / E.pb, 3)} · P(${nB}|${nA}) = ${num(E.pab / E.pa, 3)}`);
      lineas.push(Math.abs(E.pab - E.pa * E.pb) < 0.005
        ? `${nA} y ${nB} son (casi) <strong>independientes</strong>: P(${nA})·P(${nB}) ≈ P(${nA}∩${nB}) = ${num(E.pa * E.pb, 3)}.`
        : `${nA} y ${nB} no son independientes: P(${nA})·P(${nB}) = ${num(E.pa * E.pb, 3)} ≠ P(${nA}∩${nB}) = ${num(E.pab, 3)}.`);
      if (E.pab < 1e-9) lineas.push(`${nA} y ${nB} son <strong>mutuamente excluyentes</strong>: no pueden ocurrir a la vez.`);
      lectura.innerHTML = lineas.map(t => `<p>${t}</p>`).join('');
      s.setAttribute('aria-label', 'Diagrama de Venn de dos conjuntos. ' + lectura.textContent);
    }
    dibujar();
    return { redibujar: dibujar };
  }

  // ───────────────────────── tabla ─────────────────────────
  function tabla(el, p, api) {
    const H = api.html, num = api.num;
    const v = p.valores || {};
    const filas = v.filas || [], columnas = v.columnas || [], conteos = v.conteos || [];
    if (!filas.length || !columnas.length || !conteos.length) throw new Error('El modo tabla necesita valores.filas, valores.columnas y valores.conteos');
    const N = conteos.reduce((a, fila) => a + fila.reduce((x, y) => x + y, 0), 0);
    const totF = filas.map((_, i) => conteos[i].reduce((a, b) => a + b, 0));
    const totC = columnas.map((_, j) => conteos.reduce((a, fila) => a + fila[j], 0));
    const E = { tipo: null, i: -1 };

    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, lectura, controles);

    const grupo = H('div', { class: 'motor-selector', role: 'group', 'aria-label': 'Condicionar por' });
    const botTodas = api.boton('Sin condición', () => { E.tipo = null; marcar(); dibujar(); });
    const botsFila = filas.map((f, i) => api.boton('fila: ' + f, () => { E.tipo = 'fila'; E.i = i; marcar(); dibujar(); }));
    const botsCol = columnas.map((cn, j) => api.boton('columna: ' + cn, () => { E.tipo = 'columna'; E.i = j; marcar(); dibujar(); }));
    grupo.append(botTodas, ...botsFila, ...botsCol);
    controles.append(grupo);
    function marcar() {
      grupo.querySelectorAll('button').forEach(b => b.removeAttribute('aria-pressed'));
      (E.tipo === null ? botTodas : (E.tipo === 'fila' ? botsFila[E.i] : botsCol[E.i])).setAttribute('aria-pressed', 'true');
    }
    marcar();

    function dibujar() {
      const c = api.colores();
      const destacar = `background:color-mix(in srgb, ${c.acento} 18%, transparent)`;
      const filasHtml = filas.map((f, i) => {
        const celdas = columnas.map((cn, j) => {
          const cnt = conteos[i][j];
          const marcada = (E.tipo === 'fila' && E.i === i) || (E.tipo === 'columna' && E.i === j);
          let sub;
          if (E.tipo === 'columna') sub = num(100 * cnt / totC[E.i], 1) + ' %';
          else if (E.tipo === 'fila') sub = num(100 * cnt / totF[E.i], 1) + ' %';
          else sub = num(100 * cnt / N, 1) + ' %';
          return `<td${marcada ? ` style="${destacar}"` : ''}>${cnt}<br><span style="color:${c.suave};font-size:.78em">${sub}</span></td>`;
        }).join('');
        return `<tr><th scope="row"${E.tipo === 'fila' && E.i === i ? ` style="color:${c.acento}"` : ''}>${f}</th>${celdas}<td>${totF[i]}</td></tr>`;
      }).join('');
      const filaTotal = `<tr><th scope="row">Total</th>${columnas.map((cn, j) => `<td${E.tipo === 'columna' && E.i === j ? ` style="color:${c.acento}"` : ''}>${totC[j]}</td>`).join('')}<td>${N}</td></tr>`;
      grafica.innerHTML = `<div class="tabla-scroll"><table class="motor-tabla"><thead><tr><th></th>${columnas.map(cn => `<th scope="col">${cn}</th>`).join('')}<th>Total</th></tr></thead><tbody>${filasHtml}${filaTotal}</tbody></table></div>`;

      const lineas = [];
      if (E.tipo === null) {
        lineas.push(`Cada celda muestra el recuento y, debajo, la probabilidad conjunta P(fila, columna) = recuento / ${N}.`);
      } else if (E.tipo === 'fila') {
        lineas.push(`Condicionando en «${filas[E.i]}»: el porcentaje de cada celda es P(columna | ${filas[E.i]}) = recuento / ${totF[E.i]}.`);
        const mejor = columnas.map((cn, j) => [cn, conteos[E.i][j] / totF[E.i]]).sort((a, b) => b[1] - a[1])[0];
        lineas.push(`La columna más probable dado «${filas[E.i]}» es «${mejor[0]}» (${num(100 * mejor[1], 1)} %).`);
      } else {
        lineas.push(`Condicionando en «${columnas[E.i]}»: el porcentaje de cada celda es P(fila | ${columnas[E.i]}) = recuento / ${totC[E.i]}.`);
        const mejor = filas.map((f, i) => [f, conteos[i][E.i] / totC[E.i]]).sort((a, b) => b[1] - a[1])[0];
        lineas.push(`La fila más probable dado «${columnas[E.i]}» es «${mejor[0]}» (${num(100 * mejor[1], 1)} %).`);
      }
      lectura.innerHTML = lineas.map(t => `<p>${t}</p>`).join('');
    }
    dibujar();
    return { redibujar: dibujar };
  }

  // ───────────────────────── test diagnóstico ─────────────────────────
  function testDiag(el, p, api) {
    const H = api.html, num = api.num;
    const v = p.valores || {};
    const E = { prev: v.prevalencia != null ? v.prevalencia : 0.01, sens: v.sensibilidad != null ? v.sensibilidad : 0.9, esp: v.especificidad != null ? v.especificidad : 0.9 };
    const FIL = 25, COL = 40, N = FIL * COL;

    const grafica = H('div', { class: 'motor-grafica' });
    const leyenda = H('div', { class: 'motor-leyenda' });
    const panel = H('div', { class: 'motor-fila' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, leyenda, panel, lectura, controles);
    controles.append(
      api.slider({ etiqueta: 'prevalencia', min: 0.005, max: 0.5, paso: 0.005, valor: E.prev, formato: v2 => num(100 * v2, 1) + ' %', alCambiar: v2 => { E.prev = v2; dibujar(); } }),
      api.slider({ etiqueta: 'sensibilidad', min: 0.5, max: 0.999, paso: 0.001, valor: E.sens, formato: v2 => num(100 * v2, 1) + ' %', alCambiar: v2 => { E.sens = v2; dibujar(); } }),
      api.slider({ etiqueta: 'especificidad', min: 0.5, max: 0.999, paso: 0.001, valor: E.esp, formato: v2 => num(100 * v2, 1) + ' %', alCambiar: v2 => { E.esp = v2; dibujar(); } }),
      api.boton('Reiniciar', () => { Motores.desmontar(el); Motores.montar(el, 'probabilidad', JSON.parse(JSON.stringify(p))); })
    );
    const canvas = H('canvas');
    canvas.style.maxWidth = '100%';
    grafica.append(canvas);

    function dibujar() {
      const c = api.colores();
      const posReal = Math.round(N * E.prev), negReal = N - posReal;
      const TP = Math.round(posReal * E.sens), FN = posReal - TP;
      const TN = Math.round(negReal * E.esp), FP = negReal - TN;
      const cats = [];
      for (let i = 0; i < TP; i++) cats.push(0);
      for (let i = 0; i < FN; i++) cats.push(1);
      for (let i = 0; i < TN; i++) cats.push(2);
      for (let i = 0; i < FP; i++) cats.push(3);
      const r = api.aleatorio(11);
      for (let i = cats.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = cats[i]; cats[i] = cats[j]; cats[j] = t; }

      const W = Math.max(280, Math.min(el.clientWidth || 520, 640));
      const cell = W / COL, H2 = Math.round(cell * FIL);
      canvas.width = Math.round(W * 2); canvas.height = Math.round(H2 * 2);
      canvas.style.width = W + 'px'; canvas.style.height = H2 + 'px';
      const ctx = canvas.getContext('2d');
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      ctx.clearRect(0, 0, W, H2);
      cats.forEach((cat, i) => {
        const fila = Math.floor(i / COL), col = i % COL;
        const cx = col * cell + cell / 2, cy = fila * cell + cell / 2, rad = cell * 0.36;
        ctx.fillStyle = (cat === 0 || cat === 1) ? c.mal : c.bien;
        ctx.beginPath();
        if (cat === 0 || cat === 3) ctx.arc(cx, cy, rad, 0, 2 * Math.PI);
        else ctx.rect(cx - rad, cy - rad, rad * 2, rad * 2);
        ctx.fill();
      });
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `Rejilla de 1000 personas: ${TP} verdaderos positivos, ${FN} falsos negativos, ${TN} verdaderos negativos, ${FP} falsos positivos.`);

      leyenda.innerHTML = `<span class="leyenda-item">● rojo = enfermo · test positivo</span><span class="leyenda-item">■ rojo = enfermo · test negativo</span><span class="leyenda-item">● verde = sano · test positivo</span><span class="leyenda-item">■ verde = sano · test negativo</span>`;

      const PPV = TP / (TP + FP || 1), NPV = TN / (TN + FN || 1);
      panel.innerHTML = `<div class="tabla-scroll"><table class="motor-tabla"><thead><tr><th></th><th scope="col">Test +</th><th scope="col">Test −</th></tr></thead><tbody>` +
        `<tr><th scope="row">Enfermo</th><td>${TP}</td><td>${FN}</td></tr><tr><th scope="row">Sano</th><td>${FP}</td><td>${TN}</td></tr></tbody></table></div>`;

      const lineas = [];
      lineas.push(`De 1000 personas: <strong>${posReal}</strong> están realmente enfermas y <strong>${negReal}</strong> sanas (prevalencia ${num(100 * E.prev, 1)} %).`);
      lineas.push(`De los <strong>${TP + FP}</strong> con test positivo, solo <strong>${TP}</strong> están enfermas → VPP = P(enfermo | test +) = <strong>${num(PPV, 3)}</strong>.`);
      lineas.push(`De los ${TN + FN} con test negativo, ${TN} están sanas → VPN = P(sano | test −) = ${num(NPV, 3)}.`);
      if (E.prev < 0.05) lineas.push('Con una prevalencia tan baja, incluso un test fiable produce muchos falsos positivos: hay más gente sana con test + que gente enferma con test +.');
      lectura.innerHTML = lineas.map(t => `<p>${t}</p>`).join('');
    }
    dibujar();
    return { redibujar: dibujar };
  }

  // ───────────────────────── naive-bayes ─────────────────────────
  function naiveBayes(el, p, api) {
    const H = api.html, num = api.num;
    const vocab = p.vocabulario || [];
    if (!vocab.length) throw new Error('El modo naive-bayes necesita "vocabulario"');
    const E = { prior: 0.5, incl: new Set(vocab.map((w, i) => i).filter(i => i < 2)) };

    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, lectura, controles);

    const chips = H('div', { class: 'motor-selector', role: 'group', 'aria-label': 'Palabras presentes en el mensaje' });
    vocab.forEach((w, i) => {
      const b = api.boton(w.palabra, () => { if (E.incl.has(i)) E.incl.delete(i); else E.incl.add(i); b.setAttribute('aria-pressed', String(E.incl.has(i))); dibujar(); });
      b.setAttribute('aria-pressed', String(E.incl.has(i)));
      chips.append(b);
    });
    controles.append(chips, api.slider({ etiqueta: 'P(spam) previa', min: 0.05, max: 0.95, paso: 0.01, valor: E.prior, alCambiar: v => { E.prior = v; dibujar(); } }));
    controles.append(api.boton('Reiniciar', () => { Motores.desmontar(el); Motores.montar(el, 'probabilidad', JSON.parse(JSON.stringify(p))); }));

    function dibujar() {
      const c = api.colores();
      const W = Math.max(300, Math.min(el.clientWidth || 640, 760));
      const filaAlto = 22, altoChart = vocab.length * filaAlto + 12, altoGauge = 60;
      grafica.innerHTML = '';
      const s = api.svg(W, altoChart + altoGauge);
      s.setAttribute('role', 'img');
      grafica.append(s);

      const previaLO = Math.log(E.prior / (1 - E.prior));
      const contribs = vocab.map((w, i) => E.incl.has(i) ? Math.log(w.p_spam / w.p_ham) : Math.log((1 - w.p_spam) / (1 - w.p_ham)));
      const total = previaLO + contribs.reduce((a, b) => a + b, 0);
      const pSpam = 1 / (1 + Math.exp(-total));

      const L = 140, R = W - 60, mid = (L + R) / 2;
      const maxAbs = Math.max(0.5, ...contribs.map(Math.abs));
      const escala = (R - L) / 2 / maxAbs;
      const X = vv => mid + vv * escala;
      api.el('line', { x1: mid, x2: mid, y1: 4, y2: altoChart - 4, stroke: c.suave }, s);
      vocab.forEach((w, i) => {
        const y = 6 + i * filaAlto, incluida = E.incl.has(i), val = contribs[i];
        const x0v = Math.min(X(0), X(val)), wdt = Math.max(1, Math.abs(X(val) - X(0)));
        api.el('rect', { x: x0v, y, width: wdt, height: filaAlto - 7, fill: val >= 0 ? c.mal : c.bien, 'fill-opacity': incluida ? 1 : 0.5 }, s);
        api.el('text', { x: L - 8, y: y + filaAlto - 12, 'text-anchor': 'end', 'font-size': 12, fill: incluida ? c.texto : c.suave, text: (incluida ? '' : 'sin ') + w.palabra }, s);
        api.el('text', { x: X(val) + (val >= 0 ? 5 : -5), y: y + filaAlto - 12, 'text-anchor': val >= 0 ? 'start' : 'end', 'font-size': 10, fill: c.suave, text: num(val, 2) }, s);
      });

      const gy = altoChart + 12, gx0 = L, gx1 = R;
      api.el('rect', { x: gx0, y: gy, width: gx1 - gx0, height: 16, fill: c.rejilla, rx: 3 }, s);
      api.el('rect', { x: gx0, y: gy, width: (gx1 - gx0) * pSpam, height: 16, fill: c.acento, rx: 3 }, s);
      api.el('text', { x: (gx0 + gx1) / 2, y: gy + 30, 'text-anchor': 'middle', 'font-size': 12, fill: c.texto, text: `P(spam | mensaje) = ${num(pSpam, 3)}` }, s);
      api.el('text', { x: (gx0 + gx1) / 2, y: gy + 44, 'text-anchor': 'middle', 'font-size': 11, fill: c.suave, text: `previa P(spam) = ${num(E.prior, 2)}` }, s);

      const lineas = [];
      lineas.push(`Palabras marcadas como presentes: ${vocab.filter((w, i) => E.incl.has(i)).map(w => w.palabra).join(', ') || '(ninguna)'}.`);
      lineas.push(`log-odds previa = ${num(previaLO, 3)} · log-odds tras las palabras = <strong>${num(total, 3)}</strong> → P(spam|mensaje) = <strong>${num(pSpam, 3)}</strong>.`);
      lineas.push('Cada palabra, esté presente o ausente, multiplica la probabilidad (suma en log-odds): las barras rojas empujan hacia spam, las verdes hacia no-spam.');
      lectura.innerHTML = lineas.map(t => `<p>${t}</p>`).join('');
      s.setAttribute('aria-label', 'Contribución de cada palabra a la probabilidad de spam. ' + lectura.textContent);
    }
    dibujar();
    return { redibujar: dibujar };
  }

  // ───────────────────────── softmax ─────────────────────────
  function softmaxModo(el, p, api) {
    const H = api.html, num = api.num;
    const toks = p.logits || [];
    if (!toks.length) throw new Error('El modo softmax necesita "logits"');
    const E = { t: 1 };

    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, lectura, controles);
    controles.append(
      api.slider({ etiqueta: 'temperatura T', min: 0.1, max: 3, paso: 0.05, valor: E.t, alCambiar: v => { E.t = v; dibujar(); } }),
      api.boton('Reiniciar', () => { Motores.desmontar(el); Motores.montar(el, 'probabilidad', JSON.parse(JSON.stringify(p))); })
    );

    function softmaxT(logits, t) {
      const m = Math.max(...logits.map(l => l / t));
      const exps = logits.map(l => Math.exp(l / t - m));
      const suma = exps.reduce((a, b) => a + b, 0);
      return exps.map(e2 => e2 / suma);
    }

    function dibujar() {
      const c = api.colores();
      const probs = softmaxT(toks.map(t => t.logit), E.t);
      const iMax = probs.indexOf(Math.max(...probs));
      const W = Math.max(300, Math.min(el.clientWidth || 640, 760));
      const filaAlto = 26, alto = toks.length * filaAlto + 12;
      grafica.innerHTML = '';
      const s = api.svg(W, alto);
      s.setAttribute('role', 'img');
      grafica.append(s);
      const L = 90, R = W - 130, X = api.escala(0, Math.max(0.05, Math.max(...probs) * 1.15), L, R);
      toks.forEach((tok, i) => {
        const y = 6 + i * filaAlto, destacado = i === iMax;
        api.el('text', { x: L - 8, y: y + filaAlto - 11, 'text-anchor': 'end', 'font-size': 12, 'font-weight': destacado ? 700 : 400, fill: c.texto, text: tok.token }, s);
        api.el('rect', { x: L, y, width: Math.max(1, X(probs[i]) - L), height: filaAlto - 8, fill: destacado ? c.acento : c.series[1], 'fill-opacity': destacado ? 1 : 0.55 }, s);
        api.el('text', { x: X(probs[i]) + 6, y: y + filaAlto - 11, 'font-size': 11, fill: c.suave, text: num(100 * probs[i], 1) + ' %  (logit ' + num(tok.logit, 2) + ')' }, s);
      });

      const entropia = -probs.reduce((a, pi) => a + (pi > 1e-12 ? pi * Math.log2(pi) : 0), 0);
      const maxEntropia = Math.log2(toks.length);
      const lineas = [];
      lineas.push(`Con T = ${num(E.t, 2)}: token más probable = <strong>${toks[iMax].token}</strong> (p = ${num(probs[iMax], 3)}).`);
      lineas.push(`Entropía de la distribución: ${num(entropia, 3)} bits (máxima con ${toks.length} tokens equiprobables: ${num(maxEntropia, 3)} bits).`);
      lineas.push(E.t < 0.5 ? 'T pequeña: la distribución se afila hacia el máximo (casi un argmax).' : E.t > 1.8 ? 'T grande: la distribución se aplana hacia la uniforme.' : 'T = 1 es el softmax "estándar", sin reescalar los logits.');
      lectura.innerHTML = lineas.map(t => `<p>${t}</p>`).join('');
      s.setAttribute('aria-label', 'Distribución softmax de los tokens. ' + lectura.textContent);
    }
    dibujar();
    return { redibujar: dibujar };
  }

  Motores.registrar('probabilidad', function (el, p, api) {
    const modo = p.modo;
    if (modo === 'venn') return venn(el, p, api);
    if (modo === 'tabla') return tabla(el, p, api);
    if (modo === 'test') return testDiag(el, p, api);
    if (modo === 'naive-bayes') return naiveBayes(el, p, api);
    if (modo === 'softmax') return softmaxModo(el, p, api);
    throw new Error('Modo desconocido: ' + modo);
  }, {
    ejemplos: {
      venn: { modo: 'venn', valores: { conjuntos: [{ nombre: 'Llueve', p: 0.3 }, { nombre: 'Nublado', p: 0.5 }], interseccion: 0.22 } },
      tabla: { modo: 'tabla', valores: { filas: ['Spam', 'No spam'], columnas: ['Contiene "gratis"', 'No la contiene'], conteos: [[45, 15], [20, 220]] } },
      test: { modo: 'test', valores: { prevalencia: 0.01, sensibilidad: 0.95, especificidad: 0.9 } },
      'naive-bayes': { modo: 'naive-bayes', vocabulario: [{ palabra: 'gratis', p_spam: 0.3, p_ham: 0.01 }, { palabra: 'gana', p_spam: 0.25, p_ham: 0.02 }, { palabra: 'reunión', p_spam: 0.02, p_ham: 0.15 }, { palabra: 'factura', p_spam: 0.05, p_ham: 0.12 }] },
      softmax: { modo: 'softmax', logits: [{ token: 'gato', logit: 2.1 }, { token: 'perro', logit: 1.8 }, { token: 'coche', logit: -0.5 }, { token: 'casa', logit: 0.3 }] },
    },
  });
})();
