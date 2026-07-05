import { htmlDocument } from '../lib/base.js';
import { buildSections, contactLine, esc, loc } from '../lib/sections.js';

// Classic: centered name header, underlined section titles. Traditional /
// government / banking feel (PRD §18.A).
export function renderClassic(cv, theme, locale) {
  const personal = cv.personal || {};
  const sections = buildSections(cv, locale);
  const title = loc(personal.title, locale, '');

  const body = `
  <div class="page">
    <header style="text-align:center; margin-bottom: 14px;">
      <h1 style="font-size:22pt; font-weight:700; color:${theme.primary};">${esc(personal.name || '')}</h1>
      ${title ? `<div style="font-size:12pt; color:${theme.accent}; font-weight:600; margin-top:2px;">${esc(title)}</div>` : ''}
      <div class="accent-rule" style="width:120px; margin:8px auto;"></div>
      <div class="small muted">${contactLine(personal, locale)}</div>
    </header>

    ${sections
      .map(
        (s) => `
      <section class="section">
        <div class="section-title" style="text-align:center;">${esc(s.title)}</div>
        <div class="rule"></div>
        ${s.html}
      </section>`
      )
      .join('')}
  </div>`;

  return htmlDocument({ locale, bodyHtml: body, theme });
}
