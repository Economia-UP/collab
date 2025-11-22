"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

interface Activity {
  id: string;
  type: string;
  message: string;
  createdAt: Date;
  actor?: {
    name: string | null;
    image: string | null;
  } | null;
  project?: {
    id: string;
    title: string;
  } | null;
}

interface DashboardActivityProps {
  activities: Activity[];
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "PROJECT_CREATED":
      return "📝";
    case "COMMENT_ADDED":
      return "💬";
    case "TASK_CREATED":
      return "✅";
    case "MEMBER_JOIN_REQUEST":
      return "👤";
    default:
      return "📌";
  }
};

export function DashboardActivity({ activities }: DashboardActivityProps) {
  return (
    <motion.div {...fadeInUp}>
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimas actividades en tus proyectos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div
            {...staggerContainer}
            className="space-y-4"
          >
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay actividad reciente
              </p>
            ) : (
              activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  {...staggerItem}
                  className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                >
                  <div className="text-2xl flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                      {activity.project && (
                        <>
                          <span>•</span>
                          <Link
                            href={`/projects/${activity.project.id}`}
                            className="hover:underline hover:text-dorado transition-smooth"
                          >
                            {activity.project.title}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                  {activity.actor && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={activity.actor.image || undefined} />
                      <AvatarFallback>
                        {activity.actor.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

