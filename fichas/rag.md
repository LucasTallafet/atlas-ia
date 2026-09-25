---
id: rag
estado: borrador
---

## En una frase

RAG combina un LLM con un buscador: antes de responder, recupera los fragmentos más relevantes de una base de conocimiento y se los da como contexto, para fundamentar la respuesta en información verificable.

## Intuición

Piensa en un examen a libro cerrado frente a uno a libro abierto. A libro cerrado, el alumno responde solo con lo que memorizó, y puede equivocarse en datos concretos o desactualizados. A libro abierto, primero busca el pasaje relevante en el manual y luego escribe la respuesta apoyándose en él.

Un [[llms|LLM]] normal funciona como el examen a libro cerrado: responde solo con lo que "memorizó" durante el preentrenamiento, así que puede fallar en preguntas sobre datos actualizados o muy específicos. La **generación aumentada por recuperación** (*Retrieval-Augmented Generation*, **RAG**) le da el libro abierto: antes de generar la respuesta, busca los documentos relevantes y se los añade como contexto.

## Explicación

### El problema: conocimiento interno limitado

Un LLM puede generar texto fluido incluso cuando no conoce bien el dato que se le pide, porque su única fuente es lo aprendido durante el entrenamiento. Eso favorece las alucinaciones, sobre todo ante preguntas sobre información actualizada, específica de un dominio o simplemente ausente del corpus de entrenamiento.

### El pipeline: recuperar y después generar

RAG separa el proceso en dos etapas. Primero, un sistema de recuperación compara la pregunta con un corpus de documentos usando **vectores semánticos** (ver [[word-embeddings]]) y selecciona los fragmentos más relevantes. Después, el modelo de generación recibe esos fragmentos como contexto adicional, junto con la pregunta original, y produce una respuesta fundamentada en ellos. Esto mejora la precisión y reduce las alucinaciones, sobre todo en dominios donde el dato exacto importa: asistencia médica, investigación científica o generación de informes legales.

### Cómo se decide qué recuperar

La recuperación no busca coincidencia literal de palabras (como haría [[bow-tfidf|TF-IDF]]), sino cercanía de significado: se compara el embedding de la pregunta con el embedding de cada fragmento del corpus, y se seleccionan los más similares.

## Formalización

$$
D_{\text{top-}k} = \underset{d \in \mathcal{D}}{\text{top-}k} \; \text{sim}(\mathbf{e}_q, \mathbf{e}_d)
$$

donde:

- $\mathcal{D}$ es el corpus de documentos o fragmentos disponibles.
- $\mathbf{e}_q$ es el embedding de la pregunta.
- $\mathbf{e}_d$ es el embedding de cada documento $d$ del corpus.
- $\text{sim}(\cdot,\cdot)$ es una medida de similitud entre vectores, típicamente la similitud coseno (ver [[word-embeddings]]).
- $D_{\text{top-}k}$ es el subconjunto de los $k$ documentos más similares a la pregunta, que se añaden como contexto al prompt final.

## Interactivo

```widget
motor: pasos
fotogramas: [
  {"texto": "**1. Pregunta del usuario**: *'¿Cuál es la capital administrativa de este proyecto?'*\n\nEl LLM, por sí solo, podría no conocer ese dato específico o inventarlo."},
  {"texto": "**2. Embedding de la pregunta**: la pregunta se convierte en un vector semántico $\\mathbf{e}_q$ que captura su significado."},
  {"texto": "**3. Recuperación de top-k fragmentos**: se compara $\\mathbf{e}_q$ con los embeddings de todos los fragmentos del corpus y se seleccionan los $k$ más similares.", "tabla": {"cabecera": ["Fragmento", "Similitud"], "filas": [["doc1: contiene el dato buscado", "0.99"], ["doc3: tema relacionado", "0.94"], ["doc2: tema distinto", "0.34"]], "resaltar": [[0, 0], [0, 1]]}},
  {"texto": "**4. Prompt final**: el LLM recibe la pregunta junto con los fragmentos recuperados como contexto, y genera una respuesta fundamentada en ellos en vez de inventar el dato."}
]
```

- Prueba a pensar qué pasaría si el corpus no contiene ningún fragmento relevante para la pregunta: ¿qué fallaría en el paso 3, y cómo afectaría eso a la respuesta final?
- Prueba a comparar este pipeline con preguntarle directamente al LLM sin los pasos 2 y 3: ¿en qué punto exacto entra la información externa?

## En código

```python
import numpy as np

# Embeddings de juguete (en la práctica los produce un modelo real)
docs = {
    "doc1": np.array([0.9, 0.1]),
    "doc2": np.array([0.1, 0.9]),
    "doc3": np.array([0.6, 0.4]),
}
pregunta = np.array([0.85, 0.2])

def coseno(a, b):
    return a @ b / (np.linalg.norm(a) * np.linalg.norm(b))

similitudes = {k: coseno(pregunta, v) for k, v in docs.items()}
top1 = max(similitudes, key=similitudes.get)
print(top1, round(similitudes[top1], 3))
# doc1 0.993 — el fragmento con el embedding más cercano al de la pregunta
```

## Errores típicos

- **Error**: pensar que RAG entrena o modifica el LLM. → **Correcto**: el modelo sigue siendo el mismo; solo cambia el contexto que recibe en el prompt.
- **Error**: creer que RAG elimina por completo las alucinaciones. → **Correcto**: las reduce al fundamentar la respuesta en documentos, pero el modelo puede seguir generando texto no respaldado por ellos.
- **Error**: pensar que la recuperación busca por coincidencia exacta de palabras. → **Correcto**: RAG recupera por similitud semántica de vectores, que encuentra fragmentos relevantes aunque no compartan las mismas palabras que la pregunta.

## En resumen

- **Qué hace:** combina un buscador semántico con un LLM para fundamentar sus respuestas en documentos externos.
- **Cómo funciona:** 1) convierte la pregunta en un embedding; 2) recupera los $k$ fragmentos más similares del corpus; 3) se los pasa al LLM como contexto; 4) el LLM genera la respuesta apoyándose en ellos.
- **Por qué importa:** reduce alucinaciones en preguntas sobre datos actualizados o muy específicos, sin reentrenar el modelo.
- **Cuándo usarlo:** dominios donde la precisión factual importa (medicina, investigación, informes legales) o donde el conocimiento cambia con frecuencia.
- **Decisión clave:** cómo de bueno es el sistema de recuperación; si no encuentra los fragmentos correctos, el LLM no puede fundamentar bien la respuesta.
- **Trampa principal:** RAG reduce alucinaciones, pero no las elimina del todo.

## A fondo

:::ampliacion
Un pipeline RAG en producción añade piezas que el material del curso no detalla:

- **Chunking**: los documentos largos se dividen en fragmentos (*chunks*) de tamaño manejable antes de calcular sus embeddings, porque un documento entero suele ser demasiado grande para compararlo como una sola unidad de significado.
- **Bases de datos vectoriales**: almacenan los embeddings de todos los fragmentos e indexan el corpus para poder buscar los más similares a una consulta sin comparar uno a uno con todo el corpus.
- **Recuperación híbrida**: combina la búsqueda dispersa por palabras clave (como [[bow-tfidf|TF-IDF]] o BM25) con la búsqueda densa por embeddings, porque cada una captura coincidencias distintas: la primera es fuerte con términos exactos (nombres propios, códigos), la segunda con el significado.
- **Reranking**: tras recuperar un conjunto amplio de candidatos, un segundo modelo los reordena según su relevancia real para la pregunta, antes de quedarse con los que finalmente entran en el prompt.
- **Evaluación de RAG**: además de evaluar la calidad de la respuesta final (ver [[evaluacion-llm]]), se mide si la recuperación encontró los fragmentos correctos y si la respuesta generada está realmente respaldada por ellos.

Fuente: Lewis et al. (2020), "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"; documentación de Hugging Face / sentence-transformers.
:::

## Autoevaluación

### ¿En qué momento exacto entra la información recuperada en un sistema RAG?
- [ ] Se usa para reentrenar los pesos del LLM antes de responder.
- [x] Se añade como contexto adicional en el prompt que recibe el LLM, junto con la pregunta.
- [ ] Sustituye por completo a la pregunta original del usuario.
> Por qué: RAG no modifica el modelo; el sistema de recuperación añade los fragmentos relevantes al prompt para que el LLM los use como contexto al generar la respuesta.

### Un sistema RAG recupera fragmentos que no tienen relación real con la pregunta. ¿Qué consecuencia es más probable?
- [ ] Ninguna: el LLM ignora automáticamente los fragmentos irrelevantes.
- [x] El LLM puede fundamentar una respuesta incorrecta en información que no viene al caso.
- [ ] El sistema detiene la generación y no responde.
> Por qué: RAG confía en que la recuperación haya encontrado los fragmentos correctos; si falla, el LLM puede seguir generando texto, pero apoyado en contexto equivocado.

### ¿Por qué RAG recupera por similitud de embeddings en vez de por coincidencia exacta de palabras?
- [ ] Porque es más rápido de calcular en cualquier caso.
- [x] Porque captura cercanía de significado, y puede encontrar fragmentos relevantes aunque no compartan las mismas palabras que la pregunta.
- [ ] Porque los embeddings garantizan encontrar siempre la respuesta correcta.
> Por qué: la similitud semántica encuentra relaciones de significado que una búsqueda por palabras exactas se perdería, aunque no garantiza que el resultado sea siempre el correcto.

## Glosario

- **RAG (Retrieval-Augmented Generation)**: técnica que combina un sistema de recuperación de documentos con un LLM, dándole al modelo contexto externo antes de generar la respuesta.
- **Chunking**: dividir un documento largo en fragmentos más pequeños antes de indexarlo.
- **Reranking**: reordenar un conjunto de candidatos recuperados según su relevancia real para la consulta.
