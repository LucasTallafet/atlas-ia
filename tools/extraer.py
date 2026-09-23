#!/usr/bin/env python3
"""Imprime SOLO el material necesario para redactar fichas. Es la única vía de lectura de fuentes/.

  python tools/extraer.py --lote L07        material completo de un lote (recomendado)
  python tools/extraer.py --id kmeans       material de un concepto
  python tools/extraer.py --frase bayes     "En una frase" de una ficha ya escrita
  python tools/extraer.py --estado          qué lotes y fichas faltan
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import fuentes as F  # noqa: E402
import ficha as FI  # noqa: E402

INV = F.inventario()
BY = {c['id']: c for c in INV['conceptos']}
FICHAS = F.RAIZ / 'fichas'
WIDGETS = json.loads((F.RAIZ / 'widgets.json').read_text(encoding='utf-8'))


def frase(cid):
    p = FICHAS / f'{cid}.md'
    if not p.exists():
        return None
    _, sec, _ = FI.leer(p)
    return sec.get('En una frase', '').strip() or None


def spec_motor(motor):
    w = WIDGETS.get(motor)
    if not w:
        return f'  (motor "{motor}" no existe en widgets.json)'
    ps = '; '.join(f'{k}{"*" if v.get("req") else ""} ({v["tipo"]})' + (f': {v["desc"]}' if v.get('desc') else '')
                   for k, v in w['params'].items())
    return f'  {w["desc"]}\n  Parámetros (* = obligatorio): {ps}'


def material(cid, motores_vistos):
    c = BY[cid]
    out = [f'\n{"=" * 78}\n## CONCEPTO {c["id"]} — {c["nombre"]}',
           f'Bloque {c["bloque"]} · tipo {c["tipo"]} · objetivo ≈{c["objetivo_palabras"]} palabras '
           f'(Explicación + Formalización + A fondo)']
    if (FICHAS / f'{cid}.md').exists():
        out.append('⚠ La ficha YA EXISTE: no la reescribas salvo que se pida.')
    out.append('\nRequisitos previos (no reexpliques; enlaza con [[id]]):')
    for p in c['prerequisitos']:
        out.append(f'  - [[{p}]] {BY[p]["nombre"]}: {frase(p) or "(ficha pendiente)"}')
    if not c['prerequisitos']:
        out.append('  - ninguno (punto de entrada)')
    dependen = [x['id'] for x in INV['conceptos'] if cid in x['prerequisitos']]
    if dependen:
        out.append('Lo usarán después (no lo adelantes, como mucho menciónalo): ' + ', '.join(dependen))
    if c['motor']:
        out.append(f'\nInteractivo → motor "{c["motor"]}", modo "{c["modo"]}". Propuesta: {c["visual"]}')
        if c['motor'] not in motores_vistos:
            out.append(spec_motor(c['motor']))
            motores_vistos.add(c['motor'])
    else:
        out.append('\nSin interactivo (omite la sección "Interactivo").')
    if c['ampliacion']:
        a = c['ampliacion']
        out.append(f'\nAMPLIACIÓN (prioridad {a["prioridad"]}) — va en bloques :::ampliacion con "Fuente:".\n'
                   f'  Qué añadir: {a["que"]}\n  Fuentes externas sugeridas: {" · ".join(a["fuentes_externas"])}')
    if c['nota']:
        out.append(f'Nota de decisión: {c["nota"]}')
    enl = [s for s in c['secundarias'] if s['uso'] in 'ED']
    if enl:
        out.append('\nSitios que solo se ENLAZAN o DESAMBIGUAN (no copies su texto):')
        for s in enl:
            repo, ruta, cab, _ = F.parsear(s['fuente'])
            etiqueta = 'enlazar' if s['uso'] == 'E' else 'desambiguar'
            out.append(f'  - {etiqueta}: {repo}:{ruta} › {cab or "(archivo)"}' + (f' — {s["nota"]}' if s['nota'] else ''))
    # Texto fuente
    asig = F.asignacion()  # reparto exclusivo: ningún texto sale en dos fichas
    principal = asig.get((cid, 'P'), [])
    fusion = F.restar(asig.get((cid, 'F'), []), principal)
    notas_f = {s['fuente']: s['nota'] for s in c['secundarias'] if s['uso'] == 'F' and s['nota']}
    total = 0
    for etiqueta, grupo in (('FUENTE PRINCIPAL', principal), ('FUSIONAR (duplicados: integra lo que aporte, sin repetir)', fusion)):
        if not grupo:
            continue
        out.append(f'\n### {etiqueta}')
        for repo, ruta, ini, fin, tit in grupo:
            t = F.texto(repo, ruta, ini, fin)
            total += F.palabras(t)
            out.append(f'\n#### [{repo}] {ruta} › {tit} (líneas {ini + 1}-{fin})\n{t}')
    if notas_f:
        out.append('\nNotas sobre fusiones: ' + ' | '.join(f'{k.split("#")[-1]}: {v}' for k, v in notas_f.items()))
    if not principal:
        out.append('\n(No hay texto en el curso: ficha de ampliación completa.)')
    return '\n'.join(out), total


def main():
    ap = argparse.ArgumentParser()
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument('--lote')
    g.add_argument('--id')
    g.add_argument('--frase')
    g.add_argument('--estado', action='store_true')
    a = ap.parse_args()
    if a.frase:
        print(frase(a.frase) or '(ficha pendiente)')
        return
    if a.estado:
        hechas = {p.stem for p in FICHAS.glob('*.md') if not p.stem.startswith('_')}
        for k, ids in INV['lotes'].items():
            falta = [i for i in ids if i not in hechas]
            marca = '✓' if not falta else ('·' if len(falta) == len(ids) else '◐')
            print(f'{marca} {k} {BY[ids[0]]["bloque"]}: ' + ' '.join(i if i in hechas else f'[{i}]' for i in ids))
        print(f'\n{len(hechas)}/{len(BY)} fichas escritas. [id] = pendiente.')
        return
    ids = INV['lotes'][a.lote] if a.lote else [a.id]
    vistos, bloques, total = set(), [], 0
    for cid in ids:
        txt, n = material(cid, vistos)
        bloques.append(txt)
        total += n
    print(f'# MATERIAL {"LOTE " + a.lote if a.lote else a.id}: {len(ids)} conceptos · '
          f'{total} palabras de fuente (≈{int(total * 1.45 / 1000)}k tokens)')
    print('\n'.join(bloques))


if __name__ == '__main__':
    main()
