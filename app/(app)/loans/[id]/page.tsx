import { notFound } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/feedback/metric-card";
import { MoneyAreaChart } from "@/components/charts";
import { getLoanDetail } from "@/features/dashboard/queries";
import { buildAmortizationSchedule } from "@/lib/finance";
import { formatINR } from "@/lib/money";
import { isDemoMode } from "@/lib/demo-flag";
import { LoanPaymentForm } from "@/features/loans/loan-payment-form";
import { ExtraPaymentForm } from "@/features/loans/extra-payment-form";

export const metadata = { title: "Loan detail" };

export default async function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = getLoanDetail(id);
  if (!detail) notFound();
  const { loan, remaining, saved } = detail;

  const schedule = buildAmortizationSchedule({
    outstandingPaise: loan.outstandingPaise,
    annualRateBps: loan.annualRateBps,
    emiPaise: loan.emiPaise,
    extraPaymentPaise: loan.extraPaymentPaise,
  });

  const projection = schedule
    .filter((_, i) => i % Math.max(1, Math.floor(schedule.length / 12)) === 0 || i === schedule.length - 1)
    .map((r) => ({ label: `M${r.month}`, value: r.balance }));

  const interestPaid = Math.max(0, loan.principalPaise - loan.outstandingPaise === 0
    ? 0
    : Math.round((loan.principalPaise - loan.outstandingPaise) * (loan.annualRateBps / 10000) * 0.5));
  // Approximate principal paid
  const principalPaid = Math.max(0, loan.principalPaise - loan.outstandingPaise);

  return (
    <>
      <Topbar title={loan.name} demo={isDemoMode()} />
      <div className="space-y-6 p-4 md:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Outstanding" valuePaise={loan.outstandingPaise} formatCompact />
          <MetricCard title="Principal paid" valuePaise={principalPaid} formatCompact />
          <MetricCard title="EMI" valuePaise={loan.emiPaise} />
          <MetricCard title="Interest saved (w/ ₹20k extra)" valuePaise={saved.saved} formatCompact
            subtitle={`${saved.monthsSaved} months faster`}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <LoanPaymentForm loanId={loan.id} defaultEmi={loan.emiPaise / 100} />
          <ExtraPaymentForm loanId={loan.id} currentExtra={loan.extraPaymentPaise / 100} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Payoff projection · ~{remaining} months remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MoneyAreaChart data={projection} color="#fbbf24" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Amortization schedule (next 12)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-muted-foreground">
                  <th className="px-2 py-2">Month</th>
                  <th className="px-2 py-2">Payment</th>
                  <th className="px-2 py-2">Principal</th>
                  <th className="px-2 py-2">Interest</th>
                  <th className="px-2 py-2">Balance</th>
                </tr>
              </thead>
              <tbody>
                {schedule.slice(0, 12).map((r) => (
                  <tr key={r.month} className="border-b border-border/40">
                    <td className="px-2 py-2">{r.month}</td>
                    <td className="px-2 py-2">{formatINR(r.payment)}</td>
                    <td className="px-2 py-2">{formatINR(r.principal)}</td>
                    <td className="px-2 py-2">{formatINR(r.interest)}</td>
                    <td className="px-2 py-2">{formatINR(r.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-muted-foreground">
              Est. interest already paid (approx): {formatINR(interestPaid)}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
