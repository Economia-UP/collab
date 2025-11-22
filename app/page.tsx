import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { auth } from "@/lib/auth-config";
import { Github, FileText, Users } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: "bg-gray-100 text-gray-800",
      PLANNING: "bg-blue-100 text-blue-800",
      DATA_COLLECTION: "bg-yellow-100 text-yellow-800",
      ANALYSIS: "bg-purple-100 text-purple-800",
      WRITING: "bg-green-100 text-green-800",
      REVIEW: "bg-orange-100 text-orange-800",
      COMPLETED: "bg-green-200 text-green-900",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar session={session} />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Hub de Proyectos de Investigación
              </h1>
              <p className="mb-8 text-xl text-muted-foreground">
                Plataforma de colaboración para investigadores de la Universidad Panamericana.
                Conecta, colabora y avanza en tus proyectos de investigación.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                  <Link href="/auth/signin">
                    Inicia sesión con tu correo @up.edu.mx
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/projects">Explorar proyectos</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">Características principales</h2>
              <p className="text-muted-foreground">
                Todo lo que necesitas para gestionar y colaborar en proyectos de investigación
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <Users className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>Colaboración</CardTitle>
                  <CardDescription>
                    Trabaja en equipo, gestiona miembros y solicitudes de participación
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Github className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>Integración con GitHub</CardTitle>
                  <CardDescription>
                    Conecta tus repositorios de código y mantén todo sincronizado
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <FileText className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>Gestión de Tareas</CardTitle>
                  <CardDescription>
                    Organiza tu investigación con tableros Kanban y seguimiento de actividades
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Sample Projects Section */}
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">Proyectos destacados</h2>
              <p className="text-muted-foreground">
                Ejemplos de proyectos activos en la plataforma
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sampleProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <CardDescription>{project.shortSummary}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
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
              ))}
            </div>
          </div>
        </section>
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

