import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || "";

function verifyGitHubSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!secret) return true; // Skip verification if no secret configured

  const hmac = crypto.createHmac("sha256", secret);
  const digest = "sha256=" + hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

export async function POST(req: NextRequest) {
  try {
    const headerPayload = await headers();
    const signature = headerPayload.get("x-hub-signature-256") || "";
    const event = headerPayload.get("x-github-event") || "";
    const deliveryId = headerPayload.get("x-github-delivery") || "";

    const body = await req.text();

    // Verify webhook signature
    if (GITHUB_WEBHOOK_SECRET && !verifyGitHubSignature(body, signature, GITHUB_WEBHOOK_SECRET)) {
      console.error("Invalid GitHub webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);

    // Handle different event types
    switch (event) {
      case "push":
        await handlePushEvent(payload);
        break;
      case "issues":
        await handleIssuesEvent(payload);
        break;
      case "pull_request":
        await handlePullRequestEvent(payload);
        break;
      default:
        console.log(`Unhandled GitHub event: ${event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("GitHub webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePushEvent(payload: any) {
  const { repository, commits, pusher } = payload;
  
  if (!repository || !commits || commits.length === 0) return;

  // Find project by GitHub repo
  const project = await prisma.project.findFirst({
    where: {
      githubRepoOwner: repository.owner.login,
      githubRepoName: repository.name,
    },
    select: { id: true, ownerId: true },
  });

  if (!project) return;

  // Get user by GitHub username
  const user = await prisma.user.findFirst({
    where: {
      githubUsername: pusher.name,
    },
    select: { id: true },
  });

  // Create activity log for each commit
  for (const commit of commits) {
    await prisma.activityLog.create({
      data: {
        projectId: project.id,
        actorId: user?.id || project.ownerId,
        type: "GITHUB_COMMIT",
        message: `Commit: ${commit.message.split("\n")[0]} (${commit.id.substring(0, 7)})`,
      },
    });
  }

  // Revalidate project page
  // Note: revalidatePath doesn't work in API routes, but we can trigger it from client
}

async function handleIssuesEvent(payload: any) {
  const { repository, issue, action } = payload;
  
  if (!repository || !issue) return;

  const project = await prisma.project.findFirst({
    where: {
      githubRepoOwner: repository.owner.login,
      githubRepoName: repository.name,
    },
    select: { id: true },
  });

  if (!project) return;

  const user = await prisma.user.findFirst({
    where: {
      githubUsername: issue.user.login,
    },
    select: { id: true },
  });

  if (action === "opened") {
    await prisma.activityLog.create({
      data: {
        projectId: project.id,
        actorId: user?.id || project.ownerId,
        type: "GITHUB_ISSUE_CREATED",
        message: `Issue creado: ${issue.title} (#${issue.number})`,
      },
    });
  } else if (action === "closed") {
    await prisma.activityLog.create({
      data: {
        projectId: project.id,
        actorId: user?.id || project.ownerId,
        type: "GITHUB_ISSUE_CLOSED",
        message: `Issue cerrado: ${issue.title} (#${issue.number})`,
      },
    });
  }
}

async function handlePullRequestEvent(payload: any) {
  const { repository, pull_request, action } = payload;
  
  if (!repository || !pull_request) return;

  const project = await prisma.project.findFirst({
    where: {
      githubRepoOwner: repository.owner.login,
      githubRepoName: repository.name,
    },
    select: { id: true },
  });

  if (!project) return;

  const user = await prisma.user.findFirst({
    where: {
      githubUsername: pull_request.user.login,
    },
    select: { id: true },
  });

  await prisma.activityLog.create({
    data: {
      projectId: project.id,
      actorId: user?.id || project.ownerId,
      type: "GITHUB_PULL_REQUEST",
      message: `Pull Request ${action}: ${pull_request.title} (#${pull_request.number})`,
    },
  });
}

