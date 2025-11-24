// Clerk authentication configuration
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma, safeDbOperation, isDatabaseAvailable } from "@/lib/prisma";
import { Role } from "@prisma/client";

// Re-export Clerk's auth function
export { auth, currentUser } from "@clerk/nextjs/server";

// Helper to get user with role from database
export async function getAuthUser() {
  try {
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

    // Check if database is available
    const dbAvailable = await isDatabaseAvailable();
    if (!dbAvailable) {
      console.warn("Database not available - returning Clerk user only");
      // Return a minimal user object when database is not available
      return {
        id: userId, // Use Clerk ID as fallback
        clerkId: userId,
        email: email,
        name: clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.firstName || email || "Usuario",
        image: clerkUser.imageUrl,
        role: Role.STUDENT, // Default role
        user: null, // No database user
      };
    }

    // Get or create user in database
    let dbUser = await safeDbOperation(
      () => prisma.user.findUnique({
        where: { clerkId: userId },
      }),
      null
    );

    if (!dbUser) {
      // Create user in database
      dbUser = await safeDbOperation(
        () => prisma.user.create({
          data: {
            clerkId: userId,
            email: email,
            name: clerkUser.firstName && clerkUser.lastName
              ? `${clerkUser.firstName} ${clerkUser.lastName}`
              : clerkUser.firstName || clerkUser.emailAddresses[0]?.emailAddress || "Usuario",
            role: Role.STUDENT, // Default role
            image: clerkUser.imageUrl,
          },
        }),
        null
      );
    } else {
      // Update user info from Clerk
      dbUser = await safeDbOperation(
        () => prisma.user.update({
          where: { id: dbUser!.id },
          data: {
            email: email,
            name: clerkUser.firstName && clerkUser.lastName
              ? `${clerkUser.firstName} ${clerkUser.lastName}`
              : clerkUser.firstName || email || dbUser.name,
            image: clerkUser.imageUrl || dbUser.image,
          },
        }),
        dbUser
      );
    }

    if (!dbUser) {
      // If database operations failed, return Clerk user only
      return {
        id: userId,
        clerkId: userId,
        email: email,
        name: clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.firstName || email || "Usuario",
        image: clerkUser.imageUrl,
        role: Role.STUDENT,
        user: null,
      };
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
  } catch (error: any) {
    // Log error but don't crash
    // Check if it's a database connection error
    if (
      error?.message?.includes("Can't reach database") ||
      error?.message?.includes("connect ECONNREFUSED") ||
      error?.code === "P1001"
    ) {
      console.warn("Database connection error - application will work in limited mode");
      // Try to return Clerk user if available
      try {
        const { userId } = await auth();
        const clerkUser = await currentUser();
        if (userId && clerkUser) {
          const email = clerkUser.emailAddresses[0]?.emailAddress;
          if (email && email.endsWith("@up.edu.mx")) {
            return {
              id: userId,
              clerkId: userId,
              email: email,
              name: clerkUser.firstName && clerkUser.lastName
                ? `${clerkUser.firstName} ${clerkUser.lastName}`
                : clerkUser.firstName || email || "Usuario",
              image: clerkUser.imageUrl,
              role: Role.STUDENT,
              user: null,
            };
          }
        }
      } catch (e) {
        // Ignore errors here
      }
    } else {
      console.error("Error getting auth user:", error);
    }
    return null;
  }
}

// Helper to get session (compatible with old NextAuth interface)
export async function getSession() {
  try {
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
  } catch (error) {
    // Log error but don't crash the page
    console.error("Error getting session:", error);
    return null;
  }
}
