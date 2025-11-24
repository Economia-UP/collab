import { DashboardLayout } from "@/components/dashboard-layout";
import { 
  getDashboardStats, 
  getRecentActivity,
  getRecentProjects,
  getPendingTasks,
  getNotifications
} from "@/app/actions/dashboard";
import { getSession } from "@/lib/auth-config";
import { DashboardStats } from "@/components/dashboard-stats";
import { DashboardQuickActions } from "@/components/dashboard-quick-actions";
import { DashboardActivity } from "@/components/dashboard-activity";
import { DashboardRecentProjects } from "@/components/dashboard-recent-projects";
import { DashboardPendingTasks } from "@/components/dashboard-pending-tasks";
import { DashboardNotifications } from "@/components/dashboard-notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getSession();
  
  // Fetch all data with error handling
  let stats = { ownedProjects: 0, memberProjects: 0, assignedTasks: 0 };
  let activities: any[] = [];
  let recentProjects: any[] = [];
  let pendingTasks: any[] = [];
  let notifications: any[] = [];

  try {
    stats = await getDashboardStats();
  } catch (error) {
    console.error("Error loading dashboard stats:", error);
  }

  try {
    activities = await getRecentActivity();
  } catch (error) {
    console.error("Error loading recent activity:", error);
  }

  try {
    recentProjects = await getRecentProjects();
  } catch (error) {
    console.error("Error loading recent projects:", error);
  }

  try {
    pendingTasks = await getPendingTasks();
  } catch (error) {
    console.error("Error loading pending tasks:", error);
  }

  try {
    notifications = await getNotifications();
  } catch (error) {
    console.error("Error loading notifications:", error);
  }

  return (
    <DashboardLayout session={session}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen de tus proyectos y actividades
          </p>
        </div>

        {/* Stats Row */}
        <DashboardStats stats={stats} />

        {/* Quick Actions Row */}
        <DashboardQuickActions />

        {/* Recent Projects and Pending Tasks Row */}
        <div className="grid gap-6 md:grid-cols-2">
          <DashboardRecentProjects projects={recentProjects} />
          <DashboardPendingTasks tasks={pendingTasks} />
        </div>

        {/* All Projects Section */}
        {recentProjects.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold tracking-tight">Todos mis Proyectos</h2>
              <Button asChild variant="outline">
                <Link href="/my-projects">Ver todos</Link>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block"
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                        <StatusBadge status={project.status as any} />
                      </div>
                      <CardDescription className="line-clamp-2">
                        {project.shortSummary || "Sin descripción"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{project._count.members} miembros</span>
                        <span>{project._count.tasks} tareas</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Notifications Row */}
        <DashboardNotifications notifications={notifications} />

        {/* Activity Feed Row */}
        <DashboardActivity activities={activities} />
      </div>
    </DashboardLayout>
  );
}

