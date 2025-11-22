# 🚀 Guía Rápida de Despliegue - Research Hub UP

## Resumen de Pasos

1. ✅ **Subir código a GitHub**
2. ✅ **Configurar Google OAuth**
3. ✅ **Crear base de datos en Vercel**
4. ✅ **Desplegar en Vercel**
5. ✅ **Configurar variables de entorno**
6. ✅ **Ejecutar migraciones**
7. ✅ **Actualizar Google OAuth con URL de producción**

---

## 📝 Comandos Rápidos

### 1. Inicializar Git y Subir a GitHub

```bash
# Si no tienes git inicializado
git init
git add .
git commit -m "Initial commit"

# Conectar con GitHub (reemplaza con tu repo)
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git branch -M main
git push -u origin main
```

### 2. Generar NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```
**Copia el resultado** - lo necesitarás para Vercel

### 3. Ejecutar Migraciones (después del deploy)

```bash
# Opción 1: Con Vercel CLI
npm install -g vercel
vercel login
vercel link
vercel env pull .env.local
npx prisma migrate deploy

# Opción 2: Manual (agrega DATABASE_URL a .env.local primero)
npx prisma migrate deploy
```

---

## 🔑 Variables de Entorno Necesarias en Vercel

| Variable | Dónde Obtenerla |
|----------|----------------|
| `DATABASE_URL` | Vercel → Storage → Tu BD Postgres → .env.local |
| `NEXTAUTH_URL` | Tu URL de Vercel (ej: `https://tu-app.vercel.app`) |
| `NEXTAUTH_SECRET` | Genera con `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → Credentials |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console → Credentials |
| `GITHUB_TOKEN` | (Opcional) GitHub Settings → Developer settings → Tokens |
| `OVERLEAF_API_KEY` | (Opcional) Overleaf API |

---

## ⚙️ Configuración en Vercel

### Build Command:
```
prisma generate && next build
```

### Install Command:
```
npm install
```

### Output Directory:
```
.next
```

---

## 🔗 URLs Importantes

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Google Cloud Console**: https://console.cloud.google.com/
- **GitHub**: https://github.com

---

## ✅ Checklist de Verificación

Antes de considerar que está listo:

- [ ] Código en GitHub
- [ ] Proyecto creado en Vercel
- [ ] Base de datos Postgres creada
- [ ] Todas las variables de entorno configuradas
- [ ] Primer deploy completado
- [ ] Migraciones ejecutadas
- [ ] Google OAuth configurado con URL de producción
- [ ] Puedes iniciar sesión con @up.edu.mx

---

## 🆘 ¿Problemas?

Consulta `DEPLOY.md` para la guía detallada paso a paso con solución de problemas.

