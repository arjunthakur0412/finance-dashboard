export function isDemoMode() {
  return process.env.DEMO_MODE === "true" || !process.env.DATABASE_URL;
}
