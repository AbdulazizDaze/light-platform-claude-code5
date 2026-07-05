---
description: Scaffold an RTL-first, bilingual React component.
argument-hint: <component name and purpose>
---

Create the component: **$ARGUMENTS**

Delegate to `frontend-engineer` (with `rtl-arabic-specialist` for any bidi/typography nuance) and
apply the `rtl-component` and `bilingual-content` skills. Requirements: logical CSS properties only
(no `ml/mr/left/right`), all copy from `lib/i18n` in `ar` + `en`, gender-aware where addressing the
user, brand tokens for color/font, mobile-responsive, keyboard-operable, WCAG AA contrast. Server
component by default; `"use client"` only if needed. Add tests for any pure UI logic.
