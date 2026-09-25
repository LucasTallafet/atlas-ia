---
id: multicolinealidad
estado: borrador
---

## En una frase

La multicolinealidad aparece cuando dos o más variables predictoras están muy correlacionadas entre sí, y hace que los coeficientes de un modelo lineal se vuelvan inestables y difíciles de interpretar.

## Intuición

Imagina que intentas repartir el mérito de un gol entre el jugador que dio el pase y el que remató, cuando en realidad casi siempre son la misma persona jugando dos posiciones casi idénticas. Un modelo de regresión lineal que use dos variables casi idénticas como predictoras —la altura en centímetros y la altura en pulgadas, por ejemplo— se enfrenta al mismo problema: no hay forma fiable de repartir entre ellas cuánto explica cada una, porque llevan casi la misma información.

A eso se le llama **multicolinealidad**, y aunque el modelo puede seguir haciendo predicciones razonables, sus coeficientes dejan de significar lo que crees que significan.

## Explicación

### Qué es y qué efectos tiene

La multicolinealidad ocurre cuando dos o más variables independientes de un modelo comparten gran parte de su información, es decir, están muy correlacionadas entre sí (ver [[correlacion]]). El problema no es que el modelo prediga mal —el ajuste global puede seguir siendo bueno—, sino que deja de poder repartir con fiabilidad la contribución de cada variable correlacionada: los **coeficientes se vuelven inestables** (cambian mucho ante pequeñas variaciones en los datos), pierden interpretabilidad (ya no reflejan el efecto real de cada variable) y su **varianza aumenta** (los errores estándar se disparan, dificultando saber si un coeficiente es significativo).

### Cómo detectarla

La primera pista suele venir de la propia [[correlacion|matriz de correlación]] entre las variables predictoras: valores cercanos a $1$ o $-1$ señalan candidatas a multicolinealidad. Pero la matriz solo captura relaciones entre pares de variables; para detectar relaciones más complejas entre varias variables a la vez se usa el **factor de inflación de la varianza (VIF)**, que mide cuánto se infla la varianza del coeficiente de una variable por su relación con las demás.

### Cómo tratarla

La solución más directa es eliminar una de las variables redundantes, si no aporta información adicional relevante. Cuando eliminar no es una opción —por ejemplo, porque todas las variables interesan—, la [[reduccion-dimensionalidad|reducción de dimensionalidad]] puede combinarlas en componentes no correlacionados. Y cuando el objetivo es mantener todas las variables pero estabilizar el modelo, la [[regularizacion|regularización]] (Ridge o Lasso) penaliza los coeficientes grandes y reduce su sensibilidad a la correlación entre predictoras.

## Formalización

$$
VIF(X_j) = \frac{1}{1 - R_j^2}
$$

donde:
- $X_j$ es la variable predictora cuya multicolinealidad se evalúa.
- $R_j^2$ es el coeficiente de determinación de la regresión de $X_j$ sobre el resto de las variables predictoras.

En general, un $VIF > 5$ indica multicolinealidad moderada y un $VIF > 10$, severa.

## Interactivo

```widget
motor: pasos
---
### Dos variables casi idénticas

Ajustamos una regresión lineal $Y = \beta_0 + \beta_1 X_1 + \beta_2 X_2$ con estas 5 observaciones. Fíjate en que $X_1$ y $X_2$ son casi la misma variable ($r = 0{,}9954$).

| $X_1$ | $X_2$ | $Y$ |
|---|---|---|
| 10 | 12 | 21 |
| 20 | 19 | 39 |
| 30 | 31 | 62 |
| 40 | 39 | 79 |
| 50 | 52 | 101 |
---
**Ajuste con los datos originales**

$\beta_1 = 1{,}261$, $\beta_2 = 0{,}739$, con $R^2 = 0{,}9995$: el modelo predice muy bien, y reparte el "mérito" entre $X_1$ y $X_2$ de una forma concreta.
---
**Cambiamos un solo dato: el último valor de $X_2$ pasa de 52 a 53**

$\beta_1 = 1{,}391$, $\beta_2 = 0{,}597$, con $R^2 = 0{,}9993$.

El ajuste global apenas cambia, pero los coeficientes sí: $\beta_1$ sube y $\beta_2$ baja de forma notable, solo por mover un dato en una unidad.
---
**Conclusión**

Con $X_1$ y $X_2$ tan correlacionadas ($r=0{,}9954$, $VIF \approx 110$), el modelo no puede decidir con fiabilidad cuánto "mérito" es de cada variable: cualquier pequeño cambio en los datos reparte de otra forma el mismo resultado global. La predicción es estable; los coeficientes, no.
```

- Prueba a fijarte en que $R^2$ apenas cambia entre los dos ajustes, mientras que $\beta_1$ y $\beta_2$ sí lo hacen de forma notable.
- Prueba a imaginar qué pasaría si $X_1$ y $X_2$ fueran variables independientes: ¿esperarías el mismo salto en los coeficientes al cambiar un solo dato?
- Prueba a relacionar el valor de $VIF \approx 110$ (muy por encima de 10) con lo inestables que resultan $\beta_1$ y $\beta_2$ en el ejemplo.

## Errores típicos

- **Error**: pensar que la multicolinealidad empeora la capacidad predictiva del modelo. → **Correcto**: el ajuste global ($R^2$) puede seguir siendo muy bueno; lo que se pierde es la fiabilidad de los coeficientes individuales.
- **Error**: fiarte solo de la matriz de correlación de pares para descartar multicolinealidad. → **Correcto**: puede existir una relación fuerte entre tres o más variables a la vez que no se vea en ninguna correlación de a pares; para eso está el VIF.
- **Error**: eliminar variables correlacionadas sin valorar cuál aporta más al problema. → **Correcto**: conviene comparar su relevancia para el objetivo antes de decidir cuál quitar.
- **Error**: confundir la multicolinealidad (entre variables predictoras) con la correlación entre una predictora y la variable objetivo. → **Correcto**: la primera es un problema a mitigar; la segunda es justo la señal que el modelo aprovecha.

## En resumen

- **Qué hace**: describe el problema de tener predictoras muy correlacionadas entre sí en un modelo lineal.
- **Cómo funciona**: variables redundantes impiden repartir con fiabilidad el efecto de cada una entre sí, aunque la predicción conjunta siga siendo buena.
- **Fórmula clave**: $VIF(X_j) = 1/(1-R_j^2)$; un $VIF > 10$ indica multicolinealidad severa.
- **Cuándo importa**: sobre todo en modelos que se interpretan por sus coeficientes, como la regresión lineal o la logística.
- **Decisiones que importan**: eliminar variables redundantes, combinarlas con reducción de dimensionalidad o regularizar (Ridge/Lasso).
- **Trampa principal**: pensar que un buen $R^2$ descarta la multicolinealidad; el ajuste puede ser excelente aunque los coeficientes sean inservibles para interpretar.

## A fondo

Otra forma de detectar multicolinealidad es analizar los **valores propios** de la matriz de las variables predictoras: si alguno es muy pequeño, indica que existe una combinación casi exacta entre varias variables, aunque no se vea con claridad en la matriz de correlación por pares. Esta señal es especialmente útil cuando la multicolinealidad involucra a tres o más variables a la vez, un caso que el VIF sí captura pero que una matriz de correlación de pares puede pasar por alto.

## Autoevaluación

### En el interactivo, al cambiar un solo dato de $X_2$, $R^2$ pasa de $0{,}9995$ a $0{,}9993$ mientras que $\beta_1$ y $\beta_2$ cambian de forma notable. ¿Qué indica esto?
- [ ] Que el modelo tiene un error grave y no se debería usar.
- [x] Que hay multicolinealidad: la predicción conjunta es estable, pero los coeficientes individuales no lo son.
- [ ] Que $X_1$ y $X_2$ no están relacionadas con $Y$.
> Por qué: un $R^2$ estable junto a coeficientes muy sensibles a pequeños cambios en los datos es la firma característica de la multicolinealidad: el modelo predice bien, pero no puede repartir con fiabilidad el mérito entre variables redundantes.

### Calculas el VIF de una variable y obtienes 110. ¿Qué significa ese valor?
- [ ] Que la variable no está relacionada en absoluto con las demás predictoras.
- [x] Que existe una multicolinealidad muy severa: la varianza del coeficiente de esa variable está muy inflada por su relación con otras.
- [ ] Que el modelo tiene un $R^2$ de 110, lo cual sería imposible.
> Por qué: un VIF muy por encima de 10 (aquí 110) señala que gran parte de la variabilidad de esa variable ya está explicada por las demás predictoras, típico de variables casi redundantes.

### Tienes tres variables predictoras y, al revisar la matriz de correlación, ningún par supera una correlación de 0,5. ¿Puedes descartar la multicolinealidad?
- [ ] Sí, si ningún par está correlacionado, no puede haber multicolinealidad.
- [x] No necesariamente: podría existir una combinación de las tres variables que sea casi redundante, algo que el VIF detecta y la matriz de pares no.
- [ ] No, la matriz de correlación nunca sirve para detectar multicolinealidad.
> Por qué: la multicolinealidad puede involucrar a tres o más variables a la vez sin que ningún par por separado muestre una correlación alta; por eso el VIF, y no solo la matriz de correlación, es la herramienta recomendada.

### Necesitas mantener todas tus variables predictoras en el modelo, incluso las correlacionadas, porque todas tienen valor de negocio. ¿Qué técnica trata la multicolinealidad sin eliminar ninguna variable?
- [ ] Eliminar la variable con mayor VIF.
- [x] Aplicar regularización (Ridge o Lasso), que penaliza los coeficientes grandes y estabiliza el modelo sin descartar variables por completo.
- [ ] Ignorar el problema, ya que no tiene solución si no se eliminan variables.
> Por qué: Ridge reduce el tamaño de todos los coeficientes sin anularlos, y Lasso puede anular algunos; ambos mitigan la inestabilidad sin obligar a eliminar variables manualmente de antemano.

## Glosario

- **Factor de inflación de la varianza (VIF)**: medida que indica cuánto aumenta la varianza del coeficiente de una variable debido a su correlación con otras variables predictoras.
