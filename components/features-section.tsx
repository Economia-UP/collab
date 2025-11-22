"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { Github, FileText, Users } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Users,
      title: "Colaboración",
      description: "Trabaja en equipo, gestiona miembros y solicitudes de participación",
      color: "text-dorado",
    },
    {
      icon: Github,
      title: "Integración con GitHub",
      description: "Conecta tus repositorios de código y mantén todo sincronizado",
      color: "text-azul",
    },
    {
      icon: FileText,
      title: "Gestión de Tareas",
      description: "Organiza tu investigación con tableros Kanban y seguimiento de actividades",
      color: "text-vino",
    },
  ];

  return (
    <section className="py-20 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          {...fadeInUp}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold">Características principales</h2>
          <p className="text-lg text-muted-foreground">
            Todo lo que necesitas para gestionar y colaborar en proyectos de investigación
          </p>
        </motion.div>
        
        <motion.div
          {...staggerContainer}
          className="grid gap-8 md:grid-cols-3"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} {...staggerItem}>
                <Card className="h-full">
                  <CardHeader>
                    <Icon className={`mb-4 h-10 w-10 ${feature.color}`} />
                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

