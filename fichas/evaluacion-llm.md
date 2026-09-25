---
id: evaluacion-llm
estado: borrador
---

## En una frase

Evaluar un LLM exige varias métricas distintas, porque generar texto fluido no es lo mismo que generar texto correcto, imparcial y no dañino.

## Intuición

Piensa en corregir un examen oral. Podrías fijarte solo en si el alumno habla con fluidez y sin dudar, pero eso no te dice si lo que dice es verdad. Con un LLM pasa algo parecido: un modelo puede sonar seguro y coherente y, aun así, inventarse datos o repetir sesgos que aprendió de su entrenamiento.

Por eso no existe una única métrica que valga para todo. Unas miden si el texto "suena bien" (fluidez, coherencia), otras si el contenido es verificable (factualidad), y otras si el modelo es seguro y justo (sesgos, toxicidad). Ninguna sustituye a las demás.

## Explicación

### Medir si el texto "suena bien": métricas tradicionales

Las primeras métricas de generación de texto comparan el texto generado con un texto de referencia escrito por humanos. La **perplexity** mide la incertidumbre del modelo al predecir la siguiente palabra de una secuencia: cuanto menor es su valor, más probabilidad asigna el modelo a secuencias coherentes con el lenguaje. **BLEU** y **ROUGE** comparan, en cambio, la superposición de n-gramas entre el texto generado y uno de referencia, y se usan sobre todo en traducción automática y resumen de textos.

Estas métricas funcionan bien en tareas estructuradas con una respuesta de referencia clara, pero fallan en generación abierta: un texto puede ser correcto, creativo y útil sin parecerse palabra a palabra a la referencia.

### Medir si el contenido es cierto: factualidad y razonamiento

A medida que los LLMs generan respuestas más convincentes, se ha vuelto crítico comprobar si son también correctas. **TruthfulQA** evalúa si un modelo evita alucinaciones y responde con información verificable. **MMLU** mide su desempeño en un amplio conjunto de tareas de comprensión (matemáticas, lógica, razonamiento crítico). **BIG-bench** analiza su capacidad para hacer inferencias complejas, y **HELM** ofrece una evaluación integral que también considera diversidad lingüística y equidad.

Estos benchmarks han mostrado que un LLM puede generar **alucinaciones**: información incorrecta expresada con alta confianza. Una de las técnicas usadas para reducir este problema es afinar el modelo con retroalimentación humana (ver [[rlhf]]).

### Medir si el modelo es seguro y justo

Más allá de precisión y factualidad, evaluar un LLM implica revisar **sesgos** heredados de sus datos de entrenamiento (que pueden reflejar y amplificar patrones discriminatorios de la sociedad) y **toxicidad** en sus respuestas. Herramientas como Perspective API estiman el grado de toxicidad de un texto generado, y se complementan con el filtrado de los datos de entrenamiento.

## Formalización

$$
PP(W) = \exp\left(-\frac{1}{N}\sum_{i=1}^{N} \log P(w_i \mid w_1,\dots,w_{i-1})\right)
$$

donde:

- $W$ es la secuencia de $N$ palabras (o tokens) que se evalúa.
- $N$ es el número de palabras de la secuencia.
- $P(w_i \mid w_1,\dots,w_{i-1})$ es la probabilidad que el modelo asigna a la palabra $i$ dado el contexto anterior.
- $\exp$ es la función exponencial.
- $PP(W)$ es la perplexity: cuanto más baja, mayor probabilidad asigna el modelo a la secuencia real.

## En código

```python
import numpy as np

# Probabilidades que el modelo asigna a cada palabra real de una frase de 4 palabras
probs = np.array([0.8, 0.6, 0.9, 0.7])
log_probs = np.log(probs)
perplexity = np.exp(-np.mean(log_probs))
print(round(perplexity, 3))
# 1.349 — cuanto más se acerquen las probabilidades a 1, menor será la perplexity
```

## Errores típicos

- **Error**: pensar que una perplexity baja garantiza un buen texto generado. → **Correcto**: mide ajuste probabilístico del modelo, no coherencia semántica ni factualidad.
- **Error**: usar BLEU o ROUGE para evaluar generación abierta y creativa. → **Correcto**: comparan solapamiento de n-gramas con una referencia fija, y penalizan respuestas válidas que simplemente están redactadas de otra forma.
- **Error**: confundir seguridad al responder con corrección. → **Correcto**: un LLM puede alucinar información falsa con mucha confianza; por eso existen benchmarks de factualidad como TruthfulQA.

## En resumen

- **Qué mide:** si un LLM genera texto fluido (perplexity, BLEU, ROUGE), factualmente correcto (TruthfulQA, MMLU, BIG-bench, HELM) y seguro (sesgos, toxicidad).
- **Perplexity:** cuanto más baja, más probabilidad asigna el modelo a la secuencia real; no mide verdad ni calidad semántica.
- **BLEU/ROUGE:** comparan n-gramas con una referencia; útiles en traducción y resumen, limitados en generación abierta.
- **Factualidad:** TruthfulQA y MMLU detectan alucinaciones y errores de razonamiento que la fluidez no revela.
- **Riesgos adicionales:** sesgos heredados de los datos y toxicidad en las respuestas, medidos con herramientas como Perspective API.
- **Trampa principal:** un texto fluido y seguro de sí mismo no implica que sea correcto.

## A fondo

Estos desafíos han impulsado marcos de control para el uso responsable de LLMs: iniciativas regulatorias como el AI Act de la Unión Europea buscan establecer criterios de transparencia y seguridad, mientras que proyectos de alineamiento como los de OpenAI trabajan en diseñar arquitecturas más seguras y alineadas con principios éticos.

## Autoevaluación

### Un LLM responde con mucha seguridad a una pregunta histórica, pero el dato que da es falso. ¿Qué tipo de fallo es este?
- [ ] Una perplexity alta.
- [x] Una alucinación.
- [ ] Un problema de BLEU.
> Por qué: generar información incorrecta con alta confianza es la definición de alucinación; la perplexity mide otra cosa (la incertidumbre en la predicción de palabras).

### ¿Por qué BLEU y ROUGE son limitadas para evaluar generación abierta de texto?
- [ ] Porque solo funcionan con modelos muy pequeños.
- [x] Porque comparan solapamiento de palabras con una única referencia, sin considerar coherencia semántica ni respuestas válidas distintas de esa referencia.
- [ ] Porque no se pueden calcular de forma automática.
> Por qué: ambas métricas cuentan coincidencias de n-gramas con un texto de referencia, así que penalizan respuestas correctas que simplemente están escritas de otra manera.

### Si quieres saber si un modelo tiende a inventar datos, ¿qué tipo de benchmark es más adecuado?
- [ ] BLEU, porque mide fluidez.
- [ ] Perplexity, porque mide probabilidad.
- [x] TruthfulQA, porque evalúa específicamente si las respuestas son veraces.
> Por qué: TruthfulQA está diseñado para detectar alucinaciones y respuestas no verificables, algo que las métricas de fluidez no capturan.

## Glosario

- **Perplexity**: métrica que mide la incertidumbre de un modelo al predecir la siguiente palabra; menor valor indica mejor ajuste al lenguaje.
- **BLEU / ROUGE**: métricas que comparan la superposición de n-gramas entre un texto generado y uno de referencia.
- **Alucinación**: información incorrecta que un LLM genera con apariencia de certeza.
- **TruthfulQA**: benchmark que evalúa si un LLM responde con información verificable, evitando alucinaciones.
- **MMLU**: benchmark que mide el desempeño de un LLM en un amplio conjunto de tareas de comprensión del lenguaje.
