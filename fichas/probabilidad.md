---
id: probabilidad
estado: borrador
---

## En una frase

La probabilidad asigna a cada suceso posible un número entre 0 y 1 que respeta tres reglas fijas (los axiomas de Kolmogórov), y es el lenguaje que usan los modelos de IA para expresar incertidumbre.

## Intuición

Cuando lanzas un dado, no sabes qué número saldrá, pero sí sabes que "seguro" sale alguno de los seis, que ninguno puede tener probabilidad negativa, y que la chance de sacar un 2 o un 4 es la suma de sacar cada uno por separado. Estas tres ideas, tan intuitivas que parecen de sentido común, son exactamente las reglas que en 1933 el matemático Andréi Kolmogórov convirtió en los cimientos formales de toda la probabilidad moderna.

En IA, casi cualquier salida de un modelo es una probabilidad: la confianza de que un correo sea spam, la certeza con la que un clasificador elige una etiqueta, la creencia de un agente sobre qué acción tomar. Que esos números cumplan siempre las mismas reglas es lo que permite combinarlos, compararlos y tomar decisiones con ellos de forma coherente.

## Explicación

### Experimento aleatorio, espacio muestral y la regla de Laplace

Un **experimento aleatorio** es un proceso repetible cuyo resultado no se puede predecir con certeza, como lanzar un dado. El **espacio muestral** $\Omega$ es el conjunto de todos sus resultados posibles, y un **evento** es cualquier subconjunto de $\Omega$ que nos interese (por ejemplo, "sacar un número par"). Cuando todos los resultados son igual de probables, la **regla de Laplace** da la probabilidad de un evento como casos favorables entre casos posibles: $P(A)=|A|/|\Omega|$.

### Combinar eventos: unión, intersección y complemento

La **unión** $A\cup B$ ocurre cuando pasa $A$, $B$ o ambos; la **intersección** $A\cap B$, cuando pasan los dos a la vez; el **complemento** $A^c$, cuando no pasa $A$. Como al sumar $P(A)+P(B)$ se cuenta dos veces lo que está en ambos, la probabilidad de la unión se corrige restando la intersección: $P(A\cup B)=P(A)+P(B)-P(A\cap B)$.

### Independencia: cuándo un suceso no cambia la probabilidad de otro

Dos eventos son **independientes** si conocer que ocurrió uno no altera la probabilidad del otro, lo que se traduce en $P(A\cap B)=P(A)\cdot P(B)$ (por ejemplo, dos dados distintos). Son **dependientes** cuando sí se influyen, como al sacar dos bolas de una bolsa sin devolver la primera. Muchos modelos probabilísticos —Naive Bayes entre ellos— asumen independencia entre variables para simplificar cálculos que, de otro modo, serían intratables.

### Tres formas de entender qué es una probabilidad

La interpretación **clásica** (Laplace) cuenta casos favorables entre posibles, pero solo funciona si todos son igual de probables. La **frecuentista** entiende $P(A)$ como el límite de la frecuencia relativa al repetir el experimento muchas veces: es la base de entrenar modelos con miles de ejemplos. La **bayesiana** interpreta la probabilidad como un grado de creencia que se actualiza con nueva evidencia, como un filtro de spam que ajusta sus creencias con cada correo nuevo. Las tres conviven en IA según el contexto.

### Los axiomas de Kolmogórov: la base común

Para unificar todas estas intuiciones, Kolmogórov definió la probabilidad como una función $P:\mathcal{F}\to[0,1]$ que cumple tres reglas mínimas: no negatividad, normalización (el espacio muestral completo tiene probabilidad 1) y aditividad (para eventos que no pueden ocurrir a la vez, la probabilidad de "uno u otro" es la suma de sus probabilidades). De estas tres reglas se deduce el resto: que $P(A^c)=1-P(A)$, que $P(\emptyset)=0$, que $A\subseteq B$ implica $P(A)\le P(B)$, y la fórmula de la unión de eventos no disjuntos.

## Formalización

$$
P(A) = \frac{\text{casos favorables}}{\text{casos posibles}} \qquad\qquad P(A\cup B) = P(A)+P(B)-P(A\cap B)
$$

donde:

- $\Omega$ es el espacio muestral: todos los resultados posibles de un experimento aleatorio.
- $A, B$ son eventos: subconjuntos de $\Omega$.
- $P(A\cap B)$ es la probabilidad de que ocurran $A$ y $B$ a la vez.

$$
P:\mathcal{F}\longrightarrow[0,1] \qquad
\begin{cases}
1)\ P(A)\ge 0 \\
2)\ P(\Omega)=1 \\
3)\ P\Big(\bigcup_{i=1}^n A_i\Big)=\sum_{i=1}^n P(A_i) \text{ si los } A_i \text{ son disjuntos}
\end{cases}
$$

donde:

- $\mathcal{F}$ es la colección de todos los eventos posibles sobre $\Omega$.
- Los tres casos son los axiomas de Kolmogórov: no negatividad, normalización y aditividad.
- $A_i$ son eventos mutuamente excluyentes (disjuntos entre sí).

## Interactivo

```widget
motor: probabilidad
modo: venn
valores: {"pA": 0.5, "pB": 0.3333, "pAB": 0.1667, "etiquetaA": "par", "etiquetaB": "mayor que 4"}
```

- Prueba a ajustar $P(A\cap B)$ hasta cero: ¿qué significa geométricamente que los dos círculos dejen de solaparse?
- Prueba a fijarte en cuánto vale $P(A\cup B)$ cuando $A$ y $B$ son independientes frente a cuando están muy solapados.
- Prueba a calcular a mano $P(A\cup B)$ con la fórmula antes de comprobar el resultado en el diagrama.

## En código

```python
# Espacio muestral de un dado: {1,...,6}, todos igual de probables (Laplace)
omega = set(range(1, 7))
A = {2, 4, 6}          # número par
B = {5, 6}             # mayor que 4

pA = len(A) / len(omega)
pB = len(B) / len(omega)
pAB = len(A & B) / len(omega)
pA_or_B = pA + pB - pAB

print(pA, pB, pAB, pA_or_B)   # 0.5 0.3333333333333333 0.16666666666666666 0.6666666666666666
```

## Errores típicos

- **Error**: sumar $P(A)+P(B)$ para obtener $P(A\cup B)$ sin más. → **Correcto**: si $A$ y $B$ pueden ocurrir a la vez, hay que restar $P(A\cap B)$ para no contar dos veces los casos comunes.
- **Error**: confundir independencia con que dos eventos no tengan intersección. → **Correcto**: independencia significa $P(A\cap B)=P(A)\cdot P(B)$; dos eventos disjuntos ($A\cap B=\emptyset$) son en realidad el caso opuesto: si ambos tienen probabilidad positiva, saber que ocurrió uno garantiza que el otro no ocurrió, así que son fuertemente dependientes.
- **Error**: usar la interpretación clásica (casos favorables/posibles) en situaciones donde los resultados no son equiprobables, como un dado cargado o la probabilidad de que un correo sea spam. → **Correcto**: ahí hace falta la interpretación frecuentista (estimar a partir de datos) o bayesiana (combinar con creencias previas).

## En resumen

- **Qué es**: una asignación de números entre 0 y 1 a los eventos de un experimento aleatorio, sujeta a tres reglas fijas.
- **Para qué sirve**: dar un lenguaje común y coherente para expresar y combinar la incertidumbre en modelos de IA.
- **Regla de Laplace**: $P(A)=\text{casos favorables}/\text{casos posibles}$, solo si todos los resultados son igual de probables.
- **Fórmula clave**: $P(A\cup B)=P(A)+P(B)-P(A\cap B)$.
- **Tres interpretaciones**: clásica (equiprobabilidad), frecuentista (repetición de datos), bayesiana (creencia actualizable); en IA conviven según el contexto.
- **Los tres axiomas**: no negatividad, normalización ($P(\Omega)=1$) y aditividad para eventos disjuntos; el resto se deduce de ellos.
- **Trampa principal**: la independencia no es "no solaparse"; es que un suceso no cambie nada la probabilidad del otro.

## A fondo

### Por qué los axiomas importan tanto en IA

Cuando un clasificador asigna probabilidad 0,8 a "spam" y 0,2 a "no spam", el hecho de que sumen exactamente 1 no es casualidad estética: es una consecuencia obligada de la normalización y la aditividad. Si un modelo devolviera probabilidades que sumaran 1,3 o incluyeran un valor negativo, sabríamos con certeza que hay un error numérico o conceptual, sin necesidad de mirar más. Lo mismo ocurre en modelos de lenguaje (la suma de probabilidades de todas las frases posibles debe ser 1) y en aprendizaje por refuerzo (las probabilidades de las acciones disponibles en un estado deben ser válidas y no duplicarse). Los axiomas actúan, en la práctica, como un control de calidad silencioso sobre cualquier modelo probabilístico.

## Autoevaluación

### En un dado, $A$="número par" y $B$="mayor que 4". Sabiendo $P(A)=3/6$, $P(B)=2/6$ y $P(A\cap B)=1/6$, ¿cuánto vale $P(A\cup B)$?
- [ ] $5/6$, sumando $P(A)+P(B)$.
- [x] $4/6=2/3$, restando la intersección de la suma.
- [ ] $1/6$, porque es lo único que tienen en común.
> Por qué: $P(A\cup B)=P(A)+P(B)-P(A\cap B)=3/6+2/6-1/6=4/6$; sin restar la intersección, el resultado 6 estaría contando el caso $\{6\}$ dos veces.

### Sacas una bola de una bolsa con 5 rojas y 5 azules, sin devolverla, y luego sacas otra. ¿Son independientes los colores de la primera y la segunda extracción?
- [ ] Sí, porque las bolas se sacan de la misma bolsa.
- [x] No, porque el resultado de la primera extracción cambia cuántas bolas de cada color quedan para la segunda.
- [ ] Solo son independientes si las dos bolas resultan ser del mismo color.
> Por qué: al no devolver la primera bola, la composición de la bolsa cambia, así que la probabilidad de cada color en la segunda extracción depende de lo que salió en la primera: eso es justo la definición de dependencia.

### Un servicio meteorológico dice que hay un 70% de probabilidad de lluvia mañana. ¿Qué interpretación de la probabilidad encaja mejor con esa afirmación?
- [ ] La clásica, contando casos favorables entre posibles.
- [ ] La frecuentista, como límite de una frecuencia observada en infinitas repeticiones de "mañana".
- [x] La bayesiana, como grado de creencia basado en la información disponible hoy (presión, humedad, modelos climáticos).
> Por qué: "mañana" ocurre una sola vez, así que no tiene sentido hablar de una frecuencia observada al repetirlo; el 70% expresa cuánta confianza tiene el modelo, dado lo que sabe ahora, en que llueva.

### Un modelo de clasificación multiclase devuelve las probabilidades $[0{,}5,\ 0{,}2,\ 0{,}4]$ para tres clases. ¿Qué axioma de Kolmogórov se está violando?
- [ ] La no negatividad, porque hay un valor menor que 0,5.
- [x] La normalización, porque las probabilidades de todos los resultados posibles deberían sumar exactamente 1, y aquí suman 1,1.
- [ ] Ninguno; los tres valores están entre 0 y 1, así que es válido.
> Por qué: aunque cada valor individual sea no negativo y esté en $[0,1]$, el axioma de normalización exige que la probabilidad del espacio muestral completo (aquí, "pertenecer a alguna de las tres clases") sea exactamente 1; sumar 1,1 delata un error en el modelo.

## Glosario

- **Experimento aleatorio**: proceso repetible cuyo resultado no se puede predecir con certeza.
- **Espacio muestral**: conjunto $\Omega$ de todos los resultados posibles de un experimento aleatorio.
- **Evento**: subconjunto del espacio muestral.
- **Regla de Laplace**: $P(A)=\text{casos favorables}/\text{casos posibles}$, válida cuando todos los resultados son equiprobables.
- **Independencia**: dos eventos son independientes si $P(A\cap B)=P(A)\cdot P(B)$.
- **Axiomas de Kolmogórov**: las tres reglas mínimas (no negatividad, normalización, aditividad) que debe cumplir toda función de probabilidad.
