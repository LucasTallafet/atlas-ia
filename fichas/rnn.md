---
id: rnn
estado: borrador
---

## En una frase

Una red recurrente reutiliza los mismos pesos en cada paso de una secuencia, pasándose de un paso al siguiente un "estado oculto" que resume lo visto hasta ese momento.

## Intuición

Imagina que lees una frase palabra por palabra y, al llegar a "duerme", necesitas recordar que el sujeto era "el gato" para no confundirte con otro sustantivo que haya aparecido después. No relees toda la frase desde el principio: llevas un resumen mental que vas actualizando palabra a palabra. Una **red neuronal recurrente** (**RNN**) hace justo eso: en cada paso de tiempo combina la entrada actual con un **estado oculto** (su "memoria de trabajo") heredado del paso anterior, y produce un nuevo estado oculto que arrastra al siguiente paso.

Esto importa porque muchos datos —texto, series temporales, audio, señales de sensores— solo tienen sentido en su orden: la posición y el contexto de un dato influyen en cómo interpretar el siguiente. Un [[mlp|MLP]] trata cada entrada como si viniera aislada; una RNN está diseñada específicamente para que el pasado condicione el presente.

## Explicación

### Por qué un MLP no sirve para secuencias

Un [[mlp|MLP]] exige una entrada de tamaño fijo. Para darle una secuencia, habría que fijar de antemano una ventana máxima: rellenar con ceros (*padding*) las secuencias más cortas, desperdiciando cómputo, y truncar las más largas, perdiendo información. Además, un MLP no tiene **invarianza temporal**: cada neurona de entrada está atada a una posición fija, así que si un patrón se desplaza en el tiempo, la red lo trata como un evento nuevo. Y el número de pesos crece con la longitud de la secuencia, disparando el riesgo de sobreajuste.

### La idea: compartir pesos a lo largo del tiempo

Una RNN resuelve esto con **compartición de parámetros** (*parameter sharing*): usa exactamente los mismos pesos en cada paso de tiempo $t$, en vez de un conjunto de pesos por posición. El estado oculto $h_t$ se calcula combinando el estado anterior $h_{t-1}$ con la entrada actual $x_t$, y la salida $y_t$ (si la hay) se obtiene proyectando ese estado. Como los pesos no cambian con $t$, la red aprende una única regla de transición válida para cualquier posición de la secuencia, y el número de parámetros no depende de cuán larga sea esta.

Conviene distinguir dos cosas que se confunden con facilidad: el **estado oculto** $h_t$ es la memoria interna, recursiva, que siempre se actualiza; la **salida** $y_t$ es una proyección puntual de ese estado hacia el espacio de la tarea (por ejemplo, una probabilidad), y no todas las tareas la necesitan en cada paso.

### Cómo fluyen los datos: tensores de secuencia

En la práctica, una RNN procesa lotes de secuencias como un tensor de entrada de forma $(B, L, D)$: $B$ secuencias en paralelo (*batch size*), cada una de $L$ pasos de tiempo (*sequence length*) y $D$ variables por paso. En cada instante $t$, la red extrae la "rebanada" $(B, D)$ correspondiente, la combina con el estado oculto anterior de forma $(B, H)$ (con $H$ el tamaño de la memoria) y produce el nuevo estado, también $(B, H)$. Esta estructura permite que el hardware procese muchas secuencias a la vez aunque el cálculo sea, en esencia, secuencial.

### Entrenamiento: pérdida acumulada y retropropagación en el tiempo

Como en cualquier red, entrenar una RNN significa minimizar una pérdida ajustando sus pesos con [[backpropagation|retropropagación]] y [[descenso-gradiente|descenso de gradiente]]. La diferencia es que la pérdida se acumula a lo largo de toda la secuencia, sumando la pérdida local $l^{(t)}$ de cada paso, y el gradiente respecto a los pesos compartidos debe recorrer la cadena de estados ocultos hacia atrás en el tiempo. A este procedimiento se le llama ***Backpropagation Through Time*** (**BPTT**): aplica la regla de la cadena igual que la retropropagación normal, pero atravesando tantos pasos como de largo sea la secuencia.

### El problema numérico del BPTT: por qué se pierde memoria lejana

Calcular cómo influye la entrada del paso 1 en la pérdida del paso $t$ obliga a multiplicar, uno tras otro, los términos $\partial h_i/\partial h_{i-1}$ de cada paso intermedio. Cada uno de esos términos incluye la matriz de pesos recurrentes y la derivada de la función de activación (típicamente $\tanh$, acotada en $(0,1]$). Cuando se multiplican muchos números menores que 1, el producto se reduce exponencialmente: es el mismo fenómeno de [[backpropagation|desvanecimiento del gradiente]] visto en redes profundas, pero aquí la "profundidad" es la longitud de la secuencia. El efecto práctico es que la red aprende bien las dependencias cercanas en el tiempo y apenas nota las lejanas. Si, en cambio, esos términos son mayores que 1, el producto puede crecer sin control: es la **explosión del gradiente**, que se mitiga recortando la norma del gradiente (*gradient clipping*).

### Qué forma puede tomar la secuencia de salida

No toda tarea secuencial necesita una salida por cada paso de entrada. **Many-to-one** resume una secuencia entera en una única salida final (por ejemplo, decidir si una señal de sensor indica un fallo). **One-to-many** parte de un único estímulo para generar una secuencia (por ejemplo, describir una imagen con una frase). **Many-to-many** produce una salida por cada entrada, ya sea de forma sincrónica —una etiqueta por palabra, como en el reconocimiento de entidades— o mediante un esquema **codificador-decodificador**, donde una fase condensa toda la entrada en un vector de contexto y otra genera la salida a partir de él, como en la traducción automática, donde la entrada y la salida ni siquiera tienen por qué compartir longitud ni orden gramatical.

Este mismo mecanismo recurrente es la base del procesamiento de lenguaje natural anterior a los transformers: en una frase como "el gato duerme", una RNN mantiene en su estado oculto que el sujeto es "gato" para predecir mejor el verbo que sigue, incluso con palabras de por medio.

## Formalización

Actualización del estado oculto en cada paso $t$:

$$
h_t = \phi(W_{hh}h_{t-1} + W_{xh}x_t + b_h)
$$

donde:
- $h_t$ es el estado oculto en el instante $t$ (la memoria acumulada hasta ese momento).
- $h_{t-1}$ es el estado oculto del paso anterior.
- $x_t$ es la entrada en el instante $t$.
- $W_{hh}$ es la matriz de pesos recurrentes (transforma la memoria previa).
- $W_{xh}$ es la matriz de pesos de entrada (transforma la entrada actual).
- $b_h$ es el sesgo del estado oculto.
- $\phi$ es la función de activación, habitualmente $\tanh$.

La salida en cada paso, si la tarea la necesita, se obtiene proyectando el estado:

$$
y_t = W_{hy}h_t + b_y
$$

**Ejemplo numérico.** Con una única unidad oculta, $W_{hh}=0{,}5$, $W_{xh}=1$, $b_h=0$, $\phi=\tanh$, $h_0=0$ y una entrada constante $x_t=1$ en tres pasos, los estados ocultos son $h_1=0{,}7616$, $h_2=0{,}8811$, $h_3=0{,}8938$ (verificado con Python). Las derivadas $\partial h_i/\partial h_{i-1}=(1-h_i^2)W_{hh}$ valen $0{,}2100$, $0{,}1118$ y $0{,}1006$ para $i=1,2,3$. Su producto, que mide cuánto sobrevive el gradiente al retroceder los tres pasos hasta $h_0$, es apenas $0{,}0024$: con solo tres pasos, la señal ya se ha reducido a menos de un 0,3% de su magnitud original, lo que ilustra por qué el desvanecimiento del gradiente se agrava rápido en secuencias más largas.

## Interactivo

```widget
motor: pasos
---
### El problema: procesar una secuencia con memoria de un solo paso

Una RNN recibe una secuencia $x_1, x_2, x_3$ y debe llegar a una decisión final. En cada paso combina la entrada actual con la memoria heredada del paso anterior: $x_1 \to h_1$, luego $(x_2, h_1) \to h_2$, luego $(x_3, h_2) \to h_3 \to$ salida.
---
### Compartición de pesos: la misma transición en cada paso

Los mismos pesos $W_{hh}$, $W_{xh}$, $b_h$ se usan en los tres pasos. No hay un conjunto de pesos distinto para "el paso 1" y otro para "el paso 3".

| Paso $t$ | Entrada $x_t$ | Estado $h_t$ |
| --- | --- | --- |
| 1 | 1 | 0,7616 |
| 2 | 1 | 0,8811 |
| 3 | 1 | 0,8938 |
---
### BPTT: el gradiente retrocede paso a paso

Para saber cuánto influyó $x_1$ en la pérdida del paso 3, el gradiente debe atravesar las derivadas $\partial h_3/\partial h_2$ y $\partial h_2/\partial h_1$, multiplicándolas entre sí.

| Derivada | Valor |
| --- | --- |
| $\partial h_1/\partial h_0$ | 0,2100 |
| $\partial h_2/\partial h_1$ | 0,1118 |
| $\partial h_3/\partial h_2$ | 0,1006 |
| producto acumulado (3 pasos) | 0,0024 |
---
### El resultado: memoria que se desvanece con la distancia

Con solo 3 pasos, la contribución de $x_1$ ya se ha reducido a un 0,24% de su magnitud original. En secuencias de 50 o 100 pasos, ese producto se acerca a cero: la red "olvida" lo que ocurrió al principio.
```

Prueba a…
- Seguir cómo se calcula $h_3$ combinando $x_3$ con $h_2$, no con $x_1$ o $x_2$ directamente.
- Multiplicar a mano las tres derivadas de la tabla de BPTT y comprobar que el producto decrece mucho más rápido que cualquiera de sus factores por separado.
- Pensar qué pasaría con el producto acumulado si la secuencia tuviera 10 pasos en vez de 3, manteniendo derivadas del mismo orden de magnitud.

## Errores típicos

- **Error**: Pensar que el desvanecimiento del gradiente en una RNN es un fallo del algoritmo de BPTT → **Correcto**: es consecuencia de multiplicar muchas derivadas menores que 1 a lo largo de la secuencia, igual que en cualquier red muy profunda; BPTT solo calcula ese producto, no lo causa.
- **Error**: Confundir el estado oculto $h_t$ con la salida $y_t$ → **Correcto**: $h_t$ es la memoria recursiva que se actualiza siempre; $y_t$ es una proyección puntual de $h_t$ que solo se calcula si la tarea la necesita en ese paso.
- **Error**: Creer que una RNN necesita una arquitectura distinta según la longitud de la secuencia → **Correcto**: gracias a la compartición de pesos, los mismos parámetros procesan secuencias de cualquier longitud; lo que cambia es cuántas veces se aplica la misma transición.
- **Error**: Suponer que Many-to-Many siempre significa que entrada y salida tienen la misma longitud → **Correcto**: solo la variante sincrónica cumple $T_x=T_y$; el esquema codificador-decodificador permite longitudes distintas, como en traducción automática.

## En resumen

- Una RNN comparte los mismos pesos en cada paso de una secuencia, actualizando un estado oculto $h_t$ que resume lo visto hasta ese momento.
- Funciona combinando en cada paso la entrada actual $x_t$ con el estado anterior $h_{t-1}$, y opcionalmente proyectando una salida $y_t$ desde ese estado.
- Fórmula clave: $h_t=\phi(W_{hh}h_{t-1}+W_{xh}x_t+b_h)$.
- Se entrena con *Backpropagation Through Time* (BPTT), que aplica la regla de la cadena retrocediendo por todos los pasos de la secuencia.
- Úsala cuando el orden de los datos importa (texto, series temporales, audio); para datos sin estructura secuencial, un [[mlp|MLP]] es más simple y suficiente.
- La arquitectura de salida (many-to-one, one-to-many, many-to-many) depende de si la tarea necesita una salida por paso o solo al final.
- La trampa principal: en secuencias largas, el producto de muchas derivadas pequeñas hace que la memoria de los pasos lejanos se desvanezca antes de influir en el gradiente.

## A fondo

### Explosión del gradiente y cómo mitigarla

Si la matriz de pesos recurrentes tiene valores grandes, el producto de derivadas del BPTT puede crecer en vez de encogerse, provocando la **explosión del gradiente**: actualizaciones de pesos desproporcionadas que generan valores `NaN` y curvas de pérdida con saltos erráticos. La defensa más habitual es el ***gradient clipping***, que recorta la norma del vector de gradiente si supera un umbral, evitando que una actualización saque al modelo de su trayectoria de convergencia. También ayudan la inicialización ortogonal de $W_{hh}$ (que arranca con magnitud cercana a 1) y la normalización de capa (*layer normalization*), que estabiliza la distribución de las activaciones en cada paso temporal.

### Por qué ReLU no es la solución obvia en una RNN

En redes densas, ReLU mitiga el desvanecimiento del gradiente porque su derivada es constante e igual a 1 para valores positivos. En una RNN esa misma propiedad es un arma de doble filo: al no "aplastar" los valores como hace $\tanh$, si la matriz de pesos recurrentes tiene un radio espectral mayor que 1, las activaciones pueden crecer sin control paso a paso. Por eso $\tanh$ sigue siendo la activación por defecto en las RNN simples, a pesar de que favorece el desvanecimiento del gradiente: es un compromiso entre dos problemas, no una solución libre de coste.

### El límite de la RNN simple

El cuello de botella de fondo es que toda la memoria histórica se comprime en un único vector $h_t$ que se sobrescribe en cada paso: la red debe usarlo a la vez para la información inmediata (la palabra actual) y para la información lejana (el sujeto de diez palabras atrás), y la segunda tiende a perderse frente a la primera. Esta limitación es la que motiva arquitecturas con mecanismos explícitos de control de memoria, como [[lstm-gru]].

## Autoevaluación

### En una RNN con secuencias de longitud 50, ¿por qué la red aprende peor la relación entre el primer elemento y la salida final que entre el elemento 49 y la salida final?
- [ ] Porque el primer elemento no participa en el cálculo del estado oculto
- [x] Porque el gradiente que conecta el primer elemento con la salida final debe atravesar 50 productos de derivadas, y ese producto tiende a desvanecerse
- [ ] Porque los pesos son distintos para cada posición de la secuencia
- [ ] Porque la función de pérdida solo depende del último paso
> Por qué: BPTT calcula la influencia de un paso lejano multiplicando las derivadas de todos los pasos intermedios; cuantos más pasos, más factores menores que 1 se multiplican y más se desvanece el gradiente, con independencia de que los pesos sean los mismos en toda la secuencia.

### ¿Qué diferencia hay entre el estado oculto $h_t$ y la salida $y_t$ de una RNN?
- [ ] Son la misma variable con dos nombres distintos
- [x] $h_t$ es la memoria interna que se actualiza siempre de forma recursiva; $y_t$ es una proyección puntual de $h_t$ que solo se calcula cuando la tarea la necesita
- [ ] $h_t$ solo existe en la última posición de la secuencia
- [ ] $y_t$ se calcula sin usar $h_t$
> Por qué: $h_t$ depende recursivamente de $h_{t-1}$ y siempre se actualiza; $y_t=W_{hy}h_t+b_y$ es una lectura externa de ese estado, y en tareas many-to-one solo se calcula en el último paso.

### Un sistema de traducción automática usa una arquitectura codificador-decodificador. ¿Por qué no basta con una RNN many-to-many sincrónica ($T_x=T_y$)?
- [ ] Porque las RNN sincrónicas no pueden procesar texto
- [x] Porque el idioma de entrada y el de salida pueden tener distinto número de palabras y distinto orden gramatical, así que no hay una correspondencia palabra a palabra en cada paso
- [ ] Porque el codificador-decodificador no usa pesos compartidos
- [ ] Porque una RNN sincrónica no puede usarse con texto en dos idiomas distintos
> Por qué: la variante sincrónica exige generar una salida por cada entrada en el mismo paso, lo que solo funciona si ambas secuencias tienen la misma longitud y orden; el esquema codificador-decodificador condensa toda la entrada antes de generar una salida de longitud distinta.

### Estás entrenando una RNN y observas que la pérdida se dispara a `NaN` a las pocas iteraciones. ¿Qué problema es más probable y qué harías primero?
- [ ] Desvanecimiento del gradiente; aumentarías la tasa de aprendizaje
- [x] Explosión del gradiente; aplicarías *gradient clipping* para acotar la norma del gradiente
- [ ] Sobreajuste; añadirías más capas
- [ ] Un error en la función de pérdida; cambiarías de optimizador
> Por qué: valores `NaN` y saltos erráticos en la pérdida son la firma característica de la explosión del gradiente, no del desvanecimiento (que produce el efecto contrario: aprendizaje estancado); el remedio directo es recortar la norma del gradiente.

## Glosario

- **estado oculto**: vector $h_t$ que una RNN actualiza en cada paso de tiempo y que resume, de forma comprimida, la información relevante vista hasta ese momento.
- **compartición de parámetros**: uso de los mismos pesos en todos los pasos de tiempo de una RNN, en vez de un conjunto distinto por posición.
- **Backpropagation Through Time (BPTT)**: variante de la retropropagación que calcula el gradiente de la pérdida atravesando la cadena de estados ocultos hacia atrás en el tiempo.
- **gradient clipping**: técnica que recorta la norma del vector de gradiente cuando supera un umbral, para evitar la explosión del gradiente.
