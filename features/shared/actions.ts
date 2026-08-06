"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getStore, newId } from "@/lib/db/memory";
import { monthlyRateFromBps } from "@/lib/finance";
import { moneyRupeesSchema, optionalMoneyRupeesSchema } from "@/lib/validations/common";

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function upsertSalary(formData: FormData) {
  const schema = z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/),
    base: moneyRupeesSchema,
    bonus: optionalMoneyRupeesSchema,
    other: optionalMoneyRupeesSchema,
    notes: z.string().optional(),
  });
  const parsed = schema.parse({
    month: formData.get("month"),
    base: formData.get("base"),
    bonus: formData.get("bonus") || 0,
    other: formData.get("other") || 0,
    notes: formData.get("notes") || undefined,
  });
  const month = `${parsed.month}-01`;
  const store = getStore();
  const existing = store.salaryEntries.find((s) => s.month === month);
  if (existing) {
    existing.basePaise = parsed.base;
    existing.bonusPaise = parsed.bonus;
    existing.otherPaise = parsed.other;
    existing.notes = parsed.notes || null;
  } else {
    store.salaryEntries.push({
      id: newId("sal"),
      userId: store.user.id,
      month,
      basePaise: parsed.base,
      bonusPaise: parsed.bonus,
      otherPaise: parsed.other,
      notes: parsed.notes || null,
      createdAt: new Date(),
    });
  }
  revalidateAll();
  return { ok: true };
}

export async function createExpense(formData: FormData) {
  const schema = z.object({
    categoryId: z.string().min(1),
    amount: moneyRupeesSchema,
    date: z.string().min(1),
    merchant: z.string().optional(),
    notes: z.string().optional(),
  });
  const parsed = schema.parse({
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    merchant: formData.get("merchant") || undefined,
    notes: formData.get("notes") || undefined,
  });
  const store = getStore();
  store.expenses.unshift({
    id: newId("exp"),
    userId: store.user.id,
    categoryId: parsed.categoryId,
    amountPaise: parsed.amount,
    date: parsed.date,
    merchant: parsed.merchant || null,
    notes: parsed.notes || null,
    accountId: store.cashAccounts[0]?.id || null,
    recurringRuleId: null,
    createdAt: new Date(),
  });
  // Deduct from primary liquid account
  const acc = store.cashAccounts.find((a) => a.isLiquid);
  if (acc) acc.balancePaise = Math.max(0, acc.balancePaise - parsed.amount);
  revalidateAll();
  return { ok: true };
}

export async function deleteExpense(id: string) {
  const store = getStore();
  const idx = store.expenses.findIndex((e) => e.id === id);
  if (idx >= 0) store.expenses.splice(idx, 1);
  revalidateAll();
  return { ok: true };
}

export async function updateCashAccount(formData: FormData) {
  const schema = z.object({
    id: z.string(),
    balance: moneyRupeesSchema,
  });
  const parsed = schema.parse({
    id: formData.get("id"),
    balance: formData.get("balance"),
  });
  const acc = getStore().cashAccounts.find((a) => a.id === parsed.id);
  if (acc) {
    acc.balancePaise = parsed.balance;
    acc.updatedAt = new Date();
  }
  revalidateAll();
  return { ok: true };
}

export async function recordLoanPayment(formData: FormData) {
  const schema = z.object({
    loanId: z.string(),
    amount: moneyRupeesSchema,
    isExtra: z.coerce.boolean().optional(),
    paidOn: z.string(),
  });
  const parsed = schema.parse({
    loanId: formData.get("loanId"),
    amount: formData.get("amount"),
    isExtra: formData.get("isExtra") === "on" || formData.get("isExtra") === "true",
    paidOn: formData.get("paidOn"),
  });
  const store = getStore();
  const loan = store.loans.find((l) => l.id === parsed.loanId);
  if (!loan) throw new Error("Loan not found");

  const r = monthlyRateFromBps(loan.annualRateBps);
  const interest = Math.round(loan.outstandingPaise * r);
  const principal = Math.min(loan.outstandingPaise, Math.max(0, parsed.amount - interest));

  store.loanPayments.push({
    id: newId("lp"),
    loanId: loan.id,
    paidOn: parsed.paidOn,
    amountPaise: parsed.amount,
    principalComponentPaise: principal,
    interestComponentPaise: interest,
    isExtra: Boolean(parsed.isExtra),
    notes: null,
  });

  loan.outstandingPaise = Math.max(0, loan.outstandingPaise - principal);
  if (!parsed.isExtra) loan.monthsPaid += 1;
  if (loan.outstandingPaise === 0) loan.status = "closed";

  revalidateAll();
  return { ok: true };
}

export async function updateLoanExtraPayment(formData: FormData) {
  const schema = z.object({
    loanId: z.string(),
    extra: optionalMoneyRupeesSchema,
  });
  const parsed = schema.parse({
    loanId: formData.get("loanId"),
    extra: formData.get("extra") || 0,
  });
  const loan = getStore().loans.find((l) => l.id === parsed.loanId);
  if (loan) loan.extraPaymentPaise = parsed.extra;
  revalidateAll();
  return { ok: true };
}

export async function upsertInvestment(formData: FormData) {
  const schema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    assetClass: z.enum([
      "mutual_fund",
      "sip",
      "stock",
      "fd",
      "ppf",
      "epf",
      "gold",
      "crypto",
    ]),
    invested: moneyRupeesSchema,
    current: moneyRupeesSchema,
    sipAmount: optionalMoneyRupeesSchema,
  });
  const parsed = schema.parse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    assetClass: formData.get("assetClass"),
    invested: formData.get("invested"),
    current: formData.get("current"),
    sipAmount: formData.get("sipAmount") || 0,
  });
  const store = getStore();
  if (parsed.id) {
    const inv = store.investments.find((i) => i.id === parsed.id);
    if (inv) {
      inv.name = parsed.name;
      inv.assetClass = parsed.assetClass;
      inv.investedPaise = parsed.invested;
      inv.currentValuePaise = parsed.current;
      inv.sipAmountPaise = parsed.sipAmount || null;
      inv.updatedAt = new Date();
    }
  } else {
    store.investments.push({
      id: newId("inv"),
      userId: store.user.id,
      name: parsed.name,
      assetClass: parsed.assetClass,
      investedPaise: parsed.invested,
      currentValuePaise: parsed.current,
      sipAmountPaise: parsed.sipAmount || null,
      sipDay: 5,
      assumedAnnualRatePercent: 12,
      meta: {},
      updatedAt: new Date(),
    });
  }
  revalidateAll();
  return { ok: true };
}

export async function updateEmergencyFund(formData: FormData) {
  const schema = z.object({
    current: moneyRupeesSchema,
    monthly: optionalMoneyRupeesSchema,
    target: optionalMoneyRupeesSchema,
  });
  const parsed = schema.parse({
    current: formData.get("current"),
    monthly: formData.get("monthly") || undefined,
    target: formData.get("target") || undefined,
  });
  const store = getStore();
  store.emergencyFund.currentPaise = parsed.current;
  if (parsed.monthly) store.emergencyFund.monthlyContributionPaise = parsed.monthly;
  if (parsed.target) store.emergencyFund.targetPaise = parsed.target;
  store.emergencyFund.updatedAt = new Date();

  const goal = store.goals.find((g) => g.type === "emergency_fund");
  if (goal) goal.currentPaise = parsed.current;

  revalidateAll();
  return { ok: true };
}

export async function completeReminder(id: string) {
  const n = getStore().notifications.find((x) => x.id === id);
  if (n) n.completedAt = new Date();
  revalidateAll();
  return { ok: true };
}

export async function updateSettings(formData: FormData) {
  const schema = z.object({
    currency: z.string().default("INR"),
    theme: z.enum(["dark", "light", "system"]),
    notificationsEnabled: z.coerce.boolean().optional(),
  });
  const parsed = schema.parse({
    currency: formData.get("currency") || "INR",
    theme: formData.get("theme") || "dark",
    notificationsEnabled: formData.get("notificationsEnabled") === "on",
  });
  const s = getStore().settings;
  s.currency = parsed.currency;
  s.theme = parsed.theme;
  s.notificationsEnabled = Boolean(parsed.notificationsEnabled);
  revalidateAll();
  return { ok: true };
}

export async function exportDataJson() {
  const store = getStore();
  return JSON.stringify(store, null, 2);
}

export async function importDataJson(json: string) {
  const data = JSON.parse(json);
  const store = getStore();
  Object.assign(store, data);
  revalidateAll();
  return { ok: true };
}
