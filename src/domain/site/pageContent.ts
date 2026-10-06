/**
 * JetKur Canonical Data Architecture - Page Content Domain (Sprint 17 Foundation)
 *
 * ARCHITECTURAL PRINCIPLES:
 * 1. SiteMode:
 *    - LANDING: Primary business content is presented as sections on the homepage.
 *    - MULTI_PAGE: Business content may also have dedicated pages (About, Services, Products, Contact).
 *    - Presentation-only control: Switching between LANDING <-> MULTI_PAGE does NOT mutate,
 *      duplicate, or delete customer content.
 *
 * 2. Canonical PageContent:
 *    - Reusable domain model for page-level business content (ABOUT, SERVICES, PRODUCTS, CONTACT).
 *    - shortDescription: Summary/preview content reused by homepage sections in both modes.
 *    - longContent: Full page content for dedicated pages.
 *    - active: Visibility toggle allowing modules to be enabled or disabled.
 *    - heroMediaMode: "SINGLE" | "SLIDER" (defaulting safely to SINGLE).
 *    - heroMediaIds: References existing MediaAsset architecture (MediaAsset.id).
 */

export type SiteMode = "LANDING" | "MULTI_PAGE";

export const DEFAULT_SITE_MODE: SiteMode = "LANDING";

export type CanonicalPageType =
  | "ABOUT"
  | "SERVICES"
  | "PRODUCTS"
  | "CONTACT"
  | "CUSTOM";

export type HeroMediaMode = "SINGLE" | "SLIDER";

export const DEFAULT_HERO_MEDIA_MODE: HeroMediaMode = "SINGLE";

export interface PageContent {
  /** Unique Page Content identifier (e.g. "page-about", "page-services") */
  id: string;

  /** Canonical page type */
  pageType: CanonicalPageType;

  /** Primary page title (e.g. "Hakkımızda", "Hizmetlerimiz") */
  title: string;

  /** URL-friendly slug (e.g. "hakkimizda", "hizmetlerimiz") */
  slug: string;

  /**
   * Summary/preview description.
   * NOT restricted to Landing mode; reused by homepage sections in both modes.
   */
  shortDescription: string;

  /** Full rich/long content normally used on dedicated pages */
  longContent: string;

  /** Active visibility toggle. When false, the content area/page is disabled */
  active: boolean;

  /** Hero/banner media display mode: SINGLE (default) or SLIDER */
  heroMediaMode: HeroMediaMode;

  /**
   * Reference IDs pointing to existing MediaAsset architecture.
   * SINGLE uses one media reference; SLIDER may use multiple references.
   */
  heroMediaIds: string[];

  /** Optional hero title override */
  heroTitle?: string;

  /** Optional hero subtitle override */
  heroSubtitle?: string;

  /** Optional page-specific SEO meta title */
  seoTitle?: string;

  /** Optional page-specific SEO meta description */
  seoDescription?: string;
}

/**
 * Normalizes any legacy or external site mode input into a canonical SiteMode.
 * Defaults safely to "LANDING" without modifying customer data.
 */
export function normalizeSiteMode(mode?: string | null): SiteMode {
  if (!mode) return DEFAULT_SITE_MODE;
  const normalized = mode.trim().toUpperCase();
  if (normalized === "MULTI_PAGE" || normalized === "MULTI-PAGE" || mode === "multi-page") {
    return "MULTI_PAGE";
  }
  return "LANDING";
}

/**
 * Creates a default canonical PageContent structure for an industry module.
 */
export function createDefaultPageContent(
  pageType: CanonicalPageType,
  overrides?: Partial<PageContent>
): PageContent {
  const defaultSlugs: Record<CanonicalPageType, string> = {
    ABOUT: "hakkimizda",
    SERVICES: "hizmetlerimiz",
    PRODUCTS: "urunlerimiz",
    CONTACT: "iletisim",
    CUSTOM: "sayfa",
  };

  const defaultTitles: Record<CanonicalPageType, string> = {
    ABOUT: "Hakkımızda",
    SERVICES: "Hizmetlerimiz",
    PRODUCTS: "Ürünlerimiz",
    CONTACT: "İletişim",
    CUSTOM: "Özel Sayfa",
  };

  return {
    id: `page-${pageType.toLowerCase()}`,
    pageType,
    title: defaultTitles[pageType] || "Sayfa",
    slug: defaultSlugs[pageType] || "sayfa",
    shortDescription: "",
    longContent: "",
    active: true,
    heroMediaMode: DEFAULT_HERO_MEDIA_MODE,
    heroMediaIds: [],
    ...overrides,
  };
}
