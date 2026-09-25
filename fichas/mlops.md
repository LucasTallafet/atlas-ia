---
id: mlops
estado: borrador
---

## En una frase

MLOps automatiza y versiona todo el camino desde los datos hasta un modelo en producción vigilado, para poder repetirlo sin depender de pasos manuales.

## Intuición

Piensa en la diferencia entre un artesano que fabrica un mueble a mano, pieza a pieza, y una cadena de montaje que produce miles de muebles idénticos, con cada pieza registrada y cada fallo rastreable hasta su origen. Un equipo de ciencia de datos que entrena modelos a mano en cuadernos (*notebooks*), sin versionar datos ni automatizar pasos, funciona bien para un experimento aislado, pero se rompe en cuanto hay que repetirlo, actualizarlo o auditarlo seis meses después. **MLOps** (*Machine Learning Operations*) es la cadena de montaje: aplica al aprendizaje automático las prácticas que **DevOps** ya aplicaba al software —automatización, control de versiones, pruebas continuas— para que entrenar, [[despliegue|desplegar]] y [[monitorizacion-drift|vigilar]] un modelo dejen de ser artesanía y se conviertan en un proceso repetible.

## Explicación

### Por qué el software normal no basta: la deuda técnica oculta del ML

:::ampliacion
Un sistema de machine learning en producción no es solo código: depende de datos externos, de *pipelines* de preprocesamiento y de modelos que cambian con el tiempo. Sculley et al. (2015) mostraron que esto genera una **deuda técnica oculta** mayor que en el software tradicional. Dos ejemplos de sus hallazgos: el fenómeno **CACE** (*Changing Anything Changes Everything*), por el que modificar una sola característica de entrada puede alterar el comportamiento de todo el modelo de forma impredecible, sin avisos del compilador que lo detecten; y la **jungla de *pipelines***, cuando el código de preparación de datos crece de forma desordenada hasta volverse tan frágil como el propio modelo. MLOps nace precisamente para poner disciplina de ingeniería en estos puntos débiles.
Fuente: Sculley, D. et al. (2015), "Hidden Technical Debt in Machine Learning Systems".
:::

### Pipelines reproducibles

:::ampliacion
Un **pipeline reproducible** codifica cada etapa —validación de datos, entrenamiento, evaluación— como un paso automático y versionado, en vez de celdas de un cuaderno que alguien ejecuta a mano y en un orden que solo esa persona recuerda. Si el pipeline se ejecuta con los mismos datos y el mismo código, debe producir el mismo modelo; eso es lo que permite depurar un problema o repetir un experimento meses después.
Fuente: Google Cloud, "MLOps: Continuous delivery and automation pipelines in machine learning".
:::

### Seguimiento de experimentos y registro de modelos

:::ampliacion
Entrenar un modelo implica probar muchas combinaciones de datos, hiperparámetros y arquitecturas. Herramientas como **MLflow** registran automáticamente, para cada ejecución, los parámetros usados, las métricas obtenidas y los artefactos generados (el propio modelo, gráficas, logs), de modo que comparar cien experimentos no dependa de una hoja de cálculo mantenida a mano. El **registro de modelos** (*model registry*) va un paso más allá: guarda cada versión entrenada con un identificador único y una etiqueta de estado —en pruebas, en producción, archivada—, de forma que siempre se sepa qué versión exacta está sirviendo predicciones ahora mismo y se pueda volver atrás si hace falta.
Fuente: documentación de MLflow (Tracking y Model Registry).
:::

### CI/CD para ML y orquestación

:::ampliacion
La **integración y entrega continuas** (CI/CD) del software normal comprueba que el código compila y pasa sus pruebas antes de publicarlo. En ML hay que añadir capas: validar que los **datos nuevos** cumplen el esquema esperado, comprobar que el **modelo reentrenado** no empeora respecto al que ya está en producción, y solo entonces desplegar automáticamente la nueva versión. Herramientas de **orquestación** como Apache Airflow o Kubeflow Pipelines coordinan el orden y la frecuencia con que se ejecutan estos pasos —por ejemplo, reentrenar cada semana o cuando [[monitorizacion-drift|la monitorización]] detecta drift—, sin intervención manual.
Fuente: Google Cloud, "MLOps: Continuous delivery and automation pipelines in machine learning".
:::

## Formalización

No aplica: MLOps es un conjunto de prácticas de ingeniería de sistemas, no un concepto matemático.

## Interactivo

```widget
motor: grafo
modo: "diagrama"
nodos: [
  {"id": "datos", "etiqueta": "Datos versionados"},
  {"id": "entrenamiento", "etiqueta": "Pipeline de entrenamiento"},
  {"id": "registro", "etiqueta": "Registro de modelos (tracking)"},
  {"id": "despliegue", "etiqueta": "Despliegue automático", "enlace": "despliegue"},
  {"id": "monitorizacion", "etiqueta": "Monitorización y drift", "enlace": "monitorizacion-drift"}
]
aristas: [
  ["datos", "entrenamiento", "alimenta el pipeline"],
  ["entrenamiento", "registro", "guarda parámetros, métricas y modelo"],
  ["registro", "despliegue", "promueve la versión validada"],
  ["despliegue", "monitorizacion", "vigila el modelo en producción"],
  ["monitorizacion", "datos", "dispara reentrenamiento si hay drift"]
]
direccion: "horizontal"
```

Prueba a…
1. Prueba a recorrer el ciclo completo del diagrama, desde los datos hasta la monitorización, y localiza la flecha que cierra el ciclo: ¿qué la dispara?
2. Prueba a imaginar que el nodo "registro" desaparece: ¿cómo sabrías qué versión del modelo está en producción ahora mismo?
3. Prueba a comparar este diagrama con el de [[despliegue]]: ¿qué añade MLOps que no estaba allí?

## Errores típicos

- **Error**: pensar que MLOps es simplemente "usar MLflow" o alguna herramienta concreta → **Correcto**: MLOps es el conjunto de prácticas (versionado, automatización, validación continua); las herramientas como MLflow, Airflow o Kubeflow solo las facilitan.
- **Error**: creer que basta con versionar el código, como en cualquier proyecto de software → **Correcto**: en ML también hay que versionar los datos y el modelo entrenado, porque el mismo código con datos distintos produce un sistema distinto.
- **Error**: aplicar CI/CD de software sin adaptarlo, comprobando solo que el código compila → **Correcto**: el pipeline de ML debe validar también la calidad de los datos nuevos y que el modelo reentrenado no empeora antes de sustituir al que está en producción.
- **Error**: seguir entrenando y desplegando modelos a mano desde un cuaderno en un equipo que crece → **Correcto**: sin pipelines automáticos y reproducibles, la deuda técnica (código frágil, imposible de repetir) crece más rápido que el propio proyecto.

## En resumen

- MLOps aplica las prácticas de DevOps (automatización, versionado, pruebas continuas) al ciclo de vida completo de un modelo de ML.
- Cuatro piezas clave: pipelines reproducibles, seguimiento de experimentos, registro y versionado de modelos, y CI/CD con orquestación.
- No hay una fórmula: es disciplina de ingeniería para reducir la "deuda técnica oculta" del ML (CACE, jungla de pipelines).
- Se aplica cuando un proyecto de ML pasa de un experimento puntual a un sistema que hay que mantener, actualizar y auditar en el tiempo.
- Decisiones clave: qué herramienta de tracking usar (MLflow y similares), cómo orquestar el reentrenamiento (Airflow, Kubeflow) y cuándo promover una versión a producción.
- La trampa principal: confundir MLOps con una herramienta concreta, en vez de verlo como el conjunto de prácticas que hace reproducible y auditable todo el pipeline.

## A fondo

:::ampliacion
La deuda técnica de Sculley et al. (2015) tiene más síntomas además de CACE y la jungla de pipelines: la **erosión de fronteras** (cuando distintos modelos y sistemas comparten señales de entrada de forma tan entrelazada que ya no está claro qué depende de qué) y las **cascadas de corrección** (arreglar un modelo con otro modelo que corrige sus errores, en vez de corregir la causa). Los autores concluyen que gran parte del coste real de mantener un sistema de ML no está en el modelo en sí, sino en toda la infraestructura que lo rodea, justo lo que MLOps intenta ordenar.
Fuente: Sculley, D. et al. (2015), "Hidden Technical Debt in Machine Learning Systems".
:::

:::ampliacion
Además de Airflow y Kubeflow Pipelines, las plataformas cloud ofrecen sus propios orquestadores integrados con almacenamiento de datos y registro de modelos, como Vertex AI Pipelines (Google Cloud) o SageMaker Pipelines (AWS), que reducen la infraestructura propia que un equipo tiene que mantener a cambio de quedar ligados a un proveedor concreto.
Fuente: Google Cloud, "MLOps: Continuous delivery and automation pipelines in machine learning".
:::

## Autoevaluación

### Un equipo entrena modelos en cuadernos que cada persona ejecuta a mano, sin registrar qué datos ni qué parámetros usó cada versión. Seis meses después, nadie puede reproducir el modelo que está en producción. ¿Qué pieza de MLOps habría evitado este problema?
- [ ] Un servidor más potente para entrenar más rápido
- [x] Un pipeline reproducible junto con un registro de experimentos que guarde datos, parámetros y modelo de cada ejecución
- [ ] Cambiar de lenguaje de programación
> Por qué: el problema no es de rendimiento sino de trazabilidad: sin versionar datos, parámetros y modelo de cada ejecución (tracking + registro), es imposible reconstruir después qué produjo el modelo en producción.

### ¿Por qué el CI/CD de MLOps no puede ser exactamente el mismo que el de un proyecto de software normal?
- [ ] Porque el código de ML nunca se puede probar automáticamente
- [x] Porque además de probar el código hay que validar la calidad de los datos nuevos y comprobar que el modelo reentrenado no empeora antes de sustituir al de producción
- [ ] Porque MLOps no necesita control de versiones
> Por qué: en ML el comportamiento del sistema depende también de los datos y del modelo entrenado, no solo del código, así que el pipeline de CI/CD debe añadir esas validaciones específicas.

### El fenómeno CACE (*Changing Anything Changes Everything*) descrito por Sculley et al. explica por qué…
- [ ] Los modelos de ML nunca deberían actualizarse una vez desplegados
- [x] Modificar una sola característica de entrada puede alterar de forma impredecible el comportamiento de todo el modelo, sin que ningún compilador avise del problema
- [ ] Los pipelines de datos son innecesarios si el modelo es suficientemente bueno
> Por qué: CACE describe precisamente el entrelazamiento entre las señales de entrada de un modelo de ML, que hace que un cambio pequeño en una característica se propague de forma difícil de anticipar por todo el sistema.

## Glosario

- **MLOps**: conjunto de prácticas de DevOps (automatización, versionado, integración continua) aplicadas al ciclo de vida completo de un modelo de machine learning.
- **Pipeline reproducible**: secuencia automatizada y versionada de pasos (datos, entrenamiento, evaluación) que produce el mismo resultado si se repite con las mismas entradas.
- **Registro de modelos (*model registry*)**: sistema que guarda cada versión entrenada de un modelo con su identificador y su estado (pruebas, producción, archivada).
