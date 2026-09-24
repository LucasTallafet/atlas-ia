---
id: determinante-inversa
estado: borrador
---

## En una frase

El determinante dice si una matriz cuadrada colapsa el espacio (vale $0$) o no; solo cuando no lo colapsa existe una matriz inversa que deshace su transformación.

## Intuición

Piensa en una matriz cuadrada como una máquina que estira, comprime o gira un trozo de plano. El **determinante** es el factor por el que cambia el área de cualquier figura al pasar por esa máquina. Si el factor es $0$, la máquina aplasta el plano entero sobre una línea (o un punto): pierdes una dimensión y ya no hay forma de recuperar la información original. La **matriz inversa** es la máquina que deshace la transformación, y solo existe cuando nada se ha aplastado por el camino.

## Explicación

### El determinante: ¿colapsa el espacio o no?

El **determinante** es un número asociado a cada matriz cuadrada. Si es **distinto de cero**, las columnas (y filas) de la matriz son linealmente independientes: ninguna dirección se pierde y la matriz es **invertible**. Si es **cero**, la matriz es **singular**: al menos una fila o columna es combinación lineal de las demás, y esa dirección "colapsa".

Para $\mathbf{A}=\begin{bmatrix}1&2\\2&4\end{bmatrix}$, el determinante es $(1)(4)-(2)(2)=0$: la segunda columna es el doble de la primera, así que no hay dos direcciones realmente independientes y $\mathbf{A}$ no tiene inversa.

### La relación entre rango y determinante

El [[matrices|rango]] cuenta cuántas filas o columnas son independientes; el determinante es un atajo para matrices cuadradas: si el rango es máximo (igual al tamaño de la matriz), el determinante es distinto de cero y la matriz es invertible. Si el rango es menor, el determinante es cero. En datos, esto se traduce en **multicolinealidad**: si una columna se deduce de otras (como "tamaño en pies" a partir de "tamaño en metros"), el determinante de la matriz que las contiene es cero.

### La matriz inversa: la "división" entre matrices

Así como cualquier número distinto de cero tiene un inverso multiplicativo ($5\cdot\frac{1}{5}=1$), una matriz cuadrada $\mathbf{A}$ es **invertible** si existe $\mathbf{A}^{-1}$ tal que $\mathbf{A}\mathbf{A}^{-1}=\mathbf{A}^{-1}\mathbf{A}=\mathbf{I}$. Para que exista, $\mathbf{A}$ debe ser cuadrada y tener determinante distinto de cero.

Para matrices $2\times 2$ hay una fórmula directa:

$$
\mathbf{A} = \begin{bmatrix}a&b\\c&d\end{bmatrix}
\quad\Rightarrow\quad
\mathbf{A}^{-1} = \frac{1}{ad-bc}\begin{bmatrix}d&-b\\-c&a\end{bmatrix}
$$

Con $\mathbf{A}=\begin{bmatrix}1&2\\3&4\end{bmatrix}$, el determinante es $(1)(4)-(2)(3)=-2$, así que $\mathbf{A}^{-1}=\frac{1}{-2}\begin{bmatrix}4&-2\\-3&1\end{bmatrix}=\begin{bmatrix}-2&1\\1{,}5&-0{,}5\end{bmatrix}$.

### Por qué en la práctica casi nunca se calcula la inversa

La inversa resuelve directamente $\mathbf{A}\mathbf{x}=\mathbf{b}$ como $\mathbf{x}=\mathbf{A}^{-1}\mathbf{b}$, pero calcularla explícitamente en matrices grandes es costoso y numéricamente inestable: pequeños errores de redondeo se amplifican. En la práctica se prefieren métodos como Gauss-Jordan o las descomposiciones LU y QR, que resuelven el mismo problema sin invertir la matriz de forma explícita. Verás estos métodos con más detalle en [[sistemas-lineales]].

## Formalización

$$
\det\begin{pmatrix}a&b\\c&d\end{pmatrix} = ad-bc
\qquad\qquad
\mathbf{A}\mathbf{A}^{-1} = \mathbf{A}^{-1}\mathbf{A} = \mathbf{I}
$$

donde:

- $a,b,c,d$ son los cuatro elementos de una matriz $2\times2$.
- $\det(\cdot)$ es el determinante: si es $0$, la matriz es singular (no invertible); si no, es invertible.
- $\mathbf{A}^{-1}$ es la matriz inversa de $\mathbf{A}$: al multiplicarla por $\mathbf{A}$ (en cualquier orden) da la matriz identidad $\mathbf{I}$.

## Interactivo

```widget
motor: transformacion2d
modo: determinante
matriz: [[2, 1], [1, 1]]
```

- Prueba a cambiar el elemento inferior derecho hasta que el área del paralelogramo se reduzca a $0$: ahí el determinante se anula y la matriz colapsa el plano en una línea.
- Prueba a volver a un determinante distinto de cero y comprueba que el área vuelve a aparecer, con signo positivo o negativo según la orientación.
- Prueba a poner la matriz identidad: el área debe quedar igual a la del cuadrado original (determinante $1$).

## En código

```python
import numpy as np

A = np.array([[1, 2], [3, 4]])
print("det(A):", np.linalg.det(A))       # -2.0
print("A^-1:", np.linalg.inv(A))         # [[-2. 1.] [1.5 -0.5]]

singular = np.array([[1, 2], [2, 4]])
print("det(singular):", np.linalg.det(singular))  # 0.0
```

## Errores típicos

- **Error**: pensar que cualquier matriz, cuadrada o no, tiene determinante. → **Correcto**: el determinante solo se define para matrices cuadradas; para matrices rectangulares se usa el rango.
- **Error**: creer que un determinante igual a $0$ significa que la matriz "está mal calculada". → **Correcto**: significa que las filas o columnas son dependientes; es una propiedad real de la matriz, no un error numérico.
- **Error**: asumir que hay que calcular la inversa explícita para resolver $\mathbf{A}\mathbf{x}=\mathbf{b}$. → **Correcto**: en la práctica se usan métodos como Gauss-Jordan, LU o QR, más rápidos y estables que invertir la matriz.
- **Error**: pensar que determinante distinto de cero y rango máximo son cosas independientes. → **Correcto**: para una matriz cuadrada son la misma condición vista desde dos ángulos distintos.

## En resumen

- **Qué mide:** el determinante indica si una matriz cuadrada colapsa el espacio ($0$) o lo transforma sin perder dimensiones (distinto de $0$).
- **Cuándo hay inversa:** solo si la matriz es cuadrada y su determinante es distinto de $0$.
- **Fórmula 2×2:** $\det=ad-bc$; $\mathbf{A}^{-1}=\frac{1}{ad-bc}\begin{bmatrix}d&-b\\-c&a\end{bmatrix}$.
- **Relación con el rango:** determinante $\neq 0$ equivale a rango máximo; determinante $=0$, a dependencia lineal entre filas o columnas.
- **En la práctica:** casi nunca se calcula la inversa explícita en matrices grandes; se usan Gauss-Jordan, LU o QR por eficiencia y estabilidad numérica.
- **Trampa:** un determinante cero no es un error de cálculo, es información real sobre redundancia en los datos.

## A fondo

### Calcular la inversa con cofactores (matrices más grandes)

Para matrices de $3\times3$ o más, la inversa se obtiene con la **matriz adjunta**: para cada elemento $a_{ij}$ se calcula su **cofactor** $C_{ij}=(-1)^{i+j}|M_{ij}|$, donde $M_{ij}$ es la submatriz que queda al eliminar la fila $i$ y la columna $j$. Con $\mathbf{A}=\begin{bmatrix}1&2&3\\0&1&4\\5&6&0\end{bmatrix}$, el determinante es $1$ y la matriz de cofactores resulta $\begin{bmatrix}-24&20&-5\\18&-15&4\\5&-4&1\end{bmatrix}$. Transponiéndola se obtiene la adjunta, y como $\det(\mathbf{A})=1$, la inversa coincide con ella:

$$
\mathbf{A}^{-1} = \begin{bmatrix}-24&18&5\\20&-15&-4\\-5&4&1\end{bmatrix}
$$

Este método es conceptualmente claro pero laborioso a mano; en la práctica se usa siempre software.

### Descomposiciones LU y QR

La **descomposición LU** escribe una matriz invertible como el producto de una triangular inferior $\mathbf{L}$ y una triangular superior $\mathbf{U}$, lo que permite resolver sistemas en dos pasos fáciles en vez de invertir directamente. La **descomposición QR** la escribe como una matriz ortogonal $\mathbf{Q}$ y una triangular superior $\mathbf{R}$, y es especialmente útil en problemas de mínimos cuadrados y en el cálculo de autovalores. Ambas son la base de las bibliotecas de álgebra lineal que usa la IA en la práctica, precisamente para evitar calcular inversas explícitas.

## Autoevaluación

### Una matriz cuadrada tiene determinante $-2$. ¿Es invertible?
- [x] Sí: al ser distinto de cero, sus filas y columnas son independientes y tiene inversa.
- [ ] No: solo los determinantes positivos indican matrices invertibles.
- [ ] No se puede saber sin calcular también el rango.
> Por qué: lo único que importa para la invertibilidad es que el determinante sea distinto de cero; el signo indica orientación, no si existe inversa.

### En una matriz de datos, la columna "superficie en pies cuadrados" es siempre 10,76 veces la columna "superficie en metros cuadrados". ¿Qué se puede afirmar de la matriz cuadrada formada solo por esas dos columnas (y sus correspondientes filas)?
- [ ] Que su determinante es distinto de cero, porque los números son diferentes.
- [x] Que su determinante es cero: las dos columnas son linealmente dependientes.
- [ ] Que no se puede calcular su determinante.
> Por qué: si una columna es siempre un múltiplo escalar de la otra, son dependientes; para una matriz cuadrada eso implica determinante cero y rango menor que el máximo.

### ¿Por qué en la práctica los algoritmos de IA casi nunca calculan $\mathbf{A}^{-1}$ de forma explícita para resolver $\mathbf{A}\mathbf{x}=\mathbf{b}$?
- [ ] Porque la fórmula $\mathbf{x}=\mathbf{A}^{-1}\mathbf{b}$ es matemáticamente incorrecta.
- [x] Porque calcular la inversa es costoso y numéricamente inestable en matrices grandes; los métodos como LU o QR resuelven el sistema de forma más eficiente y estable.
- [ ] Porque las matrices de datos nunca son cuadradas.
> Por qué: la fórmula es correcta en teoría, pero en la práctica computacional resulta cara y sensible a errores de redondeo; se prefieren descomposiciones que evitan invertir explícitamente.

### El determinante de una matriz $3\times3$ resulta ser $0$. ¿Qué relación tiene esto con su rango?
- [ ] El rango será siempre $0$.
- [x] El rango será menor que $3$: al menos una fila o columna es combinación lineal de las demás.
- [ ] El rango no tiene relación con el determinante.
> Por qué: para una matriz cuadrada, determinante cero equivale a que el rango no alcanza el máximo posible (el tamaño de la matriz).

## Glosario

- **Determinante**: número asociado a una matriz cuadrada que indica si colapsa el espacio ($0$) o no (distinto de $0$).
- **Matriz singular**: matriz cuadrada con determinante $0$; no tiene inversa.
- **Matriz invertible**: matriz cuadrada con determinante distinto de $0$; tiene una inversa $\mathbf{A}^{-1}$.
- **Matriz adjunta**: transpuesta de la matriz de cofactores; se usa para calcular la inversa mediante $\mathbf{A}^{-1}=\frac{1}{\det(\mathbf{A})}\text{adj}(\mathbf{A})$.
- **Cofactor**: determinante de una submatriz (menor complementario), con signo según su posición.
- **Descomposición LU**: escribir una matriz como producto de una triangular inferior y otra superior.
- **Descomposición QR**: escribir una matriz como producto de una matriz ortogonal y una triangular superior.
