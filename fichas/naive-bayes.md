---
id: naive-bayes
estado: borrador
---

## En una frase

El clasificador Naive Bayes predice la clase más probable de una observación combinando una probabilidad previa con la probabilidad de cada característica, asumiendo que las características son independientes entre sí dada la clase.

## Intuición

Piensa en un filtro de spam que va leyendo palabras: "gratis", "oferta", "urgente". Cada palabra por separado ya te da una pista de si el correo es spam, y el filtro más simple posible es ir multiplicando esas pistas entre sí, como si cada palabra "votara" de forma independiente. Esa es exactamente la lógica de **Naive Bayes**: parte de una creencia inicial (¿qué proporción de correos es spam en general?) y la va ajustando con cada característica observada, usando el [[bayes|teorema de Bayes]].

Se llama "ingenuo" (*naive*) porque asume que las características son independientes entre sí una vez conocida la clase —algo que casi nunca es del todo cierto: "gratis" y "oferta" tienden a aparecer juntas en el spam, no de forma independiente—. Pese a esa simplificación, funciona sorprendentemente bien en la práctica, es muy rápido de entrenar y sigue siendo un clásico en filtrado de spam, análisis de sentimiento y otros problemas con muchas características.

## Explicación

### De Bayes a una regla de clasificación

El [[bayes|teorema de Bayes]] permite calcular $P(C\mid X)$, la probabilidad de una clase $C$ dado un conjunto de características $X$, a partir de $P(X\mid C)$ y $P(C)$. Para clasificar, basta con encontrar la clase que maximiza esa probabilidad posterior. Como el denominador del teorema de Bayes, $P(X)$, es el mismo para todas las clases, se puede ignorar al comparar: buscar la clase más probable equivale a buscar la que maximiza $P(X\mid C)\cdot P(C)$.

### La suposición "ingenua": independencia condicional

Calcular $P(X\mid C)$ para un conjunto de características que interactúan entre sí es, en general, muy costoso. Naive Bayes lo simplifica asumiendo [[prob-condicional|independencia condicional]]: que, dada la clase, cada característica es independiente de las demás, y la probabilidad conjunta se convierte entonces en un simple producto de probabilidades individuales, una por característica. Esta es la simplificación que da nombre al método y la que lo hace tan rápido de calcular incluso con muchas características.

### Entrenar y predecir

Entrenar Naive Bayes consiste en estimar, a partir de los datos, la probabilidad previa de cada clase (contando frecuencias) y la probabilidad de cada característica dentro de cada clase. Para características categóricas, esto también es contar frecuencias; para características continuas, se suele asumir que siguen una distribución normal dentro de cada clase y se estima su media y varianza (la variante **Gaussian Naive Bayes**). Para clasificar una observación nueva, se multiplica la probabilidad previa de cada clase por la probabilidad de cada característica observada dentro de esa clase, y se elige la clase con el producto mayor.

## Formalización

$$
\hat C = \arg\max_C\ P(C)\cdot\prod_{i=1}^n P(x_i\mid C)
$$

donde:
- $\hat C$ es la clase predicha.
- $P(C)$ es la probabilidad previa de la clase $C$ (frecuencia de $C$ en el entrenamiento).
- $x_1,\dots,x_n$ son las características de la observación a clasificar.
- $P(x_i\mid C)$ es la probabilidad (verosimilitud, ver [[bayes]]) de observar la característica $x_i$ dentro de la clase $C$, estimada a partir del entrenamiento.
- $\prod$ es el producto de esas probabilidades: la independencia condicional es lo que permite descomponer $P(X\mid C)$ como este producto en vez de una distribución conjunta completa.

**Ejemplo numérico** (jugar al golf según tiempo, temperatura, humedad y viento; 14 días de entrenamiento, 9 con "Sí" y 5 con "No"). Para un día soleado, con temperatura y humedad altas y sin viento, las probabilidades condicionadas observadas en los datos dan (verificado con fracciones exactas en Python):

$$
P(\text{Sí})\cdot\textstyle\prod P(x_i\mid\text{Sí}) = \frac{9}{14}\cdot\frac{2}{9}\cdot\frac{3}{9}\cdot\frac{3}{9}\cdot\frac{6}{9} = \frac{2}{189}\approx0{,}0106
$$

$$
P(\text{No})\cdot\textstyle\prod P(x_i\mid\text{No}) = \frac{5}{14}\cdot\frac{3}{5}\cdot\frac{2}{5}\cdot\frac{4}{5}\cdot\frac{2}{5} = \frac{24}{875}\approx0{,}0274
$$

Como $0{,}0274>0{,}0106$, el modelo predice "No" para ese día, aunque haga falta normalizar (dividir cada valor entre su suma) para obtener probabilidades reales: $P(\text{Sí}\mid X)\approx0{,}278$ y $P(\text{No}\mid X)\approx0{,}722$.

## Interactivo

```widget
motor: probabilidad
modo: naive-bayes
vocabulario: [{"palabra": "gratis", "p_spam": 0.28, "p_ham": 0.02}, {"palabra": "oferta", "p_spam": 0.22, "p_ham": 0.03}, {"palabra": "reunión", "p_spam": 0.01, "p_ham": 0.09}, {"palabra": "factura", "p_spam": 0.04, "p_ham": 0.07}]
```

- Prueba a escribir un mensaje con "gratis" y "oferta" juntas y observa cuánto sube la probabilidad de spam.
- Prueba a añadir "reunión" a un mensaje que ya contiene "gratis": comprueba si consigue bajar la probabilidad de spam por debajo del 50%.
- Prueba a escribir un mensaje sin ninguna palabra del vocabulario y observa qué probabilidad usa el modelo cuando no tiene evidencia.

## En código

```python
from fractions import Fraction as F

p_si, p_no = F(9, 14), F(5, 14)
# P(característica | clase), leídas de las 14 filas de entrenamiento
tiempo_si, tiempo_no = F(2, 9), F(3, 5)
temp_si, temp_no = F(3, 9), F(2, 5)
humedad_si, humedad_no = F(3, 9), F(4, 5)
viento_si, viento_no = F(6, 9), F(2, 5)

score_si = p_si * tiempo_si * temp_si * humedad_si * viento_si
score_no = p_no * tiempo_no * temp_no * humedad_no * viento_no
print(float(score_si), float(score_no))
# 0.0106 0.0274

total = score_si + score_no
print(round(float(score_si / total), 3), round(float(score_no / total), 3))
# 0.278 0.722  -> predicción: "No"
```

## Errores típicos

- **Error**: pensar que "ingenuo" (*naive*) significa que el modelo es poco fiable en la práctica. → **Correcto**: la independencia condicional rara vez se cumple exactamente, pero el clasificador suele funcionar bien de todos modos, sobre todo en texto con muchas características.
- **Error**: leer el producto $P(C)\cdot\prod_i P(x_i\mid C)$ como la probabilidad final de la clase. → **Correcto**: ese producto solo es proporcional a la probabilidad posterior; para obtener una probabilidad real hay que normalizar dividiendo entre la suma de ese producto sobre todas las clases.
- **Error**: asumir que una probabilidad condicionada de 0 (una característica nunca vista en una clase durante el entrenamiento) apenas afecta al resultado. → **Correcto**: multiplicar por 0 anula todo el producto de golpe, por muy claras que sean las demás pistas; se evita con suavizado (por ejemplo, sumando una observación ficticia a cada conteo, el suavizado de Laplace).
- **Error**: buscar en Naive Bayes coeficientes interpretables como los de [[regresion-logistica]]. → **Correcto**: no hay pesos lineales que sumar; lo que se interpreta son las probabilidades condicionadas de cada característica por clase.

## En resumen

- Qué hace: asigna a una observación la clase que maximiza probabilidad previa × producto de probabilidades de cada característica dada esa clase.
- Cómo funciona: 1) estima $P(C)$ contando frecuencias de clase; 2) estima $P(x_i\mid C)$ para cada característica y clase; 3) ante una observación nueva, multiplica y compara ese producto entre clases.
- Fórmula clave: $\hat C=\arg\max_C P(C)\cdot\prod_i P(x_i\mid C)$.
- Úsalo con muchas características y pocos datos por característica (texto, spam, sentimiento), cuando necesites algo rápido de entrenar; evítalo si las características están fuertemente correlacionadas entre sí y esa dependencia importa para la predicción.
- Decisiones que importan: cómo estimar $P(x_i\mid C)$ según el tipo de dato (frecuencias para categóricas, densidad normal para continuas) y qué suavizado aplicar para evitar probabilidades cero.
- Trampa principal: una sola probabilidad condicionada igual a 0 en el entrenamiento anula el producto entero sin suavizado.

## Autoevaluación

### En el ejemplo del golf, $P(\text{No})\cdot\prod P(x_i\mid\text{No})\approx0{,}0274$ es mayor que el de "Sí" ($\approx0{,}0106$). ¿Qué significa exactamente $0{,}0274$?
- [ ] La probabilidad de que no se juegue al golf ese día
- [x] Un valor proporcional a esa probabilidad, que aún falta normalizar junto con el de "Sí" para obtener una probabilidad real
- [ ] La probabilidad de cada característica individual dado "No"
> Por qué: el producto $P(C)\cdot\prod_i P(x_i\mid C)$ ignora el denominador $P(X)$ del teorema de Bayes; solo tras normalizar entre todas las clases (aquí, dividir entre $0{,}0106+0{,}0274$) se obtiene la probabilidad posterior real, $0{,}722$.

### Entrenas un Naive Bayes de texto y una palabra nueva nunca aparece en los correos "spam" del entrenamiento, así que $P(\text{palabra}\mid\text{spam})=0$. ¿Qué pasa si esa palabra aparece en un correo nuevo?
- [ ] El modelo la ignora y sigue evaluando el resto de palabras con normalidad
- [x] Todo el producto para la clase "spam" se vuelve 0, aunque el resto de palabras del correo apunten claramente a spam
- [ ] El modelo asigna automáticamente la clase "no spam" solo por esa palabra
> Por qué: multiplicar por 0 anula el producto completo; es el motivo por el que en la práctica se aplica suavizado (por ejemplo, de Laplace) para que ninguna probabilidad condicionada sea exactamente 0.

### ¿Por qué Naive Bayes puede entrenarse mucho más rápido que un modelo que estimara la probabilidad conjunta completa $P(x_1,\dots,x_n\mid C)$ sin ninguna suposición?
- [ ] Porque usa menos datos de entrenamiento
- [x] Porque la independencia condicional reduce el problema a estimar una probabilidad por característica y clase, en vez de una combinación conjunta de todas las características a la vez
- [ ] Porque no necesita calcular ninguna probabilidad previa $P(C)$
> Por qué: sin la suposición de independencia, habría que estimar una probabilidad por cada combinación posible de valores de todas las características, que crece exponencialmente; el producto de probabilidades individuales evita ese coste.

## Glosario

- **suavizado de Laplace**: técnica que evita probabilidades condicionadas iguales a 0 sumando una pequeña cantidad ficticia a cada conteo de frecuencias antes de calcular las probabilidades.
