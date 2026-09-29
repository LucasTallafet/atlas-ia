# AJUSTES-MOVIL-0 · Auditoría (sin cambiar código)

Lee antes `AJUSTES-MOVIL-COMUN.md`.

## Objetivo
Saber exactamente qué falla en Android antes de tocar nada, para que las órdenes siguientes vayan a tiro hecho. **En esta orden no modifiques ningún archivo de `docs/`.**

## Haz
1. Lee `ESPEC-WEB.md` (§4 vistas, §5 ficha, §7 diseño, §8 motores) y echa un vistazo a la estructura de `docs/` (index.html, app.js, estilos.css, mapa.js, motores/nucleo.js, demo.html). No leas `docs/datos/` ni `docs/vendor/`.
2. Ejecuta y guarda la salida:
   - `python tools/probar_web.py --vistas --android`
   - `python tools/probar_web.py --demo --android`
   - `python tools/probar_web.py --id kmeans --android`, y lo mismo con `descenso-gradiente`, `matriz-confusion`, `atencion`, `q-learning` y `redes-bayesianas` (si un id no existe, busca en `inventario.json` el más parecido).
   - `python tools/probar_web.py --vistas --android --oscuro`
3. Mira con Read **todas** las capturas de vistas y de la demo, y las de las 6 fichas. Busca también lo que los scripts no detectan: cosas tapadas o cortadas, menús que no caben, paneles laterales aplastados, fórmulas cortadas, controles que solo funcionan con hover, arrastres que chocarían con el scroll, textos ilegibles dentro de los SVG, huecos enormes.
4. Revisa en el código cómo gestiona cada motor el puntero: busca `mouse`, `hover`, `mouseover`, `mousemove`, `title=`, `pointer`, `touch`, `wheel`, `dblclick`, `contextmenu` en `docs/motores/` y en `docs/*.js`.

## Entrega: `AUDITORIA-MOVIL.md`
- **Resumen** en 5 líneas: lo más grave primero.
- **Vistas** (inicio, mapa, rutas, glosario, repaso, ficha, buscador, cabecera/menú): una tabla `problema | dónde | gravedad (alta/media/baja) | arreglo propuesto | orden que lo arregla (1–7)`.
- **Motores**: una fila por motor con `interacción que usa | qué falla en táctil | tamaño mínimo de texto en su SVG | arreglo propuesto | orden (3, 4, 5 o 6)`. Los grupos son: orden 3 `funcion`, `pasos` y el núcleo; orden 4 `vectores2d`, `transformacion2d`, `dispersion2d`, `descenso`, `umbral`; orden 5 `probabilidad`, `datos1d`, `simulacion`, `serie`, `linea-tiempo`; orden 6 `rejilla`, `red`, `convolucion`, `texto`, `matriz-calor`, `grafo`.
- **Riesgos**: lo que podría romper el escritorio si se arregla mal.

## Hecho cuando
Existe `AUDITORIA-MOVIL.md` con todas las vistas y los 19 motores, `git status` solo muestra ese archivo y `DECISIONES.md`, y has hecho commit (`Móvil 0: auditoría`).
