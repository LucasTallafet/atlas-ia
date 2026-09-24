---
id: espacio-vectorial
estado: borrador
---

## En una frase

Un espacio vectorial es el conjunto de reglas que garantiza que sumar o escalar vectores da siempre otro vector válido; una base es el mínimo de vectores necesario para describir cualquier punto de ese espacio.

## Intuición

Piensa en un sistema de coordenadas como el idioma que usas para describir un lugar: "dos calles al norte, una al este". Ese idioma —los ejes que eliges— es una **base**. El lugar en sí no cambia si describes el camino en otro idioma (otros ejes), pero los números que usas para señalarlo sí cambian.

Un **espacio vectorial** es el escenario donde ese idioma tiene sentido: garantiza que si combinas indicaciones válidas (sumas, escalas) el resultado sigue siendo una indicación válida dentro del mismo mapa. En IA, elegir una base distinta (por ejemplo, con PCA) es literalmente cambiar de idioma para que los datos sean más fáciles de leer.

## Explicación

### Las reglas mínimas para que "sumar" y "escalar" tengan sentido

Un espacio vectorial es un conjunto $\mathbf{V}$ con dos operaciones, suma de vectores y multiplicación por un escalar, que cumplen ocho axiomas. Se agrupan en tres ideas:

- **Clausura**: sumar dos vectores de $\mathbf{V}$, o escalar uno, da siempre otro vector de $\mathbf{V}$; nunca "se sale" del espacio. Esto es lo que garantiza que la salida de una capa de una red neuronal siga siendo un vector que la siguiente capa puede procesar.
- **Leyes de la suma**: la suma es asociativa y conmutativa (el orden no importa), existe un vector neutro $\mathbf{0}$ ($\mathbf{v}+\mathbf{0}=\mathbf{v}$) y cada vector tiene un opuesto $-\mathbf{v}$ que lo deshace.
- **Leyes de la escala**: escalar es asociativo ($ (ab)\mathbf{v}=a(b\mathbf{v})$), se distribuye sobre sumas de escalares y de vectores, y $1\cdot\mathbf{v}=\mathbf{v}$.

En IA, el espacio vectorial habitual es $\mathbb{R}^n$: cada dato con $n$ características es un punto de ese espacio, y los escalares son los números reales.

### Dependencia lineal: cuando un vector no aporta nada nuevo

Un conjunto de vectores es **linealmente dependiente** si al menos uno se puede escribir como combinación lineal de los demás. Si el vector "edad en días" es siempre $365$ veces el vector "edad en años", ambos son dependientes: el segundo no añade información nueva. Esta redundancia, llamada **multicolinealidad**, confunde a los modelos porque no pueden repartir de forma única la contribución de cada característica.

### Base: el mínimo necesario para describir cualquier vector

Una **base** es el conjunto más pequeño de vectores **linealmente independientes** que permite escribir cualquier otro vector del espacio como combinación lineal de ellos. En un espacio de reseñas de películas con solo dos palabras clave, "genial" y "aburrido", la base sería $\{[1,0], [0,1]\}$: toda reseña se describe combinando esos dos vectores. Encontrar una base más útil —que capture mejor la varianza o elimine redundancia— es la idea detrás de técnicas de reducción de dimensionalidad como el PCA.

### Cambio de base: mismo vector, otras coordenadas

Un vector no se mueve al cambiar de base; solo cambian los números que usas para describirlo. Toma $\mathbf{v}=(2,3)$ en la base canónica y la nueva base $B'=\{\mathbf{b}_1=(1,1),\ \mathbf{b}_2=(-1,1)\}$. Buscas $y_1,y_2$ tales que $\mathbf{v}=y_1\mathbf{b}_1+y_2\mathbf{b}_2$:

$$
\begin{cases} y_1 - y_2 = 2 \\ y_1 + y_2 = 3 \end{cases}
\quad\Rightarrow\quad
y_1=2{,}5,\ y_2=0{,}5
$$

El punto sigue en el mismo lugar del plano; solo su "dirección de lectura" cambió. En la base canónica es $(2,3)$; en $B'$ es $(2{,}5;\ 0{,}5)$.

## Formalización

$$
\mathbf{v} \text{ es dependiente de } \{\mathbf{v}_1,\dots,\mathbf{v}_k\} \iff \mathbf{v} = \alpha_1\mathbf{v}_1+\dots+\alpha_k\mathbf{v}_k
\qquad\qquad
\mathbf{v} = y_1\mathbf{b}_1 + y_2\mathbf{b}_2
$$

donde:

- $\mathbf{v}_1,\dots,\mathbf{v}_k$ son vectores del espacio; $\alpha_1,\dots,\alpha_k$ son escalares.
- $\mathbf{b}_1,\mathbf{b}_2$ son los vectores de una base del plano.
- $y_1,y_2$ son las coordenadas de $\mathbf{v}$ en esa base: los escalares que hay que usar para reconstruirlo a partir de $\mathbf{b}_1,\mathbf{b}_2$.

## Interactivo

```widget
motor: vectores2d
modo: base
vectores: [{"nombre": "b1", "xy": [1, 1]}, {"nombre": "b2", "xy": [-1, 1]}]
```

- Prueba a arrastrar $\mathbf{b}_1$ hasta ponerlo justo encima de $\mathbf{b}_2$ (misma dirección): ¿qué parte del plano dejan de poder generar entre los dos?
- Prueba a llevar $\mathbf{b}_2$ a la posición $(2,2)$, alineado con $\mathbf{b}_1$: comprueba que ya no forman una base del plano.
- Prueba a devolver $\mathbf{b}_1$ y $\mathbf{b}_2$ a posiciones no alineadas y observa cómo cualquier punto del plano queda a su alcance con una combinación de ambos.

## En código

```python
import numpy as np

B1 = np.array([1, 1])
B2 = np.array([-1, 1])
M = np.column_stack([B1, B2])   # columnas = vectores de la base
v = np.array([2, 3])

y = np.linalg.solve(M, v)
print("coordenadas en la nueva base:", y)   # [2.5 0.5]
print("independientes:", np.linalg.matrix_rank(M) == 2)  # True
```

## Errores típicos

- **Error**: pensar que la dependencia lineal solo ocurre si dos vectores son idénticos. → **Correcto**: basta con que uno sea combinación lineal de otros (por ejemplo, el doble o la suma de ellos), aunque no se parezcan a primera vista.
- **Error**: creer que cualquier par de vectores de $\mathbb{R}^2$ forma una base. → **Correcto**: solo si son linealmente independientes (no apuntan en la misma dirección ni en direcciones opuestas); si no, no cubren el plano completo.
- **Error**: pensar que al cambiar de base el vector "se mueve". → **Correcto**: el vector ocupa el mismo lugar; solo cambian las coordenadas con las que lo describes.
- **Error**: creer que más características siempre dan más información. → **Correcto**: si una característica es combinación lineal de otras (multicolinealidad), no aporta nada nuevo, aunque aumente el número de columnas.

## En resumen

- **Qué es:** un espacio vectorial es un conjunto donde sumar vectores y escalarlos siempre da resultados válidos dentro del mismo conjunto (clausura), con reglas fijas para esas operaciones.
- **Dependencia lineal:** un vector es redundante si se puede escribir como combinación lineal de otros; eso causa multicolinealidad.
- **Base:** el conjunto mínimo de vectores independientes que permite describir cualquier vector del espacio.
- **Cambio de base:** el vector no cambia de lugar; solo cambian sus coordenadas, según los ejes que elijas para describirlo.
- **Para qué sirve en IA:** elegir una base distinta (como en PCA) puede eliminar redundancia, separar mejor las clases o simplificar el descenso de gradiente.
- **Trampa:** dos vectores alineados nunca forman una base del plano, aunque sean distintos entre sí.

## A fondo

### Por qué cambiar de base ayuda a los algoritmos

Cambiar de base no altera los datos, pero puede alinear la representación con el problema que se quiere resolver. Sirve para **decorrelacionar variables** (características muy correlacionadas vuelven inestable a la regresión lineal), para que las **distancias** entre puntos reflejen mejor la estructura real de los datos (crítico en $k$-means o $k$-NN), para acelerar la **optimización numérica** (un descenso de gradiente evita zigzags cuando las variables están en escalas equilibradas y sin redundancias) y para **extraer factores latentes**, como hacen el PCA, el ICA o los autoencoders al buscar un sistema de referencia que concentre la información en menos dimensiones.

### Ejemplo con significado: "total" y "equilibrio"

Un estudiante que dedica 4 horas a estudiar y 6 a descansar es el vector $(4,6)$ en la base canónica. Si eliges la base $\mathbf{b}_1=(1,1)$ (total de horas) y $\mathbf{b}_2=(1,-1)$ (diferencia entre estudio y descanso), el mismo vector se describe como $(5,-1)$: cinco horas en total, con un desequilibrio de $-1$ (más descanso que estudio). No cambió nada del estudiante; cambió la pregunta que la representación responde directamente.

## Autoevaluación

### Un vector "tamaño en pies cuadrados" es siempre el resultado de multiplicar "tamaño en metros cuadrados" por una constante. ¿Qué relación guardan ambos vectores?
- [ ] Son ortogonales.
- [x] Son linealmente dependientes: uno es un escalar multiplicado por el otro.
- [ ] Forman una base del espacio de dos características.
> Por qué: si un vector es siempre el escalado de otro, se puede escribir como combinación lineal de él (con un solo término), así que son dependientes y no aportan información independiente entre sí.

### ¿Cuántos vectores necesitas, como mínimo, para formar una base de $\mathbb{R}^2$ que permita describir cualquier punto del plano?
- [ ] Uno, si es lo bastante largo.
- [x] Dos, siempre que no estén alineados entre sí.
- [ ] Tantos como puntos quieras describir.
> Por qué: una base es el conjunto *mínimo* de vectores independientes que genera el espacio completo; en el plano, dos vectores no alineados ya alcanzan cualquier punto mediante combinaciones lineales.

### Expresas $\mathbf{v}=(2,3)$ en la base $B'=\{(1,1),(-1,1)\}$ y obtienes $(2{,}5;\ 0{,}5)$. ¿Qué ha ocurrido con el vector $\mathbf{v}$?
- [ ] Se ha desplazado a una nueva posición del plano.
- [x] Sigue en el mismo punto del plano; solo cambiaron las coordenadas con las que se describe.
- [ ] Se ha convertido en dos vectores distintos.
> Por qué: cambiar de base no mueve los vectores, solo cambia el sistema de referencia con el que se leen sus coordenadas.

### ¿Por qué el PCA busca una nueva base en vez de quedarse con los ejes originales de los datos?
- [ ] Porque los ejes originales nunca son válidos matemáticamente.
- [x] Porque una base adaptada a los datos puede concentrar la varianza en menos dimensiones y reducir la redundancia entre variables correlacionadas.
- [ ] Porque cambiar de base siempre reduce el número de datos disponibles.
> Por qué: el objetivo del PCA es encontrar ejes donde la información esté menos repartida y menos correlacionada que en la base original, no cambiar los datos en sí.

## Glosario

- **Espacio vectorial**: conjunto de vectores donde sumar y escalar siempre da resultados dentro del mismo conjunto, según reglas fijas (axiomas).
- **Clausura**: propiedad por la que sumar o escalar vectores del espacio nunca produce algo fuera de él.
- **Dependencia lineal**: cuando un vector se puede escribir como combinación lineal de otros del mismo conjunto.
- **Independencia lineal**: cuando ningún vector del conjunto se puede escribir como combinación lineal de los demás.
- **Base**: conjunto mínimo de vectores linealmente independientes que genera el espacio completo.
- **Cambio de base**: describir los mismos vectores con otras coordenadas, respecto a una base distinta.
- **Multicolinealidad**: redundancia entre variables (columnas) que son combinación lineal unas de otras.
