# 🔧 Configuración de Base de Datos - Prisma Postgres

## 📋 URLs que Obtuviste

Tienes **3 URLs** de Prisma Postgres:

1. **`DATABASE_URL`** - URL directa de PostgreSQL (✅ **USA ESTA**)
2. **`POSTGRES_URL`** - Misma que DATABASE_URL (puedes ignorarla)
3. **`PRISMA_DATABASE_URL`** - Para Prisma Accelerate (opcional, mejora rendimiento)

---

## ✅ Configuración en Vercel

### Variables de Entorno Requeridas:

En Vercel → Tu Proyecto → Settings → Environment Variables, agrega:

#### 1. DATABASE_URL (OBLIGATORIA)
```
DATABASE_URL="postgres://35aea3369fc3db232909b8ebe7321304fef8dbdcece0fd762b3073ca70db4228:sk_Jvu4aD2WYpfGPeOO6Ov_J@db.prisma.io:5432/postgres?sslmode=require"
```
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### 2. PRISMA_DATABASE_URL (OPCIONAL - Recomendada para mejor rendimiento)
```
PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19KdnU0YUQyV1lwZkdQZU9PNk92X0oiLCJhcGlfa2V5IjoiMDFLQU1aNFdHNlYyN1NUUzNDMTdLSzg5VkYiLCJ0ZW5hbnRfaWQiOiIzNWFlYTMzNjlmYzNkYjIzMjkwOWI4ZWJlNzMyMTMwNGZlZjhkYmRjZWNlMGZkNzYyYjMwNzNjYTcwZGI0MjI4IiwiaW50ZXJuYWxfc2VjcmV0IjoiNWVlY2JjNGQtOTUxOS00MzE4LTk0YWUtNmFiN2MwY2EyMzgyIn0.aTn5j7wPlvtHsefkVMUFHIxkmnFggFECBigCb4owp9A"
```
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- **Nota**: Esta URL usa Prisma Accelerate para mejor rendimiento. Si no la agregas, funcionará igual pero más lento.

#### 3. NEXTAUTH_URL
```
NEXTAUTH_URL="https://tu-proyecto.vercel.app"
```
- Actualiza con tu URL real después del primer deploy

#### 4. NEXTAUTH_SECRET
```
NEXTAUTH_SECRET="genera-con-openssl-rand-base64-32"
```
- Genera con: `openssl rand -base64 32`

#### 5. GOOGLE_CLIENT_ID
```
GOOGLE_CLIENT_ID="818655287314-oiaqa21hpat35d3unqltb1cvqh192m6t.apps.googleusercontent.com"
```

#### 6. GOOGLE_CLIENT_SECRET
```
GOOGLE_CLIENT_SECRET="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"
```

---

## 🚀 Próximos Pasos

### 1. Configurar Variables en Vercel

1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Agrega todas las variables de arriba
4. Asegúrate de marcar ✅ Production, ✅ Preview, ✅ Development para cada una

### 2. Hacer el Deploy

1. Ve a **Deployments**
2. Si ya hiciste un deploy, haz clic en **"Redeploy"** (con las nuevas variables)
3. Si es el primero, haz clic en **"Deploy"**

### 3. Ejecutar Migraciones

Después del deploy, ejecuta las migraciones:

```bash
# Opción A: Con Vercel CLI
vercel login
vercel link
vercel env pull .env.local
npx prisma migrate deploy

# Opción B: Manual
# Crea .env.local con DATABASE_URL y ejecuta:
npx prisma migrate deploy
```

### 4. Verificar

1. Ve a tu URL de Vercel
2. Deberías poder iniciar sesión con @up.edu.mx
3. Si funciona, ¡todo está listo! 🎉

---

## 📝 Nota sobre Prisma Accelerate

`PRISMA_DATABASE_URL` es opcional pero recomendada. Usa Prisma Accelerate que:
- ✅ Acelera las consultas
- ✅ Reduce la latencia
- ✅ Mejora el rendimiento general

Si no la agregas, la aplicación funcionará igual usando `DATABASE_URL` directamente.

---

## ⚠️ Seguridad

**IMPORTANTE**: Estas URLs contienen credenciales sensibles. 
- ✅ Están bien guardarlas en Vercel (Environment Variables)
- ❌ NO las subas a GitHub
- ❌ NO las compartas públicamente

El archivo `.gitignore` ya está configurado para ignorar `.env.local`.

