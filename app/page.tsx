import Link from "next/link";
import { MessageCircle, Sparkles, Globe2 } from "lucide-react";

import { t } from "@/lib/i18n";
import { appName } from "@/lib/i18n/strings/common";
import { landingStrings as s } from "@/lib/i18n/strings/landing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Landing page (PRD §6.1, §10.4; docs/design-system.md §10).
 *
 * Static, server-rendered — no data fetching, so no empty/loading/error
 * states are needed here (that requirement applies to list/async surfaces).
 * Arabic is the displayed locale (site is ar/RTL by default per CLAUDE.md
 * §3.2); every string still carries its `en` counterpart via lib/i18n.
 */
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <TrustStrip />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 sm:px-6">
        <span className="text-h3 font-bold text-primary">{t(appName, "ar")}</span>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/register">{t(s.navForSeekers, "ar")}</Link>
          </Button>
          <span
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted"
            title={t(s.comingSoonTooltip, "ar")}
            aria-disabled="true"
          >
            {t(s.navForEmployers, "ar")}
            <Badge variant="neutral" size="xs">
              {t(s.comingSoonBadge, "ar")}
            </Badge>
          </span>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Copy side (end side in RTL — reading starts here) */}
        <div className="flex flex-col items-start gap-6 text-start">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            {t(s.heroEyebrow, "ar")}
          </span>

          <h1 className="text-display font-bold leading-tight text-primary">
            {t(s.heroHeadline, "ar")}
          </h1>

          <p className="max-w-[560px] text-body-lg text-muted">{t(s.heroSubcopy, "ar")}</p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button variant="primary" size="lg" asChild>
              <Link href="/register">{t(s.ctaSeekersPrimary, "ar")}</Link>
            </Button>
            <div className="relative">
              <Button
                variant="secondary"
                size="lg"
                disabled
                title={t(s.comingSoonTooltip, "ar")}
                aria-disabled="true"
                className="w-full sm:w-auto"
              >
                {t(s.ctaEmployersSecondary, "ar")}
              </Button>
              <Badge
                variant="warning"
                size="xs"
                className="absolute -top-2 end-2 shadow-e1"
              >
                {t(s.comingSoonBadge, "ar")}
              </Badge>
            </div>
          </div>
        </div>

        {/* Product mockup side (start side in RTL) */}
        <div className="order-first lg:order-last">
          <ChatPreviewMockup />
        </div>
      </div>
    </section>
  );
}

/**
 * Lightweight, stylized chat-preview mockup built from existing primitives —
 * no raster images or external assets. Shows an AI turn + a user turn per the
 * chat convention (AI bubble on the right, user bubble on the left,
 * docs/design-system.md §6), followed by a generating CvCard skeleton.
 */
function ChatPreviewMockup() {
  return (
    <Card className="mx-auto max-w-[440px] p-4 sm:p-6" aria-hidden="true">
      <CardContent className="flex flex-col gap-4 p-0">
        {/* AI message — bubbles on the right (start side in RTL) */}
        <div className="flex items-start justify-start gap-2">
          <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="rounded-lg rounded-ss-sm border-s-2 border-accent bg-bg px-4 py-3 shadow-e1">
            <p className="text-sm text-primary">{t(s.mockupAiMessage, "ar")}</p>
          </div>
        </div>

        {/* User message — bubbles on the left (end side in RTL) */}
        <div className="flex items-start justify-end">
          <div className="max-w-[85%] rounded-lg rounded-ee-sm bg-primary/90 px-4 py-3 text-white">
            <p className="text-sm">{t(s.mockupUserMessage, "ar")}</p>
          </div>
        </div>

        {/* Inline CvCard preview, generating state */}
        <div className="mt-2 rounded-lg border border-border bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <Badge variant="success" size="xs">
              <Sparkles className="h-3 w-3" />
              {t(s.mockupCvBadge, "ar")}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 flex-col gap-2">
              <p className="text-sm font-semibold text-primary">{t(s.mockupCvName, "ar")}</p>
              <p className="text-xs text-muted">{t(s.mockupCvRole, "ar")}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TrustStrip() {
  const items: Array<{
    icon: React.ReactNode;
    title: (typeof s)[keyof typeof s];
    body: (typeof s)[keyof typeof s];
  }> = [
    {
      icon: <MessageCircle className="h-5 w-5" />,
      title: s.trustConversationalTitle,
      body: s.trustConversationalBody,
    },
    {
      icon: <Globe2 className="h-5 w-5" />,
      title: s.trustBilingualTitle,
      body: s.trustBilingualBody,
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: s.trustPassiveTitle,
      body: s.trustPassiveBody,
    },
  ];

  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-[1200px] gap-6 px-4 py-12 sm:grid-cols-3 sm:px-6 sm:py-16">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col items-start gap-3 text-start">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
              {item.icon}
            </span>
            <h3 className="text-h3 font-semibold text-primary">{t(item.title, "ar")}</h3>
            <p className="text-sm text-muted">{t(item.body, "ar")}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 py-8 text-start sm:px-6">
        <span className="text-sm font-semibold text-primary">{t(appName, "ar")}</span>
        <p className="text-xs text-muted">{t(s.footerTagline, "ar")}</p>
        <p className="text-xs text-muted">{t(s.footerPrivacyNote, "ar")}</p>
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} {t(appName, "ar")} — {t(s.footerRights, "ar")}
        </p>
      </div>
    </footer>
  );
}
