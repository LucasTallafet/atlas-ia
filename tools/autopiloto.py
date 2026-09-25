#!/usr/bin/env python3
"""Autopiloto: encadena sesiones de Claude Code sin intervención, cada una con el contexto limpio.

Hace, en orden, lo que falte de: Motores M1-M9 → lotes L01-L31 (con "Revisión Bx" al cerrar cada bloque).
Tras cada sesión comprueba el resultado con los scripts (no se fía de lo que diga el modelo):
  - motores: que existan los archivos y modos de esa sesión
  - lotes: que estén todas las fichas del lote y que build.py pase sin errores
Si algo falla, reintenta una vez pidiendo solo lo pendiente; si vuelve a fallar, se para y lo deja escrito.
Si se agota el cupo de uso de 5 horas, espera y reintenta; si es el semanal, se para.

  python tools/autopiloto.py                       todo lo pendiente (Sonnet)
  python tools/autopiloto.py --max 4               como mucho 4 sesiones y para
  python tools/autopiloto.py --hasta L08           hasta ese lote incluido
  python tools/autopiloto.py --orden "Fase 1A" --orden "Fase 1B" --modelo opus   órdenes concretas, en cadena
  python tools/autopiloto.py --simular             muestra la cola sin ejecutar nada

Registro: autopiloto.log (resumen) y logs/<fecha>-<orden>.json (salida completa de cada sesión).
Requisitos: el piloto revisado (fichas derivada, metricas-clasificacion y kmeans con "estado: revisada").
"""
import argparse
import datetime as dt
import json
import re
import shutil
import subprocess
import sys
import os
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import fuentes as F  # noqa: E402
import ficha as FI  # noqa: E402

RAIZ = F.RAIZ
LOG = RAIZ / 'autopiloto.log'
DIR_LOGS = RAIZ / 'logs'
PILOTO = ['derivada', 'metricas-clasificacion', 'kmeans']
MOTORES = {  # sesión: {motor: [modos] o None = todos los de widgets.json}
    'M1': {'vectores2d': None, 'transformacion2d': None},
    'M2': {'probabilidad': None, 'datos1d': None},
    'M3': {'simulacion': None, 'descenso': None},
    'M4': {'red': None, 'convolucion': None},
    'M5': {'grafo': None, 'linea-tiempo': None, 'matriz-calor': None},
    'M6': {'rejilla': None},
    'M7': {'serie': None, 'texto': None},
    'M8': {'dispersion2d': ['correlacion', 'polinomio', 'ridge-lasso', 'metricas-regresion', 'escalado', 'pca', 'ols', 'logistica']},
    'M9': {'dispersion2d': ['knn', 'svm', 'arbol', 'bosque', 'boosting', 'comparar-clustering', 'jerarquico', 'dbscan', 'gmm', 'silueta']},
}
ESPERA_SEG = int(os.environ.get('AUTOPILOTO_ESPERA_SEG', 20 * 60))
PREFIJO = '[AUTO] '  # CLAUDE.md §10: en modo autónomo no se pregunta; se decide lo conservador y se anota
LIMITE_5H = re.compile(r'(usage limit|limit reached|rate limit|limit will reset|resets? at|hit your limit|out of usage|session limit)', re.I)
LIMITE_SEMANA = re.compile(r'(weekly|week)', re.I)


CERROJO = RAIZ / 'autopiloto.lock'


def log(msg):
    try:
        CERROJO.touch()  # señal de vida: otra ejecución programada no arranca mientras esta siga activa
    except OSError:
        pass
    linea = f'{dt.datetime.now():%Y-%m-%d %H:%M} · {msg}'
    print(linea, flush=True)
    with LOG.open('a', encoding='utf-8') as f:
        f.write(linea + '\n')


def py(*args):
    r = subprocess.run([sys.executable, *args], cwd=RAIZ, capture_output=True, text=True, encoding='utf-8', errors='replace')
    return r.returncode, r.stdout + r.stderr


# ───────────── Estado del proyecto ─────────────
def widgets():
    return json.loads((RAIZ / 'widgets.json').read_text(encoding='utf-8'))


def modos_implementados(motor):
    js = RAIZ / 'docs' / 'motores' / f'{motor}.js'
    if not js.exists():
        return None
    cab = js.read_text(encoding='utf-8').split('\n', 1)[0]
    return {m.strip() for m in cab.split('@modos:', 1)[1].split(',')} if '@modos:' in cab else set()


def motores_pendientes(sesion):
    w, falta = widgets(), []
    for motor, modos in MOTORES[sesion].items():
        impl = modos_implementados(motor)
        esperados = modos if modos is not None else (w[motor]['modos'] or ['-'])
        if impl is None:
            falta.append(motor)
        elif w[motor]['modos'] and set(esperados) - impl:
            falta.append(f'{motor} ({", ".join(sorted(set(esperados) - impl))})')
    return falta


def escritas():
    return {p.stem for p in (RAIZ / 'fichas').glob('*.md') if not p.stem.startswith('_')}


def revisadas():
    out = set()
    for p in (RAIZ / 'fichas').glob('*.md'):
        meta, _, _ = FI.leer(p)
        if meta.get('estado') == 'revisada':
            out.add(p.stem)
    return out


def cola(inv, hasta):
    """Lista de (orden, tipo, clave) pendientes, en orden."""
    tareas = [(f'Motores {s}', 'motores', s) for s in MOTORES if motores_pendientes(s)]
    hechas = escritas()
    bloque_fin = {}
    for k, ids in inv['lotes'].items():
        bloque_fin[inv['conceptos_por_id'][ids[0]]['bloque']] = k
    revisados = set(re.findall(r'REVISIÓN OK (B\d)', LOG.read_text(encoding='utf-8'))) if LOG.exists() else set()
    for k, ids in inv['lotes'].items():
        if hasta and k > hasta:
            break
        if any(i not in hechas for i in ids):
            tareas.append((f'Lote {k}', 'lote', k))
        b = inv['conceptos_por_id'][ids[0]]['bloque']
        if bloque_fin[b] == k and b not in revisados:
            tareas.append((f'Revisión {b}', 'revision', b))
    return tareas


# ───────────── Ejecución de una sesión ─────────────
def sesion(orden, modelo, max_turnos, timeout_min):
    cmd = [shutil.which('claude') or 'claude', '-p', PREFIJO + orden, '--model', modelo, '--permission-mode', 'acceptEdits',
           '--permission-prompts', 'none', '--max-turns', str(max_turnos), '--output-format', 'json']
    inicio, info = time.time(), {}
    try:
        r = subprocess.run(cmd, cwd=RAIZ, capture_output=True, text=True, encoding='utf-8', errors='replace',
                           timeout=timeout_min * 60)
        salida, codigo = r.stdout + '\n' + r.stderr, r.returncode
        try:
            info = json.loads(r.stdout)
        except json.JSONDecodeError:
            pass
    except subprocess.TimeoutExpired:
        salida, codigo = f'TIMEOUT tras {timeout_min} min', -1
    DIR_LOGS.mkdir(exist_ok=True)
    nombre = re.sub(r'[^\w-]+', '_', orden)[:60]
    (DIR_LOGS / f'{dt.datetime.now():%Y%m%d-%H%M}-{nombre}.json').write_text(salida, encoding='utf-8')
    return codigo, salida, info, (time.time() - inicio) / 60


def es_limite(codigo, salida, info):
    return (codigo != 0 or info.get('is_error')) and bool(LIMITE_5H.search(salida))


def verificar(tipo, clave, inv):
    if tipo == 'motores':
        falta = motores_pendientes(clave)
        if falta:
            return False, 'faltan motores/modos: ' + '; '.join(falta)
        codigo, out = py('tools/probar_web.py', '--demo')
        if codigo != 0 and 'Playwright no está instalado' not in out:
            return False, 'demo.html con errores:\n' + out[-800:]
        return True, 'motores listos'
    if tipo == 'lote':
        ids = inv['lotes'][clave]
        falta = [i for i in ids if i not in escritas()]
        if falta:
            return False, 'fichas sin escribir: ' + ' '.join(falta)
        codigo, out = py('tools/build.py', '--lote', clave)
        if codigo != 0:
            return False, 'build con errores:\n' + out[-1200:]
        return True, 'lote válido'
    codigo, out = py('tools/build.py')
    return codigo == 0, out[-600:]


def guardar(orden):
    """Commit de lo pendiente y push; si el remoto va por delante, integra (merge) y reintenta."""
    if not git_limpio():
        subprocess.run(['git', 'add', '-A'], cwd=RAIZ)
        subprocess.run(['git', 'commit', '-q', '-m', f'{orden} (autopiloto)'], cwd=RAIZ)
    r = subprocess.run(['git', 'push', '-q'], cwd=RAIZ, capture_output=True, text=True)
    if r.returncode != 0:
        m = subprocess.run(['git', 'pull', '--no-rebase', '--no-edit', '-q'], cwd=RAIZ, capture_output=True, text=True)
        r = subprocess.run(['git', 'push', '-q'], cwd=RAIZ, capture_output=True, text=True)
        if r.returncode != 0:
            log(f'  ⚠ push fallido (el trabajo está guardado en local): {(m.stderr + r.stderr).strip()[:300]}')


def git_limpio():
    r = subprocess.run(['git', 'status', '--porcelain'], cwd=RAIZ, capture_output=True, text=True)
    return not r.stdout.strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--modelo', default='sonnet')
    ap.add_argument('--max', type=int, default=0, help='máximo de sesiones en esta ejecución (0 = sin límite)')
    ap.add_argument('--hasta', help='último lote a hacer, p. ej. L08')
    ap.add_argument('--orden', action='append', help='ejecuta solo estas órdenes, en orden (se puede repetir)')
    ap.add_argument('--modelo-motores', help='modelo para las sesiones de motores (por defecto, el de --modelo)')
    ap.add_argument('--max-turnos', type=int, default=250)
    ap.add_argument('--timeout', type=int, default=180, help='minutos máximos por sesión')
    ap.add_argument('--esperar', type=int, default=6, help='horas máximas esperando a que se renueve el cupo de 5 h')
    ap.add_argument('--simular', action='store_true')
    ap.add_argument('--sin-piloto', action='store_true', help='no exige que el piloto esté revisado (no recomendado)')
    a = ap.parse_args()

    if not shutil.which('claude'):
        sys.exit('No encuentro el comando "claude". Abre una terminal nueva o reinstala Claude Code.')
    inv = F.inventario()
    inv['conceptos_por_id'] = {c['id']: c for c in inv['conceptos']}

    if a.orden:
        tareas = [(o, 'libre', None) for o in a.orden]
    else:
        if not a.sin_piloto and not set(PILOTO) <= revisadas():
            sys.exit('El piloto no está revisado. Lee las fichas derivada, metricas-clasificacion y kmeans, '
                     'haz los ajustes que quieras y ejecuta en Claude Code: "Marca revisadas: derivada metricas-clasificacion kmeans".')
        if not (RAIZ / 'docs' / 'index.html').exists():
            sys.exit('Falta la web base: haz antes la Fase 1A (y la 1B).')
        tareas = cola(inv, a.hasta)
    if a.max:
        tareas = tareas[:a.max]
    if a.simular or not tareas:
        print('Cola:' if tareas else 'No queda nada pendiente.')
        for t in tareas:
            print('  -', t[0])
        return

    if CERROJO.exists() and time.time() - CERROJO.stat().st_mtime < 3 * 3600:
        sys.exit('Ya hay un autopiloto en marcha (autopiloto.lock activo). Si no es así, borra autopiloto.lock.')
    try:
        ejecutar(tareas, a, inv)
    finally:
        CERROJO.unlink(missing_ok=True)


def ejecutar(tareas, a, inv):
    log(f'INICIO · {len(tareas)} sesiones · modelo {a.modelo}')
    for orden, tipo, clave in tareas:
        texto = orden
        for intento in (1, 2):
            esperado = 0
            while True:
                log(f'→ {texto}')
                modelo = (a.modelo_motores or a.modelo) if tipo == 'motores' else a.modelo
                codigo, salida, info, minutos = sesion(texto, modelo, a.max_turnos, a.timeout)
                coste = info.get('total_cost_usd')
                log(f'  fin en {minutos:.0f} min · turnos {info.get("num_turns", "?")}'
                    + (f' · coste equivalente {coste:.2f} $' if coste else ''))
                if not es_limite(codigo, salida, info):
                    break
                if LIMITE_SEMANA.search(salida):
                    log('PARADA · límite SEMANAL alcanzado. Relanza el autopiloto cuando se renueve.')
                    return
                if esperado >= a.esperar * 60:
                    log('PARADA · el cupo no se renovó dentro del tiempo máximo de espera.')
                    return
                log('  límite de uso de 5 h alcanzado: espero 20 min y reintento')
                time.sleep(ESPERA_SEG)
                esperado += ESPERA_SEG / 60
            if tipo == 'libre':
                guardar(orden)
                log(f'  terminado (código {codigo}). Revisa el resultado en logs/.')
                break
            ok, detalle = verificar(tipo, clave, inv)
            if ok:
                if tipo == 'revision':
                    log(f'REVISIÓN OK {clave}')
                guardar(orden)
                log(f'  ✓ {orden}: {detalle.splitlines()[0] if detalle else "ok"}')
                break
            if intento == 2:
                log(f'PARADA · {orden} sigue fallando tras reintentar:\n{detalle}\n'
                    f'  Abre Claude Code, escribe "{orden}" y mira qué pasa. Después relanza el autopiloto.')
                return
            if tipo == 'lote' and detalle.startswith('fichas sin escribir'):
                texto = f'Lote {clave}, solo: {detalle.split(": ", 1)[1]}'
            else:
                texto = f'{orden}. La sesión anterior no terminó bien. Problema detectado: {detalle[:600]} Corrígelo y termina.'
            log(f'  ✗ {detalle.splitlines()[0]} → reintento')
    log('FIN · cola completada')


if __name__ == '__main__':
    main()
