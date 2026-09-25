---
id: entrenamiento-dl
estado: borrador
---

## En una frase
Entrenar una red en la práctica exige, además de elegir el optimizador, vigilar las curvas de pérdida y aplicar técnicas como dropout, normalización por lotes o parada anticipada para evitar el sobreajuste.

## Intuición
Piensa en preparar un examen viendo exámenes de práctica. Si solo miras cuánto mejoras en los ejercicios que ya has resuelto (la pérdida de entrenamiento), puedes acabar memorizando esas preguntas concretas sin aprender de verdad la materia. La pérdida de validación es como un examen de práctica distinto, que no has visto antes: mientras baje junto con la de entrenamiento, vas mejorando de verdad; si empieza a subir aunque la otra siga bajando, es la señal de que estás memorizando en vez de aprender.

Las técnicas de esta ficha son formas de evitar ese exceso de memorización y de decidir, con criterios objetivos, cuándo parar de entrenar.

## Explicación

### Qué vigilar durante el entrenamiento: pérdida y pérdida de validación
En cada época conviene revisar dos valores: la **pérdida de entrenamiento** (`loss`), que debe disminuir de forma progresiva, y la **pérdida de validación** (`val_loss`), calculada sobre datos que el modelo no usa para ajustar sus pesos. Si `val_loss` empieza a subir mientras `loss` sigue bajando, el modelo está memorizando el conjunto de entrenamiento en vez de generalizar: es la señal más directa de sobreajuste (ver [[regularizacion]]).

### Dropout y regularización para evitar el sobreajuste
**Dropout** desactiva aleatoriamente un porcentaje de neuronas en cada paso de entrenamiento, forzando a la red a no depender en exceso de ninguna neurona concreta y a aprender representaciones más robustas. Se aplica en capas densas ocultas, con una proporción habitual entre 0,2 y 0,5, y nunca en la capa de salida ni justo antes de aplanar una capa convolucional, donde eliminaría demasiada información.

### Normalización por lotes para estabilizar el entrenamiento
La **normalización por lotes** ajusta las activaciones de una capa usando la media y la varianza del lote actual, manteniéndolas dentro de un rango estable. Esto reduce la propagación de valores extremos entre capas y permite usar tasas de aprendizaje más altas sin desestabilizar el entrenamiento, algo especialmente útil en redes muy profundas (ver [[backpropagation]] para el problema del desvanecimiento del gradiente que ayuda a mitigar).

### Callbacks: automatizar decisiones durante el entrenamiento
Los **callbacks** son funciones que intervienen durante el entrenamiento sin necesidad de supervisión manual. `EarlyStopping` aplica la [[boosting|parada anticipada]] —detener el entrenamiento cuando `val_loss` deja de mejorar durante un número de épocas fijado por su hiperparámetro `patience`— y puede restaurar los pesos de la mejor época. `ReduceLROnPlateau` reduce la tasa de aprendizaje cuando la validación se estanca, dando al modelo una oportunidad de seguir mejorando con pasos más pequeños. `ModelCheckpoint` guarda el modelo con la mejor métrica de validación vista hasta el momento.

## Formalización
Dropout, en su forma habitual (*inverted dropout*), multiplica la activación de cada neurona por una máscara aleatoria durante el entrenamiento:
$$
\tilde a_i = \frac{m_i}{1-p}\, a_i, \qquad m_i \sim \text{Bernoulli}(1-p)
$$
donde:
- $a_i$ es la activación original de la neurona $i$.
- $p$ es la probabilidad de desactivar esa neurona (tasa de dropout).
- $m_i$ es una variable aleatoria que vale 1 con probabilidad $1-p$ y 0 con probabilidad $p$.
- $\tilde a_i$ es la activación resultante, reescalada para que su valor esperado no cambie.

La normalización por lotes transforma cada activación restando la media del lote y dividiendo por su desviación típica:
$$
\hat x = \frac{x - \mu_B}{\sqrt{\sigma_B^2 + \epsilon}}
$$
donde:
- $x$ es la activación original.
- $\mu_B$, $\sigma_B^2$ son la media y la varianza calculadas sobre el lote actual.
- $\epsilon$ es una constante pequeña que evita dividir entre 0.

**Ejemplo numérico.** Para una curva de entrenamiento sintética de 8 épocas con `loss` decreciente de $0{,}6433$ a $0{,}0767$ y `val_loss` que baja hasta un mínimo de $0{,}27$ en la época 5 y luego sube hasta $0{,}41$ en la época 8, un `EarlyStopping` con `patience=2` detendría el entrenamiento en la época 7 (dos épocas seguidas sin mejorar el mínimo de la época 5), verificado con `numpy` en `tools/calc.py`.

## Interactivo
```widget
motor: funcion
modo: "series"
datos: {"etiquetas": [1, 2, 3, 4, 5, 6, 7, 8], "series": [{"nombre": "loss (entrenamiento)", "valores": [0.6433, 0.4444, 0.3111, 0.2217, 0.1618, 0.1216, 0.0947, 0.0767]}, {"nombre": "val_loss (validación)", "valores": [0.75, 0.52, 0.38, 0.30, 0.27, 0.29, 0.34, 0.41]}]}
```
- Prueba a localizar la época donde `val_loss` deja de bajar y empieza a subir: ahí actuaría la parada anticipada.
- Prueba a comparar la distancia entre `loss` y `val_loss` en la época 8 frente a la época 3: ¿qué te dice sobre el sobreajuste?
- Prueba a imaginar qué pasaría con estas curvas si se añadiera dropout: ¿esperarías que `val_loss` subiera más tarde o más pronto?

## En código
```python
import numpy as np

loss = np.array([0.6433, 0.4444, 0.3111, 0.2217, 0.1618, 0.1216, 0.0947, 0.0767])
val_loss = np.array([0.75, 0.52, 0.38, 0.30, 0.27, 0.29, 0.34, 0.41])

mejor_epoca = np.argmin(val_loss) + 1
patience, sin_mejora = 2, 0
for i in range(mejor_epoca, len(val_loss)):
    sin_mejora = sin_mejora + 1 if val_loss[i] > val_loss[mejor_epoca - 1] else 0
    if sin_mejora == patience:
        print("Early stopping en la epoca", i + 1)
        break
# Early stopping en la epoca 7
```

## Errores típicos
- **Error**: Pensar que si `loss` sigue bajando, el modelo va bien → **Correcto**: hay que vigilar `val_loss`; si empieza a subir mientras `loss` baja, es señal de sobreajuste, no de progreso real.
- **Error**: Aplicar dropout en la capa de salida → **Correcto**: dropout se aplica en capas ocultas densas, nunca en la capa de salida, porque eliminaría parte de la predicción final.
- **Error**: Usar `EarlyStopping` sin `restore_best_weights=True` y esperar quedarse con el mejor modelo → **Correcto**: sin esa opción, el entrenamiento se detiene pero el modelo se queda con los pesos de la última época, no con los de mejor `val_loss`.
- **Error**: Subir la tasa de aprendizaje cuando la pérdida no baja, sin comprobar antes el preprocesado de los datos → **Correcto**: una pérdida estancada también puede deberse a datos mal normalizados o mal codificados, no solo a un `learning_rate` inadecuado.

## En resumen
- Entrenar bien una red exige vigilar dos curvas por época: `loss` (entrenamiento) y `val_loss` (validación).
- Si `val_loss` sube mientras `loss` sigue bajando, el modelo está sobreajustando.
- Dropout desactiva aleatoriamente un porcentaje de neuronas en cada paso de entrenamiento para forzar representaciones más robustas.
- La normalización por lotes estabiliza las activaciones de cada capa y permite tasas de aprendizaje más altas.
- Los callbacks automatizan decisiones: `EarlyStopping` detiene el entrenamiento, `ReduceLROnPlateau` baja la tasa de aprendizaje, `ModelCheckpoint` guarda el mejor modelo.
- El hiperparámetro clave de `EarlyStopping` es `patience`: cuántas épocas sin mejora se toleran antes de detener.
- La trampa principal: fijarse solo en la pérdida de entrenamiento y no darse cuenta de que el modelo ha dejado de generalizar.

## A fondo
### Diagnóstico rápido por síntoma
Si el modelo no aprende, conviene reducir el `learning_rate` o probar `BatchNormalization`. Si hay sobreajuste, añadir `Dropout`, regularización L2 o `EarlyStopping`. Si el entrenamiento es lento, aumentar el `batch_size` o usar una GPU. Si los gradientes son inestables, `BatchNormalization` o probar RMSprop en vez de Adam. Si el dataset está desbalanceado, ajustar los pesos de clase o aumentar los datos de la clase minoritaria.

### Qué mirar en `model.summary()`
Antes de entrenar conviene comprobar la arquitectura con `model.summary()`: que las dimensiones de cada capa sean las esperadas, que la capa de salida tenga el número correcto de neuronas y activación para la tarea, y cuántos parámetros son entrenables frente a fijos (relevante, por ejemplo, cuando se reutilizan capas preentrenadas).

## Autoevaluación

### Con las curvas del ejemplo (val_loss mínimo en la época 5, `patience=2`), ¿en qué época se activaría `EarlyStopping`?
- [ ] En la época 5, nada más alcanzar el mínimo
- [x] En la época 7, tras dos épocas seguidas sin mejorar el mínimo de la época 5
- [ ] Nunca, porque `loss` sigue bajando durante todo el entrenamiento
> Por qué: `patience=2` tolera dos épocas sin mejora tras el mejor valor; `val_loss` no mejora en las épocas 6 y 7 respecto al mínimo de la época 5, así que el entrenamiento se detiene en la época 7 (y con `restore_best_weights=True` recupera los pesos de la época 5).

### Si a partir de la época 4 se añade dropout a un modelo con la curva de `val_loss` del ejemplo, ¿qué efecto se esperaría?
- [x] Que la subida de `val_loss` se retrase o sea menos pronunciada, al reducir el sobreajuste
- [ ] Que `loss` de entrenamiento baje aún más rápido que sin dropout
- [ ] Que `val_loss` deje de calcularse
> Por qué: dropout reduce la capacidad efectiva del modelo durante el entrenamiento, lo que típicamente ralentiza la memorización de los datos de entrenamiento y retrasa o atenúa el punto en que `val_loss` empieza a subir.

### Un compañero, viendo que `loss` baja de $0{,}64$ a $0{,}08$ en 8 épocas, concluye que el modelo es cada vez mejor. ¿Qué está pasando por alto?
- [x] Que `val_loss` deja de bajar en la época 5 y luego sube, señal de que el modelo empieza a sobreajustar
- [ ] Nada, si `loss` baja el modelo siempre mejora
- [ ] Que `loss` debería subir, no bajar, en un entrenamiento correcto
> Por qué: la métrica que importa para saber si el modelo generaliza es `val_loss`, no `loss`; en este ejemplo diverge de `loss` a partir de la época 5, indicando sobreajuste aunque `loss` siga bajando.

### ¿Qué diferencia hay entre `ReduceLROnPlateau` y `EarlyStopping`?
- [x] El primero reduce la tasa de aprendizaje cuando la validación se estanca; el segundo detiene por completo el entrenamiento
- [ ] Ambos hacen exactamente lo mismo, solo cambia el nombre
- [ ] `EarlyStopping` reduce la tasa de aprendizaje y `ReduceLROnPlateau` detiene el entrenamiento
> Por qué: son complementarios: `ReduceLROnPlateau` da al modelo una oportunidad de seguir mejorando con pasos más pequeños, mientras que `EarlyStopping` corta el entrenamiento cuando ya no hay mejora, evitando seguir sobreajustando.

## Glosario
- **dropout**: técnica de regularización que desactiva aleatoriamente un porcentaje de neuronas en cada paso de entrenamiento para reducir el sobreajuste.
- **normalización por lotes**: también llamada *batch normalization*, es una técnica que normaliza las activaciones de una capa usando la media y varianza del lote actual, estabilizando el entrenamiento.
