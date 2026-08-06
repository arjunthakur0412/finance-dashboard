"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { mainNav } from "./nav";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-border/60 md:bg-card/40">
      <div className="flex h-14 items-center gap-2 border-b border-border/60 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-xs font-bold text-primary">
          ₹
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
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
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
      <div className="border-t border-border/60 p-4 text-xs text-muted-foreground">
        Press <kbd className="rounded border border-border bg-background px-1.5 py-0.5">⌘K</kbd>{" "}
        for commands
      </div>
    </aside>
  );
}
