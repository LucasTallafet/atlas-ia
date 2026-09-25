---
id: que-es-ml
estado: borrador
---

## En una frase

El aprendizaje automático es la rama de la IA en la que un programa mejora en una tarea a partir de datos de experiencia, en vez de seguir reglas escritas a mano para cada caso.

## Intuición

Enseñar a reconocer perros a un niño de dos formas distintas: dale una lista cerrada de reglas ("cuatro patas, orejas puntiagudas, cola...") o enséñale cien fotos de perros y gatos y deja que aprenda solo qué los distingue. La primera forma falla en cuanto aparece un perro con las orejas caídas que no estaba en la lista; la segunda generaliza mejor porque aprendió el patrón, no la regla exacta.

El **aprendizaje automático (ML**, del inglés *machine learning*) es esa segunda forma, aplicada a un ordenador: en vez de programar explícitamente cada caso, el sistema ajusta su comportamiento a partir de ejemplos.

## Explicación

### De programar reglas a aprender de datos

Un programa tradicional recibe reglas fijas y datos, y produce una salida. El ML invierte esa relación: recibe datos y las salidas esperadas, y de ahí **deriva las reglas** (el modelo) que después aplicará a casos nuevos. Esto lo hace especialmente útil cuando los patrones no son evidentes de antemano o serían demasiado numerosos para codificarlos a mano: reconocer voz, clasificar imágenes o detectar fraudes en transacciones son tareas donde la relación entre entrada y salida es demasiado compleja para reducirla a una lista de reglas.

### Tres definiciones, una misma idea

**Arthur Samuel** (1959) describió el ML como la capacidad de un ordenador de aprender sin ser programado explícitamente para cada caso. **Tom Mitchell** (1997) lo formalizó: un programa aprende de una experiencia $E$ respecto a una tarea $T$ y una medida de rendimiento $P$ si su rendimiento en $T$, medido por $P$, mejora con $E$. Russell y Norvig, en su manual de referencia AIMA, lo sitúan como la herramienta clave de la IA para lograr **adaptabilidad**: sistemas que siguen mejorando a partir de experiencias pasadas.

### Cuándo conviene usar ML (y cuándo no)

El ML conviene cuando los datos son complejos y voluminosos, y la relación entre variables no es evidente ni fácil de programar a mano: clasificación de imágenes, procesamiento del lenguaje o detección de fraude en tiempo real son ejemplos típicos, todos con patrones que emergen de los datos más que de reglas explícitas.

No conviene, en cambio, cuando la relación ya se conoce y se puede describir con precisión. Un controlador de temperatura de un horno industrial, por ejemplo, no necesita aprender de datos: la relación entre temperatura medida y potencia de calefacción se modela con una regla de control simple. Usar ML ahí añadiría complejidad sin ninguna ventaja.

### Lo que caracteriza a un sistema de ML

Tres rasgos distinguen al aprendizaje automático de la programación tradicional:

- **[[generalizacion|Generalización]]**: aplicar lo aprendido con los datos de entrenamiento a datos nuevos que el modelo nunca vio.
- **Automatización**: ajustar reglas y comportamientos a partir de los datos, sin que un programador tenga que codificar cada caso a mano.
- **Adaptabilidad**: seguir mejorando cuando los datos o el entorno cambian, sin necesidad de reconstruir el sistema desde cero.

## Formalización

$$
\text{el programa aprende respecto a } T \text{ si su rendimiento } P(T) \text{ mejora con la experiencia } E
$$

donde:

- $T$ es la **tarea** que se quiere resolver (por ejemplo, clasificar imágenes).
- $E$ es la **experiencia**: los datos de los que aprende el sistema.
- $P$ es la **medida de rendimiento** que cuantifica qué tan bien se resuelve $T$ (por ejemplo, el porcentaje de aciertos).

Esta es la definición de Tom Mitchell (1997), el criterio más usado para decidir si un sistema "aprende": si su valor de $P$ mejora al aumentar $E$, hay aprendizaje; si no mejora, por muchos datos que reciba, no lo hay.

## En código

```python
import numpy as np

# Regla programada a mano: nota = 1.5 · horas de estudio (fija, no aprende)
regla_fija = lambda horas: 1.5 * horas

# Aprendizaje automático: ajusta la regla a partir de datos de experiencia (E)
horas = np.array([1, 2, 3, 4])
nota = np.array([3, 5, 6, 8])
pendiente, intercepto = np.polyfit(horas, nota, 1)  # ajusta con los datos

nuevo = 5
print(f"Regla fija:        {regla_fija(nuevo):.2f}")
print(f"Aprendido de datos: {pendiente * nuevo + intercepto:.2f}")
# Regla fija:        7.50
# Aprendido de datos: 9.50 (pendiente=1.60, intercepto=1.50)
```

## Errores típicos

- **Error**: creer que "aprender" significa que el modelo memoriza los datos de entrenamiento. → **Correcto**: aprender bien significa generalizar el patrón subyacente, no memorizar los ejemplos vistos.
- **Error**: pensar que el ML es la solución por defecto para cualquier problema de datos. → **Correcto**: si la relación entre entradas y salidas ya se conoce y es simple, un sistema de reglas es más barato, rápido y fácil de auditar.
- **Error**: confundir "modelo de ML" con "programa que sigue instrucciones fijas". → **Correcto**: un programa tradicional ejecuta reglas dadas; un modelo de ML deriva esas reglas de los datos y las ajusta con la experiencia.
- **Error**: suponer que más datos garantizan automáticamente mejor rendimiento. → **Correcto**: en la definición de Mitchell, lo que importa es que el rendimiento $P$ mejore con $E$; datos de mala calidad pueden no aportar esa mejora.

## En resumen

- **Qué es**: una rama de la IA en la que el sistema deriva sus reglas de datos de experiencia, en lugar de recibirlas programadas a mano.
- **Definición formal**: un programa aprende una tarea $T$ si su rendimiento $P(T)$ mejora con la experiencia $E$ (Mitchell, 1997).
- **Cuándo usarlo**: cuando los patrones son complejos, cambiantes o demasiado numerosos para programarlos a mano (imágenes, voz, fraude).
- **Cuándo no usarlo**: cuando la relación entre entrada y salida ya se conoce y se puede describir con una regla simple.
- **Tres rasgos que lo definen**: generalización, automatización y adaptabilidad.
- **Trampa principal**: un modelo que memoriza en vez de generalizar parece funcionar bien en pruebas, pero falla ante datos nuevos.

## Autoevaluación

### Un banco quiere detectar transacciones fraudulentas cuyos patrones cambian constantemente. ¿Por qué encaja bien con el ML?
- [ ] Porque las transacciones fraudulentas siguen siempre las mismas reglas fijas.
- [x] Porque los patrones de fraude son complejos y cambiantes, y un sistema que aprende de datos puede adaptarse a variantes nuevas sin reprogramarse.
- [ ] Porque el ML no necesita datos de entrenamiento para funcionar.
> Por qué: el rasgo de adaptabilidad es justo lo que permite a un modelo de ML seguir siendo útil cuando los patrones de fraude evolucionan, algo que un sistema de reglas fijas no puede hacer sin intervención manual.

### Según la definición de Mitchell, ¿qué significa que un sistema de ML "no está aprendiendo"?
- [ ] Que el programa no tiene una tarea $T$ definida.
- [x] Que su rendimiento $P$ en la tarea $T$ no mejora aunque reciba más experiencia $E$.
- [ ] Que el programa no usa una GPU para entrenarse.
> Por qué: la definición de Mitchell liga el aprendizaje a una mejora medible de $P$ con $E$; si esa mejora no ocurre, no hay aprendizaje, independientemente de cuántos datos se le den.

### Un modelo de clasificación de imágenes obtiene un 99% de aciertos en las fotos de entrenamiento, pero falla mucho con fotos nuevas. ¿Qué le falta?
- [ ] Más medida de rendimiento $P$.
- [x] Generalización: probablemente memorizó las fotos de entrenamiento en vez de aprender el patrón subyacente.
- [ ] Una tarea $T$ mejor definida.
> Por qué: un rendimiento alto solo en los datos vistos y bajo en datos nuevos es la señal clásica de falta de generalización, no un problema de la tarea o la métrica.

### Una empresa necesita mantener una temperatura fija en un horno industrial usando un sensor y un actuador. ¿Por qué no conviene aquí el aprendizaje automático?
- [ ] Porque los hornos industriales no generan suficientes datos.
- [x] Porque la relación entre temperatura y potencia de calefacción ya se conoce y puede modelarse con una regla de control simple, sin necesidad de aprender de datos.
- [ ] Porque el ML solo funciona con imágenes y texto.
> Por qué: cuando la relación entre entrada y salida es conocida y simple, un sistema basado en reglas resuelve el problema de forma más directa; el ML aporta valor en patrones que no se conocen de antemano.

## Glosario

- **Aprendizaje automático (ML)**: rama de la IA en la que un sistema mejora su rendimiento en una tarea a partir de datos de experiencia, sin programación explícita para cada caso.
