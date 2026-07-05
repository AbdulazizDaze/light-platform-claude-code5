import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

export type ChatBubbleRole = "assistant" | "user";

export interface ChatBubbleProps {
  role: ChatBubbleRole;
  content: string;
  timestamp?: Date;
  locale?: Locale;
}

/**
 * Chat bubble (docs/design-system.md §6, PRD §10.4): **AI bubbles on the
 * right, user bubbles on the left** — the opposite of Western chat apps, but
 * natural for RTL reading.
 *
 * Implementation note (read before "fixing" this): under `dir="rtl"`, the
 * flex/text *logical* start side is the visual **right**, and end is the
 * visual **left**. So "AI on the right" = AI bubble aligned to the **start**
 * side, and "user on the left" = user bubble aligned to the **end** side.
 * We therefore use `justify-start`/`ms-auto` etc. purely as logical-in-RTL
 * primitives — never physical left/right utilities — so this also degrades
 * sensibly (mirrors, not breaks) if the app ever renders a container LTR.
 *
 * Bubble shape: `lg` radius with one squared corner *toward the speaker*
 * (i.e. toward the edge the bubble is anchored to) — assistant squares its
 * start corner, user squares its end corner.
 */
export function ChatBubble({ role, content, timestamp, locale = "ar" }: ChatBubbleProps) {
  const isAssistant = role === "assistant";

  return (
    <div className={cn("flex w-full", isAssistant ? "justify-start" : "justify-end")}>
      <div className={cn("flex max-w-[85%] flex-col gap-1 sm:max-w-[75%]", isAssistant ? "items-start" : "items-end")}>
        <div
          className={cn(
            "rounded-lg px-4 py-3 text-start text-body-lg",
            isAssistant
              ? // AI: surface/white bubble, jungle start-accent border signals intelligence,
                // squared start corner (the corner nearest the start edge it's anchored to).
                "rounded-ss-sm border-s-2 border-s-accent bg-bg text-primary shadow-e1"
              : // User: oxford-tinted bubble, squared end corner.
                "rounded-ee-sm bg-primary/10 text-primary"
          )}
        >
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
        {timestamp && (
          <span className="px-1 text-xs text-muted">
            {new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
              hour: "numeric",
              minute: "2-digit",
            }).format(timestamp)}
          </span>
        )}
      </div>
    </div>
  );
}
