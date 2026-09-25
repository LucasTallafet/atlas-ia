---
id: funciones-activacion
estado: borrador
---

## En una frase
Las funciones de activación introducen no linealidad en una red neuronal, transformando la suma ponderada de cada neurona en la salida que se propaga a la siguiente capa.

## Intuición
Piensa en la activación como el filtro final de cada neurona: decide cuánto de la señal recibida pasa a la siguiente capa y con qué forma. Sin ese filtro, apilar capas no serviría de nada —combinar transformaciones lineales solo da otra transformación lineal, como sumar rectas y seguir obteniendo una recta—. Con un filtro no lineal, en cambio, cada capa puede doblar y combinar la información de formas cada vez más ricas, lo que permite a la red aprender patrones complejos.

No todos los filtros son iguales: algunos comprimen suavemente los valores extremos (como una sigmoide, que aplasta todo entre 0 y 1), y otros son casi interruptores (como ReLU, que deja pasar lo positivo tal cual y corta lo negativo). Esa diferencia de comportamiento es la que determina si una red profunda puede entrenarse bien o se queda "atascada".

## Explicación

### Por qué hace falta no linealidad
Como se explica en [[mlp]], cada neurona calcula primero una suma ponderada $z$ y después le aplica una función $f$. Sin esa función, o con una función lineal, componer varias capas equivaldría matemáticamente a una única transformación lineal (la idea general de una **función por tramos** que introduce quiebros se trata en [[no-linealidad]]): ninguna cantidad de capas añadiría capacidad de representación. Las funciones de activación son las que rompen esa limitación.

### Sigmoide y tangente hiperbólica: las primeras activaciones
La **función sigmoide** fue una de las primeras respuestas: comprime cualquier valor de entrada en el rango $(0,1)$, lo que facilita interpretar la salida como una probabilidad. Su problema aparece en redes profundas: para valores de entrada muy grandes o muy pequeños, su derivada se vuelve casi 0, un fenómeno llamado **desvanecimiento del gradiente** que frena el aprendizaje en las primeras capas. La **tangente hiperbólica (tanh)** también tiene forma de S, pero su salida oscila entre $-1$ y $1$ y está centrada en 0, lo que mejora algo la estabilidad del entrenamiento; sin embargo, sigue saturando para valores extremos.

### ReLU: la solución al desvanecimiento del gradiente
La función **ReLU (*Rectified Linear Unit*)** rompe con la forma en S: simplemente devuelve la entrada si es positiva y 0 si es negativa. Su derivada es constante e igual a 1 para valores positivos, lo que evita el desvanecimiento del gradiente en esa región y permite entrenar redes con muchas más capas. Por eso es la opción por defecto en las capas ocultas de la mayoría de las redes profundas actuales.

### Softmax: convertir salidas en probabilidades
En clasificación multiclase, la capa de salida suele usar **softmax**, que convierte un vector de valores en una distribución de probabilidades: cada componente queda entre 0 y 1 y la suma total es siempre 1.

### Qué activación usar en cada capa
La elección depende de dónde esté la neurona y de la tarea. En las capas ocultas, ReLU suele ser la primera opción por su facilidad de entrenamiento. En la capa de salida, la elección depende del problema: sigmoide para clasificación binaria, softmax para clasificación multiclase y una activación lineal para regresión.

## Formalización
$$
\sigma(x) = \frac{1}{1 + e^{-x}}
$$
donde $x$ es la entrada de la neurona y $\sigma(x)$ su salida, acotada en $(0,1)$.

$$
\tanh(x) = \frac{e^x - e^{-x}}{e^x + e^{-x}}
$$
donde $\tanh(x)$ es la salida, acotada en $(-1,1)$.

$$
\text{ReLU}(x) = \max(0, x)
$$

$$
\text{softmax}(z_i) = \frac{e^{z_i}}{\sum_k e^{z_k}}
$$
donde:
- $z_i$ es el valor de la neurona de salida $i$, antes de normalizar.
- $k$ recorre todas las neuronas de la capa de salida.

**Ejemplo numérico.** Para $x=(-2,0,2)$: $\sigma(x)=(0{,}1192;\,0{,}5;\,0{,}8808)$ y $\tanh(x)=(-0{,}964;\,0;\,0{,}964)$; sus derivadas son $\sigma'(x)=(0{,}105;\,0{,}25;\,0{,}105)$ y $\tanh'(x)=(0{,}0707;\,1;\,0{,}0707)$, mucho más pequeñas lejos de 0. Para $z=(2,1,0{,}1)$, $\text{softmax}(z)=(0{,}659;\,0{,}2424;\,0{,}0986)$, que suma 1. Todo verificado con `numpy` en `tools/calc.py`.

## Interactivo
```widget
motor: funcion
modo: "activaciones"
funciones: [{"expr": "1/(1+exp(-x))", "etiqueta": "sigmoide"}, {"expr": "tanh(x)", "etiqueta": "tanh"}, {"expr": "max(0,x)", "etiqueta": "ReLU"}]
x: [-4, 4]
y: [-1.5, 1.5]
```
- Prueba a fijarte en la pendiente de cada curva cerca de $x=3$: ¿cuál se aplana antes, indicando desvanecimiento del gradiente?
- Prueba a comparar el rango de salida de la sigmoide, $(0,1)$, con el de la tanh, $(-1,1)$.
- Prueba a observar qué ocurre con ReLU para valores negativos de $x$.

## En código
```python
import numpy as np

x = np.array([-2.0, 0.0, 2.0])
sigmoide = 1 / (1 + np.exp(-x))
tanh = np.tanh(x)
relu = np.maximum(0, x)

print(np.round(sigmoide, 4))
print(np.round(tanh, 4))
print(relu)
# [0.1192 0.5    0.8808]
# [-0.964  0.     0.964]
# [0. 0. 2.]
```

## Errores típicos
- **Error**: Usar sigmoide en todas las capas ocultas de una red profunda → **Correcto**: su derivada se vuelve casi 0 lejos de cero, provocando desvanecimiento del gradiente; ReLU es la opción habitual en capas ocultas.
- **Error**: Confundir softmax con aplicar sigmoide a cada salida por separado → **Correcto**: softmax normaliza conjuntamente todas las salidas para que sumen 1; aplicar sigmoide a cada una por separado no garantiza esa suma.
- **Error**: Pensar que ReLU no tiene ningún problema → **Correcto**: neuronas con entrada siempre negativa pueden quedar "muertas" (salida y gradiente 0 de forma permanente); existen variantes como Leaky ReLU para mitigarlo.
- **Error**: Elegir la activación de salida igual que la de las capas ocultas por costumbre → **Correcto**: la activación de salida depende del problema (sigmoide para binaria, softmax para multiclase, lineal para regresión), no de lo usado en capas ocultas.

## En resumen
- Las funciones de activación aplican una transformación no lineal a la suma ponderada $z$ de cada neurona: $a=f(z)$.
- Sin ellas, apilar capas equivaldría a una única transformación lineal, sin ganar capacidad de representación.
- Sigmoide y tanh tienen forma de S y saturan —derivada casi 0— para valores extremos, causando desvanecimiento del gradiente.
- ReLU, $\max(0,x)$, evita ese problema en la región positiva y es la opción por defecto en capas ocultas de redes profundas.
- Softmax convierte un vector de valores en una distribución de probabilidades y se usa en la salida de clasificación multiclase.
- Elige la activación de salida según la tarea: sigmoide (binaria), softmax (multiclase), lineal (regresión); en capas ocultas, ReLU salvo razón en contra.
- La trampa principal: usar sigmoide o tanh en redes profundas sin darse cuenta de que ralentiza o bloquea el aprendizaje en las primeras capas.

## A fondo
### La evolución histórica: de la sigmoide a ReLU
La sigmoide fue la primera activación popular porque su salida se interpretaba fácilmente como probabilidad. Al investigar redes más profundas surgió el problema del desvanecimiento del gradiente, que llevó a explorar la tanh como alternativa centrada en 0. Cuando ni siquiera la tanh bastó para entrenar redes con muchas capas, ReLU supuso un cambio radical: al no tener forma sigmoidal, evita la saturación en su región positiva y ha sido clave para el auge de las redes profundas modernas.

## Autoevaluación

### Dada la entrada $z=-5$ en una sigmoide, ¿qué ocurre con su gradiente en ese punto y por qué es relevante para entrenar redes profundas?
- [x] Es prácticamente 0, lo que frena el ajuste de pesos en las primeras capas (desvanecimiento del gradiente)
- [ ] Es igual a 1, el máximo posible para cualquier función de activación
- [ ] No afecta al entrenamiento, porque el gradiente solo importa en la última capa
> Por qué: para valores muy negativos o muy positivos la sigmoide se aplana y su derivada se acerca a 0; al multiplicarse por la regla de la cadena en muchas capas, ese gradiente casi nulo impide que las primeras capas aprendan.

### Si conviertes las salidas $(2, 1, 0{,}1)$ de la capa final con softmax, ¿qué relación deben cumplir las tres probabilidades resultantes?
- [ ] Cada una debe estar entre $-1$ y $1$, igual que con tanh
- [x] Deben sumar exactamente 1, aunque los valores de entrada sean distintos
- [ ] Deben ser todas iguales, softmax reparte la probabilidad por igual
> Por qué: softmax normaliza dividiendo cada exponencial entre la suma de todas, así que el resultado siempre suma 1, sin importar los valores concretos de entrada (aquí: $0{,}659+0{,}2424+0{,}0986=1$).

### Un compañero configura la capa de salida de un clasificador de 5 clases con una única neurona y activación sigmoide. ¿Qué está mal en ese diseño?
- [x] Necesita 5 neuronas de salida con softmax, no 1 neurona con sigmoide
- [ ] Nada, sigmoide funciona igual de bien para cualquier número de clases
- [ ] El error es usar sigmoide en vez de ReLU en la salida
> Por qué: para clasificación multiclase la capa de salida debe tener tantas neuronas como clases y usar softmax para producir una distribución de probabilidades sobre todas ellas; una sola neurona sigmoide solo distingue dos clases.

### ¿En qué se diferencia principalmente ReLU de sigmoide y tanh?
- [x] ReLU no satura para valores positivos, así que su derivada no se desvanece en esa región
- [ ] ReLU también tiene forma de S, pero centrada en 0
- [ ] ReLU y sigmoide son matemáticamente equivalentes salvo por una constante
> Por qué: sigmoide y tanh son funciones acotadas en forma de S que saturan en ambos extremos; ReLU es lineal para valores positivos (derivada constante 1) y 0 para negativos, lo que evita el desvanecimiento del gradiente en la región positiva.

## Glosario
- **saturación**: zona de una función de activación donde su salida cambia muy poco aunque la entrada varíe mucho, con derivada cercana a 0.
