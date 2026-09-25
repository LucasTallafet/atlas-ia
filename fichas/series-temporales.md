---
id: series-temporales
estado: borrador
---

## En una frase

Una serie temporal es una secuencia de valores medidos en el tiempo; para que un modelo la aprenda, se convierte en pares de entrada-salida mediante una ventana deslizante sobre el historial reciente.

## Intuición

Piensa en cómo predecirías mañana el tráfico de una calle: no mirarías un único dato aislado, sino los últimos días o semanas, buscando si hay una tendencia (más tráfico cada mes), un patrón que se repite (más tráfico los viernes) y algo de ruido aleatorio que no sigue ningún patrón. Un modelo de machine learning necesita que ese "mirar hacia atrás" se traduzca en variables concretas: los valores de los últimos días como entrada, y el valor de mañana como lo que hay que predecir.

Eso es lo que distingue a una serie temporal de un conjunto de datos habitual: el orden de las observaciones importa, y cada valor está relacionado con los que le preceden.

## Explicación

### Qué hace especial a una serie temporal

Los datos [[tipos-datos|temporales]] tienen rasgos que no aparecen en filas de datos independientes entre sí: la **dependencia temporal** (el valor de hoy está relacionado con los de ayer), la **tendencia** (una dirección general ascendente o descendente a lo largo del tiempo), la **estacionalidad** (patrones que se repiten a intervalos regulares, como picos diarios o anuales) y el **ruido** (fluctuaciones que no responden a ninguna estructura y conviene filtrar).

### Ventaneo: convertir la secuencia en pares (X, y)

La técnica central para preparar una serie temporal es el **ventaneo** (*sliding window*): se recorre la serie con una ventana de tamaño fijo y, para cada posición, los valores dentro de la ventana forman la entrada $X$ y el valor siguiente forma la salida $y$ que hay que predecir (ver Formalización). Relacionada con el ventaneo está la codificación con ***time lags***: incluir como variables los valores de la serie en instantes anteriores concretos (el valor de ayer, de hace tres días), que es justo lo que hace una ventana al convertirse en columnas de entrada.

### Características derivadas: diferenciación y suavizado

Además de los valores en bruto, suelen crearse variables derivadas. La **diferenciación** calcula la diferencia entre valores consecutivos ($y_t - y_{t-1}$) para eliminar la tendencia y hacer la serie más estable, útil antes de modelos que asumen **estacionariedad**. El **suavizado** —por ejemplo, con una media móvil— reduce el ruido conservando la tendencia general, útil cuando las fluctuaciones dificultan ver el patrón subyacente. Ambas técnicas resuelven problemas distintos y a veces se combinan: primero suavizar para quitar ruido, después diferenciar para quitar tendencia.

### Codificación estacional

Cuando la serie tiene estacionalidad, conviene codificarla de forma explícita: variables categóricas para el mes, la semana o el día, o transformaciones de Fourier para representar ciclos de forma más compacta.

### Evaluar un modelo de series temporales

La evaluación también debe respetar el orden temporal. Además de los errores habituales de regresión (MSE, MAE), es común usar el **error porcentual absoluto medio (MAPE)**, que expresa el error en términos relativos y facilita comparar series con escalas distintas (ver Formalización). Conviene además comparar siempre contra un **modelo ingenuo** ($y(t) = y(t-1)$, predecir que mañana será igual que hoy) y evaluar con ventanas móviles (*rolling window*) en vez de una única partición fija, para comprobar si el error se mantiene estable a lo largo del tiempo.

Modelos como ARIMA o las redes neuronales recurrentes (que verás en [[rnn]]) están diseñados específicamente para aprovechar esta dependencia temporal, algo que una regresión lineal solo consigue si sus variables de entrada —lags y derivadas— se han construido explícitamente con las técnicas anteriores.

## Formalización

$$
X_i = (y_{t_i}, y_{t_i+1}, \dots, y_{t_i+w-1}), \qquad y_i = y_{t_i+w}
$$

donde:

- $y_t$ es el valor de la serie temporal en el instante $t$.
- $w$ es el tamaño de la ventana: cuántos valores pasados se usan como entrada.
- $X_i$ es el vector de entrada formado por $w$ valores consecutivos de la serie.
- $y_i$ es el valor que sigue inmediatamente a esa ventana, la salida que el modelo debe predecir.

$$
\text{MAPE} = \frac{100\%}{n} \sum_{i=1}^n \left| \frac{y_i - \hat{y}_i}{y_i} \right|
$$

donde:

- $y_i$ es el valor real de la observación $i$.
- $\hat{y}_i$ es el valor predicho por el modelo.
- $n$ es el número de observaciones evaluadas.

**Ejemplo:** con la serie $\{100, 102, 105, 110, 120\}$ y una ventana $w=2$, el ventaneo genera los pares $X=(100,102) \to y=105$, $X=(102,105) \to y=110$ y $X=(105,110) \to y=120$. La diferenciación de esa misma serie da $\{2, 3, 5, 10\}$: el incremento entre cada día y el anterior.

## Interactivo

```widget
motor: serie
modo: ventana
serie: {"generador": "tendencia", "n": 30, "ruido": 0.1, "semilla": 3}
ventana: 5
```

- Prueba a aumentar el tamaño de la ventana y observa cómo cambian los pares (X, y) que se generan a partir de la misma serie.
- Prueba a fijarte en cuántos pares (X, y) se pueden generar con una ventana grande frente a una pequeña, a igualdad de longitud de la serie.
- Prueba a pensar qué pasaría si la ventana fuera más pequeña que el ciclo de estacionalidad de una serie: ¿podría el modelo aprender ese patrón solo con esos datos de entrada?

## En código

```python
import numpy as np

def genera_secuencia(data, window_size):
    X, y = [], []
    for i in range(len(data) - window_size):
        X.append(data[i:i + window_size])
        y.append(data[i + window_size])
    return np.array(X), np.array(y)

serie = [100, 102, 105, 110, 120]
X, y = genera_secuencia(serie, window_size=2)
print("X:", X.tolist())  # [[100, 102], [102, 105], [105, 110]]
print("y:", y.tolist())  # [105, 110, 120]

print("Diferenciada:", np.diff(serie).tolist())  # [2, 3, 5, 10]
```

## Errores típicos

- **Error**: mezclar aleatoriamente los datos de una serie temporal antes de partir en entrenamiento y prueba, igual que en un dataset normal. → **Correcto**: el orden temporal debe respetarse; el conjunto de prueba debe corresponder a instantes posteriores al de entrenamiento, o se produce fuga de información del futuro.
- **Error**: evaluar un modelo de series temporales solo con el MSE o el MAE, sin comparar contra un modelo ingenuo. → **Correcto**: un error bajo en términos absolutos puede no significar nada si un modelo trivial ($y(t)=y(t-1)$) obtiene un error similar o mejor.
- **Error**: aplicar diferenciación cuando el problema real es ruido, no tendencia. → **Correcto**: la diferenciación elimina tendencia; si lo que sobra es ruido, la técnica adecuada es el suavizado (por ejemplo, media móvil).
- **Error**: usar una ventana más pequeña que el ciclo de estacionalidad que se quiere capturar. → **Correcto**: si el patrón se repite cada 7 días, una ventana de 3 valores no puede contener un ciclo completo; el tamaño de la ventana debe ajustarse al fenómeno que se quiere modelar.

## En resumen

- **Qué hace**: transforma una secuencia de valores en el tiempo en variables que un modelo de machine learning puede usar, respetando el orden temporal.
- **Cómo funciona**: el ventaneo desliza una ventana de tamaño $w$ sobre la serie, usando esos $w$ valores como entrada y el siguiente como salida a predecir.
- **Fórmula clave**: $X_i = (y_{t_i}, \dots, y_{t_i+w-1})$, $y_i = y_{t_i+w}$; el MAPE mide el error en términos relativos, útil para comparar series de distinta escala.
- **Cuándo usarlo**: siempre que los datos tengan una dependencia temporal explícita, como sensores, precios o mediciones periódicas.
- **Decisiones que importan**: el tamaño de la ventana $w$, si conviene diferenciar (tendencia) o suavizar (ruido), y cómo codificar la estacionalidad.
- **Trampa principal**: evaluar o dividir los datos ignorando el orden temporal, lo que puede dar una sensación de buen rendimiento que no se sostiene al predecir el futuro real.

## A fondo

No todas las series se recogen a intervalos regulares: fallos de transmisión en sensores industriales, por ejemplo, generan huecos irregulares en el tiempo. En esos casos, técnicas tradicionales que asumen periodicidad constante dejan de aplicarse directamente, y conviene recurrir a interpolación o a un reamuestrado que reconstruya una serie continua antes de ventanearla.

También existen ventanas de longitud variable, más habituales en procesamiento de lenguaje natural pero presentes también en series temporales y aprendizaje por refuerzo: en vez de fijar $w$, la secuencia de entrada crece progresivamente (los primeros $1, 2, 3\dots$ valores) y el modelo aprende a predecir el siguiente valor a partir de secuencias de longitud creciente, útil cuando la dependencia entre eventos no tiene una longitud fija conocida de antemano.

## Autoevaluación

### Tienes una serie de 100 valores y aplicas ventaneo con $w=10$. ¿Cuántos pares (X, y) obtienes como máximo?
- [ ] 100, uno por cada valor de la serie.
- [x] 90, porque los últimos 10 valores no tienen un valor siguiente que sirva de salida $y$ dentro de la serie.
- [ ] 10, uno por cada valor dentro de la ventana.
> Por qué: cada ventana de tamaño $w$ necesita un valor posterior como salida, así que el número de pares es la longitud de la serie menos el tamaño de la ventana.

### Un modelo de predicción de ventas tiene un MAE de 500€, pero un modelo ingenuo ($y(t)=y(t-1)$) obtiene un MAE de 480€. ¿Qué te dice esto?
- [ ] Que el modelo entrenado es mucho mejor, porque 500 es un número razonable.
- [x] Que el modelo entrenado no aporta valor real: ni siquiera supera a la estrategia trivial de repetir el último valor observado.
- [ ] Que hay que usar MAPE en vez de MAE, porque el MAE nunca es fiable en series temporales.
> Por qué: en series temporales, un error absoluto bajo no basta; hay que compararlo contra un modelo ingenuo para saber si el modelo realmente está aprendiendo algo útil sobre la dependencia temporal.

### Una serie de ventas muestra una tendencia creciente clara, pero también fluctuaciones diarias irregulares que dificultan ver el patrón. ¿Qué combinación de técnicas tiene más sentido aplicar?
- [ ] Solo diferenciación, para eliminar las fluctuaciones diarias.
- [x] Suavizado primero, para reducir las fluctuaciones irregulares, y diferenciación después, para eliminar la tendencia creciente.
- [ ] Solo suavizado, porque también elimina la tendencia por sí solo.
> Por qué: el suavizado ataca el ruido (fluctuaciones sin estructura) y la diferenciación ataca la tendencia (dirección general); como el problema tiene ambos, conviene combinarlas en ese orden.

### Divides una serie temporal en entrenamiento y prueba mezclando las filas al azar antes de partir. ¿Qué problema introduce esto?
- [ ] Ninguno, siempre que las proporciones de entrenamiento y prueba sean razonables.
- [x] Fuga de información: el modelo podría entrenarse con datos posteriores a los que luego "predice" en la prueba, algo que nunca ocurriría en un uso real donde solo se conoce el pasado.
- [ ] Ninguno, porque el orden de las filas no afecta a cómo aprende ningún modelo.
> Por qué: en series temporales el orden importa; mezclar al azar rompe la restricción de que el conjunto de prueba debe representar instantes futuros respecto al de entrenamiento, dando una evaluación poco realista.

## Glosario

- **Ventaneo (*sliding window*)**: técnica que recorre una serie temporal con una ventana de tamaño fijo para generar pares de entrada (los valores de la ventana) y salida (el valor siguiente).
- **Estacionariedad**: propiedad de una serie cuyas características estadísticas (media, varianza) no cambian con el tiempo; la diferenciación ayuda a conseguirla.
- **MAPE (error porcentual absoluto medio)**: métrica de error relativo, útil para comparar el rendimiento de un modelo en series con escalas distintas.
- **Modelo ingenuo (*naive*)**: modelo de referencia que predice que el valor futuro será igual al último valor observado, usado como línea base para evaluar modelos más complejos.
