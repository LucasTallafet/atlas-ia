#!/usr/bin/env python3
"""Valida las fichas y genera los datos de la web (docs/datos/*.js) y ESTADO.md.

  python tools/build.py                      valida todo y genera datos
  python tools/build.py --lote L07           igual, pero solo detalla los avisos del lote
  python tools/build.py --lote L07 --ejecutar   además ejecuta el código Python de las fichas del lote
  python tools/build.py --estricto           los avisos cuentan como errores (usar en la revisión final)

Sale con código 1 si hay errores. Requiere: pip install markdown
"""
import argparse
import html
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import fuentes as F  # noqa: E402
import ficha as FI  # noqa: E402

try:
    import markdown
except ImportError:
    sys.exit('Falta la librería markdown: pip install markdown')

INV = F.inventario()
BY = {c['id']: c for c in INV['conceptos']}
WIDGETS = json.loads((F.RAIZ / 'widgets.json').read_text(encoding='utf-8'))
DIR_FICHAS = F.RAIZ / 'fichas'
DIR_DATOS = F.RAIZ / 'docs' / 'datos'
DIR_MOTORES = F.RAIZ / 'docs' / 'motores'
TIPOS_PY = {'num': (int, float), 'int': int, 'bool': bool, 'str': str, 'lista': list, 'lista-num': list, 'objeto': dict}


# ───────────────────────── Markdown → HTML ─────────────────────────
def md(texto, errores, inline=False):
    guard = {}

    def token(v):
        k = f'ZQZ{len(guard):04d}ZQZ'
        guard[k] = v
        return k

    def codigo(m):
        lang = m.group(1) or 'texto'
        return '\n' + token(f'<pre class="codigo"><code class="lang-{lang}">{html.escape(m.group(2).rstrip())}</code></pre>') + '\n'

    t = FI.BLOQUE_CODIGO.sub(codigo, texto)
    t = re.sub(r'\$\$(.+?)\$\$', lambda m: '\n' + token(f'<div class="mates">\\[{html.escape(m.group(1).strip())}\\]</div>') + '\n', t, flags=re.S)
    t = re.sub(r'(?<!\\)\$([^$\n]+?)(?<!\\)\$', lambda m: token(f'<span class="mates">\\({html.escape(m.group(1))}\\)</span>'), t)

    def xref(m):
        cid, txt = m.group(1).strip(), (m.group(2) or '').strip()
        if cid not in BY:
            errores.append(f'Enlace a concepto inexistente: [[{cid}]]')
            return txt or cid
        return token(f'<a class="xref" href="#{cid}" data-id="{cid}">{html.escape(txt or BY[cid]["nombre"])}</a>')

    t = re.sub(r'\[\[([\w-]+)(?:\|([^\]]+))?\]\]', xref, t)
    t = re.sub(r'^:::\s*ampliacion\s*$', '<div class="ampliacion" markdown="1">', t, flags=re.M)
    t = re.sub(r'^:::\s*nota-fuente\s*$', '<div class="nota-fuente" markdown="1">', t, flags=re.M)
    t = re.sub(r'^:::\s*$', '</div>', t, flags=re.M)
    h = markdown.markdown(t, extensions=['tables', 'sane_lists', 'md_in_html'])
    for k, v in guard.items():
        h = h.replace(f'<p>{k}</p>', v).replace(k, v)
    if inline:
        h = re.sub(r'^<p>(.*)</p>$', r'\1', h.strip(), flags=re.S)
    return h


# ───────────────────────── Validación de una ficha ─────────────────────────
def validar(ruta, ejecutar):
    E, A = [], []  # errores, avisos
    cid = ruta.stem
    c = BY.get(cid)
    if not c:
        return None, [f'{ruta.name}: el nombre de archivo no es un id del inventario'], []
    meta, sec, orden = FI.leer(ruta)
    if meta.get('id') != cid:
        E.append(f'frontmatter: id "{meta.get("id")}" ≠ nombre de archivo "{cid}"')
    if meta.get('estado') not in ('borrador', 'revisada'):
        E.append('frontmatter: estado debe ser "borrador" o "revisada"')
    if '__texto_suelto__' in orden:
        E.append('Hay texto fuera de las secciones "## ..."')
    orden = [o for o in orden if o != '__texto_suelto__']
    for s in orden:
        if s not in FI.SECCIONES:
            E.append(f'Sección desconocida "## {s}". Válidas: {", ".join(FI.SECCIONES)}')
    conocidas = [s for s in orden if s in FI.SECCIONES]
    if conocidas != sorted(conocidas, key=FI.SECCIONES.index):
        E.append('Secciones fuera de orden. Orden: ' + ' → '.join(FI.SECCIONES))
    if len(set(orden)) != len(orden):
        E.append('Sección repetida')
    for s in FI.OBLIGATORIAS:
        if not sec.get(s):
            E.append(f'Falta la sección obligatoria "## {s}" o está vacía')
    todo = '\n'.join(sec.values())
    if FI.PROHIBIDO.search(todo):
        E.append('Contiene TODO/XXX/FIXME/lorem')
    for nombre, s in sec.items():
        E += FI.comprobar_mates(nombre, s)
    if todo.count(':::') and len(re.findall(r'^:::\s*$', todo, re.M)) != len(re.findall(r'^:::\s*\w', todo, re.M)):
        E.append('Bloques ::: desemparejados (cada ":::ampliacion" o ":::nota-fuente" se cierra con ":::")')

    # Longitudes
    n_frase = FI.contar(sec.get('En una frase', ''))
    if n_frase > 45:
        E.append(f'"En una frase" tiene {n_frase} palabras (máx. 35)')
    elif n_frase > 35:
        A.append(f'"En una frase" tiene {n_frase} palabras (objetivo ≤35)')
    n_int = FI.contar(sec.get('Intuición', ''))
    if not 50 <= n_int <= 300:
        A.append(f'"Intuición" tiene {n_int} palabras (objetivo 60-250)')
    n_cuerpo = sum(FI.contar(sec.get(s, '')) for s in FI.CUERPO)
    obj = c['objetivo_palabras']
    if n_cuerpo < 0.6 * obj or n_cuerpo > 1.5 * obj:
        A.append(f'Cuerpo (Explicación+Formalización+A fondo) = {n_cuerpo} palabras; objetivo ≈{obj} (rango {int(.6 * obj)}-{int(1.5 * obj)})')

    # Interactivo
    widget = None
    if c['motor'] and 'Interactivo' not in sec:
        E.append(f'Falta "## Interactivo" (motor previsto: {c["motor"]})')
    if not c['motor'] and 'Interactivo' in sec:
        E.append('Esta ficha no tiene motor en el inventario: elimina "## Interactivo" o añade el motor al inventario')
    if 'Interactivo' in sec and c['motor']:
        bloques = [m for m in FI.BLOQUE_CODIGO.finditer(sec['Interactivo']) if m.group(1) == 'widget']
        if len(bloques) != 1:
            E.append('"## Interactivo" debe contener exactamente un bloque ```widget')
        else:
            p, errs = FI.parse_widget(bloques[0].group(2))
            E += errs
            motor = p.pop('motor', None)
            spec = WIDGETS.get(motor)
            if motor != c['motor']:
                E.append(f'widget: motor "{motor}" ≠ inventario "{c["motor"]}"')
            elif spec:
                if spec['modos']:
                    if p.get('modo') not in spec['modos']:
                        E.append(f'widget: modo "{p.get("modo")}" no existe en {motor}. Modos: {spec["modos"]}')
                    elif p.get('modo') != c['modo']:
                        A.append(f'widget: modo "{p.get("modo")}" distinto del previsto "{c["modo"]}"')
                for k, v in p.items():
                    if k not in spec['params']:
                        E.append(f'widget: parámetro desconocido "{k}" para {motor}')
                    elif not isinstance(v, TIPOS_PY[spec['params'][k]['tipo']]) or isinstance(v, bool) and spec['params'][k]['tipo'] in ('num', 'int'):
                        E.append(f'widget: "{k}" debe ser {spec["params"][k]["tipo"]}')
                for k, v in spec['params'].items():
                    if v.get('req') and k not in p:
                        E.append(f'widget: falta el parámetro obligatorio "{k}"')
                js = DIR_MOTORES / f'{motor}.js'
                modo = p.get('modo', '-')
                cab = js.read_text(encoding='utf-8').split('\n', 1)[0] if js.exists() else ''
                modos_impl = [x.strip() for x in cab.split('@modos:', 1)[1].split(',')] if '@modos:' in cab else []
                if not js.exists() or (spec['modos'] and modo not in modos_impl):
                    E.append(f'MOTOR NO IMPLEMENTADO: {motor} (modo "{modo}") en docs/motores/{motor}.js. '
                             'Impleméntalo siguiendo ESPEC-WEB.md §8 y añade el modo a su línea "// @modos:"')
            widget = {'motor': motor, 'params': p}
            if 'fotogramas' in p:
                p['fotogramas'] = [{'html': md(f['texto'], E)} for f in p['fotogramas']]
        resto = FI.BLOQUE_CODIGO.sub('', sec['Interactivo']).strip()
        if not re.search(r'Prueba a', resto):
            A.append('"Interactivo": añade 1-3 retos que empiecen por "Prueba a…"')

    # Código
    if 'En código' in sec:
        for m in FI.BLOQUE_CODIGO.finditer(sec['En código']):
            n = len(m.group(2).rstrip().split('\n'))
            if n > 25:
                E.append(f'Bloque de código de {n} líneas (máx. 20)')
            elif n > 20:
                A.append(f'Bloque de código de {n} líneas (objetivo ≤20)')
            if ejecutar and m.group(1) == 'python' and 'no-ejecutar' not in m.group(2).split('\n')[0]:
                with tempfile.TemporaryDirectory() as tmp:
                    try:
                        r = subprocess.run([sys.executable, '-c', m.group(2)], cwd=tmp, capture_output=True, text=True,
                                           timeout=120, env={**os.environ, 'MPLBACKEND': 'Agg'})
                        if r.returncode:
                            E.append('El código Python falla:\n      ' + '\n      '.join(r.stderr.strip().split('\n')[-4:]))
                    except subprocess.TimeoutExpired:
                        E.append('El código Python tarda más de 120 s')

    # Errores típicos, quiz, glosario
    if 'Errores típicos' in sec and len(re.findall(r'^- ', sec['Errores típicos'], re.M)) < 3:
        E.append('"Errores típicos" necesita ≥3 viñetas')
    quiz, errs = FI.parse_quiz(sec.get('Autoevaluación', ''))
    E += errs
    glos, errs = FI.parse_glosario(sec.get('Glosario', ''))
    E += errs

    # Ampliación
    bloques_amp = re.findall(r'^:::\s*ampliacion\s*$(.*?)^:::\s*$', todo, re.M | re.S)
    if c['tipo'] in ('ampliacion', 'original+ampliacion') and not bloques_amp:
        E.append('Tipo con ampliación: falta al menos un bloque ":::ampliacion" con su "Fuente:"')
    if c['tipo'] in ('original', 'fusion') and bloques_amp:
        A.append('Contenido de ampliación no previsto en el inventario: confirma que es necesario')
    for b in bloques_amp:
        if 'Fuente:' not in b:
            E.append('Bloque ":::ampliacion" sin línea "Fuente:"')

    # HTML
    out = {'id': cid, 'estado': meta.get('estado'), 'secciones': {}, 'widget': widget,
           'quiz': [{'enunciado': md(q['enunciado'], E, True),
                     'opciones': [{'html': md(o['texto'], E, True), 'correcta': o['correcta']} for o in q['opciones']],
                     'explicacion': md(q['explicacion'], E, True)} for q in quiz],
           'glosario': [{'termino': g['termino'], 'definicion': md(g['definicion'], E, True)} for g in glos]}
    for s in orden:
        if s in ('Autoevaluación', 'Glosario') or s not in FI.SECCIONES:
            continue
        cuerpo = FI.BLOQUE_CODIGO.sub(lambda m: '' if m.group(1) == 'widget' else m.group(0), sec[s]) if s == 'Interactivo' else sec[s]
        out['secciones'][s] = md(cuerpo, E, s == 'En una frase')
    for x in re.findall(r'\[\[([\w-]+)', todo):
        if x == cid:
            A.append('La ficha se enlaza a sí misma')
    return out, E, A


# ───────────────────────── Relaciones derivadas del inventario ─────────────────────────
def relaciones():
    """Para cada concepto: fichas conectadas (fuentes E: allí se aplica o reaparece) y desambiguaciones (D)."""
    duenos = [(r, cid) for (cid, rol), rs in F.asignacion().items() if rol == 'P' for r in rs]

    def dueno(spec):
        return {cid for r in F.rangos(spec) for r2, cid in duenos
                if r2[:2] == r[:2] and r2[2] < r[3] and r[2] < r2[3]}

    rel = {c['id']: {'conexiones': [], 'desambiguacion': []} for c in INV['conceptos']}

    def anadir(a, clave, b, nota):
        if b != a and all(x['id'] != b for x in rel[a][clave]):
            rel[a][clave].append({'id': b, 'nota': nota})

    for c in INV['conceptos']:
        for s in c['secundarias']:
            if s['uso'] == 'F':
                continue
            for b in sorted(dueno(s['fuente'])):
                if s['uso'] == 'E':
                    anadir(c['id'], 'conexiones', b, s['nota'])
                    anadir(b, 'conexiones', c['id'], s['nota'])
                else:
                    anadir(c['id'], 'desambiguacion', b, s['nota'])
                    anadir(b, 'desambiguacion', c['id'], s['nota'])
    return rel


def fuentes_publicas(c):
    out = []
    for grupo, specs in (('principal', c['principal']), ('fusionada', [s['fuente'] for s in c['secundarias'] if s['uso'] == 'F'])):
        for s in specs:
            repo, ruta, cab, _ = F.parsear(s)
            out.append({'rol': grupo, 'repo': F.REPOS[repo], 'archivo': ruta, 'seccion': cab or None, 'url': F.url(repo, ruta)})
    return out


# ───────────────────────── Principal ─────────────────────────
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--lote')
    ap.add_argument('--id', help='limita el detalle y la ejecución a una ficha')
    ap.add_argument('--ejecutar', action='store_true')
    ap.add_argument('--estricto', action='store_true')
    a = ap.parse_args()
    foco = set(INV['lotes'][a.lote]) if a.lote else {a.id} if a.id else None
    rutas = sorted(p for p in DIR_FICHAS.glob('*.md') if not p.name.startswith('_'))
    datos, informe, n_err, n_av = {}, [], 0, 0
    for r in rutas:
        en_foco = foco is None or r.stem in foco
        out, E, A = validar(r, a.ejecutar and en_foco)
        if a.estricto:
            E, A = E + A, []
        n_err += len(E)
        n_av += len(A)
        if out and not E:
            datos[r.stem] = out
        if (E or A) and (en_foco or E):
            informe.append(f'\n{r.name}: {len(E)} errores, {len(A)} avisos')
            informe += [f'  ✗ {e}' for e in E] + [f'  · {x}' for x in A]

    rel = relaciones()
    DIR_DATOS.mkdir(parents=True, exist_ok=True)
    for b in INV['bloques']:
        fb = {k: v for k, v in datos.items() if BY[k]['bloque'] == b}
        (DIR_DATOS / f'{b}.js').write_text('window.FICHAS=window.FICHAS||{};Object.assign(window.FICHAS,'
                                           + json.dumps(fb, ensure_ascii=False) + ');\n', encoding='utf-8')
    glosario = {}
    for k, v in datos.items():
        for g in v['glosario']:
            glosario.setdefault(g['termino'].lower(), []).append({'termino': g['termino'], 'definicion': g['definicion'], 'id': k})
    repetidos = {t: [x['id'] for x in v] for t, v in glosario.items() if len(v) > 1}
    if repetidos:
        n_av += len(repetidos)
        informe.append('\nGlosario: términos definidos en varias fichas (defínelos solo en la ficha que los introduce):')
        informe += [f'  · "{t}": {", ".join(ids)}' for t, ids in repetidos.items()]
    desbloquea = {c['id']: [] for c in INV['conceptos']}
    for c in INV['conceptos']:
        for p in c['prerequisitos']:
            desbloquea[p].append(c['id'])
    indice = {'bloques': INV['bloques'], 'orden': INV['orden'], 'lotes': INV['lotes'],
              'conceptos': [{'id': c['id'], 'nombre': c['nombre'], 'bloque': c['bloque'], 'tipo': c['tipo'],
                             'lote': c['lote'], 'prerequisitos': c['prerequisitos'], 'desbloquea': desbloquea[c['id']],
                             'motor': c['motor'], 'escrita': c['id'] in datos,
                             'frase': datos[c['id']]['secciones'].get('En una frase') if c['id'] in datos else None,
                             'fuentes': fuentes_publicas(c), 'ampliacion': c['ampliacion'], **rel[c['id']]}
                            for c in INV['conceptos']],
              'glosario': dict(sorted(glosario.items()))}
    (DIR_DATOS / 'indice.js').write_text('window.INDICE=' + json.dumps(indice, ensure_ascii=False) + ';\n', encoding='utf-8')

    # ESTADO.md
    filas = ['# Estado del proyecto', '', f'{len(datos)}/{len(BY)} fichas válidas · generado por tools/build.py', '',
             '| Lote | Bloque | Fichas | Hechas |', '|---|---|---|---|']
    for k, ids in INV['lotes'].items():
        hechas = sum(i in datos for i in ids)
        filas.append(f'| {k} | {BY[ids[0]]["bloque"]} | {" ".join(i if i in datos else "`" + i + "`" for i in ids)} | {hechas}/{len(ids)} |')
    (F.RAIZ / 'ESTADO.md').write_text('\n'.join(filas) + '\n', encoding='utf-8')

    print('\n'.join(informe) if informe else 'Sin errores ni avisos en las fichas revisadas.')
    print(f'\nRESUMEN: {len(rutas)} fichas · {len(datos)} válidas · {n_err} errores · {n_av} avisos. Datos en docs/datos/.')
    sys.exit(1 if n_err else 0)


if __name__ == '__main__':
    main()
