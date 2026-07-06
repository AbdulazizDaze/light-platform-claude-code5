import * as React from "react";

import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/brand/logo-mark";

export interface LogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * `"ar"` / `"en"` render the mark + wordmark in that language; `"mark-only"`
   * renders just the logomark (e.g. compact nav bars, favicons-in-UI).
   */
  lang?: "ar" | "en" | "mark-only";
  /** Wordmark + mark size. `"sm"` for compact nav bars, `"md"` default, `"lg"` for hero/footer. */
  size?: "sm" | "md" | "lg";
  /** Set true on a dark navy surface — flips the bracket + wordmark to white. */
  onDark?: boolean;
}

const MARK_SIZE: Record<NonNullable<LogoProps["size"]>, number> = {
  sm: 24,
  md: 32,
  lg: 44,
};

const WORDMARK_TEXT_CLASS: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "text-h3",
  md: "text-h2",
  lg: "text-display",
};

/**
 * Logo lockup (PRD §9.1, docs/design-system.md §9): logomark + wordmark.
 * Latin "LIGHT" uses the bold Alexandria weight to approximate the logo's
 * geometric sans (no new font per brand-core scope); Arabic uses the
 * brand name "لايت". Navy on light surfaces, white on dark navy surfaces
 * (`onDark`) — the amber arrow inside the mark never changes.
 */
export function Logo({ lang = "ar", size = "md", onDark = false, className, ...props }: LogoProps) {
  const markSize = MARK_SIZE[size];
  const textColorClass = onDark ? "text-white" : "text-primary";

  return (
    <span
      className={cn("inline-flex items-center gap-2", className)}
      {...props}
    >
      <LogoMark size={markSize} bracketColor={onDark ? "currentColor" : undefined} className={textColorClass} />
      {lang !== "mark-only" && (
        <span
          className={cn(
            WORDMARK_TEXT_CLASS[size],
            "font-bold tracking-tight",
            textColorClass,
            lang === "ar" && "tracking-normal" // never letter-space Arabic; it breaks glyph joining
          )}
        >
          {lang === "ar" ? "لايت" : "LIGHT"}
        </span>
      )}
    </span>
  );
}
