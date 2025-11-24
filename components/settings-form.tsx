"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { updateProfile } from "@/app/actions/user";
import { updateNotificationPreferences } from "@/app/actions/notifications";
import { useToast } from "@/hooks/use-toast";
import { User, Role } from "@prisma/client";
import { Github, CheckCircle2, XCircle, FolderOpen, Cloud, Mail, MessageSquare, Bell } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

const profileSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  image: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface SettingsFormProps {
  user: User;
  integrationsConfig?: {
    github: boolean;
    googleDrive: boolean;
    dropbox: boolean;
  };
}

export function SettingsForm({ user, integrationsConfig = { github: true, googleDrive: true, dropbox: true } }: SettingsFormProps) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  
  // Súper simple: solo redirigir. El servidor maneja todo.
  const handleConnect = (provider: "github" | "google-drive" | "dropbox") => {
    window.location.href = `/api/${provider}/oauth`;
  };
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      image: user.image || "",
    },
  });

  // Ensure component is mounted before showing toasts
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only show toasts after component is mounted
    if (!mounted) return;
    
    const githubConnected = searchParams.get("github_connected");
    const googleDriveConnected = searchParams.get("google_drive_connected");
    const dropboxConnected = searchParams.get("dropbox_connected");
    const error = searchParams.get("error");
    
    if (githubConnected === "true") {
      toast({
        title: "GitHub conectado",
        description: "Tu cuenta de GitHub se ha conectado correctamente.",
      });
    } else if (googleDriveConnected === "true") {
      toast({
        title: "Google Drive conectado",
        description: "Tu cuenta de Google Drive se ha conectado correctamente.",
      });
    } else if (dropboxConnected === "true") {
      toast({
        title: "Dropbox conectado",
        description: "Tu cuenta de Dropbox se ha conectado correctamente.",
      });
    } else if (error) {
      toast({
        title: "Error",
        description: `Error al conectar: ${error}`,
        variant: "destructive",
      });
    }
  }, [mounted, searchParams, toast]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile({
        name: data.name,
        image: data.image || undefined,
      });
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil se ha actualizado correctamente.",
      });
      // Refresh the page to show updated image
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    }
  };

  const roleLabels: Record<Role, string> = {
    STUDENT: "Estudiante",
    PROFESSOR: "Profesor",
    ADMIN: "Administrador",
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Información de tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="text-2xl">
                {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name || "Sin nombre"}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge variant="secondary" className="mt-1">
                {roleLabels[user.role]}
              </Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">URL de foto de perfil</Label>
              <Input 
                id="image" 
                type="url"
                placeholder="https://ejemplo.com/foto.jpg"
                {...register("image")} 
              />
              {errors.image && (
                <p className="text-sm text-destructive">{errors.image.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Ingresa la URL de tu foto de perfil. También puedes actualizar tu foto desde tu cuenta de Clerk.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" value={user.email} disabled />
              <p className="text-xs text-muted-foreground">
                El correo electrónico no se puede cambiar
              </p>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integraciones</CardTitle>
          <CardDescription>
            Conecta tus cuentas externas para sincronización automática
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* GitHub Integration */}
          {integrationsConfig.github && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Github className="h-5 w-5" />
                <div>
                  <p className="font-medium">GitHub</p>
                  <p className="text-sm text-muted-foreground">
                    {user.githubAccessToken
                      ? `Conectado como @${user.githubUsername || "usuario"}`
                      : "Conecta tu cuenta de GitHub para sincronizar repositorios"}
                  </p>
                </div>
              </div>
              {user.githubAccessToken ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Conectado</span>
                </div>
              ) : (
                <Button onClick={() => handleConnect("github")}>
                  Conectar GitHub
                </Button>
              )}
            </div>
          )}

          {/* Google Drive Integration */}
          {integrationsConfig.googleDrive && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FolderOpen className="h-5 w-5" />
                <div>
                  <p className="font-medium">Google Drive</p>
                  <p className="text-sm text-muted-foreground">
                    {user.googleDriveAccessToken
                      ? "Conectado - Las carpetas se compartirán automáticamente"
                      : "Conecta tu cuenta de Google Drive para compartir carpetas automáticamente"}
                  </p>
                </div>
              </div>
              {user.googleDriveAccessToken ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Conectado</span>
                </div>
              ) : (
                <Button onClick={() => handleConnect("google-drive")}>
                  Conectar Google Drive
                </Button>
              )}
            </div>
          )}

          {/* Dropbox Integration */}
          {integrationsConfig.dropbox && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Cloud className="h-5 w-5" />
                <div>
                  <p className="font-medium">Dropbox</p>
                  <p className="text-sm text-muted-foreground">
                    {user.dropboxAccessToken
                      ? "Conectado - Las carpetas se compartirán automáticamente"
                      : "Conecta tu cuenta de Dropbox para compartir carpetas automáticamente"}
                  </p>
                </div>
              </div>
              {user.dropboxAccessToken ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Conectado</span>
                </div>
              ) : (
                <Button onClick={() => handleConnect("dropbox")}>
                  Conectar Dropbox
                </Button>
              )}
            </div>
          )}

          {/* Message if no integrations are configured */}
          {!integrationsConfig.github && !integrationsConfig.googleDrive && !integrationsConfig.dropbox && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                No hay integraciones configuradas. Contacta al administrador para configurar las integraciones OAuth.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
          <CardDescription>
            Configura cómo y cuándo recibir notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NotificationPreferencesForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationPreferencesForm({ user }: { user: User }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: user.emailNotifications ?? true,
    whatsappNotifications: user.whatsappNotifications ?? false,
    phoneNumber: user.phoneNumber || "",
    notifyOnMembershipRequest: user.notifyOnMembershipRequest ?? true,
    notifyOnComment: user.notifyOnComment ?? true,
    notifyOnTaskAssigned: user.notifyOnTaskAssigned ?? true,
    notifyOnProjectUpdate: user.notifyOnProjectUpdate ?? true,
  });

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updateNotificationPreferences(preferences);
      toast({
        title: "Preferencias actualizadas",
        description: "Tus preferencias de notificaciones se han guardado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron actualizar las preferencias",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Canales de notificación */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Canales de notificación</h3>
        
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Correo electrónico</p>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones por correo electrónico
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.emailNotifications}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, emailNotifications: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">WhatsApp</p>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones por WhatsApp
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.whatsappNotifications}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, whatsappNotifications: checked })
            }
          />
        </div>

        {preferences.whatsappNotifications && (
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Número de teléfono (WhatsApp) *</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+521234567890 o +1234567890"
              value={preferences.phoneNumber}
              onChange={(e) =>
                setPreferences({ ...preferences, phoneNumber: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Formato: +[código de país][número]. Ejemplos: +521234567890 (México), +1234567890 (USA)
            </p>
          </div>
        )}
      </div>

      {/* Tipos de notificaciones */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Tipos de notificaciones</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium text-sm">Solicitudes de membresía</p>
              <p className="text-xs text-muted-foreground">
                Cuando alguien solicita acceso a tu proyecto
              </p>
            </div>
            <Switch
              checked={preferences.notifyOnMembershipRequest}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, notifyOnMembershipRequest: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium text-sm">Comentarios</p>
              <p className="text-xs text-muted-foreground">
                Cuando alguien comenta en tu proyecto
              </p>
            </div>
            <Switch
              checked={preferences.notifyOnComment}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, notifyOnComment: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium text-sm">Tareas asignadas</p>
              <p className="text-xs text-muted-foreground">
                Cuando te asignan una tarea
              </p>
            </div>
            <Switch
              checked={preferences.notifyOnTaskAssigned}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, notifyOnTaskAssigned: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium text-sm">Actualizaciones del proyecto</p>
              <p className="text-xs text-muted-foreground">
                Cuando se actualiza información del proyecto
              </p>
            </div>
            <Switch
              checked={preferences.notifyOnProjectUpdate}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, notifyOnProjectUpdate: checked })
              }
            />
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Guardar preferencias"}
      </Button>
    </div>
  );
}

