---
id: ontologias-grafos
estado: borrador
---

## En una frase

Las ontologías, los grafos de conocimiento, los marcos y las redes semánticas son formas de conectar conceptos con relaciones explícitas, para que una máquina razone con ellos en vez de solo buscarlos por palabra.

## Intuición

Imagina un corcho con notas y cordones de colores uniendo unas con otras: "Ana" conectada a "profesora", y esta a "Juan" con el cordón "enseña a". De un vistazo entiendes no solo quién es quién, sino cómo se relacionan. Eso es lo que hacen las ontologías y los grafos de conocimiento con la información de un sistema de IA: en vez de guardar hechos sueltos, los conectan mediante relaciones con significado explícito ("es un tipo de", "se trata con", "causa").

Importa porque, igual que tú puedes seguir los cordones del corcho para deducir una conexión que nadie escribió directamente, una máquina puede recorrer estas estructuras para inferir información nueva: si sabe que un perro es un mamífero y que todo mamífero es un animal, no necesita que nadie le diga que un perro es un animal.

## Explicación

### Ontologías: conceptos, relaciones y restricciones

Una **ontología** es un mapa conceptual formalizado de un dominio: no solo nombra conceptos, como haría un diccionario, sino que los organiza jerárquicamente (*"animal"* incluye a *"mamífero"*, que incluye a *"perro"*) y fija cómo se relacionan. Se compone de tres piezas. Los **conceptos** son las clases del dominio, de lo general a lo específico. Las **relaciones** conectan esos conceptos con un papel semántico claro: *"es un tipo de"* (is-a), *"forma parte de"* (part-of) o *"está asociado con"*. Las **restricciones** son condiciones de consistencia: no basta decir que un ser humano tiene progenitores, hay que precisar que son exactamente dos y del mismo tipo.

Gracias a la jerarquía y las relaciones, el sistema deduce información sin que nadie la escriba explícitamente: si "todo mamífero es un animal" y "un perro es un mamífero", concluye que "un perro es un animal". Herramientas como **Protégé** (Universidad de Stanford) o la librería `OWLready2` en Python permiten construir y validar ontologías en formatos estándar como OWL o RDF.

### Grafos de conocimiento: nodos y aristas

Un **grafo de conocimiento** representa entidades como **nodos** y sus relaciones como **aristas** etiquetadas ("trabaja en", "se trata con", "causa"). La diferencia con una base de datos tradicional es que no solo dice qué datos existen, sino cómo están conectados y qué significa esa conexión. Si el grafo contiene que *Juan padece diabetes tipo 2* y que la *diabetes tipo 2 se trata con metformina*, el sistema puede deducir que Juan está relacionado con la metformina sin que nadie lo afirme directamente.

Estos grafos destacan por tres cualidades: **flexibilidad** (se añaden entidades y relaciones sin rehacer la estructura), **capacidad de inferencia** (descubren vínculos indirectos) y **escalabilidad** (van de un grafo pequeño a uno como el Google Knowledge Graph, que organiza millones de entidades para que un buscador entienda el significado de una consulta, no solo las palabras). **Neo4j**, con su lenguaje de consulta Cypher, es una de las bases de datos de grafos más usadas para construirlos.

### Marcos y redes semánticas: representar escenas típicas

Un **marco** es una plantilla que organiza los papeles habituales de una situación: la escena "ir a un restaurante" incluye cliente, camarero, menú y cuenta. Una **red semántica** conecta marcos y conceptos mediante enlaces explícitos, lo que permite interpretar frases ambiguas por contexto: si alguien dice "el camarero trajo la cuenta", el sistema entiende que "cuenta" es el pago de la comida, no un número abstracto. Aunque hoy están parcialmente sustituidos por modelos conexionistas y grandes modelos de lenguaje, siguen usándose donde el contexto estructurado es esencial, y comparten herramientas (Protégé, Neo4j, librerías RDF) con ontologías y grafos.

## Formalización

$$
\forall x\,(\text{Mamífero}(x) \rightarrow \text{Animal}(x))
$$
donde:
- $\forall x$: cuantificador universal, "para todo $x$".
- $\text{Mamífero}(x)$, $\text{Animal}(x)$: predicados que afirman que $x$ pertenece a esa categoría.
- $\rightarrow$: implicación lógica; si $x$ cumple el antecedente, cumple también el consecuente.

Esta es la forma lógica de una relación is-a: expresa que la jerarquía de una ontología (perro → mamífero → animal) no es solo un dibujo, sino una regla que permite inferir automáticamente que un perro es un animal.

## Interactivo

```widget
motor: grafo
modo: "conocimiento"
direccion: "horizontal"
nodos: [
  {"id": "juan", "etiqueta": "Juan"},
  {"id": "diabetes", "etiqueta": "Diabetes tipo 2"},
  {"id": "metformina", "etiqueta": "Metformina"},
  {"id": "cardiaca", "etiqueta": "Complicación cardíaca"}
]
aristas: [
  ["juan", "diabetes", "padece"],
  ["diabetes", "metformina", "se trata con"],
  ["diabetes", "cardiaca", "factor de riesgo de"]
]
```

Prueba a hacer clic en "Diabetes tipo 2" y comprueba cuántas tripletas (sujeto-relación-objeto) quedan conectadas a ese nodo.

Prueba a seguir el camino de "Juan" a "Metformina" en dos saltos: ¿qué relación indirecta puedes inferir sobre el tratamiento de Juan aunque el grafo no la escriba explícitamente?

Prueba a imaginar un nuevo paciente con la misma enfermedad: ¿qué nodo y qué arista añadirías, sin tocar el resto del grafo?

## Errores típicos

- **Error**: pensar que una ontología es solo una lista de términos, como un diccionario → **Correcto**: además define relaciones y restricciones que permiten inferir información no dicha explícitamente.
- **Error**: creer que un grafo de conocimiento es solo una base de datos relacional con otra forma → **Correcto**: lo distintivo es que sus relaciones tienen significado semántico explícito y permiten inferencia, no solo consulta.
- **Error**: suponer que marcos y redes semánticas quedaron obsoletos → **Correcto**: se combinan con grafos y LLM como anclaje semántico y verificable donde el contexto estructurado es esencial.
- **Error**: dar por hecho que toda relación jerárquica se hereda sin excepción → **Correcto**: las restricciones existen precisamente para fijar condiciones (p. ej., cuántos progenitores exactos) y evitar inferencias incorrectas.

## En resumen

- Una ontología, un grafo de conocimiento y una red semántica organizan conceptos y relaciones con significado explícito, no solo palabras o filas de una tabla.
- Una ontología se compone de conceptos (jerarquía general→específico), relaciones ("es un tipo de", "forma parte de") y restricciones que evitan inconsistencias.
- Un grafo de conocimiento representa entidades como nodos y relaciones como aristas; permite inferir vínculos indirectos que no se escribieron explícitamente.
- Los marcos son plantillas de una situación típica y las redes semánticas conectan marcos y conceptos para desambiguar frases según el contexto.
- Herramientas de referencia: Protégé y OWLready2 para ontologías; Neo4j con Cypher para grafos de conocimiento a gran escala.
- Se usan para razonar con relaciones semánticas y desambiguar significado (buscadores, biomedicina, asistentes); aportan poco con datos simples sin relaciones relevantes.
- Decisión que importa: cuánta jerarquía y cuántas restricciones definir; demasiada rigidez complica el mantenimiento, muy poca permite inconsistencias.
- La trampa principal: confundir "conectar datos" con "razonar con ellos"; sin relaciones con significado explícito, sigue siendo solo una lista.

## Autoevaluación

### Un grafo dice que "Juan padece diabetes tipo 2" y que "la diabetes tipo 2 se trata con metformina", pero nunca afirma que "Juan toma metformina". ¿Puede el sistema llegar a esa conclusión?
- [ ] No, porque un grafo solo puede mostrar lo que está escrito explícitamente como arista.
- [x] Sí, siguiendo las dos aristas conectadas (Juan→diabetes→metformina) puede inferir el vínculo indirecto.
- [ ] No, porque haría falta una tercera arista directa entre "Juan" y "metformina" para poder afirmarlo.
> Por qué: la capacidad de inferencia es una de las cualidades clave de los grafos de conocimiento: permiten descubrir vínculos indirectos recorriendo la red, sin que cada relación tenga que estar escrita a mano.

### ¿Qué distingue a una ontología de un simple diccionario de términos?
- [ ] Nada relevante: ambos solo listan palabras con su significado.
- [x] La ontología organiza los conceptos en jerarquías y define relaciones y restricciones explícitas entre ellos, no solo definiciones aisladas.
- [ ] La ontología es más rápida de construir porque no necesita relaciones.
> Por qué: un diccionario define palabras una a una; una ontología además estructura cómo se conectan ("es un tipo de", "forma parte de") y qué restricciones deben cumplirse, lo que permite razonamiento automático.

### Un chatbot recibe la frase "el camarero trajo la cuenta". ¿Qué estructura de las vistas en esta ficha le ayuda a saber que "cuenta" significa "el pago de la comida" y no un número?
- [ ] Una ontología pura, porque solo ella tiene restricciones.
- [x] Un marco de la escena "restaurante" conectado mediante una red semántica, que aporta el contexto de roles típicos.
- [ ] Un grafo de conocimiento a escala Google, porque solo funciona con millones de nodos.
> Por qué: los marcos capturan los roles habituales de una situación (cliente, camarero, cuenta) y las redes semánticas los conectan, lo que permite desambiguar frases según el contexto, justo el problema descrito.

## Glosario

- **ontología**: mapa conceptual formalizado que organiza los conceptos de un dominio en jerarquías y define relaciones y restricciones entre ellos.
- **grafo de conocimiento**: representación en la que las entidades son nodos y sus relaciones son aristas etiquetadas con significado semántico.
- **marco**: plantilla que organiza los papeles y objetos habituales de una situación típica.
- **red semántica**: estructura de nodos y enlaces que conecta marcos y conceptos, permitiendo desambiguar significado según el contexto.
