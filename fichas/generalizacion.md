---
id: generalizacion
estado: borrador
---

## En una frase

La generalización es la capacidad de un modelo para predecir bien sobre datos que no ha visto, no solo sobre los que usó para entrenar.

## Intuición

Piensa en dos estudiantes que se preparan para un examen. Uno memoriza las respuestas exactas del examen del año pasado; el otro entiende el método para resolver cualquier problema del tema. Si el examen de este año repite las mismas preguntas, ambos aprueban. Pero si cambian los números o el enunciado, solo el segundo sabrá qué hacer.

Un modelo de aprendizaje automático puede caer en la misma trampa que el primer estudiante: ajustarse tan bien a los datos de entrenamiento que en realidad los está memorizando, sin haber aprendido el patrón general que le serviría con datos nuevos.

## Explicación

### Subajuste y sobreajuste: los dos modos de fallar

Un modelo demasiado simple para el problema —una recta para una relación curva— sufre **subajuste**: ni siquiera consigue ajustar bien los datos de entrenamiento, así que tampoco predice bien datos nuevos. Un modelo demasiado flexible —un polinomio de grado muy alto, una red con muchos parámetros y pocos datos— sufre **sobreajuste**: se ajusta tan bien al entrenamiento que memoriza hasta el ruido, y falla al enfrentarse a casos distintos. El objetivo no es minimizar el error de entrenamiento a toda costa, sino encontrar la complejidad justa para que el error se mantenga bajo también en datos nuevos, tal y como viste sobre el número de parámetros en [[componentes-ml]].

### Sesgo y varianza: por qué ocurre cada fallo

Detrás de estos dos fallos hay dos fuentes de error distintas: la misma idea de [[muestreo-intervalos|sesgo]] y [[variable-aleatoria|varianza]] que ya conoces de estadística, aplicada ahora a las predicciones de un modelo. El **sesgo** es el error que viene de las suposiciones simplificadas del modelo: un modelo con sesgo alto es rígido y tiende a subajustar. La **varianza** es la sensibilidad del modelo a los datos concretos de entrenamiento: un modelo con varianza alta cambia mucho si cambian ligeramente los datos, y tiende a sobreajustar. Un buen modelo busca el punto en que ambos son razonablemente bajos a la vez.

### Qué hacer al respecto

Cuando un modelo sobreajusta, ayuda simplificarlo, darle más datos representativos o aplicar [[regularizacion|regularización]] (verás cómo en su propia ficha). Cuando subajusta, hace falta un modelo más flexible o características que capturen mejor el problema. También importa que los datos de entrenamiento sean representativos: si están sesgados o una clase está muy poco representada —el caso típico de la [[desbalanceo|detección de fraude]]—, el modelo aprenderá patrones que no se sostienen fuera de esos datos.

## Formalización

$$
\text{brecha} = \text{error}_{\text{test}} - \text{error}_{\text{entrenamiento}}
$$

donde:

- $\text{error}_{\text{entrenamiento}}$ es el error del modelo sobre los datos que usó para ajustarse.
- $\text{error}_{\text{test}}$ es el error sobre datos que el modelo no ha visto.
- una brecha grande, con error de entrenamiento bajo, es señal de sobreajuste.

**Ejemplo**: tres modelos entrenados sobre el mismo problema dan estos resultados:

| Modelo | Error entrenamiento | Error test | Brecha |
|---|---|---|---|
| Subajuste | 0,42 | 0,45 | 0,03 |
| Sobreajuste | 0,02 | 0,35 | 0,33 |
| Buen ajuste | 0,10 | 0,12 | 0,02 |

Fíjate en que la brecha por sí sola no basta: el modelo con subajuste tiene una brecha tan pequeña como el de buen ajuste, pero ambos errores son altos. Hay que mirar el error de entrenamiento y la brecha a la vez.

## Interactivo

```widget
motor: dispersion2d
modo: polinomio
dataset: {"generador": "curva", "n": 18, "ruido": 0.3, "clases": 1, "semilla": 4}
controles: [{"nombre": "grado", "min": 1, "max": 9, "paso": 1, "valor": 1}]
paso_a_paso: false
arrastrables: true
```

- Prueba a subir el grado poco a poco: fíjate cómo el error de entrenamiento baja casi siempre, pero el de test empieza a subir a partir de cierto punto.
- Prueba a dejar el grado en 1: si los puntos no siguen una línea recta, es probable que estés viendo subajuste.
- Prueba a llevar el grado casi al número de puntos: la curva pasa por casi todos los puntos de entrenamiento, síntoma de sobreajuste.

## En código

```python
modelos = {
    "subajuste": (0.42, 0.45),
    "sobreajuste": (0.02, 0.35),
    "buen ajuste": (0.10, 0.12),
}
for nombre, (train, test) in modelos.items():
    print(f"{nombre}: brecha = {test - train:.2f}")
# subajuste: brecha = 0.03
# sobreajuste: brecha = 0.33
# buen ajuste: brecha = 0.02
```

## Errores típicos

- **Error**: pensar que una brecha pequeña siempre significa que el modelo es bueno. → **Correcto**: si ambos errores son altos y la brecha es pequeña, el problema es subajuste, no buen ajuste.
- **Error**: creer que el sobreajuste se soluciona solo con más datos. → **Correcto**: más datos ayuda, pero regularización o simplificar el modelo suelen ser necesarios también.
- **Error**: juzgar la generalización solo por el error de entrenamiento. → **Correcto**: el error de entrenamiento no dice nada sobre datos nuevos; hace falta medir sobre datos que el modelo no haya visto, como en [[validacion]].
- **Error**: pensar que sesgo y varianza se pueden reducir a la vez sin ningún coste. → **Correcto**: casi siempre hay un compromiso: reducir la varianza (simplificando el modelo) suele aumentar el sesgo, y viceversa.

## En resumen

- **Qué hace y para qué sirve**: describe si un modelo predice bien sobre datos nuevos, y no solo sobre los que usó para entrenar.
- **Cómo funciona**: compara el error en entrenamiento con el error en datos no vistos; ambos altos indica subajuste, brecha grande con entrenamiento bajo indica sobreajuste.
- **Fórmula clave**: $\text{brecha} = \text{error}_{\text{test}} - \text{error}_{\text{entrenamiento}}$.
- **Cuándo preocuparte**: siempre que el error de entrenamiento sea mucho más bajo que el de datos nuevos, o que ambos sean altos por igual.
- **Decisión que importa**: el equilibrio entre sesgo y varianza, ajustando la complejidad del modelo o aplicando regularización.
- **Trampa principal**: fiarse solo del error de entrenamiento, que puede ser bajo incluso cuando el modelo no ha aprendido nada generalizable.

## Autoevaluación

### Un modelo tiene error de entrenamiento 0,05 y error de test 0,40. ¿Qué problema sugiere esto?
- [ ] Subajuste, porque el error de entrenamiento es bajo.
- [x] Sobreajuste: el modelo ha aprendido detalles del entrenamiento que no se sostienen en datos nuevos.
- [ ] Buen ajuste, porque al menos uno de los errores es bajo.
> Por qué: una brecha grande entre un error de entrenamiento muy bajo y un error de test alto es la firma característica del sobreajuste.

### Otro modelo tiene error de entrenamiento 0,38 y error de test 0,40. ¿Qué problema sugiere esto?
- [ ] Sobreajuste, porque hay una pequeña brecha.
- [x] Subajuste: ambos errores son altos, así que el modelo no capta ni siquiera los patrones del entrenamiento.
- [ ] Ningún problema, porque la brecha es pequeña.
> Por qué: una brecha pequeña no basta para decir que el modelo va bien; aquí ambos errores son altos, lo que indica que el modelo es demasiado simple.

### ¿Qué describe mejor la varianza de un modelo?
- [ ] El error que viene de suposiciones demasiado simples.
- [x] Su sensibilidad a los datos concretos de entrenamiento: si cambian un poco, el modelo cambia mucho.
- [ ] El ruido irreducible del problema.
> Por qué: la varianza mide cuánto varía el modelo aprendido si cambias el conjunto de entrenamiento; un modelo con varianza alta tiende a sobreajustar.

### Si reduces la complejidad de un modelo que sobreajusta, ¿qué cabe esperar?
- [ ] Que el sesgo y la varianza bajen a la vez sin ningún coste.
- [x] Que la varianza baje, pero es probable que el sesgo suba algo.
- [ ] Que el modelo deje de tener parámetros.
> Por qué: sesgo y varianza suelen moverse en direcciones opuestas; simplificar reduce la varianza pero puede introducir más sesgo.

## Glosario

- **Subajuste**: incapacidad de un modelo demasiado simple para captar los patrones incluso en los datos de entrenamiento.
- **Sobreajuste**: ajuste excesivo de un modelo a los detalles y al ruido del entrenamiento, a costa de fallar en datos nuevos.
