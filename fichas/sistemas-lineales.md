---
id: sistemas-lineales
estado: borrador
---

## En una frase

Un sistema de ecuaciones lineales busca el punto que cumple varias condiciones lineales a la vez, y puede tener una solución única, infinitas o ninguna.

## Intuición

Imagina a dos personas que quedan en un cruce de calles: cada calle es una condición ("debes estar sobre esta línea") y el punto de encuentro es la solución. Si las calles se cruzan una sola vez, hay una cita clara. Si son la misma calle, cualquier punto de ella vale como cita. Si son paralelas, nunca se encuentran. Un sistema de ecuaciones lineales es exactamente eso, generalizado a más variables y más condiciones a la vez.

## Explicación

### Qué es un sistema y su forma matricial

Un sistema de ecuaciones lineales impone varias condiciones simultáneas sobre las mismas incógnitas. Por ejemplo:

$$
\begin{cases} x+y=10 \\ 2x-y=3 \end{cases}
$$

Cada ecuación es una recta; la solución es el punto donde ambas rectas se cortan. Cualquier sistema se escribe de forma compacta como $\mathbf{A}\mathbf{x}=\mathbf{b}$, donde $\mathbf{A}$ reúne los coeficientes, $\mathbf{x}$ las incógnitas y $\mathbf{b}$ los resultados. Esta notación matricial no es solo un atajo: convierte "resolver un sistema" en "encontrar el vector $\mathbf{x}$ que la transformación $\mathbf{A}$ lleva hasta $\mathbf{b}$", conectando directamente con [[matrices]] y [[determinante-inversa]].

### Los tres tipos de solución

No todos los sistemas se comportan igual:

- **Compatible determinado**: una única solución. En el plano, dos rectas que se cortan en un punto; en general, el rango de $\mathbf{A}$ coincide con el número de incógnitas.
- **Compatible indeterminado**: infinitas soluciones. Ocurre cuando alguna ecuación es redundante (combinación lineal de otra); geométricamente, las rectas son la misma, o los planos coinciden en una recta.
- **Incompatible**: ninguna solución. Las condiciones se contradicen entre sí; en el plano, dos rectas paralelas que nunca se cruzan.

El criterio general compara el **rango de $\mathbf{A}$** con el rango de la **matriz ampliada** $[\mathbf{A}\,|\,\mathbf{b}]$ (la que añade la columna de resultados): si coinciden y son máximos, la solución es única; si coinciden pero no son máximos, hay infinitas; si no coinciden, no hay ninguna.

### Métodos de resolución

Cuando $\mathbf{A}$ es cuadrada e invertible, en teoría $\mathbf{x}=\mathbf{A}^{-1}\mathbf{b}$, pero en la práctica esa fórmula casi no se usa por su coste e inestabilidad numérica (como viste en [[determinante-inversa]]). Los métodos reales son el algorítmico y sistemático **Gauss-Jordan** (transformaciones por filas sobre la matriz ampliada), la **descomposición LU** ($\mathbf{A}=\mathbf{L}\mathbf{U}$, que resuelve el sistema en dos pasos triangulares más baratos) y, para casos más exigentes, **QR** y **SVD**.

### Cuando no hay solución exacta: mínimos cuadrados

Un caso muy frecuente en IA es el de sistemas **sobredeterminados**: más ecuaciones que incógnitas, típico cuando hay más datos que parámetros. En general no existe un punto que cumpla todas las condiciones exactamente, así que en su lugar se busca el vector $\mathbf{x}$ cuya imagen $\mathbf{A}\mathbf{x}$ quede lo más cerca posible de $\mathbf{b}$: es una proyección de $\mathbf{b}$ sobre el espacio generado por las columnas de $\mathbf{A}$. Este enfoque, el **método de los mínimos cuadrados**, es la lógica que hay detrás del ajuste de una regresión lineal, que verás con detalle en [[regresion-lineal]].

## Formalización

$$
\mathbf{A}\mathbf{x} = \mathbf{b}
$$

donde:

- $\mathbf{A}$ es la matriz de coeficientes ($m$ ecuaciones $\times$ $n$ incógnitas).
- $\mathbf{x}$ es el vector de incógnitas, de $n$ componentes.
- $\mathbf{b}$ es el vector de resultados, de $m$ componentes.

Criterio de clasificación, comparando $\text{rango}(\mathbf{A})$ con $\text{rango}([\mathbf{A}\,|\,\mathbf{b}])$ y con $n$ (el número de incógnitas):

- $\text{rango}(\mathbf{A})=\text{rango}([\mathbf{A}\,|\,\mathbf{b}])=n$: solución única.
- $\text{rango}(\mathbf{A})=\text{rango}([\mathbf{A}\,|\,\mathbf{b}])<n$: infinitas soluciones.
- $\text{rango}(\mathbf{A})\neq\text{rango}([\mathbf{A}\,|\,\mathbf{b}])$: sin solución.

## Interactivo

```widget
motor: funcion
modo: rectas
funciones: [{"expr": "10 - x", "etiqueta": "x + y = 10"}, {"expr": "a*x + b", "etiqueta": "recta 2"}]
parametros: [{"nombre": "a", "min": -3, "max": 3, "paso": 0.5, "valor": 2, "etiqueta": "pendiente de la recta 2"}, {"nombre": "b", "min": -10, "max": 10, "paso": 0.5, "valor": -3, "etiqueta": "corte con el eje y"}]
x: [-2, 14]
y: [-6, 14]
```

- Prueba a dejar los deslizadores como están y localiza el punto donde se cruzan las rectas: esa es la solución del sistema compatible determinado.
- Prueba a poner $a=-1$ (la misma pendiente que la primera recta) dejando $b$ distinto de $10$: las rectas quedan paralelas y el sistema se vuelve incompatible, sin solución.
- Prueba a poner $a=-1$ y $b=10$: ahora la segunda recta coincide exactamente con la primera, y cualquier punto de ella es solución (compatible indeterminado).

## En código

```python
import numpy as np

A = np.array([[1, 1], [2, -1]])
b = np.array([10, 3])

x = np.linalg.solve(A, b)
print("solución:", x)                 # [4.333... 5.666...]
print("rango A:", np.linalg.matrix_rank(A))                       # 2
print("rango ampliada:", np.linalg.matrix_rank(np.column_stack([A, b])))  # 2
```

## Errores típicos

- **Error**: pensar que si el determinante de $\mathbf{A}$ es cero, el sistema no tiene solución. → **Correcto**: determinante cero significa que $\mathbf{A}$ no es invertible, pero el sistema puede tener infinitas soluciones o ninguna; hay que comparar los rangos para saber cuál de las dos.
- **Error**: creer que añadir más ecuaciones siempre ayuda a resolver el sistema. → **Correcto**: una ecuación redundante no aporta nada nuevo, y una ecuación contradictoria puede volver el sistema incompatible.
- **Error**: usar $\mathbf{x}=\mathbf{A}^{-1}\mathbf{b}$ como método estándar para resolver sistemas grandes. → **Correcto**: en la práctica se prefieren Gauss-Jordan, LU o QR, más eficientes y estables numéricamente.
- **Error**: confundir un sistema incompatible con uno indeterminado. → **Correcto**: el incompatible no tiene ninguna solución (condiciones contradictorias); el indeterminado tiene infinitas (alguna ecuación es redundante, no contradictoria).

## En resumen

- **Qué es:** un conjunto de condiciones lineales simultáneas, $\mathbf{A}\mathbf{x}=\mathbf{b}$, que puede tener una solución, infinitas o ninguna.
- **Cómo se clasifica:** comparando el rango de $\mathbf{A}$ con el de la matriz ampliada $[\mathbf{A}\,|\,\mathbf{b}]$ y con el número de incógnitas.
- **Cómo se resuelve en la práctica:** Gauss-Jordan, descomposición LU, o QR/SVD para casos sobredeterminados; casi nunca con la inversa explícita.
- **Sin solución exacta:** en sistemas sobredeterminados se usa el método de los mínimos cuadrados, que busca el punto más cercano a $\mathbf{b}$.
- **Para qué sirve en IA:** ajustar modelos (como la regresión lineal) es, en el fondo, resolver o aproximar sistemas lineales muy grandes.
- **Trampa:** determinante cero no implica "sin solución"; puede significar infinitas soluciones.

## A fondo

### Los tres casos con tres incógnitas

Con tres variables, cada ecuación representa un plano en el espacio y la solución es donde esos planos se cruzan. Un sistema como $x+y+z=6$, $2x-y+z=3$, $x+2y-z=4$ tiene determinante distinto de cero: los tres planos se cortan en un único punto (compatible determinado). Si en cambio una ecuación es múltiplo de otra —como $x+y+z=6$ junto con $2x+2y+2z=12$— el rango de $\mathbf{A}$ baja a $2$ y los planos se cruzan a lo largo de una recta entera: infinitas soluciones (compatible indeterminado). Y si esa segunda ecuación se contradice con la primera —$2x+2y+2z=15$ en vez de $12$— el rango de la matriz ampliada supera al de $\mathbf{A}$: los planos no llegan a coincidir en ningún punto (incompatible).

### La conexión con la regresión lineal

Cuando se ajusta una recta o un hiperplano a datos, la estimación de los parámetros $\boldsymbol{\beta}$ se obtiene resolviendo las **ecuaciones normales**, $\mathbf{X}^T\mathbf{X}\boldsymbol{\beta}=\mathbf{X}^T\mathbf{y}$: no es más que un sistema de ecuaciones lineales, con $\mathbf{X}$ la matriz de datos y $\mathbf{y}$ el vector de resultados observados. En el entrenamiento de modelos mucho más grandes, como las redes neuronales, ya no se resuelve el sistema de una vez, pero la lógica de fondo —encontrar (o aproximar) el vector de parámetros que satisface un conjunto de relaciones lineales o linealizadas— sigue siendo la misma.

## Autoevaluación

### El determinante de la matriz de coeficientes de un sistema $2\times2$ es $0$. ¿Qué se puede concluir?
- [ ] Que el sistema no tiene ninguna solución.
- [x] Que el sistema no tiene solución única: puede tener infinitas soluciones o ninguna, según si las ecuaciones son redundantes o contradictorias.
- [ ] Que el sistema tiene exactamente dos soluciones.
> Por qué: determinante cero indica que la matriz no es invertible, así que se descarta la solución única, pero hace falta comparar rangos para saber si hay infinitas o ninguna.

### Un sistema tiene $\text{rango}(\mathbf{A})=2$ y $\text{rango}([\mathbf{A}\,|\,\mathbf{b}])=3$. ¿Qué tipo de sistema es?
- [ ] Compatible determinado.
- [ ] Compatible indeterminado.
- [x] Incompatible: los rangos no coinciden, así que no existe ningún vector $\mathbf{x}$ que satisfaga todas las ecuaciones.
> Por qué: cuando el rango de la matriz ampliada supera al de $\mathbf{A}$, las ecuaciones se contradicen entre sí y el sistema no tiene solución.

### En un sistema sobredeterminado (más ecuaciones que incógnitas) no existe una solución exacta. ¿Qué hace el método de los mínimos cuadrados?
- [ ] Elimina ecuaciones hasta que el sistema tenga solución exacta.
- [x] Busca el vector $\mathbf{x}$ cuya imagen $\mathbf{A}\mathbf{x}$ queda lo más cerca posible de $\mathbf{b}$, proyectando $\mathbf{b}$ sobre el espacio de las columnas de $\mathbf{A}$.
- [ ] Calcula la inversa de una submatriz cuadrada elegida al azar.
> Por qué: los mínimos cuadrados no exigen una solución perfecta; buscan la aproximación que minimiza la distancia entre $\mathbf{A}\mathbf{x}$ y $\mathbf{b}$, que geométricamente es una proyección.

### ¿Por qué en la práctica los algoritmos de IA rara vez resuelven $\mathbf{A}\mathbf{x}=\mathbf{b}$ calculando $\mathbf{A}^{-1}$ de forma explícita?
- [ ] Porque la fórmula $\mathbf{x}=\mathbf{A}^{-1}\mathbf{b}$ no es matemáticamente válida.
- [x] Porque calcular la inversa explícita es costoso y numéricamente inestable en sistemas grandes; métodos como Gauss-Jordan, LU o QR son más eficientes y estables.
- [ ] Porque los sistemas de IA nunca tienen matriz de coeficientes cuadrada.
> Por qué: la fórmula es correcta en teoría, pero en la práctica computacional resulta cara y sensible a errores de redondeo, así que se prefieren descomposiciones que evitan la inversión explícita.

## Glosario

- **Sistema de ecuaciones lineales**: conjunto de condiciones lineales simultáneas sobre las mismas incógnitas, $\mathbf{A}\mathbf{x}=\mathbf{b}$.
- **Sistema compatible determinado**: sistema con una única solución.
- **Sistema compatible indeterminado**: sistema con infinitas soluciones.
- **Sistema incompatible**: sistema sin ninguna solución.
- **Matriz ampliada**: matriz de coeficientes $\mathbf{A}$ con la columna de resultados $\mathbf{b}$ añadida, $[\mathbf{A}\,|\,\mathbf{b}]$.
- **Sistema sobredeterminado**: sistema con más ecuaciones que incógnitas.
- **Método de los mínimos cuadrados**: técnica que, ante un sistema sin solución exacta, busca la aproximación que minimiza la distancia entre $\mathbf{A}\mathbf{x}$ y $\mathbf{b}$.
