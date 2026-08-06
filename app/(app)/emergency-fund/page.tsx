import { addMonths, format } from "date-fns";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getEmergencyFundView, getDashboardSummary } from "@/features/dashboard/queries";
import { suggestedEmergencyContribution } from "@/lib/finance";
import { formatINR } from "@/lib/money";
import { isDemoMode } from "@/lib/demo-flag";
import { EmergencyFundForm } from "@/features/emergency-fund/ef-form";

export const metadata = { title: "Emergency Fund" };

export default function EmergencyFundPage() {
  const view = getEmergencyFundView();
  const dash = getDashboardSummary();
  const suggested = suggestedEmergencyContribution({
    incomePaise: dash.income,
    expensesPaise: dash.expensesTotal,
    totalEmiPaise: dash.totalEmi,
    sipPaise: dash.sipPaise,
    homeContributionPaise: dash.homePaise,
  });

  const etaDate =
    view.months != null
      ? format(addMonths(new Date(), view.months), "MMM yyyy")
      : "Set a monthly contribution";

  return (
    <>
      <Topbar title="Emergency Fund" demo={isDemoMode()} />
      <div className="space-y-6 p-4 md:p-6">
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Highest priority</CardTitle>
              <Badge>{view.progress.toFixed(1)}%</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-semibold tracking-tight">
                  {formatINR(view.ef.currentPaise)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Target {formatINR(view.ef.targetPaise)} · Phase 2 {formatINR(view.ef.phase2TargetPaise)}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="text-muted-foreground">Remaining</p>
                <p className="font-semibold">{formatINR(view.remaining)}</p>
              </div>
            </div>
            <Progress value={Math.min(100, view.progress)} className="h-3" />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-secondary/50 p-3">
                <p className="text-xs text-muted-foreground">ETA</p>
                <p className="font-medium">{etaDate}</p>
                {view.months != null ? (
                  <p className="text-xs text-muted-foreground">{view.months} months</p>
                ) : null}
              </div>
              <div className="rounded-xl bg-secondary/50 p-3">
                <p className="text-xs text-muted-foreground">Monthly contribution</p>
                <p className="font-medium">
                  {formatINR(view.ef.monthlyContributionPaise || 0)}
                </p>
              </div>
              <div className="rounded-xl bg-secondary/50 p-3">
                <p className="text-xs text-muted-foreground">Suggested</p>
                <p className="font-medium">{formatINR(suggested)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <EmergencyFundForm
          current={view.ef.currentPaise / 100}
          monthly={(view.ef.monthlyContributionPaise || 0) / 100}
          target={view.ef.targetPaise / 100}
        />
      </div>
    </>
  );
}
