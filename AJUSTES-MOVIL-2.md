# AJUSTES-MOVIL-2 · La ficha en móvil

Lee antes `AJUSTES-MOVIL-COMUN.md`, `AUDITORIA-MOVIL.md` (filas de la orden 2) y `ESPEC-WEB.md` §5.

## Objetivo
Que estudiar una ficha en el móvil sea tan claro como en PC: se lee de corrido, se salta rápido entre secciones y nada se corta.

## Haz
1. **Cabecera de ficha:** bloque (color) + título + interruptor **Completa / Esencial** como control segmentado grande. Al desplazar, queda una **barra fija compacta** con el título abreviado, el interruptor y un botón "Secciones".
2. **Secciones:** el botón "Secciones" abre una `hojaInferior` con el índice de la ficha (solo las secciones presentes en la vista actual) y la sección actual marcada; tocar una hace scroll suave hasta ella (con el desfase de la barra fija). Añade además una fila de `chips` desplazable bajo la cabecera si cabe sin agobiar; si no, solo la hoja.
3. **Barra lateral** (requisitos, conexiones, desambiguación, fuentes, "Para llevar"): en < 1024 px pasa a un botón **Relaciones** que abre una `hojaInferior`; los requisitos no vistos se marcan. "Para llevar" (En resumen) va dentro de la ficha, antes de A fondo, como caja destacada.
4. **Fórmulas (MathJax SVG):** cada fórmula en bloque va dentro de una caja con `overflow-x: auto` e indicador de "hay más" (degradado lateral). Nunca se reduce la fórmula por debajo del tamaño del texto. Las fórmulas en línea que sean más anchas que la pantalla se tratan igual.
5. **Tablas y código:** misma solución (caja con desplazamiento propio). El código a 14 px mínimo, con botón **Copiar** de 48 px.
6. **A fondo y bloques plegables:** `summary` de ≥ 48 px con indicador claro de abierto/cerrado.
7. **Autoevaluación:** cada opción es un botón a todo el ancho (≥ 56 px, texto que salta de línea), con respuesta y explicación que aparecen debajo sin mover la opción tocada. Botones "Comprobar"/"Siguiente" al pie.
8. **Navegación entre fichas:** al final, dos botones grandes "← Anterior" / "Siguiente →" según la ruta activa o el orden del inventario, y "Marcar como vista".
9. **Interactivo:** por ahora solo asegúrate de que el contenedor `.widget` ocupa todo el ancho útil, no desborda y respeta un alto mínimo razonable; el comportamiento táctil lo arreglan las órdenes 3–6.
10. **Enlaces a otras fichas** dentro del texto: zona táctil ampliada verticalmente (padding) sin cambiar el aspecto del párrafo.

## Hecho cuando
- `python tools/probar_web.py --id <id> --android` con 0 errores y mirando las capturas para: `kmeans`, `descenso-gradiente`, `matriz-confusion`, `atencion`, `svd` (o las más parecidas del inventario) y una ficha con tablas y otra con mucho código (elígelas tú; di cuáles en DECISIONES.md). Repite en `--oscuro` y en Esencial (`--esencial`).
- `python tools/probar_web.py --lote L01` en escritorio: 0 errores.
- `ESPEC-WEB.md` §5 describe la ficha en móvil. `DECISIONES.md` y commit `Móvil 2: …`.
