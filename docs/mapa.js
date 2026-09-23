// Atlas de IA · mapa: constelación (grafo de fuerzas determinista) y diagrama de red por capas de las rutas.
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const reducido = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function el(tag, attrs, padre) {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) if (v !== undefined && v !== null) { if (k === 'text') e.textContent = v; else e.setAttribute(k, v); }
    if (padre) padre.appendChild(e);
    return e;
  }
  // Parte un nombre en líneas de como mucho `ancho` caracteres (máximo `max` líneas).
  function lineas(texto, ancho, max) {
    const out = [];
    let actual = '';
    texto.split(/\s+/).forEach(p => {
      if (!actual) actual = p;
      else if ((actual + ' ' + p).length <= ancho) actual += ' ' + p;
      else { out.push(actual); actual = p; }
    });
    if (actual) out.push(actual);
    if (out.length > max) { out.length = max; out[max - 1] = out[max - 1].replace(/.{0,1}$/, '…'); }
    return out;
  }
  function etiqueta(padre, x, y, texto, ancho, max, clase) {
    const t = el('text', { x, y, class: clase, 'text-anchor': 'middle' }, padre);
    lineas(texto, ancho, max).forEach((l, k) => el('tspan', { x, dy: k ? '1.15em' : 0, text: l }, t));
    return t;
  }

  // ───────────── Disposición de la constelación (una sola vez por carga) ─────────────
  let cache = null;
  function disponer(I, api) {
    if (cache) return cache;
    const bloques = Object.keys(I.bloques);
    // Anclas en una elipse, en orden B1 → B8 y en sentido horario; cada bloque ocupa un arco proporcional a √(n.º de conceptos).
    const RX = 430, RY = 310;
    const peso = {}, ancla = {};
    bloques.forEach(b => { peso[b] = Math.sqrt(I.conceptos.filter(c => c.bloque === b).length) + 1; });
    const total = bloques.reduce((s, b) => s + peso[b], 0);
    let acum = 0;
    bloques.forEach(b => {
      const a = -Math.PI / 2 + 2 * Math.PI * (acum + peso[b] / 2) / total;
      acum += peso[b];
      ancla[b] = { x: RX * Math.cos(a), y: RY * Math.sin(a) };
    });
    const r = api.aleatorio(20260924);
    const N = I.conceptos.map(c => ({
      id: c.id, b: c.bloque,
      x: ancla[c.bloque].x + (r() - 0.5) * 120, y: ancla[c.bloque].y + (r() - 0.5) * 120,
      rad: 4.5 + 2.6 * Math.sqrt(c.desbloquea.length),
    }));
    const idx = {};
    N.forEach((n, i) => { idx[n.id] = i; });
    const E = [];
    I.conceptos.forEach(c => c.prerequisitos.forEach(p => { if (idx[p] !== undefined) E.push([idx[p], idx[c.id]]); }));
    const n = N.length, fx = new Float64Array(n), fy = new Float64Array(n);
    const REP = 60, ANC = 0.06, LARGO = 42, IT = 300;
    for (let it = 0; it < IT; it++) {
      fx.fill(0); fy.fill(0);
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx = N[i].x - N[j].x, dy = N[i].y - N[j].y, d2 = dx * dx + dy * dy + 0.01;
          if (d2 > 90000) continue;
          const d = Math.sqrt(d2), minimo = N[i].rad + N[j].rad + 10;
          let f = REP / d;
          if (d < minimo) f += (minimo - d) * 0.6;
          fx[i] += dx / d * f; fy[i] += dy / d * f; fx[j] -= dx / d * f; fy[j] -= dy / d * f;
        }
      }
      E.forEach(([a, b]) => {
        const dx = N[b].x - N[a].x, dy = N[b].y - N[a].y, d = Math.sqrt(dx * dx + dy * dy) + 0.01;
        const f = (N[a].b === N[b].b ? 0.03 : 0.0005) * (d - LARGO);
        fx[a] += dx / d * f; fy[a] += dy / d * f; fx[b] -= dx / d * f; fy[b] -= dy / d * f;
      });
      const temp = 14 * (1 - it / IT) + 0.4;
      N.forEach((p, i) => {
        fx[i] += (ancla[p.b].x - p.x) * ANC; fy[i] += (ancla[p.b].y - p.y) * ANC;
        const m = Math.hypot(fx[i], fy[i]), s = m > temp ? temp / m : 1;
        p.x += fx[i] * s; p.y += fy[i] * s;
      });
    }
    const caja = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    N.forEach(p => { caja.x0 = Math.min(caja.x0, p.x - 40); caja.x1 = Math.max(caja.x1, p.x + 40); caja.y0 = Math.min(caja.y0, p.y - 20); caja.y1 = Math.max(caja.y1, p.y + 30); });
    // La etiqueta de cada bloque flota por fuera de su cúmulo, en la dirección de su ancla.
    const centros = bloques.map(b => {
      const ps = N.filter(p => p.b === b);
      const cx = ps.reduce((s, p) => s + p.x, 0) / ps.length, cy = ps.reduce((s, p) => s + p.y, 0) / ps.length;
      const a = Math.atan2(ancla[b].y / RY, ancla[b].x / RX), ux = Math.cos(a), uy = Math.sin(a);
      const ext = Math.max(...ps.map(p => (p.x - cx) * ux + (p.y - cy) * uy + p.rad)) + 16;
      return { b, x: cx + ux * ext, y: cy + uy * ext + (uy > 0.3 ? 18 : 0), ancla: ux > 0.35 ? 'start' : ux < -0.35 ? 'end' : 'middle' };
    });
    // Etiquetas visibles sin zoom: las de los nodos más grandes que no choquen entre sí.
    const cajas = centros.map(c => {
      const w = (c.b.length + 3 + I.bloques[c.b].length) * 8.2;
      const x0 = c.ancla === 'start' ? c.x : c.ancla === 'end' ? c.x - w : c.x - w / 2;
      return { x0, x1: x0 + w, y0: c.y - 14, y1: c.y + 4 };
    });
    cajas.forEach(k => { caja.x0 = Math.min(caja.x0, k.x0); caja.x1 = Math.max(caja.x1, k.x1); caja.y0 = Math.min(caja.y0, k.y0); caja.y1 = Math.max(caja.y1, k.y1); });
    const M = 24;
    const vb = { x: caja.x0 - M, y: caja.y0 - M, w: caja.x1 - caja.x0 + 2 * M, h: caja.y1 - caja.y0 + 2 * M };
    const choca = (q) => cajas.some(k => q.x0 < k.x1 && q.x1 > k.x0 && q.y0 < k.y1 && q.y1 > k.y0) || N.some(p => Math.abs(p.x - (q.x0 + q.x1) / 2) < (q.x1 - q.x0) / 2 + p.rad && p.y + p.rad > q.y0 && p.y - p.rad < q.y1);
    let conEtq = 0;
    N.slice().sort((a, b) => b.rad - a.rad).forEach(p => {
      if (conEtq >= 18) return;
      const ancho = Math.min(30, I.conceptos[idx[p.id]].nombre.length) * 5.6;
      const q = { x0: p.x - ancho / 2, x1: p.x + ancho / 2, y0: p.y + p.rad + 1, y1: p.y + p.rad + 15 };
      if (!choca(q)) { cajas.push(q); p.etiqueta = true; conEtq++; }
    });
    cache = { N, E, idx, vb, centros };
    return cache;
  }

  // ───────────── Constelación ─────────────
  function constelacion(cont, ctx, opc) {
    const { I, C, estado, api, ESTADOS } = ctx;
    const L = disponer(I, api);
    const { N, E, vb } = L;
    const marco = document.createElement('div');
    marco.className = 'constelacion';
    const svg = el('svg', { class: 'const-svg', viewBox: `${vb.x} ${vb.y} ${vb.w} ${vb.h}`, preserveAspectRatio: 'xMidYMid meet', role: 'group', 'aria-label': 'Constelación de conceptos: usa Tab para recorrerlos y Enter para abrir una ficha' });
    const capa = el('g', {}, svg);
    const gA = el('g', { class: 'const-aristas' }, capa);
    const gB = el('g', { class: 'const-bloques', 'aria-hidden': 'true' }, capa);
    const gN = el('g', { class: 'const-nodos' }, capa);
    L.centros.forEach(c => el('text', { x: c.x, y: c.y, class: 'const-bloque', 'text-anchor': c.ancla, style: `--c: var(--${c.b})`, text: `${c.b} · ${I.bloques[c.b]}` }, gB));
    const aristas = E.map(([a, b]) => {
      const p = N[a], q = N[b], mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
      const cx = mx - (q.y - p.y) * 0.18, cy = my + (q.x - p.x) * 0.18;
      return { a: p.id, b: q.id, e: el('path', { d: `M${p.x.toFixed(1)},${p.y.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${q.x.toFixed(1)},${q.y.toFixed(1)}`, class: 'const-arista', style: `--c: var(--${q.b})` }, gA) };
    });
    const nodos = {};
    I.orden.forEach(id => {
      const p = N[L.idx[id]];
      if (!p) return;
      const e = estado(id), c = C[id];
      const a = el('a', { href: '#' + id, class: `const-nodo ${e}${p.etiqueta ? ' grande' : ''}`, 'data-id': id, style: `--c: var(--${p.b})`, 'aria-label': `${c.nombre} · ${ESTADOS[e]}` }, gN);
      if (e === 'dominada') el('circle', { cx: p.x, cy: p.y, r: p.rad + 5, class: 'const-halo' }, a);
      el('circle', { cx: p.x, cy: p.y, r: p.rad, class: 'const-punto' }, a);
      el('text', { x: p.x, y: p.y + p.rad + 11, class: 'const-etq', 'text-anchor': 'middle', text: c.nombre.length > 30 ? c.nombre.slice(0, 28).replace(/[\s,:;(]+\S*$/, '') + '…' : c.nombre }, a);
      nodos[id] = a;
    });
    const tip = document.createElement('div');
    tip.className = 'const-tip';
    tip.hidden = true;
    tip.setAttribute('role', 'tooltip');
    marco.append(svg, tip);
    cont.append(marco);

    // ── Zoom y desplazamiento ──
    let k = 1, tx = 0, ty = 0, anim = 0;
    const pxPorUnidad = () => { const r = svg.getBoundingClientRect(); return Math.min(r.width / vb.w, r.height / vb.h) || 1; };
    function aplicar() {
      capa.setAttribute('transform', `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${k.toFixed(4)})`);
      const z = pxPorUnidad() * k;
      svg.style.setProperty('--z', z.toFixed(3));
      svg.classList.toggle('cerca', z >= 1.5);
    }
    function punto(cx, cy) {
      const m = svg.getScreenCTM();
      if (!m) return { x: 0, y: 0 };
      const p = svg.createSVGPoint(); p.x = cx; p.y = cy;
      return p.matrixTransform(m.inverse());
    }
    function zoomEn(p, factor) {
      const k2 = Math.max(0.6, Math.min(8, k * factor));
      tx = p.x - (p.x - tx) * (k2 / k); ty = p.y - (p.y - ty) * (k2 / k); k = k2;
      aplicar();
    }
    function animarA(k2, tx2, ty2) {
      cancelAnimationFrame(anim);
      if (reducido()) { k = k2; tx = tx2; ty = ty2; aplicar(); return; }
      const k0 = k, x0 = tx, y0 = ty, t0 = performance.now(), dur = 450;
      const paso = (t) => {
        const u = Math.min(1, (t - t0) / dur), s = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        k = k0 + (k2 - k0) * s; tx = x0 + (tx2 - x0) * s; ty = y0 + (ty2 - y0) * s;
        aplicar();
        if (u < 1) anim = requestAnimationFrame(paso);
      };
      anim = requestAnimationFrame(paso);
    }
    const centro = { x: vb.x + vb.w / 2, y: vb.y + vb.h / 2 };
    const centrar = () => animarA(1, 0, 0);
    function irA(id, k2) {
      const p = N[L.idx[id]];
      animarA(k2, centro.x - p.x * k2, centro.y - p.y * k2);
    }
    svg.addEventListener('wheel', (e) => { e.preventDefault(); cancelAnimationFrame(anim); zoomEn(punto(e.clientX, e.clientY), Math.exp(-e.deltaY * 0.0015)); }, { passive: false });
    const punteros = new Map();
    let movido = false, inicio = null, pinza = null;
    svg.addEventListener('pointerdown', (e) => {
      punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
      movido = false; inicio = { x: e.clientX, y: e.clientY };
      cancelAnimationFrame(anim);
      if (punteros.size === 2) {
        const [p1, p2] = [...punteros.values()];
        pinza = { d: Math.hypot(p1.x - p2.x, p1.y - p2.y), x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      }
    });
    svg.addEventListener('pointermove', (e) => {
      const prev = punteros.get(e.pointerId);
      if (!prev) return;
      punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (!movido && Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y) > 4) { movido = true; try { svg.setPointerCapture(e.pointerId); } catch (x) { /* nada */ } }
      if (!movido) return;
      if (punteros.size === 2 && pinza) {
        const [p1, p2] = [...punteros.values()];
        const d = Math.hypot(p1.x - p2.x, p1.y - p2.y), mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
        const s = pxPorUnidad();
        tx += (mx - pinza.x) / s; ty += (my - pinza.y) / s;
        zoomEn(punto(mx, my), d / (pinza.d || d));
        pinza = { d, x: mx, y: my };
      } else if (punteros.size === 1) {
        const s = pxPorUnidad();
        tx += (e.clientX - prev.x) / s; ty += (e.clientY - prev.y) / s;
        aplicar();
      }
    });
    const soltar = (e) => { punteros.delete(e.pointerId); if (punteros.size < 2) pinza = null; };
    svg.addEventListener('pointerup', soltar);
    svg.addEventListener('pointercancel', soltar);
    svg.addEventListener('click', (e) => { if (movido) { e.preventDefault(); e.stopPropagation(); movido = false; } }, true);
    svg.addEventListener('dragstart', (e) => e.preventDefault());

    // ── Resaltado: cadena de requisitos + lo que desbloquea ──
    let fijado = null, ruta = null;
    function ancestros(id) {
      const s = new Set(), pila = [...C[id].prerequisitos];
      while (pila.length) { const x = pila.pop(); if (!s.has(x) && C[x]) { s.add(x); pila.push(...C[x].prerequisitos); } }
      return s;
    }
    function limpiar() {
      svg.classList.remove('resaltando');
      Object.values(nodos).forEach(a => a.classList.remove('act', 'foco'));
      aristas.forEach(x => x.e.classList.remove('anc', 'des', 'ruta'));
    }
    function resaltar(id) {
      limpiar();
      const anc = ancestros(id), des = new Set(C[id].desbloquea);
      svg.classList.add('resaltando');
      Object.entries(nodos).forEach(([x, a]) => a.classList.toggle('act', x === id || anc.has(x) || des.has(x)));
      nodos[id].classList.add('foco');
      aristas.forEach(x => {
        if ((x.b === id || anc.has(x.b)) && anc.has(x.a)) x.e.classList.add('anc');
        else if (x.a === id && des.has(x.b)) x.e.classList.add('des');
      });
    }
    function marcarRuta() {
      limpiar();
      if (!ruta) return;
      svg.classList.add('resaltando');
      Object.entries(nodos).forEach(([x, a]) => a.classList.toggle('act', ruta.has(x)));
      aristas.forEach(x => x.e.classList.toggle('ruta', ruta.has(x.a) && ruta.has(x.b)));
    }
    const restaurar = () => { if (fijado) resaltar(fijado); else marcarRuta(); };
    function mostrarTip(id) {
      const c = C[id], a = nodos[id], r = a.querySelector('.const-punto').getBoundingClientRect(), base = marco.getBoundingClientRect();
      tip.innerHTML = '';
      tip.append(Object.assign(document.createElement('b'), { textContent: c.nombre }));
      const f = document.createElement('span');
      if (c.frase) f.innerHTML = c.frase; else { f.className = 'suave'; f.textContent = `Pendiente · lote ${c.lote}`; }
      tip.append(f);
      tip.hidden = false;
      const ancho = Math.min(300, base.width - 16);
      tip.style.maxWidth = ancho + 'px';
      let x = r.left - base.left + r.width / 2 - ancho / 2;
      x = Math.max(8, Math.min(x, base.width - ancho - 8));
      const abajo = r.top - base.top < base.height * 0.4;
      tip.style.left = x + 'px';
      tip.style.top = abajo ? (r.bottom - base.top + 10) + 'px' : '';
      tip.style.bottom = abajo ? '' : (base.bottom - r.top + 10) + 'px';
      api.tex(tip);
    }
    const ocultarTip = () => { tip.hidden = true; };
    svg.addEventListener('pointerover', (e) => {
      if (e.pointerType === 'touch') return;
      const a = e.target.closest('.const-nodo');
      if (a) { resaltar(a.dataset.id); mostrarTip(a.dataset.id); }
    });
    svg.addEventListener('pointerout', (e) => {
      const a = e.target.closest('.const-nodo');
      if (a && !a.contains(e.relatedTarget)) { ocultarTip(); restaurar(); }
    });
    svg.addEventListener('focusin', (e) => {
      const a = e.target.closest('.const-nodo');
      if (!a) return;
      const r = a.getBoundingClientRect(), s = svg.getBoundingClientRect();
      if (r.left < s.left || r.right > s.right || r.top < s.top || r.bottom > s.bottom) irA(a.dataset.id, Math.max(k, 1.4));
      resaltar(a.dataset.id); mostrarTip(a.dataset.id);
    });
    svg.addEventListener('focusout', (e) => { if (!svg.contains(e.relatedTarget)) { ocultarTip(); restaurar(); } });
    svg.addEventListener('keydown', (e) => {
      const a = e.target.closest && e.target.closest('.const-nodo');
      if (a && e.key === 'Enter') { e.preventDefault(); location.hash = '#' + a.dataset.id; }
    });

    const ro = window.ResizeObserver ? new ResizeObserver(aplicar) : null;
    if (ro) ro.observe(svg);
    aplicar();
    return {
      centrar,
      buscar(id) { fijado = id; resaltar(id); irA(id, 2.6); },
      soltar() { fijado = null; restaurar(); },
      ruta(ids) { ruta = ids ? new Set(ids) : null; restaurar(); },
    };
  }

  // ───────────── Diagrama de red por capas (rutas) ─────────────
  function redRuta(ids, ctx, opc) {
    const { C, estado, dominada, ESTADOS } = ctx;
    const vertical = !!(opc && opc.vertical);
    const en = new Set(ids);
    const reqs = (id) => C[id].prerequisitos.filter(p => en.has(p));
    const sucs = (id) => C[id].desbloquea.filter(d => en.has(d));
    const capa = {}, capas = [];
    ids.forEach(id => { const ps = reqs(id); capa[id] = ps.length ? 1 + Math.max(...ps.map(p => capa[p])) : 0; });
    ids.forEach(id => (capas[capa[id]] = capas[capa[id]] || []).push(id));
    // Heurística del baricentro: 3 pasadas (bajada, subida, bajada) para reducir cruces.
    const pos = {};
    const numerar = () => capas.forEach(c => c.forEach((id, i) => { pos[id] = (i + 0.5) / c.length; }));
    const ordenar = (c, vecinos) => {
      const clave = {};
      c.forEach(id => { const v = vecinos(id); clave[id] = v.length ? v.reduce((s, x) => s + pos[x], 0) / v.length : pos[id]; });
      c.sort((a, b) => clave[a] - clave[b]);
    };
    numerar();
    for (let pasada = 0; pasada < 3; pasada++) {
      if (pasada % 2 === 0) for (let l = 1; l < capas.length; l++) { ordenar(capas[l], reqs); numerar(); }
      else for (let l = capas.length - 2; l >= 0; l--) { ordenar(capas[l], sucs); numerar(); }
    }
    const sig = ids.find(id => !dominada(id) && C[id].prerequisitos.every(dominada)) || null;
    const maxN = Math.max(...capas.map(c => c.length));
    const R = 9, M = vertical ? 20 : 50;
    // En horizontal, las columnas se estrechan (hasta 112 px) para que la red quepa en el ancho disponible.
    const disponible = (opc && opc.ancho) || 1100;
    const PASO_CAPA = vertical ? 96 : Math.max(112, Math.min(150, (disponible - 2 * M - 90) / Math.max(1, capas.length - 1)));
    const PASO_NODO = vertical ? Math.max(72, Math.min(104, (disponible - M) / maxN)) : 74;
    const anchoEtq = vertical ? (PASO_NODO < 95 ? 12 : 14) : PASO_CAPA < 135 ? 17 : 20;
    const largo = maxN * PASO_NODO;
    const xy = {};
    capas.forEach((c, l) => c.forEach((id, i) => {
      const a = M + l * PASO_CAPA + (vertical ? 24 : 30), b = M / 2 + (largo - c.length * PASO_NODO) / 2 + (i + 0.5) * PASO_NODO;
      xy[id] = vertical ? { x: b, y: a } : { x: a, y: b };
    }));
    const W = vertical ? largo + M : M + (capas.length - 1) * PASO_CAPA + 90 + M;
    const H = vertical ? M + (capas.length - 1) * PASO_CAPA + 70 + M / 2 : largo + M;
    const svg = el('svg', { class: 'red-ruta-svg' + (vertical ? ' vertical' : ''), width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: 'group', 'aria-label': `Diagrama de la ruta: ${ids.length} conceptos en ${capas.length} niveles` });
    const gA = el('g', {}, svg), gN = el('g', {}, svg);
    ids.forEach(id => reqs(id).forEach(p => {
      const a = xy[p], b = xy[id];
      const d = vertical
        ? `M${a.x},${a.y + R} C${a.x},${(a.y + b.y) / 2} ${b.x},${(a.y + b.y) / 2} ${b.x},${b.y - R}`
        : `M${a.x + R},${a.y} C${(a.x + b.x) / 2},${a.y} ${(a.x + b.x) / 2},${b.y} ${b.x - R},${b.y}`;
      el('path', { d, class: 'red-arista' + (dominada(p) && dominada(id) ? ' dom' : '') + (id === sig ? ' hacia-sig' : ''), style: `--c: var(--${C[p].bloque})` }, gA);
    }));
    ids.forEach(id => {
      const { x, y } = xy[id], e = estado(id), c = C[id];
      const a = el('a', { href: '#' + id, class: `red-nodo const-nodo ${e}${id === sig ? ' siguiente' : ''}`, style: `--c: var(--${c.bloque})`, 'aria-label': `${c.nombre} · ${ESTADOS[e]}${id === sig ? ' · siguiente paso recomendado' : ''}` }, gN);
      el('title', { text: `${c.nombre} · ${ESTADOS[e]}` }, a);
      if (id === sig) el('circle', { cx: x, cy: y, r: R + 6, class: 'red-sig' }, a);
      if (e === 'dominada') el('circle', { cx: x, cy: y, r: R + 4, class: 'const-halo' }, a);
      el('circle', { cx: x, cy: y, r: R, class: 'const-punto' }, a);
      etiqueta(a, x, y + R + 14, c.nombre, anchoEtq, 3, 'red-etq');
      if (id === sig) el('text', { x, y: y - R - 9, class: 'red-sig-etq', 'text-anchor': 'middle', text: 'Siguiente' }, a);
    });
    if (vertical) {
      // En móvil encoge hasta un 75 % para caber; si aun así no cabe, se desplaza en horizontal.
      svg.style.width = '100%'; svg.style.height = 'auto';
      svg.style.maxWidth = W + 'px'; svg.style.minWidth = Math.round(W * 0.75) + 'px';
    }
    const envoltorio = document.createElement('div');
    envoltorio.className = 'red-ruta';
    envoltorio.append(svg);
    return envoltorio;
  }

  window.AtlasMapa = { constelacion, redRuta };
})();
