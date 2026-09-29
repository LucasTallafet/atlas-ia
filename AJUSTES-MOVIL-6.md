# AJUSTES-MOVIL-6 · Motores táctiles: estructuras: rejillas, redes, matrices, textos y grafos

Lee antes `AJUSTES-MOVIL-COMUN.md`, `ESPEC-WEB.md` §8b (contrato táctil y su lista de comprobación), las filas de estos motores en `AUDITORIA-MOVIL.md` y, como ejemplo, `docs/motores/funcion.js` y `docs/motores/pasos.js`.

## Motores de esta orden
`rejilla`, `red`, `convolucion`, `texto`, `matriz-calor`, `grafo`, con **todos sus modos** (también los archivos de submodo `<motor>-<modo>.js` si existen).

## Haz, motor por motor
1. Aplica la **lista de comprobación de §8b** completa: `arrastrable`, `inspeccionable` en lugar de hover/`title`, controles nuevos, disposición apilada por ancho del widget, texto mínimo en el SVG, botón Ampliar, canvas nítido, pausa fuera de pantalla, teclado.
2. Además, lo específico de cada motor:
- **rejilla:** celdas ≥ 44 px (si la rejilla no cabe, se amplía con ⤢ o se desplaza en su caja); las herramientas (pared, meta, inicio) como control segmentado; valores y flechas de política legibles.
- **red:** neuronas y pesos que se tocan para ver su valor; en capas anchas, la red se muestra en vertical en móvil.
- **convolucion:** imagen y filtro apilados; el filtro se edita con − / + por celda; la ventana deslizante se mueve con la barra de pasos o arrastrándola.
- **texto:** campo de texto a 16 px (sin zoom de Android), resultados en chips o tabla con desplazamiento propio.
- **matriz-calor:** celdas que se tocan para ver fila, columna y valor; etiquetas de filas/columnas legibles (rota o abrevia con tooltip táctil); en atención, tocar un token resalta su fila.
- **grafo:** nodos con radio de captura ≥ 24 px, arrastrables sin mover la página; pellizcar para ampliar y arrastrar con dos dedos para desplazarse (o botones + / − / centrar); tocar un nodo abre su detalle.
3. Usa solo los ayudantes del núcleo. Si necesitas algo que el núcleo no tiene, añádelo al núcleo de forma compatible y anótalo en `ESPEC-WEB.md` §8b; no lo copies dentro del motor.
4. No cambies los nombres ni el significado de los parámetros ni de los modos. Si un modo necesita un parámetro nuevo, debe tener valor por defecto y lo añades a `widgets.json` (solo añadir).
5. Tras cada motor: `python tools/probar_web.py --demo <motor> --android` y `--demo <motor>` (escritorio). Mira las capturas. No pases al siguiente motor con errores.

## Hecho cuando
- `python tools/probar_web.py --demo --android`: 0 errores en los motores de esta orden (los de órdenes posteriores pueden fallar todavía; anótalo).
- `python tools/probar_web.py --demo` (escritorio): 0 errores en **todos**.
- Para cada motor, al menos 2 fichas que lo usan (búscalas en `inventario.json`) pasan `--id <ficha> --android`.
- En cada motor con algo que arrastrar, el elemento principal tiene `data-arrastrable` y `--android` no da errores de **Arrastre táctil** ni el aviso "no cambió nada".
- `DECISIONES.md` (motor por motor: qué se cambió, qué queda) y commit `Móvil 6: …`.
