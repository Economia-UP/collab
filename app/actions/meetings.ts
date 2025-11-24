"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Create a meeting for a project
 */
export async function createMeeting(
  projectId: string,
  data: {
    title: string;
    description?: string;
    scheduledTime: Date;
    duration?: number; // in minutes
    location?: string;
    useZoom?: boolean;
    useGoogleMeet?: boolean;
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

  let zoomMeetingId: string | null = null;
  let zoomJoinUrl: string | null = null;
  let googleMeetUrl: string | null = null;

  // Create Zoom meeting if requested
  if (data.useZoom) {
    // TODO: Implement Zoom API integration
    // For now, generate a placeholder URL
    googleMeetUrl = `https://zoom.us/j/meeting-${Date.now()}`;
  }

  // Generate Google Meet link if requested
  if (data.useGoogleMeet) {
    // Google Meet links can be generated without API
    // Format: https://meet.google.com/xxx-xxxx-xxx
    const randomId = Math.random().toString(36).substring(2, 15);
    googleMeetUrl = `https://meet.google.com/${randomId.substring(0, 3)}-${randomId.substring(3, 7)}-${randomId.substring(7, 11)}`;
  }

  // Create calendar event for the meeting
  let calendarEventId: string | null = null;
  try {
    const { createCalendarEvent } = await import("@/app/actions/calendar");
    const endTime = new Date(data.scheduledTime);
    endTime.setMinutes(endTime.getMinutes() + (data.duration || 60));

    const calendarEvent = await createCalendarEvent(projectId, {
      title: data.title,
      description: data.description,
      startTime: data.scheduledTime,
      endTime,
      location: data.location || googleMeetUrl || undefined,
    });

    calendarEventId = calendarEvent.id;
  } catch (error) {
    console.error("Failed to create calendar event for meeting:", error);
  }

  // Create meeting in database
  const meeting = await prisma.meeting.create({
    data: {
      projectId,
      title: data.title,
      description: data.description,
      scheduledTime: data.scheduledTime,
      duration: data.duration || 60,
      zoomMeetingId,
      zoomJoinUrl,
      googleMeetUrl,
      calendarEventId,
    },
  });

  revalidatePath(`/projects/${projectId}`);

  return meeting;
}

/**
 * List meetings for a project
 */
export async function getProjectMeetings(projectId: string) {
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

  const meetings = await prisma.meeting.findMany({
    where: {
      projectId,
      scheduledTime: {
        gte: new Date(), // Only future meetings
      },
    },
    orderBy: {
      scheduledTime: "asc",
    },
  });

  return meetings;
}

/**
 * Delete a meeting
 */
export async function deleteMeeting(meetingId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
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

  if (!meeting) {
    throw new Error("Meeting not found");
  }

  const hasAccess =
    meeting.project.ownerId === userId ||
    meeting.project.members.length > 0 ||
    isAdmin(session.user.role);

  if (!hasAccess) {
    throw new Error("Unauthorized");
  }

  // Delete associated calendar event if exists
  if (meeting.calendarEventId) {
    try {
      const { deleteCalendarEvent } = await import("@/app/actions/calendar");
      await deleteCalendarEvent(meeting.calendarEventId);
    } catch (error) {
      console.error("Failed to delete calendar event:", error);
    }
  }

  await prisma.meeting.delete({
    where: { id: meetingId },
  });

  revalidatePath(`/projects/${meeting.projectId}`);
}

