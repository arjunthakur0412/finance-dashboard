import { rupeesToPaise } from "@/lib/money";

export type MemoryUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

const USER_ID = "00000000-0000-4000-8000-000000000001";

const categories = [
  { id: "cat-home", slug: "home_contribution", name: "Home Contribution", sortOrder: 1 },
  { id: "cat-parents", slug: "parents", name: "Parents", sortOrder: 2 },
  { id: "cat-fuel", slug: "fuel", name: "Fuel", sortOrder: 3 },
  { id: "cat-food", slug: "food", name: "Food", sortOrder: 4 },
  { id: "cat-shopping", slug: "shopping", name: "Shopping", sortOrder: 5 },
  { id: "cat-travel", slug: "travel", name: "Travel", sortOrder: 6 },
  { id: "cat-entertainment", slug: "entertainment", name: "Entertainment", sortOrder: 7 },
  { id: "cat-subscriptions", slug: "subscriptions", name: "Subscriptions", sortOrder: 8 },
  { id: "cat-medical", slug: "medical", name: "Medical", sortOrder: 9 },
  { id: "cat-bills", slug: "bills", name: "Bills", sortOrder: 10 },
  { id: "cat-misc", slug: "miscellaneous", name: "Miscellaneous", sortOrder: 11 },
];

function monthStart(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function createInitialStore() {
  const now = new Date();
  const thisMonth = monthStart(now);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = monthStart(lastMonthDate);

  return {
    user: {
      id: USER_ID,
      name: "Arjun",
      email: process.env.ALLOWED_EMAIL || "you@example.com",
      image: null as string | null,
    } satisfies MemoryUser,
    cashAccounts: [
      {
        id: "acc-primary",
        userId: USER_ID,
        name: "Primary Bank",
        type: "bank" as const,
        balancePaise: Number(rupeesToPaise(85000)),
        isLiquid: true,
        updatedAt: now,
      },
      {
        id: "acc-cash",
        userId: USER_ID,
        name: "Cash",
        type: "cash" as const,
        balancePaise: Number(rupeesToPaise(5000)),
        isLiquid: true,
        updatedAt: now,
      },
    ],
    categories,
    salaryEntries: [
      {
        id: "sal-last",
        userId: USER_ID,
        month: lastMonth,
        basePaise: Number(rupeesToPaise(120000)),
        bonusPaise: 0,
        otherPaise: 0,
        notes: null as string | null,
        createdAt: lastMonthDate,
      },
      {
        id: "sal-this",
        userId: USER_ID,
        month: thisMonth,
        basePaise: Number(rupeesToPaise(125000)),
        bonusPaise: Number(rupeesToPaise(10000)),
        otherPaise: 0,
        notes: null as string | null,
        createdAt: now,
      },
    ],
    recurringRules: [
      {
        id: "rec-home",
        userId: USER_ID,
        label: "Home Contribution",
        categoryId: "cat-home",
        amountPaise: Number(rupeesToPaise(20000)),
        dayOfMonth: 1,
        active: true,
        startsOn: "2025-01-01",
        endsOn: null as string | null,
      },
    ],
    expenses: [
      {
        id: "exp-1",
        userId: USER_ID,
        categoryId: "cat-home",
        amountPaise: Number(rupeesToPaise(20000)),
        date: thisMonth,
        merchant: "Family" as string | null,
        notes: "Monthly home contribution" as string | null,
        accountId: "acc-primary" as string | null,
        recurringRuleId: "rec-home" as string | null,
        createdAt: now,
      },
      {
        id: "exp-2",
        userId: USER_ID,
        categoryId: "cat-food",
        amountPaise: Number(rupeesToPaise(8500)),
        date: today(),
        merchant: "Groceries" as string | null,
        notes: null as string | null,
        accountId: "acc-primary" as string | null,
        recurringRuleId: null as string | null,
        createdAt: now,
      },
      {
        id: "exp-3",
        userId: USER_ID,
        categoryId: "cat-fuel",
        amountPaise: Number(rupeesToPaise(4200)),
        date: today(),
        merchant: "Petrol" as string | null,
        notes: null as string | null,
        accountId: "acc-primary" as string | null,
        recurringRuleId: null as string | null,
        createdAt: now,
      },
      {
        id: "exp-4",
        userId: USER_ID,
        categoryId: "cat-subscriptions",
        amountPaise: Number(rupeesToPaise(1499)),
        date: thisMonth,
        merchant: "Streaming" as string | null,
        notes: null as string | null,
        accountId: "acc-primary" as string | null,
        recurringRuleId: null as string | null,
        createdAt: now,
      },
      {
        id: "exp-5",
        userId: USER_ID,
        categoryId: "cat-bills",
        amountPaise: Number(rupeesToPaise(3500)),
        date: thisMonth,
        merchant: "Utilities" as string | null,
        notes: null as string | null,
        accountId: "acc-primary" as string | null,
        recurringRuleId: null as string | null,
        createdAt: now,
      },
    ],
    loans: [
      {
        id: "loan-car",
        userId: USER_ID,
        name: "Car Loan",
        principalPaise: Number(rupeesToPaise(1219821)),
        outstandingPaise: Number(rupeesToPaise(1155278)),
        annualRateBps: 850,
        emiPaise: Number(rupeesToPaise(30153)),
        tenureMonths: 48,
        monthsPaid: 5,
        startDate: "2025-03-01",
        priority: 2,
        status: "active" as "active" | "closed",
        extraPaymentPaise: 0,
        createdAt: now,
      },
      {
        id: "loan-edu",
        userId: USER_ID,
        name: "Education Loan",
        principalPaise: Number(rupeesToPaise(285000)),
        outstandingPaise: Number(rupeesToPaise(327204)),
        annualRateBps: 1080,
        emiPaise: Number(rupeesToPaise(3658)),
        tenureMonths: 180,
        monthsPaid: 12,
        startDate: "2024-01-01",
        priority: 1,
        status: "active" as "active" | "closed",
        extraPaymentPaise: 0,
        createdAt: now,
      },
    ],
    loanPayments: [] as Array<{
      id: string;
      loanId: string;
      paidOn: string;
      amountPaise: number;
      principalComponentPaise: number;
      interestComponentPaise: number;
      isExtra: boolean;
      notes: string | null;
    }>,
    investments: [
      {
        id: "inv-sip",
        userId: USER_ID,
        name: "Monthly SIP",
        assetClass: "sip" as
          | "mutual_fund"
          | "sip"
          | "stock"
          | "fd"
          | "ppf"
          | "epf"
          | "gold"
          | "crypto",
        investedPaise: Number(rupeesToPaise(72000)),
        currentValuePaise: Number(rupeesToPaise(78500)),
        sipAmountPaise: Number(rupeesToPaise(6000)),
        sipDay: 5,
        assumedAnnualRatePercent: 12,
        meta: {},
        updatedAt: now,
      },
      {
        id: "inv-mf",
        userId: USER_ID,
        name: "Equity Mutual Funds",
        assetClass: "mutual_fund" as
          | "mutual_fund"
          | "sip"
          | "stock"
          | "fd"
          | "ppf"
          | "epf"
          | "gold"
          | "crypto",
        investedPaise: Number(rupeesToPaise(150000)),
        currentValuePaise: Number(rupeesToPaise(168000)),
        sipAmountPaise: null as number | null,
        sipDay: null as number | null,
        assumedAnnualRatePercent: 12,
        meta: {},
        updatedAt: now,
      },
      {
        id: "inv-epf",
        userId: USER_ID,
        name: "EPF",
        assetClass: "epf" as
          | "mutual_fund"
          | "sip"
          | "stock"
          | "fd"
          | "ppf"
          | "epf"
          | "gold"
          | "crypto",
        investedPaise: Number(rupeesToPaise(95000)),
        currentValuePaise: Number(rupeesToPaise(102000)),
        sipAmountPaise: null as number | null,
        sipDay: null as number | null,
        assumedAnnualRatePercent: 8,
        meta: {},
        updatedAt: now,
      },
    ],
    investmentTransactions: [] as Array<{
      id: string;
      investmentId: string;
      type: "buy" | "sell" | "sip" | "dividend" | "interest" | "adjust";
      amountPaise: number;
      units: number | null;
      navPaise: number | null;
      occurredOn: string;
      notes: string | null;
    }>,
    goals: [
      {
        id: "goal-ef",
        userId: USER_ID,
        slug: "emergency-fund",
        title: "Emergency Fund",
        type: "emergency_fund",
        targetPaise: Number(rupeesToPaise(300000)),
        currentPaise: Number(rupeesToPaise(24000)),
        targetDate: null as string | null,
        linkedEntity: { emergencyFund: true },
        status: "active" as "active" | "completed" | "paused",
        sortOrder: 1,
      },
      {
        id: "goal-edu",
        userId: USER_ID,
        slug: "education-loan-closure",
        title: "Education Loan Closure",
        type: "debt_payoff",
        targetPaise: Number(rupeesToPaise(327204)),
        currentPaise: Number(rupeesToPaise(0)),
        targetDate: null as string | null,
        linkedEntity: { loanId: "loan-edu" },
        status: "active" as "active" | "completed" | "paused",
        sortOrder: 2,
      },
      {
        id: "goal-10l",
        userId: USER_ID,
        slug: "10l-investments",
        title: "10L Investments",
        type: "investment",
        targetPaise: Number(rupeesToPaise(1000000)),
        currentPaise: Number(rupeesToPaise(348500)),
        targetDate: null as string | null,
        linkedEntity: {},
        status: "active" as "active" | "completed" | "paused",
        sortOrder: 3,
      },
      {
        id: "goal-25l",
        userId: USER_ID,
        slug: "25l-net-worth",
        title: "25L Net Worth",
        type: "net_worth",
        targetPaise: Number(rupeesToPaise(2500000)),
        currentPaise: 0,
        targetDate: null as string | null,
        linkedEntity: {},
        status: "active" as "active" | "completed" | "paused",
        sortOrder: 4,
      },
      {
        id: "goal-50l",
        userId: USER_ID,
        slug: "50l-net-worth",
        title: "50L Net Worth",
        type: "net_worth",
        targetPaise: Number(rupeesToPaise(5000000)),
        currentPaise: 0,
        targetDate: null as string | null,
        linkedEntity: {},
        status: "active" as "active" | "completed" | "paused",
        sortOrder: 5,
      },
      {
        id: "goal-1cr",
        userId: USER_ID,
        slug: "1cr-net-worth",
        title: "1 Crore Net Worth",
        type: "net_worth",
        targetPaise: Number(rupeesToPaise(10000000)),
        currentPaise: 0,
        targetDate: null as string | null,
        linkedEntity: {},
        status: "active" as "active" | "completed" | "paused",
        sortOrder: 6,
      },
    ],
    goalProgress: [] as Array<{
      id: string;
      goalId: string;
      recordedOn: string;
      valuePaise: number;
      note: string | null;
    }>,
    emergencyFund: {
      userId: USER_ID,
      currentPaise: Number(rupeesToPaise(24000)),
      targetPaise: Number(rupeesToPaise(300000)),
      phase2TargetPaise: Number(rupeesToPaise(450000)),
      monthlyContributionPaise: Number(rupeesToPaise(20000)),
      updatedAt: now,
    },
    notifications: [
      {
        id: "n1",
        userId: USER_ID,
        kind: "salary_received" as const,
        title: "Confirm salary received",
        body: "Log this month's salary entry",
        dueOn: thisMonth,
        completedAt: null as Date | null,
        meta: {},
      },
      {
        id: "n2",
        userId: USER_ID,
        kind: "pay_emi" as const,
        title: "Pay EMIs",
        body: "Car + Education loan EMIs due",
        dueOn: today(),
        completedAt: null as Date | null,
        meta: {},
      },
      {
        id: "n3",
        userId: USER_ID,
        kind: "pay_sip" as const,
        title: "Pay SIP",
        body: "₹6,000 monthly SIP",
        dueOn: today(),
        completedAt: null as Date | null,
        meta: {},
      },
      {
        id: "n4",
        userId: USER_ID,
        kind: "review_expenses" as const,
        title: "Review expenses",
        body: "Categorize and review this month's spending",
        dueOn: today(),
        completedAt: null as Date | null,
        meta: {},
      },
      {
        id: "n5",
        userId: USER_ID,
        kind: "update_investments" as const,
        title: "Update investment values",
        body: "Mark current portfolio values",
        dueOn: today(),
        completedAt: null as Date | null,
        meta: {},
      },
    ],
    settings: {
      userId: USER_ID,
      currency: "INR",
      theme: "dark" as "dark" | "light" | "system",
      locale: "en-IN",
      notificationsEnabled: true,
      monthStartDay: 1,
      exportPrefs: {},
    },
    netWorthSnapshots: [] as Array<{
      id: string;
      userId: string;
      asOf: string;
      assetsPaise: number;
      liabilitiesPaise: number;
      netPaise: number;
    }>,
    monthlyReports: [] as Array<{
      id: string;
      userId: string;
      month: string;
      incomePaise: number;
      expensesPaise: number;
      savingsPaise: number;
      investedPaise: number;
      savingsRateBps: number;
      expenseRatioBps: number;
      debtRatioBps: number;
      investmentRatioBps: number;
      healthScore: number;
      insights: string[];
    }>,
  };
}

export type MemoryStore = ReturnType<typeof createInitialStore>;

const globalForStore = globalThis as unknown as { __financeStore?: MemoryStore };

export function getStore(): MemoryStore {
  if (!globalForStore.__financeStore) {
    globalForStore.__financeStore = createInitialStore();
  }
  return globalForStore.__financeStore;
}

export function resetStore() {
  globalForStore.__financeStore = createInitialStore();
}

export function newId(prefix = "id") {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export const DEMO_USER_ID = USER_ID;
