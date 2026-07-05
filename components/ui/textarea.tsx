import * as React from "react";

import { cn } from "@/lib/utils";

/** Textarea primitive — same treatment as Input (docs/design-system.md §6). */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[88px] w-full rounded-sm border border-border bg-bg px-3 py-2 text-start text-body text-primary placeholder:text-muted",
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
Textarea.displayName = "Textarea";

export { Textarea };
