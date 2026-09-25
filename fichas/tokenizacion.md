---
id: tokenizacion
estado: borrador
---

## En una frase

Tokenizar es cortar un texto en piezas manejables (palabras, subpalabras o caracteres); lematizar o aplicar *stemming* reduce cada palabra a una forma base para no tratar sus variantes como conceptos distintos.

## Intuición

Antes de poder analizar una frase, un modelo necesita cortarla en piezas, igual que para leer en voz alta primero separas el texto en palabras. Pero el tamaño de esas piezas se puede elegir: puedes cortar por palabras completas, por fragmentos de palabra o incluso letra a letra, según lo que necesite la tarea. Además, muchas de esas piezas son en realidad la misma idea repetida con distinta forma gramatical: "corro", "corriendo" y "corrió" son formas distintas del mismo verbo. Reducirlas a una única forma base —"correr"— evita que un modelo trate cada variante como si fuera una palabra completamente nueva.

## Explicación

### Cortar el texto en tokens

La **tokenización** divide un texto en unidades llamadas **tokens**, cuya granularidad se elige según la tarea: por palabras (lo más habitual: "¡Hola mundo!" → ["¡Hola", "mundo", "!"]), por caracteres (útil en tareas muy detalladas), por subpalabras (habitual en modelos modernos tipo transformer) o por oraciones (útil en resumen automático o análisis de sentimiento por frase).

El idioma condiciona la dificultad: en español o inglés las palabras van separadas por espacios, pero en chino o japonés no hay delimitadores claros y la tokenización depende de modelos específicos. La puntuación y las contracciones también exigen decisiones: conservar los signos puede ser relevante en análisis sintáctico, pero ruido en clasificación de texto; una contracción como "it's" puede expandirse a "it is" si la tarea lo requiere.

### Palabras fuera de vocabulario y tokenización por subpalabras

Con un vocabulario cerrado, cualquier palabra no vista en el entrenamiento es un token **fuera de vocabulario (OOV)**. La **tokenización por subpalabras**, con algoritmos como *Byte Pair Encoding* (BPE) o WordPiece, mitiga este problema: en vez de asignar un token a la palabra completa, la divide en fragmentos más frecuentes y conocidos (por ejemplo, "correremos" → ["corr", "eremos"]), de modo que incluso palabras raras se puedan representar combinando piezas ya presentes en el vocabulario. Esta es la aproximación que usan los modelos basados en transformers (ver [[dl-para-nlp|tokenización en transformers]]).

### Lematización y stemming: reducir a una forma base

Una misma palabra puede aparecer en muchas formas gramaticales ("correr", "corriendo", "corrió", "corro"), y tratarlas como tokens distintos dispersa la información. Dos técnicas atacan este problema. El **stemming** corta sufijos siguiendo reglas heurísticas simples, sin garantía de que el resultado sea una palabra real: es rápido, pero puede producir raíces sin sentido, como reducir "correremos" a "correrem". La **lematización**, en cambio, usa información gramatical (qué categoría de palabra es, su contexto) para obtener el **lema**, que sí es una palabra válida del idioma: "corriendo" y "corrió" se lematizan correctamente como "correr". Esta diferencia importa porque el mismo lema puede depender de la categoría gramatical: en inglés, "better" se lematiza como "good" si es adjetivo, pero como "better" si es verbo.

En la práctica, herramientas como NLTK ofrecen tokenización (`word_tokenize`, `sent_tokenize`) y *stemmers* clásicos (PorterStemmer, SnowballStemmer) además de un lematizador basado en WordNet; spaCy integra tokenización y lematización en el mismo procesamiento del texto (`token.lemma_`), pero no incluye *stemming*, precisamente porque prioriza resultados lingüísticamente válidos.

## Formalización

La tokenización no tiene una fórmula matemática única: es un algoritmo de segmentación de cadenas que depende del idioma y de la granularidad elegida. Sí se puede formalizar la diferencia entre las dos técnicas de reducción a forma base como dos funciones distintas sobre una palabra $w$:

$$
\text{stem}(w) \qquad \text{lema}(w, \text{cat})
$$

donde:
- $w$: palabra de entrada (una cadena de texto).
- $\text{stem}(w)$: función de *stemming*; depende solo de $w$ y de reglas heurísticas de sufijos, sin garantizar que el resultado sea una palabra válida.
- $\text{cat}$: categoría gramatical de $w$ en su contexto (verbo, sustantivo, adjetivo...).
- $\text{lema}(w, \text{cat})$: función de lematización; depende de $w$ **y** de $\text{cat}$, y siempre devuelve una palabra válida del idioma.

## Interactivo

```widget
motor: texto
modo: tokenizacion
textos: ["Corriendo y corrió, corro cada día.", "criptomonedas descentralizadas"]
pasos: ["stemming"]
```

Prueba a comparar, sobre "corriendo", "corrió" y "corro", el token que muestra el paso "stemming" frente al lema por defecto: ¿en qué caso el resultado deja de ser una palabra real?

Prueba a escribir una palabra poco frecuente, como "criptomonedas", y observa cómo la tokenización por subpalabras la divide en fragmentos más comunes en vez de marcarla como desconocida.

## En código

```python
texto = "corriendo corrió corro"
tokens = texto.split()  # tokenización simple por espacios

def stem_ingenuo(palabra):
    for sufijo in ("iendo", "ió", "o"):
        if palabra.endswith(sufijo):
            return palabra[: -len(sufijo)]
    return palabra

lemas = {"corriendo": "correr", "corrió": "correr", "corro": "correr"}

print([stem_ingenuo(t) for t in tokens])  # ['corr', 'corr', 'corr']
print([lemas[t] for t in tokens])         # ['correr', 'correr', 'correr']
```

## Errores típicos

- **Error**: usar siempre tokenización por palabras completas, sin considerar subpalabras → **Correcto**: con vocabularios cerrados y palabras raras o desconocidas, la tokenización por subpalabras (BPE, WordPiece) evita el problema de tokens fuera de vocabulario.
- **Error**: pensar que stemming y lematización dan siempre el mismo resultado → **Correcto**: el stemming puede producir raíces que no son palabras reales ("correrem"); la lematización siempre devuelve una forma válida del idioma.
- **Error**: lematizar sin tener en cuenta la categoría gramatical de la palabra → **Correcto**: el lema puede depender del contexto ("better" → "good" si es adjetivo, "better" si es verbo); ignorar la categoría lleva a lemas incorrectos.
- **Error**: aplicar la misma tokenización por espacios a cualquier idioma → **Correcto**: en idiomas sin separación clara entre palabras, como el chino o el japonés, la tokenización por espacios no funciona y hacen falta modelos específicos.

## En resumen

- La tokenización corta el texto en unidades (tokens): palabras, subpalabras, caracteres u oraciones, según la tarea.
- La tokenización por subpalabras (BPE, WordPiece) resuelve el problema de las palabras fuera de vocabulario (OOV) dividiendo palabras raras en fragmentos conocidos.
- El stemming corta sufijos con reglas heurísticas y es rápido pero impreciso; la lematización usa contexto gramatical y siempre da una palabra real.
- Fórmula/regla clave: $\text{lema}(w,\text{cat})$ depende de la categoría gramatical de $w$; $\text{stem}(w)$ no.
- Usa stemming cuando prime la velocidad y no importe tanto la precisión; usa lematización cuando el significado exacto sea crítico.
- Decisión que importa: la granularidad de la tokenización (palabra/subpalabra/carácter) y la biblioteca (NLTK vs. spaCy, según necesites *stemming* o integración lingüística).
- Trampa principal: tratar "reducir palabras a su base" como una única técnica, cuando stemming y lematización tienen objetivos y garantías distintas.

## A fondo

El **etiquetado de partes del discurso (*Part-of-Speech*, POS)** asigna a cada palabra una categoría gramatical (sustantivo, verbo, adjetivo...) según su función en la frase. Es lo que permite a la lematización elegir el lema correcto: en "me gusta correr", "correr" se etiqueta como verbo, mientras que en "el correr de los años" se etiqueta como sustantivo, y el lema resultante puede cambiar en consecuencia. Bibliotecas como spaCy y NLTK combinan reglas lingüísticas con modelos estadísticos o de aprendizaje profundo para predecir la categoría gramatical a partir del contexto, los sufijos y prefijos, y datos previamente etiquetados.

## Autoevaluación

### Un modelo con vocabulario cerrado se encuentra la palabra "criptomonedas", que no vio en el entrenamiento. ¿Qué enfoque de tokenización mitiga mejor este problema?
- [ ] Tokenización por oraciones completas
- [x] Tokenización por subpalabras (BPE o WordPiece)
- [ ] Tokenización exclusivamente por caracteres individuales
> Por qué: la tokenización por subpalabras descompone palabras raras en fragmentos ya presentes en el vocabulario, evitando tratar toda la palabra como un token desconocido (OOV).

### Aplicas stemming a la palabra "felizmente" y obtienes "feliz". Aplicas lematización a "mejor" (adjetivo) y obtienes "bueno". ¿Qué diferencia clave ilustra este contraste?
- [ ] Que el stemming siempre es más lento que la lematización
- [ ] Que ambas técnicas requieren conocer la categoría gramatical
- [x] Que la lematización puede cambiar completamente la forma de la palabra apoyándose en el contexto gramatical, mientras el stemming solo recorta sufijos
> Por qué: el stemming aplica reglas de recorte sobre la propia palabra ("felizmente" → "feliz" por sufijo), mientras que la lematización de "mejor" a "bueno" exige saber que es un adjetivo, algo que el stemming nunca considera.

### ¿Por qué NLTK incluye herramientas de *stemming* además de lematización, mientras que spaCy solo ofrece lematización?
- [ ] Porque NLTK no puede realizar lematización en ningún idioma
- [x] Porque NLTK prioriza la flexibilidad y la exploración, mientras spaCy prioriza resultados lingüísticamente precisos
- [ ] Porque el stemming y la lematización son técnicas idénticas y da igual cuál se implemente
> Por qué: spaCy está orientado a soluciones robustas y precisas, por lo que evita el stemming (que puede producir raíces inválidas); NLTK, más académica y modular, ofrece ambas opciones para experimentar.

## Glosario

- **token**: unidad mínima en la que se divide un texto tras la tokenización (palabra, subpalabra, carácter u oración).
- **fuera de vocabulario (OOV)**: token no presente en el vocabulario que el modelo conoce.
- **stemming**: técnica que recorta sufijos de una palabra mediante reglas heurísticas para obtener una raíz, no siempre válida como palabra real.
- **lematización**: técnica que reduce una palabra a su forma base o lema, válida en el idioma, usando su categoría gramatical y contexto.
- **POS (*Part-of-Speech*)**: categoría gramatical de una palabra (verbo, sustantivo, adjetivo...) según su función en la frase.
