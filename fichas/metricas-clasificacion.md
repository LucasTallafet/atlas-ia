---
id: metricas-clasificacion
estado: borrador
---

## En una frase

Para saber si un clasificador acierta de verdad, cuentas sus cuatro tipos de acierto y error y los resumes en métricas que responden a preguntas distintas.

## Intuición

Imagina una prueba que detecta una enfermedad. Puede fallar de dos maneras muy distintas: alarmar a una persona sana o dejar escapar a una enferma. Decir "acierta el 90 %" no te cuenta cuál de los dos errores comete, y en medicina esa diferencia es decisiva.

Un clasificador de IA tiene el mismo problema. Por eso no basta con un único porcentaje de aciertos: primero se separan los errores por tipo en una tabla y después se calculan métricas que miran cada tipo de error. Elegir bien la métrica es decidir qué error te sale más caro.

## Explicación

### La matriz de confusión

Evalúas el modelo en el conjunto de prueba (ver [[validacion]]) y comparas cada predicción con la etiqueta real. En un problema binario salen cuatro casillas:

- **Verdaderos positivos** (TP, *true positives*): positivos reales que el modelo marca como positivos.
- **Falsos negativos** (FN): positivos reales que el modelo marca como negativos.
- **Falsos positivos** (FP): negativos reales que el modelo marca como positivos.
- **Verdaderos negativos** (TN): negativos reales que el modelo marca como negativos.

Esa tabla de 2×2 es la **matriz de confusión** (*confusion matrix*). Todas las métricas de esta ficha salen de sus cuatro números. Un ejemplo con 100 casos de prueba:

|                | Predicha: positiva | Predicha: negativa |
|----------------|-------------------|-------------------|
| Real: positiva | TP = 40           | FN = 10           |
| Real: negativa | FP = 5            | TN = 45           |

### Exactitud: la visión global y su trampa

La **exactitud** (*accuracy*) es la proporción de aciertos: $(40+45)/100 = 0{,}85$. Es fácil de leer y sirve cuando las clases están equilibradas.

Falla con clases desbalanceadas. Si el 95 % de los casos son negativos, un modelo que siempre dice "negativo" logra una exactitud de $0{,}95$ sin detectar ni un positivo. Ese problema tiene ficha propia: [[desbalanceo]].

### Métricas de la clase positiva

La **precisión** (*precision*) responde: de lo que el modelo marcó como positivo, ¿cuánto lo era? Aquí, $40/45 \approx 0{,}89$. Importa cuando un falso positivo es caro, por ejemplo al bloquear una transacción legítima por sospecha de fraude.

El **recall** (sensibilidad o tasa de verdaderos positivos, TPR) responde: de los positivos reales, ¿cuántos encontró? Aquí, $40/50 = 0{,}8$. Importa cuando un falso negativo es caro, como no diagnosticar a un enfermo.

Fíjate en el contraste: la precisión divide entre lo que el modelo *predijo* como positivo; el recall, en cambio, divide entre lo que *era* positivo.

El **F1** (*F1-score*) combina las dos en una media armónica: $0{,}84$ en el ejemplo. La media armónica castiga que una de las dos sea baja, así que un F1 alto exige precisión y recall altos a la vez.

### Métricas de la clase negativa

La **especificidad** es la proporción de negativos reales bien clasificados: $45/50 = 0{,}9$. Su complemento es la **tasa de falsos positivos** (FPR): $5/50 = 0{,}1$.

### El umbral y la curva ROC

Un clasificador como la regresión logística no da una clase, sino una probabilidad $P(y=1\mid\mathbf{x})$. Para decidir, eliges un **umbral** $t$: si la probabilidad es $\ge t$, predices positivo. Cada umbral produce una matriz de confusión distinta. Si bajas $t$, detectas más positivos (sube el recall), pero también cuelas más negativos (sube la FPR).

La **curva ROC** (*Receiver Operating Characteristic*) dibuja el par (FPR, TPR) para todos los umbrales posibles. Un buen modelo pasa cerca de la esquina $(0, 1)$; la diagonal $\text{TPR} = \text{FPR}$ equivale a clasificar al azar.

El **AUC** (*area under the curve*) es el área bajo esa curva. Vale $0{,}5$ para un clasificador aleatorio y $1$ para uno perfecto, que da más probabilidad a todos los positivos que a todos los negativos. Como resume todos los umbrales, sirve para comparar modelos sin haber fijado todavía el umbral.

## Formalización

$$
\text{Exactitud} = \frac{TP + TN}{TP + TN + FP + FN}
\qquad
\text{Precisión} = \frac{TP}{TP + FP}
\qquad
\text{Recall} = \text{TPR} = \frac{TP}{TP + FN}
$$

$$
F1 = 2 \cdot \frac{\text{Precisión} \cdot \text{Recall}}{\text{Precisión} + \text{Recall}}
\qquad
\text{Especificidad} = \frac{TN}{TN + FP} = 1 - \text{FPR}
\qquad
\text{FPR} = \frac{FP}{FP + TN}
$$

donde:

- $TP$, $TN$ son los verdaderos positivos y negativos: aciertos en cada clase.
- $FP$ son los negativos reales predichos como positivos; $FN$, los positivos reales predichos como negativos.
- $\text{TPR}$ es la tasa de verdaderos positivos y $\text{FPR}$, la tasa de falsos positivos.

La regla de decisión con umbral es:

$$
\hat{y} = \begin{cases} 1 & \text{si } P(y=1\mid\mathbf{x}) \ge t \\ 0 & \text{si no} \end{cases}
$$

donde:

- $\hat{y}$ es la clase predicha.
- $P(y=1\mid\mathbf{x})$ es la probabilidad de clase positiva que el modelo da al ejemplo $\mathbf{x}$.
- $t$ es el umbral, entre $0$ y $1$.

## Interactivo

```widget
motor: umbral
modo: clasificacion
positivos: {"n": 100, "media": 0.65, "desv": 0.15}
negativos: {"n": 100, "media": 0.35, "desv": 0.15}
```

- Prueba a bajar el umbral hasta $0{,}3$: el recall sube casi a $1$, pero mira qué les pasa a los falsos positivos y a la precisión.
- Prueba a mover el umbral de extremo a extremo mirando la curva ROC: el punto recorre la curva, pero el AUC no cambia.

## En código

```python
from sklearn.metrics import confusion_matrix, precision_score, recall_score, f1_score, roc_auc_score

y_real = [1, 1, 1, 1, 0, 0, 0, 0, 0, 0]
prob = [0.9, 0.8, 0.6, 0.3, 0.7, 0.4, 0.35, 0.2, 0.1, 0.05]

for t in (0.5, 0.25):
    y_pred = [int(p >= t) for p in prob]
    tn, fp, fn, tp = confusion_matrix(y_real, y_pred).ravel()
    print(t, "TP", tp, "FP", fp, "FN", fn, "TN", tn,
          "prec", round(precision_score(y_real, y_pred), 2),
          "rec", recall_score(y_real, y_pred), "F1", round(f1_score(y_real, y_pred), 2))
print("AUC", round(roc_auc_score(y_real, prob), 3))
# 0.5 TP 3 FP 1 FN 1 TN 5 prec 0.75 rec 0.75 F1 0.75
# 0.25 TP 4 FP 3 FN 0 TN 3 prec 0.57 rec 1.0 F1 0.73
# AUC 0.833
```

## Errores típicos

- **Error**: dar por bueno un modelo con exactitud del 95 %. → **Correcto**: compárala con la proporción de la clase mayoritaria; con datos desbalanceados, predecir siempre esa clase ya da ese 95 %.
- **Error**: confundir precisión y recall. → **Correcto**: la precisión divide entre los *predichos* positivos (TP + FP); el recall, entre los positivos *reales* (TP + FN).
- **Error**: creer que el AUC depende del umbral elegido. → **Correcto**: el AUC resume todos los umbrales; el umbral solo elige un punto de la curva ROC.
- **Error**: pensar que el umbral siempre debe ser $0{,}5$. → **Correcto**: se elige según el coste de cada error; si un falso negativo es grave, se baja para ganar recall.

## A fondo

Qué métrica mirar según el escenario, como resume el curso:

| Escenario | Métrica recomendada |
|---|---|
| Clases equilibradas | Exactitud |
| Clases desbalanceadas | F1 |
| Binaria, importa tener pocos falsos positivos | Precisión |
| Binaria, importa tener pocos falsos negativos | Recall |
| Multiclase | Matriz de confusión + F1 |

En clasificación multiclase la matriz de confusión crece a $K\times K$ (una fila por clase real y una columna por clase predicha). `classification_report` de scikit-learn calcula precisión, recall y F1 de cada clase.

Keras permite calcular métricas durante el entrenamiento con `metrics=["accuracy"]` en `compile`. Las métricas completas por clase se suelen calcular después, con scikit-learn, sobre las predicciones del conjunto de prueba.

## Autoevaluación

### Un modelo tiene TP = 30, FP = 30, FN = 0 y TN = 40. ¿Qué puedes afirmar?
- [ ] Su precisión es perfecta, porque no tiene falsos negativos.
- [x] Su recall es $1$, pero su precisión es solo $0{,}5$.
- [ ] Su exactitud es $1$, porque encuentra todos los positivos.
> Por qué: recall $= 30/(30+0) = 1$ y precisión $= 30/(30+30) = 0{,}5$. No tener falsos negativos mejora el recall, no la precisión; la exactitud es $70/100$.

### En un filtro antifraude, bloquear una compra legítima es muy caro. ¿Qué métrica vigilas en primer lugar?
- [ ] El recall
- [x] La precisión
- [ ] La exactitud
> Por qué: bloquear una compra legítima es un falso positivo, y la precisión mide qué parte de lo marcado como positivo lo era de verdad. El recall vigila los falsos negativos.

### Si bajas el umbral $t$ de $0{,}5$ a $0{,}2$, ¿qué ocurre normalmente?
- [x] Suben el recall y la tasa de falsos positivos.
- [ ] Sube la precisión y baja el recall.
- [ ] Cambia el AUC del modelo.
> Por qué: con un umbral más bajo más casos pasan a "positivo", así que se detectan más positivos reales, pero también se cuelan más negativos. El AUC no depende del umbral.

### Un modelo tiene AUC = 0,5. ¿Qué significa?
- [ ] Acierta la mitad de los positivos con el umbral 0,5.
- [ ] Es un modelo perfecto con clases equilibradas.
- [x] No distingue las clases mejor que el azar.
> Por qué: un AUC de 0,5 corresponde a la diagonal de la curva ROC, la del clasificador aleatorio; no habla de un umbral concreto.

## Glosario

- **Matriz de confusión**: tabla que cruza la clase real con la predicha y cuenta TP, FN, FP y TN.
- **Exactitud (*accuracy*)**: proporción de predicciones correctas sobre el total.
- **Precisión (*precision*)**: proporción de predicciones positivas que eran realmente positivas.
- **Recall**: proporción de positivos reales que el modelo detecta; también sensibilidad o tasa de verdaderos positivos (TPR).
- **F1**: media armónica de precisión y recall.
- **Especificidad**: proporción de negativos reales clasificados correctamente; vale 1 − FPR.
- **Tasa de falsos positivos (FPR)**: proporción de negativos reales clasificados como positivos.
- **Umbral de decisión**: valor de probabilidad a partir del cual se predice la clase positiva.
- **Curva ROC**: curva de la TPR frente a la FPR para todos los umbrales posibles.
- **AUC**: área bajo la curva ROC; 0,5 equivale al azar y 1 a un clasificador perfecto.
