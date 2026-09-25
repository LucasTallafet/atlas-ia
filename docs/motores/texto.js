// @modos: limpieza, tokenizacion, bow-tfidf, ngramas
// Motor "texto": preprocesado de texto en vivo. Infraestructura común (tokenización por palabras,
// lista de palabras vacías, escapado HTML, tabla y textarea editable) en window.Texto; limpieza y
// tokenizacion viven aquí. Los modos con corpus (bow-tfidf, ngramas) se cargan bajo demanda de
// motores/texto-<modo>.js, que debe llamar a Texto.modo('<modo>', fn).
(function () {
  'use strict';
  const MODOS = {};
  const BASE = document.currentScript ? document.currentScript.src.replace(/texto\.js(\?.*)?$/, '') : 'motores/';

  const STOPWORDS_ES = [
    'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para', 'con',
    'no', 'una', 'su', 'al', 'lo', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'o', 'este', 'sí',
    'porque', 'esta', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'también', 'me', 'hasta', 'hay',
    'donde', 'quien', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra',
    'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mí', 'antes', 'algunos', 'qué', 'unos',
    'yo', 'otro', 'otras', 'otra', 'él', 'tanto', 'esa', 'estos', 'mucho', 'quienes', 'nada',
    'muchos', 'cual', 'poco', 'ella', 'estar', 'estas', 'algunas', 'algo', 'nosotros', 'es', 'son',
    'fue', 'ser', 'está', 'están', 'era', 'eran',
  ];

  // Sufijos aproximados (stemming de juguete, no un algoritmo lingüístico real), de más a menos largos.
  const SUFIJOS = [
    'ándolos', 'ándolas', 'iéndolo', 'amente', 'izaciones', 'ización', 'imiento', 'amiento',
    'ándose', 'iéndose', 'ísimo', 'ísima', 'ciones', 'siones', 'mente', 'ables', 'ibles', 'ando',
    'iendo', 'adas', 'idas', 'ados', 'idos', 'able', 'ible', 'ador', 'ante', 'ción', 'sión',
    'oso', 'osa', 'ada', 'ida', 'ado', 'ido', 'ar', 'er', 'ir', 'es', 'os', 'as', 'a', 'e', 'o', 's',
  ];
  function raiz(palabra) {
    for (const suf of SUFIJOS) {
      if (palabra.length - suf.length >= 3 && palabra.endsWith(suf)) return palabra.slice(0, -suf.length);
    }
    return palabra;
  }

  const PASO = {
    minusculas: { etiqueta: 'minúsculas', fn: t => t.toLowerCase() },
    puntuacion: { etiqueta: 'sin puntuación', fn: t => t.replace(/[.,;:!?¿¡"'«»()[\]{}—–\-…/\\]/g, ' ') },
    numeros: { etiqueta: 'sin números', fn: t => t.replace(/\d+/g, ' ') },
    espacios: { etiqueta: 'espacios normalizados', fn: t => t.replace(/\s+/g, ' ').trim() },
    stopwords: { etiqueta: 'sin palabras vacías', fn: null },
    stemming: { etiqueta: 'raíz (stemming)', fn: t => t.split(/\s+/).filter(Boolean).map(raiz).join(' ') },
  };
  const ORDEN_PASOS = ['minusculas', 'puntuacion', 'numeros', 'espacios', 'stopwords', 'stemming'];

  function aplicarPaso(nombre, t, stop) {
    if (nombre === 'stopwords') {
      const set = new Set(stop.map(s => s.toLowerCase()));
      return t.split(/\s+/).filter(w => w && !set.has(w)).join(' ');
    }
    return PASO[nombre].fn(t);
  }

  function tokenizarPalabras(t) {
    const m = String(t).match(/[a-zA-ZÀ-ÿ0-9]+/g);
    return m ? m.map(w => w.toLowerCase()) : [];
  }
  function partirEspacios(t) {
    return String(t).trim().split(/\s+/).filter(Boolean);
  }
  function escapar(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function tablaHTML(cabeceras, filas) {
    const cab = cabeceras.map((c, i) => `<th scope="col">${escapar(c)}</th>`).join('');
    const cuerpo = filas.map(f => `<tr><th scope="row">${escapar(f[0])}</th>${f.slice(1).map(v => `<td>${v}</td>`).join('')}</tr>`).join('');
    return `<div class="tabla-scroll"><table class="motor-tabla"><thead><tr><th></th>${cab}</tr></thead><tbody>${cuerpo}</tbody></table></div>`;
  }
  function textoEditable(api, valor, alCambiar, etiqueta) {
    const ta = api.html('textarea', { class: 'motor-textarea', 'aria-label': etiqueta || 'Texto de ejemplo (editable)' });
    ta.value = valor;
    ta.addEventListener('input', () => alCambiar(ta.value));
    return ta;
  }

  // ───────────────────────── limpieza ─────────────────────────
  MODOS.limpieza = function (el, p, api) {
    const H = api.html;
    const stop = (p.stopwords && p.stopwords.length) ? p.stopwords : STOPWORDS_ES;
    const orden = (p.pasos && p.pasos.length) ? p.pasos.filter(x => PASO[x]) : ORDEN_PASOS;
    if (!orden.length) throw new Error('limpieza necesita al menos un paso válido en "pasos"');
    const E = {
      texto: (p.textos && p.textos[0]) || '¡Los 7 gatos corrían rápidamente!! ¿No es asombroso?',
      activos: new Set(orden),
    };

    const entrada = H('div', { class: 'motor-fila' });
    const grupo = H('div', { class: 'motor-selector', role: 'group', 'aria-label': 'Pasos de limpieza activos' });
    const grafica = H('div', { class: 'motor-grafica' });
    const etapas = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(entrada, controles, grafica, etapas, lectura);
    entrada.append(textoEditable(api, E.texto, v => { E.texto = v; dibujar(); }));
    orden.forEach(nombre => {
      const b = api.boton(PASO[nombre].etiqueta, () => {
        if (E.activos.has(nombre)) E.activos.delete(nombre); else E.activos.add(nombre);
        b.setAttribute('aria-pressed', String(E.activos.has(nombre)));
        dibujar();
      });
      b.setAttribute('aria-pressed', String(E.activos.has(nombre)));
      grupo.append(b);
    });
    controles.append(grupo, api.boton('Reiniciar', () => { Motores.desmontar(el); Motores.montar(el, 'texto', JSON.parse(JSON.stringify(p))); }));

    function dibujar() {
      let actual = E.texto;
      const etapasTxt = [['original', E.texto]];
      orden.forEach(nombre => {
        if (!E.activos.has(nombre)) return;
        actual = aplicarPaso(nombre, actual, stop);
        etapasTxt.push([PASO[nombre].etiqueta, actual]);
      });
      const filas = etapasTxt.map(([et, txt]) => [et, escapar(txt) || '<span style="opacity:.6">(vacío)</span>']);
      etapas.innerHTML = `<div class="tabla-scroll"><table class="motor-tabla"><tbody>${
        filas.map(f => `<tr><th scope="row">${escapar(f[0])}</th><td style="text-align:left">${f[1]}</td></tr>`).join('')
      }</tbody></table></div>`;

      grafica.innerHTML = '';
      const c = api.colores();
      const valoresBarra = etapasTxt.map(([, txt]) => partirEspacios(txt).length);
      const Wb = Math.max(280, Math.min(el.clientWidth || 520, 640));
      const filaAltoB = 26, Lb = 130, altoB = etapasTxt.length * filaAltoB + 8;
      const sb = api.svg(Wb, altoB);
      const Xb = api.escala(0, Math.max(1, Math.max(...valoresBarra)), Lb, Wb - 8);
      etapasTxt.forEach(([et], i) => {
        const y = i * filaAltoB + 4;
        api.el('text', { x: Lb - 8, y: y + filaAltoB - 11, 'text-anchor': 'end', 'font-size': 11, fill: c.texto, text: et }, sb);
        api.el('rect', { x: Lb, y, width: Math.max(1, Xb(valoresBarra[i]) - Lb), height: filaAltoB - 8, fill: c.acento }, sb);
        api.el('text', { x: Xb(valoresBarra[i]) + 6, y: y + filaAltoB - 11, 'font-size': 11, fill: c.suave, text: String(valoresBarra[i]) }, sb);
      });
      grafica.append(sb);

      const tokOrig = valoresBarra[0];
      const tokFinal = valoresBarra[valoresBarra.length - 1];
      const activosTxt = orden.filter(n => E.activos.has(n)).map(n => PASO[n].etiqueta).join(' → ') || 'ninguno';
      lectura.innerHTML = `<p>El texto original tiene <strong>${tokOrig}</strong> palabras (separadas por espacios); tras los pasos activos quedan <strong>${tokFinal}</strong>.</p>` +
        `<p>Cada paso activo se aplica sobre el resultado del anterior, en este orden: ${activosTxt}.</p>`;
    }
    dibujar();
    return { redibujar: dibujar };
  };

  // ───────────────────────── tokenizacion ─────────────────────────
  MODOS.tokenizacion = function (el, p, api) {
    const H = api.html;
    const E = { texto: (p.textos && p.textos[0]) || 'El Dr. Pérez, de 42 años, dijo: "¡no me lo puedo creer!"' };

    const entrada = H('div', { class: 'motor-fila' });
    const grafica = H('div', { class: 'motor-grafica' });
    const columnas = H('div', { class: 'motor-fila' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(entrada, grafica, columnas, lectura, controles);
    entrada.append(textoEditable(api, E.texto, v => { E.texto = v; dibujar(); }));
    controles.append(api.boton('Reiniciar', () => { Motores.desmontar(el); Motores.montar(el, 'texto', JSON.parse(JSON.stringify(p))); }));

    function columna(titulo, tokens) {
      const cont = H('div', { class: 'motor-grafica', style: 'flex:1 1 16rem' });
      cont.append(H('p', {}, H('strong', { text: titulo })));
      const lista = H('div');
      tokens.forEach(t => lista.append(H('span', { class: 'chip', style: 'cursor:default;margin:.15rem', text: t })));
      cont.append(lista);
      return cont;
    }

    function dibujar() {
      const porEspacios = partirEspacios(E.texto);
      const porPalabras = tokenizarPalabras(E.texto);
      const vocabEspacios = new Set(porEspacios.map(w => w.toLowerCase()));
      const vocabPalabras = new Set(porPalabras);

      grafica.innerHTML = '';
      const c = api.colores();
      const datos = [
        ['tokens (espacios)', porEspacios.length],
        ['vocabulario (espacios)', vocabEspacios.size],
        ['tokens (palabras)', porPalabras.length],
        ['vocabulario (palabras)', vocabPalabras.size],
      ];
      const Wb = Math.max(280, Math.min(el.clientWidth || 520, 640));
      const filaAltoB = 26, Lb = 150, altoB = datos.length * filaAltoB + 8;
      const sb = api.svg(Wb, altoB);
      const Xb = api.escala(0, Math.max(1, Math.max(...datos.map(d => d[1]))), Lb, Wb - 8);
      datos.forEach(([et, val], i) => {
        const y = i * filaAltoB + 4;
        api.el('text', { x: Lb - 8, y: y + filaAltoB - 11, 'text-anchor': 'end', 'font-size': 11, fill: c.texto, text: et }, sb);
        api.el('rect', { x: Lb, y, width: Math.max(1, Xb(val) - Lb), height: filaAltoB - 8, fill: c.acento }, sb);
        api.el('text', { x: Xb(val) + 6, y: y + filaAltoB - 11, 'font-size': 11, fill: c.suave, text: String(val) }, sb);
      });
      grafica.append(sb);

      columnas.innerHTML = '';
      columnas.append(
        columna(`Por espacios: ${porEspacios.length} tokens, vocabulario ${vocabEspacios.size}`, porEspacios),
        columna(`Por palabras: ${porPalabras.length} tokens, vocabulario ${vocabPalabras.size}`, porPalabras),
      );
      const conPuntuacion = porEspacios.filter(w => /[.,;:!?¿¡"«»()]/.test(w));
      const ejemplo = conPuntuacion[0];
      lectura.innerHTML = `<p>Separar solo por espacios en blanco deja signos de puntuación pegados a las palabras` +
        (ejemplo ? ` (p. ej. «${escapar(ejemplo)}»)` : '') +
        `: ${conPuntuacion.length} de ${porEspacios.length} tokens los arrastran. Por eso su vocabulario (${vocabEspacios.size}) suele ser mayor que el de un tokenizador por palabras (${vocabPalabras.size}), que solo captura secuencias de letras y dígitos y pasa todo a minúsculas.</p>` +
        `<p>Cambia el texto para ver cómo varían ambos recuentos.</p>`;
    }
    dibujar();
    return { redibujar: dibujar };
  };

  // ───────────── Registro y carga de los modos en archivo aparte ─────────────
  Motores.registrar('texto', function (el, p, api) {
    if (!p.textos || !p.textos.length) throw new Error('texto necesita "textos"');
    if (MODOS[p.modo]) return MODOS[p.modo](el, p, api);
    let inst = null;
    const s = document.createElement('script');
    s.src = BASE + 'texto-' + encodeURIComponent(p.modo) + '.js';
    const fallo = (e) => { console.error('[motor texto]', e); el.innerHTML = ''; el.append(api.html('p', { class: 'motor-error', role: 'alert', text: 'El interactivo no se pudo cargar.' })); };
    s.onload = () => { try { if (!MODOS[p.modo]) throw new Error(`Modo "${p.modo}" no registrado`); inst = MODOS[p.modo](el, p, api); } catch (e) { fallo(e); } };
    s.onerror = () => fallo(new Error(`No se pudo cargar texto-${p.modo}.js`));
    document.head.appendChild(s);
    return { redibujar: () => inst && inst.redibujar && inst.redibujar(), destruir: () => inst && inst.destruir && inst.destruir() };
  }, {
    ejemplos: {
      limpieza: { modo: 'limpieza', textos: ['¡Los 7 gatos corrían rápidamente!! ¿No es asombroso?'], pasos: ['minusculas', 'puntuacion', 'numeros', 'espacios', 'stopwords', 'stemming'] },
      tokenizacion: { modo: 'tokenizacion', textos: ['El Dr. Pérez, de 42 años, dijo: "¡no me lo puedo creer!"'] },
      'bow-tfidf': { modo: 'bow-tfidf', textos: ['el gato duerme en el sofá', 'el perro juega con la pelota', 'el gato y el perro duermen juntos'] },
      ngramas: { modo: 'ngramas', textos: ['el gato negro duerme sobre el sofá viejo'], n: 2 },
    },
  });

  window.Texto = { modo: (nombre, fn) => { MODOS[nombre] = fn; }, STOPWORDS_ES, tokenizarPalabras, partirEspacios, escapar, tablaHTML, textoEditable };
})();
