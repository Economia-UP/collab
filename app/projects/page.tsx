import { DashboardLayout } from "@/components/dashboard-layout";
import { ProjectCard } from "@/components/project-card";
import { getProjects } from "@/app/actions/projects";
import { ProjectStatus, Visibility } from "@prisma/client";
import { ProjectsFilter } from "@/components/projects-filter";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const filters = {
    topic: searchParams.topic as string | undefined,
    category: searchParams.category as string | undefined,
    status: searchParams.status
      ? (Array.isArray(searchParams.status)
          ? searchParams.status
          : [searchParams.status]
        ).filter((s): s is ProjectStatus => s in ProjectStatus)
      : undefined,
    visibility: searchParams.visibility as Visibility | undefined,
    search: searchParams.search as string | undefined,
    hasGithub: searchParams.hasGithub === "true",
    hasOverleaf: searchParams.hasOverleaf === "true",
  };

  const projects = await getProjects(filters);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
          <p className="text-muted-foreground">
            Explora y encuentra proyectos de investigación
          </p>
        </div>

        <ProjectsFilter />

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No se encontraron proyectos con los filtros seleccionados.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

