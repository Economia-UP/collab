import { DashboardLayout } from "@/components/dashboard-layout";
import { getDashboardStats, getRecentActivity } from "@/app/actions/dashboard";
import { getSession } from "@/lib/auth-config";
import { DashboardStats } from "@/components/dashboard-stats";
import { DashboardQuickActions } from "@/components/dashboard-quick-actions";
import { DashboardActivity } from "@/components/dashboard-activity";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getSession();
  const stats = await getDashboardStats();
  const activities = await getRecentActivity();


  return (
    <DashboardLayout session={session}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen de tus proyectos y actividades
          </p>
        </div>

        <DashboardStats stats={stats} />

        <DashboardQuickActions />

        <DashboardActivity activities={activities} />
      </div>
    </DashboardLayout>
  );
}

