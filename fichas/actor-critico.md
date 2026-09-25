---
id: actor-critico
estado: borrador
---

## En una frase
El actor-crítico combina una política que decide (el actor) con una función de valor que la evalúa al instante (el crítico), actualizando ambos tras cada paso en vez de esperar a que termine el episodio.

## Intuición

En [[policy-gradient|REINFORCE con línea de base]], el agente tenía que terminar todo el episodio para calcular el retorno $G_t$ y solo entonces sabía si su acción había sido buena o mala. Es como un aprendiz de cocina que solo recibe la nota del plato al final de un banquete de seis platos: sabe que algo falló, pero no en qué paso. El actor-crítico añade un segundo papel, el **crítico**, que prueba la salsa nada más servirla y avisa inmediatamente si va bien o mal. El **actor** —la política— ajusta su comportamiento con ese aviso instantáneo, sin esperar al final de la cena.

## Explicación

En REINFORCE con línea de base, la ventaja se calculaba como $G_t - v(s_t)$: había que esperar al retorno completo del episodio. El actor-crítico sustituye ese retorno por una estimación de un solo paso: la recompensa inmediata más el valor estimado del estado siguiente, exactamente el [[td-learning|error de TD]] que ya conoces de los métodos de predicción. Esto permite actualizar en cada transición, sin esperar al final del episodio, y funciona tanto en tareas episódicas como en tareas continuas sin final definido.

El esquema mantiene dos componentes que aprenden a la vez: el **actor**, la política parametrizada $\pi_\theta(a|s)$, que decide qué hacer; y el **crítico**, la función de valor $v_w(s)$, que evalúa los estados. En cada paso, el crítico calcula su error de TD y se actualiza para reducirlo; el actor usa ese mismo error como estimación de la [[policy-gradient|ventaja]] y ajusta $\theta$ en la dirección que hace más probable la acción tomada, si el error fue positivo, o menos probable, si fue negativo.

La ganancia es doble: se aprende en tiempo real (sin trayectorias completas) y la varianza baja aún más que con la línea de base de REINFORCE, porque el error de TD solo depende de una recompensa y una estimación, no de la suma de muchas recompensas futuras. El precio es un posible **sesgo**: si el crítico aún no ha aprendido bien, el actor recibe señales algo erróneas. En la práctica, con tasas de aprendizaje adecuadas, esa reducción de varianza compensa con creces el sesgo introducido, y el esquema actor-crítico es la base de algoritmos modernos como A2C, A3C, PPO y SAC.

## Formalización

$$
\delta_t = r_{t+1} + \gamma\, v_w(s_{t+1}) - v_w(s_t)
$$

donde:
- $\delta_t$: error de TD, usado aquí como estimación instantánea de la ventaja.
- $v_w(s)$: función de valor del crítico, con parámetros $w$; en un estado terminal, $v_w(s_{t+1})=0$.

Actualización del crítico y del actor en el mismo paso:

$$
w \leftarrow w + \alpha_w\, \delta_t\, \nabla_w v_w(s_t), \qquad \theta \leftarrow \theta + \alpha_\theta\, \delta_t\, \nabla_\theta \log \pi_\theta(a_t|s_t)
$$

donde:
- $\alpha_w$, $\alpha_\theta$: tasas de aprendizaje del crítico y del actor, ajustables por separado.

## Interactivo

```widget
motor: pasos
fotogramas: [{"texto": "Estado $s_t=0$. El actor $\\pi_\\theta$ elige **saltar** con probabilidad $0{,}62$.", "tabla": {"cabecera": ["componente", "valor"], "filas": [["actor: $\\theta$", "0,5"], ["crítico: $v(0)$", "0,5"]]}}, {"texto": "El entorno transita a $s_{t+1}=2$ con recompensa $r=-1$ (no terminal). El crítico ya conocía $v(2)=1{,}0$.", "tabla": {"cabecera": ["variable", "valor"], "filas": [["$r$", "-1"], ["$v(2)$", "1,0"]]}}, {"texto": "El crítico calcula el error de TD: $\\delta = -1 + 0{,}9\\times1{,}0 - 0{,}5 = -0{,}6$. Es peor de lo esperado.", "tabla": {"cabecera": ["cálculo", "valor"], "filas": [["$\\delta_t$", "-0,6"]], "resaltar": [[0, 1]]}}, {"texto": "Con $\\delta_t<0$: el crítico corrige $v(0)$ hacia abajo y el actor reduce ligeramente la probabilidad de haber saltado. Si $\\delta_t$ hubiera sido positivo, ambas ajustes irían en sentido contrario."}]
```

Prueba a…
- Prueba a avanzar fotograma a fotograma y localiza el momento exacto en que el crítico "avisa" al actor, sin esperar a que termine el episodio.
- Prueba a imaginar que la transición hubiera llevado directamente a la meta ($r=+19$): calcula tú mismo el nuevo $\delta_t$ y decide si el actor aumentaría o reduciría la probabilidad de saltar.

## Errores típicos

- **Error**: pensar que el actor-crítico sustituye a REINFORCE con línea de base porque es "mejor" en todos los casos. → **Correcto**: son complementarios; REINFORCE con línea de base es insesgado y preferible con episodios cortos, mientras que el actor-crítico sacrifica algo de sesgo por aprender en tiempo real, ideal en episodios largos o tareas continuas.
- **Error**: creer que el crítico decide qué acción tomar. → **Correcto**: quien decide es el actor ($\pi_\theta$); el crítico solo evalúa los estados y produce la señal $\delta_t$ que guía la actualización del actor.
- **Error**: actualizar el actor con el error de TD de un crítico sin entrenar todavía. → **Correcto**: si el crítico está muy lejos de estimar bien $v(s)$, introduce sesgo real en el actor; por eso conviene vigilar que ambos aprendan a ritmos compatibles ($\alpha_w$, $\alpha_\theta$).

## En resumen

- El actor-crítico mantiene dos aprendices simultáneos: el actor ($\pi_\theta$, decide) y el crítico ($v_w$, evalúa).
- Sustituye el retorno completo de REINFORCE por el error de TD de un solo paso: $\delta_t = r_{t+1}+\gamma v_w(s_{t+1}) - v_w(s_t)$.
- Se actualiza en cada transición, no al final del episodio: sirve también para tareas continuas.
- Reduce mucho la varianza frente a REINFORCE, a cambio de introducir algo de sesgo si el crítico aún no es preciso.
- Es la base de algoritmos modernos (A2C, A3C, PPO, SAC).
- Trampa principal: confundir la señal que usa el actor ($\delta_t$, una ventaja aproximada de un solo paso) con el retorno completo que usaba REINFORCE.

## Autoevaluación

### ¿Qué sustituye el actor-crítico en lugar del retorno completo $G_t$ de REINFORCE?
- [ ] La recompensa media de todos los episodios anteriores
- [x] El error de TD, $r_{t+1}+\gamma v_w(s_{t+1})-v_w(s_t)$
- [ ] La acción de máximo valor en el siguiente estado
> Por qué: el actor-crítico hace bootstrap con la estimación del crítico en vez de esperar al retorno completo del episodio, lo que permite actualizar paso a paso.

### ¿Por qué el actor-crítico introduce sesgo mientras que REINFORCE (sin línea de base) no lo hace?
- [ ] Porque el actor-crítico no explora
- [x] Porque sustituye el retorno real futuro por una estimación del crítico, que puede no ser exacta
- [ ] Porque usa una tasa de aprendizaje distinta para el actor y el crítico
> Por qué: al hacer bootstrap con $v_w(s_{t+1})$ en vez de esperar el retorno real, cualquier error del crítico se traslada a la actualización del actor.

### En un problema con episodios de miles de pasos, ¿qué ventaja práctica ofrece el actor-crítico frente a REINFORCE?
- [ ] Es más simple de implementar
- [x] Puede actualizar la política en cada paso, sin tener que esperar a que termine un episodio tan largo
- [ ] No necesita ninguna función de valor
> Por qué: REINFORCE necesita el episodio completo para calcular $G_t$; en episodios muy largos eso retrasa mucho el aprendizaje, algo que el actor-crítico evita al actualizar transición a transición.

## Glosario
- **actor-crítico**: esquema de RL que combina una política parametrizada (actor) con una función de valor (crítico), actualizando ambas tras cada transición usando el error de TD como estimación de la ventaja.
- **actor**: en el esquema actor-crítico, la política $\pi_\theta(a|s)$ que decide qué acción ejecutar.
- **crítico (actor-crítico)**: función de valor $v_w(s)$ que evalúa los estados y guía al actor; distinto del crítico de una WGAN (ver [[gans|crítico]]), que estima una distancia entre distribuciones.
