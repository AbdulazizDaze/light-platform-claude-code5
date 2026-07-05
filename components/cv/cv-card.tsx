"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

import { t, type Locale } from "@/lib/i18n";
import { chatStrings } from "@/lib/i18n/strings/chat";
import type { Cv, CvSkill } from "@/lib/schemas/cv";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface CvCardProps {
  cv: Cv;
  locale?: Locale;
}

/**
 * CvCard — the hero component (docs/design-system.md §6). Inline CV preview
 * rendered in chat once `cv_generated` is true. Note on bilingual scope: per
 * `lib/schemas/cv.ts`, only `professional_summary` is a true `{ en, ar }`
 * LocalizedString — experience/education/skills/etc. are stored as the
 * single string the candidate/AI produced (usually Arabic, since Light
 * converses in Saudi dialect Arabic). The AR/EN segmented toggle therefore
 * switches the *summary* language and all Light-authored section chrome
 * (headings, badges, buttons); free-text fields display as authored. This
 * matches the "CV JSON contract" in docs/data-models.md — full per-field
 * bilingual CV text is produced later by the PDF/customization pipeline, not
 * this inline preview.
 */
export function CvCard({ cv, locale: initialLocale = "ar" }: CvCardProps) {
  const router = useRouter();
  const [locale, setLocale] = React.useState<Locale>(initialLocale);
  const s = chatStrings;
  const tr = (ls: (typeof s)[keyof typeof s]) => t(ls, locale);

  const hasCerts = cv.certifications.length > 0;
  const hasProjects = cv.projects.length > 0;
  const hasVolunteer = cv.volunteer_work.length > 0;

  return (
    <Card className="w-full max-w-full overflow-hidden" dir={locale === "ar" ? "rtl" : "ltr"}>
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <CardTitle>{tr(s.cvHeading)}</CardTitle>
        <Tabs value={locale} onValueChange={(v) => setLocale(v as Locale)}>
          <TabsList className="h-9 p-0.5">
            <TabsTrigger value="ar" className="min-w-0 px-3 py-1 text-xs">
              {t(s.cvToggleAr, locale)}
            </TabsTrigger>
            <TabsTrigger value="en" className="min-w-0 px-3 py-1 text-xs">
              {t(s.cvToggleEn, locale)}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 pt-0">
        <CvSection title={tr(s.cvSectionSummary)} defaultOpen>
          <p className="text-body text-primary/90">{t(cv.professional_summary, locale)}</p>
        </CvSection>

        {cv.experience.length > 0 && (
          <CvSection title={tr(s.cvSectionExperience)} defaultOpen>
            <ul className="flex flex-col gap-4">
              {cv.experience.map((exp, i) => (
                <li key={i} className="text-start">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="font-semibold text-primary">{exp.title}</span>
                    {exp.is_current && (
                      <Badge variant="success" size="xs">
                        {tr(s.cvCurrentBadge)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted">
                    {exp.company} — {exp.city}
                  </p>
                  <p className="text-sm text-muted">
                    {exp.start_date} – {exp.is_current ? tr(s.cvCurrentBadge) : exp.end_date}
                  </p>
                  <p className="mt-1 text-body text-primary/90">{exp.description}</p>
                  {exp.achievements.length > 0 && (
                    <ul className="mt-1 list-inside list-disc text-sm text-primary/80">
                      {exp.achievements.map((a, j) => (
                        <li key={j}>{a}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </CvSection>
        )}

        <CvSection title={tr(s.cvSectionEducation)} defaultOpen>
          <ul className="flex flex-col gap-3">
            {cv.education.map((edu, i) => (
              <li key={i} className="text-start">
                <p className="font-semibold text-primary">
                  {edu.degree} — {edu.field}
                </p>
                <p className="text-sm text-muted">
                  {edu.institution} · {edu.start_year}
                  {edu.end_year ? `–${edu.end_year}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </CvSection>

        <CvSection title={tr(s.cvSectionSkills)} defaultOpen>
          <div className="flex flex-wrap gap-2">
            {cv.skills.map((skill, i) => (
              <SkillChip key={i} skill={skill} aiLabel={tr(s.cvAiBadge)} />
            ))}
          </div>
        </CvSection>

        <CvSection title={tr(s.cvSectionLanguages)} defaultOpen>
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            {cv.languages.map((lang, i) => (
              <li key={i} className="text-body text-primary/90">
                {lang.language} <span className="text-muted">— {lang.proficiency}</span>
              </li>
            ))}
          </ul>
        </CvSection>

        {hasCerts && (
          <CvSection title={tr(s.cvSectionCertifications)}>
            <ul className="flex flex-col gap-2">
              {cv.certifications.map((cert, i) => (
                <li key={i} className="text-body text-primary/90">
                  {cert.name} — <span className="text-muted">{cert.issuer}, {cert.date}</span>
                </li>
              ))}
            </ul>
          </CvSection>
        )}

        {hasProjects && (
          <CvSection title={tr(s.cvSectionProjects)}>
            <ul className="flex flex-col gap-3">
              {cv.projects.map((proj, i) => (
                <li key={i} className="text-start">
                  <p className="font-semibold text-primary">{proj.name}</p>
                  <p className="text-body text-primary/90">{proj.description}</p>
                </li>
              ))}
            </ul>
          </CvSection>
        )}

        {hasVolunteer && (
          <CvSection title={tr(s.cvSectionVolunteer)}>
            <ul className="list-inside list-disc text-body text-primary/90">
              {cv.volunteer_work.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          </CvSection>
        )}
      </CardContent>

      <CardFooter className="flex-wrap gap-2">
        <Button variant="primary" onClick={() => router.push("/cv")}>
          {tr(s.cvDownloadPdf)}
        </Button>
        <Button variant="secondary" onClick={() => router.push("/cv")}>
          {tr(s.cvCustomize)}
        </Button>
      </CardFooter>
    </Card>
  );
}

function SkillChip({ skill, aiLabel }: { skill: CvSkill; aiLabel: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium",
        skill.inferred
          ? "border border-accent text-accent"
          : "bg-accent/10 text-accent"
      )}
    >
      {skill.name}
      {skill.inferred && (
        <Badge variant="success" size="xs" className="px-1.5 py-0 text-[10px] leading-4">
          {aiLabel}
        </Badge>
      )}
    </span>
  );
}

function CvSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const contentId = React.useId();

  return (
    <div className="border-b border-border py-3 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={contentId}
        className="flex w-full items-center justify-between gap-2 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      >
        <h3 className="text-h3 font-semibold text-primary">{title}</h3>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted transition-transform duration-base",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      {open && (
        <div id={contentId} className="mt-3">
          {children}
        </div>
      )}
    </div>
  );
}

/** Skeleton variant shown while the CV is being generated (design-system §6/§11). */
export function CvCardSkeleton({ locale = "ar" }: { locale?: Locale }) {
  return (
    <Card className="w-full max-w-full" dir={locale === "ar" ? "rtl" : "ltr"}>
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <CardTitle className="text-muted">{t(chatStrings.cvGeneratingTitle, locale)}</CardTitle>
        <Skeleton className="h-9 w-20" />
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-0">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-5 w-1/4" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-28" />
      </CardFooter>
    </Card>
  );
}
