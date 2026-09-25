---
id: autoencoders
estado: borrador
---

## En una frase

Un autoencoder es una red que aprende a comprimir un dato en una representación reducida y a reconstruirlo después, usando el propio dato como su única etiqueta.

## Intuición

Imagina que describes una foto a un amigo sin mostrársela: en vez de enumerar cada píxel, dices "un atardecer con nubes anaranjadas sobre el mar". Esa frase es una versión comprimida de la imagen. Si tu amigo la dibuja a partir de tu descripción, el resultado no será idéntico al original, pero si la información clave se transmitió bien, será bastante parecido. Un **autoencoder** hace lo mismo con una red neuronal: toma un dato, lo resume en un **espacio latente** de pocas dimensiones y luego intenta reconstruirlo a partir de ese resumen.

Lo interesante es que nadie le dice a la red qué debe resumir: aprende sola, comparando la reconstrucción con el original y ajustando sus pesos para que ambos se parezcan cada vez más. Esa capacidad de encontrar representaciones compactas sin intervención manual es la base de usos muy distintos entre sí: reducir variables, limpiar ruido de una imagen o detectar una transacción bancaria que no encaja con el patrón habitual.

## Explicación

### Codificador, espacio latente y decodificador

Un autoencoder consta de dos redes que se entrenan juntas. El **codificador** ($f_\theta$) transforma la entrada $X$ en una representación comprimida $Z$, de menor dimensión. El **decodificador** ($g_\phi$) intenta reconstruir la entrada original a partir de $Z$. Cuanto mejor estructurado esté el espacio latente, más fielmente puede reconstruirse la entrada con menos números que los originales.

### Cómo se entrena: ni supervisado ni no supervisado

Un autoencoder no recibe etiquetas externas, lo que a primera vista lo acerca al aprendizaje no supervisado. Pero sí tiene una señal de error clara: la diferencia entre la entrada y su propia reconstrucción. Por eso se dice que su entrenamiento es **autosupervisado**: la "etiqueta" de cada ejemplo es el propio dato de entrada. Esto lo distingue tanto del aprendizaje supervisado (pares entrada-salida dados de antemano) como del no supervisado clásico —por ejemplo, [[clustering]]—, donde no existe ninguna comparación directa entre una salida generada y un objetivo.

### Para qué sirve

Aunque nació para la [[reduccion-dimensionalidad|reducción de dimensionalidad]] —a diferencia de PCA, puede aprender transformaciones no lineales—, un autoencoder también sirve para **eliminar ruido**: se entrena con versiones corrompidas de un dato y se le pide reconstruir la versión limpia, obligando al espacio latente a quedarse solo con lo esencial. Y sirve para **detectar anomalías**: si se entrena únicamente con ejemplos normales (por ejemplo, transacciones legítimas), una entrada atípica se reconstruye mal, y ese error de reconstrucción alto es la señal de alarma.

### El autoencoder variacional (VAE): de un punto a una región

Un autoencoder clásico mapea cada entrada a un único punto fijo del espacio latente: es útil para comprimir o limpiar, pero limita la generación de datos nuevos, porque la mayoría de puntos intermedios entre dos ejemplos entrenados no corresponden a nada coherente. Un **VAE** (*Variational Autoencoder*) resuelve esto haciendo que el codificador no produzca un punto, sino los parámetros de una [[dist-normal|distribución normal]] ($\mu$, $\sigma$): cada entrada ocupa una pequeña región del espacio latente en vez de un punto exacto. Al entrenar muchas de esas regiones para que se solapen y se agrupen cerca del origen, el espacio intermedio entre dos ejemplos también genera datos razonables, lo que permite interpolar y crear muestras nuevas.

## Formalización

El proceso básico de un autoencoder, dado un dato $X$:

$$Z = f_{\theta}(X), \qquad \hat{X} = g_{\phi}(Z)$$

donde:
- $X$: dato de entrada; $\hat{X}$: reconstrucción
- $Z$: representación en el espacio latente, de menor dimensión que $X$
- $f_\theta$: codificador, con parámetros $\theta$; $g_\phi$: decodificador, con parámetros $\phi$

La pérdida de reconstrucción mide la diferencia entre $X$ y $\hat{X}$, con **error cuadrático medio (MSE)** para datos continuos:

$$L_{MSE} = \frac{1}{N}\sum_{i=1}^{N} \lVert X_i - \hat{X}_i \rVert^2$$

o con **entropía cruzada binaria (BCE)** cuando los datos están en $[0,1]$:

$$L_{BCE} = -\frac{1}{N}\sum_{i=1}^{N}\left[X_i\log(\hat{X}_i) + (1-X_i)\log(1-\hat{X}_i)\right]$$

donde $N$ es el número de ejemplos. Ejemplo numérico: con $X=[1;\,2;\,3]$ y $\hat{X}=[1{,}2;\,1{,}9;\,3{,}3]$, $L_{MSE}=0{,}0467$ (verificado con `numpy`).

En un **VAE**, el codificador produce $\mu$ y $\sigma$, y la muestra latente se obtiene con el **truco de la reparametrización** (necesario porque muestrear directamente de $\mathcal{N}(\mu,\sigma^2)$ no es diferenciable):

$$Z = \mu + \sigma \cdot \varepsilon, \quad \varepsilon \sim \mathcal{N}(0, I)$$

donde $\varepsilon$ es ruido muestreado de una normal estándar, independiente de los parámetros aprendidos. Ejemplo: con $\mu=0{,}5$, $\sigma=0{,}8$ y $\varepsilon=0{,}3$, $Z=0{,}74$.

La pérdida final combina la reconstrucción con la **divergencia de Kullback-Leibler (KL)**, que fuerza a la distribución aprendida a parecerse a $\mathcal{N}(0,I)$:

$$L = L_{\text{reconstrucción}} + \beta \cdot D_{KL}\big(\mathcal{N}(\mu,\sigma^2) \,\|\, \mathcal{N}(0,I)\big), \qquad D_{KL} = \frac{1}{2}\left(\mu^2 + \sigma^2 - 1 - \log\sigma^2\right)$$

donde:
- $\beta$: hiperparámetro que pondera cuánto se prioriza estructurar el espacio latente frente a reconstruir con fidelidad
- $D_{KL}\geq 0$: mide cuánto se aleja la distribución latente aprendida de una normal estándar

:::nota-fuente
El material de origen escribe $D_{KL}=\frac{1}{2}\sum(1+\log\sigma^2-\mu^2-\sigma^2)$, es decir, la fórmula anterior con el signo cambiado. Verificado con `numpy`: con $\mu=0{,}5$, $\sigma=0{,}8$, esa expresión da $-0{,}1681$, un valor negativo, imposible para una divergencia KL (siempre $\geq 0$). La forma correcta, coherente con la literatura del VAE original (Kingma y Welling, 2013), es $D_{KL}=\frac{1}{2}(\mu^2+\sigma^2-1-\log\sigma^2)=0{,}1681$, la que se usa en esta ficha.
:::

## Interactivo

```widget
motor: pasos
---
Partimos de tres dígitos manuscritos comprimidos por un autoencoder en un espacio latente de 2 dimensiones. El punto $(0,0)$ corresponde a un cero: al decodificarlo, obtenemos un cero reconstruido.
---
Nos movemos a $(2,0)$: el decodificador produce ahora una forma parecida a un uno. Cada dirección del espacio latente codifica un rasgo visual distinto (grosor del trazo, inclinación...), aprendido sin que nadie se lo dijera a la red.
---
En un autoencoder clásico, cada dígito de entrenamiento ocupa un único punto exacto. Si probamos un punto intermedio, como $(1,0)$, que no vio en el entrenamiento, la reconstrucción puede ser una forma extraña, a medio camino entre dos dígitos y sin sentido claro.
---
Un VAE, en cambio, entrena cada dígito como una pequeña región (una distribución $\mathcal{N}(\mu,\sigma^2)$) en vez de un único punto. Al forzar que esas regiones se agrupen cerca del origen y se solapen ligeramente, el espacio intermedio también produce dígitos razonables.
---
Por eso, moverte punto a punto por el espacio latente de un VAE genera una transición suave de un dígito a otro (interpolación), mientras que en un autoencoder clásico esa misma zona intermedia puede no significar nada.
```

Prueba a moverte del punto de un dígito a otro y observa si la reconstrucción intermedia tiene sentido: ¿qué diferencia notas entre el autoencoder clásico y el VAE?

Prueba a alejarte mucho del origen en el VAE: ¿qué le pasa a la calidad de la reconstrucción y por qué crees que ocurre (repasa la divergencia KL)?

Prueba a identificar qué dirección del espacio latente parece controlar un rasgo visual concreto, como el grosor del trazo.

## Errores típicos

- **Error**: pensar que un autoencoder es aprendizaje no supervisado igual que [[clustering]] → **Correcto**: sí hay una señal de error clara (la diferencia entre entrada y reconstrucción), por eso se llama autosupervisado, no no-supervisado puro.
- **Error**: creer que un autoencoder clásico puede generar datos nuevos igual que un VAE, con solo tomar un punto cualquiera del espacio latente → **Correcto**: el autoencoder clásico solo garantiza reconstrucciones fieles en los puntos que vio entrenar; el VAE está diseñado explícitamente para que el espacio intermedio también sea coherente.
- **Error**: asumir que un error de reconstrucción bajo siempre significa "dato normal" y uno alto siempre significa "anomalía real" → **Correcto**: el error de reconstrucción es una señal probabilística, no una certeza; depende de que los datos normales de entrenamiento cubran bien la variedad real de casos normales.
- **Error**: pensar que la divergencia KL sirve para medir la calidad de la reconstrucción → **Correcto**: la KL regulariza la forma del espacio latente (que se parezca a una normal estándar); la calidad de la reconstrucción la mide el término de MSE o BCE, no la KL.

## En resumen

- Un autoencoder comprime un dato en un espacio latente y lo reconstruye, entrenándose a sí mismo con su propia entrada como objetivo (autosupervisado).
- Funciona con dos piezas: el codificador $Z=f_\theta(X)$ reduce dimensiones, el decodificador $\hat X=g_\phi(Z)$ reconstruye.
- Fórmula clave: minimiza $L=\lVert X-\hat X\rVert^2$ (o entropía cruzada binaria si los datos son binarios).
- Úsalo para reducir dimensionalidad, eliminar ruido (denoising) o detectar anomalías; no lo uses cuando necesites generar muestras variadas y realistas desde cero, ahí un VAE o una [[gans|GAN]] rinden mejor.
- La decisión que más importa es el tamaño del espacio latente: demasiado grande y la red memoriza sin comprimir de verdad; demasiado pequeño y se pierde información esencial.
- La trampa principal: confundir un autoencoder clásico con un VAE; solo el VAE modela una distribución de probabilidad en el espacio latente, lo que le permite generar datos nuevos coherentes.

## A fondo

En detección de fraude, un banco entrena el autoencoder únicamente con transacciones legítimas; cuando llega una transacción nueva, si el modelo no logra reconstruirla con precisión y el error supera un umbral, se marca como sospechosa para revisión manual. La misma lógica se ha aplicado a imágenes médicas (detectar patrones patológicos) y a tráfico de red (ciberseguridad).

Los **autoencoders de eliminación de ruido** (*denoising autoencoders*, DAE) se entrenan deliberadamente con entradas corrompidas para que el modelo aprenda a recuperar la versión limpia; esto ha servido para restaurar imágenes con interferencias, mejorar señales de audio degradadas y corregir textos con errores.

Los VAE, al optimizar la divergencia KL además de la reconstrucción, tienden a generar muestras algo más borrosas que una [[gans|GAN]], porque priorizan cubrir toda la distribución aprendida en vez de producir ejemplos muy nítidos. Para mitigarlo existen variantes como los **β-VAE** (que permiten ajustar la importancia del término de regularización) y los **VAE condicionales (CVAE)**, que permiten controlar características específicas de lo que se genera, de forma similar a como una cGAN condiciona la generación con una etiqueta.

## Autoevaluación

### Un autoencoder se entrena minimizando la diferencia entre su entrada y su salida, sin que nadie le dé etiquetas externas. ¿Cómo se clasifica mejor este tipo de entrenamiento?
- [ ] Aprendizaje supervisado, porque hay una comparación numérica exacta en cada ejemplo
- [ ] Aprendizaje no supervisado, porque no hay ninguna etiqueta
- [x] Aprendizaje autosupervisado, porque la etiqueta se genera automáticamente a partir del propio dato de entrada
> Por qué: hay una señal de error clara (entrada frente a reconstrucción), lo que lo distingue del no supervisado puro, pero esa "etiqueta" no viene de un humano, sino del propio dato, lo que lo distingue del supervisado clásico.

### Se quiere generar caras nuevas y realistas, interpolando suavemente entre dos rostros ya vistos en el entrenamiento. ¿Qué arquitectura es más adecuada?
- [ ] Un autoencoder clásico, tomando cualquier punto entre los dos rostros en el espacio latente
- [x] Un VAE, porque modela una distribución de probabilidad en el espacio latente y no solo puntos aislados
- [ ] Cualquiera de los dos produce el mismo resultado, ya que ambos comparten codificador y decodificador
> Por qué: un autoencoder clásico solo garantiza buenas reconstrucciones en los puntos vistos en el entrenamiento; el VAE fuerza a que las regiones latentes se solapen y estén cerca del origen, por lo que los puntos intermedios también decodifican en algo coherente.

### En la función de pérdida de un VAE, ¿qué papel cumple el término de divergencia KL?
- [ ] Mide la fidelidad de la reconstrucción, igual que el MSE
- [x] Regulariza la forma del espacio latente para que se parezca a una distribución normal estándar, facilitando la generación de datos nuevos
- [ ] Sustituye por completo a la pérdida de reconstrucción cuando los datos son binarios
> Por qué: la pérdida total de un VAE combina reconstrucción (fidelidad) y KL (estructura del espacio latente); son términos complementarios, no alternativos.

### Un autoencoder entrenado solo con transacciones bancarias legítimas recibe una transacción nueva y la reconstruye con un error mucho más alto que lo habitual. ¿Qué sugiere esto?
- [x] Que la transacción es atípica respecto a los patrones normales aprendidos, y podría ser fraudulenta
- [ ] Que el autoencoder ha fallado y debe descartarse el resultado
- [ ] Que el espacio latente es demasiado grande y hay que reducirlo
> Por qué: como el modelo solo vio ejemplos normales, no sabe reconstruir bien lo que se aparta de esos patrones; un error de reconstrucción alto es precisamente la señal que se usa para marcar posibles anomalías o fraudes.

## Glosario

- **espacio latente**: representación comprimida y de menor dimensión donde un autoencoder codifica sus datos de entrada.
- **codificador**: parte de la red que transforma la entrada en la representación del espacio latente.
- **decodificador**: parte de la red que reconstruye la entrada original a partir del espacio latente.
- **aprendizaje autosupervisado**: entrenamiento en el que las etiquetas se generan automáticamente a partir del propio dato de entrada, sin anotación manual.
- **truco de la reparametrización**: técnica que reescribe el muestreo de una distribución como una operación diferenciable, permitiendo entrenar un VAE con retropropagación.
- **divergencia de Kullback-Leibler (KL)**: medida de cuánto se aleja una distribución de probabilidad de otra de referencia; en el VAE, regulariza el espacio latente hacia una normal estándar.
