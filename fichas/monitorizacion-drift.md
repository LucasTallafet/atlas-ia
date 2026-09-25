---
id: monitorizacion-drift
estado: borrador
---

## En una frase

La monitorización vigila si un modelo desplegado sigue acertando y si los datos que recibe han cambiado, para decidir cuándo hay que reentrenarlo.

## Intuición

Piensa en un médico que te diagnosticó perfectamente hace cinco años, basándose en tu historial de entonces. Si nunca vuelve a examinarte, seguirá dando consejos válidos para el "tú" de hace cinco años, no para el de ahora: tu cuerpo, tus hábitos y tu entorno han cambiado. Un modelo de machine learning tiene el mismo problema: se entrenó con una foto fija del mundo, pero el mundo sigue moviéndose. Los clientes cambian de gustos, las tácticas de fraude evolucionan, una pandemia altera de golpe los patrones de compra. Sin revisiones periódicas —como las del médico—, un modelo que fue excelente el día de su despliegue puede volverse mediocre o directamente peligroso meses después, sin que nadie se dé cuenta hasta que el daño ya está hecho.

## Explicación

### Por qué un modelo se degrada solo con el paso del tiempo

Tras el [[despliegue]], el modelo entrenado recibe datos de producción que ya no son exactamente los datos de entrenamiento. Cuando la **distribución de los datos de entrada** cambia con el tiempo se habla de ***drift* de datos**; cuando lo que cambia es la **relación entre las entradas y la salida real** (la propia función que el modelo intenta aprender), se habla de ***drift* de concepto**. La diferencia importa: los datos de entrada pueden verse igual y aun así el fenómeno subyacente haber cambiado, o al revés, los datos pueden desplazarse sin que la relación con la salida se altere. En ambos casos, la consecuencia es la misma: la precisión del modelo se degrada sin que el modelo en sí haya cambiado.

### Qué vigilar

El monitoreo se apoya en varios frentes a la vez: el **desempeño del modelo** (exactitud, recall, F1, MSE o AUC-ROC, medidos en intervalos regulares), la **deriva de los datos de entrada**, la **disponibilidad y latencia** del servicio, y el **registro de versiones** de datos, modelo y cambios, imprescindible tanto para depurar problemas como para cumplir auditorías.

### Cuándo y cómo reentrenar

Cuando el rendimiento cae, toca **reentrenar** con datos actualizados. Esto puede automatizarse mediante *pipelines* de machine learning que reentrenan sin intervención humana, o hacerse de forma manual cuando el proceso lo requiere. No toda caída de rendimiento exige un reentrenamiento completo: a veces basta con ajustar hiperparámetros o incorporar datos recientes de forma incremental.

## Formalización

El material de curso no da fórmulas para detectar drift, solo el concepto. La más usada en la práctica es la siguiente.

:::ampliacion
**Índice de estabilidad poblacional (PSI, *Population Stability Index*).** Compara la distribución de una variable en entrenamiento frente a producción, dividida en $k$ intervalos:

$$PSI = \sum_{i=1}^{k} (p_i - q_i) \cdot \ln\left(\frac{p_i}{q_i}\right)$$

donde:
- $p_i$: proporción de observaciones en el intervalo $i$ en producción.
- $q_i$: proporción de observaciones en el intervalo $i$ en entrenamiento.
- $k$: número de intervalos en que se divide la variable.

Regla práctica habitual: $PSI<0{,}1$ indica estabilidad, $0{,}1\le PSI<0{,}25$ un cambio moderado y $PSI\ge0{,}25$ un cambio importante que suele disparar una alerta.

**Ejemplo numérico.** Una variable dividida en 3 intervalos: en entrenamiento $q=(0{,}50,\ 0{,}30,\ 0{,}20)$; en producción $p=(0{,}30,\ 0{,}30,\ 0{,}40)$:

$$PSI = (0{,}30-0{,}50)\ln\frac{0{,}30}{0{,}50} + (0{,}30-0{,}30)\ln\frac{0{,}30}{0{,}30} + (0{,}40-0{,}20)\ln\frac{0{,}40}{0{,}20} \approx 0{,}102+0{,}000+0{,}139=0{,}241$$

Con $PSI\approx0{,}241$, muy cerca del umbral de $0{,}25$, el sistema lanzaría una alerta de cambio moderado-alto: la variable se ha desplazado hacia valores más altos en producción.

Fuente: documentación de Evidently AI sobre el Population Stability Index.
:::

:::ampliacion
Otra alternativa habitual es el **test de Kolmogorov-Smirnov (KS)**, que compara las funciones de distribución acumulada empíricas de entrenamiento ($F_q$) y producción ($F_p$) con el estadístico $KS=\sup_x |F_p(x)-F_q(x)|$: la mayor distancia vertical entre ambas curvas. Cuanto mayor el valor, más ha cambiado la distribución.
Fuente: Gama, J. et al. (2014), "A Survey on Concept Drift Adaptation".
:::

## Interactivo

```widget
motor: serie
modo: "drift"
serie: {"generador": "tendencia", "n": 120, "ruido": 0.15, "semilla": 7}
ventana: 20
```

Prueba a…
1. Prueba a mover la ventana deslizante a lo largo de la serie y observa en qué tramo la distribución de producción empieza a separarse de la de entrenamiento.
2. Prueba a comparar el tramo inicial con el tramo final: ¿en qué momento activarías una alerta si el umbral fuera $PSI\ge0{,}25$?
3. Prueba a imaginar que la serie representa el importe medio de una compra: ¿qué decisión de negocio tomarías al ver esa deriva?

## En código

```python
import numpy as np

q = np.array([0.50, 0.30, 0.20])
p = np.array([0.30, 0.30, 0.40])

psi = np.sum((p - q) * np.log(p / q))
print(round(psi, 3))
# 0.241
```

## Errores típicos

- **Error**: confundir *data drift* con *concept drift* → **Correcto**: el primero es que cambian los datos de entrada; el segundo, que cambia la relación entre esos datos y el resultado real, aunque los datos de entrada parezcan iguales.
- **Error**: pensar que cualquier variación en la distribución de los datos exige reentrenar de inmediato → **Correcto**: hay que fijar un umbral (como $PSI\ge0{,}25$) porque cierta variación es ruido normal; reentrenar sin necesidad cuesta tiempo y puede introducir inestabilidad.
- **Error**: monitorizar solo la exactitud del modelo y no los datos de entrada → **Correcto**: la exactitud puede tardar en reflejar un problema si aún no hay etiquetas reales disponibles; vigilar la distribución de entrada permite detectar el drift antes.
- **Error**: reentrenar sin llevar un registro de versiones de datos y modelo → **Correcto**: sin trazabilidad es imposible saber qué cambió, auditar decisiones pasadas o revertir a una versión anterior si el reentrenamiento empeora las cosas.

## En resumen

- La monitorización comprueba que un modelo desplegado sigue funcionando bien y detecta cuándo los datos o la relación datos-resultado han cambiado (*drift*).
- *Data drift*: cambian los datos de entrada. *Concept drift*: cambia la relación entre entrada y salida real. No son lo mismo.
- Se vigila el desempeño (exactitud, recall, F1, MSE, AUC), la deriva de los datos, la disponibilidad/latencia y el registro de versiones.
- Métrica típica para drift de datos: $PSI=\sum(p_i-q_i)\ln(p_i/q_i)$; $PSI\ge0{,}25$ suele marcar un cambio importante.
- Se usa siempre después del despliegue, de forma continua, no como un chequeo puntual.
- Decisiones clave: qué métricas vigilar, con qué frecuencia, y qué umbral dispara una alerta o un reentrenamiento.
- La trampa principal: esperar a que la exactitud caiga de forma evidente en vez de vigilar la deriva de los datos, que suele anticipar el problema.

## A fondo

Los modelos de IA necesitan actualizarse de forma continua para no quedar obsoletos en entornos cambiantes: sin actualización, pierden precisión con el tiempo aunque nunca hayan cambiado por dentro.

**Caso: aprendizaje continuo en PayPal.** El fraude financiero evoluciona constantemente, y los sistemas de detección de fraude de PayPal no podían inicialmente seguir el ritmo de nuevas tácticas, lo que generó pérdidas por transacciones fraudulentas no detectadas. La solución fue un proceso de **aprendizaje continuo** que ajusta los modelos en tiempo real a medida que aparecen nuevos patrones de fraude, en vez de esperar a un reentrenamiento periódico fijo.

## Autoevaluación

### Un modelo de recomendación de contenidos empieza a fallar porque los usuarios cambiaron sus gustos, aunque el propio catálogo de contenidos y el tipo de usuario que llega no han variado. ¿Qué fenómeno describe mejor esta situación?
- [ ] Data drift, porque los datos de entrada cambiaron
- [x] Concept drift, porque cambió la relación entre las características del usuario y lo que realmente le gusta
- [ ] Ninguno: si los datos de entrada no cambian, el modelo no puede degradarse
> Por qué: los datos de entrada (perfil del usuario) son los mismos, pero la función real que relaciona ese perfil con sus preferencias ha cambiado; eso es concept drift, no data drift.

### Calculas un PSI de $0{,}05$ entre entrenamiento y producción para una variable. ¿Qué deberías hacer?
- [ ] Reentrenar el modelo de inmediato, cualquier PSI distinto de cero indica un problema
- [x] No actuar todavía: un PSI tan bajo indica que la distribución es prácticamente estable
- [ ] Ignorar el PSI y fijarte solo en la exactitud del modelo
> Por qué: valores de PSI por debajo de $0{,}1$ se consideran estabilidad; reentrenar en ese punto sería una reacción desproporcionada a ruido normal.

### ¿Por qué vigilar la distribución de los datos de entrada, y no solo la exactitud del modelo, ayuda a anticipar problemas?
- [ ] Porque la exactitud nunca refleja problemas reales del modelo
- [x] Porque a veces no hay etiquetas reales disponibles todavía, y un cambio en los datos de entrada puede avisar del problema antes de que la exactitud llegue a caer de forma medible
- [ ] Porque la distribución de los datos de entrada es más fácil de calcular que cualquier métrica
> Por qué: en muchos sistemas la etiqueta real (por ejemplo, si una transacción era fraude) tarda en confirmarse; el drift de los datos de entrada es una señal disponible antes y sirve de alerta temprana.

### Un equipo reentrena su modelo cada vez que detecta la más mínima variación en los datos de producción, varias veces por semana. ¿Qué riesgo tiene esta práctica?
- [ ] Ninguno: cuanto más se reentrena, mejor funciona siempre el modelo
- [x] Reaccionar a variaciones que son ruido normal, gastando recursos e introduciendo inestabilidad sin una mejora real
- [ ] El modelo dejará de poder desplegarse en producción
> Por qué: sin un umbral razonable (como el que da el PSI), se confunde variación aleatoria con drift real, lo que lleva a reentrenar sin necesidad.

## Glosario

- **Drift de datos (*data drift*)**: cambio en la distribución de las variables de entrada de un modelo ya desplegado, sin que cambie necesariamente la relación con la salida.
- **Drift de concepto (*concept drift*)**: cambio en la relación real entre las variables de entrada y la salida que el modelo intenta predecir.
- **PSI (*Population Stability Index*)**: métrica que compara la distribución de una variable en entrenamiento y en producción para detectar drift de datos.
