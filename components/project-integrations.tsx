"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Github, Cloud, FolderOpen, Plus, Link as LinkIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createProjectDropboxFolder } from "@/app/actions/dropbox";
import { 
  createProjectGoogleDriveFolder,
  connectExistingGoogleDriveFolder,
  listAvailableGoogleDriveFolders,
} from "@/app/actions/google-drive";
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
  const [showGoogleDriveFolderDialog, setShowGoogleDriveFolderDialog] = useState(false);
  const [googleDriveFolders, setGoogleDriveFolders] = useState<any[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isConnectingFolder, setIsConnectingFolder] = useState(false);

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

  const handleOpenFolderDialog = async () => {
    if (!userHasGoogleDrive) {
      toast({
        title: "Google Drive no conectado",
        description: "Por favor conecta tu cuenta de Google Drive primero.",
        variant: "destructive",
      });
      return;
    }

    setShowGoogleDriveFolderDialog(true);
    setIsLoadingFolders(true);

    try {
      const result = await listAvailableGoogleDriveFolders();
      setGoogleDriveFolders(result.folders || []);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron cargar las carpetas",
        variant: "destructive",
      });
      setShowGoogleDriveFolderDialog(false);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  const handleConnectExistingFolder = async (folderId: string) => {
    try {
      setIsConnectingFolder(true);
      await connectExistingGoogleDriveFolder(projectId, folderId);
      toast({
        title: "Carpeta conectada",
        description: "La carpeta de Google Drive se ha conectado exitosamente.",
      });
      setShowGoogleDriveFolderDialog(false);
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo conectar la carpeta",
        variant: "destructive",
      });
    } finally {
      setIsConnectingFolder(false);
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
                    ? "Crea una nueva carpeta o conecta una existente"
                    : "Conecta Google Drive para crear carpetas automáticamente"}
                </p>
              </div>
            </div>
            {hasGoogleDrive ? (
              <span className="text-sm text-muted-foreground">Conectado</span>
            ) : (
              <div className="flex gap-2">
                {userHasGoogleDrive && (
                  <Button
                    onClick={handleOpenFolderDialog}
                    disabled={isCreatingGoogleDrive || isConnectingFolder}
                    variant="outline"
                    size="sm"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Conectar Existente
                  </Button>
                )}
                <Button
                  onClick={handleCreateGoogleDriveFolder}
                  disabled={isCreatingGoogleDrive || isConnectingFolder || !userHasGoogleDrive}
                  variant={userHasGoogleDrive ? "default" : "outline"}
                  size="sm"
                >
                  {isCreatingGoogleDrive ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : userHasGoogleDrive ? (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Nueva
                    </>
                  ) : (
                    "Conectar Google Drive"
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {DropboxDialog}
      {GoogleDriveDialog}

      {/* Google Drive Folder Selection Dialog */}
      <Dialog open={showGoogleDriveFolderDialog} onOpenChange={setShowGoogleDriveFolderDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Seleccionar Carpeta de Google Drive</DialogTitle>
            <DialogDescription>
              Elige una carpeta existente de Google Drive para conectar con este proyecto
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {isLoadingFolders ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Cargando carpetas...</span>
              </div>
            ) : googleDriveFolders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron carpetas en tu Google Drive</p>
                <p className="text-sm mt-2">Crea una nueva carpeta desde el botón "Crear Nueva"</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {googleDriveFolders.map((folder: any) => (
                  <div
                    key={folder.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => !isConnectingFolder && handleConnectExistingFolder(folder.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FolderOpen className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{folder.name}</p>
                        {folder.modifiedTime && (
                          <p className="text-sm text-muted-foreground">
                            Modificado: {new Date(folder.modifiedTime).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnectExistingFolder(folder.id);
                      }}
                      disabled={isConnectingFolder}
                      size="sm"
                    >
                      {isConnectingFolder ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Conectando...
                        </>
                      ) : (
                        "Conectar"
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

