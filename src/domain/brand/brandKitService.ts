/**
 * JetKur Brand Kit - Service & Factory Layer (Sprint 10)
 *
 * Provides factory functions for initializing, analyzing, and mutating
 * customer BrandKit models deterministically.
 */

import { BrandKit, SemanticBrandPalette } from "./types";
import { analyzeLogo, LogoAnalysisInput } from "./logoAnalyzer";
import { generateBrandPalette } from "./paletteEngine";
import { DesignTokens } from "../site/designTemplate";
import { normalizeHexColor } from "./colorUtils";

export interface CreateBrandKitOptions {
  id?: string;
  siteId: string;
  logoInput?: LogoAnalysisInput;
  preferredPrimary?: string;
  preferredSecondary?: string;
  preferredAccent?: string;
  fallbackTemplateTokens?: Partial<DesignTokens>;
}

/**
 * Creates a complete canonical BrandKit from customer inputs.
 */
export function createBrandKit(options: CreateBrandKitOptions): BrandKit {
  const {
    id = `bkit-${Date.now()}`,
    siteId,
    logoInput,
    preferredPrimary,
    preferredSecondary,
    preferredAccent,
    fallbackTemplateTokens,
  } = options;

  // 1. Analyze logo if provided
  let logoResult = logoInput ? analyzeLogo(logoInput) : analyzeLogo({ sourceType: "none", preferredColor: preferredPrimary });

  // 2. Incorporate explicit color preferences if specified
  const normPrefPrimary = preferredPrimary ? normalizeHexColor(preferredPrimary) : null;
  const normPrefSecondary = preferredSecondary ? normalizeHexColor(preferredSecondary) : null;
  const normPrefAccent = preferredAccent ? normalizeHexColor(preferredAccent) : null;

  const sourceColors = {
    ...logoResult.sourceColors,
    dominant: normPrefPrimary || logoResult.sourceColors.dominant,
    secondary: normPrefSecondary || logoResult.sourceColors.secondary,
    accentCandidates: normPrefAccent
      ? [normPrefAccent, ...(logoResult.sourceColors.accentCandidates || [])]
      : logoResult.sourceColors.accentCandidates,
    extractedFrom: normPrefPrimary ? ("manual_preference" as const) : logoResult.sourceColors.extractedFrom,
  };

  // 3. Generate deterministic semantic palette & contrast audit
  const { palette, contrastAudit } = generateBrandPalette({
    sourceColors,
    fallbackTemplateTokens,
    preferredAccent: normPrefAccent || undefined,
  });

  const now = new Date().toISOString();

  return {
    id,
    siteId,
    version: 1,
    logo: logoResult.logo,
    sourceColors,
    palette,
    metadata: {
      createdAt: now,
      updatedAt: now,
      source: normPrefPrimary ? "manual_color" : logoInput ? "logo_analysis" : "template_default",
      contrastAudit,
    },
  };
}

/**
 * Updates an existing BrandKit when a new logo is supplied, preserving customer content.
 */
export function updateBrandKitLogo(
  existing: BrandKit,
  logoInput: LogoAnalysisInput,
  fallbackTemplateTokens?: Partial<DesignTokens>
): BrandKit {
  const logoResult = analyzeLogo(logoInput);
  const { palette, contrastAudit } = generateBrandPalette({
    sourceColors: logoResult.sourceColors,
    fallbackTemplateTokens,
  });

  return {
    ...existing,
    logo: logoResult.logo,
    sourceColors: logoResult.sourceColors,
    palette,
    metadata: {
      ...existing.metadata,
      updatedAt: new Date().toISOString(),
      source: "logo_analysis",
      contrastAudit,
    },
  };
}
