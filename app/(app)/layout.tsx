import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CommandPalette } from "@/components/layout/command-palette";
import { OfflineBanner } from "@/components/layout/offline-banner";
import { PwaRegister } from "@/components/layout/pwa-register";
import { requireUserId } from "@/lib/session";
import { ensureUserWorkspace } from "@/lib/db/workspace";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const userId = await requireUserId();
  await ensureUserWorkspace(userId);

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto pb-20 md:pb-0">
        <OfflineBanner />
        {children}
      </div>
      <MobileNav />
      <CommandPalette />
      <PwaRegister />
    </div>
  );
}
