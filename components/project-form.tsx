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
import { Visibility } from "@prisma/client";
import { updateProject } from "@/app/actions/projects";

const projectSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200),
  shortSummary: z.string().min(1, "El resumen es requerido").max(200),
  description: z.string().min(1, "La descripción es requerida"),
  topic: z.string().min(1, "El tema es requerido"),
  category: z.string().min(1, "La categoría es requerida"),
  programmingLangs: z.array(z.string()).default([]),
  requiredSkills: z.array(z.string()).default([]),
  visibility: z.nativeEnum(Visibility),
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

const commonLanguages = ["R", "Python", "Stata", "MATLAB", "Julia", "JavaScript", "Java", "C++", "SQL"];

export function ProjectForm({ projectId, initialData }: { projectId?: string; initialData?: Partial<ProjectFormData> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [programmingLangs, setProgrammingLangs] = useState<string[]>(initialData?.programmingLangs || []);
  const [requiredSkills, setRequiredSkills] = useState<string[]>(initialData?.requiredSkills || []);
  const [skillInput, setSkillInput] = useState("");

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
      githubRepoUrl: initialData?.githubRepoUrl || "",
      overleafProjectUrl: initialData?.overleafProjectUrl || "",
      programmingLangs: initialData?.programmingLangs || [],
      requiredSkills: initialData?.requiredSkills || [],
    },
  });

  const visibility = watch("visibility");

  const toggleLanguage = (lang: string) => {
    const newLangs = programmingLangs.includes(lang)
      ? programmingLangs.filter((l) => l !== lang)
      : [...programmingLangs, lang];
    setProgrammingLangs(newLangs);
    setValue("programmingLangs", newLangs);
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
          requiredSkills,
          visibility: data.visibility,
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
          requiredSkills,
          githubRepoUrl: data.githubRepoUrl || undefined,
          overleafProjectUrl: data.overleafProjectUrl || undefined,
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

