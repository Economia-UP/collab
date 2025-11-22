"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name: string }) {
  const session = await requireAuth();
  const userId = session.user.id;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return updated;
}

