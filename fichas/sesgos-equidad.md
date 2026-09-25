---
id: sesgos-equidad
estado: borrador
---

## En una frase

Un modelo hereda y puede amplificar los sesgos de sus datos y de cómo se codifican, perjudicando sistemáticamente a ciertos grupos aunque su exactitud global parezca buena.

## Intuición

Piensa en una fotocopiadora perfecta: reproduce fielmente todo lo que hay en la página original, incluida una mancha de tinta. Si el "original" —los datos históricos con los que se entrena un modelo— contiene decisiones discriminatorias del pasado (menos préstamos a cierto barrio, menos contrataciones de cierto perfil), el modelo no solo las copia: puede amplificarlas, porque aprende que ese patrón es "lo normal" y lo aplica de forma sistemática, sin el criterio ni las excepciones que aplicaría una persona caso por caso.

## Explicación

### De dónde vienen los sesgos: los datos y su codificación

Codificar variables categóricas que representan características sensibles —género, raza, nivel socioeconómico— puede hacer que esas variables influyan de forma desproporcionada en las predicciones, derivando en decisiones discriminatorias en ámbitos como la concesión de préstamos o las evaluaciones laborales. La **imputación de valores faltantes** (rellenar huecos con la media o la moda) añade otro riesgo: si los datos faltan más a menudo en ciertos subgrupos —por ejemplo, minorías con menos acceso a ciertos servicios—, la imputación puede distorsionar sus datos de forma desproporcionada. Y cuando los propios datos históricos reflejan desigualdades pasadas, como en sistemas judiciales que penalizaron más a ciertos grupos, codificarlos sin revisión crítica refuerza esos mismos patrones discriminatorios en el modelo nuevo.

### Sesgo algorítmico frente a equidad

El **sesgo algorítmico** es el patrón estadístico que un modelo aprende de datos no representativos o históricamente desiguales; la **equidad** es el principio de que las decisiones automatizadas no deben perjudicar sistemáticamente a un grupo protegido. Un modelo puede tener alta exactitud global y aun así ser inequitativo, si sus errores se concentran en un grupo concreto.

### Caso real: el algoritmo de contratación de Amazon

En 2018, Amazon abandonó un sistema de IA para revisar currículums al descubrir que penalizaba a las mujeres. Entrenado con diez años de currículums, la mayoría de candidaturas históricas para puestos tecnológicos venían de hombres; el modelo aprendió a favorecer perfiles masculinos y a penalizar palabras como "mujer" o experiencias asociadas a actividades femeninas. El sistema nunca recibió instrucciones explícitas de discriminar: simplemente aprendió el patrón mayoritario de los datos históricos y lo reprodujo de forma sistemática.

## Formalización

El material de curso describe el problema pero no da métricas; las siguientes son estándar en la literatura de equidad algorítmica.

:::ampliacion
Sea $\hat{Y}$ la predicción del modelo, $Y$ la etiqueta real y $A$ un atributo sensible (por ejemplo, el grupo demográfico) con valores $a$ y $b$.

**Paridad demográfica**: la proporción de resultados positivos debe ser igual entre grupos, independientemente del resultado real:
$$P(\hat{Y}=1\mid A=a) \approx P(\hat{Y}=1\mid A=b)$$

**Igualdad de tasas de error (*equalized odds*)**: la tasa de verdaderos positivos y la tasa de falsos positivos deben ser iguales entre grupos:
$$P(\hat{Y}=1\mid Y=1,A=a) = P(\hat{Y}=1\mid Y=1,A=b) \qquad P(\hat{Y}=1\mid Y=0,A=a) = P(\hat{Y}=1\mid Y=0,A=b)$$

donde:
- $\hat{Y}=1$: el modelo predice la clase positiva (por ejemplo, "conceder el préstamo").
- $Y=1$/$Y=0$: la etiqueta real es positiva/negativa.
- $A=a$, $A=b$: pertenencia a uno u otro grupo protegido.

**Ejemplo numérico.** Con el mismo umbral de decisión, el grupo A tiene una tasa de falsos positivos (FPR) de $0{,}10$ y el grupo B de $0{,}30$: el modelo comete tres veces más falsos positivos en el grupo B que en el A, aunque use exactamente el mismo umbral y el mismo criterio para ambos. Esta disparidad viola la igualdad de tasas de error, incluso si la [[metricas-clasificacion|exactitud]] global del modelo parece aceptable.
Fuente: Mehrabi, N. et al. (2021), "A Survey on Bias and Fairness in Machine Learning"; documentación de Fairlearn.
:::

## Interactivo

```widget
motor: umbral
modo: "grupos"
positivos: {"n": 100, "media": 0.65, "desv": 0.15}
negativos: {"n": 100, "media": 0.30, "desv": 0.15}
grupos: [
  {"nombre": "Grupo A", "positivos": {"n": 100, "media": 0.65, "desv": 0.15}, "negativos": {"n": 100, "media": 0.30, "desv": 0.15}},
  {"nombre": "Grupo B", "positivos": {"n": 100, "media": 0.65, "desv": 0.15}, "negativos": {"n": 100, "media": 0.45, "desv": 0.15}}
]
metricas: ["accuracy", "recall", "fpr"]
```

Prueba a…
1. Prueba a fijar un umbral y comparar la tasa de falsos positivos (FPR) del grupo A con la del grupo B: ¿son iguales?
2. Prueba a buscar un umbral distinto para cada grupo que iguale sus FPR: ¿qué le pasa a la exactitud global del modelo?
3. Prueba a imaginar que este modelo decide conceder o denegar préstamos: ¿qué grupo saldría perjudicado con un único umbral común?

## Errores típicos

- **Error**: pensar que una exactitud global alta garantiza que el modelo es justo → **Correcto**: la exactitud puede ser alta en conjunto y aun así los errores concentrarse de forma desproporcionada en un grupo concreto, como muestra la disparidad de FPR entre grupos.
- **Error**: creer que quitar la variable sensible (género, raza) de los datos elimina el sesgo → **Correcto**: otras variables correlacionadas con el atributo sensible —el código postal con la raza, ciertas palabras del currículum con el género— pueden actuar como *proxies* y seguir codificando el mismo sesgo.
- **Error**: asumir que igualar la exactitud entre grupos es lo mismo que igualar sus tasas de error → **Correcto**: dos grupos pueden tener la misma exactitud global y tasas de falsos positivos o de falsos negativos muy distintas; son criterios de equidad diferentes y no siempre compatibles entre sí.
- **Error**: suponer que el sesgo algorítmico siempre viene de una intención discriminatoria → **Correcto**: la mayoría de los casos, como el de Amazon, surgen de reproducir fielmente un patrón mayoritario presente en los datos históricos, sin que nadie lo programe a propósito.

## En resumen

- El sesgo algorítmico es un patrón aprendido de datos no representativos o históricamente desiguales; la equidad exige que las decisiones no perjudiquen sistemáticamente a un grupo protegido.
- Se origina en la codificación de variables sensibles, la imputación desigual de valores faltantes y los sesgos ya presentes en los datos históricos.
- Métricas clave: paridad demográfica ($P(\hat{Y}=1\mid A=a)$ igual entre grupos) e igualdad de tasas de error (TPR y FPR iguales entre grupos).
- Se revisa siempre que un modelo tome decisiones sobre personas (crédito, contratación, justicia), no solo cuando hay sospecha explícita de discriminación.
- Decisión clave: qué definición de equidad priorizar, porque distintas métricas de equidad pueden entrar en conflicto entre sí.
- La trampa principal: confiar en la exactitud global como única señal de que el modelo funciona bien para todos los grupos por igual.

## Autoevaluación

### Un modelo de concesión de crédito tiene un 92% de exactitud global. Al desagregar por grupo demográfico, el grupo minoritario tiene una tasa de falsos positivos del 30% frente al 10% del grupo mayoritario. ¿Qué se puede concluir?
- [ ] Que el modelo es justo, porque su exactitud global es alta
- [x] Que el modelo puede ser inequitativo pese a su buena exactitud global, porque sus errores se concentran de forma desigual entre grupos
- [ ] Que hay que ignorar el desglose por grupo si la exactitud global ya es aceptable
> Por qué: la exactitud global agrega los aciertos de todos los grupos y puede ocultar una disparidad grande en cómo se reparten los errores; hay que mirar las métricas por grupo (como la FPR) para detectarlo.

### Un equipo elimina la variable "género" de sus datos antes de entrenar un modelo de contratación, pero el sesgo de género persiste en las predicciones. ¿Cuál es la explicación más probable?
- [ ] Es imposible: sin la variable "género", el sesgo de género no puede aparecer
- [x] Otras variables correlacionadas con el género (ciertas palabras del currículum, ciertas actividades) actúan como *proxy* y siguen codificando la misma información
- [ ] El modelo ha aprendido a discriminar por su cuenta sin ninguna base en los datos
> Por qué: eliminar una variable sensible no elimina la información que otras variables correlacionadas con ella puedan seguir aportando al modelo; esas variables *proxy* mantienen el sesgo aunque la variable original ya no esté.

### En el caso de Amazon, el algoritmo de contratación penalizaba currículums con la palabra "mujer" o experiencias asociadas a actividades femeninas. ¿Por qué ocurrió esto sin que nadie programara esa regla explícitamente?
- [ ] Porque el algoritmo tenía acceso a internet y buscó información discriminatoria
- [x] Porque aprendió el patrón mayoritario de diez años de currículums, en su mayoría de hombres, y lo generalizó como si fuera la norma a seguir
- [ ] Porque los ingenieros de Amazon introdujeron esa regla deliberadamente
> Por qué: el modelo no recibe reglas explícitas sobre género; aprende estadísticamente qué patrones se asociaban con contrataciones pasadas, y como esos patrones venían mayoritariamente de hombres, terminó penalizando lo que se apartaba de ese patrón.

## Glosario

- **Sesgo algorítmico**: patrón sistemático que un modelo aprende de datos no representativos o que reflejan desigualdades históricas, y que se traduce en decisiones injustas para ciertos grupos.
- **Equidad (*fairness*)**: principio según el cual las decisiones de un modelo no deben perjudicar sistemáticamente a un grupo protegido, más allá de la exactitud global del sistema.
- **Variable proxy**: variable que no es en sí misma un atributo sensible, pero está correlacionada con él y puede transmitir la misma información al modelo.
