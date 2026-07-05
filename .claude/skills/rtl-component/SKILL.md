---
name: rtl-component
description: Use when scaffolding or fixing a React component so it is RTL-first, bilingual, brand-consistent, and gender-aware. Trigger for any new UI component, chat bubble, card, form, or bidi/typography fix.
---

# RTL Component

Light is Arabic-first. Build RTL as the default; LTR is the exception. Build against **`docs/design-system.md`** (tokens, component specs, screen layouts) using **shadcn/ui** primitives from `components/ui/` themed to Light's tokens — compose, don't restyle per usage.

## Rules
1. Root is `<html dir="rtl" lang="ar">`. Components must not assume LTR.
2. Use **logical** Tailwind utilities that flip automatically: `ms-*`/`me-*` (margin start/end),
   `ps-*`/`pe-*` (padding), `text-start`/`text-end`, `start-0`/`end-0`. **Never** `ml-*`/`mr-*`/
   `left-*`/`right-*`/`text-left`/`text-right` for flippable layout.
3. Chat convention: **AI messages bubble right, user messages left** (opposite of Western apps).
4. All copy via `lib/i18n` (`bilingual-content`) — no hardcoded strings. Gender-aware where addressing
   the user.
5. Fonts: Alexandria (UI/Arabic), Readex Pro (code/tables). Colors via brand tokens.
6. Mobile-responsive (bottom action bars, overlay sidebar); keyboard-operable; WCAG AA contrast.
7. Bidi: isolate mixed Arabic/Latin/number/URL runs so they render correctly.

## Template
```tsx
import { t } from "@/lib/i18n";

export function ExampleCard({ locale, gender }: { locale: "ar" | "en"; gender: "male" | "female" }) {
  return (
    <section dir={locale === "ar" ? "rtl" : "ltr"} className="rounded-2xl border border-platinum p-4">
      <h2 className="text-start font-alexandria text-oxford text-lg font-semibold">
        {t("example.title", locale)}
      </h2>
      <p className="mt-2 text-start text-oxford/80">{t("example.body", locale)}</p>
      <div className="mt-4 flex items-center gap-2">
        <button className="rounded-xl bg-jungle px-4 py-2 text-white ms-auto">
          {t("example.cta", locale)}
        </button>
      </div>
    </section>
  );
}
```

## Checklist
- [ ] Logical properties only; verified flipping in RTL and LTR.
- [ ] Copy from i18n, both languages, gender-aware where needed.
- [ ] Brand tokens for color/font.
- [ ] Mobile + keyboard + AA contrast.
- [ ] Mixed-direction text renders correctly.

## Related
`docs/design-system.md`, `bilingual-content`, `cv-schema` (CvCard), `pdf-service-engineer` (print typography).
