# 🌐 Browser Automation con Playwright

Este proyecto incluye un sistema de automatización de navegador usando **Playwright**, una herramienta gratuita y open-source similar a RunLLM pero completamente gratuita.

## 🚀 Características

- ✅ **Completamente gratuito** - No requiere suscripciones ni APIs pagas
- ✅ **Navegador headless** - Ejecuta Chromium sin interfaz gráfica
- ✅ **API REST** - Endpoints para controlar el navegador desde tu aplicación
- ✅ **Utilidades listas** - Funciones pre-construidas para tareas comunes
- ✅ **TypeScript** - Totalmente tipado para mejor desarrollo

## 📦 Instalación

El navegador ya está instalado. Si necesitas reinstalarlo:

```bash
npm run playwright:install
```

## 🔧 Uso Básico

### 1. Uso Directo en Server Actions

```typescript
import { navigateTo, getPageContent, closePage } from '@/lib/browser';

export async function scrapeWebsite(url: string) {
  const page = await navigateTo(url);
  const content = await getPageContent(page);
  await closePage(page);
  return content;
}
```

### 2. Uso de Utilidades

```typescript
import { extractTexts, extractLinks, fillAndSubmitForm } from '@/lib/browser-utils';

// Extraer textos
const texts = await extractTexts('https://example.com', '.article-title');

// Extraer enlaces
const links = await extractLinks('https://example.com', '.nav-menu');

// Llenar y enviar formulario
const page = await fillAndSubmitForm('https://example.com/login', {
  'input[name="email"]': 'user@example.com',
  'input[name="password"]': 'password123',
}, 'button[type="submit"]');
```

### 3. Uso de la API REST

#### Navegar a una URL
```bash
curl -X POST http://localhost:3000/api/browser \
  -H "Content-Type: application/json" \
  -d '{
    "action": "navigate",
    "url": "https://example.com"
  }'
```

#### Obtener contenido
```bash
curl -X POST http://localhost:3000/api/browser \
  -H "Content-Type: application/json" \
  -d '{
    "action": "content",
    "url": "https://example.com"
  }'
```

#### Tomar screenshot
```bash
curl -X POST http://localhost:3000/api/browser \
  -H "Content-Type: application/json" \
  -d '{
    "action": "screenshot",
    "url": "https://example.com"
  }' \
  --output screenshot.png
```

## 📚 Funciones Disponibles

### `lib/browser.ts` - Funciones Core

- `getBrowser()` - Obtener instancia del navegador
- `getBrowserContext()` - Obtener contexto del navegador
- `createPage()` - Crear una nueva página
- `navigateTo(url, options)` - Navegar a una URL
- `takeScreenshot(page, path?)` - Tomar screenshot
- `getPageContent(page)` - Obtener HTML de la página
- `getPageTitle(page)` - Obtener título de la página
- `waitForElement(page, selector, options?)` - Esperar elemento
- `clickElement(page, selector)` - Hacer clic en elemento
- `typeText(page, selector, text)` - Escribir texto
- `getTextContent(page, selector)` - Obtener texto de elemento
- `evaluateScript(page, script)` - Ejecutar JavaScript
- `closePage(page)` - Cerrar página
- `closeBrowser()` - Cerrar navegador

### `lib/browser-utils.ts` - Utilidades Avanzadas

- `scrapeList(url, selector, extractor)` - Scrapear lista de items
- `extractTexts(url, selector)` - Extraer textos
- `extractLinks(url, baseSelector?)` - Extraer enlaces
- `fillAndSubmitForm(url, formData, submitSelector?)` - Llenar y enviar formulario
- `waitAndExtract(url, selector, extractor, timeout?)` - Esperar y extraer
- `executeScript(url, script)` - Ejecutar script personalizado
- `getMetaTags(url)` - Obtener meta tags
- `elementExists(url, selector)` - Verificar si elemento existe

## 🎯 Ejemplos de Uso

### Ejemplo 1: Scrapear Títulos de Artículos

```typescript
import { extractTexts } from '@/lib/browser-utils';

export async function getArticleTitles(url: string) {
  return await extractTexts(url, 'h2.article-title');
}
```

### Ejemplo 2: Extraer Datos Estructurados

```typescript
import { scrapeList } from '@/lib/browser-utils';

interface Product {
  name: string;
  price: string;
  link: string;
}

export async function scrapeProducts(url: string): Promise<Product[]> {
  return await scrapeList(url, '.product-item', (element) => {
    const nameEl = element.querySelector('.product-name');
    const priceEl = element.querySelector('.product-price');
    const linkEl = element.querySelector('a');
    
    return {
      name: nameEl?.textContent?.trim() || '',
      price: priceEl?.textContent?.trim() || '',
      link: linkEl?.href || '',
    };
  });
}
```

### Ejemplo 3: Automatizar Login

```typescript
import { fillAndSubmitForm, waitForElement, getTextContent } from '@/lib/browser';
import { createPage } from '@/lib/browser';

export async function login(username: string, password: string) {
  const page = await fillAndSubmitForm('https://example.com/login', {
    'input[name="username"]': username,
    'input[name="password"]': password,
  }, 'button[type="submit"]');
  
  // Esperar a que cargue el dashboard
  await waitForElement(page, '.dashboard');
  const welcomeText = await getTextContent(page, '.welcome-message');
  
  return { success: true, message: welcomeText };
}
```

## ⚙️ Configuración

El navegador se configura automáticamente con:
- Modo headless (sin interfaz gráfica)
- Viewport de 1920x1080
- User-Agent moderno
- Timeout de 30 segundos por defecto

Puedes modificar estos valores en `lib/browser.ts`.

## 🔒 Seguridad

- El navegador solo se ejecuta en el servidor (server-side)
- No expone credenciales al cliente
- Timeouts configurados para evitar bloqueos
- Limpieza automática de recursos

## 📝 Notas

- Playwright es completamente gratuito y open-source
- Similar a RunLLM pero sin costos
- Ideal para scraping, testing, y automatización
- Soporta múltiples navegadores (Chromium, Firefox, WebKit)

## 🐛 Troubleshooting

Si encuentras problemas:

1. **Navegador no se instala**: Ejecuta `npm run playwright:install`
2. **Timeouts**: Aumenta el timeout en las opciones
3. **Elementos no encontrados**: Verifica los selectores CSS
4. **Memoria**: Cierra las páginas después de usarlas con `closePage()`

## 📖 Documentación Oficial

- [Playwright Docs](https://playwright.dev/)
- [Playwright API](https://playwright.dev/docs/api/class-playwright)

