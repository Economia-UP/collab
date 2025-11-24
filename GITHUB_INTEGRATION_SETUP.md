# Configuración de Integración con GitHub

## ✅ Funcionalidades Implementadas

### 1. OAuth con GitHub
- Autenticación OAuth 2.0
- Almacenamiento seguro de tokens de acceso
- UI en página de configuración para conectar/desconectar

### 2. Webhooks Automáticos
- Configuración automática de webhooks al conectar repositorio
- Sincronización de commits → ActivityLog
- Sincronización de issues (creados/cerrados)
- Sincronización de Pull Requests

### 3. Gestión de Permisos
- Agregar colaboradores a repositorios desde la plataforma
- Remover colaboradores
- Configurar permisos (read, write, admin)

### 4. Creación de Issues
- Crear issues de GitHub desde la plataforma
- Sincronización automática con ActivityLog

## 🔧 Variables de Entorno Necesarias

Agrega estas variables a tu `.env.local` y a Vercel:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=tu_client_id
GITHUB_CLIENT_SECRET=tu_client_secret
GITHUB_REDIRECT_URI=https://tu-dominio.vercel.app/api/github/oauth/callback

# GitHub Webhook Secret (opcional, pero recomendado)
GITHUB_WEBHOOK_SECRET=tu_webhook_secret_random

# GitHub Token (opcional, para operaciones sin OAuth)
GITHUB_TOKEN=tu_personal_access_token
```

## 📝 Pasos para Configurar

### 1. Crear GitHub OAuth App

1. Ve a [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Haz clic en **"New OAuth App"**
3. Completa:
   - **Application name**: Research Hub UP
   - **Homepage URL**: `https://tu-dominio.vercel.app`
   - **Authorization callback URL**: `https://tu-dominio.vercel.app/api/github/oauth/callback`
4. Haz clic en **"Register application"**
5. Copia el **Client ID** y genera un **Client Secret**
6. Agrega estos valores a tus variables de entorno

### 2. Configurar Webhook Secret (Opcional)

Genera un secreto aleatorio para validar webhooks:

```bash
# En terminal
openssl rand -hex 32
```

O usa cualquier generador de strings aleatorios. Agrega el resultado a `GITHUB_WEBHOOK_SECRET`.

### 3. Usar la Integración

1. **Conectar GitHub**:
   - Ve a `/settings`
   - Haz clic en "Conectar GitHub"
   - Autoriza la aplicación

2. **Conectar Repositorio a Proyecto**:
   - Ve a un proyecto
   - En la sección de integraciones, agrega la URL del repositorio
   - El webhook se configurará automáticamente

3. **Gestionar Colaboradores**:
   - Usa las funciones `inviteGitHubCollaborator` y `removeGitHubCollaborator`
   - Se pueden agregar desde la UI del proyecto (próximamente)

## 🔐 Seguridad

- Los tokens de acceso se almacenan encriptados en la base de datos
- Los webhooks se validan con firma HMAC-SHA256
- Solo el propietario del proyecto puede gestionar integraciones

## 📊 Eventos Sincronizados

Los siguientes eventos de GitHub se sincronizan automáticamente con ActivityLog:

- ✅ `push` → `GITHUB_COMMIT`
- ✅ `issues` (opened/closed) → `GITHUB_ISSUE_CREATED` / `GITHUB_ISSUE_CLOSED`
- ✅ `pull_request` → `GITHUB_PULL_REQUEST`

## 🚀 Próximas Mejoras

- [ ] UI para gestionar colaboradores desde la página del proyecto
- [ ] UI para crear issues desde la plataforma
- [ ] Mostrar commits recientes en la vista del proyecto
- [ ] Notificaciones cuando se crean issues o PRs



