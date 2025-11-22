# Guía Paso a Paso: Despliegue en Vercel

Esta guía te llevará paso a paso para desplegar la aplicación Research Hub UP en Vercel.

## 📋 Pre-requisitos

- ✅ Cuenta de GitHub (gratis)
- ✅ Cuenta de Vercel (gratis)
- ✅ Cuenta de Google Cloud (para OAuth)
- ✅ El código del proyecto en un repositorio de GitHub

---

## 🚀 PASO 1: Preparar el Repositorio en GitHub

### 1.1 Inicializar Git (si no lo has hecho)

```bash
# En la carpeta del proyecto
git init
git add .
git commit -m "Initial commit: Research Hub UP"
```

### 1.2 Crear Repositorio en GitHub

1. Ve a [GitHub](https://github.com) e inicia sesión
2. Haz clic en el botón **"+"** (arriba derecha) → **"New repository"**
3. Nombre del repositorio: `research-hub-up` (o el que prefieras)
4. Selecciona **"Private"** (recomendado) o **"Public"**
5. **NO** marques "Initialize with README" (ya tenemos uno)
6. Haz clic en **"Create repository"**

### 1.3 Conectar y Subir el Código

```bash
# Reemplaza <tu-usuario> y <nombre-repo> con tus datos
git remote add origin https://github.com/<tu-usuario>/<nombre-repo>.git
git branch -M main
git push -u origin main
```

---

## 🔐 PASO 2: Configurar Google OAuth

### 2.1 Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Si es tu primera vez, acepta los términos
3. Haz clic en el selector de proyectos (arriba) → **"New Project"**
4. Nombre: `Research Hub UP`
5. Haz clic en **"Create"**

### 2.2 Configurar OAuth Consent Screen

1. En el menú lateral, ve a **"APIs & Services"** → **"OAuth consent screen"**
2. Selecciona **"External"** → **"Create"**
3. Completa:
   - **App name**: `Research Hub UP`
   - **User support email**: Tu email
   - **Developer contact**: Tu email
4. Haz clic en **"Save and Continue"**
5. En **Scopes**, haz clic en **"Save and Continue"**
6. En **Test users**, agrega tu email @up.edu.mx → **"Save and Continue"**
7. Revisa y haz clic en **"Back to Dashboard"**

### 2.3 Crear Credenciales OAuth

1. Ve a **"APIs & Services"** → **"Credentials"**
2. Haz clic en **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. **Application type**: `Web application`
4. **Name**: `Research Hub UP Web Client`
5. **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - (Dejaremos espacio para agregar la URL de Vercel después)
6. **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - (Agregaremos la de producción después)
7. Haz clic en **"Create"**
8. **¡IMPORTANTE!** Copia el **Client ID** y **Client Secret** (los necesitarás después)

---

## 🗄️ PASO 3: Crear Base de Datos en Vercel

### 3.1 Crear Cuenta en Vercel

1. Ve a [Vercel](https://vercel.com)
2. Haz clic en **"Sign Up"**
3. Selecciona **"Continue with GitHub"** (recomendado)
4. Autoriza Vercel para acceder a tu GitHub

### 3.2 Crear Base de Datos Postgres

1. En el dashboard de Vercel, haz clic en **"Storage"** (menú lateral)
2. Haz clic en **"Create Database"**
3. Selecciona **"Postgres"**
4. **Name**: `research-hub-db`
5. **Region**: Elige la más cercana (ej: `Washington, D.C., USA`)
6. Haz clic en **"Create"**
7. Espera a que se cree (puede tardar 1-2 minutos)
8. Una vez creada, haz clic en **".env.local"** o **"Settings"** → **"Environment Variables"**
9. **¡IMPORTANTE!** Copia la variable `POSTGRES_URL` o `DATABASE_URL` (la necesitarás después)

---

## 📦 PASO 4: Desplegar la Aplicación en Vercel

### 4.1 Importar Proyecto

1. En el dashboard de Vercel, haz clic en **"Add New..."** → **"Project"**
2. Selecciona tu repositorio `research-hub-up`
3. Haz clic en **"Import"**

### 4.2 Configurar el Proyecto

1. **Framework Preset**: Debería detectar automáticamente "Next.js"
2. **Root Directory**: Dejar en blanco (o `./` si aparece)
3. **Build Command**: `prisma generate && next build`
4. **Output Directory**: `.next` (debería estar automático)
5. **Install Command**: `npm install`

### 4.3 Configurar Variables de Entorno

Antes de hacer deploy, configura estas variables:

1. Haz clic en **"Environment Variables"**
2. Agrega cada una de estas variables:

#### Variables Requeridas:

```
DATABASE_URL
```
- Valor: La URL que copiaste del paso 3.2 (debe empezar con `postgresql://`)

```
NEXTAUTH_URL
```
- Valor: `https://tu-proyecto.vercel.app` (reemplaza con tu URL real, la verás después del primer deploy)

```
NEXTAUTH_SECRET
```
- Genera con este comando en tu terminal:
```bash
openssl rand -base64 32
```
- Copia el resultado y pégalo aquí

```
GOOGLE_CLIENT_ID
```
- Valor: El Client ID que copiaste del paso 2.3

```
GOOGLE_CLIENT_SECRET
```
- Valor: El Client Secret que copiaste del paso 2.3

#### Variables Opcionales:

```
GITHUB_TOKEN
```
- (Opcional) Para mayor límite de API de GitHub
- Crea un token en: https://github.com/settings/tokens
- Permisos: Solo lectura de repos públicos

```
OVERLEAF_API_KEY
```
- (Opcional) Si tienes acceso a la API de Overleaf

3. Para cada variable, selecciona los **Environments**: ✅ Production, ✅ Preview, ✅ Development
4. Haz clic en **"Save"** para cada una

### 4.4 Hacer el Primer Deploy

1. Haz clic en **"Deploy"**
2. Espera a que termine el build (puede tardar 2-5 minutos)
3. Una vez completado, verás tu URL: `https://tu-proyecto.vercel.app`

---

## 🔧 PASO 5: Configurar Base de Datos (Migraciones)

### 5.1 Instalar Vercel CLI (si no lo tienes)

```bash
npm install -g vercel
```

### 5.2 Conectar y Ejecutar Migraciones

```bash
# En la carpeta del proyecto
vercel login
vercel link  # Selecciona tu proyecto cuando te pregunte

# Descargar variables de entorno
vercel env pull .env.local

# Ejecutar migraciones
npx prisma migrate deploy
```

**Alternativa sin CLI:**

Si prefieres no usar la CLI, puedes ejecutar las migraciones desde tu máquina local:

1. Agrega la `DATABASE_URL` de Vercel a tu `.env.local` local
2. Ejecuta:
```bash
npx prisma migrate deploy
```

---

## 🔄 PASO 6: Actualizar Google OAuth con URL de Producción

### 6.1 Agregar URL de Producción

1. Ve de nuevo a [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Haz clic en tu OAuth Client ID
4. En **Authorized JavaScript origins**, agrega:
   - `https://tu-proyecto.vercel.app`
5. En **Authorized redirect URIs**, agrega:
   - `https://tu-proyecto.vercel.app/api/auth/callback/google`
6. Haz clic en **"Save"**

### 6.2 Actualizar NEXTAUTH_URL en Vercel

1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Edita `NEXTAUTH_URL` y asegúrate de que tenga tu URL real de producción
4. Guarda

---

## ✅ PASO 7: Verificar que Todo Funciona

### 7.1 Probar la Aplicación

1. Ve a tu URL: `https://tu-proyecto.vercel.app`
2. Deberías ver la página de inicio
3. Haz clic en **"Iniciar sesión"**
4. Deberías poder iniciar sesión con tu cuenta @up.edu.mx

### 7.2 Verificar Base de Datos

```bash
# Desde tu máquina local (con .env.local configurado)
npx prisma studio
```

Esto abrirá Prisma Studio en `http://localhost:5555` donde podrás ver tus tablas.

---

## 🐛 Solución de Problemas Comunes

### Error: "Invalid DATABASE_URL"

- Verifica que copiaste correctamente la URL de Vercel Postgres
- Asegúrate de que la variable esté en todos los environments (Production, Preview, Development)

### Error: "NEXTAUTH_SECRET is missing"

- Genera un nuevo secret: `openssl rand -base64 32`
- Agrégalo en Vercel → Environment Variables

### Error: "OAuth callback error"

- Verifica que agregaste la URL de producción en Google Cloud Console
- Asegúrate de que `NEXTAUTH_URL` en Vercel sea correcta

### Error: "Prisma Client not generated"

- En Vercel, verifica que el Build Command incluya: `prisma generate && next build`
- O agrega un script en `package.json`:
```json
"postinstall": "prisma generate"
```

### La aplicación no se conecta a la base de datos

- Ejecuta las migraciones: `npx prisma migrate deploy`
- Verifica que la `DATABASE_URL` sea correcta

---

## 📝 Checklist Final

- [ ] Código subido a GitHub
- [ ] Proyecto creado en Google Cloud
- [ ] OAuth Client ID y Secret creados
- [ ] Base de datos Postgres creada en Vercel
- [ ] Proyecto desplegado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Migraciones ejecutadas
- [ ] URLs de producción agregadas en Google OAuth
- [ ] Aplicación funcionando en producción

---

## 🎉 ¡Listo!

Tu aplicación debería estar funcionando en producción. Si encuentras algún problema, revisa la sección de "Solución de Problemas" o los logs en Vercel.

**URL de tu aplicación**: `https://tu-proyecto.vercel.app`

---

## 📞 Próximos Pasos

1. **Dominio personalizado** (opcional): Puedes agregar un dominio personalizado en Vercel → Settings → Domains
2. **Monitoreo**: Vercel incluye analytics básicos
3. **Backups**: Configura backups regulares de tu base de datos en Vercel

