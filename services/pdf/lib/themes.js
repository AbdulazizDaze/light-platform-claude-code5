// Color themes for CV rendering.
// Each theme provides a `primary` (dark, headings/text-accent/sidebar) and an
// `accent` (highlight, rules, badges) color. Brand default is "oxford" (Oxford
// Blue + Jungle Green), matching Light's brand tokens (CLAUDE.md §4).
//
// All themes are chosen to remain print-safe (sufficient contrast on white,
// no neon values that wash out on cheap printers/PDF-to-print).

export const THEMES = {
  oxford: { primary: '#14213D', accent: '#22AE89' }, // brand default
  jungle: { primary: '#134E36', accent: '#22AE89' },
  orange: { primary: '#14213D', accent: '#FCA311' },
  slate: { primary: '#334155', accent: '#0EA5E9' },
  burgundy: { primary: '#4C1D24', accent: '#B0384D' },
  teal: { primary: '#0F3D3E', accent: '#14B8A6' },
};

export const DEFAULT_THEME_ID = 'oxford';

const HEX_RE = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

/**
 * Resolve a theme request into a concrete { primary, accent } pair.
 * Accepts:
 *  - a known theme id (string)
 *  - a custom color object { primary, accent } (hex strings) — overrides take
 *    precedence over a named theme if both are supplied.
 */
export function resolveTheme(themeInput) {
  let base = THEMES[DEFAULT_THEME_ID];

  if (typeof themeInput === 'string' && THEMES[themeInput]) {
    base = THEMES[themeInput];
  }

  if (themeInput && typeof themeInput === 'object') {
    const primary = HEX_RE.test(themeInput.primary || '') ? themeInput.primary : base.primary;
    const accent = HEX_RE.test(themeInput.accent || '') ? themeInput.accent : base.accent;
    return { primary, accent };
  }

  return { ...base };
}

export function isValidHex(value) {
  return HEX_RE.test(value || '');
}
