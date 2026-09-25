---
id: supervisado
estado: borrador
---

## En una frase

El aprendizaje supervisado entrena un modelo con ejemplos ya etiquetados —entradas junto con su respuesta correcta— para que aprenda a predecir la etiqueta de casos nuevos que nunca ha visto.

## Intuición

Piensa en cómo aprende un estudiante de idiomas con tarjetas de vocabulario: cada tarjeta muestra una palabra por un lado y su traducción por el otro. El estudiante mira la palabra, intenta recordar la traducción, y comprueba si acertó. Repitiendo este proceso con muchas tarjetas, acaba generalizando el idioma más allá de las tarjetas concretas que memorizó.

El **aprendizaje supervisado** funciona igual: el modelo recibe muchos ejemplos con su "traducción" correcta ya conocida —la etiqueta—, ajusta sus parámetros para acertar cada vez más, y el objetivo final no es recordar esas tarjetas concretas, sino [[generalizacion|generalizar]] lo bastante bien como para acertar con palabras que nunca vio.

## Explicación

### Qué necesita y qué produce

De los [[tipos-aprendizaje|tres tipos de aprendizaje]], el supervisado es el que usa **datos etiquetados**: cada ejemplo de entrenamiento trae tanto sus características de entrada como la salida correcta esperada. A partir de ahí, el algoritmo busca una función que relacione entradas con salidas y que funcione también sobre ejemplos nuevos (ver Formalización).

### Clasificación y regresión: dos preguntas distintas

El aprendizaje supervisado responde a dos tipos de preguntas. En **clasificación**, la salida es una categoría entre un conjunto predefinido: si un correo es spam o no, si una imagen contiene un gato o un perro. En **regresión**, la salida es un valor continuo: el precio de una vivienda, la demanda futura de un producto. Esta distinción no es solo terminológica: condiciona qué algoritmos y qué métricas se usan después para evaluar el modelo.

### Dónde se aplica

El aprendizaje supervisado es, hoy, la rama más usada del machine learning en la práctica, con aplicaciones que van desde la visión por computador (reconocimiento de objetos, clasificación de imágenes) y el procesamiento del lenguaje natural (clasificación de texto, análisis de sentimiento) hasta la detección de fraude financiero y el diagnóstico médico a partir de imágenes o síntomas.

### Sus límites

Que sea el enfoque más usado no significa que sea siempre el más adecuado. Su primera limitación es práctica: necesita **grandes volúmenes de datos etiquetados**, y etiquetar puede ser caro y lento, sobre todo cuando requiere el criterio de un experto. La segunda es un riesgo de modelado, el [[generalizacion|sobreajuste]]: un modelo puede ajustarse tan bien a los datos de entrenamiento que memorice su ruido en vez de aprender el patrón subyacente, perdiendo capacidad de generalizar. La tercera es de naturaleza ética: si los datos etiquetados usados para entrenar contienen sesgos —por ejemplo, decisiones históricas de contratación sesgadas por género o raza—, el modelo puede no solo reproducir esos sesgos, sino amplificarlos en sus predicciones, lo que exige un análisis cuidadoso antes de usarlo en decisiones que afectan a personas.

## Formalización

$$
f: X \rightarrow Y, \qquad \min_{\boldsymbol\theta} \sum_{i=1}^n \mathcal{L}\left(y_i, f(\mathbf{x}_i; \boldsymbol\theta)\right)
$$

donde:

- $X$ es el espacio de entradas: el conjunto de todas las combinaciones posibles de características.
- $Y$ es el espacio de salidas: las clases posibles (clasificación) o los valores continuos posibles (regresión).
- $f$ es la función de mapeo que el modelo aprende, parametrizada por $\boldsymbol\theta$.
- $\mathbf{x}_i$ es el vector de características del ejemplo $i$, e $y_i$ su etiqueta real.
- $\mathcal{L}$ es la función de pérdida que mide el error entre la predicción $f(\mathbf{x}_i;\boldsymbol\theta)$ y la etiqueta real $y_i$ —entropía cruzada en clasificación, error cuadrático medio en regresión—.
- $n$ es el número de ejemplos etiquetados usados para entrenar.

## Errores típicos

- **Error**: pensar que el aprendizaje supervisado es la opción por defecto siempre que hay datos disponibles. → **Correcto**: si esos datos no están etiquetados, o etiquetarlos es inviable, conviene valorar enfoques no supervisados o semisupervisados en vez de forzar el etiquetado.
- **Error**: tratar un problema de regresión como si fuera de clasificación, o viceversa, sin pensarlo. → **Correcto**: la naturaleza de la salida —categoría o valor continuo— determina qué algoritmos y qué métricas de evaluación tienen sentido.
- **Error**: asumir que más datos etiquetados siempre arreglan un modelo sesgado. → **Correcto**: si los datos originales reflejan sesgos históricos, añadir más datos del mismo tipo puede reforzar ese sesgo en vez de corregirlo.
- **Error**: confundir un buen rendimiento en entrenamiento con un modelo listo para producción. → **Correcto**: solo el rendimiento sobre datos nuevos, no vistos durante el entrenamiento, indica si el modelo generalizó o memorizó.

## En resumen

- **Qué hace**: aprende una función que mapea entradas a salidas conocidas, a partir de ejemplos etiquetados, para predecir sobre casos nuevos.
- **Dos tipos de problema**: clasificación (predecir una categoría) y regresión (predecir un valor continuo).
- **Fórmula clave**: $f: X \rightarrow Y$ que minimiza una función de pérdida $\mathcal{L}$ entre predicciones y etiquetas reales.
- **Cuándo usarlo**: cuando existen datos etiquetados suficientes y el objetivo es predecir una salida conocida a partir de nuevas entradas.
- **Cuándo no usarlo (o con cautela)**: cuando etiquetar es inviable por coste o tiempo, o cuando los datos históricos contienen sesgos que no se quieren reproducir.
- **Trampa principal**: confiar en el rendimiento sobre los datos de entrenamiento sin comprobar que el modelo generaliza a datos nuevos.

## Autoevaluación

### Un hospital quiere predecir si una imagen de radiografía muestra o no una fractura, usando miles de radiografías ya diagnosticadas por especialistas. ¿Qué tipo de problema es?
- [ ] Regresión, porque la salida es un número.
- [x] Clasificación, porque la salida es una categoría entre un conjunto predefinido ("fractura" o "no fractura").
- [ ] No supervisado, porque el modelo trabaja con imágenes en vez de tablas de datos.
> Por qué: aunque el diagnóstico se basa en una imagen compleja, la salida buscada es una etiqueta discreta, no un valor continuo, lo que define un problema de clasificación.

### Una inmobiliaria quiere predecir el precio de venta de una vivienda a partir de su tamaño, ubicación y número de habitaciones. ¿Qué tipo de problema es?
- [ ] Clasificación, porque hay varias viviendas distintas.
- [x] Regresión, porque el precio es un valor continuo, no una categoría entre un conjunto fijo de opciones.
- [ ] Ninguno de los dos, porque predecir precios no es aprendizaje supervisado.
> Por qué: el precio puede tomar cualquier valor numérico dentro de un rango, la característica que define un problema de regresión frente a uno de clasificación.

### Una empresa entrena un modelo de contratación con datos históricos de decisiones que reflejaban sesgos de género. ¿Qué es más probable que ocurra si se usa tal cual?
- [ ] El modelo corregirá automáticamente esos sesgos al aprender de tantos datos.
- [x] El modelo puede reproducir, e incluso amplificar, esos sesgos en sus predicciones, porque aprende exactamente los patrones presentes en los datos de entrenamiento.
- [ ] El modelo ignorará esos datos porque el aprendizaje supervisado descarta automáticamente patrones discriminatorios.
> Por qué: el aprendizaje supervisado aprende la relación que ven los datos etiquetados; si esa relación incluye sesgos históricos, el modelo los interioriza como si fueran parte del patrón a seguir.

### Un modelo obtiene un 99% de acierto en los datos con los que fue entrenado. ¿Basta ese dato para concluir que es un buen modelo?
- [ ] Sí, un acierto tan alto siempre indica un modelo excelente.
- [x] No: hay que comprobar su rendimiento en datos nuevos, no vistos durante el entrenamiento, para saber si generalizó o simplemente memorizó.
- [ ] Sí, siempre que el problema sea de clasificación y no de regresión.
> Por qué: un rendimiento alto solo en los datos de entrenamiento es compatible con el sobreajuste; la verdadera prueba de un modelo supervisado es cómo se comporta con ejemplos que no ha visto.

## Glosario

- **Dato etiquetado**: ejemplo de entrenamiento que incluye tanto sus características de entrada como la salida correcta esperada.
- **Clasificación**: problema de aprendizaje supervisado cuya salida es una categoría entre un conjunto predefinido.
- **Regresión**: problema de aprendizaje supervisado cuya salida es un valor continuo.
