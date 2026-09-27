/**
 * JetKur Brand Kit - Deterministic Semantic Palette Engine (Sprint 10)
 *
 * ARCHITECTURAL PRINCIPLES:
 * 1. Semantic Palette: Generates full semantic tokens (primary, primaryDark, primaryLight,
 *    secondary, accent, text, textMuted, surface, background, border, buttonTextPrimary, buttonTextAccent).
 * 2. WCAG Contrast Protection: Automatically selects optimal readable text for buttons & surfaces.
 * 3. 100% Deterministic & Non-Random: Zero Math.random(), zero date/time seeds, zero API calls.
 * 4. Safe Fallbacks: Gracefully handles monochromatic logos (all-white, all-black) and missing inputs.
 */

import {
  normalizeHexColor,
  getContrastRatio,
  getOptimalForeground,
  darkenColor,
  tintColor,
  shiftHue,
  isNearWhite,
  isNearBlack,
  isMonochromaticColor,
} from "./colorUtils";
import { BrandSourceColors, SemanticBrandPalette, BrandContrastAudit, ContrastRatioItem } from "./types";
import { DesignTokens } from "../site/designTemplate";

export interface PaletteEngineOptions {
  sourceColors: BrandSourceColors;
  fallbackTemplateTokens?: Partial<DesignTokens>;
  preferredAccent?: string;
}

export interface GeneratedBrandPaletteResult {
  palette: SemanticBrandPalette;
  contrastAudit: BrandContrastAudit;
}

/**
 * Builds a deterministic, WCAG-contrast-hardened semantic palette from source brand colors.
 */
export function generateBrandPalette(options: PaletteEngineOptions): GeneratedBrandPaletteResult {
  const { sourceColors, fallbackTemplateTokens, preferredAccent } = options;
  const tmplPalette = fallbackTemplateTokens?.palette;

  // 1. Resolve Primary Color
  let primary = "#1e40af"; // Standard JetKur trusted blue default

  const dominantHex = sourceColors.dominant ? normalizeHexColor(sourceColors.dominant) : null;

  if (dominantHex) {
    if (isNearWhite(dominantHex)) {
      // For pure white/near-white logos: cannot use pure white as primary text or button.
      // Use clean modern obsidian / slate-900 as primary brand tone
      primary = "#0f172a";
    } else if (isNearBlack(dominantHex)) {
      // For pure black / obsidian logos
      primary = "#0f172a";
    } else {
      primary = dominantHex;
    }
  } else if (tmplPalette?.primary) {
    primary = normalizeHexColor(tmplPalette.primary) || "#1e40af";
  }

  // 2. Derive primaryDark & primaryLight deterministically
  const primaryDark = darkenColor(primary, 15);
  const primaryLight = tintColor(primary, 0.85);

  // 3. Resolve Secondary Color
  let secondary = "#0d9488"; // Teal default
  const secondaryHex = sourceColors.secondary ? normalizeHexColor(sourceColors.secondary) : null;

  if (secondaryHex && secondaryHex !== primary) {
    secondary = secondaryHex;
  } else if (tmplPalette?.secondary) {
    secondary = normalizeHexColor(tmplPalette.secondary) || "#0d9488";
  } else {
    // Deterministic split hue from primary
    secondary = shiftHue(primary, 30);
  }

  // 4. Resolve Accent Color
  let accent = "#f59e0b"; // Amber default
  const normPreferredAccent = preferredAccent ? normalizeHexColor(preferredAccent) : null;

  if (normPreferredAccent) {
    accent = normPreferredAccent;
  } else if (sourceColors.accentCandidates && sourceColors.accentCandidates.length > 0) {
    const candidate = normalizeHexColor(sourceColors.accentCandidates[0]);
    if (candidate && candidate !== primary && candidate !== secondary) {
      accent = candidate;
    }
  } else if (tmplPalette?.accent) {
    accent = normalizeHexColor(tmplPalette.accent) || "#f59e0b";
  } else {
    // Complementary hue (180deg) with vibrant saturation
    accent = shiftHue(primary, 180);
  }

  // 5. Background, Surface, Border (readable, crisp foundations)
  const background = normalizeHexColor(tmplPalette?.background) || "#f8fafc";
  const surface = normalizeHexColor(tmplPalette?.surface) || "#ffffff";
  const border = normalizeHexColor(tmplPalette?.border) || "#e2e8f0";

  // 6. Text Tokens with High Contrast
  const text = normalizeHexColor(tmplPalette?.text) || "#0f172a";
  const textMuted = normalizeHexColor(tmplPalette?.textMuted) || "#64748b";

  // 7. Auto-Contrast Button Foregrounds
  const buttonTextPrimary = getOptimalForeground(primary);
  const buttonTextAccent = getOptimalForeground(accent);

  // 8. Contrast Verification & Audit
  const checkRatio = (
    name: string,
    fg: string,
    bg: string,
    target: number
  ): ContrastRatioItem => {
    const ratio = getContrastRatio(fg, bg);
    return {
      name,
      foreground: fg,
      background: bg,
      ratio,
      minTarget: target,
      passes: ratio >= target,
    };
  };

  const textOnBackground = checkRatio("textOnBackground", text, background, 4.5);
  const textOnSurface = checkRatio("textOnSurface", text, surface, 4.5);
  const buttonTextOnPrimary = checkRatio("buttonTextOnPrimary", buttonTextPrimary, primary, 4.0);
  const buttonTextOnAccent = checkRatio("buttonTextOnAccent", buttonTextAccent, accent, 3.5);
  const mutedTextOnBackground = checkRatio("mutedTextOnBackground", textMuted, background, 4.0);

  const allPass =
    textOnBackground.passes &&
    textOnSurface.passes &&
    buttonTextOnPrimary.passes &&
    buttonTextOnAccent.passes &&
    mutedTextOnBackground.passes;

  const contrastAudit: BrandContrastAudit = {
    textOnBackground,
    textOnSurface,
    buttonTextOnPrimary,
    buttonTextOnAccent,
    mutedTextOnBackground,
    allPass,
  };

  const palette: SemanticBrandPalette = {
    primary,
    primaryDark,
    primaryLight,
    secondary,
    accent,
    text,
    textMuted,
    surface,
    background,
    border,
    buttonTextPrimary,
    buttonTextAccent,
  };

  return {
    palette,
    contrastAudit,
  };
}
