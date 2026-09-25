---
id: descenso-gradiente
estado: borrador
---

## En una frase

El descenso de gradiente ajusta los parámetros de un modelo dando pasos pequeños en la dirección que más reduce el error, guiado por el gradiente de la función de coste.

## Intuición

Imagina que estás en mitad de una montaña, de noche y con niebla espesa: no ves el valle, pero sí notas hacia dónde se inclina el suelo bajo tus pies. Si en cada paso avanzas en la dirección de mayor pendiente hacia abajo, acabas llegando al fondo aunque nunca hayas visto el mapa completo.

Eso es el descenso de gradiente: el "suelo" es la función de coste, tus "pies" notan el [[gradiente|gradiente]] en el punto donde estás, y cada paso es una pequeña actualización de los parámetros del modelo. La longitud de cada paso es la tasa de aprendizaje: pasos demasiado cortos tardan una eternidad; pasos demasiado largos pueden hacerte saltar por encima del valle.

## Explicación

### Por qué hace falta un método iterativo

Cuando el modelo es lineal, existe una fórmula cerrada —las ecuaciones normales— que calcula los parámetros óptimos en un solo paso, invirtiendo una matriz. Pero esa inversión se vuelve muy costosa con muchos datos o muchas variables, y no sirve si los datos llegan en flujo continuo. El descenso de gradiente resuelve esto de otra manera: en vez de calcular la solución exacta de golpe, la aproxima poco a poco, dando pasos pequeños guiados por la [[funciones-perdida|función de pérdida]].

### La regla de actualización

En cada paso, el algoritmo mueve cada parámetro en sentido contrario a su derivada parcial respecto a la función de coste: si el gradiente es positivo (el coste crece al aumentar el parámetro), lo reduce; si es negativo, lo aumenta. El tamaño del paso lo controla la **tasa de aprendizaje** ($\alpha$ o $\eta$).

### Qué pasa si la tasa de aprendizaje está mal elegida

Una tasa de aprendizaje demasiado pequeña hace que el algoritmo converja con muchísima lentitud: cada paso apenas avanza. Una tasa demasiado grande puede hacer que el algoritmo oscile alrededor del mínimo sin asentarse, o incluso que diverja, alejándose cada vez más de la solución. Encontrar un valor intermedio —ni tan cauto ni tan atrevido— es la decisión más importante al usar este método.

### Variantes para grandes volúmenes de datos

El **descenso de gradiente estocástico (SGD)** actualiza los parámetros con un solo ejemplo o un lote pequeño en cada paso, en vez de recorrer todo el conjunto de datos; esto lo hace mucho más rápido en datasets grandes y le permite adaptarse a datos que llegan en tiempo real. Variantes más sofisticadas, como *momentum*, RMSprop o Adam, ajustan dinámicamente el tamaño del paso según la forma de la función de coste, y son las que usa en la práctica la retropropagación de las redes neuronales.

## Formalización

$$
\theta_j \leftarrow \theta_j - \alpha \frac{\partial J}{\partial \theta_j}
$$

donde:

- $\theta_j$ es el parámetro que se está actualizando.
- $\alpha$ es la tasa de aprendizaje.
- $\dfrac{\partial J}{\partial \theta_j}$ es la derivada parcial de la función de coste respecto a ese parámetro.

**Ejemplo**: tres puntos casi alineados según $y=2x+1$: $x=[1,2,3]$, $y=[3,5,7]$. Partiendo de $\beta_0=\beta_1=0$ y con $\alpha=0{,}1$, en la primera iteración el gradiente respecto a $\beta_0$ vale $-10$ y respecto a $\beta_1$ vale $-22{,}67$, así que los parámetros suben a $\beta_0=1$, $\beta_1=2{,}267$. Repitiendo el cálculo una segunda vez, los parámetros quedan en $\beta_0=0{,}893$, $\beta_1=2{,}018$: cada vez más cerca de la recta $y=1+2x$ que mejor ajusta estos tres puntos.

## Interactivo

```widget
motor: descenso
modo: lr
superficie: "x^2 + 3*y^2"
inicio: [1.5, 1.0]
lr: 0.1
optimizadores: ["sgd"]
rango: [-2, 2, -2, 2]
```

- Prueba a subir la tasa de aprendizaje poco a poco: primero converge más rápido, pero a partir de cierto valor empieza a oscilar.
- Prueba a subirla aún más hasta que el punto se aleje del mínimo en vez de acercarse: eso es la divergencia.
- Prueba a bajarla mucho: el punto llega al mínimo, pero necesita muchos más pasos.

## En código

```python
import numpy as np

x = np.array([1.0, 2.0, 3.0])
y = np.array([3.0, 5.0, 7.0])
b0, b1, lr = 0.0, 0.0, 0.1

for _ in range(2):
    pred = b0 + b1 * x
    error = y - pred
    g0 = -2 / len(x) * np.sum(error)
    g1 = -2 / len(x) * np.sum(x * error)
    b0 -= lr * g0
    b1 -= lr * g1

print(f"b0={b0:.4f}, b1={b1:.4f}")
# b0=0.8933, b1=2.0178
```

## Errores típicos

- **Error**: pensar que el descenso de gradiente encuentra el óptimo exacto en pocos pasos. → **Correcto**: da una solución aproximada que mejora poco a poco; suele hacer falta un número elevado de iteraciones.
- **Error**: subir la tasa de aprendizaje cuando el entrenamiento va lento, sin límite. → **Correcto**: por encima de cierto valor, el algoritmo empieza a oscilar o a diverger en vez de converger más rápido.
- **Error**: confundir el descenso de gradiente por lotes completos con el estocástico (SGD). → **Correcto**: el primero usa todos los datos en cada paso; el SGD usa un ejemplo o un lote pequeño, lo que lo hace mucho más rápido con datos grandes.
- **Error**: usar siempre descenso de gradiente aunque el problema sea pequeño. → **Correcto**: con pocos datos, la solución cerrada (ecuaciones normales) suele ser más rápida y exacta.

## En resumen

- **Qué hace y para qué sirve**: ajusta los parámetros de un modelo dando pasos progresivos en la dirección que reduce el error, cuando no hay o no conviene usar una fórmula exacta.
- **Cómo funciona en pasos**: calcula el gradiente de la función de coste respecto a cada parámetro, mueve el parámetro en sentido contrario, y repite hasta que el coste deja de bajar.
- **Fórmula clave**: $\theta_j \leftarrow \theta_j - \alpha\,\partial J/\partial\theta_j$.
- **Cuándo usarlo**: con muchos datos, datos en flujo continuo o infraestructura distribuida; para conjuntos pequeños suele bastar la solución cerrada (OLS).
- **Decisión que importa**: la tasa de aprendizaje $\alpha$, que equilibra velocidad de convergencia y riesgo de oscilar o diverger.
- **Trampa principal**: pensar que subir la tasa de aprendizaje siempre acelera el entrenamiento; a partir de cierto punto lo desestabiliza.

## A fondo

La comparación entre el método de mínimos cuadrados (OLS) y el descenso de gradiente resume bien cuándo conviene cada uno. OLS da una solución exacta en un solo cálculo y es rápido y estable en conjuntos de datos pequeños o medianos, pero su coste crece mucho al invertir una matriz cada vez más grande, lo que lo hace poco práctico con datos masivos. El descenso de gradiente, en cambio, evita esa inversión: escala mejor a datos grandes, se adapta a datos que llegan en flujo continuo sin recalcular todo desde cero, y puede repartirse entre varios nodos de cómputo en sistemas distribuidos. A cambio, necesita más iteraciones y su resultado depende de una tasa de aprendizaje bien elegida.

En redes neuronales, el mismo principio se aplica capa a capa mediante la retropropagación, y el ascenso de gradiente —la misma idea pero maximizando en vez de minimizando— aparece también en aprendizaje por refuerzo, como verás en [[policy-gradient]].

## Autoevaluación

### Con una tasa de aprendizaje demasiado alta, ¿qué es más probable que ocurra?
- [ ] Que el algoritmo tarde mucho pero llegue exactamente al mínimo.
- [x] Que el algoritmo oscile o incluso diverja, alejándose del mínimo.
- [ ] Que el algoritmo encuentre la solución exacta en un solo paso.
> Por qué: pasos demasiado grandes pueden saltar por encima del mínimo una y otra vez, en vez de acercarse a él.

### Con $x=[1,2,3]$, $y=[3,5,7]$, $\beta_0=\beta_1=0$ y $\alpha=0{,}1$, el gradiente respecto a $\beta_0$ en el primer paso vale $-10$. ¿Qué le ocurre a $\beta_0$?
- [ ] Disminuye, porque el gradiente es negativo.
- [x] Aumenta, porque el algoritmo se mueve en sentido contrario a un gradiente negativo.
- [ ] No cambia en el primer paso.
> Por qué: la actualización es $\beta_0 - \alpha \cdot (-10) = \beta_0 + 1$, así que un gradiente negativo hace que el parámetro aumente.

### ¿Cuándo tiene más sentido usar descenso de gradiente en vez de la solución cerrada (OLS)?
- [ ] Siempre, porque es más exacto que OLS.
- [x] Con conjuntos de datos muy grandes, en flujo continuo o repartidos en varios nodos de cómputo.
- [ ] Solo si el modelo no es lineal.
> Por qué: OLS es preferible con datos pequeños o medianos porque da una solución exacta; el descenso de gradiente compensa su falta de exactitud con mejor escalabilidad.

### ¿Qué diferencia al descenso de gradiente estocástico (SGD) del descenso de gradiente "por lotes completos"?
- [ ] SGD no usa ningún gradiente para actualizar los parámetros.
- [x] SGD actualiza los parámetros con un ejemplo o un lote pequeño, en vez de recorrer todos los datos en cada paso.
- [ ] SGD solo puede usarse en redes neuronales, nunca en regresión lineal.
> Por qué: SGD sustituye el gradiente calculado sobre todo el conjunto por una estimación rápida con pocos ejemplos, lo que acelera cada paso a costa de que la trayectoria sea más ruidosa.

## Glosario

- **Tasa de aprendizaje**: hiperparámetro que controla el tamaño del paso en cada actualización del descenso de gradiente.
- **Descenso de gradiente estocástico (SGD)**: variante que actualiza los parámetros con un ejemplo o un lote pequeño de datos en cada paso, en vez de con todo el conjunto.
- **Ecuaciones normales**: fórmula cerrada que calcula de un solo paso los parámetros óptimos de una regresión lineal, invirtiendo una matriz.
