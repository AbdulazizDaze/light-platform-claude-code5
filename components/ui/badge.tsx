import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge primitive (docs/design-system.md §6/§9, brand-core v3). sm/xs pills.
 * Semantic variants map to status colors: success (green, semantic-only) /
 * warning (amber, navy text) / error (fire) / info (navy) + neutral. Color is
 * always paired with text — never convey status by color alone (accessibility,
 * and required for Nitaqat statuses).
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border font-medium",
  {
    variants: {
      variant: {
        neutral: "border-border bg-border/40 text-primary",
        success: "border-success/30 bg-success/10 text-success",
        warning: "border-warning/30 bg-warning/10 text-primary",
        error: "border-danger/30 bg-danger/10 text-danger",
        info: "border-primary/30 bg-primary/10 text-primary",
      },
      size: {
        xs: "px-2 py-0.5 text-xs",
        sm: "px-2.5 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "sm",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
