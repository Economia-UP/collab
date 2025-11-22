"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { validateGitHubRepo, parseGitHubUrl, fetchRepoMetadata } from "@/lib/github";

export async function connectGitHubRepo(projectId: string, repoUrl: string) {
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

  // Fetch metadata
  const metadata = await fetchRepoMetadata(parsed.owner, parsed.repo);

  // Update project
  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      githubRepoUrl: repoUrl,
      githubRepoName: parsed.repo,
      githubRepoOwner: parsed.owner,
      githubRepoData: metadata as any,
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
    select: { ownerId: true, githubRepoName: true, githubRepoOwner: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId !== userId && !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
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
      githubRepoData: null,
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

