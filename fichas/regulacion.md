---
id: regulacion
estado: borrador
---

## En una frase
El AI Act clasifica los sistemas de IA europeos según su nivel de riesgo —desde prohibido hasta apenas regulado— y exige más controles cuanto mayor es el peligro para los derechos fundamentales.

## Intuición
Imagina que un país regulara los vehículos según el peligro que representan: una bicicleta apenas necesita papeles, un coche necesita ITV y seguro, y un camión de mercancías peligrosas necesita permisos especiales, rutas autorizadas e inspecciones frecuentes. Nadie prohíbe conducir un camión, pero se le exige mucho más que a una bicicleta porque un fallo suyo hace más daño.

El AI Act (la ley de IA de la Unión Europea) hace algo parecido con los sistemas de inteligencia artificial: no los trata a todos igual, sino que ajusta las exigencias al riesgo que suponen para las personas. Un filtro de spam no necesita auditorías; un sistema que decide si alguien entra en prisión provisional, sí. Y hay usos —como vigilar a toda una población sin motivo— que directamente se prohíben, igual que no se permite circular con un camión sin frenos por muchos papeles que lleve.

Esto importa en IA porque, a diferencia de otras tecnologías, un mismo modelo (por ejemplo, un LLM) puede usarse en aplicaciones triviales o críticas: la regulación no juzga la técnica en sí, sino el contexto de uso.

## Explicación

### Por qué hacía falta un marco legal
Antes del AI Act, cuestiones como la privacidad o la responsabilidad ante un error —ya vistas en [[privacidad-responsabilidad]]— se resolvían aplicando normas generales a sistemas que planteaban riesgos nuevos: decisiones automatizadas opacas, manipulación a gran escala. La Unión Europea aprobó el **Reglamento de Inteligencia Artificial (AI Act)** el 1 de agosto de 2024: el primer marco jurídico integral pensado específicamente para la IA, con el objetivo de que su desarrollo y uso sean seguros, transparentes y respetuosos con los derechos fundamentales.

### La pirámide de riesgo
La pieza central del reglamento es clasificar cada sistema de IA según su **nivel de riesgo**. En el extremo superior, el **riesgo inaceptable** agrupa usos que se prohíben directamente: la vigilancia masiva indiscriminada, la manipulación del comportamiento de grandes grupos, la puntuación social al estilo de un sistema de crédito social, la monitorización de las emociones de empleados en el trabajo o el reconocimiento facial no verificado por las fuerzas de seguridad. El **alto riesgo** cubre aplicaciones en ámbitos como la salud, el transporte o la justicia: se permiten, pero deben superar auditorías rigurosas, ser explicables en sus decisiones y demostrar niveles altos de fiabilidad antes de operar. El resto —**riesgo bajo o limitado**— apenas tiene requisitos regulatorios más allá de una transparencia básica, como avisar de que se está hablando con un chatbot.

### Una entrada en vigor por fases
El reglamento no se aplica de golpe. Desde febrero de 2025 rigen las prohibiciones de riesgo inaceptable y las obligaciones de alfabetización en IA. Desde agosto de 2025 se regulan los **modelos de propósito general (GPAI)** —los grandes modelos, como los LLM, capaces de aplicarse a múltiples tareas— y entran en vigor la gobernanza y el régimen sancionador.

:::ampliacion
A fecha de esta ficha (septiembre de 2026), el calendario original se ha modificado: el llamado *Digital Omnibus*, aprobado en 2026, aplazó los requisitos más estrictos para los sistemas de alto riesgo al 2 de diciembre de 2027 (usos del anexo III, como empleo o justicia) y al 2 de agosto de 2028 (sistemas ligados a productos regulados del anexo I). En cambio, las obligaciones de transparencia del artículo 50 —informar cuando se interactúa con un sistema de IA y etiquetar el contenido sintético— sí entraron en vigor el 2 de agosto de 2026, tal como estaba previsto.
Fuente: OpenWebinars, "AI Act: qué cambia desde el 2 de agosto de 2026" (openwebinars.net) y V-Proof Protocol, "EU AI Act en vigor: qué cambia hoy para la IA de alto riesgo" (vproofprotocol.com), consultados en septiembre de 2026.
:::

### Quién vigila
La Comisión Europea creó la **Oficina Europea de IA** (*European AI Office*), con sede en Bruselas, para velar por el cumplimiento del reglamento, sobre todo en lo relativo a los modelos de propósito general; cuenta con más de un centenar de expertos organizados en cinco unidades dedicadas a gobernanza, transparencia y seguridad. El incumplimiento puede acarrear sanciones de hasta el **7 % del volumen de negocio global** de una empresa, un porcentaje superior al del Reglamento General de Protección de Datos (RGPD).

## Formalización
No aplica: el AI Act es un marco legal y de gobernanza, no un modelo matemático.

## Interactivo
```widget
motor: pasos
---
### La pirámide de riesgo del AI Act

Cada sistema de IA se sitúa en un nivel según el peligro que supone para las personas. A más riesgo, más obligaciones.
---
### Riesgo inaceptable — prohibido

Vigilancia masiva indiscriminada, manipulación del comportamiento de grandes grupos, puntuación social, reconocimiento facial no verificado por la policía o monitorización de emociones de empleados. No hay forma de cumplir: directamente no se permite.
---
### Alto riesgo — permitido con condiciones estrictas

Salud, transporte, justicia y otros ámbitos sensibles. Requiere auditorías rigurosas, decisiones explicables y niveles altos de fiabilidad antes de poder operar.
---
### Riesgo bajo o limitado — apenas regulado

La mayoría de los usos, como un chatbot de atención al cliente. Basta con cumplir requisitos mínimos de transparencia, como avisar de que se interactúa con una IA.
---
### Una capa aparte: los modelos de propósito general (GPAI)

Un LLM base no encaja en ningún nivel de la pirámide por sí solo: tiene sus propias obligaciones de transparencia y documentación técnica, independientemente de en qué aplicación se use después.
```

- Prueba a leer los cinco fotogramas y decidir en qué nivel situarías un sistema de IA que selecciona currículums para una entrevista de trabajo.
- Prueba a comparar los niveles "riesgo inaceptable" y "alto riesgo": la diferencia no está en la tecnología usada, sino en algo más. ¿En qué?
- Prueba a situar un asistente de voz de uso cotidiano en la pirámide y justifica por qué no está en el nivel más alto.

## Errores típicos
- **Error**: pensar que el AI Act prohíbe usar IA en sectores sensibles como la salud o la justicia. → **Correcto**: los permite, pero los clasifica como alto riesgo y exige auditorías, explicabilidad y fiabilidad demostrada antes de operar.
- **Error**: creer que el reglamento entró en vigor de golpe el 1 de agosto de 2024. → **Correcto**: se aplica de forma progresiva y por fases, y el calendario incluso se ha modificado desde entonces, como muestra el aplazamiento del alto riesgo.
- **Error**: confundir un "modelo de propósito general (GPAI)" con un "sistema de alto riesgo". → **Correcto**: son categorías distintas; un GPAI como un LLM base tiene sus propias obligaciones de transparencia, independientes de si la aplicación final que lo usa es de alto riesgo.
- **Error**: suponer que todas las infracciones del AI Act tienen la misma sanción. → **Correcto**: la sanción depende de la gravedad, con un máximo del 7 % del volumen de negocio global reservado para los usos de riesgo inaceptable.

## En resumen
- El AI Act (Reglamento UE 2024/1689, en vigor desde el 1 de agosto de 2024) clasifica los sistemas de IA europeos por nivel de riesgo y ajusta las obligaciones a ese nivel.
- Riesgo inaceptable → prohibido (vigilancia masiva, manipulación de grupos, puntuación social). Alto riesgo → permitido con auditorías, explicabilidad y fiabilidad (salud, transporte, justicia). Riesgo bajo o limitado → apenas requisitos, solo transparencia básica.
- Los modelos de propósito general (GPAI, como los LLM base) tienen obligaciones propias de transparencia y documentación, aparte de la pirámide de riesgo.
- Se aplica por fases, no de golpe: el calendario se revisa con el tiempo (el aplazamiento del alto riesgo a 2027-2028 es un ejemplo reciente).
- La Oficina Europea de IA, en Bruselas, vigila el cumplimiento, sobre todo de los GPAI.
- La trampa principal: creer que "sector sensible" equivale a "prohibido" — casi siempre significa "más auditado", no "vetado".

## A fondo
La implementación no está exenta de tensiones. En julio de 2025 se presentó un Código de Prácticas para los GPAI, con guías sobre transparencia y propiedad intelectual: empresas como OpenAI se adhirieron voluntariamente, mientras que otras, como Meta, lo rechazaron por considerar que genera incertidumbre legal y limita la innovación. La disputa resume el dilema central de la norma: garantizar confianza y derechos fundamentales sin frenar la competitividad europea frente a Estados Unidos o China.

Para compensar el coste regulatorio, especialmente duro para las startups (auditorías, documentación, obligaciones de cumplimiento), la Unión Europea anunció en paralelo un plan de inversión de 20.000 millones de euros en "AI gigafactories": grandes centros de supercomputación destinados a reforzar la soberanía tecnológica y estimular la investigación en salud, robótica y descubrimiento científico.

## Autoevaluación
### ¿Qué uso de IA cae en el nivel de "riesgo inaceptable" del AI Act y queda directamente prohibido?
- [ ] Un sistema de IA que decide la concesión de un préstamo bancario
- [x] Un sistema de puntuación social que clasifica a los ciudadanos según su comportamiento
- [ ] Un chatbot de atención al cliente que se identifica como IA
> Por qué: el sistema de crédito bancario es alto riesgo (permitido con auditorías) y el chatbot es riesgo bajo o limitado (solo transparencia); la puntuación social está en la lista explícita de usos prohibidos, junto con la vigilancia masiva indiscriminada.

### Un hospital quiere usar un sistema de IA para priorizar pacientes en urgencias. Según el AI Act, ¿qué debe demostrar antes de ponerlo en marcha?
- [ ] Nada especial: la salud no es un sector que la ley cubra explícitamente
- [ ] Únicamente que informe a los pacientes de que interactúan con una IA
- [x] Que ha superado auditorías rigurosas, que sus decisiones son explicables y que demuestra fiabilidad
> Por qué: la salud es uno de los ámbitos explícitamente citados como alto riesgo; ahí no basta la transparencia básica exigida a los sistemas de riesgo bajo o limitado, hace falta auditoría, explicabilidad y fiabilidad antes de operar.

### ¿Cuál es la sanción máxima que prevé el AI Act para los usos de riesgo inaceptable?
- [ ] El 4 % del volumen de negocio global, igual que el RGPD
- [x] El 7 % del volumen de negocio global
- [ ] Una multa fija de 20 millones de euros, sin relación con la facturación
> Por qué: el AI Act sube el techo sancionador por encima del RGPD (4 %) hasta el 7 % del volumen de negocio global de la empresa para las infracciones más graves.

### Una empresa lanza en septiembre de 2026 un sistema de contratación automatizada (ámbito de alto riesgo, anexo III) sin las auditorías completas. Según el aplazamiento aprobado en el Digital Omnibus, ¿incumple ya el AI Act?
- [ ] Sí, los requisitos de alto riesgo del anexo III llevan en vigor desde agosto de 2025
- [x] Todavía no los requisitos específicos de alto riesgo, aplazados al 2 de diciembre de 2027, pero sí debe cumplir ya las obligaciones de transparencia vigentes desde agosto de 2026
- [ ] No, porque el AI Act eliminó por completo la categoría de alto riesgo
> Por qué: el calendario original preveía agosto de 2026 para el alto riesgo, pero el Digital Omnibus lo aplazó al 2 de diciembre de 2027 (anexo III); eso no exime de otras obligaciones, como la transparencia del artículo 50, que sí está en vigor.

## Glosario
- **AI Act**: Reglamento de Inteligencia Artificial de la Unión Europea (UE 2024/1689), primer marco jurídico integral para la IA, en vigor desde el 1 de agosto de 2024.
- **modelo de propósito general (GPAI)**: modelo de IA capaz de aplicarse a múltiples tareas (por ejemplo, un LLM base), con obligaciones de transparencia y documentación propias dentro del AI Act.
- **riesgo inaceptable**: categoría de usos de IA que el AI Act prohíbe directamente, como la vigilancia masiva indiscriminada o la puntuación social.
- **Oficina Europea de IA** (*European AI Office*): organismo de la Comisión Europea, con sede en Bruselas, encargado de supervisar el cumplimiento del AI Act, sobre todo de los GPAI.
