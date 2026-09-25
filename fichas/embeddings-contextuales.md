---
id: embeddings-contextuales
estado: borrador
---

## En una frase

Los embeddings estáticos asignan un único vector a cada palabra, sin importar el contexto; ELMo introdujo los embeddings contextuales, que calculan un vector distinto según la frase.

## Intuición

Piensa en la palabra "banco". Puede ser el asiento de un parque o una entidad financiera, y solo sabes cuál es leyendo el resto de la frase. Un [[word-embeddings|embedding]] clásico como Word2Vec no puede hacer esa distinción: aprendió un único punto del espacio vectorial para "banco" y lo usa siempre, mezclando sin querer los dos sentidos en un mismo vector.

ELMo resuelve este problema de una forma muy natural: en vez de mirar la palabra sola, lee toda la frase antes de decidir qué vector darle a cada palabra. Es como cuando tú lees "me senté en el banco del parque" y, al llegar a "parque", entiendes retroactivamente que "banco" era un asiento. ELMo hace algo parecido con una red que recorre la frase en ambas direcciones y ajusta la representación de cada palabra según lo que la rodea. Esto importa porque muchas palabras de cualquier idioma son ambiguas, y un sistema que no distingue sentidos arrastra ese error a todas las tareas posteriores: búsqueda, clasificación, traducción.

## Explicación

### El límite de una representación fija

Los [[word-embeddings|embeddings estáticos]] (Word2Vec, GloVe, FastText) resuelven bien el problema de acercar palabras con significados parecidos, pero comparten una limitación: cada palabra del vocabulario tiene **un único vector**, calculado una vez durante el entrenamiento y reutilizado siempre igual. Da igual si "banco" aparece junto a "parque" o junto a "dinero": el vector es el mismo. Esto impide capturar la **polisemia**, es decir, que una misma palabra tenga varios significados según el uso.

### ELMo: mirar toda la frase con una BiLSTM

**ELMo (Embeddings from Language Models)** introdujo las **representaciones contextuales**: en vez de fijar un vector por palabra, calcula un vector distinto para cada aparición, a partir de la frase completa en la que se encuentra. Para lograrlo, usa una **BiLSTM** (una [[lstm-gru|LSTM]] que procesa la secuencia en las dos direcciones: de izquierda a derecha y de derecha a izquierda) entrenada como modelo de lenguaje basado en caracteres, no en palabras completas. Trabajar con caracteres tiene una ventaja añadida: ELMo puede construir una representación razonable incluso para palabras que nunca vio enteras durante el entrenamiento, porque no depende de tener cada palabra en un vocabulario fijo.

El resultado es que la palabra "banco" en "me senté en el banco del parque" recibe un vector distinto al de "banco" en "deposité dinero en el banco", porque en ambos casos ELMo ha incorporado la información del resto de la frase antes de fijar la representación final.

### De representación fija a representación dinámica

Esta idea —que la representación de una palabra dependa del contexto— es la que después llevarían más lejos los modelos basados en el mecanismo de atención, sustituyendo la recurrencia de la BiLSTM por otra forma de mirar toda la frase a la vez.

## Formalización

Un embedding **estático** asigna a cada palabra $w$ del vocabulario un único vector fijo:

$$
\mathbf{v}_w \in \mathbb{R}^d
$$

donde:
- $w$ es una palabra del vocabulario.
- $d$ es la dimensión del embedding.
- $\mathbf{v}_w$ no depende de la frase en la que aparezca $w$.

Un embedding **contextual** sustituye ese vector fijo por una función que depende de toda la secuencia:

$$
\mathbf{v}_{w_i}^{(s)} = f_\theta(w_1, w_2, \dots, w_n)_i
$$

donde:
- $s = (w_1, \dots, w_n)$ es la frase completa.
- $w_i$ es la palabra en la posición $i$ dentro de esa frase.
- $f_\theta$ es la red entrenada (en ELMo, la BiLSTM), que toma toda la secuencia y devuelve un vector por posición.
- $\mathbf{v}_{w_i}^{(s)}$ es el vector resultante para $w_i$: puede cambiar si $w_i$ aparece en una frase $s$ distinta.

**Ejemplo.** Con vectores de juguete en $\mathbb{R}^2$ (verificado con `tools/calc.py`): un embedding estático de "banco" podría ser $\mathbf{v}_{\text{banco}} = [0{,}40,\ 0{,}50]$, idéntico en las dos frases (similitud del coseno consigo mismo $= 1{,}0$, trivialmente). Con vectores contextuales, "banco" (parque) podría ser $[0{,}10,\ 0{,}90]$ y "banco" (finanzas) $[0{,}80,\ 0{,}10]$: la similitud del coseno entre ambos es de solo $0{,}23$, reflejando que son dos sentidos distintos.

## Interactivo

```widget
motor: pasos
fotogramas: [{"texto": "Con un embedding **estático** (Word2Vec), 'banco' tiene el mismo vector en las dos frases, aunque el sentido sea distinto.", "tabla": {"cabecera": ["Frase", "Vector de 'banco'"], "filas": [["Me senté en el banco del parque", "[0,40, 0,50]"], ["Deposité dinero en el banco", "[0,40, 0,50]"]], "resaltar": [[0, 1], [1, 1]]}}, {"texto": "Con **ELMo**, cada aparición de 'banco' se recalcula a partir de toda la frase: los vectores ya no coinciden.", "tabla": {"cabecera": ["Frase", "Vector de 'banco'"], "filas": [["Me senté en el banco del parque", "[0,10, 0,90]"], ["Deposité dinero en el banco", "[0,80, 0,10]"]], "resaltar": [[0, 1], [1, 1]]}}, {"texto": "La similitud del coseno entre esos dos vectores contextuales es baja ($\\approx 0{,}23$): ELMo distingue los dos sentidos de 'banco', aunque el estático los confundía (similitud $=1{,}0$)."}, {"texto": "ELMo consigue esto con una **BiLSTM**: lee la frase de izquierda a derecha y de derecha a izquierda, y combina ambos recorridos para fijar la representación final de cada palabra."}]
```

- Prueba a avanzar fotograma a fotograma y localiza el momento exacto en el que los dos vectores de "banco" dejan de ser idénticos.
- Prueba a imaginar una tercera frase con "banco" en el mismo sentido que "parque" (por ejemplo, "nos sentamos juntos en el banco"): ¿su vector contextual debería parecerse más al de "parque" o al de "finanzas"?

## Errores típicos

- **Error**: pensar que ELMo asigna un vector por palabra del vocabulario, igual que Word2Vec → **Correcto**: ELMo asigna un vector por *aparición* de la palabra en una frase concreta; la misma palabra puede tener tantos vectores distintos como frases donde aparezca.
- **Error**: creer que la representación contextual solo cambia "un poco" respecto a la estática → **Correcto**: puede cambiar sustancialmente; en el ejemplo, dos sentidos de "banco" pasan de similitud $1{,}0$ (estático, idéntico) a $0{,}23$ (contextual).
- **Error**: pensar que ELMo procesa cada palabra de forma aislada y luego las junta → **Correcto**: usa una BiLSTM que recorre la secuencia completa en ambas direcciones antes de fijar la representación de cada token.

## En resumen

- Los embeddings estáticos (Word2Vec, GloVe) asignan un único vector a cada palabra del vocabulario, sin importar la frase en que aparezca.
- Los embeddings contextuales (ELMo) calculan un vector distinto para cada aparición de una palabra, a partir de toda la frase.
- Cómo funciona ELMo en 2 pasos: procesa la secuencia de caracteres con una BiLSTM en ambas direcciones, y combina ambos sentidos para dar la representación final de cada token.
- Regla clave: $\mathbf{v}_{w_i}^{(s)} = f_\theta(w_1,\dots,w_n)_i$ (depende de toda la frase), frente al vector fijo $\mathbf{v}_w$ de un embedding estático.
- Úsalo cuando el significado de las palabras dependa del contexto (polisemia, desambiguación); un embedding estático basta si el significado es estable.
- Al trabajar con caracteres y no con un vocabulario cerrado, ELMo puede representar razonablemente palabras que no vio completas en el entrenamiento.
- Trampa principal: es más costoso de calcular que un embedding estático y, al basarse en una BiLSTM, sigue procesando la secuencia paso a paso, no en paralelo.

## A fondo

ELMo mejoró tareas donde el significado depende de matices finos: en análisis de sentimientos, una frase como "el producto es increíblemente malo" puede pasar desapercibida para una representación estática, mientras que ELMo ajusta el vector de "malo" según el resto de la frase; en reconocimiento de entidades, permite distinguir si "Apple" se refiere a una empresa o a una fruta según el contexto ("Apple lanzó un nuevo iPhone"). Una ventaja práctica de ELMo es que sus representaciones están **preentrenadas**: se pueden reutilizar en distintos problemas de NLP sin reentrenar el modelo desde cero, igual que ocurre con los embeddings estáticos, pero con la ganancia añadida del contexto.

ELMo fue, sin embargo, un paso intermedio: sentó las bases de las representaciones contextuales antes de que los modelos basados en autoatención llegaran a dominar el campo, sustituyendo la recurrencia de la BiLSTM por un mecanismo que compara directamente todas las palabras entre sí.

## Autoevaluación

### En "me senté en el banco del parque" y "deposité dinero en el banco", ¿qué diferencia hay entre representar "banco" con Word2Vec y con ELMo?
- [ ] Con Word2Vec, cada aparición tendría un vector distinto; con ELMo, el mismo vector en las dos.
- [x] Con Word2Vec, las dos apariciones comparten el mismo vector; con ELMo, cada una obtiene un vector distinto según su contexto.
- [ ] No hay diferencia: ambos calculan el vector de la misma manera.
> Por qué: Word2Vec asigna un vector fijo por palabra del vocabulario; ELMo recalcula la representación de cada token a partir de la frase completa en la que aparece.

### Si calculas la similitud del coseno entre el vector contextual de "banco" (sentido parque) y el de "banco" (sentido finanzas) generados por ELMo, ¿qué esperas?
- [x] Un valor bajo, porque son dos sentidos distintos de la palabra.
- [ ] Un valor de exactamente 1, porque sigue siendo la misma palabra.
- [ ] Un valor negativo, porque los sentidos son opuestos.
> Por qué: los vectores contextuales de sentidos distintos apuntan a zonas distintas del espacio; en el ejemplo verificado la similitud fue de aproximadamente $0{,}23$, lejos del $1{,}0$ que darían dos vectores estáticos idénticos.

### Un compañero dice: "ELMo mejora a Word2Vec porque usa un vocabulario más grande". ¿Qué falla en esa afirmación?
- [ ] Nada, es correcta.
- [x] Confunde la mejora real (que la representación dependa del contexto) con el tamaño del vocabulario, que no es la diferencia clave entre ambos modelos.
- [ ] ELMo no usa ningún vocabulario.
> Por qué: la ventaja de ELMo es que la representación de cada palabra cambia según el contexto de la frase; que trabaje con caracteres y reduzca la dependencia de un vocabulario fijo es una consecuencia distinta, no la razón de fondo de la mejora.

### ¿Qué tienen en común Word2Vec y ELMo, a pesar de sus diferencias?
- [x] Ambos aprenden representaciones a partir de grandes cantidades de texto sin etiquetar.
- [ ] Ambos asignan un único vector fijo por palabra.
- [ ] Ambos usan un mecanismo de atención para calcular sus vectores.
> Por qué: ambos son modelos de representación entrenados de forma no supervisada sobre grandes corpus; se diferencian en si el vector resultante depende o no del contexto, no en cómo se entrenan a alto nivel.

## Glosario

- **embedding estático**: vector fijo asignado a una palabra, igual en cualquier frase donde aparezca.
- **embedding contextual**: vector calculado para una palabra a partir de toda la frase en la que aparece, distinto según el contexto.
- **ELMo**: modelo que genera embeddings contextuales mediante una BiLSTM entrenada como modelo de lenguaje basado en caracteres.
- **polisemia**: fenómeno por el que una misma palabra tiene varios significados distintos según el contexto en que se use.
