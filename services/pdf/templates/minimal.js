import { htmlDocument } from '../lib/base.js';
import { buildSections, contactLine, esc, loc } from '../lib/sections.js';

// Minimal: ultra-clean, maximum whitespace, no rules/boxes. Design /
// consulting / academic feel (PRD §18.A). Uses spacing and a thin accent
// underline only under the name — sections are separated by whitespace and
// a light-weight all-caps-ish label instead of heavy borders.
export function renderMinimal(cv, theme, locale) {
  const personal = cv.personal || {};
  const title = loc(personal.title, locale, '');
  const sections = buildSections(cv, locale);

  const styleExtra = `
    .page { padding: 22mm 24mm; }
    .min-header { margin-bottom: 20px; }
    .min-header h1 { font-size: 21pt; font-weight: 500; color: #14213D; }
    .min-header .title { font-size: 11pt; color: ${theme.primary}; margin-top: 3px; }
    .min-header .contact { font-size: 9pt; color: #777; margin-top: 8px; }
    .min-header .accent-underline { width: 40px; height: 2px; background: ${theme.accent}; margin-top: 10px; }
    .section { margin-top: 20px; }
    .section-title {
      font-size: 9pt;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: ${theme.accent};
      margin-bottom: 8px;
    }
    /* letter-spacing above is Latin-only per rule; suppress for Arabic locale */
    html[dir="rtl"] .section-title { letter-spacing: 0; text-transform: none; }
    .rule, .accent-rule { display: none; }
    .item { margin-bottom: 12px; }
  `;

  const body = `
  <div class="page">
    <header class="min-header">
      <h1>${esc(personal.name || '')}</h1>
      ${title ? `<div class="title">${esc(title)}</div>` : ''}
      <div class="accent-underline"></div>
      <div class="contact">${contactLine(personal, locale)}</div>
    </header>

    ${sections
      .map(
        (s) => `
      <section class="section">
        <div class="section-title">${esc(s.title)}</div>
        ${s.html}
      </section>`
      )
      .join('')}
  </div>`;

  return htmlDocument({ locale, bodyHtml: body, styleExtra, theme });
}
