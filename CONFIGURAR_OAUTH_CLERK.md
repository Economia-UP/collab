# 🔐 Configurar OAuth en Clerk - Guía Paso a Paso

## 📋 Resumen

Ahora que simplificamos el sistema OAuth, necesitas configurar las conexiones OAuth en el dashboard de Clerk. Esto es mucho más simple que configurar OAuth manualmente.

---

## 🚀 Paso 1: Acceder al Dashboard de Clerk

1. Ve a: **https://dashboard.clerk.com**
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto (o créalo si no tienes uno)

---

## 🔗 Paso 2: Configurar GitHub OAuth

### 2.1 Habilitar GitHub en Clerk

1. En el menú lateral, ve a **"User & Authentication"** → **"Social Connections"**
2. Busca **"GitHub"** en la lista
3. Haz clic en **"Configure"** o el botón de habilitar
4. Si es la primera vez, Clerk te pedirá crear una OAuth App en GitHub

### 2.2 Crear OAuth App en GitHub (si es necesario)

1. Ve a: **https://github.com/settings/developers**
2. Haz clic en **"OAuth Apps"** → **"New OAuth App"**
3. Completa:
   - **Application name**: `Research Hub UP` (o el nombre que prefieras)
   - **Homepage URL**: `https://tu-dominio.vercel.app` (o `http://localhost:3000` para desarrollo)
   - **Authorization callback URL**: 
     - Para desarrollo: `http://localhost:3000/api/auth/callback/github`
     - Para producción: `https://tu-dominio.vercel.app/api/auth/callback/github`
4. Haz clic en **"Register application"**
5. Copia el **Client ID** y **Client Secret**

### 2.3 Agregar Credenciales en Clerk

1. De vuelta en Clerk, en la configuración de GitHub:
2. Activa **"Enable for sign-up and sign-in"**
3. Si Clerk te pide credenciales personalizadas:
   - **Client ID**: Pega el Client ID de GitHub
   - **Client Secret**: Pega el Client Secret de GitHub
4. Guarda los cambios

---

## 📁 Paso 3: Configurar Google Drive OAuth

### 3.1 Habilitar Google en Clerk

1. En **"User & Authentication"** → **"Social Connections"**
2. Busca **"Google"** (esto cubre Google Drive también)
3. Haz clic en **"Configure"**

### 3.2 Usar Credenciales Existentes

Si ya tienes credenciales de Google OAuth:

1. Ve a: **https://console.cloud.google.com/apis/credentials**
2. Selecciona tu proyecto
3. Encuentra tu OAuth 2.0 Client ID
4. Copia el **Client ID** y **Client Secret**

### 3.3 Configurar en Clerk

1. En Clerk, en la configuración de Google:
2. Activa **"Enable for sign-up and sign-in"**
3. Si Clerk te pide credenciales:
   - **Client ID**: Tu Client ID de Google
   - **Client Secret**: Tu Client Secret de Google
4. **Importante**: Agrega estos redirect URIs en Google Cloud Console:
   - `https://[tu-clerk-domain].clerk.accounts.dev/v1/oauth_callback`
   - (Clerk te dará la URL exacta en la configuración)
5. Guarda los cambios

---

## ☁️ Paso 4: Configurar Dropbox OAuth

### 4.1 Crear App en Dropbox

1. Ve a: **https://www.dropbox.com/developers/apps**
2. Haz clic en **"Create app"**
3. Selecciona:
   - **Choose an API**: **Dropbox API**
   - **Choose the type of access you need**: **Full Dropbox**
   - **Name your app**: `Research Hub UP` (o el nombre que prefieras)
4. Haz clic en **"Create app"**

### 4.2 Obtener Credenciales

1. En la página de tu app, ve a la pestaña **"Settings"**
2. En **"OAuth 2"**, encontrarás:
   - **App key** (esto es tu Client ID)
   - **App secret** (esto es tu Client Secret)
3. En **"Redirect URIs"**, agrega:
   - `https://[tu-clerk-domain].clerk.accounts.dev/v1/oauth_callback`
   - (Clerk te dará la URL exacta)

### 4.3 Configurar en Clerk

1. En Clerk, ve a **"User & Authentication"** → **"Social Connections"**
2. Busca **"Dropbox"** (puede que necesites habilitarlo primero)
3. Si Dropbox no aparece, puede que necesites usar **"Custom OAuth"** o contactar a Clerk
4. Si está disponible:
   - Activa **"Enable for sign-up and sign-in"**
   - Agrega el **App key** como Client ID
   - Agrega el **App secret** como Client Secret
5. Guarda los cambios

---

## ⚠️ Nota Importante sobre Dropbox

Dropbox puede no estar disponible directamente en Clerk como conexión social predefinida. En ese caso, tienes dos opciones:

### Opción A: Mantener OAuth Manual (Recomendado para Dropbox)
- Mantener el sistema actual de OAuth manual para Dropbox
- Solo usar Clerk para GitHub y Google

### Opción B: Usar Custom OAuth en Clerk
- Clerk permite agregar proveedores OAuth personalizados
- Necesitarías configurar Dropbox como "Custom OAuth" en Clerk

---

## ✅ Verificación

Después de configurar:

1. Ve a tu aplicación en `/settings`
2. Deberías ver los botones de conexión
3. Al hacer clic, deberías ser redirigido a Clerk para autorizar
4. Después de autorizar, deberías volver a settings con la conexión establecida

---

## 🔑 Variables de Entorno

**IMPORTANTE**: Con Clerk manejando OAuth, **NO necesitas** estas variables:
- ❌ `GITHUB_CLIENT_ID`
- ❌ `GITHUB_CLIENT_SECRET`
- ❌ `GOOGLE_CLIENT_ID`
- ❌ `GOOGLE_CLIENT_SECRET`
- ❌ `DROPBOX_CLIENT_ID` (solo si usas OAuth manual)
- ❌ `DROPBOX_CLIENT_SECRET` (solo si usas OAuth manual)

**Solo necesitas**:
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- ✅ `CLERK_SECRET_KEY`

---

## 📝 Próximos Pasos

1. Configura las conexiones en Clerk siguiendo esta guía
2. Prueba conectando cada servicio desde `/settings`
3. Si algo no funciona, verifica los redirect URIs en cada proveedor

---

## 🆘 Troubleshooting

### "OAuth no configurado"
- Verifica que hayas habilitado la conexión en Clerk
- Verifica que hayas guardado las credenciales correctamente

### "Redirect URI mismatch"
- Verifica que los redirect URIs en el proveedor (GitHub/Google/Dropbox) coincidan con los de Clerk
- Clerk te dará la URL exacta que debes usar

### Dropbox no aparece en Clerk
- Dropbox puede no estar disponible como conexión predefinida
- Considera mantener OAuth manual para Dropbox (como está ahora)

