import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { Adapter } from "next-auth/adapters";

const authConfig = {
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
      if (user.email && !user.email.endsWith("@up.edu.mx")) {
        return false;
      }
      return true;
    },
    async session({ session, user }) {
      // With database strategy, user is passed directly from the database
      if (session.user && user) {
        // Fetch the full user to get the role
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, role: true },
        });
        if (dbUser) {
          (session.user as any).id = dbUser.id;
          (session.user as any).role = dbUser.role;
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
    strategy: "database",
  },
};

const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export { auth, signIn, signOut };
export const { GET, POST } = handlers;
