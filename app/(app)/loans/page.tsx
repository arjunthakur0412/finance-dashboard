import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getLoans } from "@/features/dashboard/queries";
import { formatINR } from "@/lib/money";
import { remainingTenureMonths } from "@/lib/finance";
import { LoanCreateForm } from "@/features/loans/loan-create-form";
import { EmptyState } from "@/components/feedback/empty-state";
import { Landmark } from "lucide-react";

export const metadata = { title: "Loans" };

export default async function LoansPage() {
  const loans = await getLoans();

  return (
    <>
      <Topbar title="Loans" />
      <div className="space-y-4 p-4 md:p-6">
        <p className="text-sm text-muted-foreground">
          Track EMIs and prepayments. Home contribution should stay as a recurring expense, not a
          loan.
        </p>

        {loans.length === 0 ? (
          <EmptyState
            icon={Landmark}
            title="No loans yet"
            description="Add your car, education, or other loans to see payoff projections."
          />
        ) : (
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
                          {loan.tenureMonths - loan.monthsPaid >= 0
                            ? ` · ${loan.tenureMonths - loan.monthsPaid} on contract`
                            : ""}
                        </span>
                        <span>~{remaining} mo payoff at EMI</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        <LoanCreateForm />
      </div>
    </>
  );
}
