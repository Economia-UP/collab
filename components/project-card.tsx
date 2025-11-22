"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { VisibilityBadge } from "@/components/ui/visibility-badge";
import { Button } from "@/components/ui/button";
import { Github, FileText, Users, MessageSquare } from "lucide-react";
import { ProjectStatus, Visibility } from "@prisma/client";
import { motion } from "framer-motion";
import { scaleIn } from "@/lib/animations";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    shortSummary: string;
    topic: string;
    category: string;
    status: ProjectStatus;
    visibility: Visibility;
    programmingLangs: string[];
    requiredSkills: string[];
    githubRepoUrl: string | null;
    overleafProjectUrl: string | null;
    owner: {
      id: string;
      name: string | null;
      email: string;
      role: string;
    };
    _count: {
      members: number;
      comments: number;
      tasks: number;
    };
  };
  isMember?: boolean;
  onJoinClick?: () => void;
}

export function ProjectCard({ project, isMember, onJoinClick }: ProjectCardProps) {
  return (
    <motion.div
      {...scaleIn}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
          <div className="flex gap-2 flex-shrink-0">
            <StatusBadge status={project.status} />
            <VisibilityBadge visibility={project.visibility} />
          </div>
        </div>
        <CardDescription className="line-clamp-2">
          {project.shortSummary}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{project.topic}</span>
          <span>•</span>
          <span>{project.category}</span>
        </div>

        {project.programmingLangs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.programmingLangs.slice(0, 3).map((lang) => (
              <Badge key={lang} variant="outline" className="text-xs">
                {lang}
              </Badge>
            ))}
            {project.programmingLangs.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{project.programmingLangs.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{project._count.members}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span>{project._count.comments}</span>
          </div>
          {project.githubRepoUrl && (
            <Github className="h-4 w-4 text-muted-foreground" />
          )}
          {project.overleafProjectUrl && (
            <FileText className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/projects/${project.id}`}>Ver Proyecto</Link>
          </Button>
          {!isMember && onJoinClick && (
            <Button onClick={onJoinClick} className="flex-1">
              Quiero unirme
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}

