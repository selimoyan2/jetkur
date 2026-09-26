/**
 * JetKur Pure Static CSS Pipeline (Sprint 08)
 *
 * ARCHITECTURAL INVARIANTS:
 * 1. Zero Tailwind CDN references (cdn.tailwindcss.com is completely removed).
 * 2. Zero browser-runtime CSS compilers (no runtime evaluation, zero JIT overhead).
 * 3. 100% Deterministic: identical template + tokens => byte-identical CSS.
 * 4. Zero customer data in CSS: no business names, phone numbers, or user copy.
 * 5. Strict CSS Injection Hardening: validates colors, dimensions, and font tokens.
 *    Rejects arbitrary CSS breakouts, url(), expression(), javascript:, </style>.
 * 6. Design Tokens compile to standard CSS Custom Properties (:root { ... }).
 * 7. Pure semantic JetKur classes (.jk-container, .jk-section, .jk-hero, etc.)
 *    plus complete compiled utilities for visual parity.
 */

import { SiteConfig } from "../types";
import { DesignTokens, TemplateCategory } from "../domain/site/designTemplate";

// =========================================================================
// 1. CSS SECURITY & INJECTION HARDENING
// =========================================================================

const DANGEROUS_CSS_PATTERNS = [
  /<\/style/i,
  /<script/i,
  /javascript\s*:/i,
  /expression\s*\(/i,
  /url\s*\(/i,
  /@import/i,
  /behavior\s*:/i,
  /-moz-binding/i,
  /\/\*/,
  /\*\//,
  /;/,
  /\{/,
  /\}/,
];

/**
 * Checks whether an arbitrary string contains CSS breakout or injection vectors.
 */
export function isSafeCssValue(value: unknown): boolean {
  if (typeof value !== "string") return false;
  for (const pattern of DANGEROUS_CSS_PATTERNS) {
    if (pattern.test(value)) return false;
  }
  return true;
}

/**
 * Validates and sanitizes a color value.
 * Supports: hex (#fff, #1e40af), rgb/rgba, hsl/hsla, and safe named colors.
 * Rejects any arbitrary injection payload and falls back to safe default.
 */
export function validateColorToken(color: unknown, fallback = "#1e40af"): string {
  if (typeof color !== "string" || !isSafeCssValue(color)) {
    return fallback;
  }
  const trimmed = color.trim();
  // Safe Hex
  if (/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(trimmed)) {
    return trimmed;
  }
  // Safe RGB / RGBA
  if (/^rgba?\(\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*(,\s*(0|1|0?\.\d+|\d{1,3}%)\s*)?\)$/i.test(trimmed)) {
    return trimmed;
  }
  // Safe HSL / HSLA
  if (/^hsla?\(\s*\d{1,3}(deg)?\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(,\s*(0|1|0?\.\d+|\d{1,3}%)\s*)?\)$/i.test(trimmed)) {
    return trimmed;
  }
  // Safe Named Colors
  const SAFE_COLOR_NAMES = new Set([
    "transparent", "currentcolor", "inherit", "initial", "unset",
    "black", "white", "slate", "gray", "zinc", "neutral", "stone",
    "red", "orange", "amber", "yellow", "lime", "green", "emerald",
    "teal", "cyan", "sky", "blue", "indigo", "violet", "purple",
    "fuchsia", "pink", "rose"
  ]);
  if (SAFE_COLOR_NAMES.has(trimmed.toLowerCase())) {
    return trimmed.toLowerCase();
  }
  return fallback;
}

/**
 * Validates and sanitizes a dimension/size token.
 * Supports: px, rem, em, %, vh, vw, ch, pt or semantic size keywords.
 */
export function validateDimensionToken(dim: unknown, fallback = "16px"): string {
  if (typeof dim !== "string" || !isSafeCssValue(dim)) {
    return fallback;
  }
  const trimmed = dim.trim();
  if (/^-?\d+(\.\d+)?(px|rem|em|%|vh|vw|ch|pt)?$/.test(trimmed)) {
    return trimmed;
  }
  const SAFE_DIM_KEYWORDS = new Set([
    "none", "sm", "md", "lg", "xl", "2xl", "full", "boxed", "standard", "wide", "compact", "normal", "spacious", "auto"
  ]);
  if (SAFE_DIM_KEYWORDS.has(trimmed.toLowerCase())) {
    return trimmed.toLowerCase();
  }
  return fallback;
}

/**
 * Validates and sanitizes a font family token.
 * Ensures font identifiers don't escape CSS context or contain dangerous payloads.
 */
export function validateFontToken(font: unknown, fallback = "'Plus Jakarta Sans', sans-serif"): string {
  if (typeof font !== "string" || !isSafeCssValue(font)) {
    return fallback;
  }
  const trimmed = font.trim();
  if (/^[a-zA-Z0-9\s,\-\'\"]+$/.test(trimmed)) {
    return trimmed;
  }
  return fallback;
}

// =========================================================================
// 2. DESIGN TOKEN TO CSS CUSTOM PROPERTIES COMPILER
// =========================================================================

export interface CompiledCssTokens {
  primary: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  text: string;
  textMuted: string;
  surface: string;
  background: string;
  border: string;
  fontHeading: string;
  fontBody: string;
  borderRadius: string;
  containerMaxWidth: string;
  sectionSpacing: string;
}

/**
 * Resolves safe tokens from either SiteConfig (legacy palette) or DesignTokens.
 */
export function resolveSafeTokens(config: Partial<SiteConfig>, manifestTokens?: Partial<DesignTokens>): CompiledCssTokens {
  const p = config.palette;
  const mt = manifestTokens;

  const rawPrimary = mt?.palette?.primary || p?.primary || "#1e40af";
  const rawPrimaryDark = mt?.palette?.primaryDark || p?.primaryDark || "#1e3a8a";
  const rawSecondary = mt?.palette?.secondary || p?.secondary || "#f8fafc";
  const rawAccent = mt?.palette?.accent || p?.accent || "#f59e0b";
  const rawText = mt?.palette?.text || p?.text || "#0f172a";
  const rawTextMuted = mt?.palette?.textMuted || "#64748b";
  const rawSurface = mt?.palette?.surface || p?.bg || "#ffffff";
  const rawBackground = mt?.palette?.background || "#f8fafc";
  const rawBorder = mt?.palette?.border || "#e2e8f0";

  // Geometry mappings
  const rawRadius = mt?.geometry?.borderRadius;
  let radiusValue = "0.75rem";
  if (rawRadius === "none") radiusValue = "0px";
  else if (rawRadius === "sm") radiusValue = "0.25rem";
  else if (rawRadius === "md") radiusValue = "0.5rem";
  else if (rawRadius === "lg") radiusValue = "0.75rem";
  else if (rawRadius === "xl") radiusValue = "1rem";
  else if (rawRadius === "2xl") radiusValue = "1.5rem";
  else if (rawRadius === "full") radiusValue = "9999px";

  const rawContainer = mt?.geometry?.containerMaxWidth;
  let containerValue = "1280px";
  if (rawContainer === "boxed") containerValue = "1024px";
  else if (rawContainer === "standard") containerValue = "1280px";
  else if (rawContainer === "wide") containerValue = "1440px";
  else if (rawContainer === "full") containerValue = "100%";

  const rawSpacing = mt?.geometry?.sectionSpacing;
  let spacingValue = "5rem";
  if (rawSpacing === "compact") spacingValue = "3rem";
  else if (rawSpacing === "normal") spacingValue = "5rem";
  else if (rawSpacing === "spacious") spacingValue = "7rem";

  return {
    primary: validateColorToken(rawPrimary, "#1e40af"),
    primaryDark: validateColorToken(rawPrimaryDark, "#1e3a8a"),
    secondary: validateColorToken(rawSecondary, "#f8fafc"),
    accent: validateColorToken(rawAccent, "#f59e0b"),
    text: validateColorToken(rawText, "#0f172a"),
    textMuted: validateColorToken(rawTextMuted, "#64748b"),
    surface: validateColorToken(rawSurface, "#ffffff"),
    background: validateColorToken(rawBackground, "#f8fafc"),
    border: validateColorToken(rawBorder, "#e2e8f0"),
    fontHeading: validateFontToken(mt?.typography?.fontHeading, "'Plus Jakarta Sans', sans-serif"),
    fontBody: validateFontToken(mt?.typography?.fontBody, "'Plus Jakarta Sans', sans-serif"),
    borderRadius: radiusValue,
    containerMaxWidth: containerValue,
    sectionSpacing: spacingValue,
  };
}

/**
 * Compiles resolved design tokens into standard CSS :root custom properties.
 */
export function compileDesignTokensToCssVariables(tokens: CompiledCssTokens): string {
  return `:root {
  --jk-color-primary: ${tokens.primary};
  --jk-color-primary-dark: ${tokens.primaryDark};
  --jk-color-secondary: ${tokens.secondary};
  --jk-color-accent: ${tokens.accent};
  --jk-color-text: ${tokens.text};
  --jk-color-text-muted: ${tokens.textMuted};
  --jk-color-surface: ${tokens.surface};
  --jk-color-background: ${tokens.background};
  --jk-color-border: ${tokens.border};
  --jk-font-heading: ${tokens.fontHeading};
  --jk-font-body: ${tokens.fontBody};
  --jk-radius: ${tokens.borderRadius};
  --jk-container-width: ${tokens.containerMaxWidth};
  --jk-section-spacing: ${tokens.sectionSpacing};

  /* Direct Brand Compatibility Aliases */
  --brand: var(--jk-color-primary);
  --brand-dark: var(--jk-color-primary-dark);
  --brand-light: var(--jk-color-secondary);
  --brand-accent: var(--jk-color-accent);
  --brand-text: var(--jk-color-text);
}`;
}

// =========================================================================
// 3. CORE STATIC CSS STYLESHEET (High-performance compiled static CSS)
// =========================================================================

/**
 * Generates the complete, deterministic static CSS stylesheet for a JetKur site.
 * Completely replaces the 350KB runtime Tailwind CDN script with zero external dependencies.
 */
export function generateStaticCss(config: Partial<SiteConfig>, manifestTokens?: Partial<DesignTokens>): string {
  const safeTokens = resolveSafeTokens(config, manifestTokens);
  const rootVariables = compileDesignTokensToCssVariables(safeTokens);

  return `/* JetKur High-Speed Static CSS Engine v1.0.0 */
/* Zero Runtime Framework Dependency | 100% Deterministic */
${rootVariables}

/* Modern Reset & Normalize */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border-width: 0;
  border-style: solid;
  border-color: #e2e8f0;
}
html {
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  font-family: var(--jk-font-body), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  scroll-behavior: smooth;
}
body {
  margin: 0;
  line-height: inherit;
  color: var(--jk-color-text);
  background-color: var(--jk-color-surface);
  font-family: var(--jk-font-body), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
body.rtl-layout {
  direction: rtl;
  text-align: right;
}
body.rtl-layout .site-language-switcher {
  direction: ltr;
  text-align: left;
}
img, svg, video, canvas, audio, iframe, embed, object {
  display: block;
  vertical-align: middle;
  max-width: 100%;
  height: auto;
}
a {
  color: inherit;
  text-decoration: inherit;
}
button, input, optgroup, select, textarea {
  font-family: inherit;
  font-size: 100%;
  font-weight: inherit;
  line-height: inherit;
  color: inherit;
  margin: 0;
  padding: 0;
}
button, select {
  text-transform: none;
}
button, [type='button'], [type='reset'], [type='submit'] {
  -webkit-appearance: button;
  background-color: transparent;
  background-image: none;
  cursor: pointer;
}
ul, ol {
  list-style: none;
}

/* =========================================================================
 * JETKUR SEMANTIC ARCHITECTURE CLASSES
 * ========================================================================= */
.jk-container {
  width: 100%;
  max-width: var(--jk-container-width, 1280px);
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}
@media (min-width: 640px) {
  .jk-container {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}
@media (min-width: 1024px) {
  .jk-container {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}
.jk-section {
  padding-top: var(--jk-section-spacing, 4rem);
  padding-bottom: var(--jk-section-spacing, 4rem);
}
.jk-hero {
  position: relative;
  background-color: #0f172a;
  color: #ffffff;
  overflow: hidden;
}
.jk-services-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1.5rem;
}
@media (min-width: 640px) {
  .jk-services-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .jk-services-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
.jk-card {
  background-color: var(--jk-color-surface, #ffffff);
  border-radius: var(--jk-radius, 0.75rem);
  border: 1px solid var(--jk-color-border, #e2e8f0);
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.jk-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
.jk-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 700;
  border-radius: var(--jk-radius, 0.75rem);
  padding: 0.75rem 1.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
  text-decoration: none;
}
.jk-button-primary {
  background-color: var(--jk-color-primary);
  color: #ffffff;
}
.jk-button-primary:hover {
  background-color: var(--jk-color-primary-dark);
}
.jk-button-secondary {
  background-color: var(--jk-color-secondary);
  color: var(--jk-color-text);
  border: 1px solid var(--jk-color-border);
}

/* =========================================================================
 * CORE LAYOUT & FLEXBOX / GRID UTILITIES
 * ========================================================================= */
.flex { display: flex; }
.inline-flex { display: inline-flex; }
.grid { display: grid; }
.inline-grid { display: inline-grid; }
.block { display: block; }
.inline-block { display: inline-block; }
.inline { display: inline; }
.hidden { display: none; }

.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.flex-wrap { flex-wrap: wrap; }
.flex-nowrap { flex-wrap: nowrap; }

.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.items-stretch { align-items: stretch; }

.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-start { justify-content: flex-start; }
.justify-end { justify-content: flex-end; }
.justify-around { justify-content: space-around; }

.shrink-0 { flex-shrink: 0; }
.grow { flex-grow: 1; }
.min-w-0 { min-width: 0; }
.min-h-0 { min-height: 0; }

.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
.grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }

.gap-1 { gap: 0.25rem; }
.gap-1\\.5 { gap: 0.375rem; }
.gap-2 { gap: 0.5rem; }
.gap-2\\.5 { gap: 0.625rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.gap-5 { gap: 1.25rem; }
.gap-6 { gap: 1.5rem; }
.gap-8 { gap: 2rem; }
.gap-10 { gap: 2.5rem; }
.gap-12 { gap: 3rem; }
.gap-16 { gap: 4rem; }

/* Positioning */
.relative { position: relative; }
.absolute { position: absolute; }
.fixed { position: fixed; }
.sticky { position: sticky; }

.top-0 { top: 0; }
.bottom-0 { bottom: 0; }
.left-0 { left: 0; }
.right-0 { right: 0; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }

.z-0 { z-index: 0; }
.z-10 { z-index: 10; }
.z-20 { z-index: 20; }
.z-30 { z-index: 30; }
.z-40 { z-index: 40; }
.z-50 { z-index: 50; }

/* Sizing */
.w-full { width: 100%; }
.h-full { height: 100%; }
.w-auto { width: auto; }
.h-auto { height: auto; }
.w-screen { width: 100vw; }
.h-screen { height: 100vh; }

.w-3 { width: 0.75rem; } .h-3 { height: 0.75rem; }
.w-3\\.5 { width: 0.875rem; } .h-3\\.5 { height: 0.875rem; }
.w-4 { width: 1rem; } .h-4 { height: 1rem; }
.w-5 { width: 1.25rem; } .h-5 { height: 1.25rem; }
.w-6 { width: 1.5rem; } .h-6 { height: 1.5rem; }
.w-7 { width: 1.75rem; } .h-7 { height: 1.75rem; }
.w-8 { width: 2rem; } .h-8 { height: 2rem; }
.w-9 { width: 2.25rem; } .h-9 { height: 2.25rem; }
.w-10 { width: 2.5rem; } .h-10 { height: 2.5rem; }
.w-11 { width: 2.75rem; } .h-11 { height: 2.75rem; }
.w-12 { width: 3rem; } .h-12 { height: 3rem; }
.w-14 { width: 3.5rem; } .h-14 { height: 3.5rem; }
.w-16 { width: 4rem; } .h-16 { height: 4rem; }
.w-20 { width: 5rem; } .h-20 { height: 5rem; }
.w-24 { width: 6rem; } .h-24 { height: 6rem; }
.w-32 { width: 8rem; } .h-32 { height: 8rem; }
.w-48 { width: 12rem; } .h-48 { height: 12rem; }

.max-w-xs { max-width: 20rem; }
.max-w-sm { max-width: 24rem; }
.max-w-md { max-width: 28rem; }
.max-w-lg { max-width: 32rem; }
.max-w-xl { max-width: 36rem; }
.max-w-2xl { max-width: 42rem; }
.max-w-3xl { max-width: 48rem; }
.max-w-4xl { max-width: 56rem; }
.max-w-5xl { max-width: 64rem; }
.max-w-6xl { max-width: 72rem; }
.max-w-7xl { max-width: 80rem; }
.max-w-full { max-width: 100%; }

.mx-auto { margin-left: auto; margin-right: auto; }
.my-auto { margin-top: auto; margin-bottom: auto; }

/* Spacing Units */
.p-0 { padding: 0; }
.p-1 { padding: 0.25rem; }
.p-1\\.5 { padding: 0.375rem; }
.p-2 { padding: 0.5rem; }
.p-2\\.5 { padding: 0.625rem; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }
.p-5 { padding: 1.25rem; }
.p-6 { padding: 1.5rem; }
.p-8 { padding: 2rem; }
.p-10 { padding: 2.5rem; }
.p-12 { padding: 3rem; }

.px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
.px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
.px-2\\.5 { padding-left: 0.625rem; padding-right: 0.625rem; }
.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.px-5 { padding-left: 1.25rem; padding-right: 1.25rem; }
.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.px-8 { padding-left: 2rem; padding-right: 2rem; }

.py-0 { padding-top: 0; padding-bottom: 0; }
.py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
.py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
.py-1\\.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.py-2\\.5 { padding-top: 0.625rem; padding-bottom: 0.625rem; }
.py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
.py-3\\.5 { padding-top: 0.875rem; padding-bottom: 0.875rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.py-5 { padding-top: 1.25rem; padding-bottom: 1.25rem; }
.py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.py-10 { padding-top: 2.5rem; padding-bottom: 2.5rem; }
.py-12 { padding-top: 3rem; padding-bottom: 3rem; }
.py-16 { padding-top: 4rem; padding-bottom: 4rem; }
.py-20 { padding-top: 5rem; padding-bottom: 5rem; }

.m-0 { margin: 0; }
.mt-1 { margin-top: 0.25rem; }
.mt-1\\.5 { margin-top: 0.375rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 0.75rem; }
.mt-4 { margin-top: 1rem; }
.mt-5 { margin-top: 1.25rem; }
.mt-6 { margin-top: 1.5rem; }
.mt-8 { margin-top: 2rem; }
.mt-10 { margin-top: 2.5rem; }
.mt-12 { margin-top: 3rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-5 { margin-bottom: 1.25rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.mb-10 { margin-bottom: 2.5rem; }
.mb-12 { margin-bottom: 3rem; }
.mr-1 { margin-right: 0.25rem; }
.mr-2 { margin-right: 0.5rem; }
.mr-3 { margin-right: 0.75rem; }
.ml-1 { margin-left: 0.25rem; }
.ml-2 { margin-left: 0.5rem; }
.ml-3 { margin-left: 0.75rem; }

/* =========================================================================
 * TYPOGRAPHY
 * ========================================================================= */
.text-\\[10px\\] { font-size: 10px; }
.text-\\[11px\\] { font-size: 11px; }
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
.text-5xl { font-size: 3rem; line-height: 1; }
.text-6xl { font-size: 3.75rem; line-height: 1; }

.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-extrabold { font-weight: 800; }
.font-black { font-weight: 900; }

.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-justify { text-align: justify; }

.tracking-tight { letter-spacing: -0.025em; }
.tracking-normal { letter-spacing: 0; }
.tracking-wide { letter-spacing: 0.025em; }
.tracking-wider { letter-spacing: 0.05em; }

.leading-none { line-height: 1; }
.leading-tight { line-height: 1.25; }
.leading-snug { line-height: 1.375; }
.leading-normal { line-height: 1.5; }
.leading-relaxed { line-height: 1.625; }

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.uppercase { text-transform: uppercase; }
.lowercase { text-transform: lowercase; }
.capitalize { text-transform: capitalize; }
.underline { text-decoration-line: underline; }
.line-through { text-decoration-line: line-through; }
.underline-offset-4 { text-underline-offset: 4px; }
.underline-offset-8 { text-underline-offset: 8px; }

/* Line Clamp */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* =========================================================================
 * COLOR UTILITIES (Semantic Brand & Slate Neutral Palettes)
 * ========================================================================= */
.bg-brand { background-color: var(--brand); }
.bg-brand-dark { background-color: var(--brand-dark); }
.bg-brand-light { background-color: var(--brand-light); }
.bg-brand-accent { background-color: var(--brand-accent); }
.bg-brand\\/10 { background-color: color-mix(in srgb, var(--brand) 10%, transparent); }
.bg-brand\\/20 { background-color: color-mix(in srgb, var(--brand) 20%, transparent); }

.text-brand { color: var(--brand); }
.text-brand-dark { color: var(--brand-dark); }
.text-brand-accent { color: var(--brand-accent); }
.border-brand { border-color: var(--brand); }
.decoration-brand { text-decoration-color: var(--brand); }

/* Slate neutrals */
.bg-white { background-color: #ffffff; }
.bg-black { background-color: #000000; }
.bg-transparent { background-color: transparent; }
.bg-slate-50 { background-color: #f8fafc; }
.bg-slate-100 { background-color: #f1f5f9; }
.bg-slate-200 { background-color: #e2e8f0; }
.bg-slate-300 { background-color: #cbd5e1; }
.bg-slate-700 { background-color: #334155; }
.bg-slate-800 { background-color: #1e293b; }
.bg-slate-900 { background-color: #0f172a; }
.bg-slate-950 { background-color: #020617; }

.text-white { color: #ffffff; }
.text-black { color: #000000; }
.text-slate-100 { color: #f1f5f9; }
.text-slate-200 { color: #e2e8f0; }
.text-slate-300 { color: #cbd5e1; }
.text-slate-400 { color: #94a3b8; }
.text-slate-500 { color: #64748b; }
.text-slate-600 { color: #475569; }
.text-slate-700 { color: #334155; }
.text-slate-800 { color: #1e293b; }
.text-slate-900 { color: #0f172a; }

.border-slate-100 { border-color: #f1f5f9; }
.border-slate-200 { border-color: #e2e8f0; }
.border-slate-300 { border-color: #cbd5e1; }
.border-slate-700 { border-color: #334155; }
.border-slate-800 { border-color: #1e293b; }
.border-slate-900 { border-color: #0f172a; }

/* Status accents */
.bg-emerald-50 { background-color: #ecfdf5; }
.bg-emerald-100 { background-color: #d1fae5; }
.bg-emerald-500 { background-color: #10b981; }
.bg-emerald-600 { background-color: #059669; }
.text-emerald-400 { color: #34d399; }
.text-emerald-500 { color: #10b981; }
.text-emerald-600 { color: #059669; }
.text-emerald-700 { color: #047857; }

.bg-amber-50 { background-color: #fffbeb; }
.bg-amber-100 { background-color: #fef3c7; }
.bg-amber-400 { background-color: #fbbf24; }
.bg-amber-500 { background-color: #f59e0b; }
.text-amber-400 { color: #fbbf24; }
.text-amber-500 { color: #f59e0b; }
.text-amber-600 { color: #d97706; }

.bg-rose-50 { background-color: #fff1f2; }
.bg-rose-100 { background-color: #ffe4e6; }
.bg-rose-500 { background-color: #f43f5e; }
.text-rose-500 { color: #f43f5e; }
.text-rose-600 { color: #e11d48; }

.bg-blue-50 { background-color: #eff6ff; }
.bg-blue-100 { background-color: #dbeafe; }
.bg-blue-600 { background-color: #2563eb; }
.text-blue-500 { color: #3b82f6; }
.text-blue-600 { color: #2563eb; }

/* Overlays & Opacities */
.bg-black\\/30 { background-color: rgba(0, 0, 0, 0.3); }
.bg-black\\/40 { background-color: rgba(0, 0, 0, 0.4); }
.bg-black\\/50 { background-color: rgba(0, 0, 0, 0.5); }
.bg-black\\/60 { background-color: rgba(0, 0, 0, 0.6); }
.bg-black\\/75 { background-color: rgba(0, 0, 0, 0.75); }
.bg-black\\/80 { background-color: rgba(0, 0, 0, 0.8); }
.bg-black\\/90 { background-color: rgba(0, 0, 0, 0.9); }
.bg-black\\/95 { background-color: rgba(0, 0, 0, 0.95); }
.bg-white\\/90 { background-color: rgba(255, 255, 255, 0.9); }
.bg-white\\/95 { background-color: rgba(255, 255, 255, 0.95); }

/* Backdrop Filter */
.backdrop-blur-xs { backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px); }
.backdrop-blur-sm { backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
.backdrop-blur-md { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }

/* =========================================================================
 * BORDERS, RADII & SHADOWS
 * ========================================================================= */
.border { border-width: 1px; }
.border-0 { border-width: 0px; }
.border-2 { border-width: 2px; }
.border-4 { border-width: 4px; }
.border-t { border-top-width: 1px; }
.border-b { border-bottom-width: 1px; }
.border-l { border-left-width: 1px; }
.border-r { border-right-width: 1px; }

.rounded-none { border-radius: 0px; }
.rounded-sm { border-radius: 0.125rem; }
.rounded { border-radius: 0.25rem; }
.rounded-md { border-radius: 0.375rem; }
.rounded-lg { border-radius: 0.5rem; }
.rounded-xl { border-radius: 0.75rem; }
.rounded-2xl { border-radius: 1rem; }
.rounded-3xl { border-radius: 1.5rem; }
.rounded-full { border-radius: 9999px; }

.shadow-xs { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.shadow-sm { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1); }
.shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1); }
.shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); }
.shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
.shadow-none { box-shadow: none; }

/* Aspect Ratios & Objects */
.aspect-square { aspect-ratio: 1 / 1; }
.aspect-16\\/9 { aspect-ratio: 16 / 9; }
.aspect-4\\/3 { aspect-ratio: 4 / 3; }
.object-cover { object-fit: cover; }
.object-contain { object-fit: contain; }

/* Transitions & Animations */
.transition { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.transition-transform { transition-property: transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.transition-opacity { transition-property: opacity; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }

.duration-200 { transition-duration: 200ms; }
.duration-300 { transition-duration: 300ms; }
.duration-500 { transition-duration: 500ms; }

.hover\\:scale-102:hover { transform: scale(1.02); }
.hover\\:scale-105:hover { transform: scale(1.05); }
.group:hover .group-hover\\:scale-105 { transform: scale(1.05); }

/* Interactive Hover States */
.hover\\:bg-brand:hover { background-color: var(--brand); }
.hover\\:bg-brand-dark:hover { background-color: var(--brand-dark); }
.hover\\:text-brand:hover { color: var(--brand); }
.hover\\:bg-slate-50:hover { background-color: #f8fafc; }
.hover\\:bg-slate-100:hover { background-color: #f1f5f9; }
.hover\\:bg-slate-200:hover { background-color: #e2e8f0; }
.hover\\:bg-slate-800:hover { background-color: #1e293b; }
.hover\\:text-white:hover { color: #ffffff; }
.hover\\:text-slate-900:hover { color: #0f172a; }
.hover\\:underline:hover { text-decoration-line: underline; }
.cursor-pointer { cursor: pointer; }

/* Hero Gradients & Prose */
.hero-gradient {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.90) 0%, rgba(15, 23, 42, 0.75) 100%);
}
.slide-item {
  transition: opacity 0.6s ease-in-out;
}
.prose-rendered {
  line-height: 1.75;
}
.prose-rendered p {
  margin-bottom: 0.85rem;
}
.prose-rendered ul {
  list-style-type: disc;
  padding-left: 1.35rem;
  margin-bottom: 0.85rem;
}
.prose-rendered ol {
  list-style-type: decimal;
  padding-left: 1.35rem;
  margin-bottom: 0.85rem;
}
.prose-rendered h2, .prose-rendered h3, .prose-rendered h4 {
  font-weight: 800;
  color: #0f172a;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}
.prose-rendered blockquote {
  border-left: 4px solid var(--brand);
  padding-left: 1rem;
  font-style: italic;
  color: #475569;
  margin: 1rem 0;
  background: #f8fafc;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-radius: 0 0.5rem 0.5rem 0;
}
.prose-rendered strong {
  font-weight: 700;
  color: #0f172a;
}

/* =========================================================================
 * RESPONSIVE BREAKPOINTS (Mobile-First Architecture)
 * ========================================================================= */

/* Small Devices (sm: >= 640px) */
@media (min-width: 640px) {
  .sm\\:flex { display: flex; }
  .sm\\:grid { display: grid; }
  .sm\\:hidden { display: none; }
  .sm\\:inline { display: inline; }
  .sm\\:inline-flex { display: inline-flex; }
  .sm\\:block { display: block; }
  
  .sm\\:flex-row { flex-direction: row; }
  .sm\\:flex-col { flex-direction: column; }
  .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sm\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .sm\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

  .sm\\:px-4 { padding-left: 1rem; padding-right: 1rem; }
  .sm\\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
  .sm\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
  .sm\\:py-8 { padding-top: 2rem; padding-bottom: 2rem; }
  .sm\\:py-12 { padding-top: 3rem; padding-bottom: 3rem; }
  .sm\\:py-16 { padding-top: 4rem; padding-bottom: 4rem; }
  .sm\\:py-20 { padding-top: 5rem; padding-bottom: 5rem; }

  .sm\\:text-xs { font-size: 0.75rem; }
  .sm\\:text-sm { font-size: 0.875rem; }
  .sm\\:text-base { font-size: 1rem; }
  .sm\\:text-lg { font-size: 1.125rem; }
  .sm\\:text-xl { font-size: 1.25rem; }
  .sm\\:text-2xl { font-size: 1.5rem; }
  .sm\\:text-3xl { font-size: 1.875rem; }
  .sm\\:text-4xl { font-size: 2.25rem; }

  .sm\\:h-20 { height: 5rem; }
  .sm\\:max-w-none { max-width: none; }
}

/* Medium Devices (md: >= 768px) */
@media (min-width: 768px) {
  .md\\:flex { display: flex; }
  .md\\:grid { display: grid; }
  .md\\:hidden { display: none; }
  .md\\:inline { display: inline; }
  .md\\:block { display: block; }

  .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

  .md\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
  .md\\:py-16 { padding-top: 4rem; padding-bottom: 4rem; }
  .md\\:py-20 { padding-top: 5rem; padding-bottom: 5rem; }

  .md\\:text-lg { font-size: 1.125rem; }
  .md\\:text-xl { font-size: 1.25rem; }
  .md\\:text-2xl { font-size: 1.5rem; }
  .md\\:text-4xl { font-size: 2.25rem; }
  .md\\:text-5xl { font-size: 3rem; }
}

/* Large Devices (lg: >= 1024px) */
@media (min-width: 1024px) {
  .lg\\:flex { display: flex; }
  .lg\\:grid { display: grid; }
  .lg\\:hidden { display: none; }
  .lg\\:inline { display: inline; }
  .lg\\:block { display: block; }

  .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .lg\\:grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }

  .lg\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
  .lg\\:py-20 { padding-top: 5rem; padding-bottom: 5rem; }
  .lg\\:py-24 { padding-top: 6rem; padding-bottom: 6rem; }

  .lg\\:text-3xl { font-size: 1.875rem; }
  .lg\\:text-4xl { font-size: 2.25rem; }
  .lg\\:text-5xl { font-size: 3rem; }
  .lg\\:text-6xl { font-size: 3.75rem; }
}

/* Extra Large Devices (xl: >= 1280px) */
@media (min-width: 1280px) {
  .xl\\:flex { display: flex; }
  .xl\\:grid { display: grid; }
  .xl\\:hidden { display: none; }
  .xl\\:inline { display: inline; }
  .xl\\:block { display: block; }
  .xl\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .xl\\:gap-8 { gap: 2rem; }
}
`;
}
