#!/usr/bin/env python3
"""Recalcula los campos derivados de inventario.json tras editarlo a mano:
palabras de fuente, objetivo de palabras, tipo, orden de estudio y lote de los conceptos nuevos.
Los lotes existentes NO se renumeran (un concepto nuevo se añade al último lote de su bloque).

  python tools/recalcular.py
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import fuentes as F  # noqa: E402

d = F.inventario()
C = d['conceptos']
by = {c['id']: c for c in C}
errores = [f'{c["id"]}: requisito inexistente {p}' for c in C for p in c['prerequisitos'] if p not in by]
errores += [f'{c["id"]}: bloque desconocido {c["bloque"]}' for c in C if c['bloque'] not in d['bloques']]
if errores:
    sys.exit('\n'.join(errores))

A = F.asignacion()


def palabras(rs):
    return sum(F.palabras(F.texto(*r[:4])) for r in rs)


for c in C:
    p = A.get((c['id'], 'P'), [])
    c['palabras_principal'] = palabras(p)
    c['palabras_fusion'] = palabras(F.restar(A.get((c['id'], 'F'), []), p))
    base = c['palabras_principal'] + c['palabras_fusion']
    c['objetivo_palabras'] = min(2800, max(500, round(0.2 * base / 50) * 50)) if c['principal'] else 900
    c['tipo'] = ('ampliacion' if not c['principal'] else 'original+ampliacion' if c.get('ampliacion')
                 else 'fusion' if any(s['uso'] == 'F' for s in c['secundarias']) else 'original')
    c.setdefault('motor', None)
    c.setdefault('modo', None)
    c.setdefault('visual', '')
    c.setdefault('nota', '')
    c.setdefault('ampliacion', None)

# Orden de estudio: por bloque y topológico dentro de cada bloque
orden, hecho = [], set()
for b in d['bloques']:
    pend = [c['id'] for c in C if c['bloque'] == b]
    while pend:
        for x in pend:
            if all(p in hecho or by[p]['bloque'] != b for p in by[x]['prerequisitos']):
                orden.append(x)
                hecho.add(x)
                pend.remove(x)
                break
        else:
            sys.exit(f'Ciclo de requisitos en el bloque {b}: {pend}')
d['orden'] = orden

# Lotes: se conservan; los conceptos nuevos van al último lote de su bloque
en_lote = {i for ids in d['lotes'].values() for i in ids}
for c in C:
    if c['id'] not in en_lote:
        ultimo = [k for k, ids in d['lotes'].items() if by.get(ids[0], {}).get('bloque') == c['bloque']][-1]
        d['lotes'][ultimo].append(c['id'])
        print(f'· {c["id"]} añadido al lote {ultimo}')
d['lotes'] = {k: [i for i in ids if i in by] for k, ids in d['lotes'].items()}
for k, ids in d['lotes'].items():
    for i in ids:
        by[i]['lote'] = k

(F.RAIZ / 'inventario.json').write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding='utf-8')
print(f'Inventario recalculado: {len(C)} conceptos, {len(d["lotes"])} lotes. Ejecuta ahora: python tools/solapes.py')
