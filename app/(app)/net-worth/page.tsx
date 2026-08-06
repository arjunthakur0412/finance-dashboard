import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/feedback/metric-card";
import { MoneyAreaChart } from "@/components/charts";
import { getNetWorthSeries } from "@/features/dashboard/queries";
import { formatINR } from "@/lib/money";
import { isDemoMode } from "@/lib/demo-flag";

export const metadata = { title: "Net Worth" };

export default function NetWorthPage() {
  const { current, series, monthlyChange } = getNetWorthSeries();

  return (
    <>
      <Topbar title="Net Worth" demo={isDemoMode()} />
      <div className="space-y-6 p-4 md:p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard title="Current net worth" valuePaise={current.netWorth} formatCompact />
          <MetricCard title="Assets" valuePaise={current.assets} formatCompact />
          <MetricCard title="Liabilities" valuePaise={current.liabilities} formatCompact />
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Yearly trajectory</CardTitle>
            <p className="text-xs text-muted-foreground">
              MoM change ~ {formatINR(monthlyChange, { signed: true, compact: true })}
            </p>
          </CardHeader>
          <CardContent>
            <MoneyAreaChart data={series} color="#a78bfa" height={320} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Composition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Liquid cash</span>
              <span>{formatINR(current.remainingCash)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Investments</span>
              <span>{formatINR(current.investmentValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Emergency fund</span>
              <span>{formatINR(current.emergencyFund.currentPaise)}</span>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-2 text-rose-400">
              <span>Loans</span>
              <span>−{formatINR(current.loansOutstanding)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
