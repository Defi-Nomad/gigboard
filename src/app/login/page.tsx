"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function LoginCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/jobs";

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(
          next
        )}`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <Card className="p-8 text-center">
      <p className="mb-1 font-mono text-signal">#</p>
      <h1 className="mb-2 text-lg font-semibold text-paper">Sign in to GigBoard</h1>
      <p className="mb-6 text-sm text-dim">
        Post gigs or apply to them. One account does both.
      </p>
      <Button className="w-full" onClick={signInWithGoogle} disabled={loading}>
        {loading ? "Redirecting..." : "Continue with Google"}
      </Button>
      {error && <p className="mt-4 text-sm text-bad">{error}</p>}
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto mt-16 max-w-sm">
      <Suspense fallback={null}>
        <LoginCard />
      </Suspense>
    </div>
  );
}
