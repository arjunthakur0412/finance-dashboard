import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getLoans } from "@/features/dashboard/queries";
import { formatINR } from "@/lib/money";
import { isDemoMode } from "@/lib/demo-flag";
import { remainingTenureMonths } from "@/lib/finance";

export const metadata = { title: "Loans" };

export default function LoansPage() {
  const loans = getLoans();

  return (
    <>
      <Topbar title="Loans" demo={isDemoMode()} />
      <div className="space-y-4 p-4 md:p-6">
        <p className="text-sm text-muted-foreground">
          Education loan has highest payoff priority. Home contribution is tracked as a recurring
          expense, not a loan.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {loans.map((loan) => {
            const paidPct =
              loan.principalPaise > 0
                ? ((loan.principalPaise - loan.outstandingPaise) / loan.principalPaise) * 100
                : 0;
            const remaining = remainingTenureMonths({
              outstandingPaise: loan.outstandingPaise,
              annualRateBps: loan.annualRateBps,
              emiPaise: loan.emiPaise,
              extraPaymentPaise: loan.extraPaymentPaise,
            });
            return (
              <Link key={loan.id} href={`/loans/${loan.id}`}>
                <Card className="transition-colors hover:border-primary/40">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{loan.name}</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {loan.annualRateBps / 100}% · EMI {formatINR(loan.emiPaise)}
                      </p>
                    </div>
                    <Badge variant={loan.priority === 1 ? "warning" : "secondary"}>
                      Priority {loan.priority}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Outstanding</span>
                      <span className="font-semibold">{formatINR(loan.outstandingPaise)}</span>
                    </div>
                    <Progress value={Math.max(0, paidPct)} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {loan.monthsPaid}/{loan.tenureMonths} months paid
                      </span>
                      <span>~{remaining} months left</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
