"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { VisibilityBadge } from "@/components/ui/visibility-badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ProjectOverview } from "./project-overview";
import { ProjectDiscussion } from "./project-discussion";
import { ProjectTasks } from "./project-tasks";
import { ProjectActivity } from "./project-activity";
import { Project, ProjectMember, ProjectStatus, Visibility } from "@prisma/client";

interface ProjectDetailTabsProps {
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
    _count: {
      comments: number;
      tasks: number;
    };
  };
  isOwner: boolean;
  isMember: boolean;
  isAdmin: boolean;
  currentUserId?: string;
}

export function ProjectDetailTabs({
  project,
  isOwner,
  isMember,
  isAdmin,
  currentUserId,
}: ProjectDetailTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Resumen</TabsTrigger>
        <TabsTrigger value="discussion">Discusión</TabsTrigger>
        <TabsTrigger value="tasks">Tareas</TabsTrigger>
        <TabsTrigger value="activity">Actividad</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <ProjectOverview
          project={project}
          isOwner={isOwner}
          isMember={isMember}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
        />
      </TabsContent>

      <TabsContent value="discussion" className="space-y-4">
        <ProjectDiscussion projectId={project.id} isMember={isMember || isOwner || isAdmin} />
      </TabsContent>

      <TabsContent value="tasks" className="space-y-4">
        {(isOwner || isMember || isAdmin) && (
          <ProjectTasks projectId={project.id} />
        )}
        {!isOwner && !isMember && !isAdmin && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Debes ser miembro del proyecto para ver las tareas.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="activity" className="space-y-4">
        {(isOwner || isMember || isAdmin) && (
          <ProjectActivity projectId={project.id} />
        )}
        {!isOwner && !isMember && !isAdmin && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Debes ser miembro del proyecto para ver la actividad.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}

