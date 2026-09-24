# Ajustes de web 3 · Filtrar por bloques y explorar un nodo (Constelación y Por bloques)

Al terminar, actualiza `ESPEC-WEB.md` §4 con lo nuevo, apunta la decisión en `DECISIONES.md` y haz commit. No toques fichas ni `tools/`.

## 1. Filtro por bloques (las dos vistas del mapa)
- Fila de 8 chips, uno por bloque, con su color y su nombre corto, y un chip "Todos".
- Clic en un chip: muestra solo ese bloque. Mayús+clic o Ctrl+clic: añade o quita bloques de la selección.
- En la Constelación, los bloques ocultos no desaparecen de golpe: se quedan como puntos muy tenues (opacidad ≈ 0,08), sin etiquetas ni interacción, para no perder la orientación. Botón "Encuadrar selección": ajusta el zoom a los bloques elegidos.
- El filtro se recuerda en el progreso (`filtroBloques`).

## 2. Seleccionar un nodo para ver sus conexiones (las dos vistas)
- **Un clic en un nodo lo selecciona; ya no abre la ficha.** Al seleccionarlo:
  - se resaltan sus **requisitos**: toda la cadena de ancestros, más intensos cuanto más cercanos;
  - se resalta lo que **desbloquea**: descendientes directos y, más tenues, los indirectos;
  - se resaltan sus **conexiones** y **desambiguaciones** (`INDICE.conceptos[].conexiones` / `desambiguacion`), con un trazo distinto: discontinuo;
  - el resto se atenúa;
  - la selección se mantiene hasta hacer clic en el fondo o pulsar Esc.
- Leyenda pequeña con los tres tipos de relación y su estilo de línea.
- En "Por bloques" se aplica el mismo resaltado. Las relaciones se dibujan con curvas SVG sobre las columnas, o como mínimo se marcan los nodos relacionados con su tipo y se atenúa el resto.

## 3. Panel de detalle del nodo
- Al seleccionar un nodo se abre un **panel lateral**: a la derecha en escritorio, abajo como hoja deslizable en móvil. Contiene:
  - nombre, bloque (con su color), tipo (original / fusión / ampliación) y estado (pendiente, escrita, vista, dominada);
  - "En una frase". Si la ficha no está escrita: "Pendiente · lote Lxx";
  - las listas Requisitos / Desbloquea / Conexiones, clicables. Un clic selecciona ese nodo y lo centra en el mapa;
  - "Ruta completa hasta aquí: N conceptos", con un botón "Ver ruta" que la resalta en el mapa;
  - el interactivo y el número de preguntas de la autoevaluación, si la ficha existe.
- El botón **"Abrir ficha"** entra en la ficha completa. Doble clic en el nodo o Enter con el nodo enfocado hacen lo mismo.
- Teclado: Tab recorre los nodos; Enter o espacio selecciona; Enter otra vez abre la ficha; Esc cierra el panel.

## 4. Pruebas
Ejecuta `python tools/probar_web.py --vistas --movil`. Además, con `python -c` y Playwright, haz capturas del mapa con un nodo seleccionado, por ejemplo `kmeans`, en las dos vistas y en móvil. Míralas y corrige lo que se vea mal. Commit.
