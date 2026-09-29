# AJUSTES-MOVIL-4 · Motores táctiles: gráficos 2D en los que se arrastran puntos, vectores o umbrales

Lee antes `AJUSTES-MOVIL-COMUN.md`, `ESPEC-WEB.md` §8b (contrato táctil y su lista de comprobación), las filas de estos motores en `AUDITORIA-MOVIL.md` y, como ejemplo, `docs/motores/funcion.js` y `docs/motores/pasos.js`.

## Motores de esta orden
`vectores2d`, `transformacion2d`, `dispersion2d`, `descenso`, `umbral`, con **todos sus modos** (también los archivos de submodo `<motor>-<modo>.js` si existen).

## Haz, motor por motor
1. Aplica la **lista de comprobación de §8b** completa: `arrastrable`, `inspeccionable` en lugar de hover/`title`, controles nuevos, disposición apilada por ancho del widget, texto mínimo en el SVG, botón Ampliar, canvas nítido, pausa fuera de pantalla, teclado.
2. Además, lo específico de cada motor:
- **dispersion2d:** añadir y quitar puntos con toques (tocar vacío = añadir, mantener pulsado un punto = quitar, con un aviso que lo explique la primera vez), sin doble clic ni clic derecho.
- **descenso:** el punto de partida se coloca tocando; la trayectoria se anima con la barra de pasos; la vista de contorno sigue siendo legible a 360 px.
- **umbral:** la línea de umbral se arrastra en horizontal con una zona táctil ancha; la matriz de confusión y la curva ROC se apilan debajo del gráfico en móvil.
- **transformacion2d / vectores2d:** las puntas de los vectores con radio de captura grande; los valores de la matriz también editables con − / +.
3. Usa solo los ayudantes del núcleo. Si necesitas algo que el núcleo no tiene, añádelo al núcleo de forma compatible y anótalo en `ESPEC-WEB.md` §8b; no lo copies dentro del motor.
4. No cambies los nombres ni el significado de los parámetros ni de los modos. Si un modo necesita un parámetro nuevo, debe tener valor por defecto y lo añades a `widgets.json` (solo añadir).
5. Tras cada motor: `python tools/probar_web.py --demo <motor> --android` y `--demo <motor>` (escritorio). Mira las capturas. No pases al siguiente motor con errores.

## Hecho cuando
- `python tools/probar_web.py --demo --android`: 0 errores en los motores de esta orden (los de órdenes posteriores pueden fallar todavía; anótalo).
- `python tools/probar_web.py --demo` (escritorio): 0 errores en **todos**.
- Para cada motor, al menos 2 fichas que lo usan (búscalas en `inventario.json`) pasan `--id <ficha> --android`.
- En cada motor con algo que arrastrar, el elemento principal tiene `data-arrastrable` y `--android` no da errores de **Arrastre táctil** ni el aviso "no cambió nada".
- `DECISIONES.md` (motor por motor: qué se cambió, qué queda) y commit `Móvil 4: …`.
