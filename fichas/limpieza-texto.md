---
id: limpieza-texto
estado: borrador
---

## En una frase

Limpiar y normalizar un texto significa quitarle ruido (mayúsculas, puntuación, espacios sobrantes, palabras vacías) para que quede en un formato consistente antes de codificarlo.

## Intuición

Imagina que recibes cientos de formularios rellenados a mano, con tachones, mayúsculas sueltas, espacios de más y algún error ortográfico. Antes de introducir esos datos en una base de datos, alguien los revisa y homogeneiza: mismo formato de fecha, sin espacios raros, sin errores evidentes. La limpieza de texto en NLP es exactamente ese trabajo de revisión, aplicado a lenguaje: sin ella, un modelo trataría "Casa", "casa " y "caza" (por una errata) como si fueran conceptos completamente distintos, cuando en realidad son ruido sobre la misma idea. Cuanto más limpio y consistente esté el texto, menos "confusión" arrastrará el modelo que lo use después (ver [[nlp-intro]]).

## Explicación

### Por qué limpiar antes de codificar

Antes de convertir un texto en números (ver [[nlp-intro]]), conviene reducir el ruido que no aporta información para la tarea. La limpieza y el preprocesamiento se dividen en dos bloques: **limpieza** propiamente dicha (eliminar caracteres no deseados, unificar mayúsculas/minúsculas, quitar espacios sobrantes y, opcionalmente, corregir ortografía) y **preprocesamiento** (eliminar stop-words, normalizar sinónimos y formatos; la tokenización y la lematización o *stemming*, que también forman parte de esta fase, se tratan en [[tokenizacion]]). Qué pasos aplicar y en qué orden depende siempre de la tarea: no hay una receta única.

### Eliminar caracteres no deseados

Signos de puntuación, símbolos y números pueden ser ruido o información esencial, según el contexto. En un análisis de sentimientos sobre redes sociales, los emojis y hashtags de "¡Me encanta este producto! 😊❤️ #felicidad #compras" aportan carga emocional y conviene conservarlos, eliminando solo la puntuación sobrante. En un texto financiero como "el valor total del contrato es de \$1.200.000 con una tasa del 5% anual", en cambio, los números y símbolos de moneda son esenciales y solo se normaliza el formato (comas separadoras, etc.). La herramienta más flexible para esto son las **expresiones regulares** (`re` en Python): `r'[^\w\s]'` elimina puntuación, `r'\d+'` elimina números. Bibliotecas como `nltk` o `spaCy` ofrecen alternativas más semánticas, por ejemplo usando las etiquetas morfológicas de spaCy para distinguir puntuación, números y palabras relevantes.

### Unificar mayúsculas y minúsculas

Convertir todo el texto a minúsculas evita que "Casa" y "casa" se traten como palabras distintas, y en Python basta con `texto.lower()` (existen también `upper()`, `capitalize()` y `title()` para necesidades de formateo). Esta normalización es casi siempre útil en clasificación de texto o análisis de sentimientos, pero puede ser contraproducente en **NER** (reconocimiento de entidades nombradas): en "Microsoft anunció una colaboración con Apple Inc.", las mayúsculas son justo la pista que delata los nombres propios, así que ahí conviene conservarlas.

### Eliminar espacios innecesarios

Espacios dobles, tabulaciones o saltos de línea sobrantes —frecuentes en texto extraído de PDF o formularios— pueden interferir en la tokenización posterior. En Python, `strip()` quita espacios al principio y al final, y `" ".join(texto.split())` colapsa espacios múltiples en uno solo.

### Corrección ortográfica (opcional)

Es un paso no siempre necesario: en lenguaje informal, un error tipográfico puede formar parte del propio contexto (por ejemplo, indicar tono o registro). Pero en buscadores, texto extraído por OCR o dominios formales, corregir errores como "incorecto" → "incorrecto" reduce el vocabulario y mejora la calidad del análisis. Un diccionario manual de sustituciones es simple pero no escala; **TextBlob** corrige automáticamente por probabilidad (mejor soportado en inglés); **SymSpell** usa la distancia de edición de Levenshtein y es la opción más rápida para corpus grandes, aunque exige preparar antes un diccionario del idioma.

### Eliminar stop-words

Las **stop-words** son palabras muy frecuentes y con poca carga semántica propia (artículos, preposiciones, conjunciones: "el", "de", "y"...). Quitarlas reduce el tamaño del vocabulario (menos dimensiones que procesar), elimina ruido y deja más visibles las palabras clave: en "el preprocesamiento de texto incluye eliminar las palabras vacías", lo que realmente importa es *preprocesamiento*, *texto*, *eliminar*, *vacías*. Pero esta regla tiene una excepción importante: en análisis de sentimientos, "no" es una stop-word típica cuya eliminación puede invertir el significado de una frase ("este producto no es excelente" perdería la negación). Por eso conviene ajustar la lista de stop-words a la tarea, no aplicar siempre una lista genérica. NLTK ofrece listas predefinidas por idioma (`stopwords.words('spanish')`) que se filtran tras tokenizar; spaCy marca cada palabra con el atributo `is_stop`, personalizable añadiendo o quitando términos del vocabulario del modelo.

### Normalización avanzada: sinónimos y estandarización

Más allá de la limpieza básica, a veces conviene unificar variaciones de significado. El **manejo de sinónimos** mapea palabras equivalentes ("automóvil", "coche", "vehículo") a una única forma, apoyándose en bases léxicas como WordNet (en inglés) o en diccionarios propios. La **detección de redundancias semánticas** identifica expresiones repetitivas como "subir arriba", útil en generación de resúmenes. La **estandarización de formatos** unifica variantes de un mismo dato —"\$500", "500 dólares" y "USD 500" pasan todos a "USD 500"— mediante expresiones regulares o reconocimiento de entidades (NER) cuando el formato es muy variable.

## Formalización

La limpieza de texto no introduce fórmulas propias: es una composición de transformaciones sobre una cadena, $\text{texto}' = f_n(\dots f_2(f_1(\text{texto}))\dots)$, donde cada $f_i$ es un paso (minúsculas, eliminar puntuación, etc.) y el orden importa porque cada paso actúa sobre el resultado del anterior.

El único paso con una regla formalizable de forma simple es el filtrado de stop-words. Dada una secuencia de tokens $T=(t_1,\dots,t_n)$ y un conjunto de stop-words $S$, el texto filtrado es:

$$
T' = (t_i \in T : t_i \notin S)
$$

donde:
- $T$: secuencia de tokens del texto original, en su orden.
- $S$: conjunto de stop-words del idioma o tarea (por ejemplo, $S=\{\text{"el"},\text{"de"},\text{"y"},\dots\}$).
- $T'$: secuencia resultante, con los mismos tokens de $T$ salvo los que pertenecen a $S$.

## Interactivo

```widget
motor: texto
modo: limpieza
textos: ["¡Me encanta este producto! 😊❤️ #felicidad #compras", "El valor total del contrato es de $1.200.000 con una tasa de interés del 5% anual."]
stopwords: ["el", "de", "la", "las", "los", "un", "una", "y", "con", "es", "del", "al"]
pasos: ["minusculas", "puntuacion", "espacios", "stopwords"]
```

Prueba a activar y desactivar el paso "stopwords" sobre la segunda frase y observa qué palabras clave sobreviven (contrato, valor, interés) frente a los conectores que desaparecen.

Prueba a añadir el paso "numeros" al texto del contrato y comprueba cómo se pierde el importe exacto: ¿en qué tareas sería grave este efecto?

Prueba a comparar el resultado con y sin el paso "puntuacion" en la frase con emojis y hashtags: ¿qué información emocional se pierde si el paso trata los emojis como puntuación?

## En código

```python
import re

stop_words = {"el", "de", "es", "un", "una", "que", "la", "los", "las"}

texto = "¡Este producto es un ejemplo fantástico de limpieza!"
texto = texto.lower()
texto = re.sub(r"[^\w\s]", "", texto)
palabras = texto.split()
palabras_filtradas = [p for p in palabras if p not in stop_words]

print(palabras_filtradas)
# ['este', 'producto', 'ejemplo', 'fantástico', 'limpieza']
```

## Errores típicos

- **Error**: eliminar siempre puntuación, números y emojis por sistema → **Correcto**: decide según la tarea; en análisis de sentimientos en redes sociales los emojis aportan señal, y en textos financieros los números y símbolos de moneda son esenciales.
- **Error**: aplicar una lista de stop-words genérica sin revisarla → **Correcto**: en análisis de sentimientos, negaciones como "no" cambian el significado de la frase y no deberían eliminarse sin más.
- **Error**: pensar que la corrección ortográfica siempre mejora el texto → **Correcto**: en lenguaje informal, los errores pueden formar parte del contexto (tono, registro) y corregirlos puede eliminar información útil.
- **Error**: limpiar con una lista de stop-words en el idioma equivocado → **Correcto**: una lista de stop-words en inglés no filtra nada útil en un corpus en español; hay que verificar que corresponda al idioma del texto.

## En resumen

- La limpieza de texto reduce el ruido (mayúsculas, puntuación, espacios, errores) antes de codificar el texto (ver [[nlp-intro]]).
- Pasos típicos, aplicados en orden y adaptados a la tarea: eliminar caracteres no deseados → unificar minúsculas → quitar espacios → (opcional) corregir ortografía → eliminar stop-words.
- Regla clave del filtrado de stop-words: quedarse solo con los tokens que no pertenecen al conjunto $S$ de palabras vacías.
- Úsala siempre que el ruido pueda confundir al modelo; evita eliminar información (emojis, números, mayúsculas, negaciones) cuando esa información es justo la que la tarea necesita.
- Decisión que más importa: qué conservar y qué eliminar depende de la tarea (NER conserva mayúsculas, sentimiento conserva "no" y emojis).
- Herramientas habituales: `re` para reglas explícitas, NLTK para listas predefinidas, spaCy para un procesamiento más integrado y multilingüe.
- Trampa principal: aplicar la misma limpieza "por defecto" a cualquier tarea, sin pensar qué información es ruido y cuál es señal en ese caso concreto.

## A fondo

**Comparación de correctores ortográficos.** El diccionario manual da control total pero no escala a textos grandes o multilingües. TextBlob corrige de forma automática por probabilidades, aunque su soporte de español es limitado. SymSpell, basado en la distancia de edición de Levenshtein, es el más rápido y escalable, pero exige cargar antes un diccionario de frecuencias del idioma correspondiente.

**Comparación NLTK vs. spaCy para stop-words.** NLTK es más lento en corpus grandes y requiere más pasos manuales (tokenizar y luego filtrar), pero es flexible y muy usado en proyectos educativos. spaCy es más eficiente en textos extensos, más sencillo de usar (`token.is_stop`) y se integra con análisis sintáctico adicional, aunque depende de modelos específicos por idioma.

**Normalización con NER.** La estandarización de formatos puede apoyarse en el reconocimiento de entidades nombradas: spaCy puede etiquetar expresiones de dinero (`ent_type_ == "MONEY"`) para sustituirlas por una forma canónica como "USD", en lugar de depender solo de listas de patrones con expresiones regulares.

**Detección de redundancias semánticas.** Frases como "voy a subir arriba y luego bajar hacia abajo" repiten una idea que el verbo ya contiene ("subir" ya implica "arriba"; "bajar", "abajo"). Analizando las dependencias sintácticas entre palabras (por ejemplo, con spaCy), es posible detectar automáticamente estos pares redundantes ("subir arriba", "bajar abajo") y simplificarlos, algo especialmente útil al generar resúmenes o simplificar textos largos.

**Buenas prácticas al eliminar stop-words.** Conviene personalizar la lista según el dominio (añadir palabras muy frecuentes pero vacías de significado en ese contexto, como "datos" en un corpus técnico), revisar que no se eliminen palabras clave relevantes para la tarea (como las negaciones) y comprobar siempre que la lista de stop-words corresponde al idioma real del texto: una lista en inglés no filtra nada útil en un corpus en español.

## Autoevaluación

### Estás limpiando reseñas de un producto para análisis de sentimientos y el texto incluye "¡Buenísimo! 😍 Lo super-recomiendo". ¿Qué deberías hacer con el emoji 😍?
- [ ] Eliminarlo siempre, porque no es una palabra
- [x] Conservarlo, porque aporta carga emocional relevante para el sentimiento
- [ ] Convertirlo a mayúsculas junto con el resto del texto
> Por qué: en análisis de sentimientos en redes sociales, los emojis suelen ser señales emocionales útiles; eliminarlos por sistema pierde información relevante para la tarea.

### ¿Por qué eliminar la palabra "no" de la lista de stop-words puede ser un error en análisis de sentimientos?
- [ ] Porque "no" nunca se considera una stop-word en ningún idioma
- [ ] Porque eliminar cualquier stop-word siempre reduce la precisión del modelo
- [x] Porque "no" indica negación y su ausencia puede invertir el significado de la frase
> Por qué: "este producto no es excelente" y "este producto es excelente" tienen sentidos opuestos; si se elimina "no" como stop-word genérica, ambas frases acaban representadas de forma casi idéntica.

### Dado el conjunto de stop-words $S=\{\text{"el"},\text{"de"}\}$ y los tokens $T=(\text{"el"},\text{"preprocesamiento"},\text{"de"},\text{"texto"})$, ¿cuál es $T'$?
- [ ] ("el", "preprocesamiento", "de", "texto")
- [x] ("preprocesamiento", "texto")
- [ ] ("preprocesamiento",)
> Por qué: $T'$ conserva solo los tokens que no pertenecen a $S$; "el" y "de" están en $S$ y se descartan, "preprocesamiento" y "texto" no.

### ¿Por qué no conviene convertir a minúsculas antes de una tarea de reconocimiento de entidades nombradas (NER)?
- [ ] Porque NER no puede procesar texto en minúsculas
- [x] Porque las mayúsculas suelen ser una pista de que una palabra es un nombre propio
- [ ] Porque convertir a minúsculas siempre introduce errores ortográficos
> Por qué: en frases como "Microsoft anunció una colaboración con Apple Inc.", las mayúsculas ayudan a distinguir entidades nombradas de palabras comunes; perderlas dificulta la tarea.

## Glosario

- **limpieza de texto**: eliminación de caracteres, espacios o errores que no aportan información relevante para la tarea.
- **stop-word**: palabra muy frecuente y con poca carga semántica propia (artículos, preposiciones, conjunciones) candidata a eliminarse del análisis.
- **corrección ortográfica**: proceso opcional que corrige errores de escritura para reducir el ruido del vocabulario.
- **normalización de sinónimos**: mapeo de palabras equivalentes a una única representación para evitar tratarlas como conceptos distintos.
