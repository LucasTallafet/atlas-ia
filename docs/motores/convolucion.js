// @modos: -
// Motor "convolucion": kernel deslizándose sobre una imagen pixelada, con padding, stride y pooling opcional.
// Táctil (§8b): la ventana se arrastra por la imagen, el filtro se edita con − / + y los pasos van en la barra fija.
(function () {
  'use strict';

  function hexRGB(hex) {
    const h = String(hex).replace('#', '').trim();
    const n = h.length === 3 ? h.split('').map(ch => ch + ch).join('') : h;
    const v = parseInt(n, 16) || 0;
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }
  function mezclar(a, b, t) { return [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * t)); }

  function rellenar(imagen, pad) {
    if (!pad) return imagen.map(f => f.slice());
    const filas = imagen.length, cols = imagen[0].length;
    const out = Array.from({ length: filas + 2 * pad }, () => Array(cols + 2 * pad).fill(0));
    for (let i = 0; i < filas; i++) for (let j = 0; j < cols; j++) out[i + pad][j + pad] = imagen[i][j];
    return out;
  }
  function posicionesConv(imgP, kernel, stride) {
    const kf = kernel.length, kc = kernel[0].length;
    const outF = Math.floor((imgP.length - kf) / stride) + 1, outC = Math.floor((imgP[0].length - kc) / stride) + 1;
    const pos = [];
    if (outF > 0 && outC > 0) for (let i = 0; i < outF; i++) for (let j = 0; j < outC; j++) pos.push([i * stride, j * stride]);
    return { pos, outF, outC };
  }
  function convolucionEn(imgP, kernel, fi, ci) {
    let suma = 0;
    for (let a = 0; a < kernel.length; a++) for (let b = 0; b < kernel[0].length; b++) suma += kernel[a][b] * imgP[fi + a][ci + b];
    return suma;
  }
  function agrupar(mat, modo) {
    const filas = mat.length, cols = mat[0].length, outF = Math.floor(filas / 2), outC = Math.floor(cols / 2);
    if (outF < 1 || outC < 1) return null;
    const out = Array.from({ length: outF }, () => Array(outC).fill(0));
    for (let i = 0; i < outF; i++) for (let j = 0; j < outC; j++) {
      const v = [mat[2 * i][2 * j], mat[2 * i][2 * j + 1], mat[2 * i + 1][2 * j], mat[2 * i + 1][2 * j + 1]];
      out[i][j] = modo === 'max' ? Math.max(...v) : v.reduce((a, b) => a + b, 0) / 4;
    }
    return out;
  }
  function rangoDe(mat) {
    const r = { mn: Math.min(...mat.flat()), mx: Math.max(...mat.flat()) };
    if (!(r.mx > r.mn)) r.mx = r.mn + 1;
    return r;
  }

  // Dibuja una matriz como rejilla de celdas coloreadas; celdas con valor null salen vacías (discontinuas).
  function dibujarGrid(api, g, c, ox, oy, mat, celda, escala, resaltar, F) {
    const filas = mat.length, cols = mat[0].length;
    let mn = escala ? escala.mn : Infinity, mx = escala ? escala.mx : -Infinity;
    if (!escala) {
      mat.forEach(f => f.forEach(v => { if (v !== null && v !== undefined) { if (v < mn) mn = v; if (v > mx) mx = v; } }));
      if (!(mx > mn)) mx = mn + 1;
    }
    for (let i = 0; i < filas; i++) {
      for (let j = 0; j < cols; j++) {
        const v = mat[i][j], conocido = v !== null && v !== undefined;
        const x = ox + j * celda, y = oy + i * celda;
        const t = conocido ? Math.min(1, Math.max(0, (v - mn) / (mx - mn))) : 0;
        api.el('rect', {
          x, y, width: celda, height: celda,
          fill: conocido ? `rgb(${mezclar(hexRGB(c.fondo), hexRGB(c.acento), t).join(',')})` : c.superficie,
          stroke: c.linea, 'stroke-width': 1, 'stroke-dasharray': conocido ? null : '3 2',
        }, g);
        if (conocido && celda >= 22) {
          const texto = Number.isInteger(v) ? api.num(v, 0) : api.num(v, 1);
          api.el('text', { x: x + celda / 2, y: y + celda / 2 + F * 0.35, 'text-anchor': 'middle', 'font-size': F, fill: t > 0.55 ? c.superficie : c.texto, text: texto }, g);
        }
      }
    }
    if (resaltar) {
      const [fi0, fi1, ci0, ci1] = resaltar;
      api.el('rect', { x: ox + ci0 * celda, y: oy + fi0 * celda, width: (ci1 - ci0 + 1) * celda, height: (fi1 - fi0 + 1) * celda, fill: 'none', stroke: c.mal, 'stroke-width': 2.4 }, g);
    }
  }

  Motores.registrar('convolucion', function (el, p, api) {
    const H = api.html, num = api.num;
    const imagen = p.imagen, kernel0 = p.kernel;
    if (!Array.isArray(imagen) || !imagen.length) throw new Error('convolucion necesita "imagen"');
    if (!Array.isArray(kernel0) || !kernel0.length) throw new Error('convolucion necesita "kernel"');
    const padding = p.padding || 0, stride = p.stride || 1, pooling = p.pooling || 'ninguno';
    const fmt = v => (Number.isInteger(v) ? num(v, 0) : num(v, 2));

    const imgP = rellenar(imagen, padding);
    const kernel = kernel0.map(f => f.slice());   // editable con − / + (Reiniciar lo restaura)
    const { pos, outF, outC } = posicionesConv(imgP, kernel, stride);
    if (!pos.length) throw new Error('El kernel no cabe en la imagen con ese padding y stride');
    const escalaEntrada = rangoDe(imgP);
    let salidaCompleta, agrupadoCompleto, escalaSalida, escalaAgr;
    function calcular() {
      salidaCompleta = Array.from({ length: outF }, (_, i) => Array.from({ length: outC }, (_, j) => convolucionEn(imgP, kernel, pos[i * outC + j][0], pos[i * outC + j][1])));
      escalaSalida = rangoDe(salidaCompleta);
      agrupadoCompleto = pooling !== 'ninguno' ? agrupar(salidaCompleta, pooling) : null;
      escalaAgr = agrupadoCompleto ? rangoDe(agrupadoCompleto) : null;
    }
    calcular();

    const E = { paso: 0, sel: [0, 0] };
    const Z = api.zonas(el, { pieFijo: true });
    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const editor = H('div', { class: 'motor-controles' });
    Z.grafico.append(grafica, lectura, editor);
    const barra = api.barraPasos({
      alAnterior: () => ir(E.paso - 1), alSiguiente: () => ir(E.paso + 1),
      alReiniciar: () => {
        kernel.forEach((f, i) => f.forEach((_, j) => { kernel[i][j] = kernel0[i][j]; }));
        calcular(); dibujarEditor(); ir(0);
      },
    });
    Z.controles.append(barra);
    function ir(k) { E.paso = Math.max(0, Math.min(pos.length, k)); dibujar(); }

    // Editor del filtro: se toca una celda y se cambia con − / + (pasos de 1).
    function dibujarEditor() {
      editor.innerHTML = '';
      const kf = kernel.length, kc = kernel[0].length;
      const rej = H('div', { role: 'group', 'aria-label': 'Filtro (kernel)' });
      rej.style.cssText = `display:grid;grid-template-columns:repeat(${kc},minmax(44px,56px));gap:8px;margin:6px 0;`;
      for (let a = 0; a < kf; a++) for (let b = 0; b < kc; b++) {
        rej.append(api.boton(fmt(kernel[a][b]), () => { E.sel = [a, b]; dibujarEditor(); }, {
          'aria-pressed': String(E.sel[0] === a && E.sel[1] === b),
          'aria-label': `Filtro, fila ${a + 1}, columna ${b + 1}: ${fmt(kernel[a][b])}`,
        }));
      }
      const [sa, sb] = E.sel;
      const cambiar = (d) => { kernel[sa][sb] += d; calcular(); dibujarEditor(); dibujar(); };
      const mando = H('div', {},
        api.boton('−', () => cambiar(-1), { 'aria-label': 'Restar 1 a la celda elegida' }),
        H('span', { text: ` fila ${sa + 1}, col. ${sb + 1} = ${fmt(kernel[sa][sb])} ` }),
        api.boton('+', () => cambiar(1), { 'aria-label': 'Sumar 1 a la celda elegida' }));
      mando.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;';
      editor.append(H('div', { text: 'Filtro: toca una celda y cámbiala con − / +' }), rej, mando);
    }

    function textoLectura() {
      if (E.paso === 0) return `<p>El kernel de ${kernel.length}×${kernel[0].length} recorre la imagen con stride ${stride}${padding ? ` y relleno ${padding}` : ''}. Pulsa «Siguiente» o arrastra la ventana roja.</p>`;
      const k = E.paso - 1, [fi, ci] = pos[k];
      const terminos = [];
      for (let a = 0; a < kernel.length; a++) for (let b = 0; b < kernel[0].length; b++) terminos.push(`${fmt(kernel[a][b])}·${fmt(imgP[fi + a][ci + b])}`);
      let texto = `<p>Posición (fila ${fi}, columna ${ci}): ${terminos.join(' + ')} = <strong>${fmt(salidaCompleta[Math.floor(k / outC)][k % outC])}</strong></p>`;
      if (E.paso === pos.length) {
        texto += `<p>Mapa de características completo (${outF}×${outC}).</p>`;
        if (pooling !== 'ninguno') texto += `<p>Agrupación (<em>pooling</em>) ${pooling} 2×2: cada celda toma ${pooling === 'max' ? 'el máximo' : 'la media'} de un bloque de 2×2 del mapa anterior.</p>`;
      }
      return texto;
    }

    function dibujar() {
      const c = api.colores();
      const salida = Array.from({ length: outF }, (_, i) => Array.from({ length: outC }, (_, j) => (i * outC + j < E.paso ? salidaCompleta[i][j] : null)));
      const agrupado = E.paso === pos.length ? agrupadoCompleto : null;

      const anchoDisp = api.medida(grafica, { maxAncho: 560, minAncho: 280 }).ancho;
      const celda = Math.max(14, Math.min(34, (anchoDisp - 20) / Math.max(imgP[0].length, outC, agrupado ? agrupado[0].length : 0)));
      const altoEntrada = imgP.length * celda, anchoEntrada = imgP[0].length * celda;
      const altoSalida = outF * celda, anchoSalida = outC * celda;
      const altoAgr = agrupado ? agrupado.length * celda : 0, anchoAgr = agrupado ? agrupado[0].length * celda : 0;
      const anchoTotal = Math.max(anchoEntrada, anchoSalida, anchoAgr) + 20;
      const sep = 34;
      const altoTotal = 24 + altoEntrada + sep + altoSalida + (agrupado ? sep + altoAgr : 8) + 10;

      grafica.innerHTML = '';
      const s = api.svg(anchoTotal, altoTotal);
      grafica.append(s);
      const F = api.fuente(s, 12);

      let y = 20;
      api.el('text', { x: 10, y: 16, 'font-size': F, 'font-weight': 700, fill: c.suave, text: 'Entrada' + (padding ? ` (relleno ${padding})` : '') }, s);
      const g1 = api.el('g', {}, s);
      const ultima = E.paso > 0 ? pos[Math.min(E.paso, pos.length) - 1] : pos[0];
      const resaltarEntrada = [ultima[0], ultima[0] + kernel.length - 1, ultima[1], ultima[1] + kernel[0].length - 1];
      dibujarGrid(api, g1, c, 10, y, imgP, celda, escalaEntrada, resaltarEntrada, F);
      // Asa de la ventana: se arrastra por la imagen y salta a la posición válida más cercana.
      const asa = api.el('rect', { x: 10 + ultima[1] * celda, y: y + ultima[0] * celda, width: kernel[0].length * celda, height: kernel.length * celda, fill: c.mal, 'fill-opacity': 0.1, stroke: 'none' }, s);
      const oy = y;
      api.arrastrable(asa, {
        zona: grafica, clave: 'ventana', radio: 24, tactil: 'none', etiqueta: 'Ventana del filtro',
        valor: () => `posición ${Math.max(1, Math.min(E.paso, pos.length))} de ${pos.length}`,
        alMover: (pt) => {
          const q = api.aSvg(grafica.querySelector('svg'), pt);
          const fi = (q.y - oy) / celda - kernel.length / 2, ci = (q.x - 10) / celda - kernel[0].length / 2;
          let mejor = 0, dm = Infinity;
          pos.forEach(([f, cc], k) => { const d = (f - fi) ** 2 + (cc - ci) ** 2; if (d < dm) { dm = d; mejor = k; } });
          if (mejor + 1 !== E.paso) ir(mejor + 1);
        },
        alTecla: (dx, dy) => ir(E.paso + (dx || -dy || 0)),
      });
      y += altoEntrada + sep;

      api.el('text', { x: 10, y: y - 14, 'font-size': F, 'font-weight': 700, fill: c.suave, text: 'Salida (mapa de características)' }, s);
      const g2 = api.el('g', {}, s);
      dibujarGrid(api, g2, c, 10, y, salida, celda, escalaSalida, null, F);
      y += altoSalida + (agrupado ? sep : 8);

      if (agrupado) {
        api.el('text', { x: 10, y: y - 14, 'font-size': F, 'font-weight': 700, fill: c.suave, text: `Agrupado (${pooling})` }, s);
        const g3 = api.el('g', {}, s);
        dibujarGrid(api, g3, c, 10, y, agrupado, celda, escalaAgr, null, F);
      }

      lectura.innerHTML = textoLectura();
      barra.poner(E.paso, pos.length + 1);
      s.setAttribute('role', 'img');
      s.setAttribute('aria-label', 'Convolución paso a paso sobre la imagen.');
    }
    dibujarEditor();
    dibujar();
    return { redibujar: dibujar };
  }, {
    ejemplos: {
      '-': {
        imagen: [[2, 2, 2, 8, 8, 8], [2, 2, 2, 8, 8, 8], [2, 2, 2, 8, 8, 8], [2, 2, 2, 8, 8, 8], [2, 2, 2, 8, 8, 8], [2, 2, 2, 8, 8, 8]],
        kernel: [[1, 0, -1], [1, 0, -1], [1, 0, -1]],
        padding: 1,
        stride: 1,
        pooling: 'max',
      },
    },
  });
})();
