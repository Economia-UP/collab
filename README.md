# Research Collaboration Hub - Universidad Panamericana

Plataforma de colaboración para proyectos de investigación de la Universidad Panamericana.

## Características

- 🔐 Autenticación con Google OAuth (solo @up.edu.mx)
- 📊 Gestión de proyectos de investigación
- 👥 Sistema de membresías y colaboración
- 📝 Tablero Kanban para tareas
- 💬 Sistema de comentarios
- 🔗 Integración con GitHub
- 📄 Integración con Overleaf
- 📈 Seguimiento de actividad

## Stack Tecnológico

- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript
- **Base de datos**: PostgreSQL (Vercel Postgres)
- **ORM**: Prisma
- **Autenticación**: NextAuth.js
- **Estilos**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Deployment**: Vercel

## Configuración Local

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- PostgreSQL (o cuenta de Vercel Postgres)

### Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd research-collaboration-hub
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
Crea un archivo `.env.local` con:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/research_hub?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-key-aqui"

# Google OAuth
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"

# GitHub API (opcional)
GITHUB_TOKEN="tu-github-token"

# Overleaf API (opcional)
OVERLEAF_API_KEY="tu-overleaf-api-key"
```

4. Configura la base de datos:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Configuración de Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+
4. Crea credenciales OAuth 2.0
5. Agrega `http://localhost:3000/api/auth/callback/google` como URI de redirección
6. Copia el Client ID y Client Secret a tu `.env.local`

## Despliegue en Vercel

### 1. Preparación

1. Crea una cuenta en [Vercel](https://vercel.com)
2. Conecta tu repositorio de GitHub

### 2. Configuración de Base de Datos

1. En el dashboard de Vercel, ve a Storage
2. Crea una nueva base de datos Postgres
3. Copia la `DATABASE_URL` que se genera

### 3. Variables de Entorno

En la configuración del proyecto en Vercel, agrega:

- `DATABASE_URL` - URL de tu base de datos Vercel Postgres
- `NEXTAUTH_URL` - URL de tu aplicación (ej: https://tu-app.vercel.app)
- `NEXTAUTH_SECRET` - Genera con: `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` - Tu Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Tu Google OAuth Client Secret
- `GITHUB_TOKEN` (opcional) - Token de GitHub para mayor límite de API
- `OVERLEAF_API_KEY` (opcional) - API key de Overleaf

### 4. Migración de Base de Datos

Después del primer despliegue, ejecuta las migraciones:

```bash
npx prisma migrate deploy
```

O desde Vercel CLI:
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

### 5. Google OAuth en Producción

Asegúrate de agregar tu URL de producción a las URIs de redirección en Google Cloud Console:
- `https://tu-app.vercel.app/api/auth/callback/google`

## Estructura del Proyecto

```
├── app/                    # App Router de Next.js
│   ├── actions/           # Server Actions
│   ├── api/               # API Routes
│   ├── auth/              # Páginas de autenticación
│   ├── dashboard/         # Dashboard
│   ├── projects/          # Páginas de proyectos
│   └── settings/          # Configuración
├── components/            # Componentes React
│   ├── ui/                # Componentes UI base
│   └── ...                # Componentes específicos
├── lib/                   # Utilidades y configuraciones
├── prisma/                # Schema y migraciones
└── public/                # Archivos estáticos
```

## Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run start` - Servidor de producción
- `npm run lint` - Linter
- `npx prisma studio` - Abre Prisma Studio para ver la BD

## Licencia

Este proyecto es propiedad de la Universidad Panamericana.

