---
id: redes-bayesianas
estado: borrador
---

## En una frase

Una red bayesiana representa con un grafo dirigido cómo unas variables inciertas influyen en otras, y permite recalcular las probabilidades de todas ellas en cuanto observas el valor de una.

## Intuición

Piensa en dos hechos cotidianos: si ha llovido, es muy probable que el césped esté mojado; pero el césped mojado también podría deberse a un aspersor. Si sales una mañana y ves el césped mojado, tu cerebro hace inferencia al instante: sube tu confianza en que haya llovido, aunque no lo hayas visto llover. Una **red bayesiana** formaliza exactamente ese tipo de razonamiento: un grafo donde los nodos son variables inciertas ("lluvia", "césped mojado") y las flechas indican qué variable influye en la probabilidad de otra, con una tabla de probabilidades condicionales en cada nodo.

Importa en IA porque muchos problemas reales —diagnóstico médico, detección de fraude, mantenimiento predictivo— tienen esta misma estructura: varias causas posibles, varios efectos observables, e incertidumbre en ambas direcciones. Una red bayesiana permite calcular la probabilidad de cualquier variable dado lo que se observa de las demás, sin tener que enumerar a mano todas las combinaciones posibles.

## Explicación

### Nodos, aristas y tablas de probabilidad condicional

Una red bayesiana es un **grafo dirigido y acíclico**: cada **nodo** es una variable aleatoria, y cada **arista** de $A$ hacia $B$ indica que $A$ influye directamente en la probabilidad de $B$. Cada nodo lleva asociada una **tabla de probabilidad condicional** (CPT): la probabilidad de cada uno de sus valores dado el valor de sus nodos padres. Si un nodo no tiene padres, su tabla se reduce a su probabilidad marginal.

### De la probabilidad conjunta al producto de condicionales

Calcular la probabilidad conjunta de muchas variables a mano es inviable si hay que enumerar todas sus combinaciones. La estructura del grafo evita ese problema: como cada variable solo depende directamente de sus padres, la probabilidad conjunta se descompone en un producto de probabilidades condicionales mucho más pequeñas y manejables (fórmula en Formalización). Esta descomposición es una aplicación directa de la [[prob-condicional|independencia condicional]]: dado el valor de sus padres, cada variable es independiente del resto de la red.

### Inferir hacia atrás: de un efecto observado a su causa

Lo más útil de una red bayesiana no es solo calcular hacia delante (de causas a efectos), sino también hacia atrás: dado un efecto observado, recalcular la probabilidad de sus posibles causas con el [[bayes|teorema de Bayes]]. Por ejemplo, con $P(\text{lluvia})=0{,}3$ y $P(\text{césped mojado}\mid\text{lluvia})=0{,}9$ frente a $P(\text{césped mojado}\mid\text{no lluvia})=0{,}1$: si observas el césped mojado, la probabilidad de que haya llovido sube de un $30\,\%$ inicial a cerca de un $79\,\%$ (cálculo completo en Formalización). Esa actualización, de una creencia previa (*prior*) a una creencia posterior tras la evidencia, es exactamente el mecanismo que hace útil a una red bayesiana en diagnóstico: permite preguntar "¿cuál es la causa más probable de lo que observo?", no solo "¿qué es probable que observe?".

## Formalización

Descomposición de la probabilidad conjunta de $X_1, \ldots, X_n$ según la estructura de la red:

$$
P(X_1, X_2, \dots, X_n) = \prod_{i=1}^{n} P\big(X_i \mid \text{padres}(X_i)\big)
$$

donde:

- $X_1, \ldots, X_n$ son las variables aleatorias representadas por los nodos de la red.
- $\text{padres}(X_i)$ es el conjunto de nodos con una arista directa hacia $X_i$ (conjunto vacío si $X_i$ es un nodo raíz).
- $P(X_i \mid \text{padres}(X_i))$ es la tabla de probabilidad condicional almacenada en el nodo $X_i$.

Inferencia hacia atrás con el teorema de Bayes, para lluvia ($R$) y césped mojado ($W$):

$$
P(R=\text{sí} \mid W=\text{sí}) = \frac{P(W=\text{sí} \mid R=\text{sí}) \cdot P(R=\text{sí})}{P(W=\text{sí})}
$$

donde:

- $P(R=\text{sí})=0{,}3$ es la probabilidad a priori de lluvia.
- $P(W=\text{sí}\mid R=\text{sí})=0{,}9$ y $P(W=\text{sí}\mid R=\text{no})=0{,}1$ son las probabilidades condicionales de la tabla del nodo "césped mojado".
- $P(W=\text{sí})$ es la probabilidad marginal de césped mojado, sumando ambos caminos: $0{,}9\cdot0{,}3+0{,}1\cdot0{,}7=0{,}34$.
- El resultado, $P(R=\text{sí}\mid W=\text{sí})=0{,}27/0{,}34\approx0{,}794$, es la probabilidad posterior de lluvia tras observar el césped mojado.

## Interactivo

```widget
motor: grafo
modo: red-bayesiana
nodos: [{"id": "r", "etiqueta": "Resfriado", "tabla": [{"dado": {}, "p": 0.1}]}, {"id": "f", "etiqueta": "Fiebre", "tabla": [{"dado": {"r": 1}, "p": 0.8}, {"dado": {"r": 0}, "p": 0.2}]}, {"id": "t", "etiqueta": "Tos", "tabla": [{"dado": {"r": 1}, "p": 0.7}, {"dado": {"r": 0}, "p": 0.1}]}]
aristas: [["r", "f"], ["r", "t"]]
```

- Prueba a fijar "Resfriado" a "sí" y observa cómo suben a la vez las probabilidades de fiebre y tos, sin haberlas tocado directamente.
- Prueba a fijar solo "Fiebre" a "sí", sin tocar "Resfriado", y comprueba que la probabilidad de resfriado también sube: la inferencia funciona en las dos direcciones, de causas a efectos y de efectos a causas.

## En código

```python
p_lluvia = 0.3
p_mojado_si_lluvia = 0.9
p_mojado_si_no_lluvia = 0.1

p_mojado = p_mojado_si_lluvia * p_lluvia + p_mojado_si_no_lluvia * (1 - p_lluvia)
p_lluvia_dado_mojado = (p_mojado_si_lluvia * p_lluvia) / p_mojado

print("P(césped mojado) =", round(p_mojado, 4))
# P(césped mojado) = 0.34
print("P(lluvia | césped mojado) =", round(p_lluvia_dado_mojado, 4))
# P(lluvia | césped mojado) = 0.7941
```

## Errores típicos

- **Error**: pensar que las flechas de una red bayesiana siempre significan causalidad física. → **Correcto**: representan dependencia probabilística; a veces coinciden con una causa real, pero el modelo solo garantiza la estructura de dependencia, no el mecanismo causal.
- **Error**: creer que hay que enumerar a mano la probabilidad conjunta de todas las variables. → **Correcto**: la independencia condicional que codifica el grafo permite descomponerla en el producto de tablas mucho más pequeñas.
- **Error**: pensar que una red bayesiana solo infiere "hacia delante", de causas a efectos. → **Correcto**: también infiere hacia atrás, de un efecto observado a la probabilidad de sus causas, aplicando el [[bayes|teorema de Bayes]] sobre la misma red.
- **Error**: asumir que basta con conocer las probabilidades marginales de cada variable por separado. → **Correcto**: lo esencial de la red son las probabilidades *condicionales* de cada nodo dado sus padres; sin ellas no hay forma de propagar la evidencia.

## En resumen

- Qué es: un grafo dirigido y acíclico donde los nodos son variables inciertas y las aristas indican dependencia probabilística directa, con una tabla de probabilidad condicional en cada nodo.
- Cómo funciona: la probabilidad conjunta se descompone en el producto de las tablas condicionales de cada nodo dado sus padres, aprovechando la independencia condicional.
- Fórmula clave: $P(X_1,\ldots,X_n)=\prod_i P(X_i\mid\text{padres}(X_i))$.
- Para qué sirve: calcular probabilidades hacia delante (causas → efectos) y hacia atrás (efectos observados → causas más probables) sin recalcular todo el modelo.
- Úsalo cuando el dominio tiene variables interdependientes con incertidumbre y conoces (o puedes estimar) sus probabilidades condicionales; construirla exige definir bien esas tablas.
- Trampa principal: confundir una arista con causalidad real, cuando solo expresa una dependencia probabilística.

## A fondo

Construir una red bayesiana sigue un orden fijo: primero se identifican las variables relevantes y su estructura de dependencia (qué influye en qué); después se definen las **probabilidades marginales** de los nodos sin padres; y por último las **tablas de probabilidad condicional** de cada nodo con padres, cubriendo todas las combinaciones de valores de esos padres.

Un ejemplo con más de una variable observada: en detección de fraude, con $P(\text{fraudulenta})=0{,}05$, $P(\text{horario inusual}\mid\text{fraudulenta})=0{,}7$ frente a $0{,}1$ si no lo es, y $P(\text{monto alto}\mid\text{fraudulenta})=0{,}8$ frente a $0{,}2$ si no lo es, se puede calcular $P(\text{horario inusual}\mid\text{monto alto})\approx0{,}204$: observar un monto elevado por sí solo ya hace algo más plausible que la transacción ocurra en un horario inusual, aunque la probabilidad siga siendo baja en términos absolutos.

Las redes bayesianas también son la base del clasificador **Naïve Bayes**, muy usado en filtrado de correo *spam*: asume (de forma simplificada, de ahí "naïve") que las palabras de un mensaje son condicionalmente independientes dada la clase ("spam" o "no spam"), y calcula $P(\text{Spam}\mid w_1,\ldots,w_n)\propto P(\text{Spam})\prod_i P(w_i\mid\text{Spam})$. En diagnóstico médico, una red bayesiana puede modelar cómo varias enfermedades comparten síntomas observables, y calcular qué enfermedad es más probable dado el conjunto de síntomas presentes. En robótica y planificación autónoma, se usan para actualizar la probabilidad de eventos del entorno a medida que llegan nuevos datos de sensores, ajustando decisiones sin reconstruir el modelo entero cada vez.

## Autoevaluación

### En la red "Resfriado → Fiebre" y "Resfriado → Tos", ¿por qué basta con $P(F\mid R)$ y $P(T\mid R)$ para calcular $P(R,F,T)$, sin necesitar $P(F\mid T)$ ni $P(T\mid F)$?
- [ ] Porque Fiebre y Tos son variables idénticas en este modelo.
- [x] Porque, dado el valor de Resfriado, Fiebre y Tos son condicionalmente independientes: cada una solo depende directamente de su padre en el grafo.
- [ ] Porque las redes bayesianas nunca modelan más de dos síntomas a la vez.
> Por qué: la independencia condicional que codifica el grafo es justo lo que permite descomponer $P(R,F,T)$ como $P(R)\cdot P(F\mid R)\cdot P(T\mid R)$, sin necesitar la relación directa entre Fiebre y Tos.

### Observas que el césped está mojado. Según el ejemplo de la ficha, ¿qué le ocurre a tu creencia sobre si ha llovido?
- [ ] No cambia, porque el césped mojado no aporta información sobre la lluvia.
- [x] Sube de un 30 % a priori a cerca de un 79 % a posteriori, tras aplicar el teorema de Bayes con la evidencia observada.
- [ ] Baja, porque el aspersor es una explicación alternativa más probable.
> Por qué: $P(R=\text{sí}\mid W=\text{sí})=\frac{0{,}9\cdot0{,}3}{0{,}34}\approx0{,}794$: la evidencia del césped mojado, al ser mucho más probable si ha llovido que si no, empuja la probabilidad posterior muy por encima del prior.

### Un ingeniero afirma que, como "hora inusual" y "monto alto" apuntan ambas hacia "transacción fraudulenta" en el grafo, entonces "hora inusual" causa directamente que el "monto" sea alto. ¿Es correcto?
- [ ] Sí, porque cualquier arista compartida hacia el mismo nodo implica causalidad entre esos dos nodos.
- [x] No: ambas son efectos de una causa común (la transacción fraudulenta); la red no afirma ninguna relación directa entre "hora inusual" y "monto alto".
- [ ] Sí, pero solo si $P(\text{fraudulenta})$ es mayor que 0,5.
> Por qué: una red bayesiana solo representa las dependencias que sus aristas dibujan explícitamente; dos efectos de una misma causa pueden estar correlacionados sin que exista ninguna arista, ni causalidad, entre ellos.

## Glosario

- **red bayesiana**: grafo dirigido y acíclico que representa variables inciertas (nodos) y sus dependencias probabilísticas directas (aristas), con una tabla de probabilidad condicional en cada nodo.
- **tabla de probabilidad condicional (CPT)**: tabla que especifica, para un nodo, la probabilidad de cada uno de sus valores dado cada combinación de valores de sus nodos padres.
