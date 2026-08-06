import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardSummary } from "@/features/dashboard/queries";
import { isDemoMode } from "@/lib/demo-flag";

export const metadata = { title: "Insights" };

const severityVariant = {
  info: "secondary",
  success: "success",
  warning: "warning",
  critical: "danger",
} as const;

export default function InsightsPage() {
  const { insights } = getDashboardSummary();

  return (
    <>
      <Topbar title="Insights" demo={isDemoMode()} />
      <div className="space-y-4 p-4 md:p-6">
        <p className="text-sm text-muted-foreground">
          Generated from your salary, expenses, loans, emergency fund and investments.
        </p>
        <div className="grid gap-3">
          {insights.map((i) => (
            <Card key={i.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">{i.id.replace("-", " ")}</CardTitle>
                <Badge variant={severityVariant[i.severity]}>{i.severity}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{i.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
