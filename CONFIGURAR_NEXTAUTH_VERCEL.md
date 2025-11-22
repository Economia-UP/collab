# 🔐 Configurar NextAuth en Vercel - Guía Paso a Paso

## ✅ NEXTAUTH_SECRET Generado

**Tu NEXTAUTH_SECRET es:**
```
ja7u5ukSijQp1NdKtujh8L9oaNKN00/FFoJjzVz7XPg=
```

**⚠️ IMPORTANTE:** Guarda este valor de forma segura. Lo necesitarás para configurar Vercel.

---

## 📋 Variables de Entorno a Configurar en Vercel

### Variables que DEBES agregar:

| Variable | Valor | Estado |
|----------|-------|--------|
| `NEXTAUTH_URL` | `https://collab-henna.vercel.app` | ⚠️ Pendiente |
| `NEXTAUTH_SECRET` | `ja7u5ukSijQp1NdKtujh8L9oaNKN00/FFoJjzVz7XPg=` | ⚠️ Pendiente |
| `GOOGLE_CLIENT_ID` | `818655287314-oiaqa21hpat35d3unqltb1cvqh192m6t.apps.googleusercontent.com` | ⚠️ Pendiente |
| `GOOGLE_CLIENT_SECRET` | `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` | ⚠️ Pendiente |
| `DATABASE_URL` | `postgres://35aea3369fc3db232909b8ebe7321304fef8dbdcece0fd762b3073ca70db4228:sk_Jvu4aD2WYpfGPeOO6Ov_J@db.prisma.io:5432/postgres?sslmode=require` | ✅ Ya configurada |
| `PRISMA_DATABASE_URL` | `prisma+postgres://accelerate.prisma-data.net/?api_key=...` | ✅ Ya configurada |

---

## 🚀 Pasos para Configurar en Vercel

### Paso 1: Ir a Environment Variables

1. Ve a: https://vercel.com/jadrk040507s-projects/collab/settings/environment-variables
2. O navega: Vercel Dashboard → Tu Proyecto → Settings → Environment Variables

### Paso 2: Agregar NEXTAUTH_URL

1. Haz clic en **"Add New"** o **"Add Variable"**
2. **Name:** `NEXTAUTH_URL`
3. **Value:** `https://collab-henna.vercel.app`
4. **Environment:** Selecciona todas las casillas:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Haz clic en **"Save"**

### Paso 3: Agregar NEXTAUTH_SECRET

1. Haz clic en **"Add New"** o **"Add Variable"**
2. **Name:** `NEXTAUTH_SECRET`
3. **Value:** `ja7u5ukSijQp1NdKtujh8L9oaNKN00/FFoJjzVz7XPg=`
4. **Environment:** Selecciona todas las casillas:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Haz clic en **"Save"**

### Paso 4: Agregar GOOGLE_CLIENT_ID

1. Haz clic en **"Add New"** o **"Add Variable"**
2. **Name:** `GOOGLE_CLIENT_ID`
3. **Value:** `818655287314-oiaqa21hpat35d3unqltb1cvqh192m6t.apps.googleusercontent.com`
4. **Environment:** Selecciona todas las casillas:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Haz clic en **"Save"**

### Paso 5: Agregar GOOGLE_CLIENT_SECRET

1. Haz clic en **"Add New"** o **"Add Variable"**
2. **Name:** `GOOGLE_CLIENT_SECRET`
3. **Value:** `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`
4. **Environment:** Selecciona todas las casillas:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Haz clic en **"Save"**

---

## ✅ Verificar que Todo Está Configurado

Después de agregar todas las variables, deberías ver en la lista:

- ✅ `DATABASE_URL` (ya estaba)
- ✅ `PRISMA_DATABASE_URL` (ya estaba)
- ✅ `NEXTAUTH_URL` (nueva)
- ✅ `NEXTAUTH_SECRET` (nueva)
- ✅ `GOOGLE_CLIENT_ID` (nueva)
- ✅ `GOOGLE_CLIENT_SECRET` (nueva)

---

## 🔄 Redesplegar la Aplicación

Después de agregar las variables:

1. Ve a **Deployments** en tu proyecto de Vercel
2. Haz clic en los **3 puntos** (⋯) del deployment más reciente
3. Selecciona **"Redeploy"**
4. O simplemente haz un pequeño cambio y push a GitHub (Vercel redeplegará automáticamente)

---

## ✅ Verificación Final

1. Ve a tu aplicación: `https://collab-henna.vercel.app`
2. Haz clic en **"Iniciar sesión"**
3. Deberías ver el botón de Google OAuth
4. Al hacer clic, deberías ser redirigido a Google para autenticarte
5. Solo usuarios con correo `@up.edu.mx` podrán iniciar sesión

---

## 🎉 ¡Listo!

Una vez que completes estos pasos, NextAuth estará completamente configurado y funcionando.

---

## 📝 Resumen de Valores

Copia y pega estos valores cuando configures en Vercel:

### NEXTAUTH_URL
```
https://collab-henna.vercel.app
```

### NEXTAUTH_SECRET
```
ja7u5ukSijQp1NdKtujh8L9oaNKN00/FFoJjzVz7XPg=
```

### GOOGLE_CLIENT_ID
```
818655287314-oiaqa21hpat35d3unqltb1cvqh192m6t.apps.googleusercontent.com
```

### GOOGLE_CLIENT_SECRET
```
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
```

