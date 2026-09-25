# Atlas de IA · Instrucciones permanentes

Construyes una web de estudio de IA **densa, explorable, interactiva y, sobre todo, muy clara**, a partir de tres repos de apuntes (`sebamendoza-eusa`: matematicas-IA, ml_101_2025, modelos_ia_101_2025). Cada concepto tiene **una sola ficha**. El material se trabaja por **lotes**; cada sesión hace un lote y termina.

Este archivo se carga en cada sesión. Síguelo al pie de la letra. Si algo choca con él, para y pregunta.

---

## 1. Archivos y quién manda

| Archivo | Qué es | ¿Lo editas? |
|---|---|---|
| `inventario.json` | La ley: 138 conceptos, fuentes, requisitos, motor del interactivo, lote, objetivo de palabras. | Solo si el usuario lo aprueba; anota el cambio en `DECISIONES.md`. |
| `PLANTILLA-FICHA.md` | Ejemplo completo del formato de ficha. | No. |
| `widgets.json` | Catálogo de motores interactivos y sus parámetros. | Solo para añadir un modo antes de implementarlo. |
| `ESPEC-WEB.md` | Especificación de la web (`docs/`) y del contrato de motores. | Solo en las fases de web. Léelo únicamente en esas fases o si implementas un motor. |
| `fichas/<id>.md` | Contenido. Una ficha por concepto. | Sí: es tu trabajo. |
| `docs/` | La web estática (GitHub Pages sirve esta carpeta). `docs/datos/` lo genera `build.py`. | Sí (salvo `docs/datos/`, que nunca editas a mano). |
| `ESTADO.md` | Progreso por lote. Lo genera `build.py`. | No. |
| `DECISIONES.md` | Registro breve de decisiones y problemas abiertos. | Sí: una línea por decisión. |
| `fuentes/` | Los tres repos clonados en commits fijos. | Nunca. Tampoco los abras: usa `tools/extraer.py`. |

## 2. Reglas de oro

1. **Fidelidad.** El contenido sale del material que imprime `tools/extraer.py`. Puedes reorganizar, condensar, aclarar, corregir errores evidentes y añadir ejemplos pequeños. No puedes añadir afirmaciones nuevas que no estén en la fuente, salvo matemática estándar trivial o dentro de un bloque `:::ampliacion`.
2. **Un concepto, un sitio.** Si algo pertenece a otra ficha, no lo explicas: enlazas con `[[id]]` y, si hace falta, das un recordatorio de una línea. Los requisitos previos no se vuelven a explicar.
3. **El inventario manda.** El `id`, el motor, el modo, los requisitos y el tipo vienen del inventario. Si crees que está mal, anótalo en `DECISIONES.md` y sigue con lo que dice.
4. **Nada se da por hecho sin `tools/build.py`.** Una ficha está terminada cuando el build pasa con 0 errores.
5. **Ampliaciones marcadas.** Todo contenido que no esté en el curso va dentro de `:::ampliacion` … `:::` e incluye una línea `Fuente:` con una referencia real. Si corriges un error de la fuente, usa `:::nota-fuente` … `:::` para decir qué cambiaste.
6. **Cálculos verificados.** Todo número de un ejemplo lo calculas antes con Python usando `python tools/calc.py "<código>"` (numpy, scipy, pandas y sklearn ya importados como np, sp, pd, sklearn; imprime lo que pongas en `print`). No crees scripts sueltos. Todo bloque ```python de "En código" debe ejecutarse sin errores. Si necesita TensorFlow, transformers o descargas, pon `# no-ejecutar` en su primera línea.
7. **Sin imágenes del curso.** Las `[figura: …]` del material no se migran. Si una figura es esencial, descríbela en texto o apóyate en el interactivo.

## 3. Formato de ficha

Copia la estructura de `PLANTILLA-FICHA.md`. Frontmatter:

```
---
id: <id exacto del inventario>
estado: borrador
---
```

Secciones `## ` en este orden exacto (las marcadas con * son opcionales):

| Sección | Para qué | Extensión y reglas |
|---|---|---|
| **En una frase** | La idea completa en una frase que un novato entienda. | ≤ 35 palabras. Sin fórmulas si se puede evitar. |
| **Intuición** | Analogía o situación cotidiana y por qué importa en IA. | 60-250 palabras. |
| **Explicación** | El núcleo. Del problema a la idea y de la idea al nombre. | Con `###` subsecciones. Junto con Formalización y A fondo suma ≈ `objetivo_palabras` (el extractor te lo dice; el build avisa si te sales del rango 0,6×-1,5×). |
| **Formalización** | Fórmulas. Tras cada fórmula en bloque va "donde:" y una lista con **todos** sus símbolos. | Si el concepto no es matemático, escribe una línea: `No aplica: <motivo>.` |
| **Interactivo*** | Un bloque ```widget y de 1 a 3 retos que empiecen por "Prueba a…". | Obligatorio si el inventario asigna motor; prohibido si no. |
| **En código*** | Un ejemplo mínimo en Python que funcione tal cual. | ≤ 20 líneas por bloque. Con salida comentada. |
| **Errores típicos** | Malentendidos frecuentes. | ≥ 3 viñetas con este formato: `- **Error**: … → **Correcto**: …` |
| **En resumen** | Chuleta práctica: es lo que muestra la vista "Esencial". Tiene que entenderse sola, sin haber leído el resto. | 4-8 viñetas, ≤ 180 palabras. Cubre: qué hace y para qué sirve; cómo funciona en 2-4 pasos; la fórmula o regla clave (como mucho una); cuándo usarlo y cuándo no; los hiperparámetros o decisiones que importan; la trampa principal. Nada de títulos vacíos ni "ver arriba". |
| **A fondo*** | Detalle valioso de la fuente que no es imprescindible (casos, variantes, historia, matices). | Se muestra plegado en la web. Así la ficha es densa sin abrumar. |
| **Autoevaluación** | Comprobar la comprensión, no la memoria. | 3-6 preguntas con el formato de abajo. |
| **Glosario** | Términos que esta ficha introduce. | `- **término**: definición` (≤ 30 palabras). Solo términos nuevos aquí. |

Formato de pregunta (exactamente una opción `[x]`, al menos 3 opciones):

```
### Enunciado de la pregunta, puede llevar $x^2$
- [ ] Opción incorrecta pero plausible
- [x] Opción correcta
- [ ] Otra opción plausible
> Por qué: explicación breve de por qué la correcta lo es y en qué falla la trampa principal.
```

Enlaces internos: `[[id]]` usa el nombre del concepto como texto; `[[id|texto]]` usa el texto que indiques. Matemáticas: `$…$` en línea y `$$…$$` en bloque. No uses `\(`, `\[` ni comentarios HTML.

## 4. Guía de claridad (lo más importante)

- **Primero el problema, luego el nombre.** Plantea la situación que el concepto resuelve y después bautízalo.
- **Una idea por párrafo.** Frases de 25 palabras de media como máximo. Voz activa. Tú al lector ("fíjate", "imagina").
- **Escalera de abstracción:** caso concreto → patrón → definición general → fórmula. Nunca al revés.
- **Ejemplo numérico pequeño** en toda ficha con fórmulas: números que se puedan seguir de cabeza (2-4 datos) y calculados con Python.
- **Cada símbolo, definido la primera vez que aparece.** Cada término técnico en negrita solo la primera vez, con su traducción si viene del inglés: "tasa de aprendizaje (*learning rate*)".
- **Contraste explícito.** Cuando dos ideas se confunden (parámetro/hiperparámetro, pérdida/métrica), di en qué se diferencian con una frase del tipo "X es…; Y, en cambio, es…".
- **Nada de relleno.** Fuera: "Es importante destacar que", "En el mundo actual", "Como hemos visto". Cada frase aporta información.
- **Listas solo para cosas enumerables.** El razonamiento va en prosa. Máximo dos niveles de lista.
- **Tablas para comparar** tres o más cosas según los mismos criterios.
- **Densidad por capas:** lo imprescindible en Explicación; lo valioso pero secundario en A fondo. No elimines contenido útil de la fuente: si no cabe arriba, va a A fondo.
- **Autoevaluación que haga pensar:** aplicar, predecir, detectar un error o comparar. Las opciones incorrectas son errores reales que comete la gente (sácalas de "Errores típicos").

## 5. Notación unificada

Escalares en cursiva ($x$, $n$); vectores en negrita minúscula ($\mathbf{x}$); matrices en negrita mayúscula ($\mathbf{X}$). $n$ = número de muestras, $d$ = número de variables, $\mathbf{X}\in\mathbb{R}^{n\times d}$. $y$ = valor real, $\hat{y}$ = predicción. $\boldsymbol{\theta}$ = parámetros; $\mathbf{w}$ y $b$ = pesos y sesgo. $\mathcal{L}$ = pérdida; $J$ = coste medio. $\eta$ = tasa de aprendizaje; $\lambda$ = regularización. $P(\cdot)$ = probabilidad; $\mathbb{E}[\cdot]$ = esperanza; $\mu$, $\sigma$ = media y desviación típica. En RL: $s, a, r$, $\pi$, $V^\pi$, $Q^\pi$, $\gamma$, $\alpha$, $\varepsilon$. Decimales con coma en la prosa y en fórmulas ($0{,}5$); con punto solo dentro del código. Si la fuente usa otra notación, adáptala y, si confunde, avisa en una frase.

## 6. Interactivos

- El motor y el modo de cada ficha los fija el inventario. Los parámetros de cada motor están en `widgets.json`. El extractor te imprime su especificación.
- Formato del bloque: primera línea `motor: <motor>`, luego `clave: valor` con valores JSON (listas y objetos pueden ocupar varias líneas). Dentro de los valores, el LaTeX lleva **una sola** barra (`\frac`), sin escapar.
- El motor `pasos` usa fotogramas en Markdown separados por líneas `---` tras `motor: pasos`.
- Diseña el estado inicial para que ya enseñe algo sin tocar nada. Los retos "Prueba a…" guían hacia el descubrimiento clave de la ficha.
- Los motores se construyen en sesiones propias (fases M) antes de los lotes. Si aun así el build dice que un motor o modo **no está implementado**, lee `ESPEC-WEB.md` §8, impleméntalo en `docs/motores/<motor>.js` (añade el modo a la línea `// @modos:` y un ejemplo en `ejemplos`), pruébalo con `python tools/probar_web.py --demo <motor>` y solo entonces sigue con las fichas.

## 7. Economía de tokens (obligatorio)

- Lee solo: este archivo (ya cargado), `DECISIONES.md` y la salida de `python tools/extraer.py --lote Lxx`. **Nunca** abras archivos de `fuentes/`, `docs/datos/` ni fichas ajenas al lote (para saber qué dice otra ficha: `python tools/extraer.py --frase <id>`).
- No abras `ESPEC-WEB.md`, `widgets.json` ni `docs/` salvo que el build pida implementar un motor o estés en una fase de web.
- Escribe cada ficha de una vez con la herramienta de escritura. Para corregir, edita solo el fragmento con fallo; no la reescribas entera.
- No pegues fichas ni fragmentos largos en el chat. No resumas lo que vas haciendo entre pasos.
- Si la salida del extractor supera ~35k tokens, pide permiso para partir el lote en dos.
- Búsqueda web solo en ampliaciones: prioriza las fuentes sugeridas del inventario y usa como máximo 3 consultas por ficha.

## 8. Sesión de lote: pasos exactos

En Windows, ejecuta los comandos en Bash (Git Bash), no en PowerShell: `&&` no funciona en Windows PowerShell 5.1.

Cuando el usuario escribe **"Lote Lxx"**:

1. `python tools/extraer.py --lote Lxx` y lee la salida completa una vez.
2. `python tools/build.py --lote Lxx` solo si el extractor avisa de algo raro o sospechas que falta un motor (§6).
3. Escribe las fichas del lote en el orden del extractor, **omitiendo las que ya existen** (el extractor las marca con ⚠).
4. `python tools/build.py --lote Lxx --ejecutar` y corrige hasta 0 errores. Revisa los avisos: arregla los que tengan sentido y deja constancia de los que no en `DECISIONES.md`.
5. Si hay Playwright: `python tools/probar_web.py --lote Lxx` (añade `--esencial` u `--oscuro` para capturar esa vista o ese tema) y corrige los errores de consola o los interactivos vacíos.
6. `git add -A && git commit -m "Lote Lxx: <ids>"` y, si existe el remoto, `git push`.
7. Mensaje final, sin más texto:

```
Lote Lxx ✓ — N fichas: id1, id2, …
Motores nuevos: … (o "ninguno")
Avisos pendientes: … (o "ninguno")
Revisa en el navegador: <1-3 puntos concretos que convenga mirar>
Siguiente: Lote Lyy
```

## 8b. Otras órdenes del usuario

- **"Fase 1A"**, **"Fase 1B"**, **"Motores Mx"** o **"Fase final"**: lee `ESPEC-WEB.md` y `widgets.json` y entrega lo que indica `ESPEC-WEB.md` §10 para esa fase. En estas sesiones no uses el extractor salvo para las fichas piloto.
- **"Lote Lxx, solo: id1 id2"**: como un lote, pero limitado a esas fichas.
- **"Ajustes de formato: …"**: aplica los cambios a `PLANTILLA-FICHA.md` y a este archivo, reescribe las fichas afectadas que indique el usuario y anótalo en `DECISIONES.md`.
- **"Revisión Bx"**: `python tools/build.py --estricto`; corrige solo lo que salga en fichas del bloque Bx. Después lee el "En una frase" de las fichas del bloque (`python tools/extraer.py --frase <id>`) y el glosario que marque el build, y detecta términos definidos de dos formas o ideas explicadas dos veces. Cambia lo mínimo y resume en ≤ 8 líneas.
- **"Propuesta de inventario: …"**: edita `inventario.json` (conceptos, fuentes, requisitos, motor), ejecuta `python tools/recalcular.py` y `python tools/solapes.py` hasta 0 errores, y anota el cambio en `DECISIONES.md`.
- **"Marca revisadas: id1 id2 …"** (o un lote): cambia `estado: borrador` por `estado: revisada` en esas fichas. Solo el usuario decide qué está revisado.

## 9. Qué hacer si…

- **La fuente se contradice o tiene un error:** corrige con `:::nota-fuente` y apúntalo en `DECISIONES.md`.
- **Falta material para una sección obligatoria** (por ejemplo, fórmulas en un concepto histórico): `No aplica: <motivo>.` en Formalización; nunca inventes.
- **Un concepto parece mal ubicado o duplicado:** no lo cambies; apúntalo en `DECISIONES.md` como `PROPUESTA:` para que lo decida el usuario.
- **El build falla por algo que crees correcto:** no desactives la comprobación; explica el caso en `DECISIONES.md` y pregunta.
- **El usuario pide cambiar el formato o el estilo:** actualiza `PLANTILLA-FICHA.md` y este archivo en la misma sesión, y apúntalo en `DECISIONES.md`.

## 10. Modo autónomo

Si la orden empieza por `[AUTO]`, la lanza `tools/autopiloto.py` y nadie va a responder:
- No preguntes ni esperes respuesta. Ante una duda, elige la opción más conservadora que respete este archivo, anótala en `DECISIONES.md` como `PROPUESTA` y sigue.
- No modifiques `CLAUDE.md`, `PLANTILLA-FICHA.md`, `inventario.json` ni `tools/`. En `widgets.json` solo puedes añadir un modo que vayas a implementar.
- Termina siempre con el build en 0 errores y con commit. Si no lo consigues, deja escrito en `DECISIONES.md` qué falta y por qué.
