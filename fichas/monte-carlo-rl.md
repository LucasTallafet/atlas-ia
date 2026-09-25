---
id: monte-carlo-rl
estado: borrador
---

## En una frase

Los métodos Monte Carlo estiman el valor de estados y acciones promediando los retornos observados al final de episodios completos, sin necesitar el modelo del entorno.

## Intuición

Imagina que no tienes el plano de la ciudad —no conoces los tiempos exactos de cada tramo—, pero sí puedes hacer el trayecto muchas veces y cronometrarlo. Con suficientes viajes completos, el promedio de tus tiempos te da una estimación fiable de cuánto tarda esa ruta, sin necesidad de conocer ninguna regla de tráfico de antemano.

Eso es lo que hacen los métodos Monte Carlo en aprendizaje por refuerzo: en vez de resolver la ecuación de Bellman con un modelo conocido, como en [[programacion-dinamica]], el agente juega episodios completos —partidas, trayectos, interacciones con principio y fin— y estima el valor de cada estado promediando los retornos que efectivamente obtuvo cada vez que pasó por él. La condición es que el episodio termine: solo entonces se conoce el retorno total y se puede promediar. Este enfoque abre la puerta a aprender en entornos cuyo modelo es desconocido —la inmensa mayoría de problemas reales—, aunque exige esperar hasta el final de cada episodio para aprender algo, una limitación que [[td-learning]] resolverá más adelante.

## Explicación

### De planificar a aprender de episodios

La programación dinámica resuelve las ecuaciones de Bellman con un modelo exacto del entorno ([[programacion-dinamica]]). Los métodos Monte Carlo (MC) parten de la situación opuesta: el agente no conoce $p(s'\mid s,a)$ ni la recompensa esperada, solo puede **interactuar y observar**. Genera [[mdp|episodios]] completos —secuencias $(s_0,a_0,r_1,s_1,\dots,s_T)$ que terminan en un estado terminal— y aprende exclusivamente de lo que realmente ocurrió en ellos.

Esta idea exige que el episodio tenga un final: el [[mdp|retorno]] $G_t$ solo puede calcularse una vez conocidas todas las recompensas posteriores. Por eso MC es natural en tareas **episódicas** (juegos, simulaciones con objetivo claro) y no se aplica directamente a tareas continuas sin final definido.

### Predicción: estimar $v_\pi(s)$ promediando retornos

Para estimar $v_\pi(s)$, MC se apoya en la ley de los grandes números: cada visita a $s$ siguiendo $\pi$ produce una muestra de $G_t$, y el promedio de suficientes muestras converge al valor esperado real. No hace falta resolver ningún sistema de ecuaciones ni conocer el modelo: basta con repetir episodios, calcular $G_t$ recorriendo cada uno **hacia atrás** desde el final ($G_t=r_{t+1}+\gamma G_{t+1}$, con $G_T=0$) y promediar.

### First-visit y every-visit: cuánto exprimir cada episodio

Dentro de un mismo episodio, un estado puede visitarse más de una vez. **First-visit** usa solo el retorno de la primera visita como muestra; **every-visit** usa el retorno de cada visita. Ambas convergen al mismo valor con suficientes episodios, pero difieren en varianza y eficiencia: first-visit evita correlacionar muestras del mismo episodio (más robusto, menos dato por episodio); every-visit aprovecha más información por episodio, a costa de muestras potencialmente correlacionadas entre sí.

### De promedio exacto a $\alpha$ constante

El promedio de $N(s)$ retornos puede reescribirse de forma incremental: $V_{n+1}=V_n+\frac{1}{n}[G_n-V_n]$, donde $1/n$ hace de tasa de aprendizaje decreciente. En entornos **no estacionarios**, donde la dinámica cambia con el tiempo, conviene sustituir $1/n$ por un $\alpha$ constante: la estimación deja de ser un promedio exacto y pasa a ser una media ponderada exponencialmente, que da más peso a las muestras recientes. Esta misma forma de actualización —estimación más $\alpha$ por el error respecto a un objetivo— reaparecerá, con otro objetivo, en [[td-learning]].

### Control: de evaluar a decidir con $\epsilon$-greedy

Estimar valores no basta si el objetivo es actuar bien. Para eso, MC estima la función acción-valor $q_\pi(s,a)$ —igual que $v_\pi(s)$, pero por pares estado-acción— y la usa para construir una política mejor, del mismo modo que la [[programacion-dinamica|mejora de política]] usa $v_\pi$. La diferencia es que aquí no hay modelo: si la política fuera puramente [[programacion-dinamica|greedy]] desde el principio, el agente dejaría de visitar acciones que parecen peores pero podrían no serlo, y nunca corregiría una mala estimación inicial.

La solución habitual es la política **$\epsilon$-greedy**: con probabilidad $1-\epsilon$ elige la acción de mayor $q$ estimado (explotación), y con probabilidad $\epsilon$ elige una acción al azar (exploración). El ciclo de **control on-policy** es: generar un episodio con la política $\epsilon$-greedy actual, actualizar $q(s,a)$ con los retornos observados, y volver a construir la política $\epsilon$-greedy respecto a los valores ya actualizados. Repetido sobre muchos episodios, converge a una política óptima si todos los pares estado-acción se visitan con suficiente frecuencia.

### Control off-policy: aprender de otra política

A veces interesa evaluar o mejorar una política $\pi$ usando episodios generados por otra política distinta $\mu$ —por ejemplo, datos históricos, o una política más exploratoria—. Esto es el aprendizaje [[taxonomia-rl|off-policy]]: $\mu$ es la política de comportamiento que genera la experiencia, $\pi$ la política objetivo que se quiere evaluar. Como las trayectorias no siguen la distribución de $\pi$, hay que corregir el sesgo con **importance sampling**: cada episodio se pondera por cuánto más probable habría sido bajo $\pi$ que bajo $\mu$. Episodios que $\pi$ nunca habría generado reciben peso cero; el resto se pondera y promedia. El precio es una varianza que puede crecer mucho si $\pi$ y $\mu$ son muy distintas.

## Formalización

La estimación por promedio de retornos:

$$
\hat v_\pi(s) = \frac{1}{N(s)}\sum_{i=1}^{N(s)} G^{(i)}(s)
$$

donde:
- $N(s)$: número de visitas contabilizadas al estado $s$ (según first-visit o every-visit) a lo largo de todos los episodios.
- $G^{(i)}(s)$: retorno observado en la $i$-ésima visita a $s$.

Su forma incremental, con tasa de aprendizaje $\alpha$:

$$
V(s) \leftarrow V(s) + \alpha\bigl[G_t - V(s)\bigr]
$$

donde:
- $V(s)$: estimación actual del valor de $s$.
- $\alpha$: tasa de aprendizaje; $\alpha=1/n$ recupera el promedio exacto, un $\alpha$ constante da más peso a las muestras recientes.
- $G_t$: retorno observado en la visita más reciente a $s$.

La política $\epsilon$-greedy respecto a $q$:

$$
\pi(a\mid s)=\begin{cases}1-\epsilon+\dfrac{\epsilon}{|\mathcal{A}(s)|} & \text{si } a=\arg\max_{a'} q(s,a') \\ \dfrac{\epsilon}{|\mathcal{A}(s)|} & \text{en otro caso}\end{cases}
$$

donde:
- $\epsilon$: probabilidad de explorar en vez de explotar.
- $|\mathcal{A}(s)|$: número de acciones disponibles en $s$.
- $q(s,a)$: estimación actual de la función acción-valor.

El peso de importancia para corregir el sesgo off-policy:

$$
\rho(\tau) = \prod_{t=0}^{T-1}\frac{\pi(a_t\mid s_t)}{\mu(a_t\mid s_t)}, \qquad V^\pi(s)=\frac{\sum_\tau \rho(\tau)\,G_t(\tau)}{\sum_\tau \rho(\tau)}
$$

donde:
- $\tau$: una trayectoria observada, generada realmente por la política de comportamiento $\mu$.
- $\pi(a_t\mid s_t)$, $\mu(a_t\mid s_t)$: probabilidad de la acción tomada en el paso $t$ bajo la política objetivo y bajo la de comportamiento, respectivamente.
- $\rho(\tau)$: peso de importancia de la trayectoria completa.

**Ejemplo numérico.** En un episodio $A\xrightarrow{r=1}A\xrightarrow{r=2}A\xrightarrow{r=3}B$ (con $\gamma=1$), los retornos desde cada visita a $A$ son $G_0=6$, $G_1=5$, $G_2=3$ (verificado con `numpy`). First-visit usa solo $G_0=6$; every-visit promedia las tres, $(6+5+3)/3\approx4{,}67$. En un ejemplo off-policy con $\pi(a_1\mid s_1)=1$ y $\mu(a_1\mid s_1)=\mu(a_0\mid s_1)=0{,}5$, tres episodios con retornos $G=1,0,1$ (el segundo tomó $a_0$, que $\pi$ nunca elegiría) dan pesos $\rho=2,0,2$ y $V^\pi(s_1)=\frac{2\cdot1+0\cdot0+2\cdot1}{2+0+2}=1$.

## Interactivo

```widget
motor: rejilla
modo: monte-carlo
mapa: ["S...", ".X.X", "...X", "X..G"]
gamma: 0.9
alpha: 0.1
epsilon: 0.2
```

- Prueba a lanzar varios episodios seguidos y observa que el valor de un estado solo se actualiza cuando el episodio termina, no en cada paso.
- Prueba a subir $\epsilon$ y comprueba que aparecen más trayectorias distintas, aunque tarden más en estabilizarse los valores.
- Prueba a comparar first-visit y every-visit sobre el mismo conjunto de episodios: fíjate en qué estados difieren más sus estimaciones.

## En código

```python
import numpy as np

episodio = [1, 2, 3]  # recompensas r1, r2, r3 tras cada visita a A
retorno_first = sum(episodio)                    # solo la 1ª visita
retorno_every = [sum(episodio[i:]) for i in range(len(episodio))]

print(retorno_first)              # 6
print(np.mean(retorno_every))     # 4.666...
```

## Errores típicos

- **Error**: pensar que Monte Carlo actualiza el valor de un estado en cuanto se visita. → **Correcto**: hay que esperar a que termine el episodio, porque el retorno depende de todas las recompensas futuras.
- **Error**: creer que first-visit y every-visit dan siempre resultados muy distintos. → **Correcto**: ambos convergen al mismo valor esperado con suficientes episodios; solo difieren en varianza y velocidad de convergencia con pocos datos.
- **Error**: usar una política puramente greedy para el control Monte Carlo desde el principio. → **Correcto**: sin exploración, el agente puede quedarse con una estimación inicial errónea y nunca corregirla; por eso se usa $\epsilon$-greedy.
- **Error**: pensar que el importance sampling corrige el sesgo sin coste. → **Correcto**: cuando $\pi$ y $\mu$ difieren mucho, los pesos $\rho(\tau)$ pueden dispararse y producir estimaciones de alta varianza.

## En resumen

- Qué hace: estima $v_\pi(s)$ y $q_\pi(s,a)$ promediando los retornos observados en episodios completos, sin necesitar el modelo del entorno.
- Cómo funciona: genera episodios → calcula $G_t$ recorriendo cada uno hacia atrás → promedia por estado (o por par estado-acción) con first-visit o every-visit.
- Fórmula clave: $\hat v_\pi(s)=\frac{1}{N(s)}\sum_i G^{(i)}(s)$, equivalente a la regla incremental $V(s)\leftarrow V(s)+\alpha[G_t-V(s)]$.
- Cuándo usarlo: entornos episódicos donde se puede simular o jugar muchas partidas completas.
- Cuándo no: tareas continuas sin final claro, o episodios muy largos donde esperar al final penaliza la velocidad de aprendizaje; ahí conviene [[td-learning]].
- Decisiones que importan: first-visit vs. every-visit, $\alpha$ constante vs. $1/n$, y el valor de $\epsilon$ en el control on-policy.
- La trampa principal: confundir "no necesita modelo" con "no necesita episodios completos"; MC sigue exigiendo llegar al final para aprender.

## A fondo

La garantía de convergencia del control Monte Carlo descansa en un supuesto que rara vez se cumple del todo: que, con el tiempo, todos los pares estado-acción se visiten infinitas veces. En la práctica esto se aproxima manteniendo $\epsilon>0$ durante todo el entrenamiento, o reduciéndolo gradualmente (*GLIE*, *greedy in the limit with infinite exploration*), de forma que la política siga siendo exploratoria al principio y casi determinista al final.

En el control off-policy, el importance sampling tal y como se ha presentado —dividiendo por la suma de pesos $\rho(\tau)$— se conoce como *importance sampling ponderado*, y en la práctica reduce la varianza frente a promediar directamente los productos $\rho(\tau)\cdot G_t(\tau)$ sin normalizar (*importance sampling ordinario*), aunque introduce un sesgo pequeño que desaparece según crece el número de episodios. Cuando las trayectorias son largas, el producto de muchos cocientes $\pi/\mu$ puede crecer o decrecer exponencialmente, por lo que los métodos TD, que solo necesitan corregir un paso cada vez en lugar de una trayectoria completa, suelen preferirse en la práctica para el aprendizaje off-policy.

Sea on-policy u off-policy, la posición de Monte Carlo dentro del ecosistema de RL es la de una transición: comparte con la programación dinámica el objetivo de estimar $v_\pi$ y $q_\pi$ mediante la misma estructura de Bellman, pero, como [[td-learning|TD]], aprende exclusivamente de experiencia real, sin modelo. Le falta, eso sí, la capacidad de actualizar antes de que el episodio termine, que es precisamente la idea que introduce TD.

## Autoevaluación

### En un episodio, el estado $A$ se visita tres veces con retornos $G_0=6$, $G_1=5$ y $G_2=3$. ¿Qué estimación de $v_\pi(A)$ produce every-visit Monte Carlo con este único episodio?
- [ ] 6, porque solo cuenta la primera visita
- [x] Aproximadamente 4,67, el promedio de las tres visitas
- [ ] 3, porque solo cuenta la última visita, la más cercana al final
> Por qué: every-visit promedia el retorno de todas las visitas al estado dentro del episodio: $(6+5+3)/3\approx4{,}67$; first-visit, en cambio, usaría solo $G_0=6$.

### ¿Por qué los métodos Monte Carlo no se aplican directamente a tareas continuas sin final definido?
- [ ] Porque no pueden usar la ecuación de Bellman
- [x] Porque el retorno $G_t$ solo puede calcularse una vez conocidas todas las recompensas hasta el final del episodio
- [ ] Porque exigen conocer la función de transición del entorno
> Por qué: el cálculo de $G_t$ depende de recorrer el episodio completo hacia atrás desde el estado terminal; sin un final, nunca hay un retorno completo que promediar. La tercera opción confunde esta limitación con la de la programación dinámica, que sí exige modelo.

### Un agente usa una política puramente greedy (sin $\epsilon$) desde el primer episodio de control Monte Carlo. ¿Qué riesgo corre?
- [ ] Ninguno: greedy siempre converge más rápido a la política óptima
- [x] Quedarse anclado en una estimación inicial errónea, sin volver a probar acciones que parecían peores por azar
- [ ] Que el retorno $G_t$ deje de calcularse correctamente
> Por qué: sin exploración, el agente nunca revisita acciones que una estimación temprana (posiblemente ruidosa) descartó como malas, y puede quedarse en un óptimo aparente. $\epsilon$-greedy mantiene una probabilidad mínima de seguir explorando.

### En un episodio off-policy, la acción realmente tomada en $s_1$ no coincide con la que habría tomado la política objetivo $\pi$, que es determinista. ¿Qué peso de importancia $\rho$ recibe ese episodio?
- [ ] Un valor negativo, para penalizar la desviación
- [x] Cero, porque $\pi(a\mid s_1)=0$ para esa acción
- [ ] El mismo peso que si la acción sí hubiera coincidido
> Por qué: $\rho(\tau)=\prod_t \pi(a_t\mid s_t)/\mu(a_t\mid s_t)$; si $\pi$ es determinista y la acción observada no es la que $\pi$ elegiría, $\pi(a_t\mid s_t)=0$ y el episodio entero recibe peso cero, sin aportar a la estimación.

## Glosario

- **first-visit**: variante de Monte Carlo que usa solo la primera visita a cada estado dentro de un episodio como muestra del retorno.
- **every-visit**: variante de Monte Carlo que usa todas las visitas a un estado dentro de un episodio como muestras independientes.
- **política $\epsilon$-greedy**: política que explota la mejor acción conocida con probabilidad $1-\epsilon$ y explora una acción al azar con probabilidad $\epsilon$.
- **importance sampling**: técnica que repondera episodios generados por una política de comportamiento para estimar el valor bajo una política objetivo distinta.
