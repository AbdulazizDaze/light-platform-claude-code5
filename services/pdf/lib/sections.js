import { t, esc, loc } from './i18n.js';

// Shared section-body renderers, reused by all four templates. Each returns
// '' when the underlying data is empty so templates only render non-empty
// sections (per spec).

function fmtDate(value, locale) {
  if (!value) return '';
  return `<span class="nums">${esc(value)}</span>`;
}

// Bullet marker + text are separate flex children (rather than a
// ::before/absolute-position bullet) so long lines wrap cleanly inside
// narrow columns (executive/modern sidebar) in both RTL and LTR.
function bulletList(items) {
  return `<ul class="achievements">${items
    .map((item) => `<li><span class="bullet">&bull;</span><span class="bullet-text">${esc(item)}</span></li>`)
    .join('')}</ul>`;
}

export function renderSummary(cv, locale) {
  const text = loc(cv.professional_summary, locale);
  if (!text) return '';
  return `<p class="desc" style="font-size:10pt; margin-top:0;">${esc(text)}</p>`;
}

export function renderExperience(cv, locale) {
  const items = cv.experience || [];
  if (!items.length) return '';
  return items
    .map((exp) => {
      const title = loc(exp.title, locale, '');
      const end = exp.is_current ? t('present', locale) : fmtDate(exp.end_date, locale);
      const start = fmtDate(exp.start_date, locale);
      const achievements = (exp.achievements || []).filter(Boolean);
      return `
      <div class="item">
        <div class="item-row">
          <span class="item-title">${esc(title)}${exp.company ? ` &middot; ${esc(exp.company)}` : ''}</span>
          <span class="item-meta">${start}${start && end ? ' – ' : ''}${end}${exp.city ? ` &middot; ${esc(exp.city)}` : ''}</span>
        </div>
        ${exp.description ? `<p class="desc">${esc(exp.description)}</p>` : ''}
        ${
          achievements.length
            ? bulletList(achievements)
            : ''
        }
      </div>`;
    })
    .join('');
}

export function renderEducation(cv, locale) {
  const items = cv.education || [];
  if (!items.length) return '';
  return items
    .map((ed) => {
      const years = [ed.start_year, ed.end_year].filter((v) => v !== undefined && v !== null && v !== '');
      const yearStr = years.length ? `<span class="nums">${years.map(esc).join(' – ')}</span>` : '';
      return `
      <div class="item">
        <div class="item-row">
          <span class="item-title">${esc(ed.degree)}${ed.field ? ` &middot; ${esc(ed.field)}` : ''}</span>
          <span class="item-meta">${yearStr}</span>
        </div>
        <div class="item-sub small">${esc(ed.institution)}${ed.gpa ? ` &middot; GPA <span class="nums">${esc(ed.gpa)}</span>` : ''}</div>
        ${
          (ed.achievements || []).length
            ? bulletList(ed.achievements)
            : ''
        }
      </div>`;
    })
    .join('');
}

export function renderProjects(cv, locale) {
  const items = cv.projects || [];
  if (!items.length) return '';
  return items
    .map((p) => {
      const tech = (p.technologies || []).filter(Boolean);
      return `
      <div class="item">
        <div class="item-row">
          <span class="item-title">${esc(p.name)}</span>
          ${p.url ? `<span class="item-meta"><a href="${esc(p.url)}">${esc(p.url)}</a></span>` : ''}
        </div>
        ${p.description ? `<p class="desc">${esc(p.description)}</p>` : ''}
        ${tech.length ? `<div class="chip-row" style="margin-top:4px;">${tech.map((x) => `<span class="chip">${esc(x)}</span>`).join('')}</div>` : ''}
        ${
          (p.highlights || []).length
            ? bulletList(p.highlights)
            : ''
        }
      </div>`;
    })
    .join('');
}

export function renderSkills(cv, locale) {
  const items = cv.skills || [];
  if (!items.length) return '';
  return `<div class="chip-row">${items
    .map((s) => {
      const name = loc(s.name, locale, typeof s.name === 'string' ? s.name : '');
      const inferredBadge = s.inferred ? `<span class="ai-badge">${t('ai_inferred', locale)}</span>` : '';
      return `<span class="chip${s.inferred ? ' inferred' : ''}">${esc(name)}${inferredBadge}</span>`;
    })
    .join('')}</div>`;
}

export function renderLanguages(cv, locale) {
  const items = cv.languages || [];
  if (!items.length) return '';
  return items
    .map((l) => `<div class="lang-row"><span>${esc(l.language)}</span><span class="muted">${esc(l.proficiency)}</span></div>`)
    .join('');
}

export function renderCertifications(cv, locale) {
  const items = cv.certifications || [];
  if (!items.length) return '';
  return items
    .map(
      (c) => `
      <div class="cert-row">
        <span>${esc(c.name)}${c.issuer ? ` &middot; ${esc(c.issuer)}` : ''}</span>
        <span class="muted nums">${esc(c.date)}</span>
      </div>`
    )
    .join('');
}

export function renderVolunteer(cv, locale) {
  const items = (cv.volunteer_work || []).filter(Boolean);
  if (!items.length) return '';
  return bulletList(items);
}

// Returns [{ key, title, html }] for every non-empty section, in canonical
// CV order, so templates can loop rather than hand-checking each field.
export function buildSections(cv, locale) {
  const defs = [
    ['professional_summary', renderSummary],
    ['experience', renderExperience],
    ['education', renderEducation],
    ['projects', renderProjects],
    ['skills', renderSkills],
    ['languages', renderLanguages],
    ['certifications', renderCertifications],
    ['volunteer_work', renderVolunteer],
  ];
  return defs
    .map(([key, fn]) => ({ key, title: t(key, locale), html: fn(cv, locale) }))
    .filter((s) => s.html && s.html.trim().length > 0);
}

export function contactLine(personal, locale) {
  const parts = [personal.city, personal.phone, personal.email].filter(Boolean);
  return parts.map(esc).join(' &nbsp;&middot;&nbsp; ');
}

export { esc, loc, t };
