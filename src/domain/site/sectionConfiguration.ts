/**
 * JetKur Canonical Data Architecture - Section Configuration Domain
 *
 * ARCHITECTURAL PRINCIPLE:
 * SectionConfiguration defines the structure, sequencing, visibility,
 * and variation of layout sections on the customer's web site.
 *
 * It does NOT hold complex rich content or business profiles;
 * it coordinates which sections appear in what order and in what visual mode.
 */

export type CanonicalSectionType =
  | "hero"
  | "services"
  | "about"
  | "whyUs"
  | "gallery"
  | "pricing"
  | "testimonials"
  | "faqs"
  | "contact"
  | "products"
  | "blog"
  | "newsletter"
  | "socialFeed"
  | "customHtml";

export interface SectionDisplayOptions {
  /** Column count for grid-based sections (services, gallery, products) */
  columns?: 2 | 3 | 4;
  /** Layout mode */
  layoutMode?: "grid" | "carousel" | "masonry" | "stacked" | "split";
  /** Accordion appearance for FAQs */
  accordionStyle?: "modern" | "bordered" | "separated" | "minimal";
  /** Lightbox toggle for gallery */
  enableLightbox?: boolean;
  /** Contact section toggles */
  showMap?: boolean;
  showForm?: boolean;
  /** Rating badges toggle for testimonials */
  showRatingStats?: boolean;
  /** Additional custom options */
  [key: string]: unknown;
}

export interface SiteSectionItem {
  id: string;
  type: CanonicalSectionType;
  /** Optional user-facing label in the dashboard editor */
  label?: string;
  /** Whether this section is rendered on the live static page */
  enabled: boolean;
  /** Visual display sort order (0, 1, 2, ...) */
  order: number;
  /** Visual variation key supported by the current design template */
  variant: string;
  /** Section-specific display flags */
  options?: SectionDisplayOptions;
}

export interface HeaderNavigationLink {
  id: string;
  label: string;
  target: string; // e.g. "#services", "#about", "/blog", "/iletisim"
  visible: boolean;
  order: number;
  openInNewTab?: boolean;
}

export interface HeaderConfiguration {
  sticky: boolean;
  showPhoneButton: boolean;
  showWhatsAppButton: boolean;
  showCtaButton: boolean;
  ctaText?: string;
  ctaTarget?: string;
  navLinks: HeaderNavigationLink[];
}

export interface FooterConfiguration {
  showWorkingHours: boolean;
  showSocialIcons: boolean;
  showQuickLinks: boolean;
  showCopyright: boolean;
  customDisclaimer?: string;
}

/**
 * The Canonical SectionConfiguration Aggregate
 */
export interface SectionConfiguration {
  /** Ordered list of sections for the site */
  sections: SiteSectionItem[];
  /** Header navigation and button layout */
  header: HeaderConfiguration;
  /** Footer layout and displayed informational blocks */
  footer: FooterConfiguration;
}
