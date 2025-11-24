"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export type OAuthProvider = "github" | "google-drive" | "dropbox";

export async function checkOAuthConnection(provider: OAuthProvider): Promise<boolean> {
  const session = await requireAuth();
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      githubAccessToken: true,
      googleDriveAccessToken: true,
      dropboxAccessToken: true,
    },
  });

  if (!user) return false;

  switch (provider) {
    case "github":
      return !!user.githubAccessToken;
    case "google-drive":
      return !!user.googleDriveAccessToken;
    case "dropbox":
      return !!user.dropboxAccessToken;
    default:
      return false;
  }
}

export async function requireOAuthConnection(provider: OAuthProvider): Promise<void> {
  const isConnected = await checkOAuthConnection(provider);
  
  if (!isConnected) {
    const providerNames: Record<OAuthProvider, string> = {
      github: "GitHub",
      "google-drive": "Google Drive",
      dropbox: "Dropbox",
    };
    
    throw new Error(
      `${providerNames[provider]} no conectado. Por favor conecta tu cuenta de ${providerNames[provider]} primero.`
    );
  }
}

