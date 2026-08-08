import { NextResponse } from "next/server";
import { getReports } from "@/features/dashboard/queries";
import { formatINR, formatPercent } from "@/lib/money";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ month: string }> }
) {
  const { month } = await params;
  const r = await getReports();

  // Lightweight printable HTML PDF alternative — works without heavy PDF deps failing
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Finance OS Report — ${month}</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; padding: 40px; color: #111; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .muted { color: #666; font-size: 13px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px; }
    td:last-child { text-align: right; font-weight: 600; }
    ul { margin-top: 24px; padding-left: 18px; }
    li { margin-bottom: 8px; font-size: 14px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>Finance OS — Monthly Report</h1>
  <p class="muted">${month} · Health score ${r.healthScore}/100</p>
  <table>
    <tr><td>Income</td><td>${formatINR(r.income)}</td></tr>
    <tr><td>Expenses</td><td>${formatINR(r.expenses)}</td></tr>
    <tr><td>Cash flow</td><td>${formatINR(r.cashFlow)}</td></tr>
    <tr><td>Savings rate</td><td>${formatPercent(r.savingsRateBps)}</td></tr>
    <tr><td>Expense ratio</td><td>${formatPercent(r.expenseRatioBps)}</td></tr>
    <tr><td>Debt ratio</td><td>${formatPercent(r.debtRatioBps)}</td></tr>
    <tr><td>Investment ratio</td><td>${formatPercent(r.investmentRatioBps)}</td></tr>
  </table>
  <h2 style="font-size:16px;margin-top:28px;">Insights</h2>
  <ul>
    ${r.insights.map((i) => `<li>${i.message}</li>`).join("")}
  </ul>
  <script>window.onload = () => window.print()</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="finance-report-${month}.html"`,
    },
  });
}
