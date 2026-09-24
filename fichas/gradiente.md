---
id: gradiente
estado: borrador
---

## En una frase

El gradiente reúne todas las derivadas parciales de una función en un vector que apunta hacia donde esa función crece más rápido.

## Intuición

Imagina que estás en una colina, en un punto cualquiera, y quieres saber por dónde subir más deprisa. Si solo pudieras moverte en la dirección este-oeste, mirarías la pendiente en esa dirección; si solo pudieras moverte norte-sur, mirarías esa otra pendiente. El **gradiente** es la brújula que combina ambas pistas y te señala, de entre todas las direcciones posibles, la que hace crecer la altura más rápido.

En un modelo de IA, esa "altura" suele ser el error que comete: el gradiente le dice al algoritmo de entrenamiento en qué dirección, entre miles o millones de parámetros posibles, el error crece más deprisa. Caminar en la dirección contraria es, precisamente, cómo aprende el modelo.

## Explicación

### De una variable a muchas: derivadas parciales

La [[derivada]] mide cómo cambia una función de una sola variable. Pero casi ningún modelo real depende de una sola variable: la función de error de una red neuronal depende de todos sus parámetros a la vez. Para funciones de varias variables, $f(x,y)$, hablamos de **derivadas parciales**: $\partial f/\partial x$ mide cómo cambia $f$ al mover $x$ dejando $y$ fijo, y $\partial f/\partial y$ mide el cambio al mover $y$ dejando $x$ fijo. Cada derivada parcial captura la sensibilidad de la función a **un solo** parámetro, congelando todos los demás.

### El gradiente: todas las sensibilidades en un vector

Al reunir todas las derivadas parciales de una función en un único vector se obtiene el **gradiente**, $\nabla f$. No es un número, sino un vector con tantas componentes como variables tenga la función, y tiene una interpretación geométrica precisa: **apunta en la dirección de máximo crecimiento** de $f$. Dar un paso en la dirección del gradiente aumenta $f$ lo más rápido posible; dar un paso en la dirección contraria la reduce lo más rápido posible.

### Por qué importa en el entrenamiento

Cuando un modelo aprende, ajusta sus parámetros para reducir una **función de error**. El gradiente de esa función, calculado respecto a todos los parámetros a la vez, indica hacia dónde crece el error más deprisa; moverse en sentido contrario —"cuesta abajo"— es la idea central del método llamado [[descenso-gradiente|descenso de gradiente]], que se desarrolla con detalle en su propia ficha. Aquí basta con quedarse con la intuición geométrica: el gradiente es una brújula local, calculada en un punto concreto, que hay que recalcular en cada nuevo punto porque la dirección de mayor pendiente cambia con el terreno.

## Formalización

$$
\nabla f(x_1,x_2,\dots,x_n) = \left(\frac{\partial f}{\partial x_1}, \frac{\partial f}{\partial x_2}, \dots, \frac{\partial f}{\partial x_n}\right)
$$

donde:

- $f(x_1,\dots,x_n)$ es una función de $n$ variables.
- $\partial f/\partial x_i$ es la derivada parcial de $f$ respecto a $x_i$, con las demás variables fijas.
- $\nabla f$ (nabla $f$) es el vector gradiente, con una componente por cada variable.

## Interactivo

```widget
motor: descenso
modo: gradiente
superficie: "x^2 + 3*y^2"
inicio: [2, 1.5]
lr: 0.1
optimizadores: ["sgd"]
rango: [-3, 3, -3, 3]
```

- Prueba a arrastrar el punto inicial y observa cómo cambia la flecha del gradiente en cada posición.
- Prueba a colocar el punto justo en el origen $(0,0)$: ¿qué longitud tiene el gradiente ahí?
- Prueba a comparar la flecha del gradiente con la dirección hacia el mínimo de la superficie: ¿coinciden, o el gradiente solo indica la dirección local?

## En código

```python
def f(x, y):
    return x**2 + 3 * y**2

def gradiente(x, y):
    return (2 * x, 6 * y)  # derivadas parciales: df/dx = 2x, df/dy = 6y

x, y = 2, 1.5
gx, gy = gradiente(x, y)
print("f(2, 1.5) =", f(x, y))        # 10.75
print("gradiente =", (gx, gy))       # (4, 9.0)

lr = 0.1
x2, y2 = x - lr * gx, y - lr * gy    # un paso en sentido contrario al gradiente
print("nuevo punto:", (x2, y2))      # (1.6, 0.6)
print("f nuevo:", f(x2, y2))         # 3.64, menor que 10.75
```

## Errores típicos

- **Error**: pensar que el gradiente es un único número, como una derivada ordinaria. → **Correcto**: es un vector, con una componente (una derivada parcial) por cada variable de la función.
- **Error**: creer que el gradiente apunta directamente hacia el mínimo de la función. → **Correcto**: apunta hacia el máximo crecimiento *local*; seguir su dirección contraria acerca al mínimo paso a paso, pero no señala el mínimo global directamente.
- **Error**: calcular una derivada parcial dejando que las demás variables también cambien. → **Correcto**: cada derivada parcial se calcula manteniendo fijas todas las variables excepto una.

## En resumen

- **Qué es**: el vector formado por todas las derivadas parciales de una función de varias variables.
- **Para qué sirve**: indicar, en un punto concreto, la dirección en la que la función crece más rápido.
- **Cómo se calcula**: una derivada parcial por cada variable, dejando las demás fijas, y se agrupan en un vector.
- **Fórmula clave**: $\nabla f=(\partial f/\partial x_1,\dots,\partial f/\partial x_n)$.
- **Uso en IA**: moverse en sentido contrario al gradiente de la función de error es la base del descenso de gradiente (ver [[descenso-gradiente]]).
- **Trampa principal**: el gradiente es una brújula local, no un mapa completo; hay que recalcularlo en cada nuevo punto.

## A fondo

### El gradiente como generalización directa de la derivada

Cuando una función solo depende de una variable, el gradiente se reduce a la derivada ordinaria: un solo número que indica si la función sube o baja. Al añadir más variables, cada una aporta su propia componente al vector, pero la lógica no cambia: cada componente sigue midiendo "cuánto cambia la función si me muevo un poco en esa dirección, dejando las demás quietas". Por eso el gradiente hereda, componente a componente, toda la intuición ya construida para la derivada de una sola variable.

## Autoevaluación

### Para $f(x,y)=x^2+3y^2$, ¿cuál es el gradiente en el punto $(1,1)$?
- [ ] $(1,3)$
- [x] $(2,6)$
- [ ] $(2,3)$
> Por qué: $\partial f/\partial x = 2x$ y $\partial f/\partial y = 6y$; evaluadas en $(1,1)$ dan $(2,6)$.

### Si el gradiente de la función de error en el punto actual de un modelo es $(0,0)$, ¿qué indica eso sobre ese punto?
- [ ] Que el modelo cometió el mayor error posible.
- [x] Que, localmente, no hay ninguna dirección en la que el error crezca ni decrezca: podría ser un mínimo, un máximo o un punto de silla.
- [ ] Que hay que aumentar la tasa de aprendizaje para seguir avanzando.
> Por qué: un gradiente nulo significa que todas las derivadas parciales son cero en ese punto, es decir, que la función es momentáneamente plana en todas las direcciones; solo un análisis adicional (como la curvatura) distingue si es un mínimo, un máximo o un punto de silla.

### ¿Por qué el descenso de gradiente da pasos "cuesta abajo" en lugar de seguir la dirección del gradiente tal cual?
- [ ] Porque el gradiente apunta siempre en una dirección aleatoria.
- [x] Porque el gradiente apunta hacia el máximo crecimiento de la función, y para reducir el error hay que moverse en sentido contrario.
- [ ] Porque el gradiente solo es válido para funciones de una variable.
> Por qué: por definición, $\nabla f$ señala la dirección de mayor aumento de $f$; si el objetivo es minimizar una función de error, hay que avanzar en la dirección opuesta, $-\nabla f$.

## Glosario

- **Derivada parcial**: derivada de una función de varias variables respecto a una sola de ellas, con las demás fijas ($\partial f/\partial x$).
- **Gradiente**: vector formado por todas las derivadas parciales de una función; apunta en la dirección de máximo crecimiento.
- **Función de error**: función que mide qué tan mal predice un modelo, y que el entrenamiento intenta minimizar.
