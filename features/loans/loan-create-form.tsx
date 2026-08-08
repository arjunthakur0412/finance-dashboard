"use client";

import { useTransition } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { createLoan } from "@/features/shared/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function LoanCreateForm() {
  const [pending, start] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Add a loan</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3 sm:grid-cols-2"
          action={(fd) => {
            start(async () => {
              await createLoan(fd);
              toast.success("Loan added");
            });
          }}
        >
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder="Education Loan" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="principal">Original principal (₹)</Label>
            <Input id="principal" name="principal" type="number" min="0" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="outstanding">Outstanding (₹)</Label>
            <Input id="outstanding" name="outstanding" type="number" min="0" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ratePercent">Interest rate %</Label>
            <Input
              id="ratePercent"
              name="ratePercent"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="8.5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emi">EMI (₹)</Label>
            <Input id="emi" name="emi" type="number" min="0" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenureMonths">Tenure (months)</Label>
            <Input id="tenureMonths" name="tenureMonths" type="number" min="1" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthsPaid">Months paid</Label>
            <Input id="monthsPaid" name="monthsPaid" type="number" min="0" defaultValue={0} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Start date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={format(new Date(), "yyyy-MM-dd")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority (1 = highest)</Label>
            <Input id="priority" name="priority" type="number" min="1" defaultValue={1} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Add loan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
