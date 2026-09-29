#!/usr/bin/env python3
"""Abre cada ficha en un navegador sin interfaz y detecta errores de consola, fórmulas sin procesar
e interactivos vacíos. Guarda capturas en capturas/ (ignorada por git).

  python tools/probar_web.py --lote L07          fichas del lote
  python tools/probar_web.py --id kmeans --movil  una ficha, también a 390 px
  python tools/probar_web.py --todas
  python tools/probar_web.py --demo [motor]    página de demostración de motores (docs/demo.html)
  python tools/probar_web.py --id kmeans --esencial --oscuro   vista Esencial en tema oscuro
  python tools/probar_web.py --demo --android      emulación Pixel 7: desborde, objetivos táctiles, texto
                                                   y arrastre con el dedo de [data-arrastrable]
  python tools/probar_web.py --vistas --movil  inicio, mapa, rutas, glosario y repaso (espera body[data-listo=<vista>])

Requiere una vez:  pip install playwright  &&  python -m playwright install chromium
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import fuentes as F  # noqa: E402

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.exit('Playwright no está instalado: pip install playwright && python -m playwright install chromium')


REVISION_MOVIL = r'''() => {
  const vw = document.documentElement.clientWidth, out = {desborde: document.documentElement.scrollWidth - vw, pequenos: [], texto: []};
  const visible = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0'; };
  const nombre = e => (e.getAttribute('aria-label') || e.textContent || e.value || e.tagName).trim().slice(0, 25) || e.tagName;
  for (const e of document.querySelectorAll('button, input, select, textarea, summary, [role=button], [role=tab], a')) {
    if (!visible(e)) continue;
    if (e.tagName === 'A' && e.closest('p, li, td, dd, .xref')) continue;          // enlaces dentro de texto corrido
    if (e.type === 'range') { if (e.getBoundingClientRect().height < 28) out.pequenos.push('slider ' + nombre(e)); continue; }
    const r = e.getBoundingClientRect();
    if (Math.min(r.width, r.height) < 44) out.pequenos.push(`${nombre(e)} (${Math.round(r.width)}×${Math.round(r.height)})`);
  }
  for (const e of document.querySelectorAll('p, li, span, td, th, label, button, text, tspan, small, figcaption')) {
    if (!visible(e) || !e.textContent.trim() || e.children.length > 3) continue;
    const px = e instanceof SVGElement ? e.getBoundingClientRect().height * 0.8 : parseFloat(getComputedStyle(e).fontSize);
    if (px && px < 12) out.texto.push(`"${e.textContent.trim().slice(0, 20)}" ${px.toFixed(1)}px`);
  }
  return out;
}'''


def arrastre_tactil(pag, avisos):
    """Arrastra con el dedo (eventos táctiles reales vía CDP) el primer [data-arrastrable] de cada widget:
    la página no debe desplazarse y el widget debe cambiar."""
    fallos = []
    cdp = pag.context.new_cdp_session(pag)
    n = pag.eval_on_selector_all('.widget', 'ws => ws.length')
    for i in range(n):
        info = pag.evaluate('''i => { const w = document.querySelectorAll('.widget')[i];
            const e = w.querySelector('[data-arrastrable]'); if (!e) return null;
            e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect();
            let ta = 'auto'; for (let n = e; n && ta === 'auto'; n = n.parentElement) ta = getComputedStyle(n).touchAction;
            return {x: r.left + r.width / 2, y: r.top + r.height / 2, ta}; }''', i)
        if not info:
            continue
        pag.wait_for_timeout(150)
        huella = '''i => { const w = document.querySelectorAll('.widget')[i];
            const t = w.innerHTML + [...w.querySelectorAll('canvas')].map(c => c.toDataURL()).join('') +
                      [...w.querySelectorAll('input')].map(x => x.value).join('|');
            let h = 0; for (let k = 0; k < t.length; k++) h = (h * 31 + t.charCodeAt(k)) | 0; return h; }'''
        antes, y0 = pag.evaluate(huella, i), pag.evaluate('scrollY')
        x, y = info['x'], info['y']
        dy = 0 if 'pan-y' in info['ta'] else -5   # con pan-y el gesto vertical es scroll legítimo: se arrastra en horizontal
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x, 'y': y}]})
        for k in range(1, 9):
            cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x + 5 * k, 'y': y + dy * k}]})
            pag.wait_for_timeout(16)
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
        pag.wait_for_timeout(200)
        if abs(pag.evaluate('scrollY') - y0) > 2:
            fallos.append(f'widget {i + 1}: al arrastrar se desplaza la página (falta touch-action: none)')
        elif pag.evaluate(huella, i) == antes:
            avisos.append(f'widget {i + 1}: el arrastre táctil no cambió nada')
    cdp.detach()
    return fallos


def main():
    ap = argparse.ArgumentParser()
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument('--lote')
    g.add_argument('--id')
    g.add_argument('--todas', action='store_true')
    g.add_argument('--demo', nargs='?', const='*', help='prueba docs/demo.html (todos los motores o uno)')
    g.add_argument('--vistas', action='store_true', help='prueba las vistas generales: inicio, mapa, rutas, glosario, repaso')
    ap.add_argument('--movil', action='store_true')
    ap.add_argument('--android', action='store_true',
                    help='emula un Pixel 7 (táctil, 412 px, DPR 2,6) y además comprueba desbordamiento horizontal, '
                         'objetivos táctiles < 44 px y texto < 12 px; en widgets, arrastra con el dedo el primer '
                         '[data-arrastrable] y comprueba que la página no se mueve')
    ap.add_argument('--oscuro', action='store_true', help='captura en tema oscuro')
    ap.add_argument('--esencial', action='store_true', help='en fichas, pulsa el selector "Esencial" antes de capturar')
    a = ap.parse_args()
    inv = F.inventario()
    escritas = {p.stem for p in (F.RAIZ / 'fichas').glob('*.md') if not p.stem.startswith('_')}
    motor = {c['id']: c['motor'] for c in inv['conceptos']}
    if a.demo:
        index = (F.RAIZ / 'docs' / 'demo.html').resolve()
        motores = sorted(x.stem for x in (F.RAIZ / 'docs' / 'motores').glob('*.js') if x.stem != 'nucleo')
        ids = motores if a.demo == '*' else [a.demo]
        motor = {m: m for m in ids}
    elif a.vistas:
        index = (F.RAIZ / 'docs' / 'index.html').resolve()
        ids = ['inicio', 'mapa', 'rutas', 'glosario', 'repaso']
        motor = {v: None for v in ids}
    else:
        index = (F.RAIZ / 'docs' / 'index.html').resolve()
        ids = inv['lotes'][a.lote] if a.lote else [a.id] if a.id else inv['orden']
        ids = [i for i in ids if i in escritas]
    if not index.exists():
        sys.exit(f'No existe docs/{index.name} (se crea en la Fase 1A).')
    salida = F.RAIZ / 'capturas'
    salida.mkdir(exist_ok=True)
    fallos = 0
    anchos = [(None, 'android')] if a.android else [(1280, 'escritorio')] + ([(390, 'movil')] if a.movil else [])
    with sync_playwright() as pw:
        nav = pw.chromium.launch()
        for ancho, etiqueta in anchos:
            esquema = 'dark' if a.oscuro else 'light'
            if ancho is None:
                ctx_nav = nav.new_context(**pw.devices['Pixel 7'], color_scheme=esquema, locale='es-ES')
                pag = ctx_nav.new_page()
            else:
                pag = nav.new_page(viewport={'width': ancho, 'height': 900}, color_scheme=esquema)
            etiqueta += '-oscuro' if a.oscuro else ''
            etiqueta += '-esencial' if a.esencial else ''
            actual = {'errores': []}
            pag.on('console', lambda m: m.type == 'error' and actual['errores'].append(m.text))
            pag.on('pageerror', lambda ex: actual['errores'].append(str(ex)))
            for cid in ids:
                errores = actual['errores'] = []
                pag.goto('about:blank')
                pag.goto(f'{index.as_uri()}#{cid}')
                try:
                    pag.wait_for_selector(f'body[data-listo="{cid}"]', timeout=15000)
                except Exception:
                    errores.append('La ficha no terminó de cargar (falta body[data-listo]) en 15 s')
                if a.esencial:
                    boton = pag.get_by_text('Esencial', exact=True)
                    if boton.count():
                        boton.first.click()
                        pag.wait_for_timeout(600)
                    else:
                        errores.append('No encuentro el selector "Esencial"')
                if motor[cid]:
                    n = pag.eval_on_selector_all('.widget svg, .widget canvas', 'els => els.length')
                    if not n:
                        errores.append('El interactivo está vacío (sin svg ni canvas dentro de .widget)')
                crudo = pag.eval_on_selector_all('main', "els => els.map(e => e.innerText).join(' ')")
                if '\\(' in crudo or '\\[' in crudo or '$$' in crudo:
                    errores.append('Hay fórmulas sin procesar por MathJax')
                avisos = []
                if a.android:
                    rev = pag.evaluate(REVISION_MOVIL)
                    if rev['desborde'] > 1:
                        errores.append(f"Desbordamiento horizontal de {rev['desborde']} px (la página se desplaza de lado)")
                    if rev['pequenos']:
                        errores.append(f"{len(rev['pequenos'])} objetivos táctiles < 44 px: " + '; '.join(rev['pequenos'][:6]))
                    if motor.get(cid) or a.demo:
                        errores += [f'Arrastre táctil: {x}' for x in arrastre_tactil(pag, avisos)]
                    if rev['texto']:
                        avisos.append(f"{len(rev['texto'])} textos < 12 px: " + '; '.join(rev['texto'][:6]))
                pag.screenshot(path=str(salida / f'{cid}-{etiqueta}.png'), full_page=True)
                estado = '✓' if not errores else '✗'
                fallos += bool(errores)
                print(f'{estado} {cid} ({etiqueta})' + ''.join(f'\n    - {e}' for e in dict.fromkeys(errores))
                      + ''.join(f'\n    · {x}' for x in avisos))
            pag.close()
        nav.close()
    print(f'\n{fallos} fichas con problemas. Capturas en capturas/.')
    sys.exit(1 if fallos else 0)


if __name__ == '__main__':
    main()
