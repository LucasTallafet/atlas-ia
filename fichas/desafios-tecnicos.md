---
id: desafios-tecnicos
estado: borrador
---

## En una frase

Más allá de elegir un buen algoritmo, todo sistema de IA choca con datos insuficientes o sesgados, dificultad para generalizar a lo nuevo, coste de escalar y fragilidad ante ataques diminutos.

## Intuición

Piensa en preparar a un estudiante para un examen. Si sus libros de texto están incompletos o mal escritos, por muy inteligente que sea el estudiante, su techo de conocimiento ya queda limitado (el problema de los **datos**). Si el examen incluye preguntas de un tipo que nunca practicó, puede fallar aunque domine perfectamente los ejercicios del libro (el problema de **generalizar**). Si de repente hay que examinar a un millón de estudiantes a la vez en vez de treinta, el coste de organizarlo se dispara (**escalabilidad**). Y si alguien cambia con mala intención una sola palabra del enunciado para confundirlo, un estudiante que parecía muy competente puede fallar estrepitosamente (**robustez y seguridad**). Un sistema de IA se enfrenta exactamente a estos cuatro obstáculos, incluso cuando el algoritmo elegido es el correcto.

## Explicación

### Datos: la materia prima que decide el techo del modelo

Un modelo depende por completo de que sus datos de entrenamiento sean precisos, completos y representativos del problema real; datos incompletos o sesgados producen resultados imprecisos, y en sectores como la salud, además, el acceso a datos relevantes suele estar restringido por ley. Durante la pandemia de COVID-19, instituciones médicas de varios países no compartían fácilmente sus bases de datos por motivos legales y de privacidad; la falta de estandarización entre formatos dificultó incluso a proyectos como el de Johns Hopkins entrenar modelos fiables para predecir la propagación del virus.

### Generalizar a lo que nunca se ha visto

La [[generalizacion|generalización]] —aplicar lo aprendido a datos nuevos— es especialmente frágil cuando el entorno de uso es impredecible. En 2018, un vehículo autónomo de Uber no reconoció a tiempo a un peatón que cruzaba fuera de un paso señalizado, en condiciones de poca luz: el sistema había sido entrenado en muchas situaciones de tráfico, pero no logró generalizar a ese escenario concreto, con consecuencias fatales.

### Escalabilidad: el coste de crecer

Los modelos de aprendizaje profundo necesitan una infraestructura computacional considerable para entrenarse y desplegarse, con un coste económico y energético que crece junto con su tamaño. Entrenar GPT-3 costó a OpenAI millones de dólares en infraestructura, lo que deja fuera de alcance a empresas sin esos recursos y abre preguntas sobre la sostenibilidad de seguir escalando modelos de este tipo.

### Robustez y seguridad: cuando un cambio diminuto engaña al modelo

La **robustez** es la capacidad de un modelo para resistir fallos o cambios inesperados; la **seguridad** implica que no sea vulnerable a manipulaciones deliberadas. Un **ataque adversarial** introduce perturbaciones casi imperceptibles en los datos de entrada para provocar que el modelo se equivoque. Investigadores de McAfee lograron que el sistema de cámaras MobilEye de un Tesla clasificara una señal de stop, ligeramente alterada, como una señal de límite de velocidad, un fallo con implicaciones directas de seguridad vial.

## Formalización

Aunque el material de curso no da una fórmula, el concepto de ataque adversarial sí admite una notación matemática estándar:

$$\mathbf{x}' = \mathbf{x} + \boldsymbol{\delta}, \qquad \|\boldsymbol{\delta}\|_\infty \le \varepsilon$$

donde:
- $\mathbf{x}$: entrada original, correctamente clasificada por el modelo.
- $\boldsymbol{\delta}$: perturbación añadida a la entrada.
- $\varepsilon$: cota máxima permitida para cada componente de la perturbación, elegida pequeña para que sea imperceptible.
- $\mathbf{x}'$: entrada perturbada, visualmente casi idéntica a $\mathbf{x}$, que el modelo puede clasificar de forma distinta.

**Ejemplo numérico.** Un clasificador lineal de juguete con $\mathbf{w}=(1,-1)$ y $b=0$ decide la clase 1 si $\mathbf{w}\cdot\mathbf{x}+b>0$. Para $\mathbf{x}=(0{,}3,\ 0{,}1)$, la puntuación es $0{,}2>0$: clase 1. Con una perturbación pequeña $\boldsymbol{\delta}=(-0{,}5,\ 0{,}5)$ (cada componente dentro de $\varepsilon=0{,}5$), la entrada perturbada $\mathbf{x}'=(-0{,}2,\ 0{,}6)$ da una puntuación de $-0{,}8<0$: la clase cambia a 0 sin que $\mathbf{x}'$ se vea muy distinta de $\mathbf{x}$.

## En código

```python
import numpy as np

w = np.array([1.0, -1.0])
b = 0.0
x = np.array([0.3, 0.1])
score = w @ x + b

eps = 0.5
delta = -eps * np.sign(w)
x_adv = x + delta
score_adv = w @ x_adv + b

print(score, int(score > 0))
print(score_adv, int(score_adv > 0))
# 0.2 1
# -0.8 0
```

## Errores típicos

- **Error**: pensar que más datos siempre resuelven un problema de calidad de datos → **Correcto**: si los datos adicionales son igual de incompletos o sesgados, el volumen no arregla el problema; hace falta que sean representativos y de calidad, no solo abundantes.
- **Error**: tratar un fallo de generalización como un simple "bug" a corregir → **Correcto**: es una limitación inherente de haber entrenado con una muestra concreta del mundo; se mitiga con datos más diversos o aprendizaje por transferencia, no con un parche puntual.
- **Error**: creer que escalar un modelo es solo cuestión de comprar más hardware → **Correcto**: el coste económico y energético crece con el tamaño del modelo, lo que plantea límites reales de sostenibilidad y de acceso para quien no tiene esos recursos.
- **Error**: asumir que un ataque adversarial requiere cambios grandes y visibles en la entrada → **Correcto**: basta una perturbación pequeña y casi imperceptible, bien elegida, para que el modelo se equivoque.

## En resumen

- Cuatro desafíos técnicos recurrentes en IA: calidad y disponibilidad de datos, generalización, escalabilidad, y robustez/seguridad.
- Los datos limitan el techo del modelo: si son incompletos o sesgados, ningún algoritmo lo compensa del todo.
- La generalización falla cuando el entorno real difiere del entrenado; ver [[generalizacion]] para el mecanismo completo.
- Escalar cuesta dinero y energía de forma creciente con el tamaño del modelo (caso GPT-3).
- Un ataque adversarial cambia la entrada con una perturbación pequeña ($\|\boldsymbol{\delta}\|\le\varepsilon$) para engañar al modelo.
- Se aplican como lista de comprobación antes de confiar un sistema de IA a un entorno real y crítico.
- La trampa principal: dar por resuelto un desafío en la fase de entrenamiento y descubrirlo solo cuando falla en producción.

## Autoevaluación

### Un modelo de diagnóstico médico entrenado con historiales de un solo hospital funciona mal al aplicarse en otro hospital con pacientes de perfil distinto. ¿Qué desafío técnico ilustra mejor este caso?
- [ ] Escalabilidad, porque el segundo hospital tiene más pacientes
- [x] Calidad y representatividad de los datos, porque el modelo aprendió patrones específicos de una población que no representa a la del segundo hospital
- [ ] Robustez ante ataques adversariales, porque alguien manipuló los datos del segundo hospital
> Por qué: el problema nace de que los datos de entrenamiento no eran representativos de la población a la que se aplica después el modelo, un problema de calidad y representatividad de datos, no de ataque ni de volumen.

### El accidente de un vehículo autónomo de Uber en 2018, que no reconoció a un peatón fuera de un paso señalizado en condiciones de poca luz, es un ejemplo de fallo de…
- [ ] Escalabilidad
- [x] Generalización a un escenario no visto durante el entrenamiento
- [ ] Ataque adversarial deliberado
> Por qué: el sistema había sido entrenado en muchas situaciones de tráfico pero no logró generalizar a esa combinación concreta de circunstancias, sin que mediara ningún ataque intencionado.

### ¿Por qué una perturbación imperceptible para un humano puede bastar para engañar a un modelo, como en el caso de las señales de stop alteradas frente al sistema MobilEye?
- [ ] Porque los modelos de IA nunca son capaces de clasificar señales de tráfico correctamente
- [x] Porque el modelo puede ser muy sensible a cambios diminutos en los datos de entrada que un humano ni siquiera percibe, aunque en condiciones normales acierte casi siempre
- [ ] Porque las señales de stop están mal diseñadas
> Por qué: un ataque adversarial explota justo esa sensibilidad: una perturbación pequeña y dirigida cambia la puntuación interna del modelo lo suficiente para cruzar el umbral de decisión, sin que el cambio sea visible para una persona.

## Glosario

- **Ataque adversarial**: perturbación pequeña y casi imperceptible introducida en los datos de entrada de un modelo con el fin de provocar una clasificación o decisión incorrecta.
- **Robustez**: capacidad de un modelo de IA para mantener su rendimiento ante fallos, ruido o cambios inesperados en el entorno de operación.
