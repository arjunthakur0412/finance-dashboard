"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteLoan } from "@/features/shared/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function LoanDeleteButton({
  loanId,
  loanName,
}: {
  loanId: string;
  loanName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete loan?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently remove <span className="font-medium text-foreground">{loanName}</span>{" "}
            and its payment history. This cannot be undone.
          </p>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={() => {
                start(async () => {
                  await deleteLoan(loanId);
                  toast.success("Loan deleted");
                  setOpen(false);
                  router.push("/loans");
                  router.refresh();
                });
              }}
            >
              {pending ? "Deleting…" : "Delete loan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
