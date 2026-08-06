"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { createExpense } from "@/features/shared/actions";
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

export function ExpenseForm({
  categories,
  defaultOpen,
}: {
  categories: { id: string; name: string }[];
  defaultOpen?: boolean;
}) {
  const [pending, start] = useTransition();
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [open, setOpen] = useState(Boolean(defaultOpen));

  if (!open) {
    return (
      <Card className="flex items-center justify-center">
        <CardContent className="py-10">
          <Button onClick={() => setOpen(true)}>Add expense</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Add expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-3"
          action={(fd) => {
            fd.set("categoryId", categoryId);
            start(async () => {
              await createExpense(fd);
              toast.success("Expense added");
              setOpen(false);
            });
          }}
        >
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input id="amount" name="amount" type="number" min="0" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={format(new Date(), "yyyy-MM-dd")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="merchant">Merchant</Label>
            <Input id="merchant" name="merchant" placeholder="Optional" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
