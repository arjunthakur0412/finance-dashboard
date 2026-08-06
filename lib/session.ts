import { auth } from "@/lib/auth";
import { DEMO_USER_ID } from "@/lib/db/memory";

const demoMode = () =>
  process.env.DEMO_MODE === "true" || !process.env.DATABASE_URL;

export async function requireUserId(): Promise<string> {
  if (demoMode()) {
    return DEMO_USER_ID;
  }
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function getSessionUser() {
  if (demoMode()) {
    return {
      id: DEMO_USER_ID,
      name: "Arjun",
      email: process.env.ALLOWED_EMAIL || "you@example.com",
      image: null as string | null,
    };
  }
  const session = await auth();
  return session?.user ?? null;
}

export function isDemoMode() {
  return demoMode();
}
