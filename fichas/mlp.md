---
id: mlp
estado: borrador
---

## En una frase
Una red multicapa (MLP) apila varias neuronas en capas ocultas entre la entrada y la salida, lo que le permite aprender fronteras de decisión no lineales que un único perceptrón no puede representar.

## Intuición
Piensa en una cadena de montaje: cada estación recibe la pieza que le pasa la anterior, la transforma un poco más y se la entrega a la siguiente, hasta obtener el producto final. Una red multicapa funciona igual: cada capa oculta recibe los valores de la capa anterior, los combina y transforma, y se los pasa a la siguiente, cada vez con representaciones más abstractas.

Esto resuelve el problema que bloqueaba al [[perceptron|Perceptrón]]: una única estación (una sola neurona) solo puede trazar una línea recta de decisión. Pero si combinas dos líneas rectas en una primera estación y las mezclas en una segunda, puedes construir fronteras curvas o quebradas, como la que exige la función XOR. Añadir capas no es solo "más de lo mismo": cambia por completo lo que la red es capaz de aprender.

## Explicación

### De una neurona a una red: por qué hacen falta capas ocultas
El [[perceptron|Perceptrón]] falla ante problemas no linealmente separables como XOR porque solo puede trazar una frontera lineal. La solución no es cambiar la neurona, sino apilarlas: introducir **capas ocultas**, neuronas intermedias que transforman la información antes de llegar a la salida. Una red con al menos una capa oculta y funciones de activación no lineales puede combinar varias fronteras lineales para formar una frontera compleja, resolviendo XOR y problemas mucho más difíciles.

### Arquitectura: capas de entrada, ocultas y salida
Una **red neuronal multicapa (MLP, *Multi-Layer Perceptron*)** se organiza en tres tipos de capas. La **capa de entrada** solo transmite los datos originales, sin transformarlos: cada nodo corresponde a una variable del conjunto de datos. Las **capas ocultas** son donde ocurre el procesamiento real: cada neurona combina las salidas de la capa anterior y aplica una función de activación no lineal, construyendo representaciones cada vez más abstractas cuantas más capas hay. La **capa de salida** produce el resultado final; su número de neuronas depende de la tarea (una neurona para regresión o clasificación binaria, tantas como clases para clasificación multiclase).

### La propagación hacia delante: cómo fluye la información
El proceso de calcular una predicción a partir de una entrada se llama **propagación hacia delante** (*forward pass*). En cada neurona ocurren dos pasos: primero se calcula una suma ponderada de las activaciones de la capa anterior más un sesgo, y después se aplica una función de activación $f$ —sigmoide, ReLU u otra, ver [[funciones-activacion]]— que introduce no linealidad. Este cálculo se repite capa a capa hasta la salida, donde en clasificación multiclase suele aplicarse *softmax* para obtener probabilidades.

### MLP frente a los métodos clásicos
Los métodos clásicos de Machine Learning dependen de la ingeniería de características: una persona decide qué medir antes de entrenar el modelo. Una MLP automatiza esa etapa: sus capas ocultas descubren representaciones útiles directamente de los datos brutos, sin diseño manual, a costa de mayor coste computacional y menor interpretabilidad.

## Formalización
$$
z^{(l)}_i = \sum_j w^{(l)}_{ij} a^{(l-1)}_j + b^{(l)}_i
$$
donde:
- $z^{(l)}_i$ es la suma ponderada (activación neta) de la neurona $i$ en la capa $l$.
- $w^{(l)}_{ij}$ es el peso que conecta la neurona $j$ de la capa $l-1$ con la neurona $i$ de la capa $l$.
- $a^{(l-1)}_j$ es la activación de la neurona $j$ en la capa anterior.
- $b^{(l)}_i$ es el sesgo de la neurona $i$ en la capa $l$.

$$
a^{(l)}_i = f\left(z^{(l)}_i\right)
$$
donde $f$ es la función de activación de la capa $l$ (ver [[funciones-activacion]]).

**Ejemplo numérico.** Con entrada $\mathbf{x}=(1{,}0;\ 0{,}5)$, una capa oculta de 2 neuronas con pesos $\mathbf{W}^{(1)}=\begin{pmatrix}0{,}5 & -0{,}3\\0{,}2 & 0{,}8\end{pmatrix}$, sesgos $\mathbf{b}^{(1)}=(0{,}1;\,-0{,}1)$ y activación sigmoide, se obtiene $\mathbf{z}^{(1)}=(0{,}45;\,0{,}5)$ y $\mathbf{a}^{(1)}=(0{,}6106;\,0{,}6225)$. Con una salida de pesos $\mathbf{w}^{(2)}=(0{,}6;\,-0{,}9)$ y sesgo $0{,}2$, se obtiene $z^{(2)}=0{,}0062$ y $a^{(2)}=0{,}5015$: la predicción final de la red, verificado con `numpy` en `tools/calc.py`.

## Interactivo
```widget
motor: red
modo: "forward"
capas: [2, 2, 1]
activacion: "sigmoide"
entrada: [1, 0.5]
```
- Prueba a cambiar la entrada y observa cómo cambian las activaciones de la capa oculta antes de llegar a la salida.
- Prueba a comparar la salida con activación sigmoide frente a ReLU en la misma red.
- Prueba a fijarte en qué neuronas de la capa oculta contribuyen más a la salida final.

## En código
```python
import numpy as np

def sigmoide(z):
    return 1 / (1 + np.exp(-z))

x = np.array([1.0, 0.5])
W1 = np.array([[0.5, -0.3], [0.2, 0.8]])
b1 = np.array([0.1, -0.1])
W2 = np.array([0.6, -0.9])
b2 = 0.2

a1 = sigmoide(W1 @ x + b1)
a2 = sigmoide(W2 @ a1 + b2)

print(np.round(a1, 4), round(a2, 4))
# [0.6106 0.6225] 0.5015
```

## Errores típicos
- **Error**: Pensar que más capas ocultas siempre mejora la red → **Correcto**: más capas aumentan la capacidad de representación pero también el riesgo de sobreajuste y dificultades de entrenamiento como el desvanecimiento del gradiente.
- **Error**: Creer que la capa de entrada procesa los datos → **Correcto**: la capa de entrada solo transmite los valores originales sin transformación; el procesamiento ocurre en las capas ocultas y de salida.
- **Error**: Usar una única neurona de salida con activación lineal para clasificación multiclase → **Correcto**: la capa de salida debe tener tantas neuronas como clases y usar softmax; una sola neurona lineal es propia de regresión.
- **Error**: Confundir la propagación hacia delante con el proceso de aprendizaje completo → **Correcto**: el forward pass solo calcula la predicción con los pesos actuales; ajustar esos pesos requiere retropropagación ([[backpropagation]]).

## En resumen
- Una MLP apila una capa de entrada, una o más capas ocultas y una capa de salida, cada una totalmente conectada con la siguiente.
- Cada neurona calcula una suma ponderada de sus entradas más un sesgo y le aplica una función de activación no lineal.
- Propagación hacia delante: $z^{(l)}_i=\sum_j w^{(l)}_{ij}a^{(l-1)}_j+b^{(l)}_i$, luego $a^{(l)}_i=f(z^{(l)}_i)$, capa a capa hasta la salida.
- A diferencia de un perceptrón, resuelve problemas no linealmente separables como XOR gracias a las capas ocultas.
- Las decisiones de diseño clave son el número de capas y neuronas, y la función de activación de cada una (ver [[funciones-activacion]]).
- Úsala en datos tabulares o cuando un modelo clásico no capture bien las interacciones entre variables; si los datos son pocos o linealmente separables, un modelo más simple puede bastar.
- La trampa principal: pensar que la capa de entrada ya transforma los datos, cuando en realidad solo los transmite sin cambios.

## A fondo
### Cuándo preferir una MLP frente a un perceptrón o un modelo clásico
Pasar de un perceptrón simple a una MLP tiene sentido con datos no linealmente separables, con interacciones complejas entre variables (por ejemplo, predecir si un cliente comprará un producto según edad, ingresos y frecuencia de compra) o cuando conviene evitar diseñar características a mano. Como contrapartida, una MLP es más difícil de interpretar, necesita más datos para no sobreajustar, más cómputo y más hiperparámetros que ajustar (número de capas, neuronas, tasa de aprendizaje, regularización). No conviene dar ese salto si los datos son linealmente separables, el conjunto es muy pequeño, se necesita un modelo auditable, o el problema es tan simple que no justifica la complejidad extra.

## Autoevaluación

### Con la red del ejemplo (entrada $(1;\,0{,}5)$, $z^{(2)}=0{,}0062$), si la capa de salida usara activación lineal en vez de sigmoide, ¿cuál sería la salida?
- [ ] Seguiría siendo $0{,}5015$, la activación no afecta al resultado final
- [x] $0{,}0062$, el mismo valor que $z^{(2)}$ sin transformar
- [ ] $1$, porque $z^{(2)}$ es positivo
> Por qué: con activación lineal, $a=f(z)=z$; la salida sería directamente $z^{(2)}=0{,}0062$, sin pasar por la sigmoide.

### Si se añade una capa oculta más con el mismo número de neuronas, sin cambiar nada más, ¿qué es más probable que ocurra durante el entrenamiento?
- [ ] El entrenamiento será automáticamente más rápido y estable
- [x] El modelo tendrá más capacidad de representación, pero también más riesgo de sobreajuste
- [ ] La red dejará de poder resolver problemas no lineales
> Por qué: cada capa añadida aumenta el número de parámetros y la capacidad de aprender relaciones complejas, pero con ello crece también el riesgo de memorizar el conjunto de entrenamiento en vez de generalizar.

### Un compañero dice: "la capa de entrada de mi MLP tiene 10 neuronas porque aplica 10 transformaciones distintas a los datos". ¿Qué es incorrecto en esa afirmación?
- [x] La capa de entrada no transforma nada: 10 neuronas solo significa que hay 10 variables de entrada
- [ ] Nada, es una descripción correcta del funcionamiento de la capa de entrada
- [ ] El error es que debería tener 10 capas, no 10 neuronas
> Por qué: la capa de entrada únicamente transmite cada valor de entrada a la siguiente capa; el número de neuronas ahí coincide con el número de variables, no con transformaciones aplicadas.

### ¿Qué distingue a una MLP de un perceptrón simple frente al problema XOR?
- [x] La MLP puede combinar varias fronteras lineales en su capa oculta para formar una frontera no lineal
- [ ] La MLP usa una tasa de aprendizaje distinta que sí resuelve XOR
- [ ] No hay diferencia real, ambas fallan igual con XOR
> Por qué: el perceptrón traza una única frontera lineal, insuficiente para XOR; la capa oculta de una MLP combina varias fronteras lineales en algo no lineal, lo que sí resuelve el problema.

## Glosario
- **capa oculta**: conjunto de neuronas entre la entrada y la salida que transforman los datos progresivamente, sin observarse directamente desde fuera de la red.
- **propagación hacia delante**: también llamada *forward pass*, es el proceso de calcular la salida de una red a partir de una entrada y los pesos actuales, capa a capa.
- **capa totalmente conectada**: también llamada *fully connected*, es una capa en la que cada neurona recibe la salida de todas las neuronas de la capa anterior.
