"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ProjectStatus, Visibility } from "@prisma/client";
import { createProjectGoogleDriveFolder } from "@/app/actions/google-drive";
import { createProjectDropboxFolder } from "@/app/actions/dropbox";

export async function createProject(data: {
  title: string;
  shortSummary: string;
  description: string;
  topic: string;
  category: string;
  programmingLangs: string[];
  libraries?: string[];
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
      libraries: data.libraries || [],
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

  // Create Google Drive folder if user has Google Drive connected
  try {
    const owner = await prisma.user.findUnique({
      where: { id: userId },
      select: { googleDriveAccessToken: true, dropboxAccessToken: true },
    });

    if (owner?.googleDriveAccessToken) {
      await createProjectGoogleDriveFolder(project.id);
    }

    // Create Dropbox folder if user has Dropbox connected
    if (owner?.dropboxAccessToken) {
      await createProjectDropboxFolder(project.id);
    }
  } catch (error) {
    console.error("Failed to create cloud storage folder:", error);
    // Don't fail project creation if folder creation fails
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
    libraries?: string[];
    requiredSkills?: string[];
    visibility?: Visibility;
    status?: ProjectStatus;
  }
) {
  const session = await requireAuth();
  const userId = session.user.id;

  // Check ownership, co-ownership, membership, or admin
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        where: {
          userId,
          status: "ACTIVE",
        },
        select: {
          role: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const isOwner = project.ownerId === userId;
  const isCoOwner = project.members.some(m => m.role === "PI");
  const isCollaborator = project.members.some(m => m.role === "CO_AUTHOR");
  const isAdminUser = isAdmin(session.user.role);

  // Allow update if: owner, co-owner (PI), collaborator (CO_AUTHOR), or admin
  if (!isOwner && !isCoOwner && !isCollaborator && !isAdminUser) {
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
    include: {
      members: {
        where: {
          userId,
          status: "ACTIVE",
        },
        select: {
          role: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const isOwner = project.ownerId === userId;
  const isCoOwner = project.members.some(m => m.role === "PI");
  const isAdminUser = isAdmin(session.user.role);

  // Only owner, co-owner (PI), or admin can delete
  if (!isOwner && !isCoOwner && !isAdminUser) {
    throw new Error("Unauthorized: Solo el propietario o co-propietario pueden eliminar el proyecto");
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
  marketplace?: boolean; // If true, only show public projects (marketplace mode)
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

  // MARKETPLACE MODE: Show ALL public projects without any restrictions
  // This mode ignores user authentication and ownership - shows all PUBLIC projects
  if (filters?.marketplace) {
    // Base requirement: must be PUBLIC
    where.visibility = "PUBLIC";

    // Add optional filters as AND conditions
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

    // In marketplace mode, we don't care about ownership or membership
    // Just show all public projects that match the filters
  } else if (!userId) {
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
    // Admin with visibility filter (only if not in marketplace mode)
    where.visibility = filters.visibility;
  }

  // Apply other filters for non-marketplace mode
  if (!filters?.marketplace) {
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
      // Search condition
      const searchCondition = {
        OR: [
          { title: { contains: filters.search, mode: "insensitive" } },
          { shortSummary: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
        ],
      };

      // If we have OR condition, combine with AND
      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          searchCondition,
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
  }

  // Check if DATABASE_URL is available or database is not reachable
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
    // Debug: Log the where clause in marketplace mode
    if (filters?.marketplace) {
      console.log("[MARKETPLACE] Query filter:", JSON.stringify(where, null, 2));
      console.log("[MARKETPLACE] Mode: Showing ALL public projects (ignoring ownership/membership)");
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
        // In marketplace mode, include membership info if user is logged in (for UI display)
        // But don't filter by it
        members: userId ? {
          where: {
            userId,
          },
          select: {
            status: true,
            role: true,
          },
        } : false,
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

    // Debug: Log results in marketplace mode
    if (filters?.marketplace) {
      console.log(`[MARKETPLACE] Found ${projects.length} public projects`);
      if (projects.length > 0) {
        projects.slice(0, 5).forEach((p: any) => {
          console.log(`  - "${p.title}" (visibility: ${p.visibility}, owner: ${p.owner?.email || 'unknown'})`);
        });
        if (projects.length > 5) {
          console.log(`  ... and ${projects.length - 5} more`);
        }
      } else {
        console.log("[MARKETPLACE] No public projects found. Checking database...");
        // Check if there are any public projects at all
        try {
          const publicCount = await prisma.project.count({
            where: { visibility: "PUBLIC" },
          });
          const totalCount = await prisma.project.count();
          console.log(`[MARKETPLACE DEBUG] Total projects: ${totalCount}, Public projects: ${publicCount}`);
        } catch (e) {
          console.error("[MARKETPLACE DEBUG] Error checking project counts:", e);
        }
      }
    }

    // Add membership info to each project
    const projectsWithMembership = projects.map((project: any) => {
      const userMembership = project.members?.[0] || null;
      const isOwner = project.ownerId === userId;
      const isMember = userMembership?.status === "ACTIVE";
      const hasPendingRequest = userMembership?.status === "PENDING";
      
      return {
        ...project,
        isOwner,
        isMember,
        hasPendingRequest,
        membershipStatus: userMembership?.status || null,
        membershipRole: userMembership?.role || null,
      };
    });

    return projectsWithMembership;
  } catch (error: any) {
    // Check if it's a connection error
    if (
      error?.message?.includes("Can't reach database") ||
      error?.message?.includes("connect ECONNREFUSED") ||
      error?.code === "P1001"
    ) {
      console.warn("Database not available - returning empty projects list");
      return [];
    }
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
    include: {
      members: {
        where: {
          userId,
          status: "ACTIVE",
        },
        select: {
          role: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const isOwner = project.ownerId === userId;
  const isCoOwner = project.members.some(m => m.role === "PI");
  const isAdminUser = isAdmin(session.user.role);

  // Owner, co-owner (PI), or admin can change status
  if (!isOwner && !isCoOwner && !isAdminUser) {
    throw new Error("Unauthorized: Solo el propietario o co-propietario pueden cambiar el estado");
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
    include: {
      members: {
        where: {
          userId,
          status: "ACTIVE",
        },
        select: {
          role: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const isOwner = project.ownerId === userId;
  const isCoOwner = project.members.some(m => m.role === "PI");
  const isAdminUser = isAdmin(session.user.role);

  // Owner, co-owner (PI), or admin can toggle visibility
  if (!isOwner && !isCoOwner && !isAdminUser) {
    throw new Error("Unauthorized: Solo el propietario o co-propietario pueden cambiar la visibilidad");
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

