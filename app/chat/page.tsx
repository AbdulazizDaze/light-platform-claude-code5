"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

import { t, type Locale } from "@/lib/i18n";
import { dirFor } from "@/lib/i18n/dir";
import { chatStrings } from "@/lib/i18n/strings/chat";
import { commonStrings } from "@/lib/i18n/strings/common";
import { useAuth } from "@/lib/firebase/auth-context";
import { authedFetch, AuthedFetchError } from "@/lib/api/authed-fetch";
import type { Cv } from "@/lib/schemas/cv";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { QuickReplyChips } from "@/components/chat/quick-reply-chips";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { CvCard, CvCardSkeleton } from "@/components/cv/cv-card";

/** The exact response shape the backend `POST /api/chat` route returns. */
interface ChatApiResponse {
  reply: string;
  quick_replies: string[];
  cv_generated: boolean;
  cv_data: Cv | null;
  session_status: "active" | "completed";
}

interface ChatApiErrorBody {
  error: {
    code: string;
    message: { en: string; ar: string };
  };
}

interface DisplayMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
  quickReplies?: string[];
}

const LOCALE: Locale = "ar";

/**
 * /chat — full-screen candidate chat (docs/design-system.md §10, PRD §6.1).
 * No sidebar/nav chrome; centered ~680px column; sticky composer at the
 * bottom. Requires auth — redirects to /register if there's no user once the
 * auth context has finished loading.
 */
export default function ChatPage() {
  const router = useRouter();
  const { user, loading: authLoading, signInAnonymouslyIfNeeded } = useAuth();
  const { toast } = useToast();

  const [messages, setMessages] = React.useState<DisplayMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [error, setError] = React.useState<{ en: string; ar: string } | null>(null);
  const [cv, setCv] = React.useState<Cv | null>(null);
  const [cvGenerating, setCvGenerating] = React.useState(false);
  const [sessionStatus, setSessionStatus] = React.useState<"active" | "completed">("active");

  const scrollAnchorRef = React.useRef<HTMLDivElement | null>(null);
  const hasRequestedGreeting = React.useRef(false);

  const dir = dirFor(LOCALE);

  // Require auth: once the auth context resolves, redirect unauthenticated
  // visitors to /register instead of silently signing them in here — chat is
  // an intent-driven entry point that registration already establishes.
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/register");
    }
  }, [authLoading, user, router]);

  const sendToApi = React.useCallback(
    async (message: string) => {
      setError(null);
      try {
        const res = await authedFetch("/api/chat", {
          method: "POST",
          body: JSON.stringify({ message }),
        });

        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as ChatApiErrorBody | null;
          if (res.status === 429) {
            toast({
              variant: "warning",
              title: t(chatStrings.rateLimitTitle, LOCALE),
              description: t(chatStrings.rateLimitBody, LOCALE),
            });
            return null;
          }
          const message =
            body?.error?.message ?? {
              en: chatStrings.sendErrorBody.en,
              ar: chatStrings.sendErrorBody.ar,
            };
          setError(message);
          return null;
        }

        const data = (await res.json()) as ChatApiResponse;
        return data;
      } catch (err) {
        if (err instanceof AuthedFetchError) {
          setError({
            en: chatStrings.authRequiredBody.en,
            ar: chatStrings.authRequiredBody.ar,
          });
        } else {
          setError({ en: chatStrings.sendErrorBody.en, ar: chatStrings.sendErrorBody.ar });
        }
        return null;
      }
    },
    [toast]
  );

  const applyResponse = React.useCallback((data: ChatApiResponse) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
        quickReplies: data.quick_replies,
      },
    ]);
    setSessionStatus(data.session_status);
    if (data.cv_generated && data.cv_data) {
      setCv(data.cv_data);
      setCvGenerating(false);
    }
  }, []);

  // On mount (once authenticated), if there's no local history yet, request
  // the initial greeting with an empty-string message per the API contract.
  React.useEffect(() => {
    if (authLoading || !user) return;
    if (hasRequestedGreeting.current) return;
    if (messages.length > 0) return;
    hasRequestedGreeting.current = true;

    (async () => {
      setIsInitializing(true);
      const data = await sendToApi("");
      if (data) applyResponse(data);
      setIsInitializing(false);
    })();
  }, [authLoading, user, messages.length, sendToApi, applyResponse]);

  React.useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  const handleSend = React.useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || isSending || sessionStatus === "completed") return;

      // Optimistic append of the user's message.
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: "user",
          content: text,
          timestamp: new Date(),
        },
      ]);
      setInput("");
      setIsSending(true);
      setCvGenerating(!cv);

      const data = await sendToApi(text);
      if (data) applyResponse(data);
      setCvGenerating(false);
      setIsSending(false);
    },
    [isSending, sessionStatus, sendToApi, applyResponse, cv]
  );

  const handleRetry = React.useCallback(() => {
    setError(null);
    if (messages.length === 0) {
      hasRequestedGreeting.current = false;
      setIsInitializing(true);
      (async () => {
        const data = await sendToApi("");
        if (data) applyResponse(data);
        setIsInitializing(false);
      })();
      return;
    }
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage) {
      void handleSend(lastUserMessage.content);
    }
  }, [messages, sendToApi, applyResponse, handleSend]);

  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");
  const showQuickReplies =
    !isSending &&
    !error &&
    sessionStatus === "active" &&
    lastAssistantMessage &&
    messages[messages.length - 1]?.id === lastAssistantMessage.id &&
    (lastAssistantMessage.quickReplies?.length ?? 0) > 0;

  if (authLoading || !user) {
    return (
      <main dir={dir} className="flex min-h-screen items-center justify-center px-4">
        <p className="text-body text-muted">{t(chatStrings.redirecting, LOCALE)}</p>
      </main>
    );
  }

  return (
    <main dir={dir} className="flex min-h-screen flex-col bg-bg">
      <div className="mx-auto flex w-full max-w-[680px] flex-1 flex-col px-4">
        <header className="py-4">
          <h1 className="text-h2 font-semibold text-primary">{t(chatStrings.pageTitle, LOCALE)}</h1>
        </header>

        <div className="flex-1 overflow-y-auto pb-4">
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <React.Fragment key={msg.id}>
                <ChatBubble
                  role={msg.role}
                  content={msg.content}
                  timestamp={msg.timestamp}
                  locale={LOCALE}
                />
                {msg.role === "assistant" &&
                  msg.id === lastAssistantMessage?.id &&
                  showQuickReplies && (
                    <div className="flex justify-start">
                      <QuickReplyChips
                        replies={msg.quickReplies ?? []}
                        onSelect={handleSend}
                        disabled={isSending}
                      />
                    </div>
                  )}
              </React.Fragment>
            ))}

            {(isInitializing || isSending) && (
              <div className="flex justify-start">
                <TypingIndicator locale={LOCALE} />
              </div>
            )}

            {cvGenerating && !cv && (
              <div className="flex justify-start w-full">
                <div className="w-full">
                  <CvCardSkeleton locale={LOCALE} />
                </div>
              </div>
            )}

            {cv && (
              <div className="flex justify-start w-full">
                <div className="w-full">
                  <CvCard cv={cv} locale={LOCALE} />
                </div>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-start gap-2 rounded-lg border-s-2 border-s-danger bg-bg px-4 py-3 shadow-e1">
                <p className="text-body text-primary">{t(error, LOCALE)}</p>
                <Button variant="secondary" size="sm" onClick={handleRetry}>
                  {t(commonStrings.retry, LOCALE)}
                </Button>
              </div>
            )}

            <div ref={scrollAnchorRef} />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-border bg-bg/95 backdrop-blur">
        <form
          className="mx-auto flex w-full max-w-[680px] items-center gap-2 px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend(input);
          }}
        >
          <label htmlFor="chat-composer" className="sr-only">
            {t(chatStrings.composerPlaceholder, LOCALE)}
          </label>
          <input
            id="chat-composer"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t(chatStrings.composerPlaceholder, LOCALE)}
            disabled={isSending || sessionStatus === "completed" || isInitializing}
            className="flex min-h-[44px] flex-1 rounded-sm border border-border bg-bg px-3 py-2 text-start text-body text-primary placeholder:text-muted transition-colors duration-fast focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-border/40 disabled:text-muted"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSending || !input.trim() || sessionStatus === "completed" || isInitializing}
            aria-label={t(chatStrings.send, LOCALE)}
          >
            {/* Send is a directional icon (points toward the composer's logical
                end); mirror it in RTL per design-system.md §8. rtl:-scale-x-100
                mirrors only under dir=rtl, so it self-corrects in the LTR case. */}
            <Send className="h-5 w-5 rtl:-scale-x-100" aria-hidden />
          </Button>
        </form>
      </div>
    </main>
  );
}
