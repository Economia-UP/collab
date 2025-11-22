"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { validateOverleafUrl, parseOverleafUrl, fetchProjectMetadata } from "@/lib/overleaf";

export async function connectOverleafProject(projectId: string, projectUrl: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  // Validate URL
  if (!validateOverleafUrl(projectUrl)) {
    throw new Error("URL de Overleaf inválida. Debe ser: https://www.overleaf.com/project/...");
  }

  const projectIdFromUrl = parseOverleafUrl(projectUrl);
  if (!projectIdFromUrl) {
    throw new Error("No se pudo parsear la URL de Overleaf");
  }

  // Check ownership
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, title: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId !== userId && !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  // Fetch metadata (placeholder - would need Overleaf API)
  const metadata = await fetchProjectMetadata(projectIdFromUrl);

  // Update project
  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      overleafProjectUrl: projectUrl,
      overleafProjectId: projectIdFromUrl,
      overleafProjectData: metadata as any,
    },
  });

  await prisma.activityLog.create({
    data: {
      projectId,
      actorId: userId,
      type: "OVERLEAF_PROJECT_CONNECTED",
      message: `Proyecto de Overleaf conectado`,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");

  return updated;
}

export async function disconnectOverleafProject(projectId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId !== userId && !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      overleafProjectUrl: null,
      overleafProjectId: null,
      overleafProjectData: null,
    },
  });

  await prisma.activityLog.create({
    data: {
      projectId,
      actorId: userId,
      type: "OVERLEAF_PROJECT_DISCONNECTED",
      message: `Proyecto de Overleaf desconectado`,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");

  return { success: true };
}

export async function syncOverleafProjectData(projectId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      overleafProjectId: true,
    },
  });

  if (!project || !project.overleafProjectId) {
    throw new Error("Project or Overleaf project not found");
  }

  if (project.ownerId !== userId && !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const metadata = await fetchProjectMetadata(project.overleafProjectId);

  await prisma.project.update({
    where: { id: projectId },
    data: {
      overleafProjectData: metadata as any,
    },
  });

  revalidatePath(`/projects/${projectId}`);

  return { success: true };
}

