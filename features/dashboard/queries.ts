import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { requireDb } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import {
  cashAccounts,
  emergencyFund,
  expenseCategories,
  expenses,
  goals,
  investments,
  loanPayments,
  loans,
  notifications,
  recurringRules,
  salaryEntries,
  settings,
  netWorthSnapshots,
} from "@/lib/db/schema";
import {
  calculateHealthScore,
  ratioBps,
  savingsRateBps,
  remainingTenureMonths,
  interestSavedByPrepayment,
  estimateCompletionMonths,
  sipFutureValue,
} from "@/lib/finance";
import { generateInsights } from "@/lib/insights/engine";

export function monthKey(date = new Date()) {
  return format(startOfMonth(date), "yyyy-MM-dd");
}

/** Inclusive start/end dates for a month key like `2026-06-01`. */
function monthBounds(monthStartIso: string) {
  const d = new Date(monthStartIso);
  return {
    start: format(startOfMonth(d), "yyyy-MM-dd"),
    end: format(endOfMonth(d), "yyyy-MM-dd"),
  };
}

function salaryTotal(s: { basePaise: number; bonusPaise: number; otherPaise: number }) {
  return s.basePaise + s.bonusPaise + s.otherPaise;
}

function emptyEmergency(userId: string) {
  return {
    userId,
    currentPaise: 0,
    targetPaise: 30000000,
    phase2TargetPaise: 45000000,
    monthlyContributionPaise: 0,
    updatedAt: new Date(),
  };
}

export async function getDashboardSummary(month = monthKey()) {
  const db = requireDb();
  const userId = await requireUserId();
  const prevMonth = monthKey(subMonths(new Date(month), 1));
  const { start: monthStart, end: monthEnd } = monthBounds(month);
  const { start: prevStart, end: prevEnd } = monthBounds(prevMonth);

  const [
    salaryRows,
    prevSalaryRows,
    monthExpenseRows,
    prevExpenseRows,
    accounts,
    investmentRows,
    loanRows,
    efRows,
    goalRows,
    categoryRows,
    recurring,
  ] = await Promise.all([
    db.select().from(salaryEntries).where(and(eq(salaryEntries.userId, userId), eq(salaryEntries.month, month))),
    db.select().from(salaryEntries).where(and(eq(salaryEntries.userId, userId), eq(salaryEntries.month, prevMonth))),
    db
      .select()
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, monthStart),
          lte(expenses.date, monthEnd)
        )
      ),
    db
      .select()
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, prevStart),
          lte(expenses.date, prevEnd)
        )
      ),
    db.select().from(cashAccounts).where(eq(cashAccounts.userId, userId)),
    db.select().from(investments).where(eq(investments.userId, userId)),
    db.select().from(loans).where(eq(loans.userId, userId)),
    db.select().from(emergencyFund).where(eq(emergencyFund.userId, userId)).limit(1),
    db.select().from(goals).where(eq(goals.userId, userId)),
    db.select().from(expenseCategories).orderBy(expenseCategories.sortOrder),
    db.select().from(recurringRules).where(eq(recurringRules.userId, userId)),
  ]);

  const salary = salaryRows[0];
  const prevSalary = prevSalaryRows[0];
  const income = salary ? salaryTotal(salary) : 0;
  const prevIncome = prevSalary ? salaryTotal(prevSalary) : 0;
  const expensesTotal = monthExpenseRows.reduce((s, e) => s + e.amountPaise, 0);
  const prevExpensesTotal = prevExpenseRows.reduce((s, e) => s + e.amountPaise, 0);

  const liquidCash = accounts.filter((a) => a.isLiquid).reduce((s, a) => s + a.balancePaise, 0);
  const investmentValue = investmentRows.reduce((s, i) => s + i.currentValuePaise, 0);
  const investmentInvested = investmentRows.reduce((s, i) => s + i.investedPaise, 0);
  const activeLoans = loanRows.filter((l) => l.status === "active");
  const loansOutstanding = activeLoans.reduce((s, l) => s + l.outstandingPaise, 0);
  const totalEmi = activeLoans.reduce((s, l) => s + l.emiPaise, 0);
  const ef = efRows[0] || emptyEmergency(userId);
  const assets = liquidCash + investmentValue + ef.currentPaise;
  const netWorth = assets - loansOutstanding;

  const trailingTotals = await Promise.all(
    [0, 1, 2].map(async (i) => {
      const m = monthKey(subMonths(new Date(month), i));
      const { start, end } = monthBounds(m);
      const rows = await db
        .select()
        .from(expenses)
        .where(
          and(
            eq(expenses.userId, userId),
            gte(expenses.date, start),
            lte(expenses.date, end)
          )
        );
      return rows.reduce((s, e) => s + e.amountPaise, 0);
    })
  );
  const burnRate = Math.round(trailingTotals.reduce((a, b) => a + b, 0) / 3);

  const sipPaise = investmentRows.reduce((s, i) => s + (i.sipAmountPaise || 0), 0);
  const homeRule = recurring.find((r) => r.label === "Home Contribution");
  const homePaise = homeRule?.amountPaise || 0;
  const savings = income - expensesTotal;
  const sr = savingsRateBps(income, expensesTotal);
  const prevSr = savingsRateBps(prevIncome, prevExpensesTotal);
  const efProgress = ef.targetPaise > 0 ? ef.currentPaise / ef.targetPaise : 0;

  const activeGoals = goalRows.filter((g) => g.status === "active");
  const goalsOnTrack = activeGoals.filter((g) => {
    if (g.targetPaise <= 0) return false;
    return g.currentPaise / g.targetPaise >= 0.1 || g.type === "emergency_fund";
  }).length;

  const hasAnyData =
    income > 0 ||
    expensesTotal > 0 ||
    liquidCash > 0 ||
    investmentValue > 0 ||
    loansOutstanding > 0 ||
    ef.currentPaise > 0;

  const healthScore = hasAnyData
    ? calculateHealthScore({
        emergencyProgress: efProgress,
        savingsRate: income > 0 ? savings / income : 0,
        debtToIncome: income > 0 ? (totalEmi + homePaise) / income : 0,
        investmentRate: income > 0 ? sipPaise / income : 0,
        expenseRatio: income > 0 ? expensesTotal / income : 0,
        goalsOnTrackRatio: activeGoals.length > 0 ? goalsOnTrack / activeGoals.length : 0,
      })
    : 0;

  const categoryBreakdown = categoryRows
    .map((c) => ({
      name: c.name,
      value: monthExpenseRows
        .filter((e) => e.categoryId === c.id)
        .reduce((s, e) => s + e.amountPaise, 0),
    }))
    .filter((c) => c.value > 0);

  const cashFlow = [
    { label: "Income", value: income },
    { label: "Expenses", value: expensesTotal },
    { label: "Savings", value: Math.max(0, savings) },
  ];

  const incomeGrowth =
    prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : null;

  const edu = activeLoans.find((l) => l.name.toLowerCase().includes("education"));

  const insights = hasAnyData
    ? generateInsights({
        thisMonthExpenses: expensesTotal,
        lastMonthExpenses: prevExpensesTotal,
        savingsRateBps: sr,
        lastSavingsRateBps: prevSr,
        emergencyCurrent: ef.currentPaise,
        emergencyTarget: ef.targetPaise,
        emergencyMonthly: ef.monthlyContributionPaise || 0,
        educationOutstanding: edu?.outstandingPaise || 0,
        educationRateBps: edu?.annualRateBps || 0,
        educationEmi: edu?.emiPaise || 0,
        investmentInvested,
        investmentCurrent: investmentValue,
      })
    : [];

  const goalsPreview = activeGoals
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 4)
    .map((g) => ({
      ...g,
      progress: g.targetPaise > 0 ? Math.min(100, (g.currentPaise / g.targetPaise) * 100) : 0,
    }));

  return {
    month,
    income,
    expensesTotal,
    remainingCash: liquidCash,
    emergencyFund: ef,
    efProgress: Math.min(100, efProgress * 100),
    netWorth,
    investmentValue,
    loansOutstanding,
    savingsRateBps: sr,
    cashFlowPaise: savings,
    burnRate,
    healthScore,
    incomeGrowth,
    categoryBreakdown,
    cashFlow,
    insights,
    goalsPreview,
    totalEmi,
    sipPaise,
    homePaise,
    assets,
    liabilities: loansOutstanding,
    isEmpty: !hasAnyData,
  };
}

export async function getSalaryEntries() {
  const db = requireDb();
  const userId = await requireUserId();
  return db
    .select()
    .from(salaryEntries)
    .where(eq(salaryEntries.userId, userId))
    .orderBy(desc(salaryEntries.month));
}

export async function getExpenses(filters?: {
  search?: string;
  categoryId?: string;
  from?: string;
  to?: string;
}) {
  const db = requireDb();
  const userId = await requireUserId();
  const cats = await db.select().from(expenseCategories);
  const catMap = new Map(cats.map((c) => [c.id, c.name]));

  const conditions = [eq(expenses.userId, userId)];
  if (filters?.categoryId) conditions.push(eq(expenses.categoryId, filters.categoryId));
  if (filters?.from) conditions.push(gte(expenses.date, filters.from));
  if (filters?.to) conditions.push(lte(expenses.date, filters.to));

  let list = await db
    .select()
    .from(expenses)
    .where(and(...conditions))
    .orderBy(desc(expenses.date));

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (e) =>
        e.merchant?.toLowerCase().includes(q) ||
        e.notes?.toLowerCase().includes(q) ||
        catMap.get(e.categoryId)?.toLowerCase().includes(q)
    );
  }

  return list.map((e) => ({
    ...e,
    categoryName: catMap.get(e.categoryId) || "—",
  }));
}

export async function getCategories() {
  const db = requireDb();
  return db.select().from(expenseCategories).orderBy(expenseCategories.sortOrder);
}

export async function getLoans() {
  const db = requireDb();
  const userId = await requireUserId();
  const rows = await db.select().from(loans).where(eq(loans.userId, userId));
  return rows.sort((a, b) => a.priority - b.priority);
}

export async function getLoanDetail(id: string) {
  const db = requireDb();
  const userId = await requireUserId();
  const [loan] = await db
    .select()
    .from(loans)
    .where(and(eq(loans.id, id), eq(loans.userId, userId)))
    .limit(1);
  if (!loan) return null;

  const remaining = remainingTenureMonths({
    outstandingPaise: loan.outstandingPaise,
    annualRateBps: loan.annualRateBps,
    emiPaise: loan.emiPaise,
    extraPaymentPaise: loan.extraPaymentPaise,
  });
  const saved = interestSavedByPrepayment({
    outstandingPaise: loan.outstandingPaise,
    annualRateBps: loan.annualRateBps,
    emiPaise: loan.emiPaise,
    extraPaymentPaise: loan.extraPaymentPaise || 2000000,
  });
  const payments = await db
    .select()
    .from(loanPayments)
    .where(eq(loanPayments.loanId, id))
    .orderBy(desc(loanPayments.paidOn));

  return { loan, remaining, saved, payments };
}

export async function getInvestments() {
  const db = requireDb();
  const userId = await requireUserId();
  const list = await db.select().from(investments).where(eq(investments.userId, userId));
  const totalInvested = list.reduce((s, i) => s + i.investedPaise, 0);
  const totalCurrent = list.reduce((s, i) => s + i.currentValuePaise, 0);
  const allocation = list.map((i) => ({
    name: i.name,
    value: i.currentValuePaise,
    assetClass: i.assetClass,
  }));
  const monthlySip = list.reduce((s, i) => s + (i.sipAmountPaise || 0), 0);
  const expectedFV = sipFutureValue({
    monthlyPaise: monthlySip,
    annualRatePercent: 12,
    months: 120,
  });
  return {
    list,
    totalInvested,
    totalCurrent,
    pnl: totalCurrent - totalInvested,
    allocation,
    monthlySip,
    expectedFV,
    isEmpty: list.length === 0,
  };
}

export async function getEmergencyFundView() {
  const db = requireDb();
  const userId = await requireUserId();
  const [row] = await db
    .select()
    .from(emergencyFund)
    .where(eq(emergencyFund.userId, userId))
    .limit(1);
  const ef = row || emptyEmergency(userId);
  const remaining = Math.max(0, ef.targetPaise - ef.currentPaise);
  const monthly = ef.monthlyContributionPaise || 0;
  const months = estimateCompletionMonths(remaining, monthly);
  const progress = ef.targetPaise > 0 ? (ef.currentPaise / ef.targetPaise) * 100 : 0;
  const phase2Remaining = Math.max(0, ef.phase2TargetPaise - ef.currentPaise);
  return { ef, remaining, months, progress, phase2Remaining };
}

export async function getGoalsView() {
  const db = requireDb();
  const userId = await requireUserId();
  const summary = await getDashboardSummary();
  const [ef] = await db
    .select()
    .from(emergencyFund)
    .where(eq(emergencyFund.userId, userId))
    .limit(1);
  const investmentRows = await db
    .select()
    .from(investments)
    .where(eq(investments.userId, userId));
  const loanRows = await db.select().from(loans).where(eq(loans.userId, userId));
  const goalRows = await db.select().from(goals).where(eq(goals.userId, userId));

  return goalRows
    .filter((g) => g.status === "active")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((g) => {
      let current = g.currentPaise;
      if (g.type === "emergency_fund") current = ef?.currentPaise || 0;
      if (g.type === "net_worth") current = summary.netWorth;
      if (g.type === "investment") {
        current = investmentRows.reduce((s, i) => s + i.currentValuePaise, 0);
      }
      if (g.type === "debt_payoff") {
        const loanId = (g.linkedEntity as { loanId?: string })?.loanId;
        const loan = loanRows.find((l) => l.id === loanId);
        if (loan && g.targetPaise > 0) {
          current = Math.max(0, g.targetPaise - loan.outstandingPaise);
        } else if (loan) {
          current = Math.max(0, loan.principalPaise - loan.outstandingPaise);
        } else {
          current = 0;
        }
      }
      const target = g.targetPaise > 0 ? g.targetPaise : 1;
      const progress = Math.min(100, (current / target) * 100);
      const remaining = Math.max(0, (g.targetPaise || 0) - current);
      const contribution = Math.max(100000, Math.round(remaining / 24));
      const etaMonths = estimateCompletionMonths(remaining, contribution);
      return { ...g, currentPaise: current, progress, remaining, contribution, etaMonths };
    });
}

export async function getNetWorthSeries() {
  const summary = await getDashboardSummary();
  const db = requireDb();
  const userId = await requireUserId();
  const snaps = await db
    .select()
    .from(netWorthSnapshots)
    .where(eq(netWorthSnapshots.userId, userId))
    .orderBy(netWorthSnapshots.asOf);

  if (snaps.length === 0) {
    return {
      current: summary,
      series: [{ label: format(new Date(), "MMM yy"), value: summary.netWorth }],
      monthlyChange: 0,
    };
  }

  const series = snaps.map((s) => ({
    label: s.asOf.slice(0, 7),
    value: s.netPaise,
  }));
  const monthlyChange =
    snaps.length >= 2
      ? snaps[snaps.length - 1].netPaise - snaps[snaps.length - 2].netPaise
      : 0;

  return { current: summary, series, monthlyChange };
}

export async function getReports() {
  const summary = await getDashboardSummary();
  const income = summary.income;
  return {
    month: summary.month,
    income,
    expenses: summary.expensesTotal,
    savings: summary.cashFlowPaise,
    invested: summary.sipPaise,
    savingsRateBps: summary.savingsRateBps,
    expenseRatioBps: ratioBps(summary.expensesTotal, income),
    debtRatioBps: ratioBps(summary.totalEmi, income),
    investmentRatioBps: ratioBps(summary.sipPaise, income),
    healthScore: summary.healthScore,
    cashFlow: summary.cashFlowPaise,
    insights: summary.insights,
    isEmpty: summary.isEmpty,
  };
}

export async function getReminders() {
  const db = requireDb();
  const userId = await requireUserId();
  return db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), sql`${notifications.completedAt} IS NULL`));
}

export async function getSettings() {
  const db = requireDb();
  const userId = await requireUserId();
  const [row] = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);
  return (
    row || {
      userId,
      currency: "INR",
      theme: "dark" as const,
      locale: "en-IN",
      notificationsEnabled: true,
      monthStartDay: 1,
      exportPrefs: {},
    }
  );
}

export async function getCashAccounts() {
  const db = requireDb();
  const userId = await requireUserId();
  return db.select().from(cashAccounts).where(eq(cashAccounts.userId, userId));
}

export async function getRecurringRules() {
  const db = requireDb();
  const userId = await requireUserId();
  const rules = await db.select().from(recurringRules).where(eq(recurringRules.userId, userId));
  const cats = await db.select().from(expenseCategories);
  const catMap = new Map(cats.map((c) => [c.id, c.name]));
  return rules.map((r) => ({
    ...r,
    categoryName: catMap.get(r.categoryId) || "—",
  }));
}

export async function getUserExportPayload() {
  const db = requireDb();
  const userId = await requireUserId();
  const [
    accounts,
    salaries,
    expenseRows,
    loanRows,
    investmentRows,
    goalRows,
    ef,
    notifs,
    userSettings,
    recurring,
  ] = await Promise.all([
    db.select().from(cashAccounts).where(eq(cashAccounts.userId, userId)),
    db.select().from(salaryEntries).where(eq(salaryEntries.userId, userId)),
    db.select().from(expenses).where(eq(expenses.userId, userId)),
    db.select().from(loans).where(eq(loans.userId, userId)),
    db.select().from(investments).where(eq(investments.userId, userId)),
    db.select().from(goals).where(eq(goals.userId, userId)),
    db.select().from(emergencyFund).where(eq(emergencyFund.userId, userId)),
    db.select().from(notifications).where(eq(notifications.userId, userId)),
    db.select().from(settings).where(eq(settings.userId, userId)),
    db.select().from(recurringRules).where(eq(recurringRules.userId, userId)),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    userId,
    cashAccounts: accounts,
    salaryEntries: salaries,
    expenses: expenseRows,
    loans: loanRows,
    investments: investmentRows,
    goals: goalRows,
    emergencyFund: ef[0] || null,
    notifications: notifs,
    settings: userSettings[0] || null,
    recurringRules: recurring,
  };
}
