---
id: hiperparametros
estado: borrador
---

## En una frase

Un hiperparámetro es una decisión de diseño del modelo que se fija antes de entrenar (como $k$ en KNN o la tasa de aprendizaje), y se busca probando varias combinaciones con validación cruzada.

## Intuición

Cuando entrenas un modelo hay dos tipos de decisiones muy distintas. Unas las toma el propio algoritmo mientras aprende: por ejemplo, los coeficientes de una regresión, que se ajustan automáticamente para minimizar el error. Esos son los **parámetros**. Otras las tienes que fijar tú antes de darle al botón de entrenar: cuántos vecinos mira un KNN, cuánto se penaliza la complejidad en una regularización ([[regularizacion]]), o cuántas capas tiene una red. Esos son los **hiperparámetros**: no los aprende el modelo, los eliges tú (o una búsqueda automática) y se mantienen fijos durante todo el entrenamiento.

Es como cocinar: la receta fija la temperatura del horno y el tiempo de cocción antes de empezar (hiperparámetros); una vez dentro, el propio proceso de cocción es el que "ajusta" la masa (parámetros). Elegir mal un hiperparámetro puede arruinar el modelo tanto como una receta con el horno a la temperatura equivocada, así que conviene buscarlo de forma sistemática en vez de a ojo.

## Explicación

### Por qué hace falta buscarlos

No hay una fórmula que calcule el mejor valor de un hiperparámetro a partir de los datos: hay que probar varias combinaciones y quedarte con la que mejor funcione en validación ([[validacion]]), no en el conjunto de entrenamiento. Si lo hicieras con el de entrenamiento, elegirías siempre el hiperparámetro que más sobreajusta.

### Grid search: probar todas las combinaciones

La búsqueda en rejilla (*grid search*) define una lista de valores para cada hiperparámetro y evalúa, con validación cruzada, todas las combinaciones posibles. Es exhaustiva y fácil de entender, pero su coste crece muy rápido: con $h$ hiperparámetros y $v$ valores cada uno, hay $v^h$ combinaciones que entrenar y validar.

### Random search: probar combinaciones al azar

La búsqueda aleatoria (*random search*) muestrea un número fijo de combinaciones al azar dentro de los rangos definidos, en vez de recorrerlas todas. Con el mismo presupuesto de entrenamientos, suele explorar mejor el espacio cuando solo unos pocos hiperparámetros importan de verdad, porque no malgasta evaluaciones repitiendo valores de los hiperparámetros irrelevantes.

## Formalización

$$
\boldsymbol\lambda^* = \arg\min_{\boldsymbol\lambda \in \Lambda} \; \mathbb{E}_{\text{CV}}\big[\mathcal{L}_{\text{val}}(\boldsymbol\lambda)\big]
$$

donde:
- $\boldsymbol\lambda$ representa el vector de hiperparámetros (por ejemplo, $k$ y el tipo de peso en un KNN),
- $\Lambda$ es el espacio de búsqueda (la rejilla, el rango aleatorio, o el espacio continuo en búsqueda bayesiana),
- $\mathcal{L}_{\text{val}}$ es el error medido en los folds de validación cruzada,
- $\boldsymbol\lambda^*$ es la combinación de hiperparámetros elegida, la que minimiza el error medio de validación.

## Interactivo

```widget
motor: matriz-calor
modo: "busqueda"
filas: [1, 3, 5, 7]
columnas: ["uniform", "distance"]
valores: [[0.96, 0.96], [0.967, 0.967], [0.973, 0.967], [0.98, 0.98]]
```

- Prueba a localizar la celda con mejor precisión media y compara cuánto mejora frente a la peor combinación.
- Prueba a imaginar una búsqueda aleatoria con solo 4 de estas 8 combinaciones: ¿habría encontrado una combinación casi igual de buena?
- Prueba a fijarte en si el hiperparámetro `weights` cambia mucho el resultado: ¿hace falta explorarlo con tanto detalle como $k$?

## En código

```python
import numpy as np
from sklearn.datasets import load_iris
from sklearn.model_selection import GridSearchCV
from sklearn.neighbors import KNeighborsClassifier

X, y = load_iris(return_X_y=True)
rejilla = {"n_neighbors": [1, 3, 5, 7], "weights": ["uniform", "distance"]}
busqueda = GridSearchCV(KNeighborsClassifier(), rejilla, cv=5).fit(X, y)

print(busqueda.best_params_)          # {'n_neighbors': 7, 'weights': 'uniform'}
print(round(busqueda.best_score_, 3)) # 0.98
```

## Errores típicos

- **Error**: elegir el hiperparámetro mirando el error en el conjunto de entrenamiento → **Correcto**: hay que compararlos con el error de validación cruzada ([[validacion]]); en entrenamiento, el hiperparámetro que más sobreajusta siempre "gana".
- **Error**: pensar que grid search siempre es mejor que random search por ser exhaustivo → **Correcto**: con muchos hiperparámetros, grid search malgasta la mayoría de sus evaluaciones en combinaciones poco informativas; random search suele encontrar una solución casi tan buena con muchas menos evaluaciones.
- **Error**: confundir un hiperparámetro con un parámetro del modelo → **Correcto**: los parámetros los aprende el algoritmo durante el entrenamiento (p. ej., los coeficientes); los hiperparámetros los fijas tú antes de entrenar.
- **Error**: ajustar los hiperparámetros y evaluar el modelo final con la misma partición de validación → **Correcto**: eso da una estimación optimista; conviene reservar un conjunto de test aparte o usar validación cruzada anidada.

## En resumen

- Un hiperparámetro es una decisión que fijas antes de entrenar ($k$, tasa de aprendizaje, λ...); un parámetro lo aprende el modelo durante el entrenamiento.
- Se buscan probando combinaciones y quedándose con la que mejor funcione en validación cruzada, nunca en el conjunto de entrenamiento.
- Grid search prueba todas las combinaciones de una rejilla; random search muestrea combinaciones al azar con un presupuesto fijo.
- Con pocos hiperparámetros relevantes, random search suele igualar a grid search gastando muchas menos evaluaciones.
- La búsqueda bayesiana (por ejemplo con Optuna) usa los resultados de cada evaluación para decidir qué combinación probar a continuación, en vez de explorar a ciegas.
- Lo que hay que decidir: qué hiperparámetros buscar, en qué rango y con qué método de búsqueda.
- La trampa principal: ajustar y evaluar con los mismos datos de validación infla el rendimiento reportado; usa un conjunto de test aparte o validación cruzada anidada.

## A fondo

:::ampliacion
La búsqueda aleatoria no es solo una alternativa más barata a la rejilla: Bergstra y Bengio mostraron que, cuando solo unos pocos hiperparámetros afectan de verdad al resultado (algo muy habitual en la práctica), muestrear al azar explora ese subespacio relevante con más densidad que una rejilla, que reparte sus evaluaciones por igual entre hiperparámetros importantes e irrelevantes. Con el mismo número de evaluaciones, random search suele igualar o superar a grid search, y su coste no crece exponencialmente con el número de hiperparámetros.
Fuente: Bergstra, J. y Bengio, Y. (2012). "Random Search for Hyper-Parameter Optimization". Journal of Machine Learning Research.
:::

:::ampliacion
La búsqueda bayesiana va un paso más allá: en vez de elegir cada combinación al azar o por rejilla, construye un modelo probabilístico de qué combinaciones son prometedoras a partir de las evaluaciones ya hechas, y lo usa para decidir dónde probar a continuación. Así concentra las evaluaciones (caras, porque cada una implica entrenar el modelo) en las zonas del espacio de búsqueda con más probabilidad de mejorar el resultado. Optuna es una librería habitual para esto en Python: define el espacio de búsqueda con código normal (bucles, condicionales) en vez de una rejilla fija, y usa un algoritmo de tipo TPE (*Tree-structured Parzen Estimator*) para guiar la búsqueda.
Fuente: documentación oficial de Optuna, sección "Key Features".
:::

:::ampliacion
Cuando la misma validación cruzada se usa para elegir los hiperparámetros y para reportar el rendimiento final, la estimación queda optimista: el hiperparámetro elegido es, por construcción, el que mejor le fue a esos folds concretos. La **validación cruzada anidada** (*nested cross-validation*) evita ese sesgo separando dos bucles: uno externo divide los datos en folds de test, y dentro de cada uno un bucle interno hace su propia validación cruzada para elegir los hiperparámetros usando solo los datos de entrenamiento de ese fold externo. El rendimiento medio de los folds externos es entonces una estimación honesta de cómo se comportaría todo el proceso, búsqueda de hiperparámetros incluida, sobre datos nuevos.
Fuente: scikit-learn User Guide, sección 3.2 "Tuning the hyper-parameters of an estimator" (subsección sobre validación cruzada anidada).
:::

## Autoevaluación

### ¿Cuál de estos es un hiperparámetro, no un parámetro?
- [ ] Los coeficientes $\boldsymbol\beta$ de una regresión lineal ya entrenada
- [x] El número de vecinos $k$ que usa un KNN
- [ ] Los pesos de una red neuronal tras el entrenamiento
> Por qué: los coeficientes y los pesos los ajusta el propio algoritmo al minimizar la pérdida; $k$ en KNN es una decisión que fijas tú antes de entrenar y que el algoritmo no cambia por sí solo.

### Tienes 4 hiperparámetros y defines 5 valores para cada uno en una rejilla. ¿Cuántas combinaciones evaluará grid search?
- [ ] 20
- [ ] 9
- [x] 625
- [ ] 5
> Por qué: grid search evalúa el producto cartesiano de todos los valores: $5^4 = 625$ combinaciones, cada una con su propia validación cruzada.

### Un compañero elige los hiperparámetros con validación cruzada y reporta como rendimiento final la mejor puntuación de esa misma validación cruzada. ¿Qué falla?
- [ ] Nada, es el procedimiento correcto
- [x] La estimación queda optimista porque el hiperparámetro se eligió precisamente por rendir bien en esos mismos folds
- [ ] La validación cruzada no sirve para elegir hiperparámetros, solo para evaluar modelos ya fijados
> Por qué: cuando la búsqueda y la evaluación final comparten los mismos folds, el resultado reportado sobreestima cómo se comportará el modelo con datos nuevos; hace falta un conjunto de test aparte o una validación cruzada anidada.

### Con un presupuesto fijo de 20 entrenamientos y solo 2 de tus 6 hiperparámetros afectan de verdad al resultado, ¿qué método tiende a explorar mejor esos 2 hiperparámetros relevantes?
- [ ] Grid search, porque cubre sistemáticamente cada combinación
- [x] Random search, porque no reparte evaluaciones por igual entre hiperparámetros relevantes e irrelevantes
- [ ] Ninguno: con solo 20 evaluaciones no se puede explorar nada útil
> Por qué: grid search distribuye sus evaluaciones uniformemente entre todos los hiperparámetros, aunque la mayoría no importen; random search, al muestrear al azar, tiende a cubrir con más densidad los valores de los hiperparámetros que sí importan.

## Glosario

- **hiperparámetro**: decisión de configuración del modelo que se fija antes de entrenar y que el algoritmo no ajusta por sí solo (por ejemplo, $k$ en KNN o la tasa de aprendizaje).
- **grid search**: búsqueda en rejilla; evalúa, con validación cruzada, todas las combinaciones de una lista de valores por hiperparámetro.
- **random search**: búsqueda aleatoria; evalúa un número fijo de combinaciones muestreadas al azar dentro de un rango, en vez de recorrerlas todas.
- **validación cruzada anidada**: procedimiento con dos bucles de validación cruzada, uno para elegir hiperparámetros y otro externo para estimar el rendimiento final sin sesgo optimista.
