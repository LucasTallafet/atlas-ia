---
id: valores-ausentes
estado: borrador
---

## En una frase

Los valores ausentes son huecos en los datos que hay que rellenar, eliminar o señalar antes de entrenar un modelo, eligiendo la técnica según cuántos son, dónde se concentran y si siguen un patrón.

## Intuición

Piensa en una encuesta donde algunas personas dejan una pregunta en blanco. Puedes rellenar la casilla con la respuesta más habitual, eliminar a esa persona del análisis, o incluso preguntarte si el hecho de no responder ya te dice algo. Con los datos de un modelo pasa lo mismo: los **valores ausentes** son huecos que no puedes dejar sin más, porque la mayoría de los algoritmos no saben qué hacer con un "no sé".

Antes de decidir cómo rellenarlos, conviene fijarse en cuántos hay, si se concentran en una variable o en un grupo concreto de observaciones, y si esa ausencia es aleatoria o esconde un patrón. Tratar todos los huecos igual, sin mirar estas pistas, es la forma más fácil de introducir sesgo por accidente.

## Explicación

### Por qué importan la cantidad y la ubicación

El tratamiento adecuado depende de si los valores ausentes se concentran en **columnas** (una variable con muchos huecos) o en **filas** (observaciones con varios datos incompletos). Si una columna tiene un porcentaje muy alto de valores ausentes, orientativamente por encima de un 30-40 %, y no es esencial para el modelo, suele ser más práctico eliminarla que intentar imputarla con poca información fiable. Si en cambio son pocas filas las afectadas y no comprometen la representatividad del conjunto de datos, eliminarlas es la opción más simple.

### Imputar variables numéricas

La opción más sencilla es sustituir el hueco por la **media** o la **mediana** de la columna; la mediana es preferible cuando la distribución es asimétrica, por el mismo motivo por el que es más robusta que la media ante [[outliers|valores atípicos]]. En datos ordenados, como una serie temporal, la **interpolación** estima el valor a partir de los vecinos inmediatos (ver [[series-temporales]]). Cuando hay relaciones claras con otras variables, se puede recurrir a modelos predictivos: una regresión si la relación es aproximadamente lineal, o **K-Nearest Neighbors (KNN)**, que busca las $k$ observaciones más parecidas —según las demás variables— y usa su media para imputar.

### Imputar variables categóricas

Con variables categóricas, la sustitución más simple es la **moda**: la categoría más frecuente. Cuando ese criterio es demasiado tosco, KNN vuelve a ser útil, esta vez tomando la categoría más repetida entre los vecinos más cercanos en las variables numéricas disponibles. También es habitual crear una categoría nueva, como "desconocido", cuando el propio hecho de que falte el dato puede ser informativo en sí mismo —por ejemplo, si la ausencia de historial crediticio indica que el cliente es nuevo—.

### ¿La ausencia es aleatoria o dice algo por sí misma?

Antes de imputar, conviene preguntarse si los datos faltan al azar o siguen un patrón. Si la ausencia está distribuida aleatoriamente, el impacto de imputar es menor; si en cambio se concentra en un grupo concreto —por ejemplo, clientes nuevos sin historial—, imputar sin más puede introducir sesgo, y a veces conviene tratar ese grupo por separado o crear una variable que señale la ausencia en sí misma.

## Formalización

$$
X' = \frac{\sum_{i=1}^{N} X_i}{N}
$$

donde:
- $X_i$ son los valores conocidos (no ausentes) de la variable.
- $N$ es el número de valores conocidos.
- $X'$ es el valor que se usa para reemplazar cada hueco (imputación con la media).

$$
d(\mathbf{a}, \mathbf{b}) = \sqrt{\sum_{j=1}^{d} (a_j - b_j)^2}
$$

donde:
- $\mathbf{a}$, $\mathbf{b}$ son dos observaciones descritas por las mismas $d$ variables.
- $d(\mathbf{a}, \mathbf{b})$ es la distancia euclidiana entre ellas, la que usa KNN para encontrar los vecinos más cercanos a la observación con el valor ausente.

## Interactivo

```widget
motor: datos1d
modo: imputacion
valores: [200, 220, null, 240]
unidad: "miles de €"
```

- Prueba a imputar el hueco con la media y luego con la mediana, y observa cómo cambia el valor si antes añades un precio mucho más alto al resto de los datos.
- Prueba a eliminar directamente la observación con el hueco en vez de imputarla, y compara cómo cambia la media del conjunto.
- Prueba a pensar qué harías si, en vez de un precio, el hueco estuviera en una variable categórica: ¿qué método de imputación usarías?

## En código

```python
import numpy as np
from sklearn.impute import SimpleImputer

precios = np.array([[200], [220], [np.nan], [240]])  # miles de €
imputer = SimpleImputer(strategy="mean")
print(imputer.fit_transform(precios).ravel())
# [200. 220. 220. 240.]  -> el hueco se rellena con la media de los 3 valores conocidos
```

## Errores típicos

- **Error**: imputar siempre con la media, sin comprobar si la distribución es asimétrica. → **Correcto**: con distribuciones asimétricas o valores atípicos, la mediana representa mejor el valor típico.
- **Error**: eliminar filas o columnas con valores ausentes sin comprobar cuántas hay ni si se concentran en un grupo concreto. → **Correcto**: revisa antes el porcentaje y el patrón; eliminar de más puede sesgar el conjunto de datos.
- **Error**: tratar la imputación como un paso neutro que no afecta al modelo. → **Correcto**: imputar reduce la variabilidad real de los datos y puede introducir sesgo si la ausencia no es aleatoria.
- **Error**: usar el mismo método de imputación para variables numéricas y categóricas. → **Correcto**: las numéricas admiten media, mediana o interpolación; las categóricas necesitan moda, KNN o una categoría nueva.

## En resumen

- **Qué hace**: decide cómo rellenar, eliminar o señalar los huecos de un conjunto de datos antes de modelar.
- **Cómo funciona**: 1) mide cuántos valores faltan y dónde se concentran; 2) comprueba si la ausencia parece aleatoria o sigue un patrón; 3) elige entre eliminar, imputar (media, mediana, moda, interpolación, KNN) o crear una categoría "desconocido".
- **Fórmula clave**: imputación con la media, $X' = \frac{\sum X_i}{N}$, calculada solo con los valores conocidos.
- **Cuándo usarlo**: siempre que haya valores ausentes, como parte del [[preprocesamiento]].
- **Decisiones que importan**: el porcentaje de huecos por columna o fila, y si la ausencia en sí misma aporta información.
- **Trampa principal**: imputar sin mirar el patrón de ausencia puede introducir sesgo en vez de corregirlo.

## A fondo

Para saber si los valores ausentes siguen un patrón, es útil visualizarlos: un **mapa de calor** resalta con un color distinto cada celda ausente, revelando de un vistazo en qué filas y columnas se concentran; un **gráfico de barras** cuenta los ausentes por columna; y un **dendrograma de valores ausentes** agrupa las columnas cuyos patrones de ausencia se parecen, lo que puede sugerir una causa común, como dos preguntas de una encuesta que la gente suele saltarse juntas.

## Autoevaluación

### Una variable "historial crediticio" tiene un 40 % de valores ausentes, concentrados en clientes que se dieron de alta hace menos de un mes. ¿Qué es lo más razonable?
- [ ] Imputar todos los huecos con la media de los clientes que sí tienen historial.
- [x] Investigar si la ausencia es informativa por sí misma —clientes nuevos— y considerar una categoría "sin historial" o tratarlos por separado.
- [ ] Ignorar el patrón y eliminar solo las filas con huecos al azar.
> Por qué: cuando la ausencia se concentra en un grupo con una causa clara (clientes nuevos), imputar con la media del resto introduciría sesgo; conviene tratar esa ausencia como información en sí misma.

### ¿Por qué la mediana suele preferirse a la media para imputar una variable numérica con distribución asimétrica?
- [ ] Porque la mediana siempre da un número entero, más fácil de interpretar.
- [x] Porque la mediana es más robusta ante valores extremos y representa mejor el valor típico cuando la distribución no es simétrica.
- [ ] Porque la media solo se puede calcular si no hay valores ausentes.
> Por qué: la media se ve arrastrada por los valores extremos de una cola larga, mientras que la mediana refleja mejor dónde se concentra la mayoría de los datos.

### Tienes una variable categórica "tipo de combustible" con algunos valores ausentes, y dispones de otras variables numéricas (peso, potencia) muy relacionadas con ella. ¿Qué método de imputación aprovecha mejor esa relación?
- [ ] Imputación por la moda de toda la columna.
- [x] Imputación con K-Nearest Neighbors, usando peso y potencia para encontrar observaciones similares.
- [ ] Eliminar la columna completa.
> Por qué: KNN usa la información de las variables numéricas relacionadas para encontrar observaciones parecidas y tomar de ellas la categoría más frecuente, en vez de aplicar la misma moda global a todos los huecos.

### En el ejemplo de precios (200, 220, hueco, 240 miles de €), ¿qué le ocurre a la variabilidad del conjunto de datos al imputar el hueco con la media (220)?
- [ ] Aumenta, porque se añade un dato nuevo.
- [x] Disminuye, porque el valor imputado coincide con el centro de los datos y no aporta variación real.
- [ ] No cambia en absoluto.
> Por qué: cualquier imputación por la media añade un valor "típico" que reduce artificialmente la dispersión real de los datos, un efecto a tener en cuenta si se calculan después estadísticos como la desviación típica.

## Glosario

- **Valor ausente**: dato que falta en una observación, representado habitualmente como un hueco o un valor nulo.
- **Imputación**: técnica que sustituye un valor ausente por una estimación calculada a partir del resto de los datos.
- **Interpolación**: estimación de un valor ausente a partir de los valores vecinos, habitual en datos ordenados como las series temporales.
