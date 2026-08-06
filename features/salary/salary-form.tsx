"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { upsertSalary } from "@/features/shared/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function SalaryForm() {
  const [pending, start] = useTransition();
  const month = format(new Date(), "yyyy-MM");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Log monthly salary</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          action={(fd) => {
            start(async () => {
              await upsertSalary(fd);
              toast.success("Salary saved");
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Input id="month" name="month" type="month" defaultValue={month} required />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="base">Salary (₹)</Label>
              <Input id="base" name="base" type="number" step="1" min="0" required placeholder="125000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bonus">Bonus (₹)</Label>
              <Input id="bonus" name="bonus" type="number" step="1" min="0" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="other">Other (₹)</Label>
              <Input id="other" name="other" type="number" step="1" min="0" placeholder="0" />
            </div>
          </div>
          <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? "Saving…" : "Save salary"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
