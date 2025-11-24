"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FolderOpen, 
  Github, 
  FileText, 
  Cloud, 
  ExternalLink, 
  Plus,
  Folder,
  File
} from "lucide-react";
import Link from "next/link";

interface ProjectFilesProps {
  project: {
    id: string;
    title: string;
    googleDriveFolderId?: string | null;
    googleDriveFolderUrl?: string | null;
    dropboxFolderId?: string | null;
    dropboxFolderUrl?: string | null;
    githubRepoUrl?: string | null;
    githubRepoName?: string | null;
    overleafProjectUrl?: string | null;
    overleafProjectId?: string | null;
  };
  isOwner: boolean;
  isMember: boolean;
}

export function ProjectFiles({ project, isOwner, isMember }: ProjectFilesProps) {
  const hasGoogleDrive = !!project.googleDriveFolderId;
  const hasDropbox = !!project.dropboxFolderId;
  const hasGithub = !!project.githubRepoUrl;
  const hasOverleaf = !!project.overleafProjectUrl;

  const canAccess = isOwner || isMember;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Archivos del Proyecto</h2>
        <p className="text-muted-foreground">
          Accede a las carpetas y repositorios conectados a este proyecto
        </p>
      </div>

      {/* Google Drive */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>Google Drive</CardTitle>
                <CardDescription>
                  Carpeta compartida de Google Drive para documentos del proyecto
                </CardDescription>
              </div>
            </div>
            {hasGoogleDrive ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                Conectado
              </Badge>
            ) : (
              <Badge variant="outline">No conectado</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasGoogleDrive ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Folder className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Carpeta del Proyecto</p>
                    <p className="text-sm text-muted-foreground">
                      {project.title}
                    </p>
                  </div>
                </div>
                {canAccess && project.googleDriveFolderUrl && (
                  <Button asChild variant="outline" size="sm">
                    <Link 
                      href={project.googleDriveFolderUrl} 
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir en Google Drive
                    </Link>
                  </Button>
                )}
              </div>
              {!canAccess && (
                <p className="text-sm text-muted-foreground">
                  Debes ser miembro del proyecto para acceder a esta carpeta
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Cloud className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No hay carpeta de Google Drive conectada
              </p>
              {isOwner && (
                <p className="text-sm text-muted-foreground">
                  Puedes crear una carpeta desde la sección de Integraciones
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dropbox */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>Dropbox</CardTitle>
                <CardDescription>
                  Carpeta compartida de Dropbox para archivos del proyecto
                </CardDescription>
              </div>
            </div>
            {hasDropbox ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                Conectado
              </Badge>
            ) : (
              <Badge variant="outline">No conectado</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasDropbox ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Folder className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Carpeta del Proyecto</p>
                    <p className="text-sm text-muted-foreground">
                      {project.title}
                    </p>
                  </div>
                </div>
                {canAccess && project.dropboxFolderUrl && (
                  <Button asChild variant="outline" size="sm">
                    <Link 
                      href={project.dropboxFolderUrl} 
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir en Dropbox
                    </Link>
                  </Button>
                )}
              </div>
              {!canAccess && (
                <p className="text-sm text-muted-foreground">
                  Debes ser miembro del proyecto para acceder a esta carpeta
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Cloud className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No hay carpeta de Dropbox conectada
              </p>
              {isOwner && (
                <p className="text-sm text-muted-foreground">
                  Puedes crear una carpeta desde la sección de Integraciones
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* GitHub */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Github className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <CardTitle>GitHub</CardTitle>
                <CardDescription>
                  Repositorio de código fuente del proyecto
                </CardDescription>
              </div>
            </div>
            {hasGithub ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                Conectado
              </Badge>
            ) : (
              <Badge variant="outline">No conectado</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasGithub ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <File className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {project.githubRepoName || "Repositorio de GitHub"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {project.githubRepoUrl}
                    </p>
                  </div>
                </div>
                {project.githubRepoUrl && (
                  <Button asChild variant="outline" size="sm">
                    <Link 
                      href={project.githubRepoUrl} 
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver en GitHub
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Github className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No hay repositorio de GitHub conectado
              </p>
              {isOwner && (
                <p className="text-sm text-muted-foreground">
                  Puedes conectar un repositorio desde la sección de Integraciones
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overleaf */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle>Overleaf</CardTitle>
                <CardDescription>
                  Proyecto de LaTeX para documentos académicos
                </CardDescription>
              </div>
            </div>
            {hasOverleaf ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                Conectado
              </Badge>
            ) : (
              <Badge variant="outline">No conectado</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasOverleaf ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Proyecto de Overleaf</p>
                    <p className="text-sm text-muted-foreground">
                      {project.overleafProjectId || "Proyecto conectado"}
                    </p>
                  </div>
                </div>
                {project.overleafProjectUrl && (
                  <Button asChild variant="outline" size="sm">
                    <Link 
                      href={project.overleafProjectUrl} 
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir en Overleaf
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No hay proyecto de Overleaf conectado
              </p>
              {isOwner && (
                <p className="text-sm text-muted-foreground">
                  Puedes conectar un proyecto desde la sección de Integraciones
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <File className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Gestión de Archivos
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Todas las carpetas y repositorios conectados se comparten automáticamente 
                con los miembros del proyecto. Los colaboradores tienen acceso de lectura/escritura 
                a las carpetas de Google Drive y Dropbox.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

