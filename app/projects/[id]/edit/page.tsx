import { DashboardLayout } from "@/components/dashboard-layout";
import { ProjectForm } from "@/components/project-form";
import { getProjectById } from "@/app/actions/projects";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { isAdmin } from "@/lib/auth";
import { getSession } from "@/lib/auth-config";

export default async function EditProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession();
  if (!session) {
    redirect("/auth/sign-in");
  }

  const authSession = await getSession();

  try {
    const project = await getProjectById(params.id);
    
    // Check if user is owner or admin
    if (project.ownerId !== session.user.id && !isAdmin(session.user.role)) {
      redirect(`/projects/${params.id}`);
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
            projectId={params.id}
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

