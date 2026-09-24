---
id: bayes
estado: borrador
---

## En una frase

El teorema de Bayes calcula cómo debe cambiar una creencia inicial cuando llega una evidencia nueva, combinando lo que ya sabías con lo bien que esa evidencia encaja con cada hipótesis.

## Intuición

Piensa en un médico que, antes de ver a un paciente, sabe que solo el 1% de la población tiene cierta enfermedad. Esa es su creencia de partida. Si el paciente da positivo en una prueba, el médico no debería concluir sin más que está enfermo: debe combinar esa creencia inicial con la fiabilidad de la prueba para llegar a una conclusión razonable. El teorema de Bayes es exactamente el procedimiento que hace ese ajuste de forma rigurosa, en vez de dejarlo a la intuición.

Esta lógica —empezar con una creencia, observar algo y actualizar— es el corazón de muchos algoritmos de IA: desde un filtro de spam que ajusta su sospecha palabra a palabra, hasta un robot que revisa su mapa del entorno con cada nueva lectura de sus sensores.

## Explicación

### De la regla de multiplicación al teorema

En [[prob-condicional]] viste que la probabilidad conjunta se puede escribir de dos formas equivalentes: $P(A\cap B)=P(A|B)\cdot P(B) = P(B|A)\cdot P(A)$. Despejando $P(A|B)$ de esa igualdad se obtiene el **teorema de Bayes**: una forma de invertir el sentido de una probabilidad condicional, pasando de "cuánto explica $B$ la hipótesis $A$" a "cuánto de probable es $A$ sabiendo $B$".

### Prior, verosimilitud y posterior

El teorema organiza el razonamiento en tres piezas. El **prior**, $P(A)$, es la creencia antes de observar nada: por ejemplo, que el 1% de la población tiene una enfermedad. La **verosimilitud**, $P(B|A)$, mide cuánto encaja la evidencia observada con la hipótesis: si la enfermedad produce un resultado positivo en el 95% de los casos, esa cifra es la verosimilitud del positivo dado que hay enfermedad. El resultado, el **posterior**, $P(A|B)$, es la creencia revisada tras incorporar la evidencia. El denominador $P(B)$ actúa como normalizador: reparte el peso entre todas las hipótesis posibles para que las probabilidades sigan sumando uno.

### Un ciclo, no un cálculo aislado

Lo interesante es que este proceso no termina en una sola actualización. El posterior de hoy puede convertirse en el prior de mañana en cuanto llegue una evidencia nueva. Así, Bayes describe un aprendizaje progresivo: cada observación afina un poco más la creencia, en vez de sustituirla de golpe.

### Por qué importa en inteligencia artificial

El caso más directo es el clasificador [[naive-bayes|Naive Bayes]], que aplica el teorema asumiendo independencia condicional entre las características (por ejemplo, las palabras de un correo) dada la clase. Las [[redes-bayesianas|redes bayesianas]] generalizan la idea a sistemas con muchas variables relacionadas, representando explícitamente qué depende de qué. Y aunque no siempre se nombre así, la lógica bayesiana subyace en muchos algoritmos de aprendizaje: la verosimilitud mide qué tan bien un modelo explica los datos observados, y añadir regularización a los parámetros equivale a imponerles un prior.

## Formalización

$$
P(A|B) = \frac{P(B|A)\cdot P(A)}{P(B)}
$$

donde:

- $P(A|B)$ es el **posterior**: la probabilidad de la hipótesis $A$ tras observar la evidencia $B$.
- $P(A)$ es el **prior**: la probabilidad de $A$ antes de observar nada.
- $P(B|A)$ es la **verosimilitud**: la probabilidad de observar la evidencia $B$ si $A$ fuese cierta.
- $P(B)$ es la probabilidad total de la evidencia, que normaliza el resultado para que las probabilidades de todas las hipótesis sumen uno.

**Ejemplo numérico (test diagnóstico):** una enfermedad tiene una prevalencia (prior) $P(D)=0{,}01$. El test tiene sensibilidad $P(\text{pos}|D)=0{,}95$ y especificidad $0{,}9$, así que $P(\text{pos}|\bar D)=1-0{,}9=0{,}1$. La probabilidad total de un positivo es

$$
P(\text{pos}) = P(\text{pos}|D)\cdot P(D) + P(\text{pos}|\bar D)\cdot P(\bar D) = 0{,}95\cdot 0{,}01 + 0{,}1\cdot 0{,}99 = 0{,}1085
$$

y el posterior queda

$$
P(D|\text{pos}) = \frac{0{,}95\cdot 0{,}01}{0{,}1085} \approx 0{,}0876
$$

Aunque el test dé positivo, la probabilidad de estar enfermo sube del 1% a solo el 8,76%, porque la enfermedad es rara y los falsos positivos (el 10% de la gente sana) pesan mucho frente a los pocos casos reales.

## Interactivo

```widget
motor: probabilidad
modo: test
valores: {"prevalencia": 0.01, "sensibilidad": 0.95, "especificidad": 0.9}
```

- Prueba a subir la prevalencia del 1% al 20% sin tocar nada más: fíjate en cuánto sube el posterior aunque la prueba no haya cambiado.
- Prueba a bajar la especificidad (más falsos positivos) y observa cómo se hunde la probabilidad de estar realmente enfermo tras un positivo.
- Prueba a calcular a mano $P(D|\text{pos})$ con otros valores antes de comprobarlo en los 1000 puntos.

## En código

```python
def bayes(prior, verosimilitud, verosimilitud_contraria):
    p_evidencia = verosimilitud * prior + verosimilitud_contraria * (1 - prior)
    return verosimilitud * prior / p_evidencia

# Test diagnóstico: prevalencia 1%, sensibilidad 95%, especificidad 90%
posterior = bayes(prior=0.01, verosimilitud=0.95, verosimilitud_contraria=0.10)
print(round(posterior, 4))  # 0.0876
```

## Errores típicos

- **Error**: confundir $P(B|A)$ con $P(A|B)$, por ejemplo creer que "el 95% de los positivos están enfermos" cuando en realidad esa cifra es la sensibilidad. → **Correcto**: son dos probabilidades distintas; el teorema de Bayes existe precisamente para pasar de una a otra.
- **Error**: ignorar el prior y quedarse solo con la verosimilitud, concluyendo que un positivo implica alta probabilidad de enfermedad. → **Correcto**: con una enfermedad rara, incluso una prueba buena produce muchos falsos positivos en términos relativos; el posterior depende tanto del prior como de la verosimilitud.
- **Error**: pensar que el posterior sustituye al prior de forma permanente, ignorando evidencias futuras. → **Correcto**: el posterior de una observación se convierte en el prior de la siguiente; la actualización es continua.
- **Error**: olvidar normalizar por $P(B)$ y comparar directamente $P(B|A)\cdot P(A)$ entre hipótesis sin ajustarlo. → **Correcto**: para obtener probabilidades válidas que sumen uno hace falta dividir entre $P(B)$, aunque para solo comparar qué hipótesis es más probable a veces basta con el numerador.

## En resumen

- **Qué es:** una fórmula para invertir una probabilidad condicional y actualizar una creencia con nueva evidencia.
- **Cómo funciona:** combina un prior (creencia inicial), una verosimilitud (qué tan bien la evidencia encaja con la hipótesis) y un normalizador para producir un posterior.
- **Fórmula clave:** $P(A|B) = \dfrac{P(B|A)\cdot P(A)}{P(B)}$.
- **Cuándo usarlo:** siempre que haya que combinar una hipótesis previa con una observación, como en diagnóstico, clasificación o filtrado de spam.
- **Decisiones que importan:** el prior debe reflejar la realidad (una enfermedad rara sigue siendo rara aunque el test sea bueno); la verosimilitud debe estimarse con datos fiables.
- **Trampa principal:** confundir la verosimilitud $P(B|A)$ con el posterior $P(A|B)$; son números distintos y con un prior extremo pueden diferir muchísimo.

## A fondo

### El ejemplo del caballo y la cebra

Un caso útil para intuir el peso del prior: si en una región el 99% de los animales son caballos y el 1% cebras, ver un animal con manchas que parecen rayas no debería hacerte concluir de inmediato que es una cebra. Aunque las rayas son una evidencia a favor de "cebra" (alta verosimilitud), el prior tan desequilibrado hacia "caballo" sigue pesando mucho en el resultado final: el posterior combina ambas cosas, no se queda solo con la evidencia más llamativa. Es el mismo mecanismo que en el test diagnóstico: una evidencia fuerte no basta para desmontar un prior muy sesgado.

### Bayes como marco general del aprendizaje

Bajo una lectura amplia, buena parte del aprendizaje automático puede describirse en términos bayesianos: los datos observados juegan el papel de evidencia, la función de pérdida está ligada a la verosimilitud (qué tan bien el modelo explica esos datos) y técnicas como la regularización equivalen a imponer un prior sobre los parámetros que penaliza valores poco plausibles. No todos los algoritmos se plantean explícitamente así, pero la lógica de "combinar una preferencia previa con la evidencia de los datos" reaparece una y otra vez.

## Autoevaluación

### Un test de embarazo tiene sensibilidad del 99% y especificidad del 99%. Si se aplica a una mujer con un 50% de probabilidad previa de estar embarazada, ¿qué esperas del posterior tras un positivo?
- [ ] Mucho más bajo que el 99%, porque el prior arrastra el resultado hacia abajo.
- [x] Muy cercano al 99%, porque con un prior equilibrado (50%) el resultado depende casi solo de la calidad del test.
- [ ] Exactamente el 50%, porque el test no aporta información nueva.
> Por qué: el prior de 50% no penaliza ni favorece ninguna hipótesis de partida, así que el posterior queda dominado por la verosimilitud; el efecto dramático de "test bueno, posterior bajo" solo aparece con priors muy desequilibrados, como una enfermedad rara.

### En la fórmula de Bayes, ¿qué papel juega $P(B)$, la probabilidad de la evidencia?
- [ ] Es la probabilidad de la hipótesis antes de observar nada.
- [x] Normaliza el resultado para que las probabilidades posteriores de todas las hipótesis sumen uno.
- [ ] Mide cuánto explica la hipótesis a la evidencia.
> Por qué: $P(B)$ no habla de una hipótesis concreta, sino de la evidencia en general (sumada sobre todas las hipótesis posibles); dividir por ella es lo que convierte el numerador en una probabilidad válida.

### Un filtro de spam calcula $P(\text{Spam})=0{,}2$ y, tras ver la palabra "oferta", obtiene $P(\text{Spam}|\text{oferta})=0{,}75$. ¿Qué representa el 0,75?
- [ ] La verosimilitud de que un correo de spam contenga la palabra "oferta".
- [x] El posterior: la probabilidad actualizada de spam tras observar la palabra.
- [ ] El prior original, sin cambios.
> Por qué: el 0,75 es el resultado final del teorema de Bayes tras combinar el prior (0,2) con la verosimilitud de la palabra; la verosimilitud sería, en cambio, $P(\text{oferta}|\text{Spam})$, un número distinto.

## Glosario

- **Prior**: probabilidad de una hipótesis antes de observar ninguna evidencia, $P(A)$.
- **Verosimilitud**: probabilidad de observar la evidencia si la hipótesis fuese cierta, $P(B|A)$.
- **Posterior**: probabilidad revisada de la hipótesis tras observar la evidencia, $P(A|B)$.
- **Normalizador**: la probabilidad total de la evidencia, $P(B)$, que hace que los posteriores de todas las hipótesis sumen uno.
