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
  /** Optional alternate muted section surface color (02D) */
  surfaceMuted?: string;
  /** Optional high-contrast dark section surface color (02D) */
  surfaceDark?: string;
  /** Optional soft tinted accent surface color (02D) */
  surfaceAccent?: string;
  /** Optional hero background gradient token (02D) */
  heroGradient?: string;
  /** Optional soft section background gradient token (02D) */
  sectionGradient?: string;
}

export interface TemplateTypographyTokens {
  fontHeading: string;
  fontBody: string;
  headingWeight: "600" | "700" | "800" | "900";
  baseFontSize: "14px" | "15px" | "16px" | "18px";
  /** Optional body text weight (02D) */
  bodyWeight?: "400" | "500";
  /** Optional heading letter-spacing profile (02D) */
  headingLetterSpacing?: "tight" | "normal" | "wide" | "editorial";
  /** Optional body copy line-height rhythm (02D) */
  bodyLineHeight?: "compact" | "normal" | "relaxed";
  /** Optional responsive heading size scale (02D) */
  headingScale?: "compact" | "balanced" | "display" | "editorial";
  /** Optional editorial uppercase kicker/label treatment (02D) */
  uppercaseLabels?: boolean;
}

export type SectionSurfaceTone = "light" | "muted" | "dark" | "gradient" | "bordered" | "editorial";

export interface TemplateGeometryTokens {
  borderRadius: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  containerMaxWidth: "boxed" | "standard" | "wide" | "full";
  sectionSpacing: "compact" | "normal" | "spacious";
  cardStyle: "flat-bordered" | "subtle-shadow" | "elevated" | "glassmorphism";
  /** Optional card elevation shadow profile (02D) */
  cardShadow?: "none" | "subtle" | "elevated" | "luxury";
  /** Optional card/container border treatment (02D) */
  borderTreatment?: "none" | "hairline" | "subtle" | "accent-top" | "accent-left" | "double-editorial";
  /** Optional button corner radius profile (02D) */
  buttonRadius?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  /** Optional primary CTA button visual emphasis style (02D) */
  buttonEmphasis?: "solid" | "soft" | "outline-refined" | "high-contrast" | "gradient";
  /** Optional hero text column measure (02D) */
  heroTextWidth?: "narrow" | "balanced" | "wide";
  /** Optional section divider style between page blocks (02D) */
  sectionDivider?: "none" | "hairline" | "soft-band" | "editorial-rule";
  /** Optional alternating section surface rhythm across page body (02D) */
  sectionSurfaceSequence?: ReadonlyArray<SectionSurfaceTone>;
}

export interface TemplateHeaderTokens {
  layout:
    | "fixed-solid"
    | "transparent-sticky"
    | "floating-pill"
    | "minimal-split"
    | "standard"
    | "split-action"
    | "centered"
    | "corporate-classic"
    | "local-service"
    | "modern-minimal"
    | "premium-luxury";
  showTopBar?: boolean;
}

export interface TemplateFooterTokens {
  layout:
    | "simple-centered"
    | "multi-column-rich"
    | "stacked-bold"
    | "corporate-detailed"
    | "multi-column"
    | "minimal-legal"
    | "corporate-multicolumn"
    | "local-service"
    | "minimal"
    | "premium";
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

export interface CustomDesignTokens {
  palette?: Partial<TemplateColorTokens>;
  typography?: Partial<TemplateTypographyTokens>;
  geometry?: Partial<TemplateGeometryTokens>;
  header?: Partial<TemplateHeaderTokens>;
  footer?: Partial<TemplateFooterTokens>;
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
  customTokens?: CustomDesignTokens;
  sectionVariants?: Record<string, string | undefined>;
}
