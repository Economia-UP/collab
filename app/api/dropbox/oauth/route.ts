import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID;
const DROPBOX_CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET;
const DROPBOX_REDIRECT_URI = process.env.DROPBOX_REDIRECT_URI || `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/dropbox/oauth/callback`;

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    
    if (!DROPBOX_CLIENT_ID) {
      // Simple redirect to settings with error
      return NextResponse.redirect(
        new URL("/settings?error=Dropbox OAuth no configurado", req.url)
      );
    }

    // Generate state token for security
    const state = Buffer.from(`${session.user.id}:${Date.now()}`).toString("base64");

    const redirectUri = DROPBOX_REDIRECT_URI;

    const params = new URLSearchParams({
      client_id: DROPBOX_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      token_access_type: "offline",
      scope: "files.content.read files.content.write sharing.write account_info.read",
      state: state,
    });

    const dropboxAuthUrl = `https://www.dropbox.com/oauth2/authorize?${params.toString()}`;
    
    return NextResponse.redirect(dropboxAuthUrl);
  } catch (error) {
    console.error("Dropbox OAuth error:", error);
    return NextResponse.redirect(
      new URL("/settings?error=Error al iniciar autenticación con Dropbox", req.url)
    );
  }
}



