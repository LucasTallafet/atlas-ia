---
id: mdp
estado: borrador
---

## En una frase

Un proceso de decisión de Markov (MDP) formaliza matemáticamente un problema de decisión secuencial: estados, acciones, probabilidades de transición y recompensas, todo bajo el supuesto de que el futuro solo depende del presente.

## Intuición

En [[rl-fundamentos]] viste que un agente interactúa con un entorno: observa un estado, actúa, recibe una recompensa y pasa a un nuevo estado. Para poder diseñar algoritmos que resuelvan ese problema hace falta algo más preciso que la intuición: una estructura matemática que capture exactamente qué información importa y cómo se relaciona el presente con el futuro.

Imagina un robot que se mueve por un terreno irregular: aunque intente avanzar en línea recta, puede desviarse por un desnivel. Para predecir dónde acabará, no necesitas saber cómo llegó hasta su posición actual, solo dónde está ahora y qué acción ejecuta. Esa idea —que el futuro depende únicamente del presente, no de la historia completa— es el corazón de un MDP, y es lo que permite construir algoritmos que no tienen que recordar trayectorias enteras para decidir bien.

## Explicación

### Los elementos de un MDP

Formalizar un problema de decisión secuencial exige tres piezas. El conjunto de **estados** $\mathcal{S}$ recoge todas las configuraciones posibles del entorno; el conjunto de **acciones** $\mathcal{A}$, todas las decisiones que el agente puede tomar; y el conjunto de **recompensas** $\mathcal{R}$, los valores numéricos que el entorno entrega tras cada transición. Estos tres elementos dan lugar a una secuencia $s_0 \xrightarrow{a_0, r_1} s_1 \xrightarrow{a_1, r_2} s_2 \to \cdots$

En la mayoría de problemas reales, el entorno es **estocástico**: la misma acción en el mismo estado no siempre lleva al mismo resultado. Esta incertidumbre se recoge en la función de transición $\mathcal{P}(s' \mid s, a)$, que da la probabilidad de acabar en $s'$ al ejecutar $a$ desde $s$. Al ser una distribución de probabilidad, cumple $\sum_{s'} \mathcal{P}(s' \mid s, a) = 1$ para cualquier $(s,a)$: desde cualquier situación, el sistema siempre acaba en algún estado.

### La propiedad de Markov

Lo que hace tratable este modelo es la **propiedad de Markov**: la probabilidad del siguiente estado depende únicamente del estado y la acción actuales, no del historial completo de decisiones pasadas. Formalmente,
$$
\mathbb{P}(s_{t+1} \mid s_t, a_t, s_{t-1}, a_{t-1}, \dots, s_0, a_0) = \mathbb{P}(s_{t+1} \mid s_t, a_t).
$$
Si el entorno cumple esta propiedad, basta con conocer $s_t$ y $a_t$ para describir la dinámica futura; no hace falta memorizar todo el camino recorrido. Esto es lo que permite representar el entorno íntegramente mediante la función $\mathcal{P}(s' \mid s, a)$.

:::nota-fuente
La fuente afirma que los MDP "no tienen memoria" de forma un poco ambigua. Aquí se precisa: la ausencia de memoria es una propiedad del **entorno** (su dinámica no depende del pasado), no una limitación del agente, que sí puede usar memoria interna (buffers, redes recurrentes) para decidir mejor. Cuando el agente no observa el estado real, sino una versión parcial o ruidosa de él, la propiedad de Markov deja de cumplirse sobre las observaciones, y se necesita un modelo más general: los **procesos de decisión de Markov parcialmente observables** (POMDP).
Fuente: `[ml] 05-Aprendizaje-Refuerzo/01-fundamentos-rl.md`.
:::

### Un ejemplo con y sin incertidumbre

Considera un tablero de tres casillas: $s_0$ (hueco), $s_1$ (inicio) y $s_2$ (meta). Las acciones son moverse a la izquierda ($a_0$) o a la derecha ($a_1$). En la versión **determinista**, desde $s_1$ la acción $a_1$ lleva siempre a $s_2$ con recompensa $1$; cualquier otra combinación da recompensa $0$. En la versión **estocástica**, desde $s_1$ la acción $a_1$ lleva a $s_2$ con probabilidad $0{,}8$ y a $s_0$ con probabilidad $0{,}2$; la recompensa esperada de esa acción es entonces $0{,}8 \times 1 + 0{,}2 \times 0 = 0{,}8$. Los estados $s_0$ y $s_2$ son **absorbentes**: cualquier acción desde ellos deja al agente en el mismo estado, sin recompensa.

Un entorno más rico es un tablero $4\times 4$ (16 estados, numerados de 0 a 15) con cuatro acciones (izquierda, abajo, derecha, arriba). Cada acción tiene un 33% de probabilidad de moverse en la dirección deseada, y el 67% restante se reparte a partes iguales entre las dos direcciones ortogonales; la dirección opuesta nunca ocurre, y salirse del tablero deja al agente en su casilla. Este entorno introduce el concepto de **episodio**: la secuencia de transiciones desde el estado inicial hasta un estado terminal.

### Horizonte y factor de descuento

El **horizonte** es el número de pasos que puede durar un episodio: puede ser **finito** (un número fijo de turnos), **infinito** (sin límite) o **inducido por el entorno** (termina al alcanzar un estado absorbente, como en el tablero anterior). Con un horizonte demasiado corto el agente puede no llegar nunca a la recompensa; con uno largo puede permitirse explorar y corregir desviaciones.

Cuando el horizonte es indefinido o muy largo, hace falta controlar cuánto pesan las recompensas lejanas frente a las inmediatas. Ese control lo aporta el **factor de descuento** $\gamma \in [0,1)$: una recompensa obtenida $k$ pasos en el futuro se pondera por $\gamma^k$. Un $\gamma$ cercano a $0$ hace al agente "miope" (solo le importa lo inmediato); un $\gamma$ cercano a $1$ lo hace "paciente". Además de modelar preferencia temporal, $\gamma < 1$ garantiza que la suma infinita de recompensas descontadas converja, lo que es imprescindible en horizontes infinitos.

## Formalización

Un **Proceso de Decisión de Markov** se define como la tupla:

$$
\mathcal{M} = (\mathcal{S}, \mathcal{A}, \mathcal{P}, \mathcal{R})
$$

donde:

- $\mathcal{S}$: conjunto de estados posibles del entorno.
- $\mathcal{A}$: conjunto de acciones disponibles para el agente.
- $\mathcal{P}: \mathcal{S} \times \mathcal{A} \times \mathcal{S} \to [0,1]$: función de transición; $\mathcal{P}(s' \mid s, a)$ es la probabilidad de llegar a $s'$ al ejecutar $a$ en $s$.
- $\mathcal{R}: \mathcal{S} \times \mathcal{A} \to \mathbb{R}$: función de recompensa esperada al ejecutar $a$ en $s$.

El modelo asume la propiedad de Markov, por lo que $\mathcal{P}$ describe la dinámica completa del entorno sin necesitar el historial.

El **retorno total** desde el instante $t$, que el agente busca maximizar en expectativa, se define como la suma descontada de recompensas futuras:

$$
G_t = r_{t+1} + \gamma\, r_{t+2} + \gamma^2\, r_{t+3} + \cdots = \sum_{k=0}^{\infty} \gamma^k\, r_{t+k+1}
$$

donde:

- $G_t$: retorno total a partir del instante $t$.
- $r_{t+k+1}$: recompensa recibida $k+1$ pasos después de $t$.
- $\gamma \in [0,1)$: factor de descuento; si $\gamma=0$ el agente solo valora $r_{t+1}$, y cuanto más cerca de $1$, más peso dan a las recompensas lejanas.

Ejemplo numérico (verificado): con $\gamma = 0{,}9$ y recompensas $r_1=0, r_2=0, \dots, r_6=1$ (recompensa solo al llegar a la meta en el sexto paso), el retorno desde $t=0$ es $G_0 = 0{,}9^5 \times 1 = 0{,}59$.

```python
gamma = 0.9
recompensas = [0, 0, 0, 0, 0, 1]  # r_1 ... r_6
G0 = sum((gamma ** k) * r for k, r in enumerate(recompensas))
print(round(G0, 4))
# 0.5905
```

## Interactivo

```widget
motor: rejilla
modo: mdp
mapa: ["S...", ".X.X", "...X", "X..G"]
gamma: 0.9
estocastico: 0.34
```

- Prueba a hacer clic en el estado inicial y en un estado próximo a la meta: compara sus tablas de transición y recompensa.
- Prueba a subir `estocastico` a un valor alto y observa cómo se reparte la probabilidad entre la acción deseada y las ortogonales.
- Prueba a identificar qué estados son absorbentes (las X y la G) y confirma que desde ellos ninguna acción cambia el estado.

## Errores típicos

- **Error**: pensar que un MDP exige que el entorno sea determinista. → **Correcto**: la mayoría de MDP útiles son estocásticos; $\mathcal{P}(s' \mid s, a)$ existe precisamente para modelar esa incertidumbre.
- **Error**: creer que "el entorno no tiene memoria" significa que el agente tampoco puede usar memoria. → **Correcto**: la propiedad de Markov es una condición sobre la dinámica del entorno, no una restricción sobre el agente, que puede incorporar memoria interna si le conviene.
- **Error**: usar $\gamma = 1$ en un problema de horizonte infinito. → **Correcto**: con horizonte infinito, $\gamma$ debe ser estrictamente menor que $1$ para que el retorno converja; $\gamma=1$ solo es seguro en horizontes finitos.
- **Error**: confundir el horizonte (cuántos pasos dura el episodio) con el factor de descuento (cuánto pesan las recompensas futuras). → **Correcto**: son conceptos distintos que interactúan: un horizonte corto limita cuántas recompensas existen; el descuento decide cuánto pesan las que sí existen.

## En resumen

- **Qué es y para qué sirve:** el modelo matemático estándar para formalizar decisiones secuenciales bajo incertidumbre; base de todos los algoritmos de RL.
- **Cómo funciona:** el agente pasa por estados, ejecuta acciones, y el entorno responde según $\mathcal{P}(s'\mid s,a)$ con una recompensa $\mathcal{R}(s,a)$; el ciclo se repite hasta un estado terminal o indefinidamente.
- **Fórmula clave:** $\mathcal{M} = (\mathcal{S}, \mathcal{A}, \mathcal{P}, \mathcal{R})$, con el retorno $G_t = \sum_{k=0}^{\infty}\gamma^k r_{t+k+1}$.
- **Cuándo se cumple:** solo si el entorno satisface la propiedad de Markov; si el agente no observa el estado real, hace falta un POMDP.
- **Decisiones que importan:** el horizonte (finito, infinito o inducido) y el factor de descuento $\gamma$, que controla cuánto le importan al agente las recompensas lejanas.
- **Trampa principal:** confundir la falta de memoria del entorno con una limitación del agente, y olvidar que $\gamma<1$ es obligatorio en horizontes infinitos.

## A fondo

Cuando el espacio de estados es discreto y finito, como en el tablero $4\times4$, la función de transición y la política pueden representarse como tablas indexadas por $(s,a)$: son las llamadas **técnicas tabulares**, viables porque el número de combinaciones es manejable. Pero no todos los problemas son así. En robótica continua o control físico, el estado puede ser un vector de variables reales (posición, velocidad, sensores), dando lugar a espacios de estados y acciones continuos o de muy alta dimensión. Ahí las tablas dejan de ser viables y se recurre a aproximadores de función, como redes neuronales, para representar $\mathcal{P}$, $\mathcal{R}$ o la política.

El caso del tablero $4\times4$ ilustra también por qué el horizonte importa en la práctica: con horizonte 1 el agente no puede llegar nunca a la meta desde el estado inicial (el valor de cualquier acción sería 0); con horizonte 3 el espacio de trayectorias posibles queda muy limitado; y con horizonte 10, o inducido por absorción, el agente dispone de margen para explorar y corregir desviaciones causadas por la estocasticidad del entorno. La trayectoria determinista más corta entre el estado inicial y la meta requiere 6 transiciones, por lo que en la práctica conviene un horizonte algo mayor para absorber el ruido de las transiciones.

## Autoevaluación

### Un dron vuela en un entorno con viento variable: la misma orden de "avanzar" no siempre produce el mismo desplazamiento. ¿Qué elemento del MDP captura esto?
- [ ] El conjunto de acciones $\mathcal{A}$.
- [x] La función de transición $\mathcal{P}(s' \mid s, a)$, porque describe una distribución de probabilidad sobre los posibles estados siguientes.
- [ ] El factor de descuento $\gamma$.
> Por qué: la incertidumbre sobre el resultado de una acción es justo lo que modela $\mathcal{P}$; el conjunto de acciones solo lista qué se puede hacer, y $\gamma$ regula el peso temporal de las recompensas, no la incertidumbre de las transiciones.

### ¿Por qué la propiedad de Markov simplifica tanto el diseño de algoritmos de RL?
- [ ] Porque elimina la necesidad de recompensas.
- [x] Porque basta con conocer el estado y la acción actuales para predecir la dinámica futura, sin almacenar todo el historial.
- [ ] Porque convierte cualquier entorno en determinista.
> Por qué: la propiedad de Markov no elimina la incertidumbre (el entorno sigue siendo estocástico), pero sí evita tener que condicionar en toda la trayectoria pasada: el estado actual resume toda la información relevante.

### Un problema tiene horizonte infinito. ¿Qué valor de $\gamma$ es válido?
- [ ] $\gamma = 1$, porque así se valoran igual todas las recompensas.
- [x] Cualquier $\gamma \in [0,1)$, estrictamente menor que 1.
- [ ] $\gamma = 0$, siempre.
> Por qué: con horizonte infinito, $\gamma$ debe ser estrictamente menor que 1 para garantizar que la suma infinita de recompensas descontadas converja; $\gamma=1$ solo es seguro cuando el horizonte es finito.

### Un agente observa solo una cámara con ruido, no la posición exacta del robot. ¿Qué modelo describe mejor esta situación?
- [ ] Un MDP estándar, porque la propiedad de Markov sigue siendo válida sobre las observaciones.
- [x] Un POMDP, porque la propiedad de Markov ya no se cumple sobre las observaciones parciales y ruidosas.
- [ ] Ningún modelo formal puede describir esta situación.
> Por qué: cuando el agente no accede directamente al estado real, sino a observaciones indirectas, necesita memoria o inferencia adicional para reconstruir un estado efectivo; eso es precisamente lo que generaliza el POMDP.

## Glosario

- **espacio de estados $\mathcal{S}$**: conjunto de todas las configuraciones posibles del entorno.
- **espacio de acciones $\mathcal{A}$**: conjunto de decisiones que el agente puede tomar.
- **función de transición $\mathcal{P}(s'\mid s,a)$**: probabilidad de llegar al estado $s'$ al ejecutar $a$ en $s$.
- **estado absorbente**: estado en el que cualquier acción deja al agente en el mismo estado, sin recompensa adicional.
- **episodio**: secuencia de transiciones desde el estado inicial hasta un estado terminal.
- **horizonte**: número de pasos que puede durar un episodio (finito, infinito o inducido por el entorno).
- **factor de descuento $\gamma$**: parámetro en $[0,1)$ que pondera cuánto pesan las recompensas futuras frente a las inmediatas.
- **retorno total $G_t$**: suma descontada de las recompensas futuras a partir del instante $t$.
- **POMDP**: proceso de decisión de Markov parcialmente observable, donde el agente no accede directamente al estado real.
