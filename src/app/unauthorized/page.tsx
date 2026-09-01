import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto mt-16 max-w-sm">
      <Card className="p-8 text-center">
        <h1 className="mb-2 text-lg font-semibold text-paper">Admins only</h1>
        <p className="mb-6 text-sm text-dim">
          Your account doesn&apos;t have admin access on GigBoard.
        </p>
        <Link href="/jobs" className="text-sm text-signal hover:underline">
          Back to jobs &rarr;
        </Link>
      </Card>
    </div>
  );
}
