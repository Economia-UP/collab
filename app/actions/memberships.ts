"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { MembershipStatus } from "@prisma/client";

export async function requestMembership(projectId: string, message?: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId === userId) {
    throw new Error("Ya eres el propietario de este proyecto");
  }

  // Check if already a member
  const existing = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (existing && existing.status === "ACTIVE") {
    throw new Error("Ya eres miembro de este proyecto");
  }

  if (existing && existing.status === "PENDING") {
    throw new Error("Ya tienes una solicitud pendiente");
  }

  // Create or update membership request
  const membership = await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
    update: {
      status: "PENDING",
    },
    create: {
      projectId,
      userId,
      status: "PENDING",
      role: "ASSISTANT",
    },
  });

  await prisma.activityLog.create({
    data: {
      projectId,
      actorId: userId,
      type: "MEMBER_JOIN_REQUEST",
      message: message || "Solicitud de membresía",
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/my-projects");

  return membership;
}

export async function approveMembership(projectId: string, userId: string) {
  const session = await requireAuth();
  const currentUserId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId !== currentUserId && !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const membership = await prisma.projectMember.update({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
    data: {
      status: "ACTIVE",
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  await prisma.activityLog.create({
    data: {
      projectId,
      actorId: currentUserId,
      type: "MEMBER_APPROVED",
      message: `${membership.user.name || "Usuario"} se unió al proyecto`,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/my-projects");

  return membership;
}

export async function rejectMembership(projectId: string, userId: string) {
  const session = await requireAuth();
  const currentUserId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId !== currentUserId && !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const membership = await prisma.projectMember.update({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
    data: {
      status: "REJECTED",
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  await prisma.activityLog.create({
    data: {
      projectId,
      actorId: currentUserId,
      type: "MEMBER_REJECTED",
      message: `Solicitud de ${membership.user.name || "usuario"} rechazada`,
    },
  });

  revalidatePath(`/projects/${projectId}`);

  return membership;
}

export async function removeMember(projectId: string, userId: string) {
  const session = await requireAuth();
  const currentUserId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId !== currentUserId && !isAdmin(session.user.role) && userId !== currentUserId) {
    throw new Error("Unauthorized");
  }

  await prisma.projectMember.update({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
    data: {
      status: "LEFT",
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/my-projects");

  return { success: true };
}

export async function getProjectMembers(projectId: string) {
  const session = await requireAuth();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
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
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return project.members;
}

