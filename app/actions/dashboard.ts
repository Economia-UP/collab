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

export async function getRecentProjects() {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const projects = await prisma.project.findMany({
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
      select: {
        id: true,
        title: true,
        shortSummary: true,
        status: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            members: {
              where: { status: "ACTIVE" },
            },
            tasks: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 10, // Increased from 6 to show more projects
    });

    return projects;
  } catch (error) {
    console.error("Error in getRecentProjects:", error);
    return [];
  }
}

export async function getPendingTasks() {
  const session = await requireAuth();
  const userId = session.user.id;

  const tasks = await prisma.task.findMany({
    where: {
      assigneeId: userId,
      status: {
        not: "DONE",
      },
    },
    include: {
      project: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: [
      {
        dueDate: "asc",
      },
      {
        priority: "desc",
      },
    ],
    take: 6,
  });

  return tasks;
}

export async function getNotifications() {
  const session = await requireAuth();
  const userId = session.user.id;

  // Get projects where user is owner (for member join requests)
  const ownedProjects = await prisma.project.findMany({
    where: { ownerId: userId },
    select: { id: true },
  });

  const ownedProjectIds = ownedProjects.map((p) => p.id);

  // Get member join requests for projects user owns
  const memberRequests = await prisma.projectMember.findMany({
    where: {
      projectId: {
        in: ownedProjectIds,
      },
      status: "PENDING",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
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
    take: 5,
  });

  // Get recent comments on user's projects
  const recentComments = await prisma.comment.findMany({
    where: {
      projectId: {
        in: ownedProjectIds,
      },
      authorId: {
        not: userId,
      },
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
    take: 5,
  });

  // Get recent tasks assigned to user
  const recentTasks = await prisma.task.findMany({
    where: {
      assigneeId: userId,
      status: {
        not: "DONE",
      },
    },
    include: {
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
    take: 5,
  });

  // Format notifications
  const notifications = [
    ...memberRequests.map((request) => ({
      id: `member-request-${request.id}`,
      type: "MEMBER_JOIN_REQUEST" as const,
      message: `${request.user.name || request.user.email} solicitó unirse a "${request.project.title}"`,
      createdAt: request.createdAt,
      project: request.project,
      user: {
        id: request.user.id,
        name: request.user.name,
        email: request.user.email,
        image: request.user.image,
      },
      data: {
        projectId: request.project.id,
        memberId: request.id,
      },
    })),
    ...recentComments.map((comment) => ({
      id: `comment-${comment.id}`,
      type: "COMMENT_ADDED" as const,
      message: `${comment.author.name || comment.author.email || "Alguien"} comentó en "${comment.project.title}"`,
      createdAt: comment.createdAt,
      project: comment.project,
      user: {
        id: comment.author.id,
        name: comment.author.name,
        email: comment.author.email,
        image: comment.author.image,
      },
      data: {
        projectId: comment.project.id,
        commentId: comment.id,
      },
    })),
    ...recentTasks.map((task) => ({
      id: `task-${task.id}`,
      type: "TASK_CREATED" as const,
      message: `Nueva tarea asignada: "${task.title}" en "${task.project.title}"`,
      createdAt: task.createdAt,
      project: task.project,
      user: {
        id: userId,
        name: null,
        email: null,
        image: null,
      },
      data: {
        projectId: task.project.id,
      },
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10);

  return notifications;
}

