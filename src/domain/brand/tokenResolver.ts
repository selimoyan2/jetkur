/**
 * JetKur Brand Kit - Deterministic Token Resolution Engine (Sprint 10)
 *
 * ARCHITECTURAL AUTHORITY:
 * Enforces the strict single token resolution order:
 *
 * TemplateManifest default DesignTokens
 *          ↓
 *   BrandKit semantic overrides
 *          ↓
 * Site-specific explicit custom token overrides
 *          ↓
 *    ResolvedDesignTokens
 *
 * INVARIANTS:
 * 1. Template default < BrandKit override < explicit Site custom override
 * 2. 100% Deterministic: identical inputs produce byte-identical tokens
 * 3. CSS Injection Hardening: validates and sanitizes all color, font, and dimension values.
 */

import { DesignTokens } from "../site/designTemplate";
import { BrandKit, ResolvedDesignTokens } from "./types";
import { validateColorToken, validateDimensionToken, validateFontToken } from "../../utils/staticCssGenerator";

/**
 * Pure function resolving the final DesignTokens by merging:
 * 1. Template Manifest defaults (base)
 * 2. BrandKit semantic overrides
 * 3. Explicit Site Custom Token overrides (highest priority)
 */
export function resolveDesignTokens(
  templateTokens: DesignTokens,
  brandKit?: BrandKit | null,
  customOverrides?: Partial<DesignTokens> | null
): ResolvedDesignTokens {
  const basePalette = templateTokens.palette;
  const brandPalette = brandKit?.palette;
  const customPalette = customOverrides?.palette;

  // Resolve palette following strict hierarchy: Template < BrandKit < Custom
  const resolvedPrimary =
    customPalette?.primary ||
    brandPalette?.primary ||
    basePalette.primary;

  const resolvedPrimaryDark =
    customPalette?.primaryDark ||
    brandPalette?.primaryDark ||
    basePalette.primaryDark;

  const resolvedSecondary =
    customPalette?.secondary ||
    brandPalette?.secondary ||
    basePalette.secondary;

  const resolvedAccent =
    customPalette?.accent ||
    brandPalette?.accent ||
    basePalette.accent;

  const resolvedText =
    customPalette?.text ||
    brandPalette?.text ||
    basePalette.text;

  const resolvedTextMuted =
    customPalette?.textMuted ||
    brandPalette?.textMuted ||
    basePalette.textMuted;

  const resolvedBackground =
    customPalette?.background ||
    brandPalette?.background ||
    basePalette.background;

  const resolvedSurface =
    customPalette?.surface ||
    brandPalette?.surface ||
    basePalette.surface;

  const resolvedBorder =
    customPalette?.border ||
    brandPalette?.border ||
    basePalette.border;

  // Typography tokens: Template < BrandKit < Custom
  const baseTypo = templateTokens.typography;
  const brandTypo = brandKit?.typography;
  const customTypo = customOverrides?.typography;

  const resolvedFontHeading =
    customTypo?.fontHeading ||
    brandTypo?.fontHeading ||
    baseTypo.fontHeading;

  const resolvedFontBody =
    customTypo?.fontBody ||
    brandTypo?.fontBody ||
    baseTypo.fontBody;

  const resolvedHeadingWeight =
    customTypo?.headingWeight ||
    brandTypo?.headingWeight ||
    baseTypo.headingWeight;

  const resolvedBaseFontSize =
    customTypo?.baseFontSize ||
    brandTypo?.baseFontSize ||
    baseTypo.baseFontSize;

  // Geometry tokens: Template < BrandKit < Custom
  const baseGeom = templateTokens.geometry;
  const brandGeom = brandKit?.geometry;
  const customGeom = customOverrides?.geometry;

  const resolvedBorderRadius =
    customGeom?.borderRadius ||
    brandGeom?.borderRadius ||
    baseGeom.borderRadius;

  const resolvedContainerMaxWidth =
    customGeom?.containerMaxWidth ||
    brandGeom?.containerMaxWidth ||
    baseGeom.containerMaxWidth;

  const resolvedSectionSpacing =
    customGeom?.sectionSpacing ||
    brandGeom?.sectionSpacing ||
    baseGeom.sectionSpacing;

  const resolvedCardStyle =
    customGeom?.cardStyle ||
    brandGeom?.cardStyle ||
    baseGeom.cardStyle;

  // Header & Footer tokens: Template < Custom
  const baseHeader = templateTokens.header;
  const customHeader = customOverrides?.header;
  const baseFooter = templateTokens.footer;
  const customFooter = customOverrides?.footer;

  return {
    palette: {
      primary: validateColorToken(resolvedPrimary, basePalette.primary),
      primaryDark: validateColorToken(resolvedPrimaryDark, basePalette.primaryDark),
      secondary: validateColorToken(resolvedSecondary, basePalette.secondary),
      accent: validateColorToken(resolvedAccent, basePalette.accent),
      text: validateColorToken(resolvedText, basePalette.text),
      textMuted: validateColorToken(resolvedTextMuted, basePalette.textMuted),
      background: validateColorToken(resolvedBackground, basePalette.background),
      surface: validateColorToken(resolvedSurface, basePalette.surface),
      border: validateColorToken(resolvedBorder, basePalette.border),
    },
    typography: {
      fontHeading: validateFontToken(resolvedFontHeading, baseTypo.fontHeading),
      fontBody: validateFontToken(resolvedFontBody, baseTypo.fontBody),
      headingWeight: resolvedHeadingWeight,
      baseFontSize: resolvedBaseFontSize,
    },
    geometry: {
      borderRadius: resolvedBorderRadius,
      containerMaxWidth: resolvedContainerMaxWidth,
      sectionSpacing: resolvedSectionSpacing,
      cardStyle: resolvedCardStyle,
    },
    header: {
      layout: customHeader?.layout || baseHeader.layout,
      showTopBar: customHeader?.showTopBar ?? baseHeader.showTopBar,
    },
    footer: {
      layout: customFooter?.layout || baseFooter.layout,
    },
  };
}
