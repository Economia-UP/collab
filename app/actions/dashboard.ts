"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function getDashboardStats() {
  const session = await requireAuth();
  const userId = session.user.id;

  const [ownedProjects, memberProjects, assignedTasks] = await Promise.all([
    prisma.project.count({
      where: { ownerId: userId },
    }),
    prisma.projectMember.count({
      where: {
        userId,
        status: "ACTIVE",
      },
    }),
    prisma.task.count({
      where: {
        assigneeId: userId,
        status: {
          not: "DONE",
        },
      },
    }),
  ]);

  return {
    ownedProjects,
    memberProjects,
    assignedTasks,
  };
}

export async function getRecentActivity() {
  const session = await requireAuth();
  const userId = session.user.id;

  // Get projects where user is owner or member
  const userProjects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              userId,
              status: "ACTIVE",
            },
          },
        },
      ],
    },
    select: { id: true },
  });

  const projectIds = userProjects.map((p: { id: string }) => p.id);

  const activities = await prisma.activityLog.findMany({
    where: {
      projectId: {
        in: projectIds,
      },
    },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      project: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  return activities;
}

