"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { FolderKanban, Clock } from "lucide-react";

interface Project {
  id: string;
  title: string;
  status: string;
  updatedAt: Date;
  owner: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  _count: {
    members: number;
    tasks: number;
  };
}

interface DashboardRecentProjectsProps {
  projects: Project[];
}

export function DashboardRecentProjects({ projects }: DashboardRecentProjectsProps) {
  return (
    <motion.div {...fadeInUp}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-dorado" />
            Proyectos Recientes
          </CardTitle>
          <CardDescription>
            Tus proyectos más recientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-sm text-muted-foreground mb-2">
                No tienes proyectos aún
              </p>
              <Link
                href="/projects/new"
                className="text-sm text-dorado hover:underline font-medium"
              >
                Crear tu primer proyecto
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block group"
                >
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-transparent hover:border-dorado/30 hover:bg-dorado/5 transition-all">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={project.owner.image || undefined} />
                      <AvatarFallback>
                        {project.owner.name?.charAt(0).toUpperCase() || project.owner.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm group-hover:text-dorado transition-colors truncate">
                          {project.title}
                        </h4>
                        <StatusBadge status={project.status as any} />
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(project.updatedAt), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                        <span>{project._count.members} miembros</span>
                        <span>{project._count.tasks} tareas</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

