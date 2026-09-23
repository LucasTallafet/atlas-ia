#!/usr/bin/env python3
"""Prepara el proyecto una sola vez (Windows, macOS o Linux):
  1. clona los 3 repos fuente en fuentes/ y los fija en el commit con el que se hizo el inventario
  2. instala las librerías de requirements.txt (markdown para el build; numpy, pandas, scipy,
     scikit-learn y matplotlib para ejecutar el código de las fichas)
  3. descarga MathJax 3 (SVG) en docs/vendor/
  4. comprueba el inventario

  python tools/preparar.py
"""
import io
import subprocess
import sys
import tarfile
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import fuentes as F  # noqa: E402

MATHJAX_NPM = 'https://registry.npmjs.org/mathjax/-/mathjax-3.2.2.tgz'  # el kit ya lo incluye; esto es por si falta


def run(*cmd, cwd=None):
    print('  $', ' '.join(cmd))
    subprocess.run(cmd, cwd=cwd, check=True)


def main():
    print('1/4 Repos fuente')
    F.FUENTES.mkdir(exist_ok=True)
    for clave, repo in F.REPOS.items():
        destino = F.FUENTES / repo
        if not (destino / '.git').exists():
            run('git', '-c', 'core.autocrlf=false', 'clone', '--quiet', f'https://github.com/sebamendoza-eusa/{repo}', str(destino))
        run('git', '-c', 'advice.detachedHead=false', 'checkout', '--quiet', F.COMMITS[clave], cwd=destino)

    print('2/4 Librerías de Python (requirements.txt)')
    run(sys.executable, '-m', 'pip', 'install', '--quiet', '-r', str(F.RAIZ / 'requirements.txt'))

    print('3/4 MathJax')
    vendor = F.RAIZ / 'docs' / 'vendor'
    vendor.mkdir(parents=True, exist_ok=True)
    mj = vendor / 'tex-svg-full.js'
    if mj.exists() and mj.stat().st_size > 1_000_000:
        print('  ya descargado')
    else:
        datos = urllib.request.urlopen(MATHJAX_NPM, timeout=120).read()
        with tarfile.open(fileobj=io.BytesIO(datos)) as tar:
            mj.write_bytes(tar.extractfile('package/es5/tex-svg-full.js').read())
        print(f'  descargado ({mj.stat().st_size // 1024} KB)')

    print('4/4 Comprobación del inventario')
    subprocess.run([sys.executable, str(F.RAIZ / 'tools' / 'solapes.py')], check=True)
    print('\nListo. Opcional para probar la web (dos comandos):\n  python -m pip install playwright\n  python -m playwright install chromium')


if __name__ == '__main__':
    main()
