# 🔐 Configurar Clerk - Guía Completa

## ✅ Migración Completada

Hemos migrado de NextAuth a **Clerk** para una autenticación más confiable y fácil de configurar.

---

## 📋 Pasos para Configurar Clerk

### Paso 1: Crear Cuenta en Clerk

1. Ve a [https://clerk.com](https://clerk.com)
2. Crea una cuenta gratuita (tiene plan generoso gratuito)
3. Crea un nuevo proyecto

### Paso 2: Configurar Google OAuth en Clerk

1. En el dashboard de Clerk, ve a **"User & Authentication"** → **"Social Connections"**
2. Habilita **Google**
3. Ingresa tus credenciales de Google OAuth:
   - **Client ID:** `818655287314-oiaqa21hpat35d3unqltb1cvqh192m6t.apps.googleusercontent.com`
   - **Client Secret:** `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`

### Paso 3: Configurar Restricción de Email

1. En Clerk, ve a **"User & Authentication"** → **"Email, Phone, Username"**
2. En **"Allowed email addresses"**, agrega:
   - `*@up.edu.mx` (permite todos los correos @up.edu.mx)

O mejor aún, configura un **"Blocked email addresses"** con:
- `*@gmail.com`
- `*@yahoo.com`
- etc. (bloquea todos excepto @up.edu.mx)

### Paso 4: Obtener Claves de Clerk

1. En Clerk Dashboard, ve a **"API Keys"**
2. Copia estas claves:
   - **Publishable Key** (empieza con `pk_`)
   - **Secret Key** (empieza con `sk_`)

### Paso 5: Configurar Webhook (Opcional pero Recomendado)

1. En Clerk Dashboard, ve a **"Webhooks"**
2. Haz clic en **"Add Endpoint"**
3. URL: `https://tu-dominio.vercel.app/api/webhooks/clerk`
4. Selecciona estos eventos:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copia el **Signing Secret** (empieza con `whsec_`)

---

## 🔑 Variables de Entorno para Vercel

Ve a: https://vercel.com/jadrk040507s-projects/collab/settings/environment-variables

### Variables Requeridas:

#### 1. **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY**

**Nombre:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

**Valor:** Tu Publishable Key de Clerk (empieza con `pk_`)

**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

#### 2. **CLERK_SECRET_KEY**

**Nombre:** `CLERK_SECRET_KEY`

**Valor:** Tu Secret Key de Clerk (empieza con `sk_`)

**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

#### 3. **CLERK_WEBHOOK_SECRET** (Opcional pero Recomendado)

**Nombre:** `CLERK_WEBHOOK_SECRET`

**Valor:** Tu Webhook Signing Secret de Clerk (empieza con `whsec_`)

**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

#### 4. **DATABASE_URL** (Ya la tienes)

**Nombre:** `DATABASE_URL`

**Valor:** `postgres://35aea3369fc3db232909b8ebe7321304fef8dbdcece0fd762b3073ca70db4228:sk_Jvu4aD2WYpfGPeOO6Ov_J@db.prisma.io:5432/postgres?sslmode=require`

---

#### 5. **PRISMA_DATABASE_URL** (Opcional)

**Nombre:** `PRISMA_DATABASE_URL`

**Valor:** Tu URL de Prisma Accelerate (si la usas)

---

## 🗑️ Variables que YA NO NECESITAS (Puedes Eliminarlas)

- ❌ `AUTH_SECRET`
- ❌ `NEXTAUTH_SECRET`
- ❌ `NEXTAUTH_URL`
- ❌ `AUTH_URL`
- ❌ `GOOGLE_CLIENT_ID` (ahora se configura en Clerk)
- ❌ `GOOGLE_CLIENT_SECRET` (ahora se configura en Clerk)

---

## 🚀 Después de Configurar

1. **Redesplega la aplicación** en Vercel
2. **Ejecuta la migración de Prisma:**
   ```bash
   npx prisma migrate deploy
   ```
   (Esto agregará el campo `clerkId` a la tabla User)

3. **Prueba iniciar sesión:**
   - Ve a `/auth/sign-in`
   - Inicia sesión con Google
   - Solo correos @up.edu.mx deberían poder acceder

---

## ✅ Ventajas de Clerk

- ✅ **Más fácil de configurar** - No necesitas manejar secrets manualmente
- ✅ **Mejor UI** - Interfaz de autenticación más moderna
- ✅ **Webhooks automáticos** - Sincroniza usuarios con tu base de datos
- ✅ **Mejor documentación** - Más clara y completa
- ✅ **Plan gratuito generoso** - 10,000 usuarios mensuales gratis

---

## 🔍 Verificación

Después de configurar, deberías poder:

1. ✅ Ver la página de sign-in en `/auth/sign-in`
2. ✅ Iniciar sesión con Google
3. ✅ Solo correos @up.edu.mx pueden acceder
4. ✅ Usuarios se sincronizan automáticamente con Prisma

---

## ❓ Problemas Comunes

### Error: "Clerk: Missing publishableKey"

- **Causa:** No agregaste `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` en Vercel
- **Solución:** Agrega la variable de entorno

### Error: "Unauthorized"

- **Causa:** El correo no es @up.edu.mx
- **Solución:** Verifica que la restricción de email esté configurada en Clerk

### Usuarios no se sincronizan

- **Causa:** Webhook no configurado o `CLERK_WEBHOOK_SECRET` faltante
- **Solución:** Configura el webhook en Clerk y agrega el secret en Vercel

---

## 📝 Notas

- Clerk maneja automáticamente la autenticación con Google
- No necesitas configurar redirect URIs manualmente (Clerk lo hace)
- Los usuarios se crean automáticamente en tu base de datos vía webhook
- El campo `clerkId` en la tabla User conecta Clerk con tu base de datos

