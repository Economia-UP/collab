# ✅ Checklist de Despliegue - Research Hub UP

Usa esta lista para asegurarte de que todo esté configurado correctamente.

## 📦 Pre-Despliegue

### Repositorio
- [ ] Código subido a GitHub
- [ ] Repositorio es privado o público (según prefieras)
- [ ] `.gitignore` incluye `.env.local` y `node_modules`

### Google OAuth
- [ ] Proyecto creado en Google Cloud Console
- [ ] OAuth consent screen configurado
- [ ] OAuth Client ID creado
- [ ] Client ID y Client Secret copiados
- [ ] URL de localhost agregada: `http://localhost:3000/api/auth/callback/google`

### Base de Datos
- [ ] Cuenta de Vercel creada
- [ ] Base de datos Postgres creada en Vercel Storage
- [ ] `DATABASE_URL` copiada

### Secretos
- [ ] `NEXTAUTH_SECRET` generado con `openssl rand -base64 32`

---

## 🚀 Despliegue en Vercel

### Configuración del Proyecto
- [ ] Proyecto importado desde GitHub
- [ ] Framework detectado como Next.js
- [ ] Build Command: `prisma generate && next build`
- [ ] Install Command: `npm install`

### Variables de Entorno
- [ ] `DATABASE_URL` configurada (de Vercel Postgres)
- [ ] `NEXTAUTH_URL` configurada (tu URL de Vercel)
- [ ] `NEXTAUTH_SECRET` configurada
- [ ] `GOOGLE_CLIENT_ID` configurada
- [ ] `GOOGLE_CLIENT_SECRET` configurada
- [ ] Todas las variables tienen ✅ Production, ✅ Preview, ✅ Development

### Primer Deploy
- [ ] Deploy iniciado
- [ ] Build completado sin errores
- [ ] URL de producción obtenida

---

## 🗄️ Base de Datos

### Migraciones
- [ ] Vercel CLI instalado (opcional)
- [ ] Variables de entorno descargadas (si usas CLI)
- [ ] Migraciones ejecutadas: `npx prisma migrate deploy`
- [ ] Tablas creadas correctamente (verificar con Prisma Studio)

---

## 🔐 Google OAuth - Producción

### Actualización de URLs
- [ ] URL de producción agregada en Authorized JavaScript origins
- [ ] URL de callback agregada en Authorized redirect URIs
- [ ] Cambios guardados en Google Cloud Console

### Verificación
- [ ] `NEXTAUTH_URL` en Vercel coincide con tu URL real

---

## ✅ Verificación Final

### Funcionalidad
- [ ] Página de inicio carga correctamente
- [ ] Botón de "Iniciar sesión" funciona
- [ ] Redirección a Google OAuth funciona
- [ ] Puedes iniciar sesión con cuenta @up.edu.mx
- [ ] Dashboard se muestra después del login
- [ ] Puedes crear un proyecto
- [ ] Base de datos guarda datos correctamente

### Base de Datos
- [ ] Prisma Studio se conecta: `npx prisma studio`
- [ ] Tablas visibles: User, Project, ProjectMember, Task, Comment, ActivityLog

---

## 🎯 Post-Despliegue (Opcional)

### Mejoras
- [ ] Dominio personalizado configurado (si aplica)
- [ ] Analytics habilitado en Vercel
- [ ] Backups de base de datos configurados
- [ ] Monitoreo configurado

---

## 📝 Notas

- **URL de tu aplicación**: _______________________
- **Fecha de despliegue**: _______________________
- **Problemas encontrados**: _______________________

---

## 🆘 Si Algo Sale Mal

1. Revisa los logs en Vercel → Deployments → Tu deploy → Logs
2. Verifica que todas las variables de entorno estén correctas
3. Asegúrate de que las migraciones se ejecutaron
4. Consulta `DEPLOY.md` para solución de problemas detallada

