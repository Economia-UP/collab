import { DashboardLayout } from "@/components/dashboard-layout";
import { getProjectById } from "@/app/actions/projects";
import { ProjectDetailTabs } from "@/components/project-detail-tabs";
import { notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getSession } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

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
    const isCoOwner = project.members.some(
      (m: any) => m.userId === session?.user?.id && m.role === "PI" && m.status === "ACTIVE"
    );
    const isCollaborator = project.members.some(
      (m: any) => m.userId === session?.user?.id && m.role === "CO_AUTHOR" && m.status === "ACTIVE"
    );
    const isMember = project.members.some(
      (m: any) => m.userId === session?.user?.id && m.status === "ACTIVE"
    );
    const isAdmin = session?.user?.role === "ADMIN";
    const canEdit = isOwner || isCoOwner || isCollaborator || isAdmin;

    // Get user's OAuth connection status
    let userHasGoogleDrive = false;
    let userHasDropbox = false;
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          googleDriveAccessToken: true,
          dropboxAccessToken: true,
        },
      });
      userHasGoogleDrive = !!user?.googleDriveAccessToken;
      userHasDropbox = !!user?.dropboxAccessToken;
    }

    return (
      <DashboardLayout session={authSession}>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
              <p className="text-muted-foreground mt-2">{project.shortSummary}</p>
            </div>
            {canEdit && (
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
            userHasGoogleDrive={userHasGoogleDrive}
            userHasDropbox={userHasDropbox}
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

