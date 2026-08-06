import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  bigint,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const cashAccountTypeEnum = pgEnum("cash_account_type", [
  "bank",
  "cash",
  "wallet",
]);

export const loanStatusEnum = pgEnum("loan_status", ["active", "closed"]);

export const assetClassEnum = pgEnum("asset_class", [
  "mutual_fund",
  "sip",
  "stock",
  "fd",
  "ppf",
  "epf",
  "gold",
  "crypto",
]);

export const investmentTxTypeEnum = pgEnum("investment_tx_type", [
  "buy",
  "sell",
  "sip",
  "dividend",
  "interest",
  "adjust",
]);

export const goalStatusEnum = pgEnum("goal_status", [
  "active",
  "completed",
  "paused",
]);

export const themeEnum = pgEnum("theme", ["dark", "light", "system"]);

export const notificationKindEnum = pgEnum("notification_kind", [
  "salary_received",
  "pay_emi",
  "pay_sip",
  "review_expenses",
  "update_investments",
  "custom",
]);

// ─── Auth.js tables ──────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const authAccounts = pgTable(
  "auth_accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })]
);

export const authSessions = pgTable("auth_sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const authVerificationTokens = pgTable(
  "auth_verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })]
);

// ─── Domain tables ───────────────────────────────────────────────────────────

export const cashAccounts = pgTable(
  "cash_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: cashAccountTypeEnum("type").notNull().default("bank"),
    balancePaise: bigint("balance_paise", { mode: "number" }).notNull().default(0),
    isLiquid: boolean("is_liquid").notNull().default(true),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("cash_accounts_user_idx").on(t.userId)]
);

export const salaryEntries = pgTable(
  "salary_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    month: date("month", { mode: "string" }).notNull(),
    basePaise: bigint("base_paise", { mode: "number" }).notNull().default(0),
    bonusPaise: bigint("bonus_paise", { mode: "number" }).notNull().default(0),
    otherPaise: bigint("other_paise", { mode: "number" }).notNull().default(0),
    notes: text("notes"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("salary_user_month_uidx").on(t.userId, t.month),
    index("salary_user_idx").on(t.userId),
  ]
);

export const expenseCategories = pgTable("expense_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const recurringRules = pgTable(
  "recurring_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => expenseCategories.id),
    amountPaise: bigint("amount_paise", { mode: "number" }).notNull(),
    dayOfMonth: integer("day_of_month").notNull().default(1),
    active: boolean("active").notNull().default(true),
    startsOn: date("starts_on", { mode: "string" }).notNull(),
    endsOn: date("ends_on", { mode: "string" }),
  },
  (t) => [index("recurring_user_idx").on(t.userId)]
);

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => expenseCategories.id),
    amountPaise: bigint("amount_paise", { mode: "number" }).notNull(),
    date: date("date", { mode: "string" }).notNull(),
    merchant: text("merchant"),
    notes: text("notes"),
    accountId: uuid("account_id").references(() => cashAccounts.id, {
      onDelete: "set null",
    }),
    recurringRuleId: uuid("recurring_rule_id").references(() => recurringRules.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("expenses_user_date_idx").on(t.userId, t.date),
    index("expenses_user_category_idx").on(t.userId, t.categoryId, t.date),
  ]
);

export const loans = pgTable(
  "loans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    principalPaise: bigint("principal_paise", { mode: "number" }).notNull(),
    outstandingPaise: bigint("outstanding_paise", { mode: "number" }).notNull(),
    annualRateBps: integer("annual_rate_bps").notNull(),
    emiPaise: bigint("emi_paise", { mode: "number" }).notNull(),
    tenureMonths: integer("tenure_months").notNull(),
    monthsPaid: integer("months_paid").notNull().default(0),
    startDate: date("start_date", { mode: "string" }).notNull(),
    priority: integer("priority").notNull().default(100),
    status: loanStatusEnum("status").notNull().default("active"),
    extraPaymentPaise: bigint("extra_payment_paise", { mode: "number" })
      .notNull()
      .default(0),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("loans_user_idx").on(t.userId)]
);

export const loanPayments = pgTable(
  "loan_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    loanId: uuid("loan_id")
      .notNull()
      .references(() => loans.id, { onDelete: "cascade" }),
    paidOn: date("paid_on", { mode: "string" }).notNull(),
    amountPaise: bigint("amount_paise", { mode: "number" }).notNull(),
    principalComponentPaise: bigint("principal_component_paise", {
      mode: "number",
    })
      .notNull()
      .default(0),
    interestComponentPaise: bigint("interest_component_paise", {
      mode: "number",
    })
      .notNull()
      .default(0),
    isExtra: boolean("is_extra").notNull().default(false),
    notes: text("notes"),
  },
  (t) => [index("loan_payments_loan_idx").on(t.loanId)]
);

export const investments = pgTable(
  "investments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    assetClass: assetClassEnum("asset_class").notNull(),
    investedPaise: bigint("invested_paise", { mode: "number" }).notNull().default(0),
    currentValuePaise: bigint("current_value_paise", { mode: "number" })
      .notNull()
      .default(0),
    sipAmountPaise: bigint("sip_amount_paise", { mode: "number" }),
    sipDay: integer("sip_day"),
    assumedAnnualRatePercent: integer("assumed_annual_rate_percent").default(12),
    meta: jsonb("meta").$type<Record<string, unknown>>().default({}),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("investments_user_idx").on(t.userId)]
);

export const investmentTransactions = pgTable(
  "investment_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    investmentId: uuid("investment_id")
      .notNull()
      .references(() => investments.id, { onDelete: "cascade" }),
    type: investmentTxTypeEnum("type").notNull(),
    amountPaise: bigint("amount_paise", { mode: "number" }).notNull(),
    units: integer("units"),
    navPaise: bigint("nav_paise", { mode: "number" }),
    occurredOn: date("occurred_on", { mode: "string" }).notNull(),
    notes: text("notes"),
  },
  (t) => [index("inv_tx_investment_idx").on(t.investmentId)]
);

export const goals = pgTable(
  "goals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    type: text("type").notNull(),
    targetPaise: bigint("target_paise", { mode: "number" }).notNull(),
    currentPaise: bigint("current_paise", { mode: "number" }).notNull().default(0),
    targetDate: date("target_date", { mode: "string" }),
    linkedEntity: jsonb("linked_entity").$type<Record<string, unknown>>().default({}),
    status: goalStatusEnum("status").notNull().default("active"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [
    uniqueIndex("goals_user_slug_uidx").on(t.userId, t.slug),
    index("goals_user_idx").on(t.userId),
  ]
);

export const goalProgress = pgTable(
  "goal_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    goalId: uuid("goal_id")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    recordedOn: date("recorded_on", { mode: "string" }).notNull(),
    valuePaise: bigint("value_paise", { mode: "number" }).notNull(),
    note: text("note"),
  },
  (t) => [index("goal_progress_goal_idx").on(t.goalId)]
);

export const emergencyFund = pgTable("emergency_fund", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  currentPaise: bigint("current_paise", { mode: "number" }).notNull().default(0),
  targetPaise: bigint("target_paise", { mode: "number" }).notNull(),
  phase2TargetPaise: bigint("phase2_target_paise", { mode: "number" }).notNull(),
  monthlyContributionPaise: bigint("monthly_contribution_paise", {
    mode: "number",
  }),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: notificationKindEnum("kind").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    dueOn: date("due_on", { mode: "string" }).notNull(),
    completedAt: timestamp("completed_at", { mode: "date" }),
    meta: jsonb("meta").$type<Record<string, unknown>>().default({}),
  },
  (t) => [index("notifications_user_due_idx").on(t.userId, t.dueOn)]
);

export const settings = pgTable("settings", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  currency: text("currency").notNull().default("INR"),
  theme: themeEnum("theme").notNull().default("dark"),
  locale: text("locale").notNull().default("en-IN"),
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
  monthStartDay: integer("month_start_day").notNull().default(1),
  exportPrefs: jsonb("export_prefs").$type<Record<string, unknown>>().default({}),
});

export const netWorthSnapshots = pgTable(
  "net_worth_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    asOf: date("as_of", { mode: "string" }).notNull(),
    assetsPaise: bigint("assets_paise", { mode: "number" }).notNull(),
    liabilitiesPaise: bigint("liabilities_paise", { mode: "number" }).notNull(),
    netPaise: bigint("net_paise", { mode: "number" }).notNull(),
  },
  (t) => [
    uniqueIndex("net_worth_user_asof_uidx").on(t.userId, t.asOf),
    index("net_worth_user_idx").on(t.userId),
  ]
);

export const monthlyReports = pgTable(
  "monthly_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    month: date("month", { mode: "string" }).notNull(),
    incomePaise: bigint("income_paise", { mode: "number" }).notNull().default(0),
    expensesPaise: bigint("expenses_paise", { mode: "number" }).notNull().default(0),
    savingsPaise: bigint("savings_paise", { mode: "number" }).notNull().default(0),
    investedPaise: bigint("invested_paise", { mode: "number" }).notNull().default(0),
    savingsRateBps: integer("savings_rate_bps").notNull().default(0),
    expenseRatioBps: integer("expense_ratio_bps").notNull().default(0),
    debtRatioBps: integer("debt_ratio_bps").notNull().default(0),
    investmentRatioBps: integer("investment_ratio_bps").notNull().default(0),
    healthScore: integer("health_score").notNull().default(0),
    insights: jsonb("insights").$type<string[]>().default([]),
  },
  (t) => [uniqueIndex("monthly_reports_user_month_uidx").on(t.userId, t.month)]
);

// ─── Relations ───────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many, one }) => ({
  cashAccounts: many(cashAccounts),
  salaryEntries: many(salaryEntries),
  expenses: many(expenses),
  loans: many(loans),
  investments: many(investments),
  goals: many(goals),
  emergencyFund: one(emergencyFund),
  settings: one(settings),
  notifications: many(notifications),
}));

export const loansRelations = relations(loans, ({ many }) => ({
  payments: many(loanPayments),
}));

export const investmentsRelations = relations(investments, ({ many }) => ({
  transactions: many(investmentTransactions),
}));

export const goalsRelations = relations(goals, ({ many }) => ({
  progress: many(goalProgress),
}));

export type User = typeof users.$inferSelect;
export type CashAccount = typeof cashAccounts.$inferSelect;
export type SalaryEntry = typeof salaryEntries.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type Loan = typeof loans.$inferSelect;
export type Investment = typeof investments.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type EmergencyFund = typeof emergencyFund.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type NetWorthSnapshot = typeof netWorthSnapshots.$inferSelect;
export type MonthlyReport = typeof monthlyReports.$inferSelect;
