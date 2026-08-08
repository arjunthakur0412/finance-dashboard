import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/feedback/metric-card";
import { AllocationDonut } from "@/components/charts";
import { getInvestments } from "@/features/dashboard/queries";
import { formatINR } from "@/lib/money";
import { InvestmentForm } from "@/features/investments/investment-form";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Investments" };

export default async function InvestmentsPage() {
  const data = await getInvestments();

  return (
    <>
      <Topbar title="Investments" />
      <div className="space-y-6 p-4 md:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Total invested" valuePaise={data.totalInvested} formatCompact />
          <MetricCard title="Current value" valuePaise={data.totalCurrent} formatCompact />
          <MetricCard
            title="Profit / Loss"
            valuePaise={data.pnl}
            formatCompact
            trend={{
              label: data.totalInvested
                ? `${((data.pnl / data.totalInvested) * 100).toFixed(1)}%`
                : "—",
              positive: data.pnl >= 0,
            }}
          />
          <MetricCard
            title="Monthly SIP"
            valuePaise={data.monthlySip}
            subtitle={`10y FV ~ ${formatINR(data.expectedFV, { compact: true })} @12%`}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Asset allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <AllocationDonut data={data.allocation.map((a) => ({ name: a.name, value: a.value }))} />
            </CardContent>
          </Card>
          <InvestmentForm />
        </div>

        <div className="grid gap-3">
          {data.list.map((inv) => {
            const pnl = inv.currentValuePaise - inv.investedPaise;
            return (
              <Card key={inv.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{inv.name}</p>
                      <Badge variant="secondary">{inv.assetClass.replace("_", " ")}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Invested {formatINR(inv.investedPaise)}
                      {inv.sipAmountPaise
                        ? ` · SIP ${formatINR(inv.sipAmountPaise)}/mo`
                        : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatINR(inv.currentValuePaise)}</p>
                    <p className={pnl >= 0 ? "text-xs text-emerald-400" : "text-xs text-rose-400"}>
                      {pnl >= 0 ? "+" : ""}
                      {formatINR(pnl)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
