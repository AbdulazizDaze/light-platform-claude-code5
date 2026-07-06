import { describe, expect, it } from "vitest";
import { MAX_DECODED_PDF_BYTES, parseUploadBase64 } from "./parse-upload";

function pdfBase64(sizeBytes: number): string {
  const header = Buffer.from("%PDF-1.4\n");
  const padding = Buffer.alloc(Math.max(0, sizeBytes - header.length), 0x20);
  return Buffer.concat([header, padding]).toString("base64");
}

describe("parseUploadBase64", () => {
  it("accepts a well-formed small PDF", () => {
    const result = parseUploadBase64(pdfBase64(1024));
    expect(result.ok).toBe(true);
  });

  it("accepts a data: URL prefixed payload", () => {
    const b64 = pdfBase64(512);
    const result = parseUploadBase64(`data:application/pdf;base64,${b64}`);
    expect(result.ok).toBe(true);
  });

  it("rejects non-PDF content (wrong magic bytes)", () => {
    const notPdf = Buffer.from("this is not a pdf at all").toString("base64");
    const result = parseUploadBase64(notPdf);
    expect(result).toEqual({ ok: false, reason: "not_pdf" });
  });

  it("rejects payloads over the size ceiling", () => {
    const result = parseUploadBase64(pdfBase64(MAX_DECODED_PDF_BYTES + 1));
    expect(result).toEqual({ ok: false, reason: "too_large" });
  });

  it("rejects empty input", () => {
    const result = parseUploadBase64("");
    expect(result.ok).toBe(false);
  });

  it("rejects a grossly oversized base64 string via the cheap pre-decode length guard", () => {
    // A raw base64 string far longer than any legitimate encoding of
    // MAX_DECODED_PDF_BYTES should be rejected before ever decoding —
    // exercise the length-only fast path with obviously-too-long input.
    const hugeBase64 = "A".repeat(Math.ceil(MAX_DECODED_PDF_BYTES * 1.4) + 100);
    const result = parseUploadBase64(hugeBase64);
    expect(result).toEqual({ ok: false, reason: "too_large" });
  });
});
