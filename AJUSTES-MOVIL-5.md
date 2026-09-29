# AJUSTES-MOVIL-5 · Motores táctiles: simulaciones, distribuciones, datos y series

Lee antes `AJUSTES-MOVIL-COMUN.md`, `ESPEC-WEB.md` §8b (contrato táctil y su lista de comprobación), las filas de estos motores en `AUDITORIA-MOVIL.md` y, como ejemplo, `docs/motores/funcion.js` y `docs/motores/pasos.js`.

## Motores de esta orden
`probabilidad`, `datos1d`, `simulacion`, `serie`, `linea-tiempo`, con **todos sus modos** (también los archivos de submodo `<motor>-<modo>.js` si existen).

## Haz, motor por motor
1. Aplica la **lista de comprobación de §8b** completa: `arrastrable`, `inspeccionable` en lugar de hover/`title`, controles nuevos, disposición apilada por ancho del widget, texto mínimo en el SVG, botón Ampliar, canvas nítido, pausa fuera de pantalla, teclado.
2. Además, lo específico de cada motor:
- **simulacion:** botones Ejecutar ×1 / ×10 / ×100 grandes; la animación se puede pausar; nada de miles de nodos DOM (usa canvas si hace falta).
- **probabilidad:** tablas y diagramas de Venn legibles a 360 px; las celdas editables con teclado numérico (`inputmode="decimal"`).
- **datos1d:** los puntos/barras se tocan para ver su valor; los atípicos se arrastran con zona táctil ancha.
- **serie / linea-tiempo:** desplazamiento horizontal propio del gráfico (arrastrar = mover en el tiempo) con `touch-action: pan-y` para no bloquear el scroll vertical, y botones ‹ › alternativos; eventos de la línea de tiempo como tarjetas que se tocan.
3. Usa solo los ayudantes del núcleo. Si necesitas algo que el núcleo no tiene, añádelo al núcleo de forma compatible y anótalo en `ESPEC-WEB.md` §8b; no lo copies dentro del motor.
4. No cambies los nombres ni el significado de los parámetros ni de los modos. Si un modo necesita un parámetro nuevo, debe tener valor por defecto y lo añades a `widgets.json` (solo añadir).
5. Tras cada motor: `python tools/probar_web.py --demo <motor> --android` y `--demo <motor>` (escritorio). Mira las capturas. No pases al siguiente motor con errores.

## Hecho cuando
- `python tools/probar_web.py --demo --android`: 0 errores en los motores de esta orden (los de órdenes posteriores pueden fallar todavía; anótalo).
- `python tools/probar_web.py --demo` (escritorio): 0 errores en **todos**.
- Para cada motor, al menos 2 fichas que lo usan (búscalas en `inventario.json`) pasan `--id <ficha> --android`.
- En cada motor con algo que arrastrar, el elemento principal tiene `data-arrastrable` y `--android` no da errores de **Arrastre táctil** ni el aviso "no cambió nada".
- `DECISIONES.md` (motor por motor: qué se cambió, qué queda) y commit `Móvil 5: …`.
