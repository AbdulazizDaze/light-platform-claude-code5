/**
 * CV-upload body validation (PRD §6.1 step 3 "upload an existing CV";
 * CLAUDE.md §7 "no Puppeteer in Vercel functions" — this is unrelated
 * rendering-wise, but is the equivalent trust boundary for an inbound file:
 * decode, size-check, and content-sniff BEFORE ever handing bytes to Gemini).
 *
 * Pure, framework-free, unit-testable: no Firebase/Next imports.
 */

/** Max accepted decoded PDF size (bytes). Keeps Gemini inline-data payloads small and cost-bounded. */
export const MAX_DECODED_PDF_BYTES = 4 * 1024 * 1024; // 4MB

export type ParseUploadResult =
  | { ok: true; bytes: Buffer }
  | { ok: false; reason: "too_large" | "not_pdf" | "invalid_base64" };

/** `%PDF` magic bytes every valid PDF file starts with. */
const PDF_MAGIC = Buffer.from("%PDF");

function looksLikePdf(bytes: Buffer): boolean {
  return bytes.length >= PDF_MAGIC.length && bytes.subarray(0, PDF_MAGIC.length).equals(PDF_MAGIC);
}

/**
 * Decode a base64 CV upload payload and validate it: must decode cleanly,
 * be under `MAX_DECODED_PDF_BYTES`, and start with the PDF magic bytes.
 * Never throws — every failure mode is a typed `{ ok: false, reason }`.
 */
export function parseUploadBase64(fileBase64: string): ParseUploadResult {
  // Cheap pre-decode guard: base64 inflates size by ~4/3, so a string whose
  // raw length already implies a decoded size well past the cap can be
  // rejected before ever allocating the decoded Buffer. The 1.4 multiplier
  // gives headroom over the exact 4/3 ratio for an optional `data:` URL
  // prefix and base64 padding, while still bailing out early on grossly
  // oversized payloads instead of decoding the whole thing first.
  if (fileBase64.length > MAX_DECODED_PDF_BYTES * 1.4) {
    return { ok: false, reason: "too_large" };
  }

  // Strip an optional `data:application/pdf;base64,` prefix defensively.
  // `Buffer.from(str, "base64")` never throws on malformed input (Node just
  // decodes what it can and drops invalid characters), so there is no
  // reachable catch here — the emptiness check below is what actually
  // detects "not real base64" input.
  const commaIndex = fileBase64.indexOf(",");
  const looksLikeDataUrl = fileBase64.slice(0, 5) === "data:";
  const raw = looksLikeDataUrl && commaIndex !== -1 ? fileBase64.slice(commaIndex + 1) : fileBase64;
  const bytes = Buffer.from(raw, "base64");

  if (bytes.length === 0) {
    return { ok: false, reason: "invalid_base64" };
  }

  if (bytes.length > MAX_DECODED_PDF_BYTES) {
    return { ok: false, reason: "too_large" };
  }

  if (!looksLikePdf(bytes)) {
    return { ok: false, reason: "not_pdf" };
  }

  return { ok: true, bytes };
}
