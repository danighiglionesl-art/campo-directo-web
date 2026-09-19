# 🌾 Campo Directo - Documentación Técnica PWA (Progressive Web App)

Este documento detalla la implementación, arquitectura, ciclo de vida, soporte multiplataforma y directrices de mantenimiento de las capacidades **PWA** de **Campo Directo** (`campodirecto.ar`).

---

## 1. ¿Qué se implementó?

Se dotó a la plataforma web de Campo Directo de capacidades PWA completas sin alterar el diseño visual, el contenido, la estructura ni las funcionalidades existentes (incluyendo "Tu Cotización" y el catálogo).

Principales capacidades incorporadas:
* **Instalabilidad:** Campo Directo puede instalarse como aplicación nativa en dispositivos Android, iPhone, iPad, Windows, macOS y Linux.
* **Modo Standalone:** Al ejecutarse desde la pantalla de inicio o el escritorio, se abre en una ventana independiente, sin barras de navegación del navegador, brindando una experiencia inmersiva de aplicación móvil y de escritorio.
* **Service Worker seguro e inteligente:** Estrategia *Network-First* para navegación HTML, *Network-Only* para APIs críticas (cotizaciones y CUIT) y caché de recursos estáticos clave.
* **Pantalla de cortesía Offline:** Si el usuario no tiene conexión a internet, se presenta una pantalla formal de contingencia (*"Estás sin conexión"* con botón *"Reintentar"*).
* **Experiencia de instalación contextual:** Invitación discreta (*"Llevá Campo Directo con vos"*) adaptada para Android/Desktop y guía visual con pasos (*"Compartir → Añadir a pantalla de inicio"*) para Safari en iOS.
* **Persistencia de "Tu Cotización":** Los productos agregados al carrito de cotización se resguardan de forma segura en el almacenamiento local del dispositivo (`localStorage`), evitando la pérdida de datos ante recargas o cierres accidentales.
* **Sistema de Actualizaciones:** Detección de nuevas versiones y recarga controlada mediante `skipWaiting`.

---

## 2. Archivos Creados y Modificados

### Archivos Creados
* `public/sw.js`: Service Worker que gestiona el ciclo de vida de caché, contingencia offline y llamadas seguras de red.
* `src/app/offline/page.tsx`: Pantalla de contingencia cuando el usuario no cuenta con conexión a internet.
* `src/components/pwa/PwaInstallPrompt.tsx`: Componente de interfaz de usuario para la instalación adaptada a Android, iOS y computadoras.
* `src/components/pwa/PwaRegistrar.tsx`: Componente cliente que registra el Service Worker y gestiona notificaciones de actualizaciones.
* `PWA-CAMPO-DIRECTO.md`: Esta documentación técnica.

### Archivos Modificados
* `src/app/manifest.ts`: Configuración oficial de Web App Manifest con App Router (verde institucional `#339966`, orientación `portrait-primary`, identificador, categoría e íconos maskable).
* `public/manifest.json`: Versión JSON estática sincronizada para compatibilidad universal con navegadores antiguos y validadores.
* `src/app/layout.tsx`: Incorporación de metadatos PWA, metaetiquetas para iOS (`apple-mobile-web-app-capable`), viewport y color de tema oficial (`#339966`).
* `src/components/providers/ClientProviders.tsx`: Integración modular de los componentes cliente `PwaRegistrar` y `PwaInstallPrompt`.
* `src/components/sections/QuotationSection.tsx`: Persistencia automática del carrito de cotización (`cd_quotation_cart`) en `localStorage`.

---

## 3. Funcionamiento de la Instalación

### En Android / Navegadores Chromium (Chrome, Edge, Brave)
1. El navegador detecta que la web cumple los requisitos PWA (Manifest válido, Service Worker activo, HTTPS y metadatos).
2. El evento `beforeinstallprompt` es interceptado por `PwaInstallPrompt.tsx`.
3. Se muestra un banner discreto en la parte inferior con el texto:
   * **Título:** *"Llevá Campo Directo con vos"*
   * **Subtítulo:** *"Instalalo en tu dispositivo y accedé directamente cuando lo necesites."*
   * **Botón:** *"Instalar Campo Directo"*
4. Al hacer clic, se ejecuta el cuadro de diálogo nativo del sistema operativo (`prompt()`).
5. Tras completarse la instalación, se captura el evento `appinstalled`, se guarda la confirmación en `localStorage` y se oculta la invitación.
6. Si el usuario presiona "Ahora no", la invitación se pospone por 7 días para no resultar invasiva.

### En iPhone / iPad (Safari)
1. Dado que Apple no soporta `beforeinstallprompt`, el sistema detecta dispositivos iOS/iPadOS cuando no están en modo standalone.
2. Al pulsar el botón de instalación, se despliega una guía visual paso a paso:
   1. *Tocá el botón Compartir en la barra inferior de Safari.*
   2. *Buscá y seleccioná "Añadir a pantalla de inicio".*
   3. *Confirmá tocando "Añadir" arriba a la derecha.*
3. No se muestran instrucciones de Android a usuarios de iOS, ni viceversa.

### En Computadoras de Escritorio (Desktop)
1. En Chrome y Edge de escritorio, aparece tanto el ícono nativo de instalación en la barra de direcciones como el botón en pantalla.
2. La aplicación se instala como una ventana independiente con el ícono y nombre oficial de Campo Directo.

### En Modo Standalone (App instalada y abierta)
* Si la aplicación ya se está ejecutando en modo standalone (`display-mode: standalone` o `navigator.standalone === true`), la invitación de instalación se desactiva por completo.

---

## 4. Estrategia de Service Worker (`public/sw.js`)

Para proteger la integridad de los datos comerciales y de Next.js, se establecieron las siguientes políticas:

1. **Páginas HTML (Navegación): `Network-First`**
   * Siempre intenta descargar la versión más reciente del servidor.
   * Si la red no responde (offline), recupera la última versión en caché o entrega la página `/offline`.
2. **APIs y Formularios: `Network-Only`**
   * Todas las rutas que comienzan con `/api/` (como `/api/cotizacion` o `/api/cuit`) **nunca son cacheadas**.
   * Las peticiones `POST` siempre viajan directamente al backend.
3. **Recursos Estáticos (Next.js JS/CSS, imágenes, íconos): `Stale-While-Revalidate`**
   * Se entregan de inmediato desde la caché para máxima velocidad, mientras en segundo plano se verifica si existen archivos nuevos.

---

## 5. Estrategia de Actualizaciones

Cuando se despliega una nueva versión de Campo Directo en producción:
1. El navegador detecta cambios en `sw.js` o en los chunks de la aplicación.
2. El nuevo Service Worker se descarga en segundo plano y pasa al estado `waiting`.
3. El componente `PwaRegistrar` detecta este estado y presenta una notificación discreta:
   * **Texto:** *"Hay una nueva versión de Campo Directo disponible."*
   * **Botón:** *"Actualizar"*
4. Al pulsar "Actualizar", se envía el mensaje `{ action: "skipWaiting" }` al Service Worker y la aplicación se recarga automáticamente con la última versión, sin que el usuario deba desinstalar o reinstalar nada.

---

## 6. Cómo Cambiar o Actualizar los Íconos en el Futuro

Los íconos oficiales se encuentran en la carpeta `public/`:
* `public/android-chrome-192x192.png`: 192×192 píxeles (formato PNG).
* `public/android-chrome-512x512.png`: 512×512 píxeles (formato PNG).
* `public/apple-touch-icon.png`: 180×180 píxeles (formato PNG para iOS).

### Reglas de Diseño Oficial:
1. **No rediseñar ni deformar el logotipo original.**
2. **Área segura para Android (Maskable):** En el lienzo de 512×512, el logo debe estar centrado dentro de un círculo interior de diámetro de aproximadamente 410 píxeles (margen libre de al menos 51 píxeles por lado) sobre fondo blanco sólido (`#ffffff`).
3. Tras reemplazar cualquier archivo, actualizar la versión en la URL del manifest (ej: `?v=4`) para invalidar cachés previas.

---

## 7. Verificación de la PWA

Para comprobar técnicamente que la PWA funciona:
1. **En Google Chrome (DevTools):**
   * Abrir la consola (`F12` o `Ctrl+Shift+I`) e ir a la pestaña **Application** (Aplicación).
   * **Manifest:** Comprobar que el nombre sea "Campo Directo", `theme_color` sea `#339966`, `display: standalone` y los íconos se listen correctamente.
   * **Service Workers:** Comprobar que `/sw.js` figure como **Activated and is running**.
2. **Prueba Offline:**
   * En la pestaña **Network**, seleccionar el desplegable de velocidad y elegir **Offline**.
   * Al refrescar o navegar, se desplegará la pantalla oficial de contingencia con el botón *"Reintentar"*.
3. **Auditoría Lighthouse:**
   * En Chrome DevTools, pestaña **Lighthouse**, marcar la categoría **PWA** y ejecutar auditoría para verificar los criterios de instalación.

---

## 8. Consideraciones y Limitaciones

* **Requisito HTTPS:** Las PWAs requieren HTTPS obligatorio para registrar Service Workers e instalarse en entornos de producción (en `localhost` funciona por excepción del estándar).
* **Políticas de iOS:** En navegadores de terceros en iOS (como Chrome o Firefox para iOS), Apple no permite la instalación directa de PWAs en la pantalla de inicio; el usuario debe abrir el sitio en **Safari** para agregarlo a la pantalla de inicio. La guía implementada asiste al usuario en este aspecto.
