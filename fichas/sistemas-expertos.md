---
id: sistemas-expertos
estado: borrador
---

## En una frase

Un sistema experto es un programa que emula la toma de decisiones de un especialista humano en un dominio concreto, aplicando reglas explícitas a hechos conocidos y explicando cómo llegó a su conclusión.

## Intuición

Imagina un médico veterano que, ante un paciente con fiebre y tos, no improvisa: sigue un protocolo mental construido con años de experiencia ("si hay fiebre alta y tos productiva, sospecha neumonía; si además hay dolor en el pecho, refuerza la sospecha") y, si le preguntas por qué, puede explicarte cada paso. Un sistema experto es el intento de meter ese protocolo —las reglas y los hechos que un especialista usaría— dentro de un programa, para que cualquiera pueda consultarlo y recibir tanto una recomendación como la razón detrás de ella.

Importa en inteligencia artificial porque fue la primera forma de conseguir que una máquina "razonara" de manera útil en un dominio real —medicina, finanzas, ingeniería— sin necesidad de aprender de datos: bastaba con capturar bien el conocimiento de los expertos humanos y estructurarlo en reglas.

## Explicación

### Origen: de Dartmouth a los primeros sistemas expertos

La idea de que una máquina simule el razonamiento humano tomó forma en la Conferencia de Dartmouth (1956), que estableció la inteligencia artificial como disciplina. En las décadas de 1960 y 1970 surgió un interés específico en sistemas que manejaran el conocimiento de un dominio concreto, tal y como lo haría un experto humano en él. El primer resultado relevante fue **Dendral** (Stanford, años 60, Edward Feigenbaum, Bruce Buchanan y Joshua Lederberg), que ayudaba a identificar estructuras moleculares a partir de datos de espectrometría de masas aplicando reglas del dominio químico. Dendral demostró que un programa podía operar al nivel de un experto en una tarea concreta, y sentó las bases de la **ingeniería del conocimiento**: el proceso de extraer y estructurar el saber experto en reglas y datos procesables.

En los años 70, **MYCIN** (también en Stanford) llevó la idea a la medicina: diagnosticaba infecciones bacterianas y recomendaba tratamiento usando reglas con **factores de certeza**, una forma de operar aunque la información fuera incompleta. Nunca se implementó en la práctica clínica, pero probó que los sistemas expertos podían manejar incertidumbre, no solo lógica binaria.

El éxito de Dendral y MYCIN impulsó, en los años 80, una ola de adopción industrial (planificación, diagnóstico, gestión de inventarios) y la aparición de *shells* —entornos como EMYCIN, OPS5 o CLIPS— que permitían construir sistemas expertos sin programar cada pieza desde cero. El entusiasmo decayó a finales de los 80 al hacerse evidentes sus límites: la adquisición de conocimiento era costosa y lenta, y la dependencia de reglas explícitas los hacía rígidos ante situaciones no previstas. En los 90 la investigación no se detuvo, sino que buscó enfoques híbridos que combinaran reglas con estadística y aprendizaje automático, dando lugar a los sistemas de apoyo a la decisión actuales.

### Arquitectura: los módulos que simulan a un experto

Un sistema experto coordina varios módulos para capturar, procesar y aplicar conocimiento:

| Módulo | Función |
|---|---|
| Base de conocimiento | almacena los hechos y reglas del dominio |
| Motor de inferencia | aplica esas reglas a los hechos para producir conclusiones |
| Módulo de explicación | justifica las conclusiones ante el usuario |
| Interfaz de usuario | punto de entrada de datos y de lectura de resultados |
| Adquisición de conocimiento (opcional) | incorpora nuevo conocimiento sin reprogramar el sistema |

La calidad de la base de conocimiento y la eficacia del motor de inferencia son los dos factores que más determinan la precisión del sistema; explicación e interfaz determinan si los usuarios confían en él y lo adoptan.

### La base de conocimiento: qué sabe el sistema

La base de conocimiento combina **conocimiento declarativo** —hechos y descripciones estáticas, como "la fiebre es una temperatura corporal superior a 37 °C"— y **conocimiento procedimental** —instrucciones sobre cómo actuar, como "si la fiebre supera los 39 °C, recomendar antipiréticos"— (ver [[representacion-conocimiento]] para la distinción general). Se representa con varias técnicas:

- **Reglas de producción**: estructuras "si-entonces" del tipo *"si tos seca y fiebre alta, entonces sospechar infección viral"*; descomponen un problema complejo en decisiones pequeñas y son la técnica más habitual por su transparencia.
- **Hechos**: información concreta y verificable, como "la presión arterial alta es superior a 140/90 mmHg", que el motor de inferencia usa como entrada.
- **Marcos**: agrupan atributos de un objeto (un paciente con "edad", "síntomas", "historial médico"). Ver [[ontologias-grafos]].
- **Redes semánticas**: nodos y enlaces que muestran relaciones entre conceptos, como "neumonía" —"se trata con"→ "antibiótico". Ver [[ontologias-grafos]].

El conocimiento proviene de **expertos humanos** (entrevistas, talleres, para capturar saber tácito no documentado), de **documentación técnica** (manuales, artículos) y, cada vez más, de **datos empíricos** históricos. Mantenerla exige actualización periódica y verificación de consistencia, para no introducir contradicciones al añadir reglas nuevas; la calidad de esta base determina directamente la fiabilidad de las conclusiones del sistema.

### El motor de inferencia: cómo razona

El motor de inferencia aplica las reglas de la base de conocimiento a los hechos disponibles para producir conclusiones. Usa dos estrategias que se diferencian en el punto de partida. El **encadenamiento hacia adelante** (*forward chaining*) arranca de los hechos y va aplicando reglas de forma sucesiva hasta generar conclusiones: es útil para explorar todas las posibilidades a partir de un estado inicial, como en diagnóstico o monitoreo continuo. El **encadenamiento hacia atrás** (*backward chaining*) arranca de una hipótesis y retrocede buscando qué hechos y reglas la sustentarían, descomponiéndola en subobjetivos si es necesario: es más adecuado para verificar un resultado concreto, como en sistemas legales.

Cuando varias reglas podrían aplicarse a la vez, el motor necesita una **agenda de reglas** que las priorice y un mecanismo de **control de conflictos** que decida cuál ejecutar primero (por especificidad, por orden de llegada o por un peso asignado). En dominios donde los datos son incompletos o ambiguos, el motor incorpora además un **gestor de certeza**, que calcula el grado de confianza de una conclusión con probabilidades o factores de certeza en vez de una respuesta binaria; esto distingue el **razonamiento determinista** (conclusiones absolutas) del **razonamiento con incertidumbre** (grados de confianza). El diseño detallado de estas estrategias de búsqueda y control se desarrolla en [[motores-inferencia]].

### Módulo de explicación

Este módulo justifica ante el usuario por qué el sistema llegó a una conclusión, algo esencial en medicina, finanzas o derecho, donde la confianza depende de entender el razonamiento. Ofrece tres niveles de detalle: **explicaciones descriptivas** (resumen rápido de reglas y hechos relevantes), **explicaciones detalladas** (desglose completo del proceso de inferencia, para usuarios técnicos) y **explicaciones paso a paso** (cada etapa de la inferencia, útiles en contextos educativos). Se implementa guardando un rastro de ejecución de las reglas aplicadas (**justificación de reglas**) y, en sistemas avanzados, visualizando gráficamente las relaciones entre hechos y reglas. Su principal desafío es el **balance entre detalle y coste**: explicaciones muy técnicas abruman a usuarios no expertos, mientras que generarlas con mucho detalle aumenta la carga computacional del sistema.

### Interfaz de usuario y adquisición de conocimiento

La **interfaz de usuario** debe ser intuitiva e interactiva, y dar acceso tanto a las recomendaciones como a sus explicaciones, sin exigir formación técnica avanzada al usuario. El **módulo de adquisición de conocimiento**, cuando existe, incorpora nueva información sin reprogramar el sistema: puede actualizarse automáticamente desde sensores o bases de datos externas, pero necesita **curar y validar** lo que integra (por algoritmos o por revisión humana) para no introducir contradicciones. Sus metodologías van de la **extracción manual** (entrevistas con expertos) a la **adquisición automática** (procesamiento de lenguaje natural sobre documentos) y la **retroalimentación** de los propios usuarios. Sus retos recurrentes son la veracidad de fuentes múltiples, la seguridad de datos sensibles y la sobrecarga cuando llega demasiada información nueva a la vez.

### Ontologías y taxonomías en sistemas expertos

Además de reglas, marcos y redes semánticas, un sistema experto puede usar una **ontología** (ver [[ontologias-grafos]]) para describir formalmente conceptos, propiedades y relaciones de un dominio, incluyendo **axiomas**: reglas lógicas como "todo tratamiento requiere un diagnóstico previo". Esto permite una inferencia más rica que una simple regla si-entonces, porque el motor puede razonar sobre categorías completas: si una enfermedad pertenece a "infección viral" y el paciente cumple ciertos síntomas, el sistema infiere una alta probabilidad de esa categoría.

Una **taxonomía** es una versión más simple: una jerarquía que clasifica conceptos por niveles de generalidad ("enfermedades infecciosas" → "infecciones virales") sin axiomas ni relaciones complejas. Es más fácil de construir y mantener que una ontología, pero no permite deducir tanto. Muchos sistemas combinan ambas: la taxonomía organiza una primera capa de categorías, y la ontología aporta el detalle y las reglas para inferencias más finas.

### Ciclo de desarrollo: el caso SolarExpert

Construir un sistema experto sigue cuatro etapas. Para verlas en la práctica, imaginemos **SolarExpert**, un sistema que diagnostica fallos en instalaciones fotovoltaicas.

1. **Identificación del problema y requisitos**: se define qué decisiones críticas debe apoyar el sistema y quiénes lo usarán. SolarExpert debe identificar fallos comunes (sombras, conexiones sueltas, degradación de módulos), recomendar pasos correctivos y procesar datos de monitoreo en tiempo real (tensión, corriente).
2. **Adquisición y representación del conocimiento**: se captura el saber de ingenieros especializados, manuales técnicos y registros históricos de fallos, mezclando conocimiento explícito ("si la corriente de un módulo es menor de lo esperado y no hay sombreado, sospechar una conexión suelta") con patrones tácitos que solo la experiencia revela.
3. **Diseño del motor de inferencia**: SolarExpert usa encadenamiento hacia adelante para monitorear datos en tiempo real y detectar patrones de fallo, con una red bayesiana adicional para calcular la probabilidad de causas como el sobrecalentamiento cuando coinciden voltajes anómalos y temperaturas altas en los inversores.
4. **Validación, pruebas y refinamiento**: se comparan los diagnósticos del sistema con los de expertos humanos en casos históricos y en una planta piloto, midiendo precisión, eficiencia y escalabilidad, y se ajustan reglas según los errores detectados.

### Aplicaciones en la industria

| Sector | Uso típico |
|---|---|
| Medicina | apoyo al diagnóstico y tratamiento a partir de síntomas e historial |
| Finanzas | evaluación de riesgo crediticio y recomendaciones de inversión |
| Manufactura | mantenimiento predictivo y optimización de procesos |
| Atención al cliente | resolución guiada de incidencias comunes |

En todos los sectores el patrón es el mismo: el sistema aporta eficiencia y precisión al automatizar decisiones complejas, pero depende de una base de conocimiento específica que hay que mantener actualizada.

### Límites y evolución

Las limitaciones de los sistemas expertos son las mismas que provocaron su declive en los 80: el **cuello de botella de adquisición de conocimiento** (traducir la experiencia tácita de un humano a reglas formales es lento y caro), la **escalabilidad** (más reglas significa más conflictos y peor rendimiento) y la **rigidez** ante situaciones no previstas en el diseño original. La tendencia actual es la **integración con machine learning y NLP**: el aprendizaje automático permite ajustar el conocimiento a partir de datos y patrones cambiantes, y el NLP permite procesar consultas en lenguaje natural. El resultado son **sistemas de apoyo a la decisión** híbridos, que sugieren en vez de decidir de forma cerrada, dejando la decisión final a un humano en sectores donde la responsabilidad no se puede delegar del todo. Su estructura basada en reglas sigue siendo valiosa precisamente donde el aprendizaje profundo flaquea: en la necesidad de transparencia y explicabilidad.

## Formalización

```
SI <condición_1> Y/O <condición_2> ENTONCES <acción o conclusión>
```
donde:
- `<condición_i>`: hechos evaluables como verdaderos o falsos en la base de conocimiento (el antecedente de la regla).
- `Y/O`: conectores lógicos que combinan condiciones —conjunción o disyunción, los mismos $\land$/$\lor$ de [[representacion-conocimiento]]—.
- `<acción o conclusión>`: lo que el motor de inferencia añade a los hechos conocidos, o la acción que dispara, si las condiciones se cumplen (el consecuente).

## En código

```python
inventario = {"tornillos": 15, "tuercas": 120}
demanda = {"tornillos": "alta", "tuercas": "baja"}

def decidir(stock, demanda):
    if stock < 20 and demanda == "alta":
        return "pedido de reposicion"
    if stock > 100 and demanda == "baja":
        return "suspender nuevos pedidos"
    return "monitorear"

for producto, stock in inventario.items():
    print(producto, "->", decidir(stock, demanda[producto]))
# tornillos -> pedido de reposicion
# tuercas -> suspender nuevos pedidos
```

## Errores típicos

- **Error**: creer que un sistema experto "aprende" de los datos como una red neuronal → **Correcto**: en su forma clásica solo aplica reglas fijas escritas por ingenieros del conocimiento; aprender de datos requiere integrarlo con machine learning.
- **Error**: pensar que encadenamiento hacia adelante y hacia atrás son intercambiables → **Correcto**: hacia adelante explora todas las conclusiones posibles desde los hechos; hacia atrás verifica una hipótesis concreta retrocediendo hasta las pruebas necesarias.
- **Error**: confundir la base de conocimiento con el motor de inferencia → **Correcto**: la base almacena qué se sabe (hechos y reglas); el motor decide cómo aplicarlo para llegar a conclusiones.
- **Error**: suponer que añadir más reglas siempre mejora el sistema → **Correcto**: la escalabilidad se degrada por el cuello de botella de adquisición de conocimiento y por el aumento de conflictos entre reglas.

## En resumen

- Un sistema experto emula la decisión de un especialista aplicando reglas explícitas ("si-entonces") a hechos de un dominio concreto, y puede justificar su conclusión.
- Funciona combinando una base de conocimiento (hechos y reglas), un motor de inferencia (las aplica), un módulo de explicación y una interfaz de usuario.
- Regla clave: `SI <condiciones> ENTONCES <conclusión o acción>`, evaluada por encadenamiento hacia adelante (desde los hechos) o hacia atrás (desde una hipótesis).
- Úsalo cuando el dominio tiene reglas explícitas y bien definidas y se necesita transparencia; evítalo en dominios muy cambiantes o con conocimiento ambiguo difícil de formalizar.
- Decisiones que importan: qué estrategia de encadenamiento usar, cómo resolver conflictos entre reglas y si hace falta un gestor de certeza para la incertidumbre.
- La trampa principal: el cuello de botella de adquisición de conocimiento —capturar y mantener el saber experto en reglas es lento, caro y frágil ante lo imprevisto.
- Hoy sobrevive sobre todo como componente híbrido, combinado con machine learning y NLP, en sistemas de apoyo a la decisión que priorizan la explicabilidad.

## A fondo

**MYCIN** ilustra bien el valor y el límite de los sistemas expertos clásicos: aunque sus recomendaciones para infecciones bacterianas eran competitivas con las de especialistas humanos, nunca se usó en la práctica clínica real, en parte por la dificultad de asumir responsabilidad legal sobre decisiones automatizadas y por el coste de mantenerlo actualizado frente al conocimiento médico cambiante. Los *shells* de los 80 (EMYCIN —una versión genérica de MYCIN—, OPS5, CLIPS) redujeron ese coste al separar el motor de inferencia genérico de la base de conocimiento específica de cada aplicación, permitiendo reutilizar la misma maquinaria en dominios distintos.

Sobre la representación del conocimiento dentro de un sistema experto conviene recordar el compromiso final: las reglas de producción son fáciles de entender y mantener mientras el dominio es manejable, pero se degradan con la escala; los marcos y redes semánticas aportan flexibilidad visual pero exigen más gestión; las ontologías y taxonomías son las más ricas y las más caras de construir. No hay una técnica universalmente mejor —la elección depende del dominio— y los sistemas más maduros combinan varias: una taxonomía para clasificar, reglas para decidir y una ontología para las inferencias más finas.

## Autoevaluación

### Un sistema experto médico concluye "posible neumonía" y, al preguntársele por qué, responde con el detalle de qué síntomas y qué regla exacta aplicó. ¿Qué módulo está actuando?
- [ ] El motor de inferencia, porque es el único que conoce las reglas.
- [x] El módulo de explicación, que reconstruye y comunica el razonamiento a partir del rastro de ejecución del motor de inferencia.
- [ ] La base de conocimiento, porque almacena las reglas que se citan.
> Por qué: la base de conocimiento almacena las reglas y el motor las aplica, pero justificar la conclusión ante el usuario de forma comprensible es la función específica del módulo de explicación.

### Un sistema legal debe verificar si un contrato concreto es válido, comprobando una a una las condiciones necesarias. ¿Qué estrategia de inferencia es más adecuada?
- [ ] Encadenamiento hacia adelante, porque explora todas las conclusiones posibles desde los hechos disponibles.
- [x] Encadenamiento hacia atrás, porque parte de la hipótesis ("el contrato es válido") y retrocede para verificar qué condiciones la sustentan.
- [ ] Ninguna de las dos: los sistemas legales no pueden usar motores de inferencia.
> Por qué: cuando el objetivo es confirmar una hipótesis concreta (¿es válido este contrato?), el encadenamiento hacia atrás es más eficiente porque busca directamente las pruebas necesarias en vez de explorar todas las conclusiones posibles.

### Una empresa quiere que su sistema experto de mantenimiento se adapte automáticamente cuando se instalan máquinas nuevas, sin reprogramarlo entero. ¿Qué componente de la arquitectura resuelve esto?
- [ ] La interfaz de usuario, porque es lo único que ven los técnicos.
- [x] El módulo de adquisición de conocimiento, que incorpora nueva información a la base de conocimiento sin una reprogramación completa.
- [ ] El módulo de explicación, porque genera las justificaciones de cada nueva regla.
> Por qué: el módulo de adquisición de conocimiento es precisamente el que permite actualizar y ampliar la base de conocimiento —añadiendo máquinas y fallos nuevos— sin rehacer el sistema desde cero.

### ¿Por qué el entusiasmo por los sistemas expertos decayó a finales de los años 80 a pesar de casos de éxito como Dendral o MYCIN?
- [ ] Porque se demostró que las reglas "si-entonces" nunca podían dar resultados correctos.
- [x] Porque la adquisición y actualización del conocimiento resultó costosa, y la dependencia de reglas fijas los hacía rígidos ante situaciones nuevas.
- [ ] Porque los ordenadores de la época no podían ejecutar ninguna regla lógica.
> Por qué: el cuello de botella de adquisición de conocimiento y la rigidez frente a lo imprevisto —no un fallo lógico de las reglas en sí— son las limitaciones que la propia fuente señala como causa del declive.

## Glosario

- **sistema experto**: programa que emula la toma de decisiones de un especialista humano en un dominio concreto mediante reglas y hechos explícitos.
- **base de conocimiento**: repositorio de hechos y reglas de un dominio que un sistema experto usa para razonar.
- **encadenamiento hacia adelante**: estrategia de inferencia que parte de los hechos y aplica reglas sucesivamente hasta generar conclusiones.
- **encadenamiento hacia atrás**: estrategia de inferencia que parte de una hipótesis y retrocede buscando los hechos y reglas que la sustenten.
- **factor de certeza**: medida que expresa el grado de confianza de una conclusión cuando la información es incompleta o incierta.
- **ingeniería del conocimiento**: proceso de extraer y estructurar el saber de expertos humanos en reglas y datos que un sistema pueda procesar.
- **taxonomía**: jerarquía que clasifica conceptos de un dominio por niveles de generalidad, sin axiomas ni relaciones complejas.
