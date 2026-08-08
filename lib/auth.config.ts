import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { isEmailAllowed, isDemoMode } from "@/lib/demo-flag";

export const authConfig = {
  providers: [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      const isLoggedIn = !!auth?.user;
      const isAuthPage = path.startsWith("/login");
      const isPublic =
        isAuthPage ||
        path.startsWith("/api/auth") ||
        path.startsWith("/icons") ||
        path === "/manifest.webmanifest";

      if (isPublic) {
        if (isLoggedIn && isAuthPage) return Response.redirect(new URL("/dashboard", request.nextUrl));
        return true;
      }
      return isLoggedIn;
    },
    async signIn({ user }) {
      if (isDemoMode()) return true;
      return isEmailAllowed(user.email);
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub || "") as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
