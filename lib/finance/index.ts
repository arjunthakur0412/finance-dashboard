/**
 * Pure finance calculations — no DB / IO.
 * All money inputs/outputs are integer paise unless noted.
 */

import { clamp } from "@/lib/money";

export type AmortizationRow = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  isExtra: boolean;
};

/** Monthly interest rate from annual rate in basis points (850 = 8.50%). */
export function monthlyRateFromBps(annualRateBps: number): number {
  return annualRateBps / 100 / 100 / 12;
}

export function buildAmortizationSchedule(params: {
  outstandingPaise: number;
  annualRateBps: number;
  emiPaise: number;
  extraPaymentPaise?: number;
  maxMonths?: number;
}): AmortizationRow[] {
  const {
    outstandingPaise,
    annualRateBps,
    emiPaise,
    extraPaymentPaise = 0,
    maxMonths = 600,
  } = params;

  const r = monthlyRateFromBps(annualRateBps);
  let balance = outstandingPaise;
  const rows: AmortizationRow[] = [];
  let month = 0;

  while (balance > 1 && month < maxMonths) {
    month += 1;
    const interest = Math.round(balance * r);
    let principal = emiPaise - interest;
    let payment = emiPaise;
    let isExtra = false;

    if (extraPaymentPaise > 0) {
      principal += extraPaymentPaise;
      payment += extraPaymentPaise;
      isExtra = true;
    }

    if (principal > balance) {
      principal = balance;
      payment = principal + interest;
      isExtra = extraPaymentPaise > 0;
    }

    balance = Math.max(0, balance - principal);
    rows.push({ month, payment, principal, interest, balance, isExtra });
  }

  return rows;
}

export function remainingTenureMonths(params: {
  outstandingPaise: number;
  annualRateBps: number;
  emiPaise: number;
  extraPaymentPaise?: number;
}): number {
  return buildAmortizationSchedule(params).length;
}

export function totalInterestFromSchedule(rows: AmortizationRow[]): number {
  return rows.reduce((s, r) => s + r.interest, 0);
}

export function interestSavedByPrepayment(params: {
  outstandingPaise: number;
  annualRateBps: number;
  emiPaise: number;
  extraPaymentPaise: number;
}): { withoutExtra: number; withExtra: number; saved: number; monthsSaved: number } {
  const base = buildAmortizationSchedule({ ...params, extraPaymentPaise: 0 });
  const withExtra = buildAmortizationSchedule(params);
  const withoutInterest = totalInterestFromSchedule(base);
  const withInterest = totalInterestFromSchedule(withExtra);
  return {
    withoutExtra: withoutInterest,
    withExtra: withInterest,
    saved: Math.max(0, withoutInterest - withInterest),
    monthsSaved: Math.max(0, base.length - withExtra.length),
  };
}

export function savingsRateBps(incomePaise: number, expensesPaise: number): number {
  if (incomePaise <= 0) return 0;
  return Math.round(((incomePaise - expensesPaise) / incomePaise) * 10000);
}

export function ratioBps(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 10000);
}

export function estimateCompletionMonths(
  remainingPaise: number,
  monthlyContributionPaise: number
): number | null {
  if (remainingPaise <= 0) return 0;
  if (monthlyContributionPaise <= 0) return null;
  return Math.ceil(remainingPaise / monthlyContributionPaise);
}

/** SIP future value: P * [((1+r)^n - 1) / r] * (1+r) */
export function sipFutureValue(params: {
  monthlyPaise: number;
  annualRatePercent: number;
  months: number;
}): number {
  const { monthlyPaise, annualRatePercent, months } = params;
  if (months <= 0 || monthlyPaise <= 0) return 0;
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return monthlyPaise * months;
  const fv = monthlyPaise * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
  return Math.round(fv);
}

export type HealthScoreInputs = {
  emergencyProgress: number; // 0-1
  savingsRate: number; // 0-1 (income-expenses)/income
  debtToIncome: number; // EMI+home / income
  investmentRate: number; // invested / income
  expenseRatio: number; // expenses / income
  goalsOnTrackRatio: number; // 0-1
};

export function calculateHealthScore(input: HealthScoreInputs): number {
  const ef = clamp(input.emergencyProgress, 0, 1) * 100;
  const savings = clamp(input.savingsRate / 0.4, 0, 1) * 100; // 40% savings = full
  const debt = clamp(1 - input.debtToIncome / 0.5, 0, 1) * 100; // 50% DTI = 0
  const invest = clamp(input.investmentRate / 0.2, 0, 1) * 100; // 20% = full
  const expense = clamp(1 - (input.expenseRatio - 0.3) / 0.5, 0, 1) * 100;
  const goals = clamp(input.goalsOnTrackRatio, 0, 1) * 100;

  const score =
    ef * 0.25 +
    savings * 0.2 +
    debt * 0.2 +
    invest * 0.15 +
    expense * 0.1 +
    goals * 0.1;

  return Math.round(clamp(score, 0, 100));
}

export function suggestedEmergencyContribution(params: {
  incomePaise: number;
  expensesPaise: number;
  totalEmiPaise: number;
  sipPaise: number;
  homeContributionPaise: number;
}): number {
  const leftover =
    params.incomePaise -
    params.expensesPaise -
    params.totalEmiPaise -
    params.sipPaise -
    params.homeContributionPaise;
  // If expenses already include home/emi/sip, leftover may be negative — fall back to 20% of income
  if (leftover > 0) return leftover;
  return Math.max(0, Math.round(params.incomePaise * 0.2));
}
