import { getAuthUser, getSession } from "@/lib/auth-config";
import { Role } from "@prisma/client";

export async function getServerSession() {
  return await getSession();
}

export async function requireAuth() {
  const authUser = await getAuthUser();
  if (!authUser) {
    throw new Error("Unauthorized");
  }
  
  const session = await getSession();
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
