"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  executeN8NWorkflow,
  triggerN8NWebhook,
  getN8NWorkflow,
  listN8NWorkflows,
  isN8NConfigured,
  checkN8NAvailability,
} from "@/lib/n8n-client";

/**
 * Trigger a workflow when a member is added to a project
 * This can automate folder sharing, notifications, etc.
 */
export async function triggerMemberAddedWorkflow(
  projectId: string,
  userId: string,
  email: string
) {
  if (!isN8NConfigured()) {
    console.log("n8n not configured, skipping workflow trigger");
    return;
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        title: true,
        googleDriveFolderId: true,
        dropboxFolderId: true,
        owner: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!project) {
      return;
    }

    // Trigger webhook for member added event
    await triggerN8NWebhook("member-added", {
      projectId: project.id,
      projectTitle: project.title,
      userId,
      userEmail: email,
      ownerEmail: project.owner.email,
      ownerName: project.owner.name,
      googleDriveFolderId: project.googleDriveFolderId,
      dropboxFolderId: project.dropboxFolderId,
    });
  } catch (error) {
    console.error("Failed to trigger n8n workflow for member added:", error);
    // Don't throw - workflow failures shouldn't break the main flow
  }
}

/**
 * Trigger a workflow when a task is created
 */
export async function triggerTaskCreatedWorkflow(
  projectId: string,
  taskId: string,
  taskTitle: string,
  assigneeEmail?: string
) {
  if (!isN8NConfigured()) {
    return;
  }

  try {
    await triggerN8NWebhook("task-created", {
      projectId,
      taskId,
      taskTitle,
      assigneeEmail,
    });
  } catch (error) {
    console.error("Failed to trigger n8n workflow for task created:", error);
  }
}

/**
 * Trigger a workflow when a comment is added
 */
export async function triggerCommentAddedWorkflow(
  projectId: string,
  commentId: string,
  authorEmail: string,
  commentPreview: string
) {
  if (!isN8NConfigured()) {
    return;
  }

  try {
    await triggerN8NWebhook("comment-added", {
      projectId,
      commentId,
      authorEmail,
      commentPreview,
    });
  } catch (error) {
    console.error("Failed to trigger n8n workflow for comment added:", error);
  }
}

/**
 * Get n8n status and available workflows
 */
export async function getN8NStatus() {
  const session = await requireAuth();
  
  if (!isAdmin(session.user.role)) {
    throw new Error("Unauthorized - Admin access required");
  }

  const configured = isN8NConfigured();
  let available = false;
  let workflows: any[] = [];

  if (configured) {
    try {
      available = await checkN8NAvailability();
      if (available) {
        workflows = await listN8NWorkflows();
      }
    } catch (error) {
      console.error("Failed to check n8n status:", error);
    }
  }

  return {
    configured,
    available,
    workflows,
  };
}

