---
id: regularizacion
estado: borrador
---

## En una frase

La regularización penaliza los coeficientes grandes de un modelo para frenar el sobreajuste, cambiando algo de ajuste a los datos por más capacidad de generalizar.

## Intuición

Imagina que preparas un examen y solo tienes tiempo de memorizar las respuestas exactas de los ejercicios del libro, incluidos los errores de imprenta. Sacarás una nota perfecta en esos ejercicios, pero fallarás en cuanto el examen cambie una coma. Un modelo con demasiados coeficientes libres hace lo mismo: se aprende de memoria el ruido del conjunto de entrenamiento en vez de la tendencia general.

La regularización es como ponerte una norma antes de estudiar: "no puedes darle demasiado peso a ningún detalle suelto". Al limitar cuánto puede crecer cada coeficiente, el modelo deja de aferrarse a particularidades irrelevantes y se queda con los patrones que de verdad se repiten. Importa en IA porque casi cualquier modelo con muchos parámetros —desde una regresión con decenas de variables hasta una red neuronal— puede memorizar en vez de aprender si se le deja demasiada libertad; la regularización es uno de los mecanismos más directos para evitarlo, junto con la validación cruzada ([[validacion]]) y tener más datos.

## Explicación

### El problema: coeficientes que se disparan

En [[generalizacion]] viste que un modelo demasiado complejo sobreajusta: ajusta también el ruido del conjunto de entrenamiento. En una regresión, ese sobreajuste suele notarse en coeficientes muy grandes que compensan variaciones puntuales de los datos. La regularización ataca el síntoma directamente: añade a la función de pérdida ([[funciones-perdida]]) un coste extra por tener coeficientes grandes.

### La idea: dos objetivos en una sola función

En vez de minimizar solo el error de ajuste, el modelo minimiza ajuste más penalización. El hiperparámetro $\lambda$ reparte el peso entre las dos partes: con $\lambda=0$ no hay penalización y el resultado es la regresión sin regularizar; a medida que $\lambda$ crece, el modelo sacrifica algo de ajuste a cambio de coeficientes más pequeños y, con ello, menos sensibles al ruido del conjunto de entrenamiento.

### Ridge (L2): encoge, no elimina

La regresión Ridge penaliza la suma de los cuadrados de los coeficientes. Cuanto mayor es $\lambda$, más se acercan los coeficientes a cero, pero ninguno llega a valer exactamente cero salvo en casos límite: Ridge reparte la penalización entre todas las variables sin descartar ninguna.

### Lasso (L1): encoge y selecciona

Lasso penaliza la suma de los valores absolutos de los coeficientes. Esa forma de penalización sí puede llevar coeficientes exactamente a cero, así que Lasso hace además una selección automática de variables: las que aportan poco a reducir el error terminan fuera del modelo.

### Ridge frente a Lasso

Usa Ridge cuando quieres estabilizar el modelo sin eliminar variables, por ejemplo con predictores muy correlacionados entre sí. Usa Lasso cuando además quieres simplificar el modelo y quedarte solo con las variables relevantes.

## Formalización

$$
\min_{\boldsymbol\beta} \left[ \frac{1}{n}\sum_{i=1}^n (y_i-\hat y_i)^2 + \lambda P(\boldsymbol\beta) \right]
$$

donde:
- $\boldsymbol\beta$ son los coeficientes del modelo,
- $n$ es el número de observaciones,
- $y_i$ es el valor real de la observación $i$,
- $\hat y_i$ es la predicción del modelo para la observación $i$,
- $\lambda \geq 0$ es el hiperparámetro de regularización,
- $P(\boldsymbol\beta)$ es el término de penalización, que depende del método.

Ridge (L2):

$$
P(\boldsymbol\beta) = \sum_{j=1}^p \beta_j^2
$$

donde:
- $p$ es el número de variables (coeficientes) del modelo,
- $\beta_j$ es el coeficiente de la variable $j$.

Lasso (L1):

$$
P(\boldsymbol\beta) = \sum_{j=1}^p |\beta_j|
$$

donde:
- $p$ es el número de variables del modelo,
- $|\beta_j|$ es el valor absoluto del coeficiente de la variable $j$.

## Interactivo

```widget
motor: dispersion2d
modo: "ridge-lasso"
dataset: {"generador": "lineal", "n": 60, "ruido": 0.3, "clases": 1, "semilla": 7}
controles: [{"nombre": "lambda", "etiqueta": "λ (regularización)", "min": 0, "max": 10, "paso": 0.1, "valor": 0}]
```

- Prueba a subir λ poco a poco desde 0 y observa cómo los coeficientes de Ridge se encogen sin llegar nunca a cero.
- Prueba a hacer lo mismo con Lasso: busca el valor de λ en el que un coeficiente se anula exactamente.
- Prueba a llevar λ a un valor muy alto y comprueba que el modelo empieza a subajustar.

## En código

```python
import numpy as np
from sklearn.linear_model import LinearRegression, Ridge, Lasso

X = np.array([[1.0, 5.0], [2.0, -3.0], [3.0, 1.0], [4.0, -2.0], [5.0, 4.0]])
y = np.array([2.1, 3.9, 6.2, 7.8, 10.1])
Xs = (X - X.mean(axis=0)) / X.std(axis=0)

print(LinearRegression().fit(Xs, y).coef_)  # [2.819 0.107]  sin regularizar
print(Ridge(alpha=1.0).fit(Xs, y).coef_)    # [2.348 0.072]  se encogen los dos
print(Ridge(alpha=5.0).fit(Xs, y).coef_)    # [1.408 0.022]  más lambda, más encogimiento
print(Lasso(alpha=0.5).fit(Xs, y).coef_)    # [2.314 0.   ]  el segundo coeficiente se anula
```

## Errores típicos

- **Error**: pensar que Ridge también puede eliminar variables por completo → **Correcto**: Ridge encoge todos los coeficientes hacia cero, pero solo Lasso los lleva exactamente a cero.
- **Error**: creer que un λ más alto siempre mejora la generalización → **Correcto**: un λ demasiado alto simplifica en exceso el modelo y provoca subajuste; hay que elegirlo con validación cruzada ([[validacion]]).
- **Error**: aplicar la penalización a variables sin escalar → **Correcto**: si las variables tienen escalas muy distintas, la penalización castiga más a las que tienen valores grandes por pura escala, no por importancia; conviene estandarizarlas antes.
- **Error**: confundir la penalización con la función de pérdida completa → **Correcto**: $P(\boldsymbol\beta)$ es solo el término que se añade; el ajuste a los datos lo sigue midiendo la pérdida original (MSE, log-loss...).

## En resumen

- La regularización añade a la pérdida un coste proporcional al tamaño de los coeficientes, para frenar el sobreajuste.
- Fórmula clave: minimizar MSE + λ·P(β), donde λ controla cuánto pesa la penalización frente al ajuste.
- Ridge (L2) penaliza la suma de los cuadrados: encoge todos los coeficientes, pero no los anula.
- Lasso (L1) penaliza la suma de los valores absolutos: puede anular coeficientes y así seleccionar variables.
- Úsala cuando el modelo tenga muchas variables o indicios de sobreajuste; no aporta nada si el modelo ya subajusta.
- El hiperparámetro que hay que decidir es λ (y el método, Ridge o Lasso); se elige con validación cruzada, no a ojo.
- La trampa principal: subir λ sin límite reduce la varianza, pero aumenta el sesgo hasta el punto de subajustar.

## A fondo

La regularización es, en el fondo, una forma deliberada de aumentar el sesgo del modelo para reducir su varianza (compromiso sesgo-varianza, ver [[generalizacion]]). Al restringir el tamaño de los coeficientes, el modelo pierde algo de flexibilidad —ya no puede ajustarse tan de cerca a cualquier conjunto de entrenamiento— pero gana estabilidad: si repitieras el entrenamiento con una muestra distinta, los coeficientes cambiarían menos.

Ese es precisamente el mecanismo por el que la regularización mejora la generalización: casi siempre compensa sobradamente un pequeño aumento de sesgo con una caída mayor de la varianza, y el error total en datos nuevos baja. Con $\lambda$ pequeño el modelo sigue siendo casi tan complejo como sin regularizar (bajo sesgo, alta varianza); con $\lambda$ muy alto se simplifica en exceso (alto sesgo, baja varianza). El valor óptimo está en un punto intermedio, y no hay fórmula cerrada para encontrarlo: se busca probando varios valores de $\lambda$ y midiendo el error con validación cruzada.

## Autoevaluación

### Tienes un modelo de regresión con 20 variables y sospechas que muchas no aportan nada. ¿Qué técnica de regularización elegirías para simplificar el modelo automáticamente?
- [ ] Ridge, porque encoge todos los coeficientes por igual
- [x] Lasso, porque puede llevar a cero los coeficientes de las variables poco útiles
- [ ] Ninguna, porque la regularización no afecta al número de variables activas
> Por qué: Lasso penaliza con la norma L1, que sí puede anular coeficientes exactamente y así descartar variables; Ridge (L2) solo los encoge sin eliminarlos.

### Si aumentas λ hasta un valor muy alto, ¿qué le pasa al modelo?
- [ ] Se vuelve más complejo y sobreajusta más
- [ ] No cambia, porque λ solo afecta a la velocidad de entrenamiento
- [x] Se simplifica en exceso y puede subajustar
> Por qué: un λ muy alto da tanto peso a la penalización que los coeficientes se aplastan hacia cero, perdiendo capacidad de capturar la relación real entre variables (alto sesgo).

### Entrenas Ridge sobre variables sin estandarizar, una en euros (valores de miles) y otra en años (valores de 0 a 10). ¿Qué problema puede aparecer?
- [ ] Ninguno, Ridge es insensible a la escala de las variables
- [x] La penalización castigará más a la variable en euros solo por tener valores más grandes, no por ser más relevante
- [ ] El modelo dejará de converger
> Por qué: la penalización suma cuadrados (o valores absolutos) de los coeficientes tal cual, así que las variables con escalas mayores necesitan coeficientes más pequeños para el mismo ajuste, y eso distorsiona a quién penaliza más si no se estandariza antes.

### ¿Qué diferencia principal hay entre Ridge y Lasso?
- [ ] Ridge se usa en clasificación y Lasso en regresión
- [ ] Lasso no tiene ningún hiperparámetro que ajustar
- [x] Lasso puede anular coeficientes por completo (selección de variables); Ridge solo los encoge
> Por qué: la norma L1 de Lasso tiene "esquinas" en cero que hacen que la solución óptima caiga exactamente ahí para coeficientes poco útiles; la norma L2 de Ridge es suave y nunca fuerza un cero exacto.

## Glosario

- **regularización**: técnica que añade a la función de pérdida una penalización sobre el tamaño de los coeficientes, para reducir el sobreajuste.
- **Ridge**: también llamada regularización L2; penaliza la suma de los cuadrados de los coeficientes, encogiéndolos sin anularlos.
- **Lasso**: también llamada regularización L1; penaliza la suma de los valores absolutos de los coeficientes y puede llevarlos exactamente a cero.
- **λ**: hiperparámetro de regularización que controla cuánto pesa la penalización de los coeficientes frente al ajuste a los datos.
