---
id: matrices
estado: borrador
---

## En una frase

Una matriz es una tabla de números que guarda muchos vectores a la vez y que, multiplicada por un vector, actúa como una máquina que lo transforma en otro.

## Intuición

Piensa en una matriz como una hoja de cálculo: cada fila es un caso (un correo, un estudiante) y cada columna una característica. Pero una matriz es más que un almacén de datos: si la usas para multiplicar un vector, se convierte en una **regla de transformación**, una "máquina" que toma un vector de entrada y devuelve otro, combinando sus componentes según reglas fijas. Esa doble vida —tabla y máquina— es la razón de que las matrices estén en el centro de casi cualquier cálculo de una red neuronal.

## Explicación

### Suma, escalar y transposición

Sumar dos matrices, o multiplicar una por un escalar, se hace elemento a elemento, igual que con vectores; para sumar, ambas deben tener las mismas dimensiones. La **transpuesta** $\mathbf{A}^T$ de una matriz $\mathbf{A}$ de $m\times n$ intercambia filas por columnas y queda de $n\times m$: la primera fila de $\mathbf{A}$ se convierte en la primera columna de $\mathbf{A}^T$.

### Multiplicar una matriz por un vector: fila por columna

La operación más importante es la multiplicación. Para multiplicar $\mathbf{A}$ ($m\times n$) por $\mathbf{B}$ ($n\times p$) el número de columnas de la primera debe coincidir con el número de filas de la segunda; el resultado es $m\times p$. Cada elemento del resultado es el producto escalar de una fila de $\mathbf{A}$ por una columna de $\mathbf{B}$.

Con $\mathbf{A}=\begin{bmatrix}1&2&3\\0&1&4\\5&6&0\end{bmatrix}$ y $\mathbf{v}=\begin{bmatrix}1\\2\\3\end{bmatrix}$: la primera fila da $1{\cdot}1+2{\cdot}2+3{\cdot}3=14$, la segunda $0{\cdot}1+1{\cdot}2+4{\cdot}3=14$ y la tercera $5{\cdot}1+6{\cdot}2+0{\cdot}3=17$. El resultado, $\mathbf{A}\mathbf{v}=(14,14,17)$, es un nuevo vector: $\mathbf{A}$ ha actuado como una transformación sobre $\mathbf{v}$. Esta misma operación, repetida entre la matriz de pesos y el vector de activaciones de una capa, es lo que propaga la información en una red neuronal.

### Tipos especiales de matrices

Algunas matrices tienen propiedades que simplifican los cálculos:

| Tipo | Definición | Por qué importa |
|---|---|---|
| Identidad $\mathbf{I}$ | unos en la diagonal, ceros fuera | $\mathbf{A}\mathbf{I}=\mathbf{A}$; es el "1" de las matrices |
| Nula $\mathbf{0}$ | todos los elementos cero | elemento neutro de la suma |
| Diagonal | ceros fuera de la diagonal | multiplicar por ella equivale a escalar cada componente por separado |
| Simétrica | $\mathbf{A}=\mathbf{A}^T$ | autovalores siempre reales; las matrices de covarianza y correlación lo son |
| Ortogonal $\mathbf{Q}$ | $\mathbf{Q}\mathbf{Q}^T=\mathbf{I}$ | solo rota o refleja, sin deformar: conserva longitudes y ángulos |

Las matrices ortogonales son las que usa el PCA para definir los nuevos ejes: al ser una simple rotación de la base original, no distorsionan las distancias relativas entre los datos.

### El rango: cuánta información nueva hay realmente

El **rango** de una matriz es el número máximo de filas o columnas linealmente independientes. Si una columna es el doble de otra, no cuenta como información nueva. En $\mathbf{A}=\begin{bmatrix}1&2&3\\2&4&6\\1&1&1\end{bmatrix}$ la segunda fila es el doble de la primera, así que solo dos filas son independientes: el rango es $2$, aunque la matriz tenga tres filas. Un rango menor que el número de columnas señala columnas redundantes, como "tamaño en metros" y "tamaño en pies".

### La norma de Frobenius: el tamaño de toda una matriz

Igual que un vector tiene una norma, una matriz completa tiene la **norma de Frobenius**, la extensión natural de la norma $L_2$: la raíz de la suma de los cuadrados de todos sus elementos. Para $\mathbf{W}=\begin{bmatrix}1&2&0\\-1&3&4\\2&0&-2\end{bmatrix}$, la suma de cuadrados es $1+4+0+1+9+16+4+0+4=39$, así que $\lVert\mathbf{W}\rVert_F=\sqrt{39}\approx6{,}24$. En una red neuronal, penalizar esta norma sobre la matriz de pesos de una capa completa es una forma de regularización, igual que la $L_2$ penaliza un vector de pesos.

## Formalización

$$
(\mathbf{A}+\mathbf{B})_{ij} = a_{ij}+b_{ij}
\qquad
c_{ij} = \sum_{k=1}^n a_{ik}b_{kj}
\qquad
\lVert\mathbf{A}\rVert_F = \sqrt{\sum_{i=1}^m\sum_{j=1}^n a_{ij}^2}
$$

donde:

- $\mathbf{A}, \mathbf{B}$ son matrices; $a_{ij}$, $b_{ij}$ son sus elementos en la fila $i$, columna $j$.
- $c_{ij}$ es el elemento de la fila $i$, columna $j$ del producto $\mathbf{A}\mathbf{B}$.
- $n$ es el número de columnas de $\mathbf{A}$ (que debe coincidir con el número de filas de $\mathbf{B}$).
- $m, n$ son, respectivamente, el número de filas y columnas de $\mathbf{A}$ en la norma de Frobenius.

## Interactivo

```widget
motor: pasos
---
Partimos de la matriz $\mathbf{A}$ y el vector $\mathbf{v}$:

$$\mathbf{A} = \begin{bmatrix}1&2&3\\0&1&4\\5&6&0\end{bmatrix}, \quad \mathbf{v}=\begin{bmatrix}1\\2\\3\end{bmatrix}$$
---
**Fila 1** de $\mathbf{A}$ contra $\mathbf{v}$: multiplicamos posición a posición y sumamos.

$1\cdot1 + 2\cdot2 + 3\cdot3 = 1+4+9 = 14$
---
**Fila 2** de $\mathbf{A}$ contra $\mathbf{v}$:

$0\cdot1 + 1\cdot2 + 4\cdot3 = 0+2+12 = 14$
---
**Fila 3** de $\mathbf{A}$ contra $\mathbf{v}$:

$5\cdot1 + 6\cdot2 + 0\cdot3 = 5+12+0 = 17$
---
El resultado junta las tres filas en un vector nuevo:

$$\mathbf{A}\mathbf{v} = \begin{bmatrix}14\\14\\17\end{bmatrix}$$

Cada fila de $\mathbf{A}$ actuó como su propio producto escalar sobre $\mathbf{v}$.
```

- Prueba a calcular a mano la fila 2 antes de avanzar el fotograma y comprobar si coincide.
- Prueba a imaginar $\mathbf{v}=(1,0,0)$ en vez de $(1,2,3)$: ¿qué columna de $\mathbf{A}$ aparecería directamente como resultado?

## En código

```python
import numpy as np

A = np.array([[1, 2, 3], [0, 1, 4], [5, 6, 0]])
v = np.array([1, 2, 3])
print("A @ v:", A @ v)              # [14 14 17]

W = np.array([[1, 2, 0], [-1, 3, 4], [2, 0, -2]])
print("rango de W:", np.linalg.matrix_rank(W))     # 3
print("Frobenius de W:", round(np.linalg.norm(W, 'fro'), 2))  # 6.24
```

## Errores típicos

- **Error**: pensar que $\mathbf{A}\mathbf{B}=\mathbf{B}\mathbf{A}$, como con números. → **Correcto**: la multiplicación de matrices no es conmutativa en general; incluso el orden puede hacer que una de las dos multiplicaciones ni siquiera sea posible por las dimensiones.
- **Error**: multiplicar matrices elemento a elemento en vez de fila por columna. → **Correcto**: cada elemento del resultado es el producto escalar de una fila de la primera con una columna de la segunda, no un simple producto posición a posición.
- **Error**: olvidar comprobar que las dimensiones son compatibles antes de multiplicar. → **Correcto**: el número de columnas de la primera matriz debe igualar el número de filas de la segunda.
- **Error**: creer que toda matriz cuadrada tiene inversa. → **Correcto**: solo la tienen las que no colapsan el espacio, como verás en [[determinante-inversa]].

## En resumen

- **Qué es:** una tabla de números organizada en filas y columnas; también una regla que transforma vectores al multiplicarlos por ella.
- **Multiplicación:** $c_{ij}=\sum_k a_{ik}b_{kj}$; exige que las columnas de la primera coincidan con las filas de la segunda.
- **Tipos clave:** identidad (no altera), diagonal (escala eje a eje), simétrica ($\mathbf{A}=\mathbf{A}^T$) y ortogonal ($\mathbf{Q}\mathbf{Q}^T=\mathbf{I}$, solo rota o refleja).
- **Rango:** cuántas filas o columnas aportan información realmente independiente; menor que el total indica redundancia.
- **Norma de Frobenius:** $\sqrt{\sum_{ij}a_{ij}^2}$, el tamaño global de una matriz; se usa para regularizar capas completas.
- **Trampa:** la multiplicación de matrices no es conmutativa, y no toda matriz cuadrada es invertible.

## A fondo

### Matrices ortogonales: rotar sin deformar

Una matriz ortogonal $\mathbf{Q}$ tiene columnas ortonormales (norma $1$ y perpendiculares entre sí), lo que implica $\mathbf{Q}^{-1}=\mathbf{Q}^T$: invertirla es tan fácil como transponerla. Geométricamente, multiplicar un vector por $\mathbf{Q}$ solo lo rota o lo refleja, sin estirarlo ni comprimirlo: la longitud y los ángulos se conservan. La matriz $\mathbf{Q}=\begin{bmatrix}0&-1\\1&0\end{bmatrix}$ gira cualquier vector $90°$; sus columnas, $(0,1)$ y $(-1,0)$, son perpendiculares y de norma $1$. Esta propiedad es la razón de que el PCA use matrices ortogonales para sus nuevos ejes, y de que algunas redes neuronales recurrentes inicialicen sus pesos con matrices ortogonales para evitar que la señal se desvanezca o explote a lo largo de muchos pasos temporales.

### Por qué el rango importa para los datos

Interpretado sobre una matriz de datos, el rango mide cuánta información realmente distinta contienen las columnas. Si una base de datos de viviendas tiene "metros cuadrados", "número de habitaciones" y "pies cuadrados" (proporcional a los metros), el rango es $2$, no $3$: entrenar con las tres columnas no añade información, solo redundancia que puede confundir al modelo.

## Autoevaluación

### ¿Qué condición deben cumplir las dimensiones de $\mathbf{A}$ ($m\times n$) y $\mathbf{B}$ ($p\times q$) para poder calcular $\mathbf{A}\mathbf{B}$?
- [ ] Que $m=p$.
- [x] Que $n=p$: las columnas de $\mathbf{A}$ deben igualar las filas de $\mathbf{B}$.
- [ ] Que $\mathbf{A}$ y $\mathbf{B}$ sean cuadradas.
> Por qué: cada elemento del resultado combina una fila completa de $\mathbf{A}$ con una columna completa de $\mathbf{B}$, así que ambas deben tener la misma longitud: $n=p$.

### Una matriz de datos tiene tres columnas, pero la tercera es siempre la suma de las otras dos. ¿Cuál es su rango?
- [ ] $3$, porque tiene tres columnas.
- [x] $2$, porque la tercera columna no aporta información independiente de las otras dos.
- [ ] $1$, porque todas las columnas están relacionadas entre sí.
> Por qué: el rango cuenta columnas (o filas) linealmente independientes; si la tercera es combinación lineal de las otras dos, no suma al rango.

### ¿Qué distingue a una matriz ortogonal $\mathbf{Q}$ de otras matrices cuadradas?
- [ ] Que todos sus elementos son $0$ o $1$.
- [x] Que $\mathbf{Q}\mathbf{Q}^T=\mathbf{I}$, así que al aplicarla a un vector solo lo rota o refleja, sin cambiar su longitud ni los ángulos entre vectores.
- [ ] Que siempre tiene determinante $0$.
> Por qué: la condición $\mathbf{Q}\mathbf{Q}^T=\mathbf{I}$ es la definición de ortogonalidad y garantiza que la transformación conserva la geometría del espacio.

### Multiplicas dos matrices $\mathbf{A}\mathbf{B}$ y luego $\mathbf{B}\mathbf{A}$ (ambas compatibles) y obtienes resultados distintos. ¿Es esto un error de cálculo?
- [ ] Sí, la multiplicación de matrices siempre es conmutativa.
- [x] No: la multiplicación de matrices no es conmutativa en general, así que $\mathbf{A}\mathbf{B}$ y $\mathbf{B}\mathbf{A}$ pueden ser distintas.
- [ ] Solo es un error si las matrices son cuadradas.
> Por qué: a diferencia de los números, el orden de la multiplicación de matrices sí importa; obtener resultados distintos es el comportamiento esperado, no un fallo.

## Glosario

- **Matriz**: tabla rectangular de números organizada en filas y columnas.
- **Matriz transpuesta**: matriz que resulta de intercambiar filas por columnas, $\mathbf{A}^T$.
- **Matriz identidad**: matriz cuadrada con unos en la diagonal y ceros fuera; no altera al multiplicar.
- **Matriz diagonal**: matriz cuadrada con ceros fuera de la diagonal principal.
- **Matriz simétrica**: matriz cuadrada igual a su transpuesta, $\mathbf{A}=\mathbf{A}^T$.
- **Matriz ortogonal**: matriz cuadrada cuyas columnas son ortonormales; cumple $\mathbf{Q}\mathbf{Q}^T=\mathbf{I}$.
- **Rango**: número máximo de filas o columnas linealmente independientes de una matriz.
- **Norma de Frobenius**: raíz de la suma de los cuadrados de todos los elementos de una matriz; mide su tamaño global.
