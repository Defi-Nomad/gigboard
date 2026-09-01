import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-sm border border-line bg-panel px-3 py-2.5 text-sm text-paper placeholder:text-dim/60 focus:border-signal focus:outline-none",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
