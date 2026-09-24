---
id: dist-binomial
estado: borrador
---

## En una frase

La distribución binomial calcula la probabilidad de obtener exactamente $k$ éxitos al repetir $n$ veces un experimento de solo dos resultados posibles, cada uno con la misma probabilidad de éxito.

## Intuición

Piensa en lanzar una moneda 10 veces y preguntarte cuántas caras vas a obtener. No sabes el resultado exacto, pero sí sabes que 5 caras es más probable que 0 o 10. La **distribución binomial** responde exactamente a ese tipo de pregunta: dado un número fijo de intentos y una probabilidad de éxito constante en cada uno, ¿qué tan probable es cada posible número total de éxitos?

En IA esta pregunta aparece cada vez que evalúas un clasificador. Si un modelo acierta el 90% de las veces y lo pruebas en 50 casos nuevos, el número exacto de aciertos no será siempre el mismo: fluctuará. La binomial explica y cuantifica esa fluctuación, convirtiendo una cifra de precisión aislada en un abanico de resultados esperables.

## Explicación

### Ensayos de Bernoulli repetidos

La binomial modela una secuencia de **ensayos de Bernoulli**: pruebas independientes donde cada una solo puede terminar en éxito o fracaso, con la misma probabilidad de éxito $p$ en todas ellas. El número de intentos $n$ está fijado de antemano. La pregunta que resuelve la binomial es: si la probabilidad de éxito en un intento es $p$, ¿cuál es la probabilidad de observar exactamente $k$ éxitos en $n$ intentos?

### De la evaluación de modelos a la binomial

Cuando se dice que un clasificador tiene una precisión del 90%, esa cifra es un promedio, no una garantía fija para cada lote de datos. Si evalúas el modelo en 50 ejemplos nuevos, el número real de fallos variará de un lote a otro. La binomial permite calcular la probabilidad de que, en esos 50 intentos, el modelo falle exactamente 3 veces, o como mucho 5, o más de 10. Esto transforma una métrica de rendimiento aparentemente fija en una distribución completa de resultados posibles, lo que resulta esencial para construir intervalos de confianza y decidir si una caída de precisión observada en un lote concreto es solo ruido de muestreo o una señal real de que el modelo ha empeorado.

### Su forma según $n$ y $p$

Cuando $p$ es cercano a 0,5, la distribución es bastante simétrica alrededor de $n\cdot p$. Cuando $p$ es muy bajo o muy alto, la distribución se desplaza hacia uno de los extremos y se vuelve asimétrica. A medida que $n$ crece, la forma de la binomial se aproxima cada vez más a una [[dist-normal|distribución normal]], una manifestación más del Teorema Central del Límite.

## Formalización

$$
P(X=k) = \binom{n}{k}\, p^k\, (1-p)^{n-k}
$$

donde:

- $X$ es la variable aleatoria que cuenta el número de éxitos.
- $n$ es el número fijo de intentos (ensayos de Bernoulli).
- $p$ es la probabilidad de éxito en cada intento, constante en todos ellos.
- $k$ es el número concreto de éxitos cuya probabilidad se calcula, con $0 \le k \le n$.
- $\binom{n}{k} = \frac{n!}{k!(n-k)!}$ cuenta de cuántas formas distintas pueden distribuirse los $k$ éxitos entre los $n$ intentos.

Su media y varianza tienen forma cerrada: $E[X] = n\,p$ y $\mathrm{Var}(X) = n\,p\,(1-p)$.

**Ejemplo numérico:** con $n=4$ intentos y $p=0{,}5$, la probabilidad de obtener exactamente $k=2$ éxitos es

$$
P(X=2) = \binom{4}{2}\, 0{,}5^2\, 0{,}5^2 = 6 \cdot 0{,}25 \cdot 0{,}25 = 0{,}375
$$

La media esperada es $E[X]=4\cdot 0{,}5=2$ éxitos, y la varianza, $\mathrm{Var}(X)=4\cdot 0{,}5\cdot 0{,}5=1$.

## Interactivo

```widget
motor: funcion
modo: discreta
funciones: [{"expr": "comb(n,x)*p^x*(1-p)^(n-x)", "etiqueta": "P(X=k)"}]
parametros: [{"nombre": "n", "min": 1, "max": 50, "paso": 1, "valor": 10, "etiqueta": "intentos n"}, {"nombre": "p", "min": 0, "max": 1, "paso": 0.05, "valor": 0.5, "etiqueta": "probabilidad de éxito p"}]
x: [0, 50]
```

- Prueba a fijar $p=0{,}5$ y aumentar $n$: observa cómo la forma discreta empieza a parecerse a la campana de la [[dist-normal|normal]].
- Prueba a poner $p=0{,}1$ con $n$ pequeño: la distribución queda muy volcada hacia valores bajos de $k$.
- Prueba a comparar visualmente la media $n\cdot p$ con el pico de la distribución: deberían coincidir aproximadamente.

## En código

```python
from math import comb

n, p = 4, 0.5
probs = [comb(n, k) * p**k * (1 - p)**(n - k) for k in range(n + 1)]
print([round(x, 3) for x in probs])  # [0.062, 0.25, 0.375, 0.25, 0.062]
print(sum(probs))  # 1.0, como debe sumar toda distribución de probabilidad
```

## Errores típicos

- **Error**: usar la binomial cuando la probabilidad de éxito cambia entre intentos (por ejemplo, al extraer sin reposición). → **Correcto**: la binomial exige que $p$ sea constante en todos los intentos; si cambia, hace falta otro modelo, como la distribución hipergeométrica.
- **Error**: confundir $n$ con el número de éxitos y $k$ con el número de intentos. → **Correcto**: $n$ es siempre el total de intentos, fijo de antemano; $k$ es el número concreto de éxitos cuya probabilidad se calcula.
- **Error**: pensar que una precisión del 90% garantiza exactamente 9 aciertos en cada lote de 10. → **Correcto**: el 90% es la probabilidad de éxito por intento; el número real de aciertos en un lote concreto fluctúa según la distribución binomial.
- **Error**: olvidar el coeficiente $\binom{n}{k}$ y calcular solo $p^k(1-p)^{n-k}$. → **Correcto**: ese coeficiente cuenta todas las formas distintas de ordenar los $k$ éxitos entre los $n$ intentos; sin él, la probabilidad queda muy por debajo de la real.

## En resumen

- **Qué es:** la probabilidad de obtener exactamente $k$ éxitos en $n$ intentos independientes con probabilidad de éxito $p$ constante.
- **Cómo funciona:** cuenta todas las formas de distribuir los $k$ éxitos entre los $n$ intentos y pondera cada una por su probabilidad.
- **Fórmula clave:** $P(X=k)=\binom{n}{k}p^k(1-p)^{n-k}$.
- **Cuándo usarla:** para evaluar la variabilidad de un clasificador binario en un lote fijo de datos, o cualquier conteo de éxitos en un número fijo de intentos independientes.
- **Cuándo no usarla:** si $p$ cambia entre intentos o los intentos no son independientes.
- **Decisiones que importan:** $n$ y $p$ determinan por completo la forma; su media es $np$ y su varianza $np(1-p)$.
- **Trampa principal:** confundir el rendimiento promedio de un modelo con el resultado garantizado en cada lote concreto.

## A fondo

### La binomial en validación cruzada

Cada vez que se divide un conjunto de datos en entrenamiento y validación, los aciertos que obtiene el modelo en la partición de validación siguen, en esencia, la lógica de una binomial: un número fijo de casos evaluados, cada uno acierto o fallo, con una probabilidad de acierto aproximadamente constante si el modelo ya está entrenado y fijo. Esto permite distinguir qué parte de la variación de rendimiento entre distintas particiones se debe simplemente al azar del muestreo y qué parte refleja un problema real de generalización del modelo.

## Autoevaluación

### Un sistema de detección de fraude acierta el 95% de las veces. Si lo pruebas en 100 transacciones, ¿qué esperarías observar?
- [ ] Exactamente 95 aciertos, siempre.
- [x] Un número de aciertos que fluctúa alrededor de 95, según la distribución binomial con $n=100$, $p=0{,}95$.
- [ ] Un número de aciertos completamente impredecible, sin relación con el 95%.
> Por qué: el 95% es la probabilidad de acierto por transacción, no una garantía fija; el número real de aciertos en un lote de 100 sigue una binomial centrada en $np=95$, con cierta dispersión alrededor de ese valor.

### ¿Por qué no puedes aplicar la fórmula binomial para calcular la probabilidad de sacar 2 ases al extraer 2 cartas de una baraja sin reposición?
- [ ] Porque la binomial solo funciona con monedas.
- [x] Porque al no reponer la carta extraída, la probabilidad de éxito cambia entre el primer y el segundo intento, y la binomial exige que $p$ sea constante.
- [ ] Porque $n$ y $k$ no pueden ser ambos iguales a 2.
> Por qué: la binomial asume ensayos independientes con la misma $p$ en cada uno; al extraer sin reponer, la composición del mazo cambia tras la primera carta, así que ya no se cumple esa condición (esto es justo el ejemplo de dependencia visto en [[prob-condicional]]).

### En una binomial con $n=10$ y $p=0{,}9$, ¿alrededor de qué valor de $k$ esperas la mayor probabilidad?
- [ ] Alrededor de $k=5$, porque es el punto medio de $n$.
- [x] Alrededor de $k=9$, porque la media es $n\cdot p = 10\cdot 0{,}9 = 9$.
- [ ] Alrededor de $k=0$, porque $p$ es alta.
> Por qué: la media de una binomial es $np$; con $p$ alta, el pico de la distribución se desplaza hacia valores altos de $k$, no se queda en el centro del rango $[0,n]$.

## Glosario

- **Ensayo de Bernoulli**: prueba con solo dos resultados posibles, éxito o fracaso, con una probabilidad de éxito fija.
- **Distribución binomial**: distribución de probabilidad del número de éxitos en $n$ ensayos de Bernoulli independientes con la misma $p$.
- **Coeficiente binomial**: número de formas distintas de elegir $k$ elementos entre $n$, denotado $\binom{n}{k}$ y usado para contar los órdenes posibles de los éxitos.
