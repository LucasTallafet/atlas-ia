---
id: que-es-ia
estado: borrador
---

## En una frase

La inteligencia artificial diseña agentes que perciben su entorno y actúan sobre él para lograr, de la mejor forma posible, un objetivo.

## Intuición

Piensa en un termostato inteligente: recibe la temperatura de la habitación (percibe), decide si encender la calefacción (actúa) y persigue un objetivo, mantenerte a gusto. Es un ejemplo minúsculo, pero contiene ya los ingredientes de cualquier sistema de IA, desde un filtro de spam hasta un coche autónomo: algo que observa, algo que decide y un fin que orienta esa decisión.

Importa partir de aquí porque "inteligencia artificial" se usa a veces como sinónimo de "máquina que piensa como una persona", y esa idea confunde más de lo que aclara. La mayoría de sistemas de IA no imitan la mente humana: persiguen un objetivo con la información y los recursos que tienen, aunque su forma de "razonar" no se parezca en nada a la nuestra.

## Explicación

### El problema: qué significa que una máquina sea "inteligente"

Decir que una tarea "requeriría inteligencia si la hiciera una persona" es un punto de partida útil pero resbaladizo: depende de qué entendamos por inteligencia, y ahí no hay acuerdo ni entre humanos. La IA rodea ese problema filosófico con una pregunta más manejable: ¿puede un sistema actuar de forma que le sirva, sin necesidad de que "piense" como nosotros?

### Agente, entorno y percepción

Un **agente** es cualquier entidad que percibe su entorno mediante sensores y actúa sobre él mediante actuadores: un dron con cámaras y motores, o un recomendador que lee clics y devuelve sugerencias. El **entorno** en que actúa puede ser **determinista** (una acción siempre tiene la misma consecuencia, como en el ajedrez) o **estocástico** (la misma acción da resultados distintos, como conducir bajo lluvia), y **totalmente observable** (el agente ve todo lo necesario para decidir) o **parcialmente observable** (decide con información incompleta).

La **percepción** es el puente entre entorno y agente, y rara vez es perfecta: llega incompleta o con ruido, como en un coche autónomo cuyos sensores se ven afectados por la niebla.

### Racionalidad: actuar bien, no actuar perfecto

Ser **racional** no es acertar siempre, sino elegir, con la información y el cómputo disponibles, la acción que maximiza la probabilidad de cumplir el objetivo. Un agente con percepción parcial sigue siendo racional si su estrategia es la mejor posible dado lo poco que ve.

El **razonamiento** es el proceso interno con el que el agente elige esa acción, y cambia según el paradigma: reglas lógicas en la IA simbólica, cálculos de probabilidad en la probabilística, patrones aprendidos de datos en la conexionista (los verás en detalle en [[paradigmas-ia]]).

### Un mapa rápido: IA, machine learning y deep learning

La IA es el campo completo: incluye la **IA simbólica** (reglas y sistemas expertos), la **evolutiva** (inspirada en selección natural) y la **probabilística** (redes bayesianas y estadística), entre otras corrientes. Dentro de ese mapa está el **aprendizaje automático (machine learning)**, que aprende patrones directamente de los datos (supervisado, no supervisado o por refuerzo) en vez de seguir reglas fijas. Y dentro de él está el **aprendizaje profundo (deep learning)**, con redes neuronales de muchas capas, que ha impulsado avances como los **modelos de lenguaje grandes (LLMs)** que dan soporte a chatbots como ChatGPT. Toda red profunda es machine learning, pero no todo machine learning es deep learning, y toda IA no aprende necesariamente de datos: un sistema experto con reglas escritas a mano también es IA. Verás esta distinción con más detalle en [[que-es-ml]].

### Qué es, en concreto, un modelo de IA

Un **modelo de IA** es una abstracción matemática que simplifica un problema real para producir soluciones útiles, igual que un mapa no reproduce el territorio pero sirve para orientarse. Lo caracterizan cuatro rasgos: su **estructura** (reglas, funciones ajustadas a datos, capas de una red), su **entrada** (texto, imagen, señales numéricas), su **método de aprendizaje** (supervisado, no supervisado, por refuerzo) y su **salida** (una etiqueta, un número, una acción, contenido nuevo). Un detector de fraude, por ejemplo, aprende de pagos ya etiquetados y su salida es una etiqueta ("legítima" o "fraudulenta"): no entiende el fraude, pero su simplificación basta para ser útil.

## Formalización

No aplica: este concepto es introductorio y conceptual; no define una notación matemática propia. Las formalizaciones de racionalidad, agentes y aprendizaje aparecen en las fichas específicas de cada paradigma y técnica.

## Errores típicos

- **Error**: pensar que "inteligencia artificial" significa que la máquina razona como una persona. → **Correcto**: la mayoría de sistemas de IA simulan procesos cognitivos con reglas o estadística, sin reproducir conciencia ni experiencia subjetiva.
- **Error**: usar "IA", "machine learning" y "deep learning" como sinónimos intercambiables. → **Correcto**: son conjuntos anidados: el deep learning es un subconjunto del machine learning, que a su vez es un subconjunto de la IA.
- **Error**: creer que un agente racional debe tener información completa para actuar bien. → **Correcto**: la racionalidad se mide respecto a lo que el agente percibe y puede computar, no respecto a un conocimiento perfecto del entorno.
- **Error**: confundir el entorno estocástico con el parcialmente observable. → **Correcto**: son dos ejes distintos; un entorno puede ser determinista y parcialmente observable (un puzle con piezas ocultas), o estocástico y totalmente observable (un dado visible que decide el resultado).

## En resumen

- **Qué es:** el campo que diseña agentes capaces de percibir su entorno, procesar información y actuar para cumplir un objetivo.
- **Agente y entorno:** un agente percibe con sensores y actúa con actuadores; el entorno puede ser determinista o estocástico, totalmente o parcialmente observable.
- **Racionalidad:** actuar de la mejor forma posible según la información y los recursos disponibles, no acertar siempre.
- **El mapa:** IA ⊃ machine learning ⊃ deep learning; también existen la IA simbólica, la evolutiva y la probabilística, no basadas (solo) en aprender de datos.
- **Un modelo de IA:** una simplificación matemática de un problema, caracterizada por su estructura, su entrada, su método de aprendizaje y su salida.
- **Cuándo se usa el término:** para cualquier sistema que actúe con un objetivo, aunque su forma de "razonar" no se parezca en nada al pensamiento humano.
- **Trampa principal:** juzgar la inteligencia de un sistema por si imita el comportamiento humano, en vez de por si actúa racionalmente dado lo que sabe.

## A fondo

**Cuatro enfoques históricos.** No hay una única definición de IA aceptada por todos. **Alan Turing** sentó las bases: en 1936 propuso la máquina de Turing, y en 1950 el **Test de Turing**, que evalúa la inteligencia por el comportamiento conversacional, no por el mecanismo interno; hoy se ve más como punto de partida histórico que como prueba definitiva, ya que una máquina podría "aprobarlo" con trucos superficiales. En 1956, **John McCarthy** acuñó el término "inteligencia artificial" desde un enfoque simbólico (impulsó también LISP). **Stuart Russell y Peter Norvig**, en *Artificial Intelligence: A Modern Approach*, organizaron las definiciones en dos ejes —**pensar o actuar como humanos** frente a **pensar o actuar racionalmente**— de los que surgen cuatro categorías: pensar como humano (redes que imitan la visión biológica), actuar como humano (asistentes de voz), pensar racionalmente (sistemas expertos como DENDRAL) y actuar racionalmente (agentes que maximizan una recompensa, como un coche autónomo). Esta última, la del **agente racional**, domina el campo hoy. La iniciativa europea **AI Watch** añadió después autonomía, adaptabilidad e interacción como rasgos definitorios, sin importar el método empleado.

## Autoevaluación

### Un robot aspirador se mueve por una casa cuyo plano completo no conoce de antemano y solo detecta obstáculos al chocar con ellos. ¿Cómo se clasifica ese entorno?
- [ ] Determinista y totalmente observable.
- [ ] Estocástico y totalmente observable.
- [x] Parcialmente observable, porque el robot no tiene acceso completo a la información del espacio antes de actuar.
> Por qué: la observabilidad depende de si el agente percibe todo lo necesario para decidir. Aquí falta información (el plano), así que es parcialmente observable, independientemente de si el movimiento del robot es o no determinista.

### Un modelo de lenguaje responde con fluidez pero a veces inventa datos falsos con total seguridad. Según lo visto en esta ficha, ¿qué se puede afirmar de él?
- [ ] No es un modelo de IA porque comete errores.
- [ ] Es irracional porque no acierta siempre.
- [x] Puede seguir siendo un agente racional si sus respuestas son la mejor estrategia posible dada la información y el cómputo con los que cuenta, aunque el resultado a veces sea erróneo.
> Por qué: la racionalidad se define respecto a la información y los recursos disponibles, no respecto a la perfección del resultado. Cometer errores no basta para descalificar a un sistema como racional.

### ¿Cuál de estas afirmaciones describe mejor la relación entre IA, machine learning y deep learning?
- [ ] Son tres campos independientes que a veces se combinan.
- [x] El deep learning es un subconjunto del machine learning, que a su vez es un subconjunto de la IA.
- [ ] El machine learning es un subconjunto del deep learning.
> Por qué: la IA es el campo más amplio; el machine learning es la rama que aprende de datos en vez de usar reglas fijas; el deep learning es, dentro del machine learning, el enfoque basado en redes neuronales de muchas capas.

### Según Russell y Norvig, ¿qué distingue a un sistema que "actúa racionalmente" de uno que "actúa como un humano"?
- [ ] No hay diferencia real entre ambos enfoques.
- [x] Actuar racionalmente busca la mejor decisión posible según el objetivo, sin necesidad de imitar el comportamiento humano; actuar como humano busca precisamente parecerse a una persona, aunque no sea la opción óptima.
- [ ] Actuar como humano siempre es más eficaz que actuar racionalmente.
> Por qué: son dos ejes distintos de clasificación. Un asistente de voz que imita una conversación humana "actúa como humano"; un sistema de conducción autónoma que optimiza seguridad y eficiencia "actúa racionalmente", aunque su comportamiento no se parezca al de un conductor humano.

## Glosario

- **Agente**: entidad que percibe su entorno mediante sensores y actúa sobre él mediante actuadores.
- **Entorno determinista**: aquel en el que cada acción produce siempre la misma consecuencia.
- **Entorno estocástico**: aquel en el que la misma acción puede producir resultados distintos según el momento.
- **Entorno totalmente observable**: aquel en el que el agente tiene acceso a toda la información necesaria para decidir.
- **Entorno parcialmente observable**: aquel en el que el agente debe decidir con información incompleta.
- **Racionalidad**: capacidad de un agente de tomar la decisión que maximiza su éxito esperado con la información y los recursos disponibles.
- **Modelo de IA**: abstracción matemática o computacional que simplifica un problema para producir soluciones útiles.
- **Test de Turing**: experimento propuesto por Alan Turing en el que una máquina se considera inteligente si su comportamiento conversacional es indistinguible del de un humano.
