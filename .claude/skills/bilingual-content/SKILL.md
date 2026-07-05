---
name: bilingual-content
description: Use whenever producing user-facing text — UI strings, CV fields, job posts, notifications, errors. Ensures every string exists in Arabic and English, uses Saudi dialect where conversational, and is gender-aware. Trigger for any new copy or i18n key.
---

# Bilingual Content

Every user-facing string in Light exists in both `ar` and `en`. There is no English-only or
Arabic-only surface.

## Rules
1. **Shape**: localized content is `{ en: string, ar: string }`. UI strings live in `lib/i18n` keyed
   by a stable key; never hardcode literals in JSX or handlers.
2. **Register**:
   - **Conversational** (the AI career consultant, chat copy): **Saudi-dialect Arabic** — not MSA,
     not Egyptian, not Levantine. Warm, professional undertone.
   - **Formal** (CV body, job posts, legal/PDPL): clean professional Arabic + professional English.
3. **Gender-aware**: when addressing the user, pick masculine/feminine conjugation from the profile
   `gender`. Provide both forms where the string addresses the user directly.
4. **Numbers, dates, currency**: format for the Saudi locale; keep digits rendering correctly in RTL
   (coordinate with `rtl-component` for bidi).
5. **Parity check**: no key ships with only one language. A missing side is a bug.

## i18n key pattern (lib/i18n)
```ts
export const strings = {
  "chat.greeting.male":   { ar: "أهلاً {name}، جاهز نبني سيرتك؟", en: "Hi {name}, ready to build your CV?" },
  "chat.greeting.female": { ar: "أهلاً {name}، جاهزة نبني سيرتك؟", en: "Hi {name}, ready to build your CV?" },
  "cta.for_seekers":      { ar: "للباحثين عن عمل", en: "For job seekers" },
  "cta.for_employers":    { ar: "لأصحاب العمل", en: "For employers" },
} as const;

export function t(key: keyof typeof strings, locale: "ar" | "en", vars?: Record<string,string>) {
  let s = strings[key][locale];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
}
```

## Gender helper
```ts
export function genderedKey(base: string, gender: "male" | "female") {
  return `${base}.${gender}` as const;
}
```

## Checklist before shipping copy
- [ ] `ar` and `en` both present and meaningful (not machine-literal).
- [ ] Conversational copy is Saudi dialect; formal copy is professional.
- [ ] Gender forms provided where addressing the user.
- [ ] Keyed in `lib/i18n`, no hardcoded literals.
- [ ] Renders correctly in RTL (mixed content, digits).

## Related
`rtl-component`, `gemini-prompt` (dialect in AI output), `nitaqat-rules` (localized Nitaqat notes).
