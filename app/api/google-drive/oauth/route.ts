import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/google-drive/oauth/callback`;

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    
    if (!GOOGLE_CLIENT_ID) {
      return NextResponse.json(
        { error: "Google Drive OAuth no configurado" },
        { status: 500 }
      );
    }

    // Generate state token for security
    const state = Buffer.from(`${session.user.id}:${Date.now()}`).toString("base64");
    
    // Store state temporarily (we'll verify it in callback)
    const scopes = [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/userinfo.email",
    ];

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: scopes.join(" "),
      access_type: "offline",
      prompt: "consent",
      state: state,
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    return NextResponse.redirect(googleAuthUrl);
  } catch (error) {
    console.error("Google Drive OAuth error:", error);
    return NextResponse.json(
      { error: "Error al iniciar autenticación con Google Drive" },
      { status: 500 }
    );
  }
}



