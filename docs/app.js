// Atlas de IA · aplicación: enrutado por hash, vistas, progreso y buscador (ESPEC-WEB.md §4-§6).
(function () {
  'use strict';
  const I = window.INDICE || { conceptos: [], bloques: {}, orden: [], lotes: {}, glosario: {} };
  const C = {};
  I.conceptos.forEach(c => { C[c.id] = c; });
  const POS = {};
  I.orden.forEach((id, k) => { POS[id] = k; });
  const api = window.Motores ? Motores.api : null;
  const vista = document.getElementById('vista');
  const h = api ? api.html : null;
  const TIPOS = { fusion: 'Fusión de apuntes', 'original+ampliacion': 'Con ampliación', ampliacion: 'Ampliación', original: 'Del curso' };
  const ESTADOS = { pendiente: 'Pendiente de escribir', escrita: 'Escrita', vista: 'Vista', dominada: 'Dominada ✓' };
  const RUTAS = [
    { nombre: 'De las matemáticas a las redes neuronales', destino: 'backpropagation' },
    { nombre: 'ML clásico de punta a punta', destino: 'boosting' },
    { nombre: 'Del texto a los LLM', destino: 'rag' },
    { nombre: 'Aprendizaje por refuerzo', destino: 'actor-critico' },
    { nombre: 'Del modelo a producción', destino: 'monitorizacion-drift' },
  ].filter(r => C[r.destino]);

  // ───────────── Almacenamiento (siempre en try/catch) ─────────────
  const CLAVE = 'atlas-ia-v1';
  function leerProgreso() {
    try {
      const d = JSON.parse(localStorage.getItem(CLAVE) || '{}') || {};
      return normalizar(d);
    } catch (e) { return normalizar({}); }
  }
  function normalizar(d) {
    const fb = Array.isArray(d.filtroBloques) ? d.filtroBloques.filter(b => I.bloques[b]) : [];
    return { fichas: d.fichas || {}, leitner: d.leitner || {}, ultima: d.ultima || null, ultimaRuta: d.ultimaRuta || null, filtroBloques: fb.length ? fb : null };
  }
  let prog = leerProgreso();
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(prog)); } catch (e) { /* sin almacenamiento */ } }
  function pref(clave, valor) {
    try {
      if (valor === undefined) return localStorage.getItem(clave);
      if (valor === null) localStorage.removeItem(clave); else localStorage.setItem(clave, valor);
    } catch (e) { return null; }
    return valor;
  }
  const dominada = (id) => !!(prog.fichas[id] && prog.fichas[id].dominada);
  const vistaF = (id) => !!(prog.fichas[id] && prog.fichas[id].vista);
  function estado(id) {
    if (dominada(id)) return 'dominada';
    if (vistaF(id) && C[id] && C[id].escrita) return 'vista';
    return C[id] && C[id].escrita ? 'escrita' : 'pendiente';
  }

  // ───────────── Utilidades ─────────────
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const sinHtml = (s) => { const d = document.createElement('div'); d.innerHTML = s || ''; return d.textContent; };
  const colorBloque = (b) => `--c: var(--${b})`;
  const tex = (el) => (api ? api.tex(el) : Promise.resolve());
  const reducido = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function enlace(id, texto) {
    const c = C[id];
    return h('a', { href: '#' + id, class: 'xref', 'data-id': id }, texto || (c ? c.nombre : id));
  }
  const cargasBloque = {};
  function cargarBloque(b) {
    if (!cargasBloque[b]) {
      cargasBloque[b] = new Promise((ok) => {
        const s = document.createElement('script');
        s.src = `datos/${b}.js`;
        s.onload = () => ok();
        s.onerror = () => { console.warn('No se pudo cargar datos/' + b + '.js'); ok(); };
        document.head.appendChild(s);
      });
    }
    return cargasBloque[b];
  }
  const ficha = (id) => (window.FICHAS || {})[id];
  function rutaHacia(destino) {
    const out = [], visto = new Set();
    (function visitar(id) {
      if (visto.has(id) || !C[id]) return;
      visto.add(id);
      C[id].prerequisitos.slice().sort((a, b) => POS[a] - POS[b]).forEach(visitar);
      out.push(id);
    })(destino);
    return out;
  }
  function recomendado(excluir) {
    const libre = (id) => id !== excluir && C[id] && C[id].escrita && !dominada(id);
    return I.orden.find(id => libre(id) && C[id].prerequisitos.every(dominada)) || I.orden.find(libre) || null;
  }
  function hoy() { return new Date().toISOString().slice(0, 10); }
  function barajar(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function copiar(texto) {
    const plan = () => {
      const t = h('textarea', {}, texto);
      t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.append(t); t.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      t.remove();
      return ok;
    };
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(texto).then(() => true, plan);
    return Promise.resolve(plan());
  }

  // ───────────── Tema ─────────────
  const mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : { matches: false, addEventListener() {} };
  function aplicarTema(t) {
    const raiz = document.documentElement;
    if (t === 'claro' || t === 'oscuro') { raiz.dataset.tema = t; pref('atlas-ia-tema', t); } else { delete raiz.dataset.tema; pref('atlas-ia-tema', null); }
    raiz.dataset.temaEfectivo = raiz.dataset.tema || (mq.matches ? 'oscuro' : 'claro');
    document.dispatchEvent(new CustomEvent('tema'));
  }
  document.documentElement.dataset.temaEfectivo = document.documentElement.dataset.tema || (mq.matches ? 'oscuro' : 'claro');
  if (mq.addEventListener) mq.addEventListener('change', () => { if (!document.documentElement.dataset.tema) aplicarTema('auto'); });
  document.getElementById('boton-tema').addEventListener('click', () => aplicarTema(document.documentElement.dataset.temaEfectivo === 'oscuro' ? 'claro' : 'oscuro'));

  // ───────────── Enrutado ─────────────
  const VISTAS = { inicio: vistaInicio, mapa: vistaMapa, glosario: vistaGlosario, rutas: vistaRutas, repaso: vistaRepaso };
  let objetivoRuta = null, primera = true, turno = 0;
  async function enrutar() {
    const clave = decodeURIComponent(location.hash.slice(1)) || 'inicio';
    const mio = ++turno;
    delete document.body.dataset.listo;
    ocultarPrevia();
    if (window.Motores) Motores.desmontar(vista);
    vista.innerHTML = '';
    document.querySelectorAll('.nav a').forEach(a => { if (a.getAttribute('href') === '#' + clave) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    window.scrollTo(0, 0);
    if (!primera) vista.focus({ preventScroll: true });
    primera = false;
    try {
      if (VISTAS[clave]) await VISTAS[clave]();
      else if (C[clave]) await vistaFicha(clave);
      else vistaNoEncontrada(clave);
      await tex(vista);
    } catch (e) {
      console.error(e);
      vista.append(h('p', { class: 'motor-error', text: 'Algo falló al mostrar esta página.' }));
    }
    if (mio === turno) document.body.dataset.listo = clave;
  }
  window.addEventListener('hashchange', enrutar);

  function vistaNoEncontrada(clave) {
    document.title = 'No encontrado · Atlas de IA';
    vista.append(h('div', { class: 'estrecho' }, h('h1', { text: 'No encontrado' }),
      h('p', {}, `No hay ninguna página llamada «${clave}». `, h('a', { href: '#mapa' }, 'Ve al mapa de conceptos'), ' o usa el buscador.')));
  }

  // ───────────── Inicio ─────────────
  function vistaInicio() {
    document.title = 'Atlas de IA';
    const n = I.conceptos.length;
    const escritas = I.conceptos.filter(c => c.escrita).length;
    const vistas = I.conceptos.filter(c => vistaF(c.id)).length;
    const doms = I.conceptos.filter(c => dominada(c.id)).length;
    const cont = h('div');
    cont.append(h('h1', { text: 'Atlas de IA' }),
      h('p', { class: 'estrecho suave' }, `${n} conceptos de inteligencia artificial en ${Object.keys(I.bloques).length} bloques, de las matemáticas a la producción. Cada concepto tiene una sola ficha, enlazada con sus requisitos.`),
      h('div', { class: 'cifras' },
        h('div', { class: 'cifra' }, h('b', { text: String(escritas) }), h('span', { text: `fichas escritas de ${n}` })),
        h('div', { class: 'cifra' }, h('b', { text: String(vistas) }), h('span', { text: 'fichas vistas' })),
        h('div', { class: 'cifra' }, h('b', { text: String(doms) }), h('span', { text: 'fichas dominadas' }))));

    const tarjetas = h('div', { class: 'rejilla-tarjetas' });
    const ultima = prog.ultima && C[prog.ultima] ? prog.ultima : null;
    const rec = recomendado(ultima);
    if (ultima) {
      tarjetas.append(h('div', { class: 'tarjeta continuar' }, h('h2', { class: 'suave', style: 'font-size:.85rem;margin:0 0 .3rem', text: 'Continúa donde lo dejaste' }),
        h('p', { style: 'margin:0 0 .3rem;font-weight:650' }, enlace(ultima)), C[ultima].frase ? h('p', { class: 'suave', style: 'font-size:.9rem;margin:0', html: C[ultima].frase }) : null));
    }
    if (rec) {
      tarjetas.append(h('div', { class: 'tarjeta continuar' }, h('h2', { class: 'suave', style: 'font-size:.85rem;margin:0 0 .3rem', text: ultima ? 'Siguiente recomendado' : 'Empieza por aquí' }),
        h('p', { style: 'margin:0 0 .3rem;font-weight:650' }, enlace(rec)), C[rec].frase ? h('p', { class: 'suave', style: 'font-size:.9rem;margin:0', html: C[rec].frase }) : null));
    }
    tarjetas.append(h('div', { class: 'tarjeta' }, h('h2', { style: 'font-size:1rem;margin:0 0 .4rem', text: 'Explora' }),
      h('ul', { style: 'margin:0;padding-left:1.1rem' },
        h('li', {}, h('a', { href: '#mapa' }, 'Mapa de conceptos'), ' · todo el temario y sus dependencias'),
        h('li', {}, h('a', { href: '#repaso' }, 'Repaso espaciado'), ' · preguntas de las fichas que has visto'),
        h('li', {}, h('a', { href: '#glosario' }, 'Glosario'), ' · términos de la A a la Z'))));
    cont.append(tarjetas);

    cont.append(h('h2', { text: 'Progreso por bloque' }));
    const bp = h('div', { class: 'bloques-progreso' });
    Object.entries(I.bloques).forEach(([b, nombre]) => {
      const cs = I.conceptos.filter(c => c.bloque === b), tot = cs.length || 1;
      const d = cs.filter(c => dominada(c.id)).length, v = cs.filter(c => vistaF(c.id) && !dominada(c.id)).length, e = cs.filter(c => c.escrita).length;
      bp.append(h('div', { class: 'bloque-progreso', style: colorBloque(b) },
        h('span', {}, h('span', { class: 'punto-bloque' }), `${b} · ${nombre}`),
        h('div', { class: 'barra', role: 'img', 'aria-label': `${d} dominadas y ${v} vistas de ${tot}` }, h('i', { style: `width:${100 * d / tot}%` }), h('i', { class: 'vista', style: `width:${100 * v / tot}%` })),
        h('span', { class: 'suave', style: 'font-size:.85rem', text: `${d + v}/${tot} · ${e} ${e === 1 ? 'escrita' : 'escritas'}` })));
    });
    cont.append(bp);

    cont.append(h('h2', { text: 'Rutas sugeridas' }));
    const rr = h('div', { class: 'rejilla-tarjetas' });
    RUTAS.forEach(r => {
      const pasos = rutaHacia(r.destino), d = pasos.filter(dominada).length;
      rr.append(h('div', { class: 'tarjeta ruta-tarjeta' }, h('h3', { style: 'font-size:1rem', text: r.nombre }),
        h('p', { class: 'suave', style: 'font-size:.88rem' }, `${pasos.length} conceptos hasta `, enlace(r.destino), `. Dominados: ${d}.`),
        h('div', { class: 'barra' }, h('i', { style: `width:${100 * d / pasos.length}%` })),
        h('p', { style: 'margin:.6rem 0 0' }, h('a', { href: '#rutas', onclick: () => { objetivoRuta = r.destino; } }, 'Ver la ruta →'))));
    });
    cont.append(rr);
    cont.append(ajustes());
    vista.append(cont);
  }

  function ajustes() {
    const actual = pref('atlas-ia-tema') || 'auto';
    const grupo = h('div', { class: 'fila-botones', role: 'group', 'aria-label': 'Tema' });
    [['auto', 'Automático'], ['claro', 'Claro'], ['oscuro', 'Oscuro']].forEach(([v, t]) => {
      const b = api.boton(t, () => { aplicarTema(v); grupo.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); });
      b.setAttribute('aria-pressed', String(v === actual));
      grupo.append(b);
    });
    const area = h('textarea', { id: 'progreso-json', 'aria-label': 'Progreso en formato JSON', placeholder: 'Pega aquí un progreso exportado y pulsa «Importar».' });
    const msg = h('p', { class: 'suave', 'aria-live': 'polite', style: 'margin:0;font-size:.9rem' });
    const exportar = api.boton('Exportar progreso', () => {
      const t = JSON.stringify(prog);
      area.value = t;
      copiar(t).then(ok => { msg.textContent = ok ? 'Copiado al portapapeles (también está en el cuadro).' : 'Cópialo desde el cuadro de texto.'; });
    });
    const importar = api.boton('Importar', () => {
      try {
        const d = JSON.parse(area.value);
        if (!d || typeof d !== 'object' || typeof d.fichas !== 'object') throw new Error('formato');
        prog = normalizar(d);
        guardar();
        msg.textContent = 'Progreso importado.';
      } catch (e) { msg.textContent = 'Ese texto no es un progreso válido.'; }
    });
    const borrar = api.boton('Borrar progreso', () => {
      if (window.confirm('¿Borrar todo el progreso guardado en este navegador?')) { prog = normalizar({}); guardar(); enrutar(); }
    });
    return h('section', { class: 'tarjeta ajustes', style: 'margin-top:2rem', 'aria-labelledby': 'ajustes-t' },
      h('h2', { id: 'ajustes-t', style: 'margin:0', text: 'Ajustes' }),
      h('div', {}, h('p', { style: 'margin:0 0 .3rem;font-weight:600', text: 'Tema' }), grupo),
      h('div', {}, h('p', { style: 'margin:0 0 .3rem;font-weight:600', text: 'Progreso' }), h('div', { class: 'fila-botones' }, exportar, importar, borrar)),
      area, msg);
  }

  // ───────────── Mapa ─────────────
  let forzarConstelacion = false, mapaActual = null;
  const CORTO = { B1: 'Matemáticas', B2: 'Fundamentos', B3: 'ML clásico', B4: 'Deep Learning', B5: 'Refuerzo', B6: 'NLP y LLMs', B7: 'Simbólico', B8: 'Producción' };
  const CONREV = {};
  I.conceptos.forEach(c => c.conexiones.concat(c.desambiguacion).forEach(x => { (CONREV[x.id] = CONREV[x.id] || []).push(c.id); }));
  // Relaciones de un concepto: requisitos y lo que desbloquea con su distancia (BFS), y conexiones/desambiguaciones en los dos sentidos.
  // `opacidad` da la intensidad del resaltado: más fuerte cuanto más cerca; 0 si no está relacionado.
  function relaciones(id) {
    const dist = (sig) => {
      const m = new Map();
      let frente = [id], d = 0;
      while (frente.length) {
        d++;
        const nuevo = [];
        frente.forEach(x => sig(x).forEach(y => { if (C[y] && y !== id && !m.has(y)) { m.set(y, d); nuevo.push(y); } }));
        frente = nuevo;
      }
      return m;
    };
    const anc = dist(x => C[x].prerequisitos), des = dist(x => C[x].desbloquea);
    const con = new Set(C[id].conexiones.concat(C[id].desambiguacion).map(x => x.id).concat(CONREV[id] || []).filter(x => C[x] && x !== id));
    const opacidad = (x) => x === id ? 1
      : anc.has(x) ? Math.max(0.35, 1 - 0.2 * (anc.get(x) - 1))
      : des.has(x) ? (des.get(x) === 1 ? 1 : Math.max(0.3, 0.6 - 0.1 * (des.get(x) - 2)))
      : con.has(x) ? 1 : 0;
    return { anc, des, con, opacidad };
  }
  const ctxMapa = () => ({ I, C, POS, estado, dominada, api, ESTADOS, relaciones });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mapaActual && !(e.target.closest && e.target.closest('.buscador'))) mapaActual.elegir(null);
  });

  function vistaMapa() {
    document.title = 'Mapa · Atlas de IA';
    let modo = forzarConstelacion ? 'constelacion' : (pref('atlas-ia-mapa') || (window.innerWidth < 700 ? 'bloques' : 'constelacion'));
    if (!window.AtlasMapa) modo = 'bloques';
    forzarConstelacion = false;
    const bC = h('button', { type: 'button' }, 'Constelación');
    const bB = h('button', { type: 'button' }, 'Por bloques');
    const cuerpo = h('div', { class: 'mapa-lienzo' });
    const panel = h('aside', { class: 'mapa-panel', 'aria-label': 'Detalle del concepto', hidden: true });
    const zona = h('div', { class: 'mapa-zona' }, cuerpo, panel);
    const todos = Object.keys(I.bloques);
    let sel = null, ctl = null, turnoPanel = 0;
    const filtro = () => (prog.filtroBloques ? new Set(prog.filtroBloques) : null);
    function elegir(id, opc) {
      sel = id && C[id] ? id : null;
      // Ir a un concepto de un bloque filtrado (desde el panel o el buscador) añade su bloque al filtro.
      if (sel && opc && opc.centrar && prog.filtroBloques && !prog.filtroBloques.includes(C[sel].bloque)) ponFiltro(prog.filtroBloques.concat(C[sel].bloque));
      if (ctl) ctl.marcar(sel, { centrar: opc && opc.centrar });
      pintarPanel();
    }
    const abrir = (id) => { location.hash = '#' + id; };
    mapaActual = { elegir };

    // Filtro por bloques (se recuerda en progreso.filtroBloques; null = todos).
    const chips = h('div', { class: 'chips-bloques', role: 'group', 'aria-label': 'Filtrar por bloque. Mayús o Ctrl más clic añade o quita bloques' });
    const pintarChips = () => chips.querySelectorAll('.chip').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.b ? !!prog.filtroBloques && prog.filtroBloques.includes(b.dataset.b) : !prog.filtroBloques)));
    function ponFiltro(lista) {
      prog.filtroBloques = lista && lista.length && lista.length < todos.length ? todos.filter(b => lista.includes(b)) : null;
      guardar();
      pintarChips();
      if (ctl) ctl.filtro(filtro());
    }
    chips.append(h('button', { type: 'button', class: 'chip chip-todos', onclick: () => ponFiltro(null) }, 'Todos'),
      ...todos.map(b => h('button', {
        type: 'button', class: 'chip', 'data-b': b, style: colorBloque(b), title: `${b} · ${I.bloques[b]} (Mayús o Ctrl + clic para combinar)`,
        onclick: (e) => {
          const act = prog.filtroBloques || [];
          if (e.shiftKey || e.ctrlKey || e.metaKey) ponFiltro(act.includes(b) ? act.filter(x => x !== b) : act.concat(b));
          else ponFiltro(act.length === 1 && act[0] === b ? null : [b]);
        },
      }, h('span', { class: 'punto-bloque' }), CORTO[b] || I.bloques[b])));
    pintarChips();
    const leyendaRel = h('div', { class: 'leyenda-rel' },
      h('span', {}, h('i', { class: 'lr-req' }), 'requisitos (más intenso = más cercano)'),
      h('span', {}, h('i', { class: 'lr-des' }), 'desbloquea (tenue = indirecto)'),
      h('span', {}, h('i', { class: 'lr-con' }), 'conexiones y desambiguaciones'));

    // Panel de detalle: a la derecha en escritorio; hoja deslizable abajo en móvil.
    async function pintarPanel() {
      const mio = ++turnoPanel;
      panel.innerHTML = '';
      panel.hidden = !sel;
      panel.classList.remove('plegada');
      panel.style.transform = '';
      zona.classList.toggle('con-panel', !!sel);
      if (!sel) return;
      const id = sel, c = C[id], e = estado(id), R = relaciones(id);
      const nota = (x) => {
        const d = c.desambiguacion.find(y => y.id === x) || C[x].desambiguacion.find(y => y.id === id);
        if (d) return 'No confundir' + (d.nota ? ': ' + d.nota : '');
        const k = c.conexiones.find(y => y.id === x) || C[x].conexiones.find(y => y.id === id);
        return k && k.nota ? k.nota : null;
      };
      const item = (x, n) => h('li', {}, h('button', { type: 'button', class: 'panel-nodo', style: colorBloque(C[x].bloque), onclick: () => elegir(x, { centrar: true }) },
        h('span', { class: 'punto-bloque' }), C[x].nombre, dominada(x) ? h('span', { class: 'ok', 'aria-label': 'dominada' }, ' ✓') : null), n ? h('small', { text: n }) : null);
      const grupo = (titulo, clase, ids, conNota) => ids.length
        ? h('section', { class: 'panel-grupo' }, h('h3', {}, h('i', { class: clase }), `${titulo} (${ids.length})`), h('ul', {}, ids.map(x => item(x, conNota ? nota(x) : null))))
        : null;
      const ruta = rutaHacia(id);
      const bRuta = api.boton('Ver ruta', () => {
        const on = bRuta.getAttribute('aria-pressed') !== 'true';
        bRuta.setAttribute('aria-pressed', String(on));
        if (ctl) ctl.verRuta(on ? ruta : null);
      }, { 'aria-pressed': 'false' });
      const extra = h('div', { class: 'panel-extra' });
      const asa = h('button', { type: 'button', class: 'panel-asa', 'aria-label': 'Plegar o desplegar el panel (desliza hacia abajo para cerrarlo)' });
      panel.append(...[asa,
        h('header', { class: 'panel-cab' }, h('h2', { text: c.nombre }), h('button', { type: 'button', class: 'panel-cerrar', 'aria-label': 'Cerrar el panel (Esc)', onclick: () => elegir(null) }, '×')),
        h('div', { class: 'panel-distintivos' },
          h('span', { class: 'distintivo distintivo-bloque', style: colorBloque(c.bloque) }, h('span', { class: 'punto-bloque' }), `${c.bloque} · ${I.bloques[c.bloque]}`),
          h('span', { class: 'distintivo' + (c.tipo.includes('ampliacion') ? ' amp' : ''), text: TIPOS[c.tipo] || c.tipo }),
          h('span', { class: 'distintivo' + (e === 'dominada' ? ' bien' : ''), text: ESTADOS[e] })),
        c.frase ? h('p', { class: 'panel-frase', html: c.frase }) : h('p', { class: 'panel-frase suave', text: `Pendiente · lote ${c.lote}` }),
        h('a', { href: '#' + id, class: 'boton boton-principal panel-abrir' }, 'Abrir ficha'),
        extra,
        grupo('Requisitos', 'lr-req', c.prerequisitos.filter(x => C[x])),
        grupo('Desbloquea', 'lr-des', c.desbloquea.filter(x => C[x])),
        grupo('Conexiones', 'lr-con', [...R.con], true),
        h('div', { class: 'panel-ruta' }, h('span', { text: `Ruta completa hasta aquí: ${ruta.length} conceptos` }), bRuta)].filter(Boolean));
      // Deslizar el asa hacia abajo cierra la hoja; un toque la pliega o despliega.
      let y0 = null, dy = 0;
      asa.addEventListener('pointerdown', (ev) => { y0 = ev.clientY; dy = 0; try { asa.setPointerCapture(ev.pointerId); } catch (x) { /* nada */ } });
      asa.addEventListener('pointermove', (ev) => { if (y0 === null) return; dy = Math.max(0, ev.clientY - y0); panel.style.transform = dy ? `translateY(${dy}px)` : ''; });
      asa.addEventListener('pointerup', () => { if (y0 === null) return; y0 = null; panel.style.transform = ''; if (dy > 80) elegir(null); else if (dy < 6) panel.classList.toggle('plegada'); });
      asa.addEventListener('click', (ev) => { if (ev.detail === 0) panel.classList.toggle('plegada'); });
      tex(panel);
      if (!c.escrita) return;
      await cargarBloque(c.bloque);
      const F = ficha(id);
      if (mio !== turnoPanel || !F) return;
      const nq = F.quiz ? F.quiz.length : 0;
      extra.append(h('ul', { class: 'panel-datos' },
        h('li', {}, h('b', { text: 'Interactivo: ' }), F.widget ? F.widget.motor : 'no tiene'),
        h('li', {}, h('b', { text: 'Autoevaluación: ' }), `${nq} ${nq === 1 ? 'pregunta' : 'preguntas'}`)));
    }

    const m = { elegir, abrir, actual: () => sel, chips, leyendaRel };
    const pintar = () => {
      cuerpo.innerHTML = '';
      bC.setAttribute('aria-pressed', String(modo === 'constelacion'));
      bB.setAttribute('aria-pressed', String(modo === 'bloques'));
      ctl = modo === 'constelacion' ? vistaConstelacion(cuerpo, m) : vistaBloques(cuerpo, m);
      ctl.filtro(filtro());
      if (sel) ctl.marcar(sel, { centrar: modo === 'constelacion' });
      return tex(cuerpo);
    };
    bC.addEventListener('click', () => { modo = 'constelacion'; pref('atlas-ia-mapa', modo); pintar(); pintarPanel(); });
    bB.addEventListener('click', () => { modo = 'bloques'; pref('atlas-ia-mapa', modo); pintar(); pintarPanel(); });
    vista.append(h('div', { class: 'mapa-cabecera' }, h('h1', { text: 'Mapa de conceptos' }),
      window.AtlasMapa ? h('div', { class: 'selector-vista', role: 'group', 'aria-label': 'Vista del mapa' }, bC, bB) : null), zona);
    return pintar();
  }

  function vistaConstelacion(cont, m) {
    const buscador = h('input', { type: 'search', class: 'campo', list: 'const-lista', placeholder: 'Buscar en el mapa…', 'aria-label': 'Buscar un concepto en el mapa' });
    const lista = h('datalist', { id: 'const-lista' }, I.orden.map(id => h('option', { value: C[id].nombre })));
    const lienzo = h('div');
    const avisoRuta = h('div');
    let ctl = null;
    const elegir = () => {
      const t = norm(buscador.value.trim());
      if (!t) { m.elegir(null); return; }
      const c = I.conceptos.find(x => norm(x.nombre) === t) || I.conceptos.find(x => norm(x.nombre).startsWith(t)) || I.conceptos.find(x => norm(x.nombre).includes(t));
      if (c) m.elegir(c.id, { centrar: 2.6 });
    };
    buscador.addEventListener('change', elegir);
    buscador.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); elegir(); } });
    buscador.addEventListener('input', () => { if (!buscador.value) m.elegir(null); });
    cont.append(
      h('p', { class: 'suave estrecho', text: 'Cada punto es un concepto y cada cúmulo, un bloque. El tamaño indica cuántos conceptos desbloquea. Haz clic en un punto para seleccionarlo: verás sus requisitos, lo que desbloquea y sus conexiones, y un panel con su detalle. Doble clic o «Abrir ficha» para entrar. Clic en el fondo o Esc para soltar. Rueda o pellizco para acercar; arrastra para moverte.' }),
      h('div', { class: 'filtros' }, buscador, lista, api.boton('Centrar', () => ctl.centrar()), api.boton('Encuadrar selección', () => ctl.encuadrar(), { title: 'Ajusta el zoom a los bloques elegidos' })),
      m.chips,
      avisoRuta, lienzo,
      h('div', { class: 'leyendas-mapa' }, m.leyendaRel,
        h('div', { class: 'leyenda-mapa leyenda-const' }, h('span', { class: 'l-pendiente', text: 'pendiente de escribir' }), h('span', { class: 'l-escrita', text: 'escrita' }), h('span', { class: 'l-vista', text: 'vista' }), h('span', { class: 'l-dominada', text: 'dominada' }))));
    ctl = AtlasMapa.constelacion(lienzo, ctxMapa(), { elegir: m.elegir, abrir: m.abrir, actual: m.actual });
    const r = prog.ultimaRuta;
    if (r && C[r.destino]) {
      const ids = rutaHacia(r.destino);
      ctl.ruta(ids);
      avisoRuta.append(h('div', { class: 'aviso aviso-ruta' }, h('span', {}, `Ruta resaltada: ${r.nombre || 'Ruta hacia ' + C[r.destino].nombre} · ${ids.length} conceptos. `),
        api.boton('Quitar resaltado', () => { prog.ultimaRuta = null; guardar(); ctl.ruta(null); avisoRuta.innerHTML = ''; })));
    }
    return ctl;
  }

  function vistaBloques(cont, m) {
    const prof = {};
    const profundidad = (id) => {
      if (prof[id] !== undefined) return prof[id];
      prof[id] = 0;
      const ps = (C[id] || { prerequisitos: [] }).prerequisitos.filter(p => C[p]);
      prof[id] = ps.length ? 1 + Math.max(...ps.map(profundidad)) : 0;
      return prof[id];
    };
    const fEstado = h('select', { 'aria-label': 'Filtrar por estado' }, h('option', { value: '', text: 'Todos los estados' }), Object.entries(ESTADOS).map(([k, t]) => h('option', { value: k, text: t })));
    const fTexto = h('input', { type: 'search', placeholder: 'Filtrar por nombre', 'aria-label': 'Filtrar por nombre' });
    const mapa = h('div', { class: 'mapa' });
    const aristas = api.el('svg', { class: 'mapa-aristas', 'aria-hidden': 'true' });
    mapa.append(aristas);
    const nodos = {};
    Object.entries(I.bloques).forEach(([b, nombre]) => {
      const col = h('section', { class: 'mapa-col', style: colorBloque(b), 'data-bloque': b }, h('h2', {}, `${b} · ${nombre}`));
      const cs = I.conceptos.filter(c => c.bloque === b);
      const niveles = {};
      cs.forEach(c => { (niveles[profundidad(c.id)] = niveles[profundidad(c.id)] || []).push(c); });
      Object.keys(niveles).map(Number).sort((a, b2) => a - b2).forEach(nv => {
        const div = h('div', { class: 'mapa-nivel', 'aria-label': `Profundidad ${nv}` });
        niveles[nv].sort((a, b2) => POS[a.id] - POS[b2.id]).forEach(c => {
          const e = estado(c.id);
          const a = h('a', { href: '#' + c.id, class: 'nodo ' + e, 'data-id': c.id, title: `${c.nombre} · ${ESTADOS[e]}${c.escrita ? '' : ' (lote ' + c.lote + ')'}` }, c.nombre);
          nodos[c.id] = a;
          div.append(a);
        });
        col.append(div);
      });
      mapa.append(col);
    });
    const filtrar = () => {
      const e = fEstado.value, t = norm(fTexto.value.trim());
      Object.entries(nodos).forEach(([id, a]) => a.classList.toggle('atenuado', (!!e && estado(id) !== e) || (!!t && !norm(C[id].nombre).includes(t))));
    };
    fEstado.addEventListener('change', filtrar);
    fTexto.addEventListener('input', filtrar);

    // Resaltado del nodo seleccionado (o del que está bajo el puntero si no hay selección), o de la ruta hasta él.
    let sel = null, rutaSel = null;
    function limpiar() {
      aristas.innerHTML = '';
      mapa.classList.remove('seleccion');
      Object.values(nodos).forEach(a => { a.classList.remove('foco', 'rel', 'req', 'desb', 'con'); a.style.removeProperty('--o'); });
    }
    const visible = (x) => nodos[x] && !nodos[x].closest('[hidden]');
    const conLineas = () => {
      if (getComputedStyle(aristas).display === 'none') return false;
      aristas.setAttribute('width', mapa.scrollWidth); aristas.setAttribute('height', mapa.scrollHeight);
      return true;
    };
    function linea(de, a, clase, o) {
      if (!visible(de) || !visible(a)) return;
      const base = mapa.getBoundingClientRect();
      const caja = (el) => { const r = el.getBoundingClientRect(); return { l: r.left - base.left + mapa.scrollLeft, r: r.right - base.left + mapa.scrollLeft, y: r.top - base.top + mapa.scrollTop + r.height / 2 }; };
      const p = caja(nodos[de]), q = caja(nodos[a]);
      let x1, x2, d;
      if (Math.abs(p.l - q.l) < 5) { x1 = p.r - 6; x2 = q.r - 6; d = `M${x1},${p.y} C${x1 + 22},${p.y} ${x2 + 22},${q.y} ${x2},${q.y}`; }
      else if (p.l < q.l) { x1 = p.r; x2 = q.l; const mm = (x1 + x2) / 2; d = `M${x1},${p.y} C${mm},${p.y} ${mm},${q.y} ${x2},${q.y}`; }
      else { x1 = p.l; x2 = q.r; const mm = (x1 + x2) / 2; d = `M${x1},${p.y} C${mm},${p.y} ${mm},${q.y} ${x2},${q.y}`; }
      const g = api.el('g', { class: 'mapa-rel ' + clase, style: `opacity:${o}` }, aristas);
      api.el('path', { d }, g);
      if (clase !== 'con') api.el('circle', { cx: x2, cy: q.y, r: 3.5 }, g);
    }
    function resaltar(id) {
      limpiar();
      const R = relaciones(id), o = (x) => R.opacidad(x).toFixed(2);
      mapa.classList.add('seleccion');
      Object.keys(nodos).forEach(x => {
        if (!R.opacidad(x)) return;
        nodos[x].classList.add('rel', x === id ? 'foco' : R.anc.has(x) ? 'req' : R.des.has(x) ? 'desb' : 'con');
        if (R.con.has(x)) nodos[x].classList.add('con');
        nodos[x].style.setProperty('--o', o(x));
      });
      if (!conLineas()) return;
      // Cada arista de la cadena une nodos a distancias consecutivas del seleccionado.
      Object.keys(nodos).forEach(x => {
        const da = x === id ? 0 : R.anc.get(x), dd = x === id ? 0 : R.des.get(x);
        if (da !== undefined) C[x].prerequisitos.forEach(p => { if (R.anc.get(p) === da + 1) linea(p, x, 'req', o(p)); });
        if (dd !== undefined) C[x].desbloquea.forEach(d => { if (R.des.get(d) === dd + 1) linea(x, d, 'desb', o(d)); });
      });
      R.con.forEach(x => linea(id, x, 'con', 1));
    }
    function marcarRuta(ids, foco) {
      limpiar();
      mapa.classList.add('seleccion');
      ids.forEach(x => nodos[x] && nodos[x].classList.add('rel', x === foco ? 'foco' : 'req'));
      if (conLineas()) ids.forEach(x => C[x].prerequisitos.forEach(p => { if (ids.has(p)) linea(p, x, 'req', 1); }));
    }
    const restaurar = () => { if (sel && rutaSel) marcarRuta(rutaSel, sel); else if (sel) resaltar(sel); else limpiar(); };

    // Clic selecciona (en el fondo, suelta); doble clic, o Enter sobre el nodo ya seleccionado, abre la ficha.
    mapa.addEventListener('mouseover', (e) => { const a = e.target.closest('.nodo'); if (a && !sel) resaltar(a.dataset.id); });
    mapa.addEventListener('mouseleave', () => { if (!sel) limpiar(); });
    mapa.addEventListener('click', (e) => {
      const a = e.target.closest('.nodo');
      if (a) { e.preventDefault(); if (e.detail === 0 && m.actual() === a.dataset.id) m.abrir(a.dataset.id); else m.elegir(a.dataset.id); }
      else m.elegir(null);
    });
    mapa.addEventListener('dblclick', (e) => { const a = e.target.closest('.nodo'); if (a) { e.preventDefault(); m.abrir(a.dataset.id); } });
    mapa.addEventListener('keydown', (e) => { const a = e.target.closest('.nodo'); if (a && e.key === ' ') { e.preventDefault(); m.elegir(a.dataset.id); } });
    if (window.ResizeObserver) new ResizeObserver(() => { if (sel) restaurar(); }).observe(mapa);

    cont.append(
      h('p', { class: 'suave estrecho', text: 'Cada columna es un bloque; dentro, los conceptos bajan según la longitud de su cadena de requisitos. Haz clic en un concepto para seleccionarlo: verás sus requisitos, lo que desbloquea y sus conexiones, y un panel con su detalle. Doble clic o «Abrir ficha» para entrar. Clic en el fondo o Esc para soltar.' }),
      h('div', { class: 'filtros' }, fEstado, fTexto),
      m.chips,
      mapa,
      h('div', { class: 'leyendas-mapa' }, m.leyendaRel,
        h('div', { class: 'leyenda-mapa' }, h('span', { class: 'l-pendiente', text: 'pendiente de escribir' }), h('span', { class: 'l-escrita', text: 'escrita' }), h('span', { class: 'l-vista', text: 'vista' }), h('span', { class: 'l-dominada', text: 'dominada' }))));
    return {
      filtro(s) {
        mapa.querySelectorAll('.mapa-col').forEach(col => { col.hidden = !!s && !s.has(col.dataset.bloque); });
        restaurar();
      },
      // centrar: desplaza el mapa hasta el nodo y le pasa el foco.
      marcar(id, o) {
        sel = id || null; rutaSel = null;
        if (sel && o && o.centrar && nodos[sel]) {
          nodos[sel].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
          nodos[sel].focus({ preventScroll: true });
        }
        restaurar();
      },
      verRuta(ids) { rutaSel = ids ? new Set(ids) : null; restaurar(); },
    };
  }

  // ───────────── Ficha ─────────────
  async function vistaFicha(id) {
    const c = C[id];
    document.title = `${c.nombre} · Atlas de IA`;
    if (c.escrita) await cargarBloque(c.bloque);
    if (decodeURIComponent(location.hash.slice(1)) !== id) return;
    const F = ficha(id);
    const art = h('article', { class: 'ficha', style: colorBloque(c.bloque) });
    const e = estado(id);
    const cab = h('header', { class: 'ficha-cabecera' },
      h('div', { class: 'migas' }, h('a', { href: '#mapa' }, `${c.bloque} · ${I.bloques[c.bloque]}`), ' › ', c.nombre),
      h('h1', { text: c.nombre }),
      h('div', {},
        c.tipo !== 'original' ? h('span', { class: 'distintivo' + (c.tipo.includes('ampliacion') ? ' amp' : ''), text: TIPOS[c.tipo] || c.tipo }) : null,
        F ? h('span', { class: 'distintivo', text: F.estado === 'revisada' ? 'Revisada' : 'Borrador' }) : null,
        e === 'vista' || e === 'dominada' ? h('span', { class: 'distintivo' + (e === 'dominada' ? ' bien' : ''), text: ESTADOS[e] }) : null));
    art.append(cab);
    if (!F) {
      art.append(h('div', { class: 'aviso', style: 'margin:1rem 0', text: `Pendiente (lote ${c.lote}). Esta ficha aún no está escrita.` }));
      art.append(h('div', { class: 'ficha-rejilla' }, h('div', { class: 'ficha-cuerpo' }, seccionFuentes(c)), lateral(c)));
      vista.append(art);
      return;
    }
    prog.fichas[id] = Object.assign({}, prog.fichas[id], { vista: (prog.fichas[id] && prog.fichas[id].vista) || hoy() });
    prog.ultima = id;
    guardar();

    const S = F.secciones;
    if (S['En una frase']) art.append(h('p', { class: 'entradilla', html: S['En una frase'] }));
    const modoVista = pref('atlas-ia-modo') === 'esencial' ? 'esencial' : 'completa';
    const bCompleta = h('button', { type: 'button', 'aria-pressed': String(modoVista === 'completa') }, 'Completa');
    const bEsencial = h('button', { type: 'button', 'aria-pressed': String(modoVista === 'esencial') }, 'Esencial');
    const selector = h('div', { class: 'selector-vista', role: 'group', 'aria-label': 'Nivel de detalle' }, bCompleta, bEsencial);
    const ponModo = (m) => {
      art.classList.toggle('esencial', m === 'esencial');
      if (resumen) {  // Esencial: la chuleta justo tras la frase; Completa: "Para llevar" tras Errores típicos (ESPEC-WEB §5.5)
        resumen.querySelector('h2').textContent = m === 'esencial' ? 'En resumen' : 'Para llevar';
        if (m === 'esencial' || !errores) cuerpo.prepend(resumen); else errores.after(resumen);
      }
      bCompleta.setAttribute('aria-pressed', String(m === 'completa')); bEsencial.setAttribute('aria-pressed', String(m === 'esencial')); pref('atlas-ia-modo', m);
    };
    bCompleta.addEventListener('click', () => ponModo('completa'));
    bEsencial.addEventListener('click', () => ponModo('esencial'));
    art.append(selector);

    const cuerpo = h('div', { class: 'ficha-cuerpo' });
    const sec = (titulo, contenido, clase) => h('section', { class: clase || '' }, h('h2', { text: titulo }), contenido);
    if (S['Intuición']) cuerpo.append(sec('Intuición', h('div', { html: S['Intuición'] }), 'solo-completa'));
    if (S['Explicación']) cuerpo.append(h('section', { class: 'sec-explicacion solo-completa', html: '<h2>Explicación</h2>' + S['Explicación'] }));
    if (S['Formalización']) cuerpo.append(sec('Formalización', h('div', { html: S['Formalización'] }), 'solo-completa'));
    let widgetEl = null;
    if (F.widget) {
      widgetEl = h('div', { class: 'widget' });
      cuerpo.append(sec('Interactivo', [h('div', { class: 'panel-interactivo' }, widgetEl), h('div', { html: S['Interactivo'] || '' })]));
    }
    if (S['En código']) {
      const cod = h('div', { html: S['En código'] });
      cod.querySelectorAll('pre.codigo').forEach(pre => {
        const envoltorio = h('div', { class: 'bloque-codigo' });
        pre.replaceWith(envoltorio);
        const b = api.boton('Copiar', () => copiar(pre.textContent).then(ok => { b.textContent = ok ? 'Copiado ✓' : 'No se pudo copiar'; setTimeout(() => { b.textContent = 'Copiar'; }, 1800); }), { class: 'boton copiar', 'aria-label': 'Copiar el código' });
        envoltorio.append(pre, b);
      });
      cuerpo.append(sec('En código', cod, 'solo-completa'));
    }
    const errores = S['Errores típicos'] ? sec('Errores típicos', h('div', { class: 'errores-tipicos', html: S['Errores típicos'] })) : null;
    if (errores) cuerpo.append(errores);
    const resumen = S['En resumen'] ? sec('Para llevar', h('div', { html: S['En resumen'] }), 'en-resumen') : null;
    if (resumen) cuerpo.append(resumen);
    if (S['A fondo']) cuerpo.append(h('section', { class: 'solo-completa' }, h('details', { class: 'a-fondo' }, h('summary', { text: 'A fondo' }), h('div', { html: S['A fondo'] }))));
    if (F.quiz && F.quiz.length) cuerpo.append(sec('Autoevaluación', quiz(id, F.quiz)));
    if (F.glosario && F.glosario.length) {
      cuerpo.append(sec('Glosario', h('dl', { class: 'glosario-ficha' }, F.glosario.map(g => [h('dt', { text: g.termino }), h('dd', { html: g.definicion })])), 'solo-completa'));
    }
    cuerpo.append(seccionFuentes(c));
    cuerpo.append(pieFicha(id));
    art.append(h('div', { class: 'ficha-rejilla' }, cuerpo, lateral(c)));
    vista.append(art);
    ponModo(modoVista);
    await tex(art);
    if (widgetEl && window.Motores) await Motores.montar(widgetEl, F.widget.motor, JSON.parse(JSON.stringify(F.widget.params)));
  }

  function seccionFuentes(c) {
    const lista = h('ul', { class: 'fuentes-lista' }, c.fuentes.map(f => h('li', {},
      h('a', { href: f.url, rel: 'noopener', target: '_blank' }, `${f.repo} · ${f.archivo}${f.seccion ? ' › ' + f.seccion : ''}`), ' ',
      h('span', { class: 'distintivo', text: f.rol }))));
    const cont = [lista];
    if (c.ampliacion && c.ampliacion.fuentes_externas && c.ampliacion.fuentes_externas.length) {
      cont.push(h('p', { style: 'margin-bottom:.3rem;font-weight:600', text: 'Fuentes externas de la ampliación' }),
        h('ul', { class: 'fuentes-lista' }, c.ampliacion.fuentes_externas.map(t => h('li', { text: t }))));
    }
    return h('section', { class: 'solo-completa' }, h('h2', { text: 'Fuentes' }), cont);
  }

  function lateral(c) {
    const lista = (ids, notas, conCheck) => ids.length
      ? h('ul', {}, ids.map((id, k) => h('li', {}, conCheck && dominada(id) ? h('span', { class: 'ok', 'aria-label': 'dominada' }, '✓ ') : null, enlace(id), notas && notas[k] ? h('small', { text: notas[k] }) : null)))
      : h('p', { class: 'suave', style: 'margin:0', text: 'Ninguno' });
    const ruta = rutaHacia(c.id);
    const bloques = [
      h('h2', { text: 'Requisitos' }), lista(c.prerequisitos, null, true),
      h('h2', { text: 'Desbloquea' }), lista(c.desbloquea),
    ];
    if (c.conexiones.length) bloques.push(h('h2', { text: 'Conexiones' }), lista(c.conexiones.map(x => x.id), c.conexiones.map(x => x.nota)));
    if (c.desambiguacion.length) bloques.push(h('h2', { text: 'No confundir con' }), lista(c.desambiguacion.map(x => x.id), c.desambiguacion.map(x => x.nota)));
    bloques.push(h('h2', { text: 'Ruta' }), h('p', { style: 'margin:0' }, h('a', { href: '#rutas', onclick: () => { objetivoRuta = c.id; } }, `Ruta completa hasta aquí (${ruta.length} conceptos)`)));
    return h('aside', { class: 'lateral', 'aria-label': 'Relaciones del concepto' }, h('div', { class: 'tarjeta' }, bloques));
  }

  function pieFicha(id) {
    const k = POS[id];
    const ant = I.orden[k - 1], sig = I.orden[k + 1], rec = recomendado(id);
    return h('nav', { class: 'pie-ficha', 'aria-label': 'Navegación entre fichas' },
      ant ? h('a', { href: '#' + ant }, h('small', { text: '← Anterior' }), C[ant].nombre) : h('span'),
      sig ? h('a', { href: '#' + sig, class: 'siguiente' }, h('small', { text: 'Siguiente →' }), C[sig].nombre) : h('span'),
      rec && rec !== sig ? h('a', { href: '#' + rec, class: 'recomendado' }, h('small', { text: 'Siguiente recomendado (requisitos dominados, aún sin dominar)' }), C[rec].nombre) : null);
  }

  function quiz(id, preguntas) {
    const cont = h('div', { class: 'quiz' });
    const resultado = h('p', { class: 'resultado-quiz', 'aria-live': 'polite' });
    let respuestas = {};
    function pintar() {
      cont.innerHTML = '';
      respuestas = {};
      preguntas.forEach((q, i) => cont.append(pregunta(q, i, (ok) => {
        respuestas[i] = ok;
        if (Object.keys(respuestas).length === preguntas.length) terminar();
      })));
      resultado.textContent = '';
      cont.append(resultado);
      tex(cont);
    }
    function terminar() {
      const aciertos = Object.values(respuestas).filter(Boolean).length, total = preguntas.length;
      const f = Object.assign({ vista: hoy() }, prog.fichas[id]);
      f.quiz = { aciertos, total };
      const ok = aciertos / total >= 0.8;
      f.dominada = f.dominada || ok;
      prog.fichas[id] = f;
      guardar();
      resultado.textContent = `${aciertos} de ${total} aciertos. ` + (ok ? 'Ficha marcada como dominada ✓' : 'Con un 80 % o más la ficha queda dominada.');
      resultado.append(' ', api.boton('Repetir', pintar));
    }
    pintar();
    return cont;
  }

  function pregunta(q, i, alResponder) {
    const expl = h('div', { class: 'explicacion', hidden: true });
    const botones = q.opciones.map((o, k) => h('button', { type: 'button', class: 'opcion', 'data-k': k },
      h('span', { class: 'marca-op', 'aria-hidden': 'true', text: String.fromCharCode(97 + k) + ')' }), h('span', { html: o.html })));
    botones.forEach((b, k) => b.addEventListener('click', () => {
      const ok = q.opciones[k].correcta;
      botones.forEach((x, j) => {
        x.disabled = true;
        if (q.opciones[j].correcta) { x.classList.add('correcta'); x.querySelector('.marca-op').textContent = '✓'; }
        else if (j === k) { x.classList.add('incorrecta'); x.querySelector('.marca-op').textContent = '✗'; }
      });
      expl.hidden = false;
      expl.innerHTML = `<strong>${ok ? '✓ Correcto.' : '✗ No es correcto.'}</strong> ${q.explicacion}`;
      tex(expl);
      alResponder(ok);
    }));
    return h('div', { class: 'pregunta' }, h('fieldset', {}, h('legend', { html: `${i + 1}. ${q.enunciado}` }), botones, expl));
  }

  // ───────────── Vista previa de enlaces internos ─────────────
  let previa = null;
  function ocultarPrevia() { if (previa) { previa.remove(); previa = null; } }
  function mostrarPrevia(a) {
    const c = C[a.dataset.id];
    if (!c) return;
    ocultarPrevia();
    previa = h('div', { class: 'vista-previa', role: 'tooltip' }, h('b', { text: c.nombre }),
      c.frase ? h('span', { html: c.frase }) : h('span', { class: 'suave', text: `Pendiente (lote ${c.lote}).` }));
    document.body.append(previa);
    const r = a.getBoundingClientRect(), ancho = Math.min(352, window.innerWidth - 16);
    previa.style.left = Math.max(8, Math.min(window.scrollX + r.left, window.scrollX + window.innerWidth - ancho - 8)) + 'px';
    previa.style.top = (window.scrollY + r.bottom + 6) + 'px';
    tex(previa);
  }
  document.addEventListener('mouseover', (e) => { const a = e.target.closest && e.target.closest('a.xref'); if (a && !a.closest('.mapa')) mostrarPrevia(a); });
  document.addEventListener('mouseout', (e) => { const a = e.target.closest && e.target.closest('a.xref'); if (a && !a.contains(e.relatedTarget)) ocultarPrevia(); });
  document.addEventListener('focusin', (e) => { const a = e.target.closest && e.target.closest('a.xref'); if (a) mostrarPrevia(a); else ocultarPrevia(); });

  // ───────────── Glosario ─────────────
  function vistaGlosario() {
    document.title = 'Glosario · Atlas de IA';
    const filtro = h('input', { type: 'search', class: 'campo', placeholder: 'Filtrar términos', 'aria-label': 'Filtrar términos', style: 'width:min(100%,22rem)' });
    const desamb = [];
    const vistos = new Set();
    I.conceptos.forEach(c => (c.desambiguacion || []).forEach(d => {
      const k = [c.id, d.id].sort().join('|');
      if (vistos.has(k) || !C[d.id]) return;
      vistos.add(k);
      desamb.push({ titulo: `${c.nombre} ≠ ${C[d.id].nombre}`, ids: [c.id, d.id], nota: d.nota, clave: norm(c.nombre + ' ' + C[d.id].nombre + ' ' + d.nota) });
    }));
    Object.values(I.glosario).filter(v => v.length > 1).forEach(v => {
      desamb.push({ titulo: `«${v[0].termino}» en ${v.length} fichas`, ids: v.map(x => x.id), nota: v.map(x => `${C[x.id] ? C[x.id].nombre : x.id}: ${sinHtml(x.definicion)}`).join(' · '), clave: norm(v[0].termino) });
    });
    // Entradas: los términos de las fichas y, además, cada concepto (con su frase o «Pendiente · lote Lxx»).
    const entradas = [];
    Object.values(I.glosario).forEach(v => v.forEach(x => entradas.push({ termino: x.termino, html: x.definicion, id: x.id, bloque: C[x.id] ? C[x.id].bloque : '', de: C[x.id] ? C[x.id].nombre : x.id })));
    I.conceptos.forEach(c => entradas.push({ termino: c.nombre, html: c.frase, id: c.id, bloque: c.bloque, concepto: true, pendiente: !c.escrita || !c.frase, lote: c.lote }));
    entradas.forEach(x => { x.n = norm(x.termino); x.t = x.html ? norm(sinHtml(x.html)) : ''; x.letra = /[a-z]/.test(x.n.charAt(0)) ? x.n.charAt(0).toUpperCase() : '#'; });
    entradas.sort((a, b) => a.n.localeCompare(b.n, 'es') || (a.concepto ? -1 : 1));
    const fBloque = h('select', { class: 'campo', 'aria-label': 'Filtrar por bloque' }, h('option', { value: '', text: 'Todos los bloques' }), Object.entries(I.bloques).map(([b, n]) => h('option', { value: b, text: `${b} · ${n}` })));
    const contador = h('p', { class: 'suave glosario-contador', 'aria-live': 'polite' });
    const letras = h('nav', { class: 'glosario-letras', 'aria-label': 'Saltar a una letra' });
    const cajaD = h('div', { class: 'rejilla-tarjetas', style: 'margin-bottom:1.5rem' });
    const cajaT = h('div');
    const pintar = () => {
      const t = norm(filtro.value.trim()), b = fBloque.value;
      cajaD.innerHTML = '';
      desamb.filter(d => !t || d.clave.includes(t)).forEach(d => cajaD.append(h('div', { class: 'tarjeta desamb' },
        h('h3', { text: d.titulo }), d.nota ? h('p', { style: 'margin:0 0 .4rem;font-size:.9rem', text: d.nota }) : null,
        h('p', { style: 'margin:0;font-size:.88rem' }, d.ids.map((id, k) => [k ? ' · ' : '', enlace(id)])))));
      cajaT.innerHTML = '';
      const filtrados = entradas.filter(x => (!b || x.bloque === b) && (!t || x.n.includes(t) || x.t.includes(t)));
      contador.textContent = `${filtrados.length} ${filtrados.length === 1 ? 'término' : 'términos'} · crece con cada lote`;
      if (!filtrados.length) cajaT.append(h('p', { class: 'suave', text: 'Ningún término coincide con el filtro.' }));
      const hay = new Set(filtrados.map(x => x.letra));
      letras.innerHTML = '';
      [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '#'].filter(l => l !== '#' || hay.has('#')).forEach(l => letras.append(h('button', {
        type: 'button', class: 'letra', disabled: !hay.has(l), 'aria-label': `Letra ${l}`,
        onclick: () => { const d = document.getElementById('letra-' + l); if (d) { d.scrollIntoView({ behavior: reducido() ? 'auto' : 'smooth' }); d.focus({ preventScroll: true }); } },
      }, l)));
      let letra = '', dl = null;
      filtrados.forEach(x => {
        if (x.letra !== letra) { letra = x.letra; cajaT.append(h('h2', { class: 'glosario-letra', id: 'letra-' + letra, tabindex: '-1', text: letra })); dl = h('dl', { class: 'glosario-lista' }); cajaT.append(dl); }
        const enl = h('a', { href: '#' + x.id, class: 'xref', 'data-id': x.id }, x.termino);
        if (x.concepto) {
          dl.append(h('dt', { class: 'g-concepto' + (x.pendiente ? ' pendiente' : ''), style: colorBloque(x.bloque) }, h('span', { class: 'punto-bloque', 'aria-hidden': 'true' }), enl, h('span', { class: 'g-tipo', text: 'concepto' })),
            h('dd', { class: x.pendiente ? 'pendiente' : '' }, x.pendiente ? h('span', { text: `Pendiente · lote ${x.lote}` }) : h('span', { html: x.html })));
        } else {
          dl.append(h('dt', {}, enl), h('dd', {}, h('span', { html: x.html }), ' ', h('small', { text: `— ${x.de}` })));
        }
      });
      return tex(cajaT);
    };
    filtro.addEventListener('input', pintar);
    fBloque.addEventListener('change', pintar);
    vista.append(h('div', { class: 'estrecho', style: 'max-width:56rem' }, h('h1', { text: 'Glosario' }),
      desamb.length ? h('h2', { style: 'font-size:1.1rem', text: 'No confundir' }) : null, cajaD,
      h('div', { class: 'filtros' }, filtro, fBloque), contador, letras, cajaT));
    return pintar();
  }

  // ───────────── Rutas ─────────────
  function vistaRutas() {
    document.title = 'Rutas · Atlas de IA';
    const listaRuta = (destino) => {
      const pasos = rutaHacia(destino);
      return h('ol', { class: 'ruta-pasos' }, pasos.map(id => {
        const e = estado(id);
        return h('li', { style: colorBloque(C[id].bloque) }, h('span', { class: 'punto-bloque', 'aria-hidden': 'true' }), enlace(id),
          h('span', { class: 'estado distintivo' + (e === 'dominada' ? ' bien' : ''), text: e === 'pendiente' ? `pendiente · ${C[id].lote}` : ESTADOS[e] }));
      }));
    };
    const vertical = window.innerWidth < 700;
    // Diagrama de red por capas + botón a la constelación + lista de pasos.
    const bloqueRuta = (destino, nombre) => {
      const pasos = rutaHacia(destino), d = pasos.filter(dominada).length;
      return h('div', { class: 'ruta-bloque' },
        h('p', { class: 'suave', style: 'font-size:.9rem;margin:.2rem 0 .5rem', text: vertical ? `${pasos.length} conceptos: cada fila es un nivel de la cadena de requisitos; bajan del requisito al concepto.` : `${pasos.length} conceptos: cada columna es un nivel de la cadena de requisitos; van de izquierda a derecha, del requisito al concepto.` }),
        window.AtlasMapa ? AtlasMapa.redRuta(pasos, ctxMapa(), { vertical, ancho: Math.min(vista.clientWidth, 1200) - 60 }) : null,
        h('div', { class: 'leyenda-mapa leyenda-const leyenda-red' }, h('span', { class: 'l-siguiente', text: 'siguiente paso recomendado' }), h('span', { class: 'l-pendiente', text: 'pendiente de escribir' }), h('span', { class: 'l-escrita', text: 'escrita' }), h('span', { class: 'l-vista', text: 'vista' }), h('span', { class: 'l-dominada', text: 'dominada' })),
        h('div', { class: 'fila-botones', style: 'margin:.2rem 0 .4rem' },
          window.AtlasMapa ? api.boton('Ver en la constelación', () => { prog.ultimaRuta = { destino, nombre }; guardar(); forzarConstelacion = true; location.hash = '#mapa'; }) : null,
          h('span', { class: 'suave', style: 'font-size:.88rem', text: `${d} de ${pasos.length} dominados` })),
        h('h3', { class: 'ruta-lista-t', text: 'Pasos en orden' }), listaRuta(destino));
    };
    const sel = h('select', { class: 'campo', id: 'ruta-hacia', 'aria-label': 'Concepto de destino' }, h('option', { value: '', text: 'Elige un concepto…' }),
      Object.entries(I.bloques).map(([b, n]) => h('optgroup', { label: `${b} · ${n}` }, I.conceptos.filter(c => c.bloque === b).map(c => h('option', { value: c.id, text: c.nombre })))));
    const salida = h('div');
    const pintar = () => {
      salida.innerHTML = '';
      if (!sel.value) return;
      salida.append(bloqueRuta(sel.value, 'Ruta hacia ' + C[sel.value].nombre));
    };
    sel.addEventListener('change', pintar);
    if (objetivoRuta && C[objetivoRuta] && !RUTAS.some(r => r.destino === objetivoRuta)) { sel.value = objetivoRuta; pintar(); }
    const predef = RUTAS.map((r, k) => {
      const pasos = rutaHacia(r.destino), d = pasos.filter(dominada).length;
      const abierta = objetivoRuta ? objetivoRuta === r.destino : k === 0;
      return h('details', { class: 'tarjeta ruta-predef', open: abierta },
        h('summary', {}, `${r.nombre} `, h('span', { class: 'suave', style: 'font-weight:400', text: `· ${pasos.length} conceptos · ${d} dominados` })),
        bloqueRuta(r.destino, r.nombre));
    });
    vista.append(h('div', {}, h('h1', { text: 'Rutas de estudio' }),
      h('h2', { text: 'Ruta hacia…' }), h('p', { class: 'suave estrecho', text: 'Elige un concepto y verás toda su cadena de requisitos como una red: el punto con anillo es el siguiente paso recomendado (el primero sin dominar cuyos requisitos ya dominas).' }), sel, salida,
      h('h2', { text: 'Rutas predefinidas' }), predef));
    objetivoRuta = null;
  }

  // ───────────── Repaso (Leitner) ─────────────
  async function vistaRepaso() {
    document.title = 'Repaso · Atlas de IA';
    const vistas = I.conceptos.filter(c => c.escrita && vistaF(c.id));
    await Promise.all([...new Set(vistas.map(c => c.bloque))].map(cargarBloque));
    const pool = [];
    vistas.forEach(c => { const F = ficha(c.id); if (F) F.quiz.forEach((q, i) => pool.push({ qid: `${c.id}:${i}`, id: c.id, q })); });
    const caja = (qid) => prog.leitner[qid] || 1;
    const cont = h('div', { class: 'estrecho' });
    vista.append(cont);
    function portada() {
      cont.innerHTML = '';
      cont.append(h('h1', { text: 'Repaso espaciado' }),
        h('p', { class: 'suave', text: 'Preguntas de las fichas que has visto, en cajas de Leitner: si aciertas, la pregunta sube de caja y vuelve menos a menudo; si fallas, regresa a la caja 1.' }));
      if (!pool.length) {
        cont.append(h('p', { class: 'aviso' }, 'Todavía no has visto ninguna ficha con autoevaluación. ', h('a', { href: '#mapa' }, 'Abre alguna desde el mapa'), ' y vuelve aquí.'));
        return;
      }
      const cuentas = [1, 2, 3, 4, 5].map(k => pool.filter(p => caja(p.qid) === k).length);
      cont.append(h('div', { class: 'cajas-leitner', 'aria-label': 'Preguntas por caja' }, cuentas.map((n, k) => h('div', {}, h('b', { text: String(n) }), `caja ${k + 1}`))),
        h('p', {}, `${pool.length} preguntas de ${vistas.length} fichas.`),
        api.boton('Empezar sesión de 10 preguntas', sesion, { class: 'boton boton-principal' }));
    }
    function sesion() {
      const orden = barajar(pool.slice()).sort((a, b) => caja(a.qid) - caja(b.qid)).slice(0, 10);
      let k = 0, aciertos = 0;
      const siguiente = () => {
        cont.innerHTML = '';
        if (k >= orden.length) {
          cont.append(h('h1', { text: 'Sesión terminada' }), h('p', { class: 'resultado-quiz', text: `${aciertos} de ${orden.length} aciertos.` }),
            h('div', { class: 'fila-botones' }, api.boton('Otra sesión', sesion, { class: 'boton boton-principal' }), api.boton('Volver', portada)));
          return;
        }
        const it = orden[k];
        const btnSig = api.boton(k === orden.length - 1 ? 'Ver resultado' : 'Siguiente →', () => { k++; siguiente(); }, { class: 'boton boton-principal', hidden: true });
        cont.append(h('p', { class: 'suave' }, `Pregunta ${k + 1} de ${orden.length} · caja ${caja(it.qid)} · de `, enlace(it.id)),
          pregunta(it.q, k, (ok) => {
            if (ok) aciertos++;
            prog.leitner[it.qid] = ok ? Math.min(5, caja(it.qid) + 1) : 1;
            guardar();
            btnSig.hidden = false;
            btnSig.focus();
          }), btnSig);
        tex(cont);
      };
      siguiente();
    }
    portada();
  }

  // ───────────── Buscador ─────────────
  const inp = document.getElementById('buscar');
  const res = document.getElementById('resultados');
  let indiceBusqueda = null, sel = -1;
  function construirIndice() {
    indiceBusqueda = [];
    I.conceptos.forEach(c => indiceBusqueda.push({ id: c.id, titulo: c.nombre, detalle: c.frase ? sinHtml(c.frase) : `${I.bloques[c.bloque]} · pendiente`, n: norm(c.nombre), t: norm(c.frase ? sinHtml(c.frase) : '') }));
    Object.values(I.glosario).forEach(v => v.forEach(x => indiceBusqueda.push({ id: x.id, titulo: x.termino, detalle: `Glosario · ${C[x.id] ? C[x.id].nombre : x.id}`, n: norm(x.termino), t: norm(sinHtml(x.definicion)) })));
  }
  function buscar() {
    if (!indiceBusqueda) construirIndice();
    const q = norm(inp.value.trim());
    res.innerHTML = ''; sel = -1;
    if (!q) { res.hidden = true; inp.setAttribute('aria-expanded', 'false'); return; }
    const palabras = q.split(/\s+/);
    const puntuados = indiceBusqueda.map(e => {
      let s = 0;
      if (e.n.startsWith(q)) s += 6; else if (e.n.includes(q)) s += 4;
      palabras.forEach(p => { if (e.n.includes(p)) s += 2; else if (e.t.includes(p)) s += 1; else s -= 3; });
      return { e, s };
    }).filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 12);
    if (!puntuados.length) res.append(h('li', {}, h('span', { class: 'suave', style: 'display:block;padding:.45rem .6rem;font-size:.9rem', text: 'Sin resultados' })));
    puntuados.forEach(({ e }, k) => res.append(h('li', { role: 'none' }, h('a', { href: '#' + e.id, role: 'option', id: 'res-' + k, onclick: cerrar }, e.titulo, h('small', { text: e.detalle.length > 110 ? e.detalle.slice(0, 108) + '…' : e.detalle })))));
    res.hidden = false;
    inp.setAttribute('aria-expanded', 'true');
  }
  function cerrar() { res.hidden = true; inp.setAttribute('aria-expanded', 'false'); inp.value = ''; inp.blur(); }
  function mover(d) {
    const ops = res.querySelectorAll('a');
    if (!ops.length) return;
    sel = (sel + d + ops.length) % ops.length;
    ops.forEach((a, k) => a.setAttribute('aria-selected', String(k === sel)));
    inp.setAttribute('aria-activedescendant', ops[sel].id);
    ops[sel].scrollIntoView({ block: 'nearest' });
  }
  inp.addEventListener('input', buscar);
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { mover(1); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { mover(-1); e.preventDefault(); }
    else if (e.key === 'Enter') { const ops = res.querySelectorAll('a'); const a = ops[sel >= 0 ? sel : 0]; if (a) { location.hash = a.getAttribute('href'); cerrar(); } e.preventDefault(); }
    else if (e.key === 'Escape') cerrar();
  });
  inp.addEventListener('blur', () => setTimeout(() => { if (document.activeElement !== inp) { res.hidden = true; inp.setAttribute('aria-expanded', 'false'); } }, 200));
  document.addEventListener('keydown', (e) => {
    const t = e.target.tagName;
    if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(t) && !e.target.isContentEditable) { e.preventDefault(); inp.focus(); }
  });

  if (!api) { vista.textContent = 'No se pudo cargar la aplicación (falta motores/nucleo.js).'; return; }
  enrutar();
})();
