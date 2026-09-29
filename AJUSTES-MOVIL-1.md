# AJUSTES-MOVIL-1 · Sistema de diseño y navegación móvil

Lee antes `AJUSTES-MOVIL-COMUN.md` y `AUDITORIA-MOVIL.md` (filas de la orden 1).

## Objetivo
Que la web tenga en móvil una base sólida: tipografía y espaciado pensados para el dedo, una navegación que se alcanza con el pulgar y el botón Atrás de Android funcionando como se espera.

## Haz

### 1. Tokens de diseño (`estilos.css`)
- Agrupa en `:root` las variables de espaciado (`--esp-1` … `--esp-6`, múltiplos de 4 px), radios, sombras, tamaños de texto y `--tactil: 48px`. Si ya existen con otros nombres, reutilízalas; no dupliques.
- Escala tipográfica fluida con `clamp()`: texto base 16 px en móvil y el tamaño actual en escritorio; títulos de ficha que no partan palabras feo (`overflow-wrap: anywhere` solo en títulos, `hyphens: auto` con `lang="es"`).
- Longitud de línea cómoda: en móvil, 16 px de margen lateral (más la zona segura).
- Contraste AA en claro y oscuro para textos y controles (revisa los colores de bloque sobre fondo oscuro).

### 2. Navegación
- **Móvil y tablet (< 1024 px):** cabecera compacta (≤ 56 px: título "Atlas IA" + botón Buscar + menú ⋮ con Tema, Exportar/Importar progreso, Instalar app, Acerca de) que se oculta al desplazar hacia abajo y reaparece al subir.
- **Barra de navegación inferior** fija, de 5 destinos con icono (SVG en línea) + texto: **Inicio · Mapa · Rutas · Glosario · Repaso**. Destino activo resaltado, `aria-current="page"`, altura 64 px + `env(safe-area-inset-bottom)`. En una ficha se mantiene visible (el destino activo es el de origen, o Mapa si se entró directo).
- El contenido reserva el espacio de la cabecera y de la barra (que nada quede tapado, tampoco el último elemento de una lista).
- **Escritorio:** navegación actual, sin cambios.

### 3. Botón Atrás de Android y rutas
- Cada cambio de vista, de ficha o de pestaña que el usuario perciba como "pantalla nueva" crea una entrada de historial (hash). Abrir una **hoja inferior** o un **panel a pantalla completa** también (p. ej. `#kmeans~relaciones` o `history.pushState` con estado); el botón Atrás la cierra en vez de salir de la ficha.
- Al volver atrás se restaura la posición de desplazamiento de la vista anterior.
- En la PWA instalada, Atrás en `#inicio` sin historial deja que Android cierre la app (no lo bloquees).

### 4. Componentes base reutilizables (en `app.js` o un `ui.js` nuevo)
- `hojaInferior(contenido, {titulo})`: hoja que sube desde abajo, con asa, se cierra deslizando hacia abajo, tocando el fondo, con Atrás o con Esc; atrapa el foco mientras está abierta; altura máxima 85 vh con scroll interno.
- `chips(opciones, {multiple})`: fila de filtros desplazable en horizontal, cada chip ≥ 40 px de alto con zona táctil de 48.
- `aviso(texto)`: mensaje breve (snackbar) encima de la barra inferior.
Úsalos en las órdenes siguientes en vez de crear variantes.

### 5. Vistas generales en móvil
- **Inicio:** tarjetas a una columna; "continuar donde lo dejaste" arriba; buscador como botón grande que abre la búsqueda a pantalla completa (campo con autofoco, resultados que se tocan con facilidad, Atrás cierra).
- **Mapa:** en < 1024 px abre en **Por bloques** y oculta el selector de vista (la Constelación no se muestra ni se carga). Por bloques se muestra como **acordeón vertical**: un bloque por sección plegable con su color, contador de vistas/total y conceptos como filas táctiles. Filtro de bloques con `chips`. Tocar un concepto lo **selecciona** (resalta sus requisitos y lo que desbloquea dentro de la lista, con una leyenda) y abre una `hojaInferior` con el detalle que ya existe en escritorio (en una frase, requisitos, desbloquea, botón "Abrir ficha").
- **Rutas:** el diagrama de red por capas se muestra en vertical (capas de arriba abajo), a lo ancho de la pantalla sin desbordar, con el "siguiente paso recomendado" como botón fijo al pie. Si una capa tiene demasiados nodos, se apilan en filas. Tocar un nodo abre la misma hoja inferior de detalle.
- **Glosario:** buscador fijo arriba; índice A–Z como columna fina a la derecha (tocar o deslizar el dedo salta a la letra) o, si no cabe, como fila de chips; cada término es una fila que se despliega.
- **Repaso:** tarjeta a pantalla casi completa, botones de respuesta grandes abajo, al alcance del pulgar.

## No hagas
No toques la ficha por dentro (orden 2) ni los motores (órdenes 3–6).

## Hecho cuando
- `python tools/probar_web.py --vistas --android` y `--vistas --android --oscuro`: 0 errores. Revisa las capturas.
- `python tools/probar_web.py --vistas` (escritorio): 0 errores y las capturas de escritorio iguales que antes en lo esencial.
- Has repasado en el código el flujo del botón Atrás (abrir ficha → abrir hoja inferior → Atrás cierra la hoja → Atrás vuelve a la vista anterior con su scroll) y lo describes en `DECISIONES.md`.
- `ESPEC-WEB.md`: nueva subsección **§7b Móvil** (puntos de corte, tokens, barra inferior, hojas inferiores, historial) y §4 actualizado.
- `DECISIONES.md` y commit `Móvil 1: …`.
