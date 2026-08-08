import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategories, getExpenses, getDashboardSummary } from "@/features/dashboard/queries";
import { ExpenseForm } from "@/features/expenses/expense-form";
import { ExpenseTable } from "@/features/expenses/expense-table";
import { AllocationDonut, MoneyBarChart } from "@/components/charts";
import { format } from "date-fns";

export const metadata = { title: "Expenses" };

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; new?: string }>;
}) {
  const sp = await searchParams;
  const [expenses, categories, summary, allExpenses] = await Promise.all([
    getExpenses({ search: sp.q, categoryId: sp.category }),
    getCategories(),
    getDashboardSummary(),
    getExpenses(),
  ]);

  const yearly = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const prefix = format(d, "yyyy-MM");
    const value = allExpenses
      .filter((e) => e.date.startsWith(prefix))
      .reduce((s, e) => s + e.amountPaise, 0);
    return { label: format(d, "MMM"), value };
  });

  return (
    <>
      <Topbar title="Expenses" />
      <div className="space-y-6 p-4 md:p-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <ExpenseForm categories={categories} defaultOpen={sp.new === "1" || expenses.length === 0} />
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Category breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {summary.categoryBreakdown.length ? (
                <AllocationDonut data={summary.categoryBreakdown} height={240} />
              ) : (
                <p className="py-16 text-center text-sm text-muted-foreground">No expenses yet</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Monthly trend</CardTitle>
            </CardHeader>
            <CardContent>
              <MoneyBarChart data={yearly} height={240} color="#f472b6" />
            </CardContent>
          </Card>
        </div>
        <ExpenseTable expenses={expenses} categories={categories} />
      </div>
    </>
  );
}
