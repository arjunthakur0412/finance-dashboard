import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CommandPalette } from "@/components/layout/command-palette";
import { OfflineBanner } from "@/components/layout/offline-banner";
import { PwaRegister } from "@/components/layout/pwa-register";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
        <OfflineBanner />
        {children}
      </div>
      <MobileNav />
      <CommandPalette />
      <PwaRegister />
    </div>
  );
}
