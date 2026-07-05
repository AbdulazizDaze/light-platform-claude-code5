# Light — Product Requirements Document

**Version:** 2.0
**Date:** July 5, 2026
**Author:** Abdulaziz Aljandal
**Status:** Living Document

---

## 1. Executive Summary

Light is an AI-powered recruitment platform purpose-built for Saudi Arabia's job market. It replaces the traditional, form-heavy job application process with a natural conversational experience — candidates talk to an AI career consultant in Saudi dialect Arabic, and the platform generates a professional bilingual CV, builds their discoverable profile, and matches them with opportunities automatically.

The core thesis is simple: **job hunting should be passive.** Candidates create their profile once through a smart conversation, then opportunities find them — not the other way around.

Light serves two sides of the market simultaneously. For candidates (primarily fresh graduates and early-career professionals), it eliminates the friction of CV building, job searching, and application tracking. For recruiters (primarily SMBs without dedicated HR departments), it provides AI-generated job postings, smart candidate matching, and direct contact — no screening hundreds of resumes.

Both sides of the marketplace are developed together as a single unified product, ensuring candidates have real opportunities to match with from day one.

---

## 2. Problem Statement

### 2.1 For Job Seekers

The Saudi job market is rapidly growing under Vision 2030, with millions of young Saudis entering the workforce annually. Yet the job application experience remains broken in several ways.

**CV creation is a barrier, not a tool.** Most fresh graduates and early-career professionals struggle to produce a professional CV. They either pay for CV writing services, copy generic templates, or submit poorly formatted documents that undersell their actual abilities. The problem is compounded in a bilingual market where both Arabic and English CVs are expected.

**Job searching is exhausting and passive-aggressive.** Candidates spend hours on job boards, submitting applications into a void with no feedback. The process rewards persistence over quality, and the experience is psychologically draining — especially for fresh graduates who don't yet know how to position themselves.

**Skills go unrecognized.** A candidate who worked as a retail associate at Jarir Bookstore has customer service skills, sales experience, communication abilities, and goal-oriented work ethic — but most candidates don't know how to articulate these competencies. Valuable experience gets reduced to a single job title on a thin CV.

### 2.2 For Employers

**Screening is time-consuming.** Small and medium businesses — retail shops, restaurants, service companies, local enterprises — receive dozens or hundreds of applications for every opening. Without an HR department, the business owner or manager must manually review each one.

**Job descriptions are an afterthought.** Many SMBs post vague, poorly written job descriptions because crafting a professional bilingual posting is not their expertise. This attracts the wrong candidates and wastes everyone's time.

**Finding the right fit is luck.** Without matching technology, hiring decisions rely on whoever happened to apply rather than who is actually the best fit for the role.

**Saudization compliance is complex.** Every company operating in Saudi Arabia must meet Nitaqat requirements — minimum percentages of Saudi national employees. Tracking compliance and prioritizing Saudi hires adds overhead that most SMBs struggle with.

---

## 3. Vision & Mission

**Vision:** Become the default hiring infrastructure for Saudi Arabia's SMB market — where every qualified candidate is discoverable and every open role finds its match.

**Mission:** Revolutionize job hunting and hiring by using conversational AI to create perfect matches between candidates and employers. No forms, no searching — opportunities find you.

---

## 4. Target Market

### 4.1 Geography

Launch: Saudi Arabia — Riyadh, Jeddah, Dammam, and the top 15 Saudi cities.
Expansion: GCC (UAE, Kuwait, Bahrain, Qatar, Oman).

### 4.2 Candidate Segments

| Segment | Description | Size Estimate |
|---|---|---|
| Fresh Graduates | University graduates (ages 21-25) entering the job market for the first time | ~200K annually in Saudi Arabia |
| Career Switchers | Young professionals (ages 23-30) with 1-3 years experience looking to change fields | Large addressable segment |
| Part-time / Gig Workers | Students or young professionals seeking part-time, seasonal, or freelance work | Growing segment under Vision 2030 |
| Returnees | Professionals re-entering the workforce after a gap (particularly women under Vision 2030's female participation push) | Rapidly growing |

### 4.3 Employer Segments

| Segment | Description | Why Light |
|---|---|---|
| SMBs (5-50 employees) | Retail, hospitality, services, local companies without HR departments | Can't afford recruiting tools; need simple, fast hiring |
| Growing Startups | Saudi tech and service startups scaling their teams | Need volume hiring without overhead |
| Franchise Operations | Fast food, retail chains, service franchises with multiple locations | High turnover, repetitive hiring needs |

---

## 5. Product Overview

### 5.1 Core Value Propositions

**For Candidates:**

- **Conversational CV building** — no forms, no templates. Talk naturally about your experience and skills; the AI builds your CV. Alternatively, upload an existing CV and the AI improves it.
- **Implicit skill inference** — the AI recognizes that "I worked at Jarir" means customer service, sales, communication, and more. Candidates don't need to know HR terminology.
- **Bilingual output** — every CV is generated in both Arabic and English simultaneously, formatted for the Saudi market.
- **Passive job hunting** — create your profile once, then wait for matches and recruiter calls instead of endlessly applying.
- **Professional quality** — AI-generated professional summaries, properly structured achievements, and polished formatting that meets recruiter expectations.

**For Recruiters:**

- **One-line to job post** — describe what you need in plain language; the AI generates a complete bilingual job posting.
- **Pre-matched candidates** — instead of screening hundreds of applications, see only the candidates that match your requirements.
- **Direct contact** — view candidate phone numbers and emails, and contact qualified candidates directly.
- **Nitaqat awareness** — the platform understands Saudization requirements and helps recruiters prioritize hires that improve their Nitaqat standing.
- **Zero learning curve** — no dashboards to learn, no filters to configure. Just describe what you need.

### 5.2 Key Innovation: Passive Job Hunting

The fundamental innovation of Light is inverting the job search model. Traditional platforms require candidates to actively search, filter, and apply. Light makes candidates discoverable — they create their profile once through a conversation, and the platform continuously matches them with relevant opportunities. Candidates receive calls and interview invitations while they focus on preparing, not searching. Light works 24/7 matching in the background.

---

## 6. User Journeys

### 6.1 Candidate Journey

```
Landing Page → Create Profile (name, phone, city) → Chat with Light AI
→ Upload existing CV  OR  chat from scratch
→ AI builds/improves CV through conversation (3-8 messages)
→ AI generates professional bilingual CV
→ Candidate reviews CV in-chat (CvCard) → Downloads PDF or customizes
→ Profile becomes active and discoverable
→ Light matches candidate with job posts in the background
→ Candidate receives push notifications / email when matched
→ Recruiter contacts candidate directly → Interview
```

**Detailed flow:**

1. **Landing page** — candidate sees the value proposition ("انشئ ملفك الشخصي مرة واحدة من خلال محادثة ذكية — ثم دع الفرص تجد طريقها إليك") and clicks "للباحثين عن عمل."
2. **Profile creation** — minimal form: name, phone number, and city (Saudi cities dropdown). Firebase anonymous auth creates the account, with the phone number stored in Firestore as the persistent identifier for account recovery and notifications.
3. **Chat entry** — the candidate enters the AI chat and is presented with two paths: **upload an existing CV** (PDF) for AI-powered analysis and improvement, or **start a fresh conversation** to build a new CV from scratch. Both paths lead to the same outcome — a complete, professional bilingual CV.
4. **AI conversation** — Light greets the candidate by name in Saudi dialect Arabic. The AI is a career consultant, not a chatbot. For fresh conversations, it asks about current status (student, graduate, working), education, work experience (even part-time, internships, volunteering), skills, languages, and career goals. For uploaded CVs, it analyzes the existing content, identifies gaps and improvement areas, and asks targeted follow-up questions. It acknowledges each answer with specific feedback before asking the next question.
5. **Skill inference** — the AI automatically extracts implicit skills from stated experience. A retail associate gains: customer service, sales, communication, working under pressure, goal achievement, POS systems, inventory awareness. The candidate doesn't need to list these manually.
6. **CV generation** — when minimum thresholds are met (education complete, 6+ skills, languages with proficiency levels, target role), the AI generates a complete bilingual CV as structured JSON. The CV appears inline in the chat as an interactive card (CvCard).
7. **CV review & download** — the candidate can expand CV sections, toggle Arabic/English, download as PDF, or navigate to the full CV customization page with template and color theme options.
8. **Profile activation** — once the CV is generated, the candidate's profile becomes active in the matching pool. No further action required.
9. **Matching & notifications** — Light continuously matches active profiles against new job posts. Candidates receive browser push notifications (via Firebase Cloud Messaging) and email alerts for relevant matches.

### 6.2 Recruiter Journey

```
Landing Page → Create Profile (name, company, phone, city)
→ Describe Job Need → AI generates bilingual job posting (1-3 messages)
→ Recruiter reviews and publishes
→ Light shows matched candidates immediately (ranked by fit score)
→ Recruiter views candidate profiles (phone + email visible)
→ Recruiter contacts candidates → Schedules interviews
```

**Detailed flow:**

1. **Landing page** — recruiter clicks "لأصحاب العمل."
2. **Profile creation** — name, company name, phone number, city. Company Nitaqat category is optionally provided for Saudization-aware matching.
3. **AI job posting** — recruiter describes the role in plain language ("I need a sales associate for my Riyadh store, full-time, some English required"). The AI generates a complete bilingual job posting with title, description, responsibilities, requirements, skills, benefits, and salary guidance.
4. **Review & publish** — recruiter reviews the AI-generated posting, makes edits if needed, and publishes. The post enters the matching pool.
5. **Matched candidates** — Light immediately shows candidates whose profiles match the job requirements, ranked by fit score with explanations of strengths and gaps. Saudi nationals are flagged for Nitaqat-aware recruiters.
6. **Contact & interview** — recruiter views the candidate's full profile including phone number and email. Recruiter contacts candidates directly to schedule interviews.

### 6.3 Contact Mechanism

Recruiters can view candidate contact information (phone number and email) directly on the matched candidate profile. This is the simplest and fastest path to connecting the two sides.

**Privacy evolution:** In a future update, candidate personal information (phone, email) will be covered by a blur layer. Only recruiters with an active subscription will be able to reveal contact details. This creates a natural monetization lever while protecting candidate privacy at scale.

---

## 7. Feature Set

Light is developed as a unified product — all features ship together rather than in sequential phases.

### 7.1 Candidate Features

| Feature | Status | Notes |
|---|---|---|
| Landing page | Done | Modern design with product mockup, dual CTAs |
| Candidate registration | Done | Name, phone number, city. Anonymous Firebase auth |
| AI chat (CV building) | Done | Gemini 2.5 Flash, Saudi dialect, skill inference, 3-8 message flow. Two entry paths: upload existing CV or chat from scratch |
| CV generation (JSON) | Done | Bilingual, Zod-validated, inline CvCard preview |
| CV PDF download | Done | Server-side PDF rendering, perfect Arabic typography |
| CV customization page | Done | 4 templates (classic, modern, executive, minimal), 6 color themes + custom colors, AR/EN toggle |
| PDF CV upload & improvement | Done | Upload existing PDF, AI analyzes and suggests improvements |
| Session persistence | Done | Chat history saved to Firestore, returning users see their CV |
| Candidate dashboard | Done | Dashboard with status cards and quick actions |
| Optional LinkedIn profile | Planned | Candidates can link their LinkedIn profile URL for social proof |
| Push notifications (FCM) | Planned | Browser push notifications for match alerts via Firebase Cloud Messaging (free) |
| Email notifications | Planned | Match alerts and weekly profile digest via Resend/SendGrid (free tier) |
| Profile freshness nudges | Planned | "Your profile hasn't been updated in 30 days" prompts via email |
| Mobile responsive | Done | Full RTL support, mobile-optimized layouts |

### 7.2 Recruiter Features

| Feature | Status | Notes |
|---|---|---|
| Recruiter registration | Scaffolded | Registration form, company profile setup |
| AI job post generator | Done (API) | Conversational job description → bilingual job posting |
| Job management dashboard | Scaffolded | List, edit, pause, close job postings |
| Candidate contact access | Planned | View candidate phone and email on matched profiles |
| Nitaqat integration | Planned | Company Nitaqat category, Saudi candidate flagging, compliance tracking |

### 7.3 Platform Features

| Feature | Status | Notes |
|---|---|---|
| Matching engine | Planned | Hybrid approach: hard filters + embedding-based soft scoring (see Section 9.5) |
| Match notifications | Planned | Real-time notifications for both candidates and recruiters |
| Candidate discovery | Planned | Recruiters browse and search matched candidates |

### 7.4 Future Enhancements

| Feature | Description |
|---|---|
| WhatsApp channel | AI conversation, CV delivery, match notifications, recruiter-candidate communication via WhatsApp Business API. Saudi Arabia has 95%+ WhatsApp penetration — this becomes a primary channel when ready. |
| Contact info blur layer | Candidate personal info hidden behind subscription paywall for recruiters |
| Smart recommendations | AI-powered job recommendations for candidates based on profile and behavior |
| Application tracking | Full lifecycle tracking: matched → contacted → interviewed → offered → hired |
| Analytics dashboard | Hiring metrics for recruiters, market insights for candidates |
| Mobile app | Native iOS/Android apps |
| GCC expansion | UAE, Kuwait, Bahrain, Qatar, Oman — localized content and job markets |
| Enterprise plans | Bulk hiring tools, team accounts, branded company pages, API access |
| Skills verification | Integration with credential verification services |
| Interview scheduling | Built-in calendar and video interview scheduling |
| Salary benchmarking | Market salary data and negotiation guidance |

---

## 8. Saudization (Nitaqat) Integration

Nitaqat is the Saudi government's workforce nationalization program — every company must maintain a minimum percentage of Saudi national employees based on their industry and size category. This is the #1 hiring pressure for SMBs in Saudi Arabia and a major product differentiator for Light.

### 8.1 Candidate Side

- **Nationality field** — candidate profiles include nationality (Saudi / non-Saudi). Collected during registration or inferred from conversation.
- **Saudization badge** — Saudi candidates are flagged with a visible indicator in match results, making them easy to identify for Nitaqat-conscious recruiters.

### 8.2 Recruiter Side

- **Company Nitaqat category** — recruiters optionally provide their Nitaqat color (Platinum, Green, Yellow, Red) and company size/industry during onboarding.
- **Nitaqat-aware matching** — when a recruiter's Nitaqat status is Yellow or Red, the matching engine boosts Saudi candidates in the rankings to help the company improve compliance.
- **Compliance guidance** — the AI job post generator flags when a role description might attract primarily non-Saudi candidates and suggests adjustments.
- **Hire impact preview** — show recruiters how hiring a specific candidate (Saudi vs. non-Saudi) would affect their Nitaqat ratio.

### 8.3 Why This Matters

Most SMBs in Saudi Arabia track Nitaqat compliance manually or not at all. Light making this automatic and integrated into the hiring workflow is a feature no competitor offers. For a business owner who is one hire away from dropping to Red status (which triggers penalties and visa freezes), Light flagging "this Saudi candidate matches your role and improves your Nitaqat" is genuinely valuable.

---

## 9. Technical Architecture

### 9.1 Stack Overview

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR + API routes in one codebase, React ecosystem |
| Language | TypeScript (strict mode) | Type safety across client and server |
| Styling | Tailwind CSS 3.4 | Utility-first, RTL-compatible, rapid iteration |
| AI | Google Gemini 2.5 Flash | Fast, multilingual, strong Arabic support, cost-effective |
| Auth | Firebase Authentication | Anonymous auth for zero-friction onboarding |
| Database | Cloud Firestore | Real-time sync, serverless scaling, security rules |
| Storage | Firebase Storage | CV PDFs, avatars, uploaded documents |
| PDF Rendering | Cloud Run + Puppeteer | Dedicated service for PDF rendering — no Vercel size/memory limits |
| Validation | Zod 4 | Runtime schema validation for AI-generated JSON |
| Push Notifications | Firebase Cloud Messaging (FCM) | Free browser push notifications |
| Email | Resend or SendGrid | Match alerts, profile digests (free tier) |
| Hosting | Vercel | Serverless, edge functions, CDN, Next.js native |
| Analytics | Google Analytics (GA4) | User behavior tracking, conversion funnels |

### 9.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                          │
│     Next.js App Router — React 18 — Tailwind CSS — RTL          │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ Landing  │  │  Auth    │  │ Chat UI  │  │  CV Page         │ │
│  │  Page    │  │  Page    │  │ (Cand.)  │  │  + Recruiter UI  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
│       │              │             │               │             │
│       └──────────────┴─────────────┴───────────────┘             │
│                          │                                       │
│              AuthContext (Firebase Auth)                          │
│              authedFetch() (Token attach)                         │
│              FCM Service Worker (Push Notifications)              │
└──────────────────────────┬───────────────────────────────────────┘
                           │ HTTPS + Bearer Token
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Server (API Routes)                         │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │ POST /chat │  │POST /match │  │POST        │  │ POST      │ │
│  │            │  │            │  │/job-chat   │  │ /notify   │ │
│  │ • Gemini   │  │ • Scoring  │  │            │  │           │ │
│  │ • Zod val. │  │ • Nitaqat  │  │ • Gemini   │  │ • FCM     │ │
│  │ • CV gen   │  │ • Ranking  │  │ • Job gen  │  │ • Email   │ │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬─────┘ │
└────────┼───────────────┼───────────────┼───────────────┼────────┘
         │               │               │               │
         ▼               ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐
│  Gemini AI   │  │  Firestore   │  │  Cloud Run   │  │  FCM /  │
│  (Google)    │  │              │  │              │  │  Email  │
│              │  │  users/      │  │  Puppeteer   │  │  Service│
│  2.5-flash   │  │  cand_prof/  │  │  PDF render  │  │         │
│  flash-latest│  │  chat_sess/  │  │  A4 + Arabic │  │  Resend │
│  2.0-flash   │  │  job_posts/  │  │  Auto-scale  │  │  or     │
│  (fallback)  │  │  matches/    │  │              │  │ SendGrid│
└──────────────┘  │  notifs/     │  └──────────────┘  └─────────┘
                  │  companies/  │
                  └──────────────┘
```

### 9.3 PDF Rendering Service

PDF generation runs on a **dedicated Google Cloud Run service** rather than Vercel serverless functions. Puppeteer requires headless Chromium which exceeds Vercel's 50MB bundle limit and 1024MB memory cap. Cloud Run provides:

- No bundle size limits (Docker container with full Chromium)
- Up to 4GB memory per instance
- Auto-scaling to zero when idle (pay only for usage)
- No cold-start timeout pressure (configurable up to 60 minutes)
- Same GCP project as Firebase for low-latency internal communication

The Vercel API route acts as a thin proxy: receives the PDF request, forwards to Cloud Run, and streams the response back to the client.

### 9.4 AI Architecture

The AI layer is the heart of Light. It uses a carefully engineered prompt system to maintain consistent behavior across conversations.

**Prompt Architecture:**

- **Base prompt** (~7K tokens) — static, cacheable across requests. Defines Light's identity, conversation rules, data requirements, skill inference maps, CV format specification, and quality standards.
- **User context** (dynamic, per-request) — injects the user's name, gender (for Arabic grammar), message count (for pacing), and session type.
- **Model fallback chain** — `gemini-2.5-flash` → `gemini-flash-latest` → `gemini-2.0-flash`. Automatic retry on model errors.

**Key AI behaviors:**

1. **Saudi dialect Arabic** — not MSA (Modern Standard Arabic), not Egyptian, not Levantine. Conversational Saudi dialect with professional undertone.
2. **Implicit skill inference** — detailed mapping tables for 9+ industries (retail, hospitality, tech, marketing, accounting, engineering, healthcare, education, HR). The AI extracts 5-10 skills from a single job mention. Inferred skills are tagged as `inferred: true` in the CV data model to distinguish from self-stated skills.
3. **Professional summary generation** — 3-4 sentences mentioning the candidate by name, their university, key skills, and career aspirations. Not generic filler.
4. **Pacing control** — dynamic urgency injection at message 8+, forced CV production at message 14+ to prevent infinite conversations.
5. **Gender-aware Arabic** — automatically uses masculine or feminine verb conjugations based on the candidate's gender profile.
6. **CV JSON validation** — AI output is parsed and validated against a Zod schema before being accepted. Invalid output triggers a retry.

### 9.5 Matching Engine Architecture

The matching engine is the core intelligence that connects candidates with job opportunities. It uses a hybrid approach: deterministic hard filters for deal-breaker criteria, followed by embedding-based soft scoring for nuanced fit assessment.

#### 9.5.1 Design Philosophy

Matching runs as an **event-driven background process**, not a real-time query. Two events trigger matching:

1. **New job post published** — the engine scores all active candidate profiles against the new job and creates match records for the top results.
2. **New candidate profile activated** — the engine scores all active job posts against the new candidate and creates match records for the top results.

This approach avoids expensive on-demand scoring and ensures both sides of the marketplace receive matches immediately.

#### 9.5.2 Hard Filters (Pass/Fail)

Hard filters are binary — a candidate either passes or is eliminated. These represent non-negotiable deal-breakers from both sides. Hard filters run first as cheap Firestore queries before any AI or embedding computation.

| Filter | Logic |
|---|---|
| Location | Candidate's preferred cities overlap with the job's city, OR candidate is willing to relocate |
| Language | Candidate meets the minimum language requirements listed in the job post |
| Job type | Candidate's preferred job types (full-time, part-time, contract, internship) include the job's type |
| Work arrangement | Candidate's preferred work arrangements (remote, on-site, hybrid) include the job's arrangement |

A candidate must pass **all four** hard filters to proceed to soft scoring. This eliminates clearly incompatible matches at zero API cost.

#### 9.5.3 Soft Scoring (Weighted, 0–100)

Candidates who pass the hard filters receive a composite soft score from five weighted dimensions:

| Dimension | Weight | Method |
|---|---|---|
| Skills similarity | 35% | Cosine similarity between candidate profile embedding and job post embedding (Gemini `text-embedding-004`, 768 dimensions) |
| Experience relevance | 30% | Rule-based scoring: years of experience vs. requirement, industry overlap, role title similarity, recency weighting (recent experience scored higher) |
| Education fit | 15% | Degree level match (exact, over-qualified, under-qualified), field relevance to the role |
| Soft preferences | 10% | Industry preference alignment, benefits match, company size preference, growth/stability preference |
| Profile quality | 10% | Profile completeness score (0–100), freshness (days since last update), number of verified skills vs. inferred skills |

**Total score = Σ (dimension_score × weight) × nitaqat_multiplier × freshness_boost**

#### 9.5.4 Embedding Strategy

Both candidate profiles and job posts are converted into 768-dimensional embedding vectors using **Gemini `text-embedding-004`**.

**Candidate embedding input** — a structured text summary generated from the candidate's profile:

```
[Professional Summary EN] | Skills: [skill1, skill2, ...] | Experience: [title at company (duration), ...] | Education: [degree in field from institution] | Industries: [preferred industries] | Looking for: [job types, work arrangements]
```

**Job post embedding input** — a structured text summary generated from the job post:

```
[Job Title EN] | [Description EN] | Required Skills: [skill1, skill2, ...] | Experience: [level] | Industry: [industry] | Type: [job type] | Arrangement: [work arrangement]
```

**Embedding lifecycle:**
- Generated once when a profile or job post is created/updated
- Stored directly in Firestore alongside the document (768 floats ≈ 3KB per document)
- Re-generated when the source document changes materially (new skills, new experience, updated description)
- Cosine similarity computed in the matching function — no external vector database needed at early scale

At scale (>50K active profiles), migration to a dedicated vector store (Pinecone, Weaviate, or Vertex AI Vector Search) would be considered for sub-100ms query performance.

#### 9.5.5 Nitaqat Boost

When a recruiter's company has a Nitaqat status of **Yellow** or **Red**, Saudi candidates receive a **1.15× multiplier** on their total score. This means a Saudi candidate with a raw score of 70 would be boosted to 80.5, potentially moving them above non-Saudi candidates with marginally higher raw scores.

The boost is:
- Visible to the recruiter — match cards show "يحسّن النطاقات" (Improves Nitaqat) alongside the match explanation
- Applied only when the company's Nitaqat status warrants it (Yellow or Red)
- Capped — the boost cannot push a score above 100
- Logged in the match record (`nitaqat_boost: true`) for analytics and fairness auditing

#### 9.5.6 Match Explanation

Every match includes a structured explanation — not just a number. This builds trust and helps recruiters make faster decisions.

```json
{
  "total_score": 82,
  "strengths": [
    "مهارات خدمة العملاء والمبيعات تتوافق بشكل ممتاز مع المتطلبات",
    "خبرة سنتين في قطاع التجزئة مباشرة",
    "يتقن العربية والإنجليزية"
  ],
  "gaps": [
    "لا توجد خبرة في إدارة الفريق (مطلوبة كميزة إضافية)"
  ],
  "nitaqat_note": "مرشح سعودي — التوظيف يحسّن تصنيف النطاقات",
  "component_scores": {
    "skills": 88,
    "experience": 79,
    "education": 72,
    "preferences": 85,
    "profile_quality": 91
  }
}
```

Explanations are generated by the matching function using template-based logic (not an LLM call per match), keeping costs at zero.

#### 9.5.7 Fairness Constraints

To prevent gaming and ensure equitable distribution:

- **Max 10 active match slots per candidate** — a candidate appears in at most 10 active (unresolved) match records at any time. This prevents popular candidates from being overwhelmed and ensures less popular candidates still appear in results.
- **No duplicate matches** — a candidate-job pair can only have one active match record.
- **Recruiter diversity** — a candidate's 10 match slots should ideally come from at least 5 different recruiters/companies.

#### 9.5.8 Cold-Start Handling

New profiles and job posts face the cold-start problem — they have no interaction history to learn from.

**Freshness boost:** New candidate profiles (first 14 days) receive a **1.1× multiplier** that decays linearly to 1.0× over the 14-day window. This ensures new candidates appear in match results immediately instead of being buried behind established profiles.

```
freshness_boost = 1.0 + (0.1 × max(0, 14 - days_since_creation) / 14)
```

- Day 0: 1.10×
- Day 7: 1.05×
- Day 14: 1.00× (no boost)

**New job posts:** When a new job is published, the matching engine immediately scores all active candidate profiles against it. This provides the recruiter with instant match results instead of waiting for gradual matching.

#### 9.5.9 Feedback Loop

The matching engine improves over time by tracking the full hiring funnel:

```
Match Created → Recruiter Views Profile → Recruiter Contacts Candidate → Interview → Hire
```

Each stage transition is tracked in the match record's status field. Quarterly analysis of successful hires (status = `hired`) vs. rejected matches (status = `rejected`) informs weight adjustments:

- If highly-scored matches are consistently rejected, the overweighted dimension is identified and reduced
- If lower-scored matches lead to hires, the underweighted dimension is identified and increased
- Weight changes are small (±2-3% per quarter) and logged for auditability

This is a manual quarterly review process initially, not an automated ML pipeline. Automation is a future optimization.

#### 9.5.10 Technical Implementation

```
Trigger: Firestore onCreate / onUpdate (job_posts or candidate_profiles)
    │
    ▼
Hard Filter Query (Firestore compound query)
    │ Filter by: city, language, job_type, work_arrangement
    │ Returns: candidate UIDs that pass all filters
    │
    ▼
Batch Embedding Retrieval
    │ Read embedding_vector from each passing candidate
    │ Read embedding_vector from the job post
    │
    ▼
Soft Score Computation (in-memory)
    │ cosine_similarity(candidate_embedding, job_embedding) → skills_score
    │ rule_based_scoring() → experience, education, preferences, quality
    │ weighted_sum() → raw_score
    │ apply nitaqat_boost if applicable
    │ apply freshness_boost if applicable
    │
    ▼
Top-N Selection
    │ Sort by final_score DESC
    │ Take top 10 matches per job post (respecting candidate slot limits)
    │
    ▼
Match Record Creation (Firestore batch write)
    │ Write match documents with scores, explanations, status
    │
    ▼
Notification Dispatch
    │ FCM push + email to matched candidates and recruiter
```

**Cost analysis:** Hard filters are Firestore reads (covered by free tier at early scale). Embedding generation costs ~$0.00001 per embedding via Gemini `text-embedding-004`. Cosine similarity is pure math — no API cost. The only significant cost is embedding generation, which happens once per profile/job creation, not per match computation.

### 9.6 Notification Architecture

Light uses two free notification channels to keep users engaged:

**Firebase Cloud Messaging (FCM) — browser push notifications:**
- Free, unlimited, already part of the Firebase stack
- Service worker registers on first visit after CV generation
- Notification types: new match, recruiter viewed your profile, profile freshness reminder
- Works even when the user isn't on the Light website

**Email notifications (Resend or SendGrid):**
- Free tier: 100 emails/day (Resend) or 100/day (SendGrid)
- Types: match alerts, weekly profile digest, profile freshness nudges ("your profile hasn't been updated in 30 days")
- Requires email address — collected during registration (optional) or during conversation

**Future: WhatsApp Business API**
- Saudi Arabia has 95%+ WhatsApp penetration — this will become the primary notification channel
- Conversation-based pricing: ~$0.02-0.03 per utility notification, first 1,000 user-initiated conversations/month free
- Estimated cost at 5,000 active users: ~$100-200/month
- Will enable: match notifications, profile update reminders, and potentially the full AI conversation within WhatsApp

### 9.7 Data Models

**Core collections and their relationships:**

```
users/{userId}
├── uid, name, email (optional), phone, role, gender, city
├── nationality (saudi|non_saudi)
├── linkedin_url (optional)
├── lang_pref (ar|en)
├── fcm_token (for push notifications)
├── notification_prefs (push, email)
└── created_at, updated_at

candidate_profiles/{userId}
├── personal (name, email, phone, city, nationality, gender, linkedin_url, portfolio_url, github_url)
├── professional_summary {en, ar}
├── education[] (institution, degree, field, start_year, end_year, gpa, achievements)
├── experience[] (company, title, city, start_date, end_date, is_current, description, achievements[])
├── projects[] (name, description, technologies[], url, highlights[])
├── skills[] (name, level 1-5, category, inferred: boolean)
├── languages[] (language, proficiency)
├── certifications[] (name, issuer, date, url)
├── volunteer_work[]
├── preferences (job_type[], work_arrangement[], cities[], industries[], availability)
├── embedding_vector (768-dim float array, generated from profile summary via Gemini text-embedding-004)
├── cv_template, cv_color_theme, cv_custom_colors
├── profile_completeness (0-100)
└── last_active, profile_freshness_score

chat_sessions/{userId}
├── messages[] (id, role, content, quick_replies[], timestamp)
├── status (active|completed|abandoned)
├── type (new|returning|cv_upload)
└── cv_data (full CV JSON when generated)

companies/{userId}
├── name, city, industry, size_category
├── nitaqat_category (platinum|green|yellow|red)
├── saudi_employee_count, total_employee_count
└── created_at, updated_at

job_posts/{jobId}
├── recruiter_uid, company_name
├── title {en, ar}, description {en, ar}
├── city, job_type, work_arrangement, experience_level
├── responsibilities[], requirements[], required_skills[]
├── salary_min, salary_max, positions_count, benefits[]
├── saudi_preferred (boolean — Nitaqat flag)
├── embedding_vector (768-dim float array, generated from job description via Gemini text-embedding-004)
└── status (draft|active|closed|expired|paused)

matches/{matchId}
├── candidate_uid, job_id
├── total_score, component_scores (skills, education, experience, location, preferences, language)
├── nitaqat_boost (boolean — candidate is Saudi and helps Nitaqat)
├── explanation, strengths[], gaps[]
└── status (new|viewed|shortlisted|rejected|contacted)

notifications/{notifId}
├── uid, type, title, message
├── channel (push|email)
├── related_id, read
└── created_at
```

### 9.8 Security & Privacy Model

- **Authentication:** Firebase Anonymous Auth — zero friction, no passwords. Phone number stored in Firestore serves as the persistent identifier. Account is tied to the device session; phone number enables future account recovery.
- **Authorization:** Firestore Security Rules enforce owner-only access for personal data. Job posts and companies are readable by all authenticated users. Matches are readable by both the candidate and the recruiter involved.
- **Candidate contact visibility:** Recruiters can currently view candidate phone numbers and emails on matched profiles. In a future update, contact information will be hidden behind a blur layer — only recruiters with an active subscription can reveal it.
- **Rate limiting:** In-memory per-UID buckets — 20 requests/minute for chat, 5 requests/minute for PDF generation. Periodic cleanup prevents memory leaks.
- **Identity integrity:** User identity fields (name, gender, email, phone) are read from the server-side Firestore profile, not the client request body. This prevents spoofing.
- **Input validation:** All AI-generated CV data is validated against a Zod schema before storage. The schema blocks injection of identity fields (uid, role, created_at).

---

## 10. Design System

### 10.1 Brand Identity

**Name:** Light (لايت)
**Tagline:** Where Opportunities Find You
**Personality:** Professional but approachable. Modern but not cold. Saudi-first but globally aware.

### 10.2 Colors

| Token | Hex | Usage |
|---|---|---|
| Oxford Blue | `#14213D` | Primary text, dark backgrounds, navbar CTA |
| Jungle Green | `#22AE89` | Primary action, AI identity, success states, highlights |
| Brand Orange | `#FCA311` | Secondary accent, warnings, attention-grabbing elements |
| Fire Red | `#D62828` | Error states, destructive actions, urgent alerts |
| Platinum | `#E3E3E3` | Borders, dividers, disabled states |

### 10.3 Typography

| Font | Usage |
|---|---|
| Alexandria | Primary — headings, body text, UI elements. Arabic-optimized with Latin support. |
| Readex Pro | Secondary — code blocks, data tables, technical content |
| Noto Sans Arabic | CV PDF rendering — full Arabic glyph coverage for print |

### 10.4 Layout Principles

- **RTL-first:** All layouts are right-to-left by default (`dir="rtl"` on the root HTML element).
- **Chat convention:** AI messages bubble from the right, user messages from the left (opposite of Western chat apps — natural for RTL reading).
- **Full-screen chat:** The chat and CV pages render without sidebar navigation for an immersive, focused experience.
- **Mobile-responsive:** All components adapt to mobile viewports. Bottom action bars on mobile, sidebar collapses to overlay.

---

## 11. Success Metrics

### 11.1 Candidate KPIs

| Metric | Target | Measurement |
|---|---|---|
| Registration → CV completion rate | >60% | % of registered users who complete a CV |
| Average messages to CV generation | 4-6 messages | Median message count per completed session |
| CV download rate | >40% | % of generated CVs that are downloaded as PDF |
| Profile completeness score | >75% average | Mean `profile_completeness` across active profiles |
| Session abandonment rate | <30% | % of started sessions that end without CV generation |
| 30-day return rate | >20% | % of users who return to edit or update their CV |
| Push notification opt-in rate | >50% | % of users who accept browser push notifications |

### 11.2 Recruiter KPIs

| Metric | Target | Measurement |
|---|---|---|
| Recruiter activation | >50% of registered recruiters post at least 1 job | Active recruiter rate |
| Job post completion rate | >70% | % of started job chats that result in a published post |
| Match acceptance rate | >30% | % of presented matches that recruiters act on (view profile) |
| Time to first contact | <48 hours | Median time from match to recruiter contacting candidate |
| Candidate response rate | >60% | % of contacted candidates who respond |

### 11.3 North Star Metric

**Successful hires facilitated per month.** This is the ultimate measure of whether Light is delivering on its promise: connecting the right people with the right opportunities.

---

## 12. Competitive Landscape

### 12.1 Direct Competitors (Saudi Market)

| Competitor | Positioning | Light's Advantage |
|---|---|---|
| LinkedIn | Professional networking, job board | Light is conversational, Arabic-first, and focuses on the underserved SMB segment. LinkedIn is overwhelming for fresh graduates. |
| Bayt.com | Traditional job board (MENA) | Form-heavy, no AI, no matching intelligence. Light removes the application friction entirely. |
| Sabbar | Saudi gig economy platform | Focused on hourly/part-time work. Light serves the full employment spectrum. |
| Hirect | Chat-based hiring (global) | Not localized for Saudi Arabia, no Arabic AI, no bilingual CV generation. |

### 12.2 Competitive Advantages

1. **Conversational interface** — no complex forms or lengthy applications
2. **Proactive matching** — Light does the searching, not the user
3. **Speed** — from conversation to interview-ready CV in minutes, not hours
4. **Simplicity** — designed for ease of use, not HR departments
5. **Bilingual AI** — native Arabic and English support, Saudi dialect
6. **SMB-focused** — priced and designed for businesses without HR teams
7. **Skill inference** — recognizes implicit competencies that candidates can't articulate themselves
8. **Nitaqat integration** — helps recruiters meet Saudization requirements, a feature no competitor offers

---

## 13. Revenue Model

### 13.1 Freemium Foundation

The candidate experience is and will remain free. Monetization comes from the recruiter/employer side.

### 13.2 Revenue Streams

| Stream | Model | Timeline |
|---|---|---|
| Basic Job Posting | Free (limited to 3 active posts) | Launch |
| Candidate Contact Reveal | Subscription to unlock blurred contact info (phone/email) on matched candidates | Post-launch |
| Premium Job Posting | Per-post fee for priority visibility and unlimited active posts | Post-launch |
| Nitaqat Dashboard | Premium feature for Nitaqat tracking and compliance reporting | Post-launch |
| Enterprise Plans | Bulk hiring tools, branded company pages, team accounts, API access | Growth |
| Featured Listings | Promoted job posts with enhanced visibility | Growth |

---

## 14. Go-to-Market Strategy

### 14.1 University Partnerships

Light's primary candidate segment is fresh graduates. Saudi universities have career services offices that are often underfunded and understaffed. Light will partner with universities to become the recommended CV-building tool for graduating students, creating a predictable, high-quality candidate pipeline with near-zero customer acquisition cost.

Target initial partners: King Saud University (Riyadh), King Abdulaziz University (Jeddah), King Fahd University of Petroleum and Minerals (Dhahran).

### 14.2 HRDF / Tawteen Integration

The Human Resources Development Fund (HRDF) runs employment programs for Saudi nationals, including training and job placement. Connecting Light with HRDF programs would provide both candidate volume and institutional credibility.

### 14.3 SMB Recruiter Acquisition

- Partner with Chambers of Commerce in Riyadh, Jeddah, and Dammam for recruiter outreach
- Offer free onboarding for founding employers (first 50-100 companies)
- The Nitaqat integration is a strong hook — "Light helps you stay green"

---

## 15. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| AI generates inaccurate or hallucinated CV content | High | Medium | Zod validation, mandatory follow-up questions, inferred skills tagged separately |
| Low recruiter adoption | High | Medium | Free tier, zero-friction onboarding, founding employer program, Nitaqat hook |
| Firebase scaling costs at volume | Medium | Medium | Monitor usage, plan migration to self-hosted infrastructure if needed |
| Gemini API pricing changes or deprecation | High | Low | Model fallback chain, abstraction layer allows switching providers |
| Data privacy concerns (PDPL compliance) | High | Medium | Minimal data collection, server-side data integrity, contact blur layer |
| Competitor copies the conversational approach | Medium | High | First-mover advantage, deep Arabic AI tuning, Nitaqat integration, network effects |
| Candidate trust ("Is this really free?") | Medium | Medium | Transparent pricing page, no credit card required, clear privacy policy |
| Account loss (anonymous auth) | Medium | Medium | Phone number as persistent identifier, future OTP-based account recovery |

---

## 16. Regulatory Considerations

### 16.1 Saudi Personal Data Protection Law (PDPL)

Light must comply with Saudi Arabia's Personal Data Protection Law (effective September 2023). Key requirements:

- **Consent:** Clear consent for data collection and processing (captured during registration)
- **Purpose limitation:** Data used only for stated purposes (CV building, job matching)
- **Data minimization:** Collect only what's needed
- **Data subject rights:** Right to access, correct, and delete personal data
- **Cross-border transfer:** Data must remain in-region or comply with transfer rules (Firestore region: `me-central1` Saudi Arabia)
- **Breach notification:** 72-hour notification requirement for data breaches

### 16.2 Labor Law & Saudization

Job postings must comply with Saudi labor regulations. The AI job post generator is aware of Nitaqat requirements and flags potential compliance issues. Light tracks candidate nationality and helps recruiters make Nitaqat-aware hiring decisions.

---

## 17. Technical Dependencies & Environment

### 17.1 External Services

| Service | Purpose | Criticality | Cost |
|---|---|---|---|
| Google Gemini API | AI conversation and CV/job generation | Critical | Pay-per-token |
| Firebase Auth | User authentication | Critical | Free tier |
| Cloud Firestore | Database | Critical | Free tier → pay-as-you-go |
| Firebase Storage | File storage (PDFs, avatars) | Medium | Free tier |
| Firebase Cloud Messaging | Push notifications | Critical | Free |
| Google Cloud Run | PDF rendering service | Critical | Pay-per-request (scales to zero) |
| Resend or SendGrid | Email notifications | Medium | Free tier (100/day) |
| Google Analytics (GA4) | Usage tracking | Low | Free |
| Vercel | App hosting and deployment | Critical | Free tier → Pro |

### 17.2 Environment Configuration

| Variable | Scope | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | Server | Google Gemini AI access |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Server | Firebase Admin SDK (production) |
| `NEXT_PUBLIC_FIREBASE_*` | Client | Firebase client SDK configuration (7 variables) |
| `PDF_SERVICE_URL` | Server | Cloud Run PDF rendering service URL |
| `RESEND_API_KEY` or `SENDGRID_API_KEY` | Server | Email service credentials |

---

## 18. Appendix

### A. CV Templates

| Template | Style | Best For |
|---|---|---|
| Classic | Centered name header, clean sections with underline borders | Traditional industries, government, banking |
| Modern | Colored sidebar with contact info, main content area | Tech, startups, creative fields |
| Executive | Bold colored header bar, compact dense layout | Senior positions, management roles |
| Minimal | Ultra-clean with maximum whitespace | Design, consulting, academic |

### B. Supported Saudi Cities

Riyadh, Jeddah, Dammam, Makkah, Madinah, Khobar, Dhahran, Tabuk, Abha, Taif, Hail, Jazan, Najran, Al Baha, Yanbu, Al Jubail, Buraidah, Khamis Mushait.

### C. Skill Inference Map (Examples)

| Stated Experience | Inferred Skills |
|---|---|
| "بائع في جرير" (Sales at Jarir) | Customer service, sales, communication, working under pressure, goal achievement, POS systems, inventory awareness |
| "باريستا في ستاربكس" (Barista at Starbucks) | Customer service, fast-paced environment, team work, cleanliness standards, cash handling, multitasking |
| "مطور ويب" (Web Developer) | HTML/CSS, JavaScript, responsive design, version control, problem solving, debugging, API integration |
| "محاسب" (Accountant) | Financial analysis, Excel, budgeting, attention to detail, SAP/Oracle, regulatory compliance |

### D. Nitaqat Categories

| Category | Color | Meaning |
|---|---|---|
| Platinum | 🟢 | Highest Saudization — exceeds requirements significantly |
| Green | 🟢 | Meets Saudization requirements |
| Yellow | 🟡 | Below requirements — limited access to visas and services |
| Red | 🔴 | Significantly below requirements — penalties, visa freezes |

### E. GitHub Repository

`https://github.com/AbdulazizDaze/light-platform`

### F. Firebase Project

Project ID: `light-platform-8a089`
Console: `https://console.firebase.google.com/project/light-platform-8a089`
