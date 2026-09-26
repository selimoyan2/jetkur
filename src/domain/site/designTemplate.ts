/**
 * JetKur Canonical Data Architecture - Design Template Domain
 *
 * ARCHITECTURAL PRINCIPLE:
 * DesignTemplate governs the visual design system, typography, color harmony,
 * spacing tokens, and supported layout component variants.
 *
 * It is completely separated from business data (who the customer is)
 * and site content (what the text says).
 */

export type TemplateCategory =
  | "modern"
  | "bold"
  | "corporate"
  | "minimal"
  | "artisan"
  | "luxury"
  | "technical"
  | "clean";

export interface TemplateColorTokens {
  primary: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  text: string;
  textMuted: string;
  background: string;
  surface: string;
  border: string;
}

export interface TemplateTypographyTokens {
  fontHeading: string;
  fontBody: string;
  headingWeight: "600" | "700" | "800" | "900";
  baseFontSize: "14px" | "15px" | "16px" | "18px";
}

export interface TemplateGeometryTokens {
  borderRadius: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  containerMaxWidth: "boxed" | "standard" | "wide" | "full";
  sectionSpacing: "compact" | "normal" | "spacious";
  cardStyle: "flat-bordered" | "subtle-shadow" | "elevated" | "glassmorphism";
}

export interface TemplateHeaderTokens {
  layout: "fixed-solid" | "transparent-sticky" | "floating-pill" | "minimal-split" | "standard" | "split-action" | "centered";
  showTopBar?: boolean;
}

export interface TemplateFooterTokens {
  layout: "simple-centered" | "multi-column-rich" | "stacked-bold" | "corporate-detailed" | "multi-column" | "minimal-legal";
}

export interface DesignTokens {
  palette: TemplateColorTokens;
  typography: TemplateTypographyTokens;
  geometry: TemplateGeometryTokens;
  header: TemplateHeaderTokens;
  footer: TemplateFooterTokens;
}

/**
 * The Canonical DesignTemplate Model
 */
export interface DesignTemplate {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: TemplateCategory;
  version: string;
  previewImageUrl: string;
  defaultTokens: DesignTokens;
  supportedHeroVariants: Array<"split-content-image" | "centered-bold" | "slider" | "minimalist-search">;
  supportedSectionVariants: Record<string, string[]>;
  supportsDarkMode: boolean;
  tags: string[];
}

/**
 * Active template configuration instance attached to a specific site,
 * allowing user token customizations (e.g. customized primary color or border radius)
 * while preserving the base template layout logic.
 */
export interface ActiveDesignConfig {
  templateId: string;
  templateSlug: string;
  templateVersion?: string;
  appliedAt?: string;
  customTokens?: Partial<DesignTokens>;
}
