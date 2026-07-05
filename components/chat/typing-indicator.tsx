import { t, type Locale } from "@/lib/i18n";
import { chatStrings } from "@/lib/i18n/strings/chat";

/**
 * Typing indicator — three jungle dots (docs/design-system.md §6). Purely
 * decorative + an sr-only label for screen readers; honors
 * prefers-reduced-motion via the shared bounce keyframes (opacity-only pulse
 * would also be acceptable, but the bounce here is subtle/short enough that
 * we keep it — see app/globals.css reduced-motion rule which clamps
 * animation-duration globally).
 */
export function TypingIndicator({ locale = "ar" }: { locale?: Locale }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg rounded-ss-sm border-s-2 border-s-accent bg-bg px-4 py-3 shadow-e1" role="status">
      <span className="sr-only">{t(chatStrings.typingLabel, locale)}</span>
      <span className="inline-flex items-center gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-accent" />
      </span>
    </div>
  );
}
