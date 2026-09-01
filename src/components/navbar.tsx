import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-line bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/jobs" className="flex items-center gap-2">
          <span className="font-mono text-signal">#</span>
          <span className="text-sm font-semibold tracking-tight text-paper">
            GigBoard
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/jobs"
            className="rounded-sm px-3 py-2 text-sm text-dim hover:text-paper"
          >
            Browse
          </Link>

          {user && (
            <>
              <Link
                href="/post-job"
                className="rounded-sm px-3 py-2 text-sm text-dim hover:text-paper"
              >
                Post a job
              </Link>
              <Link
                href="/dashboard/client"
                className="rounded-sm px-3 py-2 text-sm text-dim hover:text-paper"
              >
                My jobs
              </Link>
              <Link
                href="/dashboard/worker"
                className="rounded-sm px-3 py-2 text-sm text-dim hover:text-paper"
              >
                My applications
              </Link>
              {user.isAdmin && (
                <Link
                  href="/dashboard/admin"
                  className="rounded-sm px-3 py-2 text-sm text-signal hover:text-signal/80"
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <LogoutButton />
          ) : (
            <Link href="/login">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
