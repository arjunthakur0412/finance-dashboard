import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import {
  users,
  authAccounts,
  authSessions,
  authVerificationTokens,
} from "@/lib/db/schema";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: db
    ? DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: authAccounts,
        sessionsTable: authSessions,
        verificationTokensTable: authVerificationTokens,
      })
    : undefined,
  session: { strategy: "jwt" },
});
