---
id: despliegue
estado: borrador
---

## En una frase

El despliegue lleva un modelo ya entrenado y validado a producción, decidiendo si responderá al instante o por lotes y en qué máquina vivirá.

## Intuición

Imagina a un cocinero que perfecciona una receta en la cocina de pruebas: la prueba, la ajusta, la valida con catadores. Esa receta no sirve de nada hasta que se sirve a comensales reales, noche tras noche, a la velocidad adecuada y con los mismos ingredientes disponibles siempre. El **despliegue** es justo ese salto: pasar de "funciona en mi cuaderno de entrenamiento" a "funciona para usuarios reales, de forma fiable, bajo carga".

Ese salto tiene dos ritmos posibles, como en una panadería. Unas veces se hornean cientos de barras durante la noche para tenerlas listas por la mañana (procesamiento por lotes, *batch*); otras veces un barista prepara un café bajo pedido, uno a uno, al momento (tiempo real). Elegir mal el ritmo —o el lugar donde vive el modelo— puede hacer que un sistema perfecto en pruebas falle en producción por lentitud, por falta de una librería o por no soportar el volumen real de usuarios.

## Explicación

### Del cuaderno al sistema en producción

Tras la fase de validación del [[ciclo-proyecto-ml|ciclo de vida de un proyecto de ML]], el modelo deja de ser un experimento y pasa a interactuar directamente con usuarios, sistemas o procesos de negocio. El despliegue no es un paso menor: el modelo debe integrarse en la infraestructura existente sin romperla, y sus fallos ya no se quedan en un cuaderno, sino que afectan a decisiones reales.

### Dos ritmos: tiempo real o por lotes (*batch*)

La forma más habitual de servir un modelo es mediante una **API** (interfaz de programación de aplicaciones): otro sistema envía datos, el modelo responde con una predicción, todo en milisegundos o segundos. Así funciona, por ejemplo, un sistema de prevención de fraude bancario que debe decidir en el instante de la transacción.

La alternativa es integrar el modelo en un **pipeline de datos** que procesa grandes volúmenes de información de forma periódica: cada noche, cada hora, cada semana. Este modo por lotes no necesita responder al instante, pero sí ser eficiente con grandes cantidades de datos. Una plataforma que recalcula recomendaciones de productos una vez al día es un ejemplo típico.

### Dónde vive el modelo: nube, local o el borde (*edge*)

El despliegue también decide **dónde** se ejecuta el modelo. En la **nube** (AWS, Azure, GCP) se aprovecha escalabilidad y potencia bajo demanda. En un despliegue **local** (*on-premise*), el modelo corre en servidores o centros de datos propios de la organización, dentro de su red privada. En el **borde** (*edge computing*), el modelo se ejecuta en dispositivos cercanos a donde se generan los datos —sensores IoT, móviles, routers—, lo que reduce la latencia y evita enviar grandes volúmenes de datos a servidores centrales. El edge no es lo mismo que lo local: lo local controla la máquina, el edge controla la cercanía al dato.

### Lo que hay que garantizar: latencia, escalabilidad y reproducibilidad

Tres exigencias técnicas dominan el despliegue. La **latencia** —el tiempo entre la petición y la respuesta— puede ser crítica cuando la decisión no admite espera. La **escalabilidad** importa cuando miles o millones de usuarios llaman al modelo a la vez. Y la **reproducibilidad** exige que el modelo se comporte en producción igual que en entrenamiento, lo que obliga a fijar las mismas versiones de librerías y de hardware; por eso se usan **contenedores** como Docker, que empaquetan el modelo junto con todas sus dependencias.

## Formalización

No aplica: el despliegue es una decisión de arquitectura de sistemas, no un concepto matemático.

## Interactivo

```widget
motor: grafo
modo: "diagrama"
nodos: [
  {"id": "modelo", "etiqueta": "Modelo entrenado y validado"},
  {"id": "api", "etiqueta": "Servido vía API (tiempo real)"},
  {"id": "batch", "etiqueta": "Integrado en pipeline (batch)"},
  {"id": "nube", "etiqueta": "Nube (AWS/Azure/GCP)"},
  {"id": "edge", "etiqueta": "Edge (sensores, móvil, IoT)"},
  {"id": "local", "etiqueta": "Servidor local / on-premise"},
  {"id": "usuario", "etiqueta": "Aplicación o usuario final"}
]
aristas: [
  ["modelo", "api", "expone predicción bajo demanda"],
  ["modelo", "batch", "procesa grandes volúmenes periódicamente"],
  ["api", "nube", "aloja el servicio"],
  ["api", "edge", "reduce latencia cerca del dato"],
  ["api", "local", "dentro de la red privada"],
  ["batch", "nube", "escala el procesamiento"],
  ["batch", "local", "control total de los datos"],
  ["api", "usuario", "respuesta en milisegundos"],
  ["batch", "usuario", "resultados listos tras el proceso"]
]
direccion: "vertical"
```

Prueba a…
1. Prueba a seguir el camino desde el modelo entrenado hasta la nube pasando por la API, y compáralo con el camino que pasa por edge: ¿qué gana y qué pierde cada uno?
2. Prueba a comparar el camino de la API con el del batch: ¿cuál eligirías para un cajero automático que aprueba pagos y cuál para recalcular recomendaciones cada noche?
3. Prueba a imaginar un sensor de una fábrica que debe frenar una máquina si detecta una anomalía: ¿qué combinación de nodos del diagrama describe mejor ese despliegue?

## En código

```python
from sklearn.linear_model import LogisticRegression
import numpy as np
import joblib

X = np.array([[0], [1], [2], [3]])
y = np.array([0, 0, 1, 1])
modelo = LogisticRegression().fit(X, y)

joblib.dump(modelo, "modelo.joblib")
modelo_cargado = joblib.load("modelo.joblib")

print(modelo_cargado.predict([[2.5]]))
print(modelo_cargado.predict_proba([[2.5]]))
# [1]
# [[0.277 0.723]]
```

`joblib.dump`/`joblib.load` es la forma más simple de serializar un modelo de scikit-learn: guarda el objeto entrenado en disco para cargarlo después en el servicio que lo despliega, sin volver a entrenarlo.

## Errores típicos

- **Error**: pensar que *edge computing* y "desplegar en local" son lo mismo → **Correcto**: en local el modelo corre en la red privada de la empresa (un centro de datos propio); en el borde corre en el dispositivo que genera el dato (un sensor, un móvil), más cerca del origen y con menor latencia.
- **Error**: creer que desplegar es solo "subir el archivo del modelo" → **Correcto**: hay que empaquetar también las dependencias exactas (versiones de librerías) para que el modelo se comporte igual que en entrenamiento; por eso se usan contenedores como Docker.
- **Error**: elegir procesamiento por lotes para un caso que exige respuesta inmediata → **Correcto**: cuando la decisión debe tomarse en el momento (por ejemplo, un fraude mientras ocurre), hace falta una API en tiempo real, aunque cueste más mantenerla siempre disponible.
- **Error**: suponer que la nube es siempre la mejor opción → **Correcto**: si los datos deben procesarse cerca de su origen o hay restricciones de conectividad o privacidad, el edge o el despliegue local pueden ser preferibles, a costa de menos escalabilidad.

## En resumen

- El despliegue lleva el modelo entrenado a producción para que genere predicciones reales sobre usuarios o sistemas.
- Dos ritmos posibles: tiempo real (una API responde a cada petición) o batch (procesa lotes de datos periódicamente).
- Dónde vivir: nube (escalable bajo demanda), local/on-premise (control total) o edge (cerca del dato, menor latencia).
- Hay que garantizar latencia baja cuando la decisión no admite espera, escalabilidad si hay muchos usuarios simultáneos, y reproducibilidad de las dependencias, normalmente con contenedores como Docker.
- Se aplica cuando el modelo ya está validado y toca integrarlo con sistemas y usuarios reales; no antes.
- Las decisiones que más importan: tiempo real vs. batch, y nube vs. local vs. edge.
- La trampa principal: tratar el despliegue como copiar un archivo, ignorando latencia, dependencias y lo que viene después (monitorización).

## A fondo

:::ampliacion
**Serialización del modelo.** Antes de desplegar hay que guardar el modelo entrenado en un formato que otro sistema pueda cargar. En scikit-learn se usa `joblib` (o `pickle`); en TensorFlow, el formato `SavedModel`; y para llevar un modelo entre frameworks distintos —por ejemplo, entrenado en PyTorch y servido con otro motor— existe **ONNX** (*Open Neural Network Exchange*), un formato intercambiable pensado justo para ese problema.
Fuente: documentación de TensorFlow Serving y de ONNX.
:::

:::ampliacion
**Servir con una API.** En Python, **FastAPI** (o Flask) es el framework más habitual para envolver un modelo en un endpoint HTTP: recibe una petición, llama a `modelo.predict(...)` y devuelve la respuesta en JSON. Cuando el volumen de peticiones es muy alto o se necesita inferencia muy optimizada, se recurre a servidores especializados como **TensorFlow Serving** o **Triton Inference Server**, que gestionan colas, *batching* de peticiones y aceleración por GPU de forma automática.
Fuente: documentación de FastAPI.
:::

:::ampliacion
**Contenedores.** Un modelo entrenado depende de versiones exactas de librerías (scikit-learn, TensorFlow) y a veces de hardware concreto. **Docker** empaqueta el modelo junto con todo su entorno en una imagen que se ejecuta igual en cualquier máquina, evitando el clásico "en mi ordenador funciona" cuando se pasa de desarrollo a producción.
Fuente: documentación de TensorFlow Serving.
:::

## Autoevaluación

### Un sensor de temperatura en una fábrica debe frenar una máquina en cuanto detecta una anomalía, sin depender de la conexión a internet. ¿Qué tipo de despliegue encaja mejor?
- [ ] Por lotes (*batch*) en la nube, recalculando cada noche
- [x] En tiempo real, en el borde (*edge*), cerca del propio sensor
- [ ] En tiempo real, pero solo en un servidor local sin importar la latencia
> Por qué: la decisión debe tomarse al instante y sin depender de la red, así que el modelo debe vivir en el propio dispositivo o muy cerca de él (edge), no esperar a un proceso por lotes ni depender de una API lejana.

### ¿En qué se diferencia el despliegue en local del despliegue en el borde (*edge*)?
- [ ] Son lo mismo: ambos ejecutan el modelo fuera de la nube
- [x] En local el modelo corre en la red privada de la empresa; en el borde corre en el dispositivo que genera el dato, más cerca del origen
- [ ] El edge siempre es más lento que el local porque tiene menos potencia
> Por qué: ambos evitan la nube pública, pero difieren en la ubicación: local es "dentro de mi infraestructura", edge es "junto al dato", lo que reduce aún más la latencia y el tráfico de red.

### Un equipo despliega un modelo copiando solo el archivo `.pkl` a un servidor nuevo, sin más preparación. En producción, el modelo da resultados distintos a los de entrenamiento. ¿Cuál es la causa más probable?
- [ ] El modelo ha olvidado lo que aprendió al guardarse en disco
- [x] El servidor nuevo tiene versiones distintas de las librerías, y el modelo no se comporta igual sin un entorno reproducible (por ejemplo, un contenedor)
- [ ] Los archivos `.pkl` nunca se pueden cargar en otra máquina
> Por qué: un modelo serializado depende del entorno de software en que se ejecuta; sin fijar las mismas versiones (con Docker, por ejemplo), pequeñas diferencias de librería pueden cambiar el resultado.

### ¿Por qué un sistema de recomendaciones de una tienda online puede desplegarse por lotes (batch) mientras que uno de detección de fraude no?
- [ ] Porque las recomendaciones son menos importantes que el fraude
- [x] Porque las recomendaciones no necesitan responder al instante de cada clic, mientras que el fraude debe decidirse durante la propia transacción
- [ ] Porque el batch siempre es más preciso que el tiempo real
> Por qué: la elección entre batch y tiempo real depende de si la decisión admite esperar a un proceso periódico o debe tomarse en el momento; el fraude no puede esperar, las recomendaciones normalmente sí.

## Glosario

- **API**: interfaz que permite que un sistema externo envíe datos a un modelo desplegado y reciba su predicción como respuesta.
- **Edge computing**: ejecutar el modelo en dispositivos cercanos al origen del dato (sensores, móviles, routers) para reducir la latencia.
- **Contenedor**: paquete que encapsula el modelo junto con todas sus dependencias (librerías, versiones) para que se ejecute igual en cualquier entorno.
