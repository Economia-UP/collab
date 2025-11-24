import { DashboardLayout } from "@/components/dashboard-layout";
import { ProjectForm } from "@/components/project-form";
import { getProjectById } from "@/app/actions/projects";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { isAdmin } from "@/lib/auth";
import { getSession } from "@/lib/auth-config";

export const dynamic = 'force-dynamic';

export default async function EditProjectPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  // Handle params as Promise (Next.js 16)
  const resolvedParams = params instanceof Promise ? await params : params;
  
  const session = await getServerSession();
  if (!session) {
    redirect("/auth/sign-in");
  }

  const authSession = await getSession();

  try {
    const project = await getProjectById(resolvedParams.id);
    
    // Check if user is owner, co-owner (PI), collaborator (CO_AUTHOR), or admin
    const isOwner = project.ownerId === session.user.id;
    const isCoOwner = project.members.some(
      (m: any) => m.userId === session.user.id && m.role === "PI" && m.status === "ACTIVE"
    );
    const isCollaborator = project.members.some(
      (m: any) => m.userId === session.user.id && m.role === "CO_AUTHOR" && m.status === "ACTIVE"
    );
    const isAdminUser = isAdmin(session.user.role);
    
    if (!isOwner && !isCoOwner && !isCollaborator && !isAdminUser) {
      redirect(`/projects/${resolvedParams.id}`);
    }

    return (
      <DashboardLayout session={authSession}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Proyecto</h1>
            <p className="text-muted-foreground">
              Actualiza la información de tu proyecto
            </p>
          </div>

          <ProjectForm
            projectId={resolvedParams.id}
            initialData={{
              title: project.title,
              shortSummary: project.shortSummary,
              description: project.description,
              topic: project.topic,
              category: project.category,
              programmingLangs: project.programmingLangs,
              requiredSkills: project.requiredSkills,
              visibility: project.visibility,
              githubRepoUrl: project.githubRepoUrl || "",
              overleafProjectUrl: project.overleafProjectUrl || "",
            }}
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

