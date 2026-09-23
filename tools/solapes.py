#!/usr/bin/env python3
"""Comprueba el inventario: fuentes resolubles y sin ambigüedad, reparto exclusivo y cobertura."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
import fuentes as F
INV = F.inventario()
err = 0
for c in INV['conceptos']:
    for s in c['principal'] + [x['fuente'] for x in c['secundarias']]:
        try:
            F.rangos(s)
        except (KeyError, FileNotFoundError) as e:
            err += 1; print(f'✗ {c["id"]}: {e}')
asig = F.asignacion()
lineas = []
for (cid, rol), rs in asig.items():
    for r in rs: lineas.append((r, cid))
n = 0
for i, (r, a) in enumerate(lineas):
    for r2, b in lineas[i + 1:]:
        if a != b and r[:2] == r2[:2] and r[2] < r2[3] and r2[2] < r[3]:
            n += 1; print(f'✗ solape {a} / {b}: {r[1]} líneas {max(r[2], r2[2]) + 1}-{min(r[3], r2[3])}')
vacios = [f'{cid}({rol})' for (cid, rol), rs in asig.items() if sum(r[3] - r[2] for r in rs) < 3]
if vacios: print('· Reclamaciones que se quedan sin texto propio (lo absorbe otra más específica):', ', '.join(vacios))
print(f'{err} fuentes inválidas · {n} solapes')
sys.exit(1 if err or n else 0)
