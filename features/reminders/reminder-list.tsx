"use client";

import { completeReminder } from "@/features/shared/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Bell } from "lucide-react";
import { toast } from "sonner";
import { useOptimistic, useTransition } from "react";

type Reminder = {
  id: string;
  title: string;
  body: string | null;
  kind: string;
  dueOn: string;
};

export function ReminderList({ reminders }: { reminders: Reminder[] }) {
  const [pending, startTransition] = useTransition();
  const [optimistic, removeOptimistic] = useOptimistic(reminders, (state, id: string) =>
    state.filter((r) => r.id !== id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Bell className="h-4 w-4" />
          Monthly Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {optimistic.length === 0 ? (
          <p className="text-sm text-muted-foreground">All caught up for this month.</p>
        ) : (
          optimistic.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/50 px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-medium">{r.title}</p>
                {r.body ? <p className="text-xs text-muted-foreground">{r.body}</p> : null}
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    removeOptimistic(r.id);
                    await completeReminder(r.id);
                    toast.success("Reminder completed");
                  });
                }}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
