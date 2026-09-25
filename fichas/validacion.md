---
id: validacion
estado: borrador
---

## En una frase

Validar un modelo significa reservar datos que no se usan para entrenar, para comprobar de forma honesta si generaliza bien antes de darlo por bueno.

## Intuición

Imagina que un profesor deja a sus alumnos estudiar con el mismo examen que luego les va a poner. Cualquiera sacaría un diez, pero esa nota no diría nada sobre si realmente entendieron la asignatura. Lo justo es examinar con preguntas que los alumnos no han visto antes.

Con un modelo pasa lo mismo: si lo evalúas con los mismos datos que usó para aprender, el resultado es tan engañoso como ese examen filtrado. Y si además quieres una nota fiable de verdad, mejor hacer varios exámenes sorpresa distintos y promediar el resultado, en vez de fiarte de uno solo: esa es la idea detrás de la validación cruzada.

## Explicación

### Por qué no basta con medir el error de entrenamiento

Si evalúas un modelo con los mismos datos que usó para aprender, el resultado es engañoso: un modelo puede memorizar esos datos y parecer perfecto sin haber aprendido nada generalizable, tal y como viste en [[generalizacion]]. Por eso, antes de dar un modelo por bueno, se reservan datos que el algoritmo no ve durante el entrenamiento.

### Tres conjuntos con tres papeles distintos

El conjunto de **entrenamiento** (habitualmente entre el 60% y el 80% de los datos) es el que usa el algoritmo para ajustar los parámetros. El conjunto de **validación** (entre el 10% y el 20%) no interviene en ese ajuste: sirve para decidir hiperparámetros —como el grado de regularización o la tasa de aprendizaje— y para detectar sobreajuste mientras el modelo se sigue mejorando; también permite decidir cuándo detener el entrenamiento si el rendimiento deja de mejorar (*early stopping*). El conjunto de **test** (el 10-20% restante) solo se usa una vez, al final, para dar una estimación honesta del rendimiento; si se usara para ajustar cualquier cosa, dejaría de ser una medida imparcial.

Es importante que los tres conjuntos sean representativos del problema real y no compartan ejemplos duplicados entre sí: si algo se filtra del entrenamiento al test, el resultado final estará artificialmente inflado.

### El método hold-out y sus límites

El método más simple, llamado ***hold-out***, hace esta división una sola vez: entrena con un bloque de datos y evalúa con otro fijo. Es rápido —solo hay que entrenar una vez—, pero su resultado depende de qué ejemplos concretos cayeron en cada bloque; con mala suerte, un reparto poco representativo puede sobrestimar o subestimar el rendimiento real del modelo.

### Validación cruzada k-fold: repartir la suerte entre varias particiones

La **validación cruzada k-fold** reduce ese riesgo repitiendo el proceso $k$ veces. Los datos se dividen en $k$ partes (o *folds*) de tamaño parecido; en cada iteración, una parte hace de validación y las $k-1$ restantes de entrenamiento, rotando en cada vuelta hasta que todas las partes han sido validación una vez. Al final se promedian los $k$ resultados, dando una estimación mucho menos dependiente de una partición concreta.

Esta rotación además sirve de diagnóstico: si el error varía mucho entre particiones, es señal de sobreajuste; si el error es sistemáticamente alto en todas ellas, es señal de subajuste. La **validación cruzada Leave-One-Out (LOOCV)** lleva esta idea al extremo, con $k$ igual al número de ejemplos —cada partición deja solo uno fuera—, algo exhaustivo pero muy costoso con muchos datos. La **validación cruzada estratificada** mantiene la proporción de cada clase en cada fold, evitando que una partición se quede sin apenas ejemplos de una clase minoritaria.

### Parámetros e hiperparámetros: quién decide qué

La validación es también donde se hace visible la diferencia entre parámetros e hiperparámetros. Los **parámetros** —los pesos de una regresión o de una red— los aprende el algoritmo directamente de los datos de entrenamiento. Los **hiperparámetros** —la tasa de aprendizaje, el grado de un polinomio, el número de vecinos en k-NN— no se aprenden: se fijan antes de entrenar y se ajustan comparando el rendimiento en el conjunto de validación, nunca optimizando directamente sobre él como se hace con la función de coste. Verás cómo se buscan de forma sistemática en [[hiperparametros]].

## Formalización

$$
\text{CV}(k) = \frac{1}{k}\sum_{i=1}^{k} \text{Error}_i
$$

donde:

- $k$ es el número de particiones (*folds*) en que se divide el conjunto de datos.
- $\text{Error}_i$ es el error medido cuando la partición $i$ actúa como conjunto de validación.
- $\text{CV}(k)$ es la estimación final del rendimiento: el promedio de los $k$ errores.

**Ejemplo**: en una validación cruzada de 5 folds, un modelo obtiene los errores $0{,}5$, $0{,}6$, $0{,}7$, $3{,}0$ y $2{,}8$. Su media es $\text{CV}(5)=1{,}52$, con una desviación típica de $1{,}264$: mucha variación entre folds, señal de sobreajuste. Otro modelo obtiene $1{,}5$, $1{,}6$, $1{,}5$, $1{,}4$ y $1{,}6$: la misma media, $1{,}52$, pero con una desviación típica de solo $0{,}084$. Mismo promedio, diagnósticos opuestos: el segundo modelo no sobreajusta, simplemente es demasiado simple para el problema (subajuste).

## Interactivo

```widget
motor: pasos
---
### Validación cruzada k-fold ($k=5$)

Dividimos los datos en 5 partes de tamaño parecido. En cada iteración, una parte hace de validación y las otras 4 entrenan el modelo.

| Fold 1 | Fold 2 | Fold 3 | Fold 4 | Fold 5 |
|---|---|---|---|---|
| entrena | entrena | entrena | entrena | entrena |
---
**Iteración 1**: el Fold 1 actúa como validación.

| **Fold 1** | Fold 2 | Fold 3 | Fold 4 | Fold 5 |
|---|---|---|---|---|
| **valida** | entrena | entrena | entrena | entrena |

Error obtenido: $0{,}5$
---
**Iteración 2**: el Fold 2 actúa como validación.

| Fold 1 | **Fold 2** | Fold 3 | Fold 4 | Fold 5 |
|---|---|---|---|---|
| entrena | **valida** | entrena | entrena | entrena |

Error obtenido: $0{,}6$
---
**Iteración 3**: el Fold 3 actúa como validación.

| Fold 1 | Fold 2 | **Fold 3** | Fold 4 | Fold 5 |
|---|---|---|---|---|
| entrena | entrena | **valida** | entrena | entrena |

Error obtenido: $0{,}7$
---
**Iteración 4**: el Fold 4 actúa como validación.

| Fold 1 | Fold 2 | Fold 3 | **Fold 4** | Fold 5 |
|---|---|---|---|---|
| entrena | entrena | entrena | **valida** | entrena |

Error obtenido: $3{,}0$
---
**Iteración 5**: el Fold 5 actúa como validación.

| Fold 1 | Fold 2 | Fold 3 | Fold 4 | **Fold 5** |
|---|---|---|---|---|
| entrena | entrena | entrena | entrena | **valida** |

Error obtenido: $2{,}8$
---
**Resultado final**: media de los 5 errores $= 1{,}52$.

Pero fíjate en la variación entre folds: $0{,}5$, $0{,}6$, $0{,}7$, $3{,}0$, $2{,}8$. Una dispersión tan grande es señal de sobreajuste: el modelo depende mucho de qué datos concretos caen en cada partición.
```

- Prueba a avanzar fotograma a fotograma y anota en qué fold el error se dispara.
- Prueba a calcular tú mismo la media de los 5 errores antes de ver el resultado final.
- Prueba a comparar esta secuencia con el segundo ejemplo de la Formalización: misma media, pero mucha menos variación entre folds.

## En código

```python
import numpy as np

sobreajuste = np.array([0.5, 0.6, 0.7, 3.0, 2.8])
subajuste = np.array([1.5, 1.6, 1.5, 1.4, 1.6])

for nombre, errores in [("sobreajuste", sobreajuste), ("subajuste", subajuste)]:
    print(f"{nombre}: media={errores.mean():.2f}  desv.tipica={errores.std(ddof=1):.3f}")
# sobreajuste: media=1.52  desv.tipica=1.264
# subajuste: media=1.52  desv.tipica=0.084
```

## Errores típicos

- **Error**: usar el conjunto de test para elegir hiperparámetros. → **Correcto**: ese es justo el papel del conjunto de validación; el test solo debe tocarse una vez, al final.
- **Error**: pensar que k-fold sustituye al conjunto de test. → **Correcto**: k-fold ayuda a ajustar hiperparámetros de forma robusta usando entrenamiento y validación, pero conviene reservar aparte un test final que nunca participe en ese proceso.
- **Error**: creer que un $k$ mayor siempre es mejor en validación cruzada. → **Correcto**: un $k$ muy alto, como en LOOCV, es más costoso computacionalmente y no siempre aporta una estimación mejor.
- **Error**: confundir parámetros con hiperparámetros al hablar de "ajustar el modelo en validación". → **Correcto**: en validación se ajustan hiperparámetros, no los parámetros propios del modelo, que solo se aprenden en entrenamiento.

## En resumen

- **Qué hace y para qué sirve**: divide los datos para poder medir de forma honesta si un modelo generaliza, sin dejar que "vea" antes los datos con los que se evalúa.
- **Cómo funciona en pasos**: entrena con un bloque de datos → ajusta hiperparámetros mirando el conjunto de validación → mide el resultado final una sola vez con el conjunto de test.
- **Fórmula clave**: la puntuación de validación cruzada es $\text{CV}(k)=\frac1k\sum_i \text{Error}_i$, el promedio del error en cada partición.
- **Cuándo usar hold-out y cuándo k-fold**: hold-out es rápido y útil con muchos datos; k-fold da una estimación más robusta cuando los datos son limitados o el reparto puede ser poco representativo.
- **Decisión que importa**: el tamaño de $k$ y si hace falta estratificar por clases para no desequilibrar los folds.
- **Trampa principal**: tocar el conjunto de test más de una vez, o usarlo para decidir cualquier cosa antes del resultado final.

## A fondo

Fijarse solo en la media de la validación cruzada puede ocultar información valiosa. Como muestra el ejemplo de esta ficha, dos modelos pueden compartir exactamente la misma media de error y merecer diagnósticos opuestos: uno sobreajusta (mucha variación entre folds) y el otro subajusta (error uniformemente alto). Por eso conviene mirar también la variabilidad entre particiones, no solo el promedio final.

La elección entre hold-out y k-fold también depende del tamaño del proyecto: con millones de ejemplos, un hold-out simple ya da una estimación estable y k-fold solo añade coste computacional; con conjuntos pequeños, en cambio, k-fold aprovecha mejor cada dato porque todos pasan tanto por entrenamiento como por validación en algún momento.

## Autoevaluación

### ¿Para qué sirve el conjunto de validación, a diferencia del de test?
- [ ] Para entrenar los parámetros del modelo.
- [x] Para ajustar hiperparámetros y detectar sobreajuste mientras el modelo todavía se está mejorando.
- [ ] Para dar la única medida final de rendimiento del proyecto.
> Por qué: el conjunto de validación guía decisiones durante el desarrollo; el de test se reserva para la evaluación final, sin influir en ningún ajuste.

### En una validación cruzada de 5 folds, un modelo obtiene errores $0{,}5$, $0{,}6$, $0{,}7$, $3{,}0$ y $2{,}8$. ¿Qué sugiere esta variabilidad?
- [ ] Que el modelo generaliza de forma consistente.
- [x] Sobreajuste: el error cambia mucho según qué datos caen en cada partición.
- [ ] Que hace falta un $k$ más pequeño.
> Por qué: una alta variación del error entre folds indica que el modelo se ajusta a detalles específicos de algunas particiones que no se repiten en otras.

### Otro modelo obtiene $1{,}5$, $1{,}6$, $1{,}5$, $1{,}4$ y $1{,}6$ (misma media que el caso anterior). ¿Qué sugiere?
- [ ] Sobreajuste, igual que en el caso anterior, porque la media es la misma.
- [x] Subajuste: el error es consistentemente alto en todas las particiones, no solo en unas pocas.
- [ ] Que el modelo es perfecto, porque los errores son parecidos entre sí.
> Por qué: aunque la media de error es igual en ambos casos, la varianza entre folds es muy distinta: alta en el primero (sobreajuste) y muy baja en el segundo (subajuste sistemático).

### ¿Cuál es el problema principal de usar el conjunto de test para elegir entre dos valores de un hiperparámetro?
- [ ] Ninguno, el conjunto de test está justo para eso.
- [x] El test deja de ser una medida imparcial: al ajustar decisiones con él, el resultado final quedará artificialmente optimista.
- [ ] Que el test siempre es más pequeño que el de validación.
> Por qué: en cuanto el test influye en alguna decisión, deja de medir cómo funcionaría el modelo con datos verdaderamente nuevos.

### ¿Qué diferencia a la validación cruzada estratificada de la k-fold estándar?
- [ ] Que no divide los datos en folds.
- [x] Que mantiene la proporción de cada clase en cada fold, evitando particiones sin apenas ejemplos de una clase minoritaria.
- [ ] Que usa siempre un $k$ igual al número de datos.
> Por qué: la estratificación conserva en cada partición la misma proporción de clases que hay en el conjunto completo, algo especialmente importante con clases desbalanceadas.

## Glosario

- **Hold-out**: método de validación que divide los datos una sola vez en un bloque de entrenamiento y otro de evaluación.
- **Validación cruzada k-fold**: método que divide los datos en $k$ partes y rota cuál actúa como validación, promediando los $k$ resultados.
- **Leave-One-Out (LOOCV)**: caso extremo de validación cruzada con $k$ igual al número de ejemplos, dejando uno solo fuera en cada iteración.
- **Validación cruzada estratificada**: variante de k-fold que mantiene la proporción de cada clase en todos los folds.
- **Early stopping**: detener el entrenamiento cuando el rendimiento en el conjunto de validación deja de mejorar, para evitar sobreajuste.
