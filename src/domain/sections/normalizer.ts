/**
 * JetKur Canonical Section Registry - Normalizer & Resolver
 *
 * ARCHITECTURAL PRINCIPLE:
 * Resolves any raw or legacy section identifier to a stable canonical section ID.
 * Supports legacy aliases without performing unsafe, destructive mass-renames.
 */

import { CanonicalSectionId, SectionCategory, SectionDefinition, SectionStatus } from "./types";
import { CANONICAL_SECTION_DEFINITIONS, SECTION_REGISTRY_MAP } from "./registry";

/**
 * Built-in alias map mapping common legacy / localized names to CanonicalSectionId
 */
const CANONICAL_ALIAS_MAP: ReadonlyMap<string, CanonicalSectionId> = new Map([
  // FAQs
  ["faq", "faqs"],
  ["faqs", "faqs"],
  ["sss", "faqs"],
  ["sikca-sorulan-sorular", "faqs"],
  ["sikcasorulansorular", "faqs"],

  // Products / Catalog
  ["catalog", "products"],
  ["katalog", "products"],
  ["urunler", "products"],
  ["products", "products"],
  ["urun-katalogu", "products"],

  // Testimonials / Reviews
  ["reviews", "testimonials"],
  ["review", "testimonials"],
  ["yorumlar", "testimonials"],
  ["musteri-yorumlari", "testimonials"],
  ["musteriyorumlari", "testimonials"],
  ["testimonials", "testimonials"],
  ["referanslar", "testimonials"],

  // Why Us / Features
  ["features", "whyUs"],
  ["feature", "whyUs"],
  ["whyus", "whyUs"],
  ["why-us", "whyUs"],
  ["neden-biz", "whyUs"],
  ["nedenbiz", "whyUs"],
  ["avantajlar", "whyUs"],

  // Contact / Map
  ["contact", "contact"],
  ["iletisim", "contact"],
  ["map", "contact"],
  ["harita", "contact"],
  ["contact-form", "contact"],

  // Services
  ["services", "services"],
  ["hizmetler", "services"],
  ["hizmetlerimiz", "services"],
  ["servisler", "services"],

  // About
  ["about", "about"],
  ["hakkimizda", "about"],
  ["kurumsal", "about"],
  ["biz-kimiz", "about"],

  // Hero
  ["hero", "hero"],
  ["hero-slider", "hero"],
  ["banner", "hero"],
  ["intro", "hero"],
  ["karsilama", "hero"],

  // Gallery
  ["gallery", "gallery"],
  ["galeri", "gallery"],
  ["photos", "gallery"],
  ["vitrin", "gallery"],
  ["projeler", "gallery"],

  // Pricing
  ["pricing", "pricing"],
  ["fiyatlar", "pricing"],
  ["tarifeler", "pricing"],
  ["plans", "pricing"],
  ["paketler", "pricing"],

  // Blog
  ["blog", "blog"],
  ["makaleler", "blog"],
  ["haberler", "blog"],
  ["rehber", "blog"],
  ["news", "blog"],

  // Newsletter
  ["newsletter", "newsletter"],
  ["ebulten", "newsletter"],
  ["bulten", "newsletter"],
  ["subscribe", "newsletter"],

  // Social Feed
  ["socialfeed", "socialFeed"],
  ["social-feed", "socialFeed"],
  ["social", "socialFeed"],
  ["instagram", "socialFeed"],
  ["sosyal-medya", "socialFeed"],

  // Header / Navigation
  ["header", "header"],
  ["nav", "header"],
  ["navigation", "header"],
  ["topbar", "header"],

  // Footer
  ["footer", "footer"],
  ["alt-bilgi", "footer"],
  ["site-footer", "footer"],

  // Custom HTML
  ["customhtml", "customHtml"],
  ["custom-html", "customHtml"],
  ["html", "customHtml"],
  ["embed", "customHtml"],
]);

/**
 * Normalizes input string for identifier lookup
 */
function cleanIdentifier(raw: string): string {
  if (!raw || typeof raw !== "string") return "";
  return raw
    .trim()
    .toLowerCase()
    .replace(/^[#/]+/, "")
    .replace(/[_\s]+/g, "-");
}

/**
 * Normalizes any string or alias into a CanonicalSectionId.
 * Returns null if not recognized in canonical registry.
 */
export function normalizeSectionId(raw: string): CanonicalSectionId | null {
  if (!raw || typeof raw !== "string") return null;

  // Direct exact match
  if (SECTION_REGISTRY_MAP.has(raw)) {
    return raw as CanonicalSectionId;
  }

  const cleaned = cleanIdentifier(raw);

  // Check cleaned exact match (e.g. "HERO" -> "hero")
  if (SECTION_REGISTRY_MAP.has(cleaned)) {
    return cleaned as CanonicalSectionId;
  }

  // Check alias map
  const resolvedAlias = CANONICAL_ALIAS_MAP.get(cleaned);
  if (resolvedAlias) {
    return resolvedAlias;
  }

  // Also check camelCase aliases like "whyUs" -> "whyus", "socialFeed" -> "socialfeed"
  for (const [id] of SECTION_REGISTRY_MAP.entries()) {
    if (id.toLowerCase() === cleaned.toLowerCase().replace(/-/g, "")) {
      return id as CanonicalSectionId;
    }
  }

  return null;
}

/**
 * Type guard for CanonicalSectionId
 */
export function isCanonicalSectionId(id: string): id is CanonicalSectionId {
  return SECTION_REGISTRY_MAP.has(id);
}

/**
 * Retrieves full SectionDefinition by canonical ID or alias
 */
export function getSectionDefinition(idOrAlias: string): SectionDefinition | null {
  const canonicalId = normalizeSectionId(idOrAlias);
  if (!canonicalId) return null;
  return SECTION_REGISTRY_MAP.get(canonicalId) || null;
}

/**
 * Gets all canonical section definitions
 */
export function getAllSectionDefinitions(): readonly SectionDefinition[] {
  return CANONICAL_SECTION_DEFINITIONS;
}

/**
 * Gets all canonical section IDs
 */
export function getAllCanonicalSectionIds(): CanonicalSectionId[] {
  return CANONICAL_SECTION_DEFINITIONS.map((def) => def.id);
}

/**
 * Filters section definitions by semantic category
 */
export function getSectionsByCategory(category: SectionCategory): SectionDefinition[] {
  return CANONICAL_SECTION_DEFINITIONS.filter((def) => def.category === category);
}

/**
 * Filters section definitions by lifecycle status
 */
export function getSectionsByStatus(status: SectionStatus): SectionDefinition[] {
  return CANONICAL_SECTION_DEFINITIONS.filter((def) => def.status === status);
}

/**
 * Returns default enabled sections ordered by their natural page sequence
 */
export function getDefaultPageSections(): SectionDefinition[] {
  return CANONICAL_SECTION_DEFINITIONS.filter((def) => def.defaultEnabled);
}
