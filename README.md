# 🌾 Campo Directo - Sitio Web Oficial

Sitio web oficial de **Campo Directo** (Argentina), desarrollado con una arquitectura moderna, rápida, accesible y orientada a la **conversión comercial** directa vía WhatsApp y formularios para productores y empresas del sector agropecuario.

---

## 🎨 Identidad Visual & Manual de Marca

El desarrollo sigue rigurosamente los lineamientos cromáticos y geométricos oficiales:
* **Verde Institucional:** `#339966` / RGB (26, 128, 75) / Pantone 7731 C
* **Amarillo Primario (Hoja):** `#F0B922` / RGB (240, 185, 34) / Pantone 7549 C
* **Ocre / Dorado (Acento Hoja):** `#E58817` / RGB (229, 136, 23) / Pantone 7564 C
* **Instagram Oficial:** [@campodirecto.ar](https://www.instagram.com/campodirecto.ar/)

---

## 🚀 Tecnologías Utilizadas

* **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Components y Static Site Generation).
* **Librería UI:** [React 18](https://react.dev/).
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) (tipado estricto para productos, navegación y formularios).
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/) (diseño responsive, mobile-first y paleta de marca extendida).
* **Iconografía:** [Lucide React](https://lucide.dev/).
* **SEO:** Generación estática automática de `sitemap.xml`, `robots.txt` y metadatos OpenGraph.

---

## 📂 Estructura del Proyecto

```text
campo-directo-web/
├── src/
│   ├── app/
│   │   ├── globals.css          # Estilos globales y directivas Tailwind
│   │   ├── layout.tsx           # Shell principal (Header, Footer, WhatsApp flotante, SEO)
│   │   ├── page.tsx             # Página principal con las 7 secciones integradas
│   │   ├── robots.ts            # Configuración de robots.txt
│   │   └── sitemap.ts           # Configuración dinámica de sitemap.xml
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx       # Navbar con glassmorphism, menú móvil y CTA
│   │   │   └── Footer.tsx       # Pie de página institucional, redes y legales
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx      # Portada de alto impacto con CTAs y slogan
│   │   │   ├── AboutSection.tsx     # Quiénes Somos (estructura editorial y 3 pilares)
│   │   │   ├── ProductsSection.tsx  # Catálogo con filtros y WhatsApp dinámico
│   │   │   ├── WhatWeDoSection.tsx  # Tarjetas modulares de actividades y servicios
│   │   │   ├── WhyUsSection.tsx     # Los 7 diferenciales oficiales de marca
│   │   │   ├── CoverageSection.tsx  # Representación geográfica y alcance en Argentina
│   │   │   └── ContactSection.tsx   # Formulario de 7 campos + accesos directos
│   │   └── ui/
│   │       ├── Logo.tsx             # Isologotipo vectorial fiel al manual
│   │       └── WhatsAppButton.tsx   # Botón flotante y dinámico con mensajes automáticos
│   ├── data/
│   │   ├── siteConfig.ts        # Configuración central (teléfonos, redes, textos de inicio)
│   │   ├── products.ts          # Catálogo de productos y categorías
│   │   ├── services.ts          # Listado modular de actividades
│   │   ├── differentials.ts     # Los 7 diferenciales comerciales
│   │   └── coverage.ts          # Zonas y regiones de cobertura
│   └── types/
│       └── index.ts             # Definición de interfaces TypeScript
├── .env.example                 # Variables de entorno de ejemplo
├── package.json
├── tailwind.config.ts           # Configuración de colores y tokens
└── tsconfig.json
```

---

## 🛠️ Cómo Editar Contenidos sin Tocar Código

Toda la información comercial, teléfonos y catálogos se encuentra desacoplada en la carpeta `src/data/`:

1. **Número de WhatsApp y Correo Oficial:**
   * Editá `src/data/siteConfig.ts` o cargá las variables `NEXT_PUBLIC_WHATSAPP_NUMBER` y `NEXT_PUBLIC_CONTACT_EMAIL` en `.env.local` o en Vercel.
2. **Productos y Soluciones:**
   * Modificá o agregá ítems en `src/data/products.ts`. Los botones de consulta por WhatsApp actualizarán automáticamente el nombre del producto en el mensaje predefinido.
3. **Servicios y Actividades:**
   * Editá las tarjetas en `src/data/services.ts`.
4. **Zonas de Cobertura:**
   * Agregá las provincias o localidades oficiales en `src/data/coverage.ts`.
5. **Reemplazo de Logotipo por archivo definitivo:**
   * Podés colocar tu archivo SVG o PNG en `public/logo-campo-directo.png` y vincularlo en `src/components/ui/Logo.tsx`.

---

## 💻 Ejecución en Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

3. Compilar para producción:
   ```bash
   npm run build
   ```

---

## 🌐 Despliegue en Vercel

El proyecto está preparado para publicación inmediata sin configuración adicional en **Vercel**:

### Opción A: Desde GitHub
1. Subí el proyecto a un repositorio de GitHub.
2. Ingresá a [Vercel](https://vercel.com) y hacé clic en **"Add New Project"**.
3. Seleccioná el repositorio importado.
4. En **Environment Variables**, agregá opcionalmente:
   * `NEXT_PUBLIC_WHATSAPP_NUMBER`: (Ej. `5491112345678`)
   * `NEXT_PUBLIC_CONTACT_EMAIL`: (Ej. `contacto@campodirecto.ar`)
5. Hacé clic en **"Deploy"**. Vercel detectará automáticamente Next.js y compilará la web con CDN global y certificados SSL automáticos.

### Opción B: Mediante Vercel CLI
```bash
npx vercel
```
