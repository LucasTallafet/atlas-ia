# Ajustes 5 · Convertir la web en app instalable (PWA)

Ya existen los archivos `docs/manifest.webmanifest`, `docs/sw.js` y `docs/iconos/`. Además, `tools/build.py` genera `docs/precache.js`, con la lista de archivos y la versión. No toques `tools/`.

1. En `docs/index.html`, dentro de `<head>`, añade:
   - `<link rel="manifest" href="manifest.webmanifest">`
   - `<meta name="theme-color" content="#111614">`
   - `<link rel="apple-touch-icon" href="iconos/apple-touch-icon.png">`
   - `<meta name="apple-mobile-web-app-capable" content="yes">`
   - `<meta name="apple-mobile-web-app-title" content="Atlas IA">`
2. En `docs/app.js`, registra el service worker **solo si** `'serviceWorker' in navigator && location.protocol === 'https:'`, con `navigator.serviceWorker.register('sw.js')`. En `file://` no debe hacer nada ni dar errores.
3. En Ajustes, en `#inicio`, añade un apartado "App":
   - un botón **"Instalar app"** que use el evento `beforeinstallprompt` si el navegador lo ofrece. En iPhone, en su lugar, muestra el texto: Safari → Compartir → "Añadir a pantalla de inicio";
   - el estado **"Disponible sin conexión ✓"** cuando el service worker esté activo;
   - un aviso **"Hay una versión nueva — Recargar"** cuando se instale un SW nuevo.
4. Con la app en modo standalone (`display-mode: standalone`), revisa en móvil que la cabecera y los márgenes respetan las zonas seguras (`env(safe-area-inset-*)`).
5. Ejecuta `python tools/build.py` (debe generar `docs/precache.js`), `python tools/probar_web.py --vistas --movil` y `python tools/probar_web.py --id kmeans --movil`. Todo con 0 errores. Commit.
