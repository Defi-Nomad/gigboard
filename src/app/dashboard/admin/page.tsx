import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobStatusBadge } from "@/components/status-badge";
import { formatMoney, formatDate } from "@/lib/utils";
import { approveJob, rejectJob } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/admin");
  if (!user.isAdmin) redirect("/unauthorized");

  const supabase = createClient();

  const { data: pendingJobs } = await supabase
    .from("jobs")
    .select("*, profiles(email)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const { data: allJobs } = await supabase
    .from("jobs")
    .select("*, profiles(email)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-paper">Admin</h1>
      <p className="mb-8 text-sm text-dim">
        Review new job postings before they go live.
      </p>

      <section className="mb-10">
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-signal">
          Pending review ({pendingJobs?.length ?? 0})
        </h2>

        {(!pendingJobs || pendingJobs.length === 0) && (
          <div className="rounded-sm border border-dashed border-line p-8 text-center text-sm text-dim">
            Nothing waiting on you right now.
          </div>
        )}

        <div className="space-y-4">
          {pendingJobs?.map((job: any) => (
            <Card key={job.id} className="p-5">
              <div className="mb-2 flex items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="font-medium text-paper hover:text-signal"
                  >
                    {job.title}
                  </Link>
                  <p className="font-mono text-[11px] text-dim">
                    {job.profiles?.email} · {formatMoney(job.budget_amount, job.budget_currency)} ·{" "}
                    {formatDate(job.created_at)}
                  </p>
                </div>
                <JobStatusBadge status={job.status} />
              </div>
              <p className="mb-4 whitespace-pre-wrap text-sm text-dim">
                {job.description}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <form action={approveJob}>
                  <input type="hidden" name="jobId" value={job.id} />
                  <Button type="submit" size="sm">
                    Approve
                  </Button>
                </form>
                <form action={rejectJob} className="flex flex-1 gap-2">
                  <input type="hidden" name="jobId" value={job.id} />
                  <Input
                    name="reason"
                    placeholder="Rejection reason (optional)"
                    className="flex-1"
                  />
                  <Button type="submit" variant="danger" size="sm">
                    Reject
                  </Button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-dim">
          All jobs (latest 50)
        </h2>
        <div className="overflow-x-auto rounded-sm border border-line">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-dim">
                <th className="px-4 py-2 font-mono text-[11px] uppercase">Title</th>
                <th className="px-4 py-2 font-mono text-[11px] uppercase">Client</th>
                <th className="px-4 py-2 font-mono text-[11px] uppercase">Status</th>
                <th className="px-4 py-2 font-mono text-[11px] uppercase">Posted</th>
              </tr>
            </thead>
            <tbody>
              {allJobs?.map((job: any) => (
                <tr key={job.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-2">
                    <Link href={`/jobs/${job.id}`} className="hover:text-signal">
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-dim">{job.profiles?.email}</td>
                  <td className="px-4 py-2">
                    <JobStatusBadge status={job.status} />
                  </td>
                  <td className="px-4 py-2 font-mono text-[11px] text-dim">
                    {formatDate(job.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
