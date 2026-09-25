---
id: gans
estado: borrador
---

## En una frase

Una GAN entrena dos redes que compiten entre sí —un generador que inventa datos falsos y un discriminador que intenta detectarlos— hasta que el generador produce datos casi indistinguibles de los reales.

## Intuición

Piensa en un falsificador de billetes y un inspector de banco. El falsificador intenta producir billetes que parezcan reales; el inspector se esfuerza por distinguir los auténticos de los falsos. Con el tiempo, a medida que el inspector mejora, el falsificador también perfecciona su técnica para engañarlo, y viceversa. Tras muchas rondas de este pulso, el falsificador acaba produciendo billetes casi indistinguibles de los reales.

Una **red generativa antagónica** (GAN, *Generative Adversarial Network*) formaliza justo esta idea con dos redes neuronales: el **generador**, que parte de ruido aleatorio y produce muestras sintéticas, y el **discriminador**, que recibe muestras reales y falsas y aprende a distinguirlas. Entrenar a ambas a la vez, con objetivos opuestos, es lo que permite generar imágenes, audio o texto sin haberlos copiado literalmente del conjunto de entrenamiento.

## Explicación

### Dos redes, un juego

El **generador** ($G$) recibe un vector de ruido aleatorio $z$ y lo transforma en una muestra sintética $G(z)$: al principio, esta salida es aleatoria y fácil de detectar como falsa. El **discriminador** ($D$) es un clasificador binario: recibe una muestra (real o generada) y produce la probabilidad de que sea real. El discriminador intenta **maximizar** su precisión al distinguir; el generador intenta **minimizar** la capacidad del discriminador para detectarlo. Es un juego de suma cero, inspirado en la teoría de juegos.

### El entrenamiento por turnos

Cada iteración tiene dos fases. Primero se entrena el discriminador con un lote de ejemplos reales y otro de ejemplos generados, ajustando sus pesos para clasificarlos mejor. Después se entrena el generador: se le pasa ruido, produce muestras, el discriminador las evalúa, y el generador ajusta sus pesos según lo bien o mal que haya conseguido engañarlo —no según ninguna medida directa de "calidad visual". Con muchas iteraciones de este ciclo, el generador mejora hasta que el discriminador ya no distingue con confianza cuáles son reales y cuáles falsas.

### Cuando el juego se rompe

Entrenar una GAN es frágil porque depende de que ambas redes mejoren a un ritmo parecido. Los problemas más comunes son el **colapso de modo** (el generador encuentra una única salida que engaña al discriminador y deja de explorar el resto de la variedad de los datos reales) y la **oscilación o dificultad de convergencia** (si el discriminador se vuelve demasiado bueno demasiado pronto, el generador deja de recibir un gradiente útil para aprender).

## Formalización

El objetivo de una GAN se expresa como un juego minimax:

$$\min_G \max_D \; \mathbb{E}_{x \sim p_{data}(x)}[\log D(x)] + \mathbb{E}_{z \sim p_z(z)}[\log(1 - D(G(z)))]$$

donde:
- $D(x)$: probabilidad que asigna el discriminador de que $x$ sea real
- $G(z)$: muestra sintética producida por el generador a partir de ruido $z$
- $p_{data}$: distribución de los datos reales; $p_z$: distribución del ruido de entrada (por ejemplo, normal o uniforme)
- $\mathbb{E}[\cdot]$: esperanza sobre las muestras indicadas

Ejemplo numérico: si en un momento del entrenamiento $D(x_{real})=0{,}9$ y $D(G(z))=0{,}3$, el discriminador aporta $\log(0{,}9)+\log(1-0{,}3)=-0{,}46$ a su objetivo (a maximizar); si el generador mejora hasta $D(G(z))=0{,}7$, el término $\log(1-D(G(z)))$ baja de $-0{,}36$ a $-1{,}20$: cuanto mejor engaña el generador al discriminador, más penaliza este término al discriminador (verificado con `numpy`).

Una **cGAN** (*Conditional GAN*) añade una variable de condición $y$ (por ejemplo, una etiqueta de clase) tanto al generador como al discriminador:

$$\min_G \max_D \; \mathbb{E}_{x,y}[\log D(x,y)] + \mathbb{E}_{z,y}[\log(1 - D(G(z,y), y))]$$

donde $y$ permite dirigir la generación hacia una categoría concreta (por ejemplo, generar solo el dígito "7" de un dataset con varios dígitos).

La **WGAN** (*Wasserstein GAN*) sustituye la métrica de similitud entre distribuciones por la distancia de Wasserstein, que da gradientes más informativos y estables:

$$W(P_r, P_g) = \inf_{\gamma \in \Pi(P_r, P_g)} \mathbb{E}_{(x,y)\sim\gamma}[\lVert x-y \rVert]$$

donde $P_r$ es la distribución real, $P_g$ la distribución generada y $\Pi(P_r,P_g)$ el conjunto de distribuciones conjuntas con esos márgenes.

## Interactivo

```widget
motor: pasos
---
Iteración 0: el generador produce ruido puro, una distribución casi plana entre $-3$ y $3$. La distribución real de los datos es una campana centrada en $x=2$. El discriminador distingue casi perfectamente: $D(x_{real})\approx0{,}9$, $D(G(z))\approx0{,}1$.
---
Iteración 50: el generador ha desplazado su masa de probabilidad hacia valores positivos, aunque sigue siendo más ancha que la distribución real. El discriminador empieza a confundirse: $D(G(z))\approx0{,}3$.
---
Iteración 200: la distribución generada casi coincide con la real en forma y posición. El discriminador ya no puede distinguirlas con confianza: $D(x_{real})\approx D(G(z))\approx0{,}5$.
---
Si el entrenamiento se desequilibra —por ejemplo, si el discriminador mejora demasiado rápido— el generador deja de recibir un gradiente útil y se queda generando siempre valores muy parecidos entre sí: es el colapso de modo.
```

Prueba a identificar en qué fotograma el discriminador ya no aporta señal útil para el generador, y explica por qué.

Prueba a describir qué le pasaría a $D(G(z))$ si el generador colapsara y generase siempre el mismo valor, como en el fotograma 4.

Prueba a comparar el valor de la función objetivo de Formalización cuando $D(x)\approx D(G(z))\approx0{,}5$ frente a cuando el discriminador distingue perfectamente.

## Errores típicos

- **Error**: pensar que el generador se entrena comparando sus muestras directamente con datos reales, como en un autoencoder → **Correcto**: el generador nunca ve los datos reales; solo recibe la respuesta del discriminador sobre si sus muestras parecen reales o falsas.
- **Error**: creer que un discriminador cada vez más preciso siempre mejora el entrenamiento → **Correcto**: si el discriminador se vuelve casi perfecto demasiado pronto, el gradiente que llega al generador se vuelve poco informativo y el entrenamiento se estanca.
- **Error**: confundir el colapso de modo con un simple "mal ajuste" → **Correcto**: el colapso de modo es un fallo específico donde el generador encuentra una estrategia que engaña al discriminador sin representar la diversidad real de los datos, no un error aleatorio de entrenamiento.
- **Error**: asumir que todas las GAN usan la misma función de pérdida → **Correcto**: variantes como la WGAN sustituyen la pérdida minimax original por una basada en la distancia de Wasserstein precisamente para evitar los problemas de estabilidad de la versión clásica.

## En resumen

- Una GAN entrena dos redes con objetivos opuestos: el generador crea datos sintéticos, el discriminador intenta distinguirlos de los reales.
- Funciona por turnos: primero se ajusta el discriminador con datos reales y falsos, después se ajusta el generador según la respuesta del discriminador.
- Fórmula clave: $\min_G \max_D \mathbb{E}[\log D(x)] + \mathbb{E}[\log(1-D(G(z)))]$, un juego minimax de suma cero.
- Úsala cuando necesites generar datos sintéticos realistas y variados (imágenes, audio); si solo necesitas comprimir o detectar anomalías, un [[autoencoders|autoencoder]] es más simple y estable de entrenar.
- Las decisiones que más importan son el equilibrio de capacidad entre generador y discriminador y la elección de variante (GAN clásica, WGAN, cGAN) según la estabilidad y el control que necesites.
- La trampa principal: el entrenamiento es inherentemente inestable; un discriminador que mejora demasiado rápido o un generador que encuentra un atajo (colapso de modo) pueden arruinar el resultado sin que el código tenga ningún error.

## A fondo

Para estabilizar el entrenamiento, la **WGAN** sustituye al discriminador por un **crítico** sin activación final acotada, que en vez de clasificar "real/falso" mide cuánto se parecen las distribuciones. Como la distancia de Wasserstein exige que el crítico sea 1-Lipschitz, la versión original recortaba los pesos a un rango pequeño (*weight clipping*); la mejora posterior, **WGAN-GP**, sustituye ese recorte por una penalización sobre la norma del gradiente, más estable.

Dos arquitecturas avanzadas ilustran hasta dónde ha llegado la idea original. **StyleGAN** (NVIDIA) transforma el vector de ruido en una representación intermedia que controla distintos niveles de detalle de la imagen (forma general, textura, iluminación), permitiendo modificar un atributo —como la edad de un rostro— sin alterar el resto: es lo que se conoce como un espacio latente "disentrelazado". **CycleGAN** resuelve un problema distinto: transformar imágenes de un dominio a otro (fotos a pinturas, caballos a cebras) sin necesitar pares de ejemplos emparejados, apoyándose en la **consistencia cíclica**: si una imagen se convierte a otro dominio y se vuelve a convertir al original, debe parecerse a la imagen de partida.

## Autoevaluación

### Durante el entrenamiento, el discriminador alcanza el 100% de precisión distinguiendo reales de falsas casi desde la primera iteración y se mantiene así. ¿Qué es más probable que ocurra?
- [ ] El generador aprenderá más rápido, porque tiene un objetivo muy claro que batir
- [x] El generador dejará de recibir un gradiente útil, porque un discriminador casi perfecto no distingue "un poco mejor" de "mucho mejor" entre sus muestras
- [ ] No pasa nada especial, el entrenamiento seguirá su curso normal
> Por qué: cuando $D$ satura sus salidas cerca de 0 o 1, el gradiente que recibe $G$ a través de $D$ se vuelve casi plano, dificultando que el generador sepa en qué dirección mejorar.

### Un generador entrenado para producir rostros empieza a devolver siempre variaciones muy parecidas de la misma cara, ignorando la diversidad del dataset de entrenamiento. ¿Cómo se llama este problema?
- [ ] Sobreajuste del discriminador
- [x] Colapso de modo
- [ ] Divergencia de Kullback-Leibler
> Por qué: el colapso de modo ocurre cuando el generador encuentra una estrategia limitada que engaña al discriminador de forma repetida, sin necesidad de cubrir toda la variedad de los datos reales.

### ¿Qué papel cumple la variable $y$ en la función objetivo de una cGAN respecto a una GAN estándar?
- [x] Condiciona tanto al generador como al discriminador para dirigir la generación hacia una categoría o característica concreta
- [ ] Sustituye por completo al vector de ruido $z$, eliminando la aleatoriedad
- [ ] Solo se usa para evaluar el modelo después del entrenamiento, no durante el entrenamiento
> Por qué: en la cGAN, $y$ se incorpora tanto en $G(z,y)$ como en $D(x,y)$, de modo que ambas redes aprenden a generar y evaluar muestras condicionadas a esa etiqueta.

### ¿Por qué la WGAN sustituye la pérdida minimax clásica por una basada en la distancia de Wasserstein?
- [ ] Porque la distancia de Wasserstein es más rápida de calcular en cualquier caso
- [x] Porque ofrece gradientes más informativos y estables incluso cuando las distribuciones real y generada no se solapan mucho
- [ ] Porque elimina por completo la necesidad de entrenar un discriminador o crítico
> Por qué: la pérdida minimax clásica puede saturarse y dar gradientes poco útiles cuando el discriminador es muy bueno; la distancia de Wasserstein mide la diferencia entre distribuciones de forma más suave y continua, reduciendo la inestabilidad del entrenamiento.

## Glosario

- **generador**: red que transforma ruido aleatorio en una muestra sintética, intentando que se parezca a los datos reales.
- **discriminador**: red que clasifica una muestra como real o generada, actuando como crítico del generador.
- **colapso de modo**: fallo del entrenamiento en el que el generador produce solo un subconjunto limitado de muestras en vez de capturar toda la variedad de los datos reales.
- **crítico**: en la WGAN, sustituye al discriminador; en vez de clasificar real/falso, estima una medida continua de cuánto se parecen las distribuciones real y generada.
- **consistencia cíclica**: principio de CycleGAN por el que convertir una imagen a otro dominio y volver al original debe reproducir aproximadamente la imagen de partida.
