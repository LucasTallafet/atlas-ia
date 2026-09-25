---
id: llms
estado: borrador
---

## En una frase

Un LLM es una red Transformer entrenada de forma autosupervisada sobre volúmenes masivos de texto, cuya escala en parámetros y datos hace emerger capacidades que nadie programó explícitamente.

## Intuición

Un taller pequeño con pocas herramientas solo puede fabricar piezas simples, por bien organizado que esté. Una fábrica gigantesca, con miles de máquinas trabajando juntas, no solo fabrica más piezas: empieza a poder montar productos que ninguna máquina individual sabría construir por sí sola, simplemente porque la escala permite combinaciones nuevas. Con los **Grandes Modelos de Lenguaje (LLM)** pasa algo parecido: [[bert-encoders|BERT]], con 340 millones de parámetros, ya sabía representar el lenguaje muy bien, pero modelos como GPT-3, con cerca de 515 veces más parámetros, empezaron a mostrar habilidades —traducir entre idiomas que apenas vieron juntos, resolver problemas matemáticos sencillos— para las que nunca se entrenaron de forma explícita. Ese salto no es solo "más de lo mismo": es lo que se conoce como **capacidades emergentes**, y es la razón por la que la escala se convirtió en la variable central de la investigación en LLM.

## Explicación

### De los embeddings estáticos a los Transformers a gran escala

El camino hasta los LLM actuales pasa por varias etapas. Primero, los [[word-embeddings|embeddings estáticos]] (Word2Vec, GloVe) representaban cada palabra con un único vector, sin adaptarse al contexto. Después, las redes recurrentes ([[lstm-gru|LSTM y GRU]]) añadieron memoria secuencial, pero seguían teniendo dificultades con dependencias muy largas. El punto de inflexión llegó con el [[transformer|Transformer]] y su atención, que eliminó la dependencia del procesamiento estrictamente secuencial: [[bert-encoders|BERT]] aportó la comprensión bidireccional, y los modelos generativos como [[gpt-t5-generativos|GPT y T5]] consolidaron la idea de que escalar el número de parámetros mejora directamente la calidad del texto generado.

### Aprendizaje autosupervisado: entrenar sin etiquetas humanas

Los LLM no dependen de datos etiquetados a mano para su entrenamiento inicial: usan [[autoencoders|aprendizaje autosupervisado]], donde el propio texto genera la señal de entrenamiento —predecir una palabra oculta, predecir el siguiente token— sin intervención humana. Esto es lo que permite entrenarlos sobre corpus de un tamaño que sería inviable etiquetar manualmente.

### Escala y capacidades emergentes

El rendimiento de un LLM depende directamente de su número de parámetros y de la cantidad de datos de entrenamiento. La tabla siguiente resume esa progresión:

| Modelo | Año | Parámetros | Características principales |
|---|---|---|---|
| BERT | 2018 | 340 M | Aprendizaje bidireccional, preentrenamiento con MLM |
| GPT-2 | 2019 | 1,5 B | Generación de texto coherente, autorregresivo |
| T5 | 2020 | 11 B | Encoder-decoder para múltiples tareas de NLP |
| GPT-3 | 2020 | 175 B | *Zero-shot learning*, generación avanzada |
| PaLM | 2022 | 540 B | Optimización computacional, arquitectura escalable |
| GPT-4 | 2023 | >1 T (estimado) | Mejor razonamiento, capacidades multimodales |

Las **capacidades emergentes** son habilidades que no se programaron explícitamente pero surgen al superar cierta escala de parámetros y datos, como resolver problemas no vistos durante el entrenamiento o traducir entre pares de idiomas poco representados. Modelos como GPT-4, PaLM, LLaMA, Claude o Gemini comparten la base Transformer, pero difieren en cómo equilibran tamaño, datos y técnicas de entrenamiento: LLaMA, por ejemplo, demostró que es posible lograr un rendimiento competitivo con muchos menos parámetros que GPT-3, entrenando con más datos por parámetro.

### De preentrenamiento a especialización

El entrenamiento de un LLM sigue dos fases. Primero, un **preentrenamiento** masivo y autosupervisado sobre grandes volúmenes de texto, donde el modelo adquiere conocimiento general del lenguaje. Después, el modelo puede especializarse mediante [[fine-tuning]] con conjuntos de datos más pequeños y específicos; en modelos conversacionales como ChatGPT, ese ajuste incluye además aprendizaje por refuerzo a partir de retroalimentación humana ([[rlhf|RLHF]]), que alinea las respuestas del modelo con las preferencias de las personas que las evalúan.

## Formalización

No aplica: la escala de un LLM (número de parámetros, volumen de datos) es una decisión de arquitectura e infraestructura, no una fórmula nueva. La factorización de probabilidad del modelado autorregresivo que comparten estos modelos ya se formalizó en [[gpt-t5-generativos]].

## Interactivo

```widget
motor: funcion
modo: "barras"
datos: {"etiquetas": ["BERT (2018)", "GPT-2 (2019)", "T5 (2020)", "GPT-3 (2020)", "PaLM (2022)", "GPT-4 (2023, est.)"], "series": [{"nombre": "parámetros", "valores": [340000000, 1500000000, 11000000000, 175000000000, 540000000000, 1000000000000]}]}
escala_log: true
```

- Prueba a activar y desactivar la escala logarítmica: sin ella, las barras de BERT y GPT-2 casi desaparecen frente a las de PaLM o GPT-4; ¿por qué es más útil una escala logarítmica para comparar estos seis modelos?
- Prueba a estimar de cabeza cuántas veces más parámetros tiene GPT-3 que BERT antes de comprobarlo con el valor exacto (175 000 M / 340 M).
- Prueba a imaginar la barra de un modelo con 10 veces más parámetros que GPT-4: ¿cuánto se desplazaría en la escala logarítmica frente a en la escala lineal?

## Errores típicos

- **Error**: pensar que un LLM es "solo un BERT o un GPT más grande" sin ningún cambio cualitativo → **Correcto**: al superar cierta escala aparecen capacidades emergentes —comportamientos no programados explícitamente— que no se observan simplemente extrapolando el rendimiento de modelos más pequeños.
- **Error**: creer que los LLM necesitan datos etiquetados a mano desde el principio → **Correcto**: el preentrenamiento es autosupervisado, sin etiquetas humanas; los datos etiquetados solo entran en juego en la fase posterior de fine-tuning o alineación.
- **Error**: asumir que más parámetros siempre significa mejor modelo, sin importar los datos → **Correcto**: el rendimiento depende tanto del número de parámetros como del volumen y la calidad de los datos de entrenamiento; LLaMA demostró que más datos por parámetro puede compensar tener menos parámetros.

## En resumen

- Un LLM es un Transformer entrenado de forma autosupervisada sobre grandes volúmenes de texto, sin necesitar etiquetas humanas en el preentrenamiento.
- La escala (parámetros y datos) es la variable central: de BERT (340 M) a GPT-4 (más de 1 billón estimado) hay varios órdenes de magnitud de diferencia.
- Las capacidades emergentes son habilidades no programadas explícitamente que aparecen al superar cierta escala, no una mejora gradual y predecible.
- El entrenamiento tiene dos fases: preentrenamiento autosupervisado masivo y, después, especialización mediante [[fine-tuning]] (y a veces [[rlhf|RLHF]] para alinear el modelo con preferencias humanas).
- Trampa principal: confundir "modelo más grande" con "modelo mejor en todo"; la escala interactúa con la cantidad y calidad de los datos, no actúa sola.

## A fondo

Entrenar e inferir con modelos de cientos de miles de millones de parámetros exige técnicas específicas de eficiencia: el **entrenamiento distribuido** reparte el cómputo entre múltiples GPUs, la **cuantización** reduce la precisión numérica de los pesos (por ejemplo, de 32 a 8 bits) para ahorrar memoria con una pérdida de precisión limitada, y **Mixture of Experts (MoE)** activa solo un subconjunto de "expertos" internos del modelo en cada inferencia, en vez de toda la red, reduciendo el coste computacional sin reducir la capacidad total del modelo. Estas técnicas son las que han hecho viable entrenar y desplegar modelos cuya escala, de otro modo, sería inabordable incluso para grandes infraestructuras.

## Autoevaluación

### Un modelo de 500 millones de parámetros resuelve correctamente problemas de traducción entre dos idiomas que nunca vio combinados durante el entrenamiento. ¿Cómo se llama este tipo de comportamiento?
- [ ] Sobreajuste.
- [x] Capacidad emergente: una habilidad no programada explícitamente que aparece como consecuencia de la escala del modelo y sus datos.
- [ ] Aprendizaje supervisado clásico.
> Por qué: las capacidades emergentes son comportamientos que el modelo no fue entrenado explícitamente a realizar, pero que surgen al superar cierta escala de parámetros y datos; no son errores ni el resultado directo de una tarea supervisada específica.

### ¿Por qué el preentrenamiento de un LLM no necesita datos etiquetados por humanos?
- [ ] Porque los LLM no aprenden nada durante el preentrenamiento.
- [x] Porque usa aprendizaje autosupervisado: el propio texto (predecir una palabra oculta o el siguiente token) genera la señal de entrenamiento, sin anotación manual.
- [ ] Porque los datos etiquetados solo existen para tareas de visión, no de texto.
> Por qué: el aprendizaje autosupervisado obtiene las etiquetas del propio dato de entrada (la palabra oculta o siguiente es la "etiqueta"), lo que permite entrenar sobre volúmenes de texto que sería inviable etiquetar a mano.

### Al representar el número de parámetros de BERT, GPT-3 y GPT-4 en una gráfica de barras, ¿por qué conviene usar una escala logarítmica en vez de lineal?
- [ ] Porque la escala logarítmica es obligatoria en cualquier gráfica de barras.
- [x] Porque la diferencia entre 340 millones y más de un billón de parámetros es de varios órdenes de magnitud; en escala lineal, los modelos más pequeños serían visualmente indistinguibles de cero.
- [ ] Porque en escala logarítmica los valores negativos se representan mejor.
> Por qué: cuando los valores a comparar abarcan varios órdenes de magnitud, una escala logarítmica reparte el espacio visual de forma proporcional a los múltiplos, permitiendo comparar modelos pequeños y grandes en la misma gráfica.

## Glosario

- **capacidades emergentes**: habilidades que un modelo no fue entrenado explícitamente a realizar, pero que aparecen como consecuencia de superar cierta escala de parámetros y datos.
- **cuantización**: técnica que reduce la precisión numérica de los pesos de un modelo (por ejemplo, de 32 a 8 bits) para reducir su consumo de memoria y acelerar la inferencia.
- **Mixture of Experts (MoE)**: arquitectura que activa solo un subconjunto de módulos ("expertos") internos en cada inferencia, en vez de toda la red, reduciendo el coste computacional sin reducir la capacidad total.
