---
id: gpt-t5-generativos
estado: borrador
---

## En una frase

GPT genera texto palabra a palabra usando solo el decoder del Transformer; T5 usa encoder y decoder juntos y convierte cualquier tarea de NLP en transformar un texto en otro texto.

## Intuición

Piensa en dos formas distintas de ayudarte con un texto. La primera es alguien que completa lo que dices sobre la marcha: le das las primeras palabras y sigue escribiendo, una palabra tras otra, basándose solo en lo que ya se ha dicho. Así funciona **GPT (Generative Pre-trained Transformer)**: usa únicamente el decoder del [[transformer|Transformer]] y genera texto de forma autorregresiva, prediciendo siempre la siguiente palabra a partir de las anteriores.

La segunda es más parecida a un traductor todoterreno: no importa si le pides traducir una frase, resumir un párrafo o responder una pregunta, siempre convierte la petición en "toma este texto de entrada y dame este texto de salida". Así funciona **T5 (Text-to-Text Transfer Transformer)**: usa el encoder y el decoder completos del Transformer, y reformula cualquier tarea de NLP como una transformación de texto a texto, indicando la tarea con un prefijo dentro de la propia entrada, como `"translate English to Spanish: ..."` o `"summarize: ..."`.

Ambos generan texto, a diferencia de [[bert-encoders|BERT]], que solo produce vectores para representarlo; pero lo hacen de forma distinta: GPT no necesita más que el texto ya escrito, mientras que T5 siempre parte de una entrada explícita que condiciona lo que genera.

## Explicación

### Tres formas de montar el Transformer

[[bert-encoders|BERT]], GPT y T5 parten de los mismos bloques del [[transformer|Transformer]], pero los combinan de forma distinta según lo que necesitan hacer: BERT usa solo el encoder (comprensión), GPT usa solo el decoder (generación libre) y T5 usa encoder y decoder juntos, unidos por atención cruzada (generación condicionada a una entrada). Esta clasificación —*encoder-only*, *decoder-only*, *encoder-decoder*— es la que determina para qué sirve cada modelo, no su tamaño ni su fecha de publicación.

### GPT: un único objetivo para entrenar y para generar

En BERT, la tarea de preentrenamiento (rellenar huecos) es distinta de la tarea final (clasificar, etiquetar). En GPT, en cambio, preentrenamiento e inferencia comparten el mismo objetivo: predecir el siguiente token dada la secuencia anterior, lo que se llama **modelado de lenguaje causal**. Durante el entrenamiento se usa *[[transformer|teacher forcing]]* (ya visto: la entrada desplazada es el objetivo) junto con la [[transformer|máscara causal]], que aquí no es un simple recurso técnico: es la que impone que el modelo aprenda exactamente la misma tarea que hará luego en producción.

En inferencia no hay teacher forcing posible, porque no existe la frase completa todavía: GPT genera un token, lo concatena a la entrada, y usa esa entrada ampliada para predecir el siguiente, repitiendo el proceso hasta un token de fin de secuencia. Por eso la generación es estrictamente secuencial, aunque el entrenamiento se vectorice en paralelo gracias a la máscara causal.

### T5: convertir cualquier tarea en texto a texto

T5 no distingue arquitecturalmente entre traducir, resumir o responder preguntas: todas esas tareas se codifican como una única entrada de texto con un prefijo que indica qué transformación aplicar, por ejemplo `"question: ¿Quién escribió Don Quijote? context: Miguel de Cervantes fue un escritor español."` → `"Miguel de Cervantes"`. El encoder procesa esa entrada completa con atención bidireccional (como en BERT) y el decoder genera la salida de forma autorregresiva (como en GPT), consultando en cada paso la representación del encoder mediante [[transformer|atención cruzada]]. Esto convierte a T5 en un único modelo capaz de resolver tareas muy distintas sin cambiar de arquitectura, solo cambiando el prefijo de la entrada.

### Controlar la generación: temperatura, top-k y top-p

Tanto GPT como el decoder de T5 terminan cada paso con una distribución de probabilidad (softmax) sobre todo el vocabulario, de la que hay que elegir un token. Elegir siempre el más probable produce texto repetitivo y predecible; muestrear directamente de la distribución completa puede producir texto incoherente. Tres parámetros controlan ese equilibrio: la **temperatura**, que reescala la distribución antes de muestrear (más plana y aleatoria si es alta, más marcada y conservadora si es baja); **top-k**, que restringe el muestreo a los $k$ tokens más probables; y **top-p** (o *nucleus sampling*), que restringe el muestreo al menor conjunto de tokens cuya probabilidad acumulada supera $p$.

## Formalización

El objetivo de modelado de lenguaje causal, común a GPT y al decoder de T5, factoriza la probabilidad de una secuencia completa como producto de probabilidades condicionales:

$$
P(x_1, x_2, \dots, x_n) = \prod_{t=1}^{n} P(x_t \mid x_1, \dots, x_{t-1})
$$

donde:
- $x_1, \dots, x_n$ son los tokens de la secuencia, en orden.
- $P(x_t \mid x_1, \dots, x_{t-1})$ es la probabilidad que el modelo asigna al token $x_t$ dados únicamente los tokens que lo preceden.

La temperatura $T$ modifica el [[funciones-activacion|softmax]] con el que se elige cada token, dividiendo los logits antes de exponenciarlos:

$$
P(x_i) = \frac{e^{z_i / T}}{\sum_j e^{z_j / T}}
$$

donde:
- $z_i$ es el logit que el modelo asigna al token candidato $i$.
- $T$ es la temperatura ($T=1$ deja el softmax sin modificar; $T<1$ acentúa las diferencias entre candidatos; $T>1$ las suaviza).

**Ejemplo** (verificado con `tools/calc.py`): con los logits "gato"$=2{,}1$, "perro"$=1{,}8$, "pájaro"$=0{,}5$, a $T=1$ el softmax da $P(\text{gato})\approx0{,}515$, $P(\text{perro})\approx0{,}381$, $P(\text{pájaro})\approx0{,}104$. A $T=0{,}5$ (más conservador) sube a $P(\text{gato})\approx0{,}629$; a $T=2$ (más aleatorio) baja a $P(\text{gato})\approx0{,}433$ y "pájaro" sube a $0{,}195$. En los tres casos "gato" sigue siendo el candidato más probable: la temperatura cambia cuánto se reparte la probabilidad, no el orden de preferencia del modelo.

## Interactivo

```widget
motor: probabilidad
modo: "softmax"
logits: [{"token": "gato", "logit": 2.1}, {"token": "perro", "logit": 1.8}, {"token": "pájaro", "logit": 0.5}]
```

- Prueba a bajar la temperatura y observa cómo la probabilidad se concentra cada vez más en "gato", el candidato con el logit más alto.
- Prueba a subir mucho la temperatura y comprueba que las tres probabilidades tienden a igualarse, aunque "gato" nunca deja de ser la más alta.
- Prueba a imaginar un top-k=1: ¿qué token se generaría siempre, sin importar la temperatura?

## En código

```python
import numpy as np

def softmax_temperatura(logits, T):
    z = np.array(logits) / T
    e = np.exp(z - z.max())
    return e / e.sum()

logits = [2.1, 1.8, 0.5]  # "gato", "perro", "pájaro"
for T in [0.5, 1.0, 2.0]:
    print(T, np.round(softmax_temperatura(logits, T), 4))
# 0.5 [0.6291 0.3453 0.0256]
# 1.0 [0.5147 0.3813 0.1039]
# 2.0 [0.4329 0.3726 0.1945]
```

## Errores típicos

- **Error**: pensar que GPT y T5 hacen lo mismo por ser ambos generativos → **Correcto**: GPT es decoder-only y solo continúa un texto dado; T5 es encoder-decoder y siempre condiciona la generación a una entrada explícita con un prefijo de tarea.
- **Error**: creer que a BERT le bastaría con añadirle un decoder para que generase texto → **Correcto**: BERT nunca se entrenó con objetivo autorregresivo ni máscara causal; su encoder aprendió representaciones bidireccionales pensadas para comprender, no para predecir el siguiente token.
- **Error**: pensar que la temperatura cambia cuál es el token más probable → **Correcto**: la temperatura reescala cuánta probabilidad se reparte entre los candidatos, pero no cambia su orden: el logit más alto sigue produciendo la probabilidad más alta a cualquier temperatura.
- **Error**: confundir el prefijo de tarea de T5 (`"summarize: ..."`) con un comentario decorativo → **Correcto**: es parte literal de la entrada que el modelo usa para decidir qué transformación de texto a texto aplicar; sin él, T5 no tiene forma de saber qué tarea resolver.

## En resumen

- GPT es decoder-only: genera texto de forma autorregresiva, prediciendo cada token a partir de los anteriores.
- T5 es encoder-decoder: convierte cualquier tarea de NLP en transformar un texto de entrada (con un prefijo que indica la tarea) en un texto de salida.
- Cómo funciona GPT en inferencia: predice un token, lo concatena a la entrada, repite hasta un token de fin; en entrenamiento usa teacher forcing y procesa la secuencia en paralelo.
- Fórmula clave: modelado autorregresivo $P(x_1,\dots,x_n)=\prod_t P(x_t\mid x_1,\dots,x_{t-1})$.
- Controla la generación con temperatura (más alta = más variada), top-k y top-p (limitan el muestreo a los candidatos más probables).
- Úsalo: GPT para generación libre o continuación de texto; T5 cuando la tarea tiene una entrada y una salida bien definidas, como traducir o resumir.
- No lo uses: si solo necesitas representar texto sin generar nada, [[bert-encoders|BERT]] es más directo y barato.
- Trampa principal: pensar que bajar la temperatura a 0 hace el modelo "más inteligente"; solo lo hace más determinista, eligiendo siempre el token de mayor probabilidad.

## A fondo

En bibliotecas como Hugging Face Transformers, cada arquitectura tiene su propia clase de modelo según la tarea: `TFAutoModelForCausalLM` para modelos decoder-only como GPT (generación libre a partir de un prompt), `TFAutoModelForSeq2SeqLM` para modelos encoder-decoder como T5 (generación condicionada a una entrada, con `translate`/`summarize`/`question` como prefijos habituales) y `TFAutoModelForMaskedLM` para modelos encoder-only como BERT (predicción de huecos, sin `.generate()`). Para explorar generación sin entrenar nada, basta usar el modelo preentrenado tal cual con un prompt; para tareas muy específicas (resumen de un dominio concreto, paráfrasis con un estilo propio) suele hacerse fine-tuning sobre pares entrada-salida.

Evaluar un modelo generativo es menos directo que evaluar uno de clasificación: la **perplejidad** mide cuánto le "sorprende" al modelo el texto real (cuanto más baja, mejor predice); métricas como **BLEU** o **ROUGE** comparan el texto generado con una referencia humana en tareas como traducción o resumen; y en muchos casos hace falta evaluación cualitativa humana, porque un texto puede ser fluido y aun así decir algo incorrecto o irrelevante.

## Autoevaluación

### ¿Por qué GPT no necesita dos objetivos de entrenamiento distintos (uno para preentrenar y otro para la tarea final), a diferencia de BERT?
- [ ] Porque GPT no se preentrena, se entrena directamente para cada tarea.
- [x] Porque el objetivo de preentrenamiento de GPT (predecir el siguiente token) es exactamente el mismo que su tarea de inferencia: generar texto token a token.
- [ ] Porque GPT no usa ninguna función de pérdida durante el entrenamiento.
> Por qué: BERT se preentrena con MLM/NSP y luego necesita una capa y un objetivo distintos para cada tarea final (fine-tuning); GPT, en cambio, entrena y genera prediciendo siempre "el siguiente token dado el anterior", así que no hay salto de objetivo entre preentrenamiento e inferencia.

### Quieres construir un sistema que traduzca frases del español al inglés a partir de pares de ejemplo. ¿Qué arquitectura encaja mejor y por qué?
- [ ] BERT, porque su comprensión bidireccional basta para traducir.
- [x] T5, porque es encoder-decoder: el encoder puede procesar la frase en español con atención bidireccional y el decoder generar la traducción condicionándose a esa entrada mediante atención cruzada.
- [ ] Cualquiera de las tres arquitecturas funciona exactamente igual para esta tarea.
> Por qué: traducir necesita tanto comprender la entrada completa (rol del encoder) como generar una secuencia de salida condicionada a ella (rol del decoder con atención cruzada); GPT podría intentarlo sin encoder dedicado, pero T5 está diseñado explícitamente para este tipo de tarea entrada→salida.

### Generas texto con GPT usando temperatura $T=0{,}01$ (muy baja) frente a $T=5$ (muy alta). ¿Qué diferencia esperas?
- [ ] Con $T=0{,}01$ el modelo elegirá tokens completamente aleatorios; con $T=5$, siempre el más probable.
- [x] Con $T=0{,}01$ el modelo elegirá casi siempre el token de mayor probabilidad (texto muy determinista y repetitivo); con $T=5$ la distribución se aplana y el muestreo se vuelve mucho más aleatorio (texto más variado, con más riesgo de incoherencia).
- [ ] La temperatura no afecta a la generación de texto, solo al entrenamiento.
> Por qué: la temperatura reescala los logits antes del softmax; valores bajos exageran la diferencia entre el candidato más probable y el resto (casi determinista), valores altos la aplanan (casi uniforme), pero en ningún caso cambian cuál era el logit más alto.

### Un compañero dice: "T5 necesita un modelo distinto para cada tarea de NLP, igual que los sistemas clásicos". ¿Qué falla en esa afirmación?
- [ ] Nada, es correcta: T5 entrena un modelo separado por tarea.
- [x] T5 usa un único modelo para todas las tareas; lo que cambia entre tareas es el prefijo de texto en la entrada (`"translate..."`, `"summarize..."`), no la arquitectura ni los pesos entrenados por separado.
- [ ] T5 no puede resolver más de una tarea en absoluto.
> Por qué: la idea central de T5 es formular cualquier tarea de NLP como transformación de texto a texto, de modo que un mismo modelo entrenado conjuntamente puede traducir, resumir o responder preguntas simplemente cambiando el prefijo de la entrada.

## Glosario

- **modelado de lenguaje causal**: objetivo de entrenamiento que predice cada token a partir únicamente de los tokens anteriores, $P(x_t\mid x_1,\dots,x_{t-1})$; es el mismo objetivo que usa GPT en inferencia.
- **generación autorregresiva**: proceso de generar una secuencia token a token, reutilizando cada predicción como parte de la entrada para predecir el siguiente token.
- **temperatura**: parámetro que reescala los logits antes del softmax al generar texto; valores bajos hacen la generación más determinista, valores altos más variada.
- **top-k**: técnica de muestreo que restringe la elección del siguiente token a los $k$ candidatos más probables.
- **top-p (nucleus sampling)**: técnica de muestreo que restringe la elección al menor conjunto de candidatos cuya probabilidad acumulada supera $p$.
- **texto a texto (text-to-text)**: enfoque de T5 que formula cualquier tarea de NLP como transformar un texto de entrada, con un prefijo que indica la tarea, en un texto de salida.
