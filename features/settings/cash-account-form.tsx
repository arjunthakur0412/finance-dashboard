"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateCashAccount } from "@/features/shared/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/money";

export function CashAccountForm({
  account,
}: {
  account: { id: string; name: string; type: string; balancePaise: number };
}) {
  const [pending, start] = useTransition();

  return (
    <form
      className="flex flex-wrap items-center gap-2 rounded-xl border border-border/50 px-3 py-2"
      action={(fd) => {
        fd.set("id", account.id);
        start(async () => {
          await updateCashAccount(fd);
          toast.success(`${account.name} updated`);
        });
      }}
    >
      <div className="min-w-[120px] flex-1">
        <p className="text-sm font-medium">{account.name}</p>
        <p className="text-xs text-muted-foreground capitalize">
          {account.type} · {formatINR(account.balancePaise)}
        </p>
      </div>
      <Input
        name="balance"
        type="number"
        className="w-32"
        defaultValue={account.balancePaise / 100}
        aria-label={`${account.name} balance`}
      />
      <Button size="sm" type="submit" disabled={pending}>
        Update
      </Button>
    </form>
  );
}
