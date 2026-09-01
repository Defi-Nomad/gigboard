import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobStatusBadge, ApplicationStatusBadge } from "@/components/status-badge";
import { formatMoney, formatDate } from "@/lib/utils";
import { updateApplicationStatus, closeJob } from "./actions";

export const dynamic = "force-dynamic";

export default async function ClientDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/client");
  const supabase = createClient();

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("*, applications(*, profiles(*))")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-paper">My jobs</h1>
          <p className="text-sm text-dim">Everything you&apos;ve posted, and who applied.</p>
        </div>
        <Link href="/post-job">
          <Button size="sm">Post a job</Button>
        </Link>
      </div>

      {error && <p className="text-sm text-bad">{error.message}</p>}

      {jobs && jobs.length === 0 && (
        <div className="rounded-sm border border-dashed border-line p-10 text-center text-sm text-dim">
          You haven&apos;t posted a job yet.
        </div>
      )}

      <div className="space-y-6">
        {jobs?.map((job: any) => (
          <Card key={job.id} className="p-5">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <Link
                  href={`/jobs/${job.id}`}
                  className="font-medium text-paper hover:text-signal"
                >
                  {job.title}
                </Link>
                <p className="font-mono text-[11px] text-dim">
                  {formatMoney(job.budget_amount, job.budget_currency)} · posted{" "}
                  {formatDate(job.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <JobStatusBadge status={job.status} />
                {job.status === "approved" && (
                  <form action={closeJob}>
                    <input type="hidden" name="jobId" value={job.id} />
                    <Button type="submit" variant="secondary" size="sm">
                      Close job
                    </Button>
                  </form>
                )}
              </div>
            </div>

            {job.status === "rejected" && job.rejection_reason && (
              <p className="mb-3 rounded-sm border border-bad/30 bg-bad/5 p-3 text-xs text-bad">
                Rejected: {job.rejection_reason}
              </p>
            )}

            <div className="border-t border-line pt-3">
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-dim">
                Applicants ({job.applications?.length ?? 0})
              </p>
              {(!job.applications || job.applications.length === 0) && (
                <p className="text-xs text-dim">No applications yet.</p>
              )}
              <div className="space-y-2">
                {job.applications?.map((app: any) => (
                  <div
                    key={app.id}
                    className="flex flex-col gap-2 rounded-sm border border-line p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <a
                        href={app.x_profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-paper hover:text-signal"
                      >
                        {app.x_profile_url}
                      </a>
                      <p className="mt-1 text-xs text-dim">{app.cover_message}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ApplicationStatusBadge status={app.status} />
                      {app.status === "pending" && (
                        <>
                          <form action={updateApplicationStatus}>
                            <input type="hidden" name="applicationId" value={app.id} />
                            <input type="hidden" name="status" value="accepted" />
                            <Button type="submit" size="sm">
                              Accept
                            </Button>
                          </form>
                          <form action={updateApplicationStatus}>
                            <input type="hidden" name="applicationId" value={app.id} />
                            <input type="hidden" name="status" value="rejected" />
                            <Button type="submit" variant="danger" size="sm">
                              Reject
                            </Button>
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
