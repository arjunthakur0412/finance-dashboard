/** Money stored as integer paise (₹1 = 100 paise). */

export type Paise = bigint;

export function rupeesToPaise(rupees: number | string): Paise {
  const n = typeof rupees === "string" ? Number(rupees.replace(/,/g, "")) : rupees;
  if (!Number.isFinite(n)) throw new Error("Invalid rupee amount");
  return BigInt(Math.round(n * 100));
}

export function paiseToRupees(paise: Paise | number | string): number {
  const p = typeof paise === "bigint" ? paise : BigInt(paise);
  return Number(p) / 100;
}

export function formatINR(
  paise: Paise | number | string | null | undefined,
  opts?: { compact?: boolean; signed?: boolean }
): string {
  if (paise === null || paise === undefined) return "—";
  const rupees = paiseToRupees(paise);
  const sign = opts?.signed && rupees > 0 ? "+" : "";
  if (opts?.compact) {
    const abs = Math.abs(rupees);
    if (abs >= 1_00_00_000) {
      return `${sign}₹${(rupees / 1_00_00_000).toFixed(2)}Cr`;
    }
    if (abs >= 1_00_000) {
      return `${sign}₹${(rupees / 1_00_000).toFixed(2)}L`;
    }
    if (abs >= 1_000) {
      return `${sign}₹${(rupees / 1_000).toFixed(1)}K`;
    }
  }
  return (
    sign +
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(rupees)
  );
}

export function formatPercent(bps: number, digits = 1): string {
  return `${(bps / 100).toFixed(digits)}%`;
}

export function sumPaise(...values: (Paise | number | null | undefined)[]): Paise {
  return values.reduce<Paise>((acc, v) => {
    if (v === null || v === undefined) return acc;
    return acc + (typeof v === "bigint" ? v : BigInt(v));
  }, BigInt(0));
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
