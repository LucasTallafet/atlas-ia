---
id: llm-aplicaciones
estado: borrador
---

## En una frase

Los LLM se usan en la práctica como asistentes conversacionales, generadores y correctores de código, y motores de automatización de tareas repetitivas como informes y resúmenes.

## Intuición

Un chatbot de reglas clásico solo sabe responder a las frases que alguien anticipó al programarlo: fuera de ese guion, se queda bloqueado. Un asistente basado en un [[llms|LLM]] no sigue un guion fijo: genera respuestas nuevas adaptadas al contexto de la conversación, lo que lo hace mucho más flexible, pero también más difícil de controlar del todo.

Esa misma capacidad de generar contenido adaptado a un contexto es la que se aprovecha, más allá de la conversación, para escribir y corregir código o para automatizar tareas repetitivas de análisis y redacción.

## Explicación

### Asistentes conversacionales y chatbots avanzados

Los LLM han transformado los asistentes conversacionales: a diferencia de los chatbots basados en reglas predefinidas, generan respuestas dinámicas adaptadas al contexto del usuario. Se han incorporado en asistentes comerciales, atención al cliente y herramientas de productividad, donde automatizan la gestión de consultas frecuentes o la redacción de respuestas personalizadas.

Esa misma flexibilidad es también su mayor riesgo: al no seguir un guion fijo, un LLM puede generar respuestas inadecuadas o sesgadas. Por eso su despliegue en entornos conversacionales suele combinarse con filtros de seguridad, moderación de contenido y técnicas de ajuste fino como [[rlhf]].

### Generación de código y automatización

Más allá del lenguaje natural, los LLM rinden bien en la **generación de código**. Modelos como Codex y Code Llama, entrenados sobre grandes volúmenes de código fuente, generan fragmentos a partir de instrucciones en lenguaje natural, y se usan en refactorización, corrección de errores y documentación automática.

Esta capacidad se extiende a la **automatización** de tareas repetitivas: generación de scripts y flujos de trabajo, o en sectores como finanzas y analítica de datos, producción de informes y resúmenes automatizados a partir de grandes volúmenes de información.

### Hacia dónde va esto

Estas aplicaciones siguen evolucionando: la tendencia apunta a modelos multimodales y con mayor autonomía, junto con una preocupación creciente por su regulación y uso ético. Ese panorama se desarrolla con más detalle en [[tendencias]].

## Formalización

No aplica: este concepto describe usos prácticos de los LLM en distintos dominios, sin un aparato matemático propio más allá del que ya se cubre en [[llms]].

## Errores típicos

- **Error**: pensar que un asistente basado en LLM funciona igual que un chatbot de reglas, solo que "más inteligente". → **Correcto**: no sigue un guion fijo, genera respuestas nuevas adaptadas al contexto, lo que lo hace más flexible pero también menos predecible.
- **Error**: asumir que un modelo de generación de código entiende el código que produce igual que un programador. → **Correcto**: genera fragmentos a partir de patrones aprendidos en grandes volúmenes de código; conviene revisar y probar lo que produce, no asumir que es correcto.
- **Error**: creer que basta con desplegar el LLM tal cual para un asistente conversacional en producción. → **Correcto**: suele necesitar filtros de seguridad, moderación de contenido y técnicas de alineamiento como RLHF para reducir respuestas inadecuadas.

## En resumen

- **Qué hace:** aplica los LLM a asistentes conversacionales, generación y corrección de código, y automatización de tareas repetitivas.
- **Asistentes:** generan respuestas dinámicas adaptadas al contexto, a diferencia de los chatbots de reglas fijas.
- **Código:** modelos como Codex o Code Llama generan, refactorizan y documentan código a partir de instrucciones en lenguaje natural.
- **Automatización:** scripts, flujos de trabajo e informes automatizados en sectores como finanzas y analítica de datos.
- **Riesgo principal:** la misma flexibilidad que permite respuestas útiles también permite respuestas inadecuadas o sesgadas.
- **Mitigación habitual:** filtros de seguridad, moderación de contenido y ajuste con retroalimentación humana ([[rlhf]]).
- **Trampa principal:** no revisar el código o los informes generados asumiendo que un LLM siempre acierta.

## A fondo

En analítica de datos y finanzas, la aplicación típica no es una única respuesta conversacional, sino la producción de resúmenes e informes a partir de grandes volúmenes de información: un LLM puede condensar documentos extensos, extraer patrones y generar reportes de tendencias que, de hacerse a mano, tomarían mucho más tiempo. Como en la generación de código, ese resumen automatizado sigue siendo un punto de partida que conviene revisar, no un resultado final garantizado.

## Autoevaluación

### ¿Qué distingue a un asistente basado en LLM de un chatbot clásico de reglas?
- [ ] El LLM solo puede responder preguntas que ya estaban previstas de antemano.
- [x] El LLM genera respuestas nuevas adaptadas al contexto, en vez de seguir un guion fijo de respuestas predefinidas.
- [ ] No hay ninguna diferencia real entre ambos enfoques.
> Por qué: los chatbots de reglas responden dentro de un guion cerrado; un LLM genera texto dinámicamente a partir del contexto, lo que amplía sus casos de uso pero también su imprevisibilidad.

### Un equipo despliega un asistente conversacional basado en un LLM sin ningún filtro de seguridad. ¿Cuál es el riesgo principal?
- [ ] Que el modelo deje de generar texto por completo.
- [x] Que genere respuestas inadecuadas o sesgadas, al no seguir un guion controlado.
- [ ] Que el coste de cómputo se reduzca demasiado.
> Por qué: la flexibilidad de un LLM para generar respuestas nuevas es también la fuente del riesgo de respuestas inadecuadas; por eso se combinan con moderación y técnicas de alineamiento.

### Un modelo como Code Llama genera una función a partir de una descripción en lenguaje natural. ¿Qué es razonable hacer a continuación?
- [ ] Desplegar el código directamente, ya que fue generado por un modelo entrenado en grandes volúmenes de código.
- [x] Revisar y probar el código generado antes de usarlo, igual que se revisaría el código de otra persona.
- [ ] Nada: los modelos de generación de código nunca cometen errores de lógica.
> Por qué: el modelo genera código a partir de patrones aprendidos, no de una comprensión garantizada del problema; revisarlo y probarlo sigue siendo necesario.

## Glosario

- **Asistente conversacional**: sistema que interactúa con el usuario en lenguaje natural; con un LLM, genera respuestas dinámicas en vez de seguir un guion fijo.
- **Moderación de contenido**: filtros y controles aplicados a las respuestas de un modelo para evitar contenido inadecuado o dañino.
