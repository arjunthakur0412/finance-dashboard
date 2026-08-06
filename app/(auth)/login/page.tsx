import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isDemoMode } from "@/lib/demo-flag";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const demo = isDemoMode();

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/80 p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-lg font-bold text-primary">
            ₹
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Finance OS</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your personal finance operating system
          </p>
        </div>
        {demo ? (
          <div className="space-y-3">
            <p className="text-center text-sm text-muted-foreground">
              Demo mode is on. No Google OAuth required.
            </p>
            <Button asChild className="w-full">
              <Link href="/dashboard">Enter dashboard</Link>
            </Button>
          </div>
        ) : (
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <Button type="submit" className="w-full">
              Continue with Google
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
