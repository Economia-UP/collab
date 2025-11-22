import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardStats, getRecentActivity } from "@/app/actions/dashboard";
import Link from "next/link";
import { FolderKanban, Users, CheckSquare, Plus, Search, ListTodo } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/lib/auth-config";

export default async function DashboardPage() {
  const session = await auth();
  const stats = await getDashboardStats();
  const activities = await getRecentActivity();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "PROJECT_CREATED":
        return "📝";
      case "COMMENT_ADDED":
        return "💬";
      case "TASK_CREATED":
        return "✅";
      case "MEMBER_JOIN_REQUEST":
        return "👤";
      default:
        return "📌";
    }
  };

  return (
    <DashboardLayout session={session}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen de tus proyectos y actividades
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Mis Proyectos
              </CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ownedProjects}</div>
              <p className="text-xs text-muted-foreground">
                Proyectos que dirijo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Colaboraciones
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.memberProjects}</div>
              <p className="text-xs text-muted-foreground">
                Proyectos en los que colaboro
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tareas Asignadas
              </CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assignedTasks}</div>
              <p className="text-xs text-muted-foreground">
                Tareas pendientes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Button asChild size="lg" className="h-auto flex-col gap-2 py-6">
            <Link href="/projects/new">
              <Plus className="h-6 w-6" />
              <span>Crear Proyecto</span>
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-auto flex-col gap-2 py-6">
            <Link href="/projects">
              <Search className="h-6 w-6" />
              <span>Buscar Proyecto</span>
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-auto flex-col gap-2 py-6">
            <Link href="/my-projects">
              <ListTodo className="h-6 w-6" />
              <span>Ver Tareas</span>
            </Link>
          </Button>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas actividades en tus proyectos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay actividad reciente
              </p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 rounded-lg border p-4"
                  >
                    <div className="text-2xl">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">
                        {activity.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {activity.actor && (
                          <>
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={activity.actor.image || undefined} />
                              <AvatarFallback className="text-[8px]">
                                {activity.actor.name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span>{activity.actor.name}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>
                          {formatDistanceToNow(new Date(activity.createdAt), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                        <span>•</span>
                        <Link
                          href={`/projects/${activity.project.id}`}
                          className="hover:underline"
                        >
                          {activity.project.title}
                        </Link>
                      </div>
                    </div>
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

