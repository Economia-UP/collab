# Sistema OAuth Simplificado (Tipo SSO)

## Resumen

Se ha implementado un sistema de conexión OAuth más fluido y fácil de usar, similar a un SSO (Single Sign-On). Ahora los usuarios pueden conectar sus cuentas de forma más intuitiva, sin necesidad de navegar manualmente a la página de configuración.

## Características Principales

### 1. **Popup Window en lugar de Redirección**
- Las conexiones OAuth ahora se abren en una ventana emergente (popup)
- El usuario permanece en la página actual mientras se autentica
- La ventana se cierra automáticamente después de la conexión exitosa
- Experiencia más fluida y moderna

### 2. **Detección Automática de Conexiones Faltantes**
- Cuando un usuario intenta realizar una acción que requiere OAuth (ej: crear carpeta de Dropbox)
- El sistema detecta automáticamente si falta la conexión
- Muestra un diálogo contextual explicando qué se necesita y por qué
- Permite conectar directamente desde el diálogo

### 3. **Conexión Contextual**
- Los diálogos aparecen en el contexto donde se necesita la conexión
- Mensajes claros explicando para qué se necesita la conexión
- Ejemplo: "Necesitas conectar tu cuenta de Dropbox para crear una carpeta de Dropbox para este proyecto"

## Componentes Creados

### Hooks

#### `useOAuthPopup`
Hook para manejar conexiones OAuth con popup window.

```typescript
const { connect, isConnecting } = useOAuthPopup("github", {
  onSuccess: () => {
    // Callback cuando la conexión es exitosa
  },
  onError: (error) => {
    // Callback cuando hay un error
  },
});
```

#### `useOAuthRequired`
Hook que envuelve acciones y detecta automáticamente cuando falta OAuth.

```typescript
const { executeWithAuth, Dialog } = useOAuthRequired({
  provider: "dropbox",
  context: "para crear una carpeta de Dropbox",
  onConnected: () => {
    // Callback después de conectar
  },
});

// Usar executeWithAuth para ejecutar acciones
await executeWithAuth(async () => {
  await createProjectDropboxFolder(projectId);
});
```

### Componentes

#### `OAuthConnectionDialog`
Diálogo que aparece cuando se necesita una conexión OAuth.

```typescript
<OAuthConnectionDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  provider="dropbox"
  context="para crear una carpeta de Dropbox para este proyecto"
  onSuccess={() => {
    // Callback después de conectar
  }}
/>
```

#### `ProjectIntegrations`
Componente que muestra las integraciones disponibles para un proyecto y permite crearlas fácilmente.

## Flujo de Usuario

### Antes (Flujo Antiguo)
1. Usuario intenta crear carpeta de Dropbox
2. Recibe error: "Dropbox no conectado"
3. Usuario debe ir manualmente a `/settings`
4. Hacer clic en "Conectar Dropbox"
5. Ser redirigido a Dropbox
6. Autorizar
7. Ser redirigido de vuelta a settings
8. Volver al proyecto
9. Intentar crear carpeta de nuevo

### Ahora (Flujo Nuevo)
1. Usuario intenta crear carpeta de Dropbox
2. Si no tiene conexión, aparece un diálogo automáticamente
3. Usuario hace clic en "Conectar Dropbox" en el diálogo
4. Se abre popup con Dropbox
5. Usuario autoriza
6. Popup se cierra automáticamente
7. La carpeta se crea automáticamente
8. ✅ Listo en 3 clics

## Cambios en las Rutas OAuth

Todas las rutas OAuth ahora soportan modo popup:

- `/api/github/oauth?popup=true` - Abre en popup
- `/api/google-drive/oauth?popup=true` - Abre en popup
- `/api/dropbox/oauth?popup=true` - Abre en popup

Los callbacks detectan si vienen de un popup y:
- Cierran la ventana automáticamente
- Envían mensaje al padre con `postMessage`
- No redirigen a settings (a menos que no sea popup)

## Uso en Componentes

### Ejemplo: Conectar desde Settings

```typescript
const { connect, isConnecting } = useOAuthPopup("github", {
  onSuccess: () => {
    toast({ title: "GitHub conectado" });
    window.location.reload();
  },
});

<Button onClick={() => connect()} disabled={isConnecting}>
  {isConnecting ? "Conectando..." : "Conectar GitHub"}
</Button>
```

### Ejemplo: Crear Carpeta con Detección Automática

```typescript
const { executeWithAuth, Dialog } = useOAuthRequired({
  provider: "dropbox",
  context: "para crear una carpeta de Dropbox",
});

const handleCreate = async () => {
  try {
    await executeWithAuth(async () => {
      await createProjectDropboxFolder(projectId);
    });
    toast({ title: "Carpeta creada" });
  } catch (error) {
    // El diálogo se muestra automáticamente si falta OAuth
  }
};

return (
  <>
    <Button onClick={handleCreate}>Crear Carpeta</Button>
    {Dialog}
  </>
);
```

## Beneficios

1. **Mejor UX**: Menos pasos, más intuitivo
2. **Menos fricción**: No necesitas ir a settings manualmente
3. **Contextual**: Los diálogos aparecen donde se necesitan
4. **Moderno**: Popup en lugar de redirección completa
5. **Automático**: Detección y oferta de conexión automática

## Compatibilidad

- ✅ Funciona con redirección tradicional (si no se usa popup)
- ✅ Compatible con el sistema anterior
- ✅ Los usuarios pueden seguir usando `/settings` si prefieren
- ✅ Soporta todos los proveedores: GitHub, Google Drive, Dropbox

## Próximos Pasos

Para usar este sistema en nuevos componentes:

1. Importa `useOAuthPopup` o `useOAuthRequired`
2. Envuelve las acciones que requieren OAuth con `executeWithAuth`
3. Incluye el `Dialog` en el JSX
4. ¡Listo! El sistema detectará automáticamente cuando falta conexión

