# 🔧 Solución: Error de Configuración de NextAuth

## ❌ Problema

El error `error=Configuration` en NextAuth v5 significa que falta la variable de entorno `AUTH_SECRET`.

## ✅ Solución

En **NextAuth v5**, las variables de entorno cambiaron:
- ❌ `NEXTAUTH_SECRET` (NextAuth v4)
- ✅ `AUTH_SECRET` (NextAuth v5)

## 📋 Variables que DEBES Agregar en Vercel

Ve a: https://vercel.com/jadrk040507s-projects/collab/settings/environment-variables

### 1. **AUTH_SECRET** (OBLIGATORIA - NextAuth v5)

**Nombre:** `AUTH_SECRET`

**Valor:**
```
ja7u5ukSijQp1NdKtujh8L9oaNKN00/FFoJjzVz7XPg=
```

**Environments:** ✅ Production, ✅ Preview, ✅ Development

**⚠️ IMPORTANTE:** Esta es la variable que falta y causa el error.

---

### 2. **NEXTAUTH_SECRET** (Opcional - para compatibilidad)

Si ya tienes `NEXTAUTH_SECRET`, puedes mantenerla, pero **debes agregar `AUTH_SECRET` también**.

**Nombre:** `NEXTAUTH_SECRET`

**Valor:**
```
ja7u5ukSijQp1NdKtujh8L9oaNKN00/FFoJjzVz7XPg=
```

**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

### 3. **AUTH_URL** (Opcional - NextAuth v5 detecta automáticamente)

Si quieres ser explícito, puedes agregar:

**Nombre:** `AUTH_URL`

**Valor:**
```
https://collab-henna.vercel.app
```

**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

### 4. **NEXTAUTH_URL** (Opcional - para compatibilidad)

**Nombre:** `NEXTAUTH_URL`

**Valor:**
```
https://collab-henna.vercel.app
```

**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

### 5. **GOOGLE_CLIENT_ID** (Ya deberías tenerla)

**Nombre:** `GOOGLE_CLIENT_ID`

**Valor:**
```
818655287314-oiaqa21hpat35d3unqltb1cvqh192m6t.apps.googleusercontent.com
```

---

### 6. **GOOGLE_CLIENT_SECRET** (Ya deberías tenerla)

**Nombre:** `GOOGLE_CLIENT_SECRET`

**Valor:**
```
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
```

---

## 🚀 Pasos para Solucionar

1. **Ve a Vercel:** https://vercel.com/jadrk040507s-projects/collab/settings/environment-variables

2. **Agrega `AUTH_SECRET`:**
   - Haz clic en **"Add New"**
   - **Name:** `AUTH_SECRET`
   - **Value:** `ja7u5ukSijQp1NdKtujh8L9oaNKN00/FFoJjzVz7XPg=`
   - **Environments:** Selecciona todas (Production, Preview, Development)
   - Haz clic en **"Save"**

3. **Redesplega la aplicación:**
   - Ve a **Deployments**
   - Haz clic en el deployment más reciente
   - Haz clic en **"Redeploy"**
   - O simplemente espera el auto-deploy del push

4. **Prueba de nuevo:**
   - Intenta iniciar sesión con tu correo @up.edu.mx
   - El error debería desaparecer

---

## 🔍 Verificación

Después de agregar `AUTH_SECRET` y redesplegar, deberías poder:

1. ✅ Iniciar sesión con Google
2. ✅ Ver tu correo @up.edu.mx aceptado
3. ✅ Ser redirigido al dashboard

---

## 📝 Notas

- El código ahora soporta tanto `AUTH_SECRET` (NextAuth v5) como `NEXTAUTH_SECRET` (compatibilidad)
- Se agregó logging mejorado en el callback `signIn` para debug
- Se agregó el scope `openid email profile` explícitamente en Google OAuth

---

## ❓ Si el problema persiste

1. Verifica que `AUTH_SECRET` esté configurada en Vercel
2. Verifica que el deployment se haya completado
3. Revisa los logs de runtime en Vercel para ver mensajes de error
4. Asegúrate de que tu correo termine exactamente con `@up.edu.mx` (sin espacios)

