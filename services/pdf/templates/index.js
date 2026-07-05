import { renderClassic } from './classic.js';
import { renderModern } from './modern.js';
import { renderExecutive } from './executive.js';
import { renderMinimal } from './minimal.js';

export const TEMPLATES = {
  classic: renderClassic,
  modern: renderModern,
  executive: renderExecutive,
  minimal: renderMinimal,
};

export function renderTemplate(templateId, cv, theme, locale) {
  const fn = TEMPLATES[templateId] || TEMPLATES.classic;
  return fn(cv, theme, locale);
}
