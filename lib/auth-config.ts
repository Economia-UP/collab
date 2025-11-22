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
      try {
        if (session?.user && user) {
          // User object is available from the database session
          session.user.id = user.id;
          
          // Fetch the full user to get the role
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
        } else if (session?.user && session.user.email) {
          // Fallback: if user object is not available, try to find by email
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: session.user.email! },
              select: { id: true, role: true },
            });
            if (dbUser) {
              session.user.id = dbUser.id;
              session.user.role = dbUser.role;
            }
          } catch (error) {
            console.error("Error fetching user by email:", error);
          }
        }
      } catch (error) {
        // If there's any error, log it but don't break the session
        console.error("Error in session callback:", error);
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

