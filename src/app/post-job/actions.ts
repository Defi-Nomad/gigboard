"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { validateJobInput } from "@/lib/validation";

export interface PostJobState {
  error: string | null;
}

export async function createJob(
  _prevState: PostJobState,
  formData: FormData
): Promise<PostJobState> {
  const title = String(formData.get("title") ?? "");
  const description = String(formData.get("description") ?? "");
  const category = String(formData.get("category") ?? "");
  const budgetAmount = Number(formData.get("budgetAmount"));
  const budgetCurrency = String(formData.get("budgetCurrency") ?? "USD");
  const telegramContact = String(formData.get("telegramContact") ?? "");

  const validationError = validateJobInput({
    title,
    description,
    category,
    budgetAmount,
    telegramContact,
  });
  if (validationError) {
    return { error: validationError };
  }

  const user = await requireUser().catch(() => null);
  if (!user) {
    return { error: "You must be signed in to post a job." };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      client_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category,
      budget_amount: budgetAmount,
      budget_currency: budgetCurrency,
      telegram_contact: telegramContact.trim(),
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Could not create job." };
  }

  revalidatePath("/dashboard/client");
  redirect("/dashboard/client?posted=1");
}
