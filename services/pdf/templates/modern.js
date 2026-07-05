import { htmlDocument } from '../lib/base.js';
import {
  buildSections,
  esc,
  loc,
  renderSkills,
  renderLanguages,
  renderCertifications,
} from '../lib/sections.js';

// Modern: colored sidebar with contact/skills/languages, main content area
// for summary/experience/education/projects. Tech/startup/creative feel.
export function renderModern(cv, theme, locale) {
  const personal = cv.personal || {};
  const title = loc(personal.title, locale, '');

  // Sidebar owns: contact, skills, languages, certifications.
  // Main owns: summary, experience, education, projects, volunteer.
  const allSections = buildSections(cv, locale);
  const sidebarKeys = new Set(['skills', 'languages', 'certifications']);
  const mainSections = allSections.filter((s) => !sidebarKeys.has(s.key));
  const sidebarSections = allSections.filter((s) => sidebarKeys.has(s.key));

  const contactItems = [personal.city, personal.phone, personal.email, personal.linkedin_url]
    .filter(Boolean)
    .map((v) => `<div class="small" style="margin-bottom:3px; word-break:break-all;">${esc(v)}</div>`)
    .join('');

  const isAr = locale === 'ar';
  const styleExtra = `
    .modern-wrap { display: flex; min-height: 297mm; }
    .sidebar {
      width: 68mm;
      background: ${theme.primary};
      color: #fff;
      padding: 16mm 10mm;
      ${isAr ? 'border-radius: 0 0 0 0;' : ''}
    }
    .main {
      flex: 1;
      padding: 16mm 14mm;
    }
    .sidebar .section-title { color: #fff; border-bottom: 1px solid rgba(255,255,255,0.35); padding-bottom: 4px; }
    .sidebar .rule, .sidebar .accent-rule { display: none; }
    .sidebar .chip { border-color: rgba(255,255,255,0.6); color: #fff; }
    .sidebar .chip.inferred { border-style: dashed; color: rgba(255,255,255,0.85); }
    .sidebar .lang-row, .sidebar .cert-row { color: #fff; }
    .sidebar .muted { color: rgba(255,255,255,0.75); }
    .sidebar a { color: #fff; }
    .main .section-title { border-bottom: 2px solid ${theme.accent}; padding-bottom: 4px; }
    .main .rule { display: none; }
  `;

  const body = `
  <div class="modern-wrap">
    <aside class="sidebar">
      <h1 style="font-size:18pt; font-weight:700; margin-bottom:2px;">${esc(personal.name || '')}</h1>
      ${title ? `<div style="font-size:10.5pt; color:${theme.accent}; font-weight:600; margin-bottom:12px;">${esc(title)}</div>` : ''}
      ${contactItems ? `<div class="section"><div class="section-title" style="font-size:10pt;">${esc(locale === 'ar' ? 'التواصل' : 'Contact')}</div>${contactItems}</div>` : ''}
      ${sidebarSections
        .map(
          (s) => `
        <div class="section">
          <div class="section-title" style="font-size:10pt;">${esc(s.title)}</div>
          ${s.html}
        </div>`
        )
        .join('')}
    </aside>
    <main class="main">
      ${mainSections
        .map(
          (s) => `
        <section class="section">
          <div class="section-title">${esc(s.title)}</div>
          ${s.html}
        </section>`
        )
        .join('')}
    </main>
  </div>`;

  return htmlDocument({ locale, bodyHtml: body, styleExtra, theme });
}
