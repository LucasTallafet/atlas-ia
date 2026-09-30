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
| `#mapa` | Selector "Constelación \| Por bloques" (la elección se guarda en `localStorage['atlas-ia-mapa']`; sin elección, Constelación). **Por debajo de 1024 px** no hay selector ni Constelación (ni se calcula): "Por bloques" como acordeón vertical (§7b). **Constelación** (por defecto, `docs/mapa.js`, `AtlasMapa.constelacion`): grafo de fuerzas SVG sin librerías (repulsión, muelles en las aristas de requisito —fuertes dentro del bloque, casi nulos entre bloques— y un ancla por bloque en una elipse, B1 → B8 en sentido horario, con arco ∝ √n.º de conceptos). Semilla fija y 300 iteraciones antes de pintar; se calcula una vez por carga y nada se mueve después. Nodo = círculo del color del bloque, radio según los conceptos que desbloquea; estados: pendiente (contorno punteado, apagado), escrita (relleno suave), vista (relleno pleno), dominada (pleno + halo; brillo en tema oscuro). Etiquetas: solo ~18 nodos grandes sin choques, todas al acercar (px por unidad ≥ 1,5) y las de la cadena resaltada. Hover/foco: tarjeta con nombre y "En una frase"; sin selección, además previsualiza las relaciones del nodo. Nombres de bloque flotando fuera de cada cúmulo. Rueda/pellizco = zoom, arrastre = desplazar, botones "Centrar" y "Encuadrar selección" (zoom a los bloques filtrados), buscador que selecciona el concepto y hace zoom suave hasta él (sin animación con `prefers-reduced-motion`). Tab recorre los nodos en el orden de `INDICE.orden`. Fondo con degradado y rejilla de puntos (tokens `--cielo-*`). Si `progreso.ultimaRuta` existe, se resalta esa ruta con un botón "Quitar resaltado" (que la borra). **Por bloques**: una columna por bloque (en móvil, lista), nodos por profundidad, filtros de estado y texto; las relaciones se dibujan con curvas SVG sobre las columnas (en móvil solo se marcan los nodos). **Común a las dos vistas:** (1) *Filtro por bloques*: chips "Todos" + uno por bloque (color y nombre corto); clic = solo ese bloque, Mayús/Ctrl+clic = añadir o quitar; se guarda en `progreso.filtroBloques` (`null` = todos). En la constelación los bloques ocultos quedan como puntos a opacidad 0,08, sin etiquetas ni interacción; en "Por bloques" se ocultan sus columnas. Seleccionar desde el panel o el buscador un concepto de un bloque oculto añade ese bloque al filtro. (2) *Selección*: un clic selecciona el nodo (no abre la ficha) y resalta sus requisitos (toda la cadena de ancestros, naranja, más intensos cuanto más cerca), lo que desbloquea (verde; directos plenos, indirectos más tenues) y sus conexiones y desambiguaciones en los dos sentidos (trazo azul discontinuo); el resto se atenúa. Leyenda con los tres estilos. Clic en el fondo o Esc suelta la selección. (3) *Panel de detalle* (a la derecha en escritorio, sticky; en móvil, hoja inferior con asa: un toque la pliega, deslizar hacia abajo la cierra): nombre, bloque, tipo, estado, "En una frase" o "Pendiente · lote Lxx", motor del interactivo y n.º de preguntas si la ficha existe, listas Requisitos / Desbloquea / Conexiones (clic = seleccionar y centrar ese nodo; las conexiones llevan su nota), "Ruta completa hasta aquí: N conceptos" con "Ver ruta" (conmutador que la resalta) y "Abrir ficha". Doble clic, o Enter sobre el nodo ya seleccionado, abre la ficha; Enter o espacio selecciona. |
| `#<id>` | Ficha (ver §5). Si la ficha aún no está escrita: nombre, requisitos, fuentes y el aviso "Pendiente (lote Lxx)". |
| `#glosario` | Arriba, las tarjetas de desambiguación. Debajo, filtro de texto, filtro por bloque, contador "N términos · crece con cada lote" y barra de letras A-Z (botones que saltan a cada letra; las vacías, desactivadas). Entradas mezcladas en orden alfabético: los términos del glosario de las fichas (con "— ficha") y **cada uno de los 138 conceptos** (distintivo "concepto" del color del bloque; con su "En una frase" si la ficha existe, o "Pendiente · lote Lxx" atenuado). |
| `#rutas` | Rutas predefinidas (en `<details>`, la primera abierta) y "Ruta hacia…". Cada ruta se dibuja con `AtlasMapa.redRuta` como **diagrama de red por capas** (columna = profundidad en la cadena de requisitos, de izquierda a derecha; en pantallas < 1024 px, de arriba abajo, a lo ancho exacto de la caja: como mucho ⌊ancho/88 px⌋ nodos por fila y las capas más anchas se apilan en varias filas; etiquetas de 12,5 px y zona táctil invisible de ≥ 48 px por nodo; tocar un nodo abre la hoja de detalle y el siguiente paso recomendado de la ruta activa queda como botón fijo al pie; sin "Ver en la constelación"). Orden dentro de cada capa por baricentro (3 pasadas). Nodos con color de bloque y estado; aristas Bézier del requisito al concepto (verdes si las dos puntas están dominadas); anillo "Siguiente" en el siguiente paso recomendado (primer nodo no dominado con todos sus requisitos dominados). Clic abre la ficha. Debajo: leyenda, botón "Ver en la constelación" (guarda `ultimaRuta: {destino, nombre}` en el progreso y abre `#mapa` en la constelación con la ruta resaltada) y la lista "Pasos en orden" con el estado de cada paso. |
| `#repaso` | Repaso espaciado (cajas de Leitner) con preguntas de las fichas vistas: sesiones de 10 preguntas. |

Cabecera fija con: nombre ("Atlas de IA"), buscador (tecla `/`; busca en nombres, frases y glosario), enlaces a Mapa, Rutas, Glosario y Repaso, y conmutador de tema. En < 1024 px la cabecera y la navegación cambian (barra inferior, búsqueda a pantalla completa, menú ⋮): ver §7b. `#glosario` y `#repaso` en móvil: también §7b.

Rutas predefinidas (calculadas, no escritas a mano): "De las matemáticas a las redes neuronales" (→ `backpropagation`), "ML clásico de punta a punta" (→ `boosting`), "Del texto a los LLM" (→ `rag`), "Aprendizaje por refuerzo" (→ `actor-critico`), "Del modelo a producción" (→ `monitorizacion-drift`).

## 5. Vista de ficha

1. Migas (bloque › concepto), nombre, distintivos: tipo (fusión / ampliación…), estado editorial (borrador / revisada) y mi progreso (vista / dominada).
2. **En una frase** destacada como entradilla.
3. Panel lateral (a la derecha en escritorio; plegable arriba en móvil): Requisitos (con ✓ si están dominados), Desbloquea, Conexiones, Desambiguación y "Ruta completa hasta aquí (N conceptos)".
4. Cuerpo: Intuición → Explicación → Formalización → **Interactivo** (panel propio, a todo el ancho del texto) → En código (con botón Copiar) → Errores típicos → **A fondo** (`<details>` cerrado) → **Autoevaluación** (interactiva: al responder muestra si acierta y la explicación; con ≥ 80 % de aciertos marca la ficha como dominada) → Glosario de la ficha → **Fuentes** (enlaces permanentes a GitHub, con el rol principal/fusionada, y las fuentes externas de la ampliación).
5. Selector de vista: **Completa** / **Esencial**. Esencial es un resumen práctico que se entiende solo: En una frase → **En resumen** (la chuleta, destacada) → Interactivo → Errores típicos → Autoevaluación. No muestra títulos sueltos. En Completa, "En resumen" aparece como recuadro "Para llevar" después de Errores típicos.
6. Pie: anterior / siguiente según `INDICE.orden` y "Siguiente recomendado" (primer concepto desbloqueado aún no dominado).
7. Estilos específicos: `div.ampliacion` con etiqueta visible "Ampliación · no está en el curso" y color propio; `div.nota-fuente` como nota al margen; `a.xref` con subrayado punteado y vista previa de la frase al pasar el ratón.
7b. **Ficha en móvil (< 1024 px).** *Cabecera*: pastilla con el bloque (color), título y el selector Completa / Esencial como control segmentado de 52 px. Al desplazar, cuando ese selector sale de la pantalla, aparece la **barra fija** `.ficha-barra` (título abreviado a 2 líneas, botón "Vista: Completa/Esencial" que alterna y botón "Secciones") y sustituye a la cabecera general (`body.barra-ficha`). *Secciones*: el botón abre una `hojaInferior` con las secciones presentes en la vista actual (la actual marcada; al tocar, scroll suave con `scroll-margin-top` de la barra y, en A fondo, se despliega); bajo la entradilla hay además una fila de `chips` con las mismas secciones (si hay ≥ 3). *Barra lateral*: se oculta y pasa al botón **Relaciones** (hoja inferior con requisitos —los no vistos, con la etiqueta "sin ver"—, desbloquea, conexiones, no confundir y ruta); el botón indica cuántos requisitos faltan por ver. "Para llevar" queda en la ficha, antes de A fondo, como caja destacada. *Anchos*: fórmulas en bloque, código y tablas (`.tabla-scroll`, envuelta por JS) se desplazan dentro de su caja con degradado lateral de "hay más" (CSS `background-attachment: local`); las fórmulas en línea más anchas que la columna reciben `.mjx-ancha` (caja con scroll); la fórmula nunca se reduce. Código a 14 px con "Copiar" de 48 px a todo el ancho bajo el bloque. `summary` ≥ 48 px con indicador + / −. *Autoevaluación*: opciones de ≥ 56 px; tocar solo selecciona; "Comprobar" (al pie de la pregunta) revela acierto y explicación debajo, y pasa a "Siguiente →". *Pie*: "← Anterior / Siguiente →" en dos botones de 64 px —por la ruta activa (`prog.ultimaRuta`, que en móvil fija la vista Rutas al activar una ruta) si incluye la ficha, y si no por `INDICE.orden`—, "Marcar como vista" (alterna la marca; abrir una ficha ya la marca) y "Siguiente recomendado". `.widget` ocupa todo el ancho útil (mín. 12 rem de alto) y sus botones, selects y sliders miden ≥ 44 px; los enlaces `a.xref` tienen 12 px de zona táctil extra arriba y abajo.
8. Al terminar de pintar (HTML + MathJax + motor), `document.body.dataset.listo = id`. Lo usa `tools/probar_web.py`.

## 6. Progreso

`localStorage['atlas-ia-v1']` con `{fichas: {id: {vista: fecha, dominada: bool, quiz: {aciertos, total}}}, leitner: {idPregunta: caja}, ultima: id, ultimaRuta: {destino, nombre}|null, filtroBloques: [bloque…]|null}`. Toda lectura y escritura va en `try/catch`: sin almacenamiento, la web funciona igual sin recordar el progreso. En Ajustes: "Exportar progreso" (copia un JSON al portapapeles) e "Importar" (pegar el JSON).

## 7. Diseño

Paleta de bloques (coherente con el mapa de conceptos ya revisado por el usuario). Claro: B1 `#2F6E8C`, B2 `#6B5B95`, B3 `#3B7A4B`, B4 `#A0522D`, B5 `#86681D`, B6 `#1F7A7A`, B7 `#7A3E5C`, B8 `#5B6770`. Oscuro: `#6FB0CF #AA9BD6 #7DC08D #E09A70 #D6B45E #5FC2C2 #D98DB2 #A2AEB8`. Fondo claro `#F4F6F3`, superficie `#FFFFFF`, texto `#17201D`, texto suave `#56645E`, líneas `#D9DFDA`, acento `#1D5B76`; en oscuro: `#111614`, `#18201D`, `#E4EBE7`, `#9AA8A2`, `#2C3733`, `#86C0D8`. Ampliación: violeta (`#5638A0` sobre `#EBE5F8`; oscuro `#B9A5F0` sobre `#2B2345`). Bien/mal: verde y rojo accesibles, siempre acompañados de icono o texto.

## 7b. Móvil

Reglas comunes en `AJUSTES-MOVIL-COMUN.md`. El escritorio (≥ 1024 px) no cambia.

- **Puntos de corte:** < 600 px móvil, 600–1023 px tablet, ≥ 1024 px escritorio. En CSS, `@media (max-width: 1023.98px)` activa todo lo móvil/tablet y `(max-width: 599.98px)` los ajustes de una columna; `(pointer: coarse)` sube los controles a 44 px en pantallas anchas táctiles. En JS, `UI.esMovil()` (mismo corte, `UI.mqMovil`); al cruzarlo la vista se vuelve a pintar.
- **Tokens** (`:root` de `estilos.css`): `--esp-1…6` (4, 8, 12, 16, 24, 32 px), `--radio`, `--radio-s`, `--radio-l`, `--sombra`, `--sombra-alta`, `--tactil: 48px`, `--alto-cab: 56px`, `--alto-barra: 64px` y escala fluida `--texto-base` (16 px a 412 px → 17 px desde 1024 px), `--texto-h1`, `--texto-h2` con `clamp()`. En < 1024 px los títulos llevan `overflow-wrap: anywhere; hyphens: auto` (`lang="es"`). Margen lateral 16 px + `env(safe-area-inset-*)` (`viewport-fit=cover`). Colores de texto en AA (≥ 4,5:1) en claro y oscuro (B3 claro `#3B7A4B`, B5 y nota claro `#86681D`).
- **Cabecera** (< 1024 px): ≤ 56 px con "Atlas IA", botón Buscar (abre la búsqueda a pantalla completa: campo con autofoco a 16 px, resultados de ≥ 56 px) y menú ⋮ (hoja con Tema, Exportar/Importar progreso, Instalar app si el navegador ofrece `beforeinstallprompt`, Acerca de). Se oculta al bajar (`body.cab-oculta`) y reaparece al subir. Enlace "Saltar al contenido" fuera de pantalla hasta recibir el foco.
- **Barra inferior** (`nav.barra-inferior`, < 1024 px): Inicio · Mapa · Rutas · Glosario · Repaso, icono SVG + texto de 12 px, 64 px + `env(safe-area-inset-bottom)`. Destino activo con píldora de color y `aria-current="page"`; en una ficha, activo el destino de origen (`aria-current="true"`; Mapa si se entró directo). `body` reserva su altura; los botones fijos (`.boton-fijo`) y los avisos se colocan encima.
- **Componentes** (`docs/ui.js`, `window.UI`): `hojaInferior(contenido, {titulo, completa, foco, alCerrar})` → `{el, cuerpo, poner, cerrar}`: sube desde abajo (85 vh máx., scroll interno; `completa` = pantalla completa), asa y cabecera que se cierran deslizando hacia abajo, fondo que cierra al tocar, ×, Esc y Atrás; atrapa el foco y lo devuelve al cerrar; solo hay una (abrir otra cambia el contenido). `chips(opciones, {multiple, valor, etiqueta, alCambiar})`: fila desplazable en horizontal, chips de 44 px con zona táctil de 48. `aviso(texto, {accion, alAccion})`: snackbar sobre la barra inferior. Las órdenes siguientes los reutilizan.
- **Historial:** cada vista o ficha es un hash. Cada entrada lleva `history.state.k`; la posición de scroll se guarda por `k` y se restaura al volver (`history.scrollRestoration = 'manual'`). Una hoja inferior añade una entrada con `pushState({…, hoja})` sin cambiar el hash: Atrás (popstate) la cierra; cerrarla desde la interfaz hace `history.back()`. Los enlaces internos dentro de una hoja primero la cierran (sin dejar su entrada) y después navegan. Nada se añade en la primera carga, así que Atrás en `#inicio` recién abierto sale de la PWA.
- **Vistas en < 1024 px.** *Inicio*: una columna, buscador como botón grande, "Continúa donde lo dejaste" arriba y las cifras después. *Mapa*: chips de bloques, filtros de nombre y estado, y un acordeón (una sección por bloque con su color, contador vistas/total y los conceptos como filas de 48 px ordenadas por profundidad; se recuerdan las secciones abiertas). Tocar una fila la selecciona: barra fija con el nombre, "Detalle", "Quitar" y la leyenda; bordes naranja (requisitos), verde (desbloquea) y azul discontinuo (conexiones), y "N relacionados" en las secciones plegadas; y abre la hoja de detalle (el mismo contenido que el panel de escritorio, `detalleConcepto`). *Rutas*: ver §4. *Glosario*: buscador, filtro de bloque y contador fijos arriba; "No confundir" plegado; cada término es una fila `<details>` (≥ 48 px) cuya definición se pinta al abrirla; índice A–Z como columna fina a la derecha (tocar o deslizar el dedo, con burbuja de la letra) o, con alto < 560 px, como fila de chips. *Repaso*: la tarjeta de la pregunta ocupa casi toda la pantalla con las opciones (≥ 56 px) abajo y "Siguiente" a todo el ancho.

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
- Arrastre: con `api.arrastrable` (§8b), cuya `zona` es el **contenedor persistente** (no el SVG, que se sustituye en cada redibujado y perdería la captura del puntero). Los motores aún no migrados (órdenes 4–6) enganchan `pointerdown/pointermove` a ese contenedor por su cuenta.
- `umbral`: puntuaciones normales recortadas a (0, 1) con semilla fija (positivos 101, negativos 202, +17 por grupo). Umbral con paso 0,02 = anchura de las barras; se predice positivo si puntuación ≥ t. Histograma espejo (positivos arriba, negativos abajo) con TP/FN/FP/TN, matriz de confusión, barras de `metricas` (por defecto las seis), curva ROC o PR (botón) con AUC. desbalanceo: deslizador de proporción de positivos (total = positivos.n + negativos.n) y referencia "siempre negativo"; curva PR por defecto. grupos: un histograma por grupo, tabla TPR/FPR/precisión/tasa de predichos positivos, ROC por grupo y botón "Un umbral por grupo".
- `dispersion2d`: núcleo común `montarModo` + objeto por modo `{controles, iniciar, fondo, colorPunto, frente, paso, lectura, leyenda, botones, panel, alCambiarDatos, alCambiarControl, dominio}`. `ctx` ofrece `datos [{x, y, c}]`, `K` (valores de `controles`), `estado`, `X/Y` (escalas con la misma unidad en los dos ejes), `vista`, `c` (colores), `colorClase(k)`, `pt(x, y)`, `asa(elemento, clave, etiqueta, mover(x, y))` (arrastre + flechas del teclado), `celda(centros, j, vista)` (Voronoi), `cambio()`, `redibujar()`, `version` (sube al mover datos). Generadores (`Dispersion2d.generar`): blobs (centros en un círculo de radio 1, desviación = ruido), lunas, circulos (radios 1 y 0,5), lineal (y = 0,7x + 0,2 ± 0,45 por clase), xor, curva (sen 1,5x). `paso_a_paso` añade Paso / Hasta el final (respeta `prefers-reduced-motion`). **Modos nuevos en archivo aparte**: si el modo no está en `dispersion2d.js`, se carga `motores/dispersion2d-<modo>.js`, que llama a `Dispersion2d.modo('<modo>', {...})`; así el motor no pasa de ~600 líneas. El modo se añade igualmente a la línea `// @modos:` de `dispersion2d.js` y su ejemplo a `ejemplos`. kmeans: inicio aleatorio o k-means++, "Otro inicio al azar", centroides arrastrables, celdas de Voronoi, rastro de centroides y gráfica del codo (mejor J de 5 inicios k-means++ para k = 1…max del control).
- `pasos`: fotogramas `{html}` (de build.py) o `{texto}` (Markdown mínimo) con `tabla` y `cajas`/`activa` opcionales; teclas ← →. Barra de pasos del núcleo (`api.barraPasos`), fija al pie en táctil.

### §8b Contrato táctil

Todo lo táctil se resuelve en `nucleo.js` (+ bloque "Contrato táctil" de `estilos.css`). `funcion` y `pasos` son los motores de referencia. Lo que el núcleo hace solo, sin tocar el motor: botón **Ampliar**, atributo `data-disposicion`, deslizadores y botones a tamaño táctil, pausa fuera de pantalla.

**Ayudantes (`api.…`)**

- `arrastrable(elemento, {zona, clave, radio, tactil, etiqueta, valor, alEmpezar, alMover, alSoltar, alTecla})`: arrastre con Pointer Events para ratón, dedo y lápiz. Un único `pointerdown` por `zona` elige el asa más cercana cuyo contorno esté a ≤ `radio` px (mínimo y por defecto 24; `Infinity` = toda la zona). Los movimientos se agrupan por `requestAnimationFrame`. `alMover(p)` recibe `p = {x, y, dx, dy, tipo}` en píxeles de ventana (`api.aSvg(svg, p)` lo pasa a unidades del `viewBox`); `alSoltar(p, cancelado)`. Marca el elemento con `data-arrastrable="<clave>"`, `tabindex="0"`, `role="slider"` y `aria-label="<etiqueta>: <valor()>"`; las flechas llaman a `alTecla(dx, dy)` (±1; ±10 con Mayús). Mientras se arrastra, el asa lleva `data-arrastrando` (crece un 35 %) y `valor()` se muestra en una burbuja 40 px por encima del dedo (24 con ratón). **`zona`** debe sobrevivir a los redibujados (por defecto, el `<svg>` del asa; si el motor sustituye el SVG al redibujar, pasa el contenedor). **`clave`** estable si el asa se recrea en cada redibujado: así la nueva hereda el arrastre en curso y el foco del teclado.
- `pellizcar(zona, {alEmpezar, alMover({escala, dx, dy, cx, cy}), alSoltar})`: gesto de dos dedos (zoom y desplazamiento) sobre una zona con `touch-action: none`; conviven con `arrastrable` (con dos dedos el motor debe ignorar el arrastre en curso). Solo táctil/lápiz.
- `inspeccionable(elemento, texto | () => texto)`: sustituye a `<title>` y a `mouseover`. Con ratón, la etiqueta sale al pasar; con el dedo, al tocar, y queda fija hasta tocar en otro sitio o de nuevo en el mismo. Pone también `aria-label`.
- `slider({…, fino?})`: etiqueta y valor encima (coma decimal). En táctil: pista de 8 px con tramo relleno, pulgar de 28 px, zona de 48 px y botones **− / +** de 44 px a los lados si el deslizador tiene más de 40 pasos (`fino: true/false` lo fuerza). En escritorio con ratón no cambia.
- `segmentado(opciones [{valor, texto}], {valor, titulo, etiqueta, alCambiar})` → selector de modo/opción (`.poner(v)`, `.valor`): botones en escritorio, chips de 44 px en táctil.
- `barraPasos({alAnterior, alSiguiente, alReiniciar, alReproducir?})` → barra de herramientas con `.poner(i, n, reproduciendo)`; botones de 48 px en táctil y, en estrecho, contador corto ("2 / 5") y Reiniciar solo con icono.
- `zonas(el, {pieFijo})` → `{grafico, controles}`: gráfico arriba y controles debajo. Ampliado: controles abajo en vertical y a la derecha en horizontal. Con `pieFijo`, la zona de controles queda pegada al pie de la pantalla mientras se ve el widget (barra de pasos).
- `medida(contenedor, {proporcion, proporcionEstrecha, minAncho, maxAncho, minAlto, maxAlto})` → `{ancho, alto, estrecho, ampliado}` a partir del ancho **del contenedor**: por debajo de 560 px, 4:3; nunca más del 70 % del alto de la pantalla; ampliado, usa el alto disponible.
- `fuente(svg, px)` → tamaño de letra en unidades del `viewBox` que compensa su escala y, en táctil o en estrecho, garantiza 12 px reales (el SVG debe estar ya insertado). Para las marcas de los ejes, `marcas(min, max, n)` con `n` proporcional a los píxeles disponibles (≈ 1 marca cada 70 px).
- `lienzoNitido(canvas, ancho, alto)` → contexto 2D escalado a `devicePixelRatio` (máx. 2).
- `bucle(el, paso(dt))` → `{iniciar, parar, activo}`: animación con `requestAnimationFrame` que se detiene cuando `paso` devuelve `false` y se pausa sola mientras el widget está fuera de pantalla. Además, si la instancia devuelve `pausar()`/`reanudar()`, el núcleo los llama al salir/entrar en pantalla. `enPantalla(el)`, `estrecho(el)`, `gruesa()` (puntero táctil) y `reducido()` (menos movimiento) para consultar.
- Núcleo, sin API: `el.dataset.disposicion = 'apilada' | 'ancha'` según el ancho del widget (< 560 px, con `ResizeObserver`; también redibuja al girar). Botón **Ampliar** en `.motor-cab`: panel fijo a pantalla completa (más Fullscreen API si el navegador la concede), con entrada propia en el historial (Atrás, Esc o ✕ cierran); el DOM del motor no se toca, así que conserva su estado. `Motores.ampliar(el)` / `Motores.cerrarAmpliado()`. `Motores.montar(el, motor, params, {perezoso: true})` retrasa la creación hasta que el contenedor se acerca a la pantalla (la app no lo usa todavía: ver `DECISIONES.md`).
- `demo.html#<motor>.<modo>` pinta solo ese ejemplo y `#<motor>.<modo>.ampliado` lo abre ampliado, para capturarlo con `probar_web.py --demo <motor>.<modo>.ampliado [--android]`.

**Reglas de `touch-action`** (Chrome lo ignora en las formas SVG; solo cuenta en elementos HTML y en el `<svg>` raíz; `arrastrable` lo pone en la zona y en el `<svg>` del asa):

- Casi todo se arrastra en 2D (plano con vectores, grafo, puntos): `tactil: 'none'` (por defecto). La página se desplaza tocando fuera del gráfico: deja margen lateral y no pases del 70 % del alto (`medida` ya lo limita).
- Un cursor o algún punto suelto que se mueve en horizontal: `tactil: 'pan-y'`. El scroll vertical sigue vivo sobre el gráfico; el arrastre con el dedo empieza cuando el gesto es claramente horizontal (> 8 px) y un toque sin arrastre lleva el asa ahí. El valor se mueve también con su deslizador y sus − / +.
- Nunca `preventDefault` en `touchmove` a nivel de documento.

| Motor | `touch-action` | Qué se arrastra |
|---|---|---|
| `funcion` | `pan-y` | Tirador sobre el eje x en tangente, pdf-cdf, discreta, activaciones, pertenencia, series y perdidas (residuo atípico); `radio: Infinity` (toda la gráfica). familias, rectas, densidad, region y barras no arrastran nada. |
| `vectores2d` | `none` | Puntas de vectores/puntos (radio de captura 44 px); coordenadas también con deslizadores − / + en «Coordenadas». |
| `transformacion2d` | `none` | Columnas 1 y 2 de la matriz (radio 44 px); los cuatro valores también con − / + en «Valores de la matriz». |
| `dispersion2d` | `none` | Puntos (radio 30 px) y centroides/consulta (44 px). Solo táctil y con `arrastrables` o modo `kmeans` (`anadir_puntos: false` lo desactiva): tocar un hueco añade un punto (clase del más cercano), mantener 600 ms un punto lo quita (mín. 3), con aviso la primera vez. Reproducción con `bucle`. |
| `descenso` | `none` | Todo el mapa (`radio: Infinity`): tocar o arrastrar coloca el punto (gradiente) o el punto de partida (lr, optimizadores, que reinician el recorrido). Barra de pasos fija con Anterior/Reproducir/Siguiente/Reiniciar. |
| `umbral` | `pan-y` | Umbral en horizontal; el asa cubre todo el gráfico (una por banda con «un umbral por grupo»). Paneles apilados con `data-disposicion="apilada"`. |
| `datos1d` | `pan-y` | Puntos de la recta (radio de captura 30 px, clave `p<i>`; flechas del teclado ±1/60 del rango). Barras, caja, atípicos y marcadores se tocan (`inspeccionable`). |
| `serie` | `pan-y` | ventana: el punto objetivo `t` (toda la gráfica, `radio: Infinity`); drift: la banda de producción. Ambos con botones ‹ › y deslizador equivalentes. |
| `linea-tiempo` | `pan-y` | La propia línea: arrastrar desplaza el scroll horizontal (asa = punto del hito activo, `radio: Infinity`); un toque sin arrastre elige el hito más cercano. Botones ‹ › y Anterior/Siguiente, y tarjetas tocables por hito. En táctil, margen de medio ancho a cada lado; los periodos van en la leyenda y solo el hito activo lleva año encima. |
| `probabilidad` | — | Nada que arrastrar (deslizadores). Modo tabla: recuentos editables (`inputmode="decimal"`, se confirman al salir del campo o con Enter); modo test: tocar un punto de la rejilla dice quién es. Etiquetas de barra encima de cada barra (sin recortes). |
| `simulacion` | — | Nada que arrastrar. Botones «Ejecutar ×1 / ×10 / ×100» (`botonesEjecutar`); `policy-gradient` anima con `bucle` (pausable, «Auto»/«Pausa»); `intervalos` elige una muestra tocando su línea (canvas en `pi`, nunca miles de nodos). |
| `rejilla` | — | Nada que arrastrar. Celdas ≥ 44 px (la rejilla se desplaza en su caja si no cabe; ⤢ Ampliar), valores a 12 px, selectores con `segmentado`; los modos con Auto (`monte-carlo`, `td0`, `sarsa-qlearning`) se pausan fuera de pantalla (`pausar`). |
| `red` | — | Nada que arrastrar. Neuronas y pesos se tocan (`inspeccionable`; zona de toque de 16 px por peso). En móvil (< 560 px) con capas de ≥ 4 neuronas la red se dibuja en vertical (capas = filas). `forward` usa `barraPasos` fija; `xor` usa `segmentado`. |
| `convolucion` | `none` | La ventana del filtro sobre la imagen (radio 24 px, clave `ventana`): salta a la posición válida más cercana. El filtro se edita tocando una celda y con − / +; barra de pasos fija (Reiniciar restaura también el filtro). |
| `texto` | — | Nada. Campo de texto a 16 px; barras con la etiqueta encima; chips que envuelven línea; tablas con desplazamiento propio. `Texto.graficoBarras` es compartido por los modos. |
| `matriz-calor` | — | Nada. Filas de 48 px en táctil; celdas y cabeceras se tocan (`inspeccionable`); cabeceras recortadas se leen al tocarlas; en `atencion`, tocar una palabra de fila resalta su fila. La rejilla se desplaza en su caja si no cabe. |
| `grafo` | `none` | `conocimiento`: los nodos (radio 24 px, clave `nodo-<id>`; flechas del teclado) y, con dos dedos, el zoom y el desplazamiento (`api.pellizcar`); botones + / − / Centrar. `diagrama` y `red-bayesiana` pasan a vertical en móvil. Tocar un nodo abre su detalle. |
| `pasos` | — | Nada: barra de pasos fija y tira de progreso con zonas de toque de 44 px. |

**Tamaños:** objetivos ≥ 44 px (48 en la barra de pasos y en la zona de los deslizadores), ≥ 8 px entre vecinos, texto de SVG ≥ 12 px reales, radio de captura ≥ 24 px, burbuja 40 px sobre el dedo, apilado < 560 px de ancho del widget.

**Lista de comprobación por motor** (órdenes 4–6):

1. Usa `zonas(el)`: gráfico (+ leyenda) en `grafico`; lectura y controles en `controles`. Ampliado se ve bien en vertical y en horizontal.
2. Calcula el tamaño con `medida(contenedor)`, no con el ancho de la ventana ni con alturas fijas.
3. Todo lo que se arrastra pasa por `arrastrable` (nada de `pointerdown` propios) y tiene su `[data-arrastrable]`, con `clave` si se recrea.
4. `tactil` elegido (`none` o `pan-y`) y anotado en la tabla de arriba.
5. Lo que se arrastra se reconoce a simple vista (tirador, halo o punto destacado) y el dedo no tapa lo que cambia: `valor()` en la burbuja.
6. Cada asa tiene `etiqueta`, `valor` y `alTecla`; con `pan-y`, además un deslizador o − / + equivalente.
7. Ningún `<title>`, `title=` ni `mouseover`: `inspeccionable`.
8. Deslizadores con `api.slider`, selectores con `api.segmentado` y paso a paso con `api.barraPasos` (en una zona `pieFijo` si el gráfico es alto).
9. Textos del SVG con `fuente(svg, px)`, menos marcas en estrecho y ninguna etiqueta recortada o solapada a 412 px.
10. Canvas con `lienzoNitido`; animaciones con `bucle` (o `pausar`/`reanudar`). `probar_web.py --demo <motor> --android` sin errores ni avisos de arrastre, y capturas revisadas (normal y `.ampliado`).

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
