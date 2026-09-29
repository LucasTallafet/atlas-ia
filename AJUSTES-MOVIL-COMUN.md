# Adaptación a móvil (Android): reglas comunes

Toda orden `AJUSTES-MOVIL-n` empieza leyendo este archivo. Si algo de una orden contradice a este archivo, manda este archivo.

## 1. Objetivo

Que el Atlas se use **cómodo con una mano en un Android** (Chrome y la app instalada como PWA), sin perder nada de lo que ya funciona en PC. Dispositivo de referencia: Pixel 7 (412 × 915 px CSS, DPR ≈ 2,6, táctil, sin ratón ni teclado físico). También debe funcionar bien en horizontal y en tablets.

**La Constelación queda fuera.** No se toca su código y en móvil no se muestra: en anchos < 1024 px el mapa abre directamente en la vista **Por bloques** y el selector Constelación / Por bloques se oculta. En escritorio todo sigue exactamente igual.

## 2. Invariantes (no se rompen nunca)

1. **El escritorio no cambia** (≥ 1024 px con ratón). Todo lo nuevo va en media queries, en `@media (pointer: coarse)` o en código que solo se activa en móvil. Tras cada orden, `python tools/probar_web.py --vistas` y `--demo` siguen con 0 fallos.
2. HTML, CSS y JS sin frameworks ni librerías nuevas. Nada se carga de fuera. La web sigue funcionando abriendo `docs/index.html` con doble clic (file://).
3. No se tocan: `fichas/` (salvo lo que permite la orden 7), `inventario.json`, `CLAUDE.md`, `PLANTILLA-FICHA.md`, `tools/`, `docs/datos/`, `docs/vendor/`, ni el código de la Constelación. `widgets.json` solo se toca si una orden lo pide.
4. El contrato de los motores (`Motores.registrar`, parámetros, `ejemplos`, `// @modos:`) no cambia de forma incompatible: las 138 fichas deben seguir funcionando sin editarlas.
5. El progreso guardado (`localStorage` `atlas-ia-v1`) se conserva: no se renombran claves.

## 3. Puntos de corte

Usa estos tres rangos (si el CSS ya tiene otros, unifícalos a estos):

| Rango | Nombre | Qué cambia |
|---|---|---|
| < 600 px | móvil | una columna, barra de navegación inferior, paneles como hojas inferiores |
| 600–1023 px | tablet | dos columnas donde quepa, barra inferior |
| ≥ 1024 px | escritorio | el diseño actual, sin cambios |

Además, `@media (pointer: coarse)` activa los tamaños táctiles aunque la pantalla sea ancha (tablet, portátil táctil).

## 4. Reglas táctiles

- **Objetivos táctiles ≥ 48 × 48 px** (mínimo absoluto 44), con ≥ 8 px entre objetivos vecinos. Si el elemento visible es pequeño, amplía su zona con padding o con un pseudo-elemento, no agrandes el dibujo.
- **Nada depende del hover.** Toda información que ahora aparece al pasar el ratón (tooltips, resaltados, valores) aparece también al tocar; un segundo toque o tocar fuera la cierra.
- Texto base ≥ 16 px en móvil; nada legible por debajo de 12 px (tampoco en los SVG de los motores: ejes, etiquetas, leyendas).
- Los campos de texto usan `font-size: 16px` como mínimo (si no, Android hace zoom al enfocarlos) y el `inputmode`/`type` adecuado.
- Nada provoca **desplazamiento horizontal de la página**. Lo que sea ancho por naturaleza (fórmulas largas, tablas, bloques de código) se desplaza dentro de su propia caja con `overflow-x: auto`, con una sombra o degradado que indique que hay más.
- `touch-action` explícito en todo lo que se arrastra (ver la orden de motores), para que arrastrar no desplace la página y desplazar la página no arrastre por error.
- Estado de foco visible (`:focus-visible`) y `aria-label` en todo botón que solo tenga icono.
- Respeta `prefers-reduced-motion` y las zonas seguras (`env(safe-area-inset-*)`).

## 5. Rendimiento en un Android de gama media

- Nada de trabajo continuo si no hay interacción: las animaciones usan `requestAnimationFrame` y se detienen cuando terminan o cuando el widget sale de pantalla (`IntersectionObserver`).
- Los motores de una ficha se crean al acercarse a la pantalla, no todos al cargar.
- Los canvas se dibujan a `devicePixelRatio` (nítidos) pero con un máximo de 2 para no disparar la memoria.
- Los eventos de arrastre se agrupan por fotograma (un redibujado por `requestAnimationFrame`, no uno por evento).

## 6. Cómo se comprueba

```
python tools/probar_web.py --vistas --android          (vistas generales, emulación Pixel 7)
python tools/probar_web.py --demo --android            (todos los motores)
python tools/probar_web.py --demo <motor> --android    (un motor)
python tools/probar_web.py --id <ficha> --android      (una ficha)
python tools/probar_web.py --vistas --android --oscuro (tema oscuro)
```

`--android` marca como **error** el desplazamiento horizontal y los objetivos táctiles < 44 px (los enlaces dentro de un párrafo no cuentan), y como **aviso** el texto < 12 px. En los interactivos, además, **arrastra con el dedo** (eventos táctiles reales) el primer elemento `[data-arrastrable]` de cada widget: es **error** si la página se desplaza y **aviso** si el widget no cambia. Deja capturas en `capturas/<id>-android.png`: **ábrelas con Read y míralas** antes de dar una orden por terminada; los scripts no ven si algo es feo, confuso o está tapado.

## 7. Al terminar cada orden

1. `python tools/build.py` → 0 errores.
2. Las comprobaciones que pida la orden, en móvil **y** en escritorio.
3. Actualiza `ESPEC-WEB.md` (la sección que corresponda) para que describa lo que ahora hay.
4. Anota en `DECISIONES.md`: `AJUSTES-MOVIL-n: hecho`, lo decidido y cualquier cosa que no hayas podido resolver (con el nombre del motor o de la vista).
5. Commit con un mensaje que empiece por `Móvil n:`.
