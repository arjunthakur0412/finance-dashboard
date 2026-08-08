"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { updateLoan } from "@/features/shared/actions";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type LoanEditValues = {
  id: string;
  name: string;
  principalPaise: number;
  outstandingPaise: number;
  annualRateBps: number;
  emiPaise: number;
  tenureMonths: number;
  monthsPaid: number;
  startDate: string;
  priority: number;
  status: "active" | "closed";
};

export function LoanEditButton({ loan }: { loan: LoanEditValues }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [status, setStatus] = useState(loan.status);

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setStatus(loan.status);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit loan</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-3 sm:grid-cols-2"
            action={(fd) => {
              fd.set("id", loan.id);
              fd.set("status", status);
              start(async () => {
                await updateLoan(fd);
                toast.success("Loan updated");
                setOpen(false);
                router.refresh();
              });
            }}
          >
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" name="name" required defaultValue={loan.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-principal">Original principal (₹)</Label>
              <Input
                id="edit-principal"
                name="principal"
                type="number"
                min="0"
                required
                defaultValue={loan.principalPaise / 100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-outstanding">Outstanding (₹)</Label>
              <Input
                id="edit-outstanding"
                name="outstanding"
                type="number"
                min="0"
                required
                defaultValue={loan.outstandingPaise / 100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rate">Interest rate %</Label>
              <Input
                id="edit-rate"
                name="ratePercent"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={loan.annualRateBps / 100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-emi">EMI (₹)</Label>
              <Input
                id="edit-emi"
                name="emi"
                type="number"
                min="0"
                required
                defaultValue={loan.emiPaise / 100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tenure">Tenure (months)</Label>
              <Input
                id="edit-tenure"
                name="tenureMonths"
                type="number"
                min="1"
                required
                defaultValue={loan.tenureMonths}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-paid">Months paid</Label>
              <Input
                id="edit-paid"
                name="monthsPaid"
                type="number"
                min="0"
                defaultValue={loan.monthsPaid}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-start">Start date</Label>
              <Input
                id="edit-start"
                name="startDate"
                type="date"
                required
                defaultValue={loan.startDate}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-priority">Priority (1 = highest)</Label>
              <Input
                id="edit-priority"
                name="priority"
                type="number"
                min="1"
                defaultValue={loan.priority}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as "active" | "closed")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
