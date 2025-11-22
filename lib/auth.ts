import { auth } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@prisma/client";

export async function getServerSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export function isAdmin(role: Role | undefined): boolean {
  return role === "ADMIN";
}

export function isProfessor(role: Role | undefined): boolean {
  return role === "PROFESSOR" || role === "ADMIN";
}

export function isStudent(role: Role | undefined): boolean {
  return role === "STUDENT" || role === "PROFESSOR" || role === "ADMIN";
}

