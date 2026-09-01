"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export async function updateApplicationStatus(formData: FormData) {
  const applicationId = String(formData.get("applicationId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!applicationId || !["accepted", "rejected"].includes(status)) {
    throw new Error("Invalid request.");
  }

  await requireUser();
  const supabase = createClient();

  // RLS ensures only the job's owner (or an admin) can actually update this
  // row, so no extra ownership check is needed here.
  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/client");
  revalidatePath("/dashboard/worker");
}

export async function closeJob(formData: FormData) {
  const jobId = String(formData.get("jobId") ?? "");
  if (!jobId) throw new Error("Invalid request.");

  await requireUser();
  const supabase = createClient();

  const { error } = await supabase
    .from("jobs")
    .update({ status: "closed" })
    .eq("id", jobId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/client");
  revalidatePath("/jobs");
}
