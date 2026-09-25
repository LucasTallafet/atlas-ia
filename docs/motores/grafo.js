// @modos: diagrama, conocimiento, red-bayesiana
// Motor "grafo": nodos y aristas clicables. diagrama/red-bayesiana ordenan los nodos por capas
// (profundidad = distancia máxima desde una raíz siguiendo las aristas a→b); conocimiento usa
// un diseño de fuerzas (repulsión + muelles en las aristas) calculado una vez y normalizado a [0,1].
(function () {
  'use strict';
  let CONTADOR = 0;

  // ───────────── Texto y tamaño de las cajas ─────────────
  function envolver(texto) {
    const t = String(texto);
    if (t.length <= 15) return [t];
    const palabras = t.split(' ');
    if (palabras.length < 2) return [t];
    let mejor = null, mejorDif = Infinity;
    for (let i = 1; i < palabras.length; i++) {
      const l1 = palabras.slice(0, i).join(' '), l2 = palabras.slice(i).join(' ');
      const dif = Math.abs(l1.length - l2.length);
      if (dif < mejorDif) { mejorDif = dif; mejor = [l1, l2]; }
    }
    return mejor;
  }
  function medirCaja(etiqueta, altoExtra) {
    const lineas = envolver(etiqueta);
    const maxLen = Math.max(...lineas.map(l => l.length));
    const w = Math.max(84, Math.min(172, maxLen * 7.3 + 28));
    const h = (lineas.length > 1 ? 50 : 38) + (altoExtra || 0);
    return { lineas, w, h };
  }

  // ───────────── Capas topológicas (a→b: b va después de a) ─────────────
  function calcularCapas(nodos, aristas) {
    const padres = {};
    nodos.forEach(n => { padres[n.id] = []; });
    aristas.forEach(([a, b]) => { if (padres[b]) padres[b].push(a); });
    const profundidad = {};
    function prof(id, pila) {
      if (profundidad[id] !== undefined) return profundidad[id];
      if (pila.has(id)) return (profundidad[id] = 0); // ciclo inesperado: se corta aquí
      pila.add(id);
      const ps = padres[id] || [];
      const d = ps.length ? Math.max(...ps.map(pid => prof(pid, pila) + 1)) : 0;
      pila.delete(id);
      return (profundidad[id] = d);
    }
    nodos.forEach(n => prof(n.id, new Set()));
    const nCapas = Math.max(0, ...Object.values(profundidad)) + 1;
    const capas = Array.from({ length: nCapas }, () => []);
    nodos.forEach(n => capas[profundidad[n.id]].push(n.id));
    for (let k = 1; k < capas.length; k++) {
      const posPrev = {};
      capas[k - 1].forEach((id, i) => { posPrev[id] = i; });
      capas[k].sort((a, b) => {
        const pa = (padres[a] || []).map(pid => posPrev[pid] || 0);
        const pb = (padres[b] || []).map(pid => posPrev[pid] || 0);
        const ma = pa.length ? pa.reduce((s, v) => s + v, 0) / pa.length : 0;
        const mb = pb.length ? pb.reduce((s, v) => s + v, 0) / pb.length : 0;
        return ma - mb;
      });
    }
    return { profundidad, capas };
  }

  // Tamaño mínimo para que ninguna caja se solape ni se salga, aunque el contenedor sea estrecho
  // (el SVG se escala hacia abajo con CSS si el intrínseco no cabe, así que aquí solo evitamos que sea demasiado pequeño).
  // margen = la mitad de la caja más ancha de todo el grafo + relleno: así, tanto el hueco entre dos
  // capas cualesquiera como el borde exterior tienen sitio de sobra sea cual sea su orden.
  function tamaño(el, capas, cajas, horizontal) {
    const lado = (id) => (horizontal ? cajas[id].w : cajas[id].h);
    const ladoCruzado = (id) => (horizontal ? cajas[id].h : cajas[id].w);
    const maxLado = Math.max(...capas.flat().map(lado));
    const gap = 22, gapCruzado = 14, margen = 18 + maxLado / 2;
    const principal = capas.length === 1 ? margen * 2 + maxLado : margen * 2 + (capas.length - 1) * (maxLado + gap);
    const cruzado = Math.max(...capas.map(ids => ids.reduce((s, id) => s + ladoCruzado(id) + gapCruzado, 0) + gapCruzado));
    const base = Math.max(320, Math.min(el.clientWidth || 640, 760));
    if (horizontal) return { ancho: Math.max(base, principal), alto: Math.max(150, Math.min(cruzado, 420)), margen };
    return { ancho: Math.max(base, Math.min(cruzado, 760)), alto: Math.max(150, Math.min(principal, 480)), margen };
  }
  function posicionar(capas, cajas, ancho, alto, horizontal, margen) {
    const nCapas = capas.length;
    const pos = {};
    capas.forEach((ids, k) => {
      const principal = nCapas === 1 ? (horizontal ? ancho / 2 : alto / 2)
        : margen + k * ((horizontal ? ancho : alto) - 2 * margen) / (nCapas - 1);
      const m = ids.length;
      ids.forEach((id, i) => {
        const cruzado = (horizontal ? alto : ancho) * (i + 1) / (m + 1);
        const caja = cajas[id];
        pos[id] = horizontal
          ? { x: principal, y: cruzado, w: caja.w, h: caja.h, lineas: caja.lineas }
          : { x: cruzado, y: principal, w: caja.w, h: caja.h, lineas: caja.lineas };
      });
    });
    return pos;
  }

  // ───────────── Diseño de fuerzas (modo conocimiento): se calcula una vez, normalizado a [0,1] ─────────────
  function layoutFuerza(nodos, aristas, api) {
    const ids = nodos.map(n => n.id), n = ids.length;
    const r = api.aleatorio(11);
    const pos = {}, vel = {};
    ids.forEach((id, i) => {
      const ang = 2 * Math.PI * i / Math.max(1, n);
      pos[id] = [0.5 + 0.32 * Math.cos(ang) + (r() - 0.5) * 0.05, 0.5 + 0.32 * Math.sin(ang) + (r() - 0.5) * 0.05];
      vel[id] = [0, 0];
    });
    for (let it = 0; it < 220; it++) {
      const fuerza = {};
      ids.forEach(id => { fuerza[id] = [0, 0]; });
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const a = ids[i], b = ids[j];
          const dx = pos[a][0] - pos[b][0], dy = pos[a][1] - pos[b][1];
          const d2 = Math.max(1e-4, dx * dx + dy * dy), d = Math.sqrt(d2), f = 0.012 / d2;
          fuerza[a][0] += f * dx / d; fuerza[a][1] += f * dy / d;
          fuerza[b][0] -= f * dx / d; fuerza[b][1] -= f * dy / d;
        }
      }
      aristas.forEach(([a, b]) => {
        if (!pos[a] || !pos[b]) return;
        const dx = pos[b][0] - pos[a][0], dy = pos[b][1] - pos[a][1], d = Math.max(1e-4, Math.hypot(dx, dy));
        const f = (d - 0.32) * 0.05;
        fuerza[a][0] += f * dx / d; fuerza[a][1] += f * dy / d;
        fuerza[b][0] -= f * dx / d; fuerza[b][1] -= f * dy / d;
      });
      ids.forEach(id => {
        fuerza[id][0] += (0.5 - pos[id][0]) * 0.006;
        fuerza[id][1] += (0.5 - pos[id][1]) * 0.006;
        vel[id][0] = (vel[id][0] + fuerza[id][0]) * 0.75;
        vel[id][1] = (vel[id][1] + fuerza[id][1]) * 0.75;
        pos[id][0] += vel[id][0]; pos[id][1] += vel[id][1];
      });
    }
    const xs = ids.map(id => pos[id][0]), ys = ids.map(id => pos[id][1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const kx = x1 - x0 > 1e-6 ? 0.84 / (x1 - x0) : 1, ky = y1 - y0 > 1e-6 ? 0.84 / (y1 - y0) : 1;
    const out = {};
    ids.forEach(id => { out[id] = [0.08 + (pos[id][0] - x0) * kx, 0.08 + (pos[id][1] - y0) * ky]; });
    return out;
  }

  // ───────────── Dibujo compartido ─────────────
  function crearMarcador(api, s, c, id) {
    const defs = api.el('defs', {}, s);
    const m = api.el('marker', { id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
    api.el('path', { d: 'M0,0 L10,5 L0,10 z', fill: c.suave }, m);
  }
  function dibujarCaja(api, g, c, cx, cy, w, h, lineas, opts) {
    opts = opts || {};
    const rect = api.el('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: 8, fill: opts.fill || c.superficie, stroke: opts.stroke || c.linea, 'stroke-width': opts.grosor || 1.3 }, g);
    const n = lineas.length;
    lineas.forEach((linea, i) => {
      api.el('text', { x: cx, y: cy - (n - 1) * 7 + i * 14 + 4, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': opts.negrita ? 700 : 500, fill: opts.colorTexto || c.texto, text: linea, 'pointer-events': 'none' }, g);
    });
    return rect;
  }
  function aristaCaja(api, g, c, A, B, horizontal, idMarcador, etiqueta, atenuada) {
    const p0 = horizontal ? [A.x + A.w / 2, A.y] : [A.x, A.y + A.h / 2];
    const p1 = horizontal ? [B.x - B.w / 2, B.y] : [B.x, B.y - B.h / 2];
    api.el('line', { x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1], stroke: c.suave, 'stroke-width': 1.6, opacity: atenuada ? 0.22 : 0.8, 'marker-end': `url(#${idMarcador})` }, g);
    if (etiqueta) {
      const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
      api.el('text', { x: mx, y: my - 5, 'text-anchor': 'middle', 'font-size': 10, fill: c.suave, opacity: atenuada ? 0.3 : 1, 'paint-order': 'stroke', stroke: c.superficie, 'stroke-width': 3, text: etiqueta }, g);
    }
  }
  function aristaCirculo(api, g, c, pA, pB, radio, idMarcador, etiqueta, atenuada) {
    const dx = pB[0] - pA[0], dy = pB[1] - pA[1], d = Math.max(1e-4, Math.hypot(dx, dy));
    const ux = dx / d, uy = dy / d;
    const p0 = [pA[0] + ux * radio, pA[1] + uy * radio], p1 = [pB[0] - ux * radio, pB[1] - uy * radio];
    api.el('line', { x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1], stroke: c.suave, 'stroke-width': 1.5, opacity: atenuada ? 0.18 : 0.7, 'marker-end': `url(#${idMarcador})` }, g);
    if (etiqueta) {
      const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
      api.el('text', { x: mx, y: my - 5, 'text-anchor': 'middle', 'font-size': 10, fill: c.suave, opacity: atenuada ? 0.25 : 1, 'paint-order': 'stroke', stroke: c.superficie, 'stroke-width': 3, text: etiqueta }, g);
    }
  }
  function esVecino(aristas, a, b) { return aristas.some(([x, y]) => (x === a && y === b) || (x === b && y === a)); }
  function accesible(el2, fn) {
    el2.setAttribute('tabindex', '0');
    el2.setAttribute('role', 'button');
    el2.style.cursor = 'pointer';
    el2.addEventListener('click', fn);
    el2.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
  }

  // ───────────────────────── diagrama ─────────────────────────
  function modoDiagrama(el, p, api) {
    const H = api.html;
    const nodos = p.nodos, aristas = p.aristas || [];
    const nodoPorId = {}; nodos.forEach(n => { nodoPorId[n.id] = n; });
    const horizontal = p.direccion !== 'vertical';
    const { capas } = calcularCapas(nodos, aristas);
    const cajas = {}; nodos.forEach(n => { cajas[n.id] = medirCaja(n.etiqueta); });
    const idMarcador = 'flecha-grafo-' + (++CONTADOR);
    const E = { sel: null };

    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    el.append(grafica, lectura);

    function seleccionar(id) { E.sel = E.sel === id ? null : id; dibujar(); }

    function dibujar() {
      const c = api.colores();
      grafica.innerHTML = '';
      const dim = tamaño(el, capas, cajas, horizontal);
      const s = api.svg(dim.ancho, dim.alto);
      grafica.append(s);
      crearMarcador(api, s, c, idMarcador);
      const pos = posicionar(capas, cajas, dim.ancho, dim.alto, horizontal, dim.margen);
      const g = api.el('g', {}, s);
      aristas.forEach(([a, b, etq]) => {
        if (!pos[a] || !pos[b]) return;
        aristaCaja(api, g, c, pos[a], pos[b], horizontal, idMarcador, etq, E.sel && E.sel !== a && E.sel !== b);
      });
      nodos.forEach(n => {
        const q = pos[n.id], activo = E.sel === n.id, vecino = E.sel && esVecino(aristas, E.sel, n.id);
        const rect = dibujarCaja(api, g, c, q.x, q.y, q.w, q.h, q.lineas, {
          fill: activo ? c.acento : c.superficie,
          stroke: activo ? c.acento : (vecino ? c.suave : c.linea),
          grosor: activo ? 2.4 : (vecino ? 1.8 : 1.3),
          colorTexto: activo ? c.superficie : c.texto,
          negrita: activo,
        });
        rect.setAttribute('aria-label', n.etiqueta + (activo ? ', seleccionado' : ''));
        accesible(rect, () => seleccionar(n.id));
      });
      s.setAttribute('role', 'img');
      s.setAttribute('aria-label', 'Diagrama de proceso con ' + nodos.length + ' pasos.');

      if (E.sel) {
        const n = nodoPorId[E.sel];
        const partes = [`<p><strong>${n.etiqueta}</strong></p>`];
        if (n.nota) partes.push(`<p>${n.nota}</p>`);
        lectura.innerHTML = partes.join('');
        if (n.enlace) lectura.append(api.boton('Abrir ficha →', () => { location.hash = '#' + n.enlace; }));
      } else {
        lectura.innerHTML = '<p>Haz clic en un paso para ver su detalle.</p>';
      }
    }
    dibujar();
    return { redibujar: dibujar };
  }

  // ───────────────────────── conocimiento ─────────────────────────
  function modoConocimiento(el, p, api) {
    const H = api.html;
    const nodos = p.nodos, aristas = p.aristas || [];
    const nodoPorId = {}; nodos.forEach(n => { nodoPorId[n.id] = n; });
    const posNorm = layoutFuerza(nodos, aristas, api);
    const idMarcador = 'flecha-grafo-' + (++CONTADOR);
    const E = { sel: null };

    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    el.append(grafica, lectura);

    function seleccionar(id) { E.sel = E.sel === id ? null : id; dibujar(); }

    function dibujar() {
      const c = api.colores();
      grafica.innerHTML = '';
      const ancho = Math.max(300, Math.min(el.clientWidth || 560, 640));
      const alto = Math.max(240, Math.min(ancho * 0.78, 440));
      const s = api.svg(ancho, alto);
      grafica.append(s);
      crearMarcador(api, s, c, idMarcador);
      const radio = 20;
      const pos = {};
      nodos.forEach(n => {
        const [nx, ny] = posNorm[n.id];
        pos[n.id] = [16 + nx * (ancho - 32), 16 + ny * (alto - 32)];
      });
      const g = api.el('g', {}, s);
      aristas.forEach(([a, b, etq]) => {
        if (!pos[a] || !pos[b]) return;
        aristaCirculo(api, g, c, pos[a], pos[b], radio, idMarcador, etq, E.sel && E.sel !== a && E.sel !== b);
      });
      nodos.forEach((n, i) => {
        const [x, y] = pos[n.id], activo = E.sel === n.id, vecino = E.sel && esVecino(aristas, E.sel, n.id);
        const col = c.series[i % 8];
        const atenuado = E.sel && !activo && !vecino;
        const circ = api.el('circle', { cx: x, cy: y, r: radio, fill: activo ? col : c.superficie, stroke: col, 'stroke-width': activo ? 3 : (vecino ? 2.2 : 1.4), opacity: atenuado ? 0.35 : 1 }, g);
        api.el('text', { x, y: y + radio + 13, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': activo ? 700 : 500, fill: activo ? col : c.texto, opacity: atenuado ? 0.35 : 1, text: n.etiqueta }, g);
        circ.setAttribute('aria-label', n.etiqueta + (activo ? ', seleccionado' : ''));
        accesible(circ, () => seleccionar(n.id));
      });
      s.setAttribute('role', 'img');
      s.setAttribute('aria-label', 'Grafo de conocimiento con ' + nodos.length + ' conceptos.');

      if (E.sel) {
        const n = nodoPorId[E.sel];
        const partes = [`<p><strong>${n.etiqueta}</strong></p>`];
        if (n.nota) partes.push(`<p>${n.nota}</p>`);
        lectura.innerHTML = partes.join('');
        if (n.enlace) lectura.append(api.boton('Abrir ficha →', () => { location.hash = '#' + n.enlace; }));
      } else {
        lectura.innerHTML = '<p>Haz clic en un concepto para ver su relación con los demás.</p>';
      }
    }
    dibujar();
    return { redibujar: dibujar };
  }

  // ───────────────────────── red-bayesiana ─────────────────────────
  function probNodo(nodo, padresIds, asign) {
    const fila = nodo.tabla.find(f => padresIds.every(pid => f.dado[pid] === asign[pid]));
    if (!fila) throw new Error('Tabla incompleta para "' + nodo.id + '"');
    return asign[nodo.id] === 1 ? fila.p : 1 - fila.p;
  }
  function inferir(nodos, padresDe, evidencia) {
    const ids = nodos.map(n => n.id);
    const libres = ids.filter(id => !(id in evidencia));
    const nCombin = Math.pow(2, libres.length);
    const sumaUno = {}; ids.forEach(id => { sumaUno[id] = 0; });
    let normal = 0;
    for (let mask = 0; mask < nCombin; mask++) {
      const asign = Object.assign({}, evidencia);
      libres.forEach((id, i) => { asign[id] = (mask >> i) & 1; });
      let pj = 1;
      for (const n of nodos) pj *= probNodo(n, padresDe[n.id], asign);
      normal += pj;
      for (const id of ids) if (asign[id] === 1) sumaUno[id] += pj;
    }
    const out = {}; ids.forEach(id => { out[id] = normal > 0 ? sumaUno[id] / normal : NaN; });
    return out;
  }
  function modoRedBayesiana(el, p, api) {
    const H = api.html, num = api.num;
    const nodos = p.nodos, aristas = p.aristas || [];
    nodos.forEach(n => { if (!n.tabla) throw new Error('El nodo "' + n.id + '" necesita "tabla" en el modo red-bayesiana'); });
    const horizontal = p.direccion !== 'vertical';
    const { capas } = calcularCapas(nodos, aristas);
    const padresDe = {}; nodos.forEach(n => { padresDe[n.id] = []; });
    aristas.forEach(([a, b]) => { if (padresDe[b]) padresDe[b].push(a); });
    const valoresDe = (n) => (n.valores && n.valores.length === 2 ? n.valores : ['no', 'sí']);
    const cajas = {}; nodos.forEach(n => { cajas[n.id] = medirCaja(n.etiqueta, 20); });
    const idMarcador = 'flecha-grafo-' + (++CONTADOR);
    let evidencia = {};
    let M = inferir(nodos, padresDe, evidencia);

    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const controles = H('div', { class: 'motor-controles' });
    el.append(grafica, lectura, controles);
    controles.append(api.boton('Reiniciar (sin observaciones)', () => { evidencia = {}; M = inferir(nodos, padresDe, evidencia); dibujar(); }));

    function ciclar(id) {
      if (!(id in evidencia)) evidencia[id] = 1;
      else if (evidencia[id] === 1) evidencia[id] = 0;
      else delete evidencia[id];
      M = inferir(nodos, padresDe, evidencia);
      dibujar();
    }

    function dibujar() {
      const c = api.colores();
      grafica.innerHTML = '';
      const dim = tamaño(el, capas, cajas, horizontal);
      const s = api.svg(dim.ancho, dim.alto);
      grafica.append(s);
      crearMarcador(api, s, c, idMarcador);
      const pos = posicionar(capas, cajas, dim.ancho, dim.alto, horizontal, dim.margen);
      const g = api.el('g', {}, s);
      aristas.forEach(([a, b]) => { if (pos[a] && pos[b]) aristaCaja(api, g, c, pos[a], pos[b], horizontal, idMarcador, null, false); });
      nodos.forEach(n => {
        const q = pos[n.id], vals = valoresDe(n), obs = n.id in evidencia, p1 = M[n.id];
        const borde = obs ? (evidencia[n.id] === 1 ? c.acento : c.mal) : c.linea;
        const rect = dibujarCaja(api, g, c, q.x, q.y, q.w, q.h, q.lineas, { stroke: borde, grosor: obs ? 2.6 : 1.3 });
        const bw = q.w - 14, bx = q.x - bw / 2, by = q.y + q.h / 2 - 12;
        api.el('rect', { x: bx, y: by, width: bw, height: 7, rx: 3, fill: c.rejilla, 'pointer-events': 'none' }, g);
        api.el('rect', { x: bx, y: by, width: bw * Math.max(0, Math.min(1, p1)), height: 7, rx: 3, fill: obs ? borde : c.acento, 'pointer-events': 'none' }, g);
        api.el('text', { x: q.x, y: by - 4, 'text-anchor': 'middle', 'font-size': 10, fill: c.suave, text: obs ? (vals[evidencia[n.id]] + ' (fijado)') : ('P(' + vals[1] + ') = ' + num(p1, 2)), 'pointer-events': 'none' }, g);
        rect.setAttribute('aria-label', n.etiqueta + ': ' + (obs ? 'fijado a ' + vals[evidencia[n.id]] : 'probabilidad ' + num(p1, 2)) + '. Pulsa para cambiar la observación.');
        accesible(rect, () => ciclar(n.id));
      });
      s.setAttribute('role', 'img');
      s.setAttribute('aria-label', 'Red bayesiana con inferencia exacta.');

      const filas = nodos.map(n => {
        const vals = valoresDe(n), obs = n.id in evidencia;
        return `<tr><th scope="row">${n.etiqueta}</th><td>${obs ? vals[evidencia[n.id]] + ' (fijado)' : num(M[n.id], 3)}</td></tr>`;
      }).join('');
      lectura.innerHTML = '<p>Haz clic en un nodo para fijarlo a «sí», luego a «no» y de nuevo libre, y observa cómo cambian las probabilidades de los demás por inferencia exacta.</p>' +
        `<div class="tabla-scroll"><table class="motor-tabla"><thead><tr><th>Variable</th><th>P(valor = sí) o valor fijado</th></tr></thead><tbody>${filas}</tbody></table></div>`;
    }
    dibujar();
    return { redibujar: dibujar };
  }

  Motores.registrar('grafo', function (el, p, api) {
    if (!Array.isArray(p.nodos) || !p.nodos.length) throw new Error('grafo necesita "nodos"');
    if (!Array.isArray(p.aristas)) throw new Error('grafo necesita "aristas"');
    const modo = p.modo;
    if (modo === 'diagrama') return modoDiagrama(el, p, api);
    if (modo === 'conocimiento') return modoConocimiento(el, p, api);
    if (modo === 'red-bayesiana') return modoRedBayesiana(el, p, api);
    throw new Error('Modo desconocido: ' + modo);
  }, {
    ejemplos: {
      diagrama: {
        modo: 'diagrama',
        nodos: [
          { id: 'crudo', etiqueta: 'texto crudo' },
          { id: 'limpio', etiqueta: 'texto limpio', nota: 'minúsculas, sin puntuación ni espacios sobrantes.' },
          { id: 'tokens', etiqueta: 'tokens', nota: 'el texto partido en unidades mínimas.' },
          { id: 'vector', etiqueta: 'vector numérico', nota: 'cada token se convierte en números que el modelo puede procesar.' },
        ],
        aristas: [['crudo', 'limpio', 'limpieza'], ['limpio', 'tokens', 'tokenización'], ['tokens', 'vector', 'vectorización']],
      },
      conocimiento: {
        modo: 'conocimiento',
        nodos: [
          { id: 'sobreajuste', etiqueta: 'sobreajuste', nota: 'el modelo memoriza el ruido de entrenamiento en vez de aprender el patrón.' },
          { id: 'varianza', etiqueta: 'varianza alta' },
          { id: 'regularizacion', etiqueta: 'regularización', nota: 'penaliza pesos grandes para simplificar el modelo.' },
          { id: 'validacion', etiqueta: 'validación cruzada' },
          { id: 'sesgo', etiqueta: 'sesgo alto' },
        ],
        aristas: [['sobreajuste', 'varianza', 'produce'], ['regularizacion', 'sobreajuste', 'reduce'], ['validacion', 'sobreajuste', 'detecta'], ['varianza', 'sesgo', 'compensa con']],
      },
      'red-bayesiana': {
        modo: 'red-bayesiana',
        nodos: [
          { id: 'lluvia', etiqueta: 'lluvia', tabla: [{ dado: {}, p: 0.2 }] },
          { id: 'aspersor', etiqueta: 'aspersor', tabla: [{ dado: { lluvia: 0 }, p: 0.4 }, { dado: { lluvia: 1 }, p: 0.01 }] },
          {
            id: 'hierba', etiqueta: 'hierba mojada',
            tabla: [
              { dado: { lluvia: 0, aspersor: 0 }, p: 0.0 },
              { dado: { lluvia: 0, aspersor: 1 }, p: 0.9 },
              { dado: { lluvia: 1, aspersor: 0 }, p: 0.8 },
              { dado: { lluvia: 1, aspersor: 1 }, p: 0.99 },
            ],
          },
        ],
        aristas: [['lluvia', 'aspersor'], ['lluvia', 'hierba'], ['aspersor', 'hierba']],
      },
    },
  });
})();
