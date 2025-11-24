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
      return NextResponse.json(
        { error: "GitHub OAuth no configurado" },
        { status: 500 }
      );
    }

    // Generate state token for security
    const state = Buffer.from(`${session.user.id}:${Date.now()}`).toString("base64");
    
    // Store state in user session or database temporarily
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        githubAccessToken: state, // Temporary storage
      },
    });

    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: GITHUB_REDIRECT_URI,
      scope: "repo user:email",
      state: state,
    });

    const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
    
    return NextResponse.redirect(githubAuthUrl);
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    return NextResponse.json(
      { error: "Error al iniciar autenticación con GitHub" },
      { status: 500 }
    );
  }
}



