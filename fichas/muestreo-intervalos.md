---
id: muestreo-intervalos
estado: borrador
---

## En una frase

Un intervalo de confianza acompaña una estimación con un rango de valores plausibles, y el bootstrap construye ese rango remuestreando los propios datos en vez de aplicar fórmulas.

## Intuición

Imagina que quieres saber la altura media de los 500 alumnos de un instituto, pero solo puedes medir a 30. Ese grupo de 30 es tu **muestra** (*sample*); los 500 alumnos son la **población** que en realidad te interesa. Con esos 30 datos calculas una media, digamos 170 cm, y la usas como aproximación de la media real. Pero sabes que si hubieras elegido a otros 30 alumnos el resultado habría sido distinto —168 cm, 172 cm—, porque depende del azar de quién entró en la muestra.

Por eso no basta con dar un número suelto: hace falta decir cuánto margen de error lleva pegado. Piensa en lanzar dardos a una diana cuyo centro es la media real de la población: cada muestra que tomas es un dardo, y la mayoría caen cerca del centro, pero algunos se desvían. Un **intervalo de confianza** es el círculo alrededor del centro donde, si repitieras el lanzamiento muchas veces, caería el dardo el 95% de las veces. En inteligencia artificial pasa lo mismo: si un modelo acierta el 92% en un test, ese número también es un dardo que depende de qué ejemplos entraron en la muestra de prueba.

## Explicación

### De la muestra al estimador

Casi nunca tienes acceso a la población entera: ni a todos los votantes de un país, ni a todas las imágenes que un sistema de visión verá en su vida útil. Lo único disponible es una muestra, un subconjunto de observaciones tomado de esa población. Si la muestra se elige mal —por ejemplo, encuestando solo a una facultad para hablar de toda una universidad— las conclusiones salen distorsionadas. El **muestreo aleatorio** (*random sampling*), en el que cada individuo tiene la misma probabilidad de entrar, evita ese sesgo de selección.

A partir de la muestra construyes un **estimador puntual**: una regla que traduce los datos observados en un número que aproxima al parámetro real de la población, como usar la media de 30 alturas para aproximar la media de 500. Dos propiedades describen qué tan bueno es ese estimador: el **sesgo**, que mide si tiende a desviarse siempre en la misma dirección del valor real, y la **varianza**, que mide cuánto fluctúa de una muestra a otra. Ese mismo par —sesgo y varianza— reaparecerá cuando evalúes cuánto generaliza un modelo entrenado con datos limitados.

### El margen de incertidumbre

Un estimador puntual da un número, pero ese número cambiaría si repitieras el muestreo. Por eso interesa acompañarlo de un rango: el intervalo de confianza. Un intervalo de confianza al 95% no dice "el parámetro está aquí con un 95% de probabilidad" en un caso concreto; dice que, si repitieras el proceso de muestreo y construcción del intervalo muchas veces, el 95% de esos intervalos contendría el valor verdadero.

Para construirlo hace falta decidir "cuánto abarcar" alrededor de la media muestral, y ahí entra el **valor crítico**: el punto de corte que deja fuera solo el 5% de los casos más raros (2,5% en cada extremo, si repartes el error por igual a ambos lados). Cuando conoces bien la variabilidad de la población o tienes una muestra grande, ese valor crítico sale de la distribución normal ([[dist-normal]]): 1,96 para el 95%. Cuando la muestra es pequeña y no conoces la variabilidad real, usas la **t de Student**, que tiene colas algo más anchas —y por tanto un valor crítico algo mayor— para compensar esa incertidumbre extra.

Cuanto mayor es la muestra, más estrecho puede ser el intervalo sin perder confianza: el tamaño de muestra reduce la variabilidad de la media muestral, no la del dato individual.

### El bootstrap: remuestrear para no depender de fórmulas

Las fórmulas anteriores exigen supuestos —normalidad, tamaño de muestra suficiente— que no siempre se cumplen. El **bootstrap** rodea ese problema: en vez de derivar una fórmula, remuestrea la propia muestra.

El procedimiento es simple. Tienes una muestra de tamaño $n$; generas miles de réplicas, también de tamaño $n$, escogiendo datos **con reemplazo** de la muestra original (un mismo dato puede repetirse varias veces en una réplica, y otros pueden quedar fuera). En cada réplica recalculas el estimador —la media, por ejemplo— y así construyes una distribución empírica de ese estimador. Los percentiles de esa distribución dan directamente un intervalo de confianza, sin necesidad de asumir normalidad.

Con la muestra de notas $\{6, 7, 5, 8, 7, 9, 6, 8, 7, 10\}$, cuya media es 7,3, remuestrear miles de veces con reemplazo produce un intervalo de confianza empírico centrado en torno a esa media, más estrecho cuanto más consistentes sean los datos entre sí.

En inteligencia artificial, el bootstrap tiene un papel doble: sirve para medir cuánto varía el rendimiento de un modelo si lo reentrenas sobre réplicas de sus propios datos de entrenamiento, y es la base del remuestreo que usa el *bagging* al construir cada árbol de un bosque aleatorio ([[bagging-random-forest]]).

## Formalización

$$
IC_{(1-\alpha)} = \bar{X} \pm z_{1-\alpha/2} \cdot \frac{S}{\sqrt{n}}
$$

donde:
- $\bar{X}$: media muestral, el estimador puntual de la media poblacional.
- $z_{1-\alpha/2}$: valor crítico de la distribución normal estándar para el nivel de confianza $1-\alpha$ (1,96 para el 95%); se sustituye por $t_{1-\alpha/2,\,n-1}$ (t de Student con $n-1$ grados de libertad) cuando $n$ es pequeño y $\sigma$ es desconocida.
- $S$: desviación típica muestral.
- $n$: tamaño de la muestra.
- $\alpha$: nivel de significación, la probabilidad de que el intervalo no contenga el parámetro real ($\alpha=0,05$ para una confianza del 95%).

El término $S/\sqrt{n}$ es el **error estándar** de la media: mide cuánto varía la media muestral de una muestra a otra, y se reduce a medida que $n$ crece.

Ejemplo numérico (verificado): un algoritmo se ejecuta 25 veces, con media $\bar{X}=2,1$ s y desviación típica $S=0,5$ s. El error estándar es $0,5/\sqrt{25}=0,1$. Con $t_{0,975,24}\approx 2,064$, el margen es $2,064 \cdot 0,1 = 0,206$, así que el intervalo de confianza al 95% es $2,1 \pm 0,206 = [1,894,\ 2,306]$ segundos.

## Interactivo

```widget
motor: simulacion
modo: "intervalos"
config: {"n": 30, "confianza": 0.95}
semilla: 7
```

- Prueba a sacar 100 muestras y observa qué porcentaje de los intervalos contiene realmente la media poblacional.
- Prueba a reducir $n$ a 5 y observa cómo se ensancha cada intervalo.
- Prueba a subir la confianza al 99% y compara la anchura con la del 95%.

## En código

```python
import math

media = 2.1
s = 0.5
n = 25
se = s / math.sqrt(n)          # error estándar
t_critico = 2.064              # t de Student, 24 grados de libertad, 95%
margen = t_critico * se

print(f"error estandar: {se:.3f}")     # error estandar: 0.100
print(f"margen: {margen:.3f}")         # margen: 0.206
print(f"IC 95%: [{media - margen:.3f}, {media + margen:.3f}]")
# IC 95%: [1.894, 2.306]
```

## Errores típicos

- **Error**: pensar que un intervalo de confianza al 95% significa que hay un 95% de probabilidad de que el parámetro esté dentro de ese intervalo concreto. → **Correcto**: el parámetro no es aleatorio, es fijo; lo aleatorio es el intervalo. El 95% se refiere a la frecuencia con la que el procedimiento acierta si se repite el muestreo muchas veces.
- **Error**: usar el valor crítico de la normal (1,96) aunque la muestra sea pequeña y no se conozca la variabilidad real de la población. → **Correcto**: con $n$ pequeño y $\sigma$ desconocida toca usar la t de Student, cuyo valor crítico es algo mayor para compensar la incertidumbre extra.
- **Error**: confundir el bootstrap con generar datos nuevos inventados. → **Correcto**: el bootstrap remuestrea exclusivamente los datos que ya tienes, con reemplazo; no añade información que no estuviera en la muestra original.
- **Error**: creer que un intervalo más estrecho es siempre mejor. → **Correcto**: un intervalo estrecho pero mal calculado, por ejemplo con una muestra sesgada, puede no contener el valor real; la anchura solo es fiable si el muestreo fue aleatorio y el método correcto.

## En resumen

- Sirve para acompañar una estimación puntual (como una media muestral) con un rango de valores plausibles para el parámetro real de la población.
- Se construye como media muestral ± valor crítico × error estándar; el error estándar es $S/\sqrt{n}$.
- El valor crítico sale de la normal (1,96 al 95%) si $n$ es grande o $\sigma$ se conoce; si no, de la t de Student, algo más ancha.
- Un intervalo al 95% no dice que el parámetro esté dentro con un 95% de probabilidad en ese caso concreto, sino que el procedimiento acierta el 95% de las veces si se repite.
- El bootstrap construye un intervalo remuestreando la propia muestra con reemplazo, sin asumir normalidad ni derivar fórmulas.
- Cuanto mayor es $n$, más estrecho es el intervalo, porque el error estándar decrece con $\sqrt{n}$.
- La trampa principal: usar el valor crítico equivocado (normal en vez de t, o viceversa) según el tamaño de muestra y si se conoce la variabilidad poblacional.

## A fondo

El bootstrap tiene un papel doble en la práctica de la IA. Cuando un conjunto de datos es pequeño, entrenar un modelo una sola vez y reportar su métrica esconde cuánto de ese resultado depende del azar de la partición train/test. Reentrenar sobre réplicas bootstrap del conjunto de entrenamiento y observar cuánto cambia el rendimiento es una forma directa de medir la **estabilidad** del modelo: si el resultado varía mucho entre réplicas, el modelo probablemente no generaliza bien. Esa misma idea, aplicada a la construcción de modelos y no solo a su evaluación, da lugar al *bagging* (*bootstrap aggregating*): entrenar muchos modelos, cada uno sobre una réplica bootstrap distinta del conjunto de datos, y combinar sus predicciones por voto o promedio. Los bosques aleatorios llevan esta idea al extremo, entrenando cada árbol sobre un bootstrap distinto para maximizar la diversidad entre ellos ([[bagging-random-forest]]).

También existe una relación directa entre intervalos de confianza y contraste de hipótesis ([[contraste-hipotesis]]): si el intervalo al 95% para una media no incluye el valor propuesto por la hipótesis nula, el contraste bilateral al 5% resulta significativo. Son dos formas de mirar la misma incertidumbre: el intervalo describe qué valores del parámetro son compatibles con los datos, mientras que el contraste decide si un valor concreto se puede descartar.

## Autoevaluación

### Un intervalo de confianza al 95% para la precisión de un modelo de clasificación es [89%, 95%]. ¿Qué interpretación es correcta?
- [ ] Hay un 95% de probabilidad de que la precisión real del modelo esté entre 89% y 95%
- [x] Si repitiéramos el proceso de muestreo y construcción del intervalo muchas veces, el 95% de esos intervalos contendría la precisión real
- [ ] El modelo acierta exactamente el 92% de las veces, con un margen decorativo
> Por qué: el parámetro poblacional es fijo, no aleatorio; lo aleatorio es el intervalo, que cambia de una muestra a otra. La interpretación frecuentista habla del procedimiento repetido, no de una probabilidad sobre el parámetro en un caso concreto.

### Tienes una muestra de $n=8$ observaciones y no conoces la desviación típica poblacional. ¿Qué valor crítico usas para construir el intervalo de confianza?
- [ ] El de la normal estándar, $z_{1-\alpha/2}$
- [x] El de la t de Student con $n-1=7$ grados de libertad
- [ ] Da igual, ambos dan el mismo resultado
> Por qué: con muestra pequeña y $\sigma$ desconocida, la t de Student refleja mejor la incertidumbre extra, con colas más anchas que la normal; usar $z$ produciría un intervalo demasiado estrecho.

### Duplicas el tamaño de la muestra manteniendo la misma desviación típica. ¿Qué le ocurre al error estándar?
- [ ] Se duplica
- [ ] No cambia
- [x] Se reduce, aproximadamente por un factor de $1/\sqrt{2}$
> Por qué: el error estándar es $S/\sqrt{n}$; al duplicar $n$, el denominador crece en $\sqrt{2}$, así que el error estándar (y el intervalo) se reduce, pero no a la mitad.

### ¿Qué hace exactamente una réplica bootstrap de una muestra de tamaño $n$?
- [ ] Toma $n$ observaciones nuevas de la población real
- [ ] Toma un subconjunto de $n/2$ observaciones distintas de la muestra
- [x] Toma $n$ observaciones de la muestra original, escogidas al azar con reemplazo
> Por qué: el bootstrap no accede a más datos de la población; remuestrea la muestra que ya tienes, con reemplazo, así que algunos datos se repiten y otros quedan fuera en cada réplica.

### El intervalo de confianza al 95% para la diferencia de precisión entre dos modelos no incluye el 0. ¿Qué puedes concluir?
- [ ] Que la diferencia observada es enorme en términos prácticos
- [x] Que el contraste de hipótesis bilateral al 5% sería significativo
- [ ] Que el modelo con mayor precisión es mejor en cualquier circunstancia
> Por qué: hay una relación directa entre intervalos y contrastes: si el intervalo no contiene el valor nulo (aquí, diferencia 0), el contraste al mismo nivel de significación rechaza $H_0$. Pero significativo no es lo mismo que grande ni que "siempre mejor" ([[contraste-hipotesis]]).

## Glosario

- **muestra**: subconjunto finito y accesible de observaciones tomado de una población, usado para estimar sus características.
- **población**: conjunto completo de individuos u observaciones sobre el que se quiere concluir, normalmente inaccesible en su totalidad.
- **estimador puntual**: regla que traduce los datos de una muestra en un único número que aproxima un parámetro de la población.
- **sesgo**: tendencia sistemática de un estimador a desviarse del valor real que intenta aproximar.
- **error estándar**: desviación típica de un estimador, como la media muestral, a través de repeticiones del muestreo; decrece con $\sqrt{n}$.
- **valor crítico**: punto de corte de una distribución que deja fuera la probabilidad de error deseada; define la anchura de un intervalo de confianza.
- **bootstrap**: método que remuestrea con reemplazo la propia muestra para aproximar la distribución de un estimador sin fórmulas ni supuestos de normalidad.
