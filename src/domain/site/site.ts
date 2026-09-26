/**
 * JetKur Canonical Data Architecture - Root Aggregate
 *
 * PRODUCT PRINCIPLE:
 * "Kullanıcı web sitesi yapmaz. Kullanıcı işletmesini anlatır. JetKur web sitesini oluşturur."
 *
 * CANONICAL ROOT FORMULA:
 * SITE =
 *   BUSINESS PROFILE
 *   + INDUSTRY PACK
 *   + DESIGN TEMPLATE
 *   + SECTION CONFIGURATION
 *   + SITE CONTENT
 *   + SITE SETTINGS
 */

import { BusinessProfile } from "./businessProfile";
import { ActiveDesignConfig } from "./designTemplate";
import { SectionConfiguration } from "./sectionConfiguration";
import { SiteContent } from "./siteContent";
import { SiteSettings } from "./siteSettings";

export type CanonicalSiteStatus = "draft" | "trial" | "active" | "suspended" | "archived";

/**
 * The Canonical Site Aggregate Root
 */
export interface CanonicalSite {
  /** Unique Site ID */
  id: string;
  /** Schema specification version for future zero-downtime migrations */
  schemaVersion: "1.0.0";
  /** Site lifecycle status */
  status: CanonicalSiteStatus;
  /** Creation timestamp in ISO 8601 format */
  createdAt: string;
  /** Last update timestamp in ISO 8601 format */
  updatedAt: string;

  /**
   * 1. BUSINESS PROFILE:
   * Authentic customer business identity, contact, address, logo, and core service offerings.
   * Completely portable and template-agnostic.
   */
  businessProfile: BusinessProfile;

  /**
   * 2. INDUSTRY PACK REFERENCE:
   * Reference identifier to the industry knowledge pack that seeded the initial site
   * (e.g. "pack-plumbing-v1", "pack-dentist-v1").
   */
  industryPackId?: string;

  /**
   * 3. DESIGN TEMPLATE:
   * Active visual theme, design tokens (palette, typography, geometry, header/footer layout).
   */
  designTemplate: ActiveDesignConfig;

  /**
   * 4. SECTION CONFIGURATION:
   * Homepage sections ordering, visibility toggles, section variants, and navigation links.
   */
  sectionConfiguration: SectionConfiguration;

  /**
   * 5. SITE CONTENT:
   * Marketing copy, headlines, about story, FAQs, testimonials, blog posts, and catalog items.
   */
  content: SiteContent;

  /**
   * 6. SITE SETTINGS:
   * Technical SEO, custom domain, Cloudflare edge deployment, analytics, WhatsApp widget, and leads handling.
   */
  settings: SiteSettings;
}
