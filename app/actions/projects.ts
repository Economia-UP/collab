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
  inviteEmails?: string[];
  coOwners?: string[];
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
      status: data.status || "PLANNING",
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

  // Add co-owners and invited members
  if (data.coOwners && data.coOwners.length > 0) {
    for (const email of data.coOwners) {
      if (!email || !email.endsWith("@up.edu.mx")) continue;
      
      const user = await prisma.user.findUnique({
        where: { email: email.trim() },
      });

      if (user && user.id !== userId) {
        await prisma.projectMember.upsert({
          where: {
            projectId_userId: {
              projectId: project.id,
              userId: user.id,
            },
          },
          update: {
            status: "ACTIVE",
            role: "PI", // Principal Investigator (co-owner)
          },
          create: {
            projectId: project.id,
            userId: user.id,
            status: "ACTIVE",
            role: "PI",
          },
        });
      }
    }
  }

  // Add invited members
  if (data.inviteEmails && data.inviteEmails.length > 0) {
    for (const email of data.inviteEmails) {
      if (!email || !email.endsWith("@up.edu.mx")) continue;
      
      const user = await prisma.user.findUnique({
        where: { email: email.trim() },
      });

      if (user && user.id !== userId) {
        // Check if already added as co-owner
        const existing = await prisma.projectMember.findUnique({
          where: {
            projectId_userId: {
              projectId: project.id,
              userId: user.id,
            },
          },
        });

        if (!existing) {
          await prisma.projectMember.create({
            data: {
              projectId: project.id,
              userId: user.id,
              status: "ACTIVE",
              role: "CO_AUTHOR",
            },
          });
        }
      }
    }
  }

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
  // Try to get session, but don't require it (for public projects page)
  let session = null;
  let userId: string | null = null;
  let isUserAdmin = false;
  
  try {
    const authSession = await requireAuth();
    session = authSession;
    userId = authSession.user.id;
    isUserAdmin = isAdmin(authSession.user.role);
  } catch (error) {
    // No session - user is not authenticated, can only see public projects
    session = null;
    userId = null;
    isUserAdmin = false;
  }

  const where: any = {};

  // Visibility filter
  if (!userId) {
    // No authenticated user - only show public projects
    where.visibility = "PUBLIC";
  } else if (!isUserAdmin) {
    // Authenticated but not admin - show public, owned, or member projects
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
    // Admin with visibility filter
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
    // If we already have an OR condition, we need to combine it with search
    if (where.OR) {
      where.AND = [
        { OR: where.OR },
        {
          OR: [
            { title: { contains: filters.search, mode: "insensitive" } },
            { shortSummary: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
          ],
        },
      ];
      delete where.OR;
    } else {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { shortSummary: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }
  }

  if (filters?.hasGithub) {
    where.githubRepoUrl = { not: null };
  }

  if (filters?.hasOverleaf) {
    where.overleafProjectUrl = { not: null };
  }

  // Check if DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    // Return dummy data when DATABASE_URL is not available
    const dummyProjects = [
      {
        id: "1",
        title: "Análisis de Datos Económicos con R",
        shortSummary: "Investigación sobre tendencias económicas usando modelos estadísticos avanzados",
        topic: filters?.topic || "Economía",
        category: filters?.category || "Tesis",
        status: "ANALYSIS" as ProjectStatus,
        visibility: "PUBLIC" as Visibility,
        programmingLangs: ["R", "Python"],
        requiredSkills: ["Estadística", "Econometría"],
        githubRepoUrl: "https://github.com/example/project1",
        overleafProjectUrl: null,
        ownerId: "dummy-user-1",
        owner: {
          id: "dummy-user-1",
          name: "Dr. Juan Pérez",
          email: "juan.perez@up.edu.mx",
          image: null,
          role: "PROFESSOR" as const,
        },
        _count: {
          members: 3,
          comments: 5,
          tasks: 8,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        title: "Machine Learning en Medicina",
        shortSummary: "Aplicación de algoritmos de ML para diagnóstico temprano",
        topic: filters?.topic || "Medicina",
        category: filters?.category || "Paper",
        status: "DATA_COLLECTION" as ProjectStatus,
        visibility: "PUBLIC" as Visibility,
        programmingLangs: ["Python"],
        requiredSkills: ["Machine Learning", "Python", "TensorFlow"],
        githubRepoUrl: "https://github.com/example/project2",
        overleafProjectUrl: "https://www.overleaf.com/project/123",
        ownerId: "dummy-user-2",
        owner: {
          id: "dummy-user-2",
          name: "Dra. María González",
          email: "maria.gonzalez@up.edu.mx",
          image: null,
          role: "PROFESSOR" as const,
        },
        _count: {
          members: 5,
          comments: 12,
          tasks: 15,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "3",
        title: "Estudio de Mercado Financiero",
        shortSummary: "Análisis de volatilidad en mercados emergentes",
        topic: filters?.topic || "Finanzas",
        category: filters?.category || "Grant",
        status: "WRITING" as ProjectStatus,
        visibility: "PUBLIC" as Visibility,
        programmingLangs: ["Stata", "R"],
        requiredSkills: ["Finanzas", "Análisis de datos"],
        githubRepoUrl: null,
        overleafProjectUrl: null,
        ownerId: "dummy-user-3",
        owner: {
          id: "dummy-user-3",
          name: "Dr. Carlos Rodríguez",
          email: "carlos.rodriguez@up.edu.mx",
          image: null,
          role: "PROFESSOR" as const,
        },
        _count: {
          members: 2,
          comments: 3,
          tasks: 6,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Apply filters to dummy data
    let filtered = dummyProjects;
    if (filters?.topic) {
      filtered = filtered.filter(p => p.topic === filters.topic);
    }
    if (filters?.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    if (filters?.status && filters.status.length > 0) {
      filtered = filtered.filter(p => filters.status!.includes(p.status));
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.shortSummary.toLowerCase().includes(searchLower)
      );
    }
    if (filters?.hasGithub) {
      filtered = filtered.filter(p => p.githubRepoUrl !== null);
    }
    if (filters?.hasOverleaf) {
      filtered = filtered.filter(p => p.overleafProjectUrl !== null);
    }

    return filtered as any;
  }

  try {
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
  } catch (error) {
    console.error("Error fetching projects from database:", error);
    // Return empty array if database query fails
    return [];
  }
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
    !project.members.some((m: { userId: string; status: string }) => m.userId === userId && m.status === "ACTIVE")
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

