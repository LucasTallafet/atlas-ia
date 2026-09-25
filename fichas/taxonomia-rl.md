---
id: taxonomia-rl
estado: borrador
---

## En una frase

Los algoritmos de RL se clasifican según si conocen el modelo del entorno, si aprenden por episodio o paso a paso, y si estiman valores o aprenden la política directamente.

## Intuición

Después de ver la ecuación de Bellman en [[politica-valor-bellman]], podría parecer que solo hace falta un algoritmo para resolver cualquier problema de RL. Pero existen decenas, porque cada familia responde a una pregunta de diseño distinta: ¿conocemos las reglas del entorno o hay que aprenderlas por experiencia? ¿Podemos esperar a que termine un episodio o conviene aprender en cada paso? ¿La política que usamos para explorar es la misma que queremos perfeccionar? Estas preguntas no son excluyentes: se combinan, como ramas de un mismo árbol que comparten el mismo tronco —la ecuación de Bellman— pero se especializan para problemas distintos.

## Explicación

### Model-based frente a model-free

Si el agente conoce la función de transición $p(s'\mid s,a)$ y la recompensa esperada, puede **planificar**: simular mentalmente las consecuencias de sus acciones sin ejecutarlas en el entorno real. Estos son los métodos **model-based**. Son especialmente útiles cuando cada intento real es costoso o arriesgado (un robot quirúrgico, una central nuclear): mejor simular que aprender por las malas. Cuando el modelo es desconocido —lo habitual en entornos complejos o con usuarios humanos— el agente debe aprender de la experiencia directa, de las transiciones $(s_t,a_t,r_{t+1},s_{t+1})$ que observa: son los métodos **model-free**, que usan muestras reales en lugar de simulaciones.

### Episodios completos frente a paso a paso

Dentro de model-free, los métodos de **Monte Carlo** esperan a que termine un episodio completo y ajustan los valores con la recompensa total obtenida; son intuitivos pero lentos si los episodios son largos. Los métodos de **diferencia temporal** (TD) actualizan tras cada paso, usando la recompensa inmediata más el valor estimado del siguiente estado, sin esperar al final del episodio.

### On-policy frente a off-policy

Entre los métodos TD surge otra distinción: la política que el agente usa para actuar (**política de comportamiento**) puede coincidir o no con la que quiere aprender (**política objetivo**). **SARSA** es on-policy: aprende el valor de la política que realmente ejecuta, incluida su exploración, lo que la hace estable pero potencialmente subóptima si la exploración nunca cesa. **Q-learning** es off-policy: aprende el valor de la política óptima aunque el agente se comporte de forma exploratoria, lo que la hace más potente pero más sensible al ruido de la exploración.

### Basado en valor frente a gradiente de política

Todos los métodos anteriores comparten una filosofía: primero estiman cuánto vale cada estado o acción, y luego deciden en consecuencia. Los métodos de **gradiente de política**, en cambio, parametrizan y ajustan la política directamente, sin pasar por una tabla de valores. Son la opción natural cuando el espacio de acciones es continuo (una fuerza aplicada por un brazo robótico) o cuando la política óptima es estocástica (farolear en el póker). [[policy-gradient]] retoma esta familia con más detalle.

### Predicción frente a control

Por último, cualquier algoritmo persigue uno de dos objetivos: **predicción**, evaluar el rendimiento de una política fija, o **control**, encontrar una política mejor. Cruzando esta distinción con model-based/model-free se obtiene la clasificación de conjunto de esta ficha.

## Formalización

No aplica: esta ficha organiza familias de algoritmos según decisiones de diseño, no introduce fórmulas propias; las ecuaciones que comparten todos ellos son las de Bellman, ya vistas en [[politica-valor-bellman]].

## Interactivo

```widget
motor: grafo
modo: diagrama
direccion: vertical
nodos: [{"id": "rl", "etiqueta": "Algoritmos de RL", "nota": "¿Modelo conocido? ¿Episodio o paso? ¿Misma política?"}, {"id": "mb", "etiqueta": "Model-based", "nota": "Conoce P y R: planifica por simulación"}, {"id": "mf", "etiqueta": "Model-free", "nota": "Aprende de transiciones reales"}, {"id": "mc", "etiqueta": "Monte Carlo", "nota": "Espera al final del episodio"}, {"id": "td", "etiqueta": "Diferencia temporal (TD)", "nota": "Aprende en cada paso"}, {"id": "sarsa", "etiqueta": "SARSA", "nota": "On-policy: estable, conservador"}, {"id": "qlearning", "etiqueta": "Q-learning", "nota": "Off-policy: aprende la política óptima"}, {"id": "pg", "etiqueta": "Gradiente de política", "enlace": "policy-gradient", "nota": "Aprende la política directamente (PPO, A3C)"}]
aristas: [["rl", "mb"], ["rl", "mf"], ["mf", "mc"], ["mf", "td"], ["mf", "pg"], ["td", "sarsa"], ["td", "qlearning"]]
```

- Prueba a seguir la rama Model-free → TD → Q-learning y explica por qué se considera off-policy.
- Prueba a imaginar un brazo robótico con fuerza continua: ¿qué rama del árbol encaja mejor y por qué las demás no sirven directamente?

## Errores típicos

- **Error**: pensar que model-based es siempre mejor porque "sabe más" del entorno. → **Correcto**: solo es aplicable cuando el modelo existe o se puede estimar bien; en la mayoría de entornos reales no se dispone de él.
- **Error**: creer que on-policy y off-policy son solo un detalle técnico sin consecuencias prácticas. → **Correcto**: determinan si el agente aprende el valor de lo que realmente hace (SARSA) o el de la política ideal mientras explora (Q-learning), lo que afecta a la estabilidad y al resultado final.
- **Error**: pensar que los métodos de gradiente de política son una alternativa exótica y poco usada. → **Correcto**: son la base de algoritmos muy extendidos como PPO o A3C, especialmente en acciones continuas o políticas estocásticas.

## En resumen

- **Qué hace:** organiza los algoritmos de RL según tres decisiones de diseño independientes que se pueden combinar.
- **Model-based vs. model-free:** planificar con un modelo conocido, o aprender de transiciones reales sin modelo.
- **Monte Carlo vs. TD:** aprender al final del episodio, o paso a paso con bootstrapping.
- **On-policy vs. off-policy:** SARSA evalúa la política que ejecuta (estable); Q-learning aprende la política óptima aunque explore (potente, más inestable).
- **Valor vs. gradiente de política:** estimar valores y decidir a partir de ellos, o ajustar la política directamente (mejor con acciones continuas o políticas estocásticas).
- **Trampa principal:** no existe un algoritmo universal; la elección depende del acceso al modelo, de si el problema es episódico, y de si las acciones son discretas o continuas.

## Autoevaluación

### Un agente controla un brazo robótico que debe aplicar una fuerza continua (no un conjunto discreto de acciones). ¿Qué familia de métodos encaja mejor?
- [ ] Basados en valor, porque son los más usados en general.
- [x] Gradiente de política, porque puede producir directamente una salida continua sin necesitar una tabla infinita de valores.
- [ ] Monte Carlo puro, porque no depende del espacio de acciones.
> Por qué: los métodos basados en valor necesitan comparar valores entre acciones discretas (o discretizar), lo que es inviable con espacios continuos; el gradiente de política aprende directamente una función que produce la acción.

### SARSA y Q-learning parten de la misma ecuación de Bellman pero se comportan distinto. ¿Cuál es la diferencia clave?
- [ ] SARSA es model-based y Q-learning es model-free.
- [x] SARSA aprende el valor de la política que realmente ejecuta (on-policy); Q-learning aprende el valor de la política óptima aunque explore (off-policy).
- [ ] Q-learning solo funciona con episodios completos, como Monte Carlo.
> Por qué: ambos son TD y model-free; la diferencia está en si la actualización usa la acción que realmente se tomará a continuación (SARSA) o la mejor acción posible según la estimación actual (Q-learning).

### ¿Por qué un robot que cruza un puente inestable con un modelo conocido de probabilidades de derrumbe puede preferir un método model-based?
- [ ] Porque model-based siempre converge más rápido que model-free.
- [x] Porque puede calcular el valor esperado de cada acción por simulación, sin arriesgarse a probar acciones peligrosas en el entorno real.
- [ ] Porque model-based no necesita la ecuación de Bellman.
> Por qué: cuando fallar es costoso o peligroso, planificar con un modelo conocido evita ensayos reales arriesgados; sigue apoyándose en la ecuación de Bellman, solo que resuelta por simulación en vez de por experiencia.

## Glosario

- **model-based**: familia de algoritmos que usa un modelo conocido del entorno ($p$ y $R$) para planificar por simulación.
- **model-free**: familia que aprende directamente de transiciones reales observadas, sin modelo explícito del entorno.
- **Monte Carlo (RL)**: método que actualiza valores usando la recompensa total observada al final de un episodio completo.
- **diferencia temporal (TD)**: método que actualiza valores en cada paso, combinando recompensa inmediata y valor estimado del siguiente estado.
- **on-policy**: aprende el valor de la misma política que se está ejecutando (p. ej., SARSA).
- **off-policy**: aprende el valor de una política distinta (normalmente la óptima) a la que se ejecuta para explorar (p. ej., Q-learning).
