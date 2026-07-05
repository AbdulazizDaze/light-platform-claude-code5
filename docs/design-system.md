# Design System — Light

The single source of truth for how Light looks and feels. Every UI agent builds **against this
system**, not by improvising. Foundation: **Tailwind + shadcn/ui**, **RTL-first**, Arabic-native.

Brand tokens (colors, fonts) originate in `CLAUDE.md §4`; this doc turns them into a full, buildable
system. When a design decision isn't covered here, extend this doc in the same PR rather than deciding
ad hoc in a component.

---

## 1. Design principles

1. **Arabic-native, not translated.** RTL is the default; Arabic typography, numerals, and rhythm are
   first-class. LTR/English is the mirror case.
2. **Calm and professional, with conversational warmth.** The product is a career consultant — trust
   and clarity over flashiness. Generous whitespace; one clear primary action per screen.
3. **Conversation is the hero.** The chat and CvCard are the emotional core; give them focus (often
   full-screen, no chrome) and the most polish.
4. **Green = Light's intelligence.** Jungle Green marks the AI, primary actions, and success. Use it
   deliberately, not decoratively.
5. **Progressive disclosure.** Fresh graduates get overwhelmed — reveal complexity gradually (one
   question at a time in chat; expandable CV sections; simple recruiter one-liner first).
6. **Accessible by default.** WCAG AA contrast, visible focus, 44px touch targets, reduced-motion honored.

---

## 2. Color system

Semantic tokens map to the brand palette. **Reference tokens, never raw hex, in components.**

| Token | Value | Use |
|---|---|---|
| `--color-primary` (oxford) | `#14213D` | Primary text, dark surfaces, navbar |
| `--color-accent` (jungle) | `#22AE89` | Primary action, AI identity, success, highlights |
| `--color-warning` (orange) | `#FCA311` | Secondary accent, warnings, attention |
| `--color-danger` (fire) | `#D62828` | Errors, destructive actions, urgent |
| `--color-border` (platinum) | `#E3E3E3` | Borders, dividers, disabled |
| `--color-bg` | `#FFFFFF` | Page background |
| `--color-surface` | `#F7F8FA` | Cards/raised sections (subtle off-white) |
| `--color-muted` | `#6B7280` | Secondary text, captions |

**Derived states** (use Tailwind opacity or defined shades, not new hex): hover = base darkened ~8%,
active = ~12%, focus ring = accent at 40% in a 2px outline, disabled = platinum bg + muted text.

**Contrast rules:** Oxford on white and white on Jungle/Oxford both pass AA. Never place Orange text on
white for body copy (fails AA) — use it for fills/icons/borders, or Oxford text on an Orange fill.

**Semantic status colors:** success = jungle, warning = orange, error = fire, info = oxford. Match
statuses and Nitaqat colors reuse these (see §9).

> Dark mode is out of scope for M1/M2. Keep tokens in CSS variables so it can be added later without
> touching components.

---

## 3. Typography

Fonts (from `CLAUDE.md §4`): **Alexandria** (primary UI + Arabic), **Readex Pro** (numeric/tabular,
code, data tables), **Noto Sans Arabic** (PDF print only — see `pdf-service-engineer`).

Arabic needs slightly more line-height than Latin. Scale (rem, 16px base):

| Token | Size / line-height | Use |
|---|---|---|
| `display` | 40 / 1.25 | Landing hero |
| `h1` | 30 / 1.3 | Page titles |
| `h2` | 24 / 1.35 | Section headings |
| `h3` | 20 / 1.4 | Card titles |
| `body-lg` | 18 / 1.7 | Chat messages, lead copy |
| `body` | 16 / 1.7 | Default body |
| `sm` | 14 / 1.6 | Secondary, form labels |
| `xs` | 12 / 1.5 | Captions, badges |

Weights: 400 body, 500 labels/buttons, 600 headings, 700 hero. Numerals in tables/CVs use Readex Pro
with `font-variant-numeric: tabular-nums`. Set `line-height` a touch looser for Arabic blocks; avoid
letter-spacing on Arabic (it breaks joining).

---

## 4. Spacing, radius, elevation, layout

- **Spacing scale** (4px base): 0, 1(4), 2(8), 3(12), 4(16), 6(24), 8(32), 12(48), 16(64). Use Tailwind
  spacing utilities with **logical** direction (`ms/me/ps/pe`).
- **Radius:** `sm` 8px (inputs, chips), `md` 12px (buttons, small cards), `lg` 16px (cards),
  `xl` 24px (modals, hero panels), `full` (avatars, pills). Light skews friendly-rounded, not sharp.
- **Elevation** (soft, low-contrast shadows on near-white surfaces): `e1` cards, `e2` popovers/dropdowns,
  `e3` modals. Prefer border + subtle shadow over heavy drop shadows.
- **Layout:** max content width ~1200px; comfortable reading column ~640–720px for chat/CV. Chat and CV
  pages render **full-screen without sidebar** for focus. Dashboards use a collapsible sidebar (overlay
  on mobile).
- **Breakpoints** (Tailwind defaults): `sm` 640, `md` 768, `lg` 1024, `xl` 1280. Design mobile-first;
  bottom action bars on mobile.

---

## 5. shadcn/ui integration

shadcn/ui gives us owned, Tailwind-based primitives (Radix under the hood). Setup notes:

- Install: `npx shadcn@latest init`, then add components as needed
  (`npx shadcn@latest add button input card dialog dropdown-menu badge toast skeleton tabs`).
- Components land in `components/ui/` — **we own and can edit them.** Theme by mapping shadcn's CSS
  variables (`--primary`, `--destructive`, `--muted`, `--radius`, etc.) to Light's tokens in
  `app/globals.css`. Do **not** restyle per-usage; fix the primitive.
- **RTL:** Radix respects `dir`; keep the app `dir="rtl"`. Audit each added component for physical
  classes and swap to logical ones. Popovers/dropdowns must open on the correct side in RTL — verify
  with `rtl-arabic-specialist`.
- Keep primitives generic; Light-specific components (CvCard, ChatBubble, MatchCard) compose them and
  live in `components/` (not `components/ui/`).

Wrap shadcn variants with Light's tokens so `<Button variant="default">` is already Jungle Green, etc.

---

## 6. Core component specs

**Button** — variants: `primary` (jungle fill, white text — the one main action), `secondary` (oxford
outline), `ghost` (text only), `danger` (fire). Sizes: `sm` 32h, `md` 40h, `lg` 48h. States:
hover/active darken; focus = accent ring; disabled = platinum. Icon+label uses logical gap; icon sits
on the start side.

**Input / Select / Textarea** — 44px min height, `sm` radius, platinum border, oxford text, muted
placeholder; focus = accent ring + border. Labels above, `sm` weight 500. Errors: fire border + fire
helper text + icon. RTL: text-align start, caret behaves for Arabic; numeric fields may force LTR
digits where appropriate.

**Card** — surface bg, `lg` radius, `e1`, 24px padding. Optional header (h3) + body + footer actions
(actions align to the end/start per context).

**Chat bubble** — **AI bubbles on the right, user on the left** (RTL-natural, opposite of Western
apps). AI: surface/white bubble with a subtle jungle accent (avatar or start-border) signaling
intelligence. User: oxford-tinted bubble. `body-lg`, generous padding, `lg` radius with one squared
corner toward the speaker. Timestamps in `xs` muted. Typing indicator = three jungle dots.

**Quick-reply chips** — pill buttons under an AI message for suggested answers; `sm`, jungle outline,
fill on hover. Wrap to multiple lines; keyboard-navigable.

**CvCard** (hero component) — inline CV preview in chat. Collapsible sections (summary, experience,
education, skills, languages). AR/EN toggle (segmented control, top-start). Inferred skills carry a
small "AI" badge to distinguish from stated skills. Actions: Download PDF (primary), Customize
(secondary). Skeleton while generating.

**Match card** (recruiter) — candidate name, fit **score ring** (0–100, jungle→orange→fire by band),
top strengths, gaps, Saudization badge when applicable, contact button. Component scores as a small
bar breakdown. See §9.

**Badge** — `sm`/`xs` pills. Semantic: success/warning/error/info + neutral. Saudization badge = jungle
with a subtle mark; Nitaqat status badge uses the category color (§9).

**Toast** — top (mobile) / corner (desktop), auto-dismiss, semantic color start-border, `sm` text.

**Empty / loading / error states** — every list and async surface defines all three. Empty = friendly
illustration + one CTA (e.g., "ابدأ محادثتك مع لايت"). Loading = skeletons that match final layout, not
spinners, for content. Error = plain-language bilingual message + retry.

---

## 7. Motion

- Durations: `fast` 120ms (hover/press), `base` 200ms (enter/leave, toggles), `slow` 320ms (modal,
  page transitions). Easing: `ease-out` for enters, `ease-in` for exits.
- Chat: new messages fade+rise 200ms; typing indicator loops. CV generation: skeleton → content
  cross-fade. Keep it subtle — this is a professional tool.
- **Honor `prefers-reduced-motion`**: disable non-essential transforms, keep opacity fades minimal.

---

## 8. Iconography & imagery

- Icon set: **lucide-react** (consistent, open, RTL-friendly). Size 20/24. Icons inherit text color.
- **Mirror directional icons in RTL** (arrows, chevrons, back/next, send). Do **not** mirror
  non-directional icons (search, user, clock, checkmark, brand logo).
- Illustrations: simple, modern, Saudi-aware (avoid clichés). Never use copyrighted or stocky imagery;
  prefer abstract brand shapes in the palette.

---

## 9. Domain-specific patterns (Light)

**Saudization / Nitaqat** (see `nitaqat-rules` skill):
- Saudi-candidate badge in match results: jungle pill, "مرشح سعودي".
- Nitaqat status colors: Platinum/Green → jungle, Yellow → orange, Red → fire. Use as badge fill or
  status dot; always pair color with text (never color alone — accessibility).
- Nitaqat-boosted match: show "يحسّن النطاقات" note with the score, jungle accent.

**Fit score** — 0–100 ring/number, banded: 80–100 jungle, 60–79 orange, <60 fire. Always accompany the
number with the strengths/gaps text so it's not a bare number.

**Bilingual toggle** — segmented control (AR | EN); AR default. Placed top-start on CV/preview surfaces.

**Skill chips** — stated skills = solid jungle-tint; inferred skills = outline + "AI" micro-badge.

---

## 10. Key screens (layout intent)

- **Landing** — RTL hero: headline + subcopy + dual CTAs ("للباحثين عن عمل" primary, "لأصحاب العمل"
  secondary), product mockup to the start side, trust strip. Calm, spacious, one dominant green CTA.
- **Registration** — minimal single-column form (name, phone, city), big inputs, one primary button,
  reassurance copy ("مجاني تماماً").
- **Candidate chat** — full-screen, message list centered ~680px, AI right/user left, quick-reply chips,
  sticky composer at the bottom (bottom bar on mobile). CvCard appears inline when generated.
- **CV customization** — split: live CV preview (start side) + controls (templates, 6 themes + custom,
  AR/EN) on the end side; collapses to stacked on mobile with a bottom action bar.
- **Recruiter job post** — chat-style one-liner → generated post preview with edit + publish.
- **Match results** — ranked list of match cards, score rings, Saudization badges, filters minimal.
- **Dashboards** — collapsible sidebar + status cards + quick actions; overlay sidebar on mobile.

---

## 11. Do / don't

**Do:** use semantic tokens; logical CSS properties; one primary action per screen; skeletons over
spinners; bilingual + gender-aware copy from `lib/i18n`; verify RTL on every component.
**Don't:** hardcode hex or physical margins; introduce a new font/color without updating this doc;
mirror non-directional icons; use Orange for body text; ship a screen without empty/loading/error states;
let two screens use different button or card styling.

---

## 12. How this is enforced

- `frontend-engineer` builds against this doc + the `rtl-component` skill; `rtl-arabic-specialist`
  reviews RTL/Arabic and shadcn RTL behavior.
- Run the `design:design-critique` skill on new key screens and `design:accessibility-review` before a
  milestone's local-test handoff. Use `design:ux-copy` when wording microcopy.
- `code-reviewer` treats design-token/logical-property violations as should-fix findings.
