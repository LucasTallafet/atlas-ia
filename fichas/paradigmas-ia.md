---
id: paradigmas-ia
estado: borrador
---

## En una frase

Un paradigma de IA es una forma distinta de responder a "¿cómo logro que una máquina se comporte de forma inteligente?": con reglas, con redes que aprenden, con evolución simulada o con probabilidad.

## Intuición

Imagina que quieres enseñar a alguien a identificar setas venenosas. Puedes darle un manual de reglas ("si tiene laminillas blancas y anillo, desconfía"), dejar que aprenda mirando cientos de fotos etiquetadas, hacer que pruebe combinaciones de rasgos y se quede con las que mejor funcionan generación tras generación, o enseñarle a estimar la probabilidad de que sea venenosa según lo que se parezca a casos anteriores. Las cuatro estrategias pueden llegar a un buen resultado, pero parten de ideas distintas sobre qué es "razonar". Eso es, exactamente, lo que distingue a los paradigmas de la IA: no son técnicas sueltas, sino visiones distintas del propio concepto de inteligencia.

## Explicación

### IA simbólica: el conocimiento como reglas explícitas

Parte de la **hipótesis del sistema físico de símbolos** de Newell y Simon: cualquier entidad capaz de manipular símbolos con reglas formales puede exhibir comportamiento inteligente. El conocimiento se representa de forma explícita (hechos, reglas, ontologías) y un [[motores-inferencia|motor de inferencia]] deriva conclusiones nuevas a partir de él, guiado por **búsqueda heurística** para no perderse en la explosión combinatoria de posibilidades. Su fuerza es la **transparencia**: cada decisión se puede rastrear hasta la regla que la produjo. Su debilidad es la rigidez: no aprende de los datos, así que le cuesta adaptarse a entornos ambiguos o cambiantes.

### IA conexionista: el conocimiento como pesos ajustados

En vez de programar reglas, propone que la inteligencia emerja de la interacción de muchas unidades simples interconectadas, inspiradas en neuronas biológicas. El sistema **aprende de datos** ajustando los pesos de esas conexiones, no descubriendo símbolos explícitos sino representaciones internas implícitas. Es el paradigma detrás de las redes neuronales, desde el perceptrón hasta los Transformers actuales. Su fuerza es la **capacidad de generalizar** en tareas perceptivas (visión, voz, lenguaje) donde las reglas explícitas son inviables; su debilidad, la **opacidad** de sus decisiones y su dependencia de grandes volúmenes de datos y cómputo.

### IA evolutiva: el conocimiento como población que se adapta

Inspirada en la selección natural, no busca la mejor estrategia de antemano: define una **población** de soluciones candidatas y una **función de aptitud** que mide qué tan buena es cada una, y deja que operadores de **mutación**, **cruce** y **selección** las hagan evolucionar generación tras generación. Los **algoritmos genéticos** son su técnica más conocida, aunque también incluye la programación genética o la optimización por enjambres. Su fuerza es la capacidad de explorar espacios de soluciones muy amplios sin fórmulas cerradas; su debilidad, el alto coste computacional y la falta de garantía de encontrar el óptimo.

### IA probabilística: el conocimiento como incertidumbre modelada

Aborda la inteligencia como un problema de decidir bajo incertidumbre: un agente asigna **probabilidades** a los posibles estados del mundo y actúa para maximizar su éxito esperado. Los **modelos gráficos probabilísticos**, como las redes bayesianas, representan dependencias entre variables. Aquí encajan también muchos **modelos clásicos de machine learning** (regresión logística, SVM, árboles, boosting), que generalizan a partir de datos con herramientas estadísticas en vez de reglas simbólicas. Su fuerza es manejar el ruido y la ambigüedad de forma coherente y con menos datos que las redes profundas; su debilidad, que a menudo requiere simplificar las suposiciones sobre cómo se distribuyen los datos.

### Paradigmas híbridos

Ningún sistema moderno se limita casi nunca a un único paradigma. Un agente que combina reglas simbólicas para el conocimiento estable, redes neuronales para percibir patrones y modelos probabilísticos para decidir bajo incertidumbre suele ser más robusto que cualquiera de los tres por separado. Verás esta combinación en detalle al estudiar cómo se representa el conocimiento en [[representacion-conocimiento]].

## Formalización

No aplica: los paradigmas son marcos conceptuales; cada uno se formaliza en las fichas de sus técnicas concretas (por ejemplo, redes neuronales, algoritmos genéticos o inferencia bayesiana).

## Interactivo

```widget
motor: grafo
modo: diagrama
direccion: vertical
nodos: [{"id": "ia", "etiqueta": "Inteligencia artificial", "nota": "El campo completo"}, {"id": "simbolico", "etiqueta": "IA simbólica", "nota": "Reglas lógicas, motores de inferencia"}, {"id": "conexionista", "etiqueta": "IA conexionista", "nota": "Redes que aprenden de datos"}, {"id": "evolutivo", "etiqueta": "IA evolutiva", "nota": "Población, mutación, selección"}, {"id": "probabilistico", "etiqueta": "IA probabilística", "nota": "Incertidumbre, redes bayesianas"}, {"id": "hibrido", "etiqueta": "Sistemas híbridos", "nota": "Combinan varios paradigmas"}]
aristas: [["ia", "simbolico"], ["ia", "conexionista"], ["ia", "evolutivo"], ["ia", "probabilistico"], ["simbolico", "hibrido", "aporta reglas"], ["conexionista", "hibrido", "aporta percepción"], ["probabilistico", "hibrido", "aporta decisión bajo incertidumbre"]]
```

- Prueba a identificar, para cada paradigma, si su fuerza principal es la transparencia, la capacidad de generalizar, la exploración o el manejo de la incertidumbre.
- Prueba a pensar en un chatbot moderno: ¿qué paradigma domina su forma de generar texto, y qué otro paradigma podría añadirse para hacerlo más fiable?

## Errores típicos

- **Error**: pensar que "aprender de los datos" es exclusivo de las redes neuronales. → **Correcto**: los modelos clásicos de machine learning del paradigma probabilístico (regresión logística, árboles, SVM) también aprenden de datos, sin ser conexionistas.
- **Error**: creer que la IA simbólica es "IA antigua" ya superada. → **Correcto**: sigue siendo preferida en dominios donde se necesita explicabilidad total, como ciertos sistemas críticos, precisamente por lo que la IA conexionista no ofrece.
- **Error**: confundir un algoritmo genético con una red neuronal solo porque ambos "aprenden" o "mejoran". → **Correcto**: la red neuronal ajusta pesos por gradiente sobre una arquitectura fija; el algoritmo genético hace evolucionar una población de soluciones candidatas mediante mutación y selección, sin gradientes.
- **Error**: pensar que un sistema debe pertenecer a un único paradigma. → **Correcto**: la mayoría de sistemas prácticos son híbridos, combinando reglas, aprendizaje y probabilidad según lo que cada parte del problema necesita.

## En resumen

- **Qué es:** las distintas visiones sobre cómo lograr comportamiento inteligente en una máquina: simbólica, conexionista, evolutiva y probabilística.
- **Simbólica:** reglas explícitas + motor de inferencia; transparente pero rígida.
- **Conexionista:** pesos ajustados por aprendizaje; generaliza bien en percepción pero es opaca y necesita muchos datos.
- **Evolutiva:** población + mutación + selección guiada por una función de aptitud; explora mucho pero es costosa.
- **Probabilística:** probabilidades sobre estados del mundo; maneja bien la incertidumbre, pero simplifica supuestos.
- **Híbridos:** la práctica real combina paradigmas para compensar las debilidades de cada uno por separado.
- **Trampa:** juzgar un paradigma como "mejor" en abstracto, en vez de preguntar qué tipo de problema (reglas claras, patrones perceptivos, búsqueda abierta, incertidumbre) hay que resolver.

## A fondo

**Origen histórico de la rivalidad simbólico-conexionista.** El paradigma simbólico dominó las primeras décadas de la IA (sistemas expertos, lógica de predicados), mientras que el conexionista quedó relegado tras la crítica de Minsky y Papert al perceptrón en 1969. La disputa entre ambos enfoques marcó gran parte del debate teórico del campo durante décadas, hasta que el resurgir de las redes neuronales profundas, ya en el siglo XXI, desplazó el centro de gravedad hacia el conexionismo en la mayoría de aplicaciones perceptivas, sin que el paradigma simbólico desapareciera del todo. Puedes repasar esta evolución con más detalle en [[historia-ia]].

**Variantes del paradigma evolutivo.** Además de los algoritmos genéticos clásicos, existen las estrategias evolutivas (pensadas para optimizar parámetros continuos), la programación genética (donde los "individuos" son programas completos) y métodos inspirados en el comportamiento colectivo, como la optimización por enjambres de partículas o los algoritmos de colonias de hormigas. Comparten la misma filosofía de variación, selección y cooperación para explorar espacios de soluciones sin necesidad de una programación detallada previa, y se aplican sobre todo a problemas de optimización compleja (diseño de estructuras, rutas logísticas, búsqueda de hiperparámetros) donde los métodos deterministas resultan inviables.

## Autoevaluación

### Un banco quiere un sistema de aprobación de créditos cuyas decisiones se puedan explicar por completo ante un regulador. ¿Qué paradigma encaja mejor con ese requisito?
- [ ] IA conexionista, porque generaliza mejor a partir de datos históricos.
- [x] IA simbólica, porque sus decisiones se pueden rastrear hasta reglas explícitas, aunque generalice peor ante casos no previstos por esas reglas.
- [ ] IA evolutiva, porque explora muchas soluciones candidatas.
> Por qué: la transparencia (poder rastrear cada decisión hasta una regla concreta) es precisamente la fortaleza distintiva de la IA simbólica, mientras que la conexionista sacrifica esa trazabilidad a cambio de mejor generalización.

### ¿Qué distingue a un algoritmo genético de una red neuronal entrenada por descenso de gradiente?
- [ ] El algoritmo genético también ajusta pesos mediante retropropagación.
- [x] El algoritmo genético hace evolucionar una población de soluciones candidatas mediante mutación, cruce y selección, sin necesidad de calcular gradientes.
- [ ] Una red neuronal nunca puede resolver problemas de optimización.
> Por qué: son mecanismos de búsqueda distintos: uno explora una población guiada por una función de aptitud; el otro ajusta los parámetros de una arquitectura fija siguiendo el gradiente de una función de pérdida.

### Un clasificador de spam calcula la probabilidad de que un correo sea spam según la frecuencia de ciertas palabras en ejemplos anteriores. ¿A qué paradigma pertenece principalmente?
- [ ] IA evolutiva, porque mejora con el tiempo.
- [x] IA probabilística, porque razona asignando probabilidades a los estados del mundo (spam o no spam) a partir de la evidencia disponible.
- [ ] IA simbólica, porque usa reglas fijas sobre palabras.
> Por qué: estimar la probabilidad de una hipótesis a partir de evidencia parcial (como hace un clasificador bayesiano) es el rasgo distintivo del paradigma probabilístico, no de las reglas fijas del simbólico.

### ¿Por qué la mayoría de sistemas de IA reales no se ajustan a un solo paradigma?
- [ ] Porque los paradigmas son incompatibles entre sí y no pueden combinarse.
- [x] Porque cada paradigma tiene fortalezas y debilidades distintas, y combinarlos permite compensar las debilidades de uno con las fortalezas de otro.
- [ ] Porque el paradigma conexionista ha sustituido por completo a los demás.
> Por qué: un sistema híbrido puede usar reglas simbólicas para conocimiento estable, redes neuronales para percepción y modelos probabilísticos para decidir bajo incertidumbre, siendo más robusto que cualquier paradigma aislado.

## Glosario

- **Paradigma de IA**: enfoque general sobre cómo lograr comportamiento inteligente en una máquina (simbólico, conexionista, evolutivo, probabilístico).
- **Búsqueda heurística**: estrategia que guía la exploración de un espacio de soluciones hacia las opciones más prometedoras, sin garantizar el óptimo.
- **Función de aptitud (*fitness function*)**: criterio que mide qué tan buena es una solución candidata dentro de un algoritmo evolutivo.
- **Modelo gráfico probabilístico**: representación de las dependencias entre variables (como una red bayesiana) usada para razonar bajo incertidumbre.
