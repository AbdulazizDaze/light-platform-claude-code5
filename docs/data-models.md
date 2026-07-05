# Data Models

Firestore collections, their shapes, and the matching math. This is the contract the schemas in
`lib/schemas/` must enforce. Localized fields are `{ en, ar }`.

## Collections

### `users/{userId}`
`uid, name, email?, phone, role (candidate|recruiter), gender (male|female), city,
nationality (saudi|non_saudi), linkedin_url?, lang_pref (ar|en), fcm_token?,
notification_prefs { push, email }, created_at, updated_at`

Identity fields here are authoritative. API routes read from here, not from request bodies.

### `candidate_profiles/{userId}`
```
personal { name, email, phone, city, nationality, gender, linkedin_url?, portfolio_url?, github_url? }
professional_summary { en, ar }
education[]      { institution, degree, field, start_year, end_year, gpa?, achievements[] }
experience[]     { company, title, city, start_date, end_date?, is_current, description, achievements[] }
projects[]       { name, description, technologies[], url?, highlights[] }
skills[]         { name, level (1-5), category, inferred (boolean) }
languages[]      { language, proficiency }
certifications[] { name, issuer, date, url? }
volunteer_work[]
preferences      { job_type[], work_arrangement[], cities[], industries[], availability }
embedding_vector (768 floats)
cv_template, cv_color_theme, cv_custom_colors
profile_completeness (0-100)
last_active, profile_freshness_score
```

### `chat_sessions/{userId}`
`messages[] { id, role, content, quick_replies[], timestamp }, status (active|completed|abandoned),
type (new|returning|cv_upload), cv_data (full CV JSON when generated)`

### `companies/{userId}`
`name, city, industry, size_category, nitaqat_category (platinum|green|yellow|red),
saudi_employee_count, total_employee_count, created_at, updated_at`

### `job_posts/{jobId}`
```
recruiter_uid, company_name
title { en, ar }, description { en, ar }
city, job_type, work_arrangement, experience_level
responsibilities[], requirements[], required_skills[]
salary_min?, salary_max?, positions_count, benefits[]
saudi_preferred (boolean)
embedding_vector (768 floats)
status (draft|active|closed|expired|paused)
```

### `matches/{matchId}`
```
candidate_uid, job_id
total_score, component_scores { skills, experience, education, preferences, profile_quality }
nitaqat_boost (boolean)
explanation, strengths[], gaps[]
status (new|viewed|shortlisted|rejected|contacted)
created_at
```

### `notifications/{notifId}`
`uid, type, title, message, channel (push|email), related_id, read, created_at`

## CV JSON contract (AI output)

The `/api/chat` route asks Gemini to emit CV data as JSON. It must:
- Validate against `CvSchema` (Zod). Invalid → retry (max 2) → surface a graceful error.
- **Reject** identity fields (`uid`, `role`, `created_at`) — the schema strips/forbids them.
- Mark inferred skills `inferred: true` to separate them from self-stated skills.
- Include bilingual `professional_summary { en, ar }`, 3–4 sentences, naming the candidate,
  university, key skills, aspirations.

## Skill inference

The AI extracts implicit skills from stated experience (5–10 per role) across 9+ industries
(retail, hospitality, tech, marketing, accounting, engineering, healthcare, education, HR).
Examples:
- "بائع في جرير" → customer service, sales, communication, working under pressure, goal
  achievement, POS systems, inventory awareness.
- "باريستا في ستاربكس" → customer service, fast-paced environment, teamwork, cleanliness
  standards, cash handling, multitasking.

Full maps live in the `gemini-prompt` skill (base prompt) and the `cv-schema` skill.

## Matching math (authoritative)

### Hard filters (all must pass)
| Filter | Logic |
|---|---|
| Location | candidate cities ∩ job city ≠ ∅, OR candidate willing to relocate |
| Language | candidate meets job's minimum language requirements |
| Job type | job type ∈ candidate preferred job types |
| Work arrangement | job arrangement ∈ candidate preferred arrangements |

### Soft score (0–100), weighted sum
| Dimension | Weight | Method |
|---|---|---|
| Skills similarity | 35% | cosine(candidate_embedding, job_embedding) |
| Experience relevance | 30% | years vs. requirement, industry overlap, title similarity, recency |
| Education fit | 15% | degree level match, field relevance |
| Soft preferences | 10% | industry/benefits/company-size/growth-vs-stability alignment |
| Profile quality | 10% | completeness, freshness, verified vs inferred skills |

`total = Σ(dimension_score × weight) × nitaqat_multiplier × freshness_boost`

### Boosts
- **Nitaqat**: `1.15×` for Saudi candidates when the company is **Yellow or Red**; capped at 100;
  logged `nitaqat_boost: true`; shown as "يحسّن النطاقات".
- **Freshness**: `1.0 + 0.1 × max(0, 14 − days_since_creation) / 14`. Day 0 = 1.10×, Day 7 = 1.05×,
  Day 14 = 1.00×.

### Embedding inputs (text-embedding-004, 768-dim)
Candidate: `[Summary EN] | Skills: [...] | Experience: [title at company (duration), ...] |
Education: [degree in field from institution] | Industries: [...] | Looking for: [types, arrangements]`

Job: `[Title EN] | [Description EN] | Required Skills: [...] | Experience: [level] |
Industry: [industry] | Type: [type] | Arrangement: [arrangement]`

Generated once on create/material-update; stored on the doc (~3KB). Cosine computed in-memory.

### Fairness constraints
- Max **10** active match slots per candidate.
- No duplicate active candidate-job pair.
- Aim for ≥5 distinct companies among a candidate's slots.

### Explanation object (template-generated, no LLM)
```json
{
  "total_score": 82,
  "strengths": ["...", "..."],
  "gaps": ["..."],
  "nitaqat_note": "مرشح سعودي — التوظيف يحسّن تصنيف النطاقات",
  "component_scores": { "skills": 88, "experience": 79, "education": 72, "preferences": 85, "profile_quality": 91 }
}
```

### Feedback loop
Track funnel: Match Created → Viewed → Contacted → Interview → Hire (in `matches.status`).
Quarterly manual review adjusts weights ±2–3%, logged. Not an automated ML pipeline yet.
