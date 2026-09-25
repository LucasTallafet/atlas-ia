---
id: bagging-random-forest
estado: borrador
---

## En una frase

Un Random Forest entrena muchos [[arboles-decision|árboles de decisión]] distintos sobre remuestreos de los datos y combina sus votos, lo que reduce la varianza de un árbol único.

## Intuición

Pregúntale a un solo experto si un paciente está sano y puede equivocarse por un sesgo personal o por los pocos casos que ha visto. Pregúntale a cien expertos, cada uno formado con una muestra distinta de historiales, y queda su voto mayoritario: los errores particulares de cada uno tienden a cancelarse, y el veredicto conjunto es más fiable que el de cualquiera por separado.

Eso es un **Random Forest**: un "bosque" de árboles de decisión, cada uno entrenado con una muestra distinta de los datos, cuya predicción final se decide por votación (clasificación) o promedio (regresión). Un árbol solo puede sobreajustarse o cambiar mucho si varía el conjunto de entrenamiento; el bosque suaviza ambos problemas.

## Explicación

### El problema de un único árbol

Un [[arboles-decision|árbol de decisión]] individual es interpretable pero inestable: es propenso al sobreajuste sin regularizar, y un cambio pequeño en los datos de entrenamiento puede producir un árbol completamente distinto (varianza alta). Los **modelos de ensamble** atacan este problema combinando las predicciones de varios modelos base: si sus errores son suficientemente independientes, se cancelan al promediarlos, igual que predice la ley de los grandes números.

### Bagging: bootstrap + agregación

El **bagging** (*bootstrap aggregating*) genera varias muestras del dataset original mediante **remuestreo con reemplazo** —el mismo bootstrap de [[muestreo-intervalos]]— y entrena un modelo independiente en cada una. Las predicciones se combinan por **votación mayoritaria** (clasificación) o **promedio** (regresión). Esto reduce la varianza del modelo combinado sin apenas tocar su sesgo.

### Random Forest: bagging + variables aleatorias

Un **Random Forest** es bagging aplicado a árboles de decisión, con un ingrediente extra: en cada división, cada árbol solo considera un subconjunto aleatorio de las variables disponibles, no todas. Esto fuerza a los árboles del bosque a ser más diversos entre sí —si todos vieran las mismas variables, tenderían a hacer las mismas divisiones y cometer los mismos errores—, lo que mejora la reducción de varianza al combinarlos. Cada árbol crece hasta su máxima profundidad; es el bosque, no cada árbol, el que se regulariza.

### Evaluación gratis: el error Out-of-Bag

Cada muestra bootstrap deja fuera, en promedio, alrededor del **37 %** de las observaciones originales (ver Formalización). Estas observaciones **Out-of-Bag (OOB)** no participan en el entrenamiento del árbol correspondiente, así que sirven para evaluarlo: el **error OOB** promedia el desempeño de cada árbol sobre las observaciones que no vio, dando una estimación del error de generalización sin necesidad de separar un conjunto de validación ni hacer validación cruzada.

## Formalización

Si los $n$ árboles del bosque cometen errores independientes con la misma varianza $\sigma^2$, la varianza del promedio de sus predicciones es:

$$
\text{Varianza combinada} = \frac{\sigma^2}{n}
$$

donde:
- $\sigma^2$ es la varianza del error de un árbol individual.
- $n$ es el número de árboles del bosque: cuantos más árboles, menor la varianza combinada (aunque en la práctica los árboles no son del todo independientes, porque comparten parte de los datos).

La probabilidad de que una observación quede fuera de una muestra bootstrap de tamaño $n$ tomada de un dataset de $n$ observaciones es:

$$
P(\text{fuera}) = \left(1 - \frac{1}{n}\right)^n \xrightarrow[n \to \infty]{} e^{-1} \approx 0{,}368
$$

donde $n$ es también el tamaño del dataset (la muestra bootstrap se genera con el mismo tamaño que el original); de ahí que, en bosques grandes, cerca del 37 % de las observaciones queden Out-of-Bag para cada árbol.

## Interactivo

```widget
motor: dispersion2d
modo: bosque
dataset: {"generador": "lunas", "n": 150, "ruido": 0.25, "clases": 2, "semilla": 3}
controles: [{"nombre": "n_arboles", "min": 1, "max": 60, "paso": 1, "valor": 10, "etiqueta": "número de árboles"}]
```

- Prueba a dejar $n=1$ árbol y observa la frontera irregular; sube a 60 y mira cómo se suaviza.
- Prueba a comparar la frontera con la del modo `arbol` de [[arboles-decision]] sobre el mismo dataset: ¿por qué la del bosque tiene menos esquinas afiladas?
- Prueba a fijarte en el error OOB mientras subes $n$: ¿a partir de cuántos árboles deja de bajar de forma notable?

## En código

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification

X, y = make_classification(n_samples=200, n_features=4, random_state=0)
rf = RandomForestClassifier(n_estimators=100, oob_score=True, random_state=0)
rf.fit(X, y)
print(rf.oob_score_)           # 0.94: exactitud estimada con las muestras OOB
print(rf.feature_importances_) # [0.47 0.03 0.13 0.37]: importancia de cada variable
```

## Errores típicos

- **Error**: pensar que cada árbol del bosque se poda o se limita en profundidad para evitar el sobreajuste. → **Correcto**: cada árbol crece sin restricciones; es la combinación de muchos árboles diversos la que reduce la varianza, no la regularización de cada uno.
- **Error**: creer que hace falta separar un conjunto de validación aparte para evaluar un Random Forest. → **Correcto**: el error OOB, calculado con las observaciones que cada árbol no vio, ya da una estimación de generalización sin gastar datos en validación.
- **Error**: suponer que más árboles siempre mejoran mucho el resultado. → **Correcto**: la varianza combinada baja con $\sigma^2/n$, así que las mejoras se hacen cada vez más pequeñas; a partir de cierto $n$ el coste computacional ya no compensa.

## En resumen

- **Qué hace**: combina muchos árboles de decisión entrenados sobre remuestreos distintos para dar una predicción más estable que la de un árbol solo.
- **Cómo funciona**: bootstrap de los datos → cada árbol ve además un subconjunto aleatorio de variables en cada división → cada árbol crece sin límite → se combinan por voto (clasificación) o promedio (regresión).
- **Fórmula clave**: la varianza del bosque cae aproximadamente como $\sigma^2/n$ con $n$ árboles, si sus errores son razonablemente independientes.
- **Hiperparámetro que importa**: `n_estimators` (número de árboles); también el número de variables consideradas en cada división (`max_features`).
- **Cuándo usarlo**: cuando un árbol único sobreajusta o es inestable y puedes permitirte perder algo de interpretabilidad a cambio de más precisión y robustez.
- **Cuándo no**: si necesitas explicar cada predicción con reglas simples, o el coste de entrenar y guardar cientos de árboles es un problema.
- **Trampa principal**: la diversidad entre árboles es lo que hace funcionar al bosque; sin la selección aleatoria de variables, todos los árboles tenderían a parecerse y la reducción de varianza sería mucho menor.

## A fondo

### Por qué importa la diversidad

Si todos los árboles del bosque cometieran los mismos errores, combinarlos no aportaría nada: la varianza solo baja si los errores son razonablemente independientes. El bagging aporta diversidad mediante el muestreo aleatorio de observaciones; Random Forest añade la aleatorización de variables en cada división. Otros ensembles logran diversidad combinando arquitecturas de modelo distintas (*stacking*), fuera del alcance de esta ficha.

### Ventajas e inconvenientes

Un Random Forest es robusto frente al sobreajuste y al ruido, no exige preprocesar ni escalar las variables, y ofrece una medida de **importancia de características** (cuánto mejora la pureza media cada variable en todos los árboles), útil para entender qué impulsa las predicciones incluso cuando el modelo en sí ya no es tan legible como un árbol suelto. A cambio, es más costoso en memoria y tiempo que un árbol único, especialmente con muchos árboles o datasets grandes, y pierde la interpretabilidad directa: seguir el razonamiento de cientos de árboles combinados no es factible como sí lo es con uno solo.

## Autoevaluación

### Entrenas un Random Forest con `n_estimators=200` y observas que el error OOB apenas mejora respecto a `n_estimators=100`. ¿Qué concluyes?
- [x] Que la varianza combinada ya se ha reducido casi al máximo; duplicar árboles aporta poco más.
- [ ] Que el modelo está subajustado y hay que aumentar la profundidad de cada árbol.
- [ ] Que hay un error en el código, porque más árboles siempre deben mejorar mucho el resultado.
> Por qué: la varianza combinada cae aproximadamente como $\sigma^2/n$; las ganancias marginales se reducen a medida que $n$ crece, así que un aplanamiento es el comportamiento esperado, no un fallo.

### ¿Por qué cada árbol de un Random Forest solo considera un subconjunto aleatorio de variables en cada división, en vez de todas?
- [x] Para forzar diversidad entre árboles y evitar que todos hagan las mismas divisiones.
- [ ] Para acelerar el entrenamiento, aunque empeore la precisión del bosque.
- [ ] Porque los árboles no pueden manejar más de unas pocas variables a la vez.
> Por qué: si todos los árboles vieran siempre las mismas variables más informativas, tenderían a parecerse y sus errores estarían correlacionados, reduciendo el beneficio de combinarlos.

### Un dataset tiene 1000 observaciones. ¿Aproximadamente cuántas quedan fuera (OOB) de una muestra bootstrap típica usada para entrenar un árbol del bosque?
- [ ] Ninguna: el bootstrap siempre usa el dataset completo.
- [x] Alrededor de 370, un 37 % del total.
- [ ] La mitad, 500 observaciones.
> Por qué: la probabilidad de que una observación quede fuera de una muestra bootstrap converge a $e^{-1}\approx0{,}368$ cuando $n$ es grande, independientemente del tamaño exacto del dataset.

### ¿Qué combina un Random Forest para dar su predicción final en un problema de clasificación?
- [x] El voto mayoritario de todos los árboles del bosque.
- [ ] El promedio de las probabilidades predichas por el primer árbol y el último.
- [ ] La predicción del árbol con mayor profundidad.
> Por qué: en clasificación, cada árbol emite un voto de clase y la predicción final es la clase más votada; el promedio se usa en regresión, no aquí.

## Glosario

- **Modelo de ensamble**: modelo que combina las predicciones de varios modelos base para lograr un resultado más robusto que el de cualquiera de ellos por separado.
- **Bagging (*bootstrap aggregating*)**: técnica de ensamble que entrena un modelo por cada muestra bootstrap del dataset y combina sus predicciones por voto o promedio.
- **Random Forest**: bagging de árboles de decisión en el que, además, cada división solo considera un subconjunto aleatorio de variables.
- **Out-of-Bag (OOB)**: observaciones que quedan fuera de una muestra bootstrap concreta y sirven para evaluar el árbol entrenado con ella sin necesidad de un conjunto de validación aparte.
- **Importancia de características**: medida de cuánto contribuye cada variable a reducir la impureza media en los árboles de un Random Forest.
