---
id: contraste-hipotesis
estado: borrador
---

## En una frase

El contraste de hipótesis decide si una diferencia observada en los datos es evidencia real o puede explicarse por el azar del muestreo.

## Intuición

Piensa en un juicio: se presume inocente al acusado (la **hipótesis nula**) hasta que la evidencia sea lo bastante fuerte para condenarlo (rechazarla a favor de la **hipótesis alternativa**). El contraste de hipótesis funciona igual: partes de un supuesto conservador —"no hay diferencia", "la moneda es justa", "el modelo nuevo no mejora al antiguo"— y solo lo abandonas si los datos serían muy raros bajo ese supuesto.

Imagina que lanzas una moneda 100 veces y salen 60 caras. ¿Está trucada, o es solo mala suerte? El contraste responde con una pregunta muy concreta: si la moneda fuera justa, ¿qué tan raro sería obtener 60 caras o más? Esa "rareza" es el **valor p**. Cuanto más pequeño, más incómodo resulta seguir creyendo en la hipótesis nula. En inteligencia artificial la misma lógica sirve para decidir si un modelo nuevo realmente supera al anterior, o si esa mejora observada es ruido del muestreo.

## Explicación

### Hipótesis nula y alternativa

La **hipótesis nula** ($H_0$) es el punto de partida conservador: "no hay diferencia", "no hay efecto". La **hipótesis alternativa** ($H_1$) es lo que quieres poder afirmar si los datos lo respaldan. Puede ser bilateral, $H_1: \mu_1 \ne \mu_2$ (interesa cualquier diferencia, en cualquier sentido), o unilateral, $H_1: \mu_1 > \mu_2$ (interesa solo la mejora en una dirección concreta). La elección depende de la pregunta: comparar dos modelos de IA sin saber cuál esperas que gane pide un contraste bilateral; comprobar específicamente si uno mejora al otro pide uno unilateral.

### Dos formas de equivocarse

Rechazar o no rechazar $H_0$ nunca es infalible, porque la decisión se toma con una muestra ([[muestreo-intervalos]]). El **error de tipo I** es rechazar $H_0$ siendo cierta —dar por real un efecto que no existe—; su probabilidad se fija de antemano como el **nivel de significación** $\alpha$ (habitualmente 0,05). El **error de tipo II** es no rechazar $H_0$ siendo falsa —dejar pasar un efecto real—; su probabilidad se llama $\beta$, y $1-\beta$ es la **potencia** del contraste, la capacidad de detectar un efecto que existe. Ambos errores tiran en direcciones opuestas: exigir menos $\alpha$ (por ejemplo, pasar de 0,05 a 0,01) reduce los falsos positivos, pero aumenta el riesgo de dejar pasar mejoras reales, salvo que se compense con más datos.

### El valor p: qué mide y qué no mide

El **valor p** es la probabilidad de observar un resultado tan extremo o más que el obtenido, suponiendo que $H_0$ es cierta: $P(\text{datos extremos} \mid H_0)$. No es, y esta es la confusión más frecuente, la probabilidad de que $H_0$ sea cierta dado lo observado, $P(H_0 \mid \text{datos})$ —esa cantidad requeriría otro tipo de razonamiento, el bayesiano ([[bayes]]).

Un valor p pequeño (por convención, $p \le 0,05$) se interpreta como evidencia contra $H_0$: bajo el supuesto de que no hay efecto, los datos observados serían raros. Pero un valor p pequeño no dice nada sobre el tamaño del efecto: con una muestra suficientemente grande, hasta una diferencia diminuta puede dar un valor p minúsculo. Y un valor p grande tampoco demuestra que $H_0$ sea cierta; solo indica que los datos no se alejan lo bastante de lo esperado bajo ella.

## Formalización

$$
t = \frac{\bar{X}_1 - \bar{X}_2}{SE}
$$

donde:
- $\bar{X}_1, \bar{X}_2$: medias muestrales de los dos grupos que se comparan.
- $SE$: error estándar de la diferencia de medias, que combina la dispersión y el tamaño de cada grupo.
- $t$: estadístico de prueba; se compara con el valor crítico de la distribución t (o normal, si la muestra es grande) para decidir si se rechaza $H_0$.

Regla de decisión: se rechaza $H_0$ si $t$ supera, en valor absoluto si es bilateral, el valor crítico correspondiente a $\alpha$; equivalentemente, si el valor p resultante es menor o igual que $\alpha$.

Ejemplo numérico (verificado): dos grupos de 30 estudiantes, con medias 7,5 y 7,0, dan $t=2,1$ con 58 grados de libertad. El valor crítico de la t de Student al 5% (unilateral) con 58 g.l. es aproximadamente 1,67. Como $2,1 > 1,67$, se rechaza $H_0$: la diferencia observada es demasiado grande para explicarse solo por azar de muestreo.

## Interactivo

```widget
motor: funcion
modo: "region"
funciones: [{"expr": "exp(-x^2/2)/sqrt(2*pi)", "etiqueta": "Distribucion de z bajo H0"}]
x: [-4, 4]
sombrear: {"desde": "1.96", "hasta": "4"}
```

- Prueba a fijarte en el área sombreada: es el valor p de un contraste unilateral con $z=1,96$, aproximadamente 0,025.
- Prueba a imaginar que sombreas también la cola izquierda, de $-4$ a $-1,96$: sumando ambas áreas obtienes el valor p bilateral, unas 0,05.
- Prueba a comparar esta área con el ejemplo de la moneda: 60 caras en 100 lanzamientos corresponde a $z=2$, ligeramente a la derecha de la línea sombreada.

## En código

```python
import math

def phi(z):
    return 0.5 * (1 + math.erf(z / math.sqrt(2)))

caras = 60
n = 100
p_nula = 0.5
media_esperada = n * p_nula                          # 50.0
sd_esperada = math.sqrt(n * p_nula * (1 - p_nula))    # 5.0

z = (caras - media_esperada) / sd_esperada    # 2.0
p_valor = 2 * (1 - phi(z))                    # bilateral

print(f"z = {z:.2f}")               # z = 2.00
print(f"valor p = {p_valor:.3f}")   # valor p = 0.046
```

## Errores típicos

- **Error**: interpretar el valor p como la probabilidad de que $H_0$ sea cierta. → **Correcto**: el valor p es $P(\text{datos extremos}\mid H_0)$, no $P(H_0\mid\text{datos})$; son cantidades distintas y confundirlas invierte el razonamiento del contraste.
- **Error**: pensar que un valor p muy pequeño implica un efecto grande. → **Correcto**: el valor p depende también del tamaño de muestra; con datos suficientes, efectos minúsculos producen valores p diminutos sin ser relevantes en la práctica.
- **Error**: usar un contraste bilateral cuando en realidad solo interesa una dirección del efecto, o al revés. → **Correcto**: la elección debe fijarse según la pregunta antes de ver los datos, no ajustarse después para conseguir un resultado significativo.
- **Error**: bajar $\alpha$ sin más para "estar más seguros", sin pensar en las consecuencias. → **Correcto**: reducir $\alpha$ disminuye el error de tipo I, pero aumenta el de tipo II (menor potencia); el equilibrio depende del coste relativo de cada tipo de error.

## En resumen

- Sirve para decidir si una diferencia observada en los datos, por ejemplo entre dos modelos, es evidencia real o puede deberse al azar del muestreo.
- Funciona en pasos: fija $H_0$ y $H_1$, calcula un estadístico de prueba, compáralo con su distribución bajo $H_0$, obtén el valor p y compáralo con $\alpha$.
- Regla clave: rechaza $H_0$ si el valor p ≤ $\alpha$ (habitualmente 0,05).
- Úsalo para contrastar afirmaciones puntuales (¿es mejor este modelo?); no lo uses como única medida de si una mejora merece la pena, sin mirar también el tamaño del efecto.
- Decisiones que importan: bilateral vs. unilateral, y el valor de $\alpha$ (equilibrio entre error de tipo I y tipo II).
- La trampa principal: un valor p pequeño no mide cuán grande es el efecto, solo cuán raro sería bajo $H_0$.

## A fondo

### La relación entre significación estadística y relevancia práctica

Que una diferencia sea "estadísticamente significativa" no significa que sea grande ni que merezca actuar sobre ella. Pasar de F1 = 0,910 a F1 = 0,918 con $p=0,03$ gracias a más datos de entrenamiento puede ser significativo y, a la vez, demasiado pequeño para justificar el coste de cambiar de modelo. Por eso conviene acompañar siempre el valor p con el **tamaño del efecto** (la magnitud real de la diferencia) y con un intervalo de confianza ([[muestreo-intervalos]]) para esa diferencia: el intervalo comunica un rango de valores plausibles, mientras que el valor p solo comunica cuán raro sería el resultado bajo $H_0$.

### Contraste de la moneda: por qué el tamaño de muestra importa

Con 100 lanzamientos y 60 caras, la desviación típica esperada del número de caras es $\sqrt{100 \cdot 0,5 \cdot 0,5}=5$, así que 60 caras están a 2 desviaciones típicas de las 50 esperadas: un valor p bilateral de aproximadamente 0,046. Con 1000 lanzamientos y el mismo 60% (600 caras), la desviación típica sube a $\sqrt{1000 \cdot 0,5 \cdot 0,5}\approx 15,8$, pero la distancia a lo esperado (500) es de 100, más de 6 desviaciones típicas: el valor p cae por debajo de una millonésima. El mismo efecto relativo (60% de caras) da muchísima más evidencia cuantas más observaciones hay, porque el error estándar decrece con el tamaño de la muestra.

Esta misma dependencia del tamaño de muestra es la razón por la que comparar dos modelos con apenas 200 ejemplos deja poco margen para distinguir una mejora real de un accidente del muestreo, mientras que la misma diferencia con 20.000 ejemplos puede resultar concluyente. El valor p descansa además sobre supuestos —independencia de las observaciones, distribución conocida del estadístico bajo $H_0$— que conviene revisar, y su papel se retoma al vigilar un modelo ya desplegado ([[monitorizacion-drift]]).

## Autoevaluación

### Una moneda se lanza 100 veces y salen 60 caras. Bajo $H_0: p=0,5$, el valor p bilateral es aproximadamente 0,046. ¿Qué significa exactamente este número?
- [ ] La probabilidad de que la moneda sea justa es del 4,6%
- [x] Si la moneda fuera justa, la probabilidad de obtener un resultado tan extremo como 60 caras (o más raro) es del 4,6%
- [ ] La moneda está trucada con un 95,4% de certeza
> Por qué: el valor p es una probabilidad condicionada a que $H_0$ sea cierta, $P(\text{datos extremos}\mid H_0)$, nunca la probabilidad de que $H_0$ sea cierta o falsa.

### Repites el mismo experimento de la moneda (60% de caras) con 1000 lanzamientos en vez de 100. ¿Qué le pasa al valor p?
- [ ] Se mantiene igual, porque la proporción de caras no cambió
- [x] Se hace mucho más pequeño, porque el error estándar decrece al aumentar el tamaño de muestra
- [ ] Se hace más grande, porque hay más datos que podrían contradecir la hipótesis
> Por qué: la desviación típica del número de caras crece con $\sqrt{n}$, más despacio que la distancia absoluta al valor esperado, que crece con $n$; el mismo porcentaje se aleja más "desviaciones típicas" del centro cuantos más datos hay.

### Comparas dos modelos de clasificación con solo 200 ejemplos de test y obtienes un valor p de 0,20. ¿Qué concluyes correctamente?
- [ ] Que los dos modelos son iguales
- [x] Que no hay evidencia suficiente en esta muestra para rechazar $H_0$, aunque eso no demuestra que $H_0$ sea cierta
- [ ] Que hace falta bajar $\alpha$ hasta que el resultado sea significativo
> Por qué: un valor p grande no demuestra $H_0$; solo indica que los datos no se alejan lo bastante de lo esperado bajo ella. Ajustar $\alpha$ después de ver los datos para forzar significación invalida el contraste.

### Un equipo baja el nivel de significación de $\alpha=0,05$ a $\alpha=0,01$ para "estar más seguro" de que un nuevo modelo mejora al anterior. ¿Qué consecuencia trae ese cambio?
- [x] Disminuye el riesgo de error de tipo I, pero aumenta el riesgo de error de tipo II
- [ ] Disminuye ambos tipos de error a la vez
- [ ] No cambia nada relevante, solo el número que se reporta
> Por qué: exigir un umbral más estricto reduce los falsos positivos (tipo I) pero, con la misma muestra, hace más difícil detectar un efecto real que sí existe, aumentando el error de tipo II (menor potencia).

## Glosario

- **hipótesis nula**: afirmación conservadora de partida, denotada $H_0$, que el contraste intenta rechazar con evidencia suficiente.
- **hipótesis alternativa**: lo que se quiere poder afirmar, denotada $H_1$, si los datos contradicen suficientemente a $H_0$; puede ser bilateral o unilateral.
- **error de tipo I**: rechazar $H_0$ siendo cierta; su probabilidad es el nivel de significación $\alpha$.
- **error de tipo II**: no rechazar $H_0$ siendo falsa; su probabilidad se denota $\beta$.
- **potencia**: probabilidad de detectar un efecto real; se calcula como $1-\beta$.
- **valor p**: probabilidad de observar datos tan extremos o más que los obtenidos, suponiendo que $H_0$ es cierta.
- **contraste bilateral**: contraste que considera extremos los resultados alejados de $H_0$ en ambas direcciones.
- **contraste unilateral**: contraste que considera extremos los resultados alejados de $H_0$ solo en una dirección concreta.
