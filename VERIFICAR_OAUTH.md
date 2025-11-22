# 🔍 Guía de Verificación de OAuth - Google Cloud Console

## 📋 URLs que DEBEN estar configuradas

### Authorized JavaScript origins
Estas URLs deben estar en la sección **"Authorized JavaScript origins"**:

```
http://localhost:3000
https://collab-henna.vercel.app
https://collab-jadrk040507s-projects.vercel.app
```

### Authorized redirect URIs
Estas URLs deben estar en la sección **"Authorized redirect URIs"** (MUY IMPORTANTE):

```
http://localhost:3000/api/auth/callback/google
https://collab-henna.vercel.app/api/auth/callback/google
https://collab-jadrk040507s-projects.vercel.app/api/auth/callback/google
https://collab-git-main-jadrk040507s-projects.vercel.app/api/auth/callback/google
```

---

## 🔍 Cómo Verificar la Configuración

### Paso 1: Acceder a Google Cloud Console

1. Ve a: https://console.cloud.google.com/
2. Inicia sesión con tu cuenta de Google
3. Selecciona el proyecto correcto (el que tiene el OAuth Client ID: `818655287314-oiaqa21hpat35d3unqltb1cvqh192m6t`)

### Paso 2: Ir a Credenciales

1. En el menú lateral, ve a **"APIs & Services"** → **"Credentials"**
2. Busca tu OAuth 2.0 Client ID: `818655287314-oiaqa21hpat35d3unqltb1cvqh192m6t.apps.googleusercontent.com`
3. Haz clic en el nombre del Client ID para editarlo

### Paso 3: Verificar "Authorized JavaScript origins"

En la sección **"Authorized JavaScript origins"**, verifica que tengas:

- ✅ `http://localhost:3000`
- ✅ `https://collab-henna.vercel.app`
- ✅ `https://collab-jadrk040507s-projects.vercel.app`

**Si falta alguna, agrégala y haz clic en "Save"**

### Paso 4: Verificar "Authorized redirect URIs" ⚠️ CRÍTICO

En la sección **"Authorized redirect URIs"**, verifica que tengas **EXACTAMENTE** estas URLs:

- ✅ `http://localhost:3000/api/auth/callback/google`
- ✅ `https://collab-henna.vercel.app/api/auth/callback/google`
- ✅ `https://collab-jadrk040507s-projects.vercel.app/api/auth/callback/google`
- ✅ `https://collab-git-main-jadrk040507s-projects.vercel.app/api/auth/callback/google`

**⚠️ IMPORTANTE:**
- Las URLs deben terminar con `/api/auth/callback/google` (completo)
- No deben estar cortadas como `/api/auth/callback/go` o `/api/auth/callback/call`
- Deben ser exactamente iguales (case-sensitive)
- No deben tener espacios al inicio o final

**Si alguna está incompleta o cortada:**
1. Bórrala
2. Agrégala completa de nuevo
3. Haz clic en "Save"

### Paso 5: Verificar OAuth Consent Screen

1. Ve a **"APIs & Services"** → **"OAuth consent screen"**
2. Verifica que esté en **"Testing"** o **"In production"**
3. Si está en **"Testing"**, asegúrate de que tu correo (`0251520@up.edu.mx`) esté en la lista de **"Test users"**

---

## ✅ Checklist de Verificación

### En Google Cloud Console:
- [ ] OAuth Client ID correcto: `818655287314-oiaqa21hpat35d3unqltb1cvqh192m6t.apps.googleusercontent.com`
- [ ] **Authorized JavaScript origins** tiene las 3 URLs correctas
- [ ] **Authorized redirect URIs** tiene las 4 URLs completas (terminan en `/api/auth/callback/google`)
- [ ] No hay URLs cortadas o incompletas
- [ ] OAuth consent screen configurado (Testing o Production)
- [ ] Si está en Testing, tu correo está en Test users
- [ ] Cambios guardados (clic en "Save")

### En Vercel (Environment Variables):
- [ ] `NEXTAUTH_URL` = `https://collab-henna.vercel.app`
- [ ] `NEXTAUTH_SECRET` está configurada
- [ ] `GOOGLE_CLIENT_ID` = `818655287314-oiaqa21hpat35d3unqltb1cvqh192m6t.apps.googleusercontent.com`
- [ ] `GOOGLE_CLIENT_SECRET` = `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`
- [ ] Todas las variables están en Production, Preview y Development

---

## 🐛 Problemas Comunes

### Error: "redirect_uri_mismatch"
**Causa:** La URL de callback no está en Google Cloud Console o está incompleta.

**Solución:**
1. Verifica que todas las URLs estén completas en "Authorized redirect URIs"
2. Asegúrate de que terminen con `/api/auth/callback/google`
3. Guarda los cambios y espera 5-10 minutos

### Error: "Access blocked: This app's request is invalid"
**Causa:** La app está en modo Testing y tu correo no está en Test users.

**Solución:**
1. Ve a "OAuth consent screen"
2. Agrega tu correo (`0251520@up.edu.mx`) en "Test users"
3. Guarda los cambios

### Error: "Invalid client_id"
**Causa:** `GOOGLE_CLIENT_ID` o `GOOGLE_CLIENT_SECRET` incorrectos en Vercel.

**Solución:**
1. Verifica las variables de entorno en Vercel
2. Asegúrate de que coincidan con las de Google Cloud Console

---

## 📸 Captura de Pantalla Recomendada

Si quieres que te ayude a verificar, puedes tomar una captura de pantalla de:
1. La sección "Authorized redirect URIs" en Google Cloud Console
2. Las variables de entorno en Vercel (Settings → Environment Variables)

---

## 🎯 URLs Exactas a Copiar y Pegar

Copia y pega estas URLs exactamente como están (sin espacios):

### Authorized JavaScript origins:
```
http://localhost:3000
https://collab-henna.vercel.app
https://collab-jadrk040507s-projects.vercel.app
```

### Authorized redirect URIs:
```
http://localhost:3000/api/auth/callback/google
https://collab-henna.vercel.app/api/auth/callback/google
https://collab-jadrk040507s-projects.vercel.app/api/auth/callback/google
https://collab-git-main-jadrk040507s-projects.vercel.app/api/auth/callback/google
```

---

## ✅ Después de Verificar

1. Guarda todos los cambios en Google Cloud Console
2. Espera 5-10 minutos (Google puede tardar en aplicar los cambios)
3. Prueba iniciar sesión en tu aplicación
4. Si funciona, ¡todo está correcto! 🎉

