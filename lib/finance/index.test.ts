import { describe, expect, it } from "vitest";
import {
  buildAmortizationSchedule,
  calculateHealthScore,
  interestSavedByPrepayment,
  remainingTenureMonths,
  savingsRateBps,
  sipFutureValue,
  estimateCompletionMonths,
} from "@/lib/finance";

describe("amortization", () => {
  it("pays down a car-like loan", () => {
    const rows = buildAmortizationSchedule({
      outstandingPaise: 115527800,
      annualRateBps: 850,
      emiPaise: 3015300,
    });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThanOrEqual(48);
    expect(rows[rows.length - 1].balance).toBe(0);
  });

  it("extra payment shortens tenure and saves interest", () => {
    const result = interestSavedByPrepayment({
      outstandingPaise: 32720400,
      annualRateBps: 1080,
      emiPaise: 365800,
      extraPaymentPaise: 2000000,
    });
    expect(result.monthsSaved).toBeGreaterThan(0);
    expect(result.saved).toBeGreaterThan(0);
  });

  it("remaining tenure matches schedule length", () => {
    const params = {
      outstandingPaise: 10000000,
      annualRateBps: 1000,
      emiPaise: 200000,
    };
    expect(remainingTenureMonths(params)).toBe(buildAmortizationSchedule(params).length);
  });
});

describe("ratios and health", () => {
  it("computes savings rate in bps", () => {
    expect(savingsRateBps(10000000, 4000000)).toBe(6000);
  });

  it("scores healthy finances highly", () => {
    const score = calculateHealthScore({
      emergencyProgress: 1,
      savingsRate: 0.4,
      debtToIncome: 0.1,
      investmentRate: 0.2,
      expenseRatio: 0.4,
      goalsOnTrackRatio: 1,
    });
    expect(score).toBeGreaterThanOrEqual(85);
  });

  it("scores poor finances low", () => {
    const score = calculateHealthScore({
      emergencyProgress: 0,
      savingsRate: 0,
      debtToIncome: 0.6,
      investmentRate: 0,
      expenseRatio: 0.9,
      goalsOnTrackRatio: 0,
    });
    expect(score).toBeLessThan(30);
  });
});

describe("projections", () => {
  it("estimates EF completion", () => {
    expect(estimateCompletionMonths(27600000, 2000000)).toBe(14);
    expect(estimateCompletionMonths(0, 2000000)).toBe(0);
    expect(estimateCompletionMonths(100, 0)).toBeNull();
  });

  it("computes SIP future value", () => {
    const fv = sipFutureValue({ monthlyPaise: 600000, annualRatePercent: 12, months: 120 });
    expect(fv).toBeGreaterThan(600000 * 120);
  });
});
