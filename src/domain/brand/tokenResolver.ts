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

import { CustomDesignTokens, DesignTokens } from "../site/designTemplate";
import { BrandKit, ResolvedDesignTokens } from "./types";
import { validateColorToken, validateDimensionToken, validateFontToken } from "../../utils/staticCssGenerator";
import { darkenColor, normalizeHexColor } from "./colorUtils";
import { corporatePrestigeManifest } from "../templates/manifests/corporatePrestige";

export interface ResolveDesignTokensOptions {
  templateTokens?: DesignTokens;
  brandKit?: BrandKit | null;
  siteCustomTokens?: CustomDesignTokens | Partial<DesignTokens> | null;
}

/**
 * Pure function resolving the final DesignTokens by merging:
 * 1. Template Manifest defaults (base)
 * 2. BrandKit semantic overrides
 * 3. Explicit Site Custom Token overrides (highest priority)
 */
export function resolveDesignTokens(
  templateTokensOrOptions: DesignTokens | ResolveDesignTokensOptions,
  brandKitArg?: BrandKit | null,
  customOverridesArg?: CustomDesignTokens | Partial<DesignTokens> | null
): ResolvedDesignTokens {
  const isOptionsObject =
    templateTokensOrOptions &&
    typeof templateTokensOrOptions === "object" &&
    !("palette" in templateTokensOrOptions);

  const templateTokens: DesignTokens = isOptionsObject
    ? (templateTokensOrOptions as ResolveDesignTokensOptions).templateTokens || corporatePrestigeManifest.designTokens
    : (templateTokensOrOptions as DesignTokens) || corporatePrestigeManifest.designTokens;

  const brandKit: BrandKit | null | undefined = isOptionsObject
    ? (templateTokensOrOptions as ResolveDesignTokensOptions).brandKit
    : brandKitArg;

  const customOverrides: CustomDesignTokens | Partial<DesignTokens> | null | undefined = isOptionsObject
    ? (templateTokensOrOptions as ResolveDesignTokensOptions).siteCustomTokens
    : customOverridesArg;

  const basePalette = templateTokens.palette;
  const brandPalette = brandKit?.palette;
  const customPalette = customOverrides?.palette;

  // Resolve palette following strict hierarchy: Template < BrandKit < Custom
  const resolvedPrimary =
    customPalette?.primary ||
    brandPalette?.primary ||
    basePalette.primary;

  const baseOrBrandPrimary = brandPalette?.primary || basePalette.primary;
  const derivedCustomPrimaryDark =
    customPalette?.primary &&
    !customPalette?.primaryDark &&
    normalizeHexColor(customPalette.primary) !== normalizeHexColor(baseOrBrandPrimary)
      ? darkenColor(validateColorToken(customPalette.primary, basePalette.primary), 15)
      : undefined;

  const resolvedPrimaryDark =
    customPalette?.primaryDark ||
    derivedCustomPrimaryDark ||
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

  const resolvedSurfaceMuted =
    customPalette?.surfaceMuted ||
    brandPalette?.surfaceMuted ||
    basePalette.surfaceMuted ||
    resolvedSecondary;

  const resolvedSurfaceDark =
    customPalette?.surfaceDark ||
    brandPalette?.surfaceDark ||
    basePalette.surfaceDark ||
    "#0f172a";

  const resolvedSurfaceAccent =
    customPalette?.surfaceAccent ||
    brandPalette?.surfaceAccent ||
    basePalette.surfaceAccent ||
    resolvedSecondary;

  const primaryChangedFromTemplate =
    normalizeHexColor(resolvedPrimary) !== normalizeHexColor(basePalette.primary);

  const resolvedHeroGradient =
    customPalette?.heroGradient ||
    brandPalette?.heroGradient ||
    (primaryChangedFromTemplate
      ? `linear-gradient(135deg, ${validateColorToken(resolvedSurfaceDark, "#0f172a")} 0%, ${validateColorToken(resolvedPrimaryDark, basePalette.primaryDark)} 100%)`
      : basePalette.heroGradient) ||
    `linear-gradient(135deg, ${validateColorToken(resolvedSurfaceDark, "#0f172a")} 0%, ${validateColorToken(resolvedPrimaryDark, basePalette.primaryDark)} 100%)`;

  const resolvedSectionGradient =
    customPalette?.sectionGradient ||
    brandPalette?.sectionGradient ||
    basePalette.sectionGradient ||
    `linear-gradient(180deg, ${validateColorToken(resolvedSurface, "#ffffff")} 0%, ${validateColorToken(resolvedSurfaceMuted, "#f8fafc")} 100%)`;

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

  const resolvedBodyWeight =
    customTypo?.bodyWeight ||
    (brandTypo as any)?.bodyWeight ||
    baseTypo.bodyWeight ||
    "400";

  const resolvedHeadingLetterSpacing =
    customTypo?.headingLetterSpacing ||
    (brandTypo as any)?.headingLetterSpacing ||
    baseTypo.headingLetterSpacing ||
    "tight";

  const resolvedBodyLineHeight =
    customTypo?.bodyLineHeight ||
    (brandTypo as any)?.bodyLineHeight ||
    baseTypo.bodyLineHeight ||
    "normal";

  const resolvedHeadingScale =
    customTypo?.headingScale ||
    (brandTypo as any)?.headingScale ||
    baseTypo.headingScale ||
    "balanced";

  const resolvedUppercaseLabels =
    customTypo?.uppercaseLabels !== undefined
      ? customTypo.uppercaseLabels
      : (brandTypo as any)?.uppercaseLabels !== undefined
      ? (brandTypo as any).uppercaseLabels
      : baseTypo.uppercaseLabels ?? true;

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

  const resolvedCardShadow =
    customGeom?.cardShadow ||
    (brandGeom as any)?.cardShadow ||
    baseGeom.cardShadow ||
    (resolvedCardStyle === "flat-bordered"
      ? "none"
      : resolvedCardStyle === "elevated"
      ? "elevated"
      : "subtle");

  const resolvedBorderTreatment =
    customGeom?.borderTreatment ||
    (brandGeom as any)?.borderTreatment ||
    baseGeom.borderTreatment ||
    "subtle";

  const resolvedButtonRadius =
    customGeom?.buttonRadius ||
    (brandGeom as any)?.buttonRadius ||
    baseGeom.buttonRadius ||
    (resolvedBorderRadius === "2xl" ? "xl" : resolvedBorderRadius);

  const resolvedButtonEmphasis =
    customGeom?.buttonEmphasis ||
    (brandGeom as any)?.buttonEmphasis ||
    baseGeom.buttonEmphasis ||
    "solid";

  const resolvedHeroTextWidth =
    customGeom?.heroTextWidth ||
    (brandGeom as any)?.heroTextWidth ||
    baseGeom.heroTextWidth ||
    "balanced";

  const resolvedSectionDivider =
    customGeom?.sectionDivider ||
    (brandGeom as any)?.sectionDivider ||
    baseGeom.sectionDivider ||
    "hairline";

  const resolvedSectionSurfaceSequence =
    customGeom?.sectionSurfaceSequence ||
    (brandGeom as any)?.sectionSurfaceSequence ||
    baseGeom.sectionSurfaceSequence ||
    ["light", "muted", "light", "dark", "muted", "light"];

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
      surfaceMuted: validateColorToken(resolvedSurfaceMuted, basePalette.secondary),
      surfaceDark: validateColorToken(resolvedSurfaceDark, "#0f172a"),
      surfaceAccent: validateColorToken(resolvedSurfaceAccent, basePalette.secondary),
      heroGradient: resolvedHeroGradient,
      sectionGradient: resolvedSectionGradient,
    },
    typography: {
      fontHeading: validateFontToken(resolvedFontHeading, baseTypo.fontHeading),
      fontBody: validateFontToken(resolvedFontBody, baseTypo.fontBody),
      headingWeight: resolvedHeadingWeight,
      baseFontSize: resolvedBaseFontSize,
      bodyWeight: resolvedBodyWeight,
      headingLetterSpacing: resolvedHeadingLetterSpacing,
      bodyLineHeight: resolvedBodyLineHeight,
      headingScale: resolvedHeadingScale,
      uppercaseLabels: resolvedUppercaseLabels,
    },
    geometry: {
      borderRadius: resolvedBorderRadius,
      containerMaxWidth: resolvedContainerMaxWidth,
      sectionSpacing: resolvedSectionSpacing,
      cardStyle: resolvedCardStyle,
      cardShadow: resolvedCardShadow,
      borderTreatment: resolvedBorderTreatment,
      buttonRadius: resolvedButtonRadius,
      buttonEmphasis: resolvedButtonEmphasis,
      heroTextWidth: resolvedHeroTextWidth,
      sectionDivider: resolvedSectionDivider,
      sectionSurfaceSequence: resolvedSectionSurfaceSequence,
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
