"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Search } from "lucide-react";
import { ProjectStatus } from "@prisma/client";
import { useState, useEffect } from "react";

const statuses: ProjectStatus[] = [
  "DRAFT",
  "PLANNING",
  "DATA_COLLECTION",
  "ANALYSIS",
  "WRITING",
  "REVIEW",
  "COMPLETED",
  "ARCHIVED",
];

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

export function ProjectsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch by only rendering Select after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentSearch = searchParams.get("search") || "";
  const currentTopic = searchParams.get("topic") || "all";
  const currentCategory = searchParams.get("category") || "all";
  const currentStatuses = searchParams.getAll("status") as ProjectStatus[];
  const hasGithub = searchParams.get("hasGithub") === "true";
  const hasOverleaf = searchParams.get("hasOverleaf") === "true";

  const updateSearchParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/projects?${params.toString()}`);
  };

  const toggleStatus = (status: ProjectStatus) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll("status");
    if (current.includes(status)) {
      params.delete("status");
      current.filter((s) => s !== status).forEach((s) => params.append("status", s));
    } else {
      params.append("status", status);
    }
    router.push(`/projects?${params.toString()}`);
  };

  const toggleFilter = (key: "hasGithub" | "hasOverleaf") => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key) === "true";
    if (current) {
      params.delete(key);
    } else {
      params.set(key, "true");
    }
    router.push(`/projects?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/projects");
  };

  return (
    <motion.div {...fadeInUp}>
      <Card>
        <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, descripción, tema..."
              value={currentSearch}
              onChange={(e) => updateSearchParams("search", e.target.value || null)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  updateSearchParams("search", currentSearch || null);
                }
              }}
              className="pl-9"
            />
          </div>

          {/* Dropdowns */}
          <div className="grid gap-4 md:grid-cols-2">
            {mounted ? (
              <Select
                value={currentTopic}
                onValueChange={(value) => updateSearchParams("topic", value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los temas</SelectItem>
                  {topics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm flex items-center">
                <span className="text-muted-foreground">Tema</span>
              </div>
            )}

            {mounted ? (
              <Select
                value={currentCategory}
                onValueChange={(value) => updateSearchParams("category", value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm flex items-center">
                <span className="text-muted-foreground">Categoría</span>
              </div>
            )}
          </div>

          {/* Status Chips */}
          <div>
            <label className="text-sm font-medium mb-2 block">Estado</label>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => {
                const isSelected = currentStatuses.includes(status);
                return (
                  <Badge
                    key={status}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleStatus(status)}
                  >
                    {status.replace("_", " ")}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Integration Filters */}
          <div className="flex gap-2">
            <Button
              variant={hasGithub ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter("hasGithub")}
            >
              Con GitHub
            </Button>
            <Button
              variant={hasOverleaf ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter("hasOverleaf")}
            >
              Con Overleaf
            </Button>
          </div>

          {/* Active Filters */}
          {(currentSearch ||
            currentTopic ||
            currentCategory ||
            currentStatuses.length > 0 ||
            hasGithub ||
            hasOverleaf) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Filtros activos:</span>
              {currentSearch && (
                <Badge variant="secondary" className="gap-1">
                  Búsqueda: {currentSearch}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateSearchParams("search", null)}
                  />
                </Badge>
              )}
              {currentTopic && (
                <Badge variant="secondary" className="gap-1">
                  {currentTopic}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateSearchParams("topic", null)}
                  />
                </Badge>
              )}
              {currentCategory && (
                <Badge variant="secondary" className="gap-1">
                  {currentCategory}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateSearchParams("category", null)}
                  />
                </Badge>
              )}
              {currentStatuses.map((status) => (
                <Badge key={status} variant="secondary" className="gap-1">
                  {status.replace("_", " ")}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleStatus(status)}
                  />
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpiar todo
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}

