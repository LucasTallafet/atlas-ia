---
id: reduccion-dimensionalidad
estado: borrador
---

## En una frase

La reducción de dimensionalidad transforma muchas variables originales en unas pocas variables nuevas que conservan la mayor parte de la información, para simplificar el modelo sin perder lo esencial.

## Intuición

Piensa en una foto aérea de una ciudad tomada desde muy alto: no distingues cada persona ni cada coche, pero sí ves con claridad las avenidas principales, los barrios y los parques, es decir, la estructura que realmente importa para entender la ciudad. Reducir dimensionalidad hace algo parecido con los datos: en vez de mirar cientos de variables a la vez, busca las pocas direcciones que concentran la información relevante y descarta el resto como detalle poco útil.

Esto importa en IA porque cuantas más variables tiene un conjunto de datos, más difícil es que un modelo encuentre patrones fiables: el espacio se vuelve tan grande que los datos parecen dispersos incluso cuando hay estructura real detrás, la [[integral-monte-carlo|maldición de la dimensionalidad]].

## Explicación

### Dos caminos: seleccionar o extraer

Ya viste en [[seleccion-caracteristicas]] una forma de reducir variables: elegir un subconjunto de las originales y descartar el resto. La reducción de dimensionalidad, en el sentido de este concepto, sigue el otro camino: la **extracción de características**, que combina las variables originales en un conjunto más pequeño de variables nuevas, en vez de simplemente descartar algunas.

### PCA: capturar la máxima varianza

El **Análisis de Componentes Principales (PCA)** transforma las variables originales en **componentes ortogonales** (no correlacionados entre sí), ordenados de mayor a menor varianza explicada. El primer componente es la dirección en la que los datos varían más; el segundo, la siguiente dirección de mayor varianza que además es perpendicular al primero, y así sucesivamente. Quedándote con los primeros componentes —los de mayor varianza— conservas la mayor parte de la información con muchas menos variables.

Para calcularlos, PCA se apoya en los [[autovalores-svd|autovalores y autovectores]] de la matriz de covarianza de los datos centrados (con media 0 en cada variable, ver [[escalado]]): cada autovector marca una dirección de los componentes, y su autovalor asociado indica cuánta varianza captura esa dirección. Los componentes con autovalor mayor son los que conviene conservar.

### LDA: separar clases, no solo explicar varianza

El **Análisis Discriminante Lineal (LDA)** también proyecta los datos en un espacio de menor dimensión, pero con un objetivo distinto: mientras PCA es no supervisado y busca la varianza total, LDA es supervisado y usa las **etiquetas de clase** para encontrar las direcciones que mejor **separan las clases**, maximizando la distancia entre sus medias y minimizando la dispersión dentro de cada una. Con $C$ clases, LDA reduce como máximo a $C-1$ dimensiones, porque la información discriminativa se agota en las diferencias entre clases. Es más adecuado que PCA cuando el objetivo final es clasificar, aunque asume que las clases tienen una distribución aproximadamente normal con covarianzas similares.

### El coste de reducir: menos ruido, menos interpretabilidad

Reducir dimensionalidad mejora la eficiencia computacional y reduce el riesgo de sobreajuste, sobre todo con pocos datos y muchas variables. El precio es la **interpretabilidad**: un componente principal es una combinación lineal de las variables originales, así que ya no se lee tan directamente como "ingresos" o "edad". Conviene sopesar ese equilibrio según si el objetivo es predecir bien o explicar el porqué de cada predicción.

:::ampliacion
**t-SNE** (*t-distributed Stochastic Neighbor Embedding*) es una técnica de reducción de dimensionalidad no lineal, pensada sobre todo para visualizar datos de alta dimensión en 2 o 3 dimensiones. A diferencia de PCA, que busca ejes que maximicen la varianza global, t-SNE prioriza conservar las distancias relativas entre puntos cercanos, de modo que observaciones parecidas queden agrupadas visualmente aunque su relación no sea lineal. A cambio de esa flexibilidad, no conserva bien las distancias globales —dos grupos alejados en la visualización no implican que estén muy separados en el espacio original— y su resultado depende de un hiperparámetro de "perplejidad" que hay que ajustar. Es habitual aplicarlo sobre representaciones ya reducidas o aprendidas, como los embeddings de palabras o de imágenes, para inspeccionar visualmente si existen agrupaciones.
Fuente: Van der Maaten, L. & Hinton, G. (2008). "Visualizing Data using t-SNE". Journal of Machine Learning Research, 9, 2579-2605.
:::

## Formalización

$$
\det(\mathbf{\Sigma} - \lambda \mathbf{I}) = 0
$$

donde:

- $\mathbf{\Sigma}$ es la matriz de covarianza de las variables centradas.
- $\lambda$ representa los autovalores de $\mathbf{\Sigma}$: cada uno mide la varianza que captura su componente asociado.
- $\mathbf{I}$ es la matriz identidad.

Resolviendo esta ecuación característica se obtienen los autovalores; sustituyendo cada uno en $(\mathbf{\Sigma} - \lambda \mathbf{I})\mathbf{v} = \mathbf{0}$ se hallan los autovectores $\mathbf{v}$, que son las direcciones de los componentes principales. Los datos se proyectan sobre un componente calculando el producto escalar entre cada observación centrada y el autovector **normalizado** (de longitud 1) asociado.

:::nota-fuente
El material original calcula, para un ejemplo con altura y peso de 3 personas, el autovector $v_1=[1,1]$ (sin normalizar) y proyecta los datos centrados directamente sobre él, obteniendo los valores $-20, 0, 20$. Esa cuenta no sigue la convención estándar de PCA, que exige normalizar el autovector a longitud 1 antes de proyectar: usando $v_1=(1/\sqrt2,\, 1/\sqrt2)$, la proyección correcta es $-14{,}14,\; 0,\; 14{,}14$ (verificado con `numpy.linalg.eigh`). La dirección que señala el autovector es la misma en ambos casos; solo cambia la escala del resultado por no haber normalizado.
:::

**Ejemplo:** con las alturas $\{160, 170, 180\}$ cm y pesos $\{55, 65, 75\}$ kg de 3 personas, la matriz de covarianza tras centrar los datos es $\begin{bmatrix}100 & 100\\100 & 100\end{bmatrix}$. Sus autovalores son $\lambda_1=200$ y $\lambda_2=0$: el primer componente concentra toda la varianza, y el segundo no aporta nada, señal de que altura y peso están perfectamente correlacionados en este ejemplo. Proyectando sobre el autovector normalizado del primer componente, las tres personas quedan representadas por un único número cada una: $-14{,}14,\; 0,\; 14{,}14$, en vez de dos (altura y peso).

## Interactivo

```widget
motor: dispersion2d
modo: pca
dataset: {"generador": "lineal", "n": 60, "ruido": 0.3, "clases": 1, "semilla": 2}
arrastrables: true
```

- Prueba a girar el eje del primer componente hasta que quede alineado con la dirección en la que más se dispersan los puntos: fíjate en cómo sube la varianza explicada.
- Prueba a proyectar los puntos sobre el primer componente y observa cuánta información se pierde frente a mantener las dos dimensiones originales.
- Prueba a comparar la varianza explicada por el primer y el segundo componente: ¿qué te dice esa diferencia sobre si merece la pena reducir a una sola dimensión aquí?

## Errores típicos

- **Error**: aplicar PCA sin haber escalado antes las variables. → **Correcto**: si una variable tiene una escala mucho mayor que otra, dominará la varianza y, con ella, los primeros componentes, aunque no sea la más relevante para el problema; conviene [[escalado|estandarizar]] antes.
- **Error**: pensar que el primer componente principal siempre corresponde a una variable original reconocible. → **Correcto**: es una combinación lineal de todas las variables originales, por lo que suele perder la interpretabilidad directa de "altura" o "peso".
- **Error**: usar PCA cuando el objetivo es separar clases lo mejor posible. → **Correcto**: PCA maximiza la varianza total sin mirar las etiquetas; si hay clases y el objetivo es separarlas, LDA suele ser más adecuado.
- **Error**: interpretar t-SNE como si conservara distancias globales igual que PCA. → **Correcto**: t-SNE prioriza las relaciones de vecindad local; la distancia entre grupos alejados en su visualización no es fiable para comparar cuán distintos son en el espacio original.

## En resumen

- **Qué hace**: transforma muchas variables en unas pocas que conservan la mayor parte de la información, en vez de solo descartar variables como en [[seleccion-caracteristicas]].
- **PCA**: no supervisado, busca las direcciones (componentes ortogonales) que maximizan la varianza total de los datos.
- **LDA**: supervisado, busca las direcciones que mejor separan las clases; reduce como máximo a $C-1$ dimensiones con $C$ clases.
- **Fórmula clave**: los componentes de PCA son los autovectores de la matriz de covarianza; su autovalor asociado mide cuánta varianza capturan.
- **Cuándo usarlo**: con muchas variables correlacionadas entre sí, para acelerar el entrenamiento o combatir la maldición de la dimensionalidad; menos indicado si necesitas interpretar cada variable original.
- **Trampa principal**: no escalar antes de aplicar PCA, dejando que una variable con valores más grandes domine los componentes solo por su magnitud.

## A fondo

El espacio vectorial en el que "viven" los datos puede tener cientos o miles de dimensiones —una por cada palabra de un vocabulario o cada píxel de una imagen—, y ahí la maldición de la dimensionalidad se nota más: los patrones se dispersan y cuesta más distinguirlos. El álgebra lineal ofrece una respuesta directa: si existen relaciones lineales entre muchas variables (dos formas de medir lo mismo, como metros y pies cuadrados), PCA las detecta como direcciones con varianza casi nula y permite prescindir de ellas sin perder información real.

Más allá de tablas de variables, PCA y variantes como t-SNE se aplican también a imágenes y a representaciones aprendidas por redes neuronales: comprimir una imagen a sus componentes principales retiene los rasgos visuales más importantes con muchos menos valores. Esta misma idea de comprimir a un espacio de menor dimensión reaparecerá más adelante con los **autoencoders**, y en el procesamiento de texto con los **embeddings de palabras**, ambos pensados para representar datos complejos con muchas menos dimensiones que las originales.

## Autoevaluación

### Tienes un conjunto de datos con dos variables casi perfectamente correlacionadas (superficie en metros cuadrados y en pies cuadrados). ¿Qué esperarías ver al calcular los autovalores de PCA?
- [ ] Dos autovalores muy similares y grandes.
- [x] Un autovalor mucho mayor que el otro, cercano a cero: la segunda dirección apenas aporta varianza porque ambas variables miden casi lo mismo.
- [ ] Autovalores negativos, porque las variables están correlacionadas.
> Por qué: cuando dos variables son casi redundantes, casi toda la varianza se concentra en una sola dirección; el autovalor de la dirección restante tiende a cero, como en el ejemplo de altura y peso perfectamente correlacionados.

### Quieres reducir dimensionalidad para mejorar la separación entre dos clases conocidas antes de entrenar un clasificador. ¿PCA o LDA?
- [ ] PCA, porque siempre conserva más información que LDA.
- [x] LDA, porque usa las etiquetas de clase para maximizar la separación entre ellas, algo que PCA no considera al buscar solo la varianza total.
- [ ] Ninguno de los dos: ambos son técnicas de selección de características, no de extracción.
> Por qué: PCA es no supervisado y puede elegir direcciones que no ayudan a distinguir las clases; LDA está diseñado específicamente para maximizar esa separación.

### Aplicas PCA sin escalar antes a un dataset con "ingresos" (en miles de euros) y "edad" (en años). ¿Qué es lo más probable que ocurra?
- [ ] Los dos componentes reflejarán por igual ambas variables.
- [x] El primer componente estará dominado por "ingresos", simplemente porque su escala numérica es mucho mayor, aunque "edad" sea igual de relevante para el problema.
- [ ] PCA fallará y no podrá calcular ningún componente.
> Por qué: PCA maximiza la varianza medida en las unidades originales; sin escalar, la variable con valores más grandes domina esa varianza y, con ella, los primeros componentes.

### En el ejemplo de altura y peso, ¿qué significa que el segundo autovalor sea $\lambda_2=0$?
- [ ] Que hay un error en el cálculo, porque ningún autovalor puede ser cero.
- [x] Que la segunda dirección no aporta variabilidad adicional: toda la información relevante de estas dos variables cabe en una sola dimensión.
- [ ] Que las dos variables originales, altura y peso, no están relacionadas entre sí.
> Por qué: un autovalor de cero indica que esa dirección no captura varianza alguna; en este ejemplo, altura y peso están perfectamente correlacionados, así que un único componente basta para representarlos sin pérdida de información.

## Glosario

- **Extracción de características**: creación de un conjunto reducido de variables nuevas que combinan las originales, a diferencia de la selección, que descarta variables sin transformarlas.
- **Componentes ortogonales**: variables derivadas que no están correlacionadas entre sí, cada una capturando una parte distinta de la variabilidad de los datos.
- **PCA (Análisis de Componentes Principales)**: técnica no supervisada que transforma variables correlacionadas en componentes ortogonales ordenados por varianza explicada.
- **LDA (Análisis Discriminante Lineal)**: técnica supervisada de reducción de dimensionalidad que maximiza la separación entre clases.
