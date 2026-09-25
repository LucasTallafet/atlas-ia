---
id: outliers
estado: borrador
---

## En una frase

Un valor atípico es una observación que se desvía tanto del resto de los datos que, si no se detecta y se trata, puede distorsionar los estadísticos y el aprendizaje de un modelo.

## Intuición

Imagina que calculas el salario medio de una oficina de 20 personas que ganan entre 25.000 y 40.000 euros al año. Si añades al director general, que gana 2.000.000, la media se dispara muy por encima de lo que cobra casi todo el mundo. Ese único salario extremo es un **valor atípico** (*outlier*): una observación que se aleja tanto del resto que, si no la tratas con cuidado, distorsiona cualquier resumen o modelo que calcules con esos datos.

Los valores atípicos no son siempre errores: a veces reflejan un caso real, aunque poco frecuente. Por eso la primera pregunta nunca es "¿lo elimino?", sino "¿por qué está ahí?".

## Explicación

### Cómo detectar un valor atípico

El método más simple es el **basado en la desviación estándar**: asume que los datos siguen aproximadamente una distribución normal y marca como atípico cualquier valor que se aleje de la media más de un número fijo de desviaciones estándar, habitualmente 3 (**Z-score**). Es un método sensible al propio valor atípico: como la media y la desviación estándar se calculan con todos los datos, un valor muy extremo también infla la desviación estándar, lo que puede hacer que su propio Z-score se quede por debajo del umbral y pase desapercibido.

El método basado en el [[estadistica-descriptiva|rango intercuartílico (IQR)]] es **no paramétrico**: no asume ninguna forma concreta para la distribución de los datos, y por eso es más robusto cuando hay valores extremos o la distribución no es normal. Se apoya en los cuartiles ($Q_1$ y $Q_3$) y no en la media, que la [[estadistica-descriptiva|mediana]] ya evita por el mismo motivo de robustez.

Ambos métodos son **univariados**: analizan una variable a la vez. Un valor puede parecer normal en cada variable por separado y, aun así, ser atípico al considerar varias a la vez —por ejemplo, un coche de precio moderado pero con un consumo de combustible extremadamente bajo—; para detectar estos casos **multivariados** se usan técnicas basadas en densidad, como DBSCAN.

### Qué hacer una vez detectado

No hay una única receta. Se puede **eliminar** el valor si es claramente un error de registro (una puntuación de 150 sobre 10); **transformarlo**, por ejemplo con logaritmo o mediante *winsorización* (recortarlo al límite del rango normal), para reducir su influencia sin perder la observación; **imputarlo**, sustituyéndolo por un valor más representativo; o simplemente aceptarlo y usar un modelo poco sensible a valores extremos.

### Impacto según el algoritmo

Los modelos que ajustan parámetros minimizando el error cuadrático —como la regresión lineal— son muy sensibles a los valores atípicos, porque ese error amplifica el peso de las desviaciones grandes. Los algoritmos basados en distancia, como K-Nearest Neighbors, también se ven afectados: un punto extremo distorsiona qué observaciones cuentan como "cercanas". Los modelos basados en árboles, en cambio, suelen ser más robustos, aunque una gran cantidad de valores atípicos también puede reducir su capacidad de generalizar.

## Formalización

$$
Z = \frac{X - \mu}{\sigma}
$$

donde:
- $X$ es el valor observado.
- $\mu$ es la media de la variable.
- $\sigma$ es la desviación estándar de la variable.

Un valor se considera atípico si $|Z| > 3$, aunque el umbral puede ajustarse.

$$
\text{límite inferior} = Q_1 - 1{,}5 \times \text{IQR}, \qquad \text{límite superior} = Q_3 + 1{,}5 \times \text{IQR}
$$

donde:
- $Q_1$ y $Q_3$ son el primer y el tercer cuartil de la variable.
- $\text{IQR} = Q_3 - Q_1$ es el rango intercuartílico.

## Interactivo

```widget
motor: datos1d
modo: outliers
valores: [22, 24, 25, 27, 28, 120]
unidad: "miles de €"
```

- Prueba a arrastrar el valor 120 hacia abajo poco a poco: observa en qué punto deja de marcarse como atípico según el IQR.
- Prueba a comparar qué método —Z-score o IQR— marca antes el valor 120 como atípico, y relaciónalo con cómo el propio valor extremo infla la desviación típica.
- Prueba a añadir un segundo valor alto, por ejemplo 100, y observa cómo cambian los límites de ambos métodos al haber ahora dos valores extremos.

## En código

```python
import numpy as np

ingresos = np.array([22, 24, 25, 27, 28, 120])  # miles de €
mu, sigma = ingresos.mean(), ingresos.std()
z = (ingresos - mu) / sigma
print("Z-scores:", np.round(z, 2))

q1, q3 = np.percentile(ingresos, [25, 75])
iqr = q3 - q1
print("límite superior IQR:", q3 + 1.5 * iqr)
# Z-scores: [-0.54 -0.48 -0.45 -0.4  -0.37  2.23]  -> ningún Z supera 3
# límite superior IQR: 33.0  -> el valor 120 sí queda fuera
```

## Errores típicos

- **Error**: confiar en el Z-score esperando que un valor claramente extremo siempre supere el umbral de 3. → **Correcto**: un valor muy extremo infla también la desviación estándar con la que se calcula su propio Z-score, así que puede pasar desapercibido; el IQR suele ser más fiable en muestras pequeñas o muy sesgadas.
- **Error**: eliminar cualquier valor atípico sin investigar su origen. → **Correcto**: primero comprueba si es un error de registro o un caso real; eliminar sin justificación puede borrar información valiosa.
- **Error**: usar el mismo criterio univariado para detectar atípicos en problemas donde varias variables importan a la vez. → **Correcto**: un valor puede parecer normal variable a variable y ser atípico en conjunto; ahí hacen falta técnicas multivariadas como DBSCAN.
- **Error**: asumir que todos los modelos se ven igual de afectados por los valores atípicos. → **Correcto**: los modelos lineales y los basados en distancia son sensibles; los basados en árboles son, en general, más robustos.

## En resumen

- **Qué hace**: identifica observaciones que se desvían mucho del resto de los datos y decide cómo tratarlas antes de modelar.
- **Cómo se detecta**: Z-score (asume normalidad, umbral habitual $|Z|>3$) o rango intercuartílico (no paramétrico, más robusto); para varias variables a la vez, técnicas multivariadas como DBSCAN.
- **Fórmula clave**: $\text{límite} = Q_1 - 1{,}5\,\text{IQR}$ y $Q_3 + 1{,}5\,\text{IQR}$.
- **Cuándo usarlo**: en todo conjunto de datos, dentro del [[eda|EDA]] y antes del [[preprocesamiento]].
- **Decisiones que importan**: eliminar, transformar (logaritmo, *winsorización*), imputar o usar un modelo robusto.
- **Trampa principal**: el propio valor atípico puede inflar la desviación estándar y ocultarse frente al Z-score; no ocurre lo mismo con el IQR.

## A fondo

En conjuntos de datos de alta dimensión, los métodos basados en densidad como **DBSCAN** agrupan los puntos según cuántos vecinos tienen dentro de una distancia $\varepsilon$; los puntos que no alcanzan el mínimo de vecinos necesario para pertenecer a un grupo se etiquetan como ruido, lo que los convierte en una forma natural de detectar valores atípicos multivariados sin asumir ninguna distribución concreta. Otra opción habitual es *Isolation Forest*, que aísla observaciones construyendo árboles aleatorios: los valores atípicos tienden a quedar aislados con menos particiones que el resto, porque se diferencian de sus vecinos en más de una dimensión a la vez.

## Autoevaluación

### Con los datos del interactivo (22, 24, 25, 27, 28, 120 miles de €), el Z-score del valor 120 es aproximadamente 2,23, por debajo del umbral habitual de 3. ¿Por qué el IQR sí lo marca como atípico y el Z-score no?
- [ ] Porque el IQR y el Z-score miden cosas completamente distintas y no son comparables.
- [x] Porque el propio valor 120 infla la desviación estándar con la que se calcula el Z-score, mientras que el IQR se basa en los cuartiles y es más robusto a ese efecto.
- [ ] Porque el umbral de 3 solo es válido para conjuntos de datos con más de 100 observaciones.
> Por qué: el Z-score depende de $\sigma$, calculada con todos los datos incluido el atípico; un valor muy extremo puede "enmascarar" su propio Z-score al agrandar $\sigma$. El IQR no usa la media ni la desviación estándar, así que no sufre ese problema.

### En un conjunto de datos sobre coches, un modelo con precio moderado pero consumo de combustible extremadamente bajo no destaca en ningún histograma individual, pero sí al cruzar precio y consumo. ¿Qué tipo de valor atípico es?
- [ ] Univariado, porque afecta a una sola variable.
- [x] Multivariado, porque solo se detecta al considerar varias variables a la vez.
- [ ] No es un valor atípico si ninguna variable individual lo marca.
> Por qué: los valores atípicos multivariados pueden parecer normales variable a variable y solo revelarse al analizar la combinación de varias características simultáneamente.

### Detectas que una puntuación de examen registrada es 150 sobre una escala de 0 a 10. ¿Qué tratamiento es más adecuado?
- [ ] Aplicar una transformación logarítmica para suavizarla.
- [x] Eliminarla, porque es un error de registro evidente y no un caso real.
- [ ] Dejarla tal cual, ya que los árboles de decisión son robustos a valores atípicos.
> Por qué: un valor imposible dentro de la escala del problema es casi con seguridad un error, así que eliminarlo está justificado, a diferencia de un valor extremo pero plausible dentro del dominio.

### En un modelo de regresión lineal y en un K-Nearest Neighbors entrenados con el mismo conjunto de datos que tiene un valor muy atípico, ¿qué es más probable que ocurra?
- [ ] Ninguno de los dos modelos se verá afectado.
- [x] Ambos se verán afectados: la regresión lineal porque minimiza el error cuadrático, y KNN porque depende de distancias entre puntos.
- [ ] Solo se verá afectado KNN, porque la regresión lineal es inmune a los valores atípicos.
> Por qué: los modelos lineales amplifican el peso de las desviaciones grandes al minimizar el error cuadrático, y los modelos basados en distancia ven distorsionada la noción de "vecino cercano" por un punto extremo.

## Glosario

- **Valor atípico** (*outlier*): observación que se desvía considerablemente del patrón general de los datos.
- **Z-score**: número de desviaciones estándar que separa un valor de la media de su variable.
- **Método no paramétrico**: técnica que no asume ninguna forma concreta para la distribución de los datos.
- **Winsorización**: técnica que sustituye los valores atípicos por el valor del límite normal más cercano, en vez de eliminarlos.
