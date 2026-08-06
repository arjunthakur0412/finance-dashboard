"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateLoanExtraPayment } from "@/features/shared/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ExtraPaymentForm({
  loanId,
  currentExtra,
}: {
  loanId: string;
  currentExtra: number;
}) {
  const [pending, start] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Monthly extra payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-3"
          action={(fd) => {
            fd.set("loanId", loanId);
            start(async () => {
              await updateLoanExtraPayment(fd);
              toast.success("Extra payment updated — projection refreshed");
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="extra">Extra per month (₹)</Label>
            <Input id="extra" name="extra" type="number" defaultValue={currentExtra} min="0" />
          </div>
          <p className="text-xs text-muted-foreground">
            Used for payoff projection and interest-saved calculations.
          </p>
          <Button type="submit" disabled={pending}>
            Update
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
