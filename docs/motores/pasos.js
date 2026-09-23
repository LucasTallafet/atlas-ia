// @modos: -
// Motor "pasos": secuencia de fotogramas con Anterior / Siguiente.
// Cada fotograma: {html} (generado por build.py desde Markdown) o {texto} (Markdown breve),
// y opcionalmente {tabla: {cabecera, filas, resaltar: [[f, c]]}, cajas: [...], activa: i}.
(function () {
  'use strict';

  // Markdown mínimo para los fotogramas escritos a mano (demo): párrafos, listas, tablas, **negrita**, *cursiva*, `código`, $mates$.
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function enLinea(s) {
    const mates = [];
    s = s.replace(/\$([^$]+)\$/g, (_, m) => { mates.push(m); return `\u0000${mates.length - 1}\u0000`; });
    s = esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<span class="mates">\\(${esc(mates[+i])}\\)</span>`);
  }
  function markdown(texto) {
    const out = [];
    for (const bloque of String(texto).trim().split(/\n\s*\n/)) {
      const lineas = bloque.split('\n');
      if (lineas.every(l => /^\s*[-*] /.test(l))) {
        out.push('<ul>' + lineas.map(l => '<li>' + enLinea(l.replace(/^\s*[-*] /, '')) + '</li>').join('') + '</ul>');
      } else if (lineas.length >= 2 && lineas.every(l => /^\s*\|/.test(l))) {
        const celdas = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map(c => enLinea(c.trim()));
        const cab = celdas(lineas[0]);
        const cuerpo = lineas.slice(2).map(celdas);
        out.push('<table><thead><tr>' + cab.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>' +
          cuerpo.map(f => '<tr>' + f.map(c => `<td>${c}</td>`).join('') + '</tr>').join('') + '</tbody></table>');
      } else {
        out.push('<p>' + enLinea(lineas.join(' ')) + '</p>');
      }
    }
    return out.join('\n');
  }

  Motores.registrar('pasos', function (el, p, api) {
    const fotos = p.fotogramas || [];
    if (!fotos.length) throw new Error('Sin fotogramas');
    let i = 0;
    const H = api.html;

    const progreso = H('div', { class: 'pasos-progreso' });
    const marco = H('div', { class: 'pasos-marco', 'aria-live': 'polite', tabindex: '-1' });
    const contador = H('span', { class: 'pasos-contador' });
    const bAnt = api.boton('← Anterior', () => ir(i - 1), { 'aria-label': 'Paso anterior' });
    const bSig = api.boton('Siguiente →', () => ir(i + 1), { 'aria-label': 'Paso siguiente', class: 'boton boton-principal' });
    const bIni = api.boton('Reiniciar', () => ir(0));
    el.append(progreso, marco, api.fila(bAnt, contador, bSig, bIni));
    el.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') { ir(i + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { ir(i - 1); e.preventDefault(); }
    });

    function dibujarProgreso() {
      const c = api.colores();
      const ancho = Math.max(200, el.clientWidth || 300), alto = 22, n = fotos.length;
      const s = api.svg(ancho, alto);
      s.setAttribute('aria-hidden', 'true');
      const x = (k) => n === 1 ? ancho / 2 : 10 + k * (ancho - 20) / (n - 1);
      api.el('line', { x1: x(0), x2: x(n - 1), y1: 11, y2: 11, stroke: c.linea, 'stroke-width': 2 }, s);
      api.el('line', { x1: x(0), x2: x(i), y1: 11, y2: 11, stroke: c.acento, 'stroke-width': 3 }, s);
      for (let k = 0; k < n; k++) {
        const pt = api.el('circle', { cx: x(k), cy: 11, r: k === i ? 7 : 5, fill: k <= i ? c.acento : c.superficie, stroke: k <= i ? c.acento : c.suave, 'stroke-width': 1.5 }, s);
        pt.style.cursor = 'pointer';
        pt.addEventListener('click', () => ir(k));
      }
      progreso.innerHTML = '';
      progreso.append(s);
    }

    function dibujarCajas(f) {
      const c = api.colores();
      const n = f.cajas.length;
      const ancho = Math.max(280, Math.min(el.clientWidth || 600, 720));
      const vertical = ancho < 480 && n > 2;
      const cw = vertical ? Math.min(240, ancho - 40) : Math.min(150, (ancho - 20 * (n + 1)) / n);
      const ch = 44, gap = vertical ? 26 : (ancho - n * cw) / (n + 1);
      const alto = vertical ? n * ch + (n + 1) * gap : ch + 24;
      const s = api.svg(ancho, alto);
      s.setAttribute('role', 'img');
      s.setAttribute('aria-label', 'Diagrama: ' + f.cajas.join(' → '));
      const defs = api.el('defs', {}, s);
      const mk = api.el('marker', { id: 'flecha-pasos', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, defs);
      api.el('path', { d: 'M0,0 L10,5 L0,10 z', fill: c.suave }, mk);
      f.cajas.forEach((t, k) => {
        const x = vertical ? (ancho - cw) / 2 : gap + k * (cw + gap);
        const y = vertical ? gap + k * (ch + gap) : 12;
        const act = f.activa === k;
        api.el('rect', { x, y, width: cw, height: ch, rx: 8, fill: act ? c.acento : c.superficie, stroke: act ? c.acento : c.suave, 'stroke-width': act ? 2 : 1.2 }, s);
        api.el('text', { x: x + cw / 2, y: y + ch / 2 + 5, 'text-anchor': 'middle', 'font-size': 14, fill: act ? c.superficie : c.texto, 'font-weight': act ? 700 : 400, text: t }, s);
        if (k < n - 1) {
          if (vertical) api.el('line', { x1: ancho / 2, x2: ancho / 2, y1: y + ch + 2, y2: y + ch + gap - 3, stroke: c.suave, 'stroke-width': 1.5, 'marker-end': 'url(#flecha-pasos)' }, s);
          else api.el('line', { x1: x + cw + 3, x2: x + cw + gap - 3, y1: y + ch / 2, y2: y + ch / 2, stroke: c.suave, 'stroke-width': 1.5, 'marker-end': 'url(#flecha-pasos)' }, s);
        }
      });
      return H('div', { class: 'pasos-cajas' }, s);
    }

    function dibujarTabla(t) {
      const res = new Set((t.resaltar || []).map(([a, b]) => a + ',' + b));
      const tabla = H('table', { class: 'pasos-tabla' });
      if (t.cabecera) tabla.append(H('thead', {}, H('tr', {}, t.cabecera.map(x => H('th', { html: enLinea(String(x)) })))));
      tabla.append(H('tbody', {}, (t.filas || []).map((f, a) => H('tr', {}, f.map((x, b) => H('td', { class: res.has(a + ',' + b) ? 'resaltada' : null, html: enLinea(String(x)) }))))));
      return H('div', { class: 'tabla-scroll' }, tabla);
    }

    function pintar() {
      const f = fotos[i];
      marco.innerHTML = '';
      marco.append(H('div', { class: 'pasos-texto', html: f.html !== undefined ? f.html : markdown(f.texto || '') }));
      if (f.cajas) marco.append(dibujarCajas(f));
      if (f.tabla) marco.append(dibujarTabla(f.tabla));
      contador.textContent = `Paso ${i + 1} de ${fotos.length}`;
      bAnt.disabled = i === 0;
      bSig.disabled = i === fotos.length - 1;
      dibujarProgreso();
      api.tex(marco);
    }
    function ir(k) {
      const nuevo = Math.max(0, Math.min(fotos.length - 1, k));
      if (nuevo === i && marco.childNodes.length) return;
      i = nuevo;
      pintar();
    }
    pintar();
    return { redibujar: pintar };
  }, {
    ejemplos: {
      '-': {
        fotogramas: [
          { texto: 'Queremos multiplicar $\\mathbf{A}\\mathbf{x}$ con $\\mathbf{A}$ de tamaño $2\\times 2$. Cada elemento del resultado sale de **una fila por la columna**.', cajas: ['fila de A', 'vector x', 'resultado'], activa: 0 },
          { texto: 'Primera fila: $1\\cdot 3 + 2\\cdot 1 = 5$.', tabla: { cabecera: ['', 'col 1', 'col 2', 'x'], filas: [['fila 1', 1, 2, 3], ['fila 2', 0, 4, 1]], resaltar: [[0, 1], [0, 2], [0, 3], [1, 3]] }, cajas: ['fila de A', 'vector x', 'resultado'], activa: 1 },
          { texto: 'Segunda fila: $0\\cdot 3 + 4\\cdot 1 = 4$. El resultado es $(5, 4)$.\n\n- Cada fila da **un** número.\n- El vector resultado tiene tantas componentes como filas tiene $\\mathbf{A}$.', cajas: ['fila de A', 'vector x', 'resultado'], activa: 2 },
        ],
      },
    },
  });
})();
