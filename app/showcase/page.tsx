"use client";

import * as React from "react";
import { Info, Loader2, Search, Sparkles } from "lucide-react";

import { t, type Locale } from "@/lib/i18n";
import { dirFor } from "@/lib/i18n/dir";
import { appName, commonStrings } from "@/lib/i18n/strings/common";
import { showcaseStrings } from "@/lib/i18n/strings/showcase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

/**
 * /showcase — internal dev reference for the Light design system
 * (docs/design-system.md). Not a production user-facing route; still built
 * bilingual + RTL-audited since it exists to *demonstrate* that behavior.
 */
export default function ShowcasePage() {
  const [locale, setLocale] = React.useState<Locale>("ar");
  const dir = dirFor(locale);
  const s = showcaseStrings;
  const tr = (ls: (typeof s)[keyof typeof s]) => t(ls, locale);

  return (
    <div dir={dir} className="mx-auto max-w-[1200px] px-4 py-12">
      <header className="mb-12 flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-accent">{t(appName, locale)}</p>
          <h1 className="text-h1 font-bold text-primary">{tr(s.pageTitle)}</h1>
          <p className="mt-1 max-w-[640px] text-body text-muted">{tr(s.pageSubtitle)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">{tr(s.toggleLabel)}</span>
          <div className="inline-flex rounded-md border border-border bg-surface p-1">
            <button
              type="button"
              onClick={() => setLocale("ar")}
              className={`rounded-sm px-3 py-1 text-sm font-medium transition-colors ${
                locale === "ar" ? "bg-bg text-primary shadow-e1" : "text-muted"
              }`}
            >
              عربي
            </button>
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`rounded-sm px-3 py-1 text-sm font-medium transition-colors ${
                locale === "en" ? "bg-bg text-primary shadow-e1" : "text-muted"
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-16">
        <ColorSection title={tr(s.sectionColors)} />
        <TypeSection title={tr(s.sectionType)} locale={locale} />
        <SpacingSection title={tr(s.sectionSpacing)} />
        <ButtonSection title={tr(s.sectionButtons)} locale={locale} />
        <InputSection title={tr(s.sectionInputs)} locale={locale} />
        <BadgeSection title={tr(s.sectionBadges)} locale={locale} />
        <CardSection title={tr(s.sectionCards)} locale={locale} />
        <TabsSection title={tr(s.sectionTabs)} locale={locale} />
        <DialogSection title={tr(s.sectionDialog)} locale={locale} />
        <DropdownSection title={tr(s.sectionDropdown)} locale={locale} />
        <ToastSection title={tr(s.sectionToast)} locale={locale} />
        <SkeletonSection title={tr(s.sectionSkeleton)} />
        <StatesSection title={tr(s.sectionStates)} locale={locale} />
      </div>
    </div>
  );
}

function SectionShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-h2 font-semibold text-primary">{title}</h2>
      {children}
    </section>
  );
}

function ColorSection({ title }: { title: string }) {
  const swatches: Array<{ name: string; className: string; textClassName?: string }> = [
    { name: "primary (Oxford Blue)", className: "bg-primary", textClassName: "text-white" },
    { name: "accent (Jungle Green)", className: "bg-accent", textClassName: "text-white" },
    { name: "warning (Brand Orange)", className: "bg-warning", textClassName: "text-primary" },
    { name: "danger (Fire Red)", className: "bg-danger", textClassName: "text-white" },
    { name: "border (Platinum)", className: "bg-border", textClassName: "text-primary" },
    { name: "surface", className: "bg-surface border border-border", textClassName: "text-primary" },
    { name: "bg", className: "bg-bg border border-border", textClassName: "text-primary" },
    { name: "muted", className: "bg-muted", textClassName: "text-white" },
  ];

  return (
    <SectionShell title={title}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {swatches.map((sw) => (
          <div key={sw.name} className="overflow-hidden rounded-lg border border-border">
            <div className={`flex h-20 items-end p-2 ${sw.className}`}>
              <span className={`text-xs font-medium ${sw.textClassName ?? ""}`}>{sw.name}</span>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function TypeSection({ title, locale }: { title: string; locale: Locale }) {
  const sample = locale === "ar" ? "لايت يبني سيرتك الذاتية" : "Light builds your CV";
  const rows: Array<{ label: string; className: string }> = [
    { label: "display 40/1.25", className: "text-display font-bold" },
    { label: "h1 30/1.3", className: "text-h1 font-bold" },
    { label: "h2 24/1.35", className: "text-h2 font-semibold" },
    { label: "h3 20/1.4", className: "text-h3 font-semibold" },
    { label: "body-lg 18/1.7", className: "text-body-lg" },
    { label: "body 16/1.7", className: "text-body" },
    { label: "sm 14/1.6", className: "text-sm" },
    { label: "xs 12/1.5", className: "text-xs" },
  ];

  return (
    <SectionShell title={title}>
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1 border-b border-border pb-3">
            <span className="text-xs text-muted">{row.label}</span>
            <span className={`${row.className} text-primary`}>{sample}</span>
          </div>
        ))}
        <div className="flex flex-col gap-1 pb-3">
          <span className="text-xs text-muted">tabular (Readex Pro)</span>
          {/*
           * Bidi note: two numeral runs (Arabic-Indic + Western) separated by
           * "/" inside an RTL container can reorder unpredictably — numerals
           * are a weak-directionality run. Isolate each with <bdi> so they
           * render left-to-right internally regardless of surrounding
           * context (rtl-component skill §7).
           */}
          <span className="font-tabular text-h3 tabular-nums text-primary">
            <bdi>١٢٣٤٥</bdi> / <bdi>12345</bdi>
          </span>
        </div>
      </div>
    </SectionShell>
  );
}

function SpacingSection({ title }: { title: string }) {
  const steps: Array<{ token: string; px: string }> = [
    { token: "1", px: "4px" },
    { token: "2", px: "8px" },
    { token: "3", px: "12px" },
    { token: "4", px: "16px" },
    { token: "6", px: "24px" },
    { token: "8", px: "32px" },
    { token: "12", px: "48px" },
    { token: "16", px: "64px" },
  ];

  return (
    <SectionShell title={title}>
      <div className="flex flex-col gap-2">
        {steps.map((step) => (
          <div key={step.token} className="flex items-center gap-3">
            <span className="w-16 text-xs text-muted">
              {step.token} · {step.px}
            </span>
            <div className="h-4 bg-accent" style={{ width: step.px }} />
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function ButtonSection({ title, locale }: { title: string; locale: Locale }) {
  const s = showcaseStrings;
  const tr = (ls: (typeof s)[keyof typeof s]) => t(ls, locale);

  return (
    <SectionShell title={title}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" size="sm">
            {tr(s.samplePrimary)}
          </Button>
          <Button variant="primary" size="md">
            {tr(s.samplePrimary)}
          </Button>
          <Button variant="primary" size="lg">
            {tr(s.samplePrimary)}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary">{tr(s.sampleSecondary)}</Button>
          <Button variant="ghost">{tr(s.sampleGhost)}</Button>
          <Button variant="danger">{tr(s.sampleDanger)}</Button>
          <Button variant="primary" disabled>
            {tr(s.sampleDisabled)}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">
            <Sparkles className="h-4 w-4" />
            {tr(s.samplePrimary)}
          </Button>
          <Button variant="secondary">
            <Search className="h-4 w-4" />
            {tr(s.sampleSecondary)}
          </Button>
        </div>
      </div>
    </SectionShell>
  );
}

function InputSection({ title, locale }: { title: string; locale: Locale }) {
  const s = showcaseStrings;
  const tr = (ls: (typeof s)[keyof typeof s]) => t(ls, locale);

  return (
    <SectionShell title={title}>
      <div className="grid max-w-xl gap-6">
        <div className="grid gap-1.5">
          <Label htmlFor="showcase-name">{tr(s.labelFullName)}</Label>
          <Input id="showcase-name" placeholder={tr(s.placeholderFullName)} />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="showcase-name-invalid">{tr(s.labelFullName)}</Label>
          <Input id="showcase-name-invalid" placeholder={tr(s.placeholderFullName)} invalid />
          <span className="text-xs text-danger">{tr(s.errorRequired)}</span>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="showcase-city">{tr(s.labelCity)}</Label>
          <Select dir={locale === "ar" ? "rtl" : "ltr"}>
            <SelectTrigger id="showcase-city">
              <SelectValue placeholder={tr(s.placeholderCitySelect)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="riyadh">{tr(s.cityRiyadh)}</SelectItem>
              <SelectItem value="jeddah">{tr(s.cityJeddah)}</SelectItem>
              <SelectItem value="dammam">{tr(s.cityDammam)}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="showcase-bio">{tr(s.labelBio)}</Label>
          <Textarea id="showcase-bio" placeholder={tr(s.placeholderBio)} />
        </div>
      </div>
    </SectionShell>
  );
}

function BadgeSection({ title, locale }: { title: string; locale: Locale }) {
  const s = showcaseStrings;
  const tr = (ls: (typeof s)[keyof typeof s]) => t(ls, locale);

  return (
    <SectionShell title={title}>
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="success">{tr(s.badgeSuccess)}</Badge>
        <Badge variant="warning">{tr(s.badgeWarning)}</Badge>
        <Badge variant="error">{tr(s.badgeError)}</Badge>
        <Badge variant="info">{tr(s.badgeInfo)}</Badge>
        <Badge variant="neutral">{tr(s.badgeNeutral)}</Badge>
        <Badge variant="success" size="xs">
          <Sparkles className="h-3 w-3" />
          {tr(s.badgeAi)}
        </Badge>
      </div>
    </SectionShell>
  );
}

function CardSection({ title, locale }: { title: string; locale: Locale }) {
  const s = showcaseStrings;
  const tr = (ls: (typeof s)[keyof typeof s]) => t(ls, locale);

  return (
    <SectionShell title={title}>
      <div className="grid max-w-md gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{tr(s.cardTitle)}</CardTitle>
            <CardDescription>{tr(s.cardDescription)}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-body text-primary">{tr(s.cardBody)}</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm">
              {t(commonStrings.cancel, locale)}
            </Button>
            <Button variant="primary" size="sm">
              {t(commonStrings.save, locale)}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </SectionShell>
  );
}

function TabsSection({ title, locale }: { title: string; locale: Locale }) {
  const s = showcaseStrings;
  const tr = (ls: (typeof s)[keyof typeof s]) => t(ls, locale);

  return (
    <SectionShell title={title}>
      <Tabs defaultValue="profile" dir={locale === "ar" ? "rtl" : "ltr"} className="max-w-md">
        <TabsList>
          <TabsTrigger value="profile">{tr(s.tabProfile)}</TabsTrigger>
          <TabsTrigger value="cv">{tr(s.tabCv)}</TabsTrigger>
          <TabsTrigger value="settings">{tr(s.tabSettings)}</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="text-body text-primary">
          {tr(s.tabProfileBody)}
        </TabsContent>
        <TabsContent value="cv" className="text-body text-primary">
          {tr(s.tabCvBody)}
        </TabsContent>
        <TabsContent value="settings" className="text-body text-primary">
          {tr(s.tabSettingsBody)}
        </TabsContent>
      </Tabs>
    </SectionShell>
  );
}

function DialogSection({ title, locale }: { title: string; locale: Locale }) {
  const s = showcaseStrings;
  const tr = (ls: (typeof s)[keyof typeof s]) => t(ls, locale);

  return (
    <SectionShell title={title}>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary">{tr(s.dialogTrigger)}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tr(s.dialogTitle)}</DialogTitle>
            <DialogDescription>{tr(s.dialogDescription)}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">{t(commonStrings.cancel, locale)}</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="primary">{tr(s.dialogConfirm)}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionShell>
  );
}

function DropdownSection({ title, locale }: { title: string; locale: Locale }) {
  const s = showcaseStrings;
  const tr = (ls: (typeof s)[keyof typeof s]) => t(ls, locale);

  return (
    <SectionShell title={title}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">{tr(s.dropdownTrigger)}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{tr(s.dropdownLabel)}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>{tr(s.dropdownProfile)}</DropdownMenuItem>
          <DropdownMenuItem>{tr(s.dropdownSettings)}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-danger focus:bg-danger/10 focus:text-danger">
            {tr(s.dropdownLogout)}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SectionShell>
  );
}

function ToastSection({ title, locale }: { title: string; locale: Locale }) {
  const s = showcaseStrings;
  const tr = (ls: (typeof s)[keyof typeof s]) => t(ls, locale);
  const { toast } = useToast();

  return (
    <SectionShell title={title}>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="primary"
          onClick={() =>
            toast({
              variant: "success",
              title: tr(s.toastSuccessTitle),
              description: tr(s.toastSuccessDescription),
            })
          }
        >
          {tr(s.toastTrigger)}
        </Button>
        <Button
          variant="danger"
          onClick={() =>
            toast({
              variant: "destructive",
              title: tr(s.toastErrorTitle),
              description: tr(s.toastErrorDescription),
            })
          }
        >
          {tr(s.toastTrigger)}
        </Button>
      </div>
    </SectionShell>
  );
}

function SkeletonSection({ title }: { title: string }) {
  return (
    <SectionShell title={title}>
      <Card className="max-w-md">
        <CardHeader>
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    </SectionShell>
  );
}

function StatesSection({ title, locale }: { title: string; locale: Locale }) {
  const s = showcaseStrings;
  const tr = (ls: (typeof s)[keyof typeof s]) => t(ls, locale);

  return (
    <SectionShell title={title}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex flex-col items-center gap-3 p-6 text-center">
          <Sparkles className="h-8 w-8 text-accent" />
          <p className="text-sm font-semibold text-primary">{tr(s.emptyStateTitle)}</p>
          <p className="text-xs text-muted">{tr(s.emptyStateBody)}</p>
          <Button variant="primary" size="sm">
            {tr(s.emptyStateCta)}
          </Button>
        </Card>

        <Card className="flex flex-col items-center justify-center gap-3 p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-sm font-semibold text-primary">{t(commonStrings.loading, locale)}</p>
        </Card>

        <Card className="flex flex-col items-center gap-3 border-danger/30 p-6 text-center">
          <Info className="h-8 w-8 text-danger" />
          <p className="text-sm font-semibold text-primary">{tr(s.errorStateTitle)}</p>
          <p className="text-xs text-muted">{tr(s.errorStateBody)}</p>
          <Button variant="secondary" size="sm">
            {t(commonStrings.retry, locale)}
          </Button>
        </Card>
      </div>
    </SectionShell>
  );
}
