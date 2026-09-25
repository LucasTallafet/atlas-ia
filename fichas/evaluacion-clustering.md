---
id: evaluacion-clustering
estado: borrador
---

## En una frase

El coeficiente de silueta y métricas parecidas miden, sin usar etiquetas, si un clustering agrupa bien: puntos cercanos a los suyos y lejos de los demás grupos.

## Intuición

Imagina que organizas una boda y sientas a los invitados en mesas según su grupo de amistad. Para saber si lo has hecho bien no hace falta preguntar a nadie: basta con fijarte en cada invitado y comparar dos cosas, cuánto se lleva con la gente de su propia mesa y cuánto se llevaría con la gente de la mesa más parecida a la suya. Si está claramente más cómodo en su mesa que en cualquier otra, la asignación es buena; si estaría igual de a gusto en la mesa de al lado, la frontera entre mesas es dudosa.

Eso es justo lo que hace el **coeficiente de silueta**: evalúa la calidad de un [[clustering]] comparando, para cada punto, su cercanía a los de su propio clúster frente a su cercanía al clúster más próximo. A diferencia de la exactitud, que necesita etiquetas verdaderas de referencia, esta clase de métricas funciona sin ellas, algo esencial porque en clustering casi nunca hay etiquetas contra las que comparar.

## Explicación

### Por qué hacen falta métricas sin etiquetas

El clustering es aprendizaje no supervisado: no hay, en general, una respuesta correcta con la que comparar el resultado. Por eso, para juzgar si [[kmeans|K-Means]] con $k=3$ agrupa mejor que con $k=4$, o si un algoritmo agrupa mejor que otro, se necesitan métricas que evalúen la geometría del resultado —cuán compactos son los clústeres y cuán separados están entre sí— sin depender de etiquetas externas.

### El coeficiente de silueta, punto a punto

Para cada punto se calculan dos distancias: $a(i)$, la distancia media a los demás puntos de su propio clúster (cohesión), y $b(i)$, la distancia media a los puntos del clúster más cercano distinto del suyo (separación). El coeficiente de silueta combina ambas en un valor entre $-1$ y $1$: cercano a $1$ significa que el punto está mucho más cerca de su clúster que de cualquier otro; cercano a $0$, que está en la frontera entre dos clústeres; y negativo, que en realidad está más cerca de otro clúster que del suyo, señal de una asignación probablemente errónea. La silueta media de todos los puntos resume la calidad global del clustering.

### El índice de Davies-Bouldin

Esta métrica compara, para cada clúster, su propia dispersión interna con la distancia a los demás centros. A diferencia de la silueta, donde más alto es mejor, en el índice de Davies-Bouldin **más bajo es mejor**: un valor bajo indica clústeres compactos y bien separados.

### Qué más mirar

Además de estas puntuaciones, conviene fijarse en la distribución de tamaños de los clústeres: grupos extremadamente pequeños o uno que se lleva casi todos los puntos suelen indicar un ajuste de parámetros deficiente. En algoritmos como [[dbscan|DBSCAN]], que además de agrupar detecta ruido, una proporción muy alta de puntos marcados como ruido es otra señal de que los parámetros no están bien calibrados.

## Formalización

$$
s(i) = \frac{b(i) - a(i)}{\max\{a(i), b(i)\}}
$$

donde:

- $s(i)$ es el coeficiente de silueta del punto $i$, entre $-1$ y $1$.
- $a(i)$ es la distancia media entre el punto $i$ y el resto de puntos de su propio clúster.
- $b(i)$ es la distancia media entre el punto $i$ y los puntos del clúster más cercano distinto del suyo.
- El coeficiente de silueta global del clustering es la media de $s(i)$ sobre todos los puntos.

$$
DB = \frac{1}{k}\sum_{i=1}^{k} \max_{j \neq i} \frac{\sigma_i + \sigma_j}{d(\boldsymbol{\mu}_i, \boldsymbol{\mu}_j)}
$$

donde:

- $DB$ es el índice de Davies-Bouldin; cuanto más bajo, mejor (al revés que la silueta).
- $k$ es el número de clústeres.
- $\sigma_i$ es la dispersión media del clúster $i$ (distancia media de sus puntos a su centroide $\boldsymbol{\mu}_i$, ver [[clustering]]).
- $d(\boldsymbol{\mu}_i, \boldsymbol{\mu}_j)$ es la distancia entre los centroides de los clústeres $i$ y $j$.

Con los puntos $(1,1)$, $(1,2)$, $(5,5)$, $(5,6)$: agrupados por cercanía real (los dos primeros en un clúster, los dos últimos en otro), la silueta media es $0{,}823$ y el Davies-Bouldin, $0{,}177$. Si en cambio se agrupan mal, alternando un punto de cada zona en cada clúster, la silueta cae a $-0{,}408$ y el Davies-Bouldin sube a $5{,}657$: ambas métricas coinciden en señalar la segunda partición como mala, aunque en direcciones opuestas.

## Interactivo

```widget
motor: dispersion2d
modo: silueta
dataset: {"generador": "blobs", "n": 90, "ruido": 0.3, "clases": 3, "semilla": 6}
controles: [{"nombre": "k", "min": 2, "max": 8, "paso": 1, "valor": 3, "etiqueta": "número de grupos k"}]
```

- Prueba a mover $k$ hasta el número real de grupos del dataset y observa cómo sube la silueta media.
- Prueba a subir $k$ por encima de lo necesario y busca puntos con silueta negativa: son los que quedaron mal asignados.
- Prueba a comparar dos valores de $k$ con silueta media parecida, mirando la silueta por punto para decidir cuál agrupa mejor.

## En código

```python
import numpy as np
from sklearn.metrics import silhouette_score, davies_bouldin_score

X = np.array([[1, 1], [1, 2], [5, 5], [5, 6]])
buena = [0, 0, 1, 1]
mala = [0, 1, 0, 1]
print("buena -> silueta:", round(silhouette_score(X, buena), 3),
      "DB:", round(davies_bouldin_score(X, buena), 3))
print("mala  -> silueta:", round(silhouette_score(X, mala), 3),
      "DB:", round(davies_bouldin_score(X, mala), 3))
# buena -> silueta: 0.823 DB: 0.177
# mala  -> silueta: -0.408 DB: 5.657
```

## Errores típicos

- **Error**: pensar que un valor alto de silueta o bajo de Davies-Bouldin garantiza que el clustering es "correcto" en algún sentido absoluto. → **Correcto**: son medidas de cohesión y separación geométrica, no de si los grupos son útiles o significativos para el problema real.
- **Error**: comparar silueta y Davies-Bouldin como si "más alto es mejor" en ambos. → **Correcto**: en la silueta, más alto es mejor; en Davies-Bouldin, más bajo es mejor, porque mide dispersión relativa a la separación.
- **Error**: incluir los puntos de ruido de DBSCAN (etiqueta $-1$) al calcular la silueta como si fueran un clúster más. → **Correcto**: hay que excluirlos del cálculo, o la métrica queda distorsionada (ver [[dbscan]]).
- **Error**: quedarse solo con la puntuación media de silueta e ignorar la silueta por punto. → **Correcto**: la media puede ocultar que algunos puntos concretos están mal asignados (silueta negativa) aunque el promedio parezca aceptable.

## En resumen

- **Qué hace**: mide, sin usar etiquetas verdaderas, si un clustering agrupa bien: cohesión dentro de cada grupo y separación entre grupos distintos.
- **Cómo funciona**: la silueta compara, para cada punto, su distancia media a su propio clúster ($a$) con la distancia media al clúster más cercano ($b$); el índice de Davies-Bouldin compara la dispersión interna de los clústeres con la distancia entre sus centros.
- **Fórmula clave**: $s(i) = \frac{b(i)-a(i)}{\max\{a(i),b(i)\}}$, entre $-1$ y $1$.
- **Cuándo usarlo**: para comparar distintos valores de $k$ o distintos algoritmos de clustering sin tener etiquetas de referencia.
- **Cuándo no**: si dispones de etiquetas verdaderas, hay métricas más directas para comparar contra ellas.
- **Decisiones que importan**: excluir el ruido de DBSCAN del cálculo; mirar la silueta por punto, no solo la media.
- **Trampa principal**: silueta y Davies-Bouldin van en sentidos opuestos ("más alto mejor" frente a "más bajo mejor"); confundirlos lleva a conclusiones erróneas.

## A fondo

### En Scikit-learn

`sklearn.metrics` ofrece `silhouette_score` (media global) y `silhouette_samples` (valor por punto, útil para detectar asignaciones dudosas), además de `davies_bouldin_score`. Todas reciben los datos $X$ y las etiquetas de clúster asignadas, sin necesidad de etiquetas verdaderas.

### Diagnóstico visual

Más allá de las puntuaciones numéricas, un gráfico de dispersión coloreado por clúster o un mapa de calor de densidad ayudan a detectar visualmente clústeres mal formados, y complementan lo que dicen la silueta y el Davies-Bouldin, sobre todo cuando esos valores numéricos son ambiguos o intermedios.

## Autoevaluación

### Un punto tiene $a(i) = 2$ (distancia media a su propio clúster) y $b(i) = 6$ (distancia media al clúster más cercano). ¿Cuánto vale su coeficiente de silueta?
- [ ] $-0{,}67$
- [x] $0{,}67$
- [ ] $4$
> Por qué: $s(i) = \frac{b(i)-a(i)}{\max\{a(i),b(i)\}} = \frac{6-2}{6} \approx 0{,}67$; un valor alto y positivo indica que el punto está mucho más cerca de su propio clúster que del más próximo.

### Un punto tiene un coeficiente de silueta negativo. ¿Qué indica esto?
- [ ] Que el punto está perfectamente situado en el centro de su clúster.
- [x] Que el punto está, en promedio, más cerca de otro clúster que del suyo propio: probablemente está mal asignado.
- [ ] Que hay un error en el cálculo, porque la silueta nunca puede ser negativa.
> Por qué: la silueta es negativa cuando $b(i) < a(i)$, es decir, cuando el punto queda más cerca del clúster vecino que del suyo; sugiere una asignación dudosa o un límite de clúster mal trazado.

### Quieres comparar los resultados de K-Means y DBSCAN sobre el mismo dataset, sin tener etiquetas verdaderas de referencia. ¿Qué puedes usar?
- [ ] Nada: sin etiquetas verdaderas no se puede evaluar ningún clustering.
- [x] Métricas internas como el coeficiente de silueta o el índice de Davies-Bouldin, que comparan cohesión y separación usando solo la geometría de los datos.
- [ ] La exactitud (*accuracy*), calculada directamente sobre las etiquetas de clúster asignadas.
> Por qué: la exactitud necesita etiquetas verdaderas para comparar; las métricas internas evalúan la calidad de la partición usando solo las distancias entre los propios puntos, por lo que sirven para comparar algoritmos sin etiquetas.

### Comparas dos clusterings: uno tiene un índice de Davies-Bouldin más alto que el otro. ¿Cuál es mejor, en principio?
- [ ] El de Davies-Bouldin más alto, porque indica clústeres más ricos en información.
- [x] El de Davies-Bouldin más bajo: este índice mide dispersión relativa a la separación, y menos es mejor.
- [ ] Ninguno se puede comparar sin calcular también el coeficiente de silueta.
> Por qué: a diferencia de la silueta (donde más alto es mejor), el índice de Davies-Bouldin funciona al revés: valores más bajos indican clústeres más compactos y mejor separados.

## Glosario

- **Coeficiente de silueta**: métrica interna, entre $-1$ y $1$, que compara para cada punto su distancia media a su propio clúster con la distancia media al clúster más cercano.
- **Índice de Davies-Bouldin**: métrica interna que compara la dispersión dentro de los clústeres con la distancia entre sus centros; a diferencia de la silueta, cuanto más bajo, mejor.
- **Métrica interna de clustering**: medida de calidad de un clustering que no necesita etiquetas verdaderas, solo la geometría de los propios datos.
