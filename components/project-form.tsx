"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createProject } from "@/app/actions/projects";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Visibility, ProjectStatus } from "@prisma/client";
import { updateProject } from "@/app/actions/projects";

const projectSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200),
  shortSummary: z.string().min(1, "El resumen es requerido").max(200),
  description: z.string().min(1, "La descripción es requerida"),
  topic: z.string().min(1, "El tema es requerido"),
  category: z.string().min(1, "La categoría es requerida"),
  programmingLangs: z.array(z.string()).default([]),
  libraries: z.array(z.string()).default([]),
  requiredSkills: z.array(z.string()).default([]),
  visibility: z.nativeEnum(Visibility),
  status: z.nativeEnum(ProjectStatus).optional(),
  githubRepoUrl: z.string().url().optional().or(z.literal("")),
  overleafProjectUrl: z.string().url().optional().or(z.literal("")),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const topics = [
  "Economía",
  "Medicina",
  "Finanzas",
  "Ingeniería",
  "Ciencias Sociales",
  "Tecnología",
  "Educación",
  "Otro",
];

const categories = ["Tesis", "Paper", "Grant", "Proyecto", "Otro"];

const commonLanguages = ["R", "Python", "Stata", "Eviews", "MATLAB", "Julia", "JavaScript", "Java", "C++", "SQL"];

// Librerías comunes por lenguaje
const commonLibraries: Record<string, string[]> = {
  Python: [
    "pandas", "numpy", "scipy", "scikit-learn", "matplotlib", "seaborn",
    "tensorflow", "pytorch", "keras", "statsmodels", "h2o", "xgboost",
    "lightgbm", "plotly", "dash", "flask", "django", "fastapi"
  ],
  R: [
    "dplyr", "tidyr", "ggplot2", "data.table", "lubridate", "stringr",
    "caret", "randomForest", "glmnet", "shiny", "rmarkdown", "knitr",
    "plm", "fixest", "stargazer", "xtable", "haven", "readr"
  ],
  Stata: [
    "estout", "outreg2", "reghdfe", "ivreg2", "xtreg", "xtabond"
  ],
  Eviews: [],
  MATLAB: [
    "Statistics and Machine Learning Toolbox", "Econometrics Toolbox",
    "Financial Toolbox", "Optimization Toolbox"
  ],
  Julia: [
    "DataFrames", "Plots", "StatsBase", "Distributions", "GLM"
  ],
  JavaScript: [
    "React", "Vue", "Angular", "Node.js", "Express", "D3.js"
  ],
  Java: [
    "Spring", "Hibernate", "Apache Commons", "JUnit"
  ],
  "C++": [
    "Boost", "Eigen", "Qt", "OpenCV"
  ],
  SQL: [
    "PostgreSQL", "MySQL", "SQLite", "MongoDB"
  ]
};

export function ProjectForm({ projectId, initialData }: { projectId?: string; initialData?: Partial<ProjectFormData> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [programmingLangs, setProgrammingLangs] = useState<string[]>(initialData?.programmingLangs || []);
  const [libraries, setLibraries] = useState<string[]>(initialData?.libraries || []);
  const [requiredSkills, setRequiredSkills] = useState<string[]>(initialData?.requiredSkills || []);
  const [skillInput, setSkillInput] = useState("");
  const [libraryInput, setLibraryInput] = useState("");
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [coOwnerEmails, setCoOwnerEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [coOwnerInput, setCoOwnerInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: initialData?.title || "",
      shortSummary: initialData?.shortSummary || "",
      description: initialData?.description || "",
      topic: initialData?.topic || "",
      category: initialData?.category || "",
      visibility: initialData?.visibility || "PRIVATE",
      status: initialData?.status || "PLANNING",
      githubRepoUrl: initialData?.githubRepoUrl || "",
      overleafProjectUrl: initialData?.overleafProjectUrl || "",
      programmingLangs: initialData?.programmingLangs || [],
      libraries: initialData?.libraries || [],
      requiredSkills: initialData?.requiredSkills || [],
    },
  });

  const visibility = watch("visibility");
  const status = watch("status");

  const toggleLanguage = (lang: string) => {
    const newLangs = programmingLangs.includes(lang)
      ? programmingLangs.filter((l) => l !== lang)
      : [...programmingLangs, lang];
    setProgrammingLangs(newLangs);
    setValue("programmingLangs", newLangs);
    
    // Si se deselecciona un lenguaje, remover sus librerías
    if (!newLangs.includes(lang)) {
      const langLibraries = commonLibraries[lang] || [];
      const newLibraries = libraries.filter(lib => !langLibraries.includes(lib));
      setLibraries(newLibraries);
      setValue("libraries", newLibraries);
    }
  };

  const toggleLibrary = (library: string) => {
    const newLibraries = libraries.includes(library)
      ? libraries.filter((l) => l !== library)
      : [...libraries, library];
    setLibraries(newLibraries);
    setValue("libraries", newLibraries);
  };

  const addCustomLibrary = () => {
    if (libraryInput.trim() && !libraries.includes(libraryInput.trim())) {
      const newLibraries = [...libraries, libraryInput.trim()];
      setLibraries(newLibraries);
      setValue("libraries", newLibraries);
      setLibraryInput("");
    }
  };

  const removeLibrary = (library: string) => {
    const newLibraries = libraries.filter((l) => l !== library);
    setLibraries(newLibraries);
    setValue("libraries", newLibraries);
  };

  // Obtener librerías disponibles basadas en los lenguajes seleccionados
  const getAvailableLibraries = () => {
    const available: string[] = [];
    programmingLangs.forEach(lang => {
      const langLibs = commonLibraries[lang] || [];
      available.push(...langLibs);
    });
    // Remover duplicados
    return [...new Set(available)];
  };

  const addSkill = () => {
    if (skillInput.trim() && !requiredSkills.includes(skillInput.trim())) {
      const newSkills = [...requiredSkills, skillInput.trim()];
      setRequiredSkills(newSkills);
      setValue("requiredSkills", newSkills);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    const newSkills = requiredSkills.filter((s) => s !== skill);
    setRequiredSkills(newSkills);
    setValue("requiredSkills", newSkills);
  };

  const addEmail = (email: string, type: "invite" | "coOwner") => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.endsWith("@up.edu.mx")) {
      toast({
        title: "Email inválido",
        description: "Debe ser un correo @up.edu.mx",
        variant: "destructive",
      });
      return;
    }

    if (type === "invite") {
      if (!inviteEmails.includes(trimmedEmail) && !coOwnerEmails.includes(trimmedEmail)) {
        setInviteEmails([...inviteEmails, trimmedEmail]);
        setEmailInput("");
      }
    } else {
      if (!coOwnerEmails.includes(trimmedEmail) && !inviteEmails.includes(trimmedEmail)) {
        setCoOwnerEmails([...coOwnerEmails, trimmedEmail]);
        setCoOwnerInput("");
      }
    }
  };

  const removeEmail = (email: string, type: "invite" | "coOwner") => {
    if (type === "invite") {
      setInviteEmails(inviteEmails.filter((e) => e !== email));
    } else {
      setCoOwnerEmails(coOwnerEmails.filter((e) => e !== email));
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      if (projectId) {
        await updateProject(projectId, {
          title: data.title,
          shortSummary: data.shortSummary,
          description: data.description,
          topic: data.topic,
          category: data.category,
          programmingLangs,
          libraries: libraries,
          requiredSkills,
          visibility: data.visibility,
          status: data.status,
        });
        toast({
          title: "Proyecto actualizado",
          description: "El proyecto se ha actualizado correctamente.",
        });
        router.push(`/projects/${projectId}`);
      } else {
        await createProject({
          ...data,
          programmingLangs,
          libraries: libraries,
          requiredSkills,
          status: data.status || "PLANNING",
          githubRepoUrl: data.githubRepoUrl || undefined,
          overleafProjectUrl: data.overleafProjectUrl || undefined,
          inviteEmails: inviteEmails.length > 0 ? inviteEmails : undefined,
          coOwners: coOwnerEmails.length > 0 ? coOwnerEmails : undefined,
        });
        toast({
          title: "Proyecto creado",
          description: "Tu proyecto se ha creado correctamente.",
        });
        router.push("/projects");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
          <CardDescription>Datos principales del proyecto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Ej: Análisis de Datos Económicos con R"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortSummary">Resumen Corto *</Label>
            <Input
              id="shortSummary"
              {...register("shortSummary")}
              placeholder="1-3 líneas que describan el proyecto"
              maxLength={200}
            />
            {errors.shortSummary && (
              <p className="text-sm text-destructive">{errors.shortSummary.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <textarea
              id="description"
              {...register("description")}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Descripción detallada del proyecto (soporta Markdown)"
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="topic">Tema *</Label>
              <Select
                value={watch("topic")}
                onValueChange={(value) => setValue("topic", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tema" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.topic && (
                <p className="text-sm text-destructive">{errors.topic.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select
                value={watch("category")}
                onValueChange={(value) => setValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibilidad *</Label>
              <Select
                value={visibility}
                onValueChange={(value) => setValue("visibility", value as Visibility)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">Público</SelectItem>
                  <SelectItem value="PRIVATE">Privado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!projectId && (
              <div className="space-y-2">
                <Label htmlFor="status">Estado Inicial *</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setValue("status", value as ProjectStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNING">Planificación</SelectItem>
                    <SelectItem value="DATA_COLLECTION">Recolección de Datos</SelectItem>
                    <SelectItem value="ANALYSIS">Análisis</SelectItem>
                    <SelectItem value="WRITING">Escritura</SelectItem>
                    <SelectItem value="REVIEW">Revisión</SelectItem>
                    <SelectItem value="DRAFT">Borrador</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Estado inicial del proyecto
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lenguajes de Programación</CardTitle>
          <CardDescription>Selecciona los lenguajes utilizados en el proyecto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {commonLanguages.map((lang) => (
              <Button
                key={lang}
                type="button"
                variant={programmingLangs.includes(lang) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleLanguage(lang)}
              >
                {lang}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {programmingLangs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Librerías y Paquetes (Opcional)</CardTitle>
            <CardDescription>
              Selecciona librerías comunes o agrega librerías personalizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {getAvailableLibraries().length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Librerías Comunes
                </Label>
                <div className="flex flex-wrap gap-2">
                  {getAvailableLibraries().map((library) => (
                    <Button
                      key={library}
                      type="button"
                      variant={libraries.includes(library) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleLibrary(library)}
                    >
                      {library}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="customLibrary">Agregar Librería Personalizada</Label>
              <div className="flex gap-2">
                <Input
                  id="customLibrary"
                  value={libraryInput}
                  onChange={(e) => setLibraryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomLibrary();
                    }
                  }}
                  placeholder="Ej: mi-libreria-custom, otro-paquete..."
                />
                <Button type="button" onClick={addCustomLibrary}>
                  Agregar
                </Button>
              </div>
            </div>

            {libraries.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Librerías Seleccionadas
                </Label>
                <div className="flex flex-wrap gap-2">
                  {libraries.map((library) => (
                    <div
                      key={library}
                      className="flex items-center gap-1 rounded-full border bg-background px-3 py-1 text-sm"
                    >
                      {library}
                      <button
                        type="button"
                        onClick={() => removeLibrary(library)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Habilidades Requeridas</CardTitle>
          <CardDescription>Agrega habilidades o herramientas necesarias</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="Ej: Estadística, LaTeX, Data cleaning..."
            />
            <Button type="button" onClick={addSkill}>
              Agregar
            </Button>
          </div>
          {requiredSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {requiredSkills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-1 rounded-full border bg-background px-3 py-1 text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {!projectId && (
        <Card>
          <CardHeader>
            <CardTitle>Colaboradores (Opcional)</CardTitle>
            <CardDescription>Invita colaboradores o asigna co-propietarios al crear el proyecto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Co-Propietarios */}
            <div className="space-y-2">
              <Label htmlFor="coOwners">Co-Propietarios</Label>
              <p className="text-xs text-muted-foreground">
                Agrega correos @up.edu.mx de usuarios que serán co-propietarios del proyecto
              </p>
              <div className="flex gap-2">
                <Input
                  id="coOwners"
                  type="email"
                  value={coOwnerInput}
                  onChange={(e) => setCoOwnerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addEmail(coOwnerInput, "coOwner");
                    }
                  }}
                  placeholder="usuario@up.edu.mx"
                />
                <Button
                  type="button"
                  onClick={() => addEmail(coOwnerInput, "coOwner")}
                  variant="outline"
                >
                  Agregar
                </Button>
              </div>
              {coOwnerEmails.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {coOwnerEmails.map((email) => (
                    <div
                      key={email}
                      className="flex items-center gap-1 px-2 py-1 bg-dorado/10 text-dorado rounded-md text-sm"
                    >
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => removeEmail(email, "coOwner")}
                        className="hover:text-dorado-dark"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Colaboradores */}
            <div className="space-y-2">
              <Label htmlFor="inviteEmails">Invitar Colaboradores</Label>
              <p className="text-xs text-muted-foreground">
                Agrega correos @up.edu.mx de usuarios que quieres invitar como colaboradores
              </p>
              <div className="flex gap-2">
                <Input
                  id="inviteEmails"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addEmail(emailInput, "invite");
                    }
                  }}
                  placeholder="usuario@up.edu.mx"
                />
                <Button
                  type="button"
                  onClick={() => addEmail(emailInput, "invite")}
                  variant="outline"
                >
                  Agregar
                </Button>
              </div>
              {inviteEmails.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {inviteEmails.map((email) => (
                    <div
                      key={email}
                      className="flex items-center gap-1 px-2 py-1 bg-azul/10 text-azul rounded-md text-sm"
                    >
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => removeEmail(email, "invite")}
                        className="hover:text-azul-dark"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Integraciones (Opcional)</CardTitle>
          <CardDescription>Conecta con GitHub o Overleaf</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="githubRepoUrl">URL del Repositorio de GitHub</Label>
            <Input
              id="githubRepoUrl"
              {...register("githubRepoUrl")}
              placeholder="https://github.com/owner/repo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="overleafProjectUrl">URL del Proyecto de Overleaf</Label>
            <Input
              id="overleafProjectUrl"
              {...register("overleafProjectUrl")}
              placeholder="https://www.overleaf.com/project/..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : projectId ? "Actualizar" : "Crear Proyecto"}
        </Button>
      </div>
    </form>
  );
}

