# AJUSTES-MOVIL-3 · Contrato táctil de los motores (núcleo + `funcion` y `pasos`)

Lee antes `AJUSTES-MOVIL-COMUN.md`, `AUDITORIA-MOVIL.md` (sección Motores), `ESPEC-WEB.md` §8 y `docs/motores/nucleo.js`.

## Objetivo
Resolver **una sola vez, en el núcleo**, todo lo que los motores necesitan para ir bien con el dedo, y dejar dos motores de referencia (`funcion` y `pasos`) que las órdenes 4–6 copiarán. Un motor fácil de usar en móvil es uno en el que **se ve qué se puede tocar, el dedo no tapa lo que cambia y nada pelea con el scroll**.

## Haz en `nucleo.js` (y en su CSS)

1. **Puntero unificado.** Un ayudante `arrastrable(elemento, {alEmpezar, alMover, alSoltar, radio})` con Pointer Events (`pointerdown/move/up/cancel`, `setPointerCapture`) que sirva igual para ratón, dedo y lápiz. Radio de captura ≥ 24 px alrededor del punto (el punto visible puede seguir siendo pequeño). Agrupa los movimientos por `requestAnimationFrame`. `arrastrable` marca el elemento con el atributo `data-arrastrable` (lo usa `probar_web.py --android` para probar el arrastre con el dedo). Mientras se arrastra, el punto crece y muestra su valor **por encima del dedo** (desplazado ~40 px hacia arriba), no debajo.
2. **Arrastre contra scroll.** Ojo: **Chrome ignora `touch-action` en las formas SVG** (`circle`, `line`, `path`…); solo cuenta en elementos HTML y en el `<svg>` raíz. Regla:
   - Si en el gráfico casi todo se arrastra (un plano con vectores, un umbral, un grafo): `touch-action: none` en el `<svg>` o en una capa HTML transparente encima, y la página se desplaza tocando fuera del gráfico (deja siempre margen lateral libre y no hagas el gráfico más alto que ~70 % de la pantalla).
   - Si solo hay algún punto suelto: el `<svg>` lleva `touch-action: pan-y` (el scroll vertical sigue funcionando sobre el gráfico) y los puntos se mueven también con los controles − / +.
   - Elige por motor y anótalo en §8b. Nunca `preventDefault` en `touchmove` a nivel de documento.
3. **Adiós al hover.** `inspeccionable(elemento, textoFn)`: en ratón sigue funcionando como ahora; en táctil, tocar muestra la etiqueta/valor fijo hasta tocar en otro sitio. Sustituye los `title=` y `mouseover` del núcleo por esto.
4. **Controles.** Los deslizadores (`input[type=range]`) con pista de 8 px, pulgar de 28 px y zona táctil de 48 px de alto; su etiqueta y **valor actual** encima, con coma decimal. Botones **− / +** a los lados cuando el valor necesite precisión (paso fino). Los selectores de modo/opción, como control segmentado o `chips`. Los botones de paso a paso (Anterior, Reproducir/Pausa, Siguiente, Reiniciar) en una **barra de herramientas** de botones de 48 px que queda pegada al pie del widget mientras se ve el gráfico.
5. **Disposición.** El widget detecta su propio ancho con `ResizeObserver` (no el de la ventana): por debajo de 560 px apila **gráfico arriba, controles debajo**; por encima, el diseño actual. El gráfico mantiene una proporción razonable (p. ej. 4:3 en vertical) y se redibuja al girar el móvil.
6. **Texto dentro de los SVG.** Un tamaño mínimo real en pantalla de 12 px para ejes, etiquetas y leyendas (calcula la escala del `viewBox` y compénsala) y menos marcas en los ejes cuando el ancho es pequeño.
7. **Ampliar.** Cada widget tiene un botón **⤢ Ampliar** que lo abre a pantalla completa (Fullscreen API si existe, si no un panel fijo que ocupa la pantalla), con los controles abajo; en horizontal, gráfico a la izquierda y controles a la derecha. Atrás o ✕ lo cierra (crea entrada de historial, como las hojas inferiores). El estado del motor se conserva al ampliar y al cerrar.
8. **Canvas nítido.** Ayudante que ajusta `canvas.width/height` a `devicePixelRatio` (máx. 2) y reescala el contexto.
9. **Rendimiento.** Creación perezosa con `IntersectionObserver` y pausa de animaciones fuera de pantalla (ver COMUN §5). Si ya existe algo parecido, reutilízalo.
10. **Accesibilidad.** Los puntos arrastrables se pueden mover también con el teclado (flechas) y tienen `aria-label` con su valor.

## Aplica a `funcion` y `pasos`
Migra estos dos motores (todos sus modos) al nuevo contrato para que sirvan de ejemplo: puntos con `arrastrable`, valores con `inspeccionable`, deslizadores y barra de pasos nuevos, texto mínimo, ampliar. El resultado visual en escritorio debe ser igual o mejor, nunca peor.

## Documenta
En `ESPEC-WEB.md` §8 añade **§8b Contrato táctil**: los ayudantes, cuándo usar cada uno, reglas de `touch-action`, tamaños, y una **lista de comprobación de 10 puntos** que las órdenes 4–6 aplicarán a cada motor.

## Hecho cuando
- `python tools/probar_web.py --demo funcion --android`, `--demo pasos --android` y las fichas que usan esos motores (búscalas en `inventario.json`; prueba al menos 4) con `--android`: 0 errores. Mira las capturas.
- En esas pruebas `--android` no hay errores de **Arrastre táctil** ni avisos de "el arrastre táctil no cambió nada" en `funcion` (cada modo con algo que arrastrar debe tener su `[data-arrastrable]`).
- `python tools/probar_web.py --demo` en escritorio: 0 errores en **todos** los motores (el núcleo es compartido).
- `DECISIONES.md` y commit `Móvil 3: …`.
