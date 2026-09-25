---
id: transfer-learning
estado: borrador
---

## En una frase

El aprendizaje por transferencia reutiliza lo que un modelo ya aprendió en una tarea para resolver otra tarea relacionada, con menos datos y menos entrenamiento.

## Intuición

Si ya hablas español, aprender italiano te cuesta menos que empezar desde cero: reconoces raíces de palabras, estructuras gramaticales y patrones de sonido que ya tenías interiorizados. Con las redes neuronales pasa algo parecido. Entrenar una [[cnn|red convolucional]] desde cero para reconocer imágenes exige muchísimos datos y tiempo de cómputo, porque la red tiene que aprender desde los bordes y las texturas más básicas hasta los patrones complejos. Si ya existe una red entrenada en un conjunto de imágenes amplio, gran parte de ese conocimiento básico —bordes, texturas, formas— es reutilizable para una tarea nueva relacionada, sin tener que volver a aprenderlo.

El **aprendizaje por transferencia** (*transfer learning*) es justo esa reutilización: partir de un modelo ya entrenado y adaptarlo a un problema distinto, en vez de entrenar uno nuevo desde cero.

## Explicación

### Dominio origen y dominio destino

En transferencia se habla de un **dominio origen**, donde el modelo se entrenó inicialmente, y un **dominio destino**, la nueva tarea a la que se quiere aplicar. Por ejemplo, si un modelo se entrenó para clasificar fotos de perros y gatos, ese es su dominio origen; si ahora se reutiliza para clasificar leones y tigres, ese es el dominio destino. Como ambos dominios son similares (fotos de animales, con ojos, pelaje y poses parecidas), el modelo puede aprovechar directamente gran parte de lo aprendido. Si el dominio destino fuera muy distinto —por ejemplo, radiografías médicas—, el conocimiento transferido sería menos útil y haría falta un ajuste más profundo.

### Dos formas de transferir

Existen dos estrategias principales. La **extracción de características** (*feature extraction*) reutiliza las capas de un modelo preentrenado tal cual, sin modificar sus pesos, y solo entrena capas nuevas añadidas al final para adaptarse a la tarea destino: es rápida, necesita pocos datos nuevos y funciona bien cuando los dominios son parecidos. El **fine-tuning**, en cambio, continúa entrenando parte o todas las capas del modelo preentrenado con los datos del nuevo dominio, normalmente con una tasa de aprendizaje ($\eta$) mucho más baja que en un entrenamiento desde cero, para no destruir de golpe lo ya aprendido —un riesgo conocido como **catástrofe del olvido**. Cuanto más se aleje el dominio destino del origen, o cuantos más datos nuevos haya disponibles, más conviene inclinarse hacia el fine-tuning en vez de solo extracción de características; más adelante, [[fine-tuning]] retoma esta técnica aplicada a modelos de lenguaje.

### Aplicación práctica

En una GAN o un autoencoder generativo, la extracción de características suele reutilizar las capas iniciales del generador o del codificador —que ya aprendieron a modelar bordes y texturas generales— y solo ajustar las capas finales para adaptarse a un nuevo estilo o dominio. El fine-tuning va más allá: por ejemplo, partir de un StyleGAN entrenado con rostros humanos y continuar su entrenamiento con imágenes de anime, ajustando progresivamente los pesos hacia las nuevas características estilísticas sin perder la coherencia estructural de una cara.

## Formalización

Sea un modelo con parámetros $\boldsymbol\theta$, preentrenados en el dominio origen. Se dividen en dos bloques:

$$\boldsymbol\theta = \boldsymbol\theta_{\text{congelado}} \cup \boldsymbol\theta_{\text{entrenable}}$$

En **extracción de características**, solo se actualiza $\boldsymbol\theta_{\text{entrenable}}$ (las capas nuevas o finales), mientras $\boldsymbol\theta_{\text{congelado}}$ permanece fijo. En **fine-tuning**, todo o casi todo $\boldsymbol\theta$ se actualiza, pero con una tasa de aprendizaje reducida:

$$\boldsymbol\theta \leftarrow \boldsymbol\theta - \eta_{ft}\cdot\nabla_{\boldsymbol\theta}\mathcal{L}(\boldsymbol\theta), \qquad \eta_{ft} \ll \eta$$

donde:
- $\boldsymbol\theta$: parámetros del modelo; $\eta_{ft}$: tasa de aprendizaje usada en el ajuste, más pequeña que la del entrenamiento original ($\eta$)
- $\mathcal{L}$: función de pérdida evaluada sobre los datos del dominio destino
- $\nabla_{\boldsymbol\theta}\mathcal{L}$: gradiente de la pérdida respecto a los parámetros

Ejemplo numérico: una red con 4 capas de $100$, $200$, $50$ y $20$ parámetros ($370$ en total). Si se congelan las dos primeras capas para hacer extracción de características, se entrena solo el $18{,}9\%$ de los parámetros ($70$ de $370$) y se deja fijo el $81{,}1\%$ restante. Para ilustrar el efecto de la tasa de aprendizaje reducida en fine-tuning: un peso $w=2{,}0$ con gradiente $1{,}5$ pasaría a $w=1{,}985$ con una tasa normal $\eta=0{,}01$, pero solo a $w=1{,}99985$ con $\eta_{ft}=0{,}0001$: el ajuste es real, pero mucho más suave (verificado con `numpy`).

## Interactivo

```widget
motor: pasos
---
Partimos de una red con 4 capas preentrenadas en un dominio amplio: capa1=100, capa2=200, capa3=50 y capa4=20 parámetros (370 en total). Todas están congeladas: el 0% del modelo se actualiza con el nuevo dominio.
---
Extracción de características: congelamos capa1 y capa2 (300 parámetros, el 81,1% del modelo) y solo entrenamos capa3 y capa4 (70 parámetros, el 18,9%). Es la opción más rápida y la que necesita menos datos nuevos.
---
Fine-tuning: descongelamos las 4 capas, pero usamos una tasa de aprendizaje mucho más baja ($\eta=0{,}0001$ en vez de $0{,}01$). Un paso de gradiente típico ($w=2{,}0$, gradiente $=1{,}5$) mueve el peso a $1{,}985$ con entrenamiento normal, pero solo a $1{,}99985$ con esta tasa reducida: casi no se toca lo ya aprendido.
---
Regla práctica: cuanto más distinto es el dominio destino del dominio origen, más capas conviene descongelar (más fine-tuning); cuanto más parecido, menos hace falta tocar (más extracción de características).
```

Prueba a calcular qué porcentaje del modelo se entrena si, en el fotograma 2, además descongelas capa3 pero mantienes capa4 fija.

Prueba a explicar por qué una tasa de aprendizaje alta en el fotograma 3 podría provocar la catástrofe del olvido.

Prueba a decidir qué estrategia (fotograma 2 o 3) usarías si el dominio destino fuera muy distinto del original, por ejemplo pasar de fotos a radiografías.

## Errores típicos

- **Error**: pensar que el fine-tuning siempre da mejores resultados que la extracción de características → **Correcto**: con pocos datos en el dominio destino, el fine-tuning puede sobreajustar o sufrir catástrofe del olvido; la extracción de características suele ser más segura en ese caso.
- **Error**: usar la misma tasa de aprendizaje en fine-tuning que en un entrenamiento desde cero → **Correcto**: una tasa alta puede destruir de golpe el conocimiento preentrenado; se usa una tasa reducida precisamente para ajustar sin borrar.
- **Error**: asumir que cualquier modelo preentrenado sirve para cualquier dominio destino → **Correcto**: la eficacia de la transferencia depende de cuánto se parezcan el dominio origen y el destino; dominios muy distintos requieren más ajuste o pueden no beneficiarse en absoluto.
- **Error**: confundir "congelar una capa" con "eliminarla" → **Correcto**: una capa congelada sigue participando en el cálculo hacia delante (sigue produciendo su salida), solo que sus pesos no se actualizan durante el entrenamiento.

## En resumen

- El aprendizaje por transferencia reutiliza un modelo ya entrenado en un dominio origen para resolver una tarea en un dominio destino relacionado.
- Hay dos estrategias: extracción de características (congelar casi todo, entrenar solo capas nuevas) y fine-tuning (reentrenar todo o casi todo con una tasa de aprendizaje reducida).
- Regla clave: $\boldsymbol\theta \leftarrow \boldsymbol\theta - \eta_{ft}\nabla_{\boldsymbol\theta}\mathcal{L}(\boldsymbol\theta)$ con $\eta_{ft}\ll\eta$, para no borrar de golpe lo ya aprendido.
- Usa extracción de características cuando el dominio destino es parecido al origen y hay pocos datos nuevos; usa fine-tuning cuando hay más datos disponibles o el dominio destino es más distinto.
- La decisión que más importa es cuántas capas descongelar y qué tasa de aprendizaje usar en las que sí se ajustan.
- La trampa principal: la catástrofe del olvido, perder de golpe el conocimiento preentrenado por usar una tasa de aprendizaje demasiado alta al hacer fine-tuning.

## A fondo

Un caso concreto de extracción de características son las **Super-Resolution GAN (SRGAN)**: un modelo preentrenado en imágenes generales de alta resolución puede reutilizarse para mejorar la calidad de imágenes médicas (resonancias, tomografías) sin entrenar desde cero, conservando las capas que ya reconocen texturas y bordes y ajustando solo las últimas.

Otro caso relevante son los **deepfakes**: redes preentrenadas en enormes volúmenes de rostros aprenden a capturar la estructura de expresiones faciales, y mediante fine-tuning se especializan en una persona concreta con relativamente pocos ejemplos adicionales, preservando detalles como iluminación y textura de la piel. Esta misma técnica de transferencia, aplicada con fines legítimos, se usa en efectos visuales de cine para rejuvenecer digitalmente a actores o recrear su apariencia sin modelado 3D manual.

Combinar ambas estrategias también es habitual: reutilizar las capas iniciales de un modelo (extracción de características) mientras se afinan con fine-tuning solo las capas más especializadas, aprovechando lo mejor de las dos según cuánta capacidad de ajuste y cuántos datos nuevos haya disponibles.

## Autoevaluación

### Un equipo tiene muy pocos datos etiquetados de un dominio destino bastante parecido al dominio origen del modelo preentrenado. ¿Qué estrategia es más razonable como primera opción?
- [x] Extracción de características: congelar la mayoría de las capas y entrenar solo las finales
- [ ] Fine-tuning completo con una tasa de aprendizaje alta
- [ ] Entrenar el modelo desde cero, ignorando el modelo preentrenado
> Por qué: con pocos datos y dominios parecidos, la extracción de características aprovecha el conocimiento ya aprendido sin arriesgarse al sobreajuste o a la catástrofe del olvido que puede traer un fine-tuning agresivo.

### ¿Por qué el fine-tuning suele usar una tasa de aprendizaje mucho más baja que un entrenamiento desde cero?
- [ ] Porque las capas preentrenadas no admiten ningún cambio en sus pesos
- [x] Para ajustar los pesos preentrenados progresivamente sin borrar de golpe el conocimiento ya aprendido (catástrofe del olvido)
- [ ] Porque una tasa baja siempre acelera la convergencia del entrenamiento
> Por qué: una tasa de aprendizaje alta aplicaría cambios grandes a pesos que ya codifican conocimiento útil, arriesgándose a destruirlo antes de que el modelo aprenda las particularidades del nuevo dominio.

### Un modelo entrenado para clasificar fotos de perros y gatos se reutiliza para clasificar imágenes de radiografías de tórax. ¿Qué es más probable que ocurra?
- [ ] La transferencia funcionará igual de bien que entre perros/gatos y leones/tigres, porque ambos son problemas de clasificación de imágenes
- [x] La transferencia será menos directa, porque el dominio destino (radiografías) es muy distinto del dominio origen (fotos de animales), y hará falta un ajuste más profundo
- [ ] La transferencia es imposible entre dominios tan distintos
> Por qué: la eficacia del aprendizaje por transferencia depende de cuánto se parezcan las distribuciones de los dominios origen y destino; cuanto más distintos son, menos conocimiento reutilizable hay y más ajuste (o más datos) se necesita.

### En una red de 4 capas, se congelan las capas 1 y 2 y se entrenan las capas 3 y 4. ¿Qué describe mejor esta situación?
- [ ] Fine-tuning completo del modelo
- [x] Extracción de características, porque las capas congeladas actúan como un extractor fijo y solo se ajustan las capas finales
- [ ] Entrenamiento desde cero de las 4 capas
> Por qué: mantener fijas las capas preentrenadas y entrenar únicamente las capas añadidas o finales es la definición de extracción de características, en contraste con el fine-tuning, que ajusta también las capas preentrenadas.

## Glosario

- **dominio origen**: conjunto de datos y distribución sobre los que se entrenó originalmente un modelo.
- **dominio destino**: conjunto de datos y distribución de la nueva tarea a la que se quiere aplicar el modelo preentrenado.
- **extracción de características (transfer learning)**: reutilizar las capas de un modelo preentrenado sin modificar sus pesos, entrenando solo capas nuevas o finales. Distinto de la [[reduccion-dimensionalidad|extracción de características]] de PCA.
- **fine-tuning**: estrategia de transferencia que continúa entrenando parte o todas las capas de un modelo preentrenado con una tasa de aprendizaje reducida.
- **catástrofe del olvido**: pérdida del conocimiento aprendido en el dominio origen al ajustar demasiado agresivamente un modelo preentrenado sobre el dominio destino.
