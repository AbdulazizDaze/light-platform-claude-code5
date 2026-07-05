import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button primitive (docs/design-system.md §6).
 * Variants: primary (jungle fill), secondary (oxford outline), ghost (text
 * only), danger (fire). Sizes: sm 32h / md 40h / lg 48h. Icon+label uses a
 * logical gap so icons sit on the start side automatically in RTL.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-border disabled:text-muted disabled:opacity-100",
  {
    variants: {
      variant: {
        primary: "bg-accent text-primary-foreground hover:bg-accent/90 active:bg-accent/80",
        secondary:
          "border border-primary bg-transparent text-primary hover:bg-primary/5 active:bg-primary/10",
        ghost: "bg-transparent text-primary hover:bg-primary/5 active:bg-primary/10",
        danger: "bg-danger text-white hover:bg-danger/90 active:bg-danger/80",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-body",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
