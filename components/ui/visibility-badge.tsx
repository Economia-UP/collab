import { Badge } from "@/components/ui/badge";
import { Visibility } from "@prisma/client";

export function VisibilityBadge({ visibility }: { visibility: Visibility }) {
  return (
    <Badge
      variant={visibility === "PUBLIC" ? "default" : "secondary"}
      className="text-xs"
    >
      {visibility === "PUBLIC" ? "Público" : "Privado"}
    </Badge>
  );
}

