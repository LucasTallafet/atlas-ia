---
id: historia-ia
estado: borrador
---

## En una frase

La IA nació en 1956 en la Conferencia de Dartmouth, pasó por dos "inviernos" de expectativas rotas y resurgió con el aprendizaje a partir de datos hasta los modelos fundacionales actuales.

## Intuición

La historia de la IA se parece a la de muchas modas tecnológicas: entusiasmo desbordado, promesas que no se cumplen a tiempo, un bajón de confianza y financiación, y después un regreso más sólido apoyado en algo que antes faltaba (más datos, más cómputo, mejores métodos). Entender ese ciclo ayuda a leer con perspectiva el entusiasmo actual por los grandes modelos de lenguaje: no es la primera vez que la IA promete un salto enorme, y conocer los "inviernos" anteriores enseña a distinguir el progreso real de la expectativa inflada.

## Explicación

### Antes de que existiera el nombre

La idea de máquinas que imiten la inteligencia es muy anterior a la informática. **Aristóteles** formalizó la lógica como método de razonamiento; en el siglo XIX, **George Boole** tradujo la lógica a operaciones matemáticas (el álgebra booleana) y **Gottlob Frege** desarrolló la lógica de predicados, que décadas más tarde sustentaría el razonamiento simbólico. **Charles Babbage** diseñó en 1837 la máquina analítica, primer proyecto de ordenador programable, y **Ada Lovelace** intuyó que tal máquina podría manipular símbolos de cualquier tipo, no solo números: una anticipación temprana de la programación.

El paso decisivo llegó con **Alan Turing**, que en 1936 propuso la **máquina de Turing**, un modelo teórico capaz de ejecutar cualquier cálculo computable mediante pasos simples de lectura, escritura y desplazamiento sobre una cinta. De ahí surge el principio de **computabilidad universal**: una máquina suficientemente general puede simular cualquier otra. En 1950 Turing planteó además el **Test de Turing**, proponiendo evaluar la inteligencia de una máquina por su comportamiento conversacional, no por su mecanismo interno.

En paralelo, **Warren McCulloch y Walter Pitts** propusieron en 1943 un modelo matemático de neurona artificial capaz de ejecutar funciones lógicas, germen del enfoque conexionista, y **Norbert Wiener** fundó la cibernética, el estudio de los sistemas de control y retroalimentación en máquinas y organismos.

### La Conferencia de Dartmouth (1956)

En el verano de 1956, **John McCarthy, Marvin Minsky, Nathaniel Rochester y Claude Shannon** convocaron en Dartmouth (EE. UU.) a un grupo de investigadores para explorar si una máquina podía "comportarse de manera inteligente". Ahí se acuñó el término **inteligencia artificial**. Cada organizador aportaba una perspectiva distinta —McCarthy la representación simbólica, Minsky la percepción y el aprendizaje, Shannon la teoría de la información, Rochester la implementación práctica—, y esa diversidad marcó el carácter interdisciplinar del campo desde su nacimiento. Entre los asistentes, **Allen Newell y Herbert Simon** presentaron el *Logic Theorist*, el primer programa capaz de demostrar teoremas matemáticos.

La conferencia no resolvió el problema de la inteligencia, pero tuvo tres impactos duraderos: fijó el nombre del campo, estableció una agenda de investigación (aprendizaje, representación del conocimiento, búsqueda, lenguaje natural) que sigue vigente, y dio pie a los primeros laboratorios de IA en Stanford, el MIT y Carnegie Mellon.

### Primeros éxitos y el primer invierno (1956-1980)

Tras Dartmouth, la IA vivió más de una década de entusiasmo. En 1957, **Frank Rosenblatt** presentó el **perceptrón**, la primera red neuronal capaz de aprender una tarea de clasificación simple a partir de ejemplos, ajustando sus pesos en vez de seguir reglas programadas a mano. Ese mismo año, **Arthur Samuel** creó un programa de damas que mejoraba jugando, uno de los primeros ejemplos prácticos de aprendizaje automático. En 1965 surgió **DENDRAL**, un sistema experto para deducir estructuras moleculares, y en 1966 **ELIZA** simuló una conversación terapéutica con reglas sencillas, lo bastante convincente para que muchos usuarios le atribuyeran comprensión real.

El optimismo chocó pronto con límites técnicos. En 1969, **Marvin Minsky y Seymour Papert** demostraron en su libro *Perceptrons* que el perceptrón simple no podía resolver problemas no separables linealmente, como el XOR, lo que enfrió el interés en las redes neuronales. A la vez, la **explosión combinatoria** hacía intratables los problemas de búsqueda al crecer el espacio de posibilidades, y la **fragilidad** de los sistemas basados en reglas los hacía fallar ante pequeños cambios no previstos. A comienzos de los 70, evaluaciones críticas (en especial sobre traducción automática) provocaron una fuerte reducción de la financiación: el **primer invierno de la IA**.

### El interludio de los sistemas expertos y el segundo invierno (1980-1993)

Lejos de una parálisis total, la década de 1970 y buena parte de los 80 vieron madurar una vía más modesta: los **sistemas expertos**, que capturaban el conocimiento de especialistas humanos en dominios acotados y lo operaban con motores de inferencia. DENDRAL y, sobre todo, **MYCIN** (diagnóstico clínico) mostraron que reglas bien estructuradas podían rendir bien en ámbitos restringidos, y la IA aplicada ganó prestigio comercial.

Ese optimismo también se agotó cuando se hizo evidente el coste real de mantener esos sistemas: adquirir conocimiento experto en reglas explícitas resultaba lento, caro, y ese conocimiento envejecía y se contradecía con nuevos casos. El hardware especializado para IA simbólica perdió sentido frente a ordenadores generalistas más baratos. Así llegó el **segundo invierno**, a finales de los 80 y principios de los 90, conocido como el "cuello de botella del conocimiento".

De ambos inviernos surgieron dos giros duraderos: el paso de programar reglas a mano a **aprender de los datos**, y el reconocimiento de la **incertidumbre** como rasgo esencial de los entornos reales, que impulsó los modelos probabilísticos y bayesianos.

### Del renacimiento estadístico al deep learning (1990-2018)

En los años 90 la IA se apoyó en **métodos estadísticos de aprendizaje automático** —máquinas de soporte vectorial, árboles de decisión, algoritmos de boosting— entrenados con los datos crecientes que trajo internet. En paralelo maduraron las **redes bayesianas** para razonar bajo incertidumbre. En 1986, **Geoffrey Hinton, David Rumelhart y Ronald Williams** habían popularizado la **retropropagación del error**, el algoritmo que permite entrenar redes neuronales de varias capas ajustando sus pesos hacia atrás desde el error de salida; con más datos y cómputo disponibles, esa técnica se volvería central dos décadas después.

El despegue del **deep learning** llegó con la combinación de grandes volúmenes de datos, la potencia de las GPU y redes neuronales más profundas. En 2012, la red **AlexNet** superó ampliamente a sus competidoras en el concurso ImageNet, consolidando las **redes convolucionales (CNN)** como estándar en visión por computador. En 2016, **AlphaGo** (DeepMind) derrotó al campeón mundial de Go. Y en 2017, el artículo *Attention is All You Need* introdujo los **Transformers**, capaces de procesar secuencias en paralelo mediante un mecanismo de atención, mucho más eficiente que las redes recurrentes anteriores: la base técnica de los modelos de lenguaje actuales.

### La era de los modelos fundacionales (2018-hoy)

Desde 2018 dominan los **modelos fundacionales**: arquitecturas masivas entrenadas sobre corpus enormes y adaptables a múltiples tareas, como **BERT** o la familia **GPT**. De ahí nacen los **grandes modelos de lenguaje (LLMs)**, capaces de redactar, traducir o programar, y los modelos **multimodales** como CLIP o DALL·E, que combinan texto e imagen. El impacto ha dejado de ser solo técnico: hoy se discuten sus sesgos, su coste energético, su interpretabilidad y su regulación, como la Ley de IA de la Unión Europea.

## Formalización

No aplica: es un concepto histórico y no introduce notación matemática propia.

## Interactivo

```widget
motor: linea-tiempo
periodos: [{"desde": 1974, "hasta": 1980, "etiqueta": "primer invierno"}, {"desde": 1987, "hasta": 1993, "etiqueta": "segundo invierno"}]
hitos: [{"año": 1936, "titulo": "Máquina de Turing", "texto": "Alan Turing formaliza qué puede calcular una máquina."}, {"año": 1950, "titulo": "Test de Turing", "texto": "Turing propone evaluar la inteligencia por el comportamiento conversacional."}, {"año": 1956, "titulo": "Conferencia de Dartmouth", "texto": "McCarthy, Minsky, Rochester y Shannon acuñan el término 'inteligencia artificial'."}, {"año": 1957, "titulo": "Perceptrón", "texto": "Frank Rosenblatt presenta la primera red neuronal que aprende de ejemplos."}, {"año": 1965, "titulo": "DENDRAL", "texto": "Primer sistema experto relevante, para química analítica."}, {"año": 1969, "titulo": "Crítica al perceptrón", "texto": "Minsky y Papert muestran que no resuelve problemas no lineales como XOR."}, {"año": 1980, "titulo": "Auge de los sistemas expertos", "texto": "MYCIN y otros sistemas capturan conocimiento experto con reglas."}, {"año": 1986, "titulo": "Retropropagación", "texto": "Hinton, Rumelhart y Williams popularizan el entrenamiento de redes multicapa."}, {"año": 2012, "titulo": "AlexNet", "texto": "Domina el concurso ImageNet y consolida las redes convolucionales."}, {"año": 2016, "titulo": "AlphaGo", "texto": "DeepMind derrota al campeón mundial de Go."}, {"año": 2017, "titulo": "Transformers", "texto": "'Attention is All You Need' introduce la arquitectura base de los LLMs actuales."}, {"año": 2018, "titulo": "Modelos fundacionales", "texto": "BERT y GPT inauguran la era de los grandes modelos de lenguaje."}]
```

- Prueba a comparar cuánto duró cada "invierno" con el tiempo que pasó entre un hito y el siguiente antes de esa caída.
- Prueba a localizar qué avances técnicos (retropropagación, GPU, Transformers) coinciden con el final de cada periodo de estancamiento.

## Errores típicos

- **Error**: pensar que la IA es un invento reciente, de la última década. → **Correcto**: sus raíces teóricas se remontan a Turing (1936) e incluso a la lógica clásica; lo reciente es la disponibilidad de datos y cómputo para aplicarla a gran escala.
- **Error**: creer que los "inviernos de la IA" significaron que la investigación se detuvo por completo. → **Correcto**: en esos periodos maduraron enfoques pragmáticos, como los sistemas expertos, que sentaron parte de la infraestructura conceptual posterior.
- **Error**: atribuir el auge del deep learning solo a mejores algoritmos. → **Correcto**: la retropropagación ya existía desde 1986; el despegue de 2012 en adelante dependió tanto de más datos como de la potencia de las GPU.
- **Error**: pensar que el Test de Turing y la Conferencia de Dartmouth ocurrieron al mismo tiempo o por las mismas personas. → **Correcto**: Turing lo propuso en 1950, seis años antes de Dartmouth (1956), y no participó en esa conferencia.

## En resumen

- **Qué es:** el recorrido de la IA desde sus antecedentes lógicos y matemáticos hasta los modelos fundacionales actuales.
- **El hito fundacional:** la Conferencia de Dartmouth (1956), que acuñó el término y fijó la agenda de investigación del campo.
- **El patrón cíclico:** entusiasmo → límites técnicos (explosión combinatoria, fragilidad, falta de datos y cómputo) → recorte de financiación ("invierno") → nuevo enfoque que supera esos límites.
- **Dos inviernos clave:** primeros 70 (límites del perceptrón y de la búsqueda) y finales 80-principios 90 (coste de mantener sistemas expertos).
- **El giro que lo desbloqueó:** pasar de programar reglas a mano a aprender de los datos, y aceptar la incertidumbre como parte del problema.
- **Hoy:** modelos fundacionales y LLMs, apoyados en datos masivos, GPU y la arquitectura Transformer (2017).
- **Trampa:** juzgar el progreso solo por los algoritmos, sin tener en cuenta cuánto dependió también de los datos y el hardware disponibles en cada época.

## A fondo

**El perceptrón y el enfoque conexionista.** El perceptrón de Rosenblatt (1957) fue la primera concreción del **enfoque conexionista**: en vez de programar reglas explícitas, el sistema ajusta los pesos de sus conexiones a partir de ejemplos, almacenando el conocimiento de forma distribuida en vez de en símbolos. Este principio —representación paramétrica, aprendizaje por ajuste de pesos, procesamiento distribuido— es el que comparten hoy desde la regresión lineal hasta las redes neuronales más profundas; lo que cambia entre ellas es la arquitectura y la complejidad computacional, no la filosofía de fondo.

**La habitación china y el debate sobre comprender.** El filósofo John Searle formuló en 1980 el argumento de la "habitación china" para cuestionar si superar el Test de Turing implica comprensión real o solo manipulación de símbolos sin significado. Ese debate atraviesa buena parte de la historia posterior de la IA y conecta con la distinción entre [[ia-debil-general|IA débil e IA general]].

## Autoevaluación

### ¿Por qué se considera la Conferencia de Dartmouth (1956) el "acto fundacional" de la IA si no produjo avances técnicos inmediatos?
- [ ] Porque fue la primera vez que se construyó una red neuronal funcional.
- [x] Porque fijó el nombre del campo, estableció una agenda de investigación compartida y dio origen a una comunidad científica organizada en laboratorios.
- [ ] Porque resolvió el problema de la explosión combinatoria en la búsqueda.
> Por qué: su valor fue programático e institucional, no técnico: reunió visiones distintas en una agenda común que orientó décadas de investigación posterior.

### Un sistema experto de los años 80 funcionaba muy bien en su dominio, pero se volvió caro de mantener y frágil ante casos nuevos. ¿A qué fase de la historia de la IA corresponde esta situación?
- [ ] Al renacimiento estadístico de los 90.
- [x] Al segundo invierno de la IA (finales de los 80, principios de los 90), causado por el "cuello de botella del conocimiento".
- [ ] Al primer invierno de los años 70.
> Por qué: el coste de adquirir y actualizar conocimiento experto en reglas explícitas, y la fragilidad de esas reglas ante nuevos casos, es precisamente lo que provocó el segundo invierno, distinto de las causas del primero (límites del perceptrón y explosión combinatoria).

### ¿Qué papel jugó el artículo "Attention is All You Need" (2017) en la historia reciente de la IA?
- [ ] Introdujo el primer sistema experto con reglas de inferencia hacia adelante.
- [ ] Demostró los límites del perceptrón simple.
- [x] Presentó la arquitectura Transformer, que procesa secuencias en paralelo con atención y es la base técnica de los grandes modelos de lenguaje actuales.
> Por qué: los Transformers sustituyeron a las redes recurrentes como método dominante para procesar secuencias, y permitieron entrenar los modelos fundacionales (BERT, GPT) que definen la etapa actual.

### ¿Qué tienen en común los dos "inviernos" de la IA, más allá del recorte de financiación?
- [ ] Ambos ocurrieron por falta de interés académico en el tema.
- [x] En ambos casos, expectativas muy optimistas chocaron con límites técnicos reales (del método o de los datos y el cómputo disponibles), lo que provocó una corrección posterior.
- [ ] Ambos fueron causados por la misma crítica de Minsky y Papert sobre el perceptrón.
> Por qué: el patrón se repite: entusiasmo desmedido, extrapolación de éxitos en dominios cerrados a problemas abiertos, choque con limitaciones (combinatoria, fragilidad, coste de conocimiento) y consiguiente repliegue.

## Glosario

- **Conferencia de Dartmouth**: encuentro de investigadores en 1956 que acuñó el término "inteligencia artificial" y fijó su primera agenda de investigación.
- **Invierno de la IA**: periodo de fuerte reducción de financiación e interés tras el choque entre expectativas optimistas y limitaciones técnicas reales.
- **Retropropagación (*backpropagation*)**: algoritmo que entrena redes neuronales de varias capas ajustando los pesos hacia atrás a partir del error de salida.
- **Modelo fundacional**: arquitectura masiva entrenada sobre grandes volúmenes de datos y adaptable después a múltiples tareas.
- **Transformer**: arquitectura de red neuronal que procesa secuencias en paralelo mediante un mecanismo de atención, base de los grandes modelos de lenguaje actuales.
