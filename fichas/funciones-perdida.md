---
id: funciones-perdida
estado: borrador
---

## En una frase

Una función de pérdida convierte el error de una predicción en un único número que el algoritmo intenta hacer lo más pequeño posible.

## Intuición

Imagina que lanzas dardos a una diana y alguien lleva la puntuación. Un juez podría restar puntos proporcionalmente a la distancia al centro, o podría penalizar con mucha más dureza los tiros muy desviados que los casi perfectos. Ambos jueces "miden el error", pero premian y castigan de forma distinta, y eso cambia qué tiro consideras aceptable.

Con un modelo pasa igual: la función de pérdida es el juez que decide cómo de grave es cada fallo. Elegir una u otra no es un detalle técnico menor, porque el algoritmo ajustará los parámetros para complacer exactamente a ese juez.

## Explicación

### Pérdida de una predicción, coste del conjunto

Conviene distinguir dos palabras que se usan casi como sinónimos. La **función de pérdida** mide el error de una sola predicción, comparando el valor real $y$ con el predicho $\hat y$. La **función de coste** agrega esas pérdidas —normalmente promediándolas— sobre todo el conjunto de entrenamiento, y es ese número agregado el que el algoritmo intenta minimizar durante el ajuste de parámetros que viste en [[componentes-ml]].

### Error cuadrático medio (MSE) y error absoluto medio (MAE)

El **error cuadrático medio (MSE)** promedia el cuadrado de cada error: castiga con fuerza los errores grandes porque el cuadrado los amplifica, lo que lo hace sensible a valores atípicos. El **error absoluto medio (MAE)**, en cambio, promedia el valor absoluto del error: trata todos los errores de forma proporcional a su tamaño, sin amplificar los grandes, y por eso resulta más robusto frente a atípicos, aunque menos suave de optimizar por gradiente.

### Variantes: RMSE, MSLE y Huber

La raíz del MSE (**RMSE**) solo cambia la escala: al deshacer el cuadrado, el error queda en las mismas unidades que la variable predicha, más fácil de interpretar. El **MSLE** aplica el logaritmo antes de elevar al cuadrado, y así penaliza más los errores relativos que los absolutos, útil si predices magnitudes que pueden crecer mucho, como visitas a una web. El **error de Huber** combina lo mejor de MSE y MAE: se comporta como el MSE para errores pequeños (por debajo de un umbral $\delta$) y como el MAE para errores grandes, siendo así suave de optimizar y robusto frente a atípicos a la vez.

### Pérdidas para clasificación

Cuando la salida no es un número sino una probabilidad, MSE y MAE dejan de ser la opción natural. En clasificación binaria se usa la **entropía cruzada binaria**, y en clasificación con varias categorías, su extensión, la **entropía cruzada categórica**: ambas penalizan con mucha fuerza una predicción confiada y equivocada. Verás su forma exacta, ligada al concepto de verosimilitud, en [[regresion-logistica]].

## Formalización

$$
\text{MSE} = \frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2
$$

donde:

- $y_i$ es el valor real de la observación $i$.
- $\hat{y}_i$ es el valor predicho por el modelo para esa observación.
- $n$ es el número total de observaciones.

$$
\text{MAE} = \frac{1}{n} \sum_{i=1}^{n} |y_i - \hat{y}_i|
$$

donde los símbolos son los mismos que en el MSE.

$$
L_{\delta}(y, \hat y) = \begin{cases} \dfrac{1}{2}(y-\hat y)^2 & \text{si } |y-\hat y| \leq \delta \\ \delta\,|y-\hat y| - \dfrac{1}{2}\delta^2 & \text{si } |y-\hat y| > \delta \end{cases}
$$

donde:

- $\delta$ es el umbral que decide a partir de qué tamaño de error se pasa de castigo cuadrático a castigo lineal.
- $|y-\hat y|$ es el valor absoluto del error de una predicción.

**Ejemplo**: con $\delta=1$, un error pequeño $e=1$ y uno grande $e=5$ se penalizan así: $\text{MSE}=[1,\ 25]$, $\text{MAE}=[1,\ 5]$, $\text{Huber}=[0{,}5,\ 4{,}5]$. El MSE castiga el error grande veinticinco veces más que el pequeño; el MAE, solo cinco veces más; el Huber queda a medio camino, mucho más cerca del comportamiento del MAE que del MSE en este caso.

## Interactivo

```widget
motor: funcion
modo: perdidas
funciones: [{"expr": "x^2", "etiqueta": "MSE"}, {"expr": "abs(x)", "etiqueta": "MAE"}, {"expr": "0.5*min(abs(x),d)^2 + d*(abs(x)-min(abs(x),d))", "etiqueta": "Huber"}]
parametros: [{"nombre": "d", "min": 0.2, "max": 3, "paso": 0.1, "valor": 1, "etiqueta": "umbral delta (Huber)"}]
x: [-4, 4]
```

- Prueba a fijarte en $x=\pm3$ (un residuo grande, como un valor atípico): compara cuánto más alto sube la curva del MSE frente a la del MAE.
- Prueba a mover $\delta$ hasta un valor muy pequeño: la curva de Huber se acerca a la del MAE.
- Prueba a mover $\delta$ hasta el máximo: la curva de Huber se acerca a la del MSE.

## En código

```python
import numpy as np

def huber(e, d):
    m = np.minimum(np.abs(e), d)
    return 0.5 * m**2 + d * (np.abs(e) - m)

e = np.array([1.0, 5.0])  # un error pequeño y uno grande (outlier)
print("MSE :", e**2)
print("MAE :", np.abs(e))
print("Huber:", huber(e, 1.0))
# MSE : [ 1. 25.]
# MAE : [1. 5.]
# Huber: [0.5 4.5]
```

## Errores típicos

- **Error**: usar "pérdida" y "coste" como si fueran el mismo cálculo. → **Correcto**: la pérdida es el error de un ejemplo individual; el coste es su agregación (normalmente la media) sobre todo el conjunto.
- **Error**: pensar que el MSE es siempre la mejor opción por defecto. → **Correcto**: el MSE es sensible a atípicos; si los datos tienen valores extremos, el MAE o el Huber suelen generalizar mejor.
- **Error**: usar MSE o MAE para un problema de clasificación. → **Correcto**: cuando la salida es una probabilidad o una categoría, la pérdida adecuada es la entropía cruzada, no el error cuadrático o absoluto.
- **Error**: confundir el MSE que se optimiza durante el entrenamiento con el MSE que se reporta como resultado final. → **Correcto**: son el mismo cálculo, pero cumplen papeles distintos: uno guía el ajuste de parámetros; el otro solo describe el rendimiento del modelo ya entrenado.

## En resumen

- **Qué hace y para qué sirve**: mide el error de las predicciones de un modelo con un solo número que el algoritmo intenta minimizar.
- **Cómo funciona**: compara cada predicción con el valor real, calcula una pérdida por ejemplo y las agrega (normalmente promediándolas) en una función de coste.
- **Fórmula clave**: $\text{MSE} = \frac{1}{n}\sum (y_i-\hat y_i)^2$, que penaliza los errores grandes con más fuerza que el MAE.
- **Cuándo usar cada una**: MSE cuando los errores grandes son especialmente graves; MAE cuando hay valores atípicos que no quieres que dominen; Huber cuando quieres un término medio.
- **Decisión que importa**: el umbral $\delta$ del Huber, que marca dónde termina el comportamiento cuadrático y empieza el lineal.
- **Trampa principal**: confundir la pérdida (para regresión) con la que hace falta en clasificación (entropía cruzada), o confundir pérdida optimizada con métrica reportada.

## Autoevaluación

### ¿Qué diferencia a la función de pérdida de la función de coste?
- [ ] Son exactamente lo mismo, solo cambia el nombre.
- [x] La pérdida mide el error de un ejemplo; el coste agrega esas pérdidas (normalmente la media) sobre todo el conjunto de entrenamiento.
- [ ] La pérdida se usa en clasificación y el coste en regresión.
> Por qué: el coste es la agregación de la pérdida individual sobre todos los ejemplos; es esa agregación la que el algoritmo minimiza.

### Un conjunto de errores incluye varios valores atípicos muy grandes. ¿Qué pérdida amplificará más su efecto sobre el ajuste del modelo?
- [ ] El MAE, porque trata todos los errores por igual.
- [x] El MSE, porque eleva al cuadrado cada error y los grandes crecen mucho más deprisa.
- [ ] Ninguna, todas las pérdidas tratan igual a los atípicos.
> Por qué: al elevar al cuadrado, el MSE da un peso desproporcionado a los errores grandes, mientras que el MAE los penaliza de forma proporcional a su tamaño.

### Con $\delta=1$, ¿por qué el error de Huber para $e=5$ (que vale $4{,}5$) está mucho más cerca del MAE ($5$) que del MSE ($25$)?
- [ ] Porque el Huber siempre coincide exactamente con el MAE.
- [x] Porque $5$ supera el umbral $\delta$, así que Huber pasa a comportarse como una función lineal del error, igual que el MAE.
- [ ] Porque el Huber ignora los errores mayores que $\delta$.
> Por qué: por encima del umbral $\delta$, el Huber cambia del término cuadrático al lineal, acercándose al comportamiento del MAE en vez de al del MSE.

### Estás entrenando un clasificador que predice la probabilidad de que un correo sea spam. ¿Qué pérdida es la adecuada?
- [ ] El error cuadrático medio (MSE), porque siempre es la opción por defecto.
- [x] La entropía cruzada binaria, porque la salida es una probabilidad, no un valor continuo cualquiera.
- [ ] El error absoluto medio (MAE), porque es más robusto.
> Por qué: MSE y MAE están pensados para salidas continuas; cuando la salida es una probabilidad de pertenecer a una clase, la pérdida estándar es la entropía cruzada.

## Glosario

- **Función de pérdida**: número que mide el error de una única predicción; el algoritmo ajusta los parámetros para hacerlo lo más pequeño posible.
- **Función de coste**: agregación (normalmente la media) de la pérdida sobre todos los ejemplos de entrenamiento; es lo que el algoritmo minimiza en la práctica.
- **Error de Huber**: pérdida que combina el MSE para errores pequeños y el MAE para errores grandes, controlada por un umbral $\delta$.
- **MSE como pérdida frente a MSE como métrica**: como pérdida, guía el ajuste de parámetros; como métrica (ver [[metricas-regresion]]), solo describe el rendimiento ya entrenado.
