---
id: dist-poisson
estado: borrador
---

## En una frase

La distribución de Poisson calcula la probabilidad de que ocurra un número concreto de eventos raros e independientes en un intervalo fijo de tiempo o espacio, conociendo solo su frecuencia media.

## Intuición

Imagina un call center que recibe en promedio 10 llamadas por minuto. No sabes cuántas llamadas llegarán exactamente en el siguiente minuto, pero sí puedes calcular qué tan probable es cada número concreto: 8, 10, 15 o incluso 40 llamadas. La **distribución de Poisson** responde a ese tipo de pregunta, y solo necesita un dato: la tasa media de ocurrencia, $\lambda$.

A diferencia de la [[dist-binomial|binomial]], que necesita saber cuántas "oportunidades" hay para que ocurra el evento, la Poisson no exige conocer ese número: basta con la frecuencia media observada. Por eso es tan útil para modelar accesos a un servidor, fallos de una máquina o intentos de intrusión en una red: situaciones donde contar "oportunidades" no tendría sentido, pero medir una tasa sí.

## Explicación

### Tres condiciones para que aparezca

La distribución de Poisson surge cuando se cumplen tres condiciones. Primero, los sucesos son **independientes**: que ocurra uno no afecta la probabilidad de que ocurra otro. Segundo, la probabilidad de que aparezcan varios sucesos en un intervalo muy pequeño es prácticamente nula, lo que refleja que se trata de **eventos raros** en cada instante concreto. Tercero, la frecuencia promedio es estable: existe un valor $\lambda$ que representa el número medio de sucesos esperados por intervalo. Cuando estas tres condiciones se cumplen, el conteo de eventos sigue de forma natural una distribución de Poisson: llamadas a un call center, fallos de una máquina en un turno, o fotones que llegan a un sensor.

### Cómo cambia su forma con $\lambda$

Cuando $\lambda$ es bajo, la distribución es claramente asimétrica: la mayoría de los intervalos tienen cero o un suceso, y observar dos o más es raro. A medida que $\lambda$ crece, la distribución se ensancha y gana simetría, acercándose a la forma de una [[dist-normal|normal]]. Un accidente al mes en un cruce concreto produce una distribución muy sesgada hacia cero; trescientos accidentes al mes en una ciudad entera producen una distribución casi simétrica alrededor de 300.

### Por qué importa en inteligencia artificial

La Poisson es central en el **modelado de conteos**: accesos a un servidor por segundo, defectos detectados en una cadena de montaje, o intentos anómalos de intrusión en un intervalo dado. Su utilidad práctica está en fijar umbrales de alarma: si el modelo dice que en promedio llegan 10 accesos por minuto y de repente se observan 40, ese valor resulta muy improbable según la Poisson, lo que permite detectarlo como una anomalía. Así, convierte una tasa media abstracta en un marco probabilístico completo para distinguir lo normal de lo sospechoso.

## Formalización

$$
P(X=k) = \frac{\lambda^k e^{-\lambda}}{k!}
$$

donde:

- $X$ es la variable aleatoria que cuenta el número de sucesos en el intervalo.
- $\lambda$ es la tasa media de sucesos esperados por intervalo (el único parámetro de la distribución).
- $k$ es el número concreto de sucesos cuya probabilidad se calcula, con $k=0,1,2,\dots$
- $e$ es la constante de Euler y $k!$ el factorial de $k$.

Su media y su varianza coinciden y son ambas iguales a $\lambda$: $E[X]=\mathrm{Var}(X)=\lambda$.

**Ejemplo numérico:** si un servidor recibe en promedio $\lambda=2$ peticiones por segundo, la probabilidad de recibir exactamente $k=3$ peticiones en un segundo dado es

$$
P(X=3) = \frac{2^3\, e^{-2}}{3!} = \frac{8 \cdot 0{,}1353}{6} \approx 0{,}180
$$

## Interactivo

```widget
motor: funcion
modo: discreta
funciones: [{"expr": "lambda^x*exp(-lambda)/fact(x)", "etiqueta": "P(X=k)"}]
parametros: [{"nombre": "lambda", "min": 0.5, "max": 30, "paso": 0.5, "valor": 2, "etiqueta": "tasa media (lambda)"}]
x: [0, 30]
```

- Prueba a poner $\lambda=1$: la mayor probabilidad está en $k=0$ o $k=1$, con una cola larga hacia la derecha.
- Prueba a subir $\lambda$ a 20: la distribución se ensancha y se vuelve casi simétrica, pareciéndose a una normal.
- Prueba a fijarte en que el pico de la distribución se mueve junto con $\lambda$, ya que la media siempre coincide con $\lambda$.

## En código

```python
from math import exp, factorial

lam = 2  # tasa media de peticiones por segundo
probs = [lam**k * exp(-lam) / factorial(k) for k in range(8)]
print([round(p, 3) for p in probs])
# [0.135, 0.271, 0.271, 0.18, 0.09, 0.036, 0.012, 0.003]
```

## Errores típicos

- **Error**: usar la Poisson cuando los eventos no son independientes, como en una avalancha de errores causados por un único fallo raíz. → **Correcto**: la Poisson asume que cada suceso ocurre sin relación con los demás; eventos que se disparan en cadena rompen esa hipótesis.
- **Error**: confundir la binomial y la Poisson pensando que ambas necesitan un número fijo de "intentos". → **Correcto**: la binomial necesita $n$ intentos conocidos; la Poisson solo necesita la tasa media $\lambda$ y no requiere conocer cuántas oportunidades había.
- **Error**: asumir que la Poisson siempre tiene forma muy asimétrica. → **Correcto**: su asimetría depende de $\lambda$; con $\lambda$ grande se vuelve prácticamente simétrica, similar a una normal.
- **Error**: usar la misma $\lambda$ para intervalos de duración distinta (por ejemplo, la tasa por minuto para calcular probabilidades por hora sin ajustar). → **Correcto**: $\lambda$ debe escalarse proporcionalmente a la duración del intervalo que se esté analizando.

## En resumen

- **Qué es:** la probabilidad de observar exactamente $k$ sucesos raros e independientes en un intervalo fijo, dada su tasa media $\lambda$.
- **Condiciones:** sucesos independientes, poco frecuentes en cada instante, con una tasa media estable.
- **Fórmula clave:** $P(X=k) = \dfrac{\lambda^k e^{-\lambda}}{k!}$, con $E[X]=\mathrm{Var}(X)=\lambda$.
- **Cuándo usarla:** conteos de eventos en el tiempo o el espacio, como accesos a un servidor o defectos de producción, cuando no hace falta conocer un número fijo de "intentos".
- **Cómo cambia:** con $\lambda$ baja es muy asimétrica; con $\lambda$ alta se acerca a una normal.
- **Trampa principal:** aplicar la misma $\lambda$ a intervalos de duración distinta sin reescalarla.

## A fondo

### Poisson frente a binomial en detección de intrusos

La elección entre binomial y Poisson depende de cómo se plantea el problema. Si analizas exactamente 100 conexiones ya registradas y cuentas cuántas son maliciosas, tienes un número fijo de intentos: es un caso de binomial. Si en cambio observas la frecuencia con la que saltan alarmas en un flujo continuo de tiempo, sin un número de "intentos" predefinido, el modelo natural es la Poisson. Ambas distribuciones convergen quando $n$ es grande y $p$ pequeño en la binomial (con $\lambda \approx np$), lo que explica por qué a veces se usan casi de forma intercambiable en ese régimen.

## Autoevaluación

### Un sensor detecta en promedio 4 defectos por hora en una cadena de montaje. ¿Qué necesitas conocer para modelar el número de defectos por hora con una Poisson?
- [ ] El número total de piezas que pasan por la cadena esa hora.
- [x] Solo la tasa media $\lambda=4$; no hace falta saber cuántas "oportunidades" de defecto hubo.
- [ ] La probabilidad de defecto por pieza individual.
> Por qué: a diferencia de la binomial, la Poisson no necesita el número de intentos ni la probabilidad por intento; basta con la tasa media de sucesos por intervalo.

### Si $\lambda$ pasa de 2 a 50, ¿qué esperas que le ocurra a la forma de la distribución de Poisson?
- [ ] Se vuelve más asimétrica todavía.
- [x] Se ensancha y se vuelve casi simétrica, pareciéndose a una distribución normal.
- [ ] No cambia de forma, solo de escala.
> Por qué: la asimetría de la Poisson es marcada solo cuando $\lambda$ es baja (eventos raros); al crecer $\lambda$, la distribución gana simetría y se aproxima a una campana normal.

### Un sistema de monitorización espera en promedio 5 accesos por minuto a un servidor y de repente observa 30 en un minuto. ¿Cómo interpretarías esto con una Poisson de $\lambda=5$?
- [ ] Como un resultado perfectamente normal, ya que cualquier valor de $k$ es posible.
- [x] Como un valor muy improbable según el modelo, lo que sugiere investigar una posible anomalía.
- [ ] Como una señal de que $\lambda$ debe ser 30 a partir de ahora sin más análisis.
> Por qué: con $\lambda=5$, la probabilidad de observar $k=30$ es extremadamente baja; ese desajuste entre lo observado y lo esperado es justo el tipo de señal que un sistema de detección de anomalías usa para levantar una alerta, sin necesidad de asumir automáticamente que la tasa base ha cambiado.

## Glosario

- **Distribución de Poisson**: distribución de probabilidad del número de sucesos independientes y raros en un intervalo fijo, dada su tasa media $\lambda$.
- **Tasa media**: número esperado de sucesos por intervalo, denotado $\lambda$; único parámetro de la distribución de Poisson.
