import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/google-drive/oauth/callback`;

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
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: GOOGLE_REDIRECT_URI,
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

    // Get user info from Google
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to fetch Google user");
    }

    // Store access token and refresh token
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        googleDriveAccessToken: tokenData.access_token,
        googleDriveRefreshToken: tokenData.refresh_token || null,
      },
    });

    return NextResponse.redirect(
      new URL("/settings?google_drive_connected=true", req.url)
    );
  } catch (error) {
    console.error("Google Drive OAuth callback error:", error);
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



