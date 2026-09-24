---
id: estadistica-descriptiva
estado: borrador
---

## En una frase

La estadística descriptiva condensa una colección de datos en unos pocos números —centro, dispersión y posición— que resumen su comportamiento sin tener que revisar cada dato uno por uno.

## Intuición

Una tabla con miles de filas de datos no dice nada a simple vista: la mente humana necesita resúmenes. La **estadística descriptiva** existe para eso: convierte una masa de números en unas pocas cifras que capturan dónde se concentran los datos, cuánto varían y cómo se reparten. Es la diferencia entre leer un informe de cien páginas y leer su resumen ejecutivo: el detalle sigue estando disponible, pero lo que guía la primera decisión es la síntesis.

En IA este paso es la primera capa de inteligencia aplicada a los datos: antes de entrenar cualquier modelo conviene saber si las variables están equilibradas, si hay valores extremos que puedan sesgar el aprendizaje, o si ya se intuyen patrones simples sin necesidad de algoritmos complejos.

## Explicación

### Medidas de tendencia central: ¿dónde está el centro?

Tres medidas responden a esta pregunta, cada una con una lógica distinta. La **media** suma todos los valores y divide entre el número de observaciones; es el centro de gravedad de los datos, pero es muy sensible a valores extremos. La **mediana** es el valor que queda justo en el centro al ordenar los datos: si hay $n$ observaciones y $n$ es impar, es el valor central; si es par, el promedio de los dos centrales. Al no depender de las magnitudes exactas, sino de la posición, la mediana es mucho más **robusta** frente a valores atípicos. La **moda** es el valor más frecuente, y es la única de las tres que tiene sentido con variables categóricas (por ejemplo, el color de coche más común).

Imagina los sueldos de una empresa: casi todos rondan los 1.500 euros, pero un directivo cobra 100.000. La media se dispara y da una impresión engañosa de lo "típico"; la mediana, en cambio, sigue reflejando fielmente el sueldo habitual. En IA, el **error cuadrático medio** se apoya en la media, mientras que la imputación de valores perdidos y métricas como el **error absoluto mediano** se apoyan en la mediana precisamente por esa robustez.

### Medidas de dispersión: ¿cuánto se parecen los datos entre sí?

Saber que la media es 7 no es lo mismo si todos los valores rondan ese número o si hay una mezcla de extremos que se compensan. Las medidas de dispersión miden ese "grado de acuerdo". El **rango** es la más simple: la diferencia entre el máximo y el mínimo, aunque depende solo de dos valores y puede ser engañoso si hay un único extremo aislado. La **varianza** promedia el cuadrado de las distancias de cada dato a la media, y su raíz cuadrada, la **desviación estándar**, tiene la ventaja de estar en las mismas unidades que los datos originales. El **coeficiente de variación** (CV) relaciona la desviación estándar con la media, lo que permite comparar la dispersión relativa de variables medidas en escalas distintas.

En IA, la dispersión importa porque un modelo entrenado con datos muy dispersos encuentra más difícil detectar patrones estables. Además, la desviación estándar es la base de la **normalización**: restar la media y dividir entre la desviación estándar centra los datos en cero y los pone a la misma escala, evitando que una variable domine a las demás solo por estar medida en números más grandes.

### Medidas de posición: cuartiles, percentiles y el boxplot

Además del centro y la dispersión, interesa saber cómo se reparten los datos en distintos puntos. Los **cuartiles** dividen el conjunto ordenado en cuatro partes iguales: $Q_1$ deja por debajo el 25% de los datos, $Q_2$ coincide con la mediana, y $Q_3$ deja por debajo el 75%. Los **percentiles** generalizan la misma idea dividiendo en cien partes: el percentil 90 deja por debajo al 90% de las observaciones. El **rango intercuartílico** (IQR), la diferencia entre $Q_3$ y $Q_1$, mide la anchura del 50% central de los datos y es especialmente útil para detectar valores atípicos, porque no se deja arrastrar por los extremos.

Estas medidas de posición son la base del **diagrama de caja** (boxplot), que se trata en detalle en [[graficos-estadisticos]]: una caja que va de $Q_1$ a $Q_3$, con la mediana marcada dentro y "bigotes" que señalan hasta dónde llegan los valores considerados normales.

## Formalización

$$
\bar{x} = \frac{1}{n}\sum_{i=1}^n x_i \qquad\qquad \sigma^2 = \frac{1}{n}\sum_{i=1}^n (x_i - \bar{x})^2 \qquad\qquad \sigma = \sqrt{\sigma^2}
$$

donde:

- $x_i$ son los valores individuales de los datos, con $i=1,\dots,n$.
- $n$ es el número total de observaciones.
- $\bar{x}$ es la media aritmética.
- $\sigma^2$ es la varianza y $\sigma$ la desviación estándar.

$$
CV = \frac{\sigma}{\bar{x}} \qquad\qquad \mathrm{IQR} = Q_3 - Q_1
$$

donde:

- $CV$ es el coeficiente de variación, que compara dispersión relativa entre variables de distinta escala.
- $Q_1$ y $Q_3$ son el primer y el tercer cuartil (cuantiles de nivel 0,25 y 0,75).

**Ejemplo numérico:** las visitas diarias a una web durante 5 días son $[4, 7, 7, 9, 23]$. La media es $\bar{x}=\frac{4+7+7+9+23}{5}=10$, muy arrastrada por el día con 23 visitas. La mediana, al ordenar los datos, es $7$: refleja mejor el comportamiento típico. La moda también es $7$, porque se repite. La varianza es $\sigma^2=44{,}8$ y la desviación estándar $\sigma\approx 6{,}69$; el coeficiente de variación es $CV=6{,}69/10\approx 0{,}67$. Usando la posición fraccionaria $k=(n+1)p$: $Q_1=5{,}5$ y $Q_3=16$, con lo que $\mathrm{IQR}=10{,}5$.

## Interactivo

```widget
motor: datos1d
modo: centralidad
valores: [4, 7, 7, 9, 23]
unidad: "visitas/día"
```

- Prueba a arrastrar el valor 23 hacia arriba, hasta 100: observa cuánto se mueve la media frente a lo poco que se mueve la mediana.
- Prueba a igualar todos los valores a 7 menos uno: ¿qué le pasa a la moda cuando ya no hay ningún valor repetido?
- Prueba a comparar visualmente la distancia entre la media y la mediana como una señal rápida de asimetría en los datos.

## En código

```python
from statistics import mean, median, mode, pstdev, pvariance

datos = [4, 7, 7, 9, 23]

print(mean(datos))              # 10
print(median(datos))            # 7
print(mode(datos))              # 7
print(round(pvariance(datos), 2))  # 44.8
print(round(pstdev(datos), 2))     # 6.69
print(round(pstdev(datos) / mean(datos), 2))  # 0.67 (coeficiente de variación)
```

## Errores típicos

- **Error**: usar siempre la media como resumen "por defecto", sin comprobar si hay valores extremos. → **Correcto**: con outliers presentes, la mediana suele representar mejor el comportamiento típico de la mayoría de los datos.
- **Error**: pensar que una desviación estándar grande siempre significa "datos erróneos". → **Correcto**: mide variabilidad real, no calidad de los datos; conviene interpretarla en el contexto del problema.
- **Error**: comparar la dispersión absoluta (desviación estándar) de dos variables en escalas distintas y concluir cuál es "más variable". → **Correcto**: para eso hace falta el coeficiente de variación, que normaliza por la media.
- **Error**: calcular el rango intercuartílico como $Q_3-Q_1$ usando el máximo y el mínimo en su lugar. → **Correcto**: el IQR usa específicamente el primer y el tercer cuartil, no los extremos del conjunto.

## En resumen

- **Qué es:** un conjunto de números que resumen el centro, la dispersión y la posición de un conjunto de datos.
- **Centralidad:** media (sensible a extremos), mediana (robusta), moda (frecuencia, útil en categóricas).
- **Dispersión:** rango, varianza/desviación estándar (misma escala que los datos) y coeficiente de variación (dispersión relativa).
- **Posición:** cuartiles y percentiles dividen los datos ordenados; el IQR mide la anchura del 50% central.
- **Fórmula clave:** $\sigma^2=\frac{1}{n}\sum(x_i-\bar x)^2$.
- **Cuándo usar cada centralidad:** media si los datos son razonablemente simétricos; mediana si hay outliers o asimetría fuerte; moda para variables categóricas.
- **Trampa principal:** un único valor atípico puede desplazar mucho la media sin apenas mover la mediana.

## A fondo

### Cuantiles con datos finitos: la posición fraccionaria

Cuando el número de datos no encaja exactamente en cuartos, se recurre a interpolar entre dos valores ordenados. Con $n$ observaciones ordenadas $x_{(1)} \le \dots \le x_{(n)}$, el cuantil de nivel $p$ se ubica en la posición $k=(n+1)p$; si $k$ no es un número entero, se interpola linealmente entre $x_{(\lfloor k\rfloor)}$ y $x_{(\lceil k\rceil)}$ según la parte decimal de $k$. Este es el método usado en el ejemplo numérico de esta ficha, aunque existen otras convenciones de interpolación que dan resultados ligeramente distintos; lo importante es que todas convergen al mismo valor conforme crece $n$.

### La mediana como herramienta de imputación

Cuando faltan valores en una variable, una técnica habitual es rellenarlos con un valor representativo. Sustituir por la media puede sesgar mucho la variable si hay valores extremos, mientras que sustituir por la mediana mantiene el hueco cerca del comportamiento típico de la mayoría de los datos, sin dejarse arrastrar por unos pocos casos anómalos. Esta robustez es la misma razón por la que el error absoluto mediano se prefiere sobre el error cuadrático medio cuando se sospecha de errores grandes y puntuales en las predicciones.

## Autoevaluación

### En el conjunto $[100, 120, 150, 110, 105, 300, 115]$ (visitas diarias), ¿qué medida de centralidad esperas que esté más alejada del comportamiento típico de la mayoría de los días?
- [x] La media, porque el día con 300 visitas la arrastra hacia arriba.
- [ ] La mediana, porque siempre coincide con el valor máximo.
- [ ] La moda, porque en este conjunto no existe.
> Por qué: la media (157,14) queda muy por encima de la mayoría de los días, que rondan 100-120; la mediana (115) representa mejor el comportamiento típico porque no se deja arrastrar por el valor atípico de 300.

### Dos variables tienen desviaciones estándar de 1 y 5 respectivamente. ¿Basta esa información para decir cuál es "relativamente" más variable?
- [ ] Sí, la de desviación estándar 5 siempre es más variable en términos relativos.
- [x] No, hace falta comparar cada desviación estándar con su propia media mediante el coeficiente de variación.
- [ ] Sí, pero solo si ambas variables tienen la misma media.
> Por qué: una desviación estándar de 5 puede ser pequeña en relación con una media de 100 (CV bajo) y una de 1 puede ser grande en relación con una media de 2 (CV alto); comparar dispersión absoluta entre escalas distintas puede llevar a conclusiones erróneas.

### El rango intercuartílico (IQR) de una variable es muy pequeño, pero su rango total (máximo menos mínimo) es enorme. ¿Qué sugiere esto?
- [ ] Que los datos están mal medidos.
- [x] Que la mayoría de los datos están muy concentrados, pero hay algunos valores extremos alejados del grueso central.
- [ ] Que la media y la mediana deben ser iguales.
> Por qué: el IQR solo mide la dispersión del 50% central, así que un IQR pequeño con un rango total grande es la firma típica de unos pocos outliers alejados rodeando un núcleo de datos muy agrupado.

## Glosario

- **Media aritmética**: suma de los valores dividida entre el número de observaciones; sensible a valores extremos.
- **Mediana**: valor central de los datos ordenados; robusta frente a valores atípicos.
- **Moda**: valor más frecuente en el conjunto de datos.
- **Varianza y desviación estándar**: medidas de dispersión respecto a la media; la desviación estándar está en las mismas unidades que los datos.
- **Coeficiente de variación (CV)**: cociente entre desviación estándar y media, útil para comparar dispersión relativa entre escalas distintas.
- **Cuartiles y percentiles**: valores que dividen los datos ordenados en cuatro o cien partes iguales, respectivamente.
- **Rango intercuartílico (IQR)**: diferencia entre el tercer y el primer cuartil; mide la dispersión del 50% central de los datos.
