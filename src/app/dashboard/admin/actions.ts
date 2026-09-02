"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

const RLS_HINT =
  "Update didn't apply. If you're only an admin via ADMIN_EMAIL and haven't " +
  "set SUPABASE_SERVICE_ROLE_KEY, add your email to the admin_emails table " +
  "directly in the Supabase SQL editor (see README \"Admin setup\").";

async function assertAdmin() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    throw new Error("Admins only.");
  }
}

export async function approveJob(formData: FormData) {
  await assertAdmin();
  const jobId = String(formData.get("jobId") ?? "");
  const supabase = createClient();

  const { data, error } = await supabase
    .from("jobs")
    .update({ status: "approved" as const, rejection_reason: null })
    .eq("id", jobId)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error(RLS_HINT);

  revalidatePath("/dashboard/admin");
  revalidatePath("/jobs");
}

export async function rejectJob(formData: FormData) {
  await assertAdmin();
  const jobId = String(formData.get("jobId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const supabase = createClient();

  const { data, error } = await supabase
    .from("jobs")
    .update({
  status: "rejected" as const,
  rejection_reason: reason || "No reason given.",
})
    .eq("id", jobId)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error(RLS_HINT);

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/client");
}
