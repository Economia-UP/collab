// Clerk authentication configuration
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

// Re-export Clerk's auth function
export { auth, currentUser } from "@clerk/nextjs/server";

// Helper to get user with role from database
export async function getAuthUser() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  // Get user from Clerk
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return null;
  }

  // Check if email is @up.edu.mx
  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email || !email.endsWith("@up.edu.mx")) {
    return null;
  }

  // Get or create user in database
  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser) {
    // Create user in database
    dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email: email,
        name: clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.firstName || clerkUser.emailAddresses[0]?.emailAddress || "Usuario",
        role: Role.STUDENT, // Default role
        image: clerkUser.imageUrl,
      },
    });
  } else {
    // Update user info from Clerk
    dbUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        email: email,
        name: clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.firstName || email || dbUser.name,
        image: clerkUser.imageUrl || dbUser.image,
      },
    });
  }

  return {
    id: dbUser.id,
    clerkId: userId,
    email: dbUser.email,
    name: dbUser.name,
    image: dbUser.image,
    role: dbUser.role,
    user: dbUser,
  };
}

// Helper to get session (compatible with old NextAuth interface)
export async function getSession() {
  const authUser = await getAuthUser();
  
  if (!authUser) {
    return null;
  }

  return {
    user: {
      id: authUser.id,
      email: authUser.email,
      name: authUser.name,
      image: authUser.image,
      role: authUser.role,
    },
  };
}
