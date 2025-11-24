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
import { useToast } from "@/hooks/use-toast";
import { User, Role } from "@prisma/client";
import { Github, CheckCircle2, XCircle, FolderOpen, Cloud } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const profileSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface SettingsFormProps {
  user: User;
}

export function SettingsForm({ user }: SettingsFormProps) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
    },
  });

  useEffect(() => {
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
  }, [searchParams, toast]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile(data);
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil se ha actualizado correctamente.",
      });
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
              <Button asChild>
                <Link href="/api/github/oauth">
                  Conectar GitHub
                </Link>
              </Button>
            )}
          </div>

          {/* Google Drive Integration */}
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
              <Button asChild>
                <Link href="/api/google-drive/oauth">
                  Conectar Google Drive
                </Link>
              </Button>
            )}
          </div>

          {/* Dropbox Integration */}
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
              <Button asChild>
                <Link href="/api/dropbox/oauth">
                  Conectar Dropbox
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
          <CardDescription>
            Preferencias de notificaciones (próximamente)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Las configuraciones de notificaciones estarán disponibles próximamente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

