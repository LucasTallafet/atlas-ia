---
id: policy-gradient
estado: borrador
---

## En una frase
En vez de estimar el valor de cada acción y elegir la mejor, el gradiente de la política ajusta directamente las probabilidades de cada acción para que el agente obtenga, en promedio, más recompensa.

## Intuición

Piensa en un jugador de póker. No existe una "mejor acción" fija para una mano dada: la estrategia óptima consiste en mezclar faroles y bajadas con ciertas probabilidades, porque un comportamiento predecible es explotable por el rival. [[sarsa-qlearning|SARSA y Q-learning]] aprenden $Q(s,a)$ y de ahí derivan una acción casi siempre determinista (salvo el ruido artificial de $\varepsilon$-greedy); no tienen forma natural de representar "farolea el 30 % de las veces en este punto y el 70 % en aquel otro".

Los métodos de **gradiente de política** cambian el objeto que se aprende: en vez de una tabla de valores, se aprende directamente una función $\pi(a|s,\theta)$ que da la probabilidad de cada acción, y se ajustan sus parámetros $\theta$ con la misma idea del [[descenso-gradiente|descenso de gradiente]] que ya conoces del aprendizaje supervisado, solo que aquí se sube en vez de bajar: se busca maximizar la recompensa, no minimizar un error.

## Explicación

### Por qué no basta con aprender valores

Los métodos basados en valor —como SARSA y Q-learning— tropiezan con tres límites. Primero, con **acciones continuas** (la fuerza de un motor entre -1 y 1) no se puede maximizar $q(s,a)$ sobre un continuo de acciones sin discretizar, y discretizar cuesta resolución o dispara el número de acciones. Segundo, salvo el ruido artificial de $\varepsilon$-greedy, la política que producen es **determinista**, y muchos problemas reales (juegos con información imperfecta, coordinación entre agentes) requieren políticas intrínsecamente aleatorias con probabilidades distintas en cada estado. Tercero, combinar aprendizaje off-policy con aproximadores potentes como redes neuronales expone a la [[sarsa-qlearning|tríada mortal]], un riesgo de inestabilidad que los métodos de gradiente de política, al ser habitualmente on-policy, evitan en buena medida.

### Aprender la política directamente

La alternativa es parametrizar la propia política, $\pi(a|s,\theta)$: una función diferenciable que, para cada estado, devuelve una distribución de probabilidad sobre las acciones. El vector $\theta$ son los parámetros a ajustar. Con acciones continuas, esto es inmediato: en vez de maximizar sobre un continuo, se muestrea una acción de una distribución (por ejemplo, gaussiana) cuya media y varianza dependen del estado. Con políticas estocásticas, la aleatoriedad ya no es un truco externo como $\varepsilon$: forma parte de la propia política, y el agente puede aprender cuánta incertidumbre conviene en cada estado.

### El teorema del gradiente de política

Para mejorar $\pi_\theta$ hace falta una medida de calidad. Se define $J(\theta)$ como el retorno esperado siguiendo $\pi_\theta$, y se busca el $\theta$ que lo maximiza mediante [[descenso-gradiente|ascenso por gradiente]]: en cada paso se mueve $\theta$ en la dirección que más aumenta $J$, al contrario que el descenso de gradiente, que se mueve en la dirección que más *reduce* una pérdida. El problema es que no existe una fórmula cerrada de $J(\theta)$ ni de su gradiente, porque dependen de la dinámica del entorno y de la distribución de estados que la propia política induce, ambas desconocidas.

El **teorema del gradiente de política** resuelve esto con un resultado sorprendentemente simple: el gradiente se puede estimar muestreando la política actual, sin necesidad de derivar cómo cambia la distribución de estados con $\theta$. Basta con ejecutar la política, observar pares estado-acción y su retorno, y combinar el retorno con el gradiente del logaritmo de la probabilidad de la acción tomada.

### REINFORCE: la estimación más simple

**REINFORCE** (Williams, 1992) aplica el teorema de la forma más directa: sustituye el valor de la acción por el retorno $G_t$ realmente observado desde ese paso hasta el final del episodio. La interpretación es intuitiva: si $G_t$ es alto, se empuja $\theta$ para hacer más probable la acción tomada; si es bajo o negativo, se empuja en sentido contrario. Es un método de Monte Carlo —necesita episodios completos— y su estimación es insesgada, pero de **alta varianza**: el mismo estado y la misma acción pueden dar retornos muy distintos según cómo continúe el episodio.

### Parametrizaciones habituales

Para acciones discretas, la parametrización más común asigna a cada par $(s,a)$ una preferencia numérica $h(s,a,\theta)$ y convierte las preferencias en probabilidades con una [[funciones-activacion|softmax]]: aquí la softmax no transforma la salida de una capa oculta, sino que convierte "cuánto me gusta cada acción" en una distribución de política. Cuando solo hay dos acciones, es más simple aún usar una [[funciones-activacion|sigmoide]] sobre la diferencia de preferencias: un único parámetro controla, con su signo y magnitud, cuánto se prefiere una acción sobre la otra. Para acciones continuas, la política se representa como una distribución gaussiana cuya media y desviación típica son funciones del estado; muestrear de esa gaussiana genera la acción, y ajustar su media y su varianza es, respectivamente, mejorar el comportamiento y controlar la exploración.

### Reducir la varianza: línea de base y ventaja

La alta varianza de REINFORCE se puede reducir sin introducir sesgo restando al retorno una **línea de base** $b(s_t)$ que no dependa de la acción tomada —típicamente una estimación del valor del estado, $v(s_t)$—. La diferencia $G_t - v(s_t)$ se llama **ventaja**: cuánto mejor o peor resultó la acción frente a lo que normalmente se espera en ese estado. Como $b(s_t)$ no depende de la acción, no cambia el valor esperado de la actualización, pero si se aproxima bien al retorno típico, reduce mucho su varianza. Aprender esa línea de base exige mantener una función de valor adicional junto a la política: es el primer paso hacia los métodos [[actor-critico|actor-crítico]], que veremos a continuación.

## Formalización

El objetivo a maximizar en tareas episódicas es el retorno esperado:

$$
J(\theta) = \mathbb{E}_{\pi_\theta}\left[G(\tau)\right]
$$

donde:
- $J(\theta)$: rendimiento esperado de la política $\pi_\theta$.
- $\tau$: una trayectoria completa generada siguiendo $\pi_\theta$.
- $G(\tau) = \sum_{t=0}^{T-1}\gamma^t r_{t+1}$: el [[mdp|retorno]] acumulado del episodio.

La regla de ascenso por gradiente estocástico:

$$
\theta_{t+1} = \theta_t + \alpha\,\widehat{\nabla_\theta J(\theta_t)}
$$

donde:
- $\alpha$: tasa de aprendizaje.
- $\widehat{\nabla_\theta J}$: una estimación ruidosa pero insesgada del gradiente verdadero.

El teorema del gradiente de política:

$$
\nabla_\theta J(\theta) = \mathbb{E}_{\pi_\theta}\left[\nabla_\theta \log \pi_\theta(a|s)\, Q_{\pi_\theta}(s,a)\right]
$$

donde:
- $\nabla_\theta \log \pi_\theta(a|s)$: gradiente del logaritmo de la probabilidad que la política asigna a la acción tomada.
- $Q_{\pi_\theta}(s,a)$: valor de esa acción bajo la política actual.

REINFORCE sustituye $Q_{\pi_\theta}(s,a)$ por el retorno muestreado $G_t$:

$$
\theta \leftarrow \theta + \alpha\, G_t\, \nabla_\theta \log \pi_\theta(a_t|s_t)
$$

Para la parametrización softmax con preferencias lineales $h(s,a,\theta)=\theta_a^\top x(s,a)$:

$$
\nabla_{\theta_a} \log \pi(a|s,\theta) = x(s,a) - \sum_b \pi(b|s,\theta)\, x(s,b)
$$

donde:
- $x(s,a)$: vector de características del par estado-acción.
- El resultado es la diferencia entre la característica de la acción tomada y el promedio ponderado de las características de todas las acciones.

Para la parametrización sigmoide con dos acciones y $f(s,\theta)=\theta$ (un único parámetro, sin características):

$$
\pi(\text{saltar}|\theta) = \frac{1}{1+e^{-\theta}}, \qquad \nabla_\theta \log \pi(\text{saltar}|\theta) = 1-\pi(\text{saltar}|\theta)
$$

REINFORCE con línea de base:

$$
\theta \leftarrow \theta + \alpha\,\bigl(G_t - b(s_t)\bigr)\, \nabla_\theta \log \pi_\theta(a_t|s_t)
$$

donde:
- $b(s_t)$: línea de base, función solo del estado (no de la acción); habitualmente $b(s_t)=v_\pi(s_t)$.
- $G_t - b(s_t)$: la ventaja de la acción tomada; no cambia el valor esperado de la actualización porque $\mathbb{E}_{a\sim\pi_\theta}[\nabla_\theta\log\pi_\theta(a|s)]=0$ para cualquier estado.

**Ejemplo numérico.** En el agente saltarín, con política sigmoide de un solo parámetro $\theta$, $\theta_0=0$ da $\pi(\text{saltar})=0{,}5$. Con $\alpha=0{,}1$: si el episodio 1 termina con éxito ($G_0=16{,}1$), $\nabla_\theta\log\pi(\text{saltar})=1-0{,}5=0{,}5$ y $\theta_1=0+0{,}1\times16{,}1\times0{,}5=0{,}805$, con $\pi(\text{saltar})\approx0{,}691$. Si el episodio 2 falla ($G_0=-10$) con $\pi(\text{saltar})=0{,}691$, $\theta_2=0{,}805+0{,}1\times(-10)\times(1-0{,}691)=0{,}496$, con $\pi(\text{saltar})\approx0{,}622$. Si el episodio 3 vuelve a tener éxito, $\theta_3=0{,}496+0{,}1\times16{,}1\times(1-0{,}622)\approx1{,}105$, con $\pi(\text{saltar})\approx0{,}751$ (los tres pasos, verificados con Python). El parámetro oscila episodio a episodio, pero su tendencia es a crecer, porque los éxitos (probabilidad 0,9) pesan más en conjunto que los fracasos (probabilidad 0,1).

## Interactivo

```widget
motor: simulacion
modo: "policy-gradient"
config: {"theta_inicial": 0, "alpha": 0.1, "n_episodios": 60, "recompensa_exito": 16.1, "recompensa_fracaso": -10, "prob_exito": 0.9}
semilla: 7
```

Prueba a…
- Prueba a ejecutar la simulación varias veces con distintas semillas y observa cuánto puede variar la trayectoria de $\theta$ entre una y otra: esa es la alta varianza de REINFORCE.
- Prueba a subir `alpha` a 0,5 y observa cómo un solo episodio fallido puede hacer retroceder mucho la probabilidad de saltar.
- Prueba a bajar `prob_exito` por debajo de 0,5 y comprueba que $\theta$ se estabiliza en un valor negativo (la política aprende a preferir la otra acción).

## En código

```python
import math

def pi_saltar(theta):
    return 1 / (1 + math.exp(-theta))

theta, alpha, gamma = 0.0, 0.1, 0.9
retornos = [16.1, -10, 16.1]  # G_0 observado en tres episodios sucesivos

for g in retornos:
    p = pi_saltar(theta)
    grad_log_pi = 1 - p          # gradiente del log de pi(saltar|theta)
    theta += alpha * g * grad_log_pi
    print(round(p, 3), round(theta, 3))
# 0.5 0.805
# 0.691 0.496
# 0.622 1.105
```

## Errores típicos

- **Error**: pensar que el gradiente de política necesita conocer el modelo del entorno para calcular $J(\theta)$. → **Correcto**: el teorema del gradiente de política permite estimarlo solo con muestras (trayectorias observadas), sin derivar cómo cambia la distribución de estados.
- **Error**: creer que REINFORCE con línea de base introduce sesgo por restar algo al retorno. → **Correcto**: mientras la línea de base no dependa de la acción tomada, el valor esperado de la actualización no cambia; solo se reduce la varianza.
- **Error**: confundir "ascenso por gradiente" con un algoritmo distinto del descenso de gradiente. → **Correcto**: es el mismo mecanismo con el signo cambiado; maximizar $J(\theta)$ equivale a minimizar $-J(\theta)$.
- **Error**: usar una política determinista (como la de $\varepsilon$-greedy) con la regla de actualización de REINFORCE. → **Correcto**: la actualización necesita $\nabla_\theta\log\pi_\theta(a|s)$, así que la política debe ser diferenciable y asignar probabilidad positiva a las acciones; una tabla con decisiones deterministas no sirve.

## En resumen

- El gradiente de política aprende directamente $\pi(a|s,\theta)$, una distribución de probabilidad sobre acciones, en vez de derivarla de una función de valor.
- Resuelve tres límites de los métodos basados en valor: acciones continuas, políticas intrínsecamente estocásticas, e inestabilidad al combinar off-policy con redes neuronales (la [[sarsa-qlearning|tríada mortal]]).
- Regla clave: $\theta \leftarrow \theta + \alpha\, G_t\, \nabla_\theta \log \pi_\theta(a_t|s_t)$ (REINFORCE), donde $G_t$ es el retorno observado.
- Se parametriza con softmax para acciones discretas, sigmoide para dos acciones, y gaussiana para acciones continuas.
- Úsalo cuando el espacio de acciones sea continuo o la política óptima deba ser estocástica; para problemas discretos pequeños y bien comportados, SARSA o Q-learning suelen ser más simples y con menos varianza.
- Hiperparámetro que más importa: la tasa de aprendizaje $\alpha$; demasiado alta produce oscilaciones violentas, demasiado baja aprende muy despacio.
- Trampa principal: REINFORCE tiene alta varianza porque usa el retorno completo del episodio; restar una línea de base (el valor del estado) la reduce sin sesgar la estimación.

## A fondo

Cuando el espacio de acciones discreto es muy grande, calcular el denominador de la softmax (la suma sobre todas las acciones) resulta prohibitivo; se recurre entonces a aproximaciones o a políticas que no normalizan explícitamente. Cuando la acción está acotada en un intervalo (por ejemplo, la intensidad de un actuador entre 0 y 1), una distribución **beta** es una alternativa elegante a la gaussiana, porque su densidad es cero fuera del rango y nunca genera acciones inválidas. Cuando la política óptima es multimodal —varias regiones igualmente buenas—, una gaussiana simple no basta, porque solo tiene un pico; se usan entonces **mixturas de gaussianas**. Y si se sabe que la política óptima es determinista, existen los métodos de **gradiente de política determinista** (DDPG y variantes), que aprenden directamente $a=\mu(s,\theta)$ sin componente aleatorio y añaden ruido externo solo para explorar.

La política gaussiana para acciones continuas tiene el logaritmo $\log\pi(a|s,\theta) = -\frac{(a-\mu(s,\theta))^2}{2\sigma(s,\theta)^2} - \frac{1}{2}\log(2\pi\sigma(s,\theta)^2)$, cuyo gradiente respecto a $\theta$ combina la desviación de la acción muestreada respecto a la media con el gradiente de esa media (y de la varianza, si también se aprende). En la práctica, esta derivada la calculan automáticamente las bibliotecas de diferenciación automática; no hace falta programarla a mano.

## Autoevaluación

### ¿Por qué el teorema del gradiente de política es tan relevante, si en el fondo $J(\theta)$ sigue dependiendo de una dinámica del entorno desconocida?
- [ ] Porque asume que el entorno es determinista
- [x] Porque permite estimar el gradiente solo con muestras de trayectorias, sin derivar cómo cambia la distribución de estados con $\theta$
- [ ] Porque elimina la necesidad de conocer las recompensas del entorno
> Por qué: el resultado clave es que el gradiente se expresa como una esperanza sobre $\nabla_\theta\log\pi_\theta(a|s)\,Q(s,a)$, calculable con muestras, sin necesitar la derivada de la distribución de estados.

### En REINFORCE, si un episodio da un retorno $G_t$ muy negativo para una acción concreta, ¿qué le ocurre a $\theta$ tras la actualización?
- [ ] Aumenta la probabilidad de esa acción, porque se ha aprendido algo
- [x] Disminuye la probabilidad de esa acción, porque el producto $G_t\,\nabla_\theta\log\pi_\theta(a|s)$ empuja $\theta$ en sentido contrario al gradiente del logaritmo
- [ ] No cambia, porque REINFORCE ignora los retornos negativos
> Por qué: la regla $\theta\leftarrow\theta+\alpha G_t\nabla_\theta\log\pi_\theta(a_t|s_t)$ con $G_t$ negativo mueve $\theta$ en la dirección que reduce la probabilidad de la acción tomada.

### ¿Por qué restar una línea de base $b(s_t)$ al retorno no introduce sesgo en la actualización de REINFORCE?
- [ ] Porque $b(s_t)$ siempre vale cero en la práctica
- [x] Porque, al no depender de la acción, su contribución esperada a la actualización es cero: $\mathbb{E}_{a\sim\pi_\theta}[\nabla_\theta\log\pi_\theta(a|s)]=0$
- [ ] Porque se calcula después de que termine el entrenamiento
> Por qué: la demostración se apoya en que la suma de probabilidades sobre todas las acciones es constante (igual a 1), así que su gradiente es cero; eso anula el término extra que introduce la línea de base.

### Un robot debe aplicar una fuerza continua entre -1 y 1 en cada articulación. ¿Qué parametrización de la política es más natural?
- [ ] Una tabla $Q(s,a)$ con una fila por cada valor posible de fuerza
- [ ] Una softmax sobre un número finito de acciones discretas
- [x] Una distribución gaussiana cuya media y desviación típica sean funciones del estado
> Por qué: con acciones continuas no se puede enumerar ni maximizar sobre todas las posibilidades; una gaussiana permite muestrear directamente una acción real y ajustar su media y su varianza mediante gradiente.

## Glosario
- **gradiente de política**: familia de métodos de RL que parametrizan la política $\pi(a|s,\theta)$ y ajustan $\theta$ mediante ascenso por gradiente sobre el rendimiento esperado.
- **REINFORCE**: algoritmo de gradiente de política más simple, que estima el gradiente sustituyendo $Q_{\pi_\theta}(s,a)$ por el retorno muestreado $G_t$ de episodios completos.
- **ascenso por gradiente** (*gradient ascent*): igual que el [[descenso-gradiente|descenso de gradiente]] pero moviendo los parámetros en la dirección que *aumenta* la función objetivo, porque en RL se maximiza recompensa en vez de minimizar pérdida.
- **línea de base** (*baseline*): función del estado que se resta al retorno para reducir la varianza de la actualización sin introducir sesgo.
- **ventaja** (*advantage*): diferencia $G_t - v(s_t)$ entre el retorno observado y la línea de base; mide cuánto mejor o peor resultó una acción de lo esperado en ese estado.
