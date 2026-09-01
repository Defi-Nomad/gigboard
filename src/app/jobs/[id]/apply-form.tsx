"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitApplication, type ApplyState } from "./actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const initialState: ApplyState = { error: null, success: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Submitting..." : "Submit application"}
    </Button>
  );
}

export function ApplyForm({ jobId }: { jobId: string }) {
  const boundAction = submitApplication.bind(null, jobId);
  const [state, formAction] = useFormState(boundAction, initialState);

  if (state.success) {
    return (
      <p className="rounded-sm border border-good/40 bg-good/10 p-4 text-sm text-good">
        Application sent. The client can now see it and reach you on Telegram.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="xProfileUrl">Your X profile URL</Label>
        <Input
          id="xProfileUrl"
          name="xProfileUrl"
          type="url"
          placeholder="https://x.com/yourhandle"
          required
        />
      </div>
      <div>
        <Label htmlFor="coverMessage">Why you&apos;re a fit</Label>
        <Textarea
          id="coverMessage"
          name="coverMessage"
          rows={4}
          placeholder="A couple sentences about relevant experience..."
          required
        />
      </div>
      {state.error && <p className="text-sm text-bad">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
