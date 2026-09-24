// @modos: -
// Motor "linea-tiempo": línea temporal navegable con periodos (bandas de fondo) e hitos (puntos clicables).
(function () {
  'use strict';

  Motores.registrar('linea-tiempo', function (el, p, api) {
    const H = api.html, num = api.num;
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

    const scroll = H('div', {});
    scroll.style.overflowX = 'auto';
    scroll.style.paddingBottom = '.2rem';
    const grafica = H('div', { class: 'motor-grafica' });
    const detalle = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    scroll.append(grafica);
    el.append(scroll, detalle, controles);

    const bAnt = api.boton('← Anterior', () => ir(sel - 1));
    const bSig = api.boton('Siguiente →', () => ir(sel + 1), { class: 'boton boton-principal' });
    controles.append(bAnt, bSig);
    el.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') { ir(sel + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { ir(sel - 1); e.preventDefault(); }
    });
    function ir(i) { sel = Math.max(0, Math.min(hitos.length - 1, i)); dibujar(); }

    function dibujar() {
      const c = api.colores();
      const anchoDisp = Math.max(320, el.clientWidth || 640);
      const espacio = Math.max(64, Math.min(120, anchoDisp / Math.max(3, hitos.length)));
      const ancho = Math.max(anchoDisp, Math.round(espacio * (hitos.length + 1)));
      grafica.innerHTML = '';
      const s = api.svg(ancho, alto);
      grafica.append(s);
      const margenL = 34, margenR = 34;
      const X = api.escala(dom0, dom1, margenL, ancho - margenR);

      periodos.forEach((pe, i) => {
        const x0 = X(pe.desde), x1 = X(pe.hasta);
        api.el('rect', { x: x0, y: ejeY - 46, width: Math.max(2, x1 - x0), height: 26, rx: 5, fill: c.series[i % 8], opacity: 0.22 }, s);
        api.el('text', { x: (x0 + x1) / 2, y: ejeY - 30, 'text-anchor': 'middle', 'font-size': 10.5, fill: c.suave, text: pe.etiqueta }, s);
      });

      api.el('line', { x1: margenL, x2: ancho - margenR, y1: ejeY, y2: ejeY, stroke: c.linea, 'stroke-width': 2 }, s);
      api.marcas(dom0, dom1, Math.max(3, Math.min(8, Math.round(ancho / 110)))).forEach(a => {
        const x = X(a);
        api.el('line', { x1: x, x2: x, y1: ejeY - 4, y2: ejeY + 4, stroke: c.linea }, s);
        api.el('text', { x, y: ejeY + 34, 'text-anchor': 'middle', 'font-size': 10, fill: c.suave, text: Math.round(a) }, s);
      });

      hitos.forEach((h, i) => {
        const x = X(h.año), activo = i === sel, arriba = i % 2 === 0;
        const yEti = arriba ? ejeY - 16 : ejeY + 16;
        api.el('line', { x1: x, x2: x, y1: ejeY, y2: yEti, stroke: activo ? c.acento : c.suave, 'stroke-width': 1.3 }, s);
        const pt = api.el('circle', { cx: x, cy: ejeY, r: activo ? 8 : 5.5, fill: activo ? c.acento : c.superficie, stroke: activo ? c.acento : c.suave, 'stroke-width': 1.6 }, s);
        pt.setAttribute('aria-label', h.año + ': ' + h.titulo);
        pt.style.cursor = 'pointer';
        pt.setAttribute('tabindex', '0');
        pt.setAttribute('role', 'button');
        pt.addEventListener('click', () => ir(i));
        pt.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ir(i); } });
        api.el('text', { x, y: arriba ? yEti - 6 : yEti + 14, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': activo ? 700 : 500, fill: activo ? c.acento : c.texto, text: h.año }, s);
      });
      s.setAttribute('role', 'img');
      s.setAttribute('aria-label', 'Línea de tiempo con ' + hitos.length + ' hitos, de ' + minA + ' a ' + maxA + '.');

      const h = hitos[sel];
      detalle.innerHTML = `<p><strong>${h.año} · ${h.titulo}</strong></p><p>${h.texto}</p>`;
      bAnt.disabled = sel === 0;
      bSig.disabled = sel === hitos.length - 1;

      const centro = X(h.año) - scroll.clientWidth / 2;
      scroll.scrollLeft = Math.max(0, Math.min(ancho - scroll.clientWidth, centro));
    }
    dibujar();
    return { redibujar: dibujar };
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
