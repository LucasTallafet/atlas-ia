---
id: funciones
estado: borrador
---

## En una frase

Una función asigna a cada entrada una única salida; un modelo de IA no es más que una función, lineal o no, que convierte datos en predicciones.

## Intuición

Piensa en una máquina expendedora: metes una moneda y un código, y siempre sale el mismo producto para esa combinación. Nunca dos productos distintos para el mismo código, ni nada si no metes moneda. Eso es una **función**: una regla fija que convierte cada entrada en una única salida.

En inteligencia artificial, cualquier modelo —desde una recta que predice precios hasta una red neuronal que reconoce caras— es, en el fondo, una función de este tipo: recibe datos (una imagen, un texto, un vector de medidas) y devuelve algo (una etiqueta, un número, una probabilidad). Entender qué formas puede tener esa función —recta, curva, con quiebros— es entender qué puede y qué no puede aprender un modelo.

## Explicación

### La función como máquina de transformar entradas en salidas

Formalmente, una función es $f: X \to Y$, con $f(x)=y$. Al conjunto $X$ se le llama **dominio** (las entradas válidas) y a $Y$, **codominio** (las salidas que la definición permite). La **imagen** de $f$ es el subconjunto de $Y$ que realmente se produce al recorrer el dominio entero: $\mathrm{Im}(f)=\{f(x):x\in X\}\subseteq Y$. Por ejemplo, si modelas la nota de un examen a partir de las horas de estudio, el codominio podría declararse como $\mathbb{R}$, pero la imagen real quedará dentro de $[0,10]$.

En IA, el dominio suele ser el **espacio de características**: cada ejemplo es un vector con $d$ atributos, $X\subseteq\mathbb{R}^d$. El codominio depende de la tarea: en regresión, $Y=\mathbb{R}$; en clasificación binaria, $Y=\{0,1\}$ (etiqueta) o $Y=[0,1]$ (probabilidad); en clasificación multiclase, un vector de probabilidades que suman 1. Declarar bien el codominio no es un detalle: condiciona cómo se diseña la función de pérdida y cómo se interpretan los resultados.

### Funciones lineales: el primer modelo predictivo

La función más simple es la **recta**, $f(x)=mx+b$: la pendiente $m$ dice cuánto cambia la salida por cada unidad de entrada, y $b$ fija el valor cuando $x=0$. Con varias características se convierte en un **hiperplano**, $\hat y = \mathbf{w}\cdot\mathbf{x}+b$: el vector de pesos $\mathbf{w}$ marca la dirección de mayor crecimiento de la predicción. Es el modelo más transparente e interpretable, y el punto de partida de la regresión lineal.

### Tres límites de lo lineal, y cómo superarlos sin abandonarlo

Lo lineal falla en tres situaciones típicas, y en los tres casos la solución es enriquecer las entradas, no descartar el marco lineal.

Cuando la relación **se curva** (saturación: cada hora extra de estudio ayuda menos), una recta fuerza un compromiso que falla en los extremos. La salida es ampliar las entradas con nuevas características, por ejemplo $\phi(x)=(x,x^2)$, y ajustar un modelo lineal sobre ellas: sigue siendo lineal en los parámetros, pero ya dibuja curvas.

Cuando los efectos **interactúan** (el rendimiento de cada hora de estudio depende de si el material es de calidad), un modelo aditivo $\hat y=w_1x_1+w_2x_2+b$ solo puede desplazar una recta, no cambiar su pendiente entre grupos. Añadir el producto $x_1x_2$ como nueva columna permite que el modelo aprenda esa dependencia cruzada.

Cuando la frontera de separación **no es una recta** (positivos rodeando a negativos en un anillo), ningún hiperplano en las coordenadas originales sirve. Añadir una característica radial, $r^2=x_1^2+x_2^2$, convierte "dentro vs. fuera" en un simple umbral sobre $r^2$: la frontera vuelve a ser lineal, pero en el espacio adecuado. Esta idea de re-describir el espacio para que baste una frontera lineal es la que hay detrás de los métodos de base, los *kernels* y, eventualmente, de las redes neuronales.

### Funciones exponenciales y logarítmicas

La **exponencial**, $g(t)=g_0 a^t$, describe procesos **multiplicativos**: el ritmo de cambio es proporcional al valor ya alcanzado, lo que produce ese despegue característico de descargas virales o usuarios activos. La **logarítmica**, compañera inversa de la exponencial, describe **rendimientos decrecientes**: cada paso aporta menos que el anterior, porque lo relevante es el cambio proporcional, no el absoluto.

Esta pareja tiene un papel especial con las probabilidades. Como $P(\cdot)\in[0,1]$ está acotada, muchos modelos trabajan mejor transformándola con la función **logit**, $\mathrm{logit}(p)=\log\!\big(p/(1-p)\big)$, que la "desacota" a toda la recta real (la usa, por ejemplo, la regresión logística). Además, el logaritmo convierte productos en sumas, $\log(a\cdot b)=\log a+\log b$, lo que evita que multiplicar muchas probabilidades pequeñas se vuelva numéricamente inmanejable (ver A fondo).

### Funciones polinómicas

Las funciones **polinómicas**, como $f(x)=w_0+w_1x+w_2x^2$, introducen curvatura —máximos, mínimos, tramos que se doblan— sin dejar de ser lineales en sus parámetros $w_0,w_1,w_2$: por eso los mismos métodos de ajuste lineal (mínimos cuadrados) siguen aplicándose. Con varias variables, un término como $x_1x_2$ captura interacciones entre ellas, igual que en el caso lineal.

### Transformar los datos antes de modelar

A veces no hace falta cambiar el modelo, sino el sistema de coordenadas en el que se mira el problema. La transformación logarítmica $\log(x+1)$ comprime valores extremos y convierte cambios absolutos en cambios relativos, útil en variables muy asimétricas (como ingresos). La **estandarización**, $z=(x-\mu)/\sigma$, centra y escala cada variable para que todas contribuyan de forma equilibrada al ajuste, algo especialmente importante en algoritmos basados en gradiente, donde una variable con valores mucho mayores que las demás puede dominar el entrenamiento.

## Formalización

$$
f: X \to Y, \qquad f(x)=y, \qquad \mathrm{Im}(f)=\{f(x):x\in X\}\subseteq Y
$$

donde:

- $X$ es el dominio (entradas válidas).
- $Y$ es el codominio (salidas permitidas por la definición).
- $\mathrm{Im}(f)$ es la imagen: las salidas que realmente se producen.

$$
f(x)=mx+b \qquad\qquad \hat y = \mathbf{w}\cdot\mathbf{x}+b
$$

donde:

- $m$ es la pendiente y $b$ la ordenada en el origen, en una variable.
- $\mathbf{w}$ es el vector de pesos y $b$ el sesgo, en $d$ variables.
- $\mathbf{x}\in\mathbb{R}^d$ es el vector de características de un ejemplo.

$$
g(t)=g_0a^t \qquad h(x)=\log(x) \qquad \mathrm{logit}(p)=\log\left(\frac{p}{1-p}\right) \qquad z=\frac{x-\mu}{\sigma}
$$

donde:

- $g_0$ es el valor inicial y $a$ la base de crecimiento (o decrecimiento si $0<a<1$).
- $p\in(0,1)$ es una probabilidad.
- $x$ es un valor observado, $\mu$ su media y $\sigma$ su desviación típica.

## Interactivo

```widget
motor: funcion
modo: familias
funciones: [{"expr": "m*x+b", "etiqueta": "lineal"}, {"expr": "a*exp(k*x)", "etiqueta": "exponencial"}, {"expr": "a*log(x)+b", "etiqueta": "logarítmica"}, {"expr": "w0+w1*x+w2*x^2", "etiqueta": "polinómica"}]
parametros: [{"nombre": "m", "min": -2, "max": 2, "paso": 0.1, "valor": 1, "etiqueta": "pendiente"}, {"nombre": "b", "min": -5, "max": 5, "paso": 0.5, "valor": 0, "etiqueta": "término independiente"}, {"nombre": "a", "min": -2, "max": 2, "paso": 0.1, "valor": 1, "etiqueta": "amplitud/base"}, {"nombre": "k", "min": -1, "max": 1, "paso": 0.05, "valor": 0.3, "etiqueta": "tasa"}, {"nombre": "w0", "min": -5, "max": 5, "paso": 0.5, "valor": 0, "etiqueta": "w0"}, {"nombre": "w1", "min": -2, "max": 2, "paso": 0.1, "valor": 1, "etiqueta": "w1"}, {"nombre": "w2", "min": -1, "max": 1, "paso": 0.05, "valor": -0.2, "etiqueta": "w2"}]
x: [0.1, 10]
```

- Prueba a activar solo "lineal" y "polinómica" con $w_2<0$: observa cómo la parábola se aplana mientras la recta sigue creciendo sin límite.
- Prueba a comparar "exponencial" y "logarítmica" a la vez: son casi espejos una de otra.
- Prueba a subir la pendiente $m$ hasta que la recta ya no se parezca en nada al tramo inicial de la exponencial.

## En código

```python
import math

# Transformación logit: "desacotar" una probabilidad a toda la recta real
for p in [0.05, 0.5, 0.8, 0.95]:
    print(f"logit({p}) = {math.log(p / (1 - p)):.3f}")
# logit(0.05) = -2.944 | logit(0.5) = 0.000 | logit(0.8) = 1.386 | logit(0.95) = 2.944

# Estandarización: centrar y escalar una variable
datos = [10, 12, 11, 15, 9]
media = sum(datos) / len(datos)
desv = (sum((x - media) ** 2 for x in datos) / len(datos)) ** 0.5
z = [(x - media) / desv for x in datos]
print([round(v, 2) for v in z])  # [-0.68, 0.29, -0.19, 1.75, -1.17]
```

## Errores típicos

- **Error**: pensar que un modelo lineal jamás puede representar curvas. → **Correcto**: puede, si se enriquecen las entradas (potencias, productos, transformaciones); sigue siendo lineal en los parámetros, no en las variables originales.
- **Error**: asumir que codominio e imagen son siempre lo mismo. → **Correcto**: el codominio es lo que la definición permite; la imagen es lo que realmente ocurre, y casi siempre es un subconjunto más pequeño.
- **Error**: sumar los efectos de dos variables cuando en realidad se potencian entre sí. → **Correcto**: si el efecto de una variable depende del valor de otra, hace falta un término de interacción ($x_1x_2$); un modelo puramente aditivo fuerza rectas paralelas que no encajan con los datos.
- **Error**: aplicar $\log(x)$ directamente a variables que pueden valer cero. → **Correcto**: usar $\log(x+1)$, porque $\log(0)$ no está definido y valores muy próximos a cero disparan el logaritmo hacia $-\infty$.

## En resumen

- **Qué es**: una función asigna a cada entrada del dominio $X$ una única salida en el codominio $Y$; un modelo de IA es una función de este tipo.
- **Lineal**: $f(x)=mx+b$ (o $\hat y=\mathbf{w}\cdot\mathbf{x}+b$ con varias variables); simple, interpretable, pero limitada.
- **Tres límites de lo lineal**: curvatura, interacciones y fronteras no rectas; los tres se resuelven enriqueciendo las entradas (potencias, productos, variables radiales), no abandonando el modelo lineal.
- **No lineales típicas**: exponencial (crecimiento multiplicativo), logarítmica (rendimientos decrecientes, inversa de la exponencial), polinómica (curvatura controlada, lineal en los parámetros).
- **Fórmula clave**: $\mathrm{logit}(p)=\log(p/(1-p))$ conecta probabilidades acotadas con modelos lineales sin acotar.
- **Cuándo transformar los datos**: variables muy asimétricas (log), escalas muy distintas entre variables (estandarización).
- **Trampa principal**: confundir "el modelo es lineal en los parámetros" con "el modelo solo puede dibujar rectas"; son cosas distintas.

## A fondo

### El logaritmo evita el *underflow* en la log-verosimilitud

Cuando un modelo evalúa la probabilidad conjunta de muchas observaciones (por ejemplo, la probabilidad de que una secuencia de 100 palabras aparezca en spam), multiplica cien probabilidades pequeñas. Si cada una vale $10^{-5}$, el producto es $10^{-500}$: un número tan pequeño que la aritmética de punto flotante habitual (que solo representa hasta aproximadamente $10^{-308}$) lo redondea a cero, perdiendo toda la información. Tomando logaritmos, el producto se convierte en una suma, $\log(P_{total})=\sum_i \log(p_i) = 100\cdot(-5) = -500$: un número perfectamente manejable. Por eso el entrenamiento trabaja siempre con la log-verosimilitud y solo exponencia al final, si hace falta reportar una probabilidad.

### Escala logarítmica: comprimir para comparar

Cuando los datos varían en varios órdenes de magnitud —tamaño de un dataset, número de parámetros de un modelo, coste de entrenamiento— una escala lineal aplasta visualmente los valores pequeños. En una escala logarítmica, cada multiplicación por el mismo factor ocupa la misma distancia visual, así que un error que baja de $1{,}0$ a $0{,}1$ y luego a $0{,}01$ se ve como dos saltos iguales (cada uno una mejora de diez veces), aunque en escala lineal el segundo salto parezca casi invisible. Por eso los avances en IA (rendimiento, número de parámetros) casi siempre se representan en gráficos logarítmicos.

## Autoevaluación

### Defines un clasificador de spam como $f:X\to[0,1]$ en vez de $f:X\to\mathbb{R}$. ¿Qué declaras al elegir ese codominio?
- [ ] Que el dominio $X$ ya no incluye todos los correos posibles.
- [x] Que la salida se interpreta como una probabilidad, lo que condiciona la función de pérdida y cómo se leen los resultados.
- [ ] Que la imagen de $f$ será exactamente $\{0,1\}$.
> Por qué: declarar el codominio como $[0,1]$ compromete al modelo a devolver valores interpretables como probabilidad; con $\mathbb{R}$ no habría esa garantía y la pérdida tendría que tratarse de otra forma.

### Un modelo predice el precio de una vivienda a partir de sus metros cuadrados y de si tiene garaje (0 o 1). Los pisos con garaje suben de precio más deprisa por cada metro cuadrado extra que los que no lo tienen. ¿Qué falta en $\hat y = w_1\cdot\text{metros} + w_2\cdot\text{garaje} + b$?
- [ ] Nada: un modelo lineal ya captura ese efecto automáticamente.
- [x] Un término de interacción $w_3\cdot(\text{metros}\cdot\text{garaje})$, para que la pendiente de "metros" pueda cambiar según haya o no garaje.
- [ ] Sustituir "metros" por $\log(\text{metros})$.
> Por qué: sin el término producto, el modelo solo puede desplazar la recta entre los dos grupos (mismo pendiente, distinta altura); para que la pendiente misma cambie con el garaje hace falta la interacción.

### Tienes un conjunto de puntos donde la clase A rodea el origen y la clase B forma un anillo a su alrededor. ¿Qué característica añadida permite separarlos con una regla lineal?
- [ ] $x_1+x_2$
- [x] $r^2=x_1^2+x_2^2$, la distancia al cuadrado respecto al origen.
- [ ] $\log(x_1)$
> Por qué: en el espacio original ninguna recta separa un círculo central de un anillo que lo rodea, pero al añadir $r^2$ el problema se reduce a umbralizar esa nueva variable: una frontera lineal en $(x_1,x_2,r^2)$ se proyecta como un círculo en el plano original.

### Multiplicas 50 probabilidades de $10^{-4}$ cada una para obtener la verosimilitud conjunta de un modelo. ¿Por qué es más seguro trabajar con la suma de sus logaritmos que con el producto directo?
- [ ] Porque sumar es más rápido que multiplicar en cualquier ordenador.
- [x] Porque el producto ($10^{-200}$) puede desbordar por abajo la precisión de punto flotante y redondearse a cero, mientras que la suma de logaritmos ($-200$) es un número perfectamente representable.
- [ ] Porque las probabilidades no se pueden multiplicar entre sí.
> Por qué: $(10^{-4})^{50}=10^{-200}$ está dentro del rango representable en este caso, pero con más factores o probabilidades más pequeñas se llega fácilmente al *underflow*; trabajar en log evita ese límite mucho antes y de forma sistemática.

## Glosario

- **Función**: regla que asigna a cada elemento del dominio un único elemento del codominio.
- **Dominio**: conjunto de entradas para las que la función está definida.
- **Codominio**: conjunto de salidas permitidas por la definición de la función.
- **Imagen**: subconjunto del codominio que realmente se produce al aplicar la función al dominio entero.
- **Hiperplano**: generalización de una recta a varias dimensiones; frontera o superficie definida por $\mathbf{w}\cdot\mathbf{x}+b=0$.
- **Término de interacción**: producto de dos variables ($x_1x_2$) añadido a un modelo para capturar que el efecto de una depende del valor de la otra.
- **Logit**: transformación $\log(p/(1-p))$ que convierte una probabilidad en un valor real sin acotar.
- **Log-verosimilitud**: logaritmo de la probabilidad conjunta de un conjunto de observaciones; convierte productos inestables en sumas estables.
- **Estandarización**: transformación $z=(x-\mu)/\sigma$ que centra una variable en 0 y le da desviación típica 1.
