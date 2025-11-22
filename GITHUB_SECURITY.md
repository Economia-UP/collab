# 🔒 Habilitar Secret Scanning en GitHub

## ¿Qué es Secret Scanning?

Secret Scanning es una característica de seguridad de GitHub que escanea automáticamente tu repositorio en busca de secretos (API keys, tokens, contraseñas, etc.) que puedan haber sido expuestos accidentalmente en el código.

## 🚀 Cómo Habilitarlo

### Opción 1: Desde GitHub Web (Recomendado)

1. **Ve a tu repositorio en GitHub**
   - Navega a: `https://github.com/Economia-UP/collab` (o tu repo)

2. **Ve a Settings**
   - Haz clic en la pestaña **"Settings"** (arriba del repositorio)

3. **Ve a Security**
   - En el menú lateral izquierdo, busca y haz clic en **"Code security and analysis"**
   - O ve directamente a: `https://github.com/Economia-UP/collab/settings/security_analysis`

4. **Habilita Secret Scanning**
   - Busca la sección **"Secret scanning"**
   - Haz clic en **"Enable"** o el botón de toggle
   - Si aparece **"Set up"**, haz clic ahí

5. **Confirma**
   - GitHub te pedirá confirmación
   - Haz clic en **"Enable secret scanning"**

### Opción 2: Si es un Repositorio de Organización

Si el repositorio pertenece a una organización:

1. Ve a la **configuración de la organización** (no del repositorio)
2. **Settings** → **Code security and analysis**
3. Habilita **"Secret scanning"** a nivel de organización
4. Esto habilitará el escaneo para todos los repositorios de la organización

---

## ✅ Verificación

Una vez habilitado:

1. GitHub escaneará automáticamente todo el historial del repositorio
2. Si encuentra secretos, te enviará una alerta
3. Puedes ver las alertas en:
   - **Security** → **Secret scanning alerts** (en el repositorio)
   - O en: `https://github.com/Economia-UP/collab/security/secret-scanning`

---

## 🛡️ Qué Hace Secret Scanning

GitHub escanea automáticamente por:

- ✅ API keys de servicios populares (Google, AWS, GitHub, etc.)
- ✅ Tokens de acceso
- ✅ Credenciales de base de datos
- ✅ Claves privadas
- ✅ Y más de 200 tipos de secretos diferentes

---

## ⚠️ Si Encuentra Secretos

Si GitHub encuentra secretos en tu código:

1. **NO entres en pánico** - es común y tiene solución
2. **Revoca inmediatamente** el secreto expuesto:
   - Si es Google OAuth: ve a Google Cloud Console y revoca las credenciales
   - Si es un token de GitHub: ve a GitHub Settings → Developer settings → Tokens y revócalo
   - Si es DATABASE_URL: cambia la contraseña de la base de datos
3. **Elimina el secreto del código**:
   - Si está en un commit antiguo, usa `git rebase` o `git filter-branch`
   - O mejor: **rota el secreto** (cambia a uno nuevo)
4. **Agrega el secreto a `.gitignore`** si no está ya
5. **Usa variables de entorno** en lugar de hardcodear secretos

---

## 📝 Buenas Prácticas

### ✅ HACER:
- Usar variables de entorno (`.env.local`)
- Agregar `.env.local` a `.gitignore`
- Usar secretos de Vercel/GitHub Secrets
- Rotar secretos regularmente

### ❌ NO HACER:
- Hardcodear secretos en el código
- Subir `.env.local` a GitHub
- Compartir secretos en issues o PRs
- Usar secretos de producción en desarrollo

---

## 🔍 Verificar que `.gitignore` Está Correcto

Asegúrate de que tu `.gitignore` incluya:

```
.env
.env.local
.env*.local
*.pem
```

---

## 🎯 Para Este Proyecto

Tus secretos deberían estar **SOLO** en:

1. ✅ **Vercel Environment Variables** (producción)
2. ✅ **`.env.local` local** (desarrollo) - NO subido a GitHub
3. ❌ **NO en el código fuente**
4. ❌ **NO en commits de Git**

---

## 📚 Más Información

- [GitHub Secret Scanning Docs](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)

---

## ✅ Checklist de Seguridad

- [ ] Secret Scanning habilitado en GitHub
- [ ] `.env.local` en `.gitignore`
- [ ] No hay secretos hardcodeados en el código
- [ ] Variables de entorno configuradas en Vercel
- [ ] Secretos rotados si fueron expuestos

¡Tu repositorio estará más seguro! 🔒

