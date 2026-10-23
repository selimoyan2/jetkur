/**
 * JetKur Canonical Generator Types (Sprint 09 & Sprint 17 Foundation 05A.1)
 *
 * Defines contracts for modular static site generation:
 * CanonicalSite + TemplateManifest + SectionRegistry + StaticCss => Static HTML Site.
 */

import { CanonicalSite } from "../../domain/site/site";
import { TemplateManifest } from "../../domain/templates/types";
import { CanonicalSectionId } from "../../domain/sections/types";
import { GeneratedPageFile, SiteConfig } from "../../types";
import { ResolvedDesignTokens } from "../../domain/brand/types";

export type PageType =
  | "home"
  | "page"
  | "about"
  | "services"
  | "service-list"
  | "service-detail"
  | "catalog"
  | "product-detail"
  | "blog"
  | "blog-list"
  | "blog-detail"
  | "contact"
  | "custom"
  | "other";

export interface GeneratedPage {
  filename: string;
  title: string;
  html: string;
  type: PageType;
  slug?: string;
  description?: string;
}

export interface SeoMetadata {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  robots?: string;
  keywords?: string[];
  lang?: string;
  schemaJsonLd?: string;
}

export interface RenderContext {
  site: CanonicalSite;
  legacyConfig?: SiteConfig;
  config?: SiteConfig;
  manifest: TemplateManifest;
  resolvedDesignTokens?: ResolvedDesignTokens;
  activePageSlug?: string;
  currentPageType?: PageType;
  lang?: string;
  isRtl?: boolean;
  /** Relative path prefix for assets and links (e.g. "" for root, "../" for nested directory) */
  assetPrefix?: string;
  /** Directory nesting depth: 0 for root, 1 for subdirectories */
  depth?: number;
}

export interface SectionRenderContext extends RenderContext {
  sectionId?: CanonicalSectionId;
  variant?: string;
  order?: number;
}

export type SectionRendererFn = (context: SectionRenderContext) => string;

export interface ProgressiveFeatureRequirement {
  mobileNav: boolean;
  faqAccordion: boolean;
  heroSlider: boolean;
  pageHeroSlider?: boolean;
  pageHeroSlideCount?: number;
  galleryLightbox: boolean;
  languageSwitcher: boolean;
  catalogModal: boolean;
}
