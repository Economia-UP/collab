"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/app/actions/dashboard";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, Users, ListTodo } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";

export function SidebarStats() {
  const [stats, setStats] = useState<{
    ownedProjects: number;
    memberProjects: number;
    assignedTasks: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="px-4 py-2">
        <div className="text-xs text-muted-foreground">Cargando estadísticas...</div>
      </div>
    );
  }

  return (
    <motion.div {...fadeInUp} className="px-4 py-2 space-y-2">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Resumen Rápido
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FolderKanban className="h-3 w-3" />
            <span>Mis Proyectos</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {stats.ownedProjects}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>Colaboraciones</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {stats.memberProjects}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ListTodo className="h-3 w-3" />
            <span>Tareas Pendientes</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {stats.assignedTasks}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}

