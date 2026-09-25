---
id: seleccion-caracteristicas
estado: borrador
---

## En una frase

La selección de características elige qué variables originales conservar para entrenar un modelo, descartando las que aportan poco o repiten información, mientras que la ingeniería de características crea variables nuevas a partir de las existentes.

## Intuición

Imagina que preparas una maleta con demasiada ropa para un viaje corto: llevar todo hace la maleta pesada y difícil de manejar, y buena parte ni la usarás. Antes de cerrarla, decides qué prendas son realmente necesarias y cuáles sobran porque son casi iguales a otra que ya llevas.

Con las variables de un conjunto de datos pasa algo parecido: no todas aportan lo mismo para predecir el resultado, y algunas están tan relacionadas entre sí que incluir las dos es redundante. Elegir bien qué variables llevar —o inventar alguna combinación nueva que resuma mejor la información— hace que el modelo entrene más rápido, generalice mejor y sea más fácil de interpretar.

## Explicación

### Tres formas de elegir variables

Los métodos de selección se agrupan en tres familias, según cuánto dependen del modelo final.

Los métodos de **filtro** evalúan cada variable de forma independiente al modelo, usando una métrica estadística: correlación con la variable objetivo, la prueba **chi-cuadrado** (para variables categóricas), la **prueba F** o la **información mutua** (que detecta dependencias no lineales). Son rápidos, pero no ven interacciones entre variables.

Los métodos de **envoltura** (*wrapper*) prueban distintos subconjuntos de variables entrenando el modelo real y midiendo su rendimiento: *forward selection* (añadir variables una a una), *backward elimination* (partir de todas y quitar) o **eliminación recursiva de características (RFE)**, que reentrena y descarta la variable menos importante en cada paso. Detectan interacciones, a costa de un mayor coste computacional.

Los métodos **incorporados** (*embedded*) seleccionan variables como parte del propio entrenamiento: **Lasso** fuerza a cero los coeficientes de las variables menos relevantes mediante su penalización L1 (ver Formalización); los modelos de árboles y bosques aleatorios asignan una importancia según cuánto reduce cada variable la impureza de los nodos.

### Ingeniería de características: crear en vez de elegir

La **ingeniería de características** va en la dirección contraria: en lugar de descartar variables, crea otras nuevas a partir de las existentes cuando la relación entre ellas aporta más que cada una por separado. Un ejemplo típico son las **interacciones cruzadas**: si el efecto conjunto de dos variables (precio y gasto en publicidad, por ejemplo) sobre el objetivo no es la simple suma de sus efectos individuales, multiplicarlas crea una variable que captura esa combinación, algo especialmente útil en modelos lineales que no detectan interacciones por sí solos.

## Formalización

$$
\min_{\boldsymbol\beta} \; \frac{1}{2n} \sum_{i=1}^n \left( y_i - \hat{y}_i \right)^2 + \alpha \sum_{j=1}^p |\beta_j|
$$

donde:

- $y_i$ es el valor real de la observación $i$.
- $\hat{y}_i$ es la predicción del modelo para esa observación.
- $\beta_j$ es el coeficiente de la característica $j$.
- $p$ es el número total de características.
- $\alpha$ es el parámetro de regularización: cuanto mayor, más coeficientes $\beta_j$ se fuerzan exactamente a cero, eliminando esas características del modelo.
- $n$ es el número de observaciones.

## Interactivo

```widget
motor: pasos
---
### Un dataset con una variable redundante

$x_2$ es ruido, sin relación real con $y$; $x_1$ y $x_3$ sí explican $y$ ($y = 2x_1 + x_3$).

| $x_1$ | $x_2$ | $x_3$ | $y$ |
|---|---|---|---|
| 1 | 5 | 2 | 4 |
| 2 | 1 | 1 | 5 |
| 3 | 4 | 4 | 10 |
| 4 | 2 | 3 | 11 |
---
### Filtro: correlación con $y$

| Variable | Correlación con $y$ |
|---|---|
| $x_1$ | 0.956 |
| $x_2$ | -0.156 |
| $x_3$ | 0.809 |

$x_2$ tiene una correlación casi nula: un filtro la descartaría ya en este primer paso, sin entrenar ningún modelo.
---
### Envoltura (RFE): eliminación iterativa

RFE entrena con las 3 variables, mide cuál aporta menos al modelo y la elimina; repite el proceso con las que quedan. En este dataset, $x_2$ es la primera en desaparecer porque su eliminación apenas cambia el ajuste del modelo.
---
### Incorporado: Lasso

| Variable | Coeficiente sin Lasso | Coeficiente con Lasso ($\alpha=0{,}5$) |
|---|---|---|
| $x_1$ | 2.0 | 1.75 |
| $x_2$ | ~0 | 0.0 |
| $x_3$ | 1.0 | 0.75 |

La penalización L1 lleva el coeficiente de $x_2$ exactamente a cero: Lasso la descarta durante el propio entrenamiento, sin necesitar un paso de selección aparte.
---
### Conclusión

Filtro, envoltura e incorporado llegan a la misma conclusión —$x_2$ sobra— por caminos distintos: uno mirando solo la variable, otro reentrenando el modelo paso a paso, y el tercero integrando la selección en el ajuste.
```

- Prueba a fijarte en que los tres métodos coinciden en descartar $x_2$, aunque ninguno mira directamente a los otros dos para decidirlo.
- Prueba a pensar qué pasaría si $x_2$ estuviera muy correlacionada con $x_1$ en vez de ser ruido puro: ¿el filtro por correlación con $y$ la detectaría igual de bien?
- Prueba a imaginar un dataset con miles de variables: ¿cuál de los tres métodos sería más caro de aplicar y por qué?

## Errores típicos

- **Error**: pensar que los métodos de filtro capturan interacciones entre variables. → **Correcto**: evalúan cada variable de forma independiente; una variable irrelevante por sí sola pero útil en combinación con otra puede pasar desapercibida.
- **Error**: aplicar *wrapper* como RFE a cientos de variables sin valorar el coste computacional. → **Correcto**: cada iteración reentrena el modelo, así que con muchas variables conviene filtrar antes para reducir el punto de partida.
- **Error**: confundir la selección de características con la [[reduccion-dimensionalidad|extracción de características]]. → **Correcto**: seleccionar conserva un subconjunto de las variables originales tal cual; extraer (como en PCA) crea variables nuevas que combinan todas las originales.
- **Error**: crear muchas variables de interacción sin comprobar si aportan valor real. → **Correcto**: la ingeniería de características debe justificarse con una hipótesis sobre el problema o validarse con el rendimiento del modelo; añadir cruces al azar solo aumenta la dimensionalidad.

## En resumen

- **Qué hace**: decide qué variables originales conservar (selección) o crea variables nuevas a partir de ellas (ingeniería).
- **Tres familias de selección**: filtro (rápido, ignora interacciones), envoltura (prueba subconjuntos con el modelo real, costosa), incorporada (se integra en el entrenamiento, como Lasso).
- **Fórmula clave**: la penalización L1 de Lasso, $\alpha \sum |\beta_j|$, fuerza a cero los coeficientes de las variables menos relevantes.
- **Cuándo usarlo**: siempre que haya variables redundantes o irrelevantes, o cuando el número de variables sea alto en relación con los datos disponibles.
- **Decisión que importa**: el valor de $\alpha$ en Lasso equilibra simplicidad del modelo y precisión; valores altos eliminan más variables pero pueden perder información.
- **Trampa principal**: usar solo un filtro y asumir que ya se capturaron todas las relaciones relevantes, incluidas las que dependen de la combinación entre variables.

## A fondo

Lasso tiene una limitación importante cuando varias variables están muy correlacionadas entre sí: en lugar de repartir su importancia entre todas, tiende a quedarse con una y anular arbitrariamente el resto, aunque todas aporten información parecida y relevante. En esos casos conviene combinar Lasso con un filtrado inicial que agrupe o revise las variables correlacionadas antes de aplicar la penalización, o recurrir a variantes como Elastic Net, que combina las penalizaciones L1 y L2.

La creación de características de interacción es especialmente relevante en modelos lineales, que no pueden capturar relaciones no aditivas entre variables sin que se las den explícitamente como una nueva columna. Los modelos más flexibles —árboles de decisión, bosques aleatorios, *gradient boosting* o redes neuronales— detectan estas combinaciones de forma automática durante el entrenamiento, sin necesidad de construir manualmente el término de interacción.

## Autoevaluación

### Tienes 500 variables y quieres hacer una primera criba rápida antes de aplicar un método más costoso. ¿Qué familia de métodos usarías primero?
- [ ] Envoltura (wrapper), porque siempre da el mejor resultado.
- [x] Filtro, porque evalúa cada variable de forma independiente y rápida, sin reentrenar el modelo cientos de veces.
- [ ] Incorporado, porque requiere entrenar el modelo final antes de poder hacer cualquier criba.
> Por qué: los métodos de filtro no dependen del modelo y son mucho más baratos computacionalmente, por lo que sirven como primer paso antes de aplicar wrapper o embedded sobre un conjunto ya reducido.

### En el interactivo, $x_2$ obtiene una correlación de -0,156 con $y$ y Lasso reduce su coeficiente a 0. ¿Qué tienen en común ambos resultados?
- [ ] Nada: son métricas completamente independientes que no deberían coincidir.
- [x] Ambos señalan que $x_2$ aporta poca o ninguna información útil para predecir $y$, aunque lleguen a esa conclusión por caminos distintos (evaluación aislada frente a penalización durante el entrenamiento).
- [ ] Que $x_2$ tiene el valor más alto de todas las variables.
> Por qué: una correlación cercana a cero con la variable objetivo y un coeficiente forzado a cero por Lasso son dos señales distintas del mismo hecho: esa variable no ayuda a explicar $y$ en este dataset.

### ¿Cuál es la diferencia principal entre seleccionar características y hacer ingeniería de características?
- [ ] Son sinónimos de la misma técnica.
- [x] Seleccionar decide qué variables originales conservar o descartar; la ingeniería crea variables nuevas combinando o transformando las existentes.
- [ ] La selección solo aplica a variables categóricas y la ingeniería solo a variables numéricas.
> Por qué: seleccionar trabaja con el conjunto de variables ya existente eligiendo un subconjunto; la ingeniería añade información nueva construyendo variables que no estaban en el dataset original.

### Aumentas el parámetro $\alpha$ de Lasso a un valor muy alto. ¿Qué consecuencia es más probable?
- [ ] El modelo conservará todas las variables con sus coeficientes originales.
- [x] Más coeficientes se reducirán exactamente a cero, simplificando el modelo pero con riesgo de perder variables que sí aportaban información real.
- [ ] El modelo dejará de poder entrenarse.
> Por qué: $\alpha$ controla la fuerza de la penalización L1; valores muy altos priorizan la simplicidad sobre la precisión y pueden eliminar variables relevantes, no solo las redundantes.

## Glosario

- **Método de filtro**: técnica de selección que evalúa cada variable de forma independiente al modelo, usando una métrica estadística.
- **Método de envoltura (*wrapper*)**: técnica que prueba distintos subconjuntos de variables entrenando el modelo real para medir su rendimiento.
- **Método incorporado (*embedded*)**: técnica que selecciona variables como parte del propio proceso de entrenamiento del modelo.
- **Eliminación recursiva de características (RFE)**: método de envoltura que reentrena el modelo y elimina en cada paso la variable menos importante.
- **Ingeniería de características**: creación de variables nuevas a partir de las originales, incluidas las interacciones cruzadas entre variables.
