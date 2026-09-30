// Núcleo de motores interactivos: registro, carga bajo demanda y API común (ESPEC-WEB.md §8).
(function () {
  'use strict';
  const SVGNS = 'http://www.w3.org/2000/svg';
  const registro = {};
  const cargas = {};

  // ───────────── Colores (desde los tokens CSS) ─────────────
  function colores() {
    const cs = getComputedStyle(document.documentElement);
    const v = (n, def) => (cs.getPropertyValue(n).trim() || def);
    const oscuro = document.documentElement.dataset.temaEfectivo === 'oscuro';
    return {
      fondo: v('--fondo', '#F4F6F3'), superficie: v('--superficie', '#FFFFFF'), texto: v('--texto', '#17201D'),
      suave: v('--texto-suave', '#56645E'), linea: v('--linea', '#D9DFDA'), acento: v('--acento', '#1D5B76'),
      bien: v('--bien', '#1E7B45'), mal: v('--mal', '#B3261E'), rejilla: v('--rejilla', '#E7ECE8'),
      series: [1, 2, 3, 4, 5, 6, 7, 8].map(i => v('--serie-' + i, '#1D5B76')),
      oscuro,
    };
  }

  // ───────────── Números es-ES ─────────────
  function num(x, dec) {
    if (x === null || x === undefined || Number.isNaN(x)) return '—';
    if (!Number.isFinite(x)) return x > 0 ? '∞' : '−∞';
    const d = dec === undefined ? 2 : dec;
    if (Math.abs(x) < 0.5 * Math.pow(10, -d)) x = 0;
    const s = x.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: d, useGrouping: Math.abs(x) >= 10000 });
    return s.replace(/^-/, '−');
  }

  // ───────────── Aleatoriedad reproducible (mulberry32) ─────────────
  function aleatorio(semilla) {
    let a = (semilla === undefined ? 1 : semilla) >>> 0;
    const r = function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    r.normal = (mu = 0, sigma = 1) => {
      const u = 1 - r(), v = r();
      return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    r.entero = (min, max) => min + Math.floor(r() * (max - min + 1));
    return r;
  }

  // ───────────── Expresiones matemáticas seguras ─────────────
  function fact(n) {
    n = Math.round(n);
    if (n < 0) return NaN;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }
  function comb(n, k) {
    n = Math.round(n); k = Math.round(k);
    if (k < 0 || k > n) return 0;
    k = Math.min(k, n - k);
    let r = 1;
    for (let i = 1; i <= k; i++) r = r * (n - k + i) / i;
    return r;
  }
  function erf(x) { // Abramowitz-Stegun 7.1.26 (error < 1,5e-7)
    const s = Math.sign(x); x = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  }
  const FUNCS = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan,
    sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
    exp: Math.exp, log: Math.log, ln: Math.log, log2: Math.log2, log10: Math.log10, sqrt: Math.sqrt,
    abs: Math.abs, sign: Math.sign, floor: Math.floor, ceil: Math.ceil, round: Math.round,
    min: Math.min, max: Math.max, pow: Math.pow, fact, comb, erf,
  };
  const CONST = { pi: Math.PI, e: Math.E };

  function expr(texto, variables) {
    const permitidas = new Set(variables || ['x']);
    const src = String(texto);
    const toks = [];
    const re = /\s*(?:(\d+\.?\d*(?:[eE][-+]?\d+)?|\.\d+)|([A-Za-z_]\w*)|(\*\*|[-+*/^(),]))/y;
    let pos = 0;
    while (pos < src.length) {
      if (/^\s*$/.test(src.slice(pos))) break;
      re.lastIndex = pos;
      const m = re.exec(src);
      if (!m) throw new Error(`Expresión no válida cerca de "${src.slice(pos, pos + 8)}"`);
      pos = re.lastIndex;
      if (m[1] !== undefined) toks.push({ t: 'n', v: parseFloat(m[1]) });
      else if (m[2] !== undefined) toks.push({ t: 'id', v: m[2] });
      else toks.push({ t: 'op', v: m[3] === '**' ? '^' : m[3] });
    }
    let i = 0;
    const ver = () => toks[i];
    const tomar = (v) => {
      const t = toks[i];
      if (!t || (v && t.v !== v)) throw new Error(`Se esperaba "${v || 'algo'}" en "${src}"`);
      i++;
      return t;
    };
    // Gramática: suma := prod (('+'|'-') prod)* ; prod := unario (('*'|'/') unario | implícito)* ;
    // unario := '-' unario | pot ; pot := atomo ('^' unario)? ; atomo := n | id | id '(' args ')' | '(' suma ')'
    function suma() {
      let a = prod();
      while (ver() && ver().t === 'op' && (ver().v === '+' || ver().v === '-')) {
        const op = tomar().v, b = prod(), l = a;
        a = op === '+' ? (s) => l(s) + b(s) : (s) => l(s) - b(s);
      }
      return a;
    }
    function prod() {
      let a = unario();
      for (;;) {
        const t = ver();
        if (t && t.t === 'op' && (t.v === '*' || t.v === '/')) {
          const op = tomar().v, b = unario(), l = a;
          a = op === '*' ? (s) => l(s) * b(s) : (s) => l(s) / b(s);
        } else if (t && (t.t === 'n' || t.t === 'id' || t.v === '(')) { // multiplicación implícita: 2x, 2(x+1)
          const b = unario(), l = a;
          a = (s) => l(s) * b(s);
        } else return a;
      }
    }
    function unario() {
      const t = ver();
      if (t && t.t === 'op' && t.v === '-') { tomar(); const a = unario(); return (s) => -a(s); }
      if (t && t.t === 'op' && t.v === '+') { tomar(); return unario(); }
      return pot();
    }
    function pot() {
      const a = atomo();
      if (ver() && ver().v === '^') { tomar(); const b = unario(); return (s) => Math.pow(a(s), b(s)); }
      return a;
    }
    function atomo() {
      const t = tomar();
      if (t.t === 'n') return () => t.v;
      if (t.v === '(') { const a = suma(); tomar(')'); return a; }
      if (t.t === 'id') {
        if (ver() && ver().v === '(') {
          const f = FUNCS[t.v];
          if (!f) throw new Error(`Función desconocida "${t.v}"`);
          tomar('(');
          const args = [suma()];
          while (ver() && ver().v === ',') { tomar(); args.push(suma()); }
          tomar(')');
          return (s) => f(...args.map(g => g(s)));
        }
        if (permitidas.has(t.v)) return (s) => s[t.v];
        if (t.v in CONST) return () => CONST[t.v];
        throw new Error(`Variable desconocida "${t.v}" en "${src}"`);
      }
      throw new Error(`Símbolo inesperado "${t.v}" en "${src}"`);
    }
    const f = suma();
    if (i < toks.length) throw new Error(`Sobra "${toks[i].v}" en "${src}"`);
    return (vars) => { const y = f(vars || {}); return typeof y === 'number' ? y : NaN; };
  }

  // ───────────── DOM y SVG ─────────────
  function html(tag, attrs, ...hijos) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const h of hijos.flat(Infinity)) if (h !== null && h !== undefined && h !== false) e.append(h);
    return e;
  }
  function svgEl(tag, attrs, padre) {
    const e = document.createElementNS(SVGNS, tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === undefined || v === null) continue;
      if (k === 'text') e.textContent = v;
      else e.setAttribute(k, v);
    }
    if (padre) padre.appendChild(e);
    return e;
  }
  function svg(ancho, alto) {
    const s = svgEl('svg', { viewBox: `0 0 ${ancho} ${alto}`, width: ancho, height: alto, class: 'motor-svg' });
    s.style.maxWidth = '100%';
    s.style.height = 'auto';
    return s;
  }
  let nSlider = 0;
  function slider(o) {
    const id = 'sl-' + (++nSlider);
    const dec = o.decimales !== undefined ? o.decimales : Math.max(0, -Math.floor(Math.log10(o.paso || 1) + 1e-9));
    const salida = html('output', { for: id, class: 'slider-valor' });
    const input = html('input', { type: 'range', id, min: o.min, max: o.max, step: o.paso || 'any', value: o.valor });
    const fmt = o.formato || ((v) => num(v, dec));
    const pinta = () => {
      salida.textContent = fmt(parseFloat(input.value));
      input.setAttribute('aria-valuetext', salida.textContent);
      const a = parseFloat(input.min), b = parseFloat(input.max);
      input.style.setProperty('--p', (b > a ? 100 * (parseFloat(input.value) - a) / (b - a) : 0) + '%');
    };
    pinta();
    input.addEventListener('input', () => { pinta(); if (o.alCambiar) o.alCambiar(parseFloat(input.value)); });
    if (window.MutationObserver) new MutationObserver(pinta).observe(input, { attributes: true, attributeFilter: ['min', 'max'] });
    // Botones − / + (solo visibles en táctil, §8b) cuando el deslizador tiene más pasos de los que el dedo acierta.
    const pasoFino = o.paso || (o.max - o.min) / 100;
    const fino = o.fino !== undefined ? o.fino : (o.max - o.min) / pasoFino > 40;
    const empujar = (s) => {
      const antes = input.value;
      if (o.paso) { if (s > 0) input.stepUp(); else input.stepDown(); }
      else input.value = Math.min(o.max, Math.max(o.min, parseFloat(input.value) + s * pasoFino));
      if (input.value !== antes) input.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const bPaso = (s) => html('button', { type: 'button', class: 'slider-paso', 'aria-label': (s > 0 ? 'Subir ' : 'Bajar ') + o.etiqueta, onclick: () => empujar(s) }, s > 0 ? '+' : '−');
    const cont = html('div', { class: 'slider' + (fino ? ' con-pasos' : '') }, html('label', { for: id, text: o.etiqueta }), salida, fino && bPaso(-1), input, fino && bPaso(1));
    Object.defineProperty(cont, 'valor', {
      get: () => parseFloat(input.value),
      set: (v) => { input.value = v; pinta(); },
    });
    cont.input = input;
    return cont;
  }
  function boton(texto, fn, attrs) {
    return html('button', Object.assign({ type: 'button', class: 'boton', onclick: fn }, attrs || {}), texto);
  }
  function fila(...els) { return html('div', { class: 'motor-fila' }, ...els); }
  // MathJax se carga con "defer": espera a que exista antes de componer.
  let mathjax = null;
  function mathjaxListo() {
    if (mathjax) return mathjax;
    mathjax = new Promise((ok) => {
      const listo = () => (window.MathJax && MathJax.startup && MathJax.startup.promise ? MathJax.startup.promise.then(ok, ok) : ok());
      if (window.MathJax && MathJax.typesetPromise) return listo();
      const s = document.querySelector('script[src*="tex-svg"]');
      if (!s) return ok();
      let intentos = 0;
      const mirar = setInterval(() => {
        if ((window.MathJax && MathJax.typesetPromise) || ++intentos > 200) { clearInterval(mirar); listo(); }
      }, 50);
      s.addEventListener('error', () => { clearInterval(mirar); ok(); });
    });
    return mathjax;
  }
  function tex(el) {
    return mathjaxListo().then(() => {
      if (!window.MathJax || !MathJax.typesetPromise) return undefined;
      return MathJax.typesetPromise([el]);
    }).catch((e) => console.error('[MathJax]', e));
  }

  // Escala lineal y marcas de eje "bonitas"
  function escala(d0, d1, r0, r1) {
    const k = (r1 - r0) / ((d1 - d0) || 1);
    const f = (v) => r0 + (v - d0) * k;
    f.inversa = (p) => d0 + (p - r0) / k;
    return f;
  }
  function marcas(min, max, n) {
    const span = max - min;
    if (!(span > 0)) return [min];
    const paso0 = span / (n || 5);
    const mag = Math.pow(10, Math.floor(Math.log10(paso0)));
    const r = paso0 / mag;
    const paso = (r < 1.5 ? 1 : r < 3 ? 2 : r < 7 ? 5 : 10) * mag;
    const out = [];
    for (let v = Math.ceil(min / paso - 1e-9) * paso; v <= max + paso * 1e-9; v += paso) out.push(Math.abs(v) < paso * 1e-9 ? 0 : v);
    return out;
  }

  // ───────────── Contrato táctil (ESPEC-WEB.md §8b) ─────────────
  const mq = (q) => !!(window.matchMedia && matchMedia(q).matches);
  const gruesa = () => mq('(pointer: coarse)');
  const reducido = () => mq('(prefers-reduced-motion: reduce)');
  const raizDe = (e) => (e && e.closest && e.closest('.motor')) || document.body;
  const ANCHO_APILADO = 560;
  const estrecho = (e) => raizDe(e).dataset.disposicion === 'apilada';

  // Burbuja de valor: una por widget y dentro de él (así también se ve a pantalla completa).
  // Se coloca centrada en x y con su borde inferior "arriba" píxeles por encima de y (coordenadas de ventana).
  let fijada = null;
  function burbuja(raiz, texto, x, y, arriba) {
    let b = raiz._burbuja;
    if (texto === null || texto === undefined || texto === '') {
      if (b) b.hidden = true;
      if (fijada && fijada.raiz === raiz) fijada = null;
      return;
    }
    if (!b || !b.isConnected) { b = raiz._burbuja = html('div', { class: 'motor-burbuja', 'aria-hidden': 'true' }); raiz.append(b); }
    b.textContent = texto;
    b.hidden = false;
    const r = raiz.getBoundingClientRect(), fijo = raiz.classList.contains('motor-ampliado');
    const bw = b.offsetWidth, bh = b.offsetHeight;
    const px = Math.max(2, Math.min(r.width - bw - 2, x - r.left - bw / 2));
    const py = Math.max(fijo ? 2 : -bh - 4, y - r.top - (arriba || 0) - bh);
    b.style.left = (px + raiz.scrollLeft) + 'px';
    b.style.top = (py + raiz.scrollTop) + 'px';
  }

  // Punto de un evento de puntero en las unidades del viewBox de un SVG.
  function aSvg(s, p) {
    const r = s.getBoundingClientRect(), vb = s.viewBox.baseVal;
    return { x: vb.x + (p.x - r.left) * vb.width / (r.width || 1), y: vb.y + (p.y - r.top) * vb.height / (r.height || 1) };
  }

  // arrastrable(elemento, {zona, clave, radio, tactil, etiqueta, valor(), alEmpezar(p), alMover(p), alSoltar(p, cancelado), alTecla(dx, dy)})
  // Un solo pointerdown por zona elige el asa más cercana dentro de su radio (≥ 24 px). La zona debe sobrevivir
  // a los redibujados; si el asa se recrea en cada redibujado, dale una "clave" estable. p = {x, y, dx, dy, tipo}.
  const zonasArrastre = new WeakMap();
  let nAsa = 0;
  function rotular(asa) {
    const v = asa.o.valor ? asa.o.valor() : '';
    asa.el.setAttribute('aria-label', (asa.o.etiqueta || 'Punto arrastrable') + (v ? ': ' + v : ''));
    if (v) asa.el.setAttribute('aria-valuetext', v);
  }
  function arrastrable(elemento, o) {
    o = o || {};
    const zona = o.zona || elemento.ownerSVGElement || elemento;
    let z = zonasArrastre.get(zona);
    if (!z) {
      z = { asas: [], activa: null, foco: null };
      zonasArrastre.set(zona, z);
      zona.addEventListener('pointerdown', (e) => empezarArrastre(zona, z, e));
    }
    const asa = { el: elemento, o, clave: o.clave || 'asa-' + (++nAsa), radio: Math.max(24, o.radio === undefined ? 24 : o.radio), tactil: o.tactil || 'none' };
    const muchas = z.asas.length >= 64;
    z.asas = z.asas.filter(a => a.clave !== asa.clave && (!muchas || a.el.isConnected));
    z.asas.push(asa);
    // Chrome ignora touch-action en las formas SVG: va en la zona (HTML o <svg> raíz) y en el <svg> del asa.
    zona.style.touchAction = asa.tactil;
    if (elemento.ownerSVGElement && elemento.ownerSVGElement !== zona) elemento.ownerSVGElement.style.touchAction = asa.tactil;
    elemento.setAttribute('data-arrastrable', asa.clave);
    elemento.setAttribute('tabindex', '0');
    elemento.setAttribute('role', 'slider');
    rotular(asa);
    if (z.activa === asa.clave) elemento.setAttribute('data-arrastrando', '');
    elemento.addEventListener('keydown', (e) => {
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
      if (!d || !o.alTecla) return;
      e.preventDefault();
      e.stopPropagation();
      const k = e.shiftKey ? 10 : 1;
      z.foco = asa.clave;   // si el motor redibuja y recrea el asa, la nueva recupera el foco
      try { o.alTecla(d[0] * k, d[1] * k, e); } finally { z.foco = null; }
      if (elemento.isConnected) rotular(asa);
    });
    if (z.foco === asa.clave) { z.foco = null; try { elemento.focus({ preventScroll: true }); } catch (x) { /* nada */ } }
    return elemento;
  }
  function empezarArrastre(zona, z, e) {
    if (z.sesion || (e.pointerType === 'mouse' && e.button !== 0)) return;
    z.asas = z.asas.filter(a => a.el.isConnected);
    let mejor = null, dMejor = Infinity;
    for (const a of z.asas) {
      const r = a.el.getBoundingClientRect();
      const fuera = Math.hypot(Math.max(r.left - e.clientX, 0, e.clientX - r.right), Math.max(r.top - e.clientY, 0, e.clientY - r.bottom));
      const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      if (fuera <= a.radio && d < dMejor) { mejor = a; dMejor = d; }
    }
    if (!mejor) return;
    const clave = mejor.clave, raiz = raizDe(zona);
    const actual = () => z.asas.find(a => a.clave === clave) || mejor;
    const s = z.sesion = { id: e.pointerId, x0: e.clientX, y0: e.clientY, iniciado: false, ultimo: null, raf: 0 };
    const punto = (ev) => ({ x: ev.clientX, y: ev.clientY, dx: ev.clientX - s.x0, dy: ev.clientY - s.y0, tipo: ev.pointerType, evento: ev });
    const vaciar = () => {   // un movimiento por fotograma
      s.raf = 0;
      const ev = s.ultimo;
      if (!ev) return;
      s.ultimo = null;
      const a = actual();
      if (a.o.alMover) a.o.alMover(punto(ev));
      const b = actual();
      if (b.el.isConnected) rotular(b);
      if (b.o.valor) burbuja(raiz, b.o.valor(), ev.clientX, ev.clientY, ev.pointerType === 'touch' ? 40 : 24);
    };
    const iniciar = (ev) => {
      s.iniciado = true;
      z.activa = clave;
      try { zona.setPointerCapture(s.id); } catch (x) { /* el puntero ya no existe */ }
      const a = actual();
      a.el.setAttribute('data-arrastrando', '');
      if (a.o.alEmpezar) a.o.alEmpezar(punto(ev));
      s.ultimo = ev;
      vaciar();
    };
    const mover = (ev) => {
      if (ev.pointerId !== s.id) return;
      if (!s.iniciado) {   // con pan-y el gesto puede ser un scroll: se espera a ver que es horizontal
        const dx = Math.abs(ev.clientX - s.x0), dy = Math.abs(ev.clientY - s.y0);
        if (dx < 8 || dx < dy) return;
        iniciar(ev);
        return;
      }
      s.ultimo = ev;
      if (!s.raf) s.raf = requestAnimationFrame(vaciar);
    };
    const fin = (ev) => {
      if (ev.pointerId !== s.id) return;
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', fin);
      window.removeEventListener('pointercancel', fin);
      const cancelado = ev.type === 'pointercancel';
      if (s.raf) { cancelAnimationFrame(s.raf); vaciar(); }
      if (!s.iniciado && !cancelado) iniciar(ev);   // toque sin arrastre: el asa salta ahí
      z.sesion = null;
      z.activa = null;
      burbuja(raiz, null);
      const a = actual();
      a.el.removeAttribute('data-arrastrando');
      if (s.iniciado && a.o.alSoltar) a.o.alSoltar(punto(ev), cancelado);
    };
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', fin);
    window.addEventListener('pointercancel', fin);
    if (e.pointerType === 'mouse') e.preventDefault();   // sin selección de texto al arrastrar
    if (!(e.pointerType === 'touch' && mejor.tactil !== 'none')) iniciar(e);
  }

  // pellizcar(zona, {alEmpezar(), alMover({escala, dx, dy, cx, cy}), alSoltar()}): gesto de dos dedos (táctil o lápiz)
  // sobre la zona. escala = cambio relativo de la distancia entre dedos; dx, dy = desplazamiento del punto medio;
  // cx, cy = punto medio en píxeles de ventana. Compatible con arrastrable: la zona debe llevar touch-action: none.
  function pellizcar(zona, o) {
    const dedos = new Map();
    let ult = null;
    const medir = () => {
      const [a, b] = Array.from(dedos.values());
      return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
    };
    zona.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (dedos.size === 2) { ult = medir(); if (o.alEmpezar) o.alEmpezar(); }
    });
    window.addEventListener('pointermove', (e) => {
      const p = dedos.get(e.pointerId);
      if (!p) return;
      p.x = e.clientX; p.y = e.clientY;
      if (dedos.size === 2 && ult) {
        const m = medir();
        o.alMover({ escala: m.d / ult.d, dx: m.cx - ult.cx, dy: m.cy - ult.cy, cx: m.cx, cy: m.cy });
        ult = m;
      }
    });
    const fin = (e) => {
      if (!dedos.delete(e.pointerId)) return;
      if (ult && dedos.size < 2) { ult = null; if (o.alSoltar) o.alSoltar(); }
    };
    window.addEventListener('pointerup', fin);
    window.addEventListener('pointercancel', fin);
  }

  // inspeccionable(elemento, texto | () => texto): sustituye a <title> y al hover. Con ratón, la etiqueta sale al
  // pasar por encima; con el dedo, al tocar, y se queda hasta tocar en otro sitio (o otra vez en el mismo).
  let ultimoPuntero = 'mouse';
  function inspeccionable(elemento, textoFn) {
    const texto = () => (typeof textoFn === 'function' ? textoFn() : textoFn);
    const sobre = (x) => { const r = elemento.getBoundingClientRect(); burbuja(raizDe(elemento), texto(), x === undefined ? r.left + r.width / 2 : x, r.top, 6); };
    elemento.setAttribute('data-inspeccionable', '');
    elemento.setAttribute('aria-label', texto());
    elemento.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { fijada = null; sobre(e.clientX); } });
    elemento.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' && !fijada) sobre(e.clientX); });
    elemento.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && !fijada) burbuja(raizDe(elemento), null); });
    elemento.addEventListener('click', (e) => {
      if ((e.pointerType || ultimoPuntero) === 'mouse') return;
      if (fijada && fijada.el === elemento) { burbuja(fijada.raiz, null); return; }
      if (fijada) burbuja(fijada.raiz, null);
      sobre();
      fijada = { el: elemento, raiz: raizDe(elemento) };
    });
    return elemento;
  }
  document.addEventListener('pointerdown', (e) => {
    ultimoPuntero = e.pointerType || 'mouse';
    if (fijada && !(e.target.closest && e.target.closest('[data-inspeccionable]'))) burbuja(fijada.raiz, null);
  }, true);

  // Selector de opción (control segmentado en escritorio, chips en táctil). opciones: [{valor, texto}].
  function segmentado(opciones, o) {
    o = o || {};
    let sel = o.valor;
    const cont = html('div', { class: 'motor-selector motor-segmentado', role: 'group', 'aria-label': o.etiqueta || 'Opciones' },
      o.titulo ? html('span', { class: 'segmentado-titulo', text: o.titulo }) : null);
    const pintar = () => cont.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-pressed', String(opciones[k].valor === sel)));
    opciones.forEach(op => cont.append(boton(op.texto, () => { sel = op.valor; pintar(); if (o.alCambiar) o.alCambiar(sel); })));
    cont.poner = (v) => { sel = v; pintar(); };
    Object.defineProperty(cont, 'valor', { get: () => sel });
    pintar();
    return cont;
  }

  // Barra de pasos: Anterior · contador · [Reproducir/Pausa] · Siguiente · Reiniciar. Botones de 48 px en táctil.
  // o: {alAnterior, alSiguiente, alReiniciar, alReproducir?}; barra.poner(i, n, reproduciendo) actualiza el estado.
  function barraPasos(o) {
    const b = (icono, texto, fn, etiqueta, clase, detras) => {
      const partes = [html('span', { class: 'bp-icono', 'aria-hidden': 'true', text: icono }), html('span', { class: 'bp-texto', text: texto })];
      return boton(detras ? partes.reverse() : partes, fn, { 'aria-label': etiqueta, class: 'boton ' + (clase || '') });
    };
    const bAnt = b('←', 'Anterior', o.alAnterior, 'Paso anterior', 'bp-anterior');
    const bSig = b('→', 'Siguiente', o.alSiguiente, 'Paso siguiente', 'bp-siguiente boton-principal', true);
    const bRep = o.alReproducir ? b('▶', 'Reproducir', o.alReproducir, 'Reproducir', 'bp-reproducir bp-compacto') : null;
    const bIni = b('↺', 'Reiniciar', o.alReiniciar, 'Reiniciar', 'bp-reiniciar bp-compacto');
    const largo = html('span', { class: 'bp-largo' }), corto = html('span', { class: 'bp-corto', 'aria-hidden': 'true' });
    const contador = html('span', { class: 'pasos-contador' }, largo, corto);
    const barra = html('div', { class: 'motor-barra-pasos' + (bRep ? ' con-reproducir' : ''), role: 'toolbar', 'aria-label': 'Pasos' }, bAnt, contador, bRep, bSig, bIni);
    barra.poner = (i, n, reproduciendo) => {
      largo.textContent = `Paso ${i + 1} de ${n}`;
      corto.textContent = `${i + 1} / ${n}`;
      bAnt.disabled = i <= 0;
      bSig.disabled = i >= n - 1;
      if (bRep) {
        bRep.firstChild.textContent = reproduciendo ? '⏸' : '▶';
        bRep.lastChild.textContent = reproduciendo ? 'Pausa' : 'Reproducir';
        bRep.setAttribute('aria-label', reproduciendo ? 'Pausa' : 'Reproducir');
      }
    };
    return barra;
  }

  // Zonas del widget: gráfico y controles. Apiladas (gráfico arriba) en la ficha; al ampliar, controles abajo
  // o, en horizontal, a la derecha. Con pieFijo, los controles quedan pegados al pie mientras se ve el widget.
  function zonas(el, o) {
    const grafico = html('div', { class: 'motor-zona-grafico' });
    const controles = html('div', { class: 'motor-zona-controles' + (o && o.pieFijo ? ' motor-pie-fijo' : '') });
    el.classList.add('con-zonas');
    el.append(grafico, controles);
    return { grafico, controles };
  }

  // Tamaño del gráfico según el ancho del contenedor (no el de la ventana): 4:3 en estrecho, nunca más del 70 %
  // del alto de la pantalla; ampliado, aprovecha el alto disponible.
  function medida(cont, o) {
    o = o || {};
    const raiz = raizDe(cont), amp = raiz !== document.body && raiz.classList.contains('motor-ampliado');
    const disponible = cont.clientWidth || raiz.clientWidth || 640;
    const ancho = Math.max(o.minAncho || 280, Math.min(disponible, amp ? 1400 : (o.maxAncho || 900)));
    const angosto = ancho < ANCHO_APILADO;
    const vh = window.innerHeight || 800, horizontal = amp && window.innerWidth > vh && window.innerWidth >= 600;
    let alto = ancho * (angosto ? (o.proporcionEstrecha || 0.75) : (o.proporcion || 0.6));
    const tope = amp ? (horizontal ? vh - 150 : vh * 0.52) : Math.min(o.maxAlto || 400, vh * 0.7);
    alto = Math.round(Math.min(Math.max(alto, angosto || amp ? 0 : (o.minAlto || 200)), Math.max(tope, 160)));
    return { ancho, alto, estrecho: angosto, ampliado: amp };
  }

  // Tamaño de letra para un SVG ya insertado: compensa la escala del viewBox y, en táctil o en estrecho,
  // garantiza 12 px reales en pantalla.
  function fuente(s, px) {
    const vb = s.viewBox && s.viewBox.baseVal, w = s.isConnected ? s.getBoundingClientRect().width : 0;
    const k = vb && vb.width && w ? Math.min(1, w / vb.width) : 1;
    const minimo = gruesa() || estrecho(s) || mq('(max-width: 1023.98px)') ? 12 : 0;
    return Math.max(px || 12, minimo) / k;
  }

  // Canvas nítido: resolución a devicePixelRatio (máx. 2) y contexto ya escalado a píxeles CSS.
  function lienzoNitido(canvas, ancho, alto) {
    const r = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(ancho * r);
    canvas.height = Math.round(alto * r);
    canvas.style.width = ancho + 'px';
    canvas.style.maxWidth = '100%';
    canvas.style.height = 'auto';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(r, 0, 0, r, 0, 0);
    return ctx;
  }

  // Animaciones: bucle(el, paso(dt)) solo trabaja mientras el widget está en pantalla; paso devuelve false para terminar.
  const enPantalla = (e) => { const r = raizDe(e)._motor; return !r || r.visible !== false; };
  function bucle(el, paso) {
    let raf = 0, activo = false, t0 = 0;
    const tic = (t) => {
      raf = 0;
      if (!activo) return;
      if (!el.isConnected) { activo = false; return; }
      if (!enPantalla(el)) return;   // lo reanuda el observador de visibilidad
      const dt = t0 ? Math.min(100, t - t0) : 16;
      t0 = t;
      if (paso(dt) === false) { activo = false; return; }
      raf = requestAnimationFrame(tic);
    };
    const b = {
      iniciar() { if (!activo) { activo = true; b.seguir(); } },
      parar() { activo = false; if (raf) cancelAnimationFrame(raf); raf = 0; },
      seguir() { if (activo && !raf) { t0 = 0; raf = requestAnimationFrame(tic); } },
      get activo() { return activo; },
    };
    const raiz = raizDe(el);
    (raiz._bucles = raiz._bucles || []).push(b);
    return b;
  }

  const api = {
    colores, num, aleatorio, expr, slider, boton, fila, tex, svg, el: svgEl, html, escala, marcas,
    arrastrable, pellizcar, inspeccionable, aSvg, segmentado, barraPasos, zonas, medida, fuente, lienzoNitido, bucle, enPantalla, estrecho, gruesa, reducido,
  };

  // ───────────── Ampliar a pantalla completa ─────────────
  // Panel fijo que ocupa la pantalla (y Fullscreen API si el navegador la concede). Añade una entrada al
  // historial, como las hojas inferiores: Atrás, Esc o ✕ lo cierran. El DOM del motor no se toca: conserva su estado.
  let amp = null;
  const ICONOS = { ampliar: 'M2 6V2h4M14 10v4h-4M10 2h4v4M6 14H2v-4', cerrar: 'M3 3l10 10M13 3L3 13' };
  function ponBotonAmpliar(el) {
    const b = el.querySelector(':scope > .motor-cab .motor-ampliar');
    if (!b) return;
    const a = !!(amp && amp.el === el);
    const ico = svgEl('svg', { viewBox: '0 0 16 16', width: 16, height: 16, 'aria-hidden': 'true' });
    svgEl('path', { d: a ? ICONOS.cerrar : ICONOS.ampliar, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ico);
    b.replaceChildren(ico, a ? 'Cerrar' : 'Ampliar');
    b.setAttribute('aria-label', a ? 'Cerrar la pantalla completa' : 'Ampliar el interactivo a pantalla completa');
  }
  function refrescar(el) {
    disponer(el);
    const reg = el._motor;
    if (reg) { reg.ancho = el.clientWidth; if (reg.redibujar) reg.redibujar(); }
  }
  function ampliar(el) {
    if (amp || !el.isConnected) return;
    amp = { el, id: 'amp-' + Date.now().toString(36), fs: false };
    el.classList.add('motor-ampliado');
    document.documentElement.classList.add('motor-ampliado-activo');
    try { history.pushState(Object.assign({}, history.state, { ampliado: amp.id }), ''); } catch (x) { /* sin historial */ }
    if (el.requestFullscreen) {
      try { const pr = el.requestFullscreen({ navigationUI: 'hide' }); if (pr && pr.catch) pr.catch(() => {}); } catch (x) { /* queda el panel fijo */ }
    }
    ponBotonAmpliar(el);
    refrescar(el);
    const b = el.querySelector(':scope > .motor-cab .motor-ampliar');
    if (b) b.focus({ preventScroll: true });
  }
  function quitarAmpliado() {
    if (!amp) return;
    const el = amp.el;
    amp = null;
    el.classList.remove('motor-ampliado');
    document.documentElement.classList.remove('motor-ampliado-activo');
    if (document.fullscreenElement === el && document.exitFullscreen) { const pr = document.exitFullscreen(); if (pr && pr.catch) pr.catch(() => {}); }
    if (!el.isConnected) return;
    ponBotonAmpliar(el);
    refrescar(el);
    el.scrollIntoView({ block: 'nearest' });
    const b = el.querySelector(':scope > .motor-cab .motor-ampliar');
    if (b) b.focus({ preventScroll: true });
  }
  // Cierre pedido desde la interfaz: se deshace la entrada del historial y popstate quita el panel.
  function cerrarAmpliado() {
    if (!amp) return;
    if (history.state && history.state.ampliado === amp.id) history.back(); else quitarAmpliado();
  }
  window.addEventListener('popstate', (e) => { if (amp && !(e.state && e.state.ampliado === amp.id)) quitarAmpliado(); });
  document.addEventListener('fullscreenchange', () => {
    if (!amp) return;
    if (document.fullscreenElement === amp.el) amp.fs = true;
    else if (amp.fs) cerrarAmpliado();   // el sistema salió de pantalla completa (Atrás o Esc)
    if (amp) refrescar(amp.el);
  });
  document.addEventListener('keydown', (e) => { if (amp && e.key === 'Escape' && !document.fullscreenElement) { e.preventDefault(); cerrarAmpliado(); } });
  let ajuste = 0;
  window.addEventListener('resize', () => {   // al girar el móvil cambia el alto disponible aunque no cambie el ancho
    if (!amp || ajuste) return;
    ajuste = requestAnimationFrame(() => { ajuste = 0; if (amp) refrescar(amp.el); });
  });

  // ───────────── Disposición y visibilidad ─────────────
  function disponer(el) {
    const w = el.clientWidth;
    if (w) el.dataset.disposicion = w < ANCHO_APILADO ? 'apilada' : 'ancha';
  }
  const observador = window.IntersectionObserver ? new IntersectionObserver((entradas) => {
    for (const en of entradas) {
      const reg = en.target._motor;
      if (!reg || reg.visible === en.isIntersecting) continue;
      reg.visible = en.isIntersecting;
      const fn = reg.inst[reg.visible ? 'reanudar' : 'pausar'];
      try { if (fn) fn(); } catch (e) { console.error(e); }
      if (reg.visible) (en.target._bucles || []).forEach(b => b.seguir());
    }
  }, { rootMargin: '80px' }) : null;

  // ───────────── Registro, carga y montaje ─────────────
  function registrar(nombre, fn, opciones) {
    registro[nombre] = { fn, ejemplos: (opciones && opciones.ejemplos) || {} };
  }
  function base() {
    if (Motores.base) return Motores.base;
    const s = document.querySelector('script[src$="motores/nucleo.js"]');
    return s ? s.getAttribute('src').replace(/nucleo\.js$/, '') : 'motores/';
  }
  function cargarArchivo(nombre) {
    return new Promise((ok, ko) => {
      const s = document.createElement('script');
      s.src = base() + nombre + '.js';
      s.onload = () => (registro[nombre] ? ok(registro[nombre]) : ko(new Error(`El archivo no registró el motor "${nombre}"`)));
      s.onerror = () => ko(new Error(`No se pudo cargar motores/${nombre}.js`));
      document.head.appendChild(s);
    });
  }
  // Un motor puede repartir sus modos más pesados en motores/<motor>-<modo>.js (p. ej. "rejilla"),
  // cargados bajo demanda por el motor base. Si alguien pide ese archivo como motor de primer nivel
  // (el banco de pruebas de motores lo hace: recorre todos los .js de esta carpeta), el archivo no
  // se registra a sí mismo: aquí lo resolvemos como "<modo> del motor base" reutilizando su ejemplo.
  function cargar(nombre) {
    if (registro[nombre]) return Promise.resolve(registro[nombre]);
    if (!/^[\w-]+$/.test(nombre)) return Promise.reject(new Error('Nombre de motor no válido'));
    if (!cargas[nombre]) {
      cargas[nombre] = cargarArchivo(nombre).catch((e) => {
        const i = nombre.indexOf('-');
        if (i < 0) throw e;
        const base_ = nombre.slice(0, i), modo = nombre.slice(i + 1);
        return cargar(base_).then((m) => {
          const ejemplo = m.ejemplos && m.ejemplos[modo];
          if (typeof m.fn !== 'function' || !ejemplo) throw e;
          const entrada = { fn: (el, p, api) => m.fn(el, Object.assign({ modo }, p), api), ejemplos: { '-': ejemplo } };
          registro[nombre] = entrada;
          return entrada;
        }, () => { throw e; });
      }).catch((e) => { delete cargas[nombre]; throw e; });
    }
    return cargas[nombre];
  }
  const vivos = new Set();
  function fallo(el, nombre, e) {
    console.error(`[motor ${nombre}]`, e);
    el.innerHTML = '';
    el.append(html('p', { class: 'motor-error', role: 'alert', text: 'El interactivo no se pudo cargar.' }));
  }
  // opciones.perezoso: el motor no se crea hasta que el contenedor se acerca a la pantalla (la promesa espera).
  function montar(el, nombre, params, opciones) {
    if (opciones && opciones.perezoso && window.IntersectionObserver) {
      return new Promise((ok) => {
        const io = new IntersectionObserver((es) => {
          if (!es.some(en => en.isIntersecting)) return;
          io.disconnect();
          ok(montar(el, nombre, params));
        }, { rootMargin: '400px' });
        io.observe(el);
      });
    }
    el.innerHTML = '';
    el.classList.add('motor', 'motor-' + nombre);
    el.classList.remove('con-zonas');
    el._bucles = [];
    el._motor = null;
    disponer(el);
    return cargar(nombre).then((m) => {
      let inst;
      try {
        inst = m.fn(el, params || {}, api) || {};
      } catch (e) { fallo(el, nombre, e); return null; }
      const b = boton('', () => (amp && amp.el === el ? cerrarAmpliado() : ampliar(el)), { class: 'boton motor-ampliar' });
      el.prepend(html('div', { class: 'motor-cab' }, b));
      ponBotonAmpliar(el);
      const seguro = (fn) => () => { try { burbuja(el, null); fn(); } catch (e) { fallo(el, nombre, e); } };
      const reg = { el, inst, ancho: el.clientWidth, visible: true };
      if (inst.redibujar) reg.redibujar = seguro(inst.redibujar);
      if (window.ResizeObserver) {
        let pendiente = false;
        reg.ro = new ResizeObserver(() => {
          if (pendiente || Math.abs(el.clientWidth - reg.ancho) < 2) return;
          pendiente = true;
          requestAnimationFrame(() => { pendiente = false; reg.ancho = el.clientWidth; disponer(el); if (reg.redibujar) reg.redibujar(); });
        });
        reg.ro.observe(el);
      }
      vivos.add(reg);
      el._motor = reg;
      if (observador) observador.observe(el);
      return inst;
    }).catch((e) => { fallo(el, nombre, e); return null; });
  }
  function desmontar(el) {
    if (amp && el !== amp.el && el.contains(amp.el)) quitarAmpliado();
    for (const reg of Array.from(vivos)) {
      if (el === reg.el || el.contains(reg.el)) {
        if (reg.ro) reg.ro.disconnect();
        if (observador) observador.unobserve(reg.el);
        (reg.el._bucles || []).forEach(b => b.parar());
        try { if (reg.inst.destruir) reg.inst.destruir(); } catch (e) { console.error(e); }
        vivos.delete(reg);
      }
    }
  }
  // Tema: la app emite document 'tema'; los motores vivos se redibujan.
  document.addEventListener('tema', () => {
    for (const reg of Array.from(vivos)) {
      if (!document.body.contains(reg.el)) { if (reg.ro) reg.ro.disconnect(); vivos.delete(reg); continue; }
      if (reg.redibujar) reg.redibujar();
    }
  });

  window.Motores = { registrar, cargar, montar, desmontar, ampliar, cerrarAmpliado, api, registro, base: null };
})();
