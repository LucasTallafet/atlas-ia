---
id: transformer
estado: borrador
---

## En una frase

El Transformer procesa una secuencia entera en paralelo usando atención, en vez de palabra por palabra, y se organiza en un encoder que interpreta la entrada y un decoder que genera la salida.

## Intuición

Antes de los Transformers, un modelo de lenguaje leía una frase como quien lee un libro con el dedo: palabra tras palabra, sin poder saltar adelante ni volver atrás sin perder el hilo. Eso es lo que hacían las redes recurrentes como la [[lstm-gru|LSTM]]: procesaban cada token dependiendo del anterior, lo que las hacía lentas y les costaba conectar palabras muy alejadas entre sí.

El Transformer, introducido en 2017 en el artículo *"Attention is All You Need"*, cambia el planteamiento: en vez de leer secuencialmente, mira toda la frase a la vez y usa el [[atencion|mecanismo de atención]] para decidir qué palabras están relacionadas entre sí, sin importar la distancia que las separe. Esto le permite procesar la secuencia en paralelo (más rápido de entrenar) y capturar relaciones de largo alcance con la misma facilidad que las cercanas. Por eso es la base de casi todos los modelos de lenguaje actuales: BERT, GPT, T5 y sus descendientes son, en esencia, distintas formas de combinar los mismos bloques Transformer.

## Explicación

### Dos bloques con roles distintos: encoder y decoder

La arquitectura Transformer original se organiza en dos partes:

- El **encoder** recibe la secuencia de entrada completa y la transforma en una representación interna rica en contexto: captura qué se dice y en qué orden.
- El **decoder** genera la secuencia de salida palabra por palabra, de forma autoregresiva, usando tanto la representación del encoder como las palabras que él mismo ya ha generado.

No todos los modelos usan ambos bloques: como verás más adelante, algunos usan solo el encoder y otros solo el decoder, según la tarea para la que estén pensados.

### De las palabras a los vectores: embeddings y codificación posicional

Antes de llegar al primer bloque de atención, el texto pasa por [[tokenizacion|tokenización]] (no se repite aquí: consulta esa ficha para granularidad y vocabulario) y cada token se convierte en un [[word-embeddings|embedding]] denso mediante una matriz de embeddings aprendida.

El problema es que el Transformer procesa todos los tokens en paralelo, sin ninguna noción de orden incorporada: si no se hace nada más, "el gato persigue al ratón" y "el ratón persigue al gato" tendrían la misma representación de entrada. Para resolverlo se suma a cada embedding un vector de **codificación posicional**, que depende únicamente de la posición del token en la secuencia (no se aprende, se calcula con una fórmula fija) y le indica al modelo dónde está cada palabra.

### Dentro de un bloque encoder: atención, residuo y feedforward

Cada bloque del encoder aplica el [[atencion|mecanismo de atención]] (ya visto: cómo se calculan Q, K y V y cómo se combinan no se repite aquí) sobre la secuencia completa, sin ninguna restricción: cualquier token puede atender a cualquier otro, en ambas direcciones. Tras la atención, el bloque añade dos ingredientes más:

- Una [[cnn-arquitecturas|conexión residual]], que suma la entrada original del bloque a la salida de la atención, y una **normalización por capas**, que estabiliza la escala de las activaciones.
- Una **red feedforward** que se aplica de forma independiente a cada posición (cada token pasa por la misma red pequeña), seguida de nuevo por conexión residual y normalización.

Varios bloques de este tipo se apilan uno tras otro (por ejemplo, BERT-base usa 12), refinando en cada capa la representación contextual de la secuencia.

### El decoder: atención enmascarada y atención cruzada

El decoder repite una estructura parecida, pero con dos mecanismos de atención distintos en cada bloque:

- **Autoatención enmascarada**: el decoder se atiende a sí mismo, pero con una **máscara causal** que impide que un token vea posiciones futuras. Así se impone la generación autoregresiva: cada token solo puede depender de los anteriores y de sí mismo.
- **Atención cruzada**: las Queries provienen del decoder, pero las Keys y los Values provienen de la salida del encoder. Este es el mecanismo que permite que cada token generado incorpore información de la secuencia de entrada; sin él, el decoder generaría texto sin condicionarlo a ningún input, como haría un modelo puramente generativo.

Tras ambas atenciones, el decoder aplica también una red feedforward, conexiones residuales y normalización, y termina con una capa final que proyecta la salida al tamaño del vocabulario y aplica softmax para obtener la distribución de probabilidad sobre la siguiente palabra.

### Tipos de máscara

Además de la atención cruzada (que nunca lleva máscara, porque el decoder puede consultar libremente toda la salida, ya conocida, del encoder), existen tres situaciones de enmascarado:

- **Máscara de padding**: impide atender a los tokens de relleno (`[PAD]`) que se añaden para igualar la longitud de las secuencias de un lote. Se usa en cualquier modelo, sea encoder o decoder.
- **Máscara causal**: restringe la atención a los tokens previos y al actual, típica de modelos decoder-only o del decoder en arquitecturas encoder-decoder.
- **Sin máscara**: atención bidireccional completa, típica de modelos encoder-only como BERT, donde cada token puede atender a todos los demás sin restricción.

## Formalización

La codificación posicional de Vaswani et al. (2017) se calcula, para la posición $pos$ y la dimensión $i$ del embedding, con funciones seno y coseno de distinta frecuencia:

$$
PE(pos, 2i) = \sin\left(\frac{pos}{10000^{2i/d}}\right), \qquad PE(pos, 2i+1) = \cos\left(\frac{pos}{10000^{2i/d}}\right)
$$

donde:
- $pos$ es la posición del token en la secuencia ($0, 1, 2, \dots$).
- $i$ es el índice de cada par de dimensiones del embedding ($0, 1, \dots, d/2-1$).
- $d$ es la dimensión total del embedding.

**Ejemplo** (dimensión $d=4$, verificado con `tools/calc.py`): $PE(0)=[0,\ 1,\ 0,\ 1]$, $PE(1)=[0{,}8415,\ 0{,}5403,\ 0{,}0100,\ 1{,}0000]$, $PE(2)=[0{,}9093,\ -0{,}4161,\ 0{,}0200,\ 0{,}9998]$: cada posición obtiene un vector distinto, acotado entre $-1$ y $1$, sin depender de la longitud de la secuencia.

Cada bloque envuelve su sub-capa (atención o feedforward) con una conexión residual y una normalización por capas:

$$
\text{salida} = \text{LayerNorm}(\mathbf{x} + \text{Subcapa}(\mathbf{x}))
$$

donde:
- $\mathbf{x}$ es la entrada al sub-bloque (por ejemplo, los embeddings con codificación posicional, o la salida de la atención).
- $\text{Subcapa}(\cdot)$ es la atención o la red feedforward.
- $\text{LayerNorm}(\cdot)$ normaliza la escala de las activaciones resultantes.

La red feedforward se aplica igual a cada posición de forma independiente:

$$
\text{FFN}(\mathbf{x}) = \text{ReLU}(\mathbf{x}\mathbf{W}_1 + \mathbf{b}_1)\mathbf{W}_2 + \mathbf{b}_2
$$

donde:
- $\mathbf{W}_1 \in \mathbb{R}^{d \times d_{ff}}$ y $\mathbf{W}_2 \in \mathbb{R}^{d_{ff} \times d}$ son matrices de pesos aprendidas, típicamente con $d_{ff} = 4d$.
- $\mathbf{b}_1, \mathbf{b}_2$ son los sesgos de cada capa lineal.

Una máscara causal para 4 tokens es una matriz triangular inferior:

$$
\begin{bmatrix}1&0&0&0\\1&1&0&0\\1&1&1&0\\1&1&1&1\end{bmatrix}
$$

donde cada fila $i$ indica con un $1$ las posiciones (columnas) a las que el token $i$ puede atender: solo él mismo y los anteriores.

## Interactivo

```widget
motor: matriz-calor
modo: "mascaras"
filas: ["El", "gato", "duerme", "mucho"]
columnas: ["El", "gato", "duerme", "mucho"]
valores: [[1, 0, 0, 0], [1, 1, 0, 0], [1, 1, 1, 0], [1, 1, 1, 1]]
```

- Prueba a cambiar al modo "sin máscara" y comprueba que todas las celdas quedan habilitadas: así funciona la autoatención del encoder en BERT.
- Prueba a mantener la máscara causal y fíjate en que ningún token puede atender a uno posterior: así genera texto un decoder como el de GPT.
- Prueba a imaginar que "mucho" fuera en realidad un token de relleno (`[PAD]`): ¿qué columna debería anularse en una máscara de padding, independientemente del tipo de máscara anterior?

## En código

```python
import numpy as np

def codificacion_posicional(pos, d):
    v = np.zeros(d)
    for i in range(d // 2):
        angulo = pos / (10000 ** (2 * i / d))
        v[2 * i] = np.sin(angulo)
        v[2 * i + 1] = np.cos(angulo)
    return v

for p in range(3):
    print(p, np.round(codificacion_posicional(p, 4), 4))
# 0 [0.     1.     0.     1.    ]
# 1 [0.8415 0.5403 0.01   1.    ]
# 2 [0.9093 -0.4161 0.02   0.9998]
```

## Errores típicos

- **Error**: pensar que, al procesar la secuencia en paralelo, el Transformer pierde toda noción de orden → **Correcto**: la codificación posicional se suma a los embeddings precisamente para conservar esa información, sin necesidad de procesar los tokens uno a uno.
- **Error**: creer que el encoder y el decoder funcionan igual → **Correcto**: el encoder usa autoatención bidireccional sin restricciones; el decoder añade una máscara causal en su autoatención y, además, una atención cruzada hacia la salida del encoder.
- **Error**: pensar que la máscara causal solo hace falta al generar texto en producción → **Correcto**: también se aplica durante el entrenamiento (con *teacher forcing*), para que el modelo no "haga trampa" mirando tokens futuros aunque procese la secuencia completa en paralelo.
- **Error**: confundir la máscara de padding con la máscara causal → **Correcto**: la de padding solo ignora tokens de relleno y puede combinarse con cualquier arquitectura; la causal bloquea específicamente los tokens futuros para imponer generación autoregresiva.

## En resumen

- El Transformer procesa una secuencia completa en paralelo usando atención, en vez de palabra por palabra como una RNN.
- Se organiza en un encoder (interpreta la entrada con atención bidireccional) y un decoder (genera la salida con atención causal más atención cruzada al encoder).
- Cómo entra la información en 2 pasos: embeddings léxicos + codificación posicional; cada bloque aplica atención, conexión residual, normalización y una red feedforward.
- Fórmula clave de la codificación posicional: $PE(pos,2i)=\sin(pos/10000^{2i/d})$, $PE(pos,2i+1)=\cos(pos/10000^{2i/d})$.
- Tres tipos de máscara: de padding (ignora relleno, en cualquier modelo), causal (bloquea el futuro, en decoders) y sin máscara (bidireccional completa, en encoders como BERT).
- Decisión que importa: cuántos bloques se apilan y si el modelo usa solo encoder, solo decoder, o ambos, según la tarea.
- Trampa principal: olvidar que la atención cruzada del decoder no necesita máscara, porque la salida del encoder ya es conocida por completo cuando se genera cada token.

## A fondo

Frente a una RNN, cuyo tiempo de inferencia crece linealmente con la longitud de la secuencia porque cada paso depende del anterior, el Transformer distribuye el cálculo de la atención en paralelo sobre toda la secuencia, lo que reduce drásticamente el tiempo de entrenamiento en hardware moderno (GPU/TPU) y facilita escalar a secuencias mucho más largas.

Cuando se publicó el artículo *"Attention is All You Need"* (Vaswani et al., 2017), parte de la comunidad científica dudó de que un mecanismo basado solo en atención pudiera sustituir a las redes recurrentes y convolucionales, entonces dominantes en NLP. El tiempo les dio la razón a sus autores: el Transformer acabó convirtiéndose en la base de BERT, GPT, T5 y prácticamente todos los grandes modelos de lenguaje posteriores, cada uno usando el encoder, el decoder, o ambos, según si su objetivo es comprender texto, generarlo, o transformar una secuencia en otra.

## Autoevaluación

### ¿Por qué es necesaria la codificación posicional en un Transformer, si no lo era en una RNN?
- [x] Porque el Transformer procesa todos los tokens en paralelo y, sin ella, no tendría ninguna forma de distinguir su orden en la secuencia.
- [ ] Porque el Transformer no usa embeddings y necesita otra forma de representar las palabras.
- [ ] Porque solo la necesita el decoder, no el encoder.
> Por qué: una RNN procesa los tokens uno a uno y el orden queda implícito en ese procesamiento secuencial; el Transformer los procesa todos a la vez, así que necesita inyectar la posición explícitamente sumándola al embedding.

### Un token del encoder de BERT, ¿a qué posiciones puede atender dentro de la misma secuencia?
- [ ] Solo a las posiciones anteriores a la suya.
- [ ] Solo a la posición inmediatamente siguiente.
- [x] A todas las posiciones de la secuencia, sin restricción, porque el encoder usa atención bidireccional completa.
> Por qué: el encoder no aplica máscara causal; cada token puede atender a cualquier otro token de la secuencia, lo que le permite construir representaciones que incorporan tanto el contexto anterior como el posterior.

### Un compañero dice: "la conexión residual sirve para acelerar el cálculo, saltándose capas que no hacen falta". ¿Qué falla en esa afirmación?
- [ ] Nada, es correcta.
- [x] La conexión residual no salta capas ni las hace innecesarias: suma la entrada original a la salida de la sub-capa para preservar información y mejorar el flujo de gradientes durante el entrenamiento, no para ahorrar cálculo.
- [ ] Las conexiones residuales solo existen en el decoder, no en el encoder.
> Por qué: la conexión residual ($\mathbf{x} + \text{Subcapa}(\mathbf{x})$) es una suma, no un atajo que se salte cálculos; su función es evitar que se pierda información de la entrada y estabilizar el entrenamiento en redes profundas con muchos bloques apilados.

### ¿En qué se diferencia la atención cruzada del decoder respecto a la autoatención que ya conoces de [[atencion]]?
- [x] En la atención cruzada, las Queries provienen del decoder, pero las Keys y los Values provienen de la salida del encoder, en vez de la misma secuencia.
- [ ] En que la atención cruzada no usa Queries, Keys ni Values.
- [ ] En que la atención cruzada solo se aplica durante el entrenamiento, nunca en inferencia.
> Por qué: la operación matemática es la misma (softmax de $\mathbf{Q}\mathbf{K}^\top/\sqrt{d'}$ por $\mathbf{V}$), pero en la atención cruzada las tres matrices no provienen todas de la misma secuencia: Q sale del decoder y K, V salen del encoder, lo que permite condicionar la generación al contenido de entrada.

## Glosario

- **codificación posicional**: vector que se suma al embedding léxico de cada token para indicar su posición en la secuencia, sin depender de la longitud de esta.
- **normalización por capas (LayerNorm)**: técnica que reescala las activaciones de una capa para estabilizar su magnitud antes de continuar.
- **atención cruzada**: mecanismo de atención en el que las Queries provienen de una secuencia (el decoder) y las Keys y Values de otra (la salida del encoder).
- **máscara causal**: matriz que impide que un token atienda a posiciones futuras, imponiendo la generación autoregresiva.
- **teacher forcing**: técnica de entrenamiento que usa la secuencia objetivo real, y no las predicciones del propio modelo, como entrada en cada paso.
