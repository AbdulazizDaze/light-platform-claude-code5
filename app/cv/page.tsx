"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";

import { t, type Locale } from "@/lib/i18n";
import { dirFor } from "@/lib/i18n/dir";
import { cvStrings } from "@/lib/i18n/strings/cv";
import { useAuth } from "@/lib/firebase/auth-context";
import { db } from "@/lib/firebase/client";
import { candidateProfilesClientConverter } from "@/lib/firebase/converters";
import { authedFetch, AuthedFetchError } from "@/lib/api/authed-fetch";
import type { CandidateProfile } from "@/lib/schemas/profile";
import { CV_THEMES, type CvColorTheme, type CvTemplate } from "@/lib/cv/themes";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { CvPreview, CvPreviewSkeleton } from "@/components/cv/cv-preview";
import { CvCustomizer, type CvCustomizerValue, type SaveStatus } from "@/components/cv/cv-customizer";

type PageState = "loading" | "empty" | "error" | "ready";

const DEBOUNCE_MS = 800;

/**
 * /cv — full CV customization page (docs/design-system.md §10, PRD §6.1
 * step 7 / §18.A). Split layout: live preview on the start side, controls
 * (template, theme, AR/EN, download) on the end side. Collapses to stacked
 * on mobile with a sticky bottom action bar (Download PDF primary).
 *
 * Requires auth (redirect /register). If auth resolves but the candidate's
 * profile has no CV content yet (no professional_summary), shows a friendly
 * bilingual empty state with a CTA back to /chat rather than a hard redirect
 * — the profile may simply not exist yet or may still be loading, so we only
 * show "empty" once we've actually attempted the Firestore read.
 */
export default function CvPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [locale, setLocale] = React.useState<Locale>("ar");
  const [pageState, setPageState] = React.useState<PageState>("loading");
  const [profile, setProfile] = React.useState<CandidateProfile | null>(null);
  const [customizer, setCustomizer] = React.useState<CvCustomizerValue | null>(null);
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>("idle");
  const [isDownloading, setIsDownloading] = React.useState(false);

  const dir = dirFor(locale);
  const tr = React.useCallback(
    (key: keyof typeof cvStrings) => t(cvStrings[key], locale),
    [locale]
  );

  const debounceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstCustomizerSet = React.useRef(true);

  // Require auth: redirect unauthenticated visitors to /register once the
  // auth context has resolved (mirrors app/chat/page.tsx).
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/register");
    }
  }, [authLoading, user, router]);

  const loadProfile = React.useCallback(async () => {
    if (!user) return;
    setPageState("loading");
    try {
      const ref = doc(db, "candidate_profiles", user.uid).withConverter(
        candidateProfilesClientConverter
      );
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setPageState("empty");
        return;
      }

      const data = snap.data();
      const hasCv =
        (t(data.professional_summary, "ar").trim().length > 0 ||
          t(data.professional_summary, "en").trim().length > 0) &&
        data.skills.length > 0;

      if (!hasCv) {
        setPageState("empty");
        return;
      }

      setProfile(data);
      isFirstCustomizerSet.current = true;
      setCustomizer({
        template: data.cv_template,
        theme: data.cv_color_theme,
        customColors: {
          primary: data.cv_custom_colors?.primary ?? CV_THEMES.oxford.primary,
          accent: data.cv_custom_colors?.accent ?? CV_THEMES.oxford.accent,
        },
      });
      setPageState("ready");
    } catch {
      setPageState("error");
    }
  }, [user]);

  React.useEffect(() => {
    if (authLoading || !user) return;
    void loadProfile();
  }, [authLoading, user, loadProfile]);

  // Persist template/theme/custom_colors changes, debounced ~800ms
  // (owner-only Firestore write per security rules).
  React.useEffect(() => {
    if (!customizer || !user || !profile) return;

    // Skip persisting the very first value we set from the loaded profile —
    // it's already what's stored, no need to round-trip a write.
    if (isFirstCustomizerSet.current) {
      isFirstCustomizerSet.current = false;
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setSaveStatus("saving");

    debounceTimer.current = setTimeout(() => {
      (async () => {
        try {
          const ref = doc(db, "candidate_profiles", user.uid).withConverter(
            candidateProfilesClientConverter
          );
          const update: Partial<CandidateProfile> = {
            cv_template: customizer.template,
            cv_color_theme: customizer.theme,
          };
          if (customizer.theme === "custom") {
            update.cv_custom_colors = customizer.customColors;
          }
          await updateDoc(ref, update);
          setSaveStatus("saved");
        } catch {
          setSaveStatus("error");
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customizer]);

  // Reflect customizer changes into the local profile object immediately so
  // the live preview updates without waiting for the Firestore round-trip.
  const previewProfile: CandidateProfile | null = React.useMemo(() => {
    if (!profile || !customizer) return null;
    return {
      ...profile,
      cv_template: customizer.template,
      cv_color_theme: customizer.theme,
      cv_custom_colors:
        customizer.theme === "custom" ? customizer.customColors : profile.cv_custom_colors,
    };
  }, [profile, customizer]);

  const handleDownload = React.useCallback(async () => {
    if (!customizer || isDownloading) return;
    setIsDownloading(true);
    try {
      const body: {
        template: CvTemplate;
        theme: CvColorTheme;
        custom_colors?: { primary: string; accent: string };
        locale: Locale;
      } = {
        template: customizer.template,
        theme: customizer.theme,
        locale,
      };
      if (customizer.theme === "custom") {
        body.custom_colors = customizer.customColors;
      }

      const res = await authedFetch("/api/pdf", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        if (res.status === 429) {
          toast({
            variant: "warning",
            title: tr("downloadRateLimitTitle"),
            description: tr("downloadRateLimitBody"),
          });
          return;
        }
        let message = tr("downloadErrorBody");
        try {
          const errBody = (await res.json()) as {
            error?: { message?: { en: string; ar: string } };
          };
          if (errBody?.error?.message) {
            message = t(errBody.error.message, locale);
          }
        } catch {
          // ignore parse failure, use generic message
        }
        toast({ variant: "destructive", title: tr("downloadErrorTitle"), description: message });
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `light-cv-${locale}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof AuthedFetchError ? tr("downloadErrorBody") : tr("downloadErrorBody");
      toast({ variant: "destructive", title: tr("downloadErrorTitle"), description: message });
    } finally {
      setIsDownloading(false);
    }
  }, [customizer, isDownloading, locale, toast, tr]);

  if (authLoading || !user) {
    return (
      <main dir={dir} className="flex min-h-screen items-center justify-center px-4">
        <p className="text-body text-muted">{tr("redirecting")}</p>
      </main>
    );
  }

  if (pageState === "loading") {
    return <CvPageSkeleton dir={dir} title={tr("pageTitle")} />;
  }

  if (pageState === "empty") {
    return (
      <main dir={dir} className="flex min-h-screen items-center justify-center px-4">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <h1 className="text-h2 font-semibold text-primary">{tr("emptyTitle")}</h1>
          <p className="text-body text-muted">{tr("emptyBody")}</p>
          <Button variant="primary" size="lg" onClick={() => router.push("/chat")}>
            {tr("emptyCta")}
          </Button>
        </div>
      </main>
    );
  }

  if (pageState === "error" || !profile || !customizer || !previewProfile) {
    return (
      <main dir={dir} className="flex min-h-screen items-center justify-center px-4">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <h1 className="text-h2 font-semibold text-primary">{tr("loadErrorTitle")}</h1>
          <p className="text-body text-muted">{tr("loadErrorBody")}</p>
          <Button variant="secondary" size="lg" onClick={() => void loadProfile()}>
            {tr("retry")}
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main dir={dir} className="min-h-screen bg-bg pb-24 sm:pb-0">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-6 sm:px-6">
        <header>
          <h1 className="text-h1 font-semibold text-primary">{tr("pageTitle")}</h1>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Live preview — start side */}
          <section aria-label={tr("previewHeading")} className="flex flex-col gap-3">
            <h2 className="text-h3 font-semibold text-primary lg:hidden">{tr("previewHeading")}</h2>
            <CvPreview profile={previewProfile} locale={locale} />
          </section>

          {/* Controls — end side */}
          <section aria-label={tr("controlsHeading")}>
            <CvCustomizer
              profile={previewProfile}
              locale={locale}
              onLocaleChange={setLocale}
              value={customizer}
              onChange={setCustomizer}
              saveStatus={saveStatus}
              onDownload={handleDownload}
              isDownloading={isDownloading}
            />
          </section>
        </div>
      </div>

      {/* Sticky bottom action bar on mobile (design-system.md §10). */}
      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-bg/95 p-3 backdrop-blur sm:hidden">
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              {tr("preparing")}
            </>
          ) : (
            tr("downloadPdf")
          )}
        </Button>
      </div>
    </main>
  );
}

function CvPageSkeleton({ dir, title }: { dir: "rtl" | "ltr"; title: string }) {
  return (
    <main dir={dir} className="min-h-screen bg-bg pb-24 sm:pb-0">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-6 sm:px-6">
        <header>
          <h1 className="text-h1 font-semibold text-primary">{title}</h1>
        </header>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <CvPreviewSkeleton />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
