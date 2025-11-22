"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getActivityLogs } from "@/app/actions/activity";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ProjectActivityProps {
  projectId: string;
}

const activityIcons: Record<string, string> = {
  PROJECT_CREATED: "📝",
  PROJECT_UPDATED: "✏️",
  STATUS_CHANGED: "🔄",
  MEMBER_JOIN_REQUEST: "👤",
  MEMBER_APPROVED: "✅",
  MEMBER_REJECTED: "❌",
  COMMENT_ADDED: "💬",
  TASK_CREATED: "📋",
  TASK_UPDATED: "📝",
  GITHUB_REPO_CONNECTED: "🔗",
  GITHUB_REPO_DISCONNECTED: "🔌",
  OVERLEAF_PROJECT_CONNECTED: "📄",
  OVERLEAF_PROJECT_DISCONNECTED: "📄",
};

export function ProjectActivity({ projectId }: ProjectActivityProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [projectId]);

  const loadActivities = async () => {
    try {
      const data = await getActivityLogs(projectId);
      setActivities(data);
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando actividad...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad del Proyecto</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay actividad registrada aún.
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-4 border-b pb-4 last:border-0">
                <div className="text-2xl">
                  {activityIcons[activity.type] || "📌"}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">{activity.message}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {activity.actor && (
                      <>
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={activity.actor.image || undefined} />
                          <AvatarFallback className="text-[8px]">
                            {activity.actor.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span>{activity.actor.name}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

