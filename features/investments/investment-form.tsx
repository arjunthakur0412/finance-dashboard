"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { upsertInvestment } from "@/features/shared/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const classes = [
  "mutual_fund",
  "sip",
  "stock",
  "fd",
  "ppf",
  "epf",
  "gold",
  "crypto",
] as const;

export function InvestmentForm() {
  const [pending, start] = useTransition();
  const [assetClass, setAssetClass] = useState<string>("mutual_fund");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Add / update investment</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-3"
          action={(fd) => {
            fd.set("assetClass", assetClass);
            start(async () => {
              await upsertInvestment(fd);
              toast.success("Investment saved");
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder="Nifty Index Fund" />
          </div>
          <div className="space-y-2">
            <Label>Asset class</Label>
            <Select value={assetClass} onValueChange={setAssetClass}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="invested">Invested (₹)</Label>
              <Input id="invested" name="invested" type="number" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current">Current (₹)</Label>
              <Input id="current" name="current" type="number" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sipAmount">SIP amount (₹)</Label>
            <Input id="sipAmount" name="sipAmount" type="number" placeholder="0" />
          </div>
          <Button type="submit" disabled={pending}>
            Save
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
