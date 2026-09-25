---
id: perceptron
estado: borrador
---

## En una frase
Un perceptrón es la neurona artificial más simple: combina entradas con pesos, suma un sesgo y decide entre dos clases según si el resultado supera un umbral.

## Intuición
Piensa en un portero de discoteca que decide si dejar entrar a alguien sumando puntos por distintos criterios —edad, forma de vestir, si viene acompañado— cada uno con su propia importancia, y comparando el total con un umbral mínimo. Si la suma supera el umbral, entra; si no, se queda fuera. Eso es exactamente lo que hace un perceptrón: multiplica cada entrada por un peso que refleja su importancia, suma un sesgo que ajusta lo exigente que es el umbral, y aplica una regla binaria de sí/no sobre el resultado.

Lo interesante no es solo que decida, sino que aprende: si se equivoca con alguien, ajusta ligeramente la importancia que da a cada criterio para no repetir ese error. Esta idea, propuesta en 1958, es el punto de partida de todas las redes neuronales actuales.

## Explicación

### De la neurona biológica a la neurona artificial
Una neurona biológica recibe señales por sus dendritas, las combina y, si la señal es suficientemente fuerte, dispara una respuesta por el axón. La **neurona artificial** simplifica esta idea a una operación matemática: combina un conjunto de entradas $x_i$ ponderadas por unos pesos $w_i$, les suma un sesgo $b$, y pasa el resultado por una función de activación que decide la salida.

### El Perceptrón: cómo decide y cómo aprende
El **Perceptrón**, propuesto por Frank Rosenblatt en 1958, fue el primer modelo funcional de neurona artificial. Usa como función de activación el **escalón**: la neurona se activa (salida 1) si la suma ponderada supera un umbral, y no se activa (salida 0) en caso contrario. Esto lo convierte en un clasificador binario.

El Perceptrón aprende de forma iterativa y solo cuando se equivoca: tras clasificar cada ejemplo, compara su predicción con la etiqueta real y, si difieren, ajusta cada peso en la dirección que habría reducido ese error. Este ajuste se repite ejemplo a ejemplo, no una sola vez al final de todo el conjunto de datos.

### Ejemplo numérico: aprendiendo la función OR
Supongamos que queremos que el perceptrón aprenda la función lógica OR, empezando con $w_1=w_2=0$, $b=0$ y $\eta=0{,}1$. Al procesar $(x_1,x_2)=(0,0)$ con salida esperada 0, el perceptrón calcula $z=0$ y, como $\text{step}(0)=1$, se equivoca; el ajuste deja $b=-0{,}1$. Con $(0,1)$, esperado 1, calcula $z=-0{,}1$ y predice 0; el ajuste deja $w_2=0{,}1$, $b=0$. Repitiendo el proceso durante varias épocas —verificado con `tools/calc.py`— los pesos convergen en la 4ª época a $w_1=0{,}1$, $w_2=0{,}1$, $b=-0{,}1$, sin ningún error: la frontera de decisión resultante, $0{,}1x_1+0{,}1x_2-0{,}1\geq 0$, equivale a $x_1+x_2\geq 1$, exactamente la función OR.

### Las limitaciones: separación lineal y el problema XOR
El Perceptrón solo puede resolver problemas **linealmente separables**: aquellos en los que una única recta (o hiperplano, en más dimensiones) separa las dos clases. La función **XOR** es el contraejemplo clásico: no existe ninguna recta que separe correctamente sus cuatro combinaciones. En 1969, Minsky y Papert demostraron matemáticamente esta limitación, lo que llevó a un largo parón en la investigación de redes neuronales hasta la llegada de las redes multicapa ([[mlp]]).

## Formalización
$$
z = w_1 x_1 + w_2 x_2 + \dots + w_n x_n + b
$$
donde:
- $x_i$ es la entrada $i$-ésima.
- $w_i$ es el peso asociado a $x_i$, que determina su importancia.
- $b$ es el sesgo, que desplaza el umbral de activación.
- $z$ es la suma ponderada, previa a la función de activación.

$$
y = f(z) =
\begin{cases}
1, & z \geq 0 \\
0, & z < 0
\end{cases}
$$
donde $y$ es la salida binaria del perceptrón (función escalón sobre $z$).

Regla de actualización de pesos, aplicada tras cada ejemplo:
$$
w_i \leftarrow w_i + \eta (y_{\text{real}} - y_{\text{pred}}) x_i, \qquad b \leftarrow b + \eta (y_{\text{real}} - y_{\text{pred}})
$$
donde:
- $\eta$ es la tasa de aprendizaje, que controla la magnitud del ajuste.
- $y_{\text{real}}$ es la etiqueta real del ejemplo.
- $y_{\text{pred}}$ es la salida calculada por el perceptrón.

## Interactivo
```widget
motor: red
modo: "perceptron"
capas: [2, 1]
activacion: "escalon"
entrada: [1, 0]
objetivo: [1]
```
- Prueba a cambiar la entrada a $(1,1)$ y a $(0,0)$ y comprueba que el perceptrón sigue clasificando correctamente la función OR una vez entrenado.
- Prueba a ajustar los pesos manualmente para que el perceptrón clasifique la función AND en vez de OR.
- Prueba a configurar los datos de XOR y observa por qué ningún conjunto de pesos consigue clasificar las cuatro combinaciones correctamente.

## En código
```python
import numpy as np

X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
y = np.array([0, 1, 1, 1])
w, b, eta = np.zeros(2), 0.0, 0.1
step = lambda z: 1 if z >= 0 else 0

for epoca in range(10):
    errores = 0
    for xi, yi in zip(X, y):
        error = yi - step(np.dot(w, xi) + b)
        w += eta * error * xi
        b += eta * error
        errores += abs(error)
    if errores == 0:
        break

print(w, round(b, 4), epoca + 1)
# [0.1 0.1] -0.1 4  -> converge a la función OR en la 4ª época
```

## Errores típicos
- **Error**: Pensar que el perceptrón usa una función de activación suave como la sigmoide → **Correcto**: el perceptrón original usa la función escalón, que da una salida binaria (0 o 1), no una probabilidad.
- **Error**: Creer que basta con más épocas de entrenamiento para que un perceptrón resuelva XOR → **Correcto**: por muchas épocas que se entrene, un perceptrón de una sola capa nunca separa XOR porque no es un problema linealmente separable.
- **Error**: Confundir el sesgo $b$ con un peso más → **Correcto**: el sesgo desplaza el umbral de decisión y no se multiplica por ninguna entrada; se actualiza con la misma regla pero sin el factor $x_i$.
- **Error**: Suponer que el perceptrón actualiza los pesos al final de cada recorrido completo por los datos → **Correcto**: los actualiza tras cada ejemplo mal clasificado (aprendizaje online), no al terminar la época.

## En resumen
- El perceptrón es la neurona artificial más simple: suma ponderada de entradas más un sesgo, seguida de una función escalón que decide entre dos clases.
- Aprende ajustando pesos solo cuando se equivoca: $w_i \leftarrow w_i + \eta(y_{\text{real}}-y_{\text{pred}})x_i$.
- Solo resuelve problemas linealmente separables: converge en AND y OR, pero nunca encuentra solución para XOR.
- Los hiperparámetros que importan son la tasa de aprendizaje $\eta$ (magnitud de cada ajuste) y el número de épocas.
- Úsalo como base conceptual y en problemas linealmente separables muy simples; para el resto hace falta apilar capas ([[mlp]]).
- La trampa principal: interpretar su fracaso en XOR como un fallo de entrenamiento en vez de una limitación estructural del modelo.

## A fondo
### El contexto histórico y el parón de la investigación
Rosenblatt presentó el Perceptrón en 1958 como el primer modelo de neurona artificial funcional, con una relación directa con la regresión lineal: ambos combinan entradas linealmente, aunque el perceptrón añade la capacidad de clasificar mediante una activación no lineal. En 1969, Minsky y Papert demostraron formalmente su incapacidad para resolver XOR, lo que contribuyó a un largo periodo de menor inversión en redes neuronales hasta que las redes multicapa ([[mlp]]) y la retropropagación ([[backpropagation]]) revivieron el campo en los años 80.

## Autoevaluación

### Dado un perceptrón con $w_1=0{,}5$, $w_2=-0{,}5$, $b=0$, ¿qué clase asigna a la entrada $(x_1=1, x_2=0)$?
- [ ] 0, porque $x_2$ es 0
- [x] 1, porque $z = 0{,}5 \geq 0$
- [ ] No se puede saber sin más entrenamiento
> Por qué: basta calcular $z=w_1x_1+w_2x_2+b=0{,}5\cdot1+(-0{,}5)\cdot0+0=0{,}5$, que al ser $\geq 0$ activa la salida 1 con la función escalón.

### Si se entrena un perceptrón sobre datos de la función AND, ¿qué se espera que ocurra tras suficientes épocas?
- [x] Los pesos convergen y el error de entrenamiento llega a 0
- [ ] Los pesos oscilan indefinidamente sin converger nunca
- [ ] El perceptrón necesita una capa oculta para aprender AND
> Por qué: AND es linealmente separable —una única recta separa $(1,1)$ del resto—, así que el perceptrón converge a una solución con error cero, a diferencia de XOR.

### Un compañero afirma que "para arreglar el problema de XOR basta con usar una tasa de aprendizaje $\eta$ mucho más pequeña". ¿Por qué es un error esa afirmación?
- [ ] Porque un $\eta$ pequeño hace que el perceptrón nunca actualice sus pesos
- [x] Porque el problema es que XOR no es linealmente separable, algo que ningún valor de $\eta$ puede cambiar
- [ ] Porque $\eta$ solo afecta al sesgo, no a los pesos
> Por qué: la tasa de aprendizaje controla la magnitud del ajuste, no la capacidad de representación del modelo; un perceptrón de una capa no puede trazar una frontera no lineal como la que exige XOR, sin importar cómo se ajuste $\eta$.

### ¿En qué se diferencia la regla de actualización del sesgo $b$ de la de un peso $w_i$?
- [x] La del sesgo no se multiplica por ninguna entrada $x_i$
- [ ] La del sesgo usa una tasa de aprendizaje distinta
- [ ] No hay diferencia, el sesgo es un peso más asociado a una entrada igual a 0
> Por qué: $b \leftarrow b + \eta(y_{\text{real}}-y_{\text{pred}})$ no lleva el factor $x_i$ porque el sesgo equivale a una entrada constante igual a 1, no a ninguna entrada real del ejemplo.

## Glosario
- **neurona artificial**: unidad de cálculo que combina entradas ponderadas, les suma un sesgo y aplica una función de activación para producir una salida.
- **sesgo de una neurona**: término $b$, también llamado *bias*, que desplaza el umbral de activación de una neurona sin depender de ninguna entrada.
- **función escalón**: función de activación que devuelve 1 si su entrada es mayor o igual que cero y 0 en caso contrario.
- **separación lineal**: propiedad de un conjunto de datos cuyas clases pueden dividirse con una única recta o hiperplano.
