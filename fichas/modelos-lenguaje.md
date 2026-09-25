---
id: modelos-lenguaje
estado: borrador
---

## En una frase

Un modelo de lenguaje aprende cómo se distribuyen las probabilidades de las palabras de un idioma a partir de texto, y con eso puede representar texto como vectores o generar texto nuevo.

## Intuición

Piensa en el autocompletado del teclado de tu móvil: escribes "voy a la" y te sugiere "playa", "tienda" o "compra" porque ha visto miles de veces qué palabras suelen seguir a esa secuencia. Eso, en esencia, es un **modelo de lenguaje**: un sistema que ha aprendido, a partir de grandes cantidades de texto, qué tan probable es cada palabra dado lo que ya se ha dicho.

Pero no todos los modelos de lenguaje sirven para lo mismo. Imagina dos perfiles distintos: un **crítico literario**, que lee un texto y lo clasifica (¿es una crítica positiva o negativa?, ¿de qué tema trata?), y un **novelista**, que a partir de una idea escribe páginas nuevas. Ambos han leído muchísimo y han aprendido patrones del idioma, pero uno analiza y el otro produce. Esta distinción —representar frente a generar— es la que organiza casi todo lo que verás en el resto del bloque de modelos de lenguaje: desde [[bow-tfidf]] y [[word-embeddings]] (que representan) hasta los modelos que verás más adelante capaces de escribir texto de principio a fin.

Entender esta división importa porque orienta qué herramienta elegir: si necesitas buscar documentos parecidos o clasificar correos, quieres un modelo de representación; si necesitas que el sistema redacte una respuesta, un resumen o una traducción, necesitas uno generativo.

## Explicación

### Qué "sabe" realmente un modelo de lenguaje

Ya conoces los [[word-embeddings]]: vectores densos que colocan cerca palabras con significados parecidos. Un **modelo de lenguaje** va un paso más allá: no se limita a representar palabras sueltas, sino que aprende, a partir de un gran volumen de texto, **cómo se distribuyen las probabilidades de las palabras según su contexto**. Formalmente, es una representación matemática de un idioma, producto de entrenar un sistema sobre grandes cantidades de texto para captar sus patrones semánticos y sintácticos.

Con esa distribución de probabilidades, un modelo de lenguaje puede hacer cosas muy distintas entre sí: predecir la siguiente palabra de una frase, evaluar si una oración suena "natural" o representar palabras y documentos como vectores para tareas posteriores de clasificación o búsqueda.

### Dos familias: representar o generar

Los modelos de lenguaje se dividen en dos grandes categorías según qué hacen con esa distribución de probabilidades.

Los **modelos de representación** convierten el texto en vectores numéricos que capturan información semántica y sintáctica, pero no producen contenido nuevo: su salida es un vector, no una frase. TF-IDF, Word2Vec y BERT (usado como extractor de vectores) son ejemplos.

Los **modelos generativos**, en cambio, sí producen texto nuevo: predicen secuencias de palabras y las encadenan para generar contenido coherente a partir de una entrada inicial. Los modelos de n-gramas, GPT y T5 son ejemplos.

| Característica | Modelos de representación | Modelos generativos |
|---|---|---|
| Propósito | Representar significado en forma numérica | Generar nuevo contenido textual |
| Salida | Vector numérico | Texto generado |
| Aplicaciones típicas | Clasificación, clustering, búsqueda semántica | Chatbots, traducción, generación de contenido |
| Ejemplos | TF-IDF, Word2Vec, BERT | Modelos de n-gramas, GPT, T5 |

Ambos enfoques pueden combinarse: en un asistente virtual, un modelo de representación identifica la intención del usuario y un modelo generativo redacta la respuesta.

### El generador más simple: n-gramas

Antes de llegar a los grandes modelos generativos, conviene ver el caso más sencillo posible: un **modelo de n-gramas**. En vez de una red neuronal, cuenta directamente cuántas veces ha visto cada secuencia de $n$ palabras en el corpus, y usa esas frecuencias como probabilidades. No usa técnicas de aprendizaje automático como los modelos de representación más habituales; es pura estadística de conteo.

## Formalización

El objetivo de un modelo de lenguaje es asignar una probabilidad a una secuencia completa de palabras $w_1, w_2, \dots, w_n$. Por la regla de la cadena de probabilidad, esa probabilidad conjunta se descompone en un producto de probabilidades condicionales:

$$
P(w_1, w_2, \dots, w_n) = \prod_{t=1}^{n} P(w_t \mid w_1, \dots, w_{t-1})
$$

donde:
- $w_t$ es la palabra (token) en la posición $t$ de la secuencia.
- $n$ es la longitud de la secuencia.
- $P(w_t \mid w_1, \dots, w_{t-1})$ es la probabilidad de que aparezca $w_t$ dado todo lo dicho antes; es justo lo que el modelo aprende del corpus.

Calcular esa probabilidad condicionando en toda la historia previa es inviable con pocos datos, así que un **modelo de n-gramas** la aproxima mirando solo las $n-1$ palabras anteriores (supuesto de Markov de orden $n-1$):

$$
P(w_t \mid w_1, \dots, w_{t-1}) \approx \frac{\text{cuenta}(w_{t-n+1}, \dots, w_t)}{\text{cuenta}(w_{t-n+1}, \dots, w_{t-1})}
$$

donde:
- $\text{cuenta}(\cdot)$ es el número de veces que esa secuencia de palabras aparece en el corpus de entrenamiento.
- Para $n=2$ (bigramas), la fórmula se reduce a $P(w_t \mid w_{t-1}) = \text{cuenta}(w_{t-1}, w_t) / \text{cuenta}(w_{t-1})$.

**Ejemplo.** Con el corpus "el gato duerme", "el perro corre", "el gato corre" (verificado con `tools/calc.py`): "gato" aparece 2 veces, seguido una vez de "duerme" y una de "corre", así que $P(\text{corre}\mid\text{gato}) = P(\text{duerme}\mid\text{gato}) = 0{,}5$. "Perro" solo aparece una vez, siempre seguido de "corre", así que $P(\text{corre}\mid\text{perro}) = 1{,}0$: con un único dato, el modelo no tiene forma de repartir probabilidad entre varias continuaciones.

## Interactivo

```widget
motor: texto
modo: "ngramas"
textos: ["el gato duerme", "el perro corre", "el gato corre"]
n: 2
```

- Prueba a comparar la probabilidad que reparte el modelo tras "gato" frente a la que reparte tras "perro". ¿Por qué una está repartida al 50% y la otra no?
- Prueba a añadir la frase "el perro duerme" y observa cómo cambia la predicción tras "perro".
- Prueba a subir $n$ a 3 y comprueba qué pasa cuando ninguna secuencia de tres palabras del texto coincide con lo escrito.

## En código

```python
from collections import Counter

corpus = ["el gato duerme", "el perro corre", "el gato corre"]
bigramas, unigramas = Counter(), Counter()
for frase in corpus:
    palabras = frase.split()
    for i in range(len(palabras) - 1):
        bigramas[(palabras[i], palabras[i + 1])] += 1
        unigramas[palabras[i]] += 1
    unigramas[palabras[-1]] += 1

def p_siguiente(palabra):
    total = unigramas[palabra]
    return {sig: c / total for (w, sig), c in bigramas.items() if w == palabra}

print(p_siguiente("gato"))   # {'duerme': 0.5, 'corre': 0.5}
print(p_siguiente("perro"))  # {'corre': 1.0}
```

## Errores típicos

- **Error**: pensar que todo modelo de lenguaje genera texto → **Correcto**: TF-IDF, Word2Vec o BERT usado como extractor de vectores son modelos de lenguaje de representación; solo devuelven vectores, no frases nuevas.
- **Error**: creer que "modelo de lenguaje" significa necesariamente "modelo generativo grande" tipo GPT → **Correcto**: un modelo de bigramas entrenado con tres frases, como el del ejemplo, también es un modelo de lenguaje, solo que muy simple.
- **Error**: suponer que la probabilidad que asigna el modelo mide si una frase es cierta → **Correcto**: mide solo qué tan típica es esa secuencia de palabras según lo visto en el entrenamiento, no su veracidad.

## En resumen

- Un modelo de lenguaje aprende cómo se distribuyen las probabilidades de las palabras según su contexto, a partir de grandes volúmenes de texto.
- Se divide en dos familias: modelos de representación (convierten texto en vectores, no generan) y modelos generativos (predicen y producen texto nuevo).
- Fórmula clave: $P(w_1,\dots,w_n) = \prod_{t=1}^{n} P(w_t \mid w_1,\dots,w_{t-1})$; los n-gramas la aproximan mirando solo las $n-1$ palabras anteriores.
- Usa un modelo de representación para clasificar, buscar o agrupar texto; usa uno generativo para producir contenido nuevo.
- La decisión clave en un modelo de n-gramas es el orden $n$: cuanto mayor, más contexto captura, pero más combinaciones nunca vistas aparecerán.
- Trampa principal: con pocos datos, muchas secuencias de palabras válidas nunca aparecieron en el entrenamiento y reciben probabilidad cero.

## A fondo

El material de origen ilustra la utilidad práctica de esta distinción con dos ejemplos. En un sistema de detección de spam basado en bolsa de palabras, "oferta especial" y "oferta limitada" se tratan como independientes porque cada palabra se cuenta por separado; con un modelo de representación como Word2Vec, en cambio, el sistema reconoce que ambas frases están semánticamente relacionadas, lo que mejora la clasificación. En un sistema de recomendación de películas, un modelo de representación como Word2Vec puede analizar reseñas para encontrar títulos similares, mientras que un modelo generativo como GPT podría redactar automáticamente la sinopsis de una película a partir de sus características: la misma tarea de negocio, resuelta con dos tipos de modelo distintos según si hace falta comparar o producir.

## Autoevaluación

### Un sistema de detección de spam vectoriza cada correo con TF-IDF antes de clasificarlo. ¿Es un modelo de representación o generativo?
- [ ] Generativo, porque al final predice si el correo es spam.
- [x] De representación, porque convierte el texto en un vector numérico y no produce texto nuevo.
- [ ] Ninguno de los dos, porque TF-IDF no es un modelo de lenguaje.
> Por qué: TF-IDF transforma cada correo en un vector que alimenta un clasificador externo; el propio TF-IDF nunca genera texto, así que es de representación, aunque la tarea final sea una predicción.

### Con el corpus "el gato duerme", "el perro corre", "el gato corre", un modelo de bigramas da $P(\text{corre}\mid\text{perro})=1{,}0$ pero $P(\text{corre}\mid\text{gato})=0{,}5$. ¿Por qué son distintas?
- [ ] Porque "perro" es más frecuente que "gato" en el corpus.
- [x] Porque "perro" solo aparece seguido de "corre" en el corpus, mientras que "gato" aparece seguido de "duerme" y de "corre" a partes iguales.
- [ ] Porque el modelo de bigramas ignora el orden de las palabras.
> Por qué: la probabilidad de bigramas se calcula solo a partir de lo observado; con una única continuación vista, toda la probabilidad recae en ella, mientras "gato" la reparte entre las dos continuaciones que sí ha visto.

### ¿Cuál de estas afirmaciones sobre GPT es incorrecta?
- [ ] GPT es un modelo generativo.
- [x] GPT es un modelo de representación porque también se le pueden extraer vectores internos.
- [ ] GPT predice la siguiente palabra basándose en las anteriores.
> Por qué: que se puedan extraer representaciones internas de cualquier red no define su categoría; GPT se entrena y se usa para generar texto, así que es un modelo generativo.

### ¿Qué ocurre cuando un modelo de bigramas se encuentra una combinación de dos palabras que nunca vio en el entrenamiento?
- [x] Le asigna probabilidad cero, aunque la combinación sea perfectamente válida en el idioma.
- [ ] La ignora y continúa con la palabra más frecuente del corpus.
- [ ] Aumenta automáticamente $n$ para buscar una combinación más larga que sí haya visto.
- [ ] Reparte la probabilidad a partes iguales entre todas las palabras del vocabulario.
> Por qué: un modelo de n-gramas solo sabe contar lo que ha visto; sin técnicas adicionales de suavizado, cualquier combinación no vista recibe probabilidad 0, por válida que sea gramaticalmente.

## Glosario

- **modelo de lenguaje**: sistema que aprende la distribución de probabilidad de las palabras de un idioma a partir de grandes volúmenes de texto.
- **modelo de representación**: modelo de lenguaje que convierte texto en vectores numéricos sin generar contenido nuevo.
- **modelo generativo**: modelo de lenguaje que predice y produce secuencias de texto nuevas.
- **n-grama**: secuencia de $n$ palabras consecutivas que un modelo usa para aproximar la probabilidad de la siguiente palabra mirando solo las $n-1$ anteriores.
