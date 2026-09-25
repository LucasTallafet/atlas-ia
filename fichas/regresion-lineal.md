---
id: regresion-lineal
estado: borrador
---

## En una frase

La regresión lineal ajusta la recta (o el hiperplano) que minimiza el error cuadrático entre lo observado y lo predicho, para explicar y predecir una variable numérica a partir de otras.

## Intuición

Imagina que quieres tasar coches de segunda mano y solo tienes un dato de cada uno: los kilómetros recorridos. Al dibujar precio frente a kilómetros verás una nube de puntos que, en general, baja de izquierda a derecha: a más kilómetros, menos precio. No hay una fórmula exacta, pero sí una tendencia clara. La regresión lineal es la forma de convertir esa tendencia en una regla concreta: la recta que mejor resume la nube de puntos, de modo que puedas leer en ella un precio aproximado para cualquier kilometraje, incluso uno que no habías visto antes.

Esto importa en IA porque es el modelo más simple que aprende de datos numéricos: pocos parámetros, cálculo directo (sin necesidad de muchas iteraciones) e interpretación clara de cada coeficiente. Por eso se usa tanto como modelo final en tareas donde la transparencia importa (fijar el precio de una vivienda, estimar ingresos) como de pieza base dentro de modelos más complejos: [[regresion-logistica]], por ejemplo, es literalmente una regresión lineal con una transformación añadida.

## Explicación

### Del problema a la recta

Cuando la variable que quieres predecir es numérica y continua ($y$, la *variable dependiente*) y sospechas que depende de una o varias variables numéricas ($x$, las *variables independientes* o predictoras), la relación más simple que puedes proponer es lineal: que $y$ cambie una cantidad fija por cada unidad que cambie $x$. Esa suposición no siempre es cierta, pero cuando lo es de forma aproximada, ajustar una recta es rápido, interpretable y sorprendentemente efectivo.

### Cómo se ajusta: mínimos cuadrados

Entre todas las rectas posibles, ¿cuál es "la mejor"? El criterio estándar se llama **mínimos cuadrados ordinarios** (*ordinary least squares*, **OLS**): la recta que hace mínima la suma de los cuadrados de los **residuos**, es decir, de las diferencias entre cada valor observado $y_i$ y el predicho $\hat{y}_i$. Se elevan al cuadrado por dos motivos: para que los residuos positivos y negativos no se cancelen entre sí, y para penalizar más los errores grandes que los pequeños. Al plantear esa suma como una función de los coeficientes y buscar su mínimo (derivando e igualando a cero), se obtiene un sistema de ecuaciones lineales —las *ecuaciones normales*— cuya solución da los coeficientes óptimos de forma directa, sin iterar.

### De una variable a varias: regresión múltiple

Con varias predictoras $x_1,\dots,x_p$, la idea es la misma pero cada coeficiente $\beta_j$ pasa a significar "el cambio esperado en $y$ por cada unidad de $x_j$, manteniendo constantes las demás variables". Esta matización importa: un coeficiente puede ser distinto de la correlación simple entre $x_j$ e $y$, porque descuenta el efecto de las otras predictoras. Resolver el sistema para varios coeficientes a la vez se organiza mejor con álgebra matricial (ver Formalización), y ese sistema se puede resolver de forma exacta —ver [[sistemas-lineales]]— o, cuando hay muchísimos datos o variables, de forma iterativa con [[descenso-gradiente]].

### Supuestos que hay que vigilar

El ajuste por mínimos cuadrados siempre produce una recta, se cumplan o no ciertas condiciones; pero solo si se cumplen puedes confiar en los coeficientes y en las pruebas estadísticas que se construyen sobre ellos:

- **Linealidad**: la relación real entre $x$ e $y$ es (aproximadamente) una línea recta.
- **Independencia de los errores**: el residuo de una observación no debe estar correlacionado con el de otra (falla típicamente en series temporales, donde un error "arrastra" al siguiente).
- **Homocedasticidad**: la dispersión de los residuos es similar para cualquier valor de $x$. Lo contrario, *heterocedasticidad*, produce errores estándar poco fiables.
- **Normalidad de los errores**: los residuos siguen aproximadamente una distribución normal de media cero, lo que sostiene los intervalos de confianza y las pruebas de significancia sobre los coeficientes.

Incumplir alguno no invalida las predicciones del modelo, pero sí la confianza que puedes depositar en sus coeficientes, en sus intervalos y en los valores $p$ que dicen si una variable "importa" de verdad. La sección A fondo explica cómo comprobar estos supuestos con gráficos.

## Formalización

### Regresión simple

$$
y = \beta_0 + \beta_1 x + \epsilon
$$

donde:
- $y$ es la variable dependiente.
- $x$ es la variable independiente.
- $\beta_0$ es el intercepto: el valor esperado de $y$ cuando $x=0$.
- $\beta_1$ es la pendiente: el cambio esperado en $y$ por cada unidad de $x$.
- $\epsilon$ es el error o residuo: lo que la recta no explica.

Minimizando la suma de residuos al cuadrado $L(\beta_0,\beta_1)=\sum_{i=1}^n (y_i-\hat y_i)^2$ se obtienen las ecuaciones normales, cuya solución es:

$$
\beta_1 = \frac{\sum_{i=1}^n (x_i-\bar x)(y_i-\bar y)}{\sum_{i=1}^n (x_i-\bar x)^2}, \qquad \beta_0 = \bar y - \beta_1 \bar x
$$

donde:
- $\bar x$, $\bar y$ son las medias muestrales de $x$ e $y$.

**Ejemplo numérico.** Cuatro estudiantes, horas de estudio $x=[1,2,3,4]$ y nota $y=[2,3,5,5]$ (verificado con `numpy`): $\bar x=2{,}5$, $\bar y=3{,}75$, $\beta_1=1{,}1$, $\beta_0=1$. La recta es $\hat y = 1 + 1{,}1x$; los residuos son $[-0{,}1,\,-0{,}2,\,0{,}7,\,-0{,}4]$ (el tercer estudiante sacó 0,7 puntos más de lo previsto). Para valorar qué tan buena es esta recta en conjunto —no residuo a residuo— se usan las [[metricas-regresion|métricas de regresión]] (aquí, $R^2\approx0{,}90$).

### Regresión múltiple: forma matricial

$$
\mathbf{y} = \mathbf{X}\boldsymbol\beta + \boldsymbol\epsilon, \qquad \hat{\boldsymbol\beta} = (\mathbf{X}^T\mathbf{X})^{-1}\mathbf{X}^T\mathbf{y}
$$

donde:
- $\mathbf{y}\in\mathbb{R}^n$ es el vector de valores observados.
- $\mathbf{X}\in\mathbb{R}^{n\times(p+1)}$ es la *matriz de diseño*: una columna de unos (para el intercepto) más una columna por cada predictora.
- $\boldsymbol\beta\in\mathbb{R}^{p+1}$ es el vector de coeficientes, incluido $\beta_0$.
- $\mathbf{X}^T\mathbf{X}\boldsymbol\beta=\mathbf{X}^T\mathbf{y}$ son las ecuaciones normales; resolverlas es resolver un sistema lineal (ver [[sistemas-lineales]]).

:::nota-fuente
El material original calcula a mano $\mathbf{X}^T\mathbf{X}$ y $\mathbf{X}^T\mathbf{y}$ para un ejemplo de 3 viviendas (tamaño $x_1$, habitaciones $x_2$, precio $y$) pero dos de sus nueve entradas están mal sumadas y el cálculo se deja sin terminar. Verificado con `numpy.linalg.solve`: con $\mathbf X=\begin{bmatrix}1&50&1\\1&80&2\\1&100&3\end{bmatrix}$ e $\mathbf y=[100,150,200]$, resulta $\mathbf{X}^T\mathbf{X}=\begin{bmatrix}3&230&6\\230&18900&510\\6&510&14\end{bmatrix}$ (la fuente pone 13300 y 23300 donde corresponden 18900 y 37000) y $\hat{\boldsymbol\beta}=(50,\ 0,\ 50)$: con solo 3 viviendas y 3 coeficientes el ajuste es exacto ($50+0\cdot50+50\cdot1=100$, y así con las otras dos filas), así que el tamaño no aporta nada una vez conocidas las habitaciones.
:::

## Interactivo

```widget
motor: dispersion2d
modo: ols
dataset: {"generador": "lineal", "n": 30, "ruido": 1.5, "clases": 1, "semilla": 7}
arrastrables: true
```

- Prueba a arrastrar dos o tres puntos lejos de la nube principal y observa cuánto se inclina la recta hacia ellos.
- Prueba a mover puntos hasta que los residuos formen un embudo (más dispersos a la derecha que a la izquierda) y relaciona lo que ves con la homocedasticidad.
- Prueba a alinear casi todos los puntos sobre una recta y deja uno muy alejado: mide cuánto cambia la pendiente al quitarlo.

## En código

```python
import numpy as np

x = np.array([1, 2, 3, 4], dtype=float)
y = np.array([2, 3, 5, 5], dtype=float)

xb, yb = x.mean(), y.mean()
b1 = np.sum((x - xb) * (y - yb)) / np.sum((x - xb) ** 2)
b0 = yb - b1 * xb
print(round(b0, 2), round(b1, 2))
# 1.0 1.1

residuos = y - (b0 + b1 * x)
print(np.round(residuos, 2))
# [-0.1 -0.2  0.7 -0.4]
```

## Errores típicos

- **Error**: interpretar un coeficiente positivo como prueba de que $x$ causa cambios en $y$. → **Correcto**: el coeficiente mide asociación lineal dentro del modelo, no causalidad; puede haber variables no incluidas que expliquen ambas.
- **Error**: asumir que el intercepto $\beta_0$ siempre tiene sentido práctico. → **Correcto**: si $x=0$ queda fuera del rango de datos observado, $\beta_0$ es solo un ajuste matemático necesario para situar la recta, sin interpretación real.
- **Error**: ignorar los supuestos del modelo porque "la recta se calcula igual". → **Correcto**: mínimos cuadrados siempre devuelve una recta, pero si fallan homocedasticidad o normalidad, los intervalos de confianza y los valores $p$ de los coeficientes dejan de ser fiables.
- **Error**: dar por bueno un modelo solo porque su $R^2$ es alto. → **Correcto**: hay que revisar los residuos y las observaciones influyentes, porque un $R^2$ alto puede deberse a un par de puntos atípicos que arrastran la recta hacia ellos.

## En resumen

- Ajusta la recta o el hiperplano que minimiza la suma de residuos al cuadrado entre $y$ observada y $\hat y$ predicha.
- Funciona en tres pasos: define el error como suma de residuos al cuadrado, deriva e iguala a cero (ecuaciones normales), resuelve ese sistema lineal para obtener los coeficientes.
- Fórmula clave: $\hat{\boldsymbol\beta}=(\mathbf X^T\mathbf X)^{-1}\mathbf X^T\mathbf y$.
- Úsalo cuando la variable objetivo sea continua y la relación con las predictoras sea aproximadamente lineal; evítalo para clasificar o ante relaciones muy no lineales.
- Decisiones que importan: qué variables incluir, si regularizar (Ridge/Lasso) cuando hay [[multicolinealidad]], y si hace falta transformar variables para acercarse a la linealidad.
- Trampa principal: confiar en los coeficientes, intervalos y valores $p$ sin haber comprobado antes los supuestos sobre los residuos.

## A fondo

**Gráficos de diagnóstico.** El **Residual Plot** dibuja los residuos frente a las predicciones: una nube sin patrón sugiere homocedasticidad; una forma de embudo (residuos que crecen con la predicción) sugiere heterocedasticidad. El **QQ Plot** compara los cuantiles de los residuos con los de una normal teórica: si los puntos se alinean sobre la diagonal, sostiene el supuesto de normalidad; si se curvan en las colas, indica valores atípicos o una distribución sesgada.

**Puntos influyentes.** Un valor atípico tiene un residuo grande (está lejos de la predicción); una observación con *leverage* alto está lejos del centro del espacio de las predictoras (tiene valores de $x$ extremos). Cuando ambas cosas coinciden, la observación es especialmente influyente: puede desplazar los coeficientes por sí sola. La **distancia de Cook** resume ese impacto combinando residuo y leverage en un único número por observación, y permite localizar rápidamente las más problemáticas.

**Protocolo de trabajo.** En un proyecto real conviene: dividir en entrenamiento/prueba *antes* de imputar, escalar o codificar nada (para no filtrar información del test); ajustar un modelo inicial con herramientas estadísticas para revisar significancia de cada variable; pasar a `LinearRegression` de scikit-learn para el modelo predictivo final; validar con validación cruzada; y, si aparece sobreajuste o [[multicolinealidad]], aplicar [[regularizacion|Ridge o Lasso]].

## Autoevaluación

### Si $\beta_1=-2{,}5$ en un modelo que predice el precio de un coche ($y$, en miles de euros) a partir de sus años de antigüedad ($x$), ¿qué significa?
- [ ] Que el coche pierde 2,5 años de vida útil por cada mil euros de precio
- [x] Que, en promedio, el precio baja 2,5 mil euros por cada año adicional de antigüedad
- [ ] Que el precio inicial del coche (a 0 años) es de 2,5 mil euros
> Por qué: $\beta_1$ es la pendiente, el cambio esperado en $y$ por unidad de $x$. Confundirlo con el intercepto ($\beta_0$, el valor en $x=0$) es el error más común al leer una recta ajustada.

### Un Residual Plot muestra que los residuos se dispersan mucho más para predicciones altas que para predicciones bajas, formando un embudo. ¿Qué supuesto está en duda?
- [ ] Normalidad de los errores
- [x] Homocedasticidad
- [ ] Independencia de los errores
> Por qué: la homocedasticidad exige que la varianza de los residuos sea constante en todo el rango de predicciones; un embudo es la firma visual clásica de heterocedasticidad, no de falta de normalidad ni de dependencia entre observaciones.

### Tienes dos predictoras muy correlacionadas entre sí (por ejemplo, tamaño en m² y número de habitaciones). ¿Qué problema es más probable al interpretar sus coeficientes?
- [ ] Que $R^2$ baje mucho aunque las predicciones sigan siendo buenas
- [ ] Que el modelo deje de poder calcular residuos
- [x] Que los coeficientes individuales sean inestables o cambien de signo aunque el ajuste conjunto siga siendo bueno
> Por qué: es el síntoma típico de [[multicolinealidad]]: el modelo predice bien en conjunto, pero no puede repartir con fiabilidad "el mérito" entre dos variables que se mueven casi siempre juntas.

### En la fórmula $\hat{\boldsymbol\beta}=(\mathbf X^T\mathbf X)^{-1}\mathbf X^T\mathbf y$, ¿qué representa la primera columna de $\mathbf X$?
- [ ] La variable objetivo $y$
- [x] Una columna de unos, para que el modelo pueda estimar el intercepto $\beta_0$
- [ ] Los residuos del modelo
> Por qué: sin una columna constante en la matriz de diseño, el modelo estaría forzado a pasar por el origen ($\beta_0=0$); añadir la columna de unos es lo que permite un intercepto libre.

## Glosario

- **mínimos cuadrados ordinarios (OLS)**: método que ajusta los coeficientes de una regresión lineal minimizando la suma de los residuos al cuadrado.
- **residuo**: diferencia entre el valor observado $y_i$ y el predicho $\hat y_i$ para una misma observación.
- **homocedasticidad**: propiedad de que la varianza de los residuos es constante para cualquier valor de las predictoras; su contrario es la heterocedasticidad.
- **matriz de diseño**: matriz $\mathbf X$ que reúne, por filas, las observaciones y, por columnas, las variables predictoras más una columna de unos para el intercepto.
- **distancia de Cook**: medida que combina residuo y leverage para cuantificar cuánto cambiarían los coeficientes del modelo si se eliminara una observación concreta.
