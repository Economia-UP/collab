# ✅ Checklist: Configurar Integraciones OAuth

Usa este checklist para asegurarte de completar todos los pasos.

---

## 🔵 GitHub OAuth

- [ ] Ir a https://github.com/settings/developers
- [ ] Crear nueva OAuth App
- [ ] Configurar callback URL: `https://collab-henna.vercel.app/api/github/oauth/callback`
- [ ] Copiar **Client ID**
- [ ] Copiar **Client Secret**
- [ ] Agregar `GITHUB_CLIENT_ID` en Vercel
- [ ] Agregar `GITHUB_CLIENT_SECRET` en Vercel

---

## 🟢 Google Drive OAuth

- [ ] Ir a https://console.cloud.google.com/
- [ ] Habilitar Google Drive API
- [ ] Crear OAuth Client ID (tipo: Web application)
- [ ] Agregar redirect URI: `https://collab-henna.vercel.app/api/google-drive/oauth/callback`
- [ ] Copiar **Client ID**
- [ ] Copiar **Client Secret**
- [ ] Agregar `GOOGLE_CLIENT_ID` en Vercel (si no existe)
- [ ] Agregar `GOOGLE_CLIENT_SECRET` en Vercel (si no existe)

**Nota:** Si ya tienes estas variables para autenticación de usuarios, puedes usar las mismas.

---

## 🔴 Dropbox OAuth

- [ ] Ir a https://www.dropbox.com/developers/apps
- [ ] Crear nueva app (Scoped access, Full Dropbox)
- [ ] Agregar redirect URI: `https://collab-henna.vercel.app/api/dropbox/oauth/callback`
- [ ] Copiar **App key** (Client ID)
- [ ] Copiar **App secret** (Client Secret)
- [ ] Agregar `DROPBOX_CLIENT_ID` en Vercel
- [ ] Agregar `DROPBOX_CLIENT_SECRET` en Vercel

---

## ⚙️ Vercel - Variables de Entorno

- [ ] Verificar que `NEXTAUTH_URL` esté configurada: `https://collab-henna.vercel.app`
- [ ] Todas las variables tienen ✅ Production, ✅ Preview, ✅ Development
- [ ] Redesplegar la aplicación después de agregar las variables

---

## 🧪 Pruebas

- [ ] Ir a `https://collab-henna.vercel.app/settings`
- [ ] Verificar que aparezcan los botones de conexión
- [ ] Probar conectar GitHub
- [ ] Probar conectar Google Drive
- [ ] Probar conectar Dropbox

---

## 📋 URLs de Callback (para referencia)

```
GitHub:     https://collab-henna.vercel.app/api/github/oauth/callback
Google:     https://collab-henna.vercel.app/api/google-drive/oauth/callback
Dropbox:    https://collab-henna.vercel.app/api/dropbox/oauth/callback
```

---

## 🎯 Orden Recomendado

1. **GitHub** (más simple)
2. **Google Drive** (si ya tienes credenciales, más rápido)
3. **Dropbox** (nuevo, requiere más pasos)

---

**💡 Tip:** Completa una integración a la vez y prueba antes de pasar a la siguiente.

