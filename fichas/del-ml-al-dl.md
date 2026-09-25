---
id: del-ml-al-dl
estado: borrador
---

## En una frase
El Deep Learning es un enfoque de aprendizaje automático que usa redes neuronales profundas para aprender representaciones directamente de datos brutos, sin ingeniería manual de características.

## Intuición
Imagina que quieres enseñar a alguien a reconocer manzanas en fotos. Con el enfoque clásico, tú decides qué medir: el color medio de la imagen, la redondez del contorno, el brillo... y luego un algoritmo aprende a combinar esas medidas para decidir "manzana" o "no manzana". Si las medidas que elegiste no captan lo importante, el algoritmo nunca podrá aprenderlo por más ejemplos que le des.

El Deep Learning cambia el reparto de trabajo: en lugar de decirle a la red qué medir, le entregas la imagen entera, píxel a píxel, y dejas que ella misma descubra qué patrones —bordes, texturas, formas— le sirven para distinguir manzanas. Es la diferencia entre darle a un ayudante de cocina los ingredientes ya troceados según tus instrucciones, o entregarle la materia prima y dejar que aprenda solo a prepararla. Esta capacidad de aprender la propia representación de los datos, no solo la decisión final, es lo que ha permitido a la IA abordar problemas con imágenes, audio o texto que antes eran intratables con métodos clásicos.

## Explicación

### De la ingeniería manual de características al aprendizaje automático de representaciones
En el [[supervisado|aprendizaje supervisado]] clásico —regresión lineal o logística, árboles de decisión, SVM— el proceso se divide siempre en dos etapas separadas. Primero, una persona experta hace [[seleccion-caracteristicas|ingeniería de características]]: decide cómo convertir datos brutos (imagen, texto, audio) en un vector de números que el algoritmo pueda procesar, por ejemplo contando bordes con HOG en visión o palabras con TF-IDF en texto. Después, el algoritmo aprende a combinar esas características ya elegidas para predecir.

Este reparto funciona bien cuando el problema es simple o existe conocimiento experto claro sobre qué medir. Pero se vuelve un cuello de botella con datos no estructurados y de alta dimensión: nadie sabe de antemano qué combinación de píxeles distingue un gato de un perro, y diseñar esas reglas a mano resulta costoso y no escala.

El **Deep Learning** (aprendizaje profundo) elimina esa frontera. Una red neuronal profunda recibe el dato bruto y aprende, capa a capa, representaciones cada vez más abstractas: las primeras capas detectan patrones simples (bordes, contrastes) y las últimas combinan esos patrones en conceptos de alto nivel (formas, objetos). La extracción de características y el aprendizaje de la tarea ocurren en una sola pasada de entrenamiento, de extremo a extremo.

### Qué impulsó el auge del Deep Learning
Ninguna idea aislada basta para explicarlo: el auge del Deep Learning surge de la convergencia de varios factores. El volumen de **datos** disponibles creció de forma masiva (sensores, redes sociales, digitalización), y las redes profundas necesitan muchos ejemplos para no sobreajustar. La **capacidad de cómputo** dio un salto con las GPU y, después, las TPU, que paralelizan las operaciones matriciales que dominan el entrenamiento. Mejoras en los **algoritmos de entrenamiento** —descenso de gradiente con momentum, normalización por lotes, dropout— hicieron el entrenamiento más estable (se detallan en [[optimizadores]] y [[entrenamiento-dl]]). Y frameworks como TensorFlow o PyTorch bajaron la barrera de entrada al ocultar la implementación matemática de bajo nivel.

### Qué gana y qué pierde frente al Machine Learning clásico
La ventaja central del Deep Learning es su capacidad de representación: aprende patrones jerárquicos donde nadie sabría diseñar características a mano, y escala bien cuando hay muchos datos. El precio es un coste computacional mucho mayor, la necesidad de grandes volúmenes de datos etiquetados y una pérdida de interpretabilidad: una red con millones de parámetros es, en la práctica, una caja negra.

El Machine Learning clásico no ha desaparecido. En datasets pequeños, con pocas variables y donde la interpretabilidad importa —diagnóstico médico regulado, riesgo crediticio—, un árbol de decisión o una regresión logística puede ser preferible a una red neuronal, tanto por eficiencia como porque es más fácil auditar por qué decide lo que decide.

### Del Perceptrón a las redes profundas
Aunque el Deep Learning parece reciente, las redes neuronales existen desde los años 60 con el [[perceptron|Perceptrón]] de Rosenblatt. Lo que ha cambiado no es la idea de conectar neuronas artificiales en capas, sino la profundidad alcanzable y los recursos disponibles para entrenarla. El resto de esta serie de fichas construye esa idea desde la neurona artificial ([[perceptron]]) hasta las redes multicapa ([[mlp]]).

## Formalización
No aplica: este concepto compara paradigmas de aprendizaje automático a nivel conceptual; las fórmulas de la neurona artificial y de la propagación hacia delante se formalizan en [[perceptron]] y [[mlp]].

## Errores típicos
- **Error**: Pensar que Deep Learning es simplemente "Machine Learning con más capas" → **Correcto**: la diferencia clave no es solo la profundidad, es que la propia red aprende la representación de los datos en lugar de recibirla ya diseñada por una persona.
- **Error**: Creer que el Deep Learning siempre supera al Machine Learning clásico → **Correcto**: con pocos datos, variables tabulares simples o necesidad de interpretabilidad, un modelo clásico suele ser más eficiente y más fácil de explicar.
- **Error**: Confundir "más datos" con "mejor modelo" sin más → **Correcto**: el Deep Learning aprovecha grandes volúmenes de datos, pero también necesita suficiente capacidad de cómputo y una arquitectura y entrenamiento adecuados.
- **Error**: Suponer que la ingeniería de características ha dejado de usarse → **Correcto**: sigue siendo central en Machine Learning clásico y en datos tabulares; el Deep Learning la automatiza, especialmente en datos no estructurados como imágenes, texto o audio.

## En resumen
- El Deep Learning es un enfoque de Machine Learning que usa redes neuronales profundas para aprender representaciones automáticamente a partir de datos brutos.
- Funciona por capas: cada una combina las salidas de la anterior y aplica una función de activación no lineal, hasta llegar a una predicción.
- A diferencia del ML clásico, no necesita ingeniería manual de características: la propia red descubre qué patrones importan.
- Su auge se explica por tres factores conjuntos: más datos disponibles, más capacidad de cómputo (GPU/TPU) y mejores algoritmos de entrenamiento.
- Úsalo cuando haya datos no estructurados (imágenes, texto, audio) en volumen; evítalo con datasets pequeños o cuando la interpretabilidad sea imprescindible.
- La decisión clave no es un hiperparámetro numérico, sino la elección de paradigma: cuántos datos hay, cuánto cómputo, y cuánto importa poder explicar la decisión.
- La trampa principal: pensar que "más capas" siempre gana; con pocos datos una red profunda sobreajusta peor que un modelo clásico bien regularizado.

## A fondo
### Aplicaciones que impulsó el Deep Learning
En visión por computadora, las redes convolucionales superaron a las técnicas manuales de detección de bordes y forma, permitiendo detección de rostros, diagnóstico por imagen y conducción autónoma con modelos como ResNet o YOLO. En procesamiento de lenguaje natural, los Transformers (BERT, GPT, T5) permitieron procesar oraciones completas en paralelo y dieron lugar a traductores, chatbots y buscadores semánticos modernos. El aprendizaje por refuerzo profundo llevó a sistemas como AlphaGo a superar a jugadores humanos en juegos complejos. El impacto se extiende también a biomedicina (descubrimiento de fármacos), finanzas (detección de fraude) y climatología (modelos meteorológicos), siempre que exista volumen suficiente de datos para entrenar.

## Autoevaluación

### Un equipo tiene un dataset tabular de 300 filas con 8 columnas y necesita que el modelo sea auditable por un regulador. ¿Qué enfoque es más razonable?
- [ ] Una red neuronal profunda con varias capas ocultas, porque siempre generaliza mejor
- [x] Un modelo clásico como un árbol de decisión o una regresión logística
- [ ] Una red convolucional, porque puede procesar cualquier tipo de dato
> Por qué: con pocos datos y necesidad de interpretabilidad, el Deep Learning no aporta ventaja y sí pierde en auditabilidad; los modelos clásicos son más eficientes y explicables en ese escenario.

### Si se entrena la misma arquitectura de red profunda con 100 ejemplos frente a con 1 millón de ejemplos, ¿qué es más probable que ocurra con el modelo de 100 ejemplos?
- [ ] Aprenderá representaciones más abstractas que con 1 millón de ejemplos
- [ ] No habrá diferencia relevante, el Deep Learning no depende del volumen de datos
- [x] Sobreajustará con mayor facilidad, al no tener suficientes ejemplos para generalizar
> Por qué: las redes profundas tienen muchos parámetros y necesitan volumen de datos para generalizar; con pocos ejemplos memorizan en vez de aprender patrones útiles.

### Un compañero dice: "el Machine Learning clásico no aprende nada de los datos, solo el Deep Learning aprende de verdad". ¿Qué es incorrecto en esa afirmación?
- [x] Ambos aprenden de los datos; la diferencia es que el ML clásico no descubre por sí solo cómo representar los datos brutos
- [ ] Es correcta: el ML clásico solo aplica reglas fijas escritas por personas
- [ ] Es correcta, porque el ML clásico no usa ningún algoritmo de optimización
> Por qué: el ML clásico sí ajusta sus parámetros a partir de datos, por ejemplo los pesos de una regresión logística; lo que no hace es descubrir automáticamente la representación de entrada, que se diseña a mano.

### ¿Cuál de estos tres factores, por sí solo y sin los otros dos, habría bastado para el auge actual del Deep Learning?
- [ ] Solo la disponibilidad de GPU
- [ ] Solo el volumen masivo de datos
- [x] Ninguno por separado: hicieron falta datos, cómputo y mejores algoritmos a la vez
> Por qué: el auge se explica como la convergencia de varios factores simultáneos; quitando cualquiera de ellos, las redes profundas actuales no habrían sido entrenables ni útiles.

## Glosario
- **representación jerárquica**: forma en que una red profunda transforma los datos en niveles crecientes de abstracción, capa a capa.
- **aprendizaje de extremo a extremo**: entrenar un modelo que va del dato bruto a la predicción final en una sola pasada, sin etapas manuales intermedias.
