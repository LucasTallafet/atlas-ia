# Atlas de IA

**Una web de estudio de inteligencia artificial: 138 conceptos, desde el álgebra lineal hasta los LLM, conectados en un mapa de requisitos y explicados con intuición, fórmulas, interactivos y autoevaluación.**

🔗 **Web:** https://lucastallafet.github.io/atlas-ia/

---

## Qué es

El Atlas convierte unas 460.000 palabras de apuntes de un curso de especialización en IA y Big Data (tres repositorios) en una herramienta de estudio **densa, explorable, interactiva y clara**. Cada concepto tiene **una sola ficha**, y todas siguen la misma estructura:

| Sección | Para qué sirve |
|---|---|
| **En una frase** | La idea completa, entendible sin saber nada previo |
| **Intuición** | Una analogía y por qué importa en IA |
| **Explicación** | Del problema a la idea y de la idea al nombre |
| **Formalización** | Fórmulas con cada símbolo explicado |
| **Interactivo** | Un simulador manipulable y retos "Prueba a…" |
| **En código** | Un ejemplo mínimo en Python que se ejecuta de verdad |
| **Errores típicos** | Los malentendidos habituales y su corrección |
| **En resumen** | Una chuleta práctica que se entiende sola (es lo que muestra la vista *Esencial*) |
| **A fondo** | Los matices y variantes, plegados para no abrumar |
| **Autoevaluación** | Preguntas que obligan a razonar, con explicación de cada respuesta |
| **Glosario** | Los términos que introduce la ficha |

## Qué puedes hacer en la web

- **App Android instalable y sin conexión.** Desde Chrome puedes instalarla como app (icono, pantalla completa, atajos a Repaso, Rutas y Glosario); tras la primera visita funciona sin red y avisa cuando hay una versión nueva.
- **Constelación** (solo escritorio; en móvil el mapa abre en «Por bloques»). Un mapa de fuerzas de los 138 conceptos agrupados por bloque. Al seleccionar un concepto se iluminan su cadena de requisitos, lo que desbloquea y sus conexiones. Incluye filtro por bloques, zoom y panel de detalle. También hay una vista alternativa por columnas.
- **Rutas de estudio.** Diagramas de red por capas que llevan hasta un objetivo (por ejemplo, "de las matemáticas a las redes neuronales"), con el siguiente paso recomendado según tu progreso.
- **Vista Completa / Esencial.** La ficha entera o su resumen práctico.
- **20 motores interactivos**, escritos sin librerías: descenso de gradiente, K-Means paso a paso, umbral de clasificación con curva ROC, convolución, atención de un Transformer, Q-learning en una rejilla, redes bayesianas y muchos más.
- **Glosario** con todos los conceptos y términos, índice A-Z y desambiguación de las palabras que significan cosas distintas según el tema (por ejemplo, "normalización").
- **Repaso espaciado** (cajas de Leitner) con las preguntas de las fichas que ya has visto.
- **Progreso** guardado en el navegador, que se puede exportar e importar. Tema claro y oscuro, y diseño adaptado al móvil.

## Contenido

| Bloque | Temas |
|---|---|
| B1 · Fundamentos matemáticos | Vectores, matrices, SVD, derivadas y gradiente, probabilidad, Bayes, distribuciones, inferencia |
| B2 · Fundamentos de IA y ML | Historia y paradigmas, pérdidas, descenso de gradiente, generalización, validación, métricas |
| B3 · ML clásico | EDA, preprocesamiento, regresión, KNN, SVM, árboles, ensembles y boosting, clustering |
| B4 · Deep Learning | Perceptrón, MLP, retropropagación, optimizadores, CNN, RNN/LSTM, autoencoders, GAN |
| B5 · Aprendizaje por refuerzo | MDP, Bellman, programación dinámica, Monte Carlo, TD, SARSA/Q-learning, REINFORCE |
| B6 · NLP y LLMs | Texto y tokenización, TF-IDF, embeddings, atención, Transformer, BERT/GPT, fine-tuning, RAG |
| B7 · Razonamiento simbólico | Ontologías, sistemas expertos, lógica difusa, redes bayesianas |
| B8 · Producción, ética y aplicaciones | Despliegue, drift, MLOps, explicabilidad, sesgos, regulación (AI Act) |

El contenido que no estaba en los apuntes originales (por ejemplo SVM, XGBoost/LightGBM, MLOps o SHAP) va marcado como **Ampliación** e incluye sus fuentes. Cuando se detectó un error en el material de origen, se corrigió y la corrección queda indicada en la propia ficha.

## Cómo se construyó

El proyecto se diseñó para que un modelo de lenguaje (Claude Code) redactara las fichas por lotes. Todo el control de calidad lo hacen scripts deterministas, no el propio modelo.

1. **Inventario de conceptos** (`inventario.json`). Los 138 conceptos, con sus fuentes exactas (archivo y sección), sus requisitos, el motor interactivo que usan y el lote al que pertenecen. Los temas que se repetían en varios apuntes se **fusionan** en una sola ficha o se **enlazan**. El texto fuente se reparte de forma exclusiva: cada línea pertenece a un único concepto, y el 99 % del material queda asignado.
2. **Extractor** (`tools/extraer.py`). Entrega al modelo solo el texto de las fichas del lote, no los repositorios enteros. Así se reduce el coste y se evita que un concepto se contamine con otro.
3. **Validador** (`tools/build.py`). Rechaza fichas con secciones fuera de orden, fórmulas mal cerradas, preguntas sin una única respuesta correcta, enlaces a conceptos inexistentes, código Python que no se ejecuta o interactivos mal configurados. Después genera los datos de la web.
4. **Pruebas en navegador** (`tools/probar_web.py`, con Playwright). Abre cada ficha y cada vista en escritorio y en móvil, y detecta errores de consola, fórmulas sin renderizar e interactivos vacíos.
5. **Autopiloto** (`tools/autopiloto.py`). Encadena las sesiones de trabajo, cada una con el contexto limpio. Verifica cada resultado con los scripts, reintenta lo que falla y se pausa y reanuda según el cupo de uso. Cada paso queda registrado en `DECISIONES.md` y en un commit.

Las reglas de redacción (claridad, notación unificada, fidelidad a la fuente) están en `CLAUDE.md`, y la especificación de la web en `ESPEC-WEB.md`.

## Estructura del repositorio

```
docs/            La web estática (GitHub Pages): index.html, app.js, mapa.js, estilos.css, motores/, datos/
fichas/          Las 138 fichas en Markdown
tools/           Extractor, validador, pruebas en navegador, autopiloto y utilidades
inventario.json  Conceptos, fuentes, requisitos y lotes
widgets.json     Catálogo de motores interactivos y sus parámetros
CLAUDE.md        Reglas de redacción y de trabajo
ESPEC-WEB.md     Especificación de la web y del contrato de los motores
DECISIONES.md    Registro de decisiones y correcciones
```

## Uso en local

La web no necesita servidor: abre `docs/index.html` con doble clic. También funciona sin conexión.

Para regenerar o validar el contenido (Python 3.10+):

```bash
python tools/preparar.py              # clona las fuentes en commits fijos e instala dependencias
python tools/build.py                 # valida las fichas y regenera docs/datos/
python tools/build.py --estricto      # los avisos también cuentan como errores
python tools/probar_web.py --todas    # prueba todas las fichas en un navegador sin interfaz
```

Tecnología: HTML, CSS y JavaScript sin frameworks; MathJax 3 (SVG) para las fórmulas; Python para el pipeline.

## Créditos y licencia

El contenido deriva de los apuntes de [sebamendoza-eusa](https://github.com/sebamendoza-eusa):
- [matematicas-IA](https://github.com/sebamendoza-eusa/matematicas-IA)
- [ml_101_2025](https://github.com/sebamendoza-eusa/ml_101_2025)
- [modelos_ia_101_2025](https://github.com/sebamendoza-eusa/modelos_ia_101_2025)

Los tres se publican bajo **GPL-3.0**. Cada ficha enlaza a las secciones exactas de las que procede.

Este proyecto se distribuye bajo la misma licencia, **GPL-3.0** (ver `LICENSE`).

Diseño del proyecto y dirección: **Lucas Tallafet Pérez**. Redacción y código generados con Claude Code bajo las reglas y los controles descritos arriba.
