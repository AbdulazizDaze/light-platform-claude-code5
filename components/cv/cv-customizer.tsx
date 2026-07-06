"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";

import { t, type Locale } from "@/lib/i18n";
import { cvStrings } from "@/lib/i18n/strings/cv";
import type { CandidateProfile } from "@/lib/schemas/profile";
import {
  CV_THEME_IDS,
  CV_THEMES,
  isValidHex,
  PLATINUM_BORDER,
  type CvColorTheme,
  type CvTemplate,
} from "@/lib/cv/themes";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface CvCustomizerValue {
  template: CvTemplate;
  theme: CvColorTheme;
  customColors: { primary: string; accent: string };
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface CvCustomizerProps {
  profile: CandidateProfile;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  value: CvCustomizerValue;
  onChange: (next: CvCustomizerValue) => void;
  saveStatus: SaveStatus;
  onDownload: () => void;
  isDownloading: boolean;
  className?: string;
}

const TEMPLATES: CvTemplate[] = ["classic", "modern", "executive", "minimal"];

const TEMPLATE_LABEL_KEYS: Record<CvTemplate, { label: keyof typeof cvStrings; desc: keyof typeof cvStrings }> = {
  classic: { label: "templateClassic", desc: "templateClassicDesc" },
  modern: { label: "templateModern", desc: "templateModernDesc" },
  executive: { label: "templateExecutive", desc: "templateExecutiveDesc" },
  minimal: { label: "templateMinimal", desc: "templateMinimalDesc" },
};

const THEME_LABEL_KEYS: Record<Exclude<CvColorTheme, "custom">, keyof typeof cvStrings> = {
  oxford: "themeOxford",
  jungle: "themeJungle",
  orange: "themeOrange",
  slate: "themeSlate",
  burgundy: "themeBurgundy",
  teal: "themeTeal",
};

/**
 * CV customization controls (docs/design-system.md §10): template picker (4
 * mini-layout thumbnails), 6 theme swatches + custom option, AR/EN segmented
 * toggle, Download PDF action. Purely presentational/controlled — the parent
 * page (`app/cv/page.tsx`) owns persistence (debounced Firestore writes) and
 * the download flow (authedFetch to `/api/pdf`).
 */
export function CvCustomizer({
  profile,
  locale,
  onLocaleChange,
  value,
  onChange,
  saveStatus,
  onDownload,
  isDownloading,
  className,
}: CvCustomizerProps) {
  const tr = (key: keyof typeof cvStrings) => t(cvStrings[key], locale);
  const isCustom = value.theme === "custom";

  const [customErrors, setCustomErrors] = React.useState<{ primary?: string; accent?: string }>({});

  const handleCustomColorChange = (field: "primary" | "accent", raw: string) => {
    const next = { ...value.customColors, [field]: raw };
    onChange({ ...value, customColors: next });

    if (raw.length === 0 || isValidHex(raw)) {
      setCustomErrors((prev) => ({ ...prev, [field]: undefined }));
    } else {
      setCustomErrors((prev) => ({ ...prev, [field]: tr("customColorInvalid") }));
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* AR/EN toggle */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-h3 font-semibold text-primary">{tr("controlsHeading")}</h2>
        <Tabs value={locale} onValueChange={(v) => onLocaleChange(v as Locale)}>
          <TabsList className="h-9 p-0.5">
            <TabsTrigger value="ar" className="min-w-0 px-3 py-1 text-xs">
              {tr("toggleAr")}
            </TabsTrigger>
            <TabsTrigger value="en" className="min-w-0 px-3 py-1 text-xs">
              {tr("toggleEn")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Template picker */}
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-primary">{tr("templateLabel")}</legend>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((tpl) => (
            <TemplateThumb
              key={tpl}
              template={tpl}
              selected={value.template === tpl}
              label={tr(TEMPLATE_LABEL_KEYS[tpl].label)}
              description={tr(TEMPLATE_LABEL_KEYS[tpl].desc)}
              onSelect={() => onChange({ ...value, template: tpl })}
            />
          ))}
        </div>
      </fieldset>

      {/* Theme swatches */}
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-primary">{tr("themeLabel")}</legend>
        <div className="flex flex-wrap gap-3" role="radiogroup" aria-label={tr("themeLabel")}>
          {CV_THEME_IDS.map((themeId) => (
            <ThemeSwatch
              key={themeId}
              selected={value.theme === themeId}
              colors={CV_THEMES[themeId]}
              label={tr(THEME_LABEL_KEYS[themeId])}
              onSelect={() => onChange({ ...value, theme: themeId })}
            />
          ))}
          <CustomSwatchButton
            selected={isCustom}
            label={tr("themeCustom")}
            primary={value.customColors.primary}
            accent={value.customColors.accent}
            onSelect={() => onChange({ ...value, theme: "custom" })}
          />
        </div>

        {isCustom && (
          <div className="grid grid-cols-1 gap-3 rounded-md border border-border bg-surface p-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="cv-custom-primary">{tr("customPrimaryLabel")}</Label>
              <div className="flex items-center gap-2">
                <span
                  className="h-6 w-6 shrink-0 rounded-full border border-border"
                  style={{ backgroundColor: isValidHex(value.customColors.primary) ? value.customColors.primary : "transparent" }}
                  aria-hidden
                />
                <Input
                  id="cv-custom-primary"
                  value={value.customColors.primary}
                  onChange={(e) => handleCustomColorChange("primary", e.target.value)}
                  placeholder={CV_THEMES.oxford.primary}
                  invalid={!!customErrors.primary}
                  className="font-tabular"
                  dir="ltr"
                  maxLength={7}
                />
              </div>
              {customErrors.primary && (
                <p className="text-xs text-danger">{customErrors.primary}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="cv-custom-accent">{tr("customAccentLabel")}</Label>
              <div className="flex items-center gap-2">
                <span
                  className="h-6 w-6 shrink-0 rounded-full border border-border"
                  style={{ backgroundColor: isValidHex(value.customColors.accent) ? value.customColors.accent : "transparent" }}
                  aria-hidden
                />
                <Input
                  id="cv-custom-accent"
                  value={value.customColors.accent}
                  onChange={(e) => handleCustomColorChange("accent", e.target.value)}
                  placeholder={CV_THEMES.oxford.accent}
                  invalid={!!customErrors.accent}
                  className="font-tabular"
                  dir="ltr"
                  maxLength={7}
                />
              </div>
              {customErrors.accent && (
                <p className="text-xs text-danger">{customErrors.accent}</p>
              )}
            </div>
          </div>
        )}
      </fieldset>

      <SaveStatusIndicator status={saveStatus} locale={locale} />

      {/* Download action (bottom on desktop; page wires a sticky mobile bar separately) */}
      <Button
        type="button"
        variant="primary"
        size="lg"
        className="hidden w-full sm:inline-flex"
        onClick={onDownload}
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
  );
}

function SaveStatusIndicator({ status, locale }: { status: SaveStatus; locale: Locale }) {
  if (status === "idle") return null;
  const tr = (key: keyof typeof cvStrings) => t(cvStrings[key], locale);

  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-xs",
        status === "error" ? "text-danger" : "text-muted"
      )}
      role="status"
      aria-live="polite"
    >
      {status === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
      {status === "saved" && <Check className="h-3.5 w-3.5 text-accent" aria-hidden />}
      {status === "saving" && tr("savingLabel")}
      {status === "saved" && tr("savedLabel")}
      {status === "error" && tr("saveErrorBody")}
    </p>
  );
}

/* ---------------------------------------------------------------------- */
/* Template mini-layout thumbnails — drawn with divs, no images           */
/* ---------------------------------------------------------------------- */

function TemplateThumb({
  template,
  selected,
  label,
  description,
  onSelect,
}: {
  template: CvTemplate;
  selected: boolean;
  label: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex flex-col gap-2 rounded-md border p-2 text-start transition-colors duration-fast",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "border-accent bg-accent/5" : "border-border hover:border-primary/30"
      )}
    >
      <TemplateGlyph template={template} />
      <div>
        <p className="text-xs font-semibold text-primary">{label}</p>
        <p className="text-[11px] text-muted">{description}</p>
      </div>
    </button>
  );
}

/** Small div-drawn glyph approximating each of the four layouts. */
function TemplateGlyph({ template }: { template: CvTemplate }) {
  const base = "h-14 w-full rounded-sm border border-border bg-white overflow-hidden flex";

  if (template === "classic") {
    return (
      <div className={cn(base, "flex-col items-center gap-1 p-2")}>
        <div className="h-1.5 w-8 rounded-full bg-primary/70" />
        <div className="h-1 w-10 rounded-full bg-border" />
        <div className="mt-1 h-px w-full bg-border" />
        <div className="h-1 w-full rounded-full bg-border" />
        <div className="h-1 w-3/4 rounded-full bg-border" />
      </div>
    );
  }
  if (template === "modern") {
    return (
      <div className={base}>
        <div className="flex w-1/3 flex-col gap-1 bg-primary/80 p-1.5">
          <div className="h-1 w-full rounded-full bg-white/70" />
          <div className="h-1 w-2/3 rounded-full bg-white/50" />
        </div>
        <div className="flex flex-1 flex-col gap-1 p-1.5">
          <div className="h-1 w-full rounded-full bg-border" />
          <div className="h-1 w-3/4 rounded-full bg-border" />
        </div>
      </div>
    );
  }
  if (template === "executive") {
    return (
      <div className={cn(base, "flex-col")}>
        <div className="h-3 w-full bg-primary/80" />
        <div className="flex flex-1 gap-1 p-1.5">
          <div className="flex-1 space-y-1">
            <div className="h-1 w-full rounded-full bg-border" />
            <div className="h-1 w-2/3 rounded-full bg-border" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="h-1 w-full rounded-full bg-border" />
            <div className="h-1 w-1/2 rounded-full bg-border" />
          </div>
        </div>
      </div>
    );
  }
  // minimal
  return (
    <div className={cn(base, "flex-col items-start gap-2 p-2.5")}>
      <div className="h-1.5 w-6 rounded-full bg-primary/60" />
      <div className="h-px w-full bg-accent/60" />
      <div className="h-1 w-1/2 rounded-full bg-border" />
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Theme swatches                                                         */
/* ---------------------------------------------------------------------- */

function ThemeSwatch({
  selected,
  colors,
  label,
  onSelect,
}: {
  selected: boolean;
  colors: { primary: string; accent: string };
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-md p-1.5 transition-colors duration-fast",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "ring-2 ring-accent" : ""
      )}
    >
      <span
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border/60"
        style={{ backgroundColor: colors.primary }}
      >
        <span
          className="absolute -bottom-0.5 -end-0.5 h-4 w-4 rounded-full border-2 border-white"
          style={{ backgroundColor: colors.accent }}
        />
        {selected && <Check className="h-4 w-4 text-white" aria-hidden />}
      </span>
      <span className="text-[11px] text-muted">{label}</span>
    </button>
  );
}

function CustomSwatchButton({
  selected,
  label,
  primary,
  accent,
  onSelect,
}: {
  selected: boolean;
  label: string;
  primary: string;
  accent: string;
  onSelect: () => void;
}) {
  const validPrimary = isValidHex(primary) ? primary : PLATINUM_BORDER;
  const validAccent = isValidHex(accent) ? accent : PLATINUM_BORDER;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-md p-1.5 transition-colors duration-fast",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "ring-2 ring-accent" : ""
      )}
    >
      <span
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-border"
        style={{
          background: `linear-gradient(135deg, ${validPrimary} 50%, ${validAccent} 50%)`,
        }}
      >
        {selected && <Check className="h-4 w-4 text-white drop-shadow" aria-hidden />}
      </span>
      <span className="text-[11px] text-muted">{label}</span>
    </button>
  );
}
