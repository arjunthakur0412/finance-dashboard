import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import {
  users,
  authAccounts,
  authSessions,
  authVerificationTokens,
} from "@/lib/db/schema";
import { DEMO_USER_ID } from "@/lib/db/memory";

const allowedEmail = process.env.ALLOWED_EMAIL?.toLowerCase();
const demoMode = process.env.DEMO_MODE === "true" || !process.env.DATABASE_URL;

const providers = [
  ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
    ? [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID,
          clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
      ]
    : []),
  ...(demoMode
    ? [
        Credentials({
          name: "Demo",
          credentials: {},
          async authorize() {
            return {
              id: DEMO_USER_ID,
              name: "Arjun",
              email: process.env.ALLOWED_EMAIL || "you@example.com",
            };
          },
        }),
      ]
    : []),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: db
    ? DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: authAccounts,
        sessionsTable: authSessions,
        verificationTokensTable: authVerificationTokens,
      })
    : undefined,
  providers,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (demoMode) return true;
      if (!allowedEmail) return false;
      return user.email?.toLowerCase() === allowedEmail;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub || DEMO_USER_ID) as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
  trustHost: true,
});
