---
id: rl-fundamentos
estado: borrador
---

## En una frase

El aprendizaje por refuerzo entrena a un agente que prueba acciones en un entorno y aprende, a partir de recompensas y penalizaciones, a decidir cada vez mejor.

## Intuición

Piensa en un niño que aprende a montar en bicicleta. Nadie le da una lista de instrucciones exactas: prueba, se cae, ajusta el equilibrio y con el tiempo asocia ciertos movimientos con no caerse. Ese proceso de prueba, error y ajuste es exactamente lo que hace el **aprendizaje por refuerzo** (*reinforcement learning*, RL): un tercer paradigma de [[tipos-aprendizaje]], distinto de aprender con ejemplos etiquetados o de buscar patrones sin etiquetas.

En RL no hay un profesor que diga "la respuesta correcta era esta". Hay un entorno que responde a cada decisión con una señal numérica —una recompensa o una penalización— y el agente debe descubrir, por su cuenta, qué comportamiento maximiza esa señal a largo plazo. Esto importa en IA porque muchos problemas no tienen "respuestas correctas" etiquetadas de antemano: jugar una partida, controlar un robot o gestionar un almacén son tareas donde solo se sabe si una decisión fue buena después de ver sus consecuencias.

## Explicación

### Agente, entorno y el ciclo de interacción

Un problema de RL tiene dos protagonistas: el **agente**, que toma decisiones, y el **entorno**, con el que interactúa. En cada instante $t$, el agente observa un **estado** $s_t$ (la información relevante de la situación), elige una **acción** $a_t$ de entre las disponibles, y el entorno responde con una **recompensa** $r_{t+1}$ y un nuevo estado $s_{t+1}$. Este ciclo se repite formando una trayectoria: $s_0, a_0, r_1, s_1, a_1, r_2, \dots$

Por ejemplo, en un robot que se mueve por una cuadrícula, el estado es su posición, las acciones son los movimientos posibles y la recompensa puede ser $+1$ al llegar a la casilla objetivo y $0$ en el resto. El objetivo del agente no es maximizar la recompensa de un solo paso, sino aprender una **política** —una estrategia de decisión— que maximice la suma de recompensas a lo largo del tiempo.

Las recompensas no siempre son un único número fijo: pueden variar según la gravedad de la acción. Un dron que reparte paquetes en un almacén podría recibir $+1$ por cada avance sin chocar, $+100$ al completar la entrega, y una penalización de $-50$ si colisiona con una estantería. Esta graduación ayuda al agente a distinguir errores leves de errores graves, y a priorizar el objetivo final (la entrega) sobre los pasos intermedios.

### Exploración y explotación

Para mejorar su política, el agente enfrenta un dilema central: **explotar** lo que ya sabe (elegir la acción que hasta ahora parece mejor) o **explorar** alternativas nuevas que podrían resultar aún mejores. Un agente que solo explota puede quedar atrapado en una solución mediocre sin descubrir nunca una mejor; uno que solo explora nunca llega a aprovechar lo que ha aprendido.

Una estrategia habitual para equilibrar ambos extremos es $\varepsilon$-greedy: con probabilidad $\varepsilon$ el agente elige una acción al azar (explora) y con probabilidad $1-\varepsilon$ elige la que cree mejor (explota). Este equilibrio reaparecerá al formalizar el problema como [[mdp]] y al diseñar los algoritmos que veréis después.

## Formalización

No aplica en este nivel introductorio: los elementos formales del problema (estados, acciones, función de transición, recompensa, factor de descuento) se definen con precisión en [[mdp]].

## Interactivo

```widget
motor: simulacion
modo: bandido
config: {"brazos": [0.2, 0.5, 0.7], "epsilon": 0.1}
semilla: 7
```

- Prueba a poner $\varepsilon=0$ (pura explotación) y observa si el agente se queda atascado en un brazo subóptimo.
- Prueba a subir $\varepsilon$ a 0,5 y compara la recompensa acumulada con $\varepsilon=0,1$: ¿explorar tanto compensa?
- Prueba a dejar correr muchas rondas con $\varepsilon=0,1$ y comprueba si el agente termina eligiendo casi siempre el brazo de recompensa 0,7.

## Errores típicos

- **Error**: pensar que el agente busca maximizar la recompensa inmediata de cada paso. → **Correcto**: el objetivo es maximizar la suma de recompensas a largo plazo, aunque eso implique aceptar recompensas bajas o negativas en el camino.
- **Error**: creer que explorar es "perder el tiempo" y que conviene minimizarlo cuanto antes. → **Correcto**: sin exploración suficiente el agente puede no descubrir nunca la mejor estrategia y quedarse atrapado en una solución mediocre.
- **Error**: confundir recompensa con política. → **Correcto**: la recompensa es la señal numérica que da el entorno tras una acción; la política es la estrategia del agente para elegir acciones. La política se aprende a partir de las recompensas observadas.

## En resumen

- **Qué es y para qué sirve:** un paradigma de aprendizaje en el que un agente aprende por prueba y error, interactuando con un entorno, sin ejemplos etiquetados.
- **Cómo funciona:** (1) el agente observa un estado, (2) elige una acción, (3) el entorno devuelve una recompensa y un nuevo estado, (4) el agente ajusta su política con esa experiencia.
- **Objetivo:** maximizar la suma de recompensas a largo plazo, no la recompensa de un solo paso.
- **Decisión clave:** equilibrar exploración (probar cosas nuevas) y explotación (usar lo ya aprendido), por ejemplo con $\varepsilon$-greedy.
- **Trampa principal:** explotar demasiado pronto impide descubrir estrategias mejores; explorar sin parar impide consolidar una buena política.

## Autoevaluación

### Un agente de RL que juega al ajedrez siempre repite la misma apertura porque le ha dado buenos resultados hasta ahora. ¿Qué le falta?
- [ ] Una recompensa mayor por ganar la partida.
- [x] Exploración: sin probar otras aperturas nunca sabrá si existe una estrategia mejor.
- [ ] Un entorno más grande.
> Por qué: repetir siempre lo mismo es pura explotación; sin exploración el agente no puede descubrir estrategias potencialmente mejores que la que ya conoce.

### En el ciclo agente-entorno, ¿qué recibe el agente justo después de ejecutar una acción $a_t$ en el estado $s_t$?
- [ ] Solo el nuevo estado $s_{t+1}$.
- [x] Una recompensa $r_{t+1}$ y el nuevo estado $s_{t+1}$.
- [ ] La política óptima calculada por el entorno.
> Por qué: el entorno responde a cada acción con dos cosas: una recompensa que evalúa esa acción y el estado al que se transita; el entorno nunca le entrega al agente una política.

### ¿Por qué el objetivo del agente no es simplemente maximizar la recompensa del siguiente paso?
- [ ] Porque las recompensas inmediatas no existen en RL.
- [x] Porque una decisión con recompensa inmediata baja puede conducir a mayores recompensas acumuladas a largo plazo.
- [ ] Porque el entorno cambia las reglas en cada episodio.
> Por qué: el aprendizaje por refuerzo formaliza la toma de decisiones secuenciales: el agente debe considerar el efecto de sus acciones sobre las recompensas futuras, no solo sobre la inmediata.

## Glosario

- **entorno**: sistema con el que interactúa el agente, que responde a cada acción con una recompensa y un nuevo estado.
- **estado**: información relevante de la situación en un instante dado.
- **acción**: decisión que el agente ejecuta en un estado.
- **recompensa**: valor numérico que el entorno entrega al agente tras una acción, indicando cuán buena o mala fue.
- **exploración y explotación**: dilema entre probar acciones nuevas para descubrir mejores resultados o usar el conocimiento ya adquirido.
