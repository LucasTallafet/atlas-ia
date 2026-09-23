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
  mapa.js             window.AtlasMapa: constelación (#mapa) y diagrama de red de las rutas (#rutas)
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
| `#mapa` | Selector "Constelación \| Por bloques" (la elección se guarda en `localStorage['atlas-ia-mapa']`; sin elección, por debajo de 700 px se abre "Por bloques"). **Constelación** (por defecto, `docs/mapa.js`, `AtlasMapa.constelacion`): grafo de fuerzas SVG sin librerías (repulsión, muelles en las aristas de requisito —fuertes dentro del bloque, casi nulos entre bloques— y un ancla por bloque en una elipse, B1 → B8 en sentido horario, con arco ∝ √n.º de conceptos). Semilla fija y 300 iteraciones antes de pintar; se calcula una vez por carga y nada se mueve después. Nodo = círculo del color del bloque, radio según los conceptos que desbloquea; estados: pendiente (contorno punteado, apagado), escrita (relleno suave), vista (relleno pleno), dominada (pleno + halo; brillo en tema oscuro). Etiquetas: solo ~18 nodos grandes sin choques, todas al acercar (px por unidad ≥ 1,5) y las de la cadena resaltada. Hover/foco: tarjeta con nombre y "En una frase", se resalta toda la cadena de requisitos (línea continua) y lo que desbloquea directamente (discontinua); el resto se atenúa. Nombres de bloque flotando fuera de cada cúmulo. Rueda/pellizco = zoom, arrastre = desplazar, botón "Centrar", buscador con zoom suave hasta el concepto (sin animación con `prefers-reduced-motion`). Clic o Enter abre la ficha; Tab recorre los nodos en el orden de `INDICE.orden`. Fondo con degradado y rejilla de puntos (tokens `--cielo-*`). Si `progreso.ultimaRuta` existe, se resalta esa ruta con un botón "Quitar resaltado" (que la borra). **Por bloques**: la vista antigua, una columna por bloque (en móvil, lista), nodos por profundidad, aristas al pasar, filtros de bloque, estado y texto. |
| `#<id>` | Ficha (ver §5). Si la ficha aún no está escrita: nombre, requisitos, fuentes y el aviso "Pendiente (lote Lxx)". |
| `#glosario` | Arriba, las tarjetas de desambiguación. Debajo, filtro de texto, filtro por bloque, contador "N términos · crece con cada lote" y barra de letras A-Z (botones que saltan a cada letra; las vacías, desactivadas). Entradas mezcladas en orden alfabético: los términos del glosario de las fichas (con "— ficha") y **cada uno de los 138 conceptos** (distintivo "concepto" del color del bloque; con su "En una frase" si la ficha existe, o "Pendiente · lote Lxx" atenuado). |
| `#rutas` | Rutas predefinidas (en `<details>`, la primera abierta) y "Ruta hacia…". Cada ruta se dibuja con `AtlasMapa.redRuta` como **diagrama de red por capas** (columna = profundidad en la cadena de requisitos, de izquierda a derecha; en pantallas < 700 px, de arriba abajo, encogiendo hasta el 75 % antes de desplazarse). Orden dentro de cada capa por baricentro (3 pasadas). Nodos con color de bloque y estado; aristas Bézier del requisito al concepto (verdes si las dos puntas están dominadas); anillo "Siguiente" en el siguiente paso recomendado (primer nodo no dominado con todos sus requisitos dominados). Clic abre la ficha. Debajo: leyenda, botón "Ver en la constelación" (guarda `ultimaRuta: {destino, nombre}` en el progreso y abre `#mapa` en la constelación con la ruta resaltada) y la lista "Pasos en orden" con el estado de cada paso. |
| `#repaso` | Repaso espaciado (cajas de Leitner) con preguntas de las fichas vistas: sesiones de 10 preguntas. |

Cabecera fija con: nombre ("Atlas de IA"), buscador (tecla `/`; busca en nombres, frases y glosario), enlaces a Mapa, Rutas, Glosario y Repaso, y conmutador de tema.

Rutas predefinidas (calculadas, no escritas a mano): "De las matemáticas a las redes neuronales" (→ `backpropagation`), "ML clásico de punta a punta" (→ `boosting`), "Del texto a los LLM" (→ `rag`), "Aprendizaje por refuerzo" (→ `actor-critico`), "Del modelo a producción" (→ `monitorizacion-drift`).

## 5. Vista de ficha

1. Migas (bloque › concepto), nombre, distintivos: tipo (fusión / ampliación…), estado editorial (borrador / revisada) y mi progreso (vista / dominada).
2. **En una frase** destacada como entradilla.
3. Panel lateral (a la derecha en escritorio; plegable arriba en móvil): Requisitos (con ✓ si están dominados), Desbloquea, Conexiones, Desambiguación y "Ruta completa hasta aquí (N conceptos)".
4. Cuerpo: Intuición → Explicación → Formalización → **Interactivo** (panel propio, a todo el ancho del texto) → En código (con botón Copiar) → Errores típicos → **A fondo** (`<details>` cerrado) → **Autoevaluación** (interactiva: al responder muestra si acierta y la explicación; con ≥ 80 % de aciertos marca la ficha como dominada) → Glosario de la ficha → **Fuentes** (enlaces permanentes a GitHub, con el rol principal/fusionada, y las fuentes externas de la ampliación).
5. Selector de vista: **Completa** / **Esencial**. Esencial es un resumen práctico que se entiende solo: En una frase → **En resumen** (la chuleta, destacada) → Interactivo → Errores típicos → Autoevaluación. No muestra títulos sueltos. En Completa, "En resumen" aparece como recuadro "Para llevar" después de Errores típicos.
6. Pie: anterior / siguiente según `INDICE.orden` y "Siguiente recomendado" (primer concepto desbloqueado aún no dominado).
7. Estilos específicos: `div.ampliacion` con etiqueta visible "Ampliación · no está en el curso" y color propio; `div.nota-fuente` como nota al margen; `a.xref` con subrayado punteado y vista previa de la frase al pasar el ratón.
8. Al terminar de pintar (HTML + MathJax + motor), `document.body.dataset.listo = id`. Lo usa `tools/probar_web.py`.

## 6. Progreso

`localStorage['atlas-ia-v1']` con `{fichas: {id: {vista: fecha, dominada: bool, quiz: {aciertos, total}}}, leitner: {idPregunta: caja}, ultima: id, ultimaRuta: {destino, nombre}|null}`. Toda lectura y escritura va en `try/catch`: sin almacenamiento, la web funciona igual sin recordar el progreso. En Ajustes: "Exportar progreso" (copia un JSON al portapapeles) e "Importar" (pegar el JSON).

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

- `Motores.registrar(nombre, fn(el, p, api) → {redibujar?, destruir?}, {ejemplos: {modo|'-': params}})`.
- `Motores.cargar(nombre) → Promise` inyecta `motores/<nombre>.js` (ruta relativa a `nucleo.js`). `Motores.montar(el, nombre, params) → Promise<inst|null>`: carga, ejecuta, captura errores ("El interactivo no se pudo cargar" + `console.error('[motor x]')`) y llama a `redibujar()` al cambiar el ancho (ResizeObserver) y con el evento `tema` de `document`. `Motores.desmontar(el)` libera los motores dentro de `el`.
- `api.colores()` → `{fondo, superficie, texto, suave, linea, rejilla, acento, bien, mal, series: [8 colores], oscuro}` leídos de los tokens CSS.
- `api.num(x, dec = 2)` → texto es-ES (coma decimal, signo `−`, `∞`, `—` si NaN; los valores que redondean a 0 salen como `0`).
- `api.aleatorio(semilla)` → `r()` en [0, 1) (mulberry32), con `r.normal(mu, sigma)` y `r.entero(min, max)`.
- `api.expr(texto, variables = ['x'])` → `f({x, a, …})`. Operadores `+ - * / ^` (`**` = `^`), multiplicación implícita (`2x`), constantes `pi e`, funciones `sin cos tan asin acos atan sinh cosh tanh exp log ln log2 log10 sqrt abs sign floor ceil round min max pow fact comb erf`. Sin `eval`; lanza error ante identificadores desconocidos.
- `api.slider({etiqueta, min, max, paso, valor, alCambiar, decimales?, formato?})` → `div.slider` con `.valor` (get/set) e `.input`.
- `api.boton(texto, fn, attrs?)`, `api.fila(...els)`, `api.html(tag, attrs, ...hijos)` (attrs: `class`, `text`, `html`, `onX`), `api.el(tag, attrs, padre?)` (SVG), `api.svg(ancho, alto)` (viewBox + ancho fluido), `api.escala(d0, d1, r0, r1)` (con `.inversa`), `api.marcas(min, max, n)`, `api.tex(el) → Promise` (espera a MathJax).
- Contenedor en la ficha: `div.widget` dentro de `div.panel-interactivo`. La app emite `tema` en `document` y pone `data-tema-efectivo` en `<html>`.
- `funcion`: `x` por defecto `[-5, 5]`; `y` automático (percentiles 1-99 de las curvas). Cada modo añade sus propios controles: tangente (x₀ y h), pdf-cdf (t, histograma de 400 muestras con semilla), discreta (k; evalúa `funciones[0]` en enteros y dibuja las demás como curvas), activaciones (selector + derivada numérica + x), pertenencia (valor de entrada), series (cursor, mínimos marcados), perdidas (`datos.series[0].valores` = residuos; el de mayor |valor| es el atípico arrastrable), barras (horizontales; conmutador lineal/log si todo es > 0). `sombrear`: densidad sombrea `[desde, hasta]`; region sombrea las colas fuera de `[desde, hasta]` (si falta uno de los dos, una sola cola). Las expresiones de `sombrear` usan los `parametros`.
- Arrastre: los motores enganchan `pointerdown/pointermove` al **contenedor persistente** (no al SVG, que se sustituye en cada redibujado y perdería la captura del puntero).
- `umbral`: puntuaciones normales recortadas a (0, 1) con semilla fija (positivos 101, negativos 202, +17 por grupo). Umbral con paso 0,02 = anchura de las barras; se predice positivo si puntuación ≥ t. Histograma espejo (positivos arriba, negativos abajo) con TP/FN/FP/TN, matriz de confusión, barras de `metricas` (por defecto las seis), curva ROC o PR (botón) con AUC. desbalanceo: deslizador de proporción de positivos (total = positivos.n + negativos.n) y referencia "siempre negativo"; curva PR por defecto. grupos: un histograma por grupo, tabla TPR/FPR/precisión/tasa de predichos positivos, ROC por grupo y botón "Un umbral por grupo".
- `dispersion2d`: núcleo común `montarModo` + objeto por modo `{controles, iniciar, fondo, colorPunto, frente, paso, lectura, leyenda, botones, panel, alCambiarDatos, alCambiarControl, dominio}`. `ctx` ofrece `datos [{x, y, c}]`, `K` (valores de `controles`), `estado`, `X/Y` (escalas con la misma unidad en los dos ejes), `vista`, `c` (colores), `colorClase(k)`, `pt(x, y)`, `asa(elemento, clave, etiqueta, mover(x, y))` (arrastre + flechas del teclado), `celda(centros, j, vista)` (Voronoi), `cambio()`, `redibujar()`, `version` (sube al mover datos). Generadores (`Dispersion2d.generar`): blobs (centros en un círculo de radio 1, desviación = ruido), lunas, circulos (radios 1 y 0,5), lineal (y = 0,7x + 0,2 ± 0,45 por clase), xor, curva (sen 1,5x). `paso_a_paso` añade Paso / Hasta el final (respeta `prefers-reduced-motion`). **Modos nuevos en archivo aparte**: si el modo no está en `dispersion2d.js`, se carga `motores/dispersion2d-<modo>.js`, que llama a `Dispersion2d.modo('<modo>', {...})`; así el motor no pasa de ~600 líneas. El modo se añade igualmente a la línea `// @modos:` de `dispersion2d.js` y su ejemplo a `ejemplos`. kmeans: inicio aleatorio o k-means++, "Otro inicio al azar", centroides arrastrables, celdas de Voronoi, rastro de centroides y gráfica del codo (mejor J de 5 inicios k-means++ para k = 1…max del control).
- `pasos`: fotogramas `{html}` (de build.py) o `{texto}` (Markdown mínimo) con `tabla` y `cajas`/`activa` opcionales; teclas ← →.

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
