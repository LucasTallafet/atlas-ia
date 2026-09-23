---
id: derivada
estado: borrador
---

## En una frase

La derivada mide a qué ritmo cambia la salida de una función cuando su entrada se mueve muy poco: es la pendiente de la curva en un punto concreto.

## Intuición

Piensa en un viaje en coche. Si recorres 120 km en 2 horas, tu velocidad media es 60 km/h, pero eso no dice lo rápido que ibas al pasar por un pueblo concreto. Para saberlo miras el velocímetro, que marca la velocidad **en ese instante**. La derivada es el velocímetro de una función: no promedia un tramo largo, sino que mide el cambio justo en un punto.

También sirve pensar en el mando del volumen. Si lo giras un poco, ¿el sonido cambia mucho o apenas nada? Esa sensibilidad es exactamente lo que mide la derivada.

En IA importa porque un modelo aprende ajustando sus parámetros. La derivada le dice cuánto cambia el error si mueve un parámetro un poco, y hacia qué lado debe moverlo para que el error baje.

## Explicación

### El problema: una pendiente que no es fija

En una recta la inclinación es la misma en todas partes. Si $f(x) = 2x + 1$, cada vez que $x$ aumenta una unidad, la salida sube $2$. Su pendiente es $2$ vayas donde vayas.

En una curva no pasa eso. En la parábola $f(x) = x^2$, cerca de $x = 1$ la curva sube con suavidad; cerca de $x = 2$ sube mucho más deprisa; y cerca de $x = -1$ baja. Necesitas un número distinto para cada punto. Ese número es la derivada.

### Primer intento: el cambio medio en un tramo

Toma dos entradas, $x$ y $x + h$, donde $h$ es un paso pequeño. La salida cambia $f(x+h) - f(x)$ mientras la entrada cambia $h$. Si divides ambas cantidades obtienes la **tasa de variación media**: cuántas unidades sube la salida, de media, por cada unidad de entrada en ese tramo.

Geométricamente, es la pendiente de la **recta secante**, la que une los dos puntos de la curva. El problema es que depende del $h$ que elijas. Fíjate en $f(x) = x^2$ a partir de $x = 1$:

| $h$ | tasa media $\frac{f(1+h) - f(1)}{h}$ |
|---|---|
| $1$ | $3$ |
| $0{,}5$ | $2{,}5$ |
| $0{,}1$ | $2{,}1$ |
| $0{,}01$ | $2{,}01$ |

### Del cambio medio al cambio instantáneo

La tabla muestra un patrón: cuanto más pequeño es $h$, más se acerca la tasa media a $2$. Ese valor al que tiende cuando $h$ se aproxima a cero es la **derivada** de $f$ en $x = 1$, y se escribe $f'(1) = 2$.

Al encoger $h$, la secante gira hasta convertirse en la **recta tangente**: la que toca la curva en el punto y lleva su misma inclinación. Por eso la derivada es la pendiente de la tangente.

### Qué te dice su signo

Si $f'(x) > 0$, la función sube en ese punto; si $f'(x) < 0$, baja; si $f'(x) = 0$, se aplana un momento. En $f(x) = x^2$ la derivada vale $2$ en $x = 1$, $4$ en $x = 2$ y $-2$ en $x = -1$.

### La derivada como brújula

**Optimizar** una función significa buscar sus valores mínimos o máximos. La derivada orienta esa búsqueda: si es positiva, la función crece, así que para bajar conviene moverse hacia el lado contrario; si es negativa, avanzar en ese sentido te acerca al mínimo. Imagina una bola que rueda por una colina: la pendiente le indica hacia dónde ir, y se detiene en el fondo, donde la derivada vale cero. Los modelos de IA se entrenan con esta misma idea, y el [[gradiente|gradiente]] la extiende a funciones de muchas variables.

## Formalización

$$
f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}
$$

donde:

- $f'(x)$ es la derivada de $f$ en el punto $x$.
- $f(x)$ es la salida de la [[funciones|función]] para la entrada $x$.
- $h$ es el paso en la entrada; puede ser positivo o negativo, pero nunca cero.
- $\lim_{h \to 0}$ indica el valor al que tiende el cociente cuando $h$ se acerca a cero.

Ejemplo con $f(x) = x^2$: el cociente vale $\frac{(x+h)^2 - x^2}{h} = \frac{2xh + h^2}{h} = 2x + h$. Cuando $h \to 0$ queda $f'(x) = 2x$, y en $x = 1$ da $2$, como anticipaba la tabla.

Para no calcular el límite cada vez se usan las **reglas de derivación**. Las más básicas: la derivada de una constante es $0$, porque nunca cambia; la de $x^n$ es $n x^{n-1}$; y la de una suma es la suma de las derivadas, $(f+g)' = f' + g'$.

## Interactivo

```widget
motor: funcion
modo: tangente
funciones: [{"expr": "x^2", "etiqueta": "f(x) = x²"}]
x: [-3, 3]
y: [-2, 9]
```

- Prueba a bajar $h$ hasta $0{,}01$: la secante casi se superpone a la tangente y su pendiente se acerca a $2$.
- Prueba a llevar $x_0$ a $-1$ y luego a $0$: la pendiente pasa a ser negativa y después cero, justo en el fondo de la parábola.

## En código

```python
f = lambda x: x**2
x = 1.0
for h in [1, 0.1, 0.01, 0.001]:
    tasa = (f(x + h) - f(x)) / h
    print(f"h = {h:<5} -> tasa media = {tasa:.3f}")

derivada = 2 * x   # regla de la potencia: (x^2)' = 2x
print("f'(1) =", derivada)
# h = 1     -> tasa media = 3.000
# h = 0.1   -> tasa media = 2.100
# h = 0.01  -> tasa media = 2.010
# h = 0.001 -> tasa media = 2.001
# f'(1) = 2.0
```

## Errores típicos

- **Error**: creer que una derivada grande significa que la función toma un valor grande. → **Correcto**: la derivada mide la rapidez del cambio; una función puede valer $1000$ y tener derivada $0$.
- **Error**: pensar que $f'(x) = 0$ indica siempre un mínimo. → **Correcto**: solo dice que la función se aplana en ese punto; también puede ser un máximo.
- **Error**: confundir la tasa de variación media con la derivada. → **Correcto**: la tasa media depende del tramo $h$ elegido; la derivada es su límite cuando $h$ tiende a cero.
- **Error**: leer el signo al revés al optimizar. → **Correcto**: para bajar el valor de la función te mueves en sentido contrario al signo de la derivada.

## A fondo

### Por qué la derivada es cero en un máximo o un mínimo

En la cima o en el fondo de una curva suave, la función deja de subir y todavía no ha empezado a bajar (o al revés). Justo ahí la tangente queda horizontal y su pendiente es cero. Por eso buscar los puntos donde la derivada se anula es la forma habitual de localizar candidatos a mínimo o máximo.

### La curva vista con lupa

Si amplías mucho una curva suave alrededor de un punto, el trozo que ves se parece cada vez más a una línea recta. Esa recta es la tangente, y su pendiente es la derivada. Esta es la lectura que más se usa en IA: cerca de un punto, una función complicada se comporta casi como una recta, y la derivada te dice su inclinación.

### Más reglas de derivación

El producto y el cociente de funciones tienen sus propias reglas, que el curso trata más adelante. Para derivar una función metida dentro de otra se usa la [[regla-cadena]].

## Autoevaluación

### Si $f'(3) = -2$, ¿qué ocurre con $f$ cerca de $x = 3$?
- [ ] La función vale $-2$ en $x = 3$.
- [x] La función baja: si $x$ aumenta un poco, la salida disminuye unas $2$ unidades por cada unidad de $x$.
- [ ] La función tiene un mínimo en $x = 3$.
> Por qué: el signo negativo indica que la función decrece y el $2$ es la rapidez del cambio. La derivada no es el valor de $f$, y un mínimo exigiría derivada $0$.

### Con $f(x) = x^2$ y $h = 0{,}5$, la tasa media a partir de $x = 1$ vale $2{,}5$. ¿Qué pasa si usas $h = 0{,}001$?
- [ ] Sigue valiendo $2{,}5$, porque la función es la misma.
- [x] Se acerca mucho a $2$, que es la derivada en $x = 1$.
- [ ] Se acerca a $0$, porque el tramo es casi nulo.
> Por qué: la tasa media es $2 + h$; al encoger $h$ se aproxima a $f'(1) = 2$. El numerador y el denominador se hacen pequeños a la vez, así que el cociente no tiende a $0$.

### ¿Cuánto vale la derivada de $f(x) = x^3$ en $x = 2$?
- [ ] $8$
- [x] $12$
- [ ] $6$
> Por qué: por la regla de la potencia, $f'(x) = 3x^2$, que en $x = 2$ vale $12$. El $8$ es el valor de la función, no su pendiente, y el $6$ sale de olvidar elevar al cuadrado.

### Un modelo tiene un error $E(w)$ y en el valor actual del parámetro $w$ la derivada es $E'(w) = 5$. ¿Hacia dónde conviene mover $w$ para reducir el error?
- [ ] Hacia valores mayores, porque la derivada es positiva.
- [x] Hacia valores menores, porque el error crece al aumentar $w$.
- [ ] No importa: la derivada solo describe la curva, no indica direcciones.
> Por qué: una derivada positiva significa que el error sube si $w$ aumenta, así que para bajarlo hay que moverse en sentido contrario al signo.

## Glosario

- **Derivada**: pendiente de una función en un punto; mide el cambio instantáneo de la salida al variar la entrada muy poco.
- **Tasa de variación media**: cambio de la salida dividido entre el cambio de la entrada en un tramo finito.
- **Recta secante**: recta que une dos puntos de una curva; su pendiente es la tasa de variación media.
- **Recta tangente**: recta que toca la curva en un punto con su misma inclinación; su pendiente es la derivada.
- **Reglas de derivación**: fórmulas que dan la derivada sin calcular el límite, como la de la potencia o la de la suma.
- **Optimizar**: buscar los valores mínimos o máximos de una función.
