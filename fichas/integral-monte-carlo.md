---
id: integral-monte-carlo
estado: borrador
---

## En una frase

La integral mide la acumulación de una función, y cuando calcularla a mano es imposible, Monte Carlo la aproxima lanzando puntos al azar y promediando.

## Intuición

Si la derivada te dice qué tan rápido cambia algo en un instante, la integral hace lo contrario: acumula. La velocidad de un coche cambia a cada segundo, pero si la vas sumando (integrando) a lo largo del tiempo obtienes la distancia total recorrida. Geométricamente, integrar una [[funciones|función]] entre dos puntos es calcular el área bajo su curva.

El problema aparece cuando esa área no se puede calcular con una fórmula exacta, algo habitual en IA porque las funciones dependen de cientos o miles de variables. Ahí entra el método de **Monte Carlo**: en vez de recorrer sistemáticamente el espacio entero, lanza "dardos" al azar y usa el promedio de dónde caen para estimar el área o el valor esperado, igual que estimarías el peso medio de la fruta de una plantación enorme pesando solo un puñado de árboles elegidos al azar.

## Explicación

### La integral como acumulación

La integral de una función $f(x)$ entre $a$ y $b$ es el área bajo su curva en ese intervalo: una suma continua de valores diminutos, $f(x)\,dx$. El **Teorema Fundamental del Cálculo** conecta esta idea con la derivada: derivar la integral de una función devuelve la función original, y la integral definida se calcula evaluando una primitiva $F$ (una función cuya derivada es $f$) en los extremos y restando, $\int_a^b f(x)\,dx = F(b)-F(a)$. En IA, la función de pérdida que se minimiza es, en esencia, un error acumulado sobre todos los datos: esta dualidad entre cambio puntual (derivada) y acumulación total (integral) es lo que hace coherente usar el gradiente para reducir el error total.

### Aproximar el área con rectángulos: la Suma de Riemann

Cuando no hay una primitiva sencilla, se aproxima el área dividiendo el intervalo en $N$ trozos de ancho $\Delta x$ y sumando el área de $N$ rectángulos, cada uno de altura $f(x_i^*)$:

$$
S_N = \sum_{i=1}^N f(x_i^*)\,\Delta x
$$

La aproximación se vuelve exacta cuando $N\to\infty$. El problema es que este enfoque **determinista** se hunde con la dimensión: para mantener la misma precisión en $d$ variables hace falta una cuadrícula con del orden de $N^d$ puntos. Con $100$ puntos por eje y $10$ variables, eso son $100^{10}$ evaluaciones: la llamada **maldición de la dimensionalidad**.

### Monte Carlo: sustituir la cuadrícula por el azar

El método de **Monte Carlo** rompe esa maldición usando muestreo aleatorio en vez de una rejilla sistemática. Si la integral puede leerse como un valor esperado $\mathbb{E}[g(X)]$, se aproxima con el promedio de muestras aleatorias $x_i$:

$$
\mathbb{E}[g(X)] \approx \frac{1}{N}\sum_{i=1}^N g(x_i)
$$

Esto funciona gracias a la **Ley de los Grandes Números**: al repetir un experimento aleatorio muchas veces, el promedio observado converge al valor esperado teórico. La clave, y la razón de que Monte Carlo domine en alta dimensión, es que la precisión de la estimación depende solo del número de muestras $N$, con un error del orden $\mathcal{O}(1/\sqrt N)$, **no** del número de dimensiones $d$. Duplicar $N$ reduce el error de forma predecible, tenga la función 10 o 10.000 variables.

## Formalización

$$
\int_a^b f(x)\,dx = \lim_{N\to\infty}\sum_{i=1}^N f(x_i^*)\,\Delta x \qquad\qquad \mathbb{E}[g(X)] \approx \frac{1}{N}\sum_{i=1}^N g(x_i)
$$

donde:

- $[a,b]$ es el intervalo de integración, dividido en $N$ subintervalos de ancho $\Delta x=(b-a)/N$.
- $x_i^*$ es el punto de muestra elegido dentro de cada subintervalo (Riemann); $x_i$ es una muestra aleatoria del dominio (Monte Carlo).
- $g(X)$ es la función cuyo valor esperado se quiere estimar, con $X$ una variable aleatoria sobre el dominio de integración.
- $\mathcal{O}(1/\sqrt N)$ describe cómo decrece el error de Monte Carlo al aumentar $N$, independientemente de $d$.

## Interactivo

```widget
motor: simulacion
modo: pi
config: {"n": 2000}
semilla: 7
```

- Prueba a aumentar $N$ de 100 a 5.000 y observa cómo el error se reduce, pero cada vez más despacio.
- Prueba a cambiar la semilla varias veces con el mismo $N$ pequeño: ¿cuánto varía la estimación de un intento a otro?
- Prueba a estimar cuántos puntos harían falta para reducir el error a la mitad, sabiendo que decrece como $1/\sqrt N$.

## En código

```python
import random

# Suma de Riemann para f(x)=x^2 en [0,2], 4 rectángulos, extremo derecho
dx = 0.5
xs = [0.5, 1.0, 1.5, 2.0]
S4 = dx * sum(x**2 for x in xs)
print("Riemann S4:", S4, "| exacto: 8/3 =", round(8 / 3, 3))  # 3.75 | 2.667

# Estimación de pi por Monte Carlo (dardos en un cuadrado [-1,1]x[-1,1])
random.seed(7)
N = 2000
dentro = sum(1 for _ in range(N)
             if (lambda x, y: x * x + y * y <= 1)(random.uniform(-1, 1), random.uniform(-1, 1)))
print("pi estimado:", 4 * dentro / N)  # 3.12
```

## Errores típicos

- **Error**: pensar que aumentar el número de variables de una función apenas afecta al coste de integrarla por cuadratura. → **Correcto**: el coste crece como $N^d$; con pocas dimensiones más ya se vuelve inabordable (la maldición de la dimensionalidad).
- **Error**: creer que Monte Carlo necesita más muestras cuantas más dimensiones tenga el problema. → **Correcto**: su error depende solo de $N$, no de $d$; lo que cambia con más dimensiones es cuánto cuesta evaluar cada muestra, no cuántas hacen falta para la misma precisión.
- **Error**: esperar que Monte Carlo converja al doble de rápido si se duplican las muestras. → **Correcto**: el error decrece como $1/\sqrt N$, así que para reducirlo a la mitad hace falta multiplicar $N$ por cuatro, no por dos.

## En resumen

- **Qué es**: la integral mide la acumulación (el área bajo la curva) de una función; Monte Carlo la aproxima con muestreo aleatorio cuando no hay fórmula exacta.
- **Para qué sirve**: calcular valores esperados, probabilidades acumuladas o pérdidas totales en problemas con muchas variables.
- **Cómo funciona Monte Carlo**: se promedian muchas evaluaciones de la función en puntos elegidos al azar del dominio.
- **Fórmula clave**: $\mathbb{E}[g(X)]\approx \frac{1}{N}\sum_i g(x_i)$.
- **Cuándo usarlo**: cuando la cuadratura determinista se vuelve inviable por el número de dimensiones (curse of dimensionality).
- **Hiperparámetro que importa**: el número de muestras $N$; el error baja con $1/\sqrt N$, no linealmente.
- **Trampa principal**: confundir "más preciso" con "más rápido"; Monte Carlo siempre converge, pero lentamente.

## A fondo

### Bootstrap: Monte Carlo aplicado a la inferencia

Una aplicación directa de esta idea es el **bootstrap**: para estimar el intervalo de confianza de una media poblacional a partir de una sola muestra, se generan miles de nuevas muestras tomando datos **con reemplazo** de la muestra original, se calcula la media de cada una, y se observa la distribución resultante. Por ejemplo, con las alturas (en cm) de 10 estudiantes cuya media muestral es $168{,}8$, generar 10.000 remuestreos con reemplazo produce una distribución de medias cuyo percentil 2,5 y 97,5 da directamente un intervalo de confianza del 95%, sin necesidad de asumir que los datos siguen una distribución normal. Es la misma lógica que estimar $\pi$ lanzando dardos: no hay fórmula cerrada cómoda, así que se deja que la repetición aleatoria revele el patrón.

## Autoevaluación

### Si duplicas el número de dardos lanzados al estimar $\pi$ por Monte Carlo, ¿qué le pasa al error de la estimación?
- [ ] Se reduce a la mitad.
- [x] Se reduce, pero por un factor de $1/\sqrt 2 \approx 0{,}71$, no a la mitad.
- [ ] No cambia, porque Monte Carlo no depende del número de muestras.
> Por qué: el error de Monte Carlo decrece como $\mathcal{O}(1/\sqrt N)$; duplicar $N$ multiplica el error por $1/\sqrt2$, no por $1/2$. Para reducirlo a la mitad habría que multiplicar $N$ por cuatro.

### Una función de pérdida depende de 500 parámetros. ¿Por qué la cuadratura determinista (rejilla de puntos) es inviable para estimar su integral, pero Monte Carlo sí es factible?
- [ ] Porque Monte Carlo no necesita evaluar la función en ningún punto.
- [x] Porque el coste de una rejilla crece como $N^{500}$, mientras que el número de muestras que necesita Monte Carlo para una precisión dada no depende del número de dimensiones.
- [ ] Porque Monte Carlo solo funciona en un número bajo de dimensiones.
> Por qué: la maldición de la dimensionalidad hace que una cuadrícula con $N$ puntos por eje necesite $N^d$ evaluaciones totales; Monte Carlo, en cambio, mantiene el mismo orden de muestras $N$ independientemente de $d$, aunque cada muestra sea más cara de evaluar.

### En el bootstrap, ¿por qué se muestrea "con reemplazo" a partir de la muestra original en vez de dividirla en trozos sin repetir datos?
- [ ] Porque sin reemplazo la muestra original se agotaría enseguida y no se podrían generar miles de remuestreos del mismo tamaño.
- [ ] Porque con reemplazo los datos se ordenan automáticamente de menor a mayor.
- [x] Ambas: se agotaría la muestra y, además, el reemplazo es lo que permite simular cómo variaría el estimador si se repitiera el muestreo real, generando distintas combinaciones del mismo tamaño que la original.
> Por qué: el objetivo del bootstrap es imitar la variabilidad que tendría el estimador si pudiéramos repetir el experimento de muestreo en la población real; muestrear con reemplazo, y del mismo tamaño que la muestra original, es lo que reproduce esa variabilidad sin necesitar más datos de los que ya se tienen.

## Glosario

- **Integral**: medida de la acumulación de una función sobre un intervalo; geométricamente, el área bajo su curva.
- **Teorema Fundamental del Cálculo**: resultado que conecta derivada e integral como operaciones inversas.
- **Suma de Riemann**: aproximación del área bajo una curva mediante una suma de rectángulos.
- **Maldición de la dimensionalidad**: crecimiento exponencial ($N^d$) del coste de una cuadrícula determinista al aumentar el número de variables.
- **Método de Monte Carlo**: técnica que aproxima una integral o un valor esperado promediando evaluaciones en puntos aleatorios.
- **Ley de los Grandes Números**: garantiza que el promedio de muchas repeticiones de un experimento aleatorio converge al valor esperado teórico.
- **Bootstrap**: técnica de remuestreo con reemplazo sobre una muestra observada, usada para estimar la variabilidad de un estimador.
