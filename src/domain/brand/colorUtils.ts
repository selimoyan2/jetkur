/**
 * JetKur Brand Kit - Color & Accessibility Utilities
 *
 * Deterministic color mathematics, WCAG 2.1 relative luminance,
 * contrast calculations, and injection-hardened color validation.
 * Zero external dependencies. Zero AI/API calls.
 */

// Injection patterns to reject
const DANGEROUS_COLOR_PATTERNS = [
  /<\/style/i,
  /<script/i,
  /javascript\s*:/i,
  /vbscript\s*:/i,
  /expression\s*\(/i,
  /url\s*\(/i,
  /@import/i,
  /behavior\s*:/i,
  /-moz-binding/i,
  /\/\*/,
  /\*\//,
  /[;{}]/,
];

export interface RgbColor {
  r: number; // 0 - 255
  g: number; // 0 - 255
  b: number; // 0 - 255
}

export interface HslColor {
  h: number; // 0 - 360
  s: number; // 0 - 100
  l: number; // 0 - 100
}

/**
 * Validates whether a color string is safe against CSS breakouts and script injection.
 */
export function isSafeColorString(color: unknown): boolean {
  if (typeof color !== "string") return false;
  const trimmed = color.trim();
  if (!trimmed || trimmed.length > 60) return false;
  for (const pattern of DANGEROUS_COLOR_PATTERNS) {
    if (pattern.test(trimmed)) return false;
  }
  return true;
}

/**
 * Normalizes any safe color (hex, rgb, named color) into a canonical 6-digit hex string (#RRGGBB).
 * If invalid or malicious, returns null.
 */
export function normalizeHexColor(input: unknown): string | null {
  if (!isSafeColorString(input)) return null;
  const str = (input as string).trim();

  // 1. Standard Hex (#RGB, #RGBA, #RRGGBB, #RRGGBBAA)
  const hexMatch = str.match(/^#([0-9a-fA-F]{3,8})$/);
  if (hexMatch) {
    const raw = hexMatch[1];
    if (raw.length === 3) {
      // #RGB -> #RRGGBB
      const r = raw[0] + raw[0];
      const g = raw[1] + raw[1];
      const b = raw[2] + raw[2];
      return `#${r}${g}${b}`.toLowerCase();
    }
    if (raw.length === 6) {
      return `#${raw}`.toLowerCase();
    }
    if (raw.length === 4) {
      // #RGBA -> ignore alpha for canonical brand color
      const r = raw[0] + raw[0];
      const g = raw[1] + raw[1];
      const b = raw[2] + raw[2];
      return `#${r}${g}${b}`.toLowerCase();
    }
    if (raw.length === 8) {
      // #RRGGBBAA -> ignore alpha
      return `#${raw.substring(0, 6)}`.toLowerCase();
    }
  }

  // 2. rgb / rgba formats
  const rgbMatch = str.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
  if (rgbMatch) {
    const r = Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10)));
    const g = Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10)));
    const b = Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10)));
    return rgbToHex({ r, g, b });
  }

  // 3. Named colors dictionary
  const NAMED_COLORS: Record<string, string> = {
    black: "#000000",
    white: "#ffffff",
    gray: "#808080",
    grey: "#808080",
    silver: "#c0c0c0",
    red: "#ef4444",
    blue: "#3b82f6",
    green: "#22c55e",
    yellow: "#eab308",
    purple: "#a855f7",
    orange: "#f97316",
    teal: "#14b8a6",
    cyan: "#06b6d4",
    indigo: "#6366f1",
    emerald: "#10b981",
    slate: "#64748b",
    navy: "#000080",
  };

  const lower = str.toLowerCase();
  if (NAMED_COLORS[lower]) {
    return NAMED_COLORS[lower];
  }

  return null;
}

/**
 * Converts {r, g, b} to 6-digit #rrggbb.
 */
export function rgbToHex(rgb: RgbColor): string {
  const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, "0");
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toLowerCase();
}

/**
 * Converts 6-digit #rrggbb to {r, g, b}.
 */
export function hexToRgb(hex: string): RgbColor {
  const normalized = normalizeHexColor(hex) || "#000000";
  const num = parseInt(normalized.slice(1), 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Converts RGB to HSL.
 */
export function rgbToHsl(rgb: RgbColor): HslColor {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converts HSL to RGB.
 */
export function hslToRgb(hsl: HslColor): RgbColor {
  const h = (hsl.h % 360 + 360) % 360 / 360;
  const s = Math.min(100, Math.max(0, hsl.s)) / 100;
  const l = Math.min(100, Math.max(0, hsl.l)) / 100;

  if (s === 0) {
    const val = Math.round(l * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Computes WCAG 2.1 Relative Luminance of an sRGB color.
 * L = 0.2126 * R_lin + 0.7152 * G_lin + 0.0722 * B_lin
 */
export function getRelativeLuminance(colorHex: string): number {
  const rgb = hexToRgb(colorHex);

  const linearize = (c8Bit: number) => {
    const s = c8Bit / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const rLin = linearize(rgb.r);
  const gLin = linearize(rgb.g);
  const bLin = linearize(rgb.b);

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Computes WCAG 2.1 Contrast Ratio between two colors: (L1 + 0.05) / (L2 + 0.05)
 * Returns a value between 1.0 and 21.0.
 */
export function getContrastRatio(foregroundHex: string, backgroundHex: string): number {
  const lum1 = getRelativeLuminance(foregroundHex);
  const lum2 = getRelativeLuminance(backgroundHex);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 100) / 100;
}

/**
 * Selects the optimal high-contrast foreground (white or dark slate) for a given background color.
 */
export function getOptimalForeground(backgroundHex: string): "#ffffff" | "#0f172a" {
  const contrastWithWhite = getContrastRatio("#ffffff", backgroundHex);
  const contrastWithDark = getContrastRatio("#0f172a", backgroundHex);
  return contrastWithWhite >= contrastWithDark ? "#ffffff" : "#0f172a";
}

/**
 * Deterministically darkens a color by reducing lightness by percent (0 - 100).
 */
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  const newL = Math.max(0, hsl.l - percent);
  return rgbToHex(hslToRgb({ ...hsl, l: newL }));
}

/**
 * Deterministically lightens a color by increasing lightness by percent (0 - 100).
 */
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  const newL = Math.min(100, hsl.l + percent);
  return rgbToHex(hslToRgb({ ...hsl, l: newL }));
}

/**
 * Mixes a color with white or another color by a given weight factor (0.0 - 1.0).
 */
export function tintColor(hex: string, factor: number): string {
  const rgb = hexToRgb(hex);
  const f = Math.min(1, Math.max(0, factor));
  const r = Math.round(rgb.r + (255 - rgb.r) * f);
  const g = Math.round(rgb.g + (255 - rgb.g) * f);
  const b = Math.round(rgb.b + (255 - rgb.b) * f);
  return rgbToHex({ r, g, b });
}

/**
 * Deterministically shifts hue by degrees (e.g. 180 for complementary, 30 for adjacent).
 */
export function shiftHue(hex: string, degrees: number): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  const newH = (hsl.h + degrees + 360) % 360;
  return rgbToHex(hslToRgb({ ...hsl, h: newH }));
}

/**
 * Tests whether a color is monochromatic (very low saturation, e.g. white, black, gray).
 */
export function isMonochromaticColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  return hsl.s <= 10;
}

/**
 * Tests whether a color is near-white (very high lightness, >= 94%).
 */
export function isNearWhite(hex: string): boolean {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  return hsl.l >= 94;
}

/**
 * Tests whether a color is near-black (very low lightness, <= 8%).
 */
export function isNearBlack(hex: string): boolean {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  return hsl.l <= 8;
}
