"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowUpLeft } from "lucide-react";

import { t } from "@/lib/i18n";
import { registerStrings as s } from "@/lib/i18n/strings/register";
import { SAUDI_CITIES, type City } from "@/lib/schemas/common";
import type { CandidateRegistration } from "@/lib/schemas/user";
import { useAuth } from "@/lib/firebase/auth-context";
import { authedFetch } from "@/lib/api/authed-fetch";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Gender = CandidateRegistration["gender"];
type Nationality = CandidateRegistration["nationality"];

interface FormState {
  name: string;
  phone: string;
  city: City | "";
  gender: Gender | "";
  nationality: Nationality | "";
  email: string;
  consentAccepted: boolean;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

const INITIAL_STATE: FormState = {
  name: "",
  phone: "",
  city: "",
  gender: "",
  nationality: "",
  email: "",
  consentAccepted: false,
};

// Saudi mobile numbers: 05XXXXXXXX (10 digits) or +9665XXXXXXXX. Accepts
// both common local and international-prefixed forms candidates might type.
const SAUDI_PHONE_REGEX = /^(?:\+?966|0)5\d{8}$/;

function normalizePhone(raw: string): string {
  return raw.trim().replace(/[\s-]/g, "");
}

/**
 * /register — candidate registration (PRD §6.1 step 2; docs/design-system.md
 * §10 "Registration"). Single-column, RTL-first, minimal form: name, phone,
 * city, gender, nationality, optional email, required PDPL consent.
 *
 * Flow: signInAnonymouslyIfNeeded() -> authedFetch POST /api/register ->
 * router.push('/chat'). Identity (uid/role) is never sent by this form —
 * the server derives it from the verified ID token (CLAUDE.md §3.4).
 */
export default function RegisterPage() {
  const router = useRouter();
  const { signInAnonymouslyIfNeeded } = useAuth();

  const [form, setForm] = React.useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};

    if (form.name.trim().length === 0) {
      next.name = t(s.nameRequired, "ar");
    }

    const phone = normalizePhone(form.phone);
    if (phone.length === 0) {
      next.phone = t(s.phoneRequired, "ar");
    } else if (!SAUDI_PHONE_REGEX.test(phone)) {
      next.phone = t(s.phoneInvalid, "ar");
    }

    if (form.city === "") {
      next.city = t(s.cityRequired, "ar");
    }

    if (form.gender === "") {
      next.gender = t(s.genderRequired, "ar");
    }

    if (form.nationality === "") {
      next.nationality = t(s.nationalityRequired, "ar");
    }

    if (form.email.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = t(s.emailInvalid, "ar");
    }

    if (!form.consentAccepted) {
      next.consentAccepted = t(s.consentRequired, "ar");
    }

    return next;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await signInAnonymouslyIfNeeded();

      const body: CandidateRegistration = {
        name: form.name.trim(),
        phone: normalizePhone(form.phone),
        city: form.city as City,
        gender: form.gender as Gender,
        nationality: form.nationality as Nationality,
        lang_pref: "ar",
        consent_accepted: true,
        ...(form.email.trim().length > 0 ? { email: form.email.trim() } : {}),
      };

      const response = await authedFetch("/api/register", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 429) {
          setSubmitError(t(s.rateLimitedError, "ar"));
        } else {
          setSubmitError(t(s.submitErrorGeneric, "ar"));
        }
        return;
      }

      router.push("/chat");
    } catch {
      setSubmitError(t(s.submitErrorGeneric, "ar"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Value panel — navy, start side in RTL (renders first on mobile too, as a compact header block). */}
      <div className="flex flex-col justify-center bg-gradient-to-b from-primary to-primary-deep px-6 py-10 sm:px-10 lg:py-16">
        <div className="mx-auto flex w-full max-w-[440px] flex-col items-start gap-6 text-start">
          <Logo lang="ar" size="md" onDark />
          <h1 className="hidden text-h1 font-bold text-white lg:block lg:text-4xl">
            {t(s.pageTitle, "ar")}
          </h1>
          <p className="hidden text-body-lg text-white/70 lg:block">{t(s.pageSubtitle, "ar")}</p>

          <ul className="flex flex-col gap-3">
            {[s.valueBullet1, s.valueBullet2, s.valueBullet3].map((bullet, i) => (
              <li key={i} className="flex items-start gap-2.5 text-body text-white/85">
                <ArrowUpLeft className="mt-0.5 h-5 w-5 shrink-0 text-accent rtl:-scale-x-100" aria-hidden />
                {t(bullet, "ar")}
              </li>
            ))}
          </ul>

          <Badge variant="warning" size="sm">
            {t(s.freeReassurance, "ar")}
          </Badge>
        </div>
      </div>

      {/* Form panel — white, end side in RTL. */}
      <div className="flex flex-col justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-[440px]">
          <h2 className="mb-1 text-h3 font-semibold text-primary lg:hidden">{t(s.pageTitle, "ar")}</h2>
          <p className="mb-6 text-sm text-muted lg:hidden">{t(s.pageSubtitle, "ar")}</p>
          <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">{t(s.nameLabel, "ar")}</Label>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                placeholder={t(s.namePlaceholder, "ar")}
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
                disabled={submitting}
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-danger">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">{t(s.phoneLabel, "ar")}</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                dir="ltr"
                autoComplete="tel"
                placeholder={t(s.phonePlaceholder, "ar")}
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
                disabled={submitting}
              />
              {errors.phone ? (
                <p id="phone-error" className="text-sm text-danger">
                  {errors.phone}
                </p>
              ) : (
                <p id="phone-hint" className="text-sm text-muted">
                  {t(s.phoneHint, "ar")}
                </p>
              )}
            </div>

            {/* City */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city">{t(s.cityLabel, "ar")}</Label>
              <Select
                value={form.city}
                onValueChange={(value) => updateField("city", value as City)}
                disabled={submitting}
              >
                <SelectTrigger id="city" aria-describedby={errors.city ? "city-error" : undefined}>
                  <SelectValue placeholder={t(s.cityPlaceholder, "ar")} />
                </SelectTrigger>
                <SelectContent>
                  {SAUDI_CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {t(s.cityNames[city], "ar")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && (
                <p id="city-error" className="text-sm text-danger">
                  {errors.city}
                </p>
              )}
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-1.5">
              <span className="text-start text-sm font-medium text-primary">{t(s.genderLabel, "ar")}</span>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t(s.genderLabel, "ar")}>
                <SegmentedOption
                  label={t(s.genderFemale, "ar")}
                  selected={form.gender === "female"}
                  onSelect={() => updateField("gender", "female")}
                  disabled={submitting}
                />
                <SegmentedOption
                  label={t(s.genderMale, "ar")}
                  selected={form.gender === "male"}
                  onSelect={() => updateField("gender", "male")}
                  disabled={submitting}
                />
              </div>
              <p className="text-sm text-muted">{t(s.genderHint, "ar")}</p>
              {errors.gender && <p className="text-sm text-danger">{errors.gender}</p>}
            </div>

            {/* Nationality */}
            <div className="flex flex-col gap-1.5">
              <span className="text-start text-sm font-medium text-primary">
                {t(s.nationalityLabel, "ar")}
              </span>
              <div
                className="grid grid-cols-2 gap-2"
                role="radiogroup"
                aria-label={t(s.nationalityLabel, "ar")}
              >
                <SegmentedOption
                  label={t(s.nationalitySaudi, "ar")}
                  selected={form.nationality === "saudi"}
                  onSelect={() => updateField("nationality", "saudi")}
                  disabled={submitting}
                />
                <SegmentedOption
                  label={t(s.nationalityNonSaudi, "ar")}
                  selected={form.nationality === "non_saudi"}
                  onSelect={() => updateField("nationality", "non_saudi")}
                  disabled={submitting}
                />
              </div>
              {errors.nationality && <p className="text-sm text-danger">{errors.nationality}</p>}
            </div>

            {/* Email (optional) */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">{t(s.emailLabel, "ar")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                dir="ltr"
                autoComplete="email"
                placeholder={t(s.emailPlaceholder, "ar")}
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                disabled={submitting}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-danger">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Consent */}
            <div className="flex flex-col gap-1.5">
              <label className="flex items-start gap-2.5 text-start">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0 rounded-sm border-border text-accent focus-visible:ring-2 focus-visible:ring-ring"
                  checked={form.consentAccepted}
                  onChange={(e) => updateField("consentAccepted", e.target.checked)}
                  disabled={submitting}
                  aria-describedby={errors.consentAccepted ? "consent-error" : undefined}
                />
                <span className="text-sm text-primary">
                  {t(s.consentLabel, "ar")}{" "}
                  <Link href="/privacy" className="font-medium text-accent underline underline-offset-2">
                    {t(s.consentLinkText, "ar")}
                  </Link>
                </span>
              </label>
              {errors.consentAccepted && (
                <p id="consent-error" className="text-sm text-danger">
                  {errors.consentAccepted}
                </p>
              )}
            </div>

            {submitError && (
              <p role="alert" className="text-sm text-danger">
                {submitError}
              </p>
            )}

            <Button type="submit" variant="primary" size="lg" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t(s.submitting, "ar")}
                </>
              ) : (
                t(s.submit, "ar")
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function SegmentedOption({
  label,
  selected,
  onSelect,
  disabled,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={`min-h-[44px] rounded-sm border px-3 py-2 text-sm font-medium transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 ${
        selected
          ? "border-accent bg-accent/10 text-accent"
          : "border-border bg-bg text-primary hover:bg-primary/5"
      }`}
    >
      {label}
    </button>
  );
}
