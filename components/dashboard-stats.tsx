"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { FolderKanban, Users, CheckSquare } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    ownedProjects: number;
    memberProjects: number;
    assignedTasks: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Mis Proyectos",
      value: stats.ownedProjects,
      description: "Proyectos que dirijo",
      icon: FolderKanban,
      color: "text-dorado",
    },
    {
      title: "Colaboraciones",
      value: stats.memberProjects,
      description: "Proyectos en los que colaboro",
      icon: Users,
      color: "text-azul",
    },
    {
      title: "Tareas Asignadas",
      value: stats.assignedTasks,
      description: "Tareas pendientes",
      icon: CheckSquare,
      color: "text-vino",
    },
  ];

  return (
    <motion.div
      {...staggerContainer}
      className="grid gap-4 md:grid-cols-3"
    >
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div key={index} {...staggerItem}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 200 }}
                  className="text-3xl font-bold"
                >
                  {stat.value}
                </motion.div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

