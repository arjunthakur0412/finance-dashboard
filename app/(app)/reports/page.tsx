import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreCard } from "@/components/feedback/metric-card";
import { getReports } from "@/features/dashboard/queries";
import { formatINR, formatPercent } from "@/lib/money";
import Link from "next/link";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  const r = await getReports();

  const rows = [
    { label: "Income", value: formatINR(r.income) },
    { label: "Expenses", value: formatINR(r.expenses) },
    { label: "Savings / cash flow", value: formatINR(r.savings) },
    { label: "Invested (SIP)", value: formatINR(r.invested) },
    { label: "Savings rate", value: formatPercent(r.savingsRateBps) },
    { label: "Expense ratio", value: formatPercent(r.expenseRatioBps) },
    { label: "Debt ratio (EMI/income)", value: formatPercent(r.debtRatioBps) },
    { label: "Investment ratio", value: formatPercent(r.investmentRatioBps) },
  ];

  return (
    <>
      <Topbar title="Reports" />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Monthly report for {r.month.slice(0, 7)}
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href={`/api/reports/${r.month.slice(0, 7)}/pdf`} target="_blank">
              Download PDF
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <ScoreCard title="Health score" score={r.healthScore} />
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">Ratios & cash flow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {rows.map((row) => (
                <div key={row.label} className="flex justify-between border-b border-border/40 py-2 text-sm last:border-0">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium">{row.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Insights in this report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {r.insights.map((i) => (
              <p key={i.id} className="rounded-xl bg-secondary/40 px-3 py-2 text-sm">
                {i.message}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
