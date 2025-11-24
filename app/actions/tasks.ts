"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { TaskStatus, TaskPriority, TaskType } from "@prisma/client";
import { sendNotification, NotificationTemplates } from "@/lib/notifications";

export async function getProjectTasks(projectId: string) {
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

  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return tasks;
}

export async function createTask(
  projectId: string,
  data: {
    title: string;
    description?: string;
    type?: TaskType;
    priority?: TaskPriority;
    assigneeId?: string;
    dueDate?: Date;
  }
) {
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

  const task = await prisma.task.create({
    data: {
      projectId,
      title: data.title,
      description: data.description,
      type: data.type || "TODO",
      priority: data.priority || "MEDIUM",
      assigneeId: data.assigneeId,
      dueDate: data.dueDate,
    },
  });

  await prisma.activityLog.create({
    data: {
      projectId,
      actorId: userId,
      type: "TASK_CREATED",
      message: `Tarea "${task.title}" creada`,
    },
  });

  // Send notification to assignee if task is assigned
  if (data.assigneeId && data.assigneeId !== userId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { title: true },
    });

    if (project) {
      const template = NotificationTemplates.taskAssigned(
        project.title,
        task.title,
        projectId,
        task.id
      );

      await sendNotification(data.assigneeId, {
        to: {},
        ...template,
      }).catch((error) => {
        console.error('Error sending task assignment notification:', error);
      });
    }
  }

  revalidatePath(`/projects/${projectId}`);

  return task;
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const session = await requireAuth();
  const userId = session.user.id;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        include: {
          members: {
            where: {
              userId,
              status: "ACTIVE",
            },
          },
        },
      },
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // Check access
  if (
    task.project.visibility === "PRIVATE" &&
    task.project.ownerId !== userId &&
    task.project.members.length === 0
  ) {
    throw new Error("Unauthorized");
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status },
  });

  await prisma.activityLog.create({
    data: {
      projectId: task.projectId,
      actorId: userId,
      type: "TASK_UPDATED",
      message: `Tarea "${task.title}" actualizada a ${status}`,
    },
  });

  revalidatePath(`/projects/${task.projectId}`);

  return updated;
}

