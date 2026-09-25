---
id: tendencias
estado: borrador
---

## En una frase
La IA se dirige hacia modelos multimodales y agentes autónomos, mientras crecen en paralelo el debate sobre su coste energético y la exploración de la computación cuántica.

## Intuición
Esta ficha es como una foto del tiempo, no como un mapa de carreteras: describe hacia dónde sopla el viento hoy, no un destino fijo. En un campo que cambia cada pocos meses, tiene más sentido fijarse en las fuerzas que están en tensión —modelos que hacen más cosas a la vez frente a modelos que gastan menos energía, sistemas que actúan solos frente a sistemas que siguen necesitando supervisión— que memorizar el último anuncio de una empresa. Por eso cada afirmación reciente de esta ficha lleva su fecha: lo que es cierto en 2026 puede dejar de serlo en poco tiempo, y quien la lea después debería contrastarlo.

## Explicación
Como viste en [[llm-aplicaciones]], los LLM ya funcionan como asistentes conversacionales, generadores de código y motores de automatización de tareas repetitivas. Las cuatro tendencias siguientes son, en buena medida, extensiones de esa misma base.

### Modelos multimodales: integrar texto, imagen, audio y vídeo
Los modelos más recientes —como Gemini o GPT-4V— integran distintos tipos de datos (texto, imagen, audio, vídeo) en un mismo espacio de representación, lo que les permite razonar sobre información visual y textual de forma conjunta. Esto abre aplicaciones como generar imágenes a partir de una descripción, analizar documentos complejos o mantener conversaciones enriquecidas con elementos visuales.

### Agentes autónomos: de ejecutar instrucciones a planificar tareas
Conceptos como **AutoGPT** y **BabyAGI** introdujeron la idea de agentes de IA que descomponen un problema complejo en subtareas y las resuelven sin instrucciones explícitas para cada paso, a diferencia de un LLM tradicional que necesita que se le indique exactamente qué hacer. Este avance se apoya en el **meta-learning** ("aprender a aprender"), donde el sistema mejora su forma de resolver tareas a partir de la experiencia acumulada, con aplicaciones en investigación científica, análisis de datos y automatización de procesos.

:::ampliacion
En septiembre de 2026, el 74 % de las empresas planea desplegar agentes autónomos en los próximos dos años (Gartner), y un estudio conjunto de BCG y MIT Sloan señala que el 76 % de los directivos ya describe a estos agentes como "compañeros de trabajo" más que como herramientas. Aun así, solo el 15 % de las organizaciones está probando o desplegando agentes completamente autónomos, y apenas el 27 % cuenta con un marco maduro de gobernanza para gestionarlos: la adopción va por delante de la supervisión.
Fuente: Gartner y estudio conjunto BCG–MIT Sloan, citados en prensa especializada en septiembre de 2026.
:::

### Green AI: la sostenibilidad como límite práctico
En paralelo a modelos más potentes, se investiga en **IA más eficiente y sostenible**: arquitecturas que reduzcan el consumo energético y no dependan de conjuntos de datos descomunales. A esta línea se la conoce como **Green AI**, en contraste con la carrera por el modelo más grande posible sin atender a su coste computacional.

:::ampliacion
Según el AI Index Report 2026 de Stanford, el entrenamiento de los modelos más grandes deja huellas de carbono muy dispares: 72.816 toneladas de CO₂ equivalente para Grok 4, frente a 8.930 de Llama 3.1 405B y 5.184 de GPT-4. A finales de 2025, los centros de datos de IA ya requerían 29,6 gigavatios de potencia eléctrica, comparable al pico de consumo del estado de Nueva York, y la fase de inferencia —responder a las consultas de los usuarios— puede acumular más energía que el propio entrenamiento en cuestión de meses.
Fuente: Stanford AI Index Report 2026; Schwartz et al., "Green AI" (2020), que introdujo la distinción entre *Red AI* (mejorar resultados a cualquier coste computacional) y *Green AI* (mejorar la eficiencia como objetivo en sí mismo).
:::

### Computación cuántica aplicada al razonamiento probabilístico
Un desarrollo más incipiente es el uso de la computación cuántica para acelerar el razonamiento bajo incertidumbre. Las **redes bayesianas cuánticas** combinan la teoría cuántica de la información con las [[redes-bayesianas]] convencionales, aprovechando la superposición y el entrelazamiento cuántico para hacer inferencias probabilísticas más rápido que los métodos clásicos. De forma similar, los **algoritmos de optimización cuántica** buscan acelerar métodos de inferencia aproximada, como el muestreo de Monte Carlo, explorando el espacio de probabilidad con mayor rapidez. Son, por ahora, resultados de laboratorio: no hay aplicaciones comerciales extendidas.

### Más allá de la técnica: quién decide
El futuro de la IA no depende solo de los avances técnicos, sino también de la sociedad y la política. Regulaciones como el AI Act europeo (ver [[regulacion]]) buscan que ese desarrollo sea seguro y responsable, y el debate sobre una futura inteligencia artificial general —ver [[ia-debil-general]]— sigue abierto, con implicaciones sociales y laborales ya tratadas en [[impacto-social]].

## Formalización
No aplica: es un panorama de tendencias, no un modelo matemático.

## Errores típicos
- **Error**: pensar que "multimodal" significa simplemente "puede recibir varios tipos de archivo". → **Correcto**: implica integrar distintos tipos de datos en un mismo espacio de representación para razonar sobre ellos de forma conjunta, no procesarlos por separado.
- **Error**: creer que un agente autónomo (AutoGPT, BabyAGI) es solo un LLM con más pasos. → **Correcto**: la diferencia clave es que planifica y descompone tareas sin instrucciones explícitas para cada subtarea, apoyándose en técnicas como el meta-learning.
- **Error**: asumir que la alta adopción de agentes autónomos implica que ya están bien gobernados. → **Correcto**: en 2026 la adopción va muy por delante de la gobernanza (74 % frente a 27 % con un marco maduro de supervisión).
- **Error**: pensar que Green AI significa modelos más pequeños sin más. → **Correcto**: busca eficiencia (menos energía, menos datos) como objetivo explícito, lo que puede lograrse con mejor hardware, mejores algoritmos o mejor gestión de datos, no solo reduciendo el tamaño del modelo.

## En resumen
- Cuatro tendencias en tensión: modelos **multimodales** (integran texto, imagen, audio, vídeo), **agentes autónomos** (planifican y ejecutan tareas con poca supervisión), **Green AI** (eficiencia energética frente a modelos cada vez más grandes) y **computación cuántica** aplicada al razonamiento probabilístico, aún en fase de laboratorio.
- El patrón de fondo: más capacidad y autonomía, a la vez que crecen las preguntas sobre coste energético y gobernanza.
- En 2026, la adopción de agentes autónomos va por delante de su supervisión: alta adopción prevista, poca gobernanza madura.
- El coste energético del entrenamiento varía enormemente entre modelos (de miles a decenas de miles de toneladas de CO₂ equivalente), y la fase de inferencia puede superar al entrenamiento en poco tiempo.
- El futuro también depende de la regulación (ver [[regulacion]]) y de cómo se resuelva el debate sobre una IA general (ver [[ia-debil-general]]).
- La trampa principal: tratar esta ficha como un hecho fijo en vez de una fotografía con fecha, dado lo rápido que cambia el terreno.

## A fondo
La computación cuántica aplicada a redes bayesianas tiene un ejemplo ilustrativo en sistemas financieros: una red bayesiana cuántica permitiría, en teoría, analizar riesgos en tiempo real con mayor precisión y velocidad que los métodos clásicos, evaluando probabilidades de eventos adversos en mercados complejos. Aunque los experimentos iniciales son prometedores, la fuente original ya advertía que la tecnología está en sus primeras etapas, y las aplicaciones comerciales de algoritmos cuánticos en razonamiento bajo incertidumbre todavía no se han generalizado.

## Autoevaluación
### ¿Qué distingue a un modelo multimodal de un modelo que simplemente acepta varios formatos de entrada por separado?
- [ ] Que solo procesa texto internamente, aunque reciba imágenes
- [x] Que integra los distintos tipos de datos en un mismo espacio de representación para razonar sobre ellos de forma conjunta
- [ ] Que necesita menos datos de entrenamiento que un modelo de un solo tipo de dato
> Por qué: la clave de la multimodalidad no es aceptar varios formatos, sino combinarlos en una representación compartida que permita, por ejemplo, responder preguntas sobre una imagen usando lenguaje natural.

### Un sistema recibe el objetivo "organiza un viaje de tres días" y, sin que nadie le indique los pasos, busca vuelos, reserva alojamiento y ajusta el itinerario según el presupuesto. ¿Qué tendencia ejemplifica mejor?
- [ ] Green AI
- [x] Agentes autónomos
- [ ] Computación cuántica aplicada al razonamiento probabilístico
> Por qué: descomponer un objetivo en subtareas y ejecutarlas sin instrucciones paso a paso es la característica que distingue a un agente autónomo de un LLM tradicional que solo responde a una instrucción concreta.

### Según los datos de 2026 citados en esta ficha, ¿qué describe mejor la relación entre adopción y gobernanza de los agentes autónomos?
- [ ] Ambas avanzan al mismo ritmo, sin desajustes relevantes
- [x] La adopción va muy por delante de la gobernanza: alta previsión de despliegue, pero pocos marcos de supervisión maduros
- [ ] La gobernanza va por delante de la adopción, que sigue siendo casi nula
> Por qué: los datos citados muestran un 74 % de adopción prevista frente a solo un 27 % de organizaciones con gobernanza madura, un desajuste explícito entre ambas variables.

### ¿Por qué esta ficha insiste en marcar con fecha visible los datos sobre agentes y Green AI, a diferencia de otras fichas del atlas?
- [ ] Porque son los únicos datos verificados con cálculos en Python
- [x] Porque describen el estado de un terreno que cambia muy rápido, y sin fecha la información podría quedar obsoleta sin que se note
- [ ] Porque son opiniones personales, no datos de fuentes externas
> Por qué: a diferencia de un concepto matemático estable, el estado de la adopción de agentes o el consumo energético de los modelos cambia en cuestión de meses; fechar la información permite al lector juzgar si sigue vigente.

## Glosario
- **multimodalidad**: capacidad de un modelo de IA de integrar y razonar conjuntamente sobre distintos tipos de datos (texto, imagen, audio, vídeo) en una misma representación.
- **agente autónomo** (IA agéntica): sistema de IA que descompone un objetivo en subtareas y las ejecuta con poca instrucción paso a paso, a diferencia de un modelo que solo responde a una instrucción concreta.
- **Green AI**: línea de investigación que busca reducir el consumo energético y la dependencia de datos masivos como objetivo explícito, frente a perseguir solo mejores resultados sin atender al coste computacional.
- **red bayesiana cuántica**: variante de una red bayesiana que usa propiedades de la computación cuántica, como la superposición, para acelerar la inferencia probabilística.
