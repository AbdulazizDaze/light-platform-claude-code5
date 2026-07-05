import { cn } from "@/lib/utils";

/**
 * Skeleton primitive (docs/design-system.md §6). Every list/async surface
 * uses skeletons that match the final layout — never a bare spinner.
 * Honors prefers-reduced-motion via the global rule in app/globals.css
 * (animation-duration is clamped, so the pulse becomes a static tint).
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-sm bg-border/60", className)}
      {...props}
    />
  );
}

export { Skeleton };
