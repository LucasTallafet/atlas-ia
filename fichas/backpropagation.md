---
id: backpropagation
estado: borrador
---

## En una frase
La retropropagación calcula, mediante la regla de la cadena, cuánto contribuye cada peso de una red al error final, para poder ajustarlo con descenso de gradiente.

## Intuición
Imagina una empresa donde un pedido sale mal y hay que averiguar qué departamento tiene la culpa: primero se detecta el fallo en atención al cliente, y desde ahí se rastrea hacia atrás por logística, producción y compras, repartiendo la responsabilidad según cuánto contribuyó cada uno al error final. La retropropagación hace exactamente eso en una red neuronal: parte del error medido a la salida y lo va repartiendo hacia atrás, capa por capa, para saber cuánto tiene que ajustarse cada peso.

Sin este mecanismo, sería inviable entrenar una red con capas ocultas: nadie sabría si un peso de la primera capa es responsable de un error que solo se observa muchas transformaciones después, en la salida.

## Explicación

### El problema: ¿cómo repartir la culpa del error entre todos los pesos?
En una [[mlp|MLP]], cada peso influye en la predicción final a través de una cadena de transformaciones. La función de pérdida mide la discrepancia entre la predicción y el valor real, y el aprendizaje consiste en ajustar los pesos para minimizarla. La pregunta clave es cómo saber cuánto y en qué dirección ajustar cada peso individual, cuando su efecto en el error pasa por varias capas intermedias.

### Dos fases: hacia delante y hacia atrás
El algoritmo de **retropropagación** (*backpropagation*), formalizado en los años 80 por Rumelhart, Hinton y Williams, resuelve esto en dos fases. Primero, la **propagación hacia delante** calcula la predicción de la red y, con ella, el valor de la función de pérdida. Después, la **propagación hacia atrás** calcula el gradiente de esa pérdida respecto a cada peso, aplicando la [[regla-cadena|regla de la cadena]] del cálculo diferencial, y distribuye el error desde la salida hacia las capas anteriores. Finalmente, cada peso se actualiza en la dirección opuesta a su gradiente mediante [[descenso-gradiente|descenso de gradiente]], con un tamaño de paso controlado por la tasa de aprendizaje $\eta$.

### Aplicando la regla de la cadena capa a capa
Como cada neurona recibe información de la capa anterior y transmite su activación a la siguiente, el efecto de un peso sobre la pérdida se descompone en un producto de derivadas parciales: cuánto cambia la pérdida si cambia la activación de una neurona, cuánto cambia esa activación si cambia su entrada neta, y cuánto cambia esa entrada neta si cambia el peso. Multiplicando esos tres factores se obtiene el gradiente exacto de ese peso, sin tener que recalcular la red entera para cada uno.

### Desvanecimiento y explosión del gradiente
En redes con muchas capas, este producto de derivadas puede volverse problemático. Si las derivadas son pequeñas —como ocurre con la sigmoide, ver [[funciones-activacion]]—, el producto de muchas de ellas tiende rápidamente a 0: es el **desvanecimiento del gradiente**, que impide que las primeras capas aprendan. Si, en cambio, las derivadas son grandes, el producto puede crecer sin control: es la **explosión del gradiente**, que provoca actualizaciones inestables. Usar ReLU en lugar de sigmoide, o normalizar las activaciones por lotes, son formas habituales de mitigar ambos problemas (ver [[entrenamiento-dl]]).

## Formalización
$$
w_{ij}^{(l)} \leftarrow w_{ij}^{(l)} - \eta \frac{\partial L}{\partial w_{ij}^{(l)}}
$$
donde:
- $w_{ij}^{(l)}$ es el peso entre la neurona $j$ de la capa $l-1$ y la neurona $i$ de la capa $l$.
- $\eta$ es la tasa de aprendizaje.
- $L$ es la función de pérdida, cuyo gradiente indica la dirección de ajuste.

$$
\frac{\partial L}{\partial w_{ij}^{(l)}} = \frac{\partial L}{\partial a_i^{(l)}} \cdot \frac{\partial a_i^{(l)}}{\partial z_i^{(l)}} \cdot \frac{\partial z_i^{(l)}}{\partial w_{ij}^{(l)}}
$$
donde:
- $\partial L / \partial a_i^{(l)}$ mide el impacto de la activación de la neurona en la pérdida total.
- $\partial a_i^{(l)} / \partial z_i^{(l)}$ es la derivada de la función de activación de esa neurona.
- $\partial z_i^{(l)} / \partial w_{ij}^{(l)}$ es la activación $a_j^{(l-1)}$ que llega por esa conexión.

**Ejemplo numérico.** Para una red de un solo par entrada-salida con activación sigmoide, $x=1$, $y_{\text{real}}=1$, $w_1=0{,}5$, $b_1=0$, $w_2=0{,}8$, $b_2=0$ y $\eta=0{,}5$: el forward pass da $a_1=0{,}6225$, $a_2=0{,}622$ y pérdida $L=0{,}0714$. Los gradientes son $\partial L/\partial w_2=-0{,}0553$ y $\partial L/\partial w_1=-0{,}0167$; tras un paso de retropropagación, $w_2=0{,}8277$ y $w_1=0{,}5084$, y la pérdida baja a $0{,}0698$. Verificado con `numpy` en `tools/calc.py`.

## Interactivo
```widget
motor: red
modo: "backprop"
capas: [1, 1, 1]
activacion: "sigmoide"
entrada: [1]
objetivo: [1]
```
- Prueba a ejecutar varios pasos seguidos de retropropagación y observa cómo baja la pérdida en cada uno.
- Prueba a comparar el tamaño del gradiente en la primera capa frente a la última.
- Prueba a cambiar la activación a sigmoide en una red con más capas y observa cómo el gradiente se hace cada vez más pequeño en las primeras.

## En código
```python
import numpy as np

def sig(z):
    return 1 / (1 + np.exp(-z))

x, y_real = 1.0, 1.0
w1, b1, w2, b2, eta = 0.5, 0.0, 0.8, 0.0, 0.5

a1 = sig(w1 * x + b1)
a2 = sig(w2 * a1 + b2)
L = 0.5 * (y_real - a2) ** 2

grad_w2 = -(y_real - a2) * a2 * (1 - a2) * a1
grad_w1 = -(y_real - a2) * a2 * (1 - a2) * w2 * a1 * (1 - a1) * x

w2 -= eta * grad_w2
w1 -= eta * grad_w1

print(round(w1, 4), round(w2, 4))
# 0.5084 0.8277 -> tras un paso, la pérdida baja de 0.0714 a 0.0698
```

## Errores típicos
- **Error**: Pensar que la retropropagación es un algoritmo de optimización distinto del descenso de gradiente → **Correcto**: la retropropagación solo calcula los gradientes; el [[descenso-gradiente|descenso de gradiente]] es el que usa esos gradientes para actualizar los pesos.
- **Error**: Creer que el gradiente de cada peso depende solo de la conexión que lo une → **Correcto**: por la regla de la cadena, el gradiente de un peso en una capa profunda depende de todas las derivadas de las capas posteriores hasta la salida.
- **Error**: Suponer que el desvanecimiento del gradiente es un fallo del algoritmo de retropropagación → **Correcto**: es consecuencia de multiplicar muchas derivadas pequeñas, por ejemplo de la sigmoide; se mitiga cambiando de activación, no cambiando el algoritmo.
- **Error**: Pensar que hay que recalcular el forward pass completo para cada peso al calcular su gradiente → **Correcto**: la retropropagación reutiliza los cálculos ya hechos de las capas posteriores para no repetir trabajo.

## En resumen
- La retropropagación calcula el gradiente de la pérdida respecto a cada peso de la red, propagando el error desde la salida hacia la entrada.
- Funciona en dos fases: propagación hacia delante (calcular la predicción) y propagación hacia atrás (calcular gradientes con la regla de la cadena).
- Fórmula clave: $w_{ij}^{(l)} \leftarrow w_{ij}^{(l)} - \eta\, \partial L/\partial w_{ij}^{(l)}$, con el gradiente descompuesto en un producto de derivadas parciales.
- Es imprescindible para entrenar cualquier red con capas ocultas; sin ella, ajustar los pesos a mano sería inviable.
- Su principal reto es el desvanecimiento o la explosión del gradiente en redes muy profundas, mitigados con ReLU o normalización por lotes.
- La trampa principal: confundir "calcular el gradiente" (retropropagación) con "usar el gradiente para actualizar pesos" (el optimizador, ver [[optimizadores]]).

## A fondo
### Contexto histórico
La retropropagación se formalizó en 1986 por Rumelhart, Hinton y Williams, aunque la idea de aplicar la regla de la cadena para entrenar redes ya circulaba antes en distintas formas. Su popularización, junto con la llegada de las redes multicapa, ayudó a revivir el interés en las redes neuronales tras el parón que había provocado la limitación del perceptrón simple ante XOR. Hoy es el mecanismo detrás del entrenamiento de prácticamente cualquier arquitectura moderna con capas.

## Autoevaluación

### Usando el ejemplo numérico, tras un paso de retropropagación la pérdida bajó de $0{,}0714$ a $0{,}0698$. Si en vez de $\eta=0{,}5$ se usara $\eta=0$, ¿qué pasaría con los pesos?
- [x] No cambiarían: la actualización $w \leftarrow w - \eta \cdot \text{gradiente}$ con $\eta=0$ deja los pesos igual
- [ ] Cambiarían igual que con $\eta=0{,}5$, porque el gradiente no depende de $\eta$
- [ ] Se irían a 0 directamente
> Por qué: la tasa de aprendizaje multiplica al gradiente antes de restarlo; con $\eta=0$ el término de ajuste es 0 y los pesos no se mueven, aunque el gradiente calculado por retropropagación sea el mismo.

### En una red con 20 capas ocultas, todas con activación sigmoide, ¿qué es más probable que le pase al gradiente en la primera capa comparado con la última?
- [x] Será mucho menor, porque se multiplican muchas derivadas de sigmoide, todas menores que 1
- [ ] Será igual, la retropropagación conserva la magnitud del gradiente en todas las capas
- [ ] Será mayor, porque acumula el error de todas las capas anteriores
> Por qué: por la regla de la cadena, el gradiente de una capa temprana es un producto de muchas derivadas de la sigmoide, todas menores que $0{,}25$; el producto de 20 números pequeños tiende rápidamente a 0 (desvanecimiento del gradiente).

### Un compañero dice: "el gradiente de $w_1$ en mi red de 3 capas se calcula solo con la derivada de la activación de la primera capa". ¿Qué falta en esa afirmación?
- [x] Falta multiplicar también por las derivadas de las capas posteriores, hasta la pérdida en la salida
- [ ] Nada, esa afirmación es correcta
- [ ] Falta incluir la tasa de aprendizaje dentro del cálculo del gradiente
> Por qué: la regla de la cadena encadena las derivadas de todas las capas entre el peso y la salida; el gradiente de un peso en la primera capa depende también de las derivadas de las capas siguientes, no solo de la suya.

### ¿Qué diferencia hay entre la fase de propagación hacia delante y la de propagación hacia atrás en el entrenamiento de una red?
- [x] La primera calcula la predicción y la pérdida; la segunda calcula los gradientes de esa pérdida respecto a los pesos
- [ ] Ambas calculan lo mismo, solo cambia el orden de las capas
- [ ] La propagación hacia atrás actualiza los pesos directamente sin necesidad de gradientes
> Por qué: el forward pass produce la predicción y permite calcular el error; el backward pass usa la regla de la cadena para repartir ese error entre los pesos en forma de gradientes, que después el optimizador usa para actualizarlos.

## Glosario
- **desvanecimiento del gradiente**: fenómeno en el que los gradientes se vuelven casi 0 al propagarse hacia atrás por muchas capas, impidiendo que las primeras capas aprendan.
- **explosión del gradiente**: fenómeno opuesto, en el que los gradientes crecen exponencialmente al propagarse hacia atrás, desestabilizando el entrenamiento.
