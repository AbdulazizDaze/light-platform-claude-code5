import Link from "next/link";
import {
  Sparkles,
  Globe2,
  Radar,
  Zap,
  MessageSquareText,
  FileCheck2,
  Radio,
  PhoneCall,
  ArrowUpLeft,
} from "lucide-react";

import { t } from "@/lib/i18n";
import { appName } from "@/lib/i18n/strings/common";
import { landingStrings as s } from "@/lib/i18n/strings/landing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";
import { ChatDemo } from "@/components/landing/chat-demo";
import { RevealOnView } from "@/components/landing/reveal-on-view";

/**
 * Landing page — v3 screen redesign (PRD §9, docs/design-system.md §10).
 * Full dark-navy page: sticky nav, hero with self-typing chat demo, problem
 * section, alternating journey steps, trust strip, final CTA band, footer.
 *
 * Static, server-rendered — no data fetching, so no empty/loading/error
 * states are needed here (that requirement applies to list/async surfaces).
 * Arabic is the displayed locale (site is ar/RTL by default per CLAUDE.md
 * §3.2); every string still carries its `en` counterpart via lib/i18n.
 */
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-primary">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <ProblemSection />
        <JourneySection />
        <TrustStrip />
        <FinalCtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-primary/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 sm:px-6">
        <Logo lang="ar" size="sm" onDark />
        <nav className="hidden items-center gap-1 md:flex">
          <a
            href="#seekers"
            className="rounded-md px-3 py-2 text-sm font-medium text-white/80 transition-colors duration-fast hover:bg-white/10 hover:text-white"
          >
            {t(s.navForSeekers, "ar")}
          </a>
          <span
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-white/40"
            title={t(s.comingSoonTooltip, "ar")}
            aria-disabled="true"
          >
            {t(s.navForEmployers, "ar")}
            <Badge variant="warning" size="xs">
              {t(s.comingSoonBadge, "ar")}
            </Badge>
          </span>
          <a
            href="#features"
            className="rounded-md px-3 py-2 text-sm font-medium text-white/80 transition-colors duration-fast hover:bg-white/10 hover:text-white"
          >
            {t(s.navFeatures, "ar")}
          </a>
          <a
            href="#contact"
            className="rounded-md px-3 py-2 text-sm font-medium text-white/80 transition-colors duration-fast hover:bg-white/10 hover:text-white"
          >
            {t(s.navContact, "ar")}
          </a>
        </nav>
        <Button variant="primary" size="sm" asChild>
          <Link href="/register">{t(s.navCtaStart, "ar")}</Link>
        </Button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section
      id="seekers"
      className="relative overflow-hidden bg-gradient-to-b from-primary to-primary-deep"
    >
      {/* Subtle dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Copy side (end side in RTL — reading starts here) */}
          <div className="flex flex-col items-start gap-6 text-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              {t(s.heroBadge, "ar")}
            </span>

            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
              <span className="block text-white">{t(s.heroHeadlineLine1, "ar")}</span>
              <span className="block text-accent">{t(s.heroHeadlineLine2, "ar")}</span>
            </h1>

            <p className="max-w-[560px] text-body-lg text-white/70">{t(s.heroSubcopy, "ar")}</p>

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
                  className="w-full border-white/30 !bg-transparent !text-white hover:!bg-white/10 disabled:!bg-transparent disabled:!text-white/50 sm:w-auto"
                >
                  {t(s.ctaEmployersSecondary, "ar")}
                </Button>
                <Badge variant="warning" size="xs" className="absolute -top-2 end-2 shadow-e1">
                  {t(s.comingSoonBadge, "ar")}
                </Badge>
              </div>
            </div>
          </div>

          {/* Self-typing chat demo (start side in RTL) */}
          <div className="order-first lg:order-last">
            <ChatDemo locale="ar" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="bg-primary-deep py-16 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <h2 className="mb-10 text-center text-h1 font-bold text-white sm:mb-14">
          {t(s.problemHeading, "ar")}
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          <RevealOnView>
            <div className="h-full rounded-lg border border-white/10 bg-white/5 p-6 sm:p-8">
              <h3 className="mb-3 text-h3 font-semibold text-white">
                {t(s.problemSeekersTitle, "ar")}
              </h3>
              <p className="mb-4 text-body text-white/70">{t(s.problemSeekersBody, "ar")}</p>
              <ul className="flex flex-col gap-2">
                <li className="flex items-start gap-2 text-sm text-white/70">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                  {t(s.problemSeekersBullet1, "ar")}
                </li>
                <li className="flex items-start gap-2 text-sm text-white/70">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                  {t(s.problemSeekersBullet2, "ar")}
                </li>
              </ul>
            </div>
          </RevealOnView>

          <RevealOnView delayMs={100}>
            <div className="h-full rounded-lg border border-white/10 bg-white/5 p-6 sm:p-8">
              <h3 className="mb-3 text-h3 font-semibold text-white">
                {t(s.problemEmployersTitle, "ar")}
              </h3>
              <p className="mb-4 text-body text-white/70">{t(s.problemEmployersBody, "ar")}</p>
              <ul className="flex flex-col gap-2">
                <li className="flex items-start gap-2 text-sm text-white/70">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {t(s.problemEmployersBullet1, "ar")}
                </li>
                <li className="flex items-start gap-2 text-sm text-white/70">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {t(s.problemEmployersBullet2, "ar")}
                </li>
              </ul>
            </div>
          </RevealOnView>
        </div>
      </div>
    </section>
  );
}

interface JourneyStep {
  icon: React.ReactNode;
  title: { en: string; ar: string };
  body: { en: string; ar: string };
}

function JourneySection() {
  const steps: JourneyStep[] = [
    { icon: <MessageSquareText className="h-6 w-6" />, title: s.journeyStep1Title, body: s.journeyStep1Body },
    { icon: <FileCheck2 className="h-6 w-6" />, title: s.journeyStep2Title, body: s.journeyStep2Body },
    { icon: <Radio className="h-6 w-6" />, title: s.journeyStep3Title, body: s.journeyStep3Body },
    { icon: <PhoneCall className="h-6 w-6" />, title: s.journeyStep4Title, body: s.journeyStep4Body },
  ];

  return (
    <section id="features" className="bg-primary py-16 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wide text-accent">
            {t(s.journeyEyebrow, "ar")}
          </span>
          <h2 className="text-h1 font-bold sm:text-4xl">
            <span className="block text-white">{t(s.journeyHeadlineLine1, "ar")}</span>
            <span className="block text-white/50">{t(s.journeyHeadlineLine2, "ar")}</span>
          </h2>
        </div>

        <div className="flex flex-col gap-12 sm:gap-16">
          {steps.map((step, i) => (
            <RevealOnView key={i} delayMs={i * 80}>
              <div
                className={cnRow(i)}
              >
                <div className="flex-1 text-start">
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
                    {step.icon}
                  </span>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mb-2 text-h2 font-semibold text-white">{t(step.title, "ar")}</h3>
                  <p className="max-w-[440px] text-body text-white/70">{t(step.body, "ar")}</p>
                </div>
                <div className="flex-1">
                  <JourneyVisual index={i} />
                </div>
              </div>
            </RevealOnView>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Alternate the text/visual sides per row for visual rhythm. Logical-safe: uses flex-row-reverse toggled by index, no physical left/right. */
function cnRow(index: number): string {
  const base = "flex flex-col items-center gap-8 sm:gap-12 md:flex-row";
  return index % 2 === 1 ? `${base} md:flex-row-reverse` : base;
}

/** Simple abstract visual built from primitives (logomark arrow motif) — no images. */
function JourneyVisual({ index }: { index: number }) {
  return (
    <div className="relative flex h-40 w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] sm:h-48">
      <div className="absolute -inset-4 rounded-xl bg-accent/10 blur-2xl" aria-hidden="true" />
      <ArrowUpLeft
        className="relative h-16 w-16 text-accent/70 rtl:-scale-x-100"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <span className="absolute bottom-3 end-3 text-xs font-medium text-white/30">
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>
  );
}

function TrustStrip() {
  const items: Array<{ icon: React.ReactNode; title: { en: string; ar: string }; body: { en: string; ar: string } }> = [
    { icon: <Globe2 className="h-5 w-5" />, title: s.trustBilingualTitle, body: s.trustBilingualBody },
    { icon: <Zap className="h-5 w-5" />, title: s.trustMatchingTitle, body: s.trustMatchingBody },
    { icon: <Radar className="h-5 w-5" />, title: s.trustRealtimeTitle, body: s.trustRealtimeBody },
  ];

  return (
    <section className="border-t border-white/10 bg-primary-deep">
      <div className="mx-auto grid max-w-[1200px] gap-6 px-4 py-12 sm:grid-cols-3 sm:px-6 sm:py-16">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col items-start gap-3 text-start">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent">
              {item.icon}
            </span>
            <h3 className="text-h3 font-semibold text-white">{t(item.title, "ar")}</h3>
            <p className="text-sm text-white/60">{t(item.body, "ar")}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCtaBand() {
  return (
    <section id="contact" className="bg-primary-deep py-16 sm:py-20">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-4 text-center sm:px-6">
        <h2 className="max-w-[640px] text-h1 font-bold text-white sm:text-4xl">
          {t(s.finalCtaHeadline, "ar")}
        </h2>
        <Button variant="primary" size="lg" asChild>
          <Link href="/register">{t(s.finalCtaButton, "ar")}</Link>
        </Button>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-primary-deep">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-8 text-start sm:px-6">
        <Logo lang="ar" size="sm" onDark />
        <p className="text-xs text-white/50">{t(s.footerTagline, "ar")}</p>
        <p className="text-xs text-white/50">{t(s.footerPrivacyNote, "ar")}</p>
        <p className="text-xs text-white/50">
          © {new Date().getFullYear()} {t(appName, "ar")} — {t(s.footerRights, "ar")}
        </p>
      </div>
    </footer>
  );
}
