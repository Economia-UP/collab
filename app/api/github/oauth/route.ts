import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/github/oauth/callback`;

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    
    if (!GITHUB_CLIENT_ID) {
      // Simple redirect to settings with error
      return NextResponse.redirect(
        new URL("/settings?error=GitHub OAuth no configurado", req.url)
      );
    }

    // Generate state token for security (includes userId for verification)
    const state = Buffer.from(`${session.user.id}:${Date.now()}`).toString("base64");

    // Construct redirect URI from request URL to ensure it matches the current domain
    const baseUrl = new URL(req.url).origin;
    const redirectUri = process.env.GITHUB_REDIRECT_URI || `${baseUrl}/api/github/oauth/callback`;
    
    // Log for debugging (remove in production if needed)
    console.log("GitHub OAuth - Using redirect_uri:", redirectUri);

    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: "repo user:email",
      state: state,
    });

    const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
    
    return NextResponse.redirect(githubAuthUrl);
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    return NextResponse.redirect(
      new URL("/settings?error=Error al iniciar autenticación con GitHub", req.url)
    );
  }
}



