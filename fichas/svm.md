---
id: svm
estado: borrador
---

## En una frase

Las máquinas de vectores soporte buscan la frontera lineal que separa dos clases dejando el mayor margen posible, y usan el truco del kernel para trazar fronteras no lineales sin cambiar el algoritmo.

## Intuición

Imagina que tienes que separar dos grupos de canicas sobre una mesa con una sola regla recta. Hay muchas rectas que los separan correctamente, pero no todas son igual de buenas: una que pase casi rozando algunas canicas es frágil, porque una canica nueva, muy parecida a las de su grupo, podría caer del lado equivocado. Una máquina de vectores soporte (*support vector machine*, **SVM**) elige, de entre todas las rectas posibles, la que deja el mayor "pasillo" vacío a ambos lados: la frontera más robusta frente a datos nuevos parecidos a los de entrenamiento.

[[regresion-logistica|La regresión logística]] también traza una frontera de decisión, pero no le importa lo lejos que quede un punto de ella una vez está bien clasificado. SVM, en cambio, se preocupa explícitamente de maximizar esa distancia. Esta idea, combinada con el llamado truco del kernel, hace de SVM uno de los clasificadores clásicos más potentes cuando los datos no son demasiados pero las fronteras entre clases son complejas.

## Explicación

### De separar a separar con el mayor margen posible

Entre todas las rectas (o hiperplanos, con más variables) que separan dos clases sin errores, SVM elige la que maximiza la distancia mínima a los puntos de cada clase. Esa distancia se llama **margen**, y los puntos que quedan justo en el borde del margen —los que "sostienen" la frontera— son los **vectores soporte**: si los movieras, la frontera se movería con ellos; si movieras cualquier otro punto sin cruzar el margen, la frontera no cambiaría en absoluto.

:::ampliacion
**Margen máximo y vectores soporte.** Formalmente, la frontera es el hiperplano $\mathbf w\cdot\mathbf x+b=0$ para el que la distancia mínima a cualquier punto de entrenamiento correctamente clasificado es máxima. Solo los vectores soporte determinan esa frontera: el resto de los puntos, por muchos que sean, no influye en absoluto en $\mathbf w$ ni en $b$ mientras queden fuera del margen. Esta es una diferencia importante frente a modelos como la regresión logística, cuyos coeficientes sí se ven afectados por todos los puntos del entrenamiento.

Fuente: scikit-learn User Guide §1.4 Support Vector Machines.
:::

### Cuando los datos no son perfectamente separables: margen blando

En la práctica, casi ningún conjunto de datos reales se separa sin ningún error. Exigir una separación perfecta haría que un solo punto ruidoso pudiera desbaratar el margen entero, o que el problema ni siquiera tuviera solución.

:::ampliacion
**Margen blando y el hiperparámetro $C$.** La solución es el **margen blando** (*soft margin*): se permite que algunos puntos invadan el margen o incluso queden mal clasificados, penalizando esa invasión en la función objetivo. El hiperparámetro $C$ controla ese equilibrio: un $C$ alto penaliza mucho las invasiones (frontera más ajustada a los datos, más vectores soporte "forzados", mayor riesgo de sobreajuste); un $C$ bajo tolera más invasiones a cambio de un margen más ancho y una frontera más suave (más [[regularizacion|regularizada]]). $C$ juega, de hecho, el mismo papel que $1/\lambda$ en la regularización Ridge: cuanto mayor es $C$, menos se penaliza la complejidad del modelo.

Fuente: Cortes, C. & Vapnik, V. (1995), "Support-Vector Networks", Machine Learning 20(3).
:::

### Fronteras no lineales: el truco del kernel

Una frontera lineal no basta cuando las clases se entrelazan de forma curva (por ejemplo, una clase rodeando a la otra). En vez de renunciar a SVM, se puede proyectar los datos a un espacio de más dimensiones donde sí sean linealmente separables.

:::ampliacion
**El truco del kernel.** Calcular esa proyección explícitamente puede ser carísimo o incluso imposible (si el nuevo espacio tiene infinitas dimensiones). El **truco del kernel** evita ese cálculo explícito: en la formulación de SVM, los datos solo aparecen a través de productos escalares entre pares de puntos (ver [[producto-escalar-similitud]]), así que basta con sustituir ese producto escalar por una función *kernel* $K(\mathbf x,\mathbf x')$ que se comporta como si los datos ya estuvieran en el espacio proyectado, sin calcularlo nunca explícitamente. Los kernels más habituales son el lineal (sin proyección: SVM lineal de siempre), el polinómico y el **RBF** (*radial basis function*, o gaussiano), que puede generar fronteras arbitrariamente curvas.

Fuente: scikit-learn User Guide §1.4.6 Kernel functions.
:::

:::ampliacion
**SVM para regresión (SVR).** La misma idea de margen se adapta a variables continuas en la **regresión de vectores soporte** (*support vector regression*, **SVR**): en vez de buscar el hiperplano que separa dos clases dejando el mayor margen, SVR busca la función que se ajusta a los datos dejando un "tubo" de ancho $\varepsilon$ alrededor de la predicción; los errores dentro de ese tubo no penalizan nada, y solo los puntos que quedan fuera —de nuevo, los vectores soporte— determinan el ajuste final.

Fuente: scikit-learn User Guide §1.4.5 Regression (SVR).
:::

## Formalización

**Margen duro** (datos perfectamente separables):

$$
\min_{\mathbf w,b}\ \frac{1}{2}\lVert\mathbf w\rVert^2 \quad\text{sujeto a } y_i(\mathbf w\cdot\mathbf x_i+b)\geq1 \ \ \forall i
$$

donde:
- $\mathbf w$, $b$ definen el hiperplano separador $\mathbf w\cdot\mathbf x+b=0$.
- $y_i\in\{-1,+1\}$ es la clase de la observación $i$.
- minimizar $\lVert\mathbf w\rVert$ equivale a maximizar el margen, ya que el margen es $2/\lVert\mathbf w\rVert$.

**Ejemplo numérico.** Dos puntos, uno por clase: $\mathbf x_1=(1,1)$ con $y_1=-1$, $\mathbf x_2=(3,3)$ con $y_2=+1$. Resolviendo las condiciones de margen para estos dos vectores soporte (verificado con `numpy`): $\mathbf w=(0{,}5,\,0{,}5)$, $b=-2$, con $\lVert\mathbf w\rVert\approx0{,}707$ y margen $2/\lVert\mathbf w\rVert\approx2{,}828$; cada punto queda a una distancia $\approx1{,}414$ de la frontera $x_1+x_2=4$.

**Margen blando**, con una variable de holgura $\xi_i\geq0$ por observación:

$$
\min_{\mathbf w,b,\boldsymbol\xi}\ \frac{1}{2}\lVert\mathbf w\rVert^2 + C\sum_{i=1}^n \xi_i \quad\text{sujeto a } y_i(\mathbf w\cdot\mathbf x_i+b)\geq1-\xi_i,\ \ \xi_i\geq0
$$

donde:
- $\xi_i$ mide cuánto invade el margen (o cruza al lado equivocado) la observación $i$; $\xi_i=0$ si queda fuera del margen y bien clasificada.
- $C>0$ es el hiperparámetro que pesa esa invasión frente al tamaño del margen.

**Kernel.** Sustituyendo el producto escalar $\mathbf x_i\cdot\mathbf x_j$ por una función kernel en la formulación dual del problema:

$$
K_{\text{lineal}}(\mathbf x,\mathbf x')=\mathbf x\cdot\mathbf x', \qquad K_{\text{pol}}(\mathbf x,\mathbf x')=(\mathbf x\cdot\mathbf x'+c)^d, \qquad K_{\text{RBF}}(\mathbf x,\mathbf x')=e^{-\gamma\lVert\mathbf x-\mathbf x'\rVert^2}
$$

donde:
- $c$, $d$ son el término independiente y el grado del kernel polinómico.
- $\gamma>0$ controla cuánto se estrecha la influencia de cada punto en el kernel RBF: $\gamma$ alto da fronteras muy locales y ajustadas; $\gamma$ bajo, fronteras más suaves.

Por ejemplo, con $\gamma=0{,}5$ y dos puntos $\mathbf x=(0,0)$, $\mathbf x'=(1,1)$ (distancia al cuadrado $=2$), $K_{\text{RBF}}(\mathbf x,\mathbf x')=e^{-0{,}5\cdot2}\approx0{,}368$ (verificado con `numpy.exp`).

## Interactivo

```widget
motor: dispersion2d
modo: svm
dataset: {"generador": "blobs", "n": 50, "clases": 2, "ruido": 1.0, "semilla": 7}
controles: [{"nombre": "C", "min": 0.1, "max": 10, "paso": 0.1, "valor": 1}]
arrastrables: true
```

- Prueba a mover el deslizador de $C$ de un valor bajo a uno alto y observa cómo cambia el ancho del margen y cuántos puntos quedan dentro de él.
- Prueba a arrastrar un vector soporte marcado y comprueba que la frontera se mueve de inmediato con él.
- Prueba a arrastrar un punto que no es vector soporte, sin sacarlo del margen, y comprueba que la frontera no se mueve.

## En código

```python
import numpy as np
from sklearn.svm import SVC

X = np.array([[1, 1], [1.2, 0.8], [3, 3], [2.8, 3.2]])
y = np.array([-1, -1, 1, 1])

modelo = SVC(kernel="linear", C=1000)  # C alto: casi margen duro
modelo.fit(X, y)

print(np.round(modelo.coef_, 2), np.round(modelo.intercept_, 2))
# [[0.5 0.5]] [-2.]

margen = 2 / np.linalg.norm(modelo.coef_)
print(round(margen, 3))
# 2.828
```

## Errores típicos

- **Error**: pensar que todos los puntos de entrenamiento determinan la frontera, como en la regresión lineal o logística. → **Correcto**: solo los vectores soporte (los puntos justo en el borde del margen o dentro de él) determinan $\mathbf w$ y $b$; el resto podría eliminarse sin cambiar la frontera.
- **Error**: creer que un $C$ más alto siempre da un modelo mejor porque "se equivoca menos en el entrenamiento". → **Correcto**: un $C$ muy alto ajusta tanto la frontera a los datos de entrenamiento que aumenta el riesgo de sobreajuste; hay que elegirlo por validación cruzada, igual que cualquier otro [[hiperparametros|hiperparámetro]].
- **Error**: pensar que el kernel RBF proyecta los datos a un espacio de más dimensiones que luego se puede "ver" o inspeccionar. → **Correcto**: el truco del kernel evita calcular esa proyección explícitamente; solo se necesita poder evaluar $K(\mathbf x,\mathbf x')$, nunca las coordenadas del espacio proyectado.
- **Error**: aplicar SVM con variables en escalas muy distintas sin escalar antes. → **Correcto**: como el kernel depende de productos escalares o distancias entre puntos (ver [[producto-escalar-similitud]]), una variable con rango mucho mayor domina el cálculo si no se aplica [[escalado]] antes, igual que en KNN.

## En resumen

- Qué hace: encuentra la frontera de decisión que separa dos clases dejando el margen más ancho posible entre ellas.
- Cómo funciona: 1) identifica los puntos más próximos a la frontera de cada clase (vectores soporte); 2) ajusta $\mathbf w,b$ para maximizar la distancia a esos puntos; 3) con margen blando, permite que algunos puntos invaden el margen a cambio de una penalización controlada por $C$; 4) con un kernel, sustituye el producto escalar por $K(\mathbf x,\mathbf x')$ para trazar fronteras no lineales sin proyectar los datos explícitamente.
- Fórmula clave: margen $=2/\lVert\mathbf w\rVert$, maximizado sujeto a $y_i(\mathbf w\cdot\mathbf x_i+b)\geq1-\xi_i$.
- Úsalo con conjuntos de datos de tamaño moderado y fronteras complejas donde el margen aporta robustez; evítalo con datasets muy grandes (el entrenamiento escala mal) o cuando necesites probabilidades bien calibradas de forma directa.
- Decisiones que importan: el hiperparámetro $C$, el tipo de kernel (lineal, polinómico, RBF) y, con RBF, el valor de $\gamma$.
- Trampa principal: no escalar las variables antes de entrenar, lo que distorsiona tanto el margen como cualquier kernel basado en distancias.

## A fondo

**SVM como minimización de una pérdida regularizada.** La formulación de margen blando puede reescribirse como minimizar $\lVert\mathbf w\rVert^2$ (un término de [[regularizacion|regularización]] tipo Ridge) más $C$ veces la suma de una **pérdida bisagra** (*hinge loss*), $\max(0,\,1-y_i(\mathbf w\cdot\mathbf x_i+b))$, que vale 0 cuando el punto está bien clasificado y fuera del margen, y crece linealmente cuanto más invade el margen o cruza al lado contrario. Esta perspectiva conecta SVM con [[regresion-logistica]]: ambas minimizan una pérdida más un término de regularización, pero la pérdida bisagra —a diferencia de la log-verosimilitud negativa— deja de penalizar en cuanto un punto está bien clasificado con margen suficiente, en vez de seguir empujando hacia probabilidades cada vez más extremas.

**Origen.** El algoritmo de margen máximo con margen blando lo formalizaron Corinna Cortes y Vladimir Vapnik en 1995 en su artículo "Support-Vector Networks", que sentó las bases de las SVM modernas y del uso sistemático del truco del kernel en clasificación.

## Autoevaluación

### Entrenas una SVM y luego eliminas del conjunto de entrenamiento un punto que quedó lejos del margen, del lado correcto. ¿Qué le pasa a la frontera?
- [ ] Se desplaza ligeramente, porque todos los puntos influyen algo
- [x] No cambia en absoluto, porque ese punto no era un vector soporte
- [ ] Desaparece, porque hace falta un número mínimo de puntos por clase
> Por qué: solo los vectores soporte —los puntos en el borde del margen o dentro de él— determinan $\mathbf w$ y $b$; el resto de los puntos podría eliminarse sin cambiar la frontera aprendida.

### Reduces mucho el hiperparámetro $C$ en una SVM de margen blando. ¿Qué es más probable que ocurra?
- [ ] El margen se estrecha y el modelo se ajusta más a cada punto de entrenamiento
- [x] El margen se ensancha, se toleran más invasiones y la frontera se vuelve más suave, con más riesgo de subajuste
- [ ] El modelo deja de poder clasificar ningún punto nuevo
> Por qué: un $C$ bajo penaliza poco que los puntos invadan el margen, así que el algoritmo prioriza un margen ancho sobre clasificar perfectamente el entrenamiento; llevado al extremo, esto puede subajustar.

### ¿Por qué el truco del kernel permite trabajar como si los datos estuvieran en un espacio de muchas más dimensiones sin proyectarlos explícitamente?
- [ ] Porque el kernel comprime los datos a menos dimensiones antes de entrenar
- [x] Porque en la formulación del problema los datos solo aparecen como productos escalares entre pares de puntos, y el kernel sustituye ese producto por su valor en el espacio proyectado sin calcular las coordenadas de ese espacio
- [ ] Porque el kernel elimina la necesidad de tener vectores soporte
> Por qué: SVM nunca necesita las coordenadas proyectadas en sí, solo el resultado de los productos escalares entre puntos; el kernel calcula directamente ese resultado, evitando el coste (a veces infinito) de la proyección explícita.

## Glosario

- **margen**: distancia mínima entre la frontera de decisión y los puntos de entrenamiento más cercanos de cada clase; SVM la maximiza.
- **vector soporte**: punto de entrenamiento situado justo en el borde del margen (o que lo invade); son los únicos puntos que determinan la frontera.
- **margen blando**: variante de SVM que permite que algunos puntos invadan el margen o queden mal clasificados, penalizando esa invasión mediante el hiperparámetro $C$.
- **truco del kernel**: técnica que sustituye el producto escalar entre puntos por una función $K(\mathbf x,\mathbf x')$ para trazar fronteras no lineales sin proyectar los datos explícitamente a un espacio de más dimensiones.
- **pérdida bisagra (hinge loss)**: función de pérdida que vale 0 para puntos bien clasificados fuera del margen y crece linealmente cuanto más invaden el margen o lo cruzan.
