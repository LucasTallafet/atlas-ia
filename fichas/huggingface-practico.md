---
id: huggingface-practico
estado: borrador
---

## En una frase

Hugging Face Transformers ofrece, para cada arquitectura y tarea de NLP, una clase de modelo lista para usar —con prefijo `TF` en TensorFlow—, sin tener que construir la arquitectura a mano.

## Intuición

Piensa en comprar un electrodoméstico con varios programas en vez de montar la máquina pieza a pieza. Con Hugging Face, elegir la clase correcta —una para clasificar, otra para etiquetar palabras, otra para generar texto— es como girar el dial del programa adecuado: el motor interno (el modelo preentrenado, como [[bert-encoders|BERT]] o [[gpt-t5-generativos|GPT/T5]]) es el mismo, pero cada clase conecta su salida de forma distinta según la tarea, sin que tengas que definir esa conexión desde cero.

## Explicación

### PyTorch o TensorFlow: mismo modelo, prefijo distinto

La biblioteca `transformers` funciona con dos backends de deep learning. Las clases `AutoModel*` (`AutoModel`, `AutoModelForSequenceClassification`...) están asociadas a PyTorch; sus equivalentes en TensorFlow llevan siempre el prefijo `TF` (`TFAutoModel`, `TFAutoModelForSequenceClassification`...) y se implementan sobre `tf.keras.Model`. El tokenizador (`AutoTokenizer`) es el único componente independiente del backend: se usa igual en ambos casos.

### Una clase por tarea

Cada tarea de NLP tiene su propia clase `TFAutoModelFor...`, que añade la cabeza de salida adecuada sobre el encoder o decoder preentrenado: `TFAutoModelForSequenceClassification` para clasificar un texto completo (sentimiento, spam, tema), `TFAutoModelForTokenClassification` para etiquetar cada token (NER, POS), `TFAutoModelForQuestionAnswering` para localizar una respuesta dentro de un contexto, `TFAutoModelForMaskedLM` para el preentrenamiento tipo BERT, y `TFAutoModelForCausalLM` / `TFAutoModelForSeq2SeqLM` para generación libre o condicionada, como se vio en [[gpt-t5-generativos]]. Elegir la clase correcta evita definir manualmente la arquitectura de salida: basta con cargar el modelo preentrenado con esa clase y ya produce la forma de salida esperada por la tarea.

### Encoder-only frente a generativos: dos flujos de trabajo distintos

Aunque comparten biblioteca y convenciones, los modelos *encoder-only* (BERT y variantes) y los generativos (GPT, T5) se usan de forma distinta en la práctica:

| Aspecto | Modelos encoder-only | Modelos generativos |
|---|---|---|
| Tipo de salida | Etiquetas estructuradas | Texto generado secuencialmente |
| Flujo de inferencia | `.predict()` | `.generate()` |
| Entrenamiento supervisado | Entrada → clase o etiqueta | Entrada → texto objetivo |
| Uso sin [[fine-tuning]] | Embeddings del token `[CLS]` | Frecuente, con *prompt* + `.generate()` |
| Recursos para ajustar | Bajos a medios | Medios a altos |

## Formalización

No aplica: es una comparación de convenciones y clases de una biblioteca de software, no un concepto matemático.

## En código

```python
# no-ejecutar (requiere descargar un modelo preentrenado de Hugging Face)
from transformers import BertTokenizer, BertForSequenceClassification
import torch

tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
model = BertForSequenceClassification.from_pretrained("bert-base-uncased")

texto = "BERT es un modelo de lenguaje revolucionario"
entrada = tokenizer(texto, return_tensors="pt")

with torch.no_grad():
    salida = model(**entrada)

print(salida.logits)
```

## Errores típicos

- **Error**: usar `AutoModelForSequenceClassification` en un proyecto en TensorFlow → **Correcto**: en TensorFlow hace falta el prefijo `TF` (`TFAutoModelForSequenceClassification`); mezclar convenciones de PyTorch y TensorFlow produce errores de tipo o de carga del modelo.
- **Error**: usar `.generate()` sobre un modelo encoder-only como BERT → **Correcto**: BERT no tiene decoder ni fue entrenado para generar texto; `.generate()` es propio de modelos causales o encoder-decoder como GPT o T5.
- **Error**: cargar `TFAutoModel` (sin cabeza) esperando obtener directamente una predicción de clase → **Correcto**: `TFAutoModel` solo produce representaciones internas (embeddings); para una predicción de tarea hace falta la clase `TFAutoModelFor...` correspondiente, con su cabeza de salida.

## En resumen

- Hugging Face ofrece una clase distinta por tarea (`TFAutoModelFor...`), que añade la cabeza de salida adecuada sobre el modelo preentrenado.
- En TensorFlow, toda clase lleva el prefijo `TF`; el tokenizador es el único componente compartido entre PyTorch y TensorFlow.
- Los modelos encoder-only se usan con `.predict()` y producen etiquetas; los generativos, con `.generate()`, producen texto.
- Úsalo sin [[fine-tuning]] cuando solo necesites representaciones (`TFAutoModel`) o generación libre con *prompt*; ajusta con fine-tuning cuando necesites una tarea supervisada concreta.
- Decisión que importa: elegir la clase `TFAutoModelFor...` que coincide exactamente con la tarea, para no tener que construir la cabeza de salida a mano.
- Trampa principal: confundir el backend (PyTorch vs. TensorFlow) o el tipo de modelo (encoder-only vs. generativo) y llamar al método de inferencia equivocado.

## A fondo

Cada clase `TFAutoModelFor...` produce una forma de salida distinta: `TFAutoModelForSequenceClassification` devuelve `[batch_size, num_labels]`; `TFAutoModelForTokenClassification`, `[batch_size, seq_len, num_labels]`; `TFAutoModelForQuestionAnswering`, dos vectores `[batch_size, seq_len]` (posiciones de inicio y fin); `TFAutoModelForCausalLM` y `TFAutoModelForSeq2SeqLM`, `[batch_size, seq_len, vocab_size]`, una distribución sobre todo el vocabulario en cada paso. Conocer esta forma de salida ayuda a depurar errores de dimensión antes incluso de entrenar nada.

## Autoevaluación

### Quieres extraer solo el vector de embedding de una frase, sin ninguna cabeza de clasificación. ¿Qué clase usarías en TensorFlow?
- [ ] `TFAutoModelForSequenceClassification`
- [x] `TFAutoModel`
- [ ] `TFAutoModelForCausalLM`
> Por qué: `TFAutoModel` carga el modelo preentrenado sin ninguna cabeza de salida añadida, ideal cuando solo se necesita la representación interna del texto, no una predicción de tarea.

### Un proyecto en PyTorch usa `AutoModelForTokenClassification`. ¿Qué clase habría que usar para el mismo propósito en un proyecto en TensorFlow?
- [ ] La misma clase, `AutoModelForTokenClassification`, funciona igual en ambos backends.
- [x] `TFAutoModelForTokenClassification`, con el prefijo `TF` que identifica la versión de TensorFlow.
- [ ] `TFAutoModel`, sin especializar por tarea.
> Por qué: la convención de Hugging Face añade el prefijo `TF` a toda clase equivalente en TensorFlow; usar la clase sin prefijo en un proyecto de TensorFlow no es compatible.

### ¿Por qué no tiene sentido llamar a `.generate()` sobre un modelo cargado con `TFAutoModelForSequenceClassification`?
- [ ] Porque `.generate()` no existe en la biblioteca `transformers`.
- [x] Porque esa clase produce una distribución sobre etiquetas de clasificación, no texto; `.generate()` es el flujo de inferencia de los modelos causales o encoder-decoder que producen texto token a token.
- [ ] Porque `.generate()` solo funciona con modelos en PyTorch.
> Por qué: el flujo de inferencia depende de la tarea del modelo: los modelos de clasificación se consultan con `.predict()` (o llamando al modelo directamente) para obtener etiquetas; `.generate()` es específico de modelos que producen secuencias de texto.

## Glosario

- **TFAutoModelFor... (familia de clases)**: conjunto de clases de Hugging Face Transformers en TensorFlow, cada una añadiendo sobre un modelo preentrenado la cabeza de salida correspondiente a una tarea de NLP concreta.
- **`.generate()`**: método de inferencia de los modelos causales o encoder-decoder de Hugging Face que produce texto token a token, en contraste con `.predict()`, propio de los modelos que producen etiquetas.
