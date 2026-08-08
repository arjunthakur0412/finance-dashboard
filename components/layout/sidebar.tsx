"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { mainNav } from "./nav";
import { Command } from "lucide-react";
import { LogoutButton } from "./logout-button";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-dvh shrink-0 md:flex md:w-60 md:flex-col md:border-r md:border-border/60 md:bg-card/40">
      <div className="flex h-14 items-center gap-2 border-b border-border/60 px-5">
        <div className="flex size-9 items-center justify-center rounded-lg border border-primary/25 bg-gradient-to-b from-primary/25 to-primary/5 shadow-[0_0_40px_-12px_rgba(91,141,239,0.55)]">
          <span className="text-xl font-semibold tracking-tight text-primary">
            ₹
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">Finance OS</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Personal
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {mainNav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-2 border-t border-border/60 p-3">
        <LogoutButton />
        <p className="flex items-center gap-1 px-1 text-xs text-muted-foreground">
          Press{" "}
          <span className="inline-flex items-center gap-0.5 rounded-md border border-border px-1.5 py-0.5">
            <Command className="size-3" /> K
          </span>{" "}
          for commands
        </p>
      </div>
    </aside>
  );
}
