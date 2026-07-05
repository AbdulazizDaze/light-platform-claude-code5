import { htmlDocument } from '../lib/base.js';
import { buildSections, contactLine, esc, loc } from '../lib/sections.js';

// Executive: bold colored header bar, compact/dense layout for senior /
// management roles (PRD §18.A). Two-column body to maximize density.
export function renderExecutive(cv, theme, locale) {
  const personal = cv.personal || {};
  const title = loc(personal.title, locale, '');
  const sections = buildSections(cv, locale);

  // Two-column split: primary narrative sections on the wide column, compact
  // list-y sections (skills/languages/certifications) on the narrow column.
  const narrowKeys = new Set(['skills', 'languages', 'certifications', 'volunteer_work']);
  const wide = sections.filter((s) => !narrowKeys.has(s.key));
  const narrow = sections.filter((s) => narrowKeys.has(s.key));

  const styleExtra = `
    .page { padding: 0; }
    .exec-header {
      background: ${theme.primary};
      color: #fff;
      padding: 12mm 18mm 10mm;
    }
    .exec-header h1 { font-size: 20pt; font-weight: 700; }
    .exec-header .title { font-size: 11pt; color: ${theme.accent}; font-weight: 600; margin-top:2px; }
    .exec-header .contact { font-size: 9pt; color: rgba(255,255,255,0.85); margin-top:6px; }
    .exec-body { padding: 10mm 18mm 16mm; display:flex; gap: 14mm; }
    .exec-wide { flex: 1.6; }
    .exec-narrow { flex: 1; border-inline-start: 1px solid #e3e3e3; padding-inline-start: 10mm; }
    .exec-body .section { margin-top: 10px; }
    .exec-body .section-title { font-size: 11pt; border-bottom: 2px solid ${theme.accent}; padding-bottom: 3px; }
    .exec-body .rule { display: none; }
    body { font-size: 9.8pt; }
  `;

  const body = `
  <div class="page">
    <div class="exec-header">
      <h1>${esc(personal.name || '')}</h1>
      ${title ? `<div class="title">${esc(title)}</div>` : ''}
      <div class="contact">${contactLine(personal, locale)}</div>
    </div>
    <div class="exec-body">
      <div class="exec-wide">
        ${wide
          .map(
            (s) => `
          <section class="section">
            <div class="section-title">${esc(s.title)}</div>
            ${s.html}
          </section>`
          )
          .join('')}
      </div>
      <div class="exec-narrow">
        ${narrow
          .map(
            (s) => `
          <section class="section">
            <div class="section-title">${esc(s.title)}</div>
            ${s.html}
          </section>`
          )
          .join('')}
      </div>
    </div>
  </div>`;

  return htmlDocument({ locale, bodyHtml: body, styleExtra, theme });
}
