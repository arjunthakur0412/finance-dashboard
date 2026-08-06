/**
 * Seed Neon database with categories + user baseline.
 * Usage: DEMO_MODE=false DATABASE_URL=... npx tsx scripts/seed.ts
 */
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/db/schema";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL required");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  const categories = [
    ["home_contribution", "Home Contribution", 1],
    ["parents", "Parents", 2],
    ["fuel", "Fuel", 3],
    ["food", "Food", 4],
    ["shopping", "Shopping", 5],
    ["travel", "Travel", 6],
    ["entertainment", "Entertainment", 7],
    ["subscriptions", "Subscriptions", 8],
    ["medical", "Medical", 9],
    ["bills", "Bills", 10],
    ["miscellaneous", "Miscellaneous", 11],
  ] as const;

  for (const [slug, name, sortOrder] of categories) {
    await db
      .insert(schema.expenseCategories)
      .values({ slug, name, sortOrder })
      .onConflictDoNothing();
  }

  console.log("Seeded expense categories.");
  console.log("Create your user via Google login, then run app seed UI or insert manually.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
