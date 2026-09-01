"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { JOB_CATEGORIES } from "@/lib/constants";

export function SearchFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");

  function applyFilters(nextQ: string, nextCategory: string) {
    const params = new URLSearchParams();
    if (nextQ.trim()) params.set("q", nextQ.trim());
    if (nextCategory) params.set("category", nextCategory);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        applyFilters(q, category);
      }}
      className="mb-6 flex flex-col gap-3 sm:flex-row"
    >
      <Input
        placeholder="Search jobs by title or description..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="sm:flex-1"
      />
      <Select
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          applyFilters(q, e.target.value);
        }}
        className="sm:w-56"
      >
        <option value="">All categories</option>
        {JOB_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>
      <Button type="submit" variant="secondary" disabled={isPending}>
        {isPending ? "Searching..." : "Search"}
      </Button>
    </form>
  );
}
