---
id: nlp-intro
estado: borrador
---

## En una frase

El procesamiento del lenguaje natural (NLP) convierte texto en representaciones numéricas para que las máquinas puedan clasificarlo, traducirlo, resumirlo o generarlo.

## Intuición

Piensa en un supermercado que empieza a usar códigos de barras: en vez de que la caja registradora "lea" el nombre de cada producto, le basta con leer un número. Los modelos de aprendizaje automático funcionan igual con el lenguaje: no entienden palabras, solo números. Por eso, antes de que un modelo pueda analizar un texto, alguien tiene que decidir cómo convertir cada palabra en algo numérico.

La forma de hacer esa conversión importa mucho. Un código de barras simple te dice qué producto es, pero no si dos productos son parecidos: el código de "leche" y el de "yogur" no tienen ninguna relación entre sí, aunque ambos sean lácteos. Lo mismo pasa con las primeras técnicas de codificación de texto. Las más recientes, en cambio, sitúan los productos parecidos en estanterías cercanas: si buscas algo relacionado con "leche", el propio código te acerca a "yogur". Esa idea —que la propia representación numérica pueda reflejar el significado— es el hilo conductor de este campo, conocido como **procesamiento del lenguaje natural** (PLN o *NLP*, por sus siglas en inglés).

## Explicación

### El problema: las máquinas no entienden palabras

El NLP es el área de la inteligencia artificial que estudia cómo hacer que un ordenador comprenda, interprete o genere lenguaje humano. Para lograrlo combina lingüística, estadística y aprendizaje automático, y su primer obstáculo es siempre el mismo: un modelo solo procesa números, así que el texto debe representarse numéricamente antes de cualquier análisis. A este paso previo se le llama **codificación de textos**.

### De índices a embeddings

Las técnicas de codificación han evolucionado de menor a mayor capacidad para capturar significado.

La más simple es la **indexación**: cada palabra del **vocabulario** (el conjunto de palabras únicas de un **corpus**, es decir, de la colección de textos con la que se trabaja) recibe un número entero. Es rápida, pero dos palabras relacionadas como "gato" y "felino" reciben índices arbitrarios y sin ninguna conexión entre sí.

La **bolsa de palabras (*Bag of Words*, BoW)** da un paso más: representa cada texto como un vector con la frecuencia de cada palabra del vocabulario. Es fácil de calcular, pero ignora el orden: para BoW, "el perro ladra" y "ladra el perro" son el mismo vector.

**TF-IDF** (*Term Frequency-Inverse Document Frequency*) mejora BoW ponderando cada palabra: las muy frecuentes en todo el corpus (como "el" o "de") pesan poco, y las específicas de un documento concreto pesan más. Aun así, sigue sin captar relaciones de significado entre palabras, y sus vectores siguen siendo largos y con muchos ceros (**vectores dispersos**, *sparse*).

Los **word embeddings** resuelven ambas limitaciones: representan cada palabra como un vector denso de baja dimensión (entre 100 y 300 valores habitualmente, frente a los miles de un vocabulario BoW), donde la cercanía entre vectores refleja cercanía de significado. Esto es posible gracias a la **hipótesis distribucional**: palabras que aparecen en contextos parecidos tienden a significar cosas parecidas. Modelos como Word2Vec o GloVe aprenden estos vectores analizando qué palabras coexisten en las frases del corpus.

Antes de llegar a codificarse, el texto suele limpiarse y prepararse (ver [[limpieza-texto]]); ese paso previo no se trata aquí.

### Las tareas típicas del NLP

Una vez el texto está codificado, puede alimentar modelos entrenados para tareas concretas: clasificación de texto (asignar categorías, como detectar spam), análisis de sentimientos (positivo/negativo/neutro), etiquetado de secuencias o NER (identificar entidades como personas o lugares), traducción automática, resumen de texto, generación de texto (chatbots) y respuesta a preguntas (QA).

## Formalización

Para un corpus de $N$ documentos, el peso TF-IDF de un término $t$ en un documento $d$ es:

$$
\text{TF-IDF}(t,d) = \text{tf}(t,d)\cdot \log\!\left(\frac{N}{\text{df}(t)}\right)
$$

donde:
- $\text{tf}(t,d)$: frecuencia relativa del término $t$ en el documento $d$ (número de veces que aparece dividido entre el total de palabras de $d$).
- $\text{df}(t)$: número de documentos del corpus en los que aparece $t$ (*document frequency*).
- $N$: número total de documentos del corpus.

**Ejemplo numérico.** Corpus de $N=2$ documentos: $d_1=$ "el gato duerme", $d_2=$ "el perro ladra" (3 palabras cada uno). Para "gato": $\text{tf}=1/3$, $\text{df}=1$, así que $\text{TF-IDF}=\frac{1}{3}\cdot\log(2/1)\approx0{,}231$. Para "el": $\text{tf}=1/3$, $\text{df}=2$, así que $\text{TF-IDF}=\frac{1}{3}\cdot\log(2/2)=0$: al aparecer en todos los documentos, "el" queda sin peso.

## En código

```python
from collections import Counter
import math

corpus = ["el gato duerme", "el perro ladra"]
docs = [d.split() for d in corpus]
N = len(docs)

def tf_idf(termino, doc, docs):
    tf = doc.count(termino) / len(doc)
    df = sum(1 for d in docs if termino in d)
    return tf * math.log(N / df)

print(round(tf_idf("gato", docs[0], docs), 3))  # 0.231
print(round(tf_idf("el", docs[0], docs), 3))    # 0.0
```

## Errores típicos

- **Error**: pensar que la bolsa de palabras conserva el orden de las frases → **Correcto**: BoW solo cuenta frecuencias; "el perro ladra" y "ladra el perro" producen el mismo vector.
- **Error**: creer que TF-IDF capta relaciones de significado entre palabras → **Correcto**: TF-IDF solo pondera frecuencia y especificidad estadística; "gato" y "felino" siguen siendo dimensiones sin ninguna relación entre sí.
- **Error**: confundir corpus con vocabulario → **Correcto**: el corpus es la colección de textos de partida; el vocabulario es el conjunto de palabras únicas que se extrae de él.
- **Error**: suponer que un vector más largo siempre da más información → **Correcto**: los vectores dispersos de BoW/TF-IDF crecen con el vocabulario pero están llenos de ceros; los embeddings son más cortos y más informativos por dimensión.

## En resumen

- El NLP convierte lenguaje humano en representaciones numéricas para que un modelo pueda procesarlo.
- Las técnicas de codificación van de menor a mayor complejidad semántica: índices → bolsa de palabras (BoW) → TF-IDF → word embeddings.
- Fórmula clave: $\text{TF-IDF}(t,d)=\text{tf}(t,d)\cdot\log(N/\text{df}(t))$, penaliza palabras muy comunes en el corpus.
- Usa BoW/TF-IDF para tareas simples y explicables; usa embeddings cuando el significado y las relaciones entre palabras importan.
- La decisión clave es el tamaño del vocabulario y, en embeddings, la dimensión del vector (100-300 es habitual).
- Trampa principal: BoW y TF-IDF no entienden significado, solo cuentan y ponderan palabras.
- El NLP cubre tareas muy distintas: clasificación, sentimiento, NER, traducción, resumen, generación y QA.

## A fondo

Un **corpus** puede ser general (noticias, literatura, blogs), especializado (textos médicos o legales) o etiquetado (con partes del discurso, entidades o sentimiento ya anotados), según su propósito. El Corpus Brown (inglés, dividido por géneros) y la Wikipedia (usada para entrenar embeddings por su diversidad temática) son ejemplos clásicos.

Los word embeddings se generan con dos familias de métodos. Los **no basados en deep learning**, como GloVe, usan estadísticas globales de co-ocurrencia de palabras en el corpus. Los **basados en deep learning**, como Word2Vec (con sus variantes Skip-Gram y Continuous Bag of Words), entrenan una red neuronal simple cuyo único objetivo es ajustar los vectores para que reflejen relaciones semánticas, no resolver una tarea de clasificación. Estos modelos capturan relaciones sorprendentes mediante álgebra vectorial simple, como $\text{Rey}-\text{Hombre}+\text{Mujer}\approx\text{Reina}$.

Los avances más recientes son los **embeddings contextualizados** (ELMo, BERT, GPT), que ya no asignan un vector fijo a cada palabra, sino que lo ajustan según el contexto de la frase: "banco" tendría un vector distinto en "me senté en el banco" que en "fui al banco a abrir una cuenta".

## Autoevaluación

### ¿Por qué es necesario codificar un texto antes de dárselo a un modelo de aprendizaje automático?
- [ ] Porque los modelos solo aceptan archivos de texto plano
- [x] Porque los modelos solo pueden procesar números, no palabras directamente
- [ ] Porque codificar el texto lo traduce automáticamente a otro idioma
> Por qué: los algoritmos de aprendizaje automático operan sobre vectores numéricos; el texto debe transformarse en números antes de cualquier cálculo.

### Un corpus contiene las frases "el gato duerme" y "el perro ladra". ¿Qué vector BoW le corresponde a "el perro ladra" usando el vocabulario ["el","gato","duerme","perro","ladra"]?
- [ ] [1, 1, 1, 0, 0]
- [x] [1, 0, 0, 1, 1]
- [ ] [0, 1, 0, 1, 1]
> Por qué: BoW marca la presencia de cada palabra del vocabulario en el orden dado; "perro" y "ladra" aparecen, "gato" y "duerme" no.

### En un corpus, la palabra "el" aparece en todos los documentos y "innovación" solo en uno. Según TF-IDF, ¿qué palabra recibirá mayor peso?
- [ ] "el", por ser más frecuente
- [x] "innovación", por ser más específica de ese documento
- [ ] Ambas reciben el mismo peso porque TF-IDF no distingue frecuencia entre documentos
> Por qué: el factor $\log(N/\text{df}(t))$ castiga a las palabras que aparecen en muchos documentos; "el" tiende a 0 y "innovación" mantiene un peso alto.

### ¿Cuál es la principal ventaja de los word embeddings frente a BoW o TF-IDF?
- [ ] Que generan vectores más largos y con más ceros
- [ ] Que no necesitan un vocabulario previo
- [x] Que representan palabras con significados parecidos mediante vectores cercanos
> Por qué: los embeddings codifican relaciones semánticas aprendidas de los contextos (hipótesis distribucional); BoW y TF-IDF solo cuentan o ponderan apariciones, sin relacionar palabras entre sí.

## Glosario

- **PLN / NLP**: procesamiento del lenguaje natural; área de la IA que trata la interacción entre ordenadores y lenguaje humano.
- **corpus**: conjunto estructurado de textos usado para analizar, entrenar o evaluar modelos de lenguaje.
- **vocabulario**: conjunto de palabras únicas de un corpus, usado como base para representar el texto numéricamente.
- **bolsa de palabras (BoW)**: representación de un texto como vector de frecuencias de las palabras del vocabulario, sin orden.
- **TF-IDF**: ponderación de palabras que combina su frecuencia en un documento con su rareza en el corpus.
- **vector disperso (*sparse*)**: vector numérico con muchas posiciones en cero, típico de BoW y TF-IDF en vocabularios grandes.
- **word embedding**: representación densa de baja dimensión de una palabra que captura relaciones semánticas.
- **hipótesis distribucional**: principio según el cual palabras que aparecen en contextos similares tienden a tener significados relacionados.
