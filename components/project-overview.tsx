"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { VisibilityBadge } from "@/components/ui/visibility-badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Project, ProjectMember } from "@prisma/client";
import { Github, FileText } from "lucide-react";
import Link from "next/link";
import { GitHubRepoCard } from "@/components/github-repo-card";
import { OverleafProjectCard } from "@/components/overleaf-project-card";

interface ProjectOverviewProps {
  project: Project & {
    owner: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
      role: string;
    };
    members: (ProjectMember & {
      user: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
        role: string;
      };
    })[];
  };
  isOwner: boolean;
  isMember: boolean;
  isAdmin: boolean;
  currentUserId?: string;
}

export function ProjectOverview({
  project,
  isOwner,
  isMember,
  isAdmin,
  currentUserId,
}: ProjectOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Descripción</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {project.description}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información del Proyecto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Tema:</span>
              <p>{project.topic}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Categoría:</span>
              <p>{project.category}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Estado:</span>
              <div className="mt-1">
                <StatusBadge status={project.status} />
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Visibilidad:</span>
              <div className="mt-1">
                <VisibilityBadge visibility={project.visibility} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integrations */}
        {(project.githubRepoUrl || project.overleafProjectUrl) && (
          <div className="space-y-4">
            {project.githubRepoUrl && project.githubRepoName && project.githubRepoOwner && (
              <GitHubRepoCard
                projectId={project.id}
                repoUrl={project.githubRepoUrl}
                repoName={project.githubRepoName}
                repoOwner={project.githubRepoOwner}
                repoData={project.githubRepoData as any}
                isOwner={isOwner}
              />
            )}
            {project.overleafProjectUrl && (
              <OverleafProjectCard
                projectId={project.id}
                projectUrl={project.overleafProjectUrl}
                projectData={project.overleafProjectData as any}
                isOwner={isOwner}
              />
            )}
          </div>
        )}
      </div>

      {/* Skills & Languages */}
      {(project.programmingLangs.length > 0 || project.requiredSkills.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tecnologías y Habilidades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.programmingLangs.length > 0 && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Lenguajes:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.programmingLangs.map((lang) => (
                    <Badge key={lang} variant="outline">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {project.requiredSkills.length > 0 && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Habilidades:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.requiredSkills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Team */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Equipo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-sm font-medium text-muted-foreground">Propietario:</span>
            <div className="mt-2 flex items-center gap-2">
              <Avatar>
                <AvatarImage src={project.owner.image || undefined} />
                <AvatarFallback>
                  {project.owner.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{project.owner.name || project.owner.email}</p>
                <p className="text-sm text-muted-foreground">{project.owner.role}</p>
              </div>
            </div>
          </div>

          {project.members.length > 0 && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Miembros ({project.members.length}):
              </span>
              <div className="mt-2 space-y-2">
                {project.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user.image || undefined} />
                      <AvatarFallback className="text-xs">
                        {member.user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {member.user.name || member.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.role} • {member.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

