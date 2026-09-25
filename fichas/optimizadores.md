---
id: optimizadores
estado: borrador
---

## En una frase
Un optimizador decide cómo usar el gradiente calculado por retropropagación para actualizar los pesos; más allá del descenso de gradiente simple, técnicas como momentum o Adam aceleran y estabilizan el entrenamiento.

## Intuición
Imagina una bola bajando por un valle hacia el punto más bajo. El descenso de gradiente simple mueve la bola un pasito en la dirección de mayor pendiente en cada instante, sin memoria de por dónde venía. El **momentum** añade inercia: la bola acumula velocidad si lleva varios pasos seguidos en la misma dirección, lo que la hace avanzar más rápido por tramos suaves, aunque corre el riesgo de pasarse de largo el fondo del valle por el impulso acumulado. **Adam** va un paso más allá: además de la inercia, ajusta el tamaño de cada paso según lo accidentado que haya sido el terreno reciente en cada dirección, dando pasos más pequeños donde el terreno es irregular y más grandes donde es estable.

Elegir optimizador no cambia el gradiente que calcula la retropropagación; cambia cómo se usa ese gradiente para moverse hacia el mínimo.

## Explicación

### Del descenso de gradiente simple a los optimizadores modernos
El [[descenso-gradiente|descenso de gradiente]] básico actualiza cada peso restándole el gradiente escalado por la tasa de aprendizaje $\eta$. Funciona, pero puede ser lento en zonas de la función de pérdida con curvatura muy distinta según la dirección, y sensible a un $\eta$ mal elegido. Los **optimizadores** son variantes de esa misma idea que usan el historial de gradientes calculados por [[backpropagation|retropropagación]] para moverse de forma más eficiente.

### Momentum: acumular impulso
El optimizador con **momentum** mantiene una velocidad acumulada que combina el gradiente actual con la velocidad de pasos anteriores. Esto acelera el avance en direcciones donde el gradiente apunta consistentemente igual, pero puede hacer que el optimizador sobrepase el mínimo antes de asentarse, oscilando a su alrededor unos pasos antes de converger.

### Adam: adaptar la tasa de aprendizaje a cada peso
**Adam** combina dos ideas: una media móvil de los gradientes (similar al momentum) y una media móvil de sus cuadrados, que estima cuánto ha variado el gradiente recientemente en cada dirección. Dividiendo el paso por esa segunda media, Adam da pasos más pequeños en direcciones con gradientes muy variables y pasos más consistentes en las estables, sin necesidad de ajustar manualmente un $\eta$ distinto para cada peso.

### Batch, mini-batch y tamaño de lote
El gradiente puede calcularse con un único ejemplo, con todo el conjunto de entrenamiento o, lo más habitual, con un **lote** (*batch*) de tamaño intermedio. Lotes pequeños dan gradientes más ruidosos pero permiten más actualizaciones por época; lotes grandes dan gradientes más precisos pero requieren más memoria y tiempo por paso.

### Cuándo usar cada uno
Adam suele ser una opción por defecto razonable: es estable y converge rápido en la mayoría de los modelos. SGD con momentum puede generalizar mejor en modelos grandes bien ajustados, aunque exige más cuidado con la tasa de aprendizaje. RMSprop, una variante cercana a Adam, es habitual en redes recurrentes, donde los gradientes tienden a ser inestables.

## Formalización
$$
v \leftarrow \beta v - \eta \nabla_w L, \qquad w \leftarrow w + v
$$
donde:
- $v$ es la velocidad acumulada (inicialmente 0).
- $\beta$ es el coeficiente de momentum, entre 0 y 1.
- $\eta$ es la tasa de aprendizaje.
- $\nabla_w L$ es el gradiente de la pérdida respecto al peso $w$.

$$
m_t \leftarrow \beta_1 m_{t-1} + (1-\beta_1)g_t, \qquad v_t \leftarrow \beta_2 v_{t-1} + (1-\beta_2)g_t^2
$$
$$
w \leftarrow w - \eta \frac{\hat m_t}{\sqrt{\hat v_t}+\varepsilon}, \qquad \hat m_t=\frac{m_t}{1-\beta_1^t}, \ \ \hat v_t=\frac{v_t}{1-\beta_2^t}
$$
donde:
- $g_t$ es el gradiente en el paso $t$.
- $m_t$, $v_t$ son las medias móviles del gradiente y de su cuadrado.
- $\beta_1$, $\beta_2$ son los coeficientes de decaimiento de esas medias.
- $\hat m_t$, $\hat v_t$ son esas medias corregidas para compensar su inicialización en 0.
- $\varepsilon$ es una constante pequeña que evita dividir entre 0.

**Ejemplo numérico.** Para minimizar $L(w)=(w-3)^2$, con gradiente $2(w-3)$, partiendo de $w=0$ y $\eta=0{,}1$, tras 5 pasos: el descenso de gradiente simple llega a $w=2{,}017$, acercándose con cautela al mínimo en 3. Momentum ($\beta=0{,}9$) llega a $w=4{,}7413$, sobrepasando el mínimo por la inercia acumulada. Adam llega a $w=0{,}4982$, avanzando mucho más despacio en estos primeros pasos por su normalización adaptativa. Verificado con `numpy` en `tools/calc.py`.

## Interactivo
```widget
motor: descenso
modo: "optimizadores"
superficie: "(x-3)^2 + (y-3)^2"
inicio: [0, 0]
lr: 0.1
optimizadores: ["sgd", "momentum", "adam"]
rango: [-1, 6, -1, 6]
```
- Prueba a comparar cuántos pasos tarda cada optimizador en acercarse al mínimo $(3,3)$.
- Prueba a aumentar la tasa de aprendizaje y observa si momentum empieza a oscilar alrededor del mínimo.
- Prueba a reducir la tasa de aprendizaje y comprueba si Adam sigue avanzando a un ritmo razonable mientras SGD casi no se mueve.

## En código
```python
import numpy as np

def grad(w):
    return 2 * (w - 3)

eta = 0.1
w_sgd, w_mom, v = 0.0, 0.0, 0.0
for _ in range(5):
    w_sgd -= eta * grad(w_sgd)
    v = 0.9 * v - eta * grad(w_mom)
    w_mom += v

print(round(w_sgd, 4), round(w_mom, 4))
# 2.017 4.7413 -> momentum se pasa del mínimo (3), SGD se acerca con más cautela
```

## Errores típicos
- **Error**: Pensar que Adam siempre converge más rápido que SGD en cualquier problema → **Correcto**: Adam adapta la escala del paso por parámetro, pero eso no garantiza convergencia más rápida en todos los casos; en algunos problemas SGD con momentum generaliza mejor.
- **Error**: Confundir momentum con simplemente aumentar la tasa de aprendizaje → **Correcto**: momentum acumula una media de gradientes pasados (inercia direccional), no solo agranda cada paso individual.
- **Error**: Elegir un tamaño de lote grande sin más porque "converge mejor" → **Correcto**: un lote más grande da un gradiente más preciso por paso pero requiere más memoria y puede converger a mínimos que generalizan peor que los lotes pequeños.
- **Error**: Pensar que el optimizador sustituye a la necesidad de una buena tasa de aprendizaje → **Correcto**: incluso con Adam o momentum, una $\eta$ mal elegida puede hacer que el entrenamiento no converja o sea muy lento.

## En resumen
- Un optimizador usa el gradiente calculado por retropropagación para decidir cómo actualizar cada peso, más allá de $w \leftarrow w - \eta\nabla L$.
- Momentum acumula una media móvil de gradientes pasados: $v \leftarrow \beta v - \eta\nabla L$, $w \leftarrow w+v$; acelera en direcciones consistentes pero puede sobrepasar el mínimo.
- Adam adapta la tasa de aprendizaje a cada peso combinando una media de gradientes y una media de sus cuadrados.
- El tamaño de lote controla cuántos ejemplos se usan para calcular cada gradiente: lotes pequeños son más ruidosos pero más rápidos por paso.
- Adam es la opción por defecto razonable; SGD con momentum puede generalizar mejor en modelos grandes bien ajustados; RMSprop es habitual en RNN.
- La trampa principal: subir la tasa de aprendizaje para "arreglar" un entrenamiento lento sin comprobar antes si el problema es el optimizador o el propio $\eta$.

## A fondo
### Diagnóstico práctico por síntoma
Si el modelo no aprende, conviene aumentar el `learning_rate` o probar SGD con momentum. Si el modelo oscila mucho, lo contrario: reducir el `learning_rate` o usar SGD en vez de Adam. Si el entrenamiento es lento, aumentar el tamaño de lote o usar Adam. Si hay problemas de gradiente en redes recurrentes, RMSprop suele estabilizar mejor que Adam o SGD.

## Autoevaluación

### Con el ejemplo de la pérdida $(w-3)^2$, tras 5 pasos SGD llega a $w=2{,}017$ y momentum a $w=4{,}7413$. ¿Qué indica que momentum haya superado el valor 3?
- [x] Que ha sobrepasado el mínimo por la inercia acumulada de pasos anteriores
- [ ] Que hay un error de cálculo, un optimizador nunca puede superar el mínimo
- [ ] Que la tasa de aprendizaje de momentum es distinta de la de SGD
> Por qué: momentum acumula velocidad de iteraciones anteriores igual que un objeto con inercia; al acercarse al mínimo sigue teniendo velocidad acumulada en la misma dirección y lo sobrepasa, algo que el descenso de gradiente simple no hace porque no memoriza pasos anteriores.

### Si seguimos iterando momentum muchos pasos más sobre la misma superficie, ¿qué es lo más probable que ocurra?
- [ ] Se quedará estancado para siempre en $w=4{,}7413$
- [x] Oscilará alrededor del mínimo (3) e irá reduciendo la amplitud de las oscilaciones hasta converger
- [ ] Divergerá hacia infinito sin control
> Por qué: al sobrepasar el mínimo, el gradiente cambia de signo y frena la velocidad acumulada, lo que produce oscilaciones amortiguadas alrededor del mínimo hasta estabilizarse, siempre que $\eta$ y $\beta$ no sean demasiado grandes.

### Un compañero dice: "si mi red no converge, siempre hay que cambiar a Adam, es el mejor optimizador en todos los casos". ¿Qué falla en ese razonamiento?
- [x] Ignora que la tasa de aprendizaje mal ajustada, no el optimizador, puede ser la causa real de que no converja
- [ ] Es correcto, Adam siempre resuelve cualquier problema de convergencia
- [ ] El error es que Adam solo sirve para redes convolucionales
> Por qué: cambiar de optimizador no arregla una $\eta$ demasiado alta o un dato mal preprocesado; conviene diagnosticar la causa antes de cambiar de optimizador por defecto.

### ¿Qué diferencia principal hay entre SGD con momentum y Adam?
- [x] Momentum usa una única inercia acumulada por parámetro; Adam además adapta la magnitud del paso dividiendo por una media de los gradientes al cuadrado
- [ ] Adam no usa gradientes en absoluto, solo la pérdida
- [ ] No hay diferencia real, son el mismo algoritmo con nombres distintos
> Por qué: ambos acumulan un promedio de gradientes pasados (momentum), pero Adam añade una segunda media, la de los gradientes al cuadrado, que reescala el paso de cada parámetro según su historial reciente, algo que el momentum simple no hace.

## Glosario
- **momentum**: técnica que acumula una media de los gradientes de pasos anteriores para acelerar el descenso en direcciones consistentes.
- **tamaño de lote**: también llamado *batch size*, es el número de ejemplos usados para calcular el gradiente en cada paso de actualización.
