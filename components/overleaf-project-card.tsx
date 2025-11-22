"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, RefreshCw } from "lucide-react";
import Link from "next/link";
import { syncOverleafProjectData } from "@/app/actions/overleaf";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface OverleafProjectCardProps {
  projectId: string;
  projectUrl: string;
  projectData: any;
  isOwner: boolean;
}

export function OverleafProjectCard({
  projectId,
  projectUrl,
  projectData,
  isOwner,
}: OverleafProjectCardProps) {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncOverleafProjectData(projectId);
      toast({
        title: "Sincronizado",
        description: "Los datos del proyecto se han actualizado.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo sincronizar",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <CardTitle className="text-lg">Proyecto de Overleaf</CardTitle>
        </div>
        {isOwner && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {projectData?.name && (
          <div>
            <p className="font-medium">{projectData.name}</p>
            {projectData.lastModified && (
              <p className="text-sm text-muted-foreground mt-1">
                Última modificación:{" "}
                {new Date(projectData.lastModified).toLocaleDateString("es-ES")}
              </p>
            )}
          </div>
        )}

        <Button asChild variant="outline" className="w-full">
          <Link href={projectUrl} target="_blank" rel="noopener noreferrer">
            Abrir en Overleaf
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

