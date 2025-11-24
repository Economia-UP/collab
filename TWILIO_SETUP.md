# 🔧 Guía de Configuración de Twilio para WhatsApp

Esta guía te ayudará a configurar Twilio para enviar notificaciones por WhatsApp desde la plataforma.

## 📋 Requisitos Previos

1. Cuenta de Twilio (puedes crear una gratis en [twilio.com](https://www.twilio.com))
2. Número de teléfono verificado en Twilio (puedes usar el número de prueba de Twilio para desarrollo)

---

## 🚀 Pasos para Configurar

### Paso 1: Crear Cuenta en Twilio

1. Ve a [twilio.com](https://www.twilio.com) y crea una cuenta
2. Verifica tu número de teléfono personal (necesario para recibir mensajes de prueba)
3. Completa el proceso de verificación

### Paso 2: Obtener Credenciales de Twilio

1. Una vez en el Dashboard de Twilio, encontrarás:
   - **Account SID**: Se muestra en el dashboard principal
   - **Auth Token**: Haz clic en "Show" para revelarlo (guárdalo de forma segura)

2. Copia estos valores:
   ```
   Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   Auth Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Paso 3: Configurar WhatsApp Sandbox (Para Pruebas)

Para desarrollo y pruebas, puedes usar el WhatsApp Sandbox de Twilio:

1. En el Dashboard de Twilio, ve a **Messaging** → **Try it out** → **Send a WhatsApp message**
2. O ve directamente a: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
3. Sigue las instrucciones para unirte al Sandbox enviando el código que te proporcionen
4. El número de WhatsApp del Sandbox será algo como: `whatsapp:+14155238886`

**Nota:** El Sandbox solo permite enviar mensajes a números verificados. Para producción, necesitarás un número de WhatsApp verificado de Twilio.

### Paso 4: Obtener Número de WhatsApp (Producción)

Para usar WhatsApp en producción:

1. Ve a **Phone Numbers** → **Manage** → **Buy a number** en Twilio Console
2. Busca un número que soporte WhatsApp
3. O solicita un número de WhatsApp Business API (requiere verificación de negocio)

### Paso 5: Agregar Variables de Entorno

Agrega estas variables a tu `.env.local` y a Vercel:

#### Variables Requeridas:

```env
# Twilio Account Credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Twilio WhatsApp Number
# Para desarrollo (Sandbox): whatsapp:+14155238886
# Para producción: whatsapp:+1234567890 (tu número verificado)
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

#### En Vercel:

1. Ve a tu proyecto en Vercel: https://vercel.com/[tu-usuario]/[tu-proyecto]/settings/environment-variables
2. Agrega cada variable:
   - **Name:** `TWILIO_ACCOUNT_SID`
   - **Value:** Tu Account SID
   - **Environments:** ✅ Production ✅ Preview ✅ Development

   - **Name:** `TWILIO_AUTH_TOKEN`
   - **Value:** Tu Auth Token
   - **Environments:** ✅ Production ✅ Preview ✅ Development

   - **Name:** `TWILIO_WHATSAPP_NUMBER`
   - **Value:** `whatsapp:+14155238886` (o tu número de producción)
   - **Environments:** ✅ Production ✅ Preview ✅ Development

3. **Redespliega** tu aplicación después de agregar las variables

---

## ✅ Verificación

### Probar la Configuración

1. Ve a la página de Configuración en tu aplicación
2. Habilita "Notificaciones por WhatsApp"
3. Ingresa tu número de teléfono con código de país (ejemplo: `+521234567890`)
4. Guarda los cambios
5. Realiza una acción que debería enviar una notificación (por ejemplo, solicitar acceso a un proyecto)
6. Deberías recibir un mensaje de WhatsApp

### Verificar Logs

Si no recibes mensajes, revisa los logs:

1. En desarrollo: Revisa la consola del servidor
2. En producción: Ve a Vercel → Tu Proyecto → **Deployments** → **Functions** → **Logs**

Busca mensajes que digan:
- `WhatsApp notification sent to...` ✅ Funcionando
- `WhatsApp notification skipped: Twilio not configured` ❌ Falta configuración
- `Error sending WhatsApp notification` ❌ Error en la configuración

---

## 🔍 Solución de Problemas

### Error: "Twilio not configured"

**Causa:** Las variables de entorno no están configuradas.

**Solución:**
1. Verifica que las variables estén en `.env.local` (desarrollo) o en Vercel (producción)
2. Asegúrate de que los nombres sean exactos: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`
3. Redespliega la aplicación después de agregar las variables

### Error: "Invalid phone number format"

**Causa:** El número de teléfono no está en formato E.164.

**Solución:**
- Asegúrate de incluir el código de país con `+`
- Ejemplo correcto: `+521234567890` (México)
- Ejemplo incorrecto: `1234567890` o `521234567890`

### Error: "WhatsApp number not verified"

**Causa:** Estás usando el Sandbox pero el número de destino no está verificado.

**Solución:**
1. Si usas el Sandbox, envía el código de verificación a `+1 415 523 8886`
2. O usa un número de WhatsApp verificado de Twilio para producción

### Error: "Invalid Twilio credentials"

**Causa:** Las credenciales de Twilio son incorrectas.

**Solución:**
1. Verifica que copiaste correctamente el Account SID y Auth Token
2. Asegúrate de que no haya espacios adicionales
3. Regenera el Auth Token en Twilio Console si es necesario

### No Recibo Mensajes

**Posibles causas:**
1. El número no está verificado en el Sandbox (si usas Sandbox)
2. Las notificaciones de WhatsApp están deshabilitadas en tu perfil
3. El número de teléfono en tu perfil no está en formato correcto
4. Twilio tiene límites de rate limiting (revisa tu cuenta)

**Solución:**
1. Verifica que tu número esté en el formato correcto (`+521234567890`)
2. Revisa los logs para ver si hay errores
3. Verifica tu cuenta de Twilio para ver si hay límites o restricciones

---

## 💰 Costos

### Sandbox (Desarrollo)
- **Gratis** para desarrollo y pruebas
- Limitado a números verificados
- Mensajes de prueba ilimitados

### Producción
- **$0.005 USD por mensaje** (aproximadamente)
- Requiere número de WhatsApp verificado
- Puedes usar el plan gratuito de Twilio para empezar (con créditos iniciales)

---

## 📚 Recursos Adicionales

- [Documentación de Twilio WhatsApp](https://www.twilio.com/docs/whatsapp)
- [Twilio Console](https://console.twilio.com/)
- [Guía de WhatsApp Business API](https://www.twilio.com/docs/whatsapp/tutorial/send-and-receive-media-messages-twilio-api)

---

## 🔒 Seguridad

**IMPORTANTE:** Nunca compartas tus credenciales de Twilio:
- No las subas a GitHub
- No las compartas públicamente
- Usa variables de entorno siempre
- Regenera el Auth Token si crees que se ha comprometido

