"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { requireDb } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { monthlyRateFromBps } from "@/lib/finance";
import { moneyRupeesSchema, optionalMoneyRupeesSchema } from "@/lib/validations/common";
import {
  cashAccounts,
  emergencyFund,
  expenses,
  goals,
  investments,
  loanPayments,
  loans,
  notifications,
  salaryEntries,
  settings,
} from "@/lib/db/schema";
import { getUserExportPayload } from "@/features/dashboard/queries";

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
  const db = requireDb();
  const userId = await requireUserId();

  const [existing] = await db
    .select()
    .from(salaryEntries)
    .where(and(eq(salaryEntries.userId, userId), eq(salaryEntries.month, month)))
    .limit(1);

  if (existing) {
    await db
      .update(salaryEntries)
      .set({
        basePaise: parsed.base,
        bonusPaise: parsed.bonus,
        otherPaise: parsed.other,
        notes: parsed.notes || null,
      })
      .where(eq(salaryEntries.id, existing.id));
  } else {
    await db.insert(salaryEntries).values({
      userId,
      month,
      basePaise: parsed.base,
      bonusPaise: parsed.bonus,
      otherPaise: parsed.other,
      notes: parsed.notes || null,
    });
  }
  revalidateAll();
  return { ok: true };
}

export async function createExpense(formData: FormData) {
  const schema = z.object({
    categoryId: z.string().uuid(),
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
  const db = requireDb();
  const userId = await requireUserId();

  const [account] = await db
    .select()
    .from(cashAccounts)
    .where(and(eq(cashAccounts.userId, userId), eq(cashAccounts.isLiquid, true)))
    .limit(1);

  await db.insert(expenses).values({
    userId,
    categoryId: parsed.categoryId,
    amountPaise: parsed.amount,
    date: parsed.date,
    merchant: parsed.merchant || null,
    notes: parsed.notes || null,
    accountId: account?.id || null,
  });

  if (account) {
    await db
      .update(cashAccounts)
      .set({
        balancePaise: Math.max(0, account.balancePaise - parsed.amount),
        updatedAt: new Date(),
      })
      .where(eq(cashAccounts.id, account.id));
  }

  revalidateAll();
  return { ok: true };
}

export async function deleteExpense(id: string) {
  const db = requireDb();
  const userId = await requireUserId();
  await db
    .delete(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
  revalidateAll();
  return { ok: true };
}

export async function updateCashAccount(formData: FormData) {
  const schema = z.object({
    id: z.string().uuid(),
    balance: moneyRupeesSchema,
  });
  const parsed = schema.parse({
    id: formData.get("id"),
    balance: formData.get("balance"),
  });
  const db = requireDb();
  const userId = await requireUserId();
  await db
    .update(cashAccounts)
    .set({ balancePaise: parsed.balance, updatedAt: new Date() })
    .where(and(eq(cashAccounts.id, parsed.id), eq(cashAccounts.userId, userId)));
  revalidateAll();
  return { ok: true };
}

export async function createCashAccount(formData: FormData) {
  const schema = z.object({
    name: z.string().min(1),
    type: z.enum(["bank", "cash", "wallet"]),
    balance: moneyRupeesSchema,
  });
  const parsed = schema.parse({
    name: formData.get("name"),
    type: formData.get("type") || "bank",
    balance: formData.get("balance") || 0,
  });
  const db = requireDb();
  const userId = await requireUserId();
  await db.insert(cashAccounts).values({
    userId,
    name: parsed.name,
    type: parsed.type,
    balancePaise: parsed.balance,
    isLiquid: true,
  });
  revalidateAll();
  return { ok: true };
}

export async function createLoan(formData: FormData) {
  const schema = z.object({
    name: z.string().min(1),
    principal: moneyRupeesSchema,
    outstanding: moneyRupeesSchema,
    ratePercent: z.coerce.number().positive(),
    emi: moneyRupeesSchema,
    tenureMonths: z.coerce.number().int().positive(),
    monthsPaid: z.coerce.number().int().min(0).default(0),
    startDate: z.string().min(1),
    priority: z.coerce.number().int().default(100),
  });
  const parsed = schema.parse({
    name: formData.get("name"),
    principal: formData.get("principal"),
    outstanding: formData.get("outstanding"),
    ratePercent: formData.get("ratePercent"),
    emi: formData.get("emi"),
    tenureMonths: formData.get("tenureMonths"),
    monthsPaid: formData.get("monthsPaid") || 0,
    startDate: formData.get("startDate"),
    priority: formData.get("priority") || 100,
  });
  const db = requireDb();
  const userId = await requireUserId();
  await db.insert(loans).values({
    userId,
    name: parsed.name,
    principalPaise: parsed.principal,
    outstandingPaise: parsed.outstanding,
    annualRateBps: Math.round(parsed.ratePercent * 100),
    emiPaise: parsed.emi,
    tenureMonths: parsed.tenureMonths,
    monthsPaid: parsed.monthsPaid,
    startDate: parsed.startDate,
    priority: parsed.priority,
    status: "active",
    extraPaymentPaise: 0,
  });
  revalidateAll();
  return { ok: true };
}

export async function updateLoan(formData: FormData) {
  const schema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    principal: moneyRupeesSchema,
    outstanding: moneyRupeesSchema,
    ratePercent: z.coerce.number().positive(),
    emi: moneyRupeesSchema,
    tenureMonths: z.coerce.number().int().positive(),
    monthsPaid: z.coerce.number().int().min(0).default(0),
    startDate: z.string().min(1),
    priority: z.coerce.number().int().default(100),
    status: z.enum(["active", "closed"]).default("active"),
  });
  const parsed = schema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    principal: formData.get("principal"),
    outstanding: formData.get("outstanding"),
    ratePercent: formData.get("ratePercent"),
    emi: formData.get("emi"),
    tenureMonths: formData.get("tenureMonths"),
    monthsPaid: formData.get("monthsPaid") || 0,
    startDate: formData.get("startDate"),
    priority: formData.get("priority") || 100,
    status: formData.get("status") || "active",
  });
  const db = requireDb();
  const userId = await requireUserId();

  const status =
    parsed.outstanding === 0 ? ("closed" as const) : parsed.status;

  const result = await db
    .update(loans)
    .set({
      name: parsed.name,
      principalPaise: parsed.principal,
      outstandingPaise: parsed.outstanding,
      annualRateBps: Math.round(parsed.ratePercent * 100),
      emiPaise: parsed.emi,
      tenureMonths: parsed.tenureMonths,
      monthsPaid: parsed.monthsPaid,
      startDate: parsed.startDate,
      priority: parsed.priority,
      status,
    })
    .where(and(eq(loans.id, parsed.id), eq(loans.userId, userId)))
    .returning({ id: loans.id });

  if (result.length === 0) throw new Error("Loan not found");

  revalidateAll();
  return { ok: true };
}

export async function deleteLoan(id: string) {
  const db = requireDb();
  const userId = await requireUserId();
  const result = await db
    .delete(loans)
    .where(and(eq(loans.id, id), eq(loans.userId, userId)))
    .returning({ id: loans.id });

  if (result.length === 0) throw new Error("Loan not found");

  revalidateAll();
  return { ok: true };
}

export async function recordLoanPayment(formData: FormData) {
  const schema = z.object({
    loanId: z.string().uuid(),
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
  const db = requireDb();
  const userId = await requireUserId();
  const [loan] = await db
    .select()
    .from(loans)
    .where(and(eq(loans.id, parsed.loanId), eq(loans.userId, userId)))
    .limit(1);
  if (!loan) throw new Error("Loan not found");

  const r = monthlyRateFromBps(loan.annualRateBps);
  const interest = Math.round(loan.outstandingPaise * r);
  const principal = Math.min(loan.outstandingPaise, Math.max(0, parsed.amount - interest));
  const newOutstanding = Math.max(0, loan.outstandingPaise - principal);

  await db.insert(loanPayments).values({
    loanId: loan.id,
    paidOn: parsed.paidOn,
    amountPaise: parsed.amount,
    principalComponentPaise: principal,
    interestComponentPaise: interest,
    isExtra: Boolean(parsed.isExtra),
  });

  await db
    .update(loans)
    .set({
      outstandingPaise: newOutstanding,
      monthsPaid: parsed.isExtra ? loan.monthsPaid : loan.monthsPaid + 1,
      status: newOutstanding === 0 ? "closed" : loan.status,
    })
    .where(eq(loans.id, loan.id));

  revalidateAll();
  return { ok: true };
}

export async function updateLoanExtraPayment(formData: FormData) {
  const schema = z.object({
    loanId: z.string().uuid(),
    extra: optionalMoneyRupeesSchema,
  });
  const parsed = schema.parse({
    loanId: formData.get("loanId"),
    extra: formData.get("extra") || 0,
  });
  const db = requireDb();
  const userId = await requireUserId();
  await db
    .update(loans)
    .set({ extraPaymentPaise: parsed.extra })
    .where(and(eq(loans.id, parsed.loanId), eq(loans.userId, userId)));
  revalidateAll();
  return { ok: true };
}

export async function upsertInvestment(formData: FormData) {
  const schema = z.object({
    id: z.string().uuid().optional(),
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
  const db = requireDb();
  const userId = await requireUserId();

  if (parsed.id) {
    await db
      .update(investments)
      .set({
        name: parsed.name,
        assetClass: parsed.assetClass,
        investedPaise: parsed.invested,
        currentValuePaise: parsed.current,
        sipAmountPaise: parsed.sipAmount || null,
        updatedAt: new Date(),
      })
      .where(and(eq(investments.id, parsed.id), eq(investments.userId, userId)));
  } else {
    await db.insert(investments).values({
      userId,
      name: parsed.name,
      assetClass: parsed.assetClass,
      investedPaise: parsed.invested,
      currentValuePaise: parsed.current,
      sipAmountPaise: parsed.sipAmount || null,
      sipDay: 5,
      assumedAnnualRatePercent: 12,
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
  const db = requireDb();
  const userId = await requireUserId();

  const [existing] = await db
    .select()
    .from(emergencyFund)
    .where(eq(emergencyFund.userId, userId))
    .limit(1);

  if (existing) {
    await db
      .update(emergencyFund)
      .set({
        currentPaise: parsed.current,
        monthlyContributionPaise:
          parsed.monthly || existing.monthlyContributionPaise,
        targetPaise: parsed.target || existing.targetPaise,
        updatedAt: new Date(),
      })
      .where(eq(emergencyFund.userId, userId));
  } else {
    await db.insert(emergencyFund).values({
      userId,
      currentPaise: parsed.current,
      targetPaise: parsed.target || 30000000,
      phase2TargetPaise: 45000000,
      monthlyContributionPaise: parsed.monthly || 0,
    });
  }

  await db
    .update(goals)
    .set({ currentPaise: parsed.current })
    .where(and(eq(goals.userId, userId), eq(goals.type, "emergency_fund")));

  revalidateAll();
  return { ok: true };
}

export async function completeReminder(id: string) {
  const db = requireDb();
  const userId = await requireUserId();
  await db
    .update(notifications)
    .set({ completedAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
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
  const db = requireDb();
  const userId = await requireUserId();
  await db
    .update(settings)
    .set({
      currency: parsed.currency,
      theme: parsed.theme,
      notificationsEnabled: Boolean(parsed.notificationsEnabled),
    })
    .where(eq(settings.userId, userId));
  revalidateAll();
  return { ok: true };
}

export async function exportDataJson() {
  const payload = await getUserExportPayload();
  return JSON.stringify(payload, null, 2);
}

export async function importDataJson(_json: string) {
  // Import into multi-user Neon is intentionally limited — use UI forms instead.
  throw new Error(
    "JSON import is disabled in multi-user mode. Add data via the app forms."
  );
}
