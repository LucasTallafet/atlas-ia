---
id: optimizacion-inferencia
estado: borrador
---

## En una frase

Reducir la precisión numérica o el número de parámetros activos de un modelo permite ejecutar inferencias más rápidas y baratas, con una pérdida de calidad casi imperceptible.

## Intuición

Imagina que guardas una fotografía con menos bits por píxel: el archivo pesa mucho menos y se carga al instante, y a simple vista casi no notas diferencia con el original, salvo que hagas mucho zoom. Con los modelos de IA pasa algo parecido: sus pesos suelen guardarse con más precisión numérica de la que realmente hace falta para que las predicciones sean buenas. Reducir esa precisión —o quitar directamente conexiones poco importantes— es la diferencia entre necesitar un centro de datos con miles de GPUs o poder ejecutar un modelo grande en un móvil.

## Explicación

### El coste de mover modelos gigantes

Entrenar y servir modelos de gran escala, como los [[llms|LLMs]], requiere **GPUs y TPUs**, procesadores diseñados para acelerar los cálculos de redes neuronales; en los centros de datos más avanzados, un solo modelo puede entrenarse repartido entre miles de ellos mediante **entrenamiento distribuido**, dividiendo datos y parámetros entre múltiples nodos de cómputo.

### Cuantización: menos precisión, casi la misma calidad

La [[llms|cuantización]] reduce la precisión numérica con la que se almacenan los pesos del modelo —por ejemplo, de coma flotante de 32 bits (FP32) a 16 bits (FP16) o a enteros de 8 bits (INT8)—, sin afectar de forma significativa a la calidad de las predicciones. Menos bits por peso significa menos memoria ocupada y una inferencia más rápida, algo clave para desplegar modelos en dispositivos con recursos limitados.

### Ajuste eficiente: adaptar sin reentrenar todo

Cuando hay que especializar un modelo preentrenado en una tarea nueva, reentrenar todos sus parámetros es caro. El **fine-tuning eficiente** ataja este problema: técnicas como **LoRA** (*Low-Rank Adaptation*) añaden un número mucho menor de parámetros entrenables junto al modelo original, congelado, y ajustan solo esos, reduciendo drásticamente el coste computacional sin perder calidad.

### Otras palancas: MoE, poda y procesamiento por lotes

Arquitecturas como [[llms|Mixture of Experts (MoE)]] dividen el cálculo entre varias redes especializadas y activan solo un subconjunto en cada paso, en vez de todos los parámetros a la vez, lo que aumenta la capacidad del modelo sin disparar el coste de cómputo. En el otro extremo del ciclo de vida, ya con el modelo entrenado, la **poda de un modelo** (*pruning*) elimina conexiones poco relevantes para aligerar el modelo, y agrupar varias peticiones en un mismo cálculo (*batching*) o reutilizar resultados ya calculados (*caching*) mejora la eficiencia de la inferencia sin tocar el modelo en absoluto.

## Formalización

:::ampliacion
**Memoria de un modelo cuantizado.** Si un modelo tiene $n$ parámetros y cada uno se almacena con $b$ bits, la memoria necesaria es:

$$M = \frac{n \cdot b}{8 \cdot 10^9}\ \text{GB}$$

donde:
- $n$: número de parámetros del modelo.
- $b$: bits usados por parámetro (32 en FP32, 16 en FP16, 8 en INT8).

**Ejemplo numérico.** Un modelo de $n=7\times10^9$ parámetros (7.000 millones, como LLaMA-2-7B) ocupa:

$$M_{FP32}=28\ \text{GB}\qquad M_{FP16}=14\ \text{GB}\qquad M_{INT8}=7\ \text{GB}$$

Pasar de FP32 a INT8 divide la memoria por 4, lo que puede ser la diferencia entre necesitar varias GPUs o poder cargar el modelo en una sola.
Fuente: documentación de Hugging Face PEFT / bitsandbytes.
:::

:::ampliacion
**Parámetros entrenables con LoRA.** Para una matriz de pesos de tamaño $d\times k$, ajustarla por completo exige entrenar $d\cdot k$ parámetros. LoRA la sustituye por dos matrices pequeñas de rango $r\ll d,k$, con:

$$P_{LoRA} = r\cdot(d+k)$$

donde:
- $d,k$: dimensiones de la matriz de pesos original.
- $r$: rango de las matrices de bajo rango que introduce LoRA (un hiperparámetro pequeño, típicamente entre 4 y 64).

**Ejemplo numérico.** Con $d=k=1024$ y $r=8$: ajustar la matriz completa exige $1024\times1024=1.048.576$ parámetros; con LoRA solo $8\times(1024+1024)=16.384$, es decir, un $1{,}56\,\%$ de los originales.
Fuente: Hu, E. et al. (2021), "LoRA: Low-Rank Adaptation of Large Language Models".
:::

## Interactivo

```widget
motor: funcion
modo: "barras"
datos: {"etiquetas": ["FP32", "FP16", "INT8"], "series": [{"nombre": "Memoria de un modelo de 7.000 M de parámetros (GB)", "valores": [28, 14, 7]}]}
```

Prueba a…
1. Prueba a comparar la barra de FP32 con la de INT8: ¿cuántas veces más memoria ocupa FP32?
2. Prueba a imaginar que tu GPU solo tiene 8 GB de memoria: ¿qué formatos de precisión permitirían cargar este modelo de 7.000 millones de parámetros?
3. Prueba a recalcular mentalmente las tres barras si el modelo tuviera 70.000 millones de parámetros en vez de 7.000 millones.

## En código

```python
n = 7e9
for etiqueta, bits in [("FP32", 32), ("FP16", 16), ("INT8", 8)]:
    memoria_gb = n * bits / 8 / 1e9
    print(etiqueta, memoria_gb)
# FP32 28.0
# FP16 14.0
# INT8 7.0
```

## Errores típicos

- **Error**: pensar que la cuantización siempre degrada mucho la calidad del modelo → **Correcto**: bajar de FP32 a FP16 o incluso INT8 suele perder muy poca calidad, porque los pesos rara vez necesitan toda la precisión de 32 bits para producir predicciones útiles.
- **Error**: confundir cuantización con poda (*pruning*) → **Correcto**: la cuantización reduce los bits usados para representar cada peso; la poda elimina directamente conexiones o parámetros enteros del modelo. Son técnicas distintas y complementarias.
- **Error**: creer que LoRA reduce el tamaño del modelo que hay que servir en producción → **Correcto**: LoRA reduce los parámetros que hay que entrenar durante el ajuste fino; el modelo base sigue teniendo el mismo tamaño en inferencia, salvo que se combinen ambas matrices en una sola.
- **Error**: asumir que basta una única GPU para entrenar cualquier modelo grande → **Correcto**: los modelos de gran escala se entrenan repartiendo datos y parámetros entre miles de GPUs o TPUs mediante entrenamiento distribuido.

## En resumen

- Estas técnicas reducen el coste de memoria y de cómputo de un modelo grande, en entrenamiento o en inferencia.
- Cuantización: menos bits por peso (FP32→FP16→INT8), memoria proporcional a $n\cdot b$.
- LoRA/PEFT: ajustar solo un pequeño número de parámetros nuevos ($r\cdot(d+k)$) en vez de reentrenar toda la matriz ($d\cdot k$).
- MoE activa solo un subconjunto de la red por paso; la poda elimina conexiones; batching/caching aceleran la inferencia sin tocar el modelo.
- Se usan cuando el modelo es demasiado grande, lento o caro para el hardware disponible (móvil, una sola GPU, Google Colab gratuito).
- Decisión clave: cuánta precisión o cuántos parámetros se pueden recortar antes de que la calidad se resienta de forma notable.
- La trampa principal: tratar todas estas técnicas como intercambiables cuando resuelven problemas distintos (memoria, coste de entrenamiento, velocidad de inferencia).

## A fondo

En entornos con recursos muy limitados, como Google Colab gratuito, suele ser más práctico usar un modelo ya entrenado con un *prompt* bien formulado que hacer *fine-tuning*: tareas como resumen, traducción o generación de texto pueden resolverse con `.generate()` sin ajustar ningún peso, reservando el ajuste fino para dominios muy específicos o cuando el rendimiento por *prompting* no basta. Herramientas como `TensorFlow Lite` aplican poda y cuantización juntas para reducir el tamaño de un modelo antes de exportarlo, y una vez desplegado, agrupar peticiones (*batching*) y cachear resultados ya calculados son las formas más simples de ganar eficiencia en la inferencia sin tocar el modelo en absoluto.

## Autoevaluación

### Un equipo quiere ejecutar un modelo de 7.000 millones de parámetros en una GPU con solo 10 GB de memoria. Entrenado en FP32, el modelo ocupa 28 GB. ¿Qué formato de precisión resolvería el problema con menos pérdida de calidad?
- [ ] FP32, porque es el más preciso y por tanto el más fiable
- [x] INT8, porque reduce la memoria a 7 GB, dentro del límite de la GPU
- [ ] Ninguno: un modelo de 7.000 millones de parámetros nunca cabe en 10 GB
> Por qué: la memoria es proporcional a los bits por parámetro; pasar de FP32 (28 GB) a INT8 (7 GB) divide la memoria por 4 y cabe en la GPU, con una pérdida de calidad habitualmente pequeña.

### ¿Por qué LoRA permite ajustar un modelo grande con muchos menos recursos que el fine-tuning completo?
- [ ] Porque LoRA entrena el modelo con datos de menor calidad
- [x] Porque congela los pesos originales y solo entrena dos matrices pequeñas de rango bajo, con muchos menos parámetros que la matriz completa
- [ ] Porque LoRA reduce automáticamente el tamaño del modelo en disco
> Por qué: LoRA no toca los pesos originales; añade matrices de bajo rango con $r\cdot(d+k)$ parámetros, muchos menos que los $d\cdot k$ de ajustar la matriz completa.

### Un modelo con arquitectura Mixture of Experts (MoE) tiene muchos más parámetros totales que un modelo denso equivalente, pero cuesta menos calcular cada predicción. ¿Por qué?
- [ ] Porque MoE usa siempre números en precisión más baja
- [x] Porque MoE activa solo un subconjunto de expertos (parámetros) en cada paso, no la red completa
- [ ] Porque MoE elimina parámetros irrelevantes de forma permanente, igual que la poda
> Por qué: MoE aumenta la capacidad total del modelo repartiéndola en expertos especializados, pero un mecanismo de enrutamiento activa solo unos pocos por cada entrada, evitando el coste de usarlos todos.

## Glosario

- **LoRA (*Low-Rank Adaptation*)**: técnica de ajuste fino eficiente que congela los pesos originales y entrena solo dos matrices pequeñas de rango bajo añadidas al modelo.
- **Poda de un modelo (*pruning*)**: eliminación de conexiones o parámetros poco relevantes de un modelo ya entrenado para reducir su tamaño.
