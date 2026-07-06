"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Lightweight fade-rise-on-scroll wrapper for landing sections (PRD §9.3
 * "motion" / docs/design-system.md §7). SSR-safe: renders children normally
 * on the server and during first paint (no layout shift, no hidden content
 * for users/crawlers with JS disabled), then adds the `animate-fade-rise`
 * class once the element enters the viewport. Honors `prefers-reduced-motion`
 * globally via app/globals.css (animation-duration clamped to ~0).
 */
export function RevealOnView({
  children,
  className,
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={visible ? { animationDelay: `${delayMs}ms` } : { opacity: 0 }}
      className={cn(visible && "animate-fade-rise", className)}
    >
      {children}
    </div>
  );
}
