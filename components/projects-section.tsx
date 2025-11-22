"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

interface Project {
  id: number;
  title: string;
  shortSummary: string;
  topic: string;
  category: string;
  status: string;
  programmingLangs: string[];
  requiredSkills: string[];
}

interface ProjectsSectionProps {
  projects: Project[];
}

const getStatusBadgeVariant = (status: string) => {
  const variants: Record<string, "default" | "secondary" | "accent" | "success"> = {
    DRAFT: "secondary",
    PLANNING: "secondary",
    DATA_COLLECTION: "accent",
    ANALYSIS: "default",
    WRITING: "success",
    REVIEW: "accent",
    COMPLETED: "success",
  };
  return variants[status] || "secondary";
};

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section className="bg-gradient-to-b from-muted/30 to-background py-20 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          {...fadeInUp}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold">Proyectos destacados</h2>
          <p className="text-lg text-muted-foreground">
            Ejemplos de proyectos activos en la plataforma
          </p>
        </motion.div>
        
        <motion.div
          {...staggerContainer}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {projects.map((project) => (
            <motion.div key={project.id} {...staggerItem}>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl leading-tight">{project.title}</CardTitle>
                    <Badge variant={getStatusBadgeVariant(project.status)}>
                      {project.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <CardDescription className="text-base">
                    {project.shortSummary}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium">Tema:</span>
                      <span>{project.topic}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.programmingLangs.map((lang) => (
                        <Badge key={lang} variant="outline">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

