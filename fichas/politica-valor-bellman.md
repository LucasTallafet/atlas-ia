---
id: politica-valor-bellman
estado: borrador
---

## En una frase

La política dice qué acción tomar en cada estado; $V$ y $Q$ miden cuán bueno es ese estado o esa acción, y Bellman conecta esos valores con los de los estados sucesores.

## Intuición

En [[mdp]] formalizaste el entorno: estados, acciones, transiciones y recompensas. Pero eso solo describe el terreno de juego; falta decidir cómo se comporta el agente y cómo sabe si lo está haciendo bien.

Piensa en un GPS. La **política** es la ruta que recomienda en cada cruce: "en este cruce, gira a la derecha". El **valor de un estado** es como la estimación de tiempo restante que muestra el GPS al llegar a cada punto: un cruce cercano al destino tiene un valor alto (queda poco), uno lejano o rodeado de atascos tiene un valor bajo. Y el **valor de una acción** es más fino todavía: no solo "cuánto falta desde aquí", sino "cuánto falta si giro a la derecha" frente a "cuánto falta si sigo recto". Las **ecuaciones de Bellman** son la regla que permite calcular esos valores sin recorrer la ruta entera: el valor de un cruce se obtiene sumando lo que cuesta el siguiente tramo más el valor (ya conocido) del cruce al que se llega.

## Explicación

### La política: cómo decide el agente

La **política**, denotada $\pi$, es la regla de decisión del agente. Puede ser **determinista**, $\pi(s)$, que asigna una única acción a cada estado; o **estocástica**, $\pi(a\mid s)$, que da una probabilidad a cada acción posible en ese estado. Las políticas estocásticas son útiles para explorar, para reflejar incertidumbre, o cuando la mejor estrategia real implica variar el comportamiento (por ejemplo, para no ser predecible).

### La función estado-valor $V$

Una vez fijada una política, tiene sentido preguntarse cuán buena es. La **función estado-valor** $v_\pi(s)$ responde: es el retorno esperado si el agente empieza en $s$ y sigue $\pi$ a partir de ahí. No es una certeza sino una esperanza matemática, un promedio sobre todas las trayectorias posibles que induce la política y la estocasticidad del entorno. Un estado con $v_\pi$ alto es preferible como punto de partida, porque de media conduce a más recompensa acumulada.

### La función acción-valor $Q$

La función $v_\pi(s)$ evalúa estados en general, pero no distingue entre las acciones disponibles en ese estado. La **función acción-valor** $q_\pi(s,a)$ sí: estima el retorno esperado si el agente ejecuta la acción $a$ en $s$ y a partir de ahí sigue $\pi$. Esto permite comparar directamente alternativas: si $q_\pi(s,a_1) > q_\pi(s,a_2)$, la acción $a_1$ es preferible en $s$ bajo esa política.

Ambas funciones están relacionadas: el valor de un estado es el promedio de los valores de sus acciones, ponderado por la probabilidad que la política asigna a cada una:
$$
v_\pi(s) = \sum_a \pi(a\mid s)\, q_\pi(s,a)
$$
Por ejemplo, si en un estado la política elige la acción $a_2$ con probabilidad $0{,}8$ y $a_3$ con probabilidad $0{,}2$, y $q_\pi(s,a_2)=0{,}9$, $q_\pi(s,a_3)=0{,}3$, el valor del estado es $0{,}8\times 0{,}9 + 0{,}2\times 0{,}3 = 0{,}78$.

### De la suma infinita a la relación recursiva: Bellman

Calcular $v_\pi(s)$ directamente exigiría sumar recompensas sobre trayectorias infinitas, lo cual no es práctico. La idea de Bellman es explotar que el retorno es recursivo: $G_t = r_{t+1} + \gamma\, G_{t+1}$, es decir, recompensa inmediata más retorno futuro descontado. Aplicando esta identidad a la definición de $v_\pi$, se obtiene una relación que conecta el valor de un estado con el valor de sus estados sucesores, en lugar de con la trayectoria completa. Esa relación es la **ecuación de Bellman**, y convierte un problema global (evaluar toda una política) en subproblemas locales (relacionar cada estado con los siguientes), lo que hace posible resolverlo con métodos iterativos en vez de simular episodios completos.

## Formalización

La función estado-valor y la función acción-valor bajo una política $\pi$ se definen como:

$$
v_\pi(s) = \mathbb{E}_\pi\!\left[\sum_{k=0}^{\infty} \gamma^k r_{t+k+1} \,\middle|\, S_t=s\right], \qquad q_\pi(s,a) = \mathbb{E}_\pi\!\left[\sum_{k=0}^{\infty} \gamma^k r_{t+k+1} \,\middle|\, S_t=s, A_t=a\right]
$$

donde:

- $v_\pi(s)$: retorno esperado partiendo de $s$ y siguiendo $\pi$.
- $q_\pi(s,a)$: retorno esperado partiendo de $s$, ejecutando $a$, y siguiendo $\pi$ desde el siguiente paso.
- $\mathbb{E}_\pi[\cdot]$: esperanza sobre todas las trayectorias posibles bajo $\pi$ y la dinámica del entorno.
- $\gamma^k r_{t+k+1}$: recompensa recibida $k+1$ pasos después de $t$, descontada por $\gamma^k$.

La **ecuación de Bellman para $v_\pi$** expresa el valor de un estado como recompensa inmediata esperada más valor descontado del siguiente estado, promediando sobre la política y la dinámica del entorno:

$$
v_\pi(s) = \sum_a \pi(a\mid s) \sum_{s',r} p(s',r\mid s,a)\,\bigl[r + \gamma\, v_\pi(s')\bigr]
$$

donde:

- $\pi(a\mid s)$: probabilidad de elegir la acción $a$ en el estado $s$ según la política.
- $p(s',r\mid s,a)$: probabilidad conjunta de transitar a $s'$ y recibir recompensa $r$ al ejecutar $a$ en $s$.
- $r$: valor concreto de la recompensa en esa transición.
- $\gamma\, v_\pi(s')$: valor del estado siguiente, descontado un paso.

De forma análoga, la **ecuación de Bellman para $q_\pi$** es:

$$
q_\pi(s,a) = \sum_{s',r} p(s',r\mid s,a)\,\left[r + \gamma \sum_{a'} \pi(a'\mid s')\, q_\pi(s',a')\right]
$$

## Interactivo

```widget
motor: rejilla
modo: valores
mapa: ["S...", ".X.X", "...X", "X..G"]
gamma: 0.9
```

- Prueba a cambiar la recompensa de una casilla intermedia y observa cómo se propaga el cambio a los valores $V(s)$ de las casillas vecinas.
- Prueba a bajar $\gamma$ a un valor cercano a 0 y comprueba que solo las casillas más próximas a la meta acaban con un valor apreciable.
- Prueba a comparar, en un mismo estado, las flechas de política con el valor $V(s)$ que se muestra: la flecha debería apuntar hacia el vecino de mayor valor.

## Errores típicos

- **Error**: pensar que $v_\pi(s)$ es un valor exacto y no una esperanza. → **Correcto**: es un promedio sobre todas las trayectorias posibles inducidas por la política y la estocasticidad del entorno, no un número garantizado.
- **Error**: confundir $v_\pi(s)$ con $q_\pi(s,a)$. → **Correcto**: $v_\pi(s)$ evalúa un estado en general (promediando sobre las acciones que tomaría la política); $q_\pi(s,a)$ evalúa una acción concreta en ese estado, sin promediar sobre ella.
- **Error**: creer que hay que simular episodios completos para calcular $v_\pi(s)$. → **Correcto**: la ecuación de Bellman permite calcularlo (o aproximarlo) de forma recursiva, relacionando cada estado solo con sus sucesores inmediatos.

## En resumen

- **Qué son y para qué sirven:** la política decide qué hacer; $V$ y $Q$ miden cuán bueno es un estado o una acción bajo esa política.
- **Cómo se relacionan:** $v_\pi(s) = \sum_a \pi(a\mid s)\, q_\pi(s,a)$: el valor de un estado es el promedio ponderado de los valores de sus acciones.
- **Fórmula clave:** la ecuación de Bellman, $v_\pi(s) = \sum_a \pi(a\mid s)\sum_{s',r} p(s',r\mid s,a)[r+\gamma v_\pi(s')]$, conecta cada estado con sus sucesores.
- **Por qué importa:** convierte el cálculo de valores (que en principio exige sumar sobre trayectorias infinitas) en una relación recursiva local, resoluble con métodos iterativos.
- **Política determinista vs. estocástica:** la determinista asigna una acción fija por estado; la estocástica, una distribución de probabilidad sobre acciones.
- **Trampa principal:** tratar $V$ y $Q$ como valores ciertos en vez de esperanzas, y olvidar que dependen de la política que se está evaluando.

## A fondo

Las ecuaciones de Bellman no son solo una forma de calcular valores: son el "núcleo computacional" de casi todo el aprendizaje por refuerzo. Permiten evaluar una política sin simular episodios completos, propagar información desde los estados sucesores hacia los anteriores, y sirven de base para algoritmos como la iteración de valores, la mejora de políticas o Q-learning, que se apoyan en versiones de esta misma relación recursiva. La idea central que revelan es que el valor de un estado o una acción nunca se define de forma aislada: siempre depende de los estados que se pueden alcanzar desde él, lo que convierte al aprendizaje por refuerzo en una disciplina fundamentalmente secuencial y predictiva.

## Autoevaluación

### En un estado $s$, la política asigna probabilidad 0,8 a la acción $a_2$ y 0,2 a $a_3$. ¿Cómo se obtiene $v_\pi(s)$ a partir de $q_\pi(s,a_2)$ y $q_\pi(s,a_3)$?
- [ ] $v_\pi(s) = q_\pi(s,a_2) + q_\pi(s,a_3)$
- [x] $v_\pi(s) = 0{,}8\, q_\pi(s,a_2) + 0{,}2\, q_\pi(s,a_3)$
- [ ] $v_\pi(s) = \max(q_\pi(s,a_2), q_\pi(s,a_3))$
> Por qué: $v_\pi(s)$ es el promedio de los valores $q_\pi(s,a)$ ponderado por la probabilidad que la política asigna a cada acción, no la suma ni el máximo.

### ¿Qué papel juega la identidad $G_t = r_{t+1} + \gamma\, G_{t+1}$ en la derivación de la ecuación de Bellman?
- [ ] Demuestra que el retorno no depende del factor de descuento.
- [x] Permite reescribir el valor de un estado en función del valor de sus sucesores, en vez de una suma infinita de recompensas.
- [ ] Elimina la necesidad de conocer la función de transición.
> Por qué: al expresar el retorno como recompensa inmediata más retorno futuro descontado, se puede separar $v_\pi(s)$ en un término inmediato y un término que depende de $v_\pi(s')$, dando la estructura recursiva de Bellman.

### ¿Cuál es la diferencia esencial entre $v_\pi(s)$ y $q_\pi(s,a)$?
- [ ] $v_\pi(s)$ solo existe en entornos deterministas; $q_\pi(s,a)$ funciona siempre.
- [x] $v_\pi(s)$ evalúa el estado promediando sobre las acciones que tomaría la política; $q_\pi(s,a)$ fija de antemano una acción concreta.
- [ ] No hay diferencia: son dos notaciones para lo mismo.
> Por qué: $q_\pi(s,a)$ condiciona también a la acción inicial $a$, lo que permite comparar decisiones alternativas en el mismo estado; $v_\pi(s)$ ya incorpora el promedio sobre esas decisiones según $\pi$.

## Glosario

- **política $\pi$**: regla de decisión del agente; determinista ($\pi(s)$) o estocástica ($\pi(a\mid s)$).
- **función estado-valor $v_\pi(s)$**: retorno esperado al partir del estado $s$ y seguir la política $\pi$.
- **función acción-valor $q_\pi(s,a)$**: retorno esperado al ejecutar la acción $a$ en $s$ y luego seguir $\pi$.
- **ecuación de Bellman**: relación recursiva que expresa el valor de un estado o acción en función del valor de sus sucesores.
