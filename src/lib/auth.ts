import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            memberships: {
              include: {
                organisation: true,
              },
            },
          },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcryptjs.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        // For simplicity, we take the first membership as the "active" org
        // In Feature 2, we can enhance this with an active org switcher
        const activeMembership = user.memberships[0];

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? "",
          orgId: activeMembership?.orgId,
          orgSlug: activeMembership?.organisation?.slug,
          role: activeMembership?.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.orgId = user.orgId;
        token.orgSlug = user.orgSlug;
        token.role = user.role;
      }

      // Handle session updates (e.g. after upgrade or org switch)
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.orgId = token.orgId as string;
        session.user.orgSlug = token.orgSlug as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
