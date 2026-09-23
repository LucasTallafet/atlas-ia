# Especificación de la web (`docs/`)

Léelo solo en las fases de web (1A, 1B, M1-M9 y final) o cuando tengas que implementar un motor. Se puede editar en esas fases; la sección §API real la rellena la Fase 1A.

## 1. Principios

- **Web estática sin frameworks ni build de JS.** HTML + CSS + JS moderno (ES2020) en archivos separados. Funciona abriendo `docs/index.html` con doble clic (`file://`) y en GitHub Pages. Por eso los datos se cargan con `<script>` (no con `fetch`).
- **Cero dependencias externas en tiempo de ejecución.** Única librería: MathJax 3 SVG, ya descargada en `docs/vendor/tex-svg-full.js`. Tipografía: pila del sistema o, como mejora opcional, Google Fonts con fallback.
- **Claridad antes que adorno.** Es una herramienta de estudio para leer durante horas: texto de 65-75 caracteres de ancho, jerarquía tipográfica nítida, mucho aire, ninguna animación gratuita.
- **Tema claro y oscuro** con tokens CSS en `:root` y `@media (prefers-color-scheme: dark)`, más un conmutador manual (`data-tema` en `<html>`).
- **Responsive** desde 360 px. Accesible: navegación con teclado, foco visible, `aria-*` en controles, respeta `prefers-reduced-motion`.

## 2. Estructura

```
docs/
  index.html          esqueleto: cabecera, <main id="vista">, carga de scripts
  estilos.css         tokens, tipografía, componentes
  app.js              enrutado por hash, vistas, progreso
  motores/nucleo.js   registro de motores + API común
  motores/<motor>.js  un archivo por motor (primera línea: // @modos: a, b  |  // @modos: -)
  demo.html           banco de pruebas: muestra cada motor con los ejemplos de cada modo
  datos/indice.js     window.INDICE (lo genera build.py)
  datos/B1.js … B8.js window.FICHAS (lo genera build.py; se cargan bajo demanda por bloque)
  vendor/tex-svg-full.js
```

MathJax se configura antes de cargarlo: `window.MathJax = {tex: {inlineMath: [['\\(', '\\)']], displayMath: [['\\[', '\\]']]}, svg: {fontCache: 'global'}, startup: {typeset: false}}`. Tras pintar una vista: `MathJax.typesetPromise([contenedor])`.

## 3. Datos que genera `build.py`

- `INDICE.bloques` `{B1: "Fundamentos matemáticos", …}` · `INDICE.orden` (orden de estudio) · `INDICE.lotes`.
- `INDICE.conceptos[]`: `id, nombre, bloque, tipo (original|fusion|original+ampliacion|ampliacion), lote, prerequisitos[], desbloquea[], motor, escrita (bool), frase (html|null), fuentes[] {rol, repo, archivo, seccion, url}, ampliacion {que, prioridad, fuentes_externas}|null, conexiones[] {id, nota}, desambiguacion[] {id, nota}`.
- `INDICE.glosario`: `{termino_en_minusculas: [{termino, definicion (html), id}]}`.
- `FICHAS[id]`: `{id, estado (borrador|revisada), secciones: {"En una frase": html, "Intuición": html, …}, widget: {motor, params}|null, quiz: [{enunciado, opciones: [{html, correcta}], explicacion}], glosario: [...]}`. Las secciones ya vienen en HTML con las fórmulas en `\( \)` y `\[ \]`, los enlaces internos como `<a class="xref" href="#id">`, y los bloques `div.ampliacion` y `div.nota-fuente`.

## 4. Vistas (enrutado por hash, solo `#palabra`)

| Hash | Vista |
|---|---|
| `#inicio` (defecto) | Portada útil: progreso global (vistas / dominadas / escritas), "Continúa donde lo dejaste", rutas sugeridas, acceso al mapa y al repaso, y ajustes (tema, exportar/importar progreso). |
| `#mapa` | Mapa de conceptos: una columna por bloque (en móvil, lista por bloque). Dentro de cada columna, los nodos se ordenan por profundidad de requisitos. Color del nodo = estado (pendiente de escribir en gris con borde discontinuo, escrita, vista, dominada). Al pasar o enfocar un nodo se dibujan solo sus aristas (requisitos y lo que desbloquea). Filtros: bloque, estado y texto. |
| `#<id>` | Ficha (ver §5). Si la ficha aún no está escrita: nombre, requisitos, fuentes y el aviso "Pendiente (lote Lxx)". |
| `#glosario` | Términos A-Z con filtro; cada término enlaza a su ficha. Arriba, las tarjetas de desambiguación (mismo término con significados distintos). |
| `#rutas` | Rutas predefinidas y "Ruta hacia…": eliges un concepto y se lista su cadena completa de requisitos en orden topológico, con el estado de cada paso. |
| `#repaso` | Repaso espaciado (cajas de Leitner) con preguntas de las fichas vistas: sesiones de 10 preguntas. |

Cabecera fija con: nombre ("Atlas de IA"), buscador (tecla `/`; busca en nombres, frases y glosario), enlaces a Mapa, Rutas, Glosario y Repaso, y conmutador de tema.

Rutas predefinidas (calculadas, no escritas a mano): "De las matemáticas a las redes neuronales" (→ `backpropagation`), "ML clásico de punta a punta" (→ `boosting`), "Del texto a los LLM" (→ `rag`), "Aprendizaje por refuerzo" (→ `actor-critico`), "Del modelo a producción" (→ `monitorizacion-drift`).

## 5. Vista de ficha

1. Migas (bloque › concepto), nombre, distintivos: tipo (fusión / ampliación…), estado editorial (borrador / revisada) y mi progreso (vista / dominada).
2. **En una frase** destacada como entradilla.
3. Panel lateral (a la derecha en escritorio; plegable arriba en móvil): Requisitos (con ✓ si están dominados), Desbloquea, Conexiones, Desambiguación y "Ruta completa hasta aquí (N conceptos)".
4. Cuerpo: Intuición → Explicación → Formalización → **Interactivo** (panel propio, a todo el ancho del texto) → En código (con botón Copiar) → Errores típicos → **A fondo** (`<details>` cerrado) → **Autoevaluación** (interactiva: al responder muestra si acierta y la explicación; con ≥ 80 % de aciertos marca la ficha como dominada) → Glosario de la ficha → **Fuentes** (enlaces permanentes a GitHub, con el rol principal/fusionada, y las fuentes externas de la ampliación).
5. Selector de vista: **Completa** / **Esencial** (Esencial muestra solo En una frase, Intuición, los títulos `###` de Explicación, Errores típicos y Autoevaluación).
6. Pie: anterior / siguiente según `INDICE.orden` y "Siguiente recomendado" (primer concepto desbloqueado aún no dominado).
7. Estilos específicos: `div.ampliacion` con etiqueta visible "Ampliación · no está en el curso" y color propio; `div.nota-fuente` como nota al margen; `a.xref` con subrayado punteado y vista previa de la frase al pasar el ratón.
8. Al terminar de pintar (HTML + MathJax + motor), `document.body.dataset.listo = id`. Lo usa `tools/probar_web.py`.

## 6. Progreso

`localStorage['atlas-ia-v1']` con `{fichas: {id: {vista: fecha, dominada: bool, quiz: {aciertos, total}}}, leitner: {idPregunta: caja}, ultima: id}`. Toda lectura y escritura va en `try/catch`: sin almacenamiento, la web funciona igual sin recordar el progreso. En Ajustes: "Exportar progreso" (copia un JSON al portapapeles) e "Importar" (pegar el JSON).

## 7. Diseño

Paleta de bloques (coherente con el mapa de conceptos ya revisado por el usuario). Claro: B1 `#2F6E8C`, B2 `#6B5B95`, B3 `#3F7F4F`, B4 `#A0522D`, B5 `#8C6D1F`, B6 `#1F7A7A`, B7 `#7A3E5C`, B8 `#5B6770`. Oscuro: `#6FB0CF #AA9BD6 #7DC08D #E09A70 #D6B45E #5FC2C2 #D98DB2 #A2AEB8`. Fondo claro `#F4F6F3`, superficie `#FFFFFF`, texto `#17201D`, texto suave `#56645E`, líneas `#D9DFDA`, acento `#1D5B76`; en oscuro: `#111614`, `#18201D`, `#E4EBE7`, `#9AA8A2`, `#2C3733`, `#86C0D8`. Ampliación: violeta (`#5638A0` sobre `#EBE5F8`; oscuro `#B9A5F0` sobre `#2B2345`). Bien/mal: verde y rojo accesibles, siempre acompañados de icono o texto.

## 8. Motores

Contrato (lo implementa `motores/nucleo.js`):

```js
// @modos: tangente, familias          ← primera línea obligatoria; build.py la lee
Motores.registrar('funcion', function (el, p, api) {
  // el: <div> vacío; p: parámetros del bloque widget (ya validados por build.py); api: utilidades comunes
  // Devuelve opcionalmente {redibujar(), destruir()}
}, {
  ejemplos: {tangente: {modo: 'tangente', funciones: [...], ...}, familias: {...}}  // uno por modo, para demo.html
});
```

`demo.html#<motor>` pinta todos los ejemplos de ese motor (sin hash: índice de motores) y marca `document.body.dataset.listo = '<motor>'` al terminar. Cada ejemplo debe ser válido según `widgets.json`. `python tools/probar_web.py --demo` lo comprueba.

Requisitos de todo motor:
- SVG (o Canvas si hay más de 500 elementos), sin librerías. Se adapta al ancho con `ResizeObserver` y funciona desde 320 px.
- Controles con `<input type="range">` o botones reales, con etiqueta visible y accesibles por teclado. Arrastre con Pointer Events (ratón y táctil).
- Colores siempre desde `api.colores()`; se redibuja con el evento `tema`.
- Números en formato es-ES (coma decimal) con `api.num`. Aleatoriedad solo con `api.aleatorio(semilla)`, para que el estado inicial sea reproducible.
- Estado inicial ya significativo (sin pulsar nada ya se ve la idea). Botón "Reiniciar" si el motor tiene estado.
- Si falla, el núcleo captura la excepción, muestra "El interactivo no se pudo cargar" en el recuadro y `console.error('[motor <nombre>]', error)`.
- Menos de ~600 líneas por motor. Si un modo nuevo lo haría crecer demasiado, pregunta al usuario.

API mínima que ofrece el núcleo: `api.colores()`, `api.num(x, dec)`, `api.aleatorio(semilla)`, `api.slider({etiqueta, min, max, paso, valor, alCambiar})`, `api.boton(texto, fn)`, `api.fila(...elementos)`, `api.tex(el)`, `api.expr(texto, variables)` (compila de forma segura una expresión matemática: `+ - * / ^`, `sin cos tan exp log sqrt abs min max`, `pi`, `e`; nada de `eval` sin filtrar) y `api.svg(ancho, alto)`.

### §API real

(Lo rellena la Fase 1A con las firmas exactas implementadas, en ≤ 30 líneas.)

### Reparto de motores por sesión

`pasos` y `funcion` (todos sus modos) se hacen en la Fase 1A; `umbral` (todos sus modos) y la base de `dispersion2d` con el modo `kmeans`, en la 1B. El resto:

| Sesión | Motores y modos |
|---|---|
| M1 | `vectores2d` (todos) · `transformacion2d` (todos) |
| M2 | `probabilidad` (todos) · `datos1d` (todos) |
| M3 | `simulacion` (todos) · `descenso` (todos) |
| M4 | `red` (todos) · `convolucion` |
| M5 | `grafo` (todos) · `linea-tiempo` · `matriz-calor` (todos) |
| M6 | `rejilla` (todos) |
| M7 | `serie` (todos) · `texto` (todos) |
| M8 | `dispersion2d`: correlacion, polinomio, ridge-lasso, metricas-regresion, escalado, pca, ols, logistica |
| M9 | `dispersion2d`: knn, svm, arbol, bosque, boosting, comparar-clustering, jerarquico, dbscan, gmm, silueta |

## 9. Publicación

GitHub Pages: Settings → Pages → Build and deployment → Deploy from a branch → `main` / `docs`. Cada `git push` actualiza la web.

## 10. Fases de web: qué entregar

**Fase 1A.** Lee este archivo entero. Construye `index.html`, `estilos.css`, `app.js`, `motores/nucleo.js` y `demo.html` con todas las vistas de §4 y §5 (funcionando aunque haya pocas fichas). Implementa los motores `pasos` y `funcion` (todos sus modos, con un ejemplo por modo). Escribe la ficha piloto `derivada` usando solo `python tools/extraer.py --id derivada` (`PLANTILLA-FICHA.md` es el formato; no copies su texto). Pasa `python tools/build.py --id derivada --ejecutar`, `python tools/probar_web.py --id derivada --movil` y `python tools/probar_web.py --demo`, mira las capturas y corrige lo que se vea mal. Rellena §API real. Commit.

**Fase 1B.** Implementa `umbral` (todos sus modos) y `dispersion2d` con su infraestructura común (generadores de datos con semilla, ejes, puntos arrastrables, controles, paso a paso) y el modo `kmeans`. Escribe las fichas piloto `metricas-clasificacion` y `kmeans` con el extractor. Mismas pruebas que en 1A. Commit.

**Sesiones M1-M9.** Implementa los motores de su fila (tabla de §8) con un ejemplo por modo. Solo pruebas `--demo` (en escritorio y `--movil`) y revisión de capturas. No escribas fichas. Commit.

**Fase final.** `python tools/build.py --estricto` y `python tools/probar_web.py --todas --movil` hasta 0 fallos. Revisa rutas, repaso, glosario y buscador con todas las fichas cargadas, y el rendimiento (carga por bloque). Comprueba que `docs/` funciona abriéndolo con `file://`. Commit y push.

Mensaje final de cualquier fase de web: qué se ha hecho, qué queda pendiente y 3 cosas concretas que el usuario debe mirar en el navegador.
