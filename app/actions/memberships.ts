"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { MembershipStatus, ProjectRole } from "@prisma/client";
import { shareGoogleDriveFolderWithMember, revokeGoogleDriveAccessFromMember } from "@/app/actions/google-drive";
import { shareDropboxFolderWithMember, revokeDropboxAccessFromMember } from "@/app/actions/dropbox";

export async function requestMembership(projectId: string, message?: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId === userId) {
    throw new Error("Ya eres el propietario de este proyecto");
  }

  // Check if already a member
  const existing = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (existing && existing.status === "ACTIVE") {
    throw new Error("Ya eres miembro de este proyecto");
  }

  if (existing && existing.status === "PENDING") {
    throw new Error("Ya tienes una solicitud pendiente");
  }

  // Create or update membership request
  const membership = await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
    update: {
      status: "PENDING",
    },
    create: {
      projectId,
      userId,
      status: "PENDING",
      role: "ASSISTANT",
    },
  });

  await prisma.activityLog.create({
    data: {
      projectId,
      actorId: userId,
      type: "MEMBER_JOIN_REQUEST",
      message: message || "Solicitud de membresía",
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/my-projects");

  return membership;
}

export async function approveMembership(projectId: string, userId: string) {
  const session = await requireAuth();
  const currentUserId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId !== currentUserId && !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const membership = await prisma.projectMember.update({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
    data: {
      status: "ACTIVE",
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  await prisma.activityLog.create({
    data: {
      projectId,
      actorId: currentUserId,
      type: "MEMBER_APPROVED",
      message: `${membership.user.name || "Usuario"} se unió al proyecto`,
    },
  });

  // Share Google Drive and Dropbox folders if exist
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { googleDriveFolderId: true, dropboxFolderId: true },
  });

  const memberUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (memberUser?.email) {
    if (project?.googleDriveFolderId) {
      try {
        await shareGoogleDriveFolderWithMember(projectId, memberUser.email, "writer");
      } catch (error) {
        console.error("Failed to share Google Drive folder:", error);
        // Don't fail the membership approval if Google Drive sharing fails
      }
    }

    if (project?.dropboxFolderId) {
      try {
        await shareDropboxFolderWithMember(projectId, memberUser.email);
      } catch (error) {
        console.error("Failed to share Dropbox folder:", error);
        // Don't fail the membership approval if Dropbox sharing fails
      }
    }
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/my-projects");

  return membership;
}

export async function rejectMembership(projectId: string, userId: string) {
  const session = await requireAuth();
  const currentUserId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId !== currentUserId && !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  await prisma.projectMember.update({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
    data: {
      status: "REJECTED",
    },
  });

  await prisma.activityLog.create({
    data: {
      projectId,
      actorId: currentUserId,
      type: "MEMBER_REJECTED",
      message: `Solicitud de membresía rechazada`,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/my-projects");

  return { success: true };
}

export async function removeMember(projectId: string, userId: string) {
  const session = await requireAuth();
  const currentUserId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId !== currentUserId && !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  if (project.ownerId === userId) {
    throw new Error("No puedes remover al propietario del proyecto");
  }

  // Get user email before removing
  const memberUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  await prisma.projectMember.update({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
    data: {
      status: "LEFT",
    },
  });

  // Revoke Google Drive and Dropbox access if exists
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { googleDriveFolderId: true, dropboxFolderId: true },
  });

  if (memberUser?.email) {
    if (project?.googleDriveFolderId) {
      try {
        await revokeGoogleDriveAccessFromMember(projectId, memberUser.email);
      } catch (error) {
        console.error("Failed to revoke Google Drive access:", error);
        // Don't fail the removal if Google Drive revoke fails
      }
    }

    if (project?.dropboxFolderId) {
      try {
        await revokeDropboxAccessFromMember(projectId, memberUser.email);
      } catch (error) {
        console.error("Failed to revoke Dropbox access:", error);
        // Don't fail the removal if Dropbox revoke fails
      }
    }
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/my-projects");

  return { success: true };
}

export async function getProjectMembers(projectId: string) {
  const session = await requireAuth();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return project.members;
}

// New function to invite members by email
export async function inviteMembers(
  projectId: string,
  emails: string[],
  role: ProjectRole = "CO_AUTHOR"
) {
  const session = await requireAuth();
  const currentUserId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, title: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId !== currentUserId && !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const invitedUsers = [];

  for (const email of emails) {
    if (!email || !email.endsWith("@up.edu.mx")) continue;

    const user = await prisma.user.findUnique({
      where: { email: email.trim() },
    });

    if (user && user.id !== currentUserId) {
      // Check if already a member
      const existing = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: user.id,
          },
        },
      });

      if (!existing) {
        await prisma.projectMember.create({
          data: {
            projectId,
            userId: user.id,
            status: "ACTIVE",
            role: role,
          },
        });

        invitedUsers.push(user);

        await prisma.activityLog.create({
          data: {
            projectId,
            actorId: currentUserId,
            type: "MEMBER_APPROVED",
            message: `${user.name || user.email} fue invitado como ${role === "PI" ? "co-propietario" : "colaborador"}`,
          },
        });

        // Share Google Drive and Dropbox folders if exist
        const projectWithFolders = await prisma.project.findUnique({
          where: { id: projectId },
          select: { googleDriveFolderId: true, dropboxFolderId: true },
        });

        if (projectWithFolders?.googleDriveFolderId) {
          try {
            await shareGoogleDriveFolderWithMember(projectId, user.email, "writer");
          } catch (error) {
            console.error("Failed to share Google Drive folder:", error);
          }
        }

        if (projectWithFolders?.dropboxFolderId) {
          try {
            await shareDropboxFolderWithMember(projectId, user.email);
          } catch (error) {
            console.error("Failed to share Dropbox folder:", error);
          }
        }
      } else if (existing.status !== "ACTIVE") {
        // Reactivate if previously left or rejected
        await prisma.projectMember.update({
          where: {
            projectId_userId: {
              projectId,
              userId: user.id,
            },
          },
          data: {
            status: "ACTIVE",
            role: role,
          },
        });

        invitedUsers.push(user);
      }
    }
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/my-projects");

  return { success: true, invited: invitedUsers.length };
}
