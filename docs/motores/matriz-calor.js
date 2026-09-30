// @modos: atencion, mascaras, busqueda, tabla-enlaces
// Motor "matriz-calor": rejilla SVG con cabeceras de fila/columna; cada celda es un nodo accesible (clic o Enter/espacio).
(function () {
  'use strict';

  function mezcla(base, obj, t) {
    const pct = Math.max(0, Math.min(100, Math.round(t * 100)));
    return `color-mix(in srgb, ${obj} ${pct}%, ${base})`;
  }
  function contraste(t, c) { return t > 0.55 ? c.superficie : c.texto; }
  function truncar(texto, maxChars) {
    const t = String(texto);
    return t.length > maxChars ? t.slice(0, Math.max(1, maxChars - 1)) + '…' : t;
  }
  function accesible(nodo, fn, aria) {
    nodo.setAttribute('tabindex', '0');
    nodo.setAttribute('role', 'button');
    if (aria) nodo.setAttribute('aria-label', aria);
    nodo.style.cursor = 'pointer';
    nodo.addEventListener('click', fn);
    nodo.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
  }
  function medidas(el, filas, columnas) {
    const dispW = Math.max(300, Math.min(el.clientWidth || 640, 760));
    const anchoEtiq = Math.max(60, Math.min(140, Math.max(...filas.map(f => String(f).length)) * 7 + 18));
    const nCols = columnas.length;
    const cellW = Math.max(44, Math.min(128, (dispW - anchoEtiq - 10) / nCols));
    // Táctil o estrecho: filas de 46 px (objetivo táctil); si la rejilla no cabe, se desplaza en su caja.
    const tactil = window.matchMedia('(pointer: coarse)').matches || (el.clientWidth || 640) < 560;
    const cellH = tactil ? 48 : 38, altoCab = tactil ? 34 : 30;
    return { ancho: anchoEtiq + cellW * nCols + 10, alto: altoCab + cellH * filas.length + 8, anchoEtiq, cellW, cellH, altoCab };
  }
  // celda(i, j) → {fill, texto?, colorTexto?, contorno?, grosor?, negrita?, aria?, onClick?}
  // alFila(i) (opcional): tocar la etiqueta de una fila. Las etiquetas recortadas ("…") se leen al tocarlas.
  function dibujarRejilla(api, s, c, filas, columnas, med, celda, alFila) {
    const g = api.el('g', {}, s);
    s.parentNode.style.overflowX = 'auto';
    s.style.maxWidth = 'none';
    s.style.width = med.ancho + 'px';
    const F = api.fuente(s, 12);
    const ch = F * 0.6;   // ancho medio de un carácter
    columnas.forEach((cn, j) => {
      const x = med.anchoEtiq + j * med.cellW + med.cellW / 2;
      const t = api.el('text', { x, y: med.altoCab - 10, 'text-anchor': 'middle', 'font-size': F, 'font-weight': 600, fill: c.suave, text: truncar(cn, Math.max(3, Math.floor(med.cellW / ch))) }, g);
      const zona = api.el('rect', { x: x - med.cellW / 2, y: 0, width: med.cellW, height: med.altoCab, fill: 'transparent' }, g);
      api.inspeccionable(zona, 'Columna «' + cn + '»');
      void t;
    });
    filas.forEach((fn, i) => {
      const y = med.altoCab + i * med.cellH + med.cellH / 2 + F * 0.35;
      api.el('text', { x: med.anchoEtiq - 8, y, 'text-anchor': 'end', 'font-size': F, fill: c.suave, text: truncar(fn, Math.max(4, Math.floor((med.anchoEtiq - 10) / ch))), 'pointer-events': 'none' }, g);
      const zona = api.el('rect', { x: 0, y: med.altoCab + i * med.cellH, width: med.anchoEtiq, height: med.cellH, fill: 'transparent' }, g);
      if (alFila) accesible(zona, () => alFila(i), 'Fila «' + fn + '»: resaltar');
      else api.inspeccionable(zona, 'Fila «' + fn + '»');
    });
    filas.forEach((fn, i) => {
      columnas.forEach((cn, j) => {
        const d = celda(i, j);
        const x0 = med.anchoEtiq + j * med.cellW, y0 = med.altoCab + i * med.cellH;
        const rect = api.el('rect', { x: x0 + 1.5, y: y0 + 1.5, width: med.cellW - 3, height: med.cellH - 3, rx: 4, fill: d.fill, stroke: d.contorno || c.linea, 'stroke-width': d.grosor || 1 }, g);
        if (d.texto) api.el('text', { x: x0 + med.cellW / 2, y: y0 + med.cellH / 2 + F * 0.35, 'text-anchor': 'middle', 'font-size': F, 'font-weight': d.negrita ? 700 : 500, fill: d.colorTexto || c.texto, text: d.texto, 'pointer-events': 'none' }, g);
        if (d.onClick) accesible(rect, d.onClick, d.aria);
        if (d.aria) api.inspeccionable(rect, d.aria);
      });
    });
  }

  // ───────────────────────── atencion ─────────────────────────
  function modoAtencion(el, p, api) {
    const H = api.html, num = api.num;
    const filas = p.filas, columnas = p.columnas, V = p.valores;
    if (!V) throw new Error('El modo atencion necesita "valores"');
    const maxV = Math.max(1e-9, ...V.flat());
    const argmax = V.map(fila => fila.indexOf(Math.max(...fila)));
    const E = { sel: null, fila: null };
    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const Z = api.zonas(el);
    Z.grafico.append(grafica);
    Z.controles.append(lectura);

    function dibujar() {
      const c = api.colores();
      grafica.innerHTML = '';
      const med = medidas(el, filas, columnas);
      const s = api.svg(med.ancho, med.alto);
      s.setAttribute('role', 'img');
      s.setAttribute('aria-label', 'Mapa de atención de ' + filas.length + ' consultas sobre ' + columnas.length + ' claves.');
      grafica.append(s);
      dibujarRejilla(api, s, c, filas, columnas, med, (i, j) => {
        const v = V[i][j], t = v / maxV, sel = E.sel && E.sel[0] === i && E.sel[1] === j;
        return {
          fill: mezcla(c.superficie, c.acento, t), colorTexto: contraste(t, c), texto: num(v, 2),
          contorno: sel ? c.mal : (argmax[i] === j || E.fila === i ? c.acento : c.linea), grosor: sel || argmax[i] === j || E.fila === i ? 2.2 : 1,
          aria: `fila ${filas[i]}, columna ${columnas[j]}: ${num(v, 3)}`,
          onClick: () => { E.sel = sel ? null : [i, j]; dibujar(); },
        };
      }, (i) => { E.fila = E.fila === i ? null : i; dibujar(); });
      if (E.fila !== null && !E.sel) {
        const i = E.fila;
        lectura.innerHTML = `<p>«${filas[i]}» reparte su atención así: ${columnas.map((cn, j) => `«${cn}» ${num(V[i][j], 2)}`).join(', ')}.</p>`;
      } else if (E.sel) {
        const [i, j] = E.sel;
        lectura.innerHTML = `<p>«${filas[i]}» presta atención a «${columnas[j]}» con peso <strong>${num(V[i][j], 3)}</strong> (su mayor peso es «${columnas[argmax[i]]}»).</p>`;
      } else {
        lectura.innerHTML = '<p>Cada fila suma (casi) 1: son los pesos de atención de una consulta sobre cada clave. El contorno de color marca el máximo de cada fila. Toca una celda para leer su valor exacto o una palabra de la izquierda para resaltar su fila.</p>';
      }
    }
    dibujar();
    return { redibujar: dibujar };
  }

  // ───────────────────────── mascaras ─────────────────────────
  function modoMascaras(el, p, api) {
    const H = api.html;
    const filas = p.filas, columnas = p.columnas, V = p.valores;
    if (!V) throw new Error('El modo mascaras necesita "valores"');
    const E = { aplicada: true, sel: null };
    const grafica = H('div', { class: 'motor-grafica' });
    const leyenda = H('div', { class: 'motor-leyenda' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    const Z = api.zonas(el);
    Z.grafico.append(grafica, leyenda, lectura);
    Z.controles.append(controles);
    const bt = api.boton('Quitar máscara', () => { E.aplicada = !E.aplicada; bt.textContent = E.aplicada ? 'Quitar máscara' : 'Aplicar máscara'; dibujar(); });
    controles.append(bt);

    function dibujar() {
      const c = api.colores();
      grafica.innerHTML = ''; leyenda.innerHTML = '';
      const med = medidas(el, filas, columnas);
      const s = api.svg(med.ancho, med.alto);
      s.setAttribute('role', 'img');
      s.setAttribute('aria-label', 'Máscara de atención, ' + (E.aplicada ? 'aplicada' : 'sin aplicar') + '.');
      grafica.append(s);
      dibujarRejilla(api, s, c, filas, columnas, med, (i, j) => {
        const permitido = !E.aplicada || V[i][j] !== 0;
        const sel = E.sel && E.sel[0] === i && E.sel[1] === j;
        return {
          fill: permitido ? mezcla(c.superficie, c.acento, 0.55) : c.fondo, colorTexto: c.suave,
          texto: permitido ? '' : '×', contorno: sel ? c.mal : c.linea, grosor: sel ? 2.2 : 1,
          aria: `fila ${filas[i]}, columna ${columnas[j]}: ${permitido ? 'permitido' : 'bloqueado'}`,
          onClick: () => { E.sel = sel ? null : [i, j]; dibujar(); },
        };
      });
      leyenda.append(
        H('span', { class: 'leyenda-item' }, H('span', { class: 'leyenda-muestra', style: `--c:${c.acento}` }), 'permitido'),
        H('span', { class: 'leyenda-item' }, H('span', { class: 'leyenda-muestra', style: `--c:${c.mal}` }), 'bloqueado (×)'),
      );
      if (E.sel) {
        const [i, j] = E.sel, permitido = !E.aplicada || V[i][j] !== 0;
        lectura.innerHTML = `<p>Posición (fila «${filas[i]}», columna «${columnas[j]}»): <strong>${permitido ? 'permitido' : 'bloqueado'}</strong>. Antes del softmax, las posiciones bloqueadas se ponen a −∞ para que su peso final sea 0.</p>`;
      } else {
        lectura.innerHTML = `<p>${E.aplicada ? 'Con la máscara aplicada, cada fila solo puede atender a las columnas marcadas.' : 'Sin máscara: todas las posiciones son visibles entre sí.'} Haz clic en una celda para inspeccionarla.</p>`;
      }
    }
    dibujar();
    return { redibujar: dibujar };
  }

  // ───────────────────────── busqueda ─────────────────────────
  function modoBusqueda(el, p, api) {
    const H = api.html, num = api.num;
    const filas = p.filas, columnas = p.columnas, V = p.valores;
    if (!V) throw new Error('El modo busqueda necesita "valores"');
    const E = { criterio: 'max', sel: null };
    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    const Z = api.zonas(el);
    Z.grafico.append(grafica, lectura);
    Z.controles.append(controles);
    controles.append(api.segmentado([{ valor: 'max', texto: 'Mejor: el más alto' }, { valor: 'min', texto: 'Mejor: el más bajo' }],
      { valor: E.criterio, etiqueta: 'Qué cuenta como mejor resultado', alCambiar: (v) => { E.criterio = v; dibujar(); } }));

    function dibujar() {
      const c = api.colores();
      const plano = V.flat();
      const mn = Math.min(...plano), mx = Math.max(...plano), span = (mx - mn) || 1;
      let mi = 0, mj = 0, mejorV = E.criterio === 'max' ? -Infinity : Infinity;
      V.forEach((fila, i) => fila.forEach((v, j) => {
        if ((E.criterio === 'max' && v > mejorV) || (E.criterio === 'min' && v < mejorV)) { mejorV = v; mi = i; mj = j; }
      }));
      grafica.innerHTML = '';
      const med = medidas(el, filas, columnas);
      const s = api.svg(med.ancho, med.alto);
      s.setAttribute('role', 'img');
      s.setAttribute('aria-label', 'Resultados de la búsqueda de hiperparámetros.');
      grafica.append(s);
      dibujarRejilla(api, s, c, filas, columnas, med, (i, j) => {
        const v = V[i][j], t = (v - mn) / span, sel = E.sel && E.sel[0] === i && E.sel[1] === j, mejor = i === mi && j === mj;
        return {
          fill: mezcla(c.superficie, c.acento, t), colorTexto: contraste(t, c), texto: num(v, 3), negrita: mejor,
          contorno: mejor ? c.bien : (sel ? c.mal : c.linea), grosor: mejor || sel ? 2.4 : 1,
          aria: `fila ${filas[i]}, columna ${columnas[j]}: ${num(v, 4)}${mejor ? ', el mejor' : ''}`,
          onClick: () => { E.sel = sel ? null : [i, j]; dibujar(); },
        };
      });
      const base = `<p>Mejor combinación: fila «${filas[mi]}», columna «${columnas[mj]}», con ${num(mejorV, 4)} (contorno verde).</p>`;
      const extra = E.sel ? `<p>Celda seleccionada: fila «${filas[E.sel[0]]}», columna «${columnas[E.sel[1]]}» → ${num(V[E.sel[0]][E.sel[1]], 4)}.</p>` : '';
      lectura.innerHTML = base + extra;
    }
    dibujar();
    return { redibujar: dibujar };
  }

  // ───────────────────────── tabla-enlaces ─────────────────────────
  function modoTablaEnlaces(el, p, api) {
    const H = api.html;
    const filas = p.filas, columnas = p.columnas, V = p.valores;
    if (!V) throw new Error('El modo tabla-enlaces necesita "valores"');
    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const Z = api.zonas(el);
    Z.grafico.append(grafica);
    Z.controles.append(lectura);

    function dibujar() {
      const c = api.colores();
      grafica.innerHTML = '';
      const med = medidas(el, filas, columnas);
      const s = api.svg(med.ancho, med.alto);
      s.setAttribute('role', 'img');
      s.setAttribute('aria-label', 'Tabla de enlaces entre conceptos.');
      grafica.append(s);
      dibujarRejilla(api, s, c, filas, columnas, med, (i, j) => {
        const id = V[i] ? V[i][j] : null;
        if (!id) return { fill: c.fondo, texto: '—', colorTexto: c.suave };
        return {
          fill: mezcla(c.superficie, c.acento, 0.14), colorTexto: c.acento, texto: truncar(id, Math.max(4, Math.floor(med.cellW / 6.2))), negrita: true,
          contorno: c.acento, grosor: 1.4, aria: `«${filas[i]}» × «${columnas[j]}» → abrir ficha ${id}`,
          onClick: () => { location.hash = '#' + id; lectura.innerHTML = `<p>«${filas[i]}» × «${columnas[j]}» → <strong>${id}</strong>.</p>`; },
        };
      });
      lectura.innerHTML = '<p>Cada celda con nombre enlaza con esa ficha; las celdas vacías (—) no tienen una relación directa.</p>';
    }
    dibujar();
    return { redibujar: dibujar };
  }

  Motores.registrar('matriz-calor', function (el, p, api) {
    if (!Array.isArray(p.filas) || !Array.isArray(p.columnas)) throw new Error('matriz-calor necesita "filas" y "columnas"');
    const modo = p.modo;
    if (modo === 'atencion') return modoAtencion(el, p, api);
    if (modo === 'mascaras') return modoMascaras(el, p, api);
    if (modo === 'busqueda') return modoBusqueda(el, p, api);
    if (modo === 'tabla-enlaces') return modoTablaEnlaces(el, p, api);
    throw new Error('Modo desconocido: ' + modo);
  }, {
    ejemplos: {
      atencion: {
        modo: 'atencion',
        filas: ['el', 'gato', 'come'], columnas: ['el', 'gato', 'come', 'pescado'],
        valores: [[0.7, 0.2, 0.05, 0.05], [0.1, 0.6, 0.1, 0.2], [0.05, 0.15, 0.5, 0.3]],
      },
      mascaras: {
        modo: 'mascaras',
        filas: ['el', 'gato', 'come', 'pescado'], columnas: ['el', 'gato', 'come', 'pescado'],
        valores: [[1, 0, 0, 0], [1, 1, 0, 0], [1, 1, 1, 0], [1, 1, 1, 1]],
      },
      busqueda: {
        modo: 'busqueda',
        filas: ['lr=0,01', 'lr=0,1', 'lr=1'], columnas: ['λ=0', 'λ=0,1', 'λ=1'],
        valores: [[0.71, 0.74, 0.68], [0.82, 0.88, 0.79], [0.55, 0.6, 0.58]],
      },
      'tabla-enlaces': {
        modo: 'tabla-enlaces',
        filas: ['regresión', 'clasificación'], columnas: ['lineal', 'con árboles'],
        valores: [['regresion-lineal', 'bosque-aleatorio'], ['regresion-logistica', null]],
      },
    },
  });
})();
