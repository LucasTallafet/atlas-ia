---
id: prob-condicional
estado: borrador
---

## En una frase

La probabilidad condicional recalcula cuánto probable es un suceso cuando ya sabes que ha ocurrido otro, reduciendo el espacio de posibilidades al que encaja con esa información.

## Intuición

Imagina que la probabilidad de lluvia mañana es del 20%. Pero si te enteras de que la presión atmosférica acaba de caer en picado, esa probabilidad puede subir al 60%. El fenómeno en sí no ha cambiado: lo que cambió es la información que tienes para evaluarlo. Eso es exactamente lo que hace la probabilidad condicional: ajustar una creencia a la luz de un dato nuevo.

En IA esta idea es constante. Un filtro de spam actualiza su estimación al ver una palabra concreta; un sistema de diagnóstico ajusta su sospecha al conocer el resultado de una prueba. Ambos casos son la misma operación: reducir el universo de posibilidades a los casos compatibles con lo que ya se sabe.

## Explicación

### Restringir el espacio de casos

Cuando calculas $P(A)$ sin más información, consideras el espacio muestral $\Omega$ completo. En cuanto sabes que ha ocurrido un evento $B$, el problema cambia: ya no te interesa $\Omega$ entero, solo la parte de $\Omega$ donde $B$ es cierto. Dentro de ese universo reducido, preguntas qué fracción corresponde también a $A$. Ese recalculo es la **probabilidad condicional**, $P(A|B)$: la probabilidad de $A$ sabiendo que $B$ ha ocurrido.

### De la definición a la regla de multiplicación

Como $P(A|B)$ es una proporción dentro del universo reducido a $B$, despejando se obtiene la **regla de la multiplicación**: la probabilidad de que ocurran $A$ y $B$ a la vez es el producto de una probabilidad simple por una condicional. Esta relación es simétrica —se puede partir de $A$ o de $B$— y esa simetría es la semilla del [[bayes|teorema de Bayes]].

### Independencia: cuando la información no cambia nada

A veces conocer $B$ no altera en absoluto la probabilidad de $A$: son sucesos **independientes**. Formalmente ocurre cuando $P(A|B)=P(A)$, lo que equivale a que la probabilidad conjunta sea simplemente el producto de las probabilidades individuales. Si en cambio $P(A|B)\neq P(A)$, los sucesos son **dependientes**: saber uno sí modifica lo que esperas del otro. La independencia no es que dos sucesos no tengan nada en común; es que enterarte de uno no te enseña nada sobre el otro.

### Independencia condicional: el atajo que hace manejable la IA

En la práctica, pocas variables son independientes sin más. Pero es habitual que dos variables dependientes en general se vuelvan independientes **una vez que fijas una tercera** $C$. Esto se llama **independencia condicional**: condicionado a $C$, saber de $A$ no aporta nada sobre $B$. Es la hipótesis que sostiene a [[naive-bayes|Naive Bayes]] (las palabras de un correo se tratan como independientes entre sí, una vez fijada la clase spam/no spam), a las [[redes-bayesianas|redes bayesianas]] (que representan estas relaciones como un grafo) y a la propiedad de Markov en aprendizaje por refuerzo (el futuro depende del estado actual, no del historial completo). Sin esta simplificación, calcular probabilidades conjuntas entre miles de variables sería inabordable.

## Formalización

$$
P(A|B) = \frac{P(A \cap B)}{P(B)} \qquad \text{si } P(B) > 0
$$

donde:

- $P(A|B)$ es la probabilidad de que ocurra $A$ sabiendo que $B$ ya ha ocurrido.
- $P(A \cap B)$ es la probabilidad de que ocurran $A$ y $B$ a la vez.
- $P(B)$ es la probabilidad de $B$; debe ser mayor que cero, porque no se puede condicionar a un suceso imposible.

De aquí sale la regla de la multiplicación, $P(A \cap B) = P(A|B)\cdot P(B) = P(B|A)\cdot P(A)$.

$A$ y $B$ son **independientes** cuando $P(A|B)=P(A)$, lo que equivale a $P(A \cap B)=P(A)\cdot P(B)$. $A$ y $B$ son **condicionalmente independientes dado $C$** cuando:

$$
P(A \cap B \mid C) = P(A|C) \cdot P(B|C)
$$

donde:

- $C$ es el suceso o variable que se fija como condición.
- $P(A|C)$ y $P(B|C)$ son las probabilidades de $A$ y de $B$ sabiendo que $C$ ha ocurrido.

**Ejemplo numérico:** de una baraja de 52 cartas, sea $A$ = "es el as de corazones" y $B$ = "es de corazones". Sin información, $P(A)=1/52$. Sabiendo que la carta es de corazones, el universo se reduce a 13 cartas: $P(A|B)=\frac{P(A\cap B)}{P(B)}=\frac{1/52}{13/52}=\frac{1}{13}$. Y comprobando la regla de multiplicación: $P(A\cap B)=P(A|B)\cdot P(B)=\frac{1}{13}\cdot\frac{13}{52}=\frac{1}{52}$, que coincide con $P(A)$.

## Interactivo

```widget
motor: probabilidad
modo: tabla
valores: {"filas": ["Spam", "No spam"], "columnas": ["Contiene \"gratis\"", "No la contiene"], "conteos": [[60, 40], [5, 95]]}
```

- Prueba a filtrar por la columna "Contiene \"gratis\"" y comprueba cómo cambia la probabilidad de que un correo sea spam frente al total sin filtrar.
- Prueba a comparar la fila "Spam" con la fila "No spam" dentro de la misma columna: ¿son iguales las proporciones? Eso es justo lo contrario de independencia.
- Prueba a imaginar una tabla donde las dos filas tuviesen la misma proporción en cada columna: esa tabla representaría sucesos independientes.

## En código

```python
# Verificación con una baraja simulada: P(as | corazones)
palos = ["corazones", "picas", "treboles", "diamantes"]
valores = list(range(1, 14))  # 1..13, el 1 hace de "as"
baraja = [(v, p) for p in palos for v in valores]

B = [c for c in baraja if c[1] == "corazones"]
A_and_B = [c for c in B if c[0] == 1]

p_B = len(B) / len(baraja)
p_A_dado_B = len(A_and_B) / len(B)
print(p_B, p_A_dado_B)  # 0.25 0.07692307692307693 (=1/13)
```

## Errores típicos

- **Error**: pensar que la probabilidad condicional cambia el fenómeno real. → **Correcto**: el suceso sigue siendo el mismo; lo que cambia es la información con la que lo evalúas.
- **Error**: confundir independencia con que dos sucesos no puedan ocurrir a la vez. → **Correcto**: dos sucesos disjuntos son fuertemente dependientes (si ocurre uno, el otro queda descartado); independencia es que uno no aporte información sobre el otro.
- **Error**: suponer que porque $A$ y $B$ son dependientes en general, también lo son al fijar una tercera variable $C$. → **Correcto**: pueden volverse condicionalmente independientes dado $C$, como en la hipótesis de Naive Bayes.
- **Error**: calcular $P(A|B)$ dividiendo por $P(A)$ en vez de por $P(B)$. → **Correcto**: el denominador siempre es la probabilidad del suceso que ya se conoce (la condición), no la del suceso que se quiere predecir.

## En resumen

- **Qué es:** la probabilidad de un suceso $A$ recalculada tras saber que otro suceso $B$ ha ocurrido.
- **Cómo se obtiene:** se restringe el espacio muestral a los casos donde $B$ ocurre y se mide qué fracción de ellos cumple también $A$.
- **Fórmula clave:** $P(A|B) = P(A \cap B)/P(B)$, válida solo si $P(B)>0$.
- **Independencia:** $A$ y $B$ son independientes si $P(A|B)=P(A)$, es decir, $P(A\cap B)=P(A)P(B)$.
- **Independencia condicional:** dos sucesos dependientes en general pueden ser independientes al fijar un tercero; es la base de Naive Bayes y de las redes bayesianas.
- **Cuándo usarla:** siempre que dispongas de información parcial y quieras actualizar una estimación de probabilidad.
- **Trampa principal:** el denominador de la fórmula es la probabilidad de la condición, no la del suceso que buscas.

## A fondo

### La dependencia por extracción sin reemplazo

Un caso clásico de dependencia aparece al extraer sin reponer: en una bolsa con 5 bolas rojas y 5 azules, la probabilidad de sacar roja en la primera extracción es $5/10=0{,}5$. Pero si la primera bola fue roja, en la segunda extracción la probabilidad de otra roja ya no es $0{,}5$, sino $4/9$, porque la composición de la bolsa cambió. Este tipo de dependencia es habitual al dividir datos en lotes o al muestrear sin reposición.

### Independencia condicional y el ejemplo del paraguas

Un ejemplo clásico ilustra por qué la independencia condicional simplifica tanto los modelos: el número de paraguas en la calle y que el suelo esté mojado parecen correlacionados, pero ambos se explican por una tercera variable, si está lloviendo. Condicionado a "llueve" o "no llueve", saber si hay paraguas no aporta nada sobre si el suelo está mojado. Esta estructura —una causa común que explica una correlación aparente— es la que las [[redes-bayesianas|redes bayesianas]] representan de forma explícita mediante grafos.

## Autoevaluación

### En un cruce, el 30% de los coches gira a la izquierda ($B$) y, de esos, el 20% son furgonetas ($A$). ¿Cuánto vale $P(A \cap B)$?
- [ ] $0{,}2$, porque es la probabilidad condicional.
- [x] $0{,}06$, aplicando $P(A\cap B) = P(A|B)\cdot P(B) = 0{,}2\cdot 0{,}3$.
- [ ] $0{,}5$, sumando ambas probabilidades.
> Por qué: la regla de la multiplicación combina la probabilidad de la condición ($B$) con la probabilidad condicional ($A$ dado $B$); sumarlas no tiene sentido porque miden cosas distintas.

### Extraes dos cartas de una baraja sin devolver la primera. ¿$A$ = "la segunda es un as" y $B$ = "la primera es un as" son independientes?
- [ ] Sí, porque cada extracción es un suceso aleatorio distinto.
- [x] No, porque si la primera carta fue un as quedan menos ases disponibles para la segunda.
- [ ] Solo son independientes si la primera carta resulta no ser un as.
> Por qué: al no reponer la carta, la composición del mazo cambia según lo que salió antes, así que $P(A|B) \neq P(A)$: es justo la definición de dependencia, sea cual sea el resultado de la primera extracción.

### Un modelo de spam asume que las palabras de un correo son independientes entre sí una vez fijada la clase (spam o no spam). ¿Qué nombre recibe esta hipótesis?
- [ ] Independencia total, válida siempre entre cualquier par de palabras.
- [x] Independencia condicional: dependientes en general, pero independientes al fijar la clase.
- [ ] Regla de Laplace aplicada al vocabulario.
> Por qué: "gratis" y "descuento" suelen aparecer juntas en spam (dependencia general), pero condicionado a "es spam", asumir que cada palabra aporta información por separado es la hipótesis de Naive Bayes, no independencia sin condición.

### Si $P(A|B) = P(A)$, ¿qué relación existe necesariamente entre $A$ y $B$?
- [ ] $A$ y $B$ no pueden ocurrir a la vez.
- [x] $A$ y $B$ son independientes: $P(A \cap B) = P(A)\cdot P(B)$.
- [ ] $B$ nunca ocurre.
> Por qué: que conocer $B$ no cambie la probabilidad de $A$ es exactamente la definición de independencia; no implica nada sobre si pueden coexistir ni sobre la probabilidad de $B$.

## Glosario

- **Probabilidad condicional**: probabilidad de un suceso $A$ recalculada sabiendo que otro suceso $B$ ha ocurrido, $P(A|B)$.
- **Regla de la multiplicación**: $P(A\cap B) = P(A|B)\cdot P(B)$, forma de obtener una probabilidad conjunta a partir de una condicional.
- **Sucesos independientes**: aquellos en los que conocer uno no cambia la probabilidad del otro.
- **Sucesos dependientes**: aquellos en los que $P(A|B) \neq P(A)$.
- **Independencia condicional**: dos sucesos dependientes en general que se vuelven independientes al fijar una tercera variable.
