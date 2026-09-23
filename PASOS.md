# Pasos para construir el Atlas de IA

**Resumen:** preparación → Fase 1A y 1B (web + 3 fichas piloto) → **tu revisión del piloto** → 9 sesiones de motores → 31 lotes de fichas (con una revisión al cerrar cada bloque) → fase final. Unas 50 sesiones cortas.

## Cómo se trabaja y por qué

- **Claude Code en tu ordenador, dentro de la carpeta del proyecto.** Carga `CLAUDE.md` por sí solo en cada sesión, lee los archivos sin que pegues nada, ejecuta los validadores y hace los commits. No tienes que copiar prompts largos: cada sesión empieza con una orden de 2-3 palabras.
- **Una sesión = una tarea.** Escribe `/clear` antes de cada orden nueva. Un contexto limpio es más barato y comete menos errores.
- **Las comprobaciones las hacen scripts, no el modelo.** `build.py` rechaza fichas con formato roto, fórmulas mal cerradas, preguntas sin respuesta, enlaces inexistentes, código que no se ejecuta o interactivos mal configurados. `probar_web.py` abre cada ficha en un navegador y detecta errores de consola e interactivos vacíos.
- **Qué modelo usar.** Opus para las fases de web y los motores (código JavaScript con estado). Sonnet para los lotes de fichas: son redacción con reglas fijas y el build atrapa los fallos. Si un lote te convence poco, repítelo con Opus.

## Paso 0 · Instalar las herramientas en Windows 10 (una vez, unos 20 minutos)

Abre **PowerShell** (tecla Windows → escribe "PowerShell" → Enter). Cada punto empieza con una comprobación: si ya funciona, pasa al siguiente.

1. **Versión de Windows.** Escribe `winver`. Claude Code necesita Windows 10 versión **1809 o posterior**.
2. **Git for Windows.** Comprueba con `git --version`. Si da error, instálalo desde <https://git-scm.com/downloads/win> con las opciones por defecto. Incluye **Git Bash**, que Claude Code usa para ejecutar comandos. Cierra y vuelve a abrir PowerShell, y configura tu identidad (una vez):
   ```powershell
   git config --global user.name "Lucas Tallafet"
   git config --global user.email "el-email-de-tu-cuenta-de-GitHub"
   ```
3. **Python 3.10 o superior.** Comprueba con `python --version`. Si da error o se abre la Microsoft Store, instálalo desde <https://www.python.org/downloads/windows/> (instalador de 64 bits) y marca la casilla **"Add python.exe to PATH"** en la primera pantalla. Si aun así se abre la Store: Configuración → Aplicaciones → Alias de ejecución de aplicaciones → desactiva `python.exe` y `python3.exe`. Cierra y reabre PowerShell.
4. **Claude Code.** Instálalo con:
   ```powershell
   irm https://claude.ai/install.ps1 | iex
   ```
   Cierra y reabre PowerShell. Comprueba con `claude --version` y `claude doctor`. La primera vez que ejecutes `claude` se abrirá el navegador para iniciar sesión (necesita un plan Pro, Max, Team o Enterprise). Alternativa sin terminal: la app de escritorio de Claude, que ya tienes instalada, incluye Claude Code.
5. **Opcional, recomendado: pruebas visuales.**
   ```powershell
   python -m pip install playwright
   python -m playwright install chromium
   ```

## Paso 1 · Preparar el proyecto (10 minutos, sin Claude)

Pon el proyecto en tu carpeta de usuario y **no** dentro de Documentos, Escritorio u otra carpeta sincronizada con OneDrive: la sincronización bloquea archivos mientras Git trabaja. Con el zip en Descargas, en PowerShell:

```powershell
cd $HOME
Expand-Archive "$HOME\Downloads\atlas-ia-kit.zip" -DestinationPath $HOME
cd atlas-ia
git init -b main
python tools\preparar.py
git add -A
git commit -m "Kit inicial"
```

`preparar.py` clona los 3 repos en commits fijos, instala las librerías de `requirements.txt` y comprueba el inventario. Debe terminar con `0 fuentes inválidas · 0 solapes`. MathJax ya viene incluido en el kit.

Crea un repositorio vacío en GitHub (por ejemplo `atlas-ia`), sin README ni licencia para que no choque con el tuyo. Después:

```powershell
git remote add origin https://github.com/<tu-usuario>/atlas-ia.git
git push -u origin main
```

La primera vez, Git abrirá el navegador para iniciar sesión en GitHub.

Activa GitHub Pages: Settings → Pages → Deploy from a branch → `main` / `docs`. **Licencia:** los apuntes originales son GPL-3.0, así que el Atlas, que deriva de ellos, también debe serlo si lo publicas. Añade el archivo de licencia GPL-3.0 desde GitHub (Add file → Create new file → escribe `LICENSE` → Choose a license template). El `README.md` ya cita la fuente.

**Cómo empezar cada sesión:** abre PowerShell y escribe:

```powershell
cd $HOME\atlas-ia
claude
```

Desde la app de escritorio, abre Claude Code y elige la carpeta `atlas-ia`. `CLAUDE.md` se carga solo en ambos casos. Para ver la web, abre `docs\index.html` con doble clic.

## Modo autónomo (autopiloto)

`tools/autopiloto.py` encadena las sesiones sin ti. Cada sesión arranca con el contexto limpio (equivale a `/clear`). Al terminar, comprueba el resultado con los scripts: que estén las fichas o los motores y que el build pase. Si algo falla, reintenta una vez pidiendo solo lo pendiente; si vuelve a fallar, se para y lo explica en `autopiloto.log`. Si se agota el cupo de 5 horas, espera y reintenta; si se agota el semanal, se para. Hace commit y push de cada paso, así que puedes seguir el avance desde GitHub en el móvil.

Lo único que **no** hace solo es tu revisión del piloto (Paso 4): se niega a escribir lotes hasta que las 3 fichas piloto estén marcadas como revisadas. Es a propósito, porque todo lo demás copia ese formato.

**Antes de usarlo, una vez:** deja el ordenador encendido y sin suspender mientras trabaja (Configuración → Sistema → Inicio/apagado y suspensión → Suspender: Nunca, al menos cuando está enchufado). Las tareas programadas solo se ejecutan con tu sesión de Windows iniciada.

**1. Fase 1A y 1B mientras duermes (Opus).** En PowerShell, programa el arranque para justo después de que se renueve tu cupo de 5 horas (cambia la hora si hace falta):

```powershell
schtasks /create /tn "AtlasIA-fase1" /sc once /st 23:55 /tr "C:\Users\luck9\atlas-ia\autopiloto-fase1.cmd"
```

**2. Por la mañana, tu revisión (Paso 4).** Mira `autopiloto.log`, abre `docs\index.html` y lee las 3 fichas. Los ajustes se hacen en una sesión normal de Claude Code (`Ajustes de formato: …`). Cuando te gusten: `Marca revisadas: derivada metricas-clasificacion kmeans`.

**3. Primer tramo, con control de calidad.** Doble clic en `autopiloto.cmd` hace todo lo pendiente. La primera vez limítalo al bloque 1 (motores M1-M9, lotes L01-L04 y la revisión del bloque). En PowerShell:

```powershell
cd $HOME\atlas-ia
.\autopiloto.cmd --hasta L04
```

Cuando acabe, lee algunas fichas del bloque 1. Si hay algo sistemático que corregir, hazlo con `Ajustes de formato` antes de seguir.

**4. El resto, solo.** Programa un arranque diario. Si hay una ejecución en marcha, la nueva no arranca; si no queda nada pendiente, termina al instante:

```powershell
schtasks /create /tn "AtlasIA-diario" /sc daily /st 09:00 /tr "C:\Users\luck9\atlas-ia\autopiloto.cmd"
```

Para quitarlo cuando termine: `schtasks /delete /tn "AtlasIA-diario" /f`.

**Opciones útiles:**
- `--simular`: muestra la cola sin ejecutar nada.
- `--max 3`: como mucho 3 sesiones.
- `--modelo-motores opus`: usa Opus solo para los motores si con Sonnet no quedan bien.
- `--orden "Lote L07"`: ejecuta una orden suelta.

**Dónde mirar:**
- `autopiloto.log`: qué ha hecho y por qué ha parado.
- `ESTADO.md`: fichas hechas.
- `DECISIONES.md`: las `PROPUESTA` que el modo autónomo dejó para ti.
- `logs\`: la salida completa de cada sesión.

Los pasos 2 a 7 siguientes describen lo mismo hecho a mano, sesión a sesión.

## Paso 2 · Fase 1A: la web y la primera ficha (Opus)

```
Fase 1A
```

Construye la web (portada, mapa, ficha, glosario, rutas, repaso y buscador), los motores `pasos` y `funcion`, la página `demo.html` de pruebas y la ficha piloto `derivada`.

## Paso 3 · Fase 1B: dos pilotos más (Opus)

```
/clear
Fase 1B
```

Añade los motores `umbral` y `dispersion2d` (con K-Means) y las fichas piloto `metricas-clasificacion` y `kmeans`.

## Paso 4 · Tu revisión del piloto (el paso más importante)

Abre `docs\index.html` con doble clic y lee las tres fichas despacio. Ahora cambiar el formato es gratis; después obliga a rehacer fichas.

- **Claridad:** ¿entenderías la ficha sin saber nada del tema? ¿Funcionan la frase, la intuición y el paso de lo concreto a lo general?
- **Densidad:** ¿qué sobra y qué echas en falta? ¿"A fondo" guarda lo que quieres tener a mano?
- **Interactivos:** ¿enseñan algo sin tocar nada? ¿Los retos "Prueba a…" llevan a la idea clave?
- **Autoevaluación:** ¿hace pensar o solo pide memoria?
- **Diseño:** ¿es cómoda de leer en claro, en oscuro y en el móvil?

Dale tus comentarios en una sesión (puedes repetir hasta que te guste):

```
Ajustes de formato: <tu lista de cambios>
```

Cuando estés conforme:

```
Marca revisadas: derivada metricas-clasificacion kmeans
```

## Paso 5 · Motores (Opus, 9 sesiones)

```
/clear
Motores M1
```

Y así hasta `Motores M9` (el reparto está en `ESPEC-WEB.md` §8). Después de cada sesión abre `docs\demo.html` y prueba los motores nuevos. Haciendo todos los motores antes de las fichas, las sesiones de lote solo escriben contenido: son más baratas y mezclan menos cosas.

## Paso 6 · Lotes de fichas (Sonnet, 31 sesiones)

```
/clear
Lote L01
```

Al terminar, Claude te da un resumen de 5 líneas con lo que conviene mirar. Ábrelo en el navegador y, si algo no te gusta, díselo **en la misma sesión** antes del `/clear`. Haz los lotes en orden: cada ficha enlaza con las anteriores y reutiliza su "En una frase". Las fichas piloto que ya existen se saltan solas.

| Lote | Bloque | Fichas | Conceptos |
|---|---|---|---|
| L01 | B1 | 7 | vectores, producto-escalar-similitud, espacio-vectorial, matrices, datos-como-matrices, determinante-inversa, sistemas-lineales |
| L02 | B1 | 8 | autovalores-svd, funciones, no-linealidad, derivada, regla-cadena, gradiente, integral-monte-carlo, probabilidad |
| L03 | B1 | 8 | prob-condicional, bayes, variable-aleatoria, dist-normal, dist-binomial, dist-poisson, estadistica-descriptiva, graficos-estadisticos |
| L04 | B1 | 3 | muestreo-intervalos, contraste-hipotesis, correlacion · **luego: `Revisión B1`** |
| L05 | B2 | 4 | que-es-ia, historia-ia, paradigmas-ia, ia-debil-general |
| L06 | B2 | 4 | resolucion-problemas, automatizacion-seleccion, que-es-ml, tipos-aprendizaje |
| L07 | B2 | 6 | componentes-ml, ciclo-proyecto-ml, funciones-perdida, descenso-gradiente, generalizacion, validacion |
| L08 | B2 | 4 | regularizacion, metricas-regresion, metricas-clasificacion, hiperparametros · **luego: `Revisión B2`** |
| L09 | B3 | 7 | tipos-datos, eda, preprocesamiento, outliers, valores-ausentes, multicolinealidad, escalado |
| L10 | B3 | 6 | codificacion-categoricas, seleccion-caracteristicas, reduccion-dimensionalidad, desbalanceo, series-temporales, supervisado |
| L11 | B3 | 5 | regresion-lineal, regresion-logistica, knn, naive-bayes, svm |
| L12 | B3 | 5 | arboles-decision, bagging-random-forest, boosting, clustering, kmeans |
| L13 | B3 | 4 | clustering-jerarquico, dbscan, gmm, evaluacion-clustering · **luego: `Revisión B3`** |
| L14 | B4 | 7 | del-ml-al-dl, perceptron, mlp, funciones-activacion, backpropagation, optimizadores, entrenamiento-dl |
| L15 | B4 | 2 | keras-tensorflow, flujo-dl-por-dato |
| L16 | B4 | 3 | cnn, cnn-arquitecturas, rnn |
| L17 | B4 | 4 | lstm-gru, autoencoders, gans, transfer-learning · **luego: `Revisión B4`** |
| L18 | B5 | 4 | rl-fundamentos, mdp, politica-valor-bellman, taxonomia-rl |
| L19 | B5 | 3 | programacion-dinamica, monte-carlo-rl, td-learning |
| L20 | B5 | 4 | sarsa-qlearning, policy-gradient, actor-critico, rl-aplicaciones · **luego: `Revisión B5`** |
| L21 | B6 | 3 | nlp-intro, limpieza-texto, tokenizacion |
| L22 | B6 | 1 | bow-tfidf |
| L23 | B6 | 1 | word-embeddings |
| L24 | B6 | 6 | modelos-lenguaje, embeddings-contextuales, atencion, transformer, bert-encoders, gpt-t5-generativos |
| L25 | B6 | 4 | fine-tuning, dl-para-nlp, huggingface-practico, llms |
| L26 | B6 | 5 | prompting, evaluacion-llm, rag, rlhf, llm-aplicaciones · **luego: `Revisión B6`** |
| L27 | B7 | 3 | representacion-conocimiento, ontologias-grafos, sistemas-expertos |
| L28 | B7 | 4 | motores-inferencia, logica-difusa, redes-bayesianas, teoria-posibilidad |
| L29 | B7 | 1 | hibridos-tendencias-simbolico · **luego: `Revisión B7`** |
| L30 | B8 | 8 | despliegue, monitorizacion-drift, mlops, optimizacion-inferencia, desafios-tecnicos, sesgos-equidad, explicabilidad, privacidad-responsabilidad |
| L31 | B8 | 4 | regulacion, impacto-social, aplicaciones-sectoriales, tendencias · **luego: `Revisión B8`** |

**Revisión de bloque:** al terminar el último lote de un bloque, ejecuta `Revisión Bx` en una sesión limpia. Después lee las fichas que quieras y márcalas con `Marca revisadas: …` (o `Marca revisadas: L05`).

## Paso 7 · Fase final (Opus)

```
/clear
Fase final
```

Validación estricta de todo, prueba de todas las fichas en escritorio y móvil, revisión de rutas, repaso y buscador. Tras el `git push`, la web queda publicada en GitHub Pages.

## Seguimiento

- `ESTADO.md` (lo genera el build) muestra qué fichas están hechas en cada lote. También `python tools/extraer.py --estado`.
- `DECISIONES.md` recoge lo que Claude decidió o te propone. Léelo de vez en cuando: las líneas `PROPUESTA` esperan tu respuesta.

## Si algo sale mal

| Situación | Qué hacer |
|---|---|
| Una sesión se atasca corrigiendo el build | `/clear` y `Lote Lxx, solo: <ids que falten>` |
| El lote es demasiado grande para el contexto | Pártelo: `Lote Lxx, solo: id1 id2 id3` y luego el resto |
| Una ficha no sigue el estilo | `Relee CLAUDE.md §4 y corrige la ficha <id>` |
| Quieres deshacer una ficha | `git checkout -- fichas/<id>.md` (o `git revert` del commit del lote) |
| PowerShell dice que `&&` no es un separador válido | Estás en Windows PowerShell 5.1: escribe los comandos en líneas separadas |
| Claude Code no encuentra Git Bash | Añade en `%USERPROFILE%\.claude\settings.json`: `{"env": {"CLAUDE_CODE_GIT_BASH_PATH": "C:\\Program Files\\Git\\bin\\bash.exe"}}` |
| `python` abre la Microsoft Store | Desactiva los alias de ejecución de `python.exe` y `python3.exe` (Paso 0.3) |
| Git avisa de "LF will be replaced by CRLF" | Es inofensivo; `.gitattributes` ya fija los saltos de línea |
| Caracteres raros (`Ã³`, `�`) en la salida | Los scripts ya fuerzan UTF-8; si persiste, ejecuta antes `$env:PYTHONUTF8=1` |
| Quieres unir, partir o mover conceptos | En una sesión: `Propuesta de inventario: <cambio>`. Claude edita `inventario.json`, ejecuta `python tools/solapes.py` y lo anota en `DECISIONES.md` |
| Un interactivo falla en tu navegador | `El motor <x> falla en <ficha>: <qué ves>` en una sesión con Opus |

## Consumo orientativo

Una sesión de lote lee unos 30-40k tokens (instrucciones + material fuente del lote, que el extractor recorta a lo imprescindible) y escribe unos 15-25k. Los 31 lotes rondan 1-1,3 millones de tokens de entrada y 0,5-0,8 millones de salida, menos con la caché de prompts. Las fases de web y de motores varían más porque escriben código y lo prueban.
