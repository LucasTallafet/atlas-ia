---
id: td-learning
estado: borrador
---

## En una frase

TD(0) actualiza el valor de un estado tras cada paso, combinando la recompensa inmediata con su propia estimación del estado siguiente, sin esperar a que el episodio termine.

## Intuición

Piensa en un excursionista que cruza un valle sin mapa y quiere saber cómo varía la altitud del terreno. No puede esperar a terminar toda la ruta para sacar conclusiones: en cada paso, nota si ha subido o bajado respecto al anterior y ajusta ahí mismo su idea de la altitud del tramo que acaba de dejar atrás. No necesita el desnivel total, solo la diferencia entre dos puntos consecutivos.

Eso es TD-learning. A diferencia de [[monte-carlo-rl]], que espera al final del episodio para conocer el retorno completo, TD(0) corrige su estimación del valor de un estado nada más dar un paso, usando la recompensa que acaba de recibir y su propia estimación —todavía imperfecta— del estado al que ha llegado. Esta forma de aprender de las propias predicciones se llama **bootstrapping**, y es lo que permite a TD aprender en tiempo real, incluso en tareas que no tienen un final claro.

## Explicación

### Por qué esperar al final es un problema

Monte Carlo aprende bien, pero solo al final de cada episodio: hasta que no se conoce el retorno completo $G_t$, no hay nada que promediar ([[monte-carlo-rl]]). Eso falla en tareas continuas, sin final definido, y penaliza la velocidad de aprendizaje en episodios largos. El **aprendizaje por diferencias temporales** (TD-learning) resuelve esto actualizando el valor de un estado inmediatamente después de cada transición, sin esperar a nada más.

### Bootstrapping: aprender de la propia predicción

La idea clave es el **bootstrapping**: en vez de esperar al retorno real, TD usa como objetivo la recompensa que acaba de recibir más su propia estimación actual del valor del estado siguiente, $V(s_{t+1})$. Es una aproximación de la ecuación de Bellman ([[politica-valor-bellman]]) en la que la esperanza sobre todas las transiciones posibles se sustituye por la única transición que realmente ocurrió. El agente confía en una predicción que todavía puede ser imprecisa, y la va corrigiendo paso a paso con cada nueva transición observada.

### La regla de actualización TD(0)

Sustituir $V(s_t)$ directamente por la muestra $r_{t+1}+\gamma V(s_{t+1})$ sería muy ruidoso: cada transición individual es solo una realización entre muchas posibles. Por eso, igual que en la actualización incremental de [[monte-carlo-rl|Monte Carlo con $\alpha$ constante]], TD(0) se mueve solo una fracción $\alpha$ hacia esa muestra. La diferencia entre lo que se esperaba y lo que se observó, $\delta_t = r_{t+1}+\gamma V(s_{t+1}) - V(s_t)$, se llama **TD-error**, y es la señal que guía cada corrección.

### TD-learning: lo mejor de dos mundos

TD comparte con Monte Carlo la posibilidad de aprender sin modelo, a partir de experiencia directa; comparte con la programación dinámica ([[programacion-dinamica]]) el uso del bootstrapping para actualizar antes de conocer el resultado final. Esta combinación le permite aprender en tareas continuas o de duración indefinida, adaptarse a cambios en el entorno y hacerlo desde la primera transición observada, sin esperar a acumular episodios completos.

## Formalización

$$
V(s_t) \leftarrow V(s_t) + \alpha\bigl[r_{t+1} + \gamma\, V(s_{t+1}) - V(s_t)\bigr]
$$

donde:
- $V(s_t)$: estimación actual del valor del estado en el que se encontraba el agente.
- $r_{t+1}$: recompensa recibida al pasar de $s_t$ a $s_{t+1}$.
- $\gamma$: factor de descuento.
- $V(s_{t+1})$: estimación actual del valor del estado siguiente (el término de bootstrapping).
- $\alpha$: tasa de aprendizaje.

El término entre corchetes es el **TD-error**:

$$
\delta_t = r_{t+1} + \gamma\, V(s_{t+1}) - V(s_t)
$$

donde los símbolos son los mismos que arriba; $\delta_t$ mide cuánto se equivocó la estimación anterior de $s_t$ a la luz de lo que realmente ocurrió un paso después.

**Ejemplo numérico.** Con $\alpha=0{,}1$, $\gamma=0{,}9$ y $V(0)=V(2)=0$, una transición $0\to2$ con $r=-1$ da $\delta=-1+0{,}9\cdot0-0=-1$ y $V(0)\leftarrow-0{,}1$; una transición $2\to3$ (meta) con $r=+19$ da $\delta=19$ y $V(2)\leftarrow1{,}9$. Si en el episodio siguiente el agente cae desde el estado $0$ directamente en un agujero terminal con $r=-10$, $\delta=-10-(-0{,}1)=-9{,}9$ y $V(0)$ baja a $-1{,}09$ (verificado con Python).

## Interactivo

```widget
motor: rejilla
modo: td0
mapa: ["S...", ".X.X", "...X", "X..G"]
gamma: 0.9
alpha: 0.1
```

- Prueba a dar un solo paso y observa que $V(s)$ ya se actualiza antes de que el episodio termine, a diferencia del modo Monte Carlo.
- Prueba a comparar, tras el mismo número de pasos, los valores de TD(0) con los de Monte Carlo sobre el mismo mapa: fíjate en cuál se estabiliza antes.
- Prueba a subir $\alpha$ y observa cómo las estimaciones oscilan más con cada nueva transición.

## En código

```python
alpha, gamma = 0.1, 0.9
V = {0: 0.0, 1: 0.0, 2: 0.0, 3: 0.0}
transiciones = [(0, -1, 2), (2, 19, 3), (0, -10, 1)]

for s, r, s_sig in transiciones:
    delta = r + gamma * V[s_sig] - V[s]
    V[s] = V[s] + alpha * delta

print({k: round(v, 3) for k, v in V.items()})
# {0: -1.09, 1: 0.0, 2: 1.9, 3: 0.0}
```

## Errores típicos

- **Error**: pensar que TD(0) espera al final del episodio como Monte Carlo. → **Correcto**: actualiza tras cada transición individual, usando $r_{t+1}+\gamma V(s_{t+1})$ en vez del retorno completo.
- **Error**: creer que TD(0) necesita conocer el modelo del entorno, como la programación dinámica. → **Correcto**: solo usa la transición que realmente ocurrió; no requiere $p(s'\mid s,a)$ ni la recompensa esperada.
- **Error**: confundir el TD-error con el error final de la política. → **Correcto**: $\delta_t$ es la diferencia entre una predicción y la siguiente, un error local de un solo paso, no una medida global del rendimiento del agente.
- **Error**: pensar que $\alpha=1$ da la actualización más precisa. → **Correcto**: con $\alpha=1$ la estimación se reemplaza por completo por la última muestra, tan ruidosa como cualquier otra; un $\alpha$ moderado promedia implícitamente muchas transiciones.

## En resumen

- Qué hace: estima $v_\pi(s)$ actualizando su valor tras cada transición individual, sin esperar al final del episodio.
- Cómo funciona: observa $(s_t,r_{t+1},s_{t+1})$ → calcula el TD-error $\delta_t=r_{t+1}+\gamma V(s_{t+1})-V(s_t)$ → mueve $V(s_t)$ una fracción $\alpha$ hacia ese objetivo.
- Fórmula clave: $V(s_t)\leftarrow V(s_t)+\alpha[r_{t+1}+\gamma V(s_{t+1})-V(s_t)]$.
- Cuándo usarlo: entornos continuos o episodios muy largos, cuando conviene aprender en tiempo real en vez de esperar al final.
- Cuándo no: si se dispone del modelo completo, la programación dinámica resuelve el problema sin necesidad de muestrear nada.
- Decisiones que importan: $\alpha$ (velocidad de adaptación frente a estabilidad) y $\gamma$ (cuánto pesa el futuro estimado).
- La trampa principal: el bootstrapping usa una estimación todavía imperfecta como objetivo, así que un error temprano en $V(s_{t+1})$ puede propagarse antes de corregirse.

## A fondo

TD constituye la base operativa de casi todo el RL sin modelo posterior —SARSA, Q-learning, Actor-Critic, y sus versiones con redes neuronales—, precisamente porque no necesita almacenar episodios completos ni esperar a que terminen para aportar información útil. Esto lo hace especialmente valioso en entornos no estacionarios, donde la dinámica cambia con el tiempo: el agente puede adaptarse sobre la marcha, sin reiniciar el entrenamiento.

La contrapartida es que, al depender de una estimación propia en vez del retorno real, TD puede propagar sesgo si $V(s_{t+1})$ está muy alejado del valor verdadero al principio del entrenamiento; Monte Carlo, en cambio, usa siempre un retorno real, sin sesgo, aunque con más varianza. Este compromiso sesgo-varianza entre TD y Monte Carlo —bootstrapping frente a muestreo completo— es uno de los ejes que después distinguen a variantes más avanzadas, como los métodos de $n$ pasos o TD($\lambda$), que interpolan entre ambos extremos.

## Autoevaluación

### En un paso, $V(0)=0$, la transición observada es $0\to2$ con $r=-1$, $V(2)=0$ y $\gamma=0{,}9$. Con $\alpha=0{,}1$, ¿cuál es el nuevo valor de $V(0)$?
- [ ] $0$, porque no ha llegado a un estado terminal
- [x] $-0,1$
- [ ] $-1$, el valor completo de la recompensa observada
> Por qué: $\delta=r+\gamma V(2)-V(0)=-1+0{,}9\cdot0-0=-1$, y $V(0)\leftarrow0+0{,}1\cdot(-1)=-0{,}1$; el agente se mueve solo una fracción $\alpha$ hacia la muestra, no la sustituye por completo.

### ¿En qué momento actualiza TD(0) el valor de un estado, a diferencia de Monte Carlo?
- [ ] Solo al final del episodio, igual que Monte Carlo
- [x] Inmediatamente después de cada transición individual
- [ ] Solo cuando el agente vuelve a visitar el mismo estado
> Por qué: TD(0) usa $r_{t+1}+\gamma V(s_{t+1})$ como objetivo, disponible tras un único paso; Monte Carlo necesita el retorno completo, que solo se conoce al terminar el episodio.

### ¿Qué tiene en común TD(0) con la programación dinámica, y en qué se diferencia claramente?
- [ ] Comparten el uso del modelo del entorno; se diferencian en la tasa de aprendizaje
- [x] Comparten el bootstrapping (usar una estimación del estado siguiente); TD(0) no necesita conocer $p(s'\mid s,a)$ ni la recompensa esperada
- [ ] No comparten nada: TD(0) no usa la ecuación de Bellman
> Por qué: ambos actualizan valores apoyándose en estimaciones de los estados sucesores en vez de esperar al resultado final, pero la programación dinámica calcula esa actualización con el modelo exacto, mientras que TD(0) la aproxima con una única transición muestreada.

### Si se usa $\alpha=1$ en la regla de actualización de TD(0), ¿qué ocurre con $V(s_t)$ tras cada transición?
- [ ] Se queda igual, porque $\alpha=1$ anula la actualización
- [x] Se reemplaza por completo por la muestra $r_{t+1}+\gamma V(s_{t+1})$, sin conservar nada de la estimación anterior
- [ ] Se vuelve independiente de $V(s_{t+1})$
> Por qué: con $\alpha=1$, $V(s_t)\leftarrow V(s_t)+1\cdot[\text{objetivo}-V(s_t)]=\text{objetivo}$; la estimación anterior desaparece por completo y el aprendizaje se vuelve tan ruidoso como la última transición observada.

## Glosario

- **bootstrapping**: técnica de actualizar una estimación usando otra estimación propia (aún imperfecta) en vez de esperar al resultado final observado.
- **TD-error**: diferencia $\delta_t=r_{t+1}+\gamma V(s_{t+1})-V(s_t)$ entre lo que se esperaba y lo que se observó tras una transición.
- **aprendizaje online**: el que actualiza sus estimaciones inmediatamente tras cada paso de interacción, sin esperar a acumular un conjunto de datos completo.
