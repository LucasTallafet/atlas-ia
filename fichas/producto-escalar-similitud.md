---
id: producto-escalar-similitud
estado: borrador
---

## En una frase

El producto escalar mide cuánto apuntan dos vectores en la misma dirección; combinado con sus normas, da la similitud del coseno, la forma más común de medir si dos datos "se parecen".

## Intuición

Piensa en dos linternas apuntando hacia el techo. Si apuntan casi al mismo sitio, la sombra que proyecta una sobre la dirección de la otra es grande. Si son perpendiculares, una no proyecta nada sobre la otra. Si apuntan en sentidos opuestos, la sombra es grande pero "hacia el lado contrario". Eso es exactamente lo que mide el **producto escalar**: cuánto se parecen dos vectores en la dirección a la que apuntan, sin importar de entrada lo largos que sean.

En IA esto es constante: comparar dos correos, dos documentos, dos usuarios o dos palabras se reduce casi siempre a preguntar "¿en qué dirección apuntan sus vectores?".

## Explicación

### La norma: el "tamaño" de un vector

Antes de comparar direcciones hace falta medir tamaños. La **norma** de un vector $\mathbf{v}$, escrita $\lVert\mathbf{v}\rVert$, es una función que le asigna una longitud. La más habitual es la **norma euclídea o $L_2$**, una extensión del teorema de Pitágoras:

$$
\lVert\mathbf{v}\rVert = \sqrt{v_1^2+v_2^2+\dots+v_n^2}
$$

Con $\mathbf{v}=(3,4)$, $\lVert\mathbf{v}\rVert=\sqrt{9+16}=5$. Dividir un vector por su norma L2 lo **normaliza**: se queda con longitud 1 y la misma dirección, $\hat{\mathbf{v}}=\mathbf{v}/\lVert\mathbf{v}\rVert$.

La otra norma habitual es la **norma $L_1$** o **distancia de Manhattan**, la suma de valores absolutos: $\lVert\mathbf{v}\rVert_1=|v_1|+\dots+|v_n|$. A diferencia de la $L_2$, la $L_1$ favorece la **escasez** (*sparsity*): al usarla como penalización (regularización *Lasso*) empuja muchos pesos exactamente a cero, mientras que la $L_2$ (regularización *Ridge*) solo los acerca a cero. Es el contraste clave entre ambas: $L_2$ reparte el peso de forma suave, $L_1$ tiende a eliminar variables enteras.

### El producto escalar

El producto escalar de $\mathbf{v}$ y $\mathbf{w}$ no da otro vector, sino un único número: se multiplican las componentes correspondientes y se suman.

$$
\mathbf{v}\cdot\mathbf{w} = \sum_{i=1}^n v_iw_i
$$

Es grande y positivo si los vectores apuntan en direcciones parecidas, cero si son **ortogonales** (perpendiculares) y grande y negativo si apuntan en direcciones opuestas. En una neurona artificial, el producto escalar entre las entradas y los pesos es justo lo que decide cuánto se activa.

### De la fórmula a la similitud del coseno

La clave geométrica es esta identidad:

$$
\mathbf{v}\cdot\mathbf{w} = \lVert\mathbf{v}\rVert\,\lVert\mathbf{w}\rVert\,\cos(\theta)
$$

Si normalizas ambos vectores antes de multiplicarlos ($\hat{\mathbf{v}}\cdot\hat{\mathbf{w}}$), lo que queda es directamente $\cos(\theta)$: la **similitud del coseno**. Con $\mathbf{v}=(3,4)$ y $\mathbf{w}=(4,3)$, el producto escalar es $3\cdot4+4\cdot3=24$, ambas normas valen $5$, así que $\cos(\theta)=24/25=0{,}96$: casi la misma dirección. La similitud del coseno se centra solo en la dirección, no en el tamaño; por eso un documento largo y uno corto pueden salir muy similares si hablan de lo mismo, aunque sus vectores de frecuencias tengan magnitudes muy distintas.

### Otras formas de medir distancia

La similitud del coseno mide dirección; la **distancia** mide separación entre dos puntos. Las más usadas son:

| Métrica | Fórmula | Cuándo conviene |
|---|---|---|
| Euclídea | $\sqrt{\sum_i (x_i-y_i)^2}$ | variables numéricas en la misma escala, sin correlación fuerte |
| Manhattan ($L_1$) | $\sum_i \lvert x_i-y_i\rvert$ | variables que representan direcciones independientes (por ejemplo, logística) |
| Minkowski | $\left(\sum_i \lvert x_i-y_i\rvert^p\right)^{1/p}$ | generaliza las dos anteriores ($p=2$ euclídea, $p=1$ Manhattan) |
| Hamming | $\sum_i \mathbb{1}(x_i\neq y_i)$ | datos categóricos o binarios (cadenas, ADN, códigos) |

Con los puntos $A=(1,1)$ y $B=(4,5)$: la euclídea es $\sqrt{3^2+4^2}=5$ y la Manhattan es $3+4=7$. La Manhattan siempre es mayor o igual que la euclídea, porque obliga a moverse en línea recta por los ejes en vez de en diagonal.

## Formalización

$$
\lVert\mathbf{v}\rVert_2 = \sqrt{\sum_{i=1}^n v_i^2}
\qquad
\lVert\mathbf{v}\rVert_1 = \sum_{i=1}^n \lvert v_i\rvert
\qquad
\cos(\theta) = \frac{\mathbf{v}\cdot\mathbf{w}}{\lVert\mathbf{v}\rVert\,\lVert\mathbf{w}\rVert}
$$

donde:

- $\mathbf{v}, \mathbf{w}$ son vectores de $n$ componentes.
- $v_i$ es la componente $i$-ésima de $\mathbf{v}$.
- $\lVert\mathbf{v}\rVert_2$, $\lVert\mathbf{v}\rVert_1$ son, respectivamente, la norma euclídea y la norma Manhattan de $\mathbf{v}$.
- $\theta$ es el ángulo entre $\mathbf{v}$ y $\mathbf{w}$.
- $\cos(\theta)$ es la similitud del coseno: $1$ si apuntan igual, $0$ si son ortogonales, $-1$ si son opuestos.

## Interactivo

```widget
motor: vectores2d
modo: similitud
vectores: [{"nombre": "v", "xy": [3, 4]}, {"nombre": "w", "xy": [4, 3]}]
mostrar: ["producto", "coseno", "euclidea", "manhattan"]
```

- Prueba a girar $\mathbf{w}$ hasta que quede perpendicular a $\mathbf{v}$: el producto escalar y el coseno deben caer a 0.
- Prueba a alargar $\mathbf{w}$ sin cambiar su dirección: el producto escalar cambia mucho, pero el coseno se queda igual.
- Prueba a comparar la distancia euclídea y la manhattan entre los mismos dos puntos: ¿cuál es siempre mayor o igual?

## En código

```python
import numpy as np

v = np.array([3, 4])
w = np.array([4, 3])

dot = v.dot(w)
coseno = dot / (np.linalg.norm(v) * np.linalg.norm(w))
print("producto escalar:", dot)          # 24
print("coseno:", round(coseno, 2))       # 0.96
print("euclídea:", np.linalg.norm(v - w))    # 1.4142...
print("manhattan:", np.abs(v - w).sum())     # 2
```

## Errores típicos

- **Error**: pensar que un producto escalar grande siempre significa vectores muy "parecidos". → **Correcto**: también crece si los vectores son simplemente muy largos; para medir solo dirección hay que normalizar (similitud del coseno).
- **Error**: creer que la regularización $L_1$ y la $L_2$ hacen lo mismo, solo con distinta fórmula. → **Correcto**: $L_2$ acerca los pesos a cero de forma suave; $L_1$ tiende a llevarlos exactamente a cero, eliminando variables.
- **Error**: usar la distancia euclídea para comparar documentos de longitud muy distinta. → **Correcto**: la longitud del documento infla la magnitud del vector; la similitud del coseno, al fijarse solo en dirección, no se deja engañar por eso.
- **Error**: aplicar la distancia de Hamming a datos numéricos continuos. → **Correcto**: Hamming solo cuenta posiciones distintas; tiene sentido en datos categóricos o binarios, no en medidas continuas.

## En resumen

- **Qué mide:** el producto escalar $\mathbf{v}\cdot\mathbf{w}=\sum_i v_iw_i$ indica cuánto apuntan dos vectores en la misma dirección.
- **Cómo se lee:** positivo y grande, direcciones parecidas; cero, ortogonales; negativo, direcciones opuestas.
- **Similitud del coseno:** normaliza antes de multiplicar, $\cos(\theta)=\dfrac{\mathbf{v}\cdot\mathbf{w}}{\lVert\mathbf{v}\rVert\lVert\mathbf{w}\rVert}$; mide solo dirección, no tamaño.
- **Normas:** $L_2$ (euclídea) para longitud "en línea recta"; $L_1$ (Manhattan) para desplazamientos por ejes y para forzar escasez en regularización.
- **Cuándo usar cada distancia:** euclídea con variables numéricas comparables; Manhattan con ejes independientes; Minkowski para ajustar entre ambas con $p$; Hamming con datos categóricos o binarios.
- **Trampa:** un producto escalar o una distancia euclídea grandes pueden deberse solo a la magnitud de los vectores, no a que sean distintos en dirección.

## A fondo

### La proyección detrás del producto escalar

La identidad $\mathbf{v}\cdot\mathbf{w}=\lVert\mathbf{v}\rVert\lVert\mathbf{w}\rVert\cos(\theta)$ tiene una lectura geométrica concreta: el producto escalar es la longitud de la "sombra" que un vector proyecta sobre el otro, multiplicada por la longitud del vector sobre el que se proyecta. Cuando $\theta=0°$ la sombra es máxima (coseno 1); a $90°$ no hay sombra (coseno 0); a $180°$ la sombra es máxima pero en sentido contrario (coseno $-1$).

### Comparación numérica de las cuatro métricas

Con $A=(1,1)$, $B=(4,5)$ y $C=(1,5)$: la euclídea entre $A$ y $B$ es $5$ y entre $A$ y $C$ es $4$; la Manhattan da $7$ y $6$ respectivamente; con Minkowski $p=3$ se obtienen valores intermedios, $\approx 4{,}50$ y $4$. La elección de métrica no es un detalle menor: cambia qué puntos se consideran "cercanos" y, por tanto, cómo agrupa o clasifica un algoritmo basado en distancias.

## Autoevaluación

### Dos vectores tienen producto escalar $0$. ¿Qué se puede afirmar sobre ellos?
- [ ] Que son idénticos.
- [ ] Que uno de los dos es el vector nulo.
- [x] Que son ortogonales: no hay proyección de uno sobre el otro, aunque ambos tengan longitud distinta de cero.
> Por qué: $\mathbf{v}\cdot\mathbf{w}=\lVert\mathbf{v}\rVert\lVert\mathbf{w}\rVert\cos(\theta)$; si el producto es $0$ y ninguna norma es $0$, entonces $\cos(\theta)=0$, es decir, $\theta=90°$.

### Un documento corto y uno muy largo hablan exactamente del mismo tema, así que sus vectores de frecuencias de palabras apuntan en direcciones muy parecidas pero tienen magnitudes muy distintas. ¿Qué métrica los identificará como más similares?
- [ ] La distancia euclídea, porque mide la diferencia real entre ambos vectores.
- [x] La similitud del coseno, porque solo depende de la dirección, no de la longitud de los vectores.
- [ ] La distancia de Hamming, porque cuenta las palabras que difieren.
> Por qué: la longitud del documento infla la magnitud del vector de frecuencias; la similitud del coseno normaliza esa magnitud y compara solo hacia dónde apunta cada vector.

### Al entrenar un modelo con miles de características, solo unas pocas son relevantes. ¿Qué regularización tenderá a poner a cero los pesos de las irrelevantes?
- [ ] $L_2$ (Ridge), porque penaliza más los pesos grandes.
- [x] $L_1$ (Lasso), porque su penalización empuja los pesos pequeños hasta hacerlos exactamente cero.
- [ ] Ninguna: la regularización nunca afecta a pesos concretos.
> Por qué: la norma $L_1$ tiene una geometría que favorece soluciones "escasas", con muchos pesos en cero; la $L_2$ los reduce sin llegar a anularlos por completo.

### Quieres comparar dos secuencias de ADN representadas como cadenas de letras. ¿Qué métrica de las vistas es la más adecuada?
- [ ] La distancia euclídea, porque siempre es la más intuitiva.
- [x] La distancia de Hamming, porque cuenta cuántas posiciones difieren entre dos secuencias categóricas.
- [ ] La similitud del coseno, porque normaliza la longitud de la secuencia.
> Por qué: Hamming está pensada para datos categóricos o binarios posición a posición; euclídea y coseno asumen componentes numéricas continuas.

## Glosario

- **Norma**: función que asigna una longitud o tamaño a un vector.
- **Norma euclídea ($L_2$)**: $\sqrt{\sum_i v_i^2}$; longitud "en línea recta" de un vector.
- **Norma Manhattan ($L_1$)**: $\sum_i \lvert v_i\rvert$; suma de valores absolutos de las componentes.
- **Vector normalizado**: vector dividido por su norma $L_2$; misma dirección, longitud 1.
- **Producto escalar**: $\sum_i v_iw_i$; mide cuánto apuntan dos vectores en la misma dirección.
- **Ortogonal**: dos vectores forman un ángulo de $90°$; su producto escalar es $0$.
- **Similitud del coseno**: producto escalar de dos vectores normalizados; mide solo dirección.
- **Distancia de Minkowski**: distancia generalizada con parámetro $p$; incluye euclídea ($p=2$) y Manhattan ($p=1$).
- **Distancia de Hamming**: número de posiciones en las que dos secuencias categóricas difieren.
