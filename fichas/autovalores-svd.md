---
id: autovalores-svd
estado: borrador
---

## En una frase

Un autovector es una dirección que una matriz solo estira o encoge, sin girarla; la SVD extiende esa idea a cualquier matriz para hallar sus direcciones más informativas.

## Intuición

Imagina que estiras una lámina de goma más en una dirección que en otra. Casi cualquier línea que dibujes sobre ella acaba desviada: cambia de orientación además de longitud. Pero hay un par de líneas especiales, alineadas con la dirección del estiramiento, que no giran: solo se alargan o encogen. Esas direcciones privilegiadas son los **autovectores** de la transformación, y cuánto se alargan es su **autovalor**.

En IA esto importa porque muchos problemas se reducen a encontrar esas direcciones privilegiadas de una nube de datos: hacia dónde varían más, cuáles son ruido y cuáles son señal. La **SVD** (descomposición en valores singulares) lleva esta misma idea a matrices rectangulares —como una tabla de usuarios por productos— y es el motor matemático detrás de PCA y de los sistemas de recomendación.

## Explicación

### Direcciones que no giran

Cuando multiplicas una matriz $\mathbf{A}$ por un vector, lo habitual es que el resultado apunte a otro sitio. Pero para algunas matrices existen vectores $\mathbf{v}$ que, tras la transformación, conservan su dirección y solo cambian de tamaño:

$$
\mathbf{A}\mathbf{v} = \lambda \mathbf{v}
$$

A $\mathbf{v}$ se le llama **autovector** y a $\lambda$, **autovalor**. Si $\lambda>1$ el vector se estira, si $0<\lambda<1$ se encoge, si $\lambda<0$ además se invierte. Por ejemplo, con $\mathbf{A}=\begin{bmatrix}2&0\\0&3\end{bmatrix}$, el vector $(1,0)$ se convierte en $(2,0)=2\cdot(1,0)$: autovalor $2$. Y $(0,1)$ pasa a $(0,3)=3\cdot(0,1)$: autovalor $3$.

### Calcularlos: la ecuación característica

Reescribiendo la definición, $(\mathbf{A}-\lambda\mathbf{I})\mathbf{v}=\mathbf{0}$. Para que exista un $\mathbf{v}$ distinto del vector nulo, la matriz $(\mathbf{A}-\lambda\mathbf{I})$ no puede ser invertible (véase [[determinante-inversa]]), es decir, su determinante debe ser cero: la **ecuación característica** $|\mathbf{A}-\lambda\mathbf{I}|=0$. Sus soluciones son los autovalores; sustituyendo cada uno de vuelta se obtiene el autovector asociado resolviendo el sistema lineal.

Con $\mathbf{A}=\begin{bmatrix}2&1\\1&2\end{bmatrix}$: $(2-\lambda)^2-1=0 \Rightarrow \lambda_1=1,\ \lambda_2=3$. Para $\lambda_1=1$, el sistema da $x=-y$, autovector $(1,-1)$; para $\lambda_2=3$, $x=y$, autovector $(1,1)$.

### Diagonalizar: cambiar de perspectiva

Si juntas los autovectores como columnas de una matriz $\mathbf{P}$ y los autovalores en la diagonal de $\mathbf{D}$, ocurre que $\mathbf{A}=\mathbf{P}\mathbf{D}\mathbf{P}^{-1}$: la **diagonalización**. Vista desde la base de sus autovectores, la transformación deja de mezclar coordenadas: cada dirección se escala de forma independiente por su autovalor. Esta idea aparece en PCA (diagonalizar la matriz de covarianza revela las direcciones de máxima varianza), en la matriz Hessiana de una función de pérdida (autovalores grandes indican direcciones de aprendizaje inestables; muy pequeños, direcciones casi planas donde el aprendizaje es lento) y en sistemas dinámicos (autovalores entre 0 y 1 indican estabilidad; mayores que 1, crecimiento descontrolado).

### SVD: la misma idea para cualquier matriz

La diagonalización solo aplica a matrices cuadradas diagonalizables, pero la mayoría de matrices en IA son rectangulares (por ejemplo, usuarios × características). La **descomposición en valores singulares (SVD)** generaliza la idea a cualquier matriz $\mathbf{A}$, descomponiéndola en $\mathbf{A}=\mathbf{U}\mathbf{\Sigma}\mathbf{V}^T$: dos rotaciones ($\mathbf{U}$, $\mathbf{V}^T$) alrededor de un escalado ($\mathbf{\Sigma}$). Truncando la SVD a los $k$ valores singulares más grandes se obtiene la mejor aproximación de rango $k$: la base de PCA, de los sistemas de recomendación (factores latentes de usuarios e ítems) y de LSA en procesamiento de lenguaje.

## Formalización

$$
\mathbf{A}\mathbf{v} = \lambda \mathbf{v} \qquad\Longrightarrow\qquad |\mathbf{A}-\lambda\mathbf{I}|=0
$$

donde:

- $\mathbf{A}$ es una matriz cuadrada.
- $\mathbf{v}$ es un autovector (vector no nulo).
- $\lambda$ es el autovalor asociado a $\mathbf{v}$.
- $\mathbf{I}$ es la matriz identidad.

$$
\mathbf{A} = \mathbf{P}\mathbf{D}\mathbf{P}^{-1} \qquad\qquad \mathbf{A} = \mathbf{U}\mathbf{\Sigma}\mathbf{V}^T
$$

donde:

- $\mathbf{P}$ tiene los autovectores de $\mathbf{A}$ como columnas y $\mathbf{D}$ es diagonal con los autovalores (solo si $\mathbf{A}$ es diagonalizable).
- $\mathbf{U}$ y $\mathbf{V}^T$ son matrices ortogonales (vectores singulares izquierdos y derechos), válidas para cualquier $\mathbf{A}$, cuadrada o no.
- $\mathbf{\Sigma}$ es diagonal, con los valores singulares $\sigma_i \ge 0$ ordenados de mayor a menor.

## Interactivo

```widget
motor: transformacion2d
modo: autovectores
matriz: [[2, 1], [1, 2]]
presets: [{"nombre": "diagonal simple", "matriz": [[2, 0], [0, 3]]}, {"nombre": "rotación 45°", "matriz": [[0.7071, -0.7071], [0.7071, 0.7071]]}]
```

- Prueba a activar el preset "diagonal simple" y observa que los autovectores caen justo sobre los ejes.
- Prueba a activar el preset "rotación 45°": ¿qué le pasa a los autovectores cuando la matriz solo gira, sin estirar en ninguna dirección real?
- Prueba a editar la matriz a mano hasta que los dos autovectores queden perpendiculares entre sí.

## En código

```python
import numpy as np

A = np.array([[2, 1], [1, 2]])
valores, P = np.linalg.eig(A)
print("autovalores:", valores)        # [3. 1.]
print("autovectores (columnas):\n", np.round(P, 3))

D = np.diag(valores)
reconstruida = P @ D @ np.linalg.inv(P)
print("P D P^-1 == A:", np.allclose(reconstruida, A))  # True
```

## Errores típicos

- **Error**: pensar que cualquier vector al que se aplica $\mathbf{A}$ y "sale parecido" es un autovector. → **Correcto**: debe conservar exactamente la misma dirección (o la opuesta); un giro pequeño ya lo descarta.
- **Error**: creer que toda matriz cuadrada tiene autovectores reales. → **Correcto**: una rotación pura, por ejemplo, no estira ninguna dirección real: sus autovalores son complejos y no hay autovector real que se conserve.
- **Error**: confundir diagonalización con SVD y pensar que cualquier matriz se puede escribir como $\mathbf{P}\mathbf{D}\mathbf{P}^{-1}$. → **Correcto**: la diagonalización exige una matriz cuadrada diagonalizable; la SVD, en cambio, existe siempre, para cualquier matriz.
- **Error**: pensar que un autovalor grande siempre es "bueno". → **Correcto**: en la Hessiana de una función de pérdida, un autovalor muy grande señala una dirección donde el descenso de gradiente puede volverse inestable.

## En resumen

- **Qué es**: un autovector de $\mathbf{A}$ es una dirección que la transformación solo escala (no gira); su factor de escala es el autovalor.
- **Para qué sirve**: encontrar las direcciones privilegiadas de una transformación o de una nube de datos (PCA, estabilidad de sistemas, curvatura de la pérdida).
- **Cómo se calculan**: resolver $|\mathbf{A}-\lambda\mathbf{I}|=0$ para los autovalores, y luego $(\mathbf{A}-\lambda\mathbf{I})\mathbf{v}=\mathbf{0}$ para cada autovector.
- **Fórmula clave**: $\mathbf{A}\mathbf{v}=\lambda\mathbf{v}$.
- **Diagonalización**: $\mathbf{A}=\mathbf{P}\mathbf{D}\mathbf{P}^{-1}$, solo si $\mathbf{A}$ es cuadrada y diagonalizable.
- **SVD**: $\mathbf{A}=\mathbf{U}\mathbf{\Sigma}\mathbf{V}^T$ generaliza la idea a cualquier matriz, incluso rectangular; truncarla da la mejor aproximación de rango reducido.
- **Trampa principal**: no toda matriz cuadrada es diagonalizable con autovectores reales; la SVD sí existe siempre, por eso es la herramienta general en IA.

## A fondo

### Factorización de matrices y factores latentes

Una matriz de interacciones usuario-ítem $\mathbf{M}$ rara vez es aleatoria: suele reflejar un número pequeño de **factores latentes** (por ejemplo, géneros de película que le gustan a cada usuario). La SVD trunca esa matriz a sus $k$ valores singulares más grandes, de modo que $\mathbf{U}$ pasa a contener los perfiles latentes de cada usuario y $\mathbf{V}$ las características latentes de cada ítem; el producto de ambas matrices reducidas permite predecir los huecos de $\mathbf{M}$. Si al aplicar SVD a una matriz $1000\times500$ los valores singulares caen bruscamente tras el componente $k=20$, ese $20$ representa casi toda la información útil: se reduce la dimensión 25 veces sin apenas pérdida.

### Por qué la SVD es más robusta que forzar una diagonalización

Las matrices de datos reales no suelen ser cuadradas ni simétricas, así que la diagonalización no es aplicable en general. La SVD, en cambio, siempre existe y da la mejor aproximación de rango reducido en un sentido preciso (mínimos cuadrados), lo que la hace la herramienta estándar para reducir dimensionalidad y descubrir estructura oculta en datasets grandes y ruidosos.

## Autoevaluación

### La matriz $\mathbf{A}=\begin{bmatrix}2&0\\0&3\end{bmatrix}$ transforma el vector $(1,1)$ en $(2,3)$. ¿Es $(1,1)$ un autovector de $\mathbf{A}$?
- [ ] Sí, porque $(2,3)$ tiene números más grandes que $(1,1)$.
- [x] No, porque $(2,3)$ no es un múltiplo escalar de $(1,1)$: cambió de dirección.
- [ ] Sí, porque toda matriz diagonal conserva la dirección de cualquier vector.
> Por qué: un autovector debe salir como $\lambda \cdot \mathbf{v}$, exactamente en la misma dirección; $(1,0)$ y $(0,1)$ sí lo son para esta matriz, pero su combinación $(1,1)$ no, porque cada eje se estira con un factor distinto.

### Si los autovalores de la matriz Hessiana de una función de pérdida son $\lambda_1=1000$ y $\lambda_2=0{,}001$, ¿qué describe mejor el paisaje de esa pérdida?
- [ ] Un paisaje uniforme, igual de empinado en todas las direcciones.
- [x] Un paisaje muy alargado: extremadamente empinado en una dirección y casi plano en la otra.
- [ ] Un paisaje inestable en el que el mínimo no existe.
> Por qué: un autovalor grande indica curvatura fuerte (dirección empinada, riesgo de pasos inestables) y uno muy pequeño indica casi ausencia de curvatura (aprendizaje lento en esa dirección); juntos describen una superficie en forma de valle muy estrecho.

### ¿Por qué la SVD se usa en sistemas de recomendación en lugar de diagonalizar directamente la matriz usuario-ítem?
- [ ] Porque diagonalizar es más rápido computacionalmente.
- [x] Porque esa matriz es rectangular e incompleta, y la diagonalización solo se aplica a matrices cuadradas diagonalizables.
- [ ] Porque la SVD no requiere calcular ningún valor numérico, solo aproxima visualmente.
> Por qué: una matriz de usuarios por ítems casi nunca es cuadrada, así que no tiene sentido pedirle una diagonalización; la SVD, en cambio, existe para cualquier matriz y además tolera huecos y ruido.

### En la ecuación característica $|\mathbf{A}-\lambda\mathbf{I}|=0$, ¿qué papel juega el determinante?
- [ ] Calcula directamente el valor de cada autovector.
- [x] Detecta quiénes de los posibles $\lambda$ hacen que $(\mathbf{A}-\lambda\mathbf{I})$ deje de ser invertible, condición necesaria para que exista un autovector no nulo.
- [ ] Mide el área que ocupan los autovectores en el plano.
> Por qué: solo cuando el determinante de $(\mathbf{A}-\lambda\mathbf{I})$ es cero esa matriz colapsa el espacio lo suficiente como para que un vector no nulo se transforme en el vector cero, que es justo la condición $(\mathbf{A}-\lambda\mathbf{I})\mathbf{v}=\mathbf{0}$ con $\mathbf{v}\ne\mathbf{0}$.

## Glosario

- **Autovector**: vector no nulo que una matriz transforma en un múltiplo escalar de sí mismo, conservando su dirección.
- **Autovalor**: factor de escala $\lambda$ asociado a un autovector.
- **Ecuación característica**: $|\mathbf{A}-\lambda\mathbf{I}|=0$; sus soluciones son los autovalores de $\mathbf{A}$.
- **Diagonalización**: escribir $\mathbf{A}=\mathbf{P}\mathbf{D}\mathbf{P}^{-1}$, con $\mathbf{P}$ formada por los autovectores y $\mathbf{D}$ diagonal con los autovalores.
- **SVD (descomposición en valores singulares)**: factorización $\mathbf{A}=\mathbf{U}\mathbf{\Sigma}\mathbf{V}^T$ válida para cualquier matriz, no solo cuadradas.
- **Valores singulares**: los elementos de la diagonal de $\mathbf{\Sigma}$; indican la importancia de cada dirección capturada por la SVD.
- **Factores latentes**: variables ocultas que explican la estructura de una matriz de datos, reveladas al truncar su SVD.
