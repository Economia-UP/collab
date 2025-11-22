"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatus } from "@prisma/client";
import { getProjectTasks } from "@/app/actions/tasks";

interface KanbanBoardProps {
  projectId: string;
}

const columns: { id: TaskStatus; title: string }[] = [
  { id: "BACKLOG", title: "Backlog" },
  { id: "IN_PROGRESS", title: "En Progreso" },
  { id: "BLOCKED", title: "Bloqueado" },
  { id: "DONE", title: "Completado" },
];

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  const loadTasks = async () => {
    try {
      const data = await getProjectTasks(projectId);
      setTasks(data);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando tareas...</div>;
  }

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.id);
        return (
          <div key={column.id} className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">
              {column.title} ({columnTasks.length})
            </h3>
            <div className="space-y-2 min-h-[200px]">
              {columnTasks.map((task) => (
                <Card key={task.id} className="p-3">
                  <CardContent className="p-0">
                    <p className="font-medium text-sm">{task.title}</p>
                    {task.assignee && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Asignado a: {task.assignee.name}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

