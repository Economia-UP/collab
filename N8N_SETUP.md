# 🔧 Guía de Configuración de n8n

n8n es una herramienta de automatización de workflows que permite conectar diferentes servicios y automatizar tareas en la plataforma.

## 📋 Opciones de Instalación

### Opción 1: Docker (Recomendado para Desarrollo)

1. **Instalar Docker Desktop** (si no lo tienes):
   - Windows/Mac: https://www.docker.com/products/docker-desktop
   - Linux: `sudo apt-get install docker.io docker-compose`

2. **Configurar n8n**:
   ```bash
   # En la raíz del proyecto
   docker-compose up -d
   ```

3. **Acceder a n8n**:
   - Abre: http://localhost:5678
   - Usuario: `admin`
   - Contraseña: `changeme` (cambia esto en producción)

### Opción 2: n8n Cloud (Recomendado para Producción)

1. Ve a [n8n.cloud](https://n8n.io/cloud)
2. Crea una cuenta
3. Obtén tu URL de API y API Key
4. Configura las variables de entorno (ver abajo)

### Opción 3: Instalación Manual

```bash
npm install -g n8n
n8n start
```

## 🔧 Configuración en la Aplicación

### Variables de Entorno

Agrega estas variables a tu `.env.local` y a Vercel:

```env
# n8n Configuration
N8N_API_URL=http://localhost:5678  # Para desarrollo local
# N8N_API_URL=https://tu-instancia.n8n.cloud  # Para producción
N8N_API_KEY=opcional-api-key  # Solo si n8n requiere autenticación
```

**En Vercel:**
1. Ve a Settings → Environment Variables
2. Agrega `N8N_API_URL` con tu URL de n8n
3. (Opcional) Agrega `N8N_API_KEY` si tu instancia lo requiere

## 🚀 Workflows Recomendados

### 1. Automatización de Compartir Carpetas

**Webhook:** `member-added`

**Trigger:** Cuando se agrega un miembro a un proyecto

**Acciones:**
- Compartir carpeta de Google Drive automáticamente
- Compartir carpeta de Dropbox automáticamente
- Enviar notificación de bienvenida

**Datos recibidos:**
```json
{
  "projectId": "proj_xxx",
  "projectTitle": "Mi Proyecto",
  "userId": "user_xxx",
  "userEmail": "usuario@up.edu.mx",
  "ownerEmail": "owner@up.edu.mx",
  "googleDriveFolderId": "folder_id",
  "dropboxFolderId": "folder_id"
}
```

### 2. Notificaciones Automáticas

**Webhook:** `task-created`, `comment-added`

**Trigger:** Cuando se crea una tarea o comentario

**Acciones:**
- Enviar email al asignado
- Enviar WhatsApp si está configurado
- Actualizar dashboard

### 3. Sincronización de Calendario

**Webhook:** `meeting-scheduled`

**Trigger:** Cuando se programa una reunión

**Acciones:**
- Crear evento en Google Calendar
- Enviar invitación por email
- Crear link de Zoom/Meet

## 📝 Crear un Workflow en n8n

1. **Accede a n8n** (http://localhost:5678 o tu instancia cloud)

2. **Crea un nuevo workflow:**
   - Click en "New Workflow"
   - Arrastra un nodo "Webhook" al canvas

3. **Configura el Webhook:**
   - Method: POST
   - Path: `member-added` (o el que necesites)
   - Response Mode: "Respond When Last Node Finishes"

4. **Agrega nodos de acción:**
   - HTTP Request (para llamar APIs)
   - Google Drive (para compartir carpetas)
   - Email (para enviar notificaciones)
   - etc.

5. **Activa el workflow:**
   - Toggle "Active" en la esquina superior derecha

## 🔗 Integración con la Aplicación

La aplicación automáticamente llamará a los webhooks de n8n cuando ocurran eventos:

- **Miembro agregado:** `POST /webhook/member-added`
- **Tarea creada:** `POST /webhook/task-created`
- **Comentario agregado:** `POST /webhook/comment-added`

No necesitas configurar nada adicional - solo asegúrate de que n8n esté corriendo y los workflows estén activos.

## 🧪 Probar la Integración

1. **Verifica que n8n esté corriendo:**
   ```bash
   curl http://localhost:5678/healthz
   ```

2. **Crea un workflow de prueba:**
   - Webhook que reciba datos
   - Nodo de "Set" para mostrar los datos recibidos
   - Activa el workflow

3. **Agrega un miembro a un proyecto** en la aplicación
4. **Verifica en n8n** que el webhook fue llamado

## 🔒 Seguridad

- **Cambia la contraseña** de n8n en producción
- **Usa HTTPS** en producción
- **Configura autenticación** si expones n8n públicamente
- **Usa API Keys** para proteger los webhooks

## 📚 Recursos

- [Documentación de n8n](https://docs.n8n.io/)
- [n8n Community](https://community.n8n.io/)
- [n8n Workflows](https://n8n.io/workflows/)

