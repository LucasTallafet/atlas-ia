---
id: variable-aleatoria
estado: borrador
---

## En una frase

Una variable aleatoria convierte el resultado de un proceso incierto en un número, y su distribución de probabilidad describe cómo de probable es cada valor posible.

## Intuición

Un ordenador no puede razonar directamente sobre "cara o cruz" o "spam o no spam": necesita números. Una **variable aleatoria** es justo ese traductor: asigna un número a cada resultado posible de un experimento incierto, para que se pueda calcular con él. Una vez traducido a números, puedes preguntar cosas muy útiles: ¿cuál es el valor más probable?, ¿cuánto varían los resultados?, ¿qué probabilidad hay de superar un umbral?

En IA esto aparece continuamente: el resultado de un clasificador (0 o 1), el tiempo que tarda un modelo en responder, o el error que comete una predicción son todos variables aleatorias.

## Explicación

### Discretas y continuas

Una variable aleatoria es **discreta** cuando solo puede tomar un conjunto finito o numerable de valores, como el número de aciertos de un clasificador en 100 intentos (un entero entre 0 y 100). Es **continua** cuando puede tomar cualquier valor dentro de un intervalo, como el tiempo de inferencia de una red neuronal en milisegundos. Esta distinción importa porque cambia la herramienta matemática que se usa para describir sus probabilidades.

### Función de masa y función de densidad

Para una variable discreta, la **función de masa de probabilidad** $P(X=x)$ da directamente la probabilidad de cada valor, y la suma de todas ellas es 1. Para una variable continua, preguntar por la probabilidad de un valor exacto no tiene sentido: hay infinitos valores posibles, así que la probabilidad de acertar uno concreto es cero. En su lugar se usa la **función de densidad de probabilidad** $f(x)$, que no da probabilidades directamente, sino que hay que integrarla sobre un intervalo para obtener una probabilidad. La idea clave es que, en variables continuas, la probabilidad vive en los intervalos, no en los puntos.

### Distribución: el mapa completo de la incertidumbre

La **distribución de probabilidad** es la descripción completa de cómo se reparten las probabilidades entre todos los valores posibles de una variable aleatoria; la función de masa o de densidad es la fórmula concreta que la calcula. Por ejemplo, un clasificador binario de fraude podría tener la distribución $P(X=0)=0{,}98$ y $P(X=1)=0{,}02$: ese par de números es un mapa completo de la incertidumbre de esa variable.

### Resumir una distribución: media y varianza

Trabajar siempre con la distribución completa es incómodo, así que se resume con dos números. La **media** o valor esperado $E[X]$ marca el centro: el valor promedio si repitieras el experimento muchas veces. La **varianza** $\mathrm{Var}(X)$ mide cuánto se dispersan los valores alrededor de ese centro; su raíz cuadrada, la desviación estándar, tiene la ventaja de estar en las mismas unidades que la variable. En un modelo predictivo, la media suele ser la predicción central y la desviación estándar cuantifica la incertidumbre de esa predicción.

### La función de distribución acumulada

La **función de distribución acumulada** (CDF), $F(x)=P(X\le x)$, da la probabilidad acumulada hasta un valor $x$. Es útil porque convierte preguntas sobre rangos en una sola resta: la probabilidad de caer entre dos valores es la diferencia de sus CDF. Sirve, por ejemplo, para fijar el umbral por debajo del cual debe estar el error de un modelo con una confianza dada.

## Formalización

Para una variable aleatoria discreta:

$$
E[X] = \mu = \sum_i x_i\, P(x_i)
$$

Para una variable aleatoria continua:

$$
E[X] = \mu = \int_{-\infty}^{\infty} x\, f(x)\, dx
$$

donde:

- $x_i$ son los valores posibles de la variable discreta y $P(x_i)$ su probabilidad.
- $f(x)$ es la función de densidad de probabilidad de la variable continua.
- $\mu$ es la media o valor esperado, el centro de la distribución.

$$
\mathrm{Var}(X) = \sigma^2 = E\big[(X-\mu)^2\big] \qquad\qquad F(x) = P(X \le x)
$$

donde:

- $\sigma^2$ es la varianza: el valor esperado del cuadrado de la distancia a la media.
- $\sigma$, la raíz de la varianza, es la desviación estándar.
- $F(x)$ es la función de distribución acumulada: la probabilidad de que $X$ tome un valor menor o igual que $x$.

**Ejemplo numérico:** sea $X$ una variable de Bernoulli (0 o 1) con $P(X=1)=0{,}3$. Su media es $E[X]=1\cdot 0{,}3 + 0\cdot 0{,}7 = 0{,}3$, y su varianza, $\mathrm{Var}(X)=0{,}3\cdot(1-0{,}3)=0{,}21$.

## Interactivo

```widget
motor: funcion
modo: pdf-cdf
funciones: [{"expr": "1/sqrt(2*pi)*exp(-x^2/2)", "etiqueta": "densidad f(x)"}]
x: [-4, 4]
```

- Prueba a sombrear el área entre dos valores de $x$ y comprueba que representa una probabilidad, no una altura de la curva.
- Prueba a comparar la altura de $f(x)$ en $x=0$ con la de la CDF en el mismo punto: son magnitudes distintas.
- Prueba a fijarte en cómo la CDF siempre crece (o se mantiene igual) de izquierda a derecha, nunca baja.

## En código

```python
# Media y varianza de una variable discreta (número de caras en 2 lanzamientos)
valores = [0, 1, 2]
probs = [0.25, 0.5, 0.25]

media = sum(x * p for x, p in zip(valores, probs))
varianza = sum((x - media)**2 * p for x, p in zip(valores, probs))
print(media, varianza)  # 1.0 0.5
```

## Errores típicos

- **Error**: pensar que $f(x)$, la densidad, es directamente una probabilidad. → **Correcto**: en variables continuas $f(x)$ hay que integrarla en un intervalo para obtener una probabilidad; el valor $f(x)$ suelto puede incluso superar 1.
- **Error**: creer que $P(X=x)=0$ en variables continuas significa que ese valor es imposible. → **Correcto**: es matemáticamente posible, pero al haber infinitos valores en cualquier intervalo, la probabilidad de acertar exactamente uno es cero; lo relevante son los intervalos.
- **Error**: confundir la varianza con la media, usando la dispersión como si fuera el valor típico. → **Correcto**: la media dice dónde está el centro; la varianza dice cuánto se alejan los valores de ese centro.
- **Error**: suponer que la CDF puede bajar en algún tramo. → **Correcto**: al ser una probabilidad acumulada, $F(x)$ es siempre no decreciente.

## En resumen

- **Qué es:** una función que traduce los resultados de un experimento incierto a números, para poder calcular con ellos.
- **Dos tipos:** discreta (función de masa $P(X=x)$) o continua (función de densidad $f(x)$, que se integra para obtener probabilidades).
- **Fórmula clave:** $E[X]=\sum_i x_i P(x_i)$ (discreta) o $\int x f(x)\,dx$ (continua).
- **Cómo se resume:** con la media (centro) y la varianza o desviación estándar (dispersión).
- **La CDF:** $F(x)=P(X\le x)$, acumulada y siempre no decreciente; útil para calcular probabilidades de rangos e intervalos.
- **Trampa principal:** la densidad $f(x)$ no es una probabilidad; solo lo es su integral sobre un intervalo.

## A fondo

### Por qué la varianza usa el cuadrado

Definir la varianza como $E[(X-\mu)^2]$ y no como $E[|X-\mu|]$ (la distancia absoluta media) no es casualidad: elevar al cuadrado penaliza más los alejamientos grandes que los pequeños, y hace que la varianza tenga propiedades matemáticas convenientes (por ejemplo, se puede descomponer y combinar entre variables independientes de forma sencilla). Esa misma elección —penalizar cuadráticamente— reaparece en el error cuadrático medio usado como función de pérdida en muchos modelos de regresión.

## Autoevaluación

### Un modelo de deep learning tarda en promedio 50 ms en responder, con variabilidad. ¿Qué tipo de variable aleatoria es el tiempo de inferencia?
- [ ] Discreta, porque se mide en milisegundos.
- [x] Continua, porque puede tomar cualquier valor dentro de un rango, no solo un conjunto contable de valores.
- [ ] Ninguna de las dos, porque depende del hardware.
> Por qué: el tiempo puede tomar infinitos valores posibles dentro de un intervalo (49,3 ms, 49,31 ms, etc.), que es justo la definición de variable continua; que se mida con instrumentos de precisión limitada no cambia su naturaleza teórica.

### ¿Por qué no tiene sentido preguntar "cuál es la probabilidad de que el tiempo de inferencia sea exactamente 50,000... ms" en una variable continua?
- [ ] Porque las variables continuas no tienen probabilidades.
- [x] Porque hay infinitos valores posibles en cualquier intervalo, así que la probabilidad de acertar uno exacto es cero; la probabilidad vive en los intervalos.
- [ ] Porque la densidad $f(x)$ ya es cero en todos los puntos.
> Por qué: $f(x)$ no tiene por qué ser cero (puede ser positiva), pero integrar sobre un único punto (un intervalo de anchura cero) siempre da área cero; por eso las probabilidades de variables continuas se formulan sobre rangos.

### Dos modelos predicen el mismo tiempo medio de entrega (media $\mu$ igual), pero uno tiene una desviación estándar mucho mayor que el otro. ¿Qué modelo preferirías para dar una garantía fiable al cliente?
- [ ] Da igual, porque la media es la misma en los dos.
- [x] El de menor desviación estándar, porque sus predicciones se alejan menos del valor típico y son más consistentes.
- [ ] El de mayor desviación estándar, porque cubre más casos posibles.
> Por qué: la media dice el valor esperado, pero la desviación estándar dice cuánta incertidumbre rodea a esa predicción; con la misma media, menor dispersión significa predicciones más fiables.

## Glosario

- **Variable aleatoria**: función que asigna un número a cada resultado posible de un experimento aleatorio.
- **Función de masa de probabilidad**: para variables discretas, da directamente $P(X=x)$.
- **Función de densidad de probabilidad**: para variables continuas, se integra sobre un intervalo para obtener una probabilidad.
- **Distribución de probabilidad**: descripción completa de cómo se reparten las probabilidades entre los valores posibles de una variable aleatoria.
- **Media o valor esperado**: centro de la distribución, denotado $\mu$; promedio ponderado por probabilidad.
- **Varianza**: dispersión de los valores alrededor de la media, denotada $\sigma^2$.
- **Función de distribución acumulada (CDF)**: $F(x)=P(X\le x)$, probabilidad acumulada hasta un valor.
