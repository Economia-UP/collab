"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { Github, FileText, Users, Bot, Calendar, Video } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Users,
      title: "Colaboración",
      description: "Trabaja en equipo, gestiona miembros y solicitudes de participación",
      color: "text-dorado",
    },
    {
      icon: Bot,
      title: "Asistente de IA",
      description: "Obtén ayuda con documentación, código y planificación usando inteligencia artificial",
      color: "text-azul",
    },
    {
      icon: Calendar,
      title: "Calendario y Reuniones",
      description: "Programa eventos, reuniones y sincroniza con Google Calendar",
      color: "text-vino",
    },
    {
      icon: Github,
      title: "Integraciones",
      description: "GitHub, Google Drive, Dropbox y más. Automatiza con n8n",
      color: "text-success",
    },
    {
      icon: FileText,
      title: "Gestión de Tareas",
      description: "Organiza tu trabajo con tableros Kanban y seguimiento de actividades",
      color: "text-dorado",
    },
    {
      icon: Video,
      title: "Reuniones Virtuales",
      description: "Programa reuniones con Google Meet y Zoom integrados",
      color: "text-azul",
    },
  ];

  return (
    <section className="py-20 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold">Características principales</h2>
          <p className="text-lg text-muted-foreground">
            Todo lo que necesitas para colaborar y gestionar proyectos de trabajo en equipo
          </p>
        </motion.div>
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} variants={staggerItem}>
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

