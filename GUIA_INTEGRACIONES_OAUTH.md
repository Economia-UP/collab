# 🔐 Guía Completa: Configurar Integraciones OAuth

**URL de tu aplicación:** `https://collab-henna.vercel.app`

Esta guía te ayudará a configurar las tres integraciones OAuth paso a paso.

---

## 📋 Índice

1. [GitHub OAuth](#1-github-oauth)
2. [Google Drive OAuth](#2-google-drive-oauth)
3. [Dropbox OAuth](#3-dropbox-oauth)
4. [Configurar Variables en Vercel](#4-configurar-variables-en-vercel)

---

## 1. GitHub OAuth

### Paso 1: Crear OAuth App en GitHub

1. **Inicia sesión en GitHub** y ve a: https://github.com/settings/developers
2. Haz clic en **"OAuth Apps"** en el menú lateral
3. Haz clic en **"New OAuth App"** (o "Register a new application")

### Paso 2: Configurar la Aplicación

Completa el formulario con estos valores:

- **Application name:** `Research Hub UP` (o el nombre que prefieras)
- **Homepage URL:** `https://collab-henna.vercel.app`
- **Authorization callback URL:** `https://collab-henna.vercel.app/api/github/oauth/callback`

**⚠️ IMPORTANTE:** La callback URL debe ser **exactamente** así, sin espacios ni caracteres extra.

### Paso 3: Guardar y Copiar Credenciales

1. Haz clic en **"Register application"**
2. **NO cierres esta página todavía**
3. Copia estos dos valores:
   - **Client ID** (público, visible en la página)
   - **Client secret** (haz clic en "Generate a new client secret" si no lo tienes)

### Paso 4: Anotar las Credenciales

Guarda estos valores en un lugar seguro (los necesitarás en el paso 4):

```
GITHUB_CLIENT_ID=tu_client_id_aqui
GITHUB_CLIENT_SECRET=tu_client_secret_aqui
```

---

## 2. Google Drive OAuth

### Paso 1: Ir a Google Cloud Console

1. Ve a: https://console.cloud.google.com/
2. Asegúrate de estar en el proyecto correcto (o crea uno nuevo)

### Paso 2: Habilitar Google Drive API

1. En el menú lateral, ve a **"APIs & Services"** → **"Library"**
2. Busca **"Google Drive API"**
3. Haz clic en **"Enable"** (habilitar)

### Paso 3: Crear Credenciales OAuth 2.0

1. Ve a **"APIs & Services"** → **"Credentials"**
2. Haz clic en **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Si es la primera vez, configura el **OAuth consent screen**:
   - **User Type:** External (o Internal si tienes Google Workspace)
   - **App name:** `Research Hub UP`
   - **User support email:** Tu correo
   - **Developer contact:** Tu correo
   - Haz clic en **"Save and Continue"** hasta completar

### Paso 4: Crear OAuth Client ID

1. **Application type:** Web application
2. **Name:** `Research Hub UP - Google Drive`
3. **Authorized JavaScript origins:**
   ```
   https://collab-henna.vercel.app
   http://localhost:3000
   ```
4. **Authorized redirect URIs:**
   ```
   https://collab-henna.vercel.app/api/google-drive/oauth/callback
   http://localhost:3000/api/google-drive/oauth/callback
   ```
5. Haz clic en **"Create"**

### Paso 5: Copiar Credenciales

1. Se mostrará un popup con tus credenciales
2. **Copia estos valores:**
   - **Client ID**
   - **Client secret**

**⚠️ IMPORTANTE:** Si ya tienes un `GOOGLE_CLIENT_ID` configurado (para autenticación de usuarios), puedes usar el mismo o crear uno nuevo específico para Google Drive.

---

## 3. Dropbox OAuth

### Paso 1: Crear App en Dropbox

1. Ve a: https://www.dropbox.com/developers/apps
2. Haz clic en **"Create app"** (o "Create" → "Create app")

### Paso 2: Configurar la App

1. **Choose an API:**
   - Selecciona **"Scoped access"** (recomendado)
   
2. **Choose the type of access you need:**
   - Selecciona **"Full Dropbox"** (para acceso completo a archivos)

3. **Name your app:**
   - **App name:** `Research Hub UP` (o el nombre que prefieras)
   - **App folder name:** Se genera automáticamente

4. Haz clic en **"Create app"**

### Paso 3: Configurar OAuth Redirect

1. En la página de configuración de tu app, ve a la pestaña **"Settings"**
2. Desplázate hasta **"OAuth 2"**
3. En **"Redirect URIs"**, haz clic en **"Add"** y agrega:
   ```
   https://collab-henna.vercel.app/api/dropbox/oauth/callback
   ```
4. También agrega para desarrollo local:
   ```
   http://localhost:3000/api/dropbox/oauth/callback
   ```
5. Haz clic en **"Add"** después de cada URL
6. Haz clic en **"Submit"** para guardar

### Paso 4: Copiar Credenciales

1. En la pestaña **"Settings"**, busca **"App key"** y **"App secret"**
2. **Copia estos valores:**
   - **App key** = `DROPBOX_CLIENT_ID`
   - **App secret** = `DROPBOX_CLIENT_SECRET`

**⚠️ IMPORTANTE:** Guarda estos valores de forma segura.

---

## 4. Configurar Variables en Vercel

Ahora vamos a agregar todas las variables de entorno en Vercel.

### Paso 1: Ir a Vercel

1. Ve a: https://vercel.com/jadrk040507s-projects/collab
2. Haz clic en **"Settings"** (Configuración)
3. En el menú lateral, haz clic en **"Environment Variables"**

### Paso 2: Agregar Variables de GitHub

#### Variable 1: GITHUB_CLIENT_ID
- **Name:** `GITHUB_CLIENT_ID`
- **Value:** (Pega el Client ID que copiaste de GitHub)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Haz clic en **"Save"**

#### Variable 2: GITHUB_CLIENT_SECRET
- **Name:** `GITHUB_CLIENT_SECRET`
- **Value:** (Pega el Client Secret que copiaste de GitHub)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Haz clic en **"Save"**

### Paso 3: Agregar Variables de Google Drive

**Nota:** Si ya tienes `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` configuradas (para autenticación de usuarios), puedes usar las mismas o crear nuevas específicas para Google Drive.

Si quieres usar las mismas, verifica que estén configuradas. Si no, agrega:

#### Variable 3: GOOGLE_CLIENT_ID (si no la tienes)
- **Name:** `GOOGLE_CLIENT_ID`
- **Value:** (Pega el Client ID de Google Cloud Console)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Haz clic en **"Save"**

#### Variable 4: GOOGLE_CLIENT_SECRET (si no la tienes)
- **Name:** `GOOGLE_CLIENT_SECRET`
- **Value:** (Pega el Client Secret de Google Cloud Console)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Haz clic en **"Save"**

### Paso 4: Agregar Variables de Dropbox

#### Variable 5: DROPBOX_CLIENT_ID
- **Name:** `DROPBOX_CLIENT_ID`
- **Value:** (Pega el App key de Dropbox)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Haz clic en **"Save"**

#### Variable 6: DROPBOX_CLIENT_SECRET
- **Name:** `DROPBOX_CLIENT_SECRET`
- **Value:** (Pega el App secret de Dropbox)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Haz clic en **"Save"**

### Paso 5: Verificar NEXTAUTH_URL

Asegúrate de que `NEXTAUTH_URL` esté configurada:
- **Name:** `NEXTAUTH_URL`
- **Value:** `https://collab-henna.vercel.app`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

---

## ✅ Verificación Final

### Paso 1: Redesplegar la Aplicación

Después de agregar todas las variables:

1. Ve a la pestaña **"Deployments"** en Vercel
2. Haz clic en los **"..."** del último deployment
3. Selecciona **"Redeploy"**
4. O simplemente haz un push a tu repositorio para activar un nuevo deploy

### Paso 2: Probar las Integraciones

1. Ve a tu aplicación: `https://collab-henna.vercel.app/settings`
2. Deberías ver los botones de conexión para:
   - ✅ GitHub
   - ✅ Google Drive
   - ✅ Dropbox
3. Haz clic en cada uno para probar la conexión

---

## 🐛 Solución de Problemas

### Error: "redirect_uri_mismatch"

**Solución:** Verifica que las URLs de callback en cada proveedor sean **exactamente iguales** a:
- GitHub: `https://collab-henna.vercel.app/api/github/oauth/callback`
- Google Drive: `https://collab-henna.vercel.app/api/google-drive/oauth/callback`
- Dropbox: `https://collab-henna.vercel.app/api/dropbox/oauth/callback`

### Error: "OAuth no configurado"

**Solución:** Verifica que las variables de entorno estén configuradas en Vercel y que hayas hecho redeploy después de agregarlas.

### Las integraciones no aparecen

**Solución:** 
1. Verifica que las variables de entorno estén en Vercel
2. Haz redeploy de la aplicación
3. Espera unos minutos para que los cambios se propaguen

---

## 📝 Resumen de URLs de Callback

Guarda estas URLs para referencia rápida:

```
GitHub:     https://collab-henna.vercel.app/api/github/oauth/callback
Google:     https://collab-henna.vercel.app/api/google-drive/oauth/callback
Dropbox:    https://collab-henna.vercel.app/api/dropbox/oauth/callback
```

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tus usuarios podrán conectar sus cuentas de GitHub, Google Drive y Dropbox directamente desde la página de configuración, sin necesidad de configuraciones técnicas complejas.

