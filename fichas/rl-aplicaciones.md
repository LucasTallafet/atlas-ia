---
id: rl-aplicaciones
estado: borrador
---

## En una frase
El aprendizaje por refuerzo se usa siempre que un agente deba tomar una secuencia de decisiones en un entorno incierto, aprendiendo de la experiencia en vez de seguir reglas programadas a mano.

## Intuición

Piensa en cualquier tarea donde "lo que hago ahora" condiciona lo que puedo conseguir más adelante, y donde nadie puede escribir de antemano la receta perfecta: mover un brazo robótico para ensamblar una pieza, decidir la siguiente jugada en una partida, elegir la ruta de un camión, o ajustar la dosis de un tratamiento. En todos esos casos, programar el comportamiento óptimo instrucción a instrucción es inviable, pero sí se puede definir qué cuenta como éxito (una recompensa) y dejar que un agente de [[rl-fundamentos|aprendizaje por refuerzo]] descubra, por prueba y error, cómo conseguirlo.

## Explicación

En **robótica**, los agentes de RL aprenden a manipular objetos, caminar o navegar en entornos desconocidos sin que nadie programe cada movimiento articulación a articulación; el agente explora distintas estrategias hasta encontrar la que alcanza el objetivo.

En **juegos y entretenimiento**, RL ha logrado hitos muy visibles: sistemas como AlphaGo han superado a los mejores jugadores humanos en juegos de gran profundidad estratégica como el Go, descubriendo jugadas que la teoría humana no había considerado. En videojuegos de estrategia en tiempo real, agentes de RL aprenden a jugar sin instrucciones explícitas, simplemente ajustando su comportamiento según la recompensa obtenida.

En **optimización de procesos**, empresas de logística usan RL para planificar rutas de entrega, aprendiendo a minimizar tiempos de transporte y costes operativos probando y evaluando distintas combinaciones de rutas.

En el sector **financiero**, se aplica a estrategias de inversión automatizadas: como los mercados cambian constantemente, un agente de RL puede ajustar sus decisiones de asignación de recursos a medida que evoluciona la información disponible.

En **salud**, se ha usado para personalizar tratamientos, aprendiendo qué secuencia de decisiones (por ejemplo, ajustes de dosis) maximiza la efectividad de una terapia y minimiza sus efectos adversos para cada paciente.

El rasgo común a todos estos casos es la **toma de decisiones secuenciales bajo incertidumbre**: el agente no optimiza una única predicción aislada, sino una cadena de decisiones cuyo efecto conjunto solo se conoce con el tiempo.

## Formalización

No aplica: esta ficha describe casos de uso, no introduce ningún objeto matemático nuevo.

## Errores típicos

- **Error**: pensar que el aprendizaje por refuerzo sirve para cualquier problema de predicción. → **Correcto**: RL encaja cuando hay una secuencia de decisiones que afectan al futuro, no para predecir una etiqueta aislada a partir de datos fijos (eso es aprendizaje [[supervisado]]).
- **Error**: creer que estas aplicaciones funcionan igual de bien "de fábrica" en cualquier dominio. → **Correcto**: cada aplicación exige diseñar cuidadosamente el entorno, el espacio de acciones y, sobre todo, la recompensa; un mal diseño de recompensa puede llevar al agente a "hacer trampa" para maximizarla sin resolver el problema real.
- **Error**: suponer que estos sistemas aprenden sin ningún tipo de supervisión humana. → **Correcto**: en muchos casos reales (salud, finanzas) el diseño de la recompensa, las restricciones de seguridad y la validación posterior siguen requiriendo criterio humano.

## En resumen

- RL se aplica donde hay decisiones secuenciales y las reglas óptimas no se pueden programar a mano.
- Casos representativos: robótica (manipulación, navegación), juegos (AlphaGo, videojuegos de estrategia), logística (rutas de entrega), finanzas (estrategias de inversión) y salud (personalización de tratamientos).
- En todos, se sustituye la programación explícita del comportamiento por la definición de una recompensa y la exploración del agente.
- No aplica a problemas de predicción aislada sin componente secuencial: ahí basta el aprendizaje supervisado.
- Trampa principal: una recompensa mal diseñada puede producir un agente que la maximiza sin resolver el problema que se pretendía.

## A fondo

:::ampliacion
**AlphaGo y AlphaZero** combinan búsqueda en árbol de Monte Carlo con redes neuronales entrenadas mediante RL: AlphaGo aprendió primero de partidas humanas y luego se refinó jugando contra sí mismo; AlphaZero prescindió por completo de datos humanos y aprendió Go, ajedrez y shogi desde cero, solo mediante autojuego y las reglas del juego. Es el ejemplo más citado de cómo el aprendizaje por refuerzo puede superar el conocimiento experto acumulado durante siglos.
Fuente: Silver et al., "Mastering the game of Go with deep neural networks and tree search" (2016) y "Mastering the game of Go without human knowledge" (2017).
:::

:::ampliacion
Los sistemas de **recomendación** a gran escala (vídeos, productos, contenido en redes sociales) pueden plantearse como un problema de RL: cada recomendación es una acción, el clic o el tiempo de visualización es la recompensa, y el objetivo es maximizar el compromiso a largo plazo del usuario, no solo el acierto de la siguiente recomendación aislada.
Fuente: Sutton & Barto, *Reinforcement Learning: An Introduction* (2ª ed.), capítulo 16.
:::

:::ampliacion
El ajuste de grandes modelos de lenguaje mediante **[[rlhf]]** (*reinforcement learning from human feedback*) es hoy una de las aplicaciones industriales más relevantes de RL: se entrena un modelo de recompensa a partir de preferencias humanas sobre distintas respuestas, y ese modelo de recompensa guía después el ajuste fino del modelo de lenguaje con algoritmos de la familia del gradiente de política.
Fuente: Sutton & Barto, *Reinforcement Learning: An Introduction* (2ª ed.), capítulo 16.
:::

## Autoevaluación

### ¿Qué característica común convierte a la robótica, los juegos, la logística, las finanzas y la salud en buenos candidatos para el aprendizaje por refuerzo?
- [ ] Que disponen de grandes cantidades de datos etiquetados
- [x] Que requieren tomar una secuencia de decisiones cuyo efecto conjunto solo se observa con el tiempo, en un entorno incierto
- [ ] Que se pueden resolver con una única predicción aislada
> Por qué: RL está pensado para problemas de decisión secuencial bajo incertidumbre, no para predicción de una salida aislada a partir de datos fijos, que es el terreno del aprendizaje supervisado.

### Una empresa de logística diseña una recompensa que premia solo "kilómetros recorridos por hora" para sus rutas de reparto. ¿Qué riesgo típico de estas aplicaciones ilustra este diseño?
- [ ] Ninguno: cuantos más kilómetros por hora, mejor siempre
- [x] Que el agente maximice la recompensa mal diseñada (por ejemplo, dando rodeos rápidos) sin resolver el problema real (entregar los paquetes a tiempo)
- [ ] Que el algoritmo de RL no pueda ejecutarse sin un modelo exacto del tráfico
> Por qué: el diseño de la recompensa es crítico; una métrica mal elegida puede maximizarse de formas que no corresponden al objetivo real del negocio.

### ¿Qué distingue a AlphaZero de AlphaGo en cuanto a su forma de aprender?
- [ ] AlphaZero necesita más partidas humanas que AlphaGo
- [x] AlphaZero aprende exclusivamente por autojuego, sin partir de partidas humanas, mientras que AlphaGo sí se inicializó con ellas
- [ ] AlphaZero no usa ninguna forma de aprendizaje por refuerzo
> Por qué: AlphaGo combinó datos de partidas humanas con autojuego; AlphaZero eliminó por completo esa dependencia y aprendió desde cero solo con las reglas del juego.

## Glosario
- **toma de decisiones secuenciales**: proceso en el que cada decisión afecta al futuro y a las recompensas posteriores; se contrapone a predecir una única salida aislada, como en [[supervisado]].
