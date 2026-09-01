import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { JobStatusBadge } from "@/components/status-badge";
import { TelegramButton } from "@/components/telegram-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatMoney, formatDate } from "@/lib/utils";
import { ApplyForm } from "./apply-form";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const user = await getCurrentUser();

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!job) notFound();

  const isOwner = user?.id === job.client_id;
  const isPublicViewable = job.status === "approved";

  if (!isPublicViewable && !isOwner && !user?.isAdmin) {
    notFound();
  }

  let alreadyApplied = false;
  if (user && !isOwner) {
    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("job_id", job.id)
      .eq("worker_id", user.id)
      .maybeSingle();
    alreadyApplied = !!existing;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-paper">{job.title}</h1>
          <p className="mt-1 font-mono text-xs text-dim">
            posted {formatDate(job.created_at)}
          </p>
        </div>
        <JobStatusBadge status={job.status} />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge tone="neutral">{job.category}</Badge>
        <span className="font-mono text-lg text-signal">
          {formatMoney(job.budget_amount, job.budget_currency)}
        </span>
      </div>

      <Card className="mb-6 p-6">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-paper/90">
          {job.description}
        </p>
      </Card>

      {isOwner && (
        <Card className="mb-6 border-signal/30 p-6">
          <p className="mb-3 text-sm text-dim">
            This is your job posting. Manage applicants and status from your
            dashboard.
          </p>
          <Link href="/dashboard/client" className="text-sm text-signal hover:underline">
            Go to My Jobs &rarr;
          </Link>
        </Card>
      )}

      {!isOwner && isPublicViewable && (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-paper">Apply to this gig</h2>
            <TelegramButton contact={job.telegram_contact} />
          </div>

          {!user && (
            <p className="text-sm text-dim">
              <Link href={`/login?next=/jobs/${job.id}`} className="text-signal hover:underline">
                Sign in
              </Link>{" "}
              to apply with your X profile.
            </p>
          )}

          {user && alreadyApplied && (
            <p className="rounded-sm border border-signal/40 bg-signal/10 p-4 text-sm text-signal">
              You already applied. Check your dashboard for status updates.
            </p>
          )}

          {user && !alreadyApplied && <ApplyForm jobId={job.id} />}
        </Card>
      )}

      {!isOwner && !isPublicViewable && (user?.isAdmin || isOwner) && (
        <p className="text-sm text-dim">
          This job is not published yet ({job.status}).
        </p>
      )}
    </div>
  );
}
