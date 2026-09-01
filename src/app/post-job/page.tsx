"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createJob, type PostJobState } from "./actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { JOB_CATEGORIES, CURRENCIES } from "@/lib/constants";

const initialState: PostJobState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Submitting..." : "Submit for review"}
    </Button>
  );
}

export default function PostJobPage() {
  const [state, formAction] = useFormState(createJob, initialState);

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-xl font-semibold text-paper">Post a gig</h1>
      <p className="mb-6 text-sm text-dim">
        New jobs go to an admin queue before they appear in the browse list.
      </p>

      <Card className="p-6">
        <form action={formAction} className="space-y-5">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="e.g. Write 5 crypto explainer threads" required />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={6}
              placeholder="What needs doing, deliverables, deadline..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select id="category" name="category" required defaultValue="">
                <option value="" disabled>
                  Choose one
                </option>
                {JOB_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="budgetCurrency">Currency</Label>
              <Select id="budgetCurrency" name="budgetCurrency" defaultValue="USD">
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="budgetAmount">Budget</Label>
            <Input
              id="budgetAmount"
              name="budgetAmount"
              type="number"
              min="0"
              step="1"
              placeholder="150"
              required
            />
          </div>

          <div>
            <Label htmlFor="telegramContact">Telegram contact</Label>
            <Input
              id="telegramContact"
              name="telegramContact"
              placeholder="@yourhandle"
              required
            />
          </div>

          {state.error && <p className="text-sm text-bad">{state.error}</p>}

          <SubmitButton />
        </form>
      </Card>
    </div>
  );
}
