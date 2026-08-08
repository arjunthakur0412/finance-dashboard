import { eq } from "drizzle-orm";
import { requireDb } from "@/lib/db";
import {
  settings,
  emergencyFund,
  cashAccounts,
  goals,
  expenseCategories,
} from "@/lib/db/schema";
import { format } from "date-fns";

const DEFAULT_GOALS = [
  {
    slug: "emergency-fund",
    title: "Emergency Fund",
    type: "emergency_fund",
    targetPaise: 30000000, // ₹3L
    sortOrder: 1,
    linkedEntity: { emergencyFund: true },
  },
  {
    slug: "education-loan-closure",
    title: "Education Loan Closure",
    type: "debt_payoff",
    targetPaise: 0,
    sortOrder: 2,
    linkedEntity: {},
  },
  {
    slug: "10l-investments",
    title: "10L Investments",
    type: "investment",
    targetPaise: 100000000,
    sortOrder: 3,
    linkedEntity: {},
  },
  {
    slug: "25l-net-worth",
    title: "25L Net Worth",
    type: "net_worth",
    targetPaise: 250000000,
    sortOrder: 4,
    linkedEntity: {},
  },
  {
    slug: "50l-net-worth",
    title: "50L Net Worth",
    type: "net_worth",
    targetPaise: 500000000,
    sortOrder: 5,
    linkedEntity: {},
  },
  {
    slug: "1cr-net-worth",
    title: "1 Crore Net Worth",
    type: "net_worth",
    targetPaise: 1000000000,
    sortOrder: 6,
    linkedEntity: {},
  },
] as const;

/** Ensure shared categories exist (idempotent). */
export async function ensureCategories() {
  const db = requireDb();
  const existing = await db.select().from(expenseCategories).limit(1);
  if (existing.length > 0) return;

  const cats = [
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

  await db.insert(expenseCategories).values(
    cats.map(([slug, name, sortOrder]) => ({ slug, name, sortOrder }))
  );
}

/**
 * Create empty personal workspace for a newly signed-in user.
 * No demo money — everything starts at zero.
 */
export async function ensureUserWorkspace(userId: string) {
  const db = requireDb();
  await ensureCategories();

  const [existingSettings] = await db
    .select()
    .from(settings)
    .where(eq(settings.userId, userId))
    .limit(1);

  if (existingSettings) return { created: false };

  await db.insert(settings).values({
    userId,
    currency: "INR",
    theme: "dark",
    locale: "en-IN",
    notificationsEnabled: true,
    monthStartDay: 1,
  });

  await db.insert(emergencyFund).values({
    userId,
    currentPaise: 0,
    targetPaise: 30000000,
    phase2TargetPaise: 45000000,
    monthlyContributionPaise: 0,
  });

  await db.insert(cashAccounts).values({
    userId,
    name: "Primary Bank",
    type: "bank",
    balancePaise: 0,
    isLiquid: true,
  });

  await db.insert(goals).values(
    DEFAULT_GOALS.map((g) => ({
      userId,
      slug: g.slug,
      title: g.title,
      type: g.type,
      targetPaise: g.targetPaise,
      currentPaise: 0,
      linkedEntity: g.linkedEntity,
      status: "active" as const,
      sortOrder: g.sortOrder,
    }))
  );

  return { created: true, since: format(new Date(), "yyyy-MM-dd") };
}
