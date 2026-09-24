---
id: datos-como-matrices
estado: borrador
---

## En una frase

Un conjunto de datos se organiza como una matriz (filas = ejemplos, columnas = características), y multiplicarla por una matriz de pesos la transforma en una nueva representación de esos mismos ejemplos.

## Intuición

Un solo dato —un correo, una imagen— ya sabes representarlo como un vector: [[vectores]]. Pero en IA casi nunca trabajas con un solo dato, sino con miles a la vez. Guardarlos todos en una tabla, con cada fila un ejemplo y cada columna una característica, permite tratarlos como un bloque: sumar, escalar o transformar el conjunto entero de una sola vez en lugar de dato a dato.

## Explicación

### La matriz de datos: filas como ejemplos, columnas como características

Si tienes tres correos descritos por su longitud, número de enlaces y frecuencia de la palabra "gratis", la matriz de datos es

$$
\mathbf{X} = \begin{bmatrix} 50 & 1 & 1 \\ 200 & 3 & 5 \\ 120 & 0 & 0 \end{bmatrix}
$$

Cada fila es un correo completo; cada columna, la misma característica medida en los tres correos. Sumar, escalar o multiplicar esta matriz equivale a transformar simultáneamente el conjunto completo de ejemplos, algo esencial cuando entrenas un modelo con muchos datos a la vez.

### La matriz como transformación: de un espacio de características a otro

Hasta aquí, $\mathbf{X}$ es un almacén. Pero si la multiplicas por una matriz de pesos $\mathbf{W}$, el producto $\mathbf{X}\mathbf{W}$ da una **nueva representación** de los mismos ejemplos, en otro espacio de características. Toma tres estudiantes descritos por nota media y horas de estudio semanales:

$$
\mathbf{X} = \begin{bmatrix} 7 & 10 \\ 8 & 12 \\ 5 & 6 \end{bmatrix}, \qquad
\mathbf{W} = \begin{bmatrix} 0{,}5 \\ 0{,}5 \end{bmatrix}
$$

El producto $\mathbf{X}\mathbf{W}$ da $(8{,}5;\ 10;\ 5{,}5)$: una sola puntuación combinada por estudiante, con el mismo peso para nota y horas de estudio. $\mathbf{W}$ ha actuado como una **regla de transformación lineal** que convierte dos características en una. Esto es, literalmente, lo que hace una capa de una red neuronal o un modelo lineal de clasificación con cada ejemplo de $\mathbf{X}$: cada fila de la matriz de predicciones resultante es la salida de un ejemplo, transformado en la misma operación para todos a la vez.

### La lectura geométrica: una nube de puntos

Cada fila de $\mathbf{X}$ es un punto en un espacio de características; juntas forman una **nube de puntos**. Si los puntos se agrupan en regiones separadas, esas regiones pueden corresponder a clases distintas; si se alinean en una dirección dominante, esa dirección puede representar un factor común a todos los ejemplos. La **distancia** entre puntos (ejemplos parecidos, cercanos) y el **ángulo** entre ellos (similitud del coseno, dirección parecida) —vistos en [[producto-escalar-similitud]]— son las herramientas con las que un algoritmo lee esa nube.

## Formalización

$$
\mathbf{X} \in \mathbb{R}^{n\times d}, \qquad \mathbf{X}\mathbf{W}
$$

donde:

- $n$ es el número de ejemplos (filas) del conjunto de datos.
- $d$ es el número de características (columnas) de cada ejemplo.
- $\mathbf{X}$ es la matriz de datos: la fila $i$ es el vector de características del ejemplo $i$.
- $\mathbf{W}$ es una matriz de pesos con tantas filas como columnas tiene $\mathbf{X}$; el producto $\mathbf{X}\mathbf{W}$ transforma cada ejemplo (cada fila) con la misma regla.

Si los datos tienen más de dos índices a la vez —por ejemplo alto, ancho y color en una imagen—, la estructura ya no es una matriz sino un **tensor**, su generalización a más dimensiones.

## Interactivo

```widget
motor: transformacion2d
modo: rejilla
matriz: [[1, 0.5], [0, 1]]
```

- Prueba a poner la matriz identidad $\begin{bmatrix}1&0\\0&1\end{bmatrix}$ y comprueba que la rejilla (y la nube de puntos que representa) no cambia.
- Prueba a llevar el elemento inferior derecho a $0$: observa cómo la rejilla se aplana en una sola dirección, como pasaría si dos características fueran redundantes.
- Prueba a cambiar los cuatro valores libremente y observa que los puntos se reorganizan, pero las líneas que antes eran paralelas siguen siendo paralelas: es una transformación lineal.

## En código

```python
import numpy as np

X = np.array([[7, 10], [8, 12], [5, 6]])  # filas = estudiantes, columnas = características
W = np.array([0.5, 0.5])

print("X @ W:", X @ W)   # [8.5 10.  5.5]
```

## Errores típicos

- **Error**: pensar que en toda matriz de datos las filas son características y las columnas los ejemplos. → **Correcto**: la convención habitual en IA es la contraria: cada fila es un ejemplo y cada columna una característica.
- **Error**: creer que $\mathbf{X}\mathbf{W}$ siempre reduce el número de columnas. → **Correcto**: el número de columnas del resultado lo decide $\mathbf{W}$; puede reducir, mantener o incluso aumentar la dimensión.
- **Error**: tratar la matriz de datos como un objeto fijo que solo se puede leer. → **Correcto**: multiplicarla por otra matriz la transforma en una representación distinta de los mismos ejemplos; es también un operador, no solo un almacén.
- **Error**: pensar que la "nube de puntos" solo tiene sentido en dos o tres dimensiones. → **Correcto**: la idea se extiende a miles de dimensiones; simplemente ya no se puede dibujar directamente.

## En resumen

- **Qué es:** una matriz $\mathbf{X}$ de $n\times d$ donde cada fila es un ejemplo y cada columna una característica.
- **Doble función:** almacena datos y, al multiplicarla por una matriz de pesos, actúa como transformación que genera una nueva representación de los mismos ejemplos.
- **Regla clave:** $\mathbf{X}\mathbf{W}$ aplica la misma transformación lineal a todas las filas (ejemplos) a la vez.
- **Lectura geométrica:** cada fila es un punto; el conjunto es una nube donde distancia y ángulo entre puntos reflejan similitud entre ejemplos.
- **Para qué sirve en IA:** es la forma en que una capa de red neuronal o un modelo lineal procesan un conjunto completo de ejemplos en una sola operación.
- **Trampa:** cambiar de matriz de pesos no borra los datos originales, los reexpresa en otro espacio de características.

## A fondo

### De la matriz al tensor

Cuando los datos tienen más de dos índices (por ejemplo, alto, ancho y canal de color en una imagen, o ejemplo, paso temporal y característica en una secuencia), ya no basta una tabla de dos dimensiones: se necesita un **tensor**, la generalización de vector y matriz a cualquier número de índices. La lógica de fondo es la misma: cada índice describe un eje distinto de los datos, y las operaciones (sumas, productos) se generalizan índice a índice.

## Autoevaluación

### En una matriz de datos $\mathbf{X}$ con la convención habitual en IA, ¿qué representa cada fila?
- [ ] Una característica medida sobre todos los ejemplos.
- [x] Un ejemplo completo, con todas sus características.
- [ ] Un peso del modelo.
> Por qué: la convención habitual pone cada ejemplo en una fila y cada característica en una columna; así, la fila $i$ es el vector completo de características del ejemplo $i$.

### $\mathbf{X}$ es una matriz de $200\times 5$ (200 ejemplos, 5 características) y $\mathbf{W}$ es de $5\times 1$. ¿Qué forma tiene $\mathbf{X}\mathbf{W}$?
- [ ] $200 \times 5$, igual que $\mathbf{X}$.
- [x] $200 \times 1$: una puntuación combinada por cada ejemplo.
- [ ] $5 \times 1$, igual que $\mathbf{W}$.
> Por qué: multiplicar una matriz $n\times d$ por otra $d\times p$ da una de $n\times p$; aquí $n=200$ y $p=1$, así que el resultado es una columna con una puntuación por ejemplo.

### Dos filas de una matriz de datos representan ejemplos cuyo ángulo (similitud del coseno) es cercano a $0$. ¿Qué sugiere esto sobre esos dos ejemplos?
- [ ] Que son prácticamente el mismo ejemplo.
- [x] Que apuntan en direcciones muy distintas dentro del espacio de características: son poco parecidos en dirección.
- [ ] Que uno de los dos tiene todos sus valores en cero.
> Por qué: un ángulo cercano a $90°$ (coseno cercano a $0$) indica vectores casi ortogonales, es decir, ejemplos que no comparten una dirección común en el espacio de características.

### Una imagen en color tiene alto, ancho y tres canales de color. ¿Por qué no basta una matriz para representarla?
- [ ] Porque las imágenes no se pueden representar numéricamente.
- [x] Porque tiene más de dos índices a la vez (alto, ancho y color), y una matriz solo maneja dos (filas y columnas); se necesita un tensor.
- [ ] Porque las matrices solo admiten números enteros.
> Por qué: una matriz organiza datos con exactamente dos índices; en cuanto aparece un tercer eje (como el canal de color), la estructura natural es un tensor.

## Glosario

- **Matriz de datos**: matriz donde cada fila es un ejemplo y cada columna una característica.
- **Nube de puntos**: conjunto de las filas de una matriz de datos, vistas como puntos en un espacio de características.
- **Tensor**: generalización de vector y matriz a estructuras con más de dos índices.
