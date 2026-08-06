"use client";

import { useTransition } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { recordLoanPayment } from "@/features/shared/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function LoanPaymentForm({
  loanId,
  defaultEmi,
}: {
  loanId: string;
  defaultEmi: number;
}) {
  const [pending, start] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Record payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-3"
          action={(fd) => {
            fd.set("loanId", loanId);
            start(async () => {
              await recordLoanPayment(fd);
              toast.success("Payment recorded");
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input id="amount" name="amount" type="number" defaultValue={defaultEmi} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paidOn">Date</Label>
            <Input
              id="paidOn"
              name="paidOn"
              type="date"
              defaultValue={format(new Date(), "yyyy-MM-dd")}
              required
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isExtra" className="rounded" />
            Extra / prepayment
          </label>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Record"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
