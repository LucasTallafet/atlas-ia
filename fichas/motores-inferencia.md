---
id: motores-inferencia
estado: borrador
---

## En una frase

El motor de inferencia decide en qué orden aplicar las reglas de un sistema experto: hacia delante, desde los hechos disponibles; hacia atrás, desde una hipótesis que hay que comprobar.

## Intuición

Piensa en un mecánico de bicicletas. Hay dos formas de trabajar ante una avería. Puede reunir todo lo que observa —el neumático desinflado, la cadena floja, los frenos flojos— y a partir de ahí ir encadenando conclusiones, sin tener aún un diagnóstico concreto en mente: eso es el **encadenamiento hacia delante**. O puede sospechar directamente "el problema es la cadena" y comprobar, una a una, las condiciones que confirmarían esa sospecha, descartando el resto sin mirarlas: eso es el **encadenamiento hacia atrás**.

[[sistemas-expertos]] ya presentó estas dos estrategias como las dos formas básicas de razonar del motor de inferencia. Lo que importa aquí es otra cosa: cuando la base de reglas crece a cientos o miles de entradas, recorrerlas todas en cada ciclo se vuelve lento e ineficiente. Un motor de inferencia real necesita técnicas para saber, en cada paso, qué reglas merece la pena mirar y cuáles puede ignorar de entrada.

## Explicación

### Encadenamiento hacia delante: evitar caminos irrelevantes

El encadenamiento hacia delante parte de los hechos conocidos y dispara, en cada ciclo, cualquier regla cuya premisa coincida con ellos, añadiendo su conclusión como hecho nuevo hasta que no queden reglas aplicables. El riesgo, a medida que la base de conocimiento crece, es que el motor explore caminos lógicos que no tienen nada que ver con el problema real.

Tres técnicas reducen ese despilfarro. La **priorización de reglas** ordena qué regla evaluar primero según su especificidad: si dos hechos activan a la vez una regla general y otra más concreta que exige ambos hechos, conviene disparar antes la concreta, porque suele llevar más rápido a una conclusión útil y evita evaluar las reglas genéricas que ya no aportan nada. Los **índices de búsqueda** asocian cada hecho con las reglas que dependen de él —por ejemplo, en una tabla hash— para que el motor consulte directamente "reglas relacionadas con este hecho" en vez de recorrer toda la base; pueden construirse de antemano, o de forma dinámica a medida que llegan hechos nuevos, cuando no se puede anticipar qué se va a necesitar. El **modelado mediante grafos dirigidos** representa hechos y reglas como nodos conectados: además de mostrar visualmente el camino de razonamiento, permite evaluar en paralelo ramas de reglas independientes entre sí.

### Encadenamiento hacia atrás: de la meta a las submetas

El encadenamiento hacia atrás invierte el problema: en vez de partir de hechos, parte de una **meta** —la hipótesis que hay que validar— y busca una regla cuya conclusión coincida con ella. Si la premisa de esa regla no está disponible como hecho directo, el motor la convierte en una **submeta**: una condición intermedia que hay que comprobar antes de seguir. Este proceso es recursivo y se repite hasta llegar a hechos verificables (preguntando al usuario, por ejemplo) o hasta que ninguna regla puede sustentar la meta.

Retomando a BikeXpert: ante la meta "¿por qué la bicicleta no se mueve?", el motor prueba la regla "si los pedales no giran, el problema es la cadena" y genera la submeta "¿giran los pedales?". Si el usuario responde que sí giran, esa regla queda descartada sin tocar el resto de la base, y el motor pasa a otra regla candidata, generando nuevas submetas (frenos, transmisión) solo donde hace falta.

Al depender de metas en vez de hechos, sus optimizaciones son distintas de las del encadenamiento hacia delante: **priorizar metas y submetas** más frecuentes según el histórico de consultas; construir **índices inversos** que, para cada meta posible, listen directamente qué reglas podrían validarla; **reutilizar submetas ya evaluadas** en el mismo ciclo, en vez de comprobarlas otra vez si varias reglas comparten una condición; y aplicar **poda** (*pruning*): descartar por adelantado una rama de submetas cuando se detecta pronto que sus condiciones son mutuamente excluyentes, o cuando la cadena de submetas anidadas se hace demasiado profunda para ser eficiente.

### Cuando la lógica no basta: certeza y sistemas híbridos

Ni forward ni backward chaining manejan por sí solos la incertidumbre: sus reglas son binarias, se cumplen o no. Para dominios con información incompleta, los motores incorporan **factores de certeza**: un número entre 0 y 1 que expresa la confianza del experto en una regla o en un hecho, y que se combina multiplicando ambos factores (ver Formalización). Esta aproximación es sencilla pero limitada; cuando la incertidumbre es más rica, los sistemas expertos se combinan con modelos probabilísticos como las [[redes-bayesianas]], dando lugar a sistemas híbridos que aplican reglas deterministas donde el conocimiento es claro y cálculo probabilístico donde no lo es.

## Formalización

$$
CF_{\text{combinado}} = CF_{\text{regla}} \times CF_{\text{hecho}}
$$

donde:

- $CF_{\text{regla}}$ es el factor de certeza asignado a la regla por el experto: su confianza en que, si la premisa es cierta, la conclusión también lo es.
- $CF_{\text{hecho}}$ es el factor de certeza del hecho que activa la regla: la confianza en que ese hecho es cierto.
- $CF_{\text{combinado}}$ es el factor de certeza resultante para la conclusión derivada, siempre en $[0, 1]$.

## Interactivo

```widget
motor: pasos
---
### Encadenamiento hacia delante: BikeXpert parte de los hechos

Hechos iniciales: "la bicicleta no se mueve al pedalear" y "los pedales no giran".

| Regla | Premisa | ¿Se cumple con los hechos? |
|---|---|---|
| R3 | pedales giran → revisar transmisión | No |
| R4 | pedales no giran → problema en la cadena | Sí |

El motor dispara R4 porque su premisa coincide exactamente con los hechos disponibles.
---
### El hecho nuevo se añade a la base

Con R4 disparada, "el problema es la cadena" se añade como hecho nuevo. El motor busca de nuevo reglas aplicables: no encuentra ninguna más. El ciclo termina y esa es la conclusión final.
---
### Encadenamiento hacia atrás: la misma bici, otra pregunta

Ahora la meta es "¿por qué la bicicleta no se mueve?". El motor no parte de hechos sueltos: elige una regla cuya conclusión coincida con la meta y comprueba su premisa.

| Meta | Regla candidata | Submeta generada |
|---|---|---|
| bicicleta no se mueve | R1: pedales no giran → cadena | ¿giran los pedales? |

El usuario responde: "sí, los pedales giran". R1 queda descartada.
---
### Una regla descartada genera otras submetas

Como R1 no se cumple, el motor prueba R2 (pedales giran → revisar frenos o transmisión) y crea dos submetas nuevas: "¿frenos aplicados?" y "¿transmisión dañada?". No se vuelve a mirar nada relacionado con la cadena: ese camino ya quedó descartado.
---
### Encadenar submetas hasta un hecho verificable

"Frenos aplicados" se confirma como cierto, lo que activa R3 (frenos aplicados → revisar tensión de pastillas). Nueva submeta: "¿tensión adecuada?". El usuario responde que no. El motor concluye: "las pastillas de freno están demasiado flojas", satisfaciendo la meta inicial sin haber evaluado nunca las reglas de la transmisión.
```

- Prueba a avanzar fotograma a fotograma y localiza el momento exacto en que el encadenamiento hacia atrás descarta una regla entera (R1) tras una sola respuesta del usuario.
- Prueba a contar cuántas reglas evalúa cada estrategia para llegar a su conclusión, y compáralo con las 4 reglas que tiene la base completa de BikeXpert.

## En código

```python
hechos = {"neumatico_desinflado": True, "pedales_giran": True}
reglas = [
    {"si": ["neumatico_desinflado"], "entonces": "posible_pinchazo"},
    {"si": ["pedales_giran", "neumatico_desinflado"], "entonces": "revisar_neumaticos"},
]

conclusiones = set()
for regla in reglas:
    if all(hechos.get(cond, False) for cond in regla["si"]):
        conclusiones.add(regla["entonces"])

print("Conclusiones derivadas:", sorted(conclusiones))
# Conclusiones derivadas: ['posible_pinchazo', 'revisar_neumaticos']

cf_regla, cf_hecho = 0.9, 0.8
print("CF combinado:", round(cf_regla * cf_hecho, 2))
# CF combinado: 0.72
```

## Errores típicos

- **Error**: pensar que hacia delante y hacia atrás son intercambiables y da igual cuál usar. → **Correcto**: hacia delante explora todo desde los hechos, bueno para monitoreo y diagnóstico abierto; hacia atrás se centra en validar una meta concreta, y elegir mal desperdicia cómputo evaluando reglas que no aportan nada al objetivo.
- **Error**: creer que los índices de búsqueda sustituyen a las reglas. → **Correcto**: un índice solo acelera qué reglas se consultan primero; la lógica de cada regla, y su capacidad de concluir algo, sigue siendo exactamente la misma.
- **Error**: confundir un factor de certeza con una probabilidad calculada con datos. → **Correcto**: el factor de certeza es una heurística de confianza que asigna el experto, y se combina por multiplicación simple, no aplicando el teorema de Bayes como en una [[redes-bayesianas|red bayesiana]].
- **Error**: pensar que la poda en encadenamiento hacia atrás descarta información válida. → **Correcto**: la poda solo elimina por adelantado caminos que ya se sabe que no llevarán a la meta (submetas incompatibles entre sí o cadenas demasiado profundas), no hechos ciertos.

## En resumen

- El motor de inferencia decide cómo recorrer reglas y hechos de un sistema experto para llegar a una conclusión ([[sistemas-expertos]]).
- Dos estrategias: hacia delante parte de los hechos y dispara reglas hasta agotar posibilidades; hacia atrás parte de una meta y genera submetas hasta llegar a hechos verificables.
- Optimización hacia delante: priorizar reglas específicas, indexar hechos→reglas y modelar con grafos para paralelizar caminos independientes.
- Optimización hacia atrás: priorizar metas frecuentes, usar índices inversos meta→reglas, reutilizar submetas ya validadas y podar caminos inconsistentes o excesivamente profundos.
- Fórmula clave: los factores de certeza se combinan multiplicando, $CF_{\text{combinado}} = CF_{\text{regla}} \times CF_{\text{hecho}}$.
- Úsalo: hacia delante para monitoreo o diagnóstico exploratorio; hacia atrás para verificar una hipótesis concreta.
- Trampa: sin optimización, una base de reglas grande explora caminos irrelevantes y el rendimiento se degrada con el tamaño.

## A fondo

Los índices de búsqueda pueden construirse de tres formas según lo predecible que sea el dominio: **estáticos** (precalculados si se conoce de antemano el conjunto de hechos probables), **dinámicos** (se generan y refinan en tiempo de ejecución a medida que llegan hechos nuevos, a costa de un rendimiento peor en los primeros ciclos) o **parciales** (cubren solo los hechos más frecuentes, dejando los raros a una búsqueda estándar sin índice). En dominios donde se pueden anticipar categorías, los índices también pueden organizarse **jerárquicamente**, navegando primero por las categorías más probables.

En Python, un motor de encadenamiento hacia delante puede escribirse a mano con listas y diccionarios, como en el ejemplo de "En código", pero también existen bibliotecas especializadas como **Experta** o **PyKnow**, que declaran reglas de forma más cercana a un sistema de producción real y gestionan automáticamente el ciclo de disparo. Lenguajes más antiguos como **CLIPS** o **Prolog** siguen usándose cuando el rendimiento del motor de inferencia es crítico, porque están diseñados específicamente para este tipo de búsqueda.

El encadenamiento hacia atrás exige, además, gestionar explícitamente la pila de submetas pendientes: cada submeta sin resolver puede a su vez generar otras submetas, así que el motor necesita una estructura (típicamente una pila o un árbol) que recuerde qué queda por comprobar y en qué orden, para no perder el hilo del razonamiento ni repetir preguntas ya respondidas.

## Autoevaluación

### Un sistema de monitoreo de una planta industrial recibe continuamente lecturas de sensores y debe generar alertas sobre cualquier fallo posible, sin tener una hipótesis de partida. ¿Qué estrategia de inferencia encaja mejor?
- [ ] Encadenamiento hacia atrás, porque siempre es más eficiente que hacia delante.
- [x] Encadenamiento hacia delante, porque parte de los datos disponibles y genera todas las conclusiones posibles a medida que llegan.
- [ ] Ninguna de las dos: el monitoreo continuo necesita solo factores de certeza.
> Por qué: cuando no hay una hipótesis concreta que verificar y el objetivo es explorar todo lo que los datos permiten concluir, el encadenamiento hacia delante es la estrategia natural; hacia atrás exige partir de una meta ya definida.

### En BikeXpert, la regla "pedales no giran → cadena" (R1) se descarta tras una sola respuesta del usuario, sin evaluar las reglas de frenos ni transmisión en ese paso. ¿Qué mecanismo explica este ahorro?
- [ ] Un factor de certeza que reduce la confianza en R1 a cero.
- [x] El encadenamiento hacia atrás solo genera submetas de las reglas candidatas a la meta actual; al fallar la premisa de R1, esa rama se abandona sin tocar reglas no relacionadas.
- [ ] Un índice de búsqueda que elimina R1 de la base de conocimiento permanentemente.
> Por qué: el encadenamiento hacia atrás evalúa reglas bajo demanda, solo las que podrían sustentar la meta actual; descartar la premisa de una regla no afecta a las demás reglas de la base, que ni siquiera se consultan en ese ciclo.

### Una regla tiene $CF_{\text{regla}} = 0{,}9$ y se activa con un hecho cuyo $CF_{\text{hecho}} = 0{,}5$. ¿Cuál es el factor de certeza de la conclusión?
- [ ] $1{,}4$, porque los factores de certeza se suman.
- [x] $0{,}45$, porque los factores de certeza se multiplican.
- [ ] $0{,}9$, porque prevalece el factor de certeza más alto.
> Por qué: $CF_{\text{combinado}} = CF_{\text{regla}} \times CF_{\text{hecho}} = 0{,}9 \times 0{,}5 = 0{,}45$; sumar los factores podría superar 1, lo que no tendría sentido como grado de confianza.

### ¿Por qué un índice de búsqueda construido de antemano puede fallar en un sistema experto que opera en un dominio muy variable?
- [ ] Porque los índices solo funcionan con encadenamiento hacia atrás.
- [x] Porque exige conocer de antemano el conjunto de hechos o condiciones más probables, algo difícil si las entradas son muy variadas o impredecibles.
- [ ] Porque los índices ralentizan siempre el motor de inferencia, sin excepción.
> Por qué: un índice estático asume que se puede anticipar qué hechos llegarán; en dominios dinámicos conviene un índice construido en tiempo de ejecución, aunque tenga un coste inicial mayor.

## Glosario

- **motor de inferencia**: componente que aplica las reglas de la base de conocimiento a los hechos disponibles, siguiendo una estrategia como el encadenamiento hacia delante o hacia atrás.
- **submeta**: objetivo intermedio que el encadenamiento hacia atrás genera cuando debe verificar una condición que no está disponible directamente como hecho.
- **poda (*pruning*)**: técnica que descarta por adelantado caminos de razonamiento que ya se sabe que no llevarán a la conclusión buscada, para ahorrar cómputo.
- **índice de búsqueda**: estructura, como una tabla hash, que asocia hechos o metas con las reglas relevantes para no tener que recorrer toda la base de conocimiento.
