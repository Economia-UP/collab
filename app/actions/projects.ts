"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ProjectStatus, Visibility } from "@prisma/client";

export async function createProject(data: {
  title: string;
  shortSummary: string;
  description: string;
  topic: string;
  category: string;
  programmingLangs: string[];
  requiredSkills: string[];
  visibility: Visibility;
  status?: ProjectStatus;
  githubRepoUrl?: string;
  overleafProjectUrl?: string;
}) {
  const session = await requireAuth();
  const userId = session.user.id;

  const project = await prisma.project.create({
    data: {
      title: data.title,
      shortSummary: data.shortSummary,
      description: data.description,
      topic: data.topic,
      category: data.category,
      programmingLangs: data.programmingLangs,
      requiredSkills: data.requiredSkills,
      visibility: data.visibility,
      status: data.status || "DRAFT",
      ownerId: userId,
      githubRepoUrl: data.githubRepoUrl,
      overleafProjectUrl: data.overleafProjectUrl,
    },
  });

  // Create activity log
  await prisma.activityLog.create({
    data: {
      projectId: project.id,
      actorId: userId,
      type: "PROJECT_CREATED",
      message: `Proyecto "${project.title}" creado`,
    },
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/my-projects");

  return project;
}

export async function updateProject(
  projectId: string,
  data: {
    title?: string;
    shortSummary?: string;
    description?: string;
    topic?: string;
    category?: string;
    programmingLangs?: string[];
    requiredSkills?: string[];
    visibility?: Visibility;
    status?: ProjectStatus;
  }
) {
  const session = await requireAuth();
  const userId = session.user.id;

  // Check ownership or admin
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

  const updated = await prisma.project.update({
    where: { id: projectId },
    data,
  });

  await prisma.activityLog.create({
    data: {
      projectId,
      actorId: userId,
      type: "PROJECT_UPDATED",
      message: `Proyecto "${updated.title}" actualizado`,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  revalidatePath("/dashboard");

  return updated;
}

export async function deleteProject(projectId: string) {
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

  await prisma.project.delete({
    where: { id: projectId },
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/my-projects");

  return { success: true };
}

export async function getProjects(filters?: {
  topic?: string;
  category?: string;
  status?: ProjectStatus[];
  visibility?: Visibility;
  search?: string;
  hasGithub?: boolean;
  hasOverleaf?: boolean;
}) {
  const session = await requireAuth();
  const userId = session.user.id;
  const isUserAdmin = isAdmin(session.user.role);

  const where: any = {};

  // Visibility filter
  if (!isUserAdmin) {
    where.OR = [
      { visibility: "PUBLIC" },
      { ownerId: userId },
      {
        members: {
          some: {
            userId,
            status: "ACTIVE",
          },
        },
      },
    ];
  } else if (filters?.visibility) {
    where.visibility = filters.visibility;
  }

  if (filters?.topic) {
    where.topic = filters.topic;
  }

  if (filters?.category) {
    where.category = filters.category;
  }

  if (filters?.status && filters.status.length > 0) {
    where.status = { in: filters.status };
  }

  if (filters?.search) {
    where.OR = [
      ...(where.OR || []),
      { title: { contains: filters.search, mode: "insensitive" } },
      { shortSummary: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters?.hasGithub) {
    where.githubRepoUrl = { not: null };
  }

  if (filters?.hasOverleaf) {
    where.overleafProjectUrl = { not: null };
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      },
      _count: {
        select: {
          members: {
            where: { status: "ACTIVE" },
          },
          comments: true,
          tasks: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return projects;
}

export async function getProjectById(projectId: string) {
  const session = await requireAuth();
  const userId = session.user.id;
  const isUserAdmin = isAdmin(session.user.role);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      _count: {
        select: {
          comments: true,
          tasks: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Check visibility
  if (
    project.visibility === "PRIVATE" &&
    project.ownerId !== userId &&
    !isUserAdmin &&
    !project.members.some((m) => m.userId === userId && m.status === "ACTIVE")
  ) {
    throw new Error("Unauthorized");
  }

  return project;
}

export async function changeProjectStatus(
  projectId: string,
  status: ProjectStatus
) {
  const session = await requireAuth();
  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, status: true, title: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId !== userId && !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { status },
  });

  await prisma.activityLog.create({
    data: {
      projectId,
      actorId: userId,
      type: "STATUS_CHANGED",
      message: `Estado cambiado de ${project.status} a ${status}`,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");

  return updated;
}

export async function toggleVisibility(projectId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, visibility: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId !== userId && !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const newVisibility = project.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { visibility: newVisibility },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");

  return updated;
}

