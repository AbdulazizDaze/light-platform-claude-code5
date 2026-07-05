import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = path.join(__dirname, '..', 'fonts');

function fontFileToDataUri(filename) {
  const buf = fs.readFileSync(path.join(FONTS_DIR, filename));
  return `data:font/woff2;base64,${buf.toString('base64')}`;
}

// Fonts are embedded as base64 data URIs directly in the HTML so Puppeteer
// never has to resolve a file:// or http request for them — this keeps
// rendering deterministic and works identically in Docker/Cloud Run with no
// extra static-file server.
let _fontFaceCss = null;
export function fontFaceCss() {
  if (_fontFaceCss) return _fontFaceCss;

  const weights = [400, 500, 600, 700];
  const arabicFaces = weights
    .map(
      (w) => `
    @font-face {
      font-family: 'Noto Sans Arabic';
      font-style: normal;
      font-weight: ${w};
      font-display: block;
      src: url(${fontFileToDataUri(`noto-sans-arabic-arabic-${w}.woff2`)}) format('woff2');
      unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
    }`
    )
    .join('\n');

  const latinFaces = weights
    .map(
      (w) => `
    @font-face {
      font-family: 'Noto Sans';
      font-style: normal;
      font-weight: ${w};
      font-display: block;
      src: url(${fontFileToDataUri(`noto-sans-latin-${w}.woff2`)}) format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }`
    )
    .join('\n');

  _fontFaceCss = `${arabicFaces}\n${latinFaces}`;
  return _fontFaceCss;
}

// Shared print-safe base styles: A4 page box, margins, font stack, and
// typographic rules that keep Arabic shaping correct (no letter-spacing,
// looser line-height for Arabic blocks per docs/design-system.md §3).
export function baseStyles({ locale, primary, accent }) {
  const isAr = locale === 'ar';
  return `
    ${fontFaceCss()}

    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-family: ${isAr ? "'Noto Sans Arabic', 'Noto Sans', sans-serif" : "'Noto Sans', 'Noto Sans Arabic', sans-serif"};
      font-size: 10.5pt;
      line-height: ${isAr ? 1.75 : 1.5};
      color: #1a1a1a;
      /* Never apply letter-spacing to Arabic text — it breaks glyph joining. */
      letter-spacing: 0;
    }

    @page {
      size: A4;
      margin: 0;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 16mm 18mm;
    }

    h1, h2, h3, p, ul, li { margin: 0; padding: 0; }
    ul { list-style: none; }

    .section { margin-top: 14px; }
    .section:first-child { margin-top: 0; }

    .section-title {
      font-size: 12.5pt;
      font-weight: 700;
      color: ${primary};
      margin-bottom: 6px;
    }

    .rule {
      border-top: 1.5px solid ${primary};
      margin: 4px 0 10px;
    }

    .accent-rule {
      border-top: 2px solid ${accent};
      margin: 4px 0 10px;
    }

    .muted { color: #555; }
    .small { font-size: 9pt; }

    .item { margin-bottom: 9px; }
    .item:last-child { margin-bottom: 0; }

    .item-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 8px;
      flex-wrap: wrap;
    }

    .item-title { font-weight: 600; font-size: 10.5pt; color: #14213D; }
    .item-sub { font-weight: 500; color: ${primary}; }
    .item-meta { font-size: 9pt; color: #666; white-space: nowrap; }

    .desc { margin-top: 3px; font-size: 9.5pt; color: #333; }
    .achievements { margin-top: 3px; }
    .achievements li {
      display: flex;
      align-items: baseline;
      gap: 6px;
      font-size: 9.5pt;
      color: #333;
      margin-bottom: 2px;
    }
    .achievements li .bullet {
      flex: none;
      color: ${accent};
    }
    .achievements li .bullet-text {
      flex: 1;
      min-width: 0;
    }

    .chip-row { display: flex; flex-wrap: wrap; gap: 6px; }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      border-radius: 999px;
      padding: 3px 10px;
      font-size: 9pt;
      border: 1px solid ${accent};
      color: ${primary};
    }
    .chip.inferred {
      border-style: dashed;
      color: #555;
    }
    .chip .ai-badge {
      font-size: 7pt;
      font-weight: 700;
      color: #fff;
      background: ${accent};
      border-radius: 999px;
      padding: 1px 5px;
    }

    .lang-row, .cert-row { display: flex; justify-content: space-between; font-size: 9.5pt; margin-bottom: 3px; }

    a { color: ${primary}; text-decoration: none; }

    /* Numerals (dates, phone, GPA) stay legible/tabular even inside RTL flow. */
    .nums { font-variant-numeric: tabular-nums; direction: ltr; unicode-bidi: isolate; display: inline-block; }
  `;
}

export function htmlDocument({ locale, bodyHtml, styleExtra = '', theme }) {
  const isAr = locale === 'ar';
  return `<!DOCTYPE html>
<html lang="${isAr ? 'ar' : 'en'}" dir="${isAr ? 'rtl' : 'ltr'}">
<head>
<meta charset="UTF-8" />
<title>CV</title>
<style>
${baseStyles({ locale, primary: theme.primary, accent: theme.accent })}
${styleExtra}
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}
