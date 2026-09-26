/**
 * JetKur Canonical Generator Types (Sprint 09)
 *
 * Defines contracts for modular static site generation:
 * CanonicalSite + TemplateManifest + SectionRegistry + StaticCss => Static HTML Site.
 */

import { CanonicalSite } from "../../domain/site/site";
import { TemplateManifest } from "../../domain/templates/types";
import { CanonicalSectionId } from "../../domain/sections/types";
import { GeneratedPageFile, SiteConfig } from "../../types";

export type PageType = "home" | "about" | "services" | "service-detail" | "catalog" | "product-detail" | "blog" | "blog-detail" | "contact" | "custom" | "other";

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
  manifest: TemplateManifest;
  activePageSlug?: string;
  currentPageType?: PageType;
  lang?: string;
  isRtl?: boolean;
}

export interface SectionRenderContext extends RenderContext {
  sectionId: CanonicalSectionId;
  variant: string;
  order: number;
}

export type SectionRendererFn = (context: SectionRenderContext) => string;

export interface ProgressiveFeatureRequirement {
  mobileNav: boolean;
  faqAccordion: boolean;
  heroSlider: boolean;
  galleryLightbox: boolean;
  languageSwitcher: boolean;
  catalogModal: boolean;
}
