---
id: dbscan
estado: borrador
---

## En una frase

DBSCAN agrupa los puntos que están muy juntos (regiones densas) y marca como ruido a los que quedan aislados, sin necesidad de fijar cuántos grupos hay.

## Intuición

Imagina que ves de noche, desde un avión, las luces de una región: donde hay muchas luces juntas hay un barrio o una ciudad; una farola solitaria en medio del campo no forma ningún núcleo urbano, es solo un punto aislado. Si tuvieras que dibujar los límites de las ciudades sin ningún mapa previo, no contarías cuántas hay de antemano: mirarías dónde se concentra la luz y hasta dónde llega esa concentración antes de apagarse.

Eso es justo lo que hace **DBSCAN** (*Density-Based Spatial Clustering of Applications with Noise*): en vez de repartir los datos en un número fijo de grupos como [[kmeans|K-Means]], busca regiones donde los puntos están muy concentrados y las separa de las zonas dispersas. Los puntos sueltos que no pertenecen a ninguna región densa no se fuerzan a entrar en un grupo: se etiquetan como **ruido**. Esto lo hace especialmente útil cuando esperas formas de clúster irregulares o quieres detectar valores atípicos a la vez que agrupas.

## Explicación

### Vecindad y densidad: los dos ingredientes

DBSCAN necesita dos parámetros para decidir qué es una región densa. El primero, $\varepsilon$ (**epsilon**), es un radio: define qué otros puntos cuentan como "vecinos" de uno dado. El segundo, $MinPts$, es el número mínimo de vecinos que debe tener un punto dentro de ese radio para que la zona se considere densa.

### Tres tipos de punto: núcleo, borde y ruido

Con esos dos parámetros, cada punto del dataset se clasifica en una de tres categorías. Un **punto núcleo** tiene al menos $MinPts$ vecinos dentro de su radio $\varepsilon$: representa una región de alta densidad. Un **punto de borde** no llega a ese umbral por sí mismo, pero cae dentro de la vecindad de al menos un punto núcleo, por lo que se incorpora a su clúster sin ser él mismo un núcleo. Un **punto de ruido** no cumple ninguna de las dos condiciones: no tiene suficientes vecinos ni está cerca de ningún núcleo, así que se etiqueta como valor atípico.

### Cómo crece un clúster: expansión desde los núcleos

El algoritmo parte de un punto núcleo y explora su vecindad; si alguno de esos vecinos es también un núcleo, su vecindad se explora igualmente, y así el clúster se expande de forma progresiva. El proceso continúa hasta que no quedan más puntos conectados que incorporar. De este modo, DBSCAN forma agrupaciones sin necesidad de fijar de antemano cuántas habrá: el número de clústeres es una salida del algoritmo, no un parámetro que tú elijas, a diferencia de K-Means, que sí exige fijar $k$.

### Elegir $\varepsilon$ y $MinPts$

Un $\varepsilon$ demasiado pequeño fragmenta clústeres densos reales en varios trozos y genera ruido de más; uno demasiado grande fusiona regiones que deberían quedar separadas. Una forma práctica de elegirlo es la **curva k-distance**: se ordenan las distancias de cada punto a su $k$-ésimo vecino más cercano y se busca el "codo" de la curva, que suele marcar un buen valor de $\varepsilon$. Para $MinPts$, una regla empírica habitual es usar el doble del número de dimensiones del dataset; por ejemplo, con 5 variables, un punto de partida razonable es $MinPts=10$.

### Ventajas y límites

DBSCAN no necesita que fijes el número de clústeres, detecta formas arbitrarias (no solo esféricas) y señala valores atípicos como parte natural de su funcionamiento, lo que lo hace útil para detección de fraude o anomalías. Su principal debilidad es la alta dimensionalidad: cuando crece el número de variables, las distancias entre puntos se homogeneizan y la propia noción de densidad pierde sentido. Tampoco se adapta bien a datasets con densidades muy variables entre regiones, porque usa un único $\varepsilon$ global; y la elección de $\varepsilon$ y $MinPts$ exige, en la práctica, varias pruebas.

## Formalización

$$
N_\varepsilon(\mathbf{x}_i) = \{\mathbf{x}_j \in X : \lVert \mathbf{x}_i - \mathbf{x}_j \rVert \le \varepsilon\}
$$

donde:

- $N_\varepsilon(\mathbf{x}_i)$ es la vecindad de radio $\varepsilon$ del punto $\mathbf{x}_i$: todos los puntos del conjunto de datos $X$ a distancia $\varepsilon$ o menor (incluido él mismo).
- $\varepsilon$ es el radio que define qué cuenta como "cerca".
- $\lVert \cdot \rVert$ es la distancia euclídea (u otra métrica).

$$
\mathbf{x}_i \text{ es punto núcleo} \iff |N_\varepsilon(\mathbf{x}_i)| \ge MinPts
$$

donde:

- $|N_\varepsilon(\mathbf{x}_i)|$ es el número de puntos en la vecindad de $\mathbf{x}_i$.
- $MinPts$ es el número mínimo de vecinos exigido para considerar la región densa.
- Un punto que no es núcleo pero pertenece a $N_\varepsilon(\mathbf{x}_j)$ de algún núcleo $\mathbf{x}_j$ es un punto de borde; si no cumple ninguna de las dos condiciones, es ruido.

Con $\varepsilon=0{,}75$ y $MinPts=4$ sobre los puntos $(0,0)$, $(0{,}5,0)$, $(0,0{,}5)$, $(0{,}5,0{,}5)$, $(1{,}1,0{,}1)$ y $(5,5)$: los cuatro primeros tienen 4 o 5 vecinos dentro del radio y son núcleo; el quinto solo tiene 3 vecinos —no llega a $MinPts$— pero está en la vecindad del segundo, así que es borde; el sexto está solo y queda como ruido.

## Interactivo

```widget
motor: dispersion2d
modo: dbscan
dataset: {"generador": "lunas", "n": 150, "ruido": 0.1, "clases": 2, "semilla": 3}
controles: [{"nombre": "eps", "min": 0.05, "max": 1, "paso": 0.05, "valor": 0.2, "etiqueta": "ε (radio)"}, {"nombre": "minPts", "min": 2, "max": 15, "paso": 1, "valor": 5, "etiqueta": "MinPts"}]
```

- Prueba a bajar $\varepsilon$ hasta que las dos lunas se fragmenten en varios clústeres pequeños y aparezca ruido.
- Prueba a subir $\varepsilon$ hasta que las dos lunas se fusionen en un único clúster.
- Prueba a subir $MinPts$ y observa cómo crecen los puntos marcados como ruido en los bordes de cada luna.

## En código

```python
import numpy as np
from sklearn.cluster import DBSCAN

X = np.array([[0, 0], [0.5, 0], [0, 0.5], [0.5, 0.5], [1.1, 0.1], [5, 5]])
db = DBSCAN(eps=0.75, min_samples=4).fit(X)
print("etiquetas:", db.labels_)
print("puntos núcleo:", db.core_sample_indices_)
# etiquetas: [ 0  0  0  0  0 -1]   -> el punto 4 es de borde (mismo clúster, no núcleo)
# puntos núcleo: [0 1 2 3]         -> el punto 5, (5,5), queda como ruido (-1)
```

## Errores típicos

- **Error**: pensar que un $\varepsilon$ pequeño siempre da clústeres "más precisos". → **Correcto**: un $\varepsilon$ demasiado pequeño fragmenta clústeres densos reales en varios trozos y aumenta el ruido.
- **Error**: tratar la etiqueta $-1$ de ruido como un clúster más al calcular métricas o promedios. → **Correcto**: el ruido no es un grupo; hay que excluirlo al evaluar la calidad del clustering, como en el coeficiente de silueta (ver [[evaluacion-clustering]]).
- **Error**: aplicar DBSCAN directamente a datos con muchas variables sin reducir la dimensionalidad antes. → **Correcto**: en alta dimensión las distancias entre puntos se vuelven parecidas entre sí y la noción de "densidad" pierde sentido.
- **Error**: esperar que un único $\varepsilon$ funcione bien cuando el dataset tiene regiones de densidades muy distintas. → **Correcto**: DBSCAN usa un radio global; con densidades muy variables puede agrupar mal algunas regiones o ignorar clústeres más dispersos.

## En resumen

- **Qué hace**: agrupa puntos según su concentración (densidad) en el espacio, sin fijar de antemano el número de clústeres, y marca como ruido los puntos aislados.
- **Cómo funciona**: clasifica cada punto en núcleo ($\ge MinPts$ vecinos a distancia $\le\varepsilon$), borde (vecino de un núcleo pero no núcleo él mismo) o ruido; luego expande cada clúster desde sus puntos núcleo.
- **Regla clave**: $N_\varepsilon(\mathbf{x}_i)=\{\mathbf{x}_j: \lVert \mathbf{x}_i-\mathbf{x}_j\rVert\le\varepsilon\}$; $\mathbf{x}_i$ es núcleo si $|N_\varepsilon(\mathbf{x}_i)|\ge MinPts$.
- **Cuándo usarlo**: clústeres de forma irregular, o datos con ruido o valores atípicos que quieres detectar a la vez que agrupas.
- **Cuándo no**: datasets con densidades muy variables entre clústeres, o de muy alta dimensión.
- **Decisiones que importan**: $\varepsilon$ (radio de vecindad) y $MinPts$ (mínimo de vecinos); $\varepsilon$ se suele afinar con la curva k-distance.
- **Trampa principal**: los puntos etiquetados como ruido ($-1$) no son un clúster; hay que excluirlos al evaluar la calidad del agrupamiento.

## A fondo

### En Scikit-learn

La clase `DBSCAN` de `sklearn.cluster` expone `eps` y `min_samples` como parámetros principales, además de `metric` (la métrica de distancia) y `algorithm` (`'auto'`, `'ball_tree'`, `'kd_tree'` o `'brute'`, que afecta a la velocidad en datasets grandes). Tras entrenar, `labels_` da la etiqueta de cada punto (con $-1$ para ruido), `core_sample_indices_` los índices de los puntos núcleo y `components_` sus coordenadas.

### Aplicaciones

DBSCAN se usa en **análisis de redes sociales** para detectar comunidades de usuarios sin fijar cuántas hay; en el ámbito financiero, para **detección de fraude**, señalando transacciones que quedan como ruido frente al comportamiento habitual; en **procesamiento de imágenes médicas y satelitales**, para segmentar regiones densas (tejido, zonas urbanas); y en **análisis geoespacial**, para encontrar zonas de alta concentración de actividad, como el tráfico en horas punta de una ciudad.

## Autoevaluación

### Un punto tiene solo 2 vecinos dentro de su radio $\varepsilon$ (contándose a sí mismo), pero uno de esos vecinos sí es un punto núcleo. ¿Cómo lo clasifica DBSCAN?
- [ ] Como ruido, porque no alcanza el mínimo de puntos.
- [x] Como punto de borde, porque está dentro de la vecindad de un núcleo aunque él mismo no lo sea.
- [ ] Como punto núcleo, porque está conectado a un núcleo.
> Por qué: ser vecino de un punto núcleo basta para entrar en el clúster como punto de borde; para ser núcleo hace falta cumplir el umbral $MinPts$ uno mismo.

### ¿Por qué DBSCAN no necesita que fijes de antemano el número de clústeres, a diferencia de K-Means?
- [ ] Porque siempre genera exactamente un clúster por cada punto núcleo.
- [x] Porque el número de grupos surge de cuántas regiones densas y separadas detecta el algoritmo, no de un parámetro que tú elijas.
- [ ] Porque DBSCAN no puede formar más de dos clústeres.
> Por qué: K-Means reparte los datos en $k$ grupos porque tú se lo pides; DBSCAN expande clústeres desde los núcleos hasta donde llegue la densidad, así que el número de grupos es una salida del algoritmo, no una entrada.

### Subes $\varepsilon$ mucho más allá de lo razonable para tu dataset. ¿Qué es lo más probable que ocurra?
- [x] Que clústeres que en realidad están separados se fusionen en uno solo.
- [ ] Que aparezcan más puntos etiquetados como ruido.
- [ ] Que el algoritmo deje de necesitar $MinPts$.
> Por qué: un $\varepsilon$ demasiado grande hace que casi cualquier punto tenga suficientes "vecinos" dentro de su radio, uniendo regiones que deberían quedar separadas.

### Estás analizando estaciones de sensores ambientales y subes mucho $MinPts$ para "limpiar" el resultado. ¿Qué riesgo corres?
- [ ] Que el algoritmo tarde mucho más en ejecutarse.
- [x] Que estaciones aisladas pero relevantes (eventos climáticos poco frecuentes) queden marcadas como ruido y se pierdan.
- [ ] Que todos los puntos se conviertan automáticamente en núcleo.
> Por qué: un $MinPts$ alto exige más vecinos para considerar densa una región, así que agrupaciones pequeñas pero reales pueden no alcanzar el umbral y acabar descartadas como ruido.

## Glosario

- **DBSCAN**: algoritmo de clustering basado en densidad que agrupa regiones con muchos puntos concentrados y marca como ruido los puntos aislados.
- **Punto núcleo**: punto que tiene al menos $MinPts$ vecinos dentro de su radio $\varepsilon$.
- **Punto de borde**: punto que no es núcleo pero está dentro de la vecindad de al menos un punto núcleo.
- **Punto de ruido**: punto que no es núcleo ni está en la vecindad de ningún núcleo; se etiqueta con $-1$ y no pertenece a ningún clúster.
- **Curva k-distance**: gráfico que ayuda a elegir $\varepsilon$ observando el "codo" en las distancias de cada punto a su $k$-ésimo vecino más cercano.
