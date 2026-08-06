"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateEmergencyFund } from "@/features/shared/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function EmergencyFundForm({
  current,
  monthly,
  target,
}: {
  current: number;
  monthly: number;
  target: number;
}) {
  const [pending, start] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Update emergency fund</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 sm:grid-cols-3"
          action={(fd) => {
            start(async () => {
              await updateEmergencyFund(fd);
              toast.success("Emergency fund updated");
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="current">Current (₹)</Label>
            <Input id="current" name="current" type="number" defaultValue={current} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthly">Monthly contribution (₹)</Label>
            <Input id="monthly" name="monthly" type="number" defaultValue={monthly} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target">Target (₹)</Label>
            <Input id="target" name="target" type="number" defaultValue={target} />
          </div>
          <div className="sm:col-span-3">
            <Button type="submit" disabled={pending}>
              Save
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
