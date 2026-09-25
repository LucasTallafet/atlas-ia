---
id: regresion-logistica
estado: borrador
---

## En una frase

La regresión logística transforma una combinación lineal de variables con la función sigmoide para predecir la probabilidad de que una observación pertenezca a una clase.

## Intuición

Piensa en un filtro de spam. No basta con decir "sí" o "no" de forma tajante: es más útil decir "este correo tiene un 92% de pinta de ser spam" y dejar que el sistema decida qué hacer con esa confianza (moverlo a la carpeta de spam, marcarlo como sospechoso, dejarlo pasar). La regresión logística hace exactamente eso: en vez de predecir una clase directamente, predice una probabilidad entre 0 y 1, y solo al final aplica un umbral (normalmente 0,5) para convertir esa probabilidad en una decisión.

Es, junto a [[regresion-lineal]], uno de los modelos de clasificación más usados en la práctica porque combina algo poco habitual: es simple de entrenar, sus coeficientes se interpretan con claridad (qué variables empujan hacia una clase u otra) y, aun así, da resultados competitivos en tareas como detección de fraude, diagnóstico médico o predicción de abandono de clientes. Es también la base conceptual de la capa de salida de muchas redes neuronales de clasificación.

## Explicación

### Por qué no basta con una recta

[[regresion-lineal|La regresión lineal]] predice valores continuos sin límite, pero una probabilidad debe quedar siempre entre 0 y 1. Si ajustas una recta directamente sobre una variable "aprobado/suspenso" (codificada 0/1), la recta puede predecir 1,3 o −0,2 para algunos alumnos: valores que no significan nada como probabilidad. Hace falta una transformación que "aplaste" cualquier número real hacia el rango [0, 1].

### La función sigmoide

Esa transformación es la **función sigmoide** (o logística), con su característica forma de S:

$$
\sigma(z) = \frac{1}{1+e^{-z}}
$$

Da igual lo grande o pequeño que sea $z$: la salida siempre cae entre 0 y 1, acercándose a 1 cuando $z$ crece mucho y a 0 cuando $z$ decrece mucho, y valiendo exactamente 0,5 en $z=0$. La regresión logística calcula $z$ igual que la regresión lineal —una combinación lineal de las predictoras— y después le aplica la sigmoide para obtener $P(y=1\mid\mathbf{x})$. Para clasificar, se compara esa probabilidad con un umbral $t$ (habitualmente 0,5).

### Cómo se ajustan los coeficientes: máxima verosimilitud

En regresión lineal, los coeficientes se obtenían minimizando una suma de cuadrados que tenía solución exacta. En regresión logística no hay una fórmula cerrada así, porque la sigmoide es no lineal. En su lugar se usa el método de **máxima verosimilitud**: buscar los coeficientes que hacen más probable haber observado exactamente los datos de entrenamiento que tienes. Maximizar esa verosimilitud equivale a minimizar su logaritmo negativo, que actúa como función de pérdida y es convexa (tiene un único mínimo global). Esa minimización se resuelve de forma iterativa, típicamente con [[descenso-gradiente]] o variantes más rápidas como Newton-Raphson.

### De dos clases a muchas

Cuando hay más de dos categorías sin orden entre ellas (por ejemplo, "gato", "perro", "pájaro"), la extensión natural es la **regresión logística multinomial**: en vez de una sola sigmoide, calcula un logit por cada clase frente a una clase de referencia y normaliza con la función **softmax** para que las probabilidades de todas las clases sumen 1. Si, en cambio, las categorías tienen un orden natural (por ejemplo, una encuesta de satisfacción de "muy insatisfecho" a "muy satisfecho"), se usa la **regresión logística ordinal**, que modela probabilidades acumuladas en vez de probabilidades por clase.

### Qué debe cumplirse para confiar en el modelo

A diferencia de la regresión lineal, aquí no hace falta que $x$ e $y$ tengan una relación lineal directa; lo que se exige es **linealidad en el *logit***: que el logaritmo de los *odds* (la razón entre la probabilidad de la clase positiva y la de la negativa) sí sea una combinación lineal de las predictoras. También se sigue exigiendo independencia entre observaciones, por las mismas razones que en regresión lineal (ver [[regresion-lineal]]): sin ella, los errores estándar de los coeficientes dejan de ser fiables.

## Formalización

$$
P(y=1\mid\mathbf x) = \sigma(z) = \frac{1}{1+e^{-z}}, \qquad z=\beta_0+\beta_1 x_1+\dots+\beta_p x_p
$$

donde:
- $\mathbf x=(x_1,\dots,x_p)$ es el vector de características de una observación.
- $\beta_0,\dots,\beta_p$ son los coeficientes del modelo, estimados a partir de los datos.
- $P(y=0\mid\mathbf x) = 1-P(y=1\mid\mathbf x)$.

El [[funciones|*logit*]] (logaritmo de los *odds*) conecta esta probabilidad con la combinación lineal:

$$
\log\left(\frac{p}{1-p}\right) = z
$$

donde:
- $p=P(y=1\mid\mathbf x)$.
- $\frac{p}{1-p}$ es el *odds*: cuántas veces más probable es la clase positiva que la negativa.

Cada coeficiente $\beta_j$ mide cuánto cambia el logit por cada unidad de $x_j$: los *odds* quedan multiplicados por $e^{\beta_j}$. Por ejemplo, $\beta_j=0{,}5$ multiplica los *odds* por $e^{0{,}5}\approx1{,}65$ (verificado con `numpy.exp`) por cada unidad que aumenta $x_j$.

**Ajuste por máxima verosimilitud.** Con $n$ observaciones $(\mathbf x_i,y_i)$, la log-verosimilitud a maximizar es:

$$
\ell(\boldsymbol\beta) = \sum_{i=1}^n \Big[y_i\log P(y_i{=}1\mid\mathbf x_i) + (1-y_i)\log\big(1-P(y_i{=}1\mid\mathbf x_i)\big)\Big]
$$

donde:
- el primer término penaliza cuando $y_i=1$ pero el modelo predijo una probabilidad baja.
- el segundo penaliza cuando $y_i=0$ pero el modelo predijo una probabilidad alta.

La función de pérdida que se minimiza es $J(\boldsymbol\beta)=-\ell(\boldsymbol\beta)$ (log-verosimilitud negativa), y su gradiente respecto a cada $\beta_j$ es $\frac{\partial J}{\partial\beta_j}=-\sum_{i=1}^n (y_i-P(y_i{=}1\mid\mathbf x_i))\,x_{ij}$, que [[descenso-gradiente|el descenso de gradiente]] usa para actualizar los coeficientes paso a paso.

**Ejemplo numérico.** Con $z=-12+0{,}2x$ (aprobar un examen según la puntuación $x$), la probabilidad de aprobar en cada puntuación es (verificado con `numpy`):

| $x$ | 40 | 50 | 60 | 70 | 80 |
|---|---|---|---|---|---|
| $P(y{=}1\mid x)$ | 0,018 | 0,119 | 0,5 | 0,881 | 0,982 |

:::nota-fuente
El material original usa esta misma ecuación y afirma que $P(y{=}1\mid x{=}60)=0{,}73$. Comprobado con `numpy.exp`: en $x=60$, $z=-12+0{,}2\cdot60=0$, y $\sigma(0)=0{,}5$, no $0{,}73$ (ese valor correspondería a $z=1$, es decir, a un intercepto de $-11$ en vez de $-12$). Se usa aquí el valor correcto, $0{,}5$, coherente con la ecuación tal como está escrita.
:::

**Multinomial (softmax).** Para $K$ clases, con la clase $K$ como referencia:

$$
P(y=j\mid\mathbf x) = \frac{e^{z_j}}{\sum_{k=1}^K e^{z_k}}, \qquad z_j=\beta_{j0}+\beta_{j1}x_1+\dots+\beta_{jp}x_p
$$

donde:
- $z_j$ es el logit de la clase $j$ frente a la de referencia.
- el denominador normaliza para que las $K$ probabilidades sumen 1.

## Interactivo

```widget
motor: dispersion2d
modo: logistica
dataset: {"generador": "blobs", "n": 60, "clases": 2, "ruido": 1.1, "semilla": 7}
arrastrables: true
```

- Prueba a arrastrar puntos de una clase hacia el lado contrario y observa cómo se desplaza la frontera de decisión.
- Prueba a mezclar bien las dos nubes de puntos y fíjate en qué le pasa a la pendiente de la sigmoide cerca de la frontera.
- Prueba a alejar mucho un punto de su clase: comprueba si cambia más la frontera que al mover uno cercano a ella.

## En código

```python
import numpy as np

def sigmoide(z):
    return 1 / (1 + np.exp(-z))

x = np.array([40, 50, 60, 70, 80])
z = -12 + 0.2 * x
p = sigmoide(z)
print(np.round(p, 3))
# [0.018 0.119 0.5   0.881 0.982]

clase = (p >= 0.5).astype(int)
print(clase)
# [0 0 1 1 1]
```

## Errores típicos

- **Error**: interpretar la salida de la regresión logística como un valor continuo cualquiera. → **Correcto**: es una probabilidad acotada en [0, 1]; para obtener una clase hace falta aplicar un umbral, normalmente 0,5.
- **Error**: pensar que la regresión logística exige una relación lineal entre $x$ e $y$, igual que la lineal. → **Correcto**: lo que exige es linealidad en el *logit* (en el espacio de $\log(p/(1-p))$), no en el espacio de probabilidades.
- **Error**: leer un coeficiente $\beta_j$ como si sumara directamente a la probabilidad. → **Correcto**: $\beta_j$ actúa sobre el *logit*; su efecto sobre la probabilidad final depende de en qué punto de la curva sigmoide se esté (cerca del centro, el mismo $\beta_j$ cambia mucho más la probabilidad que en los extremos).
- **Error**: usar regresión logística multinomial cuando las categorías tienen un orden natural. → **Correcto**: si hay orden (por ejemplo, niveles de satisfacción), la regresión logística ordinal aprovecha esa estructura y suele dar coeficientes más simples de interpretar.

## En resumen

- Qué hace: predice la probabilidad de que una observación pertenezca a una clase, aplicando la sigmoide a una combinación lineal de las variables.
- Cómo funciona: 1) calcula $z=\beta_0+\beta_1x_1+\dots$; 2) aplica $\sigma(z)$ para obtener una probabilidad; 3) ajusta los $\beta$ maximizando la verosimilitud de los datos observados (normalmente con descenso de gradiente); 4) aplica un umbral para decidir la clase.
- Fórmula clave: $P(y{=}1\mid\mathbf x)=1/(1+e^{-z})$.
- Úsala para clasificación (binaria, multinomial u ordinal) cuando quieras probabilidades interpretables; no la uses para predecir cantidades continuas (ahí vuelve a [[regresion-lineal]]).
- Decisiones que importan: el umbral de decisión (no siempre 0,5, según el coste de cada tipo de error), qué variables incluir y si usar la variante multinomial u ordinal según haya o no orden entre clases.
- Trampa principal: confundir el efecto de un coeficiente sobre el *logit* con su efecto sobre la probabilidad, que no es constante a lo largo de la curva.

## A fondo

**Contexto histórico.** La función logística la introdujo Pierre François Verhulst en 1838 para modelar crecimiento poblacional limitado por recursos. Joseph Berkson acuñó el término "regresión logística" en 1944 en biometría, y fue Sir David Cox quien, en 1958, formalizó su marco matemático para datos binarios, allanando el camino a las extensiones multinomial y ordinal.

**Métodos de optimización alternativos al descenso de gradiente por lotes.** El **gradiente estocástico (SGD)** actualiza los coeficientes con una muestra a la vez en vez de con todo el conjunto, acelerando la convergencia en datasets grandes. El método de **Newton-Raphson** usa la matriz Hessiana (segundas derivadas) para dar pasos más precisos, a costa de más cálculo por iteración. **Adam** combina gradiente estocástico con una tasa de aprendizaje que se adapta automáticamente.

**Detectar cuándo falla la linealidad en el logit.** Se puede añadir un término no lineal (por ejemplo $x_j^2$) y comprobar si resulta significativo, hacer una prueba gráfica dividiendo la variable en intervalos y representando el logit observado en cada uno, o recurrir a splines cuando la relación no es completamente lineal.

## Autoevaluación

### Un modelo predice $P(y{=}1\mid x=60)=0{,}5$. ¿Qué significa esto?
- [ ] Que el modelo se ha equivocado y no sabe decidir
- [x] Que, con $x=60$, el modelo considera igual de probables las dos clases: es justo el punto de la frontera de decisión
- [ ] Que la mitad de las observaciones con $x=60$ pertenecen a la clase 1
> Por qué: $P=0{,}5$ corresponde a $z=0$, el punto en que la sigmoide vale exactamente 0,5: ni una clase ni la otra son más probables según el modelo. No implica error ni dice nada sobre la proporción real de datos con ese valor de $x$.

### ¿Por qué no se puede usar la regresión lineal directamente como clasificador binario?
- [ ] Porque no admite variables categóricas como entrada
- [ ] Porque no se puede entrenar con descenso de gradiente
- [x] Porque puede predecir valores fuera del rango [0, 1], que no tienen sentido como probabilidad
> Por qué: la regresión lineal no acota su salida; la regresión logística añade la sigmoide precisamente para que la salida sea interpretable como probabilidad.

### Un coeficiente $\beta_j=0{,}7$ en un modelo de regresión logística. ¿Qué le pasa a los *odds* de la clase positiva cuando $x_j$ aumenta una unidad (el resto constante)?
- [ ] Se suman 0,7 unidades a la probabilidad
- [x] Se multiplican por $e^{0{,}7}\approx2$
- [ ] Se dividen por 0,7
> Por qué: en el espacio del *logit* el efecto es aditivo ($\beta_j$ se suma), pero al deshacer el logaritmo el efecto sobre los *odds* es multiplicativo: se multiplican por $e^{\beta_j}$.

### Quieres predecir la categoría de satisfacción de un cliente ("bajo", "medio", "alto"), que tiene un orden natural. ¿Qué variante de regresión logística encaja mejor?
- [ ] Regresión logística binaria, entrenando tres modelos independientes
- [ ] Regresión logística multinomial, ignorando el orden
- [x] Regresión logística ordinal, que aprovecha el orden entre categorías
> Por qué: la multinomial trataría las tres categorías como intercambiables y perdería la información de orden; la ordinal modela probabilidades acumuladas y suele dar coeficientes más simples cuando ese orden existe de verdad.

## Glosario

- **función sigmoide (o logística)**: función $\sigma(z)=1/(1+e^{-z})$ que transforma cualquier número real en un valor entre 0 y 1, con forma de S.
- **odds**: razón entre la probabilidad de que ocurra un evento y la probabilidad de que no ocurra, $p/(1-p)$.
- **máxima verosimilitud**: método de ajuste que busca los parámetros que hacen más probable haber observado los datos de entrenamiento.
- **softmax**: generalización de la sigmoide a varias clases, que convierte un vector de logits en probabilidades que suman 1.
