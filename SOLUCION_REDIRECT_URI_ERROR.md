# 🔧 Solución: Error "redirect_uri is not associated with this application"

## ❌ Problema

Estás recibiendo este error tanto en Dropbox como en GitHub:
- "The redirect_uri is not associated with this application"
- "Invalid redirect_uri"

Esto significa que la URL de callback que tu aplicación está enviando **no coincide exactamente** con las URLs registradas en las configuraciones OAuth de Dropbox y GitHub.

---

## ✅ Solución Paso a Paso

### Paso 1: Verificar la URL de tu Aplicación

Primero, identifica la URL exacta de tu aplicación en producción:

1. Ve a tu proyecto en Vercel: https://vercel.com/jadrk040507s-projects/collab
2. Verifica cuál es tu URL de producción (probablemente `https://collab-henna.vercel.app` o similar)
3. Anota esta URL exacta

---

### Paso 2: Configurar GitHub OAuth

#### 2.1. Ir a GitHub Developer Settings

1. Ve a: https://github.com/settings/developers
2. Haz clic en **"OAuth Apps"** en el menú lateral
3. Encuentra tu aplicación OAuth (o crea una nueva si no existe)

#### 2.2. Verificar/Agregar Authorization Callback URL

En la configuración de tu OAuth App, verifica que tengas **EXACTAMENTE** esta URL en **"Authorization callback URL"**:

```
https://collab-henna.vercel.app/api/github/oauth/callback
```

**⚠️ IMPORTANTE:**
- La URL debe ser **exactamente** igual (case-sensitive)
- Debe incluir `https://` (no `http://`)
- Debe terminar con `/api/github/oauth/callback`
- No debe tener espacios al inicio o final

#### 2.3. Si estás probando en localhost

Si también quieres probar en desarrollo local, agrega esta URL adicional:

```
http://localhost:3000/api/github/oauth/callback
```

**Nota:** GitHub permite múltiples callback URLs, así que puedes tener ambas.

#### 2.4. Guardar Cambios

1. Haz clic en **"Update application"** o **"Save"**
2. Espera unos segundos para que los cambios se propaguen

---

### Paso 3: Configurar Dropbox OAuth

#### 3.1. Ir a Dropbox App Console

1. Ve a: https://www.dropbox.com/developers/apps
2. Inicia sesión con tu cuenta de Dropbox
3. Encuentra tu aplicación (o crea una nueva si no existe)

#### 3.2. Ir a la Pestaña "Settings"

1. Haz clic en tu aplicación
2. Ve a la pestaña **"Settings"**

#### 3.3. Verificar/Agregar Redirect URIs

En la sección **"OAuth 2"**, verifica que tengas **EXACTAMENTE** esta URL en **"Redirect URIs"**:

```
https://collab-henna.vercel.app/api/dropbox/oauth/callback
```

**⚠️ IMPORTANTE:**
- La URL debe ser **exactamente** igual (case-sensitive)
- Debe incluir `https://` (no `http://`)
- Debe terminar con `/api/dropbox/oauth/callback`
- No debe tener espacios al inicio o final

#### 3.4. Si estás probando en localhost

Si también quieres probar en desarrollo local, agrega esta URL adicional:

```
http://localhost:3000/api/dropbox/oauth/callback
```

**Nota:** Dropbox permite múltiples redirect URIs, así que puedes tener ambas.

#### 3.5. Guardar Cambios

1. Haz clic en **"Save"** o **"Update"**
2. Espera unos segundos para que los cambios se propaguen

---

### Paso 4: Verificar Variables de Entorno en Vercel

Asegúrate de que las variables de entorno estén configuradas correctamente:

1. Ve a: https://vercel.com/jadrk040507s-projects/collab/settings/environment-variables

2. Verifica que tengas estas variables:

#### GITHUB_REDIRECT_URI (Opcional pero recomendado)
```
Name: GITHUB_REDIRECT_URI
Value: https://collab-henna.vercel.app/api/github/oauth/callback
Environments: ✅ Production ✅ Preview ✅ Development
```

#### DROPBOX_REDIRECT_URI (Opcional pero recomendado)
```
Name: DROPBOX_REDIRECT_URI
Value: https://collab-henna.vercel.app/api/dropbox/oauth/callback
Environments: ✅ Production ✅ Preview ✅ Development
```

#### NEXTAUTH_URL (Importante)
```
Name: NEXTAUTH_URL
Value: https://collab-henna.vercel.app
Environments: ✅ Production ✅ Preview ✅ Development
```

**Nota:** Si no configuras `GITHUB_REDIRECT_URI` o `DROPBOX_REDIRECT_URI`, el código ahora construirá automáticamente la URL desde la solicitud actual, lo cual debería funcionar correctamente.

---

### Paso 5: Redesplegar la Aplicación

Después de hacer los cambios:

1. Ve a tu proyecto en Vercel
2. Haz clic en **"Deployments"**
3. Encuentra el último deployment
4. Haz clic en los **"..."** (tres puntos) → **"Redeploy"**
5. O simplemente haz un push a tu repositorio para activar un nuevo deploy

---

### Paso 6: Probar la Conexión

1. Ve a tu aplicación: `https://collab-henna.vercel.app/settings`
2. Intenta conectar GitHub
3. Intenta conectar Dropbox
4. Si aún hay errores, revisa los logs en Vercel para ver qué `redirect_uri` se está usando

---

## 🔍 Verificación y Debugging

### Ver los Logs en Vercel

Si el problema persiste, puedes ver qué `redirect_uri` se está usando:

1. Ve a Vercel → Tu Proyecto → **"Deployments"**
2. Haz clic en el último deployment
3. Ve a la pestaña **"Functions"** o **"Logs"**
4. Busca mensajes que digan:
   - `GitHub OAuth - Using redirect_uri: ...`
   - `Dropbox OAuth - Using redirect_uri: ...`

Esto te mostrará exactamente qué URL se está enviando a los proveedores OAuth.

### Verificar la URL Exacta

Si tu URL de Vercel es diferente a `collab-henna.vercel.app`, reemplázala en todos los pasos anteriores con tu URL real.

Para encontrar tu URL:
1. Ve a Vercel → Tu Proyecto
2. La URL aparece en la parte superior, o en **"Domains"**

---

## ✅ Checklist Final

- [ ] URL de callback de GitHub agregada en GitHub Developer Settings
- [ ] URL de callback de Dropbox agregada en Dropbox App Console
- [ ] Variables de entorno configuradas en Vercel (opcional pero recomendado)
- [ ] Aplicación redesplegada en Vercel
- [ ] Probado conectar GitHub - ✅ Funciona
- [ ] Probado conectar Dropbox - ✅ Funciona

---

## 🆘 Si Aún No Funciona

1. **Verifica que la URL sea exacta:** Copia y pega la URL directamente desde Vercel
2. **Espera unos minutos:** A veces los cambios en OAuth tardan en propagarse
3. **Revisa los logs:** Los mensajes de log te dirán qué URL se está usando
4. **Verifica que no haya espacios:** Asegúrate de que no haya espacios al inicio o final de las URLs
5. **Usa HTTPS:** Asegúrate de usar `https://` en producción, no `http://`

---

## 📝 Notas Técnicas

El código ahora construye automáticamente el `redirect_uri` desde la URL de la solicitud actual si no está configurado en las variables de entorno. Esto significa que:

- Si accedes desde `https://collab-henna.vercel.app`, usará esa URL
- Si accedes desde `http://localhost:3000`, usará localhost
- Esto debería funcionar automáticamente, pero es mejor configurar las URLs explícitamente en los proveedores OAuth

