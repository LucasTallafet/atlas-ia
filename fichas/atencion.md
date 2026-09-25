---
id: atencion
estado: borrador
---

## En una frase

El mecanismo de atención deja que cada palabra de una frase "consulte" a las demás y combine su información según cuánto se parezcan, usando tres proyecciones llamadas Query, Key y Value.

## Intuición

Imagina que lees la frase "el banco cerró temprano porque llovía" y te preguntas a qué se refiere "cerró". Tu cerebro no lee cada palabra de forma aislada: relaciona "cerró" con "banco" (el sujeto) y con "llovía" (la posible causa), ignorando en gran medida "temprano" o "porque". Estás, de hecho, prestando distinta **atención** a cada palabra de la frase según su relevancia para entender "cerró".

El mecanismo de **atención** hace algo parecido de forma matemática: para cada palabra, compara su vector con el de todas las demás y usa esa comparación para decidir cuánto peso darle a la información de cada una. Esta idea es el núcleo de los [[transformer|Transformers]] y, por tanto, de casi todos los modelos de lenguaje modernos: sustituyó la necesidad de leer palabra por palabra (como hacían las [[lstm-gru|redes recurrentes]]) por la posibilidad de comparar todas las palabras entre sí a la vez.

## Explicación

### De la similitud entre vectores a la atención

Ya sabes que el [[producto-escalar-similitud|producto escalar]] entre dos vectores, combinado con sus normas, mide cuánto se parecen: cuanto más pequeño el ángulo entre ellos, mayor la similitud. El mecanismo de atención usa exactamente esa idea: representa cada token de la secuencia como un vector (partiendo de sus [[word-embeddings|embeddings]]) y calcula la similitud entre el vector del token actual y el de todos los demás. Esas similitudes se convierten después en pesos que indican cuánto debe "atender" ese token al resto de la secuencia.

### Qué preguntan, qué ofrecen y qué transmiten: Q, K, V

Para calcular esas similitudes de forma que el modelo pueda aprender a qué debe atender, no se comparan los embeddings originales directamente, sino tres proyecciones lineales distintas de ellos, obtenidas con matrices de pesos entrenables:

- **Query (Q)**: representa qué está "buscando" cada token.
- **Key (K)**: representa cómo se presenta cada token para ser comparado con esas búsquedas.
- **Value (V)**: representa la información que aporta cada token si recibe atención.

Comparando cada Query con todas las Keys se obtiene, para cada token, un conjunto de pesos que indican cuánto debe atender a cada uno de los demás. Esos pesos se usan después para combinar los Values: el resultado es una nueva representación de cada token, enriquecida con información relevante del resto de la secuencia.

### De las similitudes a los pesos: escalado y softmax

Las similitudes brutas entre Queries y Keys se escalan (para evitar valores demasiado grandes) y se pasan por una [[funciones-activacion|softmax]] aplicada fila a fila, de modo que los pesos de atención de cada token sobre el resto sumen 1, como una distribución de probabilidad. Este proceso se repite en paralelo con varias proyecciones distintas (**Multi-Head Attention**), permitiendo que el modelo capture a la vez varios tipos de relación —semánticas, gramaticales— entre las palabras.

## Formalización

Sea $\mathbf{X} \in \mathbb{R}^{n \times d}$ la matriz de embeddings de entrada, con una fila por token. Se aplican tres matrices de proyección entrenables para obtener las matrices de query, key y value:

$$
\mathbf{Q} = \mathbf{X}\mathbf{W}_Q, \quad \mathbf{K} = \mathbf{X}\mathbf{W}_K, \quad \mathbf{V} = \mathbf{X}\mathbf{W}_V
$$

donde:
- $n$ es el número de tokens de la secuencia y $d$ la dimensión del embedding.
- $\mathbf{W}_Q, \mathbf{W}_K, \mathbf{W}_V \in \mathbb{R}^{d \times d'}$ son las matrices de proyección que aprende el modelo, con $d' \leq d$.
- $\mathbf{Q}, \mathbf{K}, \mathbf{V} \in \mathbb{R}^{n \times d'}$ son las matrices resultantes.

La salida del mecanismo de atención se calcula como:

$$
\mathbf{Z} = \text{softmax}\left(\frac{\mathbf{Q}\mathbf{K}^\top}{\sqrt{d'}}\right)\mathbf{V}
$$

donde:
- $\mathbf{Q}\mathbf{K}^\top \in \mathbb{R}^{n \times n}$ contiene, en cada fila, la similitud de un token con todos los demás.
- $\sqrt{d'}$ es un factor de escala que evita que los productos escalares crezcan demasiado con la dimensión y saturen la softmax.
- $\text{softmax}(\cdot)$ se aplica fila a fila, convirtiendo cada fila en pesos de atención que suman 1.
- $\mathbf{Z} \in \mathbb{R}^{n \times d'}$ contiene, en cada fila, la nueva representación de un token, combinando los $\mathbf{V}$ de toda la secuencia según esos pesos.

**Ejemplo.** Con 3 tokens de juguete ("gato", "come", "pescado") en $\mathbb{R}^2$, $\mathbf{X}=\begin{bmatrix}1&0\\0&1\\1&1\end{bmatrix}$, $\mathbf{W}_Q=\mathbf{W}_K=\mathbf{I}$ y $\mathbf{W}_V=0{,}5\,\mathbf{I}$ (verificado con `tools/calc.py`), la matriz de pesos de atención resultante es:

$$
\text{softmax}\left(\frac{\mathbf{Q}\mathbf{K}^\top}{\sqrt2}\right) = \begin{bmatrix}0{,}40&0{,}20&0{,}40\\0{,}20&0{,}40&0{,}40\\0{,}25&0{,}25&0{,}50\end{bmatrix}
$$

"pescado" (que comparte componentes con "gato" y "come") reparte su atención entre los tres con un peso algo mayor hacia sí mismo (0,50), mientras que "gato" y "come" no se atienden entre sí tanto como a "pescado" (0,40 en ambos casos) frente a lo que se atienden a sí mismos (0,40 también, por coincidencia de este ejemplo).

## Interactivo

```widget
motor: matriz-calor
modo: "atencion"
filas: ["gato", "come", "pescado"]
columnas: ["gato", "come", "pescado"]
valores: [[0.4011, 0.1978, 0.4011], [0.1978, 0.4011, 0.4011], [0.2483, 0.2483, 0.5035]]
```

- Prueba a hacer clic en la fila "pescado" y comprueba que sus pesos no se reparten igual que los de "gato": ¿por qué se atiende más a sí mismo?
- Prueba a sumar los tres pesos de una misma fila: comprueba que siempre dan 1, sea cual sea la fila.
- Prueba a imaginar qué pasaría si "gato" y "come" fueran vectores idénticos: ¿cómo cambiarían sus filas en el mapa de calor?

## En código

```python
import numpy as np

X = np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]])  # gato, come, pescado
WQ = WK = np.eye(2)
WV = 0.5 * np.eye(2)

Q, K, V = X @ WQ, X @ WK, X @ WV
scores = (Q @ K.T) / np.sqrt(2)
pesos = np.exp(scores) / np.exp(scores).sum(axis=1, keepdims=True)
Z = pesos @ V

print(np.round(pesos, 4))
# [[0.4011 0.1978 0.4011]
#  [0.1978 0.4011 0.4011]
#  [0.2483 0.2483 0.5035]]
```

## Errores típicos

- **Error**: pensar que Q, K y V son tres objetos independientes → **Correcto**: son tres proyecciones lineales distintas del mismo embedding de entrada $\mathbf{X}$, cada una con su propia matriz de pesos entrenable.
- **Error**: creer que la atención mide la "importancia absoluta" de una palabra en la frase → **Correcto**: mide una importancia relativa a una consulta concreta; la misma palabra puede recibir pesos distintos según qué token esté preguntando.
- **Error**: olvidar por qué se divide entre $\sqrt{d'}$ → **Correcto**: sin ese escalado, los productos escalares crecen con la dimensión y saturan la softmax, dejando casi todo el peso en un único token y dificultando el entrenamiento.

## En resumen

- La atención permite que cada token combine información de los demás tokens de la secuencia, ponderada según su relevancia.
- Cómo funciona en 3 pasos: (1) proyectar los embeddings en Q, K y V; (2) comparar cada Query con todas las Keys y escalar; (3) aplicar softmax y combinar los Values con esos pesos.
- Fórmula clave: $\mathbf{Z} = \text{softmax}\!\left(\mathbf{Q}\mathbf{K}^\top/\sqrt{d'}\right)\mathbf{V}$.
- Úsala cuando necesites que cada elemento de una secuencia incorpore contexto de los demás sin depender de procesarlos en orden, como en los Transformers.
- Decisión que importa: el número de "cabezas" de atención (Multi-Head Attention) determina cuántos tipos de relación distintos puede capturar el modelo a la vez.
- Trampa principal: confundir Q, K y V con tres entradas distintas al modelo, cuando en realidad las tres se calculan a partir del mismo $\mathbf{X}$.

## A fondo

Un solo cálculo de atención (una "cabeza") captura un único tipo de relación entre palabras. Por eso los Transformers no se limitan a una autoatención simple, sino que aplican **Multi-Head Attention**: varias proyecciones $\mathbf{W}_Q, \mathbf{W}_K, \mathbf{W}_V$ distintas en paralelo, cada una aprendiendo a fijarse en un aspecto diferente —por ejemplo, una cabeza puede especializarse en relaciones semánticas (palabras con significados afines) y otra en relaciones gramaticales (sujeto-verbo). Los resultados de todas las cabezas se combinan para dar una representación más rica que la de una sola cabeza de atención.

Cuando Q, K y V se calculan a partir de la misma secuencia de entrada, como en todo este ejemplo, se habla de **autoatención (self-attention)**. Más adelante verás que no es la única variante: en la arquitectura completa del Transformer también aparece una atención donde Q proviene de una secuencia y K, V de otra distinta.

## Autoevaluación

### En el ejemplo del widget, "pescado" atiende con peso 0,50 a sí mismo y 0,25 a cada uno de "gato" y "come". ¿Qué relación tienen esos tres números?
- [ ] Ninguna en particular: son valores independientes que no tienen por qué sumar nada.
- [x] Suman 1, porque el softmax convierte los productos escalares de esa fila en una distribución de probabilidad.
- [ ] Son directamente los valores de $\mathbf{V}$ para "pescado".
> Por qué: cada fila de la matriz de atención es la salida de un softmax aplicado fila a fila; el softmax siempre produce valores no negativos que suman 1.

### ¿Qué pasaría con los pesos de atención si se omitiera la división por $\sqrt{d'}$, en un caso donde $d'$ es muy grande?
- [x] Los productos escalares tenderían a tomar valores muy grandes, saturando la softmax y dejando casi todo el peso en un único token.
- [ ] Los pesos no cambiarían, porque el escalado no afecta a la softmax.
- [ ] La softmax dejaría de sumar 1 en cada fila.
> Por qué: sin escalado, $\mathbf{Q}\cdot\mathbf{K}^\top$ crece con $d'$; al pasar por la exponencial de la softmax, diferencias grandes producen distribuciones casi degeneradas, con casi toda la atención en una sola posición, lo que dificulta el aprendizaje.

### Un compañero dice: "K y V son la misma matriz, porque las dos se calculan a partir de la entrada del encoder". ¿Qué falla en esa afirmación?
- [ ] Nada, es correcta.
- [x] K y V son dos proyecciones distintas de $\mathbf{X}$ (mediante $\mathbf{W}_K$ y $\mathbf{W}_V$ respectivamente) y cumplen papeles distintos —comparación frente a información transmitida— aunque ambas partan del mismo $\mathbf{X}$.
- [ ] En realidad las que coinciden son Q y V.
> Por qué: aunque Q, K y V se calculan a partir del mismo embedding de entrada, cada una usa su propia matriz de proyección aprendida y desempeña un papel distinto en el cálculo de la atención.

### ¿En qué se diferencia el papel de Q respecto al de K en el mecanismo de atención?
- [x] Q representa lo que el token actual "busca"; K representa cómo se presenta cada token para ser comparado con esa búsqueda.
- [ ] Q y K son exactamente lo mismo, solo cambia el nombre.
- [ ] Q solo se usa en el decoder y K solo en el encoder.
> Por qué: Query y Key cumplen papeles complementarios en la comparación: uno formula la pregunta implícita de un token, el otro ofrece la forma en que los demás tokens pueden ser encontrados por esa pregunta.

## Glosario

- **atención (mecanismo de)**: técnica que permite a cada token de una secuencia ponderar la información de los demás según su relevancia.
- **query (Q)**: proyección lineal de un token que representa qué está "buscando" en el resto de la secuencia.
- **key (K)**: proyección lineal de un token que representa cómo se compara frente a las queries de los demás.
- **value (V)**: proyección lineal de un token que representa la información que aporta si recibe atención.
- **autoatención (self-attention)**: mecanismo de atención en el que Q, K y V se calculan a partir de la misma secuencia de entrada.
- **Multi-Head Attention**: aplicación en paralelo de varias autoatenciones con proyecciones distintas, para capturar varios tipos de relación a la vez.
