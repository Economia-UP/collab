"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Bell, UserPlus, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "MEMBER_JOIN_REQUEST" | "COMMENT_ADDED";
  message: string;
  createdAt: Date;
  project: {
    id: string;
    title: string;
  };
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  data: {
    projectId: string;
    memberId?: string;
    commentId?: string;
  };
}

interface DashboardNotificationsProps {
  notifications: Notification[];
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "MEMBER_JOIN_REQUEST":
      return <UserPlus className="h-4 w-4 text-azul" />;
    case "COMMENT_ADDED":
      return <MessageSquare className="h-4 w-4 text-vino" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "MEMBER_JOIN_REQUEST":
      return "border-azul/30 bg-azul/5";
    case "COMMENT_ADDED":
      return "border-vino/30 bg-vino/5";
    default:
      return "border-dorado/30 bg-dorado/5";
  }
};

export function DashboardNotifications({ notifications }: DashboardNotificationsProps) {
  return (
    <motion.div {...fadeInUp}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-dorado" />
            Notificaciones
          </CardTitle>
          <CardDescription>
            Actividad que requiere tu atención
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-sm text-muted-foreground">
                No hay notificaciones nuevas
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={
                    notification.type === "MEMBER_JOIN_REQUEST"
                      ? `/projects/${notification.data.projectId}?tab=members`
                      : `/projects/${notification.data.projectId}?tab=comments`
                  }
                  className="block group"
                >
                  <div
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border transition-all",
                      getNotificationColor(notification.type),
                      "hover:shadow-sm"
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium group-hover:text-dorado transition-colors">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                        <span>•</span>
                        <span className="truncate">{notification.project.title}</span>
                      </div>
                    </div>
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={notification.user.image || undefined} />
                      <AvatarFallback>
                        {notification.user.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
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

