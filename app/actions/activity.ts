"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function getActivityLogs(projectId: string) {
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

  const activities = await prisma.activityLog.findMany({
    where: { projectId },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return activities;
}

