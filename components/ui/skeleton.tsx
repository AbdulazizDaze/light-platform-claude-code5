import { cn } from "@/lib/utils";

/**
 * Skeleton primitive (docs/design-system.md §6, brand-core v3). Every
 * list/async surface uses skeletons that match the final layout — never a
 * bare spinner. Uses a shimmering gradient sweep instead of a plain pulse;
 * honors `prefers-reduced-motion` by falling back to a static pulse (the
 * global rule in app/globals.css clamps `animation-duration` to ~0 for
 * `animate-shimmer`, which would otherwise look frozen mid-sweep, so we
 * additionally swap to `motion-reduce:animate-pulse` for a visible, calmer
 * loading cue).
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-shimmer motion-reduce:animate-pulse rounded-sm bg-border/60 bg-[length:200%_100%]",
        "bg-gradient-to-r from-border/60 via-border/30 to-border/60",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
