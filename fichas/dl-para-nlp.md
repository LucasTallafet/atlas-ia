---
id: dl-para-nlp
estado: borrador
---

## En una frase

Tras [[tokenizacion|tokenizar]] el texto y convertirlo en [[word-embeddings|embeddings]], distintas arquitecturas —RNN, CNN o Transformer— se combinan con una capa de salida propia de cada tarea de NLP.

## Intuición

Piensa en una cadena de montaje. La materia prima es siempre la misma: texto sin procesar. La primera estación lo corta en piezas manejables (tokenización) y la segunda las convierte en piezas numéricas con significado (embeddings). A partir de ahí, la cadena se bifurca según lo que haya que fabricar: si la tarea necesita memoria de lo que vino antes, se usa una [[lstm-gru|LSTM o GRU]]; si necesita detectar patrones locales (una frase hecha, una negación), sirve una capa convolucional; si necesita relacionar cualquier palabra con cualquier otra sin importar la distancia, hace falta un Transformer.

Lo que de verdad cambia de una tarea a otra no es tanto esa parte intermedia, sino la última estación: la **capa de salida**. Clasificar un correo como spam necesita una única etiqueta para toda la frase; detectar nombres propios necesita una etiqueta por cada palabra; traducir necesita generar una frase entera, palabra a palabra. Entender esta plantilla común —entrada, embedding, procesamiento, salida— permite reconocer rápidamente qué arquitectura encaja en cada problema de NLP.

## Explicación

### Un flujo común para cualquier tarea de NLP con deep learning

Toda tarea de modelización en NLP con deep learning sigue la misma plantilla de cinco piezas: una entrada de índices enteros ya preprocesada, una capa de [[word-embeddings|embedding]] que convierte cada índice en un vector denso, una capa de procesamiento (RNN, CNN o Transformer) que combina esos vectores según el contexto, una capa de salida ajustada a la tarea y, por último, una función de pérdida y una métrica acordes al tipo de problema. Lo que distingue una tarea de otra es, sobre todo, la forma de la capa de salida y cómo se generan las secuencias de entrenamiento.

### Clasificación de texto: una etiqueta por secuencia

Tareas como el análisis de sentimiento o la detección de spam asignan una única etiqueta a todo un texto. La arquitectura habitual apila una capa de embedding, una capa de procesamiento —[[lstm-gru|LSTM o GRU]] si importa el orden y la dependencia a largo plazo, una CNN 1D si basta con detectar patrones locales (n-gramas)— y una capa densa final: `Dense(1, sigmoide)` para clasificación binaria o `Dense(N, softmax)` para multiclase. Con RNN, es habitual usar una capa **bidireccional** (procesa la secuencia en ambos sentidos) cuando el contexto posterior también importa, aplicar [[entrenamiento-dl|dropout]] entre el 20% y el 50% para evitar el sobreajuste, y reducir la salida de la RNN con un *pooling* global antes de la capa densa. Con CNN, cada filtro `Conv1D` actúa como detector de un n-grama, y un *pooling* global selecciona la señal más informativa de toda la secuencia.

### Etiquetado de secuencias: una etiqueta por token

El reconocimiento de entidades nombradas (NER) o el etiquetado gramatical (POS) no buscan una etiqueta global, sino una por cada palabra: para la entrada `["Juan", "viajó", "a", "Madrid"]`, la salida esperada es `["B-PER", "O", "O", "B-LOC"]`. La arquitectura típica usa una LSTM o GRU **bidireccional** con `return_sequences=True` (para producir una salida por paso, no solo la última) seguida de `Dense(N, softmax)` aplicada a cada token. Opcionalmente se añade una capa **CRF** al final, que aprende dependencias entre etiquetas consecutivas y evita secuencias inválidas, como una etiqueta `I-PER` sin un `B-PER` previo.

### Generación y traducción: modelar y producir secuencias

El **modelado del lenguaje** predice el siguiente token dada una secuencia previa —la base de la generación de texto y el autocompletado—, y se entrena de forma [[gpt-t5-generativos|autorregresiva]]: cada predicción puede reutilizarse como parte de la entrada para predecir el siguiente token. Cuando la entrada y la salida son secuencias completas de longitud distinta, como en traducción automática, se usa una arquitectura **secuencia a secuencia (seq2seq)**: un codificador (LSTM o GRU) resume la entrada en un vector de contexto, y un decodificador genera la salida token a token a partir de ese vector, usando durante el entrenamiento [[transformer|*teacher forcing*]] (la secuencia real, no la predicha, como entrada del siguiente paso). En inferencia, sin frase real disponible, la generación es estrictamente secuencial, y conviene aplicar ***beam search*** —explorar varias continuaciones posibles en paralelo, no solo la más probable en cada paso— para obtener secuencias más coherentes que con una elección puramente voraz.

### Respuesta a preguntas extractiva

Dada una pregunta y un contexto, el modelo no genera texto libre: localiza el fragmento del contexto que responde a la pregunta. La arquitectura reutiliza un encoder tipo [[bert-encoders|BERT]] sobre la entrada `[CLS] pregunta [SEP] contexto [SEP]`, con dos salidas densas que predicen la posición de inicio y la de fin de la respuesta dentro del contexto.

## Formalización

La capa de salida de una tarea de clasificación (una etiqueta por secuencia o por token) transforma el vector que produce la capa de procesamiento en una distribución sobre las clases posibles:

$$
\hat{\mathbf y} = f(\mathbf W \mathbf h + \mathbf b)
$$

donde:
- $\mathbf h$: vector de salida de la capa de procesamiento (estado oculto final de la LSTM/GRU, vector agregado tras *pooling* en la CNN, o representación del token en un Transformer).
- $\mathbf W, \mathbf b$: pesos y sesgo de la capa densa de salida.
- $f$: [[funciones-activacion|sigmoide]] para clasificación binaria o multilabel, [[funciones-activacion|softmax]] para multiclase; la pérdida asociada es la [[funciones-perdida|entropía cruzada]] correspondiente.

En una tarea de generación condicionada (seq2seq), la probabilidad de toda la secuencia de salida se factoriza token a token, igual que el modelado de lenguaje causal de [[gpt-t5-generativos]], pero condicionando además a la secuencia de entrada completa:

$$
P(\mathbf y \mid \mathbf x) = \prod_{t=1}^{T} P(y_t \mid y_1, \dots, y_{t-1}, \mathbf x)
$$

donde:
- $\mathbf x$: secuencia de entrada completa, resumida por el codificador.
- $y_t$: token generado en el paso $t$ de la secuencia de salida.
- $T$: longitud de la secuencia de salida.

**Ejemplo** (verificado con `tools/calc.py`): al traducir o completar un texto, si el modelo asigna $P(y_1=\text{"sobre"}\mid\mathbf x)=0{,}65$ y, dado ese primer token, $P(y_2=\text{"NLP"}\mid y_1,\mathbf x)=0{,}40$, la probabilidad de generar la secuencia `"sobre NLP"` completa es $0{,}65\times0{,}40=0{,}26$: cada token añadido multiplica por su propia probabilidad condicional, así que las secuencias largas acumulan probabilidades cada vez más pequeñas.

## En código

```python
# Generación de secuencias de entrada-salida con ventana deslizante fija (n=3)
texto = "me encanta aprender sobre inteligencia artificial".split()
vocabulario = {palabra: i for i, palabra in enumerate(sorted(set(texto)))}
tokens = [vocabulario[palabra] for palabra in texto]

def generar_secuencias_fijas(tokens, n=3):
    return [(tokens[i:i + n], tokens[i + n]) for i in range(len(tokens) - n)]

for entrada, salida in generar_secuencias_fijas(tokens, n=3):
    print(f"Entrada: {entrada} -> Salida: {salida}")
# Entrada: [4, 2, 0] -> Salida: 5
# Entrada: [2, 0, 5] -> Salida: 3
# Entrada: [0, 5, 3] -> Salida: 1
```

## Errores típicos

- **Error**: usar `Dense(N, softmax)` con `return_sequences=False` para una tarea de etiquetado de secuencias (NER, POS) → **Correcto**: el etiquetado necesita una predicción por token, así que la capa recurrente debe llevar `return_sequences=True` y la densa se aplica a cada paso de tiempo, no solo al último.
- **Error**: pensar que cualquier arquitectura recurrente sirve igual para clasificación y para generación → **Correcto**: clasificar usa el último estado oculto (o un *pooling* de todos) para producir una única salida; generar necesita producir una salida en cada paso y, en seq2seq, un codificador y un decodificador separados.
- **Error**: entrenar un modelo de generación de texto eligiendo siempre el token más probable en cada paso durante la inferencia → **Correcto**: esa estrategia voraz suele producir texto repetitivo o subóptimo; *beam search* o el muestreo (top-k, top-p) suelen dar mejores resultados.
- **Error**: usar una CRF esperando que reemplace a la capa recurrente → **Correcto**: la CRF no sustituye a la LSTM/GRU, se añade después para modelar la coherencia entre etiquetas consecutivas, no para procesar la secuencia de entrada.

## En resumen

- Toda tarea de NLP con deep learning sigue el mismo esqueleto: embedding → capa de procesamiento (RNN, CNN o Transformer) → capa de salida ajustada a la tarea.
- Clasificación: una etiqueta por secuencia, salida `Dense(1, sigmoide)` o `Dense(N, softmax)`.
- Etiquetado de secuencias: una etiqueta por token, `return_sequences=True` y, opcionalmente, una capa CRF para etiquetas coherentes.
- Generación y traducción: predicción autorregresiva token a token; en seq2seq, un codificador resume la entrada y un decodificador genera la salida con *teacher forcing* en entrenamiento y *beam search* en inferencia.
- Fórmula clave: $P(\mathbf y\mid\mathbf x)=\prod_t P(y_t\mid y_{<t},\mathbf x)$ para generación condicionada.
- Decisión que importa: elegir LSTM/GRU (contexto secuencial), CNN (patrones locales) o Transformer (contexto global), según la tarea y los recursos disponibles.
- Trampa principal: confundir la forma de la capa de salida (una vs. muchas predicciones) con la elección de arquitectura de procesamiento; son decisiones independientes.

## A fondo

La elección de arquitectura también depende del tamaño del dataset: con menos de 10.000 ejemplos conviene un embedding preentrenado congelado (`trainable=False`) para evitar el sobreajuste; entre 10.000 y 100.000, un embedding preentrenado con fine-tuning; por encima de 100.000, entrenar el embedding desde cero suele dar mejores resultados porque hay datos suficientes para aprender representaciones específicas del dominio. La longitud máxima de secuencia (`input_length`) conviene fijarla según el percentil 90 de la distribución real de longitudes del corpus, y el `padding='post'` suele preferirse en RNN para que la red no procese ceros antes de la información relevante.

Los desafíos más comunes se repiten en las tres familias de arquitecturas: el sobreajuste se combate con dropout, menos unidades y parada anticipada; el desbalance de clases, con ponderación de clases (`class_weight`); y el entrenamiento lento en RNN, sustituyendo LSTM por GRU o reduciendo el tamaño de lote. Para modelado del lenguaje y traducción existen dos formas de construir las secuencias de entrenamiento a partir de un texto: la **ventana deslizante fija**, que recorta fragmentos de longitud constante $n$ y desliza esa ventana palabra a palabra (más barata, típica de clasificación de fragmentos), y la **ventana deslizante creciente**, que empieza con una palabra y va ampliando el contexto hasta el final del texto (más cara, pero captura mejor las dependencias largas, típica del modelado del lenguaje).

## Autoevaluación

### Quieres construir un sistema que reconozca nombres de personas y lugares en un texto. ¿Qué forma debe tener la capa de salida?
- [ ] `Dense(1, sigmoide)`, una única predicción por frase.
- [x] `Dense(N, softmax)` aplicada a cada paso de tiempo (`return_sequences=True`), con una predicción por token.
- [ ] Un vector de contexto único generado por un codificador, sin capa de salida adicional.
> Por qué: el reconocimiento de entidades es una tarea de etiquetado de secuencias: cada palabra necesita su propia etiqueta (`B-PER`, `O`, `B-LOC`...), así que la capa recurrente debe devolver una salida por paso y la densa se aplica token a token.

### ¿Por qué en la generación de texto conviene usar *beam search* en vez de elegir siempre el token más probable en cada paso?
- [ ] Porque *beam search* es obligatorio para que el modelo entrene correctamente.
- [x] Porque elegir siempre el token más probable (estrategia voraz) puede llevar a secuencias globalmente peores; *beam search* explora varias continuaciones a la vez y suele encontrar secuencias más coherentes en conjunto.
- [ ] Porque sin *beam search* el modelo no puede generar más de un token.
> Por qué: una elección voraz optimiza cada paso por separado, sin ver el efecto en pasos futuros; *beam search* mantiene varias hipótesis en paralelo y elige al final la de mayor probabilidad conjunta.

### Un compañero entrena un traductor automático usando la predicción del propio modelo (en vez de la palabra real) como entrada del decodificador en cada paso del entrenamiento. ¿Qué problema tiene ese enfoque?
- [ ] Ninguno, es exactamente lo que hace *teacher forcing*.
- [x] Prescinde de *teacher forcing*: si el modelo se equivoca pronto, ese error se arrastra y contamina el resto de la secuencia de entrenamiento, haciendo el aprendizaje más lento e inestable.
- [ ] El problema es que ese enfoque solo funciona con arquitecturas CNN.
> Por qué: *teacher forcing* usa la secuencia objetivo real como entrada del decodificador durante el entrenamiento precisamente para evitar que los errores tempranos del modelo se propaguen y desestabilicen el aprendizaje.

### Tienes un dataset de 8.000 reseñas de un dominio técnico muy específico para clasificación de sentimiento. Según las recomendaciones de tamaño de dataset, ¿qué harías con el embedding?
- [ ] Entrenarlo desde cero, porque siempre da mejores resultados.
- [x] Usar un embedding preentrenado y congelarlo (`trainable=False`), porque el dataset es pequeño y entrenar el embedding desde cero arriesga el sobreajuste.
- [ ] No usar ninguna capa de embedding en absoluto.
> Por qué: con menos de 10.000 ejemplos, un embedding preentrenado y congelado aprovecha conocimiento general del lenguaje sin arriesgarse a sobreajustar representaciones específicas con tan pocos datos.

## Glosario

- **CRF (*Conditional Random Field*)**: capa opcional que se añade tras una RNN de etiquetado de secuencias para modelar dependencias entre etiquetas consecutivas y evitar predicciones inconsistentes.
- ***beam search***: estrategia de generación que mantiene varias secuencias candidatas en paralelo en cada paso, en vez de elegir siempre el token más probable, para encontrar secuencias globalmente más coherentes.
- **ventana deslizante**: técnica para construir pares entrada-salida de entrenamiento a partir de un texto continuo, recortando fragmentos de tamaño fijo o creciente que se desplazan sobre la secuencia.
