// @modos: -
// Motor "linea-tiempo": línea temporal navegable con periodos (bandas de fondo) e hitos (puntos que se tocan).
(function () {
  'use strict';

  Motores.registrar('linea-tiempo', function (el, p, api) {
    const H = api.html;
    const hitos = (p.hitos || []).slice().sort((a, b) => a.año - b.año);
    if (!hitos.length) throw new Error('linea-tiempo necesita "hitos"');
    const periodos = p.periodos || [];
    let sel = 0;

    const años = hitos.map(h => h.año).concat(periodos.flatMap(pe => [pe.desde, pe.hasta]));
    const minA = Math.min(...años), maxA = Math.max(...años);
    const margen = Math.max(1, (maxA - minA) * 0.06);
    const dom0 = minA - margen, dom1 = maxA + margen;
    const ejeY = periodos.length ? 96 : 68;
    const alto = periodos.length ? 190 : 150;

    const Z = api.zonas(el);
    const scroll = H('div', { class: 'lt-scroll' });
    scroll.style.overflowX = 'auto';
    scroll.style.paddingBottom = '.2rem';
    const grafica = H('div', { class: 'motor-grafica' });
    const leyenda = H('div', { class: 'motor-leyenda' });
    const detalle = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const tarjetas = H('div', { class: 'lt-tarjetas', role: 'group', 'aria-label': 'Hitos de la línea de tiempo' });
    tarjetas.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin-top:12px;';
    const controles = H('div', { class: 'motor-controles' });
    scroll.append(grafica);
    Z.grafico.append(scroll, leyenda);
    Z.controles.append(detalle, controles, tarjetas);

    const bAnt = api.boton('← Anterior', () => ir(sel - 1));
    const bSig = api.boton('Siguiente →', () => ir(sel + 1), { class: 'boton boton-principal' });
    const pan = (k) => { scroll.scrollBy({ left: k * scroll.clientWidth * 0.6, behavior: api.reducido() ? 'auto' : 'smooth' }); };
    const bPan = H('div', { class: 'motor-selector', role: 'group', 'aria-label': 'Desplazar la línea de tiempo' },
      api.boton('‹', () => pan(-1), { 'aria-label': 'Desplazar hacia el pasado' }), api.boton('›', () => pan(1), { 'aria-label': 'Desplazar hacia el futuro' }));
    controles.append(bAnt, bSig, bPan);
    const botonesHito = hitos.map((h, i) => {
      const b = api.boton([H('b', { text: h.año }), ' · ' + h.titulo], () => ir(i), { style: 'text-align:left;height:auto;min-height:44px;white-space:normal' });
      tarjetas.append(b);
      return b;
    });
    el.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') { ir(sel + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { ir(sel - 1); e.preventDefault(); }
    });
    function ir(i, centrar) { sel = Math.max(0, Math.min(hitos.length - 1, i)); dibujar(centrar !== false); }

    let X = null;
    function dibujar(centrar) {
      const c = api.colores();
      const compacto = api.estrecho(el) || api.gruesa();
      const anchoDisp = Math.max(280, scroll.clientWidth || el.clientWidth || 640);
      const espacio = Math.max(compacto ? 72 : 64, Math.min(120, anchoDisp / Math.max(3, hitos.length)));
      // En táctil hay medio ancho de margen a cada lado: cualquier hito puede quedar centrado y siempre hay hacia dónde arrastrar.
      const pad = compacto ? Math.round(anchoDisp / 2) - 34 : 0;
      const ancho = Math.max(anchoDisp, Math.round(espacio * (hitos.length + 1))) + 2 * pad;
      const s0 = scroll.scrollLeft;
      grafica.innerHTML = ''; leyenda.innerHTML = '';
      const s = api.svg(ancho, alto);
      s.style.maxWidth = 'none'; s.style.width = ancho + 'px';   // ancho propio: la línea se recorre arrastrando
      grafica.append(s);
      const F = api.fuente(s, 12);
      const margenL = 34 + pad, margenR = 34 + pad;
      X = api.escala(dom0, dom1, margenL, ancho - margenR);

      periodos.forEach((pe, i) => {
        const x0 = X(pe.desde), x1 = X(pe.hasta);
        const banda = api.el('rect', { x: x0, y: ejeY - 46, width: Math.max(2, x1 - x0), height: 26, rx: 5, fill: c.series[i % 8], opacity: 0.22 }, s);
        api.inspeccionable(banda, `${pe.etiqueta} (${pe.desde}–${pe.hasta})`);
        // Las etiquetas de los periodos se solapan en estrecho: ahí van en la leyenda, bajo el gráfico.
        if (!compacto) api.el('text', { x: (x0 + x1) / 2, y: ejeY - 28, 'text-anchor': 'middle', 'font-size': F, fill: c.suave, 'pointer-events': 'none', text: pe.etiqueta }, s);
        else leyenda.append(H('span', { class: 'leyenda-item' }, H('span', { class: 'leyenda-muestra', style: `--c:${c.series[i % 8]}` }), `${pe.etiqueta} (${pe.desde}–${pe.hasta})`));
      });

      api.el('line', { x1: margenL, x2: ancho - margenR, y1: ejeY, y2: ejeY, stroke: c.linea, 'stroke-width': 2 }, s);
      api.marcas(dom0, dom1, Math.max(3, Math.min(8, Math.round(ancho / 110)))).forEach(a => {
        const x = X(a);
        api.el('line', { x1: x, x2: x, y1: ejeY - 4, y2: ejeY + 4, stroke: c.linea }, s);
        api.el('text', { x, y: ejeY + 34, 'text-anchor': 'middle', 'font-size': F, fill: c.suave, text: Math.round(a) }, s);
      });

      // Arrastrar en cualquier punto de la línea la mueve en el tiempo (pan-y: el scroll vertical sigue vivo).
      // El asa es el punto del hito activo; con radio infinito, el gesto vale en toda la zona.
      let inicio = 0, movido = false;
      const asaOpc = {
        zona: scroll, clave: 'tiempo', radio: Infinity, tactil: 'pan-y', etiqueta: 'Línea de tiempo',
        valor: () => `${Math.round(X.inversa(scroll.scrollLeft + scroll.clientWidth / 2))}`,
        alEmpezar: () => { inicio = scroll.scrollLeft; movido = false; },
        alMover: (q) => { if (Math.abs(q.dx) > 6) movido = true; scroll.scrollLeft = inicio - q.dx; },
        // Un toque sin arrastre elige el hito más cercano (≤ 28 px).
        alSoltar: (q) => {
          if (movido) return;
          const px = api.aSvg(s, q).x;
          let mejor = -1, d = 28;
          hitos.forEach((h, i) => { const dd = Math.abs(X(h.año) - px); if (dd < d) { d = dd; mejor = i; } });
          if (mejor >= 0) ir(mejor, false);
        },
        alTecla: (dx) => { scroll.scrollLeft += dx * 40; },
      };

      hitos.forEach((h, i) => {
        const x = X(h.año), activo = i === sel, arriba = i % 2 === 0;
        const yEti = arriba ? ejeY - 16 : ejeY + 16;
        api.el('line', { x1: x, x2: x, y1: ejeY, y2: yEti, stroke: activo ? c.acento : c.suave, 'stroke-width': 1.3, 'pointer-events': 'none' }, s);
        const pt = api.el('circle', { cx: x, cy: ejeY, r: activo ? 9 : 6.5, fill: activo ? c.acento : c.superficie, stroke: activo ? c.acento : c.suave, 'stroke-width': 1.8, 'pointer-events': 'none' }, s);
        if (activo) api.arrastrable(pt, asaOpc);
        // Diana táctil de 44 px alrededor del punto (teclado: Enter/espacio).
        const diana = api.el('circle', { cx: x, cy: ejeY, r: 24, fill: 'transparent' }, s);
        diana.setAttribute('aria-label', h.año + ': ' + h.titulo);
        diana.style.cursor = 'pointer';
        diana.setAttribute('tabindex', '0');
        diana.setAttribute('role', 'button');
        diana.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ir(i); } });
        // Solo el hito activo lleva año encima; los demás años están en el eje y en las tarjetas.
        if (activo || !compacto) api.el('text', { x, y: arriba ? yEti - 6 : yEti + 15, 'text-anchor': 'middle', 'font-size': F, 'font-weight': activo ? 700 : 500, fill: activo ? c.acento : c.texto, 'pointer-events': 'none', text: h.año }, s);
      });
      s.setAttribute('role', 'group');
      s.setAttribute('aria-label', 'Línea de tiempo con ' + hitos.length + ' hitos, de ' + minA + ' a ' + maxA + '.');

      const h = hitos[sel];
      detalle.innerHTML = `<p><strong>${h.año} · ${h.titulo}</strong></p><p>${h.texto}</p>`;
      bAnt.disabled = sel === 0;
      bSig.disabled = sel === hitos.length - 1;
      botonesHito.forEach((b, i) => b.setAttribute('aria-pressed', String(i === sel)));

      if (centrar) {
        const centro = X(h.año) - scroll.clientWidth / 2;
        scroll.scrollLeft = Math.max(0, Math.min(ancho - scroll.clientWidth, centro));
      } else scroll.scrollLeft = s0;
    }
    dibujar(true);
    return { redibujar: () => dibujar(true) };
  }, {
    ejemplos: {
      '-': {
        periodos: [{ desde: 1974, hasta: 1980, etiqueta: 'primer invierno de la IA' }, { desde: 1987, hasta: 1993, etiqueta: 'segundo invierno' }],
        hitos: [
          { año: 1956, titulo: 'Conferencia de Dartmouth', texto: 'Se acuña el término «inteligencia artificial» y nace el campo como disciplina.' },
          { año: 1974, titulo: 'Primer invierno de la IA', texto: 'El informe Lighthill recorta la financiación tras promesas incumplidas.' },
          { año: 1986, titulo: 'Retropropagación', texto: 'Rumelhart, Hinton y Williams popularizan cómo entrenar redes con varias capas.' },
          { año: 1997, titulo: 'Deep Blue vence a Kaspárov', texto: 'Un programa de IBM gana a un campeón mundial de ajedrez.' },
          { año: 2012, titulo: 'AlexNet', texto: 'Una red convolucional gana el concurso ImageNet por un margen enorme.' },
          { año: 2017, titulo: 'Transformer', texto: 'El artículo «Attention is all you need» cambia el procesamiento del lenguaje.' },
        ],
      },
    },
  });
})();
