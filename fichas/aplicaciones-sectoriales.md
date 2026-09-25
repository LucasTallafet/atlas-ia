---
id: aplicaciones-sectoriales
estado: borrador
---

## En una frase
La IA se aplica de forma distinta en cada sector —salud, industria, finanzas, retail y automoción— pero siempre con el mismo patrón: analizar datos para automatizar tareas y mejorar decisiones.

## Intuición
Cuando la electricidad llegó a las fábricas, no hizo falta inventar una máquina nueva para cada industria: la misma corriente movía telares, encendía quirófanos o hacía funcionar ascensores. La IA se está extendiendo de forma parecida: unas pocas técnicas —reconocer patrones en imágenes, entender texto, predecir un valor futuro a partir de su historia— se repiten una y otra vez, pero cada sector las aplica a su propio problema. Un hospital las usa para leer una radiografía; una aseguradora, para detectar una transacción sospechosa. Fíjate en que lo que cambia no es tanto la técnica como el dato de entrada y la decisión que hay que tomar con ella. Por eso conviene recorrer las aplicaciones sector a sector: ayuda a distinguir qué es específico del dominio (una radiografía, un pedido de comercio electrónico) y qué es el patrón técnico general.

## Explicación
Como viste en [[que-es-ia]], un agente de IA percibe su entorno y actúa sobre él para lograr un objetivo. Lo que cambia entre sectores es el entorno que percibe y el objetivo que persigue.

### Salud: diagnóstico, decisión clínica y medicina personalizada
Las redes neuronales convolucionales ([[cnn]]) analizan radiografías, resonancias y tomografías para detectar cáncer o anomalías cardíacas con mayor precisión y rapidez que los métodos tradicionales. El procesamiento del lenguaje natural ([[nlp-intro]]) extrae diagnósticos y tratamientos de historias clínicas no estructuradas. Los sistemas de soporte a la decisión clínica, herederos de los primeros [[sistemas-expertos]] como MYCIN (Stanford, años 70), asisten a los médicos con reglas o modelos supervisados. Google Health, por ejemplo, entrenó un modelo con decenas de miles de mamografías capaz de detectar cáncer de mama con una precisión comparable a la de un radiólogo humano.

### Industria: mantenimiento predictivo y robótica avanzada
Sensores instalados en las máquinas —vibración, temperatura, presión— generan series temporales ([[series-temporales]]) que los algoritmos analizan para anticipar fallos antes de que ocurran: es el **mantenimiento predictivo**, más eficiente que el mantenimiento preventivo porque actúa sobre el estado real del equipo, no sobre un calendario fijo. Siemens lo aplica en sus trenes de alta velocidad para reducir tiempos de inactividad. La **robótica avanzada** añade autonomía a las líneas de producción: los **cobots** (robots colaborativos) trabajan junto a personas en tareas de ensamblaje, clasificación e inspección.

### Finanzas: detección de fraude, inversión y trading
Los algoritmos de aprendizaje supervisado ([[supervisado]]) analizan millones de transacciones en tiempo real para identificar patrones anómalos: PayPal bloquea así operaciones de alto riesgo antes de que se completen. En la gestión de inversiones, la IA construye carteras personalizadas según el perfil de riesgo del usuario, democratizando el acceso a estrategias antes reservadas a grandes gestoras. En el **trading algorítmico**, los modelos analizan series de precios en el tiempo para predecir movimientos de mercado y ejecutar operaciones automáticamente, reduciendo el tiempo de reacción ante cambios.

### Retail: recomendación y cadena de suministro
Los sistemas de recomendación analizan el comportamiento de compra para sugerir productos relevantes: en Amazon, cerca del 35 % de las ventas proviene de estas recomendaciones. En paralelo, la IA predice la demanda a partir de series temporales de ventas para gestionar inventario y logística: Zara ajusta así su producción y reposición según lo que realmente se vende en cada región, reduciendo el sobrante.

### Automoción: conducción autónoma y asistentes al conductor
Cámaras, radares y sistemas LIDAR alimentan redes neuronales, muchas veces convolucionales ([[cnn]]), que construyen una representación tridimensional del entorno para detectar obstáculos, peatones y señales. Tesla combina estos datos en su sistema Autopilot, y Waymo los usa para una conducción sin conductor humano. Conviene distinguir dos niveles: la **conducción autónoma** completa, en la que el vehículo decide y actúa solo, y los **ADAS** (*advanced driver assistance systems*), que solo asisten —frenado de emergencia, control de crucero adaptativo— sin sustituir al conductor.

### Qué tienen en común
En los cinco sectores se repite el mismo patrón: convertir datos brutos (imágenes, texto, transacciones, sensores) en una predicción o decisión, y automatizar o apoyar una tarea que antes exigía juicio experto. También se repiten los mismos límites: la calidad de los datos de entrada, la necesidad de supervisión humana en decisiones críticas y las preguntas éticas sobre quién responde cuando el sistema se equivoca (ver [[sesgos-equidad]] y [[privacidad-responsabilidad]]).

## Formalización
No aplica: es un panorama de aplicaciones por sector, no un modelo matemático único.

## Interactivo
```widget
motor: matriz-calor
modo: "tabla-enlaces"
filas: ["Salud", "Industria", "Finanzas", "Retail", "Automoción"]
columnas: ["CNN (visión)", "NLP", "Sistemas expertos", "Aprendizaje supervisado", "Series temporales"]
valores: [
  ["cnn", "nlp-intro", "sistemas-expertos", null, null],
  [null, null, null, null, "series-temporales"],
  [null, null, null, "supervisado", "series-temporales"],
  [null, null, null, null, "series-temporales"],
  ["cnn", null, null, null, null]
]
```

- Prueba a hacer clic en la celda de Salud × CNN y comprueba que te lleva a la ficha de redes neuronales convolucionales.
- Prueba a identificar qué técnica aparece en más de un sector de la matriz y piensa por qué se reutiliza tanto.
- Prueba a imaginar qué celda añadirías tú para el sector público (ver ampliación en "A fondo") y qué técnica usarías.

## Errores típicos
- **Error**: pensar que la IA en medicina sustituye al médico. → **Correcto**: en casos como MYCIN o los sistemas actuales de diagnóstico, la IA asiste o sugiere; la decisión final y la responsabilidad siguen siendo humanas, en parte por las mismas razones legales que impidieron desplegar MYCIN en la práctica.
- **Error**: confundir mantenimiento predictivo con mantenimiento preventivo. → **Correcto**: el preventivo sigue un calendario fijo; el predictivo actúa según el estado real de la máquina, medido por sensores.
- **Error**: creer que la conducción autónoma y los ADAS son lo mismo. → **Correcto**: los ADAS (frenado de emergencia, control de crucero adaptativo) asisten al conductor humano; la conducción autónoma completa decide y actúa sin intervención humana.
- **Error**: pensar que cada sector necesita una IA distinta desde cero. → **Correcto**: unas pocas técnicas (visión por computador, NLP, análisis de series temporales) se reutilizan en sectores muy distintos; lo que cambia es el dato de entrada y el objetivo.

## En resumen
- La IA se aplica en salud (diagnóstico por imagen, historias clínicas, apoyo a la decisión clínica), industria (mantenimiento predictivo, robótica avanzada), finanzas (detección de fraude, inversión, trading), retail (recomendación, cadena de suministro) y automoción (conducción autónoma, ADAS).
- El patrón se repite: datos brutos → modelo que reconoce patrones → predicción o decisión que automatiza o apoya una tarea antes humana.
- Las técnicas se reutilizan entre sectores: visión por computador (CNN) en salud y automoción, análisis de series temporales en industria, finanzas y retail.
- Distingue automatización total (el sistema decide, como Waymo) de asistencia (el sistema apoya, como los ADAS o un sistema de soporte a la decisión clínica).
- Los límites se repiten también: calidad de los datos, necesidad de supervisión humana y responsabilidad legal ante errores.
- La trampa principal: juzgar la madurez de un sector por lo llamativo del caso de uso, no por si el sistema decide solo o solo asiste.

## A fondo
MYCIN, uno de los primeros sistemas expertos (Stanford, años 70), usaba unas 600 reglas "si-entonces" para recomendar antibióticos y podía justificar sus decisiones, lo que le daba transparencia. Sin embargo, nunca se implementó clínicamente: la responsabilidad legal de un error médico automatizado y la dificultad de certificar el sistema pesaron más que su precisión técnica, un recordatorio de que un buen resultado no basta para desplegar IA en dominios críticos. En España, el Hospital Universitario La Paz ha probado sistemas de IA para sugerir tratamientos personalizados en oncología, e IBM Watson Health desarrolló sistemas para analizar imágenes médicas en busca de signos tempranos de cáncer.

:::ampliacion
Un sector no cubierto por el material del curso es el público: las administraciones usan IA en la gestión de tráfico, la atención ciudadana (chatbots administrativos) o la planificación urbana de las llamadas *smart cities*, con el mismo patrón de datos-predicción-decisión que en el resto de sectores, pero con requisitos añadidos de rendición de cuentas democrática.
Fuente: AI Watch, el observatorio de IA de la Comisión Europea (ai-watch.ec.europa.eu).
:::

## Autoevaluación
### Una fábrica instala sensores de vibración y temperatura en sus máquinas y usa IA para predecir fallos antes de que ocurran. ¿Qué nombre recibe esta aplicación?
- [ ] Mantenimiento preventivo
- [x] Mantenimiento predictivo
- [ ] Robótica avanzada
> Por qué: el preventivo sigue un calendario fijo; aquí el sistema decide cuándo intervenir según el estado real de la máquina medido por los sensores, que es la definición de mantenimiento predictivo.

### ¿Qué diferencia a un sistema ADAS de un sistema de conducción autónoma completa?
- [ ] El ADAS usa cámaras y el autónomo usa LIDAR
- [x] El ADAS asiste al conductor humano; el autónomo decide y actúa sin intervención humana
- [ ] No hay diferencia real, son sinónimos
> Por qué: Tesla Autopilot (ADAS) y Waymo (conducción autónoma) usan tecnología similar, pero el primero asiste —frenado de emergencia, cambio de carril— mientras el segundo sustituye por completo la decisión humana.

### MYCIN demostró alta precisión recomendando antibióticos en los años 70, pero nunca se usó en la práctica clínica. ¿Por qué?
- [ ] Porque sus reglas "si-entonces" nunca funcionaron bien
- [x] Por la responsabilidad legal de un error médico automatizado y la dificultad de certificarlo
- [ ] Porque no existían ordenadores capaces de ejecutarlo
> Por qué: el obstáculo fue legal y de certificación, no técnico; MYCIN sí lograba precisión y podía justificar sus recomendaciones con sus propias reglas.

### Un sistema de recomendación en retail y un sistema de trading algorítmico en finanzas usan patrones muy parecidos. ¿Qué tienen en común como técnica?
- [ ] Ambos son sistemas expertos basados en reglas
- [x] Ambos analizan datos —comportamiento de compra o precios— a lo largo del tiempo para predecir y actuar
- [ ] Ambos requieren reconocimiento facial
> Por qué: aunque el dominio es distinto (compras frente a mercados financieros), ambos se apoyan en el análisis de patrones temporales para anticipar un valor futuro, el mismo patrón que el mantenimiento predictivo en industria.

## Glosario
- **mantenimiento predictivo**: estrategia que usa sensores y algoritmos de IA para anticipar fallos en una máquina a partir de su estado real, en vez de seguir un calendario fijo.
- **cobot**: robot colaborativo que trabaja junto a personas en tareas de producción, a diferencia de un robot industrial aislado.
- **ADAS** (*advanced driver assistance systems*, sistemas avanzados de asistencia a la conducción): tecnologías que asisten al conductor humano, como el frenado de emergencia o el control de crucero adaptativo, sin sustituirlo.
- **trading algorítmico**: ejecución automática de operaciones financieras a partir de señales detectadas por modelos de IA en los datos de mercado.
