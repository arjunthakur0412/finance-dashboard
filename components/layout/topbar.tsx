"use client";

import { Command, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui";
import { LogoutButton } from "./logout-button";

export function Topbar({ title, demo }: { title: string; demo?: boolean }) {
  const setCommandOpen = useUIStore((s) => s.setCommandOpen);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur md:px-6">
      <div>
        <h1 className="text-base font-semibold tracking-tight md:text-lg">
          {title}
        </h1>
        {demo ? (
          <p className="text-[11px] text-amber-400/90">
            Demo mode — in-memory data
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden gap-2 text-muted-foreground sm:flex"
          onClick={() => setCommandOpen(true)}
        >
          <Search className="h-3.5 w-3.5" />
          Search
          <span className="flex w-10 items-center gap-1 rounded-md p-1">
            <Command className="size-4" /> K
          </span>
        </Button>
        <LogoutButton compact className="md:hidden" />
      </div>
    </header>
  );
}
