---
id: tipos-datos
estado: borrador
---

## En una frase

Los datos que alimentan un modelo pueden ser numéricos, categóricos, ordinales o temporales, y esa naturaleza decide cómo se preparan y qué papel juega la variable objetivo.

## Intuición

Imagina que clasificas el correo que llega a una oficina: las facturas se suman, las cartas certificadas se ordenan por fecha y los paquetes solo se cuentan por tipo. No tratarías todo el correo igual, y con los datos de un modelo pasa lo mismo. Un modelo necesita saber si un número representa una cantidad que se puede sumar y comparar (el precio de una casa), una etiqueta sin orden (el color de un coche) o una etiqueta con orden pero sin distancia definida (el nivel de estudios).

Confundir estos tipos es un error costoso: si un algoritmo trata un código postal como un número que se puede promediar, el resultado no tiene ningún sentido. Saber distinguir el tipo de cada variable —y en particular el de la que quieres predecir, la **variable objetivo**— es el primer paso antes de cualquier análisis, porque determina qué gráficos, qué estadísticos y qué algoritmos son válidos.

## Explicación

### Los tipos de datos que puedes encontrar

Antes de analizar o modelar un conjunto de datos, clasifica cada columna. Los **datos numéricos** representan cantidades: son **discretos** si solo toman valores enteros contables (el número de habitaciones) o **continuos** si pueden tomar cualquier valor en un rango (el precio, la temperatura); ambos admiten operaciones aritméticas con sentido. Los **datos categóricos** son etiquetas sin relación matemática entre ellas —el color de un coche—, aunque a veces se representen con números. Un caso especial son los **datos ordinales**: categorías con un orden claro pero sin una distancia numérica precisa entre ellas, como el nivel de estudios (primaria < secundaria < universitaria). Por último, los **datos temporales** —fechas, horas— suelen esconder patrones estacionales que interesan sobre todo en [[series-temporales|series temporales]].

Confundir estos tipos tiene consecuencias: tratar un código postal como numérico continuo hace que el modelo calcule medias sin sentido; tratar el nivel de estudios como categórico puro (sin orden) le hace perder información valiosa.

### La variable objetivo según el problema

En aprendizaje supervisado (ver [[que-es-ml]]), el tipo de la **variable objetivo** (*target*) decide qué clase de problema resuelves. Si es categórica —"spam" o "no spam", una especie de flor entre varias— el problema es de **clasificación**, y el modelo asigna cada observación a una clase. Si es numérica y continua —el precio de una vivienda, un salario— el problema es de **regresión**. Esta distinción condiciona las métricas de evaluación y el tipo de algoritmo que tiene sentido usar.

### Cuando los datos están mal etiquetados

Es habitual encontrar variables categóricas con inconsistencias: la misma categoría escrita de formas distintas ("Hombre", "hombre", "M"). Estos errores generan ruido en el entrenamiento y conviene detectarlos pronto —por ejemplo, si esperas tres categorías y el análisis muestra cinco— antes de pasar a [[eda|el análisis exploratorio]].

### Por qué hace falta codificar los datos no numéricos

Los modelos de aprendizaje automático solo operan con números, así que las variables categóricas, ordinales o textuales deben transformarse antes de entrenar. Esa transformación se llama **codificación**, y se elige según el tipo de dato: las [[codificacion-categoricas|categorías y los datos ordinales tienen sus propias técnicas]], y el texto puede representarse con bolsas de palabras, TF-IDF o *embeddings* (ver [[nlp-intro]]). Elegir mal la codificación introduce dos problemas típicos: **sesgo**, si el método sugiere un orden o una magnitud que no existe en los datos, y **aumento de la dimensionalidad**, cuando una variable categórica con muchas categorías se convierte en muchas columnas nuevas.

## Formalización

No aplica: clasificar los tipos de datos es una tarea conceptual, no una fórmula. La codificación numérica de categorías se formaliza en [[codificacion-categoricas]].

## En código

```python
import pandas as pd

df = pd.DataFrame({
    "tamano_m2": [50, 70, 90],
    "habitaciones": [2, 3, 4],
    "barrio": ["Centro", "Centro", "Afueras"],
    "estudios": ["primaria", "universitaria", "secundaria"],
})
print(df.dtypes)
print(df["barrio"].value_counts())
# tamano_m2       int64   (numérico continuo)
# habitaciones    int64   (numérico discreto)
# barrio          str     (categórico: pandas no distingue "ordinal" solo)
# estudios        str     (ordinal, aunque pandas lo vea como texto)
#
# barrio
# Centro     2
# Afueras    1
```

## Errores típicos

- **Error**: tratar un código postal o un identificador de cliente como numérico continuo. → **Correcto**: son etiquetas categóricas; sumarlos o promediarlos no aporta ninguna información.
- **Error**: usar *label encoding* (0, 1, 2…) en una variable categórica sin orden. → **Correcto**: introduce una relación numérica falsa; usa *one-hot encoding* en su lugar.
- **Error**: no revisar variantes de escritura en variables categóricas antes de analizarlas. → **Correcto**: "Hombre", "hombre" y "M" cuentan como tres categorías distintas si no se limpian antes del EDA.
- **Error**: asumir que una variable objetivo con valores 0 y 1 siempre es un problema de regresión por ser numérica. → **Correcto**: si esos números son etiquetas sin magnitud (por ejemplo, "no compra"/"compra"), el problema es de clasificación.

## En resumen

- **Qué hace**: clasifica cada variable de un conjunto de datos —numérica discreta o continua, categórica, ordinal o temporal— para saber cómo tratarla.
- **Cómo se decide**: comprueba si los valores admiten aritmética con sentido (numérica), si son etiquetas (categórica), si tienen orden sin distancia definida (ordinal) o si son fechas u horas (temporal).
- **La variable objetivo**: categórica → problema de clasificación; numérica continua → problema de regresión.
- **Cuándo usarlo**: siempre, como primer paso antes del [[eda|análisis exploratorio]] y de cualquier modelo.
- **Decisión que importa**: elegir la codificación según el tipo —*label encoding* solo para datos ordinales, *one-hot encoding* para categóricas sin orden.
- **Trampa principal**: confundir una etiqueta representada con números (código postal, ID) con un dato numérico continuo.

## Autoevaluación

### Quieres predecir si un cliente cancelará su suscripción (sí/no). ¿Qué tipo de variable objetivo es y qué problema resulta?
- [ ] Numérica continua; problema de regresión.
- [x] Categórica; problema de clasificación.
- [ ] Ordinal; problema de regresión.
> Por qué: "sí"/"no" son dos etiquetas sin magnitud ni orden numérico, así que el modelo asigna cada observación a una clase: es clasificación.

### Tienes una variable "nivel de satisfacción" con valores "bajo", "medio", "alto". ¿Qué tipo de dato es y qué la distingue de una variable categórica cualquiera?
- [ ] Numérica discreta, porque solo tiene tres valores posibles.
- [x] Ordinal, porque hay un orden claro entre las categorías aunque la distancia entre ellas no esté definida.
- [ ] Categórica, exactamente igual que el color de un coche.
- [ ] Temporal, porque describe una evolución.
> Por qué: "bajo" < "medio" < "alto" tiene un orden inherente, pero no se puede afirmar que la distancia entre "bajo" y "medio" sea la misma que entre "medio" y "alto"; eso es justo lo que define a un dato ordinal.

### Un conjunto de datos tiene una columna "género" con los valores "Hombre", "hombre", "H", "Mujer" y "mujer". ¿Qué problema hay y en qué fase se detecta habitualmente?
- [ ] No hay ningún problema: son solo categorías distintas y válidas.
- [x] Son datos mal etiquetados: la misma categoría aparece escrita de formas distintas, y se detecta en el análisis exploratorio.
- [ ] Es un dato ordinal mal codificado.
> Por qué: "Hombre", "hombre" y "H" representan la misma categoría con formatos distintos; si no se corrige, el modelo las tratará como tres categorías diferentes, introduciendo ruido.

### Si aplicas *label encoding* (0, 1, 2) a una variable categórica sin orden como "color de coche" (rojo=0, verde=1, azul=2), ¿qué problema introduces?
- [ ] Ninguno: los modelos ignoran automáticamente los números si la variable es categórica.
- [x] El modelo puede interpretar relaciones numéricas falsas, como que "azul" es el doble de "verde".
- [ ] Aumenta demasiado la dimensionalidad del conjunto de datos.
> Por qué: al no existir un orden real entre los colores, asignarles números consecutivos sugiere una magnitud y un orden que no están en los datos; ese riesgo es el motivo de usar *one-hot encoding* en variables sin orden.

## Glosario

- **Dato categórico**: variable que representa una etiqueta o categoría sin relación matemática entre sus valores, aunque se represente con números.
- **Dato ordinal**: variable categórica cuyas categorías tienen un orden claro, pero sin una distancia numérica precisa entre ellas.
- **Variable objetivo**: la variable que un modelo supervisado intenta predecir (*target*); su tipo determina si el problema es de clasificación o de regresión.
- **Codificación**: transformación de datos no numéricos (categóricos, ordinales, textuales) en una representación numérica que un modelo pueda procesar.
