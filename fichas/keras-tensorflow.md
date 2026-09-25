---
id: keras-tensorflow
estado: borrador
---

## En una frase

TensorFlow ejecuta operaciones sobre tensores organizadas en un grafo, y Keras es la capa que convierte ese grafo en modelos, capas y un entrenamiento reducibles a unas pocas líneas de código.

## Intuición

Imagina una fábrica con máquinas conectadas por cintas transportadoras: cada máquina hace una operación (sumar, multiplicar, activar) y las cintas llevan el material de una a otra. Eso es **TensorFlow**: un motor que ejecuta ese circuito de operaciones sobre datos numéricos, decidiendo qué puede hacerse en paralelo y en qué orden. **Keras** es el panel de control de esa fábrica: en vez de cablear cada máquina a mano, aprietas botones con nombre ("añade una capa de 64 neuronas", "entrena 20 épocas") y el panel traduce eso al circuito real.

Ya sabes, por [[mlp]], cómo se apilan capas de neuronas sobre el papel. Esta ficha responde a la pregunta siguiente: ¿qué pasa por debajo cuando ese diseño se convierte en código que entrena de verdad, y quién se encarga de cada parte? Entenderlo importa porque, el día que algo falla o necesitas un comportamiento que Keras no ofrece de fábrica, hay que saber a qué nivel bajar.

## Explicación

### El tensor: la unidad de datos

Ya conoces el [[datos-como-matrices|tensor]] como la generalización de vector y matriz a más de dos índices. En TensorFlow, además de esos índices, todo tensor lleva un tipo (`dtype`, normalmente `float32`) y reside en la memoria de la CPU o la GPU, lista para entrar en el grafo. Un escalar tiene rango 0 (un número), un vector rango 1 (las variables de un cliente), una matriz rango 2 (un lote de clientes) y un tensor de rango 3 o más agrupa estructuras más ricas, como un lote de imágenes en color (muestras, alto, ancho, canales) o de series temporales (muestras, pasos de tiempo, variables).

### El grafo computacional: el mapa de ejecución

TensorFlow no ejecuta las operaciones una a una de forma aislada: al definir un modelo construye un **grafo acíclico dirigido** (*DAG*), donde los nodos son operaciones matemáticas y las aristas son los tensores que fluyen entre ellas. Ese mapa le permite decidir qué operaciones puede paralelizar y calcular automáticamente las derivadas necesarias para el aprendizaje ([[backpropagation]]) recorriendo el grafo hacia atrás.

### Lo que Keras automatiza

Programar directamente sobre TensorFlow ("TensorFlow Core") exige gestionar a mano varias tareas que Keras resuelve por defecto:

| Tarea | Con TensorFlow puro | Con Keras |
|---|---|---|
| Inicialización de pesos | Definir a mano la distribución de los pesos iniciales para no provocar gradientes inestables | Esquemas de inicialización automáticos por capa |
| Bucle de entrenamiento | Escribir el bucle de épocas, el `batching` y el registro de gradientes a mano | Una llamada a `.fit()` |
| Gestión de variables | Rastrear manualmente qué pesos pertenecen a qué capa y cuáles son entrenables | Registro automático de las `tf.Variable` de cada capa |
| Formas de las capas | Calcular a mano las dimensiones de cada operación matricial | Inferencia automática de formas (*shape inference*) |

Esta es la diferencia central entre ambos: TensorFlow gestiona el hardware, la memoria y el cálculo; Keras gestiona la complejidad de expresar ese cálculo, para que el desarrollador piense en "capas" y no en "matrices de memoria". Un ejemplo concreto de la inferencia de formas: si el número de variables de entrada pasa de 10 a 15, en TensorFlow Core habría que recalcular a mano las dimensiones de cada matriz de pesos aguas abajo; en Keras basta con declarar `Input(shape=(15,))` y el resto de las capas ajustan su forma automáticamente.

### De datos en bruto a tensores: el pipeline de ingesta

Ningún modelo lee un CSV directamente. El camino habitual es: datos en bruto (CSV, SQL) → preprocesamiento (escalado, codificación, imputación) → conversión a tensor (`tf.convert_to_tensor`, con tipo `tf.float32`) → entrada al grafo.

Cuando el dataset es demasiado grande para caber en memoria, cargarlo entero en un `DataFrame` no es viable. La API **`tf.data`** resuelve esto creando una tubería (*pipeline*) que lee del disco solo lo que necesita en cada momento, con tres operaciones que casi siempre van juntas:

- **`shuffle`**: mezcla los ejemplos en cada época para que el modelo no aprenda el orden del archivo en lugar de los patrones reales.
- **`batch`**: agrupa los datos en lotes (habitualmente potencias de 2: 32, 64, 128), lo que estabiliza el gradiente y aprovecha el paralelismo de la GPU.
- **`prefetch(tf.data.AUTOTUNE)`**: deja que la CPU prepare el siguiente lote mientras la GPU procesa el actual, para que el hardware no se quede esperando datos.

Este solapamiento es lo que evita que un sistema con datos masivos desperdicie la GPU esperando: procesar un lote puede tardar milisegundos, pero leerlo y prepararlo desde disco tarda mucho más si no se hace en paralelo con el paso anterior.

### Tres formas de construir el mismo modelo

Keras ofrece tres niveles de control, y la elección depende de qué tan lineal es el flujo de información:

- **`Sequential`**: una lista de capas donde cada una alimenta a la siguiente. Es la opción más simple y cubre la mayoría de los MLP, CNN y RNN clásicos, siempre que haya una sola entrada y una sola salida.
- **API Funcional**: las capas se invocan como funciones sobre tensores (`x = Dense(64)(entrada)`), lo que permite construir un grafo con ramas: varias entradas, varias salidas, conexiones que saltan capas (como en ResNet) o tramos que se reutilizan por separado (como el codificador y el decodificador de un autoencoder).
- **Model Subclassing**: se hereda la clase `tf.keras.Model` y se define a mano el *forward pass* (método `call`) y, si hace falta, el propio bucle de entrenamiento (`train_step`). Permite lógica de Python pura —condicionales, bucles— y es el terreno de arquitecturas que necesitan gradientes gestionados a mano, como las GAN.

Un caso típico de Subclassing: una empresa de logística quiere que el modelo penalice más los errores grandes al predecir el coste de un envío, porque subestimar un envío caro le hace perder dinero. Una regla como "si el error supera un umbral, multiplica la pérdida por 1,5" no existe como función de pérdida estándar en Keras, así que solo puede expresarse escribiendo el `train_step` a mano.

| API | Estructura | Cuándo conviene |
|---|---|---|
| Sequential | Lista lineal de capas | Una entrada y una salida, flujo sin ramas |
| Funcional | Grafo (DAG) de capas | Varias entradas o salidas, ramas, capas compartidas |
| Subclassing | Clase con lógica propia | Comportamiento dinámico o entrenamiento a medida |

La regla práctica es empezar siempre por la opción más simple y subir de nivel solo cuando el problema lo exige: no tiene sentido escribir un `train_step` manual para un MLP de una sola salida.

### Combinar varias salidas: el equilibrio de la pérdida

Cuando un modelo Funcional tiene varias salidas —por ejemplo, predecir a la vez si un cliente se da de baja y cuánto va a gastar—, el optimizador no ve dos problemas separados, sino una única pérdida total. Si las pérdidas de cada rama tienen escalas muy distintas (un error de clasificación entre 0 y 1 frente a un error de regresión en cientos), hay que ponderarlas para que ninguna domine el gradiente; la fórmula exacta se ve en Formalización.

Diseñar el modelo así, con un tronco compartido y varias cabezas, tiene además dos ventajas prácticas. Computacionalmente, una sola pasada por el tronco basta para obtener ambas predicciones, lo que ahorra cálculo y memoria frente a entrenar dos modelos independientes sobre el mismo dato de entrada. Y desde el punto de vista del aprendizaje, obligar a las capas compartidas a servir para dos tareas a la vez actúa como una forma de regularización: los rasgos que ayudan a predecir la fuga de un cliente y los que ayudan a estimar su valor futuro suelen solaparse, así que la red tiende a aprender representaciones más generales y menos ajustadas al ruido de una sola tarea.

## Formalización

$$
\mathbf{T} \in \mathbb{R}^{d_1 \times d_2 \times \cdots \times d_r}
$$

donde:

- $\mathbf{T}$ es un tensor: la estructura que TensorFlow usa para representar cualquier entrada, salida o parámetro del grafo.
- $r$ es el **rango** del tensor (número de dimensiones): $r=0$ es un escalar, $r=1$ un vector, $r=2$ una matriz y $r\geq3$ un tensor propiamente dicho.
- $d_i$ es el tamaño de la dimensión $i$-ésima, lo que en conjunto forma la **forma** (*shape*) del tensor.

Cuando el modelo tiene varias salidas, la pérdida que minimiza el optimizador es la suma ponderada de las pérdidas individuales:

$$
\mathcal{L}_{total} = \sum_{i=1}^{k} w_i \, \mathcal{L}_i
$$

donde:

- $k$ es el número de salidas del modelo.
- $\mathcal{L}_i$ es la función de pérdida de la salida $i$-ésima (por ejemplo, entropía cruzada para una rama de clasificación, error cuadrático medio para una de regresión).
- $w_i$ es el peso asignado a esa pérdida (`loss_weights` en Keras), que reescala su magnitud para que ninguna tarea domine el gradiente.

Ejemplo numérico: si el error de la rama de regresión ronda $500$ y el de clasificación $0{,}4$, ponderar la regresión con $w=0{,}001$ la reduce a $500 \times 0{,}001 = 0{,}5$, ya en una escala comparable a $0{,}4$, con una pérdida total de $0{,}9$ en vez de $500{,}4$.

## Interactivo

```widget
motor: pasos
---
### El mismo modelo, tres formas de construirlo

Queremos predecir si un cliente se dará de baja (**churn**) a partir de 4 variables. La arquitectura es siempre la misma: entrada → capa oculta de 64 neuronas → capa oculta de 32 → salida (1, sigmoide).

Lo que cambia entre las tres APIs no es el resultado, sino cuánto control cede el desarrollador a Keras.
---
### Sequential: una lista de capas

`Sequential([Input(shape=(4,)), Dense(64,'relu'), Dense(32,'relu'), Dense(1,'sigmoid')])`

Cada capa alimenta a la siguiente y solo hay una entrada y una salida. Es la opción más simple y la más productiva mientras el flujo sea una línea recta.

Límite: no hay forma de añadir una segunda salida (por ejemplo, el valor futuro del cliente) sin cambiar de API.
---
### API Funcional: un grafo con ramas

`x = Dense(64,'relu')(entrada)` → `x = Dense(32,'relu')(x)` → dos ramas: `churn = Dense(1,'sigmoid')(x)` y `ltv = Dense(1,'linear')(x)`

Las capas se invocan como funciones sobre tensores, y el modelo se cierra con `Model(entrada, [churn, ltv])`. El mismo tronco alimenta dos cabezas especializadas.

Coste: la compilación debe repartir el peso de cada pérdida (`loss_weights`) para que ninguna salida domine el gradiente.
---
### Model Subclassing: una clase con lógica propia

En el constructor se declaran las capas; en `call` se define el *forward pass*; en `train_step` se define a mano cómo se calculan y aplican los gradientes con `tf.GradientTape`.

Esto permite lógica de Python —condicionales, bucles— que ningún grafo estático puede expresar, como penalizar de forma distinta los errores graves.

Coste: hay que gestionar manualmente lo que antes hacía solo `.fit()`.
---
### Resumen: control a cambio de responsabilidad

| API | Estructura | Cuándo |
|---|---|---|
| Sequential | Lista lineal | Una entrada, una salida, sin ramas |
| Funcional | Grafo (DAG) | Varias entradas o salidas, ramas |
| Subclassing | Clase con lógica propia | Comportamiento dinámico, entrenamiento a medida |

Cuanta más libertad necesitas, más código de bajo nivel escribes tú mismo.
```

- Prueba a pensar qué pasaría si el problema de churn+LTV se intentara resolver solo con Sequential: ¿por qué no basta con añadir una capa `Dense(2)` final?
- Prueba a imaginar que, en vez de penalizar errores graves, quisieras que el modelo se comportara igual siempre: ¿seguirías necesitando Subclassing, o te bastaría con la API Funcional?
- Prueba a identificar, en un proyecto que conozcas, si su arquitectura es realmente una línea recta (Sequential) o si en el fondo tiene ramas que hoy se están forzando a caber en una sola salida.

## En código

```python
# no-ejecutar
import tensorflow as tf
from tensorflow.keras import layers, models

# Tensor de entrada: 100 clientes, 4 variables ya escaladas
x = tf.random.normal((100, 4))

modelo = models.Sequential([
    layers.Input(shape=(4,)),
    layers.Dense(64, activation='relu'),
    layers.Dense(32, activation='relu'),
    layers.Dense(1, activation='sigmoid'),
])
modelo.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

print(modelo(x).shape)                  # (100, 1): una probabilidad por cliente
print(len(modelo.trainable_variables))  # 6: pesos y sesgo de cada una de las 3 capas Dense
```

## Errores típicos

- **Error**: pensar que TensorFlow y Keras son dos bibliotecas independientes entre las que hay que elegir. → **Correcto**: Keras es la API de alto nivel integrada en TensorFlow (`tf.keras`); se usan juntas, no una u otra.
- **Error**: usar `validation_split` con un pipeline `tf.data`. → **Correcto**: `validation_split` solo funciona con arrays completos en memoria; con `tf.data` hay que segmentar el pipeline y pasar `validation_data` de forma explícita.
- **Error**: sumar sin más las pérdidas de un modelo con varias salidas. → **Correcto**: hay que ponderarlas (`loss_weights`) porque sus escalas pueden ser muy distintas y una acaba dominando el gradiente.
- **Error**: elegir Model Subclassing por defecto para "tener más control". → **Correcto**: empezar por Sequential o Funcional; Subclassing solo cuando la arquitectura necesita lógica de Python dinámica que un grafo estático no puede expresar.

## En resumen

- **Qué es:** TensorFlow ejecuta operaciones sobre tensores organizadas como un grafo; Keras (`tf.keras`) las convierte en modelos y un entrenamiento manejables en pocas líneas.
- **El flujo de datos:** CSV o array → preprocesamiento → tensor → grafo. Con datasets grandes, `tf.data` los sirve en streaming (`shuffle`, `batch`, `prefetch(AUTOTUNE)`).
- **Tres formas de construir un modelo:** `Sequential` (lista lineal), API `Funcional` (grafo con ramas y varias entradas o salidas) y `Model Subclassing` (clase con `call` y `train_step` propios).
- **Fórmula clave:** en un modelo multi-salida, $\mathcal{L}_{total}=\sum_i w_i\mathcal{L}_i$; sin ponderar bien los $w_i$ (`loss_weights`), la tarea de mayor escala domina el gradiente.
- **Cuándo usar cada una:** empieza por la más simple; sube a Funcional si hay ramas o varias salidas, y a Subclassing solo si necesitas lógica dinámica de Python.
- **Decisiones que importan:** `validation_split` exige arrays en RAM, con `tf.data` hace falta `validation_data` explícito; escalar con capas `Normalization` integra el preprocesamiento en el propio modelo.
- **Trampa principal:** sumar pérdidas de distinta escala sin `loss_weights`, o forzar `Sequential` cuando el problema ya pide ramas o varias salidas.

## A fondo

**Patrones avanzados en la API Funcional.** Cuando el grafo crece aparecen tres recursos habituales: las **conexiones residuales** (sumar la entrada de un bloque a su propia salida, la base de ResNet, para que el gradiente no se desvanezca en redes profundas); las **capas compartidas** (usar la misma instancia de capa sobre dos entradas distintas para que ambas compartan pesos, como en una red siamesa que compara dos elementos con el mismo "codificador"); y los **modelos como capas** (invocar un `Model` completo dentro de otro flujo, la base del *transfer learning* y de los autoencoders, donde el codificador y el decodificador se entrenan por separado y luego se anidan en un modelo maestro).

**Preprocesamiento como capa, alternativa a scikit-learn.** Escalar con `StandardScaler` obliga a guardar el objeto ajustado y aplicarlo a mano antes de cada predicción; si se olvida, el modelo falla en silencio. Las capas `layers.Normalization` de Keras (que se ajustan con `.adapt()` en vez de `.fit()`) integran el escalado como la primera capa del grafo: el modelo recibe datos crudos y se escala a sí mismo, tanto en entrenamiento como en producción.

**Penalización dinámica con `tf.GradientTape`.** Sobrescribir `train_step` permite reglas de negocio que ninguna `loss` estándar admite, como multiplicar la pérdida por $1,5$ cuando el error supera un umbral crítico, para forzar correcciones más agresivas en los fallos caros. Esto funciona porque la derivada de una función escalada por una constante $C$ es esa misma constante por la derivada original, $\frac{d}{dx}[C \cdot f(x)] = C \cdot f'(x)$: multiplicar la pérdida por $1,5$ multiplica también el gradiente que llega a cada peso, así que el optimizador corrige con un $50\%$ más de fuerza justo en las zonas de error grave.

**Lo que Keras no abstrae.** Hay zonas donde conviene bajar al núcleo de TensorFlow: arquitecturas cuya estructura cambia según los datos de entrada (grafos dinámicos), operaciones de álgebra lineal a medida (`tf.linalg`, `tf.math`) que no existen como capa, y la asignación manual de qué tensor vive en qué dispositivo (CPU o una GPU concreta) cuando el rendimiento en producción lo exige.

## Autoevaluación

### Necesitas un modelo que, a partir de los datos de un cliente, prediga a la vez si se dará de baja (clasificación) y cuánto gastará (regresión), compartiendo un tronco de capas comunes. ¿Qué API conviene?
- [ ] Sequential, añadiendo una capa `Dense(2)` al final.
- [x] Funcional, porque hace falta un grafo con dos salidas que comparten un tronco.
- [ ] Model Subclassing, porque es la única API que admite más de una salida.
> Por qué: dos salidas que comparten capas es exactamente el caso de un grafo con ramas, el terreno de la API Funcional. Sequential solo admite una entrada y una salida, y Subclassing no hace falta aquí porque no se necesita lógica de Python dinámica.

### En un modelo con dos salidas, el error de la rama de regresión ronda 500 y el de clasificación ronda 0,4. Si compilas sin usar `loss_weights`, ¿qué es lo más probable?
- [ ] El optimizador dará igual importancia a ambas ramas porque Keras normaliza las escalas automáticamente.
- [x] El optimizador se concentrará en reducir el error de regresión y prácticamente ignorará la clasificación.
- [ ] El entrenamiento fallará con un error de compilación.
> Por qué: sin ponderar, la pérdida total es la suma directa; como 500 domina sobre 0,4, el gradiente apunta casi todo hacia reducir la regresión. Keras no reescala las pérdidas por ti.

### Un lote de 32 imágenes en color de 64×64 píxeles, ¿qué forma (*shape*) tiene el tensor que entra a la red?
- [ ] (64, 64)
- [ ] (32, 64)
- [x] (32, 64, 64, 3)
> Por qué: el rango es 4: número de muestras del lote (32), alto y ancho (64, 64) y canales de color (3, RGB).

### Estás entrenando con un `tf.data.Dataset` que lee un CSV enorme en streaming. ¿Por qué no puedes usar `validation_split=0.2` en `.fit()`?
- [ ] Porque `validation_split` solo funciona con la pérdida `mse`.
- [x] Porque `validation_split` necesita trocear un array completo en memoria, y un pipeline en streaming no se puede "retroceder" para separar una parte.
- [ ] Porque los pipelines de `tf.data` nunca admiten validación.
> Por qué: `validation_split` opera sobre datos ya cargados como array; con streaming hay que segmentar el pipeline de antemano (por ejemplo con `.take()`/`.skip()`) y pasarlo explícitamente en `validation_data`.

### ¿Cuándo tiene sentido sobrescribir `train_step` en Model Subclassing en vez de usar `.fit()` estándar?
- [ ] Siempre que el modelo tenga más de una capa oculta.
- [ ] Cuando quieres acelerar el entrenamiento en GPU.
- [x] Cuando necesitas una lógica de aprendizaje que las funciones de pérdida estándar no pueden expresar, como penalizar de forma distinta ciertos errores.
> Por qué: `train_step` da control total sobre cómo se calculan la pérdida y los gradientes; ese coste solo compensa cuando hace falta una regla que no cabe en una `loss` estándar de Keras.

## Glosario

- **Grafo computacional**: grafo acíclico dirigido (DAG) donde los nodos son operaciones y las aristas los tensores que fluyen entre ellas; distinto de un grafo de conocimiento, que representa relaciones semánticas.
- **`tf.data`**: API de TensorFlow para construir una tubería (*pipeline*) de datos que lee, mezcla y agrupa en lotes sin cargar todo el dataset en memoria.
- **API Funcional**: forma de construir modelos en Keras invocando las capas como funciones sobre tensores, lo que permite grafos con ramas, varias entradas o salidas.
- **Model Subclassing**: forma de construir modelos heredando `tf.keras.Model` y definiendo a mano el *forward pass* (`call`) y, si hace falta, el bucle de entrenamiento (`train_step`).
- **Pérdida ponderada (`loss_weights`)**: peso que se asigna a cada función de pérdida en un modelo multi-salida para equilibrar sus escalas y evitar que una domine el gradiente.
