// Modo "ngramas" del motor texto: n-gramas de palabras con ventana deslizante y tabla de frecuencias.
// Si se carga suelto (p. ej. el banco de pruebas de motores) antes que texto.js, esperamos a que
// registre window.Texto en vez de asumir que ya existe.
(function () {
  'use strict';
  if (window.Texto) registrar(); else Motores.cargar('texto').then(registrar);
  function registrar() {
  Texto.modo('ngramas', function (el, p, api) {
    const H = api.html, num = api.num;
    const E = { texto: (p.textos && p.textos[0]) || 'el gato negro duerme sobre el sofá viejo cerca de la ventana', n: p.n || 2, pos: 0 };

    const entrada = H('div', { class: 'motor-fila' });
    const cinta = H('div', { class: 'motor-grafica' });
    const controles = H('div', { class: 'motor-controles' });
    const grafica = H('div', { class: 'motor-grafica' });
    const tabla = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    el.append(entrada, cinta, controles, grafica, tabla, lectura);
    entrada.append(Texto.textoEditable(api, E.texto, v => { E.texto = v; ajustarLimites(); dibujar(); }, 'Texto de ejemplo (editable)'));

    let sPos;
    const sN = api.slider({
      etiqueta: 'tamaño del n-grama (n)', min: 1, max: 4, paso: 1, valor: E.n,
      alCambiar: v => { E.n = v; ajustarLimites(); dibujar(); },
    });
    sPos = api.slider({ etiqueta: 'posición de la ventana', min: 0, max: 0, paso: 1, valor: 0, alCambiar: v => { E.pos = v; dibujar(); } });
    controles.append(sN, sPos,
      api.boton('Paso →', () => { const tope = sPos.input.max; E.pos = Math.min(+tope, E.pos + 1); sPos.valor = E.pos; dibujar(); }),
      api.boton('Reiniciar', () => { Motores.desmontar(el); Motores.montar(el, 'texto', JSON.parse(JSON.stringify(p))); }));

    function tokens() { return Texto.tokenizarPalabras(E.texto); }
    function ajustarLimites() {
      const toks = tokens();
      const nMax = Math.max(1, Math.min(4, toks.length - 1 || 1));
      if (E.n > nMax) E.n = nMax;
      sN.input.max = nMax; if (sN.valor > nMax) sN.valor = E.n;
      const posMax = Math.max(0, toks.length - E.n);
      sPos.input.max = posMax;
      if (E.pos > posMax) E.pos = posMax;
      sPos.valor = E.pos;
    }
    ajustarLimites();

    function dibujar() {
      const c = api.colores();
      const toks = tokens();
      if (toks.length < 2) { cinta.innerHTML = ''; grafica.innerHTML = ''; tabla.innerHTML = ''; lectura.innerHTML = '<p>Escribe un texto con al menos dos palabras.</p>'; return; }

      cinta.innerHTML = '';
      toks.forEach((t, i) => {
        const dentro = i >= E.pos && i < E.pos + E.n;
        cinta.append(H('span', {
          class: 'chip', style: `cursor:default;margin:.15rem${dentro ? `;background:color-mix(in srgb, ${c.acento} 20%, transparent);border-color:${c.acento};font-weight:650` : ''}`,
          text: t,
        }));
      });

      const nGramas = new Map();
      for (let i = 0; i <= toks.length - E.n; i++) {
        const g = toks.slice(i, i + E.n).join(' ');
        nGramas.set(g, (nGramas.get(g) || 0) + 1);
      }
      const filas = Array.from(nGramas.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 12);
      tabla.innerHTML = Texto.tablaHTML(['apariciones'], filas.map(([g, n]) => [g, n]));

      // ───── barras horizontales con los n-gramas más frecuentes ─────
      const top = filas.slice(0, 8);
      const maxCnt = Math.max(...top.map(f => f[1]), 1);
      const alturaFila = 24, alto = Math.max(50, top.length * alturaFila + 14), anchoEtiqueta = 150;
      const W = Math.max(320, Math.min(el.clientWidth || 640, 780));
      grafica.innerHTML = '';
      const s = api.svg(W, alto);
      s.setAttribute('role', 'img');
      grafica.append(s);
      const x0 = anchoEtiqueta, xMax = W - 36;
      top.forEach(([g, cnt], i) => {
        const y = 8 + i * alturaFila, w = cnt / maxCnt * (xMax - x0);
        api.el('text', { x: x0 - 8, y: y + 14, 'text-anchor': 'end', 'font-size': 12, fill: c.texto, text: g }, s);
        api.el('rect', { x: x0, y, width: Math.max(1, w), height: 15, fill: c.acento, 'fill-opacity': 0.75, rx: 3 }, s);
        api.el('text', { x: x0 + w + 6, y: y + 12, 'font-size': 11, fill: c.suave, text: cnt }, s);
      });
      s.setAttribute('aria-label', `Los ${top.length} n-gramas más frecuentes, de tamaño ${E.n}.`);

      const actual = toks.slice(E.pos, E.pos + E.n).join(' ');
      const distintos = nGramas.size, total = toks.length - E.n + 1;
      lectura.innerHTML = `<p>Ventana actual (n = ${E.n}, posición ${E.pos}): <strong>«${actual}»</strong>.</p>` +
        `<p>El texto tiene ${toks.length} palabras y genera ${total} n-gramas de tamaño ${E.n}, de los que ${distintos} son distintos${distintos < total ? ' (algunos se repiten)' : ''}.</p>` +
        (E.n === 1 ? '<p>Con n = 1 cada n-grama es una sola palabra: es la bolsa de palabras del modo bow-tfidf.</p>' : '<p>Al subir n, los n-gramas capturan más contexto pero se repiten menos.</p>');
    }
    dibujar();
    return { redibujar: dibujar };
  });
  }
})();
