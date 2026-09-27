/**
 * JetKur Canonical Brand Kit Domain Types (Sprint 10)
 *
 * ARCHITECTURAL PRINCIPLE:
 * BrandKit represents the customer's visual brand identity (logo, brand colors,
 * derived semantic palette, and contrast metadata).
 *
 * It is customer/site-owned state and is completely INDEPENDENT of TemplateManifest.
 * - TemplateManifest = platform-owned design recipe + layout variants + default design tokens
 * - BrandKit = customer-owned branding identity
 * - Token Priority: TemplateManifest defaults < BrandKit overrides < Site custom overrides
 */

import {
  DesignTokens,
  TemplateColorTokens,
  TemplateTypographyTokens,
  TemplateGeometryTokens,
} from "../site/designTemplate";

export type LogoSourceType = "upload" | "url" | "svg" | "none";

export type LogoAnalysisStatus =
  | "analyzed"
  | "fallback"
  | "unsupported"
  | "not_provided"
  | "deferred";

export interface BrandLogo {
  /** Logo source classification */
  source: LogoSourceType;
  /** Sanitized logo URL if referenced externally or uploaded to CDN */
  url?: string;
  /** Sanitized, static SVG text markup if SVG format was provided */
  svgContent?: string;
  /** MIME type (e.g. "image/svg+xml", "image/png", "image/jpeg", "image/webp") */
  mimeType?: string;
  /** Pixel width if known */
  width?: number;
  /** Pixel height if known */
  height?: number;
  /** Aspect ratio (width / height) */
  aspectRatio?: number;
  /** Flag if logo has transparent background */
  hasTransparency?: boolean;
  /** Analysis status of the logo */
  analysisStatus: LogoAnalysisStatus;
}

export type ExtractedFromType =
  | "svg"
  | "raster"
  | "manual_preference"
  | "template_default"
  | "none";

export interface BrandSourceColors {
  /** Dominant identified brand color */
  dominant?: string;
  /** Secondary identified brand color */
  secondary?: string;
  /** Candidate accent colors found in brand input */
  accentCandidates?: string[];
  /** Origin where colors were derived from */
  extractedFrom: ExtractedFromType;
  /** Raw color values found during inspection (normalized hex) */
  rawSampledColors?: string[];
}

export interface ContrastRatioItem {
  name: string;
  foreground: string;
  background: string;
  ratio: number;
  minTarget: number;
  passes: boolean;
}

export interface BrandContrastAudit {
  textOnBackground: ContrastRatioItem;
  textOnSurface: ContrastRatioItem;
  buttonTextOnPrimary: ContrastRatioItem;
  buttonTextOnAccent: ContrastRatioItem;
  mutedTextOnBackground: ContrastRatioItem;
  allPass: boolean;
}

export interface SemanticBrandPalette extends TemplateColorTokens {
  /** Primary brand color */
  primary: string;
  /** Deterministic darker shade for hover/active states */
  primaryDark: string;
  /** Deterministic lighter tint for accents/subtle badges */
  primaryLight: string;
  /** Complementary secondary brand color */
  secondary: string;
  /** Vibrant accent color for high-visibility CTAs */
  accent: string;
  /** High-contrast primary body text color */
  text: string;
  /** Secondary muted text color */
  textMuted: string;
  /** Card/container surface color */
  surface: string;
  /** Primary page background color */
  background: string;
  /** Border color */
  border: string;
  /** Accessible text/icon color on primary button */
  buttonTextPrimary: string;
  /** Accessible text/icon color on accent button */
  buttonTextAccent: string;
}

export interface BrandMetadata {
  createdAt: string;
  updatedAt: string;
  source: "logo_analysis" | "manual_color" | "template_default";
  contrastAudit?: BrandContrastAudit;
  notes?: string;
}

/**
 * The Canonical BrandKit Aggregate
 */
export interface BrandKit {
  /** Unique BrandKit identifier */
  id: string;
  /** Site identifier this BrandKit belongs to */
  siteId: string;
  /** Contract schema version */
  version: 1;
  /** Associated logo metadata */
  logo?: BrandLogo;
  /** Extracted or configured source colors */
  sourceColors: BrandSourceColors;
  /** Generated deterministic, accessible semantic palette */
  palette: SemanticBrandPalette;
  /** Optional customer-preferred typography tokens */
  typography?: Partial<TemplateTypographyTokens>;
  /** Optional customer-preferred geometry tokens */
  geometry?: Partial<TemplateGeometryTokens>;
  /** Operational metadata & audit trail */
  metadata: BrandMetadata;
}

/**
 * Result of resolving design tokens against all authorities
 */
export type ResolvedDesignTokens = DesignTokens;
