"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addComment(projectId: string, content: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  // Check if user has access to project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        where: {
          userId,
          status: "ACTIVE",
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Only allow comments if project is public or user is owner/member
  if (
    project.visibility === "PRIVATE" &&
    project.ownerId !== userId &&
    project.members.length === 0
  ) {
    throw new Error("Unauthorized");
  }

  const comment = await prisma.comment.create({
    data: {
      projectId,
      authorId: userId,
      content,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  await prisma.activityLog.create({
    data: {
      projectId,
      actorId: userId,
      type: "COMMENT_ADDED",
      message: `Comentario agregado`,
    },
  });

  revalidatePath(`/projects/${projectId}`);

  return comment;
}

export async function getComments(projectId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  // Check access
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        where: {
          userId,
          status: "ACTIVE",
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (
    project.visibility === "PRIVATE" &&
    project.ownerId !== userId &&
    project.members.length === 0
  ) {
    throw new Error("Unauthorized");
  }

  const comments = await prisma.comment.findMany({
    where: { projectId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return comments;
}

