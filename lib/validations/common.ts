import { z } from "zod";

export const moneyRupeesSchema = z
  .union([z.string(), z.number()])
  .transform((v) => {
    const n = typeof v === "string" ? Number(v.replace(/,/g, "")) : v;
    if (!Number.isFinite(n) || n < 0) throw new Error("Invalid amount");
    return Math.round(n * 100);
  });

export const optionalMoneyRupeesSchema = z
  .union([z.string(), z.number(), z.literal("")])
  .optional()
  .transform((v) => {
    if (v === undefined || v === "") return 0;
    const n = typeof v === "string" ? Number(v.replace(/,/g, "")) : v;
    if (!Number.isFinite(n) || n < 0) throw new Error("Invalid amount");
    return Math.round(n * 100);
  });

export const monthKeySchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/)
  .transform((m) => `${m}-01`);

export const dateSchema = z.coerce.date();
