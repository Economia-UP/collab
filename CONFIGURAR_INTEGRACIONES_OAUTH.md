# 🔧 Configuración Paso a Paso de OAuth Integrations

## 📍 Información del Proyecto

**URL de Producción:** `https://collab-henna.vercel.app`

**URLs de Callback necesarias:**
- Google Drive: `https://collab-henna.vercel.app/api/google-drive/oauth/callback`
- Dropbox: `https://collab-henna.vercel.app/api/dropbox/oauth/callback`
- GitHub: `https://collab-henna.vercel.app/api/github/oauth/callback`

---

## 1️⃣ Google Drive OAuth Setup

### Paso 1: Ir a Google Cloud Console
1. Abre: https://console.cloud.google.com/
2. Selecciona el proyecto existente (o crea uno nuevo llamado "Research Hub UP")

### Paso 2: Habilitar Google Drive API
1. Ve a: https://console.cloud.google.com/apis/library
2. Busca "Google Drive API"
3. Haz clic en "Enable"

### Paso 3: Crear OAuth Credentials
1. Ve a: https://console.cloud.google.com/apis/credentials
2. Haz clic en **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Si es la primera vez, configura la pantalla de consentimiento:
   - **User Type**: External
   - **App name**: Research Hub UP
   - **User support email**: Tu email
   - **Developer contact**: Tu email
   - Haz clic en **"Save and Continue"**
   - En Scopes, haz clic en **"Save and Continue"**
   - En Test users, agrega tu email y haz clic en **"Save and Continue"**
   - Revisa y haz clic en **"Back to Dashboard"**

4. Ahora crea el OAuth Client ID:
   - **Application type**: Web application
   - **Name**: Research Hub UP - Google Drive
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000`
     - `https://collab-henna.vercel.app`
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/google-drive/oauth/callback`
     - `https://collab-henna.vercel.app/api/google-drive/oauth/callback`
   - Haz clic en **"Create"**

5. **¡IMPORTANTE!** Copia estos valores:
   - **Client ID**: `___________________________`
   - **Client Secret**: `___________________________`

### Paso 4: Agregar Variables en Vercel
1. Ve a: https://vercel.com/jadrk040507s-projects/collab/settings/environment-variables
2. Agrega estas variables:

**GOOGLE_CLIENT_ID**
```
Name: GOOGLE_CLIENT_ID
Value: [Pega el Client ID que copiaste]
Environments: ✅ Production ✅ Preview ✅ Development
```

**GOOGLE_CLIENT_SECRET**
```
Name: GOOGLE_CLIENT_SECRET
Value: [Pega el Client Secret que copiaste]
Environments: ✅ Production ✅ Preview ✅ Development
```

**GOOGLE_REDIRECT_URI**
```
Name: GOOGLE_REDIRECT_URI
Value: https://collab-henna.vercel.app/api/google-drive/oauth/callback
Environments: ✅ Production ✅ Preview ✅ Development
```

---

## 2️⃣ Dropbox OAuth Setup

### Paso 1: Ir a Dropbox App Console
1. Abre: https://www.dropbox.com/developers/apps
2. Inicia sesión con tu cuenta de Dropbox

### Paso 2: Crear Nueva App
1. Haz clic en **"Create app"**
2. Selecciona:
   - **Choose an API**: Scoped access
   - **Choose the type of access you need**: Full Dropbox
   - **Name your app**: Research Hub UP
3. Haz clic en **"Create app"**

### Paso 3: Configurar OAuth
1. En la página de tu app, ve a la pestaña **"Settings"**
2. En la sección **"OAuth 2"**, agrega:
   - **Redirect URI**: `https://collab-henna.vercel.app/api/dropbox/oauth/callback`
   - Haz clic en **"Add"**
3. También agrega para desarrollo local:
   - **Redirect URI**: `http://localhost:3000/api/dropbox/oauth/callback`
   - Haz clic en **"Add"**

### Paso 4: Copiar Credenciales
1. En la pestaña **"Settings"**, encontrarás:
   - **App key** (este es el Client ID)
   - **App secret** (este es el Client Secret)
2. **¡IMPORTANTE!** Copia estos valores:
   - **App key**: `___________________________`
   - **App secret**: `___________________________`

### Paso 5: Agregar Variables en Vercel
1. Ve a: https://vercel.com/jadrk040507s-projects/collab/settings/environment-variables
2. Agrega estas variables:

**DROPBOX_CLIENT_ID**
```
Name: DROPBOX_CLIENT_ID
Value: [Pega el App key que copiaste]
Environments: ✅ Production ✅ Preview ✅ Development
```

**DROPBOX_CLIENT_SECRET**
```
Name: DROPBOX_CLIENT_SECRET
Value: [Pega el App secret que copiaste]
Environments: ✅ Production ✅ Preview ✅ Development
```

**DROPBOX_REDIRECT_URI**
```
Name: DROPBOX_REDIRECT_URI
Value: https://collab-henna.vercel.app/api/dropbox/oauth/callback
Environments: ✅ Production ✅ Preview ✅ Development
```

---

## 3️⃣ GitHub OAuth Setup (Si aún no está configurado)

### Paso 1: Ir a GitHub Developer Settings
1. Abre: https://github.com/settings/developers
2. Haz clic en **"OAuth Apps"** → **"New OAuth App"**

### Paso 2: Crear OAuth App
1. Completa:
   - **Application name**: Research Hub UP
   - **Homepage URL**: `https://collab-henna.vercel.app`
   - **Authorization callback URL**: `https://collab-henna.vercel.app/api/github/oauth/callback`
2. Haz clic en **"Register application"**

### Paso 3: Generar Client Secret
1. Haz clic en **"Generate a new client secret"**
2. Copia:
   - **Client ID**: `___________________________`
   - **Client Secret**: `___________________________`

### Paso 4: Agregar Variables en Vercel
1. Ve a: https://vercel.com/jadrk040507s-projects/collab/settings/environment-variables
2. Agrega estas variables:

**GITHUB_CLIENT_ID**
```
Name: GITHUB_CLIENT_ID
Value: [Pega el Client ID]
Environments: ✅ Production ✅ Preview ✅ Development
```

**GITHUB_CLIENT_SECRET**
```
Name: GITHUB_CLIENT_SECRET
Value: [Pega el Client Secret]
Environments: ✅ Production ✅ Preview ✅ Development
```

**GITHUB_REDIRECT_URI**
```
Name: GITHUB_REDIRECT_URI
Value: https://collab-henna.vercel.app/api/github/oauth/callback
Environments: ✅ Production ✅ Preview ✅ Development
```

---

## ✅ Verificación Final

Después de agregar todas las variables:

1. **Redeploy en Vercel**: 
   - Ve a: https://vercel.com/jadrk040507s-projects/collab/deployments
   - Haz clic en el último deployment → **"Redeploy"**

2. **Probar las integraciones**:
   - Ve a: `https://collab-henna.vercel.app/settings`
   - Deberías ver botones para conectar:
     - ✅ GitHub
     - ✅ Google Drive
     - ✅ Dropbox

3. **Probar conexión**:
   - Haz clic en cada botón de conexión
   - Deberías ser redirigido a la página de autorización
   - Después de autorizar, deberías volver a Settings con un mensaje de éxito

---

## 🔍 Troubleshooting

### Error: "redirect_uri_mismatch"
- Verifica que las URLs en Google Cloud Console / Dropbox App Console coincidan EXACTAMENTE con las que pusiste en Vercel
- Asegúrate de incluir `https://` y no tener espacios al final

### Error: "invalid_client"
- Verifica que copiaste correctamente el Client ID y Client Secret
- Asegúrate de que las variables estén en Vercel con los nombres exactos

### Error: "OAuth no configurado"
- Verifica que agregaste todas las variables de entorno en Vercel
- Asegúrate de hacer redeploy después de agregar las variables

---

## 📝 Checklist

- [ ] Google Drive API habilitada en Google Cloud Console
- [ ] OAuth Client creado en Google Cloud Console
- [ ] URLs de callback agregadas en Google Cloud Console
- [ ] Variables GOOGLE_* agregadas en Vercel
- [ ] Dropbox App creada
- [ ] URLs de callback agregadas en Dropbox App Console
- [ ] Variables DROPBOX_* agregadas en Vercel
- [ ] GitHub OAuth App creada (si no estaba)
- [ ] Variables GITHUB_* agregadas en Vercel
- [ ] Redeploy realizado en Vercel
- [ ] Integraciones probadas en producción

---

¡Listo! Una vez que completes estos pasos, las integraciones estarán funcionando. 🎉



