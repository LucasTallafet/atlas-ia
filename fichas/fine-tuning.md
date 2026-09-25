---
id: fine-tuning
estado: borrador
---

## En una frase

El fine-tuning reentrena un modelo de lenguaje ya preentrenado con datos etiquetados de una tarea concreta, ajustando parte o todos sus pesos para especializarlo sin partir de cero.

## Intuición

Imagina a un traductor con años de experiencia traduciendo textos generales: novelas, noticias, correos. Domina la gramática y el vocabulario común, pero le encargan ahora traducir contratos legales, llenos de términos como "cláusula de indemnidad" que apenas ha visto. No necesita reaprender el idioma desde cero: le basta un curso intensivo de una semana leyendo y practicando con contratos reales para adaptarse al vocabulario y las convenciones del nuevo dominio.

El **fine-tuning** (ajuste fino) hace lo mismo con un modelo preentrenado como [[bert-encoders|BERT]]: en vez de entrenarlo desde cero con millones de textos —el equivalente a formar al traductor durante años—, toma el conocimiento general que ya tiene del lenguaje y lo reentrena brevemente con un conjunto de datos etiquetado y específico de un dominio (reseñas de un comercio electrónico, historiales clínicos, contratos), para que sus predicciones se ajusten a ese contexto concreto. El resultado combina la comprensión amplia del lenguaje que trae de fábrica con la precisión que solo da la práctica en la tarea real.

## Explicación

### Usar el modelo tal cual o ajustarlo

Como ya viste en [[bert-encoders]], un modelo preentrenado puede usarse de dos formas. Si solo necesitas una representación vectorial del texto —para medir similitud, agrupar documentos o alimentar un clasificador externo—, el modelo preentrenado ya sirve sin tocar sus pesos. Pero si el modelo debe tomar directamente una decisión (clasificar un sentimiento, extraer una entidad de un dominio técnico) y los resultados no alcanzan la precisión esperada, hace falta fine-tuning: reentrenarlo con ejemplos etiquetados para que su representación interna capture justo lo relevante para esa tarea.

El fine-tuning es especialmente necesario cuando el lenguaje del dominio se aleja del texto general con el que se preentrenó el modelo —jerga médica, legal o financiera— y cuando existen datos etiquetados disponibles para guiar el ajuste. Sin datos etiquetados representativos y suficientes, no hay forma de dirigir el reentrenamiento hacia la tarea.

### Las etapas del ajuste fino

**1. Elegir el modelo preentrenado.** La decisión combina precisión y coste, y también depende del idioma y del dominio de los textos disponibles: modelos grandes como RoBERTa-large capturan patrones más complejos pero exigen más memoria y cómputo; modelos compactos como [[bert-encoders|DistilBERT]] sacrifican algo de precisión a cambio de menor latencia, ideales para dispositivos con recursos limitados o aplicaciones móviles.

**2. Preparar los datos etiquetados.** Se aplica el mismo [[tokenizacion|preprocesamiento]] ya visto (normalización, tokenización con el tokenizador específico del modelo elegido) y se divide el conjunto en entrenamiento, [[validacion|validación]] y prueba, para poder medir si el modelo generaliza o solo memoriza. Un conjunto bien curado también debe cuidar el balance entre clases: si el 95% de los ejemplos etiquetados son de una sola categoría, el modelo puede aprender a predecir casi siempre esa clase y aun así lograr una precisión aparentemente alta, sin haber aprendido a distinguir las demás.

**3. Ajustar los hiperparámetros.** Aquí es donde el fine-tuning en NLP añade matices concretos a lo ya visto en [[transfer-learning]]: la [[descenso-gradiente|tasa de aprendizaje]] se fija muy baja (valores típicos entre $2\times10^{-5}$ y $5\times10^{-5}$) precisamente para no destruir de golpe el conocimiento preentrenado, y el número de **épocas** suele limitarse a 2-4, ya que entrenar de más sobre un conjunto de datos pequeño lleva rápido al sobreajuste. La decisión de cuántas capas congelar —solo la cabeza de salida, o también parte del encoder— sigue la misma lógica de [[transfer-learning|extracción de características frente a fine-tuning]]: cuanto más se aleje el dominio destino del texto general de preentrenamiento, más capas conviene descongelar.

**4. Entrenar de forma supervisada.** El modelo ajusta sus pesos con los datos etiquetados mientras se monitoriza la pérdida de validación en cada época, para detectar a tiempo el sobreajuste o el subajuste antes de gastar más cómputo del necesario.

**5. Evaluar el modelo ajustado.** Se usan las [[metricas-clasificacion|métricas]] habituales de clasificación —precisión, recall, F1— sobre el conjunto de prueba, nunca sobre datos vistos durante el entrenamiento, para decidir si el modelo está listo para producción o necesita más ajuste.

### ¿Cuándo conviene mejor no hacer fine-tuning?

No toda aplicación necesita reentrenar el modelo. Cuando la tarea es representar texto para compararlo, agruparlo o indexarlo —búsqueda semántica, detección de duplicados, agrupamiento de documentos con K-Means o DBSCAN—, basta con extraer los embeddings del modelo preentrenado y usarlos como entrada de un algoritmo externo (una SVM, una red densa pequeña). Esta vía es más rápida, no necesita datos etiquetados y evita el riesgo de sobreajuste que trae el fine-tuning con pocos ejemplos. La decisión práctica se reduce a una pregunta: ¿necesito que el propio modelo tome una decisión supervisada concreta, o me basta con una buena representación del texto? Solo en el primer caso hace falta reentrenar.

### Caso práctico: clasificar reseñas de un comercio electrónico

Una empresa quiere clasificar reseñas de productos en positivas, negativas y neutras. BERT, preentrenado con texto general, no capta bien las expresiones informales típicas de las reseñas, así que se hace fine-tuning de `bert-base-uncased` con 50.000 reseñas etiquetadas (80% entrenamiento, 10% validación, 10% prueba). Se fija una tasa de aprendizaje de $2\times10^{-5}$, 3 épocas, y se congelan las capas inferiores del encoder para conservar el conocimiento general del lenguaje mientras solo las capas superiores y la cabeza de clasificación se especializan en distinguir sentimientos. El modelo resultante alcanza un 89% de precisión sobre el conjunto de prueba, una mejora clara frente a enfoques basados en reglas.

## Formalización

Un encoder preentrenado tiene sus parámetros organizados en $L$ capas apiladas. Al añadir una cabeza de salida nueva para la tarea y decidir congelar las $k$ primeras capas (las más profundas, más cercanas a la entrada), el conjunto de parámetros que participa en el reentrenamiento es:

$$
\boldsymbol\theta_{\text{entrenable}} = \boldsymbol\theta_{\text{cabeza}} \;\cup\; \bigcup_{l=k+1}^{L} \boldsymbol\theta_{\text{capa}_l}
$$

donde:
- $L$: número total de capas del encoder.
- $k$: número de capas congeladas, contadas desde la primera (las más profundas).
- $\boldsymbol\theta_{\text{capa}_l}$: parámetros de la capa $l$ del encoder.
- $\boldsymbol\theta_{\text{cabeza}}$: parámetros de la cabeza de salida añadida para la tarea (por ejemplo, la capa densa de clasificación).

El resto del mecanismo —por qué se congela, por qué la tasa de aprendizaje se reduce— ya se formalizó en [[transfer-learning]]; aquí solo cambia qué capas se cuentan como "las primeras": en un encoder de texto, son las que procesan primero la secuencia de entrada.

**Ejemplo** (verificado con `tools/calc.py`): un encoder de juguete con 3 capas de $2{,}0$ M de parámetros cada una, más un embedding de $0{,}3$ M y una cabeza de clasificación de $0{,}1$ M ($6{,}4$ M en total). Congelando las 3 capas y entrenando solo la cabeza, se ajusta el $1{,}6\%$ del modelo; congelando 2, el $32{,}8\%$; congelando 1, el $64{,}1\%$; sin congelar ninguna, el $95{,}3\%$ (el embedding queda fuera del cálculo por permanecer siempre congelado en este ejemplo).

## Interactivo

```widget
motor: pasos
fotogramas: [{"texto": "Un encoder preentrenado de 3 capas ($2{,}0$ M de parámetros cada una) más un embedding de $0{,}3$ M. Al añadir una cabeza de clasificación de $0{,}1$ M, el modelo completo tiene $6{,}4$ M de parámetros.", "tabla": {"cabecera": ["estrategia", "capas de encoder entrenables", "parámetros entrenables", "% del total"], "filas": [["Solo cabeza (todo congelado)", "0 de 3", "0,1 M", "1,6%"], ["Última capa + cabeza", "1 de 3", "2,1 M", "32,8%"], ["Dos últimas capas + cabeza", "2 de 3", "4,1 M", "64,1%"], ["Todo el encoder + cabeza", "3 de 3", "6,1 M", "95,3%"]], "resaltar": [[0, 2]]}}, {"texto": "Congelar todo el encoder y entrenar solo la cabeza es lo más barato y lo que menos riesgo de sobreajuste tiene, pero limita cuánto puede adaptarse el modelo a la jerga del dominio.", "tabla": {"cabecera": ["estrategia", "capas de encoder entrenables", "parámetros entrenables", "% del total"], "filas": [["Solo cabeza (todo congelado)", "0 de 3", "0,1 M", "1,6%"], ["Última capa + cabeza", "1 de 3", "2,1 M", "32,8%"], ["Dos últimas capas + cabeza", "2 de 3", "4,1 M", "64,1%"], ["Todo el encoder + cabeza", "3 de 3", "6,1 M", "95,3%"]], "resaltar": [[1, 2]]}}, {"texto": "Descongelar también las capas superiores del encoder (más cercanas a la salida) permite capturar patrones más específicos de la tarea, a cambio de más cómputo y más riesgo de sobreajuste con pocos datos.", "tabla": {"cabecera": ["estrategia", "capas de encoder entrenables", "parámetros entrenables", "% del total"], "filas": [["Solo cabeza (todo congelado)", "0 de 3", "0,1 M", "1,6%"], ["Última capa + cabeza", "1 de 3", "2,1 M", "32,8%"], ["Dos últimas capas + cabeza", "2 de 3", "4,1 M", "64,1%"], ["Todo el encoder + cabeza", "3 de 3", "6,1 M", "95,3%"]], "resaltar": [[2, 2]]}}, {"texto": "Ajustar todo el encoder es lo que más puede mejorar la precisión si hay datos etiquetados suficientes, pero también lo más caro y lo más expuesto a borrar el conocimiento preentrenado si la tasa de aprendizaje no es lo bastante baja.", "tabla": {"cabecera": ["estrategia", "capas de encoder entrenables", "parámetros entrenables", "% del total"], "filas": [["Solo cabeza (todo congelado)", "0 de 3", "0,1 M", "1,6%"], ["Última capa + cabeza", "1 de 3", "2,1 M", "32,8%"], ["Dos últimas capas + cabeza", "2 de 3", "4,1 M", "64,1%"], ["Todo el encoder + cabeza", "3 de 3", "6,1 M", "95,3%"]], "resaltar": [[3, 2]]}}]
```

- Prueba a avanzar fotograma a fotograma y observa cómo crece el porcentaje entrenable: ¿qué estrategia elegirías con solo 500 reseñas etiquetadas?
- Prueba a calcular tú mismo qué porcentaje se entrenaría si, además de las 3 capas del encoder, también se ajustara el embedding ($0{,}3$ M adicionales).
- Prueba a relacionar la última fila con la tasa de aprendizaje: ¿por qué ajustar el 95,3% del modelo exige una tasa de aprendizaje especialmente baja?

## En código

```python
# no-ejecutar (requiere descargar un modelo y un dataset desde Hugging Face)
from transformers import BertTokenizer, BertForSequenceClassification, TrainingArguments, Trainer

tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
model = BertForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=3)

training_args = TrainingArguments(
    output_dir="./results",
    evaluation_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=16,
    num_train_epochs=3,
)

trainer = Trainer(model=model, args=training_args, train_dataset=train_dataset, eval_dataset=val_dataset)
trainer.train()
```

```python
capa = 2.0  # millones de parametros por capa de encoder (juguete)
n_capas = 3
cabeza = 0.1
embed = 0.3
total = embed + n_capas * capa + cabeza

for congeladas in [3, 2, 1, 0]:
    entrenables = cabeza + (n_capas - congeladas) * capa
    print(f"congeladas={congeladas}  entrenables={entrenables:.1f}M  pct={100*entrenables/total:.1f}%")
# congeladas=3  entrenables=0.1M  pct=1.6%
# congeladas=2  entrenables=2.1M  pct=32.8%
# congeladas=1  entrenables=4.1M  pct=64.1%
# congeladas=0  entrenables=6.1M  pct=95.3%
```

## Errores típicos

- **Error**: pensar que hace falta fine-tuning cada vez que se usa un modelo preentrenado → **Correcto**: si solo necesitas vectores de texto para comparar o agrupar, el modelo preentrenado sin ajustar ya sirve, como se vio en [[bert-encoders]].
- **Error**: usar una tasa de aprendizaje típica de un entrenamiento desde cero (0,01-0,1) → **Correcto**: en fine-tuning de NLP se usan tasas mucho más bajas, entre $2\times10^{-5}$ y $5\times10^{-5}$, para no borrar de golpe el conocimiento preentrenado.
- **Error**: congelar siempre todo el encoder por defecto, sin considerar el tamaño del dataset ni cuán distinto es el dominio → **Correcto**: con pocos datos y un dominio parecido, congelar casi todo evita el sobreajuste; con más datos o un dominio muy distinto, conviene descongelar más capas.
- **Error**: entrenar muchas épocas pensando que más entrenamiento siempre mejora el resultado → **Correcto**: pasadas 2-4 épocas sobre un dataset de fine-tuning suele aparecer sobreajuste; hay que vigilar la pérdida de validación, no solo la de entrenamiento.

## En resumen

- El fine-tuning reentrena un modelo preentrenado con datos etiquetados de tu dominio para especializarlo en una tarea supervisada concreta.
- Cómo funciona en 5 pasos: elegir modelo base → preparar datos etiquetados → fijar hiperparámetros → entrenar → evaluar con [[metricas-clasificacion|precisión, recall y F1]].
- Fórmula clave: parámetros entrenables = cabeza de salida + capas del encoder que no se congelan.
- Úsalo cuando el modelo preentrenado no capta la jerga del dominio y dispones de datos etiquetados; evítalo (usa el modelo tal cual) si solo necesitas vectores de texto.
- Decisiones que importan: qué modelo base (tamaño vs. recursos), cuántas capas congelar, la tasa de aprendizaje (siempre baja) y el número de épocas.
- Trampa principal: una tasa de aprendizaje alta o demasiadas épocas borran el conocimiento preentrenado en vez de afinarlo ([[transfer-learning|catástrofe del olvido]]).

## A fondo

En Hugging Face Transformers, cada tarea tiene su propia clase de modelo sobre el encoder: `TFAutoModelForSequenceClassification` añade una cabeza densa sobre el vector `[CLS]` para clasificar (sentimiento, spam, tema); `TFAutoModelForTokenClassification` añade una salida por token, útil en reconocimiento de entidades o etiquetado gramatical; y `TFAutoModelForQuestionAnswering` predice dos posiciones (inicio y fin de la respuesta) dentro de un contexto. Todas comparten el mismo encoder preentrenado y solo cambian en la cabeza de salida y en cómo se etiquetan los datos.

El flujo práctico habitual, pensado para entornos con recursos limitados como Google Colab gratuito, sigue siete pasos: definir la tarea, cargar el modelo preentrenado junto a su tokenizador, tokenizar el dataset (con `padding`, `truncation` y una `max_length` acorde a la longitud típica de los textos), decidir si hacer fine-tuning o solo extraer embeddings, elegir el flujo de entrenamiento (`Trainer`, que automatiza validación y métricas, o control manual con `model.fit()`), evaluar con las métricas de la tarea y, por último, guardar el modelo ajustado con `.save_pretrained()` para reutilizarlo sin repetir el entrenamiento.

Conviene reservar el fine-tuning para casos con matices sutiles (sentimiento con múltiples clases), léxico muy especializado (medicina, derecho) o sistemas de pregunta-respuesta sobre un dominio cerrado, y no para tareas donde ya basta una buena representación del texto sin ajustar.

El entrenamiento en sí puede hacerse con distintas herramientas según el volumen de trabajo. Para experimentos puntuales, `Trainer` de Hugging Face (o `model.fit()` sobre `tf.keras.Model`) es suficiente. Cuando el fine-tuning forma parte de un proceso recurrente —reentrenar un modelo cada vez que llegan reseñas nuevas, por ejemplo—, conviene orquestarlo con una herramienta como **Apache Airflow**, que programa, monitoriza y encadena tareas de un pipeline de NLP completo: ingesta de datos, preprocesamiento, tokenización, entrenamiento y evaluación, sin intervención manual en cada paso. La elección entre PyTorch y TensorFlow como backend de entrenamiento no suele depender del fine-tuning en sí, sino del resto del proyecto: PyTorch tiende a resultar más directo en investigación y prototipado, mientras que TensorFlow ofrece una integración algo más madura con herramientas de despliegue en producción como TensorFlow Serving.

## Autoevaluación

### Un equipo tiene solo 300 reseñas etiquetadas de un producto muy específico y quiere clasificarlas por sentimiento. ¿Qué estrategia de fine-tuning es más razonable como primera opción?
- [ ] Descongelar todo el encoder y entrenar muchas épocas para maximizar la precisión.
- [x] Congelar la mayor parte del encoder (o incluso todo) y entrenar solo la cabeza de clasificación, dado lo pequeño del dataset.
- [ ] Entrenar un BERT desde cero con esas 300 reseñas.
- [ ] No hacer fine-tuning ni usar el modelo preentrenado, porque el dataset es demasiado pequeño.
> Por qué: con muy pocos datos, ajustar muchos parámetros arriesga un sobreajuste severo; congelar casi todo el encoder y entrenar solo la cabeza aprovecha el conocimiento preentrenado con el mínimo riesgo.

### ¿Por qué el fine-tuning de un modelo de NLP usa tasas de aprendizaje del orden de $2\times10^{-5}$ en vez de las tasas mayores (0,01-0,1) típicas de entrenar una red desde cero?
- [ ] Porque los modelos de NLP son más pequeños y necesitan menos ajuste.
- [x] Porque una tasa alta modificaría bruscamente pesos que ya codifican conocimiento útil del preentrenamiento, arriesgando destruirlo antes de aprender la tarea nueva.
- [ ] Porque `transformers` no permite tasas de aprendizaje mayores a $10^{-4}$.
> Por qué: el objetivo del fine-tuning es ajustar el conocimiento preentrenado, no sobrescribirlo; una tasa muy baja permite pasos pequeños que se acumulan durante varias épocas sin borrar de golpe lo ya aprendido.

### Quieres usar BERT únicamente para agrupar miles de artículos de noticias por similitud de contenido, sin ninguna etiqueta disponible. ¿Hace falta fine-tuning?
- [ ] Sí, siempre hay que ajustar el modelo antes de usarlo para cualquier tarea.
- [x] No: basta con extraer el vector `[CLS]` (o el promedio de tokens) de cada artículo con el modelo preentrenado y agruparlos, por ejemplo con K-Means.
- [ ] No, pero solo si los artículos están en inglés.
> Por qué: agrupar por similitud es una tarea de representación, no una predicción supervisada; sin datos etiquetados no hay forma de guiar un fine-tuning, y el modelo preentrenado ya produce vectores útiles para comparar textos.

### En el ejemplo numérico de la ficha (encoder de 3 capas de 2,0 M cada una, cabeza de 0,1 M), ¿qué estrategia entrena aproximadamente un tercio de los parámetros del encoder+cabeza?
- [ ] Congelar todo el encoder y entrenar solo la cabeza.
- [x] Congelar 2 de las 3 capas y entrenar la última capa más la cabeza (2,1 M de 6,4 M, un 32,8%).
- [ ] Descongelar las 3 capas del encoder.
> Por qué: entrenar la última capa (2,0 M) más la cabeza (0,1 M) da 2,1 M de un total de 6,4 M, aproximadamente un tercio; congelar más o menos capas mueve ese porcentaje hacia el 1,6% o el 95,3%.

## Glosario

- **época (*epoch*)**: una pasada completa del proceso de entrenamiento sobre todo el conjunto de datos de ajuste.
- **cabeza de clasificación (*classification head*)**: capa (o pequeño conjunto de capas) añadida al final de un modelo preentrenado, entrenada para producir la salida específica de la tarea a partir de su representación interna.
