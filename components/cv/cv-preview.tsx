"use client";

import * as React from "react";

import { t, type Locale } from "@/lib/i18n";
import { dirFor } from "@/lib/i18n/dir";
import { cvStrings } from "@/lib/i18n/strings/cv";
import type { CandidateProfile } from "@/lib/schemas/profile";
import { resolveCvThemeColors } from "@/lib/cv/themes";
import { cn } from "@/lib/utils";

export interface CvPreviewProps {
  profile: CandidateProfile;
  locale: Locale;
  className?: string;
}

/**
 * In-browser, live-approximation CV preview (docs/design-system.md §10).
 *
 * Renders the candidate's real profile data in one of four layouts
 * (classic / modern / executive / minimal, PRD §18.A) using the selected
 * theme's colors as CSS custom properties. This is NOT print-perfect — the
 * PDF service (Cloud Run + Puppeteer) owns print truth/typography. This
 * preview exists so the candidate can compare templates/themes instantly
 * without round-tripping to the server.
 */
export function CvPreview({ profile, locale, className }: CvPreviewProps) {
  const dir = dirFor(locale);
  const colors = resolveCvThemeColors(profile.cv_color_theme, profile.cv_custom_colors);

  const style = {
    "--cv-primary": colors.primary,
    "--cv-accent": colors.accent,
  } as React.CSSProperties;

  const sections = useSectionStrings(locale);
  const template = profile.cv_template;

  return (
    <div
      dir={dir}
      style={style}
      className={cn(
        "w-full overflow-hidden rounded-lg border border-border bg-white text-[13px] leading-relaxed shadow-e1",
        className
      )}
      data-testid="cv-preview"
      data-template={template}
    >
      {template === "classic" && <ClassicLayout profile={profile} locale={locale} sections={sections} />}
      {template === "modern" && <ModernLayout profile={profile} locale={locale} sections={sections} />}
      {template === "executive" && (
        <ExecutiveLayout profile={profile} locale={locale} sections={sections} />
      )}
      {template === "minimal" && <MinimalLayout profile={profile} locale={locale} sections={sections} />}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Shared helpers                                                         */
/* ---------------------------------------------------------------------- */

function useSectionStrings(locale: Locale) {
  return React.useMemo(
    () => ({
      summary: t(cvStrings.sectionSummary, locale),
      experience: t(cvStrings.sectionExperience, locale),
      education: t(cvStrings.sectionEducation, locale),
      skills: t(cvStrings.sectionSkills, locale),
      languages: t(cvStrings.sectionLanguages, locale),
      certifications: t(cvStrings.sectionCertifications, locale),
      projects: t(cvStrings.sectionProjects, locale),
      volunteer: t(cvStrings.sectionVolunteer, locale),
      aiBadge: t(cvStrings.aiBadge, locale),
      current: t(cvStrings.currentBadge, locale),
      contact: t(cvStrings.contactHeading, locale),
    }),
    [locale]
  );
}

type Sections = ReturnType<typeof useSectionStrings>;

interface LayoutProps {
  profile: CandidateProfile;
  locale: Locale;
  sections: Sections;
}

function SkillPill({ name, inferred, aiLabel }: { name: string; inferred: boolean; aiLabel: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={
        inferred
          ? { border: "1px solid var(--cv-accent)", color: "var(--cv-accent)" }
          : { backgroundColor: "color-mix(in srgb, var(--cv-accent) 15%, white)", color: "var(--cv-accent)" }
      }
    >
      {name}
      {inferred && (
        <span
          className="rounded-full px-1 text-[9px] font-semibold text-white"
          style={{ backgroundColor: "var(--cv-accent)" }}
        >
          {aiLabel}
        </span>
      )}
    </span>
  );
}

function ExperienceList({ profile, sections }: { profile: CandidateProfile; sections: Sections }) {
  if (profile.experience.length === 0) return null;
  return (
    <PreviewSection title={sections.experience}>
      <ul className="flex flex-col gap-3">
        {profile.experience.map((exp, i) => (
          <li key={i}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-2">
              <span className="font-semibold" style={{ color: "var(--cv-primary)" }}>
                {exp.title}
              </span>
              <span className="text-[11px] text-gray-500">
                {exp.start_date} – {exp.is_current ? sections.current : exp.end_date}
              </span>
            </div>
            <p className="text-[12px] text-gray-500">
              {exp.company} — {exp.city}
            </p>
            <p className="mt-0.5 text-[12px] text-gray-700">{exp.description}</p>
          </li>
        ))}
      </ul>
    </PreviewSection>
  );
}

function EducationList({ profile, sections }: { profile: CandidateProfile; sections: Sections }) {
  if (profile.education.length === 0) return null;
  return (
    <PreviewSection title={sections.education}>
      <ul className="flex flex-col gap-2">
        {profile.education.map((edu, i) => (
          <li key={i}>
            <p className="font-semibold" style={{ color: "var(--cv-primary)" }}>
              {edu.degree} — {edu.field}
            </p>
            <p className="text-[12px] text-gray-500">
              {edu.institution} · {edu.start_year}
              {edu.end_year ? `–${edu.end_year}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </PreviewSection>
  );
}

function SkillsBlock({ profile, sections }: { profile: CandidateProfile; sections: Sections }) {
  if (profile.skills.length === 0) return null;
  return (
    <PreviewSection title={sections.skills}>
      <div className="flex flex-wrap gap-1.5">
        {profile.skills.map((skill, i) => (
          <SkillPill key={i} name={skill.name} inferred={skill.inferred} aiLabel={sections.aiBadge} />
        ))}
      </div>
    </PreviewSection>
  );
}

function LanguagesBlock({ profile, sections }: { profile: CandidateProfile; sections: Sections }) {
  if (profile.languages.length === 0) return null;
  return (
    <PreviewSection title={sections.languages}>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-gray-700">
        {profile.languages.map((lang, i) => (
          <li key={i}>
            {lang.language} <span className="text-gray-500">— {lang.proficiency}</span>
          </li>
        ))}
      </ul>
    </PreviewSection>
  );
}

function CertificationsBlock({ profile, sections }: { profile: CandidateProfile; sections: Sections }) {
  if (profile.certifications.length === 0) return null;
  return (
    <PreviewSection title={sections.certifications}>
      <ul className="flex flex-col gap-1 text-[12px] text-gray-700">
        {profile.certifications.map((cert, i) => (
          <li key={i}>
            {cert.name} — <span className="text-gray-500">{cert.issuer}, {cert.date}</span>
          </li>
        ))}
      </ul>
    </PreviewSection>
  );
}

function ProjectsBlock({ profile, sections }: { profile: CandidateProfile; sections: Sections }) {
  if (profile.projects.length === 0) return null;
  return (
    <PreviewSection title={sections.projects}>
      <ul className="flex flex-col gap-2">
        {profile.projects.map((proj, i) => (
          <li key={i}>
            <p className="font-semibold" style={{ color: "var(--cv-primary)" }}>
              {proj.name}
            </p>
            <p className="text-[12px] text-gray-700">{proj.description}</p>
          </li>
        ))}
      </ul>
    </PreviewSection>
  );
}

function VolunteerBlock({ profile, sections }: { profile: CandidateProfile; sections: Sections }) {
  if (profile.volunteer_work.length === 0) return null;
  return (
    <PreviewSection title={sections.volunteer}>
      <ul className="list-inside list-disc text-[12px] text-gray-700">
        {profile.volunteer_work.map((v, i) => (
          <li key={i}>{v}</li>
        ))}
      </ul>
    </PreviewSection>
  );
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <h3
        className="mb-1.5 border-b pb-1 text-[13px] font-semibold uppercase tracking-wide"
        style={{ color: "var(--cv-primary)", borderColor: "color-mix(in srgb, var(--cv-primary) 20%, white)" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Classic — centered header, underlined sections (PRD §18.A)             */
/* ---------------------------------------------------------------------- */

function ClassicLayout({ profile, locale, sections }: LayoutProps) {
  return (
    <div className="p-6">
      <header className="mb-4 border-b pb-4 text-center" style={{ borderColor: "var(--cv-primary)" }}>
        <h1 className="text-xl font-bold" style={{ color: "var(--cv-primary)" }}>
          {profile.personal.name}
        </h1>
        <p className="mt-1 text-[12px] text-gray-500">
          {profile.personal.city} · {profile.personal.phone}
          {profile.personal.email ? ` · ${profile.personal.email}` : ""}
        </p>
      </header>

      <PreviewSection title={sections.summary}>
        <p className="text-[12px] text-gray-700">{t(profile.professional_summary, locale)}</p>
      </PreviewSection>

      <ExperienceList profile={profile} sections={sections} />
      <EducationList profile={profile} sections={sections} />
      <SkillsBlock profile={profile} sections={sections} />
      <LanguagesBlock profile={profile} sections={sections} />
      <CertificationsBlock profile={profile} sections={sections} />
      <ProjectsBlock profile={profile} sections={sections} />
      <VolunteerBlock profile={profile} sections={sections} />
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Modern — colored sidebar with contact info (PRD §18.A)                 */
/* ---------------------------------------------------------------------- */

function ModernLayout({ profile, locale, sections }: LayoutProps) {
  return (
    <div className="flex min-h-[420px] flex-col sm:flex-row">
      <aside
        className="flex w-full flex-col gap-4 p-5 text-white sm:w-[34%]"
        style={{ backgroundColor: "var(--cv-primary)" }}
      >
        <div>
          <h1 className="text-lg font-bold">{profile.personal.name}</h1>
        </div>
        <div>
          <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/70">
            {sections.contact}
          </h3>
          <p className="text-[12px] text-white/90">{profile.personal.city}</p>
          <p className="text-[12px] text-white/90">{profile.personal.phone}</p>
          {profile.personal.email && <p className="text-[12px] text-white/90">{profile.personal.email}</p>}
        </div>
        {profile.skills.length > 0 && (
          <div>
            <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/70">
              {sections.skills}
            </h3>
            <div className="flex flex-wrap gap-1">
              {profile.skills.map((skill, i) => (
                <span
                  key={i}
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: "var(--cv-accent)", color: "white" }}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}
        {profile.languages.length > 0 && (
          <div>
            <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/70">
              {sections.languages}
            </h3>
            <ul className="text-[12px] text-white/90">
              {profile.languages.map((lang, i) => (
                <li key={i}>
                  {lang.language} — {lang.proficiency}
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      <div className="flex-1 p-5">
        <PreviewSection title={sections.summary}>
          <p className="text-[12px] text-gray-700">{t(profile.professional_summary, locale)}</p>
        </PreviewSection>
        <ExperienceList profile={profile} sections={sections} />
        <EducationList profile={profile} sections={sections} />
        <CertificationsBlock profile={profile} sections={sections} />
        <ProjectsBlock profile={profile} sections={sections} />
        <VolunteerBlock profile={profile} sections={sections} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Executive — bold header bar, compact dense layout (PRD §18.A)          */
/* ---------------------------------------------------------------------- */

function ExecutiveLayout({ profile, locale, sections }: LayoutProps) {
  return (
    <div>
      <header className="p-5 text-white" style={{ backgroundColor: "var(--cv-primary)" }}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-xl font-bold">{profile.personal.name}</h1>
          <p className="text-[11px] text-white/80">
            {profile.personal.city} · {profile.personal.phone}
          </p>
        </div>
        <div
          className="mt-2 h-1 w-16 rounded-full"
          style={{ backgroundColor: "var(--cv-accent)" }}
          aria-hidden
        />
      </header>

      <div className="p-5 pt-4">
        <PreviewSection title={sections.summary}>
          <p className="text-[12px] text-gray-700">{t(profile.professional_summary, locale)}</p>
        </PreviewSection>
        <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          <div>
            <ExperienceList profile={profile} sections={sections} />
            <EducationList profile={profile} sections={sections} />
          </div>
          <div>
            <SkillsBlock profile={profile} sections={sections} />
            <LanguagesBlock profile={profile} sections={sections} />
            <CertificationsBlock profile={profile} sections={sections} />
          </div>
        </div>
        <ProjectsBlock profile={profile} sections={sections} />
        <VolunteerBlock profile={profile} sections={sections} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Minimal — ultra-clean, maximum whitespace (PRD §18.A)                  */
/* ---------------------------------------------------------------------- */

function MinimalLayout({ profile, locale, sections }: LayoutProps) {
  return (
    <div className="p-8">
      <header className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: "var(--cv-primary)" }}>
          {profile.personal.name}
        </h1>
        <p className="mt-1 text-[12px] text-gray-400">
          {profile.personal.city} · {profile.personal.phone}
        </p>
        <div className="mt-3 h-px w-full" style={{ backgroundColor: "var(--cv-accent)" }} aria-hidden />
      </header>

      <div className="flex flex-col gap-5">
        <MinimalSection title={sections.summary}>
          <p className="text-[12px] text-gray-700">{t(profile.professional_summary, locale)}</p>
        </MinimalSection>

        {profile.experience.length > 0 && (
          <MinimalSection title={sections.experience}>
            <ul className="flex flex-col gap-3">
              {profile.experience.map((exp, i) => (
                <li key={i}>
                  <p className="font-medium text-gray-800">
                    {exp.title} <span className="font-normal text-gray-400">· {exp.company}</span>
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {exp.start_date} – {exp.is_current ? sections.current : exp.end_date}
                  </p>
                </li>
              ))}
            </ul>
          </MinimalSection>
        )}

        {profile.education.length > 0 && (
          <MinimalSection title={sections.education}>
            <ul className="flex flex-col gap-2">
              {profile.education.map((edu, i) => (
                <li key={i} className="text-[12px] text-gray-700">
                  {edu.degree} — {edu.field}, {edu.institution}
                </li>
              ))}
            </ul>
          </MinimalSection>
        )}

        {profile.skills.length > 0 && (
          <MinimalSection title={sections.skills}>
            <p className="text-[12px] text-gray-700">
              {profile.skills.map((s) => s.name).join(" · ")}
            </p>
          </MinimalSection>
        )}

        {profile.languages.length > 0 && (
          <MinimalSection title={sections.languages}>
            <p className="text-[12px] text-gray-700">
              {profile.languages.map((l) => `${l.language} (${l.proficiency})`).join(" · ")}
            </p>
          </MinimalSection>
        )}
      </div>
    </div>
  );
}

function MinimalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
        {title}
      </h3>
      {children}
    </div>
  );
}

/** Skeleton shown while the profile is still loading (design-system §6/§11). */
export function CvPreviewSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 rounded-lg border border-border bg-white p-6 shadow-e1",
        className
      )}
    >
      <div className="mx-auto h-6 w-1/2 animate-pulse rounded-sm bg-border/60" />
      <div className="mx-auto h-3 w-1/3 animate-pulse rounded-sm bg-border/60" />
      <div className="mt-4 h-4 w-1/4 animate-pulse rounded-sm bg-border/60" />
      <div className="h-3 w-full animate-pulse rounded-sm bg-border/60" />
      <div className="h-3 w-5/6 animate-pulse rounded-sm bg-border/60" />
      <div className="mt-4 h-4 w-1/4 animate-pulse rounded-sm bg-border/60" />
      <div className="h-3 w-full animate-pulse rounded-sm bg-border/60" />
      <div className="h-3 w-2/3 animate-pulse rounded-sm bg-border/60" />
    </div>
  );
}
