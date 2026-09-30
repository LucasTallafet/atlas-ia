// Modo "bow-tfidf" del motor texto: bolsa de palabras y TF-IDF sobre un pequeño corpus editable.
// Si se carga suelto (p. ej. el banco de pruebas de motores) antes que texto.js, esperamos a que
// registre window.Texto en vez de asumir que ya existe.
(function () {
  'use strict';
  if (window.Texto) registrar(); else Motores.cargar('texto').then(registrar);
  function registrar() {
  Texto.modo('bow-tfidf', function (el, p, api) {
    const H = api.html, num = api.num;
    if (!p.textos.length) throw new Error('bow-tfidf necesita al menos un texto en "textos"');
    const E = {
      textos: p.textos.slice(),
      stop: (p.stopwords && p.stopwords.length) ? p.stopwords : Texto.STOPWORDS_ES,
      quitarStop: true,
      doc: 0,
      metrica: 'tfidf',
    };

    const docs = H('div', { class: 'motor-fila', style: 'align-items:flex-start' });
    const opciones = H('div', { class: 'motor-controles' });
    const grafica = H('div', { class: 'motor-grafica' });
    const tabla = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const Z = api.zonas(el);
    Z.grafico.append(docs, grafica, tabla, lectura);
    Z.controles.append(opciones);

    const areas = E.textos.map((t, i) => {
      const cont = H('div', { style: 'flex:1 1 12rem;min-width:10rem' });
      cont.append(H('p', { style: 'margin:.1rem 0;font-size:.82rem;color:var(--texto-suave)', text: `documento ${i + 1}` }));
      const ta = Texto.textoEditable(api, t, v => { E.textos[i] = v; dibujar(); }, `Documento ${i + 1} (editable)`);
      cont.append(ta);
      return cont;
    });
    docs.append(...areas);

    const grupoDoc = H('div', { class: 'motor-selector', role: 'group', 'aria-label': 'Documento a inspeccionar' });
    const botsDoc = E.textos.map((_, i) => api.boton('doc. ' + (i + 1), () => { E.doc = i; marcarDoc(); dibujar(); }));
    grupoDoc.append(...botsDoc);
    function marcarDoc() { botsDoc.forEach((b, i) => b.setAttribute('aria-pressed', String(i === E.doc))); }
    marcarDoc();

    const grupoMetrica = H('div', { class: 'motor-selector', role: 'group', 'aria-label': 'Métrica de la tabla' });
    const bConteo = api.boton('conteo (BoW)', () => { E.metrica = 'conteo'; marcarMetrica(); dibujar(); });
    const bTfidf = api.boton('TF-IDF', () => { E.metrica = 'tfidf'; marcarMetrica(); dibujar(); });
    grupoMetrica.append(bConteo, bTfidf);
    function marcarMetrica() { bConteo.setAttribute('aria-pressed', String(E.metrica === 'conteo')); bTfidf.setAttribute('aria-pressed', String(E.metrica === 'tfidf')); }
    marcarMetrica();

    const bStop = api.boton('quitar palabras vacías', () => { E.quitarStop = !E.quitarStop; bStop.setAttribute('aria-pressed', String(E.quitarStop)); dibujar(); });
    bStop.setAttribute('aria-pressed', String(E.quitarStop));

    opciones.append(grupoDoc, grupoMetrica, bStop, api.boton('Reiniciar', () => { Motores.desmontar(el); Motores.montar(el, 'texto', JSON.parse(JSON.stringify(p))); }));

    function calcular() {
      const stopSet = new Set(E.stop.map(s => s.toLowerCase()));
      const tokensPorDoc = E.textos.map(t => {
        let toks = Texto.tokenizarPalabras(t);
        if (E.quitarStop) toks = toks.filter(w => !stopSet.has(w));
        return toks;
      });
      const N = E.textos.length;
      const conteos = tokensPorDoc.map(toks => {
        const m = new Map();
        toks.forEach(t => m.set(t, (m.get(t) || 0) + 1));
        return m;
      });
      const vocab = Array.from(new Set(tokensPorDoc.flat())).sort();
      const df = new Map(vocab.map(t => [t, conteos.filter(m => m.has(t)).length]));
      const idf = new Map(vocab.map(t => [t, Math.log(N / df.get(t))]));
      return { tokensPorDoc, conteos, vocab, df, idf, N };
    }

    function dibujar() {
      const c = api.colores();
      const { conteos, vocab, df, idf } = calcular();
      const cDoc = conteos[E.doc];
      const filas = vocab
        .filter(t => cDoc.has(t))
        .map(t => ({ t, conteo: cDoc.get(t), tfidf: cDoc.get(t) * idf.get(t) }))
        .sort((a, b) => (E.metrica === 'conteo' ? b.conteo - a.conteo : b.tfidf - a.tfidf) || a.t.localeCompare(b.t));

      // ───── barras horizontales con los términos más relevantes ─────
      const top = filas.slice(0, 8);
      const valor = f => (E.metrica === 'conteo' ? f.conteo : f.tfidf);
      grafica.innerHTML = '';
      const s = Texto.graficoBarras(api, c, grafica, top.map(f => [f.t, valor(f), num(valor(f), E.metrica === 'conteo' ? 0 : 3)]));
      s.setAttribute('role', 'img');
      grafica.append(s);
      s.setAttribute('aria-label', `Términos más relevantes del documento ${E.doc + 1} según ${E.metrica === 'conteo' ? 'su conteo' : 'TF-IDF'}.`);

      // ───── tabla completa ─────
      tabla.innerHTML = Texto.tablaHTML(['conteo', 'docs. que lo tienen', 'idf', 'tf-idf'],
        filas.map(f => [f.t, f.conteo, df.get(f.t), num(idf.get(f.t), 3), num(f.tfidf, 3)]));

      const N = E.textos.length;
      const ejemploComun = filas.find(f => df.get(f.t) === N);
      const ejemploRaro = filas.find(f => df.get(f.t) === 1) || filas[0];
      lectura.innerHTML = `<p>Vocabulario de ${vocab.length} términos en ${N} documentos. idf(t) = ln(N / df(t)): cuanto en más documentos aparece un término, menor es su idf.</p>` +
        (ejemploComun ? `<p>«${escaparSeguro(ejemploComun.t)}» aparece en los ${N} documentos → idf = ${num(idf.get(ejemploComun.t), 3)}, así que su TF-IDF ${idf.get(ejemploComun.t) < 1e-9 ? 'se anula aunque se repita mucho' : 'queda muy rebajado'}.</p>` : '') +
        (ejemploRaro && ejemploRaro !== ejemploComun ? `<p>«${escaparSeguro(ejemploRaro.t)}» solo aparece en 1 documento → idf alto (${num(idf.get(ejemploRaro.t), 3)}), lo que lo hace destacar como distintivo de ese documento.</p>` : '');
    }
    function escaparSeguro(t) { return Texto.escapar(t); }
    dibujar();
    return { redibujar: dibujar };
  });
  }
})();
