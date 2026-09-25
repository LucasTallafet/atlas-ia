---
id: clustering-jerarquico
estado: borrador
---

## En una frase

El clustering jerárquico construye un árbol de fusiones sucesivas entre observaciones, sin fijar de antemano cuántos grupos quieres, y ese árbol se lee en un dendrograma.

## Intuición

Piensa en un árbol genealógico: dos primos se agrupan con sus padres en su generación, esos padres se agrupan con los abuelos, y así hasta llegar a un antepasado común. El árbol no dice "hay tres familias" de antemano: te deja elegir en qué generación cortar según cuánta cercanía te interese.

El clustering jerárquico hace lo mismo con datos sin etiquetar: en vez de fijar un número de grupos como en [[kmeans|K-Means]], construye toda la jerarquía de fusiones, de lo más parecido a lo más distinto, y te deja decidir después cuántos grupos quieres ver. Esto es especialmente útil cuando no sabes de antemano cuántos clústeres esperar, o cuando la propia estructura en niveles —especie, género, familia; o cliente, segmento, mercado— es justo lo que te interesa.

## Explicación

### De observaciones sueltas a un único árbol (método aglomerativo)

El enfoque más usado, el **aglomerativo**, empieza tratando cada observación como su propio clúster. En cada paso calcula qué dos clústeres están más cerca y los fusiona, hasta que todo queda en un solo grupo. El proceso completo tiene cuatro fases: calcular la matriz de distancias entre observaciones, fusionar iterativamente los clústeres más cercanos, construir el dendrograma con el historial de fusiones y, por último, elegir un punto de corte para fijar el número de clústeres.

El enfoque contrario, el **método divisivo**, parte de un único clúster con todas las observaciones y lo va dividiendo hasta que cada una queda sola. Es menos habitual porque su coste computacional es mayor; el resto de esta ficha se centra en el aglomerativo.

### Criterios de enlace: cómo medir la distancia entre grupos

Fusionar dos clústeres exige decidir qué significa "estar cerca" cuando cada uno tiene varios puntos. Esa regla es el **criterio de enlace (linkage)**, y cambia el resultado aunque los datos sean los mismos:

- **Enlace simple**: la distancia entre grupos es la del par de puntos más cercano. Detecta patrones encadenados, pero tiende a producir clústeres alargados e irregulares.
- **Enlace completo**: usa la distancia del par más lejano, lo que da clústeres compactos y de tamaño más uniforme.
- **Enlace promedio**: promedia todas las distancias entre puntos de ambos grupos, un equilibrio entre los dos anteriores.
- **Enlace de Ward**: fusiona el par que menos incrementa la varianza dentro de los clústeres. Es el más usado en la práctica porque tiende a dar grupos homogéneos y bien separados.

### Leer un dendrograma

En el dendrograma, cada fusión aparece como un nodo, y su altura representa la distancia (según el criterio de enlace elegido) entre los dos clústeres que se combinan. Para elegir el número de clústeres, se traza una línea horizontal en el nivel donde las fusiones son más grandes: un salto brusco en la altura indica que los grupos combinados en ese punto eran claramente distintos, así que cortar justo antes conserva esa separación real.

### Ventajas, límites y cuándo usarlo

El clustering jerárquico permite explorar varias granularidades sin repetir la ejecución con distintos parámetros, y al ser determinista siempre da el mismo resultado sobre los mismos datos. A cambio, su coste crece de forma cuadrática con el número de observaciones, lo que lo hace poco práctico en datasets grandes; también es sensible al ruido y a los valores atípicos, que pueden distorsionar el árbol, y no se adapta bien a clústeres de formas complejas o densidades muy distintas, terreno donde [[dbscan|DBSCAN]] funciona mejor.

## Formalización

$$
d(A,B) = \min_{\mathbf{x}_i \in A,\, \mathbf{x}_j \in B} \lVert \mathbf{x}_i - \mathbf{x}_j \rVert \quad \text{(enlace simple)}
$$
$$
d(A,B) = \max_{\mathbf{x}_i \in A,\, \mathbf{x}_j \in B} \lVert \mathbf{x}_i - \mathbf{x}_j \rVert \quad \text{(enlace completo)}
$$
$$
d(A,B) = \frac{1}{|A||B|}\sum_{\mathbf{x}_i \in A}\sum_{\mathbf{x}_j \in B} \lVert \mathbf{x}_i - \mathbf{x}_j \rVert \quad \text{(enlace promedio)}
$$

donde:

- $A, B$ son dos clústeres candidatos a fusionarse.
- $\mathbf{x}_i, \mathbf{x}_j$ son los puntos de cada clúster.
- $|A|, |B|$ son sus tamaños (número de puntos).
- $\lVert \cdot \rVert$ es la distancia euclídea (u otra métrica elegida).

$$
\Delta(A,B) = \frac{n_A n_B}{n_A + n_B} \lVert \boldsymbol{\mu}_A - \boldsymbol{\mu}_B \rVert^2 \quad \text{(criterio de Ward)}
$$

donde:

- $\Delta(A,B)$ es el incremento en la varianza intra-clúster total si se fusionan $A$ y $B$; el algoritmo elige en cada paso el par que lo minimiza.
- $n_A, n_B$ son los tamaños de los clústeres y $\boldsymbol{\mu}_A, \boldsymbol{\mu}_B$ sus centroides (ver [[clustering]]).
- Muchas implementaciones, como scipy, representan esa fusión con la distancia $\sqrt{2\Delta(A,B)}$, para que sea comparable con las alturas de los otros enlaces.

Con cuatro puntos $A=(1,1)$, $B=(1,2)$, $C=(5,5)$, $D=(5,6)$, las fusiones $\{A,B\}$ y $\{C,D\}$ ocurren primero, ambas a distancia $1$. La fusión final, entre esos dos pares, ya depende del criterio: enlace simple da $5{,}00$, promedio $5{,}68$, completo $6{,}40$ y Ward $8{,}00$ —los cuatro describen la misma estructura de datos, pero con alturas distintas.

## Interactivo

```widget
motor: dispersion2d
modo: jerarquico
dataset: {"generador": "blobs", "n": 60, "ruido": 0.4, "clases": 3, "semilla": 4}
controles: [{"nombre": "corte", "min": 0, "max": 15, "paso": 0.5, "valor": 6, "etiqueta": "altura de corte"}]
arrastrables: true
```

- Prueba a arrastrar la línea de corte hacia arriba y hacia abajo: fíjate en cuántos clústeres resultan a cada altura.
- Prueba a colocar el corte justo antes del salto más grande entre dos fusiones consecutivas.
- Prueba a comparar el dendrograma con el resultado que darían tres centroides de K-Means sobre el mismo dataset.

## En código

```python
import numpy as np
from scipy.cluster.hierarchy import linkage

X = np.array([[1, 1], [1, 2], [5, 5], [5, 6]])
for metodo in ["single", "complete", "average", "ward"]:
    Z = linkage(X, method=metodo)
    print(f"{metodo:9s} altura final de fusión = {Z[-1, 2]:.2f}")
# single    altura final de fusión = 5.00
# complete  altura final de fusión = 6.40
# average   altura final de fusión = 5.68
# ward      altura final de fusión = 8.00
```

## Errores típicos

- **Error**: pensar que el clustering jerárquico necesita fijar $k$ de antemano. → **Correcto**: no lo necesita para construir el árbol; el número de grupos se decide después, cortando el dendrograma a la altura que interese.
- **Error**: comparar la altura de corte entre dendrogramas construidos con criterios de enlace distintos. → **Correcto**: cada enlace mide la distancia de fusión de forma distinta (mínima, máxima, media o incremento de varianza), así que la misma altura no significa lo mismo en dos dendrogramas.
- **Error**: aplicar clustering jerárquico sin más a datasets con decenas de miles de observaciones. → **Correcto**: su coste crece de forma cuadrática con el número de puntos; en datasets grandes conviene otro método o trabajar con una muestra.
- **Error**: asumir que el enlace simple da siempre los mejores resultados por ser el más sencillo de calcular. → **Correcto**: tiende a producir clústeres alargados y en cadena; el enlace completo o el de Ward suelen dar grupos más compactos y equilibrados.

## En resumen

- **Qué hace**: construye un árbol de fusiones sucesivas entre observaciones (dendrograma), sin fijar de antemano el número de clústeres.
- **Cómo funciona**: cada punto empieza siendo su propio clúster → se calcula la matriz de distancias → se fusionan en cada paso los dos clústeres más cercanos según un criterio de enlace → se repite hasta formar un único clúster.
- **Fórmula clave**: el criterio de Ward fusiona el par que menos incrementa la varianza intra-clúster, $\Delta(A,B)=\frac{n_A n_B}{n_A+n_B}\lVert \boldsymbol{\mu}_A-\boldsymbol{\mu}_B\rVert^2$.
- **Cuándo usarlo**: en datasets pequeños o medianos donde interesa explorar la estructura en varios niveles de granularidad sin comprometerse a un número de grupos.
- **Cuándo no**: en datasets grandes (coste cuadrático) o cuando ya sabes cuántos grupos buscas y solo te interesa el resultado final.
- **Decisiones que importan**: la métrica de distancia y, sobre todo, el criterio de enlace, porque cada uno da dendrogramas distintos con los mismos datos.
- **Trampa principal**: la altura de corte no es comparable entre dendrogramas construidos con criterios de enlace distintos.

## A fondo

### En Scikit-learn

La clase `AgglomerativeClustering` de `sklearn.cluster` implementa el método aglomerativo. Sus parámetros principales son `n_clusters` (número final de grupos, si se fija de antemano), `linkage` (`'ward'`, `'complete'`, `'average'` o `'single'`) y `distance_threshold` (alternativa a `n_clusters`: fusiona hasta alcanzar ese umbral de distancia, sin fijar el número de grupos). El atributo `labels_` guarda el clúster asignado a cada punto. Para dibujar el dendrograma se usa `scipy.cluster.hierarchy.dendrogram` junto con `linkage`, que es lo que se ha usado en el ejemplo de código de esta ficha.

### Aplicaciones

El clustering jerárquico se usa en **biología y genética** para construir taxonomías evolutivas o agrupar genes con funciones similares; en **marketing**, para segmentar clientes en niveles cada vez más específicos; y en **procesamiento de texto**, para organizar documentos o términos según su similitud semántica, aprovechando precisamente la estructura en niveles que ofrece el dendrograma.

## Autoevaluación

### Tienes un dendrograma construido con enlace simple sobre dos grupos alargados que casi se tocan por un extremo. ¿Qué es más probable que ocurra?
- [x] Que el enlace simple los una en un solo clúster, porque basta con que un par de puntos cercanos en el extremo se toquen.
- [ ] Que el enlace simple los separe mejor que el enlace completo, por ser más sencillo.
- [ ] Que el resultado sea idéntico al del enlace completo.
> Por qué: el enlace simple mide la distancia mínima entre puntos de dos clústeres, así que un puente estrecho de puntos cercanos basta para fusionar dos grupos que, en conjunto, están bien separados: es el efecto de "encadenamiento".

### En un dendrograma, la fusión final ocurre a una altura mucho mayor que las fusiones intermedias. ¿Qué sugiere esto?
- [ ] Que hay que usar tantos clústeres como observaciones.
- [x] Que cortar justo antes de esa fusión final probablemente separa dos grupos claramente distintos.
- [ ] Que el clustering jerárquico ha fallado y no se puede interpretar.
> Por qué: un salto grande en la altura de fusión indica que los dos últimos grupos combinados eran muy distintos entre sí; cortar el dendrograma justo antes de ese salto conserva esa separación real.

### A diferencia de K-Means, ¿qué no necesitas decidir antes de ejecutar un clustering jerárquico aglomerativo?
- [x] El número de clústeres.
- [ ] La métrica de distancia entre puntos.
- [ ] El criterio de enlace.
> Por qué: el número de grupos se decide después, cortando el dendrograma a la altura que interese; la métrica y el criterio de enlace sí hay que fijarlos antes, porque determinan cómo se construye el árbol.

### Tienes 200.000 observaciones que necesitas agrupar con frecuencia en un pipeline en producción. ¿Por qué el clustering jerárquico aglomerativo clásico no es buena idea aquí?
- [ ] Porque no puede manejar datos numéricos.
- [x] Porque su coste computacional crece al menos de forma cuadrática con el número de observaciones.
- [ ] Porque siempre necesita etiquetas para funcionar.
> Por qué: calcular y actualizar la matriz de distancias entre todas las observaciones hace que el método escale mal; con cientos de miles de puntos conviene otro algoritmo o trabajar con una muestra.

## Glosario

- **Dendrograma**: diagrama en árbol que muestra el orden y la altura (distancia) a la que se fusionan los clústeres en el clustering jerárquico.
- **Criterio de enlace (linkage)**: regla que define cómo se mide la distancia entre dos clústeres al decidir si fusionarlos.
- **Enlace de Ward**: criterio de enlace que fusiona en cada paso el par de clústeres que menos incrementa la varianza intra-clúster total.
- **Método aglomerativo / divisivo**: el aglomerativo construye el árbol de abajo arriba fusionando observaciones; el divisivo lo construye de arriba abajo dividiendo un único clúster inicial.
