"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Cloud, FolderOpen, Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createProjectDropboxFolder } from "@/app/actions/dropbox";
import { createProjectGoogleDriveFolder } from "@/app/actions/google-drive";
import { OAuthConnectionDialog } from "./oauth-connection-dialog";
import { useOAuthRequired } from "@/hooks/use-oauth-required";

interface ProjectIntegrationsProps {
  projectId: string;
  projectTitle: string;
  hasDropbox: boolean;
  hasGoogleDrive: boolean;
  userHasDropbox: boolean;
  userHasGoogleDrive: boolean;
}

export function ProjectIntegrations({
  projectId,
  projectTitle,
  hasDropbox,
  hasGoogleDrive,
  userHasDropbox,
  userHasGoogleDrive,
}: ProjectIntegrationsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isCreatingDropbox, setIsCreatingDropbox] = useState(false);
  const [isCreatingGoogleDrive, setIsCreatingGoogleDrive] = useState(false);

  const { executeWithAuth: executeWithDropbox, Dialog: DropboxDialog } = useOAuthRequired({
    provider: "dropbox",
    context: "para crear una carpeta de Dropbox para este proyecto",
    onConnected: () => {
      // Retry creating folder after connection
      handleCreateDropboxFolder();
    },
  });

  const { executeWithAuth: executeWithGoogleDrive, Dialog: GoogleDriveDialog } = useOAuthRequired({
    provider: "google-drive",
    context: "para crear una carpeta de Google Drive para este proyecto",
    onConnected: () => {
      // Retry creating folder after connection
      handleCreateGoogleDriveFolder();
    },
  });

  const handleCreateDropboxFolder = async () => {
    try {
      setIsCreatingDropbox(true);
      await executeWithDropbox(async () => {
        await createProjectDropboxFolder(projectId);
        return true;
      });
      toast({
        title: "Carpeta creada",
        description: "La carpeta de Dropbox se ha creado exitosamente.",
      });
      router.refresh();
    } catch (error) {
      if (error instanceof Error && error.message === "OAUTH_REQUIRED") {
        // Dialog will be shown by useOAuthRequired
        return;
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear la carpeta",
        variant: "destructive",
      });
    } finally {
      setIsCreatingDropbox(false);
    }
  };

  const handleCreateGoogleDriveFolder = async () => {
    try {
      setIsCreatingGoogleDrive(true);
      await executeWithGoogleDrive(async () => {
        await createProjectGoogleDriveFolder(projectId);
        return true;
      });
      toast({
        title: "Carpeta creada",
        description: "La carpeta de Google Drive se ha creado exitosamente.",
      });
      router.refresh();
    } catch (error) {
      if (error instanceof Error && error.message === "OAUTH_REQUIRED") {
        // Dialog will be shown by useOAuthRequired
        return;
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear la carpeta",
        variant: "destructive",
      });
    } finally {
      setIsCreatingGoogleDrive(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Integraciones de Almacenamiento</CardTitle>
          <CardDescription>
            Conecta servicios de almacenamiento en la nube para compartir archivos del proyecto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dropbox */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Cloud className="h-5 w-5" />
              <div>
                <p className="font-medium">Dropbox</p>
                <p className="text-sm text-muted-foreground">
                  {hasDropbox
                    ? "Carpeta de Dropbox conectada"
                    : userHasDropbox
                    ? "Crea una carpeta para este proyecto"
                    : "Conecta Dropbox para crear carpetas automáticamente"}
                </p>
              </div>
            </div>
            {hasDropbox ? (
              <span className="text-sm text-muted-foreground">Conectado</span>
            ) : (
              <Button
                onClick={handleCreateDropboxFolder}
                disabled={isCreatingDropbox || !userHasDropbox}
                variant={userHasDropbox ? "default" : "outline"}
              >
                {isCreatingDropbox ? "Creando..." : userHasDropbox ? "Crear Carpeta" : "Conectar Dropbox"}
              </Button>
            )}
          </div>

          {/* Google Drive */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-5 w-5" />
              <div>
                <p className="font-medium">Google Drive</p>
                <p className="text-sm text-muted-foreground">
                  {hasGoogleDrive
                    ? "Carpeta de Google Drive conectada"
                    : userHasGoogleDrive
                    ? "Crea una carpeta para este proyecto"
                    : "Conecta Google Drive para crear carpetas automáticamente"}
                </p>
              </div>
            </div>
            {hasGoogleDrive ? (
              <span className="text-sm text-muted-foreground">Conectado</span>
            ) : (
              <Button
                onClick={handleCreateGoogleDriveFolder}
                disabled={isCreatingGoogleDrive || !userHasGoogleDrive}
                variant={userHasGoogleDrive ? "default" : "outline"}
              >
                {isCreatingGoogleDrive ? "Creando..." : userHasGoogleDrive ? "Crear Carpeta" : "Conectar Google Drive"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {DropboxDialog}
      {GoogleDriveDialog}
    </>
  );
}

