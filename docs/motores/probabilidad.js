// @modos: venn, tabla, test, naive-bayes, softmax
// Motor "probabilidad": Venn, tabla de contingencia, test diagnóstico, Naive Bayes y softmax con temperatura.
(function () {
  'use strict';

  // Estructura común: gráfico (+ leyenda) arriba; lectura y controles debajo (§8b).
  function armazon(el, api) {
    const H = api.html, Z = api.zonas(el);
    const grafica = H('div', { class: 'motor-grafica' }), leyenda = H('div', { class: 'motor-leyenda' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' }), controles = H('div', { class: 'motor-controles' });
    Z.grafico.append(grafica, leyenda);
    Z.controles.append(lectura, controles);
    return { grafica, leyenda, lectura, controles };
  }
  const reiniciar = (el, p, api) => api.boton('Reiniciar', () => { Motores.desmontar(el); Motores.montar(el, 'probabilidad', JSON.parse(JSON.stringify(p))); });

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

    const { grafica, lectura, controles } = armazon(el, api);

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
    controles.append(sA, sB, sInt, reiniciar(el, p, api));

    function dibujar() {
      const c = api.colores();
      const areaUnit = 9000;
      const r1 = Math.sqrt(areaUnit * E.pa / Math.PI), r2 = Math.sqrt(areaUnit * E.pb / Math.PI);
      const d = resolverD(r1, r2, areaUnit * E.pab);
      const W = api.medida(grafica, { maxAncho: 640 }).ancho;
      const alto = Math.round(Math.max(r1, r2) * 2 + 110);
      grafica.innerHTML = ''; lectura.innerHTML = '';
      const s = api.svg(W, alto);
      s.setAttribute('role', 'group');
      grafica.append(s);
      const F = api.fuente(s, 13);
      const cx = W / 2, cy = alto / 2 + 10, x1c = cx - d / 2, x2c = cx + d / 2;
      const ca = api.el('circle', { cx: x1c, cy, r: r1, fill: c.series[0], 'fill-opacity': 0.35, stroke: c.series[0], 'stroke-width': 2 }, s);
      const cb = api.el('circle', { cx: x2c, cy, r: r2, fill: c.series[1], 'fill-opacity': 0.35, stroke: c.series[1], 'stroke-width': 2 }, s);
      api.inspeccionable(ca, `P(${nA}) = ${num(E.pa, 3)}`);
      api.inspeccionable(cb, `P(${nB}) = ${num(E.pb, 3)}`);
      api.el('text', { x: x1c - r1 * 0.55, y: cy - r1 - 8, 'text-anchor': 'middle', 'font-size': F, 'font-weight': 700, fill: c.series[0], text: nA }, s);
      api.el('text', { x: x2c + r2 * 0.55, y: cy - r2 - 8, 'text-anchor': 'middle', 'font-size': F, 'font-weight': 700, fill: c.series[1], text: nB }, s);
      if (E.pab > 0.001) api.el('text', { x: cx, y: cy + 4, 'text-anchor': 'middle', 'font-size': api.fuente(s, 13), 'font-weight': 700, fill: c.texto, 'paint-order': 'stroke', stroke: c.superficie, 'stroke-width': 3, 'pointer-events': 'none', text: num(E.pab, 3) }, s);

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
    // Los recuentos son editables (teclado numérico); el resto se recalcula al confirmar.
    const cont = conteos.map(fila => fila.slice());
    const E = { tipo: null, i: -1 };

    const { grafica, leyenda, lectura, controles } = armazon(el, api);
    const barras = H('div', { class: 'motor-grafica' });
    grafica.after(barras);

    const claveDe = () => (E.tipo === null ? 'n' : (E.tipo === 'fila' ? 'f' : 'c') + E.i);
    const grupo = api.segmentado(
      [{ valor: 'n', texto: 'Sin condición' }, ...filas.map((f, i) => ({ valor: 'f' + i, texto: 'fila: ' + f })), ...columnas.map((cn, j) => ({ valor: 'c' + j, texto: 'columna: ' + cn }))],
      { valor: 'n', titulo: 'Condicionar por', etiqueta: 'Condicionar por', alCambiar: v => {
        if (v === 'n') { E.tipo = null; E.i = -1; } else { E.tipo = v[0] === 'f' ? 'fila' : 'columna'; E.i = +v.slice(1); }
        dibujar();
      } });
    controles.append(grupo, reiniciar(el, p, api));

    function dibujar() {
      const c = api.colores();
      const N = cont.reduce((a, fila) => a + fila.reduce((x, y) => x + y, 0), 0) || 1;
      const totF = filas.map((_, i) => cont[i].reduce((a, b) => a + b, 0));
      const totC = columnas.map((_, j) => cont.reduce((a, fila) => a + fila[j], 0));
      const destacar = `background:color-mix(in srgb, ${c.acento} 18%, transparent)`;
      const filasHtml = filas.map((f, i) => {
        const celdas = columnas.map((cn, j) => {
          const cnt = cont[i][j];
          const marcada = (E.tipo === 'fila' && E.i === i) || (E.tipo === 'columna' && E.i === j);
          let sub;
          if (E.tipo === 'columna') sub = num(100 * cnt / (totC[E.i] || 1), 1) + ' %';
          else if (E.tipo === 'fila') sub = num(100 * cnt / (totF[E.i] || 1), 1) + ' %';
          else sub = num(100 * cnt / N, 1) + ' %';
          return `<td${marcada ? ` style="${destacar}"` : ''}><input class="prob-celda" type="text" inputmode="decimal" data-i="${i}" data-j="${j}" value="${cnt}" aria-label="Recuento: ${f}, ${cn}" style="width:4.5em;min-height:44px;font-size:16px;text-align:center"><br><span style="color:${c.suave};font-size:.95em">${sub}</span></td>`;
        }).join('');
        return `<tr><th scope="row"${E.tipo === 'fila' && E.i === i ? ` style="color:${c.acento}"` : ''}>${f}</th>${celdas}<td>${totF[i]}</td></tr>`;
      }).join('');
      const filaTotal = `<tr><th scope="row">Total</th>${columnas.map((cn, j) => `<td${E.tipo === 'columna' && E.i === j ? ` style="color:${c.acento}"` : ''}>${totC[j]}</td>`).join('')}<td>${N}</td></tr>`;
      grafica.innerHTML = `<div class="tabla-scroll"><table class="motor-tabla"><thead><tr><th></th>${columnas.map(cn => `<th scope="col">${cn}</th>`).join('')}<th>Total</th></tr></thead><tbody>${filasHtml}${filaTotal}</tbody></table></div>`;
      grafica.querySelectorAll('.prob-celda').forEach(inp => {
        const confirmar = () => {
          const v = Math.max(0, Math.round(parseFloat(inp.value.replace(',', '.'))));
          const i = +inp.dataset.i, j = +inp.dataset.j;
          if (Number.isFinite(v) && v !== cont[i][j]) { cont[i][j] = v; dibujar(); } else inp.value = cont[i][j];
        };
        inp.addEventListener('change', confirmar);
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); inp.blur(); } });
        inp.addEventListener('focus', () => inp.select());
      });

      let etiquetasBarra, valoresBarra;
      if (E.tipo === 'fila') {
        etiquetasBarra = columnas;
        valoresBarra = columnas.map((_, j) => cont[E.i][j] / (totF[E.i] || 1));
      } else if (E.tipo === 'columna') {
        etiquetasBarra = filas;
        valoresBarra = filas.map((_, i) => cont[i][E.i] / (totC[E.i] || 1));
      } else {
        etiquetasBarra = [];
        valoresBarra = [];
        filas.forEach((f, i) => columnas.forEach((cn, j) => { etiquetasBarra.push(f + ' ∩ ' + cn); valoresBarra.push(cont[i][j] / N); }));
      }
      barras.innerHTML = '';
      // Cada etiqueta va encima de su barra (a ancho completo): así no se recorta a 360 px.
      const Wb = api.medida(barras, { maxAncho: 640 }).ancho;
      const filaAltoB = 44, altoB = etiquetasBarra.length * filaAltoB + 4;
      const sb = api.svg(Wb, altoB);
      barras.append(sb);
      const Fb = api.fuente(sb, 13);
      const Lb = 8, Xb = api.escala(0, Math.max(0.0001, Math.max(...valoresBarra)), Lb, Wb - 70);
      etiquetasBarra.forEach((et, i) => {
        const y = i * filaAltoB + 2;
        api.el('text', { x: Lb, y: y + 14, 'font-size': Fb, fill: c.texto, text: et }, sb);
        const barra = api.el('rect', { x: Lb, y: y + 20, width: Math.max(1, Xb(valoresBarra[i]) - Lb), height: 16, fill: c.acento }, sb);
        api.inspeccionable(barra, `${et}: ${num(100 * valoresBarra[i], 1)} %`);
        api.el('text', { x: Xb(valoresBarra[i]) + 6, y: y + 33, 'font-size': Fb, fill: c.suave, text: num(100 * valoresBarra[i], 1) + ' %' }, sb);
      });
      sb.setAttribute('role', 'group');

      const lineas = [];
      if (E.tipo === null) {
        lineas.push(`Cada celda muestra el recuento y, debajo, la probabilidad conjunta P(fila, columna) = recuento / ${N}.`);
      } else if (E.tipo === 'fila') {
        lineas.push(`Condicionando en «${filas[E.i]}»: el porcentaje de cada celda es P(columna | ${filas[E.i]}) = recuento / ${totF[E.i]}.`);
        const mejor = columnas.map((cn, j) => [cn, cont[E.i][j] / (totF[E.i] || 1)]).sort((a, b) => b[1] - a[1])[0];
        lineas.push(`La columna más probable dado «${filas[E.i]}» es «${mejor[0]}» (${num(100 * mejor[1], 1)} %).`);
      } else {
        lineas.push(`Condicionando en «${columnas[E.i]}»: el porcentaje de cada celda es P(fila | ${columnas[E.i]}) = recuento / ${totC[E.i]}.`);
        const mejor = filas.map((f, i) => [f, cont[i][E.i] / (totC[E.i] || 1)]).sort((a, b) => b[1] - a[1])[0];
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

    const { grafica, leyenda, lectura, controles } = armazon(el, api);
    const panel = H('div', { class: 'motor-fila' });
    const persona = H('p', { class: 'motor-lectura', 'aria-live': 'polite', text: 'Toca un punto de la rejilla para ver quién es.' });
    lectura.before(panel, persona);
    let cats = [];
    controles.append(
      api.slider({ etiqueta: 'prevalencia', min: 0.005, max: 0.5, paso: 0.005, valor: E.prev, formato: v2 => num(100 * v2, 1) + ' %', alCambiar: v2 => { E.prev = v2; dibujar(); } }),
      api.slider({ etiqueta: 'sensibilidad', min: 0.5, max: 0.999, paso: 0.001, valor: E.sens, formato: v2 => num(100 * v2, 1) + ' %', alCambiar: v2 => { E.sens = v2; dibujar(); } }),
      api.slider({ etiqueta: 'especificidad', min: 0.5, max: 0.999, paso: 0.001, valor: E.esp, formato: v2 => num(100 * v2, 1) + ' %', alCambiar: v2 => { E.esp = v2; dibujar(); } }),
      reiniciar(el, p, api)
    );
    const canvas = H('canvas');
    grafica.append(canvas);
    const NOMBRES = ['enfermo · test positivo (verdadero positivo)', 'enfermo · test negativo (falso negativo)', 'sano · test negativo (verdadero negativo)', 'sano · test positivo (falso positivo)'];
    canvas.addEventListener('click', (e) => {
      const r = canvas.getBoundingClientRect(), cell = r.width / COL;
      const col = Math.floor((e.clientX - r.left) / cell), fila = Math.floor((e.clientY - r.top) / cell), i = fila * COL + col;
      if (col < 0 || col >= COL || i < 0 || i >= cats.length) return;
      persona.textContent = `Persona ${i + 1}: ${NOMBRES[cats[i]]}.`;
    });

    function dibujar() {
      const c = api.colores();
      const posReal = Math.round(N * E.prev), negReal = N - posReal;
      const TP = Math.round(posReal * E.sens), FN = posReal - TP;
      const TN = Math.round(negReal * E.esp), FP = negReal - TN;
      cats = [];
      for (let i = 0; i < TP; i++) cats.push(0);
      for (let i = 0; i < FN; i++) cats.push(1);
      for (let i = 0; i < TN; i++) cats.push(2);
      for (let i = 0; i < FP; i++) cats.push(3);
      const r = api.aleatorio(11);
      for (let i = cats.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = cats[i]; cats[i] = cats[j]; cats[j] = t; }

      const W = api.medida(grafica, { maxAncho: 640 }).ancho;
      const cell = W / COL, H2 = Math.round(cell * FIL);
      const ctx = api.lienzoNitido(canvas, W, H2);
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

    const { grafica, lectura, controles } = armazon(el, api);

    const chips = H('div', { class: 'motor-selector', role: 'group', 'aria-label': 'Palabras presentes en el mensaje' });
    vocab.forEach((w, i) => {
      const b = api.boton(w.palabra, () => { if (E.incl.has(i)) E.incl.delete(i); else E.incl.add(i); b.setAttribute('aria-pressed', String(E.incl.has(i))); dibujar(); });
      b.setAttribute('aria-pressed', String(E.incl.has(i)));
      chips.append(b);
    });
    controles.append(chips, api.slider({ etiqueta: 'P(spam) previa', min: 0.05, max: 0.95, paso: 0.01, valor: E.prior, alCambiar: v => { E.prior = v; dibujar(); } }));
    controles.append(reiniciar(el, p, api));

    function dibujar() {
      const c = api.colores();
      const W = api.medida(grafica, { maxAncho: 760 }).ancho;
      const filaAlto = 28, altoChart = vocab.length * filaAlto + 12, altoGauge = 70;
      grafica.innerHTML = '';
      const s = api.svg(W, altoChart + altoGauge);
      s.setAttribute('role', 'group');
      grafica.append(s);
      const F = api.fuente(s, 13);

      const previaLO = Math.log(E.prior / (1 - E.prior));
      const contribs = vocab.map((w, i) => E.incl.has(i) ? Math.log(w.p_spam / w.p_ham) : Math.log((1 - w.p_spam) / (1 - w.p_ham)));
      const total = previaLO + contribs.reduce((a, b) => a + b, 0);
      const pSpam = 1 / (1 + Math.exp(-total));

      const L = W < 420 ? 96 : 140, R = W - 50, mid = (L + R) / 2;
      const maxAbs = Math.max(0.5, ...contribs.map(Math.abs));
      const escala = (R - L) / 2 / maxAbs;
      const X = vv => mid + vv * escala;
      api.el('line', { x1: mid, x2: mid, y1: 4, y2: altoChart - 4, stroke: c.suave }, s);
      vocab.forEach((w, i) => {
        const y = 6 + i * filaAlto, incluida = E.incl.has(i), val = contribs[i];
        const x0v = Math.min(X(0), X(val)), wdt = Math.max(1, Math.abs(X(val) - X(0)));
        const barra = api.el('rect', { x: x0v, y, width: wdt, height: filaAlto - 8, fill: val >= 0 ? c.mal : c.bien, 'fill-opacity': incluida ? 1 : 0.5 }, s);
        api.inspeccionable(barra, `${incluida ? '' : 'Sin '}«${w.palabra}»: ${num(val, 2)} en log-odds (${val >= 0 ? 'empuja hacia spam' : 'empuja hacia no-spam'})`);
        api.el('text', { x: L - 8, y: y + filaAlto - 12, 'text-anchor': 'end', 'font-size': F, fill: incluida ? c.texto : c.suave, text: (incluida ? '' : 'sin ') + w.palabra }, s);
        api.el('text', { x: X(val) + (val >= 0 ? 5 : -5), y: y + filaAlto - 12, 'text-anchor': val >= 0 ? 'start' : 'end', 'font-size': F, fill: c.suave, 'pointer-events': 'none', text: num(val, 2) }, s);
      });

      const gy = altoChart + 12, gx0 = 12, gx1 = W - 12;
      api.el('rect', { x: gx0, y: gy, width: gx1 - gx0, height: 16, fill: c.rejilla, rx: 3 }, s);
      api.el('rect', { x: gx0, y: gy, width: (gx1 - gx0) * pSpam, height: 16, fill: c.acento, rx: 3 }, s);
      api.el('text', { x: (gx0 + gx1) / 2, y: gy + 33, 'text-anchor': 'middle', 'font-size': F, fill: c.texto, text: `P(spam | mensaje) = ${num(pSpam, 3)}` }, s);
      api.el('text', { x: (gx0 + gx1) / 2, y: gy + 50, 'text-anchor': 'middle', 'font-size': F, fill: c.suave, text: `previa P(spam) = ${num(E.prior, 2)}` }, s);

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

    const { grafica, lectura, controles } = armazon(el, api);
    controles.append(
      api.slider({ etiqueta: 'temperatura T', min: 0.1, max: 3, paso: 0.05, valor: E.t, alCambiar: v => { E.t = v; dibujar(); } }),
      reiniciar(el, p, api)
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
      const W = api.medida(grafica, { maxAncho: 760 }).ancho;
      const filaAlto = 44, alto = toks.length * filaAlto + 4;
      grafica.innerHTML = '';
      const s = api.svg(W, alto);
      s.setAttribute('role', 'group');
      grafica.append(s);
      const F = api.fuente(s, 13);
      // Etiqueta (token y logit) encima de cada barra, a ancho completo: sin recortes a 360 px.
      const L = 8, R = W - 70, X = api.escala(0, Math.max(0.05, Math.max(...probs) * 1.15), L, R);
      toks.forEach((tok, i) => {
        const y = 2 + i * filaAlto, destacado = i === iMax;
        api.el('text', { x: L, y: y + 14, 'font-size': F, 'font-weight': destacado ? 700 : 400, fill: c.texto, text: `${tok.token} · logit ${num(tok.logit, 2)}` }, s);
        const barra = api.el('rect', { x: L, y: y + 20, width: Math.max(1, X(probs[i]) - L), height: 16, fill: destacado ? c.acento : c.series[1], 'fill-opacity': destacado ? 1 : 0.55 }, s);
        api.inspeccionable(barra, `${tok.token}: ${num(100 * probs[i], 1)} % (logit ${num(tok.logit, 2)})`);
        api.el('text', { x: X(probs[i]) + 6, y: y + 33, 'font-size': F, fill: c.suave, text: num(100 * probs[i], 1) + ' %' }, s);
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
