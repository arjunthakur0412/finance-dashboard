import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getGoalsView } from "@/features/dashboard/queries";
import { formatINR } from "@/lib/money";

export const metadata = { title: "Goals" };

export default async function GoalsPage() {
  const goals = await getGoalsView();

  return (
    <>
      <Topbar title="Goals" />
      <div className="grid gap-4 p-4 md:grid-cols-2 md:p-6">
        {goals.map((g) => (
          <Card key={g.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">{g.title}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground capitalize">{g.type.replace("_", " ")}</p>
              </div>
              <Badge variant="secondary">{g.progress.toFixed(0)}%</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={g.progress} />
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Current</p>
                  <p className="font-medium">{formatINR(g.currentPaise, { compact: true })}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Target</p>
                  <p className="font-medium">{formatINR(g.targetPaise, { compact: true })}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ETA</p>
                  <p className="font-medium">
                    {g.etaMonths == null ? "—" : `${g.etaMonths} mo`}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Suggested contribution {formatINR(g.contribution)}/mo to finish in ~24 months
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
