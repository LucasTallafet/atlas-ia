---
id: tipos-aprendizaje
estado: borrador
---

## En una frase

El aprendizaje automático tiene tres formas de aprender: con ejemplos etiquetados (supervisado), buscando patrones sin etiquetas (no supervisado) o por prueba y error con recompensas (por refuerzo).

## Intuición

Piensa en tres formas de aprender a jugar al ajedrez. Un **profesor** te corrige cada jugada mostrándote la jugada correcta: aprendes por comparación directa con la respuesta esperada, como en el aprendizaje **supervisado**. Un **explorador** solo observa miles de partidas sin que nadie le diga qué jugadas son buenas, y aun así empieza a notar patrones y aperturas que se repiten: eso es aprendizaje **no supervisado**. Y un **jugador que aprende jugando**, ensayando movimientos y ajustando su estrategia según gana o pierde partidas, ilustra el aprendizaje **por refuerzo**. Las tres son formas legítimas de aprender, pero parten de información muy distinta.

Distinguir estos tres paradigmas es el primer paso antes de elegir cómo abordar cualquier problema de [[que-es-ml|aprendizaje automático]]: la pregunta "¿tengo etiquetas, no las tengo, o tengo un agente que actúa sobre un entorno?" determina qué familia de técnicas aplica.

## Explicación

### Aprendizaje supervisado: aprender con la respuesta correcta delante

En el **aprendizaje supervisado**, el modelo se entrena con datos **etiquetados**: cada entrada viene acompañada de la salida correcta. El modelo ajusta sus parámetros para minimizar el error entre lo que predice y esa etiqueta conocida. Si la salida es una categoría (spam o no spam), es un problema de **clasificación**; si es un valor continuo (el precio de una vivienda), es de **regresión**.

Su ventaja principal es que, al conocerse la respuesta correcta, evaluar el modelo es directo. Su límite principal es justo el opuesto: necesita un conjunto de datos etiquetado, grande y representativo, y etiquetar datos a mano —como hizo el proyecto ImageNet con más de 14 millones de imágenes— puede ser muy costoso.

### Aprendizaje no supervisado: encontrar estructura sin etiquetas

En el **aprendizaje no supervisado** no hay etiquetas: el modelo solo recibe las entradas y debe descubrir por sí mismo patrones, similitudes o estructuras ocultas. Es la opción natural cuando etiquetar los datos es caro, lento o directamente inviable.

Sus dos tareas más comunes son el **agrupamiento** (*clustering*), que reúne datos parecidos en grupos sin conocer de antemano a qué grupo pertenece cada uno, y la **reducción de dimensionalidad**, que simplifica los datos a menos variables conservando la información relevante. A diferencia del supervisado, aquí no hay una etiqueta contra la que comparar, así que evaluar si los patrones encontrados son útiles suele requerir criterio experto. Estas técnicas se tratan en detalle más adelante, en [[clustering]].

### Aprendizaje por refuerzo: aprender por prueba y error

El **aprendizaje por refuerzo** (RL, *reinforcement learning*) no parte de datos fijos, etiquetados o no: un **agente** interactúa con un **entorno**, realiza acciones y recibe una **recompensa** tras cada una. Su objetivo es aprender qué acciones tomar para **maximizar la recompensa acumulada** a lo largo del tiempo, no acertar una predicción puntual.

La diferencia clave frente a los otros dos paradigmas está en la retroalimentación: en supervisado la corrección es inmediata (el error frente a la etiqueta); en RL la recompensa puede llegar mucho después de la acción que la causó, así que el agente debe aprender estrategias a largo plazo, no solo reacciones puntuales. Esto lo hace especialmente adecuado para decisiones secuenciales en entornos dinámicos, como un robot que aprende a navegar o un videojuego. Los detalles de cómo aprende ese agente se cubren en [[rl-fundamentos]].

### Tres paradigmas, un mismo problema visto de tres formas

| Característica | Supervisado | No supervisado | Por refuerzo |
|---|---|---|---|
| Datos de entrenamiento | Etiquetados | Sin etiquetas | Generados por interacción |
| Objetivo | Minimizar el error de predicción | Encontrar estructuras ocultas | Maximizar la recompensa acumulada |
| Retroalimentación | Corrección inmediata (frente a la etiqueta) | No hay retroalimentación directa | Recompensa, a menudo diferida en el tiempo |
| Ejemplo típico | Clasificar correos como spam | Agrupar clientes por comportamiento | Un agente que aprende a jugar un videojuego |

## Formalización

Cada paradigma optimiza un objetivo distinto. En supervisado, se minimiza una función de pérdida entre la predicción y la etiqueta real:

$$
\min_{\boldsymbol\theta} \ \mathcal{L}(y, \hat y)
$$

En refuerzo, el agente maximiza la recompensa acumulada esperada a lo largo del tiempo:

$$
\max_{\pi} \ \mathbb{E}\left[\sum_{t} \gamma^t r_t\right]
$$

donde:

- $y$ es la etiqueta real y $\hat y$ es la predicción del modelo.
- $\mathcal{L}$ es la función de pérdida, que mide el error entre $y$ y $\hat y$.
- $\boldsymbol\theta$ son los parámetros del modelo, ajustados para minimizar $\mathcal{L}$.
- $\pi$ es la política del agente: la regla que decide qué acción tomar en cada estado.
- $r_t$ es la recompensa recibida en el instante $t$.
- $\gamma \in [0,1]$ es el factor de descuento, que da menos peso a las recompensas lejanas en el tiempo.
- $\mathbb{E}[\cdot]$ es la esperanza: el promedio de la recompensa acumulada sobre las posibles trayectorias del agente.

El aprendizaje no supervisado no tiene un objetivo único y universal: cada técnica define su propio criterio (por ejemplo, minimizar la distancia dentro de cada grupo en *clustering*), sin una etiqueta $y$ contra la que comparar.

## Interactivo

```widget
motor: pasos
---
Una app de suscripción registra dos datos de cada cliente: minutos de uso semanales y número de compras. También sabe si el cliente se dio de baja ("fuga").

| Cliente | Min./semana | Compras | ¿Fuga? |
|---|---|---|---|
| A | 120 | 3 | Sí |
| B | 300 | 8 | No |
| C | 40 | 1 | Sí |
| D | 250 | 6 | No |

**Supervisado**: el modelo entrena viendo la columna "¿Fuga?" y aprende a predecirla en clientes nuevos, comparando su predicción con la respuesta correcta.

---
La misma tabla, pero sin la columna "¿Fuga?": solo quedan los datos de comportamiento.

| Cliente | Min./semana | Compras |
|---|---|---|
| A | 120 | 3 |
| B | 300 | 8 |
| C | 40 | 1 |
| D | 250 | 6 |

**No supervisado**: sin etiqueta que seguir, un algoritmo de agrupamiento solo puede notar que A y C se parecen entre sí (uso bajo) y que B y D se parecen entre sí (uso alto), sin saber cuál de los dos grupos tiende a darse de baja.

---
Ahora imagina que cada cliente es un **agente**: cada semana decide si abrir la app o no, y la empresa observa si se queda (recompensa +1) o se da de baja (recompensa −1).

**Por refuerzo**: no hay una tabla fija de partida; el agente aprende explorando acciones (enviar una notificación, ofrecer un descuento) y ajustando su comportamiento según la recompensa que recibe con el tiempo.
```

- Prueba a fijarte en qué columna desaparece entre el primer fotograma y el segundo: esa ausencia es la diferencia entre supervisado y no supervisado.
- Prueba a pensar qué otra señal, además de "fuga o no", podría usarse como recompensa en el tercer fotograma.

## Errores típicos

- **Error**: pensar que el aprendizaje no supervisado no tiene ningún objetivo. → **Correcto**: sí tiene un objetivo, pero lo define el propio algoritmo (agrupar por similitud, preservar varianza al reducir dimensiones), no una etiqueta externa.
- **Error**: creer que el aprendizaje por refuerzo es un caso particular del supervisado porque "también recibe una señal de corrección". → **Correcto**: la recompensa en RL no indica la acción correcta, solo qué tan buena fue una secuencia de decisiones, y puede llegar mucho después de la acción que la causó.
- **Error**: asumir que el clustering y la clasificación supervisada resuelven el mismo problema porque ambos "separan datos en grupos". → **Correcto**: la clasificación asigna una etiqueta ya conocida a datos nuevos; el clustering descubre agrupaciones que no existían de antemano, sin ninguna etiqueta que las defina.
- **Error**: suponer que un problema siempre encaja en un único paradigma. → **Correcto**: el aprendizaje semi-supervisado combina una pequeña cantidad de datos etiquetados con muchos sin etiquetar, y en la práctica muchos sistemas combinan varios enfoques.

## En resumen

- **Qué hace**: clasifica los problemas de ML según qué información recibe el modelo para aprender.
- **Supervisado**: entrena con datos etiquetados minimizando el error de predicción; sirve para clasificación y regresión.
- **No supervisado**: entrena sin etiquetas, descubriendo estructura (agrupamiento, reducción de dimensionalidad); útil cuando etiquetar es caro o inviable.
- **Por refuerzo**: un agente aprende por prueba y error, maximizando la recompensa acumulada, con retroalimentación a menudo diferida en el tiempo.
- **Cómo elegir**: mira qué información tienes disponible: etiquetas claras → supervisado; datos sin etiquetar que explorar → no supervisado; un agente que actúa sobre un entorno → refuerzo.
- **Trampa principal**: confundir "sin retroalimentación explícita" (no supervisado) con "retroalimentación diferida" (refuerzo): en RL sí hay una señal de recompensa, solo que no es una etiqueta.

## A fondo

Dentro del aprendizaje por refuerzo, existen distintas estrategias para aprender el comportamiento óptimo. Los métodos **basados en valor** (como **Q-learning**) no deciden directamente qué hacer: primero aprenden a asignar un valor numérico —la recompensa total esperada— a cada combinación de estado y acción, guardada en una **Q-table**, y luego actúan eligiendo siempre el valor más alto; por eso se consideran indirectos. Los métodos **basados en política** aprenden directamente una regla de comportamiento (una **política**) sin pasar por calcular el valor de cada opción, mediante técnicas como el gradiente de políticas; esto resulta especialmente útil en entornos con muchos estados o variables continuas, donde guardar una tabla de valores sería inviable. Los métodos **actor-crítico** combinan ambos: el **actor** decide la acción según la política aprendida, y el **crítico** evalúa esa decisión y le da una señal de refuerzo o corrección, lo que suele acelerar y estabilizar el aprendizaje frente a usar un solo enfoque.

Un hito histórico del aprendizaje supervisado ilustra el coste real de etiquetar datos: el proyecto **ImageNet**, iniciado en 2007 por Fei-Fei Li, reunió más de 14 millones de imágenes clasificadas en más de 22.000 categorías, en gran parte mediante *crowdsourcing* con miles de personas etiquetando manualmente a través de Amazon Mechanical Turk. El desafío anual derivado de ese proyecto (ILSVRC) impulsó el desarrollo del *deep learning*: en 2012, **AlexNet** demostró que las redes neuronales profundas entrenadas con suficientes datos etiquetados podían superar a los métodos anteriores en reconocimiento de imágenes, marcando un punto de inflexión para el campo.

## Autoevaluación

### Una empresa de telecomunicaciones quiere segmentar a sus clientes en perfiles de uso, sin tener ninguna categoría predefinida. ¿Qué paradigma encaja?
- [ ] Supervisado, porque hay que predecir una etiqueta.
- [x] No supervisado, porque el objetivo es descubrir agrupaciones que no existían de antemano, sin ninguna etiqueta que las guíe.
- [ ] Por refuerzo, porque la empresa quiere maximizar sus beneficios.
> Por qué: sin categorías predefinidas ni etiquetas conocidas, el objetivo es descubrir estructura en los datos, que es justo lo que hace el aprendizaje no supervisado (por ejemplo, mediante clustering).

### ¿Por qué en aprendizaje por refuerzo se dice que la retroalimentación puede estar "diferida en el tiempo"?
- [ ] Porque el agente nunca recibe ninguna recompensa.
- [x] Porque una recompensa puede depender de una secuencia de acciones anteriores, no solo de la última acción tomada.
- [ ] Porque las recompensas siempre llegan antes de que el agente actúe.
> Por qué: a diferencia del error inmediato del aprendizaje supervisado, en RL el efecto de una acción (por ejemplo, un movimiento en una partida) puede no verse reflejado en la recompensa hasta mucho después, lo que obliga al agente a aprender estrategias a largo plazo.

### Un modelo se entrena con miles de correos ya marcados como "spam" o "no spam" para luego clasificar correos nuevos. ¿Qué paradigma es y qué tipo de tarea?
- [ ] No supervisado, tarea de agrupamiento.
- [x] Supervisado, tarea de clasificación, porque cada correo de entrenamiento trae una etiqueta (spam / no spam) y la salida es una categoría.
- [ ] Por refuerzo, porque el modelo recibe una recompensa por cada acierto.
> Por qué: hay datos etiquetados de antemano y la salida es una categoría discreta, lo que define un problema de clasificación dentro del aprendizaje supervisado.

### ¿Qué distingue a los métodos "basados en valor" de los "basados en política" en aprendizaje por refuerzo?
- [ ] Los basados en valor no usan ninguna recompensa.
- [x] Los basados en valor aprenden primero a puntuar cada acción y actúan eligiendo la de mayor valor; los basados en política aprenden directamente una regla de comportamiento, sin pasar por esa puntuación.
- [ ] Los basados en política solo funcionan con tablas de valores.
> Por qué: es la distinción central entre ambas familias: valorar indirectamente cada opción (como en Q-learning) frente a aprender directamente cómo actuar (como en el gradiente de políticas).

## Glosario

- **Aprendizaje supervisado**: paradigma de ML en el que el modelo entrena con datos etiquetados, minimizando el error entre su predicción y la etiqueta real.
- **Aprendizaje no supervisado**: paradigma de ML en el que el modelo entrena sin etiquetas, buscando estructuras o patrones ocultos en los datos.
- **Aprendizaje por refuerzo**: paradigma de ML en el que un agente aprende a actuar en un entorno maximizando una recompensa acumulada a lo largo del tiempo.
- **Política** ($\pi$): regla que indica qué acción tomar en cada estado, aprendida por un agente de refuerzo.
