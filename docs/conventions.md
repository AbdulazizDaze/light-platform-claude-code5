# Conventions

House rules for the Light codebase. Agents follow these unless a task explicitly overrides them.

## Language & types

- **TypeScript strict.** No `any` without an inline justification comment. Prefer `unknown` + narrowing.
- Runtime boundaries (API input, AI output, Firestore reads) are validated with **Zod**. Types are
  **inferred from Zod schemas** (`z.infer<typeof Schema>`) — schema is the source of truth.
- No default exports for components except Next.js pages/layouts where the framework requires them.

## Naming

- Files: `kebab-case.ts` / `kebab-case.tsx`. React components: `PascalCase` inside the file.
- Zod schemas: `PascalCaseSchema` (e.g. `CvSchema`), inferred type `Cv`.
- Functions/vars: `camelCase`. Constants: `SCREAMING_SNAKE_CASE`. Firestore collections: `snake_case`
  matching the data model (`candidate_profiles`, `job_posts`).
- Localized fields are objects: `{ en: string; ar: string }`. Never `title_en` / `title_ar`.

## Folder layout

Follow the tree in `docs/architecture.md §8`. Keep pure logic (matching, scoring, schemas) in `lib/`
so it's unit-testable without React or Firebase. Route handlers stay thin — parse, authorize,
delegate to `lib/`, respond.

## React / UI

- **Build against `docs/design-system.md`.** It is the source of truth for tokens, type/spacing scales,
  component specs, motion, and screen layouts. Don't invent per-screen UI — implement the system. If a
  case isn't covered, extend the design-system doc in the same PR.
- **Component library: shadcn/ui.** Primitives live in `components/ui/` (we own them); theme by mapping
  shadcn CSS variables to Light tokens in `app/globals.css`. Light-specific components (CvCard,
  ChatBubble, MatchCard) compose primitives and live in `components/`. Fix the primitive, don't restyle
  per usage.
- **RTL-first.** Root `<html dir="rtl" lang="ar">`. Use logical CSS properties (`ms-*`, `me-*`,
  `text-start`, `text-end`) — never `ml-*`/`mr-*`/`text-left`/`text-right` for layout that must flip.
  Audit every shadcn component for physical classes and popover/dropdown side in RTL.
- All user-facing strings come from `lib/i18n` keyed by locale — no hardcoded literals in JSX.
- Colors and fonts use the **semantic design tokens** (`docs/design-system.md §2/§3`), never raw hex.
- Every list/async surface defines empty, loading (skeletons), and error states.
- Components are server components by default; add `"use client"` only when needed (state, effects,
  browser APIs).

## API routes

- Every handler: (1) verify Firebase ID token, (2) load server-side profile, (3) validate body with
  Zod, (4) rate-limit by uid, (5) do work in `lib/`, (6) return typed JSON. Use the `nextjs-api-route`
  skill for the canonical template.
- Never read identity/role from the request body. Strip/ignore those fields.
- Errors: return structured `{ error: { code, message } }`, never leak stack traces or provider errors.

## AI code

- All Gemini calls go through `lib/ai/callGemini()` with the fallback chain. No direct SDK calls in
  routes or components.
- Prompts live in `lib/ai/prompts/` as versioned string builders, not inline in handlers.
- Every AI JSON response is Zod-validated with a bounded retry (max 2). Log validation failures.

## Firestore

- Access through typed converters in `lib/firebase/`. No ad-hoc `doc.data()` casting.
- Every new collection or field ships **with** its security rule and (if queried) its composite
  index in `firestore.indexes.json`. Use the `firestore-rules` skill.
- Embeddings: 768-float arrays stored on the document; regenerate only on material change.

## Testing

- **Vitest.** Unit-test all pure logic: hard filters, soft scoring, boosts, Zod schemas, i18n
  helpers, skill-inference utilities. Aim for exhaustive coverage of the matching math — it's the
  core IP and must be deterministic.
- Test naming: `*.test.ts` next to the unit or under `__tests__/`. Arrange-Act-Assert.
- No test may hit the live Gemini API or production Firestore. Mock at the `lib/` boundary.

## Git

- Small, focused commits. Conventional Commits style: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`,
  `chore:`. Reference the roadmap item where relevant.
- One feature = one branch = one reviewed PR. `code-reviewer` (and `security-reviewer` when
  auth/rules/PII are touched) must approve before merge.
- Never commit `.env*`, service-account JSON, or generated build artifacts.

## Accessibility & responsiveness

- Mobile-responsive by default; bottom action bars on mobile, sidebar collapses to overlay.
- Meet WCAG AA color contrast (the brand palette is chosen to allow it — verify with the
  `design:accessibility-review` skill on key screens).
- Full keyboard operability for the chat and CV editing flows.

## Comments & docs

- Comment the *why*, not the *what*. Document any non-obvious Saudi-market or PDPL rule inline.
- When a convention changes, update this file in the same PR.
