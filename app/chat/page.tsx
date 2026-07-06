"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Paperclip, Send } from "lucide-react";

import { t, type Locale } from "@/lib/i18n";
import { dirFor } from "@/lib/i18n/dir";
import { chatStrings } from "@/lib/i18n/strings/chat";
import { commonStrings } from "@/lib/i18n/strings/common";
import { useAuth } from "@/lib/firebase/auth-context";
import { authedFetch, AuthedFetchError } from "@/lib/api/authed-fetch";
import type { Cv } from "@/lib/schemas/cv";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { QuickReplyChips } from "@/components/chat/quick-reply-chips";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { CvCard, CvCardSkeleton } from "@/components/cv/cv-card";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4MB — mirrors lib/cv-upload/parse-upload.ts

/** Read a File as a base64 string (no `data:` URL prefix). */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("file read failed"));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("unexpected file reader result"));
        return;
      }
      const commaIndex = result.indexOf(",");
      resolve(commaIndex !== -1 ? result.slice(commaIndex + 1) : result);
    };
    reader.readAsDataURL(file);
  });
}

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
  // False until the greeting request actually starts — the entry-choice card
  // is a waiting-on-the-user state, not a loading state, so the typing
  // indicator must not show and the composer must stay usable before a choice.
  const [isInitializing, setIsInitializing] = React.useState(false);
  const [error, setError] = React.useState<{ en: string; ar: string } | null>(null);
  const [cv, setCv] = React.useState<Cv | null>(null);
  const [cvGenerating, setCvGenerating] = React.useState(false);
  const [sessionStatus, setSessionStatus] = React.useState<"active" | "completed">("active");

  // Entry-choice card (PRD §6.1 step 3): a brand-new session offers "upload
  // existing CV" or "start from scratch" before any greeting is requested.
  // Defaults to true (card hidden) once either path is chosen or a session
  // already has history — see the reset in handleRetry for the empty-history case.
  const [entryChoiceMade, setEntryChoiceMade] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

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
    // A completed-session reply from POST /api/chat is "" with no quick
    // replies (see app/api/chat/route.ts's early-return for
    // session.status === "completed") — nothing to show, so skip appending
    // an empty assistant bubble.
    const hasVisibleContent = data.reply !== "" || data.quick_replies.length > 0;
    if (hasVisibleContent) {
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
    }
    setSessionStatus(data.session_status);
    if (data.cv_generated && data.cv_data) {
      setCv(data.cv_data);
      setCvGenerating(false);
    }
  }, []);

  // Once authenticated with no local history yet, request the initial
  // greeting with an empty-string message per the API contract — but only
  // AFTER the candidate has made an entry choice ("start from scratch"; the
  // "upload CV" path calls /api/cv-upload directly instead and skips this).
  React.useEffect(() => {
    if (authLoading || !user) return;
    if (!entryChoiceMade) return;
    if (hasRequestedGreeting.current) return;
    if (messages.length > 0) return;
    hasRequestedGreeting.current = true;

    (async () => {
      setIsInitializing(true);
      const data = await sendToApi("");
      if (data) applyResponse(data);
      setIsInitializing(false);
    })();
  }, [authLoading, user, entryChoiceMade, messages.length, sendToApi, applyResponse]);

  React.useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  const handleSend = React.useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || isSending || isUploading || sessionStatus === "completed") return;

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
    [isSending, isUploading, sessionStatus, sendToApi, applyResponse, cv]
  );

  const handleChooseScratch = React.useCallback(() => {
    setEntryChoiceMade(true);
  }, []);

  const handleUploadFile = React.useCallback(
    async (file: File) => {
      setError(null);

      if (file.type !== "application/pdf") {
        toast({
          variant: "destructive",
          title: t(chatStrings.sendErrorTitle, LOCALE),
          description: t(chatStrings.uploadErrorNotPdf, LOCALE),
        });
        return;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        toast({
          variant: "destructive",
          title: t(chatStrings.sendErrorTitle, LOCALE),
          description: t(chatStrings.uploadErrorTooLarge, LOCALE),
        });
        return;
      }

      // The upload path replaces the entry-choice card and greeting flow —
      // /api/cv-upload's response IS the first turn of the session.
      setEntryChoiceMade(true);
      hasRequestedGreeting.current = true;
      setIsUploading(true);
      setIsInitializing(false);

      try {
        const file_base64 = await fileToBase64(file);
        const res = await authedFetch("/api/cv-upload", {
          method: "POST",
          body: JSON.stringify({ file_base64, filename: file.name }),
        });

        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as ChatApiErrorBody | null;
          if (res.status === 429) {
            toast({
              variant: "warning",
              title: t(chatStrings.rateLimitTitle, LOCALE),
              description: t(chatStrings.rateLimitBody, LOCALE),
            });
          } else {
            setError(body?.error?.message ?? { en: chatStrings.uploadErrorGeneric.en, ar: chatStrings.uploadErrorGeneric.ar });
          }
          return;
        }

        const data = (await res.json()) as ChatApiResponse;
        applyResponse(data);
      } catch (err) {
        if (err instanceof AuthedFetchError) {
          setError({ en: chatStrings.authRequiredBody.en, ar: chatStrings.authRequiredBody.ar });
        } else {
          setError({ en: chatStrings.uploadErrorGeneric.en, ar: chatStrings.uploadErrorGeneric.ar });
        }
      } finally {
        setIsUploading(false);
      }
    },
    [toast, applyResponse]
  );

  const handleFileInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ""; // allow re-selecting the same file later
      if (file) void handleUploadFile(file);
    },
    [handleUploadFile]
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

  // Shown only for a genuinely new session: no history yet, no choice made,
  // and neither the greeting nor an upload is already in flight.
  const showEntryChoice =
    !authLoading && !!user && !entryChoiceMade && messages.length === 0 && !isUploading;

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
            {showEntryChoice && (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>{t(chatStrings.entryChoiceTitle, LOCALE)}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-start gap-1 rounded-md border border-border bg-bg px-4 py-3 text-start transition-colors duration-fast hover:border-accent hover:bg-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="text-body font-medium text-primary">
                      {t(chatStrings.entryChoiceUpload, LOCALE)}
                    </span>
                    <CardDescription>{t(chatStrings.entryChoiceUploadHint, LOCALE)}</CardDescription>
                  </button>
                  <button
                    type="button"
                    onClick={handleChooseScratch}
                    className="flex flex-col items-start gap-1 rounded-md border border-border bg-bg px-4 py-3 text-start transition-colors duration-fast hover:border-accent hover:bg-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="text-body font-medium text-primary">
                      {t(chatStrings.entryChoiceScratch, LOCALE)}
                    </span>
                    <CardDescription>{t(chatStrings.entryChoiceScratchHint, LOCALE)}</CardDescription>
                  </button>
                </CardContent>
              </Card>
            )}

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

            {(isInitializing || isSending || isUploading) && (
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
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={handleFileInputChange}
            aria-hidden
            tabIndex={-1}
          />
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending || isUploading || sessionStatus === "completed" || isInitializing}
            aria-label={t(chatStrings.uploadButtonLabel, LOCALE)}
            title={t(chatStrings.uploadButtonLabel, LOCALE)}
          >
            <Paperclip className="h-5 w-5" aria-hidden />
          </Button>
          <input
            id="chat-composer"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t(chatStrings.composerPlaceholder, LOCALE)}
            disabled={isSending || isUploading || sessionStatus === "completed" || isInitializing}
            className="flex min-h-[44px] flex-1 rounded-sm border border-border bg-bg px-3 py-2 text-start text-body text-primary placeholder:text-muted transition-colors duration-fast focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-border/40 disabled:text-muted"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSending || isUploading || !input.trim() || sessionStatus === "completed" || isInitializing}
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
