---
id: bert-encoders
estado: borrador
---

## En una frase

BERT es un Transformer que usa solo el encoder para leer una frase en ambas direcciones a la vez, entrenado para rellenar huecos y comprender texto, no para generarlo.

## Intuición

Piensa en un examen de rellenar huecos: "El gato se subió al ___ para tomar el sol". Para acertar, lees toda la frase, no solo lo que viene antes del hueco. **BERT (Bidirectional Encoder Representations from Transformers)**, publicado por Google en 2018, se entrena precisamente así: se le ocultan palabras al azar en un texto y aprende a predecirlas usando tanto el contexto anterior como el posterior.

Esa capacidad de mirar en ambas direcciones a la vez es lo que distingue a BERT de un modelo que solo lee de izquierda a derecha para generar texto. BERT no está pensado para escribir: está pensado para entender, y esa comprensión profunda del contexto es lo que lo convirtió en la base de tareas como la búsqueda semántica, la clasificación de texto o la respuesta a preguntas.

## Explicación

### Solo la mitad del Transformer: encoder-only

BERT utiliza únicamente la parte **encoder** del [[transformer|Transformer]]: apila varios bloques de autoatención bidireccional (sin ninguna máscara causal), exactamente como ya viste en esa ficha, sin decoder. Esta decisión es la que le permite analizar cada palabra teniendo en cuenta tanto las palabras anteriores como las posteriores de la oración, a diferencia de los modelos que procesan el texto en una sola dirección.

### Cómo empaqueta BERT una entrada: [CLS] y [SEP]

Para estructurar la información, BERT añade tokens especiales a la secuencia de entrada. El token **[CLS]** se coloca al principio de toda secuencia y está entrenado para acumular una representación global del texto completo; por eso, en tareas de clasificación, suele usarse únicamente el vector asociado a [CLS] como entrada a la capa de decisión final. Cuando se trabaja con pares de frases (por ejemplo, para comparar si dos oraciones significan lo mismo), se inserta el token **[SEP]** entre ambas para marcar la separación.

### Preentrenamiento: rellenar huecos y ordenar frases

BERT se preentrena con dos objetivos simultáneos, sobre grandes volúmenes de texto sin etiquetar:

- **Masked Language Model (MLM)**: se ocultan aleatoriamente algunas palabras de la secuencia y el modelo debe predecirlas a partir del contexto restante. Esta tarea es la que obliga al modelo a aprender información bidireccional, sin depender de un orden de lectura fijo.
- **Next Sentence Prediction (NSP)**: se presentan pares de frases y el modelo decide si la segunda sigue realmente a la primera en el texto original o si fue elegida al azar, mejorando su capacidad de captar relaciones de coherencia entre fragmentos de texto.

### Usar BERT: extraer vectores o ajustar el modelo

Una vez preentrenado, BERT puede usarse de dos formas distintas. Si solo necesitas una **representación vectorial** del texto (para medir similitud, agrupar frases o alimentar un clasificador externo), puedes usar el modelo preentrenado sin modificar sus pesos: actúa como un traductor de texto a vectores. Si en cambio quieres que el propio modelo **tome una decisión concreta** (por ejemplo, asignar una etiqueta de sentimiento), hace falta añadir una capa de salida y entrenarla junto con el modelo sobre datos etiquetados: a esto se le llama [[transfer-learning|fine-tuning]], y ajusta los pesos internos de BERT para que la representación de [CLS] capture justo la información relevante para esa tarea.

## Formalización

El objetivo de entrenamiento del Masked Language Model es minimizar la entropía cruzada entre la predicción del modelo y la palabra real, solo en las posiciones enmascaradas:

$$
\mathcal{L}_{\text{MLM}} = -\sum_{i \in M} \log P_\theta(w_i \mid \mathbf{X}_{\setminus M})
$$

donde:
- $M$ es el conjunto de posiciones enmascaradas en la secuencia.
- $w_i$ es la palabra real que ocupaba la posición $i$ antes de ocultarla.
- $\mathbf{X}_{\setminus M}$ es la secuencia de entrada con las posiciones de $M$ sustituidas por el token `[MASK]`.
- $P_\theta(w_i \mid \mathbf{X}_{\setminus M})$ es la probabilidad que el modelo, con parámetros $\theta$, asigna a $w_i$ dado el resto de la secuencia visible.

**Ejemplo.** Para "el gato se subió al `[MASK]`" (verificado con `tools/calc.py`), si el modelo produce los logits $3{,}0$ para "tejado", $2{,}0$ para "árbol", $0{,}5$ para "coche" y $-0{,}5$ para "cielo", el softmax sobre esos cuatro candidatos da $P(\text{tejado})\approx0{,}676$, $P(\text{árbol})\approx0{,}249$, $P(\text{coche})\approx0{,}056$, $P(\text{cielo})\approx0{,}020$. Si la palabra real oculta era "tejado", entrenar con $\mathcal{L}_{\text{MLM}}$ empuja al modelo a aumentar aún más esa probabilidad.

## Interactivo

```widget
motor: pasos
fotogramas: [{"texto": "Frase de entrada: 'el gato se subió al [MASK]'. BERT ve tanto el contexto anterior como el posterior al hueco.", "tabla": {"cabecera": ["candidato", "probabilidad"], "filas": [["tejado", "0,676"], ["árbol", "0,249"], ["coche", "0,056"], ["cielo", "0,020"]], "resaltar": [[0, 1]]}}, {"texto": "El objetivo de entrenamiento (Masked Language Model) es aumentar la probabilidad de la palabra real que estaba oculta: aquí, 'tejado'."}, {"texto": "Para tareas de clasificación, en cambio, no se usa la predicción del hueco: se usa el vector del token especial **[CLS]**, entrenado para resumir toda la frase.", "cajas": ["[CLS] el gato se subió al tejado", "encoder BERT (12 capas)", "vector de [CLS] → clasificador"]}]
```

- Prueba a avanzar al primer fotograma y fíjate en que la probabilidad no se reparte igual entre los cuatro candidatos: ¿qué le pasaría a "tejado" si en vez de ser la palabra real fuera la menos probable?
- Prueba a imaginar la misma frase pero como parte de una tarea de clasificación de sentimiento: ¿qué vector usarías como entrada al clasificador?

## En código

```python
# no-ejecutar (requiere descargar un modelo preentrenado de Hugging Face)
from transformers import AutoTokenizer, AutoModel
import torch

tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
model = AutoModel.from_pretrained("bert-base-uncased")

inputs = tokenizer("El gato duerme en el sofá", return_tensors="pt")
with torch.no_grad():
    outputs = model(**inputs)

cls_embedding = outputs.last_hidden_state[:, 0, :]  # (1, 768): vector de [CLS]
print(cls_embedding.shape)
```

## Errores típicos

- **Error**: pensar que BERT genera texto como un chatbot → **Correcto**: BERT es un modelo de representación (encoder-only); no tiene mecanismo de generación autoregresiva, solo produce vectores contextuales.
- **Error**: creer que siempre hay que hacer fine-tuning para usar BERT → **Correcto**: si solo necesitas un vector que resuma el texto (para comparar, agrupar o buscar), puedes usar el modelo preentrenado sin ajustar sus pesos.
- **Error**: pensar que `[CLS]` es una palabra cualquiera del texto → **Correcto**: es un token especial añadido artificialmente al principio de cada secuencia, entrenado específicamente para acumular la representación global de toda la frase.

## En resumen

- BERT usa solo el encoder del Transformer, con atención bidireccional completa (sin máscara causal), para comprender texto en profundidad.
- Cómo funciona en 2 pasos de preentrenamiento: MLM (predecir palabras ocultas con el contexto completo) y NSP (decidir si una frase sigue a otra).
- Añade tokens especiales: `[CLS]` al inicio (resume toda la frase) y `[SEP]` para separar pares de frases.
- Fórmula clave: $\mathcal{L}_{\text{MLM}} = -\sum_{i\in M}\log P_\theta(w_i\mid \mathbf{X}_{\setminus M})$, entropía cruzada solo sobre las posiciones enmascaradas.
- Úsalo sin fine-tuning cuando solo necesites vectores de texto; con fine-tuning cuando quieras que el modelo resuelva directamente una tarea supervisada.
- Decisión que importa: si tu tarea necesita generar texto, BERT no es la opción, por diseño no tiene decoder.
- Trampa principal: olvidar que `[CLS]` solo captura bien el significado global si el modelo se ha entrenado (o ajustado) para esa tarea; no es mágico por defecto.

## A fondo

Desde su publicación, BERT ha dado lugar a variantes que ajustan el equilibrio entre precisión y coste computacional. **RoBERTa** elimina la tarea NSP (que resultó aportar menos de lo esperado) y entrena con más datos y más tiempo, mejorando la precisión final. **DistilBERT** usa destilación de conocimiento —un modelo pequeño aprende a imitar a uno grande— para conservar cerca del 97% del rendimiento de BERT con la mitad de los parámetros, ideal para dispositivos con recursos limitados. **ALBERT** reduce el número de parámetros mediante factorización de matrices y compartición de pesos entre capas, sin perder apenas capacidad de representación.

BERT y sus variantes se han aplicado sobre todo en clasificación de texto (spam, sentimiento, categorización de documentos), búsqueda semántica (entender el significado de una consulta más allá de las palabras clave) y reconocimiento de entidades nombradas, aprovechando en los tres casos su capacidad de generar representaciones contextuales de alta calidad.

## Autoevaluación

### Si el candidato correcto para el hueco de "el gato se subió al `[MASK]`" es "tejado" y el modelo le asigna $P(\text{tejado})\approx0{,}676$, ¿qué hace exactamente el entrenamiento con $\mathcal{L}_{\text{MLM}}$?
- [x] Ajusta los pesos del modelo para aumentar $P(\text{tejado})$ en esa posición, penalizando la probabilidad asignada a las demás.
- [ ] Ajusta los pesos para que las cuatro probabilidades se igualen entre sí.
- [ ] No hace nada, porque $0{,}676$ ya es la probabilidad más alta de las cuatro.
> Por qué: la entropía cruzada penaliza tanto más cuanto menor es la probabilidad asignada a la palabra correcta; aunque "tejado" ya sea la más probable, el entrenamiento sigue empujando esa probabilidad hacia 1 mientras haya margen.

### Necesitas agrupar miles de reseñas de producto por similitud de contenido, sin entrenar nada nuevo. ¿Qué harías con BERT?
- [x] Usar el modelo preentrenado tal cual y extraer el vector de `[CLS]` de cada reseña, sin fine-tuning.
- [ ] Hacer fine-tuning de BERT sobre las reseñas antes de poder usarlo.
- [ ] Usar BERT para generar automáticamente resúmenes de cada reseña.
> Por qué: agrupar por similitud es una tarea de representación, no de predicción supervisada ni de generación; el modelo preentrenado, sin ajustar, ya produce vectores de `[CLS]` útiles para comparar textos.

### Un compañero dice: "BERT lee de izquierda a derecha, igual que cualquier otro modelo de lenguaje". ¿Qué falla en esa afirmación?
- [ ] Nada, es correcta.
- [x] BERT usa atención bidireccional completa: cada token atiende tanto a las palabras anteriores como a las posteriores, no solo a las de la izquierda.
- [ ] BERT no lee ninguna dirección, solo procesa el token `[CLS]`.
> Por qué: precisamente lo que distingue a BERT de los modelos unidireccionales es que su encoder no aplica ninguna máscara causal, así que cada palabra se interpreta con el contexto completo de la frase.

### ¿En qué se diferencian los objetivos MLM y NSP del preentrenamiento de BERT?
- [x] MLM entrena al modelo a predecir palabras ocultas dentro de una frase; NSP entrena al modelo a decidir si una frase sigue a otra en el texto original.
- [ ] Son el mismo objetivo con nombres distintos.
- [ ] MLM se usa en fine-tuning y NSP en preentrenamiento.
> Por qué: MLM trabaja a nivel de palabra dentro de una secuencia y da a BERT su capacidad bidireccional; NSP trabaja a nivel de pares de frases y mejora la comprensión de relaciones de coherencia entre fragmentos de texto. Ambos se aplican durante el preentrenamiento.

## Glosario

- **BERT**: modelo Transformer encoder-only preentrenado para comprender texto mediante atención bidireccional.
- **[CLS]**: token especial al inicio de la secuencia de entrada de BERT, entrenado para resumir el significado global del texto.
- **[SEP]**: token especial que separa dos fragmentos de texto dentro de una misma secuencia de entrada.
- **Masked Language Model (MLM)**: tarea de preentrenamiento que oculta palabras al azar y entrena al modelo para predecirlas a partir del contexto.
- **Next Sentence Prediction (NSP)**: tarea de preentrenamiento de BERT que predice si una frase sigue a otra en el texto original o si fue elegida al azar.
