"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Gauge, Radar, Sparkles } from "lucide-react";

import { t, type Locale } from "@/lib/i18n";
import { dirFor } from "@/lib/i18n/dir";
import { appName } from "@/lib/i18n/strings/common";
import {
  dashboardStrings as s,
  cvTemplateLabels,
  cvColorThemeLabels,
} from "@/lib/i18n/strings/dashboard";
import { useAuth } from "@/lib/firebase/auth-context";
import { useCandidateData } from "@/lib/firebase/candidate-data";
import { computeProfileCompleteness } from "@/lib/profile/completeness";
import type { CandidateProfile, CvTemplateSchema, CvColorThemeSchema } from "@/lib/schemas/profile";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const LOCALE: Locale = "ar";

type CvTemplate = z.infer<typeof CvTemplateSchema>;
type CvColorTheme = z.infer<typeof CvColorThemeSchema>;

/**
 * /dashboard — candidate dashboard (docs/design-system.md §10; PRD §6.1
 * steps 7-9, §11.1). Auth-required, redirects to /register when signed out.
 *
 * Nav decision: design-system.md §10 allows dashboards a collapsible sidebar,
 * but M1's candidate surface only has 3 destinations (dashboard / chat / cv).
 * A full collapsible sidebar would be more chrome than content for that
 * scope, and progressive disclosure (design-system.md §1.5) favors the
 * simpler pattern here — so this page uses the same lightweight header-nav
 * already established on the landing page (app/page.tsx SiteHeader) instead.
 * Revisit if/when the candidate surface grows more destinations.
 */
export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile, chatSession } = useCandidateData(user?.uid);
  const dir = dirFor(LOCALE);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/register");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <main dir={dir} className="flex min-h-screen items-center justify-center px-4">
        <p className="text-body text-muted">{t(s.redirecting, LOCALE)}</p>
      </main>
    );
  }

  const isLoading = profile.loading || chatSession.loading;
  const hasError = Boolean(profile.error || chatSession.error);
  const hasProfile = Boolean(profile.data);
  const cvData = chatSession.data?.cv_data ?? null;
  const hasCv = Boolean(cvData);

  return (
    <div dir={dir} className="flex min-h-screen flex-col bg-bg">
      <DashboardHeader />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-h1 font-semibold text-primary">{t(s.pageTitle, LOCALE)}</h1>

        {hasError && <ErrorState />}

        {!hasError && isLoading && <DashboardSkeleton />}

        {!hasError && !isLoading && !hasProfile && !hasCv && <EmptyState />}

        {!hasError && !isLoading && (hasProfile || hasCv) && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CvStatusCard profile={profile.data} hasCv={hasCv} />
            <CompletenessCard profile={profile.data} hasCv={hasCv} />
            <DiscoverabilityCard hasCv={hasCv} />
            <QuickActionsCard hasCv={hasCv} />
          </div>
        )}
      </main>
    </div>
  );
}

function DashboardHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-h3 font-bold text-primary">
          {t(appName, LOCALE)}
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">{t(dashboardStringsNav.navDashboard, LOCALE)}</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/chat">{t(dashboardStringsNav.navChat, LOCALE)}</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/cv">{t(dashboardStringsNav.navCv, LOCALE)}</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

// Local alias so the header doesn't repeat the full import path 4 times.
const dashboardStringsNav = s;

function formatLastActivity(profile: CandidateProfile | null): string | null {
  const lastActive = profile?.last_active;
  if (!lastActive) return null;

  let date: Date | null = null;
  if (lastActive instanceof Date) {
    date = lastActive;
  } else if (typeof lastActive === "string") {
    const parsed = new Date(lastActive);
    if (!Number.isNaN(parsed.getTime())) date = parsed;
  } else if (
    typeof lastActive === "object" &&
    lastActive !== null &&
    "toDate" in lastActive &&
    typeof (lastActive as { toDate: () => Date }).toDate === "function"
  ) {
    date = (lastActive as { toDate: () => Date }).toDate();
  }

  if (!date) return null;
  return new Intl.DateTimeFormat(LOCALE === "ar" ? "ar-SA" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function CvStatusCard({ profile, hasCv }: { profile: CandidateProfile | null; hasCv: boolean }) {
  const lastActivity = formatLastActivity(profile);
  const template = (profile?.cv_template ?? "classic") as CvTemplate;
  const theme = (profile?.cv_color_theme ?? "oxford") as CvColorTheme;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <FileText className="h-5 w-5 text-accent" aria-hidden />
        <CardTitle>{t(s.cvCardTitle, LOCALE)}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-body text-primary">
          {t(hasCv ? s.cvStatusReady : s.cvStatusMissing, LOCALE)}
        </p>

        {hasCv && (
          <p className="text-sm text-muted">
            {t(s.cvTemplateThemeSummary, LOCALE)
              .replace("{template}", t(cvTemplateLabels[template], LOCALE))
              .replace("{theme}", t(cvColorThemeLabels[theme], LOCALE))}
          </p>
        )}

        {hasCv && lastActivity && (
          <p className="font-tabular text-xs text-muted" style={{ fontVariantNumeric: "tabular-nums" }}>
            {t(s.cvLastUpdated, LOCALE)}: {lastActivity}
          </p>
        )}

        <div className="mt-2 flex flex-wrap gap-2">
          {hasCv ? (
            <Button variant="primary" size="sm" asChild>
              <Link href="/cv">{t(s.cvViewCta, LOCALE)}</Link>
            </Button>
          ) : (
            <Button variant="primary" size="sm" asChild>
              <Link href="/chat">{t(s.cvContinueChatCta, LOCALE)}</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function completenessBandDescription(score: number) {
  if (score >= 80) return s.completenessDescriptionHigh;
  if (score >= 50) return s.completenessDescriptionMid;
  return s.completenessDescriptionLow;
}

function CompletenessCard({
  profile,
  hasCv,
}: {
  profile: CandidateProfile | null;
  hasCv: boolean;
}) {
  // Fall back to a client-side computation when the stored value is 0/missing
  // (e.g. profile doc predates a completeness recompute, or hasn't been
  // written yet even though a CV already exists in the chat session).
  const storedScore = profile?.profile_completeness ?? 0;
  const score =
    storedScore > 0
      ? storedScore
      : computeProfileCompleteness({
          professional_summary: profile?.professional_summary,
          education: profile?.education,
          experience: profile?.experience,
          projects: profile?.projects,
          skills: profile?.skills,
          languages: profile?.languages,
          certifications: profile?.certifications,
          volunteer_work: profile?.volunteer_work,
          preferences: profile?.preferences,
          cv_generated: hasCv,
        });

  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;
  const ringColor = score >= 80 ? "text-accent" : score >= 50 ? "text-warning" : "text-danger";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <Gauge className="h-5 w-5 text-accent" aria-hidden />
        <CardTitle>{t(s.completenessCardTitle, LOCALE)}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-4">
          <svg
            width="88"
            height="88"
            viewBox="0 0 88 88"
            role="img"
            aria-label={`${t(s.completenessCardTitle, LOCALE)}: ${score}%`}
          >
            <circle cx="44" cy="44" r="40" strokeWidth="8" className="fill-none stroke-border/60" />
            <circle
              cx="44"
              cy="44"
              r="40"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 44 44)"
              className={`fill-none ${ringColor} transition-[stroke-dashoffset] duration-slow ease-out`}
              stroke="currentColor"
            />
          </svg>
          <span
            className="font-tabular text-h1 font-semibold text-primary"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {score}%
          </span>
        </div>
        <p className="text-sm text-muted">{t(completenessBandDescription(score), LOCALE)}</p>
      </CardContent>
    </Card>
  );
}

function DiscoverabilityCard({ hasCv }: { hasCv: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <Radar className="h-5 w-5 text-accent" aria-hidden />
        <CardTitle>{t(s.discoverabilityCardTitle, LOCALE)}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-body text-primary">
          {t(hasCv ? s.discoverabilityActive : s.discoverabilityInactive, LOCALE)}
        </p>
        {hasCv && <p className="text-sm text-muted">{t(s.discoverabilityNote, LOCALE)}</p>}
      </CardContent>
    </Card>
  );
}

function QuickActionsCard({ hasCv }: { hasCv: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <Sparkles className="h-5 w-5 text-accent" aria-hidden />
        <CardTitle>{t(s.quickActionsCardTitle, LOCALE)}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button variant="secondary" size="sm" asChild className="w-full sm:w-auto">
          <Link href="/chat">{t(s.actionUpdateCv, LOCALE)}</Link>
        </Button>
        <Button variant="secondary" size="sm" disabled={!hasCv} asChild={hasCv} className="w-full sm:w-auto">
          {hasCv ? <Link href="/cv">{t(s.actionDownloadPdf, LOCALE)}</Link> : <span>{t(s.actionDownloadPdf, LOCALE)}</span>}
        </Button>
        <Button variant="secondary" size="sm" disabled={!hasCv} asChild={hasCv} className="w-full sm:w-auto">
          {hasCv ? <Link href="/cv">{t(s.actionCustomize, LOCALE)}</Link> : <span>{t(s.actionCustomize, LOCALE)}</span>}
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="mx-auto max-w-[520px]">
      <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <Sparkles className="h-7 w-7 text-accent" aria-hidden />
        </div>
        <h2 className="text-h3 font-semibold text-primary">{t(s.emptyStateTitle, LOCALE)}</h2>
        <p className="text-body text-muted">{t(s.emptyStateBody, LOCALE)}</p>
        <Button variant="primary" size="md" asChild>
          <Link href="/chat">{t(s.emptyStateCta, LOCALE)}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function ErrorState() {
  return (
    <Card className="mx-auto max-w-[520px] border-s-2 border-s-danger">
      <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
        <h2 className="text-h3 font-semibold text-primary">{t(s.errorTitle, LOCALE)}</h2>
        <p className="text-body text-muted">{t(s.errorBody, LOCALE)}</p>
        <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
          {t(s.retry, LOCALE)}
        </Button>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-9 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
