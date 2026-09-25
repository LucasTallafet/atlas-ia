---
id: desbalanceo
estado: borrador
---

## En una frase

Cuando una clase es mucho más frecuente que otra, el modelo aprende casi solo la clase mayoritaria y falla en detectar la minoritaria, aunque su exactitud global parezca alta.

## Intuición

Imagina un examen de verdadero/falso en el que el 95% de las respuestas correctas son "falso". Un alumno que responda "falso" a todo, sin haber estudiado nada, acertaría el 95% de las preguntas. Esa nota alta no dice nada sobre si sabe distinguir los casos "verdadero", que es precisamente lo que el examen quería medir.

A un modelo de clasificación entrenado con clases desbalanceadas —fraudes entre transacciones normales, enfermedades raras entre pacientes sanos— le pasa lo mismo: puede lograr una exactitud altísima con la estrategia perezosa de predecir siempre la clase mayoritaria, mientras ignora por completo la clase que de verdad interesa detectar.

## Explicación

### Por qué la exactitud engaña aquí

Con 1.000 transacciones, 950 normales y 50 fraudulentas, un modelo sin ningún tratamiento del desbalanceo podría producir esta matriz de confusión: 930 verdaderos negativos, 20 falsos positivos, 45 falsos negativos y solo 5 verdaderos positivos. Como recoge [[metricas-clasificacion]], eso da una exactitud del $93{,}5\%$, pero una precisión de solo $0{,}20$ y un recall de $0{,}10$ para la clase "fraude" ($F1 \approx 0{,}13$): el modelo detecta apenas 5 de los 50 fraudes reales. La exactitud es alta simplemente porque acierta casi siempre en la clase mayoritaria, no porque distinga bien la minoritaria.

### Submuestreo y sobremuestreo

El **submuestreo** reduce el tamaño de la clase mayoritaria hasta acercarlo al de la minoritaria, descartando observaciones al azar. Evita el sesgo hacia la clase mayoritaria, pero arriesga perder información si las observaciones descartadas contenían patrones relevantes; conviene solo cuando la clase mayoritaria tiene datos de sobra.

El **sobremuestreo** hace lo contrario: aumenta la clase minoritaria sin tocar la mayoritaria. La forma más simple es duplicar observaciones existentes, lo que equilibra el dataset pero puede hacer que el modelo "memorice" esos ejemplos repetidos en vez de generalizar. El **sobremuestreo aleatorio** selecciona con reemplazo, lo que introduce algo más de variedad, aunque conserva el riesgo de sobreajuste en datasets pequeños.

### SMOTE: generar ejemplos nuevos en vez de repetir

**SMOTE** (*Synthetic Minority Over-sampling Technique*) evita duplicar observaciones creando **ejemplos sintéticos**: para cada nuevo punto, interpola entre una observación real de la clase minoritaria y uno de sus vecinos más cercanos, generando variabilidad sin copiar datos exactos (ver Formalización). Existen variantes: **Borderline-SMOTE** genera datos sintéticos cerca de las fronteras de decisión entre clases, donde el modelo tiene más dificultad para distinguirlas, y **ADASYN** prioriza generar más ejemplos donde la clase minoritaria es más difícil de separar de la mayoritaria.

### Pesos de clase y métodos basados en costes

En vez de tocar el conjunto de datos, los **métodos basados en costes** ajustan el propio modelo: asignan un **peso mayor a la clase minoritaria** en la función de pérdida, de modo que cada error en esa clase penaliza más. Es útil cuando generar datos sintéticos no es viable o el tamaño del dataset debe mantenerse fijo, y no elimina ni duplica ninguna observación.

### Qué técnica elegir

No hay una técnica universalmente mejor: el submuestreo conviene con datasets grandes donde sobran datos de la clase mayoritaria; el sobremuestreo y SMOTE, cuando la clase minoritaria tiene pocos datos y no se puede permitir perder los de la mayoritaria; y los pesos de clase, cuando se prefiere no alterar el conjunto de datos en absoluto. En problemas donde los errores en la clase minoritaria son especialmente graves —fraude, diagnóstico médico—, suele preferirse una combinación de estas técnicas junto con métricas como recall o F1 en vez de la exactitud para evaluar el resultado.

## Formalización

$$
\mathbf{x}_{\text{nuevo}} = \mathbf{x}_i + \lambda \left( \mathbf{x}_{zi} - \mathbf{x}_i \right)
$$

donde:

- $\mathbf{x}_i$ es una observación real de la clase minoritaria.
- $\mathbf{x}_{zi}$ es uno de sus vecinos más cercanos, también de la clase minoritaria.
- $\lambda$ es un número aleatorio entre $0$ y $1$ que determina en qué punto del segmento entre $\mathbf{x}_i$ y $\mathbf{x}_{zi}$ se genera el nuevo ejemplo sintético.
- $\mathbf{x}_{\text{nuevo}}$ es la observación sintética creada, que queda en algún punto intermedio entre las dos observaciones reales.

## Interactivo

```widget
motor: umbral
modo: desbalanceo
positivos: {"n": 50, "media": 0.6, "desv": 0.18}
negativos: {"n": 950, "media": 0.35, "desv": 0.18}
metricas: ["accuracy", "precision", "recall", "f1"]
```

- Prueba a fijarte en la accuracy con el umbral por defecto: aunque parezca alta, mira qué le pasa al recall de la clase minoritaria.
- Prueba a bajar el umbral hasta que el recall suba cerca de 1: observa cuánto cae la precisión a cambio.
- Prueba a comparar la curva de precisión-recall con lo que esperarías ver en una curva ROC: ¿por qué crees que aquí se prioriza la primera cuando las clases están tan desbalanceadas?

## Errores típicos

- **Error**: evaluar un modelo con clases desbalanceadas usando solo la exactitud. → **Correcto**: la exactitud puede ser muy alta aunque el modelo casi nunca detecte la clase minoritaria; usa [[metricas-clasificacion|precisión, recall o F1]] para esa clase en concreto.
- **Error**: aplicar submuestreo cuando el dataset ya es pequeño. → **Correcto**: eliminar observaciones de la clase mayoritaria en un dataset pequeño puede dejar muy pocos datos para que el modelo generalice bien; en ese caso, sobremuestreo, SMOTE o pesos de clase son más apropiados.
- **Error**: duplicar observaciones de la clase minoritaria sin ninguna variabilidad y esperar que el modelo generalice igual que con datos reales nuevos. → **Correcto**: la duplicación exacta favorece que el modelo memorice esos ejemplos; SMOTE reduce ese riesgo generando variantes sintéticas en vez de copias.
- **Error**: aplicar SMOTE antes de separar entrenamiento y prueba. → **Correcto**: generar ejemplos sintéticos usando información que incluya la partición de prueba filtra información indebidamente; el remuestreo debe ajustarse solo con el conjunto de entrenamiento.

## En resumen

- **Qué hace**: describe el problema de clases muy desiguales en clasificación y las técnicas para tratarlo.
- **Técnicas principales**: submuestreo (reduce la clase mayoritaria), sobremuestreo y SMOTE (aumentan la clase minoritaria, real o sintéticamente), pesos de clase (penalizan más los errores en la minoritaria sin tocar los datos).
- **Fórmula clave**: SMOTE genera cada ejemplo sintético interpolando entre un punto minoritario y un vecino cercano, $\mathbf{x}_i + \lambda(\mathbf{x}_{zi}-\mathbf{x}_i)$.
- **Cuándo usarlo**: siempre que una clase de interés esté muy subrepresentada, como en detección de fraude o diagnóstico de enfermedades raras.
- **Decisión que importa**: submuestreo si sobran datos de la clase mayoritaria; sobremuestreo/SMOTE o pesos de clase si la clase minoritaria es escasa y no se puede perder información de la mayoritaria.
- **Trampa principal**: fiarse de la exactitud como métrica de éxito cuando las clases están desbalanceadas, en vez de mirar el rendimiento específico sobre la clase minoritaria.

## A fondo

El desbalanceo también condiciona cómo se interpreta la [[metricas-clasificacion|curva ROC]]: con una clase minoritaria muy pequeña, la tasa de falsos positivos puede parecer baja aunque el número absoluto de falsos positivos sea alto en relación con los pocos positivos reales, distorsionando la lectura visual de la curva. Por eso en problemas muy desbalanceados suele preferirse la curva de precisión-recall, que se centra en el comportamiento sobre la clase positiva minoritaria en vez de mezclarla con el volumen, mucho mayor, de la clase negativa.

Las variantes de SMOTE existen porque no todos los puntos de la clase minoritaria son igual de "difíciles" para el modelo: Borderline-SMOTE concentra el esfuerzo en generar ejemplos cerca de la frontera con la clase mayoritaria, que es donde más se equivocan los clasificadores, mientras que ADASYN adapta automáticamente cuántos ejemplos sintéticos generar en cada zona según lo difícil que resulte separarla de la clase mayoritaria, en vez de repartir las nuevas observaciones de manera uniforme por todo el espacio de la clase minoritaria.

## Autoevaluación

### Un modelo de detección de fraude tiene 93,5% de exactitud pero solo detecta 5 de 50 fraudes reales. ¿Qué está pasando?
- [ ] El modelo es excelente: una exactitud del 93,5% es un resultado muy bueno.
- [x] Las clases están desbalanceadas y la exactitud está inflada por acertar casi siempre en la clase mayoritaria (transacciones normales), mientras falla en detectar la clase de interés (fraude).
- [ ] El modelo tiene un error de programación, porque una exactitud alta debería implicar también un recall alto.
> Por qué: con solo 50 fraudes frente a 950 transacciones normales, predecir casi siempre "no fraude" ya da una exactitud alta; el recall bajo (0,10) revela el verdadero problema, que la exactitud por sí sola oculta.

### Tienes un dataset de 1 millón de transacciones normales y solo 200 fraudulentas. ¿Qué técnica sería más razonable como primera opción?
- [ ] Submuestreo agresivo de la clase mayoritaria hasta dejar solo 200 transacciones normales.
- [x] Sobremuestreo o SMOTE sobre la clase minoritaria, o pesos de clase, para no perder la enorme cantidad de información de la clase mayoritaria.
- [ ] No aplicar ninguna técnica, porque con 1 millón de datos el desbalanceo deja de ser un problema.
> Por qué: con tan pocos fraudes, no tiene sentido descartar casi todos los datos normales; conviene aumentar la representación de la clase minoritaria o penalizar más sus errores en lugar de sacrificar la mayoritaria.

### ¿Qué diferencia principal hay entre duplicar observaciones de la clase minoritaria y aplicar SMOTE?
- [ ] Ninguna: ambas técnicas producen exactamente los mismos datos.
- [x] La duplicación repite ejemplos exactos, con riesgo de que el modelo los memorice; SMOTE genera ejemplos sintéticos nuevos interpolando entre observaciones reales, introduciendo variabilidad.
- [ ] SMOTE reduce el número de observaciones de la clase mayoritaria, mientras que la duplicación no toca ninguna clase.
> Por qué: al no copiar datos exactos, SMOTE reduce el riesgo de que el modelo "memorice" en lugar de generalizar, un problema más frecuente con la duplicación directa.

### Necesitas mantener el tamaño exacto de tu conjunto de datos y no puedes generar observaciones sintéticas. ¿Qué técnica encaja mejor?
- [ ] Submuestreo de la clase mayoritaria.
- [x] Pesos de clase, que ajustan la función de pérdida para penalizar más los errores en la clase minoritaria sin añadir ni quitar ninguna observación.
- [ ] SMOTE, porque genera ejemplos sintéticos sin cambiar el tamaño total del dataset.
> Por qué: los pesos de clase actúan sobre el entrenamiento del modelo, no sobre el conjunto de datos, por lo que no cambian su tamaño ni requieren generar datos nuevos.

## Glosario

- **Submuestreo**: reducción del número de observaciones de la clase mayoritaria para acercarla al tamaño de la minoritaria.
- **Sobremuestreo**: aumento del número de observaciones de la clase minoritaria, duplicando o generando ejemplos nuevos.
- **SMOTE**: técnica de sobremuestreo que genera ejemplos sintéticos interpolando entre una observación minoritaria y sus vecinos más cercanos.
- **Pesos de clase**: ajuste de la función de pérdida para dar más importancia a los errores cometidos en la clase minoritaria.
