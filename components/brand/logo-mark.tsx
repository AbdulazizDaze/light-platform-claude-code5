import * as React from "react";

import { cn } from "@/lib/utils";

export interface LogoMarkProps extends React.SVGAttributes<SVGSVGElement> {
  /** Pixel size of the (square) mark. Default 32. */
  size?: number;
  /**
   * Bracket color source. Defaults to the navy brand token so the mark is
   * correct out-of-the-box on a light background without any wrapping class.
   * Pass `"currentColor"` and wrap in e.g. `text-white` to theme the bracket
   * for a dark navy surface.
   */
  bracketColor?: string;
  /** Arrow color — always the amber accent token; the arrow never inverts. */
  arrowColor?: string;
}

/**
 * Light logomark (PRD §9.1, docs/design-system.md §9): a navy corner-bracket
 * "L" — a thick right angle occupying the left and bottom edges of the
 * glyph's box — with an amber arrow rising through the open corner at 45°,
 * from the lower-left to the upper-right, ending in a solid arrowhead. Flat
 * geometric shapes only: no gradients, no photographic/illustrative detail.
 *
 * `bracketColor` defaults to `var(--color-primary)` (navy) for use on light
 * surfaces; pass `bracketColor="currentColor"` (and wrap in `text-white` or
 * similar) to use the mark on a dark navy surface. `arrowColor` always
 * defaults to the amber accent token — the arrow is the one constant brand
 * signal and does not invert with surface.
 */
export function LogoMark({
  size = 32,
  bracketColor = "var(--color-primary)",
  arrowColor = "var(--color-accent)",
  className,
  ...props
}: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Light"
      className={cn("shrink-0", className)}
      {...props}
    >
      {/*
        Corner bracket ("L"): a thick right angle tracing the left and
        bottom edges of the glyph box, going clockwise from the top of the
        vertical stroke: down the outer left edge, across the outer bottom
        edge, back along the inner bottom edge, up the inner left edge, and
        across to close the top of the vertical stroke.
      */}
      <path
        d="M4 4 H10 V20 H27 V26 H4 Z"
        fill={bracketColor}
      />
      {/*
        Arrow: a shaft rising at 45 degrees from the lower-left (inside the
        open corner) to the upper-right, capped with a solid triangular
        arrowhead. Built as two simple polygons so the geometry stays exact
        regardless of stroke rendering.
      */}
      <polygon points="12,23 16,23 25,14 25,10 21,10" fill={arrowColor} />
      <polygon points="19,7 28,7 28,16" fill={arrowColor} />
    </svg>
  );
}
