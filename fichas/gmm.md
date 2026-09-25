---
id: gmm
estado: borrador
---

## En una frase

GMM agrupa datos asumiendo que provienen de varias distribuciones normales superpuestas, y en vez de asignar cada punto a un único grupo, calcula la probabilidad de que pertenezca a cada una.

## Intuición

Imagina una fiesta con varios corros de conversación: uno habla de tecnología, otro de deporte, otro de cine. Casi todo el mundo encaja claramente en un corro, pero hay invitados a caballo entre dos temas, que van y vienen. Si tuvieras que asignar a cada persona a un único corro, perderías esa información: sería más honesto decir que alguien está "70% en el corro de tecnología y 30% en el de deporte".

Eso es justo lo que hace el **modelo de mezcla de gaussianas** (GMM, *Gaussian Mixture Model*): en vez de asignar cada punto a un único clúster de forma rígida, como hace [[kmeans|K-Means]], asume que los datos provienen de varias campanas de Gauss superpuestas (ver [[dist-normal]]) y calcula, para cada punto, la probabilidad de pertenecer a cada una. Pensar en "grados de pertenencia" en lugar de "sí o no" es útil cuando los grupos reales se solapan y una frontera tajante distorsiona la realidad.

## Explicación

### De un centroide a una campana completa

K-Means resume cada clúster con un único punto, su centroide. GMM, en cambio, describe cada clúster como una distribución gaussiana completa, con tres elementos: la **media**, que marca su centro; la **matriz de covarianza**, que define su forma y orientación (más o menos alargada, en qué dirección); y el **peso**, que indica qué proporción de los datos explica ese componente.

### La probabilidad total: una mezcla de gaussianas

El modelo describe la probabilidad de cualquier punto como una suma ponderada de las densidades de cada componente gaussiana: cuanto más cerca esté un punto del centro de una componente y mayor sea su peso, más contribuye esa componente a la probabilidad total.

### Ajustar el modelo: el algoritmo de Expectación-Maximización (EM)

GMM se entrena con un proceso iterativo de dos fases que se repiten hasta converger. En la fase de **expectación**, con los parámetros actuales, se calcula para cada punto su **responsabilidad**: la probabilidad de que provenga de cada componente (por ejemplo, 60% de una y 40% de otra), sin forzar una asignación única. En la fase de **maximización**, esas responsabilidades se usan para recalcular la media, la covarianza y el peso de cada componente como promedios ponderados. Cada ciclo mejora el ajuste del modelo a los datos hasta que los cambios se vuelven mínimos.

### Elegir la forma y el número de componentes

La matriz de covarianza puede restringirse a distintas formas: **esférica** (clústeres circulares, del mismo tamaño en todas las direcciones, como en K-Means), **diagonal** (varianzas distintas por dimensión, pero sin correlación entre ellas) o **completa** (cualquier forma y orientación, capturando relaciones entre variables). El número de componentes $k$ no se decide por prueba y error mirando solo el ajuste, porque un $k$ mayor siempre ajusta mejor los datos de entrenamiento: se elige con criterios que penalizan la complejidad, como el **criterio de información bayesiano (BIC)** o el **de Akaike (AIC)**.

### Ventajas y límites

GMM modela clústeres elípticos y orientados, algo que K-Means no puede hacer al asumir siempre formas esféricas, y ofrece una medida de incertidumbre en cada asignación, útil cuando los límites entre grupos no están claros. A cambio, es sensible a la inicialización: el algoritmo EM puede quedarse en un óptimo local según el punto de partida, y su coste computacional es mayor que el de algoritmos más simples.

## Formalización

$$
p(\mathbf{x}) = \sum_{i=1}^{k} \pi_i \, \mathcal{N}(\mathbf{x} \mid \boldsymbol{\mu}_i, \boldsymbol{\Sigma}_i)
$$

donde:

- $p(\mathbf{x})$ es la densidad de probabilidad total del modelo en el punto $\mathbf{x}$.
- $k$ es el número de componentes gaussianas (clústeres).
- $\pi_i$ es el peso de la componente $i$-ésima, con $\sum_{i=1}^k \pi_i = 1$.
- $\mathcal{N}(\mathbf{x}\mid \boldsymbol{\mu}_i, \boldsymbol{\Sigma}_i)$ es la densidad gaussiana multivariante de media $\boldsymbol{\mu}_i$ y matriz de covarianza $\boldsymbol{\Sigma}_i$ (ver [[dist-normal]] para el caso de una sola variable).

$$
r_{ij} = \frac{\pi_i \, \mathcal{N}(\mathbf{x}_j \mid \boldsymbol{\mu}_i, \boldsymbol{\Sigma}_i)}{\sum_{l=1}^{k} \pi_l \, \mathcal{N}(\mathbf{x}_j \mid \boldsymbol{\mu}_l, \boldsymbol{\Sigma}_l)}
$$

donde:

- $r_{ij}$ es la responsabilidad de la componente $i$ sobre el punto $\mathbf{x}_j$: la probabilidad de que $\mathbf{x}_j$ provenga de esa componente, dados los parámetros actuales.
- El denominador normaliza para que, para cada punto $j$, las responsabilidades de todas las componentes sumen $1$: $\sum_{i=1}^k r_{ij}=1$.

Con dos componentes ajustadas sobre datos alrededor de $(1,1)$ y $(4,4)$, con pesos $\pi_1=\pi_2=0{,}5$ y medias en $(1{,}26,\,1{,}05)$ y $(3{,}73,\,3{,}9)$, un punto intermedio como $(2{,}8,\,2{,}8)$ obtiene responsabilidades de $0{,}717$ para la componente más cercana y $0{,}283$ para la otra: ninguna de las dos es cero, pero el modelo sí lo asignaría a la primera si se le pide una etiqueta única.

## Interactivo

```widget
motor: dispersion2d
modo: gmm
dataset: {"generador": "blobs", "n": 120, "ruido": 0.5, "clases": 3, "semilla": 5}
controles: [{"nombre": "k", "min": 1, "max": 6, "paso": 1, "valor": 3, "etiqueta": "número de componentes"}]
paso_a_paso: true
```

- Prueba a avanzar paso a paso el EM y observa cómo las elipses cambian de forma y orientación en cada iteración de maximización.
- Prueba a fijarte en un punto situado entre dos elipses: ¿qué responsabilidad le asigna el modelo a cada componente?
- Prueba a subir $k$ por encima del número real de grupos y observa cómo el modelo reparte una región en componentes innecesarias.

## En código

```python
import numpy as np
from sklearn.mixture import GaussianMixture

rng = np.random.RandomState(0)
X = np.vstack([rng.normal([1, 1], 0.5, (20, 2)),
               rng.normal([4, 4], 0.5, (20, 2))])
gmm = GaussianMixture(n_components=2, random_state=0).fit(X)
print("pesos:", gmm.weights_.round(2))
print("medias:", gmm.means_.round(2))
print("responsabilidades en (2.8, 2.8):", gmm.predict_proba([[2.8, 2.8]]).round(3))
# pesos: [0.5 0.5]
# medias: [[3.73 3.9 ] [1.26 1.05]]
# responsabilidades en (2.8, 2.8): [[0.717 0.283]]  -> ambiguo, pero se asignaría al grupo 0
```

## Errores típicos

- **Error**: pensar que GMM siempre da una asignación única y definitiva como K-Means. → **Correcto**: por defecto da probabilidades de pertenencia (responsabilidades); `predict()` las convierte en una etiqueta dura eligiendo la más probable, pero la incertidumbre sigue disponible con `predict_proba()`.
- **Error**: usar covarianza esférica y esperar que GMM capture clústeres alargados u orientados. → **Correcto**: solo la covarianza completa permite elipses orientadas en cualquier dirección; la esférica solo da círculos, como K-Means.
- **Error**: entrenar GMM una sola vez y asumir que el resultado es el óptimo global. → **Correcto**: el algoritmo EM puede converger a un óptimo local según la inicialización; conviene probar varias inicializaciones o semillas.
- **Error**: elegir el número de componentes $k$ solo mirando cuál ajusta mejor los datos de entrenamiento. → **Correcto**: un $k$ mayor siempre ajusta mejor; hay que penalizar la complejidad con criterios como BIC o AIC.

## En resumen

- **Qué hace**: agrupa datos asumiendo que provienen de una mezcla de $k$ distribuciones gaussianas, y da la probabilidad de que cada punto pertenezca a cada una (clustering "blando").
- **Cómo funciona**: alterna dos pasos con el algoritmo EM: expectación (calcula la responsabilidad de cada componente sobre cada punto) y maximización (recalcula medias, covarianzas y pesos con esas responsabilidades), hasta converger.
- **Fórmula clave**: $p(\mathbf{x})=\sum_{i=1}^k \pi_i\,\mathcal{N}(\mathbf{x}\mid\boldsymbol{\mu}_i,\boldsymbol{\Sigma}_i)$.
- **Cuándo usarlo**: clústeres con forma elíptica, solapados, o cuando interesa la incertidumbre de la asignación y no solo una etiqueta.
- **Cuándo no**: si necesitas grupos de forma completamente arbitraria (mejor DBSCAN) o simplicidad y velocidad (mejor K-Means).
- **Decisiones que importan**: el número de componentes $k$ (con BIC/AIC), el tipo de covarianza (esférica, diagonal o completa) y la inicialización.
- **Trampa principal**: el algoritmo EM puede quedarse en un óptimo local; el resultado depende de dónde arranca.

## A fondo

### En Scikit-learn

La clase `GaussianMixture` de `sklearn.mixture` expone `n_components` (número de componentes), `covariance_type` (`'full'`, `'tied'`, `'diag'` o `'spherical'`), `max_iter` y `init_params` (`'kmeans'` o `'random'`, para inicializar antes de arrancar EM). Tras entrenar, `weights_`, `means_` y `covariances_` dan los parámetros de cada componente, y `converged_` indica si el algoritmo llegó a estabilizarse dentro del número máximo de iteraciones.

### Aplicaciones

GMM se usa en **procesamiento de imágenes médicas**, para segmentar tejidos con intensidades que se solapan; en **biología molecular**, para agrupar genes con perfiles de expresión similares; en **reconocimiento de voz**, para modelar la variabilidad de los sonidos de distintos hablantes o fonemas; y en el ámbito financiero, para **segmentar clientes** o **detectar fraude**, asignando probabilidades de pertenencia a distintos perfiles de comportamiento en vez de categorías rígidas.

## Autoevaluación

### Un punto queda casi a medio camino entre dos componentes de un GMM ya entrenado, con responsabilidades $0{,}55$ y $0{,}45$. Al llamar a `predict()`, ¿qué obtienes?
- [ ] Un vector con las dos probabilidades, $0{,}55$ y $0{,}45$.
- [x] Una única etiqueta: la del componente con responsabilidad $0{,}55$.
- [ ] Un error, porque el punto es ambiguo.
> Por qué: `predict()` devuelve la asignación dura más probable; la información de incertidumbre (las dos probabilidades) solo se conserva si usas `predict_proba()`.

### Tus datos forman un clúster alargado y claramente inclinado en diagonal. ¿Qué `covariance_type` de `GaussianMixture` puede representarlo bien?
- [ ] `'spherical'`, porque es una opción habitual.
- [x] `'full'`, porque permite covarianzas completas con cualquier orientación.
- [ ] Ninguna: GMM no puede modelar clústeres alargados.
> Por qué: la covarianza completa permite elipses orientadas en cualquier dirección; la esférica solo produce círculos, como los clústeres de K-Means.

### Subes $k$ (el número de componentes) y el ajuste a los datos de entrenamiento mejora cada vez. ¿Es buena idea seguir subiendo $k$ indefinidamente?
- [ ] Sí, porque más componentes siempre dan un modelo mejor.
- [x] No: hay que usar un criterio como BIC o AIC, que penaliza la complejidad además de premiar el ajuste.
- [ ] No, porque GMM solo admite hasta 3 componentes.
> Por qué: igual que en otros modelos, ajustar mejor los datos de entrenamiento no implica generalizar mejor; BIC y AIC equilibran ajuste y complejidad.

### Entrenas el mismo GMM dos veces con distinta semilla aleatoria y obtienes resultados distintos. ¿Por qué?
- [x] Porque el algoritmo EM puede converger a diferentes óptimos locales según la inicialización.
- [ ] Porque GMM da un resultado aleatorio cada vez, sin relación con los datos.
- [ ] Porque hay un error en la implementación.
> Por qué: EM mejora los parámetros de forma iterativa desde un punto de partida; una inicialización distinta puede llevar a un óptimo local distinto, por eso conviene probar varias.

## Glosario

- **GMM (modelo de mezcla de gaussianas)**: modelo de clustering probabilístico que asume que los datos provienen de una combinación de varias distribuciones normales.
- **Responsabilidad**: probabilidad de que un punto pertenezca a una componente concreta del modelo, dados los parámetros actuales.
- **Algoritmo EM (Expectación-Maximización)**: procedimiento iterativo que alterna el cálculo de responsabilidades (expectación) con la actualización de medias, covarianzas y pesos (maximización).
- **Clustering blando**: asignación probabilística a varios grupos a la vez, en contraste con la asignación dura (un único grupo) de algoritmos como K-Means.
