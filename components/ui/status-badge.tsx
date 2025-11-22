import { Badge } from "@/components/ui/badge";
import { ProjectStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  DRAFT: { label: "Borrador", className: "bg-gray-100 text-gray-800" },
  PLANNING: { label: "Planificación", className: "bg-blue-100 text-blue-800" },
  DATA_COLLECTION: { label: "Recolección de Datos", className: "bg-yellow-100 text-yellow-800" },
  ANALYSIS: { label: "Análisis", className: "bg-purple-100 text-purple-800" },
  WRITING: { label: "Escritura", className: "bg-green-100 text-green-800" },
  REVIEW: { label: "Revisión", className: "bg-orange-100 text-orange-800" },
  COMPLETED: { label: "Completado", className: "bg-green-200 text-green-900" },
  ARCHIVED: { label: "Archivado", className: "bg-gray-200 text-gray-900" },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const config = statusConfig[status];
  return (
    <Badge className={cn("text-xs", config.className)}>
      {config.label}
    </Badge>
  );
}

