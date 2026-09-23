# Ajustes de web 2 · Vista "Esencial" como resumen práctico

`CLAUDE.md` §3, `PLANTILLA-FICHA.md` y `tools/` ya incluyen la nueva sección obligatoria **"En resumen"** (va entre "Errores típicos" y "A fondo").

1. Añade "## En resumen" a las fichas `derivada`, `metricas-clasificacion` y `kmeans`, siguiendo la regla de `CLAUDE.md` §3 y el ejemplo de la plantilla. Para `kmeans`, cubre:
   - qué hace;
   - el algoritmo en pasos (asignar → recalcular centroides → repetir hasta converger);
   - la función objetivo;
   - cómo elegir k (codo, silueta);
   - la necesidad de escalar los datos;
   - cuándo no usarlo (clústeres no esféricos o de tamaños muy distintos, atípicos);
   - la sensibilidad a la inicialización (k-means++).

   Sácalo del contenido que ya tiene la ficha; no hace falta el extractor.
2. Cambia la vista **Esencial** en `docs/app.js` y `docs/estilos.css` según `ESPEC-WEB.md` §5.5:
   - En una frase → **En resumen** (destacado) → Interactivo → Errores típicos → Autoevaluación;
   - sin títulos sueltos.

   En la vista Completa, "En resumen" se muestra como recuadro "Para llevar" después de Errores típicos.
3. Ejecuta `python tools/build.py`, `python tools/probar_web.py --id kmeans --movil` y `python tools/probar_web.py --id derivada`. Mira las capturas en las dos vistas y corrige lo que se vea mal. Después, commit.
