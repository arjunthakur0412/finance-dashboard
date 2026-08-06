import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSalaryEntries } from "@/features/dashboard/queries";
import { formatINR } from "@/lib/money";
import { isDemoMode } from "@/lib/demo-flag";
import { SalaryForm } from "@/features/salary/salary-form";
import { MoneyAreaChart } from "@/components/charts";

export const metadata = { title: "Salary" };

export default function SalaryPage() {
  const entries = getSalaryEntries();
  const chart = [...entries]
    .reverse()
    .map((e) => ({
      label: e.month.slice(0, 7),
      value: e.basePaise + e.bonusPaise + e.otherPaise,
    }));

  return (
    <>
      <Topbar title="Salary" demo={isDemoMode()} />
      <div className="space-y-6 p-4 md:p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <SalaryForm />
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Income trend</CardTitle>
            </CardHeader>
            <CardContent>
              <MoneyAreaChart data={chart} color="#34d399" />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Entries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {entries.map((e, i) => {
              const total = e.basePaise + e.bonusPaise + e.otherPaise;
              const prev = entries[i + 1];
              const prevTotal = prev
                ? prev.basePaise + prev.bonusPaise + prev.otherPaise
                : null;
              const growth =
                prevTotal && prevTotal > 0
                  ? ((total - prevTotal) / prevTotal) * 100
                  : null;
              return (
                <div
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{e.month.slice(0, 7)}</p>
                    <p className="text-xs text-muted-foreground">
                      Base {formatINR(e.basePaise)} · Bonus {formatINR(e.bonusPaise)} · Other{" "}
                      {formatINR(e.otherPaise)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatINR(total)}</p>
                    <p className="text-xs text-muted-foreground">
                      Yearly ~{formatINR(total * 12, { compact: true })}
                      {growth != null
                        ? ` · ${growth >= 0 ? "+" : ""}${growth.toFixed(1)}% MoM`
                        : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
