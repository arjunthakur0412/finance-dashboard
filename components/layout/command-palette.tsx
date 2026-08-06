"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useUIStore } from "@/stores/ui";
import { mainNav } from "./nav";

export function CommandPalette() {
  const router = useRouter();
  const { commandOpen, setCommandOpen, toggleCommand } = useUIStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleCommand();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleCommand]);

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput placeholder="Jump to page or action…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {mainNav.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => {
                setCommandOpen(false);
                router.push(item.href);
              }}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Quick actions">
          <CommandItem
            onSelect={() => {
              setCommandOpen(false);
              router.push("/expenses?new=1");
            }}
          >
            Add expense
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setCommandOpen(false);
              router.push("/salary");
            }}
          >
            Log salary
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setCommandOpen(false);
              router.push("/loans");
            }}
          >
            Record loan payment
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
