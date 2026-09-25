---
id: knn
estado: borrador
---

## En una frase

K vecinos más cercanos clasifica (o predice) una observación nueva según la clase mayoritaria (o el promedio) de sus k puntos más parecidos en los datos de entrenamiento.

## Intuición

"Dime con quién andas y te diré quién eres": si quieres adivinar en qué barrio vive alguien y solo conoces sus tres vecinos más cercanos, mirar de qué barrio son esos tres es un buen punto de partida. El algoritmo de los **k vecinos más cercanos** (*k-nearest neighbors*, **KNN**) formaliza exactamente esa idea: para clasificar un punto nuevo, busca los $k$ puntos de entrenamiento más parecidos a él y le asigna la clase que más se repite entre ellos.

Lo curioso de KNN es que no "aprende" un modelo compacto como hace [[regresion-lineal|una recta]]: se limita a guardar todos los datos de entrenamiento y, en el momento de predecir, mide distancias contra todos ellos. Esto lo hace muy fácil de entender e implementar, y por eso suele ser uno de los primeros algoritmos de clasificación que se enseñan, aunque escala mal cuando hay muchos datos o muchas variables.

## Explicación

### La moda como regla de decisión

La estadística detrás de KNN es sencilla: dado un punto nuevo, se localizan sus $k$ vecinos más próximos en el conjunto de entrenamiento y se le asigna la **moda** de sus clases, es decir, la clase que "gana por mayoría de votos" entre esos vecinos. No es un promedio ni una fórmula compleja: es contar votos locales y quedarse con el más frecuente.

:::ampliacion
**El algoritmo paso a paso.** Para clasificar un punto nuevo $\mathbf x$: (1) calcular su distancia a cada punto de entrenamiento (ver [[producto-escalar-similitud]] para la distancia euclídea y la similitud del coseno); (2) ordenar los puntos de entrenamiento por esa distancia y quedarse con los $k$ más cercanos; (3) en clasificación, asignar la clase mayoritaria entre esos $k$ vecinos; en regresión, promediar sus valores de $y$. No hay fase de entrenamiento propiamente dicha más allá de guardar los datos, por lo que a KNN se le llama **algoritmo perezoso** (*lazy learner*): todo el cálculo se aplaza al momento de predecir.

Fuente: scikit-learn User Guide §1.6 Nearest Neighbors.
:::

:::ampliacion
**Cómo elegir $k$.** Con $k$ muy pequeño (por ejemplo, $k=1$) la frontera de decisión se ajusta a cada punto individual, incluido el ruido: el modelo sobreajusta. Con $k$ muy grande, cada predicción promedia entre tantos vecinos que la frontera se suaviza en exceso y puede ignorar estructura real de los datos: el modelo subajusta. En clasificación binaria conviene usar $k$ impar para evitar empates. El valor de $k$ no se deduce de una fórmula: se elige por validación cruzada, probando varios valores y quedándose con el que mejor generaliza.

Fuente: scikit-learn User Guide §1.6.2 Nearest Neighbors Classification.
:::

:::ampliacion
**Distancia y ponderación.** La distancia euclídea es la más habitual, pero no la única: la familia de [[producto-escalar-similitud|distancias de Minkowski]] la generaliza, y para datos categóricos o de texto se usan otras métricas. Además, no todos los vecinos tienen por qué pesar igual: en el **voto ponderado**, cada vecino cuenta más cuanto más cerca esté del punto a clasificar (típicamente con peso $1/d$), en vez de que los $k$ vecinos voten con el mismo peso.

Fuente: scikit-learn User Guide §1.6.1 Unsupervised Nearest Neighbors.
:::

:::ampliacion
**La maldición de la dimensionalidad.** KNN depende de que "cerca" signifique algo: que existan vecinos realmente parecidos al punto a clasificar. Al añadir muchas variables, los puntos tienden a quedar todos aproximadamente equidistantes entre sí (ver [[integral-monte-carlo|maldición de la dimensionalidad]]), y la noción de "vecino cercano" deja de ser informativa. Por eso KNN funciona mejor con pocas variables relevantes, y suele beneficiarse de una [[seleccion-caracteristicas|selección de características]] o una [[reduccion-dimensionalidad|reducción de dimensionalidad]] previas.

Fuente: Cover, T. & Hart, P. (1967), "Nearest neighbor pattern classification".
:::

:::ampliacion
**KNN para regresión y para imputación.** Cuando la variable objetivo es continua, KNN no vota una clase sino que promedia (o promedia ponderadamente) los valores de $y$ de los $k$ vecinos. La misma idea, aplicada a datos de entrenamiento en vez de a una variable objetivo, es la base de la imputación de [[valores-ausentes|valores ausentes]] mediante vecinos más cercanos: se rellena un valor que falta con el de (o el promedio de) las filas más parecidas.

Fuente: scikit-learn User Guide §1.6.3 Nearest Neighbors Regression.
:::

## Formalización

Dado un punto de consulta $\mathbf x$ y su conjunto de $k$ vecinos más cercanos $N_k(\mathbf x)$ según una distancia $d$ (ver [[producto-escalar-similitud]]):

$$
\hat y_{\text{clasif}} = \operatorname{moda}\big(\{y_i : i \in N_k(\mathbf x)\}\big), \qquad \hat y_{\text{regr}} = \frac{1}{k}\sum_{i \in N_k(\mathbf x)} y_i
$$

donde:
- $N_k(\mathbf x)$ es el conjunto de índices de los $k$ puntos de entrenamiento con menor $d(\mathbf x, \mathbf x_i)$.
- $y_i$ es la etiqueta (clasificación) o el valor (regresión) del vecino $i$.

En la versión ponderada, cada vecino aporta $w_i=1/d(\mathbf x,\mathbf x_i)$ en vez de un voto o promedio igual para todos:

$$
\hat y_{\text{regr, ponderada}} = \frac{\sum_{i\in N_k(\mathbf x)} w_i\, y_i}{\sum_{i\in N_k(\mathbf x)} w_i}
$$

$d(\mathbf x,\mathbf x_i)$ puede ser la distancia euclídea o cualquier otra de la familia de [[producto-escalar-similitud|distancias de Minkowski]] (Manhattan, euclídea...); lo único que exige KNN es que "más pequeña" signifique "más parecido".

**Ejemplo numérico.** Seis puntos de entrenamiento: clase A en $(1,1)$, $(2,1)$, $(1,2)$; clase B en $(5,5)$, $(6,5)$, $(5,6)$. Para el punto de consulta $(2,2)$ con $k=3$ (distancias verificadas con `numpy.linalg.norm`): los tres vecinos más cercanos son $(2,1)$ y $(1,2)$, ambos a distancia $1$, y $(1,1)$, a distancia $\approx1{,}414$ — los tres de clase A, frente a $(5,5)$ a distancia $\approx4{,}243$. La moda de esos tres vecinos es A, así que $\hat y=A$.

## Interactivo

```widget
motor: dispersion2d
modo: knn
dataset: {"generador": "blobs", "n": 60, "clases": 2, "ruido": 0.8, "semilla": 7}
controles: [{"nombre": "k", "min": 1, "max": 15, "paso": 1, "valor": 3}]
arrastrables: true
```

- Prueba a mover el deslizador de $k$ de 1 a 15 y observa cómo se suaviza la frontera de decisión.
- Prueba a arrastrar el punto de consulta muy cerca de la frontera entre clases y comprueba si la predicción cambia con distintos valores de $k$.
- Prueba a dejar $k=1$ y arrastrar un punto de una clase justo en medio de la nube de la otra: observa la "isla" que crea en la región de decisión.

## En código

```python
import numpy as np
from collections import Counter

X = np.array([[1,1],[2,1],[1,2],[5,5],[6,5],[5,6]], dtype=float)
y = np.array(['A','A','A','B','B','B'])
q = np.array([2, 2])

d = np.linalg.norm(X - q, axis=1)
k = 3
vecinos = np.argsort(d)[:k]
print(np.round(d[vecinos], 3), y[vecinos])
# [1.    1.    1.414] ['A' 'A' 'A']

print(Counter(y[vecinos]).most_common(1)[0][0])
# A
```

## Errores típicos

- **Error**: pensar que KNN "entrena" un modelo con parámetros ajustados, como la pendiente de una regresión. → **Correcto**: es un algoritmo perezoso: no hay parámetros que aprender, solo guarda los datos y calcula distancias en el momento de predecir.
- **Error**: usar $k$ par en un problema de clasificación binaria. → **Correcto**: con $k$ par puede haber empates entre clases; conviene usar $k$ impar o una regla explícita de desempate.
- **Error**: aplicar KNN sin escalar antes las variables. → **Correcto**: como depende directamente de distancias, una variable con un rango mucho mayor que las demás domina el cálculo si no se aplica [[escalado]] antes.
- **Error**: asumir que un $k$ más grande siempre generaliza mejor. → **Correcto**: un $k$ demasiado grande suaviza tanto la frontera que ignora estructura local real (subajuste), además de ralentizar cada predicción al promediar sobre más vecinos.

## En resumen

- Qué hace: predice la clase (o el valor) de un punto nuevo a partir de sus $k$ vecinos más parecidos en los datos de entrenamiento.
- Cómo funciona: 1) mide la distancia del punto nuevo a todos los de entrenamiento; 2) se queda con los $k$ más cercanos; 3) en clasificación vota la moda de sus clases; en regresión promedia sus valores.
- Fórmula clave: $\hat y = \operatorname{moda}(\{y_i : i \in N_k(\mathbf x)\})$.
- Úsalo con pocos datos y variables, y cuando te interese un modelo simple sin fase de entrenamiento; evítalo con muchas dimensiones (maldición de la dimensionalidad) o datasets grandes (cada predicción recorre todo el conjunto).
- Decisiones que importan: el valor de $k$ (por validación cruzada), la métrica de distancia y si ponderar los vecinos por cercanía.
- Trampa principal: calcular distancias sin haber escalado antes las variables.

## Autoevaluación

### Tienes un dataset con dos variables: "ingresos anuales" (en euros, hasta 100.000) y "edad" (hasta 90). Si aplicas KNN con distancia euclídea sin escalar, ¿qué ocurre?
- [ ] Nada, KNN normaliza las distancias automáticamente
- [x] Los ingresos dominarán casi por completo la distancia, y la edad apenas influirá en qué vecinos se eligen
- [ ] El algoritmo dará error porque las escalas son distintas
> Por qué: la distancia euclídea sencillamente resta y eleva al cuadrado los valores brutos; una variable con un rango mucho mayor (ingresos) aplasta la contribución de la otra (edad) si no se aplica [[escalado]] antes.

### ¿Por qué se dice que KNN es un algoritmo "perezoso" (*lazy learner*)?
- [ ] Porque tarda mucho en converger durante el entrenamiento
- [x] Porque no hay una fase de entrenamiento que ajuste parámetros: todo el cálculo se hace al predecir
- [ ] Porque solo funciona bien con pocos datos de entrenamiento
> Por qué: a diferencia de un modelo como la regresión lineal, que ajusta coeficientes de antemano, KNN se limita a memorizar los datos y calcula las distancias en el momento de cada predicción.

### Con $k=1$, un punto de entrenamiento mal etiquetado (un error de captura) queda rodeado de puntos de la otra clase. ¿Qué efecto tiene sobre las predicciones cercanas?
- [x] Crea una pequeña "isla" de la clase incorrecta alrededor de ese punto, aunque el resto de la zona sea claramente de la otra clase
- [ ] Ninguno: KNN ignora automáticamente los puntos mal etiquetados
- [ ] Hace que el algoritmo falle al no poder calcular la moda
> Por qué: con $k=1$ cada predicción depende de un único vecino, así que un solo punto ruidoso puede cambiar la predicción en su entorno inmediato; aumentar $k$ suaviza este efecto.

### Quieres usar KNN sobre un dataset con 500 variables y solo 200 observaciones. ¿Qué problema es más probable?
- [ ] Que el algoritmo no pueda calcular ninguna distancia
- [x] Que, por la maldición de la dimensionalidad, todos los puntos queden aproximadamente igual de "lejos" entre sí y la noción de vecino cercano deje de ser útil
- [ ] Que KNN necesite obligatoriamente $k=500$
> Por qué: con muchas más variables que observaciones, las distancias tienden a igualarse (ver [[integral-monte-carlo|maldición de la dimensionalidad]]); conviene reducir variables antes de aplicar KNN.

## Glosario

- **algoritmo perezoso (lazy learner)**: algoritmo que no ajusta parámetros en una fase de entrenamiento previa, sino que calcula todo (aquí, distancias) en el momento de predecir.
- **voto ponderado**: forma de combinar los vecinos en la que cada uno pesa según su cercanía al punto de consulta, en vez de pesar todos por igual.
