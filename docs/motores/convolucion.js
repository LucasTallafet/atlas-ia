// @modos: -
// Motor "convolucion": kernel deslizándose sobre una imagen pixelada, con padding, stride y pooling opcional.
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

  // Dibuja una matriz como rejilla de celdas coloreadas; celdas con valor null salen vacías (discontinuas).
  function dibujarGrid(api, g, c, ox, oy, mat, celda, escala, resaltar) {
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
        if (conocido && celda >= 17) {
          const texto = Number.isInteger(v) ? api.num(v, 0) : api.num(v, 1);
          api.el('text', { x: x + celda / 2, y: y + celda / 2 + 4, 'text-anchor': 'middle', 'font-size': Math.min(11, celda * 0.42), fill: t > 0.55 ? c.superficie : c.texto, text: texto }, g);
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
    const imagen = p.imagen, kernel = p.kernel;
    if (!Array.isArray(imagen) || !imagen.length) throw new Error('convolucion necesita "imagen"');
    if (!Array.isArray(kernel) || !kernel.length) throw new Error('convolucion necesita "kernel"');
    const padding = p.padding || 0, stride = p.stride || 1, pooling = p.pooling || 'ninguno';
    const fmt = v => (Number.isInteger(v) ? num(v, 0) : num(v, 2));

    const imgP = rellenar(imagen, padding);
    const { pos, outF, outC } = posicionesConv(imgP, kernel, stride);
    if (!pos.length) throw new Error('El kernel no cabe en la imagen con ese padding y stride');
    const salidaCompleta = Array.from({ length: outF }, (_, i) => Array.from({ length: outC }, (_, j) => convolucionEn(imgP, kernel, pos[i * outC + j][0], pos[i * outC + j][1])));
    const escalaEntrada = { mn: Math.min(...imgP.flat()), mx: Math.max(...imgP.flat()) };
    const escalaSalida = { mn: Math.min(...salidaCompleta.flat()), mx: Math.max(...salidaCompleta.flat()) };
    if (!(escalaSalida.mx > escalaSalida.mn)) escalaSalida.mx = escalaSalida.mn + 1;
    if (!(escalaEntrada.mx > escalaEntrada.mn)) escalaEntrada.mx = escalaEntrada.mn + 1;
    const agrupadoCompleto = pooling !== 'ninguno' ? agrupar(salidaCompleta, pooling) : null;
    let escalaAgr = null;
    if (agrupadoCompleto) {
      escalaAgr = { mn: Math.min(...agrupadoCompleto.flat()), mx: Math.max(...agrupadoCompleto.flat()) };
      if (!(escalaAgr.mx > escalaAgr.mn)) escalaAgr.mx = escalaAgr.mn + 1;
    }

    const E = { paso: 0 };
    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, lectura, controles);

    const bPaso = api.boton('Paso →', () => { if (E.paso < pos.length) { E.paso++; dibujar(); } }, { class: 'boton boton-principal' });
    const bFinal = api.boton('Hasta el final', () => { E.paso = pos.length; dibujar(); });
    controles.append(bPaso, bFinal, api.boton('Reiniciar', () => { E.paso = 0; dibujar(); }));

    function textoLectura() {
      if (E.paso === 0) return `<p>El kernel de ${kernel.length}×${kernel[0].length} recorre la imagen con stride ${stride}${padding ? ` y relleno ${padding}` : ''}. Pulsa «Paso →» para deslizarlo.</p>`;
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

      const anchoDisp = Math.max(280, Math.min(el.clientWidth || 520, 560));
      const celda = Math.max(14, Math.min(30, (anchoDisp - 20) / Math.max(imgP[0].length, outC, agrupado ? agrupado[0].length : 0)));
      const altoEntrada = imgP.length * celda, anchoEntrada = imgP[0].length * celda;
      const altoSalida = outF * celda, anchoSalida = outC * celda;
      const altoAgr = agrupado ? agrupado.length * celda : 0, anchoAgr = agrupado ? agrupado[0].length * celda : 0;
      const anchoTotal = Math.max(anchoEntrada, anchoSalida, anchoAgr) + 20;
      const altoTotal = 24 + altoEntrada + 34 + altoSalida + (agrupado ? 34 + altoAgr : 8) + 10;

      grafica.innerHTML = '';
      const s = api.svg(anchoTotal, altoTotal);
      grafica.append(s);

      let y = 20;
      api.el('text', { x: 10, y: 16, 'font-size': 12, 'font-weight': 700, fill: c.suave, text: 'Entrada' + (padding ? ` (con relleno de ${padding})` : '') }, s);
      const g1 = api.el('g', {}, s);
      const ultima = E.paso > 0 ? pos[Math.min(E.paso, pos.length) - 1] : pos[0];
      const resaltarEntrada = [ultima[0], ultima[0] + kernel.length - 1, ultima[1], ultima[1] + kernel[0].length - 1];
      dibujarGrid(api, g1, c, 10, y, imgP, celda, escalaEntrada, resaltarEntrada);
      y += altoEntrada + 34;

      api.el('text', { x: 10, y: y - 14, 'font-size': 12, 'font-weight': 700, fill: c.suave, text: 'Salida (mapa de características)' }, s);
      const g2 = api.el('g', {}, s);
      dibujarGrid(api, g2, c, 10, y, salida, celda, escalaSalida, null);
      y += altoSalida + (agrupado ? 34 : 8);

      if (agrupado) {
        api.el('text', { x: 10, y: y - 14, 'font-size': 12, 'font-weight': 700, fill: c.suave, text: `Agrupado (${pooling})` }, s);
        const g3 = api.el('g', {}, s);
        dibujarGrid(api, g3, c, 10, y, agrupado, celda, escalaAgr, null);
      }

      lectura.innerHTML = textoLectura();
      bPaso.disabled = E.paso >= pos.length;
      bFinal.disabled = bPaso.disabled;
      s.setAttribute('role', 'img');
      s.setAttribute('aria-label', 'Convolución paso a paso sobre la imagen.');
    }
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
