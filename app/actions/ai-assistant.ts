"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Send a message to the AI assistant and get a response
 */
export async function sendAIMessage(
  projectId: string,
  message: string,
  conversationId?: string
) {
  const session = await requireAuth();
  const userId = session.user.id;

  // Verify user has access to the project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        where: {
          userId,
          status: "ACTIVE",
        },
      },
      owner: {
        select: {
          id: true,
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
    session.user.role === "ADMIN";

  if (!hasAccess) {
    throw new Error("Unauthorized");
  }

  if (!OPENAI_API_KEY) {
    throw new Error("AI assistant no está configurado. Por favor configura OPENAI_API_KEY.");
  }

  // Get or create conversation
  let conversation;
  if (conversationId) {
    conversation = await prisma.aIConversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation || conversation.projectId !== projectId || conversation.userId !== userId) {
      throw new Error("Conversation not found");
    }
  } else {
    conversation = await prisma.aIConversation.create({
      data: {
        projectId,
        userId,
        messages: [],
      },
    });
  }

  // Get existing messages
  const existingMessages = (conversation.messages as any) || [];
  const messages: AIMessage[] = [
    {
      role: "assistant",
      content: `Eres un asistente de IA para el proyecto "${project.title}". 
      
Descripción del proyecto: ${project.description || project.shortSummary}

Ayudas con:
- Generar documentación
- Sugerir mejoras de código
- Planificar tareas
- Crear contenido
- Responder preguntas sobre el proyecto

Responde de manera concisa y útil.`,
    },
    ...existingMessages,
    {
      role: "user",
      content: message,
    },
  ];

  // Call OpenAI API
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using cheaper model, can be changed to gpt-4
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to get AI response");
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || "No response";

    // Update conversation with new messages
    const updatedMessages = [
      ...existingMessages,
      { role: "user" as const, content: message },
      { role: "assistant" as const, content: assistantMessage },
    ];

    await prisma.aIConversation.update({
      where: { id: conversation.id },
      data: {
        messages: updatedMessages,
      },
    });

    revalidatePath(`/projects/${projectId}`);

    return {
      conversationId: conversation.id,
      message: assistantMessage,
    };
  } catch (error: any) {
    console.error("AI API error:", error);
    throw new Error(error.message || "Failed to get AI response");
  }
}

/**
 * Get conversation history
 */
export async function getAIConversation(conversationId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const conversation = await prisma.aIConversation.findUnique({
    where: { id: conversationId },
    include: {
      project: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!conversation || conversation.userId !== userId) {
    throw new Error("Conversation not found");
  }

  return conversation;
}

/**
 * List all conversations for a project
 */
export async function listAIConversations(projectId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  // Verify access
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
    session.user.role === "ADMIN";

  if (!hasAccess) {
    throw new Error("Unauthorized");
  }

  const conversations = await prisma.aIConversation.findMany({
    where: {
      projectId,
      userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 20,
  });

  return conversations;
}

/**
 * Delete a conversation
 */
export async function deleteAIConversation(conversationId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const conversation = await prisma.aIConversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation || conversation.userId !== userId) {
    throw new Error("Conversation not found");
  }

  await prisma.aIConversation.delete({
    where: { id: conversationId },
  });

  revalidatePath(`/projects/${conversation.projectId}`);
}

