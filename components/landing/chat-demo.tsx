"use client";

import * as React from "react";
import { Sparkles, Check } from "lucide-react";

import { t, type Locale } from "@/lib/i18n";
import { landingStrings as s } from "@/lib/i18n/strings/landing";
import { LogoMark } from "@/components/brand/logo-mark";
import { cn } from "@/lib/utils";

/**
 * Self-typing chat demo — the landing hero centerpiece (PRD §9.4, the v3
 * screen-redesign blueprint). Auto-plays a compressed version of the PRD
 * §5.1 golden conversation on loop: AI greeting -> user message typed out ->
 * extraction ticks -> "building CV" -> a mini CV-ready card, then pauses and
 * restarts. Pure client-side timers, no network/AI calls — this is a marketing
 * mockup, not the real chat engine.
 *
 * Respects `prefers-reduced-motion`: renders the final state statically
 * instead of looping/typing, per docs/design-system.md §7.
 */

type Step =
  | "ai-greeting"
  | "user-typing"
  | "ticks"
  | "generating"
  | "cv-ready"
  | "pause";

const TYPING_SPEED_MS = 28; // per character
const STEP_DURATIONS_MS: Record<Exclude<Step, "user-typing">, number> = {
  "ai-greeting": 900,
  ticks: 1600,
  generating: 1200,
  "cv-ready": 2600,
  pause: 900,
};

function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export function ChatDemo({ locale = "ar" }: { locale?: Locale }) {
  const reducedMotion = useReducedMotion();
  const [step, setStep] = React.useState<Step>("ai-greeting");
  const [typedChars, setTypedChars] = React.useState(0);
  const [tickCount, setTickCount] = React.useState(0);

  const userMessage = t(s.demoUserMessage, locale);

  // Drive the loop with a single chained timer effect keyed on `step`.
  React.useEffect(() => {
    if (reducedMotion) return; // static final state, no timers

    if (step === "user-typing") {
      if (typedChars < userMessage.length) {
        const timer = setTimeout(() => setTypedChars((c) => c + 1), TYPING_SPEED_MS);
        return () => clearTimeout(timer);
      }
      const timer = setTimeout(() => setStep("ticks"), 400);
      return () => clearTimeout(timer);
    }

    const duration = STEP_DURATIONS_MS[step as Exclude<Step, "user-typing">];
    const timer = setTimeout(() => {
      switch (step) {
        case "ai-greeting":
          setStep("user-typing");
          setTypedChars(0);
          break;
        case "ticks":
          setStep("generating");
          break;
        case "generating":
          setStep("cv-ready");
          break;
        case "cv-ready":
          setStep("pause");
          break;
        case "pause":
          setTickCount(0);
          setStep("ai-greeting");
          break;
      }
    }, duration);
    return () => clearTimeout(timer);
  }, [step, typedChars, userMessage.length, reducedMotion]);

  // Stagger the three extraction ticks within the "ticks" step.
  React.useEffect(() => {
    if (reducedMotion || step !== "ticks") return;
    if (tickCount >= 3) return;
    const timer = setTimeout(() => setTickCount((c) => c + 1), 350);
    return () => clearTimeout(timer);
  }, [step, tickCount, reducedMotion]);

  const showUserBubble = reducedMotion || step !== "ai-greeting";
  const userText = reducedMotion ? userMessage : userMessage.slice(0, typedChars);
  const showTicks = reducedMotion || step === "ticks" || step === "generating" || step === "cv-ready" || step === "pause";
  const visibleTickCount = reducedMotion ? 3 : tickCount;
  const showGenerating = reducedMotion ? false : step === "generating";
  const showCvReady = reducedMotion || step === "cv-ready" || step === "pause";

  const ticks = [s.demoTick1, s.demoTick2, s.demoTick3];

  return (
    <div className="relative mx-auto max-w-[440px]" aria-hidden="true">
      {/* Amber glow behind the card — the brand's signature dark-navy moment */}
      <div className="pointer-events-none absolute -inset-6 rounded-xl bg-accent/20 blur-3xl" />

      <div className="relative rounded-xl border border-white/10 bg-white/[0.06] p-4 shadow-e3 backdrop-blur-sm sm:p-6">
        <div className="flex flex-col gap-4">
          {/* AI message */}
          <div className="flex items-start justify-start gap-2 animate-fade-rise">
            <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15">
              <LogoMark size={16} bracketColor="currentColor" className="text-accent" />
            </span>
            <div className="rounded-lg rounded-ss-sm border-s-2 border-accent bg-white/90 px-4 py-3 shadow-e1">
              <p className="text-sm text-primary">{t(s.demoAiGreeting, locale)}</p>
            </div>
          </div>

          {/* User message — typed out character by character */}
          {showUserBubble && (
            <div className="flex items-start justify-end animate-fade-rise">
              <div className="max-w-[85%] rounded-lg rounded-ee-sm bg-primary-deep/80 px-4 py-3 text-white">
                <p className="min-h-[1.5em] whitespace-pre-wrap text-sm">
                  {userText}
                  {!reducedMotion && step === "user-typing" && typedChars < userMessage.length && (
                    <span className="ms-0.5 inline-block h-3.5 w-[2px] animate-pulse bg-white align-middle" />
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Extraction ticks */}
          {showTicks && (
            <div className="flex flex-col gap-1.5 ps-9">
              {ticks.slice(0, visibleTickCount).map((tick, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-xs text-white/80 animate-fade-rise"
                >
                  <Check className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden />
                  {t(tick, locale)}
                </div>
              ))}
            </div>
          )}

          {/* Generating indicator */}
          {showGenerating && (
            <div className="flex items-center gap-1.5 rounded-lg rounded-ss-sm border-s-2 border-s-accent bg-white/90 px-4 py-3 shadow-e1 animate-fade-rise">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-accent" />
              </span>
              <span className="text-sm text-primary">{t(s.demoGenerating, locale)}</span>
            </div>
          )}

          {/* Mini CV-ready card */}
          {showCvReady && (
            <div className="rounded-lg border border-accent/30 bg-white/95 p-4 shadow-e2 animate-fade-rise">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10">
                  <Check className="h-4 w-4 text-success" aria-hidden />
                </span>
                <p className="text-sm font-semibold text-primary">{t(s.demoCvReadyTitle, locale)}</p>
              </div>
              <p className="text-sm text-muted">{t(s.demoCvReadyRole, locale)}</p>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-accent-deep">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                {t(s.demoCvReadyCta, locale)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Named export alias kept explicit for clarity when imported alongside other
// landing-only components (see app/page.tsx).
export default ChatDemo;
