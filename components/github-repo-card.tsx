"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, Star, GitFork, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { syncGitHubRepoData } from "@/app/actions/github";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface GitHubRepoCardProps {
  projectId: string;
  repoUrl: string;
  repoName: string;
  repoOwner: string;
  repoData: any;
  isOwner: boolean;
}

export function GitHubRepoCard({
  projectId,
  repoUrl,
  repoName,
  repoOwner,
  repoData,
  isOwner,
}: GitHubRepoCardProps) {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncGitHubRepoData(projectId);
      toast({
        title: "Sincronizado",
        description: "Los datos del repositorio se han actualizado.",
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
          <Github className="h-5 w-5" />
          <CardTitle className="text-lg">Repositorio de GitHub</CardTitle>
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
        <div>
          <Link
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            {repoOwner}/{repoName}
          </Link>
          {repoData?.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {repoData.description}
            </p>
          )}
        </div>

        {repoData && (
          <div className="flex flex-wrap gap-4 text-sm">
            {repoData.stars !== undefined && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span>{repoData.stars}</span>
              </div>
            )}
            {repoData.forks !== undefined && (
              <div className="flex items-center gap-1">
                <GitFork className="h-4 w-4" />
                <span>{repoData.forks}</span>
              </div>
            )}
            {repoData.openIssues !== undefined && (
              <div className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                <span>{repoData.openIssues}</span>
              </div>
            )}
            {repoData.language && (
              <Badge variant="outline">{repoData.language}</Badge>
            )}
          </div>
        )}

        <Button asChild variant="outline" className="w-full">
          <Link href={repoUrl} target="_blank" rel="noopener noreferrer">
            Abrir en GitHub
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

