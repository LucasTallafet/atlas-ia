---
id: correlacion
estado: borrador
---

## En una frase

El coeficiente de correlación mide la fuerza y dirección de una relación lineal entre dos variables, entre −1 y 1, pero no dice si una causa a la otra.

## Intuición

Piensa en las horas de estudio y la nota de un examen: si más horas suelen venir acompañadas de mejores notas, esperas que ambas variables "se muevan juntas". El **coeficiente de correlación de Pearson**, $r$, resume esa tendencia en un único número entre −1 y 1: cerca de 1 significa que cuando una sube, la otra también; cerca de −1, que cuando una sube, la otra baja; cerca de 0, que no hay una relación lineal clara, aunque podría haber una relación no lineal.

Pero fíjate en un contraste clásico: las ventas de helados y los ahogamientos en la playa están correlacionados, y nadie diría que vender más helados provoca ahogamientos. Los dos suben con el calor del verano. Esa es la advertencia más importante de esta ficha: correlación no es causalidad.

## Explicación

### La correlación de Pearson: fuerza y dirección

Para medir si dos variables $X$ e $Y$ se relacionan linealmente usas el coeficiente de correlación de Pearson, que combina cómo varían conjuntamente (la **covarianza**) con cuánto varía cada una por separado (sus desviaciones típicas, [[estadistica-descriptiva]]). El resultado, siempre entre −1 y 1, es una escala normalizada: no importa en qué unidades midas $X$ e $Y$, $r$ da el mismo lenguaje para comparar relaciones distintas. Un $r$ cercano a 1 indica relación lineal positiva fuerte; cercano a −1, relación lineal negativa fuerte; cercano a 0, ausencia de relación lineal, no necesariamente ausencia de relación.

En inteligencia artificial, calcular las correlaciones entre cada variable predictora y la variable objetivo —antes incluso de entrenar un modelo— es un primer vistazo rápido a qué factores parecen importar. También sirve para detectar redundancia: dos variables muy correlacionadas entre sí aportan información parecida, lo que puede complicar la interpretación de un modelo lineal ([[multicolinealidad]]).

### Correlación no implica causalidad

Un $r$ alto solo dice que dos variables se mueven juntas en promedio; no dice cuál influye sobre cuál, ni siquiera si hay una influencia directa entre ellas. Puede existir una tercera variable oculta que explique a las dos a la vez —el calor del verano detrás de helados y ahogamientos—. En un dataset de IA este problema es serio: si los pacientes de una enfermedad provienen mayoritariamente de un hospital concreto, un modelo puede "aprender" a asociar la enfermedad con el hospital en vez de con los síntomas reales, y fallar en cuanto se despliegue con datos de otro origen.

## Formalización

$$
r = \frac{\text{cov}(X,Y)}{\sigma_X \cdot \sigma_Y}
$$

donde:
- $\text{cov}(X,Y)$: covarianza entre $X$ e $Y$; positiva si tienden a desviarse de su media en la misma dirección, negativa si lo hacen en direcciones opuestas.
- $\sigma_X, \sigma_Y$: desviaciones típicas de $X$ e $Y$.
- $r$: coeficiente de correlación de Pearson, siempre en $[-1, 1]$.

Ejemplo numérico (verificado): con $X=[2,4,5,6,8]$ e $Y=[5,6,7,8,9]$, las medias son $\bar X=5$ y $\bar Y=7$. Las desviaciones son $X-\bar X=[-3,-1,0,1,3]$ e $Y-\bar Y=[-2,-1,0,1,2]$; su producto suma $14$, de donde $\text{cov}(X,Y)=14/5=2,8$. La varianza de $X$ es $20/5=4$ ($\sigma_X=2$) y la de $Y$ es $10/5=2$ ($\sigma_Y\approx1,414$). Así, $r = 2,8/(2\cdot1,414)\approx0,99$: una relación lineal positiva casi perfecta.

:::nota-fuente
El material original calcula esta misma correlación y afirma que se obtendría un valor cercano a 0,97. El cálculo de arriba, verificado paso a paso, da 0,99. Aquí se usa el valor correcto.
:::

## Interactivo

```widget
motor: dispersion2d
modo: "correlacion"
dataset: {"generador": "lineal", "n": 60, "ruido": 0.3, "clases": 1, "semilla": 7}
controles: [{"nombre": "ruido", "min": 0, "max": 1.5, "paso": 0.05, "valor": 0.3, "etiqueta": "ruido"}]
```

- Prueba a subir el ruido hasta el máximo y observa cómo $r$ se acerca a 0.
- Prueba a bajar el ruido a 0 y comprueba que $r$ se acerca a 1.
- Prueba a pensar en una tercera variable oculta que explicara la correlación que ves, como en el ejemplo de los helados y los ahogamientos.

## En código

```python
import math

x = [2, 4, 5, 6, 8]
y = [5, 6, 7, 8, 9]
n = len(x)

mx = sum(x) / n
my = sum(y) / n
cov = sum((xi - mx) * (yi - my) for xi, yi in zip(x, y)) / n
sx = math.sqrt(sum((xi - mx) ** 2 for xi in x) / n)
sy = math.sqrt(sum((yi - my) ** 2 for yi in y) / n)
r = cov / (sx * sy)

print(f"r = {r:.2f}")  # r = 0.99
```

## Errores típicos

- **Error**: interpretar una correlación alta como prueba de causalidad. → **Correcto**: $r$ alto solo indica que dos variables se mueven juntas; la causa puede estar en una tercera variable oculta, o no existir relación causal en absoluto.
- **Error**: concluir que $r\approx 0$ significa que no hay ninguna relación entre las variables. → **Correcto**: Pearson solo mide relación lineal; dos variables pueden estar fuertemente relacionadas de forma no lineal y aun así dar un $r$ cercano a 0.
- **Error**: comparar coeficientes de correlación calculados sobre escalas o unidades distintas como si dijeran algo diferente sobre la fuerza de la relación. → **Correcto**: $r$ ya está normalizado entre −1 y 1 precisamente para poder comparar relaciones sin que las unidades originales influyan.
- **Error**: eliminar una variable de un modelo solo por estar correlacionada con otra, sin comprobar si esa correlación tiene sentido causal o es casual. → **Correcto**: conviene diferenciar redundancia real (multicolinealidad) de una asociación espuria antes de decidir qué variables mantener.

## En resumen

- Sirve para medir la fuerza y dirección de una relación lineal entre dos variables numéricas, en un único número entre −1 y 1.
- Se calcula dividiendo la covarianza entre las dos variables por el producto de sus desviaciones típicas.
- Fórmula clave: $r = \text{cov}(X,Y)/(\sigma_X\sigma_Y)$.
- Úsalo como primer vistazo exploratorio a relaciones entre variables; no lo uses para afirmar causalidad, ni cuando sospeches una relación no lineal.
- Lo que importa: el signo (dirección) y la magnitud (fuerza) de $r$, y revisar siempre el gráfico de dispersión antes de confiar solo en el número.
- La trampa principal: confundir correlación con causalidad, en especial cuando puede haber una tercera variable oculta detrás de ambas.

## A fondo

### Cuándo $r$ no basta

La correlación de Pearson solo capta relaciones lineales. Dos variables pueden tener una relación fuerte y perfectamente predecible —por ejemplo, $Y=X^2$— y aun así dar un $r$ cercano a 0, porque esa relación no es una línea recta. Por eso conviene mirar siempre el gráfico de dispersión antes de fiarse solo del número: la forma de la nube de puntos revela patrones que $r$ por sí solo no puede capturar.

### Correlaciones espurias

Una **correlación espuria** es una asociación que aparece en los datos sin que exista un vínculo causal real entre las variables, normalmente porque ambas responden a una causa común no observada, como el calor del verano en el ejemplo de los helados. Cuantas más variables se comparan entre sí, más probable es encontrar correlaciones altas por puro azar, sin que signifiquen nada. Antes de actuar sobre una correlación —por ejemplo, eliminar una variable de un modelo porque está "muy correlacionada" con otra, o basar una decisión de negocio en una asociación observada— conviene preguntarse si hay una explicación causal plausible, o si ambas variables simplemente comparten un origen común.

## Autoevaluación

### Un dataset muestra $r=0,95$ entre el número de bomberos enviados a un incendio y el tamaño de los daños. ¿Qué conclusión es correcta?
- [ ] Enviar más bomberos causa más daños, así que conviene enviar menos
- [x] La correlación es alta, pero probablemente ambas variables responden a una tercera causa: el tamaño del incendio
- [ ] El coeficiente de correlación demuestra que hay una relación causal directa
> Por qué: es el ejemplo clásico de correlación espuria: un incendio más grande provoca que se envíen más bomberos y, a la vez, causa más daños; la correlación entre bomberos y daños no implica que unos causen los otros.

### Dos variables tienen una relación exacta $Y=X^2$ en el rango $X\in[-3,3]$. ¿Qué esperas del coeficiente de correlación de Pearson?
- [ ] Cercano a 1, porque $Y$ depende completamente de $X$
- [ ] Cercano a −1, porque la relación es muy fuerte
- [x] Cercano a 0, porque Pearson solo detecta relaciones lineales y esta es simétrica y curva
> Por qué: aunque $Y$ está determinada completamente por $X$, la relación no es una línea recta: para $X$ negativo y positivo $Y$ crece en ambos sentidos, así que la covarianza lineal se cancela y $r$ resulta próximo a 0.

### Calculas $r=0,3$ entre dos variables de un dataset con 50.000 filas. ¿Qué es lo más razonable antes de usar ese resultado para decidir algo importante?
- [ ] Asumir directamente que hay una relación causal moderada
- [x] Revisar el gráfico de dispersión y considerar si podría haber una tercera variable o una relación no lineal antes de actuar
- [ ] Descartar la correlación por ser "solo 0,3" sin mirar nada más
> Por qué: ni un $r$ moderado garantiza causalidad, ni descartarlo sin más es correcto: conviene visualizar los datos y pensar en posibles causas comunes antes de tomar decisiones basadas solo en el coeficiente.

## Glosario

- **coeficiente de correlación de Pearson**: medida normalizada, denotada $r$, entre −1 y 1, de la fuerza y dirección de una relación lineal entre dos variables.
- **covarianza**: medida de cómo varían conjuntamente dos variables respecto a sus propias medias; positiva si se mueven en la misma dirección, negativa si en direcciones opuestas.
- **correlación espuria**: asociación observada entre dos variables que no refleja una relación causal real, a menudo por compartir una causa común no observada.
