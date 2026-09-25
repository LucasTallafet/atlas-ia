---
id: arboles-decision
estado: borrador
---

## En una frase

Un árbol de decisión predice dividiendo los datos paso a paso con preguntas sobre sus variables, hasta llegar a una hoja que da la clase o el valor final.

## Intuición

Imagina que decides si salir con paraguas. No aplicas una fórmula: encadenas preguntas. «¿Está nublado?» Si no, sales sin paraguas. Si sí, «¿ha llovido esta semana en la zona?» Si sí, lo coges; si no, miras el pronóstico de la tarde. Cada pregunta reduce la incertidumbre y te acerca a una decisión clara.

Un árbol de decisión automatiza justo ese proceso, salvo que las preguntas no las eliges tú: el algoritmo las descubre a partir de los datos, buscando qué variable preguntar primero y con qué umbral para que cada respuesta separe lo mejor posible los casos de un tipo de los del otro. Por eso son tan intuitivos: cualquiera puede seguir el razonamiento del modelo pregunta a pregunta, algo que no ocurre con modelos más opacos como una red neuronal.

## Explicación

### De las reglas a la estructura: nodos, ramas y hojas

Un árbol de decisión es un conjunto de reglas «si-entonces» organizado como un diagrama jerárquico. Empieza en el **nodo raíz**, que evalúa una variable del dataset; de él salen **ramas** hacia otros **nodos** según el valor de esa variable, y así sucesivamente hasta llegar a un **nodo hoja**, que ya no se divide más y da el resultado: una clase en clasificación, un número en regresión. La **profundidad** del árbol es el número máximo de niveles desde la raíz hasta una hoja.

Según el objetivo, se distingue entre **árboles de clasificación** (variable objetivo categórica: ¿el correo es spam?) y **árboles de regresión** (variable objetivo continua: ¿qué precio tendrá la vivienda?). Según cuántas ramas salen de cada nodo, hay **árboles binarios** (dos ramas por nodo, el diseño habitual y el más compatible con [[bagging-random-forest|Random Forest]]) y **árboles multinarios** (varias ramas, útiles con variables categóricas de muchos niveles).

### Cómo se construye: división recursiva

El árbol se construye por **división recursiva**: en cada nodo, el algoritmo prueba distintas variables y umbrales («¿edad > 30?», «¿región = Norte?») y elige la división que deja los nodos hijos más **homogéneos**, es decir, más cercanos a contener una sola clase (o valores muy parecidos, en regresión). Esa mejora se llama **ganancia de homogeneidad**.

Piensa en un dataset de frutas con su color y si son comestibles. Si divides por **color**, obtienes un grupo "rojo" 100 % comestible, uno "verde" 100 % no comestible y uno "amarillo" 100 % comestible: división perfecta. Si divides por **tamaño**, cada grupo mezcla comestibles y no comestibles: división mediocre. El algoritmo compara todas las divisiones posibles de todas las variables y se queda con la de mayor ganancia; el proceso se repite en cada nodo hijo hasta cumplir una condición de parada.

### Medir la pureza: entropía, Gini y varianza

En clasificación, la pureza de un nodo se mide con la **entropía** o el **índice de Gini** (ver Formalización); ambas valen 0 cuando el nodo es puro y suben cuanto más mezcladas están las clases. Tomemos un ejemplo pequeño: 5 clientes con edad 25, 30, 35, 40 y 50 años, de los que compran "No, No, Sí, Sí, Sí". La entropía del nodo raíz es $H(S)\approx 0{,}971$ (proporciones $2/5$ y $3/5$). Si divides por "edad $\leq 30$", ambos hijos quedan puros ($\{No,No\}$ y $\{Sí,Sí,Sí\}$), con entropía 0 cada uno: la **ganancia de información** es $0{,}971-0=0{,}971$, la máxima posible con este dataset.

En regresión no hay clases que purificar, sino valores continuos que compactar: el criterio habitual es la **varianza** de cada nodo. Con los pares superficie/precio $(50,150)$, $(60,180)$, $(70,210)$, $(80,240)$, $(90,270)$ (precio en miles), la varianza inicial es $1800$; dividiendo en "superficie $\leq 70$" y "superficie $>70$" baja a una varianza ponderada de $450$, una reducción de $1350$. Cuanto mayor la reducción, mejor la división.

### Cuándo parar y por qué regularizar

Sin límites, la división recursiva podría continuar hasta que cada hoja tuviera una sola observación: el árbol memorizaría el entrenamiento, incluido su ruido. Por eso se fijan condiciones de parada: **pureza máxima** (el nodo ya es homogéneo), **profundidad máxima** o **tamaño mínimo de nodo**. Limitarlas es una forma de **regularización**: reduce la varianza del modelo a costa de un sesgo algo mayor (ver [[generalizacion]] para el equilibrio general entre sesgo y varianza). En un árbol, poca profundidad da sesgo alto —el modelo es demasiado simple para captar el patrón—; demasiada profundidad da varianza alta —el modelo se ajusta a particularidades del conjunto de entrenamiento que no se repiten en datos nuevos—. Otra técnica es la **poda**: construir primero un árbol grande y luego eliminar las ramas que no mejoran el error de validación.

### Un modelo no paramétrico y de enfoque local

A diferencia de una regresión lineal, que ajusta un número fijo de coeficientes $\beta_i$ válidos para todo el espacio de datos (**enfoque global**), un árbol no fija de antemano cuántas divisiones va a hacer: su estructura —y su número de "parámetros"— depende por completo del dataset y de los hiperparámetros de regularización. Por eso se dice que es un **modelo no paramétrico**. Además, cada regla del árbol solo aplica a la región del espacio que le corresponde (**enfoque local**), lo que le permite capturar relaciones no lineales e interacciones entre variables sin que tengas que especificarlas a mano, a cambio de perder la lectura directa de "cuánto pesa cada variable" que sí da un coeficiente de regresión.

## Formalización

**Entropía** de un nodo $S$ (pureza en clasificación):

$$
H(S) = -\sum_{i=1}^C p_i \log_2(p_i)
$$

donde:
- $C$ es el número de clases presentes en el problema.
- $p_i$ es la proporción de observaciones de $S$ que pertenecen a la clase $i$.
- $H(S)=0$ si el nodo es puro (una sola clase); es máxima cuando las clases se reparten a partes iguales.

**Ganancia de información** de una división de $S$ en hijos $S_1,\dots,S_k$:

$$
IG = H(S) - \sum_{j=1}^k \frac{|S_j|}{|S|} H(S_j)
$$

donde:
- $H(S)$ es la entropía del nodo padre antes de dividir.
- $H(S_j)$ es la entropía de cada nodo hijo.
- $|S_j|/|S|$ es el peso de cada hijo según su tamaño relativo: los hijos más grandes pesan más.

**Índice de Gini**, alternativa a la entropía con el mismo papel:

$$
Gini(S) = 1 - \sum_{i=1}^C p_i^2
$$

donde $C$ y $p_i$ son los mismos que en la entropía; $Gini(S)=0$ si $S$ es puro, y penaliza algo menos las clases dominantes que la entropía.

**Varianza** de un nodo (pureza en regresión):

$$
\text{Varianza}(S) = \frac{1}{|S|} \sum_{i=1}^{|S|} (y_i - \bar y)^2
$$

donde:
- $y_i$ son los valores de la variable objetivo de las observaciones del nodo $S$.
- $\bar y$ es su media.
- La división elegida es la que más reduce la varianza ponderada de los hijos, el equivalente en regresión a maximizar $IG$.

**Compromiso sesgo-varianza**, la razón matemática para regularizar:

$$
\text{Error total} = \text{Sesgo}^2 + \text{Varianza} + \text{Error irreducible}
$$

donde sesgo y varianza tienen el sentido general de [[generalizacion]]; el error irreducible es el ruido propio del dataset, que ningún modelo puede eliminar.

## Interactivo

```widget
motor: dispersion2d
modo: arbol
dataset: {"generador": "xor", "n": 150, "ruido": 0.15, "clases": 2, "semilla": 4}
controles: [{"nombre": "profundidad", "min": 1, "max": 6, "paso": 1, "valor": 2, "etiqueta": "profundidad máxima"}]
```

- Prueba a subir la profundidad máxima de 1 a 6 y observa cómo las regiones coloreadas se ajustan cada vez más a puntos sueltos, en vez de a los bloques generales.
- Prueba a dejar la profundidad en 1 o 2 y compara la impureza (Gini/entropía) de cada nodo con la que queda al llegar a profundidad 6: ¿cuánto baja realmente a partir de cierto punto?
- Prueba a cambiar la semilla del dataset y comprueba si la primera división (el nodo raíz) sigue usando la misma variable y un umbral parecido.

## En código

```python
import numpy as np
from sklearn.tree import DecisionTreeClassifier

X = np.array([[25], [30], [35], [40], [50]])  # edad
y = np.array(['No', 'No', 'Si', 'Si', 'Si'])   # compra

clf = DecisionTreeClassifier(criterion='entropy', max_depth=1, random_state=0)
clf.fit(X, y)
print(clf.tree_.threshold[0])     # 32.5: divide entre 30 y 35
print(clf.predict([[28], [45]]))  # ['No' 'Si']
```

## Errores típicos

- **Error**: pensar que un árbol muy profundo es siempre mejor porque baja el error de entrenamiento. → **Correcto**: sin límites, memoriza el ruido y generaliza peor; hay que limitar `max_depth`, `min_samples_leaf` o podar.
- **Error**: creer que hay que escalar o normalizar las variables antes de entrenar un árbol. → **Correcto**: los árboles dividen por umbrales variable a variable, no por distancias, así que la escala de los datos no cambia el resultado.
- **Error**: confundir el índice de Gini de un árbol con el coeficiente de Gini de desigualdad económica. → **Correcto**: comparten nombre, pero aquí $Gini(S)$ mide la probabilidad de clasificar mal una observación elegida al azar del nodo, no una desigualdad de ingresos.
- **Error**: tratar un árbol como un modelo paramétrico con pocos coeficientes, igual que una regresión. → **Correcto**: es no paramétrico; su número de nodos y umbrales depende del dataset y de los hiperparámetros de regularización, no de una fórmula fija de antemano.

## En resumen

- **Qué hace**: aprende reglas jerárquicas si/entonces que dividen los datos en regiones cada vez más puras, para clasificar o predecir un valor.
- **Cómo funciona**: en cada nodo prueba todas las variables y umbrales posibles → elige la división con mayor ganancia de homogeneidad (menos entropía/Gini en clasificación, menos varianza en regresión) → repite en cada hijo hasta una condición de parada.
- **Fórmula clave**: ganancia de información $IG = H(S) - \sum_j \frac{|S_j|}{|S|}H(S_j)$; en regresión, el equivalente es reducir la varianza ponderada de los hijos.
- **Hiperparámetros que importan**: `max_depth`, `min_samples_split`, `min_samples_leaf` (regularización) y `criterion` (gini o entropy).
- **Cuándo usarlo**: necesitas un modelo interpretable que mezcle variables numéricas y categóricas sin preprocesar, o quieres una línea base rápida.
- **Cuándo no**: si buscas la máxima precisión posible, un árbol individual rara vez gana a un conjunto de árboles ([[bagging-random-forest]]).
- **Trampa principal**: sin restricciones, un árbol crece hasta memorizar el entrenamiento (varianza alta, sobreajuste); la profundidad máxima y el tamaño mínimo de nodo son la primera defensa.

## A fondo

### Ventajas y límites

La mayor ventaja de un árbol es su **interpretabilidad**: cada predicción se sigue paso a paso desde la raíz, algo valioso en medicina, finanzas o cualquier contexto donde haya que justificar una decisión. Es además **versátil** (clasificación y regresión) y maneja **datos categóricos y numéricos** sin necesidad de codificarlos ni escalarlos.

Sus límites son igual de reales: es **propenso al sobreajuste** sin regularización, es **sensible a datasets pequeños** (unos pocos valores atípicos pueden desviar una división entera) y, en problemas complejos, suele quedar **por detrás de los ensembles** de árboles ([[bagging-random-forest]], [[boosting]]).

### Poda y parada anticipada

La **poda** (*pruning*) construye primero un árbol grande y sin restricciones y luego elimina las ramas cuyo aporte al error de validación es pequeño o negativo, evaluando el impacto de cada rama en esa métrica. Es distinta de la **parada anticipada**, que fija de antemano un umbral mínimo de ganancia de homogeneidad o un mínimo de observaciones por hoja para no llegar a crear esas ramas. En la práctica, `scikit-learn` ofrece ambas vías: parada anticipada vía `max_depth`, `min_samples_split`, `min_samples_leaf` o `max_leaf_nodes`, y poda por complejidad de coste vía `ccp_alpha`.

### Diagnosticar sesgo y varianza en la práctica

Si el modelo rinde mal tanto en entrenamiento como en prueba, es subajuste: sube `max_depth` o baja `min_samples_leaf`/`min_samples_split`. Si rinde muy bien en entrenamiento pero mal en prueba, es sobreajuste: limita `max_depth` o sube `min_samples_leaf`/`min_samples_split`. En datasets desbalanceados, `class_weight='balanced'` evita que el árbol ignore la clase minoritaria (ver [[desbalanceo]]).

### Más allá de un único árbol

Un árbol individual es una excelente línea base: rápido de entrenar, fácil de leer y útil para saber si los datos son separables. Cuando su rendimiento no basta, la vía habitual es combinarlo con otros árboles: [[bagging-random-forest|bagging y Random Forest]] para reducir su varianza, o [[boosting]] para reducir su sesgo.

## Autoevaluación

### Un árbol sin restricciones logra 100 % de exactitud en entrenamiento pero solo 62 % en prueba. ¿Qué es y qué harías?
- [ ] Subajuste: aumentar `max_depth` para captar más patrones.
- [x] Sobreajuste: limitar la profundidad, aumentar `min_samples_leaf` o podar.
- [ ] Los datos están mal etiquetados; el modelo no tiene la culpa.
> Por qué: un árbol que memoriza el entrenamiento (100 %) pero falla en datos nuevos tiene varianza alta. La solución es regularizar, no dar más libertad al árbol.

### Un nodo tiene 10 observaciones, todas de la misma clase. ¿Cuánto vale su entropía?
- [x] 0: el nodo es completamente puro.
- [ ] 1: máxima incertidumbre.
- [ ] Depende del umbral que se use para dividirlo.
> Por qué: la entropía mide desorden de clases dentro del nodo; si todas las observaciones son de la misma clase, no hay incertidumbre que resolver.

### Divides un dataset de frutas por Color y los tres grupos resultantes quedan perfectamente homogéneos; divides por Peso exacto (en gramos) y obtienes muchos grupos diminutos con clases mezcladas. ¿Qué división elegirá el algoritmo?
- [x] Color, porque su ganancia de homogeneidad es mayor.
- [ ] Peso, porque genera más grupos y eso siempre reduce la entropía media.
- [ ] Cualquiera de las dos: el algoritmo no distingue entre ellas.
> Por qué: el algoritmo compara todas las divisiones posibles por su ganancia de homogeneidad, no por cuántos grupos generan; Peso da grupos mezclados y aporta poca información real.

### ¿Por qué no hace falta escalar las variables antes de entrenar un árbol de decisión, a diferencia de KNN o SVM?
- [x] Porque cada división compara una variable contra un umbral, no calcula distancias entre puntos.
- [ ] Porque `scikit-learn` escala los datos automáticamente al llamar a `fit`.
- [ ] Porque los árboles solo admiten variables ya categorizadas.
> Por qué: un árbol pregunta "¿esta variable es mayor que este umbral?" de una en una; el rango de otra variable no influye en esa comparación, así que la escala es irrelevante.

### En un árbol de regresión de precios de vivienda, ¿qué mide exactamente la reducción de varianza al evaluar una división?
- [x] Cuánto se compactan los precios alrededor de la media de cada nodo hijo.
- [ ] Cuántas hojas tendrá el árbol final.
- [ ] La correlación entre las variables predictoras.
> Por qué: en regresión no hay clases que purificar; el criterio es que los valores de cada nodo hijo queden lo más cerca posible de su propia media, igual que la entropía busca clases puras en clasificación.

## Glosario

- **Nodo raíz**: primer nodo de un árbol, donde arranca la primera división.
- **Nodo hoja**: nodo terminal que ya no se divide y da el resultado final (una clase o un valor).
- **Profundidad**: número máximo de niveles entre la raíz y una hoja.
- **Entropía**: medida de desorden de clases en un nodo; vale 0 si es puro y sube cuanto más mezcladas están las clases.
- **Índice de Gini**: probabilidad de clasificar mal una observación elegida al azar del nodo; alternativa a la entropía con el mismo papel.
- **Ganancia de información**: reducción de entropía (o de varianza, en regresión) que logra una división.
- **Poda**: eliminar ramas de un árbol ya construido para reducir su sobreajuste.
- **Modelo no paramétrico**: modelo cuyo número de parámetros no está fijado de antemano, sino que depende de los datos y de los hiperparámetros usados para entrenarlo.
