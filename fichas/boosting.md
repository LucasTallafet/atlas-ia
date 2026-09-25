---
id: boosting
estado: borrador
---

## En una frase

Boosting entrena árboles en cadena, donde cada uno corrige los errores de los anteriores, para reducir el sesgo del modelo combinado.

## Intuición

En [[bagging-random-forest]] cien expertos trabajan en paralelo, cada uno con su propia muestra, y se vota su mayoría. El boosting funciona distinto: es como un equipo de correctores que revisan un texto uno tras otro. El primero corrige lo que puede; el segundo se centra justo en los errores que el primero dejó pasar; el tercero, en los que quedan tras el segundo. Al final, el texto corregido por la cadena entera es mejor que el de cualquier corrector individual, porque cada uno se especializó en los fallos del anterior.

Cada modelo del boosting suele ser deliberadamente simple —un **aprendiz débil**, a menudo un árbol muy poco profundo—, y es precisamente la cadena de correcciones sucesivas la que produce un modelo final potente.

## Explicación

### Construcción secuencial: cada modelo corrige al anterior

Los pasos típicos de boosting: entrena un primer modelo simple, mide en qué se equivoca, entrena un segundo modelo centrado en esos errores, repite el proceso y combina todas las predicciones con más peso a los modelos más precisos. A diferencia del bagging, que entrena modelos independientes sobre remuestreos para **reducir varianza**, boosting entrena modelos dependientes en serie sobre todo el dataset reponderado para **reducir sesgo**: útil cuando los aprendices individuales rinden mal por sí solos.

| Aspecto | Bagging | Boosting |
|---|---|---|
| Objetivo | Reducir la varianza | Reducir el sesgo |
| Construcción | Modelos independientes | Modelos secuenciales |
| Muestreo | Bootstrap (con reemplazo) | Todo el dataset, con pesos que cambian |
| Predicción final | Voto o promedio | Combinación ponderada |
| Robustez frente al ruido | Alta | Menor: puede sobreajustar si hay ruido |

:::ampliacion
### AdaBoost: pesos que se adaptan a los errores

**AdaBoost** (*Adaptive Boosting*) es el algoritmo clásico de boosting. Empieza dando el mismo peso a cada observación y entrena un aprendiz débil. Tras cada ronda, sube el peso de las observaciones mal clasificadas y baja el de las bien clasificadas, para que el siguiente aprendiz se concentre en los casos difíciles. A cada aprendiz $t$ se le asigna además un peso de voto $\alpha_t$ según su error (ver Formalización).

Fuente: scikit-learn developers. *User Guide* §1.11 Ensembles: AdaBoost. https://scikit-learn.org/stable/modules/ensemble.html
:::

:::ampliacion
### Gradient Boosting: descenso de gradiente sobre funciones

El **Gradient Boosting** generaliza AdaBoost: en vez de reponderar observaciones, cada nuevo árbol se entrena para predecir el **gradiente negativo** de la pérdida respecto a las predicciones actuales (con error cuadrático, ese gradiente es el residuo). Es un [[descenso-gradiente|descenso de gradiente]] que en cada paso no ajusta un vector de parámetros, sino que añade una función completa (un árbol) al modelo.

Fuente: Friedman, J.H. (2001). *Greedy Function Approximation: A Gradient Boosting Machine*. Annals of Statistics, 29(5).
:::

## Formalización

Para AdaBoost, tras entrenar el aprendiz $t$ con tasa de error $\varepsilon_t$ sobre los pesos actuales, su peso de voto es:

$$
\alpha_t = \frac{1}{2}\ln\left(\frac{1-\varepsilon_t}{\varepsilon_t}\right)
$$

donde:
- $\varepsilon_t$ es la proporción de observaciones (ponderadas) mal clasificadas por el aprendiz $t$.
- $\alpha_t$ crece cuanto menor es $\varepsilon_t$: un aprendiz casi perfecto pesa mucho más en el voto final que uno apenas mejor que el azar.

Para Gradient Boosting, el modelo tras $m$ iteraciones se construye añadiendo un nuevo árbol al anterior:

$$
F_m(\mathbf{x}) = F_{m-1}(\mathbf{x}) + \eta \, h_m(\mathbf{x})
$$

donde:
- $F_{m-1}$ es el modelo acumulado hasta la iteración anterior.
- $h_m$ es el árbol entrenado en la iteración $m$ para aproximar el gradiente negativo de la pérdida.
- $\eta$ es la **tasa de aprendizaje** (*learning rate*): controla cuánto pesa cada árbol nuevo; valores pequeños necesitan más árboles pero generalizan mejor.

## Interactivo

```widget
motor: dispersion2d
modo: boosting
dataset: {"generador": "xor", "n": 150, "ruido": 0.2, "clases": 2, "semilla": 6}
controles: [{"nombre": "n_arboles", "min": 1, "max": 40, "paso": 1, "valor": 5, "etiqueta": "número de iteraciones"}]
paso_a_paso: true
```

- Prueba a pulsar «Paso →» varias veces y observa cómo los puntos mal clasificados crecen de tamaño (más peso) antes de que se entrene el siguiente árbol.
- Prueba a comparar la frontera con pocas iteraciones frente a muchas: ¿en qué punto empieza a rodear puntos sueltos en vez de seguir el patrón general?
- Prueba a fijarte en qué tipo de frontera logra combinar varios tocones (árboles de profundidad 1) lineales sobre este dataset no lineal.

## En código

```python
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
import numpy as np

X, y = make_classification(n_samples=300, n_features=6, n_informative=3, random_state=0)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, random_state=0)

gb = GradientBoostingClassifier(n_estimators=50, learning_rate=0.1, max_depth=2, random_state=0)
gb.fit(Xtr, ytr)

exactitud = [np.mean(pred == yte) for pred in gb.staged_predict(Xte)]
print(round(exactitud[0], 3), round(exactitud[9], 3), round(exactitud[49], 3))
# 0.722 0.822 0.911: la exactitud en test mejora con más iteraciones
```

## Errores típicos

- **Error**: pensar que boosting, como bagging, entrena sus modelos base en paralelo e independientes. → **Correcto**: los entrena en serie; cada uno depende de los errores del anterior, así que no se pueden entrenar a la vez.
- **Error**: subir la tasa de aprendizaje y el número de árboles a la vez sin vigilar el error de validación. → **Correcto**: boosting, al reducir el sesgo de forma tan agresiva, puede sobreajustar si hay ruido; conviene una tasa de aprendizaje baja y vigilar cuándo el error de validación deja de bajar (parada anticipada).
- **Error**: creer que un aprendiz débil individual (por ejemplo, un árbol de profundidad 1) es un mal modelo en sí mismo. → **Correcto**: su valor está en combinarse en cadena con otros; por separado rinde poco mejor que el azar, y esa es justamente la pieza que el boosting explota.

## En resumen

- **Qué hace**: encadena modelos simples donde cada uno se centra en corregir los errores de los anteriores, para reducir el sesgo del conjunto.
- **Cómo funciona**: entrena un aprendiz débil → mide sus errores → entrena el siguiente centrado en esos errores (más peso en AdaBoost, ajustando el gradiente de la pérdida en Gradient Boosting) → combina todos con pesos.
- **Fórmula clave**: en Gradient Boosting, $F_m(\mathbf{x}) = F_{m-1}(\mathbf{x}) + \eta\, h_m(\mathbf{x})$, sumando árboles que corrigen el gradiente de la pérdida.
- **Hiperparámetros que importan**: `learning_rate`, `n_estimators` y `max_depth` del árbol base; hay que ajustarlos juntos.
- **Cuándo usarlo**: cuando el sesgo es el problema (un modelo simple no capta el patrón) y puedes permitirte entrenar de forma secuencial, más lenta que en paralelo.
- **Cuándo no**: con datos muy ruidosos, donde boosting puede sobreajustarse a observaciones erróneas al insistir en corregirlas.
- **Trampa principal**: confundirlo con bagging; boosting no reduce varianza entrenando en paralelo, reduce sesgo entrenando en serie, y por eso es más sensible al ruido.

## A fondo

:::ampliacion
### XGBoost, LightGBM y CatBoost: boosting a escala

Las implementaciones modernas añaden velocidad y regularización sobre la idea original de Friedman. **XGBoost** penaliza en la función objetivo la complejidad de cada árbol (hojas y magnitud de sus valores), similar en espíritu a Ridge/Lasso, y usa gradiente y hessiano para elegir mejores divisiones. **LightGBM** agrupa los valores de cada variable en histogramas y hace crecer el árbol *hoja a hoja* (leaf-wise, expandiendo primero la hoja que más reduce la pérdida) en vez de nivel a nivel, lo que da árboles más precisos pero más propensos al sobreajuste si no se limita su profundidad. **CatBoost** maneja variables categóricas sin codificarlas a mano y usa *ordered boosting* para reducir el sesgo de reutilizar los mismos datos al calcular gradientes y ajustar el árbol.

Fuente: Chen, T. y Guestrin, C. (2016). *XGBoost: A Scalable Tree Boosting System*. KDD 2016 · Ke, G. et al. (2017). *LightGBM: A Highly Efficient Gradient Boosting Decision Tree*. NeurIPS 2017.
:::

:::ampliacion
### Hiperparámetros clave y parada anticipada

Los hiperparámetros que más afectan son la **tasa de aprendizaje** (`learning_rate`, entre 0,01 y 0,3: valores bajos generalizan mejor pero piden más árboles), el **número de árboles** (`n_estimators`) y la **profundidad del árbol base** (`max_depth`, casi siempre entre 2 y 6). La **parada anticipada** (*early stopping*) entrena mientras el error de validación siga bajando y detiene el proceso en cuanto empeora varias rondas seguidas, evitando fijar `n_estimators` a mano.

Fuente: scikit-learn developers. *User Guide* §1.11 Ensembles: Gradient boosting. https://scikit-learn.org/stable/modules/ensemble.html
:::

## Autoevaluación

### ¿Cuál es la diferencia principal entre cómo bagging y boosting entrenan sus modelos base?
- [x] Bagging los entrena en paralelo sobre remuestreos; boosting los entrena en serie, cada uno sobre los errores del anterior.
- [ ] Bagging usa árboles y boosting usa redes neuronales.
- [ ] No hay diferencia real: ambos combinan modelos base de la misma forma.
> Por qué: la construcción independiente frente a secuencial es la diferencia estructural que explica también por qué bagging reduce varianza y boosting reduce sesgo.

### En AdaBoost, un aprendiz tiene una tasa de error $\varepsilon_t=0{,}3$. ¿Qué le pasa a las observaciones que clasificó mal antes de entrenar el siguiente aprendiz?
- [x] Su peso aumenta, para que el siguiente aprendiz se concentre más en ellas.
- [ ] Se eliminan del dataset antes de la siguiente ronda.
- [ ] Su peso no cambia: solo cambia el peso de voto del aprendiz, $\alpha_t$.
> Por qué: AdaBoost reajusta los pesos de las observaciones tras cada ronda, subiendo el de las mal clasificadas; eso es lo que fuerza al siguiente aprendiz a enfocarse en los casos difíciles.

### Entrenas un Gradient Boosting con `learning_rate=0.3` y `n_estimators=500` y el error de validación empieza a subir a partir del árbol 120. ¿Qué está pasando?
- [x] El modelo ha empezado a sobreajustar; conviene parada anticipada o menos árboles.
- [ ] Es imposible: más árboles siempre bajan el error de validación en boosting.
- [ ] El learning rate es demasiado bajo y hay que subirlo aún más.
> Por qué: boosting reduce el sesgo de forma agresiva, y pasado cierto punto puede empezar a ajustar ruido; el error de validación subiendo es la señal clásica de sobreajuste, que se corrige limitando iteraciones o bajando la tasa de aprendizaje.

## Glosario

- **Aprendiz débil**: modelo simple, apenas mejor que el azar por sí solo, pensado para combinarse en serie con otros.
- **AdaBoost**: algoritmo de boosting que reajusta los pesos de las observaciones tras cada ronda, dando más peso a las mal clasificadas.
- **Gradient Boosting**: boosting en el que cada nuevo modelo se entrena para aproximar el gradiente negativo de la función de pérdida del modelo acumulado.
- **Tasa de aprendizaje (*learning rate*) en boosting**: factor $\eta$ que escala cuánto aporta cada árbol nuevo a la predicción combinada.
- **Parada anticipada (*early stopping*)**: detener el entrenamiento cuando el error de validación deja de mejorar, en vez de fijar de antemano el número de iteraciones.
