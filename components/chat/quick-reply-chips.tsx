"use client";

import { cn } from "@/lib/utils";

export interface QuickReplyChipsProps {
  replies: string[];
  onSelect: (reply: string) => void;
  disabled?: boolean;
}

/**
 * Quick-reply chips (docs/design-system.md §6): pill buttons under the latest
 * AI message suggesting answers. sm size, amber outline + navy text, fill on hover, wrap
 * to multiple lines, keyboard navigable (native <button> elements in a flex
 * wrap — tab order follows DOM order, arrow keys not required per spec).
 */
export function QuickReplyChips({ replies, onSelect, disabled }: QuickReplyChipsProps) {
  if (replies.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 ps-1" role="group">
      {replies.map((reply, index) => (
        <button
          key={`${index}-${reply}`}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(reply)}
          className={cn(
            "rounded-full border border-accent px-3 py-1 text-sm font-medium text-primary transition-colors duration-fast",
            "hover:bg-accent active:bg-accent-deep",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:border-border disabled:text-muted disabled:hover:bg-transparent"
          )}
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
