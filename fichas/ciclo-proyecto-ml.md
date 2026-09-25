---
id: ciclo-proyecto-ml
estado: borrador
---

## En una frase

El desarrollo de un modelo de aprendizaje automático sigue un ciclo de etapas ordenadas, desde entender el problema hasta vigilar el modelo ya en producción.

## Intuición

Piensa en preparar una expedición a una montaña. Antes de comprar nada decides adónde vas y por qué ruta (definir el problema); reúnes mapas y provisiones (recolectar datos) y los revisas antes de salir (explorarlos); eliges el equipo adecuado para ese terreno (seleccionar el modelo); haces la marcha comprobando en puntos de control que vas bien (entrenar y validar); llegas a la cima y confirmas que era la correcta (evaluar); y, ya de vuelta, revisas el material para la próxima salida (desplegar y mantener). Saltarte cualquier paso —sobre todo el primero— hace que el resto del viaje se resienta.

En un proyecto de ML pasa lo mismo: cada etapa depende de que la anterior se haya hecho bien, y casi ninguna se completa en una sola pasada.

## Explicación

### Antes de tocar datos: definir el problema

Cada proyecto arranca por clarificar qué se quiere resolver, no por elegir un algoritmo. Definir el problema significa decidir si hace falta un enfoque supervisado o no supervisado, si la salida será continua (regresión), discreta (clasificación) o sin etiquetas (agrupación), y con qué métrica se medirá el éxito. Una definición confusa arrastra errores a todas las etapas siguientes: mal elegidos los datos, mal elegida la métrica, mal evaluado el resultado final.

### Preparar el terreno: recolectar y explorar los datos

Con el problema claro, toca reunir datos que lo representen de verdad —de bases internas, APIs, sensores o repositorios abiertos como Kaggle—, respetando las restricciones legales y éticas que apliquen. El **análisis exploratorio de datos** ([[eda]]) es el primer contacto real con esos datos: revisar su distribución, detectar valores extraños y comprobar si hace falta más [[preprocesamiento]] antes de entrenar nada.

### Elegir, entrenar y validar el modelo

La **selección del modelo** depende del tipo de problema, de la cantidad de datos disponible y del equilibrio deseado entre interpretabilidad y precisión, tal y como viste en [[componentes-ml]]. Elegido el algoritmo, el modelo se ajusta con los datos de entrenamiento, se revisa con los de [[validacion]] para afinar hiperparámetros sin tocar aún los datos de prueba, y se mide su capacidad real de [[generalizacion|generalizar]] sobre datos nuevos. Estas tres etapas se repiten tantas veces como haga falta hasta dar con un modelo satisfactorio.

### Después del entrenamiento: llevarlo a producción

Un modelo validado no es un proyecto terminado: hay que [[despliegue|desplegarlo]] en un entorno real y vigilarlo con el tiempo, porque los datos que recibe en producción pueden cambiar respecto a los que vio en el entrenamiento. Si el rendimiento se degrada lo bastante, el ciclo empieza de nuevo desde el entrenamiento con datos actualizados. La versión de este flujo específica para redes profundas, con sus propias particularidades, la verás en [[flujo-dl-por-dato]].

## Formalización

No aplica: esta ficha describe un proceso de trabajo, no una relación matemática entre variables. Las fórmulas de cada etapa se detallan en su propia ficha (por ejemplo, la puntuación de validación cruzada en [[validacion]] o la brecha de generalización en [[generalizacion]]).

## Interactivo

```widget
motor: grafo
modo: diagrama
nodos: [{"id": "definicion", "etiqueta": "1. Definir el problema"}, {"id": "recoleccion", "etiqueta": "2. Recolectar datos"}, {"id": "eda", "etiqueta": "3. Explorar (EDA)", "enlace": "eda"}, {"id": "preproceso", "etiqueta": "4. Preprocesar", "enlace": "preprocesamiento"}, {"id": "seleccion", "etiqueta": "5. Seleccionar modelo", "enlace": "componentes-ml"}, {"id": "entrenamiento", "etiqueta": "6. Entrenar"}, {"id": "validacion", "etiqueta": "7. Validar", "enlace": "validacion"}, {"id": "evaluacion", "etiqueta": "8. Evaluar", "enlace": "generalizacion"}, {"id": "despliegue", "etiqueta": "9. Desplegar", "enlace": "despliegue"}, {"id": "monitoreo", "etiqueta": "10. Monitorizar", "enlace": "monitorizacion-drift"}]
aristas: [["definicion", "recoleccion"], ["recoleccion", "eda"], ["eda", "preproceso"], ["preproceso", "seleccion"], ["seleccion", "entrenamiento"], ["entrenamiento", "validacion"], ["validacion", "evaluacion"], ["evaluacion", "despliegue"], ["despliegue", "monitoreo"], ["monitoreo", "entrenamiento", "reentrenar si hace falta"]]
direccion: horizontal
```

- Prueba a seguir la ruta principal de izquierda a derecha y abrir la ficha de cada etapa que tenga enlace.
- Prueba a fijarte en la flecha que vuelve de "Monitorizar" a "Entrenar": el ciclo no termina en el despliegue.
- Prueba a pensar qué pasaría si te saltaras "Explorar (EDA)" y fueras directo de recolectar a preprocesar.

## Errores típicos

- **Error**: empezar a recolectar datos o elegir el algoritmo antes de definir bien el problema. → **Correcto**: sin una definición clara del problema y su métrica de éxito, cualquier dato o algoritmo elegido después puede no servir.
- **Error**: pensar que el ciclo termina en el despliegue. → **Correcto**: un modelo en producción necesita monitorización continua, porque los datos reales pueden cambiar respecto a los de entrenamiento.
- **Error**: saltarse el análisis exploratorio para llegar antes al entrenamiento. → **Correcto**: sin EDA es fácil entrenar sobre datos con errores, huecos o desequilibrios que luego arruinan el modelo.
- **Error**: creer que las etapas se ejecutan una sola vez y en orden estricto. → **Correcto**: es habitual volver atrás —por ejemplo, a preprocesamiento— si la validación revela problemas.

## En resumen

- **Qué hace y para qué sirve**: ordena en etapas todo el trabajo de un proyecto de ML, desde entender el problema hasta mantenerlo en producción.
- **Cómo funciona en pasos**: definir el problema → recolectar y explorar los datos → preprocesarlos → seleccionar, entrenar, validar y evaluar el modelo → desplegarlo → monitorizarlo.
- **Regla clave**: ninguna etapa compensa una anterior mal hecha; un problema mal definido o unos datos de mala calidad se arrastran hasta el final.
- **Cuándo repetir el ciclo**: si el rendimiento en validación es malo, o si el modelo en producción empieza a degradarse, toca volver a etapas anteriores.
- **Decisión que importa**: cuánto tiempo y cuidado dedicar a definir el problema y explorar los datos antes de tocar ningún algoritmo.
- **Trampa principal**: tratar el despliegue como la meta final, en vez de como el inicio de una fase de vigilancia continua.

## A fondo

La recolección de datos no es solo una cuestión técnica. Cuando los datos provienen de personas —historiales médicos, transacciones bancarias, publicaciones en redes sociales— hace falta su consentimiento y cumplir la normativa aplicable, como el Reglamento General de Protección de Datos (RGPD) en Europa. Más datos tampoco es sinónimo de mejores datos: si son ruidosos o no representativos, solo consiguen que el modelo aprenda patrones equivocados con más confianza.

## Autoevaluación

### Un equipo empieza a programar una red neuronal antes de decidir si el problema es de clasificación o de regresión. ¿Qué etapa se han saltado?
- [ ] La validación.
- [x] La definición del problema.
- [ ] El despliegue.
> Por qué: elegir el algoritmo antes de definir el problema invierte el orden del ciclo; sin esa definición no se sabe qué tipo de modelo ni qué métrica de éxito usar.

### Un modelo lleva seis meses en producción y sus predicciones han empeorado poco a poco. ¿Qué etapa del ciclo está fallando?
- [ ] La recolección de datos inicial.
- [x] La monitorización y el mantenimiento.
- [ ] La selección del modelo.
> Por qué: un rendimiento que se degrada con el tiempo en producción es justo lo que debe detectar la etapa de monitorización, para decidir si hace falta reentrenar.

### ¿Por qué el ciclo de vida de un proyecto de ML no es estrictamente lineal?
- [ ] Porque las etapas se pueden hacer en cualquier orden sin consecuencias.
- [x] Porque un problema detectado en una etapa, como la validación, suele obligar a volver a una etapa anterior, como el preprocesamiento.
- [ ] Porque solo el despliegue y la monitorización pueden repetirse.
> Por qué: el ciclo es iterativo: los resultados de validar o evaluar a menudo señalan que hace falta revisar datos o hiperparámetros anteriores, no solo avanzar.

### Antes de recolectar datos personales para un proyecto de ML en Europa, ¿qué hay que tener en cuenta según esta ficha?
- [ ] Nada especial: cualquier dato disponible sirve si es suficiente en cantidad.
- [x] El consentimiento de los usuarios y la normativa de protección de datos aplicable, como el RGPD.
- [ ] Solo el formato técnico en que se van a almacenar los datos.
> Por qué: la recolección de datos personales exige cumplir requisitos éticos y legales, no solo técnicos; ignorarlos puede invalidar el proyecto aunque el modelo funcione bien.

## Glosario

- **Ciclo de vida de un proyecto de ML**: secuencia de etapas —desde definir el problema hasta monitorizar el modelo en producción— que guía el desarrollo de un sistema de aprendizaje automático.
- **Recolección de datos**: fase en la que se reúnen los datos que representan el problema, atendiendo a su calidad, cantidad y las restricciones legales o éticas aplicables.
- **Selección del modelo**: fase en la que se elige qué algoritmo o familia de modelos usar, según el tipo de problema, la cantidad de datos y el equilibrio deseado entre interpretabilidad y precisión.
