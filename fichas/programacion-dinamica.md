---
id: programacion-dinamica
estado: borrador
---

## En una frase

La programación dinámica calcula la política óptima de un MDP aplicando una y otra vez la ecuación de Bellman, siempre que el modelo del entorno sea completamente conocido.

## Intuición

Imagina que quieres planificar la ruta más rápida por una ciudad de la que tienes un plano perfecto: conoces cada calle, cada semáforo y cuánto tarda cada tramo. No necesitas caminarla para saber cuál es el mejor camino; basta con razonar sobre el plano. Eso es justo lo que hace la programación dinámica en un [[mdp|MDP]]: si conoces la función de transición y la de recompensa —el "plano" del entorno—, puedes calcular, casilla a casilla, cuánto vale cada estado y qué acción conviene en cada uno, sin que el agente interactúe ni una sola vez con el entorno real.

La contrapartida es justamente esa: exige el plano completo. Cuando no lo tienes —la mayoría de problemas reales—, hace falta aprender explorando, como en [[monte-carlo-rl]] o [[td-learning]]. Aun así, entender cómo se explota un plano perfecto es la base para entender después cómo se aprende sin él: esos métodos posteriores pueden verse como versiones muestreadas de las mismas ideas que se presentan aquí.

## Explicación

### Cuándo se puede planificar: el modelo completo

La programación dinámica (DP) no aprende de la experiencia: **planifica** explotando un modelo del entorno ya conocido. Exige disponer de la función de transición $p(s' \mid s,a)$ y de la función de recompensa del MDP —saber de antemano, para cada estado y acción, a qué estados se puede ir y qué recompensa se recibe—. Con ese conocimiento, el agente simula internamente las consecuencias de sus decisiones sin necesidad de ejecutarlas.

Esta condición limita la DP a problemas donde el modelo es construible: simulaciones con reglas cerradas (tres en raya, FrozenLake, laberintos pequeños), sistemas físicos con dinámica conocida (un robot que se mueve según ecuaciones de cinemática) o planificación logística con probabilidades estimadas de antemano. En la mayoría de problemas reales —interacción con usuarios, robótica en entornos no estructurados— el modelo no está disponible, y hace falta aprender de la experiencia. Aun sin esa aplicabilidad directa, la DP importa por otra razón: es el **andamiaje teórico** sobre el que se apoyan esos métodos, que pueden entenderse como aproximaciones muestrales de las mismas actualizaciones que se estudian aquí.

### Evaluación de políticas: ¿cuánto vale seguir esta política?

Fijada una política $\pi$, lo primero es cuantificarla: calcular $v_\pi(s)$, el valor de cada estado bajo esa política ([[politica-valor-bellman]]). Como se conoce el modelo, no hace falta simular episodios: basta con resolver, para cada estado, la ecuación de Bellman de $v_\pi$. El problema es que $v_\pi(s)$ depende de $v_\pi$ de sus sucesores, así que no puede despejarse de un tirón.

La solución es iterar: se parte de una estimación arbitraria (por ejemplo, todo a cero) y se aplica la ecuación de Bellman una y otra vez sobre todos los estados, usando en cada barrido los valores del barrido anterior. Esto es la **evaluación iterativa de políticas**. Con $\gamma<1$ y un número finito de estados converge siempre a $v_\pi$ exacto; en la práctica se detiene cuando el mayor cambio entre dos barridos consecutivos cae por debajo de una tolerancia $\theta$.

### Mejora de la política: de evaluar a decidir mejor

Evaluar no basta: el objetivo es actuar mejor. Conociendo $v_\pi$ y el modelo, se puede calcular para cada estado y cada acción cuánto valdría tomarla y seguir luego con $\pi$ —eso es $q_\pi(s,a)$—. La **mejora de política** construye una nueva política $\pi'$ que en cada estado elige la acción de mayor $q_\pi(s,a)$: una política **greedy** respecto a $v_\pi$. No hace falta calcular ni almacenar $q_\pi$ como tabla aparte: se obtiene sobre la marcha a partir de $v_\pi$ y el modelo. Si $\pi'$ coincide con $\pi$, ya no hay ninguna acción alternativa que mejore el comportamiento: la política es óptima.

### Iteración de políticas: evaluar y mejorar por turnos

Encadenando evaluación y mejora se obtiene la **iteración de políticas**: se evalúa $\pi$ hasta convergencia, se mejora a $\pi'$, se evalúa $\pi'$, se mejora de nuevo, y así hasta que un ciclo de mejora no cambie la política. Ese es el criterio de parada correcto: no que los valores converjan a un número concreto, sino que la política deje de cambiar. En espacios finitos, el número de políticas distintas también es finito y cada mejora produce una política al menos igual de buena, así que el algoritmo converge en un número finito de iteraciones.

### Iteración de valores: fusionar evaluación y mejora

La iteración de políticas tiene un coste: cada ciclo exige evaluar la política hasta el final antes de poder mejorarla. La **iteración de valores** evita ese coste fusionando ambos pasos en una sola actualización: en cada barrido, el valor de cada estado se recalcula tomando directamente el máximo sobre las acciones, en vez de promediar sobre la acción que dicta una política fija. No se mantiene ninguna política explícita durante el proceso: solo al final, una vez que los valores han convergido, se extrae la política óptima eligiendo en cada estado la acción que maximiza esa expresión.

Este es el mismo patrón de propagación que reaparece en [[td-learning]]: el valor de los estados terminales, que es conocido, se propaga hacia atrás hasta iluminar el resto del espacio de estados.

## Formalización

La **evaluación iterativa** actualiza $v(s)$ con el promedio, sobre la política, de la ecuación de Bellman:

$$
v^{(k+1)}(s) = \sum_a \pi(a\mid s) \sum_{s',r} p(s',r\mid s,a)\bigl[r + \gamma\, v^{(k)}(s')\bigr]
$$

donde:
- $v^{(k)}(s)$: estimación del valor de $s$ en el barrido $k$; $v^{(0)}$ se inicializa arbitrariamente (por ejemplo, a cero).
- $\pi(a\mid s)$: probabilidad de elegir $a$ en $s$ bajo la política que se evalúa.
- $p(s',r\mid s,a)$: probabilidad conjunta de transitar a $s'$ y recibir recompensa $r$ al ejecutar $a$ en $s$.
- $\gamma$: factor de descuento.

La **mejora de política** convierte esos valores en una nueva política greedy:

$$
\pi'(s) = \arg\max_a \sum_{s',r} p(s',r\mid s,a)\bigl[r + \gamma\, v_\pi(s')\bigr]
$$

donde:
- $\pi'(s)$: acción que la política mejorada elige en $s$.
- el resto de símbolos son los mismos de arriba, evaluados con $v_\pi$ ya convergido.

La **iteración de valores** sustituye el promedio sobre $\pi$ por un máximo sobre las acciones (ecuación de Bellman óptima):

$$
v^{(k+1)}(s) = \max_a \sum_{s',r} p(s',r\mid s,a)\bigl[r + \gamma\, v^{(k)}(s')\bigr]
$$

donde los símbolos son los mismos que en la evaluación iterativa, salvo que ya no aparece $\pi$: se maximiza directamente sobre $a$.

**Ejemplo numérico.** Un agente saltarín se mueve por una fila de casillas: en la casilla $0$ puede *avanzar* (80% cae en un agujero con $r=-10$, terminal; 20% se queda en $0$ con $r=-1$) o *saltar* (90% llega a la casilla $2$ con $r=-1$; 10% cae en el agujero); desde $2$ puede *avanzar* (90% llega a la meta con $r=+19$, terminal; 10% se queda con $r=-1$) o *saltar* (80% sale del tablero con $r=-5$, terminal; 20% se queda con $r=-1$). Con $\gamma=0{,}9$ y $v^{(0)}(0)=v^{(0)}(2)=0$, aplicar la fórmula de iteración de valores da $v^{(1)}(0)=-1{,}9$, $v^{(1)}(2)=17{,}0$; tras cuatro barridos, $v^{(4)}(0)=13{,}22$, $v^{(4)}(2)=18{,}68$, y el proceso converge a $v^*(0)\approx13{,}23$, $v^*(2)\approx18{,}68$ (verificado con `numpy`). La política óptima resultante es saltar desde $0$ y avanzar desde $2$.

## Interactivo

```widget
motor: rejilla
modo: iteracion-valores
mapa: ["S...", ".X.X", "...X", "X..G"]
gamma: 0.9
estocastico: 0.34
```

- Prueba a ejecutar varios barridos seguidos y observa cómo el valor de la meta se propaga primero a sus vecinos y después, barrido a barrido, al resto del mapa.
- Prueba a bajar $\gamma$ y comprueba que los estados lejanos a la meta quedan con un valor casi nulo aunque el algoritmo converja igual.
- Prueba a comparar, en un mismo estado, la acción que marca la flecha final con la acción de mayor $q$ que calcularías a mano a partir de los valores mostrados.

## En código

```python
import numpy as np

gamma = 0.9
v = np.zeros(2)  # v[0]: casilla 0, v[1]: casilla 2
for _ in range(50):
    q0 = [0.8*(-10) + 0.2*(-1 + gamma*v[0]),
          0.9*(-1 + gamma*v[1]) + 0.1*(-10)]
    q2 = [0.9*19 + 0.1*(-1 + gamma*v[1]),
          0.8*(-5) + 0.2*(-1 + gamma*v[1])]
    v = np.array([max(q0), max(q2)])

print(np.round(v, 2))
# [13.23 18.68]
```

## Errores típicos

- **Error**: pensar que la programación dinámica "aprende" del entorno. → **Correcto**: no interactúa ni observa nada; explota un modelo ya conocido para resolver las ecuaciones de Bellman.
- **Error**: creer que la iteración de políticas se detiene cuando los valores dejan de cambiar. → **Correcto**: se detiene cuando la política deja de cambiar tras un paso de mejora; eso es lo que garantiza que ya es óptima.
- **Error**: confundir iteración de políticas con iteración de valores pensando que ambas mantienen una política explícita durante el proceso. → **Correcto**: la iteración de valores no mantiene ninguna política hasta el final; solo actualiza valores tomando el máximo sobre las acciones.
- **Error**: pensar que hace falta calcular y guardar $q_\pi(s,a)$ como tabla para mejorar una política. → **Correcto**: basta con $v_\pi$ y el modelo; $q_\pi$ se calcula puntualmente para cada acción sin necesidad de almacenarla.

## En resumen

- Qué hace: calcula la política óptima de un MDP cuando se conoce completamente su modelo ($p(s'\mid s,a)$ y la recompensa), sin interactuar con el entorno.
- Cómo funciona: evaluación iterativa de $v_\pi$ → mejora greedy de la política → repetir (iteración de políticas), o fusionar ambos pasos en una sola actualización (iteración de valores).
- Fórmula clave: $v^{(k+1)}(s)=\max_a\sum_{s',r}p(s',r\mid s,a)[r+\gamma v^{(k)}(s')]$.
- Cuándo usarla: entornos pequeños con modelo conocido (juegos de mesa simples, simulaciones, planificación con datos históricos fiables).
- Cuándo no: cuando el modelo es desconocido o el espacio de estados es enorme; ahí hacen falta métodos sin modelo como [[monte-carlo-rl]] o [[td-learning]].
- Decisiones que importan: $\gamma$ (cuánto pesa el futuro) y la tolerancia de parada; en iteración de políticas, además, cuántos barridos de evaluación hacer antes de mejorar.
- La trampa principal: pensar que estos algoritmos aprenden de la experiencia; en realidad planifican sobre un modelo ya dado, y por eso no son aplicables sin él.

## A fondo

La comparación entre iteración de políticas e iteración de valores no es solo de gusto. La iteración de políticas resuelve —o aproxima con varios barridos— un sistema de ecuaciones completo en cada ciclo de evaluación, lo que puede ser costoso si el espacio de estados es grande; a cambio, suele necesitar pocos ciclos de mejora para converger. La iteración de valores hace una única actualización local por estado y barrido, más barata, pero puede necesitar muchos más barridos hasta estabilizarse; su ventaja es que, incluso antes de converger del todo, ya ofrece valores útiles porque propaga información desde los estados terminales hacia atrás desde el primer barrido.

El requisito de un modelo completo limita más de lo que parece incluso en casos aparentemente sencillos: el tres en raya, con reglas deterministas y sin azar, tiene "solo" 5.478 configuraciones distintas de tablero tras aplicar simetrías, y con eso la programación dinámica ya calcula el valor exacto de cada posición sin jugar una sola partida. En problemas con miles de variables continuas o espacios de acciones enormes, resolver la ecuación de Bellman así se vuelve inviable, y es entonces cuando conviene aproximar funciones en vez de tabular cada estado.

Aun con estas limitaciones prácticas, los métodos que siguen —Monte Carlo, TD, y más adelante SARSA o Q-learning— pueden leerse como intentos de calcular las mismas cantidades que aquí se resuelven con modelo explícito, pero estimándolas a partir de experiencia muestreada en vez de resolver la esperanza exacta.

## Autoevaluación

### En la iteración de políticas, ¿cuál es el criterio correcto para detener el algoritmo?
- [ ] Que los valores $v_\pi(s)$ dejen de cambiar entre barridos
- [x] Que la política no cambie tras aplicar un paso de mejora
- [ ] Que se hayan completado un número fijo de iteraciones
> Por qué: la iteración de políticas se detiene cuando la mejora deja de producir una política distinta, es decir, cuando $\pi$ ya es greedy respecto a su propia función de valor; los valores exactos no son el criterio, y un número fijo de iteraciones no garantiza optimalidad.

### Un estado tiene dos acciones: $a_1$ con $\sum_{s',r}p(s',r\mid s,a_1)[r+\gamma v(s')] = 4{,}2$ y $a_2$ con valor $3{,}9$. ¿Qué acción elige la política mejorada $\pi'$ en ese estado?
- [ ] $a_2$, porque conviene explorar la opción con menor valor estimado
- [x] $a_1$, porque $\pi'$ es greedy: elige la acción de mayor valor esperado
- [ ] Cualquiera con probabilidad 0,5, porque la mejora de política siempre reparte probabilidad
> Por qué: la mejora de política, $\pi'(s)=\arg\max_a\dots$, es determinista y greedy: siempre selecciona la acción de mayor valor esperado, sin repartir probabilidad entre alternativas.

### ¿Qué distingue fundamentalmente a la programación dinámica de los métodos que se estudian en [[monte-carlo-rl]] y [[td-learning]]?
- [ ] Que la programación dinámica solo sirve para políticas deterministas
- [ ] Que la programación dinámica no usa la ecuación de Bellman
- [x] Que la programación dinámica exige conocer de antemano $p(s'\mid s,a)$ y la recompensa; los otros métodos aprenden solo de la experiencia observada
> Por qué: tanto DP como Monte Carlo y TD se apoyan en la misma estructura recursiva de Bellman; lo que cambia es si esa esperanza se calcula con el modelo exacto (DP) o se aproxima con muestras de interacción real.

### Mientras se ejecuta la iteración de valores, ¿qué política sigue el algoritmo en cada barrido?
- [ ] La política inicial, fijada antes de empezar
- [ ] Una política aleatoria distinta en cada barrido
- [x] Ninguna política explícita: solo se actualizan los valores tomando el máximo sobre las acciones
> Por qué: la iteración de valores fusiona evaluación y mejora en una sola actualización basada en el máximo; solo al final, una vez convergidos los valores, se extrae una política explícita.

## Glosario

- **planificación**: uso de un modelo conocido del entorno para calcular decisiones sin necesidad de interactuar con él, en contraste con aprender de la experiencia.
- **evaluación iterativa de políticas**: método que calcula $v_\pi$ aplicando repetidamente la ecuación de Bellman sobre todos los estados hasta que los valores convergen.
- **mejora de política**: procedimiento que construye una nueva política greedy respecto a la función de valor actual.
- **política greedy**: la que en cada estado elige siempre la acción de mayor valor estimado, sin margen para explorar alternativas.
- **iteración de políticas**: algoritmo que alterna evaluación y mejora hasta que la política deja de cambiar.
- **iteración de valores**: algoritmo que fusiona evaluación y mejora en una sola actualización basada en el máximo sobre acciones.
