#!/usr/bin/env python3
"""Abre cada ficha en un navegador sin interfaz y detecta errores de consola, fórmulas sin procesar
e interactivos vacíos. Guarda capturas en capturas/ (ignorada por git).

  python tools/probar_web.py --lote L07          fichas del lote
  python tools/probar_web.py --id kmeans --movil  una ficha, también a 390 px
  python tools/probar_web.py --todas
  python tools/probar_web.py --demo [motor]    página de demostración de motores (docs/demo.html)
  python tools/probar_web.py --id kmeans --esencial --oscuro   vista Esencial en tema oscuro
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


def main():
    ap = argparse.ArgumentParser()
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument('--lote')
    g.add_argument('--id')
    g.add_argument('--todas', action='store_true')
    g.add_argument('--demo', nargs='?', const='*', help='prueba docs/demo.html (todos los motores o uno)')
    g.add_argument('--vistas', action='store_true', help='prueba las vistas generales: inicio, mapa, rutas, glosario, repaso')
    ap.add_argument('--movil', action='store_true')
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
    anchos = [(1280, 'escritorio')] + ([(390, 'movil')] if a.movil else [])
    with sync_playwright() as pw:
        nav = pw.chromium.launch()
        for ancho, etiqueta in anchos:
            pag = nav.new_page(viewport={'width': ancho, 'height': 900}, color_scheme='dark' if a.oscuro else 'light')
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
                pag.screenshot(path=str(salida / f'{cid}-{etiqueta}.png'), full_page=True)
                estado = '✓' if not errores else '✗'
                fallos += bool(errores)
                print(f'{estado} {cid} ({etiqueta})' + ''.join(f'\n    - {e}' for e in dict.fromkeys(errores)))
            pag.close()
        nav.close()
    print(f'\n{fallos} fichas con problemas. Capturas en capturas/.')
    sys.exit(1 if fallos else 0)


if __name__ == '__main__':
    main()
