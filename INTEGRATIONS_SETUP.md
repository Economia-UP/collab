# Guía de Configuración de Integraciones

## ✅ Integraciones Implementadas

### 1. GitHub Integration ✅
- OAuth con GitHub
- Webhooks automáticos para commits, issues y PRs
- Gestión de permisos de repositorio
- Creación de issues desde la plataforma

### 2. Google Drive Integration ✅
- OAuth con Google Drive
- Creación automática de carpetas al crear proyecto
- Compartir carpetas automáticamente al agregar colaboradores
- Revocar acceso al remover colaboradores

### 3. Dropbox Integration ✅
- OAuth con Dropbox
- Creación automática de carpetas al crear proyecto
- Compartir carpetas automáticamente al agregar colaboradores
- Revocar acceso al remover colaboradores

---

## 🔧 Variables de Entorno Necesarias

Agrega estas variables a tu `.env.local` y a Vercel:

### GitHub
```env
GITHUB_CLIENT_ID=tu_client_id
GITHUB_CLIENT_SECRET=tu_client_secret
GITHUB_REDIRECT_URI=https://tu-dominio.vercel.app/api/github/oauth/callback
GITHUB_WEBHOOK_SECRET=tu_webhook_secret_random (opcional)
GITHUB_TOKEN=tu_personal_access_token (opcional)
```

### Google Drive
```env
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_REDIRECT_URI=https://tu-dominio.vercel.app/api/google-drive/oauth/callback
```

### Dropbox
```env
DROPBOX_CLIENT_ID=tu_app_key
DROPBOX_CLIENT_SECRET=tu_app_secret
DROPBOX_REDIRECT_URI=https://tu-dominio.vercel.app/api/dropbox/oauth/callback
```

---

## 📝 Pasos para Configurar

### GitHub OAuth App

1. Ve a [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Haz clic en **"New OAuth App"**
3. Completa:
   - **Application name**: Research Hub UP
   - **Homepage URL**: `https://tu-dominio.vercel.app`
   - **Authorization callback URL**: `https://tu-dominio.vercel.app/api/github/oauth/callback`
4. Haz clic en **"Register application"**
5. Copia el **Client ID** y genera un **Client Secret**

### Google Drive OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google Drive API**
4. Ve a **"Credentials"** → **"Create Credentials"** → **"OAuth client ID"**
5. Tipo de aplicación: **"Web application"**
6. Agrega:
   - **Name**: Research Hub UP
   - **Authorized JavaScript origins**: `https://tu-dominio.vercel.app`
   - **Authorized redirect URIs**: `https://tu-dominio.vercel.app/api/google-drive/oauth/callback`
7. Copia el **Client ID** y **Client Secret**

### Dropbox App

1. Ve a [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Haz clic en **"Create app"**
3. Selecciona:
   - **Choose an API**: Scoped access
   - **Choose the type of access you need**: Full Dropbox
   - **Name your app**: Research Hub UP
4. En **"OAuth 2"**, agrega:
   - **Redirect URI**: `https://tu-dominio.vercel.app/api/dropbox/oauth/callback`
5. Copia el **App key** (Client ID) y **App secret** (Client Secret)

---

## 🚀 Funcionalidades Automáticas

### Al Crear un Proyecto:
- ✅ Si el propietario tiene Google Drive conectado → Se crea carpeta automáticamente
- ✅ Si el propietario tiene Dropbox conectado → Se crea carpeta automáticamente
- ✅ Si hay colaboradores invitados → Se comparten las carpetas automáticamente

### Al Agregar un Colaborador:
- ✅ Si el proyecto tiene carpeta de Google Drive → Se comparte automáticamente
- ✅ Si el proyecto tiene carpeta de Dropbox → Se comparte automáticamente
- ✅ Si el proyecto tiene repositorio de GitHub → Se puede agregar como colaborador (función disponible)

### Al Remover un Colaborador:
- ✅ Se revoca acceso a Google Drive automáticamente
- ✅ Se revoca acceso a Dropbox automáticamente

---

## 📊 Estado de Integraciones

| Integración | OAuth | Carpetas | Compartir | Revocar | Webhooks |
|------------|-------|----------|-----------|---------|----------|
| GitHub | ✅ | N/A | ✅ | ✅ | ✅ |
| Google Drive | ✅ | ✅ | ✅ | ✅ | N/A |
| Dropbox | ✅ | ✅ | ✅ | ✅ | N/A |
| Overleaf | ⏳ | N/A | ⏳ | ⏳ | ⏳ |

---

## 🔐 Seguridad

- Los tokens de acceso se almacenan en la base de datos
- Los tokens de Google Drive se refrescan automáticamente
- Los webhooks de GitHub se validan con firma HMAC-SHA256
- Solo el propietario del proyecto puede gestionar integraciones

---

## 📚 Documentación Adicional

- [GitHub Integration Setup](./GITHUB_INTEGRATION_SETUP.md) - Guía detallada de GitHub
- [Integrations Plan](./INTEGRATIONS_PLAN.md) - Plan completo de integraciones

