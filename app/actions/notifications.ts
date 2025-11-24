"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateNotificationPreferences(data: {
  emailNotifications?: boolean;
  whatsappNotifications?: boolean;
  phoneNumber?: string;
  notifyOnMembershipRequest?: boolean;
  notifyOnComment?: boolean;
  notifyOnTaskAssigned?: boolean;
  notifyOnProjectUpdate?: boolean;
}) {
  const session = await requireAuth();
  const userId = session.user.id;

  // Normalize phone number: remove spaces, dashes, parentheses, etc.
  let normalizedPhoneNumber: string | null = null;
  
  // Only validate phone number if WhatsApp is enabled
  if (data.whatsappNotifications) {
    if (!data.phoneNumber || data.phoneNumber.trim() === "") {
      throw new Error(
        "Se requiere un número de teléfono para recibir notificaciones por WhatsApp. " +
        "Por favor, ingresa tu número con el código de país (ejemplo: +521234567890)."
      );
    }

    // Remove all non-digit characters except +
    normalizedPhoneNumber = data.phoneNumber.trim().replace(/[^\d+]/g, "");
    
    // Ensure it starts with +
    if (!normalizedPhoneNumber.startsWith("+")) {
      // If it doesn't start with +, try to add it
      // Remove leading zeros and add +
      normalizedPhoneNumber = normalizedPhoneNumber.replace(/^0+/, "");
      if (normalizedPhoneNumber && !normalizedPhoneNumber.startsWith("+")) {
        normalizedPhoneNumber = "+" + normalizedPhoneNumber;
      }
    }
    
    // Validate phone number format (E.164 format: + followed by 1-15 digits)
    // More flexible: allows + followed by country code and number
    // Minimum 7 digits (country code + number), maximum 15 digits total
    const phoneRegex = /^\+[1-9]\d{6,14}$/;
    if (!phoneRegex.test(normalizedPhoneNumber)) {
      throw new Error(
        "Formato de número de teléfono inválido. " +
        "Debe incluir el código de país (ejemplo: +521234567890 para México, +1234567890 para USA). " +
        "El número debe tener entre 7 y 15 dígitos después del código de país."
      );
    }
  } else if (data.phoneNumber && data.phoneNumber.trim() !== "") {
    // If WhatsApp is disabled but phone number is provided, normalize it anyway
    normalizedPhoneNumber = data.phoneNumber.trim().replace(/[^\d+]/g, "");
    if (!normalizedPhoneNumber.startsWith("+")) {
      normalizedPhoneNumber = normalizedPhoneNumber.replace(/^0+/, "");
      if (normalizedPhoneNumber && !normalizedPhoneNumber.startsWith("+")) {
        normalizedPhoneNumber = "+" + normalizedPhoneNumber;
      }
    }
    // Only validate if it looks valid, otherwise just store as-is
    const phoneRegex = /^\+[1-9]\d{6,14}$/;
    if (!phoneRegex.test(normalizedPhoneNumber)) {
      // If invalid format, set to null
      normalizedPhoneNumber = null;
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      emailNotifications: data.emailNotifications,
      whatsappNotifications: data.whatsappNotifications,
      phoneNumber: normalizedPhoneNumber,
      notifyOnMembershipRequest: data.notifyOnMembershipRequest,
      notifyOnComment: data.notifyOnComment,
      notifyOnTaskAssigned: data.notifyOnTaskAssigned,
      notifyOnProjectUpdate: data.notifyOnProjectUpdate,
    },
  });

  revalidatePath("/settings");

  return updated;
}

