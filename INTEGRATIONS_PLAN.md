# Plan de Integraciones - Research Hub UP

## Integraciones Propuestas

### 1. GitHub Integration

#### Objetivos:
- Sincronizar commits automáticamente con la sección de actividad
- Gestionar permisos de repositorio desde la plataforma
- Crear y gestionar issues desde la plataforma
- Mostrar estado del repositorio (branches, PRs, etc.)

#### Implementación:
1. **OAuth con GitHub**
   - Usar GitHub OAuth App para autenticación
   - Almacenar `githubAccessToken` en la base de datos (ya existe en schema)
   - Permitir conectar múltiples repositorios por proyecto

2. **GitHub Webhooks**
   - Configurar webhooks en repositorios conectados
   - Endpoint: `/api/webhooks/github`
   - Eventos a escuchar:
     - `push` - Para commits
     - `issues` - Para issues creados/cerrados
     - `pull_request` - Para PRs
     - `repository` - Para cambios en permisos

3. **API Endpoints Necesarios**
   - `POST /api/github/connect` - Conectar repositorio
   - `POST /api/github/disconnect` - Desconectar repositorio
   - `GET /api/github/repos` - Listar repositorios del usuario
   - `POST /api/github/invite` - Invitar colaborador al repo
   - `POST /api/github/remove` - Remover colaborador del repo

4. **Funcionalidades**
   - Sincronizar commits → ActivityLog con tipo `GITHUB_COMMIT`
   - Crear issues desde la plataforma
   - Mostrar commits recientes en la vista del proyecto
   - Gestionar permisos (read, write, admin) desde la plataforma

#### Librerías Necesarias:
- `@octokit/rest` - GitHub REST API client
- `@octokit/webhooks` - Para procesar webhooks

---

### 2. Overleaf Integration

#### Objetivos:
- Sincronizar cambios importantes del documento
- Gestionar permisos de colaboradores
- Mostrar estado del documento (versión, cambios recientes)

#### Implementación:
1. **Overleaf API**
   - Overleaf tiene una API privada (no pública oficialmente)
   - Alternativa: Usar Overleaf ShareLaTeX API v1 (si está disponible)
   - O usar web scraping controlado (con consentimiento)

2. **Webhooks de Overleaf**
   - Overleaf no tiene webhooks oficiales
   - Alternativa: Polling periódico para detectar cambios
   - O usar integración manual donde el usuario notifica cambios

3. **API Endpoints Necesarios**
   - `POST /api/overleaf/connect` - Conectar proyecto Overleaf
   - `POST /api/overleaf/invite` - Invitar colaborador
   - `POST /api/overleaf/remove` - Remover colaborador
   - `GET /api/overleaf/status` - Obtener estado del proyecto

4. **Funcionalidades**
   - Sincronizar cambios importantes → ActivityLog
   - Gestionar permisos de lectura/escritura
   - Mostrar última versión y cambios recientes

#### Limitaciones:
- Overleaf no tiene API pública oficial
- Requiere autenticación con tokens de Overleaf
- Puede requerir integración manual o scraping

---

### 3. Dropbox Integration

#### Objetivos:
- Compartir carpetas de proyecto automáticamente
- Gestionar acceso a archivos cuando se agrega/remueve colaborador
- Sincronizar estructura de carpetas

#### Implementación:
1. **Dropbox OAuth**
   - Usar Dropbox OAuth 2.0
   - Almacenar `dropboxAccessToken` en la base de datos
   - Scope: `files.content.read`, `files.content.write`, `sharing.write`

2. **API Endpoints Necesarios**
   - `POST /api/dropbox/connect` - Conectar cuenta Dropbox
   - `POST /api/dropbox/create-folder` - Crear carpeta del proyecto
   - `POST /api/dropbox/share` - Compartir carpeta con colaborador
   - `POST /api/dropbox/revoke` - Revocar acceso de colaborador
   - `GET /api/dropbox/files` - Listar archivos de la carpeta

3. **Funcionalidades**
   - Crear carpeta automáticamente al crear proyecto
   - Compartir carpeta cuando se agrega colaborador
   - Revocar acceso cuando se remueve colaborador
   - Mostrar enlaces a archivos importantes

#### Librerías Necesarias:
- `dropbox` - Dropbox SDK para Node.js

---

### 4. Google Drive Integration

#### Objetivos:
- Compartir carpetas de proyecto automáticamente
- Gestionar acceso a archivos cuando se agrega/remueve colaborador
- Sincronizar estructura de carpetas

#### Implementación:
1. **Google OAuth**
   - Usar Google OAuth 2.0
   - Almacenar `googleDriveAccessToken` y `googleDriveRefreshToken` en la base de datos
   - Scope: `https://www.googleapis.com/auth/drive`

2. **API Endpoints Necesarios**
   - `POST /api/google-drive/connect` - Conectar cuenta Google Drive
   - `POST /api/google-drive/create-folder` - Crear carpeta del proyecto
   - `POST /api/google-drive/share` - Compartir carpeta con colaborador
   - `POST /api/google-drive/revoke` - Revocar acceso de colaborador
   - `GET /api/google-drive/files` - Listar archivos de la carpeta

3. **Funcionalidades**
   - Crear carpeta automáticamente al crear proyecto
   - Compartir carpeta cuando se agrega colaborador (por email)
   - Revocar acceso cuando se remueve colaborador
   - Mostrar enlaces a archivos importantes

#### Librerías Necesarias:
- `googleapis` - Google APIs client library

---

## Priorización

### Fase 1 (Alta Prioridad):
1. ✅ **GitHub Integration** - Más útil para proyectos de código
   - Webhooks para commits
   - Gestión de permisos
   - Issues desde la plataforma

### Fase 2 (Media Prioridad):
2. **Google Drive Integration** - Más común que Dropbox
   - Compartir carpetas automáticamente
   - Gestión de permisos

### Fase 3 (Baja Prioridad):
3. **Dropbox Integration** - Similar a Google Drive
4. **Overleaf Integration** - Limitado por falta de API oficial

---

## Schema Updates Necesarios

```prisma
model Project {
  // ... campos existentes
  dropboxFolderId      String?
  dropboxFolderUrl     String?
  googleDriveFolderId  String?
  googleDriveFolderUrl String?
  githubRepoId         String? // ID del repo en GitHub
  githubWebhookId      String? // ID del webhook configurado
}

model User {
  // ... campos existentes
  dropboxAccessToken       String?
  dropboxRefreshToken      String?
  googleDriveAccessToken   String?
  googleDriveRefreshToken  String?
  // githubAccessToken ya existe
}
```

---

## Consideraciones de Seguridad

1. **Tokens de Acceso**
   - Almacenar tokens encriptados
   - Usar refresh tokens cuando sea posible
   - Implementar rotación de tokens

2. **Permisos**
   - Solo el propietario del proyecto puede gestionar integraciones
   - Validar permisos antes de compartir recursos externos

3. **Webhooks**
   - Validar firmas de webhooks (GitHub, etc.)
   - Rate limiting en endpoints de webhooks

---

## Próximos Pasos

1. Investigar APIs oficiales de cada servicio
2. Crear OAuth apps en cada plataforma
3. Implementar autenticación OAuth
4. Crear endpoints de API
5. Implementar webhooks donde sea posible
6. Agregar UI para gestionar integraciones
7. Testing exhaustivo

