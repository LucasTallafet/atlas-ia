---
id: bow-tfidf
estado: borrador
---

## En una frase

La bolsa de palabras (BoW) representa un texto como un vector de frecuencias de palabras, y TF-IDF ajusta esos pesos para resaltar lo que distingue a cada documento del resto del corpus.

## Intuición

Imagina que vacías todas las palabras de un documento dentro de una bolsa, sin importar el orden en que aparecían: solo cuentas cuántas veces cae cada una. Eso es, literalmente, una **bolsa de palabras** (*bag of words*, BoW). Es una forma rápida de convertir texto en números, pero tiene un defecto: para la bolsa, "el" pesa lo mismo que "inteligencia", aunque "el" no dice nada sobre el tema del documento y "inteligencia" sí.

**TF-IDF** corrige ese defecto con el criterio de un bibliotecario que cataloga libros. Una palabra que aparece en casi todos los libros de la biblioteca (como "el" o "de") no ayuda a diferenciar unos de otros, así que el bibliotecario la ignora. Una palabra que solo aparece en un puñado de libros (como "fotosíntesis") sí es una pista fuerte de qué trata ese libro en concreto, así que la marca como relevante. TF-IDF automatiza ese criterio: sube el peso de una palabra cuantas más veces aparece en un documento, y lo baja cuantos más documentos del corpus la contienen. Ambas técnicas son el primer paso, muy anterior a los [[word-embeddings|embeddings]], para que un ordenador pueda comparar, clasificar o buscar en texto.

## Explicación

### De las palabras sueltas a un vector: la indexación y sus límites

Una vez que un texto está [[tokenizacion|tokenizado]], el paso más directo para convertirlo en números es la **indexación de palabras**: se recorre el corpus, se recopilan todas las palabras únicas y se le asigna a cada una un entero. Si el vocabulario es `{"gato": 0, "perro": 1, "pájaro": 2}`, la frase "gato y perro" se codifica como `[0, 1]` (se ignora "y" por no estar en el vocabulario).

Este método es simple pero insuficiente para casi cualquier tarea real, por varias razones que conviene tener presentes porque motivan todo lo que sigue:

- **No hay relaciones entre palabras.** "Gato" (0) y "felino" (57) quedan tan alejados como "gato" y "silla"; el índice no informa de que ambas son casi sinónimas.
- **El orden de los índices es arbitrario.** Que "perro" sea el 0 y "gato" el 1 no significa nada; un modelo no puede inferir similitud a partir del número.
- **Vocabularios grandes cuestan memoria** y generan el problema de las [[tokenizacion|palabras fuera de vocabulario (OOV)]]: una palabra nueva en un texto futuro no tiene índice asignado.
- **Ignora el contexto:** "banco" tiene el mismo índice en "fui al banco a sacar dinero" y en "me senté en el banco del parque", aunque el significado sea distinto.
- **No representa documentos, solo palabras sueltas.** Un índice describe un término, no una frase ni un texto completo, así que no sirve como entrada de tamaño fijo para un clasificador.

### La bolsa de palabras (BoW): un vector por documento

La **bolsa de palabras** resuelve el problema más urgente de la indexación: en vez de un número por palabra, construye un vector por documento, de tamaño igual al del vocabulario del corpus. Cada posición del vector corresponde a una palabra del vocabulario, y su valor indica si esa palabra está en el documento.

Hay dos variantes, según qué guarda cada posición:

- **BoW de presencia**: 1 si la palabra aparece, 0 si no. Con el vocabulario `["gato", "perro", "pájaro"]`, el documento "El gato duerme" se codifica como $[1, 0, 0]$. Es la opción natural cuando solo importa si aparece una palabra clave, como detectar "gratis" o "descuento" en un filtro de spam.
- **BoW de frecuencia**: cuenta cuántas veces aparece cada palabra. El documento "El gato duerme y el gato juega", con el mismo vocabulario, da $[2, 0, 0]$. Es más informativa cuando la frecuencia importa, como en análisis de sentimiento.

Frente a la indexación, BoW aporta tres mejoras concretas. Primera, cada documento se convierte en un vector de tamaño fijo (el del vocabulario del corpus), así que dos textos de longitudes distintas quedan en el mismo espacio y se pueden comparar con la [[producto-escalar-similitud|similitud del coseno]]: por ejemplo, "el gato duerme" → $[1,0,1]$ y "el perro duerme" → $[0,1,1]$ (vocabulario `["gato","perro","duerme"]`) comparten la componente "duerme", lo que ya indica cierto parecido. Segunda, incorpora la frecuencia como señal, algo que un simple índice no puede hacer. Tercera, al tener tamaño fijo, estos vectores sirven directamente como entrada de modelos supervisados (regresión logística, SVM) sin transformación adicional.

BoW conserva, sin embargo, dos límites importantes: ignora por completo el **orden** de las palabras — "el gato persigue al perro" y "el perro persigue al gato" comparten idéntico vector— y no reconoce relaciones de significado, así que "el gato maulla" y "el felino maulla" quedan tan lejos como si no compartieran ningún tema.

### TF-IDF: pesar las palabras por lo que aportan

BoW trata "el" igual que "inteligencia": ambas suman 1 en su posición si aparecen. El problema es que las palabras muy comunes dominan el vector sin aportar nada distintivo, mientras que las palabras específicas de un documento —las que de verdad indican su tema— pesan lo mismo que cualquier otra. **TF-IDF** (*Term Frequency – Inverse Document Frequency*) corrige esto multiplicando dos factores para cada término $t$ en cada documento $d$:

- La **frecuencia de término** (TF), que crece con el número de apariciones de $t$ en $d$: cuanto más se repite dentro del documento, más relevante parece para ese texto.
- La **frecuencia inversa de documento** (IDF), que baja cuanto en más documentos del corpus aparece $t$: si un término está en todos los documentos, no ayuda a distinguirlos y su peso cae hasta ser mínimo.

Con el corpus de tres documentos "el gato duerme", "el perro duerme" y "el pájaro canta" (3 palabras cada uno, $N=3$), "el" aparece en los tres documentos y su IDF se anula, mientras que "gato" aparece en uno solo y conserva un peso alto: el desarrollo numérico completo está en Formalización. Ese comportamiento explica por qué TF-IDF mejora a BoW en tareas muy concretas: en clasificación de texto, evita que palabras comunes como "el" o "con" dominen sobre términos temáticos como "equipo" o "inteligencia"; en recuperación de información (buscadores), una consulta como "gato casa" prioriza documentos donde esos términos son distintivos, no solo frecuentes; y al comparar documentos, dos textos que comparten muchas palabras vacías pero ningún término específico dejan de parecer similares, al contrario de lo que ocurriría con BoW.

TF-IDF no resuelve, sin embargo, las dos limitaciones que ya tenía BoW: sigue ignorando el orden de las palabras ("el gato persigue al ratón" y "el ratón persigue al gato" reciben la misma representación) y sigue sin reconocer relaciones semánticas ("gato" y "felino" no comparten ningún peso, por relacionados que estén). A eso se suman limitaciones propias: los pesos dependen por completo del corpus de entrenamiento, así que si el corpus cambia hay que recalcularlos; una palabra nueva en un texto futuro, al no tener DF calculado, no puede recibir un peso TF-IDF sin volver a ajustar el vectorizador; y, como con cualquier técnica basada en conteos, el tamaño del vocabulario crece con corpus grandes y genera vectores dispersos (muchos ceros) y costosos en memoria. Superar estas limitaciones —capturar significado y contexto— es precisamente lo que motiva pasar a los [[word-embeddings|embeddings]].

## Formalización

Sea un corpus de $N$ documentos y un vocabulario de $|V|$ términos únicos.

**Bolsa de palabras.** Cada documento $d$ se representa como un vector $\mathbf{x}_d\in\mathbb{Z}_{\geq0}^{|V|}$, donde cada componente corresponde a un término del vocabulario:

$$
x_{d,t}=\begin{cases}\text{count}(t,d) & \text{BoW de frecuencia}\\ \mathbb{1}[t\in d] & \text{BoW de presencia}\end{cases}
$$

donde:
- $x_{d,t}$: valor de la componente del término $t$ en el vector del documento $d$.
- $\text{count}(t,d)$: número de veces que el término $t$ aparece en el documento $d$.
- $\mathbb{1}[t\in d]$: 1 si $t$ aparece en $d$, 0 en caso contrario.

**TF-IDF.** El peso de un término $t$ en un documento $d$ es:

$$
\text{TF-IDF}(t,d)=\text{TF}(t,d)\times\text{IDF}(t)
$$

$$
\text{TF}(t,d)=\frac{\text{count}(t,d)}{|d|} \qquad \text{IDF}(t)=\log\left(\frac{N}{\text{DF}(t)}\right)
$$

donde:
- $\text{TF}(t,d)$: frecuencia relativa del término $t$ en el documento $d$.
- $|d|$: número total de palabras del documento $d$.
- $\text{IDF}(t)$: frecuencia inversa de documento del término $t$.
- $N$: número total de documentos del corpus.
- $\text{DF}(t)$: número de documentos del corpus que contienen $t$ al menos una vez.

**Ejemplo numérico** (verificado con `numpy`). Corpus $N=3$: $d_1=$ "el gato duerme", $d_2=$ "el perro duerme", $d_3=$ "el pájaro canta" (3 palabras cada uno). Para $d_1$:

$$
\text{TF}(\text{el},d_1)=\frac13,\quad \text{DF}(\text{el})=3 \Rightarrow \text{IDF}(\text{el})=\log\frac33=0 \Rightarrow \text{TF-IDF}(\text{el},d_1)=0
$$

$$
\text{TF}(\text{gato},d_1)=\frac13,\quad \text{DF}(\text{gato})=1 \Rightarrow \text{IDF}(\text{gato})=\log\frac31\approx1{,}099 \Rightarrow \text{TF-IDF}(\text{gato},d_1)\approx0{,}366
$$

"El" aparece en los tres documentos y su peso se anula; "gato" solo aparece en $d_1$ y conserva un peso alto, exactamente el comportamiento que se buscaba.

Una variante habitual, incluida la que usa `scikit-learn` por defecto, suaviza el IDF para que ningún término quede exactamente en 0 (útil al puntuar palabras nuevas frente a un vectorizador ya ajustado):

$$
\text{IDF}_{\text{suavizado}}(t)=\log\left(\frac{1+N}{1+\text{DF}(t)}\right)+1
$$

Con este ajuste y la normalización de fila que aplica `scikit-learn`, "el" deja de valer 0 exacto (ver "En código"), aunque sigue pesando menos que los términos específicos.

## Interactivo

```widget
motor: texto
modo: "bow-tfidf"
textos: ["El gato duerme", "El perro duerme", "El pájaro canta"]
stopwords: []
pasos: ["minusculas", "puntuacion"]
n: 1
```

- Prueba a añadir la palabra "gato" a los tres documentos y observa cómo su TF-IDF baja al dejar de ser específica de uno solo.
- Prueba a activar el paso "stopwords" y compara qué le pasa a la columna de "el" en BoW frente a en TF-IDF: ¿cuál de las dos técnicas ya la penaliza sin necesidad de quitarla a mano?
- Prueba a cambiar `n` a 2 y observa cómo el vocabulario pasa a estar formado por pares de palabras consecutivas en vez de palabras sueltas.

## En código

```python
from sklearn.feature_extraction.text import CountVectorizer

corpus = ["el gato duerme", "el perro duerme", "el pajaro canta"]
vectorizador = CountVectorizer()
X = vectorizador.fit_transform(corpus)

print("Vocabulario:", vectorizador.get_feature_names_out())
print(X.toarray())
# Vocabulario: ['canta' 'duerme' 'el' 'gato' 'pajaro' 'perro']
# [[0 1 1 1 0 0]
#  [0 1 1 0 0 1]
#  [1 0 1 0 1 0]]
```

```python
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

corpus = ["el gato duerme", "el perro duerme", "el pajaro canta"]
vectorizador = TfidfVectorizer()
X = vectorizador.fit_transform(corpus)

print(np.round(X.toarray(), 3))
# [[0.    0.548 0.425 0.72  0.    0.   ]
#  [0.    0.548 0.425 0.    0.    0.72 ]
#  [0.652 0.    0.385 0.    0.652 0.   ]]
```

Observa que aquí "el" (tercera columna) no vale 0 exacto como en el cálculo a mano: `scikit-learn` usa por defecto el IDF suavizado y normaliza cada fila, pero sigue pesando menos que "gato" o "perro".

## Errores típicos

- **Error**: pensar que una palabra rara siempre recibe un TF-IDF alto en cualquier documento → **Correcto**: TF-IDF también depende de TF; si el término no aparece en un documento concreto, su TF-IDF ahí es 0 por muy rara que sea la palabra en el resto del corpus.
- **Error**: interpretar la "frecuencia inversa de documento" como el número de documentos donde la palabra *no* aparece → **Correcto**: $\text{DF}(t)$ cuenta los documentos donde el término *sí* aparece; el IDF baja cuando ese número se acerca a $N$, no al revés.
- **Error**: esperar que BoW o TF-IDF distingan "el gato persigue al perro" de "el perro persigue al gato" → **Correcto**: ambas técnicas ignoran el orden de las palabras; esas dos frases producen el mismo vector.
- **Error**: comparar a mano un cálculo de IDF con la salida de `TfidfVectorizer` y concluir que hay un error porque los números no coinciden → **Correcto**: `scikit-learn` suaviza el IDF y normaliza cada vector a longitud 1 por defecto; hay que fijar esos parámetros si se quiere reproducir la fórmula "de libro".

## En resumen

- BoW convierte cada documento en un vector de tamaño fijo (el del vocabulario del corpus) que cuenta presencia o frecuencia de cada palabra; TF-IDF pondera esas frecuencias para dar menos peso a las palabras muy comunes.
- Pasos: 1) construir el vocabulario del corpus tokenizado, 2) contar apariciones por documento (BoW), 3) calcular $\text{DF}(t)$ y $\text{IDF}(t)$ por término, 4) multiplicar $\text{TF}(t,d)\times\text{IDF}(t)$.
- Fórmula clave: $\text{TF-IDF}(t,d)=\text{TF}(t,d)\times\log(N/\text{DF}(t))$.
- Úsalo cuando necesites una representación rápida y barata para clasificación, búsqueda o comparación de textos sin necesitar orden ni significado profundo.
- No lo uses cuando el orden de las palabras importe (análisis sintáctico) o cuando necesites capturar sinónimos y relaciones semánticas: ahí hacen falta [[word-embeddings|embeddings]].
- Decisiones que importan: elegir presencia o frecuencia en BoW, quitar o no *stopwords* antes de vectorizar, y si se usa IDF suavizado (por defecto en la mayoría de librerías) o la fórmula sin suavizar.
- Trampa principal: pensar que TF-IDF entiende el significado de las palabras. Solo reordena pesos según cuántas veces aparece un término y en cuántos documentos; sigue sin saber qué significa.

## A fondo

**Otras aplicaciones reales.** Durante años, sistemas de correo como Gmail usaron técnicas de este tipo para clasificar mensajes en "Spam", "Principal" o "Promociones": las palabras presentes eran indicadores directos de la categoría. Empresas de análisis de redes sociales usan BoW y TF-IDF para procesar miles de comentarios e identificar tendencias positivas o negativas sin necesitar un modelo de lenguaje completo. Los sistemas de recomendación de artículos o noticias, en su versión más simple, comparan la representación TF-IDF de un artículo leído con la del resto del catálogo para sugerir contenidos parecidos.

**Por qué siguen siendo útiles pese a los embeddings.** BoW y TF-IDF son baratos de calcular, no requieren entrenar nada (el vocabulario y los pesos se derivan directamente del corpus) y el resultado es interpretable: se puede mirar qué palabras pesan más en un documento y entender por qué. En corpus estáticos y dominios controlados —por ejemplo, clasificar tickets de soporte en categorías fijas— siguen siendo una base más que suficiente, y a menudo una primera línea base contra la que comparar un modelo más complejo antes de justificar su coste.

**Vocabularios grandes y dispersión.** Cuando el corpus crece (por ejemplo, todo un año de artículos de un periódico), el vocabulario puede alcanzar decenas de miles de términos. Los vectores BoW/TF-IDF resultantes son enormes pero *dispersos* (*sparse*): casi todas sus posiciones son 0, porque ningún documento individual usa más que una fracción diminuta del vocabulario total. Las librerías como `scikit-learn` almacenan estas matrices en formato disperso para no desperdiciar memoria, pero la dimensionalidad sigue siendo un problema para muchos algoritmos, otro motivo por el que los embeddings —vectores ddensos y de tamaño fijo mucho menor— acaban ganando terreno en corpus grandes.

## Autoevaluación

### Un corpus tiene 100 documentos. El término "software" aparece en 95 de ellos. ¿Qué le pasa a su IDF frente al de un término que solo aparece en 2 documentos?
- [ ] El IDF de "software" es mayor, porque aparece más veces en total
- [ ] Ambos términos tienen el mismo IDF, porque el IDF no depende de $\text{DF}(t)$
- [x] El IDF de "software" es mucho menor, porque está presente en casi todos los documentos y no ayuda a distinguirlos
> Por qué: $\text{IDF}(t)=\log(N/\text{DF}(t))$ decrece cuando $\text{DF}(t)$ se acerca a $N$. Con $\text{DF}=95$ y $N=100$, $\log(100/95)\approx0{,}051$; con $\text{DF}=2$, $\log(100/2)\approx3{,}912$. La trampa es pensar que más apariciones totales (TF alto) implica más IDF, cuando son factores independientes.

### Dos documentos, "el perro corre en el parque" y "el parque tiene un perro", comparten casi todas sus palabras pero en distinto orden y con significado distinto. ¿Qué ocurre con su vector BoW?
- [ ] Son diferentes, porque BoW respeta el orden de aparición de las palabras
- [x] Son casi idénticos, porque BoW ignora el orden y solo cuenta qué palabras aparecen y cuántas veces
- [ ] BoW no puede procesar frases con estructura gramatical distinta
> Por qué: BoW construye el vector a partir del conjunto de palabras del vocabulario presentes en el documento, sin registrar posiciones. Es la limitación de orden que ni BoW ni TF-IDF resuelven; para eso se necesitan técnicas que sí consideren secuencia.

### Quieres detectar correos de spam solo comprobando si aparecen ciertas palabras clave ("gratis", "premio"), sin que importe cuántas veces se repitan. ¿Qué variante de BoW encaja mejor?
- [ ] BoW de frecuencia, porque cuantas más veces se repita "gratis" más spam es el correo
- [x] BoW de presencia, porque solo interesa si la palabra aparece o no, no su número de repeticiones
- [ ] TF-IDF, porque siempre es superior a BoW en cualquier tarea de clasificación
> Por qué: BoW de presencia usa 0/1 exactamente cuando la señal relevante es "aparece o no aparece". TF-IDF podría incluso perjudicar aquí: si "gratis" apareciera en muchos correos del corpus de entrenamiento (spam y no spam), su IDF bajaría y perdería peso.

### En un corpus de 3 documentos, un término aparece exactamente una vez en cada uno de los tres. ¿Cuánto vale su TF-IDF (con la fórmula sin suavizar) en cualquiera de los tres documentos?
- [ ] Un valor alto, porque el término aparece en todos los documentos
- [x] Cero, porque $\text{DF}(t)=N$ y por tanto $\log(N/\text{DF}(t))=\log(1)=0$
- [ ] No se puede calcular porque el término está en todo el corpus
> Por qué: cuando un término aparece en todos los documentos, $N/\text{DF}(t)=1$ y su logaritmo es 0, así que el TF-IDF se anula sin importar cuántas veces se repita dentro de cada documento. Es el mismo caso que "el" en el ejemplo de Formalización.

## Glosario

- **indexación (de palabras)**: asignar un número entero único a cada palabra distinta del vocabulario de un corpus.
- **frecuencia de término (TF)**: proporción de veces que un término aparece en un documento respecto al total de palabras de ese documento.
- **frecuencia inversa de documento (IDF)**: factor que reduce el peso de un término cuantos más documentos del corpus lo contienen.
