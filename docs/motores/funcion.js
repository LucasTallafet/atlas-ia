// @modos: familias, tangente, rectas, pdf-cdf, densidad, discreta, region, perdidas, activaciones, series, barras, pertenencia
// Motor "funcion": gráficas y = f(x) con deslizadores, y también barras y series de datos.
(function () {
  'use strict';

  Motores.registrar('funcion', function (el, p, api) {
    const H = api.html, num = api.num;
    const modo = p.modo;
    const P = {};
    (p.parametros || []).forEach(q => { P[q.nombre] = q.valor; });
    const nombres = ['x'].concat(Object.keys(P));
    const fs = (p.funciones || []).map((f, k) => ({ etiqueta: f.etiqueta || f.expr, f: api.expr(f.expr, nombres), k }));
    const ev = (fn, x) => fn.f(Object.assign({ x }, P));
    const exprP = (t) => (t === undefined || t === null ? null : api.expr(String(t), Object.keys(P)));
    const somb = p.sombrear ? { desde: exprP(p.sombrear.desde), hasta: exprP(p.sombrear.hasta) } : null;
    const datos = p.datos || {};
    const series = (datos.series || []).map(s => ({ nombre: s.nombre || '', valores: (s.valores || []).map(Number) }));
    let [x0, x1] = p.x && p.x.length === 2 ? p.x : [-5, 5];
    const CON_FUNCIONES = !['series', 'barras'].includes(modo);
    if (CON_FUNCIONES && !fs.length) throw new Error('El modo ' + modo + ' necesita "funciones"');
    if (!CON_FUNCIONES && !series.length) throw new Error('El modo ' + modo + ' necesita "datos.series"');

    // ───── Estado propio de cada modo ─────
    const E = { sel: modo === 'activaciones' ? 0 : -1, log: !!p.escala_log };
    const dentro = (v) => Math.min(x1, Math.max(x0, v));
    const redondeo = (v, paso) => Math.round(v / paso) * paso;
    const span = x1 - x0;
    const pasoCursor = Math.pow(10, Math.floor(Math.log10(span)) - 2);
    if (modo === 'tangente') { E.cursor = dentro(redondeo(x0 + span * 0.7, 0.5)); E.h = redondeo(span / 4, 0.05) || 1; }
    if (modo === 'pdf-cdf' || modo === 'activaciones') E.cursor = dentro(redondeo(x0 + span * 0.6, 0.5));
    if (modo === 'pertenencia') E.cursor = dentro(redondeo(x0 + span * 0.45, 1));
    if (modo === 'discreta') E.cursor = Math.round(x0 + span * 0.3);
    if (modo === 'series') E.cursor = (datos.etiquetas || series[0].valores).length - 1;
    if (modo === 'perdidas' && series.length) {
      const v = series[0].valores;
      E.atipico = v.reduce((m, x, k) => (Math.abs(x) > Math.abs(v[m]) ? k : m), 0);
    }

    // ───── Controles ─────
    const controles = H('div', { class: 'motor-controles' });
    const grafica = H('div', { class: 'motor-grafica' });
    const lectura = H('div', { class: 'motor-lectura', 'aria-live': 'polite' });
    const leyenda = H('div', { class: 'motor-leyenda' });
    el.append(grafica, leyenda, lectura, controles);
    const sliders = {};
    function sl(clave, o) { sliders[clave] = api.slider(Object.assign({}, o, { alCambiar: (v) => { o.alCambiar(v); dibujar(); } })); controles.append(sliders[clave]); }

    if (modo === 'familias' && fs.length > 1 || modo === 'activaciones') {
      const botones = H('div', { class: 'motor-selector', role: 'group', 'aria-label': 'Elegir función' });
      const opciones = (modo === 'familias' ? [{ etiqueta: 'Todas', k: -1 }] : []).concat(fs);
      opciones.forEach(o => {
        const b = api.boton(o.etiqueta, () => { E.sel = o.k; marcar(); dibujar(); });
        b.dataset.k = o.k;
        botones.append(b);
      });
      const marcar = () => botones.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.k === E.sel)));
      marcar();
      controles.append(botones);
    }
    if (modo === 'tangente') {
      sl('cursor', { etiqueta: 'punto x₀', min: x0, max: x1, paso: pasoCursor * 10, valor: E.cursor, alCambiar: v => { E.cursor = v; } });
      sl('h', { etiqueta: 'separación h', min: 0.001, max: redondeo(span / 2, 0.01), paso: 0.001, valor: E.h, decimales: 3, alCambiar: v => { E.h = v; } });
    }
    if (modo === 'pdf-cdf') sl('cursor', { etiqueta: 'valor t', min: x0, max: x1, paso: pasoCursor * 10, valor: E.cursor, alCambiar: v => { E.cursor = v; } });
    if (modo === 'activaciones') sl('cursor', { etiqueta: 'entrada x', min: x0, max: x1, paso: pasoCursor * 10, valor: E.cursor, alCambiar: v => { E.cursor = v; } });
    if (modo === 'pertenencia') sl('cursor', { etiqueta: 'valor de entrada', min: x0, max: x1, paso: pasoCursor * 10, valor: E.cursor, alCambiar: v => { E.cursor = v; } });
    if (modo === 'discreta') sl('cursor', { etiqueta: 'valor k', min: Math.ceil(x0), max: Math.floor(x1), paso: 1, valor: E.cursor, alCambiar: v => { E.cursor = v; } });
    if (modo === 'series') {
      const n = (datos.etiquetas || series[0].valores).length;
      sl('cursor', { etiqueta: datos.titulo_x || 'posición', min: 0, max: n - 1, paso: 1, valor: E.cursor, formato: v => String((datos.etiquetas || [])[v] !== undefined ? datos.etiquetas[v] : v + 1), alCambiar: v => { E.cursor = v; } });
    }
    if (modo === 'perdidas' && series.length) {
      sl('atipico', { etiqueta: 'residuo del punto atípico', min: x0, max: x1, paso: pasoCursor * 10, valor: series[0].valores[E.atipico], alCambiar: v => { series[0].valores[E.atipico] = v; } });
    }
    (p.parametros || []).forEach(q => sl('p:' + q.nombre, { etiqueta: q.etiqueta || q.nombre, min: q.min, max: q.max, paso: q.paso, valor: q.valor, alCambiar: v => { P[q.nombre] = v; } }));
    if ((modo === 'barras' || modo === 'series')) {
      const positivos = series.every(s => s.valores.every(v => v > 0));
      if (positivos) {
        const b = api.boton('', () => { E.log = !E.log; ponTexto(); dibujar(); });
        const ponTexto = () => { b.textContent = E.log ? 'Escala: logarítmica' : 'Escala: lineal'; b.setAttribute('aria-pressed', String(E.log)); };
        ponTexto();
        controles.append(b);
      }
    }
    if (Object.keys(sliders).length || controles.children.length) {
      controles.append(api.boton('Reiniciar', reiniciar));
    }
    function reiniciar() {
      Motores.desmontar(el);
      Motores.montar(el, 'funcion', JSON.parse(JSON.stringify(original)));
    }
    const original = JSON.parse(JSON.stringify(p));

    // ───── Utilidades numéricas ─────
    function simpson(fn, a, b, n) {
      if (!(b > a)) return 0;
      n = n || 600;
      const h = (b - a) / n;
      let s = fn(a) + fn(b);
      for (let i = 1; i < n; i++) { const v = fn(a + i * h); s += (Number.isFinite(v) ? v : 0) * (i % 2 ? 4 : 2); }
      return s * h / 3;
    }
    const deriv = (fn, x) => { const h = 1e-4 * Math.max(1, Math.abs(x)); return (ev(fn, x + h) - ev(fn, x - h)) / (2 * h); };
    function rangoY(valores, incluirCero) {
      const v = valores.filter(Number.isFinite).sort((a, b) => a - b);
      if (!v.length) return [-1, 1];
      let lo = v[Math.floor(v.length * 0.01)], hi = v[Math.ceil(v.length * 0.99) - 1];
      if (incluirCero) { lo = Math.min(lo, 0); hi = Math.max(hi, 0); }
      if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
      const m = (hi - lo) * 0.08;
      return [lo - (lo === 0 ? 0 : m), hi + m];
    }
    const muestras = (fn, n) => { const out = []; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; out.push([x, ev(fn, x)]); } return out; };

    // ───── Lienzo: ejes, rejilla y trazos ─────
    function lienzo(s, c, caja, dx, dy, opts) {
      opts = opts || {};
      const X = api.escala(dx[0], dx[1], caja.l, caja.r), Y = opts.log ? logEscala(dy, caja.b, caja.t) : api.escala(dy[0], dy[1], caja.b, caja.t);
      const g = api.el('g', { 'font-size': 11, fill: c.suave }, s);
      const mx = opts.marcasX || api.marcas(dx[0], dx[1], Math.max(3, Math.floor((caja.r - caja.l) / 70)));
      const my = opts.log ? marcasLog(dy) : api.marcas(dy[0], dy[1], Math.max(3, Math.floor((caja.b - caja.t) / 45)));
      mx.forEach(v => {
        const x = typeof v === 'object' ? X(v.v) : X(v);
        api.el('line', { x1: x, x2: x, y1: caja.t, y2: caja.b, stroke: c.rejilla }, g);
        api.el('text', { x, y: caja.b + 15, 'text-anchor': 'middle', text: typeof v === 'object' ? v.t : num(v, 3) }, g);
      });
      my.forEach(v => {
        api.el('line', { x1: caja.l, x2: caja.r, y1: Y(v), y2: Y(v), stroke: c.rejilla }, g);
        api.el('text', { x: caja.l - 5, y: Y(v) + 4, 'text-anchor': 'end', text: num(v, 3) }, g);
      });
      if (!opts.log && dy[0] < 0 && dy[1] > 0) api.el('line', { x1: caja.l, x2: caja.r, y1: Y(0), y2: Y(0), stroke: c.suave, 'stroke-width': 1.2 }, g);
      if (!opts.marcasX && dx[0] < 0 && dx[1] > 0) api.el('line', { x1: X(0), x2: X(0), y1: caja.t, y2: caja.b, stroke: c.suave, 'stroke-width': 1.2 }, g);
      api.el('rect', { x: caja.l, y: caja.t, width: caja.r - caja.l, height: caja.b - caja.t, fill: 'none', stroke: c.linea }, g);
      const id = 'clip-' + Math.random().toString(36).slice(2);
      const cp = api.el('clipPath', { id }, api.el('defs', {}, s));
      api.el('rect', { x: caja.l, y: caja.t, width: caja.r - caja.l, height: caja.b - caja.t }, cp);
      const dentroG = api.el('g', { 'clip-path': `url(#${id})` }, s);
      return { X, Y, g: dentroG };
    }
    function logEscala(dy, r0, r1) {
      const a = Math.log10(dy[0]), b = Math.log10(dy[1]);
      const f = (v) => r0 + (Math.log10(Math.max(v, 1e-300)) - a) * (r1 - r0) / (b - a);
      return f;
    }
    function marcasLog(d) {
      const out = [];
      for (let k = Math.ceil(Math.log10(d[0])); k <= Math.floor(Math.log10(d[1])); k++) out.push(Math.pow(10, k));
      return out;
    }
    function trazo(L, pts, attrs) {
      let d = '', nuevo = true;
      for (const [x, y] of pts) {
        const py = L.Y(y);
        if (!Number.isFinite(py) || Math.abs(py) > 1e5) { nuevo = true; continue; }
        d += (nuevo ? 'M' : 'L') + L.X(x).toFixed(1) + ',' + py.toFixed(1);
        nuevo = false;
      }
      return api.el('path', Object.assign({ d, fill: 'none', 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, attrs), L.g);
    }
    function relleno(L, fn, a, b, color) {
      a = Math.max(a, x0); b = Math.min(b, x1);
      if (!(b > a)) return;
      let d = `M${L.X(a)},${L.Y(0)}`;
      for (let i = 0; i <= 200; i++) { const x = a + (b - a) * i / 200, y = ev(fn, x); d += `L${L.X(x).toFixed(1)},${L.Y(Number.isFinite(y) ? y : 0).toFixed(1)}`; }
      d += `L${L.X(b)},${L.Y(0)}Z`;
      api.el('path', { d, fill: color, 'fill-opacity': 0.28, stroke: 'none' }, L.g);
    }
    function punto(L, x, y, color, r) { return api.el('circle', { cx: L.X(x), cy: L.Y(y), r: r || 5, fill: color, stroke: api.colores().superficie, 'stroke-width': 1.5 }, L.g); }
    function vertical(L, x, color, caja, disc) { api.el('line', { x1: L.X(x), x2: L.X(x), y1: caja.t, y2: caja.b, stroke: color, 'stroke-width': 1.4, 'stroke-dasharray': disc ? '5 4' : null }, L.g); }
    function textoEn(L, x, y, t, color, ancla) { return api.el('text', { x: L.X(x), y: L.Y(y), fill: color, 'font-size': 12, 'font-weight': 600, 'text-anchor': ancla || 'start', text: t, 'paint-order': 'stroke', stroke: api.colores().superficie, 'stroke-width': 3 }, L.g); }

    // Arrastre con Pointer Events: mueve el cursor del modo. Los eventos van al contenedor,
    // que sobrevive a cada redibujado (el SVG se sustituye y perdería la captura del puntero).
    let arrastre = null;
    function arrastrable(s, L, alMover) {
      s.style.touchAction = 'pan-y';
      s.style.cursor = 'ew-resize';
      arrastre = { s, L, alMover };
    }
    const moverArrastre = (e) => {
      const { s, L, alMover } = arrastre;
      const r = s.getBoundingClientRect();
      alMover(L.X.inversa((e.clientX - r.left) * s.viewBox.baseVal.width / r.width));
    };
    grafica.addEventListener('pointerdown', (e) => { if (!arrastre) return; grafica.setPointerCapture(e.pointerId); moverArrastre(e); });
    grafica.addEventListener('pointermove', (e) => { if (arrastre && grafica.hasPointerCapture(e.pointerId)) moverArrastre(e); });
    function fijarCursor(v, clave) {
      clave = clave || 'cursor';
      const sld = sliders[clave];
      const paso = parseFloat(sld.input.step) || 1;
      E[clave] = Math.min(parseFloat(sld.input.max), Math.max(parseFloat(sld.input.min), redondeo(v, paso)));
      sld.valor = E[clave];
      dibujar();
    }

    // ───── Dibujo principal ─────
    function dibujar() {
      const c = api.colores();
      const W = Math.max(300, Math.min(el.clientWidth || 640, 900));
      const alto = modo === 'pdf-cdf' ? Math.max(380, Math.min(W * 0.95, 540)) : Math.max(230, Math.min(W * 0.6, 400));
      grafica.innerHTML = ''; lectura.innerHTML = ''; leyenda.innerHTML = '';
      const s = api.svg(W, modo === 'barras' ? 10 : alto);
      s.setAttribute('role', 'img');
      grafica.append(s);
      const col = (k) => c.series[k % c.series.length];
      const lineas = [];
      const pon = (t) => lineas.push(t);
      pon.buffer = lineas;
      const ley = (items) => items.forEach(([t, color, disc]) => leyenda.append(H('span', { class: 'leyenda-item' }, H('span', { class: 'leyenda-muestra' + (disc ? ' disc' : ''), style: `--c:${color}` }), t)));
      const caja = { l: 46, r: W - 12, t: 10, b: alto - 28 };

      if (modo === 'barras') return dibujarBarras(s, c, W, col, ley, pon, fin);
      if (modo === 'series') return dibujarSeries(s, c, caja, col, ley, pon, fin);

      // Funciones y rango vertical
      const vis = fs;
      let dy = p.y && p.y.length === 2 ? p.y : null;
      if (modo === 'pertenencia') dy = dy || [0, 1.05];
      if (modo === 'pdf-cdf') {
        const alto1 = Math.round(alto * 0.55);
        const c1 = { l: 46, r: W - 12, t: 10, b: alto1 - 26 }, c2 = { l: 46, r: W - 12, t: alto1 + 6, b: alto - 28 };
        return dibujarPdfCdf(s, c, c1, c2, col, ley, pon, fin);
      }
      if (modo === 'discreta') return dibujarDiscreta(s, c, caja, col, ley, pon, fin, dy);
      if (!dy) {
        const vals = [];
        vis.forEach(f => muestras(f, 200).forEach(([, y]) => vals.push(y)));
        if (modo === 'activaciones') vis.forEach(f => { for (let i = 0; i <= 100; i++) vals.push(deriv(f, x0 + span * i / 100)); });
        dy = rangoY(vals, true);
      }
      const L = lienzo(s, c, caja, [x0, x1], dy);
      const n = Math.round((caja.r - caja.l) * 1.5);

      // Sombreado (densidad y región)
      if ((modo === 'densidad' || modo === 'region') && somb) {
        const a = somb.desde ? somb.desde(P) : -Infinity, b = somb.hasta ? somb.hasta(P) : Infinity;
        const lejos = span * 6, f0 = fs[0];
        const area = (u, v) => simpson(x => ev(f0, x), Math.max(u, x0 - lejos), Math.min(v, x1 + lejos), 1200);
        if (modo === 'densidad') {
          relleno(L, f0, a, b, col(0));
          pon(`Área sombreada entre ${num(a, 2)} y ${num(b, 2)}: <strong>${num(area(a, b), 4)}</strong>`);
        } else {
          relleno(L, f0, -Infinity, a, c.mal); relleno(L, f0, b, Infinity, c.mal);
          const colas = (somb.desde ? area(-Infinity, a) : 0) + (somb.hasta ? area(b, Infinity) : 0);
          pon(`Área en ${somb.desde && somb.hasta ? 'las colas' : 'la cola'} (fuera de la zona central): <strong>${num(colas, 4)}</strong>`);
          if (somb.desde && somb.hasta) pon(`Área central entre ${num(a, 2)} y ${num(b, 2)}: ${num(area(a, b), 4)}`);
        }
        if (Number.isFinite(a)) vertical(L, a, c.suave, caja, true);
        if (Number.isFinite(b)) vertical(L, b, c.suave, caja, true);
      }

      // Curvas
      fs.forEach(f => {
        const apagada = (modo === 'familias' || modo === 'activaciones') && E.sel >= 0 && f.k !== E.sel;
        trazo(L, muestras(f, n), { stroke: col(f.k), 'stroke-opacity': apagada ? 0.18 : 1, 'stroke-width': apagada ? 1.5 : 2.4 });
      });
      ley(fs.map(f => [f.etiqueta, col(f.k)]));

      if (modo === 'familias') {
        const sel = E.sel >= 0 ? [fs[E.sel]] : fs;
        pon(sel.map(f => `${f.etiqueta}: f(0) = ${num(ev(f, 0), 3)}, f(1) = ${num(ev(f, 1), 3)}`).join('<br>'));
      }
      if (modo === 'tangente') {
        const f = fs[0], a = E.cursor, fa = ev(f, a), b = a + E.h, fb = ev(f, b);
        const msec = (fb - fa) / E.h, mtan = deriv(f, a);
        const recta = (m) => [[x0, fa + m * (x0 - a)], [x1, fa + m * (x1 - a)]];
        trazo(L, recta(msec), { stroke: c.series[2], 'stroke-width': 1.8 });
        trazo(L, recta(mtan), { stroke: c.series[1], 'stroke-width': 2, 'stroke-dasharray': '7 5' });
        punto(L, b, fb, c.series[2], 4.5);
        punto(L, a, fa, c.texto, 6);
        ley([['secante (con h)', c.series[2]], ['tangente (h → 0)', c.series[1], true]]);
        pon(`x₀ = ${num(a, 3)} · f(x₀) = ${num(fa, 3)}`);
        pon(`Pendiente de la secante con h = ${num(E.h, 3)}: <strong>${num(msec, 4)}</strong>`);
        pon(`Pendiente de la tangente, f′(x₀) ≈ <strong>${num(mtan, 4)}</strong> · diferencia: ${num(Math.abs(msec - mtan), 4)}`);
        arrastrable(s, L, v => fijarCursor(v));
      }
      if (modo === 'rectas') {
        for (let i = 0; i < fs.length; i++) {
          for (let j = i + 1; j < fs.length; j++) {
            const g = (x) => ev(fs[i], x) - ev(fs[j], x);
            const pts = [];
            for (let k = 0; k <= 400; k++) { const x = x0 + span * k / 400; pts.push([x, g(x)]); }
            const nombre = `${fs[i].etiqueta} y ${fs[j].etiqueta}`;
            if (pts.every(([, y]) => Math.abs(y) < 1e-9)) { pon(`${nombre}: <strong>coinciden</strong> → infinitas soluciones.`); continue; }
            const raices = [];
            for (let k = 1; k < pts.length; k++) {
              let [a, ga] = pts[k - 1], [b] = pts[k];
              const gb = pts[k][1];
              if (Math.abs(ga) < 1e-12) { raices.push(a); continue; }
              if (k === pts.length - 1 && Math.abs(gb) < 1e-12) { raices.push(b); continue; }
              if (ga * gb < 0) {
                for (let it = 0; it < 60; it++) { const m = (a + b) / 2, gm = g(m); if (ga * gm <= 0) b = m; else { a = m; ga = gm; } }
                raices.push((a + b) / 2);
              }
            }
            raices.forEach(r => punto(L, r, ev(fs[i], r), c.texto, 6));
            const constante = Math.abs(pts[0][1] - pts[pts.length - 1][1]) < 1e-9;
            if (raices.length) pon(`${nombre}: se cortan en ${raices.map(r => `(<strong>${num(r, 3)}</strong>, <strong>${num(ev(fs[i], r), 3)}</strong>)`).join(', ')} → ${raices.length === 1 ? 'solución única' : raices.length + ' soluciones'}.`);
            else pon(constante ? `${nombre}: son <strong>paralelas</strong> → ninguna solución.` : `${nombre}: no se cortan en la zona visible.`);
          }
        }
      }
      if (modo === 'perdidas' && series.length) {
        const v = series[0].valores;
        v.forEach((r, k) => fs.forEach(f => punto(L, r, ev(f, r), col(f.k), k === E.atipico ? 6 : 3.5)));
        vertical(L, v[E.atipico], c.suave, caja, true);
        const filas = fs.map(f => {
          const ls = v.map(r => ev(f, r)), tot = ls.reduce((a, b) => a + b, 0);
          return `<tr><th scope="row"><span class="leyenda-muestra" style="--c:${col(f.k)}"></span>${f.etiqueta}</th><td>${num(tot / v.length, 3)}</td><td>${num(tot ? 100 * ls[E.atipico] / tot : 0, 1)} %</td></tr>`;
        }).join('');
        pon(`<div class="tabla-scroll"><table class="motor-tabla"><thead><tr><th>Pérdida</th><th>media sobre ${v.length} residuos</th><th>peso del atípico</th></tr></thead><tbody>${filas}</tbody></table></div>`);
        pon(`Residuos: ${v.map((r, k) => k === E.atipico ? `<strong>${num(r, 2)}</strong>` : num(r, 2)).join(' · ')}`);
      }
      if (modo === 'activaciones') {
        const f = fs[E.sel], x = E.cursor;
        const pts = []; for (let i = 0; i <= n; i++) { const t = x0 + span * i / n; pts.push([t, deriv(f, t)]); }
        trazo(L, pts, { stroke: col(f.k), 'stroke-width': 1.8, 'stroke-dasharray': '6 4' });
        vertical(L, x, c.suave, caja, true);
        punto(L, x, ev(f, x), col(f.k), 6);
        ley([[`derivada de ${f.etiqueta}`, col(f.k), true]]);
        pon(`${f.etiqueta}(${num(x, 2)}) = <strong>${num(ev(f, x), 4)}</strong> · derivada = <strong>${num(deriv(f, x), 4)}</strong>`);
        arrastrable(s, L, v => fijarCursor(v));
      }
      if (modo === 'pertenencia') {
        const x = E.cursor;
        vertical(L, x, c.texto, caja, false);
        const grados = fs.map(f => { const y = Math.max(0, ev(f, x)); punto(L, x, y, col(f.k), 5.5); return `${f.etiqueta}: <strong>${num(y, 2)}</strong>`; });
        pon(`Entrada ${num(x, 2)} → grado de pertenencia μ · ${grados.join(' · ')}`);
        arrastrable(s, L, v => fijarCursor(v));
      }
      fin(s, lineas);
    }

    function fin(s, lineas) {
      lectura.innerHTML = lineas.map(t => `<p>${t}</p>`).join('');
      s.setAttribute('aria-label', 'Gráfica interactiva. ' + lectura.textContent);
    }

    function dibujarPdfCdf(s, c, c1, c2, col, ley, pon, finF) {
      const f = fs[0], N = 800, xs = [], pdf = [], cdf = [0];
      for (let i = 0; i <= N; i++) { const x = x0 + span * i / N; xs.push(x); pdf.push(Math.max(0, ev(f, x) || 0)); }
      for (let i = 1; i <= N; i++) cdf.push(cdf[i - 1] + (pdf[i] + pdf[i - 1]) / 2 * span / N);
      const total = cdf[N] || 1;
      const F = (t) => { const k = Math.max(0, Math.min(N, (t - x0) / span * N)); const i = Math.floor(k); return i >= N ? cdf[N] : cdf[i] + (cdf[i + 1] - cdf[i]) * (k - i); };
      // Muestra reproducible por inversión de la CDF numérica
      const rnd = api.aleatorio(7), m = 400, muestra = [];
      for (let j = 0; j < m; j++) { const u = rnd() * total; let lo = 0, hi = N; while (hi - lo > 1) { const md = (lo + hi) >> 1; if (cdf[md] < u) lo = md; else hi = md; } muestra.push(xs[lo] + (xs[hi] - xs[lo]) * (u - cdf[lo]) / ((cdf[hi] - cdf[lo]) || 1)); }
      const nb = 24, anchoB = span / nb, cuentas = new Array(nb).fill(0);
      muestra.forEach(v => { const b = Math.min(nb - 1, Math.floor((v - x0) / anchoB)); if (b >= 0) cuentas[b]++; });
      const dens = cuentas.map(k => k / m / anchoB);
      const ymax = Math.max(Math.max(...pdf), Math.max(...dens)) * 1.1 || 1;
      const L1 = lienzo(s, c, c1, [x0, x1], p.y || [0, ymax]);
      dens.forEach((d, b) => api.el('rect', { x: L1.X(x0 + b * anchoB) + 0.5, y: L1.Y(d), width: Math.max(0, L1.X(x0 + anchoB) - L1.X(x0) - 1), height: Math.max(0, L1.Y(0) - L1.Y(d)), fill: c.suave, 'fill-opacity': 0.25 }, L1.g));
      const t = E.cursor;
      relleno(L1, f, x0, t, col(0));
      trazo(L1, xs.map((x, i) => [x, pdf[i]]), { stroke: col(0) });
      vertical(L1, t, c.texto, c1, true);
      const L2 = lienzo(s, c, c2, [x0, x1], [0, Math.max(1.05, total * 1.05)]);
      trazo(L2, xs.map((x, i) => [x, cdf[i]]), { stroke: col(1) });
      vertical(L2, t, c.texto, c2, true);
      api.el('line', { x1: c2.l, x2: L2.X(t), y1: L2.Y(F(t)), y2: L2.Y(F(t)), stroke: c.suave, 'stroke-dasharray': '4 4' }, L2.g);
      punto(L2, t, F(t), col(1), 6);
      api.el('text', { x: c1.l + 6, y: c1.t + 14, 'font-size': 12, fill: c.suave, text: 'Densidad (PDF) e histograma de una muestra' }, s);
      api.el('text', { x: c2.l + 6, y: c2.t + 14, 'font-size': 12, fill: c.suave, text: 'Distribución acumulada (CDF)' }, s);
      ley([[fs[0].etiqueta + ' (PDF)', col(0)], ['CDF', col(1)], [`histograma de ${m} valores simulados`, c.suave]]);
      const prop = muestra.filter(v => v <= t).length / m;
      pon(`P(X ≤ ${num(t, 2)}) = área sombreada = F(${num(t, 2)}) = <strong>${num(F(t), 4)}</strong>`);
      pon(`En la muestra simulada, proporción de valores ≤ ${num(t, 2)}: ${num(prop, 3)}`);
      arrastrable(s, L1, v => fijarCursor(v));
      finF(s, lineasDe(pon));
    }

    function dibujarDiscreta(s, c, caja, col, ley, pon, finF, dy) {
      const f = fs[0], ks = [];
      for (let k = Math.ceil(x0); k <= Math.floor(x1); k++) ks.push(k);
      const ps = ks.map(k => { const v = ev(f, k); return Number.isFinite(v) ? v : 0; });
      const extra = fs.slice(1);
      if (!dy) {
        const vals = ps.slice();
        extra.forEach(g => muestras(g, 200).forEach(([, y]) => vals.push(y)));
        dy = [0, Math.max(...vals.filter(Number.isFinite)) * 1.12 || 1];
      }
      const L = lienzo(s, c, caja, [x0 - 0.5, x1 + 0.5], dy, { marcasX: api.marcas(x0, x1, Math.max(3, Math.floor((caja.r - caja.l) / 50))).filter(v => Number.isInteger(v)) });
      const w = Math.max(1, (L.X(1) - L.X(0)) * 0.72);
      ks.forEach((k, i) => {
        const r = api.el('rect', { x: L.X(k) - w / 2, y: L.Y(ps[i]), width: w, height: Math.max(0, L.Y(0) - L.Y(ps[i])), fill: col(0), 'fill-opacity': k === E.cursor ? 1 : k <= E.cursor ? 0.7 : 0.35 }, L.g);
        api.el('title', { text: `P(X = ${k}) = ${num(ps[i], 4)}` }, r);
      });
      extra.forEach(g => trazo(L, muestras(g, 400), { stroke: col(g.k), 'stroke-width': 2 }));
      const suma = ps.reduce((a, b) => a + b, 0), media = ks.reduce((a, k, i) => a + k * ps[i], 0);
      const varz = ks.reduce((a, k, i) => a + (k - media) ** 2 * ps[i], 0);
      const i = ks.indexOf(E.cursor), acum = ps.slice(0, i + 1).reduce((a, b) => a + b, 0);
      ley([[fs[0].etiqueta, col(0)]].concat(extra.map(g => [g.etiqueta, col(g.k)])));
      pon(`P(X = ${E.cursor}) = <strong>${num(i >= 0 ? ps[i] : 0, 4)}</strong> · P(X ≤ ${E.cursor}) = <strong>${num(acum, 4)}</strong>`);
      pon(`Media = ${num(media, 3)} · varianza = ${num(varz, 3)} · suma de todas las barras = ${num(suma, 4)}`);
      arrastrable(s, L, v => fijarCursor(v));
      finF(s, lineasDe(pon));
    }

    function dibujarSeries(s, c, caja, col, ley, pon, finF) {
      const n = Math.max(...series.map(x => x.valores.length));
      const etq = datos.etiquetas || Array.from({ length: n }, (_, i) => i + 1);
      const vals = [].concat(...series.map(x => x.valores));
      const dy = p.y || (E.log ? [Math.min(...vals) / 1.3, Math.max(...vals) * 1.3] : rangoY(vals, false));
      const paso = Math.max(1, Math.ceil(n / Math.max(3, Math.floor((caja.r - caja.l) / 55))));
      const mx = etq.map((t, i) => ({ v: i, t: String(t) })).filter((_, i) => i % paso === 0);
      const L = lienzo(s, c, caja, [-0.3, n - 0.7], dy, { marcasX: mx, log: E.log });
      const partes = [];
      series.forEach((se, k) => {
        trazo(L, se.valores.map((v, i) => [i, v]), { stroke: col(k) });
        const im = se.valores.reduce((m, v, i) => (v < se.valores[m] ? i : m), 0);
        api.el('circle', { cx: L.X(im), cy: L.Y(se.valores[im]), r: 7, fill: 'none', stroke: col(k), 'stroke-width': 2 }, L.g);
        punto(L, E.cursor, se.valores[E.cursor], col(k), 4.5);
        partes.push(`${se.nombre}: <strong>${num(se.valores[E.cursor], 3)}</strong> (mínimo ${num(se.valores[im], 3)} en ${etq[im]})`);
      });
      vertical(L, E.cursor, c.suave, caja, true);
      ley(series.map((se, k) => [se.nombre, col(k)]).concat([['○ mínimo de cada serie', c.suave]]));
      pon(`En ${etq[E.cursor]}: ` + partes.join(' · '));
      arrastrable(s, L, v => fijarCursor(Math.round(v)));
      finF(s, lineasDe(pon));
    }

    function dibujarBarras(s, c, W, col, ley, pon, finF) {
      const etq = datos.etiquetas || series[0].valores.map((_, i) => String(i + 1));
      const ns = series.length, fila = ns > 1 ? 16 * ns + 12 : 30;
      const maxEtq = Math.max(...etq.map(t => String(t).length));
      const izq = Math.min(Math.round(W * 0.38), 16 + maxEtq * 7), der = 64;
      const alto = 18 + etq.length * fila + 26;
      s.setAttribute('viewBox', `0 0 ${W} ${alto}`); s.setAttribute('height', alto);
      const vals = [].concat(...series.map(x => x.valores));
      let dx;
      if (E.log) dx = [Math.pow(10, Math.floor(Math.log10(Math.min(...vals)))), Math.pow(10, Math.ceil(Math.log10(Math.max(...vals))))];
      else dx = [Math.min(0, ...vals), Math.max(0, ...vals)];
      if (dx[1] === dx[0]) dx[1] = dx[0] + 1;
      const X = E.log ? logEscala(dx, izq, W - der) : api.escala(dx[0], dx[1], izq, W - der);
      const mx = E.log ? marcasLog(dx) : api.marcas(dx[0], dx[1], Math.max(2, Math.floor((W - izq - der) / 70)));
      const g = api.el('g', { 'font-size': 11, fill: c.suave }, s);
      const y0 = 10, yb = alto - 26;
      mx.forEach(v => { api.el('line', { x1: X(v), x2: X(v), y1: y0, y2: yb, stroke: c.rejilla }, g); api.el('text', { x: X(v), y: yb + 15, 'text-anchor': 'middle', text: num(v, 3) }, g); });
      const base = E.log ? dx[0] : 0;
      api.el('line', { x1: X(base), x2: X(base), y1: y0, y2: yb, stroke: c.suave }, g);
      etq.forEach((t, i) => {
        const yf = y0 + i * fila;
        const txt = String(t).length > 28 ? String(t).slice(0, 27) + '…' : String(t);
        api.el('text', { x: izq - 8, y: yf + fila / 2 + 4, 'text-anchor': 'end', 'font-size': 12, fill: c.texto, text: txt }, s);
        series.forEach((se, k) => {
          const v = se.valores[i];
          if (!Number.isFinite(v)) return;
          const h = ns > 1 ? 14 : 20, yb2 = yf + (ns > 1 ? 6 + k * 16 : (fila - h) / 2);
          const a = X(base), b = X(v);
          const r = api.el('rect', { x: Math.min(a, b), y: yb2, width: Math.max(1, Math.abs(b - a)), height: h, rx: 2, fill: v < 0 ? c.mal : col(k) }, s);
          api.el('title', { text: `${t} · ${se.nombre}: ${num(v, 4)}` }, r);
          api.el('text', { x: v < 0 ? Math.min(a, b) - 4 : Math.max(a, b) + 4, y: yb2 + h / 2 + 4, 'text-anchor': v < 0 ? 'end' : 'start', 'font-size': 11, fill: c.texto, text: num(v, 3) }, s);
        });
      });
      if (ns > 1 || series[0].nombre) ley(series.map((se, k) => [se.nombre, col(k)]));
      const mayor = etq[series[0].valores.indexOf(Math.max(...series[0].valores))], menor = etq[series[0].valores.indexOf(Math.min(...series[0].valores))];
      pon(`${series[0].nombre ? series[0].nombre + ': ' : ''}mayor en <strong>${mayor}</strong>, menor en <strong>${menor}</strong>${E.log ? ' · en escala logarítmica cada marca multiplica por 10' : ''}.`);
      finF(s, lineasDe(pon));
    }

    // pon() acumula en pon.buffer las líneas de lectura que fin() vuelca
    function lineasDe(pon) { return pon.buffer || []; }

    dibujar();
    return { redibujar: dibujar };
  }, {
    ejemplos: {
      familias: { modo: 'familias', funciones: [{ expr: 'a*x + b', etiqueta: 'lineal' }, { expr: 'b*exp(a*x)', etiqueta: 'exponencial' }, { expr: 'a*log(x) + b', etiqueta: 'logarítmica' }, { expr: 'a*x^2 + b', etiqueta: 'cuadrática' }], parametros: [{ nombre: 'a', min: -2, max: 2, paso: 0.1, valor: 1, etiqueta: 'a' }, { nombre: 'b', min: -3, max: 3, paso: 0.1, valor: 1, etiqueta: 'b' }], x: [-3, 3], y: [-4, 6] },
      tangente: { modo: 'tangente', funciones: [{ expr: 'x^3/3 - x', etiqueta: 'f(x)' }], x: [-3, 3], y: [-4, 4] },
      rectas: { modo: 'rectas', funciones: [{ expr: 'a*x + 1', etiqueta: 'recta 1' }, { expr: '2*x + b', etiqueta: 'recta 2' }], parametros: [{ nombre: 'a', min: -3, max: 3, paso: 0.5, valor: 1, etiqueta: 'pendiente de la recta 1' }, { nombre: 'b', min: -3, max: 3, paso: 0.5, valor: -1, etiqueta: 'corte de la recta 2' }], x: [-4, 4], y: [-6, 8] },
      'pdf-cdf': { modo: 'pdf-cdf', funciones: [{ expr: 'exp(-(x-mu)^2/(2*s^2))/(s*sqrt(2*pi))', etiqueta: 'Normal' }], parametros: [{ nombre: 'mu', min: -2, max: 2, paso: 0.1, valor: 0, etiqueta: 'media μ' }, { nombre: 's', min: 0.3, max: 2, paso: 0.1, valor: 1, etiqueta: 'desviación σ' }], x: [-5, 5] },
      densidad: { modo: 'densidad', funciones: [{ expr: 'exp(-(x-mu)^2/(2*s^2))/(s*sqrt(2*pi))', etiqueta: 'Normal' }], parametros: [{ nombre: 'mu', min: -2, max: 2, paso: 0.1, valor: 0, etiqueta: 'media μ' }, { nombre: 's', min: 0.3, max: 2, paso: 0.1, valor: 1, etiqueta: 'desviación σ' }, { nombre: 'k', min: 0.5, max: 3, paso: 0.5, valor: 1, etiqueta: 'k desviaciones' }], sombrear: { desde: 'mu - k*s', hasta: 'mu + k*s' }, x: [-5, 5] },
      discreta: { modo: 'discreta', funciones: [{ expr: 'comb(n, x) * q^x * (1-q)^(n-x)', etiqueta: 'Binomial' }, { expr: 'exp(-(x-n*q)^2/(2*n*q*(1-q)))/sqrt(2*pi*n*q*(1-q))', etiqueta: 'Normal aproximada' }], parametros: [{ nombre: 'n', min: 1, max: 40, paso: 1, valor: 10, etiqueta: 'ensayos n' }, { nombre: 'q', min: 0.05, max: 0.95, paso: 0.05, valor: 0.3, etiqueta: 'probabilidad de éxito p' }], x: [0, 40] },
      region: { modo: 'region', funciones: [{ expr: 'exp(-x^2/2)/sqrt(2*pi)', etiqueta: 'N(0, 1) bajo H₀' }], parametros: [{ nombre: 'z', min: 0, max: 4, paso: 0.01, valor: 1.96, etiqueta: 'estadístico |z|' }], sombrear: { desde: '-z', hasta: 'z' }, x: [-4, 4] },
      perdidas: { modo: 'perdidas', funciones: [{ expr: 'x^2', etiqueta: 'MSE' }, { expr: 'abs(x)', etiqueta: 'MAE' }, { expr: 'min(abs(x), d)^2/2 + d*(abs(x) - min(abs(x), d))', etiqueta: 'Huber' }], parametros: [{ nombre: 'd', min: 0.2, max: 3, paso: 0.1, valor: 1, etiqueta: 'δ de Huber' }], datos: { series: [{ nombre: 'residuos', valores: [-1, 0.5, 1.5, -0.5, 4] }] }, x: [-5, 5], y: [0, 10] },
      activaciones: { modo: 'activaciones', funciones: [{ expr: '1/(1+exp(-x))', etiqueta: 'sigmoide' }, { expr: 'tanh(x)', etiqueta: 'tanh' }, { expr: 'max(0, x)', etiqueta: 'ReLU' }], x: [-5, 5], y: [-1.5, 3] },
      series: { modo: 'series', datos: { etiquetas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], series: [{ nombre: 'entrenamiento', valores: [1.2, 0.9, 0.7, 0.58, 0.5, 0.44, 0.39, 0.35, 0.32, 0.29, 0.27, 0.25] }, { nombre: 'validación', valores: [1.25, 0.97, 0.8, 0.7, 0.65, 0.63, 0.64, 0.67, 0.71, 0.76, 0.8, 0.85] }] } },
      barras: { modo: 'barras', datos: { etiquetas: ['A', 'B', 'C', 'D'], series: [{ nombre: 'tamaño', valores: [0.1, 1.5, 20, 400] }] }, escala_log: true },
      pertenencia: { modo: 'pertenencia', funciones: [{ expr: 'max(0, min(1, (18 - x)/6))', etiqueta: 'frío' }, { expr: 'max(0, min((x - 12)/8, (28 - x)/8))', etiqueta: 'templado' }, { expr: 'max(0, min(1, (x - 22)/6))', etiqueta: 'caliente' }], x: [0, 40] },
    },
  });
})();
