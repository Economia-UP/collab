"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  createGoogleDriveFolder,
  shareGoogleDriveFolder,
  revokeGoogleDriveAccess,
  listGoogleDriveFiles,
  refreshGoogleDriveToken,
} from "@/lib/google-drive";

export async function createProjectGoogleDriveFolder(projectId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      title: true,
      googleDriveFolderId: true,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId !== userId && !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  if (project.googleDriveFolderId) {
    throw new Error("El proyecto ya tiene una carpeta de Google Drive");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      googleDriveAccessToken: true,
      googleDriveRefreshToken: true,
    },
  });

  if (!user?.googleDriveAccessToken) {
    throw new Error("Google Drive no conectado. Por favor conecta tu cuenta de Google Drive primero.");
  }

  let accessToken = user.googleDriveAccessToken;
  
  // Refresh token if needed
  if (user.googleDriveRefreshToken) {
    try {
      accessToken = await refreshGoogleDriveToken(user.googleDriveRefreshToken);
      // Update token in database
      await prisma.user.update({
        where: { id: userId },
        data: { googleDriveAccessToken: accessToken },
      });
    } catch (error) {
      console.error("Failed to refresh token, using existing:", error);
    }
  }

  const folder = await createGoogleDriveFolder(
    accessToken,
    user.googleDriveRefreshToken || undefined,
    `Proyecto: ${project.title}`
  );

  await prisma.project.update({
    where: { id: projectId },
    data: {
      googleDriveFolderId: folder.id,
      googleDriveFolderUrl: folder.url,
    },
  });

  await prisma.activityLog.create({
    data: {
      projectId,
      actorId: userId,
      type: "PROJECT_UPDATED",
      message: `Carpeta de Google Drive creada para el proyecto`,
    },
  });

  revalidatePath(`/projects/${projectId}`);

  return folder;
}

export async function shareGoogleDriveFolderWithMember(
  projectId: string,
  email: string,
  role: "reader" | "writer" | "commenter" = "writer"
) {
  const session = await requireAuth();
  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      googleDriveFolderId: true,
    },
  });

  if (!project || !project.googleDriveFolderId) {
    throw new Error("Project or Google Drive folder not found");
  }

  if (project.ownerId !== userId && !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      googleDriveAccessToken: true,
      googleDriveRefreshToken: true,
    },
  });

  if (!user?.googleDriveAccessToken) {
    throw new Error("Google Drive no conectado. Por favor conecta tu cuenta de Google Drive primero.");
  }

  let accessToken = user.googleDriveAccessToken;
  
  // Refresh token if needed
  if (user.googleDriveRefreshToken) {
    try {
      accessToken = await refreshGoogleDriveToken(user.googleDriveRefreshToken);
      await prisma.user.update({
        where: { id: userId },
        data: { googleDriveAccessToken: accessToken },
      });
    } catch (error) {
      console.error("Failed to refresh token:", error);
    }
  }

  await shareGoogleDriveFolder(
    accessToken,
    user.googleDriveRefreshToken || undefined,
    project.googleDriveFolderId,
    email,
    role
  );

  await prisma.activityLog.create({
    data: {
      projectId,
      actorId: userId,
      type: "MEMBER_APPROVED",
      message: `${email} recibió acceso a la carpeta de Google Drive`,
    },
  });

  revalidatePath(`/projects/${projectId}`);

  return { success: true };
}

export async function revokeGoogleDriveAccessFromMember(
  projectId: string,
  email: string
) {
  const session = await requireAuth();
  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      googleDriveFolderId: true,
    },
  });

  if (!project || !project.googleDriveFolderId) {
    throw new Error("Project or Google Drive folder not found");
  }

  if (project.ownerId !== userId && !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      googleDriveAccessToken: true,
      googleDriveRefreshToken: true,
    },
  });

  if (!user?.googleDriveAccessToken) {
    throw new Error("Google Drive no conectado. Por favor conecta tu cuenta de Google Drive primero.");
  }

  let accessToken = user.googleDriveAccessToken;
  
  // Refresh token if needed
  if (user.googleDriveRefreshToken) {
    try {
      accessToken = await refreshGoogleDriveToken(user.googleDriveRefreshToken);
      await prisma.user.update({
        where: { id: userId },
        data: { googleDriveAccessToken: accessToken },
      });
    } catch (error) {
      console.error("Failed to refresh token:", error);
    }
  }

  await revokeGoogleDriveAccess(
    accessToken,
    user.googleDriveRefreshToken || undefined,
    project.googleDriveFolderId,
    email
  );

  await prisma.activityLog.create({
    data: {
      projectId,
      actorId: userId,
      type: "MEMBER_REJECTED",
      message: `Acceso a Google Drive revocado para ${email}`,
    },
  });

  revalidatePath(`/projects/${projectId}`);

  return { success: true };
}

export async function getGoogleDriveFiles(projectId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      googleDriveFolderId: true,
      members: {
        where: {
          userId,
          status: "ACTIVE",
        },
      },
    },
  });

  if (!project || !project.googleDriveFolderId) {
    throw new Error("Project or Google Drive folder not found");
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
      googleDriveAccessToken: true,
      googleDriveRefreshToken: true,
    },
  });

  if (!user?.googleDriveAccessToken) {
    throw new Error("Google Drive no conectado para el propietario del proyecto.");
  }

  let accessToken = user.googleDriveAccessToken;
  
  // Refresh token if needed
  if (user.googleDriveRefreshToken) {
    try {
      accessToken = await refreshGoogleDriveToken(user.googleDriveRefreshToken);
      await prisma.user.update({
        where: { id: project.ownerId },
        data: { googleDriveAccessToken: accessToken },
      });
    } catch (error) {
      console.error("Failed to refresh token:", error);
    }
  }

  return await listGoogleDriveFiles(
    accessToken,
    user.googleDriveRefreshToken || undefined,
    project.googleDriveFolderId
  );
}

