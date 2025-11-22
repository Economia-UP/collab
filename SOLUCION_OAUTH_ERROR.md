# 🔧 Solución: Error 400 redirect_uri_mismatch

## ❌ Problema

El error `Error 400: redirect_uri_mismatch` significa que la URL de callback que NextAuth está usando **no coincide exactamente** con las URLs autorizadas en Google Cloud Console.

## ✅ Solución Paso a Paso

### Paso 1: Verificar URLs Completas en Google Cloud Console

Ve a [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials** → Tu OAuth Client ID.

En **"URIs de redireccionamiento autorizados"**, asegúrate de que TODAS estas URLs estén **completas y exactas**:

```
http://localhost:3000/api/auth/callback/google
https://collab-henna.vercel.app/api/auth/callback/google
https://collab-jadrk040507s-projects.vercel.app/api/auth/callback/google
https://collab-git-main-jadrk040507s-projects.vercel.app/api/auth/callback/google
```

**⚠️ IMPORTANTE:**
- Las URLs deben terminar con `/api/auth/callback/google` (completo)
- No deben tener espacios al inicio o final
- Deben ser exactamente iguales (case-sensitive)
- Si alguna está cortada como `/api/auth/callback/go` o `/api/auth/callback/call`, **bórrala y agrégala completa**

### Paso 2: Verificar NEXTAUTH_URL en Vercel

1. Ve a Vercel: https://vercel.com/jadrk040507s-projects/collab/settings/environment-variables
2. Verifica que `NEXTAUTH_URL` esté configurada como:
   ```
   https://collab-henna.vercel.app
   ```
   O la URL principal que estés usando.

### Paso 3: Modo de Prueba vs Producción

Si tu app está en **"En producción"** pero aún no está verificada:

1. En Google Cloud Console, haz clic en **"Volver al modo de prueba"**
2. Agrega tu correo (`0251520@up.edu.mx`) como **usuario de prueba**
3. Guarda los cambios
4. Intenta iniciar sesión de nuevo

**O si quieres mantenerla en producción:**
- Necesitas verificar la app con Google (proceso más largo)
- O agregar usuarios específicos como usuarios de prueba

### Paso 4: Guardar y Esperar

1. **Guarda** los cambios en Google Cloud Console
2. **Espera 5-10 minutos** (Google puede tardar en aplicar los cambios)
3. Intenta iniciar sesión de nuevo

---

## 🔍 Verificación de URLs

Asegúrate de que en Google Cloud Console tengas **EXACTAMENTE** estas URLs (copia y pega):

```
http://localhost:3000/api/auth/callback/google
https://collab-henna.vercel.app/api/auth/callback/google
https://collab-jadrk040507s-projects.vercel.app/api/auth/callback/google
https://collab-git-main-jadrk040507s-projects.vercel.app/api/auth/callback/google
```

**NO deben estar cortadas como:**
- ❌ `/api/auth/callback/go`
- ❌ `/api/auth/callback/call`
- ❌ Cualquier variación

**DEBEN estar completas:**
- ✅ `/api/auth/callback/google`

---

## 🎯 Solución Rápida

1. **Borra todas las URLs** en Google Cloud Console
2. **Agrega estas 4 URLs completas** (una por una):
   - `http://localhost:3000/api/auth/callback/google`
   - `https://collab-henna.vercel.app/api/auth/callback/google`
   - `https://collab-jadrk040507s-projects.vercel.app/api/auth/callback/google`
   - `https://collab-git-main-jadrk040507s-projects.vercel.app/api/auth/callback/google`
3. **Guarda** los cambios
4. **Espera 5-10 minutos**
5. **Intenta iniciar sesión de nuevo**

---

## 📝 Checklist

- [ ] Todas las URLs en Google Cloud Console están completas (`/api/auth/callback/google`)
- [ ] No hay URLs cortadas o incompletas
- [ ] `NEXTAUTH_URL` está configurada en Vercel
- [ ] Cambios guardados en Google Cloud Console
- [ ] Esperado 5-10 minutos después de guardar
- [ ] App en modo de prueba con tu correo agregado como usuario de prueba

---

## 🆘 Si Sigue Fallando

1. **Verifica la URL exacta** que NextAuth está usando:
   - Abre las herramientas de desarrollador (F12)
   - Ve a la pestaña Network
   - Intenta iniciar sesión
   - Busca la petición a Google
   - Copia la URL exacta del `redirect_uri`
   - Agrégala a Google Cloud Console

2. **Verifica que `NEXTAUTH_URL`** en Vercel coincida con la URL que estás usando

3. **Limpia la caché** del navegador y vuelve a intentar

