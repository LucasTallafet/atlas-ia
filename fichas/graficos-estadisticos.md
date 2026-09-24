---
id: graficos-estadisticos
estado: borrador
---

## En una frase

Los gráficos estadísticos —histograma, boxplot y diagrama de dispersión— muestran de un vistazo la forma, la dispersión y las relaciones de los datos que los números solos no revelan con la misma claridad.

## Intuición

Un conjunto de medias y desviaciones estándar resume los datos, pero puede ocultar formas importantes: dos variables con la misma media y la misma desviación estándar pueden tener aspectos completamente distintos, una simétrica y otra con dos picos separados. Los gráficos estadísticos existen para tapar ese hueco: convierten los números en una imagen que el ojo interpreta de inmediato, revelando sesgos, agrupaciones o valores extraños antes de aplicar cualquier algoritmo.

En IA, mirar los datos antes de modelarlos no es un paso decorativo: un histograma puede delatar que una variable necesita una transformación antes de entrenar un modelo, y un diagrama de dispersión puede sugerir directamente qué tipo de modelo conviene usar.

## Explicación

### Histogramas: la forma de una variable

Un **histograma** divide el rango de una variable en intervalos ("bins") y cuenta cuántas observaciones caen en cada uno, mostrando la forma de su distribución. El número de bins importa: demasiados fragmentan la imagen y muestran solo ruido; muy pocos aplanan la distribución y ocultan detalles como una segunda moda. La forma revela la "personalidad" de la variable: **sesgo a la derecha** (cola larga hacia valores altos, común en ingresos o tiempos de espera), **sesgo a la izquierda** (cola larga hacia valores bajos) o **multimodalidad** (varios picos, señal de que la muestra mezcla distintos grupos). En IA, una variable muy sesgada puede violar los supuestos de algoritmos como la regresión lineal, lo que motiva transformaciones como el logaritmo para acercarla a una forma más simétrica.

### Boxplots: cinco números, una radiografía

El **diagrama de caja** (boxplot) condensa la posición y la dispersión de una variable en cinco valores: el mínimo no atípico, $Q_1$, la mediana, $Q_3$ y el máximo no atípico. La caja va de $Q_1$ a $Q_3$ (el rango intercuartílico, ver [[estadistica-descriptiva]]), con la mediana marcada en su interior; su posición dentro de la caja delata el sesgo: si está más cerca de $Q_1$, la distribución está sesgada hacia la derecha. Los **bigotes** se extienden hasta $1{,}5$ veces el IQR desde cada extremo de la caja (la regla de Tukey); cualquier punto más allá se dibuja aparte como **valor atípico**. Esta capacidad de señalar outliers de un vistazo es clave antes de entrenar modelos sensibles a la escala, como la regresión lineal o las máquinas de vectores de soporte. Comparar varios boxplots lado a lado, uno por categoría, también revela si una variable separa bien las clases de un problema de clasificación: cuanto menos se solapan las cajas, más discriminante es esa variable.

### Diagramas de dispersión: la relación entre dos variables

Mientras el histograma describe una única variable, el **diagrama de dispersión** (scatter plot) mapea dos variables a la vez, una en cada eje, con un punto por observación. La forma de la nube resultante revela el tipo de relación: **correlación positiva** si los puntos ascienden de izquierda a derecha, **negativa** si descienden, y **ausencia de correlación** si forman una nube sin patrón claro. También delata relaciones **no lineales** (una curva en vez de una línea recta, que sugiere modelos como árboles o redes neuronales en lugar de regresión lineal) y **clústeres** (grupos separados, que anticipan algoritmos de agrupamiento no supervisado).

### El coeficiente de correlación de Pearson

Para cuantificar la fuerza de una relación lineal vista en un diagrama de dispersión se usa el [[correlacion|coeficiente de correlación de Pearson]] ($\rho$), que va de $-1$ (correlación negativa perfecta) a $1$ (positiva perfecta), con $0$ indicando ausencia de correlación lineal. El diagrama de dispersión da una idea visual del signo y la magnitud de $\rho$ antes incluso de calcularlo.

## Formalización

$$
\rho_{X,Y} = \frac{\sum_{i=1}^n (x_i-\bar x)(y_i-\bar y)}{\sqrt{\sum_{i=1}^n (x_i-\bar x)^2}\sqrt{\sum_{i=1}^n (y_i-\bar y)^2}}
$$

donde:

- $x_i, y_i$ son los valores observados de las variables $X$ e $Y$ para la observación $i$.
- $\bar x, \bar y$ son las medias de $X$ e $Y$.
- $n$ es el número de observaciones.
- $\rho_{X,Y}$ toma valores entre $-1$ y $1$; su signo indica el sentido de la relación lineal y su magnitud, cuán ajustados están los puntos a una recta.

Regla de Tukey para los bigotes del boxplot: el bigote superior llega hasta $Q_3+1{,}5\cdot\mathrm{IQR}$ como máximo, y el inferior hasta $Q_1-1{,}5\cdot\mathrm{IQR}$ como mínimo; cualquier valor fuera de ese rango se marca como atípico.

**Ejemplo numérico:** con los pares $(x,y)$: $(1,2)$, $(2,4)$, $(3,5)$, $(4,8)$, las medias son $\bar x=2{,}5$ y $\bar y=4{,}75$. Aplicando la fórmula se obtiene

$$
\rho \approx 0{,}981
$$

un valor muy cercano a 1, coherente con que los puntos casi forman una línea ascendente.

## Interactivo

```widget
motor: datos1d
modo: graficos
valores: [4, 7, 7, 9, 21, 15, 13, 6, 3, 2]
unidad: "visitas/día"
```

- Prueba a cambiar el número de bins del histograma: fíjate en cómo con muy pocos se pierde la forma y con demasiados aparece ruido.
- Prueba a localizar en el boxplot dónde caería un nuevo valor de 50: ¿quedaría dentro de los bigotes o marcado como atípico?
- Prueba a comparar la posición de la mediana dentro de la caja con la forma del histograma: ambos deberían contar la misma historia sobre el sesgo.

## En código

```python
from math import sqrt

xs = [1, 2, 3, 4]
ys = [2, 4, 5, 8]
mx, my = sum(xs) / len(xs), sum(ys) / len(ys)

num = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
den = sqrt(sum((x - mx)**2 for x in xs)) * sqrt(sum((y - my)**2 for y in ys))
print(round(num / den, 3))  # 0.981
```

## Errores típicos

- **Error**: elegir el número de bins de un histograma al azar y sacar conclusiones sobre la forma de la variable sin probar otros valores. → **Correcto**: conviene probar varios anchos de bin, porque la forma percibida puede cambiar mucho entre pocos bins y muchos.
- **Error**: interpretar un diagrama de dispersión sin patrón claro como "las variables no están relacionadas". → **Correcto**: la ausencia de correlación lineal (Pearson cercano a 0) no descarta relaciones no lineales fuertes, como una parábola.
- **Error**: pensar que los bigotes del boxplot marcan el máximo y el mínimo absolutos de los datos. → **Correcto**: los bigotes llegan solo hasta el valor no atípico más extremo según la regla de Tukey; los outliers se dibujan aparte.
- **Error**: usar el coeficiente de Pearson para medir cualquier tipo de relación entre variables. → **Correcto**: Pearson solo capta relaciones lineales; una relación curva fuerte puede dar un $\rho$ cercano a 0.

## En resumen

- **Qué son:** representaciones visuales que muestran de un vistazo la forma, dispersión y relaciones de los datos.
- **Histograma:** frecuencia de valores por intervalos; revela sesgo y multimodalidad.
- **Boxplot:** caja ($Q_1$-$Q_3$), mediana y bigotes (regla de Tukey, $1{,}5\cdot\mathrm{IQR}$); detecta outliers de un vistazo.
- **Diagrama de dispersión:** relación entre dos variables; revela correlación, no linealidad y clústeres.
- **Fórmula clave:** el coeficiente de correlación de Pearson $\rho$, entre $-1$ y $1$, mide la fuerza de una relación lineal.
- **Cuándo usarlos:** siempre antes de modelar, como primer diagnóstico de los datos.
- **Trampa principal:** un $\rho$ cercano a 0 no descarta relaciones fuertes no lineales; hay que mirar también el gráfico.

## A fondo

### Curtosis y asimetría como complemento numérico

Más allá de mirar el histograma, existen medidas numéricas que cuantifican su forma: la **asimetría** (*skewness*) mide si la cola es más larga hacia la derecha (positiva) o hacia la izquierda (negativa), y la **curtosis** mide cuán puntiaguda es la distribución y cuán pesadas son sus colas, es decir, cuántos valores extremos hay en relación con el centro. Estas medidas no sustituyen al gráfico, pero permiten automatizar diagnósticos de forma cuando hay demasiadas variables para inspeccionarlas todas visualmente.

### Boxplots comparativos como selector de variables

Al dibujar un boxplot por categoría para una misma variable numérica, la separación entre las cajas es una pista rápida de cuánto poder discriminatorio tiene esa variable para un problema de clasificación. Si las cajas de distintas clases apenas se solapan, esa variable probablemente será muy valorada por un modelo de clasificación; si se solapan casi por completo, aporta poca información para distinguir las clases.

## Autoevaluación

### Un histograma de tiempos de respuesta muestra una cola larga hacia la derecha, con la mayoría de los valores agrupados a la izquierda. ¿Cómo se describe esta forma?
- [ ] Sesgo hacia la izquierda.
- [x] Sesgo hacia la derecha (positivo).
- [ ] Distribución simétrica.
> Por qué: el sesgo se nombra según hacia dónde se extiende la cola larga; si la cola apunta a valores altos (a la derecha), el sesgo es positivo, aunque la mayoría de los datos estén agrupados a la izquierda.

### Un diagrama de dispersión entre dos variables muestra los puntos formando una parábola clara, y el coeficiente de Pearson calculado es $\rho \approx 0{,}05$. ¿Qué concluyes?
- [ ] Que las variables no están relacionadas de ninguna forma.
- [x] Que existe una relación fuerte pero no lineal, que Pearson no puede captar.
- [ ] Que el cálculo de Pearson debe estar mal hecho.
> Por qué: Pearson mide específicamente relaciones lineales; una parábola es una relación muy fuerte pero simétrica respecto a la línea recta, lo que puede producir un coeficiente cercano a 0 aunque las variables estén claramente vinculadas.

### En un boxplot, la mediana está justo pegada a $Q_1$ y el bigote superior es mucho más largo que el inferior. ¿Qué forma tiene probablemente el histograma de esa misma variable?
- [ ] Simétrica, con las dos colas iguales.
- [x] Sesgada hacia la derecha, con una cola larga hacia valores altos.
- [ ] Bimodal, con dos picos separados.
> Por qué: una mediana desplazada hacia $Q_1$ junto con un bigote superior largo indica que la mitad superior de los datos está más dispersa que la inferior, la firma típica de una distribución con cola larga hacia la derecha.

## Glosario

- **Histograma**: gráfico de barras que muestra la frecuencia de los valores de una variable agrupados en intervalos.
- **Sesgo (positivo/negativo)**: asimetría de una distribución según hacia qué lado se extiende su cola larga.
- **Boxplot (diagrama de caja)**: representación de $Q_1$, mediana, $Q_3$ y valores atípicos según la regla de Tukey.
- **Diagrama de dispersión**: gráfico que mapea dos variables, una por eje, para revelar su relación.
