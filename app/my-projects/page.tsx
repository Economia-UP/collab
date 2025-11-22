import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { VisibilityBadge } from "@/components/ui/visibility-badge";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import Link from "next/link";
import { FolderKanban, Users } from "lucide-react";
import { auth } from "@/lib/auth-config";

export default async function MyProjectsPage() {
  const session = await requireAuth();
  const userId = session.user.id;

  const [ownedProjects, memberProjects] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      include: {
        _count: {
          select: {
            members: { where: { status: "ACTIVE" } },
            comments: true,
            tasks: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.findMany({
      where: {
        members: {
          some: {
            userId,
            status: "ACTIVE",
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            members: { where: { status: "ACTIVE" } },
            comments: true,
            tasks: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <DashboardLayout session={session}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Proyectos</h1>
          <p className="text-muted-foreground">
            Gestiona tus proyectos y colaboraciones
          </p>
        </div>

        {/* Owned Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              Proyectos que dirijo ({ownedProjects.length})
            </CardTitle>
            <CardDescription>
              Proyectos donde eres el propietario
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ownedProjects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No tienes proyectos propios aún.
                </p>
                <Button asChild>
                  <Link href="/projects/new">Crear Proyecto</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {ownedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-semibold hover:underline"
                        >
                          {project.title}
                        </Link>
                        <StatusBadge status={project.status} />
                        <VisibilityBadge visibility={project.visibility} />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {project.shortSummary}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {project._count.members} miembros
                        </span>
                        <span>{project._count.comments} comentarios</span>
                        <span>{project._count.tasks} tareas</span>
                      </div>
                    </div>
                    <Button asChild variant="outline">
                      <Link href={`/projects/${project.id}`}>Ver</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Member Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Proyectos en los que colaboro ({memberProjects.length})
            </CardTitle>
            <CardDescription>
              Proyectos donde participas como colaborador
            </CardDescription>
          </CardHeader>
          <CardContent>
            {memberProjects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No estás colaborando en ningún proyecto aún.
                </p>
                <Button asChild variant="outline">
                  <Link href="/projects">Explorar Proyectos</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {memberProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-semibold hover:underline"
                        >
                          {project.title}
                        </Link>
                        <StatusBadge status={project.status} />
                        <VisibilityBadge visibility={project.visibility} />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {project.shortSummary}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Propietario: {project.owner.name || project.owner.email}</span>
                        <span>{project._count.members} miembros</span>
                        <span>{project._count.comments} comentarios</span>
                      </div>
                    </div>
                    <Button asChild variant="outline">
                      <Link href={`/projects/${project.id}`}>Ver</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

