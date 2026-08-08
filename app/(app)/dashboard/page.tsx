import Link from "next/link";
import {
  Banknote,
  Flame,
  Landmark,
  Shield,
  TrendingUp,
  Wallet,
  Activity,
  ArrowRight,
  CreditCard,
} from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { MetricCard, ScoreCard } from "@/components/feedback/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoneyBarChart, AllocationDonut } from "@/components/charts";
import { getDashboardSummary, getReminders } from "@/features/dashboard/queries";
import { formatINR, formatPercent } from "@/lib/money";
import { ReminderList } from "@/features/reminders/reminder-list";
import { DashboardMotion } from "@/features/dashboard/dashboard-motion";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const s = await getDashboardSummary();
  const reminders = await getReminders();

  return (
    <>
      <Topbar title="Dashboard" />
      <DashboardMotion>
        <div className="space-y-6 p-4 md:p-6">
          {s.isEmpty ? (
            <Card className="border-primary/25 bg-primary/5">
              <CardContent className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">Welcome to Finance OS</h2>
                  <p className="mt-1 max-w-lg text-sm text-muted-foreground">
                    Your workspace is empty. Start by logging this month&apos;s salary, setting your
                    cash balance, and adding loans or investments as you go.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href="/salary">
                      Add salary <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/settings">Set cash balance</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/emergency-fund">Emergency fund</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Monthly Salary"
              valuePaise={s.income}
              icon={Wallet}
              formatCompact
              trend={
                s.incomeGrowth != null
                  ? {
                      label: `${s.incomeGrowth >= 0 ? "+" : ""}${s.incomeGrowth.toFixed(1)}% vs last month`,
                      positive: s.incomeGrowth >= 0,
                    }
                  : undefined
              }
            />
            <MetricCard
              title="Monthly Expenses"
              valuePaise={s.expensesTotal}
              icon={Banknote}
              formatCompact
            />
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Monthly EMI
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-2xl font-semibold tracking-tight">
                    {formatINR(s.totalEmi, { compact: true })}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Combined obligation · {s.loanEmis.length} active loan
                    {s.loanEmis.length === 1 ? "" : "s"}
                  </p>
                </div>
                {s.loanEmis.length > 0 ? (
                  <div className="space-y-1.5 border-t border-border/50 pt-3">
                    {s.loanEmis.map((loan) => (
                      <div key={loan.id} className="flex items-center justify-between text-xs">
                        <span className="truncate text-muted-foreground">{loan.name}</span>
                        <span className="font-medium tabular-nums">
                          {formatINR(loan.emiPaise)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No active loans</p>
                )}
              </CardContent>
            </Card>
            <MetricCard title="Net Worth" valuePaise={s.netWorth} icon={Activity} formatCompact />
            <MetricCard
              title="Investment Value"
              valuePaise={s.investmentValue}
              icon={TrendingUp}
              formatCompact
            />
            <MetricCard
              title="Outstanding Loans"
              valuePaise={s.loansOutstanding}
              icon={Landmark}
              formatCompact
            />
            <MetricCard
              title="This Month Cash Flow"
              valuePaise={s.cashFlowPaise}
              icon={Wallet}
              formatCompact
              subtitle="After expenses, EMI & SIP"
              trend={{
                label: `Savings rate ${formatPercent(s.savingsRateBps)}`,
                positive: s.cashFlowPaise > 0,
              }}
            />
            <MetricCard
              title="Monthly Burn Rate"
              valuePaise={s.burnRate}
              icon={Flame}
              formatCompact
              subtitle="3-month average"
            />
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
                    <p className="text-2xl font-semibold">
                      {formatINR(s.emergencyFund.currentPaise)}
                    </p>
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
              subtitle={
                s.isEmpty
                  ? "Add data to unlock your score"
                  : "Weighted across EF, savings, debt, investments"
              }
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
                  After expenses, EMI ({formatINR(s.totalEmi)}) & SIP ({formatINR(s.sipPaise)})
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">This Month Cash Flow</CardTitle>
                <p className="text-xs font-normal text-muted-foreground">
                  Income minus expenses, EMI, and SIP
                </p>
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
                  <p className="py-16 text-center text-sm text-muted-foreground">
                    No expenses yet — add your first on the Expenses page.
                  </p>
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
                {s.insights.length ? (
                  s.insights.map((i) => (
                    <div
                      key={i.id}
                      className="rounded-xl border border-border/50 bg-secondary/40 px-3 py-2.5 text-sm"
                    >
                      {i.message}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Insights appear after you log salary and expenses for a couple of months.
                  </p>
                )}
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

          {reminders.length > 0 ? <ReminderList reminders={reminders} /> : null}
        </div>
      </DashboardMotion>
    </>
  );
}
