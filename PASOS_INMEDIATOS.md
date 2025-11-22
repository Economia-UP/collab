# 🎯 Pasos Inmediatos para Desplegar

## ✅ Lo que Ya Tienes

- ✅ Credenciales de Google OAuth
- ✅ Base de datos Prisma Postgres creada
- ✅ URLs de base de datos

## 🚀 Pasos para Completar el Despliegue

### PASO 1: Subir Código a GitHub (5 min)

Si aún no lo has hecho:

```bash
# En la carpeta del proyecto
git init
git add .
git commit -m "Initial commit: Research Hub UP"

# Crea un repo en GitHub y luego:
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git branch -M main
git push -u origin main
```

---

### PASO 2: Desplegar en Vercel (10 min)

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. **"Add New..."** → **"Project"**
3. Selecciona tu repositorio de GitHub
4. Haz clic en **"Import"**

---

### PASO 3: Configurar Variables de Entorno (5 min)

**ANTES de hacer deploy**, configura estas variables:

1. En la pantalla de configuración, haz clic en **"Environment Variables"**
2. Agrega estas variables (una por una):

#### Variable 1: DATABASE_URL
```
Nombre: DATABASE_URL
Valor: postgres://35aea3369fc3db232909b8ebe7321304fef8dbdcece0fd762b3073ca70db4228:sk_Jvu4aD2WYpfGPeOO6Ov_J@db.prisma.io:5432/postgres?sslmode=require
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Variable 2: PRISMA_DATABASE_URL (Opcional pero recomendada)
```
Nombre: PRISMA_DATABASE_URL
Valor: prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19KdnU0YUQyV1lwZkdQZU9PNk92X0oiLCJhcGlfa2V5IjoiMDFLQU1aNFdHNlYyN1NUUzNDMTdLSzg5VkYiLCJ0ZW5hbnRfaWQiOiIzNWFlYTMzNjlmYzNkYjIzMjkwOWI4ZWJlNzMyMTMwNGZlZjhkYmRjZWNlMGZkNzYyYjMwNzNjYTcwZGI0MjI4IiwiaW50ZXJuYWxfc2VjcmV0IjoiNWVlY2JjNGQtOTUxOS00MzE4LTk0YWUtNmFiN2MwY2EyMzgyIn0.aTn5j7wPlvtHsefkVMUFHIxkmnFggFECBigCb4owp9A
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Variable 3: NEXTAUTH_URL
```
Nombre: NEXTAUTH_URL
Valor: https://tu-proyecto.vercel.app
(Actualizarás esto después del primer deploy con tu URL real)
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Variable 4: NEXTAUTH_SECRET
```
Nombre: NEXTAUTH_SECRET
Valor: (genera con este comando en tu terminal)
Environments: ✅ Production ✅ Preview ✅ Development
```

**Genera el secret:**
```bash
openssl rand -base64 32
```
Copia el resultado y pégalo como valor.

#### Variable 5: GOOGLE_CLIENT_ID
```
Nombre: GOOGLE_CLIENT_ID
Valor: 818655287314-oiaqa21hpat35d3unqltb1cvqh192m6t.apps.googleusercontent.com
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Variable 6: GOOGLE_CLIENT_SECRET
```
Nombre: GOOGLE_CLIENT_SECRET
Valor: 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
Environments: ✅ Production ✅ Preview ✅ Development
```

3. Para cada variable, haz clic en **"Save"**

---

### PASO 4: Configurar Build Settings (2 min)

En la misma pantalla de configuración:

- **Framework Preset**: Next.js (debería estar auto-detectado)
- **Build Command**: `prisma generate && next build`
- **Install Command**: `npm install`
- **Output Directory**: `.next`

---

### PASO 5: Hacer el Deploy (5 min)

1. Haz clic en **"Deploy"**
2. Espera 2-5 minutos
3. Una vez completado, verás tu URL: `https://tu-proyecto-xxxxx.vercel.app`
4. **¡Copia esta URL!** La necesitarás para los siguientes pasos

---

### PASO 6: Actualizar NEXTAUTH_URL (2 min)

1. Ve a **Settings** → **Environment Variables**
2. Edita `NEXTAUTH_URL`
3. Cambia el valor por tu URL real: `https://tu-proyecto-xxxxx.vercel.app`
4. Guarda

---

### PASO 7: Actualizar Google OAuth (3 min)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Haz clic en tu OAuth Client ID
4. En **"Authorized JavaScript origins"**, agrega:
   - `https://tu-proyecto-xxxxx.vercel.app` (tu URL real)
5. En **"Authorized redirect URIs"**, agrega:
   - `https://tu-proyecto-xxxxx.vercel.app/api/auth/callback/google`
6. Haz clic en **"Save"**

---

### PASO 8: Ejecutar Migraciones (5 min)

```bash
# Instalar Vercel CLI (si no lo tienes)
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

**Alternativa sin CLI:**
1. Copia `DATABASE_URL` de Vercel
2. Crea `.env.local` localmente con:
```env
DATABASE_URL="postgres://35aea3369fc3db232909b8ebe7321304fef8dbdcece0fd762b3073ca70db4228:sk_Jvu4aD2WYpfGPeOO6Ov_J@db.prisma.io:5432/postgres?sslmode=require"
```
3. Ejecuta: `npx prisma migrate deploy`

---

### PASO 9: Verificar (2 min)

1. Ve a tu URL: `https://tu-proyecto-xxxxx.vercel.app`
2. Deberías ver la página de inicio
3. Haz clic en **"Iniciar sesión"**
4. Deberías poder iniciar sesión con tu cuenta @up.edu.mx
5. Si funciona, ¡**FELICIDADES!** 🎉

---

## ⏱️ Tiempo Total Estimado: ~40 minutos

---

## 🆘 Si Algo Sale Mal

### Error en el Build
- Revisa los logs en Vercel → Deployments → Tu deploy → Logs
- Verifica que todas las variables estén correctas

### Error de Base de Datos
- Verifica que `DATABASE_URL` sea correcta
- Asegúrate de ejecutar las migraciones: `npx prisma migrate deploy`

### Error de OAuth
- Verifica que agregaste la URL de producción en Google Cloud Console
- Espera 1-2 minutos después de guardar (puede tardar en propagarse)

---

## ✅ Checklist Final

- [ ] Código en GitHub
- [ ] Proyecto desplegado en Vercel
- [ ] Todas las variables de entorno configuradas
- [ ] Migraciones ejecutadas
- [ ] Google OAuth actualizado con URL de producción
- [ ] Puedes iniciar sesión con @up.edu.mx

¡Listo! 🚀

