---
id: regla-cadena
estado: borrador
---

## En una frase

Cuando una cantidad depende de otra que a su vez depende de una tercera, la regla de la cadena dice que sus sensibilidades se multiplican, no se suman.

## Intuición

Piensa en subir una montaña: cuanto más avanzas horizontalmente, más subes en altitud, y cuanto más subes en altitud, más baja la temperatura. Hay dos efectos encadenados: distancia → altitud, y altitud → temperatura. Si quieres saber cómo cambia la temperatura por cada metro que avanzas, no puedes mirar cada efecto por separado: tienes que combinarlos.

La **regla de la cadena** es exactamente esa combinación: multiplica las dos sensibilidades para obtener el efecto total. Esta idea, tan simple en apariencia, es la que permite calcular cómo un pequeño cambio en un parámetro cualquiera de una red neuronal, muy al principio de la cadena, termina afectando al error final tras atravesar todas las capas intermedias.

## Explicación

### Derivar una función dentro de otra

Cuando una cantidad $y$ depende de una variable intermedia $u$, y esa $u$ depende a su vez de $x$, se dice que las funciones están **encadenadas**: $y=f(u)$, $u=g(x)$, y por sustitución $y=f(g(x))$. La [[derivada]] de $y$ respecto a $x$ no se puede leer directamente de ninguna de las dos derivadas por separado: hace falta combinarlas.

### La regla y por qué las pendientes se multiplican

La regla de la cadena establece que

$$
\frac{dy}{dx} = \frac{dy}{du}\cdot\frac{du}{dx}
$$

Es decir, el cambio total de $y$ respecto a $x$ es el cambio de $y$ respecto a $u$, multiplicado por el cambio de $u$ respecto a $x$. Tiene sentido que se multipliquen y no se sumen: el efecto de $x$ sobre $y$ pasa "a través" de $u$, así que cada pequeño cambio en $x$ se amplifica o se atenúa primero según cómo reacciona $u$, y después según cómo reacciona $y$ ante ese cambio en $u$. El efecto final es el resultado encadenado de ambas amplificaciones, no su suma.

### Composición de pendientes

Geométricamente, cada derivada es una pendiente local. $du/dx$ es la pendiente de la función interior; $dy/du$, la de la función exterior. Su producto da la pendiente combinada: la inclinación final que resulta de encadenar ambas transformaciones. Esta idea se extiende sin cambios a cadenas más largas —tres, cuatro o miles de funciones compuestas— multiplicando una sensibilidad tras otra, que es justo lo que hace la retropropagación al entrenar una red neuronal con muchas capas.

## Formalización

$$
y=f(u), \quad u=g(x) \qquad\Longrightarrow\qquad \frac{dy}{dx} = \frac{dy}{du}\cdot\frac{du}{dx}
$$

donde:

- $x$ es la variable independiente original.
- $u=g(x)$ es la variable intermedia.
- $y=f(u)$ es la variable final, que depende de $x$ solo a través de $u$.
- $dy/du$ y $du/dx$ son las derivadas de cada función por separado, evaluadas en el punto correspondiente.

## Interactivo

```widget
motor: pasos
---
Planteamos una cadena de dependencias: la temperatura $T$ depende de la altitud $h$, y la altitud depende de la distancia horizontal recorrida $x$.

$$T = f(h), \qquad h = g(x)$$
---
Queremos saber cómo cambia la temperatura por cada metro que avanzamos: $\dfrac{dT}{dx}$. La regla de la cadena dice que hay que combinar las dos sensibilidades:

$$\frac{dT}{dx} = \frac{dT}{dh}\cdot\frac{dh}{dx}$$
---
Sustituimos los datos del terreno: la temperatura baja $6{,}5$ grados por kilómetro de altitud ($dT/dh=-6{,}5$), y la altitud sube $0{,}3$ km por cada km horizontal ($dh/dx=0{,}3$).

$$\frac{dT}{dx} = (-6{,}5)\times 0{,}3$$
---
El resultado es $\dfrac{dT}{dx}=-1{,}95$: la temperatura baja $1{,}95$ grados por cada kilómetro horizontal recorrido. Cada pendiente local se combinó multiplicándose, no sumándose.
```

- Prueba a calcular a mano el resultado antes de avanzar al último fotograma.
- Prueba a imaginar que $dh/dx$ fuera el doble ($0{,}6$, una ladera más empinada): ¿cómo cambiaría $dT/dx$?
- Prueba a pensar en una tercera dependencia (por ejemplo, la presión atmosférica en función de la temperatura) y en cómo se añadiría un tercer factor a la multiplicación.

## En código

```python
def temperatura_por_distancia(dT_dh, dh_dx):
    return dT_dh * dh_dx

dT_dh = -6.5   # grados por km de altitud
dh_dx = 0.3    # km de altitud por km horizontal
print(temperatura_por_distancia(dT_dh, dh_dx))  # -1.95
```

## Errores típicos

- **Error**: sumar las dos derivadas, $dy/du + du/dx$, en vez de multiplicarlas. → **Correcto**: el efecto de $x$ sobre $y$ pasa "a través" de $u$; los cambios se encadenan multiplicativamente, no se acumulan por separado.
- **Error**: evaluar $dy/du$ en el punto $x$ original en lugar de en $u=g(x)$. → **Correcto**: $dy/du$ debe evaluarse en el valor de $u$ correspondiente a ese $x$, no directamente en $x$.
- **Error**: pensar que la regla de la cadena solo sirve para dos funciones encadenadas. → **Correcto**: se extiende a cualquier número de funciones compuestas, multiplicando una sensibilidad tras otra; así funciona la retropropagación en redes con muchas capas.

## En resumen

- **Qué es**: una regla para derivar funciones compuestas, cuando una variable depende de otra que a su vez depende de una tercera.
- **Para qué sirve**: calcular cómo un cambio pequeño se propaga a través de una cadena de dependencias.
- **Cómo funciona**: se calcula cada derivada por separado (cada "eslabón" de la cadena) y se multiplican entre sí.
- **Fórmula clave**: $\dfrac{dy}{dx}=\dfrac{dy}{du}\cdot\dfrac{du}{dx}$.
- **Por qué se multiplica y no se suma**: el efecto pasa a través de la variable intermedia; cada eslabón amplifica o atenúa el que viene antes.
- **Trampa principal**: evaluar cada derivada en el punto que le corresponde ($dy/du$ en $u$, no en $x$).

## A fondo

### De dos eslabones a una cadena larga

Nada impide encadenar más de dos funciones: si $y=f(u)$, $u=g(v)$ y $v=h(x)$, la regla se extiende como $\dfrac{dy}{dx}=\dfrac{dy}{du}\cdot\dfrac{du}{dv}\cdot\dfrac{dv}{dx}$, multiplicando tantas pendientes locales como eslabones haya. Esta es, literalmente, la operación que ejecuta la retropropagación en una red neuronal: cada capa es un eslabón, y el gradiente que le llega a los pesos de una capa profunda es el producto de todas las sensibilidades de las capas que atraviesa hasta la salida.

## Autoevaluación

### Si $dT/dh=-6{,}5$ y $dh/dx=0{,}3$, ¿cuál es $dT/dx$?
- [ ] $-6{,}2$, restando ambos valores.
- [x] $-1{,}95$, multiplicando ambos valores.
- [ ] $-6{,}8$, sumando ambos valores.
> Por qué: la regla de la cadena combina las sensibilidades multiplicándolas: $(-6{,}5)\times 0{,}3=-1{,}95$.

### En una red con dos capas, $y=f(u)$ y $u=g(x)$, ¿por qué no basta con calcular $dy/du$ y $du/dx$ por separado y quedarse con el mayor de los dos?
- [ ] Porque solo importa la derivada de la última capa.
- [x] Porque el efecto de $x$ sobre $y$ depende de ambos eslabones a la vez: si cualquiera de los dos es muy pequeño, el efecto combinado también lo será, por grande que sea el otro.
- [ ] Porque las derivadas de capas distintas no se pueden combinar entre sí.
> Por qué: al multiplicarse, un factor cercano a cero en cualquiera de los dos eslabones reduce drásticamente el producto final, algo que "quedarse con el mayor" ignoraría por completo.

### Si $dh/dx$ se duplicara (una ladera del doble de inclinada), manteniendo $dT/dh=-6{,}5$, ¿qué le pasaría a $dT/dx$?
- [ ] Se mantendría igual, porque $dT/dh$ no cambió.
- [x] También se duplicaría (en valor absoluto), porque $dT/dx$ es el producto de ambos factores.
- [ ] Se dividiría por dos.
> Por qué: como $dT/dx=dT/dh\cdot dh/dx$, duplicar uno de los dos factores duplica directamente el producto, siempre que el otro factor no cambie.

## Glosario

- **Función compuesta**: función construida sustituyendo una función dentro de otra, $y=f(g(x))$.
- **Variable intermedia**: la variable $u=g(x)$ que conecta la función exterior con la interior en una composición.
- **Regla de la cadena**: fórmula para derivar una función compuesta multiplicando las derivadas de cada eslabón, $dy/dx=(dy/du)\cdot(du/dx)$.
