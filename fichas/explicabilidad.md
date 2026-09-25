---
id: explicabilidad
estado: borrador
---

## En una frase

La explicabilidad es la capacidad de justificar por qué un modelo complejo tomó una decisión concreta, aunque su funcionamiento interno siga siendo una caja negra.

## Intuición

Imagina dos médicos. El primero sigue un protocolo con reglas claras ("si la fiebre supera 39° y hay tos, sospecha de X"): puedes seguir su razonamiento paso a paso. El segundo, con veinte años de experiencia, reconoce el patrón "de un vistazo" y casi siempre acierta, pero le costaría explicar exactamente qué detalles le hicieron decidirse. Si ese segundo médico diagnostica algo grave, querrás una justificación concreta —qué síntomas pesaron más en su decisión— antes de confiar ciegamente. Los modelos de IA se dividen igual: unos son transparentes por diseño, y a otros, más precisos pero opacos, hay que pedirles explicaciones a posteriori.

## Explicación

### Interpretabilidad frente a explicabilidad

La [[automatizacion-seleccion|interpretabilidad]] es entender directamente, sin ayuda externa, cómo un modelo llega a sus predicciones: un [[arboles-decision|árbol de decisión]] o una regresión logística son interpretables porque sus reglas o coeficientes se pueden leer directamente. La **explicabilidad**, en cambio, entra en juego cuando el modelo es una caja negra —como una red neuronal profunda— y no se puede entender su funcionamiento interno, pero sí se le puede pedir una justificación post-hoc de una decisión concreta, normalmente con herramientas externas como **LIME** o **SHAP**.

### Por qué importa: dos casos reales

En 2020, la FDA aprobó un algoritmo de IA para detectar derrames cerebrales en imágenes médicas. Aunque el sistema funcionaba bien en los ensayos clínicos, su naturaleza de caja negra generó reticencia entre los médicos: sin entender el porqué de una conclusión, resultaba difícil confiar plenamente en ella. Algo parecido, pero con consecuencias distintas, ocurrió con **COMPAS**, un algoritmo usado en el sistema judicial de Estados Unidos para estimar el riesgo de reincidencia: una investigación de ProPublica en 2016 reveló sesgos raciales significativos (ver [[sesgos-equidad]]) que la opacidad del algoritmo dificultaba detectar y cuestionar.

### El compromiso entre rendimiento e interpretabilidad

Los modelos tradicionales —árboles de decisión, regresión logística— permiten analizar directamente la contribución de cada variable, algo valioso en sectores como la medicina o las finanzas, donde la explicabilidad es un requisito. Las redes neuronales profundas, en cambio, distribuyen el conocimiento aprendido entre miles o millones de parámetros sin correspondencia directa con variables individuales, lo que las hace más opacas. Aun así, en tareas como la clasificación de imágenes o la traducción automática, su rendimiento superior justifica su uso pese a ser menos explicables, apoyándose en técnicas externas para paliar esa opacidad.

## Formalización

El material de curso no incluye fórmulas; las dos técnicas de explicabilidad más usadas sí tienen una base matemática estándar.

:::ampliacion
**Valores de Shapley (SHAP).** Reparten la diferencia entre la predicción de una instancia $f(\mathbf{x})$ y la predicción base $\phi_0$ (la media del modelo sobre el conjunto de datos) entre las $d$ variables, de forma que la suma de las contribuciones reconstruye exactamente la predicción:

$$f(\mathbf{x}) = \phi_0 + \sum_{j=1}^{d} \phi_j$$

donde cada $\phi_j$ es el promedio de la contribución marginal de la variable $j$ sobre todos los órdenes posibles en que podría "entrar" al modelo:

$$\phi_j = \sum_{S\subseteq D\setminus\{j\}} \frac{|S|!\,(d-|S|-1)!}{d!}\big[f(S\cup\{j\}) - f(S)\big]$$

donde:
- $D$: conjunto de todas las variables del modelo.
- $S$: un subconjunto de variables sin incluir $j$.
- $f(S)$: predicción del modelo usando solo las variables de $S$ (el resto, en su valor base).
- $\phi_j$: valor de Shapley de la variable $j$, su contribución media a la predicción.

**Ejemplo numérico.** Para un modelo lineal de juguete $f(x_1,x_2)=2x_1+3x_2+1$, con base $(0,0)$ y una instancia $(x_1,x_2)=(2,1)$: $\phi_0=f(0,0)=1$, $\phi_1=4$, $\phi_2=3$, y $\phi_0+\phi_1+\phi_2=8=f(2,1)$. Al no haber interacción entre $x_1$ y $x_2$, el orden en que se añaden las variables no cambia su contribución individual.
Fuente: Lundberg, S. y Lee, S. (2017), "A Unified Approach to Interpreting Model Predictions".
:::

:::ampliacion
**Importancia por permutación.** Mide cuánto empeora una métrica del modelo (por ejemplo, la exactitud) al barajar aleatoriamente los valores de una variable, rompiendo su relación con la salida real, mientras el resto de variables quedan intactas: $\text{Importancia}_j = \text{métrica}_{\text{original}} - \text{métrica}_{\text{tras permutar } j}$. Cuanto mayor sea la caída, más dependía el modelo de esa variable.
Fuente: Molnar, C., *Interpretable Machine Learning*.
:::

## Interactivo

```widget
motor: funcion
modo: "barras"
datos: {"etiquetas": ["Base (predicción media)", "Contribución de x1", "Contribución de x2", "Predicción final"], "series": [{"nombre": "Valor acumulado", "valores": [1, 5, 8, 8]}]}
```

Prueba a…
1. Prueba a comprobar que la base más las dos contribuciones ($1+4+3$) coincide con la predicción final de la última barra.
2. Prueba a pensar qué pasaría con la barra de "Contribución de x1" si $x_1$ valiera el doble: en un modelo lineal como este, ¿cambiaría proporcionalmente?
3. Prueba a imaginar que $x_1$ y $x_2$ interactuaran entre sí (por ejemplo, su producto): ¿seguiría siendo tan simple repartir la contribución entre ambas?

## En código

```python
import itertools

def f(x1, x2):
    return 2 * x1 + 3 * x2 + 1

x, base = (2, 1), (0, 0)
contrib = {0: [], 1: []}
for orden in itertools.permutations([0, 1]):
    actual, previo = list(base), f(*base)
    for j in orden:
        actual[j] = x[j]
        contrib[j].append(f(*actual) - previo)
        previo = f(*actual)

phi0 = f(*base)
phi1, phi2 = sum(contrib[0]) / 2, sum(contrib[1]) / 2
print(phi0, phi1, phi2, phi0 + phi1 + phi2)
# 1 4.0 3.0 8.0
```

## Errores típicos

- **Error**: confundir interpretabilidad con explicabilidad → **Correcto**: la interpretabilidad es entender directamente cómo funciona el modelo (árboles, regresión); la explicabilidad es justificar a posteriori una decisión de un modelo que sigue siendo una caja negra.
- **Error**: pensar que SHAP o LIME revelan el mecanismo interno exacto del modelo → **Correcto**: son aproximaciones que explican una predicción concreta, no una radiografía literal de los cálculos internos del modelo.
- **Error**: interpretar la importancia por permutación como una relación de causa-efecto → **Correcto**: solo mide cuánto empeora una métrica al romper la relación de una variable con la salida; si hay variables muy correlacionadas entre sí, el resultado puede ser engañoso.
- **Error**: asumir que un modelo más preciso siempre merece la pena aunque sea menos explicable → **Correcto**: en dominios críticos como la salud o la justicia, la falta de explicabilidad puede pesar más que una pequeña mejora de rendimiento, como muestran los casos de la FDA y de COMPAS.

## En resumen

- Interpretabilidad: entender directamente cómo decide el modelo. Explicabilidad: justificar a posteriori una decisión de un modelo opaco.
- Los modelos simples (árboles, regresión) son interpretables por diseño; las redes profundas necesitan herramientas externas como SHAP o LIME.
- Regla clave: los valores de Shapley reparten la predicción entre variables de forma que $f(\mathbf{x})=\phi_0+\sum_j\phi_j$.
- Se usa siempre que haga falta confiar en o auditar una decisión de un modelo complejo, sobre todo en dominios críticos (salud, justicia, crédito).
- Decisión clave: si el caso de uso exige un modelo interpretable desde el diseño o basta con explicaciones post-hoc de un modelo más potente.
- La trampa principal: tratar la explicación de SHAP/LIME como si fuera el mecanismo real del modelo, en vez de una aproximación local.

## A fondo

En redes neuronales, además de SHAP y LIME, se usan técnicas como **Grad-CAM** para visualizar qué regiones de una imagen influyeron más en una predicción, y que se apoyan en las mismas activaciones internas de la red. A pesar de estas herramientas, en la práctica industrial el rendimiento superior del *deep learning* en tareas como clasificación de imágenes o traducción automática ha llevado a adoptarlo de forma masiva incluso donde la interpretabilidad es menor, reservando la explicabilidad post-hoc para los casos donde de verdad se necesita justificar una decisión.

## Autoevaluación

### Un hospital adopta un sistema de IA que detecta derrames cerebrales en imágenes con muy buena precisión, pero los médicos dudan en confiar en él porque no entienden cómo llega a sus conclusiones. ¿Qué le falta al sistema?
- [ ] Precisión: hay que mejorar la exactitud del modelo
- [x] Explicabilidad: una justificación post-hoc de cada predicción que ayude a los médicos a confiar en decisiones concretas
- [ ] Datos: hay que entrenarlo con más imágenes
> Por qué: el problema no es de precisión sino de confianza: sin una explicación de por qué el modelo llegó a una conclusión concreta, los médicos no pueden verificar ni justificar la decisión ante el paciente.

### En el caso COMPAS, la opacidad del algoritmo dificultó detectar que las predicciones tenían sesgos raciales. ¿Qué relación tiene esto con la explicabilidad?
- [ ] Ninguna: los sesgos raciales no dependen de si el modelo es explicable o no
- [x] Sin explicaciones sobre cómo el modelo llegaba a sus conclusiones, era más difícil para jueces y abogados detectar y cuestionar el sesgo antes de que un estudio externo lo sacara a la luz
- [ ] COMPAS era completamente interpretable, el problema fue solo de los datos
> Por qué: la falta de explicabilidad no causa el sesgo, pero sí dificulta detectarlo y auditarlo a tiempo; una herramienta como SHAP podría haber ayudado a exponer qué variables pesaban más en el riesgo estimado.

### Para un modelo lineal $f(x_1,x_2)=2x_1+3x_2+1$, los valores de Shapley de una instancia dan $\phi_0=1$, $\phi_1=4$ y $\phi_2=3$. ¿Qué propiedad de SHAP confirma este resultado?
- [ ] Que los valores de Shapley siempre suman exactamente 1
- [x] Que la suma de la base y las contribuciones reconstruye exactamente la predicción: $\phi_0+\phi_1+\phi_2=8=f(2,1)$
- [ ] Que en un modelo lineal las contribuciones de Shapley son siempre iguales entre variables
> Por qué: la propiedad de aditividad de SHAP garantiza que la predicción completa se reconstruye sumando la base y todas las contribuciones individuales, algo que se cumple aquí exactamente.

## Glosario

- **Explicabilidad**: capacidad de justificar a posteriori una decisión concreta de un modelo que no es directamente interpretable.
- **Valores de Shapley (SHAP)**: método que reparte la diferencia entre una predicción y la predicción base entre las variables, como su contribución media sobre todos los órdenes posibles.
- **LIME**: técnica que aproxima localmente el comportamiento de un modelo complejo con un modelo simple e interpretable, para explicar una predicción concreta.
