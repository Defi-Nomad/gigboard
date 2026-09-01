import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
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
Input.displayName = "Input";
