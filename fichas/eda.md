---
id: eda
estado: borrador
---

## En una frase

El análisis exploratorio de datos examina la distribución de cada variable y sus relaciones con la variable objetivo antes de modelar, para detectar patrones, anomalías y decidir qué preprocesamiento hace falta.

## Intuición

Antes de que un médico recete un tratamiento, hace un chequeo: mide la tensión, pregunta síntomas, pide análisis. No empieza a operar a ciegas. El análisis exploratorio de datos es ese chequeo aplicado a un conjunto de datos: antes de entrenar cualquier modelo, miras cómo se distribuyen las variables, si hay valores raros, si dos características cuentan la misma historia o si la variable que quieres predecir se comporta de forma distinta según el grupo.

Igual que un diagnóstico apresurado lleva a un tratamiento equivocado, saltarte el EDA y lanzarte directo al modelo te expone a sorpresas: un valor atípico que dispara el error, una variable con la mitad de los datos ausentes, dos predictoras casi idénticas que confunden al modelo. El EDA no arregla nada por sí mismo —eso es tarea del preprocesamiento—, pero sin él trabajas a ciegas.

## Explicación

### Qué busca el EDA y en qué se diferencia del preprocesamiento

El **análisis exploratorio de datos** (*EDA*) es la etapa en la que examinas un conjunto de datos antes de construir ningún modelo, con el objetivo de entender su estructura: cómo se distribuyen las variables, qué relaciones hay entre ellas y qué anomalías conviene vigilar. A diferencia del [[preprocesamiento]], que transforma los datos, el EDA solo observa: es un análisis cualitativo y visual que genera hipótesis sobre el conjunto de datos, sin modificar todavía nada. El EDA responde preguntas como: ¿cómo están distribuidas las variables?, ¿existen valores atípicos que puedan distorsionar los resultados?, ¿hay correlaciones evidentes que el modelo pueda aprovechar? Las respuestas orientan directamente qué hacer después: el EDA informa, el preprocesamiento ejecuta.

En Python, el EDA se apoya en **Pandas** para los resúmenes numéricos (media, desviación estándar, percentiles, ver [[estadistica-descriptiva]]) y en **Matplotlib** y **Seaborn** para los gráficos —histogramas, diagramas de caja, dispersión y mapas de calor (ver [[graficos-estadisticos]])— que convierten esos números en patrones visibles de un vistazo.

### Comparar cada variable con la variable objetivo

Una de las tareas centrales del EDA es comparar cómo se comporta cada característica frente a la [[tipos-datos|variable objetivo]]. En un problema de **regresión**, un gráfico de dispersión entre una característica y el objetivo revela si la relación es lineal, no lineal o inexistente: por ejemplo, el tamaño de una vivienda suele mostrar una correlación positiva clara con su precio. En un problema de **clasificación**, lo habitual es comparar la distribución de cada característica en cada clase —con histogramas o gráficos de densidad superpuestos— para ver si las clases se separan bien o se solapan; una separación clara anticipa que el modelo tendrá más facilidad para distinguirlas.

### Relaciones entre variables numéricas: correlación, dispersión y pares

Para explorar cómo se relacionan varias variables numéricas a la vez, la herramienta más habitual es la **matriz de correlación**, visualizada como un mapa de calor (*heatmap*) donde el color indica la fuerza de cada relación. El coeficiente que resume esa fuerza —entre $-1$ y $1$— ya se formaliza en [[correlacion]]; aquí solo importa cómo se usa: valores cercanos a $\pm 1$ señalan variables muy relacionadas (útil para detectar [[multicolinealidad]] entre predictoras), y valores cercanos a 0, relaciones lineales débiles o inexistentes. Un **gráfico de dispersión** hace lo mismo para un par de variables, y un **pairplot** repite ese gráfico de dispersión para cada par de variables numéricas a la vez, con la distribución individual de cada una en la diagonal.

### Variables categóricas frente a la variable objetivo

Cuando la variable que exploras es categórica, la matriz de correlación no sirve. En su lugar, una **tabla de contingencia** cruza las categorías de dos variables y muestra con qué frecuencia aparece cada combinación; por ejemplo, qué proporción de clientes con cada tipo de empleo ha solicitado un préstamo. Un **gráfico de barras apiladas** visualiza lo mismo: cómo se reparte cada categoría entre las clases de la variable objetivo, revelando si algún tipo de correo se asocia más con "spam" que con "no spam".

### Interacciones: cuando el efecto de una variable depende de otra

Las variables no siempre actúan de forma independiente sobre la variable objetivo. Una **interacción** ocurre cuando el efecto de una característica cambia según el valor de otra: en un modelo de ventas, el gasto en publicidad puede aumentar las ventas con más fuerza cuando el precio del producto es bajo que cuando es alto. Estas relaciones se visualizan con **gráficos de interacción**, que muestran el efecto conjunto de dos variables sobre el objetivo. Un caso extremo son los **efectos no aditivos**: el impacto combinado de dos variables no es la suma de sus efectos por separado, como una dieta saludable y el ejercicio físico, que juntos mejoran la salud más de lo que sugeriría sumar cada beneficio por su lado.

### Qué decisiones guía el EDA

El resultado del EDA no es solo descriptivo: orienta decisiones concretas del resto del proyecto. Si las relaciones con el objetivo son lineales, los modelos lineales son un buen punto de partida; si no lo son, conviene mirar hacia árboles de decisión o redes neuronales, o aplicar transformaciones —logarítmica, polinómica o por discretización en rangos— antes de modelar. El EDA también es el punto donde detectas problemas que resolverás en el [[preprocesamiento]]: [[outliers|valores atípicos]], [[valores-ausentes|valores ausentes]], [[multicolinealidad]] entre predictoras o un desequilibrio marcado entre las clases de la variable objetivo (por ejemplo, un 95 % de una clase y un 5 % de otra). Detectarlos aquí no los corrige; solo señala qué tratamiento hará falta después.

## Formalización

No aplica: el EDA es un proceso de exploración, no tiene una fórmula propia. Se apoya en herramientas ya formalizadas en otras fichas: los estadísticos descriptivos en [[estadistica-descriptiva]] y el coeficiente de correlación en [[correlacion]].

## Interactivo

```widget
motor: pasos
---
### Un mini-EDA: precios de vivienda

Tenemos 5 viviendas con su tamaño y su precio.

| Vivienda | Tamaño (m²) | Precio (€) |
|---|---|---|
| 1 | 50 | 95.000 |
| 2 | 70 | 108.000 |
| 3 | 90 | 145.000 |
| 4 | 120 | 175.000 |
| 5 | 600 | 900.000 |
---
**Pregunta 1: ¿cómo se distribuye el precio?**

| Vivienda | Tamaño (m²) | Precio (€) |
|---|---|---|
| 1 | 50 | 95.000 |
| 2 | 70 | 108.000 |
| 3 | 90 | 145.000 |
| 4 | 120 | 175.000 |
| **5** | **600** | **900.000** |

La vivienda 5 se dispara muy por encima de las demás: su precio es más de 5 veces el de la vivienda 4.
---
**Pregunta 2: ¿qué variable se relaciona con el precio?**

Calculando la correlación entre tamaño y precio con las 5 viviendas: $r = 0{,}9997$, casi perfecta.

Pero fíjate: con una sola vivienda tan extrema, ¿esa correlación tan alta refleja la relación real o está dominada por ese único punto?
---
**Pregunta 3: ¿es la vivienda 5 un valor atípico?**

Con las 5 viviendas, $Q_1 = 108.000$€, $Q_3 = 175.000$€, $\text{IQR} = 67.000$€. El límite superior de la regla de Tukey es $Q_3 + 1{,}5 \times \text{IQR} = 275.500$€.

El precio de la vivienda 5 (900.000€) está muy por encima de ese límite: es un valor atípico según el rango intercuartílico.
---
**Pregunta 4: ¿cambia la relación si la excluyes?**

Recalculando la correlación solo con las viviendas 1 a 4: $r = 0{,}9874$. Sigue siendo una relación fuerte, pero ya no depende de un único punto extremo.

**Conclusión**: el EDA te ha llevado, en 4 preguntas, de una tabla de datos en bruto a dos decisiones concretas para el preprocesamiento: investigar si la vivienda 5 es un error de registro o un caso real, y confiar en que tamaño y precio están genuinamente relacionados incluso sin ese punto.
```

- Prueba a comparar tu conclusión sobre la relación tamaño-precio entre la Pregunta 2 (con la vivienda atípica) y la Pregunta 4 (sin ella).
- Prueba a recalcular el límite superior de Tukey con un múltiplo distinto, por ejemplo 3 en lugar de 1,5, y comprueba si la vivienda 5 seguiría marcada como atípica.
- Prueba a pensar qué gráfico —dispersión, diagrama de caja, histograma— habría mostrado cada uno de estos cuatro hallazgos sin necesidad de calcular nada a mano.

## En código

```python
import pandas as pd

df = pd.DataFrame({
    "tamano_m2": [50, 70, 90, 120, 600],
    "precio_eur": [95000, 108000, 145000, 175000, 900000],
})
print(df.corr().loc["tamano_m2", "precio_eur"])
q1, q3 = df["precio_eur"].quantile([0.25, 0.75])
print("limite superior IQR:", q3 + 1.5 * (q3 - q1))
# 0.9997 (correlación casi perfecta, dominada por la vivienda 5)
# limite superior IQR: 275500.0 (la vivienda 5, con 900.000€, queda fuera)
```

## Errores típicos

- **Error**: confundir el EDA con el preprocesamiento y empezar a limpiar o transformar los datos durante la exploración. → **Correcto**: el EDA solo observa y genera hipótesis; las transformaciones llegan después, en el preprocesamiento.
- **Error**: fiarte de una correlación alta calculada sobre pocos datos sin comprobar si un único valor atípico la está inflando. → **Correcto**: repite el cálculo excluyendo el punto extremo para ver si la relación se sostiene.
- **Error**: usar una matriz de correlación para explorar la relación entre variables categóricas. → **Correcto**: la correlación de Pearson solo tiene sentido entre variables numéricas; para categóricas usa tablas de contingencia.
- **Error**: confiar en un informe automático (Pandas Profiling, Sweetviz) sin revisión propia. → **Correcto**: estas herramientas resumen rápido, pero no sustituyen interpretar los patrones en el contexto del problema.

## En resumen

- **Qué hace**: explora un conjunto de datos —distribuciones, relaciones, anomalías— antes de modelar, sin transformar nada todavía.
- **Cómo funciona**: 1) resume cada variable y compárala con la variable objetivo; 2) cruza variables numéricas con matrices de correlación y dispersión, y categóricas con tablas de contingencia; 3) busca interacciones entre variables; 4) traduce lo encontrado en decisiones para el preprocesamiento y el modelo.
- **Herramientas**: Pandas para estadísticos, Matplotlib/Seaborn para gráficos; Pandas Profiling o Sweetviz para automatizar un primer vistazo.
- **Cuándo usarlo**: siempre, como primer paso del proyecto y cada vez que cambien los datos.
- **Cuándo no basta**: cuando el informe automático sustituye por completo la interpretación del analista.
- **Trampa principal**: dejar que un solo valor atípico, o muy pocos datos, infle una correlación o sugiera un patrón más fuerte de lo que realmente es.

## A fondo

Cuando el conjunto de datos es grande o el análisis se repite muchas veces, herramientas como **Pandas Profiling** o **Sweetviz** generan de forma automática un informe completo —distribuciones, valores atípicos, correlaciones, valores ausentes— a partir de una tabla de datos, con muy pocas líneas de código. Sweetviz añade la posibilidad de comparar dos conjuntos de datos, por ejemplo entrenamiento contra prueba, para detectar si sus distribuciones difieren. Estas herramientas ahorran tiempo y estandarizan el análisis, pero tienen límites: los resúmenes no están contextualizados para el problema concreto, ofrecen poca personalización y no sustituyen la interpretación del analista, que sigue siendo responsable de decidir qué significa cada patrón.

En proyectos donde el EDA y el preprocesamiento se repiten con cada nueva versión de los datos, conviene integrarlos en un **pipeline** que encadena imputación, escalado y modelado de forma reproducible —por ejemplo, con la clase `Pipeline` de scikit-learn—, en vez de rehacer cada paso a mano.

## Autoevaluación

### En un problema de clasificación, ¿qué gráfico usarías en el EDA para ver si dos clases se solapan en una característica numérica?
- [ ] Una matriz de correlación entre esa característica y la clase.
- [x] Un histograma o gráfico de densidad de esa característica, superpuesto por clase.
- [ ] Una tabla de contingencia entre esa característica y la clase.
> Por qué: la matriz de correlación y la tabla de contingencia no capturan cómo se distribuye una variable numérica dentro de cada clase; el histograma o la densidad superpuestos sí muestran si las clases se solapan.

### ¿Cuál es la diferencia clave entre el EDA y el preprocesamiento?
- [ ] El EDA usa Python y el preprocesamiento usa otras herramientas.
- [x] El EDA solo explora y genera hipótesis; el preprocesamiento transforma los datos según lo que el EDA encontró.
- [ ] No hay diferencia real: son dos nombres para la misma etapa.
> Por qué: el EDA es observación y diagnóstico; las decisiones de limpieza, codificación o escalado se ejecutan después, en el preprocesamiento.

### Quieres explorar la relación entre "tipo de vivienda" (categórica) y "se vendió en menos de un mes" (categórica). ¿Qué herramienta del EDA es más adecuada?
- [ ] Una matriz de correlación de Pearson.
- [x] Una tabla de contingencia entre ambas variables.
- [ ] Un gráfico de dispersión.
> Por qué: la correlación de Pearson y el gráfico de dispersión están pensados para variables numéricas; con dos variables categóricas, la tabla de contingencia es la herramienta que cruza sus frecuencias.

### En el mini-EDA del interactivo, la correlación entre tamaño y precio baja de $0{,}9997$ a $0{,}9874$ al quitar la vivienda 5. ¿Qué conclusión es la más razonable?
- [ ] La relación entre tamaño y precio no existe realmente.
- [x] La relación es fuerte y se mantiene sin la vivienda 5, aunque su valor atípico exageraba un poco la correlación.
- [ ] Hay que quitar siempre los valores atípicos antes de calcular cualquier correlación.
> Por qué: $0{,}9874$ sigue siendo una correlación muy alta, así que la relación es real; el EDA aquí sirve para no confundir "relación fuerte" con "relación artificialmente inflada por un solo punto".

## Glosario

- **Análisis exploratorio de datos (EDA)**: examen de un conjunto de datos —distribuciones, relaciones, anomalías— antes de modelar, sin transformarlo todavía.
- **Matriz de correlación**: tabla que muestra el coeficiente de correlación entre cada par de variables numéricas, habitualmente visualizada como un mapa de calor.
- **Tabla de contingencia**: tabla que cruza las categorías de dos variables categóricas y muestra la frecuencia de cada combinación.
- **Pairplot** (gráfico de pares): conjunto de gráficos de dispersión para cada par de variables numéricas, con la distribución individual de cada una en la diagonal.
- **Interacción**: relación en la que el efecto de una variable sobre el objetivo cambia según el valor de otra variable.
