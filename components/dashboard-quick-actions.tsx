"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { Plus, Search, ListTodo } from "lucide-react";
import Link from "next/link";

export function DashboardQuickActions() {
  const actions = [
    {
      href: "/projects/new",
      icon: Plus,
      label: "Crear Proyecto",
      variant: "default" as const,
    },
    {
      href: "/projects",
      icon: Search,
      label: "Buscar Proyecto",
      variant: "outline" as const,
    },
    {
      href: "/my-projects",
      icon: ListTodo,
      label: "Ver Tareas",
      variant: "outline" as const,
    },
  ];

  return (
    <motion.div
      {...staggerContainer}
      className="grid gap-4 md:grid-cols-3"
    >
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.div key={index} {...staggerItem}>
            <Button
              asChild
              size="lg"
              variant={action.variant}
              className="h-auto flex-col gap-2 py-6 transition-smooth"
            >
              <Link href={action.href}>
                <Icon className="h-6 w-6" />
                <span>{action.label}</span>
              </Link>
            </Button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

