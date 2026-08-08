import { Topbar } from "@/components/layout/topbar";
import { getSettings, getCashAccounts, getRecurringRules } from "@/features/dashboard/queries";
import { SettingsForm } from "@/features/settings/settings-form";
import { ExportImport } from "@/features/settings/export-import";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/money";
import { CashAccountForm } from "@/features/settings/cash-account-form";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const settings = await getSettings();
  const accounts = await getCashAccounts();
  const recurring = await getRecurringRules();

  return (
    <>
      <Topbar title="Settings" />
      <div className="space-y-6 p-4 md:p-6">
        <SettingsForm settings={settings} />
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cash accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {accounts.map((a) => (
              <CashAccountForm key={a.id} account={a} />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recurring rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recurring.map((r) => (
              <div
                key={r.id}
                className="flex justify-between rounded-xl border border-border/50 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{r.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.categoryName} · day {r.dayOfMonth}
                  </p>
                </div>
                <p className="font-medium">{formatINR(r.amountPaise)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <ExportImport />
      </div>
    </>
  );
}
