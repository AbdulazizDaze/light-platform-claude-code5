// Smoke test: starts nothing extra — assumes `server.js` is already running
// on PORT (default 8080). Sends the sample CV through all 4 templates for
// both locales, saves out-ar.pdf / out-en.pdf (classic template, the two
// files explicitly requested) plus one file per template for a fuller
// visual spot-check, and reports byte sizes.
//
// Usage:
//   node server.js &          (or: npm start &)
//   npm run smoke

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.PDF_SERVICE_URL || 'http://localhost:8080';

const cv = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-cv.json'), 'utf-8'));

async function renderOne({ template, theme, locale, outFile }) {
  const res = await fetch(`${BASE_URL}/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cv, template, theme, locale }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`render failed (${res.status}) for ${template}/${locale}: ${body}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buf = Buffer.from(arrayBuffer);
  const outPath = path.join(__dirname, outFile);
  fs.writeFileSync(outPath, buf);
  return { outFile, bytes: buf.length };
}

async function main() {
  console.log(`[smoke] target: ${BASE_URL}`);

  const healthRes = await fetch(`${BASE_URL}/healthz`);
  if (!healthRes.ok) throw new Error('healthz check failed');
  console.log('[smoke] healthz OK');

  const results = [];

  // The two explicitly-requested primary outputs.
  results.push(await renderOne({ template: 'classic', theme: 'oxford', locale: 'ar', outFile: 'out-ar.pdf' }));
  results.push(await renderOne({ template: 'classic', theme: 'oxford', locale: 'en', outFile: 'out-en.pdf' }));

  // One render per remaining template (locale alternated) + one custom-color run.
  results.push(await renderOne({ template: 'modern', theme: 'jungle', locale: 'ar', outFile: 'out-modern-ar.pdf' }));
  results.push(await renderOne({ template: 'executive', theme: 'slate', locale: 'en', outFile: 'out-executive-en.pdf' }));
  results.push(await renderOne({ template: 'minimal', theme: 'teal', locale: 'ar', outFile: 'out-minimal-ar.pdf' }));
  results.push(
    await renderOne({
      template: 'modern',
      theme: { primary: '#3B0764', accent: '#F97316' },
      locale: 'en',
      outFile: 'out-custom-theme-en.pdf',
    })
  );

  console.log('[smoke] results:');
  for (const r of results) {
    const ok = r.bytes > 5000; // sanity floor — a real A4 PDF with embedded fonts should not be tiny
    console.log(`  ${ok ? 'OK  ' : 'FAIL'} ${r.outFile}: ${r.bytes} bytes`);
    if (!ok) process.exitCode = 1;
  }

  console.log('[smoke] done.');
}

main().catch((err) => {
  console.error('[smoke] FAILED:', err);
  process.exitCode = 1;
});
