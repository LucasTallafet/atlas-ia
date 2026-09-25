---
id: lstm-gru
estado: borrador
---

## En una frase

La LSTM y la GRU añaden puertas aprendidas que deciden qué información recordar, olvidar o comunicar en cada paso, resolviendo así el desvanecimiento del gradiente de la RNN simple.

## Intuición

Imagina que llevas un cuaderno de notas mientras lees una novela larga. Una [[rnn|red recurrente]] simple, en cada página, borra el cuaderno entero y lo vuelve a escribir de memoria: es normal que los detalles de los primeros capítulos se pierdan por el camino. La **LSTM** (*Long Short-Term Memory*), en cambio, mantiene un cuaderno aparte —el **estado de celda**— que no se reescribe entero en cada página: solo tacha lo que decide que ya no importa y añade lo nuevo relevante con un lápiz, sin borrar el resto. Tres decisiones gobiernan ese cuaderno: qué tachar (olvido), qué anotar (entrada) y qué contar en voz alta ahora mismo (salida). Esas decisiones no son reglas fijas: son pequeñas redes que la propia LSTM aprende durante el entrenamiento, igual que aprende los pesos de cualquier capa.

La **GRU** (*Gated Recurrent Unit*) es la misma idea con menos burocracia: en vez de un cuaderno aparte y tres decisiones, usa un único cuaderno y solo dos preguntas —¿cuánto de lo antiguo mantengo? y ¿cuánto ignoro del pasado para entender la frase actual?—. Menos piezas significa menos parámetros que entrenar y menos memoria que ocupar, algo que importa cuando el modelo debe correr en un móvil en vez de en un servidor con GPU.

## Explicación

### Por qué una RNN simple no basta

En una [[rnn]] estándar, la señal de error atraviesa una multiplicación matricial y una activación en cada paso, lo que la desintegra de forma exponencial en secuencias largas: es el desvanecimiento del gradiente. La LSTM y la GRU no cambian el objetivo —seguir resumiendo una secuencia en un estado—, sino el mecanismo interno para actualizarlo.

### La LSTM: un cuaderno aparte que casi no se reescribe

El **estado de celda** ($C_t$) es un vector que recorre la secuencia en paralelo al estado oculto ($h_t$) y se actualiza mediante **sumas**, no productos: la derivada de una suma es la identidad, así que el gradiente puede viajar cientos de pasos atrás sin encogerse. Tres puertas, cada una una mini-red con activación sigmoide (salida entre 0 y 1, como un grifo analógico), controlan ese flujo: la **puerta de olvido** decide qué borrar de $C_{t-1}$, la **puerta de entrada** decide qué candidato nuevo se suma, y la **puerta de salida** decide qué parte de $C_t$ se publica como $h_t$.

### La GRU: la misma idea con menos piezas

La GRU fusiona el estado de celda y el estado oculto en un único vector $h_t$, y reduce las tres puertas a dos: la **puerta de actualización** ($z_t$) decide cuánto del pasado se mantiene frente a cuánto del presente se incorpora, y la **puerta de reinicio** ($r_t$) decide cuánta memoria previa se ignora al calcular el candidato de este paso. Con menos matrices de pesos que entrenar, la GRU es más rápida y ligera, lo que la hace habitual en dispositivos con recursos limitados (*Edge AI*).

| Característica | RNN simple | LSTM | GRU |
|---|---|---|---|
| Estado que viaja en el tiempo | Solo $h_t$ | $C_t$ y $h_t$ separados | Solo $h_t$ (fusiona ambos) |
| Puertas | Ninguna | 3: olvido, entrada, salida | 2: actualización, reinicio |
| Parámetros a entrenar | Pocos | Muchos | Intermedio |
| Dependencias largas | Débil (desvanece) | Fuerte | Fuerte, similar a LSTM |
| Coste computacional | Bajo | Alto | Medio |

## Formalización

**LSTM.** En cada paso $t$, con entrada $x_t$ y estado oculto anterior $h_{t-1}$:

$$F_t = \sigma(W_{xF}x_t + W_{hF}h_{t-1} + b_F)$$
$$I_t = \sigma(W_{xI}x_t + W_{hI}h_{t-1} + b_I), \quad \tilde{C}_t = \tanh(W_{xC}x_t + W_{hC}h_{t-1} + b_C)$$
$$C_t = F_t \ast C_{t-1} + I_t \ast \tilde{C}_t$$
$$O_t = \sigma(W_{xO}x_t + W_{hO}h_{t-1} + b_O), \quad h_t = O_t \ast \tanh(C_t)$$

donde:
- $F_t$, $I_t$, $O_t$: puertas de olvido, entrada y salida (vectores con valores entre 0 y 1)
- $\tilde{C}_t$: vector de nuevos valores candidatos para el estado de celda
- $C_t$, $C_{t-1}$: estado de celda actual y anterior
- $h_t$, $h_{t-1}$: estado oculto actual y anterior
- $x_t$: entrada en el paso $t$
- $W_{(\cdot)}$, $b_{(\cdot)}$: pesos y sesgos propios de cada puerta, aprendidos en el entrenamiento
- $\sigma$: función sigmoide; $\ast$: producto de Hadamard (elemento a elemento)

Ejemplo numérico (una sola unidad, para seguir el cálculo): con $x_t=1$, $h_{t-1}=0{,}5$, $C_{t-1}=0{,}3$ y pesos fijados en $0{,}4$-$0{,}9$ según la posición, se obtiene $F_t=0{,}68$, $I_t=0{,}65$, $\tilde{C}_t=0{,}74$, $C_t=0{,}68$, $O_t=0{,}63$ y $h_t=0{,}38$ (verificado con `numpy`).

**GRU.** Con la misma entrada $x_t$ y $h_{t-1}$:

$$z_t = \sigma(W_{xz}x_t + W_{hz}h_{t-1} + b_z), \quad r_t = \sigma(W_{xr}x_t + W_{hr}h_{t-1} + b_r)$$
$$\tilde{h}_t = \tanh(W_{xh}x_t + W_{hh}(r_t \ast h_{t-1}) + b_h)$$
$$h_t = (1 - z_t) \ast h_{t-1} + z_t \ast \tilde{h}_t$$

donde:
- $z_t$: puerta de actualización (mezcla pasado/presente)
- $r_t$: puerta de reinicio (cuánta memoria previa se ignora al calcular el candidato)
- $\tilde{h}_t$: estado candidato
- $h_t$, $h_{t-1}$: estado oculto actual y anterior (fusiona lo que en la LSTM eran $C_t$ y $h_t$)

Con los mismos $x_t=1$, $h_{t-1}=0{,}5$ y pesos análogos, se obtiene $z_t=0{,}65$ y $h_t=0{,}66$ (verificado con `numpy`): con dos puertas, la GRU llega a un resultado del mismo tipo que la LSTM.

## Interactivo

```widget
motor: pasos
---
Entrada del paso: $x_t=1$, estado oculto anterior $h_{t-1}=0{,}5$, estado de celda anterior $C_{t-1}=0{,}3$. Vamos a ver qué hace cada puerta de la LSTM con estos mismos tres números.
---
Puerta de olvido: $F_t=\sigma(0{,}5\cdot x_t+0{,}5\cdot h_{t-1})=0{,}68$. Como está lejos de 0, la red conserva la mayor parte de lo que ya sabía en $C_{t-1}$.
---
Puerta de entrada: filtro $I_t=\sigma(0{,}6\cdot x_t-0{,}2\cdot h_{t-1}+0{,}1)=0{,}65$ y candidato $\tilde{C}_t=\tanh(0{,}9\cdot x_t+0{,}1\cdot h_{t-1})=0{,}74$. Solo una fracción del candidato entrará a la cinta transportadora.
---
Actualización del estado de celda: $C_t=F_t\cdot C_{t-1}+I_t\cdot\tilde{C}_t=0{,}68\cdot0{,}3+0{,}65\cdot0{,}74=0{,}68$. Es una suma: lo antiguo conservado más lo nuevo filtrado.
---
Puerta de salida: $O_t=\sigma(0{,}4\cdot x_t+0{,}3\cdot h_{t-1})=0{,}63$. El nuevo estado oculto es $h_t=O_t\cdot\tanh(C_t)=0{,}63\cdot\tanh(0{,}68)=0{,}38$: solo una fracción de la memoria profunda se publica hacia el exterior.
---
La GRU resuelve el mismo paso con solo dos puertas y un único estado: $z_t=\sigma(0{,}5\cdot x_t+0{,}4\cdot h_{t-1}-0{,}1)=0{,}65$ decide la mezcla pasado/presente, y $h_t=(1-z_t)\cdot h_{t-1}+z_t\cdot\tilde{h}_t=0{,}66$. Sin estado de celda aparte, pero dosificando igual cuánto cambia la memoria en cada paso.
```

Prueba a calcular qué le pasaría a $C_t$ (fotograma 4) si $F_t$ fuera cercano a 0 en vez de 0,68.

Prueba a comparar cuántas puertas evalúas para llegar a $h_t$ en la LSTM (fotogramas 2-5) frente a la GRU (fotograma 6).

Prueba a identificar en qué fotograma se usa una suma en vez de un producto, y explica por qué esa operación protege el gradiente en secuencias largas.

## Errores típicos

- **Error**: pensar que las puertas son reglas fijas escritas a mano (por ejemplo "olvida siempre al final de una frase") → **Correcto**: son mini-redes con pesos entrenables; la red aprende cuándo abrir o cerrar cada puerta según los datos, no según una regla programada.
- **Error**: creer que la GRU es simplemente "una LSTM con menos precisión" → **Correcto**: en la mayoría de tareas la GRU alcanza un rendimiento similar a la LSTM con menos parámetros; la elección suele depender de recursos disponibles, no de una jerarquía de calidad.
- **Error**: confundir el estado de celda $C_t$ con el estado oculto $h_t$ en la LSTM → **Correcto**: $C_t$ es la memoria profunda que casi no cambia; $h_t$ es el resumen que se expone en cada paso y que sí puede variar bruscamente. La GRU, en cambio, sí los fusiona en un único vector.
- **Error**: suponer que una puerta con valor 0,5 es un fallo de la red → **Correcto**: 0,5 significa que la puerta deja pasar la mitad de la señal a propósito; las puertas son controles analógicos, no interruptores binarios.

## En resumen

- La LSTM y la GRU resuelven el desvanecimiento del gradiente de la RNN simple sustituyendo actualizaciones puramente multiplicativas por un flujo con sumas.
- La LSTM usa un estado de celda $C_t$ aparte del estado oculto $h_t$, controlado por tres puertas (olvido, entrada, salida); la GRU fusiona ambos estados en $h_t$ y usa solo dos puertas (actualización, reinicio).
- Fórmula clave: $C_t = F_t \ast C_{t-1} + I_t \ast \tilde{C}_t$ (LSTM) — la actualización es una suma ponderada, no una reescritura completa.
- Usa LSTM cuando la capacidad de memoria importa más que el coste; usa GRU cuando el modelo debe entrenarse rápido o correr con recursos limitados.
- No hace falta diseñar las puertas a mano: son capas sigmoide/tanh más que se entrenan junto con el resto de la red.
- La trampa principal: pensar que más puertas siempre es mejor; en secuencias cortas o con poco dato, tanta capacidad extra de la LSTM puede sobreajustar más que la GRU.

## A fondo

La clave de por qué la LSTM protege el gradiente se llama **Carrusel de Error Constante**: al depender $C_t$ de una suma y no de un producto matricial repetido, el error puede propagarse cientos de pasos atrás sin encogerse exponencialmente.

La GRU fue propuesta por Kyunghyun Cho et al. en 2014, años después de la LSTM (1997), buscando capacidad similar con menos parámetros y memoria, lo que la hace habitual en dispositivos con recursos limitados. En la práctica, la LSTM tiende a rendir algo mejor con dependencias muy largas y muchos datos; la GRU es preferible cuando el tiempo de entrenamiento o el despliegue son la restricción principal. Ambas se usaron mucho en traducción automática y generación de texto antes de la llegada de la atención ([[embeddings-contextuales]], [[dl-para-nlp]]).

## Autoevaluación

### Un vector de la puerta de olvido tiene un valor cercano a 0 en la posición correspondiente al género gramatical del sujeto. ¿Qué efecto tiene esto sobre $C_t$?
- [ ] Aumenta el peso de esa información en el nuevo estado de celda
- [x] Borra (o reduce mucho) esa información concreta del estado de celda acumulado
- [ ] No tiene ningún efecto porque la puerta de olvido solo afecta al estado oculto
> Por qué: un valor cercano a 0 en $F_t$ hace que $F_t \ast C_{t-1}$ anule ese componente de la memoria; la puerta de olvido actúa componente a componente sobre $C_{t-1}$, no sobre $h_t$ directamente.

### ¿Por qué la actualización $C_t = F_t \ast C_{t-1} + I_t \ast \tilde{C}_t$ ayuda contra el desvanecimiento del gradiente, a diferencia de la actualización de una RNN simple?
- [ ] Porque usa la función sigmoide en vez de tanh
- [ ] Porque tiene más parámetros y por tanto más capacidad
- [x] Porque es una suma, cuya derivada es la identidad, en vez de un producto matricial que encoge el gradiente en cada paso
> Por qué: la naturaleza aditiva (no multiplicativa) de la actualización del estado de celda es justamente el "carrusel de error constante" que permite que el gradiente viaje muchos pasos atrás sin degradarse.

### Un equipo necesita desplegar un modelo secuencial en un sensor con muy poca memoria y batería. ¿Qué arquitectura de las dos es más razonable elegir por defecto?
- [ ] LSTM, porque siempre tiene mejor precisión que la GRU
- [x] GRU, porque tiene menos puertas y parámetros, y por tanto menor coste computacional y de memoria
- [ ] Ninguna de las dos, porque ambas necesitan GPU obligatoriamente
> Por qué: la GRU fusiona el estado de celda y el oculto y usa solo dos puertas, lo que reduce el número de matrices de pesos frente a la LSTM sin perder demasiada capacidad de capturar dependencias largas.

### ¿Qué diferencia principal hay entre la puerta de actualización ($z_t$) de la GRU y la puerta de olvido ($F_t$) de la LSTM?
- [ ] Son exactamente la misma operación con distinto nombre
- [x] $z_t$ combina en una sola decisión lo que en la LSTM se reparte entre la puerta de olvido y la puerta de entrada
- [ ] $z_t$ solo actúa sobre la entrada $x_t$, nunca sobre el estado anterior
> Por qué: $z_t$ pondera a la vez cuánto se mantiene del pasado ($1-z_t$) y cuánto se incorpora del candidato nuevo ($z_t$), fusionando el papel de dos puertas separadas de la LSTM en una sola.

## Glosario

- **estado de celda**: vector de memoria de la LSTM que se actualiza mediante sumas y viaja en paralelo al estado oculto a lo largo de la secuencia.
- **puerta de olvido**: mini-red con activación sigmoide que decide qué parte del estado de celda anterior se descarta.
- **puerta de entrada**: mini-red que decide qué parte de un candidato nuevo se añade al estado de celda.
- **puerta de salida**: mini-red que decide qué parte del estado de celda se expone como nuevo estado oculto.
- **puerta de actualización**: en la GRU, decide el equilibrio entre mantener el estado anterior o incorporar el candidato nuevo.
- **puerta de reinicio**: en la GRU, decide cuánta memoria previa se ignora al calcular el candidato del paso actual.
