# Environment Setup

Copy this template into `.env.local` (gitignored — never committed). The secret-guard hooks
intentionally prevent Claude Code from reading or writing `.env*` files, so this doc is the
maintained template. Firebase project: `light-platform-8a089` (Firestore region `me-central1`).

```bash
# ── Gemini (server) ──────────────────────────────────────────────
# Google AI Studio key — used by lib/ai/call-gemini.ts
GEMINI_API_KEY=

# ── Firebase client SDK (browser-safe, from console → project settings) ──
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=light-platform-8a089.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=light-platform-8a089
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=light-platform-8a089.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# ── Firebase Admin SDK (server) ─────────────────────────────────
# Single-line JSON of the service-account key (console → service accounts → generate key).
FIREBASE_SERVICE_ACCOUNT_JSON=

# ── PDF rendering service ────────────────────────────────────────
# Local dev: run services/pdf (npm start) and point here. Cloud Run URL in production.
PDF_SERVICE_URL=http://localhost:8080

# ── M2 only (notifications) — not needed for Milestone 1 ────────
# RESEND_API_KEY=
# SENDGRID_API_KEY=
```

Minimum needed to run M1 in the browser: `GEMINI_API_KEY`, the 7 `NEXT_PUBLIC_FIREBASE_*` values,
`FIREBASE_SERVICE_ACCOUNT_JSON`, and `PDF_SERVICE_URL` (localhost is fine — see
`services/pdf/README.md`).
