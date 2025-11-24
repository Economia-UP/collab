import { DashboardLayout } from "@/components/dashboard-layout";
import { getProjectById } from "@/app/actions/projects";
import { ProjectDetailTabs } from "@/components/project-detail-tabs";
import { notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getSession } from "@/lib/auth-config";

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  // Handle params as Promise (Next.js 16)
  const resolvedParams = params instanceof Promise ? await params : params;
  
  const session = await getServerSession();
  const authSession = await getSession();
  
  try {
    const project = await getProjectById(resolvedParams.id);
    const isOwner = session?.user?.id === project.ownerId;
    const isMember = project.members.some(
      (m) => m.userId === session?.user?.id && m.status === "ACTIVE"
    );
    const isAdmin = session?.user?.role === "ADMIN";

    return (
      <DashboardLayout session={authSession}>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
              <p className="text-muted-foreground mt-2">{project.shortSummary}</p>
            </div>
            {isOwner && (
              <Button asChild>
                <Link href={`/projects/${resolvedParams.id}/edit`}>Editar</Link>
              </Button>
            )}
          </div>

          <ProjectDetailTabs
            project={project}
            isOwner={isOwner}
            isMember={isMember}
            isAdmin={isAdmin}
            currentUserId={session?.user?.id}
          />
        </div>
      </DashboardLayout>
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Project not found") {
      notFound();
    }
    throw error;
  }
}

