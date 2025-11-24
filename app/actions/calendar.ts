"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { google } from "googleapis";

const GOOGLE_CALENDAR_CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CALENDAR_CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;

function getGoogleCalendarClient(accessToken: string, refreshToken?: string) {
  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CALENDAR_CLIENT_ID,
    GOOGLE_CALENDAR_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/google-drive/oauth/callback`
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

/**
 * Create a calendar event for a project
 */
export async function createCalendarEvent(
  projectId: string,
  data: {
    title: string;
    description?: string;
    startTime: Date;
    endTime?: Date;
    location?: string;
  }
) {
  const session = await requireAuth();
  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      title: true,
      members: {
        where: {
          userId,
          status: "ACTIVE",
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const hasAccess =
    project.ownerId === userId ||
    project.members.length > 0 ||
    isAdmin(session.user.role);

  if (!hasAccess) {
    throw new Error("Unauthorized");
  }

  // Get user's Google Calendar token
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      googleDriveAccessToken: true,
      googleDriveRefreshToken: true,
    },
  });

  let googleCalendarEventId: string | null = null;

  // Create event in Google Calendar if user has Google connected
  if (user?.googleDriveAccessToken) {
    try {
      const calendar = getGoogleCalendarClient(
        user.googleDriveAccessToken,
        user.googleDriveRefreshToken || undefined
      );

      const event = {
        summary: `${data.title} - ${project.title}`,
        description: data.description || `Evento del proyecto: ${project.title}`,
        start: {
          dateTime: data.startTime.toISOString(),
          timeZone: "America/Mexico_City",
        },
        end: {
          dateTime: (data.endTime || new Date(data.startTime.getTime() + 60 * 60 * 1000)).toISOString(),
          timeZone: "America/Mexico_City",
        },
        location: data.location,
      };

      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });

      googleCalendarEventId = response.data.id || null;
    } catch (error) {
      console.error("Failed to create Google Calendar event:", error);
      // Continue without Google Calendar integration
    }
  }

  // Create event in database
  const calendarEvent = await prisma.calendarEvent.create({
    data: {
      projectId,
      title: data.title,
      description: data.description,
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location,
      googleCalendarEventId,
    },
  });

  revalidatePath(`/projects/${projectId}`);

  return calendarEvent;
}

/**
 * List calendar events for a project
 */
export async function getProjectCalendarEvents(projectId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        where: {
          userId,
          status: "ACTIVE",
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const hasAccess =
    project.ownerId === userId ||
    project.members.length > 0 ||
    isAdmin(session.user.role);

  if (!hasAccess) {
    throw new Error("Unauthorized");
  }

  const events = await prisma.calendarEvent.findMany({
    where: {
      projectId,
      startTime: {
        gte: new Date(), // Only future events
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  return events;
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(eventId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const event = await prisma.calendarEvent.findUnique({
    where: { id: eventId },
    include: {
      project: {
        select: {
          ownerId: true,
          members: {
            where: {
              userId,
              status: "ACTIVE",
            },
          },
        },
      },
    },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  const hasAccess =
    event.project.ownerId === userId ||
    event.project.members.length > 0 ||
    isAdmin(session.user.role);

  if (!hasAccess) {
    throw new Error("Unauthorized");
  }

  // Delete from Google Calendar if exists
  if (event.googleCalendarEventId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleDriveAccessToken: true,
        googleDriveRefreshToken: true,
      },
    });

    if (user?.googleDriveAccessToken) {
      try {
        const calendar = getGoogleCalendarClient(
          user.googleDriveAccessToken,
          user.googleDriveRefreshToken || undefined
        );
        await calendar.events.delete({
          calendarId: "primary",
          eventId: event.googleCalendarEventId,
        });
      } catch (error) {
        console.error("Failed to delete Google Calendar event:", error);
      }
    }
  }

  await prisma.calendarEvent.delete({
    where: { id: eventId },
  });

  revalidatePath(`/projects/${event.projectId}`);
}

