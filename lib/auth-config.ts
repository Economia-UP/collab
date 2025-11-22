import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { Adapter } from "next-auth/adapters";

export const authConfig = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only allow @up.edu.mx emails
      if (user?.email && !user.email.endsWith("@up.edu.mx")) {
        return false;
      }
      return true;
    },
    async session({ session, user }) {
      // With database strategy, user is passed directly from the database
      if (session?.user) {
        if (user) {
          // User object is available from the database session
          session.user.id = user.id;
          // Fetch the full user to get the role
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: user.id },
              select: { id: true, role: true },
            });
            if (dbUser) {
              session.user.role = dbUser.role;
            } else {
              // If user not found in our User table, set default role
              session.user.role = "STUDENT";
            }
          } catch (error) {
            // If there's an error fetching user, set default role
            console.error("Error fetching user role:", error);
            session.user.role = "STUDENT";
          }
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "database" as const,
  },
} as const;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig as any);

