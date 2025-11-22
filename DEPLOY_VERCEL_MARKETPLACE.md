# 🚀 Guía de Despliegue - Vercel Marketplace (Actualizada)

## 📋 Paso 1: Crear Base de Datos en Vercel

### Opción Recomendada: Prisma Postgres

1. En el dashboard de Vercel, ve a **"Storage"** (menú lateral)
2. Haz clic en **"Browse Storage"** o **"Create Database"**
3. Verás el modal con opciones. Haz clic en **"Marketplace Database Providers"**
4. Selecciona **"Prisma Postgres"** (o **"Neon"** como alternativa)
5. Haz clic en **"Continue"**
6. Sigue las instrucciones para crear la base de datos
7. **¡IMPORTANTE!** Copia la `DATABASE_URL` o `POSTGRES_URL` que se genera

### Alternativas del Marketplace:

- **Prisma Postgres** ⭐ (Recomendado) - "Instant Serverless Postgres"
- **Neon** - "Serverless Postgres" (muy popular)
- **Supabase** - "Postgres backend" (también excelente)

**Todas estas opciones funcionan perfectamente con Prisma.**

---

## 🔐 Paso 2: Configurar Google OAuth

Ya tienes tus credenciales:
- **Client ID**: `818655287314-oiaqa21hpat35d3unqltb1cvqh192m6t.apps.googleusercontent.com`
- **Client Secret**: `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`

### 2.1 Agregar URLs de Redirección en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Haz clic en tu OAuth Client ID
4. En **"Authorized JavaScript origins"**, agrega:
   - `http://localhost:3000`
   - `https://tu-proyecto.vercel.app` (la agregarás después del deploy)
5. En **"Authorized redirect URIs"**, agrega:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://tu-proyecto.vercel.app/api/auth/callback/google` (después del deploy)
6. Haz clic en **"Save"**

---

## 📦 Paso 3: Desplegar en Vercel

### 3.1 Importar Proyecto

1. En Vercel Dashboard → **"Add New..."** → **"Project"**
2. Selecciona tu repositorio de GitHub
3. Haz clic en **"Import"**

### 3.2 Configurar Build

- **Framework Preset**: Next.js (auto-detectado)
- **Build Command**: `prisma generate && next build`
- **Install Command**: `npm install`
- **Output Directory**: `.next`

### 3.3 Configurar Variables de Entorno

Antes de hacer deploy, agrega estas variables:

1. Haz clic en **"Environment Variables"**
2. Agrega cada variable:

#### Variables Requeridas:

```
DATABASE_URL
```
- **Valor**: La URL que copiaste del Paso 1 (debe empezar con `postgresql://` o `postgres://`)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

```
NEXTAUTH_URL
```
- **Valor**: `https://tu-proyecto.vercel.app` (la verás después del primer deploy, puedes actualizarla luego)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

```
NEXTAUTH_SECRET
```
- **Genera con**: `openssl rand -base64 32`
- O usa este comando en tu terminal:
```bash
openssl rand -base64 32
```
- Copia el resultado y pégalo aquí
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

```
GOOGLE_CLIENT_ID
```
- **Valor**: `818655287314-oiaqa21hpat35d3unqltb1cvqh192m6t.apps.googleusercontent.com`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

```
GOOGLE_CLIENT_SECRET
```
- **Valor**: `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`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### Variables Opcionales:

```
GITHUB_TOKEN
```
- (Opcional) Para mayor límite de API de GitHub
- Crea en: https://github.com/settings/tokens
- Solo permisos de lectura

```
OVERLEAF_API_KEY
```
- (Opcional) Si tienes acceso a Overleaf API

### 3.4 Hacer el Deploy

1. Haz clic en **"Deploy"**
2. Espera 2-5 minutos mientras se construye
3. Una vez completado, verás tu URL: `https://tu-proyecto-xxxxx.vercel.app`

---

## 🗄️ Paso 4: Ejecutar Migraciones de Base de Datos

### Opción A: Con Vercel CLI (Recomendado)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Conectar con tu proyecto
vercel link
# Selecciona tu proyecto cuando te pregunte

# Descargar variables de entorno
vercel env pull .env.local

# Ejecutar migraciones
npx prisma migrate deploy
```

### Opción B: Manual

1. Ve a Vercel → Tu Proyecto → Settings → Environment Variables
2. Copia el valor de `DATABASE_URL`
3. Crea un archivo `.env.local` en tu proyecto local:
```env
DATABASE_URL="pega-aqui-la-url-copiada"
```
4. Ejecuta:
```bash
npx prisma migrate deploy
```

---

## 🔄 Paso 5: Actualizar Google OAuth con URL de Producción

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Haz clic en tu OAuth Client ID
4. En **"Authorized JavaScript origins"**, agrega:
   - `https://tu-proyecto-xxxxx.vercel.app` (tu URL real)
5. En **"Authorized redirect URIs"**, agrega:
   - `https://tu-proyecto-xxxxx.vercel.app/api/auth/callback/google`
6. Haz clic en **"Save"**

### Actualizar NEXTAUTH_URL en Vercel

1. Ve a Vercel → Tu Proyecto → Settings → Environment Variables
2. Edita `NEXTAUTH_URL` y pon tu URL real de producción
3. Guarda

---

## ✅ Paso 6: Verificar que Todo Funciona

1. Ve a tu URL: `https://tu-proyecto-xxxxx.vercel.app`
2. Deberías ver la página de inicio
3. Haz clic en **"Iniciar sesión"**
4. Deberías poder iniciar sesión con tu cuenta @up.edu.mx
5. Si funciona, ¡felicidades! 🎉

---

## 🆘 Solución de Problemas

### Error: "Invalid DATABASE_URL"
- Verifica que copiaste correctamente la URL del Marketplace
- Asegúrate de que la variable esté en todos los environments

### Error: "OAuth callback error"
- Verifica que agregaste la URL de producción en Google Cloud Console
- Asegúrate de que `NEXTAUTH_URL` en Vercel sea correcta
- Espera 1-2 minutos después de guardar en Google Cloud (puede tardar en propagarse)

### Error: "Prisma Client not generated"
- El script `postinstall` en `package.json` debería generar automáticamente
- Si no, verifica que el Build Command incluya: `prisma generate && next build`

### La base de datos no tiene tablas
- Ejecuta las migraciones: `npx prisma migrate deploy`
- Verifica que la `DATABASE_URL` sea correcta

---

## 📝 Resumen de URLs y Credenciales

**Google OAuth:**
- Client ID: `818655287314-oiaqa21hpat35d3unqltb1cvqh192m6t.apps.googleusercontent.com`
- Client Secret: `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`

**Base de Datos:**
- Usar: **Prisma Postgres** del Marketplace de Vercel
- URL: (la copiarás después de crear la BD)

**Aplicación:**
- URL: `https://tu-proyecto-xxxxx.vercel.app` (la verás después del deploy)

---

## ✅ Checklist Final

- [ ] Base de datos creada en Vercel Marketplace (Prisma Postgres o Neon)
- [ ] `DATABASE_URL` copiada
- [ ] Proyecto desplegado en Vercel
- [ ] Todas las variables de entorno configuradas
- [ ] `NEXTAUTH_SECRET` generado
- [ ] Migraciones ejecutadas
- [ ] Google OAuth actualizado con URL de producción
- [ ] Puedes iniciar sesión con @up.edu.mx

¡Listo para usar! 🚀

