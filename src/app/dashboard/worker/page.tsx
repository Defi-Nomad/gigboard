import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { ApplicationStatusBadge } from "@/components/status-badge";
import { TelegramButton } from "@/components/telegram-button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function WorkerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/worker");
  const supabase = createClient();

  const { data: applications, error } = await supabase
    .from("applications")
    .select("*, jobs(*)")
    .eq("worker_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-paper">My applications</h1>
      <p className="mb-6 text-sm text-dim">
        Jobs you&apos;ve applied to and their current status.
      </p>

      {error && <p className="text-sm text-bad">{error.message}</p>}

      {applications && applications.length === 0 && (
        <div className="rounded-sm border border-dashed border-line p-10 text-center text-sm text-dim">
          You haven&apos;t applied to anything yet.{" "}
          <Link href="/jobs" className="text-signal hover:underline">
            Browse open gigs
          </Link>
          .
        </div>
      )}

      <div className="space-y-3">
        {applications?.map((app: any) => (
          <Card key={app.id} className="p-5">
            <div className="mb-2 flex items-start justify-between gap-4">
              <Link
                href={`/jobs/${app.job_id}`}
                className="font-medium text-paper hover:text-signal"
              >
                {app.jobs?.title ?? "Job removed"}
              </Link>
              <ApplicationStatusBadge status={app.status} />
            </div>
            <p className="mb-3 font-mono text-[11px] text-dim">
              applied {formatDate(app.created_at)}
            </p>
            {app.status === "accepted" && app.jobs?.telegram_contact && (
              <TelegramButton contact={app.jobs.telegram_contact} />
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
