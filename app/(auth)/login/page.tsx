import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isDemoMode } from "@/lib/demo-flag";
import { signIn } from "@/lib/auth";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function LoginPage() {
  const demo = isDemoMode();

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      {/* Atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(91,141,239,0.22),transparent),radial-gradient(ellipse_40%_35%_at_90%_10%,rgba(52,211,153,0.08),transparent),radial-gradient(ellipse_35%_30%_at_10%_80%,rgba(91,141,239,0.06),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />

      <div className="relative w-full max-w-[400px]">
        {/* Brand */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-gradient-to-b from-primary/25 to-primary/5 shadow-[0_0_40px_-12px_rgba(91,141,239,0.55)]">
            <span className="text-2xl font-semibold tracking-tight text-primary">₹</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Finance OS</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Salary, loans, investments, and goals — one calm operating system for your money.
          </p>
        </div>

        {/* Auth panel */}
        <div className="rounded-2xl border border-border/70 bg-card/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          {demo ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-center text-xs text-amber-200/90">
                Demo mode — no Google sign-in required
              </div>
              <Button asChild className="h-11 w-full text-sm font-medium">
                <Link href="/dashboard">Enter dashboard</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-1 text-center">
                <p className="text-sm font-medium">Sign in to continue</p>
                <p className="text-xs text-muted-foreground">
                  Invite-only access via your Google account
                </p>
              </div>

              <form
                action={async () => {
                  "use server";
                  await signIn("google", { redirectTo: "/dashboard" });
                }}
              >
                <button
                  type="submit"
                  className="group flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border/80 bg-white text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99]"
                >
                  <GoogleIcon className="h-5 w-5 shrink-0" />
                  Continue with Google
                </button>
              </form>

              <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                By continuing you get a private empty workspace. Only allowlisted Google accounts
                can sign in.
              </p>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-[11px] tracking-wide text-muted-foreground/70">
          PERSONAL · PRIVATE · INR
        </p>
      </div>
    </div>
  );
}
