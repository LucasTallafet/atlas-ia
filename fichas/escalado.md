---
id: escalado
estado: borrador
---

## En una frase

El escalado ajusta el rango o la dispersión de las variables numéricas —normalizándolas entre 0 y 1 o estandarizándolas con media 0 y desviación 1— para que ninguna domine a las demás.

## Intuición

Imagina que comparas dos características de una persona: sus ingresos anuales (decenas de miles de euros) y sus años de experiencia (un puñado de unidades). Si un algoritmo mide "distancia" o "importancia" sin más, los ingresos dominarán la comparación solo porque sus números son mucho más grandes, aunque los años de experiencia sean igual de relevantes para el problema.

El escalado corrige ese desequilibrio: pone todas las variables en una escala comparable, para que el modelo las juzgue por su relación con lo que predice, no por la magnitud de sus unidades.

## Explicación

### Dos formas de escalar: normalización y estandarización

La **normalización** ajusta los valores de una variable para que queden dentro de un rango fijo, casi siempre $[0,1]$. Es útil cuando los datos presentan rangos muy dispares y el algoritmo —redes neuronales, máquinas de vectores de soporte— espera entradas acotadas. La **estandarización** (o *z-score scaling*), en cambio, no fija un rango concreto: centra los datos en una media de 0 y los escala según su desviación típica, preservando mejor la posición relativa de los valores extremos. Es la opción preferida cuando los datos siguen aproximadamente una distribución normal o el algoritmo depende de la varianza, como la regresión lineal o K-Nearest Neighbors.

### Qué algoritmos lo necesitan y cuáles no

El escalado importa en los algoritmos que miden distancias (KNN, k-means) o que optimizan por gradiente (redes neuronales, regresión con descenso de gradiente): sin él, convergen más despacio o dan un peso artificial a la variable de mayor magnitud. Los algoritmos basados en árboles de decisión, en cambio, dividen el espacio comparando valores dentro de una misma variable, no distancias entre variables distintas, así que no necesitan que los datos estén escalados.

### Cuidado: "normalización" significa varias cosas distintas

Ten cuidado con el nombre: aquí "normalizar" significa ajustar el rango de una variable con la fórmula min-max. Es un concepto distinto de [[vectores|normalizar un vector]], que consiste en dividirlo por su norma para que mida 1, y también distinto de la normalización por lotes (*Batch Normalization*) de las redes neuronales, que no es una técnica de preprocesamiento sino una capa más dentro de la red.

## Formalización

$$
X' = \frac{X - X_{\min}}{X_{\max} - X_{\min}}
$$

donde:
- $X$ es el valor original de la variable.
- $X_{\min}$, $X_{\max}$ son el valor mínimo y máximo de la variable.
- $X'$ es el valor normalizado, dentro del rango $[0,1]$.

$$
z = \frac{X - \mu}{\sigma}
$$

donde:
- $\mu$ es la media de la variable.
- $\sigma$ es la desviación estándar de la variable.
- $z$ es el valor estandarizado.

## Interactivo

```widget
motor: dispersion2d
modo: "escalado"
dataset: {"puntos": [[30, 2, 0], [45, 4, 0], [60, 7, 0], [80, 10, 0], [95, 15, 0]]}
```

- Prueba a comparar cómo quedan los puntos tras estandarizar frente a normalizar min-max: fíjate en si algún punto extremo comprime al resto.
- Prueba a fijarte en cómo cambian las distancias entre puntos antes y después de escalar: sin escalar, la variable de mayor magnitud (ingresos) domina la distancia.
- Prueba a pensar qué algoritmos —KNN, redes neuronales, árboles de decisión— notarían la diferencia entre escalar o no escalar estos datos.

## En código

```python
import numpy as np

anios_experiencia = np.array([1, 3, 5, 20])
minmax = (anios_experiencia - anios_experiencia.min()) / (anios_experiencia.max() - anios_experiencia.min())
z = (anios_experiencia - anios_experiencia.mean()) / anios_experiencia.std()
print("min-max:", np.round(minmax, 3))
print("z-score:", np.round(z, 3))
# min-max: [0.    0.105 0.211 1.   ]
# z-score: [-0.834 -0.567 -0.3    1.701]
```

## Errores típicos

- **Error**: pensar que "normalización" siempre significa lo mismo en cualquier contexto del curso. → **Correcto**: normalizar una variable (min-max) es distinto de normalizar un vector (norma 1) y de la normalización por lotes en redes neuronales.
- **Error**: escalar las variables antes de dividir en entrenamiento y prueba. → **Correcto**: como cualquier transformación del [[preprocesamiento]], ajusta el escalador solo con el conjunto de entrenamiento.
- **Error**: aplicar normalización min-max a datos con valores atípicos extremos. → **Correcto**: un solo valor extremo puede comprimir el resto de los datos en un rango muy estrecho; ahí la estandarización, o tratar antes los [[outliers|valores atípicos]], suele funcionar mejor.
- **Error**: escalar los datos antes de entrenar un árbol de decisión esperando que mejore el resultado. → **Correcto**: los árboles no dependen de la magnitud ni de la distancia entre variables, así que el escalado no les afecta.

## En resumen

- **Qué hace**: ajusta el rango o la dispersión de las variables numéricas para que ninguna domine por tener valores más grandes.
- **Cómo funciona**: la normalización min-max lleva los valores a $[0,1]$; la estandarización (z-score) los centra en media 0 y desviación 1.
- **Fórmula clave**: $z = (X-\mu)/\sigma$ para la estandarización.
- **Cuándo usarlo**: en algoritmos basados en distancia (KNN, k-means) o en optimización por gradiente (redes neuronales, regresión); no hace falta en árboles de decisión.
- **Decisión que importa**: estandarizar si los datos son aproximadamente normales o hay valores atípicos; normalizar con min-max si necesitas un rango acotado y no hay valores extremos.
- **Trampa principal**: confundir "normalizar una variable" con "normalizar un vector" o con *Batch Normalization*, tres conceptos distintos que comparten nombre.

## A fondo

La estandarización tiende a ser más robusta ante valores atípicos que la normalización min-max: si un único valor extremo eleva el máximo de una variable, la normalización min-max comprime el resto de los datos en un rango muy estrecho, mientras que la estandarización reparte su efecto de forma más suave, a través de la media y la desviación estándar. Por eso, cuando el conjunto de datos tiene [[outliers|valores atípicos]] marcados, conviene tratarlos antes de escalar en lugar de confiar en que el escalado los absorba por sí solo.

## Autoevaluación

### Vas a entrenar un modelo K-Nearest Neighbors con "ingresos anuales" (en euros) y "años de experiencia" (en unidades) sin escalar ninguna variable. ¿Qué ocurre?
- [ ] Nada: KNN ignora automáticamente la magnitud de cada variable.
- [x] La distancia entre observaciones queda dominada por los ingresos, simplemente porque sus valores son mucho más grandes.
- [ ] El modelo no podrá entrenarse hasta que se escalen los datos.
> Por qué: KNN calcula distancias combinando todas las variables tal cual están; si una tiene valores mucho mayores que otra, domina el cálculo aunque no sea más relevante para el problema.

### Tu conjunto de datos tiene una variable con un valor atípico extremo. ¿Qué método de escalado se ve más afectado por ese valor?
- [ ] La estandarización, porque depende de la media.
- [x] La normalización min-max, porque el valor atípico se convierte en el máximo y comprime el resto de los datos en un rango muy estrecho.
- [ ] Ninguno de los dos se ve afectado por valores atípicos.
> Por qué: al fijar el rango $[0,1]$ usando el mínimo y el máximo, un solo valor extremo distorsiona la escala de todos los demás; la estandarización reparte ese efecto de forma más suave a través de la media y la desviación estándar.

### ¿En qué se diferencia "normalizar una variable" (este concepto) de "normalizar un vector"?
- [ ] Son exactamente lo mismo, solo cambia el nombre según el contexto.
- [x] Normalizar una variable ajusta su rango con la fórmula min-max; normalizar un vector lo divide por su norma para que mida 1. Son operaciones distintas con nombres parecidos.
- [ ] Normalizar un vector solo se aplica a variables categóricas.
> Por qué: comparten palabra pero no operación: una transforma una columna de datos a un rango fijo, la otra reescala un vector para que tenga longitud 1.

### Entrenas un árbol de decisión con variables en escalas muy distintas (una en euros, otra en años) sin escalarlas. ¿Es necesario escalarlas para que el árbol funcione bien?
- [ ] Sí, siempre hay que escalar antes de entrenar cualquier modelo.
- [x] No: los árboles de decisión comparan valores dentro de cada variable por separado, no distancias entre variables, así que la magnitud no les afecta.
- [ ] Solo si el árbol tiene más de una variable numérica.
> Por qué: cada división de un árbol de decisión se basa en un umbral sobre una única variable, no en una distancia combinada entre variables, así que escalar no cambia el resultado.

## Glosario

- **Normalización (min-max)**: transformación que ajusta los valores de una variable a un rango fijo, habitualmente $[0,1]$, usando su mínimo y su máximo.
