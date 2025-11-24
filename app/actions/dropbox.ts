"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  createDropboxFolder,
  shareDropboxFolder,
  revokeDropboxAccess,
  listDropboxFiles,
} from "@/lib/dropbox";

export async function createProjectDropboxFolder(projectId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      title: true,
      dropboxFolderId: true,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId !== userId && !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  if (project.dropboxFolderId) {
    throw new Error("El proyecto ya tiene una carpeta de Dropbox");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      dropboxAccessToken: true,
    },
  });

  if (!user?.dropboxAccessToken) {
    throw new Error("Dropbox no conectado. Por favor conecta tu cuenta de Dropbox primero.");
  }

  const folder = await createDropboxFolder(
    user.dropboxAccessToken,
    `Proyecto: ${project.title}`
  );

  await prisma.project.update({
    where: { id: projectId },
    data: {
      dropboxFolderId: folder.id,
      dropboxFolderUrl: folder.url,
    },
  });

  await prisma.activityLog.create({
    data: {
      projectId,
      actorId: userId,
      type: "PROJECT_UPDATED",
      message: `Carpeta de Dropbox creada para el proyecto`,
    },
  });

  revalidatePath(`/projects/${projectId}`);

  return folder;
}

export async function shareDropboxFolderWithMember(
  projectId: string,
  email: string
) {
  const session = await requireAuth();
  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      dropboxFolderId: true,
    },
  });

  if (!project || !project.dropboxFolderId) {
    throw new Error("Project or Dropbox folder not found");
  }

  if (project.ownerId !== userId && !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      dropboxAccessToken: true,
    },
  });

  if (!user?.dropboxAccessToken) {
    throw new Error("Dropbox no conectado. Por favor conecta tu cuenta de Dropbox primero.");
  }

  // Get folder path from project
  const projectWithPath = await prisma.project.findUnique({
    where: { id: projectId },
    select: { dropboxFolderUrl: true },
  });

  if (!projectWithPath?.dropboxFolderUrl) {
    throw new Error("Dropbox folder path not found");
  }

  // Extract path from URL
  const folderPath = projectWithPath.dropboxFolderUrl.replace("https://www.dropbox.com/home", "");

  await shareDropboxFolder(
    user.dropboxAccessToken,
    folderPath,
    email
  );

  await prisma.activityLog.create({
    data: {
      projectId,
      actorId: userId,
      type: "MEMBER_APPROVED",
      message: `${email} recibió acceso a la carpeta de Dropbox`,
    },
  });

  revalidatePath(`/projects/${projectId}`);

  return { success: true };
}

export async function revokeDropboxAccessFromMember(
  projectId: string,
  email: string
) {
  const session = await requireAuth();
  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      dropboxFolderId: true,
      dropboxFolderUrl: true,
    },
  });

  if (!project || !project.dropboxFolderId) {
    throw new Error("Project or Dropbox folder not found");
  }

  if (project.ownerId !== userId && !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      dropboxAccessToken: true,
    },
  });

  if (!user?.dropboxAccessToken) {
    throw new Error("Dropbox no conectado. Por favor conecta tu cuenta de Dropbox primero.");
  }

  const folderPath = project.dropboxFolderUrl?.replace("https://www.dropbox.com/home", "") || "";

  await revokeDropboxAccess(
    user.dropboxAccessToken,
    folderPath,
    email
  );

  await prisma.activityLog.create({
    data: {
      projectId,
      actorId: userId,
      type: "MEMBER_REJECTED",
      message: `Acceso a Dropbox revocado para ${email}`,
    },
  });

  revalidatePath(`/projects/${projectId}`);

  return { success: true };
}

export async function getDropboxFiles(projectId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      dropboxFolderId: true,
      dropboxFolderUrl: true,
      members: {
        where: {
          userId,
          status: "ACTIVE",
        },
      },
    },
  });

  if (!project || !project.dropboxFolderId) {
    throw new Error("Project or Dropbox folder not found");
  }

  const isOwner = project.ownerId === userId;
  const isMember = project.members.length > 0;
  const isAdminUser = session.user.role === "ADMIN";

  if (!isOwner && !isMember && !isAdminUser) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: project.ownerId },
    select: {
      dropboxAccessToken: true,
    },
  });

  if (!user?.dropboxAccessToken) {
    throw new Error("Dropbox no conectado para el propietario del proyecto.");
  }

  const folderPath = project.dropboxFolderUrl?.replace("https://www.dropbox.com/home", "") || "";

  return await listDropboxFiles(
    user.dropboxAccessToken,
    folderPath
  );
}



