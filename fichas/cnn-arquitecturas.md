---
id: cnn-arquitecturas
estado: borrador
---

## En una frase

LeNet, AlexNet, VGG, GoogLeNet y ResNet son hitos sucesivos que fueron resolviendo, uno a uno, los problemas que impedían entrenar [[cnn|redes convolucionales]] más profundas y precisas.

## Intuición

Piensa en estas arquitecturas como generaciones de un mismo diseño de coche: cada una no empieza de cero, sino que hereda lo que funcionaba de la anterior y corrige su punto débil. LeNet demostró que el diseño (convolución + pooling + capas densas) funcionaba a pequeña escala. AlexNet demostró que, con más profundidad y más potencia de cálculo, ese mismo diseño escalaba a problemas reales. VGG simplificó y ordenó el diseño. GoogLeNet lo hizo más eficiente en parámetros. Y ResNet resolvió el obstáculo que impedía ir más profundo todavía: el gradiente que se desvanecía en redes de muchas capas.

Conocer esta progresión importa porque cada arquitectura introdujo una idea que sigue viva en el diseño moderno de redes: filtros pequeños apilados, módulos paralelos, o las conexiones residuales que hoy aparecen incluso fuera de la visión por computador.

## Explicación

### De LeNet a AlexNet: escalar el mismo diseño

**LeNet-5** (1998) ya tenía la estructura básica de una CNN: convoluciones intercaladas con pooling y una salida densa final, pero limitada a imágenes pequeñas ($28\times28$) y pocos filtros, acorde a la potencia de cómputo de su época.

**AlexNet** (2012) mantuvo esa estructura pero la escaló: ocho capas (cinco convolucionales), imágenes de $224\times224\times3$, activación [[funciones-activacion|ReLU]] en vez de sigmoide o tanh, dropout para reducir el sobreajuste, y entrenamiento en GPU. Ganó el desafío ImageNet (ILSVRC-2012) con una ventaja tan grande sobre los métodos anteriores que marcó el inicio de la era moderna del aprendizaje profundo en visión.

### VGGNet: profundidad con filtros pequeños

**VGGNet** (2014) simplificó el diseño: en vez de mezclar tamaños de kernel como AlexNet, usa exclusivamente convoluciones de $3\times3$ con stride 1 y padding 1, apiladas en bloques cada vez más profundos (de VGG-11 a VGG-19). Apilar varios filtros pequeños en lugar de usar pocos filtros grandes captura patrones igual de complejos con menos parámetros por capa, aunque el conjunto sigue siendo pesado en memoria y cómputo.

### GoogLeNet: eficiencia con módulos Inception

**GoogLeNet** (2014) atacó el problema de otro modo: en vez de una sola convolución por capa, su **módulo Inception** aplica en paralelo convoluciones de $1\times1$, $3\times3$ y $5\times5$ junto con pooling, y concatena los resultados. Las convoluciones de $1\times1$ actúan además como reducción de dimensionalidad antes de las más caras. El resultado: GoogLeNet superó a VGG-16 (138 millones de parámetros) con solo 4 millones, demostrando que profundizar no exige disparar el número de parámetros.

### ResNet: resolver el desvanecimiento del gradiente en redes muy profundas

Al superar las 30-40 capas, las redes empezaban a degradarse: no por sobreajuste, sino porque el [[backpropagation|gradiente]] se desvanecía antes de llegar a las primeras capas. **ResNet** (2015) introdujo las **conexiones residuales**: en vez de que una capa aprenda directamente una transformación $H(x)$, aprende la diferencia $F(x)=H(x)-x$, y un atajo suma la entrada original a la salida, $H(x)=F(x)+x$. Si una capa no tiene nada útil que aportar, puede aprender a acercarse a cero y dejar pasar la identidad, permitiendo que el gradiente fluya sin degradarse. Esto permitió entrenar redes de cientos de capas (de ResNet-18 a ResNet-152) y se convirtió en un mecanismo estándar más allá de la visión por computador.

## Formalización

La única fórmula propia de este concepto es la de la conexión residual de ResNet:

$$
H(x) = F(x) + x
$$

donde:
- $x$ es la entrada al bloque residual.
- $F(x)$ es la transformación que aprende el bloque (típicamente un par de convoluciones $3\times3$).
- $H(x)$ es la salida del bloque, suma de la transformación aprendida y la entrada original (el "atajo").

## Interactivo

```widget
motor: pasos
---
### LeNet-5 (1998)
**7 capas** · Yann LeCun · reconocimiento de dígitos manuscritos

| Capa | Tipo | Salida |
| --- | --- | --- |
| Entrada | imagen | 28×28×1 |
| Conv 1 | 6 filtros 5×5 | 24×24×6 |
| Pooling | promedio 2×2 | 12×12×6 |
| Conv 2 | 16 filtros 5×5 | 8×8×16 |
| Densa | 120 → 84 → 10 | — |
---
### AlexNet (2012)
**8 capas** · ganó ImageNet 2012 · introduce ReLU y dropout

| Arquitectura | Parámetros | Novedad clave |
| --- | --- | --- |
| LeNet-5 | ~60 mil | primera CNN entrenable |
| AlexNet | ~60 millones | profundidad + GPU + ReLU |

**Prueba a**: comparar la entrada (28×28 vs 224×224×3) con la de LeNet-5 en el fotograma anterior.
---
### VGGNet (2014)
**Hasta 19 capas** · Universidad de Oxford · solo kernels 3×3

Toda la red usa el mismo bloque: convolución 3×3, stride 1, padding 1, apilado varias veces antes de cada pooling. La profundidad viene de repetir este bloque, no de variar el tamaño del filtro.
---
### GoogLeNet (2014)
**22 capas, solo 4 millones de parámetros** · módulos Inception

El módulo Inception aplica en paralelo, sobre la misma entrada, convoluciones de 1×1, 3×3 y 5×5 más un pooling, y concatena las cuatro salidas antes de pasar a la siguiente capa: entrada → (conv 1×1 | conv 3×3 | conv 5×5 | pooling, en paralelo) → concatenar → siguiente capa.

**Prueba a**: comparar los parámetros de GoogLeNet (4 millones) con los de VGG-16 (138 millones) a igualdad de rendimiento.
---
### ResNet (2015)
**Hasta 152 capas** · Microsoft Research · conexión residual

El bloque residual deja dos caminos entre la entrada $x$ y la salida: uno que pasa por dos convoluciones 3×3 (aprende $F(x)$) y un atajo directo que salta ambas convoluciones y se suma al final: $x$ → (conv 3×3 → conv 3×3) → suma con el atajo de $x$ → $H(x)=F(x)+x$.

**Prueba a**: seguir el atajo (el camino que no pasa por ninguna convolución) y pensar qué pasaría con el gradiente si esa flecha no existiera.
```

Prueba a…
- Comparar los parámetros de cada arquitectura (tabla de AlexNet) y observar que más profundidad no siempre significa más parámetros.
- Seguir el camino del atajo en el bloque residual de ResNet y relacionarlo con el problema de desvanecimiento del gradiente.
- Contrastar el bloque homogéneo de VGGNet con el módulo paralelo de GoogLeNet: dos formas distintas de ganar profundidad.

## Errores típicos

- **Error**: Pensar que una red gana siempre en precisión por tener más capas → **Correcto**: a partir de cierta profundidad (30-40 capas) el entrenamiento se degrada por desvanecimiento del gradiente si no hay un mecanismo como las conexiones residuales de ResNet.
- **Error**: Creer que los módulos Inception de GoogLeNet eligen un tamaño de filtro por capa → **Correcto**: aplican varios tamaños de filtro en paralelo (1×1, 3×3, 5×5) sobre la misma entrada y concatenan los resultados.
- **Error**: Confundir la conexión residual con simplemente sumar dos capas cualesquiera → **Correcto**: la conexión residual suma específicamente la entrada original del bloque ($x$) a la salida de las convoluciones ($F(x)$), permitiendo que el bloque aprenda la identidad si no tiene nada útil que aportar.

## En resumen

- LeNet-5 (1998) fijó el diseño base de una CNN: convolución + pooling + capas densas, a pequeña escala.
- AlexNet (2012) escaló ese diseño con más profundidad, ReLU, dropout y GPU, y desató la era moderna del deep learning en visión.
- VGGNet (2014) simplificó el diseño usando solo kernels 3×3 apilados, ganando profundidad con un bloque homogéneo.
- GoogLeNet (2014) introdujo los módulos Inception, que aplican varios tamaños de filtro en paralelo para ganar precisión sin disparar los parámetros.
- Fórmula clave: la conexión residual de ResNet, $H(x)=F(x)+x$, permite que el gradiente fluya sin degradarse en redes de cientos de capas.
- Elige una arquitectura ligera (LeNet, CNN simple) para datasets pequeños; una profunda con residuales (ResNet) cuando el problema y los datos lo justifican.
- La trampa principal: pensar que más capas es automáticamente mejor; sin un mecanismo contra el desvanecimiento del gradiente, apilar capas puede empeorar el entrenamiento.

## Autoevaluación

### ¿Qué problema resolvieron específicamente las conexiones residuales de ResNet?
- [ ] El sobreajuste en datasets pequeños
- [x] La degradación del entrenamiento por desvanecimiento del gradiente en redes muy profundas
- [ ] El alto coste de memoria de las imágenes en color
- [ ] La necesidad de usar padding en las primeras capas
> Por qué: a partir de 30-40 capas, sin un mecanismo como el atajo residual, el gradiente se desvanecía antes de llegar a las primeras capas, impidiendo que aprendieran; el atajo permite que el gradiente fluya directamente.

### GoogLeNet logra mejor rendimiento que VGG-16 con muchos menos parámetros (4 millones frente a 138 millones). ¿Gracias a qué mecanismo?
- [ ] A que usa imágenes de menor resolución
- [x] A los módulos Inception, que capturan varias escalas en paralelo y usan convoluciones 1×1 para reducir dimensionalidad antes de las capas más caras
- [ ] A que tiene menos capas que VGG-16
- [ ] A que elimina las capas de pooling
> Por qué: los módulos Inception combinan varios tamaños de filtro en paralelo de forma eficiente, y las convoluciones 1×1 reducen el número de mapas de características antes de aplicar convoluciones más costosas, lo que recorta parámetros sin perder capacidad de representación.

### Ordena estas arquitecturas por su idea distintiva: ¿cuál fue la primera en usar exclusivamente kernels de 3×3 apilados como principio de diseño homogéneo?
- [ ] AlexNet
- [x] VGGNet
- [ ] GoogLeNet
- [ ] LeNet-5
> Por qué: AlexNet combinaba kernels de distintos tamaños (11×11, 5×5, 3×3); fue VGGNet la que homogeneizó el diseño usando solo convoluciones 3×3 apiladas en todas sus capas.

## Glosario

- **módulo Inception**: bloque de GoogLeNet que aplica en paralelo convoluciones de varios tamaños (1×1, 3×3, 5×5) más pooling, y concatena los resultados.
- **conexión residual**: atajo que suma la entrada original de un bloque a su salida transformada, usado en ResNet para permitir que el gradiente fluya en redes muy profundas.
