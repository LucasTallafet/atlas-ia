---
id: cnn
estado: borrador
---

## En una frase

Una red convolucional recorre la imagen con pequeños filtros que aprenden solos, en vez de tratar cada píxel como un dato aislado.

## Intuición

Imagina que buscas la palabra "gato" en un libro pasando una lupa pequeña línea a línea, en vez de memorizar la posición exacta de cada letra en la página. La lupa reconoce el patrón "gato" esté donde esté. Eso es lo que hace un filtro convolucional: es una plantilla pequeña que se desliza sobre la imagen entera buscando un mismo patrón (un borde, una textura, una curva) en cualquier posición.

Esto importa porque las imágenes tienen estructura espacial: un ojo se parece a un ojo esté en la esquina o en el centro de la foto. Una red que trate cada píxel como una entrada suelta, como el [[mlp|MLP]], ignora esa estructura y necesita ver el mismo patrón en cada posición posible para aprenderlo. Una red convolucional (**CNN**) comparte el mismo filtro en toda la imagen, así que aprende el patrón una sola vez y lo reconoce en cualquier sitio.

## Explicación

### El problema: por qué un MLP no es buena idea para imágenes

Piensa en una imagen en escala de grises de 100×100 píxeles. Para dársela a un [[mlp|MLP]] hay que aplanarla en un vector de 10.000 números. Si la primera capa oculta tiene 256 neuronas, cada una necesita un peso por cada entrada:

$$
256 \times 10.000 + 256 = 2.560.256 \text{ pesos solo en la primera capa}
$$

Y ese aplanado destruye la estructura espacial: el píxel de la esquina superior izquierda queda tan "lejos" en el vector del píxel de al lado como del de la esquina opuesta, cuando en la imagen real son vecinos. Como cada neurona de entrada está atada a una posición fija, si un objeto aparece desplazado unos píxeles respecto a los ejemplos de entrenamiento, la red lo ve como un patrón completamente nuevo.

### La idea: un filtro pequeño que se desliza

Un **kernel** (o filtro) es una matriz pequeña, típicamente de 3×3 o 5×5, con valores que se aprenden durante el entrenamiento. La operación de **convolución** consiste en deslizar ese kernel sobre la imagen y, en cada posición, multiplicar cada valor del kernel por el píxel que tiene debajo y sumar todo, generando un único número. Repetido en toda la imagen, esto produce una nueva matriz llamada **mapa de características** (*feature map*), que indica dónde ha respondido fuerte ese patrón.

Como el mismo kernel se aplica en toda la imagen (**compartición de parámetros**), la red solo necesita aprender los valores del filtro una vez, no uno por posición. Esto reduce drásticamente el número de pesos frente a un MLP y da a la red **invarianza a traslaciones**: reconoce un patrón esté donde esté en la imagen.

:::nota-fuente
El ejemplo de convolución de la fuente (imagen de 5×5 con rampa de intensidades y kernel de detección de bordes `[[-1,-1,-1],[0,0,0],[1,1,1]]`) calcula la primera posición como $0$. El cálculo correcto, verificado con `numpy`, da $-1{\cdot}10-1{\cdot}20-1{\cdot}30+0+0+0+1{\cdot}30+1{\cdot}40+1{\cdot}50=60$. De hecho, como la imagen es una rampa perfectamente uniforme, el mapa de características completo da $60$ en las nueve posiciones: el filtro detecta el mismo cambio de intensidad en todas partes porque la imagen crece igual en todas direcciones. Se usa el valor correcto ($60$) en el ejemplo de abajo.
:::

**Ejemplo numérico.** Con la imagen y el kernel anteriores, la submatriz superior izquierda es:

$$
\begin{bmatrix} 10 & 20 & 30 \\ 20 & 30 & 40 \\ 30 & 40 & 50 \end{bmatrix}
$$

El producto elemento a elemento con el kernel y su suma da $-10-20-30+0+0+0+30+40+50=60$. Deslizando el kernel por las nueve posiciones posibles de esta imagen de $5\times5$, el mapa de características resultante es una matriz de $3\times3$ con el valor $60$ en todas las celdas (verificado con `numpy`), porque el kernel detecta el mismo salto de intensidad en cualquier posición de la rampa.

### Controlando el tamaño de salida: padding y stride

Sin más ajustes, la convolución reduce el tamaño de la imagen: un kernel de $3\times3$ sobre una imagen de $5\times5$ solo cabe en $3\times3$ posiciones, así que la salida es más pequeña. Esto tiene dos efectos indeseados: la imagen se encoge en cada capa y los píxeles del borde participan en menos cálculos que los del centro, perdiendo peso en el resultado.

El **padding** añade un borde de píxeles (normalmente ceros, *zero-padding*) alrededor de la imagen antes de aplicar el kernel, para compensar esa pérdida y controlar el tamaño de salida. El **stride** es el número de píxeles que el kernel avanza en cada paso: con stride 1 se mueve de uno en uno; con stride mayor, salta posiciones y la salida se reduce más, a cambio de menos cómputo.

### El pooling: reducir sin aprender

El **pooling** reduce el tamaño espacial de un mapa de características sin usar pesos entrenables: divide la imagen en bloques que no se solapan y aplica una función fija sobre cada uno. El más habitual es el **max pooling**, que se queda con el valor máximo de cada bloque (conserva la activación más fuerte); el **average pooling** calcula el promedio (suaviza). Con una ventana de $2\times2$ y desplazamiento 2, el pooling reduce cada dimensión a la mitad. Además de reducir cómputo, el pooling añade tolerancia a pequeños desplazamientos: si el patrón se mueve un píxel, es probable que siga cayendo en el mismo bloque y el máximo no cambie.

### De un canal a muchos: imágenes en color y múltiples filtros

Una imagen en color no es una matriz sino tres: los canales rojo, verde y azul (RGB), de forma $I \times I \times 3$. El kernel debe tener la misma profundidad que la entrada ($K \times K \times 3$) para que la convolución sea válida; el resultado sigue siendo un único mapa de características por filtro, porque la suma se hace también a lo largo de los canales.

En la práctica, una capa convolucional no aplica un solo filtro sino $F$ filtros en paralelo, cada uno buscando un patrón distinto (un borde vertical, una textura, una curva). Cada filtro produce su propio mapa de características, así que la salida de la capa tiene profundidad $F$: una imagen RGB de $128\times128\times3$ con 32 filtros de $5\times5\times3$ produce una salida de $128\times128\times32$. Esto explica un patrón que se repite en toda la arquitectura: a medida que la imagen avanza por la red, gana **profundidad** (más filtros, más patrones detectados) mientras pierde **resolución espacial** (por el efecto acumulado de convoluciones sin padding total, stride y pooling).

### De los filtros a la decisión final

Una CNN de clasificación encadena tres fases. Primero, varias capas convolucionales con su activación (normalmente [[funciones-activacion|ReLU]]) extraen patrones cada vez más abstractos: las primeras capas detectan bordes y texturas simples, las capas profundas combinan esos patrones en formas y partes de objetos. Segundo, el pooling intercalado reduce la resolución espacial y el coste de cómputo. Tercero, tras la última convolución, el mapa de características se **aplana** (*flatten*) en un vector y se conecta a una red completamente conectada como la de un [[mlp|MLP]], que combina las características extraídas para decidir la clase final (con [[funciones-activacion|softmax]] en la salida si hay varias clases).

### Por qué la CNN gana a la MLP en imágenes

La ventaja no es solo de precisión: es de eficiencia. Al compartir el mismo filtro en toda la imagen, una CNN necesita muchísimos menos parámetros que un MLP equivalente. Una primera capa MLP sobre una imagen de $128\times128\times3$ necesitaría del orden de 49.000 pesos por neurona; una capa convolucional con filtros de $5\times5\times3$ necesita solo $5{\cdot}5{\cdot}3+1=76$ pesos por filtro, sin importar el tamaño de la imagen. Esa reducción, junto con la invarianza a traslaciones y la conservación de la estructura espacial, es lo que hace viable entrenar redes profundas sobre imágenes con conjuntos de datos y tiempos de cómputo razonables.

## Formalización

Tamaño de salida de una convolución, sin padding ni stride (equivalente a $P=0$, $S=1$):

$$
O = (I - K) + 1
$$

donde:
- $O$ es el tamaño (lado) del mapa de características de salida.
- $I$ es el tamaño (lado) de la imagen de entrada.
- $K$ es el tamaño (lado) del kernel.

Con padding y stride, la fórmula general es:

$$
O = \frac{(I - K) + 2P}{S} + 1
$$

donde, además de lo anterior:
- $P$ es el número de píxeles de padding añadidos en cada borde.
- $S$ es el stride: el número de píxeles que avanza el kernel en cada paso.

**Ejemplo numérico.** Con $I=5$, $K=3$, $P=1$, $S=2$: $O=\frac{(5-3)+2(1)}{2}+1=3$ (verificado con Python). Con una imagen RGB $I=128$, kernel $K=5$, $P=2$, $S=1$: $O=\frac{(128-5)+2(2)}{1}+1=128$, es decir, el padding compensa exactamente la reducción del kernel y la salida mantiene el tamaño de la entrada (verificado con Python).

Con imágenes multicanal y $F$ filtros, la salida de una capa convolucional tiene forma $O \times O \times F$, donde cada uno de los $F$ mapas se calcula con la misma fórmula de $O$ de arriba, y cada filtro tiene forma $K \times K \times C$ (siendo $C$ el número de canales de la entrada).

## Interactivo

```widget
motor: convolucion
imagen: [[10,20,30,40,50],[20,30,40,50,60],[30,40,50,60,70],[40,50,60,70,80],[50,60,70,80,90]]
kernel: [[-1,-1,-1],[0,0,0],[1,1,1]]
padding: 0
stride: 1
pooling: ninguno
```

Prueba a:
- Subir el padding a 1 y comprobar que el mapa de características pasa de $3\times3$ a $5\times5$, igual que en la fórmula.
- Poner stride en 2 y ver cómo el kernel salta posiciones, reduciendo aún más el tamaño de salida.
- Activar `pooling: max` sobre el mapa resultante y comparar el tamaño final con el de `pooling: media`.

## En código

```python
import numpy as np

img = np.array([[10,20,30,40,50],[20,30,40,50,60],
                 [30,40,50,60,70],[40,50,60,70,80],
                 [50,60,70,80,90]])
kernel = np.array([[-1,-1,-1],[0,0,0],[1,1,1]])

salida = np.zeros((3, 3))
for i in range(3):
    for j in range(3):
        salida[i, j] = np.sum(img[i:i+3, j:j+3] * kernel)

print(salida)
# [[60. 60. 60.]
#  [60. 60. 60.]
#  [60. 60. 60.]]
```

## Errores típicos

- **Error**: Pensar que el pooling también aprende pesos, como la convolución → **Correcto**: el pooling aplica una función fija (máximo o promedio) sobre cada bloque, sin parámetros entrenables.
- **Error**: Creer que un kernel más grande siempre captura mejor los patrones → **Correcto**: kernels pequeños (3×3) apilados en varias capas suelen capturar patrones igual de complejos con menos parámetros que un kernel grande en una sola capa.
- **Error**: Olvidar que el kernel debe tener la misma profundidad que la entrada → **Correcto**: sobre una imagen RGB ($I\times I\times3$), un kernel debe ser $K\times K\times3$; el resultado de cada filtro sigue siendo un único mapa 2D, porque la suma incluye los tres canales.
- **Error**: Confundir el número de filtros de una capa con el tamaño de cada filtro → **Correcto**: el tamaño ($K\times K$) determina la región que ve cada filtro; el número de filtros ($F$) determina la profundidad de la salida y cuántos patrones distintos aprende la capa.

## En resumen

- Una CNN extrae patrones de una imagen deslizando **kernels** (filtros pequeños y entrenables) sobre ella, en vez de tratar cada píxel como una entrada aislada.
- La **convolución** multiplica el kernel por la región que tiene debajo y suma el resultado, generando un **mapa de características** por cada filtro.
- Fórmula clave del tamaño de salida: $O=\frac{(I-K)+2P}{S}+1$, con $I$=tamaño de entrada, $K$=tamaño del kernel, $P$=padding, $S$=stride.
- El **padding** evita que la imagen se encoja en cada capa; el **stride** controla cuánto salta el kernel y, con ello, cuánto se reduce la salida.
- El **pooling** (típicamente max pooling) reduce la resolución espacial sin pesos entrenables y añade tolerancia a pequeños desplazamientos.
- A medida que la red profundiza, los mapas de características ganan profundidad (más filtros) y pierden resolución espacial (por stride y pooling).
- Úsala cuando los datos tengan estructura espacial (imágenes, y por extensión otras rejillas de datos); un MLP sigue siendo razonable para datos tabulares sin esa estructura.
- La trampa principal: pensar que hay que diseñar los kernels a mano, como en el procesamiento de imágenes clásico (filtro de Sobel); en una CNN los valores del kernel se aprenden con retropropagación, igual que cualquier otro peso.

## A fondo

### De la visión biológica a las CNN

El diseño de las CNN está inspirado en los experimentos de **David Hubel y Torsten Wiesel** en los años 60 sobre la corteza visual de gatos, que reveló una organización jerárquica: neuronas simples que responden a bordes en una posición y orientación concretas, y neuronas complejas, con más tolerancia a la posición exacta del estímulo. Esa idea de procesar la imagen en capas, de patrones simples a combinaciones más abstractas, es la que **Kunihiko Fukushima** trasladó a un modelo computacional en 1981 con el **Neocognitron**, que ya introducía campos receptivos jerárquicos e invarianza a traslaciones, pero sin un mecanismo de aprendizaje eficiente como la retropropagación.

### LeNet-5: la primera CNN entrenable con éxito

**Yann LeCun** y sus colaboradores presentaron **LeNet-5** en 1998, la primera arquitectura que combinó capas convolucionales y de pooling entrenadas con retropropagación. Procesaba dígitos escritos a mano de $28\times28$ píxeles: una primera convolución con 6 filtros de $5\times5$ generaba mapas de $24\times24\times6$; un submuestreo por promediado los reducía a $12\times12\times6$; una segunda convolución con 16 filtros de $5\times5$ producía $8\times8\times16$, reducidos por submuestreo a $4\times4\times16$; y finalmente el vector aplanado pasaba por dos capas densas (120 y 84 neuronas) antes de la salida softmax. Se usó comercialmente para leer cheques bancarios, pero la falta de potencia de cómputo de la época limitó su uso en problemas más grandes.

### AlexNet y el resurgir de las CNN

El salto llegó en 2012 con **AlexNet** (Krizhevsky, Sutskever y Hinton), que ganó el desafío ImageNet (ILSVRC) con una ventaja abrumadora. Sus claves: más profundidad (ocho capas, cinco convolucionales), la función de activación ReLU en vez de sigmoide o tanh (entrena más rápido y mitiga el desvanecimiento del gradiente), dropout para reducir el sobreajuste, y sobre todo el entrenamiento en GPU, que hizo viable procesar redes de ese tamaño en tiempos razonables. Este éxito es el punto de partida de arquitecturas posteriores como VGGNet, GoogLeNet y ResNet, tratadas en [[cnn-arquitecturas]].

### Procesamiento tradicional vs. CNN

Antes de las CNN, extraer características de una imagen se hacía con filtros diseñados a mano, como el **filtro de Sobel** para detectar bordes (dos máscaras $3\times3$, una para bordes horizontales y otra para verticales, combinadas como $G=\sqrt{G_x^2+G_y^2}$), o descriptores como SIFT o HOG. Estos métodos eran frágiles ante cambios de iluminación, escala o rotación, porque sus filtros eran fijos. La diferencia de fondo con una CNN no es la operación (ambas usan convolución), sino que en una CNN los valores del kernel no se diseñan: se aprenden a partir de los datos de entrenamiento, optimizando directamente para la tarea final.

## Autoevaluación

### Tienes una imagen de $7\times7$ y aplicas un kernel de $3\times3$ con padding $1$ y stride $2$. ¿Qué tamaño tiene la salida?
- [ ] $7\times7$
- [ ] $5\times5$
- [x] $4\times4$
- [ ] $3\times3$
> Por qué: $O=\frac{(7-3)+2(1)}{2}+1=\frac{6}{2}+1=4$. La trampa es olvidar el $+1$ final o no dividir entre el stride.

### ¿Por qué una CNN necesita muchos menos parámetros que un MLP para procesar la misma imagen?
- [ ] Porque usa menos capas que un MLP
- [x] Porque comparte los mismos pesos del kernel en toda la imagen, en vez de tener un peso distinto por cada píxel y neurona
- [ ] Porque redimensiona la imagen a un tamaño más pequeño antes de procesarla
- [ ] Porque no usa funciones de activación
> Por qué: la compartición de parámetros es la clave: el mismo filtro (por ejemplo, $5\times5\times3+1=76$ pesos) se aplica en cada posición de la imagen, en vez de aprender una conexión distinta por cada píxel de entrada como haría un MLP.

### Aplicas max pooling de $2\times2$ con stride 2 sobre un mapa de características de $8\times8$. ¿Qué tamaño tiene la salida y qué información conserva?
- [ ] $8\times8$; conserva toda la información, solo la reordena
- [x] $4\times4$; conserva el valor máximo de cada bloque de $2\times2$, no solapado
- [ ] $4\times4$; conserva el promedio de cada bloque
- [ ] $16\times16$; el pooling amplía el mapa de características
- [ ] $6\times6$; conserva la suma de cada bloque
> Por qué: el pooling con ventana $2\times2$ y stride 2 reduce cada dimensión a la mitad ($8/2=4$) y, en su variante max, se queda con el valor más alto de cada bloque no solapado, no con un promedio ni con la suma.

### Un compañero dice que para detectar el mismo borde en distintas zonas de una imagen hay que entrenar un filtro distinto por cada posible posición. ¿Qué falla en esa idea?
- [ ] Nada, es exactamente así como funciona una CNN
- [x] Falla la compartición de parámetros: el mismo filtro se desliza y se aplica igual en toda la imagen, así que basta con aprenderlo una vez
- [ ] Falla porque las CNN no procesan bordes, solo texturas
- [ ] Falla porque solo se puede detectar un borde por red, no por filtro
> Por qué: es precisamente la invarianza a traslaciones lo que evita entrenar un filtro por posición: al compartir pesos, un único kernel entrenado detecta el patrón esté donde esté en la imagen.

## Glosario

- **kernel**: matriz pequeña y entrenable (filtro) que se desliza sobre la imagen para extraer un patrón concreto mediante convolución.
- **convolución**: operación que multiplica el kernel por la región de la imagen que tiene debajo en cada posición y suma el resultado, generando un mapa de características.
- **mapa de características**: matriz de salida de una convolución; indica en qué zonas de la imagen ha respondido fuerte el patrón del kernel.
- **padding**: píxeles adicionales (normalmente ceros) añadidos alrededor de la imagen antes de convolucionar, para controlar el tamaño de salida y no perder información de los bordes.
- **stride**: número de píxeles que avanza el kernel en cada paso de la convolución.
- **pooling**: operación fija (sin pesos) que reduce el tamaño espacial de un mapa de características, típicamente quedándose con el máximo (max pooling) o el promedio de cada bloque.
- **invarianza a traslaciones**: capacidad de reconocer un patrón sin importar en qué posición de la imagen aparezca, gracias a compartir el mismo kernel en toda ella.
