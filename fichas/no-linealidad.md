---
id: no-linealidad
estado: borrador
---

## En una frase

Una función definida por tramos se comporta de forma distinta según la zona de entrada, y esos quiebros —tan simples como una "V"— son el origen de las funciones de activación en redes neuronales.

## Intuición

Imagina una hoja de papel con puntos azules y naranjas repartidos de forma que ninguna línea recta pueda separarlos: por ejemplo, un grupo pequeño en el centro rodeado por el otro. Mientras el papel esté plano, no hay recta que valga. Pero si **doblas el papel** por la mitad, puedes hacer que las dos regiones queden en lados opuestos del nuevo pliegue.

Eso es exactamente lo que hace una función definida por **tramos**: cambia de comportamiento en un punto concreto, "doblando" el espacio de los datos hasta que una frontera que antes era imposible se vuelve posible. Esta idea, tan simple como partir una recta en dos mitades con distinta pendiente, es la semilla de las funciones de activación que dan a las redes neuronales su capacidad de curvar fronteras de decisión.

## Explicación

### La primera ruptura de la linealidad

Una función lineal como $f(x)=2x+1$ tiene siempre la misma pendiente: un paso en $x$ produce siempre el mismo cambio en $f(x)$, esté donde esté. Muchos fenómenos no funcionan así: un sistema puede reaccionar fuerte al principio y estabilizarse después, o no responder hasta superar un umbral. La forma más sencilla de capturar eso no es con curvas complicadas, sino con una **función por tramos**: distinto comportamiento en distintas zonas del dominio. El ejemplo más simple es el valor absoluto,

$$
f(x)=\begin{cases}x, & x\ge 0\\ -x, & x<0\end{cases}
$$

una "V" formada por dos tramos lineales unidos en $x=0$. No es lineal —no hay una única pendiente que valga en el dominio entero— pero tampoco es complicada.

### Doblar el espacio: por qué un quiebro separa lo que una recta no puede

Cuando un modelo es puramente lineal, por muchas operaciones que encadene, el resultado sigue siendo equivalente a una única matriz: solo puede rotar, escalar o trasladar los datos, nunca doblarlos. Introducir un tramo —como en $f(x)=|x|$— dobla el plano por la mitad, igual que doblar el papel del ejemplo. Con ese pliegue, un problema que antes era "no separable linealmente" (por ejemplo, un patrón en "V", donde un grupo forma cada lado del quiebro) pasa a resolverse con una única regla lineal por tramo. Esta es también la clave para separar un pequeño círculo central de un anillo que lo rodea, y en general para cualquier frontera curva o cerrada que ninguna recta puede trazar.

### De los tramos a las funciones de activación

En redes neuronales, este mismo principio —aplicar un comportamiento distinto según la zona de entrada— se llama **función de activación**, y es lo que impide que varias capas lineales se colapsen en una sola. La **ReLU** ($\mathrm{ReLU}(x)=\max(0,x)$) es la heredera directa de $|x|$: vale cero en la mitad negativa y crece linealmente en la positiva, un interruptor que "apaga" los valores negativos. La **sigmoide** y la **tangente hiperbólica**, en cambio, no quiebran de golpe: suavizan la transición con una curva en forma de S, útil cuando conviene evitar saltos bruscos. En todos los casos, el objetivo es el mismo: introducir un cambio de régimen que una recta jamás podría representar, y con él, la posibilidad de curvar fronteras de decisión (véase [[funciones]] para las familias de funciones que no dependen de tramos, como la exponencial o la logarítmica).

## Formalización

$$
f(x)=\begin{cases}x, & x\ge 0\\ -x, & x<0\end{cases}
\qquad
\mathrm{ReLU}(x)=\max(0,x)
$$

donde:

- $x$ es la entrada de la función.
- El valor de $x$ decide qué "tramo" (qué regla) se aplica.

$$
\sigma(x)=\frac{1}{1+e^{-x}} \qquad\qquad \tanh(x)=\frac{e^{x}-e^{-x}}{e^{x}+e^{-x}}
$$

donde:

- $\sigma(x)$ es la sigmoide, con rango $(0,1)$.
- $\tanh(x)$ es la tangente hiperbólica, con rango $(-1,1)$ y centrada en el origen.
- $e$ es la base del logaritmo natural.

## Interactivo

```widget
motor: red
modo: xor
capas: [2, 2, 1]
activacion: escalon
entrada: [1, 0]
objetivo: [1]
```

- Prueba a cambiar la entrada a $[0,0]$ y $[1,1]$: en el problema XOR, esas dos deberían dar salida $0$, y $[1,0]$/$[0,1]$ salida $1$.
- Prueba a fijarte en si una sola neurona (sin capa oculta) podría resolver XOR con cualquier activación por tramos.
- Prueba a cambiar la activación y observa cómo varía la forma de la frontera que separa las clases.

## En código

```python
import math

def relu(x): return max(0.0, x)
def sigmoide(x): return 1 / (1 + math.exp(-x))
def tanh(x): return math.tanh(x)

for x in [-2, -0.5, 0, 0.5, 2]:
    print(x, round(relu(x), 3), round(sigmoide(x), 3), round(tanh(x), 3))
# -2   0.0   0.119  -0.964
# -0.5 0.0   0.378  -0.462
# 0    0.0   0.5     0.0
# 0.5  0.5   0.622   0.462
# 2    2     0.881   0.964
```

## Errores típicos

- **Error**: pensar que una función con tramos lineales sigue siendo lineal porque "cada trozo es una recta". → **Correcto**: la linealidad exige una única pendiente en el dominio entero; el cambio de pendiente en el punto de quiebre ya la rompe.
- **Error**: creer que apilar varias capas lineales, sin ninguna activación no lineal entre medias, hace al modelo más expresivo. → **Correcto**: cualquier cadena de transformaciones puramente lineales equivale a una sola; sin activaciones, más capas no añaden capacidad de curvar fronteras.
- **Error**: pensar que la ReLU es "casi lineal" y por tanto no aporta nada nuevo frente a una recta. → **Correcto**: aunque cada uno de sus dos tramos es lineal, el quiebro en $x=0$ es justo lo que le permite doblar el espacio y separar patrones que una recta no puede.

## En resumen

- **Qué es**: una función por tramos aplica una regla distinta según la zona del dominio, en vez de una única fórmula para toda la entrada.
- **Para qué sirve**: romper la linealidad con el gesto más simple posible, permitiendo curvar o "doblar" el espacio de los datos.
- **Ejemplo mínimo**: $f(x)=|x|$, dos tramos lineales unidos en $x=0$.
- **Conexión con IA**: las funciones de activación (ReLU, sigmoide, tanh) son versiones de esta misma idea, y son lo que evita que varias capas lineales se colapsen en una sola.
- **Regla clave**: $\mathrm{ReLU}(x)=\max(0,x)$: apaga los valores negativos, deja pasar los positivos sin cambios.
- **Trampa principal**: una función por tramos no es "casi lineal"; el punto de quiebre es precisamente lo que le da capacidad para separar patrones no lineales.

## A fondo

### Funciones por tramos en la vida cotidiana

La idea de "cambiar de régimen" según el valor de entrada aparece fuera de la IA constantemente: el impuesto sobre la renta aplica un porcentaje distinto según el tramo de ingresos, y un sensor de luz puede dar salida cero hasta que la iluminación supera un umbral, y crecer linealmente a partir de ahí. En ambos casos, distinguir "zonas donde una característica tiene efecto" de "zonas donde no lo tiene" es exactamente lo que una función por tramos formaliza.

## Autoevaluación

### ¿Por qué se considera que $f(x)=|x|$ no es una función lineal, aunque cada uno de sus dos tramos sea una recta?
- [ ] Porque el valor absoluto nunca puede ser negativo.
- [x] Porque no tiene una única pendiente constante en el dominio entero: cambia de signo en $x=0$.
- [ ] Porque incluye el número cero en su definición.
> Por qué: la linealidad exige que la razón de cambio sea la misma para cualquier par de puntos; en $|x|$ la pendiente vale $-1$ a la izquierda de cero y $1$ a la derecha, así que no hay una pendiente única.

### Un modelo apila tres capas, cada una una transformación puramente lineal, sin ninguna activación entre ellas. ¿Qué le pasa a su capacidad de representar fronteras curvas frente a usar una sola capa lineal?
- [ ] Aumenta, porque cada capa añade una nueva dirección de curvatura.
- [x] No cambia: la composición de transformaciones lineales sigue siendo una única transformación lineal, equivalente a una sola capa.
- [ ] Se vuelve automáticamente no lineal por el mero hecho de tener varias capas.
> Por qué: sin una función de activación no lineal entre las capas, el conjunto de operaciones se puede colapsar algebraicamente en una única matriz; es la activación, no el número de capas, lo que introduce los quiebros necesarios para curvar el espacio.

### En el problema XOR, los puntos $(0,0)$ y $(1,1)$ pertenecen a una clase, y $(1,0)$ y $(0,1)$ a la otra. ¿Por qué ninguna única recta los separa?
- [ ] Porque XOR solo tiene sentido con variables booleanas, no con números reales.
- [x] Porque las dos clases están entrelazadas en diagonal: cualquier recta que aísle $(0,0)$ y $(1,1)$ de un lado dejará forzosamente a $(1,0)$ o a $(0,1)$ mal clasificado.
- [ ] Porque hace falta más de dos dimensiones para representar el problema.
> Por qué: geométricamente, las cuatro esquinas del cuadrado unitario alternan de clase en cada vértice adyacente, un patrón que ninguna línea recta puede dividir en dos mitades limpias; hace falta "doblar" el espacio con al menos una activación no lineal en una capa oculta.

## Glosario

- **Función por tramos**: función que aplica una regla distinta según la región del dominio en la que caiga la entrada.
- **ReLU**: *Rectified Linear Unit*, función de activación $\max(0,x)$, cero para entradas negativas y lineal para las positivas.
- **Sigmoide**: función de activación $\sigma(x)=1/(1+e^{-x})$, con salida suave entre 0 y 1.
- **Tangente hiperbólica**: función de activación con salida suave entre $-1$ y $1$, centrada en el origen.
- **Frontera de decisión**: superficie que separa las regiones del espacio de entrada asignadas a cada clase.
