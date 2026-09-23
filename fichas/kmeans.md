---
id: kmeans
estado: revisada
---

## En una frase

K-Means reparte los datos en $k$ grupos repitiendo dos pasos: asignar cada punto al centro más cercano y mover cada centro a la media de sus puntos.

## Intuición

Imagina que una ciudad quiere abrir tres ambulatorios y conoce dónde vive cada vecino. Colocas los tres edificios en cualquier sitio. Cada vecino acude al que tiene más cerca. Luego mueves cada edificio al punto medio de quienes acuden a él. Algunos vecinos tienen ahora otro ambulatorio más cerca y cambian. Repites hasta que nadie cambia.

Eso es K-Means. Es el algoritmo de [[clustering]] más usado porque es rápido, fácil de entender y sus centros se interpretan como el "vecino típico" de cada grupo: por ejemplo, el perfil medio de un segmento de clientes.

## Explicación

### El problema: repartir en $k$ grupos compactos

Tienes $n$ puntos sin etiquetas y quieres dividirlos en $k$ grupos **disjuntos**: cada punto pertenece a un único clúster. Esa es la idea del **clustering basado en particiones**. Cada grupo se resume con un **centroide**, un punto que actúa como su representante. Un buen reparto deja cada punto cerca de su centroide.

### El algoritmo en cuatro fases

1. **Inicialización.** Se eligen $k$ centroides iniciales, por ejemplo $k$ puntos del conjunto al azar.
2. **Asignación.** Cada punto se asigna al centroide más cercano, normalmente con la distancia euclídea.
3. **Reajuste.** Cada centroide se mueve a la media de los puntos que tiene asignados.
4. **Convergencia.** Se repiten la asignación y el reajuste hasta que los centroides dejan de moverse (o apenas cambian), o hasta un número máximo de iteraciones.

### Un ejemplo que puedes seguir de cabeza

Toma cuatro puntos: $A=(1,1)$, $B=(2,1)$, $C=(4,3)$ y $D=(5,4)$, con $k=2$. Empieza con los centroides en $A$ y en $B$.

- Asignación: $A$ va al primer centroide; $B$, $C$ y $D$, al segundo.
- Reajuste: el primero se queda en $(1,1)$; el segundo pasa a la media de $B$, $C$ y $D$, $(3{,}67;\ 2{,}67)$.
- Asignación: ahora $B$ está a distancia al cuadrado $1$ del primero y $5{,}56$ del segundo, así que cambia de grupo. Quedan $\{A,B\}$ y $\{C,D\}$.
- Reajuste: los centroides pasan a $(1{,}5;\ 1)$ y $(4{,}5;\ 3{,}5)$. Una nueva asignación no cambia nada: el algoritmo ha convergido.

### Qué optimiza

Cada paso reduce (o deja igual) la suma de distancias al cuadrado de cada punto a su centroide. Esa suma se llama **inercia** o **WCSS** (*within-cluster sum of squares*). En el ejemplo final vale $0{,}25+0{,}25+0{,}5+0{,}5 = 1{,}5$.

### Cómo elegir $k$: el método del codo

K-Means necesita $k$ de antemano. Con un $k$ demasiado pequeño mezclas grupos distintos; con uno demasiado grande fragmentas grupos reales.

El **método del codo** (*elbow method*) ejecuta K-Means para varios $k$ y dibuja la WCSS frente a $k$. Al principio la WCSS baja deprisa; a partir de cierto $k$ la ganancia se vuelve pequeña y la curva se aplana, formando un "codo". Ese $k$ equilibra compacidad y sencillez. En los cuatro puntos del ejemplo, la WCSS vale $16{,}75$ con $k=1$, $1{,}5$ con $k=2$ y $0{,}5$ con $k=3$: el codo está en $k=2$.

La lectura del codo es subjetiva, porque no siempre se ve una curva clara. Conviene complementarla con otras medidas, como el coeficiente de silueta, que verás en [[evaluacion-clustering]].

### Ventajas y limitaciones

K-Means es rápido: su coste crece linealmente con el número de puntos y de clústeres. Sus limitaciones son igual de importantes:

- **Depende de la inicialización.** Un mal inicio lleva a soluciones peores. Se mitiga con **K-Means++**, que reparte los centroides iniciales, y ejecutándolo varias veces.
- **Supone clústeres esféricos** de tamaño parecido. Falla con anillos o formas no convexas, donde van mejor DBSCAN o el clustering jerárquico.
- **Es sensible a la escala**: una variable con valores grandes domina la distancia. Hay que estandarizar antes.
- **Los atípicos arrastran los centroides**, porque la media es sensible a ellos.

## Formalización

K-Means busca la partición que minimiza

$$
J = \sum_{i=1}^{k} \sum_{\mathbf{x}_j \in C_i} \lVert \mathbf{x}_j - \boldsymbol{\mu}_i \rVert^2
$$

donde:

- $J$ es la inercia o WCSS: la suma de distancias euclídeas al cuadrado de cada punto a su centroide.
- $k$ es el número de clústeres.
- $C_i$ es el conjunto de puntos asignados al clúster $i$.
- $\mathbf{x}_j$ es un punto de datos.
- $\boldsymbol{\mu}_i$ es el centroide del clúster $C_i$.

El paso de reajuste coloca cada centroide en la media de su clúster:

$$
\boldsymbol{\mu}_i = \frac{1}{\lvert C_i \rvert} \sum_{\mathbf{x}_j \in C_i} \mathbf{x}_j
$$

donde:

- $\lvert C_i \rvert$ es el número de puntos del clúster $C_i$.

## Interactivo

```widget
motor: dispersion2d
modo: kmeans
dataset: {"generador": "blobs", "n": 150, "ruido": 0.28, "clases": 4, "semilla": 5}
controles: [{"nombre": "k", "min": 1, "max": 8, "paso": 1, "valor": 3, "etiqueta": "número de clústeres k"}]
paso_a_paso: true
```

- Prueba a pulsar «Paso →» varias veces y observa cómo alternan asignar y mover, y cómo baja $J$ hasta que ningún punto cambia.
- Prueba a pulsar «Otro inicio al azar» con inicio aleatorio hasta que el resultado final sea peor (rombo por encima de la curva del codo); luego cambia a k-means++.
- Prueba a subir $k$ de 1 a 8 mirando la gráfica del codo: ¿a partir de qué $k$ deja de bajar mucho $J$?

## En código

```python
import numpy as np
from sklearn.cluster import KMeans

X = np.array([[1, 1], [2, 1], [4, 3], [5, 4]])
km = KMeans(n_clusters=2, init=X[:2], n_init=1).fit(X)
print(km.labels_)           # [0 0 1 1]
print(km.cluster_centers_)  # [[1.5 1. ] [4.5 3.5]]
print(km.inertia_)          # 1.5

# Método del codo: inercia para cada k
for k in (1, 2, 3):
    print(k, round(KMeans(n_clusters=k, n_init=10, random_state=0).fit(X).inertia_, 2))
# 1 16.75 · 2 1.5 · 3 0.5
```

## Errores típicos

- **Error**: aplicar K-Means sin estandarizar variables con escalas muy distintas. → **Correcto**: estandariza antes (por ejemplo, con `StandardScaler`); si no, la variable de mayor rango decide los grupos.
- **Error**: elegir el $k$ con la inercia más baja. → **Correcto**: la inercia siempre baja al aumentar $k$ (con $k=n$ vale 0); se busca el codo, donde deja de compensar añadir clústeres.
- **Error**: fiarse de una sola ejecución. → **Correcto**: el resultado depende del inicio; usa K-Means++ y varias inicializaciones (`n_init`) y quédate con la de menor inercia.
- **Error**: usar K-Means para grupos con forma de anillo o de luna. → **Correcto**: K-Means asume grupos esféricos; para formas no convexas usa DBSCAN o clustering jerárquico.

## En resumen

- **Qué hace:** reparte datos sin etiquetas en $k$ grupos disjuntos, cada uno resumido por su centroide (el "miembro típico" del grupo).
- **Algoritmo:** eliges $k$ centroides iniciales → asignas cada punto al más cercano → mueves cada centroide a la media de sus puntos → repites hasta que nada cambia.
- **Qué minimiza:** la inercia o WCSS, $J = \sum_i \sum_{\mathbf{x}_j \in C_i} \lVert \mathbf{x}_j - \boldsymbol{\mu}_i \rVert^2$.
- **Cómo elegir $k$:** método del codo (dibuja $J$ frente a $k$ y busca dónde se aplana), complementado con el coeficiente de silueta. Nunca el $k$ de menor inercia: siempre baja al subir $k$.
- **Antes de usarlo:** estandariza las variables; si no, la de mayor escala decide los grupos.
- **Cuándo no:** clústeres no esféricos (anillos, lunas) o de tamaños muy distintos, y datos con atípicos, que arrastran los centroides.
- **Trampa:** el resultado depende del inicio; usa K-Means++ y varias inicializaciones (`n_init`) y quédate con la de menor inercia.

## A fondo

### La clase `KMeans` de scikit-learn

Parámetros clave: `n_clusters` (el $k$, por defecto 8), `init` (`'k-means++'` por defecto, `'random'` o una matriz de centroides), `n_init` (cuántas inicializaciones se prueban; se conserva la de menor inercia), `max_iter` (por defecto 300) y `tol` (tolerancia de convergencia, por defecto $10^{-4}$).

Tras `fit(X)` tienes `labels_` (clúster de cada punto), `cluster_centers_` (centroides), `inertia_` (WCSS) y `n_iter_` (iteraciones hasta converger). `predict` asigna puntos nuevos al centroide más cercano y `fit_predict` ajusta y etiqueta en una sola llamada. Si estandarizaste los datos, `scaler.inverse_transform(km.cluster_centers_)` devuelve los centroides en las unidades originales, que son los que se interpretan.

### Aplicaciones

El curso cita la segmentación de clientes (frecuentes, ocasionales, potenciales), la segmentación de imágenes agrupando píxeles por color (también en imagen médica), la detección de comunidades en redes sociales, el agrupamiento de genes con patrones de expresión parecidos, la segmentación geográfica, la detección de transacciones anómalas y la agrupación de productos con demanda similar.

:::ampliacion
### G-Means: dejar que los datos elijan $k$

G-Means evita fijar $k$ a mano. Parte de pocos clústeres y comprueba cada uno con un test estadístico: si sus puntos parecen seguir una distribución normal (gaussiana), el clúster se acepta; si no, se parte en dos.

Para cada clúster, G-Means lanza un K-Means con $k=2$ dentro de él y proyecta sus puntos sobre la recta que une los dos centros hijos. Sobre esa proyección de una dimensión aplica el test de normalidad de Anderson-Darling. Si el test rechaza la normalidad, sustituye el centro por los dos hijos. El proceso se repite hasta que ningún clúster se divide, y el $k$ final es el número de clústeres aceptados.

Fuente: Hamerly, G. y Elkan, C. (2003). *Learning the k in k-means*. Advances in Neural Information Processing Systems 16 (NIPS 2003).
:::

## Autoevaluación

### Tras un paso de asignación, un clúster tiene los puntos $(0,0)$, $(2,0)$ y $(4,6)$. ¿Dónde queda su centroide tras el reajuste?
- [ ] En $(0,0)$, el primer punto del clúster.
- [x] En $(2,2)$, la media de sus puntos.
- [ ] En $(2,0)$, el punto del clúster más cercano al centro.
> Por qué: el reajuste coloca el centroide en la media: $((0+2+4)/3,\ (0+0+6)/3) = (2, 2)$. No tiene por qué coincidir con ningún punto de los datos.

### La WCSS vale 900 con $k=1$, 300 con $k=2$, 120 con $k=3$, 105 con $k=4$ y 95 con $k=5$. ¿Qué $k$ sugiere el método del codo?
- [ ] $k=5$, porque tiene la WCSS más baja.
- [x] $k=3$, porque a partir de ahí la WCSS apenas baja.
- [ ] $k=1$, porque es el modelo más sencillo.
> Por qué: la WCSS siempre baja al añadir clústeres; el codo está donde la mejora pasa de grande (de 300 a 120) a pequeña (de 120 a 105).

### Agrupas clientes por edad (18-80) e ingresos anuales (10 000-200 000 €) sin estandarizar. ¿Qué pasará?
- [ ] Los grupos dependerán principalmente de la edad, porque es la primera variable.
- [x] Los grupos dependerán casi solo de los ingresos, porque dominan la distancia euclídea.
- [ ] Nada: K-Means es insensible a la escala.
> Por qué: una diferencia de miles de euros pesa muchísimo más en la distancia que una diferencia de años; por eso hay que estandarizar antes.

### Ejecutas K-Means dos veces con el mismo $k$ y obtienes grupos distintos. ¿Por qué?
- [x] Porque partió de centroides iniciales distintos y cayó en soluciones diferentes.
- [ ] Porque el algoritmo no ha convergido nunca.
- [ ] Porque K-Means asigna los puntos al azar en cada iteración.
> Por qué: la asignación y el reajuste son deterministas, pero el resultado depende del inicio. Por eso se usan K-Means++ y varias inicializaciones.

## Glosario

- **Clustering basado en particiones**: familia de algoritmos que divide los datos en grupos disjuntos, cada uno con un representante.
- **K-Means**: algoritmo que alterna asignar cada punto al centroide más cercano y mover cada centroide a la media de su grupo.
- **Centroide**: punto representativo de un clúster; en K-Means, la media de sus puntos.
- **Inercia (WCSS)**: suma de distancias al cuadrado de cada punto a su centroide; mide la compacidad de los clústeres.
- **Método del codo**: elegir $k$ en el punto donde la WCSS deja de bajar de forma notable al aumentar $k$.
- **K-Means++**: inicialización que elige centroides iniciales separados entre sí para mejorar el resultado y la convergencia.
- **G-Means**: variante que elige $k$ dividiendo los clústeres que no superan un test de normalidad.
