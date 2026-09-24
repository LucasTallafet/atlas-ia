---
id: dist-normal
estado: borrador
---

## En una frase

La distribución normal, o campana de Gauss, describe variables cuyos valores se agrupan de forma simétrica alrededor de una media, y aparece constantemente porque es el resultado natural de sumar muchos factores aleatorios independientes.

## Intuición

Si mides la altura de miles de personas, verás que la mayoría se agrupa cerca de un valor central y que los extremos (muy bajas o muy altas) son raros por igual en ambas direcciones. Esa forma de campana, simétrica y con colas que decrecen suavemente, es la **distribución normal**. No es solo una curiosidad estadística: aparece una y otra vez porque cuando muchos factores pequeños e independientes se suman —el ruido de un sensor, los errores de medición, las variaciones de miles de píxeles—, el resultado tiende a esa misma forma de campana, sea cual sea la naturaleza de cada factor individual.

En IA, esta regularidad se aprovecha para modelar ruido, inicializar pesos de redes neuronales y justificar técnicas estadísticas que, de otro modo, requerirían conocer la distribución exacta de los datos.

## Explicación

### Una forma definida por dos números

La campana de Gauss es simétrica alrededor de su centro: los valores cercanos a él son los más probables, y la probabilidad decae gradualmente hacia los extremos. Toda esa forma queda fijada con solo dos parámetros: la **media** ($\mu$), que marca el centro, y la **desviación estándar** ($\sigma$), que marca la anchura. Una $\sigma$ pequeña da una campana alta y estrecha (datos muy agrupados); una $\sigma$ grande da una campana baja y ancha (datos más dispersos).

### Por qué es tan frecuente: el Teorema Central del Límite

El motivo de que la normal aparezca en tantos contextos distintos es el **Teorema Central del Límite** (TCL): si tomas muchas muestras de una población —sea cual sea su distribución original— y calculas la media de cada muestra, la distribución de esas medias tiende a una normal a medida que crece el tamaño de la muestra. Esto ocurre incluso si los datos originales son muy asimétricos, como una distribución exponencial. Un ejemplo casero: la distribución de un solo dado es plana (todos los valores igual de probables), pero la distribución de la media de varios lanzamientos ya empieza a parecerse a una campana, y se afina más cuantos más lanzamientos promedies.

El TCL tiene una consecuencia práctica muy usada en estadística: la dispersión de las medias muestrales disminuye con el tamaño de la muestra, según $\sigma_{\bar X} = \sigma/\sqrt{n}$. Esto permite estimar con fiabilidad una media poblacional y construir intervalos de confianza sin conocer la distribución exacta de los datos originales.

### Por qué importa en inteligencia artificial

La normal aparece en IA no porque los datos reales siempre lo sean, sino porque cumple un papel estructural. En **regresión**, asumir errores normales permite calcular intervalos de confianza. En modelos **bayesianos**, es la elección habitual como prior por su facilidad de cálculo. En redes neuronales, se usa para generar **ruido gaussiano** que robustece el entrenamiento y para **inicializar pesos** alrededor de cero, evitando que el aprendizaje arranque sesgado. En reconocimiento de voz o de imagen, el ruido de múltiples fuentes distintas (iluminación, interferencias, compresión) termina pareciéndose a ruido gaussiano al combinarse, aunque cada fuente individual no siga esa forma.

## Formalización

$$
f(x \mid \mu, \sigma^2) = \frac{1}{\sqrt{2\pi\sigma^2}}\, e^{-\frac{(x-\mu)^2}{2\sigma^2}}
$$

donde:

- $x$ es el valor de la variable aleatoria.
- $\mu$ es la media, que determina el centro de la campana.
- $\sigma^2$ es la varianza y $\sigma$ la desviación estándar, que determinan la anchura de la campana.
- $\pi$ y $e$ son las constantes matemáticas habituales.
- $\frac{1}{\sqrt{2\pi\sigma^2}}$ es el factor de normalización que asegura que el área bajo toda la curva sea 1.

$$
\sigma_{\bar X} = \frac{\sigma}{\sqrt{n}}
$$

donde:

- $\sigma_{\bar X}$ es la desviación estándar de la distribución de medias muestrales (el [[muestreo-intervalos|error estándar]]).
- $\sigma$ es la desviación estándar de la población original.
- $n$ es el tamaño de cada muestra.

**Ejemplo numérico:** para una normal estándar ($\mu=0$, $\sigma=1$), la densidad en $x=1$ vale

$$
f(1) = \frac{1}{\sqrt{2\pi}}\, e^{-1/2} \approx 0{,}242
$$

Este valor no es una probabilidad; solo indica la altura de la curva en ese punto. Para obtener una probabilidad haría falta integrar $f(x)$ en un intervalo, como se ve en [[variable-aleatoria]].

## Interactivo

```widget
motor: funcion
modo: densidad
funciones: [{"expr": "1/sqrt(2*pi*s^2)*exp(-(x-m)^2/(2*s^2))", "etiqueta": "f(x | mu, sigma)"}]
parametros: [{"nombre": "m", "min": -3, "max": 3, "paso": 0.1, "valor": 0, "etiqueta": "media (mu)"}, {"nombre": "s", "min": 0.3, "max": 3, "paso": 0.1, "valor": 1, "etiqueta": "desviación (sigma)"}]
x: [-6, 6]
sombrear: {"desde": "m-s", "hasta": "m+s"}
```

- Prueba a mover $\mu$ y observa cómo se desplaza el centro de la campana sin cambiar su forma.
- Prueba a reducir $\sigma$ al mínimo: la campana se vuelve alta y estrecha, señal de datos muy concentrados.
- Prueba a fijarte en el área sombreada entre $\mu-\sigma$ y $\mu+\sigma$: representa siempre la misma proporción de datos, sea cual sea $\sigma$.

## En código

```python
import random

# Simulación del Teorema Central del Límite: medias de muestras de un dado
random.seed(0)
medias = [sum(random.randint(1, 6) for _ in range(10)) / 10 for _ in range(5000)]

media_de_medias = sum(medias) / len(medias)
print(round(media_de_medias, 2))  # cercano a 3.5, la media teórica del dado
```

## Errores típicos

- **Error**: pensar que $f(x)$ en un punto es la probabilidad de ese valor. → **Correcto**: en una distribución continua, $f(x)$ es una densidad; la probabilidad exacta de un valor puntual es cero, como se explica en [[variable-aleatoria]].
- **Error**: creer que el Teorema Central del Límite dice que los *datos originales* se vuelven normales al aumentar la muestra. → **Correcto**: lo que se vuelve normal es la distribución de las *medias* de muchas muestras, no los datos individuales.
- **Error**: asumir que cualquier variable con forma de campana es exactamente normal. → **Correcto**: hay otras distribuciones simétricas y acampanadas (como la t de Student); "parece una campana" no basta para identificarla como normal.
- **Error**: aplicar técnicas que asumen normalidad (como ciertos intervalos de confianza) sin comprobar si es razonable. → **Correcto**: conviene visualizar los datos o apoyarse en el TCL, que garantiza normalidad en las medias muestrales, no en los datos brutos.

## En resumen

- **Qué es:** la distribución de probabilidad simétrica en forma de campana, definida por su media y su desviación estándar.
- **Por qué aparece tanto:** el Teorema Central del Límite garantiza que la media de muchas muestras tiende a una normal, sea cual sea la distribución original.
- **Fórmula clave:** $f(x\mid\mu,\sigma^2) = \frac{1}{\sqrt{2\pi\sigma^2}} e^{-(x-\mu)^2/(2\sigma^2)}$.
- **Cuándo usarla:** para modelar ruido, errores de medición o cualquier variable que resulte de sumar muchos efectos pequeños e independientes.
- **Decisión que importa:** $\mu$ fija el centro y $\sigma$ la anchura; ambos son los únicos parámetros que hacen falta.
- **Trampa principal:** confundir la densidad $f(x)$ con una probabilidad, y confundir "las medias son normales" con "los datos son normales".

## A fondo

### El Teorema Central del Límite en la práctica

Con muestras pequeñas ($n=5$), la distribución de las medias todavía refleja la asimetría de la población original si esta era muy sesgada (por ejemplo, exponencial). Con $n=30$ ya se ve bastante simétrica, y con $n=100$ es prácticamente normal. Esta convergencia gradual es la razón por la que muchas reglas prácticas en estadística piden un tamaño mínimo de muestra (a menudo se cita $n\geq 30$) antes de aplicar técnicas basadas en normalidad, aunque el número exacto depende de cuánto se aleje la población original de la simetría.

Es importante no sobrestimar lo que da el TCL: garantiza la forma de la distribución de las medias y permite estimar la media poblacional con fiabilidad creciente, pero no dice nada directo sobre la varianza de la población original ni sobre la probabilidad de un dato individual en la escala original.

## Autoevaluación

### Si $\sigma$ de una distribución normal se reduce a la mitad manteniendo $\mu$ igual, ¿qué le pasa a la campana?
- [ ] Se desplaza hacia la derecha.
- [x] Se vuelve más alta y estrecha: los datos se concentran más cerca de la media.
- [ ] Se aplana y ensancha.
> Por qué: $\sigma$ controla la dispersión, no la posición; reducirla concentra la probabilidad más cerca del centro, lo que visualmente estrecha y aumenta la altura de la campana (el área total sigue sumando 1).

### Una población de tiempos de espera sigue una distribución muy asimétrica (exponencial). Tomas 200 muestras de tamaño 40 y calculas la media de cada una. ¿Qué forma esperas que tenga la distribución de esas 200 medias?
- [ ] Exponencial, igual que la población original.
- [x] Aproximadamente normal, por el Teorema Central del Límite.
- [ ] Uniforme, porque el muestreo aleatoriza la forma.
> Por qué: el TCL garantiza que la distribución de las medias muestrales tiende a la normalidad a medida que crece $n$, sea cual sea la forma de la población original; con $n=40$ ya se espera una aproximación razonable.

### ¿Qué representa el valor $f(0)$ en una normal estándar ($\mu=0,\sigma=1$)?
- [ ] La probabilidad de que $X$ valga exactamente 0.
- [x] La altura de la curva de densidad en $x=0$, no una probabilidad.
- [ ] La probabilidad acumulada hasta 0.
> Por qué: en variables continuas la probabilidad de un valor exacto es cero; $f(0)\approx 0{,}399$ es solo la altura de la densidad, útil para comparar puntos entre sí, no para leerse directamente como probabilidad.

## Glosario

- **Distribución normal (campana de Gauss)**: distribución de probabilidad simétrica definida por su media $\mu$ y su desviación estándar $\sigma$.
- **Teorema Central del Límite (TCL)**: resultado que garantiza que la distribución de las medias de muchas muestras tiende a una normal, sea cual sea la distribución original de la población.
- **Ruido gaussiano**: variación aleatoria que sigue una distribución normal, habitual como modelo de imperfecciones en sensores o señales.
