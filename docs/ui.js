// Atlas de IA · componentes de interfaz reutilizables para móvil (ESPEC-WEB.md §7b):
// hoja inferior, fila de chips, aviso breve y cabecera que se oculta al desplazar.
(function () {
  'use strict';
  const mqMovil = window.matchMedia ? matchMedia('(max-width: 1023.98px)') : { matches: false, addEventListener() {} };
  const esMovil = () => mqMovil.matches;
  function html(tag, attrs, ...hijos) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const x of hijos.flat(Infinity)) if (x !== null && x !== undefined && x !== false) e.append(x);
    return e;
  }
  const ENFOCABLES = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

  // ───────────── Hoja inferior ─────────────
  // Sube desde abajo; se cierra con el asa (deslizar), el fondo, el botón ×, Esc o Atrás (entrada propia en el historial).
  // Solo hay una abierta: abrir otra con una ya abierta cambia su contenido sin crear otra entrada.
  let hoja = null;
  function hojaInferior(contenido, o) {
    o = o || {};
    if (hoja) { hoja.poner(contenido, o.titulo); if (o.foco) o.foco.focus(); return hoja; }
    const previo = document.activeElement;
    const idT = 'hoja-t-' + Date.now();
    const titulo = html('h2', { id: idT, class: 'hoja-titulo' });
    const cuerpo = html('div', { class: 'hoja-cuerpo' });
    const bCerrar = html('button', { type: 'button', class: 'boton-icono hoja-cerrar', 'aria-label': 'Cerrar' }, '×');
    const asa = html('div', { class: 'hoja-asa', 'aria-hidden': 'true' });
    const cab = html('div', { class: 'hoja-cab' }, titulo, bCerrar);
    const panel = html('div', { class: 'hoja' + (o.completa ? ' completa' : ''), role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': idT, tabindex: '-1' }, asa, cab, cuerpo);
    const fondo = html('div', { class: 'hoja-fondo' });
    const capa = html('div', { class: 'hoja-capa' }, fondo, panel);
    let resolver = [];
    const quitar = () => {
      if (!hoja) return;
      hoja = null;
      document.removeEventListener('keydown', teclas, true);
      document.documentElement.classList.remove('hoja-abierta');
      capa.classList.remove('abierta');
      const fin = () => capa.remove();
      if (reducido()) fin(); else { capa.addEventListener('transitionend', fin, { once: true }); setTimeout(fin, 350); }
      if (previo && previo.focus && document.contains(previo)) previo.focus({ preventScroll: true });
      if (o.alCerrar) o.alCerrar();
      resolver.forEach(f => f()); resolver = [];
    };
    // Cierre pedido desde la interfaz: si la hoja tiene su entrada en el historial, se vuelve atrás y popstate la quita.
    const cerrar = () => new Promise((ok) => {
      if (!hoja) { ok(); return; }
      resolver.push(ok);
      if (history.state && history.state.hoja === idT) history.back(); else quitar();
    });
    function teclas(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cerrar(); return; }
      if (e.key !== 'Tab') return;
      const fs = [...panel.querySelectorAll(ENFOCABLES)].filter(x => x.offsetParent !== null);
      if (!fs.length) { e.preventDefault(); panel.focus(); return; }
      const a = fs[0], z = fs[fs.length - 1];
      if (e.shiftKey && (document.activeElement === a || document.activeElement === panel)) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
    fondo.addEventListener('click', () => cerrar());
    bCerrar.addEventListener('click', () => cerrar());
    // Los enlaces internos primero cierran la hoja (sin dejar su entrada en el historial) y después navegan.
    panel.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented) return;
      e.preventDefault();
      const destino = a.getAttribute('href');
      cerrar().then(() => { if (location.hash !== destino) location.hash = destino; });
    });
    // Deslizar hacia abajo desde el asa o la cabecera cierra la hoja.
    let y0 = null, dy = 0, t0 = 0;
    const inicio = (e) => { if (e.target.closest('button')) return; y0 = e.clientY; dy = 0; t0 = Date.now(); panel.classList.add('arrastrando'); try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) { /* nada */ } };
    const mover = (e) => { if (y0 === null) return; dy = Math.max(0, e.clientY - y0); panel.style.transform = dy ? `translateY(${dy}px)` : ''; };
    const soltar = () => {
      if (y0 === null) return;
      y0 = null; panel.classList.remove('arrastrando');
      const rapido = dy > 30 && dy / Math.max(1, Date.now() - t0) > 0.6;
      if (dy > Math.min(120, panel.offsetHeight / 3) || rapido) cerrar().then(() => { panel.style.transform = ''; }); else panel.style.transform = '';
    };
    [asa, cab].forEach(z => {
      z.addEventListener('pointerdown', inicio);
      z.addEventListener('pointermove', mover);
      z.addEventListener('pointerup', soltar);
      z.addEventListener('pointercancel', soltar);
    });
    hoja = {
      el: panel, cuerpo, cerrar, quitar,
      poner(c, t) { titulo.textContent = t || ''; cuerpo.innerHTML = ''; cuerpo.append(...[].concat(c).filter(Boolean)); cuerpo.scrollTop = 0; },
    };
    hoja.poner(contenido, o.titulo);
    document.body.append(capa);
    document.documentElement.classList.add('hoja-abierta');
    document.addEventListener('keydown', teclas, true);
    history.pushState(Object.assign({}, history.state, { hoja: idT }), '');
    void capa.offsetWidth;  // fuerza el estilo inicial para que se vea la transición
    capa.classList.add('abierta');
    (o.foco || panel).focus({ preventScroll: true });
    return hoja;
  }
  window.addEventListener('popstate', (e) => {
    if (hoja && !(e.state && e.state.hoja)) hoja.quitar();
  });
  // Al cambiar de página (hashchange) se quita cualquier hoja sin tocar el historial.
  const cerrarHoja = () => { if (hoja) hoja.quitar(); };

  // ───────────── Chips ─────────────
  // opciones: [{valor, texto, color}]; o: {multiple, valor, etiqueta, alCambiar(seleccion, tocado) → nueva selección opcional}.
  function chips(opciones, o) {
    o = o || {};
    let sel = new Set([].concat(o.valor === undefined || o.valor === null ? [] : o.valor).map(String));
    const cont = html('div', { class: 'chips', role: 'group', 'aria-label': o.etiqueta || 'Filtros' });
    const pintar = () => cont.querySelectorAll('.chip').forEach(b => b.setAttribute('aria-pressed', String(sel.has(b.dataset.v))));
    opciones.forEach(op => {
      const v = String(op.valor);
      cont.append(html('button', {
        type: 'button', class: 'chip', 'data-v': v, style: op.color ? `--c: ${op.color}` : null, title: op.titulo || null,
        onclick: () => {
          if (o.multiple) { if (sel.has(v)) sel.delete(v); else sel.add(v); } else sel = new Set([v]);
          if (o.alCambiar) {
            const r = o.alCambiar(o.multiple ? [...sel] : v, v);
            if (r !== undefined) sel = new Set([].concat(r === null ? [] : r).map(String));
          }
          pintar();
        },
      }, op.color ? html('span', { class: 'punto-bloque', 'aria-hidden': 'true' }) : null, op.texto));
    });
    cont.poner = (v) => { sel = new Set([].concat(v === undefined || v === null ? [] : v).map(String)); pintar(); };
    pintar();
    return cont;
  }

  // ───────────── Aviso breve (snackbar) ─────────────
  let avisoEl = null, avisoT = 0;
  function aviso(texto, o) {
    o = o || {};
    if (!avisoEl) { avisoEl = html('div', { class: 'aviso-flotante', role: 'status', 'aria-live': 'polite' }); document.body.append(avisoEl); }
    avisoEl.innerHTML = '';
    avisoEl.append(html('span', { text: texto }));
    if (o.accion) avisoEl.append(html('button', { type: 'button', class: 'aviso-accion', onclick: () => { ocultar(); o.alAccion && o.alAccion(); } }, o.accion));
    avisoEl.classList.add('visible');
    clearTimeout(avisoT);
    const ocultar = () => avisoEl.classList.remove('visible');
    avisoT = setTimeout(ocultar, o.duracion || 3500);
  }

  // ───────────── Cabecera que se oculta al bajar y reaparece al subir (solo < 1024 px) ─────────────
  const reducido = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  let yPrev = window.scrollY, pendiente = false;
  window.addEventListener('scroll', () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => {
      pendiente = false;
      const y = window.scrollY, d = y - yPrev;
      if (!esMovil() || y < 56) document.body.classList.remove('cab-oculta');
      else if (d > 6 && !hoja) document.body.classList.add('cab-oculta');
      else if (d < -6) document.body.classList.remove('cab-oculta');
      if (Math.abs(d) > 6 || y < 56) yPrev = y;
    });
  }, { passive: true });

  window.UI = { hojaInferior, cerrarHoja, chips, aviso, esMovil, mqMovil };
})();
