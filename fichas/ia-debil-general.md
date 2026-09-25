---
id: ia-debil-general
estado: borrador
---

## En una frase

La IA débil resuelve tareas específicas muy bien pero no transfiere su conocimiento a otras; la IA general, aún teórica, aspira a una inteligencia flexible comparable a la humana.

## Intuición

Un ajedrecista electrónico que juega mejor que cualquier humano no sabría, ni de lejos, preparar la cena o mantener una conversación sobre política: solo sabe jugar al ajedrez. Eso es IA débil: potentísima dentro de su dominio, inútil fuera de él. La IA general sería, en cambio, como una persona que aprende ajedrez, cocina y conversación con la misma cabeza, transfiriendo lo que sabe de un terreno a otro. Hoy todos los sistemas que usamos a diario, por sorprendentes que parezcan, son del primer tipo.

## Explicación

### El problema: ¿especializada o universal?

La distinción entre IA débil e IA general no depende de la técnica usada (reglas, redes neuronales, probabilidad), sino del **alcance de las capacidades** que el sistema despliega. Es una pregunta distinta a "¿cómo razona?" (eso son los [[paradigmas-ia|paradigmas]]): aquí la pregunta es "¿hasta dónde llega lo que sabe hacer?".

### IA débil: especialización sin comprensión

La **IA débil** (o **IA estrecha**, *narrow AI*) agrupa a los sistemas diseñados para una tarea concreta, que resuelven con gran eficacia pero sin comprensión general del mundo ni capacidad de aplicar lo aprendido fuera de su dominio de entrenamiento. Un asistente de voz interpreta órdenes y busca información, pero no puede razonar sobre un tema imprevisto; un modelo de visión médica detecta tumores con precisión superior a un especialista, pero no reconoce una escena cotidiana si no fue entrenado para ello.

Su rendimiento proviene de procesar datos y detectar patrones estadísticos, no de una comprensión real. Esto incluye a los sistemas más avanzados de hoy: los **grandes modelos de lenguaje (LLMs)** como GPT o BERT muestran una versatilidad sorprendente dentro del lenguaje, pero siguen siendo IA débil, limitada a lo aprendido en sus datos de entrenamiento. La IA débil es, en la práctica, la que sostiene casi toda la IA aplicada actual: recomendadores, chatbots, detección de fraude, diagnóstico asistido.

### IA general: un horizonte teórico

La **IA general** (**AGI**, *Artificial General Intelligence*) es una noción aspiracional: sistemas con inteligencia comparable a la humana, capaces de **transferir** aprendizajes entre dominios muy distintos, **razonar de forma abstracta** y **adaptarse** a situaciones no previstas. Un agente con AGI que aprendiera a diagnosticar enfermedades podría, en principio, aplicar esa forma de razonar a la biología, la economía o la ingeniería, igual que una persona transfiere competencias entre ámbitos.

Alcanzar la AGI exigiría superar barreras en tres frentes: el **técnico** (los modelos actuales necesitan mucho más dato y energía que un humano para aprender, e integrar los paradigmas simbólico, conexionista y probabilístico en un mismo sistema sigue abierto), el **filosófico** (¿basta con imitar el comportamiento humano, como proponía el Test de Turing, o hace falta comprensión genuina?) y el **social y ético** (garantizar un desarrollo seguro y beneficioso).

### Más allá de resolver problemas: la capacidad de inventarlos

Una parte del debate va más allá de qué tan bien se resuelven problemas ya definidos. Filósofos como **Hubert Dreyfus** sostienen que la inteligencia real nace de la **experiencia encarnada**: los humanos no solo resolvemos problemas, **descubrimos qué es problemático** en cada situación sin reglas explícitas. Investigadores como **Jürgen Schmidhuber** proponen que un agente verdaderamente inteligente **inventa objetivos nuevos** en vez de limitarse a cumplir los dados, y **Kenneth Stanley** defiende la idea de **open-endedness**: la inteligencia como generación indefinida de problemas y soluciones, sin meta fijada de antemano. Desde esta perspectiva, la diferencia entre IA débil e IA fuerte no está solo en la dificultad de los problemas resueltos, sino en si el sistema puede **formular** problemas nuevos.

## Formalización

No aplica: es una distinción conceptual sobre el alcance de las capacidades de un sistema, no una propiedad matemática.

## Errores típicos

- **Error**: pensar que los LLMs actuales (GPT, BERT y similares) son un primer paso hacia la AGI por su versatilidad conversacional. → **Correcto**: siguen siendo IA débil: su versatilidad está confinada al dominio del lenguaje y a lo aprendido en sus datos de entrenamiento, sin comprensión ni transferencia genuina a otros ámbitos.
- **Error**: creer que la diferencia entre IA débil e IA general depende de la técnica usada (redes neuronales frente a reglas). → **Correcto**: depende del alcance de las capacidades, no de la técnica; tanto un sistema simbólico como uno conexionista pueden ser IA débil.
- **Error**: suponer que un sistema muy potente en su tarea (como un motor de ajedrez sobrehumano) está cerca de la inteligencia general. → **Correcto**: la potencia dentro de un dominio acotado no implica ninguna capacidad de transferir ese conocimiento a otros dominios, que es justamente lo que define a la AGI.
- **Error**: tratar "pasar el Test de Turing" como prueba suficiente de comprensión real. → **Correcto**: el argumento de la habitación china cuestiona precisamente eso: manipular símbolos con éxito no implica comprender su significado.

## En resumen

- **Qué es:** la distinción entre sistemas especializados en una tarea (IA débil) y una inteligencia flexible comparable a la humana, aún teórica (IA general o AGI).
- **IA débil:** eficaz en su dominio, sin comprensión general ni transferencia; es la totalidad de la IA aplicada actual, incluidos los LLMs.
- **IA general:** aspira a razonar de forma abstracta, transferir conocimiento entre dominios y adaptarse a lo imprevisto.
- **Barreras hacia la AGI:** técnicas (eficiencia, integración de paradigmas), filosóficas (¿imitación basta, o hace falta comprensión?) y sociales (desarrollo seguro).
- **Un matiz importante:** algunos autores sitúan la verdadera inteligencia en la capacidad de **inventar problemas nuevos**, no solo de resolver los ya planteados.
- **Cuándo usarlo:** para calibrar expectativas sobre un sistema concreto: pregunta si puede transferir lo aprendido a un dominio distinto, no solo si resuelve bien su tarea.
- **Trampa:** confundir fluidez o versatilidad aparente dentro de un dominio (como el lenguaje) con inteligencia general.

## A fondo

**El argumento de la habitación china.** John Searle formuló en 1980 este experimento mental: una persona encerrada en una habitación, sin saber chino, responde correctamente a preguntas en chino siguiendo un manual de reglas, sin entender nada de lo que procesa. Aplicado a la IA, cuestiona si un modelo que supera el Test de Turing, o un LLM que genera texto coherente, es realmente inteligente o solo simula comprensión. Sigue siendo un punto de referencia en el debate sobre la IA fuerte, aunque se le critica por no contemplar que una máquina integre percepción, acción y aprendizaje continuo de un modo más cercano a la comprensión humana.

**La política como caso límite.** El filósofo Daniel Innerarity extiende este debate a la política: la democracia no es un problema técnico resoluble con datos y algoritmos, sino un ámbito de incertidumbre, valores y juicios morales. La IA optimiza recursos y predice escenarios, pero carece de la capacidad de formular los nuevos problemas políticos que surgen de la deliberación social, un ejemplo concreto de la distinción entre resolver problemas e inventarlos.

## Autoevaluación

### Un modelo de lenguaje redacta ensayos, traduce y resuelve problemas de programación con gran soltura. ¿Basta eso para considerarlo IA general?
- [ ] Sí, porque domina varias tareas de lenguaje distintas al mismo tiempo.
- [x] No, porque toda esa versatilidad ocurre dentro de un único dominio (el lenguaje) y a partir de patrones aprendidos en sus datos de entrenamiento, sin transferencia genuina a dominios no relacionados con él.
- [ ] No, porque los modelos de lenguaje no aprenden de datos.
> Por qué: la IA general exige transferir razonamiento entre dominios muy distintos (por ejemplo, de la biología a la ingeniería), no solo mostrar flexibilidad dentro de un mismo tipo de tarea.

### Según el argumento de la habitación china de Searle, ¿qué queda en duda al ver que un sistema responde correctamente en una conversación?
- [ ] Que el sistema use reglas para generar sus respuestas.
- [x] Que responder correctamente mediante manipulación de símbolos implique una comprensión real del significado de lo que se procesa.
- [ ] Que el sistema pueda pasar el Test de Turing.
> Por qué: Searle separa el éxito conductual (dar respuestas correctas) de la comprensión semántica genuina; el experimento muestra que se puede tener lo primero sin lo segundo.

### Un robot industrial optimiza rutas de ensamblaje con gran eficiencia, pero no puede aplicar ese razonamiento a planificar la logística de un almacén distinto. ¿Cómo se clasifica?
- [x] Como IA débil, porque está especializado en una tarea concreta y no transfiere su conocimiento a un dominio distinto, aunque relacionado.
- [ ] Como IA general, porque optimiza y planifica de forma autónoma.
- [ ] No se puede clasificar sin saber qué paradigma usa internamente.
> Por qué: la clasificación depende del alcance de las capacidades (transferencia entre dominios), no de la técnica usada ni de lo bien que resuelva su tarea original.

### Según autores como Schmidhuber o Stanley, ¿qué aspecto de la inteligencia suele faltar en los sistemas de IA débil actuales?
- [ ] La capacidad de optimizar una función objetivo dada.
- [x] La capacidad de inventar y formular problemas u objetivos nuevos, en vez de limitarse a resolver los ya planteados.
- [ ] La capacidad de aprender de grandes volúmenes de datos.
> Por qué: estos autores sitúan una parte central de la inteligencia en generar problemas nuevos (curiosidad, open-endedness), algo distinto de la mera optimización dentro de un objetivo ya fijado, que es lo que hacen bien los sistemas de IA débil.

## Glosario

- **IA débil (*narrow AI*)**: sistema diseñado para una tarea específica, eficaz en ella pero sin comprensión general ni capacidad de transferir su conocimiento a otros dominios.
- **IA general (AGI, *Artificial General Intelligence*)**: noción teórica de una inteligencia artificial comparable a la humana en amplitud, flexibilidad y capacidad de transferencia entre dominios.
- **Habitación china**: experimento mental de John Searle que cuestiona si manipular símbolos con éxito implica comprensión semántica real.
- **Open-endedness**: idea de que la inteligencia requiere generar indefinidamente problemas y soluciones nuevos, sin un objetivo final fijado de antemano.
