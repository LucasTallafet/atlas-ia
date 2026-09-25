---
id: word-embeddings
estado: borrador
---

## En una frase

Un embedding de palabras es un vector denso de pocas dimensiones, aprendido del contexto en que se usa cada palabra, que coloca cerca en el espacio a los términos con significados parecidos.

## Intuición

Imagina un mapa donde cada palabra ocupa un punto, no al azar, sino según las palabras con las que suele aparecer. "Perro" y "gato" caen cerca uno del otro porque comparten vecindario: ambos rodeados de "mascota", "comida", "collar". "Automóvil" y "edificio" caen lejos de ambos, en otra zona del mapa. Ese mapa es lo que construye un **embedding**: una representación numérica donde la *distancia* entre dos puntos refleja cuánto se parecen sus significados.

La idea detrás de este mapa es la **hipótesis distributiva del lenguaje**: palabras que aparecen en contextos similares tienden a tener significados similares. No hace falta decirle al modelo que "perro" y "gato" son animales domésticos; basta con que el modelo observe millones de frases y note que ambas palabras suelen rodearse de las mismas compañeras.

Ya conoces una forma de convertir texto en números: [[bow-tfidf|BoW y TF-IDF]]. Esas técnicas cuentan palabras, pero tratan cada término como una casilla aislada de un vector larguísimo, sin relación con las demás. Los embeddings resuelven justo esa carencia: en vez de un vector disperso de miles de posiciones (una por palabra del vocabulario), cada palabra pasa a tener un vector **denso** de apenas 50 a 300 números, y esos números capturan relaciones de significado que BoW y TF-IDF no podían representar. Esta idea es la base de casi todo lo que hace un modelo de lenguaje moderno con el texto, desde clasificarlo hasta traducirlo.

## Explicación

### De vectores dispersos a vectores densos

[[bow-tfidf|BoW y TF-IDF]] representan un documento como un vector con una posición por cada palabra del vocabulario: si el vocabulario tiene 20.000 términos, cada documento es un vector de 20.000 componentes, casi todas a cero. Esa representación es **dispersa** (*sparse*) y tiene dos problemas de fondo. Primero, su tamaño crece con el vocabulario, lo que dispara el coste de memoria y cómputo. Segundo, y más importante, no dice nada sobre el significado: "perro" y "gato" ocupan posiciones distintas del vector tan alejadas entre sí como "perro" y "silla", aunque conceptualmente el primer par tenga mucho más en común.

Un **embedding** ataca ambos problemas a la vez. En vez de una posición por palabra, cada palabra $w$ del vocabulario se representa mediante una función que la transforma en un vector de pocas dimensiones:

$$
w \rightarrow \mathbf{v}_w \in \mathbb{R}^d
$$

con $d$ mucho menor que el tamaño del vocabulario, típicamente entre 50 y 300. Cada una de esas $d$ componentes no tiene un significado individual interpretable (no hay una dimensión "es un animal"), pero el conjunto de las $d$ componentes sí codifica, de forma distribuida, información semántica y sintáctica aprendida del contexto en el que aparece la palabra. A esto se le llama **representación distribuida**: el significado no vive en una sola posición del vector, sino repartido entre todas.

El objetivo de entrenar un embedding es siempre el mismo, independientemente del método: encontrar vectores $\mathbf{v}_w$ tales que las palabras que aparecen en contextos parecidos queden cerca en el espacio $\mathbb{R}^d$. "Perro" y "gato" comparten vecindario textual ("mascota", "come", "ladra"/"maúlla"), así que sus vectores terminan próximos; "perro" y "avión" casi nunca comparten contexto, así que sus vectores quedan lejos.

### El espacio vectorial de los embeddings: más que solo cercanía

Lo sorprendente de un buen embedding no es solo que agrupe palabras parecidas, sino que las **direcciones** del espacio también tienen significado. Palabras relacionadas por género, tiempo verbal o jerarquía tienden a separarse por desplazamientos parecidos, de forma que operaciones aritméticas simples sobre los vectores producen resultados coherentes con el significado:

$$
\text{rey} - \text{hombre} + \text{mujer} \approx \text{reina}
$$

La lectura es la siguiente: el vector que va de "hombre" a "rey" (la dirección de "convertirse en monarca") es aproximadamente el mismo que el que va de "mujer" a "reina". Si se le resta a "rey" ese componente de "hombre" y se le suma el de "mujer", el resultado cae cerca del vector de "reina". Lo mismo ocurre con relaciones geográficas: la relación entre "parís" y "francia" es similar, geométricamente, a la relación entre "madrid" y "españa".

Esta capacidad de capturar relaciones tanto **semánticas** (sinónimos, campos temáticos: "fútbol" cerca de "balón" y "goles", lejos de "astronomía") como **sintácticas** (funciones gramaticales, flexión: singular/plural, presente/pasado) es lo que distingue a un embedding de cualquier codificación anterior, y es la base de tareas como resolver analogías, agrupar términos relacionados o detectar sinónimos sin necesidad de un diccionario.

Prueba estas relaciones en el interactivo de esta ficha antes de seguir: verás cómo la suma y resta de vectores conecta con lo que ya sabes de [[espacio-vectorial|espacios vectoriales]].

### Word2Vec: aprender el vector prediciendo el contexto

**Word2Vec**, publicado por Google en 2013, fue el primer método que popularizó los embeddings densos aprendidos automáticamente. Su idea es entrenar una red neuronal simple para resolver una tarea de predicción relacionada con el contexto, y quedarse con los pesos internos de esa red como los vectores de palabra. Propone dos variantes, con el objetivo formalizado en la siguiente sección:

- **CBOW** (*Continuous Bag of Words*): dada una ventana de palabras de contexto alrededor de una posición, predice la palabra que falta en el centro. En "El perro ___ la pelota", usa "El", "perro", "la", "pelota" para predecir "persigue".
- **Skip-gram**: funciona al revés. Dada una palabra central, predice las palabras de su contexto. Dado "persigue", intenta predecir "El", "perro", "la" y "pelota".

Ambos enfoques comparten la misma hipótesis distributiva, pero se comportan de forma distinta según el tipo de corpus. CBOW promedia varias palabras de contexto para hacer una única predicción, lo que suaviza el aprendizaje y lo hace más rápido y eficiente en corpus grandes con palabras frecuentes. Skip-gram, al aprender directamente de cada palabra objetivo por separado, captura mejor los matices de términos poco frecuentes, a costa de un entrenamiento más lento.

| Criterio | CBOW | Skip-gram |
|---|---|---|
| Tamaño de corpus | Eficiente en corpus grandes | Mejor en corpus pequeños |
| Palabras frecuentes vs. raras | Mejor con palabras frecuentes | Mejor con palabras raras |
| Velocidad de entrenamiento | Más rápido | Más lento |
| Caso típico | Clasificación general, corpus grandes (noticias) | Dominios especializados (médico, jurídico), redes sociales |

### GloVe: coocurrencia global en vez de predicción local

**GloVe** (*Global Vectors for Word Representation*), publicado por Stanford en 2014, parte de una idea distinta a la de Word2Vec. En vez de entrenar una red para predecir palabras a partir de ventanas de contexto locales, GloVe construye primero una **matriz de coocurrencia** que cuenta, para todo el corpus, cuántas veces aparece cada palabra junto a cada otra. Después factoriza esa matriz para obtener vectores tales que el producto escalar entre dos vectores se aproxime al logaritmo de su frecuencia de coocurrencia (el desarrollo completo está en Formalización).

Esta diferencia de enfoque tiene consecuencias prácticas. Al usar estadísticas agregadas de todo el corpus en lugar de ventanas locales, GloVe tiende a producir una geometría más estable y a capturar mejor relaciones globales entre palabras que no comparten oración pero sí un uso similar a lo largo del texto. A cambio, construir y almacenar la matriz de coocurrencia es costoso en memoria para vocabularios grandes, y su entrenamiento suele ser más lento que el de Word2Vec.

### FastText: bajar al nivel de las subpalabras

**FastText**, publicado por Facebook AI Research en 2016, parte de Word2Vec (reutiliza CBOW y Skip-gram) pero cambia la unidad mínima de representación: en lugar de tratar cada palabra como un bloque indivisible, la descompone en **n-gramas de caracteres**. La palabra "correr", con n-gramas de tamaño 3, se descompone en `<co`, `cor`, `orr`, `rre`, `rer`, `er>` (los símbolos `<` y `>` marcan inicio y fin de palabra). El vector final de la palabra es la suma de los vectores de sus n-gramas (fórmula en Formalización).

Esta granularidad resuelve el problema más molesto de Word2Vec y GloVe: ambos son incapaces de representar una palabra que no vieron durante el entrenamiento, un token [[tokenizacion|fuera de vocabulario (OOV)]]. Si FastText nunca vio "hiperconectividad" pero sí aprendió los n-gramas "hiper", "conect" y "dad" a partir de otras palabras, puede construir un vector aproximado para el término nuevo combinando esos fragmentos. Por el mismo motivo, FastText es más robusto ante errores tipográficos ("gratsi" comparte casi todos sus n-gramas con "gratis") y funciona mejor en idiomas morfológicamente ricos como el español, donde una misma raíz genera muchas formas ("amigo", "amiga", "amigos", "amigas"). El coste es mayor consumo de memoria y tiempo de entrenamiento, ya que hay que aprender y almacenar un vector por cada n-grama, no solo por cada palabra completa.

### Comparativa y elección del modelo

Los tres métodos persiguen el mismo objetivo —palabras con significados parecidos, vectores cercanos— pero difieren en cómo llegan ahí y en qué se les da mejor:

| Aspecto | Word2Vec | GloVe | FastText |
|---|---|---|---|
| Método de aprendizaje | Predicción local (red neuronal, CBOW/Skip-gram) | Factorización de una matriz de coocurrencia global | Predicción local sobre n-gramas de caracteres |
| Unidad representada | Palabra completa | Palabra completa | Subpalabras (n-gramas) |
| Maneja palabras OOV | No | No | Sí, combinando n-gramas conocidos |
| Coste computacional | Moderado | Alto (memoria de la matriz) | Alto (vectores por n-grama) |
| Mejor caso de uso | Corpus grandes o pequeños según CBOW/Skip-gram | Comprensión global del corpus, búsqueda de información | Idiomas morfológicamente ricos, texto con errores o jerga |

En la práctica, la elección depende del corpus disponible, de si el dominio tiene mucho vocabulario especializado o cambiante (donde FastText compensa su coste extra) y de si se necesita una visión más local (Word2Vec) o más global (GloVe) del corpus. Estos tres métodos sirven después como punto de partida para tareas más avanzadas: los modelos de lenguaje actuales ([[modelos-lenguaje]]), los mecanismos de [[atencion|atención]] y el aprendizaje profundo aplicado a NLP ([[dl-para-nlp]]) construyen sobre esta misma idea de representación distribuida, aunque con arquitecturas mucho más complejas.

## Formalización

**Embedding.** Cada palabra $w$ de un vocabulario se transforma en un vector denso mediante una función aprendida:

$$
w \rightarrow \mathbf{v}_w \in \mathbb{R}^d
$$

donde:
- $w$: palabra del vocabulario.
- $\mathbf{v}_w$: vector denso (embedding) asociado a $w$.
- $d$: dimensión del embedding, con $d$ mucho menor que el tamaño del vocabulario $|V|$ (típicamente $d\in[50,300]$).

**CBOW.** Dado un texto de $T$ palabras, predice cada palabra $w_t$ a partir de una ventana de contexto de tamaño $c$ a cada lado:

$$
\max \sum_{t=1}^{T} \log P(w_t \mid w_{t-c}, \dots, w_{t-1}, w_{t+1}, \dots, w_{t+c})
$$

donde:
- $w_t$: palabra objetivo en la posición $t$.
- $w_{t-c}, \dots, w_{t+c}$: palabras de contexto dentro de la ventana, excluyendo $w_t$.
- $P(w_t \mid \cdot)$: probabilidad de que $w_t$ sea la palabra objetivo dado su contexto, calculada por la red.

**Skip-gram.** Invierte la predicción: dada la palabra $w_t$, predice cada palabra de su contexto:

$$
\max \sum_{t=1}^{T} \sum_{-c \leq j \leq c,\, j \neq 0} \log P(w_{t+j} \mid w_t)
$$

donde:
- $j$: desplazamiento dentro de la ventana respecto a la posición $t$.
- $P(w_{t+j} \mid w_t)$: probabilidad de que $w_{t+j}$ aparezca en el contexto dado $w_t$.

**GloVe.** Sea $X_{ij}$ el número de veces que la palabra $w_j$ aparece en el contexto de $w_i$ en todo el corpus. GloVe busca vectores $\mathbf{v}_i$ tales que $\mathbf{v}_i^T\mathbf{v}_j \approx \log(X_{ij})$, minimizando:

$$
J = \sum_{i,j=1}^{V} f(X_{ij})\left(\mathbf{v}_i^T\mathbf{v}_j + b_i + b_j - \log(X_{ij})\right)^2
$$

donde:
- $X_{ij}$: frecuencia de coocurrencia entre las palabras $i$ y $j$ en el corpus.
- $\mathbf{v}_i$, $\mathbf{v}_j$: vectores de las palabras $i$ y $j$.
- $b_i$, $b_j$: sesgos (*bias*) asociados a cada palabra.
- $f(X_{ij})$: función de ponderación que reduce la influencia de coocurrencias muy frecuentes o muy raras.
- $V$: tamaño del vocabulario.

**FastText.** Si la palabra $w$ se descompone en los n-gramas de caracteres $g_1, \dots, g_n$, su embedding es la suma de los vectores de sus n-gramas:

$$
\mathbf{v}_w = \sum_{i=1}^{n} \mathbf{v}_{g_i}
$$

donde:
- $g_1, \dots, g_n$: n-gramas de caracteres que componen la palabra $w$ (incluidos los marcadores de inicio/fin).
- $\mathbf{v}_{g_i}$: vector aprendido para el n-grama $g_i$.

**Ejemplo numérico** (verificado con `numpy`). En un espacio de juguete de $d=2$, donde el primer eje codifica "género" y el segundo "realeza":

$$
\text{hombre}=(-0{,}5,\ 0), \quad \text{mujer}=(0{,}5,\ 0), \quad \text{rey}=(-0{,}5,\ 1), \quad \text{reina}=(0{,}5,\ 1)
$$

$$
\text{rey} - \text{hombre} + \text{mujer} = (0{,}5,\ 1) = \text{reina}
$$

La distancia euclídea entre el resultado y "reina" es exactamente 0: en este espacio simplificado, la dirección "de hombre a rey" y la dirección "de mujer a reina" son idénticas. Con tres vectores más en otra zona del espacio, $\text{perro}=(-0{,}5,-0{,}8)$, $\text{gato}=(-0{,}4,-0{,}75)$ y $\text{automóvil}=(0{,}9,-0{,}9)$, la distancia euclídea entre "perro" y "gato" es $\approx0{,}112$, frente a $\approx1{,}404$ entre "perro" y "automóvil": los vectores cercanos en significado quedan cercanos en el espacio, y los lejanos, lejos.

## Interactivo

```widget
motor: vectores2d
modo: "etiquetas"
puntos: [{"etiqueta": "hombre", "xy": [-0.5, 0]}, {"etiqueta": "mujer", "xy": [0.5, 0]}, {"etiqueta": "rey", "xy": [-0.5, 1]}, {"etiqueta": "reina", "xy": [0.5, 1]}, {"etiqueta": "perro", "xy": [-0.5, -0.8]}, {"etiqueta": "gato", "xy": [-0.4, -0.75]}, {"etiqueta": "automóvil", "xy": [0.9, -0.9]}]
analogias: [["rey", "hombre", "mujer", "reina"]]
mostrar: ["suma", "resta", "coseno", "euclidea"]
```

- Prueba a calcular "rey − hombre + mujer" y comprueba que el resultado cae exactamente sobre "reina".
- Prueba a comparar la distancia euclídea entre "perro" y "gato" frente a la de "perro" y "automóvil": ¿cuál es menor y qué dice eso del significado de cada palabra?
- Prueba a mover "gato" más cerca de "automóvil": ¿qué le pasaría a la similitud del coseno entre ambos, y tendría sentido semántico ese cambio?

## En código

```python
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

vectores = {
    "hombre": [-0.5, 0.0], "mujer": [0.5, 0.0],
    "rey": [-0.5, 1.0], "reina": [0.5, 1.0],
    "perro": [-0.5, -0.8], "gato": [-0.4, -0.75], "automovil": [0.9, -0.9],
}

# Distancia y similitud entre "perro" y sus dos candidatos
sim_perro_gato = cosine_similarity([vectores["perro"]], [vectores["gato"]])[0][0]
sim_perro_auto = cosine_similarity([vectores["perro"]], [vectores["automovil"]])[0][0]
print(f"Similitud perro-gato: {sim_perro_gato:.3f}")       # 0.998
print(f"Similitud perro-automovil: {sim_perro_auto:.3f}")  # 0.225
```

```python
import numpy as np

vectores = {
    "hombre": [-0.5, 0.0], "mujer": [0.5, 0.0],
    "rey": [-0.5, 1.0], "reina": [0.5, 1.0],
    "perro": [-0.5, -0.8], "gato": [-0.4, -0.75], "automovil": [0.9, -0.9],
}

# Resolver la analogía rey - hombre + mujer buscando el candidato más cercano
objetivo = np.array(vectores["rey"]) - np.array(vectores["hombre"]) + np.array(vectores["mujer"])
candidatos = ["reina", "perro", "gato", "automovil"]
distancias = {c: np.linalg.norm(objetivo - np.array(vectores[c])) for c in candidatos}
print(min(distancias, key=distancias.get))  # reina
```

## Errores típicos

- **Error**: pensar que cada dimensión de un embedding tiene un significado propio, como "esta componente mide si es un animal" → **Correcto**: el significado está distribuido entre todas las dimensiones a la vez; ninguna componente aislada es interpretable por separado.
- **Error**: creer que Word2Vec, GloVe y FastText producen resultados intercambiables porque "todos son embeddings" → **Correcto**: difieren en cómo aprenden (predicción local vs. coocurrencia global vs. subpalabras) y en qué se les da mejor, como maneja cada uno las palabras [[tokenizacion|fuera de vocabulario (OOV)]].
- **Error**: asumir que un embedding entrenado en un corpus (por ejemplo, noticias deportivas) generaliza igual de bien a cualquier dominio (textos médicos o legales) → **Correcto**: los embeddings heredan el vocabulario y los sesgos del corpus de entrenamiento; un dominio distinto al de entrenamiento puede dar representaciones pobres o directamente palabras sin vector.
- **Error**: confundir la analogía "rey − hombre + mujer ≈ reina" con una prueba de que el modelo "entiende" el lenguaje → **Correcto**: es una consecuencia geométrica de cómo se distribuyen los vectores tras el entrenamiento, útil para evaluar la calidad del embedding, pero no evidencia de comprensión semántica real.

## En resumen

- Un embedding representa cada palabra como un vector denso de pocas dimensiones ($d\approx50$-$300$), en contraste con los vectores dispersos de [[bow-tfidf|BoW/TF-IDF]].
- Se entrena aprovechando la hipótesis distributiva: palabras en contextos parecidos terminan con vectores cercanos.
- Word2Vec predice palabra↔contexto con una red neuronal (CBOW: contexto→palabra; Skip-gram: palabra→contexto); GloVe factoriza una matriz de coocurrencia global; FastText suma vectores de n-gramas de caracteres.
- Fórmula clave: $w \rightarrow \mathbf{v}_w \in \mathbb{R}^d$, con la propiedad de que operaciones vectoriales simples (suma, resta) capturan relaciones de significado, como $\text{rey}-\text{hombre}+\text{mujer}\approx\text{reina}$.
- Usa FastText cuando haya palabras raras, errores tipográficos o morfología rica; usa GloVe cuando importe más la estructura global del corpus; usa Word2Vec como base sencilla y rápida.
- Decisiones que importan: dimensión del vector, tamaño de la ventana de contexto y, en Word2Vec/FastText, CBOW frente a Skip-gram.
- Trampa principal: solo Word2Vec y GloVe no pueden representar palabras nunca vistas en el entrenamiento; FastText sí, porque trabaja a nivel de subpalabra.

## A fondo

**Origen y cronología.** Word2Vec lo propuso Tomás Mikolov junto a su equipo en Google en 2013, marcando el inicio de los embeddings densos aprendidos automáticamente a gran escala. Un año después, en 2014, Jeffrey Pennington, Richard Socher y Christopher Manning, de Stanford, presentaron GloVe con un enfoque basado en estadísticas globales de coocurrencia. En 2016, Facebook AI Research (Armand Joulin, Edouard Grave, Piotr Bojanowski y de nuevo Mikolov) publicó FastText, extendiendo Word2Vec con subpalabras para resolver el problema de las palabras fuera de vocabulario.

**Entrenar de forma escalable: negative sampling y softmax jerárquico.** Calcular la probabilidad de una palabra sobre todo el vocabulario en cada paso de entrenamiento es costoso cuando el vocabulario tiene cientos de miles de términos. Word2Vec resuelve esto con dos técnicas. El *negative sampling* actualiza en cada paso solo la palabra objetivo y un pequeño grupo de palabras "negativas" escogidas al azar, en vez de recalcular la probabilidad sobre todo el vocabulario. El *softmax jerárquico* organiza el vocabulario en un árbol binario y convierte el cálculo de una probabilidad en una serie de decisiones binarias a lo largo del árbol, lo que reduce el coste de $O(|V|)$ a $O(\log|V|)$. Ambas técnicas permiten entrenar embeddings sobre corpus de millones de palabras sin coste prohibitivo.

**Hiperparámetros que importan en la práctica.** El tamaño de la ventana de contexto controla si el embedding capta relaciones más locales y sintácticas (ventanas pequeñas) o más amplias y temáticas (ventanas grandes). La dimensión $d$ del vector es un compromiso: pocas dimensiones pierden información, demasiadas aumentan el coste computacional y el riesgo de sobreajuste sin aportar precisión adicional. El tamaño y la calidad del corpus de entrenamiento condicionan todo lo demás: un corpus pequeño o poco diverso produce embeddings pobres o sesgados.

**Sesgo en los embeddings preentrenados.** Como el embedding aprende directamente de un corpus real, hereda los sesgos presentes en ese texto —de género, raciales o culturales—, lo que puede ser especialmente problemático en aplicaciones sensibles como la contratación automatizada o la moderación de contenido. Mitigarlo requiere revisar y filtrar el corpus de entrenamiento, o aplicar ajuste fino (*fine-tuning*) orientado a corregir esas asociaciones.

**Embeddings preentrenados en una capa de red neuronal.** En arquitecturas de aprendizaje profundo, la capa de embedding de un modelo puede entrenarse desde cero junto con el resto de la red, o inicializarse con vectores ya preentrenados (Word2Vec, GloVe, FastText) y usarse **congelada** (`trainable=False`, los vectores no cambian) o con **ajuste fino** (`trainable=True`, los vectores se refinan durante el entrenamiento). La primera opción tiene sentido con datasets pequeños o vocabulario muy específico; la segunda, con datasets grandes que pueden permitirse adaptar los vectores a la tarea. Este mismo componente reaparece, mucho más desarrollado, al tratar el aprendizaje profundo aplicado a NLP en [[dl-para-nlp]].

**Evaluar y visualizar embeddings.** Además de la [[producto-escalar-similitud|similitud del coseno]] entre pares de palabras y de resolver analogías como la de "rey/reina", una forma habitual de inspeccionar un embedding es reducir sus $d$ dimensiones a 2 o 3 con [[reduccion-dimensionalidad|PCA o t-SNE]] y representarlo en un gráfico: si palabras semánticamente relacionadas aparecen agrupadas visualmente, es una señal de que el embedding ha aprendido relaciones razonables. PCA conserva mejor la varianza global y es más barato; t-SNE prioriza las relaciones de vecindad local y suele producir agrupaciones más nítidas para inspección visual, a mayor coste computacional.

**Relación con el álgebra lineal.** Que las operaciones de suma y resta de vectores tengan sentido semántico no es casualidad: los embeddings son, ante todo, puntos de un [[espacio-vectorial|espacio vectorial]], y las mismas propiedades algebraicas que permiten sumar y escalar vectores en general son las que hacen posible interpretar geométricamente relaciones como "rey − hombre + mujer ≈ reina".

## Autoevaluación

### Un corpus de textos médicos contiene el término "hipertensión" muchas veces, pero nunca la variante "hipertensivo". Entrenas Word2Vec y FastText por separado con ese corpus. ¿Qué diferencia esperas al consultar el vector de "hipertensivo"?
- [ ] Ninguna: ambos métodos representan igual de bien las palabras no vistas
- [ ] Word2Vec podrá representarla porque aprende de contextos globales; FastText no
- [x] FastText podrá aproximar un vector combinando n-gramas compartidos con "hipertensión"; Word2Vec no tendrá vector para "hipertensivo"
> Por qué: Word2Vec asigna un vector por palabra completa vista en el entrenamiento; si "hipertensivo" nunca apareció, no tiene vector. FastText descompone en n-gramas de caracteres, así que puede aproximar un vector combinando fragmentos que sí aprendió, como "hiper" o "tensiv".

### En el espacio de juguete de esta ficha, hombre=(−0,5, 0), mujer=(0,5, 0), rey=(−0,5, 1). ¿Qué vector esperarías para "reina" si la relación de género se mantiene igual que entre "hombre" y "rey"?
- [ ] (−0,5, 1), el mismo que "rey"
- [x] (0,5, 1), sumando a "rey" el desplazamiento de "hombre" a "mujer"
- [ ] (0, 1), el punto medio entre "rey" y "mujer"
> Por qué: la relación de género se representa como el vector que va de "hombre" a "mujer", $(1, 0)$. Sumar ese desplazamiento a "rey" da $(-0{,}5+1,\ 1)=(0{,}5,\ 1)$, que es exactamente "reina" en este ejemplo.

### Quieres representar palabras de un corpus de reseñas de restaurantes en varios idiomas, con muchas erratas y jerga ("buenisimoo", "riquisimo!!"). ¿Qué modelo de los tres encaja mejor con ese problema?
- [ ] GloVe, porque su matriz de coocurrencia es global y detecta erratas automáticamente
- [ ] Word2Vec, porque es el método más rápido de entrenar
- [x] FastText, porque descompone las palabras en n-gramas y puede relacionar variantes con errores tipográficos con la forma correcta
> Por qué: FastText comparte n-gramas de caracteres entre "riquísimo" y "riquisimo!!" o "buenísimo" y "buenisimoo", lo que le permite generar representaciones parecidas para esas variantes. Word2Vec y GloVe tratarían cada variante como una palabra completamente distinta y sin relación.

### ¿Por qué GloVe suele requerir más memoria durante el entrenamiento que Word2Vec, aunque ambos produzcan vectores del mismo tamaño $d$?
- [ ] Porque GloVe usa un valor de $d$ mucho mayor por diseño
- [x] Porque GloVe construye y almacena una matriz de coocurrencia de todo el vocabulario antes de factorizarla
- [ ] Porque GloVe entrena varias redes neuronales en paralelo
> Por qué: GloVe necesita construir la matriz $X_{ij}$, con una entrada por cada par de palabras del vocabulario que coocurren, antes de poder optimizar la función de pérdida. Word2Vec, en cambio, procesa el corpus por ventanas de contexto sin necesitar esa matriz completa en memoria.

## Glosario

- **embedding**: vector denso de pocas dimensiones que representa una palabra (u otro elemento) capturando relaciones de significado aprendidas de su contexto de uso.
- **representación distribuida**: forma de codificar información en la que el significado se reparte entre todas las componentes de un vector, en vez de concentrarse en una sola posición.
- **hipótesis distributiva**: principio según el cual palabras que aparecen en contextos similares tienden a tener significados similares.
- **negative sampling**: técnica de entrenamiento que actualiza en cada paso solo la palabra objetivo y un pequeño grupo de palabras negativas aleatorias, en vez de todo el vocabulario.
- **softmax jerárquico**: técnica que organiza el vocabulario en un árbol binario para calcular probabilidades de palabras en $O(\log|V|)$ en vez de $O(|V|)$.
