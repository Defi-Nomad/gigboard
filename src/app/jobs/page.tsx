import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { JobCard } from "@/components/job-card";
import { SearchFilter } from "@/components/search-filter";
import type { Job } from "@/types/database.types";

export const dynamic = "force-dynamic";

interface JobsPageProps {
  searchParams: { q?: string; category?: string };
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const supabase = createClient();

  let query = supabase
    .from("jobs")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (searchParams.category) {
    query = query.eq("category", searchParams.category);
  }
  if (searchParams.q) {
    query = query.or(
      `title.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`
    );
  }

  const { data: jobs, error } = await query;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-paper">Open gigs</h1>
        <p className="text-sm text-dim">
          Approved jobs, newest first. Apply with your X profile.
        </p>
      </div>

      <Suspense fallback={null}>
        <SearchFilter />
      </Suspense>

      {error && (
        <p className="text-sm text-bad">Couldn&apos;t load jobs: {error.message}</p>
      )}

      {jobs && jobs.length === 0 && (
        <div className="rounded-sm border border-dashed border-line p-10 text-center text-sm text-dim">
          No jobs match yet. Try a different search, or check back soon.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {jobs?.map((job: Job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
