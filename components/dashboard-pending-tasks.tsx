"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import { CheckSquare, Calendar, AlertCircle, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  project: {
    id: string;
    title: string;
  };
}

interface DashboardPendingTasksProps {
  tasks: Task[];
}

const priorityColors: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusLabels: Record<string, string> = {
  BACKLOG: "Pendiente",
  IN_PROGRESS: "En Progreso",
  BLOCKED: "Bloqueada",
  DONE: "Completada",
};

export function DashboardPendingTasks({ tasks }: DashboardPendingTasksProps) {
  const getPriorityColor = (priority: string) => {
    return priorityColors[priority] || priorityColors.MEDIUM;
  };

  const isOverdue = (dueDate: Date | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <motion.div {...fadeInUp}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-vino" />
            Tareas Pendientes
          </CardTitle>
          <CardDescription>
            Tareas asignadas que requieren atención
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-sm text-muted-foreground">
                No tienes tareas pendientes
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/projects/${task.project.id}#tasks`}
                  className="block group"
                >
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-transparent hover:border-vino/30 hover:bg-vino/5 transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-sm group-hover:text-vino transition-colors line-clamp-2">
                          {task.title}
                        </h4>
                        <Badge
                          variant="outline"
                          className={cn("text-xs", getPriorityColor(task.priority))}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FolderKanban className="h-3 w-3" />
                          {task.project.title}
                        </span>
                        {task.dueDate && (
                          <span
                            className={cn(
                              "flex items-center gap-1",
                              isOverdue(task.dueDate) && "text-red-600 font-medium"
                            )}
                          >
                            <Calendar className="h-3 w-3" />
                            {isOverdue(task.dueDate) ? (
                              <>
                                <AlertCircle className="h-3 w-3" />
                                Vencida: {format(new Date(task.dueDate), "dd/MM/yyyy", { locale: es })}
                              </>
                            ) : (
                              format(new Date(task.dueDate), "dd/MM/yyyy", { locale: es })
                            )}
                          </span>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {statusLabels[task.status] || task.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}



