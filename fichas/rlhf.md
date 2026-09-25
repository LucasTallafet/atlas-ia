---
id: rlhf
estado: borrador
---

## En una frase

El RLHF afina un modelo de lenguaje ya preentrenado usando evaluaciones humanas como señal de recompensa, para que sus respuestas se ajusten mejor a lo que la gente considera correcto y útil.

## Intuición

Imagina que un aprendiz ya sabe redactar informes, pero su tutor todavía tiene que revisarlos: le indica cuáles están bien, cuáles se quedan cortos y cuáles se pasan de la raya. Con el tiempo, el aprendiz interioriza ese criterio y escribe informes cada vez más alineados con lo que el tutor espera, sin que nadie le reescriba el informe entero cada vez.

El **RLHF** (*Reinforcement Learning from Human Feedback*, aprendizaje por refuerzo con retroalimentación humana) hace algo parecido con un [[llms|LLM]]: parte de un modelo ya preentrenado y lo ajusta usando las evaluaciones y correcciones de instructores humanos, en vez de reentrenarlo desde cero.

## Explicación

### Por qué preentrenar no basta

Un LLM preentrenado genera texto fluido y coherente, pero eso no garantiza que sus respuestas sean las más útiles, precisas o adecuadas para una tarea concreta. En dominios donde la precisión es crítica —medicina, derecho, investigación científica— hace falta algo más que fluidez.

### El proceso: evaluar, corregir, ajustar

El ajuste con RLHF es iterativo: expertos humanos evalúan y corrigen las respuestas que genera el modelo, y esa retroalimentación se convierte en una señal que guía el reajuste del modelo. Es un tipo de [[fine-tuning|ajuste fino]] particular: no usa un conjunto fijo de ejemplos etiquetados de antemano, sino preferencias humanas sobre las propias respuestas del modelo.

### Cómo se traduce el feedback humano en un ajuste del modelo

Aquí es donde RLHF conecta con el aprendizaje por refuerzo. Las evaluaciones humanas se convierten en una recompensa: las respuestas mejor valoradas reciben una recompensa alta, y las peor valoradas, una baja. El modelo se trata entonces como una política ($\pi_\theta$, ver [[policy-gradient]]) que genera respuestas, y sus parámetros se ajustan con **gradiente de la política** para aumentar la probabilidad de generar respuestas del tipo que los humanos valoraron mejor.

## Formalización

$$
\theta \leftarrow \theta + \eta \, \mathbb{E}_{y \sim \pi_\theta}\big[r(y) \, \nabla_\theta \log \pi_\theta(y \mid x)\big]
$$

donde:

- $\theta$ son los parámetros del LLM, partiendo de un modelo ya preentrenado y afinado (ver [[fine-tuning]]).
- $\pi_\theta(y \mid x)$ es la política: la probabilidad que el modelo asigna a generar la respuesta $y$ dada la instrucción $x$.
- $r(y)$ es la recompensa asignada a la respuesta $y$, estimada a partir de las evaluaciones o correcciones humanas.
- $\eta$ es la tasa de aprendizaje.
- $\nabla_\theta$ es el gradiente respecto a los parámetros del modelo.

Esta es la misma actualización de gradiente de la política de [[policy-gradient]]; lo único específico de RLHF es de dónde sale $r(y)$: de la evaluación humana, no de una recompensa numérica predefinida.

## Errores típicos

- **Error**: pensar que RLHF sustituye al preentrenamiento. → **Correcto**: parte de un modelo ya preentrenado y afinado; solo refina su comportamiento, no lo construye desde cero.
- **Error**: creer que el humano modifica los pesos del modelo directamente. → **Correcto**: el humano evalúa o corrige respuestas; esa señal se convierte en una recompensa que actualiza el modelo mediante gradiente de la política.
- **Error**: pensar que RLHF garantiza respuestas siempre correctas. → **Correcto**: mejora la alineación con las preferencias humanas, pero no elimina errores factuales (ver [[evaluacion-llm]]).

## En resumen

- **Qué es:** afinar un LLM ya preentrenado usando evaluaciones humanas como señal de recompensa.
- **Cómo funciona:** 1) el modelo genera respuestas; 2) instructores humanos las evalúan o corrigen; 3) esa retroalimentación se convierte en recompensa; 4) se actualiza el modelo con gradiente de la política para favorecer las respuestas mejor valoradas.
- **Fórmula clave:** la misma actualización de [[policy-gradient]], con $r(y)$ estimado a partir de evaluación humana.
- **Cuándo usarlo:** cuando la fluidez del preentrenamiento no basta y hace falta alinear las respuestas con criterios humanos de calidad, en especial en dominios sensibles.
- **Decisión clave:** cómo se recoge y se traduce la retroalimentación humana en una recompensa fiable.
- **Trampa principal:** RLHF alinea el estilo y el criterio de las respuestas, pero no convierte al modelo en infalible frente a errores factuales.

## A fondo

El ajuste con RLHF se ha aplicado sobre todo en dominios donde la precisión importa especialmente —medicina, derecho, investigación científica— y en sistemas de IA conversacional avanzada, donde ayuda a que el modelo responda de forma más precisa y ética en contextos sensibles.

## Autoevaluación

### ¿Qué papel juega exactamente el humano en RLHF?
- [ ] Escribe directamente los nuevos pesos del modelo.
- [x] Evalúa o corrige las respuestas generadas, y esa valoración se convierte en la señal de recompensa que guía el ajuste.
- [ ] Solo decide si el modelo se reentrena desde cero o no.
> Por qué: el humano no toca los parámetros; su evaluación se traduce en una recompensa que actualiza el modelo mediante gradiente de la política.

### RLHF se describe mejor como...
- [ ] Un tipo de preentrenamiento que sustituye al entrenamiento autosupervisado inicial.
- [x] Un ajuste fino que usa recompensas derivadas de evaluación humana en vez de un conjunto fijo de ejemplos etiquetados.
- [ ] Una métrica para evaluar la calidad de un LLM.
> Por qué: RLHF parte de un modelo ya preentrenado y afinado, y usa preferencias humanas como recompensa en lugar de datos etiquetados fijos; no es ni el preentrenamiento ni una métrica de evaluación.

### ¿Por qué RLHF no garantiza que un modelo deje de alucinar?
- [ ] Porque RLHF no cambia nada en el modelo.
- [x] Porque ajusta el modelo hacia lo que los humanos prefieren, pero eso no equivale a verificar la veracidad de cada respuesta.
- [ ] Porque RLHF solo se aplica a modelos de código.
> Por qué: RLHF alinea el comportamiento del modelo con preferencias humanas, pero la factualidad se evalúa y mejora con otras herramientas (ver [[evaluacion-llm]]).

## Glosario

- **RLHF (Reinforcement Learning from Human Feedback)**: ajuste de un modelo preentrenado usando evaluaciones humanas convertidas en señal de recompensa.
- **Recompensa ($r(y)$)**: valor que refleja qué tan bien valorada está una respuesta del modelo, estimado a partir de retroalimentación humana.
