# AJUSTES-MOVIL-8 · App Android (PWA) y cierre

Lee antes `AJUSTES-MOVIL-COMUN.md` y `AJUSTES-WEB-5.md`.

## Objetivo
Que el Atlas se instale en Android como una app (icono, pantalla completa, sin conexión) y se sienta nativo.

## Haz
1. **PWA base.** Si `AJUSTES-WEB-5.md` no está aplicado (comprueba que `index.html` enlaza `manifest.webmanifest`, que `app.js` registra `sw.js` solo en https y que existe el botón Instalar), aplícalo entero primero.
2. **Manifest:** `display: "standalone"`, `orientation: "any"`, `theme_color` y `background_color` coherentes con el tema, `lang: "es"`, `categories: ["education"]`, iconos 192/512/maskable ya existentes, y 3 **atajos** (`shortcuts`): Repaso (`./#repaso`), Rutas (`./#rutas`), Glosario (`./#glosario`).
3. **Aspecto nativo:** `<meta name="theme-color">` con dos valores (`media="(prefers-color-scheme: …)"`) y que se actualice al cambiar el tema a mano; sin resaltado azul al tocar (`-webkit-tap-highlight-color: transparent`, con estado `:active` propio); sin selección de texto accidental en botones y controles (sí en el contenido); `overscroll-behavior-y: contain` en hojas inferiores y paneles; la barra inferior respeta la barra de gestos de Android.
4. **Instalación:** en Android el botón "Instalar app" usa `beforeinstallprompt`; si ya está instalada (`display-mode: standalone`) se oculta. Tras instalar, un `aviso` breve.
5. **Sin conexión:** tras la primera visita, todas las vistas, las 138 fichas y los motores funcionan sin red (el precache lo genera `build.py`). Al publicarse una versión nueva, `aviso` "Nueva versión disponible · Actualizar".
6. **Progreso en el móvil:** en el menú ⋮, "Exportar progreso" usa `navigator.share` con el archivo si está disponible (para mandarlo al PC) y, si no, la descarga actual; "Importar" acepta el mismo archivo.
7. **Revisión final** en Android emulado de las 5 vistas, 5 fichas variadas y la demo, en claro y oscuro, en vertical y en **horizontal** (para el horizontal no hay opción en `probar_web.py`: razona sobre el CSS con `@media (orientation: landscape) and (max-height: 500px)` y comprueba que la barra inferior, las hojas y el modo Ampliar funcionan a 915 × 412). Arregla lo que veas.

## Hecho cuando
- `python tools/build.py` → 0 errores (regenera `docs/precache.js`).
- `python tools/probar_web.py --vistas --android`, `--demo --android`, `--vistas --android --oscuro` y `--vistas` (escritorio): 0 errores.
- `README.md`: en "Qué puedes hacer en la web" una línea sobre la app Android instalable y sin conexión, y en la lista de vistas que la Constelación es solo de escritorio.
- `ESPEC-WEB.md` §9 (publicación) describe la PWA y cómo se actualiza.
- `DECISIONES.md` y commit `Móvil 8: app Android`.
