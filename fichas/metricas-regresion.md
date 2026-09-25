---
id: metricas-regresion
estado: borrador
---

## En una frase

Las métricas de regresión (MAE, MSE, RMSE, R², MAPE) resumen en un número qué tan lejos están las predicciones de un modelo de los valores reales, para poder comparar modelos.

## Intuición

Imagina que lanzas dardos a una diana y quieres resumir en un solo número lo bien que tiraste: podrías promediar cuánto te alejaste del centro en cada tiro, o darle más peso a los tiros que se fueron muy lejos. En un modelo de regresión pasa algo parecido: tras entrenarlo, necesitas un número que te diga qué tan buenas son sus predicciones frente a los valores reales.

No sirve mirar un ejemplo suelto: hace falta agregar el error de todas las predicciones de una forma que se pueda comparar entre modelos distintos. Por eso existen varias métricas de regresión, cada una con un matiz distinto sobre qué tipo de error penaliza más y en qué unidades se expresa el resultado.

## Explicación

### Pérdida y métrica no son lo mismo

Ya viste en [[funciones-perdida]] que el MSE y el MAE se usan como función de pérdida: el algoritmo las minimiza durante el entrenamiento. Aquí las mismas fórmulas se usan de otra manera, como **métrica**: un número que calculas al final, sobre datos de prueba, para juzgar qué tan bueno es el modelo ya entrenado. La fórmula puede coincidir, pero el papel que cumplen es distinto: la pérdida guía el ajuste; la métrica evalúa el resultado.

### RMSE: el error en las unidades originales

El MSE eleva los errores al cuadrado, así que su resultado queda en unidades al cuadrado (euros², por ejemplo), difíciles de interpretar. La raíz del error cuadrático medio (RMSE) deshace ese cuadrado y devuelve el error en las mismas unidades que la variable que predices.

### R²: cuánta variabilidad explica el modelo

MAE, MSE y RMSE son medidas absolutas: dependen de la escala de los datos y no dicen, por sí solas, si el modelo es "bueno". El coeficiente de determinación $R^2$ responde a una pregunta distinta: de toda la variabilidad de la variable real respecto a su media, ¿qué proporción logra explicar el modelo? Para calcularlo se descompone la variabilidad total (SST) en la parte que el modelo captura (SSR) y la que le queda como error (SSE).

### MAPE: el error como porcentaje

Cuando quieres expresar el error en términos relativos, en vez de en las unidades originales, se usa el error porcentual absoluto medio (MAPE): el promedio de cuánto se desvía cada predicción del valor real, en proporción a ese valor real.

## Formalización

$$
\text{RMSE} = \sqrt{\text{MSE}} = \sqrt{\frac{1}{n}\sum_{i=1}^n (y_i - \hat y_i)^2}
$$

donde:
- $n$ es el número de observaciones,
- $y_i$ es el valor real de la observación $i$,
- $\hat y_i$ es la predicción del modelo para la observación $i$.

$$
\text{SST} = \sum_{i=1}^n (y_i - \bar y)^2, \qquad \text{SSE} = \sum_{i=1}^n (y_i - \hat y_i)^2, \qquad R^2 = 1 - \frac{\text{SSE}}{\text{SST}}
$$

donde:
- $\bar y$ es la media de los valores reales,
- SST es la variabilidad total de $y$ respecto a su media,
- SSE es la variabilidad que el modelo no logra explicar (sus errores al cuadrado).

$$
\text{MAPE} = \frac{1}{n}\sum_{i=1}^n \left|\frac{y_i - \hat y_i}{y_i}\right| \times 100
$$

donde:
- $n$, $y_i$, $\hat y_i$ son los mismos de arriba,
- el resultado se expresa como porcentaje.

## Interactivo

```widget
motor: dispersion2d
modo: "metricas-regresion"
dataset: {"generador": "lineal", "n": 8, "ruido": 0.4, "clases": 1, "semilla": 3}
arrastrables: true
```

- Prueba a arrastrar un punto muy lejos de la recta y observa cuánto sube el MSE en comparación con el MAE.
- Prueba a mover varios puntos cerca de la recta a la vez y comprueba que R² se acerca a 1.
- Prueba a dejar todos los puntos sobre la recta: MSE, MAE y RMSE deben llegar a 0 y R² a 1.

## En código

```python
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

y = np.array([3.0, 5.0, 2.0, 6.0])
y_pred = np.array([2.5, 5.5, 2.0, 5.0])

mae = mean_absolute_error(y, y_pred)             # 0.5
rmse = mean_squared_error(y, y_pred) ** 0.5      # 0.612
r2 = r2_score(y, y_pred)                         # 0.85
mape = np.mean(np.abs((y - y_pred) / y)) * 100   # 10.83

print(f"MAE={mae}, RMSE={rmse:.3f}, R2={r2}, MAPE={mape:.2f}%")
```

## Errores típicos

- **Error**: pensar que un R² alto siempre significa un buen modelo → **Correcto**: un R² alto puede deberse a sobreajuste; hay que evaluarlo en datos de prueba, no de entrenamiento (ver [[validacion]]).
- **Error**: comparar el MSE de dos modelos que predicen variables en escalas distintas → **Correcto**: MSE, MAE y RMSE dependen de las unidades de la variable a predecir; solo son directamente comparables entre modelos que predicen lo mismo.
- **Error**: usar MAPE cuando los valores reales pueden ser cero o muy cercanos a cero → **Correcto**: al dividir por $y_i$, el MAPE se dispara o queda indefinido si $y_i$ es cero; en ese caso conviene usar RMSE o MAE.
- **Error**: confundir la pérdida que minimiza el entrenamiento con la métrica que se reporta al final → **Correcto**: pueden compartir fórmula (como el MSE), pero cumplen papeles distintos: una guía el ajuste, la otra evalúa el resultado (ver [[funciones-perdida]]).

## En resumen

- Las métricas de regresión resumen en un número qué tan lejos están las predicciones de los valores reales, para comparar modelos.
- MAE promedia el error absoluto; MSE promedia el error al cuadrado (penaliza más los errores grandes); RMSE es la raíz del MSE, en las unidades originales.
- R² = 1 − SSE/SST mide qué proporción de la variabilidad de los datos explica el modelo (cercano a 1 es mejor).
- MAPE expresa el error como porcentaje del valor real, útil para comparar entre escalas distintas.
- Usa MAE o RMSE si necesitas el error en las unidades originales; usa R² para el ajuste relativo; evita MAPE si hay valores reales cero o cercanos a cero.
- No confundas la métrica (evalúa el modelo ya entrenado) con la pérdida (guía el entrenamiento), aunque a veces compartan fórmula.
- La trampa principal: fijarte solo en R² sin mirar los errores por tramos puede esconder un mal ajuste en parte del rango de datos.

## A fondo

La elección entre estas métricas depende del objetivo:

| Escenario | Métrica recomendada |
|---|---|
| Penalizar mucho los errores grandes | MSE o RMSE |
| Tratar todos los errores por igual, sin que los outliers dominen | MAE |
| Comparar el modelo con una línea base (predecir siempre la media) | R² |
| Expresar el error en términos relativos, comparable entre variables de distinta escala | MAPE |

En scikit-learn estas métricas se calculan con `mean_absolute_error`, `mean_squared_error` y `r2_score`; en Keras se usan del mismo modo, tanto para monitorizar el entrenamiento (`metrics=["mae"]` en `compile`) como para evaluar el modelo ya entrenado sobre el conjunto de prueba.

:::nota-fuente
La fuente afirma que $R^2$ "varía entre 0 y 1". En realidad solo está acotado por arriba en 1; puede ser negativo cuando el modelo ajusta peor que predecir siempre la media $\bar y$, es decir, cuando $\text{SSE} > \text{SST}$. Aquí se usa el rango correcto.
:::

## Autoevaluación

### Tu modelo predice precios de vivienda y hay algunas viviendas atípicas con precios extremos que no quieres que dominen la evaluación. ¿Qué métrica es más adecuada?
- [ ] MSE, porque penaliza mucho los errores grandes
- [x] MAE, porque trata todos los errores por igual sin que los outliers dominen
- [ ] R², porque no depende de la escala de los datos
> Por qué: al elevar al cuadrado, el MSE (y su raíz, RMSE) da mucho más peso a los pocos errores grandes que producen los outliers; el MAE los pondera igual que al resto.

### Evalúas un modelo en datos nuevos y obtienes $R^2 = -0{,}2$. ¿Qué significa?
- [ ] Es imposible, R² nunca puede ser negativo
- [x] El modelo predice peor que si siempre devolviera la media de los valores reales
- [ ] El modelo tiene un error absoluto medio negativo
> Por qué: R² compara el error del modelo (SSE) con el error de predecir siempre la media (SST); si SSE > SST, R² se vuelve negativo, señal de un ajuste muy pobre.

### Un compañero dice: "el MSE es una métrica, así que no tiene sentido usarlo también como función de pérdida". ¿Qué falla en esa afirmación?
- [ ] Nada, tiene razón: el MSE solo sirve para evaluar
- [x] La misma fórmula puede usarse como pérdida (para entrenar) y como métrica (para evaluar); son dos papeles distintos, no fórmulas distintas
- [ ] El MSE nunca se usa como pérdida, solo como métrica
> Por qué: el MSE es la pérdida que minimizan muchos modelos de regresión y, con la misma fórmula, la métrica que se reporta después sobre datos de prueba (ver [[funciones-perdida]]).

### ¿Qué ventaja tiene el RMSE frente al MSE al comunicar el error de un modelo?
- [ ] El RMSE es siempre menor que el MSE
- [x] El RMSE está en las mismas unidades que la variable predicha, más fácil de interpretar
- [ ] El RMSE ignora los errores grandes, a diferencia del MSE
> Por qué: el MSE queda en unidades al cuadrado; al tomar la raíz, el RMSE recupera las unidades originales sin perder la propiedad de penalizar más los errores grandes.

## Glosario

- **RMSE**: raíz del error cuadrático medio; expresa el error en las mismas unidades que la variable predicha.
- **SST, SSR, SSE**: descomposición de la variabilidad de los datos en total, explicada por el modelo y no explicada (error), usada para calcular $R^2$.
- **MAPE**: error porcentual absoluto medio; promedio de cuánto se desvía cada predicción del valor real, en proporción a ese valor.
- **R²**: también llamado coeficiente de determinación; mide la proporción de la variabilidad de los datos que el modelo logra explicar.
