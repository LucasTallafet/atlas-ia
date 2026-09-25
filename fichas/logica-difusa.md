---
id: logica-difusa
estado: borrador
---

## En una frase

La lógica difusa deja que una afirmación sea verdadera en un grado entre 0 y 1, en vez de forzarla a ser solo verdadera o falsa, para representar conceptos vagos como "temperatura alta".

## Intuición

Imagina el aire acondicionado de una habitación. Con una regla clásica —"si la temperatura supera los 25 °C, encender al máximo"— a 24,9 °C el aparato sigue apagado y a 25,1 °C se dispara a tope: un salto brusco por una décima de grado. La **lógica difusa** propone otra cosa: en vez de decidir de golpe entre "alta" y "no alta", asigna a cada temperatura un grado de pertenencia a "alta" —por ejemplo, 0,7— y deja que la potencia del aire acondicionado se ajuste de forma gradual según ese grado.

Importa en IA porque muchos sistemas de control real (climatización, frenos, robots) funcionan mejor con transiciones suaves que con decisiones binarias, y porque no siempre existe un modelo matemático exacto del sistema que se quiere controlar: la lógica difusa permite construir ese control a partir de reglas de sentido común, sin necesitar ese modelo.

## Explicación

### De verdadero/falso a grados de verdad

En la lógica clásica, una afirmación vale $1$ (verdadero) o $0$ (falso): no hay término medio. Zadeh propuso en 1965 la lógica difusa como extensión de ese marco: permite que una afirmación tome cualquier valor del intervalo $[0, 1]$, donde $1$ es completamente verdadero, $0$ completamente falso, y cualquier valor intermedio es un grado de verdad parcial. "La temperatura es alta" con grado $0{,}7$ significa que es bastante alta, pero no del todo.

### Conjuntos difusos y funciones de pertenencia

Un **conjunto difuso** generaliza el conjunto clásico: en vez de que un elemento pertenezca o no, cada elemento tiene un **grado de pertenencia** entre 0 y 1 que indica cuánto encaja en el conjunto. La función que asigna ese grado a cada valor de entrada es la **función de pertenencia**, $\mu(x)$, y es el componente que define matemáticamente un conjunto difuso.

Las formas más habituales son tres. Las funciones **trapezoidales y triangulares** definen una transición lineal entre "no pertenece" y "pertenece del todo", con un tramo central plano; son las más fáciles de ajustar a mano y las más usadas en control. Las **gaussianas** tienen forma de campana centrada en un valor y son útiles cuando la transición debe ser muy suave en ambos lados, como en fenómenos naturales. Las **sigmoides** tienen forma de "S" y sirven para transiciones más bruscas entre dos estados, sin un tramo central plano.

### Reglas difusas: si $x$ es $A$ entonces $y$ es $B$

Una **regla difusa** conecta condiciones imprecisas con una conclusión, con la misma estructura "si... entonces..." de un sistema experto, pero trabajando con grados de pertenencia en lugar de hechos binarios. Por ejemplo: "si la temperatura es moderadamente alta, reducir ligeramente la calefacción". $x$ e $y$ son variables difusas, y $A$, $B$ son conjuntos difusos con su propia función de pertenencia.

### Combinar condiciones: AND, OR y NOT

Cuando una regla combina varias condiciones ("si $A$ *y* $B$"), hace falta operar entre conjuntos difusos. El operador **AND** corresponde a la **intersección** y toma el mínimo de los grados de pertenencia implicados; el operador **OR** corresponde a la **unión** y toma el máximo; el **NOT** corresponde al **complemento** y resta el grado de pertenencia de 1 (fórmulas en Formalización). Por ejemplo, con "temperatura ALTA" en $0{,}7$ y "humedad ALTA" en $0{,}4$: "temperatura ALTA **y** humedad ALTA" vale $\min(0{,}7,\,0{,}4)=0{,}4$, y "temperatura ALTA **o** humedad ALTA" vale $\max(0{,}7,\,0{,}4)=0{,}7$.

### El ciclo de inferencia: de un número exacto a otro número exacto

Un sistema difuso completo —el **control difuso**, su aplicación más práctica— recibe una entrada precisa y debe devolver una salida igual de precisa, aunque razone con grados de pertenencia por el camino. El ciclo tiene cuatro fases:

1. **Fuzzificación**: convierte la entrada exacta en sus grados de pertenencia a cada conjunto difuso relevante.
2. **Evaluación de reglas**: aplica las reglas "si-entonces" combinando esos grados con AND/OR, obteniendo el grado de activación de cada conclusión.
3. **Agregación**: combina, normalmente con el máximo, las salidas de todas las reglas que activan una misma conclusión, en un único conjunto difuso de salida.
4. **Desfuzzificación**: convierte ese conjunto difuso de salida en un número concreto y accionable, por ejemplo con el método del centroide (Formalización).

## Formalización

Función de pertenencia **trapezoidal** para "temperatura alta" (pertenencia $1$ entre 25 °C y 35 °C, con transiciones lineales en los extremos):

$$
\mu_{\text{alta}}(x) =
\begin{cases}
0, & x \leq 20 \\
\dfrac{x-20}{5}, & 20 < x < 25 \\
1, & 25 \leq x \leq 35 \\
\dfrac{40-x}{5}, & 35 < x < 40 \\
0, & x \geq 40
\end{cases}
$$

donde $x$ es la temperatura y $\mu_{\text{alta}}(x)$, su grado de pertenencia al conjunto "temperatura alta".

Función de pertenencia **gaussiana**, útil para transiciones suaves centradas en un valor:

$$
G(x) = e^{-\frac{(x-\mu)^2}{2\sigma^2}}
$$

donde:

- $x$ es la variable de entrada.
- $\mu$ es el valor central, donde $G$ alcanza su máximo ($G(\mu)=1$).
- $\sigma$ es la desviación típica: cuanto mayor, más ancha la campana.

Función de pertenencia **sigmoide**, útil para transiciones más rápidas entre dos estados:

$$
S(x) = \frac{1}{1+e^{-x}}
$$

donde $x$ es la variable de entrada, ya desplazada y escalada según el punto de inflexión y la pendiente deseados.

Operaciones entre conjuntos difusos $A$ y $B$:

$$
\mu_{A \,\text{AND}\, B}(x) = \min(\mu_A(x), \mu_B(x)) \qquad
\mu_{A \,\text{OR}\, B}(x) = \max(\mu_A(x), \mu_B(x)) \qquad
\mu_{\text{NOT}\, A}(x) = 1 - \mu_A(x)
$$

donde $\mu_A(x)$ y $\mu_B(x)$ son los grados de pertenencia de $x$ a $A$ y $B$.

Desfuzzificación por **centro de gravedad** (centroide):

$$
z^* = \frac{\sum_i z_i \cdot \mu_{\text{salida}}(z_i)}{\sum_i \mu_{\text{salida}}(z_i)}
$$

donde:

- $z_i$ es cada valor posible de la variable de salida (por ejemplo, cada nivel de calefacción).
- $\mu_{\text{salida}}(z_i)$ es el grado de pertenencia de $z_i$ en el conjunto difuso de salida agregado.
- $z^*$ es el valor final, concreto, que usa el sistema para actuar.

## Interactivo

```widget
motor: funcion
modo: pertenencia
funciones: [{"expr": "max(0, min(1, (15-x)/15))", "etiqueta": "temperatura baja"}, {"expr": "max(0, min(x/15, (30-x)/15))", "etiqueta": "temperatura media"}, {"expr": "max(0, min(1, (x-15)/15))", "etiqueta": "temperatura alta"}]
x: [0, 30]
```

- Prueba a llevar el cursor a 10 °C y comprueba que el motor marca los mismos grados de pertenencia que se calculan a mano: $0{,}33$ en "baja" y $0{,}67$ en "media".
- Prueba a llevar la entrada a 15 °C exactos: ahí "temperatura media" alcanza su grado máximo (1) y las otras dos funciones valen 0.

## En código

```python
def mu_baja(t):
    return max(0, min(1, (15 - t) / 15))

def mu_media(t):
    return max(0, min(t / 15, (30 - t) / 15))

def mu_alta(t):
    return max(0, min(1, (t - 15) / 15))

t = 10  # temperatura de entrada
grados = {"baja": mu_baja(t), "media": mu_media(t), "alta": mu_alta(t)}
print(grados)
# {'baja': 0.333..., 'media': 0.667..., 'alta': 0}

# desfuzzificación por centroide: reglas baja->80%, media->50%, alta->20%
niveles = {"baja": 20, "media": 50, "alta": 80}
numerador = sum(niveles[c] * grados[c] for c in grados)
denominador = sum(grados.values())
print("z* =", round(numerador / denominador, 1))
# z* = 59.9
```

## Errores típicos

- **Error**: pensar que la lógica difusa es "probabilidad disfrazada". → **Correcto**: el grado de pertenencia mide cuánto encaja un valor en un concepto vago, no la frecuencia de un suceso incierto; son marcos matemáticos distintos, aunque relacionados (ver [[teoria-posibilidad]]).
- **Error**: creer que basta con fuzzificar la entrada para tomar una decisión. → **Correcto**: hace falta cerrar el ciclo completo —evaluación de reglas, agregación y desfuzzificación— para obtener un valor concreto y accionable.
- **Error**: aplicar AND sumando los grados de pertenencia. → **Correcto**: el AND difuso toma el mínimo, no la suma; sumar puede superar 1 y pierde el sentido de "grado de pertenencia".
- **Error**: pensar que las funciones de pertenencia son objetivas o se derivan automáticamente de los datos. → **Correcto**: normalmente las define una persona experta de forma subjetiva, lo que introduce un sesgo de diseño que conviene documentar y revisar.

## En resumen

- Qué hace: deja que una afirmación sea verdadera en un grado entre 0 y 1, no solo verdadera o falsa, para representar conceptos vagos ("alto", "cerca", "cálido").
- Cómo funciona: 1) fuzzificación, la entrada exacta se convierte en grados de pertenencia; 2) evaluación de reglas "si-entonces" con AND (mínimo), OR (máximo) y NOT (complemento); 3) agregación de las salidas de todas las reglas; 4) desfuzzificación a un número concreto.
- Fórmula clave: desfuzzificación por centroide, $z^* = \frac{\sum z_i \mu(z_i)}{\sum \mu(z_i)}$.
- Úsalo cuando el sistema no tiene un modelo matemático exacto pero sí reglas de sentido común (control de climatización, robótica); evítalo con muchas variables interdependientes, donde el número de reglas crece demasiado.
- Decisión que importa: qué forma de función de pertenencia usar (trapezoidal para transiciones lineales, gaussiana o sigmoide para transiciones más suaves o más bruscas) y qué método de desfuzzificación (centroide, media de los máximos, máximo simple).
- Trampa principal: confundir el grado de pertenencia con una probabilidad; son conceptos distintos aunque ambos vivan en $[0,1]$.

## A fondo

:::nota-fuente
El material original, al sumar los tres términos del centroide del ejemplo de calefacción, etiqueta por error el segundo término como "$0 \times 0{,}67 = 33{,}5$" en vez de "$50 \times 0{,}67 = 33{,}5$" (el resultado numérico, $33{,}5$, y el resultado final, $z^*=59{,}9$, sí son correctos). Aquí se presenta el cálculo con la etiqueta correcta.
:::

La desfuzzificación admite otros métodos además del centroide. La **media de los máximos** (MOM) promedia solo los valores de salida con el grado de pertenencia más alto, sin integrar el área completa: es más barata de calcular y se usa cuando el tiempo de respuesta importa más que la suavidad de la salida. El **máximo simple** (o de altura) es aún más directo: toma sin más el valor donde la pertenencia de salida es máxima. El centroide es el más habitual porque produce salidas más suaves y representativas, ideales para control continuo.

Una ventaja del control difuso frente a un controlador clásico es que no exige un modelo matemático exacto del sistema: basta con traducir a reglas el conocimiento empírico de quien opera el sistema ("si la distancia al obstáculo es pequeña, reducir la velocidad rápidamente"). Esto lo hace especialmente útil en robótica o en sistemas con muchas variables que interactúan de forma no lineal, donde derivar ecuaciones exactas es poco práctico. A cambio, la lógica difusa no escala bien: con muchas variables de entrada, el número de reglas necesarias para cubrir todas las combinaciones crece deprisa, lo que complica tanto el diseño como el mantenimiento del sistema. En la práctica, el control difuso suele integrarse con otros enfoques de IA —por ejemplo, redes neuronales que aprenden a ajustar las funciones de pertenencia con el tiempo— dando lugar a sistemas híbridos que combinan la interpretabilidad de las reglas difusas con la capacidad de adaptación del aprendizaje automático.

## Autoevaluación

### Un sistema difuso calcula que "temperatura ALTA" vale $0{,}8$ y "humedad BAJA" vale $0{,}3$ para una regla "si temperatura ALTA **y** humedad BAJA". ¿Qué grado de activación tiene la regla?
- [ ] $1{,}1$
- [x] $0{,}3$
- [ ] $0{,}8$
> Por qué: el AND difuso toma el mínimo de los grados de pertenencia, $\min(0{,}8,\,0{,}3)=0{,}3$; no se suman ni se queda con el mayor.

### ¿Por qué un controlador difuso, a diferencia de una regla clásica de umbral, evita saltos bruscos en la salida?
- [ ] Porque redondea siempre la entrada al valor más cercano permitido.
- [x] Porque la entrada tiene grados de pertenencia parciales a varios conjuntos a la vez, y la salida se calcula agregando y desfuzzificando esos grados de forma continua.
- [ ] Porque solo puede usarse con funciones de pertenencia sigmoides.
> Por qué: al no forzar una decisión binaria de entrada, pequeños cambios en la entrada producen pequeños cambios en los grados de pertenencia y, por tanto, en la salida desfuzzificada, sin saltos como los de un umbral fijo.

### En el ciclo de inferencia difusa, ¿qué fase falta si un sistema solo calcula grados de pertenencia y aplica reglas, pero nunca produce un valor numérico de control?
- [ ] La fuzzificación.
- [ ] La evaluación de reglas.
- [x] La desfuzzificación.
> Por qué: la desfuzzificación es la fase que convierte el conjunto difuso de salida, agregado tras evaluar las reglas, en el valor concreto que el sistema necesita para actuar sobre el mundo real.

### Dos personas diseñan controladores difusos para el mismo problema de climatización, pero definen la función de pertenencia de "temperatura alta" con límites distintos. ¿Qué explica esta diferencia?
- [ ] Un error de cálculo, porque la función de pertenencia se deriva matemáticamente de los datos.
- [x] Las funciones de pertenencia suelen definirse de forma subjetiva a partir del conocimiento experto, así que dos diseños razonables pueden diferir.
- [ ] La lógica difusa exige que todas las funciones de pertenencia sean triangulares e idénticas entre sistemas.
> Por qué: la subjetividad en el diseño de las funciones de pertenencia es una limitación conocida de la lógica difusa, no un error: distintos expertos pueden trazar límites distintos y razonables para el mismo concepto vago.

## Glosario

- **conjunto difuso**: generalización de un conjunto clásico en la que cada elemento tiene un grado de pertenencia entre 0 y 1, en vez de pertenecer o no de forma absoluta.
- **función de pertenencia**: función $\mu(x)$ que asigna a cada valor de entrada su grado de pertenencia a un conjunto difuso.
- **regla difusa**: instrucción "si $x$ es $A$ entonces $y$ es $B$" que combina condiciones y conclusiones expresadas como conjuntos difusos.
- **fuzzificación**: fase del ciclo de inferencia difusa que convierte una entrada exacta en sus grados de pertenencia a los conjuntos difusos relevantes.
- **desfuzzificación**: fase final del ciclo de inferencia difusa que convierte el conjunto difuso de salida en un valor numérico concreto.
