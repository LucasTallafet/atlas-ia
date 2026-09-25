---
id: resolucion-problemas
estado: borrador
---

## En una frase

Un sistema de resolución de problemas en IA formaliza una situación como estados y acciones, y explora ese espacio para encontrar la secuencia que lleva del estado inicial al objetivo.

## Intuición

Piensa en un GPS calculando una ruta. No "sabe" el camino de memoria: representa el mapa como cruces (posiciones) conectados por carreteras (movimientos posibles) y explora esa red hasta encontrar una secuencia de giros que te lleve del punto de partida al destino. Cambia el mapa por un tablero de ajedrez, un conjunto de tareas por asignar o una ruta de reparto, y la misma idea sirve: casi cualquier tarea de IA puede plantearse como "encontrar el camino correcto dentro de un espacio de posibilidades".

Esto importa porque, antes de elegir un algoritmo, hay que decidir *cómo describir* el problema. Un mismo objetivo (llegar a un destino, ganar una partida, diagnosticar a un paciente) admite formas muy distintas de representarlo, y esa elección determina qué técnicas de IA pueden aplicarse.

## Explicación

### De la entrada a la salida: la estructura común

Todo sistema de resolución de problemas comparte tres piezas: una **entrada** (los datos o condiciones de partida, como los síntomas de un paciente o la posición de un robot), un **procesamiento** (el algoritmo que razona sobre esa entrada) y una **salida** (la solución, ya sea una acción, una predicción o una secuencia de pasos). Esta estructura es la misma que recorre cualquier agente de IA al percibir su entorno y actuar sobre él (véase [[que-es-ia]]); lo que cambia de un problema a otro es cómo se formaliza el procesamiento.

### Formalizar el problema: estados, objetivo y operadores

Para que un ordenador pueda "buscar" una solución, primero hay que traducir el problema a tres elementos:

- El **estado inicial**: la situación de partida (la posición de un robot, el tablero al empezar una partida).
- Los **estados objetivo**: las condiciones que cuentan como problema resuelto (llegar a una casilla, dar jaque mate).
- Los **operadores**: las acciones que transforman un estado en otro (mover una ficha, girar a la izquierda).

Con estos tres elementos, resolver el problema se convierte en un **problema de búsqueda**: encontrar una secuencia de operadores que lleve del estado inicial a un estado objetivo. El conjunto de todos los estados alcanzables, junto con las acciones que los conectan, es el **espacio de búsqueda**, y suele representarse como un grafo donde los nodos son estados y los arcos son acciones. En el 8-puzzle, por ejemplo, cada estado es una disposición de las ocho fichas en la cuadrícula, y el espacio de búsqueda entero tiene más de 180.000 configuraciones posibles.

### Elegir la técnica según el tipo de problema

No todos los problemas se atacan igual: la naturaleza del problema condiciona qué modelo de IA conviene usar. Conviene distinguir seis ejes, cada uno con dos extremos:

| Eje | Un extremo | El otro extremo |
|---|---|---|
| Definición | **Bien definido**: reglas y objetivo claros (el problema del viajante) | **Mal definido**: ambigüedad en entradas o reglas (el diagnóstico médico) |
| Certeza | **Determinístico**: el mismo estado y la misma acción siempre llevan al mismo resultado (una ruta en un GPS) | **Estocástico**: el resultado depende de factores inciertos (la predicción meteorológica) |
| Entorno | **Estático**: no cambia mientras se resuelve (un horario de clases) | **Dinámico**: cambia en tiempo real (el trading algorítmico) |
| Variables | **Discreto**: número finito de estados o acciones (asignar tareas a empleados) | **Continuo**: valores dentro de un rango infinito (regular la temperatura de un HVAC) |
| Meta | **De optimización**: busca la mejor solución según una función objetivo (minimizar una distancia) | **De satisfacción**: busca cualquier solución que cumpla las restricciones (cuadrar un horario de turnos) |
| Información | **Completa**: todos los datos relevantes están disponibles desde el inicio (planificar una fábrica) | **Parcial**: el sistema descubre datos sobre la marcha (un dron en un entorno desconocido) |

Los problemas bien definidos, determinísticos, estáticos y con información completa suelen resolverse con **búsqueda exhaustiva** o **sistemas basados en reglas**, porque el espacio se puede recorrer o programar explícitamente. En el extremo opuesto —mal definidos, estocásticos, dinámicos o con información parcial— hacen falta modelos que gestionen la incertidumbre, como redes bayesianas, o que aprendan de datos, como las redes neuronales.

### Cuando el espacio es demasiado grande: heurísticas y optimización evolutiva

Explorar todo el espacio de búsqueda es viable en problemas pequeños, pero se vuelve inabordable a medida que crece: es la llamada **explosión combinatoria**. La solución habitual son las **heurísticas**: reglas prácticas que estiman qué tan prometedor es un estado sin explorarlo del todo. El algoritmo **A\***, por ejemplo, prioriza los caminos cuya heurística sugiere menor coste restante hasta la meta, evitando explorar ramas poco prometedoras.

Cuando el espacio ni siquiera está bien definido o es demasiado grande para cualquier heurística, entran en juego los **algoritmos evolutivos**. Un **algoritmo genético** mantiene una población de soluciones candidatas y aplica selección, cruce y mutación para generar nuevas generaciones, guiado por una **función de aptitud** que puntúa cada candidata. No garantiza la solución óptima, pero encuentra soluciones suficientemente buenas en problemas —como el diseño de rutas con muchas restricciones— donde la búsqueda exhaustiva es imposible.

## Formalización

Un problema de búsqueda se define formalmente como la tupla $(S, s_0, A, T, G)$:

$$
(S,\ s_0,\ A,\ T,\ G)
$$

donde:

- $S$ es el conjunto de todos los estados posibles (el espacio de búsqueda).
- $s_0 \in S$ es el estado inicial.
- $A$ es el conjunto de operadores (acciones) que transforman un estado en otro.
- $T$ es la función de transición: dado un estado y una acción, indica el estado siguiente.
- $G \subseteq S$ es el conjunto de estados objetivo (meta).

Resolver el problema consiste en encontrar una secuencia de acciones $a_1, a_2, \ldots, a_n \in A$ que, aplicada desde $s_0$, alcance un estado en $G$. Cuando además interesa la mejor solución (no solo una válida), se añade una función de coste $c(a_i)$ y el objetivo pasa a ser minimizar $\sum_i c(a_i)$: es la diferencia entre un problema de satisfacción y uno de optimización.

## Interactivo

```widget
motor: rejilla
modo: busqueda
mapa: ["S....", ".###.", ".#...", ".#.##", "....G"]
```

- Prueba a expandir nodos con búsqueda en amplitud (BFS) y cuenta cuántos visita antes de llegar a la meta; compara con búsqueda en profundidad (DFS).
- Prueba a imaginar un muro extra que bloquee el camino más corto: ¿cómo cambiaría la ruta encontrada?

## En código

```python
from collections import deque

laberinto = ["S....", ".###.", ".#...", ".#.##", "....G"]
filas, cols = len(laberinto), len(laberinto[0])
inicio = next((f, c) for f in range(filas) for c in range(cols) if laberinto[f][c] == "S")
meta = next((f, c) for f in range(filas) for c in range(cols) if laberinto[f][c] == "G")

visitados = {inicio}
cola = deque([(inicio, 0)])
while cola:
    (f, c), dist = cola.popleft()
    if (f, c) == meta:
        print(f"Pasos hasta la meta: {dist}")
        break
    for df, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        nf, nc = f + df, c + dc
        if 0 <= nf < filas and 0 <= nc < cols and laberinto[nf][nc] != "#" and (nf, nc) not in visitados:
            visitados.add((nf, nc))
            cola.append(((nf, nc), dist + 1))
# Pasos hasta la meta: 8
```

## Errores típicos

- **Error**: pensar que "búsqueda" en IA solo se aplica a laberintos o juegos. → **Correcto**: cualquier tarea que se pueda describir como estado inicial, objetivo y operadores es un problema de búsqueda: planificar horarios, enrutar paquetes o demostrar un teorema también lo son.
- **Error**: asumir que un algoritmo de búsqueda exhaustiva siempre es la mejor opción porque "encuentra la solución óptima". → **Correcto**: en espacios grandes la explosión combinatoria lo hace inviable; ahí hacen falta heurísticas o algoritmos evolutivos, que sacrifican garantía de optimalidad a cambio de viabilidad.
- **Error**: confundir un problema de satisfacción con uno de optimización. → **Correcto**: la satisfacción busca cualquier solución válida (cuadrar un horario); la optimización busca la mejor según una función de coste (la ruta más corta).
- **Error**: creer que formalizar el problema es un paso opcional o meramente burocrático. → **Correcto**: sin definir estados, objetivo y operadores con precisión, ningún algoritmo de búsqueda o heurística tiene sobre qué trabajar.

## En resumen

- **Qué hace**: convierte una tarea en un espacio de estados que se explora hasta alcanzar un objetivo.
- **Cómo funciona**: (1) define el estado inicial, los estados objetivo y los operadores; (2) representa el espacio como un grafo; (3) recorre ese grafo con un algoritmo de búsqueda (exhaustivo o heurístico) hasta llegar a la meta.
- **Idea clave**: un problema de búsqueda es la tupla $(S, s_0, A, T, G)$; si además hay coste, el objetivo es minimizarlo.
- **Cuándo usar cada técnica**: búsqueda exhaustiva o reglas si el problema está bien definido y el espacio es manejable; heurísticas (A\*) si el espacio es grande pero se puede estimar el coste restante; algoritmos evolutivos si el espacio es enorme o mal definido.
- **Decisión que más importa**: cómo formalizas el problema (qué cuenta como estado, acción y objetivo), porque de ahí se deriva qué algoritmos son aplicables.
- **Trampa principal**: la explosión combinatoria: el tamaño del espacio de búsqueda puede crecer mucho más rápido que la capacidad de explorarlo entero.

## A fondo

La búsqueda en espacio de estados es, históricamente, el mecanismo fundacional de la IA. El **General Problem Solver (GPS)**, de Newell y Simon en los años cincuenta, ya planteaba resolver un problema como buscar una secuencia de pasos en un espacio de estados representado con símbolos, y ese enfoque dominó la IA simbólica inicial: juegos como el ajedrez o las damas, y la planificación en robótica, fueron sus primeros bancos de pruebas. Fue precisamente ahí donde se hizo evidente la explosión combinatoria, lo que empujó al desarrollo de las heurísticas.

Con el tiempo, la búsqueda y la optimización se filtraron en el resto de paradigmas de la IA, aunque no se consideren un paradigma aparte. En la IA conexionista, optimizar significa ajustar los pesos de una red neuronal mediante descenso de gradiente para minimizar el error. En la IA evolutiva, la búsqueda es la esencia misma del paradigma: poblaciones de soluciones que compiten y se combinan. En la IA probabilística, optimizar es encontrar la explicación más probable para unos datos, por ejemplo mediante métodos de Monte Carlo. Por eso se dice que la búsqueda y la optimización son un hilo conductor transversal a toda la disciplina.

Diseñar un sistema de resolución de problemas también exige atender a requisitos que van más allá del algoritmo elegido: la **escalabilidad** (manejar más datos o más complejidad sin perder rendimiento), la **robustez** (no fallar ante datos faltantes o errores) y el **mantenimiento** (poder actualizar el sistema sin rediseñarlo entero). La elección de herramientas también depende del tipo de problema: frameworks como TensorFlow o PyTorch para aprendizaje automático, OR-Tools para optimización combinatoria y rutas, o Prolog y motores de reglas como Drools para razonamiento simbólico.

## Autoevaluación

### Un robot debe llegar a la salida de un almacén evitando estanterías fijas que ya conoce de antemano. ¿Qué tipo de problema es, según los ejes de esta ficha?
- [ ] Mal definido y con información parcial, porque el robot no controla el entorno.
- [x] Bien definido, determinístico, estático y con información completa, porque el mapa y el objetivo no cambian durante la búsqueda.
- [ ] De satisfacción y estocástico, porque cualquier ruta válida sirve.
> Por qué: el mapa, el estado inicial y la meta están completamente definidos y no cambian mientras el robot calcula la ruta; eso es justo lo que caracteriza a un problema determinístico, estático y con información completa.

### ¿Por qué A* explora menos estados que una búsqueda exhaustiva que revisa todo el espacio?
- [ ] Porque A* solo funciona en espacios discretos y pequeños.
- [ ] Porque A* ignora una parte del espacio de estados al azar.
- [x] Porque usa una heurística que estima el coste restante y prioriza los caminos más prometedores.
> Por qué: la heurística no garantiza el camino exacto de antemano, pero orienta la exploración hacia los estados con más probabilidad de acercar a la meta, evitando expandir ramas poco prometedoras.

### Un algoritmo genético para diseñar la forma de un ala de avión no siempre encuentra la mejor forma posible. ¿Por qué se sigue usando?
- [ ] Porque garantiza la solución óptima si se ejecuta el tiempo suficiente.
- [x] Porque el espacio de posibles formas es tan grande que la búsqueda exhaustiva es inviable, y una solución suficientemente buena en tiempo razonable ya es útil.
- [ ] Porque no depende de ninguna función de aptitud.
> Por qué: los algoritmos evolutivos cambian la garantía de optimalidad por viabilidad práctica en espacios demasiado grandes para explorar por completo.

### ¿Qué distingue a un problema de optimización de uno de satisfacción?
- [ ] El de optimización no tiene restricciones; el de satisfacción sí.
- [x] El de optimización busca la mejor solución según una función objetivo; el de satisfacción busca cualquier solución que cumpla las restricciones, sin comparar su calidad.
- [ ] Solo el de satisfacción puede resolverse con búsqueda en espacio de estados.
> Por qué: cuadrar un horario de turnos respetando restricciones es satisfacción (vale cualquier horario válido); encontrar la ruta más corta es optimización (hay que comparar rutas entre sí).

## Glosario

- **Espacio de búsqueda**: conjunto de todos los estados alcanzables desde el estado inicial, junto con las acciones que los conectan, representado habitualmente como un grafo.
- **Heurística**: regla práctica que estima el coste o la distancia restante hasta el objetivo, usada para priorizar qué caminos explorar primero.
- **Explosión combinatoria**: crecimiento del espacio de búsqueda mucho más rápido que la capacidad de explorarlo por completo, típico de problemas con muchas variables.
- **Algoritmo genético**: método de optimización que mantiene una población de soluciones candidatas y las mejora mediante selección, cruce y mutación guiadas por una función de aptitud.
