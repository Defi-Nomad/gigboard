import { Badge } from "@/components/ui/badge";
import type { ApplicationStatus, JobStatus } from "@/types/database.types";

const JOB_TONE: Record<JobStatus, "neutral" | "good" | "bad" | "signal"> = {
  pending: "signal",
  approved: "good",
  rejected: "bad",
  closed: "neutral",
};

const APPLICATION_TONE: Record<ApplicationStatus, "neutral" | "good" | "bad" | "signal"> = {
  pending: "signal",
  accepted: "good",
  rejected: "bad",
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return <Badge tone={JOB_TONE[status]}>{status}</Badge>;
}

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return <Badge tone={APPLICATION_TONE[status]}>{status}</Badge>;
}
