---
id: sarsa-qlearning
estado: borrador
---

## En una frase
SARSA aprende el valor de las acciones tal y como el agente realmente las ejecuta, con su exploración incluida; Q-learning aprende el valor de la mejor acción posible, aunque el agente esté explorando.

## Intuición

Imagina dos aprendices de repartidor en bici que atajan por una acera junto a un canal. Uno de ellos —SARSA— evalúa cada ruta según lo que **él mismo** suele hacer: si sabe que a veces se despista y se acerca demasiado al borde, su valoración de esa ruta ya incluye el riesgo real de caer. El otro —Q-learning— evalúa cada ruta suponiendo que, a partir de ahí, **siempre** tomará la mejor decisión posible, aunque en la práctica siga explorando y a veces se acerque al borde por error.

El resultado es que el primero aprende una ruta algo más alejada del canal (más segura, porque tiene en cuenta sus propios despistes); el segundo aprende la ruta más corta y rápida, la que pega al borde, porque su aprendizaje asume que nunca se equivocará a partir de ese punto. En [[rl-fundamentos|aprendizaje por refuerzo]], esta diferencia —evaluar la política que de verdad se sigue frente a evaluar la política óptima hipotética— es la que separa el control **on-policy** del **off-policy** (ver [[taxonomia-rl]]), y **SARSA** y **Q-learning** son sus dos representantes clásicos.

## Explicación

### El problema: de evaluar a mejorar

[[td-learning|TD(0)]] estima el valor de los estados bajo una política fija. Pero el objetivo del **control** no es solo evaluar: es aprender qué acción conviene tomar en cada estado. Para eso, en vez de estimar $v_\pi(s)$ se estima directamente la función acción-valor $q(s,a)$, la utilidad de ejecutar la acción $a$ en el estado $s$. Con $q(s,a)$ ya no hace falta un modelo del entorno para decidir: basta comparar los valores de las acciones disponibles.

El agente observa, en cada paso, una transición completa: estado, acción, recompensa, estado siguiente. Con esa transición actualiza $q(s,a)$. La pregunta que separa a los algoritmos de control TD es: **¿con qué valor del estado siguiente se compara la recompensa obtenida?**

### Control on-policy: SARSA

**SARSA** toma su nombre de los cinco elementos de cada transición: *State-Action-Reward-State-Action*, es decir $(s_t,a_t,r_{t+1},s_{t+1},a_{t+1})$. La clave está en el último elemento: $a_{t+1}$ es la acción que el agente **de verdad** va a ejecutar en $s_{t+1}$, elegida con la misma política [[monte-carlo-rl|ε-greedy]] que gobierna todo su comportamiento.

El algoritmo, paso a paso:

1. Observa $s_t$ y elige $a_t$ con la política ε-greedy vigente.
2. Ejecuta $a_t$, recibe $r_{t+1}$ y observa $s_{t+1}$.
3. Elige $a_{t+1}$ en $s_{t+1}$, de nuevo con la política ε-greedy.
4. Actualiza $Q(s_t,a_t)$ usando ese $a_{t+1}$ concreto.
5. Continúa desde $s_{t+1},a_{t+1}$.

Como el valor aprendido incorpora la acción que realmente se ejecutará —incluida la posibilidad de explorar hacia una zona peligrosa—, SARSA es **on-policy**: aprende sobre la política que sigue, no sobre una hipotética política óptima. Esto lo hace más cauteloso en entornos donde la exploración puede salir cara.

### Control off-policy: Q-learning

**Q-learning** rompe esa dependencia. En vez de usar la acción $a_{t+1}$ que realmente se tomará, usa la **mejor** acción posible según la estimación actual, calculada con un máximo:

1. Observa $s_t$ y elige $a_t$ con una política de comportamiento (por ejemplo, ε-greedy).
2. Ejecuta $a_t$, recibe $r_{t+1}$ y observa $s_{t+1}$.
3. Calcula $\max_{a'} Q(s_{t+1},a')$: el mejor valor posible en el siguiente estado.
4. Actualiza $Q(s_t,a_t)$ con ese máximo, sin importar qué acción se ejecute después de verdad.

Esta disociación entre "cómo actúo" (exploratorio) y "qué aprendo" (la política óptima) es la esencia de un algoritmo **off-policy**: el agente puede explorar libremente mientras el valor que construye corresponde siempre a la mejor política, no a la que efectivamente sigue.

### Comparación: por qué SARSA bordea y Q-learning se arriesga

La diferencia se ve mejor en un entorno con una zona peligrosa junto al camino corto (el clásico *cliff walking*, ver el interactivo). Q-learning aprende que la ruta pegada al peligro es la de mayor valor esperado —porque su actualización asume que, a partir de ahí, siempre elegirá bien— y termina prefiriendo esa ruta óptima pero arriesgada. SARSA, en cambio, sabe que su propia política explora con probabilidad $\varepsilon$, así que una ruta pegada al peligro tiene, en la práctica, cierta probabilidad de acabar en desastre; por eso aprende a alejarse un poco, sacrificando unos pasos de más por seguridad. Con $\varepsilon\to0$, ambos convergen a la misma política óptima determinista.

En la práctica, SARSA se prefiere cuando el coste de un error de exploración es alto (robótica física, sistemas con estados irreversibles); Q-learning se usa cuando se busca la política de mayor rendimiento posible y se puede permitir explorar sin consecuencias graves, y es la base conceptual de los Deep Q-Networks (DQN).

## Formalización

SARSA parte de la ecuación de Bellman para $q^\pi$ bajo la política que se sigue:

$$
q^\pi(s_t,a_t) = \mathbb{E}\left[r_{t+1} + \gamma\, q^\pi(s_{t+1},a_{t+1}) \mid s_t,a_t\right]
$$

donde:
- $q^\pi(s_t,a_t)$: valor de ejecutar $a_t$ en $s_t$ siguiendo la política $\pi$.
- $r_{t+1}$: recompensa recibida tras la transición.
- $\gamma$: factor de descuento.
- $a_{t+1}$: acción que el agente ejecutará realmente en $s_{t+1}$, según $\pi$.

De ahí, la regla de actualización de **SARSA**:

$$
Q(s_t,a_t) \leftarrow Q(s_t,a_t) + \alpha\left[r_{t+1} + \gamma\, Q(s_{t+1},a_{t+1}) - Q(s_t,a_t)\right]
$$

donde:
- $\alpha$: tasa de aprendizaje.
- El término entre corchetes es el [[td-learning|error de TD]] $\delta_t$, aquí calculado con la acción $a_{t+1}$ realmente elegida.

**Q-learning** sustituye $Q(s_{t+1},a_{t+1})$ por el máximo sobre todas las acciones posibles:

$$
Q(s_t,a_t) \leftarrow Q(s_t,a_t) + \alpha\left[r_{t+1} + \gamma \max_{a'} Q(s_{t+1},a') - Q(s_t,a_t)\right]
$$

donde:
- $\max_{a'} Q(s_{t+1},a')$: el mejor valor estimado entre todas las acciones disponibles en $s_{t+1}$, sea cual sea la que se ejecute después.
- Para un estado terminal, $Q(s_{\text{terminal}},\cdot)=0$ en ambas reglas.

**Ejemplo numérico.** Partiendo de $Q(0,\text{saltar})=-0{,}9361$ y $Q(2,\text{avanzar})=1{,}9$ (valores acumulados en episodios previos del agente saltarín, con $\gamma=0{,}9$, $\alpha=0{,}1$), un episodio con la trayectoria $(0,\text{saltar})\to(2,-1)$, $(2,\text{avanzar})\to(3,+19)$ actualiza primero $Q(2,\text{avanzar})\leftarrow 1{,}9+0{,}1(19-1{,}9)=3{,}61$. Con ese valor, si la acción realmente elegida en el estado 2 fue avanzar —que también es la de máximo valor—, SARSA y Q-learning coinciden en este paso concreto: $Q(0,\text{saltar})\leftarrow -0{,}9361+0{,}1\left[-1+0{,}9\times3{,}61-(-0{,}9361)\right]=-0{,}618$ (verificado con Python). Solo divergen cuando la acción realmente ejecutada en $s_{t+1}$ **no** coincide con la de máximo valor.

## Interactivo

```widget
motor: rejilla
modo: "sarsa-qlearning"
mapa: ["......", "......", "......", "SCCCCG"]
gamma: 0.9
alpha: 0.5
epsilon: 0.3
recompensa_paso: -1
estocastico: 0
```

Prueba a…
- Prueba a comparar, tras varios cientos de episodios, la ruta que aprende SARSA (fila superior, alejada del acantilado) frente a la que aprende Q-learning (pegada al borde).
- Prueba a subir $\varepsilon$ a 0,5: la ruta óptima de Q-learning empieza a producir más caídas al acantilado durante el entrenamiento, aunque el valor aprendido siga siendo el mismo.
- Prueba a bajar $\varepsilon$ hasta casi 0 tras el entrenamiento: ambas políticas deberían converger a la misma ruta.

## En código

```python
gamma, alpha = 0.9, 0.1
Q = {('0', 'saltar'): -0.9361, ('2', 'avanzar'): 1.9, ('2', 'saltar'): 0.0}

# Actualizamos primero Q(2, avanzar) tras llegar a la meta (+19)
Q[('2', 'avanzar')] += alpha * (19 + gamma * 0 - Q[('2', 'avanzar')])

r, s_sig, a_ejecutada = -1, '2', 'avanzar'  # acción realmente elegida en s'
q_sarsa = Q[('0', 'saltar')] + alpha * (
    r + gamma * Q[(s_sig, a_ejecutada)] - Q[('0', 'saltar')]
)
mejor = max(Q[(s_sig, 'avanzar')], Q[(s_sig, 'saltar')])
q_qlearning = Q[('0', 'saltar')] + alpha * (
    r + gamma * mejor - Q[('0', 'saltar')]
)
print(round(q_sarsa, 4), round(q_qlearning, 4))
# -0.6176 -0.6176 (coinciden porque avanzar también es la acción de máximo valor)
```

## Errores típicos

- **Error**: pensar que Q-learning "no explora". → **Correcto**: Q-learning explora igual que SARSA (con ε-greedy, por ejemplo); lo que cambia es qué valor usa para *actualizar*, no cómo elige la acción que ejecuta.
- **Error**: creer que SARSA y Q-learning siempre dan políticas distintas. → **Correcto**: cuando la acción elegida coincide con la de máximo valor (política casi greedy), ambas actualizaciones coinciden; solo divergen cuando de verdad se explora.
- **Error**: usar $Q(s_{t+1},a_{t+1})$ de SARSA sin haber elegido antes esa acción. → **Correcto**: SARSA necesita conocer $a_{t+1}$ *antes* de actualizar $Q(s_t,a_t)$; por eso se dice que "mira un paso más allá" con la acción ya decidida, no con un máximo hipotético.
- **Error**: suponer que Q-learning converge siempre más rápido en la práctica. → **Correcto**: converge de forma más "optimista" hacia la política óptima, pero puede ser más inestable en entornos ruidosos que SARSA.

## En resumen

- SARSA y Q-learning son algoritmos de **control** basados en TD: aprenden $Q(s,a)$ a partir de transiciones, sin modelo del entorno.
- SARSA es **on-policy**: actualiza con la acción $a_{t+1}$ que de verdad va a ejecutar, así que su valor refleja también los riesgos de su propia exploración.
- Q-learning es **off-policy**: actualiza con $\max_{a'}Q(s_{t+1},a')$, como si a partir de ahí siempre actuara de forma óptima, aunque explore.
- Regla clave: SARSA usa $Q(s_{t+1},a_{t+1})$; Q-learning usa $\max_{a'}Q(s_{t+1},a')$. Todo lo demás es idéntico.
- En entornos con zonas peligrosas junto al camino óptimo (acantilados, estados irreversibles), SARSA aprende rutas más conservadoras y Q-learning rutas más arriesgadas pero de mayor valor teórico.
- Con $\varepsilon\to0$ ambos convergen a la misma política óptima determinista.
- Trampa principal: confundir "cómo se elige la acción" (política de comportamiento, igual en ambos) con "qué valor se usa para aprender" (la diferencia real entre los dos algoritmos).

## A fondo

La tabla comparativa de los tres grandes enfoques de RL sin modelo explícito resume dónde encajan SARSA y Q-learning:

| Criterio | Programación dinámica | Monte Carlo | Diferencias temporales (TD) |
|---|---|---|---|
| Requiere modelo | Sí | No | No |
| Necesita episodios completos | No | Sí | No |
| Tipo de feedback | Simulación exacta | Retorno completo | Recompensa inmediata + bootstrap |
| Convergencia | Exacta (con modelo) | Estocástica (media de retornos) | Estocástica (valor estimado) |
| Velocidad de aprendizaje | Lenta (barrido total) | Lenta en tareas largas | Rápida y online |

SARSA y Q-learning heredan de TD su rasgo distintivo: actualizan en cada paso, sin esperar al final del episodio, y sin necesitar el modelo de transiciones del entorno.

:::ampliacion
Cuando Q-learning se combina con aproximadores de función potentes (redes neuronales) en vez de una tabla, aparece un riesgo conocido como **tríada mortal**: la interacción entre aproximación de funciones, bootstrapping (usar una estimación propia como objetivo) y aprendizaje off-policy puede romper las garantías de convergencia y producir divergencias. Técnicas como las redes objetivo (*target networks*) o la repetición de experiencia (*experience replay*), usadas en Deep Q-Networks, mitigan este problema sin eliminarlo del todo.
Fuente: [ml] 05-Aprendizaje-Refuerzo/06-algoritmos-rl-REINFORCE.md, sección "Introducción: Algoritmos basados en valores y basados en políticas".
:::

## Autoevaluación

### En un mismo episodio, ¿qué diferencia concreta hay entre la actualización de SARSA y la de Q-learning para el mismo paso $(s_t,a_t,r_{t+1},s_{t+1})$?
- [ ] SARSA no explora y Q-learning sí
- [x] SARSA usa $Q(s_{t+1},a_{t+1})$ con la acción realmente elegida después; Q-learning usa $\max_{a'}Q(s_{t+1},a')$
- [ ] Q-learning necesita conocer el modelo de transición y SARSA no
> Por qué: la exploración (ε-greedy) puede ser la misma política de comportamiento en ambos casos; lo único que cambia es qué valor del estado siguiente entra en la actualización.

### En el entorno de cliff walking, ¿por qué Q-learning tiende a aprender la ruta pegada al acantilado mientras entrena con ε-greedy?
- [ ] Porque Q-learning nunca explora cerca del acantilado
- [ ] Porque Q-learning tiene una tasa de aprendizaje mayor
- [x] Porque su actualización asume que, a partir del siguiente estado, siempre se elegirá la acción óptima, ignorando el riesgo de que la exploración real lleve al precipicio
> Por qué: Q-learning es off-policy: aprende el valor de la política óptima aunque el comportamiento real siga siendo exploratorio y a veces se caiga.

### Si $\varepsilon=0$ (política totalmente greedy) durante todo el entrenamiento, ¿qué ocurre con SARSA y Q-learning?
- [ ] Q-learning deja de converger porque no hay exploración
- [x] Las dos actualizaciones coinciden en cada paso, porque $a_{t+1}$ siempre es la acción de máximo valor
- [ ] SARSA deja de ser on-policy
> Por qué: la diferencia entre ambos algoritmos solo se manifiesta cuando la acción realmente ejecutada difiere de la de máximo valor estimado, es decir, cuando hay exploración.

### Un robot físico debe aprender a caminar cerca de un borde del que puede caerse de forma irreversible. ¿Qué algoritmo de los dos es, en principio, más prudente para entrenarlo directamente sobre el hardware real?
- [ ] Q-learning, porque converge a la política óptima más rápido
- [x] SARSA, porque su valor aprendido ya incorpora el riesgo de que la propia exploración lo acerque al borde
- [ ] Da igual, ambos aprenden exactamente la misma política durante el entrenamiento
> Por qué: SARSA es on-policy y penaliza en su propia estimación las consecuencias de explorar cerca del peligro, lo que produce comportamientos más conservadores durante el aprendizaje.

## Glosario
- **SARSA**: algoritmo de control on-policy que actualiza $Q(s,a)$ usando la acción $a_{t+1}$ que el agente realmente ejecutará en el siguiente estado.
- **Q-learning**: algoritmo de control off-policy que actualiza $Q(s,a)$ usando el máximo valor posible en el siguiente estado, sin importar la acción realmente ejecutada.
