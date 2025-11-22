import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { getSession } from "@/lib/auth-config";
import { Github, FileText, Users } from "lucide-react";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { ProjectsSection } from "@/components/projects-section";

export default async function HomePage() {
  const session = await getSession();
  const sampleProjects = [
    {
      id: 1,
      title: "Análisis de Datos Económicos con R",
      shortSummary: "Investigación sobre tendencias económicas usando modelos estadísticos avanzados",
      topic: "Economía",
      category: "Tesis",
      status: "ANALYSIS",
      programmingLangs: ["R", "Python"],
      requiredSkills: ["Estadística", "Econometría"],
    },
    {
      id: 2,
      title: "Machine Learning en Medicina",
      shortSummary: "Aplicación de algoritmos de ML para diagnóstico temprano",
      topic: "Medicina",
      category: "Paper",
      status: "DATA_COLLECTION",
      programmingLangs: ["Python"],
      requiredSkills: ["Machine Learning", "Python", "TensorFlow"],
    },
    {
      id: 3,
      title: "Estudio de Mercado Financiero",
      shortSummary: "Análisis de volatilidad en mercados emergentes",
      topic: "Finanzas",
      category: "Grant",
      status: "WRITING",
      programmingLangs: ["Stata", "R"],
      requiredSkills: ["Finanzas", "Análisis de datos"],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar session={session} />
      <main className="flex-1">
        <HeroSection session={session} />
        <FeaturesSection />
        <ProjectsSection projects={sampleProjects} />
      </main>

      {/* Footer */}
      <footer className="border-t bg-background py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Research Hub UP - Universidad Panamericana</p>
        </div>
      </footer>
    </div>
  );
}

