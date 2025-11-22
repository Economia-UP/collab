import { Badge } from "@/components/ui/badge";
import { ProjectStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const statusConfig: Record<ProjectStatus, { label: string; variant: "default" | "secondary" | "accent" | "success" }> = {
  DRAFT: { label: "Borrador", variant: "secondary" },
  PLANNING: { label: "Planificación", variant: "secondary" },
  DATA_COLLECTION: { label: "Recolección de Datos", variant: "accent" },
  ANALYSIS: { label: "Análisis", variant: "default" },
  WRITING: { label: "Escritura", variant: "success" },
  REVIEW: { label: "Revisión", variant: "accent" },
  COMPLETED: { label: "Completado", variant: "success" },
  ARCHIVED: { label: "Archivado", variant: "secondary" },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className="text-xs">
      {config.label}
    </Badge>
  );
}

