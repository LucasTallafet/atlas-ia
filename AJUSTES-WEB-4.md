# Ajustes 4 · Correcciones pendientes de DECISIONES.md (aprobadas por el usuario)

No toques `tools/`, `CLAUDE.md` ni el inventario. Al terminar, anota en `DECISIONES.md` cada punto como DECISIÓN y haz commit.

1. **kmeans (dispersion2d):** `iniciar` reasigna `ctx.estado` después de que `botones` lo haya capturado, así que el botón "Inicio: k-means++" no surte efecto. Cambia la reasignación por `Object.assign(ctx.estado, {...})` y comprueba que el botón cambia de verdad la inicialización.
2. **pca (dispersion2d-pca.js):** en el caso isótropo el segundo autovector sale igual al primero. Calcúlalo como perpendicular (`[-v1[1], v1[0]]`), como ya se hizo en `gmm`.
3. **grafo.js y matriz-calor.js:** añade `pointer-events: none` a los `<text>` e iconos que se dibujan sobre los elementos clicables, como se hizo en `rejilla.js`.
4. **graficos-estadisticos.md** (duplicado con `correlacion`):
   - Recorta la subsección "El coeficiente de correlación de Pearson" a 1-2 frases con un enlace a `[[correlacion]]`.
   - Quita de Formalización la fórmula con $\rho$.
   - Sustituye el ejemplo de código y la pregunta dedicados a Pearson por otros sobre gráficos. Así la ficha mantiene los mínimos de viñetas y preguntas.
   - Verifica los números con `python tools/calc.py`.
5. **Revisión visual** de lo que antes no se pudo capturar:
   - `python tools/probar_web.py --id kmeans --esencial --movil`
   - `python tools/probar_web.py --id bayes --esencial --oscuro`
   - `python tools/probar_web.py --vistas --oscuro`

   Mira las capturas y corrige lo que se vea mal. En especial, la constelación en tema oscuro y la vista Esencial.
6. `python tools/build.py --ejecutar` y `python tools/probar_web.py --demo`: 0 errores. Commit.
