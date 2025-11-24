"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name: string; image?: string }) {
  const session = await requireAuth();
  const userId = session.user.id;

  const updateData: { name: string; image?: string | null } = {
    name: data.name,
  };

  // Only update image if provided
  if (data.image !== undefined) {
    updateData.image = data.image || null;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return updated;
}

