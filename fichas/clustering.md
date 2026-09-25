---
id: clustering
estado: borrador
---

## En una frase

El clustering agrupa datos sin etiquetas en clústeres, buscando que los puntos de un mismo grupo se parezcan entre sí y se diferencien de los de otros grupos.

## Intuición

Imagina que te dan una caja con cientos de fotos de clientes de una tienda, sin ninguna etiqueta que diga qué tipo de cliente es cada uno. Aun así, si las extiendes sobre una mesa, empiezas a notar que algunas se agrupan de forma natural: aquí los que compran mucho y a menudo, allí los ocasionales, más allá los que gastan poco pero fiel y regularmente. Nadie te dijo esos grupos de antemano; los has descubierto mirando el parecido entre las fotos.

Eso es el clustering: en vez de aprender a partir de ejemplos ya etiquetados como en el [[tipos-aprendizaje|aprendizaje supervisado]], busca **estructura oculta** en datos sin etiquetas, agrupando lo parecido y separando lo distinto. Es uno de los pilares del aprendizaje no supervisado.

## Explicación

### Qué hace bueno a un clúster

El objetivo del clustering es doble: que las observaciones dentro de un mismo **clúster** sean lo más parecidas posible entre sí (**homogeneidad interna**) y que los distintos clústeres queden claramente diferenciados (**separación externa**). Medir ese parecido exige una noción de **similitud**, casi siempre basada en una distancia entre puntos —la euclídea es la más común, ver [[producto-escalar-similitud]]— aunque otras métricas pueden ser más apropiadas según el tipo de dato.

### Cuatro formas de definir un buen grupo

No hay un único algoritmo de clustering porque no hay una única noción de "grupo natural"; cada familia de algoritmos parte de una idea distinta:

- **Basado en particiones**: divide los datos en un número fijo de grupos, cada uno resumido por un punto central. El más conocido es [[kmeans|K-Means]].
- **Jerárquico**: construye un árbol de fusiones (un *dendrograma*) que muestra cómo se agrupan los datos a distintos niveles de granularidad, sin fijar de antemano el número de clústeres; se explora en [[clustering-jerarquico]].
- **Basado en densidad**: define un clúster como una región del espacio con muchos puntos concentrados, separada de otras por zonas de baja densidad; permite formas irregulares y detectar atípicos, como en [[dbscan|DBSCAN]].
- **Probabilístico**: asume que los datos provienen de una mezcla de distribuciones y calcula, para cada punto, una probabilidad de pertenencia a cada clúster en vez de una asignación fija, como en los modelos de mezcla de gaussianas ([[gmm]]).

La elección depende de la forma de los datos, de si conoces de antemano cuántos grupos esperas y de si necesitas una asignación dura o una probabilidad de pertenencia.

### Representar un clúster: centroide, baricentro y densidad

Muchos algoritmos resumen cada clúster con un punto central. El más habitual es el **centroide**: la media aritmética de los puntos del clúster, que usa K-Means (ver [[kmeans]] y Formalización). Cuando algunas observaciones deben pesar más que otras —por ejemplo, clientes de mayor valor, o para reducir la influencia de valores atípicos dándoles menos peso—, se usa en su lugar el **baricentro**, una media ponderada. Otros algoritmos no usan ningún punto central: DBSCAN, por ejemplo, define un clúster directamente por la concentración de puntos en una región, lo que le permite capturar formas que un centroide no podría representar bien, como anillos.

### El reto de muchas dimensiones

Los datos de clustering suelen tener muchas más de dos o tres variables. A medida que crece el número de dimensiones, las distancias entre puntos tienden a homogeneizarse y pierden capacidad discriminativa: es la [[integral-monte-carlo|maldición de la dimensionalidad]]. Técnicas de reducción de dimensionalidad como PCA ayudan tanto a visualizar como a mejorar el rendimiento del clustering en estos casos.

## Formalización

El **centroide** de un clúster con $n$ puntos $\mathbf{x}_1,\dots,\mathbf{x}_n$ es su media aritmética:

$$
\boldsymbol{\mu} = \frac{1}{n}\sum_{i=1}^n \mathbf{x}_i
$$

donde:
- $\boldsymbol{\mu}$ es el centroide del clúster.
- $n$ es el número de puntos que contiene.
- $\mathbf{x}_i$ es el vector de características de cada punto.

El **baricentro** generaliza el centroide dando un peso $w_i$ a cada punto:

$$
\boldsymbol{\mu}_{\text{ponderado}} = \frac{\sum_{i=1}^n w_i \mathbf{x}_i}{\sum_{i=1}^n w_i}
$$

donde:
- $w_i$ es el peso asignado a cada punto (por ejemplo, su relevancia o su fiabilidad).
- Si todos los pesos son iguales, el baricentro coincide con el centroide.

## Interactivo

```widget
motor: dispersion2d
modo: comparar-clustering
dataset: {"generador": "lunas", "n": 150, "ruido": 0.15, "clases": 2, "semilla": 8}
controles: [{"nombre": "k", "min": 2, "max": 6, "paso": 1, "valor": 2, "etiqueta": "número de grupos (particiones/jerárquico)"}]
```

- Prueba a comparar el resultado de K-Means y de DBSCAN sobre este dataset en forma de lunas: ¿cuál de los dos separa correctamente las dos medias lunas?
- Prueba a subir $k$ y observa cómo K-Means y el método jerárquico, obligados a repartir en más grupos, terminan partiendo una misma luna en dos.
- Prueba a fijarte en la silueta media de cada método: ¿coincide el que "se ve mejor" con el que puntúa más alto?

## En código

```python
import numpy as np

A, B, C, D = np.array([1, 1]), np.array([1, 2]), np.array([5, 5]), np.array([5, 6])
cluster = np.array([A, B])

centroide = cluster.mean(axis=0)
print(centroide)  # [1.  1.5]: media simple de A y B

pesos = np.array([1, 3])  # B pesa 3 veces más que A
baricentro = (pesos[:, None] * cluster).sum(axis=0) / pesos.sum()
print(baricentro)  # [1.   1.75]: se desplaza hacia B, el punto con más peso
```

## Errores típicos

- **Error**: pensar que el clustering necesita datos etiquetados, como el aprendizaje supervisado. → **Correcto**: es aprendizaje no supervisado; descubre grupos a partir de la similitud entre observaciones, sin ninguna etiqueta previa.
- **Error**: asumir que todos los algoritmos de clustering necesitan que fijes el número de grupos de antemano. → **Correcto**: solo los métodos de partición (K-Means) y, en la práctica, el jerárquico al cortar el dendrograma, lo necesitan; los basados en densidad como DBSCAN lo descubren solos.
- **Error**: aplicar distancia euclídea y centroides a datos con clústeres de forma irregular (anillos, lunas). → **Correcto**: el centroide solo tiene sentido si el clúster es razonablemente compacto y convexo; con formas irregulares conviene un método basado en densidad.
- **Error**: creer que más dimensiones siempre dan más información útil para agrupar. → **Correcto**: a partir de cierto número de variables, las distancias entre puntos se homogeneizan (maldición de la dimensionalidad) y el clustering pierde capacidad de distinguir grupos reales.

## En resumen

- **Qué hace**: agrupa observaciones sin etiquetas en clústeres, maximizando la similitud dentro de cada grupo y la diferencia entre grupos.
- **Cómo funciona**: depende de la familia de algoritmo —particiones, jerárquico, densidad o probabilístico—, pero todos parten de una noción de similitud o distancia entre puntos.
- **Fórmula clave**: el centroide de un clúster es la media de sus puntos, $\boldsymbol{\mu} = \frac{1}{n}\sum_i \mathbf{x}_i$; el baricentro generaliza esa media dando un peso distinto a cada punto.
- **Cuándo usarlo**: para explorar datos sin etiquetas, segmentar poblaciones o detectar estructuras y anomalías antes de aplicar otras técnicas.
- **Cuándo no**: si ya tienes etiquetas fiables, un problema supervisado suele dar mejores resultados directamente.
- **Decisiones que importan**: qué métrica de distancia usar, si conoces el número de grupos de antemano y si esperas formas convexas o irregulares.
- **Trampa principal**: no existe un "mejor" algoritmo de clustering universal; la elección depende de la forma real de los datos, que casi nunca se conoce de antemano.

## A fondo

### Aplicaciones habituales

El clustering se usa para **segmentación de clientes** en marketing (agrupar por comportamiento de compra para personalizar campañas), **detección de anomalías** en fraude o ciberseguridad (agrupar comportamientos típicos para señalar lo que se desvía), **biología y medicina** (agrupar pacientes o perfiles genéticos con patrones similares), **segmentación de imágenes** (agrupar píxeles por color o intensidad, útil en diagnóstico o análisis satelital) y **personalización de contenido** (agrupar usuarios con gustos parecidos, como hacen los sistemas de recomendación de plataformas de streaming).

### Ejemplo de segmentación

Una empresa de telecomunicaciones analiza a sus clientes por ingresos y gastos sin ninguna etiqueta previa y, tras aplicar clustering, descubre cuatro grupos: clientes de bajos ingresos y pocos gastos (candidatos a planes económicos), ingresos medios pero ahorradores, ingresos medios con gastos elevados (mercado potencial para gama alta) e ingresos y gastos altos (candidatos a servicios premium). Ninguno de estos cuatro perfiles estaba definido de antemano: los reveló el propio algoritmo.

## Autoevaluación

### Tienes un dataset de clientes sin ninguna etiqueta y quieres descubrir qué tipos de comportamiento de compra existen. ¿Qué tipo de aprendizaje encaja?
- [x] Clustering, un método de aprendizaje no supervisado.
- [ ] Aprendizaje supervisado, entrenando con las etiquetas de compra anteriores.
- [ ] Aprendizaje por refuerzo, con una recompensa por cada compra.
> Por qué: no hay etiquetas de partida que indiquen el "tipo" de cada cliente; el objetivo es descubrir esa estructura a partir de la similitud entre observaciones, justo lo que hace el clustering.

### Un conjunto de puntos forma dos anillos concéntricos, uno dentro del otro. ¿Qué enfoque de clustering tiene más probabilidades de separarlos correctamente?
- [ ] Basado en particiones, calculando la distancia de cada punto a dos centroides.
- [x] Basado en densidad, que no asume que los clústeres sean convexos.
- [ ] Cualquiera, porque todos los enfoques dan el mismo resultado en datos bien definidos.
> Por qué: un centroide representa mal una forma de anillo (su media cae en el centro vacío); los métodos basados en densidad no dependen de un punto central y pueden seguir formas irregulares.

### En un clúster, algunas observaciones son más fiables que otras y quieres que pesen más al calcular su punto representativo. ¿Qué usarías en vez del centroide simple?
- [x] El baricentro, una media ponderada por la fiabilidad de cada observación.
- [ ] La mediana de las coordenadas, ignorando los pesos.
- [ ] El punto del clúster más cercano al centroide simple.
> Por qué: el baricentro generaliza el centroide introduciendo un peso $w_i$ por observación; con pesos iguales coincide con el centroide, pero permite dar más influencia a las observaciones más fiables o relevantes.

## Glosario

- **Clúster**: grupo de observaciones que un algoritmo de clustering considera similares entre sí y distintas de las de otros grupos.
- **Homogeneidad interna / separación externa**: los dos objetivos de un buen clustering: que los puntos de un mismo clúster se parezcan y que los de clústeres distintos se diferencien.
- **Baricentro**: punto representativo de un clúster calculado como media ponderada de sus puntos, dando más peso a unas observaciones que a otras.
- **Clustering basado en densidad**: enfoque que define un clúster como una región del espacio con alta concentración de puntos, sin necesidad de un punto central ni de fijar el número de grupos de antemano.
