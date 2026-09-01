import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type Tone = "neutral" | "good" | "bad" | "signal";

const toneClasses: Record<Tone, string> = {
  neutral: "border-line text-dim",
  good: "border-good/40 text-good",
  bad: "border-bad/40 text-bad",
  signal: "border-signal/40 text-signal",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
