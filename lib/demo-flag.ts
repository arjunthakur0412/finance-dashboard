/** Comma-separated allowlist. Falls back to single ALLOWED_EMAIL. */
export function getAllowedEmails(): string[] {
  const list = process.env.ALLOWED_EMAILS || process.env.ALLOWED_EMAIL || "";
  return list
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = getAllowedEmails();
  if (allowed.length === 0) return false;
  return allowed.includes(email.toLowerCase());
}

export function isDemoMode() {
  return process.env.DEMO_MODE === "true";
}
