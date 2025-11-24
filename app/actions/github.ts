"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { requireAuth, isAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { validateGitHubRepo, parseGitHubUrl, fetchRepoMetadata } from "@/lib/github";
import {
  getGitHubRepos,
  createGitHubWebhook,
  deleteGitHubWebhook,
  addGitHubCollaborator,
  removeGitHubCollaboratorFromRepo,
  createGitHubIssue,
} from "@/lib/github-client";
import crypto from "crypto";

export async function connectGitHubRepo(
  projectId: string,
  repoUrl: string,
  setupWebhook: boolean = true
) {
  const session = await requireAuth();
  const userId = session.user.id;

  // Validate URL
  if (!validateGitHubRepo(repoUrl)) {
    throw new Error("URL de GitHub inválida. Debe ser: https://github.com/owner/repo");
  }

  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    throw new Error("No se pudo parsear la URL de GitHub");
  }

  // Check ownership
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, title: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId !== userId && !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  // Get user's GitHub token
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { githubAccessToken: true },
  });

  // Fetch metadata
  const metadata = await fetchRepoMetadata(parsed.owner, parsed.repo);

  // Generate webhook secret
  const webhookSecret = crypto.randomBytes(32).toString("hex");
  const webhookUrl = `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"}/api/webhooks/github`;

  let webhookId: string | null = null;

  // Setup webhook if user has GitHub token and setupWebhook is true
  if (setupWebhook && user?.githubAccessToken) {
    try {
      const webhook = await createGitHubWebhook(
        user.githubAccessToken,
        parsed.owner,
        parsed.repo,
        webhookUrl,
        webhookSecret
      );
      webhookId = webhook.id.toString();
    } catch (error) {
      console.error("Failed to create webhook:", error);
      // Continue without webhook if it fails
    }
  }

  // Update project
  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      githubRepoUrl: repoUrl,
      githubRepoName: parsed.repo,
      githubRepoOwner: parsed.owner,
      githubRepoData: metadata as any,
      githubWebhookId: webhookId,
      githubWebhookSecret: webhookSecret,
    },
  });

  await prisma.activityLog.create({
    data: {
      projectId,
      actorId: userId,
      type: "GITHUB_REPO_CONNECTED",
      message: `Repositorio de GitHub conectado: ${parsed.owner}/${parsed.repo}`,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");

  return updated;
}

export async function disconnectGitHubRepo(projectId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      githubRepoName: true,
      githubRepoOwner: true,
      githubWebhookId: true,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId !== userId && !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  // Delete webhook if exists
  if (project.githubWebhookId && project.githubRepoOwner && project.githubRepoName) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { githubAccessToken: true },
    });

    if (user?.githubAccessToken) {
      try {
        await deleteGitHubWebhook(
          user.githubAccessToken,
          project.githubRepoOwner,
          project.githubRepoName,
          parseInt(project.githubWebhookId)
        );
      } catch (error) {
        console.error("Failed to delete webhook:", error);
        // Continue even if webhook deletion fails
      }
    }
  }

  const repoInfo = project.githubRepoName && project.githubRepoOwner
    ? `${project.githubRepoOwner}/${project.githubRepoName}`
    : "repositorio";

  await prisma.project.update({
    where: { id: projectId },
    data: {
      githubRepoUrl: null,
      githubRepoName: null,
      githubRepoOwner: null,
      githubRepoData: Prisma.JsonNull,
      githubWebhookId: null,
      githubWebhookSecret: null,
    },
  });

  await prisma.activityLog.create({
    data: {
      projectId,
      actorId: userId,
      type: "GITHUB_REPO_DISCONNECTED",
      message: `Repositorio de GitHub desconectado: ${repoInfo}`,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");

  return { success: true };
}

export async function syncGitHubRepoData(projectId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      githubRepoOwner: true,
      githubRepoName: true,
    },
  });

  if (!project || !project.githubRepoOwner || !project.githubRepoName) {
    throw new Error("Project or GitHub repo not found");
  }

  if (project.ownerId !== userId && !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const metadata = await fetchRepoMetadata(project.githubRepoOwner, project.githubRepoName);

  await prisma.project.update({
    where: { id: projectId },
    data: {
      githubRepoData: metadata as any,
    },
  });

  revalidatePath(`/projects/${projectId}`);

  return { success: true };
}

export async function getGitHubReposForUser() {
  const session = await requireAuth();
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { githubAccessToken: true },
  });

  if (!user?.githubAccessToken) {
    throw new Error("GitHub no conectado. Por favor conecta tu cuenta de GitHub primero.");
  }

  return await getGitHubRepos(user.githubAccessToken);
}

export async function inviteGitHubCollaborator(
  projectId: string,
  githubUsername: string,
  permission: "pull" | "push" | "admin" = "push"
) {
  const session = await requireAuth();
  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      githubRepoOwner: true,
      githubRepoName: true,
    },
  });

  if (!project || !project.githubRepoOwner || !project.githubRepoName) {
    throw new Error("Project or GitHub repo not found");
  }

  if (project.ownerId !== userId && !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { githubAccessToken: true },
  });

  if (!user?.githubAccessToken) {
    throw new Error("GitHub no conectado. Por favor conecta tu cuenta de GitHub primero.");
  }

  await addGitHubCollaborator(
    user.githubAccessToken,
    project.githubRepoOwner,
    project.githubRepoName,
    githubUsername,
    permission
  );

  await prisma.activityLog.create({
    data: {
      projectId,
      actorId: userId,
      type: "MEMBER_APPROVED",
      message: `${githubUsername} agregado como colaborador en GitHub`,
    },
  });

  revalidatePath(`/projects/${projectId}`);

  return { success: true };
}

export async function removeGitHubCollaborator(
  projectId: string,
  githubUsername: string
) {
  const session = await requireAuth();
  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      githubRepoOwner: true,
      githubRepoName: true,
    },
  });

  if (!project || !project.githubRepoOwner || !project.githubRepoName) {
    throw new Error("Project or GitHub repo not found");
  }

  if (project.ownerId !== userId && !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { githubAccessToken: true },
  });

  if (!user?.githubAccessToken) {
    throw new Error("GitHub no conectado. Por favor conecta tu cuenta de GitHub primero.");
  }

  await removeGitHubCollaboratorFromRepo(
    user.githubAccessToken,
    project.githubRepoOwner,
    project.githubRepoName,
    githubUsername
  );

  await prisma.activityLog.create({
    data: {
      projectId,
      actorId: userId,
      type: "MEMBER_REJECTED",
      message: `${githubUsername} removido como colaborador en GitHub`,
    },
  });

  revalidatePath(`/projects/${projectId}`);

  return { success: true };
}

export async function createGitHubIssueForProject(
  projectId: string,
  title: string,
  body?: string,
  labels?: string[]
) {
  const session = await requireAuth();
  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      githubRepoOwner: true,
      githubRepoName: true,
    },
  });

  if (!project || !project.githubRepoOwner || !project.githubRepoName) {
    throw new Error("Project or GitHub repo not found");
  }

  if (project.ownerId !== userId && !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { githubAccessToken: true },
  });

  if (!user?.githubAccessToken) {
    throw new Error("GitHub no conectado. Por favor conecta tu cuenta de GitHub primero.");
  }

  const issue = await createGitHubIssue(
    user.githubAccessToken,
    project.githubRepoOwner,
    project.githubRepoName,
    title,
    body,
    labels
  );

  await prisma.activityLog.create({
    data: {
      projectId,
      actorId: userId,
      type: "GITHUB_ISSUE_CREATED",
      message: `Issue creado: ${title} (#${issue.number})`,
    },
  });

  revalidatePath(`/projects/${projectId}`);

  return issue;
}
