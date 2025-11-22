import { DashboardLayout } from "@/components/dashboard-layout";
import { ProjectForm } from "@/components/project-form";

export default function NewProjectPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Proyecto</h1>
          <p className="text-muted-foreground">
            Completa la información para crear tu proyecto de investigación
          </p>
        </div>

        <ProjectForm />
      </div>
    </DashboardLayout>
  );
}

