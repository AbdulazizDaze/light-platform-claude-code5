/**
 * POST /api/pdf — bilingual CV PDF download (PRD §9.3, CLAUDE.md §3.4/§7;
 * `.claude/skills/nextjs-api-route/SKILL.md`).
 *
 * Canonical shape: verify token -> rate limit (pdf: 5/min/uid) -> load
 * server-side identity (`users/{uid}`) + CV data (`candidate_profiles/{uid}`)
 * -> validate body (Zod, .strict()) -> compose the render payload (pure
 * function in lib/) -> thin-proxy to the Cloud Run render service -> stream
 * the PDF bytes back.
 *
 * This route deliberately contains NO PDF rendering logic — no Puppeteer, no
 * layout/theme code. That all lives in `services/pdf` (Cloud Run). See
 * services/pdf/README.md for the request/response contract this proxies.
 *
 * Identity: `personal.name/phone/email/city` in the render payload come from
 * the server-side `users/{uid}` document (via `requireUserProfile`), never
 * from the request body — the body only carries template/theme/locale
 * choices, which are cosmetic, not identity.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  requireAuth,
  requireUserProfile,
  requireRateLimit,
  RouteError,
  toApiErrorResponse,
} from "@/lib/api/route-helpers";
import { apiError } from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";
import { candidateProfilesAdminConverter } from "@/lib/firebase/converters";
import { CvTemplateSchema, CvColorThemeSchema, CvCustomColorsSchema } from "@/lib/schemas/profile";
import { buildPdfRenderPayload, hasRenderableCv } from "@/lib/api/pdf-payload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PdfRequestBodySchema = z
  .object({
    template: CvTemplateSchema,
    theme: CvColorThemeSchema,
    custom_colors: CvCustomColorsSchema,
    locale: z.enum(["ar", "en"]),
  })
  .strict();

const NO_CV_MESSAGE = {
  en: "Create your CV first from the chat conversation.",
  ar: "أنشئ سيرتك الذاتية أولاً من المحادثة.",
};

const RENDER_TIMEOUT_MS = 30_000;

export async function POST(request: NextRequest) {
  try {
    const { uid } = await requireAuth(request);
    requireRateLimit(uid, "pdf");

    const user = await requireUserProfile(uid);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("invalid_body", {
        en: "Request body must be valid JSON.",
        ar: "يجب أن يكون محتوى الطلب بصيغة JSON صحيحة.",
      });
    }

    const parsed = PdfRequestBodySchema.safeParse(body);
    if (!parsed.success) {
      return apiError("invalid_body", {
        en: "Template, theme, and locale selections are required and must be valid.",
        ar: "القالب واللون واللغة مطلوبة ويجب أن تكون صحيحة.",
      });
    }

    const profileSnapshot = await adminDb()
      .collection("candidate_profiles")
      .doc(uid)
      .withConverter(candidateProfilesAdminConverter)
      .get();

    const profile = profileSnapshot.exists ? profileSnapshot.data() : undefined;

    if (!hasRenderableCv(profile)) {
      throw new RouteError("not_found", NO_CV_MESSAGE);
    }

    const payload = buildPdfRenderPayload(user, profile!, parsed.data);

    const pdfServiceUrl = process.env.PDF_SERVICE_URL;
    if (!pdfServiceUrl) {
      throw new RouteError("internal", {
        en: "PDF service is not configured. Set PDF_SERVICE_URL (see docs/environment.md) and run services/pdf locally.",
        ar: "خدمة إنشاء ملفات PDF غير مُعدّة. الرجاء ضبط PDF_SERVICE_URL (راجع docs/environment.md) وتشغيل الخدمة محلياً.",
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), RENDER_TIMEOUT_MS);

    let renderResponse: Response;
    try {
      renderResponse = await fetch(`${pdfServiceUrl}/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch {
      throw new RouteError("internal", {
        en: "Could not reach the PDF service. Please try again, and make sure the PDF service is running (see services/pdf/README.md).",
        ar: "تعذّر الوصول إلى خدمة إنشاء ملفات PDF. الرجاء المحاولة مرة أخرى، والتأكد من تشغيل الخدمة (راجع services/pdf/README.md).",
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!renderResponse.ok) {
      throw new RouteError("internal", {
        en: "PDF generation failed. Please try again.",
        ar: "فشل إنشاء ملف PDF. الرجاء المحاولة مرة أخرى.",
      });
    }

    const pdfBytes = await renderResponse.arrayBuffer();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="light-cv-${parsed.data.locale}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof RouteError) {
      return toApiErrorResponse(error);
    }
    return apiError("internal", {
      en: "Something went wrong. Please try again.",
      ar: "حدث خطأ ما. الرجاء المحاولة مرة أخرى.",
    });
  }
}
