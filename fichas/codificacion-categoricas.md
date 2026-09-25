---
id: codificacion-categoricas
estado: borrador
---

## En una frase

La codificación de variables categóricas convierte categorías como "rojo" o "alto" en números, eligiendo una técnica u otra según si existe un orden real y cuántas categorías hay.

## Intuición

Imagina que tienes que rellenar un formulario numérico y una casilla pide tu color favorito. No puedes escribir "azul": necesitas un código. Podrías numerar los colores en el orden en que los escribiste (1, 2, 3...), crear una casilla de sí/no por cada color, o anotar cuántas veces se elige cada uno en tu grupo de amigos. Cada opción es una forma distinta de traducir una categoría a un número, y cada una tiene consecuencias distintas para quien lea después esos números.

Con un modelo de [[que-es-ml|machine learning]] pasa lo mismo: solo entiende números, así que toda [[tipos-datos|variable categórica]] debe convertirse antes de entrenar. La técnica que elijas decide si el modelo interpretará un orden que no existe, si el conjunto de datos crecerá demasiado o si se filtrará información que no debería ver todavía.

## Explicación

### Label encoding: simple, pero con un orden que no pediste

El **label encoding** (codificación de etiquetas) asigna un entero distinto a cada categoría: 'bajo'→0, 'medio'→1, 'alto'→2. Es inmediato de aplicar, pero introduce un **orden implícito** entre categorías que puede no existir. Si codificas {'rojo', 'azul', 'verde'} como 0, 1, 2, el modelo puede interpretar que "verde" es el doble de "azul", una relación sin sentido.

### One-hot encoding: sin orden, pero con más columnas

El **one-hot encoding** evita ese problema creando una columna binaria por categoría: solo una vale 1 (la categoría presente) y el resto, 0. Así el modelo trata las categorías como independientes entre sí. El coste es la **dimensionalidad**: una variable con muchas categorías genera muchas columnas nuevas, la mayoría con ceros, lo que puede ralentizar el entrenamiento y complicar la generalización de modelos lineales.

### Ordinal encoding: cuando el orden sí existe

La **codificación ordinal** también asigna enteros crecientes, pero solo tiene sentido cuando las categorías tienen una **jerarquía real**, como niveles de satisfacción o estudios. A diferencia del label encoding, aquí el orden es intencionado. Su riesgo es asumir que las distancias entre niveles son iguales: la diferencia entre "muy insatisfecho" y "neutral" no tiene por qué ser la misma que entre "satisfecho" y "muy satisfecho".

### Target encoding: la categoría vale lo que predice

El **target encoding** sustituye cada categoría por un resumen de la variable objetivo dentro de ella —normalmente su media—, en vez de un valor arbitrario. Captura relaciones complejas entre la categoría y lo que se predice sin añadir columnas, lo que lo hace muy útil con **alta cardinalidad** (muchas categorías distintas). Su riesgo principal es la **fuga de datos** (*data leakage*): si el promedio se calcula usando también las filas de validación o prueba, el modelo "ve" información que no debería tener antes de predecir. Para mitigarlo se aplica **suavizado** (*smoothing*, ver Formalización) y, en variantes como **Leave-One-Out**, cada fila se codifica excluyendo su propio valor del cálculo del promedio.

### Codificación por frecuencia: cuánto pesa cada categoría

La **codificación por frecuencia** sustituye cada categoría por la proporción de veces que aparece en los datos. Reduce la dimensionalidad igual que el target encoding, pero sin usar la variable objetivo, por lo que no sufre fuga de datos; a cambio, no captura relación alguna con lo que se predice si la frecuencia de una categoría no está relacionada con el resultado.

### Codificación binaria: comprimir muchas categorías en pocos bits

La **codificación binaria** asigna un entero a cada categoría, lo convierte a binario y reparte sus dígitos en varias columnas: con solo $\lceil \log_2 k \rceil$ columnas se representan $k$ categorías, muchas menos que el one-hot. A cambio, pierde algo de interpretabilidad directa: mirando una fila de bits no se lee la categoría original a simple vista.

### Cómo elegir

La decisión combina tres factores: si existe un **orden real** (ordinal u ordinal-consciente, frente a one-hot o binaria si no lo hay), cuántas **categorías** hay (one-hot con pocas; frecuencia, target o binaria con muchas) y qué **modelo** vas a usar —los árboles de decisión toleran bien enteros arbitrarios porque comparan una variable a la vez, mientras que los modelos lineales o basados en distancia son sensibles a relaciones numéricas espurias—.

## Formalización

$$
\text{enc}(c) = \frac{n_c \cdot \bar{y}_c + m \cdot \bar{y}}{n_c + m}
$$

donde:

- $c$ es la categoría que se codifica.
- $n_c$ es el número de observaciones de la categoría $c$.
- $\bar{y}_c$ es la media de la variable objetivo dentro de la categoría $c$.
- $\bar{y}$ es la media global de la variable objetivo en todo el conjunto de datos.
- $m$ es el parámetro de suavizado: cuanto mayor, más se acerca la codificación a la media global cuando $n_c$ es pequeño, evitando que categorías con pocas observaciones tengan un valor extremo poco fiable.

Para la codificación binaria, el número de columnas necesarias para $k$ categorías es $\lceil \log_2 k \rceil$: con $k=4$ categorías bastan $2$ columnas, frente a las $4$ que exigiría el one-hot encoding.

## Interactivo

```widget
motor: pasos
---
### Una columna categórica de partida

| Fila | ciudad | compra |
|---|---|---|
| 1 | Madrid | 1 |
| 2 | Barcelona | 0 |
| 3 | Valencia | 1 |
| 4 | Madrid | 0 |
---
### Label encoding

Cada ciudad recibe un entero según el orden en que aparece por primera vez.

| Fila | ciudad | ciudad_label |
|---|---|---|
| 1 | Madrid | 0 |
| 2 | Barcelona | 1 |
| 3 | Valencia | 2 |
| 4 | Madrid | 0 |

Cuidado: nada garantiza que Valencia (2) "valga el doble" que Barcelona (1); no hay ningún orden real entre ciudades.
---
### One-hot encoding

Una columna binaria por ciudad.

| Fila | ciudad_Barcelona | ciudad_Madrid | ciudad_Valencia |
|---|---|---|---|
| 1 | 0 | 1 | 0 |
| 2 | 1 | 0 | 0 |
| 3 | 0 | 0 | 1 |
| 4 | 0 | 1 | 0 |
---
### Codificación binaria

Con 3 ciudades bastan 2 columnas de bits (índice 1, 2, 3 en binario).

| Fila | ciudad | bit1 | bit2 |
|---|---|---|---|
| 1 | Madrid | 0 | 1 |
| 2 | Barcelona | 1 | 0 |
| 3 | Valencia | 1 | 1 |
| 4 | Madrid | 0 | 1 |
---
### Target encoding

Cada ciudad se reemplaza por la media de "compra" dentro de esa ciudad.

| Fila | ciudad | compra | ciudad_target |
|---|---|---|---|
| 1 | Madrid | 1 | 0.5 |
| 2 | Barcelona | 0 | 0.0 |
| 3 | Valencia | 1 | 1.0 |
| 4 | Madrid | 0 | 0.5 |

Madrid aparece dos veces (compras 1 y 0), así que su media es $0{,}5$; Barcelona y Valencia solo aparecen una vez, así que su "media" es directamente su único valor, señal de que aquí el suavizado ayudaría a no fiarse tanto de una sola observación.
```

- Prueba a comparar cuántas columnas nuevas genera el one-hot frente a la binaria con estas mismas 3 ciudades.
- Prueba a pensar qué pasaría con el label encoding si un modelo lineal interpretase que Valencia (2) es "más" que Madrid (0): ¿tiene sentido esa relación para esta variable?
- Prueba a imaginar que Valencia tuviera solo 1 observación con compra=1: ¿confiarías igual en un target encoding de $1{,}0$ para esa categoría que en el de Madrid, calculado con dos filas?

## En código

```python
import pandas as pd
import numpy as np

df = pd.DataFrame({"ciudad": ["Madrid", "Barcelona", "Valencia", "Madrid"]})
target = pd.Series([1, 0, 1, 0])

codigos, categorias = pd.factorize(df["ciudad"])
print("Label:", codigos)  # [0 1 2 0]

print(pd.get_dummies(df["ciudad"]).astype(int).values.tolist())
# [[0, 1, 0], [1, 0, 0], [0, 0, 1], [0, 1, 0]] (orden alfabético: Barcelona, Madrid, Valencia)

media_por_ciudad = target.groupby(df["ciudad"]).transform("mean")
print("Target:", media_por_ciudad.tolist())  # [0.5, 0.0, 1.0, 0.5]
```

## Errores típicos

- **Error**: usar label encoding en una variable sin orden natural, como el color o la ciudad. → **Correcto**: sin jerarquía real, el modelo puede interpretar relaciones numéricas inexistentes; usa one-hot, frecuencia o target encoding.
- **Error**: calcular el target encoding con todo el conjunto de datos, incluida la parte de validación o prueba. → **Correcto**: ajusta el promedio solo con los datos de entrenamiento, como en cualquier paso del [[preprocesamiento]], para evitar la fuga de datos.
- **Error**: aplicar one-hot encoding a una variable con cientos de categorías. → **Correcto**: la dimensionalidad se dispara; una codificación por frecuencia, binaria o de target reduce mejor el número de columnas.
- **Error**: asumir que la codificación ordinal siempre mejora el resultado frente a one-hot cuando hay "algo" de orden. → **Correcto**: si las distancias entre niveles no son realmente iguales, el orden impuesto puede distorsionar lo que el modelo aprende; conviene contrastarlo con one-hot.

## En resumen

- **Qué hace**: convierte categorías en números para que un modelo pueda procesarlas.
- **Cómo elegir**: mira si hay un orden real (ordinal, si lo hay; one-hot, binaria, frecuencia o target si no), cuántas categorías hay (pocas → one-hot; muchas → binaria, frecuencia o target) y el tipo de modelo (los árboles toleran mejor los enteros arbitrarios que los modelos lineales).
- **Fórmula clave**: el target encoding suavizado combina la media de la categoría con la media global, dando más peso a esta última cuando hay pocas observaciones.
- **Cuándo usarlo**: siempre que haya variables categóricas y el modelo requiera entradas numéricas (casi todos, salvo algunos basados en árboles).
- **Decisiones que importan**: cardinalidad de la variable, presencia de orden real y el parámetro de suavizado $m$ en target encoding.
- **Trampa principal**: calcular el target encoding con datos que el modelo no debería ver todavía, lo que produce fuga de datos y un rendimiento optimista engañoso en validación.

## A fondo

El impacto de la codificación va más allá de la variable en sí: interactúa con el modelo elegido. Los árboles de decisión y los modelos de ensamblaje (bosques aleatorios, *gradient boosting*) toleran razonablemente bien codificaciones simples como el label encoding, porque cada división del árbol compara una sola variable a la vez y no asume relaciones numéricas globales entre categorías. Los modelos lineales o los basados en distancia, en cambio, sí interpretan literalmente la magnitud de los números, así que una codificación con orden espurio (label encoding en variables sin jerarquía) puede sesgar sus coeficientes o distancias. Además, cuando una variable de alta cardinalidad se codifica con one-hot, el aumento de columnas puede agravar la [[reduccion-dimensionalidad|maldición de la dimensionalidad]]: muchas columnas dispersas (casi todo ceros) dificultan que el modelo encuentre patrones fiables con los datos disponibles.

Existen variantes de target encoding pensadas para reducir aún más el sobreajuste, como **Leave-One-Out**: en vez de usar la media de la categoría calculada con todas sus filas (incluida la actual), cada fila se codifica con la media de las demás observaciones de su categoría, excluyéndose a sí misma. Esto añade algo de variabilidad entre filas de una misma categoría, lo que en la práctica actúa como una suavización adicional frente al sobreajuste.

## Autoevaluación

### Tienes una variable "nivel educativo" con valores {primaria, secundaria, universidad} y vas a entrenar una regresión lineal. ¿Qué codificación es más apropiada?
- [ ] One-hot encoding, porque nunca hay que asumir orden entre categorías.
- [x] Codificación ordinal, porque existe una jerarquía real entre los niveles y el modelo puede aprovechar esa información de orden.
- [ ] Codificación por frecuencia, porque siempre reduce mejor la dimensionalidad.
> Por qué: a diferencia del color o la ciudad, el nivel educativo tiene un orden natural; codificarlo como ordinal aprovecha esa jerarquía en vez de descartarla como haría el one-hot.

### Aplicas target encoding calculando la media de la variable objetivo usando también las filas del conjunto de prueba. ¿Qué problema introduces?
- [ ] Ninguno: cuantos más datos se usen para calcular la media, mejor.
- [x] Fuga de datos: el modelo recibe información del conjunto de prueba antes de ser evaluado, lo que infla artificialmente su rendimiento aparente.
- [ ] Un aumento excesivo de la dimensionalidad del conjunto de datos.
> Por qué: el target encoding debe ajustarse solo con los datos de entrenamiento; incluir el conjunto de prueba filtra información que el modelo no debería conocer todavía, igual que en cualquier otro paso de preprocesamiento.

### Una variable "producto" tiene 5.000 categorías distintas. ¿Qué técnica de codificación sería menos adecuada?
- [ ] Codificación por frecuencia.
- [x] One-hot encoding, porque generaría 5.000 columnas nuevas, la mayoría con ceros, disparando la dimensionalidad.
- [ ] Codificación binaria.
> Por qué: con alta cardinalidad, el one-hot encoding infla mucho el número de columnas; técnicas como la binaria, la de frecuencia o el target encoding representan la misma información con muchas menos columnas.

### En el interactivo, Barcelona y Valencia obtienen un target encoding de 0,0 y 1,0 respectivamente, cada uno calculado con una sola fila. ¿Qué riesgo tiene confiar en esos valores tal cual?
- [ ] Ninguno, porque el promedio de una sola observación es igual de fiable que el de muchas.
- [x] Que ese valor puede no generalizar bien: al estar basado en una única observación, no refleja necesariamente el comportamiento real de esa categoría, y el suavizado hacia la media global reduciría ese riesgo.
- [ ] Que el modelo no podrá usar esas categorías en absoluto.
> Por qué: con pocas observaciones, la media de la categoría es poco fiable; el término de suavizado $m$ de la fórmula pondera más la media global precisamente para corregir este caso.

## Glosario

- **Label encoding**: asignación de un entero distinto a cada categoría, sin garantizar que ese orden tenga sentido.
- **One-hot encoding**: representación de cada categoría como una columna binaria independiente.
- **Codificación ordinal**: asignación de enteros crecientes a categorías que sí tienen un orden real.
- **Target encoding**: sustitución de cada categoría por un resumen (normalmente la media) de la variable objetivo dentro de ella.
- **Alta cardinalidad**: variable categórica con un número muy grande de categorías distintas.
- **Fuga de datos (*data leakage*)**: uso indebido de información que el modelo no debería conocer todavía al calcular una transformación, lo que infla el rendimiento aparente.
- **Suavizado (*smoothing*)**: técnica que combina el promedio de una categoría con el promedio global para no fiarse de categorías con pocas observaciones.
