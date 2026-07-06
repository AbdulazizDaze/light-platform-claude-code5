import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { t } from "@/lib/i18n";
import { privacyStrings as s } from "@/lib/i18n/strings/privacy";
import { Button } from "@/components/ui/button";

/**
 * /privacy — minimal PDPL-aligned data-minimization notice
 * (PRD §16.1; CLAUDE.md §3.7). Linked from the registration consent
 * checkbox. Static content, server component, no data fetching — no
 * empty/loading/error states required.
 *
 * Displays Arabic by default (site is ar/RTL-first, CLAUDE.md §3.2); every
 * string still carries its English counterpart via lib/i18n for future
 * locale support.
 */
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-12 sm:px-6">
      <h1 className="text-h1 font-bold text-primary">{t(s.pageTitle, "ar")}</h1>
      <p className="mt-3 text-body text-muted">{t(s.intro, "ar")}</p>

      <div className="mt-8 flex flex-col gap-8">
        <Section title={t(s.minimizationTitle, "ar")} body={t(s.minimizationBody, "ar")} />
        <Section title={t(s.purposeTitle, "ar")} body={t(s.purposeBody, "ar")} />
        <Section title={t(s.storageTitle, "ar")} body={t(s.storageBody, "ar")} />
        <Section title={t(s.rightsTitle, "ar")} body={t(s.rightsBody, "ar")} />
        <Section title={t(s.consentTitle, "ar")} body={t(s.consentBody, "ar")} />
      </div>

      <div className="mt-10">
        <Button variant="secondary" asChild>
          <Link href="/register">
            {/* Directional icon — mirrors correctly per design-system §8 because
                "back" points toward the start side in RTL, which ArrowRight
                (pointing to the visual start after RTL's automatic mirroring
                of directional icons) renders correctly via the browser/OS
                bidi + our RTL-first layout. */}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            {t(s.backToRegister, "ar")}
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section className="text-start">
      <h2 className="text-h3 font-semibold text-primary">{title}</h2>
      <p className="mt-2 text-body text-muted">{body}</p>
    </section>
  );
}
