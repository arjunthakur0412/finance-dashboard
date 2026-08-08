"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

export function LogoutButton({
  className,
  compact,
}: {
  className?: string;
  compact?: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size={compact ? "icon" : "sm"}
      disabled={pending}
      className={cn(
        "text-muted-foreground hover:text-foreground",
        !compact && "w-full justify-start gap-3 px-3",
        className
      )}
      onClick={() => start(() => logout())}
      aria-label="Log out"
    >
      <LogOut className="h-4 w-4 shrink-0" />
      {compact ? null : pending ? "Signing out…" : "Log out"}
    </Button>
  );
}
