---
id: vectores
estado: borrador
---

## En una frase

Un vector es una lista ordenada de números (un escalar es solo uno) que describe varias características de algo a la vez, y se puede sumar, restar o escalar.

## Intuición

Imagina que describes un piso solo por su precio: un número, un **escalar**. Pero si además apuntas los metros cuadrados, las habitaciones y el piso en el que está, ya no te basta un número: necesitas una lista ordenada, por ejemplo $(80, 3, 2)$. Esa lista es un **vector**: cada casilla tiene un significado fijo (siempre metros, luego habitaciones, luego piso) y solo tiene sentido si respetas el orden.

En IA, prácticamente cualquier dato se convierte en vectores así: un correo, una imagen, una canción. Poder sumarlos, restarlos o escalarlos es lo que permite combinar, ajustar y comparar esas descripciones con matemáticas en vez de con palabras.

## Explicación

### De un número a una lista de números

Un **escalar** es una sola magnitud: la longitud de un correo, el número de enlaces que contiene, o cuántas veces aparece la palabra "gratis". Cada uno por separado dice poco. Pero si un modelo necesita fijarse en varias características a la vez para, por ejemplo, decidir si un correo es spam, junta esos escalares en un **vector de características**:

$$
\text{correo} = [\text{longitud}, \text{enlaces}, \text{frecuencia-gratis}]
$$

Un correo concreto podría ser el vector $[500, 3, 5]$: 500 caracteres, 3 enlaces, la palabra "gratis" 5 veces. Ese vector es la "huella" numérica del correo, y es lo que el algoritmo compara con las huellas de otros correos para encontrar patrones.

### Suma y resta: combinar descripciones

Sumar o restar vectores se hace posición a posición. Para $\mathbf{v} = [v_1, \dots, v_n]$ y $\mathbf{w} = [w_1, \dots, w_n]$:

$$
\mathbf{v} + \mathbf{w} = [v_1+w_1,\ \dots,\ v_n+w_n]
$$

Con $\mathbf{v}=(2,1)$ y $\mathbf{w}=(1,3)$: la suma es $(3,4)$ y la resta $\mathbf{v}-\mathbf{w}=(1,-2)$. Esta operación tan simple sirve para *ajustar* una descripción: en un sistema de recomendación, si $\mathbf{u}$ describe las preferencias de un usuario y $\mathbf{p}$ es un pequeño ajuste tras ver una película, $\mathbf{u} + \mathbf{p}$ da sus preferencias actualizadas.

### Multiplicar por un escalar: cambiar la magnitud sin cambiar la dirección

Multiplicar un vector por un escalar $\alpha$ multiplica cada componente por $\alpha$: agranda o encoge el vector (y lo invierte si $\alpha<0$), pero no cambia hacia dónde apunta. Si $\mathbf{v}=[2,4]$ y $\alpha=0{,}5$, el resultado es $[1,2]$: la mitad de longitud, misma dirección. En un modelo, escalar así una característica equivale a subir o bajar su peso en la decisión final.

### Por qué el orden de las casillas importa

Un vector no es una bolsa de números, es una lista **ordenada**: la primera casilla siempre significa lo mismo (longitud, en el ejemplo del correo) en todos los vectores que comparas. Cambiar el orden en un vector y no en otro los haría incomparables, aunque contuvieran los mismos números.

## Formalización

$$
\mathbf{v} + \mathbf{w} = [v_1+w_1,\ v_2+w_2,\ \dots,\ v_n+w_n]
\qquad
\alpha \mathbf{v} = [\alpha v_1,\ \alpha v_2,\ \dots,\ \alpha v_n]
$$

donde:

- $\mathbf{v}, \mathbf{w}$ son vectores de $n$ componentes.
- $v_i, w_i$ es la componente $i$-ésima de cada vector.
- $\alpha$ es un escalar (un número real).

Combinar sumas y escalados de varios vectores se llama **combinación lineal**: $\alpha_1\mathbf{v}_1 + \alpha_2\mathbf{v}_2 + \dots$. El producto escalar entre vectores, que mide su parecido en dirección, se trata aparte en [[producto-escalar-similitud]].

## Interactivo

```widget
motor: vectores2d
modo: operaciones
vectores: [{"nombre": "u", "xy": [2, 1]}, {"nombre": "v", "xy": [1, 3]}]
mostrar: ["suma", "resta", "escalar"]
```

- Prueba a arrastrar $\mathbf{u}$ o $\mathbf{v}$ y observa cómo se recalculan al instante la suma y la resta.
- Prueba a llevar $\mathbf{v}$ justo encima del origen (0,0): ¿qué le pasa a $\mathbf{u}+\mathbf{v}$?
- Prueba a mover el deslizador del escalar a un valor negativo y fíjate en que el vector escalado se invierte.

## En código

```python
import numpy as np

u = np.array([2, 1])
v = np.array([1, 3])
print("suma:", u + v)        # [3 4]
print("resta:", u - v)       # [ 1 -2]
print("0.5 * [2,4]:", 0.5 * np.array([2, 4]))  # [1. 2.]
```

## Errores típicos

- **Error**: pensar que un vector es solo "una lista de números que se pueden reordenar". → **Correcto**: el orden es parte de su significado; dos vectores solo se comparan si sus casillas describen lo mismo en el mismo orden.
- **Error**: creer que sumar vectores mezcla sus significados en una sola cantidad. → **Correcto**: la suma se hace componente a componente; cada casilla del resultado sigue midiendo lo mismo que en los originales.
- **Error**: pensar que multiplicar por un escalar negativo simplemente lo hace "más pequeño". → **Correcto**: invierte su dirección (le da la vuelta) y además puede cambiar su longitud.
- **Error**: confundir un vector de una sola componente con un escalar. → **Correcto**: un escalar es un número suelto; un vector, aunque tenga una sola componente, sigue siendo una lista con esa estructura.

## En resumen

- **Qué es:** un escalar es un solo número; un vector es una lista ordenada de números que describe varias características de un mismo dato.
- **Para qué sirve:** representar datos (un correo, una imagen, un usuario) como algo con lo que se puede calcular.
- **Suma y resta:** se hacen componente a componente; combinan o ajustan descripciones (por ejemplo, actualizar preferencias).
- **Escalar:** $\alpha\mathbf{v}$ multiplica cada componente por $\alpha$; cambia la magnitud y, si $\alpha<0$, invierte la dirección.
- **Regla clave:** $\mathbf{v}+\mathbf{w}=[v_1+w_1,\dots,v_n+w_n]$.
- **Trampa:** el orden de las componentes es parte del significado del vector; no se puede reordenar libremente.

## A fondo

### Combinaciones lineales que "evolucionan" una descripción

Sumar y restar vectores no solo ajusta valores: permite construir representaciones nuevas a partir de otras. Si un vector describe los gustos musicales de un usuario y otro representa a un artista, su suma puede leerse como "el perfil del usuario después de escuchar a ese artista". Este mecanismo, una combinación lineal de vectores que describen entidades distintas (usuario, artista), es la base de muchos sistemas de recomendación: los vectores no solo describen, también se combinan para simular cómo cambian las preferencias.

Una idea parecida aparece en los vectores de palabras (*word embeddings*) del procesamiento del lenguaje natural: se observa que el vector de "Rey" menos el de "Hombre" más el de "Mujer" cae cerca del vector de "Reina". La suma y la resta de vectores capturan así relaciones de significado, no solo cantidades.

## Autoevaluación

### Un correo se representa como $[\text{longitud}, \text{enlaces}, \text{frecuencia-gratis}] = [300, 2, 0]$. ¿Qué tipo de objeto matemático es $300$ por sí solo?
- [ ] Un vector de una componente.
- [x] Un escalar: una sola magnitud, sin las otras dos componentes.
- [ ] Una combinación lineal.
> Por qué: $300$ es un único número que mide una sola característica (la longitud); solo al juntarlo con las otras dos magnitudes en una lista ordenada se convierte en parte de un vector.

### Si $\mathbf{u}=(4,2)$ y lo multiplicas por $\alpha=-0{,}5$, ¿qué vector obtienes?
- [ ] $(4,2)$, porque el escalar solo cambia el tamaño, no la dirección.
- [ ] $(-4,-2)$, invirtiendo el vector pero sin encogerlo.
- [x] $(-2,-1)$: la mitad de largo y con la dirección invertida.
> Por qué: cada componente se multiplica por $-0{,}5$: $4\cdot(-0{,}5)=-2$ y $2\cdot(-0{,}5)=-1$. El signo negativo invierte la dirección y el $0{,}5$ reduce la longitud a la mitad.

### En un sistema de recomendación, $\mathbf{u}$ describe las preferencias de un usuario y $\mathbf{p}_{\text{ajuste}}$ un pequeño cambio tras ver una película. ¿Cómo se modela la preferencia actualizada?
- [ ] $\mathbf{u} \cdot \mathbf{p}_{\text{ajuste}}$, multiplicando componente a componente.
- [x] $\mathbf{u} + \mathbf{p}_{\text{ajuste}}$, sumando el ajuste a las preferencias anteriores.
- [ ] Sustituyendo $\mathbf{u}$ por $\mathbf{p}_{\text{ajuste}}$ directamente.
> Por qué: la suma de vectores combina la descripción anterior con el pequeño cambio, sin borrar la información previa; es la operación natural para "ajustar" una descripción.

### Dos vectores tienen las mismas tres componentes numéricas, pero en un vector el orden es (longitud, enlaces, frecuencia-gratis) y en el otro es (enlaces, frecuencia-gratis, longitud). ¿Se pueden comparar directamente?
- [ ] Sí, porque contienen los mismos números.
- [x] No: aunque los números coincidan, cada casilla describe algo distinto en cada vector, así que compararlos directamente daría resultados sin sentido.
- [ ] Solo si primero se suman entre sí.
> Por qué: el significado de un vector depende de que cada posición represente siempre la misma característica; si el orden cambia, la misma casilla ya no mide lo mismo.

## Glosario

- **Escalar**: un único número; una sola magnitud (por ejemplo, la longitud de un correo).
- **Vector**: lista ordenada de escalares que describe varias características de un mismo dato.
- **Vector de características**: vector cuyas componentes son las variables medidas sobre un ejemplo (un correo, una imagen, un usuario).
- **Combinación lineal**: suma de vectores multiplicados cada uno por un escalar, $\alpha_1\mathbf{v}_1+\alpha_2\mathbf{v}_2+\dots$.
