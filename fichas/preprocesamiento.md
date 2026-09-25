---
id: preprocesamiento
estado: borrador
---

## En una frase

El preprocesamiento limpia, codifica y escala los datos en bruto para que un modelo pueda aprender de ellos, siempre ajustando cada transformación solo con los datos de entrenamiento.

## Intuición

Antes de meter un plato al horno, lavas y troceas los ingredientes: nadie cocina una verdura sin lavarla ni corta una pieza entera si la receta pide dados. El preprocesamiento hace eso mismo con los datos: los limpia de errores, convierte las categorías en números y ajusta las escalas para que el modelo pueda "cocinarlos" correctamente.

Pero hay una regla que no tiene equivalente en la cocina y que aquí importa muchísimo: todo lo que decidas en el preprocesamiento —qué media usar para rellenar un hueco, qué mínimo y máximo usar para escalar— debe calcularse solo con los datos de entrenamiento, nunca con los que usarás para evaluar el modelo. Es como estudiar para un examen con el libro de texto, no con las respuestas del examen: si te asomas a la nota final antes de tiempo, tu preparación deja de ser honesta y el resultado del examen deja de significar lo que crees.

## Explicación

### Las piezas del preprocesamiento

El preprocesamiento cubre varias tareas, cada una con su propia ficha. La **limpieza** trata los [[outliers|valores atípicos]] y los [[valores-ausentes|valores ausentes]]. La **transformación** ajusta la escala de las variables ([[escalado]]) y convierte las categóricas en números ([[codificacion-categoricas]]). Cuando hay demasiadas variables o algunas muy correlacionadas entre sí, la [[reduccion-dimensionalidad|reducción de dimensionalidad]] o eliminar predictoras redundantes por [[multicolinealidad]] simplifican el conjunto de datos. Y cuando las clases de la variable objetivo están muy desequilibradas, se recurre a sobremuestrear la clase minoritaria, submuestrear la mayoritaria o generar ejemplos sintéticos, para que el modelo no ignore la clase menos frecuente.

Ninguna de estas técnicas actúa de forma aislada: el orden en que se aplican, y sobre todo cuándo se calculan sus parámetros, es tan importante como la técnica en sí.

### La regla de oro: ajustar solo con entrenamiento

Antes de aplicar cualquier transformación que dependa de estadísticos del conjunto de datos —la media para imputar, el mínimo y el máximo para escalar, las categorías vistas para codificar—, primero divide los datos en entrenamiento, validación y prueba (ver [[validacion]]). Calcula esos estadísticos **solo con el conjunto de entrenamiento** y aplica la misma transformación, con los mismos valores, a validación y prueba.

Si en cambio calculas la media o la escala usando todo el conjunto de datos —incluido lo que luego usarás para evaluar— cometes **fuga de datos** (*data leakage*): información del conjunto de prueba se filtra en el entrenamiento, aunque sea de forma indirecta. El modelo no ve esos valores directamente, pero sus transformaciones sí están influidas por ellos, lo que hace que la validación parezca mejor de lo que será en producción, con datos genuinamente nuevos.

## Formalización

No aplica: el preprocesamiento es una secuencia de decisiones, no una fórmula única. Cada técnica se formaliza en su propia ficha: [[escalado]], [[outliers]], [[valores-ausentes]], [[multicolinealidad]].

## Interactivo

```widget
motor: pasos
---
### Un pipeline con seis datos

Tienes seis valores de una variable, ya repartidos en entrenamiento y prueba.

| Dato | 10 | 20 | 30 | 40 | 50 | 200 |
|---|---|---|---|---|---|---|
| Conjunto | train | train | train | train | test | test |
---
**Orden incorrecto: escalar con todos los datos y dividir después**

Si calculas la media y la desviación típica con los 6 valores (train + test): $\mu = 58{,}33$, $\sigma = 64{,}66$.

Con esos parámetros, el conjunto de entrenamiento estandarizado queda: $-0{,}75$, $-0{,}59$, $-0{,}44$, $-0{,}28$. Los cuatro valores quedan comprimidos y muy parecidos entre sí, porque el 200 del conjunto de prueba ha inflado la desviación típica que usa el entrenamiento.
---
**Orden correcto: dividir primero, escalar solo con entrenamiento**

Calculando la media y la desviación típica solo con los 4 valores de entrenamiento: $\mu = 25$, $\sigma = 11{,}18$.

El conjunto de entrenamiento estandarizado ahora es: $-1{,}34$, $-0{,}45$, $0{,}45$, $1{,}34$. Los mismos $\mu$ y $\sigma$ (25 y 11,18) se aplican después al conjunto de prueba, sin recalcularlos.
---
**Conclusión**

En el orden incorrecto, el modelo entrena con una versión de los datos "contaminada" por información del conjunto de prueba: es **fuga de datos**. El modelo puede parecer mejor en la validación de lo que realmente será con datos nuevos, porque esa validación ya no es honesta.
```

- Prueba a comparar los dos conjuntos de entrenamiento estandarizados (con fuga y sin ella): fíjate en cómo cambia la dispersión entre los cuatro valores.
- Prueba a imaginar que el valor 200 fuera un error de registro en el conjunto de prueba: ¿en qué escenario, con o sin fuga, ese error afectaría también al entrenamiento?
- Prueba a pensar en qué otras transformaciones del preprocesamiento —imputar con la media, codificar categorías— sufrirían el mismo problema si se calculan antes de dividir los datos.

## Errores típicos

- **Error**: escalar o imputar con estadísticos de todo el conjunto de datos antes de dividir en entrenamiento y prueba. → **Correcto**: divide primero y calcula esos estadísticos solo con el conjunto de entrenamiento.
- **Error**: pensar que el preprocesamiento y el EDA son la misma etapa. → **Correcto**: el [[eda|EDA]] explora sin modificar los datos; el preprocesamiento es quien los transforma.
- **Error**: aplicar una técnica de limpieza o codificación distinta a entrenamiento y a prueba, por ejemplo imputar cada uno con su propia media. → **Correcto**: usa siempre los mismos parámetros, ajustados una sola vez con entrenamiento.
- **Error**: tratar el orden de las técnicas como si diera igual. → **Correcto**: el orden —limpieza, división, ajuste de las transformaciones, aplicación— determina si hay fuga de datos.

## En resumen

- **Qué hace**: transforma los datos en bruto —limpieza, codificación, escalado, reducción de dimensionalidad— en el formato que necesita un modelo.
- **Cómo funciona**: 1) limpia (valores atípicos, ausentes); 2) divide en entrenamiento/validación/prueba; 3) ajusta cada transformación solo con entrenamiento; 4) aplica esos mismos parámetros al resto.
- **Regla clave**: ningún estadístico usado para transformar (media, mínimo, máximo, categorías vistas) puede calcularse con datos de validación o prueba.
- **Cuándo usarlo**: siempre, entre el EDA y el entrenamiento del modelo.
- **Decisión que importa**: el orden de los pasos, sobre todo cuándo divides los datos respecto a cuándo ajustas las transformaciones.
- **Trampa principal**: la fuga de datos (*data leakage*), que hace que la validación parezca mejor de lo que el modelo será en producción.

## A fondo

Una forma práctica de evitar la fuga de datos por accidente es encadenar las transformaciones en un **pipeline**, como la clase `Pipeline` de scikit-learn: al llamar a `fit` sobre el conjunto de entrenamiento, cada paso (imputación, escalado, codificación) ajusta sus parámetros solo con esos datos, y `transform` aplica exactamente los mismos parámetros al resto. Esto es especialmente importante en la [[validacion|validación cruzada]], donde cada partición debe tratarse como su propio entrenamiento: si escalas antes de dividir en *folds*, cada partición se beneficia de información de las demás.

## Autoevaluación

### Un compañero calcula la media y la desviación típica con el 100 % de los datos y después divide en entrenamiento y prueba. ¿Qué problema tiene ese orden?
- [ ] Ninguno, el resultado final es el mismo que dividiendo antes.
- [x] Fuga de datos: la escala de entrenamiento queda influida por información del conjunto de prueba.
- [ ] Solo es un problema si el conjunto de datos es muy grande.
> Por qué: al calcular la media y la desviación típica con los datos de prueba incluidos, el conjunto de entrenamiento ya no se transforma de forma independiente; la validación posterior deja de ser honesta.

### ¿Qué es exactamente la fuga de datos (*data leakage*)?
- [ ] Cuando se pierden filas del conjunto de datos durante el preprocesamiento.
- [x] Cuando información del conjunto de validación o prueba influye, directa o indirectamente, en cómo se entrena el modelo.
- [ ] Cuando el modelo tarda demasiado en entrenar.
> Por qué: la fuga de datos no es perder información, sino filtrar información que no debería estar disponible durante el entrenamiento, aunque sea a través de un estadístico como la media o el máximo.

### ¿Por qué encadenar las transformaciones en un `Pipeline` de scikit-learn ayuda a evitar la fuga de datos?
- [ ] Porque entrena el modelo más rápido.
- [x] Porque cada paso ajusta sus parámetros solo con los datos que recibe en `fit`, y aplica esos mismos parámetros con `transform`, sin volver a calcularlos.
- [ ] Porque elimina automáticamente los valores atípicos.
> Por qué: un `Pipeline` no cambia lo que hace cada técnica, pero obliga a que el ajuste ocurra una sola vez, con los datos correctos, evitando el error de recalcular estadísticos con datos que deberían quedar fuera.

### ¿En qué se diferencia el preprocesamiento del análisis exploratorio de datos (EDA)?
- [ ] El EDA se hace después del preprocesamiento, para comprobar el resultado.
- [x] El EDA observa y genera hipótesis sin modificar los datos; el preprocesamiento aplica las transformaciones que el EDA sugirió.
- [ ] Son la misma etapa, solo cambia el nombre según el tipo de proyecto.
> Por qué: el EDA es diagnóstico, no cambia nada; el preprocesamiento es la etapa que sí transforma los datos, guiada por lo que el EDA encontró.

## Glosario

- **Fuga de datos** (*data leakage*): cuando información del conjunto de validación o prueba influye, directa o indirectamente, en el entrenamiento del modelo, haciendo que la validación deje de ser honesta.
- **Pipeline**: secuencia de pasos de preprocesamiento y modelado encadenados, donde cada paso ajusta sus parámetros una sola vez y los aplica de forma consistente.
