# Ajustes de web 1 (pedidos por el usuario tras revisar el piloto)

Antes de empezar, lee `ESPEC-WEB.md` §4, §7 y §8 (incluida §API real). Al terminar:
1. Actualiza `ESPEC-WEB.md` §4 para que describa lo nuevo. Así la Fase final no lo deshace.
2. Apunta la decisión en `DECISIONES.md`.
3. Haz commit.

No toques fichas ni `tools/`.

## 1. Mapa → "Constelación" (vista por defecto de `#mapa`)

- **Qué es.** Un grafo de fuerzas de los 138 conceptos, sin librerías (en `docs/mapa.js`, unas 150-300 líneas):
  - repulsión entre nodos,
  - atracción a lo largo de las aristas de requisito,
  - un ancla por bloque, para que cada bloque forme un cúmulo con su color.
  Los 8 cúmulos se colocan en anillo o en espiral siguiendo el orden de estudio B1 → B8.
- **Determinista.** Semilla fija y unas 300 iteraciones calculadas antes de pintar. Nada se mueve solo después de cargar: sin animación continua, y se respeta `prefers-reduced-motion`.
- **Navegación.** SVG. Zoom con la rueda o con pellizco y arrastre para desplazarse, más un botón "Centrar".
- **Nodos.** Círculo del color del bloque, con radio según el número de conceptos que desbloquea. Cada estado se ve distinto:
  - pendiente de escribir: contorno punteado y apagado,
  - escrita: relleno suave,
  - vista: relleno pleno,
  - dominada: relleno pleno y halo.
  Las etiquetas solo se muestran en los nodos grandes o al acercar el zoom. Al pasar el ratón o enfocar un nodo se ven su nombre y su "En una frase".
- **Aristas.** Curvas finas y translúcidas. Al pasar el ratón o enfocar un nodo se resaltan **toda su cadena de requisitos** (ancestros) y lo que desbloquea directamente; el resto se atenúa.
- **Bloques.** El nombre de cada bloque flota sobre su cúmulo.
- **Buscador del mapa.** Al elegir un concepto, hace un zoom suave hasta él y lo resalta.
- **Interacción.** Clic en un nodo: abre la ficha. Con el teclado, Tab recorre los nodos en el orden de `INDICE.orden` y Enter abre la ficha.
- **Vista alternativa.** Conserva la vista actual por columnas con un selector "Constelación | Por bloques". Por debajo de 700 px se abre por defecto "Por bloques".
- **Estética moderna.**
  - Fondo con un degradado sutil y una rejilla de puntos muy tenue.
  - Sin cajas.
  - Etiquetas pequeñas y limpias.
  - Debe lucir especialmente en tema oscuro, como una constelación, y seguir siendo clara en tema claro.
- **Ruta resaltada.** Si al abrir `#mapa` hay en el progreso una ruta guardada con "Ver en la constelación" (ver §2), se resalta esa ruta y se muestra un botón para quitar el resaltado.

## 2. Rutas → diagrama de red

- **Forma.** En `#rutas`, cada ruta (predefinida o "Ruta hacia…") se dibuja como un **diagrama de red por capas**, de izquierda a derecha:
  - cada columna es una profundidad en la cadena de requisitos,
  - los nodos llevan el color de su bloque y su estado de progreso,
  - las aristas son curvas Bézier que van del requisito al concepto.
- **Cruces.** Ordena los nodos dentro de cada capa para minimizar cruces, con la heurística del baricentro en 2-3 pasadas.
- **Destacados.** Resalta el **siguiente paso recomendado** (el primer nodo no dominado con todos sus requisitos dominados) y la parte ya dominada.
- **Interacción.** Clic en un nodo: abre la ficha. En móvil, el diagrama se muestra en vertical, de arriba abajo.
- **Lista.** Debajo del diagrama se mantiene la lista actual con el estado de cada paso.
- **Botón "Ver en la constelación".** Guarda la ruta en el progreso (`ultimaRuta`) y abre `#mapa` con esa ruta resaltada.

## 3. Glosario completo

- **Entradas por concepto.** Además de los términos de las fichas, cada uno de los 138 conceptos es una entrada del glosario:
  - si la ficha existe: el nombre del concepto y su "En una frase",
  - si no: "Pendiente · lote Lxx", con estilo atenuado.
- **Orden.** Los dos tipos de entrada van mezclados en orden alfabético, con una barra de letras A-Z para saltar, un filtro por bloque y el contador "N términos · crece con cada lote".
- **Desambiguaciones.** Las 7 desambiguaciones siguen arriba.

## 4. Pruebas

Cada vista general (`inicio`, `mapa`, `rutas`, `glosario`, `repaso`), al terminar de pintarse, pone `document.body.dataset.listo = '<vista>'`. Después ejecuta:

```
python tools/build.py
python tools/probar_web.py --vistas --movil
python tools/probar_web.py --id derivada
```

Abre las capturas de `capturas/` del mapa, las rutas y el glosario, en escritorio y en móvil, míralas y corrige lo que se vea mal. Repite hasta que no haya errores y el resultado sea limpio y legible.
