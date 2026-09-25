---
id: componentes-ml
estado: borrador
---

## En una frase

Un modelo de aprendizaje automático surge de combinar datos con un algoritmo que ajusta unos parámetros hasta minimizar el error de sus predicciones.

## Intuición

Imagina que quieres preparar la receta perfecta de un plato. Necesitas ingredientes (los datos), un método que te diga cómo combinarlos (el algoritmo) y unas cantidades concretas —dos cucharadas de sal, quince minutos de horno— que solo ajustas probando una y otra vez (los parámetros). El plato final, ya con esas cantidades fijadas, es el modelo: la receta concreta que sirves a partir de ahora.

En un sistema de aprendizaje automático ocurre lo mismo. El algoritmo es el método general —por ejemplo, "ajusta una recta que pase cerca de los puntos"—; los datos son los ejemplos de los que aprende; y los parámetros son los números concretos (la pendiente, el punto de corte) que el algoritmo encuentra para esos datos. El modelo es el resultado: algoritmo y parámetros ya fijados, listo para predecir sobre casos nuevos.

Entender estas piezas por separado importa porque cada una falla de forma distinta: unos datos malos dan una receta basada en ingredientes en mal estado; un algoritmo mal elegido no sabe qué hacer con buenos ingredientes; y unos parámetros mal ajustados —ni muchos ni pocos— arruinan un buen plato aunque el resto esté bien.

## Explicación

### Datos: la materia prima del modelo

El conjunto de datos es la base sobre la que se construye cualquier modelo: puede ser numérico, categórico, texto, imágenes o señales, y su calidad importa tanto como su cantidad. Antes de entrenar, casi siempre hace falta un **preprocesamiento**: limpiar valores perdidos o duplicados (imputándolos con la media o eliminándolos si son pocos), escalar variables que viven en rangos muy distintos —ingresos anuales frente a edad, por ejemplo— y codificar categorías ("bajo", "medio", "alto") como números que el algoritmo pueda operar.

Antes de entrenar nada, conviene además separar una parte de los datos para comprobar después si el modelo funciona con casos que no ha visto: de eso trata [[validacion]].

### Modelo: la relación que se aprende de los datos

Un modelo es la representación matemática de la relación entre entradas y salidas: recibe unas características y produce una predicción o una etiqueta. Según el tipo de salida que busques, hablarás de modelos de **predicción** (o regresión), que estiman un valor continuo —el precio de una vivienda—; modelos de **clasificación**, que asignan una categoría discreta —spam o no spam—; y modelos de **agrupación** (o *clustering*), que reúnen ejemplos parecidos sin etiquetas previas, como segmentar clientes por su comportamiento de compra.

Además de por su salida, los modelos se distinguen por la forma de la relación que asumen. Un **modelo lineal** supone que la salida es una combinación de las entradas ponderada por unos pesos, del tipo $\hat y = b + w_1 x_1$: es fácil de interpretar y de entrenar, pero no puede capturar relaciones curvas ni interacciones entre variables. Un **modelo no lineal** —con términos como $x^2$, $\sin(x)$ o una red neuronal completa— sí puede ajustar patrones complejos, a costa de ser más difícil de interpretar, más caro de entrenar y más propenso a memorizar detalles irrelevantes de los datos de entrenamiento en vez de aprender el patrón general.

### Algoritmo: el proceso que encuentra los parámetros

El algoritmo de aprendizaje es el procedimiento matemático que, a partir de los datos, decide qué parámetros dar al modelo. Su objetivo casi siempre es minimizar una **función de coste**: un número que resume cuánto se equivoca el modelo en promedio sobre todos los ejemplos de entrenamiento (por ejemplo, el [[funciones-perdida|error cuadrático medio]]). Para saber en qué dirección mover cada parámetro y reducir ese error, la mayoría de algoritmos se apoya en la [[gradiente|derivada]] de la función de coste: mide cómo cambiaría el error si tocases un poco cada parámetro, y ese cálculo guía el ajuste paso a paso, como verás en [[descenso-gradiente]].

### Parámetros: cuántos hacen falta y de qué dependen

Los parámetros son los valores internos que el algoritmo ajusta durante el entrenamiento, a diferencia de los hiperparámetros, que tú fijas antes de empezar. Cuantos más parámetros tiene un modelo, más patrones puede llegar a representar, pero también necesita más datos para que esos patrones sean reales y no ruido memorizado. Una guía habitual es no fiarse de un modelo si tiene menos de diez veces más datos que parámetros: con 1.000 parámetros conviene disponer de al menos 10.000 ejemplos. Qué ocurre exactamente cuando esa proporción no se cumple es el tema de [[generalizacion]].

## Formalización

$$
\hat{y} = f_{\boldsymbol{\theta}}(\mathbf{x})
$$

donde:

- $\hat y$ es la predicción del modelo.
- $\mathbf{x}$ es el vector de entradas (las características de un ejemplo).
- $f_{\boldsymbol{\theta}}$ es la función que define el modelo, ya fijada su forma por el algoritmo elegido.
- $\boldsymbol{\theta}$ es el conjunto de parámetros que el algoritmo ajusta.

El algoritmo busca los parámetros que minimizan la función de coste $J$:

$$
\boldsymbol{\theta}^{*} = \arg\min_{\boldsymbol{\theta}} J(\boldsymbol{\theta})
$$

donde:

- $\boldsymbol{\theta}^{*}$ son los parámetros óptimos que produce el entrenamiento.
- $J(\boldsymbol{\theta})$ es la función de coste: el error medio del modelo sobre los datos de entrenamiento para unos parámetros $\boldsymbol{\theta}$ dados.
- $\arg\min$ indica que se toma el valor de $\boldsymbol{\theta}$ que hace mínima esa función, no el valor mínimo en sí.

Cuando $f_{\boldsymbol{\theta}}$ es un modelo lineal, esta forma general se concreta en:

$$
\hat y = b + w_1 x_1 + w_2 x_2 + \dots + w_n x_n
$$

donde:

- $b$ es el sesgo o término independiente (la predicción cuando todas las entradas valen $0$).
- $w_1, \dots, w_n$ son los pesos que multiplican a cada entrada $x_1, \dots, x_n$.
- $n$ es el número de variables de entrada.

**Ejemplo**: cuatro pares (minutos de anuncio, ventas generadas) sugieren una relación aproximadamente lineal: $x=[1,2,3,4]$, $y=[2{,}2,\ 3{,}9,\ 6{,}1,\ 7{,}8]$. Ajustando por mínimos cuadrados (con detalle en [[descenso-gradiente]]) se obtienen los parámetros $w_1=1{,}9$ y $b=0{,}25$, con un error cuadrático medio de solo $0{,}0125$: el modelo $\hat y = 0{,}25 + 1{,}9x$ reproduce casi exactamente los datos.

## En código

```python
import numpy as np

x = np.array([1.0, 2.0, 3.0, 4.0])
y = np.array([2.2, 3.9, 6.1, 7.8])

w1, b = np.polyfit(x, y, 1)  # algoritmo: mínimos cuadrados
print(f"parámetros: w1={w1:.2f}, b={b:.2f}")

pred = w1 * x + b            # modelo, ya con los parámetros fijados
mse = np.mean((y - pred) ** 2)
print(f"MSE = {mse:.4f}")
# parámetros: w1=1.90, b=0.25
# MSE = 0.0125
```

## Errores típicos

- **Error**: pensar que el algoritmo y el modelo son lo mismo. → **Correcto**: el algoritmo es el método de ajuste; el modelo es su resultado, con los parámetros ya fijados.
- **Error**: creer que un modelo con más parámetros siempre predice mejor. → **Correcto**: más parámetros solo ayudan si hay datos suficientes para respaldarlos; si no, memorizan ruido en vez de aprender el patrón.
- **Error**: confundir parámetros con hiperparámetros. → **Correcto**: los parámetros los aprende el algoritmo de los datos; los hiperparámetros (como el grado de un polinomio) los decides tú antes de entrenar.
- **Error**: suponer que más datos arreglan cualquier problema. → **Correcto**: si los datos son de mala calidad o no representativos, añadir más solo repite el mismo sesgo.

## En resumen

- **Qué hace y para qué sirve**: un modelo de ML combina datos, un algoritmo y unos parámetros para producir predicciones sobre casos nuevos.
- **Cómo funciona**: los datos se limpian y preparan, el algoritmo minimiza una función de coste, ese proceso fija los parámetros, y el modelo resultante ya puede predecir.
- **Fórmula clave**: $\hat y = f_{\boldsymbol\theta}(\mathbf x)$; en el caso lineal, $\hat y = b + w_1x_1+\dots+w_nx_n$.
- **Cuándo usar un modelo lineal**: cuando la relación es simple y la interpretabilidad importa; para relaciones complejas hace falta un modelo no lineal, a costa de más datos y menos transparencia.
- **Decisión que importa**: la proporción entre datos y parámetros; una guía habitual pide al menos diez datos por cada parámetro.
- **Trampa principal**: confundir el algoritmo (el método) con el modelo (su resultado), o pensar que más parámetros son automáticamente mejores.

## A fondo

La elección entre modelo lineal y no lineal rara vez es solo cuestión de precisión. Los modelos lineales y los árboles de decisión sencillos son fáciles de interpretar —se puede señalar exactamente cómo influye cada variable en la predicción—, lo que importa en campos como la medicina o las finanzas, donde hace falta explicar una decisión. Las redes neuronales profundas, en cambio, pueden ofrecer mucha más precisión a costa de convertirse en una especie de caja negra difícil de auditar.

El número de características también pesa en la decisión. Cuando hay muchas variables de entrada, algoritmos como los k-vecinos más cercanos sufren la llamada **maldición de la dimensionalidad**: con tantas dimensiones, todos los puntos acaban pareciendo igual de lejanos entre sí, y las nociones de "cercanía" que usan estos algoritmos dejan de ser útiles. Modelos como las máquinas de soporte vectorial o las redes neuronales, que aprenden representaciones más abstractas de los datos, suelen manejar mejor esa alta dimensionalidad.

El coste computacional tampoco es un detalle menor: entrenar una red neuronal grande o una máquina de soporte vectorial sobre muchos datos puede tardar horas, mientras que una regresión lineal o un árbol de decisión sencillo se ajustan en segundos. En un proyecto real, esta cuenta —tiempo de cómputo disponible frente a precisión necesaria— pesa tanto como la naturaleza matemática del problema.

Cuando la proporción de datos por parámetro no llega a la guía de referencia (diez datos por parámetro), la alternativa no es necesariamente recoger más datos: las técnicas de regularización reducen la complejidad efectiva del modelo sin reducir el número de parámetros, como verás en [[generalizacion]].

## Autoevaluación

### ¿Cuál de estas parejas describe correctamente la diferencia entre modelo y algoritmo?
- [ ] El modelo es el conjunto de datos y el algoritmo es el resultado del entrenamiento.
- [x] El algoritmo es el método que ajusta los parámetros; el modelo es el resultado, con esos parámetros ya fijados.
- [ ] Son sinónimos: cualquier programa de ML es a la vez modelo y algoritmo.
> Por qué: el algoritmo es el procedimiento de ajuste; el modelo es lo que queda cuando ese ajuste termina y los parámetros están fijados.

### Un modelo tiene 500 parámetros y se entrena con 800 ejemplos. Según la guía de esta ficha, ¿qué cabe esperar?
- [ ] Que generalice bien, porque hay más datos que parámetros.
- [x] Riesgo de sobreajuste, porque hacen falta al menos unos 5.000 ejemplos para esa cantidad de parámetros.
- [ ] Que el modelo sea automáticamente lineal.
> Por qué: la guía pide unas diez veces más datos que parámetros; 800 ejemplos para 500 parámetros está muy por debajo, así que el modelo puede memorizar en vez de generalizar.

### Quieres predecir si una imagen contiene un gato o un perro. ¿Qué tipo de modelo necesitas?
- [ ] Un modelo de predicción (regresión), porque la salida es un valor.
- [x] Un modelo de clasificación, porque la salida es una categoría discreta.
- [ ] Un modelo de agrupación, porque no hay ninguna salida que aprender.
> Por qué: la salida son dos categorías ("gato"/"perro"), lo que define un problema de clasificación, no de regresión ni de agrupación.

### ¿Por qué un modelo no lineal puede ser arriesgado con pocos datos?
- [ ] Porque los modelos no lineales no permiten calcular ningún tipo de error.
- [x] Porque su flexibilidad le permite ajustarse al ruido de esos pocos datos en vez de al patrón general.
- [ ] Porque los modelos no lineales no tienen parámetros que ajustar.
> Por qué: la misma flexibilidad que le permite capturar relaciones complejas hace que, con pocos datos, memorice detalles irrelevantes en vez de generalizar.

## Glosario

- **Dato**: unidad de información (numérica, categórica, texto, imagen...) que alimenta el entrenamiento o la predicción de un modelo.
- **Modelo**: representación matemática, ya con sus parámetros fijados, que transforma entradas en predicciones.
- **Algoritmo de aprendizaje**: procedimiento que ajusta los parámetros de un modelo a partir de los datos, minimizando una función de coste.
- **Parámetro**: valor interno que el algoritmo aprende durante el entrenamiento, a diferencia de un hiperparámetro, que se fija antes.
- **Preprocesamiento**: conjunto de transformaciones (limpieza, escalado, codificación) que preparan los datos crudos para el algoritmo.
