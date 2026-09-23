---
id: derivada
estado: borrador
---

## En una frase

La derivada mide cuánto cambia la salida de una función cuando su entrada cambia un poquito: es la pendiente de la función en un punto.

## Intuición

Imagina que conduces por una carretera de montaña y miras el cuentakilómetros de altitud. Entre dos curvas lejanas solo puedes decir cuánto has subido *de media*. Pero si te fijas en un tramo cada vez más corto, acabas sabiendo lo empinada que es la carretera **justo donde estás**. Eso es la derivada: la inclinación en un punto concreto.

En IA importa por una razón práctica: un modelo aprende moviendo sus parámetros hacia donde su error baja. La derivada es la señal que dice hacia dónde está "cuesta abajo".

## Explicación

### Del cambio medio al cambio instantáneo

Toma una función $f$ y dos entradas cercanas, $x$ y $x+h$. La salida cambia $f(x+h)-f(x)$ mientras la entrada cambia $h$. Su cociente es la **tasa de variación media**: cuánto sube la salida por cada unidad de entrada, pero promediado sobre el tramo.

Si ahora haces $h$ cada vez más pequeño, ese promedio se convierte en el cambio **instantáneo** en $x$. Ese límite es la derivada, $f'(x)$. Geométricamente, es la pendiente de la recta tangente a la curva en el punto $(x, f(x))$.

### Qué dice su signo

- $f'(x) > 0$: la función sube en ese punto.
- $f'(x) < 0$: la función baja.
- $f'(x) = 0$: la función se aplana; puede ser un mínimo, un máximo o una meseta.

Un ejemplo: en la recta $f(x)=2x+1$ la pendiente vale $2$ en todas partes. En la parábola $f(x)=x^2$ no: vale $2$ en $x=1$ y $4$ en $x=2$, porque la curva se empina.

### La derivada como sensibilidad

En un modelo, la derivada responde a una pregunta muy concreta: *si toco un poco este parámetro, ¿cuánto cambia el error?* Una derivada grande significa que el error es muy sensible a ese parámetro; una derivada cercana a cero, que apenas le afecta. Esta lectura es la base de la optimización que verás en [[descenso-gradiente]].

## Formalización

$$
f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}
$$

donde:

- $f(x)$ es la salida de la función para la entrada $x$.
- $h$ es un cambio pequeño en la entrada.
- $\lim_{h \to 0}$ indica que miramos qué ocurre cuando $h$ se acerca a cero sin llegar a serlo.

Reglas básicas que evitan calcular el límite cada vez: la derivada de una constante es $0$; la de $x^n$ es $n x^{n-1}$; y la de una suma es la suma de derivadas, $(f+g)' = f' + g'$.

## Interactivo

```widget
motor: funcion
modo: tangente
funciones: [{"expr": "a*x^2 + b*x", "etiqueta": "f(x)"}]
parametros: [{"nombre": "a", "min": -2, "max": 2, "paso": 0.1, "valor": 1, "etiqueta": "curvatura a"}, {"nombre": "b", "min": -3, "max": 3, "paso": 0.1, "valor": 0, "etiqueta": "pendiente inicial b"}]
x: [-3, 3]
```

- Prueba a mover el punto hasta donde la tangente queda horizontal: ahí $f'(x)=0$.
- Prueba a poner $a=0$: la curva se vuelve una recta y la pendiente deja de depender de $x$.

## En código

```python
import numpy as np

f = lambda x: x**2
x = 2.0
for h in [1, 0.1, 0.01, 0.001]:
    media = (f(x + h) - f(x)) / h
    print(f"h={h:<6} tasa media = {media:.4f}")
# La tasa media se acerca a 4, que es f'(2) = 2·2
```

## Errores típicos

- **Error**: pensar que una derivada grande significa que la función vale mucho. → **Correcto**: mide lo rápido que *cambia*, no lo grande que *es*.
- **Error**: asumir que $f'(x)=0$ siempre es un mínimo. → **Correcto**: también puede ser un máximo o una meseta; hay que mirar alrededor.
- **Error**: usar un $h$ enorme para aproximar la derivada. → **Correcto**: con $h$ grande obtienes la tasa *media* del tramo, no la instantánea.

## En resumen

- **Qué es:** la pendiente de una función en un punto, es decir, cuánto cambia la salida por cada unidad que cambia la entrada.
- **Cómo se obtiene:** se calcula la tasa de variación media en un tramo $h$ y se hace $h \to 0$. En la práctica se usan las reglas de derivación.
- **Regla clave:** $(x^n)' = n x^{n-1}$; la derivada de una suma es la suma de derivadas.
- **Cómo leerla:** positiva, la función sube; negativa, baja; cero, zona plana (mínimo, máximo o meseta).
- **Para qué sirve en IA:** mide la sensibilidad del error a cada parámetro y así indica hacia dónde moverlo al entrenar.
- **Trampa:** una derivada grande no significa un valor grande; significa un cambio rápido.

## A fondo

La idea de "hacerse recta al ampliar" es la que da sentido a la tangente: si haces zoom sobre una curva suave alrededor de un punto, cada vez se parece más a una línea recta, y la pendiente de esa línea es $f'(x)$. Por eso decimos que la derivada es la mejor aproximación lineal de la función en ese punto.

## Autoevaluación

### Si $f'(3) = -2$, ¿qué ocurre con $f$ cerca de $x = 3$?
- [ ] Vale $-2$ en ese punto.
- [x] Baja: al aumentar un poco $x$, la salida disminuye unas dos unidades por unidad de $x$.
- [ ] Tiene un mínimo en $x=3$.
> Por qué: el signo negativo indica que la función decrece, y el valor $2$ es la rapidez del cambio, no el valor de $f$.

### ¿Cuánto vale la derivada de $f(x) = x^3$ en $x = 1$?
- [ ] $1$
- [ ] $2$
- [x] $3$
> Por qué: por la regla de la potencia, $f'(x) = 3x^2$, y en $x=1$ vale $3$.

### ¿Por qué la derivada es útil para entrenar un modelo?
- [ ] Porque calcula directamente el valor óptimo de los parámetros.
- [x] Porque indica cómo cambia el error al mover cada parámetro, y así hacia dónde moverlo.
- [ ] Porque hace que la función de error sea lineal.
> Por qué: la derivada da la dirección y la sensibilidad del cambio; el óptimo se alcanza iterando, como en el descenso de gradiente.

## Glosario

- **Derivada**: pendiente de una función en un punto; mide el cambio instantáneo de la salida respecto a la entrada.
- **Tasa de variación media**: cambio de la salida dividido entre el cambio de la entrada en un tramo finito.
- **Recta tangente**: recta que toca la curva en un punto y tiene su misma pendiente en él.
