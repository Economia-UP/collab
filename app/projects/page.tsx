import { DashboardLayout } from "@/components/dashboard-layout";
import { ProjectCard } from "@/components/project-card";
import { getProjects } from "@/app/actions/projects";
import { ProjectStatus, Visibility } from "@prisma/client";
import { ProjectsFilter } from "@/components/projects-filter";
import { getSession } from "@/lib/auth-config";

export const dynamic = 'force-dynamic';

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined } | Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Handle searchParams as Promise (Next.js 16)
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  
  const filters = {
    topic: params?.topic as string | undefined,
    category: params?.category as string | undefined,
    status: params?.status
      ? (Array.isArray(params.status)
          ? params.status
          : [params.status]
        ).filter((s): s is ProjectStatus => s in ProjectStatus)
      : undefined,
    // Don't pass visibility filter in marketplace mode - it will force PUBLIC
    search: params?.search as string | undefined,
    hasGithub: params?.hasGithub === "true",
    hasOverleaf: params?.hasOverleaf === "true",
    marketplace: true, // Always use marketplace mode for this page
  };

  let session = null;
  let projects: Awaited<ReturnType<typeof getProjects>> = [];
  
  try {
    session = await getSession();
    // Use marketplace mode to show all public projects
    projects = await getProjects(filters);
  } catch (error) {
    console.error("Error loading projects:", error);
    // Continue with empty projects list
    projects = [];
  }

  return (
    <DashboardLayout session={session}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplace de Proyectos</h1>
          <p className="text-muted-foreground">
            Explora y encuentra proyectos públicos de investigación. Solicita acceso a los que te interesen.
          </p>
        </div>

        <ProjectsFilter />

        {projects.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">
              No se encontraron proyectos públicos con los filtros seleccionados.
            </p>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>💡 <strong>Consejo:</strong> Para que tu proyecto aparezca aquí:</p>
              <ol className="list-decimal list-inside space-y-1 text-left max-w-md mx-auto">
                <li>Ve a la página de tu proyecto</li>
                <li>Haz clic en "Editar"</li>
                <li>Cambia la "Visibilidad" a <strong>Público</strong></li>
                <li>Guarda los cambios</li>
              </ol>
              <p className="mt-4">
                Revisa la consola del servidor para ver los logs de depuración.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project: Awaited<ReturnType<typeof getProjects>>[0]) => (
              <ProjectCard 
                key={project.id} 
                project={project}
                isMember={project.isMember}
                isOwner={project.isOwner}
                hasPendingRequest={project.hasPendingRequest}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

