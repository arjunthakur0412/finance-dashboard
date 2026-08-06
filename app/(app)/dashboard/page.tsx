import {
  Banknote,
  Flame,
  Landmark,
  PiggyBank,
  Shield,
  TrendingUp,
  Wallet,
  Activity,
} from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { MetricCard, ScoreCard } from "@/components/feedback/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MoneyBarChart, AllocationDonut } from "@/components/charts";
import { getDashboardSummary } from "@/features/dashboard/queries";
import { formatINR, formatPercent } from "@/lib/money";
import { isDemoMode } from "@/lib/demo-flag";
import { ReminderList } from "@/features/reminders/reminder-list";
import { getReminders } from "@/features/dashboard/queries";
import { DashboardMotion } from "@/features/dashboard/dashboard-motion";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const s = getDashboardSummary();
  const reminders = getReminders();

  return (
    <>
      <Topbar title="Dashboard" demo={isDemoMode()} />
      <DashboardMotion>
        <div className="space-y-6 p-4 md:p-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Monthly Salary" valuePaise={s.income} icon={Wallet} formatCompact
              trend={s.incomeGrowth != null ? { label: `${s.incomeGrowth >= 0 ? "+" : ""}${s.incomeGrowth.toFixed(1)}% vs last month`, positive: s.incomeGrowth >= 0 } : undefined}
            />
            <MetricCard title="Monthly Expenses" valuePaise={s.expensesTotal} icon={Banknote} formatCompact />
            <MetricCard title="Remaining Cash" valuePaise={s.remainingCash} icon={PiggyBank} formatCompact subtitle="Liquid accounts" />
            <MetricCard title="Net Worth" valuePaise={s.netWorth} icon={Activity} formatCompact />
            <MetricCard title="Investment Value" valuePaise={s.investmentValue} icon={TrendingUp} formatCompact />
            <MetricCard title="Outstanding Loans" valuePaise={s.loansOutstanding} icon={Landmark} formatCompact />
            <MetricCard title="This Month Cash Flow" valuePaise={s.cashFlowPaise} icon={Wallet} formatCompact
              trend={{ label: `Savings rate ${formatPercent(s.savingsRateBps)}`, positive: s.savingsRateBps > 0 }}
            />
            <MetricCard title="Monthly Burn Rate" valuePaise={s.burnRate} icon={Flame} formatCompact subtitle="3-month average" />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-primary" />
                  Emergency Fund
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-semibold">{formatINR(s.emergencyFund.currentPaise)}</p>
                    <p className="text-xs text-muted-foreground">
                      of {formatINR(s.emergencyFund.targetPaise)}
                    </p>
                  </div>
                  <Badge variant="secondary">{s.efProgress.toFixed(0)}%</Badge>
                </div>
                <Progress value={s.efProgress} />
              </CardContent>
            </Card>
            <ScoreCard
              title="Financial Health Score"
              score={s.healthScore}
              subtitle="Weighted across EF, savings, debt, investments"
            />
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Savings Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-emerald-400">
                  {formatPercent(s.savingsRateBps)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  SIP {formatINR(s.sipPaise)} · Home {formatINR(s.homePaise)} · EMI{" "}
                  {formatINR(s.totalEmi)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">This Month Cash Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <MoneyBarChart data={s.cashFlow} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {s.categoryBreakdown.length ? (
                  <AllocationDonut data={s.categoryBreakdown} />
                ) : (
                  <p className="py-16 text-center text-sm text-muted-foreground">No expenses yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {s.insights.map((i) => (
                  <div
                    key={i.id}
                    className="rounded-xl border border-border/50 bg-secondary/40 px-3 py-2.5 text-sm"
                  >
                    {i.message}
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {s.goalsPreview.map((g) => (
                  <div key={g.id}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{g.title}</span>
                      <span className="text-muted-foreground">{g.progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={g.progress} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <ReminderList reminders={reminders} />
        </div>
      </DashboardMotion>
    </>
  );
}
