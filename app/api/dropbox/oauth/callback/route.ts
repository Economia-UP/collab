import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID;
const DROPBOX_CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET;
const DROPBOX_REDIRECT_URI = process.env.DROPBOX_REDIRECT_URI || `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/dropbox/oauth/callback`;

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(`/settings?error=${encodeURIComponent(error)}`, req.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/settings?error=missing_params", req.url)
      );
    }

    // Verify state
    const [userId] = Buffer.from(state, "base64").toString().split(":");
    const session = await requireAuth();
    
    if (session.user.id !== userId) {
      return NextResponse.redirect(
        new URL("/settings?error=invalid_state", req.url)
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://api.dropboxapi.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: DROPBOX_CLIENT_ID!,
        client_secret: DROPBOX_CLIENT_SECRET!,
        redirect_uri: DROPBOX_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(errorData.error_description || errorData.error || "Failed to exchange code for token");
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }

    // Store access token and refresh token
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        dropboxAccessToken: tokenData.access_token,
        dropboxRefreshToken: tokenData.refresh_token || null,
      },
    });

    return NextResponse.redirect(
      new URL("/settings?dropbox_connected=true", req.url)
    );
  } catch (error) {
    console.error("Dropbox OAuth callback error:", error);
    return NextResponse.redirect(
      new URL(
        `/settings?error=${encodeURIComponent(
          error instanceof Error ? error.message : "unknown_error"
        )}`,
        req.url
      )
    );
  }
}

