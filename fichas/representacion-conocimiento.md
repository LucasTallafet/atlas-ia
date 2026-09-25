---
id: representacion-conocimiento
estado: borrador
---

## En una frase

Representar el conocimiento es traducir hechos y reglas de un dominio a un formato formal que una máquina puede usar para razonar, explicar y decidir, no solo para almacenar datos.

## Intuición

Piensa en la ficha clínica de un paciente. Si solo copias los datos sueltos —"38,5", "tos", "paciente_123"— cualquier lector, humano o máquina, tiene que adivinar qué significan. Pero si escribes "el paciente tiene una temperatura de 38,5 °C" y "el paciente presenta tos", ya no hay ambigüedad: sabes qué es cada dato y con quién se relaciona. Esa diferencia —entre guardar símbolos sueltos y guardar símbolos con su significado y sus relaciones— es la que separa un montón de datos de conocimiento representado.

Importa en inteligencia artificial porque un sistema no puede razonar sobre lo que no entiende: si no sabe que la fiebre es un síntoma y que los síntomas se asocian a enfermedades, nunca podrá sugerir un diagnóstico, aunque tenga el dato delante. Representar bien el conocimiento es lo que permite pasar de acumular datos a poder pensar con ellos.

## Explicación

### De datos a significado: la semántica

Los datos aislados —"38,5", "tos", "paciente_123"— no dicen nada por sí solos. Lo que los convierte en conocimiento es la **semántica** (*semantics*): el significado que un contexto les asigna. Escritos como `temperatura(paciente_123, 38,5)` y `síntoma(paciente_123, tos)`, el sistema ya sabe que la temperatura es un atributo del paciente y que la tos es un síntoma suyo.

Esa semántica se acumula en tres niveles. El **nivel léxico** fija el significado de cada símbolo por separado ("fiebre" es un síntoma clínico, no una palabra cualquiera). El **nivel estructural** conecta esos símbolos en reglas, como $\text{Fiebre} \land \text{Tos} \rightarrow \text{Posible\_Gripe}$, y permite inferir algo no dicho explícitamente. El **nivel pragmático** traduce esa inferencia en una acción: recomendar una prueba, aislar al paciente. Sin los tres niveles, un sistema es solo un almacén de etiquetas.

### Explicar y decidir

Una buena representación persigue dos objetivos que se necesitan mutuamente: **explicar**, dar razones de por qué una conclusión se sostiene (vital en medicina o derecho), y **decidir**, actuar de forma autónoma con lo que se sabe. Un sistema que explica sin decidir es un observador pasivo; uno que decide sin explicar es una "caja negra" que genera desconfianza.

### Criterios de una buena representación

Cinco criterios se compensan entre sí al elegir cómo representar el conocimiento de un dominio:

| Criterio | Qué exige |
|---|---|
| Expresividad | decir lo que importa del dominio, sin ambigüedad |
| Eficiencia computacional | razonar con ella en un tiempo aceptable |
| Modularidad | actualizar o ampliar el conocimiento sin reescribirlo todo |
| Interpretabilidad | que sus decisiones se puedan explicar a un humano |
| Robustez ante la incertidumbre | admitir información incompleta o imprecisa |

Cuanta más expresividad se exige, más cara suele ser la inferencia: diseñar una representación es buscar el equilibrio entre potencia y viabilidad.

### Declarativo o procedimental

El **conocimiento declarativo** describe "lo que es": hechos y reglas verificables, como *"si fiebre y tos persistente, entonces posible gripe"*; su ventaja es la interpretabilidad, su límite la rigidez. El **conocimiento procedimental**, en cambio, describe "cómo se hace": estrategias o parámetros aprendidos, como los pesos de una red neuronal o una política $\pi(s)$ de aprendizaje por refuerzo; es eficaz y se adapta, pero suele ser opaco. Los sistemas más robustos combinan ambos: un modelo procedimental calcula una probabilidad de impago, mientras reglas declarativas imponen límites legales que ese cálculo nunca puede saltarse.

### Determinismo o incertidumbre

La regla $\text{Fiebre} \land \text{Tos} \rightarrow \text{Posible\_Gripe}$ es **determinista**: se cumple siempre que se cumplen sus condiciones. Pero los síntomas reales son parciales y los datos incompletos, así que tratarla como determinista produce diagnósticos erróneos. Por eso la IA recurre a la **probabilidad**, que asigna grados de confianza a una conclusión y permite actualizarlos con información nueva.

### Del conocimiento al razonamiento

Representar conocimiento solo sirve si permite pensar con él. La **deducción** obtiene conclusiones necesariamente verdaderas a partir de premisas verdaderas ("todo con gripe tiene fiebre; Juan tiene gripe; luego Juan tiene fiebre"): rigurosa, pero depende de que las reglas de partida sean correctas. La **abducción** busca la explicación más plausible de lo observado —fiebre y tos sugieren gripe, sin garantía— y es el razonamiento típico del diagnóstico. La **inducción** generaliza una regla a partir de varios casos, y es la vía que formaliza el aprendizaje automático. Estos razonamientos se aplican encadenando reglas hacia adelante (desde los hechos) o hacia atrás (desde una hipótesis), mecanismo que [[sistemas-expertos]] desarrolla en detalle.

## Formalización

$$
\text{Fiebre} \land \text{Tos} \rightarrow \text{Posible\_Gripe}
$$
donde:
- $\land$: conjunción lógica ("y"); la regla solo se activa si ambas condiciones son ciertas.
- $\rightarrow$: implicación lógica ("entonces"); si el antecedente es cierto, se afirma el consecuente.
- $\text{Fiebre}$, $\text{Tos}$, $\text{Posible\_Gripe}$: proposiciones, afirmaciones sobre el paciente que pueden ser verdaderas o falsas.

## Errores típicos

- **Error**: pensar que basta con guardar más datos para tener "conocimiento" → **Correcto**: sin semántica (relaciones y significado) los datos no permiten inferir nada nuevo.
- **Error**: tratar el conocimiento declarativo y el procedimental como opciones excluyentes → **Correcto**: los sistemas robustos combinan reglas declarativas (marco normativo) con modelos procedimentales (adaptación).
- **Error**: aplicar una regla de diagnóstico como si fuera siempre determinista → **Correcto**: en dominios reales hay que asignar grados de confianza y actualizarlos con nueva evidencia.
- **Error**: confundir "explicar" y "decidir" como si fueran lo mismo → **Correcto**: son objetivos complementarios; un sistema puede decidir bien y no poder justificarlo, o al revés.

## En resumen

- Representar conocimiento es dar significado (semántica) a los datos, no solo almacenarlos, para poder razonar y decidir con ellos.
- La semántica opera en tres niveles que se acumulan: léxico (qué significa cada símbolo), estructural (cómo se relacionan en reglas) y pragmático (cómo guían una acción).
- Toda representación busca dos objetivos: explicar sus conclusiones y decidir con autonomía; olvidar uno la convierte en observador pasivo o en caja negra.
- El conocimiento declarativo dice "lo que es" (hechos, reglas) y es interpretable pero rígido; el procedimental dice "cómo se hace" (algoritmos, parámetros) y es adaptable pero opaco.
- Regla clave: una implicación lógica como $\text{Fiebre} \land \text{Tos} \rightarrow \text{Posible\_Gripe}$; en la práctica casi nunca es puramente determinista, así que se le asignan grados de probabilidad.
- Al diseñar una representación se elige entre expresividad, eficiencia, modularidad, interpretabilidad y robustez ante la incertidumbre: mejorar una suele costar otra.
- Se razona por deducción (certeza), abducción (mejor explicación) o inducción (generalizar de casos), aplicando reglas hacia adelante o hacia atrás.
- La trampa principal: confundir dato con conocimiento, o tratar una regla útil como si fuera siempre cierta.

## A fondo

Un motor de búsqueda que recibe "jaguar" tiene que decidir si el usuario busca el animal, la marca de coches o el equipo de fútbol. Sin semántica solo ve una cadena de texto; con ella, puede desambiguar usando el contexto y el historial de búsquedas. Es el mismo problema, a otra escala, que un chatbot médico: reconocer la palabra "fiebre" (nivel léxico) no basta si no se relaciona con otros síntomas para inferir un diagnóstico (nivel estructural) y termina en una recomendación de consulta (nivel pragmático). Un sistema que se queda en el nivel léxico —por ejemplo, un buscador que trata "fiebre" como una palabra cualquiera sin contexto clínico— puede devolver resultados irrelevantes.

La actualización formal de la confianza ante nueva evidencia se apoya en la fórmula de Bayes: por ahora basta con saber que la probabilidad ofrece un lenguaje para hablar de la incertidumbre sin caer en el todo-o-nada del determinismo. En sistemas expertos clásicos, este mismo problema se resolvió con "factores de certeza" que permiten operar cuando la información es incompleta o incierta, una idea que [[sistemas-expertos]] retoma con más detalle.

## Autoevaluación

### Un sistema almacena "38,5", "tos" y "paciente_123" sueltos, sin relacionarlos entre sí. ¿Qué le falta para ser conocimiento y no solo datos?
- [ ] Nada: ya tiene semántica porque los tres símbolos tienen significado por separado.
- [x] Semántica: sin indicar que 38,5 es una temperatura de ese paciente y que la tos es su síntoma, son solo símbolos aislados.
- [ ] Solo le falta el nivel pragmático, ya que el léxico y el estructural están completos.
> Por qué: sin relacionar los símbolos entre sí (temperatura de quién, síntoma de quién) no hay ni siquiera nivel estructural; son datos en bruto, no conocimiento. La trampa es pensar que tener valores con sentido individual ya es tener semántica.

### Un banco usa una red neuronal para estimar la probabilidad de impago de un cliente, y aparte aplica la regla fija "nunca aprobar un crédito sin comprobar ingresos". ¿Qué tipo de conocimiento es cada parte?
- [ ] Ambas son procedimentales, porque las dos participan en la decisión final.
- [x] La red neuronal es procedimental (parámetros aprendidos); la regla de comprobar ingresos es declarativa (un hecho normativo explícito).
- [ ] Ambas son declarativas, porque las dos se pueden explicar al cliente.
> Por qué: lo procedimental es "cómo se hace" (pesos aprendidos que calculan una probabilidad); lo declarativo es "lo que es" (una norma fija, verificable e interpretable). Confundirlas es el error de creer que son excluyentes.

### Un sistema aplica siempre "si fiebre y tos, entonces gripe" como una certeza absoluta. ¿Qué problema tiene este enfoque en la práctica?
- [ ] Ninguno, porque el nivel estructural ya garantiza que el diagnóstico es correcto.
- [x] Trata como determinista una situación real que es incierta: no todos los pacientes con fiebre y tos tienen gripe.
- [ ] El problema es que la regla no tiene nivel pragmático, así que no sirve para nada.
> Por qué: en el mundo real los síntomas son ambiguos y compatibles con varias enfermedades; tratar la regla como determinista genera diagnósticos erróneos. La solución es asignar grados de confianza en vez de un sí/no rígido.

### Un sistema de recomendación de inversión da siempre una cifra de riesgo sin decir en qué datos se basa. ¿Qué objetivo de la representación del conocimiento está descuidando?
- [ ] Decidir, porque no propone ninguna acción concreta.
- [x] Explicar, porque no justifica su conclusión ante el usuario.
- [ ] Ninguno: explicar y decidir son la misma cosa, así que basta con decidir bien.
> Por qué: explicar y decidir son objetivos complementarios pero distintos; un sistema puede decidir (dar una cifra) sin poder justificarla, lo que lo convierte en una "caja negra" aunque sea preciso.

## Glosario

- **semántica**: el significado que un sistema asigna a símbolos y datos, más allá de guardarlos; permite entender relaciones y contexto.
- **nivel léxico**: el significado individual de cada símbolo o palabra dentro de un dominio, sin considerar aún sus relaciones con otros.
- **nivel estructural**: cómo se relacionan los símbolos entre sí mediante reglas o dependencias lógicas, permitiendo inferir conclusiones nuevas.
- **nivel pragmático**: cómo se usa el conocimiento en un contexto real, traduciendo una inferencia en una decisión o recomendación concreta.
- **conocimiento declarativo**: hechos, definiciones y reglas que describen "lo que es" en un dominio; interpretable pero rígido de mantener.
- **conocimiento procedimental**: estrategias, algoritmos o parámetros aprendidos que describen "cómo se hace"; eficaz y adaptable, pero a menudo opaco.
- **determinismo**: enfoque en el que una regla se cumple siempre que se dan sus condiciones, sin grados intermedios de certeza.
- **deducción**: razonamiento que obtiene conclusiones necesariamente verdaderas a partir de premisas verdaderas.
- **abducción**: razonamiento que busca la explicación más plausible para lo observado, sin garantía de certeza.
- **inducción**: razonamiento que generaliza una regla a partir de varios casos concretos observados.
