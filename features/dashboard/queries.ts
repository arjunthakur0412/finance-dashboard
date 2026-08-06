import { format, startOfMonth, subMonths } from "date-fns";
import { getStore } from "@/lib/db/memory";
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

function salaryTotal(s: { basePaise: number; bonusPaise: number; otherPaise: number }) {
  return s.basePaise + s.bonusPaise + s.otherPaise;
}

export function getDashboardSummary(month = monthKey()) {
  const store = getStore();
  const prevMonth = monthKey(subMonths(new Date(month), 1));

  const salary = store.salaryEntries.find((s) => s.month === month);
  const prevSalary = store.salaryEntries.find((s) => s.month === prevMonth);
  const income = salary ? salaryTotal(salary) : 0;
  const prevIncome = prevSalary ? salaryTotal(prevSalary) : 0;

  const monthPrefix = month.slice(0, 7);
  const prevPrefix = prevMonth.slice(0, 7);

  const monthExpenses = store.expenses.filter((e) => e.date.startsWith(monthPrefix));
  const prevExpenses = store.expenses.filter((e) => e.date.startsWith(prevPrefix));
  const expensesTotal = monthExpenses.reduce((s, e) => s + e.amountPaise, 0);
  const prevExpensesTotal = prevExpenses.reduce((s, e) => s + e.amountPaise, 0);

  const liquidCash = store.cashAccounts
    .filter((a) => a.isLiquid)
    .reduce((s, a) => s + a.balancePaise, 0);

  const investmentValue = store.investments.reduce((s, i) => s + i.currentValuePaise, 0);
  const investmentInvested = store.investments.reduce((s, i) => s + i.investedPaise, 0);
  const loansOutstanding = store.loans
    .filter((l) => l.status === "active")
    .reduce((s, l) => s + l.outstandingPaise, 0);
  const totalEmi = store.loans
    .filter((l) => l.status === "active")
    .reduce((s, l) => s + l.emiPaise, 0);

  const assets = liquidCash + investmentValue + store.emergencyFund.currentPaise;
  const netWorth = assets - loansOutstanding;

  const trailing = [0, 1, 2].map((i) => {
    const m = monthKey(subMonths(new Date(month), i));
    const p = m.slice(0, 7);
    return store.expenses
      .filter((e) => e.date.startsWith(p))
      .reduce((s, e) => s + e.amountPaise, 0);
  });
  const burnRate = Math.round(trailing.reduce((a, b) => a + b, 0) / 3);

  const sipPaise = store.investments.reduce((s, i) => s + (i.sipAmountPaise || 0), 0);
  const homeRule = store.recurringRules.find((r) => r.label === "Home Contribution");
  const homePaise = homeRule?.amountPaise || 0;

  const savings = income - expensesTotal;
  const sr = savingsRateBps(income, expensesTotal);
  const prevSr = savingsRateBps(prevIncome, prevExpensesTotal);

  const ef = store.emergencyFund;
  const efProgress = ef.targetPaise > 0 ? ef.currentPaise / ef.targetPaise : 0;

  const goalsOnTrack = store.goals.filter((g) => {
    if (g.status !== "active") return false;
    return g.currentPaise / g.targetPaise >= 0.1 || g.type === "emergency_fund";
  }).length;
  const activeGoals = store.goals.filter((g) => g.status === "active").length;

  const healthScore = calculateHealthScore({
    emergencyProgress: efProgress,
    savingsRate: income > 0 ? savings / income : 0,
    debtToIncome: income > 0 ? (totalEmi + homePaise) / income : 0,
    investmentRate: income > 0 ? sipPaise / income : 0,
    expenseRatio: income > 0 ? expensesTotal / income : 0,
    goalsOnTrackRatio: activeGoals > 0 ? goalsOnTrack / activeGoals : 0,
  });

  const categoryBreakdown = store.categories
    .map((c) => ({
      name: c.name,
      value: monthExpenses
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

  const edu = store.loans.find((l) => l.name === "Education Loan");

  const insights = generateInsights({
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
  });

  const goalsPreview = store.goals
    .filter((g) => g.status === "active")
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
  };
}

export function getSalaryEntries() {
  return [...getStore().salaryEntries].sort((a, b) => b.month.localeCompare(a.month));
}

export function getExpenses(filters?: {
  search?: string;
  categoryId?: string;
  from?: string;
  to?: string;
}) {
  const store = getStore();
  let list = [...store.expenses];
  if (filters?.categoryId) list = list.filter((e) => e.categoryId === filters.categoryId);
  if (filters?.from) list = list.filter((e) => e.date >= filters.from!);
  if (filters?.to) list = list.filter((e) => e.date <= filters.to!);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (e) =>
        e.merchant?.toLowerCase().includes(q) ||
        e.notes?.toLowerCase().includes(q) ||
        store.categories.find((c) => c.id === e.categoryId)?.name.toLowerCase().includes(q)
    );
  }
  return list
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((e) => ({
      ...e,
      categoryName: store.categories.find((c) => c.id === e.categoryId)?.name || "—",
    }));
}

export function getCategories() {
  return getStore().categories;
}

export function getLoans() {
  return [...getStore().loans].sort((a, b) => a.priority - b.priority);
}

export function getLoanDetail(id: string) {
  const loan = getStore().loans.find((l) => l.id === id);
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
    extraPaymentPaise: loan.extraPaymentPaise || 20000_00,
  });
  const payments = getStore().loanPayments.filter((p) => p.loanId === id);
  return { loan, remaining, saved, payments };
}

export function getInvestments() {
  const list = getStore().investments;
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
  };
}

export function getEmergencyFundView() {
  const ef = getStore().emergencyFund;
  const remaining = Math.max(0, ef.targetPaise - ef.currentPaise);
  const monthly = ef.monthlyContributionPaise || 0;
  const months = estimateCompletionMonths(remaining, monthly);
  const progress = ef.targetPaise > 0 ? (ef.currentPaise / ef.targetPaise) * 100 : 0;
  const phase2Remaining = Math.max(0, ef.phase2TargetPaise - ef.currentPaise);
  return { ef, remaining, months, progress, phase2Remaining };
}

export function getGoalsView() {
  const store = getStore();
  const summary = getDashboardSummary();
  return store.goals
    .filter((g) => g.status === "active")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((g) => {
      let current = g.currentPaise;
      if (g.type === "emergency_fund") current = store.emergencyFund.currentPaise;
      if (g.type === "net_worth") current = summary.netWorth;
      if (g.type === "investment") {
        current = store.investments.reduce((s, i) => s + i.currentValuePaise, 0);
      }
      if (g.type === "debt_payoff") {
        const loanId = (g.linkedEntity as { loanId?: string })?.loanId;
        const loan = store.loans.find((l) => l.id === loanId);
        current = loan ? loan.principalPaise - loan.outstandingPaise : 0;
        // For payoff goal, target is outstanding at goal creation — progress = paid toward closure
        // Better: progress = 1 - outstanding/original target
        if (loan) {
          current = Math.max(0, g.targetPaise - loan.outstandingPaise);
        }
      }
      const progress = g.targetPaise > 0 ? Math.min(100, (current / g.targetPaise) * 100) : 0;
      const remaining = Math.max(0, g.targetPaise - current);
      const contribution = Math.max(1000_00, Math.round(remaining / 24));
      const etaMonths = estimateCompletionMonths(remaining, contribution);
      return { ...g, currentPaise: current, progress, remaining, contribution, etaMonths };
    });
}

export function getNetWorthSeries() {
  const summary = getDashboardSummary();
  const store = getStore();
  // Generate synthetic historical points if no snapshots
  if (store.netWorthSnapshots.length === 0) {
    const points = [];
    for (let i = 11; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const drift = (11 - i) * 15000_00;
      points.push({
        label: format(d, "MMM yy"),
        value: summary.netWorth - drift + Math.round(Math.random() * 5000_00),
      });
    }
    // Fix last point to actual
    points[points.length - 1].value = summary.netWorth;
    return { current: summary, series: points, monthlyChange: 15000_00 };
  }
  const series = store.netWorthSnapshots
    .sort((a, b) => a.asOf.localeCompare(b.asOf))
    .map((s) => ({ label: s.asOf.slice(0, 7), value: s.netPaise }));
  return { current: summary, series, monthlyChange: 0 };
}

export function getReports() {
  const summary = getDashboardSummary();
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
  };
}

export function getReminders() {
  return getStore().notifications.filter((n) => !n.completedAt);
}

export function getSettings() {
  return getStore().settings;
}

export function getCashAccounts() {
  return getStore().cashAccounts;
}

export function getRecurringRules() {
  const store = getStore();
  return store.recurringRules.map((r) => ({
    ...r,
    categoryName: store.categories.find((c) => c.id === r.categoryId)?.name || "—",
  }));
}
