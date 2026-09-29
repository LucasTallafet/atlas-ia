# AJUSTES-MOVIL-7 · Pasada completa por las 138 fichas

Lee antes `AJUSTES-MOVIL-COMUN.md`.

## Objetivo
Comprobar que **cada ficha** funciona en Android con su interactivo real (sus parámetros concretos, no los de la demo) y arreglar lo que quede.

## Haz
1. `python tools/probar_web.py --todas --android` y `python tools/probar_web.py --todas --android --esencial` (tardan varios minutos cada uno). Apunta los ids con ✗ y sus motivos.
2. Clasifica cada fallo:
   - **Del motor o del núcleo** (se repite en varias fichas del mismo motor): arréglalo en el motor siguiendo §8b.
   - **De la página** (fórmula, tabla o código que desborda, etc.): arréglalo en CSS/JS de la ficha.
   - **De los parámetros de una ficha** (demasiados puntos o categorías para 360 px, etiquetas larguísimas, una rejilla enorme): **única excepción** en la que puedes editar `fichas/`: cambia **solo** los parámetros dentro del bloque `:::interactivo` de esa ficha, sin tocar el texto, y solo si el motor no puede resolverlo solo (preferible: que el motor se adapte al ancho). Cada cambio, en `DECISIONES.md` con `ficha | parámetro | antes → después | motivo`.
3. Mira las capturas de al menos una ficha por motor y todas las que hayan fallado antes de arreglarlas.
4. Repite el paso 1 hasta 0 errores. Los **avisos** de texto < 12 px: arréglalos si son del motor o de la página; si son de MathJax (subíndices), ignóralos.

## Hecho cuando
- `python tools/build.py` → 0 errores.
- `python tools/probar_web.py --todas --android`: 0 fichas con problemas.
- `python tools/probar_web.py --todas` (escritorio): 0 fichas con problemas.
- `python tools/probar_web.py --vistas --android --oscuro` y `--demo --android`: 0 errores.
- `DECISIONES.md` y commit `Móvil 7: …`.
