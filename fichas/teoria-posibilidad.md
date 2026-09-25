---
id: teoria-posibilidad
estado: borrador
---

## En una frase

La teoría de la posibilidad mide cuán plausible es un suceso concreto dado lo que sabes, en vez de con qué frecuencia ocurriría a largo plazo, como hace la [[probabilidad]].

## Intuición

Cuando alguien dice "es muy posible que llueva mañana" por el aspecto de las nubes, no está dando un porcentaje calculado con datos históricos: está evaluando cuán compatible es la lluvia con lo que observa ahora mismo. Eso es exactamente lo que formaliza la **teoría de la posibilidad**, propuesta también por Lotfi Zadeh (1978) como extensión natural de la [[logica-difusa|lógica difusa]]: en vez de exigir una distribución de probabilidad completa, asigna a cada suceso un grado de plausibilidad basado en la información disponible, aunque sea escasa o cualitativa.

Importa en IA porque no todos los problemas con incertidumbre tienen datos suficientes para estimar probabilidades fiables. Cuando la información es limitada o se expresa en términos cualitativos ("posible", "muy plausible"), la teoría de la posibilidad ofrece un marco matemático distinto de la probabilidad para razonar igualmente con rigor.

## Explicación

### Dos preguntas distintas sobre la incertidumbre

La probabilidad responde a "¿con qué frecuencia ocurre esto a largo plazo?": necesita datos históricos o un modelo bien definido, y exige que las probabilidades de sucesos mutuamente excluyentes sumen $1$. La posibilidad responde a otra pregunta: "¿cuán compatible es este suceso concreto con lo que sé ahora?". No exige esa suma: varios sucesos pueden tener una posibilidad alta a la vez, y esto le da más flexibilidad para modelar información incompleta o ambigua, a costa de una interpretación menos precisa que la de una probabilidad calculada con datos.

### Función de posibilidad y función de necesidad

La teoría se apoya en dos funciones, ambas con valores en $[0,1]$. La **función de posibilidad**, $\Pi(A)$, mide cuán plausible es que ocurra el suceso $A$; su propiedad clave es que el máximo valor entre todos los sucesos posibles siempre es $1$ (al menos uno debe considerarse completamente posible). La **función de necesidad**, $N(A)$, mide cuán obligado está a ocurrir $A$ para que la situación sea coherente con lo que se sabe: se relaciona con la posibilidad de que *no* ocurra (fórmula en Formalización). Una posibilidad alta no implica necesidad alta: que llueva sea muy plausible no significa que sea seguro.

### Cuándo elegir posibilidad en vez de probabilidad

La teoría de la posibilidad conviene cuando los datos históricos son escasos o inexistentes, pero sí hay conocimiento cualitativo del dominio. Su conexión con la lógica difusa es directa: las funciones de pertenencia de un conjunto difuso pueden interpretarse como funciones de posibilidad, lo que permite integrar ambos enfoques en el mismo sistema.

## Formalización

$$
N(A) = 1 - \Pi(\neg A)
$$

donde:

- $\Pi(A)$ es la función de posibilidad del suceso $A$, con valores en $[0,1]$.
- $\neg A$ es el complemento de $A$: que el suceso no ocurra.
- $\Pi(\neg A)$ es la posibilidad de que $A$ no ocurra.
- $N(A)$ es la función de necesidad de $A$: si la posibilidad de que no ocurra es baja, la necesidad de que sí ocurra es alta.

## Errores típicos

- **Error**: pensar que posibilidad y probabilidad son sinónimos con otro nombre. → **Correcto**: la probabilidad exige que las de sucesos mutuamente excluyentes sumen 1; la posibilidad no, y varios sucesos pueden tener posibilidad alta a la vez.
- **Error**: creer que si $\Pi(A)$ es alto, entonces $A$ es necesario. → **Correcto**: alta posibilidad solo indica que $A$ es plausible; la necesidad exige además que su complemento sea poco posible, $N(A)=1-\Pi(\neg A)$.
- **Error**: usar teoría de la posibilidad cuando ya hay datos históricos suficientes. → **Correcto**: con datos abundantes, la probabilidad da estimaciones más precisas y verificables; la posibilidad es preferible cuando la información es cualitativa o escasa.

## En resumen

- Qué es: un marco matemático, alternativo a la probabilidad, para razonar con incertidumbre cuando los datos son escasos o la información es cualitativa.
- Cómo funciona: asigna a cada suceso un grado de posibilidad $\Pi(A)\in[0,1]$ (cuán plausible es) y, a partir de él, un grado de necesidad $N(A)$ (cuán obligado está a ocurrir).
- Fórmula clave: $N(A) = 1-\Pi(\neg A)$.
- Diferencia con la probabilidad: no exige que las posibilidades de sucesos excluyentes sumen 1, así que varios sucesos pueden ser muy posibles a la vez.
- Úsala cuando falten datos históricos pero exista conocimiento cualitativo del dominio; para dominios con datos abundantes, la probabilidad es más precisa.
- Trampa principal: confundir "muy posible" con "seguro" (alta posibilidad no implica alta necesidad).

## A fondo

La incertidumbre que maneja la teoría de la posibilidad suele clasificarse como **incertidumbre epistémica**: la que surge por falta de conocimiento y que, en principio, se reduce con más datos o un mejor modelo. Se distingue de la **incertidumbre aleatoria** (o inherente), que es intrínseca al fenómeno —como el resultado de lanzar una moneda— y no desaparece por mucha información adicional que se tenga. La probabilidad puede representar ambos tipos, pero la teoría de la posibilidad se centra en la epistémica, precisamente la que resulta de información incompleta o imprecisa.

Existe además otra forma de cuantificar la incertidumbre, propia de la teoría de la información: la **entropía de Shannon**, $H(X) = -\sum_i p(x_i)\log_2 p(x_i)$, que mide cuánta incertidumbre hay en una variable aleatoria a partir de su distribución de probabilidad. Una moneda perfectamente equilibrada tiene entropía máxima ($1$ bit), mientras que una moneda muy sesgada hacia un resultado tiene menos ($\approx 0{,}47$ bits con un 90 % de sesgo): cuanto más predecible el resultado, menor la incertidumbre. A diferencia de la entropía, que exige una distribución de probabilidad completa, la posibilidad y la necesidad permiten expresar el mismo tipo de idea —cuán impredecible es algo— sin necesitar esa distribución, apoyándose en grados de plausibilidad cualitativos.

## Autoevaluación

### Un pronóstico dice que es "posible" que nieve mañana y también "posible" que haga sol. ¿Es esto un problema para la teoría de la posibilidad?
- [ ] Sí: si dos sucesos excluyentes tienen posibilidad alta, el modelo es inconsistente.
- [x] No: a diferencia de la probabilidad, la teoría de la posibilidad no exige que las posibilidades de sucesos excluyentes sumen 1.
- [ ] Sí, porque solo un suceso puede tener $\Pi(A)=1$ en todo el sistema.
> Por qué: la posibilidad mide plausibilidad individual de cada suceso dado el conocimiento disponible, no una frecuencia relativa; varios sucesos pueden considerarse muy posibles a la vez sin contradicción.

### Si $\Pi(\text{lluvia}) = 0{,}9$ y $\Pi(\text{no lluvia}) = 0{,}5$, ¿cuánto vale $N(\text{lluvia})$?
- [ ] $0{,}9$
- [x] $0{,}5$
- [ ] $0{,}1$
> Por qué: $N(\text{lluvia}) = 1 - \Pi(\neg\text{lluvia}) = 1 - 0{,}5 = 0{,}5$; la necesidad depende de la posibilidad del complemento, no de la posibilidad del propio suceso.

### Un analista tiene que estimar el riesgo de un evento nuevo, sin precedentes históricos, basándose solo en la opinión cualitativa de varios expertos. ¿Qué enfoque encaja mejor?
- [ ] La probabilidad clásica, porque siempre es más rigurosa que cualquier alternativa.
- [x] La teoría de la posibilidad, porque no exige datos históricos y puede trabajar con evaluaciones cualitativas de plausibilidad.
- [ ] Ninguno de los dos: sin datos históricos no se puede modelar la incertidumbre.
> Por qué: la teoría de la posibilidad está pensada precisamente para escenarios con información limitada o cualitativa, donde estimar una probabilidad precisa no es viable.

## Glosario

- **función de posibilidad ($\Pi$)**: mide cuán plausible es un suceso dado el conocimiento disponible, sin exigir que las posibilidades de sucesos excluyentes sumen 1.
- **función de necesidad ($N$)**: mide cuán obligado está a ocurrir un suceso para que la situación sea coherente con lo que se sabe; se calcula como $1-\Pi(\neg A)$.
- **incertidumbre epistémica**: incertidumbre que surge por falta de conocimiento y que puede reducirse con más datos o un mejor modelo.
- **incertidumbre aleatoria**: incertidumbre intrínseca a un fenómeno, que no se elimina aunque se tenga información completa sobre él.
