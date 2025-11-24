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

        {/* Notifications Row */}
        <DashboardNotifications notifications={notifications} />

        {/* Activity Feed Row */}
        <DashboardActivity activities={activities} />
      </div>
    </DashboardLayout>
  );
}

