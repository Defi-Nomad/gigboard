import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatDate } from "@/lib/utils";
import type { Job } from "@/types/database.types";

export function JobCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="group p-5 transition-colors hover:border-signal">
        <div className="mb-3 flex items-start justify-between gap-4">
          <h3 className="text-base font-semibold text-paper group-hover:text-signal">
            {job.title}
          </h3>
          <span className="whitespace-nowrap font-mono text-sm text-signal">
            {formatMoney(job.budget_amount, job.budget_currency)}
          </span>
        </div>
        <p className="mb-4 line-clamp-2 text-sm text-dim">{job.description}</p>
        <div className="flex items-center gap-2">
          <Badge tone="neutral">{job.category}</Badge>
          <span className="font-mono text-[11px] text-dim/70">
            posted {formatDate(job.created_at)}
          </span>
        </div>
      </Card>
    </Link>
  );
}
