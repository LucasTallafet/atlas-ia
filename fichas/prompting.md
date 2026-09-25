---
id: prompting
estado: borrador
---

## En una frase

El prompt engineering diseña la instrucción que recibe un LLM, con o sin ejemplos y pidiéndole razonar paso a paso, para mejorar sus respuestas sin volver a entrenarlo.

## Intuición

Imagina que le pides una tarea a una persona nueva en el trabajo. Puedes explicársela de un tirón y esperar que acierte, enseñarle antes un par de casos resueltos, o pedirle que piense en voz alta mientras la resuelve. La tarea es la misma y la persona es la misma; lo que cambia es cómo le planteas el encargo, y eso cambia el resultado.

Con un [[llms|LLM]] pasa algo parecido. El modelo no se reentrena para cada tarea nueva: su comportamiento se ajusta con la forma en que se formula la entrada. Por eso pequeñas variaciones en el **prompt** (la instrucción que se le da) pueden producir respuestas muy distintas. Diseñar bien esa instrucción, sin tocar ni un parámetro del modelo, es lo que importa aquí.

## Explicación

### Cambiar la pregunta en vez de cambiar el modelo

Un LLM preentrenado ya conoce, en cierto sentido, cómo resolver muchas tareas: lo aprendió de los patrones de su enorme corpus de entrenamiento (ver [[llms]]). El **prompt engineering** no le enseña nada nuevo; formula la instrucción de entrada de manera que el modelo acceda a la parte de ese conocimiento que resuelve mejor la tarea concreta.

### Cuántos ejemplos dar: zero-shot y few-shot

La variante más simple es el **zero-shot learning**: se le pide la tarea directamente, sin ejemplos, confiando solo en lo aprendido durante el preentrenamiento. El **few-shot learning**, en cambio, incluye antes de la pregunta uno o varios ejemplos ya resueltos, que le muestran al modelo el formato y el tipo de razonamiento esperado. Ninguna de las dos opciones modifica los pesos del modelo: solo cambia lo que hay en la entrada.

### Pedir que razone: Chain-of-Thought y self-consistency

El **Chain-of-Thought (CoT) Prompting** no pide la respuesta final directamente, sino que anima al modelo a descomponer el problema en pasos intermedios. Un razonamiento explícito y estructurado es más fácil de seguir y menos propenso a errores que un salto directo a la conclusión.

Una variación es el **self-consistency prompting**: en vez de generar una única cadena de razonamiento, el modelo genera varias de forma independiente y se queda con la respuesta que más se repite entre ellas. Un error puntual en una sola cadena queda diluido por el resto.

### Razonar y actuar: ReAct y Tree-of-Thoughts

**ReAct (Reasoning + Acting)** combina el razonamiento en pasos con acciones de consulta externa: el modelo puede recuperar información adicional antes de dar su respuesta final. **Tree-of-Thoughts (ToT)** va más allá de una única cadena lineal: organiza el razonamiento en una estructura jerárquica que explora varios caminos posibles antes de decidir cuál seguir.

## Formalización

$$
\hat{y} = \arg\max_{y} \sum_{i=1}^{m} \mathbb{1}[y_i = y]
$$

donde:

- $m$ es el número de cadenas de razonamiento generadas de forma independiente.
- $y_i$ es la respuesta final a la que llega la cadena $i$.
- $\mathbb{1}[y_i = y]$ vale $1$ si esa cadena termina en la respuesta $y$ y $0$ en caso contrario.
- $\hat{y}$ es la respuesta elegida por self-consistency: la más repetida entre las $m$ cadenas.

## Interactivo

```widget
motor: pasos
fotogramas: [
  {"texto": "**Zero-shot**: se pide la respuesta sin dar ejemplos.\n\nPregunta: *'Juan tenía 5 manzanas, compra 3 más y regala 2. ¿Cuántas le quedan?'*\n\nRespuesta del modelo: *'6'* — incorrecta."},
  {"texto": "**Few-shot**: se muestra antes un ejemplo ya resuelto.\n\nEjemplo: *'Pedro tenía 4 peras, compra 2, regala 1 → le quedan 5.'*\n\nMisma pregunta que antes.\n\nRespuesta del modelo: *'6'* — el formato mejora, pero el cálculo puede seguir fallando."},
  {"texto": "**Chain-of-Thought**: se pide razonar paso a paso.\n\nRespuesta: *'Empieza con 5. Compra 3 → 8. Regala 2 → 6.'*\n\nEl resultado es correcto y, además, cada paso se puede revisar."},
  {"texto": "**Self-consistency**: se generan varias cadenas de razonamiento independientes (por ejemplo, tres) y se elige la respuesta que más se repite entre ellas, para no depender de un único razonamiento que pueda fallar."}
]
```

- Prueba a comparar el fotograma de zero-shot con el de Chain-of-Thought: localiza el paso intermedio que corrige el error.
- Prueba a imaginar qué pasaría si las tres cadenas de self-consistency dieran respuestas distintas entre sí: ¿qué te diría eso sobre la fiabilidad de esa respuesta?

## En código

```python
from collections import Counter

# Tres cadenas de razonamiento independientes para la misma pregunta
respuestas = ["6", "6", "7"]
conteo = Counter(respuestas)
mayoria = conteo.most_common(1)[0]
print(mayoria)
# ('6', 2) — self-consistency se queda con "6" porque aparece en 2 de las 3 cadenas
```

## Errores típicos

- **Error**: creer que zero-shot y few-shot cambian los pesos del modelo. → **Correcto**: solo cambian el prompt de entrada; el modelo es exactamente el mismo antes y después.
- **Error**: pensar que Chain-of-Thought solo hace la respuesta más larga. → **Correcto**: descompone el problema en pasos, lo que reduce errores de razonamiento, no solo alarga el texto.
- **Error**: confundir self-consistency con pedir una única respuesta más elaborada. → **Correcto**: genera varias cadenas de razonamiento independientes y vota la respuesta más repetida entre ellas.

## En resumen

- **Qué es:** diseñar la instrucción (prompt) que recibe un LLM para mejorar sus respuestas, sin reentrenar el modelo.
- **Zero-shot vs. few-shot:** sin ejemplos previos frente a con uno o varios ejemplos resueltos antes de la pregunta.
- **Chain-of-Thought:** pide al modelo razonar paso a paso en vez de saltar directo a la respuesta.
- **Self-consistency:** genera varias cadenas de razonamiento y vota la respuesta más repetida.
- **ReAct y Tree-of-Thoughts:** combinan razonamiento con consultas externas, o exploran varios caminos de razonamiento en árbol.
- **Cuándo importa:** en tareas donde una sola respuesta directa falla por errores de cálculo o de lógica.
- **Trampa principal:** ninguna de estas técnicas modifica el modelo; toda la mejora viene de cómo se formula la entrada.

## A fondo

El acceso a LLMs de última generación a través de plataformas como OpenAI, Hugging Face y Anthropic ha facilitado que investigadores y desarrolladores experimenten con estas estrategias de prompting sobre modelos comerciales y de código abierto por igual, comparando su impacto en la calidad de las respuestas para una misma tarea.

## Autoevaluación

### ¿Qué diferencia principal hay entre few-shot learning y fine-tuning?
- [ ] Few-shot también actualiza los pesos del modelo, pero con menos datos.
- [x] Few-shot solo cambia el prompt de entrada; fine-tuning sí reentrena parte de los pesos.
- [ ] No hay ninguna diferencia relevante.
> Por qué: few-shot muestra ejemplos dentro de la instrucción, sin tocar los parámetros del modelo; el ajuste fino ([[fine-tuning]]) sí los modifica.

### Un modelo genera tres cadenas de razonamiento independientes para el mismo problema y llega a "12", "15" y "12". ¿Qué respuesta elige self-consistency?
- [ ] 15, porque es la última generada.
- [x] 12, porque aparece en dos de las tres cadenas.
- [ ] Ninguna: hay que promediar los números.
> Por qué: self-consistency vota la respuesta más repetida entre las cadenas generadas, no promedia ni prioriza el orden.

### ¿Por qué Chain-of-Thought suele reducir errores frente a pedir la respuesta directa?
- [ ] Porque obliga al modelo a usar más tokens, y más tokens siempre significa más precisión.
- [x] Porque descompone el problema en pasos intermedios revisables, en lugar de saltar directo a una conclusión.
- [ ] Porque cambia los pesos del modelo para esa tarea concreta.
> Por qué: al hacer explícito el razonamiento paso a paso, es menos probable que un error de cálculo pase desapercibido, y ese razonamiento no requiere ni implica reentrenar el modelo.

## Glosario

- **Prompt engineering**: diseño de la instrucción de entrada a un LLM para mejorar sus respuestas sin reentrenarlo.
- **Zero-shot learning**: pedir una tarea al modelo sin darle ejemplos previos resueltos.
- **Few-shot learning**: mostrar al modelo uno o varios ejemplos resueltos antes de plantear la tarea.
- **Chain-of-Thought (CoT)**: técnica que pide al modelo descomponer su razonamiento en pasos explícitos.
- **Self-consistency**: generar varias cadenas de razonamiento y quedarse con la respuesta más repetida.
- **ReAct**: técnica que combina razonamiento en pasos con acciones de consulta externa.
- **Tree-of-Thoughts (ToT)**: organiza el razonamiento en una estructura jerárquica que explora varios caminos.
