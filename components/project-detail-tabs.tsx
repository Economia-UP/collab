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
import { ProjectFiles } from "./project-files";
import { AIAssistant } from "./ai-assistant";
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
  userHasGoogleDrive?: boolean;
  userHasDropbox?: boolean;
}

export function ProjectDetailTabs({
  project,
  isOwner,
  isMember,
  isAdmin,
  currentUserId,
  userHasGoogleDrive = false,
  userHasDropbox = false,
}: ProjectDetailTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1">
        <TabsTrigger value="overview">Resumen</TabsTrigger>
        <TabsTrigger value="discussion">Discusión</TabsTrigger>
        <TabsTrigger value="tasks">Tareas</TabsTrigger>
        <TabsTrigger value="files">Archivos</TabsTrigger>
        <TabsTrigger value="assistant">Asistente IA</TabsTrigger>
        <TabsTrigger value="calendar">Calendario</TabsTrigger>
        <TabsTrigger value="meetings">Reuniones</TabsTrigger>
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

      <TabsContent value="files" className="space-y-4">
        <ProjectFiles 
          project={project}
          isOwner={isOwner}
          isMember={isMember || isAdmin}
          userHasGoogleDrive={userHasGoogleDrive}
          userHasDropbox={userHasDropbox}
        />
      </TabsContent>

      <TabsContent value="assistant" className="space-y-4">
        {(isOwner || isMember || isAdmin) && (
          <AIAssistant projectId={project.id} projectTitle={project.title} />
        )}
        {!isOwner && !isMember && !isAdmin && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Debes ser miembro del proyecto para usar el asistente de IA.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="calendar" className="space-y-4">
        {(isOwner || isMember || isAdmin) && (
          <CalendarView projectId={project.id} />
        )}
        {!isOwner && !isMember && !isAdmin && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Debes ser miembro del proyecto para ver el calendario.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="meetings" className="space-y-4">
        {(isOwner || isMember || isAdmin) && (
          <MeetingScheduler projectId={project.id} />
        )}
        {!isOwner && !isMember && !isAdmin && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Debes ser miembro del proyecto para ver las reuniones.
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

