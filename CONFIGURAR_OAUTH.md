# 🔐 Guía: Configurar OAuth en Vercel

## ✅ Tu aplicación ya está desplegada y funcionando

**URL de producción:** `collab-henna.vercel.app` (o `collab-jadrk040507s-projects.vercel.app`)

---

## 📋 Variables de Entorno Necesarias en Vercel

Necesitas agregar estas 6 variables de entorno en Vercel:

### 1. **DATABASE_URL** ✅ (Ya la tienes)
```
postgres://35aea3369fc3db232909b8ebe7321304fef8dbdcece0fd762b3073ca70db4228:sk_Jvu4aD2WYpfGPeOO6Ov_J@db.prisma.io:5432/postgres?sslmode=require
```

### 2. **PRISMA_DATABASE_URL** ✅ (Ya la tienes - Opcional pero recomendada)
```
prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19KdnU0YUQyV1lwZkdQZU9PNk92X0oiLCJhcGlfa2V5IjoiMDFLQU1aNFdHNlYyN1NUUzNDMTdLSzg5VkYiLCJ0ZW5hbnRfaWQiOiIzNWFlYTMzNjlmYzNkYjIzMjkwOWI4ZWJlNzMyMTMwNGZlZjhkYmRjZWNlMGZkNzYyYjMwNzNjYTcwZGI0MjI4IiwiaW50ZXJuYWxfc2VjcmV0IjoiNWVlY2JjNGQtOTUxOS00MzE4LTk0YWUtNmFiN2MwY2EyMzgyIn0.aTn5j7wPlvtHsefkVMUFHIxkmnFggFECBigCb4owp9A
```

### 3. **NEXTAUTH_URL** ⚠️ (NECESITAS AGREGARLA)
```
https://collab-henna.vercel.app
```
O la URL que Vercel te haya asignado.

### 4. **NEXTAUTH_SECRET** ✅ (YA GENERADA)
```
ja7u5ukSijQp1NdKtujh8L9oaNKN00/FFoJjzVz7XPg=
```
**Ya generada y lista para usar.**

### 5. **GOOGLE_CLIENT_ID** ✅ (Ya la tienes)
```
818655287314-oiaqa21hpat35d3unqltb1cvqh192m6t.apps.googleusercontent.com
```

### 6. **GOOGLE_CLIENT_SECRET** ✅ (Ya la tienes)
```
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
```

---

## 🚀 PASOS PARA CONFIGURAR EN VERCEL

### Paso 1: Agregar Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/jadrk040507s-projects/collab
2. Haz clic en **Settings** (Configuración)
3. En el menú lateral, haz clic en **Environment Variables** (Variables de Entorno)
4. Agrega cada variable una por una:

#### Variable 1: NEXTAUTH_URL
- **Name:** `NEXTAUTH_URL`
- **Value:** `https://collab-henna.vercel.app` (o tu URL de Vercel)
- **Environment:** Selecciona todas (Production, Preview, Development)
- Haz clic en **Save**

#### Variable 2: NEXTAUTH_SECRET
- **Name:** `NEXTAUTH_SECRET`
- **Value:** (Pega el valor que generaste con `openssl rand -base64 32`)
- **Environment:** Selecciona todas (Production, Preview, Development)
- Haz clic en **Save**

#### Variable 3: DATABASE_URL
- **Name:** `DATABASE_URL`
- **Value:** `postgres://35aea3369fc3db232909b8ebe7321304fef8dbdcece0fd762b3073ca70db4228:sk_Jvu4aD2WYpfGPeOO6Ov_J@db.prisma.io:5432/postgres?sslmode=require`
- **Environment:** Selecciona todas
- Haz clic en **Save**

#### Variable 4: PRISMA_DATABASE_URL (Opcional pero recomendada)
- **Name:** `PRISMA_DATABASE_URL`
- **Value:** `prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19KdnU0YUQyV1lwZkdQZU9PNk92X0oiLCJhcGlfa2V5IjoiMDFLQU1aNFdHNlYyN1NUUzNDMTdLSzg5VkYiLCJ0ZW5hbnRfaWQiOiIzNWFlYTMzNjlmYzNkYjIzMjkwOWI4ZWJlNzMyMTMwNGZlZjhkYmRjZWNlMGZkNzYyYjMwNzNjYTcwZGI0MjI4IiwiaW50ZXJuYWxfc2VjcmV0IjoiNWVlY2JjNGQtOTUxOS00MzE4LTk0YWUtNmFiN2MwY2EyMzgyIn0.aTn5j7wPlvtHsefkVMUFHIxkmnFggFECBigCb4owp9A`
- **Environment:** Selecciona todas
- Haz clic en **Save**

#### Variable 5: GOOGLE_CLIENT_ID
- **Name:** `GOOGLE_CLIENT_ID`
- **Value:** `818655287314-oiaqa21hpat35d3unqltb1cvqh192m6t.apps.googleusercontent.com`
- **Environment:** Selecciona todas
- Haz clic en **Save**

#### Variable 6: GOOGLE_CLIENT_SECRET
- **Name:** `GOOGLE_CLIENT_SECRET`
- **Value:** `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`
- **Environment:** Selecciona todas
- Haz clic en **Save**

---

## 🔧 Paso 2: Configurar URLs de Callback en Google Cloud Console

**⚠️ MUY IMPORTANTE:** Necesitas agregar las URLs de callback en Google Cloud Console.

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **Credentials**
4. Haz clic en tu OAuth 2.0 Client ID: `818655287314-oiaqa21hpat35d3unqltb1cvqh192m6t.apps.googleusercontent.com`
5. En la sección **Authorized redirect URIs**, agrega estas URLs:

```
https://collab-henna.vercel.app/api/auth/callback/google
https://collab-jadrk040507s-projects.vercel.app/api/auth/callback/google
https://collab-git-main-jadrk040507s-projects.vercel.app/api/auth/callback/google
```

**Si tienes un dominio personalizado, también agrégalo:**
```
https://tu-dominio.com/api/auth/callback/google
```

6. Haz clic en **Save**

---

## 🔄 Paso 3: Redesplegar la Aplicación

Después de agregar las variables de entorno:

1. Ve a tu proyecto en Vercel
2. Haz clic en **Deployments**
3. Haz clic en los **3 puntos** (⋯) del deployment más reciente
4. Selecciona **Redeploy**
5. O simplemente haz un pequeño cambio y push a GitHub (Vercel redeplegará automáticamente)

---

## ✅ Verificación

1. Ve a tu aplicación: `https://collab-henna.vercel.app`
2. Haz clic en **Iniciar sesión**
3. Deberías ver el botón de Google OAuth
4. Al hacer clic, deberías ser redirigido a Google para autenticarte
5. Solo usuarios con correo `@up.edu.mx` podrán iniciar sesión

---

## 🐛 Solución de Problemas

### Error: "Invalid redirect_uri"
- **Causa:** La URL de callback no está en Google Cloud Console
- **Solución:** Agrega todas las URLs de callback en Google Cloud Console (Paso 2)

### Error: "NEXTAUTH_SECRET is missing"
- **Causa:** No agregaste `NEXTAUTH_SECRET` en Vercel
- **Solución:** Agrega la variable `NEXTAUTH_SECRET` en Vercel (Paso 1)

### Error: "Invalid client_id"
- **Causa:** `GOOGLE_CLIENT_ID` o `GOOGLE_CLIENT_SECRET` incorrectos
- **Solución:** Verifica que las variables estén correctas en Vercel

### Error: "Access blocked: This app's request is invalid"
- **Causa:** El correo no es `@up.edu.mx` o la app no está verificada en Google
- **Solución:** Solo correos `@up.edu.mx` pueden acceder (esto es intencional)

---

## 📝 Checklist Final

- [ ] `DATABASE_URL` agregada en Vercel
- [ ] `PRISMA_DATABASE_URL` agregada en Vercel (opcional)
- [ ] `NEXTAUTH_URL` agregada en Vercel (con tu URL de producción)
- [ ] `NEXTAUTH_SECRET` generada y agregada en Vercel
- [ ] `GOOGLE_CLIENT_ID` agregada en Vercel
- [ ] `GOOGLE_CLIENT_SECRET` agregada en Vercel
- [ ] URLs de callback agregadas en Google Cloud Console
- [ ] Aplicación redeplegada en Vercel
- [ ] OAuth funciona correctamente

---

## 🎉 ¡Listo!

Una vez que completes estos pasos, el OAuth debería funcionar perfectamente. Los usuarios con correo `@up.edu.mx` podrán iniciar sesión con Google.

