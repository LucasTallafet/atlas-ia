---
id: flujo-dl-por-dato
estado: borrador
---

## En una frase

El tipo de dato de entrada —tabular, imagen o serie temporal— determina cómo se preprocesa, qué arquitectura conviene y con qué métrica se mide el éxito de un proyecto de deep learning.

## Intuición

No cocinas un pescado igual que una verdura, aunque ambos acaben en el mismo horno. En deep learning pasa lo mismo: el [[ciclo-proyecto-ml]] general —definir el problema, preparar los datos, entrenar, evaluar— es siempre el mismo esqueleto, pero cada tipo de dato exige su propia receta dentro de cada etapa. Tratar una imagen como si fuera una fila de una hoja de cálculo, o una serie temporal como si sus filas fueran independientes entre sí, no produce un error de compilación: produce un modelo que entrena sin quejarse y rinde mal, porque nunca tuvo la información en la forma que necesitaba.

## Explicación

### Qué cambia según el tipo de dato

- **Datos tabulares** (filas y columnas, como un CSV de clientes): el preprocesamiento es sobre todo escalado numérico y codificación de categorías ([[codificacion-categoricas]]), y la arquitectura típica es un MLP ([[mlp]]), construido con las herramientas de [[keras-tensorflow]].
- **Imágenes**: hace falta redimensionar todas las imágenes a un tamaño común y normalizar los píxeles (habitualmente de `[0,255]` a `[0,1]`). Es también donde más rinde el **aumento de datos** (*data augmentation*): generar variantes con rotaciones, recortes o cambios de brillo para que el modelo no memorice detalles irrelevantes de las fotos de entrenamiento.
- **Series temporales**: los datos no son filas independientes, sino una secuencia; hace falta ventanear la señal para convertirla en pares de entrada/salida, como ya viste en [[series-temporales]], antes de que una arquitectura pueda consumirla.

### Cómo elegir la arquitectura

La arquitectura recomendada depende directamente del tipo de dato:

| Tipo de dato | Arquitectura habitual | Ejemplo de aplicación |
|---|---|---|
| Tabular | MLP (red densa) | Predicción de ventas o de fuga de clientes |
| Imágenes | CNN (red convolucional) | Clasificación de objetos, visión artificial |
| Series temporales | RNN, LSTM, GRU | Previsión financiera, sensores IoT |
| Detección de patrones sin etiquetas | Autoencoders, GAN | Detección de fraude, generación de imágenes |

Conviene resistirse a saltar directamente a la arquitectura más sofisticada: un modelo más simple que encaje con el tipo de dato suele ser más fácil de entrenar, depurar e interpretar que uno complejo que no lo necesitaba.

### Cómo medir el éxito según el problema

La métrica que hay que vigilar durante el entrenamiento ([[entrenamiento-dl]]) y en la evaluación final tampoco es la misma para todos los problemas:

| Tipo de problema | Métrica principal | Alternativa |
|---|---|---|
| Clasificación | Exactitud (*accuracy*), F1 | AUC, curva precisión-recall |
| Regresión | MSE, MAE | R², RMSE |
| Series temporales | RMSE, MAE | Correlación de Pearson |

Si las clases están desbalanceadas, la exactitud puede ser engañosa: conviene usar F1 o AUC-ROC en su lugar, como se explica en [[desbalanceo]].

## Formalización

No aplica: es un mapa de decisiones prácticas (tipo de dato → preprocesamiento → arquitectura → métrica), no una relación matemática.

## Errores típicos

- **Error**: aplicar el mismo preprocesamiento a cualquier tipo de dato, por ejemplo un one-hot a una imagen. → **Correcto**: cada tipo de dato exige su propio tratamiento: redimensionado y escalado de píxeles en imágenes, ventaneo en series temporales, codificación de categorías en datos tabulares.
- **Error**: usar la exactitud como única métrica en un problema de clasificación desbalanceado. → **Correcto**: usar F1 o AUC-ROC, que no se inflan solo por acertar la clase mayoritaria.
- **Error**: pensar que una arquitectura más compleja (por ejemplo, una LSTM) siempre da mejor resultado. → **Correcto**: empezar por la arquitectura más simple que encaje con el tipo de dato, y subir de complejidad solo si el rendimiento lo justifica.
- **Error**: tratar las filas de una serie temporal como observaciones independientes, igual que en un problema tabular. → **Correcto**: una serie temporal necesita ventaneo para que el modelo vea el orden y el contexto temporal.

## En resumen

- **Qué hace:** conecta el tipo de dato de entrada con las decisiones concretas de preprocesamiento, arquitectura y métrica dentro del [[ciclo-proyecto-ml]] general.
- **Tabular → tabular:** escalado y codificación de categorías, arquitectura MLP, métricas de clasificación o regresión estándar.
- **Imágenes:** redimensionado, normalización de píxeles y aumento de datos; arquitectura CNN.
- **Series temporales:** ventaneo de la señal; arquitectura RNN/LSTM/GRU; métricas como RMSE o MAE.
- **Regla práctica:** empezar siempre por la arquitectura más simple que encaje con el tipo de dato, no por la más sofisticada disponible.
- **Trampa principal:** aplicar el preprocesamiento o la métrica de un tipo de dato a otro distinto, o ignorar el desbalanceo al elegir la métrica.

## Autoevaluación

### Tienes fotos de productos para clasificar en 5 categorías. ¿Qué combinación de preprocesamiento y arquitectura es más adecuada?
- [ ] Codificación one-hot de las categorías y un MLP.
- [x] Redimensionado y normalización de píxeles, y una CNN.
- [ ] Ventaneo de la señal y una LSTM.
> Por qué: las imágenes necesitan tamaño uniforme y píxeles normalizados, y la arquitectura que aprovecha su estructura espacial es la CNN.

### Un dataset de fraude tiene un 2% de casos positivos. ¿Por qué no conviene evaluar el modelo solo con exactitud?
- [ ] Porque la exactitud no está definida para clasificación binaria.
- [x] Porque un modelo que prediga siempre "no fraude" ya tendría un 98% de exactitud sin detectar ningún caso real.
- [ ] Porque la exactitud solo se puede calcular con datos tabulares.
> Por qué: con clases desbalanceadas, la exactitud se infla con la clase mayoritaria; F1 o AUC-ROC reflejan mejor si el modelo detecta la clase minoritaria.

### ¿Por qué una serie temporal no puede tratarse como filas independientes, al estilo de un dataset tabular?
- [ ] Porque las series temporales no admiten redes neuronales.
- [x] Porque el orden y el contexto temporal entre observaciones son información relevante que se pierde si se mezclan las filas.
- [ ] Porque las series temporales siempre tienen menos datos que los problemas tabulares.
> Por qué: ventanear la señal conserva la secuencia como entrada, que es justo lo que una arquitectura como RNN o LSTM necesita para aprender patrones temporales.

## Glosario

- **Aumento de datos (*data augmentation*)**: generación de variantes de los datos de entrenamiento (rotaciones, recortes, cambios de brillo en imágenes) para mejorar la generalización del modelo sin recoger más datos reales.
