"""Acceso a los repos fuente y al inventario. Lo usan extraer.py y build.py.

Formato de una fuente en inventario.json:  "repo:ruta/archivo.md#Prefijo del encabezado"
  - sin '#'   -> archivo completo
  - '#='      -> solo el texto propio del encabezado (sin subsecciones)
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

# Windows: la consola (y sobre todo la salida redirigida) usa cp1252 y rompe con ✓ ≈ → ·
for _flujo in (sys.stdout, sys.stderr):
    try:
        _flujo.reconfigure(encoding='utf-8', errors='replace')
    except (AttributeError, ValueError):
        pass

RAIZ = Path(__file__).resolve().parent.parent
FUENTES = RAIZ / 'fuentes'
REPOS = {'mat': 'matematicas-IA', 'ml': 'ml_101_2025', 'mod': 'modelos_ia_101_2025'}
COMMITS = {'mat': '42f29ea11e9c51d4218c8ca89cec15c6e7dfdac8',
           'ml': '52f66e5b59fbf6382aa7c1cd54ef4977b0e84168',
           'mod': '9cc34fbadb21ce1732581b1a3b854b4141f0e3f9'}


def inventario():
    return json.loads((RAIZ / 'inventario.json').read_text(encoding='utf-8'))


def norm(s):
    s = unicodedata.normalize('NFC', s)
    s = re.sub(r'[*_`$]', '', s)
    return re.sub(r'\s+', ' ', s).strip().lower()


_cache = {}


def archivo(repo, ruta):
    """Devuelve (lineas, encabezados). encabezados = [(nivel, titulo, linea_ini, linea_fin_subarbol, linea_fin_propia)]."""
    clave = (repo, ruta)
    if clave in _cache:
        return _cache[clave]
    p = FUENTES / REPOS[repo] / ruta
    if not p.exists():
        raise FileNotFoundError(f'No existe {p}. ¿Ejecutaste tools/preparar.sh?')
    lineas = p.read_text(encoding='utf-8').replace('\r\n', '\n').replace('\r', '\n').split('\n')
    heads, en_codigo = [], False
    for i, ln in enumerate(lineas):
        if ln.strip().startswith('```'):
            en_codigo = not en_codigo
            continue
        if en_codigo:
            continue
        m = re.match(r'^(#{1,6})\s+(.*)', ln)
        if m:
            heads.append([len(m.group(1)), m.group(2).strip(), i])
    res = []
    for k, (lvl, tit, ini) in enumerate(heads):
        fin_sub = len(lineas)
        for lvl2, _, ini2 in heads[k + 1:]:
            if lvl2 <= lvl:
                fin_sub = ini2
                break
        fin_propia = heads[k + 1][2] if k + 1 < len(heads) else len(lineas)
        res.append((lvl, tit, ini, fin_sub, fin_propia))
    _cache[clave] = (lineas, res)
    return _cache[clave]


def parsear(spec):
    repo, resto = spec.split(':', 1)
    ruta, _, cab = resto.partition('#')
    solo_intro = cab.startswith('=')
    cab = cab.lstrip('=')
    return repo, ruta, cab.rsplit('@', 1)[0] if '@' in cab else cab, solo_intro


def ocurrencia(spec):
    cab = spec.partition('#')[2]
    return cab.rsplit('@', 1)[1] if '@' in cab else None


def rangos(spec):
    """Lista de (repo, ruta, ini, fin, titulo) que cubre la fuente. Error si no resuelve."""
    repo, ruta, cab, solo_intro = parsear(spec)
    lineas, heads = archivo(repo, ruta)
    if not cab:
        return [(repo, ruta, 0, len(lineas), '(archivo completo)')]
    out = [(repo, ruta, ini, fp if solo_intro else fs, tit)
           for lvl, tit, ini, fs, fp in heads if norm(tit).startswith(norm(cab))]
    if not out:
        raise KeyError(f'Encabezado no encontrado: "{cab}" en {repo}:{ruta}')
    occ = ocurrencia(spec)
    if occ == '*':
        return out
    if occ:
        return [out[int(occ) - 1]]
    if len(out) > 1:
        raise KeyError(f'Encabezado ambiguo "{cab}" en {repo}:{ruta}: {len(out)} coincidencias '
                       f'(líneas {[o[2] + 1 for o in out]}). Alarga el prefijo o usa @n / @*')
    return out


_asig = None


def asignacion():
    """Reparto EXCLUSIVO del texto fuente: cada línea pertenece a la reclamación más específica
    (el rango más pequeño que la contiene). Empate: principal antes que fusión, y orden del inventario.
    Devuelve {(id_concepto, 'P'|'F'): [rangos efectivos]}."""
    global _asig
    if _asig is not None:
        return _asig
    claims = []
    for n, c in enumerate(inventario()['conceptos']):
        for s in c['principal']:
            claims += [(r, c['id'], 'P', n) for r in rangos(s)]
        for s in c['secundarias']:
            if s['uso'] == 'F':
                claims += [(r, c['id'], 'F', n) for r in rangos(s['fuente'])]
    res = {}
    for r, cid, rol, n in claims:
        mas_especificos = [r2 for r2, cid2, rol2, n2 in claims
                           if cid2 != cid and r2[:2] == r[:2] and r2[2] < r[3] and r[2] < r2[3]
                           and ((r2[3] - r2[2], rol2 != 'P', n2) < (r[3] - r[2], rol != 'P', n))]
        res.setdefault((cid, rol), []).extend(restar([r], mas_especificos))
    for k in res:
        res[k] = fusionar_rangos(res[k])
    _asig = res
    return res


def fusionar_rangos(rs):
    """Une rangos solapados del mismo archivo conservando el primer título."""
    por_archivo = {}
    for r in rs:
        por_archivo.setdefault((r[0], r[1]), []).append(r)
    out = []
    for (repo, ruta), lst in por_archivo.items():
        lst.sort(key=lambda r: r[2])
        cur = list(lst[0])
        for r in lst[1:]:
            if r[2] <= cur[3]:
                cur[3] = max(cur[3], r[3])
            else:
                out.append(tuple(cur))
                cur = list(r)
        out.append(tuple(cur))
    return out


def restar(rs, cubiertos):
    """Quita de rs las líneas ya cubiertas (para no repetir texto fusionado)."""
    out = []
    for repo, ruta, ini, fin, tit in rs:
        tramos = [(ini, fin)]
        for r2, ru2, i2, f2, _ in cubiertos:
            if (r2, ru2) != (repo, ruta):
                continue
            nuevos = []
            for a, b in tramos:
                if f2 <= a or i2 >= b:
                    nuevos.append((a, b))
                else:
                    if a < i2:
                        nuevos.append((a, i2))
                    if f2 < b:
                        nuevos.append((f2, b))
            tramos = nuevos
        out += [(repo, ruta, a, b, tit) for a, b in tramos if b - a > 1]
    return out


def texto(repo, ruta, ini, fin):
    lineas, _ = archivo(repo, ruta)
    t = '\n'.join(lineas[ini:fin])
    t = re.sub(r'!\[([^\]]*)\]\([^)]*\)', lambda m: f'[figura: {m.group(1) or "sin descripción"}]', t)
    t = re.sub(r'<img[^>]*?(?:alt="([^"]*)")?[^>]*>', lambda m: f'[figura: {m.group(1) or "sin descripción"}]', t)
    return re.sub(r'\n{3,}', '\n\n', t).strip()


def palabras(s):
    return len(s.split())


def url(repo, ruta, cab=''):
    base = f'https://github.com/sebamendoza-eusa/{REPOS[repo]}/blob/{COMMITS[repo]}/{ruta}'
    return base
