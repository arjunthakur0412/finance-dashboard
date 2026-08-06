export type Insight = {
  id: string;
  severity: "info" | "success" | "warning" | "critical";
  message: string;
};

export function generateInsights(input: {
  thisMonthExpenses: number;
  lastMonthExpenses: number;
  savingsRateBps: number;
  lastSavingsRateBps: number;
  emergencyCurrent: number;
  emergencyTarget: number;
  emergencyMonthly: number;
  educationOutstanding: number;
  educationRateBps: number;
  educationEmi: number;
  investmentInvested: number;
  investmentCurrent: number;
}): Insight[] {
  const insights: Insight[] = [];

  if (input.lastMonthExpenses > 0) {
    const delta =
      ((input.lastMonthExpenses - input.thisMonthExpenses) /
        input.lastMonthExpenses) *
      100;
    if (Math.abs(delta) >= 1) {
      insights.push({
        id: "spend-delta",
        severity: delta > 0 ? "success" : "warning",
        message:
          delta > 0
            ? `You spent ${delta.toFixed(0)}% less than last month.`
            : `You spent ${Math.abs(delta).toFixed(0)}% more than last month.`,
      });
    }
  }

  if (input.savingsRateBps > input.lastSavingsRateBps) {
    insights.push({
      id: "savings-up",
      severity: "success",
      message: "Your savings rate increased.",
    });
  }

  const efRemaining = Math.max(0, input.emergencyTarget - input.emergencyCurrent);
  if (efRemaining > 0 && input.emergencyMonthly > 0) {
    const months = Math.ceil(efRemaining / input.emergencyMonthly);
    insights.push({
      id: "ef-eta",
      severity: "info",
      message: `Your emergency fund will be complete in ${months} month${months === 1 ? "" : "s"}.`,
    });
  } else if (efRemaining <= 0) {
    insights.push({
      id: "ef-done",
      severity: "success",
      message: "Emergency fund target reached — consider phase 2 (₹4.5L).",
    });
  }

  if (input.educationOutstanding > 0) {
    const extra = 20000_00; // ₹20,000 in paise
    // Rough months saved heuristic using EMI + extra vs EMI alone
    const monthsBase = Math.ceil(input.educationOutstanding / input.educationEmi);
    const monthsExtra = Math.ceil(
      input.educationOutstanding / (input.educationEmi + extra)
    );
    const yearsSaved = Math.max(0, (monthsBase - monthsExtra) / 12);
    if (yearsSaved >= 1) {
      insights.push({
        id: "edu-prepay",
        severity: "warning",
        message: `You can close your education loan ~${yearsSaved.toFixed(0)} years earlier by paying ₹20,000 extra every month.`,
      });
    }
  }

  if (input.investmentInvested > 0) {
    const growth =
      ((input.investmentCurrent - input.investmentInvested) /
        input.investmentInvested) *
      100;
    insights.push({
      id: "inv-growth",
      severity: growth >= 0 ? "success" : "warning",
      message: `Your investments are ${growth >= 0 ? "up" : "down"} ${Math.abs(growth).toFixed(1)}%.`,
    });
  }

  return insights;
}
