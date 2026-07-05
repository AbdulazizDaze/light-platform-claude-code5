# Light PDF Service

Standalone Cloud Run service that renders bilingual (Arabic/English) CV PDFs from
already-validated CV JSON, using Express + Puppeteer (headless Chromium).

This service is isolated from the main Next.js app on purpose: Puppeteer bundles a full
Chromium binary, which exceeds Vercel's serverless function bundle size (50MB) and memory
(1024MB) limits. It runs on **Cloud Run** instead — up to 4GB memory, no bundle limit, scale-to-zero
when idle. See `docs/architecture.md` and `PRD.md §9.3`.

The Next.js `POST /api/pdf` route is a **thin proxy**: it forwards the request body to this
service (`PDF_SERVICE_URL`) and streams the PDF response back to the client. This service does
**not** talk to Gemini and does **not** own the strict CV Zod schema — it accepts a looser shape
and trusts the caller (the Next.js API route, which validates against `lib/schemas/cv.ts` /
the `cv-schema` skill) to have already produced well-formed data. Identity fields (name, phone,
email, city) are display-only header fields passed in by the proxy from the server-side profile;
this service does not re-derive or verify identity.

## Request contract

`POST /render`

```jsonc
{
  "cv": {
    "personal": { "name": "...", "title": { "en": "...", "ar": "..." }, "city": "...", "phone": "...", "email": "...", "linkedin_url": "..." },
    "professional_summary": { "en": "...", "ar": "..." },
    "education": [ { "institution": "...", "degree": "...", "field": "...", "start_year": 2019, "end_year": 2023, "gpa": 4.6, "achievements": ["..."] } ],
    "experience": [ { "company": "...", "title": { "en": "...", "ar": "..." }, "city": "...", "start_date": "2021", "end_date": "2022", "is_current": false, "description": "...", "achievements": ["..."] } ],
    "projects": [ { "name": "...", "description": "...", "technologies": ["..."], "url": "...", "highlights": ["..."] } ],
    "skills": [ { "name": "React", "level": 4, "category": "technical", "inferred": false } ],
    "languages": [ { "language": "Arabic", "proficiency": "Native" } ],
    "certifications": [ { "name": "...", "issuer": "...", "date": "2023", "url": "..." } ],
    "volunteer_work": ["..."]
  },
  "template": "classic",   // classic | modern | executive | minimal
  "theme": "oxford",       // named theme id, OR { "primary": "#hex", "accent": "#hex" }
  "locale": "ar"           // ar | en
}
```

Response: `200` with `Content-Type: application/pdf` (binary body). Sections with empty/missing
data are omitted from the render (e.g. no `certifications` → no Certifications heading).

Errors: `400` with `{ error: "invalid_request", issues: [...] }` on a malformed body (loose Zod
check — this is a defense-in-depth guard, not the CV's source of truth). `500` with
`{ error: "render_failed", message }` on a Puppeteer/render failure.

`GET /healthz` → `200 { "ok": true }`.

## Templates (PRD §18.A)

| Template | Style |
|---|---|
| `classic` | Centered name header, underlined section titles. Traditional/government/banking. |
| `modern` | Colored sidebar (contact, skills, languages, certifications) + main content column. Tech/startup/creative. |
| `executive` | Bold colored header bar, dense two-column body. Senior/management. |
| `minimal` | Ultra-clean, maximum whitespace, no rules — thin accent underline only. Design/consulting/academic. |

## Themes

6 named themes (`lib/themes.js`), print-safe, all pass AA contrast on white:

`oxford` (brand default: Oxford Blue + Jungle Green), `jungle`, `orange`, `slate`, `burgundy`, `teal`.

Custom colors: pass `theme: { primary: "#14213D", accent: "#22AE89" }` instead of a theme id.
Missing/invalid hex values fall back to the `oxford` default for that channel.

## Arabic typography

- **Noto Sans Arabic** (weights 400/500/600/700, Arabic + Latin subsets) is bundled as base64-embedded
  `@font-face` woff2 in `lib/base.js` — no network fetch or system font dependency at render time,
  so it works fully offline in Docker/Cloud Run. Files live in `fonts/` (OFL-licensed, safe to commit).
- `dir="rtl"` and `lang="ar"` are set on `<html>` when `locale === "ar"`; `dir="ltr"`/`lang="en"` otherwise.
- No `letter-spacing` is applied to Arabic text (breaks glyph joining); the `minimal` template's
  uppercase/letter-spaced section labels are explicitly suppressed for `dir="rtl"`.
- Arabic body copy uses a looser line-height (1.75) than Latin (1.5), per `docs/design-system.md §3`.
- Numerals (dates, phone, GPA) are wrapped in `.nums` (`direction: ltr; unicode-bidi: isolate;
  font-variant-numeric: tabular-nums`) so they stay legible and correctly ordered inside RTL flow.
- Bullet-list achievement lines use a flex `bullet` + `bullet-text` split (not an absolutely
  positioned `::before`) so long lines wrap correctly in narrow columns (executive/modern sidebar)
  in both RTL and LTR.

## Local run

```bash
cd services/pdf
npm install
npm start            # node server.js, listens on PORT (default 8080)
# or, for auto-reload during development:
npm run dev
```

Health check: `curl http://localhost:8080/healthz`

Set `PDF_SERVICE_URL=http://localhost:8080` in the Next.js app's `.env.local` so `/api/pdf` proxies
to this local instance during development.

### Smoke test

With the server running (see above, in a separate terminal/process):

```bash
npm run smoke
```

This posts the bundled `sample/sample-cv.json` through several template/theme/locale combinations
and writes the resulting PDFs to `sample/*.pdf` (gitignored), printing byte sizes. A healthy run
looks like:

```
[smoke] healthz OK
[smoke] results:
  OK   out-ar.pdf: ~90-95 KB
  OK   out-en.pdf: ~65-70 KB
  OK   out-modern-ar.pdf: ...
  OK   out-executive-en.pdf: ...
  OK   out-minimal-ar.pdf: ...
  OK   out-custom-theme-en.pdf: ...
```

Open the PDFs to visually confirm: Arabic glyph shaping/joining, RTL section order, correct
theme colors, and clean page breaks (no orphaned section headers at the bottom of a page).

## Docker

```bash
cd services/pdf
docker build -t light-pdf-service .
docker run --rm -p 8080:8080 light-pdf-service
curl http://localhost:8080/healthz
```

The `Dockerfile` uses `node:20-slim` + the standard Puppeteer Chromium system-dependency list
(`libnss3`, `libgtk-3-0`, etc.), installs deps with `npm install --omit=dev` (Puppeteer downloads
its own matching Chromium build at install time — do **not** set `PUPPETEER_SKIP_DOWNLOAD`), runs
as a non-root `pptruser`, and launches Chromium with `--no-sandbox --disable-setuid-sandbox`
(required in the container's restricted environment). Listens on `$PORT` (Cloud Run injects this;
defaults to `8080` for local `docker run`).

## Deploy notes (Cloud Run)

- Build & push the image, then deploy with enough memory/CPU for Chromium (2-4GB memory,
  1-2 vCPU is a safe starting point — right-size after load testing).
- Set `--concurrency` conservatively (Chromium pages are not cheap); a reused single browser
  instance with one page per request is fine for low concurrency, revisit if the service needs
  to handle many simultaneous renders — consider a small page pool at that point.
- Scale-to-zero (`--min-instances=0`) is fine given PDF generation is rate-limited to 5/min/uid
  upstream and is not latency-critical to the point of needing a warm instance.
- No secrets are required by this service (it does not call Gemini or Firestore) — it just needs
  to be reachable from the Vercel `/api/pdf` proxy via `PDF_SERVICE_URL`.

## Determinism

Given the same `{ cv, template, theme, locale }` input, output is byte-for-byte deterministic
except for PDF internal timestamps/IDs that Chromium's printer embeds — visually and structurally
identical on every render, which keeps renders reviewable/diffable in practice.

## Known blockers / deviations

None. `npm install` succeeded (Puppeteer downloaded its bundled Chromium to
`~/.cache/puppeteer/chrome` without issue), and the full smoke test (6 renders across all 4
templates, both locales, one custom-color theme) passed with visually-verified correct Arabic
shaping/RTL layout and correct theme application.

One intentional deviation from the root repo's stack table: this service pins `zod@^3` rather
than the root app's `zod@^4`, since `services/pdf` has its own isolated `package.json`/`node_modules`
per the architecture doc, and the request-validation code here was written against the Zod 3 API.
This has no effect on the app's Zod 4 usage — the two are never in the same dependency tree.
