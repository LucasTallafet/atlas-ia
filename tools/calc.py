#!/usr/bin/env python3
"""Calculadora para verificar los números de las fichas (regla 6 de CLAUDE.md).

  python tools/calc.py "x = np.array([2,4,5,6,8]); y = np.array([5,6,7,8,9]); print(np.corrcoef(x, y)[0, 1])"
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import fuentes  # noqa: E402,F401  (fuerza UTF-8 en la consola de Windows)
import math  # noqa: E402,F401
import numpy as np  # noqa: E402,F401
import pandas as pd  # noqa: E402,F401
import scipy as sp  # noqa: E402,F401
import scipy.stats as st  # noqa: E402,F401
import sklearn  # noqa: E402,F401

if len(sys.argv) < 2:
    sys.exit(__doc__)
exec(compile(' '.join(sys.argv[1:]), '<calc>', 'exec'))
