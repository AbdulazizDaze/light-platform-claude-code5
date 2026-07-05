import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Input primitive (docs/design-system.md §6). 44px min height, sm radius,
 * platinum border, oxford text, muted placeholder; focus = accent ring +
 * border. Text starts logically (RTL-safe) — never force text-left.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, invalid, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex min-h-[44px] w-full rounded-sm border border-border bg-bg px-3 py-2 text-start text-body text-primary placeholder:text-muted",
          "transition-colors duration-fast focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:border-border disabled:bg-border/40 disabled:text-muted",
          invalid && "border-danger focus-visible:border-danger focus-visible:ring-danger/40",
          className
        )}
        aria-invalid={invalid || undefined}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
