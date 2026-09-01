"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { validateApplicationInput } from "@/lib/validation";

export interface ApplyState {
  error: string | null;
  success: boolean;
}

export async function submitApplication(
  jobId: string,
  _prevState: ApplyState,
  formData: FormData
): Promise<ApplyState> {
  const xProfileUrl = String(formData.get("xProfileUrl") ?? "");
  const coverMessage = String(formData.get("coverMessage") ?? "");

  const validationError = validateApplicationInput({ xProfileUrl, coverMessage });
  if (validationError) {
    return { error: validationError, success: false };
  }

  let user;
  try {
    user = await requireUser();
  } catch {
    return { error: "You must be signed in to apply.", success: false };
  }

  const supabase = createClient();

  const { error } = await supabase.from("applications").insert({
    job_id: jobId,
    worker_id: user.id,
    x_profile_url: xProfileUrl.trim(),
    cover_message: coverMessage.trim(),
  });

  if (error) {
    // Unique constraint violation -> already applied.
    if (error.code === "23505") {
      return { error: "You already applied to this job.", success: false };
    }
    return { error: error.message, success: false };
  }

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard/worker");
  return { error: null, success: true };
}
