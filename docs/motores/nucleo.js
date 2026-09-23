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
    const pinta = () => { salida.textContent = fmt(parseFloat(input.value)); input.setAttribute('aria-valuetext', salida.textContent); };
    pinta();
    input.addEventListener('input', () => { pinta(); if (o.alCambiar) o.alCambiar(parseFloat(input.value)); });
    const cont = html('div', { class: 'slider' }, html('label', { for: id, text: o.etiqueta }), input, salida);
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

  const api = { colores, num, aleatorio, expr, slider, boton, fila, tex, svg, el: svgEl, html, escala, marcas };

  // ───────────── Registro, carga y montaje ─────────────
  function registrar(nombre, fn, opciones) {
    registro[nombre] = { fn, ejemplos: (opciones && opciones.ejemplos) || {} };
  }
  function base() {
    if (Motores.base) return Motores.base;
    const s = document.querySelector('script[src$="motores/nucleo.js"]');
    return s ? s.getAttribute('src').replace(/nucleo\.js$/, '') : 'motores/';
  }
  function cargar(nombre) {
    if (registro[nombre]) return Promise.resolve(registro[nombre]);
    if (!/^[\w-]+$/.test(nombre)) return Promise.reject(new Error('Nombre de motor no válido'));
    if (!cargas[nombre]) {
      cargas[nombre] = new Promise((ok, ko) => {
        const s = document.createElement('script');
        s.src = base() + nombre + '.js';
        s.onload = () => (registro[nombre] ? ok(registro[nombre]) : ko(new Error(`El archivo no registró el motor "${nombre}"`)));
        s.onerror = () => { delete cargas[nombre]; ko(new Error(`No se pudo cargar motores/${nombre}.js`)); };
        document.head.appendChild(s);
      });
    }
    return cargas[nombre];
  }
  const vivos = new Set();
  function fallo(el, nombre, e) {
    console.error(`[motor ${nombre}]`, e);
    el.innerHTML = '';
    el.append(html('p', { class: 'motor-error', role: 'alert', text: 'El interactivo no se pudo cargar.' }));
  }
  function montar(el, nombre, params) {
    el.innerHTML = '';
    el.classList.add('motor', 'motor-' + nombre);
    return cargar(nombre).then((m) => {
      let inst;
      try {
        inst = m.fn(el, params || {}, api) || {};
      } catch (e) { fallo(el, nombre, e); return null; }
      const seguro = (fn) => () => { try { fn(); } catch (e) { fallo(el, nombre, e); } };
      const reg = { el, inst, ancho: el.clientWidth };
      if (inst.redibujar) {
        let pendiente = false;
        reg.redibujar = seguro(inst.redibujar);
        if (window.ResizeObserver) {
          reg.ro = new ResizeObserver(() => {
            if (pendiente || Math.abs(el.clientWidth - reg.ancho) < 2) return;
            pendiente = true;
            requestAnimationFrame(() => { pendiente = false; reg.ancho = el.clientWidth; reg.redibujar(); });
          });
          reg.ro.observe(el);
        }
      }
      vivos.add(reg);
      el._motor = reg;
      return inst;
    }).catch((e) => { fallo(el, nombre, e); return null; });
  }
  function desmontar(el) {
    for (const reg of Array.from(vivos)) {
      if (el === reg.el || el.contains(reg.el)) {
        if (reg.ro) reg.ro.disconnect();
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

  window.Motores = { registrar, cargar, montar, desmontar, api, registro, base: null };
})();
